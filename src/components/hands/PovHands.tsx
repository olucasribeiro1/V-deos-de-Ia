import React from 'react';
import * as THREE from 'three';
import {deg, fbm1} from '../../systems/animation/math';
import {mat, PAL} from '../../library/materials';
import type {HandPose} from '../../systems/animation/handPoses';

/**
 * Mãos/antebraços do protagonista em espaço de câmera.
 * Referência local da mão: dedos para +Y, palma voltada para +Z, polegar em +X (mão direita).
 * A mão esquerda é espelhada (escala X = -1).
 * Identidade fixa (CHARACTER BIBLE): pele clara, jaqueta oliva, punho cinza, relógio preto no pulso esquerdo.
 */
export type HandsLook = {skin: string; sleeve: string; cuff: string; watch?: boolean};
export const PROTAGONIST_HANDS: HandsLook = {skin: PAL.skinFair, sleeve: PAL.jacketOlive, cuff: '#3a4033', watch: true};

const FINGERS = [
  // x, comprimento, espessura
  {x: 0.03, len: 0.074, w: 0.019}, // indicador (lado do polegar)
  {x: 0.0105, len: 0.082, w: 0.0195},
  {x: -0.009, len: 0.077, w: 0.0185},
  {x: -0.0275, len: 0.061, w: 0.017},
];

const Finger: React.FC<{len: number; w: number; curl: number; skin: THREE.Material}> = ({len, w, curl, skin}) => {
  const a = len * 0.56;
  const b = len * 0.44;
  return (
    <group rotation={[deg(curl * 70), 0, 0]}>
      <mesh position={[0, a / 2, 0]} material={skin}>
        <boxGeometry args={[w, a, w * 0.92]} />
      </mesh>
      <group position={[0, a, 0]} rotation={[deg(curl * 80), 0, 0]}>
        <mesh position={[0, b / 2, 0]} material={skin}>
          <boxGeometry args={[w * 0.9, b, w * 0.85]} />
        </mesh>
      </group>
    </group>
  );
};

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

/** Cilindro entre dois pontos (antebraço/manga). */
const Limb: React.FC<{from: THREE.Vector3; to: THREE.Vector3; r0: number; r1: number; m: THREE.Material}> = ({from, to, r0, r1, m}) => {
  const dir = v1.copy(to).sub(from);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  const mid = v2.copy(from).add(to).multiplyScalar(0.5);
  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={q} material={m}>
      <cylinderGeometry args={[r1, r0, len, 7, 1]} />
    </mesh>
  );
};

const Hand: React.FC<{pose: HandPose; side: 1 | -1; look: HandsLook; t: number; children?: React.ReactNode}> = ({pose, side, look, t, children}) => {
  const skin = mat(look.skin, {rough: 0.7});
  const sleeve = mat(look.sleeve, {rough: 0.95});
  const cuff = mat(look.cuff, {rough: 0.95});
  // micro movimento orgânico independente da cabeça
  const n = (s: number) => fbm1(t * 0.7, s + (side > 0 ? 0 : 50)) * 0.004;
  const p = new THREE.Vector3(pose.p[0] * side + n(1), pose.p[1] + n(2), pose.p[2] + n(3));
  const e = new THREE.Euler(deg(pose.r[0]), deg(pose.r[1] * side), deg(pose.r[2] * side), 'XYZ');
  const q = new THREE.Quaternion().setFromEuler(e);
  // antebraço segue o eixo da mão, puxado em direção ao ombro (fora do quadro)
  const shoulder = new THREE.Vector3(0.2 * side, -0.32, 0.12);
  const along = new THREE.Vector3(0, -0.27, -0.015).applyQuaternion(q).add(p);
  const elbow = along.lerp(shoulder, 0.25);
  const wristBack = new THREE.Vector3(0, -0.035, 0).applyQuaternion(q).add(p);
  return (
    <group>
      <Limb from={elbow} to={wristBack} r0={0.058} r1={0.047} m={sleeve} />
      <Limb from={shoulder} to={elbow} r0={0.068} r1={0.06} m={sleeve} />
      <group position={p} quaternion={q} scale={[side, 1, 1]}>
        {/* punho da manga */}
        <mesh position={[0, -0.05, 0]} material={cuff}>
          <cylinderGeometry args={[0.05, 0.051, 0.03, 7]} />
        </mesh>
        {/* pulso */}
        <mesh position={[0, -0.012, 0]} material={skin}>
          <cylinderGeometry args={[0.03, 0.033, 0.04, 6]} />
        </mesh>
        {look.watch && side < 0 && (
          <mesh position={[0, -0.022, 0]} material={mat(PAL.black, {rough: 0.5})}>
            <cylinderGeometry args={[0.035, 0.035, 0.018, 8]} />
          </mesh>
        )}
        {/* palma */}
        <mesh position={[0, 0.045, 0]} material={skin}>
          <boxGeometry args={[0.083, 0.09, 0.027]} />
        </mesh>
        <mesh position={[0.0, 0.03, 0.009]} rotation={[0, 0, 0]} material={mat(look.skin, {rough: 0.7})}>
          <boxGeometry args={[0.07, 0.05, 0.016]} />
        </mesh>
        {FINGERS.map((f, i) => (
          <group key={i} position={[f.x, 0.09, 0]}>
            <Finger len={f.len} w={f.w} curl={Math.min(1, pose.curl * (1 + i * 0.06))} skin={skin} />
          </group>
        ))}
        {/* polegar */}
        <group position={[0.04, 0.02, 0.008]} rotation={[deg(10 + pose.thumb * 35), deg(-20 - pose.thumb * 30), deg(-38 + pose.thumb * 25)]}>
          <mesh position={[0, 0.022, 0]} material={skin}>
            <boxGeometry args={[0.024, 0.044, 0.022]} />
          </mesh>
          <group position={[0, 0.044, 0]} rotation={[deg(pose.thumb * 30), 0, 0]}>
            <mesh position={[0, 0.016, 0]} material={skin}>
              <boxGeometry args={[0.021, 0.032, 0.02]} />
            </mesh>
          </group>
        </group>
        {children}
      </group>
    </group>
  );
};

export const PovHands: React.FC<{
  left: HandPose;
  right: HandPose;
  t: number;
  look?: HandsLook;
  rightProp?: React.ReactNode;
  leftProp?: React.ReactNode;
}> = ({left, right, t, look = PROTAGONIST_HANDS, rightProp, leftProp}) => (
  <group>
    <Hand pose={right} side={1} look={look} t={t}>
      {rightProp}
    </Hand>
    <Hand pose={left} side={-1} look={look} t={t}>
      {leftProp}
    </Hand>
  </group>
);
