import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {PlacedPuppet, Puppet} from '../../characters/Puppet';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {Head} from '../../characters/parts';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, wobble} from '../../lib/anim';
import {Copacabana} from '../../environments/Copacabana';
import {Particles} from '../../fx/Particles';
import {Flash, Rastro} from '../../fx/Rastro';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {useUid} from '../../lib/useUid';
import {Cam2D, CutFlash, DUSK_LIGHT, MemoryGrade, ROOM_LIGHT, RedCan, ShotProps, SpeedLines, atS} from './kit';
import {TokyoStreet} from './shotsTokyo';

const KID = DAVI_OUTFIT;

/** Dusk sky + river + far city, shared by the bridge shots. */
const DuskSky: React.FC<{horizon: number; t: number}> = ({horizon, t}) => {
  const id = useUid('dusk');
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2d3566" />
          <stop offset="0.6" stopColor="#c0708a" />
          <stop offset="1" stopColor="#ffb27a" />
        </linearGradient>
        <linearGradient id={id + 'w'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6d6f98" />
          <stop offset="1" stopColor="#1d2c4a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={horizon} fill={`url(#${id})`} />
      {/* far city */}
      {Array.from({length: 18}).map((_, i) => {
        const h = 40 + random(`dc-${i}`) * 120;
        return <rect key={i} x={i * 64 - 20} y={horizon - h} width={58} height={h} fill="#4a3f63" opacity={0.85} />;
      })}
      <path d={`M0,${horizon} Q200,${horizon - 160} 380,${horizon - 60} Q520,${horizon - 30} 640,${horizon} Z`} fill="#3d3456" />
      <rect x={0} y={horizon} width={W} height={H - horizon} fill={`url(#${id + 'w'})`} />
      {Array.from({length: 16}).map((_, i) => {
        const y = horizon + 20 + i * i * 4.5;
        return <rect key={i} x={((i * 137 + t * 40) % (W + 200)) - 200} y={y} width={120 + i * 14} height={2 + i * 0.5} fill="#ffd2a6" opacity={0.25} />;
      })}
    </svg>
  );
};

