import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {
  Cam2D, Chip, Civ, Cracks, Drop, HudTag, Svg, BigText, Heat,
  ShotP, ev, kf, easeOut, clamp, lerp, smooth, sine, AQUA, RED, YEL, BLUE, HUD_FONT, CAPTION_FONT, fadeIn,
} from './kit';

/* 1. "Abre a torneira, e nada." — close on a kitchen faucet; Davi's hand opens the lever, only air and one drop. */
export const SFaucet: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const open = kf(fr, [4, 14], [0, 1], smooth);
  const ang = -38 * open; // lever rotation
  const piv = {x: 430, y: 800};
  const L = 210;
  const a = (ang * Math.PI) / 180;
  const end = {x: piv.x + Math.cos(a) * L, y: piv.y + Math.sin(a) * L};
  // drop: forms 18–38, falls 40–52, splash 52+
  const tip = {x: 690, y: 1010};
  const nada = ev(p, 'L1', 4);
  const grow = kf(fr, [18, nada - 2], [0, 1], easeOut);
  const fall = fr >= nada ? Math.pow((fr - nada) / 12, 2) : 0;
  const dropY = tip.y + 18 + grow * 10 + fall * 300;
  const splash = fr - (nada + 12);
  const hiss = kf(fr, [14, 20, 34], [0, 1, 0], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.28, 1.4]} origin={[600, 900]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#cfe6ee, #b6d4de)'}}>
        <Svg>
          {/* wall tiles */}
          {Array.from({length: 9}).map((_, i) =>
            Array.from({length: 12}).map((__, j) => (
              <rect key={`${i}-${j}`} x={-40 + i * 140 + (j % 2) * 70} y={j * 110} width={132} height={102} rx={8} fill="#ffffff" opacity={0.28} />
            )),
          )}
          {/* window light */}
          <path d="M760,0 L1080,0 L1080,900 L560,1300 Z" fill="#fff8e0" opacity={0.18} />
          {/* counter + sink */}
          <rect x={0} y={1150} width={1080} height={800} fill="#e9e2d4" />
          <rect x={0} y={1150} width={1080} height={26} fill="#d2c8b4" />
          <path d="M150,1210 L930,1210 L880,1560 Q860,1640 780,1640 L300,1640 Q220,1640 200,1560 Z" fill="#c8d3db" />
          <path d="M190,1230 L890,1230 L848,1540 Q832,1600 770,1600 L310,1600 Q248,1600 232,1540 Z" fill="#a9b8c4" />
          <ellipse cx={690} cy={1560} rx={44} ry={14} fill="#6f7f8c" />
          <ellipse cx={690} cy={1556} rx={26} ry={8} fill="#4b5762" />
          {/* faucet body */}
          <rect x={360} y={1040} width={140} height={120} rx={20} fill="#9aa7b2" />
          <rect x={380} y={820} width={100} height={240} rx={30} fill="url(#chrome)" />
          <path d="M430,840 Q430,700 560,700 Q700,700 700,860 L700,1000 L670,1000 L670,860 Q670,735 560,735 Q462,735 462,840 Z" fill="url(#chrome)" />
          <rect x={662} y={990} width={56} height={30} rx={8} fill="#7f8c97" />
          <defs>
            <linearGradient id="chrome" x1="0" x2="1">
              <stop offset="0" stopColor="#7c8893" />
              <stop offset="0.3" stopColor="#f4f8fb" />
              <stop offset="0.55" stopColor="#b9c4cc" />
              <stop offset="1" stopColor="#6c7884" />
            </linearGradient>
          </defs>
          {/* sleeve + palm (behind the lever) */}
          <path d={`M${end.x + 40},${end.y - 60} L1180,${end.y + 230} L1180,${end.y + 470} L${end.x + 40},${end.y + 50} Z`} fill="#e0a92a" />
          <path d={`M${end.x + 40},${end.y + 30} L1180,${end.y + 420} L1180,${end.y + 470} L${end.x + 40},${end.y + 50} Z`} fill="#a8731a" />
          <rect x={end.x + 40} y={end.y - 66} width={60} height={122} rx={22} fill="#c69a2a" />
          <ellipse cx={end.x + 6} cy={end.y - 14} rx={62} ry={52} fill="#a86a43" />
          {/* lever */}
          <g>
            <line x1={piv.x} y1={piv.y} x2={end.x} y2={end.y} stroke="#8d9aa5" strokeWidth={40} strokeLinecap="round" />
            <line x1={piv.x} y1={piv.y - 8} x2={end.x} y2={end.y - 8} stroke="#eef3f6" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
            <circle cx={piv.x} cy={piv.y} r={34} fill="#c3ccd3" stroke="#7c8893" strokeWidth={6} />
          </g>
          {/* fingers wrapped over the lever */}
          <g transform={`rotate(${ang} ${end.x} ${end.y})`}>
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={end.x - 52 + i * 27} y={end.y - 14} width={25} height={46} rx={12} fill="#b97a52" stroke="#7a4529" strokeWidth={3} />
            ))}
            <ellipse cx={end.x - 58} cy={end.y - 26} rx={16} ry={30} transform={`rotate(-50 ${end.x - 58} ${end.y - 26})`} fill="#c98b5f" stroke="#7a4529" strokeWidth={3} />
          </g>
          {/* air puffs */}
          {hiss > 0 &&
            [0, 1, 2].map((i) => (
              <path key={i} d={`M${tip.x - 30 + i * 30},${tip.y + 30 + ((fr * 6 + i * 20) % 50)} q8,16 0,30`} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={hiss * 0.8} />
            ))}
          {/* the single drop */}
          {grow > 0 && splash < 0 && <Drop x={tip.x} y={dropY} s={lerp(10, 48, grow)} fill="#7fd3ff" />}
          {splash >= 0 && splash < 14 &&
            [-1, -0.4, 0.4, 1].map((d, i) => (
              <circle key={i} cx={tip.x + d * splash * 5} cy={1552 - Math.sin((splash / 14) * Math.PI) * 30 * (1 - Math.abs(d) * 0.3)} r={6} fill="#7fd3ff" opacity={1 - splash / 14} />
            ))}
          {splash >= 0 && <ellipse cx={tip.x} cy={1556} rx={10 + splash * 3} ry={3 + splash} fill="none" stroke="#7fd3ff" strokeWidth={3} opacity={clamp(1 - splash / 18)} />}
        </Svg>
      </AbsoluteFill>
    </Cam2D>
  );
};

