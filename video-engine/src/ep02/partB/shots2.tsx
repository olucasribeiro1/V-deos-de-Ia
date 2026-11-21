import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {PlacedLia, LIA_OUTFIT} from '../../characters/Lia';
import {PlacedPuppet} from '../../characters/Puppet';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import {Particles, LightRays} from '../../fx/Particles';
import {Flash} from '../../fx/Rastro';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Rig, ShotP, abs, ev} from './rig';
import {BarBack, BarCounter, Flute, GALA_LIGHT, GUESTS, GalaTable, HudTag, Svg, Terrace, WAITER, WARM_LIGHT, WcDoor} from './sets';
import {TerraceCrowd} from './crowd';
import {MemoryPanels, laughBob, walk} from './kit';

/* 9. "hotel em Mônaco" — wide terrace, crane down. HUD MÔNACO 43,7° N. */
export const STerrace: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[0, -60, 0, 40]} rot={[1.5, -0.5]} pow={1.4}>
      <Terrace t={t} px={fr * 3} horizon={900}>
        <TerraceCrowd t={t} px={fr * 3} />
      </Terrace>
      <HudLabel label="MÔNACO" value="43,7° N" x={90} y={540} tx={760} ty={800} from={3} />
      <Particles t={t} seed="tr" count={16} bokeh={7} />
      <Finish vignette={0.45} />
    </Rig>
  );
};

/* 10. "Ele chegou de moletom" — the terrace WC door opens on blue light; Davi walks out among the gala. */
export const SArrive: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const O = ev(p, 'L11', 12) - 4;
  const open = kf(fr, [O, O + 6], [0, 1], easeOut);
  const step = kf(fr, [O + 3, p.dur], [0, 1], (x) => x);
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.02]} pan={[40, 0, -20, 0]} origin={[540, 1100]} whip="r" pow={1.6}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#2a2440 0%,#4a3048 40%,#6a3c34 100%)'}} />
      <Svg>
        {/* stone wall with sconces */}
        <rect x={-200} y={0} width={1500} height={1500} fill="#cdb79a" />
        {Array.from({length: 16}).map((_, r) => (
          <line key={r} x1={-200} y1={r * 96} x2={1300} y2={r * 96} stroke="#b29c80" strokeWidth={4} />
        ))}
        {[230, 850].map((x) => (
          <g key={x}>
            <circle cx={x} cy={520} r={140} fill="rgba(255,200,120,0.3)" />
            <rect x={x - 12} y={480} width={24} height={80} rx={8} fill="#c99a3a" />
            <ellipse cx={x} cy={470} rx={26} ry={34} fill="#fff1d0" />
          </g>
        ))}
        <WcDoor x={380} y={1460} w={320} h={760} open={open} glow={1} />
        <rect x={-200} y={1460} width={1500} height={500} fill="#5a2e22" />
        <ellipse cx={540} cy={1480} rx={340 * open} ry={50} fill="#4cc6ff" opacity={0.4 * open * (1 - step * 0.6)} />
      </Svg>
      {fr >= O + 2 && (
        <PlacedDavi
          x={540 + step * 40}
          y={lerp(1450, 1720, step)}
          height={lerp(720, 1000, step)}
          light={GALA_LIGHT}
          pose={{...walk(t, 0, 0.8), facing: 0.15}}
          expr={{smile: 0.3, browRaise: 0.2, lookX: lerp(0, 0.7, step)}}
        />
      )}
      {/* foreground gala guests, out of focus */}
      <AbsoluteFill style={{filter: 'blur(10px)'}}>
        <PlacedPuppet outfit={GUESTS[0]} x={-60} y={2350} height={1500} light={GALA_LIGHT} pose={{facing: 0.5, shR: -10, elR: -120}} handProps={{R: <Flute x={0} y={20} s={1.4} />}} />
        <PlacedPuppet outfit={GUESTS[3]} x={1130} y={2380} height={1450} light={GALA_LIGHT} pose={{facing: -0.5}} />
      </AbsoluteFill>
      <Flash k={kf(fr, [O, O + 1, O + 5], [0, 0.4, 0], (x) => x)} color="120,210,255" />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 11. "Todo mundo de gala" — pan across the gala guests, all turning to stare. */
