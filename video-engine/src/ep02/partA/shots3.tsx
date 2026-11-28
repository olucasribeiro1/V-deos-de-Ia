import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT} from '../../characters/Davi';
import {PlacedPuppet} from '../../characters/Puppet';
import {PlacedAgent} from '../../characters/Agent';
import {Globe, SpaceBackdrop, globeProject, globeView} from '../../environments/Globe';
import {Cam, groundPath, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Particles} from '../../fx/Particles';
import {Flash} from '../../fx/Rastro';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Cam2D} from '../../ep01/partA/kit';
import {LinhaEmblem} from '../../ep01/partB/kit';
import {PhotoThumb, Pin, SCREEN_LIGHT, ShotProps, Sky, pct, wl} from './kit';
import {BedFront, Bedroom, Gallery, Office, PhoneUI, PostcardTown} from './sets';

/* ================================================================== L7 */

const SCR = {sx: 120, sy: 560, sw: 840, sh: 640};

/** Big-screen content: mirrored phone in the middle, data panels on the sides. */
const MirrorWall: React.FC<{fr: number; n?: number; scroll?: number}> = ({fr, n = 30, scroll = 0}) => {
  const pw = 300;
  const ph = 560;
  const px = SCR.sx + (SCR.sw - pw) / 2;
  const py = SCR.sy + 40;
  return (
    <g>
      <rect x={SCR.sx} y={SCR.sy} width={SCR.sw} height={SCR.sh} fill="#08162c" />
      {Array.from({length: 16}).map((_, i) => (
        <line key={i} x1={SCR.sx} x2={SCR.sx + SCR.sw} y1={SCR.sy + i * 40} y2={SCR.sy + i * 40} stroke="#1d3c66" strokeWidth={1} />
      ))}
      {/* side panels */}
      {[SCR.sx + 30, SCR.sx + SCR.sw - 230].map((x, j) => (
        <g key={j}>
          <rect x={x} y={SCR.sy + 60} width={200} height={140} rx={8} fill="#0f2a4e" stroke="#2f6fb0" strokeWidth={2} />
          {Array.from({length: 5}).map((_, i) => (
            <rect key={i} x={x + 16} y={SCR.sy + 80 + i * 22} width={60 + ((i * 37 + j * 50 + fr * 3) % 110)} height={10} fill="#4aa8ff" opacity={0.6} />
          ))}
          <rect x={x} y={SCR.sy + 230} width={200} height={330} rx={8} fill="#0f2a4e" stroke="#2f6fb0" strokeWidth={2} />
          {Array.from({length: 8}).map((_, i) => (
            <circle key={i} cx={x + 30 + random(`mw-${j}-${i}`) * 140} cy={SCR.sy + 260 + random(`mwy-${j}-${i}`) * 280} r={6} fill="#ff3b3b" opacity={0.5 + 0.5 * Math.sin(fr * 0.4 + i)} />
          ))}
        </g>
      ))}
      <rect x={px - 10} y={py - 10} width={pw + 20} height={ph + 20} rx={28} fill="#05070c" stroke="#6fc8ff" strokeWidth={3} />
      <g transform={`translate(${px},${py})`}>
        <PhoneUI w={pw} h={ph} n={n} scroll={scroll} mirror={1} title="GALERIA" />
      </g>
    </g>
  );
};

/** Rocha seen from behind / in silhouette against the wall screen. */
const RochaSilhouette: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
  <AbsoluteFill style={{filter: 'brightness(0.06) drop-shadow(0 0 10px rgba(110,200,255,0.65))'}}>
    <PlacedAgent variant="rocha" x={x} y={y} height={h} upperOnly pose={{shL: 10, elL: 30, shR: -10, elR: -30}} expr={{}} />
  </AbsoluteFill>
);

