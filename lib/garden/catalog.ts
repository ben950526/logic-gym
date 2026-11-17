/**
 * 花園圖鑑資料：植物、訪客，以及它們的圖（全部用程式畫的 SVG，viewBox 0 0 100 100）。
 * 地面線在 y = 90。
 */

const INK = "#23305a";
const LEAF = "#3fbf7f";
const LEAF_DARK = "#2a9a62";
const STEM = "#2f9e5e";
const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const S2 = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;

export type PlantId = "tulip" | "carrot" | "strawberry" | "sunflower" | "watermelon" | "apple";
export type VisitorId = "butterfly" | "rabbit" | "hedgehog" | "bird" | "turtle" | "squirrel" | "fox" | "bear";

export interface Plant {
  id: PlantId;
  name: string;
  fruitName: string;
  hours: number; // 長大需要幾小時
  rare: boolean;
  perennial: boolean; // 收成後會自己再長（不用重種）
  visitor: VisitorId;
  bud: string; // 花苞顏色
}

export const PLANTS: Plant[] = [
  { id: "tulip", name: "鬱金香", fruitName: "鬱金香花束", hours: 1, rare: false, perennial: false, visitor: "butterfly", bud: "#ff5d73" },
  { id: "carrot", name: "紅蘿蔔", fruitName: "紅蘿蔔", hours: 3, rare: false, perennial: false, visitor: "rabbit", bud: "#ff9f43" },
  { id: "strawberry", name: "草莓", fruitName: "草莓", hours: 4, rare: false, perennial: false, visitor: "hedgehog", bud: "#ff5d73" },
  { id: "sunflower", name: "向日葵", fruitName: "葵花籽", hours: 6, rare: false, perennial: false, visitor: "bird", bud: "#ffc93c" },
  { id: "watermelon", name: "西瓜", fruitName: "西瓜", hours: 10, rare: true, perennial: false, visitor: "turtle", bud: "#ffd84d" },
  { id: "apple", name: "蘋果樹", fruitName: "蘋果", hours: 12, rare: true, perennial: true, visitor: "squirrel", bud: "#ff8fb1" },
];

export const COMMON_PLANTS = PLANTS.filter((p) => !p.rare).map((p) => p.id);
export const RARE_PLANTS = PLANTS.filter((p) => p.rare).map((p) => p.id);
export const plantById = (id: PlantId) => PLANTS.find((p) => p.id === id)!;

export interface Visitor {
  id: VisitorId;
  name: string;
  hint: string; // 還沒遇到時顯示的謎語
  met: string; // 遇到時的介紹
}

export const VISITORS: Visitor[] = [
  { id: "butterfly", name: "蝴蝶", hint: "喜歡顏色鮮豔、有香味的花。", met: "被鬱金香吸引過來的！" },
  { id: "rabbit", name: "兔子", hint: "喜歡長在土裡、橘色的蔬菜。", met: "最愛紅蘿蔔！" },
  { id: "hedgehog", name: "刺蝟", hint: "喜歡紅紅的、表面有小點點的水果。", met: "聞到草莓的香味就來了。" },
  { id: "bird", name: "小鳥", hint: "喜歡長得很高、會跟著太陽轉的花。", met: "想吃向日葵的種子！" },
  { id: "turtle", name: "烏龜", hint: "喜歡又大又圓、裡面紅紅的水果。", met: "慢慢爬來吃西瓜。" },
  { id: "squirrel", name: "松鼠", hint: "喜歡長在樹上的水果。", met: "在蘋果樹上跳來跳去！" },
  { id: "fox", name: "狐狸", hint: "喜歡熱熱鬧鬧的花園：要有 3 種不同的植物同時成熟。", met: "被熱鬧的花園吸引來了！" },
  { id: "bear", name: "小熊", hint: "肚子好餓，想吃又大又甜的點心。試試看點心盤？", met: "點心盤上的西瓜好好吃！" },
];

export const visitorById = (id: VisitorId) => VISITORS.find((v) => v.id === id)!;

/* ───────────── 植物的圖 ───────────── */

function sprout(): string {
  return `<path d="M50 90 v-12" ${S} fill="none"/><path d="M50 80 q-12 -2 -14 -12 q12 0 14 12 z" fill="${LEAF}" ${S2}/><path d="M50 80 q12 -2 14 -12 q-12 0 -14 12 z" fill="${LEAF}" ${S2}/>`;
}

function young(): string {
  return `<path d="M50 90 v-30" ${S} fill="none"/>
    <path d="M50 76 q-18 -2 -22 -16 q18 0 22 16 z" fill="${LEAF}" ${S2}/>
    <path d="M50 66 q16 -2 20 -16 q-16 0 -20 16 z" fill="${LEAF}" ${S2}/>`;
}

