import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {PARTS, f, wordAt} from '../timeline';
import {clamp, kf, lerp, shake} from '../../lib/anim';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';

/* ------------------------------------------------------------------ cut list (absolute seconds, on word starts) */

const w = wordAt;
/** [id, absolute start (s)] — each shot runs until the next one starts. */
export const CUT_DEFS: [string, number][] = [
  ['b01_ready', w('L9', 0)], // Então ele faz
  ['b02_montage', w('L9', 3)], // trinta saltos em dois segundos (30 jumps, 2 frames each)
  ['b03_kitchen', w('L9', 8)], // Cozinha
  ['b04_roof', w('L9', 9)], // telhado
  ['b05_balcony', w('L9', 10)], // varanda
  ['b06_wc', w('L9', 11)], // banheiro
  ['b07_mics', w('L9', 12)], // Os microfones
  ['b08_erro', w('L9', 14)], // enlouquecem
  ['b09_table', w('L10', 0)], // No trigésimo primeiro,
  ['b10_hands', w('L10', 3)], // ele segura a mão da Lia
  ['b11_globe', w('L11', 0)], // E pra perto é seguro: a
  ['b12_twopts', w('L11', 6)], // dois quilômetros, o
  ['b13_arrows', w('L11', 9)], // chão muda só meio
  ['b14_delta', w('L11', 13)], // quilômetro por hora.
  ['b15_step', w('L11', 16)], // Um passinho.
  ['b16_where', w('L12', 0)], // Pra onde?
  ['b17_photos', w('L12', 2)], // Um lugar que não tava em foto
  ['b18_none', w('L12', 9)], // nenhuma: o
  ['b19_memory', w('L12', 11)], // iate que ele acabou de ver,
  ['b20_pov', w('L12', 17)], // da mesa.
  ['b21_arrive', w('L13', 0)], // Eles aparecem no deck.
  ['b22_air', w('L13', 4)], // Setenta litros de
  ['b23_gust', w('L13', 7)], // ar empurrados.
  ['b24_captain', w('L13', 9)], // O chapéu do capitão
  ['b25_hatfly', w('L13', 13)], // voou longe.
  ['b26_look', w('L14', 0)], // A Lia olha pra ele:
  ['b27_lia', w('L14', 5)], // tu vai ter que me explicar
  ['b28_coisa', w('L14', 11)], // muita coisa.
  ['b29_davi', w('L14', 13)], // Ele:
  ['b30_shrug', w('L14', 14)], // depende do dia.
  ['b31_terrace', w('L15', 0)], // Lá no terraço,
  ['b32_glasses', w('L15', 3)], // os trinta estalos
  ['b33_shatter', w('L15', 6)], // estouraram todas as taças.
  ['b34_bill', w('L15', 10)], // E a conta ficou pro
  ['b35_rocha', w('L15', 15)], // Rocha.
  ['b36_black', 76.8], // hard cut to black
];

export const PART_FROM = f(PARTS.B.start);
export const PART_LEN = f(PARTS.B.end) - PART_FROM;

export const CUTS = CUT_DEFS.map(([id, s], i) => {
  const from = f(s) - PART_FROM;
  const next = CUT_DEFS[i + 1];
  const to = next ? f(next[1]) - PART_FROM : PART_LEN;
  return {id, abs: s, from, dur: to - from};
});
export const cut = (id: string) => CUTS.find((c) => c.id === id)!;
/** Shot-local frame of an absolute narration word. */
export const wl = (shotId: string, line: string, n: number) => f(wordAt(line, n)) - PART_FROM - cut(shotId).from;
/** Shot-local frame of an absolute time. */
export const al = (shotId: string, s: number) => f(s) - PART_FROM - cut(shotId).from;

export const useShot = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return {frame, fps, dur: durationInFrames, t: frame / fps, p: clamp(frame / Math.max(1, durationInFrames - 1))};
};

/* ------------------------------------------------------------------ camera rig (copied from ep02/partC/kit) */

export type Whip = 'left' | 'right' | 'up' | 'down' | 'zoom';

