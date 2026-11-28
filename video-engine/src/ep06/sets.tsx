import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../lib/constants';
import {HUD_FONT} from '../lib/fonts';

export {AcademyCourtyard, Crowd} from '../ep03/sets/Academy';
export {Arena} from '../ep03/partB/arena';
export {DaviRoom, Desk} from '../ep03/partA/kit';
export {LabBg} from '../ep02qi/partA/kit';

export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {children}
  </svg>
);

/** Classroom: green board with banana doodles, windows, desks in front. floor at `floor`. */
export const Classroom: React.FC<{px?: number; floor?: number; board?: React.ReactNode}> = ({px = 0, floor = 1420, board}) => (
  <AbsoluteFill style={{background: '#e9dcc0', overflow: 'hidden'}}>
    <Svg>
      <g transform={`translate(${px},0)`}>
        <rect x={-300} y={0} width={W + 600} height={180} fill="#d8c9a8" />
        {[-200, 980].map((x) => (
          <g key={x}>
            <rect x={x} y={380} width={300} height={520} rx={8} fill="#9fd8ff" stroke="#f6f1e4" strokeWidth={20} />
            <line x1={x + 150} y1={380} x2={x + 150} y2={900} stroke="#f6f1e4" strokeWidth={12} />
          </g>
        ))}
        <rect x={150} y={330} width={780} height={520} rx={10} fill="#2f5a46" stroke="#8a6040" strokeWidth={24} />
        <rect x={160} y={830} width={760} height={18} fill="#8a6040" />
        <g fill="none" stroke="#e8efe4" strokeWidth={6} strokeLinecap="round" opacity={0.85}>
          <path d="M 220,420 L 520,420" />
          <path d="M 220,480 L 440,480" />
          <path d="M 600,520 q 60,70 160,0" />
        </g>
        <text x={230} y={620} fontFamily="Oswald" fontSize={56} fill="#e8efe4" opacity={0.9}>2 + 2 = 4</text>
        {board}
      </g>
      <rect x={-20} y={floor} width={W + 40} height={H} fill="#b48a5a" />
      {Array.from({length: 6}).map((_, i) => (
        <line key={i} x1={-20} y1={floor + Math.pow(i / 5, 1.6) * (H - floor)} x2={W + 20} y2={floor + Math.pow(i / 5, 1.6) * (H - floor)} stroke="#9a7246" strokeWidth={4} />
      ))}
    </Svg>
  </AbsoluteFill>
);

/** School hallway with lockers; locker #3 gets the "BANANINHA" graffiti (paint 0..1). */
export const Lockers: React.FC<{px?: number; paint?: number}> = ({px = 0, paint = 0}) => (
  <AbsoluteFill style={{background: '#d9d4c8', overflow: 'hidden'}}>
    <Svg>
      <g transform={`translate(${px},0)`}>
        {Array.from({length: 9}).map((_, i) => {
          const x = -260 + i * 200;
          return (
            <g key={i}>
              <rect x={x} y={380} width={190} height={1060} fill={i % 2 ? '#3c72c4' : '#3567b3'} stroke="#24497f" strokeWidth={6} />
              {[0, 1, 2, 3].map((k) => (
                <rect key={k} x={x + 50} y={440 + k * 18} width={90} height={8} rx={4} fill="#24497f" />
              ))}
              <rect x={x + 150} y={860} width={18} height={60} rx={6} fill="#c9ced8" />
            </g>
          );
        })}
        <g opacity={paint} transform="rotate(-6 540 800)">
          <text x={540} y={860} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={150} fill="#ffd23a" stroke="#6a4a0a" strokeWidth={6} style={{clipPath: `inset(0 ${100 - paint * 100}% 0 0)`}}>
            BANANINHA
          </text>
          <g transform="translate(540,1020) scale(1.1)">
            <path d="M -108,-22 C -80,58 74,62 112,-26 L 122,-40 L 116,-48 C 74,4 -62,12 -100,-34 Z" fill="none" stroke="#ffd23a" strokeWidth={10} />
          </g>
        </g>
      </g>
      <rect x={-20} y={1440} width={W + 40} height={H} fill="#8a8f9a" />
      <rect x={-20} y={1440} width={W + 40} height={16} fill="#6a6f7a" />
    </Svg>
  </AbsoluteFill>
);

