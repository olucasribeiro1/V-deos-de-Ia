import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {DAVI_OUTFIT} from '../characters/Davi';
import {Bolt, EL, FantasySky, Glow, Svg, Town} from './art';
import {DAY, DaviP, GUARD, KID, KING, MAGE, MAGE_MARK, Marked, STUDENT, fire, robe} from './cast';
import {AirMolecules, Big, BigChip, Bust, Chip, Finish, HudTag, Panel, Paper, Rig, ShotP, SoundWord, Stamp, Stars, Steam, Tint, YEL, appear, clamp, easeOut, ev, kf, lerp, useShot} from './kit';
import type {Outfit} from '../characters/types';

/* =================================================================== n08 — marcas */

/** "E aqui todo mundo nasce com uma marca no rosto." — a street of marked people; push into a face. */
export const S23Marcas: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const zoom = kf(fr, [ev(p, 'n08', 6), p.dur], [0, 1]);
  return (
    <Rig s0={lerp(1.0, 2.3, zoom)} s1={lerp(1.0, 2.3, zoom)} ox={540} oy={930} ease={(x) => x}>
      <Town px={-t * 30} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Marked key={i} outfit={KID(i + 1)} mark={{n: 1 + (i % 3), color: [EL.fogo, EL.agua, EL.raio, EL.terra, EL.vento][i]}} x={120 + i * 210} y={1620 + (i % 2) * 40} height={i === 2 ? 900 : 760} light={DAY} pose={{facing: (i - 2) * 0.2}} expr={{smile: 0.3}} />
      ))}
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

