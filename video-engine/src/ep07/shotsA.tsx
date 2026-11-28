import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Pup} from '../ep02qi/partB/kit';
import {DAVI_OUTFIT} from '../characters/Davi';
import {AldoriaMap, Avenue, Cat, Dragon, FantasySky, Glow, Slime, StatusWindow, Svg, Truck} from './art';
import {DAY, DaviP, DWARF, ELF, HALL, KING, Marked, NIGHT} from './cast';
import {Big, BigChip, Bust, Chip, CutFlash, Eyelids, Finish, HudTag, Panel, Rig, ShotP, SoundWord, SpeedLines, Stamp, Stars, Sweat, Tint, YEL, appear, clamp, easeOut, ev, kf, lerp, run, useShot} from './kit';
import {EL} from './art';

/* =================================================================== n01 — morreu salvando um gato */

/** "Você morreu salvando um gato." — Davi flat on the asphalt with a cartoon halo; the cat sits on his chest. */
export const S01Dead: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.5} s1={1.05} oy={1300}>
      <Avenue t={0} horizon={760} />
      <Pup outfit={DAVI_OUTFIT} x={120} y={1390} height={900} rot={90} light={NIGHT} pose={{shL: -150, elL: 20, shR: 160, elR: -10, hipL: -12, hipR: 12}} expr={{blink: 1, mouthOpen: 0.4, smile: -0.2}} />
      <Svg>
        <ellipse cx={915} cy={1210} rx={100} ry={24} fill="none" stroke={YEL} strokeWidth={12} transform={`rotate(${-8 + Math.sin(t * 4) * 6} 915 1210)`} />
        <Cat x={640} y={1330} s={0.8} t={t} blink={fr % 50 > 46 ? 1 : 0} lick={Math.max(0, Math.sin(t * 8)) * 0.6} />
      </Svg>
      <HudTag x={540} y={640} label="CAUSA DA MORTE" value="☠ UM GATO" k={appear(fr, 10)} align="center" color={YEL} size={100} />
      <Finish vignette={0.5} grain={0.06} />
    </Rig>
  );
};