/** Kitchen: tiles, counter, fridge. floor at `floor`. */
export const Kitchen: React.FC<{px?: number; floor?: number}> = ({px = 0, floor = 1480}) => (
  <AbsoluteFill style={{background: '#f3ead2', overflow: 'hidden'}}>
    <Svg>
      <g transform={`translate(${px},0)`}>
        {Array.from({length: 12}).map((_, r) =>
          Array.from({length: 14}).map((__, c) => <rect key={`${r}-${c}`} x={-300 + c * 120} y={560 + r * 70} width={116} height={66} fill={(r + c) % 2 ? '#e8f4f0' : '#d6ece6'} />),
        )}
        <rect x={-300} y={360} width={W + 600} height={200} fill="#c98a4a" />
        <rect x={-300} y={1040} width={1100} height={440} fill="#b06e34" />
        <rect x={-300} y={1020} width={1100} height={36} fill="#efe7dc" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-260 + i * 270} y={1090} width={240} height={340} rx={8} fill="#c27c3c" stroke="#8a5424" strokeWidth={5} />
        ))}
        <rect x={820} y={520} width={300} height={960} rx={20} fill="#eef2f6" stroke="#b9c2cc" strokeWidth={6} />
        <line x1={820} y1={860} x2={1120} y2={860} stroke="#b9c2cc" strokeWidth={6} />
        <rect x={845} y={620} width={14} height={180} rx={6} fill="#9aa4b0" />
        {/* fruit bowl */}
        <ellipse cx={300} cy={1010} rx={140} ry={40} fill="#e8e0d4" stroke="#b8ad9c" strokeWidth={4} />
      </g>
      <rect x={-20} y={floor} width={W + 40} height={H} fill="#d8c8b0" />
      {Array.from({length: 10}).map((_, i) => (
        <line key={i} x1={-200 + i * 160} y1={floor} x2={-600 + i * 260} y2={H} stroke="#c2b298" strokeWidth={4} />
      ))}
    </Svg>
  </AbsoluteFill>
);

