import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {PuppetSvg, PuppetProps} from '../../characters/Puppet';
import {AGENT_OUTFITS} from '../../characters/Agent';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {AGENT_BLUE_OUTFIT} from '../characters';
import type {Lighting, Outfit, Pose, Tone} from '../../characters/types';
import {clamp, lerp} from '../../lib/anim';
import {HUD_FONT} from '../../lib/fonts';
import {Svg} from '../../ep02/partB/sets';
export {Svg};
export {HudTag} from '../../ep02/partB/sets';
export {ImpactWord} from '../../ep02/partB/kit';
export {DAVI_OUTFIT};

/* ------------------------------------------------------------------ lights */
export const LAMP_LIGHT: Lighting = {side: 1, rim: '#fff0b8', rimStrength: 0.8, shadeStrength: 0.8};
export {METRO_LIGHT} from '../sets/Metro';
export const HOME_LIGHT: Lighting = {side: -1, rim: '#ffc98a', rimStrength: 0.9, shadeStrength: 0.5};
export const RED_LIGHT: Lighting = {side: 1, rim: '#ff6a4a', rimStrength: 1, shadeStrength: 0.7};

/* ------------------------------------------------------------------ cast */
/** "O da esquerda" — buzz-cut agent (catraca). Same 4 chasers as part A. */
export const AG_LEFT: Outfit = AGENT_OUTFITS.agentA;
/** "O de azul" — the scared one (part A's blue-suit agent). */
export const AG_BLUE: Outfit = AGENT_BLUE_OUTFIT;
/** "O careca" — trips. */
export const AG_BALD: Outfit = AGENT_OUTFITS.agentB;
/** O chefe: Rocha-like bald boss, clean-shaven, no sunglasses (we need to see the frozen botox face). */
export const CHEFE: Outfit = {
  ...AGENT_OUTFITS.rocha,
  skin: {base: '#e0ab86', shade: '#b07a58', light: '#f8d2b4'},
  top: {base: '#24262d', shade: '#121318', light: '#474a55'},
  legs: {base: '#1f2127', shade: '#101115', light: '#3c3f48'},
  head: {hair: 'bald', hairColor: '#3a2a22', beard: false, sunglasses: false},
};

const SK: Tone[] = [
  {base: '#e2b08c', shade: '#b07e5c', light: '#f5cfb0'},
  {base: '#8a5536', shade: '#5f361f', light: '#ad7451'},
  {base: '#c99068', shade: '#9a6343', light: '#e0b08a'},
  {base: '#f0c9a8', shade: '#c4987a', light: '#fde2cb'},
  {base: '#5e3a28', shade: '#3e2418', light: '#7d5039'},
];
const T = (base: string, shade: string, light: string): Tone => ({base, shade, light});
const TOPS = [T('#3d8a6b', '#26604a', '#5fb08f'), T('#b8483e', '#82302a', '#d96d62'), T('#5b5f9e', '#3c3f70', '#7f84c4'), T('#d9d4c8', '#a8a294', '#f4f0e6'), T('#2f3440', '#1b1e26', '#4c5262'), T('#c77fa0', '#94546f', '#e3a6c1'), T('#7a8c3a', '#556326', '#9cb05a')];
const LEGS = [T('#2b3a55', '#1a2438', '#455a80'), T('#3a3a40', '#222226', '#5a5a62'), T('#6b5a44', '#4a3d2e', '#8c7a60')];
const HAIRS = ['#24170f', '#3a2a22', '#6b4a2a', '#111', '#8b8a8c', '#a8562a'];

/** Generic commuters (deterministic by index). */
export const commuter = (i: number): Outfit => {
  const r = (k: string) => random(`cm${i}${k}`);
  const fem = r('f') < 0.4;
  const skin = SK[Math.floor(r('s') * SK.length)];
  const top = TOPS[Math.floor(r('t') * TOPS.length)];
  if (fem)
    return {
      skin,
      torso: 'dress',
      top,
      legs: skin,
      shoes: 'heels',
      shoeColor: T('#222', '#000', '#555'),
      gloves: false,
      head: {hair: 'curlyBun', hairColor: HAIRS[Math.floor(r('h') * HAIRS.length)], lashes: true, browWidth: 12},
      armW: 52,
      legW: 56,
    };
  const suit = r('k') < 0.35;
  return {
    skin,
    torso: suit ? 'suit' : 'hoodie',
    top,
    legs: LEGS[Math.floor(r('l') * LEGS.length)],
    shoes: suit ? 'dress' : 'sneaker',
    shoeColor: suit ? T('#16161a', '#050506', '#5d5f66') : T('#eee', '#bbb', '#fff'),
    gloves: false,
    head: {hair: (['quiff', 'buzz', 'bald'] as const)[Math.floor(r('hs') * 3)], hairColor: HAIRS[Math.floor(r('h') * HAIRS.length)], beard: r('b') < 0.25},
  };
};

