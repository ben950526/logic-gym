# 題目出題流程（Logic Gym 標準作業）

> **目標**  
> 1. 參考市面標準與例題（對照能力，不抄題）  
> 2. AI 交付前自行反覆迭代至優良品質  
> 3. 自動化 + 人工最終確認，避免「做完才給使用者試」

**適用**：幼兒宇宙、乳牛星球、規律星球及後續所有關卡題庫。

---

## 流程總覽

```
0 立項 → 1 對照標準 → 2 能力藍圖 → 3 例題基準 → 4 草稿
    → 5 AI 三輪自審 → 6 自動化閘門 → 7 交付包 → 8 你驗收 → 9 seed
```

**鐵律**：未跑完 Phase 5～6，**禁止**對使用者說「可以玩了」。

**原則變更必同步**：凡調整出題／UI／審題「原則」，必同一輪更新  
`PUZZLE-AUTHORING-WORKFLOW.md`、`puzzle-quality-rules.ts`、相關 `verify:*` 腳本、`.cursor/rules/puzzle-authoring.mdc`（無需使用者每次提醒）。

---

## Phase 0｜立項（5 分鐘）

填寫：

| 欄位 | 範例 |
|------|------|
| 星球 / 年段 | pattern-k / K 幼 |
| 關數 | 10 |
| 是否識字 | 否 |
| 參考文件 | `kindergarten-curriculum-v1.md` |
| 交付檔 | `content/generated/kindergarten-logic-k.json` |

---

## Phase 1｜對照公開標準與市面（必做）

### 1A 公開課綱／能力（只對照能力，不抄題）

- 台灣《幼兒園課程大綱》：量、規律、分類、資料整理
- 國小：108 課綱數學領域（中年級星球用）

### 1B 市面產品（只對照「題型與 UX」）

記錄於 `content/stages/*-curriculum-v1.md`：

- **學**：一關一能力、視覺優先、選項數、提示怎麼寫
- **不學**：題幹原文、插圖、語音檔

### 1C 版權紅線

- [ ] 無整題／整段照抄外部題庫、App、書籍
- [ ] 例題只作「題型標竿」，重新設計 visual 與選項
- [ ] 若將來用 CC 授權素材，記錄授權與署名

---

## Phase 2｜能力藍圖（先於出題）

產出 **能力 → 關卡 → topicType** 表（見 `kindergarten-curriculum-v1.md`）。

檢查：

- [ ] 每關對應**唯一**能力代碼
- [ ] 無「換皮」（同規則換 emoji／顏色）
- [ ] 難度曲線：1–7 單一規則 → 8–9 稍綜合 → 10 BOSS 延伸已學
- [ ] BOSS **不引入**未教過的新規則

---

## Phase 3｜例題基準（每題型 1 題金樣）

每種 topicType 先寫 **1 題金樣**，含：

```yaml
abilityCode: K-P1
topicType: 雙色交替
visualPrompt: "（含閱讀方向符號）"
uniqueAnswerWhy: "藍後面只能是紅，因為只有兩色輪流"
distractorWhy: "綠／黃從未出現，接不起來"
kidFailureMode: "可能點藍，因以為要重複上一個"
parentReadAloud: "..."
```

**金樣通過後**才批量寫其餘關卡。

---

## Phase 4｜草稿產出

- 格式：`content/generated/*.json`，符合 `lib/puzzle-validation.ts`
- 幼兒題必填：`kindergarten`, `visualPrompt`, `parentReadAloud`
- **圖文分層**（幼兒 visual）：
  - `visualPrompt` 接龍／序數題：只放 **圖示 + →／⬇️**（例：`🐱 → 🐶 → 🐰`）
  - 題意只用 **一句 `question`**（去掉 `（幼兒題：…）` 前綴後顯示）
  - 例外：分組題可用 ①②③；比多少可用「左邊／右邊」
- **作答 UI**（所有題型）：畫面只顯示 **visual（若有）+ question**；不顯示 `parentReadAloud`、`hint`
- `parentReadAloud`、`hint` 仍寫在 JSON，供 Phase 5 自審與解題說明，**不上屏**
- 關卡綁定：`planet-map-v1.json` 的 `puzzleTitle` 一致
- 內部 title（如 `K幼-紅藍交替`）不給幼兒看；UI 用 `stage.name`

---

## Phase 5｜AI 三輪自審（交付前必做，不可跳過）

> 由出題 AI **自行執行**，每輪修正 JSON 後再進下一輪。  
> 三輪都過才可進 Phase 6。

### 第一輪｜結構與歧義

對**每一題**自問并修正：

1. 套用規則後，是否**只有一個**選項合理？（寫出「第二合理答案」；若有 → 改題）
2. **題意與選項**是否清楚？（家長陪玩時，看題目＋選項就懂；可用短中文）
3. 序列方向是否清楚？（→ / ⬇️ / ↔，且不與題目 emoji 混淆）
4. 選項是否避免純符號？（👈 ⚖️ 🤷 須改成「左邊比較多」等文字）
5. 干擾項是否「太像第二個正解」？（如 1-2-3 下一個是 4 還是回到 1）
6. BOSS 是否只用已學規則？

