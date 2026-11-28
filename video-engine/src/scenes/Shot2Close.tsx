import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Copacabana} from '../environments/Copacabana';
import {PlacedDavi} from '../characters/Davi';
import {Cam} from '../lib/camera';
import {H} from '../lib/constants';
import {kf, wobble} from '../lib/anim';
import {Particles} from '../fx/Particles';
import {Finish} from './common';
import {DAVI_SPOT} from './Shot1Calcadao';

/** 3–5 s: close-up on Davi, slow blink, half smile. */
export const Shot2Close: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const p = kf(frame, [0, durationInFrames], [0, 1], (x) => x);
  const dist = 1.45 - p * 0.22;
  const cam: Cam = {x: DAVI_SPOT.x + 0.12 - p * 0.05, y: 1.42, z: DAVI_SPOT.z - dist, pitch: -3, f: 1650, cy: H * 0.5};
  const blink = kf(frame, [14, 17, 20, 23], [0, 1, 1, 0], (x) => x);
  const half = kf(frame, [26, 40], [0, 1]);
  return (
    <AbsoluteFill>
      <Copacabana
        cam={cam}
        t={t + 3}
        focus={dist}
        aperture={16}
        actors={[
          {
            key: 'davi',
            x: DAVI_SPOT.x,
            z: DAVI_SPOT.z,
            render: ({sx, sy, ppm}) => (
              <PlacedDavi
                x={sx}
                y={sy + Math.sin(t * 2.2) * 3}
                height={ppm * 1.75}
                pose={{headTilt: -2 + wobble(t * 0.6, 4) * 1.5 + half * 2, facing: 0.12}}
                expr={{blink, halfSmile: half * 0.9, smile: half * 0.25, browRaise: half * 0.3, browAsym: half * 0.5, lookX: kf(frame, [0, 12], [-0.3, 0.15])}}
              />
            ),
          },
        ]}
      />
      <Particles t={t + 3} seed="s2" count={30} bokeh={10} driftX={-20} />
      <Finish vignette={0.55} />
    </AbsoluteFill>
  );
};
