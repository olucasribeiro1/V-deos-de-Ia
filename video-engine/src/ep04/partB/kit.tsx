import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {Puppet, PuppetProps} from '../../characters/Puppet';
import type {Lighting, Outfit, Pose} from '../../characters/types';
import {DAVI_OUTFIT, Pup, Svg} from '../../ep02qi/partB/kit';
import {fieldAt} from '../FieldMeter';

export {DAVI_OUTFIT, Pup, Svg, fieldAt};
export {Chip, run, Sweat, SeatedDavi, headOf, Finger} from '../../ep02qi/partB/kit';
export {Stamp, HudTag, EnergyLines, Stars, Smear} from '../../ep02qi/partA/kit';
export {CutFlash} from '../../ep01/partA/kit';
export {Finish} from '../../scenes/common';
export {SoundWord, Confetti, BigHand, VibeTicks, Trem} from '../../ep03/partB/kit';
export {clamp, easeOut, kf, lerp};

/* ------------------------------------------------------------------ lights / cast */
export const DINER_LIGHT: Lighting = {side: -1, rim: '#ff6fcf', rimStrength: 0.85, shadeStrength: 0.62};
export const STREET_LIGHT: Lighting = {side: 1, rim: '#8fd0ff', rimStrength: 0.85, shadeStrength: 0.72};

/** The robber: charcoal hoodie (hood up, drawn by <Hood/>), black domino mask, dark trousers. */
export const ROBBER: Outfit = {
  skin: {base: '#d9a27c', shade: '#a8714f', light: '#f0c09c'},
  torso: 'hoodie',
  top: {base: '#454955', shade: '#2b2e37', light: '#646a7a'},
  legs: {base: '#2b2d35', shade: '#17181d', light: '#474a55'},
  shoes: 'sneaker',
  shoeColor: {base: '#d6d6d6', shade: '#9a9a9a', light: '#ffffff'},
  gloves: false,
  head: {hair: 'buzz', hairColor: '#2a1d16'},
};

/** Head centre of a puppet in local units (lean rotates around the hip; bob translates). */
const headLocal = (lean = 0, bob = 0): [number, number] => {
  const a = (lean * Math.PI) / 180;
  const dy = -884 + 480;
  return [-Math.sin(a) * dy, -480 + Math.cos(a) * dy + bob];
};

/** Hood (frame around the face) + black domino mask, in puppet-local units. */
export const Hood: React.FC<{lean?: number; bob?: number; facing?: number}> = ({lean = 0, bob = 0, facing = 0}) => {
  const [hx, hy] = headLocal(lean, bob);
  const fx = facing * 30;
  return (
    <g transform={`translate(${hx},${hy}) rotate(${lean})`}>
      <path
        fillRule="evenodd"
        d={`M-150,40 Q-168,-120 -40,-168 Q20,-186 90,-150 Q166,-100 150,40 Q140,120 96,150 L-96,150 Q-140,120 -150,40 Z M${fx - 98},6 Q${fx - 96},-112 ${fx},-114 Q${fx + 96},-112 ${fx + 98},6 Q${fx + 92},118 ${fx},124 Q${fx - 92},118 ${fx - 98},6 Z`}
        fill={ROBBER.top.base}
        stroke={ROBBER.top.shade}
        strokeWidth={6}
      />
      <path d={`M${fx - 98},6 Q${fx - 96},-112 ${fx},-114 Q${fx + 96},-112 ${fx + 98},6`} stroke={ROBBER.top.shade} strokeWidth={14} fill="none" />
      <path d="M-120,-60 Q-110,-140 -30,-160" stroke={ROBBER.top.light} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
      {/* domino mask */}
      <path
        fillRule="evenodd"
        d={`M${fx - 92},-22 Q${fx},-40 ${fx + 92},-22 L${fx + 88},16 Q${fx},4 ${fx - 88},16 Z M${fx - 41 - 22},-4 a22,16 0 1,0 44,0 a22,16 0 1,0 -44,0 Z M${fx + 41 - 22},-4 a22,16 0 1,0 44,0 a22,16 0 1,0 -44,0 Z`}
        fill="#121216"
      />
    </g>
  );
};

/** Robber placed with feet at (x,y). Bat in the right hand if `bat` is given (absolute direction deg, 0 = down). */
export const Robber: React.FC<Omit<PuppetProps, 'outfit'> & {x: number; y: number; height: number; flip?: boolean; rot?: number; bat?: number; batGlint?: number; children?: React.ReactNode}> = ({
  bat,
  batGlint = 0,
  children,
  pose = {},
  ...rest
}) => (
  <Pup
    outfit={ROBBER}
    pose={pose}
    handProps={bat === undefined ? undefined : {R: <BatG dir={bat} glint={batGlint} />}}
    {...rest}
  >
    <Hood lean={pose.lean} bob={pose.bob} facing={pose.facing} />
    {children}
  </Pup>
);

