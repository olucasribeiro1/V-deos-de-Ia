import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT} from '../../characters/Davi';
import type {Lighting, Pose} from '../../characters/types';
import {Bust, MOM_OUTFIT, PlacedKidDavi, PlacedMom, PlacedUncle, HeadFrame, SantaHat, UNCLE_OUTFITS, UncleVariant} from '../characters';
import {ReadTag} from '../ReadTag';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {Chip, CutFlash, Finish, Flashback, H, Rig, ShotP, Steam, Svg, SweatDrop, W, abs, clamp, easeOut, ev, kf, lerp} from './kit';

const HOME_LIGHT: Lighting = {side: -1, rim: '#ffd59a', rimStrength: 0.85, shadeStrength: 0.5};
const YARD_LIGHT: Lighting = {side: -1, rim: '#ffc27a', rimStrength: 0.9, shadeStrength: 0.5};

/* ------------------------------------------------------------------ living room (Christmas) */

const Tree: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-30} y={-90} width={60} height={90} fill="#6b4226" />
    {[0, 1, 2, 3].map((i) => {
      const w = 330 - i * 70;
      const by = -80 - i * 150;
      return <path key={i} d={`M ${-w},${by} L 0,${by - 260} L ${w},${by} Q 0,${by + 40} ${-w},${by} Z`} fill={i % 2 ? '#2f8a4a' : '#257a3e'} />;
    })}
    {/* garland lights */}
    {Array.from({length: 26}).map((_, i) => {
      const row = Math.floor(i / 7);
      const k = (i % 7) / 6;
      const w = 280 - row * 70;
      const lx = lerp(-w, w, k);
      const ly = -110 - row * 150 + Math.abs(lx) * 0.15;
      const on = Math.sin(t * 6 + i * 1.7) > -0.2;
      const c = ['#ffd23a', '#ff4d4d', '#4dc3ff', '#ff8ad8'][i % 4];
      return <circle key={i} cx={lx} cy={ly} r={14} fill={c} opacity={on ? 1 : 0.35} style={on ? {filter: `drop-shadow(0 0 8px ${c})`} : undefined} />;
    })}
    {/* star */}
    <path
      d={Array.from({length: 10})
        .map((_, k) => {
          const rr = k % 2 ? 26 : 60;
          const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
          return `${k ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)},${(-760 + Math.sin(a) * rr).toFixed(1)}`;
        })
        .join(' ') + 'Z'}
      fill="#ffd23a"
      stroke="#b88a00"
      strokeWidth={5}
      style={{filter: 'drop-shadow(0 0 16px #ffd23a)'}}
    />
    {/* presents */}
    {[
      [-200, '#d62a2a', '#ffd23a', 130],
      [-40, '#4dc3ff', '#ffffff', 100],
      [130, '#9b4dd6', '#ffd23a', 150],
    ].map(([px, c, rb, sz], i) => (
      <g key={i}>
        <rect x={(px as number) - (sz as number) / 2} y={-(sz as number)} width={sz as number} height={sz as number} rx={8} fill={c as string} />
        <rect x={(px as number) - 10} y={-(sz as number)} width={20} height={sz as number} fill={rb as string} />
        <rect x={(px as number) - (sz as number) / 2} y={-(sz as number) * 0.6} width={sz as number} height={18} fill={rb as string} />
      </g>
    ))}
  </g>
);

