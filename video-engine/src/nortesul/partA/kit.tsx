import React from 'react';
import {AbsoluteFill, Easing, random} from 'remotion';
import {H, W} from '../../lib/constants';
import {clamp, easeOut, kf, lerp, wobble} from '../../lib/anim';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {PlacedPuppet} from '../../characters/Puppet';
import type {Lighting, Outfit, Pose, Expression, Tone} from '../../characters/types';
import {f, wordAt, PARTS} from '../timeline';

export {Chip, Stamp, HudTag} from '../../ep02qi/partA/kit';
export {Cam2D} from '../../ep01/partA/kit';
export {HudLabel} from '../../ui/HudLabel';
export {W, H, clamp, easeOut, kf, lerp, wobble, CAPTION_FONT, HUD_FONT};

/** Part A starts at absolute 0 → part-local frame = absolute frame. */
export const ABS0 = f(PARTS.A.start);
export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word start. */
export const ev = (p: ShotP, id: string, n: number) => f(wordAt(id, n)) - p.from;
export const smooth = Easing.inOut(Easing.cubic);
export const sine = Easing.inOut(Easing.sin);

export const DAY: Lighting = {side: -1, rim: '#fff2c4', rimStrength: 0.75, shadeStrength: 0.45};
export const BLUE = '#0b4f8a';
export const AQUA = '#4fc3f7';
export const SALT = '#1f4e8c';
export const YEL = '#ffd23a';
export const RED = '#ff5a4d';

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/** Soft studio backdrop for the presenter (NorteSul blues, drifting bokeh drops). */
export const Studio: React.FC<{t: number; px?: number}> = ({t, px = 0}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 60% at 50% 40%, #e9f6ff 0%, #bfe1f7 55%, #8cc3e8 100%)', overflow: 'hidden'}}>
    <Svg>
      <g transform={`translate(${px},0)`}>
        {Array.from({length: 14}).map((_, i) => {
          const x = random(`bx${i}`) * 1300 - 110;
          const y = (random(`by${i}`) * 2100 - t * (14 + random(`bs${i}`) * 20) + 4000) % 2100 - 90;
          const r = 30 + random(`br${i}`) * 70;
          return <Drop key={i} x={x} y={y} s={r} fill="#ffffff" opacity={0.18 + random(`bo${i}`) * 0.18} />;
        })}
        {/* floor glow */}
        <ellipse cx={540} cy={1880} rx={760} ry={220} fill="#ffffff" opacity={0.35} />
      </g>
    </Svg>
  </AbsoluteFill>
);

/** Water drop shape centred at x,y (s = height). */
export const Drop: React.FC<{x: number; y: number; s: number; fill?: string; opacity?: number; stroke?: string}> = ({x, y, s, fill = AQUA, opacity = 1, stroke}) => {
  const w = s * 0.36;
  return (
    <path
      d={`M${x},${y - s / 2} C${x + w * 0.4},${y - s * 0.15} ${x + w},${y + s * 0.05} ${x + w},${y + s * 0.2} A${w},${w} 0 1 1 ${x - w},${y + s * 0.2} C${x - w},${y + s * 0.05} ${x - w * 0.4},${y - s * 0.15} ${x},${y - s / 2} Z`}
      fill={fill}
      opacity={opacity}
      stroke={stroke}
      strokeWidth={stroke ? s * 0.04 : 0}
    />
  );
};

