import React from 'react';
import {useUid} from '../lib/useUid';
import {BareFoot, DressShoe, Head, HeelShoe, Limb, MittenHand, Pt, Sneaker} from './parts';
import type {Expression, Lighting, Outfit, Pose} from './types';
import {SUNSET_LIGHT} from './types';

/**
 * Generic 2.5D cartoon puppet. Local units: ~1000 units tall, origin at the feet
 * (y negative is up). Proportions: head ≈ 1/4 of the body height.
 */
export type PuppetProps = {
  outfit: Outfit;
  pose?: Pose;
  expr?: Expression;
  light?: Lighting;
  /** render only from the waist up (car interiors etc.) */
  upperOnly?: boolean;
  /** draw as an empty silhouette outline (vacuum left behind by a jump) */
  ghost?: {opacity: number; color: string; dash?: number};
  /** something held in front of the chest, drawn between torso and arms (local units) */
  heldProp?: React.ReactNode;
  /** things hanging from a wrist (e.g. heels carried in the hand); drawn at the wrist, unrotated, local units, in front of the hand */
  handProps?: {L?: React.ReactNode; R?: React.ReactNode};
};

const HIP_Y = -480;
const NECK_Y = -772;
const HEAD_Y = -884;
const SHOULDER: Pt = [128, -728];
const UPPER = 182;
const FORE = 168;
const THIGH = 226;
const SHIN = 214;

const rad = (d: number) => (d * Math.PI) / 180;
const step = (p: Pt, ang: number, len: number): Pt => [p[0] + Math.sin(rad(ang)) * len, p[1] + Math.cos(rad(ang)) * len];

export const DEFAULT_POSE: Required<Pose> = {
  lean: 0,
  headTilt: 0,
  facing: 0,
  shL: -7,
  elL: 6,
  shR: 7,
  elR: -6,
  hipL: -3,
  knL: 0,
  hipR: 3,
  knR: 0,
  bob: 0,
};

