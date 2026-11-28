import React from 'react';
import {useUid} from '../lib/useUid';

/**
 * Billboard props for the beach set. Each one is drawn in metres * 100 units with
 * the origin at its base (y up is negative) and exposes its size in metres.
 */
export type PropKind = 'palm' | 'kiosk' | 'lamp' | 'umbrella' | 'bench' | 'person';

export const PROP_SIZE: Record<PropKind, {w: number; h: number}> = {
  palm: {w: 7, h: 10},
  kiosk: {w: 5.4, h: 3.6},
  lamp: {w: 1.4, h: 5.2},
  umbrella: {w: 2.4, h: 2.4},
  bench: {w: 2, h: 0.9},
  person: {w: 0.7, h: 1.75},
};

export const Palm: React.FC<{seed?: number; sway?: number}> = ({seed = 0, sway = 0}) => {
  const id = useUid('palm');
  const lean = (seed % 2 ? 1 : -1) * (6 + (seed % 3) * 4);
  const topX = lean * 6;
  const fronds = 9;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#ffb874" />
          <stop offset="0.25" stopColor="#7a5338" />
          <stop offset="1" stopColor="#3b2a22" />
        </linearGradient>
        <linearGradient id={id + 'l'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4f6b3a" />
          <stop offset="1" stopColor="#24361f" />
        </linearGradient>
      </defs>
      {/* trunk */}
      <path d={`M -22,0 Q ${topX * 0.2 - 30},-500 ${topX - 12},-930 L ${topX + 12},-930 Q ${topX * 0.2 + 26},-500 22,0 Z`} fill={`url(#${id})`} />
      {Array.from({length: 18}).map((_, i) => {
        const t = i / 18;
        const y = -t * 900 - 20;
        const x = topX * t * t * 0.9 + (topX * 0.2) * Math.sin(t * Math.PI) * 0.6;
        const w = 22 - t * 8;
        return <path key={i} d={`M${x - w},${y} Q${x},${y + 8} ${x + w},${y}`} stroke="#2a1d17" strokeWidth={3} fill="none" opacity={0.5} />;
      })}
      {/* fronds */}
      <g transform={`translate(${topX},-930)`}>
        {Array.from({length: fronds}).map((_, i) => {
          const a = -170 + (i / (fronds - 1)) * 160 + Math.sin(sway + i) * 3;
          const len = 300 + ((i * 37 + seed * 11) % 90);
          const droop = 110 + ((i * 53) % 60);
          const rad = (a * Math.PI) / 180;
          const ex = Math.cos(rad) * len;
          const ey = Math.sin(rad) * len * 0.45 + droop;
          const mx = Math.cos(rad) * len * 0.5;
          const my = Math.sin(rad) * len * 0.5 - 50;
          return (
            <g key={i}>
              <path d={`M0,0 Q${mx},${my - 30} ${ex},${ey} Q${mx},${my + 30} 0,0 Z`} fill={`url(#${id + 'l'})`} />
              <path d={`M0,0 Q${mx},${my} ${ex},${ey}`} stroke="#1c2a17" strokeWidth={4} fill="none" />
              {Array.from({length: 7}).map((__, j) => {
                const t = (j + 1) / 8;
                const px = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * mx + t * t * ex;
                const py = 2 * (1 - t) * t * my + t * t * ey;
                return <path key={j} d={`M${px},${py} l${-12 + Math.cos(rad) * 10},${40 - t * 14}`} stroke="#2e4425" strokeWidth={10} strokeLinecap="round" />;
              })}
            </g>
          );
        })}
        <circle cx={-14} cy={18} r={18} fill="#4a3a1e" />
        <circle cx={14} cy={22} r={17} fill="#3b2e17" />
        <circle cx={0} cy={6} r={16} fill="#5b4824" />
      </g>
    </g>
  );
};

