import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import type {Pose} from '../../characters/types';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {ACADEMY, Bust, ForceDome, MOM_OUTFIT, PlacedBruno, VibeLines, vibe} from '../characters';
import {ArenaInterior} from '../sets/Academy';
import {Shockwave} from '../../fx/Shockwave';
import {Jit} from './shotsIntro';
import {
  ARENA_LIGHT,
  Chip,
  CutFlash,
  DaviRoom,
  Desk,
  EnergyLines,
  Finish,
  HudTag,
  LAMP_LIGHT,
  Rig,
  ShotP,
  Shards,
  SfxWord,
  Stamp,
  Svg,
  W,
  WineGlass,
  abs,
  clamp,
  easeOut,
  ev,
  kf,
  lerp,
} from './kit';

/* ------------------------------------------------------------------ L7: training montage */

/** 29. "Então ele treinou." — desk full of glasses popping one after the other; day/night flicker in the window. */
export const STrain: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const dayK = (Math.sin(fr * 0.45) + 1) / 2;
  const xs = [300, 470, 640, 810];
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} whip="l" pan={[30, 0, -30, 0]}>
      <DaviRoom t={t} deskY={1320} dayK={dayK} lamp={dayK < 0.5} />
      <Jit fr={fr} amp={5} seed="tr">
        <PlacedDavi x={200} y={1760} height={980} pose={{shR: 80, elR: 0, shL: 10, lean: 6}} expr={{browTilt: -0.7, smile: -0.1, lookX: 1, lookY: 0.3}} light={LAMP_LIGHT} />
      </Jit>
      <Svg>
        <Desk x0={40} x1={1040} y={1320} />
        {xs.map((x, i) => {
          const pop = 5 + i * 7;
          return fr < pop ? <WineGlass key={i} x={x} y={1320} s={0.55} wob={0.6} ph={fr * 2 + i} /> : <Shards key={i} x={x} y={1200} age={fr - pop} n={14} spread={14} seed={`tr${i}`} gravity={1.2} />;
        })}
        <VibeLines cx={380} cy={1060} w={80} h={120} k={1} frame={fr} n={2} width={7} />
      </Svg>
      {xs.map((x, i) => (fr >= 5 + i * 7 ? <SfxWord key={i} x={x} y={980} text="TING!" k={fr - 5 - i * 7} color="#8fd8ff" size={60} rot={(i % 2 ? 1 : -1) * 10} /> : null))}
      <Chip x={540} y={1720} text={dayK > 0.5 ? '☀️ DIA' : '🌙 NOITE'} k={1} color="#1a1420" fg="#ffd23a" size={40} />
      <Finish vignette={0.5} grain={0.12} />
    </Rig>
  );
};

