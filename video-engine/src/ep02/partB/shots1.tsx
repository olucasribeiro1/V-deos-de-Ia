import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {PlacedPuppet} from '../../characters/Puppet';
import type {Outfit} from '../../characters/types';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Particles} from '../../fx/Particles';
import {Flash, Rastro} from '../../fx/Rastro';
import {Shockwave} from '../../fx/Shockwave';
import {AirMolecules} from '../../fx/AirMolecules';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Flock} from '../../ep01/partB/kit';
import {Rig, ShotP, abs, ev} from './rig';
import {BLUE_LIGHT, GALA_LIGHT, HudTag, StallRow, Svg, Terrace} from './sets';
import {BlownDebris, GloveHold, ImpactWord, Phone, Plaza, Thumb, walk} from './kit';
import {TerraceCrowd} from './crowd';

/* 1. "E o Davi tinha um costume" — Davi points smugly at a big restroom sign. */
export const SHabit: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const raise = kf(fr, [6, 18], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.14, 1.0]} rot={[2, -1]} pan={[30, 0, -20, 0]} whip="r" pow={1.6}>
      <AbsoluteFill style={{filter: 'blur(9px)'}}>
        <StallRow t={t} doors={4} floorY={1700} px={-fr * 3} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(20,40,60,0.25)'}} />
      <Svg>
        {/* WC sign */}
        <g transform={`translate(${540 + fr * 0.8},${700}) rotate(${-3 + Math.sin(t * 3) * 1})`}>
          <rect x={-330} y={-170} width={660} height={300} rx={36} fill="#163d6b" stroke="#e7eef6" strokeWidth={10} />
          {/* man */}
          <circle cx={-180} cy={-90} r={34} fill="#fff" />
          <path d="M -230,-40 L -130,-40 L -138,60 L -160,60 L -165,110 L -195,110 L -200,60 L -222,60 Z" fill="#fff" />
          <rect x={-8} y={-140} width={16} height={240} rx={8} fill="#e7eef6" />
          {/* woman */}
          <circle cx={180} cy={-90} r={34} fill="#fff" />
          <path d="M 180,-46 L 240,70 L 120,70 Z" fill="#fff" />
          <rect x={150} y={60} width={20} height={50} fill="#fff" />
          <rect x={190} y={60} width={20} height={50} fill="#fff" />
          <circle cx={0} cy={-150} r={26} fill="#7fd8ff" opacity={0.5 + 0.5 * Math.sin(t * 8)} />
        </g>
      </Svg>
      <PlacedDavi
        x={520}
        y={2020}
        height={1280}
        light={BLUE_LIGHT}
        pose={{shR: lerp(10, 158, raise), elR: lerp(-8, 14, raise), shL: -8, elL: 10, headTilt: lerp(0, -6, raise), facing: 0.25, bob: Math.sin(t * 3) * 4}}
        expr={{halfSmile: lerp(0.3, 1, raise), browAsym: raise * 0.8, lookX: 0.6, lookY: -0.4}}
      />
      <Particles t={t} seed="hb" count={14} bokeh={5} color="190,230,255" bokehColor="120,200,255" />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 2. "chegar no banheiro" — blue rastro glow leaks under a stall door. */
export const SStall: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const B = ev(p, 'L9', 8);
  const glow = kf(fr, [B - 10, B, B + 4, p.dur], [0, 1, 0.75, 0.55], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.32]} origin={[540, 1560]} pan={[-40, 0, 20, -30]} pow={1.5} shakes={[{at: B, dur: 10, amp: 12}]} punches={[{at: B, amt: 0.05}]}>
      <StallRow t={t} doors={3} doorW={300} floorY={1640} glowIdx={1} glow={glow} px={fr * 1.5} />
      <Flash k={kf(fr, [B, B + 1, B + 5], [0, 0.45, 0], (x) => x)} color="150,220,255" />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 3. "Porque chegar empurra" — arrival in an open plaza: rastro, shockwave, pigeons and papers blown out. */
