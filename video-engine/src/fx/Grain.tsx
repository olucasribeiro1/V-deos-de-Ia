import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {H, W} from '../lib/constants';

/** Animated film grain (SVG turbulence, reseeded every frame). */
export const Grain: React.FC<{opacity?: number; scale?: number}> = ({opacity = 0.09, scale = 0.85}) => {
  const frame = useCurrentFrame();
  const id = `grain-${frame % 12}`;
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency={scale} numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Soft dark vignette. */
export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.55, color = '20,10,25'}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 62% at 50% 48%, rgba(${color},0) 55%, rgba(${color},${strength}) 100%)`,
    }}
  />
);
