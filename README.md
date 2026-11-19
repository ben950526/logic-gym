# Logic Gym 謎題本

給幼稚園到小四的互動邏輯謎題（數織、一筆畫、4×4 數獨）。題目由程式產生，每一題都驗算過答案只有一個。
解一題，孩子的樹就長大一點；冒險地圖每章 10 關。

- 正式網址：https://logic-gym-khaki.vercel.app（`main` 推上去會自動部署到 Vercel）
- 交接與規則：`HANDOFF.md`；設計文件：`docs/`

## 開發

```bash
npm install
npm run dev                    # http://localhost:3000/play
npm run verify:puzzle-engine   # 驗算所有謎題產生器、樹、存檔合併
npm run build
```

## 程式在哪

| 位置 | 內容 |
|------|------|
| `app/play/` | 遊戲頁和樣式 |
| `components/play/` | 介面：樹、冒險地圖、三種謎題板、示範、家長專區 |
| `lib/puzzles/` | 謎題產生器與驗算、樹、存檔 |
| `supabase/migrations/` | 舊版資料庫結構（之後做帳號時沿用並修改，見 `docs/account-design.md`） |

舊版（星球地圖、登入、付款頁、後台）在 2026-11-19 刪除，要找回來看 git tag `legacy-before-cleanup`。
