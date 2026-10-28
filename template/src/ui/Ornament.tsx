import React from "react";
import { C } from "../theme";

// An eight-pointed shamsa (sun medallion) of the kind that opens Mughal albums.
export const Shamsa: React.FC<{ size: number; rotate?: number; opacity?: number }> = ({ size, rotate = 0, opacity = 1 }) => {
  const r = size / 2;
  const petals = Array.from({ length: 16 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`} style={{ opacity, rotate: `${rotate}deg` }}>
      <defs>
        <radialGradient id="sg" cx="0" cy="0" r={r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.goldLight} />
          <stop offset="0.55" stopColor={C.gold} />
          <stop offset="1" stopColor={C.goldDark} />
        </radialGradient>
      </defs>
      {petals.map((i) => (
        <path key={i} transform={`rotate(${(i * 360) / 16})`}
          d={`M0 ${-r * 0.36} C ${r * 0.11} ${-r * 0.6}, ${r * 0.05} ${-r * 0.86}, 0 ${-r * 0.98} C ${-r * 0.05} ${-r * 0.86}, ${-r * 0.11} ${-r * 0.6}, 0 ${-r * 0.36}Z`}
          fill={i % 2 ? "none" : "url(#sg)"} stroke={C.gold} strokeWidth={i % 2 ? 1.2 : 0} opacity={i % 2 ? 0.7 : 1} />
      ))}
      <circle r={r * 0.36} fill={C.lapis} stroke={C.gold} strokeWidth={2} />
      <circle r={r * 0.3} fill="none" stroke={C.gold} strokeWidth={0.8} strokeDasharray="2 4" />
    </svg>
  );
};

// Corner piece for the album frame: a small gold arabesque.
export const Corner: React.FC<{ size: number; flipX?: boolean; flipY?: boolean }> = ({ size, flipX, flipY }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ scale: `${flipX ? -1 : 1} ${flipY ? -1 : 1}` }}>
    <path d="M4 96 L4 4 L96 4" fill="none" stroke={C.gold} strokeWidth={2.2} />
    <path d="M12 96 L12 12 L96 12" fill="none" stroke={C.gold} strokeWidth={0.9} opacity={0.8} />
    <path d="M12 40 C 26 40, 40 26, 40 12" fill="none" stroke={C.gold} strokeWidth={1.4} />
    <path d="M12 26 C 20 26, 26 20, 26 12" fill="none" stroke={C.gold} strokeWidth={1.1} opacity={0.8} />
    <circle cx={22} cy={22} r={3.2} fill={C.gold} />
    <path d="M40 12 C 46 18, 52 18, 58 12 M12 40 C 18 46, 18 52, 12 58" fill="none" stroke={C.gold} strokeWidth={1} opacity={0.7} />
  </svg>
);