/** S7 — flashback: kid (15) on the bridge railing, slips. */
export const S07Bridge: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const slip = kf(frame, [d - 14, d], [0, 1], easeIn);
  const flail = Math.sin(t * 16);
  const horizon = 760;
  const deckY = 1040;
  const kidX = 560;
  return (
    <Cam2D d={d} zoom={[1.0, 1.18]} pan={[0, -80, -40, 40]} origin={[kidX, deckY - 200]} roll={[-3, 2]}>
      <DuskSky horizon={horizon} t={t} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* bridge deck crossing the frame */}
        <path d={`M-100,${deckY} L1200,${deckY - 60} L1200,${deckY + 30} L-100,${deckY + 110} Z`} fill="#6b6575" />
        <path d={`M-100,${deckY + 110} L1200,${deckY + 30} L1200,${deckY + 70} L-100,${deckY + 160} Z`} fill="#3d3848" />
        {/* arches */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${-60 + i * 440},${deckY + 150 - i * 26} Q${160 + i * 440},${deckY + 520 - i * 26} ${380 + i * 440},${deckY + 120 - i * 26}`} stroke="#3d3848" strokeWidth={34} fill="none" />
        ))}
        {/* railing */}
        <path d={`M-100,${deckY - 130} L1200,${deckY - 190}`} stroke="#9b94a8" strokeWidth={12} />
        {Array.from({length: 16}).map((_, i) => {
          const x = -80 + i * 84;
          const y = deckY - (x + 100) * (60 / 1300);
          return <rect key={i} x={x} y={y - 130} width={9} height={130} fill="#8a8396" />;
        })}
      </svg>
      <PlacedPuppet
        outfit={KID}
        light={DUSK_LIGHT}
        x={kidX + slip * 120}
        y={deckY - 150 + slip * 140}
        height={330}
        pose={{
          lean: 6 + slip * 40,
          shL: -120 + flail * 30,
          elL: -20,
          shR: 120 - flail * 30,
          elR: 20,
          hipL: -8,
          hipR: 22 + slip * 30,
          knR: -20,
          headTilt: 6,
        }}
        expr={{eyesWide: 0.4 + slip * 0.6, mouthOpen: 0.3 + slip * 0.5, browTilt: 0.8, browRaise: 0.6}}
      />
      <Particles t={t} seed="a7" count={20} bokeh={5} driftX={-10} />
      <MemoryGrade frame={frame} />
      <CutFlash frames={6} />
      <Finish vignette={0.65} grain={0.18} />
    </Cam2D>
  );
};

/** River seen from above (top-down). */
const RiverTop: React.FC<{t: number; scale: number}> = ({t, scale}) => {
  const id = useUid('river');
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id={id} cx="0.5" cy="0.55" r="0.75">
            <stop offset="0" stopColor="#3f7d98" />
            <stop offset="1" stopColor="#163148" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#${id})`} />
        {Array.from({length: 40}).map((_, i) => {
          const x = random(`rv-x-${i}`) * W;
          const y = ((random(`rv-y-${i}`) * H + t * 60) % H);
          const w = 40 + random(`rv-w-${i}`) * 140;
          return <ellipse key={i} cx={x} cy={y} rx={w} ry={4 + random(`rv-h-${i}`) * 5} fill="#bfe3ef" opacity={0.18 + 0.15 * Math.sin(t * 4 + i)} />;
        })}
        {/* sunset glints */}
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={620 + Math.sin(i * 2.1) * 90} y={300 + i * 110} width={50 + (i % 3) * 30} height={5} fill="#ffd9a8" opacity={0.5} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** S8 — top-down: the kid falls away toward the river. HUD 15 anos. */
export const S08FallTop: React.FC<ShotProps> = ({start, d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const p = kf(frame, [0, d], [0, 1], (x) => x);
  const size = 900 * Math.pow(0.4, p * 1.4);
  const hud = atS(start, 8.38);
  return (
    <Cam2D d={d} zoom={[1.0, 1.12]} roll={[0, 8]} whip="down">
      <RiverTop t={t} scale={1 + p * 0.15} />
      {/* bridge edge at the top of the frame */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <path d={`M-50,0 L1130,0 L1130,${230 - p * 60} L-50,${290 - p * 60} Z`} fill="#6b6575" />
        <path d={`M-50,${290 - p * 60} L1130,${230 - p * 60} L1130,${270 - p * 60} L-50,${330 - p * 60} Z`} fill="#3a3545" />
        <ellipse cx={540 + p * 30} cy={1050 + p * 60} rx={size * 0.22} ry={size * 0.08} fill="#0b1a28" opacity={0.35 * p} />
      </svg>
      <PlacedPuppet
        outfit={KID}
        light={DUSK_LIGHT}
        x={540 + p * 30}
        y={960 + size * 0.55}
        height={size}
        pose={{shL: -150 + Math.sin(t * 14) * 15, elL: -10, shR: 150 - Math.sin(t * 14) * 15, elR: 10, hipL: -25, hipR: 25, knL: 20, knR: -20, headTilt: 0}}
        expr={{eyesWide: 1, mouthOpen: 0.8, browTilt: 1, browRaise: 1, lookY: -1}}
      />
      <SpeedLines t={t} dir="radial" count={30} opacity={0.35} seed="a8" />
      <MemoryGrade frame={frame} />
      <HudLabel label="DAVI" value={15} unit="ANOS" x={110} y={600} tx={470} ty={840} from={hud} />
      <Finish vignette={0.6} grain={0.18} />
    </Cam2D>
  );
};

/** S9 — side close: falling, face in panic, water rushing up. */
export const S09Fall: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const p = kf(frame, [0, d], [0, 1], (x) => x);
  const water = kf(frame, [d - 16, d], [H + 50, H * 0.72], easeIn);
  const scroll = (t * 2200) % 900;
  return (
    <Cam2D d={d} zoom={[1.08, 1.2]} roll={[4, -4]} shakes={[{at: 0, dur: d, amp: 8, seed: 5}]}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#3a3f70 0%,#b8738c 60%,#ffb27a 100%)'}} />
      {/* bridge pillar streaking upward */}
      <svg width={W} height={H} style={{position: 'absolute', filter: 'blur(6px)'}}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={760} y={i * 900 - scroll - 400} width={260} height={620} fill="#4c4658" opacity={0.9} />
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={60} y={((i * 640 - t * 1200) % 1920 + 1920) % 1920} width={90} height={300} fill="#5d5470" opacity={0.6} />
        ))}
      </svg>
      <SpeedLines t={t} dir="up" count={44} opacity={0.5} seed="a9" />
      <PlacedPuppet
        outfit={KID}
        light={DUSK_LIGHT}
        x={520}
        y={1720}
        height={1400}
        upperOnly
        pose={{shL: -160 + Math.sin(t * 18) * 14, elL: -15, shR: 160 - Math.sin(t * 18 + 1) * 14, elR: 15, headTilt: wobble(t * 4, 2) * 5}}
        expr={{eyesWide: 1, mouthOpen: 0.9, browTilt: 1, browRaise: 1, lookY: 1}}
      />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <rect x={0} y={water} width={W} height={H} fill="#1f4766" />
        <rect x={0} y={water} width={W} height={10} fill="#cfeaf5" opacity={0.7} />
      </svg>
      <MemoryGrade frame={frame} />
      <Finish vignette={0.6} grain={0.18} />
    </Cam2D>
  );
};

