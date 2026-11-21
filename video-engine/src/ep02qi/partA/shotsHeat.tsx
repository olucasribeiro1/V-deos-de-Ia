import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import type {Lighting, Pose} from '../../characters/types';
import {Bust, PlacedCommuter, PlacedGuard, commuterOutfit} from '../characters';
import {METRO_LIGHT, MetroHall} from '../sets/Metro';
import {ReadTag} from '../ReadTag';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {
  Chip,
  CutFlash,
  EnergyLines,
  Finish,
  H,
  HeatWaves,
  HudTag,
  LabBg,
  RedTint,
  Rig,
  ShotP,
  Stamp,
  Stars,
  Steam,
  Svg,
  SweatDrop,
  W,
  abs,
  clamp,
  easeOut,
  ev,
  kf,
  lerp,
  walkPose,
} from './kit';

const NEON_LIGHT: Lighting = {side: 1, rim: '#ff6bd6', rimStrength: 0.85, shadeStrength: 0.7};
const SKIN = DAVI_OUTFIT.skin;

/* ------------------------------------------------------------------ casino */

const CasinoBg: React.FC<{t: number; blur?: number}> = ({t, blur = 8}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #5a1838, #1a0612 75%)'}}>
    <AbsoluteFill style={{filter: `blur(${blur}px)`}}>
      <Svg>
        {Array.from({length: 7}).map((_, i) => (
          <g key={i} transform={`translate(${-60 + i * 180},420)`}>
            <rect x={0} y={0} width={150} height={520} rx={20} fill={['#7a2a8a', '#2a5aa0', '#a02a3a'][i % 3]} />
            <rect x={20} y={60} width={110} height={120} rx={10} fill="#111" />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={40 + k * 35} cy={120} r={14} fill={random(`sl${i}${k}${Math.floor(t * 8)}`) > 0.5 ? '#ffd23a' : '#ff4d4d'} />
            ))}
            {Array.from({length: 6}).map((__, k) => (
              <circle key={k} cx={15 + k * 24} cy={20} r={8} fill="#ffd23a" opacity={Math.sin(t * 10 + k + i) > 0 ? 1 : 0.2} />
            ))}
          </g>
        ))}
      </Svg>
    </AbsoluteFill>
  </AbsoluteFill>
);

const ChipStack: React.FC<{x: number; y: number; n: number; color: string; r?: number}> = ({x, y, n, color, r = 46}) => (
  <g>
    {Array.from({length: n}).map((_, i) => (
      <g key={i}>
        <ellipse cx={x} cy={y - i * 14} rx={r} ry={r * 0.36} fill={color} stroke="#111" strokeWidth={3} />
        <ellipse cx={x} cy={y - i * 14 - 3} rx={r * 0.6} ry={r * 0.2} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="8 8" opacity={0.8} />
      </g>
    ))}
  </g>
);

/* 27. "Com dezoito," — casino table: adult Davi with chip towers; rival "BLEFANDO 97%". */
export const SCasino: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} rot={[-2, 1]} whip="r">
      <CasinoBg t={t} />
      <PlacedCommuter seed={33} x={170} y={1640} height={900} pose={{shL: 20, elL: 60}} expr={{browTilt: 0.9, smile: -0.5, eyesWide: 0.4, lookX: 0.8}} light={NEON_LIGHT} />
      <PlacedDavi x={640} y={1700} height={1020} pose={{shL: 30, elL: 70, shR: -30, elR: -70, headTilt: -4}} expr={{halfSmile: 1, browAsym: 0.6, lookX: -0.5}} light={NEON_LIGHT} />
      <Svg>
        <SweatDrop x={260} y={880} s={50} k={clamp(fr / 20)} />
        <path d="M -100,1220 L 1180,1220 L 1180,1920 L -100,1920 Z" fill="#1d6b45" />
        <path d="M -100,1220 L 1180,1220" stroke="#6b3a1c" strokeWidth={40} />
        <circle cx={540} cy={1600} r={300} fill="none" stroke="#e8dcb0" strokeWidth={6} opacity={0.4} />
        <ChipStack x={480} y={1290} n={14} color="#d62a2a" />
        <ChipStack x={580} y={1300} n={18} color="#1b1b1b" />
        <ChipStack x={690} y={1290} n={22} color="#2f6fd0" />
        <ChipStack x={800} y={1300} n={12} color="#ffd23a" />
        <ChipStack x={200} y={1300} n={2} color="#d62a2a" />
      </Svg>
      <ReadTag label="BLEFANDO" pct={97} x={40} y={1110} tx={170} ty={850} from={3} scale={0.9} />
      <Chip x={720} y={600} text="18 ANOS" k={kf(fr, [2, 8], [0, 1])} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/* 28. "banido de três" — two guards carry Davi by the arms; feet dangling. */
