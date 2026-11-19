# 家長帳號與雲端存檔：設計規格（2026-11-18）

> 狀態：**只有規格，還沒實作**。決定是開始收費前，帳號、雲端存檔、付款一起做（方案 B）。
> 如果之後發現有小孩連續玩很多天，iPhone Safari「7 天沒打開就清資料」的風險變大，就提早實作「雲端存檔」這一塊。

## 1. 目前的狀況（2026-11-18）

- 進度只存在瀏覽器的 localStorage，key 是 `logic-gym-play-v1`。內容（`lib/puzzles/save.ts` 的 `PlaySave`）：

  | 欄位 | 意思 | 會不會變少 |
  |------|------|-----------|
  | `stars` | 樹的水滴數 | 只增不減 |
  | `adv` | 冒險地圖走到第幾關 | 只增不減 |
  | `solved` | 三種謎題各解幾題 | 只增不減 |
  | `dex` | 拼過的圖案名稱 | 只增不減（集合） |
  | `seenDemo` | 看過示範的謎題 | 只增不減（集合） |
  | `hints` | 三種謎題各有幾題用過提示（2026-11-19 加） | 只增不減 |
  | `log` | 每天各種謎題解幾題，只留最近 60 天（2026-11-19 加） | 每天每種取 max |
  | `muted` | 靜音 | 會切換（偏好設定） |

- 換裝置、清瀏覽器資料、無痕模式都會讓進度不見。
- 舊的 Cursor 時期已經有 Supabase 登入（email＋密碼）和 `profiles` 表（`plan` 欄位 `free`／`paid`），在 `app/login/`、`lib/supabase/`、`supabase/migrations/`。Supabase 專案目前暫停中。

## 2. 原則

1. **不登入也能玩**：小孩打開就能玩，現在的訪客模式保留。
2. **帳號屬於家長**，不是小孩。小孩不需要打字、不需要記密碼。
3. **一個家長帳號底下可以有好幾個小孩**，每個小孩有自己的一棵樹和自己的進度。
4. **付費狀態綁在家長帳號上**，底下所有小孩都適用。
5. **離線也能玩**：遊戲照樣讀寫這台裝置的存檔，有網路時才同步到雲端。
6. **只收必要的資料**：家長的 email；小孩只存一個暱稱，不收真實姓名、生日、照片。

## 3. 登入方式

| 方式 | 決定 | 說明 |
|------|------|------|
| email 登入連結（不用密碼） | ✅ 第一版 | Supabase 內建（magic link／一次性驗證碼）。家長不用記密碼。 |
| Google 登入 | ✅ 第一版 | Supabase 內建。需要到 Google Cloud 建 OAuth 用戶端（使用者操作）。 |
| LINE 登入 | ⏳ 之後再評估 | Supabase 沒有內建 LINE，需要額外處理，實作前再查最新做法。 |
| email＋密碼（舊程式） | ❌ 拿掉 | 換成上面兩種，減少「忘記密碼」的客服。 |

### 家長關卡

「登入」「付款」「管理小孩」這些按鈕前面，先問一題大人才會的問題，避免小孩亂按。例如：「請輸入 三十七 加 五 的答案」（用國字寫題目、要求填阿拉伯數字）。

## 4. 什麼時候請家長登入

- **樹長到「小樹」（6 滴水）時**：過關畫面多一行「請爸爸媽媽登入，把你的樹保存起來 🌳」，按下去先過家長關卡。只提醒，不擋著玩；之後每長大一個階段最多再提醒一次。
- **「我的樹」頁面最下面**：一直有「👨‍👩‍👧 家長專區」入口（登入、管理小孩、付費）。
- **碰到付費內容時**：免費和付費的分界還沒決定（看 `docs/roadmap-2026-11.md`），到時候在那一關請家長登入並付款。

## 5. 資料表（Supabase）

```sql
-- 家長（沿用舊表）
profiles (
  id uuid primary key references auth.users,   -- 家長
  nickname text,
  plan text default 'free' check (plan in ('free','paid')),
  paid_until timestamptz,                       -- 新增：付費到期日（人工轉帳開通時填）
  created_at timestamptz
)

-- 新增：小孩
children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 12),  -- 暱稱
  sort smallint not null default 0,
  created_at timestamptz not null default now()
)
-- 一個家長最多 4 個小孩（用 trigger 或在伺服器端檢查）

-- 新增：每個小孩的存檔
child_saves (
  child_id uuid primary key references children on delete cascade,
  save jsonb not null,           -- 跟 localStorage 一樣的 PlaySave
  schema_version int not null default 1,
  updated_at timestamptz not null default now()
)
```

