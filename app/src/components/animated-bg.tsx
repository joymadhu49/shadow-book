"use client";

export function AnimatedBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Aurora blobs */}
      <div className="mb-aurora mb-aurora-1" />
      <div className="mb-aurora mb-aurora-2" />
      <div className="mb-aurora mb-aurora-3" />

      {/* Flowing ribbons */}
      <svg
        className="absolute inset-0 w-full h-full opacity-70"
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ribbon-1" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00D9FF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#00D9FF" stopOpacity="0.6" />
            <stop offset="1" stopColor="#4DA8FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ribbon-2" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4DA8FF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#00D9FF" stopOpacity="0.4" />
            <stop offset="1" stopColor="#4DA8FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ribbon-3" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00D9FF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#7FE5FF" stopOpacity="0.3" />
            <stop offset="1" stopColor="#00D9FF" stopOpacity="0" />
          </linearGradient>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <g filter="url(#soft-glow)">
          <path className="mb-ribbon mb-ribbon-1" d="M-100 320 C 240 200, 480 460, 760 300 S 1280 160, 1640 280" stroke="url(#ribbon-1)" strokeWidth="1.5" fill="none" />
          <path className="mb-ribbon mb-ribbon-2" d="M-100 380 C 280 240, 520 520, 800 360 S 1320 220, 1640 360" stroke="url(#ribbon-2)" strokeWidth="1.25" fill="none" />
          <path className="mb-ribbon mb-ribbon-3" d="M-100 260 C 220 380, 540 160, 820 320 S 1280 480, 1640 240" stroke="url(#ribbon-3)" strokeWidth="1" fill="none" />
        </g>
      </svg>

      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--mb-bg-primary)] to-transparent" />
      {/* Bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--mb-bg-primary)] to-transparent" />
    </div>
  );
}
