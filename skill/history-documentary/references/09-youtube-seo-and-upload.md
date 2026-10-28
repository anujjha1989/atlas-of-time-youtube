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
- **Altered or synthetic content: Yes**. AI narration plus a realistic reconstruction of a real event is
  exactly what YouTube asks creators to disclose. It does not reduce reach.
- Audience: **No, it's not made for kids**.
- Captions: upload EN and the translated SRT files; add translated titles and descriptions.
- End screen (last 5–20 s; the film has an 8 s end card): Subscribe plus one "Best for viewer" video.
- Playlist: a series playlist ("Battles"); playlists raise session time.
- Visibility: upload as **Private**; the owner reviews, then schedules. For an Indian and diaspora audience,
  Friday–Sunday 6–8 pm IST works well.
- Pinned comment that invites an opinion, e.g. "Which mattered more at Panipat, the guns or the tulughma?"

## 9.5 Creating the channel (the person does this)

You must not create accounts. Give the person these steps:

1. youtube.com → sign in with the Google account that should own the channel.
2. Profile picture → **Settings** → **Add or manage your channel(s)** → **Create a channel**. This makes a
   *Brand Account* channel with its own name (e.g. "Atlas of Time") instead of the person's name, and it can
   have managers later. (Simple alternative: profile picture → **Create a channel** → "Use a custom name".)
3. Enter the channel name, accept the terms, create; confirm the phone code if asked.
4. **youtube.com/verify** with the new channel selected (profile picture → Switch account): verify a phone
   number. This unlocks custom thumbnails and uploads longer than 15 minutes.
5. Optional: Studio → Customisation → profile picture (an emblem from the visual style), banner (2560×1440,
   safe area 1546×423), a one-paragraph channel description with keywords, and links.

## 9.6 Uploading through the browser (with the person's permission)

Prerequisites: the person is signed in to YouTube in the browser you control, with the right channel
selected; never type their password. In YouTube Studio:

1. **Create → Upload videos** → choose the final MP4. While it uploads, fill in the Details:
   title, description (paste), the three thumbnails (Test & Compare) or one, playlist (**create "Battles"** if
   missing), audience "No, not made for kids".
2. **Show more**: altered content **Yes**, tags, language, category Education, recording date (optional),
   licence Standard, comments on.
3. **Video elements**: subtitles (upload EN SRT, then the other languages), end screen.
4. **Checks**: wait for copyright/ad-suitability checks. CC BY music and models may trigger Content ID
   claims if a third party registered them. Kevin MacLeod tracks are not Content ID registered, but note any claim.
5. **Visibility: Private**. Save. Send the person the Studio link to review. Publishing or scheduling is
   their decision; do it only on an explicit go-ahead.

## 9.7 After publishing (reach)

- **Shorts**: 2–3 vertical clips (1080×1920, under 60 s) of the strongest moments, with burned-in captions,
  each linking the full video (Shorts → "Related video"). Shorts are the main discovery engine for new channels.
  Cut them with ffmpeg: `crop=ih*9/16:ih` around the subject, then scale to 1080×1920.
- Reply to comments in the first 24 h; heart good ones.
- After 48 h check Analytics: impressions click-through rate (aim for 4–10%), average view duration and the
  retention graph. Big drops show which section to tighten in the next film. Keep the Test & Compare winner.
- Make a series: the template turns the next battle into mostly a script-writing job.
