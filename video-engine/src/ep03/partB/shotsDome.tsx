import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HUD_FONT} from '../../lib/fonts';
import {PlacedBruno, WaveLine} from '../characters';
import {Tuner} from '../Tuner';
import {Rig, ShotP, abs, ev} from './rig';
import {Arena} from './arena';
import {
  ARENA_LIGHT,
  BigHand,
  Chip,
  CutFlash,
  DAVI_OUTFIT,
  DOME_LIGHT,
  Dome,
  EnergyLines,
  Finger,
  Finish,
  HudTag,
  Pup,
  Shards,
  Shockwave,
  SoundWord,
  Svg,
  Sweat,
  VibeTicks,
  clamp,
  easeOut,
  kf,
  lerp,
  trem,
  walkP,
} from './kit';

/* "O Bruno levanta o escudo." — low angle: Bruno punches fists together, the blue hex dome grows around him. */
export const SEscudo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const lev = ev(p, 'L9', 2);
  const esc = ev(p, 'L9', 4);
  const arms = kf(fr, [lev - 6, lev], [0, 1], easeOut);
  const grow = kf(fr, [lev, esc + 2], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.16, 1.04]} pan={[0, 70, 0, 0]} rot={[-2, 1]} pow={1.8} shakes={[{at: esc, amp: 14}]} punches={[{at: esc, amt: 0.06}]}>
      <Arena t={t} excite={0.5} viewY={-120} />
      <PlacedBruno
        x={540}
        y={1780}
        height={1280}
        light={DOME_LIGHT}
        pose={{shL: lerp(-10, 55, arms), elL: lerp(8, 95, arms), shR: lerp(10, -55, arms), elR: lerp(-8, -95, arms)}}
        expr={{browTilt: -0.8, halfSmile: 1}}
      />
      {grow > 0.01 && <Dome cx={540} by={1800} r={lerp(120, 720, grow)} t={t} op={clamp(grow * 2)} wob={1 - grow} />}
      <Shockwave cx={540} cy={1500} age={fr - esc} rings={3} color="140,210,255" />
      <HudTag x={540} y={1640} label="BRUNO" value="CAMPO DE FORÇA" k={kf(fr, [esc, esc + 6], [0, 1], easeOut)} align="center" size={84} color="#8fd8ff" />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* "O Davi encosta o dedo." — side two-shot: Davi walks up to the dome and touches it with one finger. */
export const SDedo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const dedo = ev(p, 'L9', 9);
  const walk = kf(fr, [0, dedo - 8], [0, 1], easeOut);
  const raise = kf(fr, [dedo - 10, dedo], [0, 1], easeOut);
  const dx = lerp(80, 300, walk);
  const shR = lerp(10, 82, raise);
  const elR = lerp(-8, 0, raise);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[-30, 0, 20, 0]} rot={[0, -1]} whip="r" origin={[600, 1200]}>
      <Arena t={t} excite={0.4} px={-60} />
      <PlacedBruno x={880} y={1800} height={1100} light={DOME_LIGHT} pose={{shL: 50, elL: 100, shR: -50, elR: -100, facing: -0.4}} expr={{lookX: -0.8}} flip />
      <Dome cx={900} by={1810} r={700} t={t} ripple={fr >= dedo ? fr - dedo : -1} tx={dx + 400} ty={1180} />
      <Pup
        outfit={DAVI_OUTFIT}
        x={dx}
        y={1800}
        height={980}
        light={ARENA_LIGHT}
        pose={{...walkP(t, 0, 1 - raise), shR, elR, facing: 0.5}}
        expr={{smile: 0.3, halfSmile: 0.6, lookX: 0.8}}
        handProps={{R: raise > 0.4 ? <Finger angle={shR + elR} /> : undefined}}
      />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* "Ding." — extreme close-up: fingertip on the dome, ripple rings, comic DING. */
