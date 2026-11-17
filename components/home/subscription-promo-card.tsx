import Link from "next/link";

import { GameButton } from "@/components/game/game-button";

import { GamePanel } from "@/components/game/game-panel";

import { FREE_MATH_STAGE_LIMIT, isPaidPlan } from "@/lib/stage-access";

import {

  MEMBERSHIP_BENEFITS,

  PAID_MEMBER_ACTIVE_SUMMARY,

  PAID_PLAN_DETAIL,

  PAID_PROMO_HEADLINE,

} from "@/lib/pricing-content";

import type { UserPlan } from "@/lib/constants";

import { cn } from "@/lib/utils";



interface SubscriptionPromoCardProps {

  plan: UserPlan;

  mathCleared: number;

  atPaywall?: boolean;

  className?: string;

}



export function SubscriptionPromoCard({

  plan,

  mathCleared,

  atPaywall = false,

  className,

}: SubscriptionPromoCardProps) {

  const paid = isPaidPlan(plan);



  if (paid) {

    return (

      <GamePanel

        className={cn(

          "game-panel-adventure player-home-sub-card player-home-sub-card--paid",

          className

        )}

      >

        <p className="player-home-sub-card__kicker player-home-sub-card__kicker--paid">

          ✦ 付費會員

        </p>

        <h2 className="player-home-sub-card__heading">全星球會員生效中</h2>

        <p className="player-home-sub-card__body">{PAID_MEMBER_ACTIVE_SUMMARY}</p>

        <ul className="player-home-sub-mini-list">

          {MEMBERSHIP_BENEFITS.slice(0, 3).map((b) => (

            <li key={b.title}>

              {b.icon} {b.title}

            </li>

          ))}

        </ul>

        <GameButton href="/pricing" variant="ghost" fullWidth className="mt-3">

          查看會員中心 · 續訂說明

        </GameButton>

      </GamePanel>

    );

  }



  const freeRemaining = Math.max(0, FREE_MATH_STAGE_LIMIT - mathCleared);



  return (

    <GamePanel

      className={cn(

        "game-panel-adventure player-home-sub-card",

        atPaywall && "player-home-sub-card--urgent",

        className

      )}

    >

      <p className="player-home-sub-card__kicker">

        {atPaywall ? "免費體驗已達上限" : "會員方案"}

      </p>

      <h2 className="player-home-sub-card__heading">

        {atPaywall

          ? `解鎖第 ${FREE_MATH_STAGE_LIMIT + 1} 關起 · 持續更新`

          : PAID_PROMO_HEADLINE}

      </h2>

      <ul className="player-home-sub-list">

        <li>

          <span className="player-home-sub-free">免費</span> 乳牛星球前 {FREE_MATH_STAGE_LIMIT} 關

          {!atPaywall && freeRemaining > 0 && (

            <span className="player-home-sub-note">（還剩 {freeRemaining} 關）</span>

          )}

        </li>

        <li>

          <span className="player-home-sub-paid">付費</span> {PAID_PLAN_DETAIL}

        </li>

      </ul>

      <GameButton href="/pricing" variant="gold" fullWidth className="mt-3">

        {atPaywall ? "✨ 查看方案 · 匯款開通" : "方案介紹 · 匯款帳戶 · 流程"}

      </GameButton>

      <p className="player-home-sub-foot">

        人工匯款 · 24h 內開通 ·{" "}

        <Link href="/pricing" className="player-home-sub-link">

          完整說明

        </Link>

      </p>

    </GamePanel>

  );

}

