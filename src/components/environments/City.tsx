import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {clamp, rng} from '../../systems/animation/math';
import {basic} from '../../library/materials';
import {mat, PAL} from '../../library/materials';

/**
 * CIDADE vista da janela (cenário reutilizável, barato):
 * prédios por INSTANCING (1 draw call), fumaça por instancing animado, rua com veículos.
 * `chaos` 0..1 controla colapso: luzes apagando, fumaça, incêndios, sirenes visuais.
 */
export const STREET_Y = -8.4; // 3º andar: ação na rua legível da janela

/** Fachada PRÉ-ILUMINADA: parede + janelas acesas na mesma textura (MeshBasicMaterial = custo mínimo). */
function facadeTexture(seed: number, lit: number) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#7d858d');
  grd.addColorStop(1, '#4e555c');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 256);
  const r = rng(seed);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 8; x++) {
      const v = r();
      g.fillStyle = v > 1 - 0.3 * lit ? (v > 0.95 ? '#ffe2b0' : '#f0c27e') : '#262b31';
      g.fillRect(x * 16 + 4, y * 16 + 4, 8, 9);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  return t;
}

function windowTexture(seed: number) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, 128, 256);
  const r = rng(seed);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 8; x++) {
      const lit = r();
      g.fillStyle = lit > 0.72 ? (lit > 0.93 ? '#ffd9a0' : '#e8b878') : '#000';
      g.fillRect(x * 16 + 4, y * 16 + 4, 8, 9);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  return t;
}

function wallTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#8a8f93';
  g.fillRect(0, 0, 128, 256);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 8; x++) {
      g.fillStyle = '#2b3036';
      g.fillRect(x * 16 + 4, y * 16 + 4, 8, 9);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function skyTexture(top: string, mid: string, horizon: string) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top);
  gr.addColorStop(0.42, mid);
  gr.addColorStop(0.52, horizon);
  gr.addColorStop(1, '#1a1c1e');
  g.fillStyle = gr;
  g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const Sky: React.FC<{top?: string; mid?: string; horizon?: string}> = ({top = '#1f2a36', mid = '#5a5a60', horizon = '#c08458'}) => {
  const tex = useMemo(() => skyTexture(top, mid, horizon), [top, mid, horizon]);
  return (
    <mesh renderOrder={20}>
      <sphereGeometry args={[300, 16, 12]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
};

const Buildings: React.FC<{seed?: number; lights: number}> = ({seed = 11, lights}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const {count, matrices, material} = useMemo(() => {
    const r = rng(seed);
    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    // fileiras ao norte (vista principal da janela) + laterais
    for (let row = 0; row < 5; row++) {
      const z = -32 - row * 26;
      for (let x = -90; x < 90; ) {
        const w = 8 + r() * 12;
        const d = 8 + r() * 10;
        const h = 10 + r() * (row === 0 ? 16 : 34) + row * 9;
        if (!(row === 0 && x > -14 && x < 6 && r() < 0.5)) {
          dummy.position.set(x + w / 2, STREET_Y + h / 2, z - d / 2 - r() * 4);
          dummy.scale.set(w, h, d);
          dummy.rotation.set(0, (r() - 0.5) * 0.08, 0);
          dummy.updateMatrix();
          list.push(dummy.matrix.clone());
        }
        x += w + 2 + r() * 5;
      }
    }
    const m = new THREE.MeshBasicMaterial({map: facadeTexture(seed, 1), fog: true});
    return {count: list.length, matrices: list, material: m};
  }, [seed]);
  // apagão progressivo: troca de textura só quando o nível muda (quantizado)
  const lit = Math.round(clamp(lights) * 4) / 4;
  const litTex = useMemo(() => facadeTexture(seed, lit), [seed, lit]);
  if (material.map !== litTex) material.map = litTex;
  useLayoutEffect(() => {
    const im = ref.current!;
    const col = new THREE.Color();
    const r = rng(seed + 99);
    matrices.forEach((m, i) => {
      im.setMatrixAt(i, m);
      const k = 0.62 + r() * 0.38; // variação de tom por prédio (sombreamento "pintado")
      im.setColorAt(i, col.setRGB(k, k * (0.97 + r() * 0.05), k * (0.98 + r() * 0.06)));
    });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.computeBoundingSphere();
  }, [matrices]);
  // renderOrder alto: desenha DEPOIS do apartamento → pixels escondidos atrás das paredes são descartados (early-z)
  return <instancedMesh ref={ref} args={[undefined, material, count]} frustumCulled={false} renderOrder={10}><boxGeometry /></instancedMesh>;
};

const smokeDummy = new THREE.Object3D();
export const Smoke: React.FC<{origin: [number, number, number]; t: number; amount: number; puffs?: number; color?: string; seed?: number}> = ({
  origin,
  t,
  amount,
  puffs = 26,
  color = '#6e6f73',
  seed = 1,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.55, depthWrite: false, fog: true}), [color]);
  const offs = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: puffs}, () => [r(), r(), r()]);
  }, [puffs, seed]);
  useLayoutEffect(() => {
    const im = ref.current!;
    for (let i = 0; i < puffs; i++) {
      const [a, b, c] = offs[i];
      const life = (t * 0.06 + a) % 1; // 0..1 ciclo de vida
      const y = life * 45;
      const s = (0.6 + life * 7 + b * 1.5) * amount;
      smokeDummy.position.set(origin[0] + (b - 0.5) * 3 + life * 14, origin[1] + y, origin[2] + (c - 0.5) * 3 - life * 4);
      smokeDummy.scale.setScalar(Math.max(0.001, s));
      smokeDummy.rotation.set(a * 6 + t * 0.05, b * 6, c * 6);
      smokeDummy.updateMatrix();
      im.setMatrixAt(i, smokeDummy.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, m, puffs]} frustumCulled={false} renderOrder={12}><icosahedronGeometry args={[1, 0]} /></instancedMesh>;
};

/** Chamas low poly (cones emissivos tremulando) — sem luz dinâmica. */
const Fire: React.FC<{p: [number, number, number]; t: number}> = ({p, t}) => (
  <group position={p} renderOrder={11}>
    {[0, 1, 2, 3, 4].map((i) => {
      const h = 1.1 + Math.sin(t * 9 + i * 1.7) * 0.35 + (i % 2) * 0.4;
      return (
        <mesh key={i} position={[Math.cos(i * 1.3) * 0.7, h / 2, Math.sin(i * 1.3) * 0.5]} scale={[1, h, 1]} material={mat(i % 2 ? '#ffb030' : '#ff5a1a', {emissive: i % 2 ? '#ffa020' : '#ff4010', ei: 2.2, outline: false})}>
          <coneGeometry args={[0.35, 1, 6]} />
        </mesh>
      );
    })}
  </group>
);

const Car: React.FC<{p: [number, number, number]; rotY?: number; color: string; wreck?: boolean}> = ({p, rotY = 0, color, wreck}) => (
  <group position={p} rotation={[wreck ? 0.15 : 0, rotY, wreck ? 0.25 : 0]}>
    <mesh position={[0, 0.55, 0]} material={mat(color, {rough: 0.5})}>
      <boxGeometry args={[1.8, 0.7, 4.2]} />
    </mesh>
    <mesh position={[0, 1.1, -0.2]} material={mat('#1e2328', {rough: 0.3})}>
      <boxGeometry args={[1.6, 0.5, 2.2]} />
    </mesh>
  </group>
);

/** Ambulância com giroflex emissivo (sem luz dinâmica real → barato). */
export const Ambulance: React.FC<{p: [number, number, number]; rotY?: number; t: number}> = ({p, rotY = 0, t}) => {
  const blink = Math.floor(t * 6) % 2;
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.3, 0.4]} material={mat('#e8e6e0', {rough: 0.6})}>
        <boxGeometry args={[2.1, 2.2, 3.6]} />
      </mesh>
      <mesh position={[0, 0.9, -1.9]} material={mat('#e8e6e0', {rough: 0.6})}>
        <boxGeometry args={[2.0, 1.4, 1.4]} />
      </mesh>
      <mesh position={[0, 1.4, 0.4]} material={mat(PAL.danger)}>
        <boxGeometry args={[2.12, 0.25, 3.62]} />
      </mesh>
      <mesh position={[-0.5, 2.45, -1.0]} material={mat('#ff2020', {emissive: '#ff1010', ei: blink ? 6 : 0.3})}>
        <boxGeometry args={[0.5, 0.15, 0.25]} />
      </mesh>
      <mesh position={[0.5, 2.45, -1.0]} material={mat('#2050ff', {emissive: '#2040ff', ei: blink ? 0.3 : 6})}>
        <boxGeometry args={[0.5, 0.15, 0.25]} />
      </mesh>
    </group>
  );
};

