import React from 'react';
import {AbsoluteFill, Freeze, random, spring, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {PlacedPuppet, Puppet} from '../../characters/Puppet';
import type {Outfit} from '../../characters/types';
import {H, W} from '../../lib/constants';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Flash, Rastro} from '../../fx/Rastro';
import {Particles, LightRays} from '../../fx/Particles';
import {AirMolecules} from '../../fx/AirMolecules';
import {Finish} from '../../scenes/common';
import {LinhaEmblem} from '../../ep01/partB/kit';
import {CloseUp} from '../../ep02/partC/ShotsMonaco';
import {TerraceBG, PhoneFrame} from '../../ep02/partC/sets';
import {S01Wide} from '../../ep01/partA/shotsCopa';
import {S17CanRip, S18Impact} from '../../ep01/partA/shotsTokyo';
import {SImagine, SWall} from '../../ep01/partB/shotsC';
import {lf as lf01} from '../../ep01/partB/rig';
import {f as f01} from '../../ep01/timeline';
import {IronTower, Lagoon, Palm, ParisBlock} from '../../ep02/partA/sets';
import {Sky} from '../../ep02/partA/kit';
import {BlownDebris} from '../../ep02/partB/kit';
import {BigChip, Chip, DaviPhone, Flashback, FlyingHat, Gust, HudTag, NightRoof, Rig, ShotP, Stamp, Svg, YEL, abs, appear, ev, since} from './kit';

/* ================================================================== L1 hook */

/** a01 — "O Davi se teletransporta": night rooftop, blue Rastro, Davi pops in holding the phone. */
export const A01Arrive: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const O = ev(p, 'L1', 1) - 2;
  const on = fr >= O;
  return (
    <Rig s0={1.18} s1={1.0} y0={-60} y1={20} r0={-3} r1={0} oy={1300} impacts={[{at: O, amp: 14, zoom: 0.05}]}>
      <NightRoof t={t} px={fr * 2} floor={1520} />
      {on && <DaviPhone x={540} y={1700} h={820} t={t} frame={fr} lift={kf(fr, [O + 4, O + 20], [0.15, 1], easeOut)} expr={{eyesWide: kf(fr, [O, O + 6], [0.4, 0])}} />}
      <Rastro x={540} y={1700} height={900} life={kf(fr, [O - 3, O + 22], [0.05, 0.99], (x) => x)} frame={fr} seed="a01" />
      <Flash k={kf(fr, [O, O + 1, O + 6], [0, 0.8, 0], (x) => x)} />
      <Particles t={t} seed="a01p" count={18} bokeh={6} color="170,210,255" bokehColor="110,170,255" driftX={-8} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/** a02 — "pra qualquer lugar que já viu": medium orbit, the phone comes up, its glow on his face. */
export const A02Phone: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig s0={1.0} s1={1.1} x0={70} x1={-50} r0={2} r1={-1} whipIn="right" oy={900}>
      <NightRoof t={t} px={200 + fr * 6} floor={1700} horizon={1250} />
      <DaviPhone x={560} y={2400} h={1700} t={t} frame={fr} lift={1} expr={{browTilt: -0.4, smile: -0.25}} />
      <Particles t={t} seed="a02p" count={14} bokeh={6} color="170,210,255" bokehColor="110,170,255" driftX={-12} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/** a03 — "E agora a Linha": dark red war-room flash, the Linha seal slams in. */
export const A03Linha: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const L = ev(p, 'L1', 13);
  const k = spring({frame: fr - L + 2, fps: 30, config: {damping: 10, stiffness: 220, mass: 0.6}});
  return (
    <Rig s0={1.12} s1={1.0} r0={-4} r1={-1} whipIn="zoom" impacts={[{at: L, amp: 16, zoom: 0.06}]}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #3a0c10 0%, #12040a 60%, #050105 100%)'}} />
      <Svg>
        {Array.from({length: 22}).map((_, i) => (
          <line key={i} x1={0} y1={i * 90 + ((fr * 6) % 90)} x2={W} y2={i * 90 + ((fr * 6) % 90)} stroke="#ff3b3b" strokeWidth={2} opacity={0.12} />
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={540} cy={960} r={300 + i * 110 + ((fr * 8) % 110)} fill="none" stroke="#ff3b3b" strokeWidth={3} opacity={0.25 - i * 0.06} />
        ))}
        <g transform={`translate(540,960) scale(${lerp(2.2, 1, k)}) translate(-540,-960)`} opacity={clamp(k * 1.5)}>
          <LinhaEmblem x={540} y={960} r={250} glow={1} sweep={(t * 0.8) % 1.4} />
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 1260, textAlign: 'center', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 84, letterSpacing: 14, color: '#ff4a4a', textShadow: '0 0 22px rgba(255,40,40,0.9)', opacity: appear(fr, L + 2, 5)}}>
        A LINHA
      </div>
      <Finish vignette={0.7} grain={0.14} />
    </Rig>
  );
};

