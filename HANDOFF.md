# Logic Gym 交接文件（Cursor → Claude Code）

> **2026-11-17 方向更新（V3）**：放棄「劇情破關＋人工美術」，改做「互動謎題本」：
> 程式產生、驗算過唯一解的數織／一筆畫／數獨，加上寵物「腦腦」與圖鑑。
> - 新遊戲頁：`/play`（首頁 `/` 直接導過去；舊首頁在 `/old-home`，舊星球地圖程式都還在）
> - 謎題引擎：`lib/puzzles/`；驗證：`npm run verify:puzzle-engine`
> - 介面：`components/play/`、`app/play/play.css`
> - 規劃：`docs/roadmap-2026-11.md`；設計：`docs/design-direction.md`；市場：`docs/market-research-2026-11.md`
> - 分支：`v3-puzzle-book` 已合併到 `main`，2026-11-17 部署到正式網址 https://logic-gym-khaki.vercel.app
> - 已加入：每日任務（3 題）、連續天數、寶箱、腦腦衣櫃（12 件）、「看我做一次」示範、語音朗讀
> - 進度目前只存在瀏覽器（訪客模式），還沒接 Supabase。
>
> 以下第 1～9 節是 11/16 接手時的盤點，部分內容（產品定位、下一步）已被上面取代。

> 寫於 2026-11-16。上一次在 Cursor 開發是 2026-07-20 深夜，中間停了約四個月。
> 程式就在 `C:\邏輯思考網站\logic-gym` 原地，Cursor 和 Claude Code 都能開。

---

## 1. 這個產品是什麼

**Logic Gym（邏輯思考練功平台）**：給小孩每天玩一兩關的「破關式」邏輯／數學遊戲網站。

- **玩法**：像 LINE Rangers 一樣有地圖，一關一關破。每關 1 題，答對過關、解鎖下一關，配主線劇情（小光小隊、乳牛星球、大魔王「變異乳牛」）。
- **世界觀架構**：宇宙（依年齡）→ 星系（依主題）→ 星球（100 關，分 10 區 × 10 關，每區有 Midjourney 畫的地圖）。
- **目標客群**（2026-07-20 最後一次調整）：**幼稚園到小四**，賣點是「家長讓小孩每天玩一兩關，增加思考能力」。家長在旁陪玩，題目不必假設小孩識字，但要清楚。
- **商業模式**：免費玩乳牛星球前 20 關，第 21 關起跳訂閱牆，**NT$99／月**。收款方式是**人工轉帳 + 後台手動開通**（使用者沒有信用卡，暫不用 Stripe；Stripe 程式保留但隱藏）。

## 2. 目前完成度

| 項目 | 狀態 | 說明 |
|------|------|------|
| 登入／註冊（Supabase Auth） | ✅ 有 | Email 登入，`/auth/callback` |
| 宇宙 → 星系 → 星球 架構 | ✅ 有（未提交 git） | 3 個宇宙：幼兒（可玩）、低年級（未開放）、中年級（可玩） |
| 乳牛星球（中年級，數學） | ✅ 100 關 | 10 區地圖都有 Midjourney 圖；劇情完整 |
| 規律星球（中年級） | ✅ 8 關 | 需付費 |
| 幼兒規律星球 `pattern-k` | ✅ 100 關（未提交 git） | 7/20 最後一晚由 Cursor 一口氣生成 85 題，**使用者還沒驗收** |
| 關卡進度存檔 | ✅ | `stage_progress` 表（migration 008） |
| 首頁（小光欄 / 出發去 / 訂閱區） | ✅（未提交 git） | 有 6 個星系按鈕，其中多數是「假設的」佔位星系 |
| 訂閱牆 + 會員方案頁 + 人工匯款說明 | ✅ 程式有（未提交 git） | 匯款帳號等要填 `MANUAL_PAYMENT_*` 環境變數，目前沒填 |
| Admin 後台（審題、會員改方案） | ✅ | `/admin/puzzles`、`/admin/members` |
| 出題流程與自動審題腳本 | ✅ | `content/PUZZLE-AUTHORING-WORKFLOW.md`、`npm run verify:*` |
| 舊版練功／積分賽／EXP／稱號 | ⏸ 程式在，隱藏中 | `lib/feature-flags.ts` 的 `V2_GALAXY_MODE = true` |
| 真實玩家 | ❌ 0 | 沒有對外推廣過 |
| 收到過的付款 | ❌ 0 | |

