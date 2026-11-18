import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Copacabana, COPA_PROPS, SetProp} from '../../environments/Copacabana';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {PlacedPuppet} from '../../characters/Puppet';
import {AGENT_OUTFITS, AgentVariant, PlacedAgent} from '../../characters/Agent';
import type {Expression, Lighting, Pose} from '../../characters/types';

import {Cam, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, lerp, wobble} from '../../lib/anim';
import {Particles} from '../../fx/Particles';
import {Flash, Rastro} from '../../fx/Rastro';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {BandSafe, Rig, ShotP, SpeedLines, ev} from './rig';
import {AcaiCup, Imagination, wristOf} from './kit';
import {DaviForearm, Glove2} from './hands';

const abs = (p: ShotP, fr: number) => 34.76 + (p.from + fr) / 30;

const KIOSK = {x: 3.4, z: 14.2};
const SPOT = {x: 2.3, z: 12.6}; // Davi at the kiosk
const CROWD: SetProp[] = [
  ...COPA_PROPS,
  ...Array.from({length: 10}).map((_, i) => ({kind: 'person' as const, x: -9 + random(`cr-x-${i}`) * 20, z: 10 + random(`cr-z-${i}`) * 5, seed: i})),
];

const walk = (t: number, ph = 0, amp = 1): Pose => {
  const s = Math.sin(t * 9 + ph);
  return {
    hipL: s * 18 * amp,
    hipR: -s * 18 * amp,
    knL: Math.max(0, -s) * 22 * amp,
    knR: Math.max(0, s) * 22 * amp,
    shL: -8 - s * 14 * amp,
    elL: 10,
    shR: 8 + s * 14 * amp,
    elR: -10,
    bob: -Math.abs(s) * 12 * amp,
  };
};

/** Big head-and-shoulders: head of radius `r` px centred at (cx, cy). */
const Bust: React.FC<{who: 'davi' | AgentVariant; cx: number; cy: number; r: number; pose?: Pose; expr?: Expression; light?: Lighting; blur?: number}> = ({who, cx, cy, r, pose, expr, light, blur}) => {
  const k = r / 122;
  const outfit = who === 'davi' ? DAVI_OUTFIT : AGENT_OUTFITS[who];
  return <PlacedPuppet outfit={outfit} x={cx} y={cy + 884 * k} height={1000 * k} upperOnly pose={pose} expr={expr} light={light} blur={blur} />;
};

/** Blurred beach backdrop for close-ups. */
const BeachBokeh: React.FC<{t: number; dx?: number; pitch?: number; cold?: number}> = ({t, dx = 0, pitch = 4, cold = 0}) => (
  <AbsoluteFill style={{transform: 'scale(1.12)'}}>
    <Copacabana cam={{x: SPOT.x + 0.4 + dx, y: 1.4, z: SPOT.z - 1.4, pitch, f: 1650, cy: H * 0.5}} t={t} focus={0.4} aperture={24} cold={cold} props={CROWD} />
  </AbsoluteFill>
);

