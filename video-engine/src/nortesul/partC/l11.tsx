import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PlacedPuppet} from '../../characters/Puppet';
import type {Outfit} from '../../characters/types';
import {Blueprint, C, Cam, Chip, Drop, FONT, Flow, Label, Meter, Panel, k, popIn} from './kit';

/* ---------------- DMC network map ---------------- */
const SECTORS = [
  {d: 'M140 560 L520 560 L520 930 L140 930 Z', color: '#38b6ff', name: 'SETOR 1', mx: 520, my: 745},
  {d: 'M560 560 L940 560 L940 930 L560 930 Z', color: '#2fd6c3', name: 'SETOR 2', mx: 560, my: 745},
  {d: 'M140 970 L520 970 L520 1320 L140 1320 Z', color: '#a06bff', name: 'SETOR 3', mx: 520, my: 1145},
  {d: 'M560 970 L940 970 L940 1320 L560 1320 Z', color: '#ffb02e', name: 'SETOR 4', mx: 560, my: 1145},
];
// little street/pipe grid inside sectors
const GRID: string[] = [];
for (const [x0, y0, x1, y1] of [
  [140, 560, 520, 930],
  [560, 560, 940, 930],
  [140, 970, 520, 1320],
  [560, 970, 940, 1320],
]) {
  for (let i = 1; i < 4; i++) GRID.push(`M${x0 + ((x1 - x0) * i) / 4} ${y0 + 20} V${y1 - 20}`);
  for (let i = 1; i < 3; i++) GRID.push(`M${x0 + 20} ${y0 + ((y1 - y0) * i) / 3} H${x1 - 20}`);
}

/** sectorsAt: local frame at which the sectors color in; metersAt: frame meters pop. */
export const NetworkMap: React.FC<{dur: number; sectorsAt: number; metersAt: number; cam: {from: {x: number; y: number; s: number}; to: {x: number; y: number; s: number}}; readout?: boolean}> = ({
  dur,
  sectorsAt,
  metersAt,
  cam,
  readout,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {SECTORS.map((s, i) => {
            const t = k(frame, sectorsAt + i * 5, sectorsAt + i * 5 + 10);
            return (
              <g key={i}>
                <path d={s.d} fill={s.color} opacity={0.08 + 0.22 * t} stroke={s.color} strokeWidth={4 + 2 * t} strokeDasharray={t > 0 ? undefined : '14 10'} strokeOpacity={0.3 + 0.7 * t} rx={20} />
                <Label at={sectorsAt + i * 5 + 4} x={(i % 2 === 0 ? 330 : 750)} y={i < 2 ? 615 : 1025} text={s.name} color={s.color} size={30} />
              </g>
            );
          })}
          {GRID.map((d, i) => (
            <path key={i} d={d} stroke="rgba(230,243,255,0.35)" strokeWidth={5} fill="none" strokeLinecap="round" />
          ))}
          {/* trunk main (from the treatment plant on the left edge) */}
          <Flow d="M-40 950 H540 V560 M540 950 V1320" width={18} len={2400} />
          {/* meters at each sector entrance */}
          {SECTORS.map((s, i) => {
            const p = popIn(frame, metersAt + i * 3);
            if (frame < metersAt + i * 3) return null;
            return <Meter key={i} x={540} y={s.my} r={30} s={p} spin={frame * (6 + i * 3)} color={s.color} />;
          })}
          {readout && (
            <g opacity={k(frame, metersAt + 10, metersAt + 18)}>
              <Panel x={610} y={1010} w={330} h={170} title="ENTRADA · SETOR 4">
                <text x={30} y={110} fill="#fff" fontFamily={FONT.cap} fontWeight={700} fontSize={56}>
                  {(18 + Math.sin(frame / 7) * 0.6).toFixed(1)}
                  <tspan fontSize={30} fill="#9fd4ff"> m³/h</tspan>
                </text>
                <text x={30} y={148} fill={C.orange} fontFamily={FONT.hud} fontWeight={700} fontSize={22} letterSpacing={1}>VAZÃO NOTURNA ALTA = VAZAMENTO</text>
              </Panel>
            </g>
          )}
        </svg>
      </Cam>
    </AbsoluteFill>
  );
};

/* ---------------- Pressure vs time graph (VRP) ---------------- */
const GX = 130,
  GY = 600,
  GW = 820,
  GH = 560;
// x = hours from 12h (0) to 12h next day (24); pressure in mca
const pWith = (h: number) => {
  const night = Math.exp(-Math.pow((h - 15) / 3.2, 2)); // centered at 03h (=15 h after noon)
  return 42 - 20 * night + Math.sin(h * 1.3) * 1.2;
};
const px = (h: number) => GX + (h / 24) * GW;
const py = (p: number) => GY + GH - (p / 50) * GH;

