import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Presenter} from '../Presenter';
import {B0, Big, Blueprint, Cam, Note, ShotP, Sun, Svg, Tag, Vignette, WavyUp, ap, camAt, clamp, dropPath, easeOut, kf, lerp, prog, sm, wf} from './kit';

/* =================================================================== S9 x-ray network */
const STREETS_X = [150, 360, 570, 780, 990];
const STREETS_Y = [620, 820, 1020, 1220];
const LEAKS: [number, number, number][] = [
  [360, 700, 0], [570, 900, 4], [780, 640, 8], [150, 1100, 12], [990, 960, 16], [460, 1220, 20], [780, 1150, 24], [250, 820, 28], [680, 1020, 32], [900, 1220, 36],
];

export const S9: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const c = camAt(prog(P), [570, 930, 1.0], [560, 950, 1.12]);
  const l0 = wf('L8', 3) - 6;
  return (
    <AbsoluteFill>
      <Blueprint top="#062038" bottom="#03101f" op={0.06} />
      <Cam {...c}>
        <Svg style={{overflow: 'visible'}}>
          {/* building footprints (x-ray outlines) */}
          {STREETS_X.slice(0, -1).map((x, i) =>
            STREETS_Y.slice(0, -1).map((y, j) => (
              <g key={`${i}${j}`} stroke="#9fd4ff" strokeOpacity={0.28} strokeWidth={2} fill="#9fd4ff" fillOpacity={0.05}>
                <rect x={x + 30} y={y + 30} width={70 + random(`a${i}${j}`) * 30} height={60 + random(`b${i}${j}`) * 40} rx={4} />
                <rect x={x + 120} y={y + 40} width={50} height={120} rx={4} />
                <rect x={x + 30} y={y + 120} width={80} height={50} rx={4} />
              </g>
            )),
          )}
          {/* reservoir tank on top */}
          <rect x={500} y={470} width={140} height={90} rx={12} fill="#0f3a5e" stroke="#5ab4ff" strokeWidth={4} />
          <rect x={506} y={500} width={128} height={54} rx={8} fill="#3aa0f0" opacity={0.8} />
          <text x={570} y={455} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={22} fill="#9fd4ff" letterSpacing={3}>
            RESERVATÓRIO
          </text>
          {/* pipes */}
          <g stroke="#2f8fe0" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.9}>
            <path d="M570,560 L570,1300" />
            {STREETS_Y.map((y) => <path key={y} d={`M150,${y} L990,${y}`} />)}
            {[150, 360, 780, 990].map((x) => <path key={x} d={`M${x},620 L${x},1220`} />)}
          </g>
          {/* flowing pulses */}
          <g stroke="#bfe6ff" strokeWidth={5} strokeLinecap="round" fill="none" strokeDasharray="14 46" strokeDashoffset={-fr * 3}>
            <path d="M570,560 L570,1300" />
            {STREETS_Y.map((y) => <path key={y} d={`M570,${y} L990,${y}`} />)}
            {STREETS_Y.map((y) => <path key={`l${y}`} d={`M570,${y} L150,${y}`} />)}
            {[150, 360, 780, 990].map((x) => <path key={x} d={`M${x},620 L${x},1220`} />)}
          </g>
          {/* leaks */}
          {LEAKS.map(([x, y, d], i) => {
            const k = ap(fr, l0 + d, 6);
            if (k <= 0) return null;
            const pulse = (fr + i * 7) % 20;
            return (
              <g key={i} opacity={k}>
                <circle cx={x} cy={y} r={34 + pulse} fill="#ff4d4d" opacity={0.25 * (1 - pulse / 20)} />
                <circle cx={x} cy={y} r={14} fill="#ff4d4d" />
                {[0, 1, 2, 3].map((j) => {
                  const a = -Math.PI / 2 + (j - 1.5) * 0.6;
                  const tt = ((fr + j * 5 + i * 3) % 18) / 18;
                  return <path key={j} d={dropPath(x + Math.cos(a) * 60 * tt, y + Math.sin(a) * 60 * tt + tt * tt * 50, 7)} fill="#ff7a7a" opacity={1 - tt} />;
                })}
              </g>
            );
          })}
        </Svg>
      </Cam>
      <Note x={540} y={545} text="REDE DE DISTRIBUIÇÃO · RAIO-X" k={ap(fr, P.a + 2)} size={28} color="#9fd4ff" />
      <Tag x={540} y={1650} text="VAZAMENTOS NO CAMINHO" k={ap(fr, wf('L8', 3) + 6)} size={38} color="#ff6b6b" />
      <Vignette op={0.5} />
    </AbsoluteFill>
  );
};

