# Logic Gym · 美術素材放哪裡？

> 副檔名只要 **一個** `.png`，不要存成 `xxx.png.png`  
> 去背後仍是 `.png`

## 資料夾總覽

```
public/assets/
├── zones/          ← 10 區關卡地圖背景（3:4 直式，不去背）
├── shell/          ← 外殼大圖（星系、星球卡、頭像、框條）★ 現在優先做
└── ui/
    ├── buttons/    ← 主／次按鈕（最後做，可選）
    └── nodes/      ← 關卡圓圈 4 種（最後做，可選）
```

---

## zones/ · 關卡區域背景

| 檔名 | 說明 |
|------|------|
| `zone-01-landing.png` | 第 1 區 登陸補給區 |
| `zone-02-signal.png` | 第 2 區 能源通訊站 |
| `zone-03-library.png` | 第 3 區 圖書記錄塔 |
| `zone-04-market.png` | 第 4 區 農場交易市 |
| `zone-05-harbor.png` | 第 5 區 工程時間港 |
| `zone-06-bazaar.png` | 第 6 區 折扣比例域 |
| `zone-07-warehouse.png` | 第 7 區 分配餘數庫 |
| `zone-08-logic.png` | 第 8 區 邏輯推理所 |
| `zone-09-expedition.png` | 第 9 區 綜合遠征線 |
| `zone-10-boss.png` | 第 10 區 變異牧場核心 |

**不要去背。** 程式路徑：`/assets/zones/檔名`

---

## shell/ · 外殼 UI（路線 1 · 優先）

| 檔名 | 說明 | 去背 |
|------|------|------|
| `planet-math.png` | 乳牛星球選關卡 ★1 | ✅ 建議 |
| `portrait-xiaoguang.png` | 小光頭像 ★2 | ✅ 必須 |
| `galaxy-bg.png` | 邏輯星系整頁背景 ★3 | ❌ |
| `ui-panel-dialogue.png` | 劇情對話框底 | 視情況 |
| `ui-chapter-banner.png` | 章節標題橫幅 | ❌ |
| `ui-panel-puzzle.png` | **關卡題目／答題面板** | ❌ |
| `ui-panel-mission.png` | **本關任務橫條** | ❌ |
| `ui-panel-expedition.png` | **星球頁遠征主卡** | ❌ |
| `ui-hud-bar.png` | 頂部 HUD 裝飾條 | ❌ |

放好後跟我說「星球卡好了」或「Shell 好了」。  
程式路徑：`/assets/shell/檔名`

---

## ui/buttons/ · 按鈕（最後做，可選）

| 檔名 | 說明 |
|------|------|
| `ui-btn-gold.png` | 金主按鈕（繼續冒險） |
| `ui-btn-ghost.png` | 木次按鈕（劇情連結） |

**洋紅底 → remove.bg → 存這裡**

---

## ui/nodes/ · 關卡圓圈（最後做，可選）

| 檔名 | 說明 |
|------|------|
| `stage-node-available.png` | 可挑戰 |
| `stage-node-cleared.png` | 已過關 |
| `stage-node-locked.png` | 未解鎖 |
| `stage-node-boss.png` | BOSS |

**洋紅底 → remove.bg → 存這裡**

---

## 快速對照：我這張圖該丟哪？

| 如果是… | 丟到 |
|---------|------|
| 第 1–10 區關卡地圖 | `zones/` |
| 星系背景、星球卡、小光、對話框、章節條、題目面板、**任務條、遠征主卡** | `shell/` |
| 繼續冒險／劇情按鈕 | `ui/buttons/` |
| 關卡圓圈（可挑戰／鎖住等） | `ui/nodes/` |

詳細 MJ prompt 見：`docs/midjourney-asset-brief.md`  
**還沒統一的美術：** 同文件 **「十、美術統一進度總表」**
