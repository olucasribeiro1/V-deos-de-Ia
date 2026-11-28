import React from 'react';
import {AbsoluteFill, random, spring} from 'remotion';
import {Rig, Svg, useShot} from './kit';
import {ChairBack, DinnerTable, MAP_PINS, MARBLE_LIGHT, MirrorRoom, MonacoMap, RestroomWall, TERRACE_LIGHT, TerraceBG} from './sets';
import {crackLines, SuitToken} from './props';
import {PlacedDavi, DAVI_OUTFIT} from '../../characters/Davi';
import {PlacedLia, LIA_OUTFIT} from '../../characters/Lia';
import {PlacedAgent, AGENT_OUTFITS} from '../../characters/Agent';
import {FaceCloseup} from '../../characters/Closeups';
import type {Expression, Lighting} from '../../characters/types';
import {Flash, Rastro} from '../../fx/Rastro';
import {Shockwave} from '../../fx/Shockwave';
import {Particles} from '../../fx/Particles';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp, wobble} from '../../lib/anim';

const T0 = 300;
const ROCHA = AGENT_OUTFITS.rochaGala;

/** Hoodie shoulders under a big close-up head (cx, cy = head centre, k = head scale). */
const Shoulders: React.FC<{cx: number; cy: number; k: number; tone: {base: string; shade: string; light: string}; tux?: boolean}> = ({cx, cy, k, tone, tux}) => {
  const y = cy + 118 * k;
  return (
    <g>
      <rect x={cx - 40 * k} y={cy + 70 * k} width={80 * k} height={70 * k} rx={20 * k} fill={tux ? '#a8704f' : DAVI_OUTFIT.skin.shade} />
      <path d={`M${cx - 260 * k},${H + 200} Q${cx - 250 * k},${y + 40 * k} ${cx - 90 * k},${y} Q${cx},${y + 30 * k} ${cx + 90 * k},${y} Q${cx + 250 * k},${y + 40 * k} ${cx + 260 * k},${H + 200} Z`} fill={tone.base} />
      {tux ? (
        <g>
          <path d={`M${cx - 50 * k},${y} L${cx + 50 * k},${y} L${cx},${y + 160 * k} Z`} fill="#eef0f3" />
          <path d={`M${cx - 26 * k},${y + 14 * k} L${cx},${y + 26 * k} L${cx + 26 * k},${y + 14 * k} L${cx + 26 * k},${y + 40 * k} L${cx},${y + 28 * k} L${cx - 26 * k},${y + 40 * k} Z`} fill="#0b0b0e" />
          <path d={`M${cx - 54 * k},${y - 2} L${cx - 8 * k},${y + 170 * k} L${cx - 70 * k},${y + 90 * k} Z`} fill="#26272d" />
          <path d={`M${cx + 54 * k},${y - 2} L${cx + 8 * k},${y + 170 * k} L${cx + 70 * k},${y + 90 * k} Z`} fill="#26272d" />
        </g>
      ) : (
        <g>
          <path d={`M${cx - 110 * k},${y + 6 * k} Q${cx},${y + 80 * k} ${cx + 110 * k},${y + 6 * k}`} stroke={tone.shade} strokeWidth={26 * k} fill="none" strokeLinecap="round" />
          <path d={`M${cx - 30 * k},${y + 50 * k} L${cx - 36 * k},${y + 150 * k}`} stroke="#f3ead8" strokeWidth={8 * k} strokeLinecap="round" />
          <path d={`M${cx + 30 * k},${y + 50 * k} L${cx + 34 * k},${y + 140 * k}`} stroke="#f3ead8" strokeWidth={8 * k} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** Big close-up of a character (head + shoulders). */
export const CloseUp: React.FC<{who: 'davi' | 'rocha' | 'lia'; cx: number; cy: number; k: number; expr: Expression; facing?: number; light?: Lighting}> = ({who, cx, cy, k, expr, facing = 0, light}) => {
  const o = who === 'davi' ? DAVI_OUTFIT : who === 'lia' ? LIA_OUTFIT : ROCHA;
  return (
    <Svg>
      {who === 'lia' ? (
        <g>
          <rect x={cx - 34 * k} y={cy + 70 * k} width={68 * k} height={80 * k} rx={20 * k} fill={o.skin.shade} />
          <path d={`M${cx - 250 * k},${H + 200} Q${cx - 240 * k},${cy + 150 * k} ${cx - 80 * k},${cy + 135 * k} Q${cx},${cy + 150 * k} ${cx + 80 * k},${cy + 135 * k} Q${cx + 240 * k},${cy + 150 * k} ${cx + 250 * k},${H + 200} Z`} fill={o.skin.base} />
          <path d={`M${cx - 230 * k},${H + 200} L${cx - 200 * k},${cy + 260 * k} Q${cx},${cy + 330 * k} ${cx + 200 * k},${cy + 260 * k} L${cx + 230 * k},${H + 200} Z`} fill={o.top.base} />
          <path d={`M${cx - 200 * k},${cy + 260 * k} Q${cx},${cy + 330 * k} ${cx + 200 * k},${cy + 260 * k}`} stroke={o.top.light} strokeWidth={8 * k} fill="none" />
        </g>
      ) : (
        <Shoulders cx={cx} cy={cy} k={k} tone={o.top} tux={who === 'rocha'} />
      )}
      <FaceCloseup cx={cx} cy={cy} k={k} skin={o.skin} style={o.head} expr={expr} facing={facing} light={light} />
    </Svg>
  );
};

/** Warm dreamy grade for imagined shots: wraps the scene (desaturate + sepia) and adds a white haze edge. */
const Dream: React.FC<{children: React.ReactNode}> = ({children}) => (
  <>
    <AbsoluteFill style={{filter: 'grayscale(0.7) sepia(0.3) brightness(1.05)'}}>{children}</AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0) 50%, rgba(235,240,255,0.8) 100%)', pointerEvents: 'none'}} />
  </>
);

/* ------------------------------------------------------------------ table layout (terrace) */
export const TABLE = {x: 540, y: 1200, s: 1.25};
export const LIA_SEAT = {x: 385, y: 1545};
export const DAVI_SEAT = {x: 700, y: 1545};
export const SIT_H = 760;

/** The terrace table: Lia seated left, the right chair (Davi's) empty unless `right` is given. */
export const TableScene: React.FC<{t: number; px?: number; liaExpr?: Expression; liaFacing?: number; right?: React.ReactNode; phoneOnTable?: boolean; liaArm?: number}> = ({
  t,
  px = 0,
  liaExpr = {},
  liaFacing = 0.35,
  right,
  phoneOnTable = true,
  liaArm = 0,
}) => (
  <AbsoluteFill>
    <TerraceBG t={t} horizon={640} balY={930} px={px} />
    <ChairBack x={LIA_SEAT.x} y={1330} s={1.05} />
    <ChairBack x={DAVI_SEAT.x} y={1330} s={1.05} />
    <PlacedLia
      x={LIA_SEAT.x}
      y={LIA_SEAT.y}
      height={SIT_H}
      light={TERRACE_LIGHT}
      pose={{facing: liaFacing, shR: lerp(18, 40, liaArm), elR: lerp(-70, -95, liaArm), shL: -16, elL: 60, headTilt: 3 + Math.sin(t * 1.3) * 2, bob: Math.sin(t * 2) * 4}}
      expr={{blink: (t * 30) % 110 < 4 ? 1 : 0, ...liaExpr}}
    />
    {right}
    <DinnerTable x={TABLE.x} y={TABLE.y} s={TABLE.s} t={t} phone={phoneOnTable} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ L17 */

/** c01 — "Ele podia pular até a": Davi close at the marble sink, Rocha blurred behind; eyes slide to the door. */
export const DaviMirror: React.FC = () => {
  const {frame, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.1} x0={20} x1={-20} r0={-1.5} r1={1} whipIn="zoom" oy={1000}>
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.15)'}}>
        <RestroomWall t={t + T0} mirror={<MirrorRoom />} />
        <PlacedAgent variant="rochaGala" x={880} y={2100} height={1500} light={MARBLE_LIGHT} pose={{facing: -0.4, shL: -10, shR: 8}} expr={{smile: 0.3}} />
      </AbsoluteFill>
      <CloseUp who="davi" cx={470} cy={1000} k={3.9} facing={0.15} light={MARBLE_LIGHT} expr={{lookX: kf(frame, [6, 16], [0, -0.9]), lookY: 0.1, browTilt: kf(frame, [6, 16], [0, -0.4]), blink: kf(frame, [3, 5, 7], [0, 1, 0])}} />
      <Particles t={t} seed="c01" count={16} bokeh={8} driftX={-8} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** c02 — "mesa, pegar a mão dela": IMAGINED — Rastro pops beside Lia's table, Davi reaches for her hand. */
export const ImagineTable: React.FC = () => {
  const {frame, t} = useShot();
  const IN = 3;
  const reach = kf(frame, [12, 26], [0, 1], easeOut);
  const here = frame >= IN;
  return (
    <Rig s0={1.08} s1={1.2} x0={-30} x1={30} r0={2} r1={-1} impacts={[{at: IN, amp: 14, zoom: 0.04}]} oy={1150}>
      <Dream>
      <TableScene
        t={t + T0 + 3}
        px={frame * 2}
        liaExpr={{eyesWide: kf(frame, [IN, IN + 4, 18], [0, 0.6, 0.1]), smile: kf(frame, [10, 24], [0, 0.9]), browRaise: kf(frame, [IN, IN + 4], [0, 0.8])}}
        liaArm={reach}
        right={
          here ? (
            <PlacedDavi x={DAVI_SEAT.x + 10} y={1560} height={980} light={TERRACE_LIGHT} pose={{facing: -0.45, shL: lerp(-8, -62, reach), elL: lerp(6, 10, reach), shR: 8, bob: kf(frame, [IN, IN + 4], [-30, 0])}} expr={{halfSmile: 0.8, smile: reach * 0.4, lookX: -0.8}} />
          ) : null
        }
      />
      </Dream>
      <Rastro x={DAVI_SEAT.x + 10} y={1560} height={1000} life={(frame - IN + 1) / 22} frame={frame} seed="c02r" />
      <Flash k={kf(frame, [IN, IN + 1, IN + 5], [0, 0.6, 0], (x) => x)} />
      <Finish vignette={0.3} grain={0.12} />
    </Rig>
  );
};

/** Clasping hands detail (screen px). */
const Hands: React.FC<{k: number; t: number}> = ({k, t}) => {
  const dx = lerp(220, 40, k);
  return (
    <Svg>
      {/* Davi's sleeve + hand from the right */}
      <g transform={`translate(${540 + dx},${980}) rotate(-12)`}>
        <path d="M 60,-110 L 900,-150 L 900,170 L 70,120 Z" fill={DAVI_OUTFIT.top.base} />
        <path d="M 60,-110 L 140,-114 L 150,124 L 70,120 Z" fill={DAVI_OUTFIT.top.shade} />
        <ellipse cx={-30} cy={0} rx={130} ry={100} fill={DAVI_OUTFIT.skin.base} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-190 - i * 6} y={-80 + i * 46} width={130} height={46} rx={23} fill={i % 2 ? DAVI_OUTFIT.skin.light : DAVI_OUTFIT.skin.base} stroke={DAVI_OUTFIT.skin.shade} strokeWidth={4} />
        ))}
        <rect x={-110} y={-120} width={110} height={50} rx={25} fill={DAVI_OUTFIT.skin.base} stroke={DAVI_OUTFIT.skin.shade} strokeWidth={4} transform="rotate(-25 -55 -95)" />
      </g>
      {/* Lia's hand from the left, gold bracelet */}
      <g transform={`translate(${540 - dx},${1040 + Math.sin(t * 2) * 4}) rotate(8)`}>
        <path d="M -60,-70 L -900,-40 L -900,140 L -60,80 Z" fill={LIA_OUTFIT.skin.base} />
        <rect x={-150} y={-74} width={40} height={156} rx={14} fill="#e2b04a" />
        <ellipse cx={20} cy={0} rx={110} ry={80} fill={LIA_OUTFIT.skin.base} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={70} y={-64 + i * 36} width={120 - i * 8} height={34} rx={17} fill={LIA_OUTFIT.skin.light} stroke={LIA_OUTFIT.skin.shade} strokeWidth={4} />
        ))}
      </g>
    </Svg>
  );
};

