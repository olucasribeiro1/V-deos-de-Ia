import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mat, PAL} from '../../library/materials';

export type PhoneScreen =
  | {kind: 'off'}
  | {kind: 'lock'; time: string}
  | {kind: 'incoming'; name: string; pulse: number}
  | {kind: 'call'; name: string; seconds: number}
  | {kind: 'ended'; name: string; seconds: number}
  | {kind: 'alert'; title: string; body: string; time: string};

const texCache = new Map<string, THREE.CanvasTexture>();

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  ctx.fillText(line, x, y);
}

/** Textura da tela desenhada em canvas 2D; recriada só quando o conteúdo muda (cache por chave). */
function screenTexture(s: PhoneScreen) {
  const key = JSON.stringify(s.kind === 'incoming' ? {...s, pulse: Math.round(s.pulse * 4) / 4} : s);
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, 512);
  if (s.kind === 'alert') {
    bg.addColorStop(0, '#2a1416');
    bg.addColorStop(1, '#120a0b');
  } else {
    bg.addColorStop(0, '#1d2a33');
    bg.addColorStop(1, '#0b1014');
  }
  g.fillStyle = s.kind === 'off' ? '#050505' : bg;
  g.fillRect(0, 0, 256, 512);
  g.textAlign = 'center';
  g.fillStyle = '#e8eef2';
  const font = (px: number, w = 500) => `${w} ${px}px "DejaVu Sans", Arial, sans-serif`;
  if (s.kind === 'lock') {
    g.font = font(64, 300);
    g.fillText(s.time, 128, 150);
    g.font = font(16);
    g.fillText('sábado, 21 de novembro', 128, 180);
  }
  if (s.kind === 'incoming' || s.kind === 'call' || s.kind === 'ended') {
    g.font = font(15);
    g.fillStyle = '#9fb1bd';
    g.fillText(s.kind === 'incoming' ? 'chamada recebida' : s.kind === 'call' ? fmt(s.seconds) : 'chamada encerrada', 128, 120);
    g.fillStyle = '#e8eef2';
    g.font = font(34, 600);
    g.fillText(s.name, 128, 165);
    // avatar
    g.fillStyle = '#3c5566';
    g.beginPath();
    g.arc(128, 255, 46, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#e8eef2';
    g.font = font(40, 600);
    g.fillText(s.name[0], 128, 270);
    if (s.kind === 'incoming') {
      const r = 26 + s.pulse * 6;
      g.fillStyle = '#c0392b';
      g.beginPath();
      g.arc(70, 430, 26, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#27ae60';
      g.beginPath();
      g.arc(186, 430, r, 0, Math.PI * 2);
      g.fill();
    } else if (s.kind === 'call') {
      g.fillStyle = '#c0392b';
      g.beginPath();
      g.arc(128, 430, 28, 0, Math.PI * 2);
      g.fill();
    } else {
      g.fillStyle = '#9fb1bd';
      g.font = font(18);
      g.fillText(fmt(s.seconds), 128, 340);
      g.fillStyle = '#e06666';
      g.fillText('sem sinal', 128, 430);
    }
  }
  if (s.kind === 'alert') {
    g.font = font(54, 300);
    g.fillStyle = '#e8eef2';
    g.fillText(s.time, 128, 95);
    g.fillStyle = 'rgba(255,255,255,0.93)';
    g.beginPath();
    g.roundRect(14, 150, 228, 210, 14);
    g.fill();
    g.fillStyle = '#b3261e';
    g.font = font(14, 700);
    g.textAlign = 'left';
    g.fillText('⚠ ALERTA DE EMERGÊNCIA', 28, 178);
    g.fillStyle = '#111';
    g.font = font(17, 700);
    wrap(g, s.title, 28, 206, 200, 21);
    g.font = font(14);
    wrap(g, s.body, 28, 262, 200, 18);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

/** Celular low poly. Origem = centro do aparelho; tela voltada para +Z. */
export const Phone: React.FC<{screen: PhoneScreen; glow?: number}> = ({screen, glow = 1}) => {
  const tex = useMemo(() => screenTexture(screen), [JSON.stringify(screen)]);
  const screenMat = useMemo(
    () => new THREE.MeshBasicMaterial({map: tex, color: new THREE.Color(glow, glow, glow), toneMapped: false}),
    [tex, glow],
  );
  return (
    <group>
      <mesh material={mat(PAL.black, {rough: 0.4, metal: 0.3})}>
        <boxGeometry args={[0.074, 0.152, 0.009]} />
      </mesh>
      <mesh position={[0, 0, 0.0047]} material={screenMat}>
        <planeGeometry args={[0.067, 0.142]} />
      </mesh>
      {/* luz sempre montada: trocar a contagem de luzes recompila shaders (custo alto por frame) */}
      <pointLight position={[0, 0, 0.08]} color="#9cc4e4" intensity={screen.kind === 'off' ? 0 : 0.025 * glow} distance={0.25} decay={2} />
    </group>
  );
};
