import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {PlacedDavi} from '../../characters/Davi';
import {PlacedAgent} from '../../characters/Agent';
import {H, W} from '../../lib/constants';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Flash, Rastro} from '../../fx/Rastro';
import {Shockwave} from '../../fx/Shockwave';
import {Particles} from '../../fx/Particles';
import {Finish} from '../../scenes/common';
import {MicMarker, MapPin} from '../../environments/CityMap';
import {LinhaEmblem, Imagination} from '../../ep01/partB/kit';
import {Office} from '../../ep02/partA/sets';
import {PhotoThumb} from '../../ep02/partA/kit';
import {STerrace, SLiaReveal, SLiaLaugh, SDaviLaugh, SHeels} from '../../ep02/partB/shots2';
import {SGallery} from '../../ep02/partB/shots1';
import {lf as lf02} from '../../ep02/partB/rig';
import {TableScene, DAVI_SEAT, LIA_SEAT} from '../../ep02/partC/ShotsMonaco';
import {PhoneFrame, TERRACE_LIGHT} from '../../ep02/partC/sets';
import {SuitToken} from '../../ep02/partC/props';
import {BigChip, Chat, DaviPhone, Hearts, HudTag, NightRoof, PhotoCrop, Rig, ShotP, Svg, abs, appear, ev} from './kit';

/* ================================================================== L5 Monaco (EP02-draft terrace, re-timed) */

/** Re-time an EP02 partB shot so its key word lands on our word: virtual `from` = their word frame − our local frame. */
const retime = (theirLine: string, theirWord: number, local: number, dur: number) => ({from: lf02(theirLine, theirWord) - local, dur});

/** a17 — "Num terraço em Mônaco": wide dusk terrace, crowd, MÔNACO 43,7° N. */
export const A17Terrace: React.FC<ShotP> = (p) => <STerrace from={0} dur={p.dur} />;

/** a18 — "ele conheceu a Lia.": reveal at the bar — emerald dress, heels in her hand. */
export const A18Lia: React.FC<ShotP> = (p) => <SLiaReveal {...retime('L12', 2, ev(p, 'L5', 7), p.dur)} />;

/** a19 — "Ela riu do moletom.": Lia laughs, pointing at the hoodie. */
export const A19LiaLaugh: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SLiaLaugh {...retime('L12', 4, ev(p, 'L5', 9), p.dur)} />
      <Hearts t={abs(p, fr)} k={0.6} y={1250} count={6} seed="h19" />
    </AbsoluteFill>
  );
};

/** a20 — "Ele riu do salto": Davi laughs back, pointing at her heels. */
export const A20DaviLaugh: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SDaviLaugh {...retime('L12', 8, ev(p, 'L5', 13), p.dur)} />
      <Hearts t={abs(p, fr)} k={0.7} y={1250} count={7} seed="h20" />
    </AbsoluteFill>
  );
};

/** a21 — "alto na mão dela.": the gold heels swinging from her fingers; hearts. */
export const A21Heels: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SHeels from={0} dur={p.dur} />
      <Hearts t={abs(p, fr)} k={0.8} y={1300} count={8} seed="h21" />
    </AbsoluteFill>
  );
};

/* ================================================================== L6 Linha + 312 photos */

