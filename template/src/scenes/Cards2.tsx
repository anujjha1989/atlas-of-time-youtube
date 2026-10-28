import React from "react";
import { AbsoluteFill, interpolate, Easing, random } from "remotion";
import { evolvePath } from "@remotion/paths";
import { C, F, clamp } from "../theme";
import { Marble } from "./Cards";
import { Shamsa } from "../ui/Ornament";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const io = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
type P = { f: number; dur: number; s: number[] };   // local frame, duration, sentence start frames

const Ink: React.FC<{ d: string; p: number; color?: string; w?: number; dash?: boolean }> = ({ d, p, color = C.gold, w = 4, dash }) => {
  const ev = evolvePath(Math.max(0.0001, Math.min(1, p)), d);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? undefined : ev.strokeDasharray} strokeDashoffset={dash ? undefined : ev.strokeDashoffset} opacity={dash ? p : 1} />;
};
const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; a?: number; italic?: boolean; anchor?: "middle" | "start" | "end" }> = ({ x, y, text, size = 34, color = C.ivory, a = 1, italic, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={italic ? F.body : F.display} fontStyle={italic ? "italic" : "normal"} fontSize={size} fill={color} opacity={a}>{text}</text>
);
export const Caption: React.FC<{ title: string; sub?: string; a: number; pos?: "bl" | "tl" | "tr" }> = ({ title, sub, a, pos = "bl" }) => (
  <div style={{ position: "absolute", left: pos === "tr" ? undefined : 108, right: pos === "tr" ? 108 : undefined, bottom: pos === "bl" ? 92 : undefined, top: pos !== "bl" ? 92 : undefined, opacity: a, textAlign: pos === "tr" ? "right" : "left" }}>
    <div style={{ fontFamily: F.display, fontSize: 46, color: C.ivory, textShadow: "0 2px 14px rgba(0,0,0,0.9)" }}>{title}</div>
    {sub && <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 30, color: C.ivoryDim, textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>{sub}</div>}
    <div style={{ marginTop: 10, width: 260 * a, height: 1.5, background: C.gold, marginLeft: pos === "tr" ? "auto" : 0 }} />
  </div>
);

export const TitleCard: React.FC<P> = ({ f, dur }) => {
  const a = io(f, 0, 30) * interpolate(f, [dur - 20, dur], [1, 0], clamp);
  return (
    <AbsoluteFill><Marble />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: a }}>
        <div style={{ position: "absolute", top: 150 }}><Shamsa size={250} rotate={f * 0.1} /></div>
        <div style={{ position: "absolute", top: 450, fontFamily: F.display, fontSize: 170, color: C.goldLight, letterSpacing: 10, scale: `${interpolate(f, [0, dur], [1.04, 1], clamp)}` }}>Panipat</div>
        <div style={{ position: "absolute", top: 650, fontFamily: F.display, fontSize: 64, color: C.ivory, letterSpacing: 18, opacity: io(f, 20, 50) }}>1526</div>
        <div style={{ position: "absolute", top: 760, fontFamily: F.body, fontStyle: "italic", fontSize: 40, color: C.ivoryDim, opacity: io(f, 45, 80) }}>The battle that founded the Mughal Empire</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// A sun-dial clock from first light to noon, with the two names either side.
export const ClockCard: React.FC<P & { over?: boolean }> = ({ f, dur, over }) => {
  const p = interpolate(f, [10, dur - 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const hr = 6 + 6 * p, an = (hr / 12) * Math.PI * 2;
  const R = 230, cx = 960, cy = 470;
  const a = io(f, 0, 20);
  return (
    <AbsoluteFill>{!over && <Marble />}
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: a }}>
        {over && <rect width={1920} height={1080} fill="rgba(4,8,20,0.55)" />}
        <circle cx={cx} cy={cy} r={R} fill="rgba(7,15,36,0.85)" stroke={C.gold} strokeWidth={3} />
        <circle cx={cx} cy={cy} r={R - 16} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.6} />
        <path d={`M${cx},${cy} L${cx},${cy + R - 22} A${R - 22},${R - 22} 0 ${an - Math.PI > Math.PI ? 1 : 0} 1 ${cx + Math.sin(an) * (R - 22)},${cy - Math.cos(an) * (R - 22)} Z`} fill="rgba(201,162,74,0.22)" />
        {Array.from({ length: 12 }, (_, i) => { const t = (i / 12) * Math.PI * 2; return <line key={i} x1={cx + Math.sin(t) * (R - 30)} y1={cy - Math.cos(t) * (R - 30)} x2={cx + Math.sin(t) * (R - 8)} y2={cy - Math.cos(t) * (R - 8)} stroke={C.gold} strokeWidth={3} />; })}
        <line x1={cx} y1={cy} x2={cx + Math.sin(an) * (R - 60)} y2={cy - Math.cos(an) * (R - 60)} stroke={C.goldLight} strokeWidth={8} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={12} fill={C.goldLight} />
        <Label x={cx} y={cy + R + 80} text={hr >= 11.95 ? "Noon" : hr < 6.5 ? "First light" : "Morning"} size={52} color={C.goldLight} />
        {!over && <><Label x={cx - 560} y={cy + 20} text="Babur" size={64} a={io(f, 15, 40)} /><Label x={cx + 560} y={cy + 20} text="Ibrahim Lodi" size={64} a={io(f, 15, 40)} />
          <rect x={cx - 640} y={cy + 44} width={160} height={4} fill={C.malachite} opacity={io(f, 15, 40)} /><rect x={cx + 480} y={cy + 44} width={160} height={4} fill={C.vermilion} opacity={io(f, 15, 40)} /></>}
      </svg>
    </AbsoluteFill>
  );
};