/* 23. "Sexta-feira, Copacabana." — fast crane down onto the beach at sunset. HUD SEXTA 17:40. */
export const SFriday: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = easeOut(clamp(fr / p.dur));
  const cam: Cam = {x: lerp(-2.5, 0.8, k), y: lerp(7, 1.6, k), z: lerp(-4, 3, k), pitch: lerp(18, 1, k), f: 1500, cy: H * 0.5};
  const kio = project(cam, KIOSK.x, 2.6, KIOSK.z);
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.08]} rot={[-3, 0]} whip="d">
      <Copacabana cam={cam} t={t} focus={KIOSK.z - cam.z} aperture={6} props={CROWD} />
      <Particles t={t} seed="c1p" count={30} bokeh={7} driftX={-14} />
      {kio && <HudLabel label="SEXTA" value="17:40" x={100} y={540} tx={kio.sx} ty={kio.sy} from={8} />}
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 24. "O Davi compra um açaí" — Davi at the kiosk lifts the cup, half smile. */
export const SAcai: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const A = ev(p, 'L14', 6);
  const lift = kf(fr, [A - 12, A], [0, 1], easeOut);
  const k = easeOut(clamp(fr / p.dur));
  const cam: Cam = {x: SPOT.x + lerp(0.6, 0.15, k), y: 1.25, z: SPOT.z - lerp(3.4, 2.3, k), pitch: -2, f: 1650, cy: H * 0.5};
  const pose: Pose = {shR: lerp(8, 34, lift), elR: lerp(-8, -118, lift), shL: -9, elL: 8, facing: 0.12, headTilt: lift * 3};
  const wr = wristOf(pose, 'R');
  return (
    <Rig dur={p.dur} whip="r" zoom={[1.04, 1.1]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={SPOT.z - cam.z}
        aperture={12}
        props={CROWD}
        actors={[
          {
            key: 'davi',
            x: SPOT.x,
            z: SPOT.z,
            shadow: 1,
            render: ({sx, sy, ppm}) => (
              <PlacedPuppet outfit={DAVI_OUTFIT} x={sx} y={sy + Math.sin(t * 2.2) * 3} height={ppm * 1.75} pose={pose} expr={{halfSmile: 0.4 + lift * 0.6, smile: lift * 0.4, lookX: lerp(0.6, 0.1, lift), browRaise: lift * 0.3}}>
                {lift > 0.05 && <AcaiCup x={wr[0] - 6} y={wr[1] - 70} h={150} rot={-6} />}
              </PlacedPuppet>
            ),
          },
        ]}
      />
      <Particles t={t} seed="c2p" count={26} bokeh={8} driftX={-18} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 25. "Um cara de terno" — low angle, a suit walks in through the crowd, Davi's shoulder blurred in the foreground. */
export const SSuit: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = clamp(fr / p.dur);
  const rz = lerp(SPOT.z + 1.6, SPOT.z + 0.4, k);
  const cam: Cam = {x: SPOT.x - 0.2, y: 0.75, z: SPOT.z - 3.2, pitch: -7, f: 1600, cy: H * 0.5};
  const r = project(cam, SPOT.x + 0.5, 0, rz)!;
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.18]} pow={1.4} origin={[r.sx, r.sy - r.ppm * 1.4]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={r.depth}
        aperture={12}
        props={CROWD}
        actors={[
          {
            key: 'rocha',
            x: SPOT.x + 0.5,
            z: rz,
            shadow: 1,
            render: ({sx, sy, ppm}) => <PlacedAgent variant="rocha" x={sx} y={sy} height={ppm * 1.85} pose={{...walk(t, 0, 0.8), facing: -0.1}} expr={{browTilt: -0.5, halfSmile: 0.2}} />,
          },
        ]}
      />
      {/* Davi's hood/shoulder, out of focus in the foreground */}
      <AbsoluteFill style={{filter: 'blur(22px)'}}>
        <svg width={W} height={H}>
          <path d="M -200,1980 Q -120,1150 160,1060 Q 330,1010 420,1180 Q 470,1400 430,1980 Z" fill={DAVI_OUTFIT.top.base} />
          <path d="M 40,1100 Q 220,980 380,1120" stroke={DAVI_OUTFIT.top.light} strokeWidth={40} fill="none" />
          <circle cx={110} cy={760} r={260} fill={DAVI_OUTFIT.head.hairColor} />
        </svg>
      </AbsoluteFill>
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 26. "segura o pulso dele" — the glove (thumb + jointed fingers) clamps the yellow sleeve. */
export const SGrab: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const G = ev(p, 'L14', 13);
  const reach = kf(fr, [0, G - 2], [0, 1], easeOut);
  const grip = kf(fr, [G - 5, G + 2], [0, 1], easeOut);
  const sq = kf(fr, [G, G + 3, G + 10], [0, 1, 0.75]);
  const ax = 470;
  const gripY = 760;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} rot={[-7, -5]} origin={[ax, gripY]} shakes={[{at: G, dur: 12, amp: 20}]} punches={[{at: G, amt: 0.06}]} whip="l">
      <BeachBokeh t={t} dx={0.3} pitch={8} />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible', filter: 'drop-shadow(0 30px 40px rgba(40,10,30,0.35))'}}>
        <DaviForearm x={ax} wristY={1000} gripY={gripY} sleeve={DAVI_OUTFIT.top} skin={DAVI_OUTFIT.skin} squeeze={sq} tense={kf(fr, [G, G + 6], [0, 1])} />
        <Glove2 ax={ax} ay={gripY} aw={150} reach={reach} grip={grip} />
      </svg>
      <Particles t={t} seed="c4p" count={20} bokeh={6} driftX={-16} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/** Little electric arcs around a point (Rastro hint). */
