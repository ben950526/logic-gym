/**
 * 幼兒視覺題 · 出題審核標準（高標）
 *
 * 每題上架前必須通過 verify:kindergarten-quality
 */

export const K_PUZZLE_QUALITY_RULES = {
  uniqueAnswer: "唯一解：套用規律後僅一個選項正確",
  clearExpression:
    "清楚表達：題意與選項用短中文＋圖示，家長陪玩時一眼懂（不要求幼兒自行識字）",
  visualLayerSeparation:
    "圖文分層：visualPrompt 序列區只用圖示＋→／⬇️；題意只用一句 question",
  playerUiMinimal:
    "作答 UI：只顯示 visual + 一句 question；parentReadAloud／hint 不出現在畫面上",
  clearDirection: "方向明確：橫向用 → 閱讀方向；題目 ⬆️⬇️ 與 → 須長相不同",
  distinctSkill: "題型互斥：每關一種思考方式",
  fairDistractors: "干擾項：合理但可排除，無雙重規則歧義",
  optionParity: "選項同質：四個選項格式一致（例如都「文字＋emoji」或都短句）",
  noVagueSymbols:
    "禁止模糊選項：不可只用 👈👉⚖️🤷 等符號當選項，須寫清楚意思",
  bossFair: "BOSS：延伸已學技能，中間缺格需前後夾擊唯一解",
  memoryLimit: "記憶負荷：主序列不超過 7 段",
  parentSupport:
    "出題自審：parentReadAloud 與 hint 寫在 JSON 供 Phase 5，不出現在作答 UI",
} as const;

/** 單獨符號、幼兒看不懂的選項 */
export const VAGUE_OPTION_PATTERN = /^[👈👉⚖️🤷🌟✨❓\s]+$/;

export type KPuzzleQualityRuleId = keyof typeof K_PUZZLE_QUALITY_RULES;

export function isVagueOption(option: string): boolean {
  const t = option.trim();
  if (!t) return true;
  if (VAGUE_OPTION_PATTERN.test(t)) return true;
  if (t === "👈" || t === "👉" || t === "⚖️" || t === "🤷") return true;
  return false;
}

/** visual 序列區不應嵌入「第 N 個」等序數標籤（應在 question / 家長念稿說明） */
export const VISUAL_ORDINAL_LABEL_PATTERN = /第\s*[0-9０-９一二三四五六七八九十]+\s*個/;

export function hasOrdinalLabelsInVisual(visual: string): boolean {
  return VISUAL_ORDINAL_LABEL_PATTERN.test(visual);
}

/** 橫向／縱向接龍序列（非分組①②、非左邊右邊比較） */
export function isArrowSequenceVisual(visual: string): boolean {
  const v = visual.trim();
  if (/左邊|右邊/.test(v)) return false;
  if (/^[①②③④⑤⑥⑦⑧⑨⑩]/m.test(v)) return false;
  return /→|⬇️/.test(v);
}
