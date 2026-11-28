import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {HUD_FONT, CAPTION_FONT} from '../../lib/fonts';
import {PARTS, f} from '../timeline';

/** Palette — clean engineering infographic. */
export const C = {
  bg0: '#071a2e',
  bg1: '#0d3256',
  grid: 'rgba(120,190,255,0.08)',
  line: '#e8f3ff',
  water: '#38b6ff',
  waterDeep: '#1478c8',
  teal: '#2fd6c3',
  green: '#3be08a',
  yellow: '#ffd23a',
  orange: '#ffb02e',
  red: '#ff4d4d',
  purple: '#a06bff',
  panel: 'rgba(8,24,44,0.82)',
  white: '#ffffff',
  soil: '#6b4a2f',
  soilDark: '#4b3220',
  asphalt: '#3a3f47',
};

export const PART_START = PARTS.C.start;
/** Local (part) frame of an absolute time. */
export const lf = (abs: number) => f(abs) - f(PART_START);

/** Frame within the current shot of an absolute time; `st` = shot start (abs s). */
export const useShot = (st: number) => {
  const frame = useCurrentFrame();
  const T = (abs: number) => f(abs) - f(st);
  return {frame, T};
};

export const ease = Easing.inOut(Easing.cubic);
export const k = (frame: number, a: number, b: number, from = 0, to = 1, easing = ease) =>
  interpolate(frame, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const popIn = (frame: number, at: number, fps = 30) =>
  spring({frame: frame - at, fps, config: {damping: 13, stiffness: 170, mass: 0.6}});

/** A shot = Sequence between two absolute times (part-local placement). */
export const Shot: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => (
  <Sequence from={lf(a)} durationInFrames={Math.max(1, lf(b) - lf(a))} layout="none">
    <AbsoluteFill>{children}</AbsoluteFill>
  </Sequence>
);

/** Blueprint background with drifting grid. */
export const Blueprint: React.FC<{drift?: number; tint?: string}> = ({drift = 0, tint}) => {
  const frame = useCurrentFrame();
  const off = (frame * 0.4 + drift) % 60;
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 45%, ${tint ?? C.bg1} 0%, ${C.bg0} 75%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <pattern id="pcgrid" width={60} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(${off},${off * 0.5})`}>
            <path d="M60 0 H0 V60" fill="none" stroke={C.grid} strokeWidth={2} />
          </pattern>
        </defs>
        <rect width={1080} height={1920} fill="url(#pcgrid)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(100% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Camera: animates scale + center across the shot (x,y = focus point in 1080x1920 space). */
export const Cam: React.FC<{
  dur: number;
  from: {x: number; y: number; s: number};
  to: {x: number; y: number; s: number};
  children: React.ReactNode;
}> = ({dur, from, to, children}) => {
  const frame = useCurrentFrame();
  const t = k(frame, 0, dur, 0, 1, Easing.inOut(Easing.sin));
  const s = from.s + (to.s - from.s) * t;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  return (
    <AbsoluteFill style={{transform: `translate(${540 - x * s}px, ${960 - y * s}px) scale(${s})`, transformOrigin: '0 0'}}>
      {children}
    </AbsoluteFill>
  );
};

/** Pill chip that pops in at local frame `at`. */
export const Chip: React.FC<{
  at: number;
  x: number;
  y: number;
  text: React.ReactNode;
  color?: string;
  fg?: string;
  size?: number;
  anchor?: 'center' | 'left' | 'right';
  out?: number;
}> = ({at, x, y, text, color = C.white, fg = '#0b2440', size = 44, anchor = 'center', out}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = popIn(frame, at);
  const o = out !== undefined ? k(frame, out - 5, out, 1, 0) : 1;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) scale(${0.6 + 0.4 * p})`,
        opacity: Math.min(1, p * 1.5) * o,
        padding: `${size * 0.22}px ${size * 0.5}px`,
        borderRadius: size * 0.5,
        background: color,
        color: fg,
        fontFamily: HUD_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 1,
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
      }}
    >
      {text}
    </div>
  );
};

/** Small caps label (no background). */
export const Label: React.FC<{at: number; x: number; y: number; text: string; size?: number; color?: string; anchor?: 'middle' | 'start' | 'end'}> = ({
  at,
  x,
  y,
  text,
  size = 30,
  color = C.white,
  anchor = 'middle',
}) => {
  const frame = useCurrentFrame();
  const o = k(frame, at, at + 6);
  return (
    <text x={x} y={y + (1 - o) * 10} textAnchor={anchor} fill={color} opacity={o} fontFamily={HUD_FONT} fontWeight={700} fontSize={size} letterSpacing={1.5}
      style={{paintOrder: 'stroke'}} stroke="rgba(5,15,30,0.7)" strokeWidth={size * 0.16}>
      {text}
    </text>
  );
};

