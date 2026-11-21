import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Finish} from '../../scenes/common';
import {Flash} from '../../fx/Rastro';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {ReadTag} from '../ReadTag';
import {MetroHall, Turnstile} from '../sets/Metro';
import {Rig, ShotP, abs, ev} from './rig';
import {AG_BALD, AG_BLUE, AG_LEFT, CHEFE, Chip, DAVI_OUTFIT, EnergyLines, Glitch, ImpactWord, METRO_LIGHT, Pup, Svg, Sweat, headOf, run, walkP} from './kit';

/* 5. "O da esquerda vai pular a catraca." — tag PULA CATRACA 96%, he vaults it on "catraca". */
export const SCatraca: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const J = ev(p, 'L10', 6); // "catraca"
  const tagAt = ev(p, 'L10', 2);
  const appr = kf(fr, [0, J - 3], [0, 1], (x) => x);
  const v = clamp((fr - (J - 3)) / 10);
  const inVault = fr >= J - 3 && fr < J + 7;
  const x = fr < J - 3 ? lerp(1020, 700, appr) : lerp(700, 330, Math.min(1, v * 1.1)) - Math.max(0, fr - J - 7) * 30;
  const y = 1420 - Math.sin(Math.PI * Math.min(1, v)) * 330;
  const h = 860;
  const hd = headOf(x, y, h);
  const pose = inVault ? {lean: -35, shL: -10, elL: 20, shR: 10, elR: -20, hipL: 60, knL: -110, hipR: 75, knR: -120} : {...run(t, 0, 1), lean: -12};
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.12]} pan={[40, 0, -30, 0]} rot={[-1, 1]} pow={1.3} shakes={[{at: J + 7, amp: 10, dur: 8}]}>
      <MetroHall t={t} px={-fr * 4} floorY={1220} />
      {/* Davi far away, already through */}
      <Pup outfit={DAVI_OUTFIT} x={140 - fr * 6} y={1250} height={330} light={METRO_LIGHT} pose={{...run(t, 1), lean: -10}} blur={1.5} />
      <Svg>
        <Turnstile x={560} y={1440} s={0.95} led="red" arm={fr > J ? (fr - J) * -6 : 0} />
      </Svg>
      <Pup outfit={AG_LEFT} x={x} y={y} height={h} light={METRO_LIGHT} pose={pose} expr={{mouthOpen: inVault ? 0.4 : 0.1, browTilt: -0.6}} rot={inVault ? -12 : 0} pivotY={-480} />
      <Svg>
        <Turnstile x={1020} y={1500} s={1.05} led="red" />
      </Svg>
      <ReadTag label="PULA CATRACA" pct={96} x={90} y={560} tx={hd.x} ty={hd.y} from={tagAt} />
      <EnergyLines x={hd.x} y={hd.y} r={hd.r * 1.4} t={t} k={kf(fr, [tagAt, tagAt + 4, tagAt + 14], [0, 0.8, 0])} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 6. "O de azul tá com medo." — trembling, sweating: MEDO 91%. */
export const SMedo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tagAt = ev(p, 'L10', 9);
  const tr = Math.sin(fr * 2.7) * 5;
  const h = 1700;
  const X = 560 + tr;
  const Y = 2450;
  const hd = headOf(X, Y, h);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[-20, 0, 20, 0]} rot={[1.5, -1]} whip="l">
      <AbsoluteFill style={{filter: 'blur(9px)'}}>
        <MetroHall t={t} px={-200 - fr * 3} floorY={1500} />
      </AbsoluteFill>
      <Pup
        outfit={AG_BLUE}
        x={X}
        y={Y}
        height={h}
        upperOnly
        light={METRO_LIGHT}
        pose={{shL: -20, elL: 120, shR: 20, elR: -120, headTilt: tr * 0.5}}
        expr={{browTilt: 1, browRaise: 0.6, smile: -0.7, mouthOpen: 0.15 + Math.abs(Math.sin(fr * 3)) * 0.12}}
      />
      <Sweat x={hd.x} y={hd.y - hd.r * 0.6} t={t} s={1.6} n={6} />
      <ReadTag label="MEDO" pct={91} x={90} y={540} tx={hd.x - hd.r * 0.5} ty={hd.y - hd.r * 0.2} from={tagAt} scale={1.2} />
      <EnergyLines x={hd.x} y={hd.y} r={hd.r * 1.3} t={t} k={kf(fr, [tagAt, tagAt + 4, tagAt + 14], [0, 0.8, 0])} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 7. "O careca vai tropeçar." — bald agent sprinting at camera, untied shoelace, TROPEÇA 99%; he starts to stumble. */
