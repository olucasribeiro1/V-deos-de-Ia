import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Presenter} from '../Presenter';
import {f} from '../timeline';
import type {Pose, Expression} from '../../characters/types';
import {Blueprint, C, Cam, FONT, k, popIn} from './kit';

export type BoardSpec = {
  kicker: string;
  num?: string;
  title: string;
  items?: {text: string; icon: string; at: number}[];
  at?: number;
};

/** Board (HTML) on the left side, inside the middle band. */
export const Board: React.FC<BoardSpec & {x?: number; y?: number; w?: number}> = ({kicker, num, title, items = [], at = 0, x = 50, y = 540, w = 520}) => {
  const frame = useCurrentFrame();
  const p = popIn(frame, at);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        padding: '30px 32px 34px',
        borderRadius: 28,
        background: 'linear-gradient(160deg, rgba(14,48,82,0.95), rgba(6,22,40,0.95))',
        border: '3px solid rgba(120,200,255,0.45)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.05)',
        transform: `perspective(1400px) rotateY(${(1 - p) * 25 + 6}deg) scale(${0.85 + 0.15 * p})`,
        transformOrigin: 'left center',
        opacity: Math.min(1, p * 1.5),
        color: '#fff',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{fontFamily: FONT.hud, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: '#9fd4ff'}}>{kicker}</div>
        {num && (
          <div style={{marginLeft: 'auto', padding: '4px 16px', borderRadius: 12, background: C.water, color: '#04203a', fontFamily: FONT.cap, fontWeight: 700, fontSize: 40}}>{num}</div>
        )}
      </div>
      <div style={{marginTop: 12, fontFamily: FONT.cap, fontWeight: 700, fontSize: 66, lineHeight: 1.02, letterSpacing: 0.5}}>{title}</div>
      <div style={{height: 4, width: 120, background: C.water, borderRadius: 2, margin: '18px 0 8px'}} />
      {items.map((it, i) => {
        const q = popIn(frame, it.at);
        if (frame < it.at) return null;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, opacity: Math.min(1, q * 1.4), transform: `translateX(${(1 - q) * -30}px)`}}>
            <div style={{width: 58, height: 58, borderRadius: 14, background: 'rgba(56,182,255,0.18)', border: `2px solid ${C.water}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32}}>{it.icon}</div>
            <div style={{fontFamily: FONT.hud, fontWeight: 700, fontSize: 34, letterSpacing: 1}}>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Presenter in the "studio" with optional board. st = shot start (abs s), dur in frames. */
export const Studio: React.FC<{
  st: number;
  dur: number;
  board?: BoardSpec;
  pose?: Pose;
  expr?: Expression;
  cam?: {from: {x: number; y: number; s: number}; to: {x: number; y: number; s: number}};
  px?: number;
  children?: React.ReactNode;
  tint?: string;
}> = ({st, dur, board, pose, expr, cam, px = 790, children, tint}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 20) * 3;
  const c = cam ?? {from: {x: 540, y: 960, s: 1.0}, to: {x: 540, y: 940, s: 1.06}};
  return (
    <AbsoluteFill>
      <Blueprint tint={tint} />
      <Cam dur={dur} from={c.from} to={c.to}>
        {/* floor glow */}
        <div style={{position: 'absolute', left: 300, top: 1500, width: 900, height: 300, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(56,182,255,0.28), transparent)'}} />
        {children}
        <Presenter absOffset={f(st)} x={px} y={2080} height={1450} upperOnly pose={{lean: sway * 0.3, ...pose}} expr={expr} />
        {board && <Board {...board} />}
      </Cam>
    </AbsoluteFill>
  );
};

/** Pointing-at-board pose (left arm toward screen-left), with a little motion. */
export const pointPose = (frame: number, at = 0): Pose => {
  const t = k(frame, at, at + 10);
  return {shL: -7 - 80 * t, elL: 6 - 30 * t + Math.sin(frame / 9) * 3 * t, facing: -0.12 * t};
};