export const Puppet: React.FC<PuppetProps> = ({outfit, pose = {}, expr = {}, light = SUNSET_LIGHT, upperOnly, ghost, heldProp, handProps}) => {
  const p = {...DEFAULT_POSE, ...pose};
  const tid = useUid('torso');
  const tshade = useUid('tshade');
  const s = light.side;

  // legs
  const hipL: Pt = [-56, HIP_Y + 20];
  const hipR: Pt = [56, HIP_Y + 20];
  const kneeL = step(hipL, p.hipL, THIGH);
  const kneeR = step(hipR, p.hipR, THIGH);
  const ankL = step(kneeL, p.hipL + p.knL, SHIN);
  const ankR = step(kneeR, p.hipR + p.knR, SHIN);

  // arms (in the torso's rotated frame)
  const shL: Pt = [-SHOULDER[0], SHOULDER[1]];
  const shR: Pt = [SHOULDER[0], SHOULDER[1]];
  const elbL = step(shL, p.shL, UPPER);
  const elbR = step(shR, p.shR, UPPER);
  const wrL = step(elbL, p.shL + p.elL, FORE);
  const wrR = step(elbR, p.shR + p.elR, FORE);
  const cuffL = step(elbL, p.shL + p.elL, FORE * 0.8);
  const cuffR = step(elbR, p.shR + p.elR, FORE * 0.8);

  const isSuit = outfit.torso === 'suit';
  const top = outfit.top;
  const hem = isSuit ? HIP_Y + 60 : HIP_Y + 30;
  const torsoPath = `M -70,${NECK_Y - 4} Q -132,${NECK_Y} -142,${NECK_Y + 46} L -124,${hem - 18} Q -124,${hem} -104,${hem} L 104,${hem} Q 124,${hem} 124,${hem - 18} L 142,${NECK_Y + 46} Q 132,${NECK_Y} 70,${NECK_Y - 4} Z`;

  const handTone = outfit.gloves ? {base: '#17171b', shade: '#050507', light: '#4a4c55'} : outfit.skin;
  const isDress = outfit.torso === 'dress';
  const armW = outfit.armW ?? (isSuit ? 64 : 66);
  const legW = outfit.legW ?? 70;
  const armTone = isDress ? outfit.skin : top;
  // dress: skirt hem follows the legs a little (walk / stance)
  const hemY = -196;
  const skew = ((p.hipL + p.hipR) / 2) * 3.2;
  const spread = Math.max(0, p.hipR - p.hipL - 6) * 2.2;
  const hemL = -166 - spread + skew;
  const hemR = 166 + spread + skew;
  const N = NECK_Y;
  const skirtPath = `M -86,${HIP_Y - 64} Q -118,${HIP_Y - 10} -124,${HIP_Y + 34} Q ${-140 + skew * 0.3},${HIP_Y + 170} ${hemL},${hemY} Q ${(hemL + hemR) / 2 - 40},${hemY + 22} ${(hemL + hemR) / 2},${hemY + 10} Q ${(hemL + hemR) / 2 + 40},${hemY + 22} ${hemR},${hemY} Q ${140 + skew * 0.3},${HIP_Y + 170} 124,${HIP_Y + 34} Q 118,${HIP_Y - 10} 86,${HIP_Y - 64} Z`;
  const bodicePath = `M -112,${N + 70} Q -60,${N + 26} 0,${N + 82} Q 60,${N + 26} 112,${N + 70} L 116,${N + 122} Q 108,${HIP_Y - 120} 86,${HIP_Y - 60} L -86,${HIP_Y - 60} Q -108,${HIP_Y - 120} -116,${N + 122} Z`;
  const shouldersPath = `M -58,${N - 4} Q -112,${N} -120,${N + 40} L -116,${N + 110} L 116,${N + 110} L 120,${N + 40} Q 112,${N} 58,${N - 4} Z`;

  if (ghost) {
    const st = {stroke: ghost.color, strokeWidth: 7, fill: 'none', strokeDasharray: ghost.dash ? `${ghost.dash} ${ghost.dash * 0.7}` : undefined, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
    const tube = (pts: Pt[], w: number) => (
      <g>
        <path d={`M${pts.map((q) => q.join(',')).join(' L')}`} stroke={ghost.color} strokeWidth={w + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.25} />
      </g>
    );
    return (
      <g opacity={ghost.opacity}>
        {tube([hipL, kneeL, ankL], legW)}
        {tube([hipR, kneeR, ankR], legW)}
        {tube([shL, elbL, wrL], armW)}
        {tube([shR, elbR, wrR], armW)}
        <path d={torsoPath} {...st} />
        <circle cx={0} cy={HEAD_Y} r={124} {...st} />
        <circle cx={0} cy={HEAD_Y} r={124} fill={ghost.color} opacity={0.12} />
        <path d={torsoPath} fill={ghost.color} opacity={0.12} />
      </g>
    );
  }

  return (
    <g transform={`translate(0,${p.bob})`}>
      <defs>
        <linearGradient id={tid} x1={s < 0 ? 0 : 1} x2={s < 0 ? 1 : 0} y1="0" y2="0">
          <stop offset="0" stopColor={light.rim} stopOpacity={1} />
          <stop offset="0.04" stopColor={top.light} />
          <stop offset="0.3" stopColor={top.base} />
          <stop offset="0.72" stopColor={top.base} />
          <stop offset="1" stopColor={top.shade} />
        </linearGradient>
        <linearGradient id={tshade} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.22} />
        </linearGradient>
      </defs>

      {!upperOnly && (
        <g>
          {/* pelvis */}
          {!isDress && <path d={`M -116,${HIP_Y - 10} L 116,${HIP_Y - 10} L 112,${HIP_Y + 60} Q 0,${HIP_Y + 80} -112,${HIP_Y + 60} Z`} fill={outfit.legs.base} />}
          <Limb pts={[hipL, kneeL, step(kneeL, p.hipL + p.knL, SHIN - 34)]} w={legW} tone={outfit.legs} light={light} />
          <Limb pts={[hipR, kneeR, step(kneeR, p.hipR + p.knR, SHIN - 34)]} w={legW} tone={outfit.legs} light={light} />
          {outfit.shoes === 'heels' || outfit.shoes === 'barefoot' ? (
            outfit.shoes === 'heels' ? (
              <>
                <HeelShoe at={ankL} side={-1} tone={outfit.shoeColor} skin={outfit.skin} />
                <HeelShoe at={ankR} side={1} tone={outfit.shoeColor} skin={outfit.skin} />
              </>
            ) : (
              <>
                <BareFoot at={ankL} side={-1} skin={outfit.skin} />
                <BareFoot at={ankR} side={1} skin={outfit.skin} />
              </>
            )
          ) : outfit.shoes === 'sneaker' ? (
            <>
              <Sneaker at={[ankL[0], ankL[1] - 6]} side={-1} tone={outfit.shoeColor} light={light} />
              <Sneaker at={[ankR[0], ankR[1] - 6]} side={1} tone={outfit.shoeColor} light={light} />
            </>
          ) : (
            <>
              <DressShoe at={[ankL[0], ankL[1] + 2]} side={-1} tone={outfit.shoeColor} />
              <DressShoe at={[ankR[0], ankR[1] + 2]} side={1} tone={outfit.shoeColor} />
            </>
          )}
        </g>
      )}

      {isDress && (
        <g transform={`rotate(${p.lean * 0.35} 0 ${HIP_Y})`}>
          <path d={skirtPath} fill={`url(#${tid})`} />
          <path d={skirtPath} fill={`url(#${tshade})`} />
          {[-0.55, -0.15, 0.25, 0.6].map((k) => (
            <path
              key={k}
              d={`M ${k * 120},${HIP_Y - 40} Q ${k * 150 + skew * 0.2},${HIP_Y + 120} ${k * 175 + skew * 0.6 + (k > 0 ? spread : -spread) * 0.6},${hemY + 6}`}
              stroke={top.shade}
              strokeWidth={9}
              fill="none"
              strokeLinecap="round"
              opacity={0.45}
            />
          ))}
          <path d={`M ${hemL + 8},${hemY - 4} Q ${(hemL + hemR) / 2},${hemY + 18} ${hemR - 8},${hemY - 4}`} stroke={top.light} strokeWidth={5} fill="none" opacity={0.5} />
        </g>
      )}
      <g transform={`rotate(${p.lean} 0 ${HIP_Y})`}>
        {/* neck */}
        <rect x={isDress ? -28 : -34} y={NECK_Y - 70} width={isDress ? 56 : 68} height={90} rx={20} fill={outfit.skin.shade} />
        {/* torso */}
        {isDress ? (
          <g>
            <path d={shouldersPath} fill={outfit.skin.base} />
            <path d={`M -40,${N + 30} Q 0,${N + 52} 40,${N + 30}`} stroke={outfit.skin.shade} strokeWidth={5} fill="none" opacity={0.5} />
            <path d={bodicePath} fill={`url(#${tid})`} />
            <path d={bodicePath} fill={`url(#${tshade})`} />
            <path d={`M -112,${N + 70} Q -60,${N + 26} 0,${N + 82} Q 60,${N + 26} 112,${N + 70}`} stroke={top.light} strokeWidth={6} fill="none" opacity={0.7} />
            {/* straps */}
            <path d={`M -84,${N + 54} L -70,${N - 2}`} stroke={top.base} strokeWidth={12} strokeLinecap="round" />
            <path d={`M 84,${N + 54} L 70,${N - 2}`} stroke={top.base} strokeWidth={12} strokeLinecap="round" />
            {/* gold belt */}
            <rect x={-92} y={HIP_Y - 72} width={184} height={16} rx={7} fill="#c9962e" />
            <rect x={-92} y={HIP_Y - 72} width={184} height={5} rx={2} fill="#f3d27a" opacity={0.8} />
            <rect x={-14} y={HIP_Y - 76} width={28} height={24} rx={6} fill="#e9bf55" stroke="#9c6f1c" strokeWidth={3} />
            <path d={`M -30,${N + 140} Q 0,${N + 170} 30,${N + 140}`} stroke={top.shade} strokeWidth={6} fill="none" opacity={0.5} />
          </g>
        ) : (
          <>
            <path d={torsoPath} fill={`url(#${tid})`} />
            <path d={torsoPath} fill={`url(#${tshade})`} />
          </>
        )}
        {isDress ? null : outfit.torso === 'hoodie' ? (
          <g>
            <rect x={-124} y={hem - 34} width={248} height={34} rx={14} fill={top.shade} opacity={0.55} />
            <path d={`M -78,${HIP_Y - 120} L 78,${HIP_Y - 120} L 92,${HIP_Y - 30} L -92,${HIP_Y - 30} Z`} fill={top.shade} opacity={0.28} />
            <path d={`M -78,${HIP_Y - 120} L 78,${HIP_Y - 120}`} stroke={top.shade} strokeWidth={5} opacity={0.6} />
            {/* hood roll */}
            <path d={`M -96,${NECK_Y + 6} Q 0,${NECK_Y + 70} 96,${NECK_Y + 6} Q 80,${NECK_Y - 22} 0,${NECK_Y - 16} Q -80,${NECK_Y - 22} -96,${NECK_Y + 6} Z`} fill={top.shade} />
            <path d={`M -70,${NECK_Y + 4} Q 0,${NECK_Y + 44} 70,${NECK_Y + 4}`} stroke={top.light} strokeWidth={6} fill="none" opacity={0.6} />
            {/* drawstrings */}
            <path d={`M -24,${NECK_Y + 30} L -30,${NECK_Y + 112}`} stroke="#f3ead8" strokeWidth={7} strokeLinecap="round" />
            <path d={`M 24,${NECK_Y + 30} L 28,${NECK_Y + 104}`} stroke="#f3ead8" strokeWidth={7} strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path d={`M -44,${NECK_Y - 2} L 44,${NECK_Y - 2} L 0,${NECK_Y + 150} Z`} fill="#eef0f3" />
            {outfit.neckwear === 'bow' ? (
              <g>
                {[60, 98, 136].map((dy) => (
                  <circle key={dy} cx={0} cy={NECK_Y + dy} r={5.5} fill="#1a1b20" />
                ))}
              </g>
            ) : (
              <path d={`M -12,${NECK_Y + 8} L 12,${NECK_Y + 8} L 16,${NECK_Y + 150} L 0,${NECK_Y + 172} L -16,${NECK_Y + 150} Z`} fill="#15161b" />
            )}
            <path d={`M -48,${NECK_Y - 4} L -6,${NECK_Y + 170} L -52,${NECK_Y + 70} L -76,${NECK_Y + 40} Z`} fill={outfit.neckwear === 'bow' ? '#2b2c34' : top.shade} />
            <path d={`M 48,${NECK_Y - 4} L 6,${NECK_Y + 170} L 52,${NECK_Y + 70} L 76,${NECK_Y + 40} Z`} fill={outfit.neckwear === 'bow' ? '#2b2c34' : top.shade} />
            {outfit.neckwear === 'bow' && (
              <g>
                <path d={`M -40,${NECK_Y + 10} L -14,${NECK_Y + 120}`} stroke="#6a6d78" strokeWidth={5} opacity={0.55} strokeLinecap="round" />
                <path d={`M 40,${NECK_Y + 10} L 14,${NECK_Y + 120}`} stroke="#6a6d78" strokeWidth={5} opacity={0.35} strokeLinecap="round" />
                <path d={`M -4,${NECK_Y + 16} L -46,${NECK_Y - 2} Q -52,${NECK_Y + 18} -46,${NECK_Y + 38} Z`} fill="#0c0c0f" />
                <path d={`M 4,${NECK_Y + 16} L 46,${NECK_Y - 2} Q 52,${NECK_Y + 18} 46,${NECK_Y + 38} Z`} fill="#0c0c0f" />
                <rect x={-11} y={NECK_Y + 6} width={22} height={22} rx={6} fill="#1d1e24" />
                <path d={`M -40,${NECK_Y + 6} L -20,${NECK_Y + 14}`} stroke="#5a5d68" strokeWidth={3} opacity={0.7} strokeLinecap="round" />
              </g>
            )}
            <path d={`M 0,${NECK_Y + 172} L 0,${hem}`} stroke={top.shade} strokeWidth={4} />
            <circle cx={9} cy={HIP_Y - 70} r={7} fill="#111" />
            <circle cx={9} cy={HIP_Y - 20} r={7} fill="#111" />
            <rect x={60} y={HIP_Y - 150} width={44} height={8} rx={3} fill={top.shade} />
          </g>
        )}

        {heldProp}
        {/* arms */}
        <Limb pts={[shL, elbL, wrL]} w={armW} tone={armTone} light={light} />
        <Limb pts={[shR, elbR, wrR]} w={armW} tone={armTone} light={light} />
        {isDress ? null : outfit.torso === 'hoodie' ? (
          <>
            <Limb pts={[cuffL, wrL]} w={armW * 0.92} tone={{...top, base: top.shade}} light={light} />
            <Limb pts={[cuffR, wrR]} w={armW * 0.92} tone={{...top, base: top.shade}} light={light} />
          </>
        ) : (
          <>
            <Limb pts={[step(elbL, p.shL + p.elL, FORE * 0.93), wrL]} w={armW * 0.7} tone={{base: '#eef0f3', shade: '#b9bec6', light: '#fff'}} light={light} />
            <Limb pts={[step(elbR, p.shR + p.elR, FORE * 0.93), wrR]} w={armW * 0.7} tone={{base: '#eef0f3', shade: '#b9bec6', light: '#fff'}} light={light} />
          </>
        )}
        <MittenHand at={wrL} angle={p.shL + p.elL} tone={handTone} light={light} thumbSide={1} />
        <MittenHand at={wrR} angle={p.shR + p.elR} tone={handTone} light={light} thumbSide={-1} />
        {handProps?.L && <g transform={`translate(${wrL[0]},${wrL[1]})`}>{handProps.L}</g>}
        {handProps?.R && <g transform={`translate(${wrR[0]},${wrR[1]})`}>{handProps.R}</g>}

        {/* head */}
        <g transform={`rotate(${p.headTilt} 0 ${NECK_Y}) translate(0,${HEAD_Y})`}>
          <Head skin={outfit.skin} style={outfit.head} expr={expr} light={light} facing={p.facing} />
        </g>
      </g>
    </g>
  );
};

/** Wraps a puppet in an <svg> sized in px; `height` is the on-screen height of ~1000 units. */
export const PuppetSvg: React.FC<PuppetProps & {height: number; style?: React.CSSProperties; flip?: boolean; children?: React.ReactNode}> = ({height, style, flip, children, ...rest}) => {
  const k = height / 1000;
  return (
    <svg
      width={700 * k}
      height={1150 * k}
      viewBox="-350 -1100 700 1150"
      style={{position: 'absolute', overflow: 'visible', ...style}}
    >
      <g transform={flip ? 'scale(-1,1)' : undefined}>
        <Puppet {...rest} />
        {children}
      </g>
    </svg>
  );
};

/** Positions a puppet so that its feet land on screen point (x, y). */
export const PlacedPuppet: React.FC<PuppetProps & {x: number; y: number; height: number; flip?: boolean; blur?: number; children?: React.ReactNode}> = ({x, y, height, blur, ...rest}) => {
  const k = height / 1000;
  return (
    <PuppetSvg
      height={height}
      {...rest}
      style={{left: x - 350 * k, top: y - 1100 * k, filter: blur ? `blur(${blur}px)` : undefined}}
    />
  );
};
