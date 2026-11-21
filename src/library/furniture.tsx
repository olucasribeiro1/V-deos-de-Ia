import React from 'react';
import * as THREE from 'three';
import {deg, rng} from '../systems/animation/math';
import {mat, PAL} from './materials';

/**
 * Biblioteca de móveis/objetos low poly reutilizáveis.
 * Convenção: origem no chão, centro do objeto; frente voltada para +Z local; `rotY` em graus.
 */
type P = {position: [number, number, number]; rotY?: number; color?: string};
const G: React.FC<P & {children: React.ReactNode}> = ({position, rotY = 0, children}) => (
  <group position={position} rotation={[0, deg(rotY), 0]}>
    {children}
  </group>
);
const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; r?: number; shadow?: boolean; rot?: [number, number, number]}> = ({
  p,
  s,
  c,
  r,
  shadow = true,
  rot,
}) => (
  <mesh position={p} rotation={rot} material={mat(c, {rough: r ?? 0.85})} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);
const Cyl: React.FC<{p: [number, number, number]; r: number; h: number; c: string; seg?: number; r2?: number; rot?: [number, number, number]}> = ({
  p,
  r,
  h,
  c,
  seg = 8,
  r2,
  rot,
}) => (
  <mesh position={p} rotation={rot} material={mat(c)} castShadow receiveShadow>
    <cylinderGeometry args={[r2 ?? r, r, h, seg]} />
  </mesh>
);

export const Sofa: React.FC<P> = ({color = PAL.fabricGreen, ...p}) => (
  <G {...p}>
    <Box p={[0, 0.22, 0]} s={[2.1, 0.3, 0.9]} c={color} />
    <Box p={[0, 0.62, -0.36]} s={[2.1, 0.6, 0.2]} c={color} />
    <Box p={[-0.98, 0.45, 0.02]} s={[0.16, 0.36, 0.86]} c={color} />
    <Box p={[0.98, 0.45, 0.02]} s={[0.16, 0.36, 0.86]} c={color} />
    {[-0.47, 0.47].map((x) => (
      <Box key={x} p={[x, 0.42, 0.04]} s={[0.88, 0.12, 0.74]} c={color} r={0.95} />
    ))}
    <Box p={[0.6, 0.6, -0.15]} s={[0.4, 0.34, 0.12]} c="#8d7b5e" rot={[deg(-15), deg(10), 0]} />
    {[-0.95, 0.95].map((x) => [-0.38, 0.38].map((z) => <Box key={`${x}${z}`} p={[x, 0.04, z]} s={[0.06, 0.08, 0.06]} c={PAL.black} />))}
  </G>
);

export const CoffeeTable: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0.4, 0]} s={[1.1, 0.05, 0.6]} c={PAL.wood} r={0.6} />
    {[-0.5, 0.5].map((x) => [-0.25, 0.25].map((z) => <Box key={`${x}${z}`} p={[x, 0.19, z]} s={[0.05, 0.38, 0.05]} c={PAL.floorWoodDark} />))}
    <Box p={[0, 0.12, 0]} s={[1.0, 0.03, 0.5]} c={PAL.floorWoodDark} />
    <Box p={[0.25, 0.44, 0.1]} s={[0.3, 0.03, 0.22]} c="#3d4a5a" />
    <Cyl p={[-0.3, 0.47, -0.05]} r={0.04} h={0.1} c={PAL.white} />
  </G>
);

export const TvStand: React.FC<P & {tvOn?: number}> = ({tvOn = 0, ...p}) => (
  <G {...p}>
    <Box p={[0, 0.25, 0]} s={[1.6, 0.5, 0.42]} c={PAL.floorWoodDark} />
    <Box p={[0, 0.88, -0.05]} s={[1.25, 0.72, 0.05]} c={PAL.black} r={0.3} />
    <mesh position={[0, 0.88, -0.02]} material={mat('#0d1216', {rough: 0.2, emissive: '#7fa6c4', ei: tvOn})}>
      <planeGeometry args={[1.18, 0.66]} />
    </mesh>
    <Box p={[0, 0.53, -0.05]} s={[0.3, 0.06, 0.2]} c={PAL.black} />
  </G>
);

