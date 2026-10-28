import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { C, F, clamp } from "../theme";
import { MapPlate, City, Standee, camAt } from "../map/MapPlate";
import { Route } from "../map/Route";
import { PLACES, Cam } from "../map/geo";
import { Battle3D, BParams, DEFAULT, Tag3D, project } from "../battle/Battle3D";
import { PaintingFolio, QuoteCard } from "./Cards";
import { TitleCard, ClockCard, Genealogy, Nobles, Mangoes, Tulughma, Chaldiran, Numbers, Diamond, Treasure, Timeline, Lesson, Caption } from "./Cards2";
import POL from "../polities.json";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const io = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
type P = { f: number; dur: number; s: number[] };
const P_ = (k: keyof typeof PLACES) => PLACES[k];

// ---------- map pieces ----------
const Polity: React.FC<{ id: string; fill: string; stroke?: string; a: number }> = ({ id, fill, stroke = C.gold, a }) => (
  <svg width={4080} height={2760} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: a }}>
    <path d={(POL as Record<string, string>)[id]} fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" fillRule="evenodd" />
  </svg>
);
const MapTag: React.FC<{ at: [number, number]; title: string; sub?: string; color?: string; a: number; up?: number }> = ({ at, title, sub, color = C.gold, a, up = 60 }) => (
  <Standee lon={at[0]} lat={at[1]}>
    <div style={{ position: "relative", translate: "-50% 0", bottom: 8, textAlign: "center", whiteSpace: "nowrap", opacity: a }}>
      <div style={{ fontFamily: F.display, fontSize: 38, color: C.ivory, textShadow: "0 2px 12px #000, 0 0 3px #000" }}>{title}</div>
      {sub && <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 27, color: C.ivoryDim, textShadow: "0 2px 10px #000" }}>{sub}</div>}
      <div style={{ width: 2, height: up, margin: "4px auto 0", background: `linear-gradient(${color}, rgba(0,0,0,0))` }} />
    </div>
  </Standee>
);
const Ring: React.FC<{ at: [number, number]; f: number; a: number; color?: string }> = ({ at, f, a, color = C.goldLight }) => {
  const ph = (f % 45) / 45;
  return (
    <Standee lon={at[0]} lat={at[1]}>
      <svg width={200} height={200} style={{ position: "absolute", left: -100, top: -100, opacity: a, overflow: "visible" }}>
        <circle cx={100} cy={100} r={16 + ph * 60} fill="none" stroke={color} strokeWidth={3} opacity={1 - ph} />
      </svg>
    </Standee>
  );
};
const Flags: React.FC<{ f: number; won: number[]; lost: number[]; at: [number, number] }> = ({ f, won, lost, at }) => (
  <Standee lon={at[0]} lat={at[1]}>
    <div style={{ position: "absolute", left: -220, bottom: 80, display: "flex", gap: 46, scale: "1.8", transformOrigin: "50% 100%" }}>
      {[1497, 1500, 1511].map((y, i) => {
        const w = io(f, won[i], won[i] + 12), l = io(f, lost[i], lost[i] + 12);
        return (
          <div key={y} style={{ opacity: w, textAlign: "center" }}>
            <svg width={60} height={90}><line x1={6} y1={88} x2={6} y2={8 + l * 40} stroke={C.ivory} strokeWidth={4} /><path d={`M6,${8 + l * 40} L54,${18 + l * 40} L6,${30 + l * 40}Z`} fill={l > 0.5 ? "#5a5f6a" : C.malachite} stroke={C.gold} strokeWidth={1.5} /></svg>
            <div style={{ fontFamily: F.body, fontSize: 24, color: C.ivory, textShadow: "0 2px 8px #000" }}>{l > 0.5 ? [1498, 1501, 1512][i] : y}</div>
          </div>
        );
      })}
    </div>
  </Standee>
);

const MapScene: React.FC<{ cam: Cam; children?: React.ReactNode; dim?: number }> = ({ cam, children, dim }) => <MapPlate cam={cam} dim={dim}>{children}</MapPlate>;
const k = (f: number, lon: number, lat: number, zoom: number, tilt: number, rot = 0): [number, Cam] => [f, { lon, lat, zoom, tilt, rot }];

// ---------- the battle shots ----------
type Shot = { p: BParams; tags?: { at: [number, number, number]; title: string; sub?: string; color?: string; a: number }[]; over?: React.ReactNode };
const camLerp = (f: number, keys: [number, [number, number, number], [number, number, number]][]) => {
  let a = keys[0], b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) if (f >= keys[i][0] && f <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
  if (f < keys[0][0]) b = a; if (f > keys[keys.length - 1][0]) a = b;
  const t = a[0] === b[0] ? 0 : interpolate(f, [a[0], b[0]], [0, 1], { easing: Easing.inOut(Easing.sin) });
  const L = (x: number[], y: number[]) => x.map((v, i) => v + (y[i] - v) * t) as [number, number, number];
  return { pos: L(a[1], b[1]), look: L(a[2], b[2]) };
};