/* SP skyline used in shots 2–3. */
const Skyline: React.FC<{y: number; t: number; seed: string; tint?: string; h?: number; n?: number; lit?: number}> = ({y, seed, tint = '#8c7f86', h = 520, n = 16, lit = 0}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const w = 70 + random(`${seed}w${i}`) * 90;
      const x = -120 + (i * 1400) / n + random(`${seed}x${i}`) * 40;
      const bh = h * (0.35 + random(`${seed}h${i}`) * 0.65);
      return (
        <g key={i}>
          <rect x={x} y={y - bh} width={w} height={bh + 400} fill={tint} />
          <rect x={x + w * 0.62} y={y - bh} width={w * 0.38} height={bh + 400} fill="#000" opacity={0.1} />
          {Array.from({length: Math.floor(bh / 46)}).map((_, r) =>
            [0, 1, 2].map((c) =>
              random(`${seed}win${i}-${r}-${c}`) < 0.55 ? (
                <rect key={`${r}-${c}`} x={x + 10 + c * (w - 20) / 3} y={y - bh + 18 + r * 46} width={(w - 20) / 3 - 8} height={22} fill={random(`${seed}l${i}${r}${c}`) < lit ? '#ffe7a3' : '#fff'} opacity={0.35} />
              ) : null,
            ),
          )}
        </g>
      );
    })}
  </g>
);

