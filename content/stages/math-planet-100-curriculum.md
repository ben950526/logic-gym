# 乳牛星球 100 關課程表

## 結構

- **10 大區 × 10 關 = 100 關**
- 每關 **topicType 唯一**（題型不重複）
- 難度曲線：easy（1–20）→ medium（21–50）→ hard（51–100）
- 每區第 10 關為 **BOSS**

## 大區一覽

| 區 | 名稱 | 關卡 | 難度 | 主題 |
|----|------|------|------|------|
| 1 | 登陸補給區 | 1–10 | easy | 四則生活應用 |
| 2 | 能源通訊站 | 11–20 | easy→medium | 平均、和差、間隔 |
| 3 | 圖書記錄塔 | 21–30 | medium | 雞兔、折扣、年齡 |
| 4 | 農場交易市 | 31–40 | medium→hard | 工程、面積、時間 |
| 5 | 工程時間港 | 41–50 | hard | 和差、位值、相遇追及 |
| 6 | 折扣比例域 | 51–60 | hard | 比例、濃度、盈虧 |
| 7 | 分配餘數庫 | 61–70 | hard | 公倍公因、餘數、代換 |
| 8 | 邏輯推理所 | 71–80 | hard | 天平、數陣、還原 |
| 9 | 綜合遠征線 | 81–90 | hard | 綜合應用、燒繩 |
| 10 | 變異牧場核心 | 91–100 | hard | 核心試煉、變異乳牛 |

## 題庫與指令

```bash
npm run build:math-planet    # 重建 100 關 planet-map
npm run merge:math-library   # 合併 batch 題目到 library.json
npm run validate:puzzles -- --file content/generated/math-100-batch-1.json
npm run verify:math-100
```
