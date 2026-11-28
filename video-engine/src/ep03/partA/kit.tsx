import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {f, wordAt} from '../timeline';
import {H, W} from '../../lib/constants';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import type {Lighting} from '../../characters/types';

export {Rig, BandSafe, SpeedLines, CutFlash, Finish, Stamp, HudTag, Chip, EnergyLines, SweatDrop, Stars, Steam, FreezeFx, LabBg, Smear, PredictArrow, Svg, runPose, walkPose} from '../../ep02qi/partA/kit';
export {W, H, clamp, easeOut, kf, lerp};

/** Part A starts at absolute 0, so part-local frame = absolute frame. */
export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word start (EP03 timing). */
export const ev = (p: ShotP, id: string, n: number) => f(wordAt(id, n)) - p.from;
/** Absolute seconds at shot-local frame. */
export const abs = (p: ShotP, fr: number) => (p.from + fr) / 30;

export const DAY_LIGHT: Lighting = {side: -1, rim: '#fff2c4', rimStrength: 0.8, shadeStrength: 0.45};
export const LAMP_LIGHT: Lighting = {side: 1, rim: '#ffc86a', rimStrength: 0.95, shadeStrength: 0.7};
export const ARENA_LIGHT: Lighting = {side: -1, rim: '#9fe0ff', rimStrength: 0.9, shadeStrength: 0.65};
export const STAGE_LIGHT: Lighting = {side: 1, rim: '#ffffff', rimStrength: 0.7, shadeStrength: 0.6};

const SvgL: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {children}
  </svg>
);

/* ------------------------------------------------------------------ Davi's room (night) */

/** Bedroom at night: wall, window with moon, poster, door (left), desk with lamp. `dayK` 0 night .. 1 day (window sky). */
export const DaviRoom: React.FC<{t: number; px?: number; deskY?: number; dayK?: number; lamp?: boolean; children?: React.ReactNode}> = ({
  t,
  px = 0,
  deskY = 1300,
  dayK = 0,
  lamp = true,
  children,
}) => {
  const sky = dayK > 0.5 ? `rgb(${lerp(40, 120, dayK)},${lerp(60, 190, dayK)},${lerp(110, 245, dayK)})` : `rgb(${lerp(20, 40, dayK * 2)},${lerp(28, 60, dayK * 2)},${lerp(70, 110, dayK * 2)})`;
  const wall = dayK > 0.5 ? '#6f7fb0' : '#3a3f6a';
  return (
    <AbsoluteFill style={{background: wall, overflow: 'hidden'}}>
      <SvgL>
        <g transform={`translate(${px * 0.6},0)`}>
          {/* wallpaper stripes */}
          {Array.from({length: 24}).map((_, i) => (
            <rect key={i} x={-600 + i * 110} y={0} width={50} height={deskY} fill="#000" opacity={0.06} />
          ))}
          {/* window */}
          <rect x={560} y={330} width={420} height={500} rx={12} fill={sky} stroke="#e8e0cf" strokeWidth={24} />
          {dayK < 0.5 ? (
            <>
              <circle cx={880} cy={440} r={42} fill="#f4f1d8" opacity={0.95} />
              <circle cx={866} cy={428} r={42} fill={sky} opacity={0.9} />
              {Array.from({length: 9}).map((_, i) => (
                <circle key={i} cx={590 + random(`st${i}`) * 360} cy={360 + random(`sty${i}`) * 300} r={3 + random(`str${i}`) * 3} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 4 + i)} />
              ))}
            </>
          ) : (
            <circle cx={700} cy={430} r={50} fill="#ffe680" opacity={0.95} />
          )}
          <line x1={770} y1={330} x2={770} y2={830} stroke="#e8e0cf" strokeWidth={14} />
          <line x1={560} y1={580} x2={980} y2={580} stroke="#e8e0cf" strokeWidth={14} />
          {/* poster */}
          <rect x={150} y={360} width={250} height={330} rx={6} fill="#e8b84a" />
          <rect x={170} y={380} width={210} height={230} fill="#1f2f5c" />
          <path d="M 275,420 L 240,500 L 270,500 L 250,580 L 310,480 L 280,480 Z" fill="#ffd23a" />
          <rect x={180} y={625} width={190} height={20} fill="#1f2f5c" opacity={0.7} />
          {/* door (left) */}
          <rect x={-330} y={250} width={380} height={deskY - 250} fill="#7a5236" />
          <rect x={-300} y={290} width={320} height={deskY - 320} fill="#8a6040" />
          <circle cx={0} cy={800} r={16} fill="#e8b84a" />
          {/* shelf with trophies-less books */}
          <rect x={430} y={900} width={500} height={18} fill="#5a3a24" />
          {['#d9534f', '#4f8fd9', '#5cb85c', '#f0ad4e', '#7b5ea7', '#2fb5b0'].map((c, i) => (
            <rect key={c} x={450 + i * 46} y={900 - 110 - (i % 2) * 14} width={38} height={110 + (i % 2) * 14} fill={c} />
          ))}
        </g>
        {/* floor */}
        <rect x={-200} y={deskY + 120} width={W + 400} height={H} fill="#5a3f2c" />
        {children}
      </SvgL>
      {lamp && <AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 35% at 70% 66%, rgba(255,200,110,0.35), rgba(0,0,0,0) 70%)', pointerEvents: 'none', mixBlendMode: 'screen'}} />}
    </AbsoluteFill>
  );
};

