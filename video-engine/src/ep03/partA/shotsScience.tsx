import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {Puppet} from '../../characters/Puppet';
import {commuterOutfit} from '../../ep02qi/characters';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {Bust, VibeLines, WaveLine, vibe} from '../characters';
import {Tuner} from '../Tuner';
import {Shockwave} from '../../fx/Shockwave';
import {Jit} from './shotsIntro';
import {
  Chip,
  CutFlash,
  DAY_LIGHT,
  DaviRoom,
  Desk,
  EnergyLines,
  Finish,
  FreezeFx,
  HudTag,
  LAMP_LIGHT,
  LabBg,
  Park,
  RingWaves,
  Rig,
  STAGE_LIGHT,
  ShotP,
  Shards,
  SfxWord,
  Sparkle,
  Stamp,
  Svg,
  WineGlass,
  abs,
  clamp,
  easeOut,
  ev,
  kf,
  lerp,
} from './kit';

/* ------------------------------------------------------------------ L4: Davi's room */

const Notebook: React.FC<{x: number; y: number; s?: number; open?: boolean}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -200,0 L 0,-14 L 200,0 L 190,-140 L 0,-150 L -190,-140 Z" fill="#fbf6ea" stroke="#c9bfa8" strokeWidth={4} />
    <line x1={0} y1={-150} x2={0} y2={-14} stroke="#c9bfa8" strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M -170,${-120 + i * 26} Q -90,${-128 + i * 26} -30,${-120 + i * 26}`} stroke="#6b8fd0" strokeWidth={3} fill="none" opacity={0.7} />
    ))}
    <path d="M 30,-100 q 20,-30 40,0 t 40,0 t 40,0 t 40,0" stroke="#e5484d" strokeWidth={5} fill="none" />
  </g>
);

/** 14. "Só que o Davi descobriu uma" — room at night, notebook; light-bulb moment on "descobriu". */
export const SRoom: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const D = ev(p, 'L4', 4);
  const up = kf(fr, [D - 2, D + 3], [0, 1], easeOut);
  const write = fr < D ? Math.sin(fr * 1.6) * 6 : 0;
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.02]} pan={[0, 60, 0, 0]} punches={[{at: D, amt: 0.06}]}>
      <DaviRoom t={t} deskY={1300} />
      <PlacedDavi
        x={480}
        y={1720}
        height={960}
        pose={{lean: lerp(14, 0, up), headTilt: lerp(16, -4, up), shL: 30, elL: 60, shR: lerp(-30 + write, -150, up), elR: lerp(-60, -10, up)}}
        expr={{lookX: lerp(0.2, 0.3, up), lookY: lerp(0.9, -0.6, up), eyesWide: 0.6 * up, smile: 0.5 * up, browRaise: up, mouthOpen: 0.3 * up}}
        light={LAMP_LIGHT}
      />
      <Svg>
        <Desk x0={60} x1={1020} y={1300} lampX={850} />
        <Notebook x={470} y={1300} s={1.1} />
        {/* bulb */}
        {up > 0 && (
          <g transform={`translate(${470},${560}) scale(${up})`} style={{filter: 'drop-shadow(0 0 30px #ffd23a)'}}>
            <circle cx={0} cy={0} r={70} fill="#ffe36a" />
            <rect x={-30} y={60} width={60} height={50} rx={8} fill="#9aa0ae" />
            {Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 95} y1={Math.sin(a) * 95} x2={Math.cos(a) * 135} y2={Math.sin(a) * 135} stroke="#ffd23a" strokeWidth={10} strokeLinecap="round" />;
            })}
          </g>
        )}
      </Svg>
      <Chip x={540} y={1700} text="03:12 · MADRUGADA" k={kf(fr, [2, 8], [0, 1])} color="#1a1420" fg="#ffd23a" size={40} />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/** Door drawn standalone (for the objects shot). */
const Door: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-170} y={-900} width={340} height={900} fill="#7a5236" />
    <rect x={-140} y={-870} width={280} height={840} fill="#8a6040" />
    <rect x={-110} y={-820} width={220} height={330} rx={8} fill="#7a5236" opacity={0.6} />
    <rect x={-110} y={-440} width={220} height={360} rx={8} fill="#7a5236" opacity={0.6} />
    <circle cx={110} cy={-450} r={16} fill="#e8b84a" />
  </g>
);

/** 15. "coisa: tudo no mundo" — objects in the room each emitting waves at their own rhythm. */
export const SObjects: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const items = [
    {x: 220, y: 1200, rate: 0.9, label: 'PORTA', c: '#ff8a5a'},
    {x: 560, y: 1080, rate: 3.2, label: 'COPO', c: '#8fd8ff'},
    {x: 880, y: 1180, rate: 0.5, label: 'PONTE', c: '#3be08a'},
  ];
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.0]} pan={[80, 0, -60, 0]} whip="l">
      <DaviRoom t={t} deskY={1350} />
      <Svg>
        <Door x={220} y={1470} />
        <Desk x0={360} x1={1100} y={1350} />
        <WineGlass x={560} y={1350} s={0.75} />
        {/* book with bridge drawing */}
        <g transform="translate(880,1340)">
          <rect x={-170} y={-260} width={340} height={250} rx={8} fill="#fbf6ea" stroke="#c9bfa8" strokeWidth={5} />
          <path d={`M -140,-90 Q 0,${-90 + Math.sin(t * 3) * 20} 140,-90`} stroke="#3a3d4a" strokeWidth={8} fill="none" />
          <line x1={-90} y1={-200} x2={-90} y2={-50} stroke="#3a3d4a" strokeWidth={8} />
          <line x1={90} y1={-200} x2={90} y2={-50} stroke="#3a3d4a" strokeWidth={8} />
          <path d="M -90,-200 Q 0,-110 90,-200" stroke="#3a3d4a" strokeWidth={4} fill="none" />
        </g>
        {items.map((it, i) => (
          <g key={i} opacity={kf(fr, [i * 5, i * 5 + 5], [0, 1])}>
            <RingWaves x={it.x} y={it.y - 120} t={t} rate={it.rate} maxR={240} color={it.c} />
          </g>
        ))}
      </Svg>
      {items.map((it, i) => (
        <Chip key={i} x={it.x} y={1640} text={it.label} k={kf(fr, [i * 5 + 3, i * 5 + 9], [0, 1])} color={it.c} size={38} />
      ))}
      <Finish vignette={0.55} grain={0.12} />
    </Rig>
  );
};

/** 16. "tem uma frequência natural." — science card: each object, its own wave and Hz. */
export const SFreq: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const F = ev(p, 'L4', 12);
  const rows = [
    {icon: '🥂', name: 'TAÇA', hz: '~500 Hz', cyc: 14, c: '#8fd8ff'},
    {icon: '🚪', name: 'PORTA', hz: '~20 Hz', cyc: 5, c: '#ff8a5a'},
    {icon: '🌉', name: 'PONTE', hz: '~1 Hz', cyc: 1.5, c: '#3be08a'},
  ];
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} whip="u">
      <LabBg c1="#1d3f6a" c2="#060b18" t={t} />
      {rows.map((r, i) => {
        const y = 640 + i * 230;
        const k = kf(fr, [i * 4, i * 4 + 6], [0, 1], easeOut);
        return (
          <div key={i} style={{position: 'absolute', left: 60, right: 60, top: y, height: 190, opacity: k, transform: `translateX(${(1 - k) * -120}px)`}}>
            <div style={{position: 'absolute', left: 0, top: 30, fontSize: 110}}>{r.icon}</div>
            <div style={{position: 'absolute', left: 150, top: 10, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: '#fff'}}>{r.name}</div>
            <svg width={560} height={140} style={{position: 'absolute', left: 150, top: 50}}>
              <WaveLine x1={10} x2={550} y={70} amp={46} cycles={r.cyc} phase={-t * r.cyc * 3} color={r.c} width={7} />
            </svg>
            <div style={{position: 'absolute', right: 0, top: 50, fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 66, color: r.c}}>{r.hz}</div>
          </div>
        );
      })}
      <Stamp x={540} y={1690} text="FREQUÊNCIA NATURAL" color="#ffd23a" bg="rgba(10,14,30,0.85)" k={fr - F} size={74} rot={-4} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/** 17. "Um ritmo em que vibra" — notebook sketch: a bridge deck swinging in a standing wave. */
export const SBridge: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const amp = kf(fr, [0, p.dur], [20, 90]);
  const deck = (dx: number) => 1040 + Math.sin(((dx - 140) / 800) * Math.PI) * Math.sin(t * 2 * Math.PI * 1.2) * amp;
  const N = 40;
  const path = Array.from({length: N + 1})
    .map((_, i) => {
      const x = 140 + (800 * i) / N;
      return `${i ? 'L' : 'M'}${x},${deck(x).toFixed(1)}`;
    })
    .join(' ');
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[-3, -1]} whip="r">
      <AbsoluteFill style={{background: '#fbf6ea'}}>
        <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(107,143,208,0.35) 2px, transparent 2px)', backgroundSize: '100% 64px'}} />
        <AbsoluteFill style={{left: 110, width: 4, background: 'rgba(229,72,77,0.5)'}} />
        <AbsoluteFill style={{background: 'linear-gradient(rgba(20,24,40,0) 64%, rgba(20,24,40,0.55) 70%, rgba(20,24,40,0.55) 83%, rgba(20,24,40,0) 88%)'}} />
      </AbsoluteFill>
      <Svg>
        <g stroke="#2a2d3a" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1={340} y1={700} x2={340} y2={1300} />
          <line x1={740} y1={700} x2={740} y2={1300} />
          <path d={`M 140,${deck(140)} Q 240,760 340,700 Q 540,${960 + (deck(540) - 1040) * 0.6} 740,700 Q 840,760 940,${deck(940)}`} strokeWidth={5} />
          {Array.from({length: 15}).map((_, i) => {
            const x = 180 + i * 52;
            return <line key={i} x1={x} y1={deck(x) - 4} x2={x} y2={x < 340 || x > 740 ? deck(x) - 80 : 760 + Math.abs(x - 540) * -0.2} strokeWidth={3} opacity={0.6} />;
          })}
          <path d={path} strokeWidth={14} stroke="#2a2d3a" />
          <path d="M 60,1300 Q 540,1240 1020,1300" stroke="#6b8fd0" strokeWidth={6} />
        </g>
        {/* amplitude arrows */}
        <g stroke="#e5484d" strokeWidth={7} fill="none" strokeLinecap="round">
          <line x1={540} y1={1040 - amp - 30} x2={540} y2={1040 + amp + 30} />
          <path d={`M 520,${1040 - amp - 10} L 540,${1040 - amp - 34} L 560,${1040 - amp - 10}`} />
          <path d={`M 520,${1040 + amp + 10} L 540,${1040 + amp + 34} L 560,${1040 + amp + 10}`} />
        </g>
        <text x={760} y={1180} fontFamily="Comic Sans MS, Oswald" fontWeight={700} fontSize={58} fill="#e5484d" transform="rotate(-6 760 1180)">
          ~1 Hz!
        </text>
        {/* pencil */}
        <g transform={`translate(${860 + Math.sin(t * 9) * 10},${1450}) rotate(-35)`}>
          <rect x={0} y={-20} width={380} height={40} fill="#ffd23a" />
          <rect x={300} y={-20} width={60} height={40} fill="#e8a0a0" />
          <path d="M 0,-20 L -60,0 L 0,20 Z" fill="#f0d0a0" />
          <path d="M -40,-7 L -60,0 L -40,7 Z" fill="#2a2d3a" />
        </g>
      </Svg>
      <Finish vignette={0.35} grain={0.08} />
    </Rig>
  );
};

/** 18. "mais fácil." — Davi gets it: grin, vibrating finger with yellow energy lines. */
export const SIdea: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.18, 1.06]} pow={3} rot={[2, 0]}>
      <DaviRoom t={t} deskY={1500} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(255,210,58,0.25), rgba(0,0,0,0.4) 70%)'}} />
      <Bust outfit={DAVI_OUTFIT} cx={500} cy={920} r={240} pose={{headTilt: -6}} expr={{halfSmile: 1, smile: 0.4, browAsym: 0.8, blink: 0.2, lookX: 0.5, lookY: -0.2}} light={LAMP_LIGHT} />
      <Svg>
        {/* raised finger */}
        <g transform={`translate(${860 + vibe(fr, 5, 'fg').x},${1100 + vibe(fr, 5, 'fg').y})`}>
          <rect x={-70} y={40} width={140} height={500} rx={60} fill={DAVI_OUTFIT.top.base} />
          <rect x={-70} y={40} width={140} height={70} rx={30} fill={DAVI_OUTFIT.top.shade} />
          <ellipse cx={0} cy={10} rx={70} ry={80} fill={DAVI_OUTFIT.skin.base} />
          <rect x={-20} y={-150} width={40} height={150} rx={20} fill={DAVI_OUTFIT.skin.base} />
        </g>
        <VibeLines cx={860} cy={1000} w={120} h={220} k={1} frame={fr} n={3} />
        <Sparkle x={860} y={920} k={fr / 14} s={70} />
      </Svg>
      <EnergyLines x={860} y={1000} r0={120} r1={420} k={0.9} frame={fr} seed="idea" count={12} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ L5: the swing */

const SW0 = 21.09;
/** Swing amplitude (deg) vs absolute time: tiny → almost a full loop by "ressonância". */
const ampAt = (s: number) => kf(s, [21.09, 23.25, 24.32, 25.79, 26.6], [14, 24, 55, 115, 168], (x) => x);
const PERIOD = 1.15;
/** Swing angle (deg) at absolute time s. Negative = seat swung to the right (toward Davi). */
const thetaAt = (s: number) => ampAt(s) * Math.cos(((s - SW0) / PERIOD) * Math.PI * 2 + Math.PI);

const KID = commuterOutfit(17);
const Swing: React.FC<{px: number; py: number; L: number; th: number; s: number; happy?: number}> = ({px, py, L, th, s, happy = 0.5}) => {
  const k = 0.42 * s;
  return (
    <g>
      {/* frame */}
      <g stroke="#c9472a" strokeWidth={26 * s} strokeLinecap="round">
        <line x1={px - L * 0.75} y1={py + L * 1.55} x2={px - L * 0.45} y2={py} />
        <line x1={px + L * 0.75} y1={py + L * 1.55} x2={px + L * 0.45} y2={py} />
        <line x1={px - L * 0.5} y1={py} x2={px + L * 0.5} y2={py} stroke="#e8b84a" />
      </g>
      <g transform={`translate(${px},${py}) rotate(${th})`}>
        <line x1={-70 * s} y1={0} x2={-70 * s} y2={L} stroke="#5a5e6e" strokeWidth={8 * s} />
        <line x1={70 * s} y1={0} x2={70 * s} y2={L} stroke="#5a5e6e" strokeWidth={8 * s} />
        <g transform={`translate(0,${L + 6 * s}) scale(${k}) translate(0,${480 - 40})`}>
          <Puppet outfit={KID} pose={{hipL: 78, knL: -82, hipR: 84, knR: -84, shL: 150, elL: 30, shR: 160, elR: 20, facing: 0.4, headTilt: -th * 0.15}} expr={{smile: happy, mouthOpen: happy * 0.8, eyesWide: happy * 0.6, lookX: 0.5}} light={DAY_LIGHT} />
        </g>
        <rect x={-110 * s} y={L - 4 * s} width={220 * s} height={22 * s} rx={8 * s} fill="#8a5a36" />
      </g>
    </g>
  );
};

/** Arc arrow showing the swing amplitude (deg) around the pivot. */
const AmpArc: React.FC<{px: number; py: number; R: number; deg: number; k: number}> = ({px, py, R, deg, k}) => {
  if (k <= 0) return null;
  const d = Math.min(deg, 175);
  const pt = (a: number) => [px - Math.sin((a * Math.PI) / 180) * R * -1, py + Math.cos((a * Math.PI) / 180) * R];
  const N = 30;
  const pts = Array.from({length: N + 1}).map((_, i) => pt((-d * i) / N));
  const end = pts[N];
  const prev = pts[N - 2];
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  return (
    <g opacity={k} stroke="#ffd23a" strokeWidth={12} fill="none" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px #ffd23a)'}}>
      <path d={'M' + pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' L')} strokeDasharray="4 22" />
      <path d={`M ${end[0] + Math.cos(ang + 2.5) * 40},${end[1] + Math.sin(ang + 2.5) * 40} L ${end[0]},${end[1]} L ${end[0] + Math.cos(ang - 2.5) * 40},${end[1] + Math.sin(ang - 2.5) * 40}`} />
    </g>
  );
};

/** 19. "Tipo balanço de criança:" — park, a kid on a swing, Davi behind. */
export const SSwing: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} pan={[0, -40, 0, 0]} whip="d">
      <Park t={t} groundY={1500} px={-fr} />
      <Svg>
        <Swing px={500} py={640} L={560} th={-thetaAt(t)} s={1} happy={0.4} />
      </Svg>
      <PlacedDavi x={860} y={1620} height={760} flip pose={{shL: -10, shR: 30, elR: -30}} expr={{smile: 0.5, lookX: 0.6, lookY: 0}} light={DAY_LIGHT} />
      <Chip x={540} y={1720} text="🎠 BALANÇO" k={kf(fr, [3, 9], [0, 1])} color="#ffffff" size={42} />
      <Finish vignette={0.35} grain={0.08} />
    </Rig>
  );
};

/** 20. "empurrãozinho no ritmo" — close: Davi's single finger taps the seat exactly when it comes back. */
export const STap: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const th = thetaAt(t);
  // finger contact when the seat is at the right extreme (theta near -amp)
  const phase = ((((t - SW0) / PERIOD) % 1) + 1) % 1;
  const near = Math.abs(phase - 0) < 0.08 || Math.abs(phase - 1) < 0.08;
  const tapAge = Math.round(Math.min(phase, 1 - phase) * PERIOD * 30);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} whip="r" origin={[700, 1100]}>
      <Park t={t} groundY={1700} px={-300} />
      <Svg>
        <g transform="translate(-250,-300) scale(1.6)">
          <Swing px={500} py={640} L={560} th={-th} s={1} happy={0.6} />
        </g>
      </Svg>
      <PlacedDavi x={1000} y={2050} height={1250} flip pose={{shR: 70, elR: 10, lean: -6}} expr={{halfSmile: 0.8, lookX: 0.8, lookY: 0.2, blink: 0.25}} light={DAY_LIGHT} />
      {near && <SfxWord x={640} y={980} text="TOC" k={6 - tapAge} color="#ffffff" size={90} rot={-8} />}
      <Svg>{near && <Sparkle x={700} y={1180} k={0.5} s={60} />}</Svg>
      <HudTag x={80} y={1620} label="EMPURRÃO" value="BEM DE LEVE" k={kf(fr, [4, 10], [0, 1])} color="#ffd23a" size={70} />
      <Finish vignette={0.35} grain={0.08} />
    </Rig>
  );
};

/** 21–23. Side view of the swing with the amplitude arrow; zoomed out as the swing goes higher. */
const SwingWide: React.FC<{p: ShotP; zoom: [number, number]; L: number; py: number; label?: string; freezeAt?: number; davi?: 'push' | 'shock'}> = ({p, zoom, L, py, label, freezeAt, davi = 'push'}) => {
  const fr = useCurrentFrame();
  const fz = freezeAt !== undefined && fr >= freezeAt ? freezeAt : fr;
  const t = abs(p, fz);
  const th = thetaAt(t);
  const A = ampAt(t);
  const fk = freezeAt !== undefined ? kf(fr, [freezeAt, freezeAt + 3], [0, 1]) : 0;
  return (
    <Rig dur={p.dur} zoom={zoom} rot={[-0.6, 0.6]} shakes={freezeAt !== undefined ? [{at: freezeAt, dur: 8, amp: 10}] : []}>
      <Park t={t} groundY={py + L * 1.55} px={0} />
      <Svg>
        <AmpArc px={540} py={py} R={L + 90} deg={A} k={1} />
        <Swing px={540} py={py} L={L} th={-th} s={L / 560} happy={1} />
      </Svg>
      <PlacedDavi
        x={540 + L * 0.92}
        y={py + L * 1.55}
        height={L * 1.15}
        flip
        pose={davi === 'push' ? {shR: 60, elR: 10} : {shL: -60, elL: -60, shR: 60, elR: 60}}
        expr={davi === 'push' ? {smile: 0.6, lookX: 0.5, lookY: -0.3} : {eyesWide: 1, mouthOpen: 0.9, browRaise: 1, lookY: -0.9}}
        light={DAY_LIGHT}
      />
      <HudTag x={80} y={1560} label="AMPLITUDE" value={`${Math.round(A)}°`} k={1} color="#ffd23a" size={96} />
      {label && <Chip x={540} y={1760} text={label} k={kf(fr, [3, 8], [0, 1])} color="#3be08a" size={42} />}
      <FreezeFx k={fk} />
      <Finish vignette={0.35} grain={0.08} />
    </Rig>
  );
};

/** 21. "certo, e ele vai cada" */
export const SHigher: React.FC<ShotP> = (p) => <SwingWide p={p} zoom={[1.04, 1.08]} L={500} py={560} label="NO RITMO CERTO ✓" />;
/** 22. "vez mais alto." */
export const SHigh: React.FC<ShotP> = (p) => <SwingWide p={p} zoom={[1.08, 1.03]} L={420} py={760} />;
/** 23. "alto. Isso é" — almost a full loop; freeze-frame at the top, Davi in shock. */
export const SLoop: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  // freeze when the seat is at its highest in this shot
  let best = 0;
  let bv = -1;
  for (let i = 0; i < p.dur; i++) {
    const v = Math.abs(thetaAt(abs(p, i)));
    if (v > bv) {
      bv = v;
      best = i;
    }
  }
  return (
    <>
      <SwingWide p={p} zoom={[1.03, 1.1]} L={380} py={820} label="QUASE 360°!" freezeAt={best} davi="shock" />
      {fr >= best && <SfxWord x={540} y={640} text="UEEEPA!" k={fr - best} color="#ffffff" size={100} rot={-6} />}
    </>
  );
};

/** 24. "é ressonância." — graph: small pushes in rhythm, amplitude envelope growing. */
export const SReso: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const R = ev(p, 'L5', 17);
  const draw = kf(fr, [0, 22], [0, 1], (x) => x);
  const X0 = 90;
  const X1 = 990;
  const Y = 1000;
  const N = 220;
  const cyc = 7;
  const pts = Array.from({length: N + 1})
    .map((_, i) => {
      const u = (i / N) * draw;
      const x = X0 + (X1 - X0) * u;
      const env = 30 + 300 * Math.pow(u, 1.6);
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${(Y - Math.sin(u * cyc * Math.PI * 2) * env).toFixed(1)}`;
    })
    .join(' ');
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} whip="u" punches={[{at: R, amt: 0.06}]}>
      <LabBg c1="#24456e" c2="#060b18" t={t} />
      <Svg>
        <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="#ffffff" strokeWidth={3} opacity={0.4} />
        <line x1={X0} y1={620} x2={X0} y2={1380} stroke="#ffffff" strokeWidth={3} opacity={0.4} />
        <path d={pts} stroke="#8fd8ff" strokeWidth={9} fill="none" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px #8fd8ff)'}} />
        {/* pushes, one per cycle, at the bottom of each swing */}
        {Array.from({length: cyc}).map((_, i) => {
          const u = (i + 0.75) / cyc;
          if (u > draw) return null;
          const x = X0 + (X1 - X0) * u;
          const env = 30 + 300 * Math.pow(u, 1.6);
          return (
            <g key={i}>
              <line x1={x} y1={Y + env + 90} x2={x} y2={Y + env + 20} stroke="#ffd23a" strokeWidth={10} strokeLinecap="round" />
              <path d={`M ${x - 18},${Y + env + 44} L ${x},${Y + env + 18} L ${x + 18},${Y + env + 44}`} stroke="#ffd23a" strokeWidth={10} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
        <text x={X1} y={1520} textAnchor="end" fontFamily={HUD_FONT} fontWeight={700} fontSize={34} letterSpacing={3} fill="#ffd23a">
          ↑ EMPURRÃOZINHO NO RITMO
        </text>
      </Svg>
      <Stamp x={540} y={1690} text="RESSONÂNCIA" color="#3be08a" bg="rgba(10,14,30,0.85)" k={fr - R} size={100} rot={-5} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ L6: the wine glass */

const Stage: React.FC<{t: number; hue?: string}> = ({hue = '#2a3a6a'}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 45% at 50% 55%, ${hue}, #05070f 80%)`}}>
    <Svg>
      <path d="M 440,0 L 640,0 L 940,1400 L 140,1400 Z" fill="rgba(255,255,255,0.06)" />
      <ellipse cx={540} cy={1400} rx={460} ry={70} fill="rgba(255,255,255,0.08)" />
      <rect x={0} y={1400} width={1080} height={520} fill="#0c0f1c" />
    </Svg>
  </AbsoluteFill>
);

/** 25. "Uma taça de vidro vibra" — spotlit glass, slow push-in, "ding" sparkle. */
export const SGlass: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.14]} pow={1.5} origin={[540, 1100]}>
      <Stage t={t} />
      <Svg>
        <WineGlass x={540} y={1400} s={1.8} wob={0.05} ph={t * 30} glow={0.4} />
        <Sparkle x={380} y={800} k={(fr - 6) / 14} s={60} />
        <Sparkle x={720} y={900} k={(fr - 16) / 14} s={40} />
      </Svg>
      <Chip x={540} y={1690} text="🥂 TAÇA DE VIDRO" k={kf(fr, [3, 9], [0, 1])} color="#8fd8ff" size={42} />
      <Finish vignette={0.6} grain={0.1} />
    </Rig>
  );
};

