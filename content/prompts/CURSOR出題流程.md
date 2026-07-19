# 用 Cursor 出題（不需 Anthropic API）

Logic Gym 預設改用 **Cursor 聊天** 出題，再用 script 驗證、匯入。  
**不需要** `ANTHROPIC_API_KEY`。

---

## 五步驟

### 1. 選模板

在 `content/prompts/` 選一個：

| 檔案 | 類別 |
|------|------|
| `detective-multiple-choice.md` | 偵探推理 |
| `math-numeric-fill.md` | 數學推理 |
| `pattern-multiple-choice.md` | 找規律 |

把 `{{count}}` 改成要幾題（建議 **2～3**），`{{difficulty}}` 改成 `easy` / `medium` / `hard`。

### 2. 貼到 Cursor 聊天

範例訊息：

```
請依照下面 prompt 出題。只輸出 JSON 陣列，不要其他文字。
出題後請自我檢查：每題是否只有一個合理答案、題幹是否清楚。

（貼上整份 prompt 內容）
```

### 3. 存檔

把 Cursor 回覆的 JSON 存成：

```
content/generated/batch-cursor-偵探-easy.json
```

### 4. 驗證格式

```bash
npm run validate:puzzles -- --file content/generated/batch-cursor-偵探-easy.json
```

### 5. 匯入 Supabase（Cursor Agent 自動做）

```bash
npm run validate:puzzles -- --file content/generated/你的批次.json
npm run seed:puzzles -- --file content/generated/你的批次.json --status pending
```

- **預設匯入 `pending`（待審）**，不直接給學生玩
- 到 Admin http://localhost:3000/admin/puzzles 審題 → 符合的改 **已上架**，不要的改 **已拒絕**

首次匯入完整 30 題題庫（會清除舊題）：

```bash
npm run seed:puzzles -- --file content/generated/library.json --replace
```

---

## Agent 出題約定（已確認）

1. 出題 → 存 JSON → `validate:puzzles`
2. **自動 `seed:puzzles --status pending` 匯入 Supabase**
3. 通知使用者到 Admin 審題上架
4. 不要 `--replace`，除非使用者明確要求

---

## 品質建議

- 一次少出（2～3 題），審完再出下一批
- 在 Cursor 加一句：「若題幹有歧義或多解，請重出該題」
- 困難題可在 Cursor 選更強的模型
- **只有 Admin 標「已上架」的題才會給學生練**
- 各 prompt 已內建反證檢查；偵探題必對照 `content/prompts/detective-gold-examples.md`

---

## 可選：Anthropic API 自動出題

若日後有 API key，仍可用：

```bash
npm run generate:puzzles -- --template detective-multiple-choice --difficulty easy --count 3
```

流程一樣：驗證 → pending → 人工審 → verified。
