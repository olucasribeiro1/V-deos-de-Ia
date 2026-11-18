import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Copacabana} from '../../environments/Copacabana';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {PuppetSvg} from '../../characters/Puppet';
import {Cam, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Particles} from '../../fx/Particles';
import {Flash, Rastro} from '../../fx/Rastro';
import {AirMolecules} from '../../fx/AirMolecules';
import {Shockwave} from '../../fx/Shockwave';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {DAVI_SPOT} from '../../scenes/Shot1Calcadao';
import {BandSafe, Rig, ShotP, ev} from './rig';
import {Flock} from './kit';

const abs = (p: ShotP, fr: number) => 34.76 + (p.from + fr) / 30;

/** Dashed empty silhouette of Davi (the hole left in the air). */
const Ghost: React.FC<{sx: number; sy: number; hpx: number; o: number; fill?: number}> = ({sx, sy, hpx, o, fill = 0}) => (
  <AbsoluteFill style={{mixBlendMode: 'screen'}}>
    <PuppetSvg
      height={hpx}
      outfit={DAVI_OUTFIT}
      pose={{facing: 0.1, shL: -15, shR: 15}}
      ghost={{opacity: o, color: '#8fd3ff', dash: 22}}
      style={{left: sx - 350 * (hpx / 1000), top: sy - 1100 * (hpx / 1000), filter: `drop-shadow(0 0 ${8 + fill * 20}px rgba(120,200,255,0.9))`}}
    />
  </AbsoluteFill>
);

