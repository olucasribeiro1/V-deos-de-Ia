import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {PlacedBruno, BRUNO_OUTFIT} from '../characters';
import {Rig, ShotP, SpeedLines, abs, ev} from './rig';
import {Arena, SandSplash} from './arena';
import {
  ARENA_LIGHT,
  BigHand,
  Chip,
  Crab,
  CutFlash,
  DAVI_OUTFIT,
  EnergyLines,
  Finish,
  HudTag,
  Label,
  Paper,
  Pup,
  SoundWord,
  Stamp,
  Svg,
  Sweat,
  clamp,
  easeOut,
  kf,
  lerp,
  seismoPath,
  trem,
} from './kit';

/** Clip children to everything above screen y (sunk in the sand). */
const Above: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => (
  <AbsoluteFill style={{clipPath: `inset(0 0 ${Math.max(0, 1920 - y)}px 0)`}}>{children}</AbsoluteFill>
);

/** Front-view charge cycle (towards camera). */
const chargePose = (t: number, k = 1) => {
  const s = Math.sin(t * 14);
  return {shL: 20 + s * 25 * k, elL: 70, shR: -20 + s * 25 * k, elR: -70, hipL: -6, knL: Math.max(0, s) * 25 * k, hipR: 6, knR: -Math.max(0, -s) * 25 * k, bob: -Math.abs(Math.cos(t * 14)) * 30 * k, lean: 3};
};

const ANGRY = {halfSmile: 0, smile: -0.5, browTilt: -1, mouthOpen: 0.6, eyesWide: 0.3, browAsym: 0};

/* ================================================================== L11 */

/* "O Bruno parte pra cima com um" — Bruno charges straight at camera, sand kicking up, speed lines. */
export const SParte: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = kf(fr, [0, p.dur], [0, 1], (x) => x * x);
  const h = lerp(700, 1700, k);
  const y = lerp(1500, 2250, k);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[1, -1.5]} whip="d" shakes={[{at: 4, amp: 8, dur: 30}]}>
      <Arena t={t} excite={0.8} />
      <SpeedLines k={0.6} t={t} vertical count={30} />
      <SandSplash x={540 - 120 * (h / 1000)} y={y} age={fr % 10} seed={`a${Math.floor(fr / 10)}`} n={10} power={0.6} />
      <SandSplash x={540 + 120 * (h / 1000)} y={y} age={(fr + 5) % 10} seed={`b${Math.floor((fr + 5) / 10)}`} n={10} power={0.6} />
      <PlacedBruno x={540} y={y} height={h} light={ARENA_LIGHT} pose={chargePose(t)} expr={ANGRY} />
      <Finish vignette={0.5} grain={0.07} tint="rgba(255,90,60,0.2)" />
    </Rig>
  );
};

/** Giant fist coming at camera (front view), centre (x,y), scale s. */
const Fist: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  const sk = BRUNO_OUTFIT.skin;
  return (
    <Svg>
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <ellipse cx={30} cy={170} rx={210} ry={150} fill={BRUNO_OUTFIT.top.shade} />
        <rect x={-170} y={60} width={360} height={110} rx={40} fill={BRUNO_OUTFIT.top.base} />
        <rect x={-170} y={60} width={360} height={18} fill="#e8b84a" />
        <ellipse cx={0} cy={-20} rx={220} ry={180} fill={sk.base} stroke={sk.shade} strokeWidth={8} />
        {[-135, -45, 45, 135].map((dx) => (
          <g key={dx}>
            <ellipse cx={dx} cy={-90} rx={46} ry={56} fill={sk.base} stroke={sk.shade} strokeWidth={6} />
            <ellipse cx={dx - 8} cy={-110} rx={18} ry={14} fill={sk.light} opacity={0.8} />
          </g>
        ))}
        <path d="M-150,-20 Q0,10 150,-20" stroke={sk.shade} strokeWidth={8} fill="none" />
        <path d="M-200,40 Q-120,90 -40,60" stroke={sk.shade} strokeWidth={10} fill="none" />
      </g>
    </Svg>
  );
};

