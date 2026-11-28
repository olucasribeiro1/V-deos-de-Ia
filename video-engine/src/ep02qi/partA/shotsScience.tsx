import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT} from '../../characters/Davi';
import type {Expression, Outfit} from '../../characters/types';
import {AGENT_OUTFITS} from '../../characters/Agent';
import {Bust} from '../characters';
import {METRO_LIGHT, MetroHall} from '../sets/Metro';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {CutFlash, EnergyLines, Finish, H, HudTag, LabBg, Rig, ShotP, Stamp, Svg, W, abs, clamp, easeOut, ev, kf, lerp} from './kit';

/** The "reader's face" demo subject: bald agent without sunglasses (eyes visible). */
const SUBJECT: Outfit = {...AGENT_OUTFITS.agentB, gloves: false, head: {...AGENT_OUTFITS.agentB.head, sunglasses: false}};

/** Blurred metro backdrop for busts. */
const MetroBokeh: React.FC<{t: number; px?: number; tint?: string}> = ({t, px = 0, tint}) => (
  <AbsoluteFill style={{filter: 'blur(14px)', transform: 'scale(1.15)'}}>
    <MetroHall t={t} px={px} floorY={1500} ceilY={250} />
    {tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'multiply'}} />}
  </AbsoluteFill>
);

/* 7. "Não é telepatia, é" — spoof psychic waves from Davi's forehead, crossed out with a red ✗. */
export const STelepathy: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const X = ev(p, 'L3', 2) + 12; // end of "telepatia"
  const x = kf(fr, [X, X + 5], [0, 1], easeOut);
  const cx = 540;
  const cy = 980;
  const waves = 1 - x * 0.7;
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} shakes={[{at: X, dur: 10, amp: 14}]} rot={[2, -1]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #6b3fa0, #1c0d33 75%)'}} />
      <Svg>
        {Array.from({length: 7}).map((_, i) => {
          const ph = (fr * 0.06 + i / 7) % 1;
          const r = 140 + ph * 620;
          return (
            <path
              key={i}
              d={Array.from({length: 49})
                .map((__, k) => {
                  const a = (k / 48) * Math.PI * 2;
                  const rr = r + Math.sin(a * 10 + fr * 0.5) * 14;
                  return `${k ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy - 160 + Math.sin(a) * rr * 0.75).toFixed(1)}`;
                })
                .join(' ')}
              fill="none"
              stroke="#e59bff"
              strokeWidth={10}
              opacity={Math.sin(ph * Math.PI) * 0.8 * waves}
            />
          );
        })}
      </Svg>
      <Bust
        outfit={DAVI_OUTFIT}
        cx={cx}
        cy={cy}
        r={190}
        pose={{shL: -120, elL: 215, shR: 120, elR: -215, headTilt: Math.sin(t * 6) * 3}}
        expr={x > 0.5 ? {eyesWide: 0.6, browRaise: 0.8, mouthOpen: 0.2} : {blink: 1, browRaise: 0.6, mouthOpen: 0.35, smile: 0.2}}
      />
      <Stamp x={540} y={1250} text="TELEPATIA" color="#9b4dd6" k={fr - 2} rot={-4} size={86} bg="rgba(250,240,255,0.92)" />
      <Svg>
        {x > 0 && (
          <g stroke="#ff2b2b" strokeWidth={34} strokeLinecap="round" style={{filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.4))'}}>
            <line x1={300} y1={1070} x2={lerp(300, 780, x)} y2={lerp(1070, 1420, x)} />
            <line x1={780} y1={1070} x2={lerp(780, 300, clamp(x * 1.3 - 0.3))} y2={lerp(1070, 1420, clamp(x * 1.3 - 0.3))} />
          </g>
        )}
      </Svg>
      <Finish vignette={0.6} grain={0.08} />
    </Rig>
  );
};

