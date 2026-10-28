import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { random } from "remotion";
import { C, F } from "../theme";
import { Banner, SOLDIER, horseGeo } from "./models";
import { useReal, riderParts, RealElephant, RiggedHorse, REAL } from "./real";
import { Sky, Ground, Vegetation } from "./env";
import { useAsset, preloadBattle, useTex, gltfLoad } from "./assets";

// World units: 1 = 10 m. x = east, z = south, y = up. Babur's cart line runs along z = 0,
// Ibrahim's army starts ~110 units (1.1 km) to the south. Figures are drawn about three times
// life size so they read on screen, as in a painted battle plan.

export type BParams = {
  cam: { pos: [number, number, number]; look: [number, number, number]; fov?: number };
  carts: number;          // 0..1 how much of the cart line is built
  mantelets: number;      // 0..1
  guns: number;           // 0..1
  town: number;           // 0..1
  ditch: number;          // 0..1
  baburCentre: number;    // 0..1 visibility
  wings: number;          // 0..1 visibility of the wing cavalry
  flank: number;          // 0..1 progress of the turning parties around the enemy
  lodi: number;           // 0..1 visibility of Ibrahim's army
  lodiZ: number;          // how far (units) Ibrahim's army has advanced north from its start
  crush: number;          // 0..1 compression of Ibrahim's army
  arrows: number;         // 0..1 intensity of arrow volleys
  fire: number;           // 0..1 gunfire intensity
  camp: number;           // 0..1 Ibrahim's camp of tents in the far south
  raiders: number;        // -1 off, else 0..1 progress of a small raid out and back
  scouts: number;         // -1 off, else 0..1 progress of scouts riding north
  night: number;          // 0..1
  dawn: number;           // 0..1
  t: number;              // seconds, for idle motion
  defeat?: number;        // 0..1 Ibrahim's army breaking up
};

export const DEFAULT: BParams = {
  cam: { pos: [0, 60, -120], look: [0, 0, 40] }, carts: 0, mantelets: 0, guns: 0, town: 0, ditch: 0, baburCentre: 1, wings: 1, flank: 0,
  lodi: 0, lodiZ: 0, crush: 0, arrows: 0, fire: 0, camp: 0, raiders: -1, scouts: -1, night: 0, dawn: 0, t: 0,
};

const LODI_Z0 = 115;

// ---------- army layout ----------
type Fig = { x: number; z: number; side: 0 | 1; horse: boolean; k: number };
const blockFigs = (cx: number, cz: number, cols: number, rows: number, side: 0 | 1, horse: boolean, seed: string, sp = 1.25): Fig[] => {
  const out: Fig[] = [];
  const dx = horse ? sp * 1.5 : sp, dz = horse ? sp * 2.2 : sp * 1.2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    out.push({ x: cx + (c - (cols - 1) / 2) * dx + (random(`${seed}x${r}${c}`) - 0.5) * 0.5, z: cz + (r - (rows - 1) / 2) * dz + (random(`${seed}z${r}${c}`) - 0.5) * 0.5, side, horse, k: random(`${seed}k${r}${c}`) });
  }
  return out;
};

