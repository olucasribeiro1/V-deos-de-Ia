import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Copacabana} from '../../environments/Copacabana';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {PlacedPuppet, Puppet, PuppetSvg} from '../../characters/Puppet';
import {Head} from '../../characters/parts';
import {Cam, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp, wobble} from '../../lib/anim';
import {LightRays, Particles} from '../../fx/Particles';
import {Flash, Rastro} from '../../fx/Rastro';
import {Shockwave} from '../../fx/Shockwave';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Cam2D} from '../../ep01/partA/kit';
import {Arrive, Breath, Clock, Layer, O2, SNOW_LIGHT, ShotProps, Sky, Snow, pct, wl} from './kit';
import {Flags, HIMALAYA_FAR, HIMALAYA_MID, Range, SnowGround} from './sets';

const ROOM_LIGHT = {side: 1 as const, rim: '#8fd0ff', rimStrength: 0.75, shadeStrength: 0.7};
const HUG = {shL: 28, elL: 105, shR: -28, elR: -105};

/** Snow caps on Davi's hair and shoulders (puppet units). */
const Frost: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <g opacity={k}>
      <path d="M-110,-1000 Q-60,-1050 0,-1040 Q70,-1050 120,-990 Q60,-1010 0,-1005 Q-60,-1012 -110,-1000 Z" fill="#fff" />
      <ellipse cx={-120} cy={-760} rx={50} ry={14} fill="#fff" />
      <ellipse cx={125} cy={-758} rx={46} ry={13} fill="#fff" />
      <ellipse cx={-60} cy={-1015} rx={28} ry={12} fill="#eaf6ff" />
    </g>
  );

/* ================================================================== L4 */

/** 14 — "o corpo não pula de fuso": groggy Davi, three city clocks spinning above him. */
export const A14Clocks: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const sway = wobble(t * 1.2, 2) * 3;
  const cities: [string, number, number][] = [
    ['PARIS', 8, 0.9],
    ['TÓQUIO', 15, 1.3],
    ['NOVA YORK', 2, 1.7],
  ];
  return (
    <Cam2D d={d} zoom={[1.0, 1.08]} whip="down" roll={[-2, 1]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a3f78 0%, #151834 75%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 13}).map((_, i) => (
          <line key={i} x1={i * 90} y1={0} x2={i * 90 - 200} y2={H} stroke="#5a62a8" strokeWidth={2} opacity={0.25} />
        ))}
        {cities.map(([name, h0, sp], i) => (
          <g key={name} transform={`translate(0,${Math.sin(t * 3 + i) * 8})`}>
            <Clock x={200 + i * 340} y={660} r={118} h={h0 + fr * 0.11 * sp} label={name} glow={0.6} />
          </g>
        ))}
      </svg>
      <PlacedPuppet
        outfit={DAVI_OUTFIT}
        light={ROOM_LIGHT}
        x={540}
        y={1080 + 884 * 1.25}
        height={1250}
        upperOnly
        pose={{lean: sway, headTilt: 6 + sway, shL: -6, shR: 6, facing: -0.05}}
        expr={{blink: 0.55 + 0.25 * Math.abs(Math.sin(t * 2)), browTilt: 0.5, mouthOpen: 0.08, lookY: 0.5}}
      />
      <Particles t={t} seed="eb14" count={14} bokeh={5} color="190,200,255" bokehColor="140,150,255" driftX={-10} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** 15 — "Três dias": hotel room, Davi yawns, wall calendar flips 1 → 2 → 3. */