const LivingRoom: React.FC<{t: number; px?: number; floorY?: number}> = ({t, px = 0, floorY = 1420}) => (
  <AbsoluteFill style={{background: '#e9cfa3', overflow: 'hidden'}}>
    <Svg>
      <g transform={`translate(${px * 0.8},0)`}>
        {Array.from({length: 30}).map((_, i) => (
          <rect key={i} x={-600 + i * 90} y={0} width={44} height={floorY} fill="#e0c08e" />
        ))}
        {/* window with string lights */}
        <rect x={560} y={420} width={420} height={520} rx={12} fill="#1d2c55" stroke="#fdf3e2" strokeWidth={26} />
        <line x1={770} y1={420} x2={770} y2={940} stroke="#fdf3e2" strokeWidth={14} />
        <circle cx={880} cy={520} r={30} fill="#f4f1d8" opacity={0.9} />
        {Array.from({length: 12}).map((_, i) => (
          <circle key={i} cx={575 + i * 36} cy={430 + Math.sin(i * 0.9) * 10 + 20} r={9} fill={['#ffd23a', '#ff4d4d', '#4dc3ff'][i % 3]} opacity={Math.sin(t * 5 + i) > 0 ? 1 : 0.35} />
        ))}
        {/* picture frames */}
        <rect x={-200} y={520} width={220} height={170} fill="#8a5a36" />
        <rect x={-186} y={534} width={192} height={142} fill="#9fc6d8" />
        <rect x={80} y={560} width={150} height={190} fill="#8a5a36" />
        <rect x={92} y={572} width={126} height={166} fill="#f2c9a0" />
        <rect x={-600} y={floorY - 70} width={2400} height={70} fill="#c79c66" />
      </g>
      {/* wooden floor */}
      <rect x={-200} y={floorY} width={W + 400} height={H - floorY + 100} fill="#a7713f" />
      {Array.from({length: 10}).map((_, i) => (
        <line key={i} x1={-200} y1={floorY + Math.pow(i / 9, 1.6) * (H - floorY)} x2={W + 200} y2={floorY + Math.pow(i / 9, 1.6) * (H - floorY)} stroke="#8c5a2e" strokeWidth={4} />
      ))}
      <g transform={`translate(${px},0)`}>
        <Tree x={180} y={floorY + 30} s={0.95} t={t} />
        {/* sofa */}
        <rect x={700} y={floorY - 330} width={600} height={260} rx={50} fill="#b2473b" />
        <rect x={680} y={floorY - 160} width={640} height={170} rx={40} fill="#c95a4c" />
      </g>
    </Svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 30% 55%, rgba(255,210,120,0.25), rgba(0,0,0,0) 70%)', pointerEvents: 'none'}} />
  </AbsoluteFill>
);

/** VHS-ish rewind lines for the first frames of a flashback. */
const Rewind: React.FC<{frame: number; len?: number}> = ({frame, len = 7}) => {
  const k = 1 - clamp(frame / len);
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `rgba(255,240,210,${0.5 * k})`}} />
      <Svg>
        {Array.from({length: 10}).map((_, i) => (
          <rect key={i} x={0} y={((i * 211 + frame * 140) % H) - 20} width={W} height={10 + random(`rw${i}`) * 26} fill="#fff" opacity={0.35 * k} />
        ))}
      </Svg>
    </AbsoluteFill>
  );
};

/* 19. "Com cinco anos, sabia" — flashback: Christmas living room, kid Davi (5). */
export const SHome5: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.02]} pan={[60, 0, 0, 0]} rot={[2, 0]}>
      <LivingRoom t={t} px={-fr * 2} />
      <PlacedKidDavi age="five" x={560} y={1640} height={1000} pose={{facing: -0.3, shL: -25, elL: 30, shR: 20, headTilt: -6}} expr={{lookX: -0.8, lookY: -0.3, smile: 0.4, eyesWide: 0.25}} light={HOME_LIGHT} />
      <Flashback />
      <Rewind frame={fr} />
      <Chip x={540} y={600} text="FLASHBACK · 5 ANOS" k={kf(fr, [4, 10], [0, 1])} />
      <Finish vignette={0.55} grain={0.16} />
    </Rig>
  );
};

/* 20. "quando a mãe mentia." — mom in a Santa hat bends down smiling; kid squints. */
export const SMom: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const sq = kf(fr, [14, 20], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.1]} pan={[-30, 0, 20, 0]} whip="r">
      <LivingRoom t={t} px={-260} />
      <PlacedMom
        x={380}
        y={1720}
        height={1080}
        pose={{lean: 14, headTilt: 10, shL: -10, elL: 40, shR: 40, elR: -60, bob: Math.sin(t * 4) * 4}}
        expr={{smile: 1, browRaise: 0.6, lookX: 0.6, lookY: 0.5}}
        santaHat={{flop: Math.sin(t * 3) * 0.4}}
        light={HOME_LIGHT}
      />
      <PlacedKidDavi age="five" x={790} y={1700} height={1060} pose={{facing: -0.4, headTilt: -8 * sq, shL: -10, shR: 10}} expr={{blink: 0.55 * sq, browTilt: -0.7 * sq, browAsym: 0.7 * sq, lookX: -0.9, lookY: -0.6, smile: -0.2 * sq}} light={HOME_LIGHT} />
      <Flashback />
      <Finish vignette={0.55} grain={0.16} />
    </Rig>
  );
};