export const SCarry: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const walk = walkPose(t * 1.4, 0, 0.7);
  const dx = -fr * 6;
  const kick = Math.sin(t * 16);
  const davi: Pose = {shL: -118, elL: 10, shR: 118, elR: -10, hipL: -10 + kick * 25, knL: 20 + kick * 30, hipR: 10 - kick * 25, knR: 20 - kick * 30, headTilt: Math.sin(t * 9) * 5};
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.12]} pan={[30, 0, -30, 0]} shakes={[{at: 0, dur: 20, amp: 8}]}>
      <CasinoBg t={t} blur={12} />
      <PlacedGuard variant="guardA" x={250 + dx} y={1760} height={1120} pose={{...walk, shR: 70, elR: 60}} expr={{smile: -0.3, browTilt: -0.6}} light={NEON_LIGHT} />
      <PlacedDavi x={540 + dx} y={1500 + Math.sin(t * 9) * 10} height={900} pose={davi} expr={{mouthOpen: 0.45, browTilt: 0.8, eyesWide: 0.5, lookX: 0.2}} light={NEON_LIGHT} />
      <PlacedGuard variant="guardB" x={830 + dx} y={1760} height={1120} pose={{...walk, shL: -70, elL: -60}} expr={{smile: -0.3, browTilt: -0.6}} light={NEON_LIGHT} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

const Facade: React.FC<{x: number; w: number; name: string; color: string; t: number; i: number}> = ({x, w, name, color, t, i}) => (
  <g>
    <rect x={x} y={560} width={w} height={760} fill={['#2a1b3a', '#1f2b44', '#3a1b24'][i % 3]} stroke="#0b0b10" strokeWidth={6} />
    {Array.from({length: 6}).map((_, k) => (
      <rect key={k} x={x + 30 + (k % 3) * ((w - 60) / 3)} y={760 + Math.floor(k / 3) * 160} width={(w - 60) / 3 - 20} height={110} fill="#ffcf7a" opacity={0.35 + 0.3 * Math.sin(t * 3 + k + i)} />
    ))}
    <rect x={x + w / 2 - 70} y={1100} width={140} height={220} fill="#0d0d12" />
    <rect x={x + 16} y={590} width={w - 32} height={120} rx={16} fill="none" stroke={color} strokeWidth={8} style={{filter: `drop-shadow(0 0 12px ${color})`}} opacity={Math.sin(t * 12 + i * 2) > -0.7 ? 1 : 0.4} />
    <text x={x + w / 2} y={672} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={56} fill={color} letterSpacing={3} style={{filter: `drop-shadow(0 0 10px ${color})`}}>
      {name}
    </text>
  </g>
);