export const A15Yawn: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const T = wl(start, 'L4', 8);
  const day = fr < T ? 1 : fr < T + 6 ? 2 : 3;
  const flip = fr >= T ? clamp(((fr - T) % 6) / 4) : 1;
  const yawn = kf(fr, [6, 16, 30, 40], [0, 1, 1, 0.2]);
  const h = 1800;
  return (
    <Cam2D d={d} zoom={[1.0, 1.1]} pan={[20, 0, -10, -20]} whip="right" origin={[420, 1000]}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #2a2440 0%, #1b1830 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* window with dawn light */}
        <rect x={60} y={420} width={330} height={500} fill="#ffb27a" opacity={0.85} />
        <rect x={60} y={420} width={330} height={500} fill="none" stroke="#120f20" strokeWidth={14} />
        <rect x={218} y={420} width={14} height={500} fill="#120f20" />
        {/* calendar */}
        <g transform="translate(700,560)">
          <rect x={0} y={0} width={280} height={320} rx={18} fill="#f4f1ea" />
          <rect x={0} y={0} width={280} height={74} rx={18} fill="#e23b3b" />
          <rect x={0} y={50} width={280} height={24} fill="#e23b3b" />
          <circle cx={70} cy={0} r={12} fill="#555" />
          <circle cx={210} cy={0} r={12} fill="#555" />
          <text x={140} y={52} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={36} letterSpacing={4} fill="#fff">
            DIA
          </text>
          <g transform={`translate(140,200) scale(1,${flip})`}>
            <text y={70} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={200} fill="#1d2440">
              {day}
            </text>
          </g>
          {flip < 1 && <rect x={0} y={74} width={280} height={246 * (1 - flip)} fill="#e6e1d6" opacity={0.9} />}
        </g>
      </svg>
      <PlacedPuppet
        outfit={DAVI_OUTFIT}
        light={{side: -1, rim: '#ffb27a', rimStrength: 0.8, shadeStrength: 0.7}}
        x={400}
        y={1060 + 884 * (h / 1000)}
        height={h}
        upperOnly
        pose={{headTilt: -6 + yawn * -4, shL: -10 - yawn * 30, elL: yawn * -40, facing: 0.15}}
        expr={{mouthOpen: yawn, blink: 0.4 + yawn * 0.6, browTilt: 0.6, browRaise: yawn * 0.4}}
      />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** 16 — "quatro nasceres do sol": time-lapse, the sun rises four times, counter 1→4. */
export const A16Sunrises: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const per = d / 4;
  const n = Math.min(4, Math.floor(fr / per) + 1);
  const ph = (fr % per) / per;
  const hz = 1180;
  const sunY = lerp(hz + 120, hz - 420, easeOut(ph));
  const night = 1 - clamp(ph * 1.6);
  const top = `rgb(${lerp(20, 70, 1 - night)},${lerp(24, 130, 1 - night)},${lerp(60, 210, 1 - night)})`;
  const mid = `rgb(${lerp(40, 255, 1 - night)},${lerp(30, 170, 1 - night)},${lerp(80, 120, 1 - night)})`;
  const cut = fr % per < 2 && fr > 2;
  return (
    <Cam2D d={d} zoom={[1.0, 1.1]} roll={[1, -1]} ease={(x) => x}>
      <Sky stops={[top, mid, '#ffd59a']} h={hz} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <circle cx={540} cy={sunY} r={300} fill="#ffd27a" opacity={0.25 * (1 - night)} />
        <circle cx={540} cy={sunY} r={110} fill="#fff1b8" />
        <rect y={hz} width={W} height={H - hz} fill="#20385e" />
        <rect y={hz} width={W} height={H - hz} fill="#ffb26a" opacity={0.35 * (1 - night)} />
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={540 - 60 - i * 14} y={hz + 20 + i * 26} width={120 + i * 28} height={8} fill="#ffe2a0" opacity={0.6 * (1 - night)} />
        ))}
        {/* dock */}
        <rect x={0} y={1440} width={W} height={60} fill="#1a1210" />
        {[80, 400, 720, 1000].map((x) => (
          <rect key={x} x={x} y={1500} width={30} height={420} fill="#140e0c" />
        ))}
      </svg>
      {/* Davi sitting silhouette on the dock edge */}
      <AbsoluteFill style={{filter: 'brightness(0.12) saturate(0)'}}>
        <PlacedPuppet outfit={DAVI_OUTFIT} x={760} y={1460 + 226 * 0.55} height={550} pose={{hipL: -88, knL: 88, hipR: -84, knR: 84, shL: 20, elL: -10, shR: -10, headTilt: 8 + Math.sin(t * 2) * 2}} />
      </AbsoluteFill>
      {cut && <Flash k={0.5} color="255,230,200" />}
      <HudLabel label="NASCER DO SOL" value={`${n}×`} countUp={false} x={90} y={540} tx={540} ty={sunY} from={2} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/** Purple eye bags under both eyes (head units). */
