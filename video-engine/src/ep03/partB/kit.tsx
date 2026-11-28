import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import type {Lighting} from '../../characters/types';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {Pup, Svg, commuter} from '../../ep02qi/partB/kit';

export {Pup, Svg, commuter, DAVI_OUTFIT};
export {Chip, Finger, headOf, run, walkP, Sweat} from '../../ep02qi/partB/kit';
export {Stamp, HudTag, EnergyLines, Smear, Stars} from '../../ep02qi/partA/kit';
export {CutFlash} from '../../ep01/partA/kit';
export {Finish} from '../../scenes/common';
export {Shockwave} from '../../fx/Shockwave';

/* ------------------------------------------------------------------ lights */
export const ARENA_LIGHT: Lighting = {side: 1, rim: '#ffe7b0', rimStrength: 0.85, shadeStrength: 0.6};
export const DOME_LIGHT: Lighting = {side: -1, rim: '#8fd8ff', rimStrength: 1, shadeStrength: 0.65};
export const GOLD_LIGHT: Lighting = {side: 1, rim: '#ffd23a', rimStrength: 1, shadeStrength: 0.5};

/** Per-frame trembling offset (Davi's side effect). amp px. */
export const trem = (frame: number, amp: number, seed = 't') => ({
  x: (random(`${seed}x${frame}`) - 0.5) * 2 * amp,
  y: (random(`${seed}y${frame}`) - 0.5) * 2 * amp,
  r: (random(`${seed}r${frame}`) - 0.5) * amp * 0.25,
});

/** Wrapper that trembles its children around (ox, oy). */
export const Trem: React.FC<{frame: number; amp: number; seed?: string; ox?: number; oy?: number; children: React.ReactNode}> = ({frame, amp, seed = 'T', ox = 540, oy = 960, children}) => {
  const j = trem(frame, amp, seed);
  return (
    <AbsoluteFill style={{transform: `translate(${j.x}px,${j.y}px) rotate(${j.r}deg)`, transformOrigin: `${ox}px ${oy}px`}}>{children}</AbsoluteFill>
  );
};

