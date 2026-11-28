import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Presenter} from '../Presenter';
import {B0, CY, Cam, Note, Pin, Rain, ShotP, Sun, Svg, Tag, Vignette, ap, camAt, clamp, dropPath, kf, lerp, lf, prog, sm, wf} from './kit';

/* =================================================================== Salvador backdrop (rain / day) */
const BLD = Array.from({length: 16}).map((_, i) => {
  const q = (k: string) => random(`bd${i}${k}`);
  return {
    x: -120 + i * 82 + q('x') * 20,
    w: 70 + q('w') * 70,
    h: 140 + q('h') * 330,
    c: ['#c9d3dc', '#e2d6c4', '#b8c7d6', '#d9c3b0', '#cfd8c4', '#e8dcc8'][i % 6],
  };
});

export const SalvadorBG: React.FC<{t: number; rain: number; pan?: number}> = ({t, rain, pan = 0}) => {
  const sky = rain > 0 ? ['#5e7389', '#9fb2c2'] : ['#6fb6e6', '#cfe9f6'];
  const sea = rain > 0 ? '#4e7c94' : '#2f8fc0';
  const base = 1180;
  return (
    <Svg>
      <defs>
        <linearGradient id="sbsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#sbsky)" />
      {/* clouds */}
      <g fill={rain > 0 ? '#6f8297' : '#ffffff'} opacity={rain > 0 ? 0.9 : 0.75}>
        {[0, 1, 2, 3].map((i) => {
          const x = ((i * 380 + t * 0.6 + pan * 0.3) % 1500) - 250;
          const y = 380 + i * 90;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={170} ry={46} />
              <ellipse cx={x + 70} cy={y - 30} rx={90} ry={50} />
              <ellipse cx={x - 60} cy={y - 18} rx={70} ry={36} />
            </g>
          );
        })}
      </g>
      <g transform={`translate(${pan},0)`}>
        {/* sea on the right */}
        <rect x={-400} y={base - 10} width={2000} height={900} fill={sea} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${-400 + ((t * 1.5 + i * 37) % 80)},${base + 30 + i * 46} q40,-10 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0`} stroke="#ffffff" strokeOpacity={0.18} strokeWidth={4} fill="none" />
        ))}
        {/* skyline on the left headland */}
        <path d={`M-400,${base} L640,${base} Q700,${base + 6} 720,${base + 30} L720,${base + 60} L-400,${base + 60} Z`} fill={rain > 0 ? '#5f6f62' : '#6e9b5e'} />
        {BLD.filter((b) => b.x < 620).map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={base - b.h} width={b.w} height={b.h} fill={b.c} />
            <rect x={b.x + b.w * 0.72} y={base - b.h} width={b.w * 0.28} height={b.h} fill="#000" opacity={0.12} />
            {Array.from({length: Math.floor(b.h / 36)}).map((_, r) =>
              [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={b.x + 10 + c * ((b.w - 20) / 3)} y={base - b.h + 14 + r * 36} width={(b.w - 20) / 3 - 8} height={16} fill={rain > 0 ? '#ffe6a6' : '#7fa9c8'} opacity={rain > 0 && random(`w${i}${r}${c}`) > 0.55 ? 0.9 : 0.35} />),
            )}
          </g>
        ))}
        {/* lighthouse point */}
        <path d={`M760,${base + 6} Q860,${base - 40} 980,${base + 6} Z`} fill={rain > 0 ? '#556458' : '#6e9b5e'} />
        <g transform={`translate(870,${base - 28})`}>
          <path d="M-22,0 L-14,-190 L14,-190 L22,0 Z" fill="#f4f1ea" />
          <rect x={-18} y={-120} width={36} height={34} fill="#2a2f3a" />
          <rect x={-20} y={-214} width={40} height={26} rx={4} fill="#2a2f3a" />
          <path d="M-24,-214 L0,-238 L24,-214 Z" fill="#c74b3a" />
          {rain > 0 && <path d={`M0,-201 L${-260},${-150 + Math.sin(t * 0.08) * 40} L${-260},${-250 + Math.sin(t * 0.08) * 40} Z`} fill="#fff6c0" opacity={0.18} />}
        </g>
        {/* palm trees */}
        {[60, 560].map((x, i) => (
          <g key={i} transform={`translate(${x},${base + 40})`}>
            <path d="M0,0 Q10,-120 -6,-240" stroke="#7a5a3a" strokeWidth={14} fill="none" />
            {[-70, -30, 10, 40, 80].map((a, j) => (
              <path key={j} transform={`translate(-6,-240) rotate(${a + Math.sin(t * 0.05 + j) * 4})`} d="M0,0 Q50,-30 100,10 Q50,-10 0,0 Z" fill={rain > 0 ? '#3f6b4a' : '#3f8a4c'} />
            ))}
          </g>
        ))}
      </g>
      {/* promenade */}
      <rect x={0} y={1560} width={1080} height={360} fill={rain > 0 ? '#7d8790' : '#d9cdb5'} />
      <rect x={0} y={1560} width={1080} height={14} fill="#ffffff" opacity={0.4} />
      {rain > 0 && <rect x={0} y={1574} width={1080} height={346} fill="#a8c4dc" opacity={0.18} />}
    </Svg>
  );
};

/* =================================================================== S1 presenter, rain */
export const S1: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const p = prog(P);
  const s = lerp(1, 1.07, sm(p));
  const hand = kf(fr, [wf('L7', 2) - 4, wf('L7', 2) + 8], [0, 1]);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '50% 60%'}}>
        <SalvadorBG t={fr} rain={1} pan={-p * 40} />
        <Presenter absOffset={B0} x={540} y={2050} height={1550} upperOnly pose={{shR: lerp(8, 115, hand), elR: lerp(-8, -45, hand)}} expr={{lookY: -0.2 * hand}} />
      </div>
      <Rain t={fr} n={170} />
      <Vignette op={0.35} />
    </AbsoluteFill>
  );
};

/* =================================================================== S2 presenter + tap "de onde vem?" */
export const S2: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const p = prog(P);
  const q = ap(fr, wf('L7', 9) - 3, 10);
  const drip = (fr % 26) / 26;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${lerp(30, -30, sm(p))}px) scale(1.05)`}}>
        <SalvadorBG t={fr} rain={1} pan={-60 - p * 40} />
        <Svg>
          {/* wall + pipe going off-screen left */}
          <rect x={650} y={760} width={430} height={820} fill="#d7cfc0" />
          <rect x={650} y={760} width={430} height={18} fill="#b9ad98" />
          <path d="M-40,940 L780,940 L780,1010" stroke="#8a96a3" strokeWidth={34} fill="none" strokeLinejoin="round" />
          <path d="M-40,932 L780,932" stroke="#c7d1db" strokeWidth={6} fill="none" opacity={0.7} />
          {/* tap */}
          <rect x={750} y={1000} width={110} height={40} rx={12} fill="#b8c4cf" />
          <rect x={840} y={1030} width={28} height={50} rx={6} fill="#b8c4cf" />
          <rect x={770} y={976} width={60} height={20} rx={8} fill="#3b82c4" />
          <path d={dropPath(854, 1100 + drip * 60, 12)} fill="#5ab4ff" opacity={1 - drip * 0.6} />
          {/* question mark bubble */}
          <g opacity={q} transform={`translate(880,860) scale(${lerp(0.6, 1, q)})`}>
            <circle cx={0} cy={0} r={62} fill="#ffd23a" stroke="#0b1a2e" strokeWidth={6} />
            <text x={0} y={30} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={90} fill="#0b1a2e">?</text>
          </g>
          {/* flow arrows along the pipe pointing in from the left */}
          {[0, 1, 2].map((i) => {
            const x = ((fr * 6 + i * 220) % 660) - 20;
            return <path key={i} d={`M${x},920 l26,20 l-26,20`} stroke="#ffd23a" strokeWidth={7} fill="none" opacity={q} strokeLinecap="round" />;
          })}
        </Svg>
        <Presenter absOffset={B0} x={330} y={1820} height={1050} pose={{shR: 95, elR: -5, facing: 0.3}} />
      </div>
      <Rain t={fr} n={150} op={0.45} />
      <Vignette op={0.35} />
    </AbsoluteFill>
  );
};

