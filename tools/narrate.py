#!/usr/bin/env python3
"""Record a documentary script with Kokoro TTS, one WAV per sentence, with exact pronunciations.

Usage:
  python3 narrate.py script.json --lexicon lexicon.json --out rec --voice af_heart --speed 0.95 \
      --model kokoro-v1.0.int8.onnx --voices voices-v1.0.bin

Outputs:
  rec/<beatId>_<n>.wav      one file per sentence (24 kHz mono)
  rec/timings.json          {beatId: [[sentence, seconds], ...]}  (input to build_narration.py and mksrt.py)
  rec/phonemes.log          the phonemes actually spoken, for checking names

Re-running only records sentences whose WAV is missing, so to fix one name: add it to the lexicon,
delete the affected WAVs (grep phonemes.log for the word) and run again.

Setup (once):
  pip install kokoro-onnx soundfile
  # model + voices: https://github.com/thewh1teagle/kokoro-onnx/releases  (kokoro-v1.0.int8.onnx, voices-v1.0.bin)

Pronunciation: Kokoro reads English through espeak-style IPA. Non-English names (Babur, Humayun, lakh,
Khwaja...) are often wrong. The lexicon maps a word to the exact IPA to speak instead; every other word is
phonemised normally. Run with --check to print the default vs. lexicon phonemes without recording.
"""
import argparse, json, re, sys
from years import spoken_years  # 1527 -> 'fifteen twenty-seven'
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

ap = argparse.ArgumentParser()
ap.add_argument('script'); ap.add_argument('--lexicon'); ap.add_argument('--out', default='rec')
ap.add_argument('--voice', default='af_heart'); ap.add_argument('--speed', type=float, default=0.95)
ap.add_argument('--lang', default='en-us')
ap.add_argument('--model', default='kokoro-v1.0.int8.onnx'); ap.add_argument('--voices', default='voices-v1.0.bin')
ap.add_argument('--check', action='store_true', help='print lexicon phonemes and exit')
a = ap.parse_args()

k = Kokoro(a.model, a.voices)
phonemize = lambda text: k.tokenizer.phonemize(text, a.lang)
LEX = json.load(open(a.lexicon)) if a.lexicon else {}
# Longest first, whole words only (so "Babur's" wins over "Babur", and "Lodi" doesn't fire inside "Lodis").
PAT = re.compile(r"(?<![\w'-])(" + "|".join(re.escape(w) for w in sorted(LEX, key=len, reverse=True)) + r")(?![\w'-])") if LEX else None

if a.check:
    for w, ipa in LEX.items(): print(f'{w:16} default {phonemize(w):24} -> lexicon {ipa}')
    sys.exit()

def to_phonemes(text: str) -> str:
    if not PAT: return phonemize(text)
    out, last = [], 0
    for m in PAT.finditer(text):
        chunk = text[last:m.start()]
        if chunk.strip(): out.append(phonemize(chunk))
        out.append(LEX[m.group(1)]); last = m.end()
    if text[last:].strip(): out.append(phonemize(text[last:]))
    s = ''
    for p in (p.strip() for p in out):
        s = s + p if (not s or p[:1] in ',.;:?!') else s + ' ' + p
    return re.sub(r'\s+', ' ', s).strip()

doc = json.load(open(a.script))
out = Path(a.out); out.mkdir(exist_ok=True)
log = open(out / 'phonemes.log', 'a')
timings = {}
for ch in doc['chapters']:
    for b in ch['beats']:
        # one recording per sentence; a colon also ends a "sentence" so the narrator pauses there
        sents = [s for s in re.split(r'(?<=[.?!:])\s+', b['t']) if s.strip()]
        timings[b['id']] = []
        for i, s in enumerate(sents):
            f = out / f"{b['id']}_{i}.wav"
            ph = to_phonemes(spoken_years(s.replace('’', "'")))
            if not f.exists():
                audio, sr = k.create(ph, voice=a.voice, speed=a.speed, lang=a.lang, is_phonemes=True)
                sf.write(f, audio, sr)
            info = sf.info(f)
            timings[b['id']].append([s, round(info.frames / info.samplerate, 3)])
            print(b['id'], i, ph, file=log, flush=True); print(f"{b['id']}_{i}", round(info.frames / info.samplerate, 2), 's', flush=True)
        json.dump(timings, open(out / 'timings.json', 'w'), indent=0, ensure_ascii=False)
print('DONE', sum(d for v in timings.values() for _, d in v), 'seconds of speech')