### 第二輪｜對照藍圖

1. topicType 是否與 `*-curriculum-v1.md` 一致且无重复？
2. 是否落入「ABAB 换皮」？
3. `explanation` / `explanationSteps` 是否与 visual 一致（无手搓矛盾）？
4. `correctIndex` 是否指向 intended option？

### 第三輪｜家長陪玩視角（模擬）

家長在旁念題、孩子指選項，逐關走一遍：

1. 看 **題目圖 + 題目文字 + 選項**，30 秒內懂要做什么？
2. 選項有沒有「看不懂的符號」？
3. 會不會誤點「也許對」的選項？

**任一轮失败 → 回到 Phase 4 改题 → 重跑该轮。**

### 自審紀錄（交付時附簡表）

| 關 | 能力 | 唯一解自證（一句） | 三輪 |
|----|------|-------------------|------|
| 1 | K-P1 | 藍後必紅 | ✓✓✓ |

---

## Phase 6｜自動化閘門

```bash
npm run verify:puzzle-delivery
```

包含：

| 檢查 | 指令 |
|------|------|
| JSON schema | validate（含在 delivery 内） |
| 幼兒 10 關結構 | verify:kindergarten-k |
| 幼兒品質規則 | verify:kindergarten-quality |
| 幼兒顯示邏輯 | verify:kindergarten-display |
| 數學 100 關（若動到） | verify:math-100 |

**任一失败 → 不得 seed。**

---

## Phase 7｜交付包（给你之前 AI 必须准备好）

1. 更新后的 JSON + planet-map（如有）
2. 自审简表（Phase 5）
3. 变更摘要：改了什么、为何改
4. 已执行 `npm run seed:puzzles -- --upsert`（或明确说明仅本地、未写 DB）
5. **不声称「完成」除非 Phase 6 全绿**

---

## Phase 8｜你的驗收（人工）

你只需 spot-check：

- [ ] 随机 2 关完整玩一遍
- [ ] BOSS 关是否公平
- [ ] 地图顺序／分区是否符合产品策略

不通过 → 回到 Phase 4，**不算 AI 交付完成**。

---

## Phase 9｜上架与回归

```bash
npm run seed:puzzles -- --file <path> --status verified --upsert
```

- 改 planet-map 后：开发模式已每次重读 JSON；仍建议 hard refresh
- 记录版本：在 curriculum 文件或 commit message 注明 `content v1.x`

---

## 你没提到、但必须加的要求

| 类别 | 要求 |
|------|------|
| **版權** | 只参考题型；禁止未授权搬运 |
| **唯一解** | 每题 written proof，不只靠直觉 |
| **可及性** | 題意／選項用短中文＋圖示；家長陪玩；色盲題避免只靠顏色 |
| **装置** | emoji 在 iOS/Android 显示测过；序列不宜过长 |
| **家長** | `parentReadAloud` + hint 供 Phase 5 自審；**作答 UI 不顯示** |
| **UI 契约** | 内部 `puzzle.title` 不露出；作答屏只顯示 visual + 一句 question |
| **图文分层** | `visualPrompt` 序列区：图+箭头；题意只在 `question` 一句 |
| **地图** | 規律星球 100 關、10 區 × 10 關、topicType 唯一（见 verify:kindergarten-k） |
| **DB** | 用 `--upsert`，避免旧 content 缺字段 |
| **回归** | 改题后跑 verify:puzzle-delivery |
| **迭代纪律** | 用户反馈歧义题 → 记入「禁止模式」并更新 quality 脚本 |
| **难度** | 不混「循环」与「递增」在同一题 unless BOSS 且已教 |
| **数据** | 将来可接：每题错误率，找出需重做的题 |
| **扩展** | 新关先更新 curriculum 能力表，再出題 |

---

## 禁止模式清单（来自已踩坑）

1. ABAB 换皮当多关
2. 1→2→3 下一個是 1 還是 4 歧義
3. 用 emoji ➡️ 分隔 ⬆️⬇️ 題（看成上右下右）
4. 找不同题加 → 序列箭頭
5. 比多少用 ⚖️「一样多」当选项
6. 未 upsert 导致 DB 缺 `visualPrompt`
7. planet-map 缓存导致改了地图画面不变（dev 已修）
8. 未审即 seed，直接给用户试
9. 把「第 N 个」等序数文字写进 visual 序列（图文层级混淆；序数应在 question）
10. 作答 UI 重复显示 parentReadAloud / hint / 冗长说明（只留 visual + 一句 question）

---

## 相关文件

- `content/stages/kindergarten-curriculum-v1.md` — K 幼能力对照
- `content/stages/math-planet-100-curriculum.md` — 数学 100 关
- `content/REVIEW-STANDARDS.md` — 国小题型评分
- `lib/kindergarten/puzzle-quality-rules.ts` — 幼兒自动化规则