/** 30. "Três anos." — calendar pages flying off the wall. */
export const SCalendar: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const idx = Math.min(35, Math.floor(fr * 1.4));
  const year = 1 + Math.floor(idx / 12);
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.12]} rot={[2, -1]} whip="u">
      <DaviRoom t={t} deskY={1700} dayK={0.6} lamp={false} />
      <AbsoluteFill style={{background: 'rgba(10,14,30,0.35)'}} />
      {/* calendar */}
      <div style={{position: 'absolute', left: 240, top: 560, width: 600, height: 700, background: '#fbf6ea', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', overflow: 'hidden'}}>
        <div style={{height: 160, background: '#e5484d', color: '#fff', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 110, textAlign: 'center', lineHeight: '160px'}}>{MONTHS[idx % 12]}</div>
        <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 40, textAlign: 'center', color: '#1a1420', marginTop: 14, letterSpacing: 6}}>ANO {year}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, padding: 30}}>
          {Array.from({length: 28}).map((_, i) => (
            <div key={i} style={{height: 60, borderRadius: 8, background: 'rgba(0,0,0,0.06)', fontFamily: HUD_FONT, fontSize: 26, color: '#555', textAlign: 'center', lineHeight: '60px', position: 'relative'}}>
              {i + 1}
              <span style={{position: 'absolute', inset: 0, color: '#e5484d', fontSize: 50, lineHeight: '56px'}}>✕</span>
            </div>
          ))}
        </div>
      </div>
      {/* flying pages */}
      <Svg>
        {Array.from({length: 8}).map((_, i) => {
          const age = (fr * 1.4 - i * 4.5) % 36;
          if (age < 0 || fr * 1.4 < i * 4.5) return null;
          const dir = random(`cp${i}`) > 0.5 ? 1 : -1;
          const x = 540 + dir * age * 26;
          const y = 700 - age * 14 + age * age * 0.6;
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${dir * age * 14})`} opacity={clamp(1 - age / 30)}>
              <rect x={-150} y={-170} width={300} height={340} rx={8} fill="#fbf6ea" stroke="#c9bfa8" strokeWidth={4} />
              <rect x={-150} y={-170} width={300} height={80} rx={8} fill="#e5484d" />
            </g>
          );
        })}
      </Svg>
      <HudTag x={540} y={1610} align="center" label="TREINO" value="3 ANOS" k={kf(fr, [2, 8], [0, 1])} color="#ffd23a" size={120} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/** 31. "Quatro mil copos quebrados." — a mountain of glass shards grows; counter 0 → 4.000; Davi on top. */
export const SPile: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const Q = ev(p, 'L7', 8);
  const g = kf(fr, [0, Q], [0.1, 1], easeOut);
  const count = Math.round(4000 * kf(fr, [0, Q], [0, 1], (x) => x * x));
  const peakY = lerp(1700, 1020, g);
  const halfW = lerp(140, 640, g);
  const pile = `M ${540 - halfW},1920 Q ${540 - halfW * 0.45},${peakY + 40} 540,${peakY} Q ${540 + halfW * 0.45},${peakY + 40} ${540 + halfW},1920 Z`;
  return (
    <Rig dur={p.dur} zoom={[1.15, 0.98]} pan={[0, 120, 0, 0]} pow={2.5} punches={[{at: Q, amt: 0.06}]}>
      <DaviRoom t={t} deskY={1500} dayK={0.2} />
      <AbsoluteFill style={{background: 'rgba(10,14,30,0.3)'}} />
      <Svg>
        <path d={pile} fill="#bfe6f6" stroke="#ffffff" strokeWidth={6} />
        {Array.from({length: 90}).map((_, i) => {
          const u = random(`pl${i}`) * 2 - 1;
          const v = random(`pv${i}`);
          const x = 540 + u * halfW * (0.95 - v * 0.6);
          const top = peakY + Math.abs(u) * (1920 - peakY) * 0.75;
          const y = lerp(top + 20, 1920, v);
          if (y > 1900) return null;
          const s = 14 + random(`ps${i}`) * 22;
          return <path key={i} d={`M 0,${-s} L ${s * 0.7},${s * 0.4} L ${-s * 0.6},${s * 0.5} Z`} transform={`translate(${x},${y}) rotate(${random(`pr${i}`) * 360})`} fill={i % 3 ? '#e4f6ff' : '#8fd8ff'} stroke="#ffffff" strokeWidth={2} opacity={0.9} />;
        })}
        {Array.from({length: 6}).map((_, i) => {
          const ph = (t * 1.5 + i / 6) % 1;
          const x = 540 + (random(`gl${i}`) - 0.5) * halfW * 1.2;
          const y = peakY + 60 + random(`gy${i}`) * 300;
          const s = Math.sin(ph * Math.PI) * 26;
          return <path key={i} d={`M ${x},${y - s} L ${x + s * 0.2},${y} L ${x},${y + s} L ${x - s * 0.2},${y} Z M ${x - s},${y} L ${x},${y + s * 0.2} L ${x + s},${y} L ${x},${y - s * 0.2} Z`} fill="#ffffff" />;
        })}
        {/* falling glasses feeding the pile */}
        {Array.from({length: 5}).map((_, i) => {
          const ph = ((fr + i * 7) % 18) / 18;
          return <path key={i} d="M -18,-30 L 18,-30 L 10,10 L -10,10 Z" transform={`translate(${200 + i * 170},${ph * (peakY - 100)}) rotate(${ph * 300})`} fill="rgba(200,230,255,0.6)" stroke="#fff" strokeWidth={3} opacity={fr < Q ? 1 : 0} />;
        })}
      </Svg>
      <PlacedDavi x={540} y={peakY + 18} height={lerp(300, 560, g)} pose={fr >= Q ? {shL: -150, elL: -10, shR: 150, elR: 10} : {shR: 30}} expr={{smile: fr >= Q ? 0.9 : 0.3, mouthOpen: fr >= Q ? 0.4 : 0, lookY: -0.3}} light={LAMP_LIGHT} />
      <HudTag x={540} y={560} align="center" label="COPOS QUEBRADOS" value={`COPOS: ${count.toLocaleString('pt-BR')}`} k={1} color={fr >= Q ? '#ffd23a' : '#ffffff'} size={110} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/** 32. "A mãe contou." — mom with a clipboard full of tally marks; deadpan look to camera on "contou". */
export const SMom: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const C = ev(p, 'L7', 11);
  const look = kf(fr, [C - 1, C + 2], [0, 1]);
  const tick = kf(fr, [C - 8, C - 2], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} whip="r" punches={[{at: C, amt: 0.07, len: 8}]} origin={[540, 900]}>
      <AbsoluteFill style={{filter: 'blur(8px)', transform: 'scale(1.1)'}}>
        <DaviRoom t={t} deskY={1500} dayK={0.7} lamp={false} />
      </AbsoluteFill>
      <Bust
        outfit={MOM_OUTFIT}
        cx={540}
        cy={820}
        r={230}
        pose={{headTilt: lerp(12, 0, look), facing: lerp(-0.2, 0, look)}}
        expr={{lookX: lerp(-0.3, 0, look), lookY: lerp(0.9, 0, look), blink: lerp(0.2, 0.55, look), smile: lerp(0, -0.15, look), browRaise: lerp(0, -0.3, look), browTilt: 0}}
        light={LAMP_LIGHT}
      />
      <Svg>
        {/* clipboard */}
        <g transform="translate(540,1420) rotate(-4)">
          <rect x={-330} y={-330} width={660} height={700} rx={24} fill="#8a5a36" />
          <rect x={-300} y={-290} width={600} height={640} fill="#fbf6ea" />
          <rect x={-100} y={-360} width={200} height={70} rx={14} fill="#9aa0ae" />
          <text x={0} y={-230} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={46} fill="#1a1420">
            COPOS QUEBRADOS
          </text>
          {Array.from({length: 36}).map((_, i) => {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const x = -260 + col * 92;
            const y = -170 + row * 80;
            return (
              <g key={i} stroke="#2a2d3a" strokeWidth={5} strokeLinecap="round">
                {[0, 1, 2, 3].map((k) => (
                  <line key={k} x1={x + k * 14} y1={y} x2={x + k * 14} y2={y + 56} />
                ))}
                <line x1={x - 6} y1={y + 46} x2={x + 52} y2={y + 8} />
              </g>
            );
          })}
          <line x1={250} y1={300} x2={250} y2={300 - 56 * tick} stroke="#e5484d" strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* pen */}
        <g transform={`translate(${800 - 40 * (1 - tick)},${1700 - 56 * tick}) rotate(-30)`}>
          <rect x={0} y={-14} width={260} height={28} rx={8} fill="#2f4f8f" />
          <path d="M 0,-14 L -40,0 L 0,14 Z" fill="#e5e5e5" />
        </g>
      </Svg>
      {fr >= C && <SfxWord x={830} y={600} text="…" k={fr - C} color="#ffffff" size={120} rot={0} />}
      <Finish vignette={0.5} grain={0.12} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ L8: final exam, Bruno */

const ScreenText: React.FC<{lines: [string, number, string][]}> = ({lines}) => (
  <>
    {lines.map(([s, size, c], i) => (
      <div key={i} style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: size, color: c, lineHeight: 1.05, letterSpacing: 2, textShadow: `0 0 24px ${c}`}}>
        {s}
      </div>
    ))}
  </>
);

/** 33. "Prova final." — packed arena, crane down from the screen; stamp. Davi tiny on the sand, gulping. */
export const SFinal: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const F = ev(p, 'L8', 1);
  const viewY = kf(fr, [0, 20], [-520, 0], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} shakes={[{at: F, dur: 10, amp: 10}]}>
      <ArenaInterior
        t={t}
        viewY={viewY}
        excite={0.9}
        screen={<ScreenText lines={[['PROVA', 150, '#ffffff'], ['FINAL', 190, '#ffd23a']]} />}
        actors={
          <Jit fr={fr} amp={2} seed="fn">
            <PlacedDavi x={210} y={1760} height={560} pose={{shL: -10, shR: 20, elR: -40}} expr={{eyesWide: 0.8, smile: -0.4, browTilt: 0.8, lookX: 0.6, lookY: -0.3}} light={ARENA_LIGHT} />
          </Jit>
        }
      />
      <Stamp x={540} y={1650} text="PROVA FINAL" color="#e5484d" k={fr - F} size={110} rot={-6} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/** Low-lying smoke puffs at the tunnel mouth. */
const Smoke: React.FC<{t: number; x: number; y: number; w: number; k?: number}> = ({t, x, y, w, k = 1}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    {Array.from({length: 12}).map((_, i) => {
      const ph = (t * 0.4 + i / 12) % 1;
      const px = x + (random(`sm${i}`) - 0.5) * w + Math.sin(t + i) * 30;
      return <circle key={i} cx={px + (px - x) * ph} cy={y - ph * 140} r={90 + ph * 120} fill="#d8dce8" opacity={k * 0.35 * Math.sin(ph * Math.PI)} />;
    })}
  </svg>
);

/** 34. "O rival dele, o Bruno:" — Bruno walks out of the tunnel through smoke, low angle. */
export const SEnter: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const B = ev(p, 'L8', 6);
  const g = kf(fr, [0, p.dur], [0, 1], (x) => x);
  const s = Math.sin(t * 7);
  const pose: Pose = {hipL: s * 14, hipR: -s * 14, knL: Math.max(0, -s) * 18, knR: Math.max(0, s) * 18, shL: -14 - s * 10, elL: 14, shR: 14 + s * 10, elR: -14, bob: -Math.abs(s) * 10};
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.18]} origin={[540, 1200]} whip="d" punches={[{at: B, amt: 0.05}]}>
      <ArenaInterior
        t={t}
        viewY={120}
        excite={0.7}
        tunnelGlow={0.8}
        actors={
          <>
            <PlacedBruno x={540} y={lerp(1300, 1560, g)} height={lerp(520, 900, g)} pose={pose} light={ARENA_LIGHT} expr={{lookX: 0, lookY: 0}} />
            <Smoke t={t} x={540} y={1360} w={420} />
          </>
        }
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 30% 25% at 50% 52%, rgba(255,190,110,0.35), rgba(0,0,0,0) 70%)', mixBlendMode: 'screen'}} />
      <Chip x={540} y={600} text="⚠ O RIVAL" k={kf(fr, [ev(p, 'L8', 3), ev(p, 'L8', 3) + 6], [0, 1])} color="#e5484d" fg="#ffffff" size={44} />
      <HudTag x={540} y={1600} align="center" label="RANKING #1 DA ACADEMIA" value="BRUNO" k={kf(fr, [B, B + 5], [0, 1])} color="#ffffff" size={130} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/** 35. "superforça e" — double-biceps flex, red power aura, shockwave. */
export const SFlex: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const fl = kf(fr, [0, 6], [0, 1], easeOut);
  const pose: Pose = {shL: lerp(-14, -96, fl), elL: lerp(14, -84, fl), shR: lerp(14, 96, fl), elR: lerp(-14, 84, fl), bob: -10 * fl};
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.2]} whip="l" shakes={[{at: 6, dur: 12, amp: 18}]} origin={[540, 1000]}>
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.1)'}}>
        <ArenaInterior t={t} viewY={300} excite={1} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(255,80,40,${0.45 * fl}), rgba(0,0,0,0.2) 65%)`}} />
      <Shockwave cx={540} cy={1000} age={fr - 6} rings={3} speed={40} maxR={900} color="255,150,110" />
      <PlacedBruno x={540} y={1840} height={1080} pose={pose} light={{side: 1, rim: '#ff8a5a', rimStrength: 0.9, shadeStrength: 0.6}} expr={{smile: 0.6, halfSmile: 1, browTilt: -0.6, blink: 0.2}} />
      <EnergyLines x={540} y={900} r0={430} r1={780} k={fl} frame={fr} seed="fx" count={16} color="#ff7a4a" />
      <HudTag x={540} y={1620} align="center" label="PODER 1" value="SUPERFORÇA 💪" k={kf(fr, [2, 7], [0, 1])} color="#ffb03a" size={100} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/** 36. "campo de força." — blue dome flashes up; a soda can thrown from the crowd bounces off. */