/** 27 — "Enquanto isso, a Linha": dark office, wall screen mirroring Davi's phone. */
export const A27Office: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const glow = kf(fr, [0, 10], [0.3, 1]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.1]} whip="right" origin={[540, 900]}>
      <Office {...SCR} glow={glow}>
        <MirrorWall fr={fr} />
      </Office>
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.25}}>
        <LinhaEmblem x={980} y={300} r={160} glow={0.2} sweep={kf(fr, [0, d], [-0.2, 1.2])} />
      </svg>
      <RochaSilhouette x={430} y={1240 + 884 * 1.55} h={1550} />
      <Particles t={t} seed="ec27" count={18} bokeh={4} color="150,210,255" bokehColor="90,160,255" driftX={-6} />
      <Finish vignette={0.7} grain={0.13} />
    </Cam2D>
  );
};

/** 28 — "mudou de tática": Rocha close, lit by the screen, screen reflected in his glasses. */
export const A28Rocha: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const T = wl(start, 'L7', 6);
  const h = 2000;
  const headY = 980;
  const smirk = kf(fr, [T - 2, T + 8], [0.1, 0.95]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.12]} roll={[-1.5, 0.5]} origin={[540, 980]} punches={[{at: T, amt: 0.04}]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0f1a2c 0%, #04060b 75%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.35}}>
        <LinhaEmblem x={540} y={760} r={460} glow={0.4} sweep={kf(fr, [0, d], [-0.2, 1.2])} />
      </svg>
      <PlacedAgent
        variant="rocha"
        x={540}
        y={headY + 884 * (h / 1000)}
        height={h}
        upperOnly
        light={SCREEN_LIGHT}
        pose={{facing: -0.05, headTilt: -2, shL: -6, elL: 10, shR: 6, elR: -10}}
        expr={{halfSmile: smirk, browTilt: -0.5, browAsym: 0.3}}
      >
        {/* screen reflected in both lenses */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${-1.5 + s * 42},-887)`}>
            <rect x={-24} y={-14} width={48} height={26} rx={4} fill="#3f9cff" opacity={0.55} />
            {Array.from({length: 6}).map((_, i) => (
              <rect key={i} x={-20 + (i % 3) * 14} y={-10 + Math.floor(i / 3) * 12} width={11} height={9} fill="#bfe6ff" opacity={0.6} />
            ))}
          </g>
        ))}
      </PlacedAgent>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(60,150,255,0.18), rgba(0,0,0,0) 50%)', mixBlendMode: 'screen'}} />
      <Particles t={t} seed="ec28" count={16} bokeh={3} color="150,210,255" bokehColor="90,160,255" driftX={-6} />
      <Finish vignette={0.7} grain={0.13} />
    </Cam2D>
  );
};

/** Phone held in a hand, screen content via render prop (screen w × h). */
const HandPhone: React.FC<{x0: number; y0: number; sw: number; sh: number; children: React.ReactNode}> = ({x0, y0, sw, sh, children}) => {
  const skin = DAVI_OUTFIT.skin;
  return (
    <>
      <div style={{position: 'absolute', left: x0 - 22, top: y0 - 22, width: sw + 44, height: sh + 44, borderRadius: 64, background: '#0d0f16', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 4px #2b3042'}} />
      <div style={{position: 'absolute', left: x0, top: y0, width: sw, height: sh, borderRadius: 46, overflow: 'hidden', background: '#000'}}>{children}</div>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={x0 + sw - 6} y={y0 + sh * 0.55 + i * 92} width={70} height={80} rx={36} fill={i === 1 ? skin.base : skin.shade} />
        ))}
        <path d={`M${x0 - 120},${H} L${x0 - 60},${y0 + sh - 80} Q${x0 + 100},${y0 + sh - 110} ${x0 + 180},${y0 + sh + 90} L${x0 + 200},${H} Z`} fill={DAVI_OUTFIT.top.base} />
        <path d={`M${x0 - 60},${y0 + sh - 160} Q${x0 + 40},${y0 + sh - 220} ${x0 + 120},${y0 + sh - 150} Q${x0 + 150},${y0 + sh - 100} ${x0 + 90},${y0 + sh - 80} Q${x0 + 20},${y0 + sh - 80} ${x0 - 60},${y0 + sh} Z`} fill={skin.base} />
      </svg>
    </>
  );
};

/** 29 — "Se ele só pula pra lugar": phone POV, he snaps a photo of a postcard view. */
export const A29Snap: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const S = wl(start, 'L7', 10);
  const shot = clamp((fr - S) / 10);
  const sw = 560;
  const sh = 1000;
  const x0 = (W - sw) / 2;
  const y0 = 440;
  const thumb = easeIn(shot);
  return (
    <Cam2D d={d} zoom={[1.0, 1.06]} roll={[-3, 0]} whip="up" punches={[{at: S, amt: 0.04}]}>
      <AbsoluteFill style={{filter: 'blur(12px)'}}>
        <Sky stops={['#3f8fe0', '#8cc6f5', '#dff1ff']} h={900} />
        <PostcardTown t={t} />
      </AbsoluteFill>
      <HandPhone x0={x0} y0={y0} sw={sw} sh={sh}>
        <div style={{position: 'absolute', inset: 0, transform: `translate(${thumb * -170}px, ${thumb * 330}px) scale(${1 - thumb * 0.78})`, transformOrigin: '50% 50%', borderRadius: thumb * 30, overflow: 'hidden', border: thumb > 0.05 ? '6px solid #fff' : undefined}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${sh / H * 1.05})`, transformOrigin: '0 0', marginLeft: -180}}>
            <Sky stops={['#3f8fe0', '#8cc6f5', '#dff1ff']} h={900} />
            <PostcardTown t={t} />
          </div>
        </div>
        {shot < 0.1 && (
          <svg width={sw} height={sh} style={{position: 'absolute'}}>
            {[
              [40, 60, 1, 1],
              [sw - 40, 60, -1, 1],
              [40, sh - 180, 1, -1],
              [sw - 40, sh - 180, -1, -1],
            ].map(([x, y, a, b], i) => (
              <path key={i} d={`M${x},${y + b * 50} L${x},${y} L${x + a * 50},${y}`} stroke="#fff" strokeWidth={5} fill="none" />
            ))}
          </svg>
        )}
        <svg width={sw} height={sh} style={{position: 'absolute'}}>
          <rect y={sh - 140} width={sw} height={140} fill="#000" opacity={0.55} />
          <circle cx={sw / 2} cy={sh - 70} r={44} fill="#fff" />
          <circle cx={sw / 2} cy={sh - 70} r={54} fill="none" stroke="#fff" strokeWidth={5} />
        </svg>
      </HandPhone>
      <Flash k={kf(fr, [S, S + 1, S + 5], [0, 0.9, 0], (x) => x)} color="255,255,255" />
      <Finish vignette={0.5} />
    </Cam2D>
  );
};

