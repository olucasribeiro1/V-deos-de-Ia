import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {H, W} from '../../lib/constants';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import {f, wordAt} from '../timeline';
import type {Lighting} from '../../characters/types';
import {PlacedDavi} from '../../characters/Davi';
import {PlacedAgent} from '../../characters/Agent';
import {Skyline} from '../../ep02/partA/sets';
import {TableScene, DAVI_SEAT} from '../../ep02/partC/ShotsMonaco';
import {TERRACE_LIGHT} from '../../ep02/partC/sets';
import {LinhaEmblem} from '../../ep01/partB/kit';

export {Rig, Svg, useShot} from '../../ep02/partC/kit';
export {Stamp, Chip, HudTag} from '../../ep02qi/partA/kit';

/** Part A starts at absolute 0, so part-local = absolute frames. */
export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word onset. */
export const ev = (p: ShotP, id: string, n: number) => f(wordAt(id, n)) - p.from;
/** Absolute seconds of a shot-local frame. */
export const abs = (p: ShotP, fr: number) => (p.from + fr) / 30;
export const since = (fr: number, at: number, len = 6) => clamp((fr - at) / len);

export const ROOF_LIGHT: Lighting = {side: 1, rim: '#7fc8ff', rimStrength: 0.95, shadeStrength: 0.75};
export const YEL = '#ffd23a';

/* ------------------------------------------------------------------ night rooftop (L1 / L7) */

/** Night city rooftop: skyline with lit windows, moon, parapet, water tank, antenna. Floor line at `floor`. */
export const NightRoof: React.FC<{t: number; px?: number; floor?: number; horizon?: number}> = ({t, px = 0, floor = 1500, horizon = 1100}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#03061a 0%,#0b1438 45%,#23224f 75%,#3a2a55 100%)'}} />
    <svg width={W} height={H} style={{position: 'absolute'}}>
      {Array.from({length: 70}).map((_, i) => (
        <circle key={i} cx={random(`nrs${i}`) * W} cy={random(`nry${i}`) * horizon * 0.7} r={0.8 + random(`nrr${i}`) * 2} fill="#fff" opacity={0.3 + 0.4 * Math.abs(Math.sin(t * 1.5 + i))} />
      ))}
      <circle cx={820 - px * 0.05} cy={360} r={170} fill="#cfe0ff" opacity={0.12} />
      <circle cx={820 - px * 0.05} cy={360} r={62} fill="#eef4ff" />
      <circle cx={800 - px * 0.05} cy={345} r={12} fill="#cfd9ee" />
    </svg>
    <AbsoluteFill style={{transform: `translateX(${-px * 0.2}px)`, filter: 'blur(2px)'}}>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <Skyline y={horizon} seed="nr-far" far t={t} />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{transform: `translateX(${-px * 0.45}px)`}}>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <Skyline y={horizon + 200} seed="nr-near" t={t} />
      </svg>
    </AbsoluteFill>
    <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
      <g transform={`translate(${-px},0)`}>
        {/* water tank + antenna on the roof */}
        <g transform={`translate(${-60},${floor - 40})`}>
          <rect x={-10} y={-380} width={16} height={380} fill="#1a1d2c" />
          <rect x={170} y={-380} width={16} height={380} fill="#1a1d2c" />
          <path d="M-20,-380 L200,-380 L190,-620 Q90,-680 -10,-620 Z" fill="#2a2f45" />
          <path d="M-20,-380 L200,-380 L196,-400 L-16,-400 Z" fill="#11131d" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-14} y={-560 + i * 60} width={210} height={6} fill="#151826" />
          ))}
        </g>
        <g transform={`translate(${980},${floor - 60})`}>
          <rect x={-5} y={-520} width={10} height={520} fill="#2a2f45" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-50 + i * 10} y={-480 + i * 120} width={100 - i * 20} height={6} fill="#2a2f45" />
          ))}
          <circle cy={-530} r={10} fill="#ff3b3b" opacity={0.5 + 0.5 * Math.sin(t * 4)} />
          <circle cy={-530} r={30} fill="#ff3b3b" opacity={0.15 + 0.1 * Math.sin(t * 4)} />
        </g>
        {/* parapet */}
        <rect x={-400} y={floor - 90} width={W + 1200} height={36} fill="#3a3f58" />
        <rect x={-400} y={floor - 54} width={W + 1200} height={56} fill="#262a3d" />
      </g>
      <rect x={-20} y={floor} width={W + 40} height={H - floor + 20} fill="#1b1e2d" />
      {Array.from({length: 9}).map((_, i) => (
        <line key={i} x1={-200} y1={floor + Math.pow(i / 8, 1.7) * (H - floor)} x2={W + 200} y2={floor + Math.pow(i / 8, 1.7) * (H - floor)} stroke="#121420" strokeWidth={3} />
      ))}
      <ellipse cx={540} cy={floor + 120} rx={520} ry={90} fill="#5a8cff" opacity={0.08} />
    </svg>
  </AbsoluteFill>
);