/* 21. "Papai Noel existe?" — close two-shot; mom's smile freezes, sweat drop slides. */
export const SNoel: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const Q = ev(p, 'L5', 10);
  const frozen = kf(fr, [Q, Q + 3], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} origin={[400, 850]} punches={[{at: Q, amt: 0.06}]}>
      <AbsoluteFill style={{filter: 'blur(9px)', transform: 'scale(1.15)'}}>
        <LivingRoom t={t} px={-120} />
      </AbsoluteFill>
      <Bust
        outfit={MOM_OUTFIT}
        cx={360}
        cy={850}
        r={220}
        pose={{facing: 0.35, headTilt: 8, shL: -10, shR: 10}}
        expr={{smile: 1, eyesWide: 0.55 * frozen, browRaise: 0.6 + 0.3 * frozen, lookX: 0.8, lookY: 0.6}}
        light={HOME_LIGHT}
      >
        <HeadFrame pose={{facing: 0.35, headTilt: 8}}>
          <SantaHat flop={0.3 + Math.sin(t * 3) * 0.2 * (1 - frozen)} />
        </HeadFrame>
      </Bust>
      <Bust outfit={DAVI_OUTFIT} cx={790} cy={1180} r={170} pose={{facing: -0.4, headTilt: -6}} expr={{lookX: -1, lookY: -0.8, browRaise: 0.4, mouthOpen: fr < Q + 4 ? 0.35 + 0.2 * Math.sin(fr * 1.4) : 0, eyesWide: 0.3}} light={HOME_LIGHT} />
      <Svg>{fr >= Q && <SweatDrop x={560} y={720} s={70} k={clamp((fr - Q) / 18)} />}</Svg>
      <Flashback />
      <Finish vignette={0.55} grain={0.16} />
    </Rig>
  );
};

/* 22. "Noventa e quatro por cento" — close on mom: ReadTag MENTIRA 94%, lie alarm. */
export const SLie: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const A = ev(p, 'L5', 14);
  const alarm = fr >= A ? (Math.floor((fr - A) / 3) % 2 ? 0.35 : 0) : 0;
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.16]} origin={[480, 940]} whip="d" shakes={[{at: A, dur: 12, amp: 12}]}>
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.15)'}}>
        <LivingRoom t={t} px={-60} />
      </AbsoluteFill>
      <Bust outfit={MOM_OUTFIT} cx={480} cy={940} r={300} pose={{facing: 0.15, headTilt: 4}} expr={{smile: 1, eyesWide: 0.5, browRaise: 0.9, lookX: 0.4 + Math.sin(fr * 0.8) * 0.3, lookY: 0.3}} light={HOME_LIGHT}>
        <HeadFrame pose={{facing: 0.15, headTilt: 4}}>
          <SantaHat flop={0.25} />
        </HeadFrame>
      </Bust>
      <Svg>
        <SweatDrop x={720} y={860} s={80} k={0.4 + clamp(fr / 30) * 0.5} />
      </Svg>
      <ReadTag label="MENTIRA" pct={94} x={600} y={1150} tx={650} ty={1010} from={2} scale={1.9} />
      <AbsoluteFill style={{boxShadow: `inset 0 0 0 26px rgba(255,40,40,${alarm})`, pointerEvents: 'none'}} />
      <Flashback k={0.6} />
      <Finish vignette={0.5} grain={0.14} />
    </Rig>
  );
};

/* 23. "mentira." — kid deadpan, arms crossed; mom's Santa hat droops behind. */
export const SKidFace: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const droop = kf(fr, [6, 18], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[20, 0, 0, 0]} whip="l">
      <AbsoluteFill style={{filter: 'blur(4px)', transform: 'scale(1.1)'}}>
        <LivingRoom t={t} px={-200} />
      </AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(3px)'}}>
        <Bust outfit={MOM_OUTFIT} cx={230} cy={760} r={150} pose={{facing: 0.4, headTilt: lerp(6, -8, droop)}} expr={{smile: lerp(0.6, -0.6, droop), browTilt: 0.9 * droop, lookY: 0.6}} light={HOME_LIGHT}>
          <HeadFrame pose={{facing: 0.4, headTilt: lerp(6, -8, droop)}}>
            <SantaHat droop={droop} />
          </HeadFrame>
        </Bust>
      </AbsoluteFill>
      <Bust outfit={DAVI_OUTFIT} cx={640} cy={1040} r={230} pose={{facing: -0.15, shL: 45, elL: 45, shR: -45, elR: -45}} expr={{blink: 0.5, smile: -0.15, browRaise: -0.3, lookX: -0.3}} light={HOME_LIGHT} />
      <Flashback />
      <Finish vignette={0.55} grain={0.16} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ truco */

