import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {PlacedDavi} from '../../characters/Davi';
import {Bust} from '../../ep02qi/characters';
import {DAVI_OUTFIT} from '../../characters/Davi';
import type {Pose} from '../../characters/types';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {BigArm, palmOf} from './arm';
import {
  BLU,
  Can,
  Chip,
  Clip,
  Coin,
  CutFlash,
  DAY,
  DaviRoom,
  EnergyLines,
  FieldBeam,
  FieldLobes,
  Finish,
  HudTag,
  Key,
  LabBg,
  Mark,
  NIGHT,
  Nail,
  PalmGlow,
  PaperBg,
  PopBg,
  RED,
  Rig,
  Ring,
  Scissors,
  SfxWord,
  ShotP,
  Sparkle,
  Stamp,
  Steam,
  Svg,
  Vein,
  WARM,
  Wire,
  YEL,
  abs,
  clamp,
  easeOut,
  ev,
  fly,
  headOf,
  kf,
  lerp,
  wrist,
} from './kit';

/* 10. "O poder dele é" — Davi rubs his hands, sparks + field lobes. */
export const SRub: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const rub = Math.sin(fr * 1.3) * 12;
  const pose: Pose = {shR: 20, elR: -120 + rub, shL: -20, elL: 120 + rub, headTilt: -4};
  const X = 540;
  const Y = 2060;
  const HT = 1350;
  const [hx, hy] = wrist(X, Y, HT, pose, 'R');
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} whip="r" origin={[540, 1000]}>
      <PopBg c1="#e0a92a" c2="#7a3d10" t={t} cx={hx} cy={hy} />
      <Svg>
        <FieldLobes x={hx} y={hy} ang={0} scale={lerp(300, 620, fr / p.dur)} k={kf(fr, [2, 8], [0, 1])} frame={fr} n={5} />
      </Svg>
      <PlacedDavi x={X} y={Y} height={HT} pose={pose} expr={{halfSmile: 1, smile: 0.3, browAsym: 0.6, browTilt: -0.4, lookX: 0, lookY: 0.2}} light={WARM} />
      <EnergyLines x={hx} y={hy} r0={60} r1={300} k={1} frame={fr} seed="rb" count={14} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/** Bar magnet (N red | S blue) centred at (x,y), w×h. */
const BarMagnet: React.FC<{x: number; y: number; w?: number; h?: number; rot?: number}> = ({x, y, w = 360, h = 110, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} stroke="#14141a" strokeWidth={7}>
    <rect x={-w / 2} y={-h / 2} width={w / 2} height={h} fill="#e5484d" />
    <rect x={0} y={-h / 2} width={w / 2} height={h} fill="#3b7be0" />
    <text x={-w / 4} y={h * 0.2} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={h * 0.6} fill="#fff" stroke="none">
      N
    </text>
    <text x={w / 4} y={h * 0.2} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={h * 0.6} fill="#fff" stroke="none">
      S
    </text>
  </g>
);

/** Iron-filings pattern of a dipole along x centred at (cx,cy). k reveal (0..1, radial). */
const Filings: React.FC<{cx: number; cy: number; k: number; frame: number; color?: string}> = ({cx, cy, k, frame, color = '#3a3a48'}) => {
  const segs: React.ReactNode[] = [];
  for (let gx = -8; gx <= 8; gx++) {
    for (let gy = -8; gy <= 8; gy++) {
      const x = gx * 56 + (random(`fx${gx}${gy}`) - 0.5) * 30;
      const y = gy * 56 + (random(`fy${gx}${gy}`) - 0.5) * 30;
      if (Math.abs(x) < 220 && Math.abs(y) < 80) continue;
      const r = Math.hypot(x, y);
      if (r > k * 560) continue;
      const rx = x / r;
      const ry = y / r;
      // B ∝ 3(m·r̂)r̂ − m, m = (1,0)
      const bx = 3 * rx * rx - 1;
      const by = 3 * rx * ry;
      const a = Math.atan2(by, bx) + Math.sin(frame * 0.3 + gx + gy) * 0.05;
      const l = 16;
      segs.push(<line key={`${gx},${gy}`} x1={cx + x - Math.cos(a) * l} y1={cy + y - Math.sin(a) * l} x2={cx + x + Math.cos(a) * l} y2={cy + y + Math.sin(a) * l} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.7} />);
    }
  }
  return <g>{segs}</g>;
};