/* ------------------------------------------------------------------ aluminum bat */
/** Aluminum bat, grip at (0,0), extending `len` units in direction dir (0 = down, + toward screen-right). */
export const BatG: React.FC<{dir?: number; glint?: number; s?: number; x?: number; y?: number; xray?: number}> = ({dir = 0, glint = 0, s = 1, x = 0, y = 0, xray = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${-dir}) scale(${s})`}>
    <defs>
      <linearGradient id="alBatG" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#6c7582" />
        <stop offset="0.3" stopColor="#f6f9fc" />
        <stop offset="0.55" stopColor="#c4ccd6" />
        <stop offset="1" stopColor="#5d6672" />
      </linearGradient>
    </defs>
    <g opacity={1 - xray * 0.75}>
      <ellipse cx={0} cy={-34} rx={26} ry={12} fill="#2b2b30" />
      <path d="M-15,-30 L15,-30 L16,170 Q34,250 36,330 L36,440 Q36,470 0,472 Q-36,470 -36,440 L-36,330 Q-34,250 -16,170 Z" fill="url(#alBatG)" stroke="#4a525e" strokeWidth={4} />
      <rect x={-17} y={-30} width={34} height={120} rx={8} fill="#1f1f24" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={-17} y1={-20 + i * 28} x2={17} y2={-6 + i * 28} stroke="#3a3a44" strokeWidth={5} />
      ))}
      <path d="M-6,180 Q-14,260 -18,340 L-18,440" stroke="#fff" strokeWidth={8} fill="none" opacity={0.8} strokeLinecap="round" />
      <text x={0} y={370} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={26} fill="#3a4250" transform="rotate(-90 0 370)">
        Al
      </text>
    </g>
    {glint > 0.01 && (
      <g transform={`translate(-14,${300}) rotate(${dir})`} opacity={glint}>
        <path d="M0,-70 L10,-10 L70,0 L10,10 L0,70 L-10,10 L-70,0 L-10,-10 Z" fill="#fff" style={{filter: 'drop-shadow(0 0 12px #fff)'}} />
      </g>
    )}
  </g>
);

/* ------------------------------------------------------------------ diner (interior) */
const Checker: React.FC<{y0: number; vpY: number; dark?: string; light?: string; shift?: number}> = ({y0, vpY, dark = '#1d1a22', light = '#e9e2d2', shift = 0}) => {
  const K = (y0 - vpY) * 4;
  const quads: React.ReactNode[] = [];
  const Y = (z: number) => vpY + K / z;
  const X = (x: number, z: number) => 540 + (x * K) / z;
  for (let j = 0; j < 10; j++) {
    const z0 = 4 - j * 0.32;
    const z1 = z0 - 0.32;
    if (z1 <= 1.2) break;
    for (let i = -16; i < 16; i++) {
      const x0 = i * 0.25 + shift;
      const x1 = x0 + 0.25;
      const c = (i + j) % 2 === 0 ? dark : light;
      quads.push(<polygon key={`${i}_${j}`} points={`${X(x0, z0)},${Y(z0)} ${X(x1, z0)},${Y(z0)} ${X(x1, z1)},${Y(z1)} ${X(x0, z1)},${Y(z1)}`} fill={c} />);
    }
  }
  return <g>{quads}</g>;
};

/** Napkin holder (chrome) standing on a surface at (x,y) (bottom-centre), scale s. dent 0..1 crushed. */
export const NapkinHolder: React.FC<{x: number; y: number; s?: number; dent?: number; rot?: number}> = ({x, y, s = 1, dent = 0, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-60} y={-90 + dent * 30} width={120} height={90 - dent * 30} fill="#f7f4ee" stroke="#c9c2b4" strokeWidth={3} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-54} y1={-80 + i * 22 + dent * 30} x2={54} y2={-80 + i * 22 + dent * 30} stroke="#ddd6c8" strokeWidth={3} />
    ))}
    <path d={`M-72,0 L-72,${-70 + dent * 24} Q-72,${-80 + dent * 30} -62,${-80 + dent * 30} L-62,0 Z`} fill="#c7ced8" stroke="#6d7684" strokeWidth={3} />
    <path d={`M72,0 L72,${-70 + dent * 24} Q72,${-80 + dent * 30} 62,${-80 + dent * 30} L62,0 Z`} fill="#aab3bf" stroke="#6d7684" strokeWidth={3} />
    <rect x={-80} y={-8} width={160} height={14} rx={4} fill="#b7c0cb" stroke="#6d7684" strokeWidth={3} />
  </g>
);

/** Red plastic basket of fries at (x,y) (bottom-centre). */
export const Fries: React.FC<{x: number; y: number; s?: number; n?: number}> = ({x, y, s = 1, n = 9}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {Array.from({length: n}).map((_, i) => {
      const fx = -48 + (i / (n - 1)) * 96;
      const h = 70 + random(`fr${i}`) * 50;
      const r = (random(`frr${i}`) - 0.5) * 30;
      return <rect key={i} x={fx - 8} y={-40 - h} width={16} height={h} rx={4} fill="#f6c443" stroke="#c98b1c" strokeWidth={3} transform={`rotate(${r} ${fx} -40)`} />;
    })}
    <path d="M-80,-60 L80,-60 L64,0 L-64,0 Z" fill="#e0352b" stroke="#8d1912" strokeWidth={4} />
    {[-40, 0, 40].map((dx) => (
      <line key={dx} x1={dx} y1={-56} x2={dx * 0.8} y2={-4} stroke="#ff7a6a" strokeWidth={4} opacity={0.6} />
    ))}
  </g>
);

/** Card machine (handheld POS) centred at (x,y), scale s. text on its screen; err 0..1 red. */
export const CardMachine: React.FC<{x: number; y: number; s?: number; text: string; sub?: string; err?: number; rot?: number}> = ({x, y, s = 1, text, sub, err = 0, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-120} y={-200} width={240} height={400} rx={34} fill="#23252c" stroke="#0d0e12" strokeWidth={5} />
    <rect x={-120} y={-200} width={240} height={60} rx={30} fill="#33363f" />
    <rect x={-90} y={-160} width={180} height={140} rx={10} fill={err > 0.5 ? '#3a0c10' : '#123a2c'} stroke="#000" strokeWidth={4} />
    <text x={0} y={sub ? -100 : -82} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={text.length > 8 ? 30 : 40} fill={err > 0.5 ? '#ff4d5a' : '#7dffb5'} style={err > 0.5 ? {filter: 'drop-shadow(0 0 6px #ff2a3a)'} : undefined}>
      {text}
    </text>
    {sub && (
      <text x={0} y={-58} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={30} fill={err > 0.5 ? '#ff4d5a' : '#7dffb5'}>
        {sub}
      </text>
    )}
    {Array.from({length: 12}).map((_, i) => {
      const c = i % 3;
      const r = Math.floor(i / 3);
      const col = i === 9 ? '#e0352b' : i === 11 ? '#2fbf62' : i === 10 ? '#e8c62e' : '#4b4f5b';
      return <rect key={i} x={-78 + c * 56} y={0 + r * 44} width={44} height={32} rx={8} fill={col} />;
    })}
  </g>
);

/** Bank card (front: chip + numbers; back: magnetic stripe). glitch 0..1 scrambles the stripe. */
export const BankCard: React.FC<{x: number; y: number; s?: number; rot?: number; back?: boolean; glitch?: number; frame?: number}> = ({x, y, s = 1, rot = 0, back = false, glitch = 0, frame = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-108} width={340} height={216} rx={20} fill="#2a6fdb" stroke="#123a80" strokeWidth={5} />
    <path d="M-170,30 Q0,-40 170,40 L170,88 Q170,108 150,108 L-150,108 Q-170,108 -170,88 Z" fill="#1d58b8" />
    {back ? (
      <>
        <rect x={-170} y={-80} width={340} height={56} fill="#111" />
        {glitch > 0 &&
          Array.from({length: 14}).map((_, i) => {
            const r = random(`bc${i}${Math.floor(frame / 2)}`);
            return r < glitch ? <rect key={i} x={-170 + i * 24} y={-80 + random(`bcy${i}${Math.floor(frame / 2)}`) * 40} width={20} height={8 + r * 12} fill={i % 2 ? '#ff4d5a' : '#7fe9ff'} /> : null;
          })}
        <rect x={-140} y={-6} width={190} height={34} rx={4} fill="#f2efe6" />
      </>
    ) : (
      <>
        <rect x={-130} y={-50} width={64} height={48} rx={8} fill="#e9c862" stroke="#9a7a22" strokeWidth={3} />
        <text x={-130} y={50} fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill="#e8f0ff" letterSpacing={3}>
          •••• •••• •••• 1212
        </text>
        <text x={-130} y={-70} fontFamily={HUD_FONT} fontWeight={700} fontSize={26} fill="#e8f0ff" letterSpacing={3}>
          BANCO
        </text>
      </>
    )}
  </g>
);

/** Paperclip (screen units), centred, length ~120*s. */
export const Clip: React.FC<{x: number; y: number; s?: number; rot?: number; glow?: number}> = ({x, y, s = 1, rot = 0, glow = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} style={glow ? {filter: `drop-shadow(0 0 ${10 * glow}px #ffd23a)`} : undefined}>
    <path d="M-20,30 L-20,-40 Q-20,-60 0,-60 Q20,-60 20,-40 L20,50 Q20,70 -2,70 Q-30,70 -30,50 L-30,-20" stroke="#9aa6b4" strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M-20,30 L-20,-40 Q-20,-60 0,-60 Q20,-60 20,-40 L20,50 Q20,70 -2,70 Q-30,70 -30,50 L-30,-20" stroke="#eef3f8" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

/** Davi's snack: a big burger, centred at (x,y) (puppet-local or screen). */
export const Burger: React.FC<{x?: number; y?: number; s?: number; bite?: number}> = ({x = 0, y = 0, s = 1, bite = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-90,-10 Q-90,-90 0,-92 Q90,-90 90,-10 Z" fill="#e3a043" stroke="#9a6318" strokeWidth={5} />
    {[-50, -10, 30, 60].map((dx, i) => (
      <ellipse key={dx} cx={dx} cy={-56 + (i % 2) * 14} rx={6} ry={3} fill="#fff3d0" />
    ))}
    <path d="M-96,-12 Q-60,8 -30,-8 Q0,10 30,-8 Q60,8 96,-12 L96,0 L-96,0 Z" fill="#4fbf4a" />
    <rect x={-92} y={-2} width={184} height={26} rx={10} fill="#6b3a1e" />
    <path d="M-90,22 L90,22 L80,36 L-80,36 Z" fill="#f3c32b" />
    <path d="M-88,34 Q-88,70 0,70 Q88,70 88,34 Z" fill="#d9913a" stroke="#9a6318" strokeWidth={5} />
    {bite > 0 && <circle cx={88} cy={-20} r={40 * bite} fill="none" />}
  </g>
);

/** The diner interior: back wall, window with neon "LANCHES", door (right) with bell, counter (left), checker floor. */
export const Diner: React.FC<{t: number; door?: number; bellSwing?: number; neon?: number; holderDent?: number; noHolder?: boolean; flash?: number}> = ({t, door = 0, bellSwing = 0, neon = 1, holderDent = 0, noHolder, flash = 0}) => {
  const flick = neon * (random(`nf${Math.floor(t * 12)}`) < 0.06 ? 0.4 : 1);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="dnWall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1c1530" />
            <stop offset="1" stopColor="#3a2548" />
          </linearGradient>
          <linearGradient id="dnWin" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0b1230" />
            <stop offset="1" stopColor="#1f2a5c" />
          </linearGradient>
          <radialGradient id="dnLamp" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#ffd98a" stopOpacity={0.55} />
            <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={-400} y={-200} width={1880} height={1700} fill="url(#dnWall)" />
        {/* wainscot tiles */}
        {Array.from({length: 30}).map((_, i) =>
          [0, 1, 2, 3, 4].map((r) => <rect key={`${i}${r}`} x={-400 + i * 64} y={1100 + r * 64} width={62} height={62} fill={(i + r) % 2 ? '#2a8f8a' : '#e8e0cc'} opacity={0.9} />),
        )}
        <rect x={-400} y={1090} width={1880} height={16} fill="#c9d1db" />
        {/* window with night street */}
        <rect x={40} y={620} width={500} height={420} rx={14} fill="url(#dnWin)" stroke="#c9d1db" strokeWidth={14} />
        {Array.from({length: 7}).map((_, i) => (
          <rect key={i} x={60 + i * 70} y={820 - (i % 3) * 60} width={60} height={220} fill="#141a3a" />
        ))}
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={74 + (i % 7) * 70} y={850 - (i % 3) * 50 + Math.floor(i / 7) * 60} width={14} height={14} fill="#ffd27a" opacity={0.8} />
        ))}
        <line x1={290} y1={620} x2={290} y2={1040} stroke="#c9d1db" strokeWidth={10} />
        {/* neon sign */}
        <g style={{filter: `drop-shadow(0 0 ${18 * flick}px #ff4fc3)`}} opacity={0.35 + 0.65 * flick}>
          <rect x={70} y={520} width={440} height={86} rx={40} fill="none" stroke="#ff4fc3" strokeWidth={8} />
          <text x={290} y={585} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={64} fill="#ffe0f4" stroke="#ff4fc3" strokeWidth={3} letterSpacing={6}>
            LANCHES
          </text>
        </g>
        <AbsoluteFillSvgCones t={t} />
        {/* door (right) */}
        <rect x={680} y={560} width={300} height={880} fill="#1a1222" />
        <g transform={`translate(680,0) scale(${1 - door * 0.82},1)`}>
          <rect x={0} y={560} width={300} height={880} fill="#9fb3c8" opacity={0.25} stroke="#c9d1db" strokeWidth={14} />
          <rect x={20} y={580} width={260} height={560} fill="#2b3a66" opacity={0.6} />
          <text x={150} y={700} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={40} fill="#ffd23a" opacity={0.85}>
            ABERTO
          </text>
          <rect x={250} y={960} width={20} height={90} rx={8} fill="#c9d1db" />
        </g>
        {/* bell */}
        <g transform={`translate(830,560) rotate(${bellSwing * 30 * Math.sin(t * 30)})`}>
          <line x1={0} y1={0} x2={0} y2={24} stroke="#c9a640" strokeWidth={4} />
          <path d="M-22,60 Q-22,24 0,22 Q22,24 22,60 Z" fill="#e8c34a" stroke="#8a6a1a" strokeWidth={3} />
          <circle cx={0} cy={64} r={6} fill="#8a6a1a" />
        </g>
        {/* floor */}
        <rect x={-400} y={1430} width={1880} height={700} fill="#1d1a22" />
        <Checker y0={1430} vpY={980} />
        {/* counter */}
        <rect x={-400} y={1150} width={1040} height={300} fill="#c9352d" />
        <rect x={-400} y={1150} width={1040} height={300} fill="url(#dnLamp)" opacity={0.4} />
        <rect x={-400} y={1250} width={1040} height={18} fill="#e8edf2" />
        <rect x={-400} y={1300} width={1040} height={8} fill="#e8edf2" opacity={0.7} />
        <rect x={-420} y={1118} width={1080} height={40} rx={10} fill="#d9dfe6" stroke="#7f8896" strokeWidth={4} />
        {/* items on the counter */}
        <g transform="translate(110,1118)">
          <rect x={-90} y={-130} width={180} height={130} rx={12} fill="#3b3f4a" stroke="#1d1f25" strokeWidth={4} />
          <rect x={-70} y={-114} width={140} height={46} rx={6} fill="#123a2c" />
          <text x={0} y={-80} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill="#7dffb5">
            R$ 18,90
          </text>
        </g>
        <path d="M570,1118 L580,1020 Q586,1000 600,1000 Q614,1000 620,1020 L630,1118 Z" fill="#e0352b" stroke="#8d1912" strokeWidth={3} />
        <rect x={588} y={980} width={24} height={24} rx={4} fill="#f6f2ea" />
        {!noHolder && <NapkinHolder x={455} y={1118} s={0.9} dent={holderDent} />}
        {flash > 0 && <rect x={-400} y={-200} width={1880} height={2400} fill="#fff" opacity={flash} />}
      </Svg>
    </AbsoluteFill>
  );
};