type Suit = 'paus' | 'copas' | 'espadas' | 'ouros';
const SUIT_PATH: Record<Suit, string> = {
  copas: 'M0,14 C -34,-10 -20,-38 0,-20 C 20,-38 34,-10 0,14 Z',
  ouros: 'M0,-26 L18,0 L0,26 L-18,0 Z',
  espadas: 'M0,-26 C 20,-8 32,6 16,16 C 8,20 3,15 2,12 L7,26 L-7,26 L-2,12 C -3,15 -8,20 -16,16 C -32,6 -20,-8 0,-26 Z',
  paus: 'M0,-26 A11,11 0 1 1 0.1,-26 Z M-14,-2 A11,11 0 1 1 -13.9,-2 Z M14,-2 A11,11 0 1 1 14.1,-2 Z M-3,4 L-8,26 L8,26 L3,4 Z',
};
const SuitIcon: React.FC<{suit: Suit; x: number; y: number; s: number}> = ({suit, x, y, s}) =>
  suit === 'paus' ? (
    <g transform={`translate(${x},${y}) scale(${s})`} fill="#1b1b1b">
      <circle cx={0} cy={-14} r={12} />
      <circle cx={-13} cy={4} r={12} />
      <circle cx={13} cy={4} r={12} />
      <path d="M-3,4 L-9,26 L9,26 L3,4 Z" />
    </g>
  ) : (
    <path d={SUIT_PATH[suit]} transform={`translate(${x},${y}) scale(${s})`} fill={suit === 'copas' || suit === 'ouros' ? '#d62a2a' : '#1b1b1b'} />
  );

/** Playing card centred at (x, y), w px wide. */
const Card: React.FC<{x: number; y: number; w: number; rank: string; suit: Suit; rot?: number; glow?: number; back?: boolean}> = ({x, y, w, rank, suit, rot = 0, glow = 0, back}) => {
  const h = w * 1.4;
  const red = suit === 'copas' || suit === 'ouros';
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      {glow > 0 && <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={w * 0.12} fill="#ffd23a" opacity={0.55 * glow} style={{filter: 'blur(10px)'}} />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.08} fill={back ? '#2a4fa0' : '#fbf8f0'} stroke={glow > 0 ? '#ffd23a' : '#9a958a'} strokeWidth={glow > 0 ? 6 : 3} />
      {back ? (
        <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} rx={w * 0.05} fill="none" stroke="#fff" strokeWidth={4} opacity={0.7} />
      ) : (
        <>
          <text x={-w / 2 + w * 0.1} y={-h / 2 + w * 0.3} fontFamily={CAPTION_FONT} fontWeight={700} fontSize={w * 0.26} fill={red ? '#d62a2a' : '#1b1b1b'}>
            {rank}
          </text>
          <SuitIcon suit={suit} x={-w / 2 + w * 0.18} y={-h / 2 + w * 0.48} s={w / 260} />
          <SuitIcon suit={suit} x={0} y={w * 0.08} s={w / 75} />
        </>
      )}
    </g>
  );
};

const MANILHAS: {rank: string; suit: Suit}[] = [
  {rank: '4', suit: 'paus'},
  {rank: '7', suit: 'copas'},
  {rank: 'A', suit: 'espadas'},
  {rank: '7', suit: 'ouros'},
];

