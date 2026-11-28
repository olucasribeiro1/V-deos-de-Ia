import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Copacabana} from '../environments/Copacabana';
import {Cam, project} from '../lib/camera';
import {H, W} from '../lib/constants';
import {kf, shake} from '../lib/anim';
import {Particles} from '../fx/Particles';
import {Flash} from '../fx/Rastro';
import {Shockwave} from '../fx/Shockwave';
import {PigeonFlock} from '../fx/Birds';
import {HudLabel} from '../ui/HudLabel';
import {Finish} from './common';
import {DAVI_SPOT} from './Shot1Calcadao';

export const BANG_AT = 3;

/** 7.5–10 s: the air slams shut — shockwave rings, pigeons scatter. HUD ESTALO 140 dB. */
export const Shot4Shockwave: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const p = frame / durationInFrames;
  const sh = shake(frame, BANG_AT, 22, 28, 9);
  const cam: Cam = {
    x: DAVI_SPOT.x + 0.4 - p * 0.5,
    y: 3.4 - p * 0.3,
    z: DAVI_SPOT.z - 7.5 - p * 0.9,
    pitch: 14,
    f: 1500,
    cy: H * 0.5,
  };
  const c = project(cam, DAVI_SPOT.x, 1.0, DAVI_SPOT.z)!;
  const g = project(cam, DAVI_SPOT.x, 0, DAVI_SPOT.z)!;
  const age = frame - BANG_AT;
  return (
    <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}rad) scale(1.04)`}}>
      <Copacabana
        cam={cam}
        t={t + 7.5}
        focus={g.depth}
        aperture={8}
        actors={[
          {
            key: 'birds',
            x: DAVI_SPOT.x,
            z: DAVI_SPOT.z + 0.01,
            sharp: true,
            render: ({sx, sy, ppm}) => (
              <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <PigeonFlock frame={frame} start={BANG_AT} ox={sx} oy={sy + ppm * 0.6} count={16} spread={ppm * 2.4} size={ppm * 0.62} seed="pg4" />
              </svg>
            ),
          },
        ]}
      />
      <Shockwave cx={c.sx} cy={c.sy} age={age} rings={5} speed={30} gap={6} maxR={1700} ground={{cam, x: DAVI_SPOT.x, z: DAVI_SPOT.z, speed: 0.4}} />
      <Flash k={kf(frame, [BANG_AT, BANG_AT + 1, BANG_AT + 7], [0, 0.7, 0], (x) => x)} color="255,240,220" />
      <Particles t={t + 7.5} seed="s4" count={36} bokeh={6} driftX={14} />
      <HudLabel label="ESTALO" value={140} unit="dB" x={W - 120} y={430} align="right" tx={c.sx + 6} ty={c.sy - 6} from={BANG_AT + 12} />
      <Finish vignette={0.55} />
    </AbsoluteFill>
  );
};