export const Rug: React.FC<P & {w?: number; d?: number}> = ({w = 2.4, d = 1.7, color = '#6d5f4f', ...p}) => (
  <G {...p}>
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat(color, {rough: 1})} receiveShadow>
      <planeGeometry args={[w, d]} />
    </mesh>
  </G>
);

export const Bookshelf: React.FC<P & {seed?: number}> = ({seed = 3, ...p}) => {
  const r = rng(seed);
  const cols = ['#6b3b2e', '#3e5463', '#7a6a3a', '#40503a', '#8a8378', '#5a3c52'];
  const books: React.ReactNode[] = [];
  for (let s = 0; s < 4; s++) {
    let x = -0.42;
    while (x < 0.4) {
      const w = 0.03 + r() * 0.04;
      const h = 0.2 + r() * 0.1;
      if (r() > 0.12) books.push(<Box key={`${s}-${x}`} p={[x + w / 2, 0.08 + s * 0.42 + h / 2, 0]} s={[w, h, 0.22]} c={cols[Math.floor(r() * cols.length)]} shadow={false} />);
      x += w + 0.004;
    }
  }
  return (
    <G {...p}>
      <Box p={[-0.46, 0.9, 0]} s={[0.03, 1.8, 0.3]} c={PAL.wood} />
      <Box p={[0.46, 0.9, 0]} s={[0.03, 1.8, 0.3]} c={PAL.wood} />
      <Box p={[0, 0.9, -0.14]} s={[0.95, 1.8, 0.02]} c={PAL.floorWoodDark} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} p={[0, 0.06 + i * 0.42, 0]} s={[0.92, 0.03, 0.3]} c={PAL.wood} />
      ))}
      {books}
    </G>
  );
};

export const FloorLamp: React.FC<P & {on?: number}> = ({on = 1, ...p}) => (
  <G {...p}>
    <Cyl p={[0, 0.02, 0]} r={0.16} h={0.04} c={PAL.metalDark} />
    <Cyl p={[0, 0.8, 0]} r={0.015} h={1.6} c={PAL.metalDark} />
    <mesh position={[0, 1.62, 0]} material={mat('#e8d8b0', {emissive: '#ffcf8a', ei: 0.8 * on})}>
      <cylinderGeometry args={[0.14, 0.22, 0.28, 8, 1, true]} />
    </mesh>
  </G>
);

export const KitchenRun: React.FC<P & {length: number}> = ({length, ...p}) => {
  const n = Math.round(length / 0.6);
  return (
    <G {...p}>
      <Box p={[0, 0.43, 0]} s={[length, 0.86, 0.6]} c="#c8c2b4" />
      <Box p={[0, 0.89, 0.01]} s={[length + 0.02, 0.05, 0.64]} c="#8a8f93" r={0.35} />
      {Array.from({length: n}).map((_, i) => (
        <group key={i}>
          <Box p={[-length / 2 + 0.3 + i * 0.6, 0.42, 0.302]} s={[0.56, 0.74, 0.01]} c="#d6d0c2" shadow={false} />
          <Box p={[-length / 2 + 0.3 + i * 0.6 + 0.2, 0.7, 0.312]} s={[0.12, 0.015, 0.015]} c={PAL.metal} shadow={false} />
          <Box p={[-length / 2 + 0.3 + i * 0.6, 1.85, -0.12]} s={[0.56, 0.7, 0.36]} c="#d6d0c2" />
        </group>
      ))}
      {/* fogão + pia */}
      <Box p={[-length / 2 + 0.9, 0.92, 0.02]} s={[0.56, 0.02, 0.5]} c={PAL.black} r={0.3} />
      {[-0.13, 0.13].map((x) => [-0.12, 0.12].map((z) => <Cyl key={`${x}${z}`} p={[-length / 2 + 0.9 + x, 0.935, 0.02 + z]} r={0.07} h={0.01} c="#2a2a2a" />))}
      <Box p={[length / 2 - 0.8, 0.9, 0.02]} s={[0.6, 0.02, 0.42]} c="#9aa0a4" r={0.25} />
      <Cyl p={[length / 2 - 0.8, 1.02, -0.2]} r={0.015} h={0.25} c={PAL.metal} />
    </G>
  );
};