/** Kitchen-table truco scene: uncles around, kid Davi (10) at the back. `rage` 0..1 makes uncles throw arms up. */
const TrucoTable: React.FC<{t: number; rage: number; kidPose?: Pose; kidExpr?: object}> = ({t, rage, kidPose, kidExpr}) => {
  const uncles: {v: UncleVariant; x: number; y: number; h: number; flip?: boolean}[] = [
    {v: 'tioZe', x: 150, y: 1560, h: 980},
    {v: 'tioBeto', x: 930, y: 1560, h: 1000, flip: true},
  ];
  const ragePose = (i: number): Pose => ({shL: lerp(-10, -160, rage), elL: lerp(20, -20, rage), shR: lerp(10, 160, rage), elR: lerp(-20, 20, rage), bob: -rage * Math.abs(Math.sin(t * 18 + i)) * 20, headTilt: rage * Math.sin(t * 14 + i) * 6});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#e6d3ae, #d9bf8f)', overflow: 'hidden'}}>
      <Svg>
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={i * 90} y={0} width={44} height={1200} fill="#dcc497" />
        ))}
        <rect x={380} y={420} width={320} height={240} fill="#5a8fc4" stroke="#fff" strokeWidth={18} />
        <rect x={-50} y={1150} width={1200} height={800} fill="#a7713f" />
        {/* hanging lamp */}
        <line x1={540} y1={0} x2={540} y2={330} stroke="#333" strokeWidth={6} />
        <path d="M 440,400 Q 540,300 640,400 Z" fill="#2f6f5a" />
        <ellipse cx={540} cy={400} rx={100} ry={18} fill="#fff6c8" />
      </Svg>
      <PlacedUncle variant="tioNando" x={540 - 230} y={1230} height={720} pose={ragePose(2)} expr={{browTilt: -rage, mouthOpen: rage * 0.8, smile: -0.4 * rage, lookX: 0.6}} light={HOME_LIGHT} blur={1} />
      <PlacedKidDavi age="ten" x={640} y={1260} height={1000} pose={kidPose} expr={kidExpr} light={HOME_LIGHT} />
      <Svg>
        {/* table */}
        <path d="M 40,1200 L 1040,1200 L 1160,1500 L -80,1500 Z" fill="#2f7a4f" />
        <path d="M -80,1500 L 1160,1500 L 1160,1540 L -80,1540 Z" fill="#7a4a24" />
        {Array.from({length: 3}).map((_, i) => (
          <Card key={i} x={300 + i * 30} y={1330} w={90} rank="" suit="paus" rot={-60 + i * 10} back />
        ))}
        <ellipse cx={820} cy={1290} rx={70} ry={24} fill="#d6d0c0" />
        <rect x={790} y={1210} width={60} height={80} rx={8} fill="#f1c045" opacity={0.85} />
      </Svg>
      {uncles.map((u, i) => (
        <PlacedUncle key={u.v} variant={u.v} x={u.x} y={u.y} height={u.h} flip={u.flip} pose={ragePose(i)} expr={{browTilt: -0.6 - 0.4 * rage, mouthOpen: rage * 0.9, smile: -0.3 - 0.5 * rage, lookX: u.flip ? -0.6 : 0.6}} light={HOME_LIGHT} />
      ))}
    </AbsoluteFill>
  );
};

/* 24. "Com dez, ganhava todo" — kid Davi (10) fans 4 glowing manilhas. */
export const STruco: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const fan = kf(fr, [4, 14], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} pan={[0, -20, 0, 0]} whip="u">
      <TrucoTable t={t} rage={0} kidPose={{shL: 20, elL: 80, shR: -20, elR: -80}} kidExpr={{halfSmile: 1, browAsym: 0.6, lookX: 0.3, lookY: 0.4}} />
      <Svg>
        {MANILHAS.map((c, i) => {
          const a = lerp(0, (i - 1.5) * 16, fan);
          const sp = random(`mn${i}`) * 6;
          return (
            <g key={i} transform={`rotate(${a} 640 1500)`}>
              <Card x={640} y={1160} w={190} rank={c.rank} suit={c.suit} glow={kf(fr, [8 + i * 3, 12 + i * 3], [0, 1])} />
              {fr > 10 + i * 3 && (
                <path
                  d="M0,-22 L5,-5 L22,0 L5,5 L0,22 L-5,5 L-22,0 L-5,-5 Z"
                  transform={`translate(${700 + sp * 6},${960 + sp * 4}) scale(${0.8 + 0.4 * Math.sin(fr * 0.5 + i)})`}
                  fill="#fff6c8"
                />
              )}
            </g>
          );
        })}
      </Svg>
      <Chip x={300} y={620} text="10 ANOS" k={kf(fr, [2, 8], [0, 1])} />
      <Flashback k={0.5} />
      <Finish vignette={0.5} grain={0.14} />
    </Rig>
  );
};