/** Lia's photo (close-up, terrace behind) — the picture pinned on Davi's phone. */
const LiaPortrait: React.FC<{t: number; smile?: number}> = ({t, smile = 0.6}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.2)'}}>
      <TerraceBG t={t} horizon={900} balY={1300} />
    </AbsoluteFill>
    <CloseUp who="lia" cx={540} cy={980} k={2.3} expr={{smile, halfSmile: 0.3, lookX: -0.1, browRaise: 0.2}} facing={0.1} />
  </AbsoluteFill>
);

/** a04 — "pegou a garota": phone screen fills the frame — Lia's photo locked in a red reticle, ALVO: LIA. */
export const A04Target: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const lock = kf(fr, [1, 9], [0, 1], easeOut);
  const sz = lerp(620, 380, lock);
  return (
    <Rig s0={1.06} s1={1.16} r0={-3} r1={-1} whipIn="up" impacts={[{at: 9, amp: 10}]}>
      <AbsoluteFill style={{background: '#04060c'}} />
      <div style={{position: 'absolute', left: 90, top: 120}}>
        <PhoneFrame w={900} glow={0.7}>
          <AbsoluteFill style={{height: 2270, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 2270, transform: 'scale(1.18)', transformOrigin: '540px 900px'}}>
              <LiaPortrait t={t} />
            </div>
            <AbsoluteFill style={{background: 'rgba(120,0,0,0.18)', mixBlendMode: 'multiply'}} />
          </AbsoluteFill>
        </PhoneFrame>
      </div>
      <Svg>
        <g transform={`translate(540,${900}) rotate(${(1 - lock) * 45})`} stroke="#ff3b3b" strokeWidth={10} fill="none" opacity={0.95}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} transform={`rotate(${i * 90})`} d={`M${-sz / 2},${-sz / 2 + 90} L${-sz / 2},${-sz / 2} L${-sz / 2 + 90},${-sz / 2}`} />
          ))}
          <circle r={18} fill="#ff3b3b" />
          <line x1={-sz / 2 - 40} x2={-sz / 2 + 30} y1={0} y2={0} />
          <line x1={sz / 2 - 30} x2={sz / 2 + 40} y1={0} y2={0} />
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 540, top: 1200, transform: `translate(-50%,0) scale(${lerp(1.6, 1, lock)})`, opacity: lock, background: '#e0302c', color: '#fff', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 64, letterSpacing: 6, padding: '10px 34px', borderRadius: 14, boxShadow: '0 0 30px rgba(255,40,40,0.7)'}}>
        ALVO: LIA
      </div>
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/** a05 — "que ele gosta": tight close-up on Davi, serious, phone glow from below. */
export const A05Serious: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig s0={1.0} s1={1.12} y0={20} y1={-10} r0={1} r1={-1} whipIn="left" oy={900}>
      <AbsoluteFill style={{filter: 'blur(14px)', transform: 'scale(1.2)'}}>
        <NightRoof t={t} px={400} floor={1900} horizon={1350} />
      </AbsoluteFill>
      <CloseUp who="davi" cx={540} cy={900} k={2.6} expr={{browTilt: -0.55, smile: -0.35, lookY: 0.25, blink: kf(fr, [14, 16, 18], [0, 1, 0])}} facing={-0.05} light={{side: 1, rim: '#8fd0ff', rimStrength: 1, shadeStrength: 0.85}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 95%, rgba(150,210,255,0.35), rgba(0,0,0,0) 70%)', mixBlendMode: 'screen'}} />
      <Finish vignette={0.65} grain={0.12} />
    </Rig>
  );
};

/* ================================================================== L2 pedido */

