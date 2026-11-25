import { useId } from 'react';

export default function BrandMark({ className = 'brand__mark', title = 'Orígenes SV' }) {
  const gradientId = `origenes-mark-${useId().replace(/:/g, '')}`;

  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label={title}>
      <defs>
        <linearGradient
          id={gradientId}
          x1="12"
          y1="6"
          x2="52"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#4096FF" />
          <stop offset="1" stopColor="#0958D9" />
        </linearGradient>
      </defs>

      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="18"
        fill={`url(#${gradientId})`}
        stroke="rgba(255, 255, 255, 0.55)"
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="31"
        r="15"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="78 16"
        opacity="0.95"
        transform="rotate(-40 32 31)"
      />
      <path d="M32 21c7 6 7 14 0 20-7-6-7-14 0-20Z" fill="#FFFFFF" opacity="0.98" />
      <path
        d="M32 25v12"
        fill="none"
        stroke="#1677FF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M32 41c-1 5-6 7-10 8M32 41c2 4 7 6 11 6"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="45" cy="18.5" r="2.4" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
