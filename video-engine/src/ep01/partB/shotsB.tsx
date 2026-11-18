import React from 'react';
import {AbsoluteFill, Sequence, random, useCurrentFrame} from 'remotion';
import {Copacabana} from '../../environments/Copacabana';
import {CityMap, MapPin, MicMarker} from '../../environments/CityMap';
import {Davi} from '../../characters/Davi';
import {PlacedAgent} from '../../characters/Agent';
import {NIGHT_LIGHT} from '../../characters/types';
import {Cam, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {HUD_FONT, CAPTION_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Particles} from '../../fx/Particles';
import {Shockwave} from '../../fx/Shockwave';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {DAVI_SPOT} from '../../scenes/Shot1Calcadao';
import {Shot5Car} from '../../scenes/Shot5Car';
import {Rig, ShotP, ev} from './rig';
import {DuskCity, LinhaEmblem, MicBox, PoleWithMic, RedCan, wristOf} from './kit';
import {GloveOn} from './hands';

const abs = (p: ShotP, fr: number) => 34.76 + (p.from + fr) / 30;
const ping = (fr: number, at: number, len = 16) => (fr >= at ? clamp((fr - at) / len) : 0);

/* 9. "Foi o estalo que entregou ele" — sound ring runs down the avenue and hits a hidden mic on a lamp post. */
export const SWave: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const HIT = ev(p, 'L11', 4);
  const k = easeOut(clamp(fr / (HIT + 4)));
  const LAMP = {x: 12, z: 14.6};
  const cam: Cam = {x: lerp(1.5, 9.4, k), y: 2.6, z: 3.5, pitch: 5, f: 1500, cy: H * 0.52};
  const mic = project(cam, LAMP.x - 0.25, 3.9, LAMP.z)!;
  const age = fr + 20;
  const R = Math.pow(age, 0.85) * (12.2 / Math.pow(HIT + 20, 0.85));
  const hit = fr >= HIT;
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.05]} origin={[mic.sx, mic.sy]} punches={[{at: HIT, amt: 0.45, len: 30}]} shakes={[{at: HIT, dur: 8, amp: 8}]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={mic.depth}
        aperture={7}
        actors={[
          {
            key: 'mic',
            x: LAMP.x - 0.25,
            z: LAMP.z - 0.01,
            sharp: true,
            render: ({sx, sy, ppm}) => (
              <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <MicBox x={sx} y={sy - ppm * 3.9} scale={ppm * 0.0045} led={hit ? (Math.floor(fr / 3) % 2 ? 1 : 0.6) : 0.2} ping={ping(fr, HIT, 18)} />
              </svg>
            ),
          },
        ]}
      />
      {/* ground ring travelling from the jump spot */}
      <svg width={W} height={H} style={{position: 'absolute', filter: 'drop-shadow(0 0 10px rgba(170,215,255,0.9))'}}>
        {[0, 1, 2].map((i) => {
          const r = R - i * 0.7;
          if (r <= 0) return null;
          const pts = Array.from({length: 97}).map((_, j) => {
            const th = (j / 96) * Math.PI * 2;
            return project(cam, DAVI_SPOT.x + Math.cos(th) * r, 0.05, DAVI_SPOT.z + Math.sin(th) * r);
          });
          const d = pts.map((q, j) => (q ? `${j ? 'L' : 'M'}${q.sx.toFixed(1)},${q.sy.toFixed(1)}` : '')).join(' ');
          const wall = Array.from({length: 97}).map((_, j) => {
            const th = (j / 96) * Math.PI * 2;
            return project(cam, DAVI_SPOT.x + Math.cos(th) * r, 4.2, DAVI_SPOT.z + Math.sin(th) * r);
          });
          const d2 = wall.map((q, j) => (q ? `${j ? 'L' : 'M'}${q.sx.toFixed(1)},${q.sy.toFixed(1)}` : '')).join(' ');
          return (
            <g key={i} opacity={0.9 - i * 0.25}>
              <path d={d.replace(/^ +/, '').replace(/^L/, 'M')} stroke="#fff" strokeWidth={6 - i * 2} fill="none" />
              <path d={d2.replace(/^ +/, '').replace(/^L/, 'M')} stroke="#bfe6ff" strokeWidth={3} fill="none" opacity={0.5} />
            </g>
          );
        })}
      </svg>
      <Particles t={t} seed="b9p" count={20} bokeh={4} driftX={-40} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 10. "Uma ordem antiga, a Linha" — Rocha emerges from the dark in front of the old seal. HUD A LINHA · ROCHA. */
export const SRocha: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const L = ev(p, 'L11', 10);
  const reveal = kf(fr, [0, 18], [0.12, 1], easeOut);
  const h = 2100;
  const headY = 1060;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.14]} pow={1.5} origin={[540, 1000]} rot={[1.5, -0.5]} punches={[{at: L, amt: 0.05}]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1b1a24 0%, #07070b 70%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: kf(fr, [0, 12], [0.3, 1])}}>
        <LinhaEmblem x={540} y={720} r={430} glow={reveal} sweep={kf(fr, [4, 30], [-0.2, 1.2])} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 40% at 50% 70%, rgba(0,0,0,0.7), rgba(0,0,0,0))'}} />
      <AbsoluteFill style={{filter: `brightness(${reveal})`}}>
        <PlacedAgent
          variant="rocha"
          x={540}
          y={headY + 884 * (h / 1000)}
          height={h}
          upperOnly
          light={{...NIGHT_LIGHT, rim: '#ffcf8a', rimStrength: 0.9, side: -1}}
          pose={{facing: 0.05, headTilt: 3, shL: -6, elL: 10, shR: 6, elR: -10}}
          expr={{halfSmile: kf(fr, [L, L + 10], [0.2, 0.9]), browTilt: -0.5, browAsym: 0.3}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(255,190,110,0.12), rgba(0,0,0,0) 40%)', mixBlendMode: 'screen'}} />
      <HudLabel label="A LINHA" value="ROCHA" x={90} y={560} tx={420} ty={headY - 60} from={L} />
      <Particles t={t} seed="b10p" count={18} bokeh={3} color="255,210,160" bokehColor="200,150,90" driftX={-6} />
      <Finish vignette={0.7} grain={0.13} />
    </Rig>
  );
};