type Block = { id: string; figs: Fig[]; cx: number; cz: number; role: string };
const buildArmies = () => {
  const babur: Block[] = [];
  // centre behind the carts, Humayun's right wing (west, -x) and the left wing (east, +x)
  [-60, -30, 0, 30, 60].forEach((x, i) => babur.push({ id: `bc${i}`, cx: x, cz: -14, role: "centre", figs: blockFigs(x, -14, 16, 5, 0, false, `bc${i}`) }));
  [-24, 24].forEach((x, i) => babur.push({ id: `br${i}`, cx: x, cz: -30, role: "centre", figs: blockFigs(x, -30, 14, 4, 0, true, `br${i}`) }));
  [-122, -108].forEach((x, i) => babur.push({ id: `rw${i}`, cx: x, cz: -10 - i * 6, role: "wing", figs: blockFigs(x, -10 - i * 6, 10, 4, 0, true, `rw${i}`) }));
  [108, 122].forEach((x, i) => babur.push({ id: `lw${i}`, cx: x, cz: -10 - i * 6, role: "wing", figs: blockFigs(x, -10 - i * 6, 10, 4, 0, true, `lw${i}`) }));
  [-140, 140].forEach((x, i) => babur.push({ id: `tl${i}`, cx: x, cz: -4, role: "flank", figs: blockFigs(x, -4, 8, 3, 0, true, `tl${i}`) }));
  const lodi: Block[] = [];
  for (let r = 0; r < 5; r++) for (let i = -6; i <= 6; i++) {
    const x = i * 22 + (r % 2) * 11, z = LODI_Z0 + 8 + r * 13, horse = r === 0 || r === 3 || (Math.abs(i) > 4);
    lodi.push({ id: `l${r}_${i}`, cx: x, cz: z, role: horse ? "horse" : "foot", figs: blockFigs(x, z, horse ? 11 : 14, horse ? 3 : 5, 1, horse, `l${r}${i}`) });
  }
  const elephants = Array.from({ length: 30 }, (_, i) => ({ x: -140 + i * 9.6 + (random(`ex${i}`) - 0.5) * 2, z: LODI_Z0 - 2 + (random(`ez${i}`) - 0.5) * 3 }));
  return { babur, lodi, elephants };
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const cl = (x: number) => Math.max(0, Math.min(1, x));

// Where each block is, given the battle state.
const placeBlock = (b: Block, p: BParams): { dx: number; dz: number; vis: number } => {
  if (b.figs[0].side === 0) {
    if (b.role === "centre") return { dx: 0, dz: 0, vis: p.baburCentre };
    if (b.role === "wing") return { dx: 0, dz: p.flank > 0 ? smooth(cl(p.flank * 1.5)) * 12 : 0, vis: p.wings };
    // turning parties: a wide quadratic sweep out and round to the enemy's rear
    const s = smooth(cl(p.flank)), side = b.cx < 0 ? -1 : 1;
    const p0 = [b.cx, -4], p1 = [side * 215, 70], p2 = [side * 60, LODI_Z0 - p.lodiZ + 80];
    const x = (1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * p1[0] + s * s * p2[0];
    const z = (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * p1[1] + s * s * p2[1];
    return { dx: x - b.cx, dz: z - b.cz, vis: p.wings };
  }
  // Ibrahim's army: advances, then compresses towards its centre
  const squeeze = p.crush;
  const cx = b.cx * (1 - 0.45 * squeeze), cz = b.cz - p.lodiZ + (b.cz - LODI_Z0) * -0.35 * squeeze;
  const brk = p.defeat ?? 0;
  return { dx: cx - b.cx + (random(`d${b.id}`) - 0.5) * 40 * brk, dz: cz - b.cz + brk * 40 * random(`dz${b.id}`), vis: p.lodi * (1 - brk * 0.6) };
};

// ---------- instanced figures ----------
const tmp = new THREE.Object3D();
const HORSE = (() => { let h: ReturnType<typeof horseGeo> | null = null; return () => (h ??= horseGeo()); })();
const TUNIC = [["#2f7d5b", "#1f5e44", "#3f8f6a", "#e9e1cc", "#2a6f6a"], ["#b23a25", "#8a2a1b", "#c4552f", "#e9e1cc", "#9a3a3a"]];
const HAT = [["#8e98a6", "#e9e1cc", "#6f7a88", "#d8c08a"], ["#e9e1cc", "#c9a24a", "#e9e1cc", "#7a1d14"]];
const COAT = ["#4a2e1a", "#6b4426", "#2c2019", "#8a6a48", "#a08262"];

const Figures: React.FC<{ p: BParams }> = ({ p }) => {
  const { babur, lodi, elephants } = useMemo(buildArmies, []);
  const all = useMemo(() => [...babur, ...lodi], [babur, lodi]);
  const n = all.reduce((s, b) => s + b.figs.length, 0);
  const S = SOLDIER(), H = HORSE();
  const man = useReal("soldier")!, horseReal = useReal("horseRig")!, ele = useReal("elephant")!;
  const rider = useMemo(() => riderParts(man, 0.5), [man]);
  const eleBack = useMemo(() => { const b = new THREE.Box3(); ele.forEach((p) => b.union(p.geometry.boundingBox ?? new THREE.Box3())); return b.max.y * 0.94; }, [ele]);
  const refs = {
    helmet: useRef<THREE.InstancedMesh>(null!), shield: useRef<THREE.InstancedMesh>(null!), spear: useRef<THREE.InstancedMesh>(null!),
    bow: useRef<THREE.InstancedMesh>(null!), shadow: useRef<THREE.InstancedMesh>(null!), cloth: useRef<THREE.InstancedMesh>(null!),
    coat: useRef<THREE.InstancedMesh>(null!),
  };
  const eleG = useRef<THREE.Group>(null!);
  const manRefs = useRef<(THREE.InstancedMesh | null)[]>([]), riderRefs = useRef<(THREE.InstancedMesh | null)[]>([]), horseRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const horseCount = all.reduce((s, b) => s + b.figs.filter((f) => f.horse).length, 0);
  const colors = useMemo(() => {
    const tint = new Float32Array(n * 3), rtint = new Float32Array(horseCount * 3), hat = new Float32Array(n * 3), coat = new Float32Array(horseCount * 3), cloth = new Float32Array(horseCount * 3);
    let i = 0, h = 0; const c = new THREE.Color();
    for (const b of all) for (const f of b.figs) {
      // a light wash keeps the two armies readable without repainting the photographed clothes
      c.set(f.side ? "#ffe3d2" : "#d7e8dc").offsetHSL(0, 0, (random(`l${i}`) - 0.5) * 0.12); tint.set([c.r, c.g, c.b], i * 3);
      c.set(HAT[f.side][Math.floor(random(`h${i}`) * 4)]); hat.set([c.r, c.g, c.b], i * 3);
      if (f.horse) {
        rtint.set(tint.slice(i * 3, i * 3 + 3), h * 3);
        c.set(["#ffffff", "#c8b6a2", "#8a7a6a", "#ffe8d0", "#a89888"][Math.floor(random(`c${i}`) * 5)]); coat.set([c.r, c.g, c.b], h * 3);
        c.set(f.side ? (f.k < 0.5 ? C.vermilion : C.gold) : (f.k < 0.5 ? C.malachite : "#e9e1cc")); cloth.set([c.r, c.g, c.b], h * 3); h++;
      }
      i++;
    }
    const coatC = new Float32Array(n * 3); let j = 0;
    for (const b of all) for (const f of b.figs) { c.set(TUNIC[f.side][Math.floor(f.k * 5) % 5]).offsetHSL(0, 0, (random(`cc${j}`) - 0.5) * 0.08); coatC.set([c.r, c.g, c.b], j * 3); j++; }
    return { tint, rtint, hat, coat, cloth, coatC };
  }, [all, n, horseCount]);
  useLayoutEffect(() => {
    manRefs.current.forEach((r) => { if (r) r.instanceColor = new THREE.InstancedBufferAttribute(colors.tint, 3); });
    riderRefs.current.forEach((r) => { if (r) r.instanceColor = new THREE.InstancedBufferAttribute(colors.rtint, 3); });
    horseRefs.current.forEach((r) => { if (r) r.instanceColor = new THREE.InstancedBufferAttribute(colors.coat, 3); });
    refs.helmet.current.instanceColor = new THREE.InstancedBufferAttribute(colors.hat, 3);
    refs.cloth.current.instanceColor = new THREE.InstancedBufferAttribute(colors.cloth, 3);
    refs.coat.current.instanceColor = new THREE.InstancedBufferAttribute(colors.coatC, 3);
  }, [colors]);
  useLayoutEffect(() => {
    let i = 0, hi = 0;
    const put = (r: THREE.InstancedMesh | null, idx: number, on: boolean) => {
      if (!r) return;
      if (!on) { const s0 = tmp.scale.clone(); tmp.scale.set(0, 0, 0); tmp.updateMatrix(); r.setMatrixAt(idx, tmp.matrix); tmp.scale.copy(s0); tmp.updateMatrix(); }
      else r.setMatrixAt(idx, tmp.matrix);
    };
    const set = (r: React.MutableRefObject<THREE.InstancedMesh>, idx: number, on: boolean) => put(r.current, idx, on);
    for (const b of all) {
      const { dx, dz, vis } = placeBlock(b, p);
      const moving = (b.role === "flank" && p.flank > 0 && p.flank < 1) || (b.figs[0].side === 1 && p.defeat && p.defeat > 0);
      for (const f of b.figs) {
        const on = vis > 0.01;
        const gait = moving ? Math.abs(Math.sin(p.t * 9 + f.k * 30)) * 0.16 : Math.sin(p.t * 2 + f.k * 30) * 0.015;
        const x = f.x + dx, z = f.z + dz, yaw = (f.side === 1 ? Math.PI : 0) + (f.k - 0.5) * 0.3;
        // base: where a standing man's feet would be (a rider's are hidden in the horse's flank)
        const base = f.horse ? 0.4 + gait : gait * 0.3;
        tmp.rotation.set(0, yaw, 0); tmp.scale.set(1, 1, 1);
        tmp.position.set(x, 0, z); tmp.updateMatrix(); manRefs.current.forEach((r) => put(r, i, on && !f.horse));
        tmp.position.set(x, base - 0.15, z); tmp.scale.set(1.05, 1.05, 1.05); tmp.updateMatrix();
        set(refs.helmet, i, on && f.side === 0 && f.k < 0.6);
        // long coats: all of Babur's men, about half of Ibrahim's (the rest bare-chested infantry)
        tmp.position.set(x, base - 0.05, z); tmp.scale.set(0.98, 0.96, 1.02); tmp.updateMatrix();
        set(refs.coat, i, on && (f.side === 0 || f.k < 0.5));
        tmp.scale.set(1, 1, 1); tmp.position.set(x, base - 0.1, z); tmp.updateMatrix();
        set(refs.shield, i, on && !f.horse && f.side === 1 && f.k < 0.7);
        set(refs.spear, i, on && (f.side === 1 ? !f.horse || f.k < 0.4 : !f.horse && f.k < 0.3));
        set(refs.bow, i, on && f.horse && f.side === 0);
        tmp.position.set(x + 0.4, 0.02, z + 0.4); tmp.rotation.set(-Math.PI / 2, 0, 0); tmp.scale.set(f.horse ? 1.0 : 0.6, f.horse ? 1.9 : 0.6, 1); tmp.updateMatrix(); set(refs.shadow, i, on);
        if (f.horse) {
          tmp.rotation.set(Math.sin(p.t * 9 + f.k * 30) * (moving ? 0.05 : 0), yaw, 0); tmp.scale.set(1, 1, 1); tmp.position.set(x, gait * 0.5, z); tmp.updateMatrix();
          horseRefs.current.forEach((r) => put(r, hi, on));
          tmp.scale.set(0.72, 0.72, 0.72); tmp.updateMatrix(); set(refs.cloth, hi, on);
          tmp.scale.set(1, 1, 1); tmp.position.set(x, 0.9 + gait, z); tmp.updateMatrix(); riderRefs.current.forEach((r) => put(r, hi, on));
          hi++;
        }
        i++;
      }
    }
    for (const r of Object.values(refs)) r.current.instanceMatrix.needsUpdate = true;
    for (const r of [...manRefs.current, ...riderRefs.current, ...horseRefs.current]) if (r) r.instanceMatrix.needsUpdate = true;
    eleG.current.children.forEach((c, k) => {
      const e = elephants[k];
      c.visible = p.lodi > 0.01;
      const brk = p.defeat ?? 0;
      c.position.set(e.x * (1 - 0.35 * p.crush) + (random(`eb${k}`) - 0.5) * 30 * brk, 0, e.z - p.lodiZ + brk * 20 * random(`ebz${k}`));
      c.rotation.y = Math.PI + (brk > 0 ? (random(`er${k}`) - 0.5) * 2 * brk : 0) + Math.sin(p.t * 0.7 + k) * 0.05;
    });
  }, [p, all, elephants]);
  const mat = (props: Record<string, unknown> = {}) => <meshStandardMaterial roughness={0.8} {...props} />;
  return (
    <>
      <instancedMesh ref={refs.shadow} args={[undefined, undefined, n]}><circleGeometry args={[0.45, 12]} /><meshBasicMaterial color="#000" transparent opacity={0.25} depthWrite={false} /></instancedMesh>
      {man.map((pt, k) => <instancedMesh key={`m${k}`} ref={(r) => { manRefs.current[k] = r; }} args={[pt.geometry, pt.material, n]} castShadow frustumCulled={false} />)}
      {rider.map((pt, k) => <instancedMesh key={`r${k}`} ref={(r) => { riderRefs.current[k] = r; }} args={[pt.geometry, pt.material, horseCount]} castShadow frustumCulled={false} />)}
      {horseReal.map((pt, k) => <instancedMesh key={`h${k}`} ref={(r) => { horseRefs.current[k] = r; }} args={[pt.geometry, pt.material, horseCount]} castShadow frustumCulled={false} />)}
      <instancedMesh ref={refs.coat} args={[S.body, undefined, n]} castShadow frustumCulled={false}>{mat({ roughness: 0.85 })}</instancedMesh>
      <instancedMesh ref={refs.helmet} args={[S.helmet, undefined, n]} frustumCulled={false}>{mat({ metalness: 0.7, roughness: 0.35 })}</instancedMesh>
      <instancedMesh ref={refs.shield} args={[S.shield, undefined, n]} frustumCulled={false}>{mat({ color: "#6a4024", metalness: 0.3, roughness: 0.55 })}</instancedMesh>
      <instancedMesh ref={refs.spear} args={[S.spear, undefined, n]} frustumCulled={false}>{mat({ color: "#a8977a", metalness: 0.3 })}</instancedMesh>
      <instancedMesh ref={refs.bow} args={[S.bow, undefined, n]} frustumCulled={false}>{mat({ color: "#3a2412" })}</instancedMesh>
      <instancedMesh ref={refs.cloth} args={[H.cloth, undefined, horseCount]} frustumCulled={false}>{mat({ side: THREE.DoubleSide, roughness: 0.75 })}</instancedMesh>
      <group ref={eleG}>{elephants.map((_, k) => <group key={k}><RealElephant parts={ele} back={eleBack} /></group>)}</group>
      <Banners p={p} all={all} />
    </>
  );
};

// One standard per block, at its front corner.
const Banners: React.FC<{ p: BParams; all: Block[] }> = ({ p, all }) => (
  <>
    {all.filter((_, k) => k % 2 === 0).map((b) => {
      const { dx, dz, vis } = placeBlock(b, p);
      if (vis <= 0.01) return null;
      const side = b.figs[0].side, front = side ? -1 : 1;
      const zs = b.figs.map((f) => f.z), z = (front > 0 ? Math.max(...zs) : Math.min(...zs)) + dz + front * 1.5;
      return <group key={b.id} position={[b.cx + dx, 0, z]} rotation={[0, side ? Math.PI : 0, 0]}><Banner color={side ? (b.cx > 0 ? C.gold : C.vermilion) : (b.cx > 0 ? "#e9e1cc" : C.malachite)} t={p.t + b.cx * 0.1} /></group>;
    })}
  </>
);

// Dust thrown up by moving horsemen and by the advancing host.
const dustTex = (() => { let t: THREE.Texture | null = null; return () => {
  if (t) return t;
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 2, 32, 32, 32); r.addColorStop(0, "rgba(214,190,140,0.9)"); r.addColorStop(1, "rgba(214,190,140,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); t = new THREE.CanvasTexture(c); return t;
}; })();
const Dust: React.FC<{ p: BParams }> = ({ p }) => {
  const { babur, lodi } = useMemo(buildArmies, []);
  const N = 700;
  const geo = useMemo(() => new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)), []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  let k = 0;
  const emit = (b: Block, amount: number) => {
    const { dx, dz } = placeBlock(b, p);
    for (let j = 0; j < amount && k < N; j++, k++) {
      const ph = (p.t * 0.35 + random(`dp${b.id}${j}`)) % 1;
      pos.setXYZ(k, b.cx + dx + (random(`dx${b.id}${j}`) - 0.5) * 16, 0.5 + ph * 4, b.cz + dz + (random(`dz${b.id}${j}`) - 0.5) * 10 + ph * 3);
    }
  };
  if (p.flank > 0 && p.flank < 1) babur.filter((b) => b.role === "flank" || b.role === "wing").forEach((b) => emit(b, 40));
  if (p.lodi > 0.01 && (p.lodiZ > 0 || (p.defeat ?? 0) > 0)) lodi.filter((_, i) => i % 3 === 0).forEach((b) => emit(b, 14));
  for (let j = k; j < N; j++) pos.setXYZ(j, 0, -999, 0);
  pos.needsUpdate = true;
  return <points geometry={geo}><pointsMaterial map={dustTex()} size={9} sizeAttenuation transparent opacity={0.35 * (1 - 0.6 * p.night)} depthWrite={false} /></points>;
};

// ---------- the prepared position ----------
const CART_X = Array.from({ length: 48 }, (_, i) => -96 + i * 4.1);
const Carts: React.FC<{ p: BParams }> = ({ p }) => {
  const wood = useTex("ph/tex/wood_diff.jpg", 1, true), wn = useTex("ph/tex/wood_nor.jpg", 1);
  const wm = useMemo(() => new THREE.MeshStandardMaterial({ map: wood, normalMap: wn, color: "#c9a27a", roughness: 0.9 }), [wood, wn]);
  const wd = useMemo(() => new THREE.MeshStandardMaterial({ map: wood, normalMap: wn, color: "#8a6a4a", roughness: 0.95 }), [wood, wn]);
  const n = Math.floor(CART_X.length * p.carts);
  return (
    <group>
      {CART_X.map((x, i) => {
        const a = cl(p.carts * CART_X.length - i);
        if (i >= n + 1 || a <= 0) return null;
        const drop = (1 - smooth(a)) * 6;
        return (
          <group key={i} position={[x, drop, 0]}>
            <mesh position={[0, 0.9, 0]} castShadow receiveShadow material={wm}><boxGeometry args={[3.0, 0.55, 1.3]} /></mesh>
            <mesh position={[0, 1.35, 0.55]} castShadow material={wd}><boxGeometry args={[3.0, 0.5, 0.12]} /></mesh>
            {[-1, 1].map((s) => <mesh key={s} position={[s * 0.95, 0.55, 0.7]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.45, 0.09, 5, 10]} /><meshStandardMaterial color="#3a2412" /></mesh>)}
            {i > 0 && <mesh position={[-2.05, 1.05, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 1.1, 4]} /><meshStandardMaterial color="#d2b07a" /></mesh>}
            {p.mantelets > i / CART_X.length && i > 0 && (
              <group position={[-2.05, 0, 1.0]}>
                {[-0.32, 0.32].map((dx) => <mesh key={dx} position={[dx, 0.75, 0]}><boxGeometry args={[0.5, 1.5, 0.12]} /><primitive object={wm} attach="material" /></mesh>)}
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

const Guns: React.FC<{ p: BParams }> = ({ p }) => {
  const wood = useTex("ph/tex/wood_diff.jpg", 1, true);
  if (p.guns <= 0) return null;
  const xs = [-40, -26, -12, 4, 18, 32, 46];
  return (
    <group>
      {xs.map((x, i) => {
        const flash = p.fire > 0 ? Math.max(0, 1 - (((p.t * 0.8 + i * 0.37) % 2.4) / 0.25)) * p.fire : 0;
        const age = ((p.t * 0.8 + i * 0.37) % 2.4) / 2.4;
        return (
          <group key={i} position={[x, 0, -4]} scale={cl(p.guns * 1.5)}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[1.1, 0.4, 2.2]} /><meshStandardMaterial map={wood} color="#9a7a5a" roughness={0.9} /></mesh>
            <mesh position={[0, 0.85, 0.7]} rotation={[Math.PI / 2 - 0.06, 0, 0]} castShadow><cylinderGeometry args={[0.2, 0.3, 2.6, 16]} /><meshStandardMaterial color="#7a5a32" metalness={0.85} roughness={0.38} /></mesh>
            {[0.2, 1.2].map((zz) => <mesh key={zz} position={[0, 0.85, zz]} rotation={[Math.PI / 2 - 0.06, 0, 0]}><torusGeometry args={[0.29 - zz * 0.04, 0.05, 8, 18]} /><meshStandardMaterial color="#6a4a28" metalness={0.85} roughness={0.4} /></mesh>)}
            {[-0.65, 0.65].map((sx) => <mesh key={sx} position={[sx, 0.42, -0.4]} rotation={[0, Math.PI / 2, 0]} castShadow><cylinderGeometry args={[0.42, 0.42, 0.12, 18]} /><meshStandardMaterial map={wood} color="#6a4a30" roughness={0.95} /></mesh>)}
            {flash > 0 && <mesh position={[0, 1.0, 2.6]}><sphereGeometry args={[0.6 + flash, 8, 6]} /><meshBasicMaterial color="#ffd27a" transparent opacity={flash} /></mesh>}
            {p.fire > 0 && <mesh position={[0, 1.6 + age * 4, 3.5 + age * 6]} scale={1 + age * 5}><sphereGeometry args={[0.8, 7, 5]} /><meshStandardMaterial color="#e9e4da" transparent opacity={(1 - age) * 0.45 * p.fire} depthWrite={false} /></mesh>}
          </group>
        );
      })}
    </group>
  );
};

const Town: React.FC<{ p: BParams }> = ({ p }) => {
  const houses = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ x: -128 - random(`hx${i}`) * 55, z: -30 + random(`hz${i}`) * 60, w: 3 + random(`hw${i}`) * 4, d: 3 + random(`hd${i}`) * 4, h: 2 + random(`hh${i}`) * 3, k: random(`hk${i}`) })), []);
  if (p.town <= 0) return null;
  return (
    <group>
      {houses.map((h, i) => (
        <mesh key={i} position={[h.x, (h.h / 2) * smooth(cl(p.town * 1.4 - i / 140)), h.z]} scale={[1, smooth(cl(p.town * 1.4 - i / 140)), 1]} castShadow>
          <boxGeometry args={[h.w, h.h, h.d]} /><meshStandardMaterial color={h.k < 0.5 ? "#b88a5a" : "#a37547"} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

const Ditch: React.FC<{ p: BParams }> = ({ p }) => {
  const pts = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ x: 102 + i * 1.6 + Math.sin(i * 0.4) * 2, z: -2 + i * 1.3 })), []);
  const branches = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ k: i, rx: random(`brx${i}`), rz: random(`brz${i}`), ry: random(`bry${i}`) })), []);
  if (p.ditch <= 0) return null;
  const n = Math.floor(pts.length * p.ditch);
  return (
    <group>
      {pts.slice(0, n).map((q, i) => <mesh key={i} position={[q.x, 0.04, q.z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.6, 2.2]} /><meshStandardMaterial color="#1b130b" /></mesh>)}
      {branches.slice(0, Math.floor(60 * p.ditch)).map((b) => {
        const q = pts[Math.floor(b.k / 60 * pts.length)];
        return <mesh key={b.k} position={[q.x - 2.5 + b.rx * 2, 0.4, q.z - 1 + b.rz * 2]} rotation={[b.rx, b.ry * 6, 0.9]}><cylinderGeometry args={[0.07, 0.12, 2.6, 4]} /><meshStandardMaterial color="#4b3b22" /></mesh>;
      })}
    </group>
  );
};

const Camp: React.FC<{ p: BParams }> = ({ p }) => {
  const tents = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ x: -110 + random(`tx${i}`) * 220, z: 190 + random(`tz${i}`) * 70, s: 1.5 + random(`ts${i}`) * 2, k: random(`tk${i}`) })), []);
  if (p.camp <= 0) return null;
  return (
    <group>
      {tents.map((t, i) => <mesh key={i} position={[t.x, t.s * 0.9, t.z]} castShadow><coneGeometry args={[t.s, t.s * 1.8, 6]} /><meshStandardMaterial color={t.k < 0.2 ? C.vermilion : "#d9cdb0"} flatShading /></mesh>)}
      <mesh position={[0, 4, 230]}><coneGeometry args={[6, 7, 8]} /><meshStandardMaterial color={C.vermilion} flatShading /></mesh>
    </group>
  );
};

