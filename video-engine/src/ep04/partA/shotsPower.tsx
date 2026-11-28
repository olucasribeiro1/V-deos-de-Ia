import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {PlacedDavi} from '../../characters/Davi';
import type {Pose} from '../../characters/types';
import {CardCounter} from '../CardCounter';
import {BigArm, palmOf} from './arm';
import {
  ATM,
  BankCard,
  Car,
  Chip,
  Clip,
  Coin,
  CutFlash,
  DAY,
  DaviRoom,
  EnergyLines,
  FieldBeam,
  FieldLobes,
  Finish,
  HudTag,
  Key,
  NIGHT,
  PalmGlow,
  PopBg,
  Rig,
  SfxWord,
  ShotP,
  Sparkle,
  Stamp,
  StreetWall,
  Svg,
  SweatDrop,
  Vein,
  YEL,
  abs,
  clamp,
  easeOut,
  ev,
  fly,
  headOf,
  kf,
  lerp,
  walkPose,
  wrist,
} from './kit';

/* 1. "O Davi tem o poder de controlar metal." — Davi raises his palm, field lobes bloom. */
export const SOpen: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const P = ev(p, 'L1', 4);
  const C = ev(p, 'L1', 6);
  const up = kf(fr, [2, 12], [0, 1], easeOut);
  const pose: Pose = {shR: lerp(7, 62, up), elR: lerp(-6, 66, up), shL: -10, elL: 8, lean: -3 * up, headTilt: 4 * up};
  const X = 330;
  const Y = 1930;
  const HT = 1250;
  const [hx, hy] = wrist(X, Y, HT, pose);
  const glow = kf(fr, [P, P + 6], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.16, 1.02]} pow={3} punches={[{at: C, amt: 0.07}]} origin={[600, 900]}>
      <PopBg c1="#3d6fe0" c2="#101a46" t={t} cx={hx} cy={hy} />
      <Svg>
        <FieldLobes x={hx + 20} y={hy - 30} ang={-20} scale={lerp(120, 520, glow)} k={glow} frame={fr} />
      </Svg>
      <PlacedDavi x={X} y={Y} height={HT} pose={pose} expr={{smile: 0.6, halfSmile: 0.3, browRaise: 0.35, lookX: 0.5, lookY: -0.1}} light={NIGHT} />
      <Svg>
        <PalmGlow x={hx + 10} y={hy - 20} k={glow} r={110} frame={fr} />
        {/* screws and nuts spiralling in from the edges */}
        {Array.from({length: 7}).map((_, i) => {
          const k = clamp((fr - C - i * 1.5) / 14);
          if (k <= 0) return null;
          const a = random(`op${i}`) * Math.PI * 2;
          const r0 = 700;
          const r = lerp(r0, 140, easeOut(k));
          const aa = a + k * 2.4;
          const x = hx + Math.cos(aa) * r;
          const y = hy - 20 + Math.sin(aa) * r * 0.7;
          return i % 2 ? <Clip key={i} x={x} y={y} s={0.9} rot={fr * 9 + i * 50} /> : <Coin key={i} x={x} y={y} s={0.7} spin={Math.cos(fr * 0.4 + i)} />;
        })}
      </Svg>
      <EnergyLines x={hx} y={hy} r0={140} r1={420} k={glow * 0.8} frame={fr} seed="op" count={12} />
      <HudTag x={540} y={1610} align="center" label="PODER" value="CONTROLAR METAL" k={kf(fr, [C, C + 5], [0, 1])} color={YEL} size={92} />
      <Finish vignette={0.5} grain={0.08} />
      <CutFlash frames={4} />
    </Rig>
  );
};

