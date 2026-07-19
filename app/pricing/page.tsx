import Link from "next/link";
import { redirect } from "next/navigation";
import { V2_GALAXY_MODE } from "@/lib/feature-flags";
import { SiteHeader } from "@/components/layout/site-header";
import { ManualPaymentPanel } from "@/components/pricing/manual-payment-panel";
import { FREE_DAILY_LIMIT, PAID_DAILY_LIMIT } from "@/lib/constants";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { PAID_MONTHLY_PRICE } from "@/lib/pricing-config";
import { getActiveTitleDisplay } from "@/lib/title-status";

export default async function PricingPage() {
  if (V2_GALAXY_MODE) {
    redirect("/galaxy");
  }

  const session = await getCurrentUserProfile();
  const activeTitle = session
    ? getActiveTitleDisplay(session.profile.active_title_category)
    : null;

  if (!session) {
    redirect("/login?next=/pricing");
  }

  const { profile } = session;
  const isPaid = profile.plan === "paid";

  return (
    <>
      <SiteHeader
        nickname={profile.nickname}
        level={profile.level}
        title={activeTitle}
      />
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-blue-600">會員方案</p>
          <h1 className="text-3xl font-bold">選擇你的練功強度</h1>
          <p className="text-zinc-600">
            付費會員每天 {PAID_DAILY_LIMIT} 題，EXP 與封號規則相同。
          </p>
        </div>

        {isPaid && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            你已是付費會員，每天可練 {PAID_DAILY_LIMIT} 題。
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">免費</p>
            <p className="mt-2 text-2xl font-bold">NT$ 0</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              <li>每天 {FREE_DAILY_LIMIT} 題</li>
              <li>EXP 升級</li>
              <li>類別封號</li>
            </ul>
            {!isPaid && (
              <p className="mt-4 text-xs font-medium text-blue-600">目前方案</p>
            )}
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-amber-800">付費</p>
            <p className="mt-2 text-2xl font-bold text-amber-900">
              NT$ {PAID_MONTHLY_PRICE}
              <span className="text-base font-normal text-amber-800">/月</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-amber-900/80">
              <li>每天 {PAID_DAILY_LIMIT} 題</li>
              <li>EXP 升級</li>
              <li>類別封號</li>
            </ul>
            {isPaid && (
              <p className="mt-4 text-xs font-medium text-amber-800">
                目前方案（付費會員）
              </p>
            )}
          </div>
        </div>

        {!isPaid && <ManualPaymentPanel />}

        <div className="text-center">
          <Link
            href="/practice"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            返回練功
          </Link>
        </div>
      </main>
    </>
  );
}