/* 11. "magnetismo." — textbook page: bar magnet, iron filings, field lobes. */
export const SLobes: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = kf(fr, [0, 14], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.18, 1.04]} rot={[3, 0]} pow={3}>
      <PaperBg t={t} />
      <Svg>
        <Filings cx={540} cy={920} k={k} frame={fr} />
        <FieldLobes x={540} y={920} ang={0} scale={560} k={k} frame={fr} n={4} width={6} />
        <BarMagnet x={540} y={920} />
      </Svg>
      <HudTag x={540} y={1600} align="center" label="O PODER DO DAVI" value="MAGNETISMO" k={kf(fr, [2, 8], [0, 1])} color="#1a1420" size={110} />
      <Finish vignette={0.3} grain={0.06} />
      <CutFlash frames={4} />
    </Rig>
  );
};

/** Distance ruler (cm) from x0, px per cm, at y. */
const Ruler: React.FC<{x0: number; y: number; ppc: number; n: number; dark?: boolean}> = ({x0, y, ppc, n, dark}) => {
  const c = dark ? '#1a1420' : '#ffffff';
  return (
    <g>
      <rect x={x0 - 10} y={y} width={ppc * n + 20} height={60} rx={6} fill={dark ? '#ffe9a8' : 'rgba(255,255,255,0.12)'} stroke={c} strokeWidth={4} />
      {Array.from({length: n * 2 + 1}).map((_, i) => (
        <line key={i} x1={x0 + (i * ppc) / 2} y1={y} x2={x0 + (i * ppc) / 2} y2={y + (i % 2 ? 18 : 32)} stroke={c} strokeWidth={4} />
      ))}
      {Array.from({length: n}).map((_, i) => (
        <text key={i} x={x0 + (i + 1) * ppc} y={y + 54} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={22} fill={c}>
          {i + 1} cm
        </text>
      ))}
    </g>
  );
};

/* 12. "Só que campo magnético" — field lines from the palm thin out with distance. */
export const SLines: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const [px, py] = palmOf(-330, 920, 90, 140);
  const n = 13;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[0, 0, -40, 0]} whip="l" origin={[px, py]}>
      <LabBg c1="#173a5c" c2="#060c18" t={t} />
      <Svg>
        <defs>
          <linearGradient id="fade4" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={YEL} stopOpacity={1} />
            <stop offset="0.45" stopColor={YEL} stopOpacity={0.35} />
            <stop offset="1" stopColor={YEL} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {Array.from({length: n}).map((_, i) => {
          const a = ((i - (n - 1) / 2) / n) * 2.2;
          const L = 1100 * kf(fr, [0, 10], [0.2, 1], easeOut);
          const ex = px + Math.cos(a) * L;
          const ey = py + Math.sin(a) * L;
          return <path key={i} d={`M${px},${py} Q${px + Math.cos(a) * L * 0.5},${py + Math.sin(a) * L * 0.5 - 30} ${ex},${ey}`} stroke="url(#fade4)" strokeWidth={9} fill="none" strokeDasharray="30 16" strokeDashoffset={-fr * 5} />;
        })}
        <BigArm x0={-330} y0={920} ang={90} len={140} tense={0.4} light={NIGHT} />
        <PalmGlow x={px} y={py} k={1} r={130} frame={fr} />
        <Ruler x0={px + 60} y={1200} ppc={220} n={3} />
        {[0, 1, 2].map((i) => (
          <text key={i} x={px + 60 + (i + 1) * 220} y={1180} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={[60, 44, 32][i]} fill={YEL} opacity={[1, 0.6, 0.35][i]}>
            {['FORTE', 'FRACO', 'QUASE NADA'][i]}
          </text>
        ))}
      </Svg>
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 13. "perde força muito rápido:" — graph field × distance crashing down. */
export const SGraph: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const R = ev(p, 'L3', 12);
  const x0 = 190;
  const y0 = 1300;
  const gw = 760;
  const gh = 720;
  const k = kf(fr, [2, R + 4], [0, 1]);
  const curve = (u: number) => {
    const d = 1 + u * 3; // distance 1..4
    return y0 - gh * (1 / (d * d * d));
  };
  const pts = Array.from({length: 60}).map((_, i) => {
    const u = (i / 59) * k;
    return `${i ? 'L' : 'M'}${(x0 + u * gw).toFixed(1)},${curve(u).toFixed(1)}`;
  });
  const dot = [x0 + k * gw, curve(k)];
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} rot={[-2, 1]} whip="d" shakes={[{at: R, dur: 12, amp: 10}]}>
      <PaperBg t={t} />
      <Svg>
        <line x1={x0} y1={y0} x2={x0 + gw + 20} y2={y0} stroke="#1a1420" strokeWidth={8} />
        <line x1={x0} y1={y0} x2={x0} y2={y0 - gh - 40} stroke="#1a1420" strokeWidth={8} />
        <path d={`M${x0 + gw + 20},${y0 - 14} L${x0 + gw + 44},${y0} L${x0 + gw + 20},${y0 + 14} Z`} fill="#1a1420" />
        <path d={`M${x0 - 14},${y0 - gh - 40} L${x0},${y0 - gh - 64} L${x0 + 14},${y0 - gh - 40} Z`} fill="#1a1420" />
        <text x={x0 + 20} y={y0 - gh - 50} fontFamily={HUD_FONT} fontWeight={700} fontSize={36} fill="#1a1420">
          CAMPO
        </text>
        <text x={x0 + gw} y={y0 + 56} textAnchor="end" fontFamily={HUD_FONT} fontWeight={700} fontSize={36} fill="#1a1420">
          DISTÂNCIA →
        </text>
        <path d={pts.join(' ')} stroke="#e0302c" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={dot[0]} cy={dot[1]} r={22} fill={YEL} stroke="#1a1420" strokeWidth={6} />
      </Svg>
      <SfxWord x={640} y={760} text="DESPENCA!" k={fr - R} size={96} color="#e0302c" rot={8} jitter={6} />
      <Finish vignette={0.3} grain={0.06} />
    </Rig>
  );
};