/** c03 — "e sumir.": IMAGINED close on the hands clasping -> Rastro swallows both; the dream cracks. */
export const ImagineVanish: React.FC = () => {
  const {frame, t, dur} = useShot();
  const GO = 14;
  const gone = frame >= GO;
  const crack = kf(frame, [dur - 9, dur - 2], [0, 1], easeOut);
  const lines = crackLines(560, 1000, 14, 900, 'c03');
  return (
    <Rig s0={1.0} s1={1.12} r0={-2} r1={2} impacts={[{at: GO, amp: 22, zoom: 0.06}]} whipIn="down">
      <Dream>
      <AbsoluteFill style={{background: '#fbf8f3'}}>
        <Svg>
          <rect x={0} y={0} width={W} height={H} fill="#e7dccb" />
          <rect x={0} y={0} width={W} height={520} fill="#1d1d4a" />
          {Array.from({length: 9}).map((_, i) => (
            <circle key={'b' + i} cx={60 + i * 120} cy={200 + Math.sin(i * 1.7) * 80} r={40} fill="#ffcf85" opacity={0.45} />
          ))}
          <rect x={0} y={500} width={W} height={40} fill="#c9bfae" />
          {Array.from({length: 9}).map((_, i) => (
            <line key={i} x1={i * 140} y1={0} x2={i * 140 - 300} y2={H} stroke="#e2dcd2" strokeWidth={3} />
          ))}
          <ellipse cx={240} cy={700} rx={180} ry={60} fill="#ffffff" stroke="#d8d2c8" strokeWidth={6} />
          <circle cx={850} cy={1450} r={90} fill="#ffb862" opacity={0.25} />
        </Svg>
      </AbsoluteFill>
      {!gone && <Hands k={kf(frame, [0, GO - 1], [0, 1], easeOut)} t={t} />}
      </Dream>
      <Rastro x={560} y={1260} height={600} life={(frame - GO + 1) / 22} frame={frame} seed="c03r" />
      <Flash k={kf(frame, [GO, GO + 1, GO + 6], [0, 0.85, 0], (x) => x)} />
      {crack > 0 && (
        <Svg>
          {lines.map((pts, i) => (
            <path key={i} d={'M' + pts.slice(0, 1 + Math.ceil(crack * (pts.length - 1))).map((p) => p.join(',')).join('L')} stroke="#ffffff" strokeWidth={6} fill="none" style={{filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.6))'}} />
          ))}
        </Svg>
      )}
      <Finish vignette={0.35} grain={0.12} />
    </Rig>
  );
};

