import React, { useId } from 'react';

/** The VENUE "V" mark (blue gradient), drawn as SVG so it stays sharp at any size. */
export const VenueLogo: React.FC<{ size?: number; className?: string }> = ({ size = 64, className }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="VENUE"
    >
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path d="M6 14 L38 14 L56 70 L44 90 Z" fill={`url(#${id}a)`} />
      <path d="M94 14 L66 14 L50 62 L56 78 Z" fill={`url(#${id}b)`} />
    </svg>
  );
};
