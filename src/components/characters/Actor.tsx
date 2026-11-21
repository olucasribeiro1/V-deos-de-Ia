import React from 'react';
import {Humanoid, type CharacterSpec} from './Humanoid';
import {blendPose, clip, type ClipName} from '../../systems/animation/clips';
import {clamp, lerp, smooth} from '../../systems/animation/math';

/**
 * Ator: personagem + caminho + linha do tempo de clips, com transições suaves (0,35 s).
 * path: pontos [t, x, z]; o personagem olha na direção do movimento (ou `face` fixo quando parado).
 * clips: [t, nome, k?] — k é progresso para clips de uma só vez (queda, levantar, reação).
 */
export type ActorTrack = {
  spec: CharacterSpec;
  variation?: number;
  path: [number, number, number][];
  clips: [number, ClipName, number?][];
  face?: number; // yaw (graus) quando parado
  y?: number;
  until?: number; // some após este tempo (troca de personagem, ex.: transformação)
  bloodAt?: number; // começa uma poça de sangue crescente sob o ator neste tempo
};

function pathAt(path: [number, number, number][], t: number) {
  if (t <= path[0][0]) return {x: path[0][1], z: path[0][2], dx: 0, dz: 0};
  for (let i = 1; i < path.length; i++) {
    if (t <= path[i][0]) {
      const [t0, x0, z0] = path[i - 1];
      const [t1, x1, z1] = path[i];
      const k = (t - t0) / Math.max(1e-6, t1 - t0);
      return {x: lerp(x0, x1, k), z: lerp(z0, z1, k), dx: x1 - x0, dz: z1 - z0};
    }
  }
  const l = path[path.length - 1];
  return {x: l[1], z: l[2], dx: 0, dz: 0};
}

export const Actor: React.FC<{track: ActorTrack; t: number}> = ({track, t}) => {
  if (track.until !== undefined && t > track.until) return null;
  if (t < track.path[0][0] - 0.01) return null;
  const {x, z, dx, dz} = pathAt(track.path, t);
  const moving = Math.hypot(dx, dz) > 1e-3;
  const yaw = moving ? (Math.atan2(dx, dz) * 180) / Math.PI : track.face ?? 0;
  // clip atual e anterior para mistura
  let i = 0;
  while (i + 1 < track.clips.length && track.clips[i + 1][0] <= t) i++;
  const [ct, cname, ck] = track.clips[i];
  const v = track.variation ?? 0.5;
  const local = t - ct;
  const nextT = track.clips[i + 1]?.[0] ?? ct + 1;
  const progress = ck ?? clamp(local / Math.max(0.3, nextT - ct));
  let pose = clip(cname, t, v, progress);
  if (i > 0 && local < 0.35) {
    const [pt, pname, pk] = track.clips[i - 1];
    const prevPose = clip(pname, t, v, pk ?? clamp((ct - pt) / Math.max(0.3, ct - pt)));
    pose = blendPose(prevPose, pose, smooth(local / 0.35));
  }
  const pool = track.bloodAt !== undefined && t > track.bloodAt ? Math.min(1, (t - track.bloodAt) / 5) : 0;
  return (
    <>
      <Humanoid spec={track.spec} pose={pose} position={[x, track.y ?? 0, z]} yaw={yaw} />
      {pool > 0 && (
        <mesh position={[x + Math.sin((yaw * Math.PI) / 180) * 0.5, (track.y ?? 0) + 0.015, z + Math.cos((yaw * Math.PI) / 180) * 0.5]} rotation={[-Math.PI / 2, 0, 0]} scale={[pool * 1.1, pool * 0.8, 1]}>
          <circleGeometry args={[0.9, 14]} />
          <meshBasicMaterial color="#5e0f12" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      )}
    </>
  );
};
