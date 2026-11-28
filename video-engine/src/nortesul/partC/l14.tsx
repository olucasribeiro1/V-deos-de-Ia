import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PlacedDaviNS} from '../DaviNS';
import {mouthAt} from '../timeline';
import {Blueprint, C, Cam, Chip, Drop, FONT, Flow, Label, Meter, Panel, dropPath, k, popIn} from './kit';

type CamSpec = {from: {x: number; y: number; s: number}; to: {x: number; y: number; s: number}};

/* ---------- Warehouse cut-away with sub-meters per sector ---------- */
const SECT = [
  {name: 'PRODUÇÃO', color: C.water, rate: 0.9},
  {name: 'REFEITÓRIO', color: C.teal, rate: 0.4},
  {name: 'BANHEIROS', color: C.orange, rate: 0.6},
];
export const SubMeters: React.FC<{dur: number; at: number; cam: CamSpec}> = ({dur, at, cam}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {/* warehouse section */}
          <path d="M90 760 L540 560 L990 760 V1330 H90 Z" fill="#163452" stroke="#cfe6ff" strokeWidth={6} />
          {[1, 2].map((i) => (
            <line key={i} x1={90 + i * 300} y1={760} x2={90 + i * 300} y2={1330} stroke="#cfe6ff" strokeWidth={3} strokeDasharray="12 10" opacity={0.6} />
          ))}
          {/* main supply */}
          <Flow d="M-40 1270 H990" width={14} len={1100} />
          {SECT.map((s, i) => {
            const cx = 240 + i * 300;
            const p = popIn(frame, at + i * 5);
            const v = Math.round((frame - at) * s.rate * 3 + 120 * (i + 1));
            return (
              <g key={i}>
                <path d={`M${cx} 1270 V1060`} stroke={s.color} strokeWidth={10} />
                {frame >= at + i * 5 && <Meter x={cx} y={1130} r={36} s={p} spin={frame * 8 * s.rate} color={s.color} />}
                <text x={cx} y={900} textAnchor="middle" fill="#fff" fontFamily={FONT.hud} fontWeight={700} fontSize={30}>{s.name}</text>
                {frame >= at + i * 5 + 4 && (
                  <g opacity={k(frame, at + i * 5 + 4, at + i * 5 + 10)}>
                    <rect x={cx - 100} y={930} width={200} height={66} rx={12} fill="#05121f" stroke={s.color} strokeWidth={3} />
                    <text x={cx} y={978} textAnchor="middle" fill={s.color} fontFamily="monospace" fontWeight={700} fontSize={36}>{String(v).padStart(5, '0')} L</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </Cam>
        <Chip at={at + 12} x={540} y={1650} text="HIDRÔMETRO POR SETOR" size={48} color={C.water} />
    </AbsoluteFill>
  );
};

/* ---------- Consumption bars: an anomaly flagged ---------- */
export const ConsumptionBars: React.FC<{dur: number; flagAt: number}> = ({dur, flagAt}) => {
  const frame = useCurrentFrame();
  const vals = [0.55, 0.3, 0.85];
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={{x: 540, y: 940, s: 1.0}} to={{x: 600, y: 940, s: 1.1}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <Panel x={90} y={540} w={900} h={800} title="CONSUMO POR SETOR · HOJE" />
          {vals.map((v, i) => {
            const g = k(frame, 2 + i * 3, 16 + i * 3) * v;
            const x = 180 + i * 270;
            const hot = i === 2 && frame >= flagAt;
            return (
              <g key={i}>
                <rect x={x} y={1230 - g * 520} width={170} height={g * 520} rx={12} fill={hot ? C.orange : SECT[i].color} />
                <text x={x + 85} y={1290} textAnchor="middle" fill="#9fd4ff" fontFamily={FONT.hud} fontWeight={700} fontSize={26}>{SECT[i].name}</text>
              </g>
            );
          })}
          <line x1={150} x2={950} y1={1230 - 0.55 * 520} y2={1230 - 0.55 * 520} stroke="#fff" strokeDasharray="12 10" strokeWidth={3} opacity={0.6} />
          <text x={940} y={1230 - 0.55 * 520 - 14} textAnchor="end" fill="#fff" fontFamily={FONT.hud} fontSize={22} opacity={0.8}>META</text>
          {frame >= flagAt && (
            <g transform={`translate(${720 + 85},${1230 - 0.85 * 520 - 50}) scale(${popIn(frame, flagAt)})`}>
              <rect x={-90} y={-36} width={180} height={64} rx={14} fill={C.orange} />
              <text y={10} textAnchor="middle" fill="#2a1400" fontFamily={FONT.hud} fontWeight={700} fontSize={32}>⚠ +35%</text>
            </g>
          )}
        </svg>
      </Cam>
        <Chip at={flagAt + 6} x={540} y={1650} text="MEDIU → ACHOU → CORRIGIU" size={44} color={C.white} />
    </AbsoluteFill>
  );
};

/* ---------- Warehouse roof + rain + cistern ---------- */
export const RoofRain: React.FC<{dur: number; cam: CamSpec; rainAt: number; dimAt?: number; fill0: number; fill1: number; formulaAt?: number; bigAt?: number}> = ({
  dur,
  cam,
  rainAt,
  dimAt,
  fill0,
  fill1,
  formulaAt,
  bigAt,
}) => {
  const frame = useCurrentFrame();
  const rain = k(frame, rainAt, rainAt + 10);
  const drops = [];
  for (let i = 0; i < 46; i++) {
    const x = (i * 211) % 1200 - 60;
    const t = ((frame * 1.0 + i * 7.3) % 20) / 20;
    drops.push(<line key={i} x1={x - t * 30} y1={-50 + t * 900 + (i % 5) * 40} x2={x - t * 30 - 8} y2={-50 + t * 900 + (i % 5) * 40 + 40} stroke="#9fd4ff" strokeWidth={4} opacity={0.7 * rain} />);
  }
  const fill = fill0 + (fill1 - fill0) * k(frame, 0, dur, 0, 1, (x) => x);
  const dim = dimAt !== undefined ? k(frame, dimAt, dimAt + 12) : 1;
  const big = bigAt !== undefined ? popIn(frame, bigAt) : 0;
  const counter = bigAt !== undefined ? Math.round(1000000 * k(frame, bigAt, bigAt + 30, 0, 1)) : 0;
  return (
    <AbsoluteFill>
      <Blueprint tint="#123a5e" />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {/* rain behind roof */}
          <g clipPath="url(#rainclip)">{drops}</g>
          <clipPath id="rainclip">
            <rect x={-200} y={0} width={1480} height={860} />
          </clipPath>
          {/* warehouse (isometric-ish) */}
          <path d="M80 880 L460 760 L460 1300 L80 1340 Z" fill="#2e5478" stroke="#cfe6ff" strokeWidth={4} />
          <path d="M460 760 L860 860 L860 1340 L460 1300 Z" fill="#244463" stroke="#cfe6ff" strokeWidth={4} />
          {/* roof top face */}
          <path d="M80 880 L460 760 L860 860 L480 990 Z" fill="#7fa6c9" stroke="#fff" strokeWidth={5} />
          {[1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={80 + i * 63} y1={880 - i * 20} x2={480 + i * 63} y2={990 - i * 22} stroke="#5f87ad" strokeWidth={3} />
          ))}
          {/* sheen of water on roof when raining */}
          <path d="M80 880 L460 760 L860 860 L480 990 Z" fill={C.water} opacity={0.25 * rain} />
          {/* dimension lines */}
          {dimAt !== undefined && (
            <g opacity={dim}>
              <path d="M80 850 L460 730" stroke={C.yellow} strokeWidth={4} strokeDasharray={`${400 * dim} 400`} />
              <path d="M460 730 L860 830" stroke={C.yellow} strokeWidth={4} strokeDasharray={`${420 * dim} 420`} />
              <g transform={`translate(470,880) scale(${popIn(frame, dimAt + 8)})`}>
                <rect x={-120} y={-44} width={240} height={80} rx={14} fill={C.yellow} />
                <text y={18} textAnchor="middle" fill="#2a2000" fontFamily={FONT.cap} fontWeight={700} fontSize={50}>1.000 m²</text>
              </g>
            </g>
          )}
          {/* gutter + downpipe */}
          <path d="M480 990 L860 860" stroke="#cfe6ff" strokeWidth={10} />
          <Flow d="M860 870 L900 870 L900 1180 L940 1180" width={14} len={500} draw={rain} />
          {/* cistern */}
          <g>
            <rect x={900} y={1150} width={170} height={210} rx={18} fill="#18324f" stroke="#cfe6ff" strokeWidth={5} />
            <rect x={906} y={1150 + 204 * (1 - fill)} width={158} height={204 * fill} rx={12} fill={C.water} />
            <text x={985} y={1400} textAnchor="middle" fill="#fff" fontFamily={FONT.hud} fontWeight={700} fontSize={26}>CISTERNA</text>
          </g>
          <rect x={-200} y={1340} width={1480} height={300} fill="#0f2a44" />
        </svg>
      </Cam>
        {formulaAt !== undefined && <Chip at={formulaAt} x={540} y={1640} text="1 mm × 1 m² = 1 L" size={56} color={C.white} />}
      {bigAt !== undefined && frame >= bigAt && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', transform: `scale(${0.7 + 0.3 * big})`, opacity: Math.min(1, big * 1.5)}}>
          <div style={{display: 'inline-block', padding: '16px 34px', borderRadius: 24, background: C.water, color: '#04203a', fontFamily: FONT.cap, fontWeight: 700, fontSize: 84, boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}}>
            +{counter.toLocaleString('pt-BR')} L/ANO
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- Shower with timer 15 → 5 min ---------- */
export const Shower: React.FC<{dur: number; cam: CamSpec; switchAt?: number; chipAt?: number; countAt?: number; startMin?: number}> = ({dur, cam, switchAt, chipAt, countAt, startMin = 15}) => {
  const frame = useCurrentFrame();
  const sw = switchAt !== undefined ? k(frame, switchAt, switchAt + 14) : startMin === 5 ? 1 : 0;
  const minutes = Math.round(15 - 10 * sw);
  const ring = minutes / 15;
  const streams = [];
  for (let i = 0; i < 18; i++) {
    const t = ((frame + i * 3.3) % 14) / 14;
    const x = 540 + ((i % 6) - 2.5) * 22 * (0.5 + t);
    streams.push(<line key={i} x1={x} y1={700 + t * 520} x2={x + (x - 540) * 0.05} y2={730 + t * 520} stroke="#bfe6ff" strokeWidth={5} opacity={0.8 - t * 0.4} />);
  }
  const counter = countAt !== undefined ? Math.round(90 * k(frame, countAt, countAt + 30, 0, 1)) : 0;
  return (
    <AbsoluteFill>
      <Blueprint tint="#1b4a6b" />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {/* tiles */}
          {[...Array(10)].map((_, r) =>
            [...Array(8)].map((_, c) => <rect key={`${r}-${c}`} x={c * 140 - 20} y={500 + r * 110} width={134} height={104} fill="#dfeef7" opacity={0.08} />),
          )}
          {/* shower head */}
          <path d="M380 480 V600 Q380 640 420 640 H540 V650" stroke="#cfd8e6" strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M470 650 H610 L590 695 H490 Z" fill="#cfd8e6" />
          <g transform="translate(0,0)">{streams.map((s, i) => <g key={i} transform="translate(0,0)">{s}</g>)}</g>
          <ellipse cx={540} cy={1260} rx={240} ry={30} fill={C.waterDeep} opacity={0.5} />
          {/* timer */}
          <g transform="translate(830,1000)">
            <circle r={130} fill="#0b2440" stroke="#2a4d70" strokeWidth={14} />
            <circle r={130} fill="none" stroke={sw > 0.5 ? C.green : C.orange} strokeWidth={14} strokeDasharray={`${2 * Math.PI * 130 * ring} 2000`} transform="rotate(-90)" strokeLinecap="round" />
            <text y={30} textAnchor="middle" fill="#fff" fontFamily={FONT.cap} fontWeight={700} fontSize={110}>{minutes}</text>
            <text y={80} textAnchor="middle" fill="#9fd4ff" fontFamily={FONT.hud} fontWeight={700} fontSize={30}>MIN</text>
          </g>
        </svg>
      </Cam>
        {chipAt !== undefined && <Chip at={chipAt} x={540} y={1640} text="−90 L POR BANHO" size={60} color={C.green} />}
      {countAt !== undefined && frame >= countAt && (
        <div style={{position: 'absolute', left: 90, top: 560, padding: '14px 24px', borderRadius: 18, background: C.panel, border: `3px solid ${C.green}`, color: '#fff', opacity: k(frame, countAt, countAt + 6)}}>
          <div style={{fontFamily: FONT.hud, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: '#bff5cf'}}>LITROS ECONOMIZADOS</div>
          <div style={{fontFamily: FONT.cap, fontWeight: 700, fontSize: 80, lineHeight: 1, color: C.green}}>{counter} L</div>
          <div style={{fontFamily: FONT.hud, fontSize: 22, color: '#cfe6ff'}}>10 min × ~9 L/min</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- Final card ---------- */
export const FinalCard: React.FC<{dur: number; textAt: number; waveAt: number; absOffset: number}> = ({dur, textAt, waveAt, absOffset}) => {
  const frame = useCurrentFrame();
  const m = mouthAt(frame + absOffset);
  const p = popIn(frame, textAt);
  const q = popIn(frame, textAt + 10);
  const wave = frame >= waveAt ? k(frame, waveAt, waveAt + 8) : 0;
  const wv = Math.sin((frame - waveAt) / 3.2) * 22 * wave;
  const ripple = [0, 1, 2].map((i) => {
    const t = ((frame + i * 20) % 60) / 60;
    return <ellipse key={i} cx={540} cy={680} rx={50 + t * 240} ry={(50 + t * 240) * 0.25} fill="none" stroke={C.water} strokeWidth={4} opacity={(1 - t) * 0.6 * p} />;
  });
  const dropY = k(frame, 0, textAt, 300, 590);
  return (
    <AbsoluteFill>
      <Blueprint tint="#0d4270" />
      <Cam dur={dur} from={{x: 540, y: 960, s: 1.0}} to={{x: 540, y: 960, s: 1.06}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {ripple}
          <g transform={`translate(540,${dropY}) scale(${1 + 0.15 * p})`}>
            <path d={dropPath(90)} fill={C.water} />
            <path d={dropPath(90)} fill="url(#dropg)" />
            <ellipse cx={-34} cy={22} rx={16} ry={28} fill="#fff" opacity={0.6} />
          </g>
          <defs>
            <linearGradient id="dropg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#7fd3ff" stopOpacity={0.9} />
              <stop offset="1" stopColor="#0b5fa8" stopOpacity={0.9} />
            </linearGradient>
          </defs>
        </svg>
      </Cam>
        <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px)`}}>
        <div style={{fontFamily: FONT.cap, fontWeight: 700, fontSize: 170, color: '#fff', letterSpacing: 2, lineHeight: 1, textShadow: '0 8px 30px rgba(0,0,0,0.4)'}}>NorteSul</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 890, textAlign: 'center', opacity: Math.min(1, q * 1.5), transform: `translateY(${(1 - q) * 20}px)`}}>
        <div style={{display: 'inline-block', fontFamily: FONT.hud, fontWeight: 700, fontSize: 58, color: C.water, letterSpacing: 6, textTransform: 'lowercase'}}>cada gota conta</div>
        <div style={{width: 220, height: 4, background: C.water, margin: '18px auto 0', borderRadius: 2}} />
      </div>
      <PlacedDaviNS
        x={810}
        y={1930}
        height={820}
        upperOnly
        pose={{shR: 150 + wv * 0.4 * wave, elR: 25 + wv, shL: -7, elL: 6, facing: -0.15, headTilt: Math.sin(frame / 20) * 3}}
        expr={{smile: 0.8, blink: frame % 100 < 3 ? 1 : 0, mouthOpen: m < 0.12 ? 0 : Math.min(1, m * 0.9)}}
      />
    </AbsoluteFill>
  );
};
