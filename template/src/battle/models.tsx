// Detailed low-poly models for the Panipat battle: smooth-shaded, built from merged geometry
// so armies can still be drawn as a few instanced meshes. 1 unit = 1 figure-metre at 3x scale.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { C } from "../theme";

const place = (g: THREE.BufferGeometry, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0], scl: [number, number, number] = [1, 1, 1]) => {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...scl));
  const out = (g.index ? g.toNonIndexed() : g.clone()); out.applyMatrix4(m);
  for (const k of Object.keys(out.attributes)) if (!["position", "normal"].includes(k)) out.deleteAttribute(k);
  return out;
};
const merge = (parts: THREE.BufferGeometry[]) => { const g = mergeGeometries(parts.map((p) => (p.index || p.attributes.uv ? place(p, [0, 0, 0]) : p)), false)!; g.computeBoundingSphere(); return g; };
const tube = (pts: [number, number, number][], r0: number, r1: number, seg = 16, rad = 8) => {
  // a tube whose radius tapers from r0 to r1 along a smooth curve
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, seg, 1, rad, false);
  const pos = g.attributes.position, frames = curve.computeFrenetFrames(seg, false);
  for (let i = 0; i <= seg; i++) {
    const c = curve.getPointAt(i / seg), r = r0 + (r1 - r0) * (i / seg);
    for (let j = 0; j <= rad; j++) {
      const k = i * (rad + 1) + j, v = new THREE.Vector3().fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  void frames; g.computeVertexNormals(); return g;
};
const lathe = (prof: [number, number][], seg = 14) => new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), seg);

// ---------- foot soldier (faces +z) ----------
export const soldierGeo = () => ({
  // knee-length flared tunic, belt and shoulders
  body: merge([
    place(lathe([[0.001, 0.02], [0.42, 0.05], [0.36, 0.45], [0.27, 0.72], [0.3, 1.05], [0.2, 1.18], [0.001, 1.2]]), [0, 0.35, 0]),
    place(new THREE.CapsuleGeometry(0.085, 0.5, 3, 6), [-0.33, 1.1, 0.06], [0.25, 0, 0.12]),
    place(new THREE.CapsuleGeometry(0.085, 0.5, 3, 6), [0.33, 1.1, 0.08], [-0.35, 0, -0.12]),
  ]),
  legs: merge([place(new THREE.CylinderGeometry(0.08, 0.07, 0.4, 6), [-0.12, 0.2, 0]), place(new THREE.CylinderGeometry(0.08, 0.07, 0.4, 6), [0.12, 0.2, 0])]),
  head: merge([place(new THREE.SphereGeometry(0.17, 12, 10), [0, 1.72, 0]), place(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 8), [0, 1.56, 0])]),
  turban: merge([place(new THREE.TorusGeometry(0.15, 0.075, 8, 14), [0, 1.82, 0], [Math.PI / 2, 0, 0]), place(new THREE.SphereGeometry(0.15, 10, 8), [0, 1.88, 0], [0, 0, 0], [1, 0.75, 1])]),
  helmet: merge([place(lathe([[0.19, 0], [0.18, 0.1], [0.12, 0.2], [0.03, 0.3], [0.01, 0.42]], 12), [0, 1.74, 0]), place(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), [0, 1.74, 0])]),
  shield: merge([place(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 16), [-0.42, 1.05, 0.22], [Math.PI / 2, 0, 0.1]), place(new THREE.SphereGeometry(0.08, 8, 6), [-0.42, 1.05, 0.26])]),
  spear: merge([place(new THREE.CylinderGeometry(0.025, 0.025, 3.0, 5), [0.36, 1.55, 0.1]), place(new THREE.ConeGeometry(0.06, 0.28, 5), [0.36, 3.15, 0.1])]),
  bow: place(tube([[0, -0.55, 0], [0, -0.2, 0.18], [0, 0.2, 0.18], [0, 0.55, 0]], 0.03, 0.03, 10, 5), [-0.34, 1.2, 0.25]),
});

