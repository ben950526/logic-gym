import Link from "next/link";
import { ChapterBanner } from "@/components/story/chapter-banner";
import { StoryBubble } from "@/components/story/story-bubble";
import { MissionPrompt } from "@/components/story/mission-prompt";
import { PlanetExpeditionHeader } from "@/components/planet/planet-expedition-header";
import { SHELL_ART_LAYOUT } from "@/lib/world/shell-assets";
import { loadSeasonStory } from "@/lib/story/season-1";
import { getPlanetBySlug } from "@/lib/stages/planet-map";
/** 開發用：檢查 MJ 框圖文字對位。僅 development 可開。 */
export default async function ShellPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ shellDebug?: string }>;
}) {
  if (process.env.NODE_ENV === "production") {
    return (
      <main className="p-8 text-center">
        <p>Shell preview 僅供開發環境使用。</p>
      </main>
    );
  }

  const { shellDebug } = await searchParams;
  const debug = shellDebug === "1";
  const story = await loadSeasonStory();
  const act = story.acts[0]!;
  const planet = await getPlanetBySlug("math");

  return (
    <main
      className={`stage-main mx-auto max-w-[430px] px-3 py-6${debug ? " shell-debug" : ""}`}
    >
      <h1 className="mb-2 text-lg font-black text-[#fff8e1]">Shell UI 對位預覽</h1>
      <p className="mb-2 text-xs text-[#bcaaa4]">
        對話 inset：<code>{SHELL_ART_LAYOUT.panelDialogue.inset}</code>
        <br />
        章節 inset：<code>{SHELL_ART_LAYOUT.chapterBanner.inset}</code>
        <br />
        任務列：MJ + fluidMinHeight（寬扁圖可撐高）
        <br />
        遠征 inset：<code>{SHELL_ART_LAYOUT.panelExpedition.inset}</code>
      </p>
      <p className="mb-4 text-xs text-[#8d6e63]">
        自動驗證：<code>npm run verify:shell-ui</code>
        {" · "}
        <Link href={debug ? "/dev/shell-preview" : "/dev/shell-preview?shellDebug=1"} className="underline">
          {debug ? "關閉" : "開啟"}安全區紅框
        </Link>
      </p>

      <div className="space-y-4">
        {planet && (
          <PlanetExpeditionHeader
            planet={planet}
            clearedCount={6}
            totalStages={100}
            currentStage={{
              id: "math-07",
              order: 7,
              name: "貼紙交換角",
            }}
          />
        )}

        <ChapterBanner act={act} beat="第 1 區 · 登陸補給區" theme="adventure" />

        <StoryBubble speaker="上一段劇情" variant="default" theme="adventure">
          小徑通往內陸深處！
        </StoryBubble>

        <StoryBubble speaker={story.protagonist.name} variant="intro" theme="adventure">
          小光沿小徑往前走。天邊有東西一閃一閃，像高塔上的燈。
        </StoryBubble>

        <MissionPrompt
          theme="adventure"
          text="解完這題，天邊一閃一閃的燈是什麼就會認出來！"
        />
      </div>
    </main>
  );
}
