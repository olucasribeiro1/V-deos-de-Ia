import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Humanoid} from '../../components/characters/Humanoid';
import {clip} from '../../systems/animation/clips';
import {CIVILIANS, INFECTED, PROTAGONIST, RAFAEL} from '../../library/characters';
import {VIDEO} from '../../config/video';
import {Outlines} from '../../components/effects/Outlines';

/** Ficha de referência visual (CHARACTER BIBLE): protagonista, Rafael, civis e os 7 infectados. */
export const CharacterSheet: React.FC<{close?: boolean}> = ({close}) => {
  const f = useCurrentFrame();
  const t = f / VIDEO.fps;
  const row1 = [
    {s: PROTAGONIST, c: 'idle' as const, label: 'PROTAGONISTA'},
    {s: RAFAEL, c: 'idle' as const, label: 'RAFAEL'},
    ...CIVILIANS.map((s) => ({s, c: 'walk' as const, label: s.id})),
  ];
  const inf = Object.entries(INFECTED);
  return (
    <AbsoluteFill style={{background: '#15171a'}}>
      <ThreeCanvas width={VIDEO.width} height={VIDEO.height} shadows camera={close ? {fov: 26, position: [0, 1.55, 3.6], rotation: [-0.06, 0, 0]} : {fov: 30, position: [0, 0.7, 10]}} gl={{antialias: true}}>
        <color attach="background" args={['#cfd6dc']} />
        <hemisphereLight args={['#c8d0dc', '#3a3028', 1.1]} />
        <directionalLight position={[3, 6, 5]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 3, -4]} intensity={0.8} color="#88a0c0" />
        {close ? (
          <group>
            <Humanoid spec={PROTAGONIST} pose={clip('idle', t, 0.1)} position={[-0.75, 0, 0]} yaw={12} face={{brows: -0.4, look: [0.3, 0]}} />
            <Humanoid spec={RAFAEL} pose={clip('idle', t, 0.6)} position={[0.05, 0, -0.3]} yaw={-5} face={{mouth: 0.5}} />
            <Humanoid spec={INFECTED.porta.spec} pose={clip('idleTense', t, 0.3)} position={[0.85, 0, 0]} yaw={-15} />
          </group>
        ) : (
        <group rotation={[0.05, 0, 0]}>
          {row1.map((r, i) => (
            <Humanoid key={r.s.id} spec={r.s} pose={clip(r.c, t, i * 0.21)} position={[-3.2 + i * 1.6, 0.9, 0]} yaw={20 - i * 8} />
          ))}
          {inf.map(([k, v], i) => (
            <Humanoid key={k} spec={v.spec} pose={clip(v.clip === 'idleTense' ? 'lookAround' : v.clip, t, i * 0.17)} position={[-4.2 + i * 1.4, -1.25, 1]} yaw={-10 + i * 6} />
          ))}
        </group>
        )}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, close ? 0 : -1.25, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#3a3f45" />
        </mesh>
        <Outlines />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