/** "Sério." — close on the cat, licking its paw, totally unbothered. */
export const S02Serio: React.FC<ShotP> = () => {
  const {t, frame: fr} = useShot();
  return (
    <Rig s0={1.05} s1={1.15} oy={1100}>
      <Avenue horizon={700} />
      <Tint c="#000" o={0.25} />
      <Svg>
        <Cat x={540} y={1500} s={2.6} t={t} lick={0.5 + Math.sin(t * 9) * 0.4} blink={0.5} />
      </Svg>
      <Chip x={540} y={640} text="SÉRIO." k={appear(fr, 2)} size={56} />
      <Finish vignette={0.55} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== n02 — avenida, caminhão, pulo */

/** "O bichano tava parado no meio da avenida," */
export const S03Avenida: React.FC<ShotP> = () => {
  const {t, frame: fr} = useShot();
  return (
    <Rig s0={1.0} s1={1.2} oy={1250} y0={-40}>
      <Avenue horizon={900} t={t * 0.2} />
      <Svg>
        <Cat x={540} y={1330} s={0.75} t={t} look={Math.sin(t * 2)} />
      </Svg>
      <Chip x={540} y={640} text="📍 MEIO DA AVENIDA" k={appear(fr, 8)} size={44} />
      <Finish vignette={0.5} grain={0.06} />
    </Rig>
  );
};

/** "o caminhão vinha voando," — headlights growing, speed lines, 80 km/h. */
export const S04Caminhao: React.FC<ShotP> = (p) => {
  const {t, frame: fr} = useShot();
  const k = kf(fr, [0, p.dur], [0, 1], (x) => x * x);
  return (
    <Rig s0={1.0} s1={1.06} impacts={[{at: p.dur - 8, amp: 10}]}>
      <Avenue horizon={900} t={t} glow={k * 0.5} />
      <Svg>
        <Truck x={540} y={lerp(1000, 2000, k)} s={lerp(0.25, 1.9, k)} lights={1 + k} />
      </Svg>
      <SpeedLines t={t} dir="radial" count={30} opacity={0.35} />
      <HudTag x={80} y={560} label="CAMINHÃO" value="80 km/h" k={appear(fr, 4)} color="#ff6a4a" size={90} />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** "e você nem pensou:" — Davi's face lit by headlights, determined. */
export const S05NemPensou: React.FC<ShotP> = () => {
  const {frame: fr} = useShot();
  return (
    <Rig s0={1.15} s1={1.0} impacts={[{at: 0, amp: 8, zoom: 0.04}]}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 40%, #fff6c8 0%, #f0c860 25%, #3a2a50 70%)'}} />
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={980} r={300} light={{side: 1, rim: '#fff6c8', rimStrength: 1, shadeStrength: 0.7}} pose={{facing: 0.3}} expr={{browTilt: -0.8, smile: -0.2, eyesWide: kf(fr, [0, 6], [0.8, 0.2]), lookX: 0.6}} />
      <Finish vignette={0.5} grain={0.07} />
    </Rig>
  );
};

/** "pulou, empurrou o gato pra calçada..." — slow-mo leap, cat flies to the sidewalk, headlights behind. */
export const S06Pulou: React.FC<ShotP> = (p) => {
  const {t, frame: fr} = useShot();
  const push = ev(p, 'n02', 17);
  const leap = kf(fr, [0, push + 4], [0, 1], easeOut);
  const catK = kf(fr, [push, push + 20], [0, 1], easeOut);
  return (
    <Rig s0={1.08} s1={1.0} x0={40} x1={-40} impacts={[{at: push, amp: 10, zoom: 0.05}]}>
      <Avenue horizon={760} glow={0.35 + 0.2 * Math.sin(t * 20)} />
      <Svg>
        <Cat x={lerp(560, 1000, catK)} y={1300 - Math.sin(catK * Math.PI) * 300} s={0.7} t={t} flip blink={0} />
      </Svg>
      <Pup outfit={DAVI_OUTFIT} x={lerp(80, 400, leap)} y={1400 - Math.sin(leap * Math.PI * 0.9) * 140} height={900} rot={lerp(20, 68, leap)} pivotY={-480} light={NIGHT} pose={{shR: 170, elR: -10, shL: 150, elL: -20, hipL: -40, knL: 50, hipR: 30, knR: 20, facing: 0.6}} expr={{browTilt: -0.8, mouthOpen: 0.7, eyesWide: 0.4}} />
      <SoundWord x={760} y={1000} text="EMPURRA!" k={fr - push} size={120} rot={-6} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(255,246,200,0) 50%, rgba(255,246,200,0.35))'}} />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* =================================================================== n03 — ileso / estatística */

/** "O gato saiu ileso." — cat lands on its feet on the sidewalk, not a scratch. */
export const S07Ileso: React.FC<ShotP> = () => {
  const {t, frame: fr} = useShot();
  const land = kf(fr, [0, 10], [0, 1], easeOut);
  return (
    <Rig s0={1.1} s1={1.0} oy={1300}>
      <Avenue horizon={700} />
      <Svg>
        <rect x={0} y={1350} width={1080} height={600} fill="#7a7a86" />
        <rect x={0} y={1340} width={1080} height={30} fill="#9a9aa6" />
        <Cat x={540} y={lerp(1100, 1400, land)} s={1.5} t={t} smile={0.5} blink={fr > 26 && fr < 32 ? 1 : 0} />
      </Svg>
      <BigChip x={540} y={640} label="GATO" value="100% ✓" k={appear(fr, 8)} color="#3be08a" />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** "Você... virou estatística." — pie chart of accidents; a little Davi icon drops into a slice. */
export const S08Estatistica: React.FC<ShotP> = (p) => {
  const {frame: fr} = useShot();
  const at = ev(p, 'n03', 5);
  const pie = appear(fr, 0, 10);
  const drop = kf(fr, [at, at + 10], [0, 1], easeOut);
  const arc = (a0: number, a1: number, r: number) => {
    const p0 = [540 + r * Math.cos(a0), 1000 + r * Math.sin(a0)];
    const p1 = [540 + r * Math.cos(a1), 1000 + r * Math.sin(a1)];
    return `M 540,1000 L ${p0[0]},${p0[1]} A ${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p1[0]},${p1[1]} Z`;
  };
  return (
    <Rig s0={1.0} s1={1.08}>
      <Panel title="ESTATÍSTICAS DE TRÂNSITO" k={pie} bg="radial-gradient(ellipse 80% 60% at 50% 50%, #3a3a4a, #12121a)" />
      <Svg>
        <g opacity={pie} transform={`translate(540,1000) scale(${lerp(0.6, 1, pie)}) translate(-540,-1000)`}>
          <path d={arc(-Math.PI / 2, 1.3, 300)} fill="#5a8ad8" />
          <path d={arc(1.3, 3.4, 300)} fill="#8a5ad8" />
          <path d={arc(3.4, 4.3, 300)} fill="#d8a85a" />
          <path d={arc(4.3, 3 * Math.PI / 2, 300 + 30 * drop)} fill="#d8443a" />
        </g>
        {drop > 0 && (
          <g transform={`translate(${590},${lerp(500, 820, drop)})`}>
            <circle r={30} fill={DAVI_OUTFIT.skin.base} />
            <rect x={-30} y={30} width={60} height={70} rx={14} fill={DAVI_OUTFIT.top.base} />
          </g>
        )}
      </Svg>
      <Chip x={540} y={1650} text="+1 ESTATÍSTICA" k={appear(fr, at + 6)} color="#d8443a" fg="#fff" size={50} />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== n04 — outro mundo */

/** "Aí você abre o olho." — POV eyelids opening onto a blue fantasy sky. */
export const S09AbreOlho: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const k = kf(fr, [4, 14, 18, 22, 32], [0, 0.4, 0.15, 0.6, 1]);
  return (
    <Rig s0={1.15} s1={1.0}>
      <FantasySky t={t} noHills />
      <AbsoluteFill style={{filter: `blur(${(1 - k) * 14}px)`}} />
      <Eyelids k={k} />
      <Finish vignette={0.6} grain={0.05} />
    </Rig>
  );
};

/** "Céu azul, duas luas lá em cima..." — tilt across the sky, the two moons. */
export const S10DuasLuas: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.25} s1={1.0} y0={220} y1={0}>
      <FantasySky t={t} />
      <HudTag x={540} y={680} label="LUAS NO CÉU" value="2" k={appear(fr, ev(p, 'n04', 7))} align="center" color={YEL} size={120} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "e um dragão do tamanho de um prédio passa raspando na sua cabeça." — shadow, then dragon swoops over Davi. */
export const S11Dragao: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const pass = kf(fr, [ev(p, 'n04', 14) - 4, p.dur], [0, 1], (x) => x);
  const dx = lerp(-1300, 1900, pass);
  const duck = kf(fr, [ev(p, 'n04', 20), ev(p, 'n04', 20) + 6], [0, 1]);
  return (
    <Rig s0={1.05} s1={1.0} impacts={[{at: ev(p, 'n04', 21), amp: 16, dur: 16}]}>
      <FantasySky t={t} px={-pass * 200} />
      <Svg>
        <Dragon x={dx + 120} y={1720} s={1.4} flap={t * 7} shadow />
      </Svg>
      <DaviP x={540} y={1700} height={1000} light={DAY} pose={{lean: -8 * duck, shL: lerp(-10, -160, duck), elL: lerp(0, 40, duck), shR: lerp(10, 160, duck), elR: lerp(0, -40, duck), knL: 40 * duck, knR: 40 * duck, hipL: -30 * duck, hipR: -30 * duck, bob: 120 * duck}} expr={{eyesWide: 1, mouthOpen: 0.6 + 0.4 * duck, browRaise: 1, lookY: -1}} />
      <Svg>
        <Dragon x={dx} y={700} s={1.25} flap={t * 7} />
      </Svg>
      <Chip x={540} y={1620} text="🐉 TAMANHO: 1 PRÉDIO" k={appear(fr, ev(p, 'n04', 16))} size={42} />
      <SpeedLines t={t} dir="left" count={18} opacity={0.3 * pass} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "Eita, P*RRA!" — Davi face-down in the grass, hair standing up, bleep. */
export const S12Eita: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.12} s1={1.0} impacts={[{at: 0, amp: 18, zoom: 0.06}]}>
      <FantasySky t={t} />
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={1000} r={300} light={DAY} pose={{headTilt: Math.sin(t * 40) * 3}} expr={{eyesWide: 1, mouthOpen: 1, browRaise: 1, browTilt: 0.6}} />
      <Sweat x={540} y={760} t={t} s={1.6} />
      <Stamp x={540} y={620} text="#@$%!" k={fr - 4} size={120} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== n05 — outro mundo + tela */

/** "É, parceiro. Você foi parar em outro mundo." — Davi stands up and looks around; chip OUTRO MUNDO. */
export const S13OutroMundo: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const look = Math.sin(t * 3);
  return (
    <Rig s0={1.0} s1={1.12} x0={-30} x1={30}>
      <FantasySky t={t} px={-t * 40} />
      <DaviP x={540} y={1720} height={1150} light={DAY} pose={{facing: look * 0.6, shL: -20, elL: 30, shR: 20, elR: -30, headTilt: look * 6}} expr={{eyesWide: 0.4, mouthOpen: 0.3, browRaise: 0.7, lookX: look}} />
      <BigChip x={540} y={640} label="VOCÊ ESTÁ EM" value="OUTRO MUNDO" k={appear(fr, ev(p, 'n05', 6))} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "E na sua frente aparece uma tela, igual de videogame:" — a glowing blue game window pops in front of him; he pokes it. */
export const S14Tela: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const at = ev(p, 'n05', 12);
  const poke = kf(fr, [ev(p, 'n05', 15), ev(p, 'n05', 15) + 6, ev(p, 'n05', 15) + 12], [0, 1, 0.6]);
  return (
    <Rig s0={1.05} s1={1.12}>
      <FantasySky t={t} />
      <DaviP x={760} y={1800} height={1150} light={DAY} pose={{facing: -0.6, shL: lerp(-20, -95, poke), elL: lerp(20, 5, poke)}} expr={{eyesWide: 0.6, browRaise: 0.8, lookX: -0.8, smile: 0.3}} />
      <StatusWindow x={420} y={900} w={600} k={appear(fr, at, 10)} frame={fr} title="STATUS" rows={[{label: '???', value: '…', bar: 0, k: 1}]} />
      <SoundWord x={420} y={600} text="PLIM!" k={fr - at} size={110} color="#9fe6ff" />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== n06 — status */

const STATS = (p: ShotP, fr: number, extra = 0, magic = 0) => [
  {label: 'FORÇA', value: String(10 + extra), bar: (10 + extra) / 40, color: '#ff8a4a', k: appear(fr, ev(p, 'n06', 2), 6)},
  {label: 'VELOCIDADE', value: String(8 + extra), bar: (8 + extra) / 40, color: '#5ae08a', k: appear(fr, ev(p, 'n06', 4), 6)},
  {label: 'INTELIGÊNCIA', value: String(12 + extra), bar: (12 + extra) / 40, color: '#5ac8ff', k: appear(fr, ev(p, 'n06', 6), 6)},
  {label: 'MAGIA', value: '0', bar: 0, color: '#b85aff', lock: true, k: magic},
];

/** "Nível zero. Força dez, velocidade oito, inteligência doze." — the status window full screen, rows tick in. */
export const S15Status: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.06}>
      <FantasySky t={t} />
      <Tint c="#0a1a40" o={0.45} />
      <StatusWindow y={980} k={appear(fr, 0, 8)} frame={fr} level={fr >= ev(p, 'n06', 0) ? 'NÍVEL 0' : ''} rows={STATS(p, fr, 0, 0)} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "Matou monstro, tudo sobe." — Davi punches a slime; +XP, the bars rise. */
export const S16Slime: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const hit = 8;
  const punch = kf(fr, [0, hit, hit + 6], [0, 1, 0.3]);
  const sq = kf(fr, [hit, hit + 3, hit + 12], [0, 1, 0]);
  const up = kf(fr, [ev(p, 'n06', 10), ev(p, 'n06', 10) + 14], [0, 1]);
  return (
    <Rig s0={1.05} s1={1.0} impacts={[{at: hit, amp: 14, zoom: 0.05}]}>
      <FantasySky t={t} />
      <Svg>
        <Slime x={760} y={1700} s={1.3} squash={sq} hurt={fr > hit ? 1 : 0} />
      </Svg>
      <DaviP x={360} y={1740} height={1050} light={DAY} pose={{lean: 10 * punch, shR: lerp(20, 95, punch), elR: lerp(-60, -5, punch), shL: -30, elL: 80, facing: 0.6}} expr={{browTilt: -0.7, mouthOpen: 0.5, smile: 0.2}} />
      <SoundWord x={760} y={1300} text="POF!" k={fr - hit} size={130} />
      <StatusWindow y={720} w={760} k={appear(fr, 4, 8)} frame={fr} level={`NÍVEL ${up > 0.5 ? 1 : 0}`} rows={STATS(p, fr, Math.round(up * 6), 0).slice(0, 3).map((r) => ({...r, k: 1}))} extra={<div style={{fontFamily: 'Oswald', fontSize: 44, color: YEL, textAlign: 'center', opacity: clamp(up * 3)}}>+XP ▲ TUDO SOBE</div>} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "Menos uma coisa: a magia. Essa tá travada no zero." — MAGIA row slams in red with a shaking padlock. */
export const S17Magia: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const m = ev(p, 'n06', 16);
  const lock = ev(p, 'n06', 19);
  return (
    <Rig s0={1.0} s1={1.15} oy={1150} impacts={[{at: lock, amp: 12}]}>
      <FantasySky t={t} />
      <Tint c="#200a30" o={0.5} />
      <StatusWindow y={980} k={1} frame={fr} level="NÍVEL 0" shake={fr > lock ? kf(fr, [lock, lock + 20], [1, 0.2]) : 0} rows={STATS(p, -999, 0, appear(fr, m, 6)).map((r, i) => (i < 3 ? {...r, k: 0.5} : r))} />
      <Stamp x={540} y={1300} text="TRAVADA" k={fr - lock} size={110} />
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== n07 — Aldoria */

/** "Esse mundo se chama Aldoria e tem quatro nações." — parchment map, camera flies over. */
export const S18Mapa: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const four = ev(p, 'n07', 7);
  const k = (i: number) => appear(fr, four + i * 3, 6);
  return (
    <Rig s0={1.35} s1={1.0} y0={-200} y1={0} r0={-4} r1={0}>
      <AldoriaMap t={t} frame={fr} k={{n: k(0), m: k(1), c: k(2), s: k(3)}} />
      <Chip x={540} y={1760} text="4 NAÇÕES" k={appear(fr, four)} size={48} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/** "No norte, os elfos: arco e cura." — elf archer, healing glow on the other hand. */
export const S19Elfos: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const shoot = ev(p, 'n07', 13);
  const heal = ev(p, 'n07', 15);
  const ax = kf(fr, [shoot + 2, shoot + 14], [400, 1300], (x) => x);
  return (
    <Rig s0={1.1} s1={1.0} x0={-40} x1={40}>
      <FantasySky t={t} />
      <Svg>
        {Array.from({length: 7}).map((_, i) => (
          <g key={i} transform={`translate(${-60 + i * 180},${1500 - (i % 2) * 80})`}>
            <rect x={-18} y={-120} width={36} height={160} fill="#6a4424" />
            <path d="M -110,-100 L 0,-460 L 110,-100 Z" fill="#2a7a3a" />
          </g>
        ))}
      </Svg>
      <Marked outfit={ELF} ears mark={{n: 1, color: EL.vento}} x={430} y={1760} height={1100} light={DAY} pose={{facing: 0.5, shR: 88, elR: 0, shL: 80, elL: -70}} expr={{smile: 0.3, browTilt: -0.3, lookX: 1}} />
      <Svg>
        <path d={`M ${600},${830} Q ${640},${1000} ${600},${1170}`} fill="none" stroke="#8a5a2a" strokeWidth={12} />
        {fr > shoot + 2 && <line x1={ax} y1={1000} x2={ax - 140} y2={1000} stroke="#5a3a1a" strokeWidth={8} />}
        {fr > heal && <Glow x={300} y={1080} r={120} color="#7affa0" o={0.7} />}
      </Svg>
      {fr > heal && <Stars x={300} y={1080} r={110} t={t} color="#bfffd0" />}
      <Chip x={540} y={640} text="🏹 ELFOS · ARCO E CURA" k={appear(fr, 2)} color="#5ab86a" size={44} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "Nas montanhas, os anões, os melhores ferreiros que existem." — dwarf hammering an anvil, sparks. */
export const S20Anoes: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const cyc = (fr % 16) / 16;
  const hammer = cyc < 0.5 ? lerp(-150, 20, cyc * 2) : lerp(20, -150, (cyc - 0.5) * 2);
  const hit = cyc > 0.45 && cyc < 0.62;
  return (
    <Rig s0={1.0} s1={1.12} oy={1300}>
      <AbsoluteFill style={{background: 'linear-gradient(#5a5a6a, #2a2a36 70%)'}} />
      <Svg>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-200 + i * 500},1300 L ${150 + i * 500},500 L ${500 + i * 500},1300 Z`} fill="#6a6a7a" />
        ))}
        <rect x={0} y={1300} width={1080} height={700} fill="#3a3a44" />
        <Glow x={760} y={1350} r={260} color="#ff8a3a" o={0.5} />
        <path d="M 620,1420 L 900,1420 L 860,1480 L 820,1480 L 820,1600 L 700,1600 L 700,1480 L 660,1480 Z" fill="#2a2a30" />
        <rect x={680} y={1395} width={160} height={26} rx={6} fill={hit ? '#ffd23a' : '#ff7a2a'} />
      </Svg>
      <Marked outfit={DWARF} wide={1.35} mark={{n: 2, color: EL.terra}} x={480} y={1650} height={760} light={HALL} pose={{facing: 0.6, shR: hammer, elR: -40, shL: 40, elL: -40}} expr={{browTilt: -0.6, smile: 0.2}} />
      {hit && <Stars x={760} y={1380} r={140} t={t * 3} n={6} color="#ffd23a" />}
      <Chip x={540} y={640} text="⚒ ANÕES · MELHORES FERREIROS" k={appear(fr, 2)} color="#a8a8b8" size={42} />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** "No centro, o reino humano, governado pelo Rei Mago." — castle + Rei Mago on the balcony. */
export const S21Rei: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.2} s1={1.0} y0={-100} y1={0}>
      <FantasySky t={t} noHills />
      <Svg>
        <rect x={140} y={900} width={800} height={1100} fill="#c8c0b0" stroke="#6a5a4a" strokeWidth={8} />
        {[140, 400, 680, 860].map((x, i) => (
          <g key={i}>
            <rect x={x - 20} y={720} width={120} height={300} fill="#d8d0c0" stroke="#6a5a4a" strokeWidth={8} />
            <path d={`M ${x - 40},720 L ${x + 40},560 L ${x + 120},720 Z`} fill="#3a5ad8" stroke="#1e2a6a" strokeWidth={6} />
          </g>
        ))}
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={150 + i * 90} y={870} width={50} height={40} fill="#c8c0b0" stroke="#6a5a4a" strokeWidth={6} />
        ))}
        <rect x={300} y={1420} width={480} height={40} fill="#a89880" />
      </Svg>
      <Marked outfit={KING} crown="crown" mark={{n: 1, color: EL.dourada, glow: 1}} x={540} y={1440} height={620} light={HALL} pose={{shR: 140, elR: -20, shL: -20, elL: 20}} expr={{smile: 0.2, browTilt: -0.2}} />
      <Chip x={540} y={640} text="👑 REINO HUMANO · REI MAGO" k={appear(fr, ev(p, 'n07', 27))} color="#7a4ab8" fg="#fff" size={42} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "E no sul, de onde ninguém volta... o Rei Demônio." — zoom into the dark south, red eyes in the fog. */
export const S22Sul: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const at = ev(p, 'n07', 41);
  const eyes = appear(fr, at, 6);
  return (
    <Rig s0={1.0} s1={1.25} oy={1300} impacts={[{at, amp: 12, dur: 20}]}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, #3a0a0a, #0a0202 70%)'}} />
      <Svg>
        {Array.from({length: 8}).map((_, i) => (
          <ellipse key={i} cx={((i * 190 + t * 40) % 1400) - 160} cy={1200 + (i % 3) * 140} rx={260} ry={60} fill="#8a6a6a" opacity={0.18} />
        ))}
        {[-1, 1].map((sd) => (
          <g key={sd} opacity={eyes}>
            <ellipse cx={540 + sd * 110} cy={1050} rx={70} ry={26 * (0.4 + 0.6 * eyes)} fill="#ff2a1a" style={{filter: 'blur(3px)'}} />
            <ellipse cx={540 + sd * 110} cy={1050} rx={160} ry={70} fill="#ff2a1a" opacity={0.25} style={{filter: 'blur(20px)'}} />
          </g>
        ))}
        <path d="M 200,760 L 300,560 L 360,780 Z M 880,760 L 780,560 L 720,780 Z" fill="#1a0606" opacity={eyes} />
      </Svg>
      <Chip x={540} y={640} text="☠ SUL · NINGUÉM VOLTA" k={appear(fr, 2)} color="#8a1a1a" fg="#fff" size={44} />
      <Big x={540} y={1650} text="REI DEMÔNIO" k={eyes} size={110} color="#ff5a4a" />
      <Finish vignette={0.7} grain={0.08} />
    </Rig>
  );
};
