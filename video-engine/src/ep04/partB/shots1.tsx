import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {Rig, ShotP, SpeedLines, abs, ev} from './rig';
import {
  Arcs,
  BatG,
  BatXray,
  BigHand,
  Chip,
  CutFlash,
  DAVI_OUTFIT,
  DINER_LIGHT,
  Diner,
  EnergyLines,
  Finish,
  HudTag,
  Pup,
  Robber,
  SeatedDavi,
  SoundWord,
  Stamp,
  Stool,
  Street,
  Svg,
  VibeTicks,
  XR_LOOPS,
  clamp,
  easeOut,
  fieldAt,
  kf,
  lerp,
} from './kit';

const chew = (t: number) => ({mouthOpen: Math.sin(t * 14) > 0 ? 0.35 : 0.05, smile: 0.4});
const onAt = (t: number) => fieldAt(t) > 0.5;

/** Davi seated on the stool in front of the counter (diner wide framing). */
const DaviSeat: React.FC<{t: number; pose?: object; expr?: object; x?: number}> = ({t, pose = {}, expr, x = 330}) => (
  <>
    <Svg>
      <Stool x={x} y={1450} s={1} />
    </Svg>
    <SeatedDavi x={x} seatY={1450} floorY={1712} h={640} light={DINER_LIGHT} pose={{facing: 0.35, ...pose}} expr={expr ?? chew(t)} />
  </>
);

/* ================================================================== L8 */

/* "Sexta à noite," — the diner from the street at night, neon LANCHES buzzing, Davi in the window. */
export const SFachada: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const ox = lerp(-40, 0, fr / p.dur);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.16]} origin={[300, 900]} pan={[0, 0, 40, 0]} pow={1.4}>
      <Street t={t} ox={ox} />
      <AbsoluteFill style={{clipPath: `inset(900px ${1080 - 420 - ox}px ${1920 - 1280}px ${Math.max(0, -40 + ox)}px)`}}>
        <Pup outfit={DAVI_OUTFIT} x={200 + ox} y={1420} height={420} light={DINER_LIGHT} pose={{shR: -150, elR: -30, facing: 0.4}} expr={chew(t)} />
      </AbsoluteFill>
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/* "lanchonete." — inside: Davi on a stool, munching fries; warm lamps, neon in the window. */
export const SBalcao: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const arm = Math.sin(t * 7);
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.22]} pan={[60, -20, 0, 0]} origin={[330, 1150]} whip="r">
      <Diner t={t} />
      <DaviSeat t={t} pose={{shR: -160 + arm * 10, elR: -10, shL: -10, elL: 40}} />
      <Svg>
        {/* a fry in his hand */}
        <rect x={360} y={1060 - arm * 10} width={12} height={60} rx={4} fill="#f6c443" stroke="#c98b1c" strokeWidth={2} transform={`rotate(20 366 ${1090 - arm * 10})`} />
      </Svg>
      <Chip x={820} y={620} text="SEXTA · 21:40" k={kf(fr, [2, 8], [0, 1])} color="#ff6fcf" size={38} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "Entra um assaltante" — the door bangs open (bell!), hooded robber steps in; Davi turns, fry frozen. */
export const SPorta: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const door = kf(fr, [0, 5], [0, 1], easeOut);
  const step = kf(fr, [2, p.dur], [0, 1], easeOut);
  const wt = Math.sin(t * 9);
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.18]} origin={[820, 1100]} pan={[0, 0, -30, 0]} shakes={[{at: 1, amp: 14, dur: 10}]}>
      <Diner t={t} door={door} bellSwing={kf(fr, [0, 4, 30], [0, 1, 0.2])} />
      <AbsoluteFill style={{background: 'rgba(255,255,255,0.0)'}} />
      <Robber
        x={lerp(880, 820, step)}
        y={lerp(1640, 1720, step)}
        height={lerp(720, 820, step)}
        light={DINER_LIGHT}
        pose={{hipL: wt * 14, hipR: -wt * 14, knL: Math.max(0, -wt) * 18, knR: Math.max(0, wt) * 18, shL: -10 - wt * 10, elL: 10, shR: 30, elR: -150, bob: -Math.abs(wt) * 10}}
        expr={{smile: 0.3, halfSmile: 0.8, browTilt: -0.8, lookX: -0.6}}
        bat={168}
      />
      <DaviSeat t={t} pose={{shR: -150, elR: -20, facing: 0.8, headTilt: 6}} expr={{eyesWide: kf(fr, [4, 9], [0, 1]), mouthOpen: 0.4, lookX: 1, browRaise: 1}} />
      <SoundWord x={860} y={640} text="PLIM!" k={fr - 1} size={90} rot={8} />
      <CutFlash frames={4} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "taco de alumínio." — close on the shiny aluminum bat; a glint runs along it. */