/* 14. "dobrou a distância," — two lanes: clip at 1 cm flies; clip at 2 cm barely twitches. */
export const SLanes: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const D = ev(p, 'L3', 15);
  const lanes = [
    {y: 760, cm: 1},
    {y: 1150, cm: 2},
  ];
  const ppc = 240;
  const hx = 200;
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} pan={[-30, 0, 20, 0]} whip="r">
      <LabBg c1="#173a5c" c2="#060c18" t={t} />
      <Svg>
        {lanes.map((l, i) => {
          const cx0 = hx + l.cm * ppc;
          const first = i === 0;
          const k = first ? (fr - 3) / 6 : 0;
          const tw = !first ? Math.sin((fr - D) * 2.2) * 8 * kf(fr, [D, D + 2, D + 10], [0, 1, 0]) : 0;
          const pos = first ? fly([cx0, l.y], [hx + 50, l.y], k, -40) : [cx0 + tw, l.y];
          return (
            <g key={i}>
              <line x1={hx} y1={l.y + 70} x2={hx + 3 * ppc} y2={l.y + 70} stroke="rgba(255,255,255,0.3)" strokeWidth={4} strokeDasharray="10 10" />
              <FieldLobes x={hx} y={l.y} ang={0} scale={260} k={0.9} frame={fr} n={3} width={5} />
              <circle cx={hx} cy={l.y} r={62} fill="#c98b5f" stroke="#14141a" strokeWidth={6} />
              <circle cx={hx} cy={l.y} r={80} fill="none" stroke={YEL} strokeWidth={6} opacity={0.6} />
              <Clip x={pos[0]} y={pos[1]} s={1.3} rot={first ? lerp(0, -90, clamp(k)) : 90 + tw} />
              <text x={hx + l.cm * ppc} y={l.y + 130} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={60} fill="#fff">
                {l.cm} cm
              </text>
              {first ? (
                <Mark x={hx + 3 * ppc} y={l.y} ok k={since0(fr, 9)} s={80} />
              ) : (
                <text x={hx + 3 * ppc} y={l.y + 20} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={70} fill="#9fb4d0" opacity={kf(fr, [D + 4, D + 8], [0, 1])}>
                  …tic
                </text>
              )}
              {!first && tw !== 0 && <SfxWordSvg x={cx0} y={l.y - 80} />}
            </g>
          );
        })}
      </Svg>
      <SfxWord x={hx + 120} y={640} text="ZIP!" k={fr - 4} size={70} color={YEL} rot={-10} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};