/* 2. "metal. Mas só" — tight on the palm: small metal bits orbit it. */
export const SOrbit: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const [px, py] = palmOf(1180, 1500, -125, 340);
  const items = ['clip', 'coin', 'key', 'clip', 'coin', 'nut', 'clip'];
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} rot={[-3, 2]} whip="r" origin={[px, py]}>
      <PopBg c1="#2a5ad0" c2="#0b1236" t={t} cx={px} cy={py} />
      <Svg>
        <FieldLobes x={px} y={py} ang={-35} scale={560} k={1} frame={fr} n={6} />
        {items.map((it, i) => {
          const a = t * 3.2 + (i / items.length) * Math.PI * 2;
          const r = 250 + (i % 3) * 60;
          const x = px + Math.cos(a) * r;
          const y = py + Math.sin(a) * r * 0.55;
          const back = Math.sin(a) < 0;
          if (!back) return null;
          return it === 'coin' ? <Coin key={i} x={x} y={y} s={1.1} spin={Math.cos(a * 2)} /> : it === 'key' ? <Key key={i} x={x} y={y} s={1.3} rot={a * 40} /> : <Clip key={i} x={x} y={y} s={1.4} rot={a * 50} />;
        })}
        <BigArm x0={1180} y0={1500} ang={-125} len={340} tense={0.6} light={NIGHT} />
        <PalmGlow x={px} y={py} k={1} r={150} frame={fr} />
        {items.map((it, i) => {
          const a = t * 3.2 + (i / items.length) * Math.PI * 2;
          const r = 250 + (i % 3) * 60;
          const x = px + Math.cos(a) * r;
          const y = py + Math.sin(a) * r * 0.55;
          if (Math.sin(a) < 0) return null;
          return it === 'coin' ? <Coin key={i} x={x} y={y} s={1.3} spin={Math.cos(a * 2)} /> : it === 'key' ? <Key key={i} x={x} y={y} s={1.5} rot={a * 40} /> : <Clip key={i} x={x} y={y} s={1.6} rot={a * 50} />;
        })}
      </Svg>
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/** Dumbbell (side view) centre (x,y). */
const Dumbbell: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#14141a" strokeWidth={6}>
    <rect x={-120} y={-12} width={240} height={24} rx={8} fill="#9aa3b2" />
    {[-1, 1].map((d) => (
      <g key={d}>
        <rect x={d > 0 ? 80 : -140} y={-80} width={60} height={160} rx={14} fill="#2a2d38" />
        <rect x={d > 0 ? 140 : -170} y={-60} width={30} height={120} rx={10} fill="#3a3d4a" />
      </g>
    ))}
    <text x={0} y={-30} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={44} fill="#fff" stroke="#14141a" strokeWidth={3} paintOrder="stroke">
      20 kg
    </text>
  </g>
);

/* 3. "coisa leve." — spoon zips up into his hand, the dumbbell just rattles. */
export const SLeve: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const L = ev(p, 'L1', 11);
  const [px, py] = palmOf(540, -260, 0, 260);
  const spoon = fly([330, 1240], [px - 10, py + 40], (fr - 3) / 7, 0);
  const rattle = Math.sin(fr * 2.2) * 6 * kf(fr, [2, 6], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[0, 40, 0, 0]} whip="u">
      <AbsoluteFill style={{background: 'linear-gradient(#ffe6a8, #f2b84a)'}} />
      <Svg>
        <rect x={0} y={1290} width={1080} height={700} fill="#8a5a36" />
        <rect x={0} y={1290} width={1080} height={26} fill="#a8744a" />
        <ellipse cx={760} cy={1300} rx={210} ry={22} fill="#000" opacity={0.25} />
        <Dumbbell x={760 + rattle * 0.4} y={1210 - Math.abs(rattle) * 0.5} s={1.2} rot={rattle * 0.3} />
        <FieldBeam a={[px, py]} b={[760, 1200]} k={0.5 + 0.3 * Math.sin(fr)} frame={fr} n={3} spread={60} />
        <FieldBeam a={[px, py]} b={[spoon[0], spoon[1]]} k={kf(fr, [2, 6], [0, 1])} frame={fr} n={3} spread={40} />
        <BigArm x0={540} y0={-260} ang={0} len={260} tense={0.5} light={DAY} />
        <PalmGlow x={px} y={py} k={1} r={120} frame={fr} />
        <g transform={`translate(${spoon[0]},${spoon[1]}) rotate(${lerp(0, -70, clamp((fr - 3) / 7))})`}>
          <ellipse cx={-70} cy={0} rx={34} ry={22} fill="#cfd6e2" stroke="#20242c" strokeWidth={5} />
          <rect x={-40} y={-7} width={130} height={14} rx={7} fill="#cfd6e2" stroke="#20242c" strokeWidth={5} />
        </g>
      </Svg>
      <SfxWord x={820} y={1000} text="CLANK" k={fr - 4} size={70} color="#ffffff" rot={8} jitter={10} />
      <Chip x={300} y={1720} text="LEVE ✓" k={kf(fr, [L, L + 5], [0, 1])} color="#1f9d4a" fg="#fff" size={52} />
      <Chip x={780} y={1720} text="PESADO ✗" k={kf(fr, [L + 3, L + 8], [0, 1])} color="#e0302c" fg="#fff" size={52} />
      <Finish vignette={0.4} grain={0.08} />
    </Rig>
  );
};