export const Genealogy: React.FC<P> = ({ f, dur }) => {
  const a = io(f, 10, 40) * interpolate(f, [dur - 15, dur], [1, 0], clamp);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: a }}>
      <rect x={1180} y={210} width={600} height={560} fill="rgba(7,15,36,0.88)" stroke={C.gold} strokeWidth={2} />
      <rect x={1192} y={222} width={576} height={536} fill="none" stroke={C.gold} strokeWidth={0.8} opacity={0.6} />
      <Label x={1340} y={300} text="Timur" size={42} color={C.goldLight} a={io(f, 20, 40)} /><Label x={1340} y={336} text="d. 1405" size={26} italic a={io(f, 20, 40)} color={C.ivoryDim} />
      <Label x={1620} y={300} text="Genghis Khan" size={42} color={C.goldLight} a={io(f, dur * 0.55, dur * 0.55 + 20)} /><Label x={1620} y={336} text="d. 1227" size={26} italic color={C.ivoryDim} a={io(f, dur * 0.55, dur * 0.55 + 20)} />
      <Ink d="M1340,360 L1340,560 L1480,620" p={io(f, 30, 70)} w={3} />
      <Ink d="M1620,360 L1620,560 L1480,620" p={io(f, dur * 0.55 + 10, dur * 0.55 + 50)} w={3} />
      <Label x={1375} y={470} text="father's line" size={26} italic anchor="start" color={C.ivoryDim} a={io(f, 40, 60)} />
      <Label x={1585} y={470} text="mother's line" size={26} italic anchor="end" color={C.ivoryDim} a={io(f, dur * 0.55 + 20, dur * 0.55 + 40)} />
      <circle cx={1480} cy={660} r={44} fill={C.malachiteDark} stroke={C.gold} strokeWidth={2} opacity={io(f, 50, 70)} />
      <Label x={1480} y={672} text="Babur" size={36} a={io(f, 50, 70)} />
      <Label x={1480} y={740} text="b. 1483, Ferghana" size={26} italic color={C.ivoryDim} a={io(f, 55, 75)} />
    </svg>
  );
};

