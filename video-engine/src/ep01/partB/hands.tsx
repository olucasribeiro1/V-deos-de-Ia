import React from 'react';
import {useUid} from '../../lib/useUid';
import {lerp} from '../../lib/anim';
import type {Tone} from '../../characters/types';
import {AcaiCup} from './kit';

type Pt = [number, number];
const R = (d: number) => (d * Math.PI) / 180;

/** Chain of tapered phalanges. a0 = base direction (deg, 0 = +x, 90 = down), curls are cumulative bends. */
const chain = (k: Pt, a0: number, lens: number[], curls: number[]): Pt[] => {
  const pts: Pt[] = [k];
  let a = a0;
  lens.forEach((l, i) => {
    a += curls[i];
    const p = pts[pts.length - 1];
    pts.push([p[0] + Math.cos(R(a)) * l, p[1] + Math.sin(R(a)) * l]);
  });
  return pts;
};

const Finger: React.FC<{pts: Pt[]; ws: number[]; fill: string; outline: string; hi: string; crease: string; hiOp?: number}> = ({pts, ws, fill, outline, hi, crease, hiOp = 0.5}) => (
  <g>
    {pts.slice(1).map((p, i) => (
      <line key={'o' + i} x1={pts[i][0]} y1={pts[i][1]} x2={p[0]} y2={p[1]} stroke={outline} strokeWidth={ws[i] + 7} strokeLinecap="round" />
    ))}
    {pts.slice(1).map((p, i) => (
      <line key={'f' + i} x1={pts[i][0]} y1={pts[i][1]} x2={p[0]} y2={p[1]} stroke={fill} strokeWidth={ws[i]} strokeLinecap="round" />
    ))}
    {pts.slice(1).map((p, i) => {
      const dx = p[0] - pts[i][0];
      const dy = p[1] - pts[i][1];
      const l = Math.hypot(dx, dy) || 1;
      const nx = (dy / l) * ws[i] * 0.28;
      const ny = (-dx / l) * ws[i] * 0.28;
      const off = nx * (ny < 0 ? 1 : -1);
      const sgn = ny < 0 ? 1 : -1;
      return (
        <line key={'h' + i} x1={pts[i][0] + nx * sgn + off * 0} y1={pts[i][1] + ny * sgn} x2={p[0] + nx * sgn} y2={p[1] + ny * sgn} stroke={hi} strokeWidth={ws[i] * 0.16} strokeLinecap="round" opacity={hiOp} />
      );
    })}
    {/* joint creases */}
    {pts.slice(1, -1).map((p, i) => {
      const dx = pts[i + 2][0] - pts[i][0];
      const dy = pts[i + 2][1] - pts[i][1];
      const l = Math.hypot(dx, dy) || 1;
      const nx = (-dy / l) * ws[i] * 0.36;
      const ny = (dx / l) * ws[i] * 0.36;
      return <path key={'c' + i} d={`M${p[0] - nx},${p[1] - ny} Q${p[0] + (dx / l) * 6},${p[1] + (dy / l) * 6} ${p[0] + nx},${p[1] + ny}`} stroke={crease} strokeWidth={3} fill="none" opacity={0.7} />;
    })}
  </g>
);

const LEATHER = {fill: '#1d1e24', outline: '#040405', hi: '#8a90a0', crease: '#000'};

/**
 * Black leather glove (suit sleeve from the right edge) closing around a vertical arm at (ax, ay).
 * Four segmented, tapered fingers wrap the front and curl round the far edge; the thumb wraps from below.
 */
