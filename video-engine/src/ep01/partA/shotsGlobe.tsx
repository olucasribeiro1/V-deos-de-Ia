import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Globe, SpaceBackdrop, globeProject, globeView} from '../../environments/Globe';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {Head} from '../../characters/parts';
import {SUNSET_LIGHT} from '../../characters/types';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Easing} from 'remotion';
import {HudLabel} from '../../ui/HudLabel';
import {HUD_FONT} from '../../lib/fonts';
import {Finish} from '../../scenes/common';
import {Cam2D, RedCan, ShotProps, SpeedLines, atS} from './kit';

const RIO = {lat: -22.9, lon: -43.2};
const TOK = {lat: 35.7, lon: 139.7};
const YEL = '#ffd23f';
const ORA = '#ff7a1f';
const inOut = Easing.inOut(Easing.cubic);

const GlobeFrame: React.FC<{t: number; drift?: number; children: React.ReactNode}> = ({t, drift = 0, children}) => (
  <>
    <SpaceBackdrop t={t} driftX={drift} />
    {children}
    <Finish vignette={0.45} grain={0.08} />
  </>
);

/** S20 — globe whips in and spins; pin drops on Rio. */
export const S20GlobeRio: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const k = kf(frame, [0, 22], [0, 1], easeOut);
  const rot = lerp(150, RIO.lon, k);
  const tilt = lerp(15, -18, k);
  const drop = kf(frame, [14, 22], [0, 1], easeOut);
  return (
    <Cam2D d={d} zoom={[0.9, 1.08]} whip="zoom">
      <GlobeFrame t={t} drift={-k * 200}>
        <AbsoluteFill style={{filter: `blur(${(1 - k) * 6}px)`}}>
          <Globe rotation={rot} tilt={tilt} radius={420} t={t} pins={[{...RIO, label: 'RIO', drop, pulse: drop >= 1 ? (frame % 20) / 20 : 0}]} />
        </AbsoluteFill>
      </GlobeFrame>
    </Cam2D>
  );
};

/** S21 — close on Rio: HUD RIO 1.540 km/h, eastward arrow. */
export const S21RioSpeed: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 1;
  const p = kf(frame, [0, d], [0, 1], (x) => x);
  const zoom = 2.5 + p * 0.5;
  const g = {cx: W / 2 - 60, cy: 1180, radius: 420, zoom, rotation: RIO.lon - 6 - p * 4, tilt: RIO.lat + 12};
  const pin = globeProject(globeView(g), RIO.lat, RIO.lon);
  return (
    <Cam2D d={d} zoom={[1, 1.04]} whip="up">
      <GlobeFrame t={t}>
        <Globe {...g} t={t} pins={[{...RIO, label: 'RIO', pulse: (frame % 20) / 20}]} arrows={[{...RIO, length: 14, progress: kf(frame, [4, 24], [0, 1], easeOut), color: YEL}]} />
      </GlobeFrame>
      <HudLabel label="RIO" value={1540} unit="km/h" x={110} y={560} tx={pin.x} ty={pin.y - 40} from={2} />
    </Cam2D>
  );
};

/** S22 — "pro leste": long yellow arrow sweeping east. */
export const S22East: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 2;
  const p = kf(frame, [0, d], [0, 1], easeOut);
  const g = {radius: 420, zoom: 1.35 - p * 0.1, rotation: RIO.lon + 18 + p * 6, tilt: -12, cy: 1000};
  const v = globeView(g);
  const prog = kf(frame, [0, 16], [0, 1], easeOut);
  const tip = globeProject(v, RIO.lat, RIO.lon + 55 * prog, 0.035);
  return (
    <Cam2D d={d} zoom={[1.08, 1.0]} roll={[-3, 0]}>
      <GlobeFrame t={t}>
        <Globe {...g} t={t} pins={[{...RIO, label: 'RIO', labelSide: 'left'}]} arrows={[{...RIO, length: 55, progress: prog, color: YEL, width: 22}]} />
      </GlobeFrame>
      <div style={{position: 'absolute', left: tip.x - 40, top: tip.y - 130, opacity: kf(frame, [8, 14], [0, 1]), fontFamily: HUD_FONT, fontWeight: 700, fontSize: 64, color: YEL, letterSpacing: 4, textShadow: '0 3px 10px rgba(0,0,0,0.7)'}}>LESTE →</div>
    </Cam2D>
  );
};

