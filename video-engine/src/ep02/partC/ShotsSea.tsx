import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Rig, Svg, useShot} from './kit';
import {ColdSea, Spray} from './sea';
import {Clock, Thermometer} from './props';
import {Splash, SwimHead} from '../../ep01/partC/Ocean';
import {PlacedDavi} from '../../characters/Davi';
import {LIA_OUTFIT} from '../../characters/Lia';
import {Flash, Rastro} from '../../fx/Rastro';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Cam, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';

const T0 = 500;
const COLD = 'rgba(60,120,170,0.22)';

/** c16 — "Pra ele, um mergulho.": Davi pops out of a Rastro over the cold sea and drops in. */
export const DaviDive: React.FC = () => {
  const {frame, t, p} = useShot();
  const IN = 2;
  const cam: Cam = {x: 0, y: 2.2, z: -p * 0.8, pitch: 6, f: 1300, cy: H * 0.46};
  const tt = Math.max(0, frame - IN) / 30;
  const y0 = 2.6;
  const y = y0 - 0.5 * 9.8 * tt * tt;
  const HIT = IN + Math.round(Math.sqrt((2 * y0) / 9.8) * 30);
  const inAir = frame >= IN && frame < HIT;
  const P = {x: 0.2, z: 7};
  const top = project(cam, P.x, 0, P.z)!;
  return (
    <Rig s0={1.0} s1={1.08} r0={-2} r1={1} impacts={[{at: IN, amp: 12}, {at: HIT, amp: 22, zoom: 0.05}]} whipIn="down">
      <ColdSea
        cam={cam}
        t={t + T0}
        swell={1.3}
        actors={
          inAir
            ? [
                {
                  key: 'davi',
                  x: P.x,
                  z: P.z,
                  y: y,
                  render: ({sx, sy, ppm}) => (
                    <PlacedDavi x={sx} y={sy} height={ppm * 1.75} pose={{shL: -165, elL: -5, shR: 165, elR: 5, hipL: -4, hipR: 4, facing: 0.05}} expr={{eyesWide: 0.3, smile: 0.8, mouthOpen: 0.4}} />
                  ),
                },
              ]
            : []
        }
      />
      <Svg>{frame >= HIT && <Splash sx={top.sx} sy={top.sy} ppm={top.ppm} age={frame - HIT} size={1.1} seed="c16s" />}</Svg>
      <Rastro x={top.sx} y={project(cam, P.x, y0, P.z)!.sy} height={top.ppm * 2} life={(frame - IN + 1) / 22} frame={frame} seed="c16r" />
      <Flash k={kf(frame, [IN, IN + 1, IN + 5], [0, 0.6, 0], (x) => x)} />
      <Spray t={t} count={40} seed="c16" opacity={0.35} />
      <HudLabel label="DAVI" value="MERGULHO ✓" x={70} y={1170} tx={top.sx - 30} ty={top.sy - 20} from={HIT} countUp={false} scale={0.9} />
      <AbsoluteFill style={{background: COLD, mixBlendMode: 'multiply'}} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/** Little breath-vapour puffs drifting from (x, y). */
const Vapour: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => (
  <Svg>
    {Array.from({length: 4}).map((_, i) => {
      const ph = (t * 1.6 + i / 4) % 1;
      return <ellipse key={i} cx={x + ph * 160 * s} cy={y - ph * 90 * s} rx={(20 + ph * 70) * s} ry={(14 + ph * 40) * s} fill="#eef6fa" opacity={(1 - ph) * 0.35} style={{filter: 'blur(6px)'}} />;
    })}
  </Svg>
);

/** c17 — "Pra ela, uma hora": Lia's head in the freezing water, shivering. */
export const LiaCold: React.FC = () => {
  const {frame, t, p} = useShot();
  const cam: Cam = {x: 0, y: 0.45 + Math.sin(t * 2) * 0.06, z: -p * 0.3, pitch: -2, f: 1500, cy: H * 0.42};
  const pos = project(cam, 0.05, 0, 2.4)!;
  const shiver = Math.sin(frame * 2.7) * 5 + Math.sin(frame * 4.1) * 3;
  const chatter = 0.12 + 0.12 * Math.abs(Math.sin(frame * 1.9));
  return (
    <Rig s0={1.0} s1={1.1} x0={-20} x1={20} r0={1} r1={-1} whipIn="left" oy={1000}>
      <ColdSea cam={cam} t={t + T0 + 3} swell={1.2} />
      <SwimHead
        sx={pos.sx + shiver}
        sy={pos.sy}
        ppm={pos.ppm}
        outfit={LIA_OUTFIT}
        t={t}
        seed={2}
        facing={0.1}
        tilt={Math.sin(frame * 3) * 2}
        expr={{browTilt: 0.9, browRaise: 0.3, mouthOpen: chatter, eyesWide: 0.25, lookX: -0.2, blink: kf(frame, [16, 18, 20], [0, 1, 0])}}
      />
      <Vapour x={pos.sx + 40} y={pos.sy - pos.ppm * 0.35} t={t} s={1.2} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(120,190,255,0) 40%, rgba(40,80,130,0.5) 100%)'}} />
      <AbsoluteFill style={{background: 'rgba(70,140,210,0.25)', mixBlendMode: 'color'}} />
      <Spray t={t} count={60} seed="c17" opacity={0.5} />
      <HudLabel label="LIA" value="35 °C ↓" x={W - 80} y={1180} align="right" tx={pos.sx + 120} ty={pos.sy - 200} from={8} countUp={false} scale={0.9} />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/** c18 — "até a hipotermia.": thermometer dropping past 35 °C, clock sweeping one hour. */
export const Thermo: React.FC = () => {
  const {frame, t, p} = useShot();
  const temp = lerp(37, 33.5, easeOut(clamp(frame / 26)));
  const k = easeOut(clamp(frame / 26));
  return (
    <Rig s0={1.06} s1={1.0} r0={2} r1={-1} whipIn="right" impacts={[{at: 20, amp: 10}]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #12385a 0%, #071a2c 70%, #030b14 100%)'}} />
      <Svg>
        {Array.from({length: 40}).map((_, i) => {
          const r = (s: string) => random(`c18-${i}-${s}`);
          const y = ((r('y') * H - t * (80 + r('v') * 200)) % H + H) % H;
          return <circle key={i} cx={r('x') * W + Math.sin(t * 3 + i) * 8} cy={y} r={3 + r('r') * 9} fill="none" stroke="#9fd6ff" strokeWidth={2} opacity={0.35} />;
        })}
        <g transform="translate(340,980)">
          <Thermometer h={820} temp={temp} />
        </g>
        <text x={210} y={868} textAnchor="end" fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill="#4fb6ff">
          35°
        </text>
        <g transform="translate(770,800)">
          <Clock r={170} k={k} />
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 560, width: 440, top: 1020, textAlign: 'center', fontFamily: HUD_FONT, color: '#fff', textShadow: '0 0 20px rgba(80,180,255,0.9)'}}>
        <div style={{fontSize: 34, letterSpacing: 6, fontWeight: 700, color: '#9fd6ff'}}>HIPOTERMIA</div>
        <div style={{fontSize: 150, fontWeight: 700, lineHeight: 1}}>
          1<span style={{fontSize: 70}}> h</span>
        </div>
      </div>
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};