/** Todo o conteúdo da cidade é desenhado depois do interior (ordem de desenho = economia de pixels). */
export const City: React.FC<{t: number; chaos?: number; children?: React.ReactNode; bench?: any}> = ({t, chaos = 0, children, bench = {}}) => {
  const lights = 1.1 - chaos * 0.6;
  return (
    <group renderOrder={10}>
      {!bench.noSky && <Sky />}
      {!bench.noBuildings && <Buildings lights={lights} />}
      {/* rua abaixo do prédio */}
      <mesh position={[0, STREET_Y, -20]} rotation={[-Math.PI / 2, 0, 0]} material={basic('#33373c')}>
        <planeGeometry args={[220, 14]} />
      </mesh>
      <mesh position={[0, STREET_Y + 0.08, -12]} rotation={[-Math.PI / 2, 0, 0]} material={basic('#6e6f6c')}>
        <planeGeometry args={[220, 3]} />
      </mesh>
      <mesh position={[0, STREET_Y + 0.08, -28]} rotation={[-Math.PI / 2, 0, 0]} material={basic('#6e6f6c')}>
        <planeGeometry args={[220, 3]} />
      </mesh>
      <mesh position={[0, STREET_Y - 0.5, -60]} rotation={[-Math.PI / 2, 0, 0]} material={basic('#26292c')}>
        <planeGeometry args={[400, 200]} />
      </mesh>
      {/* nosso prédio (fachada abaixo da janela) */}
      <mesh position={[-1, STREET_Y / 2 - 0.2, -8.3]} material={mat('#9a8f80')}>
        <boxGeometry args={[14, -STREET_Y - 0.4, 0.4]} />
      </mesh>
      <Car p={[-16, STREET_Y, -17]} rotY={Math.PI / 2} color="#5a6470" />
      <Car p={[8, STREET_Y, -23]} rotY={-Math.PI / 2} color="#7a2a24" />
      {chaos > 0.1 && <Car p={[-4, STREET_Y + 0.1, -21]} rotY={0.9} color="#3a3634" wreck />}
      {chaos > 0.2 && <Ambulance p={[4 + Math.max(0, 40 - t * 1.2), STREET_Y, -17.2]} rotY={-Math.PI / 2} t={t} />}
      {/* incêndios e fumaça: carro em chamas na rua + colunas distantes nascendo atrás dos prédios */}
      {chaos > 0.1 && !bench.noSmoke && (
        <>
          <Fire p={[-4, STREET_Y + 0.6, -21]} t={t} />
          <Smoke origin={[-4, STREET_Y + 1.5, -21]} t={t} amount={Math.min(0.55, chaos)} seed={2} />
          <Smoke origin={[-35, STREET_Y, -95]} t={t + 13} amount={Math.min(1.2, chaos * 1.8)} seed={4} color="#7a7774" />
        </>
      )}
      {chaos > 0.45 && !bench.noSmoke && <Smoke origin={[40, STREET_Y, -120]} t={t + 40} amount={chaos * 1.5} seed={5} color="#85807a" />}
      {children}
    </group>
  );
};