/** Civilian outfits (hoodies / tees in varied colours). */
const SKINS: Tone[] = [
  {base: '#c98b5f', shade: '#9a6440', light: '#e0a77e'},
  {base: '#8a5536', shade: '#603823', light: '#a87252'},
  {base: '#e8c09a', shade: '#c09370', light: '#f6d6b6'},
  {base: '#5e3a26', shade: '#3e2416', light: '#7c5440'},
  {base: '#b07850', shade: '#80522f', light: '#cc9670'},
];
const TOPS: Tone[] = [
  {base: '#5aa0d8', shade: '#3a76a8', light: '#86c0ec'},
  {base: '#d8604e', shade: '#a64030', light: '#ee8a7a'},
  {base: '#6bb38a', shade: '#468a64', light: '#94d4ae'},
  {base: '#9a7cc8', shade: '#6e559a', light: '#bba2e2'},
  {base: '#ececec', shade: '#bdbdbd', light: '#ffffff'},
  {base: '#3f4a63', shade: '#283146', light: '#5c6985'},
];
const LEGS: Tone[] = [
  {base: '#3f5f93', shade: '#283f66', light: '#6283b8'},
  {base: '#4a4a52', shade: '#2e2e34', light: '#6a6a74'},
  {base: '#8a7356', shade: '#64523c', light: '#a99272'},
];
const HAIRS = ['buzz', 'curlyBun', 'quiff', 'bald', 'curlyBun', 'buzz'] as const;
export const civOutfit = (seed: number): Outfit => {
  const r = (k: number) => random(`civ${seed}-${k}`);
  const hair = HAIRS[Math.floor(r(1) * HAIRS.length)];
  return {
    skin: SKINS[Math.floor(r(2) * SKINS.length)],
    torso: 'hoodie',
    top: TOPS[Math.floor(r(3) * TOPS.length)],
    legs: LEGS[Math.floor(r(4) * LEGS.length)],
    shoes: 'sneaker',
    shoeColor: {base: '#f2f2f2', shade: '#c7c7c7', light: '#fff'},
    gloves: false,
    head: {hair, hairColor: ['#1e130d', '#3a2416', '#6b4a2a', '#2b1810'][Math.floor(r(5) * 4)], lashes: hair === 'curlyBun'},
  };
};
export const Civ: React.FC<{seed: number; x: number; y: number; height: number; pose?: Pose; expr?: Expression; flip?: boolean; blur?: number; bucket?: boolean}> = ({seed, bucket, ...p}) => (
  <PlacedPuppet outfit={civOutfit(seed)} light={DAY} {...p} handProps={bucket ? {R: <BucketProp />} : undefined} />
);
/** Bucket hanging from a hand (puppet units, origin at the wrist). */
const BucketProp: React.FC = () => (
  <g transform="translate(0,40)">
    <path d="M-48,0 Q0,-60 48,0" fill="none" stroke="#555" strokeWidth={6} />
    <path d="M-55,0 L55,0 L44,110 L-44,110 Z" fill="#3da5d9" stroke="#21709a" strokeWidth={6} />
    <rect x={-58} y={-6} width={116} height={14} rx={6} fill="#5cc0ee" />
  </g>
);

/** Bucket (screen px). fill 0..1, tilt deg. */
export const Bucket: React.FC<{x: number; y: number; s: number; fill?: number; tilt?: number; color?: string; opacity?: number}> = ({x, y, s, fill = 1, tilt = 0, color = '#f0a030', opacity = 1}) => {
  const k = s / 100;
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${k})`} opacity={opacity}>
      <ellipse cx={0} cy={58} rx={46} ry={8} fill="#000" opacity={0.18} />
      <path d="M-50,-50 L50,-50 L40,55 L-40,55 Z" fill={color} />
      <path d="M10,-50 L50,-50 L40,55 L14,55 Z" fill="#000" opacity={0.12} />
      <clipPath id={`bk${Math.round(x)}${Math.round(y)}`}>
        <path d="M-48,-48 L48,-48 L39,53 L-39,53 Z" />
      </clipPath>
      {fill > 0 && <rect x={-50} y={53 - 100 * fill} width={100} height={100 * fill} fill={AQUA} opacity={0.9} clipPath={`url(#bk${Math.round(x)}${Math.round(y)})`} />}
      <ellipse cx={0} cy={-50} rx={52} ry={10} fill="#ffcf80" stroke={color} strokeWidth={5} />
      {fill > 0 && <ellipse cx={0} cy={-50 + (1 - fill) * 98} rx={50 - (1 - fill) * 10} ry={8} fill="#8fdcff" />}
      <path d="M-50,-50 Q0,-120 50,-50" fill="none" stroke="#6b6b6b" strokeWidth={5} />
    </g>
  );
};

