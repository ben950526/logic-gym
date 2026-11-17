import type { UserPlan } from "@/lib/constants";
import type { PlanetStage } from "@/types/stage";

/** 乳牛星球免費可玩關數（第 21 關起需訂閱） */
export const FREE_MATH_STAGE_LIMIT = 20;

export function isPaidPlan(plan: UserPlan): boolean {
  return plan === "paid";
}

export function isPremiumMathStage(stage: PlanetStage): boolean {
  return stage.order > FREE_MATH_STAGE_LIMIT;
}

export function stageRequiresSubscription(
  planetSlug: string,
  stage: PlanetStage,
  plan: UserPlan
): boolean {
  if (isPaidPlan(plan)) return false;
  if (planetSlug === "pattern") return true;
  if (planetSlug === "pattern-k") return false;
  if (planetSlug === "math") return isPremiumMathStage(stage);
  return false;
}

export function patternPlanetRequiresSubscription(plan: UserPlan): boolean {
  return !isPaidPlan(plan);
}

export function pricingReturnUrl(stageId?: string | null): string {
  if (stageId) return `/pricing?next=${encodeURIComponent(`/stage/${stageId}`)}`;
  return "/pricing";
}
