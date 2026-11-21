import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../../lib/constants';
import {clamp, lerp} from '../../lib/anim';
import {useUid} from '../../lib/useUid';
import {HUD_FONT} from '../../lib/fonts';
import type {Pose} from '../../characters/types';
import {Svg} from './sets';

export const walk = (t: number, ph = 0, amp = 1): Pose => {
  const s = Math.sin(t * 9 + ph);
  return {
    hipL: s * 16 * amp,
    hipR: -s * 16 * amp,
    knL: Math.max(0, -s) * 20 * amp,
    knR: Math.max(0, s) * 20 * amp,
    shL: -8 - s * 12 * amp,
    elL: 10,
    shR: 8 + s * 12 * amp,
    elR: -10,
    bob: -Math.abs(s) * 10 * amp,
  };
};

/** Laughing bounce: head shakes, shoulders bob. */
export const laughBob = (t: number, k = 1) => ({
  bob: -Math.abs(Math.sin(t * 16)) * 10 * k,
  headTilt: Math.sin(t * 8) * 4 * k,
});

/* ------------------------------------------------------------------ plaza (generic arrival) */
export const Plaza: React.FC<{t: number; px?: number}> = ({t, px = 0}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#8fc3ea 0%,#cfe6f2 55%,#f4e3c4 100%)'}}>
    <Svg>
      <g transform={`translate(${px * 0.3},0)`}>
        {Array.from({length: 10}).map((_, i) => {
          const x = -500 + i * 230;
          const top = 520 + random(`pz${i}`) * 220;
          const c = ['#d9b38c', '#e8d2b0', '#c98f6b', '#efe2c8', '#b9a48c'][i % 5];
          return (
            <g key={i}>
              <rect x={x} y={top} width={232} height={900} fill={c} />
              {Array.from({length: 5}).map((__, r) =>
                Array.from({length: 3}).map((___, k) => <rect key={`${r}${k}`} x={x + 30 + k * 66} y={top + 50 + r * 130} width={40} height={80} fill="#4a5a6a" opacity={0.75} />),
              )}
              <rect x={x - 6} y={top - 20} width={244} height={24} fill="rgba(0,0,0,0.15)" />
            </g>
          );
        })}
      </g>
      <rect x={-600} y={1260} width={2400} height={700} fill="#b8a68c" />
      {Array.from({length: 14}).map((_, r) => (
        <line key={r} x1={-600} y1={1260 + Math.pow(r / 13, 1.7) * 660} x2={1800} y2={1260 + Math.pow(r / 13, 1.7) * 660} stroke="#9a896f" strokeWidth={3} />
      ))}
      {Array.from({length: 26}).map((_, i) => (
        <line key={i} x1={-600 + i * 90 + px} y1={1260} x2={-1700 + i * 200 + px * 1.6} y2={H} stroke="#9a896f" strokeWidth={3} />
      ))}
    </Svg>
  </AbsoluteFill>
);

/** Flying papers / leaves blown radially from (cx, cy). age in frames. */
export const BlownDebris: React.FC<{cx: number; cy: number; age: number; count?: number; seed?: string; color?: string}> = ({cx, cy, age, count = 22, seed = 'deb', color = '#f4f1ea'}) => {
  if (age < 0) return null;
  return (
    <Svg>
      {Array.from({length: count}).map((_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const a = r('a') * Math.PI * 2;
        const v = 18 + r('v') * 34;
        const d = v * age * (1 - Math.min(0.6, age * 0.015));
        const x = cx + Math.cos(a) * d + (r('x') - 0.5) * 160;
        const y = cy + Math.sin(a) * d * 0.55 + age * age * 0.25 + (r('y') - 0.5) * 60;
        const rot = age * (10 + r('r') * 30) * (r('s') > 0.5 ? 1 : -1);
        const s = 0.6 + r('z') * 1.2;
        return (
          <g key={i} transform={`translate(${x},${y}) rotate(${rot}) scale(${s},${s * Math.abs(Math.cos(age * 0.3 + i))})`}>
            <rect x={-22} y={-28} width={44} height={56} fill={i % 4 === 0 ? '#e3b04b' : color} />
            <line x1={-14} y1={-14} x2={14} y2={-14} stroke="#aaa" strokeWidth={3} />
            <line x1={-14} y1={0} x2={14} y2={0} stroke="#aaa" strokeWidth={3} />
          </g>
        );
      })}
    </Svg>
  );
};