/** Plastic water bottle (screen px, s = height). */
export const Bottle: React.FC<{x: number; y: number; s: number; color: string; glow?: number; cap?: string}> = ({x, y, s, color, glow = 0, cap = '#e8eef5'}) => {
  const k = s / 100;
  return (
    <g transform={`translate(${x},${y}) scale(${k})`}>
      {glow > 0 && <ellipse cx={0} cy={0} rx={40} ry={62} fill="#9fe6ff" opacity={0.55 * glow} />}
      <rect x={-8} y={-50} width={16} height={9} rx={2} fill={cap} />
      <path d="M-8,-41 L8,-41 L10,-34 Q22,-26 22,-14 L22,44 Q22,50 16,50 L-16,50 Q-22,50 -22,44 L-22,-14 Q-22,-26 -10,-34 Z" fill={color} />
      <rect x={-22} y={0} width={44} height={16} fill="#fff" opacity={0.28} />
      <path d="M-15,-20 L-15,40" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.35} />
    </g>
  );
};

/** Rainforest tree (screen px). s = height. `gone` 0..1 shrinks canopy into a stump. */
export const Tree: React.FC<{x: number; y: number; s: number; seed?: number; gone?: number; sway?: number; tone?: number}> = ({x, y, s, seed = 0, gone = 0, sway = 0, tone = 0}) => {
  const k = s / 100;
  const g = clamp(1 - gone);
  const greens = [['#2f8f4e', '#1f6b39', '#4fb36a'], ['#3a9a55', '#24733d', '#5cc07a'], ['#2a7f48', '#195c33', '#43a463']][(seed + tone) % 3];
  return (
    <g transform={`translate(${x},${y}) scale(${k})`}>
      <ellipse cx={0} cy={2} rx={22} ry={4} fill="#000" opacity={0.2} />
      {/* stump / trunk */}
      <path d={`M-6,0 L-4,${-lerp(12, 62, g)} L4,${-lerp(12, 62, g)} L6,0 Z`} fill="#7a5236" />
      {g < 1 && g >= 0 && <ellipse cx={0} cy={-lerp(12, 62, g)} rx={5} ry={2} fill="#c9a06a" />}
      {g > 0.01 && (
        <g transform={`translate(${sway},${-60}) scale(${g})`}>
          <circle cx={-16} cy={-6} r={20} fill={greens[1]} />
          <circle cx={16} cy={-8} r={20} fill={greens[1]} />
          <circle cx={0} cy={-22} r={24} fill={greens[0]} />
          <circle cx={-10} cy={-28} r={12} fill={greens[2]} opacity={0.8} />
          <circle cx={-22} cy={-14} r={8} fill={greens[2]} opacity={0.7} />
        </g>
      )}
    </g>
  );
};

/** Puffy cloud (screen px), s = width. */
export const Cloud: React.FC<{x: number; y: number; s: number; opacity?: number; fill?: string; rain?: number; t?: number}> = ({x, y, s, opacity = 1, fill = '#ffffff', rain = 0, t = 0}) => {
  const k = s / 200;
  return (
    <g transform={`translate(${x},${y}) scale(${k})`} opacity={opacity}>
      {rain > 0 &&
        Array.from({length: 9}).map((_, i) => {
          const ph = ((t * 2.2 + i * 0.37) % 1 + 1) % 1;
          return <line key={i} x1={-70 + i * 17} y1={30 + ph * 90} x2={-74 + i * 17} y2={48 + ph * 90} stroke="#7cc8f2" strokeWidth={5} strokeLinecap="round" opacity={rain * (1 - ph)} />;
        })}
      <ellipse cx={0} cy={22} rx={98} ry={26} fill="#000" opacity={0.08} />
      <circle cx={-55} cy={0} r={38} fill={fill} />
      <circle cx={-10} cy={-22} r={52} fill={fill} />
      <circle cx={45} cy={-6} r={42} fill={fill} />
      <rect x={-92} y={0} width={180} height={36} rx={18} fill={fill} />
      <circle cx={-18} cy={-36} r={22} fill="#fff" opacity={0.5} />
    </g>
  );
};