/** S10 — "Piscou": extreme close on the kid's eye, blue blink-flash. */
export const S10Blink: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blink = kf(frame, [5, 8, 13, 16], [0, 1, 1, 0], (x) => x);
  const blue = kf(frame, [7, 11, 18], [0, 1, 0]);
  const k = 7.5 + kf(frame, [0, d], [0, 1.6]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.06]} punches={[{at: 9, amt: 0.08}]} shakes={[{at: 0, dur: 8, amp: 10}]}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#4a4f86,#ffb27a)'}} />
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(${W / 2 + 41 * k},${H * 0.5 + 10 * k}) scale(${k})`}>
          <Head skin={KID.skin} style={KID.head} light={DUSK_LIGHT} expr={{blink, eyesWide: 1 - blink, browTilt: 1, browRaise: 1 - blink * 0.5}} />
        </g>
      </svg>
      {/* electric-blue rim while the eye is shut */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(140,220,255,${0.0}) 20%, rgba(40,140,255,${0.55 * blue}) 70%)`, mixBlendMode: 'screen'}} />
      <Rastro x={W / 2} y={H * 0.92} height={H * 0.85} life={kf(frame, [8, 26], [0.02, 0.99], (x) => x)} frame={frame} seed="a10" />
      <Flash k={kf(frame, [10, 12, 18], [0, 0.9, 0], (x) => x)} />
      <MemoryGrade frame={frame} />
      <Finish vignette={0.55} grain={0.18} />
    </Cam2D>
  );
};

