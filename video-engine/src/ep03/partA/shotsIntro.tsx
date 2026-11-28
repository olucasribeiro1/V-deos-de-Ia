import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import type {Expression, Pose} from '../../characters/types';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {Bust, PlacedStudent, VibeLines, studentOutfit, vibe, ACADEMY, PlacedWide} from '../characters';
import {AcademyCourtyard, Crack} from '../sets/Academy';
import {Shockwave} from '../../fx/Shockwave';
import {
  Chip,
  CutFlash,
  DAY_LIGHT,
  EnergyLines,
  Finish,
  HudTag,
  JuiceCup,
  Phone,
  Rig,
  ShotP,
  SfxWord,
  SpeedLines,
  Stamp,
  Svg,
  SweatDrop,
  W,
  H,
  abs,
  clamp,
  easeOut,
  ev,
  kf,
  lerp,
  walkPose,
} from './kit';

/** Wraps children in a per-frame vibration jitter. */
export const Jit: React.FC<{fr: number; amp?: number; seed?: string; children: React.ReactNode}> = ({fr, amp = 6, seed = 'j', children}) => {
  const v = vibe(fr, amp, seed);
  return <AbsoluteFill style={{transform: `translate(${v.x}px,${v.y}px) rotate(${v.r}deg)`}}>{children}</AbsoluteFill>;
};