/* ------------------------------------------------------------------ poses */
/** Sprint cycle. */
export const run = (t: number, ph = 0, amp = 1): Pose => {
  const s = Math.sin(t * 15 + ph);
  return {
    lean: 10 * amp,
    hipL: s * 38 * amp,
    hipR: -s * 38 * amp,
    knL: (Math.max(0, -s) * 70 + 10) * amp,
    knR: (Math.max(0, s) * 70 + 10) * amp,
    shL: -s * 45 * amp,
    elL: 70 * amp,
    shR: s * 45 * amp,
    elR: -70 * amp,
    bob: -Math.abs(s) * 26 * amp,
  };
};
export const walkP = (t: number, ph = 0, amp = 1): Pose => {
  const s = Math.sin(t * 9 + ph);
  return {hipL: s * 16 * amp, hipR: -s * 16 * amp, knL: Math.max(0, -s) * 20 * amp, knR: Math.max(0, s) * 20 * amp, shL: -8 - s * 12 * amp, elL: 10, shR: 8 + s * 12 * amp, elR: -10, bob: -Math.abs(s) * 10 * amp};
};

/** Puppet with feet at (x,y), optional rotation (deg) around a pivot given in puppet units from the feet (default: feet). */
export const Pup: React.FC<
  PuppetProps & {x: number; y: number; height: number; flip?: boolean; rot?: number; pivotY?: number; blur?: number; children?: React.ReactNode; opacity?: number}
> = ({x, y, height, rot = 0, pivotY = 0, blur, opacity, ...rest}) => {
  const k = height / 1000;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `rotate(${rot}deg)`, transformOrigin: `${x}px ${y + pivotY * k}px`, opacity}}>
      <PuppetSvg height={height} {...rest} style={{left: x - 350 * k, top: y - 1100 * k, filter: blur ? `blur(${blur}px)` : undefined}} />
    </div>
  );
};

/* ------------------------------------------------------------------ fx */
/** Sweat drops flying off a head at (x,y) px. */
export const Sweat: React.FC<{x: number; y: number; t: number; s?: number; n?: number; k?: number}> = ({x, y, t, s = 1, n = 5, k = 1}) => {
  if (k <= 0) return null;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: k}} width={1} height={1}>
      {Array.from({length: n}).map((_, i) => {
        const ph = (t * 1.6 + i / n) % 1;
        const ang = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.4;
        const d = (40 + ph * 120) * s;
        const cx = x + Math.cos(ang) * d;
        const cy = y + Math.sin(ang) * d + ph * ph * 90 * s;
        return <path key={i} d={`M${cx},${cy - 14 * s} Q${cx + 9 * s},${cy + 2 * s} ${cx},${cy + 8 * s} Q${cx - 9 * s},${cy + 2 * s} ${cx},${cy - 14 * s} Z`} fill="#bfe9ff" stroke="#3a7fb0" strokeWidth={2 * s} opacity={1 - ph} />;
      })}
    </svg>
  );
};

/** Digital glitch: RGB-split bars + scanlines. k 0..1. */
export const Glitch: React.FC<{k: number; frame: number; color?: string}> = ({k, frame, color = '255,59,59'}) => {
  if (k <= 0.01) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 6px)', opacity: k}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 9}).map((_, i) => {
          const r = (q: string) => random(`gl${Math.floor(frame / 2)}-${i}-${q}`);
          if (r('on') > k) return null;
          return <rect key={i} x={(r('x') - 0.5) * 200} y={r('y') * 1920} width={1080 + 200} height={6 + r('h') * 40} fill={i % 2 ? `rgba(${color},0.35)` : 'rgba(80,220,255,0.28)'} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Small HUD caption chip (non-reading labels, e.g. "PORTA 1,0 s"). */
