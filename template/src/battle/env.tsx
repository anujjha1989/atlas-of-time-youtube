// Photographic environment for the battle: an HDR sky that also lights the scene, a PBR ground of dry
// earth with large-scale variation, and Poly Haven trees, grass and boulders (all CC0).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { random } from "remotion";
import { bakedParts, useGLTFAsset, useHDR, useTex } from "./assets";

export const skyFor = (night: number, dawn: number) =>
  night > 0.5 ? "ph/hdri/qwantani_night_puresky.hdr" : dawn > 0.3 ? "ph/hdri/qwantani_sunrise_puresky.hdr" : "ph/hdri/kloofendal_48d_partly_cloudy_puresky.hdr";

export const Sky: React.FC<{ night: number; dawn: number }> = ({ night, dawn }) => {
  const { scene, gl } = useThree();
  const tex = useHDR(skyFor(night, dawn));
  useLayoutEffect(() => {
    if (!tex) return;
    scene.background = tex; scene.environment = tex;
    scene.backgroundIntensity = night > 0.5 ? 0.5 : 0.85; scene.environmentIntensity = night > 0.5 ? 0.35 : dawn > 0.3 ? 0.8 : 1;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = night > 0.5 ? 0.8 : 0.72;
    const haze = night > 0.5 ? "#141b2e" : dawn > 0.3 ? "#8a6f62" : "#a9b0ae";
    scene.fog = new THREE.FogExp2(haze, night > 0.5 ? 0.0018 : 0.0009);
  }, [tex, night, dawn, scene, gl]);
  return null;
};

// Large-scale light and dark patches so the tiled earth texture doesn't read as a repeat.
const macroTexture = () => {
  const c = document.createElement("canvas"); c.width = c.height = 1024; const g = c.getContext("2d")!;
  g.fillStyle = "#d8d8d8"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 1600; i++) {
    const x = random(`mx${i}`) * 1024, y = random(`my${i}`) * 1024, r = 10 + random(`mr${i}`) * 70, v = Math.floor(150 + random(`mv${i}`) * 105);
    const t = g.createRadialGradient(x, y, 0, x, y, r); t.addColorStop(0, `rgba(${v},${v},${v},0.35)`); t.addColorStop(1, `rgba(${v},${v},${v},0)`);
    g.fillStyle = t; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
};

export const Ground: React.FC = () => {
  const R = 1100;
  const map = useTex("ph/tex/dry_ground_01_diff.jpg", R, true), nor = useTex("ph/tex/dry_ground_01_nor.jpg", R), rough = useTex("ph/tex/dry_ground_01_rough.jpg", R);
  const grass = useTex("ph/tex/aerial_grass_rock_diff.jpg", 40, true);
  const macro = useMemo(macroTexture, []);
  if (!map || !nor || !rough || !grass) return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 60]} receiveShadow>
        <planeGeometry args={[6000, 6000]} />
        <meshStandardMaterial map={map} normalMap={nor} roughnessMap={rough} aoMap={macro} aoMapIntensity={0.9} color="#c8b896" normalScale={new THREE.Vector2(1.2, 1.2)} />
      </mesh>
      {/* a thin layer of dry grass that thins out over the trampled battlefield */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 60]} receiveShadow>
        <planeGeometry args={[1400, 1400]} />
        <meshStandardMaterial map={grass} alphaMap={grassMask()} transparent depthWrite={false} color="#a9a07a" roughness={1} />
      </mesh>
    </group>
  );
};
let GM: THREE.Texture | null = null;
const grassMask = () => {
  if (GM) return GM;
  const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) {
    const x = random(`gm${i}`) * 512, y = random(`gn${i}`) * 512, r = 6 + random(`go${i}`) * 30;
    // world: plane is 1400 wide centred on z=60; keep the fighting ground (|x|<170, -40<z<170) mostly bare
    const wx = (x / 512 - 0.5) * 1400, wz = 60 - (y / 512 - 0.5) * 1400;
    const bare = Math.abs(wx) < 170 && wz > -40 && wz < 170 ? 0.15 : 0.55;
    const t = g.createRadialGradient(x, y, 0, x, y, r); t.addColorStop(0, `rgba(255,255,255,${bare})`); t.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = t; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  GM = new THREE.CanvasTexture(c); return GM;
};