/** S23 — whip-spin from Rio to Tokyo; pin drops on Tokyo. */
export const S23ToTokyo: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 3;
  const k = kf(frame, [0, 26], [0, 1], inOut);
  const speed = Math.abs(kf(frame + 1, [0, 26], [0, 1], inOut) - k);
  const g = {radius: 420, zoom: 1.1 - Math.sin(k * Math.PI) * 0.2, rotation: lerp(RIO.lon, TOK.lon, k), tilt: lerp(-18, 22, k)};
  const drop = kf(frame, [26, 34], [0, 1], easeOut);
  return (
    <Cam2D d={d} zoom={[1, 1.06]}>
      <GlobeFrame t={t} drift={-k * 400}>
        <AbsoluteFill style={{filter: `blur(${Math.min(10, speed * 120)}px)`}}>
          <Globe {...g} t={t} pins={[{...RIO, label: 'RIO'}, {...TOK, label: 'TÓQUIO', color: ORA, drop, pulse: drop >= 1 ? (frame % 20) / 20 : 0}]} />
        </AbsoluteFill>
      </GlobeFrame>
    </Cam2D>
  );
};

/** S24 — close on Tokyo: HUD TÓQUIO 1.360 km/h. */
export const S24TokyoSpeed: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 4;
  const p = kf(frame, [0, d], [0, 1], (x) => x);
  const g = {cx: W / 2 - 60, cy: 1160, radius: 420, zoom: 2.5 + p * 0.5, rotation: TOK.lon - 4 - p * 4, tilt: TOK.lat - 8};
  const pin = globeProject(globeView(g), TOK.lat, TOK.lon);
  return (
    <Cam2D d={d} zoom={[1, 1.04]} whip="down">
      <GlobeFrame t={t}>
        <Globe {...g} t={t} pins={[{...TOK, label: 'TÓQUIO', color: ORA, pulse: (frame % 20) / 20}]} arrows={[{...TOK, length: 13, progress: kf(frame, [4, 24], [0, 1], easeOut), color: ORA}]} />
      </GlobeFrame>
      <HudLabel label="TÓQUIO" value={1360} unit="km/h" x={110} y={560} tx={pin.x} ty={pin.y - 40} from={2} />
    </Cam2D>
  );
};

/** Polar view: Rio (other hemisphere, drawn at its longitude) at the bottom, Tokyo on top. */
const PolarGlobe: React.FC<{frame: number; t: number; zoom: number; spin: number; arrows: number; pins: number}> = ({frame, t, zoom, spin, arrows, pins}) => (
  <Globe
    rotation={RIO.lon + spin}
    tilt={90}
    radius={400}
    zoom={zoom}
    t={t}
    highlightEquator={1}
    grid={0.3}
    pins={[
      {lat: -RIO.lat, lon: RIO.lon, label: 'RIO', drop: pins, pulse: (frame % 24) / 24},
      {...TOK, label: 'TÓQUIO', color: ORA, drop: pins, pulse: ((frame + 12) % 24) / 24, labelSide: 'left'},
    ]}
    arrows={[
      {lat: -RIO.lat, lon: RIO.lon, length: 38, progress: arrows, color: YEL, width: 22},
      {lat: TOK.lat, lon: TOK.lon, length: 36, progress: arrows, color: ORA, width: 22},
    ]}
  />
);

