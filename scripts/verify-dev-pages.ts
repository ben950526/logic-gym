/**
 * 確認 dev server 可開（改完 code 後跑，避免只 build 卻 500）。
 * 用法：npm run verify:dev
 * 環境：BASE_URL 預設 http://127.0.0.1:3000
 */
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";

const ROUTES = [
  "/",
  "/pricing",
  "/universe/kindergarten",
  "/universe/kindergarten/galaxy/logic",
  "/universe/grades-3-4/galaxy/logic",
  "/login",
] as const;

async function checkRoute(path: string): Promise<{ ok: boolean; detail: string }> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (res.ok) {
      return { ok: true, detail: `${path} -> ${res.status}` };
    }
    return { ok: false, detail: `${path} -> HTTP ${res.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, detail: `${path} -> ${msg}` };
  }
}

async function main() {
  console.log(`Checking ${BASE} ...\n`);
  const results = await Promise.all(ROUTES.map((p) => checkRoute(p)));
  let failed = false;

  for (const r of results) {
    console.log(r.ok ? `✓ ${r.detail}` : `✗ ${r.detail}`);
    if (!r.ok) failed = true;
  }

  if (failed) {
    console.error(
      "\nDev pages failed. Run reset-dev.bat (or kill port 3000, delete .next, npm run dev)."
    );
    process.exit(1);
  }

  console.log("\nAll dev pages OK.");
}

main();
