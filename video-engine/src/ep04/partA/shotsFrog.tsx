import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {PlacedPuppet} from '../../characters/Puppet';
import {Bust, commuterOutfit} from '../../ep02qi/characters';
import type {Outfit, Pose} from '../../characters/types';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {BigArm, palmOf} from './arm';
import {
  BLU,
  Chip,
  CutFlash,
  DAY,
  DaviRoom,
  EnergyLines,
  FieldBeam,
  FieldLobes,
  Finish,
  Frog,
  H2O,
  HudTag,
  LabBg,
  NIGHT,
  PalmGlow,
  PaperBg,
  PopBg,
  Rig,
  SfxWord,
  ShotP,
  Sparkle,
  Stamp,
  Svg,
  SweatDrop,
  TubeMagnet,
  WARM,
  WaterGlass,
  YEL,
  abs,
  clamp,
  easeOut,
  ev,
  headOf,
  kf,
  lerp,
  wrist,
} from './kit';

const PINK = '#ff5ad1';

/* 23. "Mas o Davi descobriu um" — reading a physics book; lightbulb pops. */
export const SIdea: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const D = ev(p, 'L5', 3);
  const X = 540;
  const Y = 1760;
  const HT = 1120;
  const pose: Pose = {shR: 55, elR: -125, shL: -55, elL: 125, headTilt: fr > D ? -4 : 6};
  const [hx, hy, hr] = headOf(X, Y, HT);
  const bulb = kf(fr, [D, D + 4], [0, 1], easeOut);
  const book = (
    <g transform="translate(0,-560)">
      <rect x={-150} y={-110} width={300} height={200} rx={8} fill="#2f6fd6" stroke="#14141a" strokeWidth={6} />
      <line x1={0} y1={-110} x2={0} y2={90} stroke="#14141a" strokeWidth={6} />
      <text x={-75} y={10} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={44} fill="#ffd23a">
        FÍSICA
      </text>
      <path d="M 50,-40 L 120,-40 M 50,0 L 120,0 M 50,40 L 110,40" stroke="#ffffff" strokeWidth={6} opacity={0.6} />
    </g>
  );
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.14]} origin={[540, 900]} punches={[{at: D, amt: 0.07}]} whip="u">
      <DaviRoom t={t} deskY={1350} dayK={0} />
      <PlacedDavi x={X} y={Y} height={HT} pose={pose} heldProp={book} expr={fr < D ? {smile: 0, blink: 0.3, lookX: 0, lookY: 0.7, browRaise: -0.2} : {smile: 0.8, mouthOpen: 0.5, eyesWide: 0.7, browRaise: 1, lookX: 0, lookY: -0.3}} light={WARM} />
      <Svg>
        {bulb > 0 && (
          <g transform={`translate(${hx + 10},${hy - hr - 140}) scale(${bulb})`}>
            <circle r={110} fill="#fff6b0" opacity={0.35} />
            <circle cy={-10} r={60} fill="#ffe680" stroke="#14141a" strokeWidth={7} />
            <rect x={-26} y={44} width={52} height={36} rx={6} fill="#9aa3b2" stroke="#14141a" strokeWidth={6} />
            {Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 82} y1={-10 + Math.sin(a) * 82} x2={Math.cos(a) * 120} y2={-10 + Math.sin(a) * 120} stroke={YEL} strokeWidth={10} strokeLinecap="round" />;
            })}
          </g>
        )}
      </Svg>
      <SfxWord x={830} y={700} text="DING!" k={fr - D} size={80} color={YEL} rot={10} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/** Starfield background. */
const Space: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2a2466, #07061a 70%)'}}>
    <Svg>
      {Array.from({length: 90}).map((_, i) => (
        <circle key={i} cx={random(`sx${i}`) * 1080} cy={random(`sy${i}`) * 1920} r={1.5 + random(`sr${i}`) * 3.5} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />
      ))}
    </Svg>
  </AbsoluteFill>
);