/* 4. "Clipe, chave, moeda." — room wide: each item flies into his hand on its word. */
export const SGrab: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const W0 = [ev(p, 'L1', 12), ev(p, 'L1', 13), ev(p, 'L1', 14)];
  const pose: Pose = {shL: -82, elL: -8, shR: 12, elR: -16, lean: 2};
  const X = 760;
  const Y = 1560;
  const HT = 860;
  const [hx, hy] = wrist(X, Y, HT, pose, 'L');
  const starts: [number, number][] = [
    [190, 1190],
    [300, 1190],
    [410, 1190],
  ];
  const labels = ['CLIPE', 'CHAVE', 'MOEDA'];
  const pull = kf(fr, [0, 4], [0.4, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.12]} pan={[30, 0, -30, 0]} origin={[480, 1100]}>
      <DaviRoom t={t} deskY={1230} dayK={1} lamp={false}>
        <rect x={90} y={1210} width={420} height={30} rx={6} fill="#8a5a36" />
        <rect x={110} y={1240} width={30} height={320} fill="#6b4428" />
        <rect x={460} y={1240} width={30} height={320} fill="#6b4428" />
      </DaviRoom>
      <Svg>
        <FieldLobes x={hx - 20} y={hy} ang={180} scale={300} k={pull * 0.8} frame={fr} n={4} width={6} />
      </Svg>
      <PlacedDavi x={X} y={Y} height={HT} pose={pose} expr={{smile: 0.7, browRaise: 0.4, lookX: -0.8, lookY: 0.1}} light={DAY} />
      <Svg>
        {starts.map((s, i) => {
          const k = (fr - W0[i]) / 6;
          const target: [number, number] = [hx - 30 - i * 6, hy - 30 + i * 26];
          const pos = k <= 0 ? s : fly(s, target, k, -90);
          const rot = k > 0 ? lerp(0, 360, easeOut(clamp(k))) : 0;
          const beam = k > -2 && k < 1.3 ? 1 : 0;
          return (
            <g key={i}>
              {beam > 0 && <FieldBeam a={[hx - 20, hy]} b={pos} k={0.9} frame={fr} n={3} spread={40} width={5} />}
              {i === 0 ? <Clip x={pos[0]} y={pos[1] - 20} s={1.1} rot={rot} /> : i === 1 ? <Key x={pos[0]} y={pos[1] - 20} s={1.1} rot={rot} /> : <Coin x={pos[0]} y={pos[1] - 25} s={1} spin={k > 0 && k < 1 ? Math.cos(fr) : 1} />}
              <Sparkle x={target[0]} y={target[1]} k={(fr - W0[i] - 5) / 6} s={60} />
            </g>
          );
        })}
      </Svg>
      {labels.map((l, i) => (
        <Chip key={l} x={260 + i * 280} y={1700} text={l} k={kf(fr, [W0[i], W0[i] + 4], [0, 1])} color={YEL} size={48} />
      ))}
      <Finish vignette={0.4} grain={0.08} />
      <CutFlash frames={3} />
    </Rig>
  );
};

