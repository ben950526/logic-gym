import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { getAllMathStageStories } from "@/lib/story/math-zones";
import { MATH_PLANET_NAME } from "@/lib/world/planet-names";

export const dynamic = "force-dynamic";

function StoryField({
  label,
  children,
  highlight,
}: {
  label: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "rounded-lg bg-amber-50/80 p-3" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-800">
        {children}
      </p>
    </div>
  );
}

export default async function MathPlanetAllStagesStoryPage() {
  const session = await getCurrentUserProfile();
  const { meta, stages } = await getAllMathStageStories();

  const byZone = new Map<number, typeof stages>();
  for (const s of stages) {
    const list = byZone.get(s.zone) ?? [];
    list.push(s);
    byZone.set(s.zone, list);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {session && <SiteHeader nickname={session.profile.nickname} />}
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/story/math-planet"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← 完整主線劇情
        </Link>

        <header className="mt-4">
          <p className="text-sm font-medium text-indigo-500">
            劇情檢查 · 逐關一覽
          </p>
          <h1 className="mt-1 text-3xl font-bold text-indigo-950">
            {meta?.title ?? `${MATH_PLANET_NAME} · 100 關劇情`}
          </h1>
          {meta?.synopsis && (
            <p className="mt-3 text-base text-zinc-600">{meta.synopsis}</p>
          )}
          <p className="mt-2 text-sm text-zinc-500">
            共 {stages.length} 關 · 大魔王：{meta?.villain ?? "變異乳牛"} ·
            每關含「開場」「本關任務」「破關台詞」（BOSS 關另有 BOSS 開場與區通關）
            {meta?.storyVersion && (
              <> · 劇情版本 {meta.storyVersion}</>
            )}
          </p>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2">
          {Array.from(byZone.keys())
            .sort((a, b) => a - b)
            .map((zone) => {
              const first = byZone.get(zone)?.[0];
              return (
                <a
                  key={zone}
                  href={`#zone-${zone}`}
                  className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                >
                  第 {zone} 區
                  {first ? ` · ${first.zoneName}` : ""}
                </a>
              );
            })}
        </nav>

        <div className="mt-8 space-y-12">
          {Array.from(byZone.entries())
            .sort(([a], [b]) => a - b)
            .map(([zone, zoneStages]) => (
              <section key={zone} id={`zone-${zone}`}>
                <h2 className="sticky top-0 z-10 border-b border-indigo-200 bg-indigo-50/95 py-3 text-lg font-bold text-indigo-900 backdrop-blur">
                  第 {zone} 區 · {zoneStages[0]?.zoneName}
                  <span className="ml-2 text-sm font-normal text-indigo-600">
                    （第 {zoneStages[0]?.order}–{zoneStages[zoneStages.length - 1]?.order} 關）
                  </span>
                </h2>

                <ol className="mt-4 space-y-6">
                  {zoneStages.map((s) => (
                    <li
                      key={s.stageId}
                      id={s.stageId}
                      className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-lg font-bold text-indigo-950">
                          第 {s.order} 關
                        </span>
                        <span className="font-semibold text-zinc-800">
                          {s.stageName}
                        </span>
                        {s.isBoss && (
                          <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                            BOSS
                          </span>
                        )}
                        <span className="text-xs text-zinc-400">{s.stageId}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        題型：{s.topicType || "—"}（劇情與題目分離，此欄僅供對照）
                      </p>

                      <div className="mt-4 space-y-4">
                        {s.bossIntro && (
                          <StoryField label="BOSS 開場（破關前）" highlight>
                            {s.bossIntro}
                          </StoryField>
                        )}
                        <StoryField label="開場劇情">{s.intro}</StoryField>
                        <StoryField label="本關任務" highlight>
                          {s.mission}
                        </StoryField>
                        <StoryField label="破關台詞">{s.clear}</StoryField>
                        {s.zoneCleared && (
                          <StoryField label="區通關（BOSS 破關後）" highlight>
                            {s.zoneCleared}
                          </StoryField>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500">
          <Link href="/planet/math" className="text-indigo-600 hover:underline">
            到 {MATH_PLANET_NAME} 開始遊玩
          </Link>
          {" · "}
          <Link
            href="/story/math-planet"
            className="text-indigo-600 hover:underline"
          >
            看完整主線摘要
          </Link>
        </p>
      </main>
    </div>
  );
}