// Small groups of riders: raiders galloping out to the enemy and back, or scouts riding in.
const Riders: React.FC<{ p: BParams }> = ({ p }) => {
  const groups = [-60, -10, 45];
  const out: React.JSX.Element[] = [];
  if (p.raiders >= 0) {
    const s = p.raiders, there = s < 0.5 ? smooth(s * 2) : smooth((1 - s) * 2);
    groups.forEach((gx, g) => {
      for (let k = 0; k < 6; k++) {
        const x = gx + (k % 3) * 1.6, z = -6 + there * 175 + Math.floor(k / 3) * 2;
        out.push(<group key={`r${g}${k}`} position={[x, 0, z]} rotation={[0, s < 0.5 ? 0 : Math.PI, 0]}><RiderMesh t={p.t + k} /></group>);
      }
    });
  }
  if (p.scouts >= 0) {
    for (let k = 0; k < 5; k++) {
      const z = 110 - smooth(p.scouts) * 116 + k * 2.5, x = -6 + k * 2.4;
      out.push(<group key={`s${k}`} position={[x, 0, z]} rotation={[0, Math.PI, 0]}><RiderMesh t={p.t + k} /></group>);
    }
  }
  return <>{out}</>;
};
const RiderMesh: React.FC<{ t: number }> = ({ t }) => {
  const rig = useAsset(REAL.horseRig, () => gltfLoad(REAL.horseRig)), man = useReal("soldier"), S = SOLDIER();
  const rider = useMemo(() => (man ? riderParts(man, 0.5) : []), [man]);
  if (!rig) return null;
  return (
    <group>
      <RiggedHorse g={rig} t={t} speed={1} />
      <group position={[0, 0.9, 0]}>
        {rider.map((pt, k) => <mesh key={k} geometry={pt.geometry} material={pt.material} castShadow />)}
        <mesh geometry={S.body} position={[0, -0.55, 0]} scale={[0.98, 0.96, 1.02]} castShadow><meshStandardMaterial color={C.malachite} roughness={0.85} /></mesh>
        <mesh geometry={S.helmet} position={[0, -0.65, 0]} scale={1.05}><meshStandardMaterial color="#8e98a6" metalness={0.7} roughness={0.35} /></mesh>
        <mesh geometry={S.bow} position={[0, -0.6, 0]}><meshStandardMaterial color="#3a2412" /></mesh>
      </group>
    </group>
  );
};

