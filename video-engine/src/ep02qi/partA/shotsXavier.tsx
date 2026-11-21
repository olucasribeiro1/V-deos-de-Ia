import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {PlacedPuppet} from '../../characters/Puppet';
import type {Expression, Outfit, Pose} from '../../characters/types';
import {Bust, HeadFrame, PlacedCommuter} from '../characters';
import {METRO_LIGHT, MetroHall} from '../sets/Metro';
import {ReadTag} from '../ReadTag';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {Finish, H, Rig, ShotP, Stamp, Steam, Svg, SweatDrop, W, abs, clamp, easeOut, ev, kf, lerp, walkPose} from './kit';

/** Generic homage professor (NOT any franchise design): bald older man, tweed jacket, in a wheelchair, giant DIY wired helmet. */
const PROF: Outfit = {
  skin: {base: '#e4b894', shade: '#b88a68', light: '#f8d6b8'},
  torso: 'suit',
  top: {base: '#7a6a4c', shade: '#54482f', light: '#a08e6a'},
  legs: {base: '#4b4a48', shade: '#2f2e2c', light: '#6c6b68'},
  shoes: 'dress',
  shoeColor: {base: '#4a2e1c', shade: '#2a190e', light: '#7a5238'},
  gloves: false,
  head: {hair: 'bald', hairColor: '#8a8580'},
};

const SEATED: Pose = {hipL: 90, knL: -90, hipR: 86, knR: -86, shL: 30, elL: 50, shR: 36, elR: 44, facing: 0.5};

/** Giant DIY mind-reading helmet (head-local units). `fizz` 0..1 sparks/smoke, `load` 0..1 progress shown on its screen. */
const Helmet: React.FC<{frame: number; fizz?: number; load?: number; dead?: boolean}> = ({frame, fizz = 0, load = 0.03, dead}) => {
  const blink = (i: number) => (dead ? 0.15 : random(`hl${i}${Math.floor(frame / 3)}`) > 0.35 ? 1 : 0.25);
  return (
    <g>
      {/* wires up to the ceiling */}
      {Array.from({length: 9}).map((_, i) => {
        const x0 = -150 + i * 37;
        const sway = Math.sin(frame * 0.12 + i) * 30;
        return (
          <path
            key={i}
            d={`M${x0},-330 C ${x0 + (i - 4) * 60 + sway},-700 ${x0 - (i - 4) * 90},-1100 ${x0 + (i - 4) * 160},-2600`}
            stroke={['#d23c3c', '#2f6fd0', '#e8c23a', '#3a3a3a', '#2fa35a'][i % 5]}
            strokeWidth={14}
            fill="none"
          />
        );
      })}
      {/* dome */}
      <path d="M -190,-70 Q -210,-400 0,-420 Q 210,-400 190,-70 Z" fill="#aab4bd" />
      <path d="M -150,-110 Q -160,-360 -20,-390" stroke="#eef3f7" strokeWidth={18} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M 120,-100 Q 150,-330 40,-395" stroke="#6f7983" strokeWidth={20} fill="none" opacity={0.5} strokeLinecap="round" />
      {/* rivets + ribs */}
      {[-1, 0, 1].map((k) => (
        <path key={k} d={`M ${k * 110},-75 Q ${k * 120},-300 ${k * 40},-410`} stroke="#7d8790" strokeWidth={8} fill="none" />
      ))}
      {/* band */}
      <rect x={-205} y={-120} width={410} height={70} rx={20} fill="#5a636c" />
      {Array.from({length: 7}).map((_, i) => (
        <circle key={i} cx={-170 + i * 57} cy={-85} r={12} fill={['#ff4d4d', '#3dff8a', '#ffd23a', '#4dc3ff'][i % 4]} opacity={blink(i)} />
      ))}
      {/* side antennas / ear cups */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s > 0 ? 180 : -250} y={-110} width={70} height={110} rx={20} fill="#717b85" />
          <line x1={s * 215} y1={-110} x2={s * 300} y2={-330} stroke="#717b85" strokeWidth={12} />
          <circle cx={s * 300} cy={-340} r={20} fill="#ff4d4d" opacity={blink(9 + s)} />
        </g>
      ))}
      {/* tiny screen */}
      <rect x={-90} y={-250} width={180} height={80} rx={10} fill="#101820" stroke="#3a4650" strokeWidth={6} />
      <rect x={-75} y={-206} width={150 * load} height={22} fill={load < 0.2 ? '#ff4d4d' : '#3dff8a'} />
      <rect x={-75} y={-206} width={150} height={22} fill="none" stroke="#3a4650" strokeWidth={3} />
      <text x={0} y={-218} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={24} fill="#cfe" letterSpacing={2}>
        {dead ? 'ERRO' : `LENDO ${Math.round(load * 100)}%`}
      </text>
      {/* sparks */}
      {fizz > 0 &&
        Array.from({length: 6}).map((_, i) => {
          const a = random(`sp${i}${Math.floor(frame / 2)}`) * Math.PI - Math.PI;
          const r0 = 380;
          const pts = Array.from({length: 4}).map((__, s) => {
            const rr = r0 + s * 40;
            const aa = a + (random(`spj${i}${s}${frame}`) - 0.5) * 0.4;
            return `${s ? 'L' : 'M'}${(Math.cos(aa) * rr * 0.7).toFixed(1)},${(-200 + Math.sin(aa) * rr * 0.6).toFixed(1)}`;
          });
          return <path key={i} d={pts.join(' ')} stroke="#bff0ff" strokeWidth={8} fill="none" opacity={fizz * (random(`spo${i}${frame}`) > 0.3 ? 1 : 0)} style={{filter: 'drop-shadow(0 0 8px #5fc8ff)'}} />;
        })}
    </g>
  );
};

