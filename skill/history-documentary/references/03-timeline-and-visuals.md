# 3. Timeline, visual system, maps and cards

## 3.1 From recordings to a frame-accurate timeline

```bash
python3 tools/build_narration.py script.json rec/timings.json rec out/
cp out/timeline.json template/src/timeline.json
```

`build_narration.py` concatenates the sentence WAVs with fixed silences and writes `narration_raw.wav` plus
`timeline.json`. Constants (seconds): lead-in **1.2**, gap after each sentence **0.34**, after each beat **0.75**,
chapter card **4.2**, tail **8.0** (the end card). At 30 fps:

```json
{ "fps": 30, "total": 24622, "chapters": [
  { "id": "babur", "title": "I · A Prince Without a Kingdom", "card": [1468, 1594],
    "beats": [ { "id": "b1", "v": "map-ferghana", "start": 1594, "end": 2010,
                 "sents": [[1594, "Babur was born in 1483 ..."], [1777, "Through his father, ..."]] } ] } ] }
```

Everything visual is keyed to these frames: `Video.tsx` turns chapters and beats into shots (14-frame
crossfades, each shot runs until the next starts, then an end card). `Visuals.tsx` gets `(v, f, dur, s)`: the
visual id, the frame within the beat, the beat's length, and the sentence start frames within the beat
(`s[1]` = when sentence 2 starts). Use `s` to time on-screen events to the words ("as he says 'mantelets',
the mantelets appear").

If the narration changes (a pronunciation fix changes durations), rebuild the timeline and everything
re-times automatically. Never hard-code absolute frames in scenes; use `f`, `dur` and `s`.

## 3.2 The look

Owner feedback that shaped it: unique, **not** "typical Claude cream background"; documentary tone; no
qualifying statements on screen. The Panipat look is a page from a Mughal painted album:

- **Palette** (`theme.ts`): lapis `#13254f` and deep lapis `#070f24`, gold `#c9a24a` (light `#ecd28c`), ivory
  `#f1e7cc` text, vermilion `#c2412b` for the antagonist's side, malachite `#2f8a62` for the protagonist's,
  silver `#b9c3cf` for rivers. Choose a palette from the culture of the story (e.g. Roman: porphyry, bronze,
  marble; Napoleonic: indigo, white, gilt).
- **Type**: IM Fell English SC (display, period feel), Spectral (body). Both SIL OFL; files in `public/fonts`.
- **Folio** (`ui/Folio.tsx`): every frame sits in an album page with double gold rules, corner arabesques, a
  vignette and animated film grain (6 PNGs cycled). Grain opacity is 0.35 on painted pages, **0.08 on
  photographic 3D shots** (`grainAt()` in `Video.tsx`), because heavy grain looks like noise on a bright sky.

## 3.3 Scene types (reuse these; they cover most beats)

| Type | Component | Use for |
|---|---|---|
| Chapter card | `ChapterCard` | Each titled chapter; shamsa medallion, numeral, title |
| Painting folio | `PaintingFolio` | Period manuscript paintings with slow push/pan (Ken Burns), caption bottom-left |
| Quote card | `QuoteCard` | Primary-source quotes, lines revealed at sentence times, attribution ("BABUR · BĀBURNĀMA") |
| Map plate | `MapPlate` + `City`, `Route`, `Standee` | Journeys, regions, borders; camera keyframes via `camAt()` |
| Diagram cards | `Genealogy`, `Nobles`, `Tulughma`, `Chaldiran`, `Numbers`, `Timeline`, `Lesson`, `ClockCard` | Explaining structure, tactics, numbers |
| Object cards | `Diamond`, `Treasure`, `Mangoes` | Concrete story details |
| 3D battlefield | `Battle3D` via `battleShot()` | Armies, the prepared position, the battle hour by hour (see reference 04) |
| Captions | `Caption`, `Tag3D` | Short labels in the frame ("Mounted archers", with an italic sub-line) |

Rules: one idea per shot; labels of at most 4 words plus an optional italic sub-line; nothing qualifying on
screen; animate in on the relevant sentence and out before the shot ends.

## 3.4 Maps on real terrain

- `public/terrain.jpg` is Natural Earth shaded relief (public domain, `SR_HR.tif`) for the region, recoloured
  to the palette (gold relief, lapis lowlands, silver rivers) by `tools/mkterrain.py`. The projection is plate
  carrée: x = (lon − 58) × 120 px, y = (43 − lat) × 120 px (set LON0/LON1/LAT0/LAT1 for your region and edit
  the hard-coded paths at the top of the script).
- Borders: `src/polities.json` holds real historical borders (from the Atlas of Time map data) for the dates
  that matter: Lodi 1521, Kabul 1516, Mughal 1529 and 1595. For another topic, export borders for its dates
  (any GeoJSON works; the MapPlate draws them as SVG paths).
- `MapPlate` is a tilted CSS-3D plate; the camera is `{lon, lat, zoom, tilt}`, interpolated by `camAt(frame,
  keys)`. Keep tilt ≤ 55° and zoom moves slow (≥ 2 s), since fast map moves feel cheap.

## 3.5 Checking scenes

Render stills rather than watching the studio:

```bash
cd template
npx remotion still Panipat out/x.jpg --frame=<beat start + 30> --gl=angle
npx remotion render Panipat out/check --sequence --image-format=jpeg --every-nth-frame=150 --scale=0.5 --gl=angle --concurrency=8
```

Check the first, middle and last frame of each beat: labels not clipped, nothing facing backwards, captions
timed to the words, crossfades not revealing an empty frame.