**最大的落差**：Vercel 上線的版本只到 7/19 的 git commit（乳牛星球 100 關 + 規律 8 關）。之後 7/19～7/20 做的**宇宙架構、新首頁、訂閱牆、幼兒 100 關**全部**還沒 commit、也沒部署**（約 29 個修改檔、36 個新檔，+3600 行）。

## 3. 能不能跑（2026-11-16 檢查結果）

| 檢查 | 結果 |
|------|------|
| `npm install` | 不需要，`node_modules` 已在 |
| `npx tsc --noEmit` | ✅ 沒有型別錯誤 |
| `npm run dev` | ✅ 本機 http://localhost:3000 首頁正常 |
| `npm run check:mvp` | ❌ **Supabase 連不上**：網域 `ldrngblqxgoljwvkheiw.supabase.co` 已查無此網域 → 專案被**暫停**（免費版閒置一週就會暫停） |
| 登入、星系、關卡頁 | ❌ 要等 Supabase 恢復才能用（都需要登入和讀題庫） |
| 線上版 | https://logic-gym-khaki.vercel.app 還開著（首頁可開；登入同樣因 Supabase 暫停而無法用） |

**恢復 Supabase**：登入 Supabase Dashboard → 專案 → 按 Restore。依 Supabase 目前官方說明，暫停後 **1 年內**都能在後台恢復（舊規則是 90 天，官方頁面有些還沒更新）。這個專案大約 7 月底暫停，應在期限內。

> ⚠️ `.env.vercel` 裡的 `NEXT_PUBLIC_APP_URL` 寫的是 `logic-gym.vercel.app`，但那是**別人的網站**（標題「Logic Gym | Trailblazer」）。你的實際網址是 `logic-gym-khaki.vercel.app`，要改正，否則 Email 登入回調會跳到別人網站。

## 4. 帳號與服務

| 服務 | 帳號 | 狀態 | 建議 |
|------|------|------|------|
| **GitHub** | `ben950526`（commit email 是私人信箱 benten950526） | repo `ben950526/logic-gym` 是**公開**的 | 程式裡沒有洩漏金鑰（已掃過 git 歷史）。但題庫、劇情、商業設定都公開可抄 → 建議**改成 Private**。要不要轉到創業帳號見下方。 |
| **Supabase** | 尚未確認（登入時確認），很可能是私人帳號 | 專案暫停中 | |
| **Vercel** | 尚未確認，很可能是私人帳號（用 GitHub 登入） | 線上版仍在 | |
| Midjourney | 使用者付費帳號 | 畫地圖素材用 | |

**是否改用創業帳號 blazeatlas.studio＠gmail.com？**
建議：**要改，但等確定要繼續做這個產品再改**，順序是 GitHub repo 轉移（Settings → Transfer，Vercel 重新連 repo）→ Vercel 專案轉移 → Supabase 用「邀請成員 + 轉移組織 Owner」的方式，資料不用搬。這些都是帳號設定，必須由使用者本人操作，Claude 不會自己改。

## 5. 安全問題（建議盡快處理）

1. **Supabase 的 service role 金鑰曾貼在 Cursor 聊天裡**（2026-06-30），而且到現在還在用。這把金鑰能繞過所有權限讀寫整個資料庫。恢復專案後建議到 Supabase → Settings → API Keys **換一把新的**，再更新 `.env.local` 和 Vercel 環境變數。
2. **後台密碼 `ADMIN_SECRET` 還是當初的示範值**，也曾出現在 Cursor 聊天，而且很好猜。上線收錢前一定要換成長的隨機字串（本機和 Vercel 都要換）。

