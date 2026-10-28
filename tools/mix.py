#!/usr/bin/env python3
"""Mix narration with chapter music: crossfades at chapter cards, ducking under speech, loudness to -14 LUFS.

Usage:
  python3 mix.py --timeline timeline.json --voice narration_raw.wav --music-dir music/ --plan music_plan.json --out docmix.wav
  ffmpeg -i docmix.wav -c:a aac -b:a 256k docmix.m4a

music_plan.json maps each chapter id (from script.json) to [track file name without .mp3, start offset in s],
plus an optional per-track gain:
  {"chapters": {"open": ["Interloper", 0], "babur": ["Long Road Ahead", 0], ...},
   "gain": {"Desert City": 0.7}}

Levels (tuned by measurement, check by ear):
  music bed RMS 0.045 before ducking; ducked by 62% while the voice speaks; 3 s crossfades; 4 s fade-out.
  final loudness normalised to -14 LUFS integrated, -1.5 dBTP (YouTube's playback target).
"""
import argparse, json, subprocess
import numpy as np

ap = argparse.ArgumentParser()
for k in ['timeline', 'voice', 'music-dir', 'plan', 'out']: ap.add_argument('--' + k, required=True)
ap.add_argument('--bed', type=float, default=0.045); ap.add_argument('--duck', type=float, default=0.62)
a = ap.parse_args()

SR = 48000
TL = json.load(open(a.timeline)); FPS = TL['fps']; END = TL['total'] / FPS; N = int(END * SR)
PLAN = json.load(open(a.plan))

def movavg(x, k):
    """Centred moving average via cumulative sums (np.convolve is O(n·k) and takes many minutes here)."""
    c = np.cumsum(np.concatenate([np.zeros(1), x])); h = k // 2
    i = np.arange(len(x)); lo = np.clip(i - h, 0, len(x)); hi = np.clip(i - h + k, 0, len(x))
    return (c[hi] - c[lo]) / k

def load(path, ch=2):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).astype(np.float64)

voice = load(a.voice, 1)[:, 0]
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
starts = [0.0] + [c['card'][0] / FPS for c in TL['chapters'][1:]]
music = np.zeros((N, 2)); XF = 3.0
for i, c in enumerate(TL['chapters']):
    name, off = PLAN['chapters'][c['id']]
    t0 = starts[i]; t1 = starts[i + 1] if i + 1 < len(starts) else END
    trk = load(f"{a.music_dir.rstrip('/')}/{name}.mp3")
    seg = int((t1 - t0 + XF) * SR)
    src = trk[int(off * SR):]
    while len(src) < seg: src = np.concatenate([src, trk])   # loop short tracks
    src = src[:seg]
    rms = np.sqrt(np.mean(src ** 2)) or 1
    src = src / rms * a.bed * PLAN.get('gain', {}).get(name, 1.0)
    env = np.ones(seg); fx = int(XF * SR)
    env[:fx] = np.linspace(0, 1, fx) if i else np.linspace(0.3, 1, fx); env[-fx:] = np.linspace(1, 0, fx)
    i0 = int(t0 * SR); i1 = min(N, i0 + seg)
    music[i0:i1] += (src * env[:, None])[:i1 - i0]

speech = movavg(np.abs(voice), int(0.05 * SR))
speaking = np.clip(movavg((speech > 0.01).astype(np.float64), int(0.5 * SR)) * 1.6, 0, 1)
mix = music * (1 - a.duck * speaking)[:, None] + voice[:, None]
r = int(4 * SR); mix[-r:] *= np.linspace(1, 0, r)[:, None]
mix /= max(1, np.abs(mix).max() / 0.95)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-',
                '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', a.out], input=(mix * 32767).astype(np.int16).tobytes(), check=True)
print('mixed', round(END, 1), 's ->', a.out)
