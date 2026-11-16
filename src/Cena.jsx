import { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { toonMaterial, toonOutline } from '../toon.js';

const Personagem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const geo = useMemo(() => new THREE.TorusKnotGeometry(1, 0.35, 160, 24), []);
  const mat = useMemo(() => toonMaterial('#ff7a59', 3), []);
  const outline = useMemo(() => toonOutline(geo), [geo]);
  const s = spring({ frame, fps, config: { damping: 12 } });
  return (
    <group scale={s} rotation={[frame * 0.01, frame * 0.02, 0]}>
      <mesh geometry={geo} material={mat} />
      <primitive object={outline} />
    </group>
  );
};

export const Cena = ({ titulo }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const opacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#fdf6e3' }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={1.5} />
        <Personagem />
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220 }}>
        <h1 style={{ fontFamily: 'sans-serif', fontSize: 90, color: '#222', opacity, textAlign: 'center' }}>{titulo}</h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
