import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/puzzles-local";
import { getSafeAuthUser, isSupabaseReachable } from "@/lib/supabase/auth-server";
import { MATH_PLANET_NAME } from "@/lib/world/planet-names";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/galaxy";
  const defaultMode = params.mode === "signup" ? "signup" : "signin";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const user = isSupabaseConfigured() ? await getSafeAuthUser() : null;

  const supabaseOnline =
    isSupabaseConfigured() && !user ? await isSupabaseReachable() : true;

  if (user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-2 text-center">
          <Link href="/" className="text-sm font-medium text-blue-600">
            Logic Gym
          </Link>
          <h1 className="text-2xl font-bold">你已登入</h1>
          <p className="text-sm text-zinc-600">可以直接進入邏輯星系了。</p>
        </div>
        <Link
          href={next.startsWith("/") ? next : "/galaxy"}
          className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
        >
          前往邏輯星系
        </Link>
        <Link
          href="/"
          className="block text-center text-sm text-zinc-500 hover:text-zinc-800"
        >
          回首頁
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2 text-center">
        <Link href="/" className="text-sm font-medium text-blue-600">
          Logic Gym
        </Link>
        <h1 className="text-2xl font-bold">登入冒險</h1>
        <p className="text-sm text-zinc-600">
          登入後進入邏輯星系，從{MATH_PLANET_NAME}第 1 關開始！
        </p>
      </div>
      {!isSupabaseConfigured() ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          請先在 <code>.env.local</code> 設定 Supabase 才能登入。
        </p>
      ) : !supabaseOnline ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Supabase 連線失敗（這就是 fetch failed 的原因）</p>
          <p className="mt-2">
            目前設定的網址{" "}
            <code className="break-all text-xs">{supabaseUrl}</code>{" "}
            無法連線。
            請到{" "}
            <a
              href="https://supabase.com/dashboard"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Supabase 後台
            </a>{" "}
            → Project Settings → API，複製新的 URL 與 anon key（
            <code className="text-xs">eyJ...</code> 開頭）到{" "}
            <code>.env.local</code>，然後重開{" "}
            <code>start-dev.bat</code>。
          </p>
        </div>
      ) : null}
      <LoginForm next={next} defaultMode={defaultMode} />
    </main>
  );
}