// The Lodi state as a partnership, and Ibrahim breaking it.
export const Nobles: React.FC<P & { broken?: boolean }> = ({ f, dur, s, broken }) => {
  const cx = 960, cy = 520, N = 9;
  const brk = broken ? io(f, s[1] ?? 40, (s[1] ?? 40) + 40) : 0;
  const rebels = broken ? io(f, s[2] ?? 120, (s[2] ?? 120) + 40) : 0;
  return (
    <AbsoluteFill><Marble />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {Array.from({ length: N }, (_, i) => {
          const t = (i / N) * Math.PI * 2 - Math.PI / 2, R = 300 + brk * (i % 3 === 0 ? 70 : 0);
          const x = cx + Math.cos(t) * R * 1.35, y = cy + Math.sin(t) * R;
          const app = io(f, 10 + i * 6, 40 + i * 6);
          const red = brk > 0 && i % 3 === 0;
          const rebel = rebels > 0 && (i === 2 || i === 3);
          return (
            <g key={i} opacity={app * (red ? 1 - brk * 0.65 : 1)}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={C.gold} strokeWidth={2.5} strokeDasharray={brk > 0 ? `${12 - brk * 8} ${brk * 14}` : undefined} opacity={0.75 - brk * 0.45} />
              <circle cx={x} cy={y} r={46} fill={rebel ? C.vermilionDark : C.lapis} stroke={red ? C.vermilion : C.gold} strokeWidth={3} />
              <path d={`M${x - 16},${y + 14} L${x - 16},${y - 4} L${x - 8},${y - 16} L${x},${y - 4} L${x + 8},${y - 16} L${x + 16},${y - 4} L${x + 16},${y + 14}Z`} fill={C.gold} opacity={0.85} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={86} fill={C.vermilionDark} stroke={C.gold} strokeWidth={4} opacity={io(f, 0, 20)} />
        <Label x={cx} y={cy - 4} text="The Sultan" size={34} a={io(f, 0, 20)} />
        <Label x={cx} y={cy + 34} text={broken ? "Ibrahim, 1517" : "first among equals"} size={24} italic color={C.ivoryDim} a={io(f, 5, 25)} />
        {broken && <Label x={1600} y={260} text="The east rebels" size={36} color={C.vermilion} a={rebels} />}
      </svg>
      {!broken && <div style={{ position: "absolute", left: 108, bottom: 92, fontFamily: F.body, fontStyle: "italic", fontSize: 30, color: C.ivoryDim, opacity: io(f, 30, 60) }}>The great Afghan nobles, each with lands and troops of his own</div>}
    </AbsoluteFill>
  );
};

export const Mangoes: React.FC<P> = ({ f, dur }) => {
  const a = io(f, 0, 25);
  const mango = (x: number, y: number, r: number, k: number) => (
    <g key={k} transform={`translate(${x},${y}) rotate(${-25 + k * 30})`} opacity={io(f, 20 + k * 12, 50 + k * 12)}>
      <path d={`M0,${-r} C${r * 0.9},${-r} ${r * 1.1},${r * 0.6} ${r * 0.1},${r * 1.05} C${-r * 0.7},${r * 1.2} ${-r * 0.95},${-r * 0.3} 0,${-r}Z`} fill="url(#mg)" stroke={C.gold} strokeWidth={2.5} />
      <path d={`M0,${-r} q ${r * 0.12},${-r * 0.3} ${r * 0.38},${-r * 0.4}`} stroke="#5d7a3a" strokeWidth={5} fill="none" />
      <path d={`M${r * 0.38},${-r * 1.4} q ${r * 0.5},${-r * 0.1} ${r * 0.8},${r * 0.25} q ${-r * 0.4},${r * 0.2} ${-r * 0.8},${-r * 0.25}Z`} fill="#3f6b3a" stroke={C.gold} strokeWidth={1.2} />
    </g>
  );
  return (
    <AbsoluteFill><Marble />
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: a }}>
        <defs><radialGradient id="mg" cx="35%" cy="35%" r="70%"><stop offset="0" stopColor="#f2c14e" /><stop offset="0.6" stopColor="#d98a2b" /><stop offset="1" stopColor="#8f5a1b" /></radialGradient></defs>
        <ellipse cx={960} cy={700} rx={430} ry={70} fill="none" stroke={C.gold} strokeWidth={3} opacity={io(f, 5, 30)} />
        <path d="M560,690 Q960,860 1360,690" fill="rgba(201,162,74,0.12)" stroke={C.gold} strokeWidth={3} opacity={io(f, 5, 30)} />
        {mango(820, 580, 95, 0)}{mango(990, 560, 105, 1)}{mango(1140, 600, 90, 2)}
        <Label x={960} y={240} text="A sign from Hindustan" size={60} color={C.goldLight} a={io(f, 10, 35)} />
        <Label x={960} y={880} text="half-ripe mangoes, preserved in honey" size={38} italic a={io(f, dur * 0.55, dur * 0.55 + 25)} />
      </svg>
      <div style={{ position: "absolute", right: 108, bottom: 70, fontFamily: F.body, fontStyle: "italic", fontSize: 24, color: C.ivoryDim, opacity: a }}>as told by Ahmad Yadgar, Tārīkh-i Salāṭīn-i Afāghina</div>
    </AbsoluteFill>
  );
};

// A battle-plan diagram in gold ink: the tulughma.
export const Tulughma: React.FC<P> = ({ f, dur }) => {
  const sw = io(f, dur * 0.35, dur * 0.85);
  return (
    <AbsoluteFill><Marble />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Label x={960} y={170} text="Tulughma" size={72} color={C.goldLight} a={io(f, 0, 25)} />
        <Label x={960} y={220} text="the flanking sweep of the steppe" size={32} italic color={C.ivoryDim} a={io(f, 10, 35)} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={560 + i * 90} y={560} width={70} height={46} fill={C.vermilion} stroke={C.gold} strokeWidth={1.5} opacity={io(f, 15 + i * 2, 35 + i * 2)} />)}
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={690 + i * 115} y={820} width={80} height={34} fill={C.malachite} stroke={C.gold} strokeWidth={1.5} opacity={io(f, 25, 45)} />)}
        <rect x={470} y={815} width={60} height={30} fill={C.malachite} stroke={C.gold} strokeWidth={1.5} opacity={io(f, 30, 50)} />
        <rect x={1390} y={815} width={60} height={30} fill={C.malachite} stroke={C.gold} strokeWidth={1.5} opacity={io(f, 30, 50)} />
        <Ink d="M500,810 C 300,700 330,470 560,450 C 700,440 820,470 900,500" p={sw} color={C.malachite} w={10} />
        <Ink d="M1420,810 C 1620,700 1590,470 1360,450 C 1220,440 1100,470 1020,500" p={sw} color={C.malachite} w={10} />
        <Label x={960} y={960} text="small units on the far ends ride round to strike the sides and rear" size={30} italic a={io(f, dur * 0.5, dur * 0.5 + 25)} />
      </svg>
    </AbsoluteFill>
  );
};

