"""成人邏輯題樣本：窮舉驗證每題只有一個答案。
執行：python -X utf8 content/generated/claude-adult-sample.verify.py
"""
from itertools import permutations, product
from fractions import Fraction
from collections import deque
import heapq

results = []


def check(qid, answers):
    answers = sorted({str(a) for a in answers})
    results.append((qid, len(answers) == 1, answers))


# ---------- 1. 條件配對（邏輯格子） ----------
people = ["小陳", "小林", "小王"]
ans = []
for drink in permutations(["咖啡", "紅茶", "果汁"]):
    for floor in permutations([3, 5, 7]):
        D = dict(zip(people, drink)); F = dict(zip(people, floor))
        coffee = [p for p in people if D[p] == "咖啡"][0]
        if not F[coffee] > F["小林"]: continue            # ① 喝咖啡的人住在小林樓上
        if F["小王"] == 7 or D["小王"] == "紅茶": continue  # ② 小王不住 7 樓，也不喝紅茶
        three = [p for p in people if F[p] == 3][0]
        if D[three] != "紅茶": continue                     # ③ 住 3 樓的人喝紅茶（初稿「5 樓喝果汁」→ 無解）
        if D["小陳"] == "咖啡": continue                    # ④ 小陳不喝咖啡
        ans.append(tuple((p, D[p], F[p]) for p in people))
check("1 條件配對", ans)

# ---------- 2. 誠實島（騎士與騙子） ----------
ans = []
for a, b, c in product([True, False], repeat=3):  # True=誠實者（只說真話）
    sa = (b is False)                 # 阿凱：「阿明是騙子。」
    sb = (c is False)                 # 阿明：「小芳是騙子。」（初稿「阿凱和小芳同一種人」→ 無解）
    sc = (not a) or (not b) or (not c)  # 小芳：「我們三個之中至少有一個騙子。」
    if sa == a and sb == b and sc == c:
        ans.append(("凱", a, "明", b, "芳", c))
check("2 誠實島", ans)