/* =================================================================== S10 100 drops, 54 leak */
const ORDER = (() => {
  const idx = Array.from({length: 100}).map((_, i) => i);
  return idx.sort((x, y) => random(`o${x}`) - random(`o${y}`));
})();
const LEAKED = new Map<number, number>(ORDER.slice(0, 54).map((cell, n) => [cell, n]));

export const S10: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const p = prog(P);
  const t0 = wf('L8', 9) - 2;
  const span = wf('L8', 13) + 6 - t0; // all 54 gone by "cento"
  const leaked = Math.min(54, Math.max(0, Math.floor(((fr - t0) / span) * 54)));
  const s = lerp(1, 1.05, sm(p));
  return (
    <AbsoluteFill>
      <Blueprint top="#062038" bottom="#03101f" op={0.06} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '50% 48%'}}>
        <Note x={540} y={560} text="A CADA 100 LITROS TRATADOS" k={ap(fr, P.a)} size={34} color="#9fd4ff" />
        <Svg>
          {Array.from({length: 100}).map((_, i) => {
            const cx = 225 + (i % 10) * 70;
            const cy = 650 + Math.floor(i / 10) * 66;
            const n = LEAKED.get(i);
            const age = n === undefined ? -1 : fr - (t0 + (n / 54) * span);
            if (age < 0) return <path key={i} d={dropPath(cx, cy, 19)} fill="#3aa0f0" />;
            const fall = clamp(age / 22);
            return (
              <g key={i}>
                <path d={dropPath(cx, cy, 19)} fill="none" stroke="#ff4d4d" strokeWidth={2.5} strokeDasharray="5 5" opacity={0.6} />
                <path d={dropPath(cx, cy + easeOut(fall) * 40 + fall * fall * 80, 19 * (1 - fall * 0.4))} fill="#ff4d4d" opacity={1 - fall} />
              </g>
            );
          })}
        </Svg>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1610, display: 'flex', justifyContent: 'center', gap: 60, fontFamily: 'Oswald', fontWeight: 700, fontSize: 64}}>
        <span style={{color: '#ff4d4d'}}>{leaked} VAZAM</span>
        <span style={{color: '#5ab4ff'}}>{100 - leaked} CHEGAM</span>
      </div>
      <Vignette op={0.5} />
    </AbsoluteFill>
  );
};

