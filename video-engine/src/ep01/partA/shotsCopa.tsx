import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Copacabana} from '../../environments/Copacabana';
import {PlacedDavi, DAVI_OUTFIT} from '../../characters/Davi';
import {PlacedPuppet, PuppetSvg} from '../../characters/Puppet';
import {PlacedAgent, AGENT_OUTFITS} from '../../characters/Agent';
import {Head} from '../../characters/parts';
import {Davi} from '../../characters/Davi';
import {SUNSET_LIGHT} from '../../characters/types';
import {Cam, project, projectDir} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, wobble} from '../../lib/anim';
import {LightRays, Particles} from '../../fx/Particles';
import {Flash, Rastro} from '../../fx/Rastro';
import {AirMolecules} from '../../fx/AirMolecules';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Cam2D, RedCan, ShotProps, atS, wristR} from './kit';
import {useUid} from '../../lib/useUid';

const SPOT = {x: 0.35, z: 9};

/** S1 — wide calçadão at sunset, fast push-in on Davi. */
export const S01Wide: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const p = kf(frame, [0, d], [0, 1], (x) => 1 - Math.pow(1 - x, 2.2));
  const cam: Cam = {x: -0.7 + p * 0.95, y: 1.3 - p * 0.12, z: 0.6 + p * 5.4, pitch: -1.5, f: 1650, cy: H * 0.47};
  const sun = projectDir(cam, -0.18, 0.05, 1);
  return (
    <Cam2D d={d} zoom={[1.0, 1.06]} roll={[-1.2, 0.4]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={SPOT.z - cam.z}
        aperture={9}
        actors={[
          {
            key: 'davi',
            x: SPOT.x,
            z: SPOT.z,
            shadow: 1,
            render: ({sx, sy, ppm}) => (
              <PlacedDavi x={sx} y={sy} height={ppm * 1.75} pose={{bob: Math.sin(t * 2.2) * 4, facing: 0.15, shL: -9, elL: 10, shR: 6, elR: -8}} expr={{lookX: kf(frame, [10, 30], [0.5, -0.1]), smile: 0.1}} />
            ),
          },
        ]}
      />
      <LightRays x={sun.sx} y={sun.sy} t={t} opacity={0.16} />
      <Particles t={t} seed="a1" driftX={-14} />
      <Finish vignette={0.5} />
    </Cam2D>
  );
};

