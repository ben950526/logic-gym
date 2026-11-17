import type { ReactNode } from "react";

/** 橫向閱讀方向（文字箭頭 →，與題目 emoji ⬆️⬇️ 長相不同） */
const HORIZONTAL_FLOW = "→";
/** 縱向換行、比較用 */
const VISUAL_FLOW_MARKS = new Set(["⬇️", "↔️"]);
const VISUAL_SPLIT = /(→|⬇️|↔️)/;

/** 題目圖：圖案大、方向箭頭小且樣式不同，避免上下跳看成「上右下右」 */
export function renderKindergartenVisualLine(line: string): ReactNode {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (trimmed === "⬇️" || trimmed === "↔️") {
    return (
      <span className="stage-puzzle-visual-flow" aria-hidden="true">
        {trimmed}
      </span>
    );
  }

  const parts = trimmed.split(VISUAL_SPLIT).filter(Boolean);
  return parts.map((part, index) => {
    if (part === HORIZONTAL_FLOW) {
      return (
        <span key={index} className="stage-puzzle-visual-flow-h" aria-hidden="true">
          →
        </span>
      );
    }
    if (VISUAL_FLOW_MARKS.has(part)) {
      return (
        <span key={index} className="stage-puzzle-visual-flow" aria-hidden="true">
          {part}
        </span>
      );
    }
    return <span key={index}>{part.trim()}</span>;
  });
}
