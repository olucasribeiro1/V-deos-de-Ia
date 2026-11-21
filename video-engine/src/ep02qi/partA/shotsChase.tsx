import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PlacedDavi} from '../../characters/Davi';
import {PlacedAgent, AgentVariant} from '../../characters/Agent';
import {PlacedPuppet} from '../../characters/Puppet';
import type {Outfit, Pose} from '../../characters/types';
import {AGENT_OUTFITS} from '../../characters/Agent';
import {AGENT_BLUE_OUTFIT, Bust} from '../characters';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {METRO_LIGHT, MetroHall, MetroPlatform, Turnstile} from '../sets/Metro';
import {
  CutFlash,
  EnergyLines,
  Finish,
  FreezeFx,
  H,
  HudTag,
  PredictArrow,
  Rig,
  ShotP,
  Smear,
  SpeedLines,
  Stamp,
  Svg,
  W,
  abs,
  clamp,
  easeOut,
  ev,
  kf,
  lerp,
  runPose,
} from './kit';

/** The 4 chase agents (left → right as they appear): buzz, blue suit, bald (careca), Rocha-type bearded. */
export const CHASERS: Outfit[] = [AGENT_OUTFITS.agentA, AGENT_BLUE_OUTFIT, AGENT_OUTFITS.agentB, AGENT_OUTFITS.rocha];
const PlacedChaser: React.FC<{i: number; x: number; y: number; height: number; pose?: Pose; expr?: object; blur?: number; flip?: boolean; ghost?: {opacity: number; color: string; dash?: number}}> = ({i, ...rest}) => (
  <PlacedPuppet outfit={CHASERS[i % 4]} light={METRO_LIGHT} {...rest} />
);
export {PlacedAgent};
export type {AgentVariant};

/** Front-facing charge (arms pumping, heavy bob). */
const chargePose = (t: number, ph = 0): Pose => {
  const s = Math.sin(t * 14 + ph);
  return {
    shL: -22 + s * 14,
    elL: 150 + s * 25,
    shR: 22 + s * 14,
    elR: -150 + s * 25,
    hipL: -6 + s * 5,
    hipR: 6 + s * 5,
    knL: Math.max(0, s) * 14,
    knR: Math.max(0, -s) * -14,
    bob: -Math.abs(Math.cos(t * 14 + ph)) * 30,
    headTilt: s * 3,
  };
};

/** Lemniscate (∞) path centred at (x, y), half-width a, drawn to `k`. */
const infPath = (x: number, y: number, a: number, k: number) => {
  const n = Math.max(2, Math.round(80 * k));
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / 80) * Math.PI * 2 - Math.PI / 2;
    const d = 1 + Math.sin(t) * Math.sin(t);
    pts.push(`${i ? 'L' : 'M'}${(x + (a * Math.cos(t)) / d).toFixed(1)},${(y + (a * Math.sin(t) * Math.cos(t)) / d).toFixed(1)}`);
  }
  return pts.join(' ');
};

