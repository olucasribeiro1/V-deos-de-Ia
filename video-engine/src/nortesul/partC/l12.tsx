import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Blueprint, C, Cam, Chip, Drop, FONT, Flow, Label, Panel, k, popIn} from './kit';

type CamSpec = {from: {x: number; y: number; s: number}; to: {x: number; y: number; s: number}};

/** Isometric-ish reservoir basin with a level 0..1. */
const Basin: React.FC<{x: number; y: number; w: number; level: number; name: string; at: number}> = ({x, y, w, level, name, at}) => {
  const frame = useCurrentFrame();
  const h = w * 0.42;
  const wl = y + h - level * h * 0.85;
  const wave = Math.sin(frame / 8) * 3;
  return (
    <g>
      <path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2 - 40} ${y + h} L${x - w / 2 + 40} ${y + h} Z`} fill="#18324f" stroke="#cfe6ff" strokeWidth={5} />
      <clipPath id={`bc${x}${y}`}>
        <path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2 - 40} ${y + h} L${x - w / 2 + 40} ${y + h} Z`} />
      </clipPath>
      <g clipPath={`url(#bc${x}${y})`}>
        <path d={`M${x - w} ${wl + wave} Q ${x} ${wl - wave} ${x + w} ${wl + wave} V ${y + h + 10} H ${x - w} Z`} fill={C.water} opacity={0.85} />
      </g>
      <ellipse cx={x} cy={y} rx={w / 2} ry={14} fill="none" stroke="#cfe6ff" strokeWidth={3} opacity={0.4} />
      <Label at={at} x={x} y={y + h + 50} text={name} size={28} />
    </g>
  );
};

export const Interlink: React.FC<{dur: number; drawAt: number; cam: CamSpec}> = ({dur, drawAt, cam}) => {
  const frame = useCurrentFrame();
  const d = k(frame, drawAt, drawAt + 20);
  const eq = k(frame, drawAt + 20, drawAt + 55);
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <Flow d="M280 700 L800 700" draw={d} width={16} len={600} />
          <Flow d="M280 700 L540 1200" draw={d} width={16} len={700} />
          <Flow d="M800 700 L540 1200" draw={d} width={16} len={700} />
          <Basin x={280} y={620} w={300} level={0.8 - 0.15 * eq} name="SISTEMA A" at={2} />
          <Basin x={800} y={620} w={300} level={0.75 - 0.1 * eq} name="SISTEMA B" at={4} />
          <Basin x={540} y={1110} w={320} level={0.2 + 0.45 * eq} name="SISTEMA C" at={6} />
        </svg>
      </Cam>
        <Chip at={drawAt + 8} x={540} y={1650} text="INTERLIGAÇÃO DE SISTEMAS" size={46} color={C.water} />
    </AbsoluteFill>
  );
};

/* ---------- Reuse plant → factory (purple pipe = reclaimed water) ---------- */
export const Reuse: React.FC<{dur: number; flowAt: number; cam: CamSpec}> = ({dur, flowAt, cam}) => {
  const frame = useCurrentFrame();
  const d = k(frame, flowAt, flowAt + 18);
  const smoke = [0, 1, 2].map((i) => {
    const t = ((frame + i * 14) % 42) / 42;
    return <circle key={i} cx={862 + t * 30} cy={700 - t * 150} r={22 + t * 30} fill="#cfd8e6" opacity={(1 - t) * 0.5} />;
  });
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <rect x={-100} y={1080} width={1280} height={400} fill="#0f2a44" />
          {/* reuse plant: round tanks */}
          {[0, 1].map((i) => (
            <g key={i}>
              <ellipse cx={170 + i * 170} cy={1060} rx={74} ry={26} fill="#2a4d70" stroke="#cfe6ff" strokeWidth={4} />
              <rect x={96 + i * 170} y={960} width={148} height={100} fill="#2a4d70" />
              <ellipse cx={170 + i * 170} cy={960} rx={74} ry={26} fill={C.teal} stroke="#cfe6ff" strokeWidth={4} />
              <line x1={170 + i * 170} y1={960} x2={170 + i * 170 + Math.cos(frame / 10 + i) * 60} y2={960 + Math.sin(frame / 10 + i) * 20} stroke="#fff" strokeWidth={4} />
            </g>
          ))}
          <rect x={110} y={820} width={220} height={90} rx={10} fill="#365c82" stroke="#cfe6ff" strokeWidth={4} />
          <text x={220} y={878} textAnchor="middle" fill="#fff" fontFamily={FONT.hud} fontWeight={700} fontSize={30}>♻ REÚSO</text>
          {/* factory */}
          <path d="M640 1080 V880 L720 830 V880 L800 830 V880 L880 830 V1080 Z" fill="#3d5a7a" stroke="#cfe6ff" strokeWidth={5} />
          <rect x={840} y={700} width={44} height={140} fill="#56789c" stroke="#cfe6ff" strokeWidth={4} />
          {smoke}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={672 + i * 66} y={950} width={40} height={40} fill={C.yellow} opacity={0.8} />
          ))}
          <text x={760} y={1150} textAnchor="middle" fill="#fff" fontFamily={FONT.hud} fontWeight={700} fontSize={30}>INDÚSTRIA</text>
          <text x={220} y={1150} textAnchor="middle" fill="#fff" fontFamily={FONT.hud} fontWeight={700} fontSize={30}>ESTAÇÃO DE REÚSO</text>
          {/* purple pipe */}
          <Flow d="M340 1040 C 450 1040 520 1240 640 1040" color={C.purple} draw={d} width={18} len={600} />
          {d >= 1 &&
            [0, 1, 2].map((i) => {
              const t = ((frame + i * 10) % 30) / 30;
              const x = 340 + t * 300;
              const y = 1040 + Math.sin(t * Math.PI) * 120 * (t < 0.5 ? 1 : 1);
              return <Drop key={i} x={x} y={y - 40} r={14} color={C.purple} />;
            })}
        </svg>
      </Cam>
        <Chip at={flowAt + 6} x={540} y={1650} text="ÁGUA DE REÚSO NA INDÚSTRIA" size={44} color={C.purple} fg="#fff" />
    </AbsoluteFill>
  );
};