/* 11. "espalhou microfone" — whip down from the sky to a mic clamped on a post. */
export const SMic: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const M = ev(p, 'L11', 12);
  return (
    <Rig dur={p.dur} whip="d" pan={[0, 380, 0, 0]} pow={3} zoom={[1.1, 1.2]} punches={[{at: M, amt: 0.06}]}>
      <AbsoluteFill style={{transform: `translateY(${-fr * 2}px) scale(1.1)`}}>
        <DuskCity t={t} seed="m1" />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <PoleWithMic x={720} topY={300} micY={900} scale={1.5} led={fr >= M ? (Math.floor(fr / 3) % 2 ? 1 : 0.5) : 0.2} ping={ping(fr, M, 14)} />
      </svg>
      <Particles t={t} seed="b11p" count={14} bokeh={5} driftX={-20} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 12. "pela cidade" — aerial city map, dozens of mics light up, fast pull-out. */
export const SCity: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const mics = Array.from({length: 34}).map((_, i) => {
    const r = (k: string) => random(`cm-${i}-${k}`);
    return {x: -100 + r('x') * 1150, y: -50 + r('y') * 2500, d: r('d') * 18};
  });
  return (
    <Rig dur={p.dur} zoom={[2.3, 1.08]} pow={2.4} origin={[600, 1000]} rot={[-8, 0]}>
      <AbsoluteFill style={{background: '#0a1430'}}>
        <AbsoluteFill style={{transform: 'perspective(1800px) rotateX(18deg)', transformOrigin: '50% 50%'}}>
          <svg width={W} height={H} viewBox="-260 -120 1480 2632" style={{overflow: 'visible'}}>
            <CityMap t={t} idPrefix="bcity" labels={false} />
            {mics.map((m, i) => {
              const on = clamp((fr - m.d) / 4);
              if (on <= 0) return null;
              return (
                <g key={i} opacity={on}>
                  <circle cx={m.x} cy={m.y} r={40 + ping(fr, m.d, 14) * 120} fill="none" stroke="#5fd4ff" strokeWidth={6} opacity={1 - ping(fr, m.d, 14)} />
                  <MicMarker x={m.x} y={m.y} active={0.8} scale={0.9 * (0.6 + on * 0.4)} />
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(120,200,255,0.035) 0px, rgba(120,200,255,0.035) 2px, transparent 2px, transparent 6px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0,0,0,0) 50%, rgba(3,6,20,0.85) 100%)'}} />
      <Finish vignette={0.3} grain={0.1} />
    </Rig>
  );
};

/* 13. "Três microfones ouvem o estalo" — split screen, 3 posts, pings in sequence. */
export const SThree: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const at = [ev(p, 'L12', 1), ev(p, 'L12', 2), ev(p, 'L12', 4)];
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} shakes={at.map((a) => ({at: a, dur: 6, amp: 6}))}>
      {[0, 1, 2].map((i) => {
        const slide = kf(fr, [i * 2, i * 2 + 7], [i % 2 ? -H : H, 0], easeOut);
        const push = 1.05 + clamp((fr - at[i]) / 30) * 0.12;
        const led = fr >= at[i] ? (Math.floor(fr / 3) % 2 ? 1 : 0.6) : 0.15;
        return (
          <div key={i} style={{position: 'absolute', left: i * 360 + 3, top: 0, width: 354, height: H, overflow: 'hidden', transform: `translateY(${slide}px)`}}>
            <div style={{position: 'absolute', left: -i * 120 - 240, top: 0, width: W, height: H, transform: `scale(${push})`, transformOrigin: `${i * 120 + 240 + 180}px 950px`}}>
              <DuskCity t={t} seed={`th${i}`} hue={i * 25 - 20} offset={i * 60} />
              <svg width={W} height={H} style={{position: 'absolute'}}>
                <PoleWithMic x={i * 120 + 240 + 270} topY={200 + i * 90} micY={860 + i * 40} scale={1.05} led={led} ping={ping(fr, at[i], 14)} arm={i !== 1} />
              </svg>
              {fr >= at[i] && <AbsoluteFill style={{background: `rgba(255,70,70,${0.25 * (1 - ping(fr, at[i], 10))})`, mixBlendMode: 'screen'}} />}
            </div>
          </div>
        );
      })}
      {[1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: i * 360 - 3, top: 0, width: 6, height: H, background: '#05060a'}} />
      ))}
      <Finish vignette={0.45} />
    </Rig>
  );
};

