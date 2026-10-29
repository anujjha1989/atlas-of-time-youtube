# 14. Production lessons from the second film (Third Panipat, 1761)

Merged from the notes of the agent that produced *Third Panipat, 1761* (published on Atlas of Time, October 2026),
generalised so they apply to any film. Apply them when the same problem arises; they are not a reason to reuse
that film's scenes or assumptions.

## 14.1 Plan the quality before the volume

- **Perfect a 60–90 s opening and one complete battle sequence first**, render them as a preview, and get the
  owner's approval before producing the rest. Rebuilding a finished film costs far more than iterating on a
  preview.
- **Open on the decisive contrast or dilemma**: "By noon, the Marathas were advancing. By evening, their army was
  destroyed. What changed?" Then explain how they reached it.
- **Explain what each commander wanted, what options remained and why the decision mattered.** Stakes make tactics
  interesting to viewers who don't know the history.
- **Make the film's mechanism the centrepiece** (Panipat 1526: show how carts, gaps, guns and flanking cavalry
  worked together, then follow one attack through that system) rather than army-size comparisons.

## 14.2 Time, maps and chronology

- **Use broad times, not a modern clock**, unless a source gives hours: *Dawn, Morning, Midday, Afternoon,
  Evening*. Never invent battle clock times. (Babur's "one watch after sunrise" and prayer times are broad
  phases, not 9:00 or 13:30.)
- **Match the political map to the story year.** Export the Atlas polities for that year (1760 for Third Panipat,
  1527 for Khanwa), never reuse another film's map year. Treat an Atlas movement record marked
  editorial-unverified as a lead, not evidence.
- **Give materially different actions distinct scene states, and compare each state to its narration before
  rendering.** A shared component once replayed the later counterattack state early and advanced reserves
  before they had moved.
- **The owner rejected sparse line maps and slide-like cards.** Use textured relief, readable formations and
  camera movement; intercut reconstructions and human moments. A moving camera alone doesn't turn a static
  diagram into a developing battle.
- **Keep army colours consistent through the whole film, introduce units only when they matter, keep labels few,
  and place opposing labels on different sides of formations** so they don't overlap during advances. Remind
  the viewer where they are when switching between campaign and battlefield maps.
- **Short chapter cards, with the action continuing underneath.**

## 14.3 Render failures and visual checks

- A background image in normal layout flow pushed the army SVG outside the frame, leaving terrain-only stretches.
  **Put map backgrounds and overlays in one explicitly positioned coordinate layer**, and use Remotion's image
  primitives where capture must wait for assets.
- Inspect start, middle and end of every beat, and full-resolution frames where formations meet.
- Clothing added to models can float away from the body. **Check clothing, rider fit and silhouettes from the
  actual camera** before rendering a long reconstruction.
- **Render short previews and fix scene-state and layout defects before the full export.** Freeze the final
  source and assets; record their fingerprints and dependency versions. Keep rejected exports separate; never
  mix their chunks into the final master.
- **Bundle explicitly** (`npx remotion bundle src/index.ts --out-dir=<dir>`) and render from that fresh bundle.
  An extra positional path once left an older bundle in use.
- Render heavy sequences in recoverable chunks; retry a failed chunk at most three times, then stop and diagnose.
  Verify every expected frame range before concatenating.

## 14.4 Sound, subtitles and delivery

- **Sound design**: restrained hoofbeats, distant artillery and battlefield atmosphere tied to the action; let the
  music build at turning points and fall away when a moment needs silence.
- **Give important moments room to land**; vary pacing, and cut sentences that read as written rather than
  spoken. Signal measurements and speech-to-text comparisons don't prove pronunciation; **say plainly when no
  human listening review was done.** Narration fixes mean regenerating timing, mix and captions.
- **Measure loudness on the encoded AAC**, not only the PCM mix (PCM −14.25 LUFS / −1.50 dBTP became −14.26 LUFS /
  −1.24 dBTP after encoding).
- **Wrap subtitles by words to the line limit**, then validate cue lines, duration, order and translation
  alignment. Character-count splitting produced three-line cues.
- Final checks: frame count, audio and video duration equal, full decode without errors. Keep that evidence.

## 14.5 Thumbnails that won (owner's preference, October 2026)

The owner preferred the second agent's thumbnails ("GUNS vs ELEPHANTS", "THE LAST CHARGE") over 3D-render
thumbnails. What made them work (details in reference 08):
- **One heroic subject, close and large**: an elephant with howdah towering over the frame; a rider mid-charge
  with sword raised.
- **Painterly, cinematic light**: warm golden sun and dust on the subject's side against a dark stormy blue side
  that carries the words.
- **Poster type**: huge distressed ivory-and-gold serif words, plus a small framed gold plate with place and year.
- **Depth**: foreground action (cannon, carts, smoke), the hero in the middle, an army or skyline behind.
- These were AI-generated paintings. Label generated imagery as reconstruction in the description, keep it to
  thumbnails and a few key frames, and remember it adds to YouTube's AI-content signals (reference 12).

## 14.6 Publishing

- Private is the review default, but an explicit request to publish Public is authorisation; follow it.
- Some agents' browsers can attach local files through the page's file chooser; Claude's built-in browser
  cannot (reference 11.4). Use the attach capability you actually have; otherwise hand the file pick to the
  person with the exact path.
- Read back each subtitle language as Published and check the public player's caption menu; accessibility labels
  can contradict what plays.
- Studio's header can show a different account context on direct video navigation. Verify the public watch page
  shows the right channel before concluding anything.
- Reopen the end screen to verify its elements and timings. Save a screenshot of the published state.