export const SStare: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const look = kf(fr, [2, 12], [0, 1], easeOut);
  const guests = [
    {i: 6, x: 140, y: 1900, h: 1200, flute: true},
    {i: 1, x: 520, y: 1880, h: 1150},
    {i: 2, x: 900, y: 1900, h: 1220, flute: true},
    {i: 7, x: 1280, y: 1890, h: 1160},
    {i: 4, x: 1660, y: 1900, h: 1230},
  ];
  const px = -fr * 22;
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.1]} rot={[-1, 1]} whip="r">
      <Terrace t={t} px={px * 0.3} horizon={760} blurBg={5}>
        <AbsoluteFill style={{transform: `translateX(${px}px)`}}>
          <TerraceCrowd t={t} look={look} guests={guests} tables={[]} />
        </AbsoluteFill>
      </Terrace>
      <Particles t={t} seed="st" count={10} bokeh={6} driftX={-60} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 12. "Inclusive a Lia" — reveal at the bar: emerald dress, heels in her hand. */
export const SLiaReveal: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const L = ev(p, 'L12', 2);
  const glint = kf(fr, [L, L + 3, L + 12], [0, 1, 0]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.22]} origin={[560, 860]} pan={[-30, 20, 0, 0]} pow={1.3} whip="l" punches={[{at: L, amt: 0.04}]}>
      <BarBack t={t} px={fr * 2} />
      <BarCounter top={1380} px={fr * 3} />
      <PlacedLia
        x={560}
        y={1960}
        height={1260}
        light={WARM_LIGHT}
        carryHeels="L"
        heelSwing={Math.sin(t * 4) * 8}
        pose={{shL: -14, elL: 4, shR: 30, elR: -110, headTilt: -4 + Math.sin(t * 2) * 2, facing: -0.2, hipL: -6, hipR: 4}}
        expr={{smile: 0.6, browRaise: 0.3, lookX: 0.5, blink: kf(fr, [L - 2, L, L + 2], [0, 1, 0])}}
      />
      <Svg>
        <Flute x={760} y={1384} s={1.6} />
        <g transform={`translate(${650},${780}) scale(${0.6 + glint})`} opacity={glint}>
          <path d="M 0,-40 L 8,-8 L 40,0 L 8,8 L 0,40 L -8,8 L -40,0 L -8,-8 Z" fill="#fff6d0" />
        </g>
      </Svg>
      <LightRays x={900} y={200} t={t} opacity={0.14} />
      <Particles t={t} seed="lr" count={22} bokeh={9} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 13. "Ela riu do moletom" — Lia laughs, pointing at the hoodie. */
export const SLiaLaugh: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const R = ev(p, 'L12', 4);
  const lk = kf(fr, [R - 3, R + 3], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.14]} rot={[-2, 1.5]} pan={[20, 0, -20, 0]} origin={[540, 800]} whip="r">
      <AbsoluteFill style={{filter: 'blur(14px)'}}>
        <BarBack t={t} px={-fr * 3} />
      </AbsoluteFill>
      <PlacedLia
        x={520}
        y={2600}
        height={2100}
        light={WARM_LIGHT}
        upperOnly
        pose={{...laughBob(t, lk), shR: lerp(10, 130, lk), elR: lerp(-10, -50, lk), shL: -10, elL: lerp(10, 120, lk), facing: 0.15}}
        expr={{smile: lerp(0.4, 1, lk), mouthOpen: lk * (0.55 + 0.2 * Math.sin(t * 22)), blink: lk * 0.9, browRaise: 0.6 * lk, browTilt: 0.3 * lk}}
      />
      <Particles t={t} seed="ll" count={16} bokeh={8} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 14. "Ele riu do salto alto" — Davi laughs back, pointing down at her heels. */
export const SDaviLaugh: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const R = ev(p, 'L12', 8);
  const lk = kf(fr, [R - 3, R + 3], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.16, 1.06]} rot={[2, -1]} pan={[-20, 0, 20, 0]} origin={[540, 820]} whip="l">
      <AbsoluteFill style={{filter: 'blur(14px)'}}>
        <Terrace t={t} px={fr * 3} horizon={1200} />
      </AbsoluteFill>
      <PlacedDavi
        x={560}
        y={2620}
        height={2050}
        light={GALA_LIGHT}
        upperOnly
        pose={{...laughBob(t, lk), shL: lerp(-8, -60, lk), elL: lerp(10, 20, lk), facing: -0.2}}
        expr={{smile: lerp(0.3, 1, lk), mouthOpen: lk * (0.5 + 0.2 * Math.sin(t * 20)), blink: lk * 0.85, browRaise: 0.5 * lk, lookX: -0.4, lookY: 0.4}}
      />
      <Particles t={t} seed="dl" count={14} bokeh={7} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 15. "que ela carregava na mão" — close on the gold heels swinging from her fingers, tilt up to her shrug. */