/* "soco de duas toneladas." — the fist grows toward camera; HUD SOCO 2 t slams on "duas". */
export const SSoco: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const duas = ev(p, 'L11', 9);
  const g = kf(fr, [0, p.dur], [0.45, 1.9], (x) => Math.pow(x, 1.6));
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} rot={[-2, 2]} shakes={[{at: duas, amp: 18}]} punches={[{at: duas, amt: 0.08}]}>
      <Arena t={t} excite={0.8} blur={6} zoom={1.3} />
      <AbsoluteFill style={{filter: 'blur(5px)'}}>
        <PlacedBruno x={560} y={2300} height={1700} light={ARENA_LIGHT} pose={{shR: 100, elR: 0}} expr={ANGRY} />
      </AbsoluteFill>
      <Svg>
        {Array.from({length: 26}).map((_, i) => {
          const a = (i / 26) * Math.PI * 2;
          const ph = (fr * 0.08 + random(`sl${i}`)) % 1;
          const r0 = 300 + ph * 700;
          return <line key={i} x1={540 + Math.cos(a) * r0} y1={1000 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 260)} y2={1000 + Math.sin(a) * (r0 + 260)} stroke="#fff" strokeWidth={6} opacity={0.5 * (1 - ph)} />;
        })}
      </Svg>
      <Fist x={540} y={1000} s={g} />
      <HudTag x={70} y={560} label="SOCO DO BRUNO" value="2 t" k={kf(fr, [duas, duas + 4], [0, 1], easeOut)} color="#ff5a5a" size={160} />
      <Stamp x={760} y={1700} text="2 TONELADAS" k={fr - duas} size={80} rot={-5} />
      <Finish vignette={0.5} grain={0.07} tint="rgba(255,90,60,0.2)" />
    </Rig>
  );
};

/* ================================================================== L12 */

/* "O Davi nem desvia." — Davi calm, half smile, the giant fist blurred in the foreground; he crouches. */
export const SDesvia: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const des = ev(p, 'L12', 3);
  const crouch = kf(fr, [des, p.dur], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.15]} pan={[0, 0, -20, 30]} rot={[0, -1]} whip="l" origin={[420, 1100]}>
      <Arena t={t * 0.4} zoom={1.4} blur={7} zy={1300} excite={0.6} />
      <Pup
        outfit={DAVI_OUTFIT}
        x={420}
        y={1900 + crouch * 120}
        height={1350}
        light={ARENA_LIGHT}
        pose={{hipL: -30 * crouch, knL: 60 * crouch, hipR: 30 * crouch, knR: -60 * crouch, bob: 160 * crouch, shR: 20 * crouch, elR: -20 * crouch, facing: 0.3}}
        expr={{halfSmile: 1, smile: 0.2, blink: fr > 14 && fr < 20 ? 0.9 : 0.45, browAsym: 0.4, lookX: 0.6}}
      />
      <AbsoluteFill style={{filter: 'blur(14px)'}}>
        <Fist x={1050} y={820} s={lerp(1.4, 1.6, fr / p.dur)} />
      </AbsoluteFill>
      <Chip x={420} y={1720} text="DESVIAR: NÃO" k={kf(fr, [des, des + 5], [0, 1], easeOut)} color="#ffd23a" size={44} />
      <Finish vignette={0.5} grain={0.07} />
    </Rig>
  );
};

/* "Ele vibra o chão." — palm slaps the sand; yellow energy; ripples spread in rings. */
export const SChao: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const hit = ev(p, 'L12', 5);
  const down = kf(fr, [0, hit], [0, 1], (x) => x * x);
  const j = trem(fr, fr >= hit ? 6 : 0, 'ch');
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} rot={[2, 0]} pow={2} shakes={[{at: hit, amp: 22, dur: 20}]} punches={[{at: hit, amt: 0.08}]}>
      <Arena t={t} viewY={600} zoom={1.25} zy={1500} ripple={fr - hit} rx={540} ry={1700} liquid={kf(fr, [hit, p.dur], [0, 0.4])} />
      <AbsoluteFill style={{transform: `translate(${j.x}px,${j.y}px)`}}>
        <BigHand x={lerp(520, 560, down)} y={lerp(1100, 1640, down)} angle={95} s={1.4} variant="palm" glow={fr >= hit ? 1 : 0} />
      </AbsoluteFill>
      <EnergyLines x={540} y={1650} r0={120} r1={520} k={fr >= hit ? 1 : 0} frame={fr} seed="ch" count={20} />
      <SandSplash x={540} y={1680} age={fr - hit} n={30} power={1.2} />
      <SoundWord x={760} y={1250} text="BRRRRR" k={fr - hit - 3} size={110} rot={-6} />
      <Finish vignette={0.45} grain={0.07} />
      <CutFlash at={hit} frames={4} color="255,230,140" peak={0.6} />
    </Rig>
  );
};

