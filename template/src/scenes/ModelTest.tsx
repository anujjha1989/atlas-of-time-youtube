import React from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAsset, preloadBattle, gltfLoad } from "../battle/assets";
import { useReal, RealElephant, RiggedHorse, REAL } from "../battle/real";
import { Sky, Ground } from "../battle/env";

const Cam: React.FC<{ pos: [number, number, number]; look: [number, number, number] }> = ({ pos, look }) => {
  const { camera } = useThree();
  React.useLayoutEffect(() => { camera.position.set(...pos); camera.lookAt(...look); (camera as THREE.PerspectiveCamera).fov = 35; camera.updateProjectionMatrix(); }, [camera, pos, look]);
  return null;
};
const Scene: React.FC<{ side: boolean }> = ({ side }) => {
  const ele = useReal("elephant"), hh = useReal("horseHi"), so = useReal("soldier");
  const rig = useAsset(REAL.horseRig, () => gltfLoad(REAL.horseRig));
  if (!ele || !hh || !so || !rig) return null;
  const top = new THREE.Box3(); ele.forEach((p) => top.union(p.geometry.boundingBox ?? new THREE.Box3().setFromBufferAttribute(p.geometry.attributes.position as THREE.BufferAttribute)));
  return (
    <>
      <Cam pos={side ? [16, 2.5, 3] : [4, 3, 16]} look={[0, 1.4, 3]} />
      <group position={[0, 0, 0]}><RealElephant parts={ele} back={2.95} /></group>
      <group position={[0, 0, 5]}>{hh.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow />)}</group>
      <group position={[0, 0, 8]}><RiggedHorse g={rig} t={0.4} /></group>
      <group position={[0, 0, 10.5]}>{so.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow />)}</group>
      <directionalLight position={[-20, 30, 10]} intensity={2.5} castShadow />
    </>
  );
};
export const ModelTest: React.FC<{ side: boolean }> = ({ side }) => {
  const ready = useAsset("battle-assets", preloadBattle);
  if (!ready) return null;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1920} height={1080} shadows="soft" gl={{ preserveDrawingBuffer: true }}>
        <Sky night={0} dawn={0} />
        <Ground />
        <Scene side={side} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