/** a06 — "Essa continuação foi pedida pelos seguidores.": card + liked comments (EP04 PedidoInsert style). */
export const A06Pedido: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const s = spring({frame: fr - 2, fps: 30, config: {damping: 11, mass: 0.6}});
  const bob = Math.sin(fr / 6) * 6;
  const c1 = appear(fr, 9, 7);
  const c2 = appear(fr, ev(p, 'L2', 4), 7);
  const like = (at: number) => spring({frame: fr - at, fps: 30, config: {damping: 8, mass: 0.5}});
  const Bubble: React.FC<{k: number; top: number; user: string; text: string; likes: string; at: number; tilt: number}> = ({k, top, user, text, likes, at, tilt}) =>
    k <= 0 ? null : (
      <div style={{position: 'absolute', left: 110, right: 110, top: top + bob, background: '#fff', borderRadius: 26, padding: '22px 28px', boxShadow: '0 10px 28px rgba(0,0,0,0.4)', fontFamily: HUD_FONT, color: '#141a3a', transform: `scale(${k}) rotate(${tilt}deg)`, opacity: k}}>
        <div style={{fontSize: 28, fontWeight: 700, opacity: 0.6}}>{user} · comentou</div>
        <div style={{fontSize: 42, fontWeight: 700, marginTop: 6}}>{text}</div>
        <div style={{fontSize: 32, marginTop: 8, color: '#e0245e', display: 'inline-block', transform: `scale(${fr >= at ? 1 + 0.4 * (1 - like(at)) : 1})`}}>{fr >= at ? '♥' : '♡'} {likes}</div>
      </div>
    );
  return (
    <Rig s0={1.0} s1={1.06} r0={-1} r1={1}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #2b3a7a 0%, #141a3a 72%)'}} />
      <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', transform: `scale(${s})`}}>
        <span style={{display: 'inline-block', padding: '16px 34px', borderRadius: 28, background: YEL, color: '#141a3a', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 62, boxShadow: '0 10px 28px rgba(0,0,0,0.4)'}}>📩 A PEDIDO DOS SEGUIDORES</span>
      </div>
      <Bubble k={c1} top={720} user="@seguidor" text="Faz a continuação do Jump! 🔥" likes="curtido" at={16} tilt={-1.5} />
      <Bubble k={c2} top={1000} user="@outro_seguidor" text="Parte 2 com a Lia, por favor 🙏" likes="curtido" at={ev(p, 'L2', 4) + 8} tilt={1.5} />
      <PlacedDavi x={850} y={2250} height={1100} pose={{shL: -40, elL: 110, facing: -0.25}} expr={{smile: 0.8, browRaise: 0.4, lookX: -0.5, lookY: -0.3}} />
      <Finish vignette={0.4} grain={0.06} />
    </Rig>
  );
};

/* ================================================================== L3 recap (flashback) */

/** a07 — "Recapitulando:": EP01's opening wide, rewinding on tape. */
export const A07Rewind: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const src = Math.max(0, Math.round(60 - fr * 1.8));
  return (
    <Rig s0={1.04} s1={1.0} r0={-1} r1={0} whipIn="zoom">
      <Flashback rewind label="EP01 · O SALTO">
        <Freeze frame={src}>
          <S01Wide start={0} d={60} />
        </Freeze>
      </Flashback>
    </Rig>
  );
};

/** Polaroid of a place (procedural). */
const Polaroid: React.FC<{x: number; y: number; rot: number; s: number; kind: 'beach' | 'unknown'; t: number}> = ({x, y, rot, s, kind, t}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-190} width={340} height={400} rx={8} fill="#f6f1e4" />
    <rect x={-150} y={-170} width={300} height={300} fill={kind === 'beach' ? '#7fd0f5' : '#4a4f5c'} />
    {kind === 'beach' ? (
      <g>
        <circle cx={70} cy={-110} r={30} fill="#fff3b0" />
        <rect x={-150} y={-20} width={300} height={60} fill="#2f8fc9" />
        <path d={`M-150,${40 + Math.sin(t * 3) * 4} Q0,10 150,40 L150,130 L-150,130 Z`} fill="#f5d99a" />
        <path d="M-150,-20 L-110,-90 L-70,-40 L-30,-110 L10,-20 Z" fill="#3d7a5a" />
      </g>
    ) : (
      <text x={0} y={30} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={190} fill="#8a909e">
        ?
      </text>
    )}
  </g>
);

