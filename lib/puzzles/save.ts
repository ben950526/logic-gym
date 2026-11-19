/** 玩家進度（訪客先存在這台裝置；之後登入再同步到 Supabase） */
export type GameKind = "nono" | "stroke" | "sudoku";
export const GAME_KINDS: GameKind[] = ["nono", "stroke", "sudoku"];

/** 某一天各種謎題解了幾題 */
export type DayLog = Partial<Record<GameKind, number>>;

export interface PlaySave {
  solved: Record<GameKind, number>;
  stars: number; // 樹喝到的水滴數（= 成長值）
  dex: string[]; // 拼過的數織圖案（下一題就換新圖案）
  muted: boolean;
  seenDemo: GameKind[]; // 看過示範的謎題
  adv: number; // 冒險路線圖已經走過幾個點
  hints: Record<GameKind, number>; // 各種謎題有幾題用過提示（每題最多算一次，給家長看哪一類比較卡）
  log: Record<string, DayLog>; // "YYYY-MM-DD" → 那天解了幾題（只留最近 LOG_DAYS 天）
}

const KEY = "logic-gym-play-v1";
export const LOG_DAYS = 60;

export const emptySave = (): PlaySave => ({
  solved: { nono: 0, stroke: 0, sudoku: 0 },
  stars: 0,
  dex: [],
  muted: false,
  seenDemo: [],
  adv: 0,
  hints: { nono: 0, stroke: 0, sudoku: 0 },
  log: {},
});

/** 這台裝置的當地日期 "YYYY-MM-DD" */
export function dayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const nonNeg = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
const isGame = (g: unknown): g is GameKind => GAME_KINDS.includes(g as GameKind);
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function perGame(v: unknown): Record<GameKind, number> {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return { nono: nonNeg(o.nono), stroke: nonNeg(o.stroke), sudoku: nonNeg(o.sudoku) };
}

/** 只留最近 LOG_DAYS 天（照日期字串排序即可） */
function trimLog(log: Record<string, DayLog>): Record<string, DayLog> {
  const keys = Object.keys(log).sort().slice(-LOG_DAYS);
  return Object.fromEntries(keys.map((k) => [k, log[k]]));
}

/** 把任何來源（localStorage、備份碼、雲端）的資料整理成合法的存檔；舊版多出來的欄位直接丟掉 */
export function normalizeSave(raw: unknown): PlaySave {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const log: Record<string, DayLog> = {};
  if (s.log && typeof s.log === "object") {
    for (const [k, v] of Object.entries(s.log as Record<string, unknown>)) {
      if (!DAY_RE.test(k)) continue;
      const g = perGame(v);
      const day: DayLog = {};
      for (const kind of GAME_KINDS) if (g[kind]) day[kind] = g[kind];
      if (Object.keys(day).length) log[k] = day;
    }
  }
  return {
    solved: perGame(s.solved),
    stars: nonNeg(s.stars),
    dex: Array.isArray(s.dex) ? [...new Set(s.dex.filter((x): x is string => typeof x === "string"))] : [],
    muted: !!s.muted,
    seenDemo: Array.isArray(s.seenDemo) ? [...new Set(s.seenDemo.filter(isGame))] : [],
    adv: nonNeg(s.adv),
    hints: perGame(s.hints),
    log: trimLog(log),
  };
}

/**
 * 合併兩份存檔，不會掉進度：所有進度欄位都只增不減，所以取大的、取聯集。
 * muted 是這台裝置的偏好，用 a（本機）的。
 */
export function mergeSaves(a: PlaySave, b: PlaySave): PlaySave {
  const maxGame = (x: Record<GameKind, number>, y: Record<GameKind, number>) =>
    ({ nono: Math.max(x.nono, y.nono), stroke: Math.max(x.stroke, y.stroke), sudoku: Math.max(x.sudoku, y.sudoku) });
  const log: Record<string, DayLog> = {};
  for (const k of new Set([...Object.keys(a.log), ...Object.keys(b.log)])) {
    const x = a.log[k] ?? {}, y = b.log[k] ?? {};
    const day: DayLog = {};
    for (const g of GAME_KINDS) {
      const v = Math.max(x[g] ?? 0, y[g] ?? 0);
      if (v) day[g] = v;
    }
    log[k] = day;
  }
  return {
    solved: maxGame(a.solved, b.solved),
    stars: Math.max(a.stars, b.stars),
    dex: [...new Set([...a.dex, ...b.dex])],
    muted: a.muted,
    seenDemo: [...new Set([...a.seenDemo, ...b.seenDemo])],
    adv: Math.max(a.adv, b.adv),
    hints: maxGame(a.hints, b.hints),
    log: trimLog(log),
  };
}

/** 解開一題：記到總數和今天的紀錄 */
export function recordSolve(s: PlaySave, game: GameKind, today = dayKey()): Pick<PlaySave, "solved" | "log"> {
  const day = s.log[today] ?? {};
  return {
    solved: { ...s.solved, [game]: s.solved[game] + 1 },
    log: trimLog({ ...s.log, [today]: { ...day, [game]: (day[game] ?? 0) + 1 } }),
  };
}

export function loadSave(): PlaySave {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalizeSave(JSON.parse(raw)) : emptySave();
  } catch {
    return emptySave();
  }
}

export function writeSave(s: PlaySave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 無痕模式等情況存不了，遊戲照樣能玩 */
  }
}

/* ───────── 備份碼（還沒有帳號前，換裝置或清資料時用） ───────── */

const BACKUP_PREFIX = "LG1-";

export function exportBackup(s: PlaySave): string {
  const { muted: _muted, ...data } = s;
  void _muted;
  const json = JSON.stringify(data);
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return BACKUP_PREFIX + b64;
}

/** 讀備份碼；格式不對回傳 null */
export function importBackup(code: string): PlaySave | null {
  const t = code.trim().replace(/\s+/g, "");
  if (!t.startsWith(BACKUP_PREFIX)) return null;
  try {
    const bin = atob(t.slice(BACKUP_PREFIX.length));
    const json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== "object") return null;
    return normalizeSave(obj);
  } catch {
    return null;
  }
}