const CASUAL_A: Outfit = {...DAVI_OUTFIT, top: {base: '#c94f5a', shade: '#8f2f3a', light: '#e57a84'}, legs: {base: '#d8cdb8', shade: '#a99d88', light: '#f0e6d4'}, shoeColor: {base: '#eee', shade: '#bbb', light: '#fff'}, head: {hair: 'buzz', hairColor: '#3a2a1e'}, skin: {base: '#e2b08c', shade: '#b07e5c', light: '#f5cfb0'}};
const CASUAL_B: Outfit = {...DAVI_OUTFIT, torso: 'dress', top: {base: '#4a7fc9', shade: '#2f5a95', light: '#7aa8e6'}, legs: {base: '#6e3f26', shade: '#4e2a18', light: '#8f5c42'}, skin: {base: '#6e3f26', shade: '#4e2a18', light: '#8f5c42'}, shoes: 'sneaker', head: {hair: 'curlyBun', hairColor: '#1a100a', earrings: '#e8b84a', lashes: true, lipstick: '#8e2c3a', browWidth: 12}, armW: 50, legW: 54};
export const SPlaza: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const A = ev(p, 'L10', 1);
  const age = fr - A;
  const on = age >= 0;
  const push = kf(age, [0, 14], [0, 1], easeOut);
  const hat = Math.max(0, age);
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.16]} rot={[-2, 1]} origin={[540, 1200]} shakes={[{at: A, dur: 16, amp: 30}]} punches={[{at: A, amt: 0.1}]} whip="u">
      <Plaza t={t} px={-fr * 2} />
      <Shockwave cx={540} cy={1150} age={age} rings={4} speed={44} color="210,240,255" />
      <PlacedPuppet outfit={CASUAL_A} x={180 - push * 60} y={1560} height={620} pose={{lean: -push * 14, shL: -40 * push, elL: 60 * push, shR: 50 * push, elR: -30, hipL: -6, hipR: 10 * push}} expr={{eyesWide: push, mouthOpen: push * 0.5, browRaise: push}} light={GALA_LIGHT} />
      <PlacedPuppet outfit={CASUAL_B} x={900 + push * 60} y={1580} height={600} flip pose={{lean: -push * 12, shL: -30 * push, elL: 40, shR: 70 * push, elR: -60 * push, facing: 0.3}} expr={{eyesWide: push, mouthOpen: push * 0.6, browRaise: push}} light={GALA_LIGHT} />
      {/* hat flying off */}
      <Svg>
        <g transform={`translate(${180 - 70 + hat * -16},${1560 - 600 - hat * 18 + hat * hat * 0.5}) rotate(${-hat * 14})`} opacity={1}>
          <ellipse cx={0} cy={0} rx={90} ry={22} fill="#d8c08a" />
          <path d="M -50,0 Q -48,-70 0,-72 Q 48,-70 50,0 Z" fill="#cdb070" />
          <rect x={-50} y={-22} width={100} height={14} fill="#2a2a30" />
        </g>
        <Flock frame={fr} start={A} ox={540} oy={1500} count={12} spread={430} size={70} seed="pz" speed={1.2} />
      </Svg>
      {on && (
        <PlacedDavi x={540} y={1540} height={760} light={BLUE_LIGHT} pose={{shL: -24, elL: 20, shR: 24, elR: -20, bob: kf(age, [0, 6], [-30, 0], easeOut)}} expr={{smile: 0.2, browRaise: 0.3}} />
      )}
      <Rastro x={540} y={1540} height={820} life={age / 22} frame={fr} seed="pzr" />
      <BlownDebris cx={540} cy={1250} age={age} count={20} seed="pzd" />
      <Flash k={kf(age, [0, 1, 6], [0, 0.85, 0], (x) => x)} />
      <Finish vignette={0.45} />
    </Rig>
  );
};