export const Glove2: React.FC<{ax: number; ay: number; aw: number; reach: number; grip: number; rim?: string}> = ({ax, ay, aw, reach, grip, rim = '#ffd08a'}) => {
  const gid = useUid('gl');
  const sid = useUid('su');
  const bx = ax + aw - 30 + (1 - reach) * 780;
  const span = aw * 2 - 10;
  const fy = [ay - 78, ay - 30, ay + 16, ay + 58];
  const fw = [44, 46, 44, 38];
  const fl = [1, 1.06, 1, 0.84];
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5c616e" />
          <stop offset="0.22" stopColor="#25262d" />
          <stop offset="1" stopColor="#0a0a0d" />
        </linearGradient>
        <linearGradient id={sid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6c717c" />
          <stop offset="0.3" stopColor="#4a4e57" />
          <stop offset="1" stopColor="#2c2f36" />
        </linearGradient>
      </defs>
      {/* suit sleeve + shirt cuff */}
      <path d={`M${bx + 225},${ay - 128} L 1400,${ay - 190} L 1400,${ay + 190} L${bx + 225},${ay + 140} Z`} fill={`url(#${sid})`} />
      <path d={`M${bx + 300},${ay - 126} Q ${bx + 600},${ay - 150} 1400,${ay - 170}`} stroke={rim} strokeWidth={6} fill="none" opacity={0.55} />
      <path d={`M${bx + 420},${ay - 120} q 30,120 0,250`} stroke="#2c2f36" strokeWidth={6} fill="none" opacity={0.6} />
      <rect x={bx + 190} y={ay - 122} width={52} height={256} rx={14} fill="#eef0f3" />
      <rect x={bx + 208} y={ay - 6} width={16} height={16} rx={3} fill="#c9b27a" />
      {/* thumb (behind fingers, wraps from the lower palm) */}
      <Finger
        pts={chain([bx + 70, ay + 104], lerp(120, 200, grip), [lerp(96, 110, grip), lerp(80, 90, grip)], [0, lerp(10, 18, grip)])}
        ws={[60, 52]}
        {...LEATHER}
      />
      {/* back of the hand with glove points */}
      <path
        d={`M${bx + 4},${ay - 104} Q${bx + 70},${ay - 132} ${bx + 210},${ay - 108} L${bx + 214},${ay + 112} Q${bx + 120},${ay + 150} ${bx + 30},${ay + 110} Q${bx - 10},${ay} ${bx + 4},${ay - 104} Z`}
        fill={`url(#${gid})`}
        stroke="#040405"
        strokeWidth={4}
      />
      {[-50, 0, 50].map((o, i) => (
        <path key={i} d={`M${bx + 70 + i * 6},${ay + o - 20} Q ${bx + 130},${ay + o * 0.8} ${bx + 180},${ay + o * 0.6 + 10}`} stroke="#3c404b" strokeWidth={3} strokeDasharray="7 6" fill="none" />
      ))}
      <path d={`M${bx + 20},${ay - 96} Q${bx + 110},${ay - 124} ${bx + 200},${ay - 104}`} stroke={rim} strokeWidth={5} fill="none" opacity={0.6} />
      {/* fingers: knuckle at back-of-hand left edge, wrap leftwards across the front */}
      {fy.map((y, i) => {
        const L = span * fl[i];
        const lens = [lerp(L * 0.42, L * 0.46, grip), lerp(L * 0.34, L * 0.38, grip), lerp(L * 0.26, L * 0.12, grip)];
        const a0 = lerp(205 + i * 5, 176 + i * 1.5, grip);
        const curls = [0, lerp(-6, 2, grip), lerp(-4, 62, grip)];
        return <Finger key={i} pts={chain([bx + 14, y], a0, lens, curls)} ws={[fw[i], fw[i] - 4, fw[i] - 8]} {...LEATHER} />;
      })}
      {/* knuckle bumps */}
      {fy.map((y, i) => (
        <ellipse key={i} cx={bx + 18} cy={y - 2} rx={18} ry={fw[i] * 0.5} fill="#2a2c33" stroke="#040405" strokeWidth={3} />
      ))}
      {fy.map((y, i) => (
        <path key={'k' + i} d={`M${bx + 10},${y - fw[i] * 0.3} q 10,-6 20,0`} stroke="#9aa0ae" strokeWidth={3} fill="none" opacity={0.5} />
      ))}
    </g>
  );
};

/**
 * Davi's forearm hanging from the top of frame in the yellow hoodie (organic, tapered sleeve with folds),
 * hand at the bottom holding an açaí cup. `squeeze` pinches the sleeve at gripY.
 */
