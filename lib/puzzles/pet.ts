/** 寵物「腦腦」：成長階段 + 程式畫的 SVG（不需要美術圖） */
import { itemById, type Look } from "./wardrobe";

export interface PetStage {
  at: number; // 需要幾顆星
  name: string;
  label: string;
}

export const PET_STAGES: PetStage[] = [
  { at: 0, name: "神秘的蛋", label: "蛋" },
  { at: 3, name: "腦腦寶寶", label: "第 1 階段" },
  { at: 10, name: "腦腦", label: "第 2 階段 · 長出天線" },
  { at: 25, name: "探險家腦腦", label: "第 3 階段 · 戴上帽子" },
  { at: 50, name: "國王腦腦", label: "最終階段 · 戴上皇冠" },
];

export type PetMood = "idle" | "happy" | "oops";

export function stageOf(stars: number): number {
  return PET_STAGES.reduce((k, st, i) => (stars >= st.at ? i : k), 0);
}

export const PET_INTRO = "你撿到一顆會發光的蛋。每解開一題，牠就吃到一顆動腦星。蛋裡面是誰呢？";
export const CHEERS = ["好厲害！", "動腦星好好吃！", "再來一題！", "你越來越強了！", "哇，一下就解開了！"];
export const OOPS_LINES = ["咦？換條路試試看～", "沒關係，再想想！", "差一點點！"];

/** 回傳 SVG 內容（viewBox 0 0 120 120） */
export function petSvg(stage: number, stars: number, mood: PetMood, look: Look = {}): string {
  const ink = "#23305a";
  const color = itemById(look.color);
  const hat = itemById(look.hat);
  const face = itemById(look.face);
  const body = color?.body ?? "#5fd3a8";
  const brain = color?.brain ?? "#2e9e77";
  if (stage === 0) {
    const cracks = Math.min(stars, 2);
    return `<g class="lgp-egg">
      <ellipse cx="60" cy="68" rx="34" ry="42" fill="#fff6dc" stroke="${ink}" stroke-width="3"/>
      <circle cx="46" cy="52" r="6" fill="#7c5cff" opacity=".7"/><circle cx="72" cy="80" r="8" fill="#5fd3a8" opacity=".8"/><circle cx="70" cy="46" r="4" fill="#ffc93c"/>
      ${cracks >= 1 ? `<path d="M40 64 l8 6 l6 -7 l7 7" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>` : ""}
      ${cracks >= 2 ? `<path d="M61 70 l8 -6 l7 8 l8 -5" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>` : ""}
    </g>`;
  }
  const scale = stage >= 2 ? 1 : 0.82;
  const mouth =
    mood === "happy"
      ? `<path d="M50 78 q10 12 20 0 z" fill="${ink}"/>`
      : mood === "oops"
        ? `<ellipse cx="60" cy="80" rx="5" ry="6" fill="${ink}"/>`
        : `<path d="M51 78 q9 7 18 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
  return `<g class="lgp-pet-body"><g transform="translate(60 100) scale(${scale}) translate(-60 -100)">
    ${stage >= 4 ? `<path d="M30 70 q-14 30 6 38 h48 q20 -8 6 -38 z" fill="#ff5d73" stroke="${ink}" stroke-width="3"/>` : ""}
    ${stage >= 2 && !hat ? `<path d="M60 30 q-4 -12 4 -18" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="M64 4 l3 6 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1 z" fill="#ffc93c" stroke="${ink}" stroke-width="2"/>` : ""}
    <path d="M22 78 q0 -46 38 -48 q38 2 38 48 q0 28 -38 28 q-38 0 -38 -28 z" fill="${body}" stroke="${ink}" stroke-width="3"/>
    <path d="M40 46 q8 -6 14 2 M66 44 q8 -6 14 4 M48 36 q6 -4 12 0" fill="none" stroke="${brain}" stroke-width="3" stroke-linecap="round"/>
    <g class="lgp-eyes"><ellipse cx="47" cy="62" rx="7" ry="8.5" fill="#fff" stroke="${ink}" stroke-width="2.5"/><ellipse cx="73" cy="62" rx="7" ry="8.5" fill="#fff" stroke="${ink}" stroke-width="2.5"/>
      <circle cx="48" cy="64" r="3.6" fill="${ink}"/><circle cx="74" cy="64" r="3.6" fill="${ink}"/></g>
    <ellipse cx="36" cy="76" rx="6" ry="3.5" fill="#ff8fb1" opacity=".8"/><ellipse cx="84" cy="76" rx="6" ry="3.5" fill="#ff8fb1" opacity=".8"/>
    ${mouth}
    ${face?.svg ?? ""}
    ${hat?.svg ?? ""}
    ${!hat && stage === 3 ? `<path d="M42 34 l18 -26 l18 26 z" fill="#4d9fff" stroke="${ink}" stroke-width="3"/><circle cx="60" cy="8" r="5" fill="#ffc93c" stroke="${ink}" stroke-width="2"/>` : ""}
    ${!hat && stage >= 4 ? `<path d="M38 36 l6 -18 l10 12 l6 -16 l6 16 l10 -12 l6 18 z" fill="#ffc93c" stroke="${ink}" stroke-width="3"/>` : ""}
  </g></g>`;
}