export const SCareca: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tagAt = ev(p, 'L10', 14);
  const u = fr / p.dur;
  const h = lerp(700, 1100, u);
  const y = lerp(1450, 1720, u);
  const x = 560 + Math.sin(t * 7.5) * 15;
  const st = kf(fr, [p.dur - 9, p.dur], [0, 1], easeIn);
  const hd = headOf(x, y, h);
  const pose = {...run(t, 0, 0.8), lean: lerp(0, 22, st), shL: lerp(-40, -150, st), shR: lerp(40, 150, st)};
  const lk = h / 1000;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} rot={[-1, 2]} whip="r">
      <MetroHall t={t} px={Math.sin(fr * 0.3) * 10} floorY={1260} />
      <Pup outfit={AG_BALD} x={x} y={y} height={h} light={METRO_LIGHT} pose={pose} expr={{browTilt: -0.5, mouthOpen: 0.2 + st * 0.5, eyesWide: st}} rot={st * 8} pivotY={-480} />
      {/* untied shoelace flapping */}
      <Svg>
        <path d={`M ${x + 56 * lk},${y - 30 * lk} q ${30 * lk},${20 * lk + Math.sin(fr * 1.4) * 15} ${70 * lk},${10 * lk} q ${20 * lk},${-10 * lk} ${50 * lk},${15 * lk + Math.cos(fr * 1.4) * 15}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
        <circle cx={x + 110 * lk} cy={y - 10 * lk} r={90 * lk} fill="none" stroke="#ffd23a" strokeWidth={5} strokeDasharray="12 8" opacity={kf(fr, [tagAt + 6, tagAt + 10], [0, 1])} />
      </Svg>
      <ReadTag label="TROPEÇA" pct={99} x={80} y={560} tx={hd.x} ty={hd.y} from={tagAt} scale={1.15} />
      <Chip x={x + 260 * lk} y={y + 30} text="CADARÇO" k={kf(fr, [tagAt + 8, tagAt + 13], [0, 1], easeOut)} size={30} />
      <EnergyLines x={hd.x} y={hd.y} r={hd.r * 1.4} t={t} k={kf(fr, [tagAt, tagAt + 4, tagAt + 14], [0, 0.8, 0])} />
      <Finish vignette={0.45} grain={0.1} />
    </Rig>
  );
};

/* 8. "Tropeçou." — cartoon faceplant, PLAFT, stars. */
export const SPlaft: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const I = 4; // impact frame
  const fall = kf(fr, [0, I], [38, 88], easeIn);
  const bounce = fr > I ? Math.max(0, Math.sin((fr - I) * 0.9)) * 6 * Math.exp(-(fr - I) * 0.25) : 0;
  const h = 760;
  const fx = 250;
  const fy = 1500;
  const headX = fx + Math.sin((fall * Math.PI) / 180) * 884 * (h / 1000);
  const headY = fy - Math.cos((fall * Math.PI) / 180) * 884 * (h / 1000);
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} rot={[2, 0]} pow={2} shakes={[{at: I, amp: 34, dur: 12}]} punches={[{at: I, amt: 0.14, len: 10}]}>
      <MetroHall t={t} px={-120} floorY={1120} />
      <Svg>
        <ellipse cx={(fx + headX) / 2} cy={fy + 10} rx={420} ry={30} fill="#000" opacity={0.25} />
      </Svg>
      <Pup outfit={AG_BALD} x={fx} y={fy} height={h} light={METRO_LIGHT} rot={fall - bounce} pose={{shL: -170, elL: 0, shR: 170, elR: 0, hipL: -20, knL: 50, hipR: 10, knR: 70}} expr={{eyesWide: fr < I ? 1 : 0, blink: fr >= I ? 1 : 0, mouthOpen: fr < I ? 0.8 : 0.3}} />
      {/* dust */}
      <Svg>
        {fr >= I &&
          Array.from({length: 10}).map((_, i) => {
            const k = clamp((fr - I) / 14);
            const r = (q: string) => random(`pd${i}${q}`);
            const cx = headX - 120 + r('x') * 240 + (r('x') - 0.5) * k * 300;
            const cy = fy - k * (40 + r('y') * 120);
            return <circle key={i} cx={cx} cy={cy} r={20 + k * 40 * r('s')} fill="#d9d4c8" opacity={(1 - k) * 0.7} />;
          })}
        {/* stars */}
        {fr >= I + 5 &&
          [0, 1, 2].map((i) => {
            const a = t * 7 + (i * Math.PI * 2) / 3;
            const sx = headX + Math.cos(a) * 110;
            const sy = headY - 160 + Math.sin(a) * 30;
            return <path key={i} d={`M ${sx},${sy - 26} L ${sx + 8},${sy - 8} L ${sx + 26},${sy - 6} L ${sx + 12},${sy + 6} L ${sx + 16},${sy + 26} L ${sx},${sy + 14} L ${sx - 16},${sy + 26} L ${sx - 12},${sy + 6} L ${sx - 26},${sy - 6} L ${sx - 8},${sy - 8} Z`} fill="#ffd23a" stroke="#7a5a00" strokeWidth={3} />;
          })}
      </Svg>
      <ImpactWord text="PLAFT!" x={600} y={1000} k={clamp((fr - I) / 16)} color="#ffd23a" rot={-6} />
      <Flash k={kf(fr, [I, I + 1, I + 4], [0, 0.4, 0], (x) => x)} color="255,255,255" />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 9. "Aí chega o chefe." — slow-motion entrance, low angle, backlit. */
export const SChefe: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const slow = t * 0.32;
  const h = lerp(1350, 1500, fr / p.dur);
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} rot={[-2, -1]} pan={[0, 30, 0, 0]} pow={1} whip="u" origin={[540, 1300]}>
      <AbsoluteFill style={{filter: 'blur(5px) brightness(0.8)'}}>
        <MetroHall t={t} px={-40} floorY={1500} ceilY={150} flicker={0.4} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 40% at 50% 40%, rgba(220,255,240,0.55), rgba(0,0,0,0) 70%)'}} />
      <Pup outfit={CHEFE} x={540} y={1980} height={h} light={{side: 1, rim: '#eafff8', rimStrength: 1, shadeStrength: 0.85}} pose={{...walkP(slow, 0, 0.7), shR: 12, elR: -6}} expr={{}} />
      {/* slow dust motes */}
      <Svg>
        {Array.from({length: 24}).map((_, i) => {
          const r = (q: string) => random(`cm${i}${q}`);
          return <circle key={i} cx={r('x') * 1080 + fr * 0.6} cy={r('y') * 1500 + 200 - fr * 0.8 * r('s')} r={2 + r('s') * 4} fill="#eafff8" opacity={0.5} />;
        })}
      </Svg>
      <Chip x={540} y={1690} text="ALVO NOVO: CHEFE" k={kf(fr, [6, 12], [0, 1], easeOut)} size={36} color="#7fe8ff" />
      <Finish vignette={0.7} grain={0.12} />
    </Rig>
  );
};

/** Huge boss head (face close-ups). Head centre (cx, cy), radius r px. */
const BossFace: React.FC<{cx: number; cy: number; r: number; expr?: object; tilt?: number; shine?: number}> = ({cx, cy, r, expr = {}, tilt = 0, shine = 1}) => {
  const h = r / 0.122;
  return (
    <>
      <Pup outfit={CHEFE} x={cx} y={cy + 884 * (h / 1000)} height={h} upperOnly light={METRO_LIGHT} pose={{headTilt: tilt}} expr={expr} />
      {/* plastic forehead shine (botox) */}
      <Svg>
        <ellipse cx={cx - r * 0.25} cy={cy - r * 0.62} rx={r * 0.32} ry={r * 0.1} fill="#fff" opacity={0.45 * shine} transform={`rotate(-12 ${cx - r * 0.25} ${cy - r * 0.62})`} />
        <ellipse cx={cx + r * 0.42} cy={cy + r * 0.12} rx={r * 0.12} ry={r * 0.06} fill="#fff" opacity={0.3 * shine} />
      </Svg>
    </>
  );
};

/* 10. "O rosto dele não mexe." — frozen face close-up; scan line finds no movement. */
export const SRosto: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const sy = 560 + ((fr * 38) % 760);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} rot={[0, 0]} pow={1} whip="d" origin={[540, 900]}>
      <AbsoluteFill style={{filter: 'blur(12px)'}}>
        <MetroHall t={t} px={-300} floorY={1700} />
      </AbsoluteFill>
      <BossFace cx={540} cy={930} r={330} />
      <Svg>
        <rect x={160} y={sy} width={760} height={6} fill="#7fe8ff" opacity={0.9} />
        <rect x={160} y={sy - 50} width={760} height={50} fill="#7fe8ff" opacity={0.15} />
        {[-1, 1].map((sx) =>
          [-1, 1].map((syy) => {
            const bx = 540 + sx * 380;
            const by = 930 + syy * 380;
            return <path key={`${sx}${syy}`} d={`M ${bx},${by - syy * 80} L ${bx},${by} L ${bx - sx * 80},${by}`} stroke="#7fe8ff" strokeWidth={8} fill="none" />;
          }),
        )}
      </Svg>
      <Chip x={540} y={1690} text="MOVIMENTO: 0" k={kf(fr, [14, 19], [0, 1], easeOut)} color="#7fe8ff" />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/** Face muscle map (stylised, front view) centred on (cx, cy) with head radius r. */
const MUSCLES: {x: number; y: number; rx: number; ry: number; a: number}[] = [
  {x: -0.3, y: -0.62, rx: 0.26, ry: 0.16, a: 10}, // frontalis
  {x: 0.3, y: -0.62, rx: 0.26, ry: 0.16, a: -10},
  {x: 0, y: -0.38, rx: 0.08, ry: 0.12, a: 0}, // procerus
  {x: -0.34, y: -0.04, rx: 0.2, ry: 0.15, a: 0}, // orbicularis oculi
  {x: 0.34, y: -0.04, rx: 0.2, ry: 0.15, a: 0},
  {x: -0.14, y: -0.32, rx: 0.12, ry: 0.05, a: 20}, // corrugator
  {x: 0.14, y: -0.32, rx: 0.12, ry: 0.05, a: -20},
  {x: -0.44, y: 0.3, rx: 0.07, ry: 0.24, a: 35}, // zygomaticus
  {x: 0.44, y: 0.3, rx: 0.07, ry: 0.24, a: -35},
  {x: 0, y: 0.52, rx: 0.24, ry: 0.11, a: 0}, // orbicularis oris
  {x: -0.62, y: 0.2, rx: 0.12, ry: 0.28, a: 5}, // masseter
  {x: 0.62, y: 0.2, rx: 0.12, ry: 0.28, a: -5},
  {x: 0, y: 0.78, rx: 0.16, ry: 0.08, a: 0}, // mentalis
];

/* 11. "Botox. Músculo paralisado," — x-ray: muscles switch off one by one; BOTOX stamp. */
export const SRaioX: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const P = ev(p, 'L11', 10);
  const cx = 540;
  const cy = 940;
  const r = 340;
  const stamp = kf(fr, [1, 5], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} rot={[1, -1]} pow={1.2} punches={[{at: 2, amt: 0.08}]} shakes={[{at: 3, amp: 12, dur: 8}]}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 48%, #0e2f4a 0%, #050b14 75%)'}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(127,232,255,0.06) 0 2px, transparent 2px 8px)'}} />
      <Svg>
        {/* skull/face outline */}
        <ellipse cx={cx} cy={cy} rx={r * 0.92} ry={r * 1.12} fill="rgba(127,232,255,0.06)" stroke="#7fe8ff" strokeWidth={5} />
        <ellipse cx={cx - r * 0.34} cy={cy - r * 0.04} rx={r * 0.12} ry={r * 0.08} fill="none" stroke="#7fe8ff" strokeWidth={3} />
        <ellipse cx={cx + r * 0.34} cy={cy - r * 0.04} rx={r * 0.12} ry={r * 0.08} fill="none" stroke="#7fe8ff" strokeWidth={3} />
        <path d={`M ${cx},${cy - r * 0.05} L ${cx - r * 0.08},${cy + r * 0.28} L ${cx + r * 0.08},${cy + r * 0.28}`} fill="none" stroke="#7fe8ff" strokeWidth={3} />
        {MUSCLES.map((m, i) => {
          const off = clamp((fr - (4 + i * 1.2)) / 3);
          const pulse = 0.75 + 0.25 * Math.sin(t * 14 + i);
          const col = off >= 1 ? '#5d6470' : `rgb(${Math.round(lerp(255, 93, off))},${Math.round(lerp(120, 100, off))},${Math.round(lerp(60, 112, off))})`;
          return (
            <g key={i} transform={`rotate(${m.a} ${cx + m.x * r} ${cy + m.y * r})`}>
              <ellipse cx={cx + m.x * r} cy={cy + m.y * r} rx={m.rx * r} ry={m.ry * r} fill={col} opacity={off >= 1 ? 0.55 : 0.85 * pulse} />
              {Array.from({length: 4}).map((_, k) => (
                <line key={k} x1={cx + m.x * r - m.rx * r * 0.7} y1={cy + m.y * r + (k - 1.5) * m.ry * r * 0.4} x2={cx + m.x * r + m.rx * r * 0.7} y2={cy + m.y * r + (k - 1.5) * m.ry * r * 0.4} stroke="#000" strokeWidth={2} opacity={0.25} />
              ))}
            </g>
          );
        })}
      </Svg>
      {fr >= P && (
        <Svg>
          {[[-0.3, -0.62], [0.34, -0.04], [0.44, 0.3]].map(([mx, my], i) => (
            <text key={i} x={cx + mx * r} y={cy + my * r + 10} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={34} fill="#fff" opacity={clamp((fr - P - i * 2) / 3)}>
              OFF
            </text>
          ))}
        </Svg>
      )}
      {/* BOTOX stamp */}
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 1210,
          transform: `translate(-50%,-50%) rotate(-10deg) scale(${lerp(2.2, 1, stamp)})`,
          opacity: stamp,
          border: '10px solid #ff3b3b',
          borderRadius: 18,
          padding: '4px 34px',
          color: '#ff3b3b',
          fontFamily: CAPTION_FONT,
          fontWeight: 700,
          fontSize: 120,
          letterSpacing: 8,
          background: 'rgba(255,59,59,0.08)',
        }}
      >
        BOTOX
      </div>
      <Chip x={540} y={1680} text="MÚSCULO PARALISADO" k={kf(fr, [P, P + 5], [0, 1], easeOut)} color="#ff6a4a" size={40} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 12. "zero microexpressão." — monitor: a normal person spikes, the boss is a flat line. */
export const SFlat: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const draw = kf(fr, [0, p.dur - 4], [0.15, 1], (x) => x);
  const X0 = 110;
  const X1 = 970;
  const pts = (base: number, spiky: boolean) => {
    const n = 90;
    const arr: string[] = [];
    for (let i = 0; i <= n * draw; i++) {
      const x = X0 + ((X1 - X0) * i) / n;
      const sp = spiky ? (random(`sp${i}`) > 0.82 ? -(40 + random(`sq${i}`) * 90) : Math.sin(i * 0.9) * 6) : 0;
      arr.push(`${x},${base + sp}`);
    }
    return arr.join(' ');
  };
  const head = X0 + (X1 - X0) * draw;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[0, 0, -20, 0]} rot={[-1, 0]} whip="r">
      <AbsoluteFill style={{background: '#050b10'}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(60,255,140,0.07) 0 2px, transparent 2px 60px), repeating-linear-gradient(90deg, rgba(60,255,140,0.07) 0 2px, transparent 2px 60px)'}} />
      <Svg>
        <text x={X0} y={620} fontFamily={HUD_FONT} fontWeight={700} fontSize={38} letterSpacing={4} fill="#7f8c99">
          PESSOA COMUM
        </text>
        <polyline points={pts(800, true)} fill="none" stroke="#7f8c99" strokeWidth={6} strokeLinejoin="round" opacity={0.75} />
        <text x={X0} y={1010} fontFamily={HUD_FONT} fontWeight={700} fontSize={38} letterSpacing={4} fill="#3dff8a">
          CHEFE
        </text>
        <polyline points={pts(1180, false)} fill="none" stroke="#3dff8a" strokeWidth={8} />
        <circle cx={head} cy={1180} r={12} fill="#3dff8a" />
        <circle cx={head} cy={1180} r={30} fill="#3dff8a" opacity={0.25 + 0.15 * Math.sin(t * 20)} />
      </Svg>
      <Chip x={540} y={1690} text="MICROEXPRESSÃO: 0" k={kf(fr, [4, 9], [0, 1], easeOut)} color="#3dff8a" />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* 13. "Leitura: zero por cento." — Davi's HUD on the boss scrambles, then crashes into LEITURA 0% (error). */
export const SLeitura: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const Z = ev(p, 'L11', 15); // "zero"
  const scr = String(Math.floor(random(`lsc${Math.floor(fr / 2)}`) * 99)).padStart(2, '0');
  const g = fr < Z ? kf(fr, [4, Z], [0, 0.35]) : kf(fr, [Z, Z + 3, Z + 12, p.dur], [0.4, 1, 0.45, 0.3], (x) => x);
  const hd = {x: 540, y: 900, r: 250};
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pow={1.4} whip="l" shakes={[{at: Z, amp: 26, dur: 12}]} punches={[{at: Z, amt: 0.08}]}>
      <AbsoluteFill style={{filter: 'blur(10px)'}}>
        <MetroHall t={t} px={-500} floorY={1600} />
      </AbsoluteFill>
      <BossFace cx={hd.x} cy={hd.y} r={hd.r} />
      {/* HUD frame */}
      <Svg>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sy) => {
            const bx = 540 + sx * 470;
            const by = 960 + sy * 760;
            return <path key={`${sx}${sy}`} d={`M ${bx},${by - sy * 110} L ${bx},${by} L ${bx - sx * 110},${by}`} stroke={fr < Z ? '#ffd23a' : '#ff3b3b'} strokeWidth={8} fill="none" opacity={0.8} />;
          }),
        )}
      </Svg>
      {fr < Z ? (
        <ReadTag label="LEITURA" text={`${scr}%`} x={90} y={1180} tx={hd.x - 90} ty={hd.y} from={0} scale={1.3} />
      ) : (
        <ReadTag label="LEITURA" text="0%" error x={90} y={1180} tx={hd.x - 90} ty={hd.y} from={Z - 3} scale={1.6} />
      )}
      <Glitch k={g} frame={fr} />
      <Flash k={kf(fr, [Z, Z + 1, Z + 5], [0, 0.45, 0], (x) => x)} color="255,50,50" />
      <Finish vignette={0.55} grain={0.12} />
    </Rig>
  );
};

