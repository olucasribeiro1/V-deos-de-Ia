import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {PlacedBruno, PlacedStudent} from '../characters';
import {Rig, ShotP, abs, ev} from './rig';
import {ArenaBack, Sand} from './arena';
import {
  ARENA_LIGHT,
  Chip,
  Confetti,
  CutFlash,
  DAVI_OUTFIT,
  Finger,
  Finish,
  GOLD_LIGHT,
  Pup,
  SoundWord,
  Stamp,
  Svg,
  Trem,
  TrophyG,
  VibeTicks,
  clamp,
  easeOut,
  kf,
  lerp,
  seismoPath,
  trem,
} from './kit';

const FAN_SEED = 12;

/** Clip children to everything above screen y (things "sunk" in the sand). */
const Above: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => (
  <AbsoluteFill style={{clipPath: `inset(0 0 ${1920 - y}px 0)`}}>{children}</AbsoluteFill>
);

/** Davi's happy wink overlay (puppet-local units; valid with facing 0, headTilt 0, bob 0, lean 0). */
const Wink: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <g opacity={clamp(k * 3)}>
      <ellipse cx={-41} cy={-888} rx={17} ry={21} fill={DAVI_OUTFIT.skin.base} />
      <path d="M-56,-884 Q-41,-900 -26,-884" stroke="#1c1311" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );

/* ================================================================== L14 */

/* "Ranking: número um." — the whole arena freezes in shock, staring up-right at the ranking meter spinning to #1. */
export const SChoque: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const num = ev(p, 'L14', 1);
  const sh = kf(fr, [0, 6, num, num + 4], [0.2, 0.5, 0.6, 1], easeOut);
  const shock = {eyesWide: lerp(0.6, 1, sh), mouthOpen: lerp(0.4, 0.9, sh), browRaise: 1, lookX: 0.9, lookY: -1, smile: -0.1};
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} pan={[0, 0, -40, 50]} rot={[-1, 1.5]} origin={[860, 200]} pow={1.6} whip="u" shakes={[{at: num, amp: 10, dur: 10}]}>
      <ArenaBack t={t} horizon={1180} shock={sh} cheer={0} rows={7} />
      <Sand horizon={1180} t={t} liquid={0.5} />
      {/* Bruno still stuck, tiny, looking up too */}
      <Above y={1290}>
        <PlacedBruno x={300} y={1440} height={420} pose={{shL: -150, elL: -20, shR: 150, elR: 20}} expr={{eyesWide: 1, mouthOpen: 0.7, halfSmile: 0, lookX: 1, lookY: -1, browAsym: 0}} light={ARENA_LIGHT} />
      </Above>
      {/* rays pointing at the meter */}
      <Svg>
        <g opacity={0.55 * sh} style={{mixBlendMode: 'screen'}}>
          {Array.from({length: 14}).map((_, i) => {
            const a = Math.PI * 0.55 + (i / 13) * Math.PI * 0.5;
            const ph = (fr * 0.06 + i * 0.29) % 1;
            const r0 = 260 + ph * 500;
            return <line key={i} x1={870 + Math.cos(a) * r0} y1={160 + Math.sin(a) * r0} x2={870 + Math.cos(a) * (r0 + 160)} y2={160 + Math.sin(a) * (r0 + 160)} stroke="#ffd23a" strokeWidth={8} strokeLinecap="round" opacity={1 - ph} />;
          })}
        </g>
      </Svg>
      {/* front row, big */}
      <PlacedStudent seed={3} x={150} y={2350} height={1500} light={ARENA_LIGHT} pose={{shR: 150, elR: 10, shL: -20, elL: -100, facing: 0.3, headTilt: -6}} expr={shock} />
      <PlacedStudent seed={FAN_SEED} x={560} y={2500} height={1450} light={ARENA_LIGHT} pose={{shL: 30, elL: 140, shR: -30, elR: -140, facing: 0.4, headTilt: -8}} expr={{...shock, mouthOpen: lerp(0.5, 1, sh)}} />
      <PlacedStudent seed={9} x={960} y={2380} height={1550} light={ARENA_LIGHT} pose={{shL: -10, elL: -20, shR: 160, elR: -10, facing: 0.5, headTilt: -10}} expr={shock} />
      <Finish vignette={0.45} grain={0.07} />
      <CutFlash frames={4} color="255,230,150" peak={0.5} />
    </Rig>
  );
};