/* 1. "O Davi nasceu com QI infinito" — tracking sprint through the concourse, ∞ pops on "infinito". */
export const SRun: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const I = ev(p, 'L1', 5);
  const inf = kf(fr, [I - 2, I + 8], [0, 1], easeOut);
  const px = -fr * 38;
  const dx = 470 + Math.sin(t * 2) * 20;
  const ag = fr - 26;
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.0]} pan={[0, 30, 0, 0]} rot={[-2, 0]} punches={[{at: I, amt: 0.05}]}>
      <MetroHall t={t} px={px} floorY={1290} />
      {ag > 0 &&
        [0, 1].map((i) => (
          <PlacedChaser key={i} i={i * 2} x={-330 + ag * 16 + i * 150} y={1450 - i * 10} height={700} pose={runPose(t, 0.9, i * 1.7)} expr={{browTilt: -0.8, mouthOpen: 0.3}} blur={2} />
        ))}
      <Smear x={dx - 40} y={1100} w={520} h={300} k={0.8} />
      <PlacedDavi x={dx} y={1530} height={880} pose={{...runPose(t), facing: 0.55}} expr={{mouthOpen: 0.15, smile: 0.3, browRaise: 0.2, lookX: 1}} light={METRO_LIGHT} />
      <SpeedLines k={0.45} t={t} />
      <EnergyLines x={790} y={640} r0={120} r1={300} k={inf} frame={fr} seed="inf" count={14} />
      <Svg>
        {inf > 0 && (
          <g style={{filter: 'drop-shadow(0 0 16px #ffd23a)'}} transform={`translate(790,640) scale(${lerp(0.4, 1, inf) + 0.04 * Math.sin(fr * 0.6)}) translate(-790,-640)`}>
            <path d={infPath(790, 640, 130, inf)} stroke="#ffd23a" strokeWidth={30} fill="none" strokeLinecap="round" />
            <path d={infPath(790, 640, 130, inf)} stroke="#fff6c8" strokeWidth={10} fill="none" strokeLinecap="round" />
          </g>
        )}
      </Svg>
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/* 2. "Agora tá fugindo de" — low angle: Davi vaults the catraca, arm spins. */
export const SVault: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const pr = clamp((fr - 1) / 24);
  const e = pr;
  const x = lerp(-180, 1240, e);
  const lift = Math.sin(Math.PI * clamp((e - 0.12) / 0.76));
  const y = 1820 - lift * 470;
  const rot = lerp(-28, 22, e);
  const arm = kf(fr, [10, 22], [0, 120], easeOut);
  const hit = 11;
  const tuck: Pose = {lean: 0, hipL: 85, knL: -110, hipR: 60, knR: -95, shL: lift > 0.4 ? 30 : -40, elL: 0, shR: -150, elR: -20, facing: 0.6};
  return (
    <Rig dur={p.dur} whip="r" zoom={[1.06, 1.12]} pan={[40, 0, -40, 0]} shakes={[{at: hit, dur: 10, amp: 16}]} origin={[540, 1300]}>
      <MetroHall t={t} px={-fr * 10} floorY={1180} ceilY={160} />
      <Svg>
        <Turnstile x={-160} y={1800} s={1.6} arm={0} led="red" />
        <Turnstile x={1240} y={1800} s={1.6} arm={0} led="red" />
        <Turnstile x={540} y={1800} s={1.6} arm={arm} led={fr % 6 < 3 && fr > hit ? 'red' : 'green'} />
      </Svg>
      <Smear x={x - 80} y={y - 420} w={600} h={360} k={clamp(lift * 1.4)} />
      <AbsoluteFill style={{transform: `rotate(${rot}deg)`, transformOrigin: `${x}px ${y - 420}px`}}>
        <PlacedDavi x={x} y={y} height={760} pose={tuck} expr={{smile: 0.6, mouthOpen: 0.25, browRaise: 0.4, lookX: 1}} light={METRO_LIGHT} />
      </AbsoluteFill>
      <SpeedLines k={0.4} t={t} />
      <CutFlash frames={4} peak={0.5} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 3. "agentes do governo num" — the 4 suits charge at camera; HUD AGENTES 4. */
export const SAgents: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const e = easeOut(clamp(fr / p.dur));
  const xo = [-300, -105, 100, 300];
  const h0 = [560, 640, 600, 680];
  const order = [0, 2, 1, 3];
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} whip="d" shakes={[{at: 0, dur: 30, amp: 10}]}>
      <MetroHall t={t} px={-200} floorY={1120} ceilY={240} />
      <Svg>
        <Turnstile x={160} y={1300} s={0.8} arm={60} led="red" />
        <Turnstile x={920} y={1300} s={0.8} arm={20} led="red" />
      </Svg>
      {order.map((i) => {
        const h = h0[i] * lerp(1, 1.55, e) * (1 + 0.02 * Math.sin(t * 14 + i));
        const fy = 1130 + h * 0.62;
        return <PlacedChaser key={i} i={i} x={540 + (xo[i] * h) / 640} y={fy} height={h} pose={chargePose(t, i * 1.3)} expr={{browTilt: -1, smile: -0.4, mouthOpen: 0.15}} />;
      })}
      <Svg>
        {order.map((i) => {
          const k = kf(fr, [3 + i * 4, 9 + i * 4], [0, 1], easeOut);
          if (k <= 0) return null;
          const h = h0[i] * lerp(1, 1.55, e);
          const fy = 1130 + h * 0.62;
          const hx = 540 + (xo[i] * h) / 640;
          const hy = fy - h * 0.88;
          const r = h * 0.17 * lerp(1.6, 1, k);
          return (
            <g key={i} opacity={k} stroke="#ffd23a" strokeWidth={6} fill="none">
              <path d={`M${hx - r},${hy - r + 26} v-26 h26 M${hx + r - 26},${hy - r} h26 v26 M${hx + r},${hy + r - 26} v26 h-26 M${hx - r + 26},${hy + r} h-26 v-26`} />
              <text x={hx} y={hy - r - 14} textAnchor="middle" fill="#ffd23a" stroke="none" fontFamily="Oswald" fontWeight={700} fontSize={44}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </Svg>
      <HudTag x={70} y={1600} label="AGENTES" value={String(Math.min(4, Math.max(1, Math.floor((fr - 3) / 4) + 1)))} k={kf(fr, [2, 8], [0, 1])} color="#ffd23a" size={110} />
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/** Green check mark (svg) for stamps. */
const Check: React.FC<{x: number; y: number; s: number; k: number; color?: string}> = ({x, y, s, k, color = '#1f9d4a'}) =>
  k < 0 ? null : (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path
        d={`M${x - s * 0.5},${y} L${x - s * 0.12},${y + s * 0.42} L${x + s * 0.6},${y - s * 0.5}`}
        stroke={color}
        strokeWidth={s * 0.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={s * 2.2}
        strokeDashoffset={s * 2.2 * (1 - clamp(k / 5))}
      />
    </svg>
  );

/* 4. "metrô. Spoiler: ele vai ganhar." — wide platform chase; FREEZE on "Spoiler"; green stamp "VAI GANHAR ✓". */
export const SFreeze: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const Fz = ev(p, 'L1', 16);
  const G = ev(p, 'L1', 18);
  const tt = Math.min(fr, Fz);
  const t = abs(p, tt);
  const frozen = fr >= Fz;
  const fk = kf(fr, [Fz, Fz + 4], [0, 1], easeOut);
  const px = -tt * 16;
  const dx = 700 + tt * 2;
  const circleK = kf(fr, [Fz + 3, Fz + 12], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} pan={[0, 0, -20, 0]} punches={[{at: Fz, amt: 0.1, len: 10}, {at: G, amt: 0.06, len: 8}]} shakes={[{at: G, dur: 10, amp: 14}]} origin={[dx, 1150]}>
      <MetroPlatform t={t} px={px} edgeY={1250} train={{x: -200, doors: 0}} />
      {[0, 1, 2, 3].map((i) => (
        <PlacedChaser key={i} i={i} x={110 + i * 135 + tt * 3} y={1600 + (i % 2) * 30} height={600 + (i % 2) * 30} pose={runPose(t, 1, i * 1.9)} expr={{browTilt: -0.9, mouthOpen: 0.3}} />
      ))}
      <PlacedDavi x={dx} y={1590} height={590} pose={{...runPose(t, 1, 0.6), facing: 0.6}} expr={{smile: 0.5, browRaise: 0.3, lookX: 1}} light={METRO_LIGHT} />
      {!frozen && <SpeedLines k={0.35} t={t} />}
      <FreezeFx k={fk} />
      <Svg>
        {circleK > 0 && (
          <ellipse cx={dx} cy={1340} rx={200} ry={330} fill="none" stroke="#ffd23a" strokeWidth={10} strokeDasharray={1700} strokeDashoffset={1700 * (1 - circleK)} transform={`rotate(-8 ${dx} 1340)`} style={{filter: 'drop-shadow(0 0 8px #ffd23a)'}} />
        )}
      </Svg>
      <CutFlash at={Fz} frames={5} peak={0.85} />
      <Stamp x={560} y={1020} text={"VAI GANHAR\u00a0\u00a0\u00a0\u00a0"} color="#1f9d4a" k={fr - G} rot={-8} size={104} />
      {fr >= G && (
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `rotate(-8deg) scale(${fr - G < 4 ? lerp(2.6, 1, easeOut((fr - G) / 4)) : 1})`, transformOrigin: '560px 1020px'}}>
          <Check x={835} y={1010} s={70} k={fr - G - 1} />
        </div>
      )}
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 5. "Porque ele sabe o que tu vai" — extreme close on Davi's eye, energy lines + HUD rings. */
export const SEye: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const r = 1000;
  const k = r / 122;
  const ex = 540;
  const ey = 930;
  const cx = ex - 41 * k;
  const cy = ey + 2 * k;
  const on = kf(fr, [2, 10], [0, 1], easeOut);
  const blink = kf(fr, [0, 2, 5], [1, 1, 0]);
  return (
    <Rig dur={p.dur} whip="l" zoom={[1.0, 1.14]} origin={[ex, ey]} pow={1.5}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #33505a, #10161c)'}} />
      <Bust outfit={DAVI_OUTFIT} cx={cx} cy={cy} r={r} pose={{facing: 0}} expr={{eyesWide: 0.45, lookX: 0.4, browTilt: -0.4, browRaise: -0.2, blink, halfSmile: 0.4}} light={METRO_LIGHT} />
      <AbsoluteFill style={{background: `radial-gradient(circle 420px at ${ex}px ${ey}px, rgba(255,210,58,${0.18 * on}), rgba(0,0,0,${0.35 * on}) 100%)`, mixBlendMode: 'multiply'}} />
      <EnergyLines x={ex} y={ey} r0={260} r1={640} k={on} frame={fr} seed="eye" count={20} />
      <Svg>
        <g opacity={on} stroke="#ffd23a" fill="none" style={{filter: 'drop-shadow(0 0 8px #ffd23a)'}}>
          <circle cx={ex} cy={ey} r={230} strokeWidth={6} strokeDasharray="40 24" transform={`rotate(${fr * 4} ${ex} ${ey})`} />
          <circle cx={ex} cy={ey} r={290} strokeWidth={3} strokeDasharray="6 14" transform={`rotate(${-fr * 3} ${ex} ${ey})`} />
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 + fr * 0.03;
            return <line key={i} x1={ex + Math.cos(a) * 310} y1={ey + Math.sin(a) * 310} x2={ex + Math.cos(a) * 340} y2={ey + Math.sin(a) * 340} strokeWidth={6} />;
          })}
        </g>
      </Svg>
      <HudTag x={70} y={1610} label="MODO" value="LEITURA" k={kf(fr, [6, 12], [0, 1])} color="#ffd23a" size={90} />
      <Finish vignette={0.6} grain={0.08} />
    </Rig>
  );
};

