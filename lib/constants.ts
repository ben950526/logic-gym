export const FREE_DAILY_LIMIT = 5;
export const PAID_DAILY_LIMIT = 20;

export type UserPlan = "free" | "paid";

export function dailyLimitForPlan(plan: UserPlan): number {
  return plan === "paid" ? PAID_DAILY_LIMIT : FREE_DAILY_LIMIT;
}