/* "...um. Efeito colateral:" — Davi alone on the sand, stunned → arms up, confetti; freeze + stamp EFEITO COLATERAL, he starts trembling. */
export const SUm: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const joy = kf(fr, [5, 11], [0, 1], easeOut);
  const ef = ev(p, 'L15', 0);
  const col = ev(p, 'L15', 1);
  const shaking = fr >= ef;
  const j = trem(fr, shaking ? kf(fr, [ef, col], [3, 9]) : 0, 'um');
  return (
    <Rig dur={p.dur} zoom={[1.15, 1.0]} pan={[0, 30, 0, 0]} rot={[2, -1]} pow={2.4} punches={[{at: col, amt: 0.08}]} shakes={[{at: col, amp: 14}]}>
      <ArenaBack t={t} horizon={1120} cheer={1} rows={7} screen="#1" screenSub="DAVI" screenY={620} />
      <Sand horizon={1120} t={t} liquid={0.35} />
      <AbsoluteFill style={{transform: `translate(${j.x}px,${j.y}px) rotate(${j.r}deg)`, transformOrigin: '540px 1500px'}}>
        <Pup
          outfit={DAVI_OUTFIT}
          x={560}
          y={1760}
          height={1060}
          light={GOLD_LIGHT}
          pose={{shL: lerp(-12, -155, joy), elL: lerp(8, -20, joy), shR: lerp(12, 155, joy), elR: lerp(-8, 20, joy), bob: -30 * joy * Math.abs(Math.sin(fr * 0.5)), headTilt: lerp(0, -4, joy)}}
          expr={{eyesWide: lerp(1, 0.2, joy), mouthOpen: lerp(0.45, 0.75, joy), smile: lerp(0, 1, joy), browRaise: 1, blink: 0}}
        />
      </AbsoluteFill>
      <VibeTicks x={560} y={1200} w={360} h={520} frame={fr} k={shaking ? 1 : 0} />
      <Confetti age={fr + 8} n={110} />
      <Stamp x={540} y={1720} text="EFEITO COLATERAL" k={fr - col} size={92} rot={-6} />
      <Finish vignette={0.4} grain={0.07} tint="rgba(255,210,90,0.35)" />
      <CutFlash frames={6} color="255,230,150" peak={0.85} />
    </Rig>
  );
};

/* ================================================================== L15 */

/* "...ele passou três horas tremendo." — Davi hugging the trophy, all of him rattling; arena empties, light goes to dusk; clock spins +3 h. */
export const STrofeu: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tres = ev(p, 'L15', 4);
  const trm = ev(p, 'L15', 6);
  const lapse = kf(fr, [tres - 2, trm + 4], [0, 1]);
  const spin = kf(fr, [tres - 2, trm + 6], [0, 1]) * Math.PI * 2 * 6;
  const amp = lerp(6, 11, lapse);
  const tj = trem(fr, 9, 'tr');
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.14]} pan={[30, 0, -20, -30]} rot={[-1.5, 1]} whip="r" origin={[540, 900]}>
      <ArenaBack t={t} horizon={1180} cheer={1 - lapse} empty={lapse * 0.9} dusk={lapse} rows={7} />
      <Sand horizon={1180} t={t} liquid={0.3} />
      <Trem frame={fr} amp={amp} seed="dv" ox={540} oy={1500}>
        <Pup
          outfit={DAVI_OUTFIT}
          x={540}
          y={2330}
          height={1650}
          light={lapse > 0.5 ? ARENA_LIGHT : GOLD_LIGHT}
          pose={{shL: 18, elL: 118, shR: -18, elR: -118}}
          expr={{smile: lerp(0.8, 0.45, lapse), mouthOpen: 0.25 + 0.15 * Math.abs(Math.sin(fr * 2.1)), eyesWide: lerp(0.2, 0.7, lapse), browTilt: lerp(0, 0.8, lapse), browRaise: 0.4}}
          heldProp={<TrophyG x={tj.x * 3} y={-470 + tj.y * 3} rot={tj.r * 8} s={0.62} glow={0.8} />}
        />
      </Trem>
      <VibeTicks x={540} y={1190} w={300} h={330} frame={fr} k={1} sw={9} />
      {/* clock */}
      <Svg>
        <g transform="translate(230,680)" opacity={clamp(lapse * 3)}>
          <circle r={110} fill="#fff7e6" stroke="#141414" strokeWidth={10} />
          {Array.from({length: 12}).map((_, i) => (
            <line key={i} x1={Math.cos((i / 12) * Math.PI * 2) * 84} y1={Math.sin((i / 12) * Math.PI * 2) * 84} x2={Math.cos((i / 12) * Math.PI * 2) * 96} y2={Math.sin((i / 12) * Math.PI * 2) * 96} stroke="#141414" strokeWidth={6} />
          ))}
          <line x1={0} y1={0} x2={Math.sin(spin) * 80} y2={-Math.cos(spin) * 80} stroke="#141414" strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.sin(spin / 12) * 52} y2={-Math.cos(spin / 12) * 52} stroke="#d23c3c" strokeWidth={12} strokeLinecap="round" />
          <circle r={10} fill="#141414" />
        </g>
      </Svg>
      <Chip x={230} y={850} text="+3 HORAS" k={kf(fr, [tres, tres + 5], [0, 1], easeOut)} color="#ffd23a" size={48} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/** Open notebook (screen px group). */
