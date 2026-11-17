import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import { PuzzleGame } from "@/components/play/puzzle-game";
import "./play.css";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-baloo" });

export const metadata: Metadata = {
  title: "Logic Gym 謎題本",
  description: "給幼稚園到小四的互動邏輯謎題：數織、一筆畫、數獨，每一題都驗算過答案只有一個。",
};

export default function PlayPage() {
  return (
    <main className={`lgp ${baloo.variable}`}>
      <PuzzleGame />
    </main>
  );
}
