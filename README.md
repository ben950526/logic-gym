# Logic Gym · 邏輯思考練功平台

Step 1：題庫管線 + Admin 後台（離線 AI 出題，非即時生成）

## 功能範圍

- ✅ Supabase `puzzles` schema
- ✅ 12 題本地樣本（4 類別 × 3 難度）
- ✅ AI 批次出題 script（Claude Sonnet）
- ✅ Seed script 匯入 Supabase
- ✅ Admin 題庫列表 + 狀態切換
- ✅ Step 2：使用者登入 + 練功解題 + 每日 5 題限制
- ⏳ MVP-B：競賽 + 付費

## 環境需求

- Node.js 20+
- Supabase 專案（可選，未設定時 Admin 使用本地 samples 預覽）

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

編輯 `.env.local`：

| 變數 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 前端讀取 |
| `SUPABASE_SERVICE_ROLE_KEY` | seed script 寫入 |
| `ADMIN_SECRET` | 後台登入密鑰 |
| `ANTHROPIC_API_KEY` | 可選：API 自動出題（不用 Cursor 時才填） |

### 3. 建立資料表

在 [Supabase SQL Editor](https://supabase.com/dashboard) 依序執行：

```
supabase/migrations/001_puzzles_full_ascii.sql
supabase/migrations/002_user_practice_ascii.sql
```

### 4. 匯入樣本題目

```bash
npm run seed:puzzles
# 僅驗證不寫入
npm run seed:puzzles -- --dry-run
```

### 5. 啟動開發伺服器

```bash
npm run dev
```

- 首頁：http://localhost:3000
- 練功：http://localhost:3000/practice（需登入）
- 登入：http://localhost:3000/login
- 後台：http://localhost:3000/admin/puzzles

## 出題方式（推薦：Cursor）

**不需 Anthropic API**，用 Cursor 聊天出題即可。詳見：

`content/prompts/CURSOR出題流程.md`

```text
1. 複製 content/prompts/ 模板 → 貼到 Cursor 聊天
2. 存 JSON 到 content/generated/batch-cursor-xxx.json
3. npm run validate:puzzles -- --file content/generated/batch-cursor-xxx.json
4. npm run seed:puzzles -- --file ... --status pending
5. Admin 審題 → 已上架
```

## AI API 自動出題（可選）

有 `ANTHROPIC_API_KEY` 時：

```bash
npm run generate:puzzles -- --template detective-multiple-choice --difficulty easy --count 3
```

輸出至 `content/generated/batch-*.json`，人工審核後再 seed：

```bash
npm run seed:puzzles -- --file content/generated/batch-xxx.json --status pending
```

## Prompt 模板

| 檔案 | 類別 | 題型 |
|------|------|------|
| `content/prompts/detective-multiple-choice.md` | 偵探推理 | 選擇題 |
| `content/prompts/math-numeric-fill.md` | 數學推理 | 數字填空 |
| `content/prompts/pattern-multiple-choice.md` | 找規律 | 選擇題 |

完整題庫（30 題）：`content/generated/library.json`

## 專案結構

```
logic-gym/
├── app/                    # Next.js 頁面
├── components/admin/       # 後台元件
├── content/
│   ├── prompts/            # AI 出題模板
│   └── generated/          # 生成結果 + samples.json
├── lib/                    # Supabase、驗證、auth
├── scripts/                # generate / seed
├── supabase/migrations/    # SQL
└── types/puzzle.ts         # 型別定義
```

## 推薦出題策略

1. **主力**：Cursor 聊天 + `content/prompts/` 模板（不需 API key）
2. **品質**：小批量出題 → 人工審 → Admin 標 verified
3. **可選**：Anthropic API 自動批次（`npm run generate:puzzles`）

## 未設定 Supabase 時

Admin 會自動讀取 `content/generated/samples.json` 預覽 12 題（狀態切換需先接 Supabase）。
