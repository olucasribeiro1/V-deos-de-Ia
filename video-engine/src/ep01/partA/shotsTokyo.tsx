import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {PlacedPuppet, PuppetSvg} from '../../characters/Puppet';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {Cam, project, horizonY} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, wobble} from '../../lib/anim';
import {Particles} from '../../fx/Particles';
import {Flash, Rastro} from '../../fx/Rastro';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {HUD_FONT} from '../../lib/fonts';
import {Cam2D, NEON_LIGHT, RedCan, ShotProps, SpeedLines, atS, wristR} from './kit';

const JP = 'IPAGothic, "IPAPGothic", sans-serif';
const NEON = ['#ff3fa4', '#38e1ff', '#ffd23f', '#7cff6b', '#ff7a2f', '#b47bff'];
const WORDS = ['ラーメン', 'カフェ', '薬', '居酒屋', 'ホテル', 'カラオケ', '寿司', '雑貨', '本', 'うどん'];

type Bld = {side: -1 | 1; z0: number; z1: number; h: number; color: string; seed: number};
const BUILDINGS: Bld[] = [];
for (const side of [-1, 1] as const) {
  let z = 3;
  let i = 0;
  while (z < 95) {
    const w = 6 + random(`tb-w-${side}-${i}`) * 6;
    BUILDINGS.push({side, z0: z, z1: z + w, h: 9 + random(`tb-h-${side}-${i}`) * 16, color: ['#1b1d33', '#22203a', '#191a2c', '#2a2240'][i % 4], seed: i * 2 + (side > 0 ? 1 : 0)});
    z += w;
    i++;
  }
}
type Sign = {side: -1 | 1; z: number; y0: number; y1: number; word: string; color: string};
const SIGNS: Sign[] = BUILDINGS.filter((b) => b.z0 > 4).map((b, i) => ({
  side: b.side,
  z: b.z0 + 1.5,
  y0: 3 + random(`sg-y-${i}`) * 1.5,
  y1: 0,
  word: WORDS[i % WORDS.length],
  color: NEON[i % NEON.length],
}));
SIGNS.forEach((s) => (s.y1 = s.y0 + 1.6 + s.word.length * 1.1));

export type StreetActor = {key: string; x: number; z: number; render: (p: {sx: number; sy: number; ppm: number}) => React.ReactNode};

const quad = (cam: Cam, pts: [number, number, number][]) => {
  const out = pts.map(([x, y, z]) => project(cam, x, y, Math.max(z, cam.z + 0.3)));
  if (out.some((p) => !p)) return null;
  return 'M' + out.map((p) => `${p!.sx.toFixed(1)},${p!.sy.toFixed(1)}`).join('L') + 'Z';
};

