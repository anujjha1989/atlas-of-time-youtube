import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, staticFile, interpolate, Easing, delayRender, continueRender } from "remotion";
import { C, F } from "../theme";
import { Cam, PLATE_W, PLATE_H, proj, PLACES } from "./geo";

type River = { n: string; c: [number, number][] };
let RIVERS: River[] | null = null;

export const useRivers = () => {
  const [r, setR] = useState<River[] | null>(RIVERS);
  const [h] = useState(() => (RIVERS ? null : delayRender("rivers")));
  useEffect(() => {
    if (RIVERS) return;
    fetch(staticFile("rivers.json")).then((x) => x.json()).then((j) => { RIVERS = j; setR(j); if (h !== null) continueRender(h); });
  }, [h]);
  return r;
};

// Interpolate a camera through keyframes (frame numbers), zooming in log space.
export const camAt = (frame: number, keys: [number, Cam][]): Cam => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, a] = keys[i], [f1, b] = keys[i + 1];
    if (frame <= f1) {
      const p = interpolate(frame, [f0, f1], [0, 1], { easing: Easing.bezier(0.65, 0, 0.35, 1) });
      const l = (x: number, y: number) => x + (y - x) * p;
      return { lon: l(a.lon, b.lon), lat: l(a.lat, b.lat), zoom: Math.exp(l(Math.log(a.zoom), Math.log(b.zoom))), tilt: l(a.tilt, b.tilt), rot: l(a.rot ?? 0, b.rot ?? 0) };
    }
  }
  return keys[keys.length - 1][1];
};

const CamCtx = React.createContext<Cam>({ lon: 70, lat: 30, zoom: 1, tilt: 0 });
export const useCam = () => React.useContext(CamCtx);

export const MapPlate: React.FC<{ cam: Cam; children?: React.ReactNode; dim?: number }> = ({ cam, children, dim = 0 }) => {
  const rivers = useRivers();
  const [fx, fy] = proj(cam.lon, cam.lat);
  return (
    <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: "50% 42%", overflow: "hidden", backgroundColor: C.lapisDeep }}>
      <div style={{
        position: "absolute", left: 960 - fx, top: 540 - fy, width: PLATE_W, height: PLATE_H,
        transformOrigin: `${fx}px ${fy}px`, transform: `rotateX(${cam.tilt}deg) rotateZ(${cam.rot ?? 0}deg) scale(${cam.zoom})`,
        transformStyle: "preserve-3d",
      }}>
        <Img src={staticFile("terrain.jpg")} style={{ position: "absolute", width: PLATE_W, height: PLATE_H }} />
        <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(4,8,20,${0.18 + dim})` }} />
        <svg width={PLATE_W} height={PLATE_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <filter id="silverGlow"><feGaussianBlur stdDeviation="2.2" /></filter>
          </defs>
          {rivers?.map((r, i) => {
            const d = "M" + r.c.map((p) => p.join(",")).join("L");
            const w = Math.max(1.4, 3.2 / Math.sqrt(cam.zoom));
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="#6f7f95" strokeWidth={w * 2.6} opacity={0.35} filter="url(#silverGlow)" />
                <path d={d} fill="none" stroke={C.silver} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
              </g>
            );
          })}
        </svg>
        <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
      </div>
    </AbsoluteFill>
  );
};

// Something that stands up off the tilted plate and keeps a constant on-screen size.
export const Standee: React.FC<{ lon: number; lat: number; children: React.ReactNode; scale?: number }> = ({ lon, lat, children, scale = 1 }) => {
  const cam = useCam();
  const [x, y] = proj(lon, lat);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transformStyle: "preserve-3d" }}>
      <div style={{ position: "absolute", left: 0, bottom: 0, transformOrigin: "0 100%", transform: `rotateZ(${-(cam.rot ?? 0)}deg) rotateX(${-cam.tilt}deg) scale(${scale / cam.zoom})` }}>
        {children}
      </div>
    </div>
  );
};

export const City: React.FC<{ name: string; opacity?: number; big?: boolean; color?: string; side?: "r" | "l" }> = ({ name, opacity = 1, big, color = C.ivory, side = "r" }) => {
  const [lon, lat] = PLACES[name];
  const cam = useCam();
  const [x, y] = proj(lon, lat);
  const s = 1 / cam.zoom;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity }}>
        <div style={{ position: "absolute", left: -7 * s, top: -7 * s, width: 14 * s, height: 14 * s, rotate: "45deg", border: `${1.6 * s}px solid ${C.gold}`, backgroundColor: big ? C.gold : C.lapis }} />
      </div>
      <Standee lon={lon} lat={lat}>
        <div style={{ opacity, position: "absolute", bottom: 6, left: side === "r" ? 14 : undefined, right: side === "l" ? 14 : undefined, whiteSpace: "nowrap",
          fontFamily: F.body, fontStyle: "italic", fontWeight: 500, fontSize: big ? 46 : 34, color, textShadow: "0 2px 10px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)" }}>{name}</div>
      </Standee>
    </>
  );
};