### 權限（RLS）

- `children`、`child_saves`：家長只能讀寫自己底下的小孩（`parent_id = auth.uid()`）。
- `profiles.plan`、`paid_until`：**只能由後台（service role）修改**。

> ⚠️ 舊的 `002` migration 有「Users insert own profile」政策，家長自己建 profile 時，可能可以直接把 `plan` 填成 `paid`。
> 實作時要改成：註冊後由資料庫 trigger 自動建 profile（`plan` 固定 `free`），並拿掉這個 insert 政策。

## 6. 同步方式

### 存在裝置上

- 訪客：`logic-gym-play-v1`（跟現在一樣）。
- 登入後：每個小孩一份，`logic-gym-play-v1:<child_id>`。另外記住這台裝置「目前是哪個小孩在玩」。

### 合併規則（不會有衝突）

所有進度欄位都是「只增不減」，所以兩份存檔合併時取大的、取聯集，就不會掉進度：

```
merge(a, b) = {
  stars:    max(a.stars, b.stars),
  adv:      max(a.adv, b.adv),
  solved:   每種謎題各取 max,
  dex:      a.dex ∪ b.dex,
  seenDemo: a.seenDemo ∪ b.seenDemo,
  hints:    每種謎題各取 max,
  log:      每一天、每種謎題各取 max（只留最近 60 天）,
  muted:    取這台裝置的設定（不同步）
}
```

- ✅ 已完成（2026-11-19）：純函式 `mergeSaves(a, b)` 在 `lib/puzzles/save.ts`，驗證腳本已測：合併後每個欄位都不小於兩邊、合併兩次結果一樣、順序對調結果一樣。家長專區的「備份碼」也用它合併。
- 以後如果加了「會變少」的欄位（例如可以花掉的東西），要另外設計，不能直接套這個規則。

### 什麼時候同步

- 打開遊戲時：從雲端拿這個小孩的存檔，和裝置上的合併。
- 每次過關後：合併後上傳（等 2 秒沒有新變化再送，避免一直送）。
- 沒網路時：照樣存在裝置上，下次打開再補送。

## 7. 訪客進度搬進帳號

家長第一次登入時：

- **帳號裡還沒有小孩**：請家長幫小孩取暱稱，這台裝置的訪客進度直接變成這個小孩的進度。
- **帳號裡已經有小孩**（例如在另一台裝置登入過）：問「這台裝置上的樹（💧 N 滴）是哪個小孩的？」→ 選一個合併，或選「新增一個小孩」。
- 搬完後清掉訪客存檔，避免下次又問。

## 8. 付費（和帳號一起實作）

- 收款方式沿用舊規劃：人工轉帳＋後台手動開通（舊的 Stripe 程式保留但不用）。
- 開通時在後台把 `plan` 設為 `paid`、`paid_until` 設為到期日；網站判斷「`plan = paid` 且還沒到期」才算付費。
- 價格、免費和付費的分界：還沒決定，見 `docs/roadmap-2026-11.md`。

## 9. 需要使用者自己做的事

1. 在 Supabase 後台恢復專案（或另開一個新的乾淨專案）。
2. 更換曾經外流的 service role 金鑰，以及 `ADMIN_SECRET`。
3. 在 Google Cloud 建 OAuth 用戶端（要用 Google 登入的話），把設定值給 Supabase。
4. 確認 Supabase 免費方案「一週沒活動會暫停」的規則，正式收費後要決定升級付費方案或其他做法（屆時查最新價格）。

## 10. 實作順序（到時候照這個做）

1. `mergeSaves` 純函式＋驗證腳本。
2. 新 migration：`children`、`child_saves`、`paid_until`、profile 自動建立的 trigger、修掉 insert 政策。
3. 登入頁改成 email 登入連結＋Google，加家長關卡。
4. 家長專區：管理小孩（新增、改名、切換）、看付費狀態。
5. 遊戲接上同步（打開時拉、過關後推、離線補送）。
6. 訪客進度搬進帳號的流程。
7. 付費內容的鎖和解鎖。