/** Desk with a lamp, top surface at y, spanning x0..x1. Draw in an svg. */
export const Desk: React.FC<{x0: number; x1: number; y: number; lampX?: number; lampOn?: boolean}> = ({x0, x1, y, lampX, lampOn = true}) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={40} rx={6} fill="#8a5a36" />
    <rect x={x0} y={y + 34} width={x1 - x0} height={14} fill="#5a3a24" />
    <rect x={x0 + 30} y={y + 40} width={40} height={600} fill="#6b4428" />
    <rect x={x1 - 70} y={y + 40} width={40} height={600} fill="#6b4428" />
    {lampX !== undefined && (
      <g>
        <rect x={lampX - 50} y={y - 16} width={100} height={18} rx={8} fill="#2a2d38" />
        <path d={`M ${lampX},${y - 12} L ${lampX - 40},${y - 200} L ${lampX + 30},${y - 300}`} stroke="#2a2d38" strokeWidth={14} fill="none" strokeLinejoin="round" />
        <path d={`M ${lampX + 10},${y - 330} L ${lampX + 110},${y - 270} L ${lampX + 60},${y - 200} Z`} fill="#e8b84a" />
        {lampOn && <path d={`M ${lampX + 80},${y - 240} L ${lampX - 160},${y} L ${lampX + 200},${y} Z`} fill="rgba(255,220,140,0.18)" />}
      </g>
    )}
  </g>
);

/* ------------------------------------------------------------------ props */

/** Wine glass (front view), base centre at (x,y), scale s (~1 = 360 px tall).
 * `wob` = bowl deformation amount (0..1), `ph` = oscillation phase (rad). Rim drawn as an ellipse that ovalizes. */
export const WineGlass: React.FC<{x: number; y: number; s?: number; wob?: number; ph?: number; hide?: boolean; glow?: number}> = ({x, y, s = 1, wob = 0, ph = 0, hide, glow = 0}) => {
  if (hide) return null;
  const a = Math.sin(ph) * wob;
  const bw = 120 * (1 + a * 0.22);
  const rimRx = 112 * (1 + a * 0.25);
  const rimRy = 22 * (1 - a * 0.6);
  const top = -360;
  const bowl = `M ${-rimRx},${top} C ${-bw - 10},${top + 110} ${-bw * 0.8},${top + 200} 0,${top + 215} C ${bw * 0.8},${top + 200} ${bw + 10},${top + 110} ${rimRx},${top} Z`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} style={glow ? {filter: `drop-shadow(0 0 ${20 * glow}px rgba(140,220,255,0.9))`} : undefined}>
      <ellipse cx={0} cy={0} rx={90} ry={18} fill="rgba(220,240,255,0.35)" stroke="#e9f6ff" strokeWidth={5} />
      <rect x={-7} y={top + 210} width={14} height={-top - 210} fill="rgba(230,245,255,0.6)" stroke="#e9f6ff" strokeWidth={3} />
      <path d={bowl} fill="rgba(200,230,255,0.22)" stroke="#e9f6ff" strokeWidth={6} />
      <path d={`M ${-rimRx * 0.62},${top + 30} Q ${-bw * 0.85},${top + 110} ${-bw * 0.4},${top + 175}`} stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
      <ellipse cx={0} cy={top} rx={rimRx} ry={Math.max(4, rimRy)} fill="rgba(255,255,255,0.12)" stroke="#ffffff" strokeWidth={5} />
    </g>
  );
};

