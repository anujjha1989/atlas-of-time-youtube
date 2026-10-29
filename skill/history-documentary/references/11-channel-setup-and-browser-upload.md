# 11. Channel setup and uploading through the browser

This chapter is the field log of setting up the **Atlas of Time** channel and publishing the Panipat film
from Claude's built-in browser (the browser pane inside the Claude desktop app). Every step below was done
for real, including the ones that failed and what worked instead. Reference 09 covers *what* to put in the
title, description and tags; this chapter covers *how* to get it onto YouTube.

## 11.1 Who does what

| The person (their identity, their decision) | Claude (in the person's signed-in browser) |
|---|---|
| Create the channel; never ask Claude to create accounts or type passwords | Write the channel description, keywords, handle shortlist |
| Phone verification at youtube.com/verify | Make the profile picture, banner and watermark |
| The one-time **feature verification** (selfie video, ID or channel history) that unlocks pinned comments and clickable description links | Fill in every upload field, playlists, subtitles, end screen, visibility |
| **Pick each local file** in the macOS file picker (video, thumbnail, each SRT), see 11.4 | Check every field after filling it, and report what's live |
| Say "make it public", or choose a schedule | Switch visibility only after an explicit go-ahead in chat |
| Approve posting a public comment as the channel | Post and pin the comment once approved |

Ask before anything public: making a video public, posting a comment, publishing a handle change.
Changing channel settings (keywords, country) also needs the person's go-ahead, but one "yes, fill in the
channel" covers that whole batch.

## 11.2 Channel creation and verification (the person)

1. youtube.com → profile picture → **Settings → Add or manage your channel(s) → Create a channel**. This makes
   a Brand Account channel with its own name. If the person says "I don't know how", give these steps one at
   a time; don't do it for them.
2. **youtube.com/verify** (with the new channel selected: profile picture → Switch account). The SMS code
   unlocks videos longer than 15 minutes and custom thumbnails. The page says "Phone number verified" when done.
3. **Feature verification** (Studio → Settings → Channel → Feature eligibility). It is separate from the
   phone step. Without it:
   - links in the description are not clickable. The upload form warns: "To make external links clickable,
     first complete a one-off verification."
   - **comments cannot be pinned**. The Pin menu item opens "To pin comments, complete a quick, one-time
     verification in YouTube Studio."
   Tell the person about this early, so it's done before the first upload.
4. The person's Google account may own several channels. Studio follows the channel chosen at login, but
   **youtube.com may act as a different identity** (in our case the personal "Anuj R Jha" channel). See 11.8.

## 11.3 Branding and channel basics

Generators are in `tools/branding/` (render with Playwright Chromium: `python3 tools/branding/render.py`).

| Asset | Spec | Our design |
|---|---|---|
| Profile picture | PNG, ≥98×98 (make 800×800), shown as a circle down to 24 px | Gold globe inside a clock face on lapis (`profile.svg`) |
| Banner | 2560×1440, ≤6 MB; **only the centre 1546×423 is safe on every device**; TV shows all of it | Dusk skyline of world history (pyramids → temple → colosseum → minarets → pagoda → Mughal dome) with a 3000 BCE–2000 CE ruler, and "BATTLES · EMPIRES · TURNING POINTS" inside the safe area (`banner.py`) |
| Video watermark | Square PNG ≥150×150, ≤1 MB, **transparent**, shown bottom-right at ~60 px | The globe-and-clock mark without fine ticks on a 55%-opaque navy disc (`watermark.svg`), so it reads on light and dark footage |

- **Keep branding generic to the channel, not one film.** The first banner was Panipat-specific and the person
  rejected it.
- Render a preview of the watermark over light, sky and dark backgrounds at real size before handing it over.
- Watermark display time: **Entire video** (the default, "End of video", shows it only in the last 15 s).
  Studio → Customisation → Branding.

**Where things live in Studio** (people ask):

| Item | Location |
|---|---|
| Banner, picture, name, handle, description, links, contact email, watermark | Customisation → Profile (press **Publish** at the top right; greyed out means nothing is pending) |
| **Channel keywords**, country of residence | Settings (gear, bottom left) → Channel → Basic info → **Save** |
| Feature verification | Settings → Channel → Feature eligibility |
| Video tags | Each video: Details → Show more → Tags |

**Channel description**: ~700 characters (limit 1,000). Front-load the search words in the first two lines
("history's great battles, empires and turning points … retold from the sources"), then what each film does,
the sourcing promise, the range of topics, the cadence, a subscribe line, and the AI-narration note.

**Channel keywords**: the field takes comma-separated values (no quotes). Type the whole list ending with a
comma, then click outside the field; the chips appear and **Save** turns black. Example: `history documentary,
world history, battle documentary, military history, Indian history, Mughal Empire, medieval history, ancient
history, empires, historical battles, Atlas of Time`.

**Country of residence**: same page; set it (it affects monetisation eligibility later). The dropdown is long:
`find "India"`, scroll_to the ref, click.

**Contact email**: suggest a dedicated Gmail for the channel rather than the personal one (it is public).
The person creates it.

**Handle**: YouTube auto-assigns one with a random suffix (`@AtlasofTime-k9z`). Most obvious handles are taken.
To check one, type it into Customisation → Handle and read the line underneath: "This handle isn't available.
Here's one that is…", or a green tick. Test a shortlist, then **Cancel** to discard the test edits. Report a
table of taken and available handles and let the person pick. (Taken for us: AtlasOfTime, AtlasOfTimeHistory,
AtlasOfTimeDocs, TheAtlasOfTime, AtlasOfTimeTV. Available: **AtlasOfTimeStories**.) Two changes are allowed per
14 days; the old handle keeps working for 14 days.

## 11.4 Local files: the person picks them

The built-in browser has **no file-upload tool**, and these did not work:

- **Computer use on the macOS file picker**: the picker belongs to the Claude desktop app, which cannot be
  granted for computer use (`computer_resolve_access(["Claude"])` returns no app).
- **Fetching the file from a local HTTP server inside the Studio page** (`python3 -m http.server` on
  127.0.0.1 with CORS and `Access-Control-Allow-Private-Network` headers, then `fetch` → `DataTransfer` → the
  file input): the browser blocks the request before it reaches the server ("Failed to fetch", nothing in the
  server log).

So each local file is one small step for the person. Make it quick:

1. Before asking, call `tabs_context`. If the pane is **hidden**, tell them to press **Cmd+Shift+B** (or click
   the globe icon) first.
2. Open exactly the dialog that needs the file yourself. For subtitles, open it as far as the "With timing"
   choice and leave **Continue** for them, because that click opens the picker.
3. Give the exact path to paste: "Press **Cmd+Shift+G**, paste `~/Downloads/Panipat-1526-YouTube/thumb-A.jpg`,
   press Enter, click **Open**."
4. Order the asks so the person waits as little as possible: **start the video upload first** (1.18 GB took
   about 7 minutes), fill in all the metadata while it uploads, then the thumbnail, then the subtitle files.

Files needed per film: the MP4, `thumb-A.jpg` (Test & Compare needs the other two in the same way),
`subtitles-en.srt`, `subtitles-<lang>.srt`.

## 11.5 The upload dialog, field by field

Open it with `navigate` to `https://studio.youtube.com/channel/<CHANNEL_ID>/videos/upload?d=ud`. Once the person
has picked the video, YouTube saves it as a Private draft immediately and titles it after the file name.

**Title and description.** These are contenteditable `#textbox` elements inside `ytcp-uploads-dialog`
(index 0 = title, 1 = description). **Do not click and type**: focus can land in the wrong box. In our run the
whole description went into the *title* box, which strips newlines and breaks the chapters. Set each box
directly instead, then verify:

```js
const boxes = [...document.querySelectorAll('ytcp-uploads-dialog #textbox')];
function setBox(el, text) {
  el.focus();
  const r = document.createRange(); r.selectNodeContents(el);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  document.execCommand('insertText', false, text);   // keeps \n in the description
}
setBox(boxes[0], TITLE);
setBox(boxes[1], DESCRIPTION);   // paste description.txt verbatim (read it from disk first)
JSON.stringify({ title: boxes[0].innerText,
  newlines: (boxes[1].innerText.match(/\n/g) || []).length,
  chapters: boxes[1].innerText.includes('0:00 ') && /\n\d+:\d\d /.test(boxes[1].innerText) });
```

Check: the title is the exact string (≤100 characters); the description has its newlines and the chapter lines
are intact.

**Playlist.** Playlists → **Select** → (if none exist: "No playlists available") **Create playlist ▾ → New
playlist** → title ("Battles"), a one-line description, visibility Public, **Create**. The new playlist comes
back already ticked; press **Done**.

**Audience.** "No, it's not Made for Kids" (a radio button; `find "made for kids"`).

**Show more**, then:
- **Tags**: click the field, type the whole comma-separated list, then press **Backspace** (drop the trailing
  comma) and **Return**. The chips appear and the counter shows n/500. Typed text without that last step
  stays as plain text and is lost.
- **AI use**: the section is now called **"AI use"** ("Was AI used to generate or edit your content…?"),
  not "altered or synthetic content". Choose **Yes** (AI narration plus a realistic reconstruction of a real
  event). This adds an "AI" label under the title.
- **Video language**: dropdown → `find "English"` → the plain "English" entry.
- **Category**: defaults to "People and blogs" → **Education**.
- Leave on: comments, embedding, notify subscribers, automatic chapters (the description's chapters override them).

**Thumbnail.** Thumbnail → **Upload file** (the person picks it; see 11.4). For A/B testing use **A/B testing**
and the three files.

**Video elements → Subtitles → Add.** The editor opens for the **video language only**. **Upload file → With
timing → Continue** (the person picks `subtitles-en.srt`). Check that the first cues appear with sensible times
(ours: 00:01:05 "One morning in April 1526…"), then **Done**. The toast says "English subtitles published".
Other languages can't be added here; see 11.6.

**Video elements → End screen → Add.** Choose the template **"1 video, 1 subscribe"**. It fills
"Subscribe: <channel>" and "Video: Best for viewer" for the last 20 s. The Save button can sit outside a
narrow pane, so click it by text in JS. Then **reopen the editor to confirm** the elements are there (a greyed
Save means it is already saved). End screens don't show on Private videos, so they only matter once the
video is public.

**Checks** should report "Checks complete. No issues found." CC BY music or models may draw Content ID claims;
report any.

**Visibility.** Choose **Private** and **Save**. The dialog closes, and Channel content shows the video with its
thumbnail, duration and a lock icon ("This video is only visible to you").

## 11.6 After the dialog

- **Video ID**: from Channel content, `document.querySelectorAll('a[href*="/video/"]')` → `/video/<ID>/edit`.
- **Second-language subtitles**: `navigate` to `https://studio.youtube.com/video/<ID>/translations` → **Add
  language** → `find "Hindi"` → the new row → hover the Subtitles cell → **Add** → **Upload file → With timing**
  (the person clicks Continue and picks the SRT) → check the cues → **Publish**.
- **Going public** (only on the person's explicit go): `https://studio.youtube.com/video/<ID>/edit` → the
  Visibility card → **Public** → **Done** → **Save** (top right). Clicking coordinates on the radio button
  can miss; click the "Public" ref from `find`. Confirm the card shows a globe and "Public" and the toast says
  "Changes saved". HD can lag for a few minutes after publishing.
- Offer instead: schedule (Friday–Sunday, 6–8 pm IST for an Indian and diaspora audience).

## 11.7 Pinned comment

1. `navigate` to `https://www.youtube.com/watch?v=<ID>`. **Pause the autoplay** in JS
   (`document.querySelector('video').pause()`), because it plays aloud in the person's pane.
2. Scroll the comments into view in JS (`ytd-comments#comments`). Then **check who is commenting**:
   `document.querySelector('ytd-comment-simplebox-renderer img').alt`. It must be the channel name.
3. If it shows the person's personal channel: avatar → **Switch account** → the channel
   (`ytd-account-item-renderer` containing the channel name). The page reloads; check again.
4. Click "Add a comment…", type the comment (written in the upload guide), click **Comment**.
5. ⋮ (Action menu) → **Pin**. Without feature verification (11.2) this opens a verification notice instead.
   Close it with Escape and tell the person; pin it after they've verified.

## 11.8 Browser-pane quirks

- The pane is narrow (~800 px). Buttons at the far right of Studio dialogs can be "entirely outside the
  viewport". Click them by text in JS:
  `[...document.querySelectorAll('ytcp-button,button')].find(b => b.innerText.trim()==='Save' && b.offsetParent).click()`.
- Prefer `find` refs over coordinates; take a fresh screenshot after any navigation before clicking by coordinate.
- `scroll_to` on a ref inside the upload dialog doesn't always move the dialog's own scroller; `scroll_to` the
  ref you are about to click, or use JS `scrollIntoView`.
- The person may click in the pane while you work (tool results say so). Re-read state before continuing.
- Studio pages show the channel avatar, but youtube.com can be a different identity (11.7).

## 11.9 Order of operations (about 15 minutes of active work)

1. Person: channel created, phone verified, feature verification done (or flagged).
2. Branding: picture, banner (Publish), watermark (Entire video), description, links, contact email.
3. Settings: keywords, country (Save). Handle shortlist → the person picks → Publish.
4. Upload dialog → **person picks the MP4** → fill title, description, playlist, audience, tags, AI use,
   language, category while it uploads → **person picks the thumbnail** → Video elements: EN subtitles (person
   picks the SRT), end screen → Visibility Private → Save.
5. Translations page: second language (person picks the SRT) → Publish.
6. Report to the person: what's set, the link, what's left. Wait for "public" or a schedule.
7. On go: Public → Save → confirm. Post the pinned comment as the channel (after approval) → pin (needs verification).
8. Then the Shorts (reference 09, section 9.6), each with Related video set to the full film.