// ---------- scattered vegetation ----------
type Spot = { x: number; z: number; s: number; r: number };
const scatter = (seed: string, n: number, keepOut: (x: number, z: number) => boolean, area = [-420, 420, -320, 420]) => {
  const out: Spot[] = [];
  for (let i = 0; out.length < n && i < n * 20; i++) {
    const x = area[0] + random(`${seed}x${i}`) * (area[1] - area[0]), z = area[2] + random(`${seed}z${i}`) * (area[3] - area[2]);
    if (keepOut(x, z)) continue;
    out.push({ x, z, s: random(`${seed}s${i}`), r: random(`${seed}r${i}`) * Math.PI * 2 });
  }
  return out;
};
const field = (x: number, z: number) => Math.abs(x) < 185 && z > -55 && z < 200;
const town = (x: number, z: number) => x < -115 && x > -200 && z > -45 && z < 45;
const camp = (x: number, z: number) => Math.abs(x) < 130 && z > 180 && z < 270;

const Scatter: React.FC<{ path: string; spots: Spot[]; height: [number, number]; shadows?: boolean }> = ({ path, spots, height, shadows = true }) => {
  const g = useGLTFAsset(path);
  const parts = useMemo(() => (g ? bakedParts(g) : []), [g]);
  const box = useMemo(() => { const b = new THREE.Box3(); parts.forEach((p) => { p.geometry.computeBoundingBox(); b.union(p.geometry.boundingBox!); }); return b; }, [parts]);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  useLayoutEffect(() => {
    if (!parts.length) return;
    const h0 = box.max.y - box.min.y || 1, m = new THREE.Object3D();
    refs.current.forEach((im) => {
      if (!im) return;
      spots.forEach((s, i) => {
        const k = (height[0] + (height[1] - height[0]) * s.s) / h0;
        m.position.set(s.x, -box.min.y * k, s.z); m.rotation.set(0, s.r, 0); m.scale.set(k, k, k); m.updateMatrix(); im.setMatrixAt(i, m.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    });
  }, [parts, spots, box, height]);
  return (
    <>
      {parts.map((p, i) => (
        <instancedMesh key={i} ref={(r) => { refs.current[i] = r; }} args={[p.geometry, p.material, spots.length]} castShadow={shadows} receiveShadow frustumCulled={false} />
      ))}
    </>
  );
};

export const Vegetation: React.FC = () => {
  const trees = useMemo(() => scatter("tr", 160, (x, z) => field(x, z) || town(x, z) || camp(x, z) || random(`tk${x}`) < 0.0), []);
  const t1 = trees.filter((_, i) => i % 4 === 0), t2 = trees.filter((_, i) => i % 4 === 1), t3 = trees.filter((_, i) => i % 4 === 2), t4 = trees.filter((_, i) => i % 4 === 3);
  const grass = useMemo(() => scatter("gr", 9000, (x, z) => (field(x, z) && random(`gb${x}${z}`) < 0.85) || town(x, z), [-300, 300, -160, 300]), []);
  const g1 = grass.filter((_, i) => i % 2 === 0), g2 = grass.filter((_, i) => i % 2 === 1);
  const rocks = useMemo(() => scatter("rk", 70, (x, z) => field(x, z) || town(x, z) || camp(x, z)), []);
  const logs = useMemo(() => scatter("lg", 40, (x, z) => field(x, z) || town(x, z)), []);
  return (
    <>
      <Scatter path="ph/models/island_tree_01/island_tree_01.gltf" spots={t1} height={[9, 15]} />
      <Scatter path="ph/models/island_tree_02/island_tree_02.gltf" spots={t2} height={[8, 13]} />
      <Scatter path="ph/models/island_tree_03/island_tree_03.gltf" spots={t3} height={[6, 10]} />
      <Scatter path="ph/models/jacaranda_tree/jacaranda_tree.gltf" spots={t4} height={[11, 17]} />
      <Scatter path="ph/models/grass_medium_01/grass_medium_01.gltf" spots={g1} height={[0.5, 1.1]} shadows={false} />
      <Scatter path="ph/models/grass_medium_02/grass_medium_02.gltf" spots={g2} height={[0.4, 0.9]} shadows={false} />
      <Scatter path="ph/models/namaqualand_boulder_04/namaqualand_boulder_04.gltf" spots={rocks} height={[0.8, 2.6]} />
      <Scatter path="ph/models/dead_tree_trunk_02/dead_tree_trunk_02.gltf" spots={logs} height={[0.6, 1.2]} />
    </>
  );
};