/* 4. "setenta litros de ar pra fora" — diagram: molecules pushed outward from the silhouette. HUD AR 70 L. */
export const SDiagram: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const F = ev(p, 'L10', 8);
  const out = kf(fr, [0, F + 4], [1, 0], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.18, 1.02]} rot={[3, 0]} pow={1.4} whip="l">
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 52%, #17345e 0%, #0a1830 55%, #050b18 100%)'}} />
      <Svg>
        {Array.from({length: 24}).map((_, i) => (
          <line key={'v' + i} x1={i * 48} y1={0} x2={i * 48} y2={H} stroke="#2a5a8a" strokeWidth={1.5} opacity={0.35} />
        ))}
        {Array.from({length: 42}).map((_, i) => (
          <line key={'h' + i} x1={0} y1={i * 48} x2={W} y2={i * 48} stroke="#2a5a8a" strokeWidth={1.5} opacity={0.35} />
        ))}
        {/* radial arrows */}
        {Array.from({length: 12}).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r0 = 260 + (1 - out) * 120;
          const r1 = r0 + 110 + (1 - out) * 160;
          const cx = 540;
          const cy = 1000;
          const x0 = cx + Math.cos(a) * r0 * 0.75;
          const y0 = cy + Math.sin(a) * r0 * 1.3;
          const x1 = cx + Math.cos(a) * r1 * 0.75;
          const y1 = cy + Math.sin(a) * r1 * 1.3;
          const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
          return (
            <g key={i} opacity={clamp(fr / 6) * (0.4 + 0.6 * (1 - out))}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#ffd36a" strokeWidth={8} strokeLinecap="round" />
              <path d="M 0,-16 L 28,0 L 0,16 Z" fill="#ffd36a" transform={`translate(${x1},${y1}) rotate(${ang})`} />
            </g>
          );
        })}
      </Svg>
      <AirMolecules cx={540} cy={1000} rx={170} ry={400} spread={3.2} progress={out} count={70} size={20} seed="dg" t={t} />
      <PlacedPuppet outfit={DAVI_OUTFIT} x={540} y={1440} height={880} ghost={{opacity: 0.95, color: '#7fd8ff', dash: 18}} />
      <HudLabel label="AR EMPURRADO" value={70} unit="L" x={600} y={540} tx={600} ty={880} from={2} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 5. "No banheiro" — inside the stall: Davi materialises, blue light floods, toilet paper unspools. */
