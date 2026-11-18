import React from 'react';
import {AbsoluteFill, spring} from 'remotion';
import {Rig, Svg, useShot} from './kit';
import {Ocean} from './Ocean';
import {Globe, GlobeArrow, globeProject, globeView, groundSpeed, SpaceBackdrop} from '../../environments/Globe';
import {Copacabana} from '../../environments/Copacabana';
import {FaceCloseup} from '../../characters/Closeups';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Cam} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {KD} from './ShotsKiosk';

const RIO = {lat: -22.9, lon: -43.2};
const NOR = {lat: 22.9, lon: -43.2};
const T0 = 72;

const chalk: React.CSSProperties = {fontFamily: HUD_FONT, fontWeight: 700, color: '#bfeaff', textShadow: '0 0 12px rgba(80,180,255,0.9), 0 2px 4px rgba(0,0,0,0.6)'};

/** c01 — "Só que o Davi fez a conta": face close, math sketches around him. */
export const MathFace: React.FC = () => {
  const {frame, t} = useShot();
  const CONTA = 24;
  const bg: Cam = {x: KD.x + 0.6, y: 1.2, z: KD.z - 1.4, pitch: 2, f: 1650, cy: H * 0.5};
  const items = [
    {txt: 'v = 1.674 × cos φ', x: 90, y: 540, at: 4, rot: -6, size: 52},
    {txt: 'φ = 23°', x: 790, y: 700, at: 10, rot: 5, size: 58},
    {txt: 'km/h →', x: 60, y: 1230, at: 16, rot: 4, size: 50},
    {txt: 'cos 23° ≈ 0,92', x: 600, y: 1250, at: 20, rot: -4, size: 48},
  ];
  return (
    <Rig s0={1.0} s1={1.2} impacts={[{at: CONTA, amp: 14, zoom: 0.07}]} oy={980}>
      <AbsoluteFill style={{transform: 'scale(1.1)'}}>
        <Copacabana cam={bg} t={t + T0} focus={0.5} aperture={22} cold={0.35} />
      </AbsoluteFill>
      <Svg>
        <FaceCloseup
          cx={540}
          cy={1010}
          k={4.3}
          skin={DAVI_OUTFIT.skin}
          style={DAVI_OUTFIT.head}
          facing={0.08}
          expr={{browTilt: -0.4, browAsym: kf(frame, [CONTA, CONTA + 6], [0, 0.8]), lookX: kf(frame, [0, 14, 28], [-0.6, 0.6, 0]), lookY: -0.5, blink: kf(frame, [12, 14, 16], [0, 1, 0]), halfSmile: kf(frame, [CONTA, CONTA + 8], [0, 0.9])}}
        />
      </Svg>
      {items.map((it) => {
        const k = clamp((frame - it.at) / 5);
        if (k <= 0) return null;
        return (
          <div key={it.txt} style={{...chalk, position: 'absolute', left: it.x, top: it.y, fontSize: it.size, opacity: k, transform: `rotate(${it.rot}deg) scale(${0.6 + 0.4 * k})`, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`}}>
            {it.txt}
          </div>
        );
      })}
      <Finish vignette={0.6} />
    </Rig>
  );
};

const eastArrows = (prog: number, color = '#ffd23f'): GlobeArrow[] =>
  [-60, -30, 0, 30, 60].map((lat) => ({lat, lon: -70, length: groundSpeed(lat) / 1674 * 50, progress: prog, color, width: 12 + Math.cos((lat * Math.PI) / 180) * 6}));

/** c02 — "A velocidade do chão": wide globe spinning, arrows stream east. */
export const GlobeSpin: React.FC = () => {
  const {frame, t, p} = useShot();
  const rot = lerp(-10, -50, p);
  return (
    <Rig s0={0.9} s1={1.08} r0={-5} r1={0} whipIn="right">
      <SpaceBackdrop t={t} driftX={-frame * 3} />
      <Globe rotation={rot} tilt={8} t={t} radius={390} arrows={eastArrows(kf(frame, [3, 22], [0, 1], easeOut)).map((a) => ({...a, lon: rot - 30}))} />
      <Finish vignette={0.4} grain={0.08} />
    </Rig>
  );
};

/** c03 — "depende de duas coisas": globe tilts, two chips pop. */
export const TwoThings: React.FC = () => {
  const {frame, t, fps} = useShot();
  const chips = [
    {n: '1', label: 'LATITUDE', icon: '↕', at: 6, y: 600},
    {n: '2', label: 'LONGITUDE', icon: '↔', at: 16, y: 1180},
  ];
  return (
    <Rig s0={1.0} s1={1.12} r0={4} r1={-2} whipIn="up">
      <SpaceBackdrop t={t} driftY={frame * 2} />
      <Globe rotation={lerp(-45, -55, frame / 40)} tilt={lerp(25, 10, frame / 40)} t={t} radius={340} grid={0.6} />
      {chips.map((c) => {
        const s = spring({frame: frame - c.at, fps, config: {damping: 10, stiffness: 220, mass: 0.5}});
        if (frame < c.at) return null;
        return (
          <div
            key={c.n}
            style={{
              position: 'absolute',
              left: 540 - 270,
              width: 540,
              top: c.y,
              transform: `scale(${s})`,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              padding: '16px 26px',
              borderRadius: 22,
              background: 'rgba(8,18,40,0.82)',
              border: '3px solid #6ff0ff',
              boxShadow: '0 0 30px rgba(80,200,255,0.45)',
              fontFamily: HUD_FONT,
              color: '#fff',
            }}
          >
            <div style={{width: 74, height: 74, borderRadius: 37, background: '#6ff0ff', color: '#08203a', fontSize: 52, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.n}</div>
            <div style={{fontSize: 48, fontWeight: 700, letterSpacing: 3, flex: 1}}>{c.label}</div>
            <div style={{fontSize: 60, fontWeight: 700, color: '#6ff0ff'}}>{c.icon}</div>
          </div>
        );
      })}
      <Finish vignette={0.4} grain={0.08} />
    </Rig>
  );
};

/** c04 — "a distância do equador": equator ignites, latitude ticks. */
export const Equator: React.FC = () => {
  const {frame, t, p} = useShot();
  const z = lerp(1.15, 1.6, easeOut(p));
  const v = globeView({rotation: -30, tilt: 12, zoom: z, cy: 1000});
  const k = kf(frame, [2, 16], [0, 1], easeOut);
  const eq = globeProject(v, 0, -30);
  return (
    <Rig s0={1.0} s1={1.05} whipIn="zoom">
      <SpaceBackdrop t={t} />
      <Globe rotation={-30} tilt={12} zoom={z} cy={1000} t={t} highlightEquator={k} highlightLats={[{lat: 23, k: k * 0.5, color: '#ffffff', width: 3}, {lat: -23, k: k * 0.5, color: '#ffffff', width: 3}]} />
      <HudLabel label="EQUADOR" value="0°" x={110} y={640} tx={eq.x - 160} ty={eq.y} from={8} countUp={false} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c05 — "e o lado do planeta": whip-rotate to 43° W, meridian lights pole to pole. */
export const Meridian: React.FC = () => {
  const {frame, t} = useShot();
  const rot = lerp(60, -43.2, easeOut(clamp(frame / 12)));
  const m = kf(frame, [8, 24], [0, 1], easeOut);
  const v = globeView({rotation: rot, tilt: 0, zoom: 1.15});
  const top = globeProject(v, 40, -43.2);
  return (
    <Rig s0={1.0} s1={1.1} r0={-6} r1={0}>
      <SpaceBackdrop t={t} driftX={frame * 18} />
      <Globe rotation={rot} tilt={0} zoom={1.15} t={t} highlightEquator={1} highlightMeridianLon={-43.2} highlightMeridian={m} />
      <HudLabel label="MERIDIANO DO RIO" value="43° O" x={W - 100} y={590} align="right" tx={top.x + 6} ty={top.y} from={12} countUp={false} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c06 — "O Rio tá": pin drops on Rio, impact zoom. */
export const RioPin: React.FC = () => {
  const {frame, t, p} = useShot();
  const z = lerp(1.6, 2.3, easeOut(p));
  const v = globeView({rotation: -43.2, tilt: -12, zoom: z, cy: 820});
  const drop = kf(frame, [0, 7], [0, 1], easeIn);
  const rio = globeProject(v, RIO.lat, RIO.lon);
  return (
    <Rig s0={1.0} s1={1.04} impacts={[{at: 7, amp: 18, zoom: 0.06}]} ox={rio.x} oy={rio.y}>
      <SpaceBackdrop t={t} />
      <Globe rotation={-43.2} tilt={-12} zoom={z} cy={820} t={t} highlightEquator={1} highlightMeridianLon={-43.2} pins={[{...RIO, label: 'RIO', drop, pulse: frame > 7 ? ((frame - 7) / 20) % 1 : 0, scale: 1.4}]} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** Angle wedge from the globe centre between the equator and a latitude on the meridian. */
const AngleWedge: React.FC<{v: ReturnType<typeof globeView>; lat: number; k: number; color: string}> = ({v, lat, k, color}) => {
  const e = globeProject(v, 0, -43.2);
  const pts = Array.from({length: 24}).map((_, i) => globeProject(v, (lat * k * i) / 23, -43.2, 0.01));
  const tip = pts[pts.length - 1];
  const d = 'M' + pts.map((q) => `${q.x},${q.y}`).join('L');
  return (
    <Svg>
      <path d={`M${v.cx},${v.cy} L${e.x},${e.y}`} stroke="#ffe066" strokeWidth={5} strokeDasharray="14 10" />
      <path d={`M${v.cx},${v.cy} L${tip.x},${tip.y}`} stroke={color} strokeWidth={5} strokeDasharray="14 10" />
      <path d={`M${v.cx},${v.cy} ${d.replace('M', 'L')} Z`} fill={color} opacity={0.22} />
      <path d={d} stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${color})`}} />
      <circle cx={v.cx} cy={v.cy} r={10} fill="#fff" />
    </Svg>
  );
};

/** c07 — "graus pro sul": wedge sweeps 0 -> 23° S. */
export const South23: React.FC = () => {
  const {frame, t} = useShot();
  const v = globeView({rotation: -43.2, tilt: -8, zoom: 1.5, cy: 900});
  const k = kf(frame, [2, 16], [0, 1], easeOut);
  const rio = globeProject(v, RIO.lat, RIO.lon);
  return (
    <Rig s0={1.08} s1={1.0} whipIn="down" oy={1000}>
      <SpaceBackdrop t={t} />
      <Globe rotation={-43.2} tilt={-8} zoom={1.5} cy={900} t={t} grid={0.2} night={0.35} highlightEquator={1} highlightMeridianLon={-43.2} pins={[{...RIO, label: 'RIO'}]} />
      <AngleWedge v={v} lat={RIO.lat} k={k} color="#ff5a4e" />
      <HudLabel label="LATITUDE" value={`${Math.round(23 * k)}° S`} x={110} y={1080} tx={rio.x - 20} ty={rio.y + 10} from={4} countUp={false} scale={1.1} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c08 — "Vinte e três pro norte": mirror wedge up to 23° N, blue pin. */
export const North23: React.FC = () => {
  const {frame, t} = useShot();
  const tilt = lerp(-8, 6, easeOut(clamp(frame / 20)));
  const v = globeView({rotation: -43.2, tilt, zoom: 1.5, cy: 960});
  const k = kf(frame, [3, 18], [0, 1], easeOut);
  const n = globeProject(v, NOR.lat, NOR.lon);
  return (
    <Rig s0={1.0} s1={1.08} whipIn="up">
      <SpaceBackdrop t={t} driftY={frame * 4} />
      <Globe
        rotation={-43.2}
        tilt={tilt}
        zoom={1.5}
        cy={960}
        t={t}
        grid={0.2}
        night={0.35}
        highlightEquator={1}
        highlightMeridianLon={-43.2}
        pins={[
          {...RIO, label: 'RIO'},
          {...NOR, label: '23° N', color: '#3ea0ff', drop: kf(frame, [16, 22], [0, 1], easeIn)},
        ]}
      />
      <AngleWedge v={v} lat={RIO.lat} k={1} color="#ff5a4e" />
      <AngleWedge v={v} lat={NOR.lat} k={k} color="#3ea0ff" />
      <HudLabel label="LATITUDE" value={`${Math.round(23 * k)}° N`} x={W - 110} y={560} align="right" tx={n.x + 16} ty={n.y - 8} from={5} countUp={false} scale={1.1} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c09 — "na mesma linha": track along the meridian, pulse travels between the points. */
export const SameLine: React.FC = () => {
  const {frame, t, p} = useShot();
  const tilt = lerp(-22, 22, easeOut(p));
  const v = globeView({rotation: -43.2, tilt, zoom: 2.6, cy: 960});
  const pl = lerp(-22.9, 22.9, (frame % 22) / 22);
  const q = globeProject(v, pl, -43.2, 0.01);
  return (
    <Rig s0={1.0} s1={1.06} r0={3} r1={-3} whipIn="down">
      <SpaceBackdrop t={t} driftY={frame * 8} />
      <Globe
        rotation={-43.2}
        tilt={tilt}
        zoom={2.6}
        cy={960}
        t={t}
        grid={0.25}
        night={0.3}
        highlightEquator={1}
        highlightMeridianLon={-43.2}
        pins={[
          {...RIO, label: 'RIO'},
          {...NOR, label: '23° N', color: '#3ea0ff'},
        ]}
      />
      <Svg>
        <circle cx={q.x} cy={q.y} r={22} fill="#fff" style={{filter: 'drop-shadow(0 0 16px #6ff0ff)'}} />
      </Svg>
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c10 — "o chão gira igualzinho": identical eastward arrows on both points. */
export const SameSpeed: React.FC = () => {
  const {frame, t} = useShot();
  const v = globeView({rotation: -43.2, tilt: 0, zoom: 1.6, cy: 960});
  const k = kf(frame, [2, 14], [0, 1], easeOut);
  const r = globeProject(v, RIO.lat, RIO.lon);
  const n = globeProject(v, NOR.lat, NOR.lon);
  return (
    <Rig s0={1.06} s1={1.0} impacts={[{at: 14, amp: 10, zoom: 0.04}]}>
      <SpaceBackdrop t={t} />
      <Globe
        rotation={-43.2}
        tilt={0}
        zoom={1.6}
        cy={960}
        t={t}
        grid={0.2}
        night={0.3}
        highlightMeridianLon={-43.2}
        highlightEquator={0.6}
        pins={[
          {...RIO, color: '#ff5a4e'},
          {...NOR, color: '#3ea0ff'},
        ]}
        arrows={[
          {lat: RIO.lat, lon: RIO.lon + 2, length: 34, progress: k, color: '#ffd23f', width: 18},
          {lat: NOR.lat, lon: NOR.lon + 2, length: 34, progress: k, color: '#ffd23f', width: 18},
        ]}
      />
      <HudLabel label="23° N" value={1540} unit="km/h" x={90} y={560} tx={n.x - 10} ty={n.y - 10} from={6} />
      <HudLabel label="23° S" value={1540} unit="km/h" x={90} y={1090} tx={r.x - 10} ty={r.y + 10} from={6} />
      {frame > 16 && (
        <div style={{position: 'absolute', left: W - 420, top: 905, width: 380, textAlign: 'center', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 64, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.7)', transform: `scale(${kf(frame, [16, 21], [1.6, 1], easeOut)})`}}>
          <span style={{color: '#ff7a6e'}}>23° S</span> = <span style={{color: '#6fbaff'}}>23° N</span>
        </div>
      )}
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c11 — "Lá é o meio do Atlântico": crash zoom into 23° N, dissolve to open ocean from above. */
export const Atlantic: React.FC = () => {
  const {frame, t, dur} = useShot();
  const zk = easeIn(clamp(frame / (dur - 6)));
  const zoom = lerp(1.3, 16, zk);
  const v = globeView({rotation: -43.2, tilt: 22.9, zoom, cy: 960});
  const n = globeProject(v, NOR.lat, NOR.lon);
  const sea = kf(frame, [dur - 10, dur - 3], [0, 1]);
  const cam: Cam = {x: 0, y: 30, z: -30 / Math.tan((55 * Math.PI) / 180), pitch: 55, f: 1400};
  return (
    <Rig s0={1.0} s1={1.06} r0={0} r1={3} ease={(x) => x}>
      <SpaceBackdrop t={t} />
      <Globe rotation={-43.2} tilt={22.9} zoom={zoom} cy={960} t={t} grid={0.25} night={0.3} highlightMeridianLon={-43.2} highlightEquator={1} pins={[{...NOR, color: '#3ea0ff', pulse: (frame / 14) % 1}]} />
      {sea > 0 && (
        <AbsoluteFill style={{opacity: sea}}>
          <Ocean cam={cam} t={t + 83} />
        </AbsoluteFill>
      )}
      <HudLabel label="23° N · 43° O" value="ATLÂNTICO" x={W - 90} y={600} align="right" tx={n.x + 10} ty={n.y - 10} from={3} countUp={false} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};
