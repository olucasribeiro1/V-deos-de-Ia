import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Rig, ShotP, SpeedLines, abs, ev} from './rig';
import {CardCounter} from '../CardCounter';
import {
  Arcs,
  BankCard,
  BigHand,
  Burger,
  CardMachine,
  Chip,
  Clip,
  Confetti,
  CutFlash,
  DAVI_OUTFIT,
  DINER_LIGHT,
  Diner,
  EnergyLines,
  Finger,
  Finish,
  Pup,
  SoundWord,
  Stamp,
  Svg,
  clamp,
  easeOut,
  kf,
  lerp,
} from './kit';

/** Davi's wink overlay (puppet-local units; valid with facing 0, headTilt 0, bob 0, lean 0). */
const Wink: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <g opacity={clamp(k * 3)}>
      <ellipse cx={-41} cy={-888} rx={17} ry={21} fill={DAVI_OUTFIT.skin.base} />
      <path d="M-56,-884 Q-41,-900 -26,-884" stroke="#1c1311" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );

/** Chain over the shoulder (puppet-local units, drawn on the chest). */
const ChainSash: React.FC = () => (
  <g>
    <path d="M-110,-760 Q0,-600 110,-500" stroke="#3c424c" strokeWidth={22} fill="none" />
    <path d="M-110,-760 Q0,-600 110,-500" stroke="#aab3bf" strokeWidth={15} fill="none" strokeDasharray="15 7" />
  </g>
);

/** Foreshortened fist with the index finger pointing straight at the viewer (from ep03). */
const PointAtYou: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  const sk = DAVI_OUTFIT.skin;
  return (
    <Svg>
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <path d="M60,60 L420,700 L800,500 L200,-20 Z" fill={DAVI_OUTFIT.top.base} />
        <ellipse cx={110} cy={40} rx={120} ry={95} fill={DAVI_OUTFIT.top.shade} />
        <ellipse cx={30} cy={10} rx={130} ry={115} fill={sk.base} stroke={sk.shade} strokeWidth={6} />
        {[-60, -10, 40].map((dx) => (
          <path key={dx} d={`M${dx - 30},70 q25,30 50,0`} stroke={sk.shade} strokeWidth={6} fill="none" />
        ))}
        <circle cx={-40} cy={-40} r={70} fill={sk.base} stroke={sk.shade} strokeWidth={6} />
        <circle cx={-40} cy={-40} r={44} fill={sk.light} opacity={0.5} />
        <ellipse cx={-50} cy={-55} rx={26} ry={20} fill="#f3d7c2" stroke={sk.shade} strokeWidth={3} />
      </g>
    </Svg>
  );
};

/* ================================================================== L13 */

/* "Fim feliz?" — back in the diner: Davi, chain as a sash, arms up; confetti, the place cheers. */
export const SFimFeliz: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const b = Math.abs(Math.sin(t * 8));
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} origin={[540, 1000]} whip="u">
      <Diner t={t} />
      <Pup outfit={DAVI_OUTFIT} x={540} y={1760} height={900} light={DINER_LIGHT} pose={{shL: -150 - b * 15, elL: -10, shR: 150 + b * 15, elR: 10, bob: -b * 30}} expr={{smile: 1, mouthOpen: 0.5, blink: 0.9}} chestBadge={<ChainSash />} />
      <Confetti age={fr + 20} n={70} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/* "Quase." — record-scratch: everything freezes grey, push on the smile as it fades. */
export const SQuase: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, 0);
  const d = kf(fr, [4, 16], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.6, 2.0]} origin={[540, 960]} rot={[0, -4]} punches={[{at: 0, amt: 0.08}]}>
      <AbsoluteFill style={{filter: 'saturate(0.25)'}}>
        <Diner t={t} />
        <Pup outfit={DAVI_OUTFIT} x={540} y={1760} height={900} light={DINER_LIGHT} pose={{shL: -150, elL: -10, shR: 150, elR: 10}} expr={{smile: lerp(1, 0.1, d), mouthOpen: lerp(0.5, 0, d), blink: lerp(0.9, 0, d), browTilt: d * 0.6, lookX: 0.7 * d}} chestBadge={<ChainSash />} />
      </AbsoluteFill>
      <CutFlash frames={3} />
      <Finish vignette={0.65} grain={0.12} />
    </Rig>
  );
};

