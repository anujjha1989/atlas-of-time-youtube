// Loads glTF models, HDR skies and textures once per tab, holding the Remotion render until they're ready.
import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { continueRender, delayRender, staticFile } from "remotion";

const cache = new Map<string, { promise: Promise<unknown>; value?: unknown }>();
const load = <T,>(key: string, fn: () => Promise<T>) => {
  let e = cache.get(key);
  if (!e) { const entry: { promise: Promise<unknown>; value?: unknown } = { promise: fn() }; entry.promise = entry.promise.then((v) => (entry.value = v)); cache.set(key, entry); e = entry; }
  return e as { promise: Promise<T>; value?: T };
};
export const useAsset = <T,>(key: string, fn: () => Promise<T>): T | undefined => {
  const e = load(key, fn);
  const [v, setV] = useState<T | undefined>(e.value);
  useEffect(() => {
    if (v !== undefined) return;
    const h = delayRender(`asset ${key}`, { timeoutInMilliseconds: 120000 });
    e.promise.then((x) => { setV(x); continueRender(h); }).catch((err) => { console.error(err); continueRender(h); });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return v ?? e.value;
};

const gltf = new GLTFLoader(), hdr = new HDRLoader(), tex = new THREE.TextureLoader();
export const gltfLoad = (path: string) => load(path, () => gltf.loadAsync(staticFile(path))).promise as Promise<GLTF>;
export const useGLTFAsset = (path: string) => useAsset<GLTF>(path, () => gltf.loadAsync(staticFile(path)));
export const useHDR = (path: string) => useAsset<THREE.DataTexture>(path, () => hdr.loadAsync(staticFile(path)).then((t) => { t.mapping = THREE.EquirectangularReflectionMapping; return t; }));
export const useTex = (path: string, repeat = 1, srgb = false) => useAsset<THREE.Texture>(`${path}@${repeat}`, () => tex.loadAsync(staticFile(path)).then((t) => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 16;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}));

// All meshes in a glTF scene, with their transforms baked, so they can be drawn as instanced meshes.
export const bakedParts = (g: GLTF) => {
  const out: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = [];
  g.scene.updateMatrixWorld(true);
  g.scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) { const geo = m.geometry.clone(); geo.applyMatrix4(m.matrixWorld); out.push({ geometry: geo, material: m.material as THREE.Material }); }
  });
  return out;
};

// Everything the battle scene needs, loaded before the 3D canvas mounts (Remotion waits on this).
export const BATTLE_ASSETS = {
  hdr: ["ph/hdri/kloofendal_48d_partly_cloudy_puresky.hdr", "ph/hdri/qwantani_sunrise_puresky.hdr", "ph/hdri/qwantani_night_puresky.hdr"],
  tex: [["ph/tex/dry_ground_01_diff.jpg", 260, true], ["ph/tex/dry_ground_01_nor.jpg", 260, false], ["ph/tex/dry_ground_01_rough.jpg", 260, false], ["ph/tex/aerial_grass_rock_diff.jpg", 40, true], ["ph/tex/wood_diff.jpg", 1, true], ["ph/tex/wood_nor.jpg", 1, false], ["ph/tex/dry_ground_01_diff.jpg", 1100, true], ["ph/tex/dry_ground_01_nor.jpg", 1100, false], ["ph/tex/dry_ground_01_rough.jpg", 1100, false]] as [string, number, boolean][],
  real: ["sk/elephant.glb", "sk/horse_hi.glb", "sk/horse_rig.glb", "sk/warrior_lo.glb", "sk/warrior.glb"],
  gltf: ["island_tree_01", "island_tree_02", "island_tree_03", "jacaranda_tree", "grass_medium_01", "grass_medium_02", "namaqualand_boulder_04", "dead_tree_trunk_02"].map((m) => `ph/models/${m}/${m}.gltf`),
};
const texLoad = (path: string, repeat: number, srgb: boolean) => load(`${path}@${repeat}`, () => tex.loadAsync(staticFile(path)).then((t) => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 16; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
})).promise;
export const preloadBattle = () => Promise.all([
  ...BATTLE_ASSETS.hdr.map((p) => load(p, () => hdr.loadAsync(staticFile(p)).then((t) => { t.mapping = THREE.EquirectangularReflectionMapping; return t; })).promise),
  ...BATTLE_ASSETS.tex.map(([p, r, s]) => texLoad(p, r, s)),
  ...[...BATTLE_ASSETS.gltf, ...BATTLE_ASSETS.real].map((p) => load(p, () => gltf.loadAsync(staticFile(p))).promise),
]).then(() => true);
