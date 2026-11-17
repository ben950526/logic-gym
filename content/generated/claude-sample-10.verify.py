"""Claude 樣本 10 題：用窮舉法驗證每題「有解且只有一個解」，選項中只有一個正確。
執行：python -X utf8 content/generated/claude-sample-10.verify.py
"""
from itertools import permutations, product

results = []


def check(qid, answers, options=None):
    answers = sorted(set(answers), key=str)
    ok = len(answers) == 1
    if ok and options is not None:
        ok = sum(1 for o in options if o == answers[0]) == 1
    results.append((qid, ok, answers))


# K1 幼兒｜一對一對應：3 隻兔子各要 1 根紅蘿蔔，盤子有 2 根，還差幾根？
rabbits, carrots = 3, 2
check("K1", [n for n in range(0, 10) if carrots + n == rabbits], options=[0, 1, 2, 3])

# K2 幼兒｜比高矮（遞移）：熊比兔高、兔比貓高，誰最矮？
ans = []
for h in permutations([1, 2, 3]):  # 身高名次
    bear, rabbit, cat = h
    if bear > rabbit and rabbit > cat:
        ans.append(min(("熊", bear), ("兔", rabbit), ("貓", cat), key=lambda x: x[1])[0])
check("K2", ans, options=["熊", "兔", "貓"])

# K3 幼兒｜比多少：🍎🍎🍌🍎🍌，蘋果比香蕉多幾個？
plate = "AABAB"
check("K3", [plate.count("A") - plate.count("B")], options=[1, 2, 3])

# E1 低年級｜數字謎：兩位數，十位比個位大 3，兩數字和 11
check("E1", [10 * t + o for t in range(1, 10) for o in range(10) if t - o == 3 and t + o == 11],
      options=[47, 74, 83, 38])

# E2 低年級｜時間推理：美 7:40 到；華比美晚 5 分；明比華早 10 分。明幾點到？（以分鐘計）
mei = 7 * 60 + 40
hua = mei + 5
ming = hua - 10
check("E2", [f"{ming // 60}:{ming % 60:02d}"], options=["7:35", "7:45", "7:50", "7:55"])

# E3 低年級｜等量代換：1 西瓜 = 3 鳳梨，1 鳳梨 = 2 蘋果。1 西瓜 = ? 蘋果
check("E3", [n for n in range(1, 30) if n == 3 * 2], options=[5, 6, 9, 32])

# M1 中年級｜排隊推理（5 隻動物排第幾）
names = ["貓", "狗", "兔", "熊", "豬"]
third = []
for p in permutations(range(1, 6)):
    c, d, r, b, g = p
    if {c, g} != {1, 5}:      # ① 貓和豬一個第一、一個最後
        continue
    if g == 1:                # ② 豬不是第一個
        continue
    if b in (1, 5):           # ③ 熊不是第一也不是最後
        continue
    if r != d + 1:            # ④ 兔在狗的正後面
        continue
    if not d < b:             # ⑤ 狗在熊前面
        continue
    third.append(dict(zip(p, names))[3])
check("M1", third, options=names)

# M2 中年級｜誰說謊：甲乙丙丁一人偷吃餅乾，四人中只有一人說謊
people = ["甲", "乙", "丙", "丁"]
ans = []
for thief in people:
    s_jia = thief != "甲"          # 甲：不是我
    s_yi = thief == "丁"           # 乙：是丁
    s_bing = thief == "乙"         # 丙：是乙（初稿「不是我」→ 乙、丁都成立，已修正）
    s_ding = not s_yi              # 丁：乙在說謊
    if [s_jia, s_yi, s_bing, s_ding].count(False) == 1:
        ans.append(thief)
check("M2", ans, options=people)

# M3 中年級｜數字卡：1、2、3、4 各用一次組成兩個兩位數，相減最大的差
best = max(
    (10 * a + b) - (10 * c + d)
    for a, b, c, d in permutations([1, 2, 3, 4])
)
check("M3", [best], options=[29, 31, 33, 41])

# M4 中年級｜硬幣最少枚數：用 1、5、10 元湊 17 元，最少幾枚
INF = 99
dp = [0] + [INF] * 17
for v in range(1, 18):
    dp[v] = min(dp[v - c] + 1 for c in (1, 5, 10) if c <= v)
check("M4", [dp[17]], options=[3, 4, 5, 8])

bad = 0
for qid, ok, answers in results:
    print(f"{qid}: {'✓ 唯一解' if ok else '✗ 有問題'} → {answers}")
    bad += not ok
print("全部通過" if bad == 0 else f"{bad} 題沒過")