const battleShot = (v: string, f: number, dur: number, s: number[]): Shot => {
  const t = f / 30, base = { ...DEFAULT, t };
  const D = dur;
  switch (v) {
    case "lodi-host": return {
      p: { ...base, cam: camLerp(f, [[0, [-120, 9, 95], [-40, 3, 120]], [D, [60, 12, 92], [140, 3, 125]]]), lodi: 1, camp: 1, baburCentre: 0, wings: 0 },
      tags: [{ at: [-10, 9, 113], title: "Ibrahim Lodi", sub: "Sultan of Delhi", color: C.vermilion, a: io(f, 15, 35) * (1 - io(f, D - 25, D - 5)) }],
    };
    case "babur-army": return { p: { ...base, cam: camLerp(f, [[0, [0, 55, -95], [0, 0, -10]], [D, [20, 42, -70], [0, 0, -10]]]), lodi: 0 } };
    case "archers": {
      const r = interpolate(f, [0, D], [0.02, 0.4], clamp), there = r < 0.5 ? (r * 2) * (r * 2) * (3 - 2 * r * 2) : 1;
      const rz = -6 + there * 175;
      return { p: { ...base, cam: { pos: [-22, 5, rz - 9], look: [-4, 2.2, rz + 4], fov: 34 }, raiders: r, baburCentre: 0, wings: 0, lodi: 0 } };
    }
    case "field-carts": return {
      p: { ...base, cam: camLerp(f, [[0, [-30, 26, -50], [0, 0, 0]], [s[1] ?? D * 0.5, [-14, 12, -24], [6, 0, 2]], [D, [12, 10, -22], [20, 0, 2]]]), carts: ramp(f, 0, (s[1] ?? D * 0.5) - 5), mantelets: ramp(f, s[1] ?? D * 0.4, (s[2] ?? D * 0.75) - 5), guns: ramp(f, s[2] ?? D * 0.75, (s[2] ?? D * 0.75) + 30) },
      tags: [{ at: [-40, 4, 0], title: "Seven hundred carts", sub: "tied with ropes of rawhide", a: io(f, 20, 40) * (1 - io(f, (s[1] ?? 100) - 10, s[1] ?? 100)) },
        { at: [8, 4, 1], title: "Mantelets", sub: "shields for the matchlockmen", a: io(f, (s[1] ?? 100) + 10, (s[1] ?? 100) + 30) * (1 - io(f, (s[2] ?? 200) - 10, s[2] ?? 200)) },
        { at: [20, 4, -4], title: "The guns", a: io(f, (s[2] ?? 200) + 10, (s[2] ?? 200) + 30) }],
    };
    case "field-flanks": return {
      p: { ...base, cam: camLerp(f, [[0, [-60, 40, -110], [-130, 0, 0]], [s[1] ?? D * 0.4, [-60, 40, -110], [-130, 0, 0]], [(s[2] ?? D * 0.7) - 10, [80, 40, -100], [120, 0, 10]], [D, [0, 70, -140], [0, 0, 10]]]), carts: 1, mantelets: 1, guns: 1, town: ramp(f, 0, 50), ditch: ramp(f, s[1] ?? D * 0.4, (s[2] ?? D * 0.7) - 5) },
      tags: [{ at: [-155, 6, 0], title: "Panipat", sub: "houses and suburbs, on his right", a: io(f, 20, 40) * (1 - io(f, (s[1] ?? 100), (s[1] ?? 100) + 20)) },
        { at: [125, 3, 18], title: "Ditches and branches", sub: "on his left", a: io(f, (s[1] ?? 100) + 30, (s[1] ?? 100) + 50) * (1 - io(f, (s[2] ?? 200), (s[2] ?? 200) + 15)) },
        { at: [-50, 4, 3], title: "Sally gaps", sub: "every arrow's flight", a: io(f, (s[2] ?? 200) + 15, (s[2] ?? 200) + 35) }],
    };
    case "field-wide": return { p: { ...base, cam: camLerp(f, [[0, [0, 120, -160], [0, 0, 20]], [D, [-40, 170, -190], [0, 0, 30]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1 } };
    case "field-raids": return {
      p: { ...base, cam: camLerp(f, [[0, [40, 30, -40], [0, 0, 110]], [D, [10, 34, -30], [-10, 0, 130]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: 1, camp: 1, raiders: ((f % 150) / 150) },
      tags: [{ at: [0, 8, 125], title: "Seven or eight days", sub: "skirmishing before the battle", a: io(f, 15, 35) * (1 - io(f, D - 30, D - 10)) }],
    };
    case "field-night": {
      const night = 1 - io(f, (s[2] ?? D * 0.7) - 20, (s[2] ?? D * 0.7) + 20);
      return { p: { ...base, cam: camLerp(f, [[0, [-20, 30, 40], [0, 0, 140]], [D, [-30, 18, 80], [0, 2, 125]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: io(f, (s[2] ?? D * 0.7) - 10, (s[2] ?? D * 0.7) + 10), camp: 1, raiders: interpolate(f, [0, D], [0.05, 0.95], clamp), night, dawn: 1 - night } };
    }
    case "field-dawn": return {
      p: { ...base, cam: camLerp(f, [[0, [12, 10, -30], [0, 2, 60]], [D, [6, 14, -36], [0, 2, 50]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, dawn: 1, scouts: ramp(f, 0, D * 0.9), lodi: 0.0 },
      over: <div style={{ position: "absolute", left: 108, top: 92, fontFamily: F.display, fontSize: 40, color: C.goldLight, opacity: io(f, 10, 30), textShadow: "0 2px 10px #000" }}>Friday · first light</div>,
    };
    case "field-order": return {
      p: { ...base, cam: camLerp(f, [[0, [0, 70, -130], [0, 0, 0]], [D, [0, 95, -150], [0, 0, 20]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, dawn: 0.6 },
      tags: [{ at: [-115, 5, -12], title: "Humayun", sub: "the right wing", color: C.malachite, a: io(f, s[1] ?? 40, (s[1] ?? 40) + 20) },
        { at: [0, 5, -8], title: "Carts and guns", sub: "the centre", a: io(f, s[2] ?? 90, (s[2] ?? 90) + 20) },
        { at: [115, 5, -12], title: "The left wing", color: C.malachite, a: io(f, s[2] ?? 90, (s[2] ?? 90) + 20) },
        { at: [-140, 5, 2], title: "Turning party", color: C.malachite, a: io(f, s[3] ?? 150, (s[3] ?? 150) + 20) },
        { at: [140, 5, 2], title: "Turning party", color: C.malachite, a: io(f, s[3] ?? 150, (s[3] ?? 150) + 20) }],
    };
    case "field-advance": {
      const z = interpolate(f, [0, (s[1] ?? D * 0.5)], [0, 62], { ...clamp, easing: Easing.out(Easing.quad) });
      return {
        p: { ...base, cam: camLerp(f, [[0, [-90, 45, -60], [0, 0, 70]], [D, [-60, 35, -45], [0, 0, 55]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: 1, lodiZ: z, dawn: 0.5 },
        over: <div style={{ position: "absolute", left: 0, right: 0, bottom: 110, textAlign: "center", fontFamily: F.body, fontStyle: "italic", fontSize: 52, color: C.ivory, textShadow: "0 2px 16px #000", opacity: io(f, s[2] ?? D * 0.6, (s[2] ?? D * 0.6) + 20) }}>“To stand or not? To advance or not?”</div>,
      };
    }
    case "field-crush": return { p: { ...base, cam: camLerp(f, [[0, [60, 60, 20], [0, 0, 80]], [D, [40, 70, 10], [0, 0, 70]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: 1, lodiZ: 62 + ramp(f, 0, D) * 6, crush: ramp(f, 10, D), dawn: 0.4 } };
    case "field-sweep": return {
      p: { ...base, cam: camLerp(f, [[0, [0, 150, -120], [0, 0, 70]], [D, [0, 190, -100], [0, 0, 80]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: 1, lodiZ: 68, crush: 1, flank: ramp(f, 10, (s[1] ?? D * 0.5) + 30), arrows: io(f, s[1] ?? D * 0.4, (s[1] ?? D * 0.4) + 30), fire: io(f, s[3] ?? D * 0.75, (s[3] ?? D * 0.75) + 10), dawn: 0.3 },
      tags: [{ at: [-170, 5, 60], title: "Tulughma", sub: "round the flanks", color: C.malachite, a: io(f, 20, 40) * (1 - io(f, (s[2] ?? 150), (s[2] ?? 150) + 20)) }],
    };
    case "field-trap": return { p: { ...base, cam: camLerp(f, [[0, [-110, 70, 40], [0, 0, 90]], [D, [-90, 90, 160], [0, 0, 80]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: 1, lodiZ: 68, crush: 1, flank: 1, arrows: 1, fire: 0.7 } };
    case "clock-noon-battle": return { p: { ...base, cam: camLerp(f, [[0, [0, 200, -60], [0, 0, 70]], [D, [0, 260, -40], [0, 0, 70]]]), carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: 1, lodiZ: 68, crush: 1, flank: 1, arrows: 1 - io(f, D * 0.55, D * 0.7), fire: 0.5, defeat: io(f, D * 0.45, D * 0.75) } };
  }
  return { p: base };
};

const FlankInk: React.FC<{ p: BParams; prog: number }> = ({ p, prog }) => {
  if (prog <= 0) return null;
  const path = (side: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40 * prog; i++) {
      const t = i / 40, p0 = [side * 140, -4], p1 = [side * 215, 70], p2 = [side * 60, 115 - p.lodiZ + 80];
      const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], z = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
      const q = project(p, [x, 0.5, z]); pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
    }
    return "M" + pts.join("L");
  };
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      {[-1, 1].map((sd) => <g key={sd}><path d={path(sd)} fill="none" stroke="rgba(3,6,14,0.7)" strokeWidth={14} strokeLinecap="round" /><path d={path(sd)} fill="none" stroke={C.malachite} strokeWidth={7} strokeLinecap="round" strokeDasharray="18 12" /></g>)}
    </svg>
  );
};

const BattleShot: React.FC<{ v: string } & P> = ({ v, f, dur, s }) => {
  const sh = battleShot(v, f, dur, s);
  return (
    <AbsoluteFill>
      <Battle3D p={sh.p} width={1920} height={1080} />
      {sh.tags?.map((t, i) => <Tag3D key={i} p={sh.p} at={t.at} title={t.title} sub={t.sub} color={t.color} opacity={t.a} />)}
      {(v === "field-sweep" || v === "field-trap") && <FlankInk p={sh.p} prog={v === "field-trap" ? 1 : sh.p.flank} />}
      {sh.over}
    </AbsoluteFill>
  );
};

const routeKabul: [number, number][] = [P_("Kabul"), [70.45, 34.43], P_("Peshawar"), P_("Attock"), [73.4, 33.0], P_("Sialkot"), [75.6, 31.4], P_("Sirhind"), [76.78, 30.38], P_("Panipat")];

// ---------- the beat switch ----------
export const Visual: React.FC<{ v: string } & P> = ({ v, f, dur, s }) => {
  const S = (i: number, d = 0) => s[i] ?? d;
  switch (v) {
    case "map-plain": {
      const cam = camAt(f, [k(0, 72.5, 33, 0.55, 18), k(dur * 0.55, 76.2, 30.2, 1.6, 34), k(dur, 77.0, 29.15, 4.6, 48)]);
      return <MapScene cam={cam}>
        <Polity id="Lodi Dynasty|1521" fill="rgba(194,65,43,0.10)" a={io(f, 30, 60) * 0.8} />
        <City name="Delhi" opacity={io(f, dur * 0.55, dur * 0.65)} />
        <City name="Panipat" big color={C.goldLight} opacity={io(f, dur * 0.35, dur * 0.45)} />
        <Ring at={P_("Panipat")} f={f} a={io(f, dur * 0.4, dur * 0.5)} />
        <Route lonlat={[P_("Delhi"), P_("Panipat")]} progress={ramp(f, dur * 0.6, dur * 0.8)} color={C.goldLight} width={4} arrow={false} />
        <MapTag at={[77.35, 29.0]} title="90 km" a={io(f, dur * 0.75, dur * 0.85)} up={10} />
      </MapScene>;
    }
    case "lodi-host": case "babur-army": case "archers": case "field-carts": case "field-flanks": case "field-wide": case "field-raids": case "field-night": case "field-dawn": case "field-order": case "field-advance": case "field-crush": case "field-sweep": case "field-trap":
      return <>
        <BattleShot v={v} f={f} dur={dur} s={s} />
        {v === "lodi-host" && <><Caption title="≈ 100,000 men" sub="as Babur heard it" a={io(f, dur * 0.42, dur * 0.5)} pos="tr" /><Caption title="≈ 1,000 elephants" a={io(f, dur * 0.7, dur * 0.78)} /></>}
        {v === "babur-army" && <Caption title="Babur's army" sub="small, with three advantages" a={io(f, 10, 30)} />}
        {v === "archers" && <Caption title="Mounted archers" sub="trained from childhood to shoot from the saddle" a={io(f, 10, 30)} />}
        {v === "field-wide" && <Caption title="A fortress of wood" sub="on an open plain" a={io(f, 10, 30)} />}
        {v === "field-night" && <Caption title="The night raid" sub="four or five thousand men, lost in the dark" a={io(f, 10, 30) * (1 - io(f, S(2, dur * 0.7) - 20, S(2, dur * 0.7)))} />}
        {v === "field-crush" && <Caption title="The crush" sub="the rear keeps pushing; the front has stopped" a={io(f, 20, 40)} pos="tr" />}
      </>;
    case "babur-portrait": return <PaintingFolio src="img1.jpg" caption="Babur · from the Bāburnāma, 1598" push={[1.0, 1.06]} />;
    case "clock-noon-battle":
      return <><BattleShot v="clock-noon-battle" f={f} dur={dur} s={s} /><ClockCard f={f} dur={S(2, dur * 0.66)} s={s} over />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 100, textAlign: "center", fontFamily: F.body, fontStyle: "italic", fontSize: 50, color: C.ivory, textShadow: "0 2px 16px #000", opacity: io(f, S(2, 200), S(2, 200) + 25) }}>“In one half-day, that armed mass was laid upon the earth.”</div></>;
    case "clock-noon":
      return <ClockCard f={f} dur={dur} s={s} />;
    case "title": return <TitleCard f={f} dur={dur} s={s} />;
    case "map-ferghana": {
      const cam = camAt(f, [k(0, 69.5, 39.2, 1.2, 28), k(dur, 70.6, 39.9, 1.5, 34)]);
      return <><MapScene cam={cam}>
        <City name="Andijan" big color={C.goldLight} opacity={io(f, 10, 30)} />
        <City name="Samarkand" opacity={io(f, 20, 40)} />
        <MapTag at={[71.6, 40.5]} title="Ferghana Valley" sub="born 1483" a={io(f, 15, 35)} up={30} />
      </MapScene><Genealogy f={f} dur={dur} s={s} /></>;
    }
    case "card-falcon": return <QuoteCard pre="Akhsi, June 1494" preSub="Babur's father, Umar Shaikh Mirza, dies in a fall from the fort" who="BABUR · BĀBURNĀMA" lines={[{ at: S(s.length - 1, 40), text: "“He flew, with his pigeons and their house," }, { at: S(s.length - 1, 40) + 40, text: "and became a falcon.”" }]} />;
    case "map-samarkand": {
      const cam = camAt(f, [k(0, 67.4, 39.0, 2.0, 36), k(dur, 67.0, 39.5, 2.6, 42)]);
      const L = S(1, dur * 0.5);
      return <MapScene cam={cam}>
        <City name="Samarkand" big color={C.goldLight} side="l" />
        <Flags f={f} at={P_("Samarkand")} won={[L - 50, L - 30, L - 10]} lost={[L + 15, L + 30, L + 45]} />
      </MapScene>;
    }
    case "map-kabul": {
      const cam = camAt(f, [k(0, 69.6, 37.4, 1.0, 30), k(dur * 0.45, 69.6, 35.4, 1.25, 36), k(dur, 72.5, 32.4, 0.95, 46)]);
      return <MapScene cam={cam}>
        <Polity id="Kingdom of Kabul|1516" fill="rgba(47,138,98,0.16)" a={io(f, 20, 50)} />
        <Route lonlat={[P_("Andijan"), [70.9, 38.6], [69.7, 36.9], P_("Kabul")]} progress={ramp(f, 5, dur * 0.4)} color={C.malachite} width={8} />
        <City name="Andijan" opacity={0.85} /><City name="Kabul" big color={C.goldLight} opacity={io(f, dur * 0.3, dur * 0.4)} />
        <MapTag at={[69.18, 34.53]} title="King of Kabul" sub="1504" a={io(f, dur * 0.35, dur * 0.45) * (1 - io(f, dur * 0.7, dur * 0.8))} />
        <City name="Lahore" opacity={io(f, dur * 0.7, dur * 0.8)} /><City name="Delhi" opacity={io(f, dur * 0.75, dur * 0.85)} />
        <MapTag at={[75.6, 30.2]} title="Hindustan" a={io(f, dur * 0.75, dur * 0.88)} up={10} />
      </MapScene>;
    }
    case "manuscript": return <PaintingFolio src="img6.jpg" caption="A page of the illustrated Bāburnāma, c. 1590" push={[1.0, 1.08]} />;
    case "map-sultanate": {
      const cam = camAt(f, [k(0, 77.5, 29.5, 0.8, 30), k(dur, 78.4, 28.3, 1.05, 38)]);
      return <MapScene cam={cam}>
        <Polity id="Lodi Dynasty|1521" fill="rgba(194,65,43,0.22)" a={io(f, 5, 40)} />
        <City name="Delhi" big color={C.goldLight} /><City name="Agra" /><City name="Jaunpur" opacity={0.85} /><City name="Lahore" opacity={0.85} />
        <MapTag at={[79.6, 27.4]} title="The Lodi Sultanate" sub="Afghan rulers of Delhi, since 1451" a={io(f, 15, 40)} up={20} />
      </MapScene>;
    }
    case "nobles": return <Nobles f={f} dur={dur} s={s} />;
    case "ibrahim": return <Nobles f={f} dur={dur} s={s} broken />;
    case "map-punjab": {
      const cam = camAt(f, [k(0, 74.4, 31.4, 1.6, 36), k(dur * 0.6, 73.5, 32.2, 1.2, 38), k(dur, 71.8, 33.3, 1.1, 40)]);
      return <MapScene cam={cam}>
        <City name="Lahore" big color={C.goldLight} /><City name="Delhi" /><City name="Kabul" opacity={io(f, dur * 0.55, dur * 0.65)} />
        <MapTag at={[74.34, 31.55]} title="Daulat Khan Lodi" sub="governor of the Punjab" a={io(f, 10, 30) * (1 - io(f, dur * 0.5, dur * 0.58))} />
        <Route lonlat={[P_("Lahore"), P_("Sialkot"), P_("Attock"), P_("Peshawar"), P_("Kabul")]} progress={ramp(f, S(3, dur * 0.6), dur - 10)} color={C.goldLight} width={5} />
      </MapScene>;
    }
    case "card-mangoes": return <Mangoes f={f} dur={dur} s={s} />;
    case "map-allies": {
      const cam = camAt(f, [k(0, 74.5, 29.5, 0.7, 32), k(dur, 75.5, 28.0, 0.8, 38)]);
      return <MapScene cam={cam}>
        <Polity id="Lodi Dynasty|1521" fill="rgba(194,65,43,0.15)" a={1} />
        <City name="Kabul" /><City name="Delhi" big color={C.goldLight} /><City name="Agra" /><City name="Chittor" opacity={io(f, S(2, 60), S(2, 60) + 20)} />
        <MapTag at={[74.65, 24.88]} title="Rana Sanga" sub="Rajput king of Mewar" color={C.goldLight} a={io(f, S(2, 60), S(2, 60) + 20)} />
        <Route lonlat={[P_("Kabul"), P_("Peshawar"), P_("Lahore"), P_("Delhi")]} progress={ramp(f, S(2, 60), S(2, 60) + 60)} color={C.malachite} width={6} />
        <Route lonlat={[P_("Chittor"), [76.4, 26.0], P_("Agra")]} progress={ramp(f, S(2, 60) + 30, S(2, 60) + 90)} color={C.goldLight} width={6} />
        <MapTag at={[76.6, 25.7]} title="a promise never kept" a={io(f, S(3, 200), S(3, 200) + 20)} up={10} />
      </MapScene>;
    }
    case "map-raids": {
      const cam = camAt(f, [k(0, 71.8, 33.8, 1.3, 36), k(dur, 72.6, 33.2, 1.5, 40)]);
      const yrs: [string, [number, number][], number][] = [["1519", [P_("Kabul"), P_("Bajaur"), P_("Bhira")], 10], ["1519–20", [P_("Kabul"), P_("Peshawar"), [72.6, 33.3]], 40], ["1520", [P_("Kabul"), P_("Attock"), P_("Sialkot")], 70], ["1524", [P_("Kabul"), P_("Attock"), [73.6, 32.6], P_("Lahore")], 100]];
      return <MapScene cam={cam}>
        {yrs.map(([y, r, at], i) => <Route key={y} lonlat={r} progress={ramp(f, at, at + 40)} color={C.malachite} width={5} opacity={0.85} />)}
        <City name="Kabul" /><City name="Lahore" /><City name="Bajaur" big color={C.goldLight} opacity={io(f, S(1, 90), S(1, 90) + 15)} />
        <MapTag at={P_("Bajaur")} title="Bajaur, 1519" sub="the first matchlocks" a={io(f, S(1, 90), S(1, 90) + 20)} />
      </MapScene>;
    }
    case "map-route": {
      const cam = camAt(f, [k(0, 71.0, 34.0, 1.2, 34), k(dur, 75.0, 31.3, 1.25, 44)]);
      return <MapScene cam={cam}>
        <Route lonlat={routeKabul.slice(0, 9)} progress={ramp(f, 0, dur * 0.9) * 0.92} color={C.malachite} width={8} />
        {["Kabul", "Peshawar", "Lahore", "Sialkot", "Sirhind"].map((n) => <City key={n} name={n} opacity={0.9} />)}
        <MapTag at={P_("Milwat")} title="Milwat" sub="Daulat Khan surrenders" a={io(f, S(2, 150), S(2, 150) + 20)} />
        <div style={{}} />
      </MapScene>;
    }
    case "map-indus": {
      const cam = camAt(f, [k(0, 72.0, 34.2, 2.2, 40), k(dur, 72.4, 33.8, 2.8, 48)]);
      return <><MapScene cam={cam}>
        <Route lonlat={[P_("Peshawar"), P_("Attock"), [73.4, 33.0]]} progress={ramp(f, 0, dur * 0.7)} color={C.malachite} width={8} />
        <City name="Peshawar" /><City name="Attock" opacity={0.9} />
        <MapTag at={[72.24, 33.95]} title="The Indus" sub="December 1525" a={io(f, 10, 30)} />
      </MapScene><Caption title="12,000 people" sub="soldiers, servants and traders together" a={io(f, S(1, 60), S(1, 60) + 20)} pos="tr" /></>;
    }
    case "map-humayun": {
      const cam = camAt(f, [k(0, 75.8, 30.0, 1.6, 40), k(dur, 75.9, 29.6, 1.9, 46)]);
      return <MapScene cam={cam}>
        <Route lonlat={routeKabul.slice(6, 9)} progress={1} color={C.malachite} width={8} arrow={false} />
        <Route lonlat={[[76.6, 30.6], [76.2, 29.9], P_("Hisar")]} progress={ramp(f, 10, dur * 0.6)} color={C.malachite} width={6} />
        <City name="Hisar" big color={C.goldLight} opacity={io(f, 20, 40)} /><City name="Delhi" /><City name="Sirhind" />
        <MapTag at={P_("Hisar")} title="Humayun's first battle" sub="February 1526 · Hamid Khan routed" a={io(f, dur * 0.4, dur * 0.5)} />
      </MapScene>;
    }
    case "map-converge": {
      const cam = camAt(f, [k(0, 77.0, 29.8, 2.0, 40), k(dur, 77.0, 29.4, 3.4, 50)]);
      return <MapScene cam={cam}>
        <Route lonlat={[[76.78, 30.38], [76.9, 29.8], [76.97, 29.47]]} progress={ramp(f, 0, dur * 0.8)} color={C.malachite} width={9} />
        <Route lonlat={[P_("Delhi"), [77.1, 29.0], [76.99, 29.31]]} progress={ramp(f, 10, dur * 0.85)} color={C.vermilion} width={9} />
        <City name="Delhi" /><City name="Panipat" big color={C.goldLight} opacity={io(f, dur * 0.5, dur * 0.6)} />
        <MapTag at={[76.75, 30.1]} title="Babur" color={C.malachite} a={io(f, 10, 30)} up={20} /><MapTag at={[77.25, 28.95]} title="Ibrahim" color={C.vermilion} a={io(f, 20, 40)} up={20} />
      </MapScene>;
    }
    case "diagram-tulughma": return <Tulughma f={f} dur={dur} s={s} />;
    case "guns": return <><PaintingFolio src="img5.jpg" caption="Early matchlocks · from the Bāburnāma" push={[1.0, 1.08]} /><Caption title="Ustad Ali Quli · Mustafa" sub="Babur's gunners" a={io(f, S(1, 40), S(1, 40) + 20)} /></>;
    case "map-chaldiran": return <Chaldiran f={f} dur={dur} s={s} />;
    case "quote-fear": return <QuoteCard who="BABUR · BĀBURNĀMA" bg="deo.jpg" lines={[{ at: S(1, 50), text: "“Some in the army were very anxious and full of fear …" }, { at: S(2, 120), text: "with a two or three months’ journey between them and their homes …" }, { at: S(3, 260), text: "none knew their tongue, nor did they know ours.”" }]} />;
    case "painting-death": return <PaintingFolio src="ibrahim.jpg" caption="The death of Sultan Ibrāhīm · Bāburnāma" push={[1.0, 1.1]} focus={[0.5, 0.6]} />;
    case "dead-count": return <Numbers f={f} dur={dur} s={s} />;
    case "gwalior": {
      const cam = camAt(f, [k(0, 77.6, 27.4, 1.6, 40), k(dur, 78.0, 26.6, 2.0, 46)]);
      return <MapScene cam={cam}><City name="Gwalior" big color={C.goldLight} /><City name="Agra" /><City name="Delhi" />
        <MapTag at={P_("Gwalior")} title="Raja Vikramajit" sub="of Gwalior, killed fighting for the Sultan" a={io(f, 10, 30)} /></MapScene>;
    }
    case "tomb": {
      const cam = camAt(f, [k(0, 76.97, 29.39, 3.0, 40), k(dur, 76.97, 29.39, 5.5, 52)]);
      return <MapScene cam={cam}><City name="Panipat" big color={C.goldLight} /><Ring at={P_("Panipat")} f={f} a={1} />
        <MapTag at={P_("Panipat")} title="Tomb of Ibrahim Lodi" sub="Panipat" a={io(f, 10, 30)} up={80} /></MapScene>;
    }
    case "map-delhi-agra": {
      const cam = camAt(f, [k(0, 77.3, 28.9, 1.6, 40), k(dur, 77.6, 28.2, 1.4, 44)]);
      return <MapScene cam={cam}>
        <Route lonlat={[P_("Panipat"), [77.3, 28.6], [77.7, 27.8], P_("Agra")]} progress={ramp(f, 10, dur * 0.4)} color={C.malachite} width={8} />
        <Route lonlat={[P_("Panipat"), [77.15, 29.0], P_("Delhi")]} progress={ramp(f, 30, dur * 0.45)} color={C.malachite} width={6} />
        <City name="Panipat" /><City name="Delhi" big color={C.goldLight} /><City name="Agra" big color={C.goldLight} />
        <MapTag at={P_("Agra")} title="Humayun" sub="to seize the treasury" color={C.malachite} a={io(f, dur * 0.3, dur * 0.4)} />
        <MapTag at={P_("Delhi")} title="The khutba" sub="read in Babur's name · 27 April" a={io(f, S(1, dur * 0.6), S(1, dur * 0.6) + 20)} />
      </MapScene>;
    }
    case "diamond": return <Diamond f={f} dur={dur} s={s} />;
    case "treasure": return <Treasure f={f} dur={dur} s={s} />;
    case "heat": {
      const cam = camAt(f, [k(0, 78.0, 27.2, 2.2, 40), k(dur, 78.0, 27.2, 1.5, 34)]);
      return <><MapScene cam={cam} dim={0.1}><City name="Agra" big color={C.goldLight} /></MapScene>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, rgba(255,140,40,${0.35 * io(f, 0, 60)}), rgba(160,40,10,${0.25 * io(f, 0, 60)}) 70%)`, mixBlendMode: "screen" }} />
        <Caption title="The hot season" sub="Agra, summer 1526" a={io(f, 10, 30)} /></>;
    }
    case "quote-council": return <QuoteCard who="BABUR, TO HIS COMMANDERS" lines={[{ at: S(1, 40), text: "“Was it for us to remain in Kabul," }, { at: S(1, 40) + 45, text: "the sport of harsh poverty?”" }]} />;
    case "quote-wall": return <QuoteCard who="KHWAJA KALAN, ON HIS WALL IN DELHI" bg="img10.jpg" lines={[{ at: S(1, 60), text: "“If safe and sound I cross the Sind," }, { at: S(1, 60) + 40, text: "blacken my face ere I wish for Hind!”" }]} />;
    case "map-threats": {
      const cam = camAt(f, [k(0, 78.4, 27.6, 1.0, 36), k(dur, 77.6, 27.0, 0.9, 42)]);
      const forts = ["Sambhal", "Bayana", "Mewat", "Dholpur", "Gwalior", "Etawah", "Kalpi", "Kannauj"] as const;
      return <MapScene cam={cam}>
        <City name="Delhi" big color={C.malachite} /><City name="Agra" big color={C.malachite} />
        {forts.map((n, i) => <React.Fragment key={n}><City name={n} color={C.vermilion} opacity={io(f, 10 + i * 8, 25 + i * 8)} /></React.Fragment>)}
        <City name="Chittor" opacity={io(f, S(2, 150), S(2, 150) + 20)} />
        <MapTag at={P_("Chittor")} title="Rana Sanga" sub="gathering an army" color={C.goldLight} a={io(f, S(2, 150), S(2, 150) + 20)} />
      </MapScene>;
    }
    case "khanwa": return <><PaintingFolio src="img4.jpg" caption="Babur's army against Rana Sanga · Bāburnāma" push={[1.0, 1.1]} focus={[0.5, 0.4]} /><Caption title="Khanwa" sub="March 1527" a={io(f, 10, 30)} /></>;
    case "babur-end": return <PaintingFolio src="img7.jpg" caption="Timur hands the crown to Babur, as Humayun looks on · Govardhan, c. 1630" push={[1.0, 1.08]} focus={[0.5, 0.45]} />;
    case "timeline-panipat": return <Timeline f={f} dur={dur} s={s} />;
    case "lesson": return <Lesson f={f} dur={dur} s={s} />;
    case "mosque": return <PaintingFolio src="img8.jpg" caption="Kabuli Bagh mosque, Panipat · photo Ramesh Lalwani, CC BY-SA 3.0" push={[1.0, 1.08]} />;
  }
  return <AbsoluteFill style={{ background: C.lapis }} />;
};