export const Rig: React.FC<{
  children: React.ReactNode;
  s0?: number;
  s1?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  r0?: number;
  r1?: number;
  ox?: number;
  oy?: number;
  ease?: (t: number) => number;
  whipIn?: Whip;
  whipOut?: Whip;
  impacts?: {at: number; amp: number; dur?: number; zoom?: number}[];
}> = ({children, s0 = 1, s1 = 1.1, x0 = 0, x1 = 0, y0 = 0, y1 = 0, r0 = 0, r1 = 0, ox = 540, oy = 960, ease, whipIn, whipOut, impacts = []}) => {
  const {frame, dur, p} = useShot();
  const e = ease ? ease(p) : 1 - Math.pow(1 - p, 1.6);
  let s = s0 + (s1 - s0) * e;
  let x = x0 + (x1 - x0) * e;
  let y = y0 + (y1 - y0) * e;
  let r = r0 + (r1 - r0) * e;
  let blur = 0;
  for (const [i, im] of impacts.entries()) {
    const sh = shake(frame, im.at, im.dur ?? 12, im.amp, i + 3);
    x += sh.x;
    y += sh.y;
    r += sh.r * 57;
    if (im.zoom) s *= 1 + kf(frame, [im.at, im.at + 2, im.at + 10], [0, im.zoom, im.zoom * 0.4]);
  }
  const whip = (wh: Whip, k: number) => {
    const d = 240 * k * k;
    if (wh === 'left') x -= d;
    if (wh === 'right') x += d;
    if (wh === 'up') y -= d;
    if (wh === 'down') y += d;
    s *= 1 + (wh === 'zoom' ? 0.6 : 0.5) * k * k;
    blur = Math.max(blur, 26 * k);
  };
  if (whipIn) whip(whipIn, clamp(1 - frame / 5));
  if (whipOut) whip(whipOut, clamp((frame - (dur - 4)) / 4));
  const rr = (Math.abs(r) * Math.PI) / 180;
  s *= Math.cos(rr) + (1920 / 1080) * Math.sin(rr);
  s *= 1 + Math.min(0.3, Math.max(0, Math.abs(x) - (s - 1) * 540) / 540) + Math.min(0.2, Math.max(0, Math.abs(y) - (s - 1) * 960) / 960);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
          transformOrigin: `${ox}px ${oy}px`,
          filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Full-screen svg layer. */
export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/* ------------------------------------------------------------------ HUD bits */

/** Rounded HUD chip (series style). `k` 0..1 pop-in. */
export const Chip: React.FC<{x: number; y: number; text: React.ReactNode; k: number; color?: string; size?: number; align?: 'left' | 'center' | 'right'; rot?: number; bg?: string; fg?: string}> = ({
  x,
  y,
  text,
  k,
  color = '#ffd23f',
  size = 52,
  align = 'center',
  rot = 0,
  bg = 'rgba(8,14,32,0.86)',
  fg = '#fff',
}) => {
  if (k <= 0) return null;
  const s = lerp(0.4, 1, clamp(k)) * (1 + 0.12 * Math.sin(clamp(k) * Math.PI));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'left' ? 0 : align === 'right' ? -100 : -50}%,-50%) rotate(${rot}deg) scale(${s})`,
        transformOrigin: align === 'left' ? 'left center' : align === 'right' ? 'right center' : 'center',
        opacity: clamp(k * 2),
        padding: `${size * 0.26}px ${size * 0.55}px`,
        borderRadius: size * 0.42,
        background: bg,
        border: `${Math.max(3, size * 0.07)}px solid ${color}`,
        boxShadow: `0 0 ${size * 0.6}px ${color}66, 0 8px 22px rgba(0,0,0,0.45)`,
        color: fg,
        fontFamily: HUD_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: size * 0.04,
        lineHeight: 1.05,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** Rubber stamp slam (scale 2.4 -> 1). */
export const Stamp: React.FC<{x: number; y: number; text: string; sub?: string; color?: string; k: number; rot?: number; size?: number}> = ({x, y, text, sub, color = '#e8322f', k, rot = -8, size = 92}) => {
  if (k <= 0) return null;
  const s = lerp(2.4, 1, clamp(k));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: clamp(k * 3),
        border: `${size * 0.1}px solid ${color}`,
        borderRadius: size * 0.25,
        padding: `${size * 0.12}px ${size * 0.35}px ${size * 0.06}px`,
        color,
        fontFamily: CAPTION_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 4,
        lineHeight: 1,
        textAlign: 'center',
        background: 'rgba(255,250,240,0.88)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      {sub && <div style={{fontFamily: HUD_FONT, fontSize: size * 0.36, letterSpacing: 6, marginTop: 4}}>{sub}</div>}
    </div>
  );
};

/** Big place label for the jump montage (yellow block caps, tilted). */
export const PlaceTag: React.FC<{text: string; k: number; x?: number; y?: number; rot?: number; color?: string}> = ({text, k, x = 540, y = 1180, rot = -6, color = '#ffd23f'}) => {
  if (k <= 0) return null;
  const s = lerp(1.8, 1, clamp(k));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: clamp(k * 3),
        padding: '8px 34px 4px',
        background: color,
        color: '#10131f',
        fontFamily: CAPTION_FONT,
        fontWeight: 700,
        fontSize: 96,
        letterSpacing: 6,
        lineHeight: 1,
        boxShadow: '10px 10px 0 #10131f',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** Digital glitch: RGB-split copies + horizontal slice offsets. `k` 0..1 strength. */
export const Glitch: React.FC<{children: React.ReactNode; k: number; frame: number; seed?: string}> = ({children, k, frame, seed = 'gl'}) => {
  if (k <= 0.01) return <AbsoluteFill>{children}</AbsoluteFill>;
  const off = 26 * k;
  const slices = Array.from({length: 7}).map((_, i) => {
    const r = (n: string) => random(`${seed}-${i}-${n}-${Math.floor(frame / 2)}`);
    const y0 = r('y') * 1920;
    return {y0, h: 30 + r('h') * 160, dx: (r('x') - 0.5) * 220 * k};
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${-off}px,0)`, mixBlendMode: 'screen', opacity: 0.45 * k, filter: 'sepia(1) hue-rotate(-50deg) saturate(6)'}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${off}px,0)`, mixBlendMode: 'screen', opacity: 0.45 * k, filter: 'sepia(1) hue-rotate(160deg) saturate(6)'}}>{children}</AbsoluteFill>
      {slices.map((s, i) => (
        <AbsoluteFill key={i} style={{clipPath: `inset(${s.y0}px 0 ${Math.max(0, 1920 - s.y0 - s.h)}px 0)`, transform: `translate(${s.dx}px,0)`}}>
          {children}
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{background: `repeating-linear-gradient(0deg, rgba(0,0,0,${0.25 * k}) 0px, rgba(0,0,0,${0.25 * k}) 2px, transparent 2px, transparent 6px)`}} />
    </AbsoluteFill>
  );
};

/** Slow-motion grade: cooler, softer, with letterbox-ish edge blur. */
export const SlowMoGrade: React.FC<{k?: number}> = ({k = 1}) => (
  <>
    <AbsoluteFill style={{background: `rgba(40,70,140,${0.16 * k})`, mixBlendMode: 'soft-light', pointerEvents: 'none'}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(5,10,30,${0.6 * k}) 100%)`, pointerEvents: 'none'}} />
  </>
);
