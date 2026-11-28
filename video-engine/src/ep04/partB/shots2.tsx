import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Rig, ShotP, SpeedLines, abs, ev} from './rig';
import {
  Arcs,
  BIKE,
  BigHand,
  Bike,
  Chip,
  DAVI_OUTFIT,
  EnergyLines,
  Finish,
  FreezeFrame,
  HudTag,
  PoliceCar,
  Pup,
  Rider,
  Robber,
  STREET_LIGHT,
  SoundWord,
  Stamp,
  Street,
  Svg,
  Sweat,
  clamp,
  easeOut,
  kf,
  lerp,
  run,
} from './kit';

/** A parked/empty bike at screen (x,y) (ground point), h = matching puppet height px. */
const BikeAt: React.FC<{x: number; y: number; h: number; crank?: number; chain?: number; wheel?: number}> = ({x, y, h, crank = 0, chain = 1, wheel = 0}) => {
  const k = h / 1000;
  return (
    <svg width={1400 * k} height={1300 * k} viewBox="-700 -1150 1400 1300" style={{position: 'absolute', left: x - 700 * k, top: y - 1150 * k, overflow: 'visible'}}>
      <Bike crank={crank} chain={chain} wheel={wheel} />
    </svg>
  );
};

/** Wavy chain (dashed) between two screen points. */
const ChainLine: React.FC<{a: [number, number]; b: [number, number]; t: number; wave?: number; glow?: number}> = ({a, b, t, wave = 30, glow = 0}) => {
  const n = 24;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const pts = Array.from({length: n + 1}).map((_, i) => {
    const u = i / n;
    const w = Math.sin(u * Math.PI * 3 + t * 20) * wave * Math.sin(u * Math.PI);
    return `${i ? 'L' : 'M'}${(a[0] + dx * u + nx * w).toFixed(1)},${(a[1] + dy * u + ny * w).toFixed(1)}`;
  });
  const d = pts.join(' ');
  return (
    <g style={glow ? {filter: `drop-shadow(0 0 ${12 * glow}px #ffd23a)`} : undefined}>
      <path d={d} stroke="#2a2e36" strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#c7ced8" strokeWidth={24} fill="none" strokeDasharray="22 10" />
    </g>
  );
};

/* ================================================================== L11 */

/* "O ladrão corre pra bicicleta." — robber bolts out of the diner and jumps on a parked bike. */
export const SFoge: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const bic = ev(p, 'L11', 4);
  const u = kf(fr, [0, bic], [0, 1], (x) => x);
  const rid = fr >= bic;
  const go = Math.max(0, fr - bic);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[0, 0, -60, 0]} origin={[700, 1300]} whip="r">
      <Street t={t} ox={-40} />
      {!rid && <BikeAt x={830} y={1480} h={620} />}
      {!rid && (
        <Robber x={lerp(560, 760, u)} y={1470} height={640} light={STREET_LIGHT} pose={{...run(t), facing: 0.6}} expr={{eyesWide: 0.8, mouthOpen: 0.6, browTilt: 1, lookX: 1}} />
      )}
      {rid && <Rider x={830 + go * 3} y={1480} h={620} crank={go * 0.5} wheel={go * 0.12} expr={{smile: 0.5, halfSmile: 1, browTilt: -0.6}} />}
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "Bicicleta é pesada." — Davi at the door pulls at the bike: nothing. HUD: BICICLETA 12 kg ✗. */
export const SPesada: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const pes = ev(p, 'L11', 7);
  const strain = Math.sin(t * 30) * 3;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[0, 0, 20, -10]} origin={[540, 1200]} shakes={[{at: 0, amp: 4, dur: p.dur}]}>
      <Street t={t} ox={-260} />
      <Rider x={760 + fr * 1.2} y={1480} h={560} crank={t * 9} wheel={t * 2} expr={{smile: 0.4, halfSmile: 1, lookX: -1}} />
      <Pup outfit={DAVI_OUTFIT} x={250 + strain} y={2050} height={1150} light={STREET_LIGHT} pose={{shR: 92, elR: -4, shL: -30, elL: 20, lean: -6, facing: 0.5}} expr={{browTilt: 1, smile: -0.5, mouthOpen: 0.15, eyesWide: 0.2, lookX: 1}} />
      <EnergyLines x={560} y={1290} r0={60} r1={170} k={0.5} frame={fr} seed="pz" count={10} />
      <Svg>
        <Sweat x={250} y={1000} t={t} s={1.3} />
      </Svg>
      <Chip x={720} y={700} text="BICICLETA 12 kg ✗" k={kf(fr, [pes - 6, pes], [0, 1])} color="#ff5a6a" size={54} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "Ele puxa só a corrente." — close on the crank: the chain glows, pops off and flies into Davi's hand. */