const MarkCard: React.FC<{p: ShotP; outfit: Outfit; n: number; label: string; value: string; color: string; bg: string; prop?: React.ReactNode; crown?: boolean; extra?: React.ReactNode; pose?: object}> = ({outfit, n, label, value, color, bg, prop, crown, extra, pose = {}}) => {
  const {frame: fr} = useShot();
  return (
    <Rig s0={1.12} s1={1.0}>
      <AbsoluteFill style={{background: bg}} />
      {prop}
      <Marked outfit={outfit} mark={{n, color, glow: 0.9}} crown={crown ? 'crown' : undefined} x={540} y={2250} height={1700} light={DAY} pose={pose} expr={{smile: 0.2}} />
      <BigChip x={540} y={1250} label={label} value={value} k={appear(fr, 2)} />
      {extra}
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "Uma linha? Elite." */
export const S24Uma: React.FC<ShotP> = (p) => <MarkCard p={p} outfit={robe({base: '#7a1a3a', shade: '#4a0a20', light: '#a83a5a'}, 0, {hair: 'quiff', hairColor: '#d8b060'})} n={1} label="1 LINHA" value="ELITE" color={EL.dourada} bg="radial-gradient(circle at 50% 40%, #8a6ad8, #2a1a4a)" crown />;
/** "Duas? Soldado, ferreiro." */
export const S25Duas: React.FC<ShotP> = (p) => <MarkCard p={p} outfit={GUARD} n={2} label="2 LINHAS" value="SOLDADO · FERREIRO" color={EL.agua} bg="radial-gradient(circle at 50% 40%, #6a8aa8, #1a2a3a)" />;
/** "Três? Trabalho pesado, e ninguém nem olha na sua cara." — laborer with a sack; the elite turns his face away. */
export const S26Tres: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const snub = ev(p, 'n08', 20);
  const turn = kf(fr, [snub, snub + 8], [0, 1]);
  return (
    <Rig s0={1.05} s1={1.0} x0={-30} x1={30}>
      <Town px={-200} />
      <Marked outfit={KID(0)} mark={{n: 3, color: EL.terra}} x={380} y={1760} height={1050} light={DAY} pose={{lean: 14, shR: 160, elR: -40, shL: -160, elL: 40, bob: Math.sin(t * 9) * 8}} expr={{browTilt: 0.6, smile: -0.4}}>
        <ellipse cx={0} cy={-1150} rx={190} ry={120} fill="#c8a46a" stroke="#7a5a2a" strokeWidth={8} />
      </Marked>
      <Marked outfit={robe({base: '#7a1a3a', shade: '#4a0a20', light: '#a83a5a'}, 0, {hair: 'quiff', hairColor: '#d8b060'})} mark={{n: 1, color: EL.dourada}} x={820} y={1720} height={1000} light={DAY} flip={turn > 0.5} pose={{facing: lerp(-0.5, 0.8, turn), headTilt: turn * 10}} expr={{browAsym: 0.8, halfSmile: 0.6, blink: 0.4 * turn, lookX: lerp(-1, 1, turn)}} />
      <BigChip x={540} y={1250} label="3 LINHAS" value="TRABALHO PESADO" k={appear(fr, 2)} color="#a87a4a" />
      <Chip x={820} y={900} text="🙄 NEM OLHA" k={appear(fr, snub + 2)} color="#fff" size={40} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== n09 — cor = elemento */

const COLORS: [string, string][] = [
  [EL.fogo, 'FOGO'],
  [EL.agua, 'ÁGUA'],
  [EL.terra, 'TERRA'],
  [EL.vento, 'VENTO'],
  [EL.raio, 'RAIO'],
  [EL.dourada, '???'],
];
/** "E a cor é o elemento." — six coloured orbs orbit Davi. */
export const S27Cores: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.1}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #3a2a6a, #0a0820 75%)'}} />
      <DaviP x={540} y={1750} height={1150} light={{side: 1, rim: '#bfa8ff', rimStrength: 1, shadeStrength: 0.6}} pose={{facing: Math.sin(t * 2) * 0.5}} expr={{eyesWide: 0.5, browRaise: 0.8, lookX: Math.sin(t * 2)}} />
      <Svg>
        {COLORS.map(([c, n], i) => {
          const a = t * 1.6 + (i / 6) * Math.PI * 2;
          const k = appear(fr, i * 3, 6);
          const x = 540 + Math.cos(a) * 400;
          const y = 1000 + Math.sin(a) * 220;
          return (
            <g key={i} opacity={k} transform={`translate(${x},${y}) scale(${k})`}>
              <circle r={90} fill={c} opacity={0.35} style={{filter: 'blur(14px)'}} />
              <circle r={56} fill={c} stroke="#fff" strokeWidth={5} />
              <text y={110} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={40} fill="#fff">{n}</text>
            </g>
          );
        })}
      </Svg>
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/** "E repara: não é truque, é física." — TRUQUE gets crossed out, FÍSICA stamped. */
export const S28Fisica: React.FC<ShotP> = (p) => {
  const {frame: fr} = useShot();
  const cross = ev(p, 'n09', 10);
  const stamp = ev(p, 'n09', 12);
  const ck = kf(fr, [cross, cross + 6], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.08} impacts={[{at: stamp, amp: 12, zoom: 0.05}]}>
      <Paper />
      <Big x={540} y={820} text="TRUQUE" k={appear(fr, 0)} size={170} color="#5a4a3a" />
      <Svg>
        <line x1={240} y1={880} x2={lerp(240, 840, ck)} y2={lerp(880, 760, ck)} stroke="#d8443a" strokeWidth={26} strokeLinecap="round" />
      </Svg>
      <Stamp x={540} y={1180} text="FÍSICA ✓" k={fr - stamp} size={150} color="#1e8a4a" />
      <Finish vignette={0.3} grain={0.08} />
    </Rig>
  );
};

/* =================================================================== mage intro (shared) */
type Elem = keyof typeof MAGE;
const BG: Record<Elem, string> = {
  fogo: 'radial-gradient(circle at 50% 45%, #ff8a3a, #5a0a0a 70%)',
  agua: 'radial-gradient(circle at 50% 45%, #6ac8ff, #0a2a5a 70%)',
  terra: 'radial-gradient(circle at 50% 45%, #c8945a, #3a2410 70%)',
  vento: 'radial-gradient(circle at 50% 45%, #ffffff, #8aa8c8 70%)',
  raio: 'radial-gradient(circle at 50% 45%, #ffe87a, #2a2a5a 70%)',
};
const NAME: Record<Elem, [string, string]> = {fogo: ['VERMELHA', 'FOGO 🔥'], agua: ['AZUL', 'ÁGUA 💧'], terra: ['MARROM', 'TERRA 🪨'], vento: ['BRANCA', 'VENTO 🌪'], raio: ['AMARELA', 'RAIO ⚡']};

/** "<Cor>, <elemento>." — the mage of that colour, close, mark glowing; whoosh in. */
const MageIntro: React.FC<{el: Elem}> = ({el}) => {
  const {frame: fr, t} = useShot();
  const c = MAGE_MARK[el];
  return (
    <Rig s0={1.25} s1={1.05} whipIn="left" impacts={[{at: 0, amp: 8}]}>
      <AbsoluteFill style={{background: BG[el]}} />
      <Svg>
        <Glow x={540} y={1050} r={420} color={c} o={0.35 + 0.1 * Math.sin(t * 8)} />
      </Svg>
      <Marked outfit={MAGE[el]} mark={{n: 2, color: c, glow: 1}} x={540} y={2300} height={1750} light={fire(c)} pose={{shR: 60, elR: -110, facing: 0.15}} expr={{smile: 0.3, halfSmile: 0.5, browTilt: -0.4}} />
      <BigChip x={540} y={1250} label={`MARCA ${NAME[el][0]}`} value={NAME[el][1]} k={appear(fr, 2)} color={el === 'vento' ? '#e8eef8' : c} fg={el === 'raio' || el === 'vento' ? '#141414' : '#fff'} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== n09a fogo */
export const S29Fogo: React.FC<ShotP> = () => <MageIntro el="fogo" />;

/** "O mago junta calor, combustível e oxigênio, o tal triângulo do fogo," — triangle drawn corner by corner. */
export const S30Triangulo: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const c = [ev(p, 'n09a', 5), ev(p, 'n09a', 6), ev(p, 'n09a', 8)];
  const close = ev(p, 'n09a', 11);
  const V: [number, number][] = [
    [540, 720],
    [230, 1260],
    [850, 1260],
  ];
  const lbl = ['CALOR 🔥', 'COMBUSTÍVEL 🪵', 'OXIGÊNIO O₂'];
  const lk = (i: number) => kf(fr, [c[i], c[i] + 8], [0, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.08}>
      <Panel title="TRIÂNGULO DO FOGO" k={appear(fr, 0)} bg="radial-gradient(ellipse 80% 60% at 50% 50%, #5a1a10, #140404)" />
      <Svg>
        {[0, 1, 2].map((i) => {
          const a = V[i];
          const b = V[(i + 1) % 3];
          const k = i === 2 ? kf(fr, [close, close + 8], [0, 1]) : lk(i + 1);
          return <line key={i} x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], k)} y2={lerp(a[1], b[1], k)} stroke="#ffd23a" strokeWidth={14} strokeLinecap="round" />;
        })}
        {V.map(([x, y], i) => (
          <g key={i} opacity={lk(i)} transform={`translate(${x},${y}) scale(${lk(i)})`}>
            <circle r={46} fill="#ff6a2a" stroke="#fff" strokeWidth={6} />
            <text y={i === 0 ? -70 : 100} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={48} fill="#fff">{lbl[i]}</text>
          </g>
        ))}
        {fr > close + 6 && (
          <g transform="translate(540,1090)">
            {Array.from({length: 5}).map((_, i) => {
              const h = 140 + 40 * Math.sin(t * 9 + i);
              return <path key={i} d={`M ${-60 + i * 30},40 q ${10 + Math.sin(t * 7 + i) * 14},${-h * 0.6} 0,${-h} q -30,${h * 0.5} -14,${h}`} fill={i % 2 ? '#ffd23a' : '#ff5a1a'} />;
            })}
          </g>
        )}
      </Svg>
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** Fire jet shooting from the hand across the frame. */
const FireJet: React.FC<{x: number; y: number; len: number; t: number; k: number}> = ({x, y, len, t, k}) => (
  <g>
    {Array.from({length: 26}).map((_, i) => {
      const u = ((i / 26 + t * 2.2) % 1) * k;
      const r = 30 + u * 140;
      const jx = (random(`fj${i}`) - 0.5) * 60 * u;
      return <circle key={i} cx={x + u * len} cy={y + jx + Math.sin(t * 20 + i) * 10 * u} r={r} fill={u < 0.3 ? '#fff4b0' : u < 0.6 ? '#ffb02a' : '#ff4a1a'} opacity={(1 - u) * 0.85} />;
    })}
  </g>
);
/** "e solta tudo num jato." */
export const S31Jato: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const k = kf(fr, [2, 10], [0, 1]);
  return (
    <Rig s0={1.08} s1={1.0} impacts={[{at: 3, amp: 14, dur: 20}]}>
      <FantasySky t={t} />
      <Tint c="#ff6a2a" o={0.25 * k} />
      <Marked outfit={MAGE.fogo} mark={{n: 2, color: EL.fogo, glow: 1}} x={220} y={1760} height={1100} light={fire('#ff8a3a')} pose={{facing: 0.7, shR: 90, elR: 0, shL: 70, elL: -20, lean: -6}} expr={{browTilt: -0.8, mouthOpen: 0.6}} />
      <Svg>
        <FireJet x={420} y={1000} len={900} t={t} k={k} />
      </Svg>
      <Big x={720} y={640} text="FUUUSH!" k={k} size={120} color="#ffd23a" rot={-6} />
      <Finish vignette={0.4} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== n09b água */
export const S32Agua: React.FC<ShotP> = () => <MageIntro el="agua" />;

/** "O ar tá cheio de vapor invisível." — X-ray view: water vapour molecules everywhere in the "empty" air. */
export const S33Vapor: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const show = appear(fr, ev(p, 'n09b', 7), 10);
  return (
    <Rig s0={1.0} s1={1.12}>
      <Panel title="VAPOR D'ÁGUA NO AR" k={show} bg="radial-gradient(ellipse 80% 60% at 50% 50%, #1a4a7a, #06142a)" />
      <Svg>
        {Array.from({length: 60}).map((_, i) => {
          const x = (random(`va${i}`) * 1080 + Math.sin(t * 2 + i) * 40) % 1080;
          const y = 600 + random(`vb${i}`) * 1100 + Math.cos(t * 2.5 + i) * 30;
          return (
            <g key={i} opacity={show * 0.9} transform={`translate(${x},${y}) rotate(${t * 90 + i * 40})`}>
              <circle r={16} fill="#e84a4a" />
              <circle cx={-18} cy={12} r={9} fill="#fff" />
              <circle cx={18} cy={12} r={9} fill="#fff" />
            </g>
          );
        })}
      </Svg>
      <HudTag x={540} y={1650} label="EM CADA m³ DE AR" value="~10 g DE ÁGUA" k={appear(fr, ev(p, 'n09b', 8))} align="center" color="#9fe6ff" size={80} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "Ele esfria o ar em volta da mão, o vapor condensa e vira água," — molecules slow down around the hand and clump into a water ball. */
export const S34Condensa: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const cool = kf(fr, [0, ev(p, 'n09b', 16)], [0, 1]);
  const cond = kf(fr, [ev(p, 'n09b', 18), ev(p, 'n09b', 22) + 6], [0, 1]);
  const temp = Math.round(lerp(25, 3, cool));
  return (
    <Rig s0={1.0} s1={1.1} oy={900}>
      <FantasySky t={t} />
      <Tint c="#0a2a5a" o={0.4} />
      <Marked outfit={MAGE.agua} mark={{n: 2, color: EL.agua, glow: 1}} x={330} y={1800} height={1150} light={fire('#9fe6ff')} pose={{facing: 0.6, shR: 120, elR: -40}} expr={{smile: 0.3, browTilt: -0.3, lookX: 0.8, lookY: -0.6}} />
      <AirMolecules cx={700} cy={760} rx={70} ry={70} progress={cond} t={t} count={50} size={20} seed="cond" spread={4} />
      <Svg>
        <circle cx={700} cy={760} r={220} fill="#9fe6ff" opacity={0.25 * cool} style={{filter: 'blur(20px)'}} />
        <circle cx={700} cy={760} r={lerp(0, 110, cond)} fill="#3aa8ff" stroke="#bff0ff" strokeWidth={6} opacity={0.9} />
        <ellipse cx={670} cy={720} rx={lerp(0, 30, cond)} ry={lerp(0, 16, cond)} fill="#fff" opacity={0.7} />
      </Svg>
      <HudTag x={760} y={1080} label="AR NA MÃO" value={`${temp} °C`} k={appear(fr, 4)} align="center" color={temp < 10 ? '#9fe6ff' : '#fff'} size={90} />
      {cond > 0.3 && <Chip x={700} y={1300} text="VAPOR → ÁGUA" k={cond} color="#3aa8ff" fg="#fff" size={44} />}
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "igual copo gelado suando." — cold glass with drops forming outside. */
export const S35Copo: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.15} s1={1.0}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #f6efe0, #c8b898 75%)'}} />
      <Svg>
        <path d="M 360,700 L 720,700 L 680,1400 L 400,1400 Z" fill="#bfe6ff" opacity={0.55} stroke="#fff" strokeWidth={8} />
        <rect x={380} y={820} width={320} height={560} fill="#7ac8ff" opacity={0.4} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={430 + i * 70} y={860 + i * 60} width={90} height={80} rx={14} fill="#fff" opacity={0.75} transform={`rotate(${i * 20 - 10} ${475 + i * 70} ${900 + i * 60})`} />
        ))}
        {Array.from({length: 22}).map((_, i) => {
          const x = 380 + random(`dr${i}`) * 320;
          const y0 = 760 + random(`dy${i}`) * 560;
          const slide = Math.max(0, fr - 6 - random(`ds${i}`) * 20) * 3 * random(`dv${i}`);
          return <ellipse key={i} cx={x} cy={y0 + slide} rx={8 + random(`dz${i}`) * 6} ry={11 + random(`dz${i}`) * 8} fill="#fff" opacity={clamp((fr - random(`dt${i}`) * 14) / 6) * 0.9} />;
        })}
        <ellipse cx={540} cy={1410} rx={200} ry={20} fill="#6ab8ff" opacity={clamp(fr / 30) * 0.6} />
      </Svg>
      <Chip x={540} y={600} text="🥤 MESMA FÍSICA DO COPO GELADO" k={appear(fr, 2)} color="#3aa8ff" fg="#fff" size={40} />
      <Finish vignette={0.35} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== n09c terra */