const Duck: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#14141a" strokeWidth={5}>
    <ellipse cx={0} cy={0} rx={70} ry={46} fill="#ffd23a" />
    <circle cx={42} cy={-50} r={34} fill="#ffd23a" />
    <path d="M 70,-52 L 104,-44 L 72,-36 Z" fill="#f57a1f" />
    <circle cx={50} cy={-58} r={6} fill="#14141a" />
  </g>
);
const Apple: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#14141a" strokeWidth={5}>
    <path d="M 0,-40 C 50,-70 80,-10 60,30 C 45,60 15,62 0,50 C -15,62 -45,60 -60,30 C -80,-10 -50,-70 0,-40 Z" fill="#e5484d" />
    <path d="M 0,-40 Q 4,-64 14,-74" stroke="#5a3a24" strokeWidth={7} fill="none" />
    <path d="M 8,-56 Q 34,-80 50,-60 Q 28,-50 8,-56 Z" fill="#3f9a4a" />
  </g>
);
const Pencil: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#14141a" strokeWidth={5}>
    <rect x={-80} y={-14} width={130} height={28} fill="#ffd23a" />
    <rect x={-104} y={-14} width={24} height={28} fill="#ff8fa0" />
    <path d="M 50,-14 L 90,0 L 50,14 Z" fill="#f2d0a0" />
    <path d="M 78,-4 L 90,0 L 78,4 Z" fill="#14141a" />
  </g>
);
const Planet: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke="#14141a" strokeWidth={6}>
    <circle r={110} fill="#f0ad4e" />
    <path d="M -100,-30 Q 0,-10 100,-40 M -96,40 Q 0,60 104,30" stroke="#c9822a" strokeWidth={14} fill="none" />
    <ellipse rx={190} ry={44} fill="none" stroke="#e8d8b0" strokeWidth={14} transform="rotate(-16)" />
  </g>
);
/** Little "pushed away" arrows around an object. */
const PushArrows: React.FC<{x: number; y: number; r: number; frame: number; k?: number}> = ({x, y, r, frame, k = 1}) => (
  <g stroke={BLU} strokeWidth={6} strokeLinecap="round" fill="none" opacity={k} style={{filter: `drop-shadow(0 0 6px ${BLU})`}}>
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + 0.6;
      const d = r + ((frame * 2 + i * 7) % 24);
      const x1 = x + Math.cos(a) * d;
      const y1 = y + Math.sin(a) * d;
      const x2 = x + Math.cos(a) * (d + 34);
      const y2 = y + Math.sin(a) * (d + 34);
      return (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} />
          <path d={`M${x2 + Math.cos(a + 2.5) * 14},${y2 + Math.sin(a + 2.5) * 14} L${x2},${y2} L${x2 + Math.cos(a - 2.5) * 14},${y2 + Math.sin(a - 2.5) * 14}`} />
        </g>
      );
    })}
  </g>
);

/* 24. "truque: tudo no universo" — space: planet, apple, duck, pencil, all pushed a tiny bit. */
export const SUniverse: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const TU = ev(p, 'L5', 6);
  const bob = (i: number) => Math.sin(t * 2 + i) * 14;
  return (
    <Rig dur={p.dur} zoom={[1.7, 1.0]} rot={[8, 0]} pow={3} origin={[540, 960]}>
      <Space t={t} />
      <Svg>
        <FieldLobes x={540} y={960} ang={90} scale={900} k={0.55} frame={fr} n={5} width={5} />
        <Planet x={760} y={640 + bob(0)} s={0.9} />
        <PushArrows x={760} y={640 + bob(0)} r={150} frame={fr} />
        <Apple x={260} y={760 + bob(1)} s={1.1} rot={t * 20} />
        <PushArrows x={260} y={760 + bob(1)} r={80} frame={fr} />
        <Duck x={300} y={1220 + bob(2)} s={1.1} rot={-t * 15} />
        <PushArrows x={300} y={1210 + bob(2)} r={90} frame={fr} />
        <Pencil x={800} y={1180 + bob(3)} s={1.1} rot={t * 30} />
        <PushArrows x={800} y={1180 + bob(3)} r={100} frame={fr} />
        <circle cx={540} cy={960} r={60} fill={YEL} opacity={0.35} />
        <circle cx={540} cy={960} r={26} fill="#fff6c0" />
      </Svg>
      <HudTag x={540} y={1600} align="center" label="TUDO" value="NO UNIVERSO" k={kf(fr, [TU, TU + 5], [0, 1])} color={YEL} size={96} />
      <Finish vignette={0.5} grain={0.08} />
      <CutFlash frames={4} />
    </Rig>
  );
};