export const SDome: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const D = 3;
  const dk = kf(fr, [D, D + 5], [0, 1], easeOut);
  const HIT = 16;
  const canX = fr < HIT ? lerp(-80, 330, fr / HIT) : 330 - (fr - HIT) * 30;
  const canY = fr < HIT ? lerp(500, 900, fr / HIT) : 900 - (fr - HIT) * 34 + (fr - HIT) * (fr - HIT) * 1.4;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} whip="r" shakes={[{at: D, dur: 10, amp: 14}]} origin={[540, 1100]}>
      <ArenaInterior
        t={t}
        viewY={260}
        excite={0.9}
        actors={<PlacedBruno x={540} y={1700} height={1000} pose={{shL: 50, elL: 90, shR: -50, elR: -90}} light={ARENA_LIGHT} expr={{halfSmile: 1, blink: 0.35, browAsym: 0.8}} />}
      />
      <ForceDome cx={540} baseY={1720} r={560} k={dk} t={t} wobble={fr >= HIT && fr < HIT + 10 ? 1 - (fr - HIT) / 10 : 0} />
      <AbsoluteFill style={{background: `rgba(120,210,255,${0.6 * kf(fr, [D, D + 2, D + 7], [0, 1, 0])})`, pointerEvents: 'none'}} />
      <Svg>
        <g transform={`translate(${canX},${canY}) rotate(${fr * 30})`}>
          <rect x={-26} y={-44} width={52} height={88} rx={10} fill="#e5484d" />
          <rect x={-26} y={-12} width={52} height={22} fill="#ffffff" />
        </g>
      </Svg>
      {fr >= HIT && <SfxWord x={360} y={760} text="TOINC!" k={fr - HIT} color="#8fd8ff" size={90} rot={-10} />}
      <HudTag x={540} y={1620} align="center" label="PODER 2" value="CAMPO DE FORÇA 🛡️" k={kf(fr, [D, D + 5], [0, 1])} color="#8fd8ff" size={100} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/** 37. "Nunca perdeu." — camera tilts up from Bruno (arms crossed) to the giant screen: BRUNO · #1 · INVICTO. */
