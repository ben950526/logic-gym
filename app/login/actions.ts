"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function translateAuthError(message: string): string {
  if (
    message.includes("fetch failed") ||
    message.includes("Failed to fetch") ||
    message.includes("ENOTFOUND") ||
    message.includes("getaddrinfo")
  ) {
    return "無法連線 Supabase。請到 Supabase 後台複製正確的 Project URL 與 anon key，更新 logic-gym\\.env.local 後重開 start-dev.bat。";
  }
  if (message.includes("Invalid login credentials")) {
    return "Email 或密碼錯誤";
  }
  if (message.includes("User already registered")) {
    return "此 Email 已註冊，請直接登入";
  }
  if (message.includes("Password should be at least")) {
    return "密碼至少需要 6 個字元";
  }
  return message;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/galaxy");

  if (!email || !password) {
    return { error: "請填寫 Email 與密碼" };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: translateAuthError(error.message) };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    return { error: translateAuthError(msg) };
  }

  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/galaxy");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!email || !password || !nickname) {
    return { error: "請填寫暱稱、Email 與密碼" };
  }

  if (nickname.length < 2 || nickname.length > 20) {
    return { error: "暱稱需 2～20 個字" };
  }

  const supabase = await createClient();

  let data;
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    });
    data = result.data;
    if (result.error) {
      return { error: translateAuthError(result.error.message) };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    return { error: translateAuthError(msg) };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/galaxy");
  }

  return {
    success: true,
    message: "註冊成功！若已開啟 Email 驗證，請到信箱點確認連結後再登入。",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