/* 25. "reage um pouquinho a" — strawberry/pencil/duck on a table shiver a tiny bit. */
export const SWobble: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const [px, py] = palmOf(-320, 900, 90, 140);
  const jx = (i: number) => (random(`wb${i}${fr}`) - 0.5) * 6;
  return (
    <Rig dur={p.dur} zoom={[1.15, 1.05]} pan={[0, 0, -30, 0]} whip="r">
      <AbsoluteFill style={{background: 'linear-gradient(#ffe6a8, #f2b84a)'}} />
      <Svg>
        <rect x={0} y={1200} width={1080} height={800} fill="#8a5a36" />
        <rect x={0} y={1200} width={1080} height={26} fill="#a8744a" />
        <FieldLobes x={px} y={py} ang={0} scale={700} k={0.8} frame={fr} n={4} width={6} />
        <BigArm x0={-320} y0={900} ang={90} len={140} tense={0.5} light={DAY} />
        <PalmGlow x={px} y={py} k={1} r={110} frame={fr} />
        <Apple x={560 + jx(1)} y={1140} s={1.1} />
        <Pencil x={800 + jx(2)} y={1180} s={1.1} rot={-6} />
        <Duck x={960 + jx(3)} y={1150} s={0.9} />
        {[560, 800, 960].map((x, i) => (
          <g key={i} stroke="#1a1420" strokeWidth={5} strokeLinecap="round" opacity={0.6}>
            <line x1={x + 70} y1={1040} x2={x + 90} y2={1030} />
            <line x1={x + 74} y1={1064} x2={x + 98} y2={1064} />
          </g>
        ))}
      </Svg>
      <Chip x={720} y={920} text="BEM POUQUINHO" k={kf(fr, [3, 8], [0, 1])} color="#1a1420" fg={YEL} size={44} />
      <Finish vignette={0.35} grain={0.08} />
    </Rig>
  );
};

/* 26. "campo magnético. Até água." — glass of water: diamagnetic dimple, molecules shy away. */
export const SWater: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const AG = ev(p, 'L5', 16);
  const dent = kf(fr, [4, 22], [0, 1], easeOut);
  const GX = 540;
  const GY = 1320;
  const S = 1.3;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} origin={[540, 900]} punches={[{at: AG, amt: 0.06}]} whip="d">
      <LabBg c1="#173a5c" c2="#060c18" t={t} />
      <Svg>
        {/* magnet pole above */}
        <rect x={430} y={230} width={220} height={300} rx={14} fill="#e5484d" stroke="#14141a" strokeWidth={7} />
        <rect x={430} y={470} width={220} height={60} fill="#b8c0cc" stroke="#14141a" strokeWidth={7} />
        <text x={540} y={420} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={110} fill="#fff">
          N
        </text>
        {Array.from({length: 5}).map((_, i) => (
          <line key={i} x1={460 + i * 40} y1={540} x2={420 + i * 60} y2={900} stroke={i % 2 ? BLU : YEL} strokeWidth={6} strokeDasharray="20 14" strokeDashoffset={-fr * 5} opacity={0.8} />
        ))}
        <WaterGlass x={GX} y={GY} s={S} dent={dent} frame={fr} />
        {Array.from({length: 12}).map((_, i) => {
          const bx = ((i % 4) - 1.5) * 62 + (random(`mx${i}`) - 0.5) * 24;
          const by = -50 - Math.floor(i / 4) * 80 - random(`my${i}`) * 20;
          const push = dent * (bx > 0 ? 1 : -1) * 50 * (1 - Math.abs(bx) / 160);
          return <H2O key={i} x={GX + (bx + push) * S} y={GY + by * S + Math.sin(t * 3 + i) * 6} s={0.9} rot={t * 40 + i * 30} />;
        })}
        {dent > 0.3 &&
          [-1, 1].map((d) => (
            <path key={d} d={`M ${GX + d * 40},${GY - 300 * S - 10} q ${d * 40},-30 ${d * 90},-10`} stroke={BLU} strokeWidth={7} fill="none" strokeLinecap="round" opacity={dent} />
          ))}
      </Svg>
      <Chip x={540} y={1690} text="DIAMAGNETISMO (real)" k={kf(fr, [AG, AG + 5], [0, 1])} color={BLU} fg="#0b1236" size={54} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 27. "Até tu." — Davi points straight at the camera. */