/* 25. "truco da família." — kid slaps the cards; "TRUCO!"; the uncles throw their cards up in rage. */
export const SSlap: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const S = 1;
  const rage = kf(fr, [S + 4, S + 9], [0, 1], easeOut);
  const word = fr - S;
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.12]} shakes={[{at: S, dur: 12, amp: 26}]} punches={[{at: S, amt: 0.08}]}>
      <TrucoTable t={t} rage={rage} kidPose={{shL: 40, elL: 60, shR: -40, elR: -60, bob: fr < S + 3 ? 10 : 0}} kidExpr={{smile: 0.8, mouthOpen: 0.5, browRaise: 0.6}} />
      <Svg>
        {MANILHAS.map((c, i) => (
          <Card key={i} x={480 + i * 120} y={1380} w={150} rank={c.rank} suit={c.suit} rot={(i - 1.5) * 8} glow={0.5} />
        ))}
        {/* flying cards */}
        {Array.from({length: 14}).map((_, i) => {
          const age = fr - S - 5 - random(`fc${i}`) * 4;
          if (age < 0) return null;
          const ox = i % 2 ? 960 : 150;
          const vx = (i % 2 ? -1 : 1) * (4 + random(`fcx${i}`) * 14);
          const vy = -(28 + random(`fcy${i}`) * 18);
          const x = ox + vx * age;
          const y = 900 + vy * age + 1.3 * age * age;
          return <Card key={i} x={x} y={y} w={90} rank="" suit="paus" rot={age * (20 + i * 3)} back={i % 3 !== 0} />;
        })}
      </Svg>
      {word >= 0 && word < 30 && (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 720,
            transform: `translate(-50%,-50%) rotate(-8deg) scale(${word < 4 ? lerp(2.2, 1, easeOut(word / 4)) : 1})`,
            fontFamily: CAPTION_FONT,
            fontWeight: 700,
            fontSize: 170,
            color: '#ffd23a',
            WebkitTextStroke: '8px #141414',
            paintOrder: 'stroke fill',
            textShadow: '0 10px 0 #141414',
          }}
        >
          TRUCO!
        </div>
      )}
      <CutFlash at={S} frames={4} peak={0.6} />
      <Flashback k={0.5} />
      <Finish vignette={0.5} grain={0.14} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ churrasco */

const Grill: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-200} y={-260} width={400} height={260} fill="#9b4a32" />
    {Array.from({length: 5}).map((_, i) => (
      <rect key={i} x={-200 + (i % 2) * 40} y={-260 + i * 52} width={i % 2 ? 360 : 400} height={4} fill="#6e3020" />
    ))}
    <rect x={-230} y={-300} width={460} height={50} fill="#3a3a3a" />
    {Array.from({length: 4}).map((_, i) => (
      <g key={i}>
        <line x1={-180 + i * 110} y1={-305} x2={-110 + i * 110} y2={-305} stroke="#bbb" strokeWidth={6} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={-178 + i * 110 + k * 22} y={-322} width={18} height={30} rx={6} fill={['#8a3a1c', '#b5542a', '#e2d0a0'][(i + k) % 3]} />
        ))}
      </g>
    ))}
    <Steam x={0} y={-330} t={t} k={1} spread={300} color="#e8e8e8" seed="grill" n={10} />
  </g>
);

