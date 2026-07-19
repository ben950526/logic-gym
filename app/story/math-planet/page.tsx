import { readFile } from "fs/promises";
import Link from "next/link";
import path from "path";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { MATH_PLANET_NAME } from "@/lib/world/planet-names";

function renderMarkdownSimple(md: string) {
  const blocks = md.split(/\n(?=## )/);
  return blocks.map((block, i) => {
    const lines = block.trim().split("\n");
    if (!lines[0]) return null;

    if (lines[0].startsWith("# ")) {
      return (
        <h1 key={i} className="mb-6 text-3xl font-bold text-indigo-950">
          {lines[0].replace(/^# /, "")}
        </h1>
      );
    }

    if (lines[0].startsWith("## ")) {
      const title = lines[0].replace(/^## /, "");
      const body = lines.slice(1).join("\n").trim();
      return (
        <section key={i} className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-indigo-800">{title}</h2>
          <div className="space-y-3 text-base leading-relaxed text-zinc-700">
            {body.split(/\n\n+/).map((para, j) => {
              if (para.startsWith("> ")) {
                return (
                  <blockquote
                    key={j}
                    className="border-l-4 border-amber-400 bg-amber-50/80 px-4 py-3 font-medium text-amber-950"
                  >
                    {para.replace(/^> /gm, "")}
                  </blockquote>
                );
              }
              if (para.startsWith("- ")) {
                const items = para.split("\n").filter((l) => l.startsWith("- "));
                return (
                  <ul key={j} className="list-disc space-y-1 pl-5">
                    {items.map((item, k) => (
                      <li key={k}>{item.replace(/^- /, "")}</li>
                    ))}
                  </ul>
                );
              }
              if (para.startsWith("---")) return null;
              if (para.startsWith("*（")) {
                return (
                  <p key={j} className="text-sm italic text-zinc-500">
                    {para.replace(/^\*|\*$/g, "")}
                  </p>
                );
              }
              return <p key={j}>{para}</p>;
            })}
          </div>
        </section>
      );
    }

    return null;
  });
}

export default async function MathPlanetStoryPage() {
  const session = await getCurrentUserProfile();
  const raw = await readFile(
    path.join(process.cwd(), "content", "story", "math-planet-full-story.md"),
    "utf-8"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {session && <SiteHeader nickname={session.profile.nickname} />}
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/galaxy"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← 回邏輯星系
        </Link>
        <p className="mt-4 text-sm font-medium text-indigo-500">
          純劇情 · 不用破關也能看
        </p>
        <Link
          href="/story/math-planet/stages"
          className="mt-3 inline-flex items-center rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-100"
        >
          逐關檢查 100 關劇情 →
        </Link>
        <article className="mt-6 rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm">
          {renderMarkdownSimple(raw)}
        </article>
        <p className="mt-6 text-center text-sm text-zinc-500">
          想邊玩邊推進，到{" "}
          <Link href="/planet/math" className="text-indigo-600 hover:underline">
            {MATH_PLANET_NAME}
          </Link>{" "}
          開始冒險。
        </p>
      </main>
    </div>
  );
}