export const STu: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const TU = ev(p, 'L5', 18);
  const pt = kf(fr, [TU - 3, TU + 2], [0, 1], easeOut);
  const skin = DAVI_OUTFIT.skin;
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.2]} origin={[540, 960]} punches={[{at: TU, amt: 0.1}]}>
      <PopBg c1="#ff7ad1" c2="#3a0d4a" t={t} />
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={860} r={230} pose={{shL: -10, shR: 10, headTilt: 4}} expr={{halfSmile: 1, smile: 0.5, browAsym: 0.6, eyesWide: 0.2, lookX: 0, lookY: 0.1}} light={WARM} />
      <Svg>
        {pt > 0 && (
          <g transform={`translate(${lerp(760, 600, pt)},${lerp(1500, 1200, pt)}) scale(${lerp(0.5, 1.4, pt)})`}>
            {/* sleeve cuff */}
            <ellipse cx={60} cy={120} rx={150} ry={120} fill={DAVI_OUTFIT.top.shade} stroke="#14141a" strokeWidth={6} />
            {/* fist */}
            <ellipse cx={20} cy={40} rx={120} ry={100} fill={skin.base} stroke="#14141a" strokeWidth={6} />
            <path d="M -60,10 Q -10,-10 40,20 M -70,60 Q -20,40 30,70" stroke={skin.shade} strokeWidth={7} fill="none" />
            {/* index finger, foreshortened toward the camera */}
            <circle cx={-10} cy={-20} r={66} fill={skin.light} stroke="#14141a" strokeWidth={6} />
            <ellipse cx={-14} cy={-24} rx={34} ry={30} fill="#f2c0a0" stroke={skin.shade} strokeWidth={4} />
          </g>
        )}
        <circle cx={540} cy={960} r={700} fill="none" stroke={BLU} strokeWidth={8} strokeDasharray="30 20" strokeDashoffset={fr * 6} opacity={0.4 * pt} />
      </Svg>
      <Chip x={540} y={1700} text="TU TAMBÉM (um pouquinho)" k={kf(fr, [TU + 2, TU + 7], [0, 1])} color={YEL} size={46} />
      <Finish vignette={0.5} grain={0.08} />
      <CutFlash frames={3} />
    </Rig>
  );
};

/* 28. "Em noventa e sete," — textbook: year flips to 1997, Nijmegen tag. */
export const SYear: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const SETE = ev(p, 'L6', 3);
  const yr = fr >= SETE ? 1997 : Math.round(lerp(1980, 1996, clamp(fr / SETE)));
  return (
    <Rig dur={p.dur} zoom={[1.15, 1.0]} rot={[-4, 0]} pow={3} whip="l" punches={[{at: SETE, amt: 0.06}]}>
      <PaperBg t={t} />
      <Svg>
        <g transform="translate(540,920) rotate(-3)">
          <rect x={-330} y={-300} width={660} height={560} rx={24} fill="#ffffff" stroke="#1a1420" strokeWidth={8} />
          <rect x={-330} y={-300} width={660} height={130} rx={24} fill="#e5484d" stroke="#1a1420" strokeWidth={8} />
          {[-200, 0, 200].map((x) => (
            <rect key={x} x={x - 14} y={-330} width={28} height={70} rx={10} fill="#9aa3b2" stroke="#1a1420" strokeWidth={5} />
          ))}
          <text x={0} y={-205} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={50} fill="#fff" letterSpacing={6}>
            ANO
          </text>
          <text x={0} y={110} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={250} fill={fr >= SETE ? '#e5484d' : '#1a1420'}>
            {yr}
          </text>
        </g>
      </Svg>
      <Chip x={540} y={1300} text="NIJMEGEN · HOLANDA" k={kf(fr, [SETE, SETE + 5], [0, 1])} color="#ff8a1a" fg="#fff" size={46} />
      <Finish vignette={0.3} grain={0.06} />
    </Rig>
  );
};

const LAB_COAT = (seed: number): Outfit => ({...commuterOutfit(seed), top: {base: '#f4f6fa', shade: '#c4ccd8', light: '#ffffff'}});

/** Lab room backdrop. */
const LabRoom: React.FC<{t: number}> = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#cfe8ec, #9cc8d0)'}}>
    <Svg>
      {Array.from({length: 12}).map((_, i) => (
        <rect key={i} x={i * 100} y={0} width={4} height={1340} fill="#000" opacity={0.05} />
      ))}
      <rect x={0} y={1340} width={1080} height={600} fill="#7a8a9a" />
      {Array.from({length: 8}).map((_, i) => (
        <line key={i} x1={i * 160} y1={1340} x2={i * 220 - 300} y2={1920} stroke="#6a7a8a" strokeWidth={5} />
      ))}
    </Svg>
  </AbsoluteFill>
);