const EQS: {s: string; x: number; y: number; r: number; size: number; key?: boolean}[] = [
  {s: '43 músculos', x: 120, y: 620, r: -6, size: 60, key: true},
  {s: 'Δt = 0,05 s', x: 640, y: 600, r: 5, size: 56},
  {s: 'P(mentira) = 0,94', x: 90, y: 1250, r: 4, size: 52},
  {s: 'x² + y² = r²', x: 660, y: 1180, r: -5, size: 52},
  {s: 'Σ = 100%', x: 720, y: 880, r: 8, size: 58, key: true},
  {s: 'f(cara) → ?', x: 70, y: 920, r: -8, size: 54},
  {s: 'π', x: 900, y: 1290, r: 0, size: 80},
];

/* 8. "conta. Teu rosto" — chalkboard: equations scribble around Davi's head. */
export const SMath: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} whip="u" zoom={[1.02, 1.12]} rot={[-1.5, 1]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2f4a3c, #15221b 80%)'}}>
        <AbsoluteFill style={{background: 'repeating-linear-gradient(12deg, rgba(255,255,255,0.025) 0 3px, transparent 3px 9px)'}} />
      </AbsoluteFill>
      {EQS.map((e, i) => {
        const k = clamp((fr - i * 2.4) / 6);
        if (k <= 0) return null;
        const chars = Math.ceil(e.s.length * k);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: e.x,
              top: e.y + Math.sin(t * 3 + i) * 6,
              transform: `rotate(${e.r}deg)`,
              fontFamily: HUD_FONT,
              fontWeight: 700,
              fontSize: e.size,
              color: e.key ? '#ffd23a' : '#f2f2ea',
              opacity: 0.92,
              textShadow: e.key ? '0 0 14px rgba(255,210,58,0.6)' : '0 0 6px rgba(255,255,255,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            {e.s.slice(0, chars)}
          </div>
        );
      })}
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={1060} r={170} pose={{facing: 0.1, headTilt: -4, shR: 140, elR: -40}} expr={{halfSmile: 0.9, browAsym: 0.6, lookX: 0.6, lookY: -0.6}} />
      <EnergyLines x={540} y={1060} r0={200} r1={360} k={0.7} frame={fr} seed="math" count={12} />
      <Finish vignette={0.55} grain={0.12} />
    </Rig>
  );
};

/* Face-muscle x-ray: 21 mirrored pairs + procerus = 43 (stylised). Head-local: centre (0,0), head rx 300 ry 390. */
type M = [number, number, number, number, number]; // x, y, rx, ry, rot
const HALF: M[] = [
  [70, -300, 70, 40, 10], // frontalis upper
  [150, -250, 60, 36, 30], // frontalis lateral
  [60, -210, 50, 22, -10], // corrugator
  [120, -120, 66, 50, 0], // orbicularis oculi (upper)
  [120, -40, 70, 26, 0], // orbicularis oculi (lower)
  [215, -150, 40, 26, 40], // temporalis front
  [250, -40, 34, 70, 5], // temporalis
  [36, -30, 14, 70, 10], // nasalis
  [70, 20, 22, 40, -20], // levator labii sup. alaeque
  [120, 40, 22, 50, -25], // levator labii sup.
  [170, 60, 24, 70, -40], // zygomaticus minor
  [205, 80, 26, 90, -48], // zygomaticus major
  [235, 160, 50, 90, 8], // masseter
  [185, 150, 36, 40, -10], // buccinator
  [140, 155, 26, 26, 0], // risorius
  [66, 150, 30, 26, 0], // orbicularis oris (side)
  [40, 115, 24, 14, 0], // orbicularis oris (upper)
  [40, 200, 26, 14, 0], // orbicularis oris (lower)
  [110, 225, 26, 34, 30], // depressor anguli oris
  [55, 250, 22, 30, 10], // depressor labii / mentalis
  [190, 300, 40, 70, 30], // platysma
];

