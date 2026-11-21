import React from 'react';
import {random} from 'remotion';
import {useUid} from '../../lib/useUid';
import {Svg} from './kit';

/* ================================================================== interrogation room */
/** Small interrogation room: concrete walls, mirror window, door, metal table, one hanging lamp. `swing` = lamp angle (deg). */
export const InterrogationRoom: React.FC<{swing?: number; px?: number; floorY?: number; lampOn?: number; children?: React.ReactNode}> = ({swing = 0, px = 0, floorY = 1300, lampOn = 1, children}) => {
  const id = useUid('ir');
  const lx = 540 + px * 0.2;
  const ly = 760;
  const a = (swing * Math.PI) / 180;
  const bx = lx + Math.sin(a) * 560;
  const by = 200 + Math.cos(a) * 560;
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}w`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#151820" />
          <stop offset="0.6" stopColor="#2c323d" />
          <stop offset="1" stopColor="#3a414e" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2a2e36" />
          <stop offset="1" stopColor="#0f1115" />
        </linearGradient>
        <linearGradient id={`${id}m`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3b4656" />
          <stop offset="0.45" stopColor="#1d242f" />
          <stop offset="0.5" stopColor="#59677a" />
          <stop offset="0.56" stopColor="#1d242f" />
          <stop offset="1" stopColor="#111620" />
        </linearGradient>
        <radialGradient id={`${id}c`} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#fff2c0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff2c0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-200} y={-200} width={1480} height={floorY + 200} fill={`url(#${id}w)`} />
      {/* wall panel seams */}
      {[-120, 160, 440, 720, 1000].map((x) => (
        <line key={x} x1={x + px * 0.6} y1={0} x2={x + px * 0.6} y2={floorY} stroke="#000" strokeWidth={4} opacity={0.25} />
      ))}
      {/* mirror window */}
      <g transform={`translate(${px * 0.6},0)`}>
        <rect x={150} y={560} width={560} height={360} rx={6} fill="#0b0d12" />
        <rect x={166} y={576} width={528} height={328} fill={`url(#${id}m)`} />
        <rect x={166} y={576} width={528} height={328} fill="none" stroke="#7b8796" strokeWidth={3} opacity={0.5} />
        <text x={430} y={960} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={26} letterSpacing={6} fill="#6c7584">
          OBSERVAÇÃO
        </text>
        {/* door */}
        <rect x={830} y={640} width={250} height={floorY - 640} fill="#262b33" />
        <rect x={850} y={660} width={210} height={floorY - 660} fill="#3a414c" />
        <rect x={880} y={700} width={150} height={90} fill="#141820" />
        <circle cx={875} cy={1000} r={12} fill="#a8b0bb" />
        <text x={955} y={760} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={36} fill="#c9d0da">
          SALA 3
        </text>
      </g>
      {/* floor */}
      <rect x={-200} y={floorY} width={1480} height={1920 - floorY + 200} fill={`url(#${id}f)`} />
      <line x1={-200} y1={floorY} x2={1280} y2={floorY} stroke="#000" strokeWidth={6} opacity={0.5} />
      {/* light cone */}
      <path d={`M ${bx - 60},${by + 40} L ${bx - 520},${floorY + 420} L ${bx + 520},${floorY + 420} L ${bx + 60},${by + 40} Z`} fill={`url(#${id}c)`} opacity={lampOn} />
      <ellipse cx={bx} cy={floorY + 150} rx={420} ry={80} fill="#fff2c0" opacity={0.12 * lampOn} />
      {children}
      {/* lamp */}
      <line x1={lx} y1={-200} x2={bx} y2={by} stroke="#0b0b0d" strokeWidth={6} />
      <g transform={`rotate(${-swing} ${bx} ${by})`}>
        <path d={`M ${bx - 30},${by} L ${bx + 30},${by} L ${bx + 90},${by + 70} L ${bx - 90},${by + 70} Z`} fill="#2d3037" />
        <path d={`M ${bx - 30},${by} L ${bx + 30},${by} L ${bx + 40},${by + 14} L ${bx - 40},${by + 14} Z`} fill="#4a4e58" />
        <ellipse cx={bx} cy={by + 70} rx={90} ry={12} fill="#fff6d0" opacity={lampOn} />
        <circle cx={bx} cy={by + 74} r={22} fill="#fffbe8" opacity={lampOn} />
      </g>
    </Svg>
  );
};