export const SInstall: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const A = 4;
  const age = fr - A;
  const blue = kf(age, [0, 2, 20], [0, 1, 0.25], easeOut);
  const gust = kf(age, [0, 4, 24], [0, 1, 0.2], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} rot={[0, -3]} origin={[540, 900]} whip="d" shakes={[{at: A, dur: 12, amp: 18}]}>
      <AbsoluteFill style={{background: '#26323b'}} />
      <Svg>
        {/* back wall tiles */}
        <rect x={150} y={0} width={780} height={1500} fill="#c9d3d1" />
        {Array.from({length: 32}).map((_, r) => (
          <line key={r} x1={150} y1={r * 48} x2={930} y2={r * 48} stroke="#9fb0ae" strokeWidth={3} />
        ))}
        {/* partitions */}
        <path d="M 0,0 L 150,140 L 150,1460 L 0,1700 Z" fill="#47596a" />
        <path d="M 1080,0 L 930,140 L 930,1460 L 1080,1700 Z" fill="#3e4f5f" />
        <path d="M 0,1700 L 150,1460 L 930,1460 L 1080,1700 L 1080,1920 L 0,1920 Z" fill="#55606a" />
        {/* toilet */}
        <rect x={420} y={980} width={240} height={200} rx={20} fill="#f2f4f5" />
        <rect x={400} y={1160} width={280} height={40} rx={14} fill="#e1e5e7" />
        <path d="M 410,1200 Q 400,1380 470,1440 L 610,1440 Q 680,1380 670,1200 Z" fill="#eef1f2" />
        <rect x={520} y={1000} width={40} height={16} rx={6} fill="#c3c9cc" />
        {/* toilet paper on the left partition */}
        <rect x={110} y={1000} width={70} height={50} rx={10} fill="#9aa4ad" />
        <circle cx={150} cy={1060} r={36} fill="#f7f7f2" />
        <path
          d={`M 150,1096 C ${150 + gust * 220},${1150 + Math.sin(t * 22) * 40 * gust} ${170 + gust * 120},${1250 + gust * -60} ${180 + gust * 260},${1350 - gust * 220 + Math.sin(t * 18) * 50 * gust}`}
          stroke="#f7f7f2"
          strokeWidth={46}
          fill="none"
          strokeLinecap="round"
        />
        {/* blue flood */}
        <rect x={0} y={0} width={W} height={H} fill="#4cc6ff" opacity={blue * 0.35} style={{mixBlendMode: 'screen'}} />
      </Svg>
      {age >= 0 && (
        <PlacedDavi x={540} y={1800} height={1060} light={BLUE_LIGHT} pose={{shL: -20 - gust * 10, elL: 16, shR: 20 + gust * 10, elR: -16, bob: kf(age, [0, 5], [-24, 0], easeOut), headTilt: Math.sin(t * 5) * 2}} expr={{blink: kf(age, [0, 3, 7], [1, 1, 0]), smile: 0.3, browRaise: 0.2}} />
      )}
      <Rastro x={540} y={1800} height={1100} life={age / 20} frame={fr} seed="isr" />
      <Flash k={kf(age, [0, 1, 6], [0, 0.9, 0], (x) => x)} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 6. "só bate a porta da cabine" — exterior: stall door slams (BLAM), HUD AR 70 L. */
export const SSlam: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const S = 3;
  const open = kf(fr, [0, S], [0.75, 0], easeIn);
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.2]} rot={[-2, 2]} origin={[540, 1100]} shakes={[{at: S, dur: 14, amp: 28}]} punches={[{at: S, amt: 0.08}]}>
      <StallRow t={t} doors={3} doorW={300} floorY={1640} glowIdx={1} glow={kf(fr, [S, p.dur], [0.9, 0.35])} doorOpen={[0, open, 0]} px={-fr} />
      {/* dust from the door top */}
      <Svg>
        {fr > S &&
          Array.from({length: 14}).map((_, i) => {
            const a = fr - S;
            return <circle key={i} cx={390 + i * 22 + a * (i - 7) * 1.5} cy={640 - a * 2 + a * a * 0.3} r={6 + (i % 3) * 3} fill="#e9eef0" opacity={clamp(1 - a / 18) * 0.8} />;
          })}
      </Svg>
      <ImpactWord text="BLAM!" x={540} y={1100} k={(fr - S) / 16} color="#7fd8ff" />
      <HudTag x={540} y={1610} label="70 L DE AR" value="1 PORTA" k={kf(fr, [S + 6, S + 12], [0, 1])} align="center" size={84} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 7. "Foto número duzentos e..." — gloved hand scrolls Davi's photo gallery; counter runs to #208. */
