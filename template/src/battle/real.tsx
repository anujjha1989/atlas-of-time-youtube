// Real 3D models (Sketchfab, CC BY 4.0; credits in the video description):
//  elephant  "india elephantf" by Ford mondeo
//  horse     "Horse" by victorberdugo1 (close shots) and "Horse Rigged (Game Ready)" by abhayexe (crowds, gallop)
//  soldier   "Warrior in Turban" by 37omkar
// Each is normalised to the scene's scale (1 unit ≈ 1 m for figures) and facing +z.
import React, { useMemo } from "react";
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as skClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useAsset, gltfLoad } from "./assets";
import { ELEPHANT, SOLDIER } from "./models";
import { C } from "../theme";

export const REAL = {
  elephant: "sk/elephant.glb", horseHi: "sk/horse_hi.glb", horseRig: "sk/horse_rig.glb", soldier: "sk/warrior_lo.glb", soldierHi: "sk/warrior.glb",
};
// Facing corrections (radians about y) found by test renders, and target heights in scene units.
export const FIX: Record<keyof typeof REAL, { yaw: number; h: number }> = {
  elephant: { yaw: Math.PI, h: 3.0 }, horseHi: { yaw: 0, h: 1.75 }, horseRig: { yaw: 0, h: 1.75 }, soldier: { yaw: 0, h: 1.75 }, soldierHi: { yaw: 0, h: 1.75 },
};

// One geometry per material, transforms baked, centred on x/z, feet at y = 0, facing +z, at target height.
export const normalised = (g: GLTF, key: keyof typeof REAL) => {
  const parts: { geometry: THREE.BufferGeometry; material: THREE.MeshStandardMaterial }[] = [];
  g.scene.updateMatrixWorld(true);
  g.scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      const geo = m.geometry.clone(); geo.applyMatrix4(m.matrixWorld);
      for (const k of Object.keys(geo.attributes)) if (!["position", "normal", "uv"].includes(k)) geo.deleteAttribute(k);
      parts.push({ geometry: geo, material: (m.material as THREE.MeshStandardMaterial).clone() });
    }
  });
  const box = new THREE.Box3(); parts.forEach((p) => { p.geometry.computeBoundingBox(); box.union(p.geometry.boundingBox!); });
  const k = FIX[key].h / (box.max.y - box.min.y), cx = (box.max.x + box.min.x) / 2, cz = (box.max.z + box.min.z) / 2;
  const mat = new THREE.Matrix4().makeRotationY(FIX[key].yaw).multiply(new THREE.Matrix4().makeScale(k, k, k)).multiply(new THREE.Matrix4().makeTranslation(-cx, -box.min.y, -cz));
  parts.forEach((p) => { p.geometry.applyMatrix4(mat); p.geometry.computeBoundingSphere(); p.material.roughness = Math.max(0.6, p.material.roughness ?? 1); p.material.metalness = 0; });
  return parts;
};

export const useReal = (key: keyof typeof REAL) => {
  const g = useAsset<GLTF>(REAL[key], () => gltfLoad(REAL[key]));
  return useMemo(() => (g ? normalised(g, key) : null), [g, key]);
};

// A seated rider: the soldier with everything below the knee removed (hidden by the horse's flank).
export const riderParts = (parts: ReturnType<typeof normalised>, cut = 0.5) => parts.map((p) => {
  const g = p.geometry.index ? p.geometry.toNonIndexed() : p.geometry.clone();
  const pos = g.attributes.position, keep: number[] = [];
  for (let t = 0; t < pos.count; t += 3) if (Math.min(pos.getY(t), pos.getY(t + 1), pos.getY(t + 2)) > cut) keep.push(t);
  const out = new THREE.BufferGeometry();
  for (const name of Object.keys(g.attributes)) {
    const a = g.attributes[name] as THREE.BufferAttribute, n = a.itemSize, arr = new Float32Array(keep.length * 3 * n);
    keep.forEach((t, i) => { for (let v = 0; v < 3; v++) for (let c = 0; c < n; c++) arr[(i * 3 + v) * n + c] = a.array[(t + v) * n + c]; });
    out.setAttribute(name, new THREE.BufferAttribute(arr, n));
  }
  out.translate(0, -cut, 0); out.computeBoundingSphere();
  return { geometry: out, material: p.material };
});

// The war elephant: the real elephant with the caparison, howdah and riders fitted to its back.
const clothMat = new THREE.MeshStandardMaterial({ color: C.vermilion, roughness: 0.8, side: THREE.DoubleSide });
const goldMat = new THREE.MeshStandardMaterial({ color: C.gold, metalness: 0.7, roughness: 0.35 });
const seatMat = new THREE.MeshStandardMaterial({ color: "#5a1d14", roughness: 0.7 });
export const RealElephant: React.FC<{ parts: ReturnType<typeof normalised>; back: number; gear?: number }> = ({ parts, back, gear = 0.82 }) => {
  const e = ELEPHANT(), s = SOLDIER();
  // the procedural gear was built for a back at y ≈ 3.5; scale it onto the real back height
  const k = (back / 3.5) * gear;
  return (
    <group>
      {parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow />)}
      <group scale={[k * 1.12, k, k * 0.95]} position={[0, back - 3.5 * k - 0.12, -0.15]}>
        <mesh geometry={e.cloth} material={clothMat} castShadow />
        <mesh geometry={e.howdah} material={seatMat} castShadow />
        <mesh geometry={e.gold} material={goldMat} castShadow />
        {([[-0.3, 3.45, -0.15], [0.3, 3.45, -0.15]] as const).map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]} scale={0.7}>
            <mesh geometry={s.body}><meshStandardMaterial color="#efe6d0" roughness={0.8} /></mesh>
            <mesh geometry={s.head}><meshStandardMaterial color="#9a6b45" roughness={0.85} /></mesh>
            <mesh geometry={s.turban}><meshStandardMaterial color={C.gold} roughness={0.6} /></mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// A galloping horse from the rigged model, posed by frame time (no useFrame).
export const RiggedHorse: React.FC<{ g: GLTF; t: number; speed?: number }> = ({ g, t, speed = 1 }) => {
  const { scene, mixer } = useMemo(() => {
    const sc = skClone(g.scene) as THREE.Object3D;
    const box = new THREE.Box3().setFromObject(sc), k = FIX.horseRig.h / (box.max.y - box.min.y);
    sc.scale.setScalar(k); sc.rotation.y = FIX.horseRig.yaw;
    sc.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
    const mx = new THREE.AnimationMixer(sc);
    if (g.animations[0]) mx.clipAction(g.animations[0]).play();
    return { scene: sc, mixer: mx };
  }, [g]);
  mixer.setTime((t * speed) % (g.animations[0]?.duration || 1));
  return <primitive object={scene} />;
};