const FaceXray: React.FC<{cx: number; cy: number; s: number; lit: number; frame: number; pulse?: number}> = ({cx, cy, s, lit, frame, pulse = 0}) => {
  const all: M[] = [...HALF, ...HALF.map(([x, y, rx, ry, r]) => [-x, y, rx, ry, -r] as M), [0, -150, 22, 46, 0]];
  // light order: alternate sides top → bottom
  const order = all.map((m, i) => ({m, i, key: m[1] + (m[0] < 0 ? 0.5 : 0)})).sort((a, b) => a.key - b.key);
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={300} ry={390} fill="rgba(80,200,255,0.06)" stroke="#7fe3ff" strokeWidth={5} />
      <path d="M -300,40 Q -280,330 0,400 Q 280,330 300,40" fill="none" stroke="#7fe3ff" strokeWidth={3} opacity={0.5} />
      <rect x={-90} y={360} width={180} height={160} fill="rgba(80,200,255,0.05)" stroke="#7fe3ff" strokeWidth={3} opacity={0.6} />
      {order.map(({m, i}, n) => {
        const on = clamp(lit * 43 - n);
        const [x, y, rx, ry, r] = m;
        const hi = pulse > 0 && (i === 15 || i === 18 + 21) ? pulse : 0;
        return (
          <g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
            <ellipse rx={rx} ry={ry} fill={hi ? '#ff4d4d' : '#ff9a6a'} opacity={0.12 + on * 0.55 + hi * 0.3} stroke={on > 0.5 ? '#ffd23a' : '#7fe3ff'} strokeWidth={on > 0.5 ? 5 : 2} />
            {Array.from({length: 3}).map((_, k) => (
              <line key={k} x1={-rx * 0.6} y1={(k - 1) * ry * 0.35} x2={rx * 0.6} y2={(k - 1) * ry * 0.35} stroke="#fff" strokeWidth={2} opacity={0.25 * on} />
            ))}
          </g>
        );
      })}
      {/* eyes, nose, mouth outlines */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * 120} cy={-80} rx={44} ry={22} fill="#0a1a26" stroke="#bff3ff" strokeWidth={4} />
          <circle cx={sd * 120 + Math.sin(frame * 0.2) * 6} cy={-80} r={12} fill="#bff3ff" />
        </g>
      ))}
      <path d="M 0,-60 L -26,60 L 24,64" fill="none" stroke="#bff3ff" strokeWidth={4} strokeLinejoin="round" />
      <path d="M -60,150 Q 0,180 60,150" fill="none" stroke="#bff3ff" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

/* 9. "tem quarenta e três músculos." — face x-ray; muscles light up 1 → 43; HUD 43 MÚSCULOS. */
export const SMuscles: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const S = ev(p, 'L3', 8);
  const E = ev(p, 'L3', 11);
  const lit = kf(fr, [S - 2, E], [0, 1], (x) => x);
  const n = Math.round(lit * 43);
  const scan = ((fr * 26) % 1000) + 450;
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} pan={[0, 20, 0, -10]} punches={[{at: E, amt: 0.05}]}>
      <LabBg t={t} />
      <Svg>
        <FaceXray cx={540} cy={930} s={1.02} lit={lit} frame={fr} />
        <rect x={0} y={scan} width={W} height={8} fill="#7fe3ff" opacity={0.5} />
        <rect x={0} y={scan - 60} width={W} height={60} fill="#7fe3ff" opacity={0.08} />
      </Svg>
      <HudTag x={540} y={1600} label="MÚSCULOS NO ROSTO" value={String(n)} k={kf(fr, [2, 8], [0, 1])} align="center" color={n >= 43 ? '#ffd23a' : '#bff3ff'} size={130} />
      <CutFlash frames={4} peak={0.4} color="160,230,255" />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/** Tiny pop of a corner-of-mouth twitch: 0 → 1 → 0 over ~3 frames (1/20 s ≈ 1.5 frames, exaggerated a touch to be visible). */
const twitch = (fr: number, at: number) => kf(fr, [at, at + 1, at + 3], [0, 1, 0], (x) => x);