function bud(color: string): string {
  return `<path d="M50 90 v-38" ${S} fill="none"/>
    <path d="M50 80 q-18 -2 -22 -16 q18 0 22 16 z" fill="${LEAF}" ${S2}/>
    <path d="M50 70 q16 -2 20 -16 q-16 0 -20 16 z" fill="${LEAF}" ${S2}/>
    <path d="M50 54 q-9 -6 -6 -16 q6 -6 6 -6 q0 0 6 6 q3 10 -6 16 z" fill="${color}" ${S2}/>`;
}

const READY: Record<PlantId, string> = {
  tulip: `<path d="M50 90 v-40" ${S} fill="none"/>
    <path d="M50 84 q-22 -6 -22 -26 q16 8 22 26 z" fill="${LEAF}" ${S2}/>
    <path d="M50 78 q20 -6 20 -24 q-14 8 -20 24 z" fill="${LEAF}" ${S2}/>
    <path d="M34 26 q2 22 16 26 q14 -4 16 -26 l-8 8 l-8 -12 l-8 12 z" fill="#ff5d73" ${S}/>
    <path d="M42 30 q4 14 8 20" stroke="#ff8fa0" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  carrot: `<path d="M50 72 q-18 -14 -14 -36 q10 10 14 36 z" fill="${LEAF}" ${S2}/>
    <path d="M50 72 q2 -26 16 -34 q2 20 -16 34 z" fill="${LEAF_DARK}" ${S2}/>
    <path d="M50 72 q-4 -24 4 -40 q8 18 -4 40 z" fill="${LEAF}" ${S2}/>
    <path d="M38 74 q12 -6 24 0 q-2 16 -12 24 q-10 -8 -12 -24 z" fill="#ff9f43" ${S}/>
    <path d="M42 82 h6 M46 88 h5" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
  strawberry: `<path d="M22 88 q4 -24 28 -30 q24 6 28 30 z" fill="${LEAF}" ${S2}/>
    <path d="M30 70 q6 -10 14 -6 M70 70 q-6 -10 -14 -6" stroke="${LEAF_DARK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g transform="translate(36 60)"><path d="M0 0 q-10 0 -10 10 q2 12 10 18 q8 -6 10 -18 q0 -10 -10 -10 z" fill="#ff5d73" ${S2}/><path d="M-6 -2 l6 4 l6 -4" fill="${LEAF}" ${S2}/><circle cx="-4" cy="10" r="1.2" fill="#fff6dc"/><circle cx="3" cy="14" r="1.2" fill="#fff6dc"/><circle cx="-1" cy="20" r="1.2" fill="#fff6dc"/></g>
    <g transform="translate(64 64)"><path d="M0 0 q-9 0 -9 9 q2 10 9 16 q7 -6 9 -16 q0 -9 -9 -9 z" fill="#ff5d73" ${S2}/><path d="M-5 -2 l5 4 l5 -4" fill="${LEAF}" ${S2}/><circle cx="-3" cy="9" r="1.2" fill="#fff6dc"/><circle cx="3" cy="13" r="1.2" fill="#fff6dc"/></g>
    <circle cx="52" cy="54" r="5" fill="#fff" ${S2}/><circle cx="52" cy="54" r="1.8" fill="#ffc93c"/>`,
  sunflower: `<path d="M50 90 v-48" ${S} fill="none"/>
    <path d="M50 80 q-20 -4 -22 -20 q18 2 22 20 z" fill="${LEAF}" ${S2}/>
    <path d="M50 68 q18 -4 20 -18 q-16 2 -20 18 z" fill="${LEAF}" ${S2}/>
    <g transform="translate(50 28)">
      ${Array.from({ length: 12 }, (_, i) => `<ellipse cx="0" cy="-15" rx="5.5" ry="10" fill="#ffc93c" ${S2} transform="rotate(${i * 30})"/>`).join("")}
      <circle r="11" fill="#9a5b2e" ${S}/><circle cx="-4" cy="-3" r="1.4" fill="#5c3418"/><circle cx="3" cy="-4" r="1.4" fill="#5c3418"/><circle cx="0" cy="3" r="1.4" fill="#5c3418"/><circle cx="5" cy="3" r="1.4" fill="#5c3418"/><circle cx="-5" cy="4" r="1.4" fill="#5c3418"/>
    </g>`,
  watermelon: `<path d="M10 70 q14 -12 26 -2 M64 66 q14 -10 28 2" stroke="${STEM}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M14 66 q-6 -12 6 -14 q8 8 -6 14 z" fill="${LEAF}" ${S2}/><path d="M86 64 q8 -12 -4 -16 q-8 8 4 16 z" fill="${LEAF}" ${S2}/>
    <ellipse cx="50" cy="74" rx="30" ry="18" fill="#2fbf7a" ${S}/>
    <path d="M30 64 q-6 10 0 22 M42 58 q-6 16 0 32 M56 57 q6 16 0 33 M68 62 q6 12 0 24" stroke="#1f7a4c" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="38" cy="66" rx="6" ry="3" fill="#fff" opacity=".35"/>`,
  apple: `<rect x="44" y="56" width="12" height="34" rx="4" fill="#a5794a" ${S}/>
    <path d="M44 70 q-8 -4 -10 -12 M56 66 q8 -4 10 -12" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M16 42 q0 -30 34 -32 q34 2 34 32 q0 22 -34 22 q-34 0 -34 -22 z" fill="${LEAF}" ${S}/>
    <path d="M28 30 q8 -10 18 -8 M60 22 q10 0 14 8" stroke="${LEAF_DARK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${[[30, 44], [50, 32], [68, 46], [44, 52], [62, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#ff5d73" ${S2}/><path d="M${x} ${y - 6} v-3" stroke="${INK}" stroke-width="2"/><circle cx="${x - 2}" cy="${y - 2}" r="1.6" fill="#fff" opacity=".7"/>`).join("")}`,
};

/** 蘋果樹還沒結果時的樣子（小樹） */
const APPLE_YOUNG = `<rect x="46" y="62" width="8" height="28" rx="3" fill="#a5794a" ${S2}/>
  <path d="M26 52 q0 -22 24 -24 q24 2 24 24 q0 14 -24 14 q-24 0 -24 -14 z" fill="${LEAF}" ${S}/>`;

/** stage：0 發芽、1 小苗、2 花苞、3 成熟 */
export function plantSvg(id: PlantId, stage: number): string {
  if (stage >= 3) return READY[id];
  if (id === "apple") {
    if (stage === 0) return sprout();
    if (stage === 1) return APPLE_YOUNG;
    return APPLE_YOUNG + [[36, 44], [50, 36], [64, 44], [56, 52], [42, 52]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#ffb3c8" ${S2}/><circle cx="${x}" cy="${y}" r="1.4" fill="#ffc93c"/>`).join("");
  }
  if (stage === 0) return sprout();
  if (stage === 1) return young();
  return bud(plantById(id).bud);
}