/* 14. "A diferença de tempo" — three audio traces with offset spikes; Δt bracket + HUD. */
export const SScope: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const sweep = kf(fr, [0, 16], [80, 1000], easeOut);
  const ys = [650, 850, 1050];
  const spikes = [380, 500, 640];
  const B = ev(p, 'L12', 8);
  const trace = (i: number) => {
    const pts: string[] = [];
    for (let x = 80; x <= sweep; x += 6) {
      const d = x - spikes[i];
      let a = (random(`sc-${i}-${x}`) - 0.5) * 10;
      if (d > 0 && d < 90) a += Math.sin(d * 0.45) * 120 * Math.exp(-d / 26);
      pts.push(`${x === 80 ? 'M' : 'L'}${x},${(ys[i] + a).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const br = kf(fr, [B, B + 6], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} rot={[-2, 0]} whip="l" origin={[500, 850]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 45%, #0f2148 0%, #050a1a 80%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={80 + i * 80} y1={540} x2={80 + i * 80} y2={1160} stroke="#4fb8ff" strokeWidth={1.5} opacity={0.12} />
        ))}
        {ys.map((y, i) => (
          <g key={i}>
            <line x1={80} y1={y} x2={1000} y2={y} stroke="#4fb8ff" strokeWidth={1.5} opacity={0.2} />
            <MicBox x={40} y={y} scale={0.28} led={sweep > spikes[i] ? 1 : 0.2} />
            <path d={trace(i)} stroke="#5fd4ff" strokeWidth={10} fill="none" opacity={0.25} strokeLinejoin="round" />
            <path d={trace(i)} stroke="#d9f4ff" strokeWidth={3.5} fill="none" strokeLinejoin="round" />
            {sweep > spikes[i] && <circle cx={spikes[i]} cy={y} r={10} fill="#ff4a4a" />}
          </g>
        ))}
        <line x1={sweep} y1={540} x2={sweep} y2={1160} stroke="#ffffff" strokeWidth={3} opacity={0.5} />
        {br > 0 && (
          <g stroke="#ffd36b" strokeWidth={4} fill="none" opacity={br}>
            <line x1={spikes[0]} y1={ys[0] - 60} x2={spikes[0]} y2={ys[1] + 40} strokeDasharray="10 8" />
            <line x1={spikes[1]} y1={ys[1] - 60} x2={spikes[1]} y2={ys[1] + 40} strokeDasharray="10 8" />
            <line x1={spikes[0]} y1={ys[1] + 70} x2={lerp(spikes[0], spikes[1], br)} y2={ys[1] + 70} />
            <path d={`M${spikes[0] + 14},${ys[1] + 58} L${spikes[0]},${ys[1] + 70} L${spikes[0] + 14},${ys[1] + 82}`} />
            {br > 0.95 && <path d={`M${spikes[1] - 14},${ys[1] + 58} L${spikes[1]},${ys[1] + 70} L${spikes[1] - 14},${ys[1] + 82}`} />}
          </g>
        )}
      </svg>
      <HudLabel label="Δt" value={0.004} decimals={3} unit="s" x={110} y={1150} tx={(spikes[0] + spikes[1]) / 2} ty={ys[1] + 70} from={B} />
      <Finish vignette={0.4} grain={0.1} />
    </Rig>
  );
};

/* 15. "diz onde foi" — three rings meet on the map, pin drops on "foi". */
const MICS: [number, number][] = [
  [330, 820],
  [1010, 900],
  [560, 1640],
];
const PIN: [number, number] = [700, 1180];
export const SMap: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const D = ev(p, 'L12', 11);
  const k = (i: number) => clamp((fr + 18 - i * 4) / (D + 18 - i * 4));
  const pinDrop = kf(fr, [D, D + 5], [0, 1], easeOut);
  const pulse = fr > D + 5 ? ((fr - D - 5) % 16) / 16 : 0;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.25]} origin={[540, 960]} rot={[-5, 0]} punches={[{at: D + 4, amt: 0.1}]} shakes={[{at: D + 4, dur: 8, amp: 10}]}>
      <AbsoluteFill style={{background: '#0a1430'}}>
        <AbsoluteFill style={{transform: 'perspective(1800px) rotateX(22deg)', transformOrigin: '50% 50%'}}>
          <svg width={W} height={H} viewBox={`${PIN[0] - W / 2} ${PIN[1] - H / 2} ${W} ${H}`} style={{overflow: 'visible'}}>
            <CityMap t={t} idPrefix="bmap" />
            {MICS.map(([mx, my], i) => {
              const dist = Math.hypot(PIN[0] - mx, PIN[1] - my);
              const r = dist * easeOut(k(i));
              const done = fr >= D;
              return (
                <g key={i}>
                  <circle cx={mx} cy={my} r={r} fill="#5fd4ff" opacity={0.07} />
                  <circle cx={mx} cy={my} r={r} fill="none" stroke="#5fd4ff" strokeWidth={14} opacity={0.4} />
                  <circle cx={mx} cy={my} r={r} fill="none" stroke={done ? '#ffffff' : '#9fe6ff'} strokeWidth={5} />
                  <MicMarker x={mx} y={my} active={0.8} scale={1.2} />
                </g>
              );
            })}
            <MapPin x={PIN[0]} y={PIN[1]} drop={pinDrop} pulse={pulse} scale={1.4} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(120,200,255,0.035) 0px, rgba(120,200,255,0.035) 2px, transparent 2px, transparent 6px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0,0,0,0) 50%, rgba(3,6,20,0.85) 100%)'}} />
      <Finish vignette={0.35} grain={0.1} />
    </Rig>
  );
};

/* 16. "Dois segundos depois" — stopwatch sweeps to 2 s and clicks. */
export const SWatch: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const S = ev(p, 'L12', 14);
  const v = kf(fr, [0, S], [0, 2], (x) => x);
  const ang = (v / 10) * 360;
  const cx = 540;
  const cy = 930;
  const R = 340;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} whip="r" punches={[{at: S, amt: 0.14}]} shakes={[{at: S, dur: 8, amp: 12}]} origin={[cx, cy]}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 48%, #23314f 0%, #070b16 70%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="sw-m" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#f4f6fa" />
            <stop offset="0.7" stopColor="#9aa3b4" />
            <stop offset="1" stopColor="#4a5262" />
          </radialGradient>
        </defs>
        <rect x={cx - 34} y={cy - R - 110} width={68} height={70} rx={10} fill="url(#sw-m)" />
        <rect x={cx - 60} y={cy - R - 130} width={120} height={30} rx={12} fill="url(#sw-m)" transform={`translate(0,${fr >= S && fr < S + 4 ? 14 : 0})`} />
        <circle cx={cx} cy={cy} r={R + 34} fill="url(#sw-m)" />
        <circle cx={cx} cy={cy} r={R} fill="#fbfaf6" />
        {Array.from({length: 50}).map((_, i) => {
          const a = (i / 50) * Math.PI * 2 - Math.PI / 2;
          const big = i % 5 === 0;
          return <line key={i} x1={cx + Math.cos(a) * (R - (big ? 50 : 26))} y1={cy + Math.sin(a) * (R - (big ? 50 : 26))} x2={cx + Math.cos(a) * (R - 10)} y2={cy + Math.sin(a) * (R - 10)} stroke="#1a1d24" strokeWidth={big ? 7 : 3} />;
        })}
        {Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          return (
            <text key={i} x={cx + Math.cos(a) * (R - 95)} y={cy + Math.sin(a) * (R - 95) + 16} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={46} fill={i === 2 && fr >= S ? '#e8352f' : '#1a1d24'}>
              {i}
            </text>
          );
        })}
        <path d={`M ${cx},${cy} L ${cx + Math.cos((ang * Math.PI) / 180 - Math.PI / 2) * (R - 30)},${cy + Math.sin((ang * Math.PI) / 180 - Math.PI / 2) * (R - 30)}`} stroke="#e8352f" strokeWidth={10} strokeLinecap="round" />
        <path d={`M ${cx},${cy} A ${R - 140} ${R - 140} 0 0 1 ${cx + Math.cos((ang * Math.PI) / 180 - Math.PI / 2) * (R - 140)},${cy + Math.sin((ang * Math.PI) / 180 - Math.PI / 2) * (R - 140)} Z`} fill="#e8352f" opacity={0.15} />
        <circle cx={cx} cy={cy} r={22} fill="#1a1d24" />
        <rect x={cx - 120} y={cy + 110} width={240} height={86} rx={12} fill="#14171f" />
        <text x={cx} y={cy + 172} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={60} fill="#ff5a4a">
          {v.toFixed(2).replace('.', ',')} s
        </text>
        <circle cx={cx - R * 0.45} cy={cy - R * 0.55} r={R * 0.25} fill="#fff" opacity={0.25} />
      </svg>
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 17. "eles sabem" — Rocha in the dark car with the tablet (approved test shot, later part), fast push-in. */
export const SCar: React.FC<ShotP> = (p) => (
  <Rig dur={p.dur} zoom={[1.05, 1.35]} pow={2} origin={[330, 1150]} whip="l">
    <Sequence from={-40} durationInFrames={90}>
      <Shot5Car />
    </Sequence>
  </Rig>
);

/* 18. "A Linha não usa arma" — generic pistol spinning in a spotlight; red X slashes on "arma". */
export const SGun: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const X = ev(p, 'L13', 4);
  const spin = Math.cos(fr * 0.09 + 0.4);
  const s1 = kf(fr, [X, X + 3], [0, 1], easeOut);
  const s2 = kf(fr, [X + 3, X + 6], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} origin={[540, 960]} punches={[{at: X, amt: 0.12}]} shakes={[{at: X, dur: 12, amp: 22}]} rot={[2, -1]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 35% at 50% 50%, #3a3f4c 0%, #101218 55%, #050608 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', filter: `brightness(${fr >= X ? 0.55 : 1})`}}>
        <ellipse cx={540} cy={1240} rx={360} ry={50} fill="#000" opacity={0.5} />
        <g transform={`translate(540,960) scale(${0.35 + 0.65 * Math.abs(spin)},1) scale(${spin < 0 ? -1 : 1},1)`}>
          <path d="M -330,-120 L 300,-120 Q 330,-120 330,-90 L 330,-30 L -100,-30 L -110,10 Q -60,60 -60,80 L -90,90 L -150,10 L -170,-30 L -330,-30 Z" fill="#2a2d35" />
          <path d="M -170,-30 L -100,-30 L -60,260 Q -60,290 -100,290 L -220,290 Q -250,290 -245,260 Z" fill="#1d1f25" />
          <path d="M -330,-120 L 300,-120 L 300,-100 L -330,-100 Z" fill="#7b808d" />
          {Array.from({length: 6}).map((_, i) => (
            <line key={i} x1={-220 + i * 18} y1={0} x2={-200 + i * 18} y2={260} stroke="#0d0e12" strokeWidth={5} />
          ))}
          <path d="M -150,10 Q -130,90 -80,80" stroke="#7b808d" strokeWidth={8} fill="none" />
        </g>
      </svg>
      <svg width={W} height={H} style={{position: 'absolute', filter: 'drop-shadow(0 0 18px rgba(255,40,40,0.8))'}}>
        <line x1={190} y1={610} x2={lerp(190, 890, s1)} y2={lerp(610, 1310, s1)} stroke="#ff2b2b" strokeWidth={56} strokeLinecap="round" opacity={s1 > 0 ? 1 : 0} />
        <line x1={890} y1={610} x2={lerp(890, 190, s2)} y2={lerp(610, 1310, s2)} stroke="#ff2b2b" strokeWidth={56} strokeLinecap="round" opacity={s2 > 0 ? 1 : 0} />
      </svg>
      <Finish vignette={0.6} grain={0.13} />
    </Rig>
  );
};

/* 19. "Usa luva" — black leather glove pulled on; snap on "luva". */
export const SGloveOn: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const S = ev(p, 'L13', 6);
  const tug = kf(fr, [0, S + 1], [0, 1], easeIn);
  const flex = kf(fr, [S + 3, S + 12, p.dur], [0, 1, 0.6]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} rot={[-6, -2]} origin={[540, 900]} whip="u" punches={[{at: S + 1, amt: 0.07}]} shakes={[{at: S + 1, dur: 8, amp: 10}]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 55% at 60% 40%, #1b2440 0%, #05070f 75%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6))'}}>
        <GloveOn x={560} y={840} tug={tug} flex={flex} />
      </svg>
      <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(127,216,255,0.16), rgba(0,0,0,0) 45%)', mixBlendMode: 'screen'}} />
      <Particles t={abs(p, fr)} seed="b19p" count={12} bokeh={3} color="170,210,255" bokehColor="120,180,255" driftX={-8} />
      <Finish vignette={0.65} grain={0.13} />
    </Rig>
  );
};

/* ---------- dossier ---------- */

const DaviPhoto: React.FC<{x: number; y: number; w: number; can?: boolean; rot?: number; circle?: number}> = ({x, y, w, can, rot = 0, circle = 0}) => {
  const h = w * 1.2;
  const pose = can ? {shR: 30, elR: -120, shL: -8, elL: 6, facing: 0.15} : {facing: 0.1, shL: -8, shR: 8};
  const k = can ? (h * 0.78) / 1000 : (h * 1.25) / 1000;
  const fx = x;
  const fy = can ? y + h * 0.42 : y + h * 0.95;
  const wr = wristOf(pose, 'R');
  const canX = fx + wr[0] * k;
  const canY = fy + wr[1] * k - 20 * k;
  const clip = `ph-${Math.round(x)}-${Math.round(y)}-${can ? 1 : 0}`;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <rect x={x - w / 2 - 22} y={y - h / 2 - 22} width={w + 44} height={h + 100} fill="#f6f2ea" />
      <defs>
        <clipPath id={clip}>
          <rect x={x - w / 2} y={y - h / 2} width={w} height={h} />
        </clipPath>
        <linearGradient id={clip + 'g'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f3a76b" />
          <stop offset="0.45" stopColor="#f8cf94" />
          <stop offset="0.5" stopColor="#6d7fa0" />
          <stop offset="0.62" stopColor="#d9c3a8" />
          <stop offset="1" stopColor="#b9a28a" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={`url(#${clip}g)`} />
        <g transform={`translate(${fx},${fy}) scale(${k})`}>
          <Davi pose={pose} expr={{halfSmile: 0.7, lookX: can ? 0.4 : 0}} />
        </g>
        {can && <RedCan x={canX} y={canY} h={130 * k * 1.3} rot={8} />}
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill="#c9a36a" opacity={0.12} />
      </g>
      {can && circle > 0 && (
        <ellipse cx={canX} cy={canY} rx={w * 0.2} ry={w * 0.22} fill="none" stroke="#e01f1f" strokeWidth={7} strokeDasharray={`${circle * 760} 800`} transform={`rotate(-12 ${canX} ${canY})`} strokeLinecap="round" />
      )}
      {/* paper clip */}
      <path d={`M${x - w * 0.3},${y - h / 2 - 50} l0,90 q0,20 20,20 q20,0 20,-20 l0,-80`} stroke="#9aa0ad" strokeWidth={7} fill="none" />
    </g>
  );
};

const Dossier: React.FC<{open: number; slide: number; stamp?: number; canPhoto?: number}> = ({open, slide, stamp = 0, canPhoto = 0}) => {
  const ox = slide * 1100;
  const fold = open; // 0 closed .. 1 open
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 45%, #5a3a26 0%, #2a1a10 70%, #140c06 100%)'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 18}).map((_, i) => (
          <path key={i} d={`M -20,${i * 120 + 30} Q 540,${i * 120 + 60 + (i % 3) * 20} 1100,${i * 120 + 20}`} stroke="#1c120a" strokeWidth={3} fill="none" opacity={0.35} />
        ))}
        <g transform={`translate(${ox},0) rotate(-4 540 960)`}>
          <rect x={80} y={540} width={920} height={880} rx={10} fill="#000" opacity={0.35} transform="translate(14,18)" />
          {/* inner pages */}
          <rect x={90} y={540} width={900} height={860} rx={8} fill="#d8b77a" />
          <rect x={540} y={560} width={430} height={820} fill="#f4efe4" />
          {Array.from({length: 13}).map((_, i) => (
            <rect key={i} x={575} y={610 + i * 52} width={i % 4 === 3 ? 200 : 350} height={14} rx={4} fill={i % 3 === 1 ? '#1d1d1d' : '#8d877c'} opacity={0.8} />
          ))}
          <text x={575} y={600} fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill="#3a2c1c" letterSpacing={4}>
            ALVO: DAVI
          </text>
          <DaviPhoto x={320} y={820} w={330} rot={-3} />
          <g opacity={canPhoto}>
            <DaviPhoto x={340} y={1180} w={300} rot={4} can circle={1} />
          </g>
          {/* cover */}
          <g transform={`translate(540,0) scale(${1 - fold * 2},1) translate(-540,0)`}>
            <rect x={540} y={540} width={450} height={860} rx={8} fill={fold > 0.5 ? '#c9a462' : '#e2c181'} />
            <rect x={840} y={500} width={140} height={50} rx={8} fill="#e2c181" />
            {fold < 0.5 && (
              <g>
                <LinhaEmblemSmall x={765} y={900} />
                <text x={765} y={1060} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={34} fill="#5a3f1c" letterSpacing={6}>
                  DOSSIÊ 07
                </text>
              </g>
            )}
          </g>
        </g>
        {stamp > 0 && (
          <g transform={`translate(560,1010) rotate(-14) scale(${lerp(2.6, 1, stamp)})`} opacity={Math.min(1, stamp * 1.5)}>
            <rect x={-330} y={-70} width={660} height={140} rx={14} fill="none" stroke="#d01e1e" strokeWidth={14} />
            <text x={0} y={30} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={92} fill="#d01e1e" letterSpacing={6}>
              CONFIDENCIAL
            </text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

const LinhaEmblemSmall: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`} opacity={0.75}>
    <circle r={90} fill="none" stroke="#5a3f1c" strokeWidth={6} />
    <circle r={70} fill="none" stroke="#5a3f1c" strokeWidth={3} />
    <rect x={-70} y={-7} width={140} height={14} fill="#5a3f1c" />
  </g>
);

/* 20. "Eles sabem: o que o Davi" — dossier slides in and opens on Davi's photo. */
export const SDossier: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const slide = kf(fr, [0, 8], [1, 0], easeOut);
  const open = kf(fr, [8, 18], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.2]} rot={[-3, 0]} origin={[400, 900]}>
      <Dossier slide={slide} open={open} />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 21. "segura" — push into the second photo: Davi holding the can, red pen circle. */
export const SPhoto: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const c = kf(fr, [3, 16], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.3, 1.75]} pow={1.6} origin={[380, 1140]} pan={[160, -150, 160, -170]} rot={[2, -1]} whip="d">
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 45%, #5a3a26 0%, #2a1a10 70%, #140c06 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g transform="rotate(-4 540 960)">
          <DaviPhoto x={340} y={1180} w={300} rot={4} can circle={c} />
        </g>
      </svg>
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 22. "protege" — CONFIDENCIAL stamp slams on the dossier. */
export const SStamp: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const S = Math.max(1, ev(p, 'L13', 16) + 2);
  const st = kf(fr, [S, S + 3], [0, 1], easeIn);
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.18]} origin={[540, 1000]} shakes={[{at: S + 3, dur: 12, amp: 26}]} punches={[{at: S + 3, amt: 0.08}]}>
      <Dossier slide={0} open={1} canPhoto={1} stamp={fr >= S ? st : 0} />
      <Finish vignette={0.6} />
    </Rig>
  );
};