/* 29. "cassinos no Paraguai." — tossed out under 3 neon casinos; BANIDO stamps count 1-2-3. */
export const SBanned: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const land = kf(fr, [0, 6], [0, 1], easeOut);
  const st = [3, 10, 17];
  const n = st.filter((s) => fr >= s).length;
  const k = 0.95;
  const groundY = 1520;
  const sit: Pose = {hipL: -70, knL: 40, hipR: 70, knR: -40, shL: -40, elL: 30, shR: 40, elR: -30, headTilt: Math.sin(t * 5) * 6};
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} shakes={st.map((s) => ({at: s, dur: 8, amp: 12}))}>
      <AbsoluteFill style={{background: 'linear-gradient(#0b0f2a, #2a1540 60%, #1a1020)'}} />
      <Svg>
        <Facade x={0} w={360} name="LA SUERTE" color="#ff4dd2" t={t} i={0} />
        <Facade x={360} w={360} name="CASINO 777" color="#4de0ff" t={t} i={1} />
        <Facade x={720} w={360} name="ROYAL" color="#ffd23a" t={t} i={2} />
        <rect x={-50} y={1320} width={1200} height={700} fill="#3a3a44" />
        <rect x={-50} y={1320} width={1200} height={24} fill="#5a5a66" />
      </Svg>
      <PlacedGuard variant="guardA" x={480} y={1360} height={760} pose={{shL: -20, elL: 100, shR: 20, elR: -100}} expr={{smile: 0.3, browTilt: -0.4}} light={NEON_LIGHT} blur={1} />
      <PlacedGuard variant="guardB" x={620} y={1360} height={760} flip pose={{shL: -20, elL: 100, shR: 20, elR: -100}} expr={{smile: 0.3, browTilt: -0.4}} light={NEON_LIGHT} blur={1} />
      <PlacedDavi x={540} y={lerp(groundY - 300, groundY, land) + 440 * k} height={1000 * k} pose={sit} expr={{eyesWide: 0.5, mouthOpen: 0.3, browTilt: 0.6}} light={NEON_LIGHT} />
      <Svg>
        <Stars x={540} y={groundY + 440 * k * land - 884 * k - 150 - (1 - land) * 300} r={150} t={t} n={4} />
      </Svg>
      {st.map((s, i) => (
        <Stamp key={i} x={180 + i * 360} y={850} text="BANIDO" color="#ff3b3b" k={fr - s} rot={-14 + i * 6} size={64} bg="rgba(20,10,20,0.75)" />
      ))}
      <HudTag x={70} y={1600} label="CASSINOS NO PARAGUAI" value={`BANIDO ×${Math.max(1, n)}`} k={kf(fr, [st[0], st[0] + 4], [0, 1])} color="#ff4d4d" size={120} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ heat rule */

/* 30. "O problema:" — Davi close, smile drops; warning icon. */
export const SProblem: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const drop = kf(fr, [2, 10], [0, 1], easeOut);
  const warn = kf(fr, [4, 9], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} whip="d" origin={[540, 980]}>
      <LabBg c1="#3a2a1a" c2="#0e0a08" t={t} />
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={1020} r={280} expr={{smile: lerp(0.8, -0.3, drop), browTilt: lerp(0, 0.8, drop), eyesWide: 0.4 * drop, lookX: 0}} light={METRO_LIGHT} />
      <Svg>
        {warn > 0 && (
          <g transform={`translate(860,680) scale(${warn * (1 + 0.06 * Math.sin(fr * 0.8))}) rotate(8)`}>
            <path d="M0,-110 L110,80 L-110,80 Z" fill="#ffd23a" stroke="#141414" strokeWidth={14} strokeLinejoin="round" />
            <rect x={-12} y={-50} width={24} height={80} rx={10} fill="#141414" />
            <circle cx={0} cy={56} r={13} fill="#141414" />
          </g>
        )}
      </Svg>
      <Finish vignette={0.6} grain={0.08} />
    </Rig>
  );
};

