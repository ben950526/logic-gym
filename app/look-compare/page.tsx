import type { Metadata } from "next";

export const metadata: Metadata = { title: "畫風對照", robots: { index: false } };

/** 暫時的對照頁：左邊現在的畫風，右邊新畫風。兩邊共用同一份進度，可以直接點來玩。決定後刪掉這頁。 */
export default function LookCompare() {
  const frames = [
    { src: "/play", title: "現在", note: "表情符號圖示、系統字、粗黑框＋硬陰影" },
    { src: "/play?look=book", title: "新畫風：印刷謎題本", note: "手繪線條圖示（套色偏移）、jf 粉圓字、紙張質感" },
  ];
  return (
    <main style={{ minHeight: "100vh", background: "#e9e6df", padding: "20px 16px", fontFamily: "system-ui, sans-serif", color: "#2e2a33" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 20, textAlign: "center" }}>Logic Gym 畫風對照</h1>
      <p style={{ margin: "0 0 16px", textAlign: "center", fontSize: 14, color: "#6e665c" }}>兩邊都可以直接點來玩，進度是共用的。</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
        {frames.map((f) => (
          <figure key={f.src} style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <figcaption style={{ textAlign: "center" }}>
              <strong style={{ fontSize: 16 }}>{f.title}</strong>
              <div style={{ fontSize: 13, color: "#6e665c" }}>{f.note}</div>
            </figcaption>
            <iframe src={f.src} title={f.title}
              style={{ width: 390, maxWidth: "calc(100vw - 32px)", height: 780, border: "8px solid #2e2a33", borderRadius: 28, background: "#fff" }} />
          </figure>
        ))}
      </div>
    </main>
  );
}
