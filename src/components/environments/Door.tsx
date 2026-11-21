import React from 'react';
import {deg} from '../../systems/animation/math';
import {mat, PAL} from '../../library/materials';

/**
 * Porta articulada reutilizável. `open` em graus (0 = fechada). `shake` desloca a folha (impactos).
 * Posicionada pelo centro do vão; `rotY` orienta a parede; dobradiça no lado esquerdo (visto de +Z local).
 */
export const Door: React.FC<{
  position: [number, number, number];
  rotY?: number;
  width?: number;
  height?: number;
  open?: number;
  shake?: number;
  color?: string;
  peephole?: boolean;
  locks?: number; // trancas visíveis no lado interno (+Z local)
  chain?: boolean;
}> = ({position, rotY = 0, width = 0.9, height = 2.1, open = 0, shake = 0, color = PAL.doorPaint, peephole, locks = 0, chain}) => {
  const leaf = mat(color, {rough: 0.7});
  const frame = mat(PAL.trim, {rough: 0.7});
  const metal = mat(PAL.metal, {rough: 0.35, metal: 0.8});
  return (
    <group position={position} rotation={[0, deg(rotY), 0]}>
      {/* batentes */}
      <mesh position={[-width / 2 - 0.035, height / 2, 0]} material={frame} castShadow>
        <boxGeometry args={[0.07, height + 0.05, 0.16]} />
      </mesh>
      <mesh position={[width / 2 + 0.035, height / 2, 0]} material={frame} castShadow>
        <boxGeometry args={[0.07, height + 0.05, 0.16]} />
      </mesh>
      <mesh position={[0, height + 0.035, 0]} material={frame} castShadow>
        <boxGeometry args={[width + 0.14, 0.07, 0.16]} />
      </mesh>
      {/* folha articulada */}
      <group position={[-width / 2, 0, 0]} rotation={[0, deg(open), 0]}>
        <group position={[width / 2 + shake * 0.01, height / 2, shake * 0.012]}>
          <mesh material={leaf} castShadow receiveShadow>
            <boxGeometry args={[width - 0.01, height - 0.01, 0.045]} />
          </mesh>
          {/* almofadas da porta (relevo) */}
          {[-0.45, 0.35].map((y, i) => (
            <mesh key={i} position={[0, y, 0.024]} material={mat(color, {rough: 0.6})}>
              <boxGeometry args={[width * 0.7, i ? 0.75 : 0.95, 0.01]} />
            </mesh>
          ))}
          {/* maçanetas (dos dois lados) */}
          {[1, -1].map((s) => (
            <group key={s} position={[width / 2 - 0.08, -0.05, 0.04 * s]}>
              <mesh material={metal} rotation={[deg(90), 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
              </mesh>
              <mesh position={[-0.045, 0, 0.02 * s]} material={metal}>
                <boxGeometry args={[0.1, 0.018, 0.018]} />
              </mesh>
            </group>
          ))}
          {peephole && (
            <mesh position={[0, 0.55, 0]} rotation={[deg(90), 0, 0]} material={metal}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
            </mesh>
          )}
          {Array.from({length: locks}).map((_, i) => (
            <mesh key={i} position={[width / 2 - 0.08, 0.15 + i * 0.22, 0.03]} material={metal}>
              <boxGeometry args={[0.06, 0.08, 0.02]} />
            </mesh>
          ))}
          {chain && (
            <mesh position={[width / 2 - 0.16, 0.28, 0.03]} material={metal}>
              <boxGeometry args={[0.18, 0.012, 0.012]} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

/** Janela com caixilho, vidro e peitoril. Centro do vão em `position` (y = centro). */
export const Window: React.FC<{position: [number, number, number]; rotY?: number; width: number; height: number; blinds?: number}> = ({
  position,
  rotY = 0,
  width,
  height,
  blinds = 0,
}) => {
  const frame = mat('#d9d4c8', {rough: 0.6});
  const glass = mat('#9fb4c4', {rough: 0.05, metal: 0.1});
  glass.transparent = true;
  glass.opacity = 0.12;
  glass.depthWrite = false;
  const bars = 3;
  return (
    <group position={position} rotation={[0, deg(rotY), 0]}>
      {[-1, 1].map((s) => (
        <mesh key={`v${s}`} position={[(s * width) / 2, 0, 0]} material={frame}>
          <boxGeometry args={[0.06, height, 0.12]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`h${s}`} position={[0, (s * height) / 2, 0]} material={frame}>
          <boxGeometry args={[width + 0.06, 0.06, 0.12]} />
        </mesh>
      ))}
      {Array.from({length: bars - 1}).map((_, i) => (
        <mesh key={i} position={[-width / 2 + ((i + 1) * width) / bars, 0, 0]} material={frame}>
          <boxGeometry args={[0.04, height, 0.06]} />
        </mesh>
      ))}
      <mesh material={glass}>
        <planeGeometry args={[width, height]} />
      </mesh>
      {/* peitoril */}
      <mesh position={[0, -height / 2 - 0.04, 0.1]} material={mat(PAL.trim)} receiveShadow>
        <boxGeometry args={[width + 0.2, 0.04, 0.22]} />
      </mesh>
      {/* persiana parcialmente baixada */}
      {blinds > 0 && (
        <mesh position={[0, height / 2 - (blinds * height) / 2, 0.08]} material={mat('#cfc8b8', {rough: 0.9})} castShadow>
          <boxGeometry args={[width, blinds * height, 0.01]} />
        </mesh>
      )}
    </group>
  );
};