/* 5. "Um carro? Nem arranha." — pulls on a car with everything; it doesn't budge. Push to face on "Nem". */
export const SCar: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const C = ev(p, 'L1', 16);
  const N = ev(p, 'L1', 17);
  const strain = kf(fr, [0, 6], [0, 1]);
  const sh = Math.sin(fr * 3) * 4 * strain;
  const pose: Pose = {lean: -14 * strain, shL: -96, elL: 10, shR: -70, elR: -18, hipL: -18, knL: 22, hipR: 24, knR: 6, headTilt: -6};
  const X = 830;
  const Y = 1520;
  const HT = 820;
  const [hx, hy] = wrist(X, Y, HT, pose, 'L');
  const [fx, fy, fr0] = headOf(X, Y, HT, 0, pose.lean);
  const zk = kf(fr, [N - 1, N + 6], [0, 1], easeOut);
  const z = lerp(1, 2.6, zk);
  const ox = lerp(0, 540 - fx, zk);
  const oy = lerp(0, 860 - fy, zk);
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.0]} shakes={[{at: N, dur: 18, amp: 10}]}>
      <AbsoluteFill style={{transform: `translate(${ox}px,${oy}px) scale(${z})`, transformOrigin: `${fx}px ${fy}px`}}>
        <StreetWall t={t} floorY={1420} />
        <Svg>
          <Car x={300} y={1450} s={1.1} shake={Math.sin(fr * 5) * 0.6} />
          <FieldBeam a={[hx, hy]} b={[470, 1280]} k={0.35 + 0.35 * Math.abs(Math.sin(fr * 0.9))} frame={fr} n={4} spread={90} width={5} />
        </Svg>
        <AbsoluteFill style={{transform: `translate(${sh}px,0)`}}>
          <PlacedDavi x={X} y={Y} height={HT} pose={pose} expr={{smile: -0.6, browTilt: -0.8, eyesWide: 0, blink: 0.55, mouthOpen: 0.5, lookX: -0.6}} light={NIGHT} />
          <Svg>
            <Vein x={fx + fr0 * 0.45} y={fy - fr0 * 0.6} s={34} k={kf(fr, [C, C + 4], [0, 1])} frame={fr} />
            <SweatDrop x={fx - fr0 * 0.85} y={fy - fr0 * 0.3} s={30} k={clamp((fr % 14) / 14)} />
            <SweatDrop x={fx + fr0 * 0.95} y={fy - fr0 * 0.1} s={24} k={clamp(((fr + 7) % 14) / 14)} />
          </Svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <Stamp x={540} y={1690} text="CARRO 1.200 kg ✗" sub="NEM MEXEU" k={fr - C} color="#e0302c" size={70} rot={-5} />
      <SfxWord x={760} y={620} text="NNNGH!" k={fr - N} size={96} color="#ffffff" rot={-6} jitter={14} />
      <Finish vignette={0.5} grain={0.1} />
      <CutFlash frames={3} />
    </Rig>
  );
};

/* 6. "E tem efeito colateral:" — Davi strolls to an ATM, card in hand; warning sign slams. */
export const SSide: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const CO = ev(p, 'L2', 3);
  const walkK = clamp(fr / p.dur);
  const X = lerp(260, 470, walkK);
  const pose: Pose = {...walkPose(t, 0, 0.8), shR: 30, elR: -70};
  const [hx, hy] = wrist(X, 1560, 820, pose, 'R');
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} pan={[40, 0, -40, 0]} whip="l">
      <StreetWall t={t} floorY={1480} px={-fr * 2} />
      <Svg>
        <g transform={`translate(${-fr * 2},0)`}>
          <ATM x={860} y={1500} s={0.78} frame={fr} />
          <rect x={560} y={330} width={280} height={150} rx={10} fill="#2f6fd6" stroke="#14141a" strokeWidth={6} opacity={0} />
        </g>
      </Svg>
      <PlacedDavi x={X} y={1560} height={820} pose={pose} expr={{smile: 0.5, lookX: 0.7}} light={NIGHT} />
      <Svg>
        <BankCard x={hx + 10} y={hy - 30} w={110} rot={-20} />
      </Svg>
      <Stamp x={540} y={720} text="⚠ EFEITO COLATERAL" k={fr - CO} color="#1a1420" bg={YEL} size={64} rot={-4} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 7. "chegou perto, cartão de banco apaga." — hand brings the card to the slot; the stripe fizzles. */