const EyeBags: React.FC<{k: number}> = ({k}) => (
  <g opacity={0.25 + 0.75 * k}>
    {[-1, 1].map((s) => (
      <g key={s}>
        <path d={`M${s * 41 - 20},${14} Q${s * 41},${28 + k * 14} ${s * 41 + 20},${14}`} stroke="#5a3a5e" strokeWidth={4 + k * 6} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={`M${s * 41 - 16},${28 + k * 6} Q${s * 41},${36 + k * 16} ${s * 41 + 16},${28 + k * 6}`} stroke="#6b4a6e" strokeWidth={2 + k * 4} fill="none" strokeLinecap="round" opacity={k * 0.8} />
      </g>
    ))}
  </g>
);

/** 17 — "duas horas de sono": extreme close, eye bags growing, SONO 2 h. */
export const A17EyeBags: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const k = kf(fr, [0, d - 6], [0.1, 1], easeOut);
  const cx = 540;
  const cy = 1150;
  const sc = 3.1;
  const droop = 0.3 + k * 0.35 + (fr > d - 12 ? kf(fr, [d - 12, d - 4], [0, 0.4]) : 0);
  return (
    <Cam2D d={d} zoom={[1.0, 1.14]} roll={[-2, 3]} origin={[540, 1150]} ease={(x) => x}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #4a4868 0%, #1a1a2c 80%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <path d={`M${cx - 500},${H} Q${cx - 460},${cy + 420} ${cx - 160},${cy + 330} L${cx + 160},${cy + 330} Q${cx + 460},${cy + 420} ${cx + 500},${H} Z`} fill={DAVI_OUTFIT.top.base} />
        <path d={`M${cx - 160},${cy + 330} Q${cx},${cy + 440} ${cx + 160},${cy + 330}`} stroke={DAVI_OUTFIT.top.shade} strokeWidth={30} fill="none" />
        <g transform={`translate(${cx},${cy}) scale(${sc}) rotate(${wobble(t, 1) * 2})`}>
          <Head skin={DAVI_OUTFIT.skin} style={DAVI_OUTFIT.head} expr={{blink: droop, browTilt: 0.7, mouthOpen: 0.05, smile: -0.2}} light={ROOM_LIGHT} />
          <EyeBags k={k} />
        </g>
      </svg>
      <HudLabel label="SONO" value={2} unit="h" x={90} y={500} tx={cx - 41 * sc} ty={cy + 30 * sc} from={4} />
      <Finish vignette={0.65} />
    </Cam2D>
  );
};

/* ================================================================== L5 */

const MountainSky: React.FC = () => <Sky stops={['#0f4fa8', '#3c8ee0', '#a9d6ff', '#eaf6ff']} h={1300} />;

