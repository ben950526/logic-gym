import { ShellSection } from "@/components/game/shell-section";
import { FREE_MATH_STAGE_LIMIT } from "@/lib/stage-access";

interface HomeQuickStatsProps {
  mathCleared: number;
  mathTotal: number;
  totalCleared: number;
  totalStages: number;
  paid: boolean;
  freePct: number;
}

export function HomeQuickStats({
  mathCleared,
  mathTotal,
  totalCleared,
  totalStages,
  paid,
  freePct,
}: HomeQuickStatsProps) {
  const overallPct = totalStages ? Math.round((totalCleared / totalStages) * 100) : 0;

  return (
    <ShellSection kind="chapter" className="home-quick-stats-shell">
      <div className="home-quick-stats">
        <div className="home-quick-stat">
          <span className="home-quick-stat-value">{totalCleared}</span>
          <span className="home-quick-stat-label">總通關</span>
          <span className="home-quick-stat-sub">{overallPct}% 星系</span>
        </div>
        <div className="home-quick-stat">
          <span className="home-quick-stat-value">
            {mathCleared}/{mathTotal}
          </span>
          <span className="home-quick-stat-label">乳牛星球</span>
          {!paid && (
            <div className="home-quick-stat-bar">
              <div className="home-quick-stat-bar-fill" style={{ width: `${freePct}%` }} />
            </div>
          )}
        </div>
        <div className="home-quick-stat">
          <span className="home-quick-stat-value">{paid ? "108" : FREE_MATH_STAGE_LIMIT}</span>
          <span className="home-quick-stat-label">{paid ? "可玩關數" : "免費上限"}</span>
          <span className="home-quick-stat-sub">{paid ? "全解鎖" : "關"}</span>
        </div>
      </div>
    </ShellSection>
  );
}