/** Close framing at the register: cashier's hand holds the machine (right), Davi's hand brings the card (left). */
const Register: React.FC<{t: number; fr: number; cardIn: number; text: string; sub?: string; err: number; zap?: number}> = ({t, fr, cardIn, text, sub, err, zap = 0}) => (
  <>
    <AbsoluteFill style={{filter: 'blur(7px)'}}>
      <Diner t={t} />
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'rgba(20,10,30,0.25)'}} />
    <Svg>
      <g transform="translate(700,1000) rotate(-6)">
        <ellipse cx={60} cy={150} rx={150} ry={80} fill={DAVI_OUTFIT.skin.shade} />
      </g>
      <CardMachine x={700} y={960} s={1.5} text={text} sub={sub} err={err} rot={-6} />
      <path d="M760,1230 L1200,1400 L1200,1700 L700,1330 Z" fill="#2f8f7a" />
      <ellipse cx={740} cy={1250} rx={110} ry={70} fill="#e2b08c" stroke="#b07e5c" strokeWidth={5} />
    </Svg>
    <BigHand x={lerp(20, 380, cardIn)} y={1180} angle={-20} s={0.9} variant="point" />
    <Svg>
      <BankCard x={lerp(40, 410, cardIn)} y={1090} s={0.75} rot={-20} />
    </Svg>
    <Arcs x={lerp(40, 410, cardIn)} y={1090} r={150} k={zap} frame={fr} n={5} />
  </>
);

/* "Na hora de pagar o lanche," — at the register, Davi brings the card to the machine. */
export const SPagar: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const cardIn = kf(fr, [0, p.dur], [0, 0.9], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} origin={[600, 1050]} whip="r">
      <Register t={t} fr={fr} cardIn={cardIn} text="R$ 18,90" sub="APROXIME" err={0} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "o cartão não passou." — the machine screams red: CARTÃO INVÁLIDO. */
export const SInvalido: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const pas = ev(p, 'L13', 12);
  const err = fr >= pas ? 1 : 0;
  return (
    <Rig dur={p.dur} zoom={[1.25, 1.4]} origin={[700, 960]} shakes={[{at: pas, amp: 14, dur: 10}]} punches={[{at: pas, amt: 0.1}]}>
      <Register t={t} fr={fr} cardIn={1} text={err ? 'CARTÃO' : 'LENDO...'} sub={err ? 'INVÁLIDO' : undefined} err={err} zap={kf(fr, [0, 4, pas], [0, 0.8, 0])} />
      {err > 0 && <AbsoluteFill style={{background: `rgba(255,30,50,${kf(fr, [pas, pas + 1, pas + 8], [0, 0.35, 0.08])})`}} />}
      <SoundWord x={420} y={700} text="BIP-BIP!" k={fr - pas} size={100} color="#ff4d5a" stroke="#141414" rot={-8} />
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/* "Apagou." — Davi stares at the back of his card: the stripe is scrambled. Small leak of arcs. */
export const SApagou: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} origin={[540, 900]} whip="d">
      <AbsoluteFill style={{filter: 'blur(8px)'}}>
        <Diner t={t} />
      </AbsoluteFill>
      <Pup outfit={DAVI_OUTFIT} x={420} y={2350} height={1800} light={DINER_LIGHT} pose={{shR: 60, elR: -140, facing: 0.3}} expr={{smile: -0.7, browTilt: 1, mouthOpen: 0.15, lookX: 1, lookY: 0.3}} />
      <Svg>
        <BankCard x={700} y={1120} s={1.05} rot={-8} back glitch={0.9} frame={fr} />
      </Svg>
      <Arcs x={640} y={1230} r={180} k={fr % 9 < 3 ? 0.7 : 0} frame={fr} n={3} spread={1.2} dir={-1.6} />
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/* "Era o décimo segundo." — the dead-card drawer: card #12 drops on the pile; counter 11 → 12. */
export const SDoze: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const dec = ev(p, 'L13', 16);
  const seg = ev(p, 'L13', 17);
  const drop = kf(fr, [dec - 6, dec], [0, 1], (x) => x * x);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} rot={[-2, 1]} origin={[540, 1000]} shakes={[{at: dec, amp: 10, dur: 8}]}>
      <AbsoluteFill style={{background: '#5a3a24'}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 4px, transparent 4px 90px)'}} />
      <Svg>
        <rect x={90} y={620} width={900} height={760} rx={20} fill="#3a2414" stroke="#24160c" strokeWidth={10} />
        {Array.from({length: 11}).map((_, i) => (
          <g key={i}>
            <BankCard x={540 + (random(`dz${i}`) - 0.5) * 360} y={1000 + (random(`dy${i}`) - 0.5) * 300} s={0.9} rot={(random(`dr${i}`) - 0.5) * 70} />
            <path d={`M${450 + (random(`dz${i}`) - 0.5) * 360},${920 + (random(`dy${i}`) - 0.5) * 300} l180,160`} stroke="#e0352b" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          </g>
        ))}
        {drop > 0 && <BankCard x={560} y={lerp(300, 1000, drop)} s={lerp(1.6, 1, drop)} rot={lerp(-40, 8, drop)} />}
      </Svg>
      <CardCounter value={12} prev={11} flipAt={dec} from={0} x={540} y={580} size={58} />
      <Stamp x={560} y={1220} text="Nº 12" k={fr - seg} size={120} color="#e0352b" rot={-10} />
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/* ================================================================== L14 */