/* 26. "Nunca mais chamaram ele pro churrasco." — barbecue; pan to the gate: PROIBIDO DAVI, kid outside. */
export const SChurras: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const C = ev(p, 'L6', 12);
  const pan = kf(fr, [6, C], [0, 1]);
  const px = lerp(0, -1050, pan);
  const sign = kf(fr, [C, C + 5], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.1]} shakes={[{at: C, dur: 10, amp: 10}]}>
      <AbsoluteFill style={{background: 'linear-gradient(#ff9e6a 0%, #ffd29a 45%, #f4e2c0 60%)'}} />
      <Svg>
        <g transform={`translate(${px * 0.4},0)`}>
          {Array.from({length: 7}).map((_, i) => (
            <rect key={i} x={-200 + i * 330} y={520 + (i % 3) * 60} width={300} height={700} fill={['#e7b48a', '#d99b74', '#f0c9a0'][i % 3]} />
          ))}
        </g>
        <g transform={`translate(${px},0)`}>
          {/* back wall */}
          <rect x={-300} y={900} width={1500} height={400} fill="#c96f4a" />
          {Array.from({length: 40}).map((_, i) => (
            <rect key={i} x={-300 + (i % 10) * 150 + (Math.floor(i / 10) % 2) * 75} y={900 + Math.floor(i / 10) * 100} width={146} height={96} fill="#b9603e" />
          ))}
          {/* string of flags */}
          <path d="M -200,700 Q 400,820 1100,700" stroke="#555" strokeWidth={4} fill="none" />
          {Array.from({length: 14}).map((_, i) => {
            const x = -180 + i * 92;
            const y = 700 + Math.sin((i / 13) * Math.PI) * 100;
            return <path key={i} d={`M${x},${y} l 50,0 l -25,56 Z`} fill={['#ffd23a', '#2f9a55', '#d62a2a', '#3c72c4'][i % 4]} />;
          })}
          <rect x={-300} y={1300} width={2400} height={700} fill="#8f8a7c" />
          <Grill x={340} y={1420} t={t} />
          {/* gate */}
          <g transform="translate(1300,0)">
            <rect x={-40} y={700} width={60} height={760} fill="#3a3a3a" />
            <rect x={540} y={700} width={60} height={760} fill="#3a3a3a" />
            {Array.from({length: 12}).map((_, i) => (
              <rect key={i} x={20 + i * 44} y={780} width={14} height={650} fill="#4a4a4a" />
            ))}
            <rect x={20} y={780} width={520} height={20} fill="#4a4a4a" />
            <rect x={20} y={1110} width={520} height={20} fill="#4a4a4a" />
          </g>
        </g>
      </Svg>
      <PlacedUncle variant="tioZe" x={150 + px} y={1640} height={900} pose={{shR: 120, elR: -30, bob: Math.sin(t * 10) * 6, ...{}}} expr={{smile: 0.9, mouthOpen: 0.4, lookX: 0.5}} light={YARD_LIGHT} />
      <PlacedUncle variant="tioBeto" x={600 + px} y={1660} height={920} flip pose={{shL: -40, elL: 100, bob: Math.abs(Math.sin(t * 12)) * -8}} expr={{smile: 1, mouthOpen: 0.6, lookX: -0.5}} light={YARD_LIGHT} />
      <PlacedUncle variant="tioNando" x={900 + px} y={1600} height={860} pose={{shR: 30, elR: -110, headTilt: Math.sin(t * 9) * 5}} expr={{smile: 0.8, lookX: -0.4}} light={YARD_LIGHT} />
      {/* kid outside the gate (behind bars) */}
      <PlacedKidDavi age="ten" x={1300 + 290 + px} y={1560} height={1000} pose={{facing: -0.3, shL: -20, shR: 20, headTilt: -8}} expr={{browTilt: 0.9, smile: -0.5, lookX: -1}} light={YARD_LIGHT} />
      <Svg>
        <g transform={`translate(${px + 1300},0)`}>
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x={20 + i * 44} y={780} width={14} height={650} fill="#4a4a4a" opacity={0.92} />
          ))}
          {/* sign */}
          <g transform={`translate(290,${640 + (1 - sign) * -40}) rotate(${lerp(-12, 3, sign) + Math.sin(fr * 0.5) * 2 * sign})`}>
            <line x1={-150} y1={-150} x2={-150} y2={-40} stroke="#555" strokeWidth={6} />
            <line x1={150} y1={-150} x2={150} y2={-40} stroke="#555" strokeWidth={6} />
            <rect x={-250} y={-50} width={500} height={250} rx={18} fill="#fffdf6" stroke="#d62a2a" strokeWidth={16} />
            <text x={0} y={40} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={84} fill="#d62a2a" letterSpacing={4}>
              PROIBIDO
            </text>
            <text x={0} y={150} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={96} fill="#1b1b1b" letterSpacing={6}>
              DAVI
            </text>
            {sign > 0.5 && (
              <g transform="translate(200,140)" opacity={clamp((sign - 0.5) * 2)}>
                <circle r={40} fill="none" stroke="#d62a2a" strokeWidth={10} />
                <line x1={-28} y1={28} x2={28} y2={-28} stroke="#d62a2a" strokeWidth={10} />
              </g>
            )}
          </g>
        </g>
      </Svg>
      <Flashback k={0.45} />
      <Finish vignette={0.5} grain={0.14} />
    </Rig>
  );
};

export {W, H, HUD_FONT, UNCLE_OUTFITS};
