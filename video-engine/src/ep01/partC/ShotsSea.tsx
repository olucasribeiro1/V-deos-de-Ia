import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Buoy, Ocean, Ripples, Splash, SwimHead} from './Ocean';
import {Rig, Svg, useShot} from './kit';
import {Copacabana} from '../../environments/Copacabana';
import {PlacedPuppet} from '../../characters/Puppet';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {AGENT_OUTFITS} from '../../characters/Agent';
import {GloveGrab, SleeveArm} from '../../characters/Closeups';
import {Flash, Rastro} from '../../fx/Rastro';
import {Particles} from '../../fx/Particles';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Cam, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp, shake, wobble} from '../../lib/anim';

const ROCHA = AGENT_OUTFITS.rocha;
const T0 = 86; // seconds offset for shimmer continuity

/** c12 — "E mar é tudo igual": split wipe Copacabana sea | mid-Atlantic sea. */
export const SeaSame: React.FC = () => {
  const {frame, t, p} = useShot();
  const cam: Cam = {x: 0, y: 3.2, z: 40 + p * 2.5, pitch: 16, f: 1500, cy: H * 0.5};
  const split = kf(frame, [0, 10], [W + 40, W / 2], easeOut);
  return (
    <Rig s0={1.04} s1={1.12} r0={-1} r1={1} whipIn="right">
      <Copacabana cam={cam} t={t + T0} focus={30} aperture={3} props={[]} />
      <AbsoluteFill style={{clipPath: `polygon(${split}px 0, ${W}px 0, ${W}px ${H}px, ${split}px ${H}px)`}}>
        <Ocean cam={{...cam, z: 0}} t={t + T0} />
      </AbsoluteFill>
      <Svg>
        <line x1={split} y1={0} x2={split} y2={H} stroke="#fff" strokeWidth={6} opacity={0.95} />
        <line x1={split} y1={0} x2={split} y2={H} stroke="#8fd3ff" strokeWidth={22} opacity={0.25} />
      </Svg>
      <AbsoluteFill style={{opacity: kf(frame, [8, 13], [0, 1])}}>
        {[
          {x: W * 0.25, label: 'RIO', sub: '23° S'},
          {x: W * 0.75, label: 'ATLÂNTICO', sub: '23° N'},
        ].map((l) => (
          <div
            key={l.label}
            style={{
              position: 'absolute',
              left: l.x - 220,
              width: 440,
              top: H * 0.47,
              textAlign: 'center',
              fontFamily: HUD_FONT,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{fontSize: 26, fontWeight: 700, letterSpacing: 4}}>{l.label}</div>
            <div style={{fontSize: 64, fontWeight: 700}}>{l.sub}</div>
          </div>
        ))}
      </AbsoluteFill>
      <Particles t={t} seed="c12" count={20} bokeh={4} driftX={-20} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** Free-falling puppet clipped by the waterline. */
const Faller: React.FC<{outfit: typeof ROCHA; sx: number; sy: number; waterY: number; hpx: number; pose: object; expr: object; flip?: boolean}> = ({
  outfit,
  sx,
  sy,
  waterY,
  hpx,
  pose,
  expr,
  flip,
}) => (
  <AbsoluteFill style={{clipPath: `polygon(0 0, ${W}px 0, ${W}px ${waterY}px, 0 ${waterY}px)`}}>
    <PlacedPuppet outfit={outfit} x={sx} y={sy} height={hpx} pose={pose} expr={expr} flip={flip} />
  </AbsoluteFill>
);

/** c15 — "Os dois caem na água": tear in mid-air over open ocean, drop, splash. */
export const FallSplash: React.FC = () => {
  const {frame, t, p} = useShot();
  const APPEAR = 1;
  const HIT = 15;
  const cam: Cam = {x: 0.2, y: 1.6 - p * 0.2, z: 0 + p * 1.2, pitch: -6, f: 1500, cy: H * 0.56};
  const Z = 11;
  const tt = Math.max(0, (frame - APPEAR) / 30);
  const yFeet = Math.max(-1.4, 1.1 - 0.5 * 9.8 * tt * tt);
  const water = project(cam, 0, 0, Z)!;
  const ppm = water.ppm;
  const dPos = project(cam, -0.3, yFeet, Z)!;
  const rPos = project(cam, 0.45, yFeet + 0.05, Z + 0.1)!;
  const hpx = ppm * 1.75;
  const fallPose = {shL: -160, elL: -10, shR: 150, elR: 10, hipL: -12, knL: 25, hipR: 14, knR: 30, headTilt: -6};
  const rochaPose = {shL: -150, elL: 0, shR: 40, elR: 30, hipL: -10, knL: 20, hipR: 18, knR: 10};
  const sh = shake(frame, HIT, 14, 30, 5);
  return (
    <Rig s0={1.0} s1={1.12} x0={sh.x} x1={sh.x} y0={sh.y} y1={sh.y} impacts={[{at: HIT, amp: 26, zoom: 0.06}]} whipIn="zoom">
      <Ocean
        cam={cam}
        t={t + T0}
        actors={[
          {
            key: 'fallers',
            x: 0,
            z: Z,
            render: () => (
              <>
                <Faller outfit={ROCHA} sx={rPos.sx} sy={rPos.sy} waterY={water.sy + ppm * 0.05} hpx={hpx} pose={rochaPose} expr={{mouthOpen: 0.8, browRaise: 1}} />
                <Faller outfit={DAVI_OUTFIT} sx={dPos.sx} sy={dPos.sy} waterY={water.sy + ppm * 0.05} hpx={hpx} pose={fallPose} expr={{halfSmile: 0.8, browAsym: 0.4}} />
                <Svg>
                  <Splash sx={water.sx + ppm * 0.1} sy={water.sy} ppm={ppm} age={frame - HIT} size={1.25} seed="c15" />
                  <Ripples sx={water.sx} sy={water.sy} ppm={ppm} age={frame - HIT - 4} n={3} />
                </Svg>
              </>
            ),
          },
        ]}
      />
      <Rastro x={water.sx + ppm * 0.1} y={water.sy - ppm * 1.0} height={ppm * 2.3} life={(frame - APPEAR + 1) / 20} frame={frame} seed="c15r" />
      <Flash k={kf(frame, [0, 1, 6], [0.9, 0.6, 0], (x) => x)} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** Gloved hand holding a yellow wrist at the waterline, drawn in screen px around (x, y), scale k. */
const WristGrip: React.FC<{x: number; y: number; k: number; let?: number}> = ({x, y, k, let: off = 0}) => (
  <g transform={`translate(${x},${y}) scale(${k})`}>
    <path d="M -34,40 L -24,-150 Q 0,-170 24,-150 L 34,40 Z" fill={DAVI_OUTFIT.top.base} />
    <path d="M -24,-150 Q 0,-170 24,-150 L 26,-120 Q 0,-132 -26,-120 Z" fill={DAVI_OUTFIT.top.shade} />
    <ellipse cx={0} cy={-182} rx={30} ry={38} fill={DAVI_OUTFIT.skin.base} />
    <ellipse cx={-8} cy={-190} rx={10} ry={14} fill={DAVI_OUTFIT.skin.light} opacity={0.5} />
    <g transform={`translate(${-off * 120},${off * 30})`}>
      <path d="M 30,-100 Q 140,-80 230,30 L 200,60 Q 120,-30 30,-50 Z" fill="#3b3e46" />
      <rect x={-40} y={-112} width={86} height={58} rx={26} fill="#17171b" />
      <path d="M -30,-100 L 36,-100" stroke="#5a5e6a" strokeWidth={6} strokeLinecap="round" />
    </g>
    <ellipse cx={0} cy={40} rx={70} ry={14} fill="none" stroke="#f6f2ea" strokeWidth={8} opacity={0.8} />
  </g>
);

/** c16 — "parados": water-level close on the two heads bobbing, glove still on the wrist. HUD v = 0. */
export const Floating: React.FC = () => {
  const {frame, t, p} = useShot();
  const cam: Cam = {x: 0.05, y: 0.42, z: -p * 0.25, pitch: 1, f: 1500, cy: H * 0.52};
  const a = project(cam, -0.42, 0, 2.8)!;
  const b = project(cam, 0.48, 0, 3.0)!;
  const g = project(cam, 0.05, 0, 2.7)!;
  return (
    <Rig s0={1.06} s1={1.16} r0={2} r1={-1} whipIn="left">
      <Ocean
        cam={cam}
        t={t + T0 + 2}
        actors={[
          {key: 'rocha', x: 0.48, z: 3.0, render: ({sx, sy, ppm}) => <SwimHead sx={sx} sy={sy} ppm={ppm} outfit={ROCHA} t={t} seed={2} facing={-0.3} expr={{mouthOpen: 0.35, browRaise: 0.8}} />},
          {key: 'davi', x: -0.42, z: 2.8, render: ({sx, sy, ppm}) => <SwimHead sx={sx} sy={sy} ppm={ppm} outfit={DAVI_OUTFIT} t={t} seed={1} facing={0.25} expr={{halfSmile: 0.9, smile: 0.2, lookX: 0.5, browAsym: 0.5}} />},
          {
            key: 'grip',
            x: 0.05,
            z: 2.7,
            render: ({sx, sy, ppm}) => (
              <Svg>
                <WristGrip x={sx} y={sy + Math.sin(t * 2.6) * 4} k={ppm / 520} />
                <Ripples sx={a.sx} sy={a.sy} ppm={ppm} age={(frame % 40) + 2} n={2} />
                <Ripples sx={b.sx} sy={b.sy} ppm={ppm} age={((frame + 20) % 40) + 2} n={2} />
              </Svg>
            ),
          },
        ]}
      />
      <HudLabel label="VELOCIDADE" value={0} unit="km/h" x={120} y={H * 0.33} tx={g.sx - 40} ty={g.sy - 160} from={6} countUp={false} />
      <Particles t={t} seed="c16" count={16} bokeh={5} driftX={-14} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** c17 — drone pull-back: two dots in an endless ocean, HUD TERRA 1.900 km. */
export const Drone: React.FC = () => {
  const {frame, t, p} = useShot();
  const e = easeIn(p) * 0.6 + p * 0.4;
  const h = lerp(4, 260, e);
  const pitch = lerp(48, 62, p);
  const Z = 0;
  const cam: Cam = {x: 0, y: h, z: Z - h / Math.tan((pitch * Math.PI) / 180), pitch, f: 1400, cy: H * 0.5};
  const c = project(cam, 0, 0, Z)!;
  return (
    <Rig s0={1.0} s1={1.04} r0={-4} r1={6} whipIn="up" ease={(x) => x}>
      <Ocean
        cam={cam}
        t={t + T0 + 3}
        actors={[
          {key: 'r', x: 0.45, z: Z, render: ({sx, sy, ppm}) => <SwimHead sx={sx} sy={sy} ppm={ppm} outfit={ROCHA} t={t} seed={3} expr={{mouthOpen: 0.3}} />},
          {key: 'd', x: -0.4, z: Z, render: ({sx, sy, ppm}) => <SwimHead sx={sx} sy={sy} ppm={ppm} outfit={DAVI_OUTFIT} t={t} seed={4} expr={{halfSmile: 0.8}} />},
          {
            key: 'ring',
            x: 0,
            z: Z + 0.01,
            render: ({sx, sy}) => (
              <Svg>
                <circle cx={sx} cy={sy - 8} r={kf(frame, [6, 14], [120, 46], easeOut)} fill="none" stroke="#fff" strokeWidth={3} opacity={kf(frame, [6, 10], [0, 0.9])} />
              </Svg>
            ),
          },
        ]}
      />
      <HudLabel label="ATÉ A TERRA" value={1900} unit="km" x={W - 110} y={H * 0.34} align="right" tx={c.sx + 30} ty={c.sy - 30} from={5} />
      <Finish vignette={0.45} />
    </Rig>
  );
};

/** c18 — "O cara solta o pulso": arm out of the water, glove lets go. */
export const Release: React.FC = () => {
  const {frame, t, p} = useShot();
  const LET = 8;
  const grip = kf(frame, [LET, LET + 6], [1, 0], easeOut);
  const reach = kf(frame, [LET + 3, LET + 14], [1, 0.25], easeIn);
  const bgCam: Cam = {x: 0, y: 0.5, z: 0, pitch: 4, f: 1500, cy: H * 0.4};
  const ax = 540;
  const gripY = 860;
  const wristY = 1030;
  return (
    <Rig s0={1.1} s1={1.2} impacts={[{at: LET, amp: 12}]} whipIn="right" oy={900}>
      <AbsoluteFill style={{filter: 'blur(6px)', transform: 'scale(1.06)'}}>
        <Ocean cam={bgCam} t={t + T0 + 4} />
      </AbsoluteFill>
      {/* arm rises out of the water (rotated close-up rig) */}
      <AbsoluteFill style={{transform: `rotate(180deg) translate(0px, ${-120 + Math.sin(t * 2.6) * 8}px)`, transformOrigin: `${ax}px ${H / 2}px`}}>
        <svg width={W} height={H} style={{overflow: 'visible', filter: 'drop-shadow(0 30px 40px rgba(10,20,40,0.35))'}}>
          <SleeveArm x={ax} wristY={wristY} sleeve={DAVI_OUTFIT.top} skin={DAVI_OUTFIT.skin} tense={1 - grip * 0.6} squeeze={grip * 0.8} gripY={gripY} />
          <GloveGrab ax={ax} ay={gripY} armHalfW={126} reach={reach} grip={grip} />
        </svg>
      </AbsoluteFill>
      {/* waterline over the bottom of the frame */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(40,70,110,0) 72%, rgba(40,70,110,0.85) 74%, rgba(25,45,80,0.95) 100%)'}} />
      <Svg>
        <path d={`M0,${H * 0.73} ${Array.from({length: 13}).map((_, i) => `Q${i * 90 + 45},${H * 0.73 + Math.sin(t * 4 + i) * 12 - 10} ${(i + 1) * 90},${H * 0.73}`).join(' ')}`} stroke="#f4f1ea" strokeWidth={8} fill="none" opacity={0.85} />
        <Splash sx={ax - 160} sy={H * 0.73} ppm={420} age={frame - LET - 6} size={0.5} seed="c18" />
      </Svg>
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** Two flailing suit arms for the swimmer (screen px). */
const Flail: React.FC<{sx: number; sy: number; k: number; t: number}> = ({sx, sy, k, t}) => (
  <g transform={`translate(${sx},${sy}) scale(${k})`}>
    {[-1, 1].map((s) => {
      const a = Math.sin(t * 12 + (s > 0 ? Math.PI : 0));
      const ang = s * (60 + a * 50);
      return (
        <g key={s} transform={`rotate(${ang} ${s * 120} 40)`}>
          <rect x={s * 120 - 34} y={-300} width={68} height={340} rx={30} fill="#4a4e57" />
          <rect x={s * 120 - 30} y={-320} width={60} height={30} rx={10} fill="#eef0f3" />
          <ellipse cx={s * 120} cy={-350} rx={44} ry={52} fill="#17171b" />
        </g>
      );
    })}
  </g>
);

/** c19 — "pra nadar": Rocha flails, Davi blinks out. */
export const Swim: React.FC = () => {
  const {frame, t, p} = useShot();
  const GO = 9;
  const cam: Cam = {x: 0.2 - p * 0.3, y: 0.7, z: -p * 0.4, pitch: 3, f: 1500, cy: H * 0.5};
  const d = project(cam, -0.5, 0, 3.4)!;
  const gone = frame >= GO;
  return (
    <Rig s0={1.08} s1={1.0} r0={-2} r1={2} impacts={[{at: GO, amp: 16, zoom: 0.04}]} whipIn="left">
      <Ocean
        cam={cam}
        t={t + T0 + 5}
        actors={[
          {
            key: 'r',
            x: 0.45,
            z: 3.6,
            render: ({sx, sy, ppm}) => (
              <>
                <Svg>
                  <Flail sx={sx} sy={sy} k={(ppm * 1.75) / 1000} t={t} />
                  <Splash sx={sx - ppm * 0.4} sy={sy} ppm={ppm} age={frame % 12} size={0.35} seed={`fl${Math.floor(frame / 12)}`} />
                  <Splash sx={sx + ppm * 0.4} sy={sy} ppm={ppm} age={(frame + 6) % 12} size={0.35} seed={`fr${Math.floor(frame / 12)}`} />
                </Svg>
                <SwimHead sx={sx} sy={sy} ppm={ppm} outfit={ROCHA} t={t * 2} seed={5} facing={gone ? -0.6 : 0} expr={{mouthOpen: 0.7, browRaise: 1, browTilt: 0.6}} />
              </>
            ),
          },
          {
            key: 'd',
            x: -0.5,
            z: 3.4,
            render: ({sx, sy, ppm}) =>
              gone ? (
                <Svg>
                  <Ripples sx={sx} sy={sy} ppm={ppm} age={frame - GO} n={3} />
                </Svg>
              ) : (
                <SwimHead sx={sx} sy={sy} ppm={ppm} outfit={DAVI_OUTFIT} t={t} seed={6} facing={0.3} expr={{halfSmile: 1, blink: kf(frame, [GO - 3, GO - 1], [0, 1])}} />
              ),
          },
        ]}
      />
      <Rastro x={d.sx} y={d.sy + d.ppm * 0.1} height={d.ppm * 1.1} life={(frame - GO + 1) / 22} frame={frame} seed="c19r" />
      <Flash k={kf(frame, [GO, GO + 1, GO + 5], [0, 0.6, 0], (x) => x)} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** c21 — "joga uma boia": orange buoy drops from the sky next to Rocha. */
export const BuoyDrop: React.FC = () => {
  const {frame, t, p} = useShot();
  const HIT = 12;
  const cam: Cam = {x: 0, y: 0.9, z: -p * 0.6, pitch: 5, f: 1500, cy: H * 0.52};
  const by = frame < HIT ? lerp(5.5, 0, easeIn(frame / HIT)) : 0.05 * Math.sin((frame - HIT) * 0.4);
  const spin = frame * 14;
  return (
    <Rig s0={1.0} s1={1.1} impacts={[{at: HIT, amp: 14, zoom: 0.05}]} whipIn="down">
      <Ocean
        cam={cam}
        t={t + T0 + 7}
        actors={[
          {key: 'r', x: 0.35, z: 4, render: ({sx, sy, ppm}) => <SwimHead sx={sx} sy={sy} ppm={ppm} outfit={ROCHA} t={t} seed={7} facing={kf(frame, [HIT - 2, HIT + 4], [0, -0.7])} expr={{mouthOpen: kf(frame, [HIT, HIT + 4], [0.6, 0.2]), browRaise: 0.7}} />},
          {
            key: 'b',
            x: -0.45,
            z: 3.8,
            y: by,
            render: ({sx, sy, ppm}) => {
              const w = project(cam, -0.45, 0, 3.8)!;
              return (
                <Svg>
                  <g transform={`translate(${sx},${sy}) rotate(${frame < HIT ? spin : 0})`}>
                    <Buoy r={ppm * 0.36} flat={frame < HIT ? 0.55 : 0.32} />
                  </g>
                  <Splash sx={w.sx} sy={w.sy} ppm={ppm} age={frame - HIT} size={0.6} seed="c21" />
                  <Ripples sx={w.sx} sy={w.sy} ppm={ppm} age={frame - HIT} n={3} />
                </Svg>
              );
            },
          },
        ]}
      />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** c24 — "faz quando descobrir": Rocha furious, wearing the buoy, sunglasses crooked. */
export const RochaBuoy: React.FC = () => {
  const {frame, t, p} = useShot();
  const cam: Cam = {x: 0, y: 0.32, z: 0, pitch: 0, f: 1500, cy: H * 0.55};
  const fume = kf(frame, [4, 12], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.18} r0={-3} r1={2} impacts={[{at: 6, amp: 10}]} whipIn="left" oy={1000}>
      <Ocean
        cam={cam}
        t={t + T0 + 10}
        actors={[
          {
            key: 'r',
            x: 0,
            z: 1.35,
            render: ({sx, sy, ppm}) => {
              const k = (ppm * 1.75) / 1000;
              return (
                <>
                  <SwimHead sx={sx} sy={sy} ppm={ppm} outfit={ROCHA} t={t} seed={8} tilt={-9} expr={{smile: -0.9, browTilt: -1 * fume, browRaise: -0.4, mouthOpen: 0.15 * fume}} />
                  <Svg>
                    <g transform={`translate(${sx},${sy + 70 * k + Math.sin(t * 2.6 + 8) * 6 * k})`}>
                      <Buoy r={250 * k} flat={0.3} />
                    </g>
                    {/* water drips */}
                    {[0, 1, 2].map((i) => {
                      const ph = ((frame + i * 9) % 22) / 22;
                      return <ellipse key={i} cx={sx + (-60 + i * 55) * k} cy={sy - 200 * k + ph * 200 * k} rx={8 * k} ry={12 * k} fill="#cfe9fb" opacity={0.8 * (1 - ph)} />;
                    })}
                  </Svg>
                </>
              );
            },
          },
        ]}
      />
      <Finish vignette={0.6} />
    </Rig>
  );
};