export const Kiosk: React.FC<{sign?: string}> = ({sign = 'AÇAÍ · COCO'}) => {
  const id = useUid('kiosk');
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe3a3" />
          <stop offset="1" stopColor="#f2a65a" />
        </linearGradient>
      </defs>
      {/* deck */}
      <rect x={-270} y={-30} width={540} height={30} fill="#5a4a44" />
      {/* body */}
      <rect x={-210} y={-250} width={420} height={222} fill="#e9e1d4" />
      {/* glass with warm interior */}
      <rect x={-196} y={-236} width={392} height={140} fill={`url(#${id})`} />
      {[-98, 0, 98].map((x) => (
        <rect key={x} x={x - 3} y={-236} width={6} height={140} fill="#cfc5b6" />
      ))}
      <rect x={-150} y={-180} width={60} height={70} fill="#f6c46a" opacity={0.7} />
      <circle cx={70} cy={-150} r={22} fill="#73c26b" opacity={0.6} />
      <rect x={-210} y={-96} width={420} height={14} fill="#c9bba8" />
      <rect x={-200} y={-80} width={400} height={50} fill="#2f7a5a" />
      {/* roof */}
      <path d="M -270,-250 L 270,-250 L 230,-330 L -230,-330 Z" fill="#f2efe8" />
      <path d="M -270,-250 L 270,-250 L 264,-262 L -264,-262 Z" fill="#c7c0b3" />
      {Array.from({length: 8}).map((_, i) => (
        <path key={i} d={`M ${-230 + i * 57.5},-330 L ${-200 + i * 57.5},-330 L ${-218 + i * 68},-250 L ${-260 + i * 68},-250 Z`} fill="#2f7a5a" opacity={i % 2 ? 0 : 0.85} />
      ))}
      <rect x={-120} y={-372} width={240} height={46} rx={8} fill="#1d3b33" />
      <text x={0} y={-340} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={30} fill="#ffd36b" letterSpacing={2}>
        {sign}
      </text>
      {/* stools */}
      {[-150, -50, 50, 150].map((x) => (
        <g key={x}>
          <rect x={x - 4} y={-60} width={8} height={60} fill="#3a2f2b" />
          <ellipse cx={x} cy={-62} rx={22} ry={7} fill="#c0392b" />
        </g>
      ))}
    </g>
  );
};

export const Lamp: React.FC<{on?: boolean}> = ({on = false}) => (
  <g>
    <rect x={-7} y={-500} width={14} height={500} fill="#2f3237" />
    <rect x={-14} y={-60} width={28} height={60} fill="#26282c" />
    <path d="M 0,-500 Q 0,-540 50,-540 L 70,-540" stroke="#2f3237" strokeWidth={10} fill="none" />
    <path d="M 46,-548 L 96,-548 L 88,-526 L 54,-526 Z" fill="#26282c" />
    {on && <ellipse cx={71} cy={-524} rx={20} ry={6} fill="#ffe9b0" />}
  </g>
);

export const Umbrella: React.FC<{color?: string}> = ({color = '#e5533d'}) => (
  <g>
    <rect x={-3} y={-200} width={6} height={200} fill="#efe6d8" />
    <path d="M -120,-170 Q 0,-260 120,-170 Z" fill={color} />
    <path d="M -120,-170 Q -60,-182 -40,-176 Q 0,-188 40,-176 Q 60,-182 120,-170" stroke="#fff" strokeWidth={4} fill="none" opacity={0.5} />
  </g>
);

export const Silhouette: React.FC<{color?: string}> = ({color = '#3b2f3a'}) => (
  <g fill={color}>
    <circle cx={0} cy={-158} r={17} />
    <rect x={-18} y={-140} width={36} height={70} rx={14} />
    <rect x={-16} y={-80} width={13} height={80} rx={6} />
    <rect x={3} y={-80} width={13} height={80} rx={6} />
  </g>
);

export const renderProp = (kind: PropKind, seed: number, t: number) => {
  switch (kind) {
    case 'palm':
      return <Palm seed={seed} sway={t * 0.8 + seed} />;
    case 'kiosk':
      return <Kiosk />;
    case 'lamp':
      return <Lamp />;
    case 'umbrella':
      return <Umbrella color={['#e5533d', '#2b8fbd', '#f0b429', '#ffffff'][seed % 4]} />;
    case 'person':
      return <Silhouette />;
    default:
      return null;
  }
};