/** Davi's vibrating finger reaching in from the left toward the glass rim. */
const FingerIn: React.FC<{x: number; y: number; fr: number; k: number}> = ({x, y, fr, k}) => {
  const v = vibe(fr, 4, 'fi');
  const xx = lerp(-500, x, easeOut(clamp(k)));
  return (
    <g transform={`translate(${xx + v.x},${y + v.y}) rotate(-8)`}>
      <rect x={-900} y={-80} width={800} height={160} rx={70} fill={DAVI_OUTFIT.top.base} />
      <rect x={-180} y={-80} width={80} height={160} rx={30} fill={DAVI_OUTFIT.top.shade} />
      <ellipse cx={-50} cy={0} rx={90} ry={70} fill={DAVI_OUTFIT.skin.base} />
      <rect x={-10} y={-22} width={130} height={44} rx={22} fill={DAVI_OUTFIT.skin.base} />
    </g>
  );
};

/** 26. "perto de quinhentos hertz." — Davi's finger near the rim, sound rings; tuner locks 500 Hz on "hertz". */
export const SHz: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const Q = ev(p, 'L6', 7);
  const HZ = ev(p, 'L6', 8);
  const lock = fr >= HZ;
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.12]} whip="r" origin={[600, 1000]} punches={[{at: HZ, amt: 0.05}]}>
      <Stage t={t} hue="#26406e" />
      <Svg>
        <WineGlass x={640} y={1500} s={2.2} wob={lock ? 0.25 : 0.08} ph={t * 50} glow={lock ? 0.9 : 0.3} />
        <RingWaves x={640} y={700} t={t} rate={lock ? 4 : 2} maxR={360} color={lock ? '#3be08a' : '#8fd8ff'} />
        <FingerIn x={360} y={720} fr={fr} k={fr / 10} />
        <VibeLines cx={380} cy={720} w={60} h={140} k={0.9} frame={fr} n={2} width={7} />
      </Svg>
      <Tuner hz={500} x={60} y={1590} from={Q - 6} lockAt={HZ} fromHz={220} scale={1.2} />
      <Finish vignette={0.6} grain={0.1} />
    </Rig>
  );
};

