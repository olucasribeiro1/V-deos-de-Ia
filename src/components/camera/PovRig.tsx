import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {PovTrack} from '../../systems/camera/pov';

/**
 * Aplica o frame do PovTrack à câmera e renderiza `children` em espaço de cabeça
 * (mãos e objetos segurados acompanham o olhar).
 */
export const PovRig: React.FC<{track: PovTrack; frame: number; children?: React.ReactNode}> = ({track, frame, children}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const f = Math.min(track.frames - 1, Math.max(0, frame));
  const px = track.pos[f * 3];
  const py = track.pos[f * 3 + 1];
  const pz = track.pos[f * 3 + 2];
  const fov = track.fov[f];
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  euler.set(track.rot[f * 3], track.rot[f * 3 + 1], track.rot[f * 3 + 2], 'YXZ');
  // Mutação síncrona no render: garante que a câmera esteja posicionada antes do draw do frame.
  camera.position.set(px, py, pz);
  camera.rotation.copy(euler);
  if (camera.fov !== fov || camera.near !== 0.03) {
    camera.fov = fov;
    camera.near = 0.03;
    camera.far = 400;
    camera.updateProjectionMatrix();
  }
  return (
    <group position={[px, py, pz]} rotation={[euler.x, euler.y, euler.z, 'YXZ']} userData={{headRig: true}}>
      {children}
    </group>
  );
};
