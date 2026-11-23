import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Chip, Rig, SlowMoGrade, Stamp, Svg, useShot, wl} from './kit';
import {BillFolder, BurstGlass, CAPTAIN, CaptainHat, DECK_Y, Flag, MOON_LIGHT, Tablet, WineGlass, YachtDeck} from './sets';
import {ChairBack, DinnerTable, TERRACE_LIGHT, TerraceBG} from '../../ep02/partC/sets';
import {CloseUp, SIT_H, TABLE} from '../../ep02/partC/ShotsMonaco';
import {TerraceCrowd} from '../../ep02/partB/crowd';
import {WAITER} from '../../ep02/partB/sets';
import {PlacedDavi} from '../../characters/Davi';
import {PlacedLia} from '../../characters/Lia';
import {PlacedAgent} from '../../characters/Agent';
import {PlacedPuppet} from '../../characters/Puppet';
import {Flash, Rastro} from '../../fx/Rastro';
import {Shockwave} from '../../fx/Shockwave';
import {Particles} from '../../fx/Particles';
import {Finish} from '../../scenes/common';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';

/** Head-top y of a placed puppet of height h with feet at y (hat anchor). */
const headTop = (y: number, h: number) => y - 1000 * (h / 1000);

/** Wind streaks blowing to the right. */
const Wind: React.FC<{frame: number; k: number; seed: string; y0?: number; y1?: number}> = ({frame, k, seed, y0 = 600, y1 = 1700}) =>
  k <= 0 ? null : (
    <Svg>
      {Array.from({length: 22}).map((_, i) => {
        const r = (n: string) => random(`${seed}-${i}-${n}`);
        const y = y0 + r('y') * (y1 - y0);
        const x = ((r('x') * 1600 + frame * (50 + r('v') * 40)) % 1700) - 300;
        const len = 120 + r('l') * 260;
        return <path key={i} d={`M${x},${y} q${len / 2},${-20 + r('c') * 40} ${len},0`} stroke="#ffffff" strokeWidth={3 + r('w') * 5} fill="none" opacity={0.5 * k} strokeLinecap="round" />;
      })}
    </Svg>
  );

/* ------------------------------------------------------------------ b21 — "Eles aparecem no deck." */

const CAP = {x: 930, y: 1420, h: 760};

