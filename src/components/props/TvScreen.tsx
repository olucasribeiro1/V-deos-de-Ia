import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rng} from '../../systems/animation/math';

/**
 * Tela de TV com telejornal: manchete fixa + faixa de letreiro rolando (offset de textura: sem redesenhar por frame).
 * kind: 'off' | 'news' (plantão) | 'alert' (alerta de emergência) | 'static' (sem sinal).
 */
export type TvKind = 'off' | 'news' | 'alert' | 'static';

const cache = new Map<string, THREE.CanvasTexture>();
function tex(key: string, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, w = 512, h = 288, wrap = false) {
  let t = cache.get(key);
  if (!t) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d')!, w, h);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    if (wrap) t.wrapS = THREE.RepeatWrapping;
    cache.set(key, t);
  }
  return t;
}
const F = (px: number, w = 700) => `${w} ${px}px "DejaVu Sans", Arial, sans-serif`;

export const TvScreen: React.FC<{kind: TvKind; t: number; headline?: string; ticker?: string}> = ({
  kind,
  t,
  headline = 'ONDA DE ATAQUES EM HOSPITAIS DA CAPITAL',
  ticker = 'URGENTE • Autoridades pedem que a população permaneça em casa • Hospitais em alerta máximo • Evite contato com feridos • Trânsito bloqueado no centro • ',
}) => {
  const main = useMemo(
    () =>
      tex(`main|${kind}|${headline}`, (g, w, h) => {
        if (kind === 'static') {
          const r = rng(7); // determinístico (mesma imagem em todas as abas do render)
          for (let i = 0; i < 4000; i++) {
            const v = Math.floor(r() * 255);
            g.fillStyle = `rgb(${v},${v},${v})`;
            g.fillRect(r() * w, r() * h, 3, 2);
          }
          return;
        }
        const bg = g.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, kind === 'alert' ? '#4a0d10' : '#1d3550');
        bg.addColorStop(1, kind === 'alert' ? '#1c0506' : '#0c1624');
        g.fillStyle = bg;
        g.fillRect(0, 0, w, h);
        // "repórter" em silhueta + cenário de estúdio
        g.fillStyle = 'rgba(255,255,255,0.06)';
        for (let i = 0; i < 6; i++) g.fillRect(40 + i * 80, 20, 50, 140);
        g.fillStyle = '#c8a088';
        g.beginPath();
        g.arc(150, 95, 32, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#2a3a52';
        g.fillRect(100, 128, 100, 70);
        g.fillStyle = '#3a2a22';
        g.beginPath();
        g.arc(150, 84, 34, Math.PI, 0);
        g.fill();
        // tarja
        g.fillStyle = kind === 'alert' ? '#e8e4da' : '#c81e22';
        g.fillRect(0, 196, 150, 30);
        g.fillStyle = kind === 'alert' ? '#c81e22' : '#fff';
        g.font = F(18, 900);
        g.fillText(kind === 'alert' ? 'ALERTA' : 'PLANTÃO', 14, 218);
        g.fillStyle = '#f4f1ea';
        g.fillRect(150, 196, w - 150, 30);
        g.fillStyle = '#111';
        g.font = F(15, 800);
        g.fillText(headline, 160, 217);
        g.fillStyle = '#fff';
        g.font = F(14, 700);
        g.fillText('AO VIVO', 440, 30);
        g.fillStyle = '#e03030';
        g.beginPath();
        g.arc(428, 25, 6, 0, Math.PI * 2);
        g.fill();
      }),
    [kind, headline],
  );
  const tick = useMemo(
    () =>
      tex(
        `tick|${ticker}`,
        (g, w, h) => {
          g.fillStyle = '#111';
          g.fillRect(0, 0, w, h);
          g.fillStyle = '#ffd24a';
          g.font = F(20, 700);
          g.fillText(ticker, 8, 25);
        },
        1024,
        36,
        true,
      ),
    [ticker],
  );
  if (kind === 'off') return null;
  tick.offset.x = (t * 0.06) % 1;
  return (
    <group>
      <mesh>
        <planeGeometry args={[1.18, 0.66]} />
        <meshBasicMaterial map={main} toneMapped={false} />
      </mesh>
      {kind !== 'static' && (
        <mesh position={[0, -0.29, 0.002]}>
          <planeGeometry args={[1.18, 0.08]} />
          <meshBasicMaterial map={tick} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};