const since0 = (fr: number, at: number) => clamp((fr - at) / 5);
const SfxWordSvg: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g stroke="#9fb4d0" strokeWidth={5} strokeLinecap="round">
    <line x1={x - 30} y1={y} x2={x - 44} y2={y - 16} />
    <line x1={x + 30} y1={y} x2={x + 44} y2={y - 16} />
  </g>
);

/* 15. "o campo cai oito vezes." — 8 bars vs 1 bar; formula chip. */
export const SEight: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const CAI = ev(p, 'L3', 18);
  const OITO = ev(p, 'L3', 19);
  const V = ev(p, 'L3', 20);
  const cols = [
    {x: 330, label: '1 cm', n: 8},
    {x: 750, label: '2 cm', n: 1},
  ];
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} rot={[0, -2]} punches={[{at: OITO, amt: 0.06}]}>
      <PaperBg t={t} />
      <Svg>
        {cols.map((c, ci) => (
          <g key={ci}>
            {Array.from({length: 8}).map((_, i) => {
              const gone = ci === 1 && i >= 1 ? kf(fr, [CAI + i * 1, CAI + i * 1 + 5], [0, 1]) : 0;
              const y = 1300 - (i + 1) * 88;
              return (
                <g key={i} transform={`translate(${gone * (40 + i * 6)},${gone * 600}) rotate(${gone * (i % 2 ? 30 : -30)} ${c.x} ${y})`} opacity={1 - gone}>
                  <rect x={c.x - 130} y={y} width={260} height={74} rx={10} fill={i % 2 ? YEL : '#f2b31c'} stroke="#1a1420" strokeWidth={6} />
                </g>
              );
            })}
            <text x={c.x} y={1370} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={70} fill="#1a1420">
              {c.label}
            </text>
          </g>
        ))}
        <text x={540} y={590} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={40} fill="#5a6a8a" letterSpacing={4}>
          FORÇA DO CAMPO
        </text>
      </Svg>
      <Stamp x={820} y={760} text="÷ 8" k={fr - V} color="#e0302c" size={110} rot={10} />
      <Chip x={540} y={1690} text="2× DISTÂNCIA = CAMPO ÷ 8" k={kf(fr, [OITO, OITO + 5], [0, 1])} color="#1a1420" fg={YEL} size={50} />
      <Finish vignette={0.3} grain={0.06} />
    </Rig>
  );
};

/* 16. "Por isso ele só manda em coisa" — relaxed Davi, bits orbit tight around his palm. */
export const SOrbit2: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const pose: Pose = {shR: 50, elR: 80, shL: -10, elL: 20, lean: 3, headTilt: 5};
  const X = 420;
  const Y = 1720;
  const HT = 1050;
  const [hx, hy] = wrist(X, Y, HT, pose, 'R');
  const cy = hy - 60;
  const items = [0, 1, 2, 3, 4];
  const draw = (front: boolean) =>
    items.map((i) => {
      const a = t * 4.5 + (i / items.length) * Math.PI * 2;
      if (Math.sin(a) > 0 !== front) return null;
      const x = hx + Math.cos(a) * 130;
      const y = cy + Math.sin(a) * 40;
      return i % 3 === 0 ? <Coin key={i} x={x} y={y} s={0.7} spin={Math.cos(a)} /> : i % 3 === 1 ? <Clip key={i} x={x} y={y} s={0.8} rot={a * 60} /> : <Key key={i} x={x} y={y} s={0.7} rot={a * 50} />;
    });
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} pan={[0, -20, 0, 20]} whip="l" origin={[hx, cy]}>
      <DaviRoom t={t} deskY={1300} dayK={0} />
      <Svg>{draw(false)}</Svg>
      <PlacedDavi x={X} y={Y} height={HT} pose={pose} expr={{smile: 0.6, halfSmile: 0.5, blink: 0.35, lookX: 0.6, lookY: 0.3}} light={WARM} />
      <Svg>
        <circle cx={hx} cy={cy} r={170} fill="none" stroke={YEL} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={fr * 3} opacity={0.7} />
        {draw(true)}
        <PalmGlow x={hx} y={cy + 30} k={0.8} r={70} frame={fr} />
      </Svg>
      <Chip x={hx} y={cy - 230} text="ALCANCE: ~10 cm" k={kf(fr, [4, 9], [0, 1])} color="#1a1420" fg={YEL} size={40} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 17. "leve e perto." — palm comes within 1 cm of a clip: it hops up. */