/** Textbook cross-section of wet sand. `sep` 0..1 grains separated (liquefied), `shake` amplitude px. */
const SandSection: React.FC<{frame: number; sep: number; shake: number; labels: number; arrows: number}> = ({frame, sep, shake, labels, arrows}) => {
  const box = {x: 110, y: 560, w: 860, h: 760};
  const grains: React.ReactNode[] = [];
  const cols = 7;
  const rows = 7;
  const cw = box.w / cols;
  const rh = box.h / rows;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const q = (k: string) => random(`gr${r}-${c}${k}`);
      const bx = box.x + (c + 0.5 + (r % 2) * 0.5 - 0.25) * cw;
      const by = box.y + box.h - (r + 0.5) * rh;
      const R = Math.min(cw, rh) * (0.56 - sep * 0.14) ;
      const dx = (q('dx') - 0.5) * 120 * sep + Math.sin(frame * 0.5 + q('p') * 6) * 10 * sep;
      const dy = (q('dy') - 0.5) * 100 * sep - sep * 20 + Math.cos(frame * 0.45 + q('p') * 6) * 10 * sep;
      const jx = (random(`jx${frame}${r}${c}`) - 0.5) * shake;
      const jy = (random(`jy${frame}${r}${c}`) - 0.5) * shake;
      const pts = Array.from({length: 7}).map((_, k) => {
        const a = (k / 7) * Math.PI * 2;
        const rr = R * (0.85 + q(`v${k}`) * 0.25);
        return `${(bx + dx + jx + Math.cos(a) * rr).toFixed(1)},${(by + dy + jy + Math.sin(a) * rr * 0.9).toFixed(1)}`;
      });
      grains.push(
        <g key={`${r}${c}`}>
          <polygon points={pts.join(' ')} fill={['#c99a58', '#b8864a', '#d8ae6c'][Math.floor(q('c') * 3)]} stroke="#6a4a22" strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={bx + dx + jx - R * 0.3} cy={by + dy + jy - R * 0.3} rx={R * 0.25} ry={R * 0.15} fill="#fff" opacity={0.35} />
        </g>,
      );
    }
  return (
    <Svg>
      <defs>
        <clipPath id="secClip">
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={14} />
        </clipPath>
      </defs>
      <rect x={box.x - 10} y={box.y - 10} width={box.w + 20} height={box.h + 20} rx={20} fill="#1d2a44" />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={14} fill="#5fb6e8" />
      <g clipPath="url(#secClip)">
        {Array.from({length: 10}).map((_, i) => (
          <path key={i} d={`M${box.x},${box.y + 40 + i * 80} q60,-14 120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0`} stroke="#bfe6ff" strokeWidth={3} fill="none" opacity={0.5} transform={`translate(${((frame * 3) % 120) - 120},0)`} />
        ))}
        {grains}
        {/* contact force marks (disappear when separated) */}
        {sep < 0.4 &&
          Array.from({length: 18}).map((_, i) => {
            const x = box.x + 90 + (i % 6) * 125 + (Math.floor(i / 6) % 2) * 60;
            const y = box.y + 160 + Math.floor(i / 6) * 220;
            return <path key={i} d={`M${x - 14},${y - 14} L${x + 14},${y + 14} M${x + 14},${y - 14} L${x - 14},${y + 14}`} stroke="#d23c3c" strokeWidth={6} opacity={1 - sep * 2.5} />;
          })}
        {arrows > 0 &&
          [0, 1, 2, 3, 4].map((i) => {
            const x = box.x + 110 + i * 160;
            const y = box.y + box.h - 80 - ((frame * 6 + i * 50) % 300);
            return <path key={i} d={`M${x},${y + 60} L${x},${y} M${x - 20},${y + 20} L${x},${y} L${x + 20},${y + 20}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={arrows} />;
          })}
      </g>
      <text x={540} y={box.y + box.h + 70} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={34} letterSpacing={6} fill="#1d2a44" opacity={labels}>
        CORTE DA AREIA DO CHÃO · AUMENTO 200×
      </text>
    </Svg>
  );
};

/* "Areia molhada, sacudida" — textbook cross-section: packed grains touching, water between. */
export const SAreia: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const sac = ev(p, 'L12', 10);
  const lab = kf(fr, [2, 10], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.15, 1.04]} rot={[-1.5, 0]} pow={2} whip="d" origin={[540, 940]}>
      <Paper />
      <SandSection frame={fr} sep={0} shake={fr >= sac ? 10 : 0} labels={lab} arrows={0} />
      <Label x={300} y={1680} tx={350} ty={1150} text="GRÃO DE AREIA" k={lab} />
      <Label x={790} y={1680} tx={760} ty={1110} text="ÁGUA" k={kf(fr, [6, 14], [0, 1], easeOut)} color="#1f6fa8" />
      <Chip x={540} y={1840} text="✕ = GRÃOS SE APOIANDO (ATRITO)" k={kf(fr, [10, 16], [0, 1], easeOut)} color="#d23c3c" size={34} />
      <Finish vignette={0.25} grain={0.06} />
    </Rig>
  );
};

/* "rápido, vira quase líquido." — grains shake loose and float: the floor stops holding weight. */
export const SLiquido: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const liq = ev(p, 'L12', 14);
  const sep = kf(fr, [0, liq], [0.05, 1], easeOut);
  const bar = kf(fr, [0, liq + 3], [0.1, 0.92]);
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.1]} rot={[1, -1]} pow={1.5} shakes={[{at: 0, amp: 8, dur: 40}]} punches={[{at: liq, amt: 0.05}]} origin={[540, 940]}>
      <Paper />
      <SandSection frame={fr} sep={sep} shake={14} labels={1} arrows={sep} />
      <Label x={540} y={1590} tx={540} ty={1150} text="ÁGUA EMPURRA OS GRÃOS ↑" k={kf(fr, [8, 16], [0, 1], easeOut)} color="#1f6fa8" size={38} />
      <div style={{position: 'absolute', left: 120, top: 1680, width: 840}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: '#1d2a44'}}>
          <span>SÓLIDO</span>
          <span style={{color: '#1f6fa8'}}>LÍQUIDO</span>
        </div>
        <div style={{height: 34, borderRadius: 17, background: 'rgba(29,42,68,0.2)', border: '4px solid #1d2a44', overflow: 'hidden', marginTop: 6}}>
          <div style={{width: `${bar * 100}%`, height: '100%', background: 'linear-gradient(90deg,#c99a58,#5fb6e8)'}} />
        </div>
      </div>
      <Finish vignette={0.25} grain={0.06} />
    </Rig>
  );
};

/* "Chama liquefação." — arena floor turns glossy and wavy; stamp LIQUEFAÇÃO (real). */
export const SLiquefacao: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const lq = ev(p, 'L12', 16);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[0, -40, 0, 0]} rot={[-1, 1]} whip="u" punches={[{at: lq, amt: 0.06}]} shakes={[{at: lq, amp: 10}]}>
      <Arena t={t} viewY={250} liquid={1} ripple={(fr + 20) % 60} rx={300} ry={1700} excite={0.6} />
      <Pup outfit={DAVI_OUTFIT} x={250} y={1640} height={560} light={ARENA_LIGHT} pose={{hipL: -40, knL: 90, hipR: 40, knR: -90, bob: 120, shR: 30, elR: 10}} expr={{halfSmile: 1}} />
      <EnergyLines x={300} y={1640} r0={30} r1={200} k={1} frame={fr} seed="lq" count={12} />
      <PlacedBruno x={760} y={1560} height={700} light={ARENA_LIGHT} pose={chargePose(t * 0.6)} expr={ANGRY} flip />
      <Stamp x={540} y={720} text="LIQUEFAÇÃO" sub="(REAL)" k={fr - lq} size={120} rot={-7} color="#1f6fa8" />
      <Finish vignette={0.4} grain={0.07} />
    </Rig>
  );
};

/* "Acontece de verdade" — Niigata 1964 insert: apartment blocks tipped over in liquefied ground. */
export const SNiigata: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const tilt = kf(fr, [0, p.dur], [10, 24], easeOut);
  const bld = (x: number, w: number, h: number, rot: number, col: string) => (
    <g transform={`translate(${x},1180) rotate(${rot})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={col} stroke="#3a2e22" strokeWidth={5} />
      {Array.from({length: Math.floor(h / 70)}).map((_, r) =>
        Array.from({length: Math.floor(w / 60)}).map((__, c) => <rect key={`${r}${c}`} x={-w / 2 + 18 + c * 60} y={-h + 20 + r * 70} width={30} height={36} fill="#5a4a3a" />),
      )}
    </g>
  );
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} rot={[3, 1]} whip="r" origin={[540, 960]}>
      <AbsoluteFill style={{background: '#1d2a44'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%)'}} />
      <div style={{position: 'absolute', left: 110, top: 540, width: 860, height: 900, background: '#f4efe4', transform: 'rotate(-3deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
        <div style={{position: 'absolute', left: 30, top: 30, width: 800, height: 720, overflow: 'hidden', background: 'linear-gradient(#cfc3a8,#a8987a)', filter: 'sepia(0.6)'}}>
          <svg width={800} height={720} viewBox="110 500 800 720">
            {bld(280, 200, 520, -tilt, '#bfae90')}
            {bld(560, 220, 600, tilt * 0.9, '#cbbb9b')}
            {bld(820, 180, 440, -tilt * 0.4, '#b3a283')}
            <path d="M110,1150 Q300,1110 500,1160 T910,1140 L910,1220 L110,1220 Z" fill="#6e6250" />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M110,${1170 + i * 18} q100,-${10 + i * 4} 200,0 t200,0 t200,0 t200,0`} stroke="#8a7c66" strokeWidth={4} fill="none" />
            ))}
          </svg>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 56, color: '#1d2a44'}}>NIIGATA, JAPÃO · 1964</div>
      </div>
      <Chip x={540} y={1700} text="PRÉDIOS TOMBARAM INTEIROS" k={kf(fr, [6, 12], [0, 1], easeOut)} color="#ffd23a" size={44} />
      <Finish vignette={0.4} grain={0.1} />
    </Rig>
  );
};

/* "em terremoto." — seismograph needle scribbling a big zig-zag (plants the autograph gag). */
export const SSismo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const ter = ev(p, 'L12', 20);
  const scroll = fr * 26;
  const ampAt = (x: number) => {
    const age = fr - (900 - x) / 26; // frame when that paper x was under the needle
    return age < ter ? 14 : lerp(14, 300, clamp((age - ter) / 4));
  };
  const pts: string[] = [];
  for (let x = 900; x > 60; x -= 9) {
    const a = ampAt(x);
    pts.push(`${x},${960 + (Math.floor((x + scroll) / 9) % 2 ? 1 : -1) * a * (0.5 + random(`sm${Math.floor((x + scroll) / 9)}`) * 0.5)}`);
  }
  const tip = pts[0].split(',').map(Number);
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} rot={[-2, 0]} whip="l" shakes={[{at: ter, amp: 20, dur: 20}]}>
      <AbsoluteFill style={{background: '#26303f'}} />
      <Svg>
        <rect x={40} y={560} width={1000} height={800} fill="#fbf8ef" />
        {Array.from({length: 18}).map((_, i) => (
          <line key={i} x1={((i * 60 - scroll) % 1080 + 1080) % 1080} x2={((i * 60 - scroll) % 1080 + 1080) % 1080} y1={560} y2={1360} stroke="#f2b8b8" strokeWidth={2} />
        ))}
        {Array.from({length: 9}).map((_, i) => (
          <line key={'h' + i} x1={40} x2={1040} y1={600 + i * 90} y2={600 + i * 90} stroke="#f2b8b8" strokeWidth={2} />
        ))}
        <path d={'M' + pts.join(' L')} stroke="#1d2a7a" strokeWidth={6} fill="none" strokeLinejoin="round" />
        {/* needle arm */}
        <line x1={1060} y1={460} x2={tip[0]} y2={tip[1]} stroke="#3a3f4a" strokeWidth={18} strokeLinecap="round" />
        <circle cx={1060} cy={460} r={36} fill="#3a3f4a" />
        <circle cx={tip[0]} cy={tip[1]} r={12} fill="#d23c3c" />
      </Svg>
      <HudTag x={80} y={1590} label="SISMÓGRAFO" value="TERREMOTO" k={kf(fr, [ter, ter + 5], [0, 1], easeOut)} color="#ff5a5a" size={70} />
      <Finish vignette={0.35} grain={0.07} />
    </Rig>
  );
};

/* ================================================================== L13 */

/** Bruno sunk into the sand down to `sink` 0..1 (1 = waist). Feet at (x, y) when not sunk. */
const SunkBruno: React.FC<{x: number; y: number; h: number; sink: number; surf: number; pose: object; expr: object; flip?: boolean}> = ({x, y, h, sink, surf, pose, expr, flip}) => (
  <>
    <Above y={surf}>
      <PlacedBruno x={x} y={y + sink * 500 * (h / 1000)} height={h} light={ARENA_LIGHT} pose={pose} expr={expr} flip={flip} />
    </Above>
    <Svg>
      <ellipse cx={x} cy={surf} rx={240 * (h / 1000)} ry={50 * (h / 1000)} fill="none" stroke="#6a4c22" strokeWidth={14 * (h / 1000)} opacity={0.5 * clamp(sink * 3)} />
      <ellipse cx={x} cy={surf - 4} rx={230 * (h / 1000)} ry={44 * (h / 1000)} fill="none" stroke="#fff3d6" strokeWidth={6} opacity={0.6 * clamp(sink * 3)} />
    </Svg>
  </>
);

/* "O Bruno afunda até a" — mid-charge he sinks into the liquid sand. */
export const SAfunda: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const af = ev(p, 'L13', 2);
  const sink = kf(fr, [af - 4, p.dur + 6], [0, 0.85], easeOut);
  const run = 1 - clamp(sink * 2);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[0, 0, 0, 40]} rot={[1, -1]} whip="r" origin={[600, 1500]}>
      <Arena t={t} liquid={1} excite={0.8} />
      <SunkBruno x={620} y={1820} h={1150} sink={sink} surf={1820} pose={{...chargePose(t, run), shL: lerp(-25, -120, 1 - run), shR: lerp(25, 120, 1 - run)}} expr={{halfSmile: 0, eyesWide: lerp(0.2, 1, 1 - run), mouthOpen: 0.7, browTilt: lerp(-1, 1, 1 - run)}} />
      <SandSplash x={620} y={1820} age={fr - af} n={26} power={0.8} />
      <SoundWord x={850} y={1100} text="SCHLORP!" k={fr - af} size={100} rot={8} color="#d8b97f" />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* "cintura." — waist-deep, a measuring line: ATÉ A CINTURA. */
export const SCintura: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = kf(fr, [0, 6], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.02]} rot={[-2, 0]} pow={2.5} whip="d" punches={[{at: 0, amt: 0.05}]}>
      <Arena t={t} liquid={1} viewY={200} zoom={1.2} zy={1500} excite={0.8} />
      <SunkBruno x={480} y={1620} h={1500} sink={1} surf={1650} pose={{shL: -110, elL: -30, shR: 110, elR: 30}} expr={{halfSmile: 0, eyesWide: 1, mouthOpen: 0.6, browTilt: 1, lookY: 0.8}} />
      <Svg>
        <g opacity={k}>
          <line x1={880} y1={1650} x2={880} y2={lerp(1650, 1100, k)} stroke="#ffd23a" strokeWidth={8} strokeDasharray="20 12" />
          <path d="M850,1630 L880,1660 L910,1630" stroke="#ffd23a" strokeWidth={8} fill="none" />
          <line x1={700} y1={1650} x2={1000} y2={1650} stroke="#ffd23a" strokeWidth={8} />
        </g>
      </Svg>
      <Chip x={760} y={1760} text="↓ ATÉ A CINTURA" k={k} color="#ffd23a" size={52} />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* "Toda aquela superforça," — Bruno pounds the sand, splashes, doesn't move an inch. */
export const SSuperforca: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const per = 8;
  const ph = (fr % per) / per;
  const side = Math.floor(fr / per) % 2;
  const down = ph < 0.4 ? ph / 0.4 : 1 - (ph - 0.4) / 0.6;
  const hits = [0, 1, 2, 3, 4, 5].map((i) => i * per + Math.round(per * 0.4));
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} rot={[0, 1]} pan={[0, 0, 0, 20]} whip="l" shakes={hits.map((h) => ({at: h, amp: 10, dur: 6}))}>
      <Arena t={t} liquid={1} excite={0.9} />
      <SunkBruno
        x={540}
        y={1693}
        h={1350}
        sink={1}
        surf={1720}
        pose={{shL: side ? lerp(-150, -20, down) : -140, elL: side ? lerp(-20, 40, down) : -20, shR: side ? 140 : lerp(150, 20, down), elR: side ? 20 : lerp(20, -40, down), lean: side ? -5 : 5}}
        expr={{...ANGRY, mouthOpen: 0.8}}
      />
      {hits.map((h, i) => (
        <SandSplash key={i} x={i % 2 ? 360 : 720} y={1730} age={fr - h} n={14} seed={`sf${i}`} power={0.7} />
      ))}
      <Chip x={60} y={570} text="FORÇA: 2 t ✓" k={kf(fr, [4, 9], [0, 1], easeOut)} color="#3be08a" size={44} align="left" />
      <Chip x={60} y={660} text="SAIU DO LUGAR: 0 cm ✕" k={kf(fr, [14, 19], [0, 1], easeOut)} color="#ff5a5a" size={44} align="left" />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};

/* "presa igual pé no" — Bruno's strained face, trembling. */
export const SPresa: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const j = trem(fr, 7, 'pr');
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} rot={[-1, 1]} pow={1.2} whip="u" origin={[540, 1000]}>
      <Arena t={t} liquid={1} zoom={1.6} blur={9} zy={1300} excite={0.8} />
      <AbsoluteFill style={{transform: `translate(${j.x}px,${j.y}px)`}}>
        <Above y={1800}>
          <PlacedBruno x={540} y={3000} height={2300} upperOnly light={ARENA_LIGHT} pose={{shL: -30, shR: 30}} expr={{halfSmile: 0, smile: -0.8, browTilt: -1, blink: 0.75, mouthOpen: 0.35, browAsym: 0}} />
        </Above>
      </AbsoluteFill>
      <Sweat x={540} y={760} t={t} s={2} k={1} n={7} />
      <Svg>
        <rect x={-100} y={1780} width={1300} height={300} fill="#8a6c3e" />
        <path d="M-100,1790 Q200,1760 540,1795 T1180,1785" stroke="#fff3d6" strokeWidth={8} fill="none" opacity={0.6} />
      </Svg>
      <Finish vignette={0.5} grain={0.07} tint="rgba(255,80,60,0.25)" />
    </Rig>
  );
};

/* "mangue." — ground level: a crab strolls past, stops, looks at Bruno and waves a claw. Bruno stares. */
export const SMangue: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const walk = kf(fr, [0, 12], [0, 1], easeOut);
  const stop = fr >= 12;
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.1]} pan={[20, 0, 0, 0]} rot={[0, -1]} whip="r" origin={[700, 1500]}>
      <Arena t={t} liquid={1} viewY={350} zoom={1.3} zy={1500} excite={0.3} />
      <Above y={1500}>
        <PlacedBruno x={330} y={2400} height={1900} light={ARENA_LIGHT} pose={{shL: -20, elL: 20, shR: 20, elR: -20, facing: 0.5}} expr={{halfSmile: 0, smile: -0.2, eyesWide: 0, blink: 0.35, lookX: 1, lookY: 1, mouthOpen: 0}} />
      </Above>
      <Svg>
        <ellipse cx={330} cy={1500} rx={330} ry={50} fill="none" stroke="#6a4c22" strokeWidth={14} opacity={0.5} />
      </Svg>
      <Crab x={lerp(1250, 760, walk)} y={1650} s={1.5} t={t} look={stop ? -1 : 0.5} wave={stop ? 1 : 0} />
      <Finish vignette={0.45} grain={0.07} />
    </Rig>
  );
};
