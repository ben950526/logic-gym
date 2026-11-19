import type { Metadata } from "next";
import { Baloo_2, Huninn } from "next/font/google";
import { PuzzleGame } from "@/components/play/puzzle-game";
import "./play.css";
import "./look-book.css";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-baloo" });
// jf 粉圓（SIL OFL 1.1，可商用）。中文字形很多，用 unicode-range 分片，瀏覽器只下載用到的字
const huninn = Huninn({ subsets: ["latin"], weight: "400", variable: "--font-huninn", preload: false, display: "swap", adjustFontFallback: false });

export const metadata: Metadata = {
  title: "Logic Gym 謎題本",
  description: "給幼稚園到小四的互動邏輯謎題：數織、一筆畫、數獨，每一題都驗算過答案只有一個。",
};

export default function PlayPage() {
  return (
    <main className={`lgp ${baloo.variable} ${huninn.variable}`}>
      <PuzzleGame />
    </main>
  );
}