/** Metal table + empty chair (foreground of the interrogation room). */
export const InterTable: React.FC<{x: number; y: number; s?: number; folder?: number}> = ({x, y, s = 1, folder = 1}) => (
  <Svg>
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-290} y={20} width={580} height={240} fill="#4a5059" />
      <rect x={-290} y={20} width={580} height={14} fill="#2d3138" />
      <rect x={-300} y={-10} width={600} height={34} rx={6} fill="#8b939e" />
      <rect x={-300} y={-10} width={600} height={8} rx={4} fill="#c2c9d2" />
      <rect x={-280} y={24} width={22} height={260} fill="#5d646e" />
      <rect x={258} y={24} width={22} height={260} fill="#5d646e" />
      {/* folder */}
      <g opacity={folder} transform="rotate(-6)">
        <rect x={-120} y={-30} width={200} height={26} rx={3} fill="#d9b46a" />
        <rect x={-110} y={-36} width={70} height={10} rx={3} fill="#d9b46a" />
        <text x={-20} y={-11} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={16} fill="#7a1f1f">
          SUSPEITO
        </text>
      </g>
      {/* paper cup */}
      <path d="M 150,-60 L 190,-60 L 184,-10 L 156,-10 Z" fill="#eee" />
    </g>
  </Svg>
);

/* ================================================================== Davi's home */
/** Living room at night: warm wall, window with city lights, floor, shelf + plant + floor lamp. */
export const HomeRoom: React.FC<{px?: number; floorY?: number; t?: number}> = ({px = 0, floorY = 1380, t = 0}) => {
  const id = useUid('hr');
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}w`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6b4a5c" />
          <stop offset="1" stopColor="#c98a6a" />
        </linearGradient>
        <linearGradient id={`${id}n`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#141a3a" />
          <stop offset="1" stopColor="#3b3466" />
        </linearGradient>
        <radialGradient id={`${id}l`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-200} y={-200} width={1480} height={floorY + 200} fill={`url(#${id}w)`} />
      <g transform={`translate(${px * 0.5},0)`}>
        {/* window */}
        <rect x={90} y={420} width={420} height={560} rx={10} fill="#f1d9bc" />
        <rect x={110} y={440} width={380} height={520} fill={`url(#${id}n)`} />
        {Array.from({length: 9}).map((_, i) => {
          const r = (k: string) => random(`hb${i}${k}`);
          const bw = 40 + r('w') * 50;
          const bx = 110 + i * 44;
          const bh = 160 + r('h') * 300;
          return (
            <g key={i}>
              <rect x={bx} y={960 - bh} width={bw} height={bh} fill="#232847" />
              {Array.from({length: 8}).map((__, j) =>
                random(`hw${i}-${j}`) < 0.45 ? <rect key={j} x={bx + 8 + (j % 2) * 18} y={960 - bh + 14 + Math.floor(j / 2) * 34} width={9} height={14} fill="#ffd77a" opacity={0.85} /> : null,
              )}
            </g>
          );
        })}
        <circle cx={420} cy={520} r={30} fill="#fff6dc" opacity={0.9} />
        <rect x={296} y={440} width={10} height={520} fill="#f1d9bc" />
        <rect x={110} y={690} width={380} height={10} fill="#f1d9bc" />
        {/* shelf */}
        <rect x={640} y={560} width={360} height={18} fill="#6b3f26" />
        <rect x={660} y={470} width={40} height={90} fill="#3d8a6b" />
        <rect x={706} y={490} width={34} height={70} fill="#b8483e" />
        <rect x={746} y={480} width={30} height={80} fill="#e0a92a" />
        <path d="M 900,560 Q 880,470 920,440 Q 950,480 940,560 Z" fill="#3d8a6b" />
        <rect x={895} y={530} width={50} height={30} rx={6} fill="#c96f45" />
        {/* framed atom poster */}
        <rect x={660} y={720} width={240} height={180} fill="#f4ecd8" stroke="#6b3f26" strokeWidth={10} />
        <g stroke="#2f5fa8" strokeWidth={5} fill="none">
          <ellipse cx={780} cy={810} rx={80} ry={26} />
          <ellipse cx={780} cy={810} rx={80} ry={26} transform="rotate(60 780 810)" />
          <ellipse cx={780} cy={810} rx={80} ry={26} transform="rotate(-60 780 810)" />
        </g>
        <circle cx={780} cy={810} r={10} fill="#d23c3c" />
      </g>
      {/* floor */}
      <rect x={-200} y={floorY} width={1480} height={1920 - floorY + 200} fill="#6b4329" />
      {Array.from({length: 8}).map((_, i) => (
        <line key={i} x1={-200} y1={floorY + 30 + i * i * 12} x2={1280} y2={floorY + 30 + i * i * 12} stroke="#4f3020" strokeWidth={4} opacity={0.6} />
      ))}
      <rect x={-200} y={floorY - 14} width={1480} height={16} fill="#e9d3b2" />
      {/* lamp glow */}
      <ellipse cx={1000 + px * 0.5} cy={760} rx={340} ry={420} fill={`url(#${id}l)`} opacity={0.8 + Math.sin(t * 3) * 0.02} />
    </Svg>
  );
};