/* 6. "fazer antes de tu saber." — slow-mo agents, dotted prediction arrows + ghosts; on "antes" they move into the ghosts. */
export const SPredict: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const A = ev(p, 'L2', 8);
  const ts = 7 + t * 0.18;
  const go = kf(fr, [A, A + 14], [0, 1], easeOut);
  const agents = [
    {i: 0, x: 130, y: 1540, h: 720, gx: 330, gy: 1450, gpose: {...runPose(1.3), lean: 20}},
    {i: 1, x: 420, y: 1600, h: 760, gx: 620, gy: 1600, gpose: {...runPose(2.1), shR: -150, elR: 0}},
    {i: 2, x: 700, y: 1500, h: 700, gx: 760, gy: 1500, gpose: {lean: 40, hipL: 60, knL: -10, hipR: -50, shL: -120, shR: 100, headTilt: 30}},
  ];
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.12]} pan={[30, 0, -30, 0]} rot={[1.5, -1]}>
      <MetroHall t={t} px={-300 - fr * 2} floorY={1280} />
      <AbsoluteFill style={{background: 'rgba(40,120,170,0.35)', mixBlendMode: 'multiply'}} />
      {agents.map((a) => (
        <PlacedChaser key={'g' + a.i} i={a.i} x={a.gx} y={a.gy} height={a.h} pose={a.gpose} ghost={{opacity: (1 - go) * kf(fr, [4, 12], [0, 1]), color: '#ffd23a', dash: 18}} />
      ))}
      {agents.map((a) => (
        <PlacedChaser
          key={a.i}
          i={a.i}
          x={lerp(a.x, a.gx, go)}
          y={lerp(a.y, a.gy, go)}
          height={a.h}
          pose={go > 0.5 ? a.gpose : runPose(ts, 0.9, a.i * 2)}
          expr={{browTilt: -0.8, mouthOpen: go > 0.5 ? 0.5 : 0.2, eyesWide: go > 0.5 ? 0.6 : 0}}
        />
      ))}
      <Svg>
        {agents.map((a, n) => (
          <PredictArrow key={a.i} a={[a.x + 60, a.y - a.h * 0.6]} b={[a.gx + 10, a.gy - a.h * 0.75]} bend={0.35} k={kf(fr, [2 + n * 3, 12 + n * 3], [0, 1], easeOut) * (1 - go)} frame={fr} />
        ))}
      </Svg>
      <HudTag x={70} y={1610} label="MODO" value="PREVISÃO" k={kf(fr, [2, 8], [0, 1])} color="#ffd23a" size={90} />
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};