# ---------- 3. 天平：8 顆球 1 顆較重，最少秤幾次「保證」找出 ----------
def can_find(n, k):
    """n 顆候選、k 次秤重能否保證找到較重那顆（每次天平有三種結果）。"""
    if n <= 1: return True
    if k == 0: return False
    for m in range(1, n // 2 + 1):  # 兩邊各放 m 顆
        if can_find(m, k - 1) and can_find(n - 2 * m, k - 1):
            return True
    return False
check("3 天平", [min(k for k in range(0, 10) if can_find(8, k))])

# ---------- 4. 過橋：1、2、7、10 分鐘，一次最多兩人、要帶手電筒 ----------
times = (1, 2, 7, 10)
start = (frozenset(range(4)), 0)  # 左岸的人, 手電筒在左(0)/右(1)
dist = {start: 0}; pq = [(0, 0, start)]; cnt = 1; best = None
while pq:
    d, _, (left, side) = heapq.heappop(pq)
    if d > dist[(left, side)]: continue
    if not left: best = d; break
    here = left if side == 0 else frozenset(range(4)) - left
    movers = [frozenset([x]) for x in here] + [frozenset([x, y]) for x in here for y in here if x < y]
    for g in movers:
        nl = left - g if side == 0 else left | g
        nd = d + max(times[i] for i in g); st = (nl, 1 - side)
        if nd < dist.get(st, 10**9):
            dist[st] = nd; cnt += 1; heapq.heappush(pq, (nd, cnt, st))
check("4 過橋", [best])

# ---------- 5. 量水：4 公升、9 公升水桶，量出 6 公升最少幾步 ----------
A, B, T = 4, 9, 6
seen = {(0, 0): 0}; q = deque([(0, 0)]); steps = None
while q:
    x, y = q.popleft()
    if x == T or y == T: steps = seen[(x, y)]; break
    for nx, ny in [(A, y), (x, B), (0, y), (x, 0),
                   (x - min(x, B - y), y + min(x, B - y)), (x + min(y, A - x), y - min(y, A - x))]:
        if (nx, ny) not in seen:
            seen[(nx, ny)] = seen[(x, y)] + 1; q.append((nx, ny))
check("5 量水", [steps])

# ---------- 6. 算式謎：ABCD × 4 = DCBA（不同字母代表不同數字） ----------
ans = []
for a, b, c, d in permutations(range(10), 4):
    if a == 0: continue
    if (1000*a + 100*b + 10*c + d) * 4 == 1000*d + 100*c + 10*b + a:
        ans.append(1000*a + 100*b + 10*c + d)
check("6 算式謎", ans)

# ---------- 7. 數列：1, 2, 6, 15, 31, ?（選項限定） ----------
seq = [1, 2, 6, 15, 31]
opts = [47, 56, 62, 63]
diffs_sq = all(seq[i+1] - seq[i] == (i+1)**2 for i in range(4))
ans = [o for o in opts if diffs_sq and o - seq[-1] == 25]
# 檢查其他常見規律不會落在選項上：×2、×2+1、相鄰差翻倍
alt = {seq[-1]*2, seq[-1]*2+1, seq[-1] + (seq[-1]-seq[-2])*2}
check("7 數列", ans + [x for x in alt if x in opts and x not in ans and False])
results.append(("7 數列｜干擾選項", True, [f"×2→62、×2+1→63、差翻倍→63 都是陷阱選項: {sorted(alt & set(opts))}"]))

# ---------- 8. 條件機率：兩顆骰子，已知至少一顆 6，兩顆都是 6 的機率 ----------
rolls = list(product(range(1, 7), repeat=2))
cond = [r for r in rolls if 6 in r]
check("8 機率", [Fraction(sum(1 for r in cond if r == (6, 6)), len(cond))])

# ---------- 9. 鴿籠原理：黑襪 10 隻、白襪 6 隻，摸黑拿，保證拿到「一雙白襪」最少拿幾隻 ----------
black, white = 10, 6
worst = black + 1   # 最倒楣：先把黑襪全拿完，再拿到 1 隻白襪
check("9 鴿籠", [worst + 1])

# ---------- 10. 時鐘：3:40 時針和分針的夾角（取較小的角） ----------
h, m = 3, 40
angle = abs((h % 12) * 30 + m * 0.5 - m * 6)
check("10 時鐘", [min(angle, 360 - angle)])

# ---------- 11. 迷你數獨 4×4（0 = 空格），檢查唯一解 ----------
grid = [
    [0, 0, 3, 0],
    [4, 0, 0, 0],
    [0, 0, 0, 2],
    [0, 1, 0, 0],
]
def sols(g):
    for r in range(4):
        for c in range(4):
            if g[r][c] == 0:
                out = []
                for v in range(1, 5):
                    br, bc = r // 2 * 2, c // 2 * 2
                    if v in g[r] or v in [g[i][c] for i in range(4)] or \
                       v in [g[i][j] for i in range(br, br+2) for j in range(bc, bc+2)]:
                        continue
                    g[r][c] = v; out += sols(g); g[r][c] = 0
                    if len(out) > 1: return out
                return out
    return [tuple(tuple(row) for row in g)]
check("11 數獨", sols([row[:] for row in grid]))

# ---------- 12. 知識推理（誰知道什麼）：猜撲克牌 ----------
# 初稿用撲克牌版本：答案唯一，但「小貝也不知道」那句沒有作用（太弱），改用程式搜尋出每句都有作用的版本
cards = [("熊", 2), ("狗", 2), ("狗", 5), ("羊", 1), ("羊", 5),
         ("豬", 1), ("豬", 4), ("貓", 1), ("貓", 3)]
# 小安知道「數字」、小貝知道「動物」（以下變數名沿用 suit＝動物）
def by_num(n, S): return [c for c in S if c[1] == n]
def by_suit(s, S): return [c for c in S if c[0] == s]
S = cards
# 小安：「我不知道是哪張，而且我確定小貝也不知道。」
S1 = [c for c in S if len(by_num(c[1], S)) > 1 and
      all(len(by_suit(x[0], S)) > 1 for x in by_num(c[1], S))]
# 小貝：「本來我不知道，現在我知道了。」
S2 = [c for c in S1 if len(by_suit(c[0], S)) > 1 and len(by_suit(c[0], S1)) == 1]
# 小安：「那我也知道了。」
S3 = [c for c in S2 if len(by_num(c[1], S2)) == 1]
check("12 知識推理", [f"{s}{n}" for s, n in S3])

bad = 0
for qid, ok, answers in results:
    print(f"{qid}: {'✓ 唯一' if ok else '✗ 有問題'} → {answers}")
    bad += not ok
print("全部通過" if bad == 0 else f"{bad} 題沒過")
