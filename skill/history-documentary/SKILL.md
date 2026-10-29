---
name: history-documentary
description: Make a narrated YouTube history documentary end to end (research, sourced script, Kokoro narration with exact pronunciations, Remotion maps and cards, realistic 3D battle reconstructions with real models, music mix, subtitles and translations, thumbnails, SEO package and upload). Use when someone asks for a history or battle video, a documentary, or a YouTube video about a historical event.
---

# History documentary: from a topic to an upload-ready YouTube video

This skill turns a historical topic (usually a battle) into a 10–15 minute documentary: sourced narration in a
single calm voice, a distinctive painted-album look (lapis and gold, never "cream template"), maps on real
terrain, a realistic 3D battlefield with real elephant/horse/soldier models, chapter music, English and translated
subtitles, three A/B thumbnails and a complete YouTube SEO and upload package.

The worked example is **The First Battle of Panipat (1526)** in `examples/panipat-1526/`. The template project in
`template/` renders that film; adapt it rather than starting from nothing.

Read the reference file for each phase **before** doing that phase. They hold the formats, numbers and the
mistakes already made once:

| Phase | Reference |
|---|---|
| 1. Research and script | `references/01-research-and-script.md` |
| 2. Narration (Kokoro, pronunciation) | `references/02-narration.md` |
| 3. Timeline, visual system, maps and cards | `references/03-timeline-and-visuals.md` |
| 4. 3D battle reconstruction | `references/04-3d-battles.md` |
| 5. Assets and licensing | `references/05-assets-and-licensing.md` |
| 6. Render, mix, deliver | `references/06-render-mix-deliver.md` |
| 7. Subtitles and translation | `references/07-subtitles-and-translation.md` |
| 8. Thumbnails | `references/08-thumbnails.md` |
| 9. YouTube SEO, channel and upload | `references/09-youtube-seo-and-upload.md` |
| 10. Troubleshooting | `references/10-troubleshooting.md` |
| 11. Channel setup and browser upload (field by field) | `references/11-channel-setup-and-browser-upload.md` |
| 12. Originality and monetisation (inauthentic-content policy) | `references/12-originality-and-monetisation.md` |

## Principles (these decide most judgement calls)