export const Chip: React.FC<{x: number; y: number; text: string; k: number; color?: string; size?: number; align?: 'left' | 'center' | 'right'}> = ({x, y, text, k, color = '#ffd23a', size = 44, align = 'center'}) => {
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'left' ? 0 : align === 'right' ? -100 : -50}%,-50%) scale(${lerp(0.6, 1, clamp(k))})`,
        opacity: clamp(k * 1.5),
        padding: '6px 18px 8px',
        borderRadius: 12,
        background: 'rgba(10,14,30,0.75)',
        border: `3px solid ${color}`,
        color,
        fontFamily: HUD_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 3,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** Yellow "energy lines" — Davi's power in use (Kaiser style). Radiating dashes around (x,y). */
export const EnergyLines: React.FC<{x: number; y: number; r: number; t: number; k: number; color?: string}> = ({x, y, r, t, k, color = '#ffd23a'}) => {
  if (k <= 0.01) return null;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: k}} width={1} height={1}>
      {Array.from({length: 14}).map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + t * 0.6;
        const ph = (t * 2.2 + i * 0.37) % 1;
        const r1 = r * (1 + ph * 0.6);
        const r2 = r1 + r * 0.22;
        return <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * r2} y2={y + Math.sin(a) * r2} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={1 - ph} />;
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ seated Davi (front view) */
/** Davi sitting facing camera: waist at (x, seatY), legs forward to the floor at floorY. h = puppet height px. */
export const SeatedDavi: React.FC<Omit<PuppetProps, 'outfit'> & {x: number; seatY: number; floorY: number; h: number; spread?: number; legsUp?: number}> = ({x, seatY, floorY, h, spread = 0, legsUp = 0, ...rest}) => {
  const k = h / 1000;
  const L = DAVI_OUTFIT.legs;
  const S = DAVI_OUTFIT.shoeColor;
  const knY = seatY + 60 * k;
  const footY = lerp(floorY, seatY + 40 * k, legsUp);
  const leg = (side: -1 | 1) => {
    const hx = x + side * (62 + spread * 20) * k;
    const kx = x + side * (80 + spread * 50) * k;
    return (
      <g key={side}>
        <path d={`M ${kx - 40 * k},${knY} L ${kx - 36 * k},${footY - 30 * k} L ${kx + 36 * k},${footY - 30 * k} L ${kx + 40 * k},${knY} Z`} fill={L.shade} />
        <ellipse cx={(hx + kx) / 2} cy={seatY + 20 * k} rx={64 * k} ry={58 * k} fill={L.base} />
        <ellipse cx={kx} cy={knY} rx={52 * k} ry={40 * k} fill={L.base} />
        <ellipse cx={kx - side * 12 * k} cy={knY - 14 * k} rx={22 * k} ry={12 * k} fill={L.light} opacity={0.5} />
        <ellipse cx={kx} cy={footY - 16 * k} rx={58 * k} ry={34 * k} fill={S.base} />
        <ellipse cx={kx} cy={footY - 4 * k} rx={60 * k} ry={16 * k} fill="#f4efe6" />
        <ellipse cx={kx} cy={footY - 34 * k} rx={30 * k} ry={10 * k} fill={S.light} opacity={0.7} />
      </g>
    );
  };
  return (
    <>
      <PuppetSvg outfit={DAVI_OUTFIT} height={h} upperOnly {...rest} style={{left: x - 350 * k, top: seatY + 480 * k - 1100 * k}} />
      <Svg>
        {leg(-1)}
        {leg(1)}
      </Svg>
    </>
  );
};

/** Index finger sticking out of a mitten hand (pass as handProps; `angle` = shoulder+elbow angle of that arm). */
export const Finger: React.FC<{angle: number; tone?: Tone}> = ({angle, tone = DAVI_OUTFIT.skin}) => (
  <g transform={`rotate(${-angle})`}>
    <rect x={-9} y={30} width={20} height={76} rx={10} fill={tone.base} stroke={tone.shade} strokeWidth={3} />
    <ellipse cx={1} cy={96} rx={6} ry={5} fill={tone.light} opacity={0.8} />
  </g>
);

/** Screen position of a placed puppet's head centre and radius. */
export const headOf = (x: number, y: number, h: number, bob = 0) => ({x, y: y + (-884 + bob) * (h / 1000), r: 122 * (h / 1000)});
