import { StoryBubble } from "@/components/story/story-bubble";
import { GameButton } from "@/components/game/game-button";
import type { GalaxyEntry } from "@/lib/world/galaxies";

interface GalaxyComingSoonProps {
  galaxy: GalaxyEntry;
}

export function GalaxyComingSoon({ galaxy }: GalaxyComingSoonProps) {
  return (
    <div className="galaxy-coming-soon">
      <StoryBubble speaker="星艦日誌 · 開發中" variant="intro" theme="adventure">
        <span className="block font-semibold">
          {galaxy.emoji} {galaxy.name} 尚在建造中
        </span>
        <span className="mt-2 block">{galaxy.tagline}</span>
        <span className="mt-2 block shell-muted">
          小光與夥伴正在這裡架設新的關卡與劇情。目前請先到「邏輯星系」遠征吧！
        </span>
      </StoryBubble>
      <GameButton href="/galaxy/logic" variant="gold" fullWidth className="mt-5">
        ▶ 前往邏輯星系
      </GameButton>
      <GameButton href="/" variant="ghost" fullWidth className="mt-2">
        回首頁
      </GameButton>
    </div>
  );
}
