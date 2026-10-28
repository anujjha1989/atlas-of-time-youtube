// YouTube thumbnails (1280×720): a real-model 3D shot plus a short, high-contrast hook.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Battle3D, BParams, DEFAULT } from "../battle/Battle3D";
import { C, F } from "../theme";

type V = { cam: BParams["cam"]; p?: Partial<BParams>; big: [string, string, string]; small: string; side: "left" | "right" };
const VARIANTS: V[] = [
  // 0: low and close beside the elephant line, which recedes into the distance
  { cam: { pos: [-1.5, 1.3, 105.5], look: [-9, 3.1, 113.5], fov: 44 }, p: { lodi: 1, camp: 1, baburCentre: 0, wings: 0 },
    big: ["12,000", "vs", "100,000"], small: "PANIPAT 1526", side: "right" },
  // 1: behind one of Babur's guns, the host and its elephants advancing
  { cam: { pos: [2.6, 3.4, -9.5], look: [8, 2.4, 26], fov: 33 }, p: { lodi: 1, lodiZ: 90, carts: 1, mantelets: 1, guns: 1, fire: 0, baburCentre: 0, wings: 0, t: 2.1 },
    big: ["GUNS", "vs", "ELEPHANTS"], small: "PANIPAT 1526", side: "left" },
  // 2: one war elephant, head-on and close
  { cam: { pos: [-0.8, 1.45, 104.6], look: [-8.2, 2.8, 113.2], fov: 38 }, p: { lodi: 1, camp: 1, baburCentre: 0, wings: 0 },
    big: ["HALF A DAY", "THAT MADE", "AN EMPIRE"], small: "BABUR · PANIPAT 1526", side: "right" },
];

export const Thumb: React.FC<{ v: number }> = ({ v }) => {
  const s = VARIANTS[v];
  const p: BParams = { ...DEFAULT, ...s.p, cam: s.cam, t: s.p?.t ?? 1 };
  const right = s.side === "right";
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080, filter: "contrast(1.14) saturate(1.2) brightness(0.97)" }}>
        <Battle3D p={p} width={1920} height={1080} />
      </AbsoluteFill>
      {/* darken behind the words so they read at phone size */}
      <AbsoluteFill style={{ background: `linear-gradient(${right ? "270deg" : "90deg"}, rgba(4,8,20,0.82) 0%, rgba(4,8,20,0.55) 34%, rgba(4,8,20,0) 58%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)" }} />
      <div style={{ position: "absolute", top: 70, [right ? "right" : "left"]: 60, textAlign: right ? "right" : "left", width: 620 }}>
        {s.big.map((w, i) => (
          <div key={i} style={{
            fontFamily: F.display, lineHeight: 0.98, letterSpacing: 1,
            fontSize: w === "vs" ? 64 : w.length > 7 ? 96 : 132,
            color: w === "vs" ? C.vermilion : i === 0 ? C.ivory : C.gold,
            textShadow: "0 4px 18px rgba(0,0,0,0.95), 0 0 4px #000, 0 0 2px #000",
            WebkitTextStroke: w === "vs" ? undefined : "1.5px rgba(0,0,0,0.6)",
          }}>{w}</div>
        ))}
        <div style={{ marginTop: 22, display: "inline-block", padding: "8px 18px", background: C.vermilion, color: C.ivory, fontFamily: F.display, fontSize: 40, letterSpacing: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.6)" }}>{s.small}</div>
      </div>
    </AbsoluteFill>
  );
};
