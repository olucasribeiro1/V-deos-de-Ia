import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import {Finish} from '../../scenes/common';
import {Flash} from '../../fx/Rastro';
import {ReadTag} from '../ReadTag';
import {CAPTION_FONT} from '../../lib/fonts';
import {Rig, ShotP, abs, ev} from './rig';
import {DAVI_OUTFIT, Glitch, HOME_LIGHT, Pup, SeatedDavi, Svg} from './kit';
import {HomeRoom, SideTable, Sofa, Towel, WaterGlass} from './sets';
import {PlacedCat} from './Cat';

/** Steam wisps rising from the towel. */
const Steam: React.FC<{x: number; y: number; t: number; s?: number; k?: number}> = ({x, y, t, s = 1, k = 1}) => (
  <Svg>
    {[-1, 0, 1].map((i) => {
      const ph = (t * 0.9 + i * 0.33 + 1) % 1;
      const yy = y - ph * 160 * s;
      return (
        <path
          key={i}
          d={`M ${x + i * 50 * s},${yy} q ${18 * s},${-25 * s} 0,${-50 * s} q ${-18 * s},${-25 * s} 0,${-50 * s}`}
          stroke="#fff"
          strokeWidth={8 * s}
          fill="none"
          strokeLinecap="round"
          opacity={(1 - ph) * 0.55 * k}
        />
      );
    })}
  </Svg>
);

/** Davi on the couch with the towel (shared by several shots). */
const CouchDavi: React.FC<{x: number; seatY: number; floorY: number; h: number; t: number; pose?: object; expr?: object; steam?: number; bob?: number}> = ({x, seatY, floorY, h, t, pose = {}, expr = {}, steam = 1, bob = 0}) => {
  const k = h / 1000;
  const headTop = seatY + (-884 - 122 + 480 + bob) * k;
  return (
    <>
      <SeatedDavi x={x} seatY={seatY} floorY={floorY} h={h} light={HOME_LIGHT} pose={{shL: -14, elL: 40, shR: 14, elR: -40, bob, ...pose}} expr={expr} />
      <Towel x={x} y={headTop + 40 * k} w={300 * k} rot={-4} />
      <Steam x={x} y={headTop + 10 * k} t={t} s={k * 1.1} k={steam} />
    </>
  );
};

/* 25. "Moral da história:" — home, Davi on the couch with a towel on his head, cooling down. */
export const SCasa: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const sigh = kf(fr, [6, 16, 26], [0, 1, 0.6]);
  return (
    <Rig dur={p.dur} zoom={[1.18, 1.06]} pan={[0, -30, 0, 0]} rot={[-1, 0.5]} pow={1.6} whip="d">
      <HomeRoom t={t} floorY={1380} />
      <Sofa x={540} y={1600} w={900} />
      <CouchDavi x={470} seatY={1330} floorY={1680} h={820} t={t} bob={sigh * 10} expr={{blink: 0.75, smile: 0.35 * sigh, mouthOpen: 0.15 * sigh}} />
      <SideTable x={930} y={1690} s={1.0} />
      <WaterGlass x={900} y={1392} h={110} />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/* 26. "QI infinito te salva de tudo." — smug: hands behind the head, eyes closed. */
export const STudo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const up = kf(fr, [0, 8], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[20, 0, -20, -10]} rot={[1, -1]} whip="l" origin={[540, 900]}>
      <HomeRoom t={t} floorY={1500} px={-80} />
      <Sofa x={560} y={1800} w={1200} />
      <CouchDavi
        x={540}
        seatY={1480}
        floorY={1900}
        h={1150}
        t={t}
        pose={{shL: lerp(-14, -150, up), elL: lerp(40, -120, up), shR: lerp(14, 150, up), elR: lerp(-40, 120, up), headTilt: -4 * up}}
        expr={{blink: 0.9, smile: 0.85, browRaise: 0.4}}
      />
      <Finish vignette={0.45} grain={0.08} />
    </Rig>
  );
};