/** Side-view wheelchair facing right. (x, y) = seat front-centre; s = scale (1 ≈ seat 300 px wide). */
const Wheelchair: React.FC<{x: number; y: number; s: number; back?: boolean}> = ({x, y, s, back = true}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {back && (
      <>
        <rect x={-210} y={-420} width={34} height={440} rx={14} fill="#2e3237" />
        <path d="M -200,-420 L -260,-430" stroke="#2e3237" strokeWidth={20} strokeLinecap="round" />
        <rect x={-190} y={-380} width={40} height={340} rx={10} fill="#3d1e1e" />
      </>
    )}
    <rect x={-200} y={-20} width={330} height={40} rx={14} fill="#3d1e1e" />
    {/* big wheel */}
    <circle cx={-60} cy={150} r={220} fill="none" stroke="#1e2125" strokeWidth={26} />
    <circle cx={-60} cy={150} r={190} fill="none" stroke="#9aa3ab" strokeWidth={8} />
    {Array.from({length: 12}).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={-60} y1={150} x2={-60 + Math.cos(a) * 190} y2={150 + Math.sin(a) * 190} stroke="#9aa3ab" strokeWidth={4} />;
    })}
    <circle cx={-60} cy={150} r={26} fill="#5d646b" />
    {/* frame + caster */}
    <path d="M -180,20 L 110,20 L 150,250 M 110,20 L 100,200" stroke="#2e3237" strokeWidth={16} fill="none" strokeLinecap="round" />
    <circle cx={150} cy={300} r={58} fill="#1e2125" />
    <circle cx={150} cy={300} r={20} fill="#9aa3ab" />
    <rect x={90} y={196} width={120} height={18} rx={8} fill="#2e3237" />
  </g>
);

/** Professor in the chair with the helmet. (x, seatY) = seat; k = puppet scale (height/1000). */
const ProfInChair: React.FC<{x: number; seatY: number; k: number; frame: number; expr?: Expression; fizz?: number; load?: number; dead?: boolean; silhouette?: boolean}> = ({
  x,
  seatY,
  k,
  frame,
  expr,
  fizz,
  load,
  dead,
  silhouette,
}) => (
  <AbsoluteFill style={{filter: silhouette ? 'brightness(0.16) saturate(0.3) drop-shadow(0 0 2px #9fe8ff) drop-shadow(0 0 14px rgba(120,200,255,0.8))' : undefined}}>
    <Svg>
      <Wheelchair x={x + 30 * k} y={seatY + 20 * k} s={k * 1.05} />
    </Svg>
    <PlacedPuppet outfit={PROF} x={x} y={seatY + 460 * k} height={1000 * k} pose={SEATED} expr={expr} light={METRO_LIGHT}>
      <HeadFrame pose={SEATED}>
        <Helmet frame={frame} fizz={fizz} load={load} dead={dead} />
      </HeadFrame>
    </PlacedPuppet>
  </AbsoluteFill>
);

