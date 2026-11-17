import Link from "next/link";
import { PlayerHomeDashboard } from "@/components/home/player-home-dashboard";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { FREE_MATH_STAGE_LIMIT } from "@/lib/stage-access";
import { PAID_MONTHLY_PRICE } from "@/lib/pricing-config";
import {
  LANDING_SUB_TEASER_LINES,
  MEMBERSHIP_BENEFITS,
  PAYMENT_FLOW_STEPS,
  PLAN_COMPARISON_ROWS,
} from "@/lib/pricing-content";
import { isSupabaseConfigured } from "@/lib/puzzles-local";
import { isSupabaseReachable } from "@/lib/supabase/auth-server";

export default async function HomePage() {
  const supabaseReady = isSupabaseConfigured();
  const supabaseOnline = supabaseReady ? await isSupabaseReachable() : false;
  const session = supabaseOnline ? await getCurrentUserProfile() : null;

  if (session) {
    return (
      <PlayerHomeDashboard profile={session.profile} userId={session.userId} />
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-3xl flex-col gap-8 px-6 py-12">
        {supabaseReady && !supabaseOnline ? (
          <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
            <p className="font-medium">無法連線 Supabase</p>
            <p className="mt-1 text-amber-900/90">
              請檢查網路，或到 Supabase 後台確認專案網址與 anon key 是否正確（
              <code className="text-xs">.env.local</code>）。
            </p>
            <p className="mt-2 text-amber-900/80">
              後台審題仍可用：
              <Link href="/admin/puzzles" className="ml-1 underline">
                /admin/puzzles
              </Link>
            </p>
          </div>
        ) : null}

        <div className="space-y-4 text-center">
          <p className="text-sm font-medium text-violet-600">Logic Gym · 各科星球</p>
          <h1 className="text-4xl font-bold tracking-tight">邏輯星系大冒險</h1>
          <p className="text-lg text-zinc-600">
            選一顆星球，一關一關前進。答對就解鎖下一關！
          </p>
        </div>

        <div className="landing-sub-teaser">
          <p className="landing-sub-teaser-badge">會員方案</p>
          <p className="landing-sub-teaser-title">
            前 {FREE_MATH_STAGE_LIMIT} 關免費 · 會員隨更新享有新內容 · NT${PAID_MONTHLY_PRICE}/月
          </p>
          <ul className="landing-sub-teaser-list">
            {LANDING_SUB_TEASER_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <section className="landing-benefits">
          <h2 className="landing-section-title">付費會員解鎖什麼？</h2>
          <div className="landing-benefits-grid">
            {MEMBERSHIP_BENEFITS.slice(0, 4).map((b) => (
              <div key={b.title} className="landing-benefit-card">
                <span className="landing-benefit-icon">{b.icon}</span>
                <p className="landing-benefit-name">{b.title}</p>
                <p className="landing-benefit-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-compare">
          <h2 className="landing-section-title">方案對照</h2>
          <div className="landing-compare-table">
            <div className="landing-compare-head">
              <span>內容</span>
              <span>免費</span>
              <span>付費</span>
            </div>
            {PLAN_COMPARISON_ROWS.map((row) => (
              <div key={row.feature} className="landing-compare-row">
                <span>{row.feature}</span>
                <span>{row.free ? "✓" : "—"}</span>
                <span className="landing-compare-paid">✓</span>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-flow">
          <h2 className="landing-section-title">訂閱流程</h2>
          <ol className="landing-flow-steps">
            {PAYMENT_FLOW_STEPS.map((s) => (
              <li key={s.step} className="landing-flow-step">
                <span className="landing-flow-num">{s.step}</span>
                <div>
                  <p className="landing-flow-title">{s.title}</p>
                  <p className="landing-flow-desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="landing-flow-note">
            登入後可在「訂閱方案」頁查看完整匯款帳戶與填表連結。
          </p>
        </section>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/login?next=/galaxy"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            登入 / 註冊
          </Link>
          <Link
            href="/login?next=/galaxy&mode=signup"
            className="rounded-lg border border-amber-400 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
          >
            免費開始（前 {FREE_MATH_STAGE_LIMIT} 關）
          </Link>
        </div>

        <p className="text-center text-sm text-zinc-500">
          國小數學 + 找規律 · 線性破關 · 無需後台審核，註冊即可玩
        </p>
      </main>
    </>
  );
}