/** S25 — "do outro lado do planeta": pull back to a view from the pole. */
export const S25Opposite: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 5;
  const k = kf(frame, [0, d], [0, 1], easeOut);
  return (
    <Cam2D d={d} zoom={[1, 1]} roll={[-25, 0]} whip="zoom">
      <GlobeFrame t={t}>
        <PolarGlobe frame={frame} t={t} zoom={1.6 - k * 0.55} spin={-20 + k * 20} arrows={0} pins={kf(frame, [4, 14], [0, 1], easeOut)} />
        {/* dashed diameter showing they are opposite */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <line x1={W / 2} y1={H / 2 - 400 * (1.6 - k * 0.55) * 0.8} x2={W / 2} y2={H / 2 + 400 * (1.6 - k * 0.55) * 0.92} stroke="#fff" strokeWidth={4} strokeDasharray="18 14" opacity={kf(frame, [14, 22], [0, 0.8])} />
        </svg>
      </GlobeFrame>
    </Cam2D>
  );
};

/** S26 — "na direção contrária": arrows draw on in opposite directions. */
export const S26Contrary: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 6;
  const prog = kf(frame, [0, 14], [0, 1], easeOut);
  return (
    <Cam2D d={d} zoom={[1.18, 1.3]} roll={[0, 4]} punches={[{at: 14, amt: 0.05}]}>
      <GlobeFrame t={t}>
        <PolarGlobe frame={frame} t={t} zoom={1.05} spin={0} arrows={prog} pins={1} />
      </GlobeFrame>
    </Cam2D>
  );
};

/** Flat arrow with a label, screen space. dir 1 = right, -1 = left. */
const FlatArrow: React.FC<{x: number; y: number; len: number; dir: number; color: string; th?: number}> = ({x, y, len, dir, color, th = 46}) => {
  const head = th * 1.5;
  const body = Math.max(0, len - head);
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <rect x={0} y={-th / 2 + 8} width={body} height={th} fill="rgba(0,0,0,0.35)" />
      <rect x={0} y={-th / 2} width={body} height={th} rx={6} fill={color} />
      <path d={`M${body - 2},${-head} L${body + head},0 L${body - 2},${head} Z`} fill={color} />
      <rect x={0} y={-th / 2 + 6} width={body} height={th * 0.18} fill="#fff" opacity={0.45} />
    </g>
  );
};

/** S27 — "Diferença:": the two arrows line up head-to-tail (relative velocity). */
export const S27Sum: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 7;
  const k = kf(frame, [6, 24], [0, 1], inOut);
  const U = 0.26; // px per km/h
  const rioLen = 1540 * U;
  const tokLen = 1360 * U;
  const x0 = (W - (rioLen + tokLen)) / 2;
  // Tokyo arrow: starts pointing left under Rio, ends pointing right after Rio's tip
  const tokDir = lerp(-1, 1, k);
  const tokX = lerp(x0 + rioLen + tokLen - 40, x0 + rioLen, k);
  const tokY = lerp(1080, 940, k);
  const rioY = lerp(820, 940, k);
  return (
    <Cam2D d={d} zoom={[1.0, 1.06]} whip="left">
      <GlobeFrame t={t}>
        <AbsoluteFill style={{filter: 'blur(10px)', opacity: 0.6}}>
          <Globe rotation={RIO.lon} tilt={90} radius={420} t={t} />
        </AbsoluteFill>
        <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
          <FlatArrow x={x0} y={rioY} len={rioLen} dir={1} color={YEL} />
          <g transform={`translate(${tokX},${tokY}) scale(${Math.abs(tokDir) < 0.05 ? 0.05 : tokDir},1)`}>
            <FlatArrow x={0} y={0} len={tokLen} dir={1} color={ORA} />
          </g>
        </svg>
        <div style={{position: 'absolute', left: x0, top: rioY - 110, fontFamily: HUD_FONT, fontWeight: 700, fontSize: 40, color: YEL, textShadow: '0 2px 8px #000'}}>RIO 1.540</div>
        <div style={{position: 'absolute', left: tokX - (k < 0.5 ? tokLen : -20), top: tokY + (k < 0.5 ? 50 : -110), fontFamily: HUD_FONT, fontWeight: 700, fontSize: 40, color: ORA, textShadow: '0 2px 8px #000'}}>TÓQUIO 1.360</div>
        <div style={{position: 'absolute', left: x0 + rioLen - 22, top: 1010, opacity: kf(frame, [20, 26], [0, 1]), fontFamily: HUD_FONT, fontWeight: 700, fontSize: 70, color: '#fff'}}>+</div>
      </GlobeFrame>
    </Cam2D>
  );
};

