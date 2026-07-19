"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthenticated,
  verifyAdminSecret,
} from "@/lib/admin-auth";
import { updatePuzzleStatus, updatePuzzleCompetitionPool } from "@/lib/supabase/puzzles";
import type { PuzzleStatus } from "@/types/puzzle";

export async function loginAdmin(formData: FormData) {
  const secret = String(formData.get("secret") ?? "");
  if (!verifyAdminSecret(secret)) {
    redirect("/admin/puzzles?error=auth");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin/puzzles");
}

export async function loginAdminToMembers(formData: FormData) {
  const secret = String(formData.get("secret") ?? "");
  if (!verifyAdminSecret(secret)) {
    redirect("/admin/members?error=auth");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin/members");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/puzzles");
}

export async function setPuzzleStatus(id: string, status: PuzzleStatus) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { error: "未授權" };
  }

  if (id.startsWith("local-")) {
    return {
      error: "本地樣本模式無法寫入。請設定 Supabase 並執行 npm run seed:puzzles",
    };
  }

  try {
    await updatePuzzleStatus(id, status);
    revalidatePath("/admin/puzzles");
    revalidatePath("/practice");
    revalidatePath("/competition");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "更新失敗",
    };
  }
}

export async function setPuzzleCompetitionPool(
  id: string,
  inCompetitionPool: boolean
) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { error: "未授權" };
  }

  if (id.startsWith("local-")) {
    return { error: "本地樣本模式無法寫入。" };
  }

  try {
    await updatePuzzleCompetitionPool(id, inCompetitionPool);
    revalidatePath("/admin/puzzles");
    revalidatePath("/competition");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "更新失敗",
    };
  }
}