/** Backyard (day): sky, wooden fence, grass, doghouse. ground at `ground`. */
export const Backyard: React.FC<{px?: number; ground?: number; t?: number}> = ({px = 0, ground = 1420, t = 0}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#5fb4f0, #c8ecff 70%)', overflow: 'hidden'}}>
    <Svg>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${((i * 420 + t * 12) % 1500) - 200},${220 + i * 110})`} opacity={0.9}>
          <ellipse rx={110} ry={40} fill="#fff" />
          <ellipse cx={60} cy={-20} rx={70} ry={40} fill="#fff" />
        </g>
      ))}
      <g transform={`translate(${px},0)`}>
        {Array.from({length: 16}).map((_, i) => (
          <path key={i} d={`M ${-300 + i * 110},${ground} L ${-300 + i * 110},${ground - 520} L ${-245 + i * 110},${ground - 580} L ${-190 + i * 110},${ground - 520} L ${-190 + i * 110},${ground} Z`} fill={i % 2 ? '#b8834e' : '#c99460'} stroke="#8a5a30" strokeWidth={4} />
        ))}
        <rect x={-300} y={ground - 420} width={1800} height={22} fill="#8a5a30" />
        <rect x={-300} y={ground - 160} width={1800} height={22} fill="#8a5a30" />
        {/* doghouse */}
        <g transform="translate(860,0)">
          <rect x={-130} y={ground - 260} width={260} height={260} fill="#c9473a" />
          <path d={`M -160,${ground - 250} L 0,${ground - 400} L 160,${ground - 250} Z`} fill="#7a2a22" />
          <path d={`M -60,${ground} L -60,${ground - 120} Q 0,${ground - 190} 60,${ground - 120} L 60,${ground} Z`} fill="#3a1a14" />
        </g>
      </g>
      <rect x={-20} y={ground} width={W + 40} height={H} fill="#6cbf4a" />
      {Array.from({length: 60}).map((_, i) => (
        <path key={i} d={`M ${random(`gx${i}`) * W},${ground + 20 + random(`gy${i}`) * (H - ground)} l -8,-22 m 8,22 l 8,-24`} stroke="#4f9a34" strokeWidth={4} />
      ))}
    </Svg>
  </AbsoluteFill>
);

/** Airport security: big windows with a plane, metal detector arch at `ax`, tiled floor. `alarm` 0..1 flashes red. */
export const Airport: React.FC<{px?: number; floor?: number; ax?: number; alarm?: number; t?: number}> = ({px = 0, floor = 1460, ax = 540, alarm = 0, t = 0}) => {
  const flash = alarm > 0 ? (Math.floor(t * 8) % 2 ? alarm : alarm * 0.3) : 0;
  return (
    <AbsoluteFill style={{background: '#cfd8e2', overflow: 'hidden'}}>
      <Svg>
        <g transform={`translate(${px * 0.5},0)`}>
          <rect x={-300} y={180} width={W + 600} height={700} fill="#9fd2f6" />
          {Array.from({length: 9}).map((_, i) => (
            <rect key={i} x={-300 + i * 220} y={180} width={14} height={700} fill="#6a7a8a" />
          ))}
          <g transform="translate(620,560) scale(1.3)">
            <path d="M -260,0 Q -240,-40 -160,-40 L 220,-40 Q 280,-40 300,0 Q 280,30 220,30 L -160,30 Q -240,30 -260,0 Z" fill="#f4f6f8" stroke="#8a96a4" strokeWidth={4} />
            <path d="M -20,-30 L -120,-150 L -60,-150 L 80,-30 Z" fill="#d9dfe6" stroke="#8a96a4" strokeWidth={4} />
            <path d="M 200,-30 L 250,-120 L 280,-120 L 270,-20 Z" fill="#d23c3c" />
            {Array.from({length: 9}).map((_, i) => (
              <circle key={i} cx={-140 + i * 36} cy={-12} r={8} fill="#4a6a8a" />
            ))}
          </g>
          <rect x={-300} y={880} width={W + 600} height={40} fill="#6a7a8a" />
          <text x={140} y={300} fontFamily={HUD_FONT} fontWeight={700} fontSize={48} fill="#fff">✈ EMBARQUE</text>
        </g>
        <rect x={-20} y={floor} width={W + 40} height={H} fill="#e8ecf0" />
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={-400 + i * 180} y1={floor} x2={-1200 + i * 330} y2={H} stroke="#c9d0d8" strokeWidth={4} />
        ))}
        <g transform={`translate(${ax + px},0)`}>
          <rect x={-230} y={floor - 860} width={70} height={860} rx={10} fill="#9aa4b0" stroke="#6a7480" strokeWidth={5} />
          <rect x={160} y={floor - 860} width={70} height={860} rx={10} fill="#9aa4b0" stroke="#6a7480" strokeWidth={5} />
          <rect x={-230} y={floor - 920} width={460} height={90} rx={14} fill="#7a8490" stroke="#5a6470" strokeWidth={5} />
          <circle cx={0} cy={floor - 875} r={26} fill={flash > 0 ? '#ff3b3b' : '#3a4450'} />
          {flash > 0 && <circle cx={0} cy={floor - 875} r={120} fill="#ff3b3b" opacity={flash * 0.4} style={{filter: 'blur(20px)'}} />}
        </g>
      </Svg>
      {flash > 0 && <AbsoluteFill style={{background: `rgba(255,40,40,${flash * 0.25})`, pointerEvents: 'none'}} />}
    </AbsoluteFill>
  );
};

/** Living room (day): sofa, plant, TV. floor at `floor`. */
export const LivingRoom: React.FC<{px?: number; floor?: number}> = ({px = 0, floor = 1480}) => (
  <AbsoluteFill style={{background: '#f0c98a', overflow: 'hidden'}}>
    <Svg>
      <g transform={`translate(${px},0)`}>
        {Array.from({length: 30}).map((_, i) => (
          <rect key={i} x={-1200 + i * 110} y={0} width={50} height={floor} fill="#000" opacity={0.04} />
        ))}
        <rect x={-860} y={420} width={360} height={420} rx={10} fill="#9fd8ff" stroke="#fff6e4" strokeWidth={22} />
        <rect x={-220} y={480} width={300} height={200} rx={8} fill="#2a2d38" />
        <rect x={-210} y={490} width={280} height={180} rx={4} fill="#3a4a6a" />
        {/* sofa (right side, where Mateus sits) */}
        <g transform="translate(900,0)">
          <rect x={-360} y={floor - 420} width={720} height={200} rx={50} fill="#4f8fd9" />
          <rect x={-380} y={floor - 260} width={760} height={200} rx={40} fill="#3c72c4" />
          <rect x={-420} y={floor - 330} width={90} height={280} rx={40} fill="#3567b3" />
          <rect x={330} y={floor - 330} width={90} height={280} rx={40} fill="#3567b3" />
        </g>
        <g transform="translate(300,0)">
          <rect x={-50} y={floor - 160} width={100} height={160} rx={10} fill="#c27c3c" />
          {[-60, -20, 20, 60].map((a) => (
            <ellipse key={a} cx={Math.sin((a * Math.PI) / 180) * 80} cy={floor - 260} rx={30} ry={110} fill="#4f9a34" transform={`rotate(${a} 0 ${floor - 160})`} />
          ))}
        </g>
      </g>
      <rect x={-20} y={floor} width={W + 40} height={H} fill="#a8784a" />
      <ellipse cx={540 + px * 0.3} cy={floor + 200} rx={600} ry={110} fill="#c94f4a" opacity={0.6} />
    </Svg>
  </AbsoluteFill>
);