/** S28 — "dois mil e novecentos por hora": big red Δ arrow, impact zoom. */
export const S28Delta: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 8;
  const grow = kf(frame, [0, 6], [0.3, 1], easeOut);
  const count = Math.round(2900 * kf(frame, [2, 30], [0, 1], easeOut) / 10) * 10;
  return (
    <Cam2D d={d} zoom={[1.0, 1.1]} shakes={[{at: 4, dur: 16, amp: 30, seed: 9}]} punches={[{at: 4, amt: 0.1, dur: 12}]}>
      <GlobeFrame t={t}>
        <SpeedLines t={t} dir="radial" count={36} opacity={0.35} color="#ff9a8a" seed="a28" speed={1800} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(255,60,60,0.35) 0%, rgba(255,60,60,0) 55%)'}} />
        <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
          <FlatArrow x={100} y={1080} len={880 * grow} dir={1} color="#ff3b3b" th={90} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: HUD_FONT, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,0.7)'}}>
          <div style={{fontSize: 30, letterSpacing: 6, fontWeight: 700, opacity: 0.9}}>DIFERENÇA</div>
          <div style={{fontSize: 150, fontWeight: 700, lineHeight: 1}}>
            <span style={{color: '#ff4b4b'}}>Δ</span> {count.toLocaleString('pt-BR')}
            <span style={{fontSize: 48, fontWeight: 400}}> km/h</span>
          </div>
        </div>
      </GlobeFrame>
    </Cam2D>
  );
};

/** S31 — "não.": body ✓ green / can ✗ red. */
export const S31Verdict: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 33;
  const a = kf(frame, [0, 5], [0, 1], easeOut);
  const b = kf(frame, [7, 11], [2.2, 1], easeIn);
  const bo = kf(frame, [7, 9], [0, 1]);
  const card = (x: number, color: string, children: React.ReactNode, label: string, mark: string, s: number, o: number) => (
    <div style={{position: 'absolute', left: x, top: 640, width: 400, height: 640, borderRadius: 36, background: 'rgba(12,18,40,0.82)', border: `5px solid ${color}`, boxShadow: `0 0 40px ${color}66`}}>
      <svg width={400} height={420} style={{position: 'absolute', top: 30}}>
        {children}
      </svg>
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 56, letterSpacing: 4, color: '#fff'}}>{label}</div>
      <div style={{position: 'absolute', right: -30, top: -50, width: 140, height: 140, borderRadius: 70, background: color, color: '#fff', fontSize: 100, fontWeight: 700, textAlign: 'center', lineHeight: '140px', fontFamily: HUD_FONT, transform: `scale(${s}) rotate(${(1 - Math.min(1, s)) * 20}deg)`, opacity: o, boxShadow: '0 8px 20px rgba(0,0,0,0.5)'}}>
        {mark}
      </div>
    </div>
  );
  return (
    <Cam2D d={d} zoom={[1.0, 1.08]} shakes={[{at: 8, dur: 12, amp: 22}]} punches={[{at: 8, amt: 0.06}]} whip="up">
      <GlobeFrame t={t}>
        {card(
          90,
          '#3ddc6e',
          <g transform="translate(200,230) scale(1.25)">
            <rect x={-60} y={100} width={120} height={60} rx={20} fill={DAVI_OUTFIT.top.base} />
            <Head skin={DAVI_OUTFIT.skin} style={DAVI_OUTFIT.head} expr={{halfSmile: 0.6}} light={SUNSET_LIGHT} />
          </g>,
          'CORPO',
          '✓',
          a,
          a,
        )}
        {card(
          590,
          '#ff3b3b',
          <g transform="translate(200,210) rotate(-12) scale(1.35)">
            <RedCan />
          </g>,
          'LATA',
          '✗',
          b,
          bo,
        )}
      </GlobeFrame>
    </Cam2D>
  );
};
