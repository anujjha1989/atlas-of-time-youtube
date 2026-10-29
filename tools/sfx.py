#!/usr/bin/env python3
"""Synthesised, restrained sound design for Khanwa, locked to the picture.
Cannon booms fire exactly when the 3D guns flash (same formula as Guns in Khanwa3D.tsx), matchlock crackle while the
line fires, hoof rumble under charges and gallops, a distant battle din under the whole battle chapter, and a metallic
clink when the wine vessels break. Output: out/sfx.wav (48 kHz stereo), mixed under the music+voice bed later."""
import json, numpy as np, soundfile as sf

SR = 48000
TL = json.load(open("out/timeline.json")); FPS = TL["fps"]; N = int(TL["total"] / FPS * SR) + SR
B = {b["id"]: b for c in TL["chapters"] for b in c["beats"]}
CH = {c["id"]: c for c in TL["chapters"]}
rng = np.random.default_rng(1527)
out = np.zeros((N, 2))

def movavg(x, k):
    c = np.cumsum(np.concatenate([[0.0], x])); k = max(1, int(k)); i = np.arange(len(x))
    lo = np.clip(i - k // 2, 0, len(x)); hi = np.clip(i - k // 2 + k, 0, len(x)); return (c[hi] - c[lo]) / np.maximum(1, hi - lo)
def lowpass(x, hz): return movavg(movavg(x, SR / hz), SR / hz)
def add(t, sig, pan=0.0):
    i0 = int(t * SR)
    if i0 >= N or i0 + len(sig) <= 0: return
    s = sig[max(0, -i0): N - i0]; i0 = max(0, i0)
    out[i0:i0 + len(s), 0] += s * np.sqrt(0.5 * (1 - pan)); out[i0:i0 + len(s), 1] += s * np.sqrt(0.5 * (1 + pan))
def beat_t(bid, f=0): return (B[bid]["start"] + f) / FPS
def sent(bid, i, d): s = B[bid]["sents"]; return (s[i][0] - B[bid]["start"]) if i < len(s) else d

def boom(amp, heavy=True):
    n = int((2.8 if heavy else 1.4) * SR); t = np.arange(n) / SR
    body = lowpass(rng.standard_normal(n), 180 if heavy else 400) * 9
    thump = np.sin(2 * np.pi * (42 if heavy else 70) * t * (1 - 0.15 * t)) * np.exp(-t / (0.28 if heavy else 0.12))
    env = np.exp(-t / (0.55 if heavy else 0.22)) * (1 - np.exp(-t / 0.004))
    tail = lowpass(rng.standard_normal(n), 90) * 6 * np.exp(-t / 1.2) * (0.5 if heavy else 0.2)
    return (body * env + thump * 0.9 + tail) * amp
def crack(amp):
    n = int(0.25 * SR); t = np.arange(n) / SR; w = rng.standard_normal(n)
    hi = w - movavg(w, 12)
    return (hi * np.exp(-t / 0.012) * 0.8 + lowpass(w, 300) * 4 * np.exp(-t / 0.08)) * amp
def clink(amp):
    n = int(0.9 * SR); t = np.arange(n) / SR
    tone = sum(np.sin(2 * np.pi * fq * t + rng.uniform(0, 6)) * np.exp(-t / d) for fq, d in [(2140, .30), (3390, .22), (5230, .14), (7810, .08)])
    return (tone * 0.25 + rng.standard_normal(n) * np.exp(-t / 0.006) * 0.4) * amp
def bed(dur, amp, kind):
    n = int(dur * SR); t = np.arange(n) / SR; w = rng.standard_normal(n)
    if kind == "hooves":   # low rumble with an irregular 5–8 Hz pulse
        base = lowpass(w, 120) * 10; pulse = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * (6.2 + 0.8 * np.sin(t * 0.7)) * t))
        sig = base * pulse
    else:                  # distant din: band of noise, slowly swelling
        band = lowpass(w, 1400) - lowpass(w, 220); sig = band * 3 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * t + 1))
    fade = np.minimum(1, np.minimum(t / 1.2, (dur - t) / 1.2)).clip(0, 1)
    return sig * fade * amp

