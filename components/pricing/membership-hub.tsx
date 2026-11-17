import type { ReactNode } from "react";

import Link from "next/link";

import { CopyTextButton } from "@/components/pricing/copy-text-button";

import { GameButton } from "@/components/game/game-button";

import { GamePanel } from "@/components/game/game-panel";

import {

  getManualPaymentConfig,

  isManualPaymentConfigured,

  PAID_MONTHLY_PRICE,

} from "@/lib/pricing-config";

import { FREE_MATH_STAGE_LIMIT } from "@/lib/stage-access";

import {

  MEMBERSHIP_BENEFITS,

  MEMBERSHIP_FAQ,

  MEMBERSHIP_PLANS,
  PAID_MEMBER_ACTIVE_SUMMARY,
  PAID_ONGOING_DISCLAIMER,
  PAYMENT_FLOW_STEPS,

  PLAN_COMPARISON_ROWS,

  getPaywallBody,

  getPaywallHeadline,

} from "@/lib/pricing-content";

import { getDefaultLogicGalaxyHref } from "@/lib/world/world-catalog";

import { cn } from "@/lib/utils";



interface MembershipHubProps {

  nickname: string;

  plan: "free" | "paid";

  mathCleared?: number;

  nextHref?: string | null;

  backHref?: string;

  backLabel?: string;

  variant?: "full" | "compact";

}



function MembershipCard({

  children,

  className,

}: {

  children: ReactNode;

  className?: string;

}) {

  return (

    <GamePanel className={cn("game-panel-adventure membership-card", className)}>

      {children}

    </GamePanel>

  );

}