export const SScreen: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tilt = kf(fr, [0, 18], [0, 1]);
  const viewY = lerp(380, -1230, tilt);
  const S = Math.max(ev(p, 'L8', 13), 18);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.05]} shakes={[{at: S, dur: 10, amp: 10}]}>
      <ArenaInterior
        t={t}
        viewY={viewY}
        excite={1}
        screen={
          <>
            <div style={{position: 'absolute', left: 40, top: 30, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: ACADEMY.gold}}>● AO VIVO</div>
            <ScreenText lines={[['BRUNO', 170, '#ffffff'], ['#1 · INVICTO', 92, '#ffd23a']]} />
            <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 36, letterSpacing: 4, color: '#bfe6ff', marginTop: 16}}>VITÓRIAS 47 · DERROTAS 0</div>
          </>
        }
        actors={<PlacedBruno x={540} y={1900} height={1150} pose={{shL: 50, elL: 90, shR: -50, elR: -90}} light={ARENA_LIGHT} expr={{halfSmile: 1, blink: 0.3, lookY: -0.2}} />}
      />
      {fr >= S && (
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920}}>
          <Stamp x={540} y={1280} text="INVICTO" sub="NUNCA PERDEU" color="#e5484d" k={fr - S} size={120} rot={-8} />
        </div>
      )}
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

export {CutFlash, DAVI_OUTFIT, VibeLines, vibe};
