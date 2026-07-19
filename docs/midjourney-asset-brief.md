# Logic Gym · Midjourney 完整使用手冊

> 風格：你提供的 **卡通乳牛太空圖**（粗描邊、賽璐珞、手遊 splash、飽和色）  
> 官方規則來源：[Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List) · [Aspect Ratio](https://docs.midjourney.com/hc/en-us/articles/31894244298125-Aspect-Ratio) · [Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)  
> **還沒統一的美術清單 → [十、美術統一進度總表](#十美術統一進度總表)**

---

## 零、Midjourney 規則（必讀，避免再報錯）

### Prompt 結構（固定格式）

```
[英文畫面描述，可以很長，可以有逗號] [參數全部放最後]
```

### 五條鐵則

| # | 規則 | 錯誤示例 | 正確示例 |
|---|------|----------|----------|
| 1 | **參數只能在最後** | `... --ar 3:4 cartoon style ...` | `... cartoon style ... --ar 3:4` |
| 2 | **--ar 是寬:高，英文冒號** | `--ar 3/4` `--ar 3：4` `--ar 1080x1440` | `--ar 3:4` |
| 3 | **參數裡不要標點** | `--ar 3:4,` `--sref url,` | `--ar 3:4 --sref URL` |
| 4 | **-- 前要有空格** | `poppies--ar 3:4` | `poppies --ar 3:4` |
| 5 | **參數之間用空格** | `--ar3:4` | `--ar 3:4` |

### Midjourney 做不到的事（別寫進 prompt 期待自動完成）

| 想要 | 現實 |
|------|------|
| 透明 PNG | ❌ MJ 不輸出 alpha，按鈕需洋紅底 + remove.bg |
| 精確 1080×1440 px | ❌ 只有比例 `--ar`，像素靠 Upscale |
| 圖上關卡數字 | ❌ 會亂，數字由網站程式疊 |

### 本專案固定參數尾綴

**背景（10 區）— 複製貼到每條 prompt 最後：**
```
--ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

**按鈕（4 種）— 複製貼到每條 prompt 最後：**
```
--ar 1:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters watermark
```

**Shell · 全屏背景 — 複製貼到 prompt 最後：**
```
--ar 9:16 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI letters numbers
```

**Shell · 橫向 UI 條／按鈕（寬按鈕、章節條、HUD）— 複製貼到 prompt 最後：**
```
--ar 3:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters watermark logo
```

**Shell · 去背物件（頭像、星球卡、按鈕）— 複製貼到 prompt 最後：**
```
--ar 1:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters watermark
```
（橫向主按鈕改用 `--ar 3:1`，星球卡可用 `--ar 4:3`）

> 第 10 區 BOSS 背景可把 `--sw 100` 改成 `--sw 120`  
> 若 V6.1 風格不像參考圖，加 `--sv 4`  
> **省用量：** 預設 `/relax`，每項只 U 一張，不要 Upscale（見下方第九節）

---

## 一、一次性準備（只做一次）

### Step 1 · 上傳風格參考圖

**Midjourney 網站 (midjourney.com)：**
1. 登入付費帳號
2. 把你的 **紫宇宙乳牛** 圖上傳到 Discord 或 MJ 圖床（需公開 URL）
3. 在瀏覽器打開圖片 → 複製圖片連結（結尾 `.png` / `.jpg`）
4. 記下這個 URL，下面所有 prompt 的 `替換成你的URL` 都換成它

**Discord 方式：**
1. 發圖到任意頻道
2. 右鍵圖片 → 複製連結
3. 連結類似 `https://cdn.discordapp.com/attachments/.../xxx.png`

### Step 2 · 建資料夾（已建好，直接丟檔即可）

```
logic-gym/public/assets/
├── zones/              ← 10 區關卡背景
├── shell/              ← 星系、星球卡、頭像、框條（★ 現在優先）
└── ui/
    ├── buttons/        ← 主／次按鈕（最後做）
    └── nodes/          ← 關卡圓圈 4 種（最後做）
```

**不知道放哪？** 打開 `public/assets/README.md` 查表。

### Step 3 · 書籤本檔案

以後只打開本檔案，複製 prompt，不用再來問 AI。

---

## 二、每次生圖的 6 步流程

```
① 複製下方「完整 prompt」（一整行）
② 打開 Midjourney → Imagine / Create
③ 貼上 → 檢查 URL 已替換 → 發送
④ 等 4 張出圖 → 選最好的一張 → Upscale (U1-U4)
⑤ 下載大圖
⑥ 背景 → 存 zones/ 或 shell/｜去背物件 → remove.bg → 存 shell/ 或 ui/buttons/ 或 ui/nodes/
```

### 背景儲存

- 檔名見第三節表格
- 格式 PNG 或 WebP 均可
- **不要去背**

### 按鈕去背（唯一必要後製，約 10 秒）

1. 打開 https://www.remove.bg
2. 拖入按鈕圖
3. 下載 PNG → 存對應資料夾（見 `public/assets/README.md`）

---

## 三、檔名對照

| 區 | 中文 | 儲存為 | 資料夾 |
|----|------|--------|--------|
| 1 | 登陸補給區 | `zone-01-landing.png` | `zones/` |
| 2 | 能源通訊站 | `zone-02-signal.png` | `zones/` |
| 3 | 圖書記錄塔 | `zone-03-library.png` | `zones/` |
| 4 | 農場交易市 | `zone-04-market.png` | `zones/` |
| 5 | 工程時間港 | `zone-05-harbor.png` | `zones/` |
| 6 | 折扣比例域 | `zone-06-bazaar.png` | `zones/` |
| 7 | 分配餘數庫 | `zone-07-warehouse.png` | `zones/` |
| 8 | 邏輯推理所 | `zone-08-logic.png` | `zones/` |
| 9 | 綜合遠征線 | `zone-09-expedition.png` | `zones/` |
| 10 | 變異牧場核心 | `zone-10-boss.png` | `zones/` |

| 按鈕 | 儲存為 | 資料夾 |
|------|--------|--------|
| 可挑戰 | `stage-node-available.png` | `ui/nodes/` |
| 已過關 | `stage-node-cleared.png` | `ui/nodes/` |
| 未解鎖 | `stage-node-locked.png` | `ui/nodes/` |
| BOSS | `stage-node-boss.png` | `ui/nodes/` |

### Shell UI（路線 1 · 去 AI 感外殼）

| 素材 | 中文 | 儲存為 | 資料夾 | 去背 |
|------|------|--------|--------|------|
| 邏輯星系背景 | 星系選關整頁 | `galaxy-bg.png` | `shell/` | ❌ |
| 乳牛星球選關 | 可點星球卡 | `planet-math.png` | `shell/` | ✅ 建議 |
| 小光頭像 | 主角 bust | `portrait-xiaoguang.png` | `shell/` | ✅ 必須 |
| 主按鈕（金） | 繼續冒險／遠征 | `ui-btn-gold.png` | `ui/buttons/` | ✅（最後做） |
| 次按鈕（木） | 劇情連結等 | `ui-btn-ghost.png` | `ui/buttons/` | ✅（最後做） |
| 對話框底 | 劇情文字框 | `ui-panel-dialogue.png` | `shell/` | 視情況 |
| 章節條底 | 第一章橫幅 | `ui-chapter-banner.png` | `shell/` | ❌ |
| **題目面板** | **關卡題目／答題區** | **`ui-panel-puzzle.png`** | **`shell/`** | **❌** |
| **任務條** | **本關任務** | **`ui-panel-mission.png`** | **`shell/`** | **❌** |
| **遠征主卡** | **星球頁遠征進度卡** | **`ui-panel-expedition.png`** | **`shell/`** | **❌** |
| HUD 頂條 | 頂部裝飾條 | `ui-hud-bar.png` | `shell/` | ❌ |

> **副檔名只留一個 `.png`**，不要存成 `xxx.png.png`  
> 區域背景一律放 `zones/`，不要去背

**Shell 素材放好後** 在 Cursor 跟我說：`Shell UI 好了` 或逐項說 `金按鈕好了`

---

## 四、完整 Prompt（直接複製）

> 用法：整段複製 → 替換 `替換成你的URL` → 發送。  
> 不要改行、不要在 `--ar` 後面再加英文。

---

### 區 1 · 登陸補給區 `zone-01-landing.png`

```
cartoon game zone map background, peaceful cow ranch landing zone at dawn, rolling green hills, wooden fence, small barn, windmill in distance, winding dirt path through meadow, fluffy clouds, soft golden sunlight, round cartoon asteroids as playful props, tiny glowing stars, whimsical mobile RPG stage select splash, empty center path for level nodes, warm green and sky blue palette, cartoon mobile game illustration, thick clean outlines, soft cel shading, vibrant saturated colors, polished casual game art, full scene not isolated, no text no UI no watermark --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI letters
```

---

### 區 2 · 能源通訊站 `zone-02-signal.png`

```
cartoon game zone map background, energy communication station on a hill, tall signal tower with blinking lights, orange sunset sky, green hills, winding path to tower, cartoon craters and meteors, glowing yellow stars, mobile RPG stage map splash, warm orange and green tones, thick clean outlines, soft cel shading, vibrant colors, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

---

### 區 3 · 圖書記錄塔 `zone-03-library.png`

```
cartoon game zone map background, ancient library record tower, giant books forming a tower, magical purple twilight sky, winding stone path, floating paper scrolls, round cartoon moons and asteroids, glowing stars, fantasy mobile game map, purple lavender palette, thick outlines cel shading, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

---

### 區 4 · 農場交易市 `zone-04-market.png`

```
cartoon game zone map background, lively farm trading market, colorful market stalls, hay bales, cartoon cows in background, bright blue sky, festive banners without readable text, winding market path, cute round asteroids, sparkling stars, cheerful mobile game stage background, green yellow red accents, thick outlines cel shading, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

---

### 區 5 · 工程時間港 `zone-05-harbor.png`

```
cartoon game zone map background, engineering time harbor dock, wooden pier over turquoise water, gears and clock towers, steampunk lite cartoon, winding boardwalk path, round crater rocks, glowing stars, mobile RPG map splash, teal blue wood brown palette, thick outlines cel shading, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

---

### 區 6 · 折扣比例域 `zone-06-bazaar.png`

```
cartoon game zone map background, discount bazaar alley, playful sale signs without readable text, stacked gift boxes, orange yellow striped tents, winding cobblestone path, cartoon asteroids like balloons, sparkling stars, casual mobile game shop zone, warm orange palette, thick outlines cel shading, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

---

### 區 7 · 分配餘數庫 `zone-07-warehouse.png`

```
cartoon game zone map background, remainder warehouse zone, cute cartoon storage warehouse with colorful crates, conveyor belt, winding path between shelves, muted brown grey with colorful accents, round cartoon rocks, soft stars, mobile game map, thick outlines cel shading, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

---

### 區 8 · 邏輯推理所 `zone-08-logic.png`

```
cartoon game zone map background, logic puzzle institute maze, floating geometric platforms, abstract question mark shapes not readable text, purple blue mystical sky, winding floating path, cartoon asteroids, glowing constellation stars, puzzle adventure mobile game zone, thick outlines cel shading, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

---

### 區 9 · 綜合遠征線 `zone-09-expedition.png`

```
cartoon game zone map background, epic expedition sky route, winding path up floating islands, tall sky tower in distance, dramatic clouds, blue silver palette, cartoon meteors and craters, bright golden stars, heroic mobile RPG zone map, thick outlines cel shading, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI
```

---

### 區 10 · 變異牧場核心 `zone-10-boss.png`

```
cartoon game zone map background, mutant ranch boss core zone, deep purple cosmic nebula sky, giant mutant cartoon cow boss silhouette in clouds, cracked ground, red purple energy, round crater asteroids everywhere, glowing yellow stars, ominous cute mobile game final boss map, thick outlines cel shading, full scene not isolated, no text no UI --ar 3:4 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 120 --no text watermark logo UI
```

---

## 五、按鈕 Prompt（4 種）

> 全部含 `solid bright magenta background` → remove.bg 一鍵去背  
> **禁止** MJ 畫數字

---

### 可挑戰 `stage-node-available.png`

```
cartoon mobile game stage level node button, circular wooden badge with golden rim, white cream empty center circle for number overlay, soft cel shading thick outline, subtle golden glow, polished game UI asset, isolated single object centered, solid bright magenta background, no text no numbers no letters --ar 1:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters watermark
```

---

### 已過關 `stage-node-cleared.png`

```
cartoon mobile game stage level node button cleared state, circular wooden golden badge, small green checkmark badge on top right corner, warm golden glow, thick outline cel shading, isolated single object centered, solid bright magenta background, no text no numbers --ar 1:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters
```

---

### 未解鎖 `stage-node-locked.png`

```
cartoon mobile game stage level node button locked state, circular grey stone badge with padlock icon in center, muted desaturated colors, thick outline, isolated single object centered, solid bright magenta background, no text no numbers --ar 1:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters
```

---

### BOSS 關 `stage-node-boss.png`

```
cartoon mobile game boss stage node button, larger circular badge, orange red fiery rim, small cartoon horn emblem not scary, boss level UI asset, thick outline cel shading, isolated single object centered, solid bright magenta background, no text no numbers --ar 1:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters
```

---

## 六、建議執行順序（最省事）

### 階段 A · 關卡地圖（已完成）

| 順序 | 做什麼 | 目的 |
|------|--------|------|
| 1 | 區 1–10 背景 | 關卡地圖真圖 ✅ |
| 2 | 4 種關卡節點按鈕（可選） | 圓圈也換 sprite |

### 階段 B · Shell UI（路線 1 · 現在要做）

> **按鈕最後做**：現有 CSS 按鈕堪用，MJ 用量留給視覺落差更大的項目。  
> 關卡圓圈 sprite（第五節 4 種）也一併延後，有餘量再做。

| 優先 | 做什麼 | 存檔 | 效益 | 改哪頁 |
|------|--------|------|------|--------|
| **★1** | 乳牛星球選關圖 | `planet-math.png` | 最高（取代 🐄 Emoji 卡片） | `/galaxy` |
| **★2** | 小光頭像 | `portrait-xiaoguang.png` | 高（取代 Emoji 角色框） | `/galaxy` |
| **★3** | 邏輯星系背景 | `galaxy-bg.png` | 高（整頁從 CSS 星空的升級） | `/galaxy` |
| **4** | 對話框底 | `ui-panel-dialogue.png` | 中（劇情區去網頁感） | 星系、星球 |
| **5** | 章節條底 | `ui-chapter-banner.png` | 中 | `/stage/*` |
| **6** | **題目面板** | **`ui-panel-puzzle.png`** | **高（題目區去表單感）** | **`/stage/*`** |
| **7** | **任務條** | **`ui-panel-mission.png`** | **中（本關任務去黃 CSS 感）** | **`/stage/*`** |
| **8** | **遠征主卡** | **`ui-panel-expedition.png`** | **高（星球頁主卡統一）** | **`/planet/math`** |
| **9** | HUD 頂條 | `ui-hud-bar.png` | 低～中（錦上添花） | 全站 |
| **最後** | 金／次按鈕 + 關卡節點 4 種 | `ui-btn-*.png` `stage-node-*.png` | 可選 | 有餘量再做 |

**省用量建議：** 先做 ★1–★3（3 次 Relax job），滿意就停；4–9 視余量追加。  
**完整未統一清單** → 見 **「十、美術統一進度總表」**（按頁面逐項盤點）。

每完成一項 → 丟對應資料夾（見 `public/assets/README.md`）→ 跟我說「星球卡好了」等，我幫你接 code。  
**階段 B 告一段落** → 跟我說：`Shell UI 好了（不含按鈕）`

---

## 十、美術統一進度總表

> **盤點日期：** 2026-07-18  
> **統一目標：** 木框 + 金釘 + 米色 parchment（以 `ui-panel-dialogue.png` 為 `--sref` 基準），不要 Tailwind 白卡／紫漸層／網頁表單感。

### 狀態圖例

| 符號 | 意思 |
|------|------|
| ✅ | MJ 素材已上傳 **且** 程式已接上 |
| ⏳ | MJ 素材 **已有**，但某頁仍用舊 CSS／`theme="game"`（只須改 code） |
| 📋 | **待生 MJ**（prompt 見本文件 B5 節） |
| 🎨 | **維持 CSS** 即可（太小或動態太多，不值得 MJ） |
| — | 尚未開始／非本季範圍 |

### A · 已統一（✅）

| 區塊 | 素材檔 | 程式位置 | 出現頁面 |
|------|--------|----------|----------|
| 邏輯星系背景 | `shell/galaxy-bg.png` | `GameShell` `backgroundSrc` | `/galaxy` |
| 乳牛星球選關卡 | `shell/planet-math.png` | `PlanetCard` `--art` | `/galaxy` |
| 小光頭像框 | `shell/portrait-xiaoguang.png` | `CharacterCompanion` | `/galaxy` |
| 劇情對話框 | `shell/ui-panel-dialogue.png` | `StoryBubble` `theme="adventure"` `--art` | `/stage/*` |
| 章節橫幅 | `shell/ui-chapter-banner.png` | `ChapterBanner` `theme="adventure"` `--art` | `/stage/*` |
| 題目／答題面板 | `shell/ui-panel-puzzle.png` | `StagePuzzlePlayer` `theme="adventure"` | `/stage/*` |
| 本關任務條 | `shell/ui-panel-mission.png` | `MissionPrompt` `theme="adventure"` `--art` | `/stage/*` |
| 遠征主卡 | `shell/ui-panel-expedition.png` | `PlanetExpeditionHeader` `--art` | `/planet/math` |
| 10 區關卡地圖底 | `zones/zone-01` … `zone-10` | `StagePathMap` `map-zone-scene--art` | `/planet/math` |

### B · 素材已有、程式還沒全接（⏳ · 只改 code，不用新 MJ）

| 區塊 | 已有素材 | 現況 | 狀態 |
|------|----------|------|------|
| 章節橫幅 @ 星球／星系 | `ui-chapter-banner.png` | 已改 `theme="adventure"` | ✅ |
| 劇情對話 @ 星系／星球 | `ui-panel-dialogue.png` | 已改 `theme="adventure"` | ✅ |

### C · 仍為 CSS／Emoji，風格未統一（❌ · 需 MJ 或 CSS 仿木牌）

#### `/galaxy` 邏輯星系

| 區塊 | 現況 | 建議 | 優先 |
|------|------|------|------|
| 頂部 HUD（返回、暱稱、進度條） | CSS `game-hud` | 📋 `ui-hud-bar.png` 或 CSS 加深木質 | 低 |
| 序章說明面板 | CSS `GamePanel` 灰框 | 🎨 改木框 CSS，或併入對話框 | 低 |
| 主／次按鈕（繼續冒險、劇情連結） | CSS `game-btn-gold`／`ghost` | 📋 `ui/buttons/ui-btn-*.png`（最後做） | 最低 |
| 小光角色卡外框 | 頭像 MJ ✅，外框仍 CSS | 🎨 CSS 仿木框即可 | 低 |

#### `/planet/math` 乳牛星球

| 區塊 | 現況 | 建議 | 優先 |
|------|------|------|------|
| **遠征主卡**（星球名、副標、進度條、繼續遠征） | MJ `ui-panel-expedition.png` + 星球卡 overlay | ✅ 已接 | — |
| 繼續遠征按鈕 | CSS 金漸層 `GameButton` | 📋 `ui-btn-gold.png`（可選） | 中 |
| 劇情連結列（完整主線／逐關檢查） | CSS 木色底條 | ✅ 基本款已統一 | — |
| 分區路牌 W1–W10 | CSS `map-zone-sign` | 🎨 仿木牌 CSS（或日後 MJ 橫條） | 低 |
| 關卡節點圓圈 | CSS 圓形 + 數字 | 📋 `ui/nodes/stage-node-*.png` ×4（可選） | 最低 |
| 寶箱／裝飾 icon | CSS／Unicode | 🎨 維持 | — |

#### `/stage/[stageId]` 關卡頁

| 區塊 | 現況 | 建議 | 優先 |
|------|------|------|------|
| **本關任務** | MJ `ui-panel-mission.png` | ✅ 已接 | — |
| 題型標籤（數學推理／數字填空／簡單） | CSS 木／金 pill | ✅ 基本款已統一 | — |
| 分區路牌 W* | CSS `StageZoneHeader` | 🎨 同星球頁路牌 | 低 |
| 送出答案／再試／下一關按鈕 | CSS `game-btn-gold` 等 | 📋 `ui-btn-gold.png`（最後做） | 中 |
| 答題輸入框 | CSS 米色 input（已調） | 🎨 維持 CSS | — |
| 過關慶祝 `StageClearCelebration` | CSS parchment 基本款 | ✅ 已統一 | — |
| 解題思路區 | CSS parchment 基本款 | ✅ 已統一 | — |

#### 全站共用

| 區塊 | 現況 | 建議 |
|------|------|------|
| `GameShell` 外框 @ adventure | CSS 漸層暗底 | 🎨 可維持（襯 MJ 框圖） |
| `GameHud` @ adventure | CSS 半透明條 | 📋 `ui-hud-bar.png`（錦上添花） |
| 登入／管理／練習頁 | 一般 Tailwind | — 非本季遊戲 UI 範圍 |

### D · 待生 MJ 素材一覽（📋）

| 優先 | 檔名 | 用途 | Prompt 章節 | 已上傳？ |
|------|------|------|-------------|----------|
| **★ 高** | `ui-panel-expedition.png` | 星球頁遠征主卡 | B5e | ✅ |
| **★ 高** | `ui-panel-mission.png` | 關卡頁本關任務 | B5d | ✅ |
| 中 | `ui-hud-bar.png` | 頂部 HUD 裝飾 | B5f | ❌ |
| 最低 | `ui-btn-gold.png` | 主按鈕 | 第五節 | ❌ |
| 最低 | `ui-btn-ghost.png` | 次按鈕 | 第五節 | ❌ |
| 可選 | `ui/nodes/stage-node-*.png` ×4 | 關卡圓圈 | 第五節 | ❌ |

### E · 已上傳 shell 素材（2026-07-18）

```
shell/galaxy-bg.png
shell/planet-math.png
shell/portrait-xiaoguang.png
shell/ui-panel-dialogue.png
shell/ui-chapter-banner.png
shell/ui-panel-puzzle.png
shell/ui-panel-mission.png
shell/ui-panel-expedition.png
```

### F · 建議執行順序（最省 MJ 次數）

1. ~~**不用新 MJ：** 星球頁／星系頁劇情框改接已有 MJ~~ → ✅ 已完成（2026-07-18）  
2. ~~**CSS 基本款：** 遠征卡／任務條／題型 pill／過關慶祝／解題框~~ → ✅ 已完成（暫代，待 MJ 替換高優先項）  
3. **再 2 張 MJ（高優先）：** `ui-panel-mission.png` → `ui-panel-expedition.png`  
4. **有餘量再做：** HUD 條 → 金／次按鈕 → 關卡節點 sprite  

### G · 不能「一張 MJ 搞定全部」的原因

| 元件 | 大致比例 | 為何不能共用一張 |
|------|----------|------------------|
| 對話框 | 4:3 橫 | 與題目板比例不同 |
| 章節條 | 3:1 扁橫 | 太扁，裁切會切到木框 |
| 任務條 | 4:1 更扁 | 同上 |
| 題目板 | 3:4 直 | 與橫條完全相反 |
| 遠征主卡 | 4:5 直寬 | 需獨立 inset |

**風格統一靠 `--sref` 指向 `ui-panel-dialogue.png` + `--sw 120`，不是靠裁一張大圖。**

---

## 七、常見報錯對照

| 報錯 | 原因 | 修法 |
|------|------|------|
| Aspect ratio should be width:height | `--ar` 格式錯或寫在中間 | 改 `--ar 3:4` 放最後 |
| Invalid parameter | 參數裡有逗號/中文冒號 | 檢查 `--sref URL` 後無逗號 |
| 風格不像參考圖 | sref URL 無效或 sw 太低 | 換有效 URL，`--sw 120` |
| 圖上有亂碼文字 | MJ 常犯 | 重 roll 或加強 `--no text letters` |

---

## 八、Discord 專用寫法（若你在 Discord 生圖）

```
/imagine prompt: [貼上第四節整段 prompt]
```

網站版：**不要**加 `/imagine prompt:`，直接貼 prompt 正文即可。

---

## 九、省用量備忘（每次生圖前看）

1. Discord 輸入 **`/relax`**（或網站設定預設 Relax）→ 不扣 Fast 時數  
2. **1 次 prompt = 4 張 grid**，挑 1 張按 **U1–U4** 即可，不要 4 張都 Upscale  
3. **不要 Reroll 超過 1 次**；不滿意再重送  
4. **MJ 不能一次只出 1 張**，這是正常行為  
5. 去背用 remove.bg，不要在 MJ 浪費 Upscale

---

## 十、Shell UI 完整 Prompt（路線 1 · 直接複製）

> 用法同第四節：整段複製 → 替換 `替換成你的URL` → Relax 模式發送 → U 一張 → 去背（若需）→ 存對應資料夾（`shell/` 或 `ui/buttons/`）  
> **禁止 MJ 畫中文或按鈕文字**，文字由網站程式疊。

---

### B1a · 主按鈕（金） `ui-btn-gold.png`

```
cartoon mobile game primary action button UI asset, wide horizontal golden wooden game button with thick orange gold rim, empty smooth cream center panel for text overlay, chunky bottom shadow, polished casual RPG CTA button, cel shading thick clean outline, isolated single object centered, solid bright magenta background, no text no numbers no letters no icons --ar 3:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters watermark
```

→ remove.bg → 存 `ui/buttons/ui-btn-gold.png`

---

### B1b · 次按鈕（木） `ui-btn-ghost.png`

```
cartoon mobile game secondary button UI asset, wide horizontal dark wooden button with subtle gold trim, empty flat center panel for text overlay, softer than primary button, casual RPG menu button, cel shading thick outline, isolated single object centered, solid bright magenta background, no text no numbers no letters --ar 3:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters watermark
```

→ remove.bg → 存 `ui/buttons/ui-btn-ghost.png`

---

### B2 · 乳牛星球選關 `planet-math.png`

```
cartoon mobile game planet selection card, cute cartoon cow planet floating in space, green continents shaped like ranch, purple cosmic nebula background behind planet, golden glow ring around planet, playful round asteroids and tiny stars, planet select screen hero asset for math world, thick outlines cel shading vibrant colors, isolated single composition centered, solid bright magenta background, no text no UI no watermark --ar 4:3 --v 6.1 --stylize 220 --sref 替換成你的URL --sw 100 --no text numbers letters watermark logo
```

→ remove.bg（若外圈要透明）→ 存 `shell/planet-math.png`

---

### B3 · 小光頭像 `portrait-xiaoguang.png`

```
cartoon mobile game character portrait bust, young brave space explorer kid protagonist, friendly smile, small cartoon space helmet with gold visor, navy blue suit with orange accents, upper body bust only, companion hero portrait for dialogue UI, thick clean outlines soft cel shading, vibrant colors matching cow space game, isolated single character centered, solid bright magenta background, no text no watermark --ar 1:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text letters watermark
```

→ remove.bg → 存 `shell/portrait-xiaoguang.png`

---

### B4 · 邏輯星系背景 `galaxy-bg.png`

```
cartoon mobile game galaxy map splash screen background, deep purple cosmic space with glowing nebula, multiple cute cartoon planets floating at different depths, tiny cow constellation joke, round crater asteroids and golden stars scattered, empty calm areas for UI overlay top and bottom, logic galaxy hub screen, whimsical LINE Rangers style map select, thick outlines cel shading saturated colors, full vertical mobile splash not isolated, no text no UI no watermark no buttons --ar 9:16 --v 6.1 --stylize 250 --sref 替換成你的URL --sw 100 --no text watermark logo UI letters numbers
```

→ 不去背 → 存 `shell/galaxy-bg.png`

---

### B5a · 對話框底 `ui-panel-dialogue.png`

```
cartoon mobile game dialogue text box panel, wide horizontal wooden sign frame with cream parchment center empty for text, small decorative rivets, subtle golden trim, RPG story dialogue UI frame, thick outlines cel shading, isolated single UI panel centered, solid bright magenta background OR full opacity wooden panel, no readable text no letters --ar 4:3 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text letters watermark
```

→ 存 `shell/ui-panel-dialogue.png`

---

### B5b · 章節條底 `ui-chapter-banner.png`

```
cartoon mobile game chapter title banner strip, long horizontal wooden scroll banner with empty center for chapter title text, golden edge nails, adventure RPG chapter header UI, warm brown gold palette, thick outlines cel shading, full width banner asset not isolated on white, no readable text no letters --ar 3:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text letters watermark logo
```

→ 不去背 → 存 `shell/ui-chapter-banner.png`

---

### B5c · 題目面板 `ui-panel-puzzle.png`

> **用途：** 關卡頁題目區外框，取代現有 CSS 雙層卡片 + 白底 input 的「表單感」。  
> **風格：** 必須跟 `ui-panel-dialogue.png` 同系列（同一套木框、金釘、米色 parchment）。  
> **比例：** 直式偏高，留足題目＋選項／輸入＋按鈕的空白區；中間 parchment 要**大**，不要像小對話框。

**版面示意（給 MJ，圖上不要出現文字）：**

```
┌─────────────────────────┐
│ ■ 木框 + 金釘（上）      │
│ ┌─────────────────────┐ │
│ │  米色 parchment      │ │  ← 題目標題 + 題幹（上 55%）
│ │  （空白）            │ │
│ │                      │ │
│ │  ─ ─ ─ ─ ─ ─ ─ ─   │ │  ← 可選淡分隔（不要真文字）
│ │  留白給輸入／選項    │ │  ← 答題區（下 30%）
│ └─────────────────────┘ │
│ ■ 木框（下，可略厚）     │
└─────────────────────────┘
```

**建議 `--ar`：** `3:4`（直式）；若題幹常很長可改 `2:3`。

```
cartoon mobile game puzzle question panel UI frame, tall vertical wooden sign board matching dialogue box style, thick weathered brown wood frame with four golden round rivets at corners, large empty cream parchment scroll center panel for question text and answer area, subtle inner shadow where parchment meets wood, optional faint horizontal divider line in parchment without any readable text, bottom area of parchment slightly lighter for input zone, same purple wood plank backdrop as dialogue panel optional, adventure RPG math puzzle UI frame, thick clean outlines soft cel shading, polished LINE Rangers casual mobile game UI, single centered UI panel asset, no readable text no letters no numbers no math symbols no watermark --ar 3:4 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text letters numbers watermark logo UI
```

**若風格跟對話框不像：** 用同一張 `ui-panel-dialogue.png` 當 `--sref`，`--sw 120` 再 roll 1–2 次。

→ 不去背 → 存 `shell/ui-panel-puzzle.png`  
→ 放好後跟我說：**「題目面板好了」**（我會量 inset 並接到 `/stage/*`）

---

### B5d · 任務條 `ui-panel-mission.png`

> **用途：** 關卡頁「本關任務」橫條，取代現有黃 CSS 卡片。  
> **比例：** 比章節條 **更扁**（約 4:1），左側可留小圖示區（程式放 📜 或之後換 icon）。

```
cartoon mobile game mission quest banner UI panel, wide short horizontal wooden sign strip matching dialogue box style, thick brown wood frame with small golden rivets corners, long empty cream parchment center for two lines of mission text, left side small square parchment inset for scroll icon overlay, subtle golden trim, same purple wood plank backdrop as dialogue panel, adventure RPG daily quest bar, thick outlines cel shading LINE Rangers style, single UI panel centered, no readable text no letters no icons drawn --ar 4:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 120 --no text letters numbers watermark logo UI
```

→ 不去背 → 存 `shell/ui-panel-mission.png`  
→ 放好後跟我說：**「任務條好了」**

---

### B5e · 遠征主卡 `ui-panel-expedition.png`

> **用途：** 星球頁 `/planet/math` 頂部大卡片（星球名、副標、進度條、繼續遠征按鈕疊在下方）。  
> **比例：** 直式略寬 `--ar 4:5` 或 `--ar 3:4`；中間 parchment **要大**，右側可留空白給星球插圖 overlay（沿用 `planet-math.png`）。

```
cartoon mobile game expedition status card UI panel, tall wide vertical wooden board matching dialogue box style, thick weathered brown frame golden corner rivets, large empty cream parchment center for planet title subtitle and progress text, bottom third slightly lighter parchment zone for primary button overlay, optional empty circular medallion area on right side for planet mascot overlay without drawing cow, purple wood plank background consistent with other UI panels, adventure RPG planet map header card, thick outlines cel shading polished casual mobile game, single centered UI panel asset, no readable text no letters no numbers no mascot drawn --ar 4:5 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 120 --no text letters numbers watermark logo UI
```

→ 不去背 → 存 `shell/ui-panel-expedition.png`  
→ 放好後跟我說：**「遠征主卡好了」**

---

### B5f · HUD 頂條 `ui-hud-bar.png`

```
cartoon mobile game top HUD bar strip, dark wood and metal hybrid status bar frame, empty center area for nickname and progress, subtle gold trim, space adventure game header UI, thick outlines cel shading, horizontal bar asset, no readable text no numbers no icons --ar 3:1 --v 6.1 --stylize 200 --sref 替換成你的URL --sw 100 --no text numbers letters watermark
```

→ 不去背 → 存 `shell/ui-hud-bar.png`

---

### Shell 選做 · 關卡節點 4 按鈕

若關卡圓圈也要換 sprite，用第五節既有 4 條 prompt，存 `ui/nodes/` 同檔名。