/** Pendant lamps with warm cones. */
const AbsoluteFillSvgCones: React.FC<{t: number}> = ({t}) => (
  <g>
    {[200, 560].map((x, i) => {
      const sw = Math.sin(t * 1.3 + i) * 2;
      return (
        <g key={x} transform={`rotate(${sw} ${x} -40)`}>
          <line x1={x} y1={-40} x2={x} y2={150} stroke="#111" strokeWidth={4} />
          <path d={`M${x - 70},210 Q${x},120 ${x + 70},210 Z`} fill="#2b8f7a" stroke="#123a32" strokeWidth={4} />
          <ellipse cx={x} cy={212} rx={30} ry={10} fill="#fff1c4" />
          <path d={`M${x - 66},212 L${x - 330},1120 L${x + 330},1120 L${x + 66},212 Z`} fill="#ffd98a" opacity={0.07} />
        </g>
      );
    })}
  </g>
);

/** Stool in front of the counter (seat top centre at x,y). */
export const Stool: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-10} y={10} width={20} height={250} fill="#aab3bf" stroke="#5d6672" strokeWidth={3} />
    <ellipse cx={0} cy={262} rx={70} ry={16} fill="#5d6672" />
    <ellipse cx={0} cy={120} rx={50} ry={10} fill="none" stroke="#aab3bf" strokeWidth={8} />
    <rect x={-80} y={-8} width={160} height={34} rx={16} fill="#e0352b" stroke="#8d1912" strokeWidth={4} />
  </g>
);

