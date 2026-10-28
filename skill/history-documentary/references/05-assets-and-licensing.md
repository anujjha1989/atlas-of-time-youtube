# 5. Assets and licensing

## 5.1 Licence rules for a channel that may be monetised

| Licence | OK? | Notes |
|---|---|---|
| Public domain / CC0 | Yes | No credit needed (give it anyway) |
| CC BY | Yes | Credit author, title, link and licence in the description; say if you modified it |
| CC BY-SA | Yes for images used as-is | Credit plus licence link; avoid for things you remix heavily |
| CC BY-NC, BY-NC-SA | **No** | NonCommercial: monetisation counts as commercial |
| CC BY-ND | **No** for models you pose, recolour or fit gear to | NoDerivs |
| "Editorial use only", unknown | No | |

Each Sketchfab zip contains a `license.txt` with the exact credit line; copy it into the description.

## 5.2 Free sources used

**Poly Haven** (CC0, no account, API): `tools/fetch_polyhaven.py public` downloads HDR skies, ground and wood
textures, trees, grass, boulders and logs (~0.5 GB). Use `curl`, not Python `urllib`, which hung behind a
corporate proxy.

**Sketchfab** (free account needed, so **the person downloads; never create accounts for them**). Search with
the public API (no login) and filter by licence and download availability:

```bash
curl -s "https://api.sketchfab.com/v3/search?type=models&downloadable=true&q=asian%20elephant&sort_by=-likeCount&count=8" \
 | python3 -c "import json,sys;[print(m['name'],'|',m['license']['label'],'|',m.get('faceCount'),'faces | anim',m.get('animationCount'),'|',m['viewerUrl']) for m in json.load(sys.stdin)['results']]"
```

Download thumbnails (`/v3/models/<uid>` → `thumbnails`) and make a contact sheet to compare before asking the
person to download. Panipat set (all CC BY 4.0):

| Use | Model | Author | Link |
|---|---|---|---|
| War elephant | india elephantf (15.8k tris, Asian elephant) | Ford mondeo | https://sketchfab.com/3d-models/6d0158b65c2b4788b629746ba4ad6a11 |
| Close-up horse | Horse (62k tris) | victorberdugo1 | https://sketchfab.com/3d-models/2f4639623e684c44acb68922585d7a09 |
| Crowd and gallop horse | Horse Rigged (Game Ready) (2.9k, 1 animation) | abhayexe | https://sketchfab.com/3d-models/bc64f4ff7966474ca9bacd42fa73a754 |
| Soldier | Warrior in Turban (20k) | 37omkar | https://sketchfab.com/3d-models/09929d65b0f94a5ea5fca8a351bb0304 |

Rejected: "HORSE - Realistic (DEMO FREE)" (NonCommercial); stylised "Desert Warrior" (not realistic);
Smithsonian scans (no animals suitable). Ask the person to choose **glTF** on Download, and wait until the
download has finished before unzipping. Then:

```bash
tools/prepare_models.sh ~/Downloads template/public/sk
```

**Wikimedia Commons**: period paintings (illustrated *Bāburnāma* manuscripts, c. 1589–1598; V&A Mughal paintings) are
public domain; photographs of monuments are often CC BY-SA (credit them). Record each file's licence when you
download it.

**Natural Earth** (public domain): `SR_HR.tif` shaded relief for map terrain.

**Music**: Kevin MacLeod (incompetech.com), CC BY 4.0. Credit each track in the description:
`"Track" by Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 4.0 License,
http://creativecommons.org/licenses/by/4.0/`. Panipat used Interloper, Long Road Ahead, Lord of the Land,
Desert City, Crossing the Chasm, Prelude and Action, Dark Times and Heroic Age.

**Fonts**: IM Fell English (SC) and Spectral, SIL Open Font Licence.

## 5.3 The credits block

Keep a running `CREDITS.md` per project and paste it into the description under **SOURCES**, **PICTURES**,
**3D MODELS**, **MUSIC**. Add: "Narration is AI-generated (Kokoro). Battle scenes are reconstructions for
illustration."

## 5.4 Don't commit heavy or third-party binaries to git

Keep `public/ph`, `public/sk`, paintings, music and renders out of the repo (`.gitignore`); commit the fetch
scripts and the model links instead. CC BY allows redistribution, but large binaries bloat the repo, and
linking keeps the authors' pages as the canonical source.