/** Davi on the rooftop holding a phone up (screen glow on his face). */
export const DaviPhone: React.FC<{x: number; y: number; h: number; t: number; frame: number; buzz?: number; expr?: React.ComponentProps<typeof PlacedDavi>['expr']; lift?: number}> = ({x, y, h, t, frame, buzz = 0, expr, lift = 1}) => {
  const k = h / 1000;
  const bz = buzz > 0 ? Math.sin(frame * 3.3) * 6 * buzz : 0;
  const ph = {x: x + 40 * k, y: y - lerp(560, 860, lift) * k};
  return (
    <>
      <PlacedDavi
        x={x}
        y={y}
        height={h}
        light={ROOF_LIGHT}
        pose={{shR: lerp(-10, -30, lift), elR: lerp(-60, -118, lift), shL: 12, elL: 20, facing: 0.1, headTilt: 5 * lift, bob: Math.sin(t * 2) * 3}}
        expr={{lookY: 0.7 * lift, lookX: 0.15, browTilt: -0.3, smile: -0.2, ...expr}}
      />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <circle cx={ph.x} cy={ph.y} r={360 * k} fill="#bfe4ff" opacity={0.18} style={{mixBlendMode: 'screen'}} />
        <g transform={`translate(${ph.x + bz},${ph.y}) rotate(${-8 + bz})`}>
          <rect x={-62 * k} y={-120 * k} width={124 * k} height={240 * k} rx={18 * k} fill="#111217" stroke="#4c505c" strokeWidth={3} />
          <rect x={-54 * k} y={-108 * k} width={108 * k} height={216 * k} rx={12 * k} fill="#cfe9ff" />
          <rect x={-44 * k} y={-80 * k} width={88 * k} height={110 * k} rx={6 * k} fill="#13845e" />
          <circle cx={0} cy={-38 * k} r={22 * k} fill="#1e130d" />
        </g>
        {buzz > 0 &&
          [-1, 1].map((s) => (
            <g key={s} stroke="#cfe9ff" strokeWidth={6} strokeLinecap="round" opacity={0.8 * buzz}>
              <line x1={ph.x + s * 100 * k} y1={ph.y - 50 * k} x2={ph.x + s * 140 * k} y2={ph.y - 70 * k} />
              <line x1={ph.x + s * 105 * k} y1={ph.y} x2={ph.x + s * 150 * k} y2={ph.y} />
            </g>
          ))}
      </svg>
    </>
  );
};

/* ------------------------------------------------------------------ the trap photo (L7) */

/** The photo the Linha sends: Lia at the terrace table, Rocha in tuxedo smiling beside her. */
export const TrapPhoto: React.FC = () => (
  <TableScene
    t={340}
    liaFacing={0.05}
    liaExpr={{lookX: 0, lookY: 0.1, smile: -0.25, browTilt: 0.45, eyesWide: 0.15}}
    phoneOnTable={false}
    right={<PlacedAgent variant="rochaGala" x={DAVI_SEAT.x + 10} y={1580} height={800} light={TERRACE_LIGHT} pose={{facing: -0.2, shL: -24, elL: 30, shR: 30, elR: -100}} expr={{smile: 0.6, halfSmile: 0.7}} />}
  />
);