/* ------------------------------------------------------------------ street (exterior) */
export const Street: React.FC<{t: number; ox?: number; lights?: number}> = ({t, ox = 0, lights = 0}) => {
  const flick = random(`sf${Math.floor(t * 12)}`) < 0.06 ? 0.4 : 1;
  const ph = Math.floor(t * 8) % 2;
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="stSky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#070a20" />
            <stop offset="1" stopColor="#25204a" />
          </linearGradient>
        </defs>
        <rect x={-400} y={-300} width={1880} height={1700} fill="url(#stSky)" />
        <circle cx={860 + ox * 0.1} cy={330} r={56} fill="#f4f0dc" opacity={0.9} />
        {Array.from({length: 30}).map((_, i) => (
          <circle key={i} cx={random(`sx${i}`) * 1080} cy={random(`sy${i}`) * 500} r={2 + random(`sr${i}`) * 2} fill="#fff" opacity={0.4 + 0.4 * Math.sin(t * 3 + i)} />
        ))}
        <g transform={`translate(${ox},0)`}>
          {/* back buildings */}
          {Array.from({length: 9}).map((_, i) => (
            <rect key={i} x={-400 + i * 230} y={700 - (i % 3) * 140} width={210} height={800} fill="#141836" />
          ))}
          {/* diner facade */}
          <rect x={-60} y={640} width={780} height={760} fill="#3a2548" stroke="#1c1530" strokeWidth={8} />
          <rect x={-40} y={900} width={460} height={380} rx={10} fill="#ffcf7a" opacity={0.85} />
          <rect x={-40} y={900} width={460} height={380} rx={10} fill="none" stroke="#c9d1db" strokeWidth={12} />
          <rect x={480} y={930} width={200} height={470} fill="#ffcf7a" opacity={0.75} stroke="#c9d1db" strokeWidth={12} />
          {/* awning */}
          {Array.from({length: 11}).map((_, i) => (
            <path key={i} d={`M${-60 + i * 71},820 L${11 + i * 71},820 L${11 + i * 71},880 Q${-24 + i * 71},905 ${-60 + i * 71},880 Z`} fill={i % 2 ? '#e8e0cc' : '#d8342c'} />
          ))}
          <g style={{filter: `drop-shadow(0 0 ${22 * flick}px #ff4fc3)`}} opacity={0.35 + 0.65 * flick}>
            <rect x={60} y={680} width={560} height={110} rx={50} fill="#1c1530" stroke="#ff4fc3" strokeWidth={10} />
            <text x={340} y={765} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={84} fill="#ffe0f4" stroke="#ff4fc3" strokeWidth={4} letterSpacing={8}>
              LANCHES
            </text>
          </g>
          {/* lamp post */}
          <rect x={900} y={640} width={18} height={780} fill="#2b2f3a" />
          <path d="M880,640 L940,640 L930,610 L890,610 Z" fill="#2b2f3a" />
          <path d="M890,650 L700,1420 L1110,1420 L930,650 Z" fill="#ffe7a8" opacity={0.08} />
        </g>
        {/* sidewalk + road */}
        <rect x={-400} y={1400} width={1880} height={120} fill="#4a4d5a" />
        <rect x={-400} y={1400} width={1880} height={10} fill="#6b6f7e" />
        <rect x={-400} y={1520} width={1880} height={900} fill="#23252e" />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={-400 + i * 200 + (ox % 200)} y={1700} width={110} height={14} fill="#e8e0cc" opacity={0.7} />
        ))}
        {lights > 0 && (
          <rect x={-400} y={-300} width={1880} height={2400} fill={ph ? '#ff2a3a' : '#2a6bff'} opacity={0.16 * lights} style={{mixBlendMode: 'screen'}} />
        )}
      </Svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ bicycle */
