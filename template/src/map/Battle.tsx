import React, { useMemo } from "react";
import { AbsoluteFill, random } from "remotion";
import { C, F } from "../theme";

// The battlefield: a ground plate in metres (Babur's line along y=0, Ibrahim to the south, +y),
// tilted in 3D. Units are blocks of tiny figures that cast long shadows.
export type BCam = { x: number; y: number; zoom: number; tilt: number; rot?: number };
const BW = 8000, BH = 6000, OX = 4000, OY = 2000; // plate px = metres + offset (1 px = 1 m)
const BCtx = React.createContext<BCam>({ x: 0, y: 0, zoom: 1, tilt: 50 });
export const useBCam = () => React.useContext(BCtx);
export const bp = (x: number, y: number) => [x + OX, y + OY] as const;

const Ground: React.FC<{ dawn: number }> = ({ dawn }) => {
  const tufts = useMemo(() => Array.from({ length: 900 }, (_, i) => ({ x: random(`tx${i}`) * BW, y: random(`ty${i}`) * BH, r: 6 + random(`tr${i}`) * 22, o: 0.05 + random(`to${i}`) * 0.1 })), []);
  return (
    <>
      <div style={{ position: "absolute", width: BW, height: BH, background: `radial-gradient(ellipse at 50% 40%, #24365e 0%, #172747 45%, #0b1530 100%)` }} />
      <svg width={BW} height={BH} style={{ position: "absolute" }}>
        {tufts.map((t, i) => <circle key={i} cx={t.x} cy={t.y} r={t.r} fill="#4a5b45" opacity={t.o} />)}
        {Array.from({ length: 41 }, (_, i) => <line key={`v${i}`} x1={i * 200} y1={0} x2={i * 200} y2={BH} stroke={C.gold} strokeWidth={1.2} opacity={0.08} />)}
        {Array.from({ length: 31 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 200} x2={BW} y2={i * 200} stroke={C.gold} strokeWidth={1.2} opacity={0.08} />)}
      </svg>
      <div style={{ position: "absolute", width: BW, height: BH, background: `linear-gradient(0deg, rgba(255,150,60,${0.16 * dawn}), rgba(255,190,110,0) 60%)` }} />
    </>
  );
};

export const BattlePlate: React.FC<{ cam: BCam; dawn?: number; children?: React.ReactNode }> = ({ cam, dawn = 0, children }) => {
  const [fx, fy] = bp(cam.x, cam.y);
  return (
    <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: "50% 35%", overflow: "hidden", backgroundColor: "#060c1d" }}>
      <div style={{ position: "absolute", left: 960 - fx, top: 560 - fy, width: BW, height: BH, transformOrigin: `${fx}px ${fy}px`,
        transform: `rotateX(${cam.tilt}deg) rotateZ(${cam.rot ?? 0}deg) scale(${cam.zoom})`, transformStyle: "preserve-3d" }}>
        <Ground dawn={dawn} />
        <BCtx.Provider value={cam}>{children}</BCtx.Provider>
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,12,29,0.95) 0%, rgba(6,12,29,0) 22%)" }} />
    </AbsoluteFill>
  );
};