/** Photo cropped into a box (w x h), centred on scene point (fx, fy), zoom z. */
export const PhotoCrop: React.FC<{w: number; h: number; z?: number; fx?: number; fy?: number; radius?: number; blur?: number}> = ({w, h, z = 1, fx = 540, fy = 1150, radius = 28, blur = 0}) => {
  const s = Math.max(w / W, h / H) * z;
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', borderRadius: radius, background: '#000'}}>
      <div style={{position: 'absolute', left: w / 2 - fx * s, top: h / 2 - fy * s, width: W, height: H, transform: `scale(${s})`, transformOrigin: '0 0', filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
        <TrapPhoto />
      </div>
    </div>
  );
};

/** Davi's messenger screen (1080 x ~2270): unknown sender (Linha seal), photo bubble, text bubble. */
export const Chat: React.FC<{photo?: number; msg?: number; typing?: number; photoBlur?: number}> = ({photo = 1, msg = 0, typing = 0, photoBlur = 0}) => (
  <AbsoluteFill style={{background: '#0d1118', height: 2270, fontFamily: HUD_FONT, color: '#fff'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 300, background: '#161c27', borderBottom: '2px solid #232b3a'}}>
      <div style={{position: 'absolute', left: 70, top: 70, fontSize: 40, opacity: 0.8}}>22:48</div>
      <div style={{position: 'absolute', left: 60, top: 170, fontSize: 70, opacity: 0.8}}>‹</div>
      <svg width={110} height={110} style={{position: 'absolute', left: 145, top: 155}}>
        <LinhaEmblem x={55} y={55} r={50} glow={0} sweep={0.5} />
      </svg>
      <div style={{position: 'absolute', left: 280, top: 166, fontSize: 56, fontWeight: 700}}>Desconhecido</div>
      <div style={{position: 'absolute', left: 280, top: 230, fontSize: 32, color: '#ff8a8a'}}>número oculto</div>
    </div>
    {photo > 0 && (
      <div style={{position: 'absolute', left: 60, top: 360, padding: 14, borderRadius: 40, background: '#202838', transform: `scale(${lerp(0.9, 1, photo)})`, transformOrigin: '0 0', opacity: photo}}>
        <PhotoCrop w={820} h={1180} fx={560} fy={1180} blur={photoBlur} />
      </div>
    )}
    {typing > 0 && msg <= 0 && (
      <div style={{position: 'absolute', left: 60, top: 1610, padding: '30px 40px', borderRadius: 50, background: '#202838', display: 'flex', gap: 18}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 26, height: 26, borderRadius: 13, background: '#9aa6bd', opacity: 0.4 + 0.6 * Math.abs(Math.sin(typing * 6 + i))}} />
        ))}
      </div>
    )}
    {msg > 0 && (
      <div style={{position: 'absolute', left: 60, top: 1610, maxWidth: 900, padding: '34px 46px', borderRadius: 50, borderTopLeftRadius: 10, background: '#202838', fontSize: 66, lineHeight: 1.15, transform: `scale(${msg})`, transformOrigin: '0 0'}}>
        Tu já viu esse lugar.
        <span style={{fontSize: 30, color: '#8a96ad', marginLeft: 24}}>22:48</span>
      </div>
    )}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ grades / overlays */

/** EP01 flashback grade: warm desaturation, scanlines, tape label. `rewind` adds ◀◀ + tracking bars. */
export const Flashback: React.FC<{children: React.ReactNode; rewind?: boolean; label?: string}> = ({children, rewind, label = 'EP01'}) => {
  const fr = useCurrentFrame();
  const bar = (fr * 53) % H;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'grayscale(0.55) sepia(0.45) contrast(1.08) brightness(1.02)'}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 5px)', pointerEvents: 'none'}} />
      {rewind && (
        <>
          <div style={{position: 'absolute', left: 0, top: bar, width: W, height: 26, background: 'rgba(255,255,255,0.35)', filter: 'blur(3px)'}} />
          <div style={{position: 'absolute', left: 0, top: (bar + 700) % H, width: W, height: 12, background: 'rgba(255,255,255,0.25)', filter: 'blur(2px)'}} />
        </>
      )}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,0,0,0) 55%, rgba(30,18,6,0.75) 100%)', pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 60, top: 110, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 44, letterSpacing: 4, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.8)', opacity: rewind || Math.floor(fr / 15) % 2 === 0 ? 1 : 0.55}}>
        {rewind ? '◀◀ ' : '● '}
        {label}
      </div>
    </AbsoluteFill>
  );
};