const Notebook: React.FC<{w: number; h: number; scribble?: number; seed?: string}> = ({w, h, scribble = 0, seed = 'nb'}) => (
  <g>
    <rect x={-w / 2 - 6} y={-h / 2 - 6} width={w + 12} height={h + 12} rx={8} fill="#c0392b" />
    <rect x={-w / 2} y={-h / 2} width={w / 2 - 2} height={h} fill="#fffdf6" />
    <rect x={2} y={-h / 2} width={w / 2 - 2} height={h} fill="#fffdf6" />
    {Array.from({length: 7}).map((_, i) => (
      <line key={i} x1={-w / 2 + 6} x2={w / 2 - 6} y1={-h / 2 + ((i + 1) * h) / 8} y2={-h / 2 + ((i + 1) * h) / 8} stroke="#9ec3e6" strokeWidth={2} />
    ))}
    <line x1={0} x2={0} y1={-h / 2} y2={h / 2} stroke="#b9ae98" strokeWidth={4} />
    {scribble > 0 && <path d={seismoPath(-w * 0.4, w * 0.4, 0, (u) => h * 0.3 * Math.min(1, u * 3), seed, 40, scribble)} stroke="#1d2a7a" strokeWidth={3} fill="none" />}
  </g>
);

/* "Foi dar autógrafo," — a fan (student) holds out a notebook; Davi takes the pen with a hand that won't stop shaking. */
export const SCaderno: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const reach = kf(fr, [0, 8], [0, 1], easeOut);
  const dj = trem(fr, 6, 'cd');
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.04]} pan={[-20, 0, 20, 0]} rot={[1, -1]} whip="l" origin={[540, 1100]}>
      <ArenaBack t={t} horizon={1150} empty={0.9} dusk={1} rows={7} cheer={0} />
      <Sand horizon={1150} t={t} liquid={0.3} />
      {/* fan, right, holding the notebook out to the left */}
      <PlacedStudent
        seed={FAN_SEED}
        x={800}
        y={2050}
        height={1250}
        light={ARENA_LIGHT}
        pose={{shL: lerp(-8, -62, reach), elL: lerp(6, -40, reach), shR: lerp(8, -48, reach), elR: lerp(-6, -52, reach), facing: -0.5, lean: -3}}
        expr={{smile: 0.85, mouthOpen: 0.35, eyesWide: 0.7, browRaise: 0.8, lookX: -0.8}}
      />
      {/* notebook held out between them */}
      <Svg>
        <g transform={`translate(${lerp(640, 520, reach)},${1110}) rotate(-8)`}>
          <Notebook w={300} h={200} />
        </g>
      </Svg>
      {/* Davi, left, trembling, pen in hand */}
      <AbsoluteFill style={{transform: `translate(${dj.x}px,${dj.y}px) rotate(${dj.r}deg)`, transformOrigin: '260px 1500px'}}>
        <Pup
          outfit={DAVI_OUTFIT}
          x={250}
          y={2080}
          height={1300}
          light={ARENA_LIGHT}
          pose={{shR: 62 + dj.x * 2, elR: 40 + dj.y * 3, shL: -8, elL: 8, facing: 0.5, lean: 3}}
          expr={{smile: 0.6, mouthOpen: 0.2, browTilt: 0.6, lookX: 0.8, eyesWide: 0.3}}
          handProps={{
            R: (
              <g transform="rotate(-30)">
                <rect x={-8} y={-70} width={16} height={120} rx={6} fill="#ffd23a" stroke="#141414" strokeWidth={3} />
                <path d="M-8,50 L0,72 L8,50 Z" fill="#141414" />
              </g>
            ),
          }}
        />
      </AbsoluteFill>
      <VibeTicks x={420} y={1120} w={120} h={140} frame={fr} k={1} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "...saiu um terremoto no papel." — top-down on the page: the autograph comes out as a seismograph trace. */
