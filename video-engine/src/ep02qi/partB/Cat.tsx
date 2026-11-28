import React from 'react';
import {lerp} from '../../lib/anim';

/**
 * Davi's cat: cute flat grey "tuxedo" cat, sitting, front view.
 * Local units, origin at the bottom centre, ~520 units tall (ears included).
 */
export type CatProps = {
  /** 0 open .. 1 closed (slow blink) */
  blink?: number;
  /** -1..1 pupils left/right */
  lookX?: number;
  /** pupil dilation 0 (slit) .. 1 (round, "hunting") */
  dilate?: number;
  /** 0..1 right paw reaches out to the side (pushing a glass) */
  paw?: number;
  /** paw target height offset (units, negative = higher) */
  pawY?: number;
  /** tail wave phase (s) */
  t?: number;
  /** 0..1 mouth open (meow) */
  meow?: number;
  /** head tilt in degrees */
  tilt?: number;
  /** ear twitch 0..1 */
  ear?: number;
};

const FUR = '#5d6475';
const SHADE = '#424857';
const LIGHT = '#7f879a';
const WHITE = '#f3f0e8';
const PINK = '#f2a0a8';

export const Cat: React.FC<CatProps> = ({blink = 0, lookX = 0, dilate = 0.2, paw = 0, pawY = 0, t = 0, meow = 0, tilt = 0, ear = 0}) => {
  const tw = Math.sin(t * 2.2) * 14;
  const open = 1 - blink;
  const eye = (side: -1 | 1) => {
    const ex = side * 54;
    const ey = -372;
    return (
      <g key={side}>
        <ellipse cx={ex} cy={ey} rx={36} ry={38} fill="#cfe25a" stroke="#2a2d35" strokeWidth={5} />
        <ellipse cx={ex + lookX * 10} cy={ey + 2} rx={lerp(7, 22, dilate)} ry={30} fill="#16181d" />
        <circle cx={ex + 12 + lookX * 6} cy={ey - 14} r={8} fill="#fff" />
        <circle cx={ex - 10 + lookX * 6} cy={ey + 12} r={3.5} fill="#fff" opacity={0.8} />
        {/* eyelid */}
        <path d={`M${ex - 40},${ey - 42} L${ex + 40},${ey - 42} L${ex + 40},${ey - 40 + 80 * blink} Q${ex},${ey - 30 + 92 * blink} ${ex - 40},${ey - 40 + 80 * blink} Z`} fill={FUR} />
        {blink > 0.08 && <path d={`M${ex - 36},${ey - 38 + 76 * blink} Q${ex},${ey - 28 + 88 * blink} ${ex + 36},${ey - 38 + 76 * blink}`} stroke="#2a2d35" strokeWidth={5} fill="none" strokeLinecap="round" />}
        {open > 0 ? null : null}
      </g>
    );
  };
  // paw (screen-right) — shoulder → paw tip
  const sh: [number, number] = [62, -210];
  const rest: [number, number] = [52, -26];
  const reach: [number, number] = [240, -150 + pawY];
  const pp: [number, number] = [lerp(rest[0], reach[0], paw), lerp(rest[1], reach[1], paw)];
  return (
    <g>
      {/* tail */}
      <path d={`M -90,-20 Q -240,-10 -250,-110 Q ${-258 + tw},-180 ${-228 + tw * 1.4},-210`} stroke={SHADE} strokeWidth={46} fill="none" strokeLinecap="round" />
      <path d={`M -90,-20 Q -240,-10 -250,-110 Q ${-258 + tw},-180 ${-228 + tw * 1.4},-210`} stroke={FUR} strokeWidth={34} fill="none" strokeLinecap="round" />
      <circle cx={-228 + tw * 1.4} cy={-210} r={17} fill={WHITE} />
      {/* body */}
      <path d="M -140,0 Q -160,-150 -96,-250 Q 0,-300 96,-250 Q 160,-150 140,0 Z" fill={FUR} />
      <path d="M 60,-270 Q 150,-160 140,0 L 100,0 Q 110,-150 40,-260 Z" fill={SHADE} opacity={0.6} />
      <path d="M -120,-40 Q -140,-140 -90,-220" stroke={LIGHT} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
      {/* bib */}
      <path d="M -62,-250 Q 0,-200 62,-250 Q 80,-120 40,-20 L -40,-20 Q -80,-120 -62,-250 Z" fill={WHITE} />
      {/* left paw (rest) */}
      <ellipse cx={-52} cy={-18} rx={38} ry={22} fill={WHITE} stroke="#d9d4c8" strokeWidth={3} />
      <path d="M -66,-12 L -66,-2 M -52,-10 L -52,0 M -38,-12 L -38,-2" stroke="#c9c2b4" strokeWidth={3} />
      {/* right leg/paw (reaching) */}
      <path d={`M ${sh[0]},${sh[1]} Q ${lerp(80, 170, paw)},${lerp(-100, -200, paw)} ${pp[0]},${pp[1]}`} stroke={FUR} strokeWidth={44} fill="none" strokeLinecap="round" />
      <ellipse cx={pp[0]} cy={pp[1] + 6} rx={36} ry={22} fill={WHITE} stroke="#d9d4c8" strokeWidth={3} transform={`rotate(${-paw * 60} ${pp[0]} ${pp[1] + 6})`} />
      {/* head */}
      <g transform={`rotate(${tilt} 0 -300)`}>
        {/* ears */}
        <path d={`M -120,-410 L ${-118 - ear * 10},${-525 + ear * 30} L -40,-468 Z`} fill={FUR} />
        <path d={`M -106,-424 L ${-106 - ear * 8},${-500 + ear * 26} L -58,-470 Z`} fill={PINK} />
        <path d="M 120,-410 L 118,-525 L 40,-468 Z" fill={FUR} />
        <path d="M 106,-424 L 106,-500 L 58,-470 Z" fill={PINK} />
        <path d="M -150,-360 Q -150,-470 0,-474 Q 150,-470 150,-360 Q 150,-262 0,-258 Q -150,-262 -150,-360 Z" fill={FUR} />
        <path d="M 90,-460 Q 150,-430 150,-360 Q 150,-280 70,-262 Q 128,-320 90,-460 Z" fill={SHADE} opacity={0.5} />
        {/* forehead stripes */}
        <path d="M -22,-470 L -14,-428 M 0,-474 L 0,-424 M 22,-470 L 14,-428" stroke={SHADE} strokeWidth={8} strokeLinecap="round" />
        {/* muzzle */}
        <path d="M -62,-300 Q -64,-348 0,-346 Q 64,-348 62,-300 Q 50,-262 0,-262 Q -50,-262 -62,-300 Z" fill={WHITE} />
        {eye(-1)}
        {eye(1)}
        {/* nose + mouth */}
        <path d="M -13,-330 L 13,-330 L 0,-316 Z" fill={PINK} stroke="#c06a74" strokeWidth={2} />
        {meow > 0.05 ? (
          <ellipse cx={0} cy={-298 + meow * 6} rx={14} ry={6 + meow * 18} fill="#6a2a33" />
        ) : (
          <path d="M -20,-304 Q -10,-294 0,-308 Q 10,-294 20,-304" stroke="#2a2d35" strokeWidth={4} fill="none" strokeLinecap="round" />
        )}
        <line x1={0} y1={-316} x2={0} y2={-306} stroke="#2a2d35" strokeWidth={4} />
        {/* whiskers */}
        {[-1, 1].map((s) => (
          <g key={s} stroke="#e8e4da" strokeWidth={3} strokeLinecap="round" opacity={0.9}>
            <path d={`M ${s * 52},-312 Q ${s * 110},-322 ${s * 170},-318`} fill="none" />
            <path d={`M ${s * 52},-302 Q ${s * 110},-302 ${s * 168},-292`} fill="none" />
          </g>
        ))}
        {/* blush */}
        <ellipse cx={-92} cy={-318} rx={16} ry={9} fill={PINK} opacity={0.45} />
        <ellipse cx={92} cy={-318} rx={16} ry={9} fill={PINK} opacity={0.45} />
      </g>
    </g>
  );
};

/** Cat with its bottom-centre at screen (x,y); `height` = on-screen px of the ~520-unit cat. */
export const PlacedCat: React.FC<CatProps & {x: number; y: number; height: number; flip?: boolean}> = ({x, y, height, flip, ...rest}) => {
  const k = height / 520;
  return (
    <svg style={{position: 'absolute', left: x - 300 * k, top: y - 560 * k, overflow: 'visible'}} width={600 * k} height={580 * k} viewBox="-300 -560 600 580">
      <g transform={flip ? 'scale(-1,1)' : undefined}>
        <Cat {...rest} />
      </g>
    </svg>
  );
};
