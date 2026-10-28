# 10. Troubleshooting: every problem hit while making Panipat 1526

| Symptom | Cause | Fix |
|---|---|---|
| Names mispronounced ("BAB-er", "laks", "Khwaja" spelled out) | Kokoro's English phonemiser | IPA lexicon (reference 02); re-record only affected sentences |
| 3D stills have no sky or ground; background shows the page colour | `delayRender` inside the r3f canvas didn't hold the frame | Preload all assets in the outer component with `useAsset(..., preloadBattle)` and return `null` until ready |
| Blank frames after adding ambient occlusion and bloom | `EffectComposer` doesn't render through Remotion's ThreeCanvas | Remove post-processing; rely on HDRI lighting, soft shadows and haze |
| Sketchfab model grey or untextured | KHR_materials_pbrSpecularGlossiness unsupported in three.js r147+ | `gltf-transform metalrough in.gltf out.glb` |
| `mergeGeometries` returns null → "Cannot read properties of null (reading 'computeBoundingSphere')" | Mixed indexed/non-indexed parts, or extra attributes (uv) | Convert every part to non-indexed with position and normal only before merging |
| Render dies at frame ~10,000: "Error creating WebGL context" | GPU contexts exhausted over hours of heavy 3D | Render in 3,000-frame chunks with retries; concurrency 4 |
| Model faces backwards | Different authoring conventions | Check in the Models composition; set `FIX[key].yaw` |
| Riders' legs poke through the horse | Standing model on horseback | `riderParts(man, 0.5)` removes below-knee triangles |
| Sky washed white, horizon milky | Bright morning HDRI plus dense fog | Use a cloudy blue HDRI; FogExp2 0.0009; exposure 0.72; background intensity 0.85 |
| Far edge of ground visible on high shots | Ground plane too small | 6000-unit plane, texture repeat scaled to match |
| Film grain looks like noise on 3D shots | Grain tuned for dark painted pages | Fade grain to 0.08 opacity on battle shots (`grainAt`) |
| Anachronism (18th-century naval cannon at a 1526 battle) | Grabbing the first free model | Research period equipment; build or choose period-correct props |
| Soldiers bare-chested where they should be armoured | Only one free soldier model | Add coats and helmets per side; tint lightly |
| `unzip`: "End-of-central-directory signature not found" | Browser still downloading | Wait until the file size stops changing |
| `npm install` hangs | Private registry in `~/.npmrc` | `--registry=https://registry.npmjs.org/` |
| `npm install` removed 89 packages | `NODE_ENV=production` set in the shell | `NODE_ENV=development npm install --include=dev` |
| Python downloads hang | `urllib` behind a proxy | Use `curl` via subprocess |
| Audio mix takes many minutes | `np.convolve` with long kernels | Cumulative-sum moving average |
| Final file 4.3 GB | Uploading the CRF 16 master | Mux at 12 Mbps (~1.2 GB for 14 min) |
| Text overflows on thumbnails | Font size too large for long words | Size by word length; check at 25% scale |
| Thumbnail subject tiny | Camera too far | 6–9 m from the subject, low angle |
| Custom thumbnail button missing | Channel not phone-verified | youtube.com/verify |
| Agent shell times out on long jobs | ~60 s tool timeout | `nohup … &`, then poll the log |
