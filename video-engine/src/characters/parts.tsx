import React from 'react';
import {useUid} from '../lib/useUid';
import type {Expression, HeadStyle, Lighting, Tone} from './types';

export type Pt = [number, number];

const toPath = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/** Tube limb with soft side shading and a warm rim light, all clipped to the tube silhouette. */
export const Limb: React.FC<{pts: Pt[]; w: number; tone: Tone; light: Lighting}> = ({pts, w, tone, light}) => {
  const id = useUid('limb');
  const d = toPath(pts);
  const common = {d, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const s = -light.side;
  const fid = id + 'f';
  return (
    <g>
      <defs>
        <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={w * 0.09} />
        </filter>
        <mask id={id} maskUnits="userSpaceOnUse" x={-3000} y={-3000} width={6000} height={6000}>
          <path {...common} stroke="#fff" strokeWidth={w} />
        </mask>
      </defs>
      <path {...common} stroke={tone.base} strokeWidth={w} />
      <g mask={`url(#${id})`}>
        <g filter={`url(#${fid})`}>
          <path {...common} transform={`translate(${s * w * 0.5},0)`} stroke={tone.shade} strokeWidth={w * 0.75} opacity={0.5 * light.shadeStrength + 0.3} />
          <path {...common} transform={`translate(${-s * w * 0.2},0)`} stroke={tone.light} strokeWidth={w * 0.25} opacity={0.3} />
        </g>
        <path {...common} transform={`translate(${-s * w * 0.52},0)`} stroke={light.rim} strokeWidth={w * 0.2} opacity={light.rimStrength} />
      </g>
    </g>
  );
};

/** Small stylised hand for full-body shots: mitten with thumb, oriented along the forearm. */
export const MittenHand: React.FC<{at: Pt; angle: number; tone: Tone; light: Lighting; size?: number; thumbSide?: 1 | -1}> = ({
  at,
  angle,
  tone,
  light,
  size = 34,
  thumbSide = 1,
}) => {
  const id = useUid('hand');
  return (
    <g transform={`translate(${at[0]},${at[1]}) rotate(${-angle})`}>
      <defs>
        <radialGradient id={id} cx={0.5 + light.side * 0.25} cy={0.35} r={0.8}>
          <stop offset="0" stopColor={tone.light} />
          <stop offset="0.55" stopColor={tone.base} />
          <stop offset="1" stopColor={tone.shade} />
        </radialGradient>
      </defs>
      <ellipse cx={thumbSide * size * 0.62} cy={size * 0.55} rx={size * 0.3} ry={size * 0.5} fill={tone.base} transform={`rotate(${thumbSide * -25} ${thumbSide * size * 0.62} ${size * 0.55})`} />
      <rect x={-size * 0.62} y={-size * 0.1} width={size * 1.24} height={size * 1.6} rx={size * 0.6} fill={`url(#${id})`} />
      {/* finger separations */}
      {[-0.22, 0.05, 0.3].map((k) => (
        <line key={k} x1={k * size} y1={size * 1.05} x2={k * size} y2={size * 1.42} stroke={tone.shade} strokeWidth={size * 0.07} strokeLinecap="round" opacity={0.7} />
      ))}
    </g>
  );
};

export const Sneaker: React.FC<{at: Pt; side: -1 | 1; tone: Tone; light: Lighting}> = ({at, side, tone, light}) => {
  const id = useUid('shoe');
  const [x, y] = at;
  return (
    <g transform={`translate(${x},${y}) scale(1.25)`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={light.side < 0 ? tone.light : tone.shade} />
          <stop offset="0.5" stopColor={tone.base} />
          <stop offset="1" stopColor={light.side < 0 ? tone.shade : tone.light} />
        </linearGradient>
      </defs>
      <path
        d={`M${-34 + side * 6},-6 Q${-36 + side * 6},-34 -6,-36 L 14,-36 Q ${40 + side * 10},-30 ${44 + side * 10},4 L ${44 + side * 10},14 L ${-38 + side * 6},14 Z`}
        fill={`url(#${id})`}
      />
      <rect x={-40 + side * 6} y={6} width={86 + side * 4} height={16} rx={7} fill="#f4efe6" />
      <rect x={-40 + side * 6} y={16} width={86 + side * 4} height={6} rx={3} fill="#cfc6b8" />
      <path d={`M -10,-30 L 12,-24 M -12,-20 L 12,-14`} stroke="#fff6ea" strokeWidth={4} strokeLinecap="round" opacity={0.9} />
    </g>
  );
};

export const DressShoe: React.FC<{at: Pt; side: -1 | 1; tone: Tone}> = ({at, side, tone}) => (
  <g transform={`translate(${at[0]},${at[1]}) scale(1.2)`}>
    <path d={`M${-30 + side * 6},0 Q ${-32 + side * 6},-30 -4,-30 L 10,-30 Q ${38 + side * 10},-24 ${44 + side * 10},10 L ${-34 + side * 6},14 Z`} fill={tone.base} />
    <path d={`M -8,-26 Q 14,-30 ${30 + side * 6},-14`} stroke={tone.light} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
    <rect x={-36 + side * 6} y={8} width={82 + side * 4} height={10} rx={4} fill="#121216" />
  </g>
);

/**
 * Big round head (r = 122) centred on (0,0). Face features shift with `facing`.
 */
export const Head: React.FC<{
  skin: Tone;
  style: HeadStyle;
  expr: Expression;
  light: Lighting;
  facing?: number;
}> = ({skin, style, expr, light, facing = 0}) => {
  const gid = useUid('head');
  const rid = useUid('rim');
  const cid = useUid('hclip');
  const R = 122;
  const fx = facing * 30;
  const blink = expr.blink ?? 0;
  const wide = expr.eyesWide ?? 0;
  const lookX = (expr.lookX ?? 0) * 7;
  const lookY = (expr.lookY ?? 0) * 6;
  const smile = expr.smile ?? 0;
  const half = expr.halfSmile ?? 0;
  const open = expr.mouthOpen ?? 0;
  const raise = expr.browRaise ?? 0;
  const tilt = expr.browTilt ?? 0;
  const asym = expr.browAsym ?? 0;
  const hair = style.hairColor;
  const eyeY = -2 + lookY * 0.4;

  const eye = (side: -1 | 1) => {
    const ex = fx + side * 41 + lookX * 0.6;
    if (style.sunglasses) return null;
    const scleraRx = 11 + wide * 15;
    const scleraRy = 15 + wide * 15;
    const open01 = 1 - blink;
    if (open01 < 0.15) {
      return (
        <path key={side} d={`M${ex - 13},${eyeY} Q${ex},${eyeY + 7} ${ex + 13},${eyeY}`} stroke="#1c1311" strokeWidth={5} fill="none" strokeLinecap="round" />
      );
    }
    return (
      <g key={side}>
        {wide > 0.02 && (
          <ellipse cx={ex} cy={eyeY - wide * 3} rx={scleraRx} ry={scleraRy * open01} fill="#fbf7f0" stroke="#1c1311" strokeWidth={3.5 * wide} opacity={Math.min(1, wide * 1.5)} />
        )}
        <ellipse
          cx={ex + lookX * wide * 0.8}
          cy={eyeY - wide * 3 + lookY * wide}
          rx={11 - wide * 3}
          ry={(15 - wide * 7) * open01}
          fill="#1c1311"
        />
        <circle cx={ex + 4 - wide * 1 + lookX * wide * 0.8} cy={eyeY - 6 - wide * 2} r={3.4} fill="#fff" opacity={0.95} />
      </g>
    );
  };

  const brow = (side: -1 | 1) => {
    const bx = fx + side * 42;
    const by = -42 - raise * 13 - (side === 1 ? asym * 12 : 0);
    const inner: Pt = [bx - side * 24, by - tilt * 9];
    const outer: Pt = [bx + side * 26, by + tilt * 5];
    const mid: Pt = [bx, by - 7 - Math.abs(tilt) * 2];
    return (
      <path
        key={side}
        d={`M${inner[0]},${inner[1]} Q${mid[0]},${mid[1]} ${outer[0]},${outer[1]}`}
        stroke={style.hair === 'bald' && !style.beard ? '#3a2a22' : hair}
        strokeWidth={15}
        strokeLinecap="round"
        fill="none"
      />
    );
  };

  // mouth
  const my = 62 + (style.beard ? 2 : 0);
  const mw = 24;
  const lc = -smile * 7; // left corner offset
  const rc = -smile * 7 - half * 13;
  const ctrl = smile * 16 + half * 3;
  let mouth: React.ReactNode;
  if (open > 0.05) {
    const depth = 8 + open * 34;
    mouth = (
      <g>
        <path
          d={`M${fx - mw},${my + lc} Q${fx},${my + ctrl - 4} ${fx + mw},${my + rc} Q${fx + mw * 0.8},${my + depth} ${fx},${my + depth + 2} Q${fx - mw * 0.8},${my + depth} ${fx - mw},${my + lc} Z`}
          fill="#4a1c1a"
        />
        <ellipse cx={fx + 2} cy={my + depth * 0.75} rx={mw * 0.55} ry={depth * 0.22} fill="#c45a52" />
      </g>
    );
  } else {
    mouth = (
      <path d={`M${fx - mw},${my + lc} Q${fx},${my + ctrl} ${fx + mw},${my + rc}`} stroke="#3b1d17" strokeWidth={6} fill="none" strokeLinecap="round" />
    );
  }

  const nd = facing >= 0 ? 1 : -1;
  const nose = (
    <path
      d={`M${fx + 4 * nd},${-2} L${fx + 1 * nd},${32} L${fx + 17 * nd},${33}`}
      stroke={skin.shade}
      strokeWidth={6}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );

  return (
    <g>
      <defs>
        <radialGradient id={gid} cx={0.5 + light.side * 0.18} cy={0.3} r={0.75}>
          <stop offset="0" stopColor={skin.light} />
          <stop offset="0.5" stopColor={skin.base} />
          <stop offset="1" stopColor={skin.shade} />
        </radialGradient>
        <linearGradient id={rid} x1={light.side < 0 ? '0' : '1'} x2={light.side < 0 ? '1' : '0'} y1="0" y2="0.2">
          <stop offset="0" stopColor={light.rim} stopOpacity={light.rimStrength} />
          <stop offset="0.22" stopColor={light.rim} stopOpacity={0} />
        </linearGradient>
        <clipPath id={cid}>
          <circle r={R} />
        </clipPath>
      </defs>
      {/* ears */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={s * (R - 6) + fx * 0.3 * -1} cy={8} rx={22} ry={28} fill={skin.base} />
          <ellipse cx={s * (R - 4) + fx * 0.3 * -1} cy={8} rx={10} ry={14} fill={skin.shade} opacity={0.6} />
        </g>
      ))}
      <circle r={R} fill={`url(#${gid})`} />
      <circle r={R - 4} fill="none" stroke={`url(#${rid})`} strokeWidth={10} />
      <g clipPath={`url(#${cid})`}>
        {/* soft jaw shade */}
        <ellipse cx={-light.side * 30} cy={R * 0.95} rx={R * 1.1} ry={R * 0.45} fill={skin.shade} opacity={0.25} />
        {style.beard && (
          <path
            d={`M${-R},-8 Q${-R + 6},${R * 0.9} 0,${R + 4} Q${R - 6},${R * 0.9} ${R},-8 L${R - 18},-6 Q${R - 26},50 ${fx + 46},52 Q${fx + 20},40 ${fx},44 Q${fx - 20},40 ${fx - 46},52 Q${-R + 26},50 ${-R + 18},-6 Z`}
            fill={style.hairColor}
            opacity={0.92}
          />
        )}
        {style.beard && (
          <path d={`M${fx - 34},${54} Q${fx},${38} ${fx + 34},${54} L${fx + 26},${58} Q${fx},${48} ${fx - 26},${58} Z`} fill={style.hairColor} />
        )}
      </g>
      {style.hair === 'quiff' && (
        <g>
          <path
            d={`M${-R - 6},-10 C${-R - 14},-96 -96,-${R + 34} -36,-${R + 36} C -6,-${R + 36} 6,-${R + 18} 28,-${R + 12} C 92,-${R + 2} ${R + 12},-84 ${R + 6},-10 C ${R - 6},-40 ${R - 30},-60 80,-62 C 40,-70 -10,-56 -50,-64 C -80,-68 ${-R + 14},-46 ${-R - 6},-10 Z`}
            fill={hair}
          />
          <path d={`M -86,-${R + 6} C -70,-${R + 30} -40,-${R + 34} -18,-${R + 26}`} stroke="#5a4136" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
          <path d={`M -60,-${R + 0} C -46,-${R + 16} -26,-${R + 20} -6,-${R + 14}`} stroke="#4a3329" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
          <path
            d={`M${light.side * (R + 2)},-20 C${light.side * (R + 4)},-80 ${light.side * 70},-${R + 18} ${light.side * 20},-${R + 26}`}
            stroke={light.rim}
            strokeWidth={6}
            fill="none"
            opacity={light.rimStrength * 0.55}
            strokeLinecap="round"
          />
        </g>
      )}
      {style.hair === 'buzz' && (
        <path
          d={`M${-R},-6 C${-R - 4},-100 -40,-${R + 4} 0,-${R + 4} C 40,-${R + 4} ${R + 4},-100 ${R},-6 C ${R - 10},-50 ${R - 30},-70 60,-74 C 20,-80 -20,-80 -60,-74 C ${-R + 30},-70 ${-R + 10},-50 ${-R},-6 Z`}
          fill={hair}
          opacity={0.95}
        />
      )}
      {style.hair === 'bald' && <ellipse cx={-light.side * -40} cy={-80} rx={36} ry={18} fill="#fff" opacity={0.28} transform={`rotate(${light.side * 20} ${light.side * 40} -80)`} />}
      <g transform={`translate(0,${0})`}>
        {brow(-1)}
        {brow(1)}
        {eye(-1)}
        {eye(1)}
        {style.sunglasses && (
          <g>
            <path d={`M${fx - 76},-8 L${fx + 76},-8`} stroke="#0b0b0e" strokeWidth={6} />
            {[-1, 1].map((s) => (
              <g key={s}>
                <rect x={fx + s * 42 - 33} y={-24} width={66} height={42} rx={14} fill="#0b0c10" />
                <path d={`M${fx + s * 42 - 18},-14 L${fx + s * 42 - 2},-18`} stroke="#9fb4c8" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
              </g>
            ))}
          </g>
        )}
        {nose}
        {mouth}
      </g>
    </g>
  );
};
