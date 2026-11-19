"use client";

import { createContext, useContext } from "react";

/**
 * 畫風：book =「印刷謎題本」（手繪線條圖示＋套色偏移，2026-11-19 起的預設）；
 * classic = 舊的表情符號版，網址加 ?look=classic 還看得到，確定不用再整段刪掉。
 */
export type Look = "classic" | "book";
export const LookContext = createContext<Look>("book");
export const useLook = () => useContext(LookContext);

export type IconName =
  | "drop" | "tree" | "map" | "sound" | "mute" | "crown" | "nono" | "stroke" | "sudoku"
  | "lock" | "check" | "bulb" | "play" | "sprout" | "parent" | "reset" | "cross" | "question"
  | "hand" | "copy" | "phone" | "merge" | "eye";

const EMOJI: Record<IconName, string> = {
  drop: "💧", tree: "🌳", map: "🗺️", sound: "🔊", mute: "🔇", crown: "👑", nono: "🧩", stroke: "✏️", sudoku: "🔢",
  lock: "🔒", check: "✓", bulb: "💡", play: "▶", sprout: "🌱", parent: "👨‍👩‍👧", reset: "↺", cross: "✕", question: "❓",
  hand: "👆", copy: "📋", phone: "📲", merge: "⤵", eye: "👀",
};

/* 每個圖示兩層：底色（往右下偏一點，像印刷套色沒對準）＋墨線。viewBox 0 0 24 24 */
type Art = { fill?: [string, string][]; ink: string };
const C = { sky: "var(--ic-sky)", leaf: "var(--ic-leaf)", sun: "var(--ic-sun)", red: "var(--ic-red)", paper: "var(--ic-paper)", bark: "var(--ic-bark)" };