/** Floating hearts drifting up (subtle). */
export const Hearts: React.FC<{t: number; k?: number; x?: number; y?: number; count?: number; seed?: string}> = ({t, k = 1, x = 540, y = 1100, count = 9, seed = 'ht'}) =>
  k <= 0 ? null : (
    <svg width={W} height={H} style={{position: 'absolute', pointerEvents: 'none', overflow: 'visible'}}>
      {Array.from({length: count}).map((_, i) => {
        const r = (s: string) => random(`${seed}${i}${s}`);
        const ph = (t * (0.5 + r('v') * 0.5) + r('p')) % 1;
        const hx = x + (r('x') - 0.5) * 620 + Math.sin(t * 3 + i) * 20;
        const hy = y - ph * 700;
        const s = (0.6 + r('s') * 0.9) * k;
        return (
          <path
            key={i}
            transform={`translate(${hx},${hy}) scale(${s})`}
            d="M0,12 C-30,-10 -26,-34 -12,-36 C-4,-37 0,-30 0,-26 C0,-30 4,-37 12,-36 C26,-34 30,-10 0,12 Z"
            fill={i % 3 ? '#ff5c8a' : '#ff8fb1'}
            opacity={Math.sin(ph * Math.PI) * 0.85 * k}
          />
        );
      })}
    </svg>
  );

/** Wind gust streaks blowing outward from (x, y). `age` in frames since arrival. */
export const Gust: React.FC<{x: number; y: number; age: number; count?: number; seed?: string; color?: string; scale?: number}> = ({x, y, age, count = 18, seed = 'gs', color = '255,255,255', scale = 1}) => {
  if (age < 0 || age > 26) return null;
  return (
    <svg width={W} height={H} style={{position: 'absolute', pointerEvents: 'none', overflow: 'visible'}}>
      {Array.from({length: count}).map((_, i) => {
        const r = (s: string) => random(`${seed}${i}${s}`);
        const side = i % 2 ? 1 : -1;
        const yy = y + (r('y') - 0.5) * 700 * scale;
        const d = (age * (28 + r('v') * 30)) * scale;
        const len = (120 + r('l') * 200) * scale * clamp(1 - age / 26);
        const x0 = x + side * (60 * scale + d);
        const cur = (r('c') - 0.5) * 60;
        return <path key={i} d={`M${x0},${yy} q${side * len * 0.5},${cur} ${side * len},${cur * 0.4}`} stroke={`rgba(${color},${0.75 * clamp(1 - age / 26)})`} strokeWidth={(5 + r('w') * 6) * scale} fill="none" strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** Big centred HUD readout pill (e.g. "AR EMPURRADO 70 L"). */
export const BigChip: React.FC<{x: number; y: number; label: string; value: string; k: number; color?: string; fg?: string}> = ({x, y, label, value, k, color = YEL, fg = '#141414'}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(0.5, 1, easeOut(clamp(k)))})`, opacity: clamp(k * 2), textAlign: 'center', whiteSpace: 'nowrap'}}>
      <div style={{display: 'inline-block', background: color, color: fg, borderRadius: 28, padding: '10px 30px 14px', boxShadow: '0 10px 26px rgba(0,0,0,0.45)'}}>
        <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 5}}>{label}</div>
        <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 96, lineHeight: 1}}>{value}</div>
      </div>
    </div>
  );

/** Little blown-off hat (beret / straw) flying with spin. */
export const FlyingHat: React.FC<{x: number; y: number; age: number; dir?: 1 | -1; kind?: 'beret' | 'straw'; s?: number}> = ({x, y, age, dir = 1, kind = 'beret', s = 1}) => {
  const a = Math.max(0, age);
  const hx = x + dir * a * 26 * s;
  const hy = y - a * 22 * s + a * a * 0.6 * s;
  return (
    <g transform={`translate(${hx},${hy}) rotate(${dir * a * 22}) scale(${s})`}>
      {kind === 'beret' ? (
        <g>
          <ellipse rx={58} ry={22} fill="#b8262f" />
          <ellipse cy={-6} rx={52} ry={16} fill="#d8343e" />
          <rect x={-4} y={-30} width={8} height={12} rx={3} fill="#7a141b" />
        </g>
      ) : (
        <g>
          <ellipse rx={90} ry={22} fill="#e9cf86" stroke="#b8974a" strokeWidth={4} />
          <path d="M-44,-4 Q-40,-50 0,-52 Q40,-50 44,-4 Z" fill="#f2dc9a" stroke="#b8974a" strokeWidth={4} />
          <rect x={-44} y={-16} width={88} height={12} fill="#d0453a" />
        </g>
      )}
    </g>
  );
};

export const appear = (fr: number, at: number, len = 8) => kf(fr, [at, at + len], [0, 1], easeOut);