export const STerremoto: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const ter = ev(p, 'L15', 12);
  const pap = ev(p, 'L15', 14);
  const draw = kf(fr, [2, pap + 2], [0, 1], (x) => x);
  const ampOf = (u: number) => {
    // small "Da…" wiggle, then it explodes on "terremoto"
    const uT = clamp((ter - 2) / (pap + 2 - 2));
    return u < uT ? 22 + 18 * Math.sin(u * 40) : lerp(40, 260, clamp((u - uT) / 0.25));
  };
  const n = 110;
  const d = seismoPath(140, 940, 940, ampOf, 'aut', n, draw);
  // pen tip = last point drawn
  const pts = d.slice(1).split(' L');
  const last = pts[pts.length - 1].split(',').map(Number);
  const pj = trem(fr, fr >= ter ? 10 : 4, 'pen');
  const pageJ = trem(fr, fr >= ter ? 6 : 1.5, 'pg');
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} rot={[-3, 1]} pan={[0, 0, 0, 0]} whip="d" shakes={[{at: ter, amp: 18, dur: 18}, {at: pap, amp: 10}]}>
      <AbsoluteFill style={{background: '#3a2a1a'}} />
      <AbsoluteFill style={{transform: `translate(${pageJ.x}px,${pageJ.y}px) rotate(${pageJ.r - 2}deg)`}}>
        <Svg>
          <rect x={60} y={360} width={960} height={1260} rx={14} fill="#c0392b" />
          <rect x={80} y={376} width={920} height={1228} rx={6} fill="#fffdf6" />
          {Array.from({length: 22}).map((_, i) => (
            <line key={i} x1={80} x2={1000} y1={430 + i * 54} y2={430 + i * 54} stroke="#9ec3e6" strokeWidth={3} />
          ))}
          <line x1={170} x2={170} y1={376} y2={1604} stroke="#e98a8a" strokeWidth={4} />
          <text x={200} y={590} fontFamily="Caveat, cursive" fontWeight={700} fontSize={64} fill="#6b4a9a" transform="rotate(-3 200 590)">
            Autógrafo pro Davi ♥
          </text>
          <path d={d} stroke="#1d2a7a" strokeWidth={7} fill="none" strokeLinejoin="round" />
        </Svg>
      </AbsoluteFill>
      {/* Davi's hand + pen at the tip */}
      <Svg>
        <g transform={`translate(${last[0] + pj.x},${last[1] + pj.y}) rotate(${-28 + pj.r * 6})`}>
          <rect x={-12} y={-250} width={24} height={240} rx={8} fill="#ffd23a" stroke="#141414" strokeWidth={4} />
          <path d="M-12,-12 L0,0 L12,-12 Z" fill="#141414" />
          <ellipse cx={30} cy={-170} rx={70} ry={58} fill={DAVI_OUTFIT.skin.base} stroke={DAVI_OUTFIT.skin.shade} strokeWidth={4} />
          <ellipse cx={-6} cy={-150} rx={22} ry={16} fill={DAVI_OUTFIT.skin.light} opacity={0.6} />
          <path d={`M-10,-240 L120,-260 L190,-800 L-60,-800 Z`} fill={DAVI_OUTFIT.top.base} />
          <rect x={-40} y={-262} width={170} height={46} rx={18} fill={DAVI_OUTFIT.top.shade} />
        </g>
      </Svg>
      <SoundWord x={760} y={1250} text="RABISC!" k={fr - ter} size={96} rot={8} color="#fff" />
      <Chip x={540} y={1720} text="MAGNITUDE 7,8" k={kf(fr, [pap, pap + 5], [0, 1], easeOut)} color="#ff5a5a" size={56} />
      <Finish vignette={0.35} grain={0.07} />
    </Rig>
  );
};