/** 18 — "nem todo lugar bonito": Himalaya postcard, prayer flags, glare. */
export const A18Vista: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], (x) => x);
  return (
    <Cam2D d={d} zoom={[1.08, 1.0]} pan={[-30, 0, 30, 0]} whip="up">
      <MountainSky />
      <Layer dx={p * 10}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <Range y={1200} peaks={HIMALAYA_FAR} rock="#8ea6c8" snow="#f4f9ff" shade="#6a7fa6" snowLine={0.55} haze={0.25} />
        </svg>
      </Layer>
      <Layer dx={p * 30}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <Range y={1380} peaks={HIMALAYA_MID} rock="#5c6f8e" snow="#ffffff" shade="#3b4a68" snowLine={0.4} />
        </svg>
      </Layer>
      <Layer dx={p * 60}>
        <SnowGround y={1450} />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <rect x={60} y={980} width={14} height={520} fill="#4a3a2a" />
          <rect x={1000} y={1060} width={14} height={440} fill="#4a3a2a" />
          <Flags x1={67} y1={990} x2={1007} y2={1070} t={t} sag={60} />
        </svg>
      </Layer>
      <LightRays x={880} y={260} t={t} opacity={0.3} color="255,255,240" />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <circle cx={880} cy={260} r={60} fill="#fffef0" />
        <circle cx={880} cy={260} r={160} fill="#fffef0" opacity={0.25} />
      </svg>
      <Snow t={t} count={30} wind={120} seed="eb18" size={0.6} opacity={0.6} />
      <Finish vignette={0.35} />
    </Cam2D>
  );
};

/** Davi on the snowy ridge (hugging himself, shivering). */
const ColdDavi: React.FC<{x: number; y: number; h: number; fr: number; frost: number; pant?: number; at?: number}> = ({x, y, h, fr, frost, pant = 0, at = 0}) => {
  const shiver = fr >= at ? Math.sin(fr * 2.7) * 4 : 0;
  const breathe = Math.sin(fr * 0.6);
  return (
    <PlacedPuppet
      outfit={DAVI_OUTFIT}
      light={SNOW_LIGHT}
      x={x + shiver}
      y={y}
      height={h}
      pose={{...HUG, headTilt: -3 + breathe * 2, bob: breathe * 6 * pant, facing: 0.05}}
      expr={{eyesWide: 0.35, browTilt: 0.8, browRaise: 0.4, mouthOpen: pant ? 0.3 + 0.25 * (0.5 + 0.5 * breathe) : 0.15}}
    >
      <Frost k={frost} />
    </PlacedPuppet>
  );
};

/** 19 — "é bom de chegar": Davi pops in on the ridge, snow burst. */
export const A19SnowArrive: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const fx = 540;
  const fy = 1640;
  return (
    <Cam2D d={d} zoom={[1.0, 1.08]} shakes={[{at: 0, dur: 14, amp: 22}]} punches={[{at: 0, amt: 0.06}]}>
      <MountainSky />
      <AbsoluteFill style={{filter: 'blur(3px)'}}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <Range y={1250} peaks={HIMALAYA_FAR} rock="#8ea6c8" snow="#f4f9ff" shade="#6a7fa6" snowLine={0.55} haze={0.25} />
        </svg>
      </AbsoluteFill>
      <SnowGround y={1500} tilt={30} />
      <ColdDavi x={fx} y={fy} h={1080} fr={fr} frost={kf(fr, [6, 30], [0, 0.8])} at={4} />
      <Shockwave cx={fx} cy={fy - 400} age={fr} rings={3} speed={44} maxR={1300} />
      {/* snow kicked up */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 40}).map((_, i) => {
          const a = Math.PI + random(`sb-${i}`) * Math.PI;
          const sp = 18 + random(`sbs-${i}`) * 26;
          const age = fr;
          const x = fx + Math.cos(a) * sp * age;
          const y = fy - 20 + Math.sin(a) * sp * age * 0.6 + 0.9 * age * age;
          return <circle key={i} cx={x} cy={y} r={6 + random(`sbr-${i}`) * 12} fill="#fff" opacity={clamp(1 - age / 26)} />;
        })}
      </svg>
      <Arrive x={fx} y={fy} h={1150} seed="eb19" len={20} />
      <Snow t={t} count={60} wind={500} seed="eb19s" />
      <Finish vignette={0.45} tint="rgba(120,170,255,0.25)" />
    </Cam2D>
  );
};

