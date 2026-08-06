import type { ReactElement } from "react";

/**
 * Brand mark, byte-copied from the design of record (D11-A1 snapshot,
 * App.tsx OALogo): a hexagon with a stylised summit/delta. Used in the
 * landing nav now, in auth screens later (OLY-40).
 */
export function Logo({ size = 32 }: { size?: number }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {/* Hexagon background */}
      <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" fill="url(#logoGrad)" />
      {/* Summit / peak — stylised Δ (math delta = change, growth) */}
      <path
        d="M16 8 L23 22 H9 Z"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Inner dot — the answer */}
      <circle cx="16" cy="18" r="1.6" fill="white" />
    </svg>
  );
}