/** 30 — "que já viu, era só ver": gallery on the phone, red mirror dot, thumbnails streaming out. */
export const A30Sync: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const sw = 600;
  const sh = 1080;
  const x0 = (W - sw) / 2 + 40;
  const y0 = 520;
  return (
    <Cam2D d={d} zoom={[1.08, 1.0]} roll={[4, 2]} pan={[0, 80, 0, -40]} whip="zoom">
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a3466 0%, #0b0f22 80%)'}} />
      <HandPhone x0={x0} y0={y0} sw={sw} sh={sh}>
        <svg width={sw} height={sh}>
          <PhoneUI w={sw} h={sh} n={40} scroll={kf(fr, [0, d], [0, 160])} mirror={0.5 + 0.5 * Math.sin(fr * 0.5)} />
        </svg>
      </HandPhone>
      {/* thumbnails streaming out to the upper right */}
      <svg width={W} height={H} style={{position: 'absolute', filter: 'drop-shadow(0 0 10px rgba(255,80,80,0.7))'}}>
        {Array.from({length: 10}).map((_, i) => {
          const ph = ((fr + i * 3.3) % 24) / 24;
          const x = lerp(x0 + 100 + (i % 3) * 180, 1140, ph);
          const y = lerp(y0 + 300 + (i % 4) * 100, 380, ph);
          return (
            <g key={i} transform={`translate(${x},${y}) scale(${1 - ph * 0.6}) rotate(${ph * 30})`} opacity={1 - ph}>
              <rect x={-4} y={-4} width={98} height={98} rx={8} fill="#ff3b3b" />
              <PhotoThumb w={90} h={90} i={i + 3} />
            </g>
          );
        })}
      </svg>
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/** 31 — "ver o que ele viu": the same gallery on the wall screen, Rocha's gloved finger taps a photo. */
export const A31Screen: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const tap = kf(fr, [10, 16], [0, 1], easeOut);
  const press = kf(fr, [16, 19, 24], [0, 1, 0]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.25]} origin={[540, 860]} whip="up" ease={(x) => 1 - Math.pow(1 - x, 2)}>
      <Office {...SCR} glow={1}>
        <MirrorWall fr={fr} n={48} scroll={kf(fr, [0, d], [60, 220])} />
      </Office>
      {/* tap highlight */}
      {press > 0 && <svg width={W} height={H} style={{position: 'absolute'}}><circle cx={560} cy={830} r={30 + press * 50} fill="none" stroke="#ff3b3b" strokeWidth={6} opacity={press} /></svg>}
      {/* gloved hand + sleeve from bottom right */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g transform={`translate(${lerp(1200, 600, tap)},${lerp(1400, 880, tap)}) rotate(-35)`}>
          <rect x={30} y={-60} width={700} height={170} rx={50} fill="#2c2f36" />
          <rect x={30} y={-60} width={50} height={170} fill="#f4f4f6" />
          <rect x={-90} y={-50} width={140} height={150} rx={50} fill="#17171b" />
          <rect x={-190} y={-40} width={140} height={44} rx={22} fill="#17171b" />
          <path d="M-180,-30 L-80,-30" stroke="#4a4c55" strokeWidth={6} strokeLinecap="round" />
        </g>
      </svg>
      <Particles t={t} seed="ec31" count={14} bokeh={3} color="150,210,255" bokehColor="90,160,255" driftX={-6} />
      <Finish vignette={0.65} grain={0.13} />
    </Cam2D>
  );
};