export const SClose: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const PE = ev(p, 'L3', 30);
  const len = kf(fr, [0, PE - 2], [640, 880], easeOut);
  const [px, py] = palmOf(540, -380, 0, len);
  const hop = kf(fr, [PE - 1, PE + 3], [0, 1], easeOut);
  const clipY = lerp(1240, py + 190, hop);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} origin={[540, 1150]} whip="d" punches={[{at: PE, amt: 0.08}]}>
      <AbsoluteFill style={{background: 'linear-gradient(#ffe6a8, #f2b84a)'}} />
      <Svg>
        <rect x={0} y={1260} width={1080} height={700} fill="#8a5a36" />
        <rect x={0} y={1260} width={1080} height={26} fill="#a8744a" />
        <ellipse cx={540} cy={1268} rx={80 * (1 - hop * 0.6)} ry={12} fill="#000" opacity={0.25} />
        <BigArm x0={540} y0={-380} ang={0} len={len} tense={0.3} light={DAY} />
        <PalmGlow x={px} y={py + 120} k={1} r={110} frame={fr} />
        <Clip x={540} y={clipY} s={1.6} rot={lerp(90, 0, hop)} />
        <Sparkle x={540} y={clipY - 30} k={(fr - PE - 2) / 7} s={70} />
      </Svg>
      <Chip x={300} y={1690} text="LEVE ✓" k={kf(fr, [0, 5], [0, 1])} color="#1f9d4a" fg="#fff" size={54} />
      <Chip x={780} y={1690} text="PERTO ✓" k={kf(fr, [PE, PE + 5], [0, 1])} color="#1f9d4a" fg="#fff" size={54} />
      <SfxWord x={760} y={1110} text="TIC!" k={fr - PE} size={80} color="#ffffff" rot={10} />
      <Finish vignette={0.4} grain={0.08} />
    </Rig>
  );
};

/** Periodic-table style tile. */
const Tile: React.FC<{x: number; y: number; sym: string; name: string; num: number; k: number; ok: boolean}> = ({x, y, sym, name, num, k, ok}) => {
  const on = clamp(k);
  const col = ok ? '#1f9d4a' : RED;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 220,
        height: 220,
        transform: `translate(-50%,-50%) scale(${lerp(0.85, 1, easeOut(on))})`,
        borderRadius: 18,
        border: `6px solid ${on > 0.5 ? col : '#5a6a8a'}`,
        background: on > 0.5 ? (ok ? '#e6ffef' : '#ffe9e8') : 'rgba(255,255,255,0.85)',
        boxShadow: on > 0.5 ? `0 0 26px ${col}` : '0 6px 14px rgba(0,0,0,0.3)',
        fontFamily: CAPTION_FONT,
        color: '#1a1420',
        textAlign: 'center',
        opacity: 0.55 + 0.45 * on,
      }}
    >
      <div style={{position: 'absolute', left: 14, top: 8, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30}}>{num}</div>
      <div style={{fontWeight: 700, fontSize: 104, lineHeight: '150px'}}>{sym}</div>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 26, letterSpacing: 2, marginTop: -16}}>{name}</div>
      {on > 0.5 && <div style={{position: 'absolute', right: -18, top: -18, width: 56, height: 56, borderRadius: 28, background: col, color: '#fff', fontSize: 40, lineHeight: '56px', fontWeight: 700}}>{ok ? '✓' : '✗'}</div>}
    </div>
  );
};

const Table: React.FC<{y: number}> = ({y}) => (
  <g>
    <rect x={-40} y={y} width={1160} height={60} fill="#a8744a" stroke="#5a3a24" strokeWidth={6} />
    <rect x={-40} y={y + 60} width={1160} height={900} fill="#7a4e2e" />
  </g>
);