/* ================================================================== L16 */

const CloseBg: React.FC<{t: number; dusk?: number}> = ({t, dusk = 0.6}) => (
  <AbsoluteFill style={{filter: 'blur(12px)'}}>
    <ArenaBack t={t} horizon={1500} cheer={0.2} empty={0.6} dusk={dusk} rows={9} scale={1.4} />
    <Sand horizon={1500} t={t} />
  </AbsoluteFill>
);

/* "E tu? Que poder piada..." — Davi straight to camera, still trembling, points at the viewer on "tu". */
export const SETu: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tu = ev(p, 'L16', 1);
  const pt = kf(fr, [tu - 3, tu + 3], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[0, 20, 0, -10]} rot={[1, -1]} whip="u" punches={[{at: tu, amt: 0.06}]} origin={[540, 900]}>
      <CloseBg t={t} />
      <Trem frame={fr} amp={5} seed="etu" ox={540} oy={1400}>
        <Pup
          outfit={DAVI_OUTFIT}
          x={540}
          y={2830}
          height={2250}
          upperOnly
          light={ARENA_LIGHT}
          pose={{shR: lerp(10, 40, pt), elR: lerp(-8, 105, pt), shL: -10, elL: 8}}
          expr={{smile: 0.7, mouthOpen: 0.3 + 0.2 * Math.abs(Math.sin(fr * 0.7)), browRaise: 0.6, eyesWide: 0.15}}
          handProps={{R: pt > 0.3 ? <Finger angle={lerp(10, 40, pt) + lerp(-8, 105, pt)} /> : undefined}}
        />
      </Trem>
      <VibeTicks x={540} y={900} w={660} h={520} frame={fr} k={0.8} />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* "...tu ia transformar em roubado?" — card flip: VIBRAR (PIADA) → ROUBADO; Davi smug below. */
