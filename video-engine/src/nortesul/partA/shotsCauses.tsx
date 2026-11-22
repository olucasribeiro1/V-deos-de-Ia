import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Presenter} from '../Presenter';
import {
  Cam2D, Chip, HudTag, Svg, Studio, Board, Bucket, Tree, Cloud, Cracks, Vapor, Heat, Drop, BigText,
  ShotP, ABS0, ev, kf, easeOut, clamp, lerp, smooth, sine, AQUA, YEL, RED, BLUE, HUD_FONT, CAPTION_FONT,
  brazilPath, mapXY, fadeIn,
} from './kit';

const CAUSES = [
  {icon: '🚰', label: 'DESPERDÍCIO'},
  {icon: '🌳', label: 'DESMATAMENTO'},
  {icon: '🏭', label: 'POLUIÇÃO'},
  {icon: '☀️', label: 'SECAS'},
];

/* 15/20/25. Presenter beside the "CAUSAS" board; row n lights up on its word. */
const CauseBoard: React.FC<ShotP & {n: number; lineId: string; word: number; intro?: boolean}> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const hit = ev(p, p.lineId, p.word);
  const on = kf(fr, [hit - 3, hit + 6], [0, 1], easeOut);
  const boardK = p.intro ? fadeIn(fr, 0, 12) : 1;
  const point = kf(fr, [hit - 6, hit + 6], [0, 1], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.05]} pan={p.n % 2 ? [-20, 0, 10, 0] : [20, 0, -10, 0]} origin={[540, 900]} ease={sine}>
      <Studio t={t + p.n * 4} />
      <Presenter
        absOffset={ABS0 + p.from}
        x={290}
        y={2080}
        height={1320}
        upperOnly
        pose={{shR: lerp(10, 80, point), elR: lerp(0, -25, point), shL: -8, elL: 0, facing: 0.25, headTilt: 2}}
        expr={{smile: 0.4, lookX: lerp(0, 0.5, point)}}
      />
      <Board x={560} y={560} w={480} h={760} title="CAUSAS" step={on > 0.5 || !p.intro ? `${p.n}/4` : undefined} k={boardK}>
        {CAUSES.map((c, i) => {
          const done = i + 1 < p.n;
          const cur = i + 1 === p.n;
          const hl = cur ? on : 0;
          const vis = p.intro ? fadeIn(fr, 4 + i * 4, 12 + i * 4) : 1;
          return (
            <div
              key={c.label}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: i * 140,
                height: 116,
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '0 18px',
                background: hl > 0 ? `rgba(255,210,58,${hl})` : '#eef3f8',
                transform: `scale(${1 + hl * 0.05}) translateY(${(1 - vis) * 20}px)`,
                opacity: vis * (cur || done ? 1 : 0.55),
                boxShadow: hl > 0.5 ? '0 8px 18px rgba(0,0,0,0.18)' : 'none',
              }}
            >
              <div style={{width: 64, height: 64, borderRadius: 32, background: cur ? BLUE : done ? '#3fae6a' : '#b8c4d0', color: '#fff', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {done ? '✓' : i + 1}
              </div>
              <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 44, color: '#14304d', letterSpacing: 1}}>{c.label}</div>
            </div>
          );
        })}
      </Board>
    </Cam2D>
  );
};
export const SCause1: React.FC<ShotP> = (p) => <CauseBoard {...p} n={1} lineId="L4" word={2} intro />;
export const SCause2: React.FC<ShotP> = (p) => <CauseBoard {...p} n={2} lineId="L5" word={0} />;
export const SCause3: React.FC<ShotP> = (p) => <CauseBoard {...p} n={3} lineId="L6" word={0} />;