// One unit: rows of figures standing up off the plate. side 0 = Babur (malachite), 1 = Lodi (vermilion).
export const Unit: React.FC<{ x: number; y: number; cols: number; rows: number; side: 0 | 1; horse?: boolean; opacity?: number; seed?: string; facing?: number }> = ({ x, y, cols, rows, side, horse, opacity = 1, seed = "u" }) => {
  const cam = useBCam();
  const [px, py] = bp(x, y);
  const gap = horse ? 13 : 8, depth = horse ? 16 : 9;
  const col = side === 0 ? C.malachite : C.vermilion, dark = side === 0 ? C.malachiteDark : C.vermilionDark;
  const figs = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const jx = (random(`${seed}${r}-${c}x`) - 0.5) * 3, jy = (random(`${seed}${r}-${c}y`) - 0.5) * 3;
    figs.push({ x: c * gap + jx - (cols * gap) / 2, y: r * depth + jy - (rows * depth) / 2, k: random(`${seed}${r}${c}k`) });
  }
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", left: px, top: py, opacity, transformStyle: "preserve-3d" }}>
      {/* shadow on the ground */}
      <div style={{ position: "absolute", left: -(cols * gap) / 2 + 6, top: -(rows * depth) / 2 + 10, width: cols * gap, height: rows * depth, background: "rgba(0,0,0,0.38)", filter: "blur(5px)", transform: "skewX(-30deg)" }} />
      {figs.map((f, i) => (
        <div key={i} style={{ position: "absolute", left: f.x, top: f.y, width: 0, height: 0, transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", left: horse ? -5 : -3, bottom: 0, transformOrigin: "50% 100%", transform: `rotateX(${-90 + 0}deg)` }}>
            <svg width={horse ? 12 : 7} height={horse ? 20 : 15} viewBox={horse ? "0 0 12 20" : "0 0 7 15"} style={{ display: "block" }}>
              {horse ? (
                <>
                  <rect x={1} y={11} width={10} height={6} rx={2} fill={f.k < 0.5 ? "#5b3d22" : "#3a2717"} />
                  <rect x={1.6} y={16} width={1.4} height={4} fill="#2a1c10" /><rect x={8.8} y={16} width={1.4} height={4} fill="#2a1c10" />
                  <rect x={4} y={4} width={4} height={8} rx={1.5} fill={col} /><circle cx={6} cy={3} r={2} fill="#d9b48a" />
                  <path d="M5 1 Q6 -1 7 1Z" fill={dark} />
                </>
              ) : (
                <>
                  <rect x={1.5} y={5} width={4} height={7} rx={1.4} fill={f.k < 0.85 ? col : dark} />
                  <rect x={2} y={12} width={1.2} height={3} fill="#2a1c10" /><rect x={3.8} y={12} width={1.2} height={3} fill="#2a1c10" />
                  <circle cx={3.5} cy={3.4} r={1.9} fill="#d9b48a" /><path d="M1.6 3 Q3.5 0 5.4 3Z" fill={f.k < 0.5 ? "#efe6d0" : dark} />
                  <line x1={6} y1={0} x2={6} y2={13} stroke="#8a7a5a" strokeWidth={0.6} />
                </>
              )}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Elephant: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => {
  const [px, py] = bp(x, y);
  return (
    <div style={{ position: "absolute", left: px, top: py, opacity, transformStyle: "preserve-3d" }}>
      <div style={{ position: "absolute", left: -20, top: -6, width: 40, height: 16, background: "rgba(0,0,0,0.4)", filter: "blur(4px)" }} />
      <div style={{ position: "absolute", left: -20, bottom: 0, transformOrigin: "50% 100%", transform: "rotateX(-90deg)" }}>
        <svg width={40} height={34} viewBox="0 0 40 34">
          <path d="M6 30 L6 18 Q6 8 18 8 Q30 8 32 16 Q36 18 37 26 L35 26 Q34 21 32 21 L32 30 L28 30 L28 23 L12 23 L12 30Z" fill="#8f8b86" stroke="#4d4a46" strokeWidth={0.8} />
          <rect x={11} y={2} width={14} height={8} fill={C.vermilion} stroke={C.gold} strokeWidth={0.8} />
          <path d="M10 2 L18 -3 L26 2" fill={C.gold} />
          <path d="M33 17 L38 19" stroke="#efe6d0" strokeWidth={1.4} />
        </svg>
      </div>
    </div>
  );
};

export const Cart: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => {
  const [px, py] = bp(x, y);
  return (
    <div style={{ position: "absolute", left: px, top: py, opacity, transformStyle: "preserve-3d" }}>
      <div style={{ position: "absolute", left: -15, top: -5, width: 30, height: 12, background: "rgba(0,0,0,0.45)", filter: "blur(3px)" }} />
      <div style={{ position: "absolute", left: -15, bottom: 0, transformOrigin: "50% 100%", transform: "rotateX(-90deg)" }}>
        <svg width={30} height={16} viewBox="0 0 30 16">
          <rect x={1} y={3} width={28} height={7} fill="#8a5a2e" stroke="#4a2e14" strokeWidth={0.8} />
          <line x1={1} y1={6.5} x2={29} y2={6.5} stroke="#4a2e14" strokeWidth={0.6} />
          <circle cx={7} cy={12} r={3.6} fill="none" stroke="#3a2412" strokeWidth={1.4} /><circle cx={23} cy={12} r={3.6} fill="none" stroke="#3a2412" strokeWidth={1.4} />
        </svg>
      </div>
    </div>
  );
};

// A ground label that stands up and faces the camera.
export const BTag: React.FC<{ x: number; y: number; title: string; sub?: string; color?: string; opacity?: number }> = ({ x, y, title, sub, color = C.gold, opacity = 1 }) => {
  const cam = useBCam();
  const [px, py] = bp(x, y);
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", left: px, top: py, transformStyle: "preserve-3d", opacity }}>
      <div style={{ position: "absolute", left: 0, bottom: 0, transformOrigin: "0 100%", transform: `rotateX(${-cam.tilt}deg) scale(${1 / cam.zoom})` }}>
        <div style={{ translate: "-50% 0", position: "relative", bottom: 40, textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: F.display, fontSize: 40, color: C.ivory, textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}>{title}</div>
          {sub && <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 26, color: C.ivoryDim, textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>{sub}</div>}
          <div style={{ width: 2, height: 30, margin: "6px auto 0", background: color }} />
        </div>
      </div>
    </div>
  );
};