1. **Every fact has a source you actually read.** A primary source first (for Panipat: Babur's own Baburnama,
   Beveridge translation), then reputable secondary sources. If a claim can't be sourced, cut it. Where sources
   disagree, the narrator says so in one plain sentence ("Babur heard it was a hundred thousand strong.
   Historians today think the real number was smaller"). Never invent a quote.
2. **Documentary, not sensational.** Educational but interesting: concrete detail, human moments from the
   sources, a clear "why it mattered". No hype words, no cliffhanger bait the film doesn't pay off.
3. **No qualifying text on screen.** Caveats such as "map is representative" go in the narration or the
   description, never as on-screen labels.
4. **One narrator voice throughout.** Kokoro `af_heart` at speed 0.95, quotes included. It is free, local and
   consistent. Fix every non-English name with the IPA lexicon before recording; viewers notice "BAB-er".
5. **Real where it can be, honest where it can't.** Use real 3D models, real sky lighting and photographed
   ground, and check period accuracy (no 18th-century naval cannon at a 1526 battle; Central Asian cavalry in
   coats and helmets, not bare-chested). Disclose AI narration and realistic reconstruction on upload.
6. **Licences are part of the job.** Only CC0, CC BY or public-domain material on a channel that may be
   monetised; no NonCommercial or NoDerivs licences. Credit every CC BY item in the description.
7. **The person stays in control of their accounts.** Never create Google/YouTube/Sketchfab accounts or type
   passwords. The person creates the channel, verifies it (phone **and** the one-time feature verification)
   and downloads account-gated models. You drive the upload in their signed-in browser, but **they pick each
   local file** in the macOS file picker (the browser can't attach files). Upload as **Private** first; going
   public, posting a comment as the channel and changing the handle each need an explicit go-ahead.

8. **Every film must look made by hand, not from a template.** YouTube's inauthentic-content policy
   (reference 12) excludes mass-produced channels from monetisation. Reuse models and systems, not shots:
   new 3D set pieces, maps and paintings per battle; varied thumbnails; quotes under ~15% of the narration;
   one consistent narrator (Kokoro `af_heart`), never rotated; 2–3 week cadence.

## The pipeline at a glance

```
topic → research notes → script.json (chapters → beats → sentences, each beat has a visual id "v")
      → lexicon.json (IPA for names) → narrate.py → rec/*.wav + timings.json
      → build_narration.py → narration_raw.wav + timeline.json (frame-accurate)
      → Remotion: Video.tsx builds shots from timeline.json; Visuals.tsx maps each "v" to a scene
           (map plates on real terrain, painted-manuscript folios, quote cards, diagrams, 3D battle shots)
      → chunked render (silent master, CRF 16) → mix.py (music bed, ducking, -14 LUFS) → mux (12 Mbps H.264)
      → mksrt.py (EN subtitles, chapter times; translated subtitles from whole-sentence translations)
      → Thumb composition (3 variants) → description, tags, title → upload as Private → playlist → publish
```

## Phase checklist

Track these as tasks; each has a definition of done.

1. **Brief.** Topic, angle (the question the film answers), target length (10–15 min ≈ 1,500–2,100 words at
   ~145 wpm), audience language(s). Done when the one-sentence question is written down.
2. **Research.** Primary source located and read; 3–6 secondary sources; a fact table (claim, source, page or
   URL, confidence); disputed numbers listed with who says what. Done when every planned beat has sources.
3. **Script.** `script.json` in 8–10 chapters plus a cold open (first chapter with empty title), 40–55 beats,
   each beat 1–4 sentences with a visual id. Read aloud once for rhythm. Done when a fact-check pass against the
   table finds nothing unsourced.
4. **Visual plan.** For each beat, its `v` and what is on screen. Reuse scene types; budget 3D for the battle
   chapters. Done when every `v` exists in `Visuals.tsx` (or is listed to build).
5. **Lexicon and narration.** `narrate.py --check`, fix names, record, listen to every name-bearing sentence.
   Done when no name is mispronounced.
6. **Timeline.** `build_narration.py`; copy `timeline.json` to `template/src/timeline.json`.
7. **Scenes.** Build or adapt maps, cards and 3D shots. Check stills at the start, middle and end of each beat
   (`npx remotion still`). Done when the sampled stills look right, with no clipped labels and nothing facing backwards.
8. **Assets.** Poly Haven fetch; Sketchfab shortlist downloaded by the person; models converted; credits file
   written. Done when the Models test composition renders all models correctly oriented.
9. **Render and mix.** Chunked render, music plan, `mix.py`, mux. Watch the first minute, one battle minute and
   the end. Done when the duration of picture and sound match to within one frame.
10. **Subtitles.** EN from the script; translations from whole sentences. Done when the cue count is plausible
    and a spot check is in sync.
11. **Thumbnails.** Three variants at 1280×720, under 2 MB, readable at phone size. Done when you have looked
    at them at 25% size.
12. **Package.** Title, description (hook in first two lines, chapters, sources, credits, AI note), tags,
    pinned comment, upload settings. Done when `upload-guide.md` is filled in.
13. **Channel.** Profile picture, banner (generic to the channel, not one film), watermark (Entire video),
    description, keywords, country and handle are set (`tools/branding/`, reference 11). Done when Customisation
    shows nothing pending to Publish.
14. **Upload.** Originality check first (reference 12.3: at least half the visuals new to this film, distinct
    thumbnail, quotes a minority). The person has created and verified the channel. Start the MP4 upload first and fill every
    field while it uploads (reference 11.5): title and description set with `insertText` and checked for intact
    chapters, playlist, not for kids, tags committed as chips, AI use Yes, language, Education, thumbnail, EN
    subtitles, end screen, Private. Add the second-language subtitles on the translations page. Done when
    Channel content shows the video Private with its thumbnail, and the person has the link to review.
15. **Publish** (on the person's go): Public or scheduled; pinned comment posted as the channel, not the
    person's personal identity. Done when the edit page shows Public and the comment is up (pinned once the
    channel is feature-verified).

## Time and cost expectations (M2 Pro Mac, 12 cores)

- Narration: ~10 min for 166 sentences on a Raspberry Pi 5; faster on a Mac.
- Render: non-3D scenes ~25 min for a 14-min film; realistic 3D battle scenes add 1.5–3 h at concurrency 4.
  Render in 3,000-frame chunks (see reference 06); a lost WebGL context otherwise throws away hours of work.
- All tools and assets used are free. Sketchfab downloads need a free account (the person's).

## What to hand back

- `<Title>-documentary.mp4` (1080p30, H.264 12 Mbps, AAC 256k, -14 LUFS), `subtitles-en.srt`,
  `subtitles-<lang>.srt`, `thumb-A/B/C.jpg`, `description.txt`, `upload-guide.md` (title options, tags,
  settings, pinned comment, post-publish plan).
- A short note of anything unverified (e.g. "music balance set by measurement, not by ear").