export const SHeels: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const u = kf(fr, [0, p.dur], [0, 1]);
  const shrug = kf(fr, [p.dur * 0.55, p.dur * 0.8], [0, 1], easeOut);
  const h = 3400;
  // camera tilts up: Lia's feet y moves down
  const y = lerp(3150, 4550, u);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.06]} rot={[3, -2]} pow={1.2}>
      <AbsoluteFill style={{filter: 'blur(16px)'}}>
        <BarBack t={t} px={-fr * 4} />
      </AbsoluteFill>
      <PlacedLia
        x={500}
        y={y}
        height={h}
        light={WARM_LIGHT}
        carryHeels="R"
        heelSwing={Math.sin(t * 5.5) * 16}
        pose={{shR: 18 + shrug * 6, elR: -30, shL: -10 - shrug * 6, elL: 20, bob: -shrug * 18, headTilt: shrug * -8, facing: 0.1}}
        expr={{smile: 0.7, browRaise: shrug * 0.9, halfSmile: shrug * 0.6, lookX: -0.3}}
      />
      <Svg>
        {/* sparkle on the gold */}
        <g transform={`translate(${780},${lerp(1020, 1020 + 1400 * 0, u)})`} opacity={0.6 + 0.4 * Math.sin(t * 9)}>
          <path d="M 0,-26 L 6,-6 L 26,0 L 6,6 L 0,26 L -6,6 L -26,0 L -6,-6 Z" fill="#fff6d0" />
        </g>
      </Svg>
      <Particles t={t} seed="hl" count={20} bokeh={8} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 16. "Ficaram até fechar o bar" — both at the counter; waiter stacks chairs; lights go off; clock fast-forwards. */