/* 14. "O Davi vê todas." — Davi in the metro crowd; small reading tags pop on every face. */
export const SSeesAll: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const crowd = [
    {s: 3, x: 120, y: 1380, h: 700, flip: false},
    {s: 8, x: 330, y: 1330, h: 660, flip: false},
    {s: 12, x: 780, y: 1340, h: 680, flip: true},
    {s: 21, x: 980, y: 1400, h: 720, flip: true},
    {s: 5, x: 30, y: 1720, h: 900, flip: false},
    {s: 17, x: 1060, y: 1760, h: 940, flip: true},
  ];
  const tags = [
    {label: 'ATRASADO', pct: 88, i: 0, x: 20, y: 560},
    {label: 'COM FOME', pct: 71, i: 1, x: 250, y: 640},
    {label: 'TÉDIO', pct: 93, i: 2, x: 600, y: 560},
    {label: 'APAIXONADO', pct: 64, i: 3, x: 720, y: 760},
    {label: 'MENTINDO', pct: 12, i: 4, x: 30, y: 1000},
    {label: 'SONO', pct: 99, i: 5, x: 760, y: 1080},
  ];
  return (
    <Rig dur={p.dur} zoom={[1.15, 1.02]} rot={[-3, 2]} whip="r">
      <MetroHall t={t} px={-700 + fr * 3} floorY={1250} />
      {crowd.slice(0, 4).map((c) => (
        <PlacedCommuter key={c.s} seed={c.s} x={c.x} y={c.y} height={c.h} flip={c.flip} pose={walkPose(t, c.s, 0.4)} expr={{lookX: c.flip ? -0.5 : 0.5}} blur={1.5} light={METRO_LIGHT} />
      ))}
      <PlacedDavi x={540} y={1560} height={830} pose={{facing: 0, headTilt: Math.sin(t * 3) * 3, shL: -12, shR: 12}} expr={{halfSmile: 0.8, browAsym: 0.4, lookX: Math.sin(t * 5)}} light={METRO_LIGHT} />
      {crowd.slice(4).map((c) => (
        <PlacedCommuter key={c.s} seed={c.s} x={c.x} y={c.y} height={c.h} flip={c.flip} pose={walkPose(t, c.s, 0.5)} blur={5} light={METRO_LIGHT} />
      ))}
      {tags.map((g, n) => {
        const c = crowd[g.i];
        const hy = c.y - c.h * 0.88;
        return <ReadTag key={n} label={g.label} pct={g.pct} x={g.x} y={g.y} tx={c.x} ty={hy} from={4 + n * 3} scale={0.62} />;
      })}
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 15. "Professor Xavier," — backlit homage silhouette: bald professor, wheelchair, giant wired helmet. */
export const SProf: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = 0.86;
  const x = 470;
  const seatY = 1290;
  const headY = seatY - (884 - 460) * k;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[0, 30, 0, 0]} origin={[540, headY]} pow={1.4}>
      <AbsoluteFill style={{background: `radial-gradient(circle 560px at 540px ${headY - 60}px, #e8f7ff 0%, #7fc6ee 22%, #1d3d63 55%, #070c18 100%)`}} />
      <Svg>
        {Array.from({length: 14}).map((_, i) => {
          const a = (i / 14) * Math.PI * 2 + t * 0.4;
          return <path key={i} d={`M540,${headY - 60} L${540 + Math.cos(a) * 1400},${headY - 60 + Math.sin(a) * 1400} L${540 + Math.cos(a + 0.1) * 1400},${headY - 60 + Math.sin(a + 0.1) * 1400} Z`} fill="#bfe8ff" opacity={0.08} />;
        })}
        <ellipse cx={520} cy={1560} rx={520} ry={70} fill="#000" opacity={0.5} />
      </Svg>
      <ProfInChair x={x} seatY={seatY} k={k} frame={fr} silhouette expr={{browTilt: -0.6}} />
      <Svg>
        {/* helmet lights glow through the silhouette */}
        {Array.from({length: 7}).map((_, i) => (
          <circle key={i} cx={x + (-170 + i * 57) * k} cy={headY - 85 * k} r={9} fill={['#ff4d4d', '#3dff8a', '#ffd23a', '#4dc3ff'][i % 4]} opacity={random(`pl${i}${Math.floor(fr / 3)}`) > 0.35 ? 1 : 0.2} style={{filter: 'drop-shadow(0 0 8px currentColor)'}} />
        ))}
      </Svg>
      <Finish vignette={0.65} grain={0.12} />
    </Rig>
  );
};

