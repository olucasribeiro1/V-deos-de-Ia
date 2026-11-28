import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Copacabana} from '../environments/Copacabana';
import {PlacedDavi} from '../characters/Davi';
import {PuppetSvg} from '../characters/Puppet';
import {DAVI_OUTFIT} from '../characters/Davi';
import {Cam, project} from '../lib/camera';
import {H} from '../lib/constants';
import {clamp, kf, shake} from '../lib/anim';
import {Particles} from '../fx/Particles';
import {Flash, Rastro} from '../fx/Rastro';
import {AirMolecules} from '../fx/AirMolecules';
import {HudLabel} from '../ui/HudLabel';
import {Finish} from './common';
import {DAVI_SPOT} from './Shot1Calcadao';

export const VANISH_AT = 12;

/** 5–7.5 s: Davi vanishes — blue tear, empty silhouette, air molecules rushing in. HUD VÁCUO 70 L. */
export const Shot3Vanish: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const p = frame / durationInFrames;
  const sh = shake(frame, VANISH_AT, 14, 16, 3);
  const cam: Cam = {x: DAVI_SPOT.x - 0.5 + p * 0.25 + sh.x * 0.002, y: 1.05 + sh.y * 0.002, z: DAVI_SPOT.z - 4.1 + p * 0.5, pitch: -4, f: 1650, cy: H * 0.5};
  const foot = project(cam, DAVI_SPOT.x, 0, DAVI_SPOT.z)!;
  const hpx = foot.ppm * 1.75;
  const gone = frame >= VANISH_AT;
  const life = (frame - VANISH_AT + 1) / 34;
  const airP = clamp((frame - VANISH_AT - 2) / 46);
  const ghostO = gone ? kf(frame, [VANISH_AT, VANISH_AT + 4, durationInFrames - 14, durationInFrames], [0, 1, 1, 0.2]) : 0;
  const chestY = foot.sy - hpx * 0.62;
  const anticip = kf(frame, [0, VANISH_AT - 1], [0, 1]);
  return (
    <AbsoluteFill>
      <Copacabana
        cam={cam}
        t={t + 5}
        focus={foot.depth}
        aperture={11}
        actors={[
          {
            key: 'davi',
            x: DAVI_SPOT.x,
            z: DAVI_SPOT.z,
            shadow: gone ? 0 : 1,
            render: ({sx, sy, ppm}) =>
              gone ? null : (
                <PlacedDavi
                  x={sx}
                  y={sy}
                  height={ppm * 1.75}
                  pose={{bob: anticip * 10, facing: 0.1, shL: -9 - anticip * 6, shR: 9 + anticip * 6, headTilt: -anticip * 2}}
                  expr={{blink: kf(frame, [VANISH_AT - 5, VANISH_AT - 2], [0, 1], (x) => x), halfSmile: 0.9, smile: 0.2, browAsym: 0.4}}
                />
              ),
          },
        ]}
      />
      {/* empty silhouette left behind */}
      {gone && (
        <AbsoluteFill style={{mixBlendMode: 'screen'}}>
          <PuppetSvg
            height={hpx}
            outfit={DAVI_OUTFIT}
            pose={{facing: 0.1, shL: -15, shR: 15}}
            ghost={{opacity: ghostO, color: '#8fd3ff', dash: 22}}
            style={{left: foot.sx - 350 * (hpx / 1000), top: foot.sy - 1100 * (hpx / 1000)}}
          />
        </AbsoluteFill>
      )}
      {gone && <AbsoluteFill style={{opacity: kf(frame, [VANISH_AT, VANISH_AT + 5], [0, 1])}}>
      <AirMolecules cx={foot.sx} cy={chestY} rx={hpx * 0.2} ry={hpx * 0.42} spread={3.2} progress={airP} count={70} size={hpx * 0.022} t={t} seed="vac" />
      </AbsoluteFill>}
      <Rastro x={foot.sx} y={foot.sy} height={hpx * 1.05} life={life} frame={frame} seed="r3" />
      <Flash k={kf(frame, [VANISH_AT, VANISH_AT + 1, VANISH_AT + 6], [0, 0.85, 0], (x) => x)} />
      <Particles t={t + 5} seed="s3" count={30} bokeh={6} driftX={-10} />
      <HudLabel label="VÁCUO" value={70} unit="L" x={150} y={560} tx={foot.sx - hpx * 0.06} ty={chestY - hpx * 0.05} from={VANISH_AT + 10} />
      <Finish vignette={0.55} />
    </AbsoluteFill>
  );
};
