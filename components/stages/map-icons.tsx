interface MapLockIconProps {
  className?: string;
}

export function MapLockIcon({ className }: MapLockIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-3 0H10V7a2 2 0 1 1 4 0v2z" />
    </svg>
  );
}

interface MapTreasureIconProps {
  className?: string;
  collected?: boolean;
}

export function MapTreasureIcon({ className, collected }: MapTreasureIconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <ellipse cx="16" cy="26" rx="10" ry="3" fill="rgba(0,0,0,0.15)" />
      <rect x="5" y="12" width="22" height="14" rx="3" fill={collected ? "#ffd54f" : "#ffb300"} stroke="#e65100" strokeWidth="1.5" />
      <path d="M5 15h22v3H5z" fill={collected ? "#ffca28" : "#ff8f00"} />
      <rect x="14" y="14" width="4" height="5" rx="1" fill="#5d4037" />
      <path
        d="M16 6 L22 12 H10 Z"
        fill={collected ? "#ffe082" : "#ffc107"}
        stroke="#e65100"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {!collected && (
        <circle cx="24" cy="8" r="3" fill="#fff59d" opacity="0.9">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