/* 29. "cientistas fizeram um" — lab: scientists + giant tube magnet; frog lowered on a string. */
export const SLab: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const down = kf(fr, [0, p.dur], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[-30, 0, 30, 0]} whip="r" origin={[540, 800]}>
      <LabRoom t={t} />
      <Svg>
        <TubeMagnet x={540} y={980} r={140} h={720} frame={fr} cut={false} />
        <ellipse cx={540} cy={620} rx={140} ry={34} fill="#0d1830" stroke="#14141a" strokeWidth={6} />
        <line x1={540} y1={0} x2={540} y2={lerp(380, 540, down)} stroke="#14141a" strokeWidth={4} />
        <Frog x={540} y={lerp(470, 630, down)} s={0.4} mood="shock" legs={1} />
        <text x={540} y={1180} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={64} fill="#fff" stroke="#14141a" strokeWidth={4} paintOrder="stroke">
          16 T
        </text>
      </Svg>
      <PlacedPuppet outfit={LAB_COAT(31)} x={170} y={1700} height={900} pose={{shR: 70, elR: 30}} expr={{smile: 0.4, eyesWide: 0.3, lookX: 0.8}} light={DAY} />
      <PlacedPuppet outfit={LAB_COAT(44)} x={910} y={1720} height={940} pose={{shL: -60, elL: -40}} expr={{smile: 0.6, browRaise: 0.6, lookX: -0.8}} light={DAY} flip />
      <Chip x={540} y={1690} text="LABORATÓRIO DE CAMPO FORTE" k={kf(fr, [3, 8], [0, 1])} color="#1a1420" fg="#9fe0ff" size={40} />
      <Finish vignette={0.35} grain={0.07} />
    </Rig>
  );
};

/* 30. "sapo flutuar com um" — cross-section: frog floating in the bore. */
export const SFloat: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const bob = Math.sin(t * 5) * 16;
  return (
    <Rig dur={p.dur} zoom={[1.2, 1.06]} rot={[2, -1]} origin={[540, 940]}>
      <PaperBg t={t} tint="#eef3f6" />
      <Svg>
        <TubeMagnet x={540} y={940} r={230} h={1000} frame={fr} />
        <Frog x={540} y={1060 + bob} s={0.95} mood={fr < 10 ? 'shock' : 'happy'} legs={1} rot={Math.sin(t * 3) * 8} />
        {[-1, 1].map((d) => (
          <g key={d} stroke={BLU} strokeWidth={7} strokeLinecap="round">
            <line x1={540 + d * 60} y1={1110 + bob} x2={540 + d * 60} y2={1170 + bob} />
            <path d={`M${540 + d * 60 - 14},${1124 + bob} L${540 + d * 60},${1106 + bob} L${540 + d * 60 + 14},${1124 + bob}`} fill="none" />
          </g>
        ))}
      </Svg>
      <Chip x={540} y={1690} text="SAPO FLUTUANDO (real)" k={kf(fr, [2, 7], [0, 1])} color={YEL} size={50} />
      <Finish vignette={0.3} grain={0.06} />
      <CutFlash frames={3} />
    </Rig>
  );
};

/* 31. "ímã de dezesseis tesla." — coil close-up; 16 T in pink. */
export const SSixteen: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const DZ = ev(p, 'L6', 13);
  return (
    <>
    <Rig dur={p.dur} zoom={[1.6, 1.4]} origin={[300, 900]} shakes={[{at: DZ, dur: 14, amp: 12}]}>
      <PaperBg t={t} tint="#eef3f6" />
      <Svg>
        <TubeMagnet x={540} y={940} r={230} h={1000} frame={fr} />
        <Frog x={540} y={1060 + Math.sin(t * 5) * 16} s={0.95} mood="happy" legs={1} />
      </Svg>
      <EnergyLines x={300} y={900} r0={120} r1={520} k={kf(fr, [DZ, DZ + 4], [0, 1])} frame={fr} seed="16" count={14} color={PINK} />
      <Finish vignette={0.4} grain={0.06} />
    </Rig>
    <HudTag x={540} y={1590} align="center" label="ÍMÃ DO LABORATÓRIO" value="16 TESLA" k={kf(fr, [DZ, DZ + 4], [0, 1])} color={PINK} size={150} />
    </>
  );
};