/* ------------------------------------------------------------------ phone with photo grid */

/** Procedural travel-photo thumbnail (index-driven palette + motif). */
export const Thumb: React.FC<{x: number; y: number; s: number; i: number}> = ({x, y, s, i}) => {
  const r = (k: string) => random(`th${i}${k}`);
  const hue = Math.floor(r('h') * 360);
  const motif = Math.floor(r('m') * 5);
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width={s} height={s} fill={`hsl(${hue},55%,${55 + r('l') * 20}%)`} />
      <rect y={s * 0.62} width={s} height={s * 0.38} fill={`hsl(${(hue + 40) % 360},40%,${30 + r('l2') * 20}%)`} />
      {motif === 0 && <path d={`M${s * 0.5},${s * 0.12} L${s * 0.68},${s * 0.62} L${s * 0.32},${s * 0.62} Z`} fill="#3a3a44" />}
      {motif === 1 && <circle cx={s * 0.7} cy={s * 0.3} r={s * 0.13} fill="#fff3c2" />}
      {motif === 2 && <path d={`M0,${s * 0.62} L${s * 0.35},${s * 0.25} L${s * 0.6},${s * 0.5} L${s * 0.8},${s * 0.3} L${s},${s * 0.62} Z`} fill="#eef3f7" opacity={0.85} />}
      {motif === 3 && [0.15, 0.4, 0.65].map((k) => <rect key={k} x={s * k} y={s * (0.25 + k * 0.2)} width={s * 0.2} height={s * 0.6} fill="#2e3440" opacity={0.7} />)}
      {motif === 4 && <ellipse cx={s * 0.5} cy={s * 0.72} rx={s * 0.4} ry={s * 0.06} fill="#fff" opacity={0.6} />}
    </g>
  );
};

/** Phone body (centred at cx, cy; w x h) with the screen content as children (screen-space px). */
export const Phone: React.FC<{cx: number; cy: number; w: number; h: number; children?: React.ReactNode}> = ({cx, cy, w, h, children}) => {
  const id = useUid('ph');
  const x = cx - w / 2;
  const y = cy - h / 2;
  return (
    <Svg>
      <defs>
        <clipPath id={id}>
          <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} rx={40} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={58} fill="#121318" />
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} rx={54} fill="none" stroke="#4a4d58" strokeWidth={4} />
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill="#0c0d10" />
        {children}
      </g>
      <rect x={cx - 70} y={y + 30} width={140} height={34} rx={17} fill="#000" />
    </Svg>
  );
};

/** Gloved hand gripping the phone's lower edge (screen space). */
export const GloveHold: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <Svg>
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M -60,40 L -40,420 L 220,420 L 200,40 Z" fill="#2c2f36" />
      <rect x={-50} y={10} width={240} height={50} rx={10} fill="#eef0f3" />
      <path d="M -40,-60 Q 60,-120 180,-70 L 200,40 Q 80,70 -50,30 Z" fill="#1b1c22" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-90 - i * 4} y={-150 + i * 48} width={150} height={44} rx={22} fill="#1d1e24" stroke="#050506" strokeWidth={3} />
      ))}
      <path d="M 170,-40 Q 240,-140 210,-230 L 170,-220 Q 180,-140 130,-60 Z" fill="#1d1e24" stroke="#050506" strokeWidth={3} />
      <path d="M -40,-56 Q 60,-110 170,-70" stroke="#8a90a0" strokeWidth={4} fill="none" opacity={0.5} />
    </g>
  </Svg>
);

