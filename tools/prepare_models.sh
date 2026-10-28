#!/usr/bin/env bash
# Convert Sketchfab glTF downloads into what three.js r150+ can render, and make light crowd versions.
#
# Usage: tools/prepare_models.sh <downloads-dir> <template/public/sk>
# Expects these Sketchfab zips (glTF format) in <downloads-dir>; see references/05-assets-and-licensing.md:
#   india_elephantf.zip        -> elephant.glb         (~16k triangles; 30 instances is fine)
#   horse.zip                  -> horse_hi.glb         (62k triangles; close shots only)
#   horse_riggedgame_ready.zip -> horse_rig.glb        (2.9k triangles, rigged + animated; crowds and gallops)
#   warrior_in_turban.zip      -> warrior.glb          (20k triangles; close shots)
#                                 warrior_lo.glb       (2.4k triangles; thousands of instances)
#
# Why "metalrough": many Sketchfab exports use KHR_materials_pbrSpecularGlossiness, which three.js dropped
# (r147+). Without converting, the models load untextured or grey.
# Wait until downloads have finished: browsers write .zip files progressively, and unzip fails with
# "End-of-central-directory signature not found" while a download is still in progress.
set -euo pipefail
DL=${1:?downloads dir}; OUT=${2:?output dir}
G="npx --yes @gltf-transform/cli@4"
mkdir -p "$OUT" /tmp/skx
for z in india_elephantf horse horse_riggedgame_ready warrior_in_turban; do
  rm -rf "/tmp/skx/$z"; mkdir -p "/tmp/skx/$z"; unzip -q -o "$DL/$z.zip" -d "/tmp/skx/$z"
  cp "/tmp/skx/$z/license.txt" "$OUT/$z.license.txt" 2>/dev/null || true
done
$G metalrough /tmp/skx/india_elephantf/scene.gltf "$OUT/elephant.glb"
$G metalrough /tmp/skx/horse/scene.gltf /tmp/skx/h.glb && $G resize /tmp/skx/h.glb "$OUT/horse_hi.glb" --width 1024 --height 1024
$G metalrough /tmp/skx/horse_riggedgame_ready/scene.gltf "$OUT/horse_rig.glb"
$G copy /tmp/skx/warrior_in_turban/scene.gltf "$OUT/warrior.glb"
$G weld "$OUT/warrior.glb" /tmp/skx/w1.glb
$G simplify /tmp/skx/w1.glb /tmp/skx/w2.glb --ratio 0.12 --error 0.02
$G resize /tmp/skx/w2.glb "$OUT/warrior_lo.glb" --width 512 --height 512
ls -la "$OUT"
echo "Now open the Models composition in Remotion Studio and check each model faces +z (fix FIX[...].yaw in src/battle/real.tsx)."