// Arrow volleys: short dark streaks on arcs from the turning parties into Ibrahim's rear.
const Arrows: React.FC<{ p: BParams }> = ({ p }) => {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const N = 900;
  useLayoutEffect(() => {
    for (let i = 0; i < N; i++) {
      const show = p.arrows > 0 && i < N * p.arrows;
      const ph = ((p.t * 0.9 + random(`ap${i}`)) % 1);
      const fromLeft = i % 2 === 0, sx = (fromLeft ? -1 : 1) * (95 + random(`ax${i}`) * 50), sz = LODI_Z0 - p.lodiZ + 60 + random(`az${i}`) * 30;
      const tx = (random(`atx${i}`) - 0.5) * 140 * (1 - 0.4 * p.crush), tz = LODI_Z0 - p.lodiZ + random(`atz${i}`) * 60;
      const x = sx + (tx - sx) * ph, z = sz + (tz - sz) * ph, y = 1.5 + Math.sin(ph * Math.PI) * 18;
      const dy = Math.cos(ph * Math.PI) * 18 * Math.PI, dx = tx - sx, dz = tz - sz;
      tmp.position.set(x, y, z);
      tmp.lookAt(x + dx, y + dy, z + dz); tmp.rotateX(Math.PI / 2);
      const s = show ? 1 : 0; tmp.scale.set(s, s, s); tmp.updateMatrix(); ref.current.setMatrixAt(i, tmp.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [p]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]}>
      <cylinderGeometry args={[0.04, 0.04, 1.6, 3]} />
      <meshBasicMaterial color="#1a1208" />
    </instancedMesh>
  );
};

// ---------- ground, light, camera ----------
const groundTexture = () => {
  const c = document.createElement("canvas"); c.width = 4096; c.height = 4096;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(2048, 1800, 200, 2048, 2048, 2900);
  grd.addColorStop(0, "#6e6a45"); grd.addColorStop(0.5, "#5a5c3c"); grd.addColorStop(1, "#343a2c");
  g.fillStyle = grd; g.fillRect(0, 0, 4096, 4096);
  // painterly strokes: dry grass, bare earth and darker scrub
  const pal = ["rgba(140,124,78,", "rgba(96,98,58,", "rgba(52,60,38,", "rgba(160,138,92,", "rgba(74,82,50,"];
  for (let i = 0; i < 26000; i++) {
    const x = random(`gx${i}`) * 4096, y = random(`gy${i}`) * 4096, r = 3 + random(`gr${i}`) * 26;
    g.fillStyle = pal[Math.floor(random(`gc${i}`) * 5)] + (0.05 + random(`ga${i}`) * 0.12) + ")";
    g.beginPath(); g.ellipse(x, y, r * 2.2, r * 0.7, random(`go${i}`) * 0.6 - 0.3, 0, 7); g.fill();
  }
  // trampled earth around the field of battle
  for (let i = 0; i < 40; i++) {
    const x = 1400 + random(`tx${i}`) * 1300, y = 1500 + random(`ty${i}`) * 1200, r = 80 + random(`tr${i}`) * 220;
    const t = g.createRadialGradient(x, y, 0, x, y, r); t.addColorStop(0, "rgba(150,128,88,0.22)"); t.addColorStop(1, "rgba(150,128,88,0)");
    g.fillStyle = t; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // a very faint gold survey grid, as on a painted battle plan
  g.strokeStyle = "rgba(201,162,74,0.05)"; g.lineWidth = 3;
  for (let i = 0; i <= 4096; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 4096); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(4096, i); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 16; t.colorSpace = THREE.SRGBColorSpace; return t;
};

// Scattered scrub and a few trees, kept clear of the armies' ground.
const Scrub: React.FC = () => {
  const bush = useRef<THREE.InstancedMesh>(null!), trunk = useRef<THREE.InstancedMesh>(null!), crown = useRef<THREE.InstancedMesh>(null!);
  const items = useMemo(() => {
    const out: { x: number; z: number; s: number; tree: boolean }[] = [];
    for (let i = 0; out.length < 520 && i < 4000; i++) {
      const x = (random(`sx${i}`) - 0.5) * 820, z = -300 + random(`sz${i}`) * 700;
      if (Math.abs(x) < 175 && z > -45 && z < 175) continue;           // the battlefield itself
      if (x < -120 && x > -190 && z > -40 && z < 40) continue;         // the town
      out.push({ x, z, s: 0.6 + random(`ss${i}`) * 1.4, tree: random(`st${i}`) < 0.18 });
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    let b = 0, t = 0;
    for (const it of items) {
      if (it.tree) {
        tmp.rotation.set(0, 0, 0); tmp.scale.set(it.s, it.s, it.s); tmp.position.set(it.x, 2.2 * it.s, it.z); tmp.updateMatrix(); trunk.current.setMatrixAt(t, tmp.matrix);
        tmp.scale.set(it.s * 2.6, it.s * 1.8, it.s * 2.6); tmp.position.set(it.x, 5.2 * it.s, it.z); tmp.updateMatrix(); crown.current.setMatrixAt(t, tmp.matrix); t++;
      } else { tmp.scale.set(it.s * 1.6, it.s * 0.8, it.s * 1.4); tmp.position.set(it.x, 0.5 * it.s, it.z); tmp.updateMatrix(); bush.current.setMatrixAt(b, tmp.matrix); b++; }
    }
    bush.current.count = b; trunk.current.count = t; crown.current.count = t;
    for (const r of [bush, trunk, crown]) r.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <>
      <instancedMesh ref={bush} args={[undefined, undefined, items.length]} castShadow><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#3f4a2c" roughness={1} /></instancedMesh>
      <instancedMesh ref={trunk} args={[undefined, undefined, items.length]}><cylinderGeometry args={[0.25, 0.4, 4.4, 6]} /><meshStandardMaterial color="#4a3826" roughness={1} /></instancedMesh>
      <instancedMesh ref={crown} args={[undefined, undefined, items.length]} castShadow><icosahedronGeometry args={[1.2, 1]} /><meshStandardMaterial color="#38452a" roughness={1} /></instancedMesh>
    </>
  );
};

const Rig: React.FC<{ p: BParams }> = ({ p }) => {
  const { camera, scene } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = p.cam.fov ?? 38; cam.near = 1; cam.far = 4000;
    cam.position.set(...p.cam.pos); cam.lookAt(...p.cam.look); cam.updateProjectionMatrix();
  }, [p, camera, scene]);
  return null;
};

export const Battle3D: React.FC<{ p: BParams; width: number; height: number }> = ({ p, width, height }) => {
  const ready = useAsset("battle-assets", preloadBattle);
  if (!ready) return null;
  const sun = new THREE.Color("#ffe1a8").lerp(new THREE.Color("#ffb27a"), p.dawn).lerp(new THREE.Color("#6f86c9"), p.night);
  const sunI = 2.6 * (1 - 0.8 * p.night);
  return (
    <ThreeCanvas width={width} height={height} shadows="soft" gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 38, position: p.cam.pos }}>
      <Rig p={p} />
      <Sky night={p.night} dawn={p.dawn} />
      <directionalLight position={[-160, 120 - 70 * p.dawn, -60 + 140 * p.dawn]} intensity={sunI} color={sun} castShadow
        shadow-mapSize-width={4096} shadow-mapSize-height={4096} shadow-bias={-0.0004} shadow-normalBias={0.04} shadow-camera-left={-220} shadow-camera-right={220} shadow-camera-top={220} shadow-camera-bottom={-220} shadow-camera-far={700} />
      <Ground />
      <Vegetation />
      <Town p={p} />
      <Ditch p={p} />
      <Carts p={p} />
      <Guns p={p} />
      <Camp p={p} />
      <Figures p={p} />
      <Riders p={p} />
      <Dust p={p} />
      <Arrows p={p} />
    </ThreeCanvas>
  );
};