/**
 * Side-view bicycle in local units (ground y=0, faces +x). crank angle in rad; chain 0..1 (0 = gone);
 * wheel rotation in rad. Rear wheel centre (-280,-190), front (300,-190), crank (20,-170).
 */
export const BIKE = {rear: [-280, -190] as [number, number], front: [300, -190] as [number, number], crank: [20, -170] as [number, number], seat: [-60, -470] as [number, number], bar: [250, -560] as [number, number], wheelR: 190, crankR: 80};

export const Bike: React.FC<{crank?: number; chain?: number; wheel?: number; layer?: 'back' | 'front' | 'all'; frameColor?: string}> = ({crank = 0, chain = 1, wheel = 0, layer = 'all', frameColor = '#2fa8e0'}) => {
  const [rx, ry] = BIKE.rear;
  const [fx, fy] = BIKE.front;
  const [cx, cy] = BIKE.crank;
  const [sx, sy] = BIKE.seat;
  const [bx, by] = BIKE.bar;
  const wheelG = (x: number, y: number) => (
    <g transform={`translate(${x},${y})`}>
      <circle r={BIKE.wheelR} fill="none" stroke="#141418" strokeWidth={26} />
      <circle r={BIKE.wheelR - 14} fill="none" stroke="#3a3d46" strokeWidth={4} />
      <g transform={`rotate(${(wheel * 180) / Math.PI})`}>
        {Array.from({length: 12}).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={0} y1={0} x2={Math.cos(a) * (BIKE.wheelR - 12)} y2={Math.sin(a) * (BIKE.wheelR - 12)} stroke="#c7ced8" strokeWidth={3} />;
        })}
      </g>
      <circle r={16} fill="#c7ced8" stroke="#555" strokeWidth={3} />
    </g>
  );
  const pedal = (a: number) => {
    const px = cx + Math.cos(a) * BIKE.crankR;
    const py = cy + Math.sin(a) * BIKE.crankR;
    return (
      <g key={a}>
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#8a929e" strokeWidth={12} strokeLinecap="round" />
        <rect x={px - 30} y={py - 8} width={60} height={16} rx={4} fill="#202024" />
      </g>
    );
  };
  const chainPath = `M${cx},${cy - 44} L${rx},${ry - 26} A26,26 0 0,0 ${rx},${ry + 26} L${cx},${cy + 44} A44,44 0 0,0 ${cx},${cy - 44}`;
  const back = (
    <g>
      {wheelG(rx, ry)}
      {wheelG(fx, fy)}
      {pedal(crank + Math.PI)}
    </g>
  );
  const front = (
    <g>
      {chain > 0.01 && <path d={chainPath} stroke="#5d6672" strokeWidth={10} fill="none" strokeDasharray="10 5" opacity={chain} />}
      <circle cx={cx} cy={cy} r={44} fill="none" stroke="#8a929e" strokeWidth={8} />
      <g stroke={frameColor} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={`M${rx},${ry} L${cx},${cy} L${sx + 20},${sy + 60} Z`} />
        <path d={`M${cx},${cy} L${bx - 40},${by + 90} L${sx + 20},${sy + 60}`} />
        <path d={`M${fx},${fy} L${bx - 40},${by + 70}`} />
      </g>
      <path d={`M${bx - 40},${by + 70} L${bx - 30},${by} L${bx + 40},${by - 10}`} stroke="#202024" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={`M${sx + 20},${sy + 60} L${sx + 10},${sy + 10}`} stroke="#8a929e" strokeWidth={12} />
      <path d={`M${sx - 70},${sy} Q${sx},${sy - 30} ${sx + 70},${sy + 4} L${sx + 40},${sy + 20} L${sx - 60},${sy + 16} Z`} fill="#202024" />
      {pedal(crank)}
    </g>
  );
  return layer === 'back' ? back : layer === 'front' ? front : (
    <g>
      {back}
      {front}
    </g>
  );
};