/** Little motion ticks either side of something vibrating (cartoon "brrr" marks). */
export const VibeTicks: React.FC<{x: number; y: number; w: number; h: number; frame: number; k?: number; color?: string; sw?: number}> = ({x, y, w, h, frame, k = 1, color = '#ffd23a', sw = 7}) => {
  if (k <= 0.01) return null;
  const o = frame % 2 ? 1 : 0.55;
  return (
    <Svg>
      <g opacity={k * o} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" style={{filter: `drop-shadow(0 0 6px ${color})`}}>
        {[-1, 1].map((s) =>
          [0, 1, 2].map((i) => {
            const xx = x + s * (w / 2 + 18 + i * 22);
            const hh = h * (0.5 - i * 0.12);
            return <path key={`${s}${i}`} d={`M${xx},${y - hh / 2} q${s * 12},${hh / 4} 0,${hh / 2} q${-s * 12},${hh / 4} 0,${hh / 2}`} />;
          }),
        )}
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ dome shield */
/**
 * Blue hex force-field dome. Base centre (cx, by), radius r (px). wob 0..1 wobble amplitude,
 * ripple = frames since touch (rings from the touch point tx,ty), crack 0..1 crack lines.
 */
export const Dome: React.FC<{cx: number; by: number; r: number; t: number; wob?: number; ripple?: number; tx?: number; ty?: number; crack?: number; op?: number; hue?: string; front?: boolean}> = ({
  cx,
  by,
  r,
  t,
  wob = 0,
  ripple = -1,
  tx = 0,
  ty = 0,
  crack = 0,
  op = 1,
  hue = '90,190,255',
  front = true,
}) => {
  const N = 64;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const a = Math.PI + (i / N) * Math.PI; // left base → over the top → right base
    const w = wob * (Math.sin(a * 6 + t * 38) * 0.06 + Math.sin(a * 3 - t * 27) * 0.05);
    const rr = r * (1 + w);
    pts.push([cx + Math.cos(a) * rr * (1 + wob * 0.04 * Math.sin(t * 40)), by + Math.sin(a) * rr * (1 - wob * 0.04 * Math.sin(t * 40))]);
  }
  const d = 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L') + ` Q${cx},${by + r * 0.12} ${pts[0][0]},${pts[0][1]} Z`;
  const id = `dome${Math.round(cx)}${Math.round(r)}`;
  // hex grid
  const hexes: React.ReactNode[] = [];
  const hs = r / 7;
  for (let row = -1; row < 9; row++)
    for (let col = -9; col <= 9; col++) {
      const hx = cx + col * hs * 1.5;
      const hy = by - row * hs * 1.732 - (col % 2 ? hs * 0.866 : 0);
      const dd = Math.hypot(hx - cx, hy - by);
      if (dd > r * 0.98 || hy > by) continue;
      const ph = 0.25 + 0.25 * Math.sin(t * 3 + col * 0.7 + row * 1.1);
      const rp = ripple >= 0 ? Math.max(0, 1 - Math.abs(Math.hypot(hx - tx, hy - ty) - ripple * 26) / 60) : 0;
      const p = Array.from({length: 6}).map((_, k) => {
        const a = (k / 6) * Math.PI * 2;
        return `${(hx + Math.cos(a) * hs * 0.92).toFixed(1)},${(hy + Math.sin(a) * hs * 0.92).toFixed(1)}`;
      });
      hexes.push(<polygon key={`${row}_${col}`} points={p.join(' ')} fill={`rgba(${hue},${0.04 + rp * 0.5})`} stroke={`rgba(200,240,255,${ph + rp})`} strokeWidth={2 + rp * 4} />);
    }
  const cracks: React.ReactNode[] = [];
  if (crack > 0) {
    for (let i = 0; i < 9; i++) {
      const a0 = Math.PI + 0.15 + random(`ca${i}`) * (Math.PI - 0.3);
      let x = tx || cx;
      let y = ty || by - r * 0.5;
      const segs = [`M${x},${y}`];
      const len = r * 1.2 * crack;
      for (let s = 1; s <= 6; s++) {
        const aa = a0 + (random(`cs${i}${s}`) - 0.5) * 0.9;
        x += Math.cos(aa) * (len / 6);
        y += Math.sin(aa) * (len / 6) * (aa > 0 && aa < Math.PI ? -1 : 1);
        segs.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
      }
      cracks.push(<path key={i} d={segs.join(' ')} stroke="#fff" strokeWidth={5} fill="none" strokeLinejoin="round" opacity={clamp(crack * 2)} />);
    }
  }
  return (
    <Svg style={{opacity: op}}>
      <defs>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.85" r="0.75">
          <stop offset="0" stopColor={`rgb(${hue})`} stopOpacity={0.05} />
          <stop offset="0.8" stopColor={`rgb(${hue})`} stopOpacity={0.22} />
          <stop offset="1" stopColor="#d8f3ff" stopOpacity={0.7} />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      <g style={{filter: `drop-shadow(0 0 22px rgba(${hue},0.9))`}}>
        <path d={d} fill={`url(#${id}g)`} />
        <g clipPath={`url(#${id}c)`}>{hexes}</g>
        <path d={d} fill="none" stroke="#c9f0ff" strokeWidth={8} />
        {front && <path d={`M${cx - r * 0.55},${by - r * 0.62} Q${cx - r * 0.3},${by - r * 0.92} ${cx + r * 0.05},${by - r * 0.95}`} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.45} />}
        {ripple >= 0 &&
          [0, 7, 14].map((dl) => {
            const a = ripple - dl;
            if (a < 0) return null;
            const rr = a * 26;
            return <circle key={dl} cx={tx} cy={ty} r={rr} fill="none" stroke="#fff" strokeWidth={6} opacity={clamp(1 - rr / (r * 1.6))} clipPath={`url(#${id}c)`} />;
          })}
        {cracks}
      </g>
    </Svg>
  );
};