export const SDing: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tx = 470;
  const ty = 1010;
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.0]} rot={[2, 0]} pow={2.5} punches={[{at: 0, amt: 0.08}]}>
      <Arena t={t} zoom={2.2} blur={14} excite={0.3} zy={1100} />
      <AbsoluteFill style={{background: 'rgba(10,30,70,0.35)'}} />
      <Dome cx={1500} by={2700} r={Math.hypot(1500 - tx, 2700 - ty)} t={t} ripple={fr} tx={tx} ty={ty} front={false} />
      <BigHand x={tx - 4} y={ty} angle={-12} s={1.25} />
      <Svg>
        <circle cx={tx} cy={ty} r={lerp(20, 70, clamp(fr / 6))} fill="#fff" opacity={clamp(1 - fr / 10)} style={{filter: 'blur(6px)'}} />
      </Svg>
      <SoundWord x={720} y={720} text="DING!" k={fr} size={190} rot={-10} color="#bff2ff" stroke="#0b2a55" />
      <Finish vignette={0.4} grain={0.06} />
      <CutFlash frames={4} color="200,240,255" peak={0.7} />
    </Rig>
  );
};

/* "Quatrocentos e quarenta hertz." — the tuner sweeps and locks on 440 Hz · LÁ; the dome's wave on screen. */
export const SHertz: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const lock = ev(p, 'L9', 13);
  const locked = fr >= lock;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.07]} pan={[20, 0, -10, 0]} rot={[-1, 0.5]} whip="u" punches={[{at: lock, amt: 0.05}]}>
      <Arena t={t} zoom={1.6} blur={8} zy={1200} excite={0.3} />
      <Dome cx={760} by={2100} r={1120} t={t} ripple={fr + 30} tx={300} ty={1250} />
      <BigHand x={300} y={1250} angle={-20} s={0.9} />
      <Svg>
        <rect x={90} y={1000} width={900} height={190} rx={20} fill="rgba(10,14,30,0.7)" stroke={locked ? '#3be08a' : '#8fd8ff'} strokeWidth={4} />
        <WaveLine x1={110} x2={970} y={1095} amp={60} cycles={locked ? 8.8 : lerp(4, 8.8, clamp(fr / lock))} phase={-t * 30} color={locked ? '#3be08a' : '#8fd8ff'} width={8} />
      </Svg>
      <div style={{position: 'absolute', left: 120, top: 1205, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: '#bff2ff'}}>FREQUÊNCIA NATURAL DO ESCUDO</div>
      <Tuner hz={440} note="LÁ" x={300} y={540} from={0} lockAt={lock} fromHz={180} scale={1.5} />
      <Finish vignette={0.4} grain={0.06} />
    </Rig>
  );
};

/* "Ele vibra no mesmo ritmo." — Davi close, yellow energy lines from the finger up the arm; waves slide into phase. */
export const SVibra: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const rit = ev(p, 'L10', 4);
  const phase = kf(fr, [0, rit], [Math.PI, 0]);
  const pow = kf(fr, [0, 8], [0, 1], easeOut);
  const j = trem(fr, 4 * pow, 'vb');
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.02]} pan={[0, 0, 30, 0]} rot={[1, -1]} whip="l" punches={[{at: rit, amt: 0.05}]}>
      <Arena t={t} zoom={1.7} blur={9} zy={1300} excite={0.4} />
      <Dome cx={1450} by={2300} r={900} t={t} wob={0.15 + 0.1 * pow} ripple={fr % 20} tx={700} ty={1450} />
      <AbsoluteFill style={{transform: `translate(${j.x}px,${j.y}px)`}}>
        <Pup outfit={DAVI_OUTFIT} x={250} y={2700} height={1750} upperOnly light={ARENA_LIGHT} pose={{shR: 75, elR: 6, facing: 0.5}} expr={{browTilt: -0.4, halfSmile: 0.8, lookX: 0.9, eyesWide: 0}} handProps={{R: <Finger angle={81} />}} />
      </AbsoluteFill>
      <EnergyLines x={700} y={1450} r0={40} r1={300} k={pow} frame={fr} seed="vb" count={18} />
      <VibeTicks x={420} y={1500} w={420} h={260} frame={fr} k={pow} />
      {/* wave sync inset */}
      <Svg>
        <rect x={80} y={540} width={920} height={300} rx={22} fill="rgba(10,14,30,0.78)" stroke={fr >= rit ? '#3be08a' : '#ffd23a'} strokeWidth={4} />
        <WaveLine x1={110} x2={970} y={690} amp={70} cycles={4} phase={-t * 20} color="#8fd8ff" width={10} opacity={0.9} />
        <WaveLine x1={110} x2={970} y={690} amp={70} cycles={4} phase={-t * 20 + phase} color="#ffd23a" width={7} />
      </Svg>
      <div style={{position: 'absolute', left: 110, top: 552, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: '#fff'}}>
        <span style={{color: '#8fd8ff'}}>ESCUDO</span> · <span style={{color: '#ffd23a'}}>DAVI</span>
      </div>
      <Chip x={540} y={880} text="✓ EM FASE · 440 Hz" k={kf(fr, [rit, rit + 5], [0, 1], easeOut)} color="#3be08a" size={44} />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/* "O escudo treme, treme," — wide: dome wobbles harder; cracks on the 2nd "treme"; Bruno sweats inside. */
