import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Copacabana} from '../environments/Copacabana';
import {PlacedDavi} from '../characters/Davi';
import {Cam, projectDir} from '../lib/camera';
import {H} from '../lib/constants';
import {kf, linear, wobble} from '../lib/anim';
import {LightRays, Particles} from '../fx/Particles';
import {Finish} from './common';

export const DAVI_SPOT = {x: 0.35, z: 9};

/** 0–3 s: establishing shot, slow dolly-in on Davi standing on the calçadão at sunset. */
export const Shot1Calcadao: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const p = kf(frame, [0, durationInFrames], [0, 1], (x) => 1 - Math.pow(1 - x, 1.6));
  const cam: Cam = {
    x: -0.6 + p * 0.75,
    y: 1.25 - p * 0.1,
    z: 1.4 + p * 3.9,
    pitch: -1.5,
    f: 1650,
    cy: H * 0.46,
  };
  const sun = projectDir(cam, -0.18, 0.05, 1);
  const breathe = Math.sin(t * 2.2) * 4;
  return (
    <AbsoluteFill>
      <Copacabana
        cam={cam}
        t={t}
        focus={DAVI_SPOT.z - cam.z}
        aperture={9}
        actors={[
          {
            key: 'davi',
            x: DAVI_SPOT.x,
            z: DAVI_SPOT.z,
            shadow: 1,
            render: ({sx, sy, ppm}) => (
              <PlacedDavi
                x={sx}
                y={sy}
                height={ppm * 1.75}
                pose={{bob: breathe, headTilt: wobble(t * 0.5, 2) * 3, facing: 0.15, shL: -9, elL: 10, shR: 6, elR: -8}}
                expr={{lookX: kf(frame, [20, 34, 70, 80], [0.6, -0.4, -0.4, 0]), smile: 0.1, browRaise: 0.1}}
              />
            ),
          },
        ]}
      />
      <LightRays x={sun.sx} y={sun.sy} t={t} opacity={0.16} />
      <Particles t={t} seed="s1" driftX={-12} />
      <Finish vignette={0.5} />
    </AbsoluteFill>
  );
};