/** 27. "Acertou esse ritmo, ela" — slow motion: the bowl deforms in growing waves. Tuner locked. */
export const SWobble: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const wob = kf(fr, [0, p.dur], [0.35, 1.0], (x) => x * x);
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.28]} pow={1.3} origin={[540, 900]} shakes={[{at: p.dur - 10, dur: 12, amp: 6}]}>
      <Stage t={t} hue="#2a4a5e" />
      <Svg>
        <WineGlass x={540} y={1620} s={2.7} wob={wob} ph={fr * 0.55} glow={0.6 + wob * 0.6} />
        <RingWaves x={540} y={720} t={t * 0.4} rate={4} maxR={420} color="#3be08a" k={0.8} />
      </Svg>
      <EnergyLines x={540} y={760} r0={380} r1={700} k={wob} frame={fr} seed="gw" count={14} />
      <Tuner hz={500} x={60} y={1590} from={-20} lockAt={-19} scale={1.2} />
      <Chip x={800} y={1700} text="CÂMERA LENTA" k={kf(fr, [2, 7], [0, 1])} color="#ffffff" size={34} />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/** 28. "estoura." — shatter. */
export const SShatter: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.2, 1.1]} shakes={[{at: 0, dur: 14, amp: 34}]} origin={[540, 900]}>
      <Stage t={t} hue="#3a5a7e" />
      <Svg>
        {/* the stem + base survive */}
        <g transform="translate(540,1620) scale(2.7)">
          <ellipse cx={0} cy={0} rx={90} ry={18} fill="rgba(220,240,255,0.35)" stroke="#e9f6ff" strokeWidth={5} />
          <rect x={-7} y={-150} width={14} height={150} fill="rgba(230,245,255,0.6)" stroke="#e9f6ff" strokeWidth={3} />
          <path d="M -7,-150 L -20,-175 L -4,-168 L 4,-186 L 10,-166 L 22,-178 L 7,-150 Z" fill="rgba(220,240,255,0.5)" stroke="#fff" strokeWidth={3} />
        </g>
        <Shards x={540} y={900} age={fr * 0.7} n={46} spread={30} gravity={0.5} />
      </Svg>
      <Shockwave cx={540} cy={900} age={fr} rings={3} speed={46} maxR={900} color="200,240,255" />
      <SfxWord x={540} y={1300} text="CRASH!" k={fr} color="#8fd8ff" size={150} rot={-8} />
      <Tuner hz={500} x={60} y={1590} from={-20} lockAt={-19} to={8} scale={1.2} />
      <CutFlash frames={5} />
      <Finish vignette={0.55} grain={0.12} />
    </Rig>
  );
};

export {random};
