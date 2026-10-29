# 9. YouTube: SEO package, channel and upload

## 9.1 Title

Formula: **[the term people search] + [the hook] + [the wider topic]**, with the important words inside the
first ~60 characters (shown in full on mobile). Panipat options, best first:

1. First Battle of Panipat 1526: How 12,000 Beat 100,000 | Mughal Empire
2. 12,000 vs 100,000: The Battle That Created the Mughal Empire | Panipat 1526
3. How Babur Won Panipat in Half a Day | First Battle of Panipat (1526)
4. Guns vs Elephants: The First Battle of Panipat, 1526

Find the search term by typing the topic into YouTube's search box and reading the autocomplete. Avoid
clickbait that the video doesn't pay off, because it lowers retention, which matters more than the click.

## 9.2 Description (template: `examples/panipat-1526/description.txt`)

1. **Two-line hook with keywords** (shown in search and above "…more"): the question, the main search term,
   the year, the wider topic.
2. One short paragraph on what the viewer will see.
3. **CHAPTERS**: `0:00 Title` first, then one line per chapter (from `chapters.txt`). At least 3 chapters,
   each at least 10 s long.
4. **SOURCES** with links; **NOTES ON THE NUMBERS** for disputed figures.
5. **PICTURES**, **3D MODELS**, **MUSIC** credits (CC BY requires them).
6. AI note: "Narration is AI-generated (Kokoro)… Battle scenes are reconstructions for illustration."
7. Three hashtags at the end (`#Panipat #MughalEmpire #IndianHistory`); YouTube shows the first three
   above the title.

## 9.3 Tags

10–20 tags; the first few matter most. Exact search terms first, then entities, then the wider topic. Panipat:
`battle of panipat, first battle of panipat, panipat 1526, battle of panipat 1526, babur, ibrahim lodi,
mughal empire, founding of the mughal empire, delhi sultanate, lodi dynasty, baburnama, mughal history,
medieval india, indian history, indian history documentary, war elephants, tulughma, gunpowder warfare,
history documentary, battle documentary, panipat war, babur vs ibrahim lodi`.

## 9.4 Settings

- Category **Education**; video language and title language **English**.
- **AI use: Yes** (Studio now calls the section "AI use"; it used to be "Altered or synthetic content").
  AI narration plus a realistic reconstruction of a real event is exactly what YouTube asks creators to
  disclose. It adds a small "AI" label and does not reduce reach.
- Audience: **No, it's not made for kids**.
- Captions: upload EN and the translated SRT files; add translated titles and descriptions.
- End screen (last 5–20 s; the film has an 8 s end card): Subscribe plus one "Best for viewer" video.
- Playlist: a series playlist ("Battles"); playlists raise session time.
- Visibility: upload as **Private**; the owner reviews, then schedules. For an Indian and diaspora audience,
  Friday–Sunday 6–8 pm IST works well.
- Pinned comment that invites an opinion, e.g. "Which mattered more at Panipat, the guns or the tulughma?"

## 9.5 Channel setup and upload: see reference 11

The step-by-step for creating and verifying the channel, branding (profile picture, banner, watermark),
description, keywords and handle, and for driving the whole upload in the person's signed-in browser
(field-by-field selectors, file-picker hand-offs, subtitles in a second language, end screen, going public,
pinned comment) is in **`11-channel-setup-and-browser-upload.md`**. The essentials:

- The person creates the channel, verifies their phone (youtube.com/verify) **and** completes the one-time
  feature verification (needed for pinned comments and clickable links). They also pick every local file in
  the macOS file picker; the built-in browser can't attach files.
- Upload as **Private**, fill everything in, hand back. Make it public, post a comment or change the handle
  only on an explicit go-ahead.

## 9.6 After publishing (reach)

- **Shorts**: 2–3 vertical clips (1080×1920, under 60 s) of the strongest moments, with burned-in captions,
  each linking the full video (Shorts → "Related video"). Shorts are the main discovery engine for new channels.
  Cut them with ffmpeg: `crop=ih*9/16:ih` around the subject, then scale to 1080×1920.
- Reply to comments in the first 24 h; heart good ones.
- After 48 h check Analytics: impressions click-through rate (aim for 4–10%), average view duration and the
  retention graph. Big drops show which section to tighten in the next film. Keep the Test & Compare winner.
- Make a series: the template turns the next battle into mostly a script-writing job.
