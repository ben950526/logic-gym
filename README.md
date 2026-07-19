# Logic Gym · 邏輯思考練功平台

**V2 MVP（目前上線方向）**：登入 → 邏輯星系 → 乳牛星球 100 關 → 規律星球 8 關

> 舊版「練功 / 積分賽 / 付費」程式仍保留，但 `V2_GALAXY_MODE = true` 時對玩家隱藏。

## 功能範圍

- ✅ Supabase 題庫 + 使用者 + 關卡進度
- ✅ V2 破關地圖（100 math + 8 pattern）
- ✅ 劇情 / 任務 / Admin 審題
- ✅ 題庫管線（Cursor 出題 → validate → seed）
- ⏳ MVP-B：競賽 + 付費（程式已有，V2 下未開放）

## 環境需求

- Node.js 20+
- Supabase 專案（**V2 上線必要**）

## 快速開始

### 1. 安裝依賴

```bash
cd logic-gym
npm install
```

### 2. 環境變數

```bash
cp .env.example .env.local
```

| 變數 | 用途 | V2 必要 |
|------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 前端讀取 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | seed / verify script | ✅ |
| `ADMIN_SECRET` | 後台登入 | ✅ |
| `NEXT_PUBLIC_APP_URL` | 正式站網址（OAuth 回調） | ✅ 部署時 |
| `ANTHROPIC_API_KEY` | API 自動出題 | 可選 |
| `MANUAL_PAYMENT_*` | 人工收款（MVP-B） | 可選 |
| `STRIPE_*` | Stripe 訂閱（MVP-B） | 可選 |

### 3. 建立資料表（V2 最少跑這三個）

在 [Supabase SQL Editor](https://supabase.com/dashboard) **依序**執行：

```
supabase/migrations/001_puzzles_full_ascii.sql   ← 題庫表
supabase/migrations/002_user_practice_ascii.sql  ← 使用者 / 作答
supabase/migrations/008_stage_progress_ascii.sql ← 關卡進度（V2 必須）
```

若之後要開練功 / EXP / 競賽 / 付費，再補跑 `003`～`007`。

### 4. 108 關題目上架（verified）

```bash
# 數學 100 關：補匯入 + 全部設 verified
npm run verify:math-100

# 規律 8 關
npm run verify:pattern-8

# 或一次跑完
npm run verify:stages-v1

# 檢查 P0 是否就緒（stage_progress + 108 題）
npm run check:mvp
```

預期輸出：`✓ P0 後端就緒，可進行煙霧測試`

### 5. 啟動開發伺服器

```bash
npm run dev
```

| 頁面 | URL |
|------|-----|
| 首頁 / 星系 | http://localhost:3000/galaxy |
| 乳牛星球 | http://localhost:3000/planet/math |
| 第一關 | http://localhost:3000/stage/math-01 |
| 登入 | http://localhost:3000/login |
| 後台審題 | http://localhost:3000/admin/puzzles |
| Shell 預覽 | http://localhost:3000/dev/shell-preview |

### 6. Vercel 部署

1. GitHub 連動 Vercel，Root Directory = `logic-gym`
2. Environment Variables 設 **Production + Preview**（同上表必要項）
3. Supabase → Authentication → URL Configuration：
   - Site URL：`https://你的網域.vercel.app`
   - Redirect URLs：`https://你的網域.vercel.app/auth/callback`
4. Push 到 `main` 後自動部署

## P0 煙霧測試清單

用**新帳號**或無進度帳號，在本地或正式站逐項打勾：

1. [ ] 註冊 / 登入成功 → 進入 `/galaxy`
2. [ ] 星系頁**沒有**「關卡進度尚未啟用」警告
3. [ ] 進 `/planet/math` → `math-01` 可點，`math-02` 鎖住
4. [ ] `/stage/math-01` 有題目（**不是**「題目尚未上架」）
5. [ ] 答對 → 顯示過關 → `math-02` 解鎖
6. [ ] **重新整理** `/planet/math` → 進度仍在
7. [ ] （可選，需測試帳號）在 Supabase 手動標記 math-01～math-99 過關後，確認 `/planet/pattern` 解鎖

快速測第 4～6 步：只需玩完 math-01 一關即可。

## 出題方式（推薦：Cursor）

詳見 `content/prompts/CURSOR出題流程.md`

```text
1. 複製 content/prompts/ 模板 → 貼到 Cursor 聊天
2. 存 JSON 到 content/generated/batch-cursor-xxx.json
3. npm run validate:puzzles -- --file content/generated/batch-cursor-xxx.json
4. npm run seed:puzzles -- --file ... --status pending
5. Admin 審題 → 已上架
```

## npm scripts 一覽

| Script | 用途 |
|--------|------|
| `npm run dev` | 開發伺服器 |
| `npm run check:mvp` | P0 後端健康檢查 |
| `npm run verify:math-100` | 100 關 math 上架 |
| `npm run verify:pattern-8` | 8 關 pattern 上架 |
| `npm run verify:stages-v1` | 108 關一次上架 |
| `npm run seed:puzzles` | 匯入 JSON 題庫 |
| `npm run validate:puzzles` | 驗證 JSON 格式 |
| `npm run build:math-planet` | 重建 100 關地圖 JSON |

## 專案結構

```
logic-gym/
├── app/                    # Next.js 頁面（galaxy / planet / stage）
├── components/             # UI 元件
├── content/
│   ├── stages/             # 關卡表 planet-map-v1.json
│   ├── story/              # 劇情 math-zones.json / season-1.json
│   └── generated/          # library.json 題庫
├── lib/stages/             # 關卡進度、解鎖邏輯
├── scripts/                # seed / verify / check:mvp
└── supabase/migrations/    # SQL（001 + 002 + 008 為 V2 最少）
```

## 未設定 Supabase 時

Admin 會讀取 `content/generated/samples.json` 預覽 12 題；**關卡模式無法存進度**。
