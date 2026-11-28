import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Chip, Glitch, PlaceTag, Rig, SlowMoGrade, Stamp, Svg, al, useShot, wl} from './kit';
import {CHEF, ChefHat, KITCHEN_LIGHT, Kitchen, MICS, Mic, ROOF_LIGHT, ROOMS, Rooftop, Tablet, TerracePlan} from './sets';
import {ChairBack, DinnerTable, MARBLE_LIGHT, MirrorRoom, RestroomWall, TERRACE_LIGHT, TerraceBG} from '../../ep02/partC/sets';
import {CloseUp, LIA_SEAT, SIT_H, TABLE} from '../../ep02/partC/ShotsMonaco';
import {Flute, GUESTS} from '../../ep02/partB/sets';
import {PlacedDavi, DAVI_OUTFIT} from '../../characters/Davi';
import {PlacedLia, LIA_OUTFIT} from '../../characters/Lia';
import {PlacedAgent} from '../../characters/Agent';
import {PlacedPuppet} from '../../characters/Puppet';
import type {Pose} from '../../characters/types';
import {Flash, Rastro} from '../../fx/Rastro';
import {Shockwave} from '../../fx/Shockwave';
import {Particles} from '../../fx/Particles';
import {PigeonFlock} from '../../fx/Birds';
import {Finish} from '../../scenes/common';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';

/* ------------------------------------------------------------------ helpers */

/** Davi landing pose variants for the montage. */
const POSES: Pose[] = [
  {shL: -40, elL: -30, shR: 40, elR: 30, hipL: -14, knL: 20, hipR: 14, knR: 20, bob: 20},
  {shL: -70, elL: -40, shR: 20, elR: -10, hipL: -8, hipR: 18, knR: 25, lean: 4},
  {shL: -150, elL: -10, shR: 30, elR: 20, hipL: -12, hipR: 6, lean: -3},
  {shL: -20, elL: -100, shR: 150, elR: 10, hipL: -20, knL: 30, hipR: 4, bob: 30},
  {shL: -35, elL: -70, shR: 35, elR: 70, hipL: -10, hipR: 10},
  {shL: -90, elL: 0, shR: 90, elR: 0, hipL: -20, knL: 40, hipR: 20, knR: 40, bob: 60},
];

/** Davi popping in at (x,y): Rastro + shockwave + small flash. `age` frames since arrival. */
const PopIn: React.FC<{x: number; y: number; h: number; age: number; seed: string; pose?: Pose; flip?: boolean; light?: typeof TERRACE_LIGHT; gone?: boolean; expr?: object}> = ({
  x,
  y,
  h,
  age,
  seed,
  pose = POSES[0],
  flip,
  light = TERRACE_LIGHT,
  gone,
  expr = {smile: 0.7, halfSmile: 0.5},
}) => (
  <>
    {age >= 0 && !gone && <PlacedDavi x={x} y={y + kf(age, [0, 3], [-h * 0.03, 0])} height={h} pose={pose} flip={flip} light={light} expr={expr} />}
    <Rastro x={x} y={y} height={h * 1.05} life={(age + 2) / 16} frame={age + 100} seed={seed} />
    {age >= 0 && <Shockwave cx={x} cy={y - h * 0.5} age={age} rings={3} speed={34} gap={3} maxR={900} />}
  </>
);

/* ------------------------------------------------------------------ b01 — "Então ele faz" */

export const B01Ready: React.FC = () => {
  const {frame, t} = useShot();
  const crackle = kf(frame, [8, 20], [0, 1]);
  return (
    <Rig s0={1.05} s1={1.2} x0={-20} x1={20} r0={-2} r1={1} whipIn="zoom" oy={1050}>
      <AbsoluteFill style={{filter: 'blur(8px)', transform: 'scale(1.1)'}}>
        <Rooftop t={t + 40} px={frame * 3} />
      </AbsoluteFill>
      <CloseUp who="davi" cx={540} cy={1060} k={3.6} facing={0.05} light={ROOF_LIGHT} expr={{halfSmile: kf(frame, [4, 14], [0, 1]), browTilt: -0.35, lookX: 0, lookY: 0, blink: kf(frame, [2, 4, 6], [0, 1, 0])}} />
      {/* blue crackle around him: he's charging up */}
      <Svg>
        {Array.from({length: 8}).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 + frame * 0.3;
          const r0 = 520;
          const pts = Array.from({length: 5}).map((__, k) => {
            const rr = r0 + k * 40;
            const aa = a + (random(`b01-${i}-${k}-${frame}`) - 0.5) * 0.25;
            return `${540 + Math.cos(aa) * rr},${1060 + Math.sin(aa) * rr * 1.2}`;
          });
          return <path key={i} d={`M${pts.join(' L')}`} stroke="#a8e6ff" strokeWidth={6} fill="none" opacity={crackle * (random(`b01o${i}${frame}`) > 0.4 ? 1 : 0)} style={{filter: 'drop-shadow(0 0 10px #38a8ff)'}} />;
        })}
      </Svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(80,170,255,0) 40%, rgba(60,140,255,0.35) 100%)', opacity: crackle}} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b02 — 30 jumps in 2 s (one every 2 frames) */

