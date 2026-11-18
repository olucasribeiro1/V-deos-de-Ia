import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain, Vignette} from '../fx/Grain';

/** Shared finishing layer: vignette + grain. */
export const Finish: React.FC<{vignette?: number; grain?: number; tint?: string}> = ({vignette = 0.5, grain = 0.1, tint}) => (
  <>
    {tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'soft-light', pointerEvents: 'none'}} />}
    <Vignette strength={vignette} />
    <Grain opacity={grain} />
  </>
);
