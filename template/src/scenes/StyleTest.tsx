import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { Folio } from "../ui/Folio";
import { MapPlate, City, Standee } from "../map/MapPlate";
import { Route } from "../map/Route";
import { BattlePlate, Unit, Elephant, Cart, BTag } from "../map/Battle";
import { ChapterCard, PaintingFolio, QuoteCard } from "./Cards";
import { PLACES } from "../map/geo";
import { Battle3D, DEFAULT, Tag3D, BParams } from "../battle/Battle3D";

const routeKabul: [number, number][] = [PLACES.Kabul, [70.45, 34.43], PLACES.Peshawar, PLACES.Attock, [73.4, 33.0], PLACES.Sialkot, [75.6, 31.4], PLACES.Sirhind, [76.78, 30.38], PLACES.Panipat];

export const StyleTest: React.FC<{ shot: number }> = ({ shot }) => {
  if (shot >= 5) {
    const P: BParams[] = [
      { ...DEFAULT, cam: { pos: [-150, 38, -60], look: [10, 0, 60] }, carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: 1, lodiZ: 40, camp: 1, dawn: 0.6, t: 2 },
      { ...DEFAULT, cam: { pos: [30, 14, 70], look: [0, 3, 120] }, lodi: 1, lodiZ: 0, camp: 1, t: 1 },
      { ...DEFAULT, cam: { pos: [0, 150, -150], look: [0, 0, 70] }, carts: 1, mantelets: 1, guns: 1, town: 1, ditch: 1, lodi: 1, lodiZ: 70, crush: 0.7, flank: 0.85, arrows: 0.8, fire: 1, t: 3 },
    ];
    const p = P[shot - 5];
    return (
      <Folio>
        <Battle3D p={p} width={1920} height={1080} />
        {shot === 5 && <><Tag3D p={p} at={[-150, 3, 0]} title="Panipat" sub="his right" /><Tag3D p={p} at={[0, 3, 0]} title="The cart wall" sub="700 carts, roped with rawhide" /><Tag3D p={p} at={[0, 6, 75]} title="Ibrahim Lodi" sub="Sultan of Delhi" color={C.vermilion} /></>}
      </Folio>
    );
  }
  if (shot === 0) return (
    <Folio>
      <MapPlate cam={{ lon: 74.2, lat: 31.4, zoom: 0.78, tilt: 40, rot: 0 }}>
        <Route lonlat={routeKabul} progress={0.86} color={C.malachite} width={9} />
        {["Kabul", "Peshawar", "Lahore", "Multan", "Delhi", "Agra", "Samarkand", "Qandahar"].map((n) => <City key={n} name={n} />)}
        <City name="Panipat" big color={C.goldLight} />
        <Standee lon={72.24} lat={33.89}>
          <div style={{ translate: "-50% 0", position: "relative", bottom: 70, fontFamily: F.display, fontSize: 30, color: C.goldLight, whiteSpace: "nowrap", textShadow: "0 2px 10px #000" }}>Crossing the Indus · December 1525</div>
        </Standee>
      </MapPlate>
      <div style={{ position: "absolute", left: 110, bottom: 96, fontFamily: F.display, fontSize: 44, color: C.ivory }}>The Fifth Expedition</div>
      <div style={{ position: "absolute", left: 112, bottom: 70, width: 300, height: 1.5, background: C.gold }} />
    </Folio>
  );
  if (shot === 1) {
    const lodi = [] as React.JSX.Element[];
    for (let r = 0; r < 4; r++) for (let i = -5; i <= 5; i++) lodi.push(<Unit key={`l${r}${i}`} x={i * 300 + (r % 2) * 150} y={1100 + r * 220} cols={12} rows={4} side={1} horse={r === 0} seed={`l${r}${i}`} />);
    return (
      <Folio>
        <BattlePlate cam={{ x: 0, y: 700, zoom: 3.2, tilt: 56 }}>
          {Array.from({ length: 40 }, (_, i) => <Cart key={i} x={-1000 + i * 50} y={0} />)}
          {[-650, -220, 220, 650].map((x) => <Unit key={x} x={x} y={-160} cols={14} rows={4} side={0} seed={`b${x}`} />)}
          {[-1500, 1500].map((x) => <Unit key={x} x={x} y={-80} cols={10} rows={3} side={0} horse seed={`w${x}`} />)}
          {Array.from({ length: 22 }, (_, i) => <Elephant key={i} x={-1600 + i * 150} y={950} />)}
          {lodi}
          <BTag x={0} y={-40} title="The cart wall" sub="700 carts, roped with rawhide" />
          <BTag x={0} y={950} title="Ibrahim Lodi" sub="Sultan of Delhi" color={C.vermilion} />
        </BattlePlate>
        <div style={{ position: "absolute", right: 110, top: 96, fontFamily: F.display, fontSize: 40, color: C.goldLight }}>Sunrise</div>
      </Folio>
    );
  }
  if (shot === 2) return <Folio><ChapterCard numeral="VI" title="Half a Day" /></Folio>;
  if (shot === 3) return <Folio><PaintingFolio src="deo.jpg" caption="The battle of Panipat · Bāburnāma, c. 1590s" push={[1.05, 1.05]} /></Folio>;
  return <Folio><QuoteCard who="BABUR · BĀBURNĀMA" bg="ibrahim.jpg" lines={[{ at: 0, text: "Some in the army were very anxious and full of fear …" }, { at: 0, text: "None knew their tongue, nor did they know ours." }]} /></Folio>;
};
