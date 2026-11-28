import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../lib/constants';
import {clamp} from '../lib/anim';

/**
 * "O rastro": electric-blue vertical tear left in the air where a jumper was.
 * `life` goes 0 -> 1 over the effect (opens fast, then seals and fades).
 * (x, y) = ground point under the tear, `height` = tear height in px.
 */
export const Rastro: React.FC<{x: number; y: number; height: number; life: number; seed?: string; frame: number}> = ({
  x,
  y,
  height,
  life,
  seed = 'r',
  frame,
}) => {
  if (life <= 0 || life >= 1) return null;
  const open = clamp(life / 0.08);
  const close = 1 - clamp((life - 0.15) / 0.85);
  const width = height * 0.16 * open * (0.25 + 0.75 * close * close);
  const alpha = Math.min(1, open * 1.2) * (0.25 + 0.75 * close);
  const top = y - height * 1.05;
  const N = 22;
  const jag = (k: number, amp: number) =>
    Array.from({length: N + 1}).map((_, i) => {
      const ty = top + (height * 1.05 * i) / N;
      const env = Math.sin((i / N) * Math.PI);
      const j = (random(`${seed}-${k}-${i}-${Math.floor(frame / 2)}`) - 0.5) * amp * env;
      return [x + j, ty] as [number, number];
    });
  const core = jag(0, width * 0.9);
  const edgeL = core.map(([px, py], i) => [px - width * Math.sin((i / N) * Math.PI) * 0.5, py] as [number, number]);
  const edgeR = core.map(([px, py], i) => [px + width * Math.sin((i / N) * Math.PI) * 0.5, py] as [number, number]).reverse();
  const tear = `M${[...edgeL, ...edgeR].map((p) => p.join(',')).join(' L')} Z`;
  const coreD = `M${core.map((p) => p.join(',')).join(' L')}`;
  const arcs = Array.from({length: 7}).map((_, k) => {
    const i0 = 3 + Math.floor(random(`${seed}-arc-${k}`) * (N - 6));
    const [sx, sy] = core[i0];
    const dir = random(`${seed}-dir-${k}`) > 0.5 ? 1 : -1;
    const len = height * (0.08 + random(`${seed}-len-${k}-${Math.floor(frame / 3)}`) * 0.14) * close;
    const pts = Array.from({length: 5}).map((__, s) => {
      const tt = s / 4;
      return [sx + dir * len * tt, sy + (random(`${seed}-a-${k}-${s}-${frame}`) - 0.5) * len * 0.6 + len * 0.3 * tt] as [number, number];
    });
    return `M${pts.map((p) => p.join(',')).join(' L')}`;
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* big soft glow */}
      <div
        style={{
          position: 'absolute',
          left: x - height * 0.45,
          top: top - height * 0.1,
          width: height * 0.9,
          height: height * 1.3,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(90,190,255,0.75) 0%, rgba(40,120,255,0.35) 35%, rgba(30,80,255,0) 70%)',
          opacity: alpha,
          mixBlendMode: 'screen',
          filter: 'blur(10px)',
        }}
      />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible', mixBlendMode: 'screen', opacity: alpha}}>
        <defs>
          <filter id={`${seed}-glow`} x="-100%" y="-20%" width="300%" height="140%">
            <feGaussianBlur stdDeviation={Math.max(2, width * 0.35)} />
          </filter>
          <linearGradient id={`${seed}-tear`} x1="0" x2="1">
            <stop offset="0" stopColor="#1f6bff" />
            <stop offset="0.5" stopColor="#bff3ff" />
            <stop offset="1" stopColor="#1f6bff" />
          </linearGradient>
        </defs>
        <path d={tear} fill="#38a8ff" filter={`url(#${seed}-glow)`} />
        <path d={tear} fill={`url(#${seed}-tear)`} />
        <path d={coreD} stroke="#ffffff" strokeWidth={Math.max(2, width * 0.18)} fill="none" strokeLinejoin="round" />
        {arcs.map((d, i) => (
          <path key={i} d={d} stroke="#a8e6ff" strokeWidth={3} fill="none" strokeLinejoin="round" opacity={0.9} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Full-frame light flash, `k` 0..1 */
export const Flash: React.FC<{k: number; color?: string}> = ({k, color = '200,235,255'}) =>
  k <= 0 ? null : (
    <AbsoluteFill style={{background: `rgba(${color},${k})`, mixBlendMode: 'screen', pointerEvents: 'none'}} />
  );