export function MembershipHub({

  nickname,

  plan,

  mathCleared = 0,

  nextHref = null,

  backHref = "/",

  backLabel = "首頁",

  variant = "full",

}: MembershipHubProps) {

  const isPaid = plan === "paid";

  const config = getManualPaymentConfig();

  const bankReady = isManualPaymentConfigured();

  const atPaywall = !isPaid && mathCleared >= FREE_MATH_STAGE_LIMIT;



  if (isPaid) {

    return (

      <div className="membership-hub">

        <MembershipCard className="membership-card--hero membership-card--hero-paid">

          <p className="membership-card__kicker membership-card__kicker--paid">

            ✦ 付費會員生效中

          </p>

          <h1 className="membership-card__heading">嗨 {nickname}，全星球已解鎖</h1>

          <p className="membership-card__body">{PAID_MEMBER_ACTIVE_SUMMARY}</p>

        </MembershipCard>



        <MembershipCard>

          <p className="membership-card__kicker">你的會員權益</p>

          <ul className="membership-perks-list">

            {MEMBERSHIP_BENEFITS.slice(0, 4).map((b) => (

              <li key={b.title}>

                <span className="membership-perks-icon">{b.icon}</span>

                <div>

                  <p className="membership-card__heading membership-card__heading--sm">

                    {b.title}

                  </p>

                  <p className="membership-card__muted">{b.desc}</p>

                </div>

              </li>

            ))}

          </ul>

        </MembershipCard>



        <RenewalSection config={config} bankReady={bankReady} nickname={nickname} />



        <div className="membership-hub-actions">

          <GameButton href={getDefaultLogicGalaxyHref()} variant="gold" fullWidth>

            ▶ 進入邏輯星系

          </GameButton>

          <GameButton href="/" variant="primary" fullWidth>

            回首頁

          </GameButton>

        </div>

      </div>

    );

  }



  return (

    <div className={cn("membership-hub", variant === "compact" && "membership-hub--compact")}>

      <MembershipCard

        className={cn(

          "membership-card--hero",

          atPaywall && "membership-card--hero-urgent"

        )}

      >

        <p className="membership-card__kicker">

          {atPaywall ? "免費體驗已達上限" : "Logic Gym 會員方案"}

        </p>

        <h1 className="membership-card__heading">{getPaywallHeadline(mathCleared)}</h1>

        <p className="membership-card__body">{getPaywallBody(mathCleared)}</p>

      </MembershipCard>



      <section className="membership-plans">

        <MembershipCard>

          <div className="membership-plan-card membership-plan-card--free">

            <p className="membership-card__kicker">{MEMBERSHIP_PLANS.free.name}</p>

            <p className="membership-card__heading">{MEMBERSHIP_PLANS.free.priceLabel}</p>

            <p className="membership-card__muted">{MEMBERSHIP_PLANS.free.tagline}</p>

            {mathCleared < FREE_MATH_STAGE_LIMIT && (

              <p className="membership-plan-current">目前方案</p>

            )}

          </div>

        </MembershipCard>

        <MembershipCard className="membership-card--featured membership-plan-card--featured-wrap">

          <div className="membership-plan-card membership-plan-card--featured">

            <p className="membership-plan-featured-tag">推薦</p>

            <p className="membership-card__kicker">{MEMBERSHIP_PLANS.paid.name}</p>

            <p className="membership-card__heading">

              {MEMBERSHIP_PLANS.paid.priceLabel}

              <span className="membership-plan-period">{MEMBERSHIP_PLANS.paid.period}</span>

            </p>

            <p className="membership-card__muted">{MEMBERSHIP_PLANS.paid.tagline}</p>

          </div>

        </MembershipCard>

      </section>



      {variant === "full" && (

        <>

          <MembershipCard>

            <p className="membership-card__kicker">方案對照</p>

            <div className="membership-compare-table">

              <div className="membership-compare-head">

                <span>內容</span>

                <span>免費</span>

                <span>付費</span>

              </div>

              {PLAN_COMPARISON_ROWS.map((row) => (

                <div key={row.feature} className="membership-compare-row">

                  <span className="membership-compare-feature">{row.feature}</span>

                  <span className="membership-compare-cell">{row.free ? "✓" : "—"}</span>

                  <span className="membership-compare-cell membership-compare-cell--paid">✓</span>

                </div>

              ))}

            </div>

          </MembershipCard>



          <MembershipCard>

            <p className="membership-card__kicker">付費會員獨享</p>

            <div className="membership-benefits-cards">

              {MEMBERSHIP_BENEFITS.map((b) => (

                <div key={b.title} className="membership-benefit-card">

                  <span className="membership-benefit-icon">{b.icon}</span>

                  <p className="membership-card__heading membership-card__heading--sm">

                    {b.title}

                  </p>

                  <p className="membership-card__muted">{b.desc}</p>

                </div>

              ))}

            </div>

          </MembershipCard>



          <MembershipCard>

            <p className="membership-card__kicker">訂閱流程（四步驟）</p>

            <ol className="membership-flow-steps">

              {PAYMENT_FLOW_STEPS.map((s) => (

                <li key={s.step} className="membership-flow-step">

                  <span className="membership-flow-num">{s.step}</span>

                  <div>

                    <p className="membership-card__heading membership-card__heading--sm">

                      {s.title}

                    </p>

                    <p className="membership-card__muted">{s.desc}</p>

                  </div>

                </li>

              ))}

            </ol>

          </MembershipCard>

        </>

      )}



      <BankTransferSection config={config} bankReady={bankReady} nickname={nickname} />



      {variant === "full" && (

        <MembershipCard>

          <p className="membership-card__kicker">常見問題</p>

          <div className="membership-faq-list">

            {MEMBERSHIP_FAQ.map((item) => (

              <details key={item.q} className="membership-faq-item">

                <summary className="membership-faq-q">{item.q}</summary>

                <p className="membership-faq-a">{item.a}</p>

              </details>

            ))}

          </div>

        </MembershipCard>

      )}



      <div className="membership-hub-actions">

        {config.formUrl && (

          <GameButton href={config.formUrl} variant="gold" fullWidth>

            📝 填寫付款通知表單

          </GameButton>

        )}

        {nextHref && (

          <GameButton href={nextHref} variant="ghost" fullWidth>

            我已付款，返回繼續

          </GameButton>

        )}

        <GameButton href={backHref} variant="primary" fullWidth>

          回{backLabel}

        </GameButton>

      </div>



      <p className="membership-hub-foot">

        需協助？

        {config.contact ? (

          <>

            {" "}

            聯絡 <span className="font-semibold">{config.contact}</span>

          </>

        ) : (

          <> 請在付款通知中留下聯絡方式</>

        )}

      </p>

      {variant === "full" && (
        <p className="membership-hub-disclaimer">{PAID_ONGOING_DISCLAIMER}</p>
      )}

    </div>

  );

}