export const PressureGraph: React.FC<{dur: number; drawAt: number; vrpAt: number}> = ({dur, drawAt, vrpAt}) => {
  const frame = useCurrentFrame();
  const draw = k(frame, drawAt, drawAt + 30);
  const hMax = 24 * draw;
  const pts: string[] = [];
  for (let h = 0; h <= hMax; h += 0.25) pts.push(`${px(h).toFixed(1)},${py(pWith(h)).toFixed(1)}`);
  const vrp = popIn(frame, vrpAt);
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={{x: 540, y: 900, s: 1.04}} to={{x: 560, y: 920, s: 1.12}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <rect x={GX - 50} y={GY - 110} width={GW + 100} height={GH + 210} rx={30} fill={C.panel} stroke="rgba(140,200,255,0.35)" strokeWidth={3} />
          {/* night band 22h..06h => 10..18 */}
          <rect x={px(10)} y={GY} width={px(18) - px(10)} height={GH} fill="#0a1430" opacity={0.85} />
          <g transform={`translate(${px(14)},${GY + 60})`}>
            <path d="M14 -26 A28 28 0 1 0 14 26 A22 22 0 1 1 14 -26 Z" fill="#f4e7a1" />
          </g>
          <text x={px(14)} y={GY + 130} textAnchor="middle" fill="#cfd8ff" fontFamily={FONT.hud} fontWeight={700} fontSize={26} letterSpacing={2}>MADRUGADA</text>
          {/* axes */}
          <line x1={GX} y1={GY} x2={GX} y2={GY + GH} stroke="#cfe6ff" strokeWidth={3} />
          <line x1={GX} y1={GY + GH} x2={GX + GW} y2={GY + GH} stroke="#cfe6ff" strokeWidth={3} />
          {['12h', '18h', '0h', '6h', '12h'].map((t, i) => (
            <text key={i} x={px(i * 6)} y={GY + GH + 40} textAnchor="middle" fill="#9fd4ff" fontFamily={FONT.hud} fontWeight={700} fontSize={26}>{t}</text>
          ))}
          {[10, 20, 30, 40].map((v) => (
            <g key={v}>
              <line x1={GX} x2={GX + GW} y1={py(v)} y2={py(v)} stroke="rgba(160,210,255,0.12)" strokeWidth={2} />
              <text x={GX - 14} y={py(v) + 9} textAnchor="end" fill="#9fd4ff" fontFamily={FONT.hud} fontSize={24}>{v}</text>
            </g>
          ))}
          <text x={GX - 20} y={GY - 50} fill="#fff" fontFamily={FONT.hud} fontWeight={700} fontSize={30} letterSpacing={2}>PRESSÃO NA REDE (mca)</text>
          {/* without VRP: dashed flat */}
          <path d={`M${px(0)} ${py(42)} H${px(hMax)}`} stroke={C.red} strokeWidth={5} strokeDasharray="14 12" opacity={0.7} />
          {draw > 0.6 && (
            <text x={px(19)} y={py(42) - 16} fill={C.red} fontFamily={FONT.hud} fontWeight={700} fontSize={24} opacity={k(frame, drawAt + 18, drawAt + 24)}>SEM CONTROLE</text>
          )}
          <polyline points={pts.join(' ')} fill="none" stroke={C.water} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
          {draw > 0.75 && (
            <text x={px(15)} y={py(22) + 50} textAnchor="middle" fill={C.water} fontFamily={FONT.hud} fontWeight={700} fontSize={28} opacity={k(frame, drawAt + 22, drawAt + 28)}>COM VRP ↓</text>
          )}
        </svg>
        {/* VRP valve icon */}
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <g transform={`translate(540,1460) scale(${vrp})`} opacity={Math.min(1, vrp * 1.4)}>
            <rect x={-300} y={-14} width={600} height={28} fill="#7fa6c9" />
            <path d="M-70 -60 L0 0 L-70 60 Z M70 -60 L0 0 L70 60 Z" fill={C.water} stroke="#0b2440" strokeWidth={5} />
            <line x1={0} y1={0} x2={0} y2={-80} stroke="#cfe6ff" strokeWidth={8} />
            <g transform={`rotate(${k(frame, vrpAt + 6, vrpAt + 30, 0, 120)} 0 -92)`}>
              <circle cx={0} cy={-92} r={30} fill="none" stroke="#fff" strokeWidth={8} />
              <line x1={-30} y1={-92} x2={30} y2={-92} stroke="#fff" strokeWidth={6} />
              <line x1={0} y1={-122} x2={0} y2={-62} stroke="#fff" strokeWidth={6} />
            </g>
          </g>
        </svg>
      </Cam>
        <Chip at={vrpAt + 4} x={540} y={1700} text="VÁLVULA REDUTORA DE PRESSÃO (VRP)" size={34} color={C.water} />
    </AbsoluteFill>
  );
};