/** Top-left section tag ("COMO EVITAR 2/3"). Stays clear of the meter (x>660) and caption band (y>269). */
export const SectionTag: React.FC<{text: string; sub?: string; at?: number}> = ({text, sub, at = 0}) => {
  const frame = useCurrentFrame();
  const p = popIn(frame, at);
  return (
    <div style={{position: 'absolute', left: 40, top: 60, transform: `translateX(${(1 - p) * -40}px)`, opacity: Math.min(1, p * 1.4)}}>
      <div style={{display: 'inline-block', padding: '8px 18px', borderRadius: 10, background: C.water, color: '#04203a', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 2}}>{text}</div>
      {sub && <div style={{marginTop: 8, color: '#fff', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 46, letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>{sub}</div>}
    </div>
  );
};

/** Water-drop path centered at (0,0), height ~2r. */
export const dropPath = (r: number) => `M0 ${-r} C ${r * 0.55} ${-r * 0.3} ${r * 0.8} ${r * 0.15} ${r * 0.8} ${r * 0.38} A ${r * 0.8} ${r * 0.8} 0 0 1 ${-r * 0.8} ${r * 0.38} C ${-r * 0.8} ${r * 0.15} ${-r * 0.55} ${-r * 0.3} 0 ${-r} Z`;

export const Drop: React.FC<{x: number; y: number; r: number; color?: string; opacity?: number}> = ({x, y, r, color = C.water, opacity = 1}) => (
  <g transform={`translate(${x},${y})`} opacity={opacity}>
    <path d={dropPath(r)} fill={color} />
    <ellipse cx={-r * 0.3} cy={r * 0.2} rx={r * 0.14} ry={r * 0.24} fill="#fff" opacity={0.6} />
  </g>
);

/** Animated flowing stroke along a path (dash offset). */
export const Flow: React.FC<{d: string; color?: string; width?: number; speed?: number; draw?: number; base?: string; len?: number}> = ({
  d,
  color = C.water,
  width = 14,
  speed = 3,
  draw = 1,
  base = 'rgba(255,255,255,0.18)',
  len = 2000,
}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <path d={d} stroke={base} strokeWidth={width + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} opacity={0.55} />
      {draw >= 1 && <path d={d} stroke="#fff" strokeWidth={width * 0.45} fill="none" strokeLinecap="round" strokeDasharray="10 34" strokeDashoffset={-frame * speed} opacity={0.85} />}
    </g>
  );
};

/** Round flow meter / hydrometer icon with spinning dial. */
export const Meter: React.FC<{x: number; y: number; r?: number; spin?: number; color?: string; label?: string; s?: number}> = ({x, y, r = 34, spin = 0, color = C.teal, label, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={r + 6} fill="#0b2440" stroke={color} strokeWidth={5} />
    <circle r={r - 4} fill="#eaf6ff" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <line key={i} x1={0} y1={-(r - 6)} x2={0} y2={-(r - 13)} stroke="#0b2440" strokeWidth={3} transform={`rotate(${i * 45})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-(r - 10)} stroke={C.red} strokeWidth={5} strokeLinecap="round" transform={`rotate(${spin})`} />
    <circle r={5} fill="#0b2440" />
    {label && (
      <text y={r + 42} textAnchor="middle" fill="#fff" fontFamily={HUD_FONT} fontWeight={700} fontSize={26} stroke="rgba(5,15,30,0.7)" strokeWidth={5} style={{paintOrder: 'stroke'}}>
        {label}
      </text>
    )}
  </g>
);

export const Panel: React.FC<{x: number; y: number; w: number; h: number; title?: string; children?: React.ReactNode}> = ({x, y, w, h, title, children}) => (
  <g transform={`translate(${x},${y})`}>
    <rect width={w} height={h} rx={26} fill={C.panel} stroke="rgba(140,200,255,0.35)" strokeWidth={3} />
    {title && (
      <text x={30} y={52} fill="#9fd4ff" fontFamily={HUD_FONT} fontWeight={700} fontSize={30} letterSpacing={2}>
        {title}
      </text>
    )}
    {children}
  </g>
);

export const FONT = {hud: HUD_FONT, cap: CAPTION_FONT};
