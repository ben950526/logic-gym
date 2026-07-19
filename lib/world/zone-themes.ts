/** 乳牛星球 10 區 — 融合 LINE Rangers 區域主題 + 手遊關卡地圖配色 */
export type ZoneDecor =
  | "meadow"
  | "industrial"
  | "library"
  | "market"
  | "harbor"
  | "bazaar"
  | "warehouse"
  | "logic"
  | "expedition"
  | "boss";

export interface ZoneTheme {
  id: number;
  label: string;
  /** 副標，呼應經典關卡遊戲區域名 */
  flavor: string;
  decor: ZoneDecor;
  skyTop: string;
  skyBottom: string;
  groundTop: string;
  groundBottom: string;
  pathFill: string;
  pathEdge: string;
  pathHighlight: string;
  signWood: string;
  signBorder: string;
  accent: string;
  sunColor: string;
}

export const ZONE_THEMES: ZoneTheme[] = [
  {
    id: 1,
    label: "登陸補給區",
    flavor: "風之谷 · 牧場入口",
    decor: "meadow",
    skyTop: "#5eb3e8",
    skyBottom: "#b3e5fc",
    groundTop: "#a8d86d",
    groundBottom: "#558b2f",
    pathFill: "#f0dfa8",
    pathEdge: "#8d6e3a",
    pathHighlight: "#fff8e1",
    signWood: "#c9956d",
    signBorder: "#5d4037",
    accent: "#43a047",
    sunColor: "#ffe082",
  },
  {
    id: 2,
    label: "能源通訊站",
    flavor: "迷宮森林 · 訊號塔",
    decor: "industrial",
    skyTop: "#ff9a6c",
    skyBottom: "#ffccbc",
    groundTop: "#9ccc65",
    groundBottom: "#689f38",
    pathFill: "#e8d0a0",
    pathEdge: "#795548",
    pathHighlight: "#fff3e0",
    signWood: "#b8886a",
    signBorder: "#4e342e",
    accent: "#fb8c00",
    sunColor: "#ffab40",
  },
  {
    id: 3,
    label: "圖書記錄塔",
    flavor: "古代博物館 · 書塔",
    decor: "library",
    skyTop: "#7986cb",
    skyBottom: "#c5cae9",
    groundTop: "#81c784",
    groundBottom: "#388e3c",
    pathFill: "#ddd0b0",
    pathEdge: "#6d4c41",
    pathHighlight: "#ede7f6",
    signWood: "#9e8b7e",
    signBorder: "#3e2723",
    accent: "#5c6bc0",
    sunColor: "#ffd54f",
  },
  {
    id: 4,
    label: "農場交易市",
    flavor: "遊園市集 · 農場",
    decor: "market",
    skyTop: "#4fc3f7",
    skyBottom: "#e1f5fe",
    groundTop: "#c5e1a5",
    groundBottom: "#7cb342",
    pathFill: "#edd9a3",
    pathEdge: "#8d6e63",
    pathHighlight: "#f1f8e9",
    signWood: "#d4a574",
    signBorder: "#5d4037",
    accent: "#7cb342",
    sunColor: "#ffee58",
  },
  {
    id: 5,
    label: "工程時間港",
    flavor: "水中都市 · 碼頭",
    decor: "harbor",
    skyTop: "#4dd0e1",
    skyBottom: "#b2ebf2",
    groundTop: "#80cbc4",
    groundBottom: "#00897b",
    pathFill: "#d4c4a0",
    pathEdge: "#546e7a",
    pathHighlight: "#e0f7fa",
    signWood: "#8d9eab",
    signBorder: "#37474f",
    accent: "#00acc1",
    sunColor: "#fff59d",
  },
  {
    id: 6,
    label: "折扣比例域",
    flavor: "海盜市集 · 折扣巷",
    decor: "bazaar",
    skyTop: "#ffb74d",
    skyBottom: "#ffe0b2",
    groundTop: "#dce775",
    groundBottom: "#afb42b",
    pathFill: "#e8cfa0",
    pathEdge: "#8d6e63",
    pathHighlight: "#fff8e1",
    signWood: "#cd9b7a",
    signBorder: "#5d4037",
    accent: "#f4511e",
    sunColor: "#ffca28",
  },
  {
    id: 7,
    label: "分配餘數庫",
    flavor: "秘密倉庫 · 余數庫",
    decor: "warehouse",
    skyTop: "#90a4ae",
    skyBottom: "#cfd8dc",
    groundTop: "#a1887f",
    groundBottom: "#6d4c41",
    pathFill: "#c9b896",
    pathEdge: "#4e342e",
    pathHighlight: "#efebe9",
    signWood: "#8d6e63",
    signBorder: "#3e2723",
    accent: "#795548",
    sunColor: "#ffcc80",
  },
  {
    id: 8,
    label: "邏輯推理所",
    flavor: "錯覺迷宫 · 推理所",
    decor: "logic",
    skyTop: "#7e57c2",
    skyBottom: "#d1c4e9",
    groundTop: "#9575cd",
    groundBottom: "#512da8",
    pathFill: "#c5b8d8",
    pathEdge: "#4527a0",
    pathHighlight: "#ede7f6",
    signWood: "#7e57c2",
    signBorder: "#311b92",
    accent: "#7c4dff",
    sunColor: "#b388ff",
  },
  {
    id: 9,
    label: "綜合遠征線",
    flavor: "天空之塔 · 遠征",
    decor: "expedition",
    skyTop: "#42a5f5",
    skyBottom: "#bbdefb",
    groundTop: "#78909c",
    groundBottom: "#455a64",
    pathFill: "#d5dce3",
    pathEdge: "#37474f",
    pathHighlight: "#eceff1",
    signWood: "#78909c",
    signBorder: "#263238",
    accent: "#0288d1",
    sunColor: "#81d4fa",
  },
  {
    id: 10,
    label: "變異牧場核心",
    flavor: "最終要塞 · BOSS 領域",
    decor: "boss",
    skyTop: "#c62828",
    skyBottom: "#ef9a9a",
    groundTop: "#6a1b9a",
    groundBottom: "#4a148c",
    pathFill: "#bcaaa4",
    pathEdge: "#3e2723",
    pathHighlight: "#ffcdd2",
    signWood: "#6d4c41",
    signBorder: "#1a0a0a",
    accent: "#d32f2f",
    sunColor: "#ff5252",
  },
];

export function getZoneTheme(zoneNum: number): ZoneTheme {
  return ZONE_THEMES[Math.min(Math.max(zoneNum, 1), 10) - 1];
}