/* ================================================================== L8 */

/** 32 — "Trezentas e doze fotos": wall of photos filling in, pull back, FOTOS 312. */
export const A32Grid: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const n = Math.round(kf(fr, [0, d - 6], [20, 312], (x) => x));
  const cols = 12;
  const gap = 6;
  const tw = (W - gap * (cols + 1)) / cols;
  return (
    <Cam2D d={d} zoom={[2.2, 1.0]} origin={[540, 760]} ease={(x) => 1 - Math.pow(1 - x, 2.4)}>
      <AbsoluteFill style={{background: '#070a14'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 312}).map((_, i) => {
          if (i >= n) return null;
          const c = i % cols;
          const r = Math.floor(i / cols);
          const pop = clamp((n - i) / 8);
          return (
            <g key={i} transform={`translate(${gap + c * (tw + gap) + tw / 2},${gap + r * (tw + gap) + 300 + tw / 2}) scale(${0.6 + 0.4 * pop})`} opacity={pop}>
              <g transform={`translate(${-tw / 2},${-tw / 2})`}>
                <PhotoThumb w={tw} h={tw} i={i} />
              </g>
            </g>
          );
        })}
      </svg>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,18,0.0) 22%, rgba(5,8,18,0.75) 27%, rgba(5,8,18,0.75) 36%, rgba(5,8,18,0) 42%)'}} />
      <HudLabel label="FOTOS" value={312} x={90} y={520} tx={540} ty={900} from={2} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/** 33 — "salvas no celular": Davi in bed at night, scrolling, unaware; red dots drift off the phone. */
