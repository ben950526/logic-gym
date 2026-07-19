"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  goToNextCompetitionPuzzle,
  submitCompetitionAnswer,
  submitCompetitionTimeout,
} from "@/app/competition/actions";
import { goToNextPuzzle, submitAnswer } from "@/app/practice/actions";
import { competitionTimeLimitSeconds } from "@/lib/competition";
import type { UserAnswer } from "@/lib/practice";
import type { PuzzleRecord } from "@/types/puzzle";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  TYPE_LABELS,
} from "@/types/puzzle";
import { cn } from "@/lib/utils";

interface PuzzlePlayerProps {
  puzzle: PuzzleRecord;
  dailyUsed: number;
  dailyLimit: number;
  mode?: "practice" | "competition";
}

type PracticeResult = {
  kind: "practice";
  isCorrect: boolean;
  explanation: string;
  dailyUsed: number;
  expGained: number;
  leveledUp: boolean;
  level: number;
  titleUnlocked: boolean;
  titleName: string | null;
  titleProgress: { correctCount: number; required: number } | null;
};

type CompetitionResult = {
  kind: "competition";
  isCorrect: boolean;
  explanation: string;
  dailyUsed: number;
  pointsGained: number;
  weekPoints: number;
  timedOut: boolean;
};

type PlayerResult = PracticeResult | CompetitionResult;

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PuzzlePlayer({
  puzzle,
  dailyUsed,
  dailyLimit,
  mode = "practice",
}: PuzzlePlayerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [numericValue, setNumericValue] = useState("");
  const [result, setResult] = useState<PlayerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGoingNext, startNextTransition] = useTransition();
  const submittedRef = useRef(false);

  const isCompetition = mode === "competition";
  const timeLimit = useMemo(
    () =>
      isCompetition ? competitionTimeLimitSeconds(puzzle.difficulty) : null,
    [isCompetition, puzzle.difficulty]
  );
  const [secondsLeft, setSecondsLeft] = useState(timeLimit ?? 0);

  useEffect(() => {
    submittedRef.current = false;
    if (timeLimit != null) {
      setSecondsLeft(timeLimit);
    }
  }, [puzzle.id, timeLimit]);

  useEffect(() => {
    if (!isCompetition || result || timeLimit == null) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isCompetition, puzzle.id, result, timeLimit]);

  function applyCompetitionResponse(
    response: Awaited<ReturnType<typeof submitCompetitionAnswer>>,
    timedOut: boolean
  ) {
    if (response.error) {
      setError(response.error);
      submittedRef.current = false;
      return;
    }
    if (response.success) {
      setResult({
        kind: "competition",
        isCorrect: response.isCorrect ?? false,
        explanation: response.explanation ?? "",
        dailyUsed: response.daily?.used ?? dailyUsed + 1,
        pointsGained: response.competition?.pointsGained ?? 0,
        weekPoints: response.competition?.weekPoints ?? 0,
        timedOut,
      });
    }
  }

  function handleTimeout() {
    if (submittedRef.current || result || isPending) return;
    submittedRef.current = true;
    setError(null);

    startTransition(async () => {
      const response = await submitCompetitionTimeout(puzzle.id);
      applyCompetitionResponse(response, true);
    });
  }

  useEffect(() => {
    if (
      isCompetition &&
      secondsLeft === 0 &&
      !result &&
      !submittedRef.current &&
      timeLimit != null
    ) {
      handleTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isCompetition, result, timeLimit]);

  function buildAnswer(): UserAnswer | null {
    if (puzzle.type === "multiple_choice") {
      if (selectedIndex === null) return null;
      return { type: "multiple_choice", selectedIndex };
    }
    if (puzzle.type === "numeric_fill") {
      const value = Number(numericValue);
      if (Number.isNaN(value)) return null;
      return { type: "numeric_fill", value };
    }
    return null;
  }

  function handleSubmit() {
    setError(null);
    const answer = buildAnswer();
    if (!answer) {
      setError("請先完成作答");
      return;
    }

    if (isCompetition) {
      if (submittedRef.current) return;
      submittedRef.current = true;
    }

    startTransition(async () => {
      if (mode === "competition") {
        const response = await submitCompetitionAnswer(puzzle.id, answer);
        applyCompetitionResponse(response, false);
        return;
      }

      const response = await submitAnswer(puzzle.id, answer);
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.success) {
        setResult({
          kind: "practice",
          isCorrect: response.isCorrect ?? false,
          explanation: response.explanation ?? "",
          dailyUsed: response.daily?.used ?? dailyUsed + 1,
          expGained: response.exp?.gained ?? 0,
          leveledUp: response.exp?.leveledUp ?? false,
          level: response.exp?.level ?? 1,
          titleUnlocked: response.title?.unlocked ?? false,
          titleName: response.title?.name ?? null,
          titleProgress: response.title?.progress ?? null,
        });
      }
    });
  }

  function handleNextPuzzle() {
    startNextTransition(async () => {
      if (mode === "competition") {
        await goToNextCompetitionPuzzle();
      } else {
        await goToNextPuzzle();
      }
    });
  }

  const accentBtn = isCompetition
    ? "bg-violet-600 hover:bg-violet-700"
    : "bg-blue-600 hover:bg-blue-700";
  const inputsLocked = !!result || isPending || (isCompetition && secondsLeft === 0);

  const content = puzzle.content_json as {
    question: string;
    options?: string[];
    unit?: string;
    hint?: string;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-800">
          {CATEGORY_LABELS[puzzle.category]}
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
          {TYPE_LABELS[puzzle.type]}
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
          {DIFFICULTY_LABELS[puzzle.difficulty]}
        </span>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {isCompetition && !result && timeLimit != null && (
          <div
            className={cn(
              "mb-4 flex items-center justify-between rounded-lg px-4 py-3",
              secondsLeft <= 10
                ? "bg-red-50 text-red-900"
                : "bg-violet-50 text-violet-900"
            )}
          >
            <span className="text-sm font-medium">剩餘時間</span>
            <span
              className={cn(
                "font-mono text-2xl font-bold tabular-nums",
                secondsLeft <= 10 && "animate-pulse"
              )}
            >
              {formatCountdown(secondsLeft)}
            </span>
          </div>
        )}

        <h2 className="text-xl font-bold">{puzzle.title}</h2>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-zinc-800">
          {content.question}
        </p>
        {content.hint && (
          <p className="mt-3 text-sm text-zinc-500">提示：{content.hint}</p>
        )}

        <div className="mt-6 space-y-3">
          {puzzle.type === "multiple_choice" &&
            content.options?.map((option, index) => (
              <button
                key={index}
                type="button"
                disabled={inputsLocked}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left text-sm transition",
                  selectedIndex === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}

          {puzzle.type === "numeric_fill" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={numericValue}
                disabled={inputsLocked}
                onChange={(event) => setNumericValue(event.target.value)}
                className="w-full max-w-xs rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="輸入數字"
              />
              {content.unit && content.unit !== "無" && (
                <span className="text-sm text-zinc-500">{content.unit}</span>
              )}
            </div>
          )}

        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!result && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || (isCompetition && secondsLeft === 0)}
            className={cn(
              "mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60",
              accentBtn
            )}
          >
            {isPending ? "送出中…" : "送出答案"}
          </button>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div
              className={cn(
                "rounded-lg px-4 py-3 text-sm font-medium",
                result.kind === "competition" && result.timedOut
                  ? "bg-red-50 text-red-800"
                  : result.isCorrect
                    ? "bg-green-50 text-green-800"
                    : "bg-amber-50 text-amber-800"
              )}
            >
              {result.kind === "competition" && result.timedOut
                ? "時間到！"
                : result.isCorrect
                  ? "答對了！"
                  : "這次沒對，看看解析再試試"}
            </div>
            {result.kind === "competition" ? (
              <div className="rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
                {result.pointsGained > 0 ? (
                  <>+{result.pointsGained} 分 · 本週累計 {result.weekPoints} 分</>
                ) : (
                  <>本週累計 {result.weekPoints} 分</>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  +{result.expGained} EXP
                  {result.leveledUp && (
                    <span className="ml-2 font-semibold">
                      升級了！現在 Lv.{result.level}
                    </span>
                  )}
                </div>
                {result.titleUnlocked && result.titleName && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="font-semibold">封號解鎖！</p>
                    <p className="mt-1">你獲得了「{result.titleName}」</p>
                  </div>
                )}
                {result.isCorrect &&
                  !result.titleUnlocked &&
                  result.titleProgress &&
                  result.titleProgress.correctCount <
                    result.titleProgress.required && (
                    <p className="text-center text-xs text-zinc-500">
                      此類別答對 {result.titleProgress.correctCount} /{" "}
                      {result.titleProgress.required} 題（解鎖封號）
                    </p>
                  )}
              </>
            )}
            <div className="rounded-lg bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-700">
              <p className="font-medium text-zinc-900">解題思路</p>
              <p className="mt-2 whitespace-pre-wrap">{result.explanation}</p>
            </div>
            <p className="text-center text-sm text-zinc-500">
              今日已完成 {result.dailyUsed} / {dailyLimit} 題
            </p>
            {result.dailyUsed >= dailyLimit ? (
              <div className="space-y-3">
                <p className="text-center text-sm text-zinc-600">
                  {isCompetition
                    ? "今日積分賽已用完，明天再來衝榜！"
                    : "今日題數已用完，明天再來練功吧！"}
                </p>
                <Link
                  href={isCompetition ? "/competition" : "/"}
                  className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium hover:bg-zinc-50"
                >
                  {isCompetition ? "留在積分賽" : "回首頁"}
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleNextPuzzle}
                disabled={isGoingNext}
                className={cn(
                  "block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white disabled:opacity-60",
                  accentBtn
                )}
              >
                {isGoingNext ? "載入下一題…" : "下一題"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