/** c04 — "que perto, todo lugar que ele já viu": Monaco map, red pins rain. */
export const MonacoMapShot: React.FC = () => {
  const {frame, t, fps} = useShot();
  return (
    <Rig s0={1.3} s1={1.05} r0={-6} r1={-2} whipIn="up">
      <MonacoMap t={t} />
      <Svg>
        {MAP_PINS.map(([x, y], i) => {
          const at = 4 + i * 2.4;
          const d = clamp((frame - at) / 5);
          if (d <= 0) return null;
          const yOff = (1 - easeIn(d)) * -160;
          const pulse = frame > at + 5 ? ((frame - at - 5) / 18) % 1 : 0;
          return (
            <g key={i}>
              {pulse > 0 && <ellipse cx={x} cy={y} rx={pulse * 70} ry={pulse * 30} fill="none" stroke="#ff3b3b" strokeWidth={4 * (1 - pulse)} opacity={1 - pulse} />}
              <ellipse cx={x} cy={y} rx={14} ry={6} fill="#000" opacity={0.35 * d} />
              <g transform={`translate(${x},${y + yOff}) scale(1.1)`}>
                <path d="M0,0 C-6,-18 -26,-34 -26,-52 A26,26 0 1 1 26,-52 C26,-34 6,-18 0,0 Z" fill="#ff3b3b" stroke="#fff" strokeWidth={4} />
                <circle cx={0} cy={-52} r={10} fill="#fff" />
              </g>
            </g>
          );
        })}
      </Svg>
      <div style={{position: 'absolute', right: 70, top: 1220, fontFamily: HUD_FONT, color: '#fff', textAlign: 'right', textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>
        <div style={{fontSize: 24, letterSpacing: 4, fontWeight: 700}}>LUGARES QUE ELE JÁ VIU</div>
        <div style={{fontSize: 90, fontWeight: 700, color: '#ff6b5e'}}>{Math.min(MAP_PINS.length, Math.max(0, Math.floor((frame - 4) / 2.4) + 1))}</div>
      </div>
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/** c05 — "a Linha também viu.": pull back, every pin becomes a black suit. */
export const MapAgents: React.FC = () => {
  const {frame, t} = useShot();
  return (
    <Rig s0={1.05} s1={0.92} r0={-2} r1={1} whipIn="zoom" impacts={[{at: 4, amp: 10}]}>
      <MonacoMap t={t + 2} />
      <Svg>
        {MAP_PINS.map(([x, y], i) => {
          const at = 1 + (i % 6) * 1.5;
          const k = spring({frame: frame - at, fps: 30, config: {damping: 9, stiffness: 240, mass: 0.5}});
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={40} fill="#ff3b3b" opacity={0.25 + 0.15 * Math.sin(t * 6 + i)} />
              {frame < at ? (
                <g transform={`translate(${x},${y})`}>
                  <path d="M0,0 C-6,-18 -26,-34 -26,-52 A26,26 0 1 1 26,-52 C26,-34 6,-18 0,0 Z" fill="#ff3b3b" stroke="#fff" strokeWidth={4} />
                </g>
              ) : (
                <SuitToken x={x} y={y} h={88} k={k} />
              )}
            </g>
          );
        })}
      </Svg>
      <AbsoluteFill style={{background: 'rgba(120,0,0,0.12)', mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', left: 0, width: W, top: 1180, textAlign: 'center', fontFamily: HUD_FONT, fontWeight: 700, color: '#fff', fontSize: 56, letterSpacing: 8, textShadow: '0 0 20px rgba(255,40,40,0.9), 0 3px 8px rgba(0,0,0,0.8)', opacity: kf(frame, [8, 14], [0, 1])}}>
        A LINHA VIU
      </div>
      <Finish vignette={0.6} grain={0.1} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ L21 */

/** Rocha's reflection inside the mirror (upper body, big). */
const RochaReflection: React.FC<{smile: number; t: number; dx?: number}> = ({smile, t, dx = 0}) => (
  <AbsoluteFill>
    <MirrorRoom />
    <PlacedAgent variant="rochaGala" x={600 + dx} y={2260} height={1900} light={MARBLE_LIGHT} pose={{facing: -0.15, shL: -10, shR: 8, headTilt: -2 + Math.sin(t) * 1}} expr={{smile, halfSmile: smile * 0.6, browTilt: -0.2}} />
  </AbsoluteFill>
);

/** c19 — "O Rocha sorriu.": mirror close, Rocha's reflection smiles. */
export const RochaSmile: React.FC = () => {
  const {frame, t} = useShot();
  const sm = kf(frame, [8, 30], [0, 1]);
  return (
    <Rig s0={1.25} s1={1.45} x0={0} x1={-20} y0={60} y1={140} r0={1} r1={-1} whipIn="left" oy={700}>
      <RestroomWall t={t + T0 + 20} mirror={<RochaReflection smile={sm} t={t} />} />
      <Particles t={t} seed="c19" count={14} bokeh={6} driftX={-6} />
      <Finish vignette={0.55} tint="rgba(255,220,170,0.25)" />
    </Rig>
  );
};

/** c20 — "O Davi pulou sozinho.": extreme close deciding, eyes close, Rastro swallows him. */
export const DaviDecide: React.FC = () => {
  const {frame, t} = useShot();
  const GO = 19; // "sozinho" ~ +0.63 s
  const gone = frame >= GO;
  return (
    <Rig s0={1.1} s1={1.32} r0={2} r1={-1} impacts={[{at: GO, amp: 30, dur: 14, zoom: 0.08}]} oy={980}>
      <AbsoluteFill style={{filter: 'blur(14px)', transform: 'scale(1.2)'}}>
        <RestroomWall t={t + T0} mirror={<MirrorRoom />} />
      </AbsoluteFill>
      {!gone && (
        <CloseUp
          who="davi"
          cx={540}
          cy={980}
          k={5.2}
          facing={-0.05}
          light={MARBLE_LIGHT}
          expr={{browTilt: kf(frame, [0, 10], [0, -0.7]), lookX: kf(frame, [0, 8], [0.6, 0]), blink: kf(frame, [10, 15], [0, 1]), smile: -0.2}}
        />
      )}
      <Rastro x={540} y={1900} height={1500} life={(frame - GO + 1) / 20} frame={frame} seed="c20r" />
      <Flash k={kf(frame, [GO, GO + 1, GO + 6], [0, 1, 0], (x) => x)} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/** Mirror crack overlay (spiderweb) on the restroom mirror, impact at (cx, cy). */
const MirrorCrack: React.FC<{cx: number; cy: number; k: number; seed: string}> = ({cx, cy, k, seed}) => {
  if (k <= 0) return null;
  const rays = crackLines(cx, cy, 16, 700, seed);
  const rings = [90, 200, 340];
  return (
    <Svg>
      <g style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.9))'}}>
        {rays.map((pts, i) => (
          <path key={i} d={'M' + pts.slice(0, 1 + Math.ceil(k * (pts.length - 1))).map((p) => p.join(',')).join('L')} stroke="#ffffff" strokeWidth={4} fill="none" strokeLinejoin="round" />
        ))}
        {rings.map((r, j) =>
          k > 0.3 + j * 0.2 ? (
            <path
              key={j}
              d={'M' + rays.map((_, i) => {
                const a = (i / rays.length) * Math.PI * 2;
                const rr = r * (0.8 + random(`${seed}-rr${i}-${j}`) * 0.4);
                return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
              }).join('L') + 'Z'}
              stroke="#ffffff"
              strokeWidth={3}
              fill="none"
              opacity={0.85}
            />
          ) : null,
        )}
        <circle cx={cx} cy={cy} r={30 * k} fill="#ffffff" opacity={0.6} />
      </g>
    </Svg>
  );
};

/** c21 — "O estalo rachou": restroom wide; shockwave from the empty spot; the mirror bursts. */
export const Estalo: React.FC = () => {
  const {frame, t} = useShot();
  const CRACK = 12;
  const papers = Array.from({length: 14}).map((_, i) => {
    const r = (k: string) => random(`c21-${i}-${k}`);
    const age = frame;
    const a = r('a') * Math.PI * 2;
    const v = 10 + r('v') * 26;
    return {x: 540 + Math.cos(a) * v * age, y: 1300 + Math.sin(a) * v * age * 0.6 + age * age * 0.4, rot: age * (r('r') - 0.5) * 40, s: 30 + r('s') * 30};
  });
  return (
    <Rig s0={1.0} s1={1.05} impacts={[{at: 0, amp: 36, dur: 18, zoom: 0.08}, {at: CRACK, amp: 18, dur: 10}]}>
      <RestroomWall
        t={t + T0 + 25}
        mirror={
          <AbsoluteFill>
            <MirrorRoom />
            <PlacedAgent variant="rochaGala" x={830} y={2000} height={1350} light={MARBLE_LIGHT} pose={{facing: -0.3, shL: -16, shR: 10}} expr={{smile: 0.6, halfSmile: 0.5}} />
          </AbsoluteFill>
        }
      />
      <MirrorCrack cx={520} cy={760} k={kf(frame, [CRACK, CRACK + 5], [0, 1], easeOut)} seed="c21c" />
      <Shockwave cx={540} cy={1100} age={frame} rings={5} speed={40} gap={4} maxR={1800} />
      <Rastro x={540} y={1700} height={1100} life={(frame + 6) / 24} frame={frame} seed="c21r" />
      <Svg>
        {papers.map((p, i) => (
          <rect key={i} x={p.x - p.s / 2} y={p.y - p.s * 0.35} width={p.s} height={p.s * 0.7} fill="#fffaf0" stroke="#e6dccb" strokeWidth={2} transform={`rotate(${p.rot} ${p.x} ${p.y})`} />
        ))}
      </Svg>
      <Flash k={kf(frame, [0, 1, 6, CRACK, CRACK + 1, CRACK + 4], [0.8, 0.9, 0, 0, 0.4, 0], (x) => x)} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** c22 — "o espelho do banheiro.": slow-mo shards, Rocha reflected in pieces. */
export const Shards: React.FC = () => {
  const {frame, t} = useShot();
  const C = {x: 540, y: 820};
  const N = 10;
  const rings = [0, 260, 620, 1400];
  const ang = Array.from({length: N + 1}).map((_, i) => (i / N) * Math.PI * 2 + (random(`sh-a${i % N}`) - 0.5) * 0.35);
  const slow = frame / 30;
  const shards: {poly: string; dx: number; dy: number; rot: number; zoom: number; key: string}[] = [];
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < N; i++) {
      const a0 = ang[i];
      const a1 = i === N - 1 ? ang[0] + Math.PI * 2 : ang[i + 1];
      const r0 = rings[r] * (0.9 + random(`sh-r${r}-${i}`) * 0.2);
      const r1 = rings[r + 1] * (0.9 + random(`sh-R${r}-${i}`) * 0.2);
      const pts = [
        [C.x + Math.cos(a0) * r0, C.y + Math.sin(a0) * r0],
        [C.x + Math.cos(a0) * r1, C.y + Math.sin(a0) * r1],
        [C.x + Math.cos(a1) * r1, C.y + Math.sin(a1) * r1],
        [C.x + Math.cos(a1) * r0, C.y + Math.sin(a1) * r0],
      ];
      const am = (a0 + a1) / 2;
      const fall = r === 0 ? 0 : (r * 14 + random(`sh-f${r}-${i}`) * 20) * slow;
      shards.push({
        key: `${r}-${i}`,
        poly: pts.map(([x, y]) => `${x}px ${y}px`).join(','),
        dx: Math.cos(am) * fall + (random(`sh-x${r}-${i}`) - 0.5) * 30,
        dy: Math.sin(am) * fall + fall * slow * 0.6 + (random(`sh-y${r}-${i}`) - 0.5) * 30,
        rot: (random(`sh-o${r}-${i}`) - 0.5) * (6 + slow * 10),
        zoom: 1 + (random(`sh-z${r}-${i}`) - 0.5) * 0.12,
      });
    }
  }
  return (
    <Rig s0={1.05} s1={1.2} r0={-2} r1={1} whipIn="zoom" oy={820} ease={(x) => x}>
      <AbsoluteFill style={{background: '#2a2622'}} />
      {shards.map((s) => (
        <AbsoluteFill key={s.key} style={{clipPath: `polygon(${s.poly})`, transform: `translate(${s.dx}px, ${s.dy}px) rotate(${s.rot}deg) scale(${s.zoom})`, transformOrigin: `${C.x}px ${C.y}px`}}>
          <RochaReflection smile={1} t={t} dx={(random(`sh-d${s.key}`) - 0.5) * 50} />
          <AbsoluteFill style={{background: `linear-gradient(${random(`sh-g${s.key}`) * 360}deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 60%)`}} />
        </AbsoluteFill>
      ))}
      <Svg>
        {shards.map((s) => (
          <polygon key={s.key} points={s.poly.replace(/px/g, '')} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.9} transform={`translate(${s.dx} ${s.dy}) rotate(${s.rot} ${C.x} ${C.y})`} />
        ))}
      </Svg>
      <Particles t={t} seed="c22" count={30} bokeh={4} driftX={-4} />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ L22–L23 */

/** c23 — "Quando o Rocha voltou": Rocha strides out of the restroom door onto the terrace, tugging a glove. */
export const RochaWalk: React.FC = () => {
  const {frame, t, p} = useShot();
  const ph = t * 7;
  const sw = Math.sin(ph) * 22;
  const h = lerp(1150, 1500, easeOut(p));
  return (
    <Rig s0={1.0} s1={1.08} x0={30} x1={-30} whipIn="right">
      <TerraceBG t={t + T0 + 30} horizon={700} balY={1000} px={-frame * 3} />
      {/* building wall with the restroom door on the left */}
      <Svg>
        <rect x={-40} y={0} width={420} height={1600} fill="#efe3cf" />
        <rect x={-40} y={0} width={420} height={1600} fill="#3a2414" opacity={0.25} />
        <rect x={60} y={560} width={240} height={760} rx={8} fill="#5a3b26" />
        <rect x={80} y={580} width={200} height={720} rx={6} fill="#ffe7b8" opacity={0.85} />
        <circle cx={180} cy={520} r={26} fill="#c9962e" />
        <text x={180} y={530} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={22} fill="#3a2414">
          WC
        </text>
        <ellipse cx={180} cy={480} rx={160} ry={70} fill="#ffcf85" opacity={0.25} />
      </Svg>
      <PlacedAgent
        variant="rochaGala"
        x={lerp(260, 560, easeOut(p))}
        y={lerp(1560, 1800, easeOut(p)) + Math.abs(Math.cos(ph)) * -10}
        height={h}
        light={TERRACE_LIGHT}
        pose={{hipL: sw, hipR: -sw, knL: Math.max(0, -sw) * 0.8, knR: Math.max(0, sw) * 0.8, shR: 10 - sw * 0.6, shL: 40, elL: 80 + Math.sin(t * 9) * 8, facing: 0.1}}
        expr={{smile: 0.35, halfSmile: 0.6}}
      />
      <Particles t={t} seed="c23" count={22} bokeh={9} driftX={-10} />
      <Finish vignette={0.5} tint="rgba(255,190,120,0.2)" />
    </Rig>
  );
};

/** c24 — "pro salão, a Lia": wide terrace, string lights, push toward the lone table. */
export const TerraceWide: React.FC = () => {
  const {frame, t, p} = useShot();
  const far = [
    {x: 160, y: 1180, s: 0.55},
    {x: 930, y: 1150, s: 0.5},
    {x: 120, y: 1560, s: 0.85},
    {x: 980, y: 1600, s: 0.9},
  ];
  return (
    <Rig s0={1.0} s1={1.18} y0={0} y1={-40} r0={-1} r1={1} whipIn="down" oy={1180} ease={(x) => 1 - Math.pow(1 - x, 2)}>
      <TerraceBG t={t + T0 + 32} horizon={640} balY={960} px={frame * 2} />
      {far.map((f, i) => (
        <React.Fragment key={i}>
          {[-1, 1].map((sd) => (
            <svg key={sd} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'blur(3px)'}}>
              <g transform={`translate(${f.x + sd * 150 * f.s},${f.y + 250 * f.s}) scale(${f.s * 2.6})`} fill="#1a1420">
                <circle cx={0} cy={-158} r={17} />
                <rect x={-20} y={-140} width={40} height={90} rx={14} />
              </g>
            </svg>
          ))}
          <DinnerTable x={f.x} y={f.y} s={f.s} t={t + i} plates={2} candle />
        </React.Fragment>
      ))}
      {/* Lia's table, mid-distance */}
      <ChairBack x={480} y={1210} s={0.55} />
      <ChairBack x={600} y={1210} s={0.55} />
      <PlacedLia x={480} y={1360} height={400} light={TERRACE_LIGHT} pose={{facing: 0.4, shR: 18, elR: -70}} expr={{lookX: 0.6}} />
      <DinnerTable x={540} y={1240} s={0.58} t={t} phone />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** c25 — "ainda tava na mesa.": Lia alone with two plates, glancing at the empty chair. */
export const LiaAlone: React.FC = () => {
  const {frame, t} = useShot();
  return (
    <Rig s0={1.22} s1={1.32} x0={120} x1={80} y0={0} y1={-20} r0={1} r1={-1} whipIn="left" ox={540} oy={1100}>
      <TableScene t={t + T0 + 34} px={frame * 1.5} liaExpr={{lookX: kf(frame, [0, 14, 26], [0.9, 0.9, 0.2]), lookY: 0.2, smile: 0.05, browTilt: 0.35}} />
      <Particles t={t} seed="c25" count={22} bokeh={9} driftX={-8} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** c26 — "sentou na cadeira do Davi": Rocha drops into the right chair; Lia's face falls. */
export const RochaSits: React.FC = () => {
  const {frame, t} = useShot();
  const sit = kf(frame, [0, 12], [0, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.1} x0={-30} x1={10} impacts={[{at: 11, amp: 12}]} whipIn="right" oy={1100}>
      <TableScene
        t={t + T0 + 36}
        px={-frame}
        liaFacing={0.45}
        liaExpr={{lookX: 0.8, eyesWide: kf(frame, [8, 14], [0, 0.45]), browRaise: kf(frame, [8, 14], [0, 0.5]), smile: kf(frame, [0, 14], [0.2, -0.3])}}
        right={
          <PlacedAgent
            variant="rochaGala"
            x={DAVI_SEAT.x}
            y={lerp(1380, 1580, sit)}
            height={lerp(1050, 800, sit)}
            light={TERRACE_LIGHT}
            pose={{facing: -0.5, shL: -24, elL: 30, shR: 12, lean: lerp(-8, 0, sit)}}
            expr={{smile: 0.5, halfSmile: 0.6}}
          />
        }
      />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** Black gloved hand, fingers forward (screen units), pointing left; (x, y) = knuckles. */
export const GloveHand: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 120,-90 L 900,-140 L 900,160 L 120,110 Z" fill="#15161b" />
    <rect x={110} y={-104} width={60} height={226} rx={12} fill="#e6e8ee" />
    <path d="M 120,-80 Q 60,-100 -10,-80 L -10,90 Q 60,110 120,100 Z" fill="#17171b" stroke="#000" strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-150 + i * 6} y={-74 + i * 40} width={170} height={38} rx={19} fill={i % 2 ? '#24252b' : '#1c1d22'} stroke="#000" strokeWidth={4} />
    ))}
    <path d="M 40,-82 Q -20,-140 -90,-120" stroke="#1c1d22" strokeWidth={44} strokeLinecap="round" fill="none" />
    <path d="M 100,-60 L -120,-50" stroke="#5c616e" strokeWidth={4} opacity={0.6} />
  </g>
);

/** c27 — "pegou o celular dela.": glove slides Lia's phone off the tablecloth. */
export const GlovePhone: React.FC = () => {
  const {frame, t} = useShot();
  const reach = kf(frame, [0, 12], [0, 1], easeOut);
  const pull = kf(frame, [16, 34], [0, 1], easeIn);
  const hx = lerp(1250, 560, reach) + pull * 700;
  const phx = 520 + pull * 700;
  const fl = 0.85 + 0.15 * Math.sin(t * 13);
  return (
    <Rig s0={1.12} s1={1.0} r0={-4} r1={-1} whipIn="up" oy={980}>
      <AbsoluteFill style={{background: '#f6f2ea'}}>
        <Svg>
          <defs>
            <radialGradient id="c27g" cx={300} cy={600} r={900} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.55} />
              <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H} fill="#f4efe6" />
          {Array.from({length: 7}).map((_, i) => (
            <path key={i} d={`M${-100 + i * 200},0 Q${i * 200},${H / 2} ${-60 + i * 200},${H}`} stroke="#e6dfd2" strokeWidth={4} fill="none" />
          ))}
          <rect x={0} y={0} width={W} height={H} fill="url(#c27g)" />
          {/* plate */}
          <ellipse cx={330} cy={560} rx={300} ry={200} fill="#fff" stroke="#ddd5c8" strokeWidth={8} />
          <ellipse cx={330} cy={560} rx={190} ry={125} fill="#f1ede6" />
          <ellipse cx={300} cy={540} rx={90} ry={50} fill="#c8803e" />
          {/* glass base + candle glow */}
          <circle cx={880} cy={480} r={70} fill="#fff" opacity={0.4} stroke="#fff" strokeWidth={4} />
          <circle cx={200} cy={1500} r={200} fill="#ffb862" opacity={0.18 * fl} />
          {/* phone */}
          <g transform={`translate(${phx},${1100}) rotate(${-10 + pull * 14})`}>
            <rect x={-150} y={-290} width={300} height={580} rx={44} fill="#e4b8a6" />
            <rect x={-136} y={-276} width={272} height={552} rx={36} fill="#0e0f14" />
            <rect x={-120} y={-200} width={240} height={90} rx={20} fill="#1d2433" opacity={0.9} />
            <text x={0} y={-140} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={54} fill="#fff">
              22:47
            </text>
            <circle cx={-60} cy={-250} r={10} fill="#222" />
          </g>
        </Svg>
      </AbsoluteFill>
      <Svg>
        <GloveHand x={hx} y={1080} s={1.15} rot={-6} />
      </Svg>
      <Finish vignette={0.5} />
    </Rig>
  );
};