type Spot = 'terrace' | 'kitchen' | 'roof' | 'wc' | 'table' | 'balcony';
const SPOTS: Spot[] = ['terrace', 'kitchen', 'roof', 'wc', 'table', 'balcony'];

const MontageBG: React.FC<{spot: Spot; t: number; px: number}> = ({spot, t, px}) => {
  if (spot === 'kitchen') return <Kitchen t={t} px={px} />;
  if (spot === 'roof') return <Rooftop t={t} px={px} />;
  if (spot === 'wc') return <RestroomWall t={t} mirror={<MirrorRoom />} />;
  if (spot === 'balcony') return <TerraceBG t={t} horizon={820} balY={1300} px={px} lights={false} />;
  if (spot === 'table')
    return (
      <AbsoluteFill>
        <TerraceBG t={t} horizon={640} balY={930} px={px} />
        <ChairBack x={LIA_SEAT.x} y={1330} s={1.05} />
        <PlacedLia x={LIA_SEAT.x} y={LIA_SEAT.y} height={SIT_H} light={TERRACE_LIGHT} pose={{facing: 0.35, shR: 18, elR: -70}} expr={{eyesWide: 0.6, browRaise: 0.8}} />
        <DinnerTable x={TABLE.x} y={TABLE.y} s={TABLE.s} t={t} />
      </AbsoluteFill>
    );
  return <TerraceBG t={t} horizon={700} balY={1000} px={px} />;
};

export const B02Montage: React.FC = () => {
  const {frame, t} = useShot();
  const J = Math.floor(frame / 2); // jump index 0..30
  const r = (k: string) => random(`b02-${J}-${k}`);
  const spot = SPOTS[(J * 5 + Math.floor(r('s') * 3)) % SPOTS.length];
  const x = 220 + r('x') * 640;
  const h = 700 + r('h') * 700;
  const y = spot === 'roof' ? 1300 + (x / 1080) * -200 + h * 0.15 : spot === 'balcony' ? 1700 : 1500 + r('y') * 300;
  const pose = POSES[Math.floor(r('p') * POSES.length)];
  const prevX = 220 + random(`b02-${J - 1}-x`) * 640;
  const camR = (r('r') - 0.5) * 10;
  const camS = 1.05 + r('z') * 0.25;
  const timer = clamp(frame / 60) * 2;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `rotate(${camR}deg) scale(${camS}) translate(${(r('cx') - 0.5) * 80}px,${(r('cy') - 0.5) * 60}px)`}}>
        <MontageBG spot={spot} t={t + J} px={(r('px') - 0.5) * 300} />
        {/* the Rastro left behind from the previous jump */}
        {J > 0 && <Rastro x={prevX} y={y} height={h} life={0.45 + (frame % 2) * 0.2} frame={frame} seed={`b02p${J}`} />}
        <PlacedDavi x={x} y={y} height={h} pose={pose} flip={r('f') > 0.5} light={TERRACE_LIGHT} expr={{smile: 0.5 + r('e') * 0.5, halfSmile: 0.6, eyesWide: r('w') > 0.7 ? 0.6 : 0}} />
        <Rastro x={x} y={y} height={h * 1.05} life={0.1 + (frame % 2) * 0.12} frame={frame} seed={`b02n${J}`} />
        <Shockwave cx={x} cy={y - h * 0.5} age={(frame % 2) + 1} rings={2} speed={60} gap={1} maxR={900} />
      </AbsoluteFill>
      {/* speed lines */}
      <Svg>
        {Array.from({length: 26}).map((_, i) => {
          const a = random(`b02l${i}`) * Math.PI * 2;
          const r0 = 420 + random(`b02l${i}${J}`) * 300;
          return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0 * 1.6} x2={540 + Math.cos(a) * 1500} y2={960 + Math.sin(a) * 2400} stroke="#ffffff" strokeWidth={3 + random(`b02w${i}`) * 6} opacity={0.35} />;
        })}
      </Svg>
      <Flash k={frame % 2 === 0 ? 0.35 : 0.08} />
      {/* stopwatch HUD (left, clear of the meter and caption bands) */}
      <div style={{position: 'absolute', left: 40, top: 560, padding: '10px 20px', borderRadius: 16, background: 'rgba(8,14,32,0.8)', border: '3px solid #ff5a5a', color: '#fff', fontFamily: HUD_FONT, fontWeight: 700}}>
        <div style={{fontSize: 22, letterSpacing: 3, opacity: 0.85}}>⏱ TEMPO</div>
        <div style={{fontSize: 64, lineHeight: 1}}>{timer.toFixed(2).replace('.', ',')} s</div>
      </div>
      <div style={{position: 'absolute', left: 40, top: 700, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 40, color: '#ffd23f', textShadow: '0 3px 10px rgba(0,0,0,0.8)'}}>SALTO #{Math.min(30, J + 1)}</div>
      <Finish vignette={0.45} grain={0.12} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ b03–b06 — named spots */