/* ---------------- Pipe leak vs pressure ---------------- */
export const LeakPipe: React.FC<{dur: number; dropAt: number; chipAt: number}> = ({dur, dropAt, chipAt}) => {
  const frame = useCurrentFrame();
  const press = k(frame, dropAt, dropAt + 25, 42, 20);
  const leak = (press - 12) / 30; // 1 .. 0.27
  const drops = [];
  for (let i = 0; i < 9; i++) {
    const period = 22;
    const t = ((frame + i * (period / 3)) % period) / period;
    const spread = (i % 3) - 1;
    drops.push(
      <Drop key={i} x={540 + spread * 40 * leak * t + Math.sin(i) * 6} y={1010 + t * 300 * (0.6 + 0.4 * leak)} r={10 + 16 * leak} opacity={1 - t * 0.6} />,
    );
  }
  const needle = -120 + (press / 50) * 240;
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={{x: 540, y: 980, s: 1.0}} to={{x: 540, y: 1000, s: 1.1}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {/* pipe */}
          <rect x={-20} y={900} width={1120} height={110} fill="#5f87ad" />
          <rect x={-20} y={900} width={1120} height={26} fill="#8fb4d6" />
          <rect x={-20} y={990} width={1120} height={20} fill="#3e6385" />
          <path d="M520 1010 l10 -14 l10 10 l12 -12 l8 16" stroke="#0b2440" strokeWidth={5} fill="none" />
          {/* spray jet */}
          <path d={`M540 1010 Q ${540 - 60 * leak} ${1060} ${540 - 90 * leak} ${1130} M540 1010 Q ${540 + 60 * leak} 1060 ${540 + 90 * leak} 1130`} stroke={C.water} strokeWidth={6 + 10 * leak} fill="none" opacity={0.6} strokeLinecap="round" />
          {drops}
          {/* puddle */}
          <ellipse cx={540} cy={1330} rx={150 * (0.4 + 0.6 * leak)} ry={22 * (0.4 + 0.6 * leak)} fill={C.waterDeep} opacity={0.7} />
          {/* gauge */}
          <g transform="translate(540,690)">
            <circle r={130} fill="#0b2440" stroke="#cfe6ff" strokeWidth={8} />
            <path d="M-104 60 A120 120 0 0 1 -60 -104" stroke={C.green} strokeWidth={16} fill="none" />
            <path d="M-60 -104 A120 120 0 0 1 60 -104" stroke={C.yellow} strokeWidth={16} fill="none" />
            <path d="M60 -104 A120 120 0 0 1 104 60" stroke={C.red} strokeWidth={16} fill="none" />
            <line x1={0} y1={0} x2={0} y2={-100} stroke="#fff" strokeWidth={8} strokeLinecap="round" transform={`rotate(${needle})`} />
            <circle r={14} fill="#fff" />
            <text y={80} textAnchor="middle" fill="#fff" fontFamily={FONT.cap} fontWeight={700} fontSize={50}>{Math.round(press)}</text>
            <text y={110} textAnchor="middle" fill="#9fd4ff" fontFamily={FONT.hud} fontWeight={700} fontSize={22}>mca</text>
            <line x1={0} y1={130} x2={0} y2={210} stroke="#cfe6ff" strokeWidth={10} />
          </g>
          <text x={820} y={1200} textAnchor="middle" fill="#fff" fontFamily={FONT.hud} fontWeight={700} fontSize={28}>VAZAMENTO</text>
          <text x={820} y={1250} textAnchor="middle" fill={C.water} fontFamily={FONT.cap} fontWeight={700} fontSize={60}>{Math.round(100 * (leak / 1))}%</text>
        </svg>
      </Cam>
        <Chip at={chipAt} x={540} y={1650} text="PRESSÃO ↓ = VAZAMENTO ↓" size={50} color={C.yellow} />
    </AbsoluteFill>
  );
};

/* ---------------- Acoustic leak detection ---------------- */
const TECH: Outfit = {
  skin: {base: '#d9a57a', shade: '#a8754f', light: '#efc49c'},
  torso: 'hoodie',
  top: {base: '#ff7a1a', shade: '#c4520e', light: '#ffa75c'},
  legs: {base: '#2c3e57', shade: '#1b283a', light: '#46607f'},
  shoes: 'sneaker',
  shoeColor: {base: '#33302c', shade: '#1a1816', light: '#5a554f'},
  gloves: true,
  head: {hair: 'buzz', hairColor: '#3a2a1c'},
};

