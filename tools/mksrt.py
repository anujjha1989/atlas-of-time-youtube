#!/usr/bin/env python3
"""Subtitles (.srt) and YouTube chapter times from the video timeline and the per-sentence durations.

Usage:
  python3 mksrt.py --timeline timeline.json --timings rec/timings.json --out subtitles-en.srt --chapters chapters.txt
  python3 mksrt.py --timeline timeline.json --timings rec/timings.json --out subtitles-hi.srt --translation hi.json

--translation: a JSON list with one translated sentence per narrated sentence, in the same order as the
script (narrate.py splits each beat on . ? ! and :). Translate whole sentences, not cues: other languages
order words differently, so each translated sentence is timed to its English sentence and split by length.

Cues: at most ~80 characters, wrapped to two lines (~42 per line; 40 for Devanagari), timed in proportion to
their length within the sentence, with a 50 ms gap. Chapter times (m:ss) are taken from the chapter cards; the
first is always 0:00 so YouTube shows chapters.
"""
import argparse, json, textwrap

ap = argparse.ArgumentParser()
ap.add_argument('--timeline', required=True); ap.add_argument('--timings', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--chapters'); ap.add_argument('--translation'); ap.add_argument('--width', type=int, default=42)
a = ap.parse_args()
tl, tim = json.load(open(a.timeline)), json.load(open(a.timings))
tr = json.load(open(a.translation)) if a.translation else None
fps = tl['fps']

def ts(s):
    h, m = int(s // 3600), int(s % 3600 // 60)
    return f"{h:02d}:{m:02d}:{s % 60:06.3f}".replace('.', ',')

def chunks(text, n=2 * 40):
    out, cur = [], ''
    for w in text.split():
        if cur and len(cur) + 1 + len(w) > n: out.append(cur); cur = w
        else: cur = f"{cur} {w}".strip()
    return out + ([cur] if cur else [])

cues, chap, k = [], [], 0
for c in tl['chapters']:
    start = (c['card'][0] if 'card' in c else 0) / fps
    chap.append(f"{int(start // 60)}:{int(start % 60):02d} {c.get('title') or 'Introduction'}")
    for b in c['beats']:
        for i, (f0, text) in enumerate(b['sents']):
            t, dur = f0 / fps, tim[b['id']][i][1]
            if tr: text = tr[k]
            k += 1
            parts = chunks(text); total = sum(len(p) for p in parts)
            for p in parts:
                d = dur * len(p) / total
                cues.append((t, t + d - 0.05, '\n'.join(textwrap.wrap(p, a.width)))); t += d
if tr: assert k == len(tr), f'translation has {len(tr)} sentences, script has {k}'
with open(a.out, 'w') as f:
    for n, (s0, s1, t) in enumerate(cues, 1): f.write(f"{n}\n{ts(s0)} --> {ts(s1)}\n{t}\n\n")
if a.chapters: open(a.chapters, 'w').write('\n'.join(chap) + '\n')
print(len(cues), 'cues;', len(chap), 'chapters')