/** Glass shards flying out from (x,y). age frames; slow 0..1 slows motion. */
export const Shards: React.FC<{x: number; y: number; age: number; n?: number; spread?: number; seed?: string; color?: string; gravity?: number}> = ({
  x,
  y,
  age,
  n = 34,
  spread = 26,
  seed = 'sh',
  color = '#dff3ff',
  gravity = 0.6,
}) => {
  if (age < 0) return null;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const a = r('a') * Math.PI * 2;
        const v = spread * (0.4 + r('v'));
        const px = x + Math.cos(a) * v * age;
        const py = y + Math.sin(a) * v * age * 0.8 + gravity * age * age;
        const sz = 12 + r('s') * 34;
        const rot = age * (r('r') - 0.5) * 30;
        return (
          <path
            key={i}
            d={`M 0,${-sz} L ${sz * 0.6},${sz * 0.4} L ${-sz * 0.5},${sz * 0.6} Z`}
            transform={`translate(${px},${py}) rotate(${rot + r('o') * 360})`}
            fill={color}
            fillOpacity={0.55}
            stroke="#ffffff"
            strokeWidth={3}
            opacity={clamp(1.4 - age / 40)}
          />
        );
      })}
    </g>
  );
};

/** Plastic juice cup with straw; base centre at (x,y), 1 = 200 px tall. `slosh` ripples the juice surface. */
export const JuiceCup: React.FC<{x: number; y: number; s?: number; t: number; slosh?: number}> = ({x, y, s = 1, t, slosh = 0}) => {
  const lvl = -150 + Math.sin(t * 40) * 6 * slosh;
  const wave = Array.from({length: 13})
    .map((_, i) => {
      const xx = -66 + i * 11;
      return `L ${xx},${lvl + Math.sin(i * 1.7 + t * 60) * 7 * slosh}`;
    })
    .join(' ');
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d={`M -70,-200 L 70,-200 L 54,0 L -54,0 Z`} fill="rgba(255,255,255,0.35)" stroke="#ffffff" strokeWidth={5} />
      <path d={`M -67,${lvl} ${wave} L 67,${lvl} L 54,0 L -54,0 Z`} fill="#ff9a2a" opacity={0.9} />
      <rect x={-74} y={-212} width={148} height={16} rx={6} fill="#ffffff" opacity={0.9} />
      <path d={`M 20,-206 L 36,-300 L 70,-310`} stroke="#ff4d8a" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${Math.sin(t * 70) * 6 * slosh} 20 -206)`} />
      {slosh > 0.2 &&
        Array.from({length: 4}).map((_, i) => (
          <circle key={i} cx={-40 + i * 26} cy={lvl - 10 - ((t * 120 + i * 17) % 50)} r={6} fill="#ffb14a" opacity={0.8} />
        ))}
    </g>
  );
};

/** Smartphone lying flat-ish (front view), centre (x,y), w px wide. */
export const Phone: React.FC<{x: number; y: number; w?: number; rot?: number; lit?: number}> = ({x, y, w = 260, rot = 0, lit = 1}) => {
  const h = w * 1.95;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.14} fill="#16171d" stroke="#3a3d4a" strokeWidth={6} />
      <rect x={-w / 2 + 14} y={-h / 2 + 30} width={w - 28} height={h - 60} rx={w * 0.08} fill={lit > 0.5 ? '#2a5bd9' : '#0d0e14'} />
      {lit > 0.5 && (
        <g>
          <circle cx={0} cy={-h * 0.12} r={w * 0.17} fill="#ffffff" opacity={0.9} />
          <path d={`M ${-w * 0.07},${-h * 0.15} L ${w * 0.08},${-h * 0.09} M ${-w * 0.04},${-h * 0.08} l ${w * 0.1},${-w * 0.06}`} stroke="#2a5bd9" strokeWidth={8} strokeLinecap="round" />
          <rect x={-w * 0.3} y={h * 0.05} width={w * 0.6} height={18} rx={9} fill="#ffffff" opacity={0.85} />
          <rect x={-w * 0.2} y={h * 0.11} width={w * 0.4} height={14} rx={7} fill="#ffffff" opacity={0.55} />
          <circle cx={-w * 0.22} cy={h * 0.32} r={w * 0.09} fill="#e5484d" />
          <circle cx={w * 0.22} cy={h * 0.32} r={w * 0.09} fill="#3be08a" />
        </g>
      )}
      <rect x={-w * 0.12} y={-h / 2 + 12} width={w * 0.24} height={8} rx={4} fill="#3a3d4a" />
    </g>
  );
};

/** Daytime park (for the swing): sky, hills, trees, grass. ground at y. */
export const Park: React.FC<{t: number; groundY?: number; px?: number; children?: React.ReactNode}> = ({t, groundY = 1500, px = 0, children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#63b8f2, #c9ecff 70%)', overflow: 'hidden'}}>
    <SvgL>
      <g transform={`translate(${px * 0.2},0)`}>
        <circle cx={860} cy={260} r={80} fill="#fff3b0" style={{filter: 'drop-shadow(0 0 40px #fff3b0)'}} />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${((i * 700 + t * 12) % 1400) - 200},${300 + i * 160})`} fill="#fff" opacity={0.9}>
            <ellipse cx={0} cy={0} rx={110} ry={40} />
            <ellipse cx={60} cy={-20} rx={70} ry={44} />
          </g>
        ))}
      </g>
      <g transform={`translate(${px * 0.4},0)`}>
        <ellipse cx={200} cy={groundY - 40} rx={700} ry={260} fill="#7fc66a" />
        <ellipse cx={1000} cy={groundY - 20} rx={600} ry={220} fill="#6db85a" />
        {[-40, 160, 880, 1060].map((tx, i) => (
          <g key={tx} transform={`translate(${tx},${groundY - 120 - (i % 2) * 30})`}>
            <rect x={-16} y={-40} width={32} height={160} fill="#7a5236" />
            <circle cx={0} cy={-110} r={110} fill={i % 2 ? '#3f9a4a' : '#4aa856'} />
            <circle cx={-50} cy={-60} r={70} fill={i % 2 ? '#3f9a4a' : '#4aa856'} />
            <circle cx={50} cy={-70} r={80} fill={i % 2 ? '#469f50' : '#3f9a4a'} />
          </g>
        ))}
      </g>
      <g transform={`translate(${px},0)`}>
        <rect x={-400} y={groundY} width={W + 800} height={H} fill="#5fae4e" />
        {Array.from({length: 40}).map((_, i) => (
          <path key={i} d={`M ${-300 + i * 45},${groundY + 30 + (i % 3) * 120} l 8,-26 l 8,26`} stroke="#4a9a3c" strokeWidth={5} fill="none" />
        ))}
        <ellipse cx={540} cy={groundY + 120} rx={240} ry={40} fill="#c9a86c" opacity={0.8} />
      </g>
      {children}
    </SvgL>
  </AbsoluteFill>
);

