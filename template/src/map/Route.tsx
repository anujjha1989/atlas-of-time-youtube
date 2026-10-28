import React from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { proj, PLATE_W, PLATE_H } from "./geo";
import { useCam } from "./MapPlate";

const smooth = (pts: [number, number][]) => {
  if (pts.length < 3) return "M" + pts.map((p) => p.join(",")).join("L");
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
};

// A march route drawn in ink: a dark casing, a coloured line, and a bright head while drawing.
export const Route: React.FC<{ lonlat: [number, number][]; progress: number; color: string; width?: number; dashed?: boolean; arrow?: boolean; opacity?: number }> = ({ lonlat, progress, color, width = 7, dashed, arrow = true, opacity = 1 }) => {
  const cam = useCam();
  const d = smooth(lonlat.map(([a, b]) => proj(a, b)));
  const L = getLength(d), p = Math.max(0.0001, Math.min(1, progress));
  const w = width / cam.zoom;
  const head = getPointAtLength(d, L * p)!, back = getPointAtLength(d, Math.max(0, L * p - 4 / cam.zoom))!;
  const ang = (Math.atan2(head.y - back.y, head.x - back.x) * 180) / Math.PI;
  return (
    <svg width={PLATE_W} height={PLATE_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity }}>
      <path d={d} fill="none" stroke="rgba(3,6,14,0.75)" strokeWidth={w * 2.1} strokeLinecap="round" strokeDasharray={`${L * p} ${L}`} />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dashed ? `${w * 2.4} ${w * 1.8}` : `${L * p} ${L}`}
        style={dashed ? { clipPath: undefined } : undefined} mask={dashed ? undefined : undefined} />
      {dashed && <path d={d} fill="none" stroke="transparent" />}
      {arrow && p > 0.02 && (
        <g transform={`translate(${head.x},${head.y}) rotate(${ang}) scale(${1 / cam.zoom})`}>
          <path d="M16 0 L-10 -11 L-5 0 L-10 11 Z" fill={color} stroke="rgba(3,6,14,0.8)" strokeWidth={2} />
        </g>
      )}
    </svg>
  );
};