/** Flat comic backdrop: radial gradient + halftone. */
const PopBg: React.FC<{c1: string; c2: string; t: number}> = ({c1, c2, t}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${c1}, ${c2} 75%)`}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.12) 3px, transparent 3.5px)', backgroundSize: '26px 26px', backgroundPosition: `${t * 10}px 0`}} />
    <Svg>
      {Array.from({length: 18}).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + t * 0.2;
        return <path key={i} d={`M 540,960 L ${540 + Math.cos(a) * 1600},${960 + Math.sin(a) * 1600} L ${540 + Math.cos(a + 0.12) * 1600},${960 + Math.sin(a + 0.12) * 1600} Z`} fill="#fff" opacity={0.07} />;
      })}
    </Svg>
  </AbsoluteFill>
);

const Blurred: React.FC<{px?: number; children: React.ReactNode; blur?: number}> = ({children, blur = 10}) => (
  <AbsoluteFill style={{filter: `blur(${blur}px)`, transform: 'scale(1.1)'}}>{children}</AbsoluteFill>
);

/* 1. "O Davi tem o poder de vibrar." — close-up, vibrating, "PODER: VIBRAR 📳". */
export const SPower: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const V = ev(p, 'L1', 6);
  const amp = fr < V ? 3 : 9;
  return (
    <Rig dur={p.dur} zoom={[1.22, 1.04]} pow={3} punches={[{at: V, amt: 0.08}]}>
      <PopBg c1="#3b6fd8" c2="#14214f" t={t} />
      <Jit fr={fr} amp={amp} seed="pw">
        <Bust outfit={DAVI_OUTFIT} cx={540} cy={930} r={250} pose={{facing: 0, shL: -10, shR: 10}} expr={{smile: 0.35, eyesWide: 0.25, browRaise: 0.4, lookX: 0, lookY: 0}} light={DAY_LIGHT} />
      </Jit>
      <Svg>
        <VibeLines cx={540} cy={930} w={560} h={560} k={fr < V ? 0.5 : 1} frame={fr} />
      </Svg>
      <EnergyLines x={540} y={1000} r0={420} r1={760} k={kf(fr, [V, V + 4], [0, 0.8])} frame={fr} seed="pw" count={14} />
      <HudTag x={540} y={1610} align="center" label="PODER" value="VIBRAR 📳" k={kf(fr, [V, V + 5], [0, 1])} color="#ffd23a" size={110} />
      <Finish vignette={0.5} grain={0.1} />
      <CutFlash frames={4} />
    </Rig>
  );
};

/* 2. "Só isso." — full body, deadpan shrug, still buzzing. */
export const SShrug: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const sh = kf(fr, [2, 8], [0, 1], easeOut);
  const pose: Pose = {shL: lerp(-7, -38, sh), elL: lerp(6, -80, sh), shR: lerp(7, 38, sh), elR: lerp(-6, 80, sh), headTilt: -6 * sh, bob: -10 * sh};
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} whip="l">
      <PopBg c1="#f2c14e" c2="#c2701c" t={t} />
      <Svg>
        <ellipse cx={540} cy={1560} rx={260} ry={40} fill="#000" opacity={0.2} />
      </Svg>
      <Jit fr={fr} amp={5} seed="sh">
        <PlacedDavi x={540} y={1560} height={1050} pose={pose} expr={{halfSmile: 0.6, smile: 0, browRaise: 0.7 * sh, blink: 0.35, lookX: 0, lookY: 0}} light={DAY_LIGHT} />
      </Jit>
      <Svg>
        <VibeLines cx={540} cy={1080} w={520} h={760} k={0.8} frame={fr} />
      </Svg>
      <Chip x={540} y={1700} text="SÓ ISSO." k={kf(fr, [3, 9], [0, 1])} color="#1a1420" fg="#ffd23a" size={52} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 3. "Igual celular no silencioso." — split screen: phone buzzing on a table | Davi in the same stiff pose. */
export const SPhone: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const pv = vibe(fr, 7, 'ph');
  const buzz = Math.floor(fr / 6) % 2 === 0;
  const lab = kf(fr, [ev(p, 'L1', 12), ev(p, 'L1', 12) + 5], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} whip="r">
      {/* left: table */}
      <AbsoluteFill style={{background: 'linear-gradient(#2c3352, #1a1f36)'}} />
      <Svg>
        <rect x={0} y={1180} width={540} height={740} fill="#8a5a36" />
        <rect x={0} y={1180} width={540} height={24} fill="#a8744a" />
        <ellipse cx={270} cy={1040 + 120} rx={170} ry={26} fill="#000" opacity={0.3} />
        <g transform={`translate(${pv.x * (buzz ? 1 : 0.3)},${pv.y * (buzz ? 1 : 0.3)})`}>
          <Phone x={270} y={960} w={230} rot={pv.r * 3} />
        </g>
        <VibeLines cx={270} cy={960} w={250} h={460} k={buzz ? 1 : 0.4} frame={fr} />
      </Svg>
      {/* right: Davi, same pose */}
      <AbsoluteFill style={{clipPath: 'polygon(560px 0, 1080px 0, 1080px 1920px, 520px 1920px)'}}>
        <AbsoluteFill style={{background: 'linear-gradient(#3b6fd8, #14214f)'}} />
        <Jit fr={fr} amp={buzz ? 7 : 2} seed="pd">
          <PlacedDavi x={810} y={1450} height={880} pose={{shL: -2, elL: 0, shR: 2, elR: 0, hipL: 0, hipR: 0}} expr={{smile: 0, eyesWide: 0.6, browRaise: 0.2, lookX: -0.4, lookY: 0}} light={DAY_LIGHT} />
        </Jit>
        <Svg>
          <VibeLines cx={810} cy={1020} w={300} h={700} k={buzz ? 1 : 0.4} frame={fr} />
        </Svg>
      </AbsoluteFill>
      <Svg>
        <line x1={560} y1={0} x2={520} y2={1920} stroke="#ffd23a" strokeWidth={14} />
      </Svg>
      <Chip x={270} y={1660} text="📳 CELULAR" k={lab} color="#ffffff" size={42} />
      <Chip x={810} y={1660} text="📳 DAVI" k={kf(fr, [ev(p, 'L1', 12) + 4, ev(p, 'L1', 12) + 9], [0, 1])} color="#ffd23a" size={42} />
      {buzz && <SfxWord x={270} y={660} text="BZZ" k={fr % 12} size={80} color="#ffffff" />}
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 4. "Numa academia de gente que" — establishing courtyard, crane down; a flyer swoops past. */
export const SAcademy: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const py = kf(fr, [0, p.dur], [-320, 0], easeOut);
  const fly = clamp((fr - 18) / 14);
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.0]} pow={3}>
      <AcademyCourtyard t={t} py={py} px={-fr * 1.5} />
      {[
        {seed: 1, x: 220, y: 1500, h: 430, ph: 0, flip: false},
        {seed: 4, x: 860, y: 1540, h: 450, ph: 1.6, flip: true},
        {seed: 7, x: 560, y: 1430, h: 340, ph: 3, flip: false},
        {seed: 9, x: 380, y: 1700, h: 600, ph: 2.2, flip: true},
      ].map((s) => (
        <PlacedStudent key={s.seed} seed={s.seed} x={s.x + (s.flip ? -1 : 1) * fr * 2} y={s.y + py} height={s.h} flip={s.flip} pose={walkPose(t, s.ph, 0.8)} light={DAY_LIGHT} expr={{smile: 0.4, lookX: s.flip ? -0.6 : 0.6}} />
      ))}
      {/* flyer crossing */}
      {fly > 0 && (
        <div style={{position: 'absolute', left: lerp(-300, 1300, fly), top: 700 - fly * 120, transform: 'rotate(82deg)'}}>
          <PlacedStudent seed={12} x={0} y={260} height={520} pose={{shL: 178, elL: 0, shR: -178, elR: 0, hipL: -4, hipR: 4}} expr={{smile: 0.9, eyesWide: 0.3}} light={DAY_LIGHT} />
        </div>
      )}
      {fly > 0 && fly < 1 && <SpeedLines k={0.5} t={t} />}
      <Chip x={540} y={1700} text="ACADEMIA DE PODERES" k={kf(fr, [4, 10], [0, 1])} color={ACADEMY.navy} fg="#ffd23a" size={44} />
      <Finish vignette={0.35} grain={0.08} />
    </Rig>
  );
};

const StoneWall: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x} y={0} width={W} height={H} fill="#d8cbb0" />
    {Array.from({length: 22}).map((_, r) =>
      Array.from({length: 5}).map((__, c) => (
        <rect key={`${r}-${c}`} x={x + c * 150 - (r % 2) * 75} y={r * 90} width={146} height={86} fill={random(`sw${r}${c}`) > 0.5 ? '#e3d7bd' : '#d2c3a5'} stroke="#b8a888" strokeWidth={4} />
      )),
    )}
    <rect x={x} y={0} width={26} height={H} fill="#9c8d74" />
  </g>
);

/* 5. "voa e soca prédio," — a student punches the building (crack + shockwave); flyer and energy blast in the background. */
export const SPunch: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const HIT = ev(p, 'L2', 7);
  const wind = kf(fr, [0, HIT - 3], [0, 1]);
  const ext = kf(fr, [HIT - 3, HIT], [0, 1], easeOut);
  const pose: Pose =
    fr < HIT - 3
      ? {lean: -8 * wind, shR: lerp(10, -40, wind), elR: lerp(-6, -110, wind), shL: 20, elL: 60, hipL: -14, hipR: 18, knL: 10}
      : {lean: lerp(-8, 10, ext), shR: lerp(-40, 90, ext), elR: lerp(-110, 0, ext), shL: lerp(20, -30, ext), elL: 70, hipL: -20, hipR: 24, knL: 14};
  const beam = kf(fr, [4, 10], [0, 1]) * kf(fr, [24, 30], [1, 0]);
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.12]} whip="u" shakes={[{at: HIT, dur: 16, amp: 30}]} punches={[{at: HIT, amt: 0.1}]}>
      <Blurred blur={6}>
        <AcademyCourtyard t={t} px={-200} horizonY={1300} gate={false} />
      </Blurred>
      {/* background energy blast */}
      <Svg>
        <g opacity={beam}>
          <line x1={-50} y1={560} x2={620} y2={430} stroke="#ff8a2a" strokeWidth={60} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 30px #ff8a2a)'}} />
          <line x1={-50} y1={560} x2={620} y2={430} stroke="#fff3c4" strokeWidth={22} strokeLinecap="round" />
          <circle cx={620} cy={430} r={50 + Math.sin(fr) * 8} fill="#fff3c4" style={{filter: 'drop-shadow(0 0 30px #ff8a2a)'}} />
        </g>
      </Svg>
      {/* flyer in the sky */}
      <div style={{position: 'absolute', left: lerp(120, 560, fr / p.dur), top: 360 - fr * 2, transform: 'rotate(70deg)'}}>
        <PlacedStudent seed={12} x={0} y={160} height={320} pose={{shL: 178, shR: -178, elL: 0, elR: 0}} light={DAY_LIGHT} expr={{smile: 0.9}} />
      </div>
      <Svg>
        <StoneWall x={830} />
        <Crack x={845} y={1000} r={330} k={kf(fr, [HIT, HIT + 6], [0, 1], easeOut)} seed="pc" />
        {fr >= HIT &&
          Array.from({length: 14}).map((_, i) => {
            const a = Math.PI * (0.6 + random(`db${i}`) * 0.8);
            const v = 10 + random(`dv${i}`) * 18;
            const age = fr - HIT;
            return <rect key={i} x={845 + Math.cos(a) * v * age} y={1000 + Math.sin(a) * v * age + 0.8 * age * age - 200 * 0} width={18} height={14} fill="#b8a888" opacity={clamp(1 - age / 25)} transform={`rotate(${age * 20 + i * 30} ${845 + Math.cos(a) * v * age} ${1000 + Math.sin(a) * v * age})`} />;
          })}
      </Svg>
      <Shockwave cx={845} cy={1000} age={fr - HIT} rings={3} speed={40} maxR={700} />
      <PlacedStudent seed={22} x={470} y={1660} height={920} pose={pose} expr={{smile: -0.2, browTilt: -0.9, mouthOpen: fr >= HIT - 2 ? 0.7 : 0.1, lookX: 1, lookY: 0}} light={DAY_LIGHT} />
      {fr >= HIT && <SfxWord x={820} y={720} text="POW!" k={fr - HIT} color="#ff5a3a" size={130} rot={8} />}
      <Finish vignette={0.4} grain={0.08} />
    </Rig>
  );
};

/* 6. "ele era o último do ranking." — the corner: Davi alone, vibrating a juice cup. */
export const SCorner: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const U = ev(p, 'L2', 12);
  const pose: Pose = {shL: 22, elL: 95, shR: -22, elR: -95, headTilt: 8, bob: 6};
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[120, 0, 0, 0]} whip="r" origin={[640, 1100]}>
      <Blurred blur={7}>
        <AcademyCourtyard t={t} px={-520} horizonY={1240} />
      </Blurred>
      {/* background students having fun */}
      <PlacedStudent seed={5} x={180} y={1420} height={500} blur={3} pose={{shL: -150, elL: 0, shR: 160, elR: 0}} expr={{smile: 1, mouthOpen: 0.5}} light={DAY_LIGHT} />
      <PlacedStudent seed={8} x={330} y={1400} height={480} blur={3} flip pose={{shL: -20, shR: 40, elR: -60}} expr={{smile: 1, mouthOpen: 0.4}} light={DAY_LIGHT} />
      {/* pillar */}
      <Svg>
        <rect x={880} y={0} width={180} height={1640} fill="#efe6d2" />
        <rect x={880} y={0} width={40} height={1640} fill="#ffffff" opacity={0.5} />
        <rect x={1020} y={0} width={40} height={1640} fill="#c9bb9c" />
        <ellipse cx={690} cy={1650} rx={210} ry={34} fill="#000" opacity={0.22} />
      </Svg>
      <Jit fr={fr} amp={3} seed="cn">
        <PlacedDavi
          x={690}
          y={1650}
          height={880}
          pose={pose}
          expr={{smile: -0.3, browTilt: 0.7, lookX: 0, lookY: 0.7, blink: 0.2}}
          light={DAY_LIGHT}
          heldProp={<JuiceCup x={0} y={-470} s={1.1} t={t} slosh={1} />}
        />
      </Jit>
      <Svg>
        <VibeLines cx={690} cy={1180} w={180} h={260} k={0.9} frame={fr} n={2} width={8} />
      </Svg>
      <Stamp x={690} y={600} text="ÚLTIMO" color="#e5484d" k={fr - U} size={90} rot={-7} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 7. "Trezentos e doze" — punch-in on the rank board: scroll from #1 down to #312 DAVI. */
const BOARD: [string, string, string][] = [
  ['#1', 'BRUNO ★', 'SUPERFORÇA + ESCUDO'],
  ['#2', 'LARA', 'VOO'],
  ['#3', 'KAI', 'RAJADA'],
  ['#4', 'JÚLIA', 'TELECINESE'],
  ['#5', 'RAFA', 'FOGO'],
  ['#6', 'NINA', 'GELO'],
  ['⋮', '', ''],
  ['#309', 'PEDRO', 'ESPIRRO FORTE'],
  ['#310', 'BIA', 'ADIVINHA A HORA'],
  ['#311', 'TOMÁS', 'BRILHA NO ESCURO'],
  ['#312', 'DAVI', 'VIBRAR 📳'],
];
export const SBoard: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const scroll = kf(fr, [0, 15], [0, 1], (x) => x * x * (3 - 2 * x));
  const ROW = 150;
  const y0 = lerp(520, 1050 - (BOARD.length - 1) * ROW, scroll);
  const speed = fr > 1 && fr < 15 ? Math.sin((fr / 15) * Math.PI) : 0;
  const hit = fr >= 15;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} punches={[{at: 15, amt: 0.14}]} shakes={[{at: 15, dur: 10, amp: 12}]}>
      <AbsoluteFill style={{background: 'linear-gradient(#1a2240, #0b1024)'}} />
      <div style={{position: 'absolute', overflow: 'hidden', left: 70, right: 70, top: 0, bottom: 0, background: '#0f1630', borderLeft: `12px solid ${ACADEMY.gold}`, borderRight: `12px solid ${ACADEMY.gold}`, filter: speed > 0.1 ? `blur(${speed * 8}px)` : undefined}}>
        {BOARD.map(([pos, name, pw], i) => {
          const last = i === BOARD.length - 1;
          const y = y0 + i * ROW;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 20,
                right: 20,
                top: y,
                height: ROW - 18,
                borderRadius: 14,
                background: last ? (hit ? '#e5484d' : '#5a1f2a') : i === 0 ? 'rgba(232,184,74,0.25)' : 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 26px',
                gap: 24,
                color: '#fff',
                fontFamily: CAPTION_FONT,
                fontWeight: 700,
                boxShadow: last && hit ? '0 0 40px #e5484d' : undefined,
                transform: last && hit ? `scale(${1 + 0.06 * Math.max(0, 1 - (fr - 15) / 8)})` : undefined,
              }}
            >
              <div style={{fontSize: 64, width: 190, color: i === 0 ? ACADEMY.gold : '#fff'}}>{pos}</div>
              <div style={{fontSize: 56, width: 250}}>{name}</div>
              <div style={{fontFamily: HUD_FONT, fontSize: 30, letterSpacing: 1, opacity: 0.85, textAlign: 'right', flex: 1, whiteSpace: 'nowrap'}}>{pw}</div>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(#0b1024 0%, rgba(11,16,36,0) 12%, rgba(11,16,36,0) 88%, #0b1024 100%)'}} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 8. "de trezentos e doze." — Davi's sad face, juice vibrating, tiny rain cloud. */
export const SSadFace: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} origin={[540, 900]}>
      <Blurred blur={12}>
        <AcademyCourtyard t={t} px={-700} horizonY={1100} />
      </Blurred>
      <AbsoluteFill style={{backdropFilter: 'saturate(0.45) brightness(0.85)'}} />
      <Jit fr={fr} amp={3} seed="sf">
        <Bust outfit={DAVI_OUTFIT} cx={540} cy={940} r={260} pose={{headTilt: 6}} expr={{smile: -0.7, browTilt: 1, lookX: 0.1, lookY: 0.6, blink: 0.15}} light={DAY_LIGHT} />
      </Jit>
      <Svg>
        {/* rain cloud */}
        <g transform={`translate(${540 + Math.sin(t * 2) * 10},${560})`}>
          <ellipse cx={0} cy={0} rx={150} ry={56} fill="#7b8194" />
          <ellipse cx={-80} cy={14} rx={80} ry={44} fill="#7b8194" />
          <ellipse cx={70} cy={-26} rx={90} ry={56} fill="#868ca0" />
          {Array.from({length: 7}).map((_, i) => {
            const ph = (t * 2.2 + i / 7) % 1;
            return <line key={i} x1={-110 + i * 36} y1={50 + ph * 160} x2={-116 + i * 36} y2={80 + ph * 160} stroke="#8fd8ff" strokeWidth={8} strokeLinecap="round" opacity={1 - ph} />;
          })}
        </g>
        <JuiceCup x={760 + vibe(fr, 6, 'jc').x} y={1680} s={1.6} t={t} slosh={1} />
        <VibeLines cx={760} cy={1520} w={240} h={300} k={0.9} frame={fr} n={2} width={8} />
        <SweatDrop x={790} y={760} s={60} k={clamp(fr / 30)} />
      </Svg>
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/* 9. "Apelido:" — two classmates pointing and laughing. */
export const SLaugh: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const lx: Expression = {smile: 1, mouthOpen: 0.6 + 0.3 * Math.abs(Math.sin(fr * 0.9)), blink: 1, browRaise: 0.6};
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} whip="l" rot={[-2, 1]}>
      <Blurred blur={8}>
        <AcademyCourtyard t={t} px={-120} horizonY={1180} />
      </Blurred>
      <PlacedStudent seed={31} x={330} y={1720} height={1000} pose={{lean: -8 + Math.sin(fr * 1.2) * 3, shR: -70, elR: -20, shL: 30, elL: 80, bob: Math.abs(Math.sin(fr * 1.2)) * -14}} expr={lx} light={DAY_LIGHT} />
      <PlacedStudent seed={44} x={760} y={1760} height={1040} flip pose={{lean: 10 + Math.sin(fr * 1.1 + 1) * 3, shL: -20, elL: 70, shR: 25, elR: -70, bob: Math.abs(Math.sin(fr * 1.1)) * -14}} expr={lx} light={DAY_LIGHT} />
      <SfxWord x={260} y={680} text="HAHA" k={fr} color="#ffffff" size={100} rot={-10} />
      <SfxWord x={820} y={620} text="HAHAHA" k={fr - 6} color="#ffd23a" size={90} rot={8} />
      <Finish vignette={0.4} grain={0.08} />
    </Rig>
  );
};

/* 10. "Modo Vibra." — sticker slapped on Davi's back. */
const DaviBack: React.FC<{fr: number}> = ({fr}) => {
  const v = vibe(fr, 4, 'bk');
  const c = DAVI_OUTFIT.top;
  return (
    <g transform={`translate(${v.x},${v.y})`}>
      {/* neck */}
      <rect x={470} y={700} width={140} height={200} rx={40} fill={DAVI_OUTFIT.skin.shade} />
      {/* ears */}
      <ellipse cx={320} cy={560} rx={44} ry={64} fill={DAVI_OUTFIT.skin.base} />
      <ellipse cx={760} cy={560} rx={44} ry={64} fill={DAVI_OUTFIT.skin.base} />
      {/* head back: hair */}
      <circle cx={540} cy={520} r={235} fill={DAVI_OUTFIT.skin.base} />
      <path d="M 305,560 Q 290,250 540,250 Q 790,250 775,560 Q 760,700 540,720 Q 320,700 305,560 Z" fill={DAVI_OUTFIT.head.hairColor} />
      <path d="M 420,330 Q 540,290 660,330" stroke="#3a2818" strokeWidth={10} fill="none" />
      {/* shoulders / back */}
      <path d="M 60,1920 L 80,1120 Q 120,880 540,860 Q 960,880 1000,1120 L 1020,1920 Z" fill={c.base} />
      <path d="M 820,920 Q 980,980 1000,1120 L 1020,1920 L 900,1920 Z" fill={c.shade} opacity={0.6} />
      {/* hood lying on the back */}
      <path d="M 330,880 Q 540,820 750,880 Q 780,1080 540,1150 Q 300,1080 330,880 Z" fill={c.shade} />
      <path d="M 380,900 Q 540,860 700,900 Q 700,1040 540,1090 Q 380,1040 380,900 Z" fill="#8a5c12" opacity={0.5} />
    </g>
  );
};
export const SSticker: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const SL = 3;
  const handX = fr < SL ? lerp(1300, 620, easeOut(clamp(fr / SL))) : lerp(620, 1400, easeOut(clamp((fr - SL - 3) / 8)));
  const v = vibe(fr, 3, 'stk');
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.18]} shakes={[{at: SL, dur: 10, amp: 18}]} punches={[{at: SL, amt: 0.08}]} origin={[540, 1300]}>
      <Blurred blur={10}>
        <AcademyCourtyard t={t} px={-300} horizonY={1000} />
      </Blurred>
      <Svg>
        <DaviBack fr={fr} />
      </Svg>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${v.x}px,${v.y}px)`}}>
        <Stamp x={540} y={1180} text="MODO VIBRA" sub="📳 📳 📳" color="#e5484d" k={fr - SL} size={104} rot={-6} bg="#fff8e6" />
      </div>
      {/* the slapping hand */}
      <Svg>
        <g transform={`translate(${handX},1220) rotate(-8)`}>
          <rect x={0} y={-60} width={700} height={120} rx={60} fill={studentOutfit(31).top.base} />
          <rect x={-10} y={-60} width={50} height={120} fill="#eef0f3" />
          <ellipse cx={-60} cy={0} rx={110} ry={80} fill={studentOutfit(31).skin.base} />
          <ellipse cx={-120} cy={-50} rx={50} ry={26} fill={studentOutfit(31).skin.base} />
        </g>
      </Svg>
      {fr >= SL && <SfxWord x={300} y={1100} text="PLAFT!" k={fr - SL} color="#ffffff" size={90} rot={-12} />}
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 11. "Usavam ele pra massagem nas costas." — classmate lying on a bench; Davi's vibrating hands on his back. */
export const SMassage: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const sv = vibe(fr, 5, 'ms');
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.12]} pan={[-40, 0, 30, 0]} whip="d">
      <Blurred blur={7}>
        <AcademyCourtyard t={t} px={200} horizonY={1150} />
      </Blurred>
      <Svg>
        {/* bench */}
        <rect x={80} y={1260} width={920} height={60} rx={20} fill="#9c8d74" />
        <rect x={140} y={1320} width={70} height={260} fill="#7a6a52" />
        <rect x={870} y={1320} width={70} height={260} fill="#7a6a52" />
        {/* sign */}
        <g transform="translate(850,1090) rotate(6)">
          <rect x={-150} y={-70} width={300} height={140} rx={12} fill="#fff8e6" stroke="#1a1420" strokeWidth={6} />
          <text x={0} y={-10} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={44} fill="#1a1420">
            MASSAGEM
          </text>
          <text x={0} y={46} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={44} fill="#e5484d">
            R$ 2
          </text>
        </g>
      </Svg>
      {/* Davi standing behind the bench */}
      <Jit fr={fr} amp={6} seed="md">
        <PlacedDavi x={560} y={1560} height={880} pose={{lean: 14, shL: 40, elL: 30, shR: 25, elR: 40, headTilt: 6}} expr={{smile: 0.2, halfSmile: 0.4, lookX: 0, lookY: 0.8}} light={DAY_LIGHT} />
      </Jit>
      {/* classmate lying face down (rotated) */}
      <div style={{position: 'absolute', left: 540, top: 1215, transform: `translate(${sv.x}px,${sv.y}px) rotate(-90deg)`}}>
        <PlacedStudent seed={53} x={0} y={470} height={760} pose={{shL: -10, shR: 10}} expr={{smile: 1, blink: 1, mouthOpen: 0.3, browRaise: 0.8}} light={DAY_LIGHT} />
      </div>
      <Svg>
        <VibeLines cx={560} cy={1150} w={340} h={180} k={1} frame={fr} n={3} />
      </Svg>
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 12. "costas." — close-up of the blissed-out classmate: "AHHH~". */
export const SAhh: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.15, 1.25]} rot={[4, 2]} origin={[540, 980]}>
      <Blurred blur={12}>
        <AcademyCourtyard t={t} px={300} horizonY={900} />
      </Blurred>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(255,170,200,0.45), rgba(0,0,0,0) 60%)'}} />
      <Jit fr={fr} amp={9} seed="ah">
        <Bust outfit={studentOutfit(53)} cx={540} cy={1000} r={250} pose={{headTilt: -14}} expr={{smile: 1, blink: 1, mouthOpen: 0.75, browRaise: 1, browTilt: 0.6}} light={DAY_LIGHT} />
      </Jit>
      <Svg>
        <ellipse cx={400} cy={1060} rx={44} ry={24} fill="#ff7a9a" opacity={0.6} />
        <ellipse cx={680} cy={1060} rx={44} ry={24} fill="#ff7a9a" opacity={0.6} />
        {[0, 1, 2].map((i) => {
          const ph = (t * 1.5 + i / 3) % 1;
          return <path key={i} d="M 0,-20 C -30,-50 -60,-10 0,30 C 60,-10 30,-50 0,-20 Z" transform={`translate(${780 + i * 60},${760 - ph * 300}) scale(${0.8 + ph})`} fill="#ff5a8a" opacity={1 - ph} />;
        })}
      </Svg>
      <SfxWord x={540} y={1620} text="AHHHHH~" k={fr} color="#ffd23a" size={120} rot={-4} jitter={10} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 13. "E pra abrir pote de azeitona." — the lid pops off on "azeitona". */