const Sparks: React.FC<{x: number; y: number; r: number; k: number; frame: number; seed: string}> = ({x, y, r, k, frame, seed}) =>
  k <= 0 ? null : (
    <svg width={W} height={H} style={{position: 'absolute', mixBlendMode: 'screen', filter: 'drop-shadow(0 0 8px #5fc8ff)'}}>
      {Array.from({length: 6}).map((_, i) => {
        const a = random(`${seed}-${i}-${Math.floor(frame / 2)}`) * Math.PI * 2;
        const pts = Array.from({length: 5}).map((__, s) => {
          const rr = r * (1 + s * 0.08);
          const aa = a + s * 0.12 + (random(`${seed}-j-${i}-${s}-${frame}`) - 0.5) * 0.2;
          return `${s ? 'L' : 'M'}${(x + Math.cos(aa) * rr).toFixed(1)},${(y + Math.sin(aa) * rr).toFixed(1)}`;
        });
        return <path key={i} d={pts.join(' ')} stroke="#bff0ff" strokeWidth={4} fill="none" opacity={k * (random(`${seed}-o-${i}-${frame}`) > 0.3 ? 1 : 0)} />;
      })}
    </svg>
  );

/* 27. "Se o Davi pular pra longe" — Davi close: eyes drop to the wrist, then to the horizon; sparks. */
export const SDaviEyes: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const J = ev(p, 'L15', 3);
  const away = kf(fr, [J - 2, J + 4], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} pow={1.5} origin={[540, 950]} whip="r">
      <BeachBokeh t={t} dx={-0.3} />
      <Bust
        who="davi"
        cx={540}
        cy={990}
        r={300}
        pose={{facing: lerp(0.05, -0.15, away), headTilt: lerp(4, -3, away)}}
        expr={{lookX: lerp(0.5, -0.9, away), lookY: lerp(1, -0.2, away), browTilt: 0.3 - away * 0.9, smile: -0.1, blink: kf(fr, [J - 4, J - 2, J], [0, 1, 0])}}
      />
      <Sparks x={540} y={990} r={330} k={kf(fr, [J, J + 3], [0, 1])} frame={fr} seed="c5s" />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** Grey "what if" street with a brick wall at the far right (world: calçadão rotated). */
const WhatIf: React.FC<{cam: Cam; t: number; actors: React.ComponentProps<typeof Copacabana>['actors']}> = ({cam, t, actors}) => (
  <>
    <Copacabana cam={cam} t={t} focus={6} aperture={8} actors={actors} props={CROWD} />
    <Imagination />
  </>
);

/* 28. "o cara chega a dois" — imagined: Rastro tear, Davi arrives still, the suit shoots out sideways. */
export const SImagine: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const O = 2;
  const cam: Cam = {x: 0.6, y: 1.3, z: 2.4, pitch: -1, f: 1500, cy: H * 0.5};
  const d = project(cam, 0, 0, 8)!;
  const shot = Math.max(0, fr - O - 2);
  const rx = shot * shot * 0.03 + shot * 0.35;
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.14]} shakes={[{at: O, dur: 14, amp: 18}]} pan={[0, 0, -80, 0]}>
      <WhatIf
        cam={cam}
        t={t}
        actors={[
          {
            key: 'davi',
            x: 0,
            z: 8,
            shadow: 1,
            render: ({sx, sy, ppm}) => (fr >= O ? <PlacedDavi x={sx} y={sy} height={ppm * 1.75} pose={{shR: 40, elR: -20}} expr={{eyesWide: 0.4, browRaise: 0.5}} /> : null),
          },
          {
            key: 'rocha',
            x: 0.55 + rx,
            z: 8.01,
            y: 0,
            render: ({sx, sy, ppm}) =>
              fr >= O ? (
                <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `rotate(${clamp(shot / 6) * 70}deg)`, transformOrigin: `${sx}px ${sy - ppm * 0.9}px`, filter: `blur(${Math.min(10, shot * 1.2)}px)`}}>
                  <PlacedAgent variant="rocha" x={sx} y={sy} height={ppm * 1.85} pose={{shL: -60, elL: -20, shR: 50, elR: 30, hipL: -30, hipR: 25}} expr={{mouthOpen: 0.6, browRaise: 0.6, smile: -0.3}} />
                </div>
              ) : null,
          },
        ]}
      />
      <SpeedLines k={clamp((fr - O - 3) / 4)} t={t} color="230,235,245" />
      <Rastro x={d.sx + d.ppm * 0.25} y={d.sy} height={d.ppm * 1.9} life={(fr - O + 1) / 18} frame={fr} seed="c6r" />
      <Flash k={kf(fr, [O, O + 1, O + 5], [0, 0.9, 0], (x) => x)} />
      <Finish vignette={0.6} grain={0.14} />
    </Rig>
  );
};