export const S36Terra: React.FC<ShotP> = () => <MageIntro el="terra" />;

/** "Ele faz o chão vibrar, os grãos se apertam," — cross-section of soil: grains vibrate and pack tighter. */
export const S37Graos: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const vib = kf(fr, [ev(p, 'n09c', 5), ev(p, 'n09c', 6) + 4], [0, 1]);
  const pack = kf(fr, [ev(p, 'n09c', 8), ev(p, 'n09c', 10) + 8], [0, 1]);
  const cols = 9;
  return (
    <Rig s0={1.0} s1={1.08}>
      <Panel title="CHÃO EM CORTE" k={appear(fr, 0)} bg="radial-gradient(ellipse 80% 60% at 50% 50%, #5a3a1a, #1a0c04)" />
      <Svg>
        <rect x={140} y={700} width={800} height={900} fill="#2a1a0a" stroke="#c8945a" strokeWidth={6} />
        {Array.from({length: 54}).map((_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const loose = [200 + c * 85 + (random(`gx${i}`) - 0.5) * 40, 760 + r * 140 + (random(`gy${i}`) - 0.5) * 60];
          const tight = [205 + c * 84 + (r % 2) * 40, 1590 - (6 - r) * 74];
          const sh = vib * (1 - pack) * 10;
          return <circle key={i} cx={lerp(loose[0], tight[0], pack) + Math.sin(fr * 2.7 + i) * sh} cy={lerp(loose[1], tight[1], pack) + Math.cos(fr * 3.1 + i) * sh} r={38} fill={['#a87a48', '#8a5a30', '#c8945a'][i % 3]} stroke="#3a2410" strokeWidth={4} />;
        })}
      </Svg>
      <HudTag x={540} y={1650} label="ESPAÇO VAZIO" value={`${Math.round(lerp(40, 12, pack))}%`} k={appear(fr, 4)} align="center" color="#ffd8a0" size={90} />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** "e a terra sobe dura feito pedra." — a stone pillar bursts up under the mage's hands. */
export const S38Pilar: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const up = kf(fr, [ev(p, 'n09c', 14) - 2, ev(p, 'n09c', 14) + 10], [0, 1], easeOut);
  return (
    <Rig s0={1.05} s1={1.0} impacts={[{at: ev(p, 'n09c', 14), amp: 18, dur: 18}]}>
      <FantasySky t={t} />
      <Svg>
        <path d={`M 560,1700 L 600,${lerp(1700, 760, up)} L 760,${lerp(1700, 700, up)} L 880,${lerp(1700, 780, up)} L 920,1700 Z`} fill="#8a7a6a" stroke="#4a3a2a" strokeWidth={10} />
        <path d={`M 640,${lerp(1700, 900, up)} L 700,${lerp(1700, 1100, up)} M 820,${lerp(1700, 1000, up)} L 780,${lerp(1700, 1300, up)}`} stroke="#4a3a2a" strokeWidth={8} />
        {up > 0.2 &&
          Array.from({length: 10}).map((_, i) => (
            <rect key={i} x={540 + i * 45 + Math.sin(i) * 20} y={1680 - up * 300 * random(`rk${i}`)} width={30} height={26} fill="#6a5a4a" transform={`rotate(${fr * 10 + i * 40} ${555 + i * 45} 1690)`} />
          ))}
      </Svg>
      <Marked outfit={MAGE.terra} mark={{n: 2, color: EL.terra, glow: 1}} x={260} y={1760} height={1100} light={DAY} pose={{facing: 0.6, shR: lerp(30, 150, up), elR: -20, shL: lerp(-30, 120, up), elL: -20}} expr={{browTilt: -0.7, mouthOpen: 0.4}} />
      <SoundWord x={760} y={620} text="KRAKOOM!" k={fr - ev(p, 'n09c', 14)} size={110} color="#d8b080" />
      <Finish vignette={0.4} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== n09d vento */
export const S39Vento: React.FC<ShotP> = () => <MageIntro el="vento" />;

/** "Vento é só ar correndo da pressão alta pra pressão baixa." — two zones, molecules stream from ALTA to BAIXA. */
export const S40Pressao: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const flow = kf(fr, [ev(p, 'n09d', 6), ev(p, 'n09d', 6) + 10], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.08}>
      <Panel title="PRESSÃO DO AR" k={appear(fr, 0)} bg="radial-gradient(ellipse 80% 60% at 50% 50%, #3a5a7a, #0a1a2a)" />
      <Svg>
        <circle cx={260} cy={1060} r={210} fill="#d8443a" opacity={0.35} />
        <circle cx={820} cy={1060} r={210} fill="#3a7ad8" opacity={0.35} />
        {Array.from({length: 40}).map((_, i) => {
          const base = random(`pm${i}`);
          const u = (base + t * 0.5 * flow) % 1;
          const crowd = i < 28;
          const x = crowd ? lerp(160, 920, flow > 0 ? u : base * 0.25) : 760 + random(`px${i}`) * 140;
          const y = 900 + random(`py${i}`) * 320 + Math.sin(t * 5 + i) * 8;
          return <circle key={i} cx={x} cy={y} r={16} fill="#e8f4ff" stroke="#5a8ab8" strokeWidth={3} />;
        })}
        {flow > 0 && <path d="M 420,1360 L 660,1360 L 640,1330 M 660,1360 L 640,1390" stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" />}
      </Svg>
      <HudTag x={260} y={700} label="ALTA" value="1020 hPa" k={appear(fr, ev(p, 'n09d', 9))} align="center" color="#ff8a7a" size={70} />
      <HudTag x={820} y={700} label="BAIXA" value="990 hPa" k={appear(fr, ev(p, 'n09d', 12))} align="center" color="#8ab8ff" size={70} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "Ele cria essa diferença, e o ar sai empurrando até navio." — gust lines, a sailboat shoots across the lake. */
export const S41Navio: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const push = kf(fr, [ev(p, 'n09d', 20), p.dur], [0, 1], (x) => x * x);
  return (
    <Rig s0={1.0} s1={1.05} x0={0} x1={-60}>
      <FantasySky t={t} horizon={1100} noHills />
      <Svg>
        <rect x={0} y={1100} width={1080} height={820} fill="#3a8ad8" />
        {Array.from({length: 8}).map((_, i) => (
          <path key={i} d={`M ${(i * 160 + t * 300) % 1300 - 100},${1200 + (i % 4) * 160} q 40,-20 80,0`} stroke="#bfe6ff" strokeWidth={6} fill="none" />
        ))}
        <g transform={`translate(${lerp(560, 1500, push)},1300) rotate(${-6 * push})`}>
          <path d="M -170,0 L 170,0 L 120,70 L -120,70 Z" fill="#8a5a2a" />
          <rect x={-6} y={-330} width={12} height={330} fill="#5a3a1a" />
          <path d={`M 6,-320 Q ${110 + push * 60},-170 6,-20 Z`} fill="#fff" stroke="#c8c8d8" strokeWidth={4} />
          <path d={`M -6,-300 Q ${-90 + push * 40},-170 -6,-40 Z`} fill="#f4f4f8" stroke="#c8c8d8" strokeWidth={4} />
        </g>
        {Array.from({length: 14}).map((_, i) => {
          const y = 760 + i * 60;
          const x = ((i * 113 + t * 1400) % 1500) - 300;
          return <path key={i} d={`M ${x},${y} l 260,0`} stroke="#fff" strokeWidth={6} opacity={0.6} strokeLinecap="round" />;
        })}
      </Svg>
      <Marked outfit={MAGE.vento} mark={{n: 2, color: '#e8eef8', glow: 1}} x={170} y={1820} height={1000} light={DAY} pose={{facing: 0.7, shR: 95, elR: 0, shL: 90, elL: -10}} expr={{browTilt: -0.6, mouthOpen: 0.5}} />
      <Big x={600} y={640} text="VUUUSH!" k={appear(fr, ev(p, 'n09d', 20))} size={120} color="#fff" rot={-5} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== n09e raio */
export const S42Raio: React.FC<ShotP> = () => <MageIntro el="raio" />;

/** "Ele separa cargas elétricas, igual nuvem de tempestade," — + rise, − sink inside a storm cloud. */
export const S43Cargas: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const sep = kf(fr, [ev(p, 'n09e', 3), ev(p, 'n09e', 5) + 6], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.1}>
      <Panel title="NUVEM DE TEMPESTADE" k={appear(fr, 0)} bg="radial-gradient(ellipse 80% 60% at 50% 50%, #3a3a5a, #0a0a1a)" />
      <Svg>
        <g fill="#5a5a72">
          <ellipse cx={540} cy={1000} rx={420} ry={260} />
          <ellipse cx={340} cy={900} rx={220} ry={180} />
          <ellipse cx={740} cy={880} rx={240} ry={200} />
          <ellipse cx={540} cy={780} rx={240} ry={180} />
        </g>
        {Array.from({length: 24}).map((_, i) => {
          const plus = i % 2 === 0;
          const x = 220 + random(`cx${i}`) * 640;
          const ymix = 820 + random(`cy${i}`) * 340;
          const y = lerp(ymix, plus ? 700 + random(`cz${i}`) * 120 : 1120 + random(`cz${i}`) * 100, sep) + Math.sin(t * 6 + i) * 6;
          return (
            <text key={i} x={x} y={y} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={64} fill={plus ? '#ff6a5a' : '#6ab8ff'}>
              {plus ? '+' : '−'}
            </text>
          );
        })}
      </Svg>
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** "e a descarga chega a uns trinta mil graus." — bolt from the mage's hand to the ground; thermometer pegs. */
export const S44Descarga: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const strike = ev(p, 'n09e', 12);
  const flash = kf(fr, [strike, strike + 2, strike + 10], [0, 1, 0]);
  const temp = Math.round(kf(fr, [strike, ev(p, 'n09e', 17) + 4], [0, 30000]) / 100) * 100;
  return (
    <Rig s0={1.05} s1={1.0} impacts={[{at: strike, amp: 20, dur: 16, zoom: 0.06}]}>
      <FantasySky t={t} dusk={1} />
      <Tint c="#000" o={0.35} />
      <Marked outfit={MAGE.raio} mark={{n: 2, color: EL.raio, glow: 1}} x={260} y={1780} height={1100} light={fire('#fff6a0')} pose={{facing: 0.6, shR: 150, elR: -10}} expr={{browTilt: -0.8, mouthOpen: 0.6}} />
      <Svg>
        {fr >= strike && fr < strike + 18 && <Bolt x1={420} y1={700} x2={860} y2={1720} seed={`b${Math.floor(fr / 3)}`} k={fr < strike + 12 ? 1 : 0.5} />}
        {fr >= strike && <Glow x={860} y={1720} r={160} color="#fff6a0" o={0.6 * (1 - clamp((fr - strike) / 30))} />}
      </Svg>
      <Tint c="#fffbe0" o={flash * 0.8} />
      <BigChip x={700} y={640} label="DESCARGA" value={`${temp.toLocaleString('pt-BR')} °C`} k={appear(fr, strike)} color={YEL} />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** "Cinco vezes mais quente que a superfície do Sol." — side by side bars: raio 30.000 °C vs Sol 6.000 °C, ×5. */
export const S45Sol: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const k = kf(fr, [2, 18], [0, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.06}>
      <Panel title="QUEM É MAIS QUENTE?" k={appear(fr, 0)} bg="radial-gradient(ellipse 80% 60% at 50% 50%, #5a3a0a, #140a02)" />
      <Svg>
        <rect x={220} y={1300 - 600 * k} width={240} height={600 * k} rx={16} fill="#ffd23a" />
        <rect x={620} y={1300 - 120 * k} width={240} height={120 * k} rx={16} fill="#ff8a2a" />
        <text x={340} y={1370} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={56} fill="#fff">⚡ RAIO</text>
        <text x={740} y={1370} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={56} fill="#fff">☀ SOL</text>
        <text x={340} y={1460 - 600 * k} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={54} fill="#ffd23a">30.000 °C</text>
        <text x={740} y={1460 - 120 * k} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={54} fill="#ff8a2a">~6.000 °C</text>
        <circle cx={880} cy={740} r={90} fill="#ffb02a" />
        {Array.from({length: 12}).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 + t;
          return <line key={i} x1={880 + Math.cos(a) * 110} y1={740 + Math.sin(a) * 110} x2={880 + Math.cos(a) * 150} y2={740 + Math.sin(a) * 150} stroke="#ffb02a" strokeWidth={10} strokeLinecap="round" />;
        })}
      </Svg>
      <Stamp x={540} y={1660} text="×5" k={fr - ev(p, 'n09e', 20)} size={120} color="#d8443a" />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== n09f dourada */

/** "E a dourada, a mais rara de todas, ninguém sabe explicar." — golden glow in the dark, ??? spins. */
export const S46Dourada: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.2} s1={1.0}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #3a2a0a, #050402 70%)'}} />
      <Svg>
        <Glow x={540} y={1000} r={380 + 30 * Math.sin(t * 3)} color="#ffb800" o={0.55} />
        <g transform="translate(540,1000)">
          {[-1, 1].map((sd) => (
            <line key={sd} x1={sd * 40} y1={-20} x2={sd * 160} y2={-50} stroke="#ffe07a" strokeWidth={30} strokeLinecap="round" />
          ))}
        </g>
      </Svg>
      <Stars x={540} y={1000} r={300} t={t} n={8} color="#ffe07a" />
      <BigChip x={540} y={650} label="MARCA DOURADA" value="???" k={appear(fr, 2)} color="#ffb800" />
      <HudTag x={540} y={1620} label="RARIDADE" value="1 EM MILHÕES" k={appear(fr, ev(p, 'n09f', 4))} align="center" color="#ffe07a" size={80} />
      <Finish vignette={0.6} grain={0.07} />
    </Rig>
  );
};

/** "Só o próprio Rei Mago tem." — camera rises to the king on his throne, golden mark pulsing. */
export const S47ReiMago: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.25} oy={850} y0={120} y1={0}>
      <AbsoluteFill style={{background: 'linear-gradient(#2a1a3a, #5a2a5a)'}} />
      <Svg>
        <rect x={0} y={1500} width={1080} height={420} fill="#3a1a2a" />
        <rect x={420} y={1500} width={240} height={420} fill="#a81a2a" />
        <path d="M 300,1550 L 300,600 Q 540,420 780,600 L 780,1550 Z" fill="#c89a2a" stroke="#6a4a0a" strokeWidth={12} />
        <path d="M 360,1550 L 360,680 Q 540,540 720,680 L 720,1550 Z" fill="#7a1a3a" />
        <Glow x={540} y={760} r={200} color="#ffb800" o={0.4 + 0.2 * Math.sin(t * 4)} />
      </Svg>
      <Marked outfit={KING} crown="crown" mark={{n: 1, color: EL.dourada, glow: 1 + 0.5 * Math.sin(t * 6)}} x={540} y={1560} height={1000} light={{side: 1, rim: '#ffd23a', rimStrength: 1, shadeStrength: 0.6}} pose={{shR: 20, elR: -80, shL: -20, elL: 80, hipL: -80, knL: 80, hipR: 80, knR: -80, bob: 160}} expr={{smile: 0.3, halfSmile: 0.6, browTilt: -0.3, browAsym: 0.4}} />
      <Chip x={540} y={1680} text="👑 SÓ O REI MAGO" k={appear(fr, 4)} color="#ffb800" size={48} />
      <Finish vignette={0.5} grain={0.06} />
    </Rig>
  );
};
