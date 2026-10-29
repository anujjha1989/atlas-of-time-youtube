# 15. Production lessons from Khanwa (1527)

The second film in the India season, made October 2026. What worked, what broke, and the tools it added.

## 15.1 Preview first, then build

- The owner approved a three-minute preview (the cold open plus the whole battle chapter) before the rest was
  built. It caught the scouts rendering as placeholder blobs, too many arrows, overlapping labels and a camera
  that was too low, all cheap to fix at that stage.
- Write the 3D engine for a new battle as its own file (`Khanwa3D.tsx` beside `Battle3D.tsx`), so the last
  film's scenes never change underneath it.

## 15.2 One battle state, two views

- The 3D engine exposes `build()` (every block of troops) and `place(block, params)` (where it is for a given
  battle state). The 2D battle maps draw the same blocks through the same `place()`, so a charge, an
  encirclement or a rout is in the same place in both views, and the cuts between them are seamless.
- Define the state at the end of each beat once (`AFTER_B3`, `AFTER_B5`, …) and start the next shot from it.
- Battle maps are seen from behind the commander whose story it is ("N ↓ seen from behind Babur's line" in the
  legend), with the same army colours as the 3D shots and a one-line caption per beat.
- A small sun dial in the corner shows the time of day as broad phases (Morning, Late morning, Midday,
  Afternoon, Late afternoon). The sources give no clock times; never invent them.

## 15.3 Variety without templates

Per chapter, mix at least three of: strategic map, battle map, 3D shot, painting, and a designed card.
Card types that worked: a person card (name, role and three lines over a map of their lands, for people with no
portrait), a two-source card ("BABUR'S ACCOUNT" vs "RAJPUT ACCOUNTS", used every time the sources disagree),
a count card (the victory letter's 201,000 stamped "ON PAPER", then the range of modern estimates), an army panel
(three numbered strengths that light up as the narration names them), and an illustrated card (the wine cups
breaking). Local actions a few kilometres across (a sally from a fort, an ambush on a road) need a battle plate,
not a zoomed strategic map: the relief texture blurs past zoom ≈ 3.5.

## 15.4 Rendering

- A single 3,700-frame render died with "WebGL context lost". Use `tools/render_chunks.sh NAME START END`:
  525-frame chunks in a fresh browser, concurrency 2, `--timeout=120000`, three retries per chunk, frame count of
  every chunk verified before the chunks are joined. Chunks already rendered are skipped on a rerun.
- Run the whole render under `caffeinate -i` on a laptop. The Mac slept mid-render once; the 3D assets then
  timed out loading and the chunk had to be retried.
- Map and card chapters render at about 20 frames a second; 3D chapters at 2–3.
- Reuse verified preview chunks in the final film when the scenes in them did not change.

## 15.5 Sound

- `tools/sfx.py` synthesises restrained sound design locked to the picture: cannon booms exactly when the 3D
  guns flash (it uses the same firing formula as the `Guns` component), matchlock crackle, hoof rumble under
  charges, a distant din under the battle chapter, and a metallic clink when the cups break. No sound library
  needed, and nothing to license.
- Mix it 8–10 dB under the narration in the heaviest beats (measure RMS per beat), then two-pass `loudnorm` to
  −14 LUFS and measure again on the encoded AAC.

## 15.6 Subtitles

`tools/mksrt.py` now balances cues: a long sentence is split into the fewest cues, of similar length, preferring a
break after a comma, and each cue's two lines are balanced, so there are no one-word orphans ("archers").

## 15.7 Thumbnails

- Codex generated two painted hero images (no text). `tools/branding/ThumbFromArt.tsx` is a Remotion composition
  that lays them out in the owner's preferred style: a gold place-and-year plate, two huge ivory-gold Cinzel
  lines on the dark side, a vignette. Render with `npx remotion still … KThumb out.jpg --props='{"v":0}'`.
- Label generated thumbnail art as a reconstruction in the description.

## 15.8 Pictures

- Commons search via the API, from the Mac (the cloud shell can't reach Wikimedia):
  `action=query&list=search&srnamespace=6`, then `prop=imageinfo&iiprop=url|size|extmetadata` for licence and date.
- Check that the person in a painting is really your subject. "Rana Sangram Singh" also matches Sangram Singh II
  of Mewar, two centuries later.
- Prefer public domain over CC BY-SA, and avoid scans with library stamps across the subject.
