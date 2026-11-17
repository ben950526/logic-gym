import Link from "next/link";
import { GameButton } from "@/components/game/game-button";
import { GamePanel } from "@/components/game/game-panel";
import { ManualPaymentPanel } from "@/components/pricing/manual-payment-panel";
import { FREE_MATH_STAGE_LIMIT } from "@/lib/stage-access";
import { PAID_PLAN_DETAIL } from "@/lib/pricing-content";
import { PAID_MONTHLY_PRICE } from "@/lib/pricing-config";

interface SubscriptionPaywallProps {
  nickname: string;
  backHref: string;
  backLabel: string;
  headline: string;
  body: string;
  nextHref?: string | null;
  accent?: string;
  variant?: "page" | "embedded";
}

export function SubscriptionPaywall({
  nickname,
  backHref,
  backLabel,
  headline,
  body,
  nextHref,
  accent = "#d97706",
  variant = "page",
}: SubscriptionPaywallProps) {
  const content = (
    <>
      <div className="subscription-paywall-hero">
        <p className="subscription-paywall-badge">會員解鎖</p>
        <h1 className="subscription-paywall-title">{headline}</h1>
        <p className="subscription-paywall-body">{body}</p>
      </div>

      <GamePanel className="game-panel-adventure subscription-paywall-plan">
        <div className="subscription-paywall-plan-grid">
          <div>
            <p className="subscription-paywall-plan-label">免費體驗</p>
            <p className="subscription-paywall-plan-price">NT$ 0</p>
            <p className="subscription-paywall-plan-detail">
              乳牛星球前 {FREE_MATH_STAGE_LIMIT} 關
            </p>
          </div>
          <div className="subscription-paywall-plan-divider" aria-hidden />
          <div>
            <p className="subscription-paywall-plan-label subscription-paywall-plan-label-paid">
              付費會員
            </p>
            <p className="subscription-paywall-plan-price subscription-paywall-plan-price-paid">
              NT$ {PAID_MONTHLY_PRICE}
              <span className="subscription-paywall-plan-unit">/月</span>
            </p>
            <p className="subscription-paywall-plan-detail">{PAID_PLAN_DETAIL}</p>
          </div>
        </div>
        <p className="subscription-paywall-plan-note">
          嗨 {nickname}，匯款後 24 小時內由管理員開通，重新整理即可繼續冒險。
        </p>
      </GamePanel>

      <ManualPaymentPanel />

      <div className="subscription-paywall-actions">
        {nextHref && (
          <GameButton href={nextHref} variant="ghost" fullWidth>
            我已付款，稍後再試
          </GameButton>
        )}
        <GameButton href={backHref} variant="primary" fullWidth>
          回{backLabel}
        </GameButton>
      </div>
    </>
  );

  if (variant === "embedded") {
    return (
      <div className="subscription-paywall subscription-paywall--embedded" style={{ ["--planet-accent" as string]: accent }}>
        {content}
      </div>
    );
  }

  return (
    <main
      className="subscription-paywall px-4 pb-12 pt-4"
      style={{ ["--planet-accent" as string]: accent }}
    >
      <p className="mb-4 text-center text-xs text-[var(--adv-text-muted)]">
        <Link href={backHref} className="hover:underline">
          ← {backLabel}
        </Link>
      </p>
      {content}
    </main>
  );
}