/* 18. "E nem todo metal obedece." — test table, six objects; Davi hovers his hand. */
export const STable: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const pose: Pose = {shR: 120, elR: 10, shL: -20, elL: 30, lean: 6};
  const sweep = Math.sin(t * 5) * 12;
  const pz: Pose = {...pose, shR: pose.shR! + sweep * 0.3};
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.0]} pan={[60, 0, -40, 0]} pow={3} whip="r">
      <AbsoluteFill style={{background: 'linear-gradient(#5a6aa8, #2b3150)'}} />
      <Svg>
        <text x={540} y={620} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={64} fill="#ffffff" opacity={0.9}>
          TESTE DOS METAIS
        </text>
      </Svg>
      <PlacedDavi x={430} y={1700} height={1000} pose={pz} expr={{smile: 0.3, browRaise: 0.4, lookX: 0.6, lookY: 0.5}} light={NIGHT} />
      <Svg>
        <Table y={1180} />
        <Nail x={110} y={1160} s={1.5} />
        <Coin x={280} y={1140} s={1.25} label="Ni" color="#cfd6e2" />
        <Scissors x={445} y={1160} s={1.3} rot={-8} />
        <Can x={640} y={1180} s={1.1} />
        <Wire x={800} y={1130} s={1.1} />
        <Ring x={965} y={1145} s={1.1} />
        <line x1={540} y1={1080} x2={540} y2={1260} stroke="#ffffff" strokeWidth={4} strokeDasharray="10 10" opacity={0.6} />
      </Svg>
      <Chip x={540} y={1690} text="QUAL METAL OBEDECE?" k={kf(fr, [6, 12], [0, 1])} color={YEL} size={50} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/* 19. "Ferro, níquel e cobalto grudam" — nail, coin, scissors jump to the palm; Fe/Ni/Co tiles light. */
export const SStick: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const W0 = [ev(p, 'L4', 5), ev(p, 'L4', 6), ev(p, 'L4', 8)];
  const [px, py] = palmOf(540, -300, 0, 560);
  const st: [number, number][] = [
    [230, 1230],
    [540, 1220],
    [850, 1235],
  ];
  const tg: [number, number][] = [
    [px - 80, py + 60],
    [px + 10, py + 110],
    [px + 90, py + 40],
  ];
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} whip="d" shakes={W0.map((w) => ({at: w + 5, dur: 8, amp: 8}))}>
      <AbsoluteFill style={{background: 'linear-gradient(#5a6aa8, #2b3150)'}} />
      <Svg>
        <Table y={1250} />
        <FieldLobes x={px} y={py + 120} ang={90} scale={520} k={0.9} frame={fr} n={4} />
        <BigArm x0={540} y0={-300} ang={0} len={560} tense={0.7} light={NIGHT} />
        {st.map((s, i) => {
          const k = (fr - W0[i]) / 5;
          const pos = k <= 0 ? s : fly(s, tg[i], k, 0);
          const wob = k <= 0 ? Math.sin(fr * 2 + i) * 2 : 0;
          return (
            <g key={i}>
              {k > -3 && k < 1.2 && <FieldBeam a={[px, py + 160]} b={pos} k={0.9} frame={fr} n={3} spread={40} />}
              {i === 0 ? <Nail x={pos[0] + wob} y={pos[1]} s={1.6} rot={k > 0 ? lerp(0, -60, clamp(k)) : 0} /> : i === 1 ? <Coin x={pos[0] + wob} y={pos[1] - 20} s={1.4} label="Ni" color="#cfd6e2" /> : <Scissors x={pos[0] + wob} y={pos[1]} s={1.4} rot={k > 0 ? lerp(-8, -100, clamp(k)) : -8} />}
              <Sparkle x={tg[i][0]} y={tg[i][1]} k={(fr - W0[i] - 4) / 6} s={60} />
            </g>
          );
        })}
      </Svg>
      <Tile x={250} y={1700} sym="Fe" name="FERRO" num={26} k={(fr - W0[0]) / 3} ok />
      <Tile x={540} y={1700} sym="Ni" name="NÍQUEL" num={28} k={(fr - W0[1]) / 3} ok />
      <Tile x={830} y={1700} sym="Co" name="COBALTO" num={27} k={(fr - W0[2]) / 3} ok />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/* 20. "grudam." — palm full of stuck metal; green chip. */