/* ---------- Protected spring with riparian forest ---------- */
const Tree: React.FC<{x: number; y: number; s: number; grow: number}> = ({x, y, s, grow}) => (
  <g transform={`translate(${x},${y}) scale(${s * grow})`}>
    <rect x={-8} y={-60} width={16} height={60} fill="#6b4a2f" />
    <circle cy={-90} r={46} fill="#2f9e5a" />
    <circle cx={-24} cy={-70} r={30} fill="#3cb46a" />
    <circle cx={26} cy={-74} r={32} fill="#278a4c" />
  </g>
);

export const Spring: React.FC<{dur: number; treesAt: number; cam: CamSpec}> = ({dur, treesAt, cam}) => {
  const frame = useCurrentFrame();
  const flowOff = -frame * 3;
  const trees: React.ReactNode[] = [];
  const pos: [number, number][] = [
    [150, 900], [250, 960], [180, 1080], [300, 1120], [230, 1250], [120, 1200],
    [800, 900], [900, 960], [780, 1060], [930, 1110], [840, 1230], [960, 1260],
  ];
  pos.forEach(([x, y], i) => trees.push(<Tree key={i} x={x} y={y} s={0.9 + (i % 3) * 0.15} grow={popIn(frame, treesAt + i * 2)} />));
  return (
    <AbsoluteFill>
      <Blueprint tint="#0f3b3a" />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d="M-100 820 Q 300 640 540 760 T 1180 800 V 1500 H -100 Z" fill="#1d5b3c" />
          <path d="M-100 1000 Q 400 900 1180 980 V 1500 H -100 Z" fill="#227046" opacity={0.7} />
          {/* rocks + spring */}
          <ellipse cx={540} cy={790} rx={90} ry={40} fill="#7d8790" />
          <ellipse cx={500} cy={780} rx={40} ry={24} fill="#9aa4ad" />
          <path d="M540 800 C 560 900 480 1000 540 1100 S 600 1300 520 1500" stroke={C.water} strokeWidth={46} fill="none" strokeLinecap="round" />
          <path d="M540 800 C 560 900 480 1000 540 1100 S 600 1300 520 1500" stroke="#fff" strokeWidth={8} fill="none" strokeDasharray="12 40" strokeDashoffset={flowOff} opacity={0.7} />
          {trees}
          {/* fence */}
          <g opacity={k(frame, treesAt + 20, treesAt + 30)}>
            {[...Array(9)].map((_, i) => (
              <rect key={i} x={340 + i * 50} y={680} width={8} height={50} fill="#e8d9b0" />
            ))}
            <rect x={340} y={692} width={408} height={6} fill="#e8d9b0" />
            <rect x={340} y={712} width={408} height={6} fill="#e8d9b0" />
          </g>
          <Label at={treesAt + 8} x={200} y={760} text="MATA CILIAR" size={30} color="#bff5cf" />
          <Label at={treesAt + 8} x={880} y={760} text="MATA CILIAR" size={30} color="#bff5cf" />
          <Label at={4} x={540} y={640} text="NASCENTE" size={34} color="#fff" />
        </svg>
      </Cam>
        <Chip at={treesAt + 14} x={540} y={1650} text="NASCENTE PROTEGIDA" size={48} color={C.green} />
    </AbsoluteFill>
  );
};