/** Couch (teal), front view, bottom-centre (x,y), width w px. */
export const Sofa: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
  const s = w / 800;
  return (
    <Svg>
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <rect x={-400} y={-470} width={800} height={300} rx={60} fill="#2b7c7a" />
        <rect x={-400} y={-470} width={800} height={40} rx={20} fill="#46a3a0" opacity={0.6} />
        <rect x={-440} y={-300} width={120} height={260} rx={50} fill="#256b69" />
        <rect x={320} y={-300} width={120} height={260} rx={50} fill="#256b69" />
        <rect x={-330} y={-240} width={660} height={180} rx={40} fill="#2f8a87" />
        <line x1={0} y1={-236} x2={0} y2={-64} stroke="#256b69" strokeWidth={6} />
        <rect x={-400} y={-60} width={800} height={30} rx={10} fill="#1f5958" />
        <rect x={-370} y={-30} width={30} height={30} fill="#3a2616" />
        <rect x={340} y={-30} width={30} height={30} fill="#3a2616" />
      </g>
    </Svg>
  );
};

/** Small side table, bottom-centre (x,y), top surface at y - 300*s. */
export const SideTable: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <Svg>
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-170} y={-300} width={340} height={30} rx={8} fill="#8a5a36" />
      <rect x={-170} y={-300} width={340} height={8} rx={4} fill="#b07a50" />
      <rect x={-140} y={-270} width={22} height={270} fill="#6b4329" />
      <rect x={118} y={-270} width={22} height={270} fill="#6b4329" />
    </g>
  </Svg>
);

/** Glass of water at bottom-centre (x,y), height h px, rotation rot (deg, around the bottom). `shatter` 0..1 replaces it with shards + splash. */
export const WaterGlass: React.FC<{x: number; y: number; h: number; rot?: number; shatter?: number}> = ({x, y, h, rot = 0, shatter = 0}) => {
  const w = h * 0.62;
  if (shatter > 0) {
    return (
      <Svg>
        {Array.from({length: 14}).map((_, i) => {
          const r = (k: string) => random(`sh${i}${k}`);
          const a = -Math.PI * (0.1 + r('a') * 0.8);
          const d = shatter * (80 + r('d') * 260) * (h / 160);
          const cx = x + Math.cos(a) * d;
          const cy = y + Math.sin(a) * d * 0.8 + shatter * shatter * 160;
          const sz = 10 + r('s') * 22;
          return <path key={i} d={`M${cx},${cy - sz} L${cx + sz * 0.6},${cy + sz * 0.4} L${cx - sz * 0.5},${cy + sz * 0.6} Z`} fill="#d8f2ff" stroke="#8fc6e0" strokeWidth={2} opacity={1 - shatter * 0.6} transform={`rotate(${r('r') * 360 * shatter} ${cx} ${cy})`} />;
        })}
        <ellipse cx={x} cy={y + 4} rx={h * (0.4 + shatter * 1.4)} ry={h * (0.06 + shatter * 0.12)} fill="#8fd0f0" opacity={0.5} />
      </Svg>
    );
  }
  return (
    <Svg>
      <g transform={`rotate(${rot} ${x} ${y})`}>
        <path d={`M${x - w / 2},${y - h} L${x + w / 2},${y - h} L${x + w * 0.4},${y} L${x - w * 0.4},${y} Z`} fill="#d8f2ff" opacity={0.45} stroke="#e8fbff" strokeWidth={4} />
        <path d={`M${x - w * 0.47},${y - h * 0.62} L${x + w * 0.47},${y - h * 0.62} L${x + w * 0.4},${y} L${x - w * 0.4},${y} Z`} fill="#5fb8e8" opacity={0.6} />
        <line x1={x - w * 0.3} y1={y - h * 0.9} x2={x - w * 0.24} y2={y - h * 0.15} stroke="#fff" strokeWidth={5} opacity={0.7} strokeLinecap="round" />
      </g>
    </Svg>
  );
};

/** Folded towel on Davi's head (cooling down). Place at the head top (x,y) px, width w. */
export const Towel: React.FC<{x: number; y: number; w: number; rot?: number}> = ({x, y, w, rot = 0}) => (
  <Svg>
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${w / 300})`}>
      <path d="M -160,10 Q -170,-70 -80,-96 Q 0,-118 80,-96 Q 170,-70 160,10 Q 120,-14 0,-16 Q -120,-14 -160,10 Z" fill="#f4f6fa" />
      <path d="M -160,10 Q -180,90 -150,150 L -110,140 Q -126,70 -110,0 Z" fill="#e3e8f0" />
      <path d="M -140,-40 Q 0,-70 140,-40" stroke="#7fb6e0" strokeWidth={14} fill="none" />
      <path d="M -150,-20 Q 0,-50 150,-20" stroke="#7fb6e0" strokeWidth={6} fill="none" opacity={0.7} />
    </g>
  </Svg>
);