/** 果實小圖示（籃子、點心盤用） */
export function fruitSvg(id: PlantId): string {
  switch (id) {
    case "tulip": return `<path d="M50 90 v-30" ${S}/><path d="M34 28 q2 24 16 28 q14 -4 16 -28 l-8 8 l-8 -12 l-8 12 z" fill="#ff5d73" ${S}/>`;
    case "carrot": return `<path d="M50 40 q-10 -16 -4 -28 M50 40 q10 -16 4 -28 M50 40 v-30" stroke="${LEAF_DARK}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M34 42 q16 -8 32 0 q-4 28 -16 48 q-12 -20 -16 -48 z" fill="#ff9f43" ${S}/>`;
    case "strawberry": return `<path d="M50 30 q-26 0 -24 24 q4 26 24 38 q20 -12 24 -38 q2 -24 -24 -24 z" fill="#ff5d73" ${S}/><path d="M36 28 l14 10 l14 -10 l-14 -6 z" fill="${LEAF}" ${S2}/><circle cx="42" cy="52" r="2" fill="#fff6dc"/><circle cx="56" cy="58" r="2" fill="#fff6dc"/><circle cx="48" cy="70" r="2" fill="#fff6dc"/>`;
    case "sunflower": return `<ellipse cx="38" cy="58" rx="10" ry="16" fill="#3d2a1a" ${S2} transform="rotate(-20 38 58)"/><ellipse cx="62" cy="58" rx="10" ry="16" fill="#3d2a1a" ${S2} transform="rotate(20 62 58)"/><path d="M36 50 v14 M62 50 v14" stroke="#fff6dc" stroke-width="2"/>`;
    case "watermelon": return `<path d="M12 44 h76 q-6 40 -38 40 q-32 0 -38 -40 z" fill="#ff5d73" ${S}/><path d="M12 44 h76 q-1 6 -3 10 h-70 q-2 -4 -3 -10 z" fill="#2fbf7a" ${S2}/><circle cx="36" cy="62" r="2.4" fill="${INK}"/><circle cx="50" cy="68" r="2.4" fill="${INK}"/><circle cx="64" cy="62" r="2.4" fill="${INK}"/>`;
    case "apple": return `<path d="M50 32 q-16 -10 -28 4 q-10 18 4 40 q12 16 24 8 q12 8 24 -8 q14 -22 4 -40 q-12 -14 -28 -4 z" fill="#ff5d73" ${S}/><path d="M50 32 q0 -12 6 -18" stroke="${INK}" stroke-width="3" fill="none"/><path d="M54 20 q12 -6 16 4 q-12 4 -16 -4 z" fill="${LEAF}" ${S2}/><ellipse cx="36" cy="46" rx="4" ry="7" fill="#fff" opacity=".5"/>`;
  }
}