/* 2. "Em 2015," — São Paulo skyline under a dry, hazy sky; big "2015". */
export const SSP2015: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  return (
    <Cam2D d={p.dur} zoom={[1.06, 1.0]} pan={[30, 0, -30, 0]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#f2c48a 0%, #f6dcb0 45%, #efe2c8 70%)'}}>
        <Svg>
          <circle cx={760} cy={720} r={120} fill="#fff3c8" opacity={0.85} />
          <circle cx={760} cy={720} r={200} fill="#fff3c8" opacity={0.25} />
          <Skyline y={1380} t={t} seed="far" tint="#c9a99a" h={460} n={18} />
          <rect x={0} y={1100} width={1080} height={300} fill="#f2d7b0" opacity={0.35} />
          <Skyline y={1560} t={t} seed="mid" tint="#8f7a80" h={640} n={13} />
          <rect x={0} y={1560} width={1080} height={400} fill="#5f5560" />
          <Heat x={120} y={1500} w={840} t={t} k={0.7} n={7} />
        </Svg>
        <BigText x={540} y={900} text="2015" k={fadeIn(fr, 3, 14)} size={230} color="#ffffff" sub="SÃO PAULO" />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 3. "quase nove milhões de pessoas em São Paulo" — apartment façades, windows light up one by one with people; chip. */
export const SPeople: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const cols = 7;
  const rows = 9;
  const k = kf(fr, [0, ev(p, 'L1', 14)], [0, 1], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.12, 1.0]} origin={[540, 960]} ease={sine}>
      <AbsoluteFill style={{background: '#e9b98a'}}>
        <Svg>
          {[0, 1].map((b) => (
            <g key={b} transform={`translate(${b === 0 ? 40 : 560},${b === 0 ? 420 : 520})`}>
              <rect x={0} y={0} width={480} height={1500} fill={b === 0 ? '#d7d0c5' : '#c4bdb3'} />
              <rect x={0} y={0} width={480} height={24} fill="#9c958c" />
              {Array.from({length: rows}).map((_, r) =>
                Array.from({length: 3}).map((__, c) => {
                  const idx = b * 27 + r * 3 + c;
                  const on = random(`on${idx}`) < k * 1.1;
                  return (
                    <g key={`${r}-${c}`} transform={`translate(${30 + c * 150},${60 + r * 160})`}>
                      <rect width={120} height={110} rx={6} fill={on ? '#ffe2a0' : '#6c7f93'} />
                      <rect y={92} width={120} height={18} fill="#8d867c" />
                      {on && (
                        <g transform={`translate(${30 + random(`px${idx}`) * 60},110)`}>
                          <circle cx={0} cy={-62} r={16} fill="#4a3a33" opacity={0.75} />
                          <path d="M-24,0 Q-24,-40 0,-42 Q24,-40 24,0 Z" fill="#4a3a33" opacity={0.75} />
                        </g>
                      )}
                    </g>
                  );
                }),
              )}
            </g>
          ))}
          <rect x={0} y={0} width={1080} height={1920} fill="url(#dusk)" />
          <defs>
            <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f2b880" stopOpacity={0.15} />
              <stop offset="1" stopColor="#704a3a" stopOpacity={0.35} />
            </linearGradient>
          </defs>
        </Svg>
        <Chip x={540} y={1720} text="SP 2015 · 9 MI DE PESSOAS" k={fadeIn(fr, 4, 12)} color="#ffffff" fg={BLUE} size={46} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 4. "chegaram perto disso." — queue with empty buckets at a dry standpipe. */
export const SQueue: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  return (
    <Cam2D d={p.dur} zoom={[1.04, 1.04]} pan={[60, 0, -60, 0]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#f5d3a0, #f8e6c6 60%)'}}>
        <Svg>
          <rect x={-100} y={1240} width={1300} height={700} fill="#cdb79a" />
          <rect x={-100} y={1240} width={1300} height={18} fill="#a89274" />
          <rect x={-100} y={1700} width={1300} height={260} fill="#8d8a88" />
          {/* wall behind */}
          <rect x={-100} y={820} width={1300} height={420} fill="#e6d0b0" />
          {Array.from({length: 9}).map((_, i) => (
            <rect key={i} x={-80 + i * 150} y={820} width={6} height={420} fill="#000" opacity={0.06} />
          ))}
          {/* dry standpipe */}
          <rect x={120} y={1020} width={40} height={500} fill="#6f7d88" />
          <path d="M120,1040 L230,1040 L230,1080 L160,1080" fill="#8d9aa5" />
          <rect x={210} y={1070} width={30} height={30} fill="#6f7d88" />
          <circle cx={140} cy={1010} r={30} fill="#d0453a" />
        </Svg>
        {[0, 1, 2, 3, 4].map((i) => (
          <Civ
            key={i}
            seed={i * 3 + 2}
            x={330 + i * 190}
            y={1600 + (i % 2) * 20}
            height={720 - i * 12}
            flip
            bucket
            pose={{shR: 12, elR: -8, shL: -10 + Math.sin(t * 2 + i) * 3, headTilt: 4 + Math.sin(t + i) * 2, bob: Math.sin(t * 1.6 + i) * 3}}
            expr={{smile: -0.3, browTilt: 0.5, lookX: -0.6, blink: (fr + i * 13) % 80 < 3 ? 1 : 0}}
          />
        ))}
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 5. "O maior reservatório da cidade" — wide shot of the dry reservoir (Cantareira-style): bathtub ring, dam. */
export const SReservoir: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.12]} pan={[0, 20, 0, -10]} origin={[540, 1000]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#9fd0f0 0%, #d9ecf4 40%, #f3e6c8 60%)'}}>
        <Svg>
          <rect x={-100} y={1000} width={1300} height={1000} fill="#c8a37a" />
          <Cracks x={-60} y={1300} w={1200} h={700} seed="resb" color="#9a7550" width={5} cell={140} />
          <g transform="translate(0,-250)">
          <circle cx={860} cy={560} r={80} fill="#fff7d6" />
          {/* hills */}
          <path d="M-100,1000 Q150,760 420,930 Q640,800 860,900 Q1020,820 1200,960 L1200,1200 L-100,1200 Z" fill="#7fae6a" />
          <path d="M-100,1060 Q220,900 520,1020 Q800,920 1200,1050 L1200,1300 L-100,1300 Z" fill="#6a9a58" />
          {/* bowl with bathtub rings */}
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={540} cy={1330 + i * 26} rx={620 - i * 90} ry={240 - i * 40} fill={['#c8a37a', '#d4b088', '#c09a72', '#d8b892', '#b88f66'][i]} />
          ))}
          <Cracks x={0} y={1180} w={1080} h={500} seed="res" color="#9a7550" width={4} cell={110} />
          {/* tiny remaining water */}
          <ellipse cx={560} cy={1460} rx={170 + Math.sin(t * 2) * 4} ry={46} fill="#4f9fc7" />
          <ellipse cx={540} cy={1452} rx={90} ry={14} fill="#9fd9f5" opacity={0.6} />
          {/* dam wall */}
          <path d="M860,1080 L1120,1040 L1120,1420 L900,1500 Z" fill="#b9b2a6" />
          <path d="M860,1080 L900,1500 L880,1500 L840,1090 Z" fill="#8d877d" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={950 + i * 50} y={1090 - i * 6} width={22} height={36} fill="#6f6a62" />
          ))}
          {/* old high-water line */}
          <path d="M-40,1180 Q540,1110 1120,1180" stroke="#ffffff" strokeWidth={4} strokeDasharray="18 14" fill="none" opacity={0.7} />
          </g>
        </Svg>
        <Chip x={260} y={850} text="NÍVEL NORMAL" k={fadeIn(fr, 10, 18)} color="rgba(255,255,255,0.9)" fg={BLUE} size={30} />
        <HudTag x={540} y={600} label="SISTEMA CANTAREIRA · SP" value="2015" k={fadeIn(fr, 4, 14)} align="center" size={110} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 6. "caiu pra cerca de cinco por cento." — level ruler: water drops to 5 %, cracked ground in front. */
