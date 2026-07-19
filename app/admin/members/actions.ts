"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { setMemberPlan } from "@/lib/admin-members";
import type { UserPlan } from "@/lib/constants";

export async function updateMemberPlan(userId: string, plan: UserPlan) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { error: "未授權" };
  }

  if (plan !== "free" && plan !== "paid") {
    return { error: "無效的方案" };
  }

  try {
    await setMemberPlan(userId, plan);
    revalidatePath("/admin/members");
    revalidatePath("/practice");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "更新失敗",
    };
  }
}