// Project a world point to screen pixels with the same camera, for 2D labels.
export const project = (p: BParams, world: [number, number, number], width = 1920, height = 1080) => {
  const cam = new THREE.PerspectiveCamera(p.cam.fov ?? 38, width / height, 1, 4000);
  cam.position.set(...p.cam.pos); cam.lookAt(...p.cam.look); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...world).project(cam);
  return { x: (v.x + 1) / 2 * width, y: (1 - v.y) / 2 * height, behind: v.z > 1 };
};

export const Tag3D: React.FC<{ p: BParams; at: [number, number, number]; title: string; sub?: string; color?: string; opacity?: number }> = ({ p, at, title, sub, color = C.gold, opacity = 1 }) => {
  const s = project(p, at);
  if (opacity <= 0 || s.behind) return null;
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y, translate: "-50% -100%", textAlign: "center", opacity, whiteSpace: "nowrap", pointerEvents: "none" }}>
      <div style={{ fontFamily: F.display, fontSize: 40, color: C.ivory, textShadow: "0 2px 14px rgba(0,0,0,0.95), 0 0 3px #000" }}>{title}</div>
      {sub && <div style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 27, color: C.ivoryDim, textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>{sub}</div>}
      <div style={{ width: 2, height: 44, margin: "6px auto 0", background: `linear-gradient(${color}, rgba(0,0,0,0))` }} />
    </div>
  );
};