export const SRuler: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const five = ev(p, 'L1', 27);
  const lvl = kf(fr, [0, five + 4], [32, 5], smooth);
  const top = 560;
  const bot = 1300;
  const yOf = (v: number) => bot - ((bot - top) * v) / 100;
  const wy = yOf(lvl);
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.08]} origin={[430, yOf(5)]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#bfe0f2 0%, #efe3c6 55%)'}}>
        <Svg>
          {/* water body */}
          <rect x={-50} y={wy} width={1200} height={1920} fill="#4f8fb0" />
          <path d={`M-50,${wy} ${Array.from({length: 12}).map((_, i) => `Q${i * 100 + 50},${wy - 8 + Math.sin(t * 3 + i) * 6} ${i * 100 + 100},${wy}`).join(' ')}`} fill="#7fc0e0" opacity={0.6} />
          {/* ruler */}
          <rect x={360} y={top - 40} width={140} height={bot - top + 600} fill="#ffffff" stroke="#d0d6dc" strokeWidth={6} />
          {Array.from({length: 21}).map((_, i) => {
            const v = i * 5;
            const y = yOf(v);
            return (
              <g key={i}>
                <rect x={360} y={y - 3} width={i % 2 === 0 ? 70 : 40} height={6} fill={v <= 20 ? RED : '#1c3550'} />
                {i % 4 === 0 && (
                  <text x={448} y={y + 12} fontFamily={HUD_FONT} fontWeight={700} fontSize={34} fill={v <= 20 ? RED : '#1c3550'}>
                    {v}
                  </text>
                )}
              </g>
            );
          })}
          <rect x={360} y={wy} width={140} height={bot - wy + 600} fill="#4f8fb0" opacity={0.55} />
          {/* exposed mud bank + cracks foreground */}
          <path d={`M-50,${wy - 30} Q200,${wy - 70} 330,${wy + 6} L330,1960 L-50,1960 Z`} fill="#c49a6c" />
          <path d={`M540,${wy + 4} Q760,${wy - 80} 1130,${wy - 120} L1130,1960 L540,1960 Z`} fill="#d1a877" />
          <Cracks x={560} y={wy - 40} w={560} h={900} seed="rul" color="#8a6440" width={5} cell={100} />
          <Cracks x={-40} y={wy - 20} w={360} h={900} seed="rul2" color="#8a6440" width={5} cell={100} />
          {/* level marker */}
          <line x1={330} y1={wy} x2={560} y2={wy} stroke={RED} strokeWidth={6} />
          <Heat x={620} y={wy - 40} w={400} t={t} k={0.8} n={5} />
        </Svg>
        <BigText x={760} y={Math.min(wy - 120, 1250)} text={`${Math.round(lvl)}%`} k={fadeIn(fr, 6, 14)} size={190} color={lvl < 12 ? RED : '#ffffff'} />
        <Chip x={760} y={1700} text="CANTAREIRA · ~5% (2015)" k={fadeIn(fr, five - 6, five + 2)} color={RED} fg="#fff" size={40} />
      </AbsoluteFill>
    </Cam2D>
  );
};

export {YEL, CAPTION_FONT, AQUA};