/** Ring-wave arcs emanating from (x,y) — visualises an object vibrating at its own rhythm. `rate` = rings per second. */
export const RingWaves: React.FC<{x: number; y: number; t: number; rate: number; maxR?: number; color?: string; k?: number; width?: number}> = ({
  x,
  y,
  t,
  rate,
  maxR = 220,
  color = '#ffd23a',
  k = 1,
  width = 6,
}) => {
  if (k <= 0.01) return null;
  const n = 4;
  return (
    <g fill="none" stroke={color} strokeWidth={width} style={{filter: `drop-shadow(0 0 6px ${color})`}}>
      {Array.from({length: n}).map((_, i) => {
        const ph = (t * rate * 0.5 + i / n) % 1;
        return <circle key={i} cx={x} cy={y} r={30 + ph * maxR} opacity={k * (1 - ph)} />;
      })}
    </g>
  );
};

/** Sparkle star burst (comic "ding"). */
export const Sparkle: React.FC<{x: number; y: number; k: number; s?: number; color?: string}> = ({x, y, k, s = 60, color = '#fff6b0'}) => {
  if (k <= 0 || k >= 1) return null;
  const sc = Math.sin(k * Math.PI) * s;
  return <path d={`M 0,${-sc} L ${sc * 0.2},${-sc * 0.2} L ${sc},0 L ${sc * 0.2},${sc * 0.2} L 0,${sc} L ${-sc * 0.2},${sc * 0.2} L ${-sc},0 L ${-sc * 0.2},${-sc * 0.2} Z`} transform={`translate(${x},${y})`} fill={color} style={{filter: `drop-shadow(0 0 10px ${color})`}} />;
};

/** Comic SFX word (e.g. "BZZZ", "POP!") — CSS text, centred at (x,y). k = frames since appear. */
export const SfxWord: React.FC<{x: number; y: number; text: string; k: number; color?: string; size?: number; rot?: number; jitter?: number}> = ({
  x,
  y,
  text,
  k,
  color = '#ffd23a',
  size = 110,
  rot = -8,
  jitter = 0,
}) => {
  if (k < 0) return null;
  const s = k < 5 ? lerp(0.3, 1.1, easeOut(k / 5)) : 1.1 - Math.min(0.1, (k - 5) * 0.02);
  const jx = jitter ? (random(`sw${k}`) - 0.5) * jitter : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x + jx,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        fontFamily: 'Oswald',
        fontWeight: 700,
        fontSize: size,
        color,
        WebkitTextStroke: `${size * 0.06}px #1a1420`,
        paintOrder: 'stroke fill',
        textShadow: '0 8px 0 rgba(0,0,0,0.35)',
        whiteSpace: 'nowrap',
        letterSpacing: 2,
      }}
    >
      {text}
    </div>
  );
};

export const kk = kf;
