import React from "react";
import { ModelTest } from "./scenes/ModelTest";
import { Thumb } from "./scenes/Thumb";
import { Composition, delayRender, continueRender } from "remotion";
import { StyleTest } from "./scenes/StyleTest";
import { Documentary, TOTAL } from "./Video";
import { loadFonts } from "./theme";

const h = delayRender("fonts");
loadFonts().then(() => continueRender(h));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Panipat" component={Documentary} width={1920} height={1080} fps={30} durationInFrames={TOTAL} />
    <Composition id="Models" component={ModelTest} width={1920} height={1080} fps={30} durationInFrames={30} defaultProps={{ side: true }} />
    <Composition id="Thumb" component={Thumb} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{ v: 0 }} />
    <Composition id="Style" component={StyleTest} width={1920} height={1080} fps={30} durationInFrames={120} defaultProps={{ shot: 0 }} />
  </>
);