/** S2 — close-up: Davi blinks, half smile. */
export const S02Close: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 1.6;
  const p = kf(frame, [0, d], [0, 1], (x) => x);
  const dist = 1.6 - p * 0.35;
  const cam: Cam = {x: SPOT.x + 0.16 - p * 0.08, y: 1.42, z: SPOT.z - dist, pitch: -3, f: 1650, cy: H * 0.5};
  const blink = kf(frame, [6, 8, 10, 12], [0, 1, 1, 0], (x) => x);
  const half = kf(frame, [12, 22], [0, 1]);
  return (
    <Cam2D d={d} zoom={[1.04, 1.12]} roll={[1.5, -0.5]} whip="zoom">
      <Copacabana
        cam={cam}
        t={t}
        focus={dist}
        aperture={16}
        actors={[
          {
            key: 'davi',
            x: SPOT.x,
            z: SPOT.z,
            render: ({sx, sy, ppm}) => (
              <PlacedDavi
                x={sx}
                y={sy + Math.sin(t * 2.2) * 3}
                height={ppm * 1.75}
                pose={{headTilt: -2 + half * 2.5, facing: 0.12}}
                expr={{blink, halfSmile: half * 0.9, smile: half * 0.25, browRaise: half * 0.3, browAsym: half * 0.5, lookX: 0.15}}
              />
            ),
          },
        ]}
      />
      <Particles t={t} seed="a2" count={30} bokeh={10} driftX={-20} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/** Davi standing at SPOT who vanishes with the Rastro at local frame `at` (optionally holding the can). */
const VanishShot: React.FC<ShotProps & {at: number; can?: boolean; camP: (p: number) => Cam; seed: string; tOff: number}> = ({d, at, can, camP, seed, tOff}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + tOff;
  const cam = camP(frame / d);
  const foot = project(cam, SPOT.x, 0, SPOT.z)!;
  const hpx = foot.ppm * 1.75;
  const gone = frame >= at;
  const life = (frame - at + 1) / 30;
  const anticip = kf(frame, [0, at - 1], [0, 1]);
  const chestY = foot.sy - hpx * 0.62;
  const shR = can ? 40 : 9 + anticip * 6;
  const elR = can ? 75 : -6;
  const wr = wristR(shR, elR);
  return (
    <Cam2D d={d} zoom={[1.02, 1.1]} shakes={[{at, dur: 14, amp: 22, seed: 3}]} punches={[{at, amt: 0.06}]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={foot.depth}
        aperture={11}
        actors={[
          {
            key: 'davi',
            x: SPOT.x,
            z: SPOT.z,
            shadow: gone ? 0 : 1,
            render: ({sx, sy, ppm}) =>
              gone ? null : (
                <PlacedPuppet
                  outfit={DAVI_OUTFIT}
                  x={sx}
                  y={sy}
                  height={ppm * 1.75}
                  pose={{bob: anticip * 10, facing: 0.1, shL: -9 - anticip * 6, shR, elR, headTilt: -anticip * 2}}
                  expr={{blink: kf(frame, [at - 4, at - 2], [0, 1], (x) => x), halfSmile: 0.9, smile: 0.2, browAsym: 0.4}}
                >
                  {can && (
                    <g transform={`translate(${wr[0] + 6},${wr[1] - 30}) scale(0.62)`}>
                      <RedCan />
                    </g>
                  )}
                </PlacedPuppet>
              ),
          },
        ]}
      />
      {gone && (
        <AbsoluteFill style={{mixBlendMode: 'screen'}}>
          <PuppetSvg
            height={hpx}
            outfit={DAVI_OUTFIT}
            pose={{facing: 0.1, shL: -15, shR: 15}}
            ghost={{opacity: kf(frame, [at, at + 4, d], [0, 1, 0.5]), color: '#8fd3ff', dash: 22}}
            style={{left: foot.sx - 350 * (hpx / 1000), top: foot.sy - 1100 * (hpx / 1000)}}
          />
        </AbsoluteFill>
      )}
      {gone && (
        <AirMolecules cx={foot.sx} cy={chestY} rx={hpx * 0.2} ry={hpx * 0.42} spread={3} progress={clamp((frame - at - 1) / 30)} count={50} size={hpx * 0.022} t={t} seed={seed + 'air'} />
      )}
      <Rastro x={foot.sx} y={foot.sy} height={hpx * 1.05} life={life} frame={frame} seed={seed} />
      <Flash k={kf(frame, [at, at + 1, at + 6], [0, 0.85, 0], (x) => x)} />
      <Particles t={t} seed={seed + 'p'} count={26} bokeh={6} driftX={-10} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/** S3 — "que já viu?": he vanishes. */
export const S03Vanish: React.FC<ShotProps> = ({start, d}) => (
  <VanishShot
    start={start}
    d={d}
    at={atS(start, 2.6)}
    seed="a3"
    tOff={2.5}
    camP={(p) => ({x: SPOT.x - 0.45 + p * 0.2, y: 1.05, z: SPOT.z - 3.9 + p * 0.6, pitch: -4, f: 1650, cy: H * 0.5})}
  />
);

/** S15 — "do Rio pro Japão": holding the can, he jumps. */
export const S15CanJump: React.FC<ShotProps> = ({start, d}) => (
  <VanishShot
    start={start}
    d={d}
    at={atS(start, 16.12)}
    can
    seed="a15"
    tOff={15}
    camP={(p) => ({x: SPOT.x + 0.5 - p * 0.25, y: 1.15, z: SPOT.z - 3.4 + p * 0.5, pitch: -2, f: 1650, cy: H * 0.5})}
  />
);

/** S6 — "Pro Davi,": medium shot, HUD DAVI 19 anos. */
export const S06DaviTag: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 6;
  const p = kf(frame, [0, d], [0, 1], (x) => x);
  const cam: Cam = {x: SPOT.x - 0.05 + p * 0.2, y: 1.2, z: SPOT.z - 3.2 + p * 0.5, pitch: -2, f: 1650, cy: H * 0.52};
  const foot = project(cam, SPOT.x, 0, SPOT.z)!;
  const hpx = foot.ppm * 1.75;
  return (
    <Cam2D d={d} whip="right" zoom={[1.0, 1.05]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={foot.depth}
        aperture={12}
        actors={[
          {
            key: 'davi',
            x: SPOT.x,
            z: SPOT.z,
            shadow: 1,
            render: ({sx, sy, ppm}) => (
              <PlacedDavi x={sx} y={sy} height={ppm * 1.75} pose={{facing: -0.3, headTilt: 3, shL: -6, shR: 8, bob: Math.sin(t * 2.2) * 4}} expr={{lookX: -0.7, halfSmile: 0.5, browAsym: 0.3}} />
            ),
          },
        ]}
      />
      <Particles t={t} seed="a6" count={24} bokeh={6} driftX={-30} />
      <HudLabel label="DAVI" value={19} unit="ANOS" x={foot.sx - hpx * 0.24} y={560} align="right" tx={foot.sx - hpx * 0.06} ty={foot.sy - hpx * 0.86} from={3} />
      <Finish vignette={0.5} />
    </Cam2D>
  );
};

/** Black sedan, side view. Local units cm, origin at ground centre. `door` 0 closed .. 1 open (rear door). */
const BlackCar: React.FC<{door: number}> = ({door}) => {
  const id = useUid('car');
  const doorX = -40; // hinge (front edge of rear door)
  const doorW = 110;
  const sx = 1 - door * 1.35;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3a3d48" />
          <stop offset="0.35" stopColor="#14151b" />
          <stop offset="0.6" stopColor="#0a0a0e" />
          <stop offset="1" stopColor="#1b1c22" />
        </linearGradient>
        <linearGradient id={id + 'g'} x1="0" x2="1">
          <stop offset="0" stopColor="#6b5a6a" />
          <stop offset="0.5" stopColor="#1d1f2a" />
          <stop offset="1" stopColor="#3a3346" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={-2} rx={260} ry={14} fill="#000" opacity={0.45} />
      {/* body */}
      <path d="M-240,-38 L-244,-80 Q-240,-96 -200,-100 L-150,-104 Q-110,-150 -60,-152 L70,-152 Q120,-150 160,-108 L226,-100 Q248,-96 246,-70 L244,-38 Z" fill={`url(#${id})`} />
      {/* windows */}
      <path d="M-138,-106 Q-104,-142 -62,-144 L-4,-144 L-4,-106 Z" fill={`url(#${id + 'g'})`} />
      <path d="M6,-106 L6,-144 L66,-144 Q110,-142 144,-108 Z" fill={`url(#${id + 'g'})`} />
      {/* sunset reflection line */}
      <path d="M-236,-84 L236,-84" stroke="#ffcf8a" strokeWidth={3} opacity={0.65} />
      <path d="M-140,-104 Q-100,-150 -60,-150 L70,-150" stroke="#ffd9a6" strokeWidth={3} fill="none" opacity={0.5} />
      {/* door seams */}
      <path d="M-40,-104 L-40,-40 M60,-104 L60,-40" stroke="#000" strokeWidth={3} opacity={0.8} />
      {/* wheels */}
      {[-160, 160].map((x) => (
        <g key={x}>
          <circle cx={x} cy={-34} r={36} fill="#0b0b0d" />
          <circle cx={x} cy={-34} r={18} fill="#5b5f68" />
          <circle cx={x} cy={-34} r={6} fill="#22242a" />
        </g>
      ))}
      {/* open rear door swinging toward camera */}
      {door > 0.01 && (
        <g transform={`translate(${doorX},0) scale(${sx},1) translate(${-doorX},0)`}>
          <path d={`M${doorX},-146 L${doorX + doorW * 0.85},-146 Q${doorX + doorW},-120 ${doorX + doorW},-104 L${doorX + doorW},-40 L${doorX},-40 Z`} fill={sx < 0 ? '#2a2b31' : `url(#${id})`} stroke="#000" strokeWidth={3} />
          {sx < 0 && <rect x={doorX + 14} y={-96} width={doorW - 28} height={44} rx={6} fill="#3d3f47" />}
        </g>
      )}
      {door > 0.01 && <path d={`M${doorX},-104 L${doorX + doorW},-104 L${doorX + doorW},-40 L${doorX},-40 Z`} fill="#050507" opacity={0.85} />}
    </g>
  );
};

/** S4 — low angle: black car door opens, 3 suits step out. */
export const S04Car: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 3.7;
  const p = kf(frame, [0, d], [0, 1], (x) => x);
  const cam: Cam = {x: 0.55 - p * 0.15, y: 0.25, z: 4.6 + p * 1.4, pitch: -10, f: 1500, cy: H * 0.62};
  const door = kf(frame, [0, 8], [0.15, 1], easeOut);
  const carZ = 10.5;
  const step1 = kf(frame, [2, 20], [0, 1], easeOut);
  const step2 = kf(frame, [8, 26], [0, 1], easeOut);
  return (
    <Cam2D d={d} zoom={[1.05, 1.12]} whip="left" shakes={[{at: 4, dur: 8, amp: 8}]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={carZ - cam.z - 1.5}
        aperture={10}
        cold={0.15}
        actors={[
          {
            key: 'car',
            x: 0.4,
            z: carZ,
            render: ({sx, sy, ppm}) => (
              <svg style={{position: 'absolute', left: sx - 2.7 * ppm, top: sy - 1.8 * ppm, overflow: 'visible'}} width={5.4 * ppm} height={1.9 * ppm} viewBox="-270 -180 540 190">
                <BlackCar door={door} />
              </svg>
            ),
          },
          {
            key: 'agB',
            x: 1.6,
            z: carZ + 1.2,
            render: ({sx, sy, ppm}) => <PlacedAgent variant="agentB" x={sx} y={sy} height={ppm * 1.8} pose={{facing: -0.2, shL: -5, shR: 5}} expr={{browTilt: -0.5}} />,
          },
          {
            key: 'ag1',
            x: 0.05 - step1 * 0.5,
            z: carZ - 0.6 - step1 * 1.2,
            render: ({sx, sy, ppm}) => (
              <PlacedAgent variant="agentA" x={sx} y={sy - (1 - step1) * ppm * 0.25} height={ppm * 1.8} pose={{facing: -0.2, hipL: -10 + step1 * 18, hipR: 14 - step1 * 18, knL: 10, shL: -12, shR: 10}} expr={{browTilt: -0.6}} />
            ),
          },
          {
            key: 'rocha',
            x: 0.9 + step2 * 0.4,
            z: carZ - 0.9 - step2 * 2.0,
            render: ({sx, sy, ppm}) => (
              <PlacedAgent variant="rocha" x={sx} y={sy} height={ppm * 1.8} pose={{facing: 0.15, hipL: 10 - step2 * 16, hipR: -12 + step2 * 16, knR: 12, shL: -6, shR: 6}} expr={{halfSmile: 0.7, browAsym: 0.4}} />
            ),
          },
        ]}
      />
      <Particles t={t} seed="a4" count={20} bokeh={5} driftX={-10} />
      <Finish vignette={0.6} tint="rgba(40,30,80,0.5)" />
    </Cam2D>
  );
};

/** S5 — extreme close on Rocha; Davi reflected in the sunglasses. */
export const S05Reflection: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 4.7;
  const p = kf(frame, [0, d], [0, 1], easeOut);
  const cam: Cam = {x: SPOT.x - 1.2, y: 1.6, z: 2, pitch: 0, f: 1650, cy: H * 0.5};
  const k = 4.4 + p * 0.9;
  const cx = W / 2 - 30;
  const cy = H * 0.5 + 60;
  const lens = useUid('lens');
  const rocha = AGENT_OUTFITS.rocha;
  return (
    <Cam2D d={d} zoom={[1, 1.1]} origin={[cx + 42 * k, cy]} roll={[-2, 1]}>
      <AbsoluteFill style={{transform: 'scale(1.1)'}}>
        <Copacabana cam={cam} t={t} focus={0.4} aperture={24} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <clipPath id={lens}>
            {[-1, 1].map((s) => (
              <rect key={s} x={s * 42 - 33} y={-24} width={66} height={42} rx={14} />
            ))}
          </clipPath>
          <linearGradient id={lens + 's'} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3b2a4a" />
            <stop offset="0.55" stopColor="#d8875a" />
            <stop offset="0.62" stopColor="#ffd59a" />
            <stop offset="0.66" stopColor="#3a3346" />
            <stop offset="1" stopColor="#100c16" />
          </linearGradient>
        </defs>
        <g transform={`translate(${cx},${cy}) scale(${k})`}>
          {/* suit shoulders */}
          <path d="M-200,240 Q-190,140 -60,118 L60,118 Q190,140 200,240 L200,400 L-200,400 Z" fill="#3f434b" />
          <path d="M-30,118 L0,190 L30,118 Z" fill="#eef0f3" />
          <rect x={-34} y={90} width={68} height={50} rx={18} fill={rocha.skin.shade} />
          <Head skin={rocha.skin} style={rocha.head} expr={{halfSmile: 0.6 + p * 0.3, smile: 0.15, browAsym: 0.4, browTilt: -0.3}} light={SUNSET_LIGHT} facing={0.05} />
          {/* reflection inside the lenses */}
          <g transform="translate(1.5,0)" clipPath={`url(#${lens})`}>
            <rect x={-80} y={-26} width={160} height={46} fill={`url(#${lens + 's'})`} opacity={0.85} />
            {[-1, 1].map((s) => (
              <g key={s} transform={`translate(${s * 42 + 4 - p * 3},${12}) scale(${0.026 + p * 0.004})`}>
                <Davi pose={{facing: 0.1}} expr={{halfSmile: 0.6}} />
              </g>
            ))}
            <path d="M-80,-30 L-50,-30 L-90,30 Z M-10,-30 L5,-30 L-30,30 Z M30,-30 L45,-30 L10,30 Z M70,-30 L85,-30 L50,30 Z" fill="#fff" opacity={0.14} />
          </g>
        </g>
      </svg>
      <Particles t={t} seed="a5" count={18} bokeh={8} driftX={-20} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};