function BankTransferSection({

  config,

  bankReady,

  nickname,

}: {

  config: ReturnType<typeof getManualPaymentConfig>;

  bankReady: boolean;

  nickname: string;

}) {

  return (

    <MembershipCard>

      <p className="membership-card__kicker">匯款資訊</p>

      <p className="membership-card__heading membership-card__heading--sm">

        請匯 <strong>NT${PAID_MONTHLY_PRICE}</strong>

      </p>



      {bankReady ? (

        <div className="membership-bank-details">

          {config.bankName && (

            <div className="membership-bank-row">

              <span className="membership-bank-label">銀行</span>

              <span>

                {config.bankCode ? `(${config.bankCode}) ` : ""}

                {config.bankName}

              </span>

            </div>

          )}

          <div className="membership-bank-row membership-bank-row--highlight">

            <span className="membership-bank-label">帳號</span>

            <span className="membership-bank-account">{config.accountNumber}</span>

            {config.accountNumber && (

              <CopyTextButton text={config.accountNumber!.replace(/-/g, "")} />

            )}

          </div>

          <div className="membership-bank-row">

            <span className="membership-bank-label">戶名</span>

            <span>{config.accountName}</span>

            {config.accountName && (

              <CopyTextButton text={config.accountName!} label="複製戶名" />

            )}

          </div>

          <div className="membership-bank-row">

            <span className="membership-bank-label">備註</span>

            <span>{config.transferNote}</span>

            <CopyTextButton text={config.transferNote} label="複製備註" />

          </div>

        </div>

      ) : (

        <p className="membership-bank-pending">

          收款帳戶設定中。管理員請在 <code>.env.local</code> 設定{" "}

          <code>MANUAL_PAYMENT_*</code>。

        </p>

      )}



      <p className="membership-card__muted membership-bank-note">

        匯款時請填暱稱「<strong>{nickname}</strong>」以便對帳。開通後 24 小時內生效。

      </p>

    </MembershipCard>

  );

}



function RenewalSection({

  config,

  bankReady,

  nickname,

}: {

  config: ReturnType<typeof getManualPaymentConfig>;

  bankReady: boolean;

  nickname: string;

}) {

  return (

    <MembershipCard>

      <p className="membership-card__kicker">續訂說明</p>

      <p className="membership-card__body">

        會員為月付制，到期前請再次匯款 NT${PAID_MONTHLY_PRICE} 並通知管理員。

        目前無自動扣款，續訂流程與首次訂閱相同。

      </p>

      {bankReady && config.accountNumber && (

        <p className="membership-card__muted membership-renew-account">

          匯款帳號：<span className="font-mono font-bold">{config.accountNumber}</span>

          {" · "}

          備註：{config.transferNote}

        </p>

      )}

      {config.formUrl && (

        <Link

          href={config.formUrl}

          className="membership-renew-link"

          target="_blank"

          rel="noopener noreferrer"

        >

          填寫續訂通知表單 →

        </Link>

      )}

      <p className="membership-card__muted">暱稱：{nickname}</p>

    </MembershipCard>

  );

}