// ---------- horse (faces +z) ----------
export const horseGeo = () => {
  const legs: THREE.BufferGeometry[] = [];
  for (const [x, z, a] of [[-0.22, 0.62, 0.1], [0.22, 0.62, -0.06], [-0.22, -0.66, -0.08], [0.22, -0.66, 0.1]] as const) {
    legs.push(place(new THREE.CylinderGeometry(0.12, 0.06, 1.12, 7), [x, 0.6, z + a * 0.3], [a, 0, 0]));
    legs.push(place(new THREE.CylinderGeometry(0.075, 0.09, 0.1, 7), [x, 0.05, z + a * 0.6]));
  }
  return {
    body: merge([
      place(new THREE.CapsuleGeometry(0.42, 1.25, 6, 12), [0, 1.42, 0], [Math.PI / 2, 0, 0], [0.92, 1, 1]),
      place(new THREE.CapsuleGeometry(0.22, 0.62, 4, 10), [0, 2.0, 0.98], [0.64, 0, 0]),
      place(new THREE.CapsuleGeometry(0.15, 0.42, 4, 10), [0, 2.12, 1.4], [2.29, 0, 0]),
      place(new THREE.ConeGeometry(0.055, 0.18, 5), [-0.08, 2.46, 1.2]), place(new THREE.ConeGeometry(0.055, 0.18, 5), [0.08, 2.46, 1.2]),
      ...legs,
    ]),
    hair: merge([
      place(new THREE.BoxGeometry(0.07, 0.2, 0.8), [0, 2.12, 0.86], [0.64, 0, 0]),
      place(tube([[0, 1.55, -0.95], [0, 1.25, -1.15], [0, 0.85, -1.15]], 0.09, 0.04, 8, 5), [0, 0, 0]),
    ]),
    // saddle cloth, in the army colour
    cloth: merge([place(new THREE.CylinderGeometry(0.47, 0.47, 0.8, 14, 1, true, Math.PI * 0.62, Math.PI * 0.76), [0, 1.48, 0.05], [Math.PI / 2, 0, 0])]),
  };
};

// ---------- war elephant (faces +z), drawn as a group; geometry shared by all elephants ----------
const eleGeo = () => {
  const legs: THREE.BufferGeometry[] = [];
  for (const [x, z] of [[-0.62, 1.05], [0.62, 1.05], [-0.6, -1.05], [0.6, -1.05]] as const) {
    legs.push(place(new THREE.CylinderGeometry(0.42, 0.34, 1.8, 12), [x, 0.9, z]));
    legs.push(place(new THREE.CylinderGeometry(0.36, 0.4, 0.14, 12), [x, 0.07, z]));
  }
  return {
    skin: merge([
      place(new THREE.SphereGeometry(1, 24, 18), [0, 2.35, 0], [0, 0, 0], [1.05, 1.0, 1.55]),       // barrel body
      place(new THREE.SphereGeometry(0.95, 20, 16), [0, 2.55, 0.55], [0, 0, 0], [1.0, 1.0, 1.0]),  // high shoulders, back slopes to the rump
      place(new THREE.SphereGeometry(0.85, 20, 16), [0, 2.85, 1.7], [0, 0, 0], [0.95, 1.05, 0.92]), // head
      place(new THREE.SphereGeometry(0.3, 12, 10), [-0.28, 3.32, 1.82]), place(new THREE.SphereGeometry(0.3, 12, 10), [0.28, 3.32, 1.82]), // domed forehead
      tube([[0, 2.55, 2.35], [0, 1.9, 2.65], [0, 1.1, 2.55], [0, 0.6, 2.75], [0, 0.55, 3.05]], 0.27, 0.08, 24, 10), // trunk, curling forward
      tube([[0, 2.2, -1.5], [0, 1.6, -1.65], [0, 1.15, -1.62]], 0.06, 0.03, 8, 5),                  // tail
      ...legs,
    ]),
    ears: merge([
      place(new THREE.SphereGeometry(1, 18, 14), [-0.88, 2.7, 1.42], [0, -0.45, 0.12], [0.1, 0.95, 0.8]),
      place(new THREE.SphereGeometry(1, 18, 14), [0.88, 2.7, 1.42], [0, 0.45, -0.12], [0.1, 0.95, 0.8]),
    ]),
    tusks: merge([
      tube([[-0.28, 2.3, 2.25], [-0.32, 1.95, 2.65], [-0.26, 1.85, 3.05]], 0.08, 0.025, 10, 6),
      tube([[0.28, 2.3, 2.25], [0.32, 1.95, 2.65], [0.26, 1.85, 3.05]], 0.08, 0.025, 10, 6),
    ]),
    // caparison: a cloth draped over the back and down both flanks
    cloth: place(new THREE.CylinderGeometry(1.1, 1.14, 1.8, 28, 1, true, Math.PI * 0.6, Math.PI * 0.8), [0, 2.45, -0.15], [Math.PI / 2, 0, 0], [1.03, 1, 1]),
    trim: merge([
      place(new THREE.TorusGeometry(1.14, 0.05, 6, 30, Math.PI * 0.8), [0, 2.45, 0.75], [0, 0, Math.PI * 0.1], [1.03, 1, 1]),
      place(new THREE.TorusGeometry(1.17, 0.05, 6, 30, Math.PI * 0.8), [0, 2.45, -1.05], [0, 0, Math.PI * 0.1], [1.03, 1, 1]),
      place(new THREE.TorusGeometry(0.62, 0.06, 6, 24), [0, 3.0, 1.65], [Math.PI / 2.4, 0, 0]),       // brow band
    ]),
    // howdah: a box seat with gold rails and a domed canopy on four posts
    howdah: merge([place(new THREE.BoxGeometry(1.25, 0.55, 1.35), [0, 3.62, -0.15])]),
    gold: merge([
      place(new THREE.BoxGeometry(1.35, 0.08, 1.45), [0, 3.92, -0.15]),
      ...[[-0.58, -0.75], [0.58, -0.75], [-0.58, 0.45], [0.58, 0.45]].map(([x, z]) => place(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), [x, 4.35, z - 0.0])),
      place(new THREE.SphereGeometry(0.85, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), [0, 4.78, -0.15], [0, 0, 0], [0.85, 0.55, 0.9]),
      place(new THREE.ConeGeometry(0.08, 0.35, 8), [0, 5.4, -0.15]),
    ]),
  };
};

