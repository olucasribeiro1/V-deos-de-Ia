import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeOut, kf, lerp} from '../lib/anim';
import {CAPTION_FONT, HUD_FONT} from '../lib/fonts';
import {f, wordAt} from './timeline';
import type {Pose} from '../characters/types';
import {DEFAULT_POSE} from '../characters/Puppet';

export {Rig, useShot} from '../ep02/partC/kit';
export {Stamp, Chip, HudTag} from '../ep02qi/partA/kit';
export {BigChip} from '../ep05/partA/kit';
export {SoundWord, Confetti} from '../ep03/partB/kit';
export {CutFlash, SpeedLines} from '../ep01/partA/kit';
export {Finish} from '../scenes/common';
export {Shockwave} from '../fx/Shockwave';
export {Particles} from '../fx/Particles';
export {walkP} from '../ep02qi/partB/kit';
export {clamp, easeOut, kf, lerp};

export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word onset. */
export const ev = (p: ShotP, id: string, n: number) => f(wordAt(id, n)) - p.from;
export const appear = (fr: number, at: number, len = 8) => kf(fr, [at, at + len], [0, 1], easeOut);
export const YEL = '#ffd23a';

const rad = (d: number) => (d * Math.PI) / 180;
/** Screen position of a puppet's hand. Puppet feet at (x,y), `height` px; side 'R' = screen-right arm (unflipped). */
export const handAt = (x: number, y: number, height: number, pose: Pose, side: 'L' | 'R', flip = false): [number, number] => {
  const p = {...DEFAULT_POSE, ...pose};
  const sh = side === 'R' ? p.shR : p.shL;
  const el = side === 'R' ? p.elR : p.elL;
  const sx = side === 'R' ? 128 : -128;
  let ux = sx + Math.sin(rad(sh)) * 182 + Math.sin(rad(sh + el)) * 168;
  const uy = -728 + Math.cos(rad(sh)) * 182 + Math.cos(rad(sh + el)) * 168 + p.bob;
  if (flip) ux = -ux;
  const k = height / 1000;
  return [x + ux * k, y + uy * k];
};

/** Full-screen colour card used for science panels (title strip on top). */
export const Panel: React.FC<{bg?: string; title?: string; k?: number; children?: React.ReactNode}> = ({bg = 'radial-gradient(ellipse 80% 60% at 50% 45%, #2b3a7a, #0d1226)', title, k = 1, children}) => (
  <AbsoluteFill style={{background: bg}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '90px 90px'}} />
    {children}
    {title && (
      <div style={{position: 'absolute', top: 520, width: '100%', textAlign: 'center', opacity: clamp(k * 2), transform: `translateY(${(1 - clamp(k)) * -30}px)`}}>
        <span style={{display: 'inline-block', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: '#141414', background: YEL, padding: '8px 26px', borderRadius: 14}}>{title}</span>
      </div>
    )}
  </AbsoluteFill>
);

/** Big label text (Oswald) centred at x,y. */
export const Big: React.FC<{x: number; y: number; text: string; k: number; size?: number; color?: string; rot?: number}> = ({x, y, text, k, size = 120, color = '#fff', rot = 0}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(0.6, 1, easeOut(clamp(k)))})`, opacity: clamp(k * 2), fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap', textShadow: '0 6px 0 rgba(0,0,0,0.45), 0 0 4px rgba(0,0,0,0.8)'}}>{text}</div>
  );

/** Cricket "cri cri" text gag. */
export const Cricket: React.FC<{x: number; y: number; fr: number}> = ({x, y, fr}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: HUD_FONT, fontStyle: 'italic', fontWeight: 700, fontSize: 46, color: '#fff', opacity: 0.85, transform: `translateY(${Math.sin(fr / 3) * 6}px)`, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>cri… cri…</div>
);