export const A33Bed: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const scroll = kf(fr, [0, d], [0, 1]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.14]} pan={[0, 0, -20, -30]} whip="left" origin={[540, 1000]}>
      <Bedroom t={t} />
      <PlacedPuppet
        outfit={DAVI_OUTFIT}
        light={{side: 1, rim: '#8fd0ff', rimStrength: 0.75, shadeStrength: 0.7}}
        x={520}
        y={1720}
        height={1250}
        upperOnly
        pose={{shL: -25, elL: 115, shR: 25, elR: -115, headTilt: 5, facing: 0.1}}
        expr={{lookY: 0.8, lookX: 0.1, halfSmile: 0.6 + 0.2 * Math.sin(t * 3), smile: 0.3, blink: kf(fr, [20, 22, 24], [0, 1, 0], (x) => x)}}
        heldProp={
          <g transform="translate(0,-610) rotate(8)">
            <rect x={-46} y={-80} width={92} height={160} rx={14} fill="#121521" />
            <rect x={-40} y={-72} width={80} height={144} rx={9} fill="#8fd6ff" />
            <circle cx={30} cy={-64} r={6} fill="#ff3b3b" opacity={0.6 + 0.4 * Math.sin(fr * 0.6)} />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={-34} y={-60 + ((i * 50 + scroll * 300) % 140)} width={68} height={40} rx={4} fill="#e8f7ff" opacity={0.7} />
            ))}
          </g>
        }
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, rgba(120,210,255,0.35) 0%, rgba(120,210,255,0) 40%)', mixBlendMode: 'screen'}} />
      {/* red data motes drifting from the phone to the window */}
      <svg width={W} height={H} style={{position: 'absolute', filter: 'drop-shadow(0 0 6px rgba(255,60,60,0.9))'}}>
        {Array.from({length: 12}).map((_, i) => {
          const ph = ((fr + i * 4) % 40) / 40;
          const x = lerp(530, 780 + (i % 3) * 60, ph);
          const y = lerp(1100, 560 + (i % 4) * 50, ph) - Math.sin(ph * Math.PI) * 60;
          return <rect key={i} x={x} y={y} width={12} height={12} rx={2} fill="#ff4a4a" opacity={Math.sin(ph * Math.PI) * 0.9} />;
        })}
      </svg>
      <BedFront />
      <Particles t={t} seed="ec33" count={14} bokeh={4} color="170,210,255" bokehColor="120,180,255" driftX={-10} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

const PLACES: {lat: number; lon: number}[] = [
  {lat: 48.9, lon: 2.3},
  {lat: 41.9, lon: 12.5},
  {lat: 38.7, lon: -9.1},
  {lat: 51.5, lon: -0.1},
  {lat: 30.0, lon: 31.2},
  {lat: 43.7, lon: 7.4},
  {lat: 40.4, lon: -3.7},
  {lat: 52.5, lon: 13.4},
  {lat: 37.9, lon: 23.7},
  {lat: 14.7, lon: -17.4},
  {lat: 33.6, lon: -7.6},
  {lat: 45.4, lon: 12.3},
];

/** 34 — "Cada foto virou um endereço": photos fly onto the globe and flip into pins. */
export const A34PhotoPins: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], (x) => x);
  const g = {radius: 460, zoom: 1.25 + p * 0.2, rotation: 12 - p * 6, tilt: 32, cy: 1080};
  const v = globeView(g);
  const per = 3.2;
  return (
    <Cam2D d={d} zoom={[1.0, 1.06]} whip="down">
      <SpaceBackdrop t={t} />
      <Globe {...g} t={t} night={0.75} pins={[]} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {PLACES.map((c, i) => {
          const a = fr - 4 - i * per;
          if (a < 0) return null;
          const P = globeProject(v, c.lat, c.lon);
          if (!P.visible) return null;
          const fly = clamp(a / 10);
          const flip = clamp((a - 10) / 5);
          const sx = lerp(100 + ((i * 263) % 880), P.x, easeIn(fly));
          const sy = lerp(-150, P.y - 70, easeIn(fly));
          if (flip < 0.5) {
            const sc = lerp(1.2, 0.55, fly) * Math.cos(flip * Math.PI);
            return (
              <g key={i} transform={`translate(${sx},${sy}) rotate(${(1 - fly) * (i % 2 ? 25 : -25)}) scale(${sc},${lerp(1.2, 0.55, fly)})`}>
                <rect x={-70} y={-70} width={140} height={160} rx={6} fill="#fff" />
                <g transform="translate(-62,-62)">
                  <PhotoThumb w={124} h={124} i={i + 50} />
                </g>
              </g>
            );
          }
          return <Pin key={i} x={P.x} y={P.y} s={0.75 * Math.sin(((flip - 0.5) / 0.5) * Math.PI * 0.5) + 0.001} pulse={clamp((a - 15) / 14)} />;
        })}
      </svg>
      <Finish vignette={0.5} grain={0.08} />
    </Cam2D>
  );
};