/** Bedroom at night. `aged` = later (Davi 19). */
const Bedroom: React.FC<{t: number; aged?: boolean}> = ({t, aged}) => {
  const id = useUid('room');
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#25305a" />
          <stop offset="1" stopColor="#151b38" />
        </linearGradient>
        <linearGradient id={id + 'n'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0d1638" />
          <stop offset="1" stopColor="#3b3a6e" />
        </linearGradient>
        <radialGradient id={id + 'l'} cx="0.15" cy="0.62" r="0.5">
          <stop offset="0" stopColor="#ffcf8a" stopOpacity={0.45} />
          <stop offset="1" stopColor="#ffcf8a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
      {/* window with Rio at night */}
      <g transform="translate(600,330)">
        <rect x={-20} y={-20} width={420} height={560} fill="#0e1430" />
        <rect x={0} y={0} width={380} height={520} fill={`url(#${id + 'n'})`} />
        <path d="M0,330 Q90,180 170,250 Q230,150 300,120 L312,100 Q330,90 345,130 L380,190 L380,520 L0,520 Z" fill="#141a33" />
        {/* tiny statue on the peak */}
        <path d="M322,92 L322,70 M308,80 L336,80" stroke="#cfd8ff" strokeWidth={4} opacity={0.75} />
        {Array.from({length: 46}).map((_, i) => (
          <circle key={i} cx={random(`rw-${i}`) * 380} cy={360 + random(`rh-${i}`) * 150} r={2 + random(`rr-${i}`) * 2} fill="#ffd38a" opacity={0.5 + 0.4 * Math.sin(t * 3 + i)} />
        ))}
        <rect x={185} y={0} width={10} height={520} fill="#0e1430" />
        <rect x={0} y={255} width={380} height={10} fill="#0e1430" />
      </g>
      {/* poster */}
      <g transform={`translate(110,420) rotate(-4)`}>
        <rect width={250} height={330} fill={aged ? '#e2554a' : '#3d8bd1'} />
        <circle cx={125} cy={140} r={70} fill={aged ? '#ffd36b' : '#ffe08a'} opacity={0.9} />
        <rect x={30} y={250} width={190} height={22} fill="#fff" opacity={0.8} />
      </g>
      <rect width={W} height={H} fill={`url(#${id + 'l'})`} />
      {/* headboard */}
      <rect x={60} y={980} width={960} height={240} rx={30} fill="#3a2a2f" />
    </svg>
  );
};

const BedFront: React.FC = () => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <rect x={-40} y={1390} width={W + 80} height={560} rx={40} fill="#e7e3f0" />
    <path d="M-40,1420 Q300,1360 560,1430 Q820,1500 1120,1410 L1120,1960 L-40,1960 Z" fill="#4b6fb0" />
    <path d="M-40,1420 Q300,1360 560,1430 Q820,1500 1120,1410" stroke="#7f9fd8" strokeWidth={10} fill="none" />
    {Array.from({length: 6}).map((_, i) => (
      <path key={i} d={`M${80 + i * 170},1520 q 40,60 10,160`} stroke="#3a5a96" strokeWidth={8} fill="none" opacity={0.6} />
    ))}
  </svg>
);

/** S11 — "tava na cama": lands on the bed, startled, soaked. */
export const S11Bed: React.FC<ShotProps> = ({start, d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const land = atS(start, 11.15);
  const bounce = frame < land ? -60 * (1 - frame / Math.max(1, land)) : -Math.abs(Math.sin((frame - land) * 0.45)) * 40 * Math.exp(-(frame - land) * 0.15);
  return (
    <Cam2D d={d} zoom={[1.0, 1.1]} shakes={[{at: land, dur: 12, amp: 18}]} punches={[{at: land, amt: 0.05}]}>
      <Bedroom t={t} />
      <PlacedPuppet
        outfit={KID}
        light={ROOM_LIGHT}
        x={520}
        y={1640 + bounce}
        height={1080}
        upperOnly
        pose={{shL: -30, elL: 30, shR: 30, elR: -30, headTilt: kf(frame, [land, land + 10], [0, -4])}}
        expr={{eyesWide: 1, mouthOpen: kf(frame, [land, land + 6], [0.2, 0.6]), browTilt: 0.9, browRaise: 1, lookX: kf(frame, [land + 6, d], [0, -0.8])}}
      />
      {/* water drips */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 14}).map((_, i) => {
          const x = 330 + random(`dr-x-${i}`) * 400;
          const y0 = 620 + random(`dr-y-${i}`) * 400;
          const y = y0 + (((frame + random(`dr-p-${i}`) * 20) * 14) % 500);
          return <ellipse key={i} cx={x} cy={y} rx={6} ry={10} fill="#bfe8ff" opacity={0.75} />;
        })}
      </svg>
      <BedFront />
      <Rastro x={520} y={1640} height={1100} life={kf(frame, [0, 18], [0.12, 0.99], (x) => x)} frame={frame} seed="a11" />
      <Flash k={kf(frame, [0, 1, 5], [0, 0.6, 0], (x) => x)} />
      <MemoryGrade frame={frame} />
      <Finish vignette={0.6} grain={0.18} />
    </Cam2D>
  );
};