const TILE = 150;
const GAP = 8;
const SCREEN_X = 540 - 242;
const galleryY = (scroll: number, i: number) => 560 + Math.floor(i / 3) * (TILE + GAP) - scroll;
export const SGallery: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const u = kf(fr, [0, p.dur - 4], [0, 1], easeOut);
  const n = Math.round(lerp(121, 208, u));
  const scroll = lerp(40 * (TILE + GAP), 68 * (TILE + GAP), u) - 4 * (TILE + GAP);
  const first = Math.max(0, Math.floor(scroll / (TILE + GAP)) - 1);
  const hi = clamp((u - 0.85) / 0.15);
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.12]} rot={[-6, -2]} pow={1.3} whip="d">
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2b2f3e 0%, #0b0c12 75%)'}} />
      <Phone cx={540} cy={930} w={520} h={860}>
        {Array.from({length: 7 * 3}).map((_, k) => {
          const i = first * 3 + k;
          const y = galleryY(scroll, i);
          const x = SCREEN_X + (i % 3) * (TILE + GAP) + 8;
          return <Thumb key={i} x={x} y={y} s={TILE} i={i} />;
        })}
        <rect x={SCREEN_X} y={518} width={484} height={70} fill="rgba(10,10,14,0.85)" />
        <text x={SCREEN_X + 30} y={566} fontFamily="Roboto Condensed" fontWeight={700} fontSize={34} fill="#fff">
          FOTOS · {n}/312
        </text>
        {hi > 0 && <rect x={SCREEN_X + 158 + 8} y={900} width={TILE} height={TILE} fill="none" stroke="#7fd8ff" strokeWidth={8 * hi} />}
      </Phone>
      <GloveHold x={250} y={1270} s={1} />
      <HudTag x={540} y={1600} label="FOTO" value={`#${n}`} k={clamp(fr / 4)} align="center" size={100} />
      <Particles t={t} seed="gl" count={10} bokeh={4} color="200,220,255" bokehColor="120,160,255" />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 8. "...oito: terraço" — photo #208 grows out of the phone and becomes the real Monaco terrace. */
export const SMorph: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const T = ev(p, 'L11', 5);
  const m = kf(fr, [2, T], [0, 1], (x) => x * x * (3 - 2 * x));
  const t = abs(p, Math.max(fr, T)) - 0.2 * (fr < T ? 1 : 0);
  const x0 = SCREEN_X + 158 + 8;
  const y0 = 900;
  const L = lerp(x0, 0, m);
  const Tp = lerp(y0, 0, m);
  const R = lerp(W - x0 - TILE, 0, m);
  const B = lerp(H - y0 - TILE, 0, m);
  const sat = lerp(0.25, 1, clamp((fr - T + 6) / 10));
  const sc = lerp(TILE / W, 1, m);
  const cx = lerp(x0 + TILE / 2, 540, m);
  const cy = lerp(y0 + TILE / 2, 960, m);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} rot={[-2, 0]} pow={1.5}>
      <AbsoluteFill style={{transform: `scale(${1 + m * 2.5})`, transformOrigin: `${x0 + TILE / 2}px ${y0 + TILE / 2}px`, opacity: 1 - m}}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2b2f3e 0%, #0b0c12 75%)'}} />
        <Phone cx={540} cy={930} w={520} h={860}>
          {Array.from({length: 21}).map((_, k) => {
            const i = 189 + k;
            return <Thumb key={i} x={SCREEN_X + (k % 3) * (TILE + GAP) + 8} y={600 + Math.floor(k / 3) * (TILE + GAP) - 300} s={TILE} i={i} />;
          })}
        </Phone>
      </AbsoluteFill>
      <AbsoluteFill style={{clipPath: `inset(${Tp}px ${R}px ${B}px ${L}px round ${lerp(8, 0, m)}px)`}}>
        <AbsoluteFill style={{filter: `saturate(${sat}) sepia(${(1 - sat) * 0.5})`}}>
          <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${cx - (W * sc) / 2}px, ${cy - (H * sc) / 2}px) scale(${sc})`}}>
            <Terrace t={t} px={-fr * 2} horizon={900}>
              <TerraceCrowd t={t} px={-fr * 2} />
            </Terrace>
          </AbsoluteFill>
        </AbsoluteFill>
        <AbsoluteFill style={{border: `${lerp(10, 0, m)}px solid #fff`}} />
      </AbsoluteFill>
      <HudTag x={80} y={540} label="FOTO" value="#208" k={kf(fr, [4, 10], [0, 1])} size={92} />
      <Finish vignette={0.5} />
    </Rig>
  );
};