export const SClosing: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const u = kf(fr, [0, p.dur], [0, 1], (x) => x);
  const mins = Math.round(lerp(22 * 60 + 40, 26 * 60, u));
  const clock = `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  const stack = Math.floor(u * 5.99);
  return (
    <Rig dur={p.dur} zoom={[1.02, 1.12]} pan={[30, 0, -30, 0]} rot={[-1, 1]} pow={1.2} whip="u">
      <Terrace t={t} px={-fr * 2} horizon={820} night={0.6 + u * 0.4} lightsOff={u * 0.85}>
        {/* waiter + stacked chairs, back */}
        <Svg>
          {Array.from({length: stack}).map((_, i) => (
            <g key={i} transform={`translate(${860},${1270 - i * 34})`}>
              <rect x={-60} y={-10} width={120} height={12} rx={4} fill="#c99a5a" />
              <rect x={-56} y={0} width={8} height={60} fill="#a87a3a" />
              <rect x={48} y={0} width={8} height={60} fill="#a87a3a" />
            </g>
          ))}
          <GalaTable x={300} y={1300} s={0.5} t={t} candle={false} />
        </Svg>
        <PlacedPuppet outfit={WAITER} x={700} y={1290} height={460} light={GALA_LIGHT} pose={{...walk(t * 1.2, 0, 0.5), shR: 150, elR: 20, shL: -150, elL: -20}} expr={{browRaise: 0.2}} />
        <AbsoluteFill style={{background: `rgba(10,10,30,${u * 0.35})`}} />
        {/* the two at the counter */}
        <Svg>
          <rect x={-100} y={1560} width={1300} height={40} rx={10} fill="#2a1710" />
          <rect x={-100} y={1560} width={1300} height={8} fill="#d8a960" />
        </Svg>
        <PlacedDavi x={360} y={2060} height={980} light={GALA_LIGHT} pose={{lean: 4, shR: 40, elR: -80, facing: 0.4, ...laughBob(t, 0.5)}} expr={{smile: 0.8, mouthOpen: 0.3 + 0.2 * Math.sin(t * 9), lookX: 0.8}} />
        <PlacedLia x={720} y={2070} height={940} light={GALA_LIGHT} carryHeels="L" pose={{lean: -4, shR: -30, elR: 80, facing: -0.4, headTilt: -5, bob: Math.sin(t * 4) * 5}} expr={{smile: 0.9, blink: Math.sin(t * 7) > 0.6 ? 1 : 0, lookX: -0.8, mouthOpen: 0.2}} />
        <Svg>
          <rect x={-100} y={1600} width={1300} height={400} fill="#3b2116" />
          <Flute x={480} y={1564} s={1.2} fill={0.1} />
          <Flute x={600} y={1564} s={1.2} fill={0.05} />
        </Svg>
      </Terrace>
      <HudTag x={90} y={540} label="HORA" value={clock} k={clamp(fr / 4)} size={96} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 17. "Ela perguntou de onde ele era" — Lia close, warm light. */
export const SLiaAsk: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const talk = fr > 3 && fr < p.dur - 6 ? Math.abs(Math.sin(t * 17)) * 0.35 : 0;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[1.5, -1]} pan={[-20, 0, 20, 0]} origin={[560, 900]} whip="r">
      <AbsoluteFill style={{filter: 'blur(18px)'}}>
        <Terrace t={t} px={fr * 4} horizon={1100} night={0.9} lightsOff={0.5} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 60%, rgba(255,170,80,0.35), rgba(0,0,0,0) 60%)'}} />
      <PlacedLia
        x={560}
        y={2750}
        height={2200}
        light={WARM_LIGHT}
        upperOnly
        pose={{headTilt: lerp(-2, -9, clamp(fr / 20)), facing: 0.3, shL: -10, elL: 130, shR: 10, elR: -20}}
        expr={{smile: 0.4, mouthOpen: talk, browRaise: 0.7, browAsym: 0.3, lookX: 0.6, blink: fr > 20 && fr < 23 ? 1 : 0}}
      />
      <Particles t={t} seed="la" count={14} bokeh={9} />
      <Finish vignette={0.5} tint="rgba(255,160,90,0.25)" />
    </Rig>
  );
};

/* 18. "Ele disse:" — over her shoulder (bun out of focus) to Davi thinking. */
export const SOts: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.0]} pan={[30, 0, -10, 0]} origin={[640, 900]} whip="l" pow={1.5}>
      <AbsoluteFill style={{filter: 'blur(14px)'}}>
        <Terrace t={t} px={-fr * 3} horizon={1100} night={0.9} lightsOff={0.5} />
      </AbsoluteFill>
      <PlacedDavi
        x={700}
        y={2350}
        height={1750}
        light={WARM_LIGHT}
        upperOnly
        pose={{facing: -0.35, headTilt: lerp(0, 6, clamp(fr / 25)), shR: 40, elR: 100}}
        expr={{lookX: -0.2, lookY: -0.6, smile: 0.3, browAsym: 0.6, halfSmile: lerp(0, 0.7, clamp((fr - 18) / 10))}}
      />
      <AbsoluteFill style={{filter: 'blur(12px)'}}>
        <PlacedLia x={120} y={3300} height={2900} light={WARM_LIGHT} upperOnly pose={{facing: 0.6}} expr={{}} />
      </AbsoluteFill>
      <Finish vignette={0.55} tint="rgba(255,160,90,0.2)" />
    </Rig>
  );
};

/* 19. "depende do dia." — Davi close, half smile, places he has been float in the bokeh. */
export const SDepende: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const D = ev(p, 'L13', 8);
  const talk = fr >= D && fr < D + 20 ? Math.abs(Math.sin(t * 16)) * 0.3 : 0;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.16]} rot={[-1, 1]} origin={[540, 860]} pow={1.3} whip="r">
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#1a1a34 0%,#3a2440 60%,#5a3326 100%)'}} />
      <MemoryPanels t={t} k={kf(fr, [0, 10], [0.2, 0.85])} />
      <PlacedDavi
        x={540}
        y={2780}
        height={2250}
        light={WARM_LIGHT}
        upperOnly
        pose={{facing: -0.15, headTilt: -4}}
        expr={{halfSmile: kf(fr, [D + 10, D + 20], [0.3, 1]), smile: 0.2, browAsym: kf(fr, [D + 12, D + 20], [0, 0.8]), mouthOpen: talk, lookX: -0.5}}
      />
      <Particles t={t} seed="dp" count={16} bokeh={8} />
      <Finish vignette={0.55} tint="rgba(255,160,90,0.2)" />
    </Rig>
  );
};

export {LIA_OUTFIT, DAVI_OUTFIT};