def guns(bid, fire_fn, light_only=False, scale=1.0):
    """Boom on every muzzle flash: gun i flashes when (t*0.7 + i*0.41) mod 2.6 wraps (t = beat-local seconds)."""
    b = B[bid]; dur = (b["end"] - b["start"]) / FPS
    for i in range(6):
        if light_only and i < 3: continue
        kk = 0
        while True:
            t = (2.6 * kk - 0.41 * i) / 0.7; kk += 1
            if t < 0: continue
            if t > dur: break
            fire = fire_fn(t * FPS)
            if fire <= 0.02: continue
            add(beat_t(bid) + t, boom(0.22 * fire * scale, heavy=i < 3), pan=(-0.3 if i >= 3 else 0.15 * (i - 1)))
def crackle(bid, fire_fn, rate=5.0, amp=0.05):
    b = B[bid]; dur = (b["end"] - b["start"]) / FPS; t = 0.0
    while t < dur:
        t += rng.exponential(1 / rate); fire = fire_fn(t * FPS)
        if fire > 0.05: add(beat_t(bid) + t, crack(amp * fire * rng.uniform(0.5, 1.2)), pan=rng.uniform(-0.8, 0.8))
def ramp(f, a, b): return float(np.clip((f - a) / max(1, b - a), 0, 1))
def span(bid, f0, f1, amp, kind="hooves"):
    t0 = beat_t(bid, f0); add(t0, bed((f1 - f0) / FPS, amp, kind))

# --- guns and matchlocks, beat by beat (fire levels mirror the shots in Khanwa.tsx / Khanwa2.tsx) ---
s1 = sent("b1", 1, 224)
FIRE = {
    "b1": lambda f: 0.5 * ramp(f, s1, s1 + 20),
    "b3": lambda f: ramp(f, 40, 120),
    "b6": lambda f: 0.6, "b7": lambda f: 1.0, "b8": lambda f: 0.7, "b10": lambda f: 0.8, "b11": lambda f: 0.3,
    "a2": lambda f: 0.5 * ramp(f, 60, 90),
}
for bid, fn in FIRE.items():
    guns(bid, fn, scale=0.6 if bid == "a2" else 1.0); crackle(bid, fn, rate=6 if bid in ("b3", "b7", "b10") else 3)
# the 2D maps inside the battle keep a few distant guns going
for bid in ("b2", "b4", "b5", "b9"):
    b = B[bid]; t = 0.5
    while t < (b["end"] - b["start"]) / FPS - 0.5:
        add(beat_t(bid) + t, boom(0.08, heavy=True), pan=rng.uniform(-0.5, 0.5)); t += rng.uniform(1.8, 3.4)

# --- hooves ---
def whole(bid): return (0, B[bid]["end"] - B[bid]["start"])
span("o5", *whole("o5"), 0.05)
span("b1", *whole("b1"), 0.07)
span("b2", 0, sent("b2", 1, 91) + 20, 0.08)
span("b6", sent("b6", 2, 356) - 20, B["b6"]["end"] - B["b6"]["start"], 0.08)
span("b8", *whole("b8"), 0.05)
span("b10", 0, sent("b10", 2, 308), 0.09)
span("b11", *whole("b11"), 0.07)
span("g5", *whole("g5"), 0.035)
span("w1", *whole("w1"), 0.035)
# --- distant din under the whole battle chapter ---
bt0 = CH["battle"]["beats"][0]["start"] / FPS; bt1 = CH["battle"]["beats"][-1]["end"] / FPS
add(bt0, bed(bt1 - bt0 + 2, 0.022, "din"))

# --- the vessels break (KWine breaks at s[1]+50 frames, then +8 and +16) ---
for bid, at in (("o4", sent("o4", 1, 166) + 50), ("v2", sent("v2", 1, 57) - 20 + 50)):
    for j, pan in enumerate((-0.4, 0.0, 0.4)):
        add(beat_t(bid, at + 8 * j), clink(0.16), pan=pan)

peak = np.abs(out).max(); print("sfx peak", round(float(peak), 3))
sf.write("out/sfx.wav", out.astype(np.float32), SR)