export const Fridge: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0.9, 0]} s={[0.7, 1.8, 0.68]} c="#dcdcd6" r={0.4} />
    <Box p={[0, 1.15, 0.345]} s={[0.68, 0.01, 0.01]} c="#9a9a94" shadow={false} />
    <Box p={[-0.28, 1.4, 0.36]} s={[0.025, 0.3, 0.03]} c={PAL.metal} shadow={false} />
    <Box p={[-0.28, 0.75, 0.36]} s={[0.025, 0.3, 0.03]} c={PAL.metal} shadow={false} />
    <Box p={[0.12, 1.45, 0.346]} s={[0.12, 0.09, 0.005]} c="#e6a23c" shadow={false} />
  </G>
);

export const DiningSet: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0.74, 0]} s={[1.2, 0.04, 0.8]} c={PAL.woodLight} r={0.6} />
    {[-0.54, 0.54].map((x) => [-0.34, 0.34].map((z) => <Box key={`${x}${z}`} p={[x, 0.36, z]} s={[0.05, 0.72, 0.05]} c={PAL.wood} />))}
    {[
      [-0.35, 0.6, 0],
      [0.35, 0.6, 0],
      [-0.35, -0.6, 180],
      [0.35, -0.6, 170],
    ].map(([x, z, r], i) => (
      <group key={i} position={[x, 0, z]} rotation={[0, deg(r), 0]}>
        <Box p={[0, 0.45, 0]} s={[0.42, 0.04, 0.42]} c={PAL.wood} />
        <Box p={[0, 0.72, 0.19]} s={[0.42, 0.5, 0.04]} c={PAL.wood} />
        {[-0.18, 0.18].map((cx) => [-0.18, 0.18].map((cz) => <Box key={`${cx}${cz}`} p={[cx, 0.22, cz]} s={[0.035, 0.45, 0.035]} c={PAL.floorWoodDark} />))}
      </group>
    ))}
    <Cyl p={[0.2, 0.8, 0.1]} r={0.1} h={0.06} c="#c9c2b4" />
  </G>
);

export const Bed: React.FC<P> = ({color = PAL.fabricBlue, ...p}) => (
  <G {...p}>
    <Box p={[0, 0.2, 0]} s={[1.45, 0.3, 2.0]} c={PAL.wood} />
    <Box p={[0, 0.42, 0.02]} s={[1.4, 0.16, 1.95]} c={PAL.white} r={0.95} />
    <Box p={[0, 0.52, 0.25]} s={[1.46, 0.06, 1.4]} c={color} r={1} />
    <Box p={[0, 0.7, -1.0]} s={[1.5, 0.9, 0.08]} c={PAL.floorWoodDark} />
    {[-0.35, 0.35].map((x) => (
      <Box key={x} p={[x, 0.56, -0.75]} s={[0.55, 0.12, 0.32]} c={PAL.white} r={1} />
    ))}
  </G>
);

export const Nightstand: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0.27, 0]} s={[0.45, 0.54, 0.4]} c={PAL.wood} />
    <Cyl p={[0, 0.66, 0]} r={0.08} r2={0.12} h={0.2} c="#e8d8b0" />
  </G>
);

export const Wardrobe: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 1.0, 0]} s={[1.2, 2.0, 0.58]} c="#bdb3a2" />
    <Box p={[0, 1.0, 0.292]} s={[0.01, 1.96, 0.01]} c="#8f877a" shadow={false} />
    {[-0.06, 0.06].map((x) => (
      <Box key={x} p={[x, 1.05, 0.3]} s={[0.02, 0.18, 0.025]} c={PAL.metal} shadow={false} />
    ))}
  </G>
);

export const Toilet: React.FC<P> = (p) => (
  <G {...p}>
    <Cyl p={[0, 0.2, 0.05]} r={0.17} r2={0.2} h={0.4} c={PAL.white} seg={10} />
    <Box p={[0, 0.6, -0.22]} s={[0.4, 0.4, 0.18]} c={PAL.white} r={0.3} />
  </G>
);