/* ---------- Fortaleza pin on the NE coast ---------- */
export const FortalezaMap: React.FC<{dur: number; pinAt: number}> = ({dur, pinAt}) => {
  const frame = useCurrentFrame();
  const p = popIn(frame, pinAt);
  // stylised NE Brazil coastline (not to scale)
  const land = 'M80 620 L330 600 L470 640 L600 700 L720 760 L860 800 L960 900 L1000 1010 L960 1130 L900 1250 L860 1380 L820 1500 L80 1500 Z';
  return (
    <AbsoluteFill>
      <Blueprint tint="#0a3a66" />
      <Cam dur={dur} from={{x: 540, y: 1000, s: 1.0}} to={{x: 560, y: 820, s: 1.25}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d={land} fill="#e9d9a6" stroke="#fff" strokeWidth={5} />
          <path d="M80 900 L540 960 L700 1250 M540 960 L860 900" stroke="#cdb980" strokeWidth={3} fill="none" strokeDasharray="10 10" />
          <text x={300} y={1080} fill="#8a7a4c" fontFamily={FONT.hud} fontWeight={700} fontSize={34} letterSpacing={3}>NORDESTE</text>
          <text x={900} y={640} fill="#9fd4ff" fontFamily={FONT.hud} fontWeight={700} fontSize={30} letterSpacing={3} opacity={0.7}>OCEANO</text>
          {[0, 1, 2].map((i) => {
            const t = ((frame + i * 12) % 36) / 36;
            return <circle key={i} cx={660} cy={730} r={10 + t * 80} fill="none" stroke={C.water} strokeWidth={4} opacity={(1 - t) * p} />;
          })}
          {frame >= pinAt && (
            <g transform={`translate(660,730) scale(${p})`}>
              <path d="M0 0 L-28 -56 A32 32 0 1 1 28 -56 Z" fill={C.red} stroke="#fff" strokeWidth={4} />
              <circle cy={-72} r={12} fill="#fff" />
            </g>
          )}
          <Label at={pinAt + 6} x={660} y={850} text="FORTALEZA (CE)" size={40} />
        </svg>
      </Cam>
    </AbsoluteFill>
  );
};

/* ---------- Desalination plant (reverse osmosis) ---------- */
export const Desal: React.FC<{dur: number; chipAt: number}> = ({dur, chipAt}) => {
  const frame = useCurrentFrame();
  const salt = [];
  for (let i = 0; i < 12; i++) {
    const t = ((frame * 1.2 + i * 9) % 60) / 60;
    const x = 120 + t * 360;
    salt.push(<circle key={i} cx={x} cy={1080 + Math.sin(i * 2.1 + frame / 6) * 18} r={8} fill="#fff" opacity={x > 440 ? 0.15 : 0.85} />);
  }
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={{x: 540, y: 1000, s: 1.08}} to={{x: 540, y: 980, s: 1.0}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {/* sea */}
          <path d={`M-100 1200 ${[...Array(7)].map((_, i) => `Q ${-60 + i * 50} ${1180 + (i % 2 ? 1 : -1) * 12 + Math.sin(frame / 8) * 4} ${-30 + i * 50} 1200`).join(' ')} V1500 H-100 Z`} fill="#1a6aa8" />
          <text x={40} y={1300} fill="#cfe6ff" fontFamily={FONT.hud} fontWeight={700} fontSize={28}>MAR</text>
          {/* plant */}
          <rect x={300} y={880} width={460} height={320} rx={18} fill="#25486c" stroke="#cfe6ff" strokeWidth={5} />
          <text x={530} y={930} textAnchor="middle" fill="#9fd4ff" fontFamily={FONT.hud} fontWeight={700} fontSize={26} letterSpacing={2}>OSMOSE REVERSA</text>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={340} y={960 + i * 52} width={380} height={36} rx={18} fill="#6aa7d8" stroke="#cfe6ff" strokeWidth={3} />
          ))}
          {/* membrane line */}
          <line x1={460} y1={950} x2={460} y2={1180} stroke={C.yellow} strokeWidth={6} strokeDasharray="10 8" />
          {salt}
          <Flow d="M40 1240 C 120 1240 200 1080 300 1080" width={14} len={500} color="#1a6aa8" />
          <Flow d="M760 1080 C 840 1080 860 1000 930 1000" width={14} len={400} />
          {/* fresh tank */}
          <rect x={900} y={920} width={130} height={170} rx={16} fill="#18324f" stroke="#cfe6ff" strokeWidth={4} />
          <rect x={906} y={980} width={118} height={104} rx={12} fill={C.water} />
          <text x={965} y={1130} textAnchor="middle" fill="#fff" fontFamily={FONT.hud} fontWeight={700} fontSize={24}>ÁGUA DOCE</text>
          <Label at={2} x={530} y={850} text="USINA DE DESSALINIZAÇÃO" size={36} />
        </svg>
      </Cam>
        <Chip at={chipAt} x={540} y={1650} text="FORTALEZA · PREVISÃO 2028" size={48} color={C.water} />
    </AbsoluteFill>
  );
};