export const DaviForearm: React.FC<{x: number; wristY: number; sleeve: Tone; skin: Tone; squeeze?: number; gripY: number; tense?: number; cup?: boolean}> = ({
  x,
  wristY,
  sleeve,
  skin,
  squeeze = 0,
  gripY,
  tense = 0,
  cup = true,
}) => {
  const sid = useUid('sl');
  const kid = useUid('sk');
  const pin = squeeze * 18;
  const cuffTop = wristY - 120;
  // organic outline: wide at the elbow, bulge, taper to the cuff
  const L = [
    [x - 168, -80],
    [x - 182, 220],
    [x - 160, gripY - 140],
    [x - 128 + pin, gripY],
    [x - 118, cuffTop],
  ];
  const Rr = [
    [x + 150, -80],
    [x + 160, 260],
    [x + 146, gripY - 160],
    [x + 122 - pin, gripY],
    [x + 116, cuffTop],
  ];
  const sleevePath =
    `M${L[0][0]},${L[0][1]} C ${L[1][0]},${L[1][1]} ${L[2][0]},${L[2][1]} ${L[3][0]},${L[3][1]} Q ${L[4][0] - 6},${(L[3][1] + L[4][1]) / 2} ${L[4][0]},${L[4][1]} ` +
    `L ${Rr[4][0]},${Rr[4][1]} Q ${Rr[4][0] + 6},${(Rr[3][1] + Rr[4][1]) / 2} ${Rr[3][0]},${Rr[3][1]} C ${Rr[2][0]},${Rr[2][1]} ${Rr[1][0]},${Rr[1][1]} ${Rr[0][0]},${Rr[0][1]} Z`;
  const cupY = wristY + 250;
  return (
    <g>
      <defs>
        <linearGradient id={sid} x1="0" x2="1">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset="0.06" stopColor={sleeve.light} />
          <stop offset="0.35" stopColor={sleeve.base} />
          <stop offset="0.72" stopColor={sleeve.base} />
          <stop offset="1" stopColor={sleeve.shade} />
        </linearGradient>
        <linearGradient id={kid} x1="0" x2="1">
          <stop offset="0" stopColor={skin.light} />
          <stop offset="0.45" stopColor={skin.base} />
          <stop offset="1" stopColor={skin.shade} />
        </linearGradient>
      </defs>
      {/* wrist + back of hand behind the cup */}
      <path d={`M${x - 80},${wristY - 30} L${x + 84},${wristY - 30} C ${x + 96},${wristY + 80} ${x + 120},${wristY + 150} ${x + 110},${cupY + 40} L ${x - 60},${cupY + 40} C ${x - 96},${wristY + 150} ${x - 90},${wristY + 80} ${x - 80},${wristY - 30} Z`} fill={`url(#${kid})`} />
      <path d={`M${x + 20},${wristY + 30} Q ${x + 40},${wristY + 110} ${x + 30},${wristY + 160}`} stroke={skin.shade} strokeWidth={5} fill="none" opacity={0.5} />
      {cup && <AcaiCup x={x - 40} y={cupY + 40} h={300} rot={-4} />}
      {/* thumb over the cup rim side */}
      <Finger pts={chain([x - 70, wristY + 120], 115 - tense * 8, [70, 62], [0, 18])} ws={[50, 44]} fill={skin.base} outline={skin.shade} hi={skin.light} crease={skin.shade} hiOp={0.7} />
      {/* fingers curled round the front of the cup */}
      {[0, 1, 2, 3].map((i) => {
        const y = wristY + 190 + i * 46;
        return <Finger key={i} pts={chain([x + 96, y], 180 + tense * 4, [84 - i * 4, 62 - i * 5, 30], [0, 10, 40])} ws={[44 - i * 2, 40 - i * 2, 34 - i * 2]} fill={i === 3 ? skin.shade : skin.base} outline={skin.shade} hi={skin.light} crease={skin.shade} hiOp={0.7} />;
      })}
      {/* sleeve */}
      <path d={sleevePath} fill={`url(#${sid})`} />
      <path d={sleevePath} fill="none" stroke={sleeve.shade} strokeWidth={4} opacity={0.5} />
      {[
        [x - 120, 120, 150, 40],
        [x - 60, 300, 140, 26],
        [x - 140, 470, 120, 30],
        [x + 10, 520, 110, -26],
      ].map(([sx, sy, len, c], i) => (
        <g key={i}>
          <path d={`M${sx},${sy} q ${len * 0.5},${c} ${len},${c * 0.3}`} stroke={sleeve.shade} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.5} />
          <path d={`M${sx + 4},${sy - 9} q ${len * 0.5},${c} ${len},${c * 0.3}`} stroke={sleeve.light} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.45} />
        </g>
      ))}
      {/* ribbed cuff */}
      <path d={`M${x - 120},${cuffTop} L${x + 118},${cuffTop} L${x + 108},${wristY} Q${x},${wristY + 16} ${x - 110},${wristY} Z`} fill={sleeve.shade} />
      {Array.from({length: 12}).map((_, i) => {
        const rx = x - 104 + i * 19;
        return <line key={i} x1={rx} y1={cuffTop + 8} x2={rx} y2={wristY - 2} stroke="#8a5c12" strokeWidth={4} opacity={0.55} />;
      })}
      {/* bunching from the grip */}
      {squeeze > 0.05 &&
        [-1, 1].map((s) =>
          [0, 1, 2].map((k) => (
            <path key={`${s}${k}`} d={`M${x + s * 110},${gripY - 70 - k * 46} q ${-s * 40},18 ${-s * 86},${-8 - k * 12}`} stroke={sleeve.shade} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.6 * squeeze} />
          )),
        )}
    </g>
  );
};

