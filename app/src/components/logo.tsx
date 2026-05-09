export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sb-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00D9FF" />
          <stop offset="1" stopColor="#4DA8FF" />
        </linearGradient>
        <linearGradient id="sb-grad-dim" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00D9FF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4DA8FF" stopOpacity="0.15" />
        </linearGradient>
        <filter id="sb-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* base rounded square */}
      <rect x="1" y="1" width="38" height="38" rx="10" fill="#0A0E1A" stroke="url(#sb-grad)" strokeWidth="1.25" />

      {/* layered stack — three rollup layers (back two dim, front bright) */}
      <rect x="9" y="11" width="22" height="4" rx="1.5" fill="url(#sb-grad-dim)" />
      <rect x="11" y="17" width="18" height="4" rx="1.5" fill="url(#sb-grad-dim)" />
      <rect x="13" y="23" width="14" height="4" rx="1.5" fill="url(#sb-grad)" filter="url(#sb-glow)" />
      <rect x="13" y="23" width="14" height="4" rx="1.5" fill="url(#sb-grad)" />

      {/* eyelid bar — privacy mark */}
      <line x1="6" y1="32" x2="34" y2="32" stroke="url(#sb-grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