/** Second quick pop inside a spot shot (keeps the frenzy going). */
const extraPop = (frame: number, at: number) => frame >= at;

export const B03Kitchen: React.FC = () => {
  const {frame, t} = useShot();
  const A = 1;
  const B = 11;
  const fright = kf(frame, [A, A + 3], [0, 1], easeOut);
  const hatY = kf(frame, [A, A + 6, 18], [0, -160, -60], easeOut);
  const CH = {x: 300, y: 1760, h: 1180};
  return (
    <Rig s0={1.05} s1={1.15} x0={30} x1={-20} r0={2} r1={-1} impacts={[{at: A, amp: 30, zoom: 0.06}, {at: B, amp: 16}]}>
      <Kitchen t={t + 10} px={frame * 4} flame={1 + fright * 0.8} />
      <PlacedPuppet outfit={CHEF} x={CH.x} y={CH.y} height={CH.h} light={KITCHEN_LIGHT} pose={{shL: -40 - fright * 60, elL: -60 - fright * 40, shR: 30 + fright * 90, elR: 40, lean: -fright * 6, bob: -fright * 30}} expr={{eyesWide: fright, mouthOpen: fright * 0.8, browRaise: fright}} />
      <Svg>
        <ChefHat x={CH.x - 4 - fright * 20} y={CH.y - 1000 * (CH.h / 1000) + 10 + hatY} s={CH.h / 1000} rot={-fright * 20} />
      </Svg>
      {!extraPop(frame, B) ? (
        <PopIn x={760} y={1800} h={1150} age={frame - A} seed="b03a" pose={POSES[0]} light={KITCHEN_LIGHT} />
      ) : (
        <>
          <Rastro x={760} y={1800} height={1200} life={0.5 + (frame - B) / 20} frame={frame} seed="b03a2" />
          <PopIn x={900} y={1500} h={600} age={frame - B} seed="b03b" pose={POSES[3]} light={KITCHEN_LIGHT} flip />
        </>
      )}
      <Flash k={kf(frame, [A, A + 1, A + 4, B, B + 1, B + 3], [0, 0.7, 0, 0, 0.5, 0], (x) => x)} />
      <PlaceTag text="COZINHA" k={kf(frame, [0, 4], [0, 1], easeOut)} y={640} rot={-5} />
      <Finish vignette={0.45} />
    </Rig>
  );
};