/** a08 — "ele só pula pra lugar que já viu": REGRA 1 — a seen place (✓, Rastro dives in) vs an unseen one (✗). */
export const A08Rule1: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const V = ev(p, 'L3', 8);
  const ok = appear(fr, V - 6, 6);
  const no = appear(fr, V, 6);
  return (
    <Rig s0={1.08} s1={1.0} r0={2} r1={0} whipIn="right">
      <Flashback label="REGRA DO EP01">
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #3b3a52 0%, #15141f 80%)'}} />
        <Svg>
          <Polaroid x={300} y={1000} rot={-7} s={1.05} kind="beach" t={t} />
          <Polaroid x={790} y={1030} rot={6} s={1.0} kind="unknown" t={t} />
          {ok > 0 && (
            <g transform={`translate(300,${1230}) scale(${ok})`}>
              <circle r={62} fill="#3be08a" />
              <path d="M-28,2 L-8,24 L30,-22" stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {no > 0 && (
            <g transform={`translate(790,${1260}) scale(${no})`}>
              <circle r={62} fill="#e0302c" />
              <path d="M-24,-24 L24,24 M24,-24 L-24,24" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
            </g>
          )}
        </Svg>
        <Rastro x={300} y={1130} height={330} life={kf(fr, [V - 8, V + 14], [0.05, 0.99], (x) => x)} frame={fr} seed="a08" />
      </Flashback>
      <Chip x={540} y={640} text="REGRA 1: SÓ LUGAR QUE JÁ VIU" k={appear(fr, 2, 7)} size={46} />
      <Finish vignette={0.4} grain={0.1} />
    </Rig>
  );
};

/** a09 — "E o que ele segura chega": EP01 can rip (LATA 2.900 km/h) + REGRA 2. */
export const A09Rule2: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Flashback label="EP01 · TÓQUIO">
        <S17CanRip start={0} d={p.dur} />
      </Flashback>
      <Chip x={540} y={1250} text="REGRA 2: O QUE ELE SEGURA CHEGA RÁPIDO" k={appear(fr, 2, 7)} size={38} color="#5ab8ff" />
    </AbsoluteFill>
  );
};

/** a10 — "com a velocidade antiga": the EP01 can punches through the shop wall. */
export const A10Smash: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const HIT = Math.max(4, ev(p, 'L3', 18));
  return (
    <AbsoluteFill>
      <Flashback label="EP01 · TÓQUIO">
        <S18Impact start={f01(19.38) - HIT} d={p.dur} />
      </Flashback>
      <HudTag x={90} y={560} label="LATA" value="2.900 km/h" k={appear(fr, HIT, 5)} size={92} color="#ffd23a" />
    </AbsoluteFill>
  );
};

/** a11 — "Levar alguém pra longe": EP01 'what if' — the suit gets shot sideways. */
export const A11Imagine: React.FC<ShotP> = (p) => <SImagine from={0} dur={p.dur} />;

/** a12 — "vira acidente.": the suit slams flat into the wall + ACIDENTE stamp. */
export const A12Wall: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const HIT = Math.max(3, ev(p, 'L3', 24));
  return (
    <AbsoluteFill>
      <SWall from={lf01('L15', 15) - HIT} dur={p.dur} />
      <Stamp x={540} y={1180} text="ACIDENTE" k={fr - HIT - 1} rot={-8} size={120} />
    </AbsoluteFill>
  );
};

/* ================================================================== L4 tourist */

const TOURIST_A: Outfit = {...DAVI_OUTFIT, top: {base: '#c94f5a', shade: '#8f2f3a', light: '#e57a84'}, legs: {base: '#d8cdb8', shade: '#a99d88', light: '#f0e6d4'}, shoeColor: {base: '#eee', shade: '#bbb', light: '#fff'}, head: {hair: 'buzz', hairColor: '#3a2a1e'}, skin: {base: '#e2b08c', shade: '#b07e5c', light: '#f5cfb0'}};
const TOURIST_B: Outfit = {...DAVI_OUTFIT, torso: 'dress', top: {base: '#4a7fc9', shade: '#2f5a95', light: '#7aa8e6'}, legs: {base: '#c48d66', shade: '#93603f', light: '#deae86'}, skin: {base: '#c48d66', shade: '#93603f', light: '#deae86'}, shoes: 'sneaker', head: {hair: 'curlyBun', hairColor: '#5a3a1a', lashes: true, browWidth: 12}, armW: 50, legW: 54};
const TOURIST_C: Outfit = {...DAVI_OUTFIT, top: {base: '#3c9a6a', shade: '#276b48', light: '#62c08f'}, legs: {base: '#2f3442', shade: '#1d212b', light: '#4b5263'}, head: {hair: 'bald', hairColor: '#222', beard: true}, skin: {base: '#f0c8a8', shade: '#c89c7c', light: '#ffe2cc'}};

/** a13 — "Depois do Atlântico, o Davi": re-used EP02-draft globe route (Rio → the world). */
export { A10Route as A13Route } from '../../ep02/partA/shots1';