/** a22 — "Só que a Linha olhou": Linha dark room, big screen hacking Davi's phone. */
export const A22Hack: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const prog = kf(fr, [2, p.dur - 6], [0, 1], (x) => x);
  const SX = 110;
  const SY = 560;
  const SW = 860;
  const SH = 640;
  return (
    <Rig s0={1.15} s1={1.0} r0={-2} r1={0} whipIn="down" oy={900}>
      <Office sx={SX} sy={SY} sw={SW} sh={SH} glow={1}>
        <rect x={SX} y={SY} width={SW} height={SH} fill="#0a1830" />
        {Array.from({length: 18}).map((_, i) => (
          <rect key={i} x={SX + 30 + (i % 6) * 135} y={SY + 140 + Math.floor(i / 6) * 120} width={120} height={100} fill="#123058" opacity={i / 18 < prog ? 1 : 0.25} />
        ))}
        {Array.from({length: 18}).map((_, i) =>
          i / 18 < prog ? (
            <g key={'t' + i} transform={`translate(${SX + 30 + (i % 6) * 135},${SY + 140 + Math.floor(i / 6) * 120})`}>
              <PhotoThumb w={120} h={100} i={i + 7} />
            </g>
          ) : null,
        )}
        <text x={SX + 30} y={SY + 80} fontFamily={HUD_FONT} fontWeight={700} fontSize={44} fill="#ff6b6b" letterSpacing={3}>
          CELULAR: DAVI · GALERIA
        </text>
        <rect x={SX + 30} y={SY + 540} width={SW - 60} height={34} rx={17} fill="#16243d" />
        <rect x={SX + 30} y={SY + 540} width={(SW - 60) * prog} height={34} rx={17} fill="#ff4a4a" />
        <text x={SX + SW - 30} y={SY + 620} textAnchor="end" fontFamily={HUD_FONT} fontWeight={700} fontSize={40} fill="#fff">
          ACESSO {Math.round(prog * 100)}%
        </text>
      </Office>
      <Svg>
        <LinhaEmblem x={540} y={330} r={90} glow={0.8} sweep={(t * 0.7) % 1.4} />
      </Svg>
      {/* Rocha's silhouette at the desk, back to us */}
      <AbsoluteFill style={{filter: 'brightness(0.25) blur(2px)'}}>
        <PlacedAgent variant="rocha" x={780} y={2300} height={1300} upperOnly pose={{facing: 0, shL: 20, elL: 80, shR: -20, elR: -80}} expr={{}} />
      </AbsoluteFill>
      <Particles t={t} seed="a22p" count={12} bokeh={4} color="160,200,255" bokehColor="100,160,255" />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/** a23 — "as fotos do celular dele": gloved hand scrolling his gallery (EP02 draft). */
export const A23Gallery: React.FC<ShotP> = (p) => <SGallery from={0} dur={p.dur} />;

export {A32Grid as A24Grid, A34PhotoPins as A25PhotoPins, A36Suits as A26Suits} from '../../ep02/partA/shots3';

/* ================================================================== L7 the trap photo */

/** a27 — "Hoje à noite,": back on the night rooftop; the phone buzzes. */
export const A27Buzz: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const B = 4;
  return (
    <Rig s0={1.0} s1={1.1} x0={-40} x1={20} r0={-1} r1={1} whipIn="up" oy={1200}>
      <NightRoof t={t + 30} px={100 + fr * 3} floor={1560} />
      <DaviPhone x={520} y={1840} h={1000} t={t} frame={fr} buzz={fr >= B && fr % 10 < 6 ? 1 : 0} lift={kf(fr, [B, B + 10], [0.3, 1], easeOut)} expr={{eyesWide: kf(fr, [B, B + 6], [0, 0.35])}} />
      <HudTag x={90} y={560} label="HOJE" value="22:48" k={appear(fr, 2, 6)} size={92} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/** Full-bleed phone screen. */
const Screen: React.FC<{children: React.ReactNode; w?: number; x?: number; y?: number; rot?: number}> = ({children, w = 960, x = 60, y = 100, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`}}>
    <PhoneFrame w={w} glow={0.8}>
      {children}
    </PhoneFrame>
  </div>
);

/** a28 — "chegou uma foto:": notification drops, chat opens, photo un-blurs. */
export const A28Notif: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const n = spring({frame: fr - 1, fps: 30, config: {damping: 12, stiffness: 220}});
  const open = kf(fr, [10, 16], [0, 1], easeOut);
  return (
    <Rig s0={1.05} s1={1.15} r0={-3} r1={-1} whipIn="zoom" oy={900}>
      <AbsoluteFill style={{background: '#03050a'}} />
      <Screen>
        <AbsoluteFill style={{height: 2270, background: '#0b0f1a'}}>
          <AbsoluteFill style={{opacity: open}}>
            <Chat photo={1} photoBlur={kf(fr, [14, p.dur], [26, 0])} />
          </AbsoluteFill>
          <div style={{position: 'absolute', left: 50, top: lerp(-260, 120, n) + open * -400, width: 980, padding: '30px 36px', borderRadius: 40, background: 'rgba(40,46,60,0.96)', fontFamily: HUD_FONT, color: '#fff', display: 'flex', gap: 26, alignItems: 'center', opacity: 1 - open}}>
            <svg width={100} height={100}>
              <LinhaEmblem x={50} y={50} r={46} glow={0} sweep={0.5} />
            </svg>
            <div>
              <div style={{fontSize: 40, fontWeight: 700}}>Desconhecido</div>
              <div style={{fontSize: 44, opacity: 0.85}}>📷 Foto</div>
            </div>
          </div>
        </AbsoluteFill>
      </Screen>
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** Inside the photo: big crop on a point of the trap photo, framed like the phone screen edge. */
const PhotoZoom: React.FC<{fx: number; fy: number; z: number}> = ({fx, fy, z}) => (
  <AbsoluteFill>
    <PhotoCrop w={W} h={H} z={z} fx={fx} fy={fy} radius={0} />
    <AbsoluteFill style={{background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 40%)'}} />
  </AbsoluteFill>
);

/** a29 — "a Lia na mesa do terraço,": push into Lia in the photo — worried look. */
export const A29PhotoLia: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const u = kf(fr, [0, p.dur], [0, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.04} r0={2} r1={0} whipIn="down">
      <PhotoZoom fx={lerp(470, LIA_SEAT.x + 10, u)} fy={lerp(1100, 980, u)} z={lerp(1.6, 2.4, u)} />
      <Finish vignette={0.55} grain={0.14} />
    </Rig>
  );
};

/** a30 — "o Rocha do lado.": whip-pan across to Rocha in tuxedo, smiling into the camera. */
export const A30PhotoRocha: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const u = kf(fr, [0, 7], [0, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.06} r0={-1} r1={1} whipIn="right" impacts={[{at: 7, amp: 8}]}>
      <PhotoZoom fx={lerp(LIA_SEAT.x, DAVI_SEAT.x + 10, u)} fy={950} z={2.5} />
      <HudTag x={90} y={560} label="ROCHA" value="DE SMOKING" k={appear(fr, 8, 6)} size={80} color="#ff6b6b" />
      <Finish vignette={0.55} grain={0.14} />
    </Rig>
  );
};

/** a31 — "Tu já viu esse lugar.": typing dots, then the message pops under the photo. */
export const A31Message: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const MSG = Math.max(2, ev(p, 'L7', 16) + 1);
  const m = spring({frame: fr - MSG, fps: 30, config: {damping: 11, stiffness: 220, mass: 0.6}});
  return (
    <Rig s0={1.0} s1={1.08} y0={-120} y1={-160} r0={-1} r1={1} whipIn="up" impacts={[{at: MSG, amp: 8, zoom: 0.03}]} oy={1300}>
      <AbsoluteFill style={{background: '#03050a'}} />
      <Screen w={1000} x={40} y={-60}>
        <Chat photo={1} typing={fr < MSG ? fr / 30 + 1 : 0} msg={fr >= MSG ? m : 0} />
      </Screen>
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* ================================================================== L8 the mics */

/** a32 — "Se ele aparece ali,": imagined — Davi pops beside the table, the bang ring shoots out. */
export const A32WhatIf: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const O = Math.max(3, ev(p, 'L8', 2));
  const look = kf(fr, [O + 3, O + 9], [0, 1], easeOut);
  return (
    <Rig s0={1.08} s1={1.0} r0={1} r1={-1} whipIn="left" impacts={[{at: O, amp: 18, zoom: 0.05}]}>
      <TableScene
        t={340 + fr / 30}
        liaFacing={lerp(0.05, -0.5, look)}
        liaExpr={{eyesWide: look * 0.6, browRaise: look * 0.6, lookX: -look}}
        phoneOnTable={false}
        right={<PlacedAgent variant="rochaGala" x={DAVI_SEAT.x + 10} y={1580} height={800} light={TERRACE_LIGHT} pose={{facing: lerp(-0.2, -0.7, look), shL: -24, elL: 30, shR: 30, elR: -100}} expr={{smile: lerp(0.6, 0.9, look), halfSmile: 0.7, lookX: -look}} />}
      />
      {fr >= O && <PlacedDavi x={160} y={1720} height={820} light={TERRACE_LIGHT} pose={{shR: 20, elR: -20, facing: 0.4}} expr={{eyesWide: 0.3}} />}
      <Rastro x={160} y={1720} height={880} life={kf(fr, [O - 2, O + 18], [0.05, 0.99], (x) => x)} frame={fr} seed="a32" />
      <Shockwave cx={160} cy={1300} age={fr - O} rings={4} speed={60} color="255,120,120" />
      <Imagination />
      <Flash k={kf(fr, [O, O + 1, O + 5], [0, 0.8, 0], (x) => x)} />
      <div style={{position: 'absolute', left: 300, top: 1150, fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 120, color: '#ff4a4a', transform: `rotate(-10deg) scale(${appear(fr, O, 4)})`, textShadow: '0 4px 0 #000', opacity: appear(fr, O, 4)}}>
        CRACK!
      </div>
      <Finish vignette={0.6} grain={0.14} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ top-down terrace blueprint */

const SPOT: [number, number] = [330, 1060];
const MICS: [number, number][] = [
  [150, 720],
  [930, 780],
  [640, 1420],
];
const TABLES: [number, number][] = [
  [320, 880],
  [560, 820],
  [800, 960],
  [470, 1080],
  [720, 1200],
  [300, 1280],
];

const TerracePlan: React.FC<{t: number}> = ({t}) => (
  <Svg>
    <rect width={W} height={H} fill="#081226" />
    {/* sea */}
    <rect x={0} y={1500} width={W} height={H - 1500} fill="#0b2a4c" />
    {Array.from({length: 8}).map((_, i) => (
      <path key={i} d={`M0,${1560 + i * 50} q 135,${12 * Math.sin(t * 2 + i)} 270,0 t 270,0 t 270,0 t 270,0`} stroke="#2d6aa6" strokeWidth={3} fill="none" opacity={0.6} />
    ))}
    {/* terrace slab + balustrade */}
    <rect x={70} y={600} width={940} height={900} rx={18} fill="#13284a" stroke="#5fd4ff" strokeWidth={4} />
    <rect x={70} y={1478} width={940} height={22} fill="#5fd4ff" opacity={0.6} />
    {Array.from({length: 12}).map((_, i) => (
      <line key={i} x1={70 + i * 85} y1={600} x2={70 + i * 85} y2={1500} stroke="#5fd4ff" strokeWidth={1.5} opacity={0.12} />
    ))}
    {Array.from({length: 11}).map((_, i) => (
      <line key={'h' + i} x1={70} y1={600 + i * 90} x2={1010} y2={600 + i * 90} stroke="#5fd4ff" strokeWidth={1.5} opacity={0.12} />
    ))}
    {TABLES.map(([x, y], i) => (
      <g key={i}>
        {[0, 1, 2, 3].map((k) => (
          <circle key={k} cx={x + Math.cos((k * Math.PI) / 2 + 0.6) * 62} cy={y + Math.sin((k * Math.PI) / 2 + 0.6) * 62} r={16} fill="#1e3a66" stroke="#5fd4ff" strokeWidth={2} />
        ))}
        <circle cx={x} cy={y} r={42} fill="#e9f2ff" opacity={0.85} />
      </g>
    ))}
    <text x={90} y={1540} fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill="#5fd4ff" letterSpacing={4} opacity={0.8}>
      TERRAÇO · MÔNACO
    </text>
  </Svg>
);

/** Rings from each mic growing toward the spot; `k` 0..1 = how far they got. */
const MicRings: React.FC<{k: number; fr: number; done: boolean}> = ({k, fr, done}) => (
  <Svg>
    {MICS.map(([mx, my], i) => {
      const dist = Math.hypot(SPOT[0] - mx, SPOT[1] - my);
      const r = dist * easeOut(clamp(k - i * 0.04));
      return (
        <g key={i}>
          <circle cx={mx} cy={my} r={r} fill="#5fd4ff" opacity={0.07} />
          <circle cx={mx} cy={my} r={r} fill="none" stroke="#5fd4ff" strokeWidth={14} opacity={0.35} />
          <circle cx={mx} cy={my} r={r} fill="none" stroke={done ? '#ffffff' : '#9fe6ff'} strokeWidth={5} />
          <MicMarker x={mx} y={my} active={0.6 + 0.4 * Math.abs(Math.sin(fr * 0.4 + i))} scale={1.25} />
        </g>
      );
    })}
  </Svg>
);

/** Timer chip "LOCALIZAÇÃO: x s". */
const Timer: React.FC<{s: number; k: number; lock: boolean}> = ({s, k, lock}) => (
  <BigChip x={540} y={1760} label="LOCALIZAÇÃO" value={lock ? '2 s' : `${s.toFixed(1).replace('.', ',')} s`} k={k} color={lock ? '#e0302c' : '#ffd23a'} fg={lock ? '#fff' : '#141414'} />
);

/** a33 — "os microfones acham o estalo": top-down terrace map, 3 mics, rings racing to the bang. */
export const A33Mics: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = kf(fr, [2, p.dur + 14], [0, 0.85], (x) => x);
  const bang = fr % 12 < 6;
  return (
    <Rig s0={1.25} s1={1.05} r0={-6} r1={-2} whipIn="up" oy={1050}>
      <AbsoluteFill style={{transform: 'perspective(1800px) rotateX(16deg)', transformOrigin: '50% 50%'}}>
        <TerracePlan t={t} />
        <Svg>
          <circle cx={SPOT[0]} cy={SPOT[1]} r={30 + (fr % 12) * 6} fill="none" stroke="#ff4a4a" strokeWidth={5} opacity={1 - (fr % 12) / 12} />
          <circle cx={SPOT[0]} cy={SPOT[1]} r={18} fill="#ff4a4a" opacity={bang ? 1 : 0.6} />
        </Svg>
        <MicRings k={k} fr={fr} done={false} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(120,200,255,0.035) 0px, rgba(120,200,255,0.035) 2px, transparent 2px, transparent 6px)'}} />
      <Timer s={(fr / 30) * 0.95} k={appear(fr, 2, 5)} lock={false} />
      <Finish vignette={0.4} grain={0.1} />
    </Rig>
  );
};

/** a34 — "em dois segundos.": rings cross, pin slams on his spot, suits converge — LOCALIZAÇÃO: 2 s. */
export const A34Locate: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const D = Math.max(3, ev(p, 'L8', 11));
  const k = kf(fr, [0, D], [0.85, 1], easeIn);
  const pinDrop = kf(fr, [D, D + 5], [0, 1], easeOut);
  const pulse = fr > D + 5 ? ((fr - D - 5) % 16) / 16 : 0;
  const s = Math.min(2, 1.25 + (fr / Math.max(1, D)) * 0.75);
  const suits: [number, number][] = [
    [120, 1450],
    [980, 620],
    [1000, 1400],
    [110, 640],
  ];
  return (
    <Rig s0={1.05} s1={1.3} r0={-2} r1={0} ox={SPOT[0]} oy={SPOT[1]} impacts={[{at: D + 3, amp: 12, zoom: 0.06}]}>
      <AbsoluteFill style={{transform: 'perspective(1800px) rotateX(16deg)', transformOrigin: '50% 50%'}}>
        <TerracePlan t={t} />
        <MicRings k={k} fr={fr} done={fr >= D} />
        <Svg>
          <MapPin x={SPOT[0]} y={SPOT[1]} drop={pinDrop} pulse={pulse} scale={1.3} />
          {suits.map(([x, y], i) => {
            const u = kf(fr, [D + 2 + i, p.dur + 6], [0, 0.6], (v) => v);
            return u > 0 ? <SuitToken key={i} x={lerp(x, SPOT[0], u)} y={lerp(y, SPOT[1], u)} h={120} k={clamp(u * 6)} /> : null;
          })}
        </Svg>
      </AbsoluteFill>
      {fr >= D && <AbsoluteFill style={{background: `rgba(255,40,40,${0.18 * (1 - clamp((fr - D) / 10))})`, mixBlendMode: 'screen'}} />}
      <Timer s={s} k={1} lock={fr >= D} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