/** 20 — "Himalaia, cinco mil metros": tiny Davi on a vast ridge, ALTITUDE 5.000 m. */
export const A20Altitude: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], (x) => x);
  return (
    <Cam2D d={d} zoom={[1.0, 1.12]} origin={[620, 1180]} whip="left" ease={(x) => x}>
      <MountainSky />
      <Layer dx={-p * 15}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <Range y={1150} peaks={[{x: 300, h: 900, w: 420}, {x: 820, h: 1050, w: 460}]} rock="#7f97ba" snow="#f6faff" shade="#5c6f96" snowLine={0.5} haze={0.2} />
        </svg>
      </Layer>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <path d="M-50,1360 L300,1230 L620,1200 L900,1260 L1130,1380 L1130,1920 L-50,1920 Z" fill="#f2f7fd" />
        <path d="M620,1200 L900,1260 L1130,1380 L1130,1920 L700,1920 Z" fill="#c9d9ec" />
      </svg>
      <ColdDavi x={620} y={1210} h={130} fr={fr} frost={1} at={0} />
      <Snow t={t} count={70} wind={700} seed="eb20" size={0.8} />
      <HudLabel label="ALTITUDE" value={5000} unit="m" x={90} y={540} tx={620} ty={1080} from={4} />
      <Finish vignette={0.45} />
    </Cam2D>
  );
};

/** 21 — "mil metros. Metade do": close, panting, breath vapour, frost. */
export const A21Panting: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const h = 1750;
  const headY = 900;
  const yFeet = headY + 884 * (h / 1000);
  return (
    <Cam2D d={d} zoom={[1.0, 1.1]} roll={[2, -1]} whip="right" shakes={[{at: 0, dur: d, amp: 5}]}>
      <MountainSky />
      <AbsoluteFill style={{filter: 'blur(9px)'}}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <Range y={1350} peaks={HIMALAYA_FAR} rock="#8ea6c8" snow="#f4f9ff" shade="#6a7fa6" snowLine={0.55} />
        </svg>
        <SnowGround y={1400} />
      </AbsoluteFill>
      <PlacedPuppet
        outfit={DAVI_OUTFIT}
        light={SNOW_LIGHT}
        x={520 + Math.sin(fr * 2.6) * 3}
        y={yFeet + Math.sin(t * 9) * 10}
        height={h}
        upperOnly
        pose={{...HUG, headTilt: 4 + Math.sin(t * 9) * 2, facing: 0.2}}
        expr={{mouthOpen: 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 9)), browTilt: 0.9, browRaise: 0.5, eyesWide: 0.2, blink: 0.25}}
      >
        <Frost k={1} />
      </PlacedPuppet>
      <Breath x={560} y={headY + 115} t={t} rate={1.45} scale={1.4} />
      <Snow t={t} count={60} wind={600} seed="eb21" size={1.3} />
      <Finish vignette={0.5} tint="rgba(120,170,255,0.25)" />
    </Cam2D>
  );
};

/** 22 — "oxigênio": Davi's outline, half the O₂ molecules vanish, O₂ 100 → 50 %. */
export const A22Oxygen: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const k = kf(fr, [4, 18], [0, 1]);
  const val = Math.round(lerp(100, 50, k));
  const hpx = 1000;
  const sx = 540;
  const sy = 1380;
  return (
    <Cam2D d={d} zoom={[1.06, 1.0]} whip="zoom">
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #18325c 0%, #070f22 80%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.25}}>
        <Range y={1500} peaks={HIMALAYA_FAR} rock="#2a4470" snow="#5a7cb0" shade="#1b2e52" snowLine={0.5} />
      </svg>
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>
        <PuppetSvg height={hpx} outfit={DAVI_OUTFIT} pose={{...HUG}} ghost={{opacity: 0.9, color: '#8fd3ff', dash: 18}} style={{left: sx - 350 * (hpx / 1000), top: sy - 1100 * (hpx / 1000)}} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 44}).map((_, i) => {
          const a = random(`ox-a-${i}`) * Math.PI * 2;
          const rr = 120 + random(`ox-r-${i}`) * 360;
          const x = sx + Math.cos(a) * rr * 1.05 + Math.sin(t * 2 + i) * 10;
          const y = 900 + Math.sin(a) * rr * 0.95 + Math.cos(t * 2.3 + i) * 10;
          const dies = i % 2 === 1;
          const o = dies ? clamp(1 - (k * 1.6 - random(`ox-d-${i}`) * 0.6)) : 1;
          return <O2 key={i} x={x} y={y} r={16} o={o} a={random(`ox-rot-${i}`) * 180 + t * 40} />;
        })}
      </svg>
      <HudLabel label="O₂ POR RESPIRAÇÃO" value={`${val}`} unit="%" countUp={false} x={90} y={520} tx={sx} ty={sy - 620} from={0} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/* ================================================================== L6 */