/** Generic neon street in Tokyo at night (no real brands). Pinhole camera like the Copacabana set. */
export const TokyoStreet: React.FC<{cam: Cam; t: number; actors?: StreetActor[]; blur?: number}> = ({cam, t, actors = [], blur = 0}) => {
  const hy = horizonY(cam);
  const FX = 5.5;
  type Item = {depth: number; node: React.ReactNode};
  const items: Item[] = [];
  BUILDINGS.forEach((b, i) => {
    if (b.z1 < cam.z + 0.3) return;
    const x = b.side * FX;
    const z0 = Math.max(b.z0, cam.z + 0.3);
    const d = quad(cam, [[x, 0, z0], [x, b.h, z0], [x, b.h, b.z1], [x, 0, b.z1]]);
    const front = quad(cam, [[x, 0, b.z0], [x, b.h, b.z0], [x + b.side * 3, b.h, b.z0], [x + b.side * 3, 0, b.z0]]);
    if (!d) return;
    const rows: React.ReactNode[] = [];
    for (let y = 3; y < b.h - 1; y += 2.6) {
      const lit = random(`row-${i}-${y}`);
      const q = quad(cam, [[x - b.side * 0.01, y, z0 + 0.4], [x - b.side * 0.01, y + 1.1, z0 + 0.4], [x - b.side * 0.01, y + 1.1, b.z1 - 0.4], [x - b.side * 0.01, y, b.z1 - 0.4]]);
      if (q) rows.push(<path key={y} d={q} fill={lit > 0.5 ? '#ffd9a0' : '#5a6aa8'} opacity={lit > 0.5 ? 0.55 : 0.25} />);
    }
    // shop front glow at street level
    const shop = quad(cam, [[x - b.side * 0.02, 0.2, z0 + 0.5], [x - b.side * 0.02, 2.6, z0 + 0.5], [x - b.side * 0.02, 2.6, b.z1 - 0.5], [x - b.side * 0.02, 0.2, b.z1 - 0.5]]);
    const awn = quad(cam, [[x - b.side * 0.02, 2.8, z0 + 0.3], [x - b.side * 0.02, 3.3, z0 + 0.3], [x - b.side * 0.02, 3.3, b.z1 - 0.3], [x - b.side * 0.02, 2.8, b.z1 - 0.3]]);
    items.push({
      depth: (b.z0 + b.z1) / 2 - cam.z + 2,
      node: (
        <g key={'b' + i}>
          {front && <path d={front} fill="#121325" />}
          <path d={d} fill={b.color} />
          {rows}
          {shop && <path d={shop} fill="#ffe2b0" opacity={0.7} />}
          {awn && <path d={awn} fill={NEON[(i + 2) % NEON.length]} opacity={0.9} />}
        </g>
      ),
    });
  });
  SIGNS.forEach((s, i) => {
    if (s.z < cam.z + 0.5) return;
    const xa = s.side * (FX - 0.05);
    const xb = s.side * (FX - 1.0);
    const a = project(cam, xa, s.y1, s.z);
    const b = project(cam, xb, s.y0, s.z);
    if (!a || !b) return;
    const x0 = Math.min(a.sx, b.sx);
    const w = Math.abs(a.sx - b.sx);
    const h = b.sy - a.sy;
    const fs = w * 0.62;
    const flick = 0.85 + 0.15 * Math.sin(t * 9 + i * 3);
    const g = project(cam, (xa + xb) / 2, 0, s.z);
    items.push({
      depth: s.z - cam.z,
      node: (
        <g key={'s' + i} opacity={flick}>
          <rect x={x0 - w * 0.3} y={a.sy - w * 0.3} width={w * 1.6} height={h + w * 0.6} rx={w * 0.3} fill={s.color} opacity={0.35} filter="url(#tk-glow)" />
          <rect x={x0} y={a.sy} width={w} height={h} rx={w * 0.12} fill="#120d1c" stroke={s.color} strokeWidth={Math.max(1.5, w * 0.08)} />
          {s.word.split('').map((c, k) => (
            <text key={k} x={x0 + w / 2} y={a.sy + w * 0.35 + (k + 0.5) * ((h - w * 0.4) / s.word.length) + fs * 0.35} textAnchor="middle" fontFamily={JP} fontSize={fs} fill="#fff" stroke={s.color} strokeWidth={fs * 0.06}>
              {c}
            </text>
          ))}
          {/* wet-ground reflection */}
          {g && <rect x={x0} y={g.sy} width={w} height={h * 0.9} fill={s.color} opacity={0.22} filter="url(#tk-glow)" />}
        </g>
      ),
    });
  });
  actors.forEach((ac) => {
    const pr = project(cam, ac.x, 0, ac.z);
    if (!pr) return;
    items.push({depth: pr.depth, node: <React.Fragment key={ac.key}>{ac.render({sx: pr.sx, sy: pr.sy, ppm: pr.ppm})}</React.Fragment>});
  });
  items.sort((p, q) => q.depth - p.depth);
  const svgItems = items.filter((it) => React.isValidElement(it.node) && (it.node as React.ReactElement).type === 'g');
  const actorItems = items.filter((it) => !svgItems.includes(it));
  const road = quad(cam, [[-3.8, 0, cam.z + 0.3], [3.8, 0, cam.z + 0.3], [3.8, 0, 200], [-3.8, 0, 200]]);
  const walk = quad(cam, [[-FX, 0, cam.z + 0.3], [FX, 0, cam.z + 0.3], [FX, 0, 200], [-FX, 0, 200]]);
  const stripes = Array.from({length: 18}).map((_, k) => quad(cam, [[-0.12, 0, 4 + k * 5], [0.12, 0, 4 + k * 5], [0.12, 0, 6.5 + k * 5], [-0.12, 0, 6.5 + k * 5]]));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#0a0b1e', filter: blur ? `blur(${blur}px)` : undefined}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="tk-sky" x1="0" x2="0" y1={hy - 1400} y2={hy} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#07081a" />
            <stop offset="0.7" stopColor="#2a1745" />
            <stop offset="1" stopColor="#6b2d6a" />
          </linearGradient>
          <filter id="tk-glow" filterUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3}>
            <feGaussianBlur stdDeviation={10} />
          </filter>
        </defs>
        <rect x={0} y={0} width={W} height={hy + 2} fill="url(#tk-sky)" />
        {Array.from({length: 22}).map((_, i) => {
          const h = 80 + random(`sky-${i}`) * 260;
          return <rect key={i} x={i * 52 - 30} y={hy - h} width={50} height={h} fill="#160f2c" />;
        })}
        {walk && <path d={walk} fill="#242338" />}
        {road && <path d={road} fill="#121222" />}
        {stripes.map((d, k) => (d ? <path key={k} d={d} fill="#d8d6e8" opacity={0.5} /> : null))}
        {svgItems.map((it) => it.node)}
      </svg>
      {actorItems.map((it, i) => (
        <React.Fragment key={i}>{it.node}</React.Fragment>
      ))}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) ${((hy - 200) / H) * 100}%, rgba(255,80,180,0.18) ${(hy / H) * 100}%, rgba(0,0,0,0) ${((hy + 300) / H) * 100}%)`, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

const STAND = {x: 0.2, z: 8};
const CAN_POSE = {shR: 40, elR: 75};

/** Davi standing in Tokyo with the arm out (holding / just lost the can). */
const DaviAt: React.FC<{sx: number; sy: number; ppm: number; can: boolean; expr?: object; pose?: object}> = ({sx, sy, ppm, can, expr, pose}) => {
  const wr = wristR(CAN_POSE.shR, CAN_POSE.elR);
  return (
    <PlacedPuppet outfit={DAVI_OUTFIT} light={NEON_LIGHT} x={sx} y={sy} height={ppm * 1.75} pose={{facing: 0.1, shL: -9, ...CAN_POSE, ...pose}} expr={{halfSmile: 0.3, ...expr}}>
      {can && (
        <g transform={`translate(${wr[0] + 6},${wr[1] - 30}) scale(0.62)`}>
          <RedCan />
        </g>
      )}
    </PlacedPuppet>
  );
};

/** S16 — "chegou parado": Tokyo street, Davi appears standing still. */
export const S16Arrive: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 17;
  const p = kf(frame, [0, d], [0, 1], easeOut);
  const cam: Cam = {x: -0.4 + p * 0.3, y: 1.5, z: 0.5 + p * 2.6, pitch: -2, f: 1350, cy: H * 0.5};
  const foot = project(cam, STAND.x, 0, STAND.z)!;
  return (
    <Cam2D d={d} zoom={[1.02, 1.08]} shakes={[{at: 0, dur: 10, amp: 16}]}>
      <TokyoStreet cam={cam} t={t} actors={[{key: 'davi', ...STAND, render: (q) => <DaviAt {...q} can expr={{eyesWide: kf(frame, [6, 12], [0, 0.5])}} />}]} />
      <Rastro x={foot.sx} y={foot.sy} height={foot.ppm * 1.85} life={kf(frame, [0, 20], [0.1, 0.99], (x) => x)} frame={frame} seed="a16" />
      <Flash k={kf(frame, [0, 1, 6], [0, 0.8, 0], (x) => x)} />
      <Particles t={t} seed="a16p" count={20} bokeh={10} color="255,180,230" bokehColor="255,90,200" driftX={-10} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** S17 — "A lata, não.": close on the hand, the can rips away in slow motion. HUD LATA 2.900 km/h. */
export const S17CanRip: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 18;
  const rip = 3;
  const q = clamp((frame - rip) / (d - rip));
  const cx = 470 + Math.pow(q, 1.6) * 760;
  const cy = 980 - q * 40;
  const spin = q * 160;
  const skin = DAVI_OUTFIT.skin;
  const open = kf(frame, [rip, rip + 5], [0, 1], easeOut);
  return (
    <Cam2D d={d} zoom={[1.06, 1.12]} shakes={[{at: rip, dur: 12, amp: 20}]} punches={[{at: rip, amt: 0.06}]}>
      <TokyoStreet cam={{x: 1.4, y: 1.4, z: 3, pitch: 0, f: 1400, cy: H * 0.5}} t={t} blur={14} />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        {/* sleeve + hand (fingers spring open) */}
        <path d="M-80,1250 L250,1060 L330,1180 L-40,1420 Z" fill={DAVI_OUTFIT.top.base} />
        <path d="M250,1060 L330,1180 L300,1200 L222,1080 Z" fill={DAVI_OUTFIT.top.shade} />
        <g transform="translate(330,1080) rotate(-28)">
          <rect x={-10} y={-70} width={130} height={140} rx={60} fill={skin.base} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`rotate(${-open * (20 + i * 8)} 100 ${-48 + i * 32})`}>
              <rect x={90} y={-62 + i * 32} width={110 - (i === 3 ? 20 : 0)} height={30} rx={15} fill={i % 2 ? skin.shade : skin.base} />
            </g>
          ))}
          <rect x={20} y={-110} width={90} height={40} rx={20} fill={skin.light} transform={`rotate(${-open * 30} 30 -90)`} />
        </g>
        {/* motion trail */}
        {q > 0 && (
          <g>
            <path d={`M${400},${990} L${cx},${cy - 110} L${cx},${cy + 110} Z`} fill="#ff3b3b" opacity={0.18} />
            {Array.from({length: 7}).map((_, i) => (
              <rect key={i} x={420 + i * 10} y={cy - 90 + i * 28} width={Math.max(0, cx - 460 - i * 10)} height={6} rx={3} fill="#fff" opacity={0.25} />
            ))}
          </g>
        )}
        {/* soda droplets */}
        {Array.from({length: 22}).map((_, i) => {
          const a = random(`sd-${i}`);
          const dx = (cx - 470) * (0.3 + a * 0.6);
          return q > 0.05 ? <circle key={i} cx={470 + dx} cy={980 + (random(`sdy-${i}`) - 0.5) * 220 * q} r={4 + a * 8} fill="#ffb1a1" opacity={0.7 * (1 - a * 0.5)} /> : null;
        })}
        <g transform={`translate(${cx},${cy}) rotate(${90 + spin}) scale(1.6)`}>
          <RedCan />
        </g>
      </svg>
      <SpeedLines t={t} dir="left" count={20} opacity={0.35} seed="a17" speed={-800} />
      <HudLabel label="LATA" value={2900} unit="km/h" x={120} y={560} tx={cx} ty={cy - 80} from={rip + 4} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** S18 — tracking the can in slow motion; it punches through the shop wall. */
export const S18Impact: React.FC<ShotProps> = ({start, d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 19;
  const hit = atS(start, 19.38);
  const wallX = kf(frame, [hit - 10, hit], [W + 200, 640], easeIn);
  const after = frame >= hit;
  const canX = after ? 660 : 480 + kf(frame, [0, hit], [0, 1]) * 120;
  return (
    <Cam2D d={d} zoom={[1.05, 1.12]} shakes={[{at: hit, dur: 14, amp: 34, seed: 7}]} punches={[{at: hit, amt: 0.1, dur: 12}]} whip="right">
      <AbsoluteFill style={{transform: `translateX(${-(frame * 40) % 600}px)`, width: W + 600}}>
        <TokyoStreet cam={{x: -2 + frame * 0.25, y: 1.2, z: 6, pitch: 0, f: 1100, cy: H * 0.5}} t={t} blur={10} />
      </AbsoluteFill>
      <SpeedLines t={t} dir="left" count={46} opacity={0.6} seed="a18" speed={3600} />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        {!after && (
          <g transform={`translate(${canX},960) rotate(${90 + frame * 10}) scale(1.5)`}>
            <RedCan />
          </g>
        )}
        {/* wall coming in */}
        <rect x={wallX} y={-100} width={900} height={H + 200} fill="#c9c1b6" />
        <rect x={wallX} y={-100} width={40} height={H + 200} fill="#8f877e" />
        {Array.from({length: 22}).map((_, i) => (
          <rect key={i} x={wallX + 40} y={i * 92 - 40} width={900} height={4} fill="#a69e94" />
        ))}
        {after && (
          <g>
            <ellipse cx={660} cy={960} rx={70} ry={110} fill="#1a1414" />
            {Array.from({length: 9}).map((_, i) => {
              const a = (i / 9) * Math.PI * 2;
              return <path key={i} d={`M${660 + Math.cos(a) * 60},${960 + Math.sin(a) * 90} l${Math.cos(a) * 140},${Math.sin(a) * 160}`} stroke="#5a524a" strokeWidth={5} />;
            })}
            {Array.from({length: 30}).map((_, i) => {
              const a = (random(`db-a-${i}`) - 0.5) * Math.PI * 1.4 + Math.PI;
              const s = (frame - hit) * (10 + random(`db-s-${i}`) * 30);
              return <rect key={i} x={660 + Math.cos(a) * s} y={960 + Math.sin(a) * s + (frame - hit) ** 2 * 1.2} width={10 + random(`db-w-${i}`) * 18} height={8 + random(`db-h-${i}`) * 12} fill={i % 3 ? '#b9b0a4' : '#7d756b'} />;
            })}
          </g>
        )}
      </svg>
      {after && (
        <AbsoluteFill style={{background: `radial-gradient(circle at 61% 50%, rgba(230,220,205,${0.8 * clamp(1 - (frame - hit) / 18)}) 0%, rgba(230,220,205,0) ${20 + (frame - hit) * 3}%)`}} />
      )}
      <Flash k={kf(frame, [hit, hit + 1, hit + 5], [0, 0.9, 0], (x) => x)} color="255,240,220" />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** S19 — "de uma loja.": shop wall with a can-sized hole, dust, Davi's silhouette in front. */
export const S19Hole: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 20;
  const hx = 640;
  const hy = 930;
  return (
    <Cam2D d={d} zoom={[1.0, 1.14]} origin={[hx, hy]} shakes={[{at: 0, dur: 10, amp: 12}]} whip="zoom">
      <AbsoluteFill style={{background: '#100c1c'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="hole-l" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff2c8" />
            <stop offset="1" stopColor="#ffb85c" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* facade */}
        <rect x={-20} y={300} width={W + 40} height={1400} fill="#b8afa6" />
        {Array.from({length: 16}).map((_, i) => (
          <rect key={i} x={-20} y={340 + i * 86} width={W + 40} height={5} fill="#9a9188" />
        ))}
        {/* neon shop sign */}
        <rect x={150} y={420} width={520} height={150} rx={16} fill="#120d1c" stroke="#ff3fa4" strokeWidth={8} />
        <rect x={130} y={400} width={560} height={190} rx={30} fill="#ff3fa4" opacity={0.18} />
        <text x={410} y={530} textAnchor="middle" fontFamily={JP} fontSize={104} fill="#fff" stroke="#ff3fa4" strokeWidth={4}>
          雑貨
        </text>
        {/* shop window */}
        <rect x={60} y={1180} width={960} height={420} fill="#ffe2b0" opacity={0.75} />
        <rect x={60} y={1180} width={960} height={30} fill="#38e1ff" />
        {/* hole */}
        <circle cx={hx} cy={hy} r={150} fill="url(#hole-l)" opacity={0.6} />
        <path d={`M${hx - 52},${hy - 70} L${hx + 10},${hy - 82} L${hx + 58},${hy - 40} L${hx + 50},${hy + 60} L${hx - 10},${hy + 84} L${hx - 60},${hy + 30} Z`} fill="#140e0c" />
        <path d={`M${hx - 40},${hy - 50} L${hx + 30},${hy - 60} L${hx + 40},${hy + 40} L${hx - 30},${hy + 60} Z`} fill="#ffcf7a" opacity={0.85} />
        {Array.from({length: 11}).map((_, i) => {
          const a = (i / 11) * Math.PI * 2 + 0.3;
          const l = 120 + random(`ck-${i}`) * 160;
          return <path key={i} d={`M${hx + Math.cos(a) * 60},${hy + Math.sin(a) * 70} l${Math.cos(a + 0.2) * l * 0.5},${Math.sin(a + 0.2) * l * 0.5} l${Math.cos(a - 0.2) * l * 0.5},${Math.sin(a - 0.2) * l * 0.5}`} stroke="#4e463f" strokeWidth={5} fill="none" />;
        })}
      </svg>
      {/* dust clouds */}
      <svg width={W} height={H} style={{position: 'absolute', filter: 'blur(14px)'}}>
        {Array.from({length: 16}).map((_, i) => {
          const a = random(`du-a-${i}`) * Math.PI * 2;
          const s = 40 + (frame + 6) * (4 + random(`du-s-${i}`) * 6);
          return <circle key={i} cx={hx + Math.cos(a) * s * 0.8} cy={hy + Math.sin(a) * s * 0.6 + frame * 1.5} r={50 + frame * 3 + random(`du-r-${i}`) * 50} fill="#d9cfc2" opacity={0.55 * clamp(1 - frame / 50)} />;
        })}
      </svg>
      {/* debris falling */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={hx - 80 + random(`fd-${i}`) * 160} y={hy + 60 + ((frame + 4) * (8 + random(`fv-${i}`) * 10))} width={8} height={8} fill="#8f877e" transform={`rotate(${frame * 12 + i * 40} ${hx} ${hy})`} />
        ))}
      </svg>
      {/* Davi silhouette in the foreground */}
      <AbsoluteFill style={{filter: 'blur(5px)'}}>
        <PuppetSvg outfit={DAVI_OUTFIT} light={NEON_LIGHT} height={1700} upperOnly pose={{facing: 0.4, ...CAN_POSE, shL: -6}} expr={{eyesWide: 0.8}} style={{left: -300, top: 760}} />
      </AbsoluteFill>
      <Particles t={t} seed="a19" count={30} bokeh={6} color="240,225,210" driftX={-6} />
      <Finish vignette={0.65} />
    </Cam2D>
  );
};

/** S29 — "O salto acerta a velocidade": Davi's body glows green, scanned ✓. */
export const S29Body: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 31;
  const p = kf(frame, [0, d], [0, 1], easeOut);
  const cam: Cam = {x: STAND.x - 0.1, y: 1.1, z: STAND.z - 3.6 + p * 0.6, pitch: -1, f: 1500, cy: H * 0.52};
  const foot = project(cam, STAND.x, 0, STAND.z)!;
  const hpx = foot.ppm * 1.75;
  const scan = kf(frame, [2, 20], [0, 1]);
  const scanY = foot.sy - hpx * 1.1 + scan * hpx * 1.15;
  const ok = kf(frame, [18, 24], [0, 1], easeOut);
  return (
    <Cam2D d={d} zoom={[1.0, 1.06]} whip="left">
      <TokyoStreet cam={cam} t={t} blur={4} actors={[{key: 'davi', ...STAND, render: (q) => <DaviAt {...q} can={false} pose={{shR: 12, elR: -10}} expr={{halfSmile: 0.2}} />}]} />
      <AbsoluteFill style={{mixBlendMode: 'screen', clipPath: `inset(0 0 ${H - scanY}px 0)`}}>
        <PuppetSvg outfit={DAVI_OUTFIT} height={hpx} pose={{facing: 0.1, shL: -9, shR: 12, elR: -10}} ghost={{opacity: 1, color: '#5dff8a'}} style={{left: foot.sx - 350 * (hpx / 1000), top: foot.sy - 1100 * (hpx / 1000)}} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {scan < 1 && <rect x={0} y={scanY - 3} width={W} height={6} fill="#5dff8a" opacity={0.9} />}
        {scan < 1 && <rect x={0} y={scanY - 60} width={W} height={60} fill="#5dff8a" opacity={0.12} />}
      </svg>
      {ok > 0 && (
        <div style={{position: 'absolute', left: foot.sx + hpx * 0.2, top: 620, transform: `scale(${0.6 + ok * 0.4})`, opacity: ok, fontFamily: HUD_FONT, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>
          <div style={{fontSize: 24, letterSpacing: 3, fontWeight: 700}}>VELOCIDADE</div>
          <div style={{fontSize: 70, fontWeight: 700, color: '#5dff8a'}}>✓ CORPO</div>
        </div>
      )}
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** S30 — "Do resto,": Davi looks at his empty hand. */
export const S30EmptyHand: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 33;
  return (
    <Cam2D d={d} zoom={[1.0, 1.12]} origin={[700, 900]} roll={[2, -1]} whip="right">
      <TokyoStreet cam={{x: 0.2, y: 1.5, z: 3, pitch: 0, f: 1400, cy: H * 0.5}} t={t} blur={12} />
      <PuppetSvg
        outfit={DAVI_OUTFIT}
        light={NEON_LIGHT}
        height={1900}
        upperOnly
        pose={{facing: 0.35, headTilt: 10, shR: 35, elR: 105, shL: -8}}
        expr={{lookX: 0.9, lookY: 1, browTilt: 0.6, browRaise: 0.4, mouthOpen: 0.15}}
        style={{left: 540 - 350 * 1.9 - 60, top: 1950 - 1100 * 1.9}}
      />
      <Particles t={t} seed="a30" count={18} bokeh={10} color="255,180,230" bokehColor="255,90,200" driftX={-10} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};