const ART: Record<IconName, Art> = {
  drop: {
    fill: [[C.sky, "M12 3.2c3.1 4.3 6.2 7.7 6.2 11.2a6.2 6.2 0 0 1-12.4 0c0-3.5 3.1-6.9 6.2-11.2z"]],
    ink: "M12 3.2c3.1 4.3 6.2 7.7 6.2 11.2a6.2 6.2 0 0 1-12.4 0c0-3.5 3.1-6.9 6.2-11.2z M9.2 14.6c.1 1.5 1 2.6 2.3 2.9",
  },
  tree: {
    fill: [[C.leaf, "M7.4 14.6c-2.6-.2-4-2.2-3.4-4.4.5-1.7 2-2.5 3.4-2.3.4-2.6 2.4-4.3 4.8-4.2 2.3.1 4 1.9 4.2 4.1 1.9-.2 3.6 1.2 3.7 3.2.1 2.2-1.6 3.7-3.7 3.6z"], [C.bark, "M10.6 14.4h2.8l.5 6.3h-3.8z"]],
    ink: "M7.4 14.6c-2.6-.2-4-2.2-3.4-4.4.5-1.7 2-2.5 3.4-2.3.4-2.6 2.4-4.3 4.8-4.2 2.3.1 4 1.9 4.2 4.1 1.9-.2 3.6 1.2 3.7 3.2.1 2.2-1.6 3.7-3.7 3.6z M10.6 14.6l-.4 6.1h3.8l-.6-6.1 M12 14.6v-2.4l-1.8-1.6 M12 12.4l1.9-1.3 M4 20.8h16",
  },
  map: {
    fill: [[C.sun, "M3.5 6.2l5.2-2 6.6 2 5.2-2v13.6l-5.2 2-6.6-2-5.2 2z"]],
    ink: "M3.5 6.2l5.2-2 6.6 2 5.2-2v13.6l-5.2 2-6.6-2-5.2 2z M8.7 4.2v13.6 M15.3 6.2v13.6 M5.6 15.4c1.2-.9 2.1-1.2 3.4-.6 M11 12.6c.9-.8 1.9-1.1 3-.7 M16.8 9l1.6 1.6 M18.4 9l-1.6 1.6",
  },
  sound: {
    fill: [[C.sun, "M4 9.4h3.4l4.6-3.8v12.8l-4.6-3.8H4z"]],
    ink: "M4 9.4h3.4l4.6-3.8v12.8l-4.6-3.8H4z M15.2 9.2c1.4 1.6 1.4 4 0 5.6 M17.8 6.8c2.8 2.9 2.8 7.5 0 10.4",
  },
  mute: {
    fill: [[C.paper, "M4 9.4h3.4l4.6-3.8v12.8l-4.6-3.8H4z"]],
    ink: "M4 9.4h3.4l4.6-3.8v12.8l-4.6-3.8H4z M15.4 9.4l5 5.2 M20.4 9.4l-5 5.2",
  },
  crown: {
    fill: [[C.sun, "M4 17.6l-1-9.4 5 4.2 4-6.6 4 6.6 5-4.2-1 9.4z"]],
    ink: "M4 17.6l-1-9.4 5 4.2 4-6.6 4 6.6 5-4.2-1 9.4z M4.2 20.2h15.6 M12 13.6v.2",
  },
  nono: {
    fill: [[C.red, "M4.5 4.5h5v5h-5z M9.5 9.5h5v5h-5z M14.5 4.5h5v5h-5z M9.5 14.5h5v5h-5z"]],
    ink: "M4.5 4.5h15v15h-15z M9.5 4.5v15 M14.5 4.5v15 M4.5 9.5h15 M4.5 14.5h15",
  },
  stroke: {
    fill: [[C.sun, "M15.6 4.4l4 4-10.4 10.4-4.8.8.8-4.8z"]],
    ink: "M15.6 4.4l4 4-10.4 10.4-4.8.8.8-4.8z M13.6 6.4l4 4 M5.4 14.6l4 4",
  },
  sudoku: {
    fill: [[C.sky, "M12 4.5h7.5V12H12z M4.5 12H12v7.5H4.5z"]],
    ink: "M4.5 4.5h15v15h-15z M12 4.5v15 M4.5 12h15 M7.4 7l1-.6v3.4 M14.4 15.2c.3-.9 1.7-1 2-.2.3.8-2.2 2.6-2.2 2.6h2.4",
  },
  lock: {
    fill: [[C.paper, "M5.5 10.6h13v9.2h-13z"]],
    ink: "M5.5 10.6h13v9.2h-13z M8.4 10.6V8a3.6 3.6 0 0 1 7.2 0v2.6 M12 14.2v2.4",
  },
  check: { ink: "M5 12.6l4.4 4.4L19.2 7" },
  bulb: {
    fill: [[C.sun, "M12 3.6a5.8 5.8 0 0 1 3.4 10.5c-.8.6-1.2 1.4-1.2 2.3H9.8c0-.9-.4-1.7-1.2-2.3A5.8 5.8 0 0 1 12 3.6z"]],
    ink: "M12 3.6a5.8 5.8 0 0 1 3.4 10.5c-.8.6-1.2 1.4-1.2 2.3H9.8c0-.9-.4-1.7-1.2-2.3A5.8 5.8 0 0 1 12 3.6z M9.9 18.6h4.2 M10.6 20.8h2.8",
  },
  play: { fill: [[C.paper, "M7.6 5.2l11 6.8-11 6.8z"]], ink: "M7.6 5.2l11 6.8-11 6.8z" },
  sprout: {
    fill: [[C.leaf, "M12 13c-.6-3.6-3.2-5.6-7-5.4.2 3.6 2.8 5.8 7 5.4z M12 11.4c.4-3.6 2.8-5.8 7-5.8.1 3.8-2.6 6-7 5.8z"]],
    ink: "M12 20.4v-9 M12 13c-.6-3.6-3.2-5.6-7-5.4.2 3.6 2.8 5.8 7 5.4z M12 11.4c.4-3.6 2.8-5.8 7-5.8.1 3.8-2.6 6-7 5.8z M6.4 20.6h11.2",
  },
  parent: {
    fill: [[C.sky, "M3.6 20.2c0-3.6 2.2-6 5.4-6s5.4 2.4 5.4 6z"], [C.red, "M13.6 20.2c0-2.6 1.6-4.4 3.8-4.4s3.6 1.8 3.6 4.4z"]],
    ink: "M9 6.2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z M3.6 20.2c0-3.6 2.2-6 5.4-6s5.4 2.4 5.4 6z M17.4 10.4a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z M13.8 20.2c.2-2.6 1.6-4.4 3.6-4.4s3.4 1.8 3.6 4.4",
  },
  reset: { ink: "M5.6 12a6.4 6.4 0 1 0 2-4.6 M4.8 4.4l.6 3.6 3.6-.4" },
  cross: { ink: "M6.4 6.4l11.2 11.2 M17.6 6.4L6.4 17.6" },
  hand: {
    fill: [[C.paper, "M9.5 4.8a1.5 1.5 0 0 1 3 0v5.4a1.5 1.5 0 0 1 3 .6 1.5 1.5 0 0 1 3 0v3.4c0 3.6-2.4 6.4-6 6.4h-.6c-2 0-3.4-.9-4.6-2.6l-2.6-3.8a1.4 1.4 0 0 1 2.2-1.7L9.5 15z"]],
    ink: "M9.5 15V4.8a1.5 1.5 0 0 1 3 0V11 M12.5 10.8a1.5 1.5 0 0 1 3 0v.6 M15.5 11a1.5 1.5 0 0 1 3 0v3.2c0 3.6-2.4 6.4-6 6.4h-.6c-2 0-3.4-.9-4.6-2.6l-2.6-3.8a1.4 1.4 0 0 1 2.2-1.7L9.5 15",
  },
  copy: {
    fill: [[C.sun, "M8.6 8.4h10.6v11.8H8.6z"]],
    ink: "M8.6 8.4h10.6v11.8H8.6z M15.4 8.4V4H4.8v11.8h3.8 M11.2 12.4h5.4 M11.2 15.6h4",
  },
  phone: {
    fill: [[C.sky, "M7 3.4h10v17.2H7z"]],
    ink: "M7 3.4h10v17.2H7z M10.6 18h2.8 M12 7v6.6 M9.4 11l2.6 2.6 2.6-2.6",
  },
  merge: {
    fill: [[C.leaf, "M4.4 14.6h15.2v5.4H4.4z"]],
    ink: "M12 3.8v9.4 M8.4 9.8l3.6 3.6 3.6-3.6 M4.4 14.6v5.4h15.2v-5.4",
  },
  eye: {
    fill: [[C.sky, "M12 8.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8z"]],
    ink: "M2.8 12c2.4-4 5.6-6 9.2-6s6.8 2 9.2 6c-2.4 4-5.6 6-9.2 6s-6.8-2-9.2-6z M12 8.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8z",
  },
  question: {
    fill: [[C.paper, "M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8z"]],
    ink: "M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8z M9.6 9.8c0-1.6 1.1-2.6 2.5-2.6 1.5 0 2.5 1 2.5 2.3 0 1.9-2.6 2-2.6 4 M12 16.6v.2",
  },
};