export const B21Arrive: React.FC = () => {
  const {frame, t} = useShot();
  const A = 3;
  const here = frame >= A;
  const surprise = kf(frame, [A + 4, A + 10], [0, 1], easeOut);
  return (
    <Rig s0={1.12} s1={1.02} r0={-2} r1={0} impacts={[{at: A, amp: 34, dur: 16, zoom: 0.07}]} oy={1300}>
      <YachtDeck t={t + 5} px={frame * 1.5} />
      <Flag x={330 - frame * 0.9} y={DECK_Y - 620} t={t} wind={kf(frame, [A, A + 6], [0.1, 1])} />
      <PlacedPuppet outfit={CAPTAIN} x={CAP.x} y={CAP.y} height={CAP.h} light={MOON_LIGHT} pose={{facing: -0.4, shL: -20 - surprise * 50, elL: -40, shR: 20, lean: -surprise * 4}} expr={{eyesWide: surprise, mouthOpen: surprise * 0.6, browRaise: surprise}} />
      <Svg>
        <CaptainHat x={CAP.x} y={headTop(CAP.y, CAP.h) + 18} s={CAP.h / 1000} rot={-surprise * 6} />
      </Svg>
      {here && (
        <>
          <PlacedLia x={400} y={1780} height={1180} light={MOON_LIGHT} pose={{facing: 0.5, shR: 30, elR: 10, shL: -10, bob: kf(frame, [A, A + 4], [-40, 0])}} expr={{eyesWide: kf(frame, [A, A + 6, 30], [0.9, 0.9, 0.3]), browRaise: 0.8, mouthOpen: kf(frame, [A, A + 6, 30], [0.5, 0.5, 0.1])}} />
          <PlacedDavi x={640} y={1790} height={1200} light={MOON_LIGHT} pose={{facing: -0.3, shL: -30, elL: -10, shR: 10, bob: kf(frame, [A, A + 4], [-40, 0])}} expr={{smile: 0.7, halfSmile: 0.6, lookX: -0.4}} />
        </>
      )}
      <Rastro x={520} y={1790} height={1300} life={(frame - A + 2) / 22} frame={frame} seed="b21r" />
      <Shockwave cx={520} cy={1200} age={frame - A} rings={4} speed={40} gap={4} maxR={1600} />
      <Flash k={kf(frame, [A, A + 1, A + 6], [0, 0.85, 0], (x) => x)} />
      <Particles t={t} seed="b21" count={20} bokeh={6} color="200,220,255" bokehColor="180,200,255" />
      <Finish vignette={0.55} tint="rgba(80,120,220,0.2)" />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b22 — "Setenta litros de" */

export const B22Air: React.FC = () => {
  const {frame, t} = useShot();
  const g = kf(frame, [0, 10], [0, 1], easeOut);
  return (
    <Rig s0={1.05} s1={1.12} x0={20} x1={-20} r0={1} r1={-1} whipIn="right" impacts={[{at: 0, amp: 16}]} oy={1300}>
      <YachtDeck t={t + 7} px={30} />
      <Flag x={330 - 27} y={DECK_Y - 620} t={t} wind={1} />
      <PlacedLia x={400} y={1780} height={1180} light={MOON_LIGHT} pose={{facing: 0.5, shR: 30, elR: 10, shL: -10, headTilt: -4}} expr={{eyesWide: 0.4, browRaise: 0.6, lookX: 0.3}} />
      <PlacedDavi x={640} y={1790} height={1200} light={MOON_LIGHT} pose={{facing: -0.3, shL: -30, elL: -10, shR: 10}} expr={{smile: 0.7, halfSmile: 0.6}} />
      <Shockwave cx={520} cy={1200} age={frame + 20} rings={4} speed={40} gap={4} maxR={1900} />
      {/* air "balls" pushed outward */}
      <Svg>
        {Array.from({length: 40}).map((_, i) => {
          const r = (n: string) => random(`b22-${i}-${n}`);
          const a = r('a') * Math.PI * 2;
          const d = 200 + g * (300 + r('d') * 500);
          return <circle key={i} cx={520 + Math.cos(a) * d} cy={1200 + Math.sin(a) * d * 1.2} r={14 + r('s') * 16} fill="#cfe8ff" opacity={0.65 * (1 - g * 0.5)} stroke="#ffffff" strokeWidth={2} />;
        })}
      </Svg>
      <Wind frame={frame} k={g} seed="b22w" />
      <Chip x={540} y={640} text="💨 AR EMPURRADO: 70 L" k={kf(frame, [2, 8], [0, 1], easeOut)} color="#7fd8ff" size={56} />
      <Finish vignette={0.5} tint="rgba(80,120,220,0.2)" />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b23 — "ar empurrados." gust hits the captain */

const CAPM = {x: 600, y: 2150, h: 1900};

const CaptainMedium: React.FC<{frame: number; t: number; hatLift: number; hatX?: number; hatRot?: number; reach?: number; showHat?: boolean}> = ({frame, t, hatLift, hatX = 0, hatRot = 0, reach = 0, showHat = true}) => {
  const top = headTop(CAPM.y, CAPM.h);
  return (
    <>
      <PlacedPuppet outfit={CAPTAIN} x={CAPM.x} y={CAPM.y} height={CAPM.h} light={MOON_LIGHT} pose={{facing: 0.2, shR: lerp(10, -170, reach), elR: lerp(-10, 0, reach), shL: -20, elL: -40, lean: -3 + Math.sin(frame * 1.3) * 1.5, headTilt: Math.sin(frame * 0.9) * 3}} expr={{eyesWide: 0.3 + hatLift * 0.7, lookY: -hatLift, browRaise: 0.4 + hatLift * 0.6, mouthOpen: reach * 0.8 + hatLift * 0.2}} />
      {showHat && (
        <Svg>
          <CaptainHat x={CAPM.x + hatX} y={top + 40 - hatLift * 120} s={CAPM.h / 1000} rot={hatRot + Math.sin(t * 30) * 4 * hatLift} />
        </Svg>
      )}
    </>
  );
};

export const B23Gust: React.FC = () => {
  const {frame, t} = useShot();
  const lift = kf(frame, [16, 32], [0, 0.35], easeIn);
  return (
    <Rig s0={1.0} s1={1.06} x0={-20} x1={0} r0={-1} r1={1} whipIn="right" impacts={[{at: 4, amp: 20}]}>
      <YachtDeck t={t + 9} px={260} horizon={900} />
      <CaptainMedium frame={frame} t={t} hatLift={lift} hatRot={-lift * 30} />
      <Wind frame={frame} k={kf(frame, [0, 6], [0, 1])} seed="b23w" y0={300} y1={1800} />
      <Finish vignette={0.5} tint="rgba(80,120,220,0.2)" />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b24 — "O chapéu do capitão" */

export const B24Captain: React.FC = () => {
  const {frame, t} = useShot();
  const lift = kf(frame, [0, 26], [0.35, 1], (x) => x);
  return (
    <Rig s0={1.25} s1={1.4} x0={0} x1={0} y0={260} y1={300} r0={2} r1={-2} oy={500}>
      <YachtDeck t={t + 10} px={260} horizon={900} />
      <CaptainMedium frame={frame + 30} t={t} hatLift={lift} hatX={lift * 40} hatRot={-10 - lift * 25} />
      <Wind frame={frame} k={1} seed="b24w" y0={200} y1={1200} />
      <Finish vignette={0.55} tint="rgba(80,120,220,0.2)" />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b25 — "voou longe." */

export const B25HatFly: React.FC = () => {
  const {frame, t} = useShot();
  const k = kf(frame, [0, 22], [0, 1], (x) => x);
  const hx = lerp(560, 1000, k) + Math.sin(k * 9) * 30;
  const hy = lerp(560, 1020, k) - Math.sin(k * Math.PI) * 360;
  const SPL = 22;
  const sp = frame - SPL;
  return (
    <Rig s0={1.0} s1={1.08} x0={0} x1={-60} whipIn="up" oy={900}>
      <YachtDeck t={t + 11} px={0} horizon={1040} rock={0.5} />
      {/* captain reaching from bottom-left */}
      <PlacedPuppet outfit={CAPTAIN} x={180} y={2300} height={1700} light={MOON_LIGHT} pose={{facing: 0.5, shR: -150, elR: -10, shL: -20, lean: 8}} expr={{eyesWide: 1, mouthOpen: 0.9, browRaise: 1, lookX: 0.8, lookY: -0.6, browTilt: 0.6}} />
      <Svg>
        {frame < SPL + 1 && <CaptainHat x={hx} y={hy} s={lerp(0.9, 0.25, k)} rot={frame * 38} />}
        {sp >= 0 &&
          Array.from({length: 12}).map((_, i) => {
            const a = -Math.PI / 2 + (random(`b25s${i}`) - 0.5) * 1.8;
            const v = 6 + random(`b25v${i}`) * 9;
            return <circle key={i} cx={1000 + Math.cos(a) * v * sp} cy={1030 + Math.sin(a) * v * sp + sp * sp * 0.9} r={5 + random(`b25r${i}`) * 6} fill="#dfefff" opacity={clamp(1 - sp / 8)} />;
          })}
        {sp >= 0 && <ellipse cx={1000} cy={1035} rx={20 + sp * 10} ry={5 + sp * 2} fill="none" stroke="#dfefff" strokeWidth={4} opacity={clamp(1 - sp / 10)} />}
      </Svg>
      {sp >= 0 && (
        <div style={{position: 'absolute', left: 860, top: 860, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 54, color: '#dfefff', transform: 'rotate(8deg)', textShadow: '0 3px 10px #000', opacity: clamp(sp / 2)}}>
          TCHIBUM!
        </div>
      )}
      <Wind frame={frame} k={0.6} seed="b25w" y0={500} y1={1100} />
      <Finish vignette={0.5} tint="rgba(80,120,220,0.2)" />
    </Rig>
  );
};

/* ------------------------------------------------------------------ L14 — moonlit close-ups */

const CROSSED = {shL: 55, elL: 115, shR: -55, elR: -115};

export const B26Look: React.FC = () => {
  const {frame, t} = useShot();
  const turn = kf(frame, [4, 16], [0, 1], easeOut);
  return (
    <Rig s0={1.02} s1={1.12} x0={10} x1={-10} whipIn="zoom" oy={1000}>
      <YachtDeck t={t + 20} px={-200} horizon={1040} rock={0.4} />
      <PlacedLia x={330} y={2700} height={2300} light={MOON_LIGHT} pose={{facing: lerp(0.1, 0.6, turn), ...CROSSED, headTilt: lerp(0, 5, turn)}} expr={{lookX: lerp(0, 0.9, turn), halfSmile: turn * 0.6, browAsym: turn * 0.6}} />
      <PlacedDavi x={800} y={2720} height={2300} light={MOON_LIGHT} pose={{facing: -0.5, shL: -10, shR: 10}} expr={{lookX: -0.8, smile: 0.3, halfSmile: 0.4, blink: kf(frame, [20, 22, 24], [0, 1, 0])}} />
      <Particles t={t} seed="b26" count={18} bokeh={5} color="210,225,255" bokehColor="190,210,255" />
      <Finish vignette={0.6} tint="rgba(80,120,220,0.25)" />
    </Rig>
  );
};

export const B27Lia: React.FC = () => {
  const {frame, t} = useShot();
  const talk = Math.abs(Math.sin(frame * 0.7)) * 0.5;
  return (
    <Rig s0={1.05} s1={1.14} x0={-10} x1={10} r0={-1} r1={1} oy={900}>
      <AbsoluteFill style={{filter: 'blur(6px)'}}>
        <YachtDeck t={t + 22} px={300} horizon={1100} rock={0.3} />
      </AbsoluteFill>
      <PlacedLia x={540} y={3250} height={2900} light={MOON_LIGHT} pose={{facing: 0.3, ...CROSSED, headTilt: 4}} expr={{lookX: 0.6, halfSmile: 0.8, browAsym: 0.8, mouthOpen: talk}} />
      <Finish vignette={0.6} tint="rgba(80,120,220,0.25)" />
    </Rig>
  );
};

export const B28Coisa: React.FC = () => {
  const {frame, t} = useShot();
  const talk = frame < 26 ? Math.abs(Math.sin(frame * 0.7)) * 0.5 : 0;
  return (
    <Rig s0={1.08} s1={1.16} x0={20} x1={-10} r0={1} r1={-1} whipIn="left" oy={900}>
      <YachtDeck t={t + 24} px={-100} horizon={1060} rock={0.3} />
      <PlacedLia x={380} y={2550} height={2100} light={MOON_LIGHT} pose={{facing: 0.5, ...CROSSED, headTilt: kf(frame, [20, 34], [0, 8])}} expr={{lookX: 0.8, halfSmile: 0.9, browAsym: kf(frame, [20, 30], [0.4, 1]), mouthOpen: talk}} />
      {/* Davi's shoulder in the foreground (OTS) */}
      <AbsoluteFill style={{filter: 'blur(5px)'}}>
        <PlacedDavi x={1000} y={3300} height={2900} light={MOON_LIGHT} pose={{facing: -0.6}} expr={{lookX: -1}} />
      </AbsoluteFill>
      <Finish vignette={0.6} tint="rgba(80,120,220,0.25)" />
    </Rig>
  );
};

export const B29Davi: React.FC = () => {
  const {frame, t} = useShot();
  return (
    <Rig s0={1.08} s1={1.16} r0={-1} r1={1} whipIn="right" oy={1000}>
      <AbsoluteFill style={{filter: 'blur(8px)'}}>
        <YachtDeck t={t + 26} px={200} horizon={1000} rock={0.3} />
      </AbsoluteFill>
      <CloseUp who="davi" cx={540} cy={1040} k={3.5} facing={-0.15} light={MOON_LIGHT} expr={{lookX: 0.4, lookY: -0.7, browRaise: 0.5, halfSmile: kf(frame, [6, 18], [0.1, 0.6]), mouthOpen: 0}} />
      <Finish vignette={0.6} tint="rgba(80,120,220,0.25)" />
    </Rig>
  );
};

export const B30Shrug: React.FC = () => {
  const {frame, t} = useShot();
  const s = kf(frame, [0, 6, 26, 34], [0, 1, 1, 0.6], easeOut);
  return (
    <Rig s0={1.02} s1={1.1} x0={-10} x1={10} oy={1100} impacts={[{at: 3, amp: 6, dur: 8}]}>
      <YachtDeck t={t + 28} px={-80} horizon={1000} rock={0.3} />
      <AbsoluteFill style={{filter: 'blur(4px)'}}>
        <PlacedLia x={150} y={2300} height={1800} light={MOON_LIGHT} pose={{facing: 0.6, ...CROSSED}} expr={{lookX: 0.9, smile: kf(frame, [14, 30], [0.2, 0.9]), mouthOpen: kf(frame, [16, 26], [0, 0.4])}} />
      </AbsoluteFill>
      <PlacedDavi x={600} y={2050 - s * 30} height={1550} light={MOON_LIGHT} pose={{facing: -0.2, shL: lerp(-8, -55, s), elL: lerp(6, -95, s), shR: lerp(8, 55, s), elR: lerp(-6, 95, s), headTilt: s * 8}} expr={{halfSmile: 0.9, smile: 0.4, browRaise: s * 0.8, browAsym: s * 0.4, lookX: -0.5}} />
      <Svg>
        {s > 0.5 &&
          [-1, 1].map((d) => (
            <g key={d} opacity={s}>
              <path d={`M${600 + d * 420},${900} q${d * 30},-40 ${d * 10},-90`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
              <path d={`M${600 + d * 470},${960} q${d * 30},-40 ${d * 10},-90`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
            </g>
          ))}
      </Svg>
      <Finish vignette={0.55} tint="rgba(80,120,220,0.25)" />
    </Rig>
  );
};

/* ------------------------------------------------------------------ L15 — back at the terrace */

const RochaAtTable: React.FC<{t: number; frame: number; wet?: number; shards?: number}> = ({t, frame, wet = 0, shards = 0}) => (
  <>
    <ChairBack x={760} y={1330} s={1.05} />
    <PlacedAgent variant="rochaGala" x={760} y={1545} height={SIT_H + 20} light={TERRACE_LIGHT} pose={{facing: 0.2, shL: 25, elL: 95, shR: -25, elR: -95, headTilt: 6}} expr={{lookY: 0.9, smile: 0.1 - wet * 0.3}} />
    <DinnerTable x={TABLE.x} y={TABLE.y} s={TABLE.s} t={t} plates={2} />
    <Svg>
      <Tablet x={760} y={1080} s={0.62} rot={-6} t={t} alarm={1} />
      {wet > 0 &&
        Array.from({length: 8}).map((_, i) => (
          <ellipse key={i} cx={700 + random(`wt${i}`) * 140} cy={880 + random(`wy${i}`) * 200 + ((frame * 3 + i * 20) % 60) * wet} rx={10} ry={16} fill="#8e1f3a" opacity={0.85 * wet} />
        ))}
      {shards > 0 &&
        Array.from({length: 20}).map((_, i) => (
          <path key={i} d="M0,-10 L8,4 L-6,6 Z" transform={`translate(${300 + random(`sd${i}`) * 500},${1150 + random(`sy${i}`) * 50}) rotate(${random(`sr${i}`) * 360}) scale(${1.5 + random(`ss${i}`)})`} fill="rgba(220,240,255,0.6)" stroke="#fff" strokeWidth={1.5} opacity={shards} />
        ))}
    </Svg>
  </>
);

export const B31Terrace: React.FC = () => {
  const {frame, t} = useShot();
  return (
    <Rig s0={1.15} s1={1.02} y0={-20} y1={0} r0={2} r1={0} whipIn="left" oy={1200}>
      <TerraceBG t={t + 300} horizon={640} balY={930} px={frame * 2} />
      <TerraceCrowd t={t} px={frame * 2} />
      <RochaAtTable t={t} frame={frame} />
      <Particles t={t} seed="b31" count={20} bokeh={8} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

const GLASS_ROW = Array.from({length: 7}).map((_, i) => ({x: 90 + i * 150, y: 1500 + (i % 2) * 40, s: 1.5 + (i % 3) * 0.15}));

export const B32Glasses: React.FC = () => {
  const {frame, t} = useShot();
  const vib = kf(frame, [0, 20], [0.5, 1]);
  return (
    <Rig s0={1.05} s1={1.14} x0={20} x1={-20} oy={1300}>
      <AbsoluteFill style={{filter: 'blur(10px)'}}>
        <TerraceBG t={t + 310} horizon={700} balY={1000} />
      </AbsoluteFill>
      <Svg>
        <rect x={-100} y={1460} width={1280} height={600} fill="#fbf8f3" />
        <rect x={-100} y={1460} width={1280} height={14} fill="#e2dcd2" />
        {GLASS_ROW.map((g, i) => (
          <WineGlass key={i} x={g.x + Math.sin(frame * 3.1 + i) * 4 * vib} y={g.y} s={g.s} wine={0.5} wobble={Math.sin(frame * 2.7 + i * 1.3) * 5 * vib} />
        ))}
        {/* sound rings coming in (30 claps) */}
        {Array.from({length: 6}).map((_, i) => {
          const r = ((frame * 40 + i * 160) % 1000) + 60;
          return <circle key={i} cx={540} cy={1250} r={r} fill="none" stroke="#a8e6ff" strokeWidth={6} opacity={0.6 * (1 - r / 1060)} />;
        })}
      </Svg>
      <Chip x={540} y={760} text="💥 ×30" k={kf(frame, [2, 8], [0, 1], easeOut)} color="#ff5a5a" size={70} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

export const B33Shatter: React.FC = () => {
  const {frame, t} = useShot();
  const slow = (i: number) => clamp((frame - i * 3) / 40);
  return (
    <Rig s0={1.0} s1={1.12} r0={-1} r1={1} impacts={[{at: 0, amp: 24, dur: 14, zoom: 0.05}]} oy={1300} ease={(x) => x}>
      <AbsoluteFill style={{filter: 'blur(3px)'}}>
        <TerraceBG t={t * 0.3 + 320} horizon={640} balY={930} />
        <TerraceCrowd t={t * 0.3} look={kf(frame, [4, 16], [0, 1])} />
      </AbsoluteFill>
      <Svg>
        <rect x={-100} y={1460} width={1280} height={600} fill="#fbf8f3" />
        <rect x={-100} y={1460} width={1280} height={14} fill="#e2dcd2" />
        {GLASS_ROW.map((g, i) => (
          <BurstGlass key={i} x={g.x} y={g.y} s={g.s} k={slow(Math.abs(i - 3))} seed={`b33-${i}`} />
        ))}
      </Svg>
      <Chip x={540} y={700} text={`TAÇAS: ${Math.max(0, 48 - Math.floor(frame * 1.6))}`} k={kf(frame, [4, 10], [0, 1], easeOut)} color="#ff5a5a" size={60} />
      <SlowMoGrade k={0.7} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

export const B34Bill: React.FC = () => {
  const {frame, t} = useShot();
  const C = wl('b34_bill', 'L15', 12); // "conta"
  const hand = kf(frame, [0, C + 2], [0, 1], easeOut);
  return (
    <Rig s0={1.12} s1={1.2} x0={-30} x1={-10} whipIn="right" oy={1100}>
      <TerraceBG t={t + 330} horizon={640} balY={930} />
      <RochaAtTable t={t} frame={frame} wet={0} shards={1} />
      <PlacedPuppet outfit={WAITER} x={lerp(1180, 1040, hand)} y={1720} height={1250} light={TERRACE_LIGHT} pose={{facing: -0.4, shL: lerp(-10, -80, hand), elL: lerp(0, -20, hand), lean: -6 * hand}} expr={{smile: 0.7, halfSmile: 0.5, lookX: -0.6}} />
      <Svg>
        <BillFolder x={lerp(1000, 860, hand)} y={lerp(1000, 980, hand)} s={0.8} rot={lerp(-20, -8, hand)} />
      </Svg>
      <Finish vignette={0.5} />
    </Rig>
  );
};

export const B35Rocha: React.FC = () => {
  const {frame, t} = useShot();
  return (
    <Rig s0={1.05} s1={1.12} r0={1} r1={-1} impacts={[{at: 3, amp: 22, dur: 10}]} oy={1000}>
      <AbsoluteFill style={{filter: 'blur(10px)'}}>
        <TerraceBG t={t + 340} horizon={700} balY={1000} />
      </AbsoluteFill>
      <CloseUp who="rocha" cx={540} cy={1000} k={3.4} facing={0} light={TERRACE_LIGHT} expr={{smile: -0.4, browTilt: -0.3, blink: kf(frame, [16, 18, 20], [0, 1, 0])}} />
      <Svg>
        <BillFolder x={780} y={1640} s={0.9} rot={-10} />
      </Svg>
      <Stamp x={540} y={1240} text="CONTA: ROCHA" k={kf(frame, [0, 5], [0, 1], easeOut)} rot={-8} size={110} />
      <Finish vignette={0.5} />
    </Rig>
  );
};
