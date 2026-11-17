import { GameButton } from "@/components/game/game-button";
import { ShellSection } from "@/components/game/shell-section";
import { FREE_MATH_STAGE_LIMIT } from "@/lib/stage-access";
import { PAID_MONTHLY_PRICE } from "@/lib/pricing-config";
import { MATH_PLANET_NAME, PATTERN_PLANET_NAME } from "@/lib/world/planet-names";

interface HomeUnlockPreviewProps {
  mathCleared: number;
  lockedMathStages: number;
  patternStages: number;
  atPaywall: boolean;
}

export function HomeUnlockPreview({
  mathCleared,
  lockedMathStages,
  patternStages,
  atPaywall,
}: HomeUnlockPreviewProps) {
  const totalLocked = lockedMathStages + patternStages;

  return (
    <ShellSection kind="expedition" className="home-unlock-preview-shell">
      <div className="home-unlock-preview">
        <div className="home-unlock-preview-header">
          <p className="shell-kicker">
            {atPaywall ? "🔒 前方還有冒險" : "🗺️ 訂閱解鎖預覽"}
          </p>
          <h2 className="shell-heading">
            全星球會員 NT${PAID_MONTHLY_PRICE}/月
          </h2>
          <p className="shell-muted">共 {totalLocked} 關待解鎖</p>
        </div>
        <div className="home-unlock-preview-grid">
          <div className="home-unlock-preview-item">
            <span className="home-unlock-preview-num">{lockedMathStages}</span>
            <span className="home-unlock-preview-label">
              {MATH_PLANET_NAME}
              <br />
              math-{String(FREE_MATH_STAGE_LIMIT + 1).padStart(2, "0")}～100
            </span>
          </div>
          <div className="home-unlock-preview-item">
            <span className="home-unlock-preview-num">{patternStages}</span>
            <span className="home-unlock-preview-label">
              {PATTERN_PLANET_NAME}
              <br />
              通關後開放
            </span>
          </div>
        </div>
        {!atPaywall && mathCleared > 0 && (
          <p className="shell-muted home-unlock-preview-note">
            你已通關 {mathCleared} 關，再 {Math.max(0, FREE_MATH_STAGE_LIMIT - mathCleared)} 關到達免費上限
          </p>
        )}
        <GameButton href="/pricing" variant="gold" fullWidth className="mt-2">
          {atPaywall ? "✨ 立即訂閱解鎖" : "查看完整方案與匯款方式"}
        </GameButton>
      </div>
    </ShellSection>
  );
}