export const BathSink: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0.4, 0]} s={[0.6, 0.8, 0.45]} c="#c8c2b4" />
    <Box p={[0, 0.83, 0.02]} s={[0.62, 0.06, 0.48]} c={PAL.white} r={0.3} />
    <Box p={[0, 1.45, -0.21]} s={[0.55, 0.7, 0.02]} c="#a7b8c2" r={0.05} />
  </G>
);

export const Shower: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0.03, 0]} s={[0.9, 0.06, 0.9]} c={PAL.white} />
    <Cyl p={[0.3, 2.0, -0.38]} r={0.08} h={0.02} c={PAL.metal} />
    <mesh position={[0, 1.0, 0.45]} material={mat('#c8d6dd', {rough: 0.1})}>
      <boxGeometry args={[0.9, 2.0, 0.01]} />
    </mesh>
  </G>
);

export const Plant: React.FC<P & {scale?: number}> = ({scale = 1, ...p}) => (
  <G {...p}>
    <group scale={scale}>
      <Cyl p={[0, 0.17, 0]} r={0.14} r2={0.18} h={0.34} c="#8d5a3c" />
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.3) * 0.12, 0.6 + (i % 2) * 0.15, Math.sin(i * 1.3) * 0.12]} rotation={[deg(20), i, deg(25)]} material={mat(PAL.plant)} castShadow>
          <icosahedronGeometry args={[0.16, 0]} />
        </mesh>
      ))}
    </group>
  </G>
);

export const CeilingLamp: React.FC<P & {on?: number}> = ({on = 1, ...p}) => (
  <G {...p}>
    <Cyl p={[0, 2.62, 0]} r={0.2} r2={0.12} h={0.12} c="#e8e2d6" />
    <mesh position={[0, 2.55, 0]} material={mat('#fff3d6', {emissive: '#ffd9a0', ei: 1.4 * on})}>
      <sphereGeometry args={[0.1, 8, 4]} />
    </mesh>
  </G>
);

export const DuffelBag: React.FC<P> = ({color = '#2f3a2e', ...p}) => (
  <G {...p}>
    <mesh position={[0, 0.17, 0]} rotation={[0, 0, deg(90)]} material={mat(color, {rough: 1})} castShadow>
      <cylinderGeometry args={[0.17, 0.17, 0.62, 8]} />
    </mesh>
    <Box p={[0, 0.36, 0]} s={[0.5, 0.02, 0.04]} c={PAL.black} />
    <Box p={[0.2, 0.25, 0.165]} s={[0.12, 0.1, 0.01]} c={PAL.capRed} shadow={false} />
  </G>
);

export const Cardboard: React.FC<P & {s?: [number, number, number]}> = ({s = [0.5, 0.4, 0.4], ...p}) => (
  <G {...p}>
    <Box p={[0, s[1] / 2, 0]} s={s} c="#a07c52" r={1} />
    <Box p={[0, s[1] + 0.002, 0]} s={[0.06, 0.004, s[2]]} c="#c9b48a" shadow={false} />
  </G>
);

export const WaterBottle: React.FC<P> = (p) => (
  <G {...p}>
    <mesh position={[0, 0.13, 0]} material={mat('#8fb8cf', {rough: 0.15})}>
      <cylinderGeometry args={[0.045, 0.045, 0.26, 8]} />
    </mesh>
    <Cyl p={[0, 0.28, 0]} r={0.02} h={0.04} c="#2f6fa3" />
  </G>
);

export const Can: React.FC<P> = ({color = '#9b2e24', ...p}) => (
  <G {...p}>
    <Cyl p={[0, 0.06, 0]} r={0.038} h={0.12} c={color} />
  </G>
);

export const PictureFrame: React.FC<P & {w?: number; h?: number}> = ({w = 0.5, h = 0.38, color = '#5a6b78', ...p}) => (
  <G {...p}>
    <Box p={[0, 0, 0]} s={[w, h, 0.03]} c={PAL.black} shadow={false} />
    <Box p={[0, 0, 0.016]} s={[w - 0.06, h - 0.06, 0.005]} c={color} shadow={false} />
  </G>
);