export const Chaldiran: React.FC<P> = ({ f, dur }) => {
  const charge = io(f, dur * 0.3, dur * 0.7), smoke = io(f, dur * 0.55, dur * 0.8);
  return (
    <AbsoluteFill><Marble />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Label x={960} y={170} text="Chaldiran, 1514" size={66} color={C.goldLight} a={io(f, 0, 25)} />
        <Label x={960} y={220} text="Ottoman guns behind carts against the cavalry of Safavid Persia" size={32} italic color={C.ivoryDim} a={io(f, 10, 35)} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={480 + i * 70} y={720} width={56} height={20} fill="#8a5a2e" stroke={C.gold} strokeWidth={1} opacity={io(f, 10 + i, 25 + i)} />)}
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={560 + i * 160} cy={770} r={12} fill="#3a3836" stroke={C.gold} strokeWidth={1.5} opacity={io(f, 25, 40)} />)}
        <Label x={960} y={840} text="Ottomans" size={36} a={io(f, 20, 40)} />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={520 + i * 115} y={380 + charge * 230 - (i % 2) * 20} width={80} height={40} fill="#2c6aa0" stroke={C.gold} strokeWidth={1.5} opacity={io(f, 15, 35) * (1 - smoke * 0.5)} />)}
        <Label x={960} y={340} text="Safavid horse" size={36} a={io(f, 20, 40)} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={560 + i * 160} cy={690 - smoke * 40} r={20 + smoke * 50} fill="#e9e4da" opacity={smoke * 0.35} />)}
      </svg>
    </AbsoluteFill>
  );
};

