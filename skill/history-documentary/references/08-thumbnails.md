# 8. Thumbnails

## 8.1 What makes a history thumbnail work

- **One subject, big**: a single war elephant filling a third to half of the frame beats a wide army shot.
  Shoot low, slightly below the subject's eye line, so it looms.
- **2–4 words, huge**: a contrast or a number ("12,000 vs 100,000", "GUNS vs ELEPHANTS", "HALF A DAY THAT MADE
  AN EMPIRE"). Words must not repeat the title; they add the hook.
- **Readable at phone size**: check at 25% scale (320 px wide). Thick serif display type, ivory and gold with a
  dark stroke and shadow, set on the side of the frame darkened by a gradient.
- **Colour contrast**: blue sky, warm earth, vermilion accents. Add a mild `contrast(1.14) saturate(1.2)` to the
  3D render.
- **A small tag** with the topic and year in a solid colour box ("PANIPAT 1526").
- **Honest**: the hook must be true and explained in the video and description (the 12,000 and 100,000 are
  Babur's figures, and the description says so).

## 8.2 Making them

`template/src/scenes/Thumb.tsx` defines three variants (camera, battle state, words, side) rendered from the
real 3D scene at 1920×1080 and scaled into 1280×720:

```bash
for v in 0 1 2; do npx remotion still Thumb out/thumb$v.jpg --props="{\"v\":$v}" --gl=angle --jpeg-quality=92; done
```

Iterate on camera and words by looking at the stills. Panipat iteration notes:
- First tries were too wide: elephants small, blown-out white sky. Moving the camera to 6–9 m from one elephant at
  shoulder height, with a cloudy blue HDRI, fixed both.
- Words overlapping the subject: put the subject on the opposite third to the text.
- A foreground cannon too close to the camera became a blurry brown blob; keep foreground props at least a few
  metres away, or out of shot.
- Long words at 132 px overflowed the 620 px text column; use 96 px for words longer than 7 characters.

Deliver three: `thumb-A.jpg`, `thumb-B.jpg`, `thumb-C.jpg` (1280×720 JPEG, under 2 MB each; YouTube's limit).
Upload all three in Studio with **Test & Compare**; YouTube picks the one with the best watch-time share.
Custom thumbnails need a phone-verified channel (youtube.com/verify).