/* "E tu?" — Davi, burger in hand, points at the viewer. */
export const SETu: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tu = ev(p, 'L14', 1);
  const pt = kf(fr, [tu - 5, tu + 1], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} origin={[540, 1000]} whip="l" punches={[{at: tu, amt: 0.06}]}>
      <Diner t={t} />
      <Pup outfit={DAVI_OUTFIT} x={540} y={2150} height={1350} light={DINER_LIGHT} pose={{shR: 20, elR: -30, shL: -30, elL: 120}} expr={{smile: 0.6, halfSmile: 0.6, browRaise: 0.6, mouthOpen: fr < tu + 6 ? 0.3 : 0, lookX: 0}} handProps={{L: <Burger s={0.7} y={20} />}} />
      {pt > 0 && <PointAtYou x={lerp(1150, 790, pt)} y={lerp(1600, 1270, pt)} s={lerp(0.8, 1.05, pt)} />}
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "O que tu ia puxar" — the paperclip on the counter wobbles and lifts on Davi's yellow field. */
export const SPuxar: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const pux = ev(p, 'L14', 6);
  const lift = kf(fr, [pux, p.dur], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.3, 1.45]} origin={[600, 1050]} pan={[0, 0, 0, -20]}>
      <Diner t={t} />
      <Pup outfit={DAVI_OUTFIT} x={300} y={2000} height={1200} light={DINER_LIGHT} pose={{shR: 70, elR: -40, shL: -30, elL: 120}} expr={{halfSmile: 1, browAsym: 0.6, lookX: 1, lookY: 0.4}} handProps={{L: <Burger s={0.7} y={20} />}} />
      <Svg>
        <Clip x={720 + Math.sin(t * 30) * 3 * (1 - lift)} y={lerp(1110, 950, lift)} s={0.8} rot={lerp(80, 20, lift)} glow={lift} />
      </Svg>
      <EnergyLines x={720} y={lerp(1110, 950, lift)} r0={50} r1={150} k={0.4 + lift * 0.6} frame={fr} seed="pu" count={10} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "primeiro com esse poder?" — the paperclip flies straight at the camera. */
export const SClipe: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const u = kf(fr, [0, p.dur], [0, 1], (x) => x * x * x);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.05]} origin={[540, 960]} shakes={[{at: p.dur - 3, amp: 16, dur: 6}]}>
      <AbsoluteFill style={{filter: `blur(${u * 6}px)`}}>
        <Diner t={t} />
        <Pup outfit={DAVI_OUTFIT} x={420} y={2100} height={1250} light={DINER_LIGHT} pose={{shR: 85, elR: -10, shL: -30, elL: 120}} expr={{smile: 0.8, halfSmile: 1, lookX: 0.2}} handProps={{L: <Burger s={0.7} y={20} />}} />
      </AbsoluteFill>
      <EnergyLines x={760} y={1150} r0={60} r1={180} k={1 - u} frame={fr} seed="cl" count={10} />
      <SpeedLines k={u * 0.7} t={t} />
      <Svg>
        <Clip x={lerp(760, 540, u)} y={lerp(1000, 900, u)} s={lerp(1, 9, u)} rot={lerp(20, 45, u) + fr * 6 * (1 - u)} glow={1} />
      </Svg>
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "Comenta aí." — clip stuck on the lens (corner); Davi winks on "aí". */
export const SComenta: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const ai = ev(p, 'L14', 12);
  const wink = kf(fr, [ai, ai + 2, ai + 12, ai + 14], [0, 1, 1, 0]);
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} origin={[540, 1000]} punches={[{at: 0, amt: 0.06}]}>
      <Diner t={t} />
      <Pup outfit={DAVI_OUTFIT} x={540} y={2150} height={1350} light={DINER_LIGHT} pose={{shR: 10, elR: -10, shL: -30, elL: 120}} expr={{smile: 0.9, halfSmile: 0.4, browRaise: 0.4}} handProps={{L: <Burger s={0.7} y={20} />}}>
        <Wink k={wink} />
      </Pup>
      <Svg>
        <Clip x={170} y={640} s={4.5} rot={35} />
      </Svg>
      <Chip x={540} y={1700} text="💬 COMENTA AÍ" k={kf(fr, [2, 8], [0, 1])} color="#ffd23a" size={50} />
      <CutFlash frames={3} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* hard cut to black (the @Odavi_contos card is appended later). */
export const SBlack: React.FC<ShotP> = () => <AbsoluteFill style={{background: '#000'}} />;