export const STreme: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const t1 = ev(p, 'L10', 7);
  const t2 = ev(p, 'L10', 8);
  const wob = kf(fr, [0, t1, t1 + 4, t2, t2 + 4, p.dur], [0.25, 0.4, 0.7, 0.6, 1.0, 1.1]);
  const crack = kf(fr, [t2, p.dur], [0.1, 0.55]);
  const worry = kf(fr, [0, t2], [0.3, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[0, 1.5]} pow={1.3} shakes={[{at: t1, amp: 10}, {at: t2, amp: 18}]} punches={[{at: t2, amt: 0.08}]} origin={[540, 1300]}>
      <Arena t={t} excite={0.7} />
      <PlacedBruno x={560} y={1760} height={1050} light={DOME_LIGHT} pose={{shL: 40, elL: 110, shR: -40, elR: -110}} expr={{halfSmile: 0, smile: -0.4, browTilt: worry, eyesWide: worry * 0.8, lookY: -0.6, mouthOpen: 0.2}} />
      <Sweat x={560} y={850} t={t} s={1.3} k={worry} />
      <Dome cx={560} by={1780} r={640} t={t} wob={wob} crack={crack} tx={190} ty={1450} ripple={(fr * 2) % 40} />
      <Pup outfit={DAVI_OUTFIT} x={60} y={1840} height={900} light={ARENA_LIGHT} pose={{shR: 70, elR: 0, facing: 0.5}} expr={{halfSmile: 0.8, lookX: 0.8}} handProps={{R: <Finger angle={70} />}} />
      <EnergyLines x={190} y={1450} r0={30} r1={200} k={1} frame={fr} seed="tr" count={12} />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* "e quebra igual taça." — slow-mo shatter into blue glass shards; Bruno shields his face. */
export const SQuebra: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const q = ev(p, 'L10', 10);
  const ta = ev(p, 'L10', 12);
  const age = fr - q;
  const cover = kf(fr, [q, q + 6], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.18]} rot={[-1, 1]} pow={1} shakes={[{at: q, amp: 26, dur: 18}]} punches={[{at: q, amt: 0.1, len: 16}]} origin={[540, 1200]}>
      <Arena t={t * 0.3} excite={0.2} />
      <PlacedBruno
        x={540}
        y={1780}
        height={1100}
        light={DOME_LIGHT}
        pose={{shL: lerp(40, 130, cover), elL: lerp(110, 60, cover), shR: lerp(-40, -130, cover), elR: lerp(-110, -60, cover), lean: -4 * cover}}
        expr={{halfSmile: 0, eyesWide: 1, mouthOpen: 0.8, browTilt: 1, smile: -0.5}}
      />
      {age < 0 && <Dome cx={540} by={1800} r={660} t={t} wob={1.2} crack={kf(fr, [0, q], [0.55, 1])} tx={160} ty={1400} />}
      <Shards cx={540} cy={1500} r={620} age={age} slow={0.35} n={60} />
      <Shockwave cx={540} cy={1400} age={age} rings={4} color="160,220,255" speed={30} />
      <Chip x={540} y={1690} text="QUEBROU IGUAL TAÇA 🍷" k={kf(fr, [ta, ta + 5], [0, 1], easeOut)} color="#8fd8ff" size={50} />
      <Finish vignette={0.45} grain={0.07} tint="rgba(120,200,255,0.25)" />
      <CutFlash at={q} frames={7} color="210,240,255" peak={0.95} />
    </Rig>
  );
};