/** Rocha flying horizontally (head to the right), grey. */
const FlyingRocha: React.FC<{x: number; y: number; h: number; t: number}> = ({x, y, h, t}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `rotate(84deg)`, transformOrigin: `${x}px ${y}px`}}>
    <PlacedAgent
      variant="rocha"
      x={x}
      y={y + h * 0.5}
      height={h}
      pose={{shL: -150 + Math.sin(t * 20) * 15, elL: 20, shR: 160 + Math.sin(t * 22) * 15, elR: -20, hipL: -10 + Math.sin(t * 18) * 12, hipR: 15 - Math.sin(t * 18) * 12, knL: 20, knR: 10}}
      expr={{mouthOpen: 0.8, browRaise: 0.8, smile: -0.4}}
    />
  </div>
);

/* 29. "mil por hora" — tracking the flying suit, streaks; HUD ROCHA 2.000 km/h. */
export const SFly: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} shakes={[{at: 0, dur: p.dur, amp: 6}]} whip="l">
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #8d929c 0%, #b9bcc3 50%, #6d717a 51%, #4b4e55 100%)'}} />
      <AbsoluteFill style={{filter: 'blur(14px)'}}>
        <svg width={W} height={H}>
          {Array.from({length: 14}).map((_, i) => {
            const x = ((i * 220 + fr * 140) % 3100) - 400;
            const h = 300 + ((i * 97) % 300);
            return <rect key={i} x={1080 - x} y={960 - h} width={180} height={h} fill={i % 2 ? '#5e626b' : '#777b84'} />;
          })}
          {Array.from({length: 10}).map((_, i) => (
            <rect key={'p' + i} x={1080 - (((i * 330 + fr * 260) % 3600) - 400)} y={1300} width={60} height={500} fill="#3d4047" />
          ))}
        </svg>
      </AbsoluteFill>
      <SpeedLines k={1} t={t} color="255,255,255" count={34} />
      <FlyingRocha x={560 + Math.sin(fr * 0.5) * 8} y={1000} h={760} t={t} />
      <BandSafe>
        <SpeedLines k={0.6} t={t + 3} color="255,255,255" count={14} />
      </BandSafe>
      <HudLabel label="ROCHA" value={2000} unit="km/h" x={100} y={540} tx={700} ty={980} from={0} />
      <Finish vignette={0.6} grain={0.14} />
    </Rig>
  );
};