/* =================================================================== Bahia map */
const mp = (lon: number, lat: number): [number, number] => [(lon + 47) * 100 + 60, (-lat - 8) * 100 + 520];
const poly = (pts: [number, number][]) => 'M' + pts.map(([lo, la]) => mp(lo, la).map((v) => v.toFixed(1)).join(',')).join(' L') + ' Z';
const line = (pts: [number, number][]) => 'M' + pts.map(([lo, la]) => mp(lo, la).map((v) => v.toFixed(1)).join(',')).join(' L');

const COAST: [number, number][] = [
  [-37.4, -11.0], [-37.9, -12.0], [-38.3, -12.65], [-38.45, -12.98], [-38.65, -13.05], [-38.9, -13.3], [-39.0, -13.6], [-39.0, -14.5], [-39.05, -15.5], [-38.9, -16.5], [-39.2, -17.6], [-39.6, -18.3],
];
const BAHIA: [number, number][] = [
  [-43.0, -8.6], [-41.5, -8.8], [-40.5, -9.3], [-39.0, -8.6], [-38.2, -9.0], [-37.8, -9.8], ...COAST,
  [-40.2, -17.9], [-40.6, -16.8], [-41.3, -15.9], [-42.3, -15.0], [-43.5, -14.7], [-44.2, -14.3], [-45.3, -14.9], [-46.0, -13.6], [-46.4, -12.5], [-46.2, -11.2], [-45.6, -10.5], [-44.5, -9.6], [-43.8, -9.0],
];
const LAND: [number, number][] = [[-52, -4], [-34.5, -4], [-34.6, -7.2], [-35.3, -9.0], [-36.6, -10.3], ...COAST, [-39.8, -19.5], [-40.3, -21], [-52, -21]];
const SEMI: [number, number][] = [
  [-43.4, -8.4], [-39.2, -8.4], [-38.0, -9.2], [-38.0, -10.9], [-38.7, -11.8], [-39.3, -12.25], [-39.55, -13.3], [-40.3, -14.7], [-41.3, -15.7], [-42.8, -15.0], [-44.2, -14.3], [-44.7, -12.6], [-44.8, -10.8], [-44.1, -9.4],
];
const RIVER: [number, number][] = [
  [-41.45, -13.45], [-41.35, -13.0], [-41.15, -12.62], [-40.8, -12.45], [-40.4, -12.55], [-40.0, -12.75], [-39.7, -12.6], [-39.35, -12.5], [-39.1, -12.52], [-39.0, -12.56],
];
const RIVER2: [number, number][] = [[-39.0, -12.56], [-38.92, -12.63], [-38.86, -12.7]];
export const DAM = mp(-39.0, -12.56);
export const SSA = mp(-38.47, -12.99);
const ADUTORA: [number, number][] = [[-39.0, -12.56], [-38.85, -12.6], [-38.62, -12.68], [-38.5, -12.8], [-38.47, -12.99]];