/* 1. "E todo salto" — Davi blinks out in the Rastro, fast dolly-in. */
export const SVanish: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const V = ev(p, 'L9', 2);
  const k = easeOut(clamp(fr / p.dur));
  const cam: Cam = {x: DAVI_SPOT.x - 0.9 + k * 0.5, y: 1.15, z: DAVI_SPOT.z - 7.5 + k * 2.6, pitch: -2, f: 1650, cy: H * 0.5};
  const foot = project(cam, DAVI_SPOT.x, 0, DAVI_SPOT.z)!;
  const hpx = foot.ppm * 1.75;
  const gone = fr >= V;
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.1]} shakes={[{at: V, dur: 12, amp: 18}]} punches={[{at: V, amt: 0.08}]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={foot.depth}
        aperture={9}
        actors={[
          {
            key: 'davi',
            x: DAVI_SPOT.x,
            z: DAVI_SPOT.z,
            shadow: gone ? 0 : 1,
            render: ({sx, sy, ppm}) =>
              gone ? null : (
                <PlacedDavi x={sx} y={sy} height={ppm * 1.75} pose={{bob: 6, facing: 0.1, shL: -12, shR: 12}} expr={{blink: kf(fr, [V - 4, V - 1], [0, 1]), halfSmile: 0.9, smile: 0.2, browAsym: 0.4}} />
              ),
          },
        ]}
      />
      {gone && <Ghost sx={foot.sx} sy={foot.sy} hpx={hpx} o={kf(fr, [V, V + 4], [0, 1])} />}
      <Rastro x={foot.sx} y={foot.sy} height={hpx * 1.05} life={(fr - V + 1) / 26} frame={fr} seed="b1" />
      <Flash k={kf(fr, [V, V + 1, V + 6], [0, 0.85, 0], (x) => x)} />
      <Particles t={t} seed="b1p" count={24} bokeh={5} driftX={-12} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** Shared close framing on the hole (chest height), used by ghost/rush. */
const holeCam = (k: number, dist: number, dx = 0): Cam => ({x: DAVI_SPOT.x + dx, y: 1.0, z: DAVI_SPOT.z - dist, pitch: -2, f: 1650, cy: H * 0.5 + k});

/* 2. "buraco do tamanho dele" — empty dashed silhouette + measuring brackets. */
export const SGhost: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = easeOut(clamp(fr / p.dur));
  const cam = holeCam(0, lerp(4.6, 3.6, k), lerp(0.5, 0.15, k));
  const foot = project(cam, DAVI_SPOT.x, 0, DAVI_SPOT.z)!;
  const hpx = foot.ppm * 1.75;
  const top = foot.sy - hpx * 1.02;
  const br = kf(fr, [ev(p, 'L9', 7), ev(p, 'L9', 7) + 8], [0, 1], easeOut);
  const bx = foot.sx + hpx * 0.34;
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.16]} rot={[-1.5, 0]} pan={[30, 0, 0, 0]}>
      <Copacabana cam={cam} t={t} focus={foot.depth} aperture={14} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse ${hpx * 0.32}px ${hpx * 0.6}px at ${foot.sx}px ${foot.sy - hpx * 0.5}px, rgba(10,30,70,0.45), rgba(10,30,70,0))`}} />
      <Ghost sx={foot.sx} sy={foot.sy} hpx={hpx} o={0.95 + Math.sin(fr * 0.7) * 0.05} fill={0.5} />
      {/* height bracket */}
      <svg width={W} height={H} style={{position: 'absolute', opacity: br}}>
        <g stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.9}>
          <line x1={bx} y1={foot.sy} x2={bx} y2={lerp(foot.sy, top, br)} />
          <line x1={bx - 16} y1={foot.sy} x2={bx + 16} y2={foot.sy} />
          {br > 0.95 && <line x1={bx - 16} y1={top} x2={bx + 16} y2={top} />}
          <line x1={foot.sx - hpx * 0.2} y1={foot.sy + 24} x2={lerp(foot.sx - hpx * 0.2, foot.sx + hpx * 0.2, br)} y2={foot.sy + 24} strokeDasharray="10 8" />
        </g>
      </svg>
      <Particles t={t} seed="b2p" count={20} bokeh={6} driftX={-20} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 3. "no ar. Setenta..." — molecules start rushing to the hole; HUD VÁCUO 70 L. */
export const SRush: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = easeOut(clamp(fr / p.dur));
  const cam = holeCam(0, lerp(5.4, 4.6, k), lerp(-0.4, -0.2, k));
  const foot = project(cam, DAVI_SPOT.x, 0, DAVI_SPOT.z)!;
  const hpx = foot.ppm * 1.75;
  const chestY = foot.sy - hpx * 0.6;
  const prog = lerp(0, 0.45, clamp(fr / p.dur));
  return (
    <Rig dur={p.dur} whip="r" zoom={[1.04, 1.12]}>
      <Copacabana cam={cam} t={t} focus={foot.depth} aperture={12} />
      <Ghost sx={foot.sx} sy={foot.sy} hpx={hpx} o={0.85} />
      <BandSafe>
        <AirMolecules cx={foot.sx} cy={chestY} rx={hpx * 0.2} ry={hpx * 0.42} spread={3} progress={prog} count={46} size={hpx * 0.02} t={t} seed="b3" />
      </BandSafe>
      <HudLabel label="VÁCUO" value={70} unit="L" x={110} y={590} tx={foot.sx - hpx * 0.05} ty={chestY} from={ev(p, 'L9', 11)} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 4. "litros de vácuo" — extreme close into the empty void, molecules streaking in. */
export const SVoid: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const cam = holeCam(0, 1.7, 0.05);
  const c = {x: 540, y: 1000};
  const prog = lerp(0.35, 0.72, easeIn(clamp(fr / p.dur)));
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.35]} pow={1.3} origin={[c.x, c.y]} rot={[2, -2]}>
      <AbsoluteFill style={{transform: 'scale(1.1)'}}>
        <Copacabana cam={cam} t={t} focus={0.4} aperture={26} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 330px 560px at ${c.x}px ${c.y}px, rgba(4,10,30,${0.75 + 0.15 * Math.sin(fr * 0.5)}) 0%, rgba(8,24,60,0.6) 55%, rgba(10,30,70,0) 100%)`}} />
      <svg width={W} height={H} style={{position: 'absolute', mixBlendMode: 'screen'}}>
        <ellipse cx={c.x} cy={c.y} rx={340} ry={580} fill="none" stroke="#8fd3ff" strokeWidth={6} strokeDasharray="30 20" opacity={0.8} strokeDashoffset={fr * 4} />
      </svg>
      <BandSafe>
        <AirMolecules cx={c.x} cy={c.y} rx={330} ry={560} spread={2.2} progress={prog} count={40} size={34} t={t} seed="b4" />
      </BandSafe>
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 5. "O ar fecha o buraco" — molecules slam into the centre, hot spot. */
export const SCollapse: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const cam = holeCam(0, 2.6, -0.1);
  const foot = project(cam, DAVI_SPOT.x, 0, DAVI_SPOT.z)!;
  const hpx = foot.ppm * 1.75;
  const cy = foot.sy - hpx * 0.6;
  const F = ev(p, 'L10', 2);
  const prog = kf(fr, [0, F, F + 12], [0.55, 0.75, 1], easeIn);
  const ghostO = kf(fr, [F, F + 12], [0.8, 0]);
  const hot = kf(fr, [F + 8, p.dur], [0, 1], easeIn);
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.3]} pow={1.2} origin={[foot.sx, cy]} whip="u" shakes={[{at: F, dur: 30, amp: 6}]}>
      <AbsoluteFill style={{transform: 'scale(1.05)'}}>
        <Copacabana cam={cam} t={t} focus={foot.depth} aperture={16} />
      </AbsoluteFill>
      <Ghost sx={foot.sx} sy={foot.sy} hpx={hpx} o={ghostO} />
      <BandSafe>
        <AirMolecules cx={foot.sx} cy={cy} rx={hpx * 0.2 * (1 - prog * 0.85)} ry={hpx * 0.42 * (1 - prog * 0.85)} spread={2.6} progress={prog} count={60} size={hpx * 0.024} t={t} seed="b5" />
      </BandSafe>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${foot.sx}px ${cy}px, rgba(255,255,255,${hot}) 0%, rgba(190,230,255,${hot * 0.6}) ${4 + hot * 6}%, rgba(190,230,255,0) ${10 + hot * 22}%)`, mixBlendMode: 'screen'}} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 6. "e estala" — high wide: shock rings + pigeons burst, heavy shake. */
export const SBang: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const B = ev(p, 'L10', 6);
  const k = clamp(fr / p.dur);
  const cam: Cam = {x: DAVI_SPOT.x + 0.5 - k * 0.6, y: 3.8 - k * 0.5, z: DAVI_SPOT.z - 8 + k * 1.2, pitch: 16, f: 1450, cy: H * 0.5};
  const c = project(cam, DAVI_SPOT.x, 1.0, DAVI_SPOT.z)!;
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.1]} shakes={[{at: B, dur: 24, amp: 34}]} punches={[{at: B, amt: 0.1, len: 10}]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={c.depth}
        aperture={7}
        actors={[
          {
            key: 'birds',
            x: DAVI_SPOT.x,
            z: DAVI_SPOT.z + 0.01,
            sharp: true,
            render: ({sx, sy, ppm}) => (
              <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <Flock frame={fr} start={B} ox={sx} oy={sy + ppm * 0.6} count={16} spread={ppm * 3.4} size={ppm * 0.34} seed="bb" speed={1.4} />
              </svg>
            ),
          },
        ]}
      />
      <Shockwave cx={c.sx} cy={c.sy} age={fr - B} rings={5} speed={40} gap={4} maxR={1800} ground={{cam, x: DAVI_SPOT.x, z: DAVI_SPOT.z, speed: 0.55}} />
      <Flash k={kf(fr, [B, B + 1, B + 6], [0, 0.85, 0], (x) => x)} color="255,240,220" />
      <Particles t={t} seed="b6p" count={30} bokeh={5} driftX={18} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 7. "Cento e quarenta decibéis" — kiosk window glass trembling and cracking. HUD 140 dB. */
export const SGlass: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const C = ev(p, 'L10', 9);
  const decay = Math.exp(-fr / 18);
  const vib = Math.sin(fr * 2.6) * 14 * decay;
  const crack = kf(fr, [C, C + 6], [0, 1], easeOut);
  const cx = 600;
  const cy = 980;
  const cracks = Array.from({length: 9}).map((_, i) => {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const pts: string[] = [`M${cx},${cy}`];
    let x = cx;
    let y = cy;
    for (let s = 1; s <= 5; s++) {
      const aa = a + Math.sin(i * 7 + s * 3) * 0.35;
      const l = (60 + ((i * 31 + s * 17) % 50)) * crack;
      x += Math.cos(aa) * l;
      y += Math.sin(aa) * l;
      pts.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  });
  return (
    <Rig dur={p.dur} whip="l" zoom={[1.08, 1.18]} shakes={[{at: 0, dur: 30, amp: 14}, {at: C, dur: 10, amp: 16}]} punches={[{at: C, amt: 0.07}]}>
      {/* warm interior behind the glass */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #ffe0a0 0%, #f2a65a 60%, #8a4b2a 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', filter: 'blur(5px)'}}>
        {Array.from({length: 7}).map((_, i) => (
          <g key={i}>
            <rect x={120 + i * 130} y={700 + (i % 2) * 40} width={60} height={200} rx={20} fill={['#2f7a5a', '#c0392b', '#f6c46a', '#5b2a6e'][i % 4]} opacity={0.8} />
            <rect x={130 + i * 130} y={660 + (i % 2) * 40} width={40} height={50} rx={8} fill="#e9e1d4" opacity={0.8} />
          </g>
        ))}
        <rect x={0} y={1180} width={W} height={60} fill="#5a4a44" />
      </svg>
      {/* glass pane (vibrating) */}
      <AbsoluteFill style={{transform: `translate(${vib}px, ${vib * 0.3}px) skewX(${vib * 0.05}deg)`}}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="b7g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={0.05} />
              <stop offset="0.45" stopColor="#ffd9b0" stopOpacity={0.35} />
              <stop offset="0.5" stopColor="#fff" stopOpacity={0.05} />
              <stop offset="1" stopColor="#ffb07a" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <rect x={60} y={300} width={960} height={1260} fill="url(#b7g)" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${200 + i * 220 + vib * 3},300 l 140,0 l -420,1260 l -140,0 Z`} fill="#fff" opacity={0.12 - i * 0.03} />
          ))}
          {/* ripple rings on the glass */}
          {[0, 1, 2, 3].map((i) => {
            const r = ((fr * 22 + i * 120) % 520) + 20;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={3} opacity={0.35 * (1 - r / 540) * decay} />;
          })}
          {crack > 0 && cracks.map((d, i) => <path key={i} d={d} stroke="#fff" strokeWidth={3.5} fill="none" opacity={0.9} strokeLinejoin="round" />)}
          {crack > 0 && <circle cx={cx} cy={cy} r={60 * crack} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.7} />}
        </svg>
      </AbsoluteFill>
      {/* window frame */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <path fillRule="evenodd" d={`M-50,-50 H1130 V1970 H-50 Z M60,300 H1020 V1560 H60 Z`} fill="#e9e1d4" />
        <rect x={52} y={292} width={976} height={1276} fill="none" stroke="#cfc5b6" strokeWidth={18} />
        <rect x={0} y={1560} width={W} height={400} fill="#2f7a5a" />
        <rect x={0} y={1560} width={W} height={24} fill="#c9bba8" />
        <rect x={0} y={0} width={W} height={300} fill="#f2efe8" />
        {Array.from({length: 8}).map((_, i) => (
          <rect key={i} x={i * 140} y={0} width={70} height={240} fill="#2f7a5a" opacity={0.85} />
        ))}
      </svg>
      <HudLabel label="ESTALO" value={140} unit="dB" x={W - 100} y={560} align="right" tx={cx} ty={cy} from={ev(p, 'L10', 9) - 6} />
      <Particles t={t} seed="b7p" count={16} bokeh={4} driftX={-10} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 8. "Um tiro do lado do ouvido" — ear close-up, starter pistol fires up next to it. */
export const SEar: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const S = ev(p, 'L10', 12);
  const O = ev(p, 'L10', 16);
  const skin = DAVI_OUTFIT.skin;
  const canal = {x: 640, y: 1000};
  const flash = kf(fr, [S, S + 1, S + 5], [0, 1, 0], (x) => x);
  const smoke = clamp((fr - S) / 30);
  const gunIn = kf(fr, [0, 8], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} origin={[canal.x, canal.y]} shakes={[{at: S, dur: 16, amp: 26}]} punches={[{at: S, amt: 0.1}, {at: O, amt: 0.28, len: 14}]}>
      <AbsoluteFill style={{background: `linear-gradient(100deg, ${skin.shade} 0%, ${skin.base} 45%, ${skin.light} 100%)`}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* hair */}
        <path d="M 0,0 H 1080 V 520 Q 860,640 700,560 Q 520,480 360,600 Q 180,700 0,620 Z" fill="#24170f" />
        <path d="M 340,560 Q 400,500 520,520" stroke="#5a4136" strokeWidth={8} fill="none" opacity={0.6} />
        {/* jaw shadow */}
        <path d="M 0,1500 Q 300,1400 600,1560 Q 820,1680 1080,1600 V 1920 H 0 Z" fill={skin.shade} opacity={0.6} />
        {/* ear */}
        <g transform={`translate(${canal.x},${canal.y})`}>
          <path d="M -40,-330 C 150,-370 260,-200 230,0 C 210,160 130,250 40,330 C -10,370 -70,350 -60,290 C -50,230 -120,200 -110,120 C -100,40 -150,-60 -140,-170 C -130,-280 -90,-320 -40,-330 Z" fill={skin.base} stroke={skin.shade} strokeWidth={8} />
          <path d="M -20,-280 C 120,-300 200,-170 180,-10 C 165,110 110,190 50,250" stroke={skin.shade} strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.75} />
          <path d="M -10,-240 C 100,-250 150,-150 140,-40" stroke={skin.light} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
          <path d="M -60,-170 C 20,-200 90,-130 80,-40 C 70,30 20,60 -10,40" stroke={skin.shade} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.6} />
          <ellipse cx={0} cy={0} rx={52} ry={68} fill="#3a1e14" />
          <ellipse cx={8} cy={8} rx={28} ry={40} fill="#160a06" />
          <path d="M -70,100 C -40,140 10,150 30,120" stroke={skin.shade} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
        {/* sound waves into the ear */}
        {fr >= S &&
          [0, 1, 2, 3, 4].map((i) => {
            const a = fr - S - i * 3;
            if (a < 0) return null;
            const r = Math.max(0, 700 - a * 34);
            if (r <= 30) return null;
            return <path key={i} d={`M ${canal.x - r * 0.7},${canal.y - r * 0.7} A ${r} ${r} 0 0 0 ${canal.x - r * 0.7},${canal.y + r * 0.7}`} stroke="#fff" strokeWidth={10 - i} fill="none" opacity={0.85 - i * 0.12} style={{filter: 'drop-shadow(0 0 10px rgba(160,220,255,0.9))'}} />;
          })}
        {/* starter pistol pointing up (left of the ear) */}
        <g transform={`translate(${lerp(-200, 300, gunIn)},${1260}) rotate(-8)`}>
          <path d="M -40,0 L 40,0 L 50,200 L -20,210 Z" fill="#1d1e24" />
          <rect x={-46} y={-260} width={70} height={270} rx={14} fill="#2b2d34" />
          <rect x={-30} y={-420} width={40} height={180} rx={8} fill="#3a3d46" />
          <rect x={-24} y={-410} width={10} height={160} fill="#7b808d" opacity={0.6} />
          <path d="M 24,-60 Q 70,-40 60,20" stroke="#1d1e24" strokeWidth={12} fill="none" />
          {flash > 0 && (
            <g transform="translate(-10,-430)" opacity={flash}>
              <path d="M 0,-180 L 30,-50 L 120,-110 L 50,-10 L 140,30 L 30,20 L 0,120 L -30,20 L -140,30 L -50,-10 L -120,-110 L -30,-50 Z" fill="#fff4c0" />
              <circle r={50} fill="#fff" />
            </g>
          )}
          {smoke > 0 && smoke < 1 && [0, 1, 2].map((i) => <circle key={i} cx={-10 + Math.sin(i * 2 + fr * 0.1) * 30} cy={-460 - smoke * (180 + i * 80)} r={30 + smoke * 60 + i * 10} fill="#e8e4df" opacity={(1 - smoke) * 0.5} />)}
        </g>
      </svg>
      <Flash k={flash * 0.6} color="255,245,220" />
      <Finish vignette={0.6} />
    </Rig>
  );
};
