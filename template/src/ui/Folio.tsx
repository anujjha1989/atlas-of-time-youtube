import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Corner } from "./Ornament";

// The album-page frame every shot sits in: inset gold rules, corner arabesques, vignette and grain.
export const Folio: React.FC<{ children: React.ReactNode; frameOpacity?: number; grain?: (frame: number) => number }> = ({ children, frameOpacity = 1, grain }) => {
  const frame = useCurrentFrame();
  const inset = 34;
  return (
    <AbsoluteFill style={{ backgroundColor: C.lapisDeep }}>
      {children}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(3,6,16,0.62) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ opacity: frameOpacity, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset, border: `1.6px solid ${C.gold}`, opacity: 0.85 }} />
        <div style={{ position: "absolute", inset: inset + 7, border: `0.8px solid ${C.gold}`, opacity: 0.55 }} />
        <div style={{ position: "absolute", left: inset - 10, top: inset - 10 }}><Corner size={74} /></div>
        <div style={{ position: "absolute", right: inset - 10, top: inset - 10 }}><Corner size={74} flipX /></div>
        <div style={{ position: "absolute", left: inset - 10, bottom: inset - 10 }}><Corner size={74} flipY /></div>
        <div style={{ position: "absolute", right: inset - 10, bottom: inset - 10 }}><Corner size={74} flipX flipY /></div>
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: grain ? grain(frame) : 0.35 }}>
        <Img src={staticFile(`grain/g${frame % 6}.png`)} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