export const SCorrente: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const puxa = ev(p, 'L11', 9);
  const so = ev(p, 'L11', 10);
  const cor = ev(p, 'L11', 12);
  const glow = kf(fr, [puxa - 2, puxa + 3], [0, 1]);
  const off = fr >= so;
  const u = kf(fr, [so, cor], [0, 1], (x) => x * x);
  const k = 1.5;
  const bx = 720;
  const by = 1520;
  const crank: [number, number] = [bx + BIKE.crank[0] * k, by + BIKE.crank[1] * k];
  const rear: [number, number] = [bx + BIKE.rear[0] * k, by + BIKE.rear[1] * k];
  const hand: [number, number] = [300, 900];
  const head: [number, number] = [lerp(crank[0], hand[0], u), lerp(crank[1], hand[1], u) - Math.sin(u * Math.PI) * 140];
  const tail: [number, number] = [lerp(rear[0], hand[0] + 10, clamp(u * 1.15 - 0.15)), lerp(rear[1], hand[1] + 260, clamp(u * 1.15 - 0.15))];
  const caught = fr >= cor;
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.0]} origin={[540, 1100]} shakes={[{at: cor, amp: 14, dur: 10}]} punches={[{at: cor, amt: 0.08}]}>
      <Street t={t} ox={-520} />
      <Rider x={bx} y={by} h={1000 * k} crank={t * 8} wheel={t * 2} chain={off ? 0 : 1} />
      {!off && glow > 0 && (
        <Svg>
          <circle cx={crank[0]} cy={crank[1]} r={90} fill="none" stroke="#ffd23a" strokeWidth={10} opacity={glow} style={{filter: 'drop-shadow(0 0 16px #ffd23a)'}} />
        </Svg>
      )}
      {off && (
        <Svg>
          <ChainLine a={caught ? [hand[0] + 20, hand[1] + 10] : head} b={caught ? [hand[0] + 30, hand[1] + 300] : tail} t={t} wave={caught ? 12 : 40} glow={1} />
        </Svg>
      )}
      <BigHand x={hand[0] + 70} y={hand[1]} angle={-10} s={0.95} variant="palm" glow={1} />
      <EnergyLines x={hand[0]} y={hand[1]} r0={80} r1={220} k={1 - (caught ? 0.5 : 0)} frame={fr} seed="ch" count={12} />
      {off && !caught && <SpeedLines k={0.4} t={t} />}
      <SoundWord x={430} y={680} text="CLINK!" k={fr - cor} size={110} rot={-8} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/** Chain hanging from a wrist (puppet-local units). */
const HangingChain: React.FC<{t: number}> = ({t}) => {
  const sw = Math.sin(t * 5) * 10;
  return (
    <g transform={`rotate(${sw})`}>
      <path d="M0,40 Q-60,240 0,420 Q60,240 0,40" stroke="#3c424c" strokeWidth={22} fill="none" />
      <path d="M0,40 Q-60,240 0,420 Q60,240 0,40" stroke="#aab3bf" strokeWidth={15} fill="none" strokeDasharray="15 7" />
    </g>
  );
};

/* "Trezentos gramas." — Davi dangles the chain, proud; behind, the robber pedals with no chain. HUD ✓. */
export const SGramas: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tre = ev(p, 'L11', 13);
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} pan={[-20, 0, 20, 0]} origin={[400, 1100]}>
      <Street t={t} ox={-300} />
      <Rider x={800} y={1470} h={520} crank={t * 22} wheel={0} chain={0} expr={{eyesWide: 1, mouthOpen: 0.6, browTilt: 1, lookX: 1}} />
      <Pup outfit={DAVI_OUTFIT} x={340} y={2000} height={1150} light={STREET_LIGHT} pose={{shR: 150, elR: 20, shL: -20, elL: 30, facing: 0.3}} expr={{smile: 0.9, halfSmile: 0.5, browRaise: 0.5, lookX: 0.6}} handProps={{R: <HangingChain t={t} />}} />
      <HudTag x={640} y={560} label="CORRENTE" value="300 g ✓" k={kf(fr, [tre - 2, tre + 5], [0, 1])} color="#5dff9a" size={110} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* ================================================================== L12 */

/* "A polícia chegou," — patrol car skids in, red/blue lights wash the street. */
export const SPolicia: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const arr = kf(fr, [0, 12], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[0, -200, 0, -220]} origin={[540, 1300]} whip="l" shakes={[{at: 12, amp: 10, dur: 10}]}>
      <Street t={t} ox={-200} lights={arr} />
      <Rider x={330} y={1480} h={560} crank={t * 24} chain={0} expr={{eyesWide: 1, mouthOpen: 0.7, browTilt: 1, lookX: 1}} />
      <PoliceCar x={lerp(1500, 780, arr)} y={1820} s={0.85} t={t} flip />
      <SoundWord x={760} y={1000} text="SKRRT!" k={fr - 10} size={100} rot={-6} color="#fff" />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "e o cara ainda tava pedalando." — robber pedals like crazy, going nowhere… freeze on "pedalando". */
export const SPedala: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const ped = ev(p, 'L12', 8);
  const ff = Math.min(fr, ped);
  const t = abs(p, ff);
  const frz = fr >= ped ? 1 : 0;
  return (
    <Rig dur={p.dur} zoom={[1.0, frz ? 1.12 : 1.06]} origin={[540, 1000]} punches={[{at: ped, amt: 0.1}]} rot={[0, frz ? -3 : 0]}>
      <FreezeFrame k={frz}>
        <Street t={t} ox={-420} lights={1} />
        <Rider x={560} y={1420} h={980} crank={t * 30} chain={0} lean={22} expr={{eyesWide: 0.9, mouthOpen: 0.5, browTilt: 1, smile: -0.3, lookX: -1}} />
        <Svg>
          <Sweat x={640} y={560} t={t} s={1.4} />
        </Svg>
        {!frz && (
          <Svg>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={590} cy={1165} r={110 + i * 22} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="30 30" strokeDashoffset={-t * 900} opacity={0.5 - i * 0.12} />
            ))}
          </Svg>
        )}
      </FreezeFrame>
      <Stamp x={540} y={720} text="0 km/h" k={fr - ped} size={130} color="#e0352b" rot={-8} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};
