# Stitches the per-sentence Kokoro recordings into one narration track and writes the
# frame timeline the Remotion video reads (panipat/src/timeline.json).
# Usage: python3 build_narration.py <script.json> <timings.json> <rec_dir> <out_dir>
import json, sys, numpy as np, soundfile as sf
script, timings, rec, outd = sys.argv[1:5]
doc = json.load(open(script)); tim = json.load(open(timings))
SR = 24000; FPS = 30
SG, BG, CH, LEAD = 0.34, 0.75, 4.2, 1.2   # sentence gap, beat gap, chapter card, lead-in (s)
parts = [np.zeros(int(LEAD * SR), np.float32)]; t = LEAD; out = {'fps': FPS, 'chapters': []}
for ch in doc['chapters']:
    c = {'id': ch['id'], 'title': ch['title'], 'beats': []}
    if ch['title']:
        c['card'] = [round(t * FPS), round((t + CH) * FPS)]; parts.append(np.zeros(int(CH * SR), np.float32)); t += CH
    for b in ch['beats']:
        bs = {'id': b['id'], 'v': b['v'], 'start': round(t * FPS), 'sents': []}
        for i, (s, dur) in enumerate(tim[b['id']]):
            a, sr = sf.read(f"{rec}/{b['id']}_{i}.wav", dtype='float32')
            bs['sents'].append([round(t * FPS), s]); parts.append(a); t += len(a) / SR
            parts.append(np.zeros(int(SG * SR), np.float32)); t += SG
        bs['end'] = round(t * FPS); c['beats'].append(bs)
        parts.append(np.zeros(int(BG * SR), np.float32)); t += BG
    out['chapters'].append(c)
t += 8.0; parts.append(np.zeros(int(8.0 * SR), np.float32))
out['total'] = round(t * FPS)
sf.write(f'{outd}/narration_raw.wav', np.concatenate(parts), SR)
json.dump(out, open(f'{outd}/timeline.json', 'w'), indent=0)
print('seconds', round(t, 1))