/** Blue glass shards exploding from (cx, cy). age = frames since the shatter; slow = time factor (slow-mo). */
export const Shards: React.FC<{cx: number; cy: number; r: number; age: number; slow?: number; n?: number; hue?: string; seed?: string}> = ({cx, cy, r, age, slow = 1, n = 46, hue = '120,205,255', seed = 'sh'}) => {
  if (age < 0) return null;
  const tt = age * slow;
  return (
    <Svg>
      <g style={{filter: `drop-shadow(0 0 10px rgba(${hue},0.9))`}}>
        {Array.from({length: n}).map((_, i) => {
          const q = (k: string) => random(`${seed}${i}${k}`);
          const a = Math.PI + q('a') * Math.PI + (q('b') < 0.2 ? q('c') * Math.PI : 0);
          const r0 = r * (0.3 + q('r') * 0.7);
          const v = 14 + q('v') * 30;
          const x = cx + Math.cos(a) * (r0 + v * tt);
          const y = cy + Math.sin(a) * (r0 + v * tt) + 0.5 * tt * tt * 0.9;
          const s = 18 + q('s') * 48;
          const rot = q('o') * 360 + tt * (q('w') - 0.5) * 30;
          const pts = `0,${-s} ${s * 0.6},${s * 0.2} ${-s * 0.2},${s * 0.7} ${-s * 0.55},${-s * 0.1}`;
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${rot})`} opacity={clamp(1.4 - tt / 40)}>
              <polygon points={pts} fill={`rgba(${hue},0.45)`} stroke="#e8f8ff" strokeWidth={3} />
              <line x1={-s * 0.3} y1={-s * 0.4} x2={s * 0.2} y2={-s * 0.1} stroke="#fff" strokeWidth={4} opacity={0.8} />
            </g>
          );
        })}
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ confetti */
const CONF = ['#ffd23a', '#ff5a7a', '#3be08a', '#4ab4ff', '#ffffff', '#ff9a3a', '#b57bff'];
export const Confetti: React.FC<{age: number; n?: number; seed?: string; x0?: number; x1?: number; speed?: number}> = ({age, n = 90, seed = 'cf', x0 = -40, x1 = 1120, speed = 1}) => {
  if (age < 0) return null;
  return (
    <Svg>
      {Array.from({length: n}).map((_, i) => {
        const q = (k: string) => random(`${seed}${i}${k}`);
        const tt = age * speed;
        const x = lerp(x0, x1, q('x')) + Math.sin(tt * 0.15 + q('p') * 6) * 40;
        const y = -60 - q('y') * 900 + tt * (14 + q('v') * 12);
        const rot = q('o') * 360 + tt * (q('w') - 0.5) * 40;
        const fl = Math.abs(Math.cos(tt * 0.3 + q('f') * 6));
        return <rect key={i} x={-10} y={-6} width={20} height={12} rx={2} fill={CONF[i % CONF.length]} transform={`translate(${x},${y}) rotate(${rot}) scale(1,${fl})`} />;
      })}
    </Svg>
  );
};

/* ------------------------------------------------------------------ crab */
/** Cartoon crab at (x,y) (feet line), size s (~1 = 200px wide), walk t seconds. */
export const Crab: React.FC<{x: number; y: number; s?: number; t: number; look?: number; wave?: number}> = ({x, y, s = 1, t, look = 0, wave = 0}) => {
  const step = Math.sin(t * 22);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
      <g transform={`translate(${x},${y + Math.abs(step) * -4 * s}) scale(${s})`}>
        <ellipse cx={0} cy={6} rx={90} ry={14} fill="#000" opacity={0.25} />
        {/* legs */}
        {[-1, 1].map((sd) =>
          [0, 1, 2].map((i) => {
            const ph = step * (i % 2 ? 1 : -1) * 10;
            const bx = sd * (30 + i * 14);
            return <path key={`${sd}${i}`} d={`M${bx},-40 L${bx + sd * (36 + ph)},${-38 + i * 4} L${bx + sd * (46 + ph)},0`} stroke="#c2361f" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
          }),
        )}
        {/* claws */}
        {[-1, 1].map((sd) => {
          const lift = sd === 1 ? wave * Math.sin(t * 14) * 18 : 0;
          return (
            <g key={sd} transform={`translate(${sd * 74},${-86 - lift}) rotate(${sd * -20 - lift})`}>
              <path d={`M${-sd * 30},40 L0,8`} stroke="#d9452a" strokeWidth={14} strokeLinecap="round" />
              <path d="M-26,0 Q-30,-40 0,-42 Q28,-40 24,-6 L4,-14 Z" fill="#e9573a" stroke="#9e2a15" strokeWidth={4} />
              <path d="M24,-6 Q16,10 -4,8 Q-22,6 -26,0" fill="#e9573a" stroke="#9e2a15" strokeWidth={4} />
            </g>
          );
        })}
        {/* body */}
        <ellipse cx={0} cy={-46} rx={70} ry={42} fill="#e9573a" stroke="#9e2a15" strokeWidth={5} />
        <ellipse cx={-18} cy={-62} rx={30} ry={12} fill="#ff8a6a" opacity={0.7} />
        {/* eye stalks */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <line x1={sd * 18} y1={-80} x2={sd * 24} y2={-118} stroke="#c2361f" strokeWidth={8} strokeLinecap="round" />
            <circle cx={sd * 24} cy={-124} r={15} fill="#fff" stroke="#222" strokeWidth={3} />
            <circle cx={sd * 24 + look * 6} cy={-124} r={7} fill="#111" />
          </g>
        ))}
        <path d="M-14,-34 Q0,-26 14,-34" stroke="#7a1d0c" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ trophy */
/** Gold "#1" trophy as an SVG group: base at (0,0), ~350 units tall (use as a puppet heldProp or inside <Svg>). */
export const TrophyG: React.FC<{s?: number; glow?: number; x?: number; y?: number; rot?: number}> = ({s = 1, glow = 0.6, x = 0, y = 0, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} style={{filter: `drop-shadow(0 0 ${24 * glow}px rgba(255,210,58,${glow}))`}}>
    <defs>
      <linearGradient id="trophyG" x1="0" x2="1">
        <stop offset="0" stopColor="#b8861a" />
        <stop offset="0.35" stopColor="#ffe27a" />
        <stop offset="0.6" stopColor="#f2b928" />
        <stop offset="1" stopColor="#9a6a10" />
      </linearGradient>
    </defs>
    <rect x={-70} y={-40} width={140} height={40} rx={6} fill="#3a2a1a" />
    <rect x={-50} y={-64} width={100} height={26} rx={4} fill="url(#trophyG)" />
    <rect x={-14} y={-130} width={28} height={70} fill="url(#trophyG)" />
    <path d="M-100,-330 Q-150,-320 -140,-260 Q-128,-200 -60,-190" stroke="url(#trophyG)" strokeWidth={18} fill="none" />
    <path d="M100,-330 Q150,-320 140,-260 Q128,-200 60,-190" stroke="url(#trophyG)" strokeWidth={18} fill="none" />
    <path d="M-110,-340 L110,-340 Q110,-150 0,-128 Q-110,-150 -110,-340 Z" fill="url(#trophyG)" stroke="#8a5a0a" strokeWidth={4} />
    <ellipse cx={0} cy={-340} rx={110} ry={20} fill="#ffe9a0" stroke="#8a5a0a" strokeWidth={4} />
    <text x={0} y={-235} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={70} fill="#8a5a0a">
      #1
    </text>
    <path d="M-70,-310 Q-80,-220 -40,-170" stroke="#fff" strokeWidth={10} fill="none" opacity={0.45} strokeLinecap="round" />
  </g>
);

/* ------------------------------------------------------------------ seismograph line */
/** Seismograph zig-zag path from x0 to x1 around baseline y. amp(u) gives amplitude along 0..1. k = draw-on 0..1. */
export const seismoPath = (x0: number, x1: number, y: number, amp: (u: number) => number, seed = 'sz', n = 120, k = 1) => {
  const m = Math.max(2, Math.floor(n * clamp(k)));
  const pts: string[] = [];
  for (let i = 0; i < m; i++) {
    const u = i / (n - 1);
    const a = amp(u);
    const sgn = i % 2 ? 1 : -1;
    pts.push(`${(x0 + (x1 - x0) * u).toFixed(1)},${(y + sgn * a * (0.4 + random(`${seed}${i}`) * 0.6)).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
};

/** Comic sound word (e.g. "DING!"). k = frames since pop. */
export const SoundWord: React.FC<{x: number; y: number; text: string; k: number; color?: string; size?: number; rot?: number; stroke?: string}> = ({x, y, text, k, color = '#ffd23a', size = 150, rot = -8, stroke = '#141414'}) => {
  if (k < 0) return null;
  const s = k < 5 ? lerp(0.3, 1.12, easeOut(k / 5)) : lerp(1.12, 1, clamp((k - 5) / 6));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        fontFamily: CAPTION_FONT,
        fontWeight: 700,
        fontSize: size,
        color,
        WebkitTextStroke: `${size * 0.07}px ${stroke}`,
        paintOrder: 'stroke fill',
        textShadow: `0 ${size * 0.06}px 0 ${stroke}`,
        letterSpacing: 2,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** Textbook paper background (cream with faint grid + margin line). */
export const Paper: React.FC<{tint?: string}> = ({tint = '#f3ead6'}) => (
  <AbsoluteFill
    style={{
      background: `repeating-linear-gradient(0deg, rgba(90,120,160,0.12) 0 2px, transparent 2px 48px), repeating-linear-gradient(90deg, rgba(90,120,160,0.08) 0 2px, transparent 2px 48px), ${tint}`,
    }}
  />
);

/** Label with a leader line (textbook style). */
export const Label: React.FC<{x: number; y: number; tx: number; ty: number; text: string; k: number; color?: string; size?: number}> = ({x, y, tx, ty, text, k, color = '#1d2a44', size = 40}) => {
  if (k <= 0) return null;
  return (
    <>
      <Svg>
        <g opacity={clamp(k * 2)}>
          <line x1={tx} y1={ty} x2={lerp(tx, x, clamp(k))} y2={lerp(ty, y, clamp(k))} stroke={color} strokeWidth={4} />
          <circle cx={tx} cy={ty} r={9} fill={color} />
        </g>
      </Svg>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%,-50%)',
          opacity: clamp(k * 2 - 0.6),
          fontFamily: HUD_FONT,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: 2,
          color,
          background: 'rgba(255,255,255,0.85)',
          border: `3px solid ${color}`,
          borderRadius: 10,
          padding: '4px 14px',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </>
  );
};

/** Ease helper re-export. */
export {clamp, easeOut, kf, lerp};

/**
 * Big close-up hand (screen px). Local frame: the finger points along +x with its tip at (0,0).
 * variant 'point' = index finger out, 'palm' = flat open hand seen from above (tip = middle fingertip).
 */
export const BigHand: React.FC<{x: number; y: number; angle: number; s?: number; variant?: 'point' | 'palm'; skin?: typeof DAVI_OUTFIT.skin; sleeve?: typeof DAVI_OUTFIT.top; glow?: number}> = ({
  x,
  y,
  angle,
  s = 1,
  variant = 'point',
  skin = DAVI_OUTFIT.skin,
  sleeve = DAVI_OUTFIT.top,
  glow = 0,
}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
    <g transform={`translate(${x},${y}) rotate(${angle}) scale(${s})`} style={glow ? {filter: `drop-shadow(0 0 ${18 * glow}px #ffd23a)`} : undefined}>
      {/* sleeve */}
      <path d="M-260,-95 L-1500,-150 L-1500,150 L-260,95 Z" fill={sleeve.base} />
      <path d="M-260,40 L-1500,90 L-1500,150 L-260,95 Z" fill={sleeve.shade} />
      <rect x={-300} y={-104} width={80} height={208} rx={30} fill={sleeve.shade} />
      {variant === 'point' ? (
        <>
          <ellipse cx={-160} cy={8} rx={100} ry={82} fill={skin.base} stroke={skin.shade} strokeWidth={5} />
          {[-34, 0, 34].map((dy) => (
            <path key={dy} d={`M-100,${dy + 30} q30,6 34,22 q-4,16 -34,16`} fill={skin.base} stroke={skin.shade} strokeWidth={4} />
          ))}
          <rect x={-130} y={-56} width={134} height={46} rx={23} fill={skin.base} stroke={skin.shade} strokeWidth={5} />
          <ellipse cx={-18} cy={-38} rx={14} ry={10} fill={skin.light} opacity={0.9} />
          <path d="M-190,-60 Q-150,-90 -110,-70" stroke={skin.shade} strokeWidth={30} strokeLinecap="round" fill="none" />
          <path d="M-190,-60 Q-150,-90 -110,-70" stroke={skin.base} strokeWidth={22} strokeLinecap="round" fill="none" />
          <ellipse cx={-190} cy={-20} rx={40} ry={20} fill={skin.light} opacity={0.5} />
        </>
      ) : (
        <>
          <ellipse cx={-170} cy={0} rx={115} ry={105} fill={skin.base} stroke={skin.shade} strokeWidth={5} />
          {[-66, -22, 22, 62].map((dy, i) => (
            <rect key={dy} x={-120} y={dy - 20} width={i === 1 ? 124 : i === 3 ? 92 : 112} height={40} rx={20} fill={skin.base} stroke={skin.shade} strokeWidth={4} />
          ))}
          <rect x={-230} y={-140} width={110} height={44} rx={22} fill={skin.base} stroke={skin.shade} strokeWidth={4} transform="rotate(-30 -175 -118)" />
          <ellipse cx={-180} cy={-10} rx={60} ry={40} fill={skin.light} opacity={0.4} />
        </>
      )}
    </g>
  </svg>
);