/* =================================================================== S11 PERDAS 54% */
export const S11: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const p = prog(P);
  const k = ap(fr, P.a + 1, 8);
  const bar = kf(fr, [P.a + 4, P.a + 22], [0, 1]);
  const s = lerp(1.04, 1, sm(p));
  return (
    <AbsoluteFill>
      <Blueprint top="#2a0a12" bottom="#0a0308" op={0.05} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`}}>
        <Note x={540} y={590} text="SALVADOR" k={k} size={40} color="#ffffff" />
        <Big x={540} y={780} text="PERDAS 54%" k={k} size={190} color="#ff4d4d" glow />
        <Svg>
          <rect x={110} y={960} width={860} height={70} rx={12} fill="#1b2836" />
          <rect x={110} y={960} width={860 * 0.46} height={70} rx={12} fill="#3aa0f0" />
          <rect x={110 + 860 * 0.46} y={960} width={860 * 0.54 * bar} height={70} rx={0} fill="#ff4d4d" />
          <text x={110 + 860 * 0.23} y={1007} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={32} fill="#fff">46 CHEGAM</text>
          <text x={110 + 860 * 0.73} y={1007} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={32} fill="#fff" opacity={bar}>54 VAZAM</text>
          {/* national average marker */}
          <g opacity={ap(fr, P.a + 20, 10)}>
            <line x1={110 + 860 * 0.6} y1={945} x2={110 + 860 * 0.6} y2={1100} stroke="#ffd23a" strokeWidth={4} strokeDasharray="8 6" />
            <text x={110 + 860 * 0.6} y={1135} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={26} fill="#ffd23a">MÉDIA BRASIL ~40%</text>
          </g>
        </Svg>
        <Note x={540} y={1210} text="FONTE: SNIS 2023" k={ap(fr, P.a + 10)} size={24} color="#c9d3dc" weight={400} />
      </div>
      <Vignette op={0.55} />
    </AbsoluteFill>
  );
};

/* =================================================================== S12 presenter "mais da metade" */
export const S12: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const p = prog(P);
  const pie = kf(fr, [P.a + 2, P.a + 20], [0, 54]);
  return (
    <AbsoluteFill>
      <Blueprint top="#0e2f4d" bottom="#06182a" op={0.08} ox={-fr * 0.6} />
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${lerp(20, -20, sm(p))}px)`}}>
        <Svg>
          <g transform="translate(300,860)">
            <circle r={190} fill="#3aa0f0" />
            <circle r={95} fill="none" stroke="#ff4d4d" strokeWidth={190} pathLength={100} strokeDasharray={`${pie} 100`} transform="rotate(-90)" />
            <circle r={190} fill="none" stroke="#fff" strokeWidth={6} />
            <text y={20} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={84} fill="#fff" style={{textShadow: '0 3px 6px #000'}}>
              {Math.round(pie)}%
            </text>
          </g>
        </Svg>
        <Note x={300} y={1110} text="MAIS DA METADE" k={ap(fr, wf('L8', 19))} size={40} color="#ff6b6b" />
        <Presenter absOffset={B0} x={800} y={2000} height={1450} upperOnly pose={{shL: 70, elL: -30, facing: -0.25}} expr={{smile: 0, browTilt: 0.35}} />
      </div>
      <Vignette op={0.4} />
    </AbsoluteFill>
  );
};

