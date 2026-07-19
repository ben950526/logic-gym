"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PuzzleRecord, PuzzleStatus } from "@/types/puzzle";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/types/puzzle";
import { cn } from "@/lib/utils";

interface PuzzleAdminTableProps {
  puzzles: PuzzleRecord[];
  onSetStatus: (
    id: string,
    status: PuzzleStatus
  ) => Promise<{ error?: string; success?: boolean }>;
  onSetCompetitionPool: (
    id: string,
    inPool: boolean
  ) => Promise<{ error?: string; success?: boolean }>;
}

const STATUS_STYLES: Record<PuzzleStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function formatAnswer(puzzle: PuzzleRecord): string {
  if (puzzle.type === "multiple_choice") {
    const content = puzzle.content_json as { options: string[] };
    const answer = puzzle.answer_json as { correctIndex: number };
    const label = String.fromCharCode(65 + answer.correctIndex);
    const text = content.options[answer.correctIndex] ?? "（索引超出範圍）";
    return `${label}. ${text}`;
  }
  if (puzzle.type === "numeric_fill") {
    const content = puzzle.content_json as { unit?: string };
    const answer = puzzle.answer_json as { answer: number };
    const unit = content.unit && content.unit !== "無" ? ` ${content.unit}` : "";
    return `${answer.answer}${unit}`;
  }
  return "—";
}

function PuzzleDetailPanel({ puzzle }: { puzzle: PuzzleRecord }) {
  const content = puzzle.content_json as {
    question: string;
    options?: string[];
    hint?: string;
    unit?: string;
  };

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          完整題幹
        </p>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-zinc-900">
          {content.question}
        </p>
        {content.hint && (
          <p className="mt-2 text-zinc-600">
            <span className="font-medium">提示：</span>
            {content.hint}
          </p>
        )}
      </div>

      {puzzle.type === "multiple_choice" && content.options && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            選項
          </p>
          <ul className="mt-2 space-y-1.5">
            {content.options.map((option, index) => {
              const isCorrect =
                (puzzle.answer_json as { correctIndex: number }).correctIndex ===
                index;
              return (
                <li
                  key={index}
                  className={cn(
                    "rounded-md px-3 py-2",
                    isCorrect
                      ? "bg-green-100 font-medium text-green-900"
                      : "bg-white text-zinc-800"
                  )}
                >
                  {String.fromCharCode(65 + index)}. {option}
                  {isCorrect && (
                    <span className="ml-2 text-xs text-green-700">（正解）</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {puzzle.type === "numeric_fill" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            填空
          </p>
          <p className="mt-2 font-medium text-zinc-900">{formatAnswer(puzzle)}</p>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          正解
        </p>
        <p className="mt-2 font-medium text-green-800">{formatAnswer(puzzle)}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          解析
        </p>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-zinc-800">
          {puzzle.explanation}
        </p>
      </div>

      <p className="text-xs text-zinc-400">ID：{puzzle.id}</p>
    </div>
  );
}

export function PuzzleAdminTable({
  puzzles,
  onSetStatus,
  onSetCompetitionPool,
}: PuzzleAdminTableProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, PuzzleStatus>
  >({});
  const [poolOverrides, setPoolOverrides] = useState<Record<string, boolean>>(
    {}
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function getStatus(puzzle: PuzzleRecord): PuzzleStatus {
    return statusOverrides[puzzle.id] ?? puzzle.status;
  }

  function getInPool(puzzle: PuzzleRecord): boolean {
    return poolOverrides[puzzle.id] ?? !!puzzle.in_competition_pool;
  }

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2500);
  }

  function handleStatusChange(id: string, status: PuzzleStatus) {
    startTransition(async () => {
      const result = await onSetStatus(id, status);
      if (result.error) {
        alert(result.error);
        return;
      }
      setStatusOverrides((current) => ({ ...current, [id]: status }));
      showFeedback(`已更新為「${STATUS_LABELS[status]}」`);
      router.refresh();
    });
  }

  function handleCompetitionToggle(id: string, inPool: boolean) {
    startTransition(async () => {
      const result = await onSetCompetitionPool(id, inPool);
      if (result.error) {
        alert(result.error);
        return;
      }
      setPoolOverrides((current) => ({ ...current, [id]: inPool }));
      showFeedback(inPool ? "已加入積分賽池" : "已移出積分賽池");
      router.refresh();
    });
  }

  function toggleExpand(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  if (puzzles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
        尚無題目。請執行 <code className="rounded bg-zinc-100 px-1">npm run seed:puzzles</code>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      {feedback && (
        <p className="border-b border-green-100 bg-green-50 px-4 py-2 text-sm text-green-800">
          {feedback}
        </p>
      )}
      <p className="border-b border-zinc-100 px-4 py-2 text-xs text-zinc-500">
        點「查看完整」可展開題幹、選項、正解與解析
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">標題</th>
              <th className="px-4 py-3">類別</th>
              <th className="px-4 py-3">題型</th>
              <th className="px-4 py-3">難度</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">積分賽</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {puzzles.map((puzzle) => {
              const isExpanded = expandedId === puzzle.id;
              const status = getStatus(puzzle);
              const inPool = getInPool(puzzle);
              const question =
                "question" in puzzle.content_json
                  ? (puzzle.content_json as { question: string }).question
                  : "";

              return (
                <tr key={puzzle.id} className="border-b border-zinc-100 align-top">
                  <td className="px-4 py-4" colSpan={7}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{puzzle.title}</div>
                        {!isExpanded && (
                          <p className="mt-1 line-clamp-2 max-w-3xl text-xs text-zinc-500">
                            {question}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleExpand(puzzle.id)}
                          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          {isExpanded ? "收合 ▲" : "查看完整 ▼"}
                        </button>
                        {isExpanded && (
                          <div className="mt-3">
                            <PuzzleDetailPanel puzzle={puzzle} />
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap items-start gap-4 text-sm lg:gap-6">
                        <div>
                          <p className="text-xs text-zinc-400">類別</p>
                          <p>{CATEGORY_LABELS[puzzle.category]}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">題型</p>
                          <p>{TYPE_LABELS[puzzle.type]}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">難度</p>
                          <p>{DIFFICULTY_LABELS[puzzle.difficulty]}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">狀態</p>
                          <span
                            className={cn(
                              "inline-block rounded-full px-2.5 py-1 text-xs font-medium",
                              STATUS_STYLES[status]
                            )}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">積分賽</p>
                          <button
                            type="button"
                            disabled={isPending || status !== "verified"}
                            onClick={() =>
                              handleCompetitionToggle(puzzle.id, !inPool)
                            }
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              inPool
                                ? "bg-violet-100 text-violet-800"
                                : "bg-zinc-100 text-zinc-500"
                            )}
                          >
                            {inPool ? "已加入" : "未加入"}
                          </button>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-zinc-400">操作</p>
                          <div className="flex flex-wrap gap-2">
                            {(
                              ["pending", "verified", "rejected"] as PuzzleStatus[]
                            ).map((targetStatus) => (
                              <button
                                key={targetStatus}
                                type="button"
                                disabled={isPending || status === targetStatus}
                                onClick={() =>
                                  handleStatusChange(puzzle.id, targetStatus)
                                }
                                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-40"
                              >
                                {STATUS_LABELS[targetStatus]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