export const Numbers: React.FC<P> = ({ f, dur, s }) => {
  const b = s[1] ?? dur * 0.5;
  return (
    <AbsoluteFill><Marble />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 300, textAlign: "center", opacity: io(f, 0, 25) * (1 - io(f, b - 10, b + 10) * 0.6) }}>
          <div style={{ fontFamily: F.display, fontSize: 150, color: C.ivory }}>15 – 16,000</div>
          <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 36, color: C.ivoryDim }}>Babur's count of the dead, on the field</div>
        </div>
        <div style={{ position: "absolute", top: 640, textAlign: "center", opacity: io(f, b, b + 25) }}>
          <div style={{ fontFamily: F.display, fontSize: 150, color: C.vermilion }}>40 – 50,000</div>
          <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 36, color: C.ivoryDim }}>what he was told later, in Agra</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Diamond: React.FC<P> = ({ f, dur, s }) => {
  const rot = f * 0.6, cx = 960, cy = 470;
  const facets = Array.from({ length: 8 }, (_, i) => i);
  const glint = (Math.sin(f / 9) + 1) / 2;
  return (
    <AbsoluteFill><Marble />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.5" stopColor="#b8d4f0" /><stop offset="1" stopColor="#5a7fa8" /></linearGradient></defs>
        <g transform={`translate(${cx},${cy})`} opacity={io(f, 0, 30)}>
          {facets.map((i) => {
            const a0 = ((i / 8) * 360 + rot) * Math.PI / 180, a1 = (((i + 1) / 8) * 360 + rot) * Math.PI / 180;
            const w0 = Math.cos(a0) * 170, w1 = Math.cos(a1) * 170;
            return (
              <g key={i} opacity={Math.sin(a0) > -0.2 ? 1 : 0.35}>
                <path d={`M0,-150 L${w0},-60 L${w1},-60Z`} fill="url(#dg)" stroke={C.gold} strokeWidth={1.2} opacity={0.6 + 0.4 * Math.abs(Math.sin(a0))} />
                <path d={`M${w0},-60 L0,170 L${w1},-60Z`} fill="url(#dg)" stroke={C.gold} strokeWidth={1.2} opacity={0.45 + 0.5 * Math.abs(Math.cos(a1))} />
              </g>
            );
          })}
          <circle cx={60} cy={-90} r={10 + glint * 14} fill="#fff" opacity={glint * 0.9} />
        </g>
        <Label x={960} y={790} text="“two and a half days’ food for the whole world”" size={50} italic a={io(f, s[1] ?? 60, (s[1] ?? 60) + 25)} />
        <Label x={960} y={850} text="— Babur, on the diamond given to Humayun" size={30} italic color={C.ivoryDim} a={io(f, (s[1] ?? 60) + 10, (s[1] ?? 60) + 35)} />
        <Label x={960} y={940} text="later identified by some with the Koh-i-Noor" size={30} color={C.goldLight} a={io(f, s[2] ?? 200, (s[2] ?? 200) + 25)} />
      </svg>
    </AbsoluteFill>
  );
};