/** 種子袋圖示 */
export function seedPacketSvg(id: PlantId): string {
  const p = plantById(id);
  return `<rect x="18" y="14" width="64" height="76" rx="8" fill="#fff6dc" ${S}/><path d="M18 26 h64" ${S}/>
    <g transform="translate(25 30) scale(.5)">${READY[id]}</g>
    ${p.rare ? `<path d="M70 6 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 z" fill="#ffc93c" ${S2}/>` : ""}`;
}

/* ───────────── 訪客的圖 ───────────── */

const eyes = (lx: number, rx: number, y: number) =>
  `<circle cx="${lx}" cy="${y}" r="3.2" fill="${INK}"/><circle cx="${rx}" cy="${y}" r="3.2" fill="${INK}"/><circle cx="${lx + 1}" cy="${y - 1}" r="1" fill="#fff"/><circle cx="${rx + 1}" cy="${y - 1}" r="1" fill="#fff"/>`;
const cheeks = (lx: number, rx: number, y: number) =>
  `<ellipse cx="${lx}" cy="${y}" rx="4" ry="2.5" fill="#ff8fb1" opacity=".8"/><ellipse cx="${rx}" cy="${y}" rx="4" ry="2.5" fill="#ff8fb1" opacity=".8"/>`;

const VISITOR_ART: Record<VisitorId, string> = {
  butterfly: `<g class="gv-wing-l"><path d="M48 50 q-30 -34 -36 -6 q-2 18 36 10 z" fill="#a68bff" ${S}/><path d="M48 54 q-24 30 -30 8 q2 -10 30 -8 z" fill="#ff8fb1" ${S}/><circle cx="26" cy="40" r="4" fill="#fff" opacity=".7"/></g>
    <g class="gv-wing-r"><path d="M52 50 q30 -34 36 -6 q2 18 -36 10 z" fill="#a68bff" ${S}/><path d="M52 54 q24 30 30 8 q-2 -10 -30 -8 z" fill="#ff8fb1" ${S}/><circle cx="74" cy="40" r="4" fill="#fff" opacity=".7"/></g>
    <rect x="46" y="36" width="8" height="34" rx="4" fill="${INK}"/><path d="M48 36 q-6 -12 -10 -14 M52 36 q6 -12 10 -14" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  rabbit: `<path d="M36 40 q-8 -34 4 -36 q10 4 6 36 z" fill="#fff" ${S}/><path d="M38 34 q-4 -22 2 -24 q4 4 2 24 z" fill="#ffb3c8"/>
    <path d="M64 40 q8 -34 -4 -36 q-10 4 -6 36 z" fill="#fff" ${S}/><path d="M62 34 q4 -22 -2 -24 q-4 4 -2 24 z" fill="#ffb3c8"/>
    <ellipse cx="50" cy="74" rx="26" ry="18" fill="#fff" ${S}/><circle cx="50" cy="52" r="20" fill="#fff" ${S}/>
    ${eyes(42, 58, 50)}${cheeks(37, 63, 57)}<path d="M47 57 l3 3 l3 -3 z" fill="#ff8fb1"/><path d="M50 60 v3 M50 63 q-4 3 -6 1 M50 63 q4 3 6 1" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  hedgehog: `<path d="M16 80 l4 -14 l-6 -6 l10 -4 l-2 -12 l12 2 l4 -12 l10 8 l8 -10 l6 12 l12 -4 l-2 12 l10 4 l-6 8 l6 8 l-6 8 z" fill="#9a6a3e" ${S}/>
    <path d="M58 82 q-4 -26 16 -28 q16 4 14 22 q-2 8 -12 8 z" fill="#f5d6b0" ${S}/>
    <circle cx="89" cy="73" r="3.5" fill="${INK}"/><circle cx="77" cy="65" r="3.2" fill="${INK}"/><circle cx="78" cy="64" r="1" fill="#fff"/><ellipse cx="74" cy="74" rx="4" ry="2.5" fill="#ff8fb1" opacity=".8"/>
    <path d="M30 88 v4 M46 88 v4 M68 86 v6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  bird: `<path d="M22 60 q-14 -6 -12 6 q8 4 14 0 z" fill="#4d9fff" ${S2}/>
    <circle cx="50" cy="58" r="26" fill="#6cc4ff" ${S}/><path d="M34 62 q12 16 26 2" fill="#bfe6ff" ${S2}/>
    <path d="M40 60 q-10 4 -12 16 q10 -2 16 -10 z" fill="#4d9fff" ${S2}/>
    ${eyes(48, 62, 50)}<path d="M72 54 l12 4 l-12 5 z" fill="#ffc93c" ${S2}/>${cheeks(44, 66, 58)}
    <path d="M44 84 v6 M56 84 v6" stroke="#ff9f43" stroke-width="3" stroke-linecap="round"/>`,
  turtle: `<ellipse cx="50" cy="66" rx="32" ry="20" fill="#3fbf7f" ${S}/>
    <path d="M50 46 l12 8 v14 l-12 8 l-12 -8 v-14 z" fill="#7ad9a4" ${S2}/><path d="M38 54 l-14 6 M62 54 l14 6 M38 68 l-12 4 M62 68 l12 4" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="86" cy="62" r="11" fill="#9be0b5" ${S}/>${eyes(84, 90, 59).replace(/r="3.2"/g, 'r="2.4"')}<path d="M84 67 q3 2 6 0" stroke="${INK}" stroke-width="2" fill="none"/>
    <ellipse cx="28" cy="84" rx="7" ry="5" fill="#9be0b5" ${S2}/><ellipse cx="70" cy="85" rx="7" ry="5" fill="#9be0b5" ${S2}/>`,
  squirrel: `<path d="M64 82 q34 -6 26 -42 q-6 -22 -24 -12 q14 10 4 30 q-6 10 -6 24 z" fill="#d9822b" ${S}/><path d="M74 44 q8 4 6 16" stroke="#f5c08a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="44" cy="70" rx="18" ry="20" fill="#e8963d" ${S}/><ellipse cx="44" cy="74" rx="10" ry="13" fill="#f5d6b0"/>
    <circle cx="42" cy="44" r="16" fill="#e8963d" ${S}/><path d="M30 34 l-2 -12 l10 6 z M50 30 l6 -10 l2 12 z" fill="#e8963d" ${S2}/>
    ${eyes(36, 48, 43)}<ellipse cx="42" cy="50" rx="3" ry="2" fill="${INK}"/>${cheeks(31, 53, 50)}
    <circle cx="44" cy="62" r="6" fill="#ff5d73" ${S2}/>`,
  fox: `<path d="M62 84 q30 0 30 -26 q-8 10 -22 8 z" fill="#ff8a3d" ${S}/><path d="M86 66 q6 -4 6 -8 q-4 8 -12 10 z" fill="#fff"/>
    <ellipse cx="46" cy="74" rx="20" ry="16" fill="#ff8a3d" ${S}/>
    <path d="M22 26 l10 22 h28 l10 -22 l-14 10 h-20 z" fill="#ff8a3d" ${S}/>
    <path d="M24 44 q22 -12 44 0 q-6 18 -22 24 q-16 -6 -22 -24 z" fill="#ff8a3d" ${S}/>
    <path d="M30 52 q16 22 32 0 q-6 14 -16 16 q-10 -2 -16 -16 z" fill="#fff"/>
    ${eyes(38, 54, 48)}<circle cx="46" cy="60" r="3" fill="${INK}"/>`,
  bear: `<circle cx="28" cy="30" r="10" fill="#b07a4a" ${S}/><circle cx="72" cy="30" r="10" fill="#b07a4a" ${S}/><circle cx="28" cy="30" r="5" fill="#e0b48a"/><circle cx="72" cy="30" r="5" fill="#e0b48a"/>
    <ellipse cx="50" cy="78" rx="28" ry="16" fill="#b07a4a" ${S}/>
    <circle cx="50" cy="48" r="26" fill="#b07a4a" ${S}/><ellipse cx="50" cy="58" rx="12" ry="9" fill="#e0b48a"/>
    ${eyes(40, 60, 44)}<ellipse cx="50" cy="54" rx="4.5" ry="3.2" fill="${INK}"/><path d="M50 57 q-4 5 -8 2 M50 57 q4 5 8 2" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>${cheeks(34, 66, 54)}`,
};

export function visitorSvg(id: VisitorId): string {
  return VISITOR_ART[id];
}