/**
 * Gloved hand, fingers up, back of the hand to camera, being pulled on: the other glove pinches
 * the cuff and tugs it down (`tug` 0..1), then the fingers flex (`flex` 0..1).
 */
export const GloveOn: React.FC<{x: number; y: number; tug: number; flex: number; rim?: string}> = ({x, y, tug, flex, rim = '#7fd8ff'}) => {
  const gid = useUid('go');
  const cuffY = y + 170 + tug * 70;
  const fingers = [-1.5, -0.5, 0.5, 1.5].map((k, i) => {
    const spread = k * lerp(5, 9, flex);
    const curl = flex * (i === 0 ? 30 : 38);
    const L = [180, 196, 188, 150][i];
    return chain([x + k * 56, y - 150], -90 + spread, [L * 0.45, L * 0.33, L * 0.26], [0, curl * 0.5, curl * 0.7]);
  });
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#0a0a0d" />
          <stop offset="0.65" stopColor="#24262d" />
          <stop offset="0.92" stopColor="#5c616e" />
          <stop offset="1" stopColor={rim} />
        </linearGradient>
      </defs>
      {/* suit sleeve + shirt cuff */}
      <path d={`M${x - 170},${y + 2000} L${x - 150},${y + 300} L${x + 160},${y + 300} L${x + 190},${y + 2000} Z`} fill="#2c2f36" />
      <path d={`M${x + 150},${y + 300} L${x + 180},${y + 2000}`} stroke={rim} strokeWidth={6} opacity={0.5} />
      <rect x={x - 150} y={y + 250} width={300} height={70} rx={16} fill="#dfe3ea" />
      {/* thumb */}
      <Finger pts={chain([x - 120, y + 20], lerp(-150, -130, flex), [90, 80], [0, lerp(12, 30, flex)])} ws={[62, 54]} {...LEATHER} hi={rim} />
      {/* back of hand + cuff of glove */}
      <path d={`M${x - 150},${y - 150} Q${x},${y - 190} ${x + 150},${y - 150} L${x + 140},${cuffY} L${x - 140},${cuffY} Z`} fill={`url(#${gid})`} stroke="#040405" strokeWidth={4} />
      <path d={`M${x - 146},${cuffY - 60} L${x + 144},${cuffY - 60} L${x + 150},${cuffY} L${x - 150},${cuffY} Z`} fill="#141519" stroke="#040405" strokeWidth={3} />
      <circle cx={x + 90} cy={cuffY - 30} r={12} fill="#7b808d" stroke="#040405" strokeWidth={3} />
      {[-60, 0, 60].map((o) => (
        <path key={o} d={`M${x + o * 0.6},${y - 130} L${x + o},${y + 60}`} stroke="#3c404b" strokeWidth={3} strokeDasharray="8 7" />
      ))}
      {fingers.map((pts, i) => (
        <Finger key={i} pts={pts} ws={[54, 50, 46]} {...LEATHER} hi={rim} hiOp={0.6} />
      ))}
      {/* other hand pinching the cuff */}
      <g transform={`translate(${x - 180},${cuffY + 10})`}>
        <Finger pts={chain([-60, 70], -20, [80, 70], [0, -10])} ws={[50, 44]} {...LEATHER} />
        <Finger pts={chain([-70, 120], -8, [90, 80], [0, -24])} ws={[52, 46]} {...LEATHER} />
      </g>
    </g>
  );
};
