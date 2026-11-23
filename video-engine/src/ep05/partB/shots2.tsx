import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Chip, Rig, Stamp, Svg, useShot, wl} from './kit';
import {Footprint, YachtIcon} from './sets';
import {ChairBack, DinnerTable, MonacoMap, PhoneFrame, TERRACE_LIGHT, TerraceBG} from '../../ep02/partC/sets';
import {CloseUp, LIA_SEAT, SIT_H, TABLE} from '../../ep02/partC/ShotsMonaco';
import {PlacedDavi} from '../../characters/Davi';
import {PlacedLia} from '../../characters/Lia';
import {Globe, globeProject, globeView, groundSpeed, SpaceBackdrop} from '../../environments/Globe';
import {Particles} from '../../fx/Particles';
import {Finish} from '../../scenes/common';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';

const MON = {lat: 43.73, lon: 7.42};
const V_MON = groundSpeed(MON.lat); // ≈ 1210 km/h

/* ------------------------------------------------------------------ b11 — "E pra perto é seguro" */

export const B11Globe: React.FC = () => {
  const {frame, t} = useShot();
  const S = wl('b11_globe', 'L11', 4); // "seguro"
  const zoom = kf(frame, [0, 34], [1.0, 2.6], easeOut);
  const view = {cx: 540, cy: 1060, radius: 400, zoom, rotation: MON.lon + 10 - frame * 0.15, tilt: 30};
  const p = globeProject(globeView(view), MON.lat, MON.lon);
  return (
    <Rig s0={1.0} s1={1.06} r0={-2} r1={1} whipIn="down">
      <SpaceBackdrop t={t} driftX={-frame * 2} />
      <Globe {...view} t={t} pins={[{lat: MON.lat, lon: MON.lon, label: 'MÔNACO', color: '#ffd23f', drop: kf(frame, [2, 10], [0, 1]), pulse: ((frame / 20) % 1) * 0.9}]} arrows={[{lat: MON.lat, lon: MON.lon, length: 22, progress: kf(frame, [6, 18], [0, 1]), color: '#ffd23f', width: 10}]} night={0.4} />
      <Svg>
        <circle cx={p.x} cy={p.y} r={kf(frame, [10, 24], [200, 70])} fill="none" stroke="#3be08a" strokeWidth={5} opacity={kf(frame, [10, 16], [0, 0.9])} strokeDasharray="14 10" />
      </Svg>
      <Chip x={540} y={1690} text="PERTO = SEGURO ✓" k={kf(frame, [S, S + 6], [0, 1], easeOut)} color="#3be08a" size={58} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b12–b14 — two points, two (almost equal) arrows */

const PT_A = {x: 380, y: 860, label: 'MESA'};
const PT_B = {x: 820, y: 1330, label: 'IATE'};

const Arrow: React.FC<{x: number; y: number; len: number; k: number; color: string; w?: number}> = ({x, y, len, k, color, w = 22}) => {
  if (k < 0.02) return null;
  const ex = x + len * k;
  return (
    <g style={{filter: `drop-shadow(0 0 10px ${color})`}}>
      <line x1={x} y1={y} x2={ex - w * 1.2} y2={y} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${ex + w * 0.6},${y} L${ex - w * 1.8},${y - w * 1.4} L${ex - w * 1.8},${y + w * 1.4} Z`} fill={color} />
    </g>
  );
};

const PointDot: React.FC<{x: number; y: number; label: string; k: number; color?: string}> = ({x, y, label, k, color = '#ffd23f'}) =>
  k <= 0 ? null : (
    <g opacity={clamp(k * 2)}>
      <circle cx={x} cy={y} r={60 * k} fill={color} opacity={0.25} />
      <circle cx={x} cy={y} r={22 * k} fill={color} stroke="#0b1430" strokeWidth={6} />
      <text x={x} y={y - 46} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={46} fill="#fff" stroke="#0b1430" strokeWidth={8} paintOrder="stroke">
        {label}
      </text>
    </g>
  );

export const B12TwoPts: React.FC = () => {
  const {frame, t} = useShot();
  const line = kf(frame, [4, 16], [0, 1], easeOut);
  const mx = lerp(PT_A.x, PT_B.x, 0.5);
  const my = lerp(PT_A.y, PT_B.y, 0.5);
  return (
    <Rig s0={1.25} s1={1.1} r0={-4} r1={-2} whipIn="zoom" oy={1100}>
      <MonacoMap t={t} />
      <AbsoluteFill style={{background: 'rgba(5,12,30,0.35)'}} />
      <Svg>
        <line x1={PT_A.x} y1={PT_A.y} x2={lerp(PT_A.x, PT_B.x, line)} y2={lerp(PT_A.y, PT_B.y, line)} stroke="#fff" strokeWidth={8} strokeDasharray="22 14" />
        <PointDot x={PT_A.x} y={PT_A.y} label={PT_A.label} k={kf(frame, [0, 6], [0, 1], easeOut)} />
        <PointDot x={PT_B.x} y={PT_B.y} label={PT_B.label} k={kf(frame, [6, 12], [0, 1], easeOut)} color="#7fd8ff" />
      </Svg>
      <Chip x={mx + 40} y={my + 10} text="2 km" k={kf(frame, [12, 18], [0, 1], easeOut)} color="#ffffff" size={64} rot={-4} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

export const B13Arrows: React.FC = () => {
  const {frame, t} = useShot();
  const a = kf(frame, [0, 10], [0, 1], easeOut);
  const b = kf(frame, [3, 13], [0, 1], easeOut);
  const L = 520;
  return (
    <Rig s0={1.1} s1={1.18} x0={20} x1={-30} r0={-2} r1={-3} oy={1100}>
      <MonacoMap t={t} />
      <AbsoluteFill style={{background: 'rgba(5,12,30,0.55)'}} />
      <Svg>
        <line x1={PT_A.x} y1={PT_A.y} x2={PT_B.x} y2={PT_B.y} stroke="#fff" strokeWidth={6} strokeDasharray="22 14" opacity={0.5} />
        <Arrow x={PT_A.x} y={PT_A.y} len={L} k={a} color="#ffd23f" />
        <Arrow x={PT_B.x - 300} y={PT_B.y} len={L - 0.2} k={b} color="#7fd8ff" />
        <circle cx={PT_B.x - 300} cy={PT_B.y} r={22} fill="#7fd8ff" stroke="#0b1430" strokeWidth={6} />
        <PointDot x={PT_A.x} y={PT_A.y} label={PT_A.label} k={1} />
        <text x={PT_A.x + 40} y={PT_A.y + 80} fontFamily={HUD_FONT} fontWeight={700} fontSize={50} fill="#ffd23f" opacity={a} stroke="#0b1430" strokeWidth={8} paintOrder="stroke">
          {Math.round(V_MON).toLocaleString('pt-BR')},0 km/h
        </text>
        <text x={PT_B.x - 260} y={PT_B.y + 80} fontFamily={HUD_FONT} fontWeight={700} fontSize={50} fill="#7fd8ff" opacity={b} stroke="#0b1430" strokeWidth={8} paintOrder="stroke">
          {Math.round(V_MON).toLocaleString('pt-BR')},5 km/h
        </text>
        <text x={PT_B.x - 300} y={PT_B.y - 46} fontFamily={HUD_FONT} fontWeight={700} fontSize={46} fill="#fff" stroke="#0b1430" strokeWidth={8} paintOrder="stroke" opacity={b}>
          IATE
        </text>
      </Svg>
      <div style={{position: 'absolute', left: 60, top: 560, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: '#fff', textShadow: '0 2px 8px #000'}}>VELOCIDADE DO CHÃO</div>
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

export const B14Delta: React.FC = () => {
  const {frame, t} = useShot();
  const stack = kf(frame, [0, 10], [0, 1], easeOut);
  const zoom = kf(frame, [8, 22], [0, 1], easeOut);
  const L = 640;
  const x0 = 180;
  const yA = lerp(820, 960, stack);
  const yB = lerp(1200, 1010, stack);
  return (
    <Rig s0={1.0} s1={1.06} r0={1} r1={-1}>
      <SpaceBackdrop t={t} driftX={-frame} />
      <Svg>
        <Arrow x={x0} y={yA} len={L} k={1} color="#ffd23f" w={26} />
        <Arrow x={x0} y={yB} len={L - 3} k={1} color="#7fd8ff" w={26} />
        {/* magnifier on the tips */}
        <g opacity={zoom}>
          <circle cx={x0 + L} cy={985} r={90} fill="none" stroke="#fff" strokeWidth={8} />
          <line x1={x0 + L + 64} y1={985 + 64} x2={x0 + L + 150} y2={985 + 150} stroke="#fff" strokeWidth={18} strokeLinecap="round" />
          <line x1={x0 + L - 3} y1={940} x2={x0 + L - 3} y2={1030} stroke="#ff5a5a" strokeWidth={4} />
          <line x1={x0 + L} y1={940} x2={x0 + L} y2={1030} stroke="#ff5a5a" strokeWidth={4} />
        </g>
      </Svg>
      <Chip x={540} y={700} text="2 km → Δ 0,5 km/h" k={kf(frame, [2, 9], [0, 1], easeOut)} color="#ffd23f" size={66} />
      <Stamp x={540} y={1250} text="SEGURO ✓" k={kf(frame, [14, 19], [0, 1], easeOut)} color="#1fa463" rot={-6} size={110} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b15 — "Um passinho." */

export const B15Step: React.FC = () => {
  const {frame, t} = useShot();
  const st = kf(frame, [3, 14], [0, 1], easeOut);
  const prints = [0, 1, 2, 3];
  return (
    <Rig s0={1.05} s1={1.12} x0={-20} x1={10} whipIn="right" oy={1300}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 55%, #fff3c9 0%, #f2c96b 100%)'}} />
      <Svg>
        {/* ground line + tiny ruler */}
        <rect x={-100} y={1640} width={1280} height={400} fill="#e8b452" />
        <line x1={-100} y1={1640} x2={1180} y2={1640} stroke="#a77a22" strokeWidth={8} />
        {prints.map((i) => (
          <Footprint key={i} x={170 + i * 70} y={1760} s={0.42} rot={90} color="#a77a22" flip={i % 2 === 1} />
        ))}
        <Footprint x={460} y={1760} s={0.42} rot={90} color="#10131f" flip />
        <g opacity={kf(frame, [8, 14], [0, 1])}>
          <line x1={420} y1={1830} x2={520} y2={1830} stroke="#10131f" strokeWidth={6} />
          <line x1={420} y1={1810} x2={420} y2={1850} stroke="#10131f" strokeWidth={6} />
          <line x1={520} y1={1810} x2={520} y2={1850} stroke="#10131f" strokeWidth={6} />
        </g>
      </Svg>
      {/* Davi doing a dainty tip-toe step */}
      <PlacedDavi x={lerp(560, 610, st)} y={1640 - Math.sin(st * Math.PI) * 30} height={1050} light={TERRACE_LIGHT} pose={{hipL: lerp(-4, -24, Math.sin(st * Math.PI)), knL: Math.sin(st * Math.PI) * 30, hipR: 8, shL: -40, elL: -60, shR: 60, elR: 80, lean: 3, headTilt: -6}} expr={{halfSmile: 0.8, smile: 0.4, browRaise: 0.6, lookX: 0.2, lookY: 0.6}} />
      <Chip x={540} y={660} text="👣 UM PASSINHO" k={kf(frame, [0, 6], [0, 1], easeOut)} color="#10131f" size={62} bg="rgba(255,255,255,0.92)" />
      <Finish vignette={0.3} grain={0.08} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b16 — "Pra onde?" */

export const B16Where: React.FC = () => {
  const {frame, t} = useShot();
  const look = frame < 8 ? -0.9 : frame < 16 ? 0.9 : 0;
  return (
    <Rig s0={1.1} s1={1.2} r0={2} r1={-1} whipIn="left" oy={1000}>
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.1)'}}>
        <TerraceBG t={t + 120} horizon={700} balY={1000} />
      </AbsoluteFill>
      <CloseUp who="davi" cx={560} cy={1020} k={3.5} facing={0.1} light={TERRACE_LIGHT} expr={{lookX: look, lookY: -0.1, browTilt: 0.3, browRaise: 0.4, smile: -0.1}} />
      <Chip x={240} y={720} text="?" k={kf(frame, [4, 8], [0, 1], easeOut)} color="#ffd23f" size={110} rot={-10} />
      <Chip x={860} y={700} text="?" k={kf(frame, [10, 14], [0, 1], easeOut)} color="#ffd23f" size={80} rot={12} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b17/b18 — the 312 watched photos; the yacht isn't in any */

const THUMB_COLS = ['#e99c6c', '#8fc1d4', '#f2c14e', '#b9d7a8', '#e88c7d', '#c7a3e0', '#6fa0d8', '#f3e3c3'];

const Gallery: React.FC<{frame: number; scan: number}> = ({frame, scan}) => (
  <AbsoluteFill style={{background: '#0d1118'}}>
    <div style={{position: 'absolute', left: 50, top: 70, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 64, color: '#fff'}}>Fotos</div>
    <div style={{position: 'absolute', right: 50, top: 86, fontFamily: HUD_FONT, fontSize: 42, color: '#ff6b5e'}}>312 · VIGIADAS</div>
    <Svg>
      {Array.from({length: 48}).map((_, i) => {
        const c = i % 4;
        const r = Math.floor(i / 4);
        const x = 30 + c * 258;
        const y = 200 + r * 258;
        const seen = y < scan;
        return (
          <g key={i}>
            <rect x={x} y={y} width={250} height={250} fill={THUMB_COLS[(i * 3) % THUMB_COLS.length]} />
            <path d={`M${x},${y + 250} L${x + 80 + (i % 3) * 30},${y + 150} L${x + 150},${y + 210} L${x + 250},${y + 120} L${x + 250},${y + 250} Z`} fill="#000" opacity={0.25} />
            <circle cx={x + 190} cy={y + 60} r={26} fill="#fff" opacity={0.5} />
            {seen && (
              <g>
                <rect x={x} y={y} width={250} height={250} fill="#ff3b3b" opacity={0.25} />
                <g transform={`translate(${x + 200},${y + 200})`}>
                  <path d="M0,0 C-5,-14 -20,-26 -20,-40 A20,20 0 1 1 20,-40 C20,-26 5,-14 0,0 Z" fill="#ff3b3b" stroke="#fff" strokeWidth={4} />
                  <circle cx={0} cy={-40} r={8} fill="#fff" />
                </g>
              </g>
            )}
          </g>
        );
      })}
      <rect x={0} y={scan - 6} width={1080} height={12} fill="#ff5a5a" opacity={0.9} style={{filter: 'drop-shadow(0 0 16px #ff3b3b)'}} />
    </Svg>
  </AbsoluteFill>
);

export const B17Photos: React.FC = () => {
  const {frame} = useShot();
  const scan = kf(frame, [0, 40], [150, 2300], (x) => x);
  return (
    <Rig s0={1.0} s1={1.08} r0={-3} r1={-1} whipIn="up" oy={1100}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1b2440 0%, #05070d 100%)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: 'rotate(-4deg)'}}>
        <PhoneFrame w={680} glow={0.8}>
          <Gallery frame={frame} scan={scan} />
        </PhoneFrame>
      </AbsoluteFill>
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

export const B18None: React.FC = () => {
  const {frame, t} = useShot();
  const k = kf(frame, [0, 6], [0, 1], easeOut);
  return (
    <Rig s0={1.05} s1={1.12} r0={2} r1={0} impacts={[{at: 1, amp: 18, zoom: 0.04}]}>
      <AbsoluteFill style={{filter: 'blur(10px) brightness(0.55)', transform: 'scale(1.1) rotate(-4deg)'}}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <PhoneFrame w={680} glow={0.4}>
            <Gallery frame={frame} scan={2400} />
          </PhoneFrame>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* the yacht "photo slot": empty, dashed */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 640, height: 560, borderRadius: 30, border: '8px dashed #ffffff', background: 'rgba(10,20,46,0.85)', transform: `scale(${lerp(0.6, 1, k)}) rotate(${lerp(-8, 2, k)}deg)`, opacity: k}}>
          <svg width={640} height={560} viewBox="-320 -330 640 560">
            <YachtIcon x={0} y={0} s={1.5} />
            <path d="M-160,-200 L160,120 M160,-200 L-160,120" stroke="#ff3b3b" strokeWidth={30} strokeLinecap="round" opacity={kf(frame, [5, 9], [0, 1])} />
          </svg>
        </div>
      </AbsoluteFill>
      <Stamp x={540} y={1300} text="NÃO ESTÁ NAS FOTOS ✗" k={kf(frame, [3, 8], [0, 1], easeOut)} color="#e8322f" rot={-5} size={64} />
      <Particles t={t} seed="b18" count={10} bokeh={4} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ b19/b20 — memory: the yacht he saw minutes ago, from the table */

const Memory: React.FC<{children: React.ReactNode}> = ({children}) => (
  <>
    <AbsoluteFill style={{filter: 'grayscale(0.6) sepia(0.35) brightness(1.05)'}}>{children}</AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0) 50%, rgba(235,240,255,0.75) 100%)', pointerEvents: 'none'}} />
  </>
);

const YACHT = {x: 260, y: 700};

export const B19Memory: React.FC = () => {
  const {frame, t} = useShot();
  const I = wl('b19_memory', 'L12', 11); // "iate"
  const ring = kf(frame, [I + 2, I + 10], [0, 1], easeOut);
  return (
    <Rig s0={1.04} s1={1.16} x0={10} x1={-30} r0={-1} r1={1} whipIn="zoom" oy={900}>
      <Memory>
        <TerraceBG t={t + 200} horizon={640} balY={930} px={frame} />
        <Svg>
          <YachtIcon x={YACHT.x} y={YACHT.y} s={0.6} glow={ring} />
        </Svg>
        <ChairBack x={LIA_SEAT.x} y={1330} s={1.05} />
        <ChairBack x={760} y={1330} s={1.05} />
        <PlacedLia x={LIA_SEAT.x} y={LIA_SEAT.y} height={SIT_H} light={TERRACE_LIGHT} pose={{facing: 0.4, shR: 18, elR: -70}} expr={{smile: 0.6, lookX: 0.6}} />
        <PlacedDavi x={760} y={1545} height={SIT_H + 20} light={TERRACE_LIGHT} pose={{facing: -0.5, shL: -12, shR: 10, headTilt: -6}} expr={{lookX: -0.9, lookY: -0.6, halfSmile: 0.4}} />
        <DinnerTable x={TABLE.x} y={TABLE.y} s={TABLE.s} t={t + 200} />
      </Memory>
      <Svg>
        <circle cx={YACHT.x} cy={YACHT.y - 20} r={lerp(260, 130, ring)} fill="none" stroke="#ffd23f" strokeWidth={8} opacity={ring} />
        {/* eye-line from Davi to the yacht */}
        <line x1={720} y1={860} x2={lerp(720, YACHT.x + 120, ring)} y2={lerp(860, YACHT.y, ring)} stroke="#ffd23f" strokeWidth={5} strokeDasharray="16 12" opacity={ring} />
      </Svg>
      <Chip x={YACHT.x + 40} y={YACHT.y + 190} text="IATE" k={ring} color="#ffd23f" size={54} rot={-4} />
      <div style={{position: 'absolute', left: 60, top: 560, padding: '8px 22px', background: 'rgba(255,255,255,0.85)', color: '#10131f', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 34, letterSpacing: 4, transform: 'rotate(-3deg)'}}>⏪ MINUTOS ANTES</div>
      <Finish vignette={0.35} grain={0.14} />
    </Rig>
  );
};

export const B20Pov: React.FC = () => {
  const {frame, t} = useShot();
  const z = kf(frame, [0, 24], [1, 2.3], easeOut);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${YACHT.x}px ${YACHT.y - 20}px`}}>
        <Memory>
          <TerraceBG t={t + 210} horizon={640} balY={930} />
          <Svg>
            <YachtIcon x={YACHT.x} y={YACHT.y} s={0.6} glow={1} />
          </Svg>
        </Memory>
      </AbsoluteFill>
      {/* focus iris */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(0,0,0,0) ${lerp(60, 26, kf(frame, [0, 20], [0, 1]))}%, rgba(5,8,20,0.85) ${lerp(70, 34, kf(frame, [0, 20], [0, 1]))}%)`}} />
      <Chip x={540} y={1240} text="VISTO AGORA ✓" k={kf(frame, [6, 12], [0, 1], easeOut)} color="#3be08a" size={58} />
      <Finish vignette={0.3} grain={0.14} />
    </AbsoluteFill>
  );
};
