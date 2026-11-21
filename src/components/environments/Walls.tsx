import React from 'react';
import * as THREE from 'three';

/**
 * Construtor modular de paredes alinhadas aos eixos, com aberturas (portas/janelas).
 * Cada parede vira poucas caixas — barato em draw calls e com sombra correta.
 */
export type Opening = {from: number; to: number; bottom: number; top: number};
export type WallSpec = {
  a: [number, number]; // [x,z] início
  b: [number, number]; // [x,z] fim (mesmo x ou mesmo z)
  h?: number;
  t?: number;
  openings?: Opening[];
  material: THREE.Material;
  material2?: THREE.Material; // face oposta não é separada — mantém 1 material por parede
};

export const Wall: React.FC<WallSpec> = ({a, b, h = 2.7, t = 0.12, openings = [], material}) => {
  const alongX = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
  const len = alongX ? Math.abs(b[0] - a[0]) : Math.abs(b[1] - a[1]);
  const o0 = alongX ? Math.min(a[0], b[0]) : Math.min(a[1], b[1]);
  const fixed = alongX ? a[1] : a[0];
  const pieces: {s: number; e: number; y0: number; y1: number}[] = [];
  const ops = [...openings].sort((p, q) => p.from - q.from);
  let cursor = 0;
  for (const op of ops) {
    if (op.from > cursor) pieces.push({s: cursor, e: op.from, y0: 0, y1: h});
    if (op.bottom > 0) pieces.push({s: op.from, e: op.to, y0: 0, y1: op.bottom});
    if (op.top < h) pieces.push({s: op.from, e: op.to, y0: op.top, y1: h});
    cursor = op.to;
  }
  if (cursor < len) pieces.push({s: cursor, e: len, y0: 0, y1: h});
  return (
    <group>
      {pieces.map((p, i) => {
        const l = p.e - p.s;
        const c = o0 + p.s + l / 2;
        const hh = p.y1 - p.y0;
        const pos: [number, number, number] = alongX ? [c, p.y0 + hh / 2, fixed] : [fixed, p.y0 + hh / 2, c];
        const size: [number, number, number] = alongX ? [l, hh, t] : [t, hh, l];
        return (
          <mesh key={i} position={pos} material={material} castShadow receiveShadow>
            <boxGeometry args={size} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Piso/teto retangular. */
export const Slab: React.FC<{x: [number, number]; z: [number, number]; y?: number; material: THREE.Material; ceiling?: boolean}> = ({
  x,
  z,
  y = 0,
  material,
  ceiling,
}) => (
  <mesh
    position={[(x[0] + x[1]) / 2, y, (z[0] + z[1]) / 2]}
    rotation={[ceiling ? Math.PI / 2 : -Math.PI / 2, 0, 0]}
    material={material}
    receiveShadow
  >
    <planeGeometry args={[x[1] - x[0], z[1] - z[0]]} />
  </mesh>
);