/** 23 — "O ouvido estalou": X-ray ear, eardrum bulging, then POP. PRESSÃO 0,5 atm. */
export const A23EarXray: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const P = wl(start, 'L6', 2) + 2;
  const bulge = fr < P ? kf(fr, [0, P], [10, 95], easeIn) : kf(fr, [P, P + 4], [95, -20], easeOut) + Math.sin((fr - P) * 1.4) * 12 * Math.exp(-(fr - P) * 0.25);
  const cx = 600;
  const cy = 980;
  const glow = 'drop-shadow(0 0 8px rgba(120,220,255,0.8))';
  return (
    <Cam2D d={d} zoom={[1.0, 1.08]} origin={[cx, cy]} whip="zoom" shakes={[{at: P, dur: 14, amp: 24}]} punches={[{at: P, amt: 0.12}]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 55% 50%, #0d2f4a 0%, #020a14 75%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', filter: glow}}>
        {/* skull / head outline */}
        <path d="M1150,380 Q700,300 520,560 Q420,700 450,820 L300,840 Q250,900 300,980 L420,1000 Q430,1200 600,1380 Q800,1560 1150,1500" stroke="#7fd8ff" strokeWidth={6} fill="none" opacity={0.55} />
        {/* outer ear (pinna) */}
        <path d="M330,700 Q200,760 210,960 Q220,1150 360,1200 Q420,1210 430,1150" stroke="#bff0ff" strokeWidth={8} fill="#7fd8ff" fillOpacity={0.08} />
        {/* ear canal */}
        <path d={`M300,930 L${cx - 10},945 M300,1030 L${cx - 10},1015`} stroke="#bff0ff" strokeWidth={7} fill="none" />
        <rect x={300} y={935} width={cx - 310} height={80} fill="#7fd8ff" opacity={0.08} />
        {/* eardrum */}
        <path d={`M${cx},${cy - 70} Q${cx - bulge},${cy} ${cx},${cy + 70}`} stroke="#ffffff" strokeWidth={10} fill="#ff9a8a" fillOpacity={0.25} />
        {/* ossicles */}
        <path d={`M${cx + 10},${cy} q40,-40 80,-50 q30,-6 40,20 q10,30 -20,40`} stroke="#bff0ff" strokeWidth={10} fill="none" opacity={0.85} />
        <circle cx={cx + 140} cy={cy - 10} r={18} fill="none" stroke="#bff0ff" strokeWidth={8} />
        {/* cochlea */}
        <path d={`M${cx + 220},${cy} m0,0 a60,60 0 1 1 60,60 a40,40 0 1 1 -40,-40 a22,22 0 1 1 22,22`} stroke="#bff0ff" strokeWidth={9} fill="none" opacity={0.85} />
        {/* pressure arrows pushing the drum outward (before the pop) */}
        {fr < P &&
          [-40, 0, 40].map((dy, i) => {
            const x0 = cx + 120 - ((fr * 6 + i * 20) % 60);
            return <path key={i} d={`M${x0},${cy + dy} L${x0 - 70},${cy + dy} M${x0 - 52},${cy + dy - 16} L${x0 - 72},${cy + dy} L${x0 - 52},${cy + dy + 16}`} stroke="#ffd23f" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />;
          })}
      </svg>
      {fr >= P && <Shockwave cx={cx} cy={cy} age={fr - P} rings={3} speed={40} maxR={900} color="190,240,255" />}
      <Flash k={kf(fr, [P, P + 1, P + 5], [0, 0.8, 0], (x) => x)} color="200,240,255" />
      <HudLabel label="PRESSÃO" value="0,5" unit="atm" countUp={false} x={90} y={520} tx={cx - 30} ty={cy - 80} from={2} />
      <Finish vignette={0.6} grain={0.14} />
    </Cam2D>
  );
};