/** Two-bone IK for a puppet leg: returns {hip, kn} angles (deg) to put the ankle at `foot` (local units), knee pointing +x. */
export const legIK = (hip: [number, number], foot: [number, number]) => {
  const L1 = 226;
  const L2 = 214;
  const dx = foot[0] - hip[0];
  const dy = foot[1] - hip[1];
  const d = Math.min(Math.hypot(dx, dy), (L1 + L2) * 0.995);
  const th = Math.atan2(dx, dy);
  const al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = th + al;
  const kx = hip[0] + Math.sin(a1) * L1;
  const ky = hip[1] + Math.cos(a1) * L1;
  const a2 = Math.atan2(foot[0] - kx, foot[1] - ky);
  return {hip: (a1 * 180) / Math.PI, kn: ((a2 - a1) * 180) / Math.PI};
};

/** Robber riding (pedalling) the bike, feet at screen (x,y) = bike ground point, h = puppet height px. crank rad. */
export const Rider: React.FC<{x: number; y: number; h: number; crank: number; chain?: number; wheel?: number; expr?: PuppetProps['expr']; light?: Lighting; flip?: boolean; lean?: number}> = ({
  x,
  y,
  h,
  crank,
  chain = 1,
  wheel = 0,
  expr,
  light = STREET_LIGHT,
  flip,
  lean = 18,
}) => {
  const k = h / 1000;
  // the puppet's hips sit on the saddle: puppet origin shifted so hip (y=-460) lands at saddle top
  const oy = BIKE.seat[1] + 460 - 10;
  const ox = BIKE.seat[0] + 10;
  const [cx, cy] = BIKE.crank;
  const footAt = (a: number): [number, number] => [cx + Math.cos(a) * BIKE.crankR - ox, cy + Math.sin(a) * BIKE.crankR - oy - 20];
  const L = legIK([-56, -460], footAt(crank + Math.PI));
  const R = legIK([56, -460], footAt(crank));
  const pose: Pose = {lean, hipL: L.hip, knL: L.kn, hipR: R.hip, knR: R.kn, shL: 72, elL: 8, shR: 62, elR: 14, facing: 0.5};
  return (
    <svg width={1400 * k} height={1300 * k} viewBox="-700 -1150 1400 1300" style={{position: 'absolute', left: x - 700 * k, top: y - 1150 * k, overflow: 'visible'}}>
      <g transform={flip ? 'scale(-1,1)' : undefined}>
        <Bike crank={crank} chain={chain} wheel={wheel} layer="back" />
        <g transform={`translate(${ox},${oy})`}>
          <Puppet outfit={ROBBER} pose={pose} expr={expr} light={light} />
          <Hood lean={lean} facing={0.5} />
        </g>
        <Bike crank={crank} chain={chain} wheel={wheel} layer="front" />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ police car */
export const PoliceCar: React.FC<{x: number; y: number; s?: number; t: number; flip?: boolean}> = ({x, y, s = 1, t, flip}) => {
  const ph = Math.floor(t * 8) % 2;
  return (
    <Svg>
      <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
        <ellipse cx={0} cy={6} rx={420} ry={22} fill="#000" opacity={0.35} />
        <path d="M-400,-60 L-400,-170 Q-396,-200 -360,-206 L-220,-214 L-140,-320 Q-120,-340 -90,-340 L150,-340 Q180,-340 200,-320 L290,-216 L380,-200 Q410,-194 410,-160 L410,-60 Z" fill="#f4f5f8" stroke="#1b1d24" strokeWidth={6} />
        <path d="M-400,-150 L410,-150 L410,-60 L-400,-60 Z" fill="#1b2a5c" />
        <path d="M-200,-214 L-130,-310 L0,-310 L0,-214 Z" fill="#7fb2ff" opacity={0.75} stroke="#1b1d24" strokeWidth={5} />
        <path d="M20,-214 L20,-310 L150,-310 L260,-214 Z" fill="#7fb2ff" opacity={0.75} stroke="#1b1d24" strokeWidth={5} />
        <text x={0} y={-90} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={64} fill="#fff" letterSpacing={6} transform={flip ? 'scale(-1,1)' : undefined}>
          POLÍCIA
        </text>
        {/* light bar */}
        <rect x={-70} y={-372} width={70} height={32} rx={8} fill={ph ? '#ff2a3a' : '#6b1218'} style={ph ? {filter: 'drop-shadow(0 0 30px #ff2a3a)'} : undefined} />
        <rect x={0} y={-372} width={70} height={32} rx={8} fill={ph ? '#12245e' : '#2a6bff'} style={!ph ? {filter: 'drop-shadow(0 0 30px #2a6bff)'} : undefined} />
        <rect x={390} y={-180} width={24} height={34} rx={6} fill="#fff6c4" style={{filter: 'drop-shadow(0 0 20px #fff6c4)'}} />
        {[-250, 260].map((wx) => (
          <g key={wx} transform={`translate(${wx},-50)`}>
            <circle r={78} fill="#141418" />
            <circle r={40} fill="#aab3bf" />
          </g>
        ))}
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ x-ray of the bat (eddy currents) */
/**
 * Textbook x-ray of the bat lying horizontally across the screen (barrel at right).
 * pulse: field on (true) / off; k: currents strength 0..1; t seconds; rev: shows induced N/S poles 0..1.
 */
export const XR = {S: 2.6, X0: -200};
/** Eddy-current loops of the x-ray (screen x centre, radii). */
export const XR_LOOPS = [
  {x: XR.X0 + 255 * XR.S, rx: 46, ry: 40},
  {x: XR.X0 + 345 * XR.S, rx: 66, ry: 62},
  {x: XR.X0 + 425 * XR.S, rx: 70, ry: 64},
];
export const BatXray: React.FC<{t: number; k: number; on: boolean; fieldK?: number; y?: number}> = ({t, k, on, fieldK = 1, y = 980}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 55% 50%, #12305a 0%, #071226 70%)'}} />
    <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(120,200,255,0.08) 0 2px, transparent 2px 60px), repeating-linear-gradient(90deg, rgba(120,200,255,0.08) 0 2px, transparent 2px 60px)'}} />
    <Svg>
      {/* field lines coming from the left (Davi's hand), blinking */}
      <g opacity={(on ? 1 : 0.12) * fieldK} style={{filter: 'drop-shadow(0 0 10px #ffd23a)'}}>
        {[-200, -110, -40, 40, 110, 200].map((dy) => (
          <path key={dy} d={`M-20,${y + dy * 1.8} Q200,${y + dy * 1.2} 420,${y + dy * 0.8} L1100,${y + dy * 0.8}`} stroke="#ffd23a" strokeWidth={6} fill="none" strokeDasharray="30 18" strokeDashoffset={-t * 300} />
        ))}
      </g>
      {/* bat outline (x-ray) */}
      <g transform={`translate(${XR.X0},${y}) rotate(-90) scale(${XR.S})`}>
        <path d="M-15,-30 L15,-30 L16,170 Q34,250 36,330 L36,440 Q36,470 0,472 Q-36,470 -36,440 L-36,330 Q-34,250 -16,170 Z" fill="rgba(150,220,255,0.18)" stroke="#bfeaff" strokeWidth={1.4} />
        <path d="M-15,-30 L15,-30 L16,170 Q34,250 36,330 L36,440 Q36,470 0,472 Q-36,470 -36,440 L-36,330 Q-34,250 -16,170 Z" transform="scale(0.86,0.985)" fill="none" stroke="#bfeaff" strokeWidth={0.8} opacity={0.5} />
      </g>
      {/* eddy current loops */}
      {XR_LOOPS.map((L, i) => (
        <g key={i} opacity={k} transform={`translate(${L.x},${y})`} style={{filter: 'drop-shadow(0 0 8px #49e0ff)'}}>
          <ellipse rx={L.rx} ry={L.ry} fill="none" stroke="#49e0ff" strokeWidth={6} />
          <ellipse rx={L.rx * 0.55} ry={L.ry * 0.55} fill="none" stroke="#49e0ff" strokeWidth={4} opacity={0.6} />
          {[0, 1, 2].map((j) => {
            const a = t * 9 * (on ? 1 : 0.6) + (j / 3) * Math.PI * 2;
            const ax = Math.cos(a) * L.rx;
            const ay = Math.sin(a) * L.ry;
            const deg = (Math.atan2(Math.cos(a) * L.ry, -Math.sin(a) * L.rx) * 180) / Math.PI;
            return <path key={j} d="M-12,-11 L14,0 L-12,11 Z" fill="#c9f6ff" transform={`translate(${ax},${ay}) rotate(${deg})`} />;
          })}
        </g>
      ))}
    </Svg>
  </AbsoluteFill>
);

/** Jagged yellow electric arcs radiating from (x,y), redrawn every 2 frames. */
export const Arcs: React.FC<{x: number; y: number; r: number; k: number; frame: number; n?: number; spread?: number; dir?: number; seed?: string}> = ({x, y, r, k, frame, n = 6, spread = Math.PI * 2, dir = 0, seed = 'arc'}) => {
  if (k <= 0.01) return null;
  const fl = Math.floor(frame / 2);
  return (
    <Svg style={{mixBlendMode: 'screen'}}>
      <g style={{filter: 'drop-shadow(0 0 12px #ffd23a)'}} opacity={k}>
        {Array.from({length: n}).map((_, i) => {
          const a = dir + (i / n - 0.5) * spread + (random(`${seed}${i}${fl}`) - 0.5) * 0.4;
          const pts: string[] = [`M${x},${y}`];
          for (let s = 1; s <= 5; s++) {
            const rr = (r * s) / 5;
            const j = (random(`${seed}j${i}${s}${fl}`) - 0.5) * 0.5;
            pts.push(`L${(x + Math.cos(a + j) * rr).toFixed(1)},${(y + Math.sin(a + j) * rr).toFixed(1)}`);
          }
          return <path key={i} d={pts.join(' ')} stroke={i % 2 ? '#fff6c4' : '#ffd23a'} strokeWidth={i % 2 ? 4 : 8} fill="none" strokeLinejoin="round" />;
        })}
      </g>
    </Svg>
  );
};

/** Lost-cards counter chip ("CARTÕES PERDIDOS: N"), fallback if ../CardCounter is absent. bump = frames since change. */
export const CardChip: React.FC<{x: number; y: number; n: number; k: number; bump?: number}> = ({x, y, n, k, bump = -1}) => {
  if (k <= 0) return null;
  const b = bump >= 0 ? 1 + 0.35 * Math.exp(-bump / 4) * Math.cos(bump * 0.8) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${lerp(0.6, 1, easeOut(clamp(k))) * b})`,
        opacity: clamp(k * 2),
        background: 'rgba(12,16,34,0.85)',
        border: '4px solid #ff5a6a',
        borderRadius: 18,
        padding: '10px 26px',
        color: '#fff',
        fontFamily: HUD_FONT,
        fontWeight: 700,
        fontSize: 48,
        letterSpacing: 3,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      💳 CARTÕES PERDIDOS: <span style={{fontFamily: CAPTION_FONT, fontSize: 66, color: '#ff5a6a'}}>{n}</span>
    </div>
  );
};

/** Freeze-frame comic treatment: desaturated, halftone dots, white border. k 0..1. */
export const FreezeFrame: React.FC<{k: number; children: React.ReactNode}> = ({k, children}) => (
  <AbsoluteFill style={{filter: k > 0 ? `saturate(${1 - k * 0.6}) contrast(${1 + k * 0.15})` : undefined}}>
    {children}
    {k > 0 && (
      <>
        <AbsoluteFill style={{background: 'radial-gradient(rgba(0,0,0,0.25) 2px, transparent 2.5px) 0 0/16px 16px', opacity: k}} />
        <AbsoluteFill style={{boxShadow: `inset 0 0 0 ${24 * k}px #fff`}} />
      </>
    )}
  </AbsoluteFill>
);


