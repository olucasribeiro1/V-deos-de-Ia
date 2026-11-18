import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../lib/constants';

/**
 * Floating dust motes + soft bokeh discs. `t` in seconds, `drift` px/s camera-relative drift
 * (pass the camera pan speed to get parallax).
 */
export const Particles: React.FC<{
  t: number;
  seed?: string;
  count?: number;
  bokeh?: number;
  color?: string;
  bokehColor?: string;
  driftX?: number;
}> = ({t, seed = 'dust', count = 40, bokeh = 8, color = '255,226,180', bokehColor = '255,200,140', driftX = 0}) => {
  const dots = Array.from({length: count}).map((_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const speed = 8 + r('s') * 22;
    const x = (((r('x') * W + Math.sin(t * 0.6 + i) * 30 + driftX * t * (0.5 + r('p'))) % W) + W) % W;
    const y = ((((r('y') * H - t * speed) % H) + H) % H);
    const size = 1.5 + r('r') * 3.5;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + r('t') * 2) + i));
    return <circle key={i} cx={x} cy={y} r={size} fill={`rgba(${color},${0.55 * tw})`} />;
  });
  const discs = Array.from({length: bokeh}).map((_, i) => {
    const r = (k: string) => random(`${seed}-b-${i}-${k}`);
    const x = (((r('x') * W + driftX * t * 1.4 + Math.sin(t * 0.3 + i) * 20) % (W + 300)) + W + 300) % (W + 300) - 150;
    const y = r('y') * H;
    const size = 40 + r('r') * 90;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x - size,
          top: y - size,
          width: size * 2,
          height: size * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${bokehColor},${0.22 + r('o') * 0.18}) 0%, rgba(${bokehColor},0.12) 60%, rgba(${bokehColor},0) 72%)`,
          filter: 'blur(3px)',
        }}
      />
    );
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {discs}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {dots}
      </svg>
    </AbsoluteFill>
  );
};

/** Diagonal warm light rays from a point (sun). */
export const LightRays: React.FC<{x: number; y: number; t: number; opacity?: number; color?: string}> = ({x, y, t, opacity = 0.18, color = '255,214,150'}) => (
  <AbsoluteFill style={{mixBlendMode: 'screen', opacity, pointerEvents: 'none', filter: 'blur(14px)'}}>
    <svg width={W} height={H}>
      {Array.from({length: 9}).map((_, i) => {
        const a = (-60 + i * 15 + Math.sin(t * 0.5 + i) * 2) * (Math.PI / 180) + Math.PI / 2;
        const len = 2600;
        const spread = 0.035 + (i % 3) * 0.015;
        const x1 = x + Math.cos(a - spread) * len;
        const y1 = y + Math.sin(a - spread) * len;
        const x2 = x + Math.cos(a + spread) * len;
        const y2 = y + Math.sin(a + spread) * len;
        return <path key={i} d={`M${x},${y} L${x1},${y1} L${x2},${y2} Z`} fill={`rgba(${color},${0.5 - (i % 2) * 0.25})`} />;
      })}
    </svg>
  </AbsoluteFill>
);