let ELE: ReturnType<typeof eleGeo> | null = null;
let SOL: ReturnType<typeof soldierGeo> | null = null;
export const ELEPHANT = () => (ELE ??= eleGeo());
export const SOLDIER = () => (SOL ??= soldierGeo());

const skinMat = new THREE.MeshStandardMaterial({ color: "#8e8780", roughness: 0.92 });
const tuskMat = new THREE.MeshStandardMaterial({ color: "#efe6cf", roughness: 0.5 });
const goldMat = new THREE.MeshStandardMaterial({ color: C.gold, metalness: 0.55, roughness: 0.35 });
const clothMat = new THREE.MeshStandardMaterial({ color: C.vermilion, roughness: 0.75, side: THREE.DoubleSide });
const seatMat = new THREE.MeshStandardMaterial({ color: "#5a1d14", roughness: 0.7 });

export const ElephantModel: React.FC<{ swing?: number }> = ({ swing = 0 }) => {
  const g = ELEPHANT(), s = SOLDIER();
  return (
    <group scale={1.5}>
      <mesh geometry={g.skin} material={skinMat} castShadow receiveShadow />
      <mesh geometry={g.ears} material={skinMat} castShadow rotation={[0, swing * 0.15, 0]} />
      <mesh geometry={g.tusks} material={tuskMat} />
      <mesh geometry={g.cloth} material={clothMat} castShadow />
      <mesh geometry={g.trim} material={goldMat} />
      <mesh geometry={g.howdah} material={seatMat} castShadow />
      <mesh geometry={g.gold} material={goldMat} castShadow />
      {/* mahout on the neck, and two men in the howdah */}
      {([[0, 3.25, 1.15, 0.75], [-0.3, 3.45, -0.15, 0.7], [0.3, 3.45, -0.15, 0.7]] as const).map(([x, y, z, k], i) => (
        <group key={i} position={[x, y, z]} scale={k}>
          <mesh geometry={s.body}><meshStandardMaterial color={i ? "#efe6d0" : C.vermilionDark} roughness={0.8} /></mesh>
          <mesh geometry={s.head}><meshStandardMaterial color="#b98a5e" roughness={0.85} /></mesh>
          <mesh geometry={s.turban}><meshStandardMaterial color={i ? C.gold : "#efe6d0"} roughness={0.6} /></mesh>
        </group>
      ))}
    </group>
  );
};

// A banner on a pole, gently waving with the frame time.
export const Banner: React.FC<{ color: string; t: number; h?: number }> = ({ color, t, h = 6 }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(1.4, 0.85, 10, 4), []);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = (i % 11) / 10; pos.setZ(i, Math.sin(t * 4 + x * 5) * 0.18 * x);
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow><cylinderGeometry args={[0.05, 0.05, h, 6]} /><meshStandardMaterial color="#4a3320" /></mesh>
      <mesh position={[0, h + 0.1, 0]}><sphereGeometry args={[0.13, 8, 6]} /><meshStandardMaterial color={C.gold} metalness={0.6} roughness={0.3} /></mesh>
      <mesh geometry={geo} position={[0.75, h - 0.5, 0]}><meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.7} /></mesh>
    </group>
  );
};