export const SSwipe: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const C = ev(p, 'L2', 6);
  const A = ev(p, 'L2', 9);
  const reach = kf(fr, [0, C], [0, 1], easeOut);
  const len = lerp(150, 330, reach);
  const [px, py] = palmOf(1260, 1520, -118, len);
  const dead = kf(fr, [C, A], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.14]} origin={[520, 960]} punches={[{at: C, amt: 0.08}]} shakes={[{at: C + 4, dur: 16, amp: 8}]}>
      <AbsoluteFill style={{background: '#c7ccd6'}} />
      <Svg>
        {/* ATM fascia close-up */}
        <rect x={-20} y={420} width={1120} height={140} fill="#2f6fd6" />
        <rect x={60} y={640} width={560} height={150} rx={30} fill="#2a2d38" stroke="#14141a" strokeWidth={8} />
        <rect x={110} y={696} width={460} height={34} rx={12} fill="#0b0b10" />
        <rect x={140} y={708} width={400} height={10} rx={4} fill={dead > 0.5 ? '#ff4a4a' : '#3be08a'} />
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={100 + (i % 3) * 170} y={960 + Math.floor(i / 3) * 120} width={140} height={90} rx={12} fill="#e8ebf0" stroke="#14141a" strokeWidth={5} />
        ))}
        <FieldLobes x={px} y={py} ang={-28} scale={420} k={0.4 + dead * 0.6} frame={fr} n={4} pulse={1} />
        <BigArm x0={1260} y0={1520} ang={-118} len={len} tense={0.2} light={DAY} />
        <BankCard x={px - 110} y={py - 50} w={330} rot={-28} dead={dead} frame={fr} />
        {dead > 0.05 &&
          Array.from({length: 10}).map((_, i) => {
            const a = random(`sp${i}`) * Math.PI * 2;
            const k = ((fr * 0.12 + random(`spk${i}`)) % 1);
            return <circle key={i} cx={px - 110 + Math.cos(a) * 200 * k} cy={py - 50 + Math.sin(a) * 140 * k} r={6} fill={i % 2 ? '#7fb2ff' : '#fff'} opacity={dead * (1 - k)} />;
          })}
      </Svg>
      <SfxWord x={300} y={1180} text="BZZT" k={fr - C} size={100} color={YEL} rot={-10} jitter={12} />
      <Finish vignette={0.45} grain={0.1} />
      <CutFlash frames={3} />
    </Rig>
  );
};

/* 8. "apaga." — ATM screen: ERRO. */
export const SErro: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  return (
    <Rig dur={p.dur} zoom={[1.45, 1.32]} origin={[540, 980]} shakes={[{at: 0, dur: 14, amp: 16}]} punches={[{at: 1, amt: 0.1}]}>
      <AbsoluteFill style={{background: '#2b3150'}} />
      <Svg>
        <ATM x={540} y={1880} s={1.3} screen="error" frame={fr} glitch={kf(fr, [0, 12], [1, 0.2])} />
      </Svg>
      <AbsoluteFill style={{background: `rgba(255,30,30,${0.25 * (Math.floor(fr / 3) % 2)})`, mixBlendMode: 'screen'}} />
      <SfxWord x={540} y={1240} text="BIIIP!" k={fr - 1} size={90} color="#ff6a6a" rot={4} jitter={8} />
      <Finish vignette={0.6} grain={0.12} />
      <CutFlash frames={3} color="255,60,60" />
    </Rig>
  );
};

/* 9. "Já perdeu onze." — drawer full of crossed-out cards; counter lands on "onze". */
export const SDrawer: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const O = ev(p, 'L2', 12);
  const open = kf(fr, [0, 8], [0, 1], easeOut);
  const cols = ['#2f6fd6', '#1f9d4a', '#7b5ea7', '#e8b84a', '#e5484d', '#2fb5b0', '#2a2d38', '#f07b78', '#4f8fd9', '#5cb85c', '#d9534f'];
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.0]} rot={[-3, 0]} whip="d" punches={[{at: O, amt: 0.06}]}>
      <AbsoluteFill style={{background: '#6b4428'}} />
      <Svg>
        {/* desk top seen from above + open drawer */}
        <rect x={0} y={0} width={1080} height={560} fill="#8a5a36" />
        <rect x={0} y={540} width={1080} height={30} fill="#5a3a24" />
        <g transform={`translate(0,${lerp(-300, 0, open)})`}>
          <rect x={90} y={560} width={900} height={760} rx={20} fill="#4a2e1a" stroke="#2a180c" strokeWidth={10} />
          <rect x={120} y={590} width={840} height={700} rx={12} fill="#2a180c" />
          {cols.map((c, i) => {
            const drop = kf(fr, [i * 1.2, i * 1.2 + 6], [-500, 0], easeOut);
            const x = 780 + (random(`dx${i}`) - 0.5) * 440;
            const y = 1100 - i * 26 + drop;
            return <BankCard key={i} x={x - 240} y={y} w={300} rot={(random(`dr${i}`) - 0.5) * 70} color={c} dead={1} frame={fr} />;
          })}
          <rect x={440} y={1260} width={200} height={40} rx={20} fill="#c9a86c" stroke="#2a180c" strokeWidth={6} />
        </g>
      </Svg>
      <CardCounter value={11} from={O} x={540} y={1670} size={64} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};
