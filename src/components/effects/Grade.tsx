import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * "Pós-processamento" econômico em camada 2D (custo ~0 no render, sem passes WebGL extras):
 * vinheta, gradação fria/dessaturada, granulação determinística discreta, flash de perigo.
 */
export const Grade: React.FC<{vignette?: number; grain?: number; danger?: number; tint?: string; fade?: number}> = ({
  vignette = 0.55,
  grain = 0.045,
  danger = 0,
  tint = 'rgba(40,60,70,0.10)',
  fade = 0,
}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: tint, mixBlendMode: 'soft-light'}} />
      <AbsoluteFill
        style={{background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignette}) 100%)`}}
      />
      {danger > 0 && (
        <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 35%, rgba(120,8,10,${0.45 * danger}) 100%)`}} />
      )}
      {grain > 0 && (
        <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay'}}>
          <svg width="100%" height="100%">
            <filter id={`g${f % 8}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 8} />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#g${f % 8})`} />
          </svg>
        </AbsoluteFill>
      )}
      {fade > 0 && <AbsoluteFill style={{background: '#000', opacity: fade}} />}
    </>
  );
};
