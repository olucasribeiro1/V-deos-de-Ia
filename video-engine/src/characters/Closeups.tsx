import React from 'react';
import {useUid} from '../lib/useUid';
import {lerp} from '../lib/anim';
import {Head} from './parts';
import type {Expression, HeadStyle, Lighting, Tone} from './types';
import {SUNSET_LIGHT} from './types';

/**
 * Close-up building blocks with more detail than the full-body puppets
 * (the "camera" raises the level of detail, like in the reference).
 */

/** Forearm in a hoodie sleeve hanging down, with a 4-finger hand. Screen units (px). */
export const SleeveArm: React.FC<{
  x: number;
  /** y where the cuff ends / wrist starts */
  wristY: number;
  sleeve: Tone;
  skin: Tone;
  light?: Lighting;
  /** 0..1 finger spread (tension) */
  tense?: number;
  /** 0..1 squeeze of the cuff by a grip */
  squeeze?: number;
  gripY?: number;
}> = ({x, wristY, sleeve, skin, light = SUNSET_LIGHT, tense = 0, squeeze = 0, gripY = 0}) => {
  const sid = useUid('sleeve');
  const hid = useUid('palm');
  const sw = 132; // half width of the sleeve
  const pinch = squeeze * 16;
  const sleevePath = `M${x - sw + 10},-60 L${x + sw - 10},-60 Q${x + sw + 6},${gripY - 200} ${x + sw - pinch},${gripY} Q${x + sw - 4},${wristY - 40} ${x + sw - 14},${wristY} L${x - sw + 14},${wristY} Q${x - sw + 4},${wristY - 40} ${x - sw + pinch},${gripY} Q${x - sw - 6},${gripY - 200} ${x - sw + 10},-60 Z`;
  const cuffTop = wristY - 130;
  const palmTop = wristY + 70;
  return (
    <g>
      <defs>
        <linearGradient id={sid} x1="0" x2="1">
          <stop offset="0" stopColor={light.rim} />
          <stop offset="0.06" stopColor={sleeve.light} />
          <stop offset="0.35" stopColor={sleeve.base} />
          <stop offset="0.75" stopColor={sleeve.base} />
          <stop offset="1" stopColor={sleeve.shade} />
        </linearGradient>
        <linearGradient id={hid} x1="0" x2="1">
          <stop offset="0" stopColor={skin.light} />
          <stop offset="0.45" stopColor={skin.base} />
          <stop offset="1" stopColor={skin.shade} />
        </linearGradient>
      </defs>
      <g transform={`translate(${x},${wristY}) scale(1.18) translate(${-x},${-wristY})`}>
      {/* wrist */}
      <path d={`M${x - 74},${wristY - 40} L${x + 74},${wristY - 40} Q${x + 80},${palmTop - 10} ${x + 86},${palmTop + 10} L${x - 88},${palmTop + 10} Q${x - 78},${palmTop - 10} ${x - 74},${wristY - 40} Z`} fill={`url(#${hid})`} />
      {/* hand: palm */}
      <path
        d={`M${x - 88},${palmTop} C${x - 104},${palmTop + 80} ${x - 102},${palmTop + 170} ${x - 86},${palmTop + 228} L${x + 92},${palmTop + 230} C${x + 106},${palmTop + 160} ${x + 102},${palmTop + 70} ${x + 86},${palmTop} Z`}
        fill={`url(#${hid})`}
      />
      {/* thumb (screen-left) */}
      <path
        d={`M${x - 84},${palmTop + 40} Q${x - 150 - tense * 20},${palmTop + 120} ${x - 140 - tense * 26},${palmTop + 210} Q${x - 128 - tense * 26},${palmTop + 240} ${x - 104},${palmTop + 214} Q${x - 92},${palmTop + 150} ${x - 70},${palmTop + 120} Z`}
        fill={skin.base}
      />
      <path d={`M${x - 140 - tense * 26},${palmTop + 205} q 10,10 26,4`} stroke={skin.shade} strokeWidth={5} fill="none" opacity={0.6} />
      {/* 4 fingers */}
      {[0, 1, 2, 3].map((i) => {
        const fx = x - 64 + i * 44;
        const spread = (i - 1.5) * tense * 7;
        const len = [150, 172, 166, 132][i];
        const top = palmTop + 200;
        return (
          <g key={i} transform={`rotate(${spread} ${fx} ${top})`}>
            <rect x={fx - 22} y={top} width={44} height={len} rx={22} fill={i === 3 ? skin.shade : `url(#${hid})`} />
            <rect x={fx - 22} y={top} width={44} height={len} rx={22} fill="none" stroke={skin.shade} strokeWidth={3} opacity={0.5} />
            <path d={`M${fx - 12},${top + len * 0.45} q 12,6 24,0`} stroke={skin.shade} strokeWidth={4} fill="none" opacity={0.6} />
            <path d={`M${fx - 12},${top + len * 0.75} q 12,6 24,0`} stroke={skin.shade} strokeWidth={4} fill="none" opacity={0.5} />
          </g>
        );
      })}
      {/* knuckle shading */}
      <path d={`M${x - 84},${palmTop + 196} Q${x},${palmTop + 214} ${x + 88},${palmTop + 196}`} stroke={skin.shade} strokeWidth={6} fill="none" opacity={0.45} />
      <path d={`M${x - 60},${palmTop + 60} Q${x - 20},${palmTop + 130} ${x - 40},${palmTop + 180}`} stroke={skin.shade} strokeWidth={5} fill="none" opacity={0.35} />
      </g>
      {/* sleeve */}
      <path d={sleevePath} fill={`url(#${sid})`} />
      {/* folds */}
      {[160, 330, 520].map((y, i) => (
        <path key={y} d={`M${x - 70 + i * 30},${y} q 40,${30 - i * 6} 90,${10 + i * 4}`} stroke={sleeve.shade} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.45} />
      ))}
      {/* cuff (ribbed) */}
      <path
        d={`M${x - sw + 10 + pinch * 0.6},${cuffTop} L${x + sw - 10 - pinch * 0.6},${cuffTop} L${x + sw - 14},${wristY} Q${x},${wristY + 14} ${x - sw + 14},${wristY} Z`}
        fill={sleeve.shade}
      />
      {Array.from({length: 13}).map((_, i) => {
        const rx = x - sw + 26 + i * ((2 * sw - 52) / 12);
        return <line key={i} x1={rx} y1={cuffTop + 8} x2={rx} y2={wristY - 4} stroke="#8a5c12" strokeWidth={4} opacity={0.55} />;
      })}
      <line x1={x - sw + 12} y1={cuffTop} x2={x + sw - 12} y2={cuffTop} stroke={sleeve.light} strokeWidth={5} opacity={0.5} />
      {/* wrinkles from the grip */}
      {squeeze > 0.05 &&
        [-1, 1].map((s) =>
          [0, 1, 2].map((k) => (
            <path
              key={`${s}${k}`}
              d={`M${x + s * (sw - 30)},${gripY - 60 - k * 50} q ${-s * 50},${20} ${-s * 90},${-10 - k * 10}`}
              stroke={sleeve.shade}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
              opacity={0.55 * squeeze}
            />
          )),
        )}
    </g>
  );
};