/* ------------------------------------------------------------------ Rocha seen from behind (at the sink) */
export const TuxBack: React.FC<{x: number; y: number; s: number; bend?: number; scrub?: number}> = ({x, y, s, bend = 0, scrub = 0}) => (
  <Svg>
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* legs */}
      <rect x={-90} y={-470} width={76} height={470} rx={20} fill="#121317" />
      <rect x={14} y={-470} width={76} height={470} rx={20} fill="#121317" />
      <rect x={-100} y={-24} width={100} height={30} rx={10} fill="#050506" />
      <rect x={4} y={-24} width={100} height={30} rx={10} fill="#050506" />
      <g transform={`rotate(${bend * 6} 0 -460)`}>
        {/* jacket back */}
        <path d="M -150,-800 Q -170,-760 -150,-480 L -126,-400 L 126,-400 L 150,-480 Q 170,-760 150,-800 Q 0,-830 -150,-800 Z" fill="#17181d" />
        <path d="M 0,-560 L 0,-400" stroke="#08080a" strokeWidth={6} />
        <path d="M -150,-800 Q -110,-700 -120,-480" stroke="#3b3d46" strokeWidth={6} fill="none" opacity={0.6} />
        {/* arms forward to the sink */}
        <path d={`M -140,-760 Q -200,-600 ${-90 + scrub * 10},-560`} stroke="#17181d" strokeWidth={70} strokeLinecap="round" fill="none" />
        <path d={`M 140,-760 Q 200,-600 ${90 - scrub * 10},-560`} stroke="#17181d" strokeWidth={70} strokeLinecap="round" fill="none" />
        {/* collar + neck + bald head from behind */}
        <rect x={-36} y={-880} width={72} height={90} rx={20} fill="#a8704f" />
        <path d="M -60,-812 Q 0,-790 60,-812 L 50,-830 Q 0,-815 -50,-830 Z" fill="#eef0f3" />
        <g transform={`translate(0,${-900 + bend * 30})`}>
          <ellipse cx={-118} cy={10} rx={22} ry={30} fill="#c48d66" />
          <ellipse cx={118} cy={10} rx={22} ry={30} fill="#c48d66" />
          <circle r={122} fill="#d79f78" />
          <path d="M -122,0 A 122,122 0 0 0 122,0 Z" fill="#3a2a22" opacity={0} />
          <ellipse cx={-30} cy={-70} rx={40} ry={20} fill="#fff" opacity={0.25} />
          <path d="M -110,40 Q 0,140 110,40 L 100,90 Q 0,150 -100,90 Z" fill="#3a2a22" opacity={0.85} />
        </g>
      </g>
    </g>
  </Svg>
);