/** Phone held near the chest (local puppet units). */
const ChestPhone: React.FC = () => (
  <g transform="translate(0,-610) rotate(8)">
    <rect x={-46} y={-80} width={92} height={160} rx={14} fill="#121521" />
    <rect x={-40} y={-72} width={80} height={144} rx={9} fill="#8fd6ff" />
  </g>
);

/** S12 — "O segundo foi de propósito": Davi (19) in his room, phone glow, smirk. */
export const S12Purpose: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const smirk = kf(frame, [10, 24], [0, 1]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.16]} pan={[30, 0, -20, -40]} whip="right" origin={[540, 760]}>
      <Bedroom t={t} aged />
      <PlacedPuppet
        outfit={DAVI_OUTFIT}
        light={ROOM_LIGHT}
        x={540}
        y={1720}
        height={1250}
        upperOnly
        pose={{shL: -25, elL: 115, shR: 25, elR: -115, headTilt: 4 - smirk * 6, facing: 0.1}}
        expr={{lookY: kf(frame, [0, 16], [0.8, -0.2]), lookX: 0.1, halfSmile: smirk, smile: smirk * 0.25, browAsym: smirk * 0.6, browTilt: -0.2}}
        heldProp={<ChestPhone />}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, rgba(120,210,255,0.35) 0%, rgba(120,210,255,0) 40%)', mixBlendMode: 'screen'}} />
      <BedFront />
      <HudLabel label="SALTO" value="Nº 2" x={110} y={600} tx={380} ty={760} from={12} />
      <Particles t={t} seed="a12" count={16} bokeh={4} color="170,210,255" bokehColor="120,180,255" driftX={-10} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** S13 — close: hand grips the red can (Rio sunset behind). */
export const S13Can: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 13.6;
  const p = kf(frame, [0, d], [0, 1], easeOut);
  const grip = kf(frame, [0, 8], [0.4, 1], easeOut);
  const skin = DAVI_OUTFIT.skin;
  const sleeve = DAVI_OUTFIT.top;
  const id = useUid('hand');
  return (
    <Cam2D d={d} zoom={[1.0, 1.14]} roll={[-6, -1]} whip="up" origin={[540, 900]}>
      <AbsoluteFill style={{transform: 'scale(1.1)'}}>
        <Copacabana cam={{x: 1, y: 1.3, z: 6, pitch: 0, f: 1650, cy: H * 0.55}} t={t} focus={0.5} aperture={22} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible', filter: 'drop-shadow(0 30px 40px rgba(40,10,30,0.35))'}}>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={skin.light} />
            <stop offset="0.5" stopColor={skin.base} />
            <stop offset="1" stopColor={skin.shade} />
          </linearGradient>
        </defs>
        <g transform={`translate(540,${920 - p * 30}) scale(3.4) rotate(${-8 + p * 4})`}>
          {/* sleeve from bottom-right */}
          <path d="M40,90 L170,150 L210,330 L60,330 Z" fill={sleeve.base} />
          <path d="M40,90 L150,140 L140,170 L30,120 Z" fill={sleeve.shade} />
          {/* thumb behind */}
          <path d="M-62,-10 Q-80,-50 -60,-62 Q-40,-60 -40,-20 Z" fill={skin.shade} />
          <RedCan />
          {/* palm + fingers wrapping the front */}
          <path d="M60,-40 Q100,-30 110,40 Q110,110 60,120 L20,110 Z" fill={`url(#${id})`} />
          {[0, 1, 2, 3].map((i) => {
            const y = -30 + i * 30;
            const len = 70 + 40 * grip - (i === 3 ? 18 : 0);
            return (
              <g key={i}>
                <rect x={66 - len} y={y} width={len + 10} height={27} rx={13.5} fill={`url(#${id})`} stroke={skin.shade} strokeWidth={1.5} />
                <path d={`M${78 - len * 0.55},${y + 4} l0,19`} stroke={skin.shade} strokeWidth={1.5} opacity={0.6} />
              </g>
            );
          })}
          <path d="M66,-38 L66,110" stroke={skin.shade} strokeWidth={2} opacity={0.4} />
          {/* rim light */}
          <path d="M-60,-104 Q0,-112 60,-104" stroke="#ffd08a" strokeWidth={3} fill="none" opacity={0.8} />
        </g>
      </svg>
      {/* fizz bubbles */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 18}).map((_, i) => {
          const y = 520 - ((frame * (4 + (i % 5)) + random(`fz-${i}`) * 200) % 300);
          return <circle key={i} cx={480 + random(`fx-${i}`) * 140} cy={y} r={3 + (i % 3) * 2} fill="#fff" opacity={0.55} />;
        })}
      </svg>
      <Particles t={t} seed="a13" count={24} bokeh={9} driftX={-20} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/** S14 — phone insert: a street video from Tokyo. Push into the screen. */