/** 圖示：classic 畫風用表情符號，book 畫風用手繪 SVG */
export function Ico({ n, className = "" }: { n: IconName; className?: string }) {
  const look = useLook();
  if (look === "classic") return <span className={`lgp-emo ${className}`} aria-hidden="true">{EMOJI[n]}</span>;
  const a = ART[n];
  return (
    <svg className={`lgp-ico ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {a.fill?.map(([color, d], i) => <path key={i} d={d} style={{ fill: color }} transform="translate(1.3 1.1)" />)}
      <path d={a.ink} fill="none" style={{ stroke: "var(--ic-ink)" }} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 「印刷謎題本」畫風的樹：把原本偏冷、偏螢光的顏色換成暖墨線＋植物染色系 */
const BOOK_TREE: Record<string, string> = {
  "#23305a": "#2e2a33", // 墨線
  "#2fa36f": "#3f7a4c", "#5fd3a8": "#86b878", "#3aa95c": "#4f8645", "#7bd88a": "#a6c886", "#2b9a7a": "#3c745c", "#58c9a0": "#7aae86",
  "#8ccb78": "#b9cf92", "#4f9a4a": "#6e8f4e", // 草地
  "#a5794a": "#9b6a43", "#c99a68": "#c19166", // 樹幹
  "#ff5d73": "#d9573f", "#ffb3cf": "#eeb3a3", "#ffc93c": "#e9b23a", "#ffe066": "#f2cf6a", "#8fd3ff": "#9cc4e0",
  // 冒險地圖：路邊裝飾、章節底色、路
  "#ff8fb1": "#e59a86", "#2fbf8a": "#5d9a62", "#4d9fff": "#4f86b8", "#b8664a": "#a85f43", "#9aa6d6": "#a7a9bd", "#a68bff": "#9a86c4", "#fff6dc": "#fbf3df",
  "#dff5d8": "#e3ecd0", "#cfeccf": "#d6e4c8", "#fff1c9": "#f4e7c6", "#e4f1ff": "#e2e9ec", "#ffe1d4": "#f2dccd", "#e6e0ff": "#e2dde9",
  "#c9a26b": "#c4a074", "#e3b65c": "#d4ad62", "#9fb7d6": "#a3b3c2", "#8b7bd8": "#8e81b3",
};
/** 把一段 SVG（或一個顏色）換成印刷謎題本的配色 */
export function bookTree(svg: string): string {
  return svg.replace(/#[0-9a-fA-F]{6}/g, (c) => BOOK_TREE[c.toLowerCase()] ?? c);
}