/* 10. "Pensou, mexeu," — subject bust: idea spark, then a 1-frame mouth-corner twitch. */
export const SThink: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const M = ev(p, 'L3', 13);
  const tw = twitch(fr, M + 1);
  const bulb = kf(fr, [1, 6], [0, 1], easeOut) * (1 - kf(fr, [M - 2, M + 2], [0, 1]));
  const expr: Expression = {halfSmile: tw * 1.2, browAsym: tw * 0.8, lookX: -0.4, lookY: -0.6, browRaise: 0.1};
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[-20, 0, 20, 0]} origin={[540, 950]}>
      <MetroBokeh t={t} px={-400} />
      <Bust outfit={SUBJECT} cx={540} cy={960} r={270} pose={{facing: -0.1}} expr={expr} light={METRO_LIGHT} />
      <Svg>
        {bulb > 0 && (
          <g transform={`translate(800,620) scale(${bulb})`} opacity={bulb}>
            <circle r={70} fill="#fff2a0" style={{filter: 'drop-shadow(0 0 30px #ffd23a)'}} />
            <rect x={-28} y={60} width={56} height={40} rx={8} fill="#8a8f98" />
            <path d="M -20,10 L -6,-20 L 6,10 L 20,-20" stroke="#c98a00" strokeWidth={6} fill="none" />
            {Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 90} y1={Math.sin(a) * 90} x2={Math.cos(a) * 120} y2={Math.sin(a) * 120} stroke="#ffd23a" strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        {fr >= M && (
          <g stroke="#ffd23a" strokeWidth={7} strokeLinecap="round" opacity={kf(fr, [M, M + 2, M + 14], [0, 1, 0.8])}>
            {[0, 1, 2].map((i) => {
              const a = -0.9 + i * 0.5;
              const ox = 540 + 2.2 * 24 + 40;
              const oy = 960 + 2.2 * 55;
              return <line key={i} x1={ox + Math.cos(a) * 30} y1={oy + Math.sin(a) * 30} x2={ox + Math.cos(a) * 70} y2={oy + Math.sin(a) * 70} />;
            })}
          </g>
        )}
      </Svg>
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/* 11. "por um vigésimo de segundo." — film strip of the face; the twitch frame circled; HUD 1/20 s. */
export const SFrames: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const C = ev(p, 'L3', 18);
  const scroll = lerp(120, -120, easeOut(clamp(fr / p.dur)));
  const fw = 290;
  const y0 = 690;
  const fh = 380;
  const twIdx = 2;
  const circ = kf(fr, [C - 4, C + 6], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} whip="l" zoom={[1.04, 1.1]} rot={[-3, -1]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #3a2f28, #120d0b 80%)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateX(${scroll}px)`}}>
        <div style={{position: 'absolute', left: -200, top: y0 - 50, width: W + 400, height: fh + 100, background: '#151515'}} />
        <Svg>
          {Array.from({length: 40}).map((_, i) => (
            <g key={i}>
              <rect x={-190 + i * 38} y={y0 - 38} width={20} height={22} rx={4} fill="#e8e0d0" opacity={0.85} />
              <rect x={-190 + i * 38} y={y0 + fh + 16} width={20} height={22} rx={4} fill="#e8e0d0" opacity={0.85} />
            </g>
          ))}
        </Svg>
        {Array.from({length: 7}).map((_, i) => {
          const fx = -110 + i * (fw + 20);
          return (
            <div key={i} style={{position: 'absolute', left: fx, top: y0, width: fw, height: fh, overflow: 'hidden', background: '#c9d6de', borderRadius: 6}}>
              <div style={{position: 'absolute', left: -fx, top: -y0, width: W, height: H}}>
                <Bust outfit={SUBJECT} cx={fx + fw / 2} cy={y0 + 170} r={110} expr={{halfSmile: i === twIdx ? 1.2 : 0, browAsym: i === twIdx ? 0.8 : 0, lookX: -0.3}} />
              </div>
              <div style={{position: 'absolute', right: 8, bottom: 4, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 24, color: '#333'}}>{`#${i + 11}`}</div>
            </div>
          );
        })}
        <Svg>
          {circ > 0 && (
            <ellipse
              cx={-110 + twIdx * (fw + 20) + fw / 2}
              cy={y0 + fh / 2}
              rx={200}
              ry={250}
              fill="none"
              stroke="#ff3b3b"
              strokeWidth={14}
              strokeDasharray={1500}
              strokeDashoffset={1500 * (1 - circ)}
              transform={`rotate(-10 ${-110 + twIdx * (fw + 20) + fw / 2} ${y0 + fh / 2})`}
            />
          )}
        </Svg>
      </div>
      <Svg>
        <g transform="translate(160,1700)">
          <circle r={84} fill="#f4f1ea" stroke="#222" strokeWidth={10} />
          <rect x={-16} y={-118} width={32} height={30} rx={6} fill="#222" />
          <path d={`M0,0 L${Math.sin(fr * 0.5) * 64},${-Math.cos(fr * 0.5) * 64}`} stroke="#d23c3c" strokeWidth={8} strokeLinecap="round" />
          <path d={`M0,0 L0,-78 A78,78 0 0 1 ${Math.sin(0.314) * 78},${-Math.cos(0.314) * 78} Z`} fill="#ffd23a" opacity={0.7} />
        </g>
      </Svg>
      <HudTag x={290} y={1610} label="DURAÇÃO" value="1/20 s" k={kf(fr, [C - 6, C], [0, 1])} color="#ffd23a" size={120} />
      <Finish vignette={0.55} grain={0.12} />
    </Rig>
  );
};

/* 12. "Microexpressão." — tight on the mouth corner flicking, circled. */
export const SMicro: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const r = 640;
  const k = r / 122;
  const mx = 620;
  const my = 960;
  const cx = mx - 24 * k;
  const cy = my - 62 * k;
  const tw = twitch(fr, 3) + twitch(fr, 16);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.15]} origin={[mx, my]} punches={[{at: 3, amt: 0.06}, {at: 16, amt: 0.05}]}>
      <MetroBokeh t={t} px={-400} />
      <Bust outfit={SUBJECT} cx={cx} cy={cy} r={r} expr={{halfSmile: tw * 1.2, browAsym: tw * 0.8, lookX: -0.3}} light={METRO_LIGHT} />
      <Svg>
        <circle cx={mx} cy={my} r={190} fill="none" stroke="#ff3b3b" strokeWidth={14} strokeDasharray={1200} strokeDashoffset={1200 * (1 - kf(fr, [0, 8], [0, 1], easeOut))} />
        {tw > 0.3 && <circle cx={mx} cy={my} r={230} fill="none" stroke="#ffd23a" strokeWidth={6} opacity={tw} />}
      </Svg>
      <HudTag x={540} y={1610} label="1 FRAME · CANTO DA BOCA" value="MICROEXPRESSÃO" k={kf(fr, [2, 7], [0, 1])} align="center" color="#ffd23a" size={96} />
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/* 13. "Existe de verdade." — science card + green stamp "REAL". */
export const SReal: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const V = ev(p, 'L3', 22);
  const card = kf(fr, [0, 7], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} rot={[-2, 0]} shakes={[{at: V, dur: 10, amp: 12}]}>
      <LabBg c1="#23384a" c2="#0b1018" t={t} />
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 560,
          width: 860,
          height: 740,
          background: '#f7f2e4',
          borderRadius: 24,
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          transform: `translateY(${(1 - card) * 300}px) rotate(${lerp(-12, -2, card)}deg)`,
          opacity: card,
          padding: '40px 50px',
          boxSizing: 'border-box',
          color: '#1d2430',
        }}
      >
        <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: '#5a6676'}}>FICHA CIENTÍFICA</div>
        <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 92, lineHeight: 1.05, marginTop: 10}}>MICROEXPRESSÃO</div>
        <div style={{height: 6, width: 160, background: '#ffd23a', margin: '18px 0 26px'}} />
        {[
          ['DURA', '1/25 a 1/5 s'],
          ['ONDE', 'boca, olhos, sobrancelha'],
          ['QUEM ESTUDOU', 'Paul Ekman (psicólogo)'],
        ].map(([a, b], i) => (
          <div key={i} style={{display: 'flex', gap: 20, alignItems: 'baseline', marginBottom: 18, opacity: clamp((fr - 6 - i * 3) / 4)}}>
            <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: '#7a8596', width: 260}}>{a}</div>
            <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 46}}>{b}</div>
          </div>
        ))}
      </div>
      <Stamp x={700} y={1180} text="REAL" sub="EXISTE MESMO" color="#1f9d4a" k={fr - V} rot={-12} size={120} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};
