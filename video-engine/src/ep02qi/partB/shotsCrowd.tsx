import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Finish} from '../../scenes/common';
import {Flash} from '../../fx/Rastro';
import {CAPTION_FONT} from '../../lib/fonts';
import {ReadTag} from '../ReadTag';
import {MetroPlatform} from '../sets/Metro';
import {Rig, ShotP, SpeedLines, abs, ev} from './rig';
import {CHEFE, Chip, DAVI_OUTFIT, EnergyLines, Glitch, METRO_LIGHT, Pup, Svg, Sweat, headOf, run} from './kit';
import {SideRow, TopCrowd, sideRows, topPeople} from './crowd';

const PEOPLE = topPeople('rush');
const ROWS = sideRows('plat', [
  {y: 1420, h: 520, n: 9},
  {y: 1600, h: 660, n: 7},
  {y: 1820, h: 820, n: 5},
]);

/** Red overheating tint + vignette pulse. */
const Heat: React.FC<{k: number; t: number}> = ({k, t}) =>
  k <= 0 ? null : (
    <>
      <AbsoluteFill style={{background: `rgba(255,30,20,${0.22 * k + 0.06 * k * Math.sin(t * 16)})`, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,0,0,0) 45%, rgba(200,0,0,${0.55 * k}) 100%)`}} />
    </>
  );

/** Big red degree flash. */
const Deg: React.FC<{v: string; k: number; y?: number}> = ({v, k, y = 640}) =>
  k <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: 540,
        top: y,
        transform: `translate(-50%,-50%) scale(${lerp(1.6, 1, clamp(k * 2))})`,
        opacity: clamp(k * 3),
        fontFamily: CAPTION_FONT,
        fontWeight: 700,
        fontSize: 220,
        color: '#ff3b3b',
        WebkitTextStroke: '6px #2a0000',
        textShadow: '0 10px 0 rgba(0,0,0,0.45)',
      }}
    >
      {v}
    </div>
  );

/* 14. "Então o Davi se joga na multidão." — head-first dive into the rush-hour crowd. */
export const SMergulho: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const J = ev(p, 'L12', 4); // "joga"
  const u = kf(fr, [J - 12, J + 12], [0, 1], (x) => x);
  const x = lerp(-60, 640, u);
  const y = lerp(1250, 1500, u) - Math.sin(u * Math.PI) * 380;
  const rot = lerp(40, 120, u);
  const splash = fr > J + 12;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[30, 0, -40, 0]} rot={[-1, 1]} pow={1.3} shakes={[{at: J + 15, amp: 16, dur: 10}]}>
      <MetroPlatform t={t} px={-fr * 3} edgeY={1180} train={null} />
      <SideRow t={t} row={ROWS[0]} px={-fr * 2} />
      <SideRow t={t} row={ROWS[1]} px={-fr * 3} look={splash ? 0.4 : 0} />
      {!splash && (
        <Pup
          outfit={DAVI_OUTFIT}
          x={x}
          y={y}
          height={760}
          light={METRO_LIGHT}
          rot={rot}
          pivotY={-480}
          pose={{shL: 175, elL: 0, shR: -175, elR: 0, hipL: -8, hipR: 8, knL: 20, knR: 30, facing: 0.5}}
          expr={{smile: 0.6, eyesWide: 0.3, lookX: 1}}
        />
      )}
      <SideRow t={t} row={ROWS[2]} px={-fr * 4} />
      <Svg>
        {splash &&
          Array.from({length: 8}).map((_, i) => {
            const k = clamp((fr - J - 14) / 10);
            const a = -Math.PI * (0.15 + (i / 7) * 0.7);
            return <line key={i} x1={600 + Math.cos(a) * 120 * k} y1={1300 + Math.sin(a) * 120 * k} x2={600 + Math.cos(a) * (120 + 90) * k} y2={1300 + Math.sin(a) * (120 + 90) * k} stroke="#ffd23a" strokeWidth={10} strokeLinecap="round" opacity={1 - k} />;
          })}
      </Svg>
      <SpeedLines k={kf(fr, [J - 12, J, J + 12], [0, 0.6, 0])} t={t} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 15. "Trezentas caras de uma vez." — from above: ~300 reading tags pop at once. */
export const STrezentas: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tags = kf(fr, [1, 10], [0, 1], (x) => x);
  return (
    <Rig dur={p.dur} zoom={[1.25, 1.0]} rot={[6, 0]} pow={1.5} whip="u" origin={[540, 960]}>
      <TopCrowd t={fr / 30} people={PEOPLE} tags={tags} davi={{x: 540, y: 1000, ang: -10}} />
      <Chip x={540} y={1690} text={`LEITURAS: ${Math.round(300 * tags)}`} k={kf(fr, [2, 6], [0, 1], easeOut)} size={46} />
      <Flash k={kf(fr, [1, 2, 6], [0, 0.25, 0], (x) => x)} color="255,230,120" />
      <Finish vignette={0.4} grain={0.1} />
    </Rig>
  );
};

/** Davi squeezed in the crowd, close-up (shared by 39° / 41°). */
const Squeezed: React.FC<{t: number; fr: number; heat: number; h?: number}> = ({t, fr, heat, h = 1700}) => {
  const X = 540 + Math.sin(fr * 1.9) * 4 * heat;
  const Y = 2420;
  const hd = headOf(X, Y, h);
  return (
    <>
      <AbsoluteFill style={{filter: 'blur(8px)'}}>
        <MetroPlatform t={t} px={-300} edgeY={1500} train={null} />
        <SideRow t={t} row={ROWS[1]} px={-200} />
      </AbsoluteFill>
      <Pup outfit={DAVI_OUTFIT} x={X} y={Y} height={h} upperOnly light={METRO_LIGHT} pose={{shL: -4, elL: 20, shR: 4, elR: -20}} expr={{browTilt: 0.8, browRaise: 0.3, smile: -0.6, mouthOpen: 0.2, eyesWide: 0.3 * heat}} />
      <Sweat x={hd.x} y={hd.y - hd.r * 0.5} t={t} s={1.8} n={7} k={heat} />
      {/* steam */}
      <Svg>
        {[-1, 0, 1].map((i) => {
          const ph = (t * 1.4 + i * 0.33 + 1) % 1;
          return <path key={i} d={`M ${hd.x + i * 90},${hd.y - hd.r - ph * 200} q 26,-36 0,-72 q -26,-36 0,-72`} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={(1 - ph) * 0.6 * heat} />;
        })}
      </Svg>
      {/* shoulders of strangers pressing in */}
      <Pup outfit={{...DAVI_OUTFIT, top: {base: '#3d8a6b', shade: '#26604a', light: '#5fb08f'}, head: {hair: 'buzz', hairColor: '#111'}}} x={-160 + Math.sin(fr * 0.5) * 10} y={2600} height={1900} upperOnly light={METRO_LIGHT} blur={6} />
      <Pup outfit={{...DAVI_OUTFIT, top: {base: '#b8483e', shade: '#82302a', light: '#d96d62'}, head: {hair: 'curlyBun', hairColor: '#3a2a22'}}} x={1240 - Math.sin(fr * 0.5) * 10} y={2650} height={1900} upperOnly light={METRO_LIGHT} blur={6} />
    </>
  );
};

/* 16. "Trinta e nove graus." */
export const STrinta: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const N = ev(p, 'L12', 14);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} rot={[-1, 1]} pow={1.2} whip="d" shakes={[{at: N, amp: 8, dur: 12}]}>
      <Squeezed t={t} fr={fr} heat={0.6} />
      <Heat k={0.45} t={t} />
      <Deg v="39°" k={kf(fr, [N, N + 6], [0, 1], (x) => x)} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/* 17. "Quarenta." — extreme close on the eye, tags swarming, stronger red + shake. */
export const SQuarenta: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const h = 5200;
  const X = 700;
  const Y = 960 + 884 * (h / 1000);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[2, -2]} pow={1} shakes={[{at: 0, amp: 16, dur: 20}]}>
      <AbsoluteFill style={{background: '#3a1410'}} />
      <Pup outfit={DAVI_OUTFIT} x={X} y={Y} height={h} upperOnly light={METRO_LIGHT} expr={{eyesWide: 0.9, browTilt: 0.9, lookX: -0.4}} />
      <Svg>
        {Array.from({length: 26}).map((_, i) => {
          const r = (q: string) => random(`q4${i}${q}`);
          const k = clamp((fr - r('d') * 8) / 4);
          const x = r('x') * 1000 + 40;
          const y = 560 + r('y') * 900;
          if (Math.abs(x - 540) < 260 && Math.abs(y - 960) < 160) return null;
          return (
            <g key={i} opacity={k} transform={`translate(${x},${y}) scale(${1 + r('s')})`}>
              <rect x={0} y={-20} width={70} height={32} rx={6} fill="rgba(10,14,30,0.8)" stroke={r('c') > 0.4 ? '#ff3b3b' : '#ffd23a'} strokeWidth={3} />
              <text x={35} y={4} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={22} fill={r('c') > 0.4 ? '#ff3b3b' : '#ffd23a'}>
                {50 + Math.floor(r('p') * 49)}%
              </text>
            </g>
          );
        })}
      </Svg>
      <Heat k={0.75} t={t} />
      <Deg v="40°" k={kf(fr, [0, 5], [0, 1], (x) => x)} y={640} />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/* 18. "Quarenta e um." — everything red, shaking, every tag flashing: overheating alarm. */
export const SQuarentaEUm: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const U = ev(p, 'L12', 19);
  const blink = Math.sin(t * 22) > 0 ? 1 : 0.5;
  return (
    <Rig dur={p.dur} zoom={[1.15, 1.25]} rot={[-3, 3]} pow={1} shakes={[{at: 0, amp: 22, dur: 16}, {at: U, amp: 26, dur: 14}]}>
      <TopCrowd t={1.5 + fr / 30} people={PEOPLE} tags={1} red={kf(fr, [0, 10], [0.4, 1])} davi={{x: 540, y: 1000, ang: Math.sin(fr) * 10}} />
      <Heat k={kf(fr, [0, 10], [0.7, 1]) * blink} t={t} />
      <Glitch k={0.35} frame={fr} />
      <Deg v="41°" k={kf(fr, [U, U + 5], [0, 1], (x) => x)} y={1000} />
      <Chip x={540} y={1690} text="⚠ SUPERAQUECIMENTO" k={kf(fr, [2, 7], [0, 1], easeOut) * blink} color="#ff3b3b" size={46} />
      <Finish vignette={0.7} grain={0.12} />
    </Rig>
  );
};

/* 19. "Mas ele vê o buraco abrindo," — Davi's vision from above: arrows on everyone, a green gap opens. */
const PATH_PTS: [number, number][] = [
  [540, 1500],
  [470, 1150],
  [600, 820],
  [520, 420],
];
const pathD = `M ${PATH_PTS[0][0]},${PATH_PTS[0][1]} C 440,1300 460,1000 600,820 S 500,560 520,420`;
const distToPath = (x: number, y: number) => {
  // approximate with the polyline
  let best = 1e9;
  let side = 1;
  for (let i = 0; i < PATH_PTS.length - 1; i++) {
    const [ax, ay] = PATH_PTS[i];
    const [bx, by] = PATH_PTS[i + 1];
    const vx = bx - ax;
    const vy = by - ay;
    const u = clamp(((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy));
    const px = ax + vx * u;
    const py = ay + vy * u;
    const d = Math.hypot(x - px, y - py);
    if (d < best) {
      best = d;
      side = vx * (y - ay) - vy * (x - ax) > 0 ? -1 : 1;
    }
  }
  return {d: best, side};
};
const along = (u: number): [number, number] => {
  const n = PATH_PTS.length - 1;
  const s = clamp(u) * n;
  const i = Math.min(n - 1, Math.floor(s));
  const k = s - i;
  return [lerp(PATH_PTS[i][0], PATH_PTS[i + 1][0], k), lerp(PATH_PTS[i][1], PATH_PTS[i + 1][1], k)];
};
const pusher = (gap: number) => (p: {x: number; y: number}) => {
  const {d, side} = distToPath(p.x, p.y);
  const amt = Math.max(0, 170 - d) * gap;
  return [side * amt * 1.1, 0] as [number, number];
};

export const SBuraco: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const B = ev(p, 'L13', 5); // "abrindo"
  const arrows = kf(fr, [0, 5], [0, 1], easeOut);
  const gap = kf(fr, [B - 4, B + 6], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} rot={[0, -2]} pow={1.3} whip="d">
      <TopCrowd t={fr / 90} people={PEOPLE} push={pusher(gap)} arrows={arrows * (1 - gap * 0.5)} davi={{x: 540, y: 1500, ang: -10}} pathD={pathD} pathK={gap} />
      <AbsoluteFill style={{background: `rgba(255,30,20,${0.18 * (1 - gap)})`, mixBlendMode: 'multiply'}} />
      <EnergyLines x={540} y={1500} r={70} t={t} k={0.9} />
      <Chip x={540} y={1690} text="ROTA LIVRE" k={kf(fr, [B, B + 5], [0, 1], easeOut)} color="#3dff8a" />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 20. "passa pelo meio," — side view: Davi slips sideways between commuters, yellow energy lines. */
export const SPassa: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const u = fr / p.dur;
  const dx = 520;
  const part = (pp: {x: number}) => {
    const d = pp.x - fr * 11 - dx;
    return Math.sign(d) * Math.max(0, 160 - Math.abs(d)) * 0.7;
  };
  const part2 = (pp: {x: number}) => {
    const d = pp.x - fr * 15 - dx;
    return Math.sign(d || 1) * Math.max(0, 420 - Math.abs(d)) * 0.9;
  };
  const hd = headOf(dx, 1700, 820);
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.12]} pan={[0, 0, 0, 0]} rot={[-1, 1]} pow={1}>
      <MetroPlatform t={t} px={-fr * 10} edgeY={1180} train={null} />
      <SideRow t={t} row={ROWS[0]} px={-fr * 8} />
      <SideRow t={t} row={ROWS[1]} px={-fr * 11} part={part} />
      <SideRow t={t} row={ROWS[2]} px={-fr * 15} part={part2} />
      <div style={{position: 'absolute', inset: 0, transform: `scaleX(0.82)`, transformOrigin: `${dx}px 1600px`}}>
        <Pup outfit={DAVI_OUTFIT} x={dx} y={1700 + Math.sin(fr * 0.8) * 6} height={820} light={METRO_LIGHT} pose={{...run(t, 0, 0.6), lean: 4, shL: -2, elL: 10, shR: 2, elR: -10, facing: 1}} expr={{smile: 0.7, lookX: 1, halfSmile: 0.4}} />
      </div>
      <EnergyLines x={hd.x} y={hd.y} r={hd.r * 1.6} t={t} k={0.9} />
      <SpeedLines k={0.35} t={t} />
      <Chip x={540} y={1690} text={`DESVIO ${Math.round(lerp(12, 31, u))}/31`} k={kf(fr, [2, 6], [0, 1], easeOut)} color="#3dff8a" size={38} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/** Door countdown chip value (s). */
const doorLeft = (absS: number) => clamp(1.0 - (absS - 64.35) / 1.2, 0, 1);
const fmt = (v: number) => v.toFixed(1).replace('.', ',');

/* 21. "e entra no trem um segundo antes" — open doors, Davi sprints in; PORTA 1,0 s starts on "um segundo". */
export const STrem: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const U = ev(p, 'L13', 13);
  const u = kf(fr, [0, 26], [0, 1], (x) => x);
  const doorX = 470;
  const x = lerp(-60, doorX, u);
  const y = lerp(1420, 1300, u);
  const inside = fr > 26;
  return (
    <Rig dur={p.dur} zoom={[1.45, 1.6]} origin={[doorX, 1000]} pan={[0, 0, 0, 0]} rot={[-1, 0.5]} pow={1.2} whip="r">
      <MetroPlatform t={t} px={0} edgeY={1260} train={{x: doorX - 330 - 75, doors: 1}} />
      {fr > 4 && <SideRow t={t} row={[{i: 7, x: 900, y: 1500, h: 700, ph: 1}]} />}
      <Pup outfit={DAVI_OUTFIT} x={inside ? doorX : x} y={inside ? 1235 : y} height={inside ? 470 : 520} light={METRO_LIGHT} pose={inside ? {shL: -20, shR: 20, elL: 30, elR: -30} : {...run(t, 0, 1), lean: 14}} expr={{smile: 0.6, lookX: inside ? 0 : 1}} />
      <Chip x={doorX} y={1560} text={`PORTA ${fmt(fr >= U ? doorLeft(t) : 1)} s`} k={kf(fr, [U, U + 4], [0, 1], easeOut)} color="#ffd23a" size={40} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 22. "antes da porta fechar." — the door shuts right behind him; the boss's hand slaps the glass. */
export const SPorta: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const F = ev(p, 'L13', 18);
  const doors = kf(fr, [F - 8, F], [1, 0], easeIn);
  const doorX = 470;
  const slap = F + 6;
  const bossX = kf(fr, [4, slap], [1300, 760], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.9, 2.0]} origin={[doorX + 75, 900]} pan={[0, 0, 0, 0]} pow={1} shakes={[{at: F, amp: 10, dur: 8}, {at: slap, amp: 12, dur: 8}]}>
      <MetroPlatform t={t} px={0} edgeY={1260} train={{x: doorX - 330 - 75 + 75, doors}} />
      {/* Davi behind the closing gap */}
      <AbsoluteFill style={{clipPath: `inset(0 ${1080 - (doorX + 75 + 75 * doors)}px 0 ${doorX + 75 - 75 * doors}px)`}}>
        <Pup outfit={DAVI_OUTFIT} x={doorX + 75} y={1225} height={470} light={METRO_LIGHT} pose={{shR: 140, elR: 30 + Math.sin(fr * 1.2) * 20, shL: -10}} expr={{smile: 0.8, halfSmile: 0.5}} />
      </AbsoluteFill>
      <Pup outfit={CHEFE} x={bossX} y={1360} height={620} light={METRO_LIGHT} pose={{shL: fr >= slap ? -100 : -40, elL: fr >= slap ? -10 : -40, ...run(t, 0, fr >= slap ? 0 : 0.7)}} expr={{}} />
      <Chip x={doorX + 75} y={1370} text={`PORTA ${fmt(doorLeft(t))} s`} k={1} color={doors < 0.05 ? '#ff3b3b' : '#ffd23a'} size={30} />
      <Flash k={kf(fr, [F, F + 1, F + 4], [0, 0.3, 0], (x) => x)} color="255,255,255" />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 23. "Na plataforma," — the train pulls away, the boss alone on the platform, Davi waves from the window. */
export const SPlataforma: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tx = -90 - Math.pow(fr, 1.6) * 3.2;
  const pitTop = 1260 - 120;
  const top = pitTop + 90 - 640;
  const wx = tx + 60 + 2 * 250;
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.05]} rot={[1, 0]} pow={1.4} whip="l">
      <MetroPlatform t={t} px={0} edgeY={1260} train={{x: tx, doors: 0}} />
      <Pup outfit={DAVI_OUTFIT} x={wx + 85} y={top + 110 + 300} height={260} upperOnly light={METRO_LIGHT} pose={{shR: 150, elR: 20 + Math.sin(fr * 1.3) * 25}} expr={{smile: 0.9}} />
      <SpeedLines k={kf(fr, [6, p.dur], [0, 0.4])} t={t} />
      <Pup outfit={CHEFE} x={780} y={1600} height={720} light={METRO_LIGHT} pose={{shL: -6, shR: 6}} expr={{}} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 24. "o chefe tentou fazer cara de bravo." — he strains, head trembles, face doesn't move. RAIVA 0%. */
export const SBravo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const strain = kf(fr, [4, 20], [0, 1]);
  const j = Math.sin(fr * 3.1) * 7 * strain;
  const cx = 540 + j;
  const cy = 940;
  const r = 300;
  const h = r / 0.122;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pow={1.3} whip="r">
      <AbsoluteFill style={{filter: 'blur(10px)'}}>
        <MetroPlatform t={t} px={-300} edgeY={1500} train={null} />
      </AbsoluteFill>
      <Pup outfit={CHEFE} x={cx} y={cy + 884 * (h / 1000)} height={h} upperOnly light={METRO_LIGHT} pose={{shL: -20, elL: 110, shR: 20, elR: -110}} expr={{}} />
      <Svg>
        <ellipse cx={cx} cy={cy - r * 0.2} rx={r * 0.95} ry={r * 0.9} fill="#ff3b3b" opacity={0.25 * strain} />
        <ellipse cx={cx - r * 0.25} cy={cy - r * 0.62} rx={r * 0.32} ry={r * 0.1} fill="#fff" opacity={0.45} transform={`rotate(-12 ${cx - r * 0.25} ${cy - r * 0.62})`} />
        {/* strain lines */}
        {[-1, 1].map((s) =>
          [0, 1, 2].map((i) => (
            <line key={`${s}${i}`} x1={cx + s * (r + 30)} y1={cy - 120 + i * 60} x2={cx + s * (r + 90 + Math.sin(fr + i) * 10)} y2={cy - 150 + i * 70} stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={strain} />
          )),
        )}
      </Svg>
      <Sweat x={cx} y={cy - r * 0.8} t={t} s={1.6} n={5} k={strain} />
      <ReadTag label="RAIVA" text="0%" x={90} y={1180} tx={cx - 80} ty={cy + 40} from={8} scale={1.3} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 25. "bravo. Não conseguiu." — forehead extreme close-up: one vein tries... and gives up. */
export const SVeia: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const N = ev(p, 'L14', 9);
  const grow = kf(fr, [2, 12], [0, 1], easeOut);
  const pulse = fr > 12 && fr < N + 2 ? 1 + 0.35 * Math.max(0, Math.sin((fr - 12) * 1.4)) : 1;
  const die = kf(fr, [N + 2, N + 16], [0, 1], easeIn);
  const r = 760;
  const cx = 540;
  const cy = 1280;
  const h = r / 0.122;
  const vx = 620;
  const vy0 = 900;
  const sag = die * 70;
  const d = `M ${vx},${vy0 - 160 + sag * 0.3} q -40,60 0,110 q 40,50 -10,${110 + sag * 0.5} q -30,40 ${10 - die * 30},${80 + sag}`;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} pow={1} origin={[600, 820]} shakes={[{at: 12, amp: 4, dur: 10}]}>
      <AbsoluteFill style={{background: '#1b1f24'}} />
      <Pup outfit={CHEFE} x={cx} y={cy + 884 * (h / 1000)} height={h} upperOnly light={METRO_LIGHT} expr={{}} />
      <Svg>
        <ellipse cx={cx - r * 0.25} cy={cy - r * 0.62} rx={r * 0.32} ry={r * 0.1} fill="#fff" opacity={0.4} transform={`rotate(-12 ${cx - r * 0.25} ${cy - r * 0.62})`} />
        <path d={d} stroke="#a85a6a" strokeWidth={(26 + 6 * (pulse - 1) * 3) * (1 - die * 0.55)} fill="none" strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - grow)} opacity={1 - die * 0.4} />
        <path d={d} stroke="#d98a96" strokeWidth={8 * (1 - die * 0.6)} fill="none" strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - grow)} opacity={0.7 * (1 - die * 0.5)} transform="translate(-6,-4)" />
        {/* tiny sad puff when it gives up */}
        {die > 0.3 && <circle cx={vx + 40} cy={vy0 + 140} r={20 + die * 30} fill="#fff" opacity={(1 - die) * 0.6} />}
      </Svg>
      <Chip x={540} y={1690} text={die > 0.2 ? 'VEIA: DESISTIU' : 'VEIA: TENTANDO…'} k={kf(fr, [6, 10], [0, 1], easeOut)} color={die > 0.2 ? '#ff6a4a' : '#ffd23a'} size={40} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};