/** 24 — "igual descida de avião": airplane window, clouds rushing up (descent). */
export const A24Plane: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  return (
    <Cam2D d={d} zoom={[1.0, 1.12]} roll={[4, -2]} whip="down" origin={[540, 960]}>
      <AbsoluteFill style={{background: '#d9dde4'}} />
      <AbsoluteFill style={{clipPath: 'ellipse(300px 420px at 540px 960px)'}}>
        <Sky stops={['#5fa8ea', '#a8d4fa', '#eaf4ff']} />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 14}).map((_, i) => {
            const y = ((random(`pc-${i}`) * 1400 - t * 900 * (0.6 + random(`pcs-${i}`))) % 1400 + 1400) % 1400 + 300;
            return <ellipse key={i} cx={200 + random(`pcx-${i}`) * 700} cy={y} rx={180 + random(`pcr-${i}`) * 120} ry={60} fill="#fff" opacity={0.85} />;
          })}
          {/* wing */}
          <path d="M240,1260 L900,1120 L920,1150 L260,1340 Z" fill="#c9ced8" />
          <path d="M240,1260 L900,1120 L905,1130 L250,1275 Z" fill="#eef1f6" />
          <rect x={860} y={1080} width={18} height={60} fill="#e23b3b" />
        </svg>
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <ellipse cx={540} cy={960} rx={300} ry={420} fill="none" stroke="#b8bec9" strokeWidth={40} />
        <ellipse cx={540} cy={960} rx={330} ry={450} fill="none" stroke="#eceff4" strokeWidth={24} />
        <path d="M300,700 Q380,620 470,600" stroke="#fff" strokeWidth={12} fill="none" opacity={0.5} strokeLinecap="round" />
      </svg>
      <Finish vignette={0.4} />
    </Cam2D>
  );
};

