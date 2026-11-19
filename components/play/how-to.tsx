"use client";

import { Ico } from "@/components/play/icons";
import type { GameKind } from "@/lib/puzzles/save";
import { speak } from "@/lib/puzzles/speech";

function DemoRow({ label, cells }: { label: string; cells: string }) {
  return (
    <div className="lgp-demo-row">
      <span className="dl">{label}</span>
      {cells.split("").map((c, i) => (
        <span key={i} className={c === "1" ? "dc on" : "dc"} />
      ))}
    </div>
  );
}

const BODY: Record<GameKind, React.ReactNode> = {
  nono: (
    <>
      <ol>
        <li><b>目標</b>：把對的格子塗滿，全部塗對會拼出一張圖！</li>
        <li><b>左邊的數字</b>＝那一橫列要塗幾格。「4」就是有 4 格<b>連在一起</b>。</li>
        <li>
          <b>數字只算塗的格子，空格不寫出來。</b>有兩個數字就是兩段，兩段中間一定要隔開（空 1 格或更多格都可以）。例如「2 2」＝塗 2 格、空開、再塗 2 格。順序從左到右。
        </li>
        <li><b>上面的數字</b>規則一樣，改成那一直行，由上往下看。「0」＝那一行一格都不塗。</li>
        <li>點格子＝塗滿，再點一次＝取消。確定不塗的格子，可以開「打叉」做記號。</li>
      </ol>
      <div className="lgp-demo">
        <span className="lgp-demo-cap">範例 1：5 格寬寫「2 2」→ 中間只能空 1 格，只有這一種：</span>
        <DemoRow label="2 2" cells="11011" />
      </div>
      <div className="lgp-demo">
        <span className="lgp-demo-cap">範例 2：6 格寬寫「2 2」→ 有三種可能，要看上面的數字才知道：</span>
        <DemoRow label="2 2" cells="110110" />
        <DemoRow label="2 2" cells="110011" />
        <DemoRow label="2 2" cells="011011" />
      </div>
      <p className="lgp-tip">小撇步：先找最大的數字。5 格寬寫「5」，那一列一定全部塗滿！塗對的那一列，數字會變淡。</p>
    </>
  ),
  stroke: (
    <>
      <ol>
        <li><b>目標</b>：像拿一支筆畫圖，<b>筆不離開紙</b>，把每一條線都畫過一次。</li>
        <li>先點一個圓點當起點，它會變黃色，代表筆尖在這裡。</li>
        <li>再點一個<b>有線連著</b>的圓點，筆就畫過去。</li>
        <li>畫過的線<b>不能再畫</b>。所有線都變色就過關。</li>
        <li>走到沒路了就按「重來」，換一個起點試試。</li>
      </ol>
      <p className="lgp-tip">小撇步：數數看每個圓點連著幾條線。起點選錯，怎麼畫都會剩下線。</p>
    </>
  ),
  sudoku: (
    <>
      <ol>
        <li><b>目標</b>：把空格填滿，只能填 1、2、3、4。</li>
        <li>每一<b>橫列</b>：1、2、3、4 各出現一次。</li>
        <li>每一<b>直行</b>：也是各一次。</li>
        <li>每個<b>粗線框起來的 2×2 小方塊</b>：也是各一次。</li>
        <li>先點空格（出現黃框），再點下面的數字。和別人重複的數字會變紅。</li>
      </ol>
      <p className="lgp-tip">小撇步：找一列（或一行、一個小方塊）已經有 3 個數字的，缺的那個就是答案。</p>
    </>
  ),
};

/** 給語音朗讀用的口語版說明 */
const SPOKEN: Record<GameKind, string> = {
  nono: "把對的格子塗滿，就會拼出一張圖。左邊的數字是這一排要塗幾格，上面的數字是這一行要塗幾格。有兩個數字，就是兩段，中間要空開。點格子就會塗滿，再點一次就取消。",
  stroke: "像拿一支筆畫圖，筆不離開紙，把每一條線都畫過一次。先點一個圓點當起點，再點有線連著的圓點。畫過的線不能再畫。走不下去就按重來。",
  sudoku: "把空格填滿一、二、三、四。每一排、每一行、每一個粗線框起來的小方塊，一、二、三、四都只能出現一次。先點空格，再點下面的數字。",
};

/** 第一次玩會自動跳出示範，所以這裡平常都收起來，忘記時再點開 */
export function HowTo({ game, onDemo }: { game: GameKind; onDemo?: () => void }) {
  return (
    <details className="lgp-howto">
      <summary><Ico n="question" /> 忘記怎麼玩？點這裡</summary>
      <div className="lgp-keys" style={{ justifyContent: "flex-start", margin: "8px 0 2px" }}>
        {onDemo && <button className="lgp-key" onClick={onDemo}>👀 看示範</button>}
        <button className="lgp-key" onClick={() => speak(SPOKEN[game])}><Ico n="sound" /> 念給我聽</button>
      </div>
      {BODY[game]}
    </details>
  );
}