/** a14 — "virou turista": Paris tower; Davi pops in between tourists — the gust blows a beret and a map away. */
export const A14Paris: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const O = ev(p, 'L4', 6) - 3;
  const age = fr - O;
  const blown = clamp(age / 4);
  return (
    <Rig s0={1.1} s1={1.0} x0={-40} x1={20} r0={-2} r1={1} whipIn="left" impacts={[{at: O, amp: 12}]} oy={1300}>
      <Sky stops={['#ffd7a0', '#ffc38c', '#f7e3c9', '#cfe2f5']} />
      <Svg>
        <circle cx={180} cy={900} r={110} fill="#fff1c9" opacity={0.9} />
        <g style={{filter: 'blur(3px)'}}>
          <ParisBlock y={1500} seed="pb5" tone={1} />
        </g>
        <IronTower x={560} y={1520} h={1250} color="#4c3a2c" lit="#f0c592" />
        <rect y={1500} width={W} height={500} fill="#b9a68a" />
        <rect y={1500} width={W} height={24} fill="#cdbb9e" />
      </Svg>
      <LightRays x={180} y={900} t={t} opacity={0.2} />
      <PlacedPuppet outfit={TOURIST_B} x={190} y={1950} height={980} pose={{lean: -8 * blown, shL: lerp(-10, -60, blown), elL: lerp(10, -40, blown), shR: lerp(10, 150, blown), elR: 20, facing: 0.4, headTilt: -10 * blown}} expr={{eyesWide: blown, mouthOpen: 0.5 * blown, browRaise: blown}} />
      <PlacedPuppet outfit={TOURIST_C} x={900} y={1980} height={1000} pose={{lean: 8 * blown, shR: lerp(10, 70, blown), elR: lerp(-10, 60, blown), shL: lerp(-10, -150, blown), facing: -0.4}} expr={{eyesWide: blown, mouthOpen: 0.6 * blown, browRaise: blown}} />
      {fr >= O && <PlacedDavi x={545} y={1900} height={880} pose={{shL: -30, elL: 70, shR: 40, elR: -60, facing: 0.05}} expr={{smile: 0.7, browRaise: 0.4}} />}
      <Rastro x={545} y={1900} height={940} life={kf(fr, [O - 2, O + 18], [0.05, 0.99], (x) => x)} frame={fr} seed="a14" />
      <Gust x={545} y={1450} age={age} seed="g14" />
      <Svg>{age >= 0 && <FlyingHat x={190} y={980} age={age} dir={-1} kind="beret" />}</Svg>
      <BlownDebris cx={900} cy={1200} age={age} count={10} seed="map14" color="#f4e8c8" />
      <Flash k={kf(fr, [O, O + 1, O + 5], [0, 0.6, 0], (x) => x)} />
      <HudTag x={540} y={560} label="PARIS" value="08:00" k={appear(fr, O + 2, 6)} align="center" size={96} />
      <Finish vignette={0.4} />
    </Rig>
  );
};

