# 6. Render, mix and deliver

## 6.1 Setup

```bash
cd template
NODE_ENV=development npm install --include=dev --registry=https://registry.npmjs.org/
```

Pass the registry explicitly if the machine has a private npm registry configured (an internal registry
hung `npm install` for 12+ minutes). **Never run `npm install <pkg>` with `NODE_ENV=production` set**: npm
then removes devDependencies (TypeScript, ESLint) from `node_modules`.

Type-check before rendering: `npx tsc --noEmit -p .` (ignore TS6133 "declared but never read").

## 6.2 Render the silent master in chunks

A single 25k-frame render with realistic 3D crashed at frame 9,897 with
`THREE.WebGLRenderer: Error creating WebGL context` and threw away ~2 hours of work (Remotion only writes the
file at the end). Render in chunks that each save to disk, retry failed chunks, then concatenate:

```bash
TOTAL=24622; STEP=3000
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=out/chunks/c$(printf %05d $a).mp4; [ -s $f ] && continue
  for try in 1 2 3; do
    npx remotion render Panipat $f --frames=$a-$b --codec=h264 --crf=16 --muted --gl=angle \
      --concurrency=4 --timeout=240000 && break
    rm -f $f
  done
done
(cd out/chunks && ls c*.mp4 | sed 's/^/file /' > list.txt)
ffmpeg -f concat -safe 0 -i out/chunks/list.txt -c copy out/master.mp4
```

- `--gl=angle` on macOS (hardware WebGL through Metal); concurrency 4 for 3D-heavy work, 8–9 for 2D-only.
- `--timeout=240000`: the first frame of a 3D shot loads ~0.5 GB of assets.
- Run long jobs detached (`nohup … &`) and poll the log; agent shells usually time out after ~60 s.
- Speeds on an M2 Pro: 2D scenes ~15–20 frames/s; realistic 3D ~1–3 frames/s.
- On Linux without a GPU: `--gl=swiftshader` works but is very slow. Use a Mac or a GPU machine.

## 6.3 Mix

```bash
python3 tools/mix.py --timeline template/src/timeline.json --voice out/narration_raw.wav \
   --music-dir music --plan music_plan.json --out out/docmix.wav
ffmpeg -i out/docmix.wav -c:a aac -b:a 256k out/docmix.m4a
```

- One or more tracks per chapter, chosen for mood (Panipat: wandering for the prince's youth, tense for the
  sultanate, building for the march, percussive for the battle, sombre for the death, heroic for the legacy).
  An offset lets a reused track start at a different point.
- The bed sits at RMS 0.045 and ducks 62% under speech with 0.5 s smoothing, with 3 s crossfades at chapter cards.
- `loudnorm I=-14 TP=-1.5 LRA=11`: YouTube normalises to about −14 LUFS, so mixing there avoids being turned down.
- Use cumulative-sum moving averages, not `np.convolve`, for the ducking envelope: the convolution took over
  three minutes on 40 M samples.
- If no one can listen, say so in the handback ("music balance set by measurement, not by ear").

## 6.4 Mux the deliverable

```bash
ffmpeg -i out/master.mp4 -i out/docmix.m4a -map 0:v -map 1:a -c:v h264_videotoolbox -b:v 12M -maxrate 16M \
  -bufsize 24M -profile:v high -pix_fmt yuv420p -c:a copy -shortest -movflags +faststart Final.mp4
```

- 1080p30 at 12 Mbps is above YouTube's 8 Mbps recommendation; a 14-minute film is ~1.2 GB (YouTube's limit is
  256 GB or 12 h). The CRF 16 master is ~4 GB; don't upload that.
- On Linux use `-c:v libx264 -preset slow -b:v 12M`.
- Check that picture and sound durations match (`ffprobe`), then watch the first minute, one battle minute and
  the last minute.

## 6.5 Re-renders after a narration change

Pronunciation fixes change sentence lengths, so rebuild the timeline, copy it to `src/timeline.json`,
re-render and re-mix. Scenes re-time themselves because they read the timeline. Keep the previous timeline
and mix in a `backup/` folder before overwriting.