const Jar: React.FC<{x: number; y: number; lidY: number; lidRot: number; t: number}> = ({x, y, lidY, lidRot, t}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-120} y={-300} width={240} height={300} rx={40} fill="rgba(220,240,230,0.5)" stroke="#ffffff" strokeWidth={6} />
    {Array.from({length: 14}).map((_, i) => (
      <g key={i}>
        <ellipse cx={-80 + (i % 5) * 40} cy={-40 - Math.floor(i / 5) * 60 + Math.sin(t * 50 + i) * 4} rx={26} ry={20} fill="#6e8c2a" stroke="#4a6418" strokeWidth={3} />
        <circle cx={-80 + (i % 5) * 40 + 8} cy={-40 - Math.floor(i / 5) * 60} r={7} fill="#e5484d" />
      </g>
    ))}
    <rect x={-120} y={-200} width={240} height={90} fill="#f4ecda" />
    <text x={0} y={-140} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={40} fill="#2e5a18">
      AZEITONAS
    </text>
    <g transform={`translate(0,${-310 + lidY}) rotate(${lidRot})`}>
      <rect x={-130} y={-40} width={260} height={56} rx={14} fill="#c9472a" />
      {Array.from({length: 9}).map((_, i) => (
        <rect key={i} x={-120 + i * 28} y={-36} width={10} height={48} fill="#9a3420" />
      ))}
    </g>
  </g>
);
export const SOlive: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const POP = ev(p, 'L3', 14);
  const age = fr - POP;
  const lidY = age < 0 ? 0 : -age * 60 + age * age * 1.6;
  const lidRot = age < 0 ? 0 : age * 28;
  const amp = age < 0 ? lerp(2, 9, clamp(fr / POP)) : 3;
  const jv = vibe(fr, amp, 'jar');
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} whip="r" shakes={[{at: POP, dur: 10, amp: 16}]} punches={[{at: POP, amt: 0.1}]} origin={[540, 1000]}>
      <Blurred blur={8}>
        <AcademyCourtyard t={t} px={-60} horizonY={1180} dusk />
      </Blurred>
      {/* classmate waiting with a fork */}
      <PlacedStudent seed={66} x={880} y={1780} height={1000} flip pose={{shL: -20, elL: 60, shR: 10}} expr={{smile: age >= 0 ? 1 : 0.2, eyesWide: age >= 0 ? 0.7 : 0.2, mouthOpen: age >= 0 ? 0.5 : 0, lookX: -0.8, lookY: 0.3}} light={DAY_LIGHT} />
      <Jit fr={fr} amp={amp * 0.7} seed="ov">
        <PlacedDavi x={360} y={1800} height={1060} pose={{shL: 25, elL: 95, shR: -10, elR: -40}} expr={{smile: 0.4, lookX: 0.6, lookY: 0.6, browRaise: 0.3}} light={DAY_LIGHT} />
      </Jit>
      <Svg>
        <g transform={`translate(${jv.x},${jv.y})`}>
          <Jar x={560} y={1200} lidY={lidY} lidRot={lidRot} t={t} />
        </g>
        {age < 0 && <VibeLines cx={560} cy={1050} w={260} h={300} k={0.9} frame={fr} />}
        {age >= 0 &&
          Array.from({length: 7}).map((_, i) => {
            const vx = (random(`ol${i}`) - 0.5) * 26;
            const vy = -20 - random(`olv${i}`) * 16;
            return <ellipse key={i} cx={560 + vx * age} cy={890 + vy * age + 1.4 * age * age} rx={26} ry={20} fill="#6e8c2a" stroke="#4a6418" strokeWidth={3} />;
          })}
      </Svg>
      {age >= 0 && <SfxWord x={560} y={700} text="POP!" k={age} color="#ffd23a" size={150} rot={-6} />}
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};
