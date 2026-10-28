import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, F, clamp } from "../theme";
import { Shamsa } from "../ui/Ornament";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Marbled lapis paper, the margin colour of an album page.
export const Marble: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 20%, ${C.lapisMid} 0%, ${C.lapis} 45%, ${C.lapisDeep} 100%)` }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(201,162,74,0.22) 1px, transparent 1.4px)", backgroundSize: "23px 19px", opacity: 0.5 }} />
  </AbsoluteFill>
);

export const ChapterCard: React.FC<{ numeral: string; title: string }> = ({ numeral, title }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: ease }) * interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Marble />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: a }}>
        <div style={{ position: "absolute", top: 170 }}><Shamsa size={300} rotate={frame * 0.12} opacity={0.95} /></div>
        <div style={{ position: "absolute", top: 268, width: 300, textAlign: "center", fontFamily: F.display, fontSize: 84, color: C.goldLight }}>{numeral}</div>
        <div style={{ position: "absolute", top: 560, width: 1500, textAlign: "center", fontFamily: F.display, fontSize: 96, color: C.ivory, letterSpacing: 2,
          translate: `0 ${interpolate(frame, [0, 30], [24, 0], { ...clamp, easing: ease })}px` }}>{title}</div>
        <div style={{ position: "absolute", top: 700, width: interpolate(frame, [8, 40], [0, 520], { ...clamp, easing: ease }), height: 1.5, backgroundColor: C.gold }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// A painting presented as an album folio: gold-ruled, on marbled lapis, with a slow push-in.
export const PaintingFolio: React.FC<{ src: string; caption?: string; focus?: [number, number]; push?: [number, number]; panY?: [number, number] }> = ({ src, caption, focus = [0.5, 0.5], push = [1, 1.08], panY = [0, 0] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], push, clamp);
  const ty = interpolate(frame, [0, durationInFrames], panY, clamp);
  return (
    <AbsoluteFill>
      <Marble />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ height: 900, maxWidth: 1560, padding: 14, border: `2px solid ${C.gold}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", background: C.ink, overflow: "hidden" }}>
          <div style={{ height: 872, overflow: "hidden", outline: `1px solid ${C.gold}` }}>
            <Img src={staticFile(src)} style={{ height: 872, scale: `${s}`, translate: `0 ${ty}px`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%` }} />
          </div>
        </div>
      </AbsoluteFill>
      {caption && <div style={{ position: "absolute", bottom: 64, right: 96, fontFamily: F.body, fontStyle: "italic", fontSize: 26, color: C.ivoryDim }}>{caption}</div>}
    </AbsoluteFill>
  );
};

export const QuoteCard: React.FC<{ lines: { at: number; text: string }[]; who: string; bg?: string; pre?: string; preSub?: string }> = ({ lines, who, bg, pre, preSub }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Marble />
      {bg && <Img src={staticFile(bg)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.12, filter: "blur(6px) grayscale(0.4)" }} />}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
        <div style={{ fontFamily: F.display, fontSize: 200, color: C.gold, position: "absolute", top: 110, left: 230, opacity: 0.5 }}>“</div>
        {pre && <div style={{ position: "absolute", top: 230, width: 1400, textAlign: "center", opacity: interpolate(frame, [0, 20], [0, 1], clamp) }}>
          <div style={{ fontFamily: F.display, fontSize: 64, color: C.goldLight }}>{pre}</div>
          {preSub && <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 32, color: C.ivoryDim, marginTop: 8 }}>{preSub}</div>}
        </div>}
        <div style={{ width: 1560, textAlign: "center", marginTop: pre ? 160 : 0 }}>
          {lines.map((l, i) => {
            const a = interpolate(frame, [l.at, l.at + 20], [0, 1], { ...clamp, easing: ease });
            return <div key={i} style={{ opacity: a, translate: `0 ${(1 - a) * 14}px`, fontFamily: F.body, fontStyle: "italic", fontWeight: 400, fontSize: 52, lineHeight: 1.32, color: C.ivory, marginBottom: 12 }}>{l.text}</div>;
          })}
          <div style={{ marginTop: 40, fontFamily: F.display, fontSize: 34, letterSpacing: 4, color: C.goldLight, opacity: interpolate(frame, [lines[0]?.at ?? 0, (lines[0]?.at ?? 0) + 30], [0, 1], clamp) }}>{who}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