/* ---------- Contingency dashboard ---------- */
const BAR_H = 520;
const Gauge: React.FC<{x: number; y: number; w: number; level: number; name: string; alert?: number}> = ({x, y, w, level, name, alert = 0}) => {
  const frame = useCurrentFrame();
  const yel = 0.45,
    red = 0.2;
  const ly = y + BAR_H * (1 - level);
  return (
    <g>
      <rect x={x} y={y} width={w} height={BAR_H} rx={14} fill="#0b1a2c" stroke="#cfe6ff" strokeWidth={3} />
      <rect x={x} y={y + BAR_H * (1 - red)} width={w} height={BAR_H * red} fill={C.red} opacity={0.25} />
      <rect x={x} y={y + BAR_H * (1 - yel)} width={w} height={BAR_H * (yel - red)} fill={C.yellow} opacity={0.22 + alert * 0.35 * (0.6 + 0.4 * Math.sin(frame / 3))} />
      <rect x={x} y={y} width={w} height={BAR_H * (1 - yel)} fill={C.green} opacity={0.18} />
      <rect x={x + 10} y={ly} width={w - 20} height={y + BAR_H - ly - 6} rx={8} fill={C.water} opacity={0.9} />
      <line x1={x - 10} x2={x + w + 10} y1={ly} y2={ly} stroke="#fff" strokeWidth={4} />
      <text x={x + w / 2} y={ly - 14} textAnchor="middle" fill="#fff" fontFamily={FONT.cap} fontWeight={700} fontSize={40}>{Math.round(level * 100)}%</text>
      <text x={x + w / 2} y={y + BAR_H + 44} textAnchor="middle" fill="#9fd4ff" fontFamily={FONT.hud} fontWeight={700} fontSize={26}>{name}</text>
    </g>
  );
};

export const Dashboard: React.FC<{dur: number; cam: CamSpec; t0: number; t1: number; alertAt?: number; okAt?: number; levels: [number, number][]}> = ({dur, cam, t0, t1, alertAt, okAt, levels}) => {
  const frame = useCurrentFrame();
  const t = k(frame, t0, t1);
  const alert = alertAt !== undefined ? k(frame, alertAt, alertAt + 4) : 0;
  return (
    <AbsoluteFill>
      <Blueprint />
      <Cam dur={dur} from={cam.from} to={cam.to}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <Panel x={70} y={520} w={940} h={830} title="MONITORAMENTO · NÍVEL DAS BARRAGENS" />
          <g>
            {['VERDE · NORMAL', 'AMARELO · ALERTA', 'VERMELHO · CRÍTICO'].map((s, i) => (
              <g key={i} transform={`translate(${110 + i * 300},600)`}>
                <rect width={22} height={22} rx={4} fill={[C.green, C.yellow, C.red][i]} />
                <text x={32} y={20} fill="#cfe6ff" fontFamily={FONT.hud} fontWeight={700} fontSize={22}>{s}</text>
              </g>
            ))}
          </g>
          {levels.map(([a, b], i) => (
            <Gauge key={i} x={150 + i * 290} y={680} w={200} level={a + (b - a) * t} name={`BARRAGEM ${'ABC'[i]}`} alert={i === 1 ? alert : 0} />
          ))}
        </svg>
      </Cam>
        {alertAt !== undefined && okAt === undefined && <Chip at={alertAt} x={540} y={1650} text="⚠ GATILHO NO AMARELO: AGIR AGORA" size={42} color={C.yellow} />}
      {okAt !== undefined && <Chip at={okAt} x={540} y={1650} text="✓ CRISE EVITADA ANTES DO FUNDO" size={42} color={C.green} />}
    </AbsoluteFill>
  );
};
