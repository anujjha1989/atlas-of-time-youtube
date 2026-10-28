#!/usr/bin/env python3
"""Download the CC0 Poly Haven assets the 3D battle scenes use: sky HDRIs, PBR ground and wood textures,
and glTF trees, grass, boulders and logs. Everything is CC0 (no credit required, credit appreciated).

Usage:  python3 fetch_polyhaven.py <public-dir> [--res 2k]
Writes <public-dir>/ph/{hdri,tex,models}/... (about 0.5 GB). Uses curl because Python's urllib can hang
behind some corporate proxies.

Browse alternatives at https://polyhaven.com (the API is https://api.polyhaven.com/assets?t=hdris|textures|models).
Good choices for South Asian / Central Asian plains: the "qwantani_*_puresky" series (morning, sunrise,
night, late afternoon), "kloofendal_48d_partly_cloudy_puresky" (blue sky with clouds), dry_ground_01,
aerial_grass_rock, island_tree_01-03, jacaranda_tree, grass_medium_01/02, namaqualand_boulder_04.
"""
import json, os, subprocess, sys

OUT = os.path.join(sys.argv[1] if len(sys.argv) > 1 else 'public', 'ph')
RES = sys.argv[sys.argv.index('--res') + 1] if '--res' in sys.argv else '2k'
HDRIS = ['kloofendal_48d_partly_cloudy_puresky', 'qwantani_morning_puresky', 'qwantani_sunrise_puresky',
         'qwantani_night_puresky', 'qwantani_late_afternoon_puresky']
TEXTURES = {'dry_ground_01': 'dry_ground_01', 'aerial_grass_rock': 'aerial_grass_rock', 'weathered_planks': 'wood'}
MODELS = ['island_tree_01', 'island_tree_02', 'island_tree_03', 'jacaranda_tree', 'grass_medium_01', 'grass_medium_02',
          'namaqualand_boulder_04', 'dead_tree_trunk_02']

def get(url):
    return json.loads(subprocess.run(['curl', '-s', '--max-time', '30', url], capture_output=True, check=True).stdout)

def save(url, path):
    if os.path.exists(path): return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(['curl', '-s', '--max-time', '600', '-o', path, url], check=True)
    print('got', path, os.path.getsize(path) // 1024, 'KB', flush=True)

for h in HDRIS:
    save(get(f'https://api.polyhaven.com/files/{h}')['hdri'][RES]['hdr']['url'], f'{OUT}/hdri/{h}.hdr')
for src, name in TEXTURES.items():
    f = get(f'https://api.polyhaven.com/files/{src}')
    for m, k in [('Diffuse', 'diff'), ('nor_gl', 'nor'), ('Rough', 'rough')]:
        if m in f: save(f[m][RES]['jpg']['url'], f'{OUT}/tex/{name}_{k}.jpg')
for m in MODELS:
    g = get(f'https://api.polyhaven.com/files/{m}')['gltf']['1k']['gltf']
    save(g['url'], f'{OUT}/models/{m}/{m}.gltf')
    for rel, inc in g.get('include', {}).items(): save(inc['url'], f'{OUT}/models/{m}/{rel}')
print('DONE')