/* 30. "Vira parede" — the suit slams flat into a brick wall: cracks, dust, heavy shake. */
export const SWall: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const HIT = Math.max(3, ev(p, 'L15', 15));
  const before = fr < HIT;
  const wallX = 650;
  const fx = before ? lerp(-500, wallX - 120, easeIn(clamp(fr / HIT))) : wallX - 40;
  const crack = kf(fr, [HIT, HIT + 5], [0, 1], easeOut);
  const dust = clamp((fr - HIT) / 24);
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.12]} shakes={[{at: HIT, dur: 18, amp: 40}]} punches={[{at: HIT, amt: 0.14}]} origin={[wallX, 980]}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #a5a9b1 0%, #c6c8cd 60%, #6b6e75 61%, #50535a 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <rect x={wallX} y={0} width={W - wallX + 40} height={H} fill="#7e6f68" />
        {Array.from({length: 40}).map((_, r) =>
          Array.from({length: 5}).map((__, c) => (
            <rect key={`${r}-${c}`} x={wallX + c * 110 - (r % 2) * 55 + 4} y={r * 52 + 4} width={102} height={44} rx={4} fill={['#8c7c74', '#776860', '#94857c'][(r * 3 + c) % 3]} />
          )),
        )}
        <rect x={wallX - 18} y={0} width={22} height={H} fill="#5d524d" />
        {crack > 0 &&
          Array.from({length: 10}).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            let x = wallX + 20;
            let y = 980;
            const d = [`M${x},${y}`];
            for (let s = 0; s < 5; s++) {
              const aa = a + Math.sin(i * 5 + s * 2.3) * 0.4;
              const l = (50 + ((i * 41 + s * 29) % 60)) * crack;
              x += Math.abs(Math.cos(aa)) * l;
              y += Math.sin(aa) * l * 1.3;
              d.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return <path key={i} d={d.join(' ')} stroke="#2a221e" strokeWidth={8} fill="none" strokeLinejoin="round" />;
          })}
      </svg>
      {/* the suit: flying in, then squashed flat on the wall */}
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: before ? 'none' : `translateX(${wallX - 40 - 540}px) scaleX(${lerp(0.25, 0.3, dust)}) translateX(${-(wallX - 40 - 540)}px)`, transformOrigin: `${wallX}px 980px`}}>
        {before ? (
          <div style={{filter: 'blur(4px)'}}>
            <FlyingRocha x={fx} y={980} h={760} t={t} />
          </div>
        ) : (
          <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateY(${dust * 60}px)`}}>
            <FlyingRocha x={wallX - 40} y={980} h={760} t={t} />
          </div>
        )}
      </div>
      {!before && (
        <svg width={W} height={H} style={{position: 'absolute', filter: 'blur(6px)'}}>
          {Array.from({length: 14}).map((_, i) => {
            const a = random(`wd-${i}`) * Math.PI - Math.PI / 2 + Math.PI;
            const r = dust * (180 + random(`wr-${i}`) * 340);
            return <circle key={i} cx={wallX + Math.cos(a) * r * 0.6} cy={980 + Math.sin(a) * r} r={40 + dust * 90} fill="#d9d4cc" opacity={(1 - dust) * 0.6} />;
          })}
        </svg>
      )}
      <Imagination />
      <Flash k={kf(fr, [HIT, HIT + 1, HIT + 5], [0, 0.8, 0], (x) => x)} color="255,255,255" />
      <Finish vignette={0.6} grain={0.14} />
    </Rig>
  );
};

/* 31. "E o Davi não mata ninguém" — back to colour: Davi frowns, small head shake. */
export const SDaviNo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const N = ev(p, 'L15', 19);
  const shakeHead = fr > N ? Math.sin((fr - N) * 0.7) * Math.exp(-(fr - N) / 14) : 0;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} origin={[540, 1000]} pan={[30, 0, -10, 0]}>
      <BeachBokeh t={t} dx={0.2} />
      <Bust who="davi" cx={540} cy={1010} r={290} pose={{facing: shakeHead * 0.35, headTilt: shakeHead * 4 + 2}} expr={{browTilt: -0.9, smile: -0.35, lookX: shakeHead * 0.5, browRaise: -0.3}} />
      <Particles t={t} seed="c9p" count={20} bokeh={7} driftX={-14} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 32. "Eles sabem disso" — low angle on Rocha, smirk, Davi reflected in the shades. */
export const SRochaKnows: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const S = ev(p, 'L15', 23);
  const cx = 560;
  const cy = 980;
  const r = 280;
  const k = r / 122;
  const facing = -0.05;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[4, 2]} origin={[cx, cy]} whip="d" punches={[{at: S, amt: 0.04}]}>
      <AbsoluteFill style={{transform: 'scale(1.15)'}}>
        <Copacabana cam={{x: 1, y: 1.0, z: 6, pitch: -14, f: 1500, cy: H * 0.5}} t={t} focus={0.4} aperture={22} props={CROWD} />
      </AbsoluteFill>
      <Bust who="rocha" cx={cx} cy={cy} r={r} pose={{facing, headTilt: -4}} expr={{halfSmile: kf(fr, [S, S + 8], [0.3, 1]), smile: 0.15, browAsym: 0.5, browTilt: -0.4}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {[-1, 1].map((s) => {
          const lx = cx + (facing * 30 + s * 42) * k;
          const ly = cy + -3 * k;
          return (
            <g key={s} opacity={0.85}>
              <ellipse cx={lx} cy={ly + 6} rx={9 * k} ry={6 * k} fill="#ff9c5a" opacity={0.25} />
              <circle cx={lx} cy={ly - 4 * k} r={2.6 * k} fill="#3a2418" />
              <rect x={lx - 3 * k} y={ly - 1.5 * k} width={6 * k} height={8 * k} rx={2 * k} fill="#e0a92a" />
            </g>
          );
        })}
      </svg>
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** Two-shot set: Davi (left) with the açaí, Rocha (right) holding his wrist. */
const StandoffActors = (t: number, fr: number, smile = 0.6) => {
  const daviPose: Pose = {shR: 26, elR: -4, shL: -10, elL: 60, facing: 0.35, headTilt: -2};
  return [
    {
      key: 'davi',
      x: 0,
      z: 9,
      shadow: 1,
      render: ({sx, sy, ppm}: {sx: number; sy: number; ppm: number}) => {
        const wl = wristOf(daviPose, 'L');
        return (
          <PlacedPuppet outfit={DAVI_OUTFIT} x={sx} y={sy} height={ppm * 1.75} pose={daviPose} expr={{browTilt: -0.6, lookX: 0.8, smile: -0.1}}>
            <AcaiCup x={wl[0]} y={wl[1] - 60} h={140} />
          </PlacedPuppet>
        );
      },
    },
    {
      key: 'rocha',
      x: 0.95,
      z: 9.05,
      shadow: 1,
      render: ({sx, sy, ppm}: {sx: number; sy: number; ppm: number}) => (
        <PlacedAgent variant="rocha" x={sx} y={sy} height={ppm * 1.85} pose={{shL: -58, elL: 18, shR: 8, elR: -8, facing: -0.35, headTilt: 2 + wobble(t, 3)}} expr={{halfSmile: smile, smile: 0.1, browAsym: 0.4}} />
      ),
    },
  ];
};

/* 33. "Empate." — the two of them frozen, wrist held; slow orbit push. */
export const SStandoff: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = clamp(fr / p.dur);
  const cam: Cam = {x: lerp(-0.4, 0.3, k), y: 1.2, z: lerp(4.6, 5.2, k), pitch: -1, f: 1650, cy: H * 0.5};
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} punches={[{at: 0, amt: 0.05, len: 10}]}>
      <Copacabana cam={cam} t={t} focus={9 - cam.z} aperture={11} actors={StandoffActors(t, fr, 0.5)} props={CROWD} />
      <Particles t={t} seed="c11p" count={24} bokeh={7} driftX={-8} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 34. "O cara sorri." — extreme close on Rocha's smile. */
export const SSmile: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const S = ev(p, 'L16', 3);
  const sm = kf(fr, [S - 4, S + 8], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} origin={[540, 1150]} whip="l">
      <BeachBokeh t={t} dx={0.8} />
      <Bust who="rocha" cx={560} cy={760} r={560} pose={{facing: -0.08, headTilt: -2}} expr={{halfSmile: 0.4 + sm * 0.6, smile: sm * 0.55, browAsym: 0.5}} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 35. "Mais três chegando." — high crane: three suits striding across the calçadão. */
export const SThreeSuits: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = easeOut(clamp(fr / p.dur));
  const cam: Cam = {x: 0.6, y: lerp(6.5, 5, k), z: lerp(4, 6, k), pitch: lerp(30, 24, k), f: 1500, cy: H * 0.5};
  const zz = lerp(15.2, 13.6, clamp(fr / p.dur));
  const suits: {v: AgentVariant; x: number; dz: number; ph: number}[] = [
    {v: 'agentA', x: -1.6, dz: 0.4, ph: 0},
    {v: 'agentB', x: 0.6, dz: 0, ph: 1.6},
    {v: 'agentA', x: 2.8, dz: 0.5, ph: 3.1},
  ];
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.14]} whip="u" rot={[-2, 0]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={zz - cam.z}
        aperture={5}
        props={CROWD}
        actors={[
          ...suits.map((s) => ({
            key: s.v + s.x,
            x: s.x,
            z: zz + s.dz,
            shadow: 1,
            render: ({sx, sy, ppm}: {sx: number; sy: number; ppm: number}) => (
              <PlacedAgent variant={s.v} x={sx} y={sy} height={ppm * 1.85} pose={{...walk(t, s.ph), facing: -0.05}} expr={{browTilt: -0.6}} />
            ),
          })),
          ...StandoffActors(t, fr).map((a) => ({...a, x: a.x + 0.4, z: a.z + 1.5})),
        ]}
      />
      <Particles t={t} seed="c13p" count={20} bokeh={5} driftX={-10} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

