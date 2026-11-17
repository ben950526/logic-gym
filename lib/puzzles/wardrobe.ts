/** 腦腦的裝扮（全部用程式畫，不需要美術圖）。從每日寶箱隨機開出來。 */

export type ItemSlot = "color" | "hat" | "face";

export interface WardrobeItem {
  id: string;
  slot: ItemSlot;
  name: string;
  /** color：身體顏色；hat/face：SVG 片段（座標系統同 pet.ts，viewBox 0 0 120 120） */
  body?: string;
  brain?: string;
  svg?: string;
}

const INK = "#23305a";

export const WARDROBE: WardrobeItem[] = [
  { id: "color-sky", slot: "color", name: "天空藍", body: "#6cc4ff", brain: "#2f86c9" },
  { id: "color-berry", slot: "color", name: "草莓粉", body: "#ff9ec4", brain: "#d4568a" },
  { id: "color-lemon", slot: "color", name: "檸檬黃", body: "#ffd84d", brain: "#c79b00" },
  { id: "color-grape", slot: "color", name: "葡萄紫", body: "#a68bff", brain: "#6a4fd1" },
  {
    id: "hat-party", slot: "hat", name: "派對帽",
    svg: `<path d="M44 36 l16 -30 l16 30 z" fill="#ff5d73" stroke="${INK}" stroke-width="3"/><path d="M50 24 l18 4 M54 14 l10 3" stroke="#ffc93c" stroke-width="3"/><circle cx="60" cy="6" r="5" fill="#ffc93c" stroke="${INK}" stroke-width="2"/>`,
  },
  {
    id: "hat-beanie", slot: "hat", name: "毛線帽",
    svg: `<path d="M30 44 q30 -40 60 0 z" fill="#4d9fff" stroke="${INK}" stroke-width="3"/><rect x="27" y="39" width="66" height="10" rx="5" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="60" cy="20" r="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`,
  },
  {
    id: "hat-flower", slot: "hat", name: "小花",
    svg: `<g transform="translate(80 34)"><circle cx="0" cy="-8" r="6" fill="#ff8fb1" stroke="${INK}" stroke-width="2"/><circle cx="8" cy="-2" r="6" fill="#ff8fb1" stroke="${INK}" stroke-width="2"/><circle cx="5" cy="7" r="6" fill="#ff8fb1" stroke="${INK}" stroke-width="2"/><circle cx="-5" cy="7" r="6" fill="#ff8fb1" stroke="${INK}" stroke-width="2"/><circle cx="-8" cy="-2" r="6" fill="#ff8fb1" stroke="${INK}" stroke-width="2"/><circle r="5" fill="#ffc93c" stroke="${INK}" stroke-width="2"/></g>`,
  },
  {
    id: "hat-chef", slot: "hat", name: "廚師帽",
    svg: `<path d="M42 40 v-12 q-12 -4 -6 -14 q6 -8 14 -2 q6 -10 16 -2 q10 -6 14 4 q4 10 -8 14 v12 z" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M42 34 h36" stroke="${INK}" stroke-width="2"/>`,
  },
  {
    id: "hat-wizard", slot: "hat", name: "魔法帽",
    svg: `<path d="M42 38 L66 0 L78 38 z" fill="#7c5cff" stroke="${INK}" stroke-width="3"/><ellipse cx="60" cy="38" rx="30" ry="6" fill="#7c5cff" stroke="${INK}" stroke-width="3"/><path d="M64 18 l2 4 l4 1 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 -1 z" fill="#ffc93c"/>`,
  },
  {
    id: "face-glasses", slot: "face", name: "圓眼鏡",
    svg: `<circle cx="47" cy="62" r="11" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="73" cy="62" r="11" fill="none" stroke="${INK}" stroke-width="3"/><path d="M58 62 h4" stroke="${INK}" stroke-width="3"/>`,
  },
  {
    id: "face-shades", slot: "face", name: "酷墨鏡",
    svg: `<rect x="35" y="54" width="22" height="15" rx="6" fill="${INK}"/><rect x="63" y="54" width="22" height="15" rx="6" fill="${INK}"/><path d="M57 60 h6" stroke="${INK}" stroke-width="3"/><path d="M40 58 l6 0" stroke="#fff" stroke-width="2" opacity=".6"/>`,
  },
  {
    id: "face-bow", slot: "face", name: "紅領結",
    svg: `<path d="M60 100 l-14 -8 v16 z M60 100 l14 -8 v16 z" fill="#ff5d73" stroke="${INK}" stroke-width="2.5"/><circle cx="60" cy="100" r="4" fill="#ff5d73" stroke="${INK}" stroke-width="2"/>`,
  },
];

export interface Look {
  color?: string;
  hat?: string;
  face?: string;
}

export const itemById = (id?: string) => WARDROBE.find((w) => w.id === id);
