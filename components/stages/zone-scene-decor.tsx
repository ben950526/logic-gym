import type { ZoneDecor } from "@/lib/world/zone-themes";

interface ZoneSceneDecorProps {
  decor: ZoneDecor;
  sunColor: string;
}

export function ZoneSceneDecor({ decor, sunColor }: ZoneSceneDecorProps) {
  return (
    <>
      <div className="map-scene-cloud map-scene-cloud-a" aria-hidden />
      <div className="map-scene-cloud map-scene-cloud-b" aria-hidden />
      <div
        className="map-scene-sun"
        style={{ background: `radial-gradient(circle, ${sunColor} 0%, transparent 70%)` }}
        aria-hidden
      />

      {decor === "meadow" && (
        <>
          <svg className="map-decor map-decor-tree-l" viewBox="0 0 40 56" aria-hidden>
            <rect x="17" y="38" width="6" height="14" fill="#6d4c41" rx="1" />
            <circle cx="20" cy="28" r="16" fill="#2e7d32" />
            <circle cx="14" cy="22" r="10" fill="#388e3c" />
            <circle cx="26" cy="24" r="9" fill="#43a047" />
          </svg>
          <svg className="map-decor map-decor-tree-r" viewBox="0 0 36 48" aria-hidden>
            <rect x="15" y="32" width="5" height="12" fill="#5d4037" rx="1" />
            <circle cx="18" cy="22" r="14" fill="#33691e" />
          </svg>
          <svg className="map-decor map-decor-windmill" viewBox="0 0 32 40" aria-hidden>
            <rect x="14" y="18" width="4" height="18" fill="#8d6e63" />
            <circle cx="16" cy="16" r="3" fill="#bcaaa4" />
            <path d="M16 4 L18 16 L14 16 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth="0.5" />
            <path d="M28 16 L16 18 L16 14 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth="0.5" />
            <path d="M16 28 L14 16 L18 16 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth="0.5" />
            <path d="M4 16 L16 14 L16 18 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth="0.5" />
          </svg>
        </>
      )}

      {decor === "industrial" && (
        <>
          <svg className="map-decor map-decor-tower" viewBox="0 0 48 80" aria-hidden>
            <rect x="18" y="20" width="12" height="56" fill="#78909c" rx="1" />
            <rect x="14" y="12" width="20" height="10" fill="#546e7a" rx="2" />
            <circle cx="24" cy="8" r="5" fill="#ff7043" opacity="0.8" />
            <rect x="20" y="30" width="8" height="6" fill="#b0bec5" rx="1" />
            <rect x="20" y="44" width="8" height="6" fill="#b0bec5" rx="1" />
          </svg>
        </>
      )}

      {decor === "library" && (
        <svg className="map-decor map-decor-library" viewBox="0 0 56 64" aria-hidden>
          <rect x="8" y="16" width="40" height="44" fill="#8d6e63" rx="2" />
          <rect x="12" y="20" width="32" height="36" fill="#5d4037" rx="1" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={14 + i * 8} y="24" width="5" height="28" fill={["#ef5350", "#42a5f5", "#66bb6a", "#ffa726"][i]} rx="0.5" />
          ))}
          <polygon points="8,16 28,4 48,16" fill="#6d4c41" />
        </svg>
      )}

      {decor === "market" && (
        <>
          <svg className="map-decor map-decor-stall" viewBox="0 0 48 40" aria-hidden>
            <rect x="4" y="20" width="40" height="16" fill="#8d6e63" rx="1" />
            <path d="M4 20 L24 8 L44 20" fill="#e53935" />
            <rect x="10" y="24" width="8" height="8" fill="#ffca28" rx="1" />
            <rect x="30" y="24" width="8" height="8" fill="#66bb6a" rx="1" />
          </svg>
        </>
      )}

      {decor === "harbor" && (
        <svg className="map-decor map-decor-wave" viewBox="0 0 120 24" aria-hidden>
          <path d="M0 12 Q15 4 30 12 T60 12 T90 12 T120 12 V24 H0 Z" fill="rgba(33,150,243,0.35)" />
          <path d="M0 16 Q20 10 40 16 T80 16 T120 16 V24 H0 Z" fill="rgba(25,118,210,0.25)" />
        </svg>
      )}

      {decor === "boss" && (
        <>
          <div className="map-decor map-decor-fog" aria-hidden />
          <svg className="map-decor map-decor-skull" viewBox="0 0 40 40" aria-hidden>
            <circle cx="20" cy="18" r="14" fill="#424242" stroke="#212121" strokeWidth="1.5" />
            <circle cx="14" cy="16" r="4" fill="#212121" />
            <circle cx="26" cy="16" r="4" fill="#212121" />
            <path d="M12 28 Q20 34 28 28" fill="none" stroke="#212121" strokeWidth="2" />
          </svg>
        </>
      )}

      {/* 各區通用草地點綴 */}
      <div className="map-grass-patch map-grass-a" aria-hidden />
      <div className="map-grass-patch map-grass-b" aria-hidden />
    </>
  );
}