/* 16. "dos X-Men?" — push into the helmet: sparks, strain, sweat, "LENDO 3%". */
export const SHelmet: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const r = 250;
  const cx = 540;
  const cy = 1130;
  const strain = kf(fr, [0, 14], [0.2, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} origin={[540, 900]} shakes={[{at: 8, dur: 26, amp: 8}]}>
      <AbsoluteFill style={{background: 'radial-gradient(circle 700px at 540px 700px, #8fd0f4 0%, #24507e 45%, #08101e 100%)'}} />
      <Bust outfit={PROF} cx={cx} cy={cy} r={r} pose={{facing: 0, shL: -10, shR: 10}} expr={{browTilt: -1, blink: 0.75 * strain, smile: -0.7 * strain, browRaise: -0.4}} light={METRO_LIGHT}>
        <HeadFrame pose={{}}>
          <Helmet frame={fr} fizz={strain} load={kf(fr, [0, p.dur], [0.01, 0.03])} />
        </HeadFrame>
      </Bust>
      <Svg>
        <SweatDrop x={cx + 160} y={cy - 40} s={64} k={clamp((fr - 6) / 20)} />
        <SweatDrop x={cx - 170} y={cy - 10} s={50} k={clamp((fr - 14) / 20)} />
        {/* forehead vein */}
        <path d={`M ${cx + 40},${cy - 190} l 16,-20 l 12,14 l 14,-22`} stroke="#c05a5a" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={strain} />
      </Svg>
      <Finish vignette={0.6} grain={0.1} />
    </Rig>
  );
};

/* 17. "Amador." — Davi strolls past the helmet guy with nothing on his head; red stamp AMADOR. */
export const SAmador: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = 0.72;
  const seatY = 1330;
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.1]} pan={[20, 0, -20, 0]} shakes={[{at: 1, dur: 10, amp: 16}]}>
      <MetroHall t={t} px={-900} floorY={1240} />
      <ProfInChair x={230} seatY={seatY} k={k} frame={fr} fizz={0.6} expr={{browTilt: -1, blink: 0.7, smile: -0.6}} />
      <PlacedDavi x={lerp(560, 760, fr / p.dur)} y={1640} height={860} pose={{...walkPose(t, 0, 0.8), facing: 0.35}} expr={{halfSmile: 0.9, browAsym: 0.5, lookX: -0.6}} light={METRO_LIGHT} />
      <Stamp x={330} y={880} text="AMADOR" color="#d62f2f" k={fr - 1} rot={-12} size={130} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 18. "Precisa de capacete." — Davi shrugs, taps his bare head ("TOC TOC"); the helmet behind fizzles out with smoke. */
export const SShrug: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const T = ev(p, 'L4', 11);
  const tap = fr >= T;
  const knock = tap ? Math.abs(Math.sin((fr - T) * 0.9)) : 0;
  const shrug = kf(fr, [0, 5], [0, 1], easeOut);
  const pose: Pose = tap
    ? {shL: -14, elL: 8, shR: 150, elR: 85 + knock * 10, headTilt: -4 + knock * 2}
    : {shL: -30, elL: -60 * shrug, shR: 30, elR: 60 * shrug, headTilt: 7 * shrug, bob: -18 * shrug};
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.14]} pan={[-30, 0, 0, 0]} whip="l" punches={[{at: T, amt: 0.05}]}>
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.1)'}}>
        <MetroHall t={t} px={-900} floorY={1350} />
        <ProfInChair x={170} seatY={1150} k={0.75} frame={fr} dead fizz={0} expr={{browTilt: 0.8, mouthOpen: 0.4}} />
      </AbsoluteFill>
      <Svg>
        <Steam x={170} y={620} t={t} k={1} spread={200} color="#9aa3ab" seed="smk" n={12} size={1.3} />
      </Svg>
      <Bust outfit={DAVI_OUTFIT} cx={620} cy={1000} r={210} pose={pose} expr={{halfSmile: 0.9, browRaise: 0.6, browAsym: 0.3, lookX: -0.2}} light={METRO_LIGHT} />
      {tap && (
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 640,
            transform: `rotate(-10deg) scale(${1 + knock * 0.15})`,
            fontFamily: CAPTION_FONT,
            fontWeight: 700,
            fontSize: 74,
            color: '#ffd23a',
            WebkitTextStroke: '4px #141414',
            paintOrder: 'stroke fill',
            whiteSpace: 'nowrap',
          }}
        >
          TOC TOC
        </div>
      )}
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

export {W, H};