export const SGrudam: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const [px, py] = palmOf(540, 2300, 180, 700);
  return (
    <Rig dur={p.dur} zoom={[1.14, 1.04]} rot={[-4, 2]} origin={[px, py]} punches={[{at: 0, amt: 0.06}]}>
      <PopBg c1="#3be08a" c2="#0e5a32" t={t} cx={px} cy={py} />
      <Svg>
        <BigArm x0={540} y0={2300} ang={180} len={700} tense={0.8} light={DAY} />
        <Nail x={px - 60} y={py - 20} s={2} rot={-50} />
        <Coin x={px + 60} y={py + 40} s={1.8} label="Ni" color="#cfd6e2" />
        <Scissors x={px} y={py - 120} s={1.8} rot={-110} />
        <Sparkle x={px - 160} y={py - 160} k={fr / 10} s={70} />
        <Sparkle x={px + 170} y={py - 60} k={(fr - 4) / 10} s={60} />
      </Svg>
      <Stamp x={540} y={1690} text="✓ FERRO · NÍQUEL · COBALTO" k={fr - 1} color="#1f9d4a" size={52} rot={-4} />
      <Finish vignette={0.45} grain={0.08} />
      <CutFlash frames={3} />
    </Rig>
  );
};

/* 21. "Alumínio, cobre e" — can, copper, gold ring ignore the field; ✗ on each word. */
export const SNope: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const W0 = [ev(p, 'L4', 10), ev(p, 'L4', 11), ev(p, 'L4', 12) + 1];
  const [px, py] = palmOf(540, -300, 0, 560);
  const strain = Math.sin(fr * 1.7) * 6;
  const items: [number, number][] = [
    [230, 1260],
    [540, 1220],
    [850, 1225],
  ];
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} pan={[0, 0, 0, -20]} whip="l">
      <AbsoluteFill style={{background: 'linear-gradient(#4a4a78, #241f3a)'}} />
      <Svg>
        <Table y={1260} />
        <FieldLobes x={px} y={py + 120} ang={90} scale={520} k={0.9} frame={fr} n={4} pulse={1} />
        <g transform={`translate(${strain},0)`}>
          <BigArm x0={540} y0={-300} ang={0} len={560} tense={1} light={NIGHT} />
        </g>
        {items.map((s, i) => (
          <g key={i}>
            <FieldBeam a={[px, py + 160]} b={[s[0], s[1] - 60]} k={0.35 + 0.2 * Math.sin(fr + i)} frame={fr} n={2} spread={30} width={4} />
            {i === 0 ? <Can x={s[0]} y={s[1]} s={1.3} /> : i === 1 ? <Wire x={s[0]} y={s[1]} s={1.3} /> : <Ring x={s[0]} y={s[1]} s={1.5} />}
            <Mark x={s[0] + 90} y={s[1] - 200} ok={false} k={(fr - W0[i]) / 4} s={70} />
          </g>
        ))}
      </Svg>
      <Tile x={250} y={1700} sym="Al" name="ALUMÍNIO" num={13} k={(fr - W0[0]) / 3} ok={false} />
      <Tile x={540} y={1700} sym="Cu" name="COBRE" num={29} k={(fr - W0[1]) / 3} ok={false} />
      <Tile x={830} y={1700} sym="Au" name="OURO" num={79} k={(fr - W0[2]) / 3} ok={false} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 22. "ouro, não." — Davi frustrated, steam; red stamp. */
export const SFrustr: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const NAO = ev(p, 'L4', 14);
  return (
    <Rig dur={p.dur} zoom={[1.2, 1.08]} shakes={[{at: NAO, dur: 12, amp: 10}]} origin={[540, 900]}>
      <PopBg c1="#e5484d" c2="#5a0e14" t={t} cx={540} cy={900} />
      <Svg>
        <Steam x={540} y={650} t={t} k={1} spread={260} n={10} />
      </Svg>
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={930} r={240} pose={{shL: -14, shR: 14, headTilt: -4}} expr={{smile: -0.9, browTilt: -1, browRaise: -0.4, blink: 0.3, mouthOpen: 0.15, lookX: 0, lookY: 0.3}} light={WARM} />
      <Svg>
        <Vein x={700} y={760} s={50} k={1} frame={fr} />
      </Svg>
      <Stamp x={540} y={1690} text="✗ ALUMÍNIO · COBRE · OURO" k={fr - NAO} color={RED} size={52} rot={5} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