export const B04Roof: React.FC = () => {
  const {frame, t} = useShot();
  const A = 1;
  return (
    <Rig s0={1.1} s1={1.2} x0={-30} x1={30} r0={-3} r1={2} impacts={[{at: A, amp: 30, zoom: 0.06}]} whipIn="up">
      <Rooftop t={t + 20} px={frame * 3} />
      <PopIn x={520} y={1330} h={1000} age={frame - A} seed="b04" pose={POSES[2]} light={ROOF_LIGHT} />
      <PigeonFlock frame={frame} start={A} ox={720} oy={1050} count={12} spread={520} size={70} seed="b04p" />
      <Flash k={kf(frame, [A, A + 1, A + 4], [0, 0.7, 0], (x) => x)} />
      <PlaceTag text="TELHADO" k={kf(frame, [0, 4], [0, 1], easeOut)} y={640} rot={4} color="#7fd8ff" />
      <Finish vignette={0.5} />
    </Rig>
  );
};

export const B05Balcony: React.FC = () => {
  const {frame, t} = useShot();
  const A = 2;
  const B = 14;
  const fright = kf(frame, [A, A + 3], [0, 1], easeOut);
  const G = {x: 270, y: 1820, h: 1250};
  const splash = frame - A;
  return (
    <Rig s0={1.05} s1={1.14} x0={20} x1={-30} r0={1} r1={-2} impacts={[{at: A, amp: 30, zoom: 0.06}, {at: B, amp: 14}]} whipIn="right">
      <TerraceBG t={t + 30} horizon={820} balY={1300} px={frame * 3} lights />
      <PlacedPuppet outfit={GUESTS[1]} x={G.x} y={G.y} height={G.h} light={TERRACE_LIGHT} pose={{shR: lerp(-10, 40, fright), elR: lerp(-120, -150, fright), shL: -20 - fright * 30, elL: -40, lean: -fright * 8}} expr={{eyesWide: fright, mouthOpen: fright * 0.7, browRaise: fright}} handProps={{R: <Flute x={0} y={20} s={1.4} fill={lerp(0.7, 0.1, fright)} />}} />
      {/* champagne splash */}
      <Svg>
        {splash > 0 &&
          Array.from({length: 16}).map((_, i) => {
            const a = -Math.PI / 2 + (random(`b05s${i}`) - 0.5) * 1.6;
            const v = 20 + random(`b05v${i}`) * 26;
            return <circle key={i} cx={G.x + 230 + Math.cos(a) * v * splash} cy={G.y - 1180 + Math.sin(a) * v * splash + splash * splash * 2.2} r={10 + random(`b05r${i}`) * 12} fill="#f6d77a" opacity={0.9} />;
          })}
      </Svg>
      {frame < B ? <PopIn x={760} y={1780} h={1150} age={frame - A} seed="b05a" pose={POSES[1]} flip /> : <Rastro x={760} y={1780} height={1200} life={0.5 + (frame - B) / 20} frame={frame} seed="b05b" />}
      {frame >= B && <PopIn x={980} y={1300} h={420} age={frame - B} seed="b05c" pose={POSES[5]} />}
      <Flash k={kf(frame, [A, A + 1, A + 4, B, B + 1, B + 3], [0, 0.7, 0, 0, 0.4, 0], (x) => x)} />
      <PlaceTag text="VARANDA" k={kf(frame, [0, 4], [0, 1], easeOut)} y={640} rot={-4} color="#ff9ad5" />
      <Finish vignette={0.45} />
    </Rig>
  );
};