export const Treasure: React.FC<P> = ({ f, dur, s }) => {
  const coins = Array.from({ length: 140 }, (_, i) => ({ x: random(`cx${i}`) * 1920, d: random(`cd${i}`) * 200, sp: 4 + random(`cs${i}`) * 6, r: 10 + random(`cr${i}`) * 10 }));
  const last = s[s.length - 1] ?? dur * 0.7;
  return (
    <AbsoluteFill><Marble />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {coins.map((c, i) => { const y = -40 + ((f - c.d) * c.sp); if (y < -40 || y > 1120) return null; return <ellipse key={i} cx={c.x} cy={y} rx={c.r * Math.abs(Math.cos(f / 8 + i))} ry={c.r} fill={C.gold} stroke={C.goldDark} strokeWidth={1.5} opacity={0.55} />; })}
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 260, textAlign: "center", opacity: io(f, s[1] ?? 40, (s[1] ?? 40) + 20) * (1 - io(f, last - 10, last + 5) * 0.7) }}>
          <div style={{ fontFamily: F.display, fontSize: 130, color: C.goldLight }}>70 lakhs</div>
          <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 36, color: C.ivory }}>to Humayun, and a treasure house unopened</div>
        </div>
        <div style={{ position: "absolute", top: 600, textAlign: "center", opacity: io(f, last, last + 25) }}>
          <div style={{ fontFamily: F.display, fontSize: 96, color: C.ivory }}>One coin for every soul in Kabul</div>
          <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 36, color: C.ivoryDim }}>man and woman, slave and free, young and old</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Timeline: React.FC<P> = ({ f, dur }) => {
  const items: [number, string, string][] = [[1526, "Panipat", "Babur defeats Ibrahim Lodi"], [1527, "Khanwa", "Babur defeats Rana Sanga"], [1530, "Babur dies", "in Agra"], [1540, "Humayun", "loses to Sher Shah Suri"], [1555, "Humayun", "returns to Delhi"], [1556, "Panipat II", "Akbar's army defeats Hemu"], [1761, "Panipat III", "Marathas and Ahmad Shah Durrani"]];
  const x0 = 200, x1 = 1720, y0 = 1526, y1 = 1761;
  const XS: Record<number, number> = { 1526: 240, 1527: 470, 1530: 700, 1540: 930, 1555: 1160, 1556: 1390, 1761: 1680 };
  const X = (y: number) => XS[y] ?? x1;
  return (
    <AbsoluteFill><Marble />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Ink d={`M${x0},560 L1460,560`} p={io(f, 0, 60)} w={3} />
        <Ink d="M1480,560 L1520,560 M1540,560 L1580,560" p={io(f, 50, 70)} w={3} />
        <Ink d="M1600,560 L1740,560" p={io(f, 60, 80)} w={3} />
        {items.map(([y, t, d], i) => {
          const at = (i / items.length) * dur * 0.8, x = X(y), up = i % 2 === 0;
          return (
            <g key={i} opacity={io(f, at, at + 20)}>
              <circle cx={x} cy={560} r={i === 0 || i === 5 || i === 6 ? 14 : 9} fill={i === 0 || i === 5 || i === 6 ? C.gold : C.lapis} stroke={C.gold} strokeWidth={3} />
              <line x1={x} y1={560} x2={x} y2={up ? 460 : 660} stroke={C.gold} strokeWidth={1.2} opacity={0.6} />
              <Label x={x} y={up ? 400 : 730} text={String(y)} size={44} color={C.goldLight} />
              <Label x={x} y={up ? 440 : 770} text={t} size={30} />
              <Label x={x} y={up ? 330 : 810} text={d} size={24} italic color={C.ivoryDim} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Lesson: React.FC<P> = ({ f, dur, s }) => {
  const items = [
    { t: "A prepared|position", d: "carts, ditches, a town", at: s[2] ?? 60 },
    { t: "Firepower|in the centre", d: "guns and matchlocks", at: (s[2] ?? 60) + 70 },
    { t: "Horse archers|on the flanks", d: "the tulughma", at: (s[2] ?? 60) + 140 },
    { t: "An enemy who|walked into it", d: "", at: s[3] ?? (s[2] ?? 60) + 220 },
  ];
  return (
    <AbsoluteFill><Marble />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Label x={960} y={200} text="Why Babur won" size={70} color={C.goldLight} a={io(f, s[1] ?? 20, (s[1] ?? 20) + 25)} />
        {items.map((it, i) => (
          <g key={i} opacity={io(f, it.at, it.at + 25)}>
            <g transform={`translate(${330 + i * 420},520)`}><Shamsa size={0} /></g>
            <circle cx={330 + i * 420} cy={500} r={95} fill={i === 3 ? C.vermilionDark : C.lapis} stroke={C.gold} strokeWidth={3} />
            {i === 0 && <g transform="translate(330,500)">{Array.from({ length: 5 }, (_, k) => <rect key={k} x={-80 + k * 32} y={-10} width={28} height={16} fill="#8a5a2e" stroke={C.gold} />)}</g>}
            {i === 1 && <g transform="translate(750,500)"><rect x={-50} y={-6} width={100} height={22} rx={10} fill="#3a3836" stroke={C.gold} strokeWidth={2} /><circle cx={-26} cy={30} r={16} fill="none" stroke={C.gold} strokeWidth={4} /><circle cx={26} cy={30} r={16} fill="none" stroke={C.gold} strokeWidth={4} /></g>}
            {i === 2 && <path d="M1110,560 C 1080,470 1150,420 1230,440" fill="none" stroke={C.malachite} strokeWidth={10} strokeLinecap="round" />}
            {i === 3 && <g transform="translate(1590,500)">{Array.from({ length: 9 }, (_, k) => <rect key={k} x={-45 + (k % 3) * 32} y={-45 + Math.floor(k / 3) * 32} width={26} height={26} fill={C.vermilion} />)}</g>}
            {it.t.split("|").map((ln, j) => <Label key={j} x={330 + i * 420} y={675 + j * 40} text={ln} size={32} />)}
            <Label x={330 + i * 420} y={770} text={it.d} size={26} italic color={C.ivoryDim} />
            {i < 3 && <Label x={540 + i * 420} y={515} text="+" size={60} color={C.gold} />}
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<P> = ({ f, dur }) => {
  const a = io(f, 0, 30) * interpolate(f, [dur - 40, dur], [1, 0], clamp);
  return (
    <AbsoluteFill><Marble />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: a }}>
        <Shamsa size={150} rotate={f * 0.1} />
        <div style={{ fontFamily: F.display, fontSize: 72, color: C.goldLight, marginTop: 30 }}>Atlas of Time</div>
        <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 30, color: C.ivoryDim, marginTop: 18, textAlign: "center", lineHeight: 1.5 }}>
          Babur's words from the Bāburnāma, translated by Annette S. Beveridge (1922)<br />Paintings from the Bāburnāma manuscripts, c. 1589–1598 · terrain from Natural Earth<br />Music: “Interloper” and others by Kevin MacLeod (incompetech.com), CC BY 4.0
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
