"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nodeAt } from "@/lib/puzzles/adventure";
import { randInt } from "@/lib/puzzles/random";
import {
  dayKey, exportBackup, GAME_KINDS, importBackup, mergeSaves, type GameKind, type PlaySave,
} from "@/lib/puzzles/save";
import { sfx } from "@/lib/puzzles/sound";
import { Ico, type IconName } from "@/components/play/icons";

const GAME_INFO: Record<GameKind, { icon: IconName; name: string; skill: string }> = {
  nono: { icon: "nono", name: "數織", skill: "看數字線索推理，一格一格排除" },
  stroke: { icon: "stroke", name: "一筆畫", skill: "先想好路線再動手，練習規劃" },
  sudoku: { icon: "sudoku", name: "數獨", skill: "每列、每行不重複，練習排除法" },
};

/* ───────── 家長關卡：國字題目、填阿拉伯數字 ───────── */
const DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
function zhNumber(n: number): string {
  if (n < 10) return DIGITS[n];
  const t = Math.floor(n / 10), o = n % 10;
  return `${t === 1 ? "" : DIGITS[t]}十${o ? DIGITS[o] : ""}`;
}
const makeQuestion = () => {
  const a = 21 + randInt(29), b = 3 + randInt(7);
  return { text: `${zhNumber(a)} 加 ${zhNumber(b)}`, answer: a + b };
};

/* ───────── 加到主畫面（Android Chrome 會給安裝事件） ───────── */
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let installEvent: InstallEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvent = e as InstallEvent; });
}

/** 某種謎題下一題在第幾級 */
function levelOf(game: GameKind, adv: number): number {
  for (let k = adv; k < adv + 3; k++) { const n = nodeAt(k); if (n.game === game) return n.level; }
  return 1;
}

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

export function ParentZone({ save, onMerge, onClose }: {
  save: PlaySave;
  onMerge: (s: PlaySave) => void;
  onClose: () => void;
}) {
  const [q] = useState(makeQuestion);
  const [ans, setAns] = useState("");
  const [open, setOpen] = useState(false);
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => { if (open) dialogRef.current?.scrollTo({ top: 0 }); }, [open]);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(ans.trim()) === q.answer) { setOpen(true); sfx.tap(); }
    else { setWrong(true); setAns(""); sfx.wrong(); inputRef.current?.focus(); }
  };

  return (
    <div className="lgp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="lgp-parent lgp-chunky" role="dialog" aria-modal="true" aria-label="家長專區">
        <div className="lgp-pz-head">
          <h3><Ico n="parent" /> 家長專區</h3>
          <button className="lgp-key" onClick={onClose} aria-label="關閉"><Ico n="cross" /></button>
        </div>
        {!open ? (
          <form className="lgp-pz-gate" onSubmit={check}>
            <p>這裡是給爸爸媽媽看的。請回答：</p>
            <p className="q">{q.text} 等於多少？</p>
            <input ref={inputRef} inputMode="numeric" pattern="[0-9]*" autoComplete="off" aria-label="答案（填數字）"
              value={ans} onChange={(e) => { setAns(e.target.value.replace(/\D/g, "").slice(0, 3)); setWrong(false); }} />
            {wrong && <p className="err">答案不對，再試一次。</p>}
            <button className="lgp-key go" type="submit">進入</button>
          </form>
        ) : (
          <ParentBody save={save} onMerge={onMerge} />
        )}
      </div>
    </div>
  );
}