/** 35 — "Em cada endereço": globe crowded with pulsing red pins. */
export const A35Pins: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], (x) => x);
  const g = {radius: 460, zoom: 1.6 + p * 0.5, rotation: 10 - p * 4, tilt: 38, cy: 1140};
  const v = globeView(g);
  return (
    <Cam2D d={d} zoom={[1.0, 1.05]} roll={[-2, 1]} whip="zoom">
      <SpaceBackdrop t={t} />
      <Globe {...g} t={t} night={0.75} pins={[]} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 90}).map((_, i) => {
          const lat = 30 + random(`pp-lat-${i}`) * 30;
          const lon = -12 + random(`pp-lon-${i}`) * 40;
          const P = globeProject(v, lat, lon);
          if (!P.visible) return null;
          const a = fr - random(`pp-t-${i}`) * (d - 8);
          if (a < 0) return null;
          return <Pin key={i} x={P.x} y={P.y} s={0.42} drop={clamp(a / 5)} pulse={a > 5 ? ((a - 5) % 20) / 20 : 0} />;
        })}
      </svg>
      <Finish vignette={0.55} grain={0.08} />
    </Cam2D>
  );
};

/** 36 — "um terno": ground-level map, each pin turns into a standing suit. */
export const A36Suits: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], (x) => x);
  const cam: Cam = {x: 0, y: 2.2, z: -p * 1.2, pitch: 9, f: 1500, cy: H * 0.45};
  const spots = [
    {x: 0, z: 7},
    {x: -2.4, z: 9.5},
    {x: 2.6, z: 9},
    {x: -5, z: 13},
    {x: 5.4, z: 12.5},
    {x: -1, z: 15},
    {x: 2.2, z: 17},
    {x: -7, z: 19},
    {x: 7, z: 20},
  ];
  const lines: string[] = [];
  for (let i = -10; i <= 10; i++) lines.push(groundPath(cam, [[i * 1.6, 1], [i * 1.6, 40]]));
  for (let z = 1; z <= 40; z += 1.6) lines.push(groundPath(cam, [[-20, z], [20, z]]));
  const sorted = spots.map((s, i) => ({...s, i})).sort((a, b) => b.z - a.z);
  return (
    <Cam2D d={d} zoom={[1.0, 1.04]} whip="up" ease={(x) => x}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #05070f 0%, #0b1430 45%, #101c3c 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {lines.map((dd, i) => (
          <path key={i} d={dd} stroke="#2f5fa8" strokeWidth={2} opacity={0.5} fill="none" />
        ))}
      </svg>
      {sorted.map((s) => {
        const P = project(cam, s.x, 0, s.z);
        if (!P) return null;
        const a = fr - s.i * 1.6;
        const rise = clamp(a / 8);
        const hpx = P.ppm * 1.85;
        return (
          <React.Fragment key={s.i}>
            <svg width={W} height={H} style={{position: 'absolute'}}>
              <ellipse cx={P.sx} cy={P.sy} rx={P.ppm * 0.6} ry={P.ppm * 0.14} fill="#ff3b3b" opacity={0.25 + 0.3 * rise} />
              {rise < 1 && <Pin x={P.sx} y={P.sy} s={(P.ppm / 100) * (1 - rise)} />}
            </svg>
            {rise > 0 && (
              <div style={{position: 'absolute', inset: 0, transform: `scaleY(${easeOut(rise)})`, transformOrigin: `${P.sx}px ${P.sy}px`}}>
                <PlacedAgent variant={s.i % 2 === 0 ? 'agentA' : 'agentB'} x={P.sx} y={P.sy} height={hpx} light={{side: 1, rim: '#ff6b6b', rimStrength: 0.7, shadeStrength: 0.8}} pose={{shL: 18, elL: 40, shR: -18, elR: -40}} expr={{}} />
              </div>
            )}
          </React.Fragment>
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 100%, rgba(255,60,60,0.18), rgba(0,0,0,0) 60%)', mixBlendMode: 'screen'}} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};