/** Front-view x-ray brain (two hemispheres + gyri). `heat` 0..1 → pink to red-orange glow. */
const XrayBrain: React.FC<{cx: number; cy: number; s: number; heat: number; frame: number}> = ({cx, cy, s, heat, frame}) => {
  const col = heat < 0.5 ? `rgb(${255},${Math.round(lerp(150, 140, heat * 2))},${Math.round(lerp(190, 60, heat * 2))})` : `rgb(255,${Math.round(lerp(140, 60, (heat - 0.5) * 2))},${Math.round(lerp(60, 30, (heat - 0.5) * 2))})`;
  const pulse = 1 + heat * 0.03 * Math.sin(frame * 0.9);
  return (
    <g transform={`translate(${cx},${cy}) scale(${s * pulse})`}>
      <ellipse cx={0} cy={0} rx={300} ry={230} fill={col} opacity={0.25 + heat * 0.35} style={{filter: `blur(${20 + heat * 40}px)`}} />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * 8},-200 C ${sd * 160},-230 ${sd * 290},-150 ${sd * 280},-10 C ${sd * 280},120 ${sd * 180},200 ${sd * 8},190 Z`} fill={col} opacity={0.85} stroke="#fff" strokeWidth={5} />
          {Array.from({length: 7}).map((_, i) => {
            const y = -160 + i * 50;
            const w = 240 - Math.abs(i - 3) * 30;
            return (
              <path
                key={i}
                d={`M ${sd * 30},${y} q ${sd * w * 0.2},-26 ${sd * w * 0.4},0 q ${sd * w * 0.2},26 ${sd * w * 0.4},0 q ${sd * w * 0.12},-20 ${sd * w * 0.2},4`}
                stroke="#fff"
                strokeWidth={6}
                fill="none"
                opacity={0.55}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      ))}
    </g>
  );
};

/** X-ray Davi bust (cyan negative) with the brain inside. */
const XrayDavi: React.FC<{cx: number; cy: number; r: number; heat: number; frame: number}> = ({cx, cy, r, heat, frame}) => (
  <>
    <AbsoluteFill style={{filter: 'grayscale(1) invert(1) brightness(0.75) sepia(1) hue-rotate(160deg) saturate(2.5)', opacity: 0.55}}>
      <Bust outfit={DAVI_OUTFIT} cx={cx} cy={cy} r={r} expr={{browTilt: 0.5 * heat}} />
    </AbsoluteFill>
    <Svg>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7fe3ff" strokeWidth={5} opacity={0.8} />
      <XrayBrain cx={cx} cy={cy - r * 0.32} s={(r / 300) * 0.8} heat={heat} frame={frame} />
    </Svg>
  </>
);

/* 31. "ler gente esquenta o cérebro." — x-ray head, brain heating up; ~20 W fact. */
export const SBrain: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const E = ev(p, 'L8', 4);
  const heat = kf(fr, [E - 4, p.dur - 4], [0, 0.85]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[-1, 1]} origin={[540, 900]}>
      <LabBg t={t} />
      <XrayDavi cx={540} cy={1000} r={330} heat={heat} frame={fr} />
      <Svg>
        <HeatWaves x={540} y={640} t={t} k={heat} w={320} />
      </Svg>
      <HudTag x={70} y={1600} label="O CÉREBRO GASTA" value="~20 W" k={kf(fr, [4, 10], [0, 1])} color="#bff3ff" size={110} />
      <HudTag x={1010} y={1600} label="E ESQUENTA" value="MAIS"  k={kf(fr, [E, E + 4], [0, 1])} align="right" color="#ff8a3a" size={110} />
      <CutFlash frames={4} peak={0.35} color="160,230,255" />
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/* 32. "Uma pessoa," — Davi reads one person: one ReadTag. */
export const SOne: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.1]} pan={[30, 0, 0, 0]} whip="r">
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.12)'}}>
        <MetroHall t={t} px={-500} floorY={1500} />
      </AbsoluteFill>
      <Bust outfit={commuterOutfit(41)} cx={720} cy={900} r={210} pose={{facing: -0.3}} expr={{blink: 0.4, smile: -0.2, lookX: -0.3}} light={METRO_LIGHT} />
      <AbsoluteFill style={{filter: 'blur(2px)'}}>
        <Bust outfit={DAVI_OUTFIT} cx={170} cy={1250} r={300} pose={{facing: 0.6}} expr={{lookX: 1, halfSmile: 0.4}} light={METRO_LIGHT} />
      </AbsoluteFill>
      <ReadTag label="CANSADO" pct={82} x={560} y={1150} tx={740} ty={930} from={2} scale={1.2} />
      <HudTag x={1010} y={1600} label="LENDO" value="1 PESSOA" k={kf(fr, [2, 7], [0, 1])} align="right" color="#ffd23a" size={100} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 33. "trinta e sete e meio." — thermometer rises to 37,5 °C. */
export const STemp: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const M = ev(p, 'L8', 13);
  const v = kf(fr, [0, M], [36.5, 37.5], easeOut);
  const y0 = 1300;
  const y1 = 560;
  const ty = (c: number) => lerp(y0, y1, (c - 36) / 6);
  const col = '#ffb13a';
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} punches={[{at: M, amt: 0.05}]}>
      <LabBg c1="#3a2a12" c2="#0d0a06" t={t} />
      <Svg>
        <rect x={330} y={y1 - 60} width={120} height={y0 - y1 + 80} rx={60} fill="#f4f1ea" stroke="#141414" strokeWidth={8} />
        <circle cx={390} cy={y0 + 70} r={100} fill={col} stroke="#141414" strokeWidth={8} />
        <rect x={360} y={ty(v)} width={60} height={y0 + 40 - ty(v)} rx={30} fill={col} />
        {Array.from({length: 7}).map((_, i) => {
          const c = 36 + i;
          return (
            <g key={i}>
              <line x1={455} y1={ty(c)} x2={505} y2={ty(c)} stroke={c >= 40 ? '#ff4d4d' : '#fff'} strokeWidth={6} />
              <text x={520} y={ty(c) + 14} fontFamily={HUD_FONT} fontWeight={700} fontSize={40} fill={c >= 40 ? '#ff4d4d' : '#ddd'}>
                {c}°
              </text>
            </g>
          );
        })}
        <rect x={455} y={ty(42)} width={10} height={ty(40) - ty(42)} fill="#ff4d4d" opacity={0.6} />
        <text x={600} y={ty(41) + 14} fontFamily={HUD_FONT} fontWeight={700} fontSize={36} fill="#ff4d4d" letterSpacing={3}>
          PANE
        </text>
        <line x1={400} y1={ty(v)} x2={640} y2={ty(v)} stroke={col} strokeWidth={4} strokeDasharray="10 8" />
      </Svg>
      <div style={{position: 'absolute', left: 650, top: ty(v) - 90, fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 150, color: col, textShadow: '0 6px 20px rgba(0,0,0,0.6)'}}>
        {v.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1})}°
      </div>
      <HudTag x={70} y={1600} label="1 PESSOA" value="37,5 °C" k={kf(fr, [M - 2, M + 3], [0, 1])} color={col} size={110} />
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/** Wall of faces for the crowd overload. */
const FACES = Array.from({length: 30}).map((_, i) => ({i, col: i % 5, row: Math.floor(i / 5)}));
const TAG_TEXTS = ['RAIVA', 'FOME', 'PRESSA', 'MEDO', 'TÉDIO', 'SONO', 'CIÚME', 'ATRASADO', 'MENTINDO', 'FELIZ', 'NERVOSO', 'CANSADO'];

/* 34. "Uma multidão," — a wall of faces; dozens of tags pop at once; red tint. */
export const SCrowd: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const red = kf(fr, [6, 20], [0, 1]);
  const cw = 230;
  const rh = 300;
  // tags only on faces whose tag lands outside the caption bands
  const tagged = [0, 2, 4, 6, 8, 11, 13, 15, 16, 18, 23, 26];
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.0]} rot={[2, -2]} shakes={[{at: 8, dur: 20, amp: 10}]}>
      <AbsoluteFill style={{background: '#1b1f24'}} />
      {FACES.map(({i, col, row}) => {
        const x = -40 + col * cw + (row % 2) * cw * 0.5;
        const y = 180 + row * rh;
        return <Bust key={i} outfit={commuterOutfit(100 + i)} cx={x} cy={y} r={100} pose={{facing: (random(`cf${i}`) - 0.5) * 0.8}} expr={{lookX: Math.sin(t * 6 + i) * 0.6, browTilt: (random(`cb${i}`) - 0.5) * 1.6, smile: (random(`cs${i}`) - 0.5) * 1.6}} light={METRO_LIGHT} />;
      })}
      <Svg>
        {FACES.map(({i, col, row}) => {
          const k = kf(fr, [1 + (i % 7), 4 + (i % 7)], [0, 1], easeOut);
          const x = -40 + col * cw + (row % 2) * cw * 0.5;
          const y = 180 + row * rh;
          return k > 0 ? <circle key={i} cx={x} cy={y} r={110 * k} fill="none" stroke="#ffd23a" strokeWidth={6} opacity={0.85} /> : null;
        })}
      </Svg>
      {tagged.map((i, n) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = -40 + col * cw + (row % 2) * cw * 0.5;
        const y = 180 + row * rh;
        const ty = y + 40;
        const safe = (ty > 520 && ty < 1250) || ty > 1590;
        return safe ? <ReadTag key={i} label={TAG_TEXTS[n % TAG_TEXTS.length]} pct={60 + Math.round(random(`tp${i}`) * 39)} x={x + 20} y={ty} tx={x} ty={y} from={2 + (n % 6)} scale={0.72} /> : null;
      })}
      <RedTint k={red} t={t} />
      <HudTag x={70} y={1640} label="LENDO" value="MULTIDÃO" k={kf(fr, [2, 7], [0, 1])} color="#ff6b4d" size={100} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 35. "passa de quarenta." — Davi's head steaming, red tint, shake; 40°+. */
export const SHot: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const Q = ev(p, 'L8', 18);
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.14]} origin={[540, 980]} shakes={[{at: 0, dur: 30, amp: 14}, {at: Q, dur: 12, amp: 22}]} punches={[{at: Q, amt: 0.07}]}>
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.12)'}}>
        <MetroHall t={t} px={-300} floorY={1500} flicker={0.3} />
      </AbsoluteFill>
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={1040} r={290} expr={{eyesWide: 0.8, browTilt: 1, mouthOpen: 0.3 + 0.1 * Math.sin(fr), smile: -0.6, lookX: Math.sin(fr * 1.3) * 0.8}} light={{side: 1, rim: '#ff6b4d', rimStrength: 0.9, shadeStrength: 0.6}} />
      <Svg>
        <Steam x={540} y={720} t={t} k={1} spread={360} seed="hs" n={14} size={1.4} />
        <Steam x={250} y={1040} t={t + 0.3} k={0.9} spread={40} seed="hl" n={6} size={0.8} />
        <Steam x={830} y={1040} t={t + 0.6} k={0.9} spread={40} seed="hr" n={6} size={0.8} />
        <SweatDrop x={300} y={880} s={70} k={clamp(fr / 14)} />
        <SweatDrop x={780} y={900} s={60} k={clamp((fr - 5) / 14)} />
      </Svg>
      <RedTint k={1} t={t} />
      <HudTag x={70} y={1600} label="MULTIDÃO" value="40°+" k={kf(fr, [Q - 3, Q + 2], [0, 1])} color="#ff4d4d" size={130} />
      <Finish vignette={0.6} grain={0.1} />
    </Rig>
  );
};

/* 36. "Guarda isso." — fast punch-in on Davi winking; sparkle. */
export const SWink: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const Wk = ev(p, 'L8', 20);
  const r = 260;
  const k = r / 122;
  const cx = 540;
  const cy = 1000;
  const wink = kf(fr, [Wk - 2, Wk + 1, p.dur - 3, p.dur], [0, 1, 1, 0.6]);
  const ex = cx + 41 * k;
  const ey = cy - 2 * k;
  const spark = kf(fr, [Wk, Wk + 4, Wk + 12], [0, 1, 0]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.28]} pow={5} origin={[cx, cy]} whip="u">
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.12)'}}>
        <MetroHall t={t} px={-600} floorY={1500} />
      </AbsoluteFill>
      <Bust outfit={DAVI_OUTFIT} cx={cx} cy={cy} r={r} pose={{headTilt: 0}} expr={{halfSmile: 1, smile: 0.4, browAsym: 0.8 * wink, lookX: 0}} light={METRO_LIGHT} />
      <Svg>
        {wink > 0.05 && (
          <g>
            <ellipse cx={ex} cy={ey - 2} rx={17 * k} ry={22 * k * wink} fill={SKIN.base} />
            {wink > 0.6 && <path d={`M${ex - 14 * k},${ey} Q${ex},${ey + 8 * k} ${ex + 14 * k},${ey - 2 * k}`} stroke="#1c1311" strokeWidth={5 * k * 0.5} fill="none" strokeLinecap="round" />}
          </g>
        )}
        {spark > 0 && (
          <path
            d="M0,-60 L12,-12 L60,0 L12,12 L0,60 L-12,12 L-60,0 L-12,-12 Z"
            transform={`translate(${ex + 120},${ey - 110}) scale(${spark * 1.3}) rotate(${fr * 6})`}
            fill="#fff6c8"
            style={{filter: 'drop-shadow(0 0 14px #ffd23a)'}}
          />
        )}
      </Svg>
      <EnergyLines x={cx} y={cy} r0={r + 40} r1={r + 260} k={spark} frame={fr} seed="wk" count={14} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

export {W, H, PlacedCommuter};