/** Cômoda do corredor — vira barricada (empurrada contra a porta). */
export const Dresser: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0.45, 0]} s={[0.9, 0.9, 0.45]} c="#7a5a3e" />
    {[0.2, 0.5, 0.78].map((y) => (
      <group key={y}>
        <Box p={[0, y, 0.226]} s={[0.84, 0.24, 0.01]} c="#8c6a4a" shadow={false} />
        <Box p={[0, y, 0.236]} s={[0.16, 0.025, 0.02]} c={PAL.metal} shadow={false} />
      </group>
    ))}
    <Box p={[-0.25, 0.97, 0]} s={[0.2, 0.14, 0.14]} c="#5a7a8a" />
  </G>
);

/** Molho de chaves (prop de mão). */
export const Keys: React.FC<P> = (p) => (
  <G {...p}>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={mat(PAL.metal)}>
      <torusGeometry args={[0.018, 0.0035, 6, 14]} />
    </mesh>
    {[-0.4, 0.3].map((r, i) => (
      <group key={i} rotation={[0, 0, r]}>
        <Box p={[0, -0.04, 0]} s={[0.012, 0.05, 0.003]} c={i ? '#c9a640' : PAL.metal} shadow={false} />
        <Box p={[0, -0.012, 0]} s={[0.024, 0.02, 0.004]} c={i ? '#c9a640' : PAL.metal} shadow={false} />
      </group>
    ))}
  </G>
);

/** Porta de elevador (corredor do prédio). */
export const ElevatorDoor: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 1.05, 0]} s={[1.2, 2.1, 0.1]} c="#8f979e" r={0.3} />
    <Box p={[0, 1.05, 0.055]} s={[0.012, 2.0, 0.01]} c="#4a5056" shadow={false} />
    <Box p={[0.75, 1.2, 0.04]} s={[0.1, 0.18, 0.03]} c="#3a3f44" shadow={false} />
    <Box p={[0, 2.3, 0.04]} s={[0.5, 0.14, 0.02]} c="#1c1d1f" shadow={false} />
  </G>
);

/** Faca de cozinha (prop de mão). Lâmina para +Y (sai da mão fechada). */
export const Knife: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0, 0]} s={[0.022, 0.1, 0.02]} c="#2a2420" shadow={false} />
    <Box p={[0, 0.115, 0]} s={[0.026, 0.13, 0.004]} c="#c9d0d4" r={0.2} shadow={false} />
  </G>
);

const photoCache: {t?: THREE.CanvasTexture} = {};
/** Foto dos irmãos (formatura do Rafael; protagonista fardado) desenhada em canvas, estilo cartoon. */
function brothersPhoto() {
  if (photoCache.t) return photoCache.t;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 192;
  const g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, 192);
  sky.addColorStop(0, '#8fc0e6');
  sky.addColorStop(1, '#d8ecf6');
  g.fillStyle = sky;
  g.fillRect(0, 0, 256, 192);
  g.fillStyle = '#6aa85a';
  g.fillRect(0, 150, 256, 42);
  const person = (x: number, body: string, hat: string | null, skin: string) => {
    g.fillStyle = body;
    g.beginPath();
    g.roundRect(x - 26, 92, 52, 70, 16);
    g.fill();
    g.fillStyle = skin;
    g.beginPath();
    g.arc(x, 70, 26, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#111';
    g.beginPath();
    g.arc(x - 9, 68, 3.5, 0, Math.PI * 2);
    g.arc(x + 9, 68, 3.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#5a2a24';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, 76, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
    if (hat) {
      g.fillStyle = hat;
      g.fillRect(x - 28, 40, 56, 10);
      g.fillRect(x - 18, 30, 36, 12);
    }
  };
  person(92, '#1f2f4a', '#1f2f4a', '#efbd9d'); // protagonista de farda (fuzileiro)
  person(164, '#111', '#111', '#e2b49a'); // Rafael com beca de formatura
  g.fillStyle = '#ffd24a';
  g.fillRect(186, 120, 30, 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  photoCache.t = t;
  return t;
}
export const BrothersPhoto: React.FC<P> = (p) => (
  <G {...p}>
    <Box p={[0, 0, 0]} s={[0.36, 0.28, 0.03]} c={PAL.black} shadow={false} />
    <mesh position={[0, 0, 0.0165]}>
      <planeGeometry args={[0.32, 0.24]} />
      <meshBasicMaterial map={brothersPhoto()} toneMapped={false} />
    </mesh>
  </G>
);