/* 32. "Trezentas mil vezes o" — log scale ruler TERRA → SAPO; ×300.000. */
export const SRuler: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const MIL = ev(p, 'L6', 16);
  const yOf = (v: number) => lerp(1320, 560, (Math.log10(v) - Math.log10(0.00005)) / (Math.log10(16) - Math.log10(0.00005)));
  const marks: [number, string, string][] = [
    [0.00005, 'TERRA', '0,00005 T'],
    [0.005, 'ÍMÃ DE GELADEIRA', '0,005 T'],
    [3, 'RESSONÂNCIA', '3 T'],
    [16, 'SAPO FLUTUA', '16 T'],
  ];
  const climb = kf(fr, [2, MIL], [0, 1], easeOut);
  const cur = lerp(1320, 560, climb);
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} pan={[0, 30, 0, -10]} whip="u" punches={[{at: MIL, amt: 0.07}]}>
      <LabBg c1="#2a1a4a" c2="#0a0614" t={t} />
      <Svg>
        <rect x={210} y={530} width={50} height={820} rx={25} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={5} />
        <rect x={218} y={cur} width={34} height={1320 - cur + 20} rx={17} fill={PINK} style={{filter: `drop-shadow(0 0 12px ${PINK})`}} />
        {marks.map(([v, l, n]) => {
          const y = yOf(v);
          const on = cur <= y + 4;
          return (
            <g key={l}>
              <line x1={190} y1={y} x2={300} y2={y} stroke="#fff" strokeWidth={6} />
              <text x={320} y={y - 4} fontFamily={HUD_FONT} fontWeight={700} fontSize={34} fill="#fff" opacity={on ? 1 : 0.5} letterSpacing={3}>
                {l}
              </text>
              <text x={320} y={y + 46} fontFamily={CAPTION_FONT} fontWeight={700} fontSize={48} fill={on ? (v >= 3 ? PINK : YEL) : '#8a8aa8'}>
                {n}
              </text>
            </g>
          );
        })}
        <Frog x={880} y={yOf(16) + 60 + Math.sin(t * 5) * 10} s={0.42} mood="happy" legs={1} />
      </Svg>
      <Stamp x={720} y={1100} text="×300.000" k={fr - MIL} color={PINK} bg="rgba(20,10,30,0.85)" size={96} rot={-8} />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* 33. "campo da Terra." — Earth with its faint field; compass. */
export const SEarth: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.25, 1.05]} rot={[0, 5]} origin={[540, 900]}>
      <Space t={t} />
      <Svg>
        <FieldLobes x={540} y={920} ang={-80} scale={620} k={0.35} frame={fr} n={4} width={4} />
        <g transform="translate(540,920)">
          <circle r={230} fill="#3b7be0" stroke="#14141a" strokeWidth={8} />
          <path d="M -120,-150 Q -40,-190 0,-120 Q 30,-60 -40,-20 Q -110,10 -150,-60 Z" fill="#5cb85c" stroke="#14141a" strokeWidth={5} />
          <path d="M 60,0 Q 160,-40 190,40 Q 170,140 90,160 Q 30,110 60,0 Z" fill="#5cb85c" stroke="#14141a" strokeWidth={5} />
          <path d="M -150,90 Q -80,70 -60,140 Q -100,190 -150,150 Z" fill="#5cb85c" stroke="#14141a" strokeWidth={5} />
          <circle r={230} fill="none" stroke="#9fe0ff" strokeWidth={16} opacity={0.35} />
        </g>
        <g transform={`translate(830,1230) rotate(${-20 + Math.sin(t * 7) * 18})`}>
          <circle r={90} fill="#f4f1e6" stroke="#14141a" strokeWidth={7} transform={`rotate(${20 - Math.sin(t * 7) * 18})`} />
          <path d="M 0,-74 L 14,0 L -14,0 Z" fill="#e5484d" />
          <path d="M 0,74 L 14,0 L -14,0 Z" fill="#9aa3b2" />
        </g>
      </Svg>
      <HudTag x={120} y={1180} align="left" label="CAMPO DA TERRA" value="0,00005 T" k={kf(fr, [2, 7], [0, 1])} color="#9fe0ff" size={86} />
      <Finish vignette={0.5} grain={0.07} />
    </Rig>
  );
};