/** Dry cracked earth filling a rect (deterministic Voronoi-ish crack net). */
export const Cracks: React.FC<{x: number; y: number; w: number; h: number; seed?: string; k?: number; color?: string; width?: number; cell?: number}> = ({x, y, w, h, seed = 'c', k = 1, color = '#7a5232', width = 5, cell = 120}) => {
  const cols = Math.ceil(w / cell) + 1;
  const rows = Math.ceil(h / cell) + 1;
  const pt = (i: number, j: number): [number, number] => [x + i * cell + (random(`${seed}x${i}-${j}`) - 0.5) * cell * 0.7, y + j * cell + (random(`${seed}y${i}-${j}`) - 0.5) * cell * 0.7];
  const segs: string[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const a = pt(i, j);
      if (i + 1 < cols && random(`${seed}h${i}${j}`) > 0.12) {
        const b = pt(i + 1, j);
        const m = [(a[0] + b[0]) / 2 + (random(`${seed}m${i}${j}`) - 0.5) * 20, (a[1] + b[1]) / 2 + (random(`${seed}n${i}${j}`) - 0.5) * 20];
        segs.push(`M${a[0]},${a[1]} L${m[0]},${m[1]} L${a[0] + (b[0] - a[0]) * k},${a[1] + (b[1] - a[1]) * k}`);
      }
      if (j + 1 < rows && random(`${seed}v${i}${j}`) > 0.12) {
        const b = pt(i, j + 1);
        segs.push(`M${a[0]},${a[1]} L${a[0] + (b[0] - a[0]) * k},${a[1] + (b[1] - a[1]) * k}`);
      }
    }
  return <path d={segs.join(' ')} stroke={color} strokeWidth={width} fill="none" strokeLinejoin="round" strokeLinecap="round" />;
};

/** Coarse Brazil outline [lon, lat]. */
export const BRAZIL: [number, number][] = [
  [-73.9, -7.4], [-72.8, -5.1], [-70.0, -4.2], [-69.4, -1.0], [-70.0, 1.5], [-67.0, 2.0], [-64.0, 4.0], [-60.7, 5.2], [-59.8, 4.0], [-58.0, 1.5], [-55.0, 2.3], [-52.0, 2.2], [-51.6, 4.4], [-50.0, 1.8], [-49.9, 0.0], [-48.5, -1.2], [-44.5, -2.5], [-41.5, -2.9], [-38.5, -3.7], [-35.2, -5.4], [-34.8, -7.5], [-35.3, -9.5], [-37.3, -11.5], [-38.6, -13.0], [-39.0, -15.0], [-39.2, -17.8], [-40.0, -20.0], [-41.0, -22.0], [-42.5, -23.0], [-44.6, -23.3], [-46.5, -24.1], [-48.5, -26.0], [-48.6, -28.5], [-50.0, -30.0], [-51.5, -31.5], [-53.4, -33.7], [-53.6, -32.5], [-55.6, -30.9], [-57.6, -30.2], [-56.0, -28.0], [-54.6, -25.6], [-54.2, -24.0], [-55.4, -24.0], [-55.8, -22.3], [-57.9, -22.0], [-58.0, -20.0], [-58.2, -17.4], [-60.2, -16.2], [-60.4, -13.5], [-62.2, -13.0], [-64.4, -12.5], [-65.4, -11.0], [-66.6, -9.9], [-68.6, -11.1], [-70.5, -11.0], [-70.6, -9.5], [-72.2, -10.0], [-73.1, -9.3],
];
export const SALVADOR = {lat: -12.97, lon: -38.5};
export const SAO_PAULO = {lat: -23.55, lon: -46.63};