export const B06Wc: React.FC = () => {
  const {frame, t} = useShot();
  const A = 1;
  const B = 15;
  const fright = kf(frame, [A, A + 3], [0, 1], easeOut);
  return (
    <Rig s0={1.05} s1={1.12} x0={-20} x1={20} r0={-1} r1={2} impacts={[{at: A, amp: 30, zoom: 0.06}, {at: B, amp: 14}]} whipIn="left">
      <RestroomWall
        t={t + 50}
        mirror={
          <AbsoluteFill>
            <MirrorRoom />
            {frame >= A && frame < B && <PlacedDavi x={700} y={2000} height={1300} light={MARBLE_LIGHT} pose={POSES[4]} expr={{smile: 0.8}} flip />}
          </AbsoluteFill>
        }
      />
      <PlacedPuppet outfit={GUESTS[0]} x={330} y={2050} height={1500} light={MARBLE_LIGHT} pose={{shL: -30 - fright * 80, elL: -60, shR: 20 + fright * 70, elR: 60, lean: -fright * 6}} expr={{eyesWide: fright, mouthOpen: fright, browRaise: fright}} />
      {frame < B ? <PopIn x={790} y={2000} h={1300} age={frame - A} seed="b06a" pose={POSES[4]} light={MARBLE_LIGHT} /> : <Rastro x={790} y={2000} height={1300} life={0.45 + (frame - B) / 16} frame={frame} seed="b06b" />}
      <Flash k={kf(frame, [A, A + 1, A + 4, B, B + 1, B + 3], [0, 0.7, 0, 0, 0.6, 0], (x) => x)} />
      <PlaceTag text="BANHEIRO" k={kf(frame, [0, 4], [0, 1], easeOut)} y={640} rot={5} color="#9dff8a" />
      <Finish vignette={0.45} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b07/b08 — mic map goes crazy */

/** 30 claps scattered over the plan (map px). */
const CLAPS = Array.from({length: 30}).map((_, i) => {
  const room = ROOMS[i % ROOMS.length];
  return {x: room.x + 30 + random(`cl-x${i}`) * (room.w - 60), y: room.y + 60 + random(`cl-y${i}`) * (room.h - 90), at: i * 0.6};
});

const MicMap: React.FC<{frame: number; t: number; fill: number; red: number}> = ({frame, t, fill, red}) => (
  <AbsoluteFill>
    <TerracePlan t={t} />
    <Svg>
      {/* rings from every mic toward the claps (triangulation circles) */}
      {MICS.map(([mx, my], m) =>
        Array.from({length: 5}).map((_, k) => {
          const r = ((frame * 22 + k * 180 + m * 90) % 900) + 40;
          return <circle key={`${m}-${k}`} cx={mx} cy={my} r={r} fill="none" stroke={red > 0.5 ? '#ff5a5a' : '#5fd4ff'} strokeWidth={4} opacity={0.5 * (1 - r / 940)} />;
        }),
      )}
      {CLAPS.map((c, i) => {
        const k = clamp((fill * 30 - i) / 1.5);
        if (k <= 0) return null;
        return (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={22 + (1 - k) * 60} fill="#ff3b3b" opacity={0.25 * k} />
            <circle cx={c.x} cy={c.y} r={14 * k} fill="#ff3b3b" stroke="#fff" strokeWidth={3} />
          </g>
        );
      })}
      {/* lines from the mics to random claps: the triangulation goes nowhere */}
      {red > 0 &&
        Array.from({length: 18}).map((_, i) => {
          const c = CLAPS[Math.floor(random(`ml${i}${Math.floor(frame / 3)}`) * 30)];
          const [mx, my] = MICS[i % 3];
          return <line key={i} x1={mx} y1={my} x2={c.x} y2={c.y} stroke="#ff5a5a" strokeWidth={3} opacity={0.6 * red} strokeDasharray="12 10" />;
        })}
      {MICS.map(([mx, my], i) => (
        <Mic key={i} x={mx} y={my} s={1.1} red={red} />
      ))}
    </Svg>
  </AbsoluteFill>
);

export const B07Mics: React.FC = () => {
  const {frame, t, p} = useShot();
  return (
    <Rig s0={1.15} s1={1.0} r0={-3} r1={0} whipIn="zoom" oy={1060} ease={(x) => x}>
      <MicMap frame={frame} t={t} fill={lerp(0.35, 1, p)} red={0} />
      <Chip x={540} y={1250} text="LOCALIZANDO…" k={kf(frame, [2, 8], [0, 1], easeOut)} color="#5fd4ff" size={48} />
      <Finish vignette={0.4} grain={0.1} />
    </Rig>
  );
};

export const B08Erro: React.FC = () => {
  const {frame, t} = useShot();
  const g = frame < 3 ? 1 : 0.35 + 0.65 * (random(`b08g${Math.floor(frame / 2)}`) > 0.55 ? 1 : 0.3);
  return (
    <Rig s0={1.0} s1={1.08} impacts={[{at: 0, amp: 30, dur: 20, zoom: 0.05}]}>
      <Glitch k={g} frame={frame} seed="b08">
        <MicMap frame={frame} t={t} fill={1} red={1} />
      </Glitch>
      <AbsoluteFill style={{background: 'rgba(255,30,40,0.12)', mixBlendMode: 'screen'}} />
      {['?', '?', '?'].map((q, i) => (
        <div key={i} style={{position: 'absolute', left: MICS[i][0] - 30 + (i === 1 ? -60 : 30), top: MICS[i][1] - (i === 2 ? 160 : -60), fontFamily: HUD_FONT, fontWeight: 700, fontSize: 90, color: '#ff5a5a', transform: `rotate(${Math.sin(frame * 0.9 + i) * 15}deg)`, textShadow: '0 0 20px #000'}}>
          {q}
        </div>
      ))}
      <Stamp x={540 + (random(`b08x${Math.floor(frame / 2)}`) - 0.5) * 16 * g} y={1100} text="ERRO" sub="LOCALIZAÇÃO: ???" k={kf(frame, [0, 5], [0, 1], easeOut)} rot={-7} size={150} />
      <Finish vignette={0.5} grain={0.18} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b09 — slow-mo: 31st jump lands by Lia, Rocha glued to his tablet */

export const B09Table: React.FC = () => {
  const {frame, t} = useShot();
  const ts = t * 0.25; // slow motion clock
  const A = 2;
  const life = (frame - A) / 120; // slow Rastro
  const rise = kf(frame, [A, A + 24], [0, 1], easeOut);
  const DX = 150;
  return (
    <Rig s0={1.08} s1={1.18} x0={-10} x1={10} r0={-1} r1={0.5} oy={1250} ease={(x) => x}>
      <TerraceBG t={ts + 80} horizon={640} balY={930} px={0} />
      <ChairBack x={LIA_SEAT.x} y={1330} s={1.05} />
      <ChairBack x={760} y={1330} s={1.05} />
      {/* Davi materialises crouched just behind Lia's chair */}
      {frame >= A && (
        <AbsoluteFill style={{opacity: kf(frame, [A, A + 8], [0, 1])}}>
          <PlacedDavi x={DX} y={1640} height={720} light={TERRACE_LIGHT} pose={{facing: 0.5, hipL: -60, knL: 95, hipR: -40, knR: 80, shR: lerp(10, 60, rise), elR: lerp(0, 10, rise), shL: -20, elL: -30, lean: 10, bob: 120}} expr={{halfSmile: 0.7, lookX: 0.7, lookY: 0.3}} />
        </AbsoluteFill>
      )}
      <PlacedLia x={LIA_SEAT.x} y={LIA_SEAT.y} height={SIT_H} light={TERRACE_LIGHT} pose={{facing: 0.35, shR: 18, elR: -70, shL: lerp(-16, -40, rise), elL: 10, headTilt: 3}} expr={{eyesWide: kf(frame, [A + 6, A + 18], [0, 0.7]), browRaise: kf(frame, [A + 6, A + 18], [0, 0.9]), lookX: kf(frame, [A + 10, A + 24], [0.2, -0.8]), smile: kf(frame, [20, 34], [0, 0.4])}} />
      <PlacedAgent variant="rochaGala" x={760} y={1545} height={SIT_H + 20} light={TERRACE_LIGHT} pose={{facing: 0.2, shL: 25, elL: 95, shR: -25, elR: -95, headTilt: 10}} expr={{lookY: 0.9, lookX: -0.1, smile: 0.15}} />
      <DinnerTable x={TABLE.x} y={TABLE.y} s={TABLE.s} t={ts} />
      {/* Rocha's tablet above the table edge (he only sees ERRO) */}
      <Svg>
        <Tablet x={760} y={1080} s={0.62} rot={-6} t={t} alarm={1} />
      </Svg>
      <Rastro x={DX} y={1640} height={760} life={life} frame={Math.floor(frame / 3)} seed="b09r" />
      <Particles t={ts} seed="b09" count={30} bokeh={10} driftX={-2} />
      <Chip x={240} y={1000} text="31" k={kf(frame, [A + 2, A + 8], [0, 1], easeOut)} color="#3be08a" size={60} />
      <SlowMoGrade />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b10 — hands find each other under the table */

const Hands: React.FC<{k: number; t: number}> = ({k, t}) => {
  const dx = lerp(420, 40, k);
  return (
    <Svg>
      <g transform={`translate(${540 + dx},${1060}) rotate(-12)`}>
        <path d="M 60,-110 L 900,-150 L 900,170 L 70,120 Z" fill={DAVI_OUTFIT.top.base} />
        <path d="M 60,-110 L 140,-114 L 150,124 L 70,120 Z" fill={DAVI_OUTFIT.top.shade} />
        <ellipse cx={-30} cy={0} rx={130} ry={100} fill={DAVI_OUTFIT.skin.base} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-190 - i * 6} y={-80 + i * 46} width={130} height={46} rx={23} fill={i % 2 ? DAVI_OUTFIT.skin.light : DAVI_OUTFIT.skin.base} stroke={DAVI_OUTFIT.skin.shade} strokeWidth={4} />
        ))}
        <rect x={-110} y={-120} width={110} height={50} rx={25} fill={DAVI_OUTFIT.skin.base} stroke={DAVI_OUTFIT.skin.shade} strokeWidth={4} transform="rotate(-25 -55 -95)" />
      </g>
      <g transform={`translate(${540 - 60},${1120 + Math.sin(t * 2) * 4}) rotate(8)`}>
        <path d="M -60,-70 L -900,-40 L -900,140 L -60,80 Z" fill={LIA_OUTFIT.skin.base} />
        <rect x={-150} y={-74} width={40} height={156} rx={14} fill="#e2b04a" />
        <ellipse cx={20} cy={0} rx={110} ry={80} fill={LIA_OUTFIT.skin.base} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={70} y={-64 + i * 36} width={120 - i * 8} height={34} rx={17} fill={LIA_OUTFIT.skin.light} stroke={LIA_OUTFIT.skin.shade} strokeWidth={4} />
        ))}
      </g>
    </Svg>
  );
};

