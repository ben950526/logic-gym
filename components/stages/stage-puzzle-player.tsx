"use client";

import Link from "next/link";
import { useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { StageClearCelebration } from "@/components/stages/stage-clear-celebration";
import { submitStageAnswer } from "@/app/stage/actions";
import type { UserAnswer } from "@/lib/practice";
import type { PuzzleRecord } from "@/types/puzzle";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  TYPE_LABELS,
} from "@/types/puzzle";
import { SHELL_ART_LAYOUT, SHELL_ASSETS } from "@/lib/world/shell-assets";
import { cn } from "@/lib/utils";

interface StagePuzzlePlayerProps {
  puzzle: PuzzleRecord;
  stageId: string;
  stageName: string;
  planetSlug: string;
  isBoss?: boolean;
  alreadyCleared: boolean;
  nextStageId: string | null;
  clearLine?: string | null;
  companionName?: string;
  zoneClearLine?: string | null;
  theme?: "default" | "adventure";
}

type StageResult = {
  isCorrect: boolean;
  explanation: string;
  cleared: boolean;
  nextStageId: string | null;
  planetCleared?: boolean;
};

export function StagePuzzlePlayer({
  puzzle,
  stageId,
  stageName,
  planetSlug,
  isBoss,
  alreadyCleared,
  nextStageId,
  clearLine,
  companionName,
  zoneClearLine,
  theme = "default",
}: StagePuzzlePlayerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [numericValue, setNumericValue] = useState("");
  const [result, setResult] = useState<StageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const content = puzzle.content_json as {
    question: string;
    options?: string[];
    unit?: string;
    hint?: string;
  };

  function buildAnswer(): UserAnswer | null {
    if (puzzle.type === "multiple_choice") {
      if (selectedIndex == null) return null;
      return { type: "multiple_choice", selectedIndex };
    }
    if (numericValue.trim() === "") return null;
    return { type: "numeric_fill", value: Number(numericValue) };
  }

  function handleSubmit() {
    const answer = buildAnswer();
    if (!answer) {
      setError("請先選答案或輸入數字");
      return;
    }

    setError(null);
    startTransition(async () => {
      const response = await submitStageAnswer(stageId, puzzle.id, answer);
      if ("error" in response && response.error) {
        setError(response.error);
        return;
      }
      if ("success" in response && response.success) {
        setResult({
          isCorrect: response.isCorrect ?? false,
          explanation: response.explanation ?? "",
          cleared: response.cleared ?? false,
          nextStageId: response.nextStageId ?? null,
          planetCleared: response.planetCleared,
        });
      }
    });
  }

  const inputsLocked = !!result || isPending;
  const isAdventure = theme === "adventure";

  const puzzleBody: ReactNode = (
    <>
      <h2 className="stage-puzzle-title">{puzzle.title}</h2>
      <p className="stage-puzzle-question">{content.question}</p>
      {content.hint && (
        <p className="stage-puzzle-hint">提示：{content.hint}</p>
      )}

      <div className="stage-puzzle-options">
        {puzzle.type === "multiple_choice" &&
          content.options?.map((option, index) => (
            <button
              key={index}
              type="button"
              disabled={inputsLocked}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "stage-option-btn",
                selectedIndex === index && "stage-option-btn-selected"
              )}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}

        {puzzle.type === "numeric_fill" && (
          <div className="stage-numeric-row">
            <input
              type="number"
              value={numericValue}
              disabled={inputsLocked}
              onChange={(e) => setNumericValue(e.target.value)}
              className="stage-numeric-input"
              placeholder="輸入數字"
            />
            {content.unit && content.unit !== "無" && (
              <span className="stage-numeric-unit">{content.unit}</span>
            )}
          </div>
        )}
      </div>

      {error && <p className="stage-puzzle-error">{error}</p>}

      {!result && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="stage-submit-btn game-btn game-btn-gold"
        >
          {isPending ? "送出中…" : "送出答案"}
        </button>
      )}

      {result && (
        <div className="stage-result-block">
          {result.cleared ? (
            <StageClearCelebration
              stageName={stageName}
              isBoss={isBoss}
              planetCleared={result.planetCleared}
              clearLine={clearLine}
              companionName={companionName}
              zoneClearLine={zoneClearLine}
            />
          ) : (
            <div
              className={cn(
                "stage-puzzle-notice",
                result.isCorrect
                  ? "stage-puzzle-notice-ok"
                  : "stage-puzzle-notice-retry"
              )}
            >
              {result.isCorrect ? "答對了！" : "差一點！看看提示再衝一次"}
            </div>
          )}

          <div className="stage-explanation-box">
            <p className="stage-explanation-label">解題思路</p>
            <p className="stage-explanation-text">{result.explanation}</p>
          </div>

          <div className="stage-result-actions">
            {result.cleared && result.nextStageId && (
              <Link
                href={`/stage/${result.nextStageId}`}
                className="stage-action-btn stage-action-primary"
              >
                ▶ 下一關
              </Link>
            )}
            {result.cleared && result.planetCleared && (
              <Link href="/galaxy" className="stage-action-btn stage-action-galaxy">
                星球通關！回邏輯星系
              </Link>
            )}
            {!result.isCorrect && (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setSelectedIndex(null);
                  setNumericValue("");
                }}
                className="stage-action-btn stage-action-secondary"
              >
                再試一次
              </button>
            )}
            <Link
              href={`/planet/${planetSlug}`}
              className="stage-action-btn stage-action-secondary"
            >
              回星球地圖
            </Link>
          </div>
        </div>
      )}
    </>
  );

  const artStyle = isAdventure
    ? ({
        ["--shell-inset" as string]: SHELL_ART_LAYOUT.panelPuzzle.inset,
      } as CSSProperties)
    : undefined;

  return (
    <div className={cn("stage-puzzle-player", isAdventure && "stage-puzzle-player--adventure")}>
      {alreadyCleared && !result && (
        <p className="stage-puzzle-notice stage-puzzle-notice-cleared">
          你已通過此關，可以再練一次或前往下一關。
        </p>
      )}

      <div className="stage-puzzle-tags">
        <span className="stage-puzzle-tag stage-puzzle-tag-category">
          {CATEGORY_LABELS[puzzle.category]}
        </span>
        <span className="stage-puzzle-tag">{TYPE_LABELS[puzzle.type]}</span>
        <span className="stage-puzzle-tag">{DIFFICULTY_LABELS[puzzle.difficulty]}</span>
      </div>

      <div
        className={cn("stage-puzzle-card", isAdventure && "stage-puzzle-card--art")}
        style={artStyle}
      >
        {isAdventure && (
          <img
            src={SHELL_ASSETS.panelPuzzle}
            alt=""
            className="stage-puzzle-card-bg"
            draggable={false}
          />
        )}
        {isAdventure ? (
          <div className="stage-puzzle-art-body">{puzzleBody}</div>
        ) : (
          puzzleBody
        )}
      </div>

      {alreadyCleared && nextStageId && !result && (
        <Link href={`/stage/${nextStageId}`} className="stage-next-link">
          前往下一關 →
        </Link>
      )}
    </div>
  );
}
