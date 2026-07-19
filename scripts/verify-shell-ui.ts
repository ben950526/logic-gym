/**
 * CI / 本地驗證：MJ 框圖 inset 是否與像素分析一致。
 * 用法：npm run verify:shell-ui
 */
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["tsx", "scripts/analyze-shell-insets.ts"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