/** a15 — "E chegar num lugar": Maldives deck; arrival gust sends a straw hat and a drink umbrella flying. */
export const A15Maldives: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const O = 3;
  const age = fr - O;
  const blown = clamp(age / 4) * clamp(1 - (age - 14) / 12);
  return (
    <Rig s0={1.12} s1={1.02} x0={30} x1={-20} whipIn="right" impacts={[{at: O, amp: 10}]} oy={1300}>
      <Sky stops={['#1c86e0', '#5fb6f3', '#c9ecff']} h={820} />
      <Lagoon t={t} horizon={800} />
      <Svg>
        <circle cx={850} cy={260} r={70} fill="#fffbe6" />
        <Palm x={70} y={1500} s={1.3} sway={Math.sin(t * 1.5) * 4 + blown * -18} />
        <Palm x={1020} y={1460} s={1.1} flip sway={Math.sin(t * 1.3) * 4 + blown * 18} />
        {/* wooden deck */}
        <path d="M-50,1480 L1130,1480 L1200,2000 L-120,2000 Z" fill="#b07a4a" />
        {Array.from({length: 9}).map((_, i) => (
          <line key={i} x1={-50 + i * 150} y1={1480} x2={-120 + i * 170} y2={2000} stroke="#7d5230" strokeWidth={5} />
        ))}
        <rect x={-50} y={1470} width={1180} height={18} fill="#8a5a33" />
      </Svg>
      {/* sunbather on a lounger */}
      <Svg>
        <path d="M640,1720 L1010,1720 L1060,1640 L1040,1630 L990,1700 L640,1700 Z" fill="#f2f2f2" stroke="#c9c9c9" strokeWidth={4} />
        <g transform="translate(840,1690) rotate(-78) scale(0.5)">
          <Puppet outfit={TOURIST_A} pose={{shL: -150, elL: -30, shR: 160, elR: 30, facing: 0.3}} expr={{eyesWide: blown, mouthOpen: blown * 0.6, smile: 0.5 - blown}} />
        </g>
        {/* drink with umbrella on a side table */}
        <rect x={1000} y={1760} width={80} height={12} fill="#7d5230" />
        <path d="M1020,1700 L1060,1700 L1054,1760 L1026,1760 Z" fill="#ffd27a" opacity={0.9} />
        {age < 0 ? <path d="M1040,1700 L1040,1640 M1010,1650 Q1040,1610 1070,1650 Z" stroke="#e0302c" strokeWidth={5} fill="#ff6b8a" /> : (
          <g transform={`translate(${1040 + age * 18},${1640 - age * 26 + age * age * 0.7}) rotate(${age * 30})`}>
            <path d="M-30,10 Q0,-30 30,10 Z" fill="#ff6b8a" stroke="#e0302c" strokeWidth={4} />
            <line x1={0} y1={-2} x2={0} y2={50} stroke="#e0302c" strokeWidth={5} />
          </g>
        )}
        {age >= 0 && <FlyingHat x={760} y={1590} age={age} dir={1} kind="straw" s={0.9} />}
      </Svg>
      {fr >= O && <PlacedDavi x={360} y={1880} height={900} pose={{shL: -20, elL: 30, shR: 150, elR: 10, facing: 0.2}} expr={{smile: 0.8, browRaise: 0.3}} />}
      <Rastro x={360} y={1880} height={960} life={kf(fr, [O - 2, O + 18], [0.05, 0.99], (x) => x)} frame={fr} seed="a15" />
      <Gust x={360} y={1420} age={age} seed="g15" />
      <Flash k={kf(fr, [O, O + 1, O + 5], [0, 0.6, 0], (x) => x)} />
      <HudTag x={540} y={560} label="MALDIVAS" value="12:00" k={appear(fr, O + 2, 6)} align="center" size={96} />
      <Finish vignette={0.35} />
    </Rig>
  );
};

/** a16 — "empurra setenta litros de ar": diagram — his body volume shoves the air outward. AR EMPURRADO 70 L. */
export const A16Air: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const O = 2;
  const push = kf(fr, [O, O + 18], [0, 1], easeOut);
  const L = ev(p, 'L4', 13);
  return (
    <Rig s0={1.0} s1={1.1} r0={-2} r1={0} whipIn="zoom" impacts={[{at: O, amp: 10}]}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #18315e 0%, #0a1430 75%)'}} />
      <Svg>
        {Array.from({length: 13}).map((_, i) => (
          <line key={i} x1={i * 90} y1={0} x2={i * 90} y2={H} stroke="#4fb8ff" strokeWidth={1.5} opacity={0.1} />
        ))}
        {Array.from({length: 22}).map((_, i) => (
          <line key={'h' + i} x1={0} y1={i * 90} x2={W} y2={i * 90} stroke="#4fb8ff" strokeWidth={1.5} opacity={0.1} />
        ))}
        <ellipse cx={540} cy={1040} rx={190 + push * 260} ry={420 + push * 300} fill="none" stroke="#9fe6ff" strokeWidth={6} strokeDasharray="20 14" opacity={0.6 * (1 - push * 0.6)} />
      </Svg>
      <AirMolecules cx={540} cy={1040} rx={200} ry={430} spread={2.4} progress={1 - push} count={70} size={20} seed="a16" t={t} />
      <PlacedPuppet outfit={DAVI_OUTFIT} x={540} y={1460} height={830} pose={{facing: 0}} expr={{smile: 0.2}} ghost={{opacity: 1, color: '#bfe8ff', dash: 0}} />
      {fr >= O && <PlacedDavi x={540} y={1460} height={830} pose={{shL: -14, shR: 14}} expr={{smile: 0.4, browRaise: 0.3}} />}
      <Flash k={kf(fr, [O, O + 1, O + 5], [0, 0.5, 0], (x) => x)} />
      <BigChip x={540} y={640} label="AR EMPURRADO" value="70 L" k={appear(fr, L - 2, 6)} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