/* 34. "O Davi treinou até" — training: straining, sweat, energy lines. */
export const STrain: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const X = 540;
  const Y = 1780;
  const HT = 1150;
  const shk = Math.sin(fr * 2.7) * 5;
  const pose: Pose = {shR: 88, elR: -10 + shk, shL: -88, elL: 10 - shk, hipL: -12, hipR: 12, knL: 8, knR: -8, lean: 0};
  const [hx, hy, hr] = headOf(X, Y, HT);
  const [rx, ry] = wrist(X, Y, HT, pose, 'R');
  const [lx, ly] = wrist(X, Y, HT, pose, 'L');
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} origin={[540, 900]} shakes={[{at: 0, dur: 30, amp: 6}]} whip="d">
      <DaviRoom t={t} deskY={1380} dayK={0} lamp={false} />
      <AbsoluteFill style={{background: 'rgba(30,10,60,0.35)'}} />
      <AbsoluteFill style={{transform: `translate(${shk}px,0)`}}>
        <PlacedDavi x={X} y={Y} height={HT} pose={pose} expr={{smile: -0.5, browTilt: -0.9, blink: 0.65, mouthOpen: 0.35, lookX: 0, lookY: 0}} light={NIGHT} />
      </AbsoluteFill>
      <Svg>
        <rect x={hx - hr * 0.95} y={hy - hr * 0.62} width={hr * 1.9} height={hr * 0.26} rx={10} fill="#e5484d" />
        <path d={`M${hx + hr * 0.9},${hy - hr * 0.5} q 40,10 60,50 M${hx + hr * 0.9},${hy - hr * 0.45} q 50,0 80,30`} stroke="#e5484d" strokeWidth={14} fill="none" strokeLinecap="round" />
        {Array.from({length: 6}).map((_, i) => {
          const k = ((fr + i * 5) % 18) / 18;
          const side = i % 2 ? 1 : -1;
          return <SweatDrop key={i} x={hx + side * (hr * 0.9 + k * 160)} y={hy - hr * 0.3 - Math.sin(k * Math.PI) * 120 + k * 120} s={30} />;
        })}
        <PalmGlow x={rx} y={ry} k={1} r={90} frame={fr} />
        <PalmGlow x={lx} y={ly} k={1} r={90} frame={fr} />
      </Svg>
      <EnergyLines x={rx} y={ry} r0={60} r1={300} k={0.9} frame={fr} seed="tr1" count={10} />
      <EnergyLines x={lx} y={ly} r0={60} r1={300} k={0.9} frame={fr} seed="tr2" count={10} />
      <Chip x={540} y={1700} text="TREINO · DIA 47" k={kf(fr, [2, 7], [0, 1])} color="#1a1420" fg={YEL} size={50} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/* 35. "levitar uma gota d'água." — a single drop rises from the glass and hovers above the palm. */
export const SDrop: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const G = ev(p, 'L7', 6);
  const DA = ev(p, 'L7', 7);
  const [px, py] = palmOf(540, 2350, 180, 780);
  const rise = kf(fr, [G - 4, G + 8], [0, 1], easeOut);
  const dx = 760;
  const dy = lerp(1080, py - 300, rise) + Math.sin(t * 4) * 12 * rise;
  const dxx = lerp(dx, px, rise);
  const sq = 1 + Math.sin(t * 9) * 0.08;
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.16]} origin={[640, 900]} pow={2}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a3a6a, #0b0f24 75%)'}} />
      <Svg>
        <rect x={0} y={1190} width={1080} height={800} fill="#3a2a20" />
        <WaterGlass x={760} y={1250} s={0.55} frame={fr} />
        <BigArm x0={540} y0={2350} ang={180} len={780} tense={0.9} light={NIGHT} />
        <FieldLobes x={px} y={py - 120} ang={-90} scale={380} k={0.8} frame={fr} n={4} pulse={1} />
        <PalmGlow x={px} y={py - 40} k={1} r={110} frame={fr} />
        <g transform={`translate(${dxx},${dy}) scale(${(1.6 / sq) * lerp(0.6, 1, rise)},${1.6 * sq * lerp(0.6, 1, rise)})`} style={{filter: 'drop-shadow(0 0 18px #9fe0ff)'}}>
          <path d="M 0,-44 C 18,-16 30,0 30,16 A 30,30 0 0 1 -30,16 C -30,0 -18,-16 0,-44 Z" fill="#8fd8ff" stroke="#1d4e78" strokeWidth={4} />
          <ellipse cx={-10} cy={10} rx={7} ry={11} fill="#fff" opacity={0.8} />
        </g>
        <Sparkle x={dxx + 50} y={dy - 50} k={(fr - DA) / 8} s={50} />
        <SweatDrop x={150} y={640 + (fr % 20) * 8} s={50} />
      </Svg>
      <HudTag x={540} y={1600} align="center" label="CONQUISTA" value="1 GOTA ✓" k={kf(fr, [DA, DA + 5], [0, 1])} color="#9fe0ff" size={96} />
      <Finish vignette={0.5} grain={0.08} />
      <CutFlash frames={3} />
    </Rig>
  );
};

