import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import TL from "./timeline.json";
import { Folio } from "./ui/Folio";
import { ChapterCard } from "./scenes/Cards";
import { Visual } from "./scenes/Visuals";
import { EndCard } from "./scenes/Cards2";
import { clamp } from "./theme";

type Beat = { id: string; v: string; start: number; end: number; sents: [number, string][] };
type Chapter = { id: string; title: string | null; card?: [number, number]; beats: Beat[] };
const chapters = (TL as unknown as { chapters: Chapter[] }).chapters;
export const TOTAL = (TL as unknown as { total: number }).total;
const XF = 14; // crossfade frames

// Flatten into shots: chapter cards and beats, each lasting until the next one starts.
type ShotT = { key: string; from: number; to: number; kind: "card" | "beat" | "end"; ch?: Chapter; beat?: Beat };
const shots: ShotT[] = [];
for (const ch of chapters) {
  if (ch.card) shots.push({ key: `card-${ch.id}`, from: ch.card[0], to: ch.card[1], kind: "card", ch });
  for (const b of ch.beats) shots.push({ key: b.id, from: b.start, to: b.end, kind: "beat", ch, beat: b });
}
for (let i = 0; i < shots.length - 1; i++) shots[i].to = shots[i + 1].from;
const lastEnd = shots[shots.length - 1].to;
shots.push({ key: "end", from: lastEnd, to: TOTAL, kind: "end" });
shots[0].from = 0;

const Fade: React.FC<{ dur: number; children: React.ReactNode; first?: boolean }> = ({ dur, children, first }) => {
  const f = useCurrentFrame();
  const a = first ? 1 : interpolate(f, [0, XF], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: a }}>{children}</AbsoluteFill>;
};

const BeatView: React.FC<{ b: Beat; dur: number; offset: number }> = ({ b, dur, offset }) => {
  const f = useCurrentFrame() - offset;
  const s = b.sents.map(([fr]) => fr - b.start);
  const v = b.id === "x7" ? "clock-noon-battle" : b.v;
  return <Visual v={v} f={f} dur={dur} s={s} />;
};

const CardView: React.FC<{ title: string }> = ({ title }) => {
  const [num, ...rest] = title.split(" · ");
  return <ChapterCard numeral={num} title={rest.join(" · ")} />;
};

const EndView: React.FC<{ dur: number }> = ({ dur }) => { const f = useCurrentFrame(); return <EndCard f={f} dur={dur} s={[]} />; };

// Photographic 3D battle shots get much lighter film grain than the painted pages.
const BATTLE = new Set(["lodi-host", "babur-army", "archers", "field-carts", "field-flanks", "field-wide", "field-raids", "field-night", "field-dawn", "field-order", "field-advance", "field-crush", "field-sweep", "field-trap"]);
const battleRanges = shots.filter((sh) => sh.kind === "beat" && BATTLE.has(sh.beat!.v)).map((sh) => [sh.from, sh.to]);
const grainAt = (f: number) => {
  let w = 0;
  for (const [a, b] of battleRanges) w = Math.max(w, interpolate(f, [a - 14, a, b - 14, b], [0, 1, 1, 0], clamp));
  return 0.35 - 0.27 * w;
};

export const Documentary: React.FC<{ only?: string }> = () => (
  <Folio grain={grainAt}>
    {shots.map((sh, i) => {
      const from = Math.max(0, sh.from - (i ? XF : 0));
      const dur = sh.to - from;
      const offset = sh.from - from;
      return (
        <Sequence key={sh.key} from={from} durationInFrames={dur} name={sh.key}>
          <Fade dur={dur} first={i === 0}>
            {sh.kind === "card" && <CardView title={sh.ch!.title!} />}
            {sh.kind === "beat" && <BeatView b={sh.beat!} dur={sh.to - sh.from} offset={offset} />}
            {sh.kind === "end" && <EndView dur={dur} />}
          </Fade>
        </Sequence>
      );
    })}
  </Folio>
);
