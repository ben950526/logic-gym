import type { UserPlan } from "@/lib/constants";
import type { PuzzleCategory } from "@/types/puzzle";

export interface UserProfile {
  id: string;
  nickname: string;
  plan: UserPlan;
  level: number;
  exp: number;
  unlocked_title_categories: string[];
  active_title_category: PuzzleCategory | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
}