/* =================================================================== S13/S14 shallow hot reservoir + evaporation */
const Shallow: React.FC<{fr: number; evap: number; drop: number; heat: number}> = ({fr, evap, drop, heat}) => {
  const wy = 1050 + drop;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb85c" />
          <stop offset="1" stopColor="#ffe8b8" />
        </linearGradient>
        <linearGradient id="hwat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4fb0e8" />
          <stop offset="1" stopColor="#2a78b8" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-400} width={1900} height={2700} fill="url(#hsky)" />
      <Sun x={250} y={640} r={90} t={fr} color="#ffcf3a" />
      {/* heat shimmer */}
      <g opacity={0.35 * heat} stroke="#fff" strokeWidth={3} fill="none">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${120 + i * 40},${780 + i * 50} q60,${-14 + Math.sin(fr * 0.2 + i) * 8} 120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0`} />
        ))}
      </g>
      {/* ground with shallow wide basin */}
      <path d={`M-400,1040 L60,1040 Q120,1150 300,1150 L780,1150 Q960,1150 1020,1040 L1500,1040 L1500,2400 L-400,2400 Z`} fill="#c9935a" />
      <path d={`M-400,1040 L60,1040 Q120,1150 300,1150 L780,1150 Q960,1150 1020,1040 L1500,1040`} fill="none" stroke="#9c6a3a" strokeWidth={8} />
      <path d={`M-400,1180 L1500,1180`} stroke="#b07c48" strokeWidth={3} opacity={0.6} />
      {/* water */}
      <clipPath id="basin">
        <path d={`M60,1040 Q120,1150 300,1150 L780,1150 Q960,1150 1020,1040 Z`} />
      </clipPath>
      <g clipPath="url(#basin)">
        <rect x={0} y={wy} width={1080} height={200} fill="url(#hwat)" />
        <path d={`M0,${wy} q30,-6 60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0`} stroke="#bfe6ff" strokeWidth={4} fill="none" transform={`translate(${-(fr % 60)},0)`} />
      </g>
      {/* former level */}
      {drop > 1 && <line x1={80} y1={1050} x2={1000} y2={1050} stroke="#ffffff" strokeWidth={3} strokeDasharray="10 8" opacity={0.8} />}
      {/* depth arrow "raso" */}
      <g stroke="#0b1a2e" strokeWidth={4} fill="#0b1a2e">
        <line x1={540} y1={wy + 8} x2={540} y2={1142} />
        <path d={`M530,${wy + 18} L540,${wy + 4} L550,${wy + 18} Z`} />
        <path d="M530,1132 L540,1146 L550,1132 Z" />
      </g>
      {/* evaporation arrows */}
      {evap > 0 &&
        Array.from({length: 9}).map((_, i) => {
          const x = 140 + i * 100;
          const cyc = ((fr + i * 9) % 45) / 45;
          return <WavyUp key={i} x={x} y={wy - 20 - cyc * 120} h={120} t={fr + i * 10} color="#ffffff" w={7} op={evap * Math.sin(cyc * Math.PI)} />;
        })}
      {/* thermometer */}
      <g transform="translate(900,640)">
        <rect x={-22} y={-150} width={44} height={230} rx={22} fill="#ffffff" stroke="#0b1a2e" strokeWidth={5} />
        <circle cx={0} cy={100} r={40} fill="#ff4d4d" stroke="#0b1a2e" strokeWidth={5} />
        <rect x={-11} y={80 - lerp(60, 200, heat)} width={22} height={lerp(60, 200, heat)} rx={11} fill="#ff4d4d" />
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={22} y1={-110 + i * 40} x2={40} y2={-110 + i * 40} stroke="#0b1a2e" strokeWidth={4} />)}
      </g>
    </svg>
  );
};

export const S13: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const c = camAt(prog(P), [540, 920, 1.0], [560, 940, 1.06]);
  const heat = kf(fr, [wf('L9', 4) - 4, wf('L9', 4) + 14], [0.2, 1]);
  return (
    <AbsoluteFill>
      <Cam {...c}>
        <Shallow fr={fr} evap={0} drop={0} heat={heat} />
      </Cam>
      <Note x={560} y={1110} text="RASO" k={ap(fr, wf('L9', 2))} size={40} color="#0b1a2e" align="left" />
      <Tag x={540} y={1660} text="RASO + QUENTE" k={ap(fr, wf('L9', 4))} size={40} color="#ff8a3a" />
      <Vignette op={0.25} />
    </AbsoluteFill>
  );
};

export const S14: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const c = camAt(prog(P), [560, 1000, 1.18], [540, 960, 1.3]);
  const evap = ap(fr, wf('L9', 6) - 6, 12);
  const drop = kf(fr, [wf('L9', 6), wf('L9', 9) + 10], [0, 26]);
  return (
    <AbsoluteFill>
      <Cam {...c}>
        <Shallow fr={fr} evap={evap} drop={drop} heat={1} />
      </Cam>
      <Tag x={540} y={1660} text="EVAPORAÇÃO" k={ap(fr, wf('L9', 6))} size={48} color="#ffffff" />
      <Vignette op={0.25} />
    </AbsoluteFill>
  );
};

/* =================================================================== S15/S16 urban reservoirs top view */
const LAKE_J = 'M610,640 C700,600 800,640 830,720 C860,800 800,840 760,900 C720,960 640,940 610,880 C580,820 640,790 600,740 C570,700 560,660 610,640 Z';
const LAKE_I = 'M250,1000 C320,950 420,980 440,1050 C460,1120 400,1150 360,1210 C320,1260 240,1240 220,1170 C200,1100 190,1040 250,1000 Z';
const CityTop: React.FC<{fr: number; houses: number}> = ({fr, houses}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <rect x={-500} y={-500} width={2100} height={2900} fill="#e9e2d2" />
    {/* blocks */}
    {Array.from({length: 22}).map((_, i) =>
      Array.from({length: 30}).map((__, j) => {
        const x = -300 + i * 80 + (j % 2) * 20;
        const y = 200 + j * 60;
        const q = random(`cb${i}_${j}`);
        return <rect key={`${i}_${j}`} x={x} y={y} width={60 + q * 10} height={44} rx={4} fill={q > 0.85 ? '#cfd9c4' : '#d6ccb8'} />;
      }),
    )}
    {/* green buffer + lakes */}
    <path d={LAKE_J} fill="#8fc77a" transform="translate(720,770) scale(1.18) translate(-720,-770)" />
    <path d={LAKE_I} fill="#8fc77a" transform="translate(330,1110) scale(1.2) translate(-330,-1110)" />
    <path d={LAKE_J} fill="#3a96dc" stroke="#ffffff" strokeWidth={4} />
    <path d={LAKE_I} fill="#3a96dc" stroke="#ffffff" strokeWidth={4} />
    {/* irregular houses creeping onto the buffer */}
    {Array.from({length: 26}).map((_, i) => {
      const q = (k: string) => random(`ih${i}${k}`);
      const onJ = i < 14;
      const a = q('a') * Math.PI * 2;
      const [cx, cy, r] = onJ ? [720, 770, 175] : [330, 1110, 150];
      const k = clamp((houses - i / 26) * 4);
      if (k <= 0) return null;
      const x = cx + Math.cos(a) * r * (1 + q('d') * 0.1);
      const y = cy + Math.sin(a) * r * 1.05;
      return <rect key={i} x={x - 10} y={y - 8} width={20 + q('w') * 10} height={16} fill={['#e07a5a', '#f2b35a', '#c96b8a', '#7fa3c9'][i % 4]} opacity={k} transform={`rotate(${q('r') * 40 - 20},${x},${y})`} />;
    })}
    {/* ripple shimmer */}
    <g stroke="#bfe6ff" strokeWidth={3} fill="none" opacity={0.6}>
      <path d={`M${660 + (fr % 40)},760 q20,-6 40,0`} />
      <path d={`M${280 + (fr % 40)},1090 q20,-6 40,0`} />
    </g>
  </svg>
);

export const S15: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const c = camAt(prog(P), [540, 930, 0.95], [530, 930, 1.05]);
  return (
    <AbsoluteFill>
      <Cam {...c}>
        <CityTop fr={fr} houses={0} />
      </Cam>
      <Note x={540} y={560} text="REPRESAS DENTRO DA CIDADE" k={ap(fr, wf('L9', 13))} size={32} color="#0b1a2e" />
      <Vignette op={0.3} />
    </AbsoluteFill>
  );
};

export const S16: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const c = camAt(prog(P), [530, 940, 1.1], [520, 950, 1.25]);
  const proj = (x: number, y: number) => [540 + (x - c.cx) * c.s, 915 + (y - c.cy) * c.s];
  const [jx, jy] = proj(720, 770);
  const [ix, iy] = proj(330, 1110);
  return (
    <AbsoluteFill>
      <Cam {...c}>
        <CityTop fr={fr} houses={kf(fr, [wf('L9', 20), P.b], [0, 0.6])} />
      </Cam>
      <Tag x={jx} y={jy} text="JOANES" k={ap(fr, wf('L9', 17))} size={36} color="#ffffff" solid />
      <Tag x={ix} y={iy} text="IPITANGA" k={ap(fr, wf('L9', 19))} size={36} color="#ffffff" solid />
      <Tag x={540} y={1660} text="JOANES · IPITANGA" k={ap(fr, wf('L9', 19) + 6)} size={42} color="#5ab4ff" />
      <Vignette op={0.3} />
    </AbsoluteFill>
  );
};

/* =================================================================== S17 shore: irregular houses + sewage */
export const S17: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const c = camAt(prog(P), [520, 930, 1.0], [580, 950, 1.1]);
  const houses = kf(fr, [wf('L9', 21) - 4, wf('L9', 23) + 6], [0, 1]);
  const sew = kf(fr, [wf('L9', 24) - 6, P.b], [0, 1]);
  return (
    <AbsoluteFill>
      <Cam {...c}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <defs>
            <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8cc8ec" />
              <stop offset="1" stopColor="#e3f1f7" />
            </linearGradient>
            <radialGradient id="plume" cx="0.2" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#6b4b23" stopOpacity={0.9} />
              <stop offset="1" stopColor="#6b4b23" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect x={-500} y={-500} width={2100} height={2900} fill="url(#ssky)" />
          {/* water body on the right */}
          <rect x={-500} y={1000} width={2100} height={1500} fill="#3a8fd0" />
          <path d={`M${-(fr % 60)},1000 q30,-8 60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0 t60,0`} stroke="#bfe6ff" strokeWidth={4} fill="none" />
          {/* slope */}
          <path d="M-500,640 L80,640 Q300,700 520,1000 Q560,1060 600,1200 L600,2400 L-500,2400 Z" fill="#a8794a" />
          <path d="M-500,640 L80,640 Q300,700 520,1000 Q560,1060 600,1200" fill="none" stroke="#7d5530" strokeWidth={8} />
          <path d="M-500,700 L60,700 Q260,760 470,1040" fill="none" stroke="#3f8a4c" strokeWidth={22} opacity={0.5} />
          {/* irregular houses on the slope */}
          {Array.from({length: 11}).map((_, i) => {
            const q = (k: string) => random(`sh${i}${k}`);
            const x = -40 + i * 52 + q('x') * 20;
            const ground = x < 80 ? 640 : 640 + ((x - 80) / 440) * 360 * (0.6 + 0.4 * ((x - 80) / 440));
            const k = clamp((houses - i / 14) * 3);
            if (k <= 0) return null;
            const w = 70 + q('w') * 40;
            const h = 70 + q('h') * 60;
            const col = ['#e07a5a', '#f2b35a', '#c96b8a', '#7fa3c9', '#e8d5b0'][i % 5];
            const y = ground - h * easeOut(k);
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h + 30} fill={col} stroke="#5a3a2a" strokeWidth={3} />
                <path d={`M${x - 6},${y} L${x + w + 6},${y - 10} L${x + w + 6},${y + 4} L${x - 6},${y + 14} Z`} fill="#9aa3ad" />
                <rect x={x + 14} y={y + 26} width={20} height={20} fill="#2a3442" />
                <rect x={x + w - 34} y={y + 26} width={16} height={34} fill="#5a3a2a" />
              </g>
            );
          })}
          {/* sewage pipe */}
          <path d="M120,860 L420,940 L470,990" stroke="#5d6670" strokeWidth={24} fill="none" strokeLinecap="round" />
          {sew > 0 && (
            <>
              <path d={`M470,990 Q${480 + sew * 6},${1000 + sew * 10} ${485},1010`} stroke="#6b4b23" strokeWidth={16} fill="none" strokeLinecap="round" />
              <ellipse cx={520 + sew * 140} cy={1060} rx={60 + sew * 260} ry={30 + sew * 90} fill="url(#plume)" />
              {Array.from({length: 6}).map((_, i) => (
                <circle key={i} cx={500 + ((fr * 3 + i * 50) % 300) * sew} cy={1030 + Math.sin(fr * 0.2 + i) * 10 + i * 12} r={6} fill="#6b4b23" opacity={0.7 * sew} />
              ))}
            </>
          )}
        </svg>
      </Cam>
      <Tag x={300} y={610} text="OCUPAÇÃO IRREGULAR" k={ap(fr, wf('L9', 22))} size={34} color="#ffb02e" />
      <Tag x={800} y={1220} text="ESGOTO" k={ap(fr, wf('L9', 25) - 2)} size={40} color="#c08a4a" />
      <Vignette op={0.3} />
    </AbsoluteFill>
  );
};