const MapArt: React.FC<{fr: number; s: number; river: number; adut: number; semiK: number}> = ({fr, s, river, adut, semiK}) => {
  const sw = (px: number) => px / s; // constant on-screen width
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <clipPath id="bahiaClip">
          <path d={poly(BAHIA)} />
        </clipPath>
        <pattern id="crack" width={46} height={46} patternUnits="userSpaceOnUse">
          <path d="M0,10 L14,18 L22,8 M14,18 L18,34 L34,40 M30,4 L36,20 L46,24" stroke="#b9945a" strokeWidth={2.2} fill="none" opacity={0.7} />
        </pattern>
      </defs>
      <rect x={-3000} y={-3000} width={8000} height={8000} fill="#2a6d97" />
      <path d={poly(LAND)} fill="#7aa36a" />
      <path d={poly(BAHIA)} fill="#9fcf86" />
      <g clipPath="url(#bahiaClip)">
        <path d={poly(SEMI)} fill="#e8d29c" opacity={0.35 + 0.65 * semiK} />
        <path d={poly(SEMI)} fill="url(#crack)" opacity={semiK} />
      </g>
      <path d={poly(BAHIA)} fill="none" stroke="#ffffff" strokeWidth={sw(4)} strokeLinejoin="round" />
      {/* Baía de Todos os Santos */}
      <ellipse cx={mp(-38.7, -12.82)[0]} cy={mp(-38.7, -12.82)[1]} rx={13} ry={17} fill="#2a6d97" />
      <ellipse cx={mp(-38.68, -12.98)[0]} cy={mp(-38.68, -12.98)[1]} rx={7} ry={14} fill="#2a6d97" />
      {/* river */}
      <path d={line(RIVER)} fill="none" stroke="#2f8fe0" strokeWidth={sw(7)} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${river} 1`} />
      <path d={line(RIVER2)} fill="none" stroke="#2f8fe0" strokeWidth={sw(5)} strokeLinecap="round" />
      {/* reservoir lake behind the dam */}
      <path d={`M${DAM[0] - 1},${DAM[1] - 6} q-14,-6 -26,2 q-8,6 -2,10 q12,2 28,0 Z`} fill="#3aa0f0" />
      {/* adutora */}
      {adut > 0 && (
        <>
          <path d={line(ADUTORA)} fill="none" stroke="#0b1a2e" strokeWidth={sw(10)} strokeLinecap="round" pathLength={1} strokeDasharray={`${adut} 1`} opacity={0.8} />
          <path d={line(ADUTORA)} fill="none" stroke="#ffd23a" strokeWidth={sw(5)} strokeLinecap="round" pathLength={1} strokeDasharray={`${adut} 1`} />
          <path d={line(ADUTORA)} fill="none" stroke="#ffffff" strokeWidth={sw(3)} strokeDasharray={`${sw(8)} ${sw(22)}`} strokeDashoffset={-fr * sw(2.4)} opacity={clamp((adut - 0.95) * 20)} />
        </>
      )}
      {/* dam wall */}
      <rect x={DAM[0] - sw(4)} y={DAM[1] - sw(14)} width={sw(9)} height={sw(28)} rx={sw(2)} fill="#5b6470" stroke="#fff" strokeWidth={sw(2)} />
    </svg>
  );
};

type MapShot = ShotP & {A: [number, number, number]; Z: [number, number, number]; mode: 'all' | 'dam' | 'river' | 'semi'};
const MapScene: React.FC<MapShot> = (P) => {
  const {fr, A, Z, mode} = P;
  const c = camAt(prog(P), A, Z);
  const toS = ([x, y]: [number, number]) => [540 + (x - c.cx) * c.s, CY + (y - c.cy) * c.s];
  const river = mode === 'all' || mode === 'dam' ? 0.35 : mode === 'river' ? kf(fr, [wf('L7', 25), wf('L7', 28) + 4], [0.35, 1]) : 1;
  const adut = mode === 'all' ? 0 : mode === 'dam' ? kf(fr, [wf('L7', 22), wf('L7', 25)], [0, 1]) : 1;
  const semiK = mode === 'semi' ? kf(fr, [wf('L7', 30), wf('L7', 31) + 6], [0, 1]) : 0;
  const [sx, sy] = toS(SSA);
  const [dx, dy] = toS(DAM);
  const pinK = ap(fr, P.a + 3, 10);
  const sixty = ap(fr, wf('L7', 15), 10);
  return (
    <AbsoluteFill style={{background: '#2a6d97'}}>
      <Cam cx={c.cx} cy={c.cy} s={c.s}>
        <MapArt fr={fr} s={c.s} river={river} adut={adut} semiK={semiK} />
      </Cam>
      <Svg>
        <Pin x={sx} y={sy} s={mode === 'all' ? 0.9 : 1.2} k={mode === 'all' ? pinK : 1} pulse={fr} color="#ff5a5a" />
        {mode !== 'all' && mode !== 'semi' && (
          <g opacity={mode === 'dam' ? ap(fr, wf('L7', 22) - 2, 8) : 1}>
            <circle cx={dx} cy={dy} r={26} fill="none" stroke="#ffd23a" strokeWidth={4} />
          </g>
        )}
        {/* 60% donut on the full-map shot */}
        {mode === 'all' && sixty > 0 && (
          <g transform={`translate(${sx - 230},${sy + 150})`} opacity={sixty}>
            <circle r={78} fill="rgba(8,20,40,0.85)" />
            <circle r={58} fill="none" stroke="#33506e" strokeWidth={26} />
            <circle r={58} fill="none" stroke="#3aa0f0" strokeWidth={26} pathLength={100} strokeDasharray={`${60 * sixty} 100`} transform="rotate(-90)" />
            <text y={14} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={40} fill="#fff">
              {Math.round(60 * sixty)}%
            </text>
          </g>
        )}
      </Svg>
      <Note x={sx + (mode === 'dam' ? 24 : -16)} y={sy + (mode === 'dam' ? 40 : 26)} text="SALVADOR" k={mode === 'all' ? pinK : 1} align={mode === 'dam' ? 'left' : 'right'} size={mode === 'dam' ? 34 : 26} />
      {mode === 'dam' && <Note x={dx - 36} y={dy - 60} text="PEDRA DO CAVALO" k={ap(fr, wf('L7', 22))} align="right" size={36} color="#ffd23a" />}
      {mode === 'dam' && <Note x={(dx + sx) / 2 + 40} y={(dy + sy) / 2 - 40} text="ADUTORA" k={ap(fr, wf('L7', 23) + 8)} align="left" size={28} />}
      {mode === 'river' && (() => {
        const [rx, ry] = toS(mp(-40.2, -12.62));
        return <Note x={rx} y={ry + 50} text="RIO PARAGUAÇU" k={ap(fr, wf('L7', 27))} size={38} color="#0b4f8a" />;
      })()}
      {mode === 'river' && <Note x={dx - 30} y={dy - 46} text="PEDRA DO CAVALO" k={1} align="right" size={28} color="#7a4e12" />}
      {mode === 'semi' && (() => {
        const [ax, ay] = toS(mp(-41.8, -11.4));
        const [bx, by] = toS(mp(-41.6, -12.75));
        return (
          <>
            <Svg>
              <g transform={`translate(${ax + 150},${ay - 160}) scale(0.8)`} opacity={semiK}>
                <Sun x={0} y={0} r={50} t={fr} color="#ffb02e" />
              </g>
              <path d={(() => {
                const pts = RIVER.map(([lo, la]) => toS(mp(lo, la)));
                return 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L');
              })()} stroke="#7fd0ff" strokeWidth={4} fill="none" strokeDasharray="2 10" strokeLinecap="round" opacity={0.9} />
            </Svg>
            <Note x={ax} y={ay} text="SEMIÁRIDO" k={semiK} size={50} color="#7a4e12" />
            <Tag x={bx + 40} y={by + 150} text="SECA RECORRENTE" k={ap(fr, wf('L7', 34))} color="#ffb02e" size={36} />
          </>
        );
      })()}
      {(mode === 'all' || mode === 'dam') && <Tag x={540} y={1650} text="PEDRA DO CAVALO ≈ 60% DO ABASTECIMENTO" k={ap(fr, wf('L7', 15) + 4)} size={38} color="#ffd23a" />}
      <Vignette op={0.4} />
    </AbsoluteFill>
  );
};

const FULL_C: [number, number] = [560, 1010];
export const S3: React.FC<ShotP> = (P) => <MapScene {...P} mode="all" A={[FULL_C[0], FULL_C[1], 0.82]} Z={[620, 1010, 0.98]} />;
export const S4: React.FC<ShotP> = (P) => <MapScene {...P} mode="dam" A={[890, 995, 4.6]} Z={[886, 996, 5.6]} />;
export const S5: React.FC<ShotP> = (P) => <MapScene {...P} mode="river" A={[800, 985, 2.8]} Z={[720, 990, 2.5]} />;
export const S6: React.FC<ShotP> = (P) => <MapScene {...P} mode="semi" A={[620, 1020, 1.55]} Z={[560, 1010, 1.3]} />;

/* =================================================================== Dam cross-section with level ruler */
const YF = 640; // 100 % útil
const YD = 1110; // 0 % útil (top of dead storage)
const lvlY = (pct: number) => YD - (pct / 100) * (YD - YF);
const floorY = (x: number) => (x < 700 ? 700 + (x / 700) * 500 : 1200);

const DamSection: React.FC<{fr: number; pct: number; dateK: number; chipK: number}> = ({fr, pct, dateK, chipK}) => {
  const y = lvlY(pct) + Math.sin(fr * 0.15) * 2;
  // water polygon between floor and level
  const xs = Array.from({length: 71}).map((_, i) => i * 10);
  const xStart = Math.max(0, ((y - 700) / 500) * 700);
  const water = `M${xStart},${y} L700,${y} L700,1200 ` + xs.filter((x) => x >= xStart).reverse().map((x) => `L${x},${floorY(x)}`).join(' ') + ' Z';
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9ecf7" />
          <stop offset="1" stopColor="#f4efe2" />
        </linearGradient>
        <linearGradient id="dwat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ab4ff" />
          <stop offset="1" stopColor="#1d5f9c" />
        </linearGradient>
        <pattern id="hatch" width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={18} stroke="#0b1a2e" strokeWidth={4} opacity={0.35} />
        </pattern>
      </defs>
      <rect x={-500} y={-500} width={2200} height={2900} fill="url(#dsky)" />
      {/* water */}
      <path d={water} fill="url(#dwat)" />
      {/* dead storage hatch */}
      <path d={`M${((YD - 700) / 500) * 700},${YD} L700,${YD} L700,1200 L${((YD - 700) / 500) * 700},${YD} Z`} fill="url(#hatch)" />
      <path d={`M${((1200 - 700) / 500) * 700 - 200},1200 L${((YD - 700) / 500) * 700},${YD} L700,${YD} L700,1200 Z`} fill="url(#hatch)" opacity={0} />
      <line x1={((YD - 700) / 500) * 700} y1={YD} x2={700} y2={YD} stroke="#0b1a2e" strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
      {/* full-level ghost line */}
      <line x1={0} y1={YF} x2={700} y2={YF} stroke="#1d5f9c" strokeWidth={3} strokeDasharray="12 10" opacity={0.6} />
      {/* ground */}
      <path d={`M-500,700 L0,700 L700,1200 L1600,1200 L1600,2400 L-500,2400 Z`} fill="#b48a5a" />
      <path d={`M-500,700 L0,700 L700,1200 L1600,1200`} fill="none" stroke="#8a6440" strokeWidth={8} />
      <path d={`M-500,760 L0,760 L700,1260 L1600,1260`} fill="none" stroke="#9c7650" strokeWidth={3} opacity={0.6} />
      {/* downstream river */}
      <path d="M940,1190 L1600,1190 L1600,1200 L940,1200 Z" fill="#3a8fd8" />
      {/* dam (concrete, trapezoid) */}
      <path d="M700,600 L760,600 L940,1200 L700,1200 Z" fill="#a9b2bc" />
      <path d="M700,600 L760,600 L760,620 L700,620 Z" fill="#7d8792" />
      <path d="M760,600 L940,1200 L900,1200 L742,640 Z" fill="#000" opacity={0.08} />
      {/* ruler on the dam face */}
      <rect x={652} y={YF - 20} width={46} height={YD - YF + 40} rx={6} fill="#ffffff" stroke="#0b1a2e" strokeWidth={3} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={652} y1={lvlY(t)} x2={t % 50 === 0 ? 690 : 676} y2={lvlY(t)} stroke="#0b1a2e" strokeWidth={t % 50 === 0 ? 4 : 2.5} />
          {t % 50 === 0 && (
            <text x={640} y={lvlY(t) + 10} textAnchor="end" fontFamily="Roboto Condensed" fontWeight={700} fontSize={30} fill="#0b1a2e">
              {t}%
            </text>
          )}
        </g>
      ))}
      <rect x={656} y={y} width={38} height={Math.max(0, YD - y)} fill="#3aa0f0" opacity={0.7} />
      {/* level marker */}
      <g transform={`translate(700,${y})`}>
        <path d="M0,0 L-18,-12 L-18,12 Z" fill="#ff4d4d" transform="translate(-48,0)" />
        <line x1={-700} y1={0} x2={0} y2={0} stroke="#ffffff" strokeWidth={4} opacity={0.85} />
      </g>
      <text x={260} y={y - 22} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={64} fill="#0b1a2e">
        {Math.round(pct)}%
      </text>
      <text x={470} y={YD + 52} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={28} fill="#0b1a2e" opacity={0.75}>
        VOLUME MORTO
      </text>
      {/* date tag */}
      <g opacity={dateK} transform={`translate(200,${YF - 60})`}>
        <rect x={-110} y={-36} width={220} height={64} rx={14} fill="#0b1a2e" />
        <text x={0} y={10} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={34} fill="#ffd23a" letterSpacing={2}>
          JAN/2026
        </text>
      </g>
      {chipK > 0 && <circle cx={675} cy={y} r={30 + (fr % 24)} fill="none" stroke="#ff4d4d" strokeWidth={4} opacity={(1 - (fr % 24) / 24) * chipK} />}
    </svg>
  );
};

const damPct = (fr: number) => kf(fr, [wf('L7', 37), wf('L7', 48)], [72, 30]);
export const S7: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const c = camAt(prog(P), [500, 940, 1.0], [520, 940, 1.08]);
  return (
    <AbsoluteFill style={{background: '#e8eef2'}}>
      <Cam {...c}>
        <DamSection fr={fr} pct={damPct(fr)} dateK={ap(fr, wf('L7', 38))} chipK={0} />
      </Cam>
      <Tag x={540} y={1660} text="BARRAGEM PEDRA DO CAVALO · CORTE" k={ap(fr, P.a + 2)} size={34} color="#ffffff" />
      <Vignette op={0.25} />
    </AbsoluteFill>
  );
};
export const S8: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const c = camAt(prog(P), [600, lvlY(34), 1.55], [640, lvlY(30), 1.8]);
  return (
    <AbsoluteFill style={{background: '#e8eef2'}}>
      <Cam {...c}>
        <DamSection fr={fr} pct={damPct(fr)} dateK={0} chipK={ap(fr, wf('L7', 46))} />
      </Cam>
      <Tag x={540} y={1650} text="VOLUME ÚTIL ~30% (JAN/2026)" k={ap(fr, wf('L7', 50) - 2)} size={44} color="#ff4d4d" />
      <Vignette op={0.25} />
    </AbsoluteFill>
  );
};