/* Underground soil layer with x-ray scan. */
const Soil: React.FC<{y: number}> = ({y}) => (
  <g>
    <rect x={-100} y={y} width={1300} height={1920 - y + 100} fill="#7a5a3e" />
    {Array.from({length: 40}).map((_, i) => (
      <circle key={i} cx={random(`st${i}`) * 1080} cy={y + 40 + random(`sty${i}`) * (1900 - y)} r={6 + random(`str${i}`) * 14} fill="#5f452f" opacity={0.6} />
    ))}
  </g>
);

/* 16. "o desperdício: quase quarenta" — street cross-section: x-ray scan reveals the water main and its leaks. */
export const SPipes: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const scan = kf(fr, [2, p.dur - 8], [-100, 1180], smooth);
  const PY = 1080;
  const leaks = [300, 560, 820];
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.06]} pan={[0, 0, -20, 0]} origin={[540, 1080]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#a8d8f2, #e2f2fa 50%)'}}>
        <Svg>
          {/* surface: plant (left) → houses (right) */}
          <rect x={-60} y={620} width={300} height={200} rx={10} fill="#d8e3ea" />
          <rect x={-60} y={620} width={300} height={30} fill="#9fb2c0" />
          <circle cx={60} cy={760} r={46} fill="#4fa8d8" />
          <circle cx={170} cy={760} r={36} fill="#4fa8d8" />
          <text x={90} y={700} fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill={BLUE} textAnchor="middle">ESTAÇÃO</text>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${520 + i * 190},${820})`}>
              <rect x={-70} y={-150} width={140} height={150} fill={['#f2c18a', '#e89a7a', '#a8cfa0'][i]} />
              <path d="M-90,-150 L0,-230 L90,-150 Z" fill="#c4553f" />
              <rect x={-20} y={-70} width={40} height={70} fill="#7a5236" />
            </g>
          ))}
          <rect x={-100} y={820} width={1300} height={40} fill="#6d6d74" />
          <Soil y={860} />
          {/* x-ray layer, clipped to the scanned area */}
          <clipPath id="xr">
            <rect x={-100} y={860} width={scan + 100} height={1200} />
          </clipPath>
          <g clipPath="url(#xr)">
            <rect x={-100} y={860} width={1300} height={1200} fill="#0d2a44" opacity={0.85} />
            {Array.from({length: 12}).map((_, i) => (
              <line key={i} x1={-100} y1={880 + i * 90} x2={1200} y2={880 + i * 90} stroke="#4fc3f7" strokeOpacity={0.08} strokeWidth={2} />
            ))}
            <rect x={-100} y={PY - 34} width={1300} height={68} rx={34} fill="none" stroke="#8fe3ff" strokeWidth={6} />
            <rect x={-100} y={PY - 24} width={1300} height={48} fill="#4fc3f7" opacity={0.35} />
            {Array.from({length: 16}).map((_, i) => (
              <rect key={i} x={((i * 90 + fr * 9) % 1300) - 100} y={PY - 6} width={44} height={12} rx={6} fill="#bff0ff" />
            ))}
            {[520, 710, 900].map((x) => (
              <rect key={x} x={x - 12} y={860} width={24} height={PY - 860} fill="#4fc3f7" opacity={0.45} />
            ))}
            {leaks.map((x, i) => {
              const k = clamp((scan - x) / 60);
              return (
                <g key={x} opacity={k}>
                  {[0, 1, 2, 3, 4].map((j) => {
                    const ph = ((t * 1.6 + j / 5 + i * 0.3) % 1 + 1) % 1;
                    return <circle key={j} cx={x + (j - 2) * 16 * ph} cy={PY + 34 + ph * 120} r={9 * (1 - ph * 0.5)} fill="#7fdcff" opacity={1 - ph} />;
                  })}
                  <ellipse cx={x} cy={PY + 150} rx={60 + 20 * k} ry={22} fill="#4fc3f7" opacity={0.35} />
                  <circle cx={x} cy={PY + 30} r={14} fill="none" stroke={RED} strokeWidth={5} />
                </g>
              );
            })}
          </g>
          {/* scan bar */}
          <rect x={scan - 6} y={860} width={12} height={1100} fill="#bff0ff" opacity={0.9} style={{filter: 'drop-shadow(0 0 14px #4fc3f7)'}} />
        </Svg>
        <Chip x={540} y={1720} text="RAIO-X DA REDE" k={fadeIn(fr, 6, 14)} color="#0d2a44" fg="#8fe3ff" size={40} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 17. "da água tratada se perde" — close on a cracked pipe spraying into the soil; PERDA ~40 %. */
export const SLeak: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const PY = 960;
  const pool = kf(fr, [0, p.dur], [0.3, 1], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.08, 1.18]} origin={[540, PY]} ease={sine}>
      <AbsoluteFill style={{background: '#0d2a44'}}>
        <Svg>
          {Array.from({length: 22}).map((_, i) => (
            <line key={i} x1={0} y1={i * 90} x2={1080} y2={i * 90} stroke="#4fc3f7" strokeOpacity={0.07} strokeWidth={2} />
          ))}
          <ellipse cx={560} cy={PY + 330} rx={380 * pool} ry={90 * pool} fill="#4fc3f7" opacity={0.35} />
          <rect x={-60} y={PY - 90} width={1200} height={180} rx={90} fill="#13466b" stroke="#8fe3ff" strokeWidth={8} />
          <rect x={-60} y={PY - 60} width={1200} height={120} fill="#4fc3f7" opacity={0.3} />
          {Array.from({length: 10}).map((_, i) => (
            <rect key={i} x={((i * 140 + fr * 10) % 1300) - 100} y={PY - 10} width={70} height={20} rx={10} fill="#bff0ff" opacity={0.8} />
          ))}
          {/* crack */}
          <path d={`M520,${PY + 70} L545,${PY + 92} L560,${PY + 76} L590,${PY + 96}`} stroke={RED} strokeWidth={8} fill="none" strokeLinecap="round" />
          {/* jet */}
          {Array.from({length: 26}).map((_, i) => {
            const ph = ((t * 1.4 + i / 26) % 1 + 1) % 1;
            const ang = ((random(`j${i}`) - 0.5) * 70 * Math.PI) / 180;
            const dist = ph * 300;
            return <circle key={i} cx={556 + Math.sin(ang) * dist} cy={PY + 90 + Math.cos(ang) * dist * 0.9 + ph * ph * 60} r={11 * (1 - ph * 0.6)} fill="#8fe3ff" opacity={1 - ph} />;
          })}
          {[0, 1, 2].map((i) => {
            const ph = ((t * 1.1 + i / 3) % 1 + 1) % 1;
            return <circle key={i} cx={556} cy={PY + 90} r={40 + ph * 160} fill="none" stroke="#8fe3ff" strokeWidth={4} opacity={(1 - ph) * 0.5} />;
          })}
        </Svg>
        <HudTag x={540} y={560} label="DA ÁGUA TRATADA" value="PERDA ~40%" k={fadeIn(fr, 2, 12)} align="center" color={YEL} size={120} />
      </AbsoluteFill>
    </Cam2D>
  );
};

const LOST = [1, 4, 6, 8];
/* 18. "em vazamento antes de chegar" — 10 buckets on the way; 4 of them spill and are lost. */
export const SBuckets: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  return (
    <Cam2D d={p.dur} zoom={[1.02, 1.08]} pan={[20, 0, -20, 0]} origin={[540, 960]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#e6f3fa, #c7e2f1)'}}>
        <Svg>
          <rect x={60} y={640} width={960} height={660} rx={36} fill="#ffffff" opacity={0.55} />
          {Array.from({length: 10}).map((_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 175 + col * 182;
            const y = 840 + row * 290;
            const lost = LOST.includes(i);
            const at = 8 + LOST.indexOf(i) * 7;
            const tip = lost ? kf(fr, [at, at + 10], [0, 1], smooth) : 0;
            const drain = lost ? kf(fr, [at + 4, at + 20], [1, 0], smooth) : 1;
            return (
              <g key={i}>
                <Bucket x={x} y={y + Math.sin(t * 3 + i) * 3} s={140} fill={0.85 * drain} tilt={tip * 38} color={lost && tip > 0.6 ? '#c9c9c9' : '#f0a030'} opacity={lost ? lerp(1, 0.55, tip) : 1} />
                {lost && tip > 0.2 &&
                  [0, 1, 2, 3].map((j) => {
                    const ph = ((t * 1.8 + j / 4) % 1 + 1) % 1;
                    return <circle key={j} cx={x + 70 + ph * 30} cy={y - 10 + ph * 110} r={8} fill={AQUA} opacity={drain * (1 - ph)} />;
                  })}
                {lost && tip > 0.6 && (
                  <g opacity={fadeIn(fr, at + 10, at + 16)}>
                    <line x1={x - 50} y1={y - 50} x2={x + 50} y2={y + 50} stroke={RED} strokeWidth={14} strokeLinecap="round" />
                    <line x1={x + 50} y1={y - 50} x2={x - 50} y2={y + 50} stroke={RED} strokeWidth={14} strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}
        </Svg>
        <Chip x={540} y={1720} text="4 DE CADA 10 SE PERDEM" k={fadeIn(fr, 30, 38)} color={RED} fg="#fff" size={44} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 19. "chegar na torneira." — home tap: only 6 of the 10 arrive. */
export const STap6: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  return (
    <Cam2D d={p.dur} zoom={[1.1, 1.0]} origin={[540, 1000]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#fbe9cf, #f3d9b4)'}}>
        <Svg>
          <rect x={0} y={1180} width={1080} height={800} fill="#d9b98c" />
          <rect x={0} y={1180} width={1080} height={20} fill="#b8966a" />
          {/* wall tap */}
          <rect x={120} y={640} width={60} height={60} rx={10} fill="#8d9aa5" />
          <path d="M150,700 L150,760 Q150,800 190,800 L260,800 L260,840 L180,840 Q110,840 110,770 L110,700 Z" fill="#b9c4cc" />
          <circle cx={150} cy={630} r={34} fill="#4fa8d8" />
          {[0, 1, 2].map((i) => {
            const ph = ((t * 2 + i / 3) % 1 + 1) % 1;
            return <rect key={i} x={248} y={846 + ph * 220} width={14} height={30} rx={7} fill={AQUA} opacity={1 - ph * 0.5} />;
          })}
          {Array.from({length: 10}).map((_, i) => {
            const arrived = i < 6;
            const x = 300 + (i % 5) * 160;
            const y = i < 5 ? 1120 : 1440;
            const k = fadeIn(fr, 2 + i * 3, 10 + i * 3);
            return arrived ? (
              <g key={i} opacity={k}>
                <Bucket x={x} y={y} s={120} fill={0.85} />
              </g>
            ) : (
              <g key={i} opacity={k * 0.8}>
                <path d={`M${x - 60},${y - 60} L${x + 60},${y - 60} L${x + 48},${y + 66} L${x - 48},${y + 66} Z`} fill="none" stroke="#9a8a74" strokeWidth={6} strokeDasharray="16 12" />
              </g>
            );
          })}
        </Svg>
        <BigText x={540} y={700} text="6 / 10" k={fadeIn(fr, 6, 16)} size={170} color={BLUE} sub="CHEGAM NA TORNEIRA" />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* Amazon canopy band. */
const Canopy: React.FC<{y: number; t: number; seed: number; n: number; s: number; gone?: (i: number) => number}> = ({y, t, seed, n, s, gone}) => (
  <g>
    {Array.from({length: n}).map((_, i) => (
      <Tree key={i} x={-60 + (i * 1200) / n + random(`tx${seed}${i}`) * 40} y={y + random(`ty${seed}${i}`) * 40} s={s * (0.85 + random(`ts${seed}${i}`) * 0.3)} seed={i + seed} sway={Math.sin(t * 1.5 + i) * 1.5} gone={gone ? gone(i) : 0} />
    ))}
  </g>
);

/* 21. "As árvores da Amazônia soltam" — lush canopy, river, morning mist; gentle pan. */
export const SForest: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  return (
    <Cam2D d={p.dur} zoom={[1.06, 1.06]} pan={[50, 0, -50, 0]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#9fd6ef 0%, #e4f4f0 45%)'}}>
        <Svg>
          <circle cx={820} cy={560} r={70} fill="#fff8d6" />
          <Canopy y={980} t={t} seed={1} n={14} s={210} />
          <rect x={-100} y={960} width={1300} height={60} fill="#ffffff" opacity={0.35} />
          <path d="M-100,1300 Q300,1180 560,1300 Q820,1420 1200,1320 L1200,1400 Q820,1500 560,1380 Q300,1260 -100,1380 Z" fill="#5aa6c9" />
          <Canopy y={1260} t={t} seed={2} n={11} s={300} />
          <rect x={-100} y={1240} width={1300} height={700} fill="#1f6b39" opacity={0} />
          <Canopy y={1620} t={t} seed={3} n={8} s={420} />
          <rect x={-100} y={1600} width={1300} height={400} fill="#1a5c31" />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={((i * 500 + t * 30) % 1500) - 200} cy={1180 + i * 60} rx={260} ry={30} fill="#fff" opacity={0.35} />
          ))}
        </Svg>
        <Chip x={540} y={700} text="AMAZÔNIA" k={fadeIn(fr, 6, 14)} color="#1f6b39" fg="#fff" size={44} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 22. "vapor que vira chuva no Sudeste." — trees exhale vapour that gathers into a cloud. */
export const SVapor: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const cloud = kf(fr, [6, 40], [0, 1], smooth);
  const rain = kf(fr, [ev(p, 'L5', 11) - 4, ev(p, 'L5', 11) + 8], [0, 1], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.08]} pan={[0, 30, 0, -10]} origin={[540, 900]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#8fcbea 0%, #dff1f7 60%)'}}>
        <Svg>
          <Cloud x={540} y={640} s={lerp(200, 640, cloud)} opacity={clamp(cloud * 1.5)} rain={rain} t={t} />
          {[230, 540, 850].map((x, i) => (
            <Vapor key={x} x={x} y={1150} t={t + i * 0.3} k={1 - rain * 0.3} spread={180} n={8} rise={440} />
          ))}
          <Canopy y={1420} t={t} seed={5} n={4} s={520} />
          <rect x={-100} y={1400} width={1300} height={600} fill="#1a5c31" />
        </Svg>
        <Chip x={540} y={1720} text="TRANSPIRAÇÃO → VAPOR → CHUVA" k={fadeIn(fr, 8, 16)} color="#ffffff" fg="#1f6b39" size={38} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 23. "São os rios voadores." — map: a cloud rides an arrow from the Amazon to the Southeast. */
const MAP = {x: 150, y: 560, w: 780};
export const SRivers: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const prog = kf(fr, [4, p.dur - 6], [0, 1], smooth);
  const A = mapXY(-58, -3, MAP);
  const C = mapXY(-66, -16, MAP);
  const B = mapXY(-46.5, -22.5, MAP);
  const bez = (u: number) => ({
    x: (1 - u) * (1 - u) * A.x + 2 * (1 - u) * u * C.x + u * u * B.x,
    y: (1 - u) * (1 - u) * A.y + 2 * (1 - u) * u * C.y + u * u * B.y,
  });
  const N = 40;
  const pts = Array.from({length: N + 1}).map((_, i) => bez((i / N) * prog));
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');
  const head = bez(Math.max(prog, 0.001));
  const prev = bez(Math.max(prog - 0.02, 0));
  const ang = (Math.atan2(head.y - prev.y, head.x - prev.x) * 180) / Math.PI;
  const amaz = mapXY(-62, -4, MAP);
  const sp = mapXY(-46.6, -23.5, MAP);
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.05]} origin={[540, 960]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#cfe9f6, #a9d3ea)'}}>
        <Svg>
          <path d={brazilPath(MAP)} fill="#e9dcbc" stroke="#ffffff" strokeWidth={6} strokeLinejoin="round" />
          <clipPath id="brclip">
            <path d={brazilPath(MAP)} />
          </clipPath>
          <g clipPath="url(#brclip)">
            <ellipse cx={amaz.x} cy={amaz.y} rx={330} ry={210} fill="#3a9a55" />
            <ellipse cx={amaz.x - 40} cy={amaz.y - 20} rx={240} ry={150} fill="#2f8f4e" />
          </g>
          <circle cx={sp.x} cy={sp.y} r={14} fill={BLUE} stroke="#fff" strokeWidth={5} />
          <text x={sp.x + 24} y={sp.y + 46} fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill={BLUE}>SUDESTE</text>
          <text x={amaz.x - 40} y={amaz.y + 10} fontFamily={HUD_FONT} fontWeight={700} fontSize={32} fill="#fff" textAnchor="middle">AMAZÔNIA</text>
          <path d={d} fill="none" stroke={YEL} strokeWidth={16} strokeLinecap="round" strokeDasharray="2 26" />
          <path d={d} fill="none" stroke={YEL} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          {prog > 0.02 && <path d="M0,-22 L32,0 L0,22 Z" fill={YEL} transform={`translate(${head.x},${head.y}) rotate(${ang})`} />}
          <Cloud x={head.x} y={head.y - 70} s={190} rain={prog > 0.9 ? 1 : 0} t={t} />
        </Svg>
        <Chip x={540} y={1720} text="☁️ RIOS VOADORES" k={fadeIn(fr, ev(p, 'L5', 16) - 4, ev(p, 'L5', 16) + 4)} color={YEL} fg="#141414" size={50} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 24. "Menos floresta, menos chuva." — trees vanish one by one; the cloud thins and the rain stops. */
export const SLessForest: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const w2 = ev(p, 'L5', 20);
  const fade = kf(fr, [w2 - 6, w2 + 18], [1, 0.08], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.06, 1.0]} origin={[540, 1000]} ease={sine}>
      <AbsoluteFill style={{background: `linear-gradient(${fade > 0.5 ? '#9ccfe8' : '#c6e3ee'} 0%, #f1ead6 65%)`}}>
        <Svg>
          <Cloud x={540} y={680} s={560 * lerp(0.7, 1, fade)} opacity={fade} rain={clamp(fade * 1.4 - 0.3)} t={t} />
          {[260, 540, 820].map((x, i) => (
            <Vapor key={x} x={x} y={1200} t={t + i * 0.4} k={fade} spread={150} n={6} rise={340} />
          ))}
          <rect x={-100} y={1380} width={1300} height={600} fill={fade > 0.4 ? '#4f8a3e' : '#b49a6a'} />
          <rect x={-100} y={1380} width={1300} height={600} fill="#b49a6a" opacity={1 - fade} />
          <Canopy y={1420} t={t} seed={7} n={7} s={360} gone={(i) => kf(fr, [2 + ((i * 5) % 7) * 4, 10 + ((i * 5) % 7) * 4], [0, 1], smooth)} />
        </Svg>
        <Chip x={300} y={1720} text="− FLORESTA" k={fadeIn(fr, 4, 12)} color="#7a5236" fg="#fff" size={42} />
        <Chip x={780} y={1720} text="− CHUVA" k={fadeIn(fr, w2, w2 + 8)} color={BLUE} fg="#fff" size={42} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 26. "quase metade do esgoto do país" — sewer outfall pouring into a river. */
export const SSewer: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const plume = kf(fr, [0, p.dur], [0.3, 1], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.1]} origin={[400, 1000]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#bcdcec, #e6efe4 45%)'}}>
        <Svg>
          <path d="M-100,560 L1200,560 L1200,980 L-100,1060 Z" fill="#8fb07a" />
          <path d="M-100,900 Q300,860 1200,880 L1200,1960 L-100,1960 Z" fill="#4a90b8" />
          {/* bank + pipe */}
          <path d="M-100,700 L380,760 L420,1000 L-100,1060 Z" fill="#a8885e" />
          <rect x={120} y={830} width={300} height={110} rx={10} fill="#7d8790" />
          <ellipse cx={420} cy={885} rx={30} ry={56} fill="#3c434a" />
          {/* brown flow */}
          {Array.from({length: 14}).map((_, i) => {
            const ph = ((t * 1.3 + i / 14) % 1 + 1) % 1;
            return <circle key={i} cx={430 + ph * 120} cy={890 + ph * ph * 200} r={22 - ph * 8} fill="#7a5a2a" opacity={0.9} />;
          })}
          <ellipse cx={600} cy={1140} rx={240 + plume * 260} ry={80 + plume * 110} fill="#6b5428" opacity={0.75} />
          <ellipse cx={700} cy={1260} rx={150 + plume * 320} ry={50 + plume * 130} fill="#6b5428" opacity={0.5} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${500 + i * 120},${1120 + Math.sin(t * 2 + i) * 10} q40,-14 80,0`} stroke="#9a7a42" strokeWidth={6} fill="none" opacity={0.7} />
          ))}
        </Svg>
        <HudTag x={540} y={1600} label="DO ESGOTO DO PAÍS" value="~50% SEM TRATAMENTO" k={fadeIn(fr, 4, 14)} align="center" color="#fff" size={84} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 27. "não é tratado." — aerial river darkening downstream. */
export const SRiver: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const dark = kf(fr, [0, p.dur], [0.1, 1], smooth);
  const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
  const river = 'M380,-50 C300,300 760,500 620,850 C480,1200 300,1300 460,1600 C560,1800 520,1900 540,2000 L780,2000 C760,1880 800,1780 700,1600 C560,1340 760,1200 860,850 C960,480 520,300 620,-50 Z';
  return (
    <Cam2D d={p.dur} zoom={[1.08, 1.0]} pan={[0, -30, 0, 30]} origin={[540, 960]} ease={sine}>
      <AbsoluteFill style={{background: '#7fa86a'}}>
        <Svg>
          {Array.from({length: 30}).map((_, i) => (
            <circle key={i} cx={random(`rt${i}`) * 1080} cy={random(`ry${i}`) * 1920} r={30 + random(`rr${i}`) * 40} fill="#5f8f4e" />
          ))}
          <defs>
            <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a9ccc" />
              <stop offset={lerp(0.9, 0.15, dark)} stopColor="#4a9ccc" />
              <stop offset={lerp(1, 0.4, dark)} stopColor={mix([74, 156, 204], [70, 60, 36], dark)} />
              <stop offset="1" stopColor={mix([74, 156, 204], [52, 44, 28], dark)} />
            </linearGradient>
          </defs>
          <path d={river} fill="#c9b48a" transform="translate(-30,0) scale(1.06,1)" />
          <path d={river} fill="url(#rv)" />
          {Array.from({length: 10}).map((_, i) => {
            const ph = ((t * 0.4 + i / 10) % 1 + 1) % 1;
            return <path key={i} d={`M${560 + Math.sin(i) * 60},${ph * 1900} q20,-10 40,0`} stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.35 * (1 - ph)} />;
          })}
        </Svg>
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 28. "E, por fim, secas" — blazing sun, thermometer climbing; 4/4 chip. */
export const SSun: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const temp = kf(fr, [0, p.dur], [0.35, 0.92], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.08]} pan={[0, 30, 0, 0]} origin={[540, 860]} ease={sine}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, #fff4c2 0%, #ffc864 25%, #f29a4a 60%, #d9703a 100%)'}}>
        <Svg>
          <g transform={`translate(540,880) rotate(${t * 12})`}>
            {Array.from({length: 16}).map((_, i) => (
              <rect key={i} x={-14} y={-330} width={28} height={90} rx={14} fill="#fff1b0" opacity={0.85} transform={`rotate(${i * 22.5})`} />
            ))}
          </g>
          <circle cx={540} cy={880} r={200} fill="#fff3a8" />
          <circle cx={540} cy={880} r={170} fill="#ffe066" />
          {/* thermometer */}
          <g transform="translate(900,760)">
            <rect x={-26} y={0} width={52} height={360} rx={26} fill="#ffffff" />
            <circle cx={0} cy={380} r={48} fill="#ffffff" />
            <circle cx={0} cy={380} r={36} fill={RED} />
            <rect x={-12} y={360 - 340 * temp} width={24} height={340 * temp + 20} rx={12} fill={RED} />
          </g>
          <path d="M-100,1600 Q540,1540 1200,1600 L1200,2000 L-100,2000 Z" fill="#c48a52" />
          <Heat x={100} y={1580} w={880} t={t} n={8} />
        </Svg>
        <Chip x={540} y={1720} text="4/4 · SECAS MAIS LONGAS" k={fadeIn(fr, 6, 14)} color={YEL} fg="#141414" size={44} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 29. "mais longas." — cracked ground close, dry sprout; calendar flips months without rain. */
export const SDrought: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const MONTHS = ['JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV'];
  const mi = Math.min(MONTHS.length - 1, Math.floor(kf(fr, [2, p.dur - 6], [0, MONTHS.length - 0.01], (x) => x)));
  return (
    <Cam2D d={p.dur} zoom={[1.12, 1.0]} origin={[540, 1100]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#f7c98a 0%, #f2b06a 40%)'}}>
        <Svg>
          <path d="M-100,1000 L1200,940 L1200,2000 L-100,2000 Z" fill="#d6a46c" />
          <Cracks x={-60} y={960} w={1200} h={1000} seed="dr" color="#8a5a32" width={7} cell={150} k={kf(fr, [0, 20], [0.6, 1], easeOut)} />
          {/* dry sprout */}
          <g transform="translate(300,1300)">
            <path d="M0,0 Q-6,-80 10,-140" stroke="#8a6a3a" strokeWidth={8} fill="none" />
            <path d="M6,-110 Q40,-130 58,-100 Q30,-96 6,-110 Z" fill="#b08a4a" />
            <path d="M2,-70 Q-36,-92 -52,-62 Q-26,-58 2,-70 Z" fill="#9a7a3e" />
          </g>
          <Heat x={150} y={1200} w={780} t={t} n={7} />
        </Svg>
        {/* calendar */}
        <div style={{position: 'absolute', left: 620, top: 600, width: 300, height: 320, background: '#fff', borderRadius: 22, boxShadow: '0 16px 30px rgba(0,0,0,0.25)', overflow: 'hidden', transform: `rotate(4deg)`}}>
          <div style={{height: 90, background: RED, color: '#fff', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 60, textAlign: 'center', lineHeight: '90px'}}>{MONTHS[mi]}</div>
          <div style={{textAlign: 'center', fontSize: 120, lineHeight: '210px'}}>☀️</div>
        </div>
        <Chip x={540} y={1720} text="MESES SEM CHUVA" k={fadeIn(fr, 4, 12)} color="#7a4a22" fg="#fff" size={44} />
      </AbsoluteFill>
    </Cam2D>
  );
};

export {Drop};