/* 36. "Depois, o sapo do vizinho." — the neighbor's frog rises out of the pond, over the fence. */
export const SNeighbor: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const SA = ev(p, 'L7', 10);
  const VZ = ev(p, 'L7', 12);
  const up = kf(fr, [SA - 2, p.dur], [0, 1], easeOut);
  const fx = lerp(780, 520, up);
  const fy = lerp(1250, 760, up) + Math.sin(t * 5) * 10 * up;
  const pose: Pose = {shL: -100, elL: -20, shR: 20, elR: -30, lean: -4};
  const [lx, ly] = wrist(170, 1560, 820, pose, 'L', true);
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} pan={[-20, 40, 10, -20]} whip="l">
      <AbsoluteFill style={{background: 'linear-gradient(#7cc4f2, #d2f0ff 60%)'}} />
      <Svg>
        {/* neighbor's house */}
        <rect x={560} y={420} width={520} height={560} fill="#f0d29a" stroke="#14141a" strokeWidth={6} />
        <path d="M 520,440 L 820,260 L 1120,440 Z" fill="#c4523a" stroke="#14141a" strokeWidth={6} />
        <rect x={660} y={560} width={150} height={150} fill="#a9d8f5" stroke="#14141a" strokeWidth={6} />
        <rect x={880} y={720} width={130} height={260} fill="#8a5a36" stroke="#14141a" strokeWidth={6} />
        <rect x={0} y={980} width={1080} height={940} fill="#5fae4e" />
        {/* fence */}
        {Array.from({length: 13}).map((_, i) => (
          <path key={i} d={`M ${i * 90 - 20},1340 L ${i * 90 - 20},1080 L ${i * 90 + 15},1050 L ${i * 90 + 50},1080 L ${i * 90 + 50},1340 Z`} fill="#e8dcc0" stroke="#8a7a5a" strokeWidth={5} />
        ))}
        <rect x={-20} y={1140} width={1120} height={24} fill="#d8ccb0" />
        <rect x={-20} y={1260} width={1120} height={24} fill="#d8ccb0" />
        {/* pond behind the fence (seen through) */}
        <ellipse cx={780} cy={1300} rx={240} ry={50} fill="#3b7be0" stroke="#1d4e78" strokeWidth={5} opacity={0.9} />
        <ellipse cx={800} cy={1290} rx={70} ry={18} fill="#3f9a4a" />
        <FieldBeam a={[lx, ly]} b={[fx, fy - 60]} k={0.8} frame={fr} n={3} spread={70} />
        <Frog x={fx} y={fy} s={0.55} mood={up > 0.3 ? 'shock' : 'happy'} legs={up} rot={Math.sin(t * 4) * 10 * up} />
      </Svg>
      <PlacedDavi x={170} y={1560} height={820} pose={pose} flip expr={{smile: 0.8, halfSmile: 0.6, browRaise: 0.6, lookX: 0.7, lookY: -0.4}} light={DAY} />
      <Chip x={600} y={1700} text="SAPO DO VIZINHO" k={kf(fr, [VZ, VZ + 5], [0, 1])} color="#1a1420" fg="#7fe08a" size={50} />
      <Finish vignette={0.35} grain={0.07} />
    </Rig>
  );
};

/* 37. "O sapo não gostou." — floating frog, arms crossed, annoyed. */
export const SAnnoyed: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const NAO = ev(p, 'L7', 15);
  const G = ev(p, 'L7', 16);
  const mad = fr >= NAO;
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.22]} origin={[540, 920]} rot={[-3, 3]} punches={[{at: NAO, amt: 0.08}]}>
      <PopBg c1="#5cd06a" c2="#0e4a22" t={t} cx={540} cy={920} />
      <Svg>
        <FieldLobes x={540} y={960} ang={90} scale={600} k={0.6} frame={fr} n={4} width={5} />
        <Frog x={540} y={1180 + Math.sin(t * 4) * 14} s={1.5} mood={mad ? 'annoyed' : 'shock'} crossed={mad} legs={1} rot={Math.sin(t * 2.5) * 6} />
        {mad && (
          <g stroke="#14301a" strokeWidth={8} strokeLinecap="round" opacity={0.8}>
            <path d="M 800,720 q 30,-20 60,0 q 30,20 60,0" fill="none" />
          </g>
        )}
      </Svg>
      <SfxWord x={830} y={1290} text="HMPF!" k={fr - NAO} size={84} color="#ffffff" rot={10} />
      <Stamp x={540} y={1690} text="SAPO: ☹" k={fr - G} color="#d23c3c" size={86} rot={-6} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};
