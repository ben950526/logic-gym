import { ImageResponse } from "next/og";

/** App 圖示：藍天底＋一棵圓圓的樹（用方塊和圓形畫，不靠字型或 emoji） */
export function appIcon(size: number, { rounded = false }: { rounded?: boolean } = {}) {
  const u = size / 100;
  return new ImageResponse(
    (
      <div style={{
        width: size, height: size, display: "flex", position: "relative",
        background: "linear-gradient(180deg, #cfe3ee 0%, #f4eddd 100%)",
        borderRadius: rounded ? 22 * u : 0,
      }}>
        {/* 草地 */}
        <div style={{ position: "absolute", left: 10 * u, right: 10 * u, bottom: 12 * u, height: 14 * u, borderRadius: 999, background: "#b9cf92" }} />
        {/* 樹幹 */}
        <div style={{ position: "absolute", left: 44 * u, width: 12 * u, bottom: 18 * u, height: 32 * u, borderRadius: 4 * u, background: "#9b6a43" }} />
        {/* 樹冠 */}
        <div style={{ position: "absolute", left: 18 * u, top: 14 * u, width: 40 * u, height: 40 * u, borderRadius: 999, background: "#4f8645" }} />
        <div style={{ position: "absolute", left: 42 * u, top: 14 * u, width: 40 * u, height: 40 * u, borderRadius: 999, background: "#4f8645" }} />
        <div style={{ position: "absolute", left: 28 * u, top: 4 * u, width: 44 * u, height: 44 * u, borderRadius: 999, background: "#86b878" }} />
        {/* 果實 */}
        <div style={{ position: "absolute", left: 34 * u, top: 22 * u, width: 9 * u, height: 9 * u, borderRadius: 999, background: "#d9573f" }} />
        <div style={{ position: "absolute", left: 58 * u, top: 30 * u, width: 9 * u, height: 9 * u, borderRadius: 999, background: "#e9b23a" }} />
        <div style={{ position: "absolute", left: 24 * u, top: 38 * u, width: 8 * u, height: 8 * u, borderRadius: 999, background: "#e9b23a" }} />
      </div>
    ),
    { width: size, height: size },
  );
}