## 6. 技術債

- **大量程式沒 commit**：Cursor 最後兩天的成果只存在這台電腦上，硬碟壞了就沒了。建議第一件事就是 commit（並把 repo 改私有）。
- **文件過時**：`content/stages/planet-map-v1.md` 還寫「數學星球 8 關」，實際是 100 關；README 沒提到宇宙架構和幼兒星球。
- **佔位內容**：首頁 6 個星系大多是假設的；低年級宇宙沒有題目。家長看到點不進去的按鈕會覺得產品不完整。
- **幼兒 100 關品質未驗收**：使用者在 Cursor 裡多次抓到幼兒題的問題（換皮重複、選項看不懂、BOSS 題答案不唯一），最後 85 題是一次大量生成，雖過了自動審題但沒人看過。
- **開發時常出現 Internal Server Error**：多半是 `.next` 快取壞掉，`reset-dev.bat` 是當時的解法。
- **migration 有重複版本**（`001_puzzles.sql`、`001_puzzles_full_ascii.sql`、`001_puzzles_step2_only.sql`），新環境容易跑錯。
- **沒有自動化測試**，只有 `verify:*` 檢查腳本。
- **Vercel 的 `NEXT_PUBLIC_APP_URL` 寫錯**（見第 3 節）。

## 7. Cursor 時期的脈絡摘要（從聊天紀錄整理）

| 日期 | 做了什麼 |
|------|----------|
| 6/30 | 建好 Next.js + Supabase、題庫、Admin；做登入與練功解題 |
| 7/1～7/5 | 嫌 AI 題目品質差 → 改由 Cursor 出題、使用者貼範例偵探題；加 EXP／等級、稱號、積分賽（限時）；決定 NT$99／月、人工收款 |
| 7/17 | **大轉向**：客群改國小、改成 LINE Rangers 式破關制、星球主題；數學星球 100 關、完整劇情；「數學星球」改名「乳牛星球」、魔王「變異乳牛」 |
| 7/17～7/18 | 嫌 UI 太陽春、AI 感重 → 用 Midjourney 畫 10 區地圖、角色、對話框等素材（見 `docs/midjourney-asset-brief.md`） |
| 7/19 | 推上 GitHub、部署 Vercel、跑完 P0 煙霧測試；隱藏完整劇情；決定前 20 關免費、21 關起訂閱 |
| 7/20 | 新首頁、訂閱方案頁；文字壓在圖上一直跑版 → 改回純 CSS；客群再改成**幼稚園～小四**；加「宇宙」層；做幼兒規律星球，訂出出題流程，最後一口氣出完 100 關 |

**使用者一再強調的原則**（之後開發要延續）：

- 每次改完要自己用玩家角度檢查，確定網頁打得開才交付，不要叫使用者幫忙驗。
- 題型要真的不同，不能只換 emoji／數字（「換皮」）。
- 題目畫面極簡：只放題目圖 + 一句問題。
- 劇情要連貫、小學生看得懂；劇情和題目分開，不要硬套。
- 原則改了，要同步更新出題流程文件和審題腳本。
- 一律繁體中文。

## 8. 建議的下一步

詳細比較見對話中的報告。不論選哪個方向，都要先做這些前置工作：

1. 恢復 Supabase 專案，跑 `npm run check:mvp` 確認通過。
2. commit 目前所有程式，把 GitHub repo 改成 Private。
3. 換 service role 金鑰和 `ADMIN_SECRET`，修正 `NEXT_PUBLIC_APP_URL`。

## 9. 常用指令

```bash
npm run dev            # 本機開發 http://localhost:3000
npm run check:mvp      # 檢查 Supabase 與 108 關是否就緒
npm run verify:kindergarten-quality   # 幼兒題自動審題
npx tsc --noEmit       # 型別檢查
```

Claude Code 的瀏覽器預覽設定在 `.claude/launch.json`（名稱 `logic-gym`）。