function ParentBody({ save, onMerge }: { save: PlaySave; onMerge: (s: PlaySave) => void }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + i);
    const log = save.log[dayKey(d)] ?? {};
    const n = GAME_KINDS.reduce((sum, g) => sum + (log[g] ?? 0), 0);
    return { label: i === 6 ? "今天" : `週${WEEK[d.getDay()]}`, date: `${d.getMonth() + 1}/${d.getDate()}`, n };
  });
  const weekTotal = days.reduce((s, d) => s + d.n, 0);
  const weekDays = days.filter((d) => d.n > 0).length;
  const total = GAME_KINDS.reduce((s, g) => s + save.solved[g], 0);

  // 哪一類最順、哪一類比較常按提示（每類至少解 3 題才判斷）
  const rated = GAME_KINDS.filter((g) => save.solved[g] >= 3).map((g) => ({ g, rate: save.hints[g] / save.solved[g] }));
  rated.sort((a, b) => a.rate - b.rate);
  const best = rated.length >= 2 ? rated[0] : null;
  const hard = rated.length >= 2 && rated[rated.length - 1].rate >= 0.5 ? rated[rated.length - 1] : null;

  return (
    <div className="lgp-pz-body">
      <section>
        <h4>最近 7 天</h4>
        <ol className="lgp-pz-week" aria-label="最近 7 天每天解的題數">
          {days.map((d) => (
            <li key={d.date} className={d.n ? "on" : ""}>
              <span className="n">{d.n || "·"}</span>
              <span className="d">{d.label}</span>
            </li>
          ))}
        </ol>
        <p>這 7 天玩了 <b>{weekDays}</b> 天，解了 <b>{weekTotal}</b> 題。累計解了 <b>{total}</b> 題，冒險地圖走到第 <b>{save.adv + 1}</b> 關。</p>
      </section>

      <section>
        <h4>三種謎題</h4>
        <ul className="lgp-pz-games">
          {GAME_KINDS.map((g) => (
            <li key={g}>
              <span className="ic" aria-hidden="true"><Ico n={GAME_INFO[g].icon} /></span>
              <span className="nm"><b>{GAME_INFO[g].name}</b><small>{GAME_INFO[g].skill}</small></span>
              <span className="st">解了 {save.solved[g]} 題<small>現在第 {levelOf(g, save.adv)} 級・{save.hints[g]} 題用了提示</small></span>
            </li>
          ))}
        </ul>
        <p className="lgp-pz-note">
          {best || hard ? (
            <>
              {best && <>目前最順手的是<b>{GAME_INFO[best.g].name}</b>。</>}
              {hard && hard.g !== best?.g && <><b>{GAME_INFO[hard.g].name}</b>比較常按提示，可以陪孩子一起想一題。</>}
            </>
          ) : "每一種多解幾題以後，這裡會告訴你孩子哪一類最順手、哪一類比較卡。"}
        </p>
      </section>

      <section>
        <h4>給爸爸媽媽</h4>
        <ul className="lgp-pz-tips">
          <li>每天玩 10～15 分鐘就夠了。每解一題，孩子的樹就長大一點。</li>
          <li>每種謎題第一次出現時會有「看我做一次」示範。第一次可以陪孩子一起看。</li>
          <li>題目由程式產生，每一題都驗算過答案只有一個。難度會隨關卡慢慢提高。</li>
          <li>卡住時鼓勵孩子先按「提示」，不用直接告訴答案。</li>
        </ul>
      </section>

      <InstallSection />
      <BackupSection save={save} onMerge={onMerge} />

      <p className="lgp-pz-foot">目前是免費試玩，全部關卡都可以玩。進度存在這台裝置的瀏覽器裡，沒有上傳到任何地方。</p>
    </div>
  );
}

function InstallSection() {
  const [env, setEnv] = useState<"standalone" | "ios" | "android" | "other">("other");
  const [canPrompt, setCanPrompt] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setEnv(standalone ? "standalone" : /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "ios" : /Android/.test(ua) ? "android" : "other");
    setCanPrompt(!!installEvent);
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    installEvent = null;
    setCanPrompt(false);
  };

  return (
    <section>
      <h4>加到手機主畫面</h4>
      {env === "standalone" ? (
        <p><Ico n="check" /> 已經加到主畫面了，孩子點圖示就能直接玩。</p>
      ) : (
        <>
          <p>加到主畫面後，孩子點圖示就能直接開，不用找網址；iPhone 上也比較不會因為很久沒開而清掉進度。</p>
          {canPrompt && <button className="lgp-key go" onClick={install}><Ico n="phone" /> 加到主畫面</button>}
          {!canPrompt && (
            <ul className="lgp-pz-tips">
              {env !== "android" && <li><b>iPhone／iPad（Safari）</b>：按下方的「分享」按鈕 → 選「加入主畫面」。</li>}
              {env !== "ios" && <li><b>Android（Chrome）</b>：按右上角「⋮」→ 選「加到主畫面」或「安裝應用程式」。</li>}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function BackupSection({ save, onMerge }: { save: PlaySave; onMerge: (s: PlaySave) => void }) {
  const code = useMemo(() => exportBackup(save), [save]);
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState<{ text: string; err: boolean } | null>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch { codeRef.current?.select(); document.execCommand?.("copy"); }
    setCopied(true);
  };
  const restore = () => {
    const other = importBackup(paste);
    if (!other) { setMsg({ text: "這段備份碼讀不出來，請確認有完整複製（開頭是 LG1-）。", err: true }); return; }
    const merged = mergeSaves(save, other);
    onMerge(merged);
    setPaste("");
    setMsg({ text: `已經合併好了：現在有 ${merged.stars} 滴水，走到第 ${merged.adv + 1} 關。`, err: false });
  };

  return (
    <section>
      <h4>進度備份</h4>
      <p>換手機、換瀏覽器或清除瀏覽紀錄，進度會不見。可以先把備份碼複製起來（傳給自己的 LINE 或記事本），到新裝置貼上就能接著玩。</p>
      <textarea ref={codeRef} className="lgp-pz-code" readOnly value={code} rows={3} aria-label="這台裝置的備份碼"
        onFocus={(e) => e.currentTarget.select()} />
      <button className="lgp-key" onClick={copy}>{copied ? <><Ico n="check" /> 已複製</> : <><Ico n="copy" /> 複製備份碼</>}</button>
      <label className="lgp-pz-label" htmlFor="lgp-restore">從別的裝置接過來：</label>
      <textarea id="lgp-restore" className="lgp-pz-code" rows={2} placeholder="把備份碼貼在這裡" value={paste}
        onChange={(e) => { setPaste(e.target.value); setMsg(null); }} />
      <button className="lgp-key" disabled={!paste.trim()} onClick={restore}><Ico n="merge" /> 合併進度</button>
      {msg && <p className={msg.err ? "err" : "ok"} role="status">{msg.text}</p>}
      <p className="lgp-pz-small">合併只會讓進度變多，不會把這台裝置上的進度蓋掉。</p>
    </section>
  );
}