/**
 * Black leather glove coming from the right edge in a suit sleeve, grabbing around
 * a vertical arm at (ax, ay). `reach` 0..1 slides it in, `grip` 0..1 curls the fingers.
 */
export const GloveGrab: React.FC<{ax: number; ay: number; armHalfW: number; reach: number; grip: number; light?: Lighting}> = ({
  ax,
  ay,
  armHalfW,
  reach,
  grip,
  light = SUNSET_LIGHT,
}) => {
  const gid = useUid('glove');
  const suit = useUid('suit');
  const off = (1 - reach) * 760;
  const backX = ax + armHalfW - 40 + off; // left edge of the back of the hand
  const fingerY = [ay - 66, ay - 22, ay + 22, ay + 64];
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5a5e6a" />
          <stop offset="0.25" stopColor="#24252c" />
          <stop offset="1" stopColor="#0b0b0e" />
        </linearGradient>
        <linearGradient id={suit} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6c717c" />
          <stop offset="0.3" stopColor="#4a4e57" />
          <stop offset="1" stopColor="#2c2f36" />
        </linearGradient>
      </defs>
      {/* suit sleeve + shirt cuff from the right edge */}
      <path d={`M${backX + 230},${ay - 120} L 1300,${ay - 170} L 1300,${ay + 150} L${backX + 230},${ay + 110} Z`} fill={`url(#${suit})`} />
      <path d={`M${backX + 300},${ay - 118} Q ${backX + 600},${ay - 140} 1300,${ay - 150}`} stroke={light.rim} strokeWidth={6} fill="none" opacity={0.6} />
      <rect x={backX + 196} y={ay - 112} width={48} height={218} rx={12} fill="#eef0f3" />
      <rect x={backX + 214} y={ay - 30} width={14} height={14} rx={3} fill="#c9b27a" />
      {/* back of the hand */}
      <path
        d={`M${backX},${ay - 96} Q${backX + 60},${ay - 120} ${backX + 210},${ay - 100} L${backX + 210},${ay + 96} Q${backX + 60},${ay + 120} ${backX},${ay + 92} Z`}
        fill={`url(#${gid})`}
      />
      <path d={`M${backX + 40},${ay - 70} Q ${backX + 130},${ay - 10} ${backX + 180},${ay + 60}`} stroke="#3c3f48" strokeWidth={3} strokeDasharray="8 7" fill="none" />
      {/* fingers wrapping across the front of the arm */}
      {fingerY.map((fy, i) => {
        const len = lerp(170, armHalfW * 2 - 26, grip) - (i === 3 ? 26 : 0);
        const ang = lerp(-32 - i * 4, 0, grip);
        const thick = 46;
        return (
          <g key={i} transform={`rotate(${ang} ${backX + 10} ${fy})`}>
            <rect x={backX + 10 - len} y={fy - thick / 2} width={len + 30} height={thick} rx={thick / 2} fill={`url(#${gid})`} stroke="#000" strokeWidth={3} />
            {/* knuckle segment lines */}
            <path d={`M${backX - len * 0.35},${fy - thick / 2 + 6} l 0,${thick - 12}`} stroke="#000" strokeWidth={3} opacity={0.5} />
            <path d={`M${backX - len * 0.7},${fy - thick / 2 + 6} l 0,${thick - 12}`} stroke="#000" strokeWidth={3} opacity={0.5} />
            <path d={`M${backX - len + 20},${fy - thick / 2 + 7} L${backX},${fy - thick / 2 + 7}`} stroke="#8a8e9a" strokeWidth={4} strokeLinecap="round" opacity={0.55} />
            {/* fingertip curling around the far edge */}
          </g>
        );
      })}
      {/* warm rim on top edge */}
      <path d={`M${backX + 20},${ay - 100} Q${backX + 110},${ay - 118} ${backX + 200},${ay - 102}`} stroke={light.rim} strokeWidth={5} fill="none" opacity={0.7} />
    </g>
  );
};

/** Big head for extreme close-ups (eyes), centred at (cx, cy) with scale k. */
export const FaceCloseup: React.FC<{cx: number; cy: number; k: number; skin: Tone; style: HeadStyle; expr: Expression; light?: Lighting; facing?: number}> = ({
  cx,
  cy,
  k,
  skin,
  style,
  expr,
  light = SUNSET_LIGHT,
  facing = 0,
}) => (
  <g transform={`translate(${cx},${cy}) scale(${k})`}>
    <Head skin={skin} style={style} expr={expr} light={light} facing={facing} />
  </g>
);