/** 25 — "Só que em zero segundos": pressure-vs-time chart; plane = slow ramp, Davi = vertical cliff. */
export const A25Graph: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const Z = wl(start, 'L6', 10);
  const plane = kf(fr, [0, Z], [0, 1], (x) => x);
  const davi = kf(fr, [Z, Z + 3], [0, 1], easeIn);
  const x0 = 170;
  const x1 = 940;
  const yHi = 700;
  const yLo = 1160;
  const curve = (u: number) => `M${x0},${yLo} C${lerp(x0, x1, 0.4)},${yLo} ${lerp(x0, x1, 0.6)},${yHi} ${x1},${yHi}`;
  return (
    <Cam2D d={d} zoom={[1.02, 1.08]} whip="left" punches={[{at: Z + 2, amt: 0.08}]} shakes={[{at: Z + 2, dur: 10, amp: 14}]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #1d2b52 0%, #0a1024 80%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 6}).map((_, i) => (
          <line key={i} x1={x0} x2={x1} y1={yHi + (i * (yLo - yHi)) / 5} y2={yHi + (i * (yLo - yHi)) / 5} stroke="#fff" strokeWidth={1.5} opacity={0.12} />
        ))}
        <path d={`M${x0},${yHi - 80} L${x0},${yLo} L${x1 + 40},${yLo}`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.85} />
        <text x={x0 + 14} y={yHi - 60} fontFamily={HUD_FONT} fontWeight={700} fontSize={30} letterSpacing={3} fill="#fff" opacity={0.85}>
          ALTITUDE
        </text>
        <text x={x1 + 30} y={yLo + 50} textAnchor="end" fontFamily={HUD_FONT} fontWeight={700} fontSize={30} letterSpacing={3} fill="#fff" opacity={0.85}>
          TEMPO
        </text>
        {/* plane: slow ramp */}
        <path d={curve(1)} stroke="#6fc8ff" strokeWidth={12} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${plane} 1`} />
        <g opacity={kf(fr, [6, 12], [0, 1])}>
          <text x={x1 - 10} y={yHi + 60} textAnchor="end" fontFamily={HUD_FONT} fontWeight={700} fontSize={44} fill="#6fc8ff">
            AVIÃO · 20 min
          </text>
        </g>
        {/* Davi: vertical */}
        {davi > 0 && (
          <g style={{filter: 'drop-shadow(0 0 12px rgba(255,200,60,0.9))'}}>
            <line x1={x0} y1={yLo} x2={x0} y2={lerp(yLo, yHi, davi)} stroke="#ffd23f" strokeWidth={16} strokeLinecap="round" />
            <line x1={x0} y1={yHi} x2={lerp(x0, x0 + 200, davi)} y2={yHi} stroke="#ffd23f" strokeWidth={16} strokeLinecap="round" />
            <text x={x0 + 30} y={yHi - 30} fontFamily={HUD_FONT} fontWeight={700} fontSize={64} fill="#ffd23f" opacity={davi}>
              DAVI · 0 s
            </text>
          </g>
        )}
      </svg>
      <Flash k={kf(fr, [Z + 2, Z + 3, Z + 7], [0, 0.4, 0], (x) => x)} color="255,230,150" />
      <Finish vignette={0.5} />
    </Cam2D>
  );
};

/** 26 — "Ele voltou em dez": back at Copacabana, frosted and shivering. 10 s. */
export const A26Back: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30 + 5;
  const p = pct(fr, d);
  const SPOT = {x: 0.35, z: 9};
  const cam: Cam = {x: SPOT.x - 0.3 + p * 0.15, y: 1.15, z: SPOT.z - 3.6 + p * 0.5, pitch: -2, f: 1650, cy: H * 0.5};
  const foot = project(cam, SPOT.x, 0, SPOT.z)!;
  const hpx = foot.ppm * 1.75;
  const melt = kf(fr, [0, d], [1, 0.6]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.08]} shakes={[{at: 0, dur: 12, amp: 20}]} punches={[{at: 0, amt: 0.05}]}>
      <Copacabana
        cam={cam}
        t={t}
        focus={foot.depth}
        aperture={11}
        actors={[
          {
            key: 'davi',
            x: SPOT.x,
            z: SPOT.z,
            shadow: 1,
            render: ({sx, sy, ppm}) => <ColdDavi x={sx} y={sy} h={ppm * 1.75} fr={fr} frost={melt} at={0} />,
          },
        ]}
      />
      {/* snowflakes falling off him */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 24}).map((_, i) => {
          const x = foot.sx + (random(`ff-${i}`) - 0.5) * hpx * 0.4;
          const y0 = foot.sy - hpx * (0.3 + random(`ffy-${i}`) * 0.65);
          const y = y0 + ((fr * (6 + random(`ffs-${i}`) * 8)) % (hpx * 0.6));
          return <circle key={i} cx={x + Math.sin(fr * 0.3 + i) * 10} cy={y} r={4 + random(`ffr-${i}`) * 5} fill="#fff" opacity={0.85} />;
        })}
      </svg>
      <Breath x={foot.sx + hpx * 0.04} y={foot.sy - hpx * 0.82} t={t} scale={0.9} rate={1.8} />
      <Arrive x={foot.sx} y={foot.sy} h={hpx * 1.05} seed="eb26" len={20} />
      <HudLabel label="TEMPO NO HIMALAIA" value={10} unit="s" x={90} y={540} tx={foot.sx - 40} ty={foot.sy - hpx * 0.95} from={2} />
      <Particles t={t} seed="eb26p" count={20} bokeh={6} driftX={-10} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};