export const STaco: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const al = ev(p, 'L8', 11);
  const glint = kf(fr, [al - 2, al + 3, al + 10], [0, 1, 0]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[-2, 1]} origin={[620, 800]} whip="u">
      <AbsoluteFill style={{filter: 'blur(6px)'}}>
        <Diner t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(20,10,40,0.35)'}} />
      <Robber x={500} y={2700} height={2100} light={DINER_LIGHT} pose={{shR: 30, elR: -150, shL: -10, elL: 20}} expr={{smile: 0.3, halfSmile: 1, browTilt: -0.9, lookX: 0.5}} bat={168} batGlint={glint} />
      <Chip x={540} y={1240} text="Al · ALUMÍNIO" k={kf(fr, [al, al + 6], [0, 1])} color="#c7ced8" size={50} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "E alumínio não" — textbook insert: a fridge magnet slides past the bat… nothing. */
export const STenta: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const mx = kf(fr, [0, p.dur], [120, 900], (x) => x);
  const q = kf(fr, [p.dur * 0.5, p.dur * 0.7], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.12]} pan={[30, 0, -30, 0]}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #2a1f3d 0%, #0e0a18 80%)'}} />
      <Svg>
        <BatG x={60} y={980} dir={90} s={2.1} />
        {/* horseshoe magnet */}
        <g transform={`translate(${mx},780)`}>
          <path d="M-70,-120 L-70,20 A70,70 0 0,0 70,20 L70,-120 L30,-120 L30,20 A30,30 0 0,1 -30,20 L-30,-120 Z" fill="#e0352b" stroke="#7a1410" strokeWidth={5} />
          <rect x={-70} y={-150} width={40} height={30} fill="#d9dfe6" stroke="#555" strokeWidth={3} />
          <rect x={30} y={-150} width={40} height={30} fill="#d9dfe6" stroke="#555" strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M-50,-150 Q0,${-230 - i * 40} 50,-150`} stroke="#ffd23a" strokeWidth={4} fill="none" strokeDasharray="12 8" opacity={0.8} />
          ))}
        </g>
      </Svg>
      <SoundWord x={540} y={1180} text="?" k={Math.round(q * 20) - 1} size={170} color="#fff" rot={0} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "gruda em ímã." — robber smirks, taps the bat; big ✗ chip: ALUMÍNIO: NÃO MAGNÉTICO. Davi gulps. */
export const SNaoMag: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const tap = Math.sin(t * 10) * 10;
  return (
    <Rig dur={p.dur} zoom={[1.18, 1.08]} origin={[650, 1000]} pan={[0, 0, 20, 0]} pow={1.5}>
      <Diner t={t} />
      <Robber x={760} y={1720} height={860} light={DINER_LIGHT} pose={{shR: 40 + tap, elR: -120, shL: 30, elL: -60}} expr={{smile: 0.6, halfSmile: 1, browAsym: 0.8, lookX: -0.8}} bat={150} />
      <DaviSeat t={t} x={260} pose={{shR: -10, elR: 10, facing: 0.7}} expr={{smile: -0.4, browTilt: 1, mouthOpen: 0.1, lookX: 1, eyesWide: 0.4}} />
      <Stamp x={540} y={700} text="ALUMÍNIO" sub="NÃO MAGNÉTICO ✗" k={fr - 2} size={96} color="#e0352b" rot={-6} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* ================================================================== L9 */

/* "Mas o Davi" — close on Davi: a slow confident smirk, eyes glint. */
export const SMas: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const sm = kf(fr, [2, 12], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} origin={[540, 900]} whip="l">
      <AbsoluteFill style={{filter: 'blur(8px)'}}>
        <Diner t={t} />
      </AbsoluteFill>
      <Pup outfit={DAVI_OUTFIT} x={540} y={2650} height={1900} light={DINER_LIGHT} pose={{facing: 0.15, shR: 20, elR: -10}} expr={{halfSmile: sm, smile: 0.2 * sm, browAsym: 0.7 * sm, browTilt: -0.3 * sm, lookX: 0.6}} />
      <Svg>
        <path d="M0,-30 L6,-6 L30,0 L6,6 L0,30 L-6,6 L-30,0 L-6,-6 Z" transform={`translate(650,${960}) scale(${kf(fr, [8, 12, 18], [0, 1.4, 0])})`} fill="#fff" />
      </Svg>
      <Finish vignette={0.55} grain={0.08} />
    </Rig>
  );
};

/* "liga e desliga o campo" — Davi's palm strobes: yellow arcs ON, dark OFF, LIGA/DESLIGA flicker. */
export const SPisca: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const on = onAt(t);
  const des = ev(p, 'L9', 5);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} rot={[-2, 2]} origin={[540, 1000]} shakes={[{at: 0, amp: 5, dur: p.dur}]}>
      <AbsoluteFill style={{background: on ? '#2a2140' : '#0b0814'}} />
      <AbsoluteFill style={{filter: 'blur(10px)', opacity: on ? 0.7 : 0.35}}>
        <Diner t={t} />
      </AbsoluteFill>
      <BigHand x={700} y={1000} angle={-8} s={1.5} variant="palm" glow={on ? 1.4 : 0} />
      <Arcs x={760} y={980} r={360} k={on ? 1 : 0} frame={fr} n={9} spread={Math.PI * 1.3} dir={0} />
      <EnergyLines x={620} y={1000} r0={200} r1={460} k={on ? 1 : 0} frame={fr} seed="pc" />
      <Chip x={300} y={640} text="LIGA" k={on ? 1 : 0.0001} color="#ffd23a" size={64} />
      {fr >= des && <Chip x={780} y={640} text="DESLIGA" k={on ? 0.0001 : 1} color="#7fb2ff" size={64} />}
      {on && <AbsoluteFill style={{background: 'rgba(255,230,120,0.10)'}} />}
      <Finish vignette={0.6} grain={0.1} />
    </Rig>
  );
};

/* "muito rápido." — wide: strobing arcs from Davi's hand hit the bat; it buzzes; robber confused. */
export const SRapido: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const on = onAt(t);
  const hz = ev(p, 'L9', 9);
  const j = on ? (random(`rp${fr}`) - 0.5) * 8 : 0;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[-30, 0, 30, -20]} origin={[540, 1050]}>
      <Diner t={t} flash={on ? 0.06 : 0} />
      <Robber x={800 + j} y={1720} height={840} light={DINER_LIGHT} pose={{shR: 40, elR: -120, shL: 20, elL: -40}} expr={{smile: -0.2, browTilt: 1, mouthOpen: 0.3, eyesWide: 0.6, lookX: 0.3, lookY: -0.6}} bat={150 + j} />
      <VibeTicks x={900} y={900} w={120} h={260} frame={fr} k={on ? 1 : 0.3} />
      <DaviSeat t={t} x={260} pose={{shR: 95, elR: -5, facing: 0.6}} expr={{halfSmile: 0.8, browTilt: -0.6, lookX: 1}} />
      <Arcs x={500} y={1110} r={500} k={on ? 1 : 0} frame={fr} n={5} spread={0.5} dir={-0.26} />
      <Chip x={540} y={640} text="LIGA·DESLIGA  6× POR SEGUNDO" k={kf(fr, [hz - 4, hz + 2], [0, 1])} color="#ffd23a" size={40} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "Isso cria corrente elétrica" — x-ray of the bat: circular (eddy) currents spin up inside. */
export const SXray1: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const cor = ev(p, 'L9', 12);
  const k = kf(fr, [cor - 4, cor + 6], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[0, 0, -40, 0]} origin={[600, 980]} whip="d">
      <BatXray t={t} k={k} on={onAt(t)} />
      <HudTag x={140} y={600} label="RAIO-X" value="TACO" k={kf(fr, [0, 6], [0, 1])} size={70} color="#bfeaff" />
      <Chip x={600} y={1250} text="CORRENTE DE FOUCAULT" k={kf(fr, [cor + 4, cor + 10], [0, 1])} color="#49e0ff" size={46} />
      <CutFlash frames={4} color="120,220,255" />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* "dentro do alumínio," — tight on the swirling loops, electrons racing around. */
export const SXray2: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const on = onAt(t);
  return (
    <Rig dur={p.dur} zoom={[1.35, 1.55]} origin={[760, 980]} rot={[2, -2]}>
      <BatXray t={t} k={1} on={on} />
      <Svg>
        {Array.from({length: 18}).map((_, i) => {
          const L = XR_LOOPS[i % 3];
          const a = t * 9 + i * 2.1;
          return <circle key={i} cx={L.x + Math.cos(a) * L.rx} cy={980 + Math.sin(a) * L.ry} r={7} fill="#fff" style={{filter: 'drop-shadow(0 0 6px #49e0ff)'}} />;
        })}
      </Svg>
      <Chip x={760} y={1160} text="e⁻  e⁻  e⁻" k={1} color="#49e0ff" size={34} />
      <Finish vignette={0.55} grain={0.1} />
    </Rig>
  );
};

/* "e ele vira um ímã ao contrário." — Davi's field N faces the bat's induced N: they push apart. */
export const SContrario: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const on = onAt(t);
  const ima = ev(p, 'L9', 21);
  const contra = ev(p, 'L9', 23);
  const rev = kf(fr, [ima - 2, ima + 4], [0, 1]);
  const push = kf(fr, [contra, contra + 10], [0, 1], easeOut);
  const pole = (x: number, label: string, col: string, k: number) =>
    k <= 0 ? null : (
      <div style={{position: 'absolute', left: x, top: 980, transform: `translate(-50%,-50%) scale(${lerp(0.5, 1, easeOut(k))})`, opacity: k, width: 150, height: 170, borderRadius: 20, background: col, border: '6px solid #fff', color: '#fff', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 120, textAlign: 'center', lineHeight: '165px', boxShadow: `0 0 30px ${col}`}}>
        {label}
      </div>
    );
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} origin={[540, 980]} shakes={[{at: contra, amp: 12, dur: 12}]}>
      <AbsoluteFill style={{transform: `translateX(${push * 120}px)`}}>
        <BatXray t={t} k={1} on={on} fieldK={0.5} />
      </AbsoluteFill>
      <BigHand x={140} y={1000} angle={0} s={0.9} variant="palm" glow={on ? 1.2 : 0.3} />
      {pole(240, 'N', '#e0352b', 1)}
      {pole(430 + push * 120, 'N', '#e0352b', rev)}
      <Svg>
        <g opacity={rev} style={{filter: 'drop-shadow(0 0 8px #ffd23a)'}}>
          <path d={`M${560 + push * 160},980 l120,0`} stroke="#ffd23a" strokeWidth={18} strokeLinecap="round" />
          <path d={`M${700 + push * 160},980 l-40,-34 l0,68 Z`} fill="#ffd23a" />
        </g>
      </Svg>
      <Chip x={540} y={700} text="ÍMÃ AO CONTRÁRIO: N ⟷ N" k={rev} color="#ff6a6a" size={46} />
      <SoundWord x={760} y={1200} text="PUSH!" k={fr - contra} size={110} color="#ffd23a" rot={-6} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* "É a lei de Lenz." — textbook stamp LEI DE LENZ (real) slams on; Foucault chip stays. */
export const SLenz: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const lenz = ev(p, 'L9', 28);
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} origin={[540, 960]} punches={[{at: lenz, amt: 0.08}]} whip="r">
      <AbsoluteFill style={{opacity: 0.55}}>
        <BatXray t={t} k={1} on={onAt(t)} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(243,234,214,0.18)'}} />
      <Stamp x={540} y={860} text="LEI DE LENZ" sub="(REAL · 1834)" k={fr - lenz + 2} size={120} color="#ffd23a" bg="rgba(20,16,40,0.9)" rot={-5} />
      <Chip x={540} y={1180} text="CORRENTE DE FOUCAULT" k={1} color="#49e0ff" size={46} />
      <Finish vignette={0.5} grain={0.1} />
    </Rig>
  );
};

/* ================================================================== L10 */

/* "O taco é empurrado da" — arcs strike the bat; on "empurrado" it rips out of the robber's hand. */
export const SEmpurra: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const emp = ev(p, 'L10', 3);
  const fly = kf(fr, [emp, p.dur], [0, 1], (x) => x * x);
  const on = onAt(t) || fr < emp;
  const shock = kf(fr, [emp, emp + 4], [0, 1]);
  return (
    <Rig dur={p.dur} zoom={[1.15, 1.25]} origin={[760, 950]} shakes={[{at: emp, amp: 18, dur: 12}]} punches={[{at: emp, amt: 0.1}]}>
      <Diner t={t} flash={on && fr < emp + 6 ? 0.08 : 0} />
      <Robber
        x={760}
        y={1720}
        height={860}
        light={DINER_LIGHT}
        pose={{shR: lerp(40, 120, shock), elR: lerp(-120, -20, shock), shL: lerp(20, -40, shock), elL: -40, lean: -6 * shock}}
        expr={{eyesWide: shock, mouthOpen: 0.2 + 0.6 * shock, browRaise: shock, smile: -0.2}}
        bat={fr < emp ? 150 : undefined}
      />
      {fr >= emp && (
        <Svg>
          <BatG x={lerp(1000, 1300, fly)} y={lerp(860, 500, fly)} dir={150 + fly * 600} s={0.86} />
        </Svg>
      )}
      <Arcs x={-40} y={1000} r={980} k={fr < emp + 4 ? (on ? 1 : 0.2) : 0} frame={fr} n={4} spread={0.25} dir={-0.12} />
      <SoundWord x={880} y={640} text="TUNG!" k={fr - emp} size={110} rot={10} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "mão do cara e voa" — the bat spins through the air over the diner (tracking whip). */
export const SVoa: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const u = fr / p.dur;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.05]} pan={[0, 0, 0, 0]} whip="l" rot={[-4, 4]}>
      <AbsoluteFill style={{transform: `translateX(${lerp(200, -200, u)}px)`, filter: 'blur(4px)'}}>
        <Diner t={t} />
      </AbsoluteFill>
      <SpeedLines k={0.7} t={t} />
      <Svg>
        <g style={{filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.6))'}}>
          <BatG x={lerp(780, 320, u)} y={lerp(760, 960, u) - Math.sin(u * Math.PI) * 140} dir={fr * 38} s={1.2} />
        </g>
      </Svg>
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};

/* "longe." — CLANG into the napkin holder: napkins explode, holder crumples. */
export const SCrash: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const hit = 4;
  const a = fr - hit;
  return (
    <Rig dur={p.dur} zoom={[1.5, 1.42]} origin={[455, 1080]} shakes={[{at: hit, amp: 26, dur: 14}]} punches={[{at: hit, amt: 0.12}]}>
      <Diner t={t} holderDent={a >= 0 ? 0.8 : 0} />
      <Svg>
        {a < 0 ? (
          <BatG x={lerp(140, 380, fr / hit)} y={lerp(900, 1050, fr / hit)} dir={fr * 38 + 30} s={0.8} />
        ) : (
          <BatG x={340 - a * 2} y={1105} dir={100 + Math.sin(a * 0.8) * 6 * Math.exp(-a / 8)} s={0.8} />
        )}
        {a >= 0 &&
          Array.from({length: 16}).map((_, i) => {
            const q = (k: string) => random(`nap${i}${k}`);
            const ang = -Math.PI * (0.1 + q('a') * 0.8);
            const v = 14 + q('v') * 18;
            const x = 455 + Math.cos(ang) * v * a;
            const y = 1050 + Math.sin(ang) * v * a + 0.6 * a * a;
            return <rect key={i} x={-26} y={-20} width={52} height={40} fill="#fbf8f2" stroke="#d6cfc0" strokeWidth={2} transform={`translate(${x},${y}) rotate(${q('r') * 360 + a * 20 * (q('w') - 0.5)})`} />;
          })}
      </Svg>
      <SoundWord x={560} y={820} text="CLANG!" k={a} size={130} color="#ffd23a" rot={-8} />
      <CutFlash at={hit} frames={4} />
      <Finish vignette={0.5} grain={0.08} />
    </Rig>
  );
};