/** Headphones + hard hat drawn in puppet local units. */
const TechGear: React.FC = () => (
  <g>
    <path d="M-128 -880 C -128 -1060 128 -1060 128 -880" stroke="#1b1f27" strokeWidth={22} fill="none" />
    <rect x={-160} y={-920} width={50} height={90} rx={20} fill="#1b1f27" />
    <rect x={110} y={-920} width={50} height={90} rx={20} fill="#1b1f27" />
    <path d="M-150 -960 Q 0 -1110 150 -960 Z" fill="#ffd23a" />
    <rect x={-170} y={-972} width={340} height={22} rx={10} fill="#f0b800" />
    {/* reflective stripes on vest */}
    <rect x={-120} y={-600} width={240} height={18} fill="#e8f0ff" opacity={0.85} />
  </g>
);

export const Acoustic: React.FC<{dur: number; close?: boolean; foundAt: number; cam: {from: {x: number; y: number; s: number}; to: {x: number; y: number; s: number}}}> = ({dur, close, foundAt, cam}) => {
  const frame = useCurrentFrame();
  const ground = 980;
  const leakX = 620,
    leakY = 1230;
  const waves = [0, 1, 2, 3].map((i) => {
    const t = ((frame + i * 9) % 36) / 36;
    return <circle key={i} cx={leakX} cy={leakY} r={30 + t * 260} fill="none" stroke={C.yellow} strokeWidth={6} opacity={(1 - t) * 0.8} />;
  });
  const found = popIn(frame, foundAt);
  const bars = [];
  for (let i = 0; i < 40; i++) {
    const a = Math.abs(Math.sin(i * 1.7 + frame * 0.6)) * (0.3 + 0.7 * Math.exp(-Math.pow((i - 20) / 7, 2))) * (close ? 1 : 0.7);
    bars.push(<rect key={i} x={160 + i * 19} y={1720 - a * 110} width={12} height={a * 220} rx={5} fill={a > 0.6 ? C.yellow : C.water} />);
  }
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {/* sky band + soil */}
          <rect x={-200} y={ground} width={1480} height={600} fill={C.soil} />
          <rect x={-200} y={ground} width={1480} height={60} fill={C.asphalt} />
          <rect x={-200} y={ground + 26} width={1480} height={6} fill="#e8e3c8" strokeDasharray="40 30" opacity={0.6} />
          {[...Array(14)].map((_, i) => (
            <circle key={i} cx={(i * 97) % 1100} cy={ground + 120 + ((i * 53) % 260)} r={10 + (i % 3) * 5} fill={C.soilDark} opacity={0.7} />
          ))}
          {/* buried pipe */}
          <rect x={-200} y={leakY - 40} width={1480} height={80} fill="#5f87ad" />
          <rect x={-200} y={leakY - 40} width={1480} height={18} fill="#8fb4d6" />
          {waves}
          <circle cx={leakX} cy={leakY} r={18} fill={C.water} />
          <path d={`M${leakX} ${leakY - 40} q -20 -40 0 -70 q 20 -30 0 -60`} stroke={C.water} strokeWidth={8} fill="none" opacity={0.7} />
          {/* geophone on the asphalt */}
          <rect x={leakX - 30} y={ground - 30} width={60} height={30} rx={8} fill="#1b1f27" />
          <path d={`M${leakX} ${ground - 30} C ${leakX} ${ground - 160} ${leakX - 160} ${ground - 120} ${leakX - 200} ${ground - 330}`} stroke="#1b1f27" strokeWidth={6} fill="none" />
          {/* found marker */}
          {frame >= foundAt && (
            <g transform={`translate(${leakX},${ground - 10}) scale(${found})`}>
              <path d="M0 0 L-26 -50 A30 30 0 1 1 26 -50 Z" fill={C.red} />
              <circle cy={-66} r={12} fill="#fff" />
            </g>
          )}
        </svg>
        <PlacedPuppet outfit={TECH} x={leakX - 210} y={ground} height={560} pose={{shR: 40, elR: 30, shL: -15, elL: 10, headTilt: 10, facing: 0.35}} expr={{blink: frame % 90 < 3 ? 1 : 0, smile: 0.3, browRaise: 0.3, lookY: 0.6, lookX: 0.4}}>
          <TechGear />
        </PlacedPuppet>
      </Cam>
        {close && (
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <rect x={120} y={1600} width={840} height={240} rx={24} fill={C.panel} stroke="rgba(140,200,255,0.35)" strokeWidth={3} />
            {bars}
          </svg>
        )}
      {!close && <Chip at={6} x={540} y={1650} text="DETECÇÃO ACÚSTICA" size={50} color={C.yellow} />}
      {close && <Chip at={foundAt} x={540} y={570} text="📍 VAZAMENTO LOCALIZADO" size={40} color={C.red} fg="#fff" />}
    </AbsoluteFill>
  );
};