/* ------------------------------------------------------------------ gloved hands washing */
export const WashHands: React.FC<{t: number; cx: number; cy: number; s: number; reveal: number; flow: number}> = ({t, cx, cy, s, reveal, flow}) => {
  const rub = Math.sin(t * 14);
  const hand = (side: -1 | 1, dy: number) => (
    <g transform={`translate(${side * (70 + rub * 18 * side)},${dy}) rotate(${side * -18 + rub * 6})`}>
      {/* sleeve + cuff */}
      <path d={`M ${side * 120},180 L ${side * 520},420 L ${side * 520},700 L ${side * 60},340 Z`} fill="#141519" />
      <path d={`M ${side * 70},150 L ${side * 160},210 L ${side * 100},330 L ${side * 10},270 Z`} fill="#eef0f3" />
      <circle cx={side * 100} cy={240} r={9} fill="#d9a943" />
      {/* glove */}
      <path d={`M ${side * -40},-150 Q ${side * -90},-40 ${side * -30},150 Q ${side * 50},220 ${side * 120},170 Q ${side * 140},40 ${side * 90},-150 Z`} fill="#1b1c22" stroke="#030304" strokeWidth={4} />
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={side > 0 ? -50 + k * 34 : 50 - k * 34 - 32} y={-250 + Math.abs(k - 1.5) * 14} width={32} height={130} rx={16} fill="#1d1e24" stroke="#030304" strokeWidth={3} />
      ))}
      <path d={`M ${side * 100},60 Q ${side * 170},0 ${side * 150},-80`} stroke="#1d1e24" strokeWidth={36} strokeLinecap="round" fill="none" />
      {/* leather sheen + stitching (reveal) */}
      <g opacity={reveal}>
        <path d={`M ${side * -20},-130 Q ${side * -50},-20 ${side * -10},120`} stroke="#9aa3b5" strokeWidth={8} fill="none" opacity={0.7} strokeLinecap="round" />
        {[-1, 0, 1].map((k) => (
          <path key={k} d={`M ${side * (10 + k * 30)},-100 L ${side * (20 + k * 30)},60`} stroke="#4a4f5c" strokeWidth={3} strokeDasharray="8 7" />
        ))}
        <circle cx={side * 60} cy={140} r={7} fill="#7a808c" />
      </g>
    </g>
  );
  return (
    <Svg>
      <g transform={`translate(${cx},${cy}) scale(${s})`}>
        {/* water stream */}
        <rect x={-18} y={-900} width={36} height={900} fill="rgba(200,235,255,0.55)" opacity={flow} />
        <rect x={-6} y={-900} width={8} height={900} fill="#fff" opacity={0.6 * flow} />
        {hand(-1, 0)}
        {hand(1, 20)}
        {/* splash + droplets */}
        {Array.from({length: 26}).map((_, i) => {
          const r = (k: string) => random(`wd${i}${k}`);
          const ph = (t * (2 + r('v') * 2) + r('p')) % 1;
          const a = -Math.PI / 2 + (r('a') - 0.5) * 2.6;
          const d = ph * (160 + r('d') * 200);
          return <circle key={i} cx={Math.cos(a) * d} cy={-40 + Math.sin(a) * d + ph * ph * 260} r={4 + r('s') * 8} fill="#d8f2ff" opacity={(1 - ph) * 0.9 * flow} />;
        })}
        {/* foam hint fades as the leather is revealed */}
        {Array.from({length: 14}).map((_, i) => (
          <circle key={'f' + i} cx={(random(`fx${i}`) - 0.5) * 260} cy={(random(`fy${i}`) - 0.5) * 220} r={16 + random(`fr${i}`) * 22} fill="#f4fbff" opacity={(1 - reveal) * 0.75} />
        ))}
      </g>
    </Svg>
  );
};

/** "BLAM"-style comic impact word. */
export const ImpactWord: React.FC<{text: string; x: number; y: number; k: number; color?: string; rot?: number}> = ({text, x, y, k, color = '#fff', rot = -8}) => {
  if (k <= 0 || k >= 1) return null;
  const s = lerp(0.4, 1.25, clamp(k * 3)) * (1 + k * 0.1);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: 1 - clamp((k - 0.6) / 0.4),
        fontFamily: HUD_FONT,
        fontWeight: 800,
        fontSize: 150,
        color,
        WebkitTextStroke: '6px #111',
        textShadow: '0 8px 0 #111',
        letterSpacing: 4,
      }}
    >
      {text}
    </div>
  );
};

/** Floating memory panels (Paris / Tokyo / Himalaya...) for the "depende do dia" bokeh. */
export const MemoryPanels: React.FC<{t: number; k: number}> = ({t, k}) => (
  <AbsoluteFill style={{opacity: k, filter: 'blur(5px)'}}>
    <Svg>
      {Array.from({length: 7}).map((_, i) => {
        const x = ((i * 260 + t * 60) % 1500) - 240;
        const y = 300 + (i % 3) * 420 + Math.sin(t + i) * 20;
        return (
          <g key={i} transform={`rotate(${(i % 2 ? 1 : -1) * 6} ${x} ${y})`} opacity={0.75}>
            <rect x={x - 12} y={y - 12} width={244} height={284} fill="#fff" />
            <Thumb x={x} y={y} s={220} i={i * 7 + 3} />
          </g>
        );
      })}
    </Svg>
  </AbsoluteFill>
);

export {W, H};