export const S14Phone: React.FC<ShotProps> = ({d}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const p = kf(frame, [0, d], [0, 1], easeIn);
  const skin = DAVI_OUTFIT.skin;
  const sw = 520;
  const sh = 1000;
  const x0 = (W - sw) / 2;
  const y0 = 430;
  return (
    <Cam2D d={d} zoom={[1.0, 1.0]} roll={[3, 0]} whip="left">
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a3466 0%, #0b0f22 80%)'}} />
      <AbsoluteFill style={{transform: `scale(${1 + p * 1.25})`, transformOrigin: `${W / 2}px ${y0 + sh * 0.45}px`}}>
        {/* phone body */}
        <div style={{position: 'absolute', left: x0 - 22, top: y0 - 22, width: sw + 44, height: sh + 44, borderRadius: 64, background: '#0d0f16', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 4px #2b3042'}} />
        <div style={{position: 'absolute', left: x0, top: y0, width: sw, height: sh, borderRadius: 46, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${sh / H})`, transformOrigin: '0 0', marginLeft: -(W * (sh / H) - sw) / 2}}>
            <TokyoStreet cam={{x: 0.3 - t * 0.4, y: 1.7, z: 2 + t * 1.5, pitch: -2, f: 1500, cy: H * 0.5}} t={t + 30} />
          </div>
          {/* video UI */}
          <div style={{position: 'absolute', left: 30, right: 30, bottom: 46, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.3)'}}>
            <div style={{width: `${30 + p * 25}%`, height: '100%', borderRadius: 4, background: '#ff4b3e'}} />
          </div>
          <div style={{position: 'absolute', left: 30, top: 40, fontFamily: 'Roboto Condensed', fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: 3, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>● TÓQUIO</div>
        </div>
        {/* thumb + fingers */}
        <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
          <path d={`M${x0 - 60},${y0 + 820} Q${x0 + 40},${y0 + 760} ${x0 + 120},${y0 + 830} Q${x0 + 150},${y0 + 880} ${x0 + 90},${y0 + 900} Q${x0 + 20},${y0 + 900} ${x0 - 60},${y0 + 980} Z`} fill={skin.base} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={x0 + sw - 6} y={y0 + 560 + i * 92} width={70} height={80} rx={36} fill={i === 1 ? skin.base : skin.shade} />
          ))}
          <path d={`M${x0 - 120},${H} L${x0 - 60},${y0 + 930} Q${x0 + 100},${y0 + 900} ${x0 + 180},${y0 + 1100} L${x0 + 200},${H} Z`} fill={DAVI_OUTFIT.top.base} />
        </svg>
      </AbsoluteFill>
      <Finish vignette={0.6} />
    </Cam2D>
  );
};
