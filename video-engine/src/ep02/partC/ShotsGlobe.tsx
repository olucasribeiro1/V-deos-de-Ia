import React from 'react';
import {AbsoluteFill, random, spring} from 'remotion';
import {Rig, Svg, useShot} from './kit';
import {ColdSea, Spray} from './sea';
import {LiaSilhouette} from './props';
import {Globe, globeProject, globeView, groundSpeed, SpaceBackdrop} from '../../environments/Globe';
import {Can} from '../../ep01/partC/props';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Cam} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';

export const MON = {lat: 43.7, lon: 7.4};
export const LIS = {lat: 38.7, lon: -9.1};
export const MIR = {lat: -43.7, lon: 7.4};
const V_MON = groundSpeed(MON.lat); // ≈ 1210
const V_LIS = groundSpeed(LIS.lat); // ≈ 1307

const chip: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  padding: '14px 26px',
  borderRadius: 22,
  background: 'rgba(8,18,40,0.82)',
  border: '3px solid #ff5a4e',
  boxShadow: '0 0 30px rgba(255,80,70,0.45)',
  fontFamily: HUD_FONT,
  color: '#fff',
};

/** c06 — "E longe tem a lata.": globe pull-back from Monaco, can chip pops. */
export const GlobeFar: React.FC = () => {
  const {frame, t, fps, p} = useShot();
  const zoom = lerp(3.2, 1.25, easeOut(p));
  const rot = lerp(7.4, -5, p);
  const tilt = lerp(43, 30, p);
  const v = globeView({rotation: rot, tilt, zoom, cy: 900});
  const m = globeProject(v, MON.lat, MON.lon);
  const LATA = 17;
  const s = spring({frame: frame - LATA, fps, config: {damping: 10, stiffness: 220, mass: 0.5}});
  return (
    <Rig s0={1.06} s1={1.0} r0={-4} r1={2} whipIn="zoom">
      <SpaceBackdrop t={t} driftY={-frame * 3} />
      <Globe rotation={rot} tilt={tilt} zoom={zoom} cy={900} t={t} grid={0.3} night={0.6} pins={[{...MON, label: 'MÔNACO', pulse: (frame / 18) % 1}]} />
      {frame >= LATA && (
        <div style={{...chip, left: 540 - 300, width: 600, top: 1150, transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`}}>
          <svg width={90} height={130} style={{overflow: 'visible'}}>
            <g transform={`translate(45,65) rotate(${-12 + Math.sin(frame / 4) * 6})`}>
              <Can h={120} spin={frame * 25} id="c06can" />
            </g>
          </svg>
          <div style={{flex: 1}}>
            <div style={{fontSize: 52, fontWeight: 700, letterSpacing: 3}}>A LATA</div>
            <div style={{fontSize: 26, opacity: 0.85, letterSpacing: 1}}>quem vai junto mantém a velocidade de onde saiu</div>
          </div>
        </div>
      )}
      <HudLabel label="MÔNACO" value={Math.round(V_MON)} unit="km/h" x={W - 90} y={560} align="right" tx={m.x} ty={m.y} from={4} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** Great-circle-ish arc (lifted) between two points on the globe. */
const arcPath = (v: ReturnType<typeof globeView>, a: {lat: number; lon: number}, b: {lat: number; lon: number}, k: number, lift = 0.08) => {
  const n = 30;
  const pts: string[] = [];
  for (let i = 0; i <= Math.round(n * k); i++) {
    const u = i / n;
    const q = globeProject(v, lerp(a.lat, b.lat, u), lerp(a.lon, b.lon, u), Math.sin(u * Math.PI) * lift);
    pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
  }
  return pts.length > 1 ? 'M' + pts.join('L') : '';
};

/** c07 — "De Mônaco pra Lisboa,": arc + two ground-speed arrows at different angles. */
export const MonacoLisbon: React.FC = () => {
  const {frame, t, p} = useShot();
  const rot = lerp(4, -2, p);
  const tilt = lerp(30, 40, p);
  const zoom = lerp(2.9, 3.3, p);
  const v = globeView({rotation: rot, tilt, zoom, cy: 980});
  const k = kf(frame, [2, 16], [0, 1], easeOut);
  const ar = kf(frame, [12, 24], [0, 1], easeOut);
  const m = globeProject(v, MON.lat, MON.lon);
  const l = globeProject(v, LIS.lat, LIS.lon);
  return (
    <Rig s0={1.0} s1={1.1} x0={40} x1={-20} whipIn="left">
      <SpaceBackdrop t={t} driftX={frame * 4} />
      <Globe
        rotation={rot}
        tilt={tilt}
        zoom={zoom}
        cy={980}
        t={t}
        grid={0.35}
        night={0.4}
        pins={[
          {...MON, label: 'MÔNACO'},
          {...LIS, label: 'LISBOA', color: '#3ea0ff', labelSide: 'left', drop: kf(frame, [10, 16], [0, 1], easeIn)},
        ]}
        arrows={[
          {lat: MON.lat, lon: MON.lon + 1, length: 7, progress: ar, color: '#ffd23f', width: 12},
          {lat: LIS.lat, lon: LIS.lon + 1, length: 7.6, progress: ar, color: '#ffd23f', width: 12},
        ]}
      />
      <Svg>
        <path d={arcPath(v, MON, LIS, k)} stroke="#fff" strokeWidth={7} strokeDasharray="16 12" fill="none" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))'}} />
      </Svg>
      <HudLabel label="MÔNACO" value={Math.round(V_MON)} unit="km/h" x={W - 80} y={560} align="right" tx={m.x + 8} ty={m.y - 30} from={6} />
      <HudLabel label="LISBOA" value={Math.round(V_LIS)} unit="km/h" x={80} y={1170} tx={l.x} ty={l.y + 10} from={14} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c08 — "ela chegaria a quatrocentos": vector difference diagram (vertical), red Lia rides the difference. */
export const LiaVector: React.FC = () => {
  const {frame, t} = useShot();
  const O = {x: 330, y: 1640};
  const S = 0.8; // px per km/h
  const angM = -Math.PI / 2;
  const angL = angM + (16.5 * Math.PI) / 180;
  const a = kf(frame, [0, 7], [0, 1], easeOut);
  const b = kf(frame, [3, 10], [0, 1], easeOut);
  const d = kf(frame, [8, 16], [0, 1], easeOut);
  const tipM = {x: O.x + Math.cos(angM) * V_MON * S, y: O.y + Math.sin(angM) * V_MON * S};
  const tipL = {x: O.x + Math.cos(angL) * V_LIS * S, y: O.y + Math.sin(angL) * V_LIS * S};
  const arrow = (from: {x: number; y: number}, to: {x: number; y: number}, color: string, w: number, k: number) => {
    const ex = from.x + (to.x - from.x) * k;
    const ey = from.y + (to.y - from.y) * k;
    const ang = Math.atan2(to.y - from.y, to.x - from.x);
    if (k < 0.02) return null;
    return (
      <g style={{filter: `drop-shadow(0 0 10px ${color})`}}>
        <line x1={from.x} y1={from.y} x2={ex - Math.cos(ang) * w} y2={ey - Math.sin(ang) * w} stroke={color} strokeWidth={w} strokeLinecap="round" />
        <g transform={`translate(${ex},${ey}) rotate(${(ang * 180) / Math.PI})`}>
          <path d={`M${w * 1.2},0 L${-w * 1.8},${-w * 1.5} L${-w * 1.2},0 L${-w * 1.8},${w * 1.5} Z`} fill={color} />
        </g>
      </g>
    );
  };
  const mid = {x: (tipL.x + tipM.x) / 2, y: (tipL.y + tipM.y) / 2};
  const ride = kf(frame, [12, 28], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.12} r0={2} r1={-1} whipIn="up" ox={mid.x} oy={mid.y + 200}>
      <SpaceBackdrop t={t} driftY={frame * 6} />
      <Svg>
        <g opacity={0.18} stroke="#7fb8ff" strokeWidth={2}>
          {Array.from({length: 18}).map((_, i) => (
            <line key={i} x1={i * 64} y1={0} x2={i * 64} y2={H} />
          ))}
        </g>
        {arrow(O, tipM, '#ffd23f', 18, a)}
        {arrow(O, tipL, '#6fbaff', 18, b)}
        <path d={`M${O.x},${O.y - 220} A220,220 0 0 1 ${O.x + 220 * Math.cos(angL)},${O.y + 220 * Math.sin(angL)}`} stroke="#fff" strokeWidth={5} fill="none" opacity={b} />
        <text x={O.x + 30} y={O.y - 240} fontFamily={HUD_FONT} fontWeight={700} fontSize={40} fill="#fff" opacity={b}>
          16,5°
        </text>
        <text x={O.x - 30} y={O.y - 500} textAnchor="end" fontFamily={HUD_FONT} fontWeight={700} fontSize={44} fill="#ffd23f" opacity={a}>
          MÔNACO
        </text>
        <text x={O.x - 30} y={O.y - 450} textAnchor="end" fontFamily={HUD_FONT} fontWeight={400} fontSize={38} fill="#ffd23f" opacity={a}>
          1.210 km/h
        </text>
        <text x={O.x + 250} y={O.y - 500} fontFamily={HUD_FONT} fontWeight={700} fontSize={44} fill="#6fbaff" opacity={b}>
          LISBOA
        </text>
        <text x={O.x + 250} y={O.y - 450} fontFamily={HUD_FONT} fontWeight={400} fontSize={38} fill="#6fbaff" opacity={b}>
          1.307 km/h
        </text>
        {arrow(tipL, tipM, '#ff3b3b', 22, d)}
        {d > 0.3 && (
          <g transform={`translate(${mid.x - 10 - ride * 40},${mid.y - 40}) scale(0.3)`} opacity={kf(frame, [8, 14], [0, 1])}>
            {[0, 1, 2].map((i) => (
              <line key={i} x1={260} y1={-300 - i * 220} x2={520 + i * 80} y2={-300 - i * 220} stroke="#ff8a80" strokeWidth={22} strokeLinecap="round" opacity={0.7} />
            ))}
            <LiaSilhouette lean={-16} />
          </g>
        )}
      </Svg>
      <HudLabel label="LIA" value={400} unit="km/h" x={W - 70} y={1020} align="right" tx={mid.x + 40} ty={mid.y + 14} from={10} scale={1.3} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** Simple Lisbon street wall: pastel façades with azulejo tiles, yellow tram. */
const LisbonStreet: React.FC<{shift: number}> = ({shift}) => {
  const cols = ['#f2c14e', '#e88c7d', '#8fc1d4', '#f3e3c3', '#b9d7a8', '#f2a65a'];
  return (
    <Svg>
      <defs>
        <linearGradient id="lx-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1d2a52" />
          <stop offset="1" stopColor="#e99c6c" />
        </linearGradient>
        <pattern id="lx-tile" width={28} height={28} patternUnits="userSpaceOnUse">
          <rect width={28} height={28} fill="#e9f1fb" />
          <path d="M14,2 L26,14 L14,26 L2,14 Z" fill="none" stroke="#3a6fb5" strokeWidth={3} />
          <circle cx={14} cy={14} r={3} fill="#3a6fb5" />
        </pattern>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#lx-sky)" />
      {Array.from({length: 9}).map((_, i) => {
        const x = ((i * 300 - shift) % 2700 + 2700) % 2700 - 300;
        const top = 300 + (i % 3) * 90;
        return (
          <g key={i}>
            <rect x={x} y={top} width={300} height={1300 - top} fill={i % 3 === 1 ? 'url(#lx-tile)' : cols[i % cols.length]} stroke="#2b2230" strokeWidth={4} />
            <rect x={x - 6} y={top - 24} width={312} height={28} fill="#7a3b2e" />
            {Array.from({length: 4}).map((__, r) => (
              <g key={r}>
                <rect x={x + 50} y={top + 70 + r * 210} width={70} height={120} fill="#2b3550" stroke="#fff" strokeWidth={6} />
                <rect x={x + 180} y={top + 70 + r * 210} width={70} height={120} fill="#2b3550" stroke="#fff" strokeWidth={6} />
                <rect x={x + 40} y={top + 190 + r * 210} width={220} height={10} fill="#2b2230" />
              </g>
            ))}
          </g>
        );
      })}
      <rect x={0} y={1300} width={W} height={620} fill="#c9b9a1" />
      {Array.from({length: 40}).map((_, i) => (
        <rect key={i} x={((i * 80 - shift * 1.3) % 3200 + 3200) % 3200 - 100} y={1330 + (i % 4) * 140} width={60} height={30} rx={10} fill="#b3a48c" />
      ))}
      <rect x={0} y={1400} width={W} height={12} fill="#857a6a" />
      <rect x={0} y={1460} width={W} height={12} fill="#857a6a" />
    </Svg>
  );
};

/** c09 — "por hora.": red silhouette streaks in and slams; impact ring, heavy shake. */
export const LisbonImpact: React.FC = () => {
  const {frame, t} = useShot();
  const HIT = 8;
  const fly = clamp(frame / HIT);
  const x = lerp(-500, 820, easeIn(fly));
  const hit = frame >= HIT;
  const age = frame - HIT;
  return (
    <Rig s0={1.02} s1={1.1} impacts={[{at: HIT, amp: 40, dur: 16, zoom: 0.1}]} whipIn="right">
      <LisbonStreet shift={frame * 20} />
      <Svg>
        {!hit &&
          Array.from({length: 14}).map((_, i) => {
            const yy = 760 + random(`ls${i}`) * 560;
            return <line key={i} x1={x - 200 - random(`lx${i}`) * 700} y1={yy} x2={x - 120} y2={yy} stroke="#ff7a70" strokeWidth={6 + random(`lw${i}`) * 8} strokeLinecap="round" opacity={0.7} />;
          })}
        <g transform={`translate(${hit ? 830 : x},${1330}) scale(0.62) rotate(${hit ? -8 : -24})`} opacity={hit ? clamp(1 - age / 30) : 1}>
          <LiaSilhouette lean={0} />
        </g>
        {hit &&
          Array.from({length: 16}).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r0 = 40 + age * 22;
            const r1 = r0 + 60 + random(`ir${i}`) * 80;
            return <line key={i} x1={880 + Math.cos(a) * r0} y1={1000 + Math.sin(a) * r0} x2={880 + Math.cos(a) * r1} y2={1000 + Math.sin(a) * r1} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={clamp(1 - age / 14)} />;
          })}
        {hit && <circle cx={880} cy={1000} r={40 + age * 30} fill="none" stroke="#ff3b3b" strokeWidth={18} opacity={clamp(1 - age / 16)} />}
      </Svg>
      {hit && (
        <div style={{position: 'absolute', left: 0, width: W, top: 560, textAlign: 'center', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 130, color: '#fff', textShadow: '0 0 30px rgba(255,60,60,0.9), 0 6px 12px rgba(0,0,0,0.6)', transform: `scale(${kf(age, [0, 5], [1.8, 1], easeOut)}) rotate(-4deg)`}}>
          400 <span style={{fontSize: 60}}>km/h</span>
        </div>
      )}
      <AbsoluteFill style={{background: `rgba(255,60,60,${hit ? kf(age, [0, 1, 8], [0, 0.45, 0]) : 0})`, mixBlendMode: 'screen'}} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/** c10 — "O único lugar seguro era": globe swings south; Monaco latitude ring. */
export const GlobeSearch: React.FC = () => {
  const {frame, t, p} = useShot();
  const tilt = lerp(45, 8, easeOut(p));
  const rot = lerp(-25, 7.4, easeOut(clamp(frame / 20)));
  const zoom = 1.25;
  const v = globeView({rotation: rot, tilt, zoom, cy: 960});
  const m = globeProject(v, MON.lat, MON.lon);
  return (
    <Rig s0={1.0} s1={1.08} r0={6} r1={0} whipIn="down">
      <SpaceBackdrop t={t} driftY={-frame * 10} driftX={frame * 6} />
      <Globe rotation={rot} tilt={tilt} zoom={zoom} cy={960} t={t} grid={0.35} night={0.45} highlightEquator={kf(frame, [10, 28], [0, 1])} highlightLats={[{lat: MON.lat, k: kf(frame, [0, 14], [0, 1], easeOut), color: '#ffd23f', width: 6}]} pins={[{...MON, label: '43,7° N'}]} />
      {frame > 6 && (
        <div style={{position: 'absolute', left: 0, width: W, top: 1180, textAlign: 'center', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 64, letterSpacing: 6, color: '#7dffb0', textShadow: '0 0 18px rgba(80,255,160,0.7)', opacity: kf(frame, [6, 12], [0, 1])}}>
          LUGAR SEGURO?
        </div>
      )}
      <HudLabel label="MÔNACO" value="43,7° N" x={90} y={560} tx={m.x} ty={m.y} from={2} countUp={false} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c11 — "o espelho no sul.": equator turns into a mirror, Monaco's pin flips to 43.7 S. */
export const Mirror: React.FC = () => {
  const {frame, t, p} = useShot();
  const rot = 7.4;
  const tilt = lerp(6, -4, p);
  const zoom = 1.45;
  const v = globeView({rotation: rot, tilt, zoom, cy: 960});
  const m = globeProject(v, MON.lat, MON.lon);
  const s = globeProject(v, MIR.lat, MIR.lon);
  const e = globeProject(v, 0, MON.lon);
  const flip = kf(frame, [6, 20], [0, 1], easeOut);
  const glow = kf(frame, [0, 6], [0, 1]);
  const gy = lerp(m.y, s.y, flip);
  return (
    <Rig s0={1.08} s1={1.0} r0={-3} r1={1} whipIn="up">
      <SpaceBackdrop t={t} />
      <Globe rotation={rot} tilt={tilt} zoom={zoom} cy={960} t={t} grid={0.3} night={0.4} highlightEquator={1} highlightMeridianLon={MON.lon} highlightMeridian={glow} pins={[{...MON, label: 'MÔNACO'}, {...MIR, label: '43,7° S', color: '#3ea0ff', drop: kf(frame, [18, 24], [0, 1], easeIn)}]} />
      <Svg>
        <defs>
          <linearGradient id="c11m" x1="0" x2="1">
            <stop offset="0" stopColor="#bff3ff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.9} />
            <stop offset="1" stopColor="#bff3ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={e.y - 10} width={W} height={20} fill="url(#c11m)" opacity={glow} style={{filter: 'blur(3px)'}} />
        <rect x={((frame * 50) % 1400) - 300} y={e.y - 30} width={160} height={60} fill="#fff" opacity={0.35 * glow} transform={`skewX(-30)`} style={{filter: 'blur(8px)'}} />
        {flip > 0 && flip < 1 && (
          <g opacity={0.8}>
            <line x1={m.x} y1={m.y} x2={m.x} y2={gy} stroke="#9fe3ff" strokeWidth={6} strokeDasharray="12 10" />
            <circle cx={m.x} cy={gy} r={22} fill="#3ea0ff" stroke="#fff" strokeWidth={5} />
          </g>
        )}
      </Svg>
      <div style={{position: 'absolute', left: 60, top: e.y - 82, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: '#dff8ff', opacity: glow, textShadow: '0 0 12px rgba(120,220,255,0.9)'}}>ESPELHO · 0°</div>
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

const Wedge: React.FC<{v: ReturnType<typeof globeView>; lat: number; lon: number; k: number; color: string}> = ({v, lat, lon, k, color}) => {
  const e = globeProject(v, 0, lon);
  const pts = Array.from({length: 24}).map((_, i) => globeProject(v, (lat * k * i) / 23, lon, 0.01));
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

/** c12 — "Quarenta e três graus sul,": angle wedges up and down; 43° N = 43° S. */
export const Angles: React.FC = () => {
  const {frame, t, p} = useShot();
  const rot = lerp(-8, 7.4, easeOut(clamp(frame / 14)));
  // view from the side so the meridian is the limb-ish line: rotate so meridian is on the left edge
  const v = globeView({rotation: rot + 55, tilt: 0, zoom: 1.4, cx: 640, cy: 960});
  const kN = kf(frame, [0, 12], [0, 1], easeOut);
  const kS = kf(frame, [8, 22], [0, 1], easeOut);
  const eq = kf(frame, [22, 28], [1.5, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.1} x0={-30} x1={10} whipIn="left">
      <SpaceBackdrop t={t} driftX={frame * 5} />
      <Globe rotation={rot + 55} tilt={0} zoom={1.4} cx={640} cy={960} t={t} grid={0.2} night={0.35} highlightEquator={1} highlightMeridianLon={MON.lon} pins={[{...MON, label: '43° N', labelSide: 'left'}, {...MIR, label: '43° S', color: '#3ea0ff', labelSide: 'left', drop: kf(frame, [16, 22], [0, 1])}]} />
      <Wedge v={v} lat={MON.lat} lon={MON.lon} k={kN} color="#ff5a4e" />
      <Wedge v={v} lat={MIR.lat} lon={MIR.lon} k={kS} color="#3ea0ff" />
      {frame > 20 && (
        <div style={{position: 'absolute', left: 0, width: W, top: 1180, textAlign: 'center', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 92, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,0.8)', transform: `scale(${eq})`}}>
          <span style={{color: '#ff7a6e'}}>43° N</span> = <span style={{color: '#6fbaff'}}>43° S</span>
        </div>
      )}
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c13 — "mesma linha.": meridian lights, pulse Monaco -> mirror, equal speed arrows. */
export const SameLine: React.FC = () => {
  const {frame, t, p} = useShot();
  const tilt = lerp(20, -20, p);
  const v = globeView({rotation: 7.4, tilt, zoom: 1.7, cy: 960});
  const pl = lerp(43.7, -43.7, clamp(frame / 18));
  const q = globeProject(v, pl, 7.4, 0.01);
  const k = kf(frame, [4, 14], [0, 1], easeOut);
  const m = globeProject(v, MON.lat, MON.lon);
  const s = globeProject(v, MIR.lat, MIR.lon);
  return (
    <Rig s0={1.0} s1={1.08} r0={-3} r1={3} whipIn="down">
      <SpaceBackdrop t={t} driftY={frame * 8} />
      <Globe
        rotation={7.4}
        tilt={tilt}
        zoom={1.7}
        cy={960}
        t={t}
        grid={0.25}
        night={0.3}
        highlightEquator={0.7}
        highlightMeridianLon={7.4}
        pins={[
          {...MON, color: '#ff5a4e'},
          {...MIR, color: '#3ea0ff'},
        ]}
        arrows={[
          {lat: MON.lat, lon: MON.lon + 2, length: 22, progress: k, color: '#ffd23f', width: 16},
          {lat: MIR.lat, lon: MIR.lon + 2, length: 22, progress: k, color: '#ffd23f', width: 16},
        ]}
      />
      <Svg>
        <circle cx={q.x} cy={q.y} r={22} fill="#fff" style={{filter: 'drop-shadow(0 0 16px #6ff0ff)'}} />
      </Svg>
      <HudLabel label="43,7° N" value={1210} unit="km/h" x={W - 90} y={560} align="right" tx={m.x + 10} ty={m.y - 10} from={6} />
      <HudLabel label="43,7° S" value={1210} unit="km/h" x={W - 90} y={1120} align="right" tx={s.x + 10} ty={s.y + 10} from={8} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c14 — "Oceano aberto.": crash zoom into 43.7 S, dissolve to the dark sea from above. */
export const OpenOcean: React.FC = () => {
  const {frame, t, dur} = useShot();
  const zk = easeIn(clamp(frame / (dur - 6)));
  const zoom = lerp(1.6, 14, zk);
  const v = globeView({rotation: 10, tilt: -43.7, zoom, cy: 960});
  const s = globeProject(v, MIR.lat, MIR.lon);
  const sea = kf(frame, [dur - 10, dur - 3], [0, 1]);
  const cam: Cam = {x: 0, y: 40, z: -40 / Math.tan((60 * Math.PI) / 180), pitch: 60, f: 1400};
  return (
    <Rig s0={1.0} s1={1.06} r0={0} r1={-4} ease={(x) => x}>
      <SpaceBackdrop t={t} />
      <Globe rotation={10} tilt={-43.7} zoom={zoom} cy={960} t={t} grid={0.25} night={0.3} highlightMeridianLon={7.4} pins={[{...MIR, color: '#3ea0ff', pulse: (frame / 14) % 1, label: 'ESPELHO'}]} />
      {sea > 0 && (
        <AbsoluteFill style={{opacity: sea}}>
          <ColdSea cam={cam} t={t + 40} />
        </AbsoluteFill>
      )}
      <HudLabel label="43,7° S · 7,4° L" value="ATLÂNTICO SUL" x={90} y={560} tx={s.x - 10} ty={s.y - 10} from={3} countUp={false} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/** c15 — "Água a dez graus.": low over the cold sea; HUD 10 °C. */
export const ColdSeaShot: React.FC = () => {
  const {frame, t, p} = useShot();
  const cam: Cam = {x: p * 2, y: 1.6 + Math.sin(t * 2.2) * 0.25, z: -p * 3, pitch: 4 + Math.sin(t * 1.7) * 1.2, f: 1250, cy: H * 0.45};
  const temp = Math.round(kf(frame, [3, 18], [25, 10], easeOut));
  return (
    <Rig s0={1.0} s1={1.1} r0={-3} r1={2} whipIn="zoom">
      <ColdSea cam={cam} t={t + 41} swell={1.4} />
      <Spray t={t} count={70} seed="c15" opacity={0.45} />
      <div style={{position: 'absolute', left: 0, width: W, top: 640, textAlign: 'center', fontFamily: HUD_FONT, color: '#fff', textShadow: '0 0 24px rgba(80,180,255,0.9), 0 4px 10px rgba(0,0,0,0.6)'}}>
        <div style={{fontSize: 34, fontWeight: 700, letterSpacing: 8, opacity: 0.9}}>ÁGUA</div>
        <div style={{fontSize: 210, fontWeight: 700, lineHeight: 1, color: '#bfe8ff'}}>
          {temp}
          <span style={{fontSize: 90}}> °C</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 70, top: 1220, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: '#dfeef2', opacity: kf(frame, [8, 14], [0, 0.9])}}>43,7° S · 7,4° L · OCEANO ABERTO</div>
      <AbsoluteFill style={{background: 'rgba(40,90,130,0.18)', mixBlendMode: 'multiply'}} />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};