/** Flat map projection of Brazil into a screen box (equirectangular, cos-corrected). */
export const mapXY = (lon: number, lat: number, box: {x: number; y: number; w: number}) => {
  const sx = box.w / 40; // 40° of longitude span (-74..-34)
  return {x: box.x + (lon + 74) * sx, y: box.y + (5.5 - lat) * sx};
};
export const brazilPath = (box: {x: number; y: number; w: number}) =>
  BRAZIL.map(([lo, la], i) => {
    const p = mapXY(lo, la, box);
    return `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ') + ' Z';

/** Presenter's board (whiteboard on a stand) with title, step pill and content slot. */
export const Board: React.FC<{x: number; y: number; w: number; h: number; title: string; step?: string; k: number; children?: React.ReactNode}> = ({x, y, w, h, title, step, k, children}) => {
  const s = lerp(0.85, 1, easeOut(clamp(k)));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${s})`, transformOrigin: '50% 100%', opacity: clamp(k * 2)}}>
      <div style={{position: 'absolute', inset: 0, background: '#ffffff', borderRadius: 26, border: '10px solid #d6dde6', boxShadow: '0 22px 40px rgba(10,40,80,0.28)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 64, color: BLUE, letterSpacing: 3}}>{title}</div>
      {step && (
        <div style={{position: 'absolute', right: 26, top: -30, background: YEL, color: '#141414', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 40, padding: '6px 22px', borderRadius: 40, boxShadow: '0 6px 14px rgba(0,0,0,0.25)'}}>{step}</div>
      )}
      <div style={{position: 'absolute', left: 30, right: 30, top: 130, bottom: 30}}>{children}</div>
    </div>
  );
};

/** Big centred number/label block for data moments. */
export const BigText: React.FC<{x: number; y: number; text: string; k: number; size?: number; color?: string; sub?: string}> = ({x, y, text, k, size = 150, color = '#fff', sub}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(0.7, 1, easeOut(clamp(k)))})`, opacity: clamp(k * 1.5), textAlign: 'center', color, fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: size, lineHeight: 1, textShadow: '0 6px 18px rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>
      {text}
      {sub && <div style={{fontFamily: HUD_FONT, fontSize: size * 0.24, letterSpacing: size * 0.04, marginTop: size * 0.08}}>{sub}</div>}
    </div>
  );

/** Heat shimmer lines. */
export const Heat: React.FC<{x: number; y: number; w: number; t: number; k?: number; n?: number}> = ({x, y, w, t, k = 1, n = 6}) => (
  <g opacity={0.45 * k}>
    {Array.from({length: n}).map((_, i) => {
      const xx = x + (i / (n - 1)) * w;
      const ph = ((t * 0.7 + i * 0.29) % 1 + 1) % 1;
      const yy = y - ph * 140;
      return <path key={i} d={`M${xx},${yy} q12,-18 0,-36 q-12,-18 0,-36`} stroke="#fff6d8" strokeWidth={5} fill="none" strokeLinecap="round" opacity={Math.sin(ph * Math.PI)} />;
    })}
  </g>
);

/** Vapor wisps rising from a point. */
export const Vapor: React.FC<{x: number; y: number; t: number; k: number; spread?: number; n?: number; rise?: number}> = ({x, y, t, k, spread = 120, n = 7, rise = 260}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const ph = ((t * 0.45 + i / n) % 1 + 1) % 1;
      const xx = x + (random(`vp${i}`) - 0.5) * spread + Math.sin(t * 2 + i) * 14;
      const yy = y - ph * rise;
      const r = 16 + ph * 34;
      return <circle key={i} cx={xx} cy={yy} r={r} fill="#ffffff" opacity={k * 0.55 * Math.sin(ph * Math.PI)} />;
    })}
  </g>
);

export const fadeIn = (fr: number, a: number, b: number) => kf(fr, [a, b], [0, 1], easeOut);