/* 27. "salva de tudo." — lightning checklist: AGENTES ✓ CHEFE ✓ MULTIDÃO ✓. */
export const SCheck: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const items = ['AGENTES', 'CHEFE', 'MULTIDÃO'];
  return (
    <Rig dur={p.dur} zoom={[1.06, 1.0]} rot={[-2, 0]} whip="u">
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1d3d74 0%, #0b1226 70%)'}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 60px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 60px)'}} />
      {items.map((it, i) => {
        const at = 1 + i * 7;
        const k = kf(fr, [at, at + 5], [0, 1], easeOut);
        const c = kf(fr, [at + 3, at + 6], [0, 1], easeOut);
        return (
          <div
            key={it}
            style={{
              position: 'absolute',
              left: 150,
              top: 640 + i * 200,
              opacity: k,
              transform: `translateX(${(1 - k) * -120}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 40,
            }}
          >
            <div style={{width: 130, height: 130, borderRadius: 24, border: '8px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)'}}>
              <svg width={110} height={110} viewBox="0 0 110 110">
                <path d="M 18,58 L 46,86 L 96,22" stroke="#3ee07a" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={140} strokeDashoffset={140 * (1 - c)} />
              </svg>
            </div>
            <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 110, color: '#fff', letterSpacing: 2, textShadow: '0 6px 0 rgba(0,0,0,0.4)'}}>{it}</div>
          </div>
        );
      })}
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 28. "Menos do teu gato." — reveal: the cat on the side table, staring at Davi. */
export const SGato: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const meow = kf(fr, [7, 10, 16], [0, 1, 0]);
  return (
    <Rig dur={p.dur} zoom={[1.22, 1.08]} pan={[-60, 0, 0, 0]} origin={[700, 1000]} rot={[2, 0]} pow={2.2} whip="r" punches={[{at: 8, amt: 0.05}]}>
      <HomeRoom t={t} floorY={1460} px={-260} />
      <SideTable x={720} y={1880} s={1.6} />
      <PlacedCat x={680} y={1412} height={700} t={t} lookX={-0.8} dilate={0.75} meow={meow} tilt={meow * -4} />
      <WaterGlass x={960} y={1412} h={170} />
      {/* Davi, foreground left, side-eye */}
      <AbsoluteFill style={{filter: 'blur(5px)'}}>
        <Pup outfit={DAVI_OUTFIT} x={60} y={2700} height={2100} upperOnly light={HOME_LIGHT} pose={{facing: 0.6}} expr={{lookX: 1, browAsym: 0.7, smile: -0.3}} />
        <Towel x={60} y={2700 + (-884 - 122 + 480) * 2.1 + 80} w={620} rot={-4} />
      </AbsoluteFill>
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 29. "Esse, nem o Davi consegue ler." — HUD tries to read the cat: GATO: ERRO ??? */
export const SErro: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const k = 1500 / 520;
  const cy = 1760 - 372 * k;
  const g = kf(fr, [2, 4, 9, 12, 20, 22, 26], [0, 1, 0.3, 0.9, 0.2, 0.8, 0.4], (x) => x);
  const jit = (random(`ej${Math.floor(fr / 2)}`) - 0.5) * 30 * g;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[-1, 1]} pow={1.3} shakes={[{at: 2, amp: 10, dur: 10}]}>
      <AbsoluteFill style={{filter: 'blur(12px)'}}>
        <HomeRoom t={t} floorY={1700} px={-200} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${jit}px)`}}>
        <PlacedCat x={540} y={1760} height={1500} t={t} lookX={-0.2} dilate={1} />
      </AbsoluteFill>
      {/* reticle brackets trying to lock */}
      <Svg>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sy) => {
            const bx = 540 + sx * (330 + Math.sin(fr * 1.7) * 30);
            const by = cy + 20 + sy * (230 + Math.cos(fr * 1.3) * 25);
            return <path key={`${sx}${sy}`} d={`M ${bx},${by - sy * 70} L ${bx},${by} L ${bx - sx * 70},${by}`} stroke="#ff3b3b" strokeWidth={8} fill="none" opacity={0.9} />;
          }),
        )}
      </Svg>
      <ReadTag label="GATO:" text="ERRO ???" error x={80} y={1170} tx={540 + 54 * k} ty={cy} from={3} scale={1.5} />
      <Glitch k={g} frame={fr} />
      <Flash k={kf(fr, [2, 3, 7], [0, 0.35, 0], (x) => x)} color="255,60,60" />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/* 30. "consegue ler." — staring at Davi, the cat pushes the glass off the table. Crash. */
export const SCopo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const catX = 600;
  const top = 1320;
  const ck = 640 / 520;
  const paw = kf(fr, [1, 8, 13], [0, 1, 1.25], (x) => x);
  const tip = catX + lerp(52, 240, paw) * ck + 30;
  const gx0 = 900;
  const slide = Math.max(gx0, tip);
  const edge = 975;
  const falling = fr >= 13;
  const fy = falling ? top + Math.min(470, 0.5 * 20 * Math.pow(fr - 13, 2) * 1.0) : top;
  const shatter = fr >= 20 ? clamp((fr - 20) / 8) : 0;
  const rot = falling ? Math.min(160, (fr - 13) * 22) : 0;
  return (
    <Rig dur={p.dur} zoom={[1.08, 1.14]} pan={[0, 0, -20, -20]} rot={[-0.5, 0.5]} shakes={[{at: 20, amp: 16, dur: 8}]} punches={[{at: 20, amt: 0.05}]}>
      <HomeRoom t={t} floorY={1440} px={-300} />
      <SideTable x={720} y={1790} s={1.55} />
      <PlacedCat x={catX} y={top} height={640} t={t} lookX={-1} dilate={0.5} paw={Math.min(1.2, paw)} pawY={-10} blink={0.15} />
      {shatter > 0 ? (
        <WaterGlass x={edge + 40} y={1792} h={160} shatter={shatter} />
      ) : (
        <WaterGlass x={falling ? edge + (fr - 13) * 9 : slide} y={fy} h={160} rot={rot} />
      )}
      <Pup outfit={DAVI_OUTFIT} x={-40} y={2350} height={1500} upperOnly light={HOME_LIGHT} pose={{facing: 0.6}} expr={{lookX: 1, eyesWide: clamp((fr - 14) / 4) * 0.8, mouthOpen: clamp((fr - 16) / 4) * 0.4, browRaise: 0.6}} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 31. "Segue aí pra mais ciência absurda," — Davi and the cat side by side, looking at camera. Davi sighs. */
export const SFinal: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const S = 28;
  const sigh = kf(fr, [S - 4, S + 4, S + 16], [0, 1, 0.3]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[0, 0, 0, -10]} pow={1.2} origin={[540, 1000]}>
      <HomeRoom t={t} floorY={1380} />
      <Sofa x={540} y={1600} w={900} />
      <CouchDavi x={420} seatY={1330} floorY={1680} h={820} t={t} steam={0.5} bob={sigh * 14} expr={{blink: 0.35 + sigh * 0.4, mouthOpen: sigh * 0.25, browTilt: 0.4, smile: -0.1}} pose={{headTilt: sigh * 4}} />
      <PlacedCat x={740} y={1336} height={430} t={t} lookX={0} dilate={0.3} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* 32. "só que de verdade." — closer two-shot; the cat slow-blinks. Hard cut to black at the end. */
export const SPiscada: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const blink = kf(fr, [8, 16, 20, 28], [0, 1, 1, 0]);
  return (
    <Rig dur={p.dur} zoom={[1.55, 1.68]} origin={[580, 1000]} pan={[0, 40, 0, 40]} pow={1}>
      <HomeRoom t={t} floorY={1380} />
      <Sofa x={540} y={1600} w={900} />
      <CouchDavi x={420} seatY={1330} floorY={1680} h={820} t={t} steam={0.4} bob={6} expr={{blink: 0.5, lookX: fr > 6 && fr < 22 ? 0.9 : 0, browTilt: 0.4, browAsym: fr > 6 && fr < 22 ? 0.6 : 0}} pose={{headTilt: 3}} />
      <PlacedCat x={740} y={1336} height={430} t={t} blink={blink} dilate={0.3} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