export const SRoubado: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tr = ev(p, 'L16', 7);
  const rb = ev(p, 'L16', 9);
  const arrow = kf(fr, [tr, tr + 8], [0, 1], easeOut);
  const gold = kf(fr, [rb, rb + 4], [0, 1], easeOut);
  const card = (x: number, title: string, sub: string, col: string, k: number, icon: React.ReactNode) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 560,
        width: 380,
        height: 400,
        transform: `translate(-50%,0) scale(${lerp(0.6, 1, k)}) rotate(${lerp(-10, x < 540 ? -4 : 4, k)}deg)`,
        opacity: clamp(k * 2),
        background: 'rgba(10,14,30,0.85)',
        border: `6px solid ${col}`,
        borderRadius: 26,
        boxShadow: `0 0 30px ${col}66`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <svg width={180} height={150} viewBox="-90 -75 180 150">
        {icon}
      </svg>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 74, color: col, lineHeight: 1}}>{title}</div>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: '#fff', opacity: 0.85}}>{sub}</div>
    </div>
  );
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} pan={[0, -20, 0, 10]} rot={[-1, 1]} whip="r" punches={[{at: rb, amt: 0.07}]}>
      <CloseBg t={t} dusk={0.8} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(40,60,140,0.55), rgba(5,8,20,0.75) 75%)'}} />
      {card(
        280,
        'PIADA',
        'VIBRAR 📳',
        '#ff5a5a',
        kf(fr, [0, 6], [0, 1], easeOut),
        <g>
          <rect x={-34} y={-60} width={68} height={120} rx={12} fill="#2f3440" stroke="#fff" strokeWidth={5} />
          {[-1, 1].map((s) => (
            <path key={s} d={`M${s * 52},-30 q${s * 12},30 0,60 M${s * 70},-40 q${s * 16},40 0,80`} stroke="#ffd23a" strokeWidth={6} fill="none" strokeLinecap="round" opacity={fr % 2 ? 1 : 0.5} />
          ))}
        </g>,
      )}
      {card(
        800,
        'ROUBADO',
        'NÚMERO 1',
        gold > 0.5 ? '#ffd23a' : '#7a8296',
        clamp(arrow * 1.4),
        <g style={{filter: gold > 0.5 ? 'drop-shadow(0 0 12px #ffd23a)' : undefined}}>
          <path d="M-70,40 L-80,-40 L-36,-6 L0,-60 L36,-6 L80,-40 L70,40 Z" fill={gold > 0.5 ? '#ffd23a' : '#7a8296'} stroke="#141414" strokeWidth={5} strokeLinejoin="round" />
          <rect x={-70} y={40} width={140} height={20} rx={4} fill={gold > 0.5 ? '#e0a92a' : '#5a6070'} />
        </g>,
      )}
      <Svg>
        <g opacity={arrow}>
          <path d={`M480,760 L${lerp(480, 600, arrow)},760`} stroke="#fff" strokeWidth={16} strokeLinecap="round" />
          {arrow > 0.8 && <path d="M580,730 L615,760 L580,790" stroke="#fff" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </g>
        {gold > 0 &&
          Array.from({length: 10}).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const r0 = 200 + gold * 120;
            return <line key={i} x1={800 + Math.cos(a) * r0} y1={760 + Math.sin(a) * r0} x2={800 + Math.cos(a) * (r0 + 60)} y2={760 + Math.sin(a) * (r0 + 60)} stroke="#ffd23a" strokeWidth={8} strokeLinecap="round" opacity={1 - gold * 0.6} />;
          })}
      </Svg>
      <Trem frame={fr} amp={4} seed="rb" ox={540} oy={1700}>
        <Pup outfit={DAVI_OUTFIT} x={540} y={3050} height={1900} upperOnly light={ARENA_LIGHT} pose={{facing: 0, headTilt: -4}} expr={{halfSmile: 1, smile: 0.3, browAsym: 0.9, lookX: 0, eyesWide: 0}} />
      </Trem>
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* "Comenta aí." — extreme close-up, still trembling, he winks on "aí"; hard cut to black. */
export const SComenta: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const ai = ev(p, 'L16', 11);
  const wink = kf(fr, [ai - 1, ai + 2], [0, 1]);
  const bubble = kf(fr, [ai, ai + 6], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} pan={[0, 0, 0, 0]} rot={[-1, 0.5]} whip="l" punches={[{at: ai, amt: 0.05}]} origin={[540, 900]}>
      <CloseBg t={t} dusk={0.7} />
      <Trem frame={fr} amp={3} seed="cm" ox={540} oy={1200}>
        <Pup outfit={DAVI_OUTFIT} x={540} y={4000} height={3500} upperOnly light={ARENA_LIGHT} pose={{}} expr={{smile: lerp(0.6, 1, wink), mouthOpen: 0.25, browAsym: 0.6 * wink, browRaise: 0.3}}>
          <Wink k={wink} />
        </Pup>
      </Trem>
      {/* comment bubble */}
      <div
        style={{
          position: 'absolute',
          left: 250,
          top: 1660,
          transform: `translate(-50%,-50%) scale(${bubble}) rotate(-6deg)`,
          background: '#fff',
          borderRadius: 40,
          padding: '18px 34px',
          fontFamily: CAPTION_FONT,
          fontWeight: 700,
          fontSize: 60,
          color: '#141414',
          boxShadow: '0 10px 0 rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
        }}
      >
        💬 COMENTA!
      </div>
      <Finish vignette={0.5} grain={0.07} />
    </Rig>
  );
};

export const SBlack: React.FC<ShotP> = () => <AbsoluteFill style={{background: '#000'}} />;
void random;