export const B10Hands: React.FC = () => {
  const {frame, t} = useShot();
  const M = wl('b10_hands', 'L10', 6); // "mão"
  const reach = kf(frame, [0, M], [0, 1], (x) => 1 - Math.pow(1 - x, 2));
  const beat = (n: number) => kf(frame, [M + n * 12, M + n * 12 + 2, M + n * 12 + 10], [0, 1, 0], (x) => x);
  const hb = Math.max(beat(0), beat(1));
  return (
    <Rig s0={1.0} s1={1.12} x0={20} x1={-10} r0={1} r1={-1} oy={1100} ease={(x) => x} impacts={[{at: M, amp: 6, dur: 8, zoom: 0.03}]}>
      {/* under the table: dark, tablecloth hem on top, Lia's green dress on the left */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 60%, #2a1c22 0%, #0b0709 100%)'}} />
      <Svg>
        <path d="M-200,1200 Q100,1250 380,1500 L380,2200 L-200,2200 Z" fill={LIA_OUTFIT.top.base} />
        <path d="M-200,1200 Q100,1250 380,1500" stroke={LIA_OUTFIT.top.light} strokeWidth={10} fill="none" opacity={0.6} />
        {/* table legs + Rocha's shoes in the far right */}
        <rect x={880} y={700} width={40} height={1100} fill="#3a2b22" />
        <path d="M900,1650 l120,0 q40,0 40,30 l-160,0 Z" fill="#0c0c0f" />
        {/* tablecloth hem */}
        <path d={`M-200,-200 L1280,-200 L1280,560 ${Array.from({length: 12}).map((_, i) => `Q${1280 - (i + 0.5) * 124},${640 + Math.sin(t * 2 + i) * 10} ${1280 - (i + 1) * 124},560`).join(' ')} Z`} fill="#eeeae4" />
        <path d="M-200,560 L1280,560" stroke="#c9c3ba" strokeWidth={6} opacity={0.5} />
      </Svg>
      <Hands k={reach} t={t * 0.3} />
      {/* clasp: soft blue spark + heartbeat ring */}
      <Svg>
        {hb > 0 && <circle cx={540} cy={1090} r={180 + hb * 120} fill="none" stroke="#ff7aa8" strokeWidth={10 * hb} opacity={hb} />}
        {frame >= M &&
          Array.from({length: 4}).map((_, i) => {
            const a = frame - M - i * 4;
            if (a < 0) return null;
            const x = 540 + (i - 1.5) * 90 + Math.sin(a * 0.3 + i) * 20;
            const y = 900 - a * 9;
            const o = clamp(1 - a / 28);
            return <path key={i} d={`M${x},${y} c-20,-26 -60,-6 -40,22 l40,34 l40,-34 c20,-28 -20,-48 -40,-22 Z`} fill="#ff5a8a" opacity={o} />;
          })}
      </Svg>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 57%, rgba(90,190,255,0.35) 0%, rgba(90,190,255,0) 30%)', opacity: kf(frame, [M, M + 6], [0, 1])}} />
      <SlowMoGrade />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};


