import React from 'react';
import {AbsoluteFill, spring} from 'remotion';
import {Rig, Svg, useShot} from './kit';
import {NightBeach, PHONE_LIGHT, PhoneFrame} from './sets';
import {CloseUp, GloveHand, TableScene} from './ShotsMonaco';
import {PlacedDavi, DAVI_OUTFIT} from '../../characters/Davi';
import {FaceCloseup} from '../../characters/Closeups';
import {Flash} from '../../fx/Rastro';
import {Particles} from '../../fx/Particles';
import {Finish} from '../../scenes/common';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';

const T0 = 700;
/** Frozen moment of the photo (scene time). */
const PHOTO_T = 340;

/** The photo Rocha takes: Lia at the table, terrace behind (static). */
export const Photo: React.FC = () => (
  <TableScene t={PHOTO_T} liaFacing={0.05} liaExpr={{lookX: 0, lookY: 0.1, smile: -0.25, browTilt: 0.45, eyesWide: 0.15}} phoneOnTable={false} />
);

/** Photo cropped into a box (w x h px), showing the scene region centred on (fx, fy) at zoom z. */
const PhotoCrop: React.FC<{w: number; h: number; z?: number; fx?: number; fy?: number; radius?: number; blur?: number}> = ({w, h, z = 1, fx = 540, fy = 1150, radius = 28, blur = 0}) => {
  const s = Math.max(w / W, h / H) * z;
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', borderRadius: radius, background: '#000'}}>
      <div style={{position: 'absolute', left: w / 2 - fx * s, top: h / 2 - fy * s, width: W, height: H, transform: `scale(${s})`, transformOrigin: '0 0', filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
        <Photo />
      </div>
    </div>
  );
};

/** Davi's messenger screen (1080 wide, ~2270 tall): header "Lia", the photo bubble, optional text bubble. */
const Chat: React.FC<{photo?: number; msg?: number; typing?: number; photoBlur?: number}> = ({photo = 1, msg = 0, typing = 0, photoBlur = 0}) => (
  <AbsoluteFill style={{background: '#0d1118', height: 2270, fontFamily: HUD_FONT, color: '#fff'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 300, background: '#161c27', borderBottom: '2px solid #232b3a'}}>
      <div style={{position: 'absolute', left: 70, top: 70, fontSize: 40, opacity: 0.8}}>22:48</div>
      <div style={{position: 'absolute', left: 60, top: 170, fontSize: 70, opacity: 0.8}}>‹</div>
      <div style={{position: 'absolute', left: 150, top: 160, width: 100, height: 100, borderRadius: 50, background: '#13845e', fontSize: 56, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>L</div>
      <div style={{position: 'absolute', left: 280, top: 166, fontSize: 56, fontWeight: 700}}>Lia</div>
      <div style={{position: 'absolute', left: 280, top: 230, fontSize: 32, color: '#7dffb0'}}>online</div>
    </div>
    {photo > 0 && (
      <div style={{position: 'absolute', left: 60, top: 360, padding: 14, borderRadius: 40, background: '#202838', transform: `scale(${lerp(0.9, 1, photo)})`, transformOrigin: '0 0', opacity: photo}}>
        <PhotoCrop w={820} h={1180} fx={560} fy={1060} blur={photoBlur} />
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

/* ------------------------------------------------------------------ L24 */

/** c28 — "Mandou uma foto": Lia's phone in the glove; shutter on Lia, then sent to DAVI. */
export const SendPhoto: React.FC = () => {
  const {frame, t, fps} = useShot();
  const SNAP = 5;
  const SEND = 13;
  const sent = spring({frame: frame - SEND, fps, config: {damping: 12, stiffness: 200}});
  return (
    <Rig s0={1.0} s1={1.1} r0={-3} r1={1} whipIn="zoom" impacts={[{at: SNAP, amp: 8}]}>
      <AbsoluteFill style={{filter: 'blur(14px) brightness(0.7)', transform: 'scale(1.15)'}}>
        <TableScene t={t + T0} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - 260, top: 520, transform: 'rotate(-4deg)'}}>
        <div style={{borderRadius: 64, padding: 10, background: '#e4b8a6'}}>
          <PhoneFrame w={500} glow={0.4}>
            <AbsoluteFill style={{height: 2270}}>
              <div style={{position: 'absolute', left: 0, top: 120}}>
                <PhotoCrop w={1080} h={1700} fx={540} fy={1080} radius={0} />
              </div>
              {frame >= SNAP && <AbsoluteFill style={{background: `rgba(255,255,255,${kf(frame, [SNAP, SNAP + 4], [1, 0])})`}} />}
              <div style={{position: 'absolute', left: 540 - 90, top: 1900, width: 180, height: 180, borderRadius: 90, border: '12px solid #fff', background: frame >= SNAP && frame < SNAP + 3 ? '#ccc' : 'transparent'}} />
              {frame >= SEND && (
                <div style={{position: 'absolute', left: 90, top: 760, width: 900, padding: 50, borderRadius: 50, background: 'rgba(20,24,34,0.92)', transform: `scale(${sent})`, fontFamily: HUD_FONT, color: '#fff'}}>
                  <div style={{fontSize: 46, opacity: 0.7}}>Enviar para</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 24}}>
                    <div style={{width: 120, height: 120, borderRadius: 60, background: '#e0a92a', fontSize: 66, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a2610'}}>D</div>
                    <div style={{fontSize: 80, fontWeight: 700, flex: 1}}>Davi</div>
                    <div style={{fontSize: 80, color: '#7dffb0'}}>{frame >= SEND + 6 ? '✓' : '➤'}</div>
                  </div>
                </div>
              )}
            </AbsoluteFill>
          </PhoneFrame>
        </div>
      </div>
      <Svg>
        <GloveHand x={850} y={1350} s={1.1} rot={-80} />
      </Svg>
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** Davi on the dark beach holding his phone (screen glow) — used in c29 / c32. */
const DaviOnBeach: React.FC<{t: number; frame: number; buzz?: number; lift?: number; h?: number; x?: number; y?: number}> = ({t, frame, buzz = 0, lift = 1, h = 1900, x = 540, y = 2650}) => {
  const k = h / 1000;
  const shR = lerp(10, -32, lift);
  const elR = lerp(-6, -118, lift);
  const shL = lerp(-10, 30, lift);
  const elL = lerp(6, 110, lift);
  // phone position ~ between the hands, local units
  const ph = {x: x + lerp(150, 10, lift) * k, y: y - lerp(300, 820, lift) * k};
  const bz = buzz > 0 ? Math.sin(frame * 3.3) * 6 * buzz : 0;
  return (
    <>
      <PlacedDavi x={x} y={y} height={h} light={PHONE_LIGHT} pose={{shR, elR, shL, elL, facing: 0, headTilt: 6 * lift}} expr={{lookY: 0.9 * lift, lookX: 0, browTilt: 0.2, blink: kf(frame, [10, 12, 14], [0, 1, 0])}} />
      <Svg>
        <defs>
          <radialGradient id="dob-g" cx={ph.x} cy={ph.y} r={520} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#bfe4ff" stopOpacity={0.55} />
            <stop offset="1" stopColor="#bfe4ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={ph.x} cy={ph.y} r={520} fill="url(#dob-g)" style={{mixBlendMode: 'screen'}} />
        <g transform={`translate(${ph.x + bz},${ph.y}) rotate(${-10 + bz})`}>
          <rect x={-70 * k} y={-140 * k} width={140 * k} height={280 * k} rx={20 * k} fill="#111217" stroke="#4c505c" strokeWidth={3} />
          <rect x={-62 * k} y={-128 * k} width={124 * k} height={256 * k} rx={14 * k} fill="#cfe9ff" opacity={0.95} />
        </g>
        {buzz > 0 &&
          [-1, 1].map((s) => (
            <g key={s} stroke="#cfe9ff" strokeWidth={6} strokeLinecap="round" opacity={0.7 * buzz}>
              <line x1={ph.x + s * 110 * k} y1={ph.y - 60} x2={ph.x + s * 150 * k} y2={ph.y - 80} />
              <line x1={ph.x + s * 115 * k} y1={ph.y} x2={ph.x + s * 160 * k} y2={ph.y} />
            </g>
          ))}
      </Svg>
    </>
  );
};

/** c29 — "pro Davi.": far away, Davi alone on a dark beach; the phone buzzes and lights his face. */
export const DaviBeach: React.FC = () => {
  const {frame, t, p} = useShot();
  return (
    <Rig s0={1.0} s1={1.12} x0={40} x1={0} r0={-2} r1={0} whipIn="right" oy={900}>
      <NightBeach t={t + T0} horizon={900} px={frame * 3} />
      <DaviOnBeach t={t} frame={frame} buzz={frame % 10 < 6 ? 1 : 0} lift={kf(frame, [2, 14], [0.2, 1], easeOut)} h={1700} y={2500} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 100%)'}} />
      <Finish vignette={0.65} grain={0.12} />
    </Rig>
  );
};

/** Full-bleed phone screen, slightly perspective-tilted, filling the frame. */
const ScreenClose: React.FC<{children: React.ReactNode; w?: number; x?: number; y?: number; rot?: number}> = ({children, w = 960, x = 60, y = 120, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`}}>
    <PhoneFrame w={w} glow={0.8}>
      {children}
    </PhoneFrame>
  </div>
);

/** c30 — "A mesa.": the photo arrives (unblurs), detail on the table. */
export const PhotoTable: React.FC = () => {
  const {frame, p} = useShot();
  return (
    <Rig s0={2.2} s1={2.45} ox={540} oy={1180} x0={0} x1={0} y0={-420} y1={-480} r0={-3} r1={-1} whipIn="down">
      <AbsoluteFill style={{background: '#03050a'}} />
      <ScreenClose>
        <Chat photo={1} photoBlur={kf(frame, [0, 10], [24, 0])} />
      </ScreenClose>
      <AbsoluteFill style={{background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 40%)'}} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** c31 — "A Lia.": snap pan to Lia's face in the photo. */
export const PhotoLia: React.FC = () => (
  <Rig s0={3.4} s1={3.7} ox={420} oy={760} x0={120} x1={110} y0={60} y1={60} r0={2} r1={1} whipIn="left">
    <AbsoluteFill style={{background: '#03050a'}} />
    <ScreenClose>
      <Chat photo={1} />
    </ScreenClose>
    <Finish vignette={0.5} grain={0.14} />
  </Rig>
);

/** c32 — "O terraço.": pull back — the phone in Davi's hand on the dark beach, the whole photo. */
export const PhotoTerrace: React.FC = () => {
  const {frame, t} = useShot();
  return (
    <Rig s0={1.5} s1={1.0} ox={540} oy={900} r0={-2} r1={0} whipIn="zoom" ease={(x) => 1 - Math.pow(1 - x, 2.4)}>
      <AbsoluteFill style={{filter: 'blur(8px)'}}>
        <NightBeach t={t + T0 + 5} horizon={760} />
      </AbsoluteFill>
      <Svg>
        {/* hand + sleeve under the phone */}
        <path d="M 330,1500 L 760,1500 L 900,2000 L 200,2000 Z" fill={DAVI_OUTFIT.top.shade} />
        <ellipse cx={560} cy={1420} rx={260} ry={200} fill={DAVI_OUTFIT.skin.shade} />
      </Svg>
      <ScreenClose w={620} x={230} y={260} rot={-3}>
        <Chat photo={1} />
      </ScreenClose>
      <Svg>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={830 + (i % 2) * 6} y={720 + i * 110} width={96} height={72} rx={36} fill={i % 2 ? DAVI_OUTFIT.skin.shade : DAVI_OUTFIT.skin.base} stroke="#3a2010" strokeWidth={4} transform="rotate(-3 540 960)" />
        ))}
        <rect x={150} y={1050} width={96} height={190} rx={46} fill={DAVI_OUTFIT.skin.base} stroke="#3a2010" strokeWidth={4} transform="rotate(-20 200 1140)" />
      </Svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 40% at 50% 45%, rgba(150,200,255,0.12), rgba(0,0,0,0) 70%)'}} />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/** c33 — "Tu já viu esse lugar.": typing dots, then the message pops. */
export const Message: React.FC = () => {
  const {frame, t, fps} = useShot();
  const MSG = 4;
  const m = spring({frame: frame - MSG, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
  return (
    <Rig s0={1.55} s1={1.7} ox={540} oy={1500} y0={-260} y1={-300} r0={-1} r1={1} whipIn="up" impacts={[{at: MSG, amp: 8, zoom: 0.03}]}>
      <AbsoluteFill style={{background: '#03050a'}} />
      <ScreenClose>
        <Chat photo={1} typing={frame < MSG ? t + 1 : 0} msg={frame >= MSG ? m : 0} />
      </ScreenClose>
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* ------------------------------------------------------------------ L25 */

/** Phone-glow light from below on a close-up. */
const ScreenGlow: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 45% at 50% 95%, rgba(150,210,255,${0.45 * k}) 0%, rgba(150,210,255,0) 70%)`, mixBlendMode: 'screen', pointerEvents: 'none'}} />
);

/** c34 — "Segue aí pra ver se ele": close on Davi staring at the screen; cold light. */
export const DaviStare: React.FC = () => {
  const {frame, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.12} x0={-30} x1={10} r0={1} r1={-1} whipIn="right" oy={980}>
      <AbsoluteFill style={{filter: 'blur(10px)', transform: 'scale(1.15)'}}>
        <NightBeach t={t + T0 + 8} horizon={1000} px={frame * 2} />
      </AbsoluteFill>
      <AbsoluteFill style={{filter: 'brightness(0.62) saturate(0.8)'}}>
        <CloseUp who="davi" cx={560} cy={960} k={4.4} facing={0.05} light={PHONE_LIGHT} expr={{lookY: 0.8, lookX: -0.1, browTilt: 0.35, smile: -0.15, blink: kf(frame, [18, 20, 22], [0, 1, 0])}} />
      </AbsoluteFill>
      <ScreenGlow />
      <Particles t={t} seed="c34" count={16} bokeh={7} driftX={-6} />
      <Finish vignette={0.7} grain={0.12} />
    </Rig>
  );
};

/** c35 — "volta pra buscar ela,": his thumb hovering over the photo, trembling. */
export const Thumb: React.FC = () => {
  const {frame, t} = useShot();
  const hover = kf(frame, [0, 14, 22, 34], [0, 1, 0.75, 0.95], easeOut);
  const tr = Math.sin(frame * 2.3) * 4 + Math.sin(frame * 3.7) * 2;
  const tx = 600 + tr;
  const ty = lerp(1700, 1080, hover);
  return (
    <Rig s0={1.25} s1={1.38} ox={520} oy={1000} r0={2} r1={-1} whipIn="down">
      <AbsoluteFill style={{background: '#03050a'}} />
      <ScreenClose>
        <Chat photo={1} msg={1} />
      </ScreenClose>
      <Svg>
        {/* thumb shadow on the glass */}
        <ellipse cx={tx + 40} cy={ty + 60} rx={110} ry={70} fill="#000" opacity={0.25 * hover} style={{filter: 'blur(12px)'}} />
        <g transform={`translate(${tx},${ty}) rotate(-18)`}>
          <path d={`M -95,0 Q -100,-130 0,-140 Q 100,-130 95,0 L 120,900 L -120,900 Z`} fill={DAVI_OUTFIT.skin.base} stroke={DAVI_OUTFIT.skin.shade} strokeWidth={6} />
          <path d="M -55,-70 Q 0,-110 55,-70 L 50,20 Q 0,40 -50,20 Z" fill={DAVI_OUTFIT.skin.light} opacity={0.75} />
          <path d="M -60,160 Q 0,180 60,160" stroke={DAVI_OUTFIT.skin.shade} strokeWidth={6} fill="none" opacity={0.6} />
          <path d={`M 95,0 L 120,900`} stroke="#8fd0ff" strokeWidth={8} opacity={0.5} />
        </g>
      </Svg>
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.15)'}} />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/** c36 — "ou se pula de novo.": extreme close on Davi's eyes, photo reflected; slow push -> hard cut. */
export const Eyes: React.FC = () => {
  const {frame, t, dur} = useShot();
  const k = 9.5;
  const cx = 540;
  const cy = 1020;
  const spark = frame > dur - 10 ? kf(frame, [dur - 10, dur - 1], [0, 1]) : 0;
  return (
    <Rig s0={1.0} s1={1.16} r0={0} r1={1.5} oy={960} ease={(x) => x}>
      <AbsoluteFill style={{background: '#05070c'}} />
      <AbsoluteFill style={{filter: 'brightness(0.6)'}}>
        <Svg>
          <FaceCloseup cx={cx} cy={cy} k={k} skin={DAVI_OUTFIT.skin} style={DAVI_OUTFIT.head} facing={0} light={PHONE_LIGHT} expr={{lookY: 0.4, browTilt: lerp(0.3, -0.6, clamp((frame - 20) / 14)), blink: 0}} />
        </Svg>
      </AbsoluteFill>
      {/* the photo reflected in each eye */}
      <Svg>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${cx + s * 41 * k + 0.4 * 7 * 0.6 * k},${cy - 2 * k + 3 * k})`}>
            <rect x={-16} y={-22} width={30} height={42} rx={4} fill="#cfe9ff" opacity={0.75} />
            <rect x={-12} y={-8} width={22} height={10} fill="#ffcf85" opacity={0.7} />
          </g>
        ))}
      </Svg>
      <ScreenGlow k={1.2} />
      {spark > 0 && <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 30% at 85% 30%, rgba(90,190,255,${0.5 * spark}), rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />}
      <Flash k={kf(frame, [dur - 3, dur - 1], [0, 0.25])} />
      <Finish vignette={0.75} grain={0.14} />
    </Rig>
  );
};
