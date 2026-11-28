import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PlacedDavi} from '../characters/Davi';
import {Bust} from '../ep02qi/characters';
import {PlacedStudent} from '../ep03/characters';
import {PlacedPuppet} from '../characters/Puppet';
import {Actor, BIA_OUTFIT, DAY, KADU_OUTFIT, MATEUS_OUTFIT, NIGHT, ARENA, FIRE, PlacedKadu, PlacedMateus, TEACHER_OUTFIT} from './cast';
import {Banana, FireBall, FlameJet, TNT} from './props';
import {AcademyCourtyard, Arena, Classroom, DaviRoom, Desk, LivingRoom, Lockers, Svg} from './sets';
import {Big, BigChip, Chip, Confetti, Cricket, CutFlash, Finish, HudTag, Panel, Rig, ShotP, Shockwave, SoundWord, SpeedLines, Stamp, YEL, appear, clamp, easeOut, ev, handAt, kf, lerp, useShot} from './kit';

/* =================================================================== L1 — hook */

/** "O Davi..." — Davi strikes a pose in the living room, ready for his episode. */
export const S01DaviPose: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const pose = kf(fr, [0, 10], [0, 1], easeOut);
  return (
    <Rig s0={1.12} s1={1.02} y0={-30}>
      <LivingRoom px={260} />
      <PlacedDavi x={540} y={1700} height={1250} light={DAY} pose={{shR: lerp(7, 150, pose), elR: lerp(-6, -30, pose), shL: lerp(-7, -60, pose), elL: lerp(6, -90, pose), facing: 0.1, bob: Math.sin(t * 3) * 4}} expr={{smile: 0.8, halfSmile: 0.4, browRaise: 0.5}} />
      <Chip x={540} y={560} text="EP06 · ESTRELANDO: DAVI" k={appear(fr, 4)} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "aliás, dessa vez não é o Davi. É o irmão dele, o Mateus." — PARA!, camera slides to Mateus on the sofa; Davi leaves sulking. */
export const S02Switch: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const slide = kf(fr, [8, 26], [0, 1]);
  const px = lerp(260, -380, slide);
  const leave = kf(fr, [ev(p, 'L1', 9), ev(p, 'L1', 9) + 30], [0, 1]);
  const intro = ev(p, 'L1', 13);
  return (
    <Rig s0={1.04} s1={1.0} impacts={[{at: 0, amp: 14, zoom: 0.04}]}>
      <LivingRoom px={px} />
      <PlacedDavi x={540 + (px - 260) * 0.95 - leave * 500} y={1700} height={1250} light={DAY} pose={{shR: 20, elR: -10, shL: -20, elL: 10, facing: -0.5, bob: leave > 0 ? -Math.abs(Math.sin(t * 9)) * 10 : 0}} expr={{smile: -0.6, browTilt: -0.6, lookX: -0.6}} />
      <PlacedMateus x={900 + (px + 380) * 0.95} y={1560} height={1000} light={DAY} pose={{hipL: -80, knL: 80, hipR: -76, knR: 82, shR: lerp(10, 150, appear(fr, intro, 6)), elR: -20, shL: -20, elL: 30, facing: -0.2, bob: 230}} expr={{smile: 0.6, eyesWide: 0.2, browRaise: 0.4}} />
      <Stamp x={540} y={700} text="PARA!" k={fr - 1} size={130} />
      <Chip x={540} y={1290} text="MATEUS · IRMÃO DO DAVI" k={appear(fr, intro)} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "Ele tem o poder de controlar bananas." — banana on the table rises and spins, zoom out to Mateus' hand. */
export const S03Levitate: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const lift = kf(fr, [0, 18], [0, 1], easeOut);
  const zoomOut = kf(fr, [ev(p, 'L1', 19), p.dur], [0, 1]);
  return (
    <Rig s0={lerp(2.0, 1.15, zoomOut)} s1={lerp(2.0, 1.0, zoomOut)} oy={900} ease={(x) => x}>
      <LivingRoom px={-380} />
      <Svg>
        <rect x={280} y={1240} width={520} height={30} rx={8} fill="#8a5a36" />
        <rect x={300} y={1270} width={30} height={260} fill="#6b4428" />
        <rect x={750} y={1270} width={30} height={260} fill="#6b4428" />
        <ellipse cx={540} cy={1238} rx={90 * (1 - lift * 0.5)} ry={14} fill="#000" opacity={0.25} />
        <Banana x={540} y={lerp(1210, 960, lift) + Math.sin(t * 4) * 10} s={1.1} rot={t * 140 * lift} glow={lift} t={t} ripe={4} />
      </Svg>
      <PlacedMateus x={980} y={1800} height={1200} light={DAY} pose={{shL: -80, elL: -10, facing: -0.4}} expr={{browTilt: -0.4, lookX: -0.7, smile: 0.2}} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "Sim, bananas." — Mateus bust, looks at the camera, awkward. */
export const S04SimBananas: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.08}>
      <LivingRoom px={-520} />
      <AbsoluteFill style={{background: 'rgba(240,200,140,0.4)'}} />
      <Bust outfit={MATEUS_OUTFIT} cx={540} cy={900} r={250} light={DAY} pose={{headTilt: -6, shR: 60, elR: -120}} expr={{smile: 0.3, halfSmile: 0.7, browRaise: 0.6, browAsym: 0.3, lookX: 0, lookY: 0, blink: fr > 20 && fr < 24 ? 1 : 0}} />
      <Svg>
        <Banana x={760} y={1260} s={0.9} rot={-30 + Math.sin(t * 6) * 8} ripe={4} />
      </Svg>
      <Cricket x={140} y={1420} fr={fr} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "Com precisão de milímetro." — banana threads through a ring and stops exactly on a ruler mark. */
export const S05Precision: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const k = kf(fr, [0, 22], [0, 1], easeOut);
  const bx = lerp(-150, 540, k);
  return (
    <Rig s0={1.1} s1={1.0}>
      <Panel bg="radial-gradient(ellipse 80% 60% at 50% 50%, #3a2f12, #0f0c04)" />
      <Svg>
        <rect x={140} y={1180} width={800} height={90} rx={8} fill="#f3e2a8" stroke="#8a6a24" strokeWidth={5} />
        {Array.from({length: 41}).map((_, i) => (
          <line key={i} x1={160 + i * 19} y1={1180} x2={160 + i * 19} y2={1180 + (i % 10 === 0 ? 50 : i % 5 === 0 ? 36 : 22)} stroke="#4a3a10" strokeWidth={3} />
        ))}
        <line x1={540} y1={980} x2={540} y2={1280} stroke="#ff4a4a" strokeWidth={4} strokeDasharray="12 10" />
        <ellipse cx={360} cy={1040} rx={34} ry={110} fill="none" stroke="#c9ced8" strokeWidth={14} />
        <Banana x={bx} y={1040 + Math.sin(fr / 3) * 3 * (1 - k)} s={0.7} rot={0} glow={0.8} t={t} />
        <ellipse cx={360} cy={1040} rx={34} ry={110} fill="none" stroke="#e8ecf2" strokeWidth={14} strokeDasharray="0 180 400" />
      </Svg>
      <HudTag x={540} y={720} label="PRECISÃO" value="1 mm" k={appear(fr, 20)} align="center" color={YEL} size={90} />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== L2 — pedido */

export const S06Pedido: React.FC<ShotP> = () => {
  const {frame: fr} = useShot();
  const bob = Math.sin(fr / 6) * 6;
  const c = (i: number) => appear(fr, 6 + i * 10, 6);
  const comments = ['Faz o Davi controlando bananas 🍌', 'Poder de banana kkkk', 'BANANA!! Por favor 🙏'];
  return (
    <Rig s0={1.0} s1={1.06}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #2b3a7a 0%, #141a3a 72%)'}} />
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${appear(fr, 0, 6)})`}}>
        <span style={{display: 'inline-block', padding: '16px 34px', borderRadius: 28, background: YEL, color: '#141a3a', fontFamily: 'Roboto Condensed', fontWeight: 700, fontSize: 62, boxShadow: '0 10px 28px rgba(0,0,0,0.4)'}}>📩 A PEDIDO DOS SEGUIDORES</span>
      </div>
      {comments.map((txt, i) => (
        <div key={i} style={{position: 'absolute', left: 110 + (i % 2) * 40, right: 110 - (i % 2) * 40, top: 500 + i * 230 + bob, background: '#fff', borderRadius: 26, padding: '20px 28px', boxShadow: '0 10px 28px rgba(0,0,0,0.4)', fontFamily: 'Roboto Condensed', color: '#141a3a', transform: `scale(${c(i)})`, opacity: c(i)}}>
          <div style={{fontSize: 26, fontWeight: 700, opacity: 0.6}}>@seguidor{i + 1} · comentou</div>
          <div style={{fontSize: 40, fontWeight: 700, marginTop: 4}}>{txt}</div>
          <div style={{fontSize: 28, marginTop: 6, color: '#e0245e'}}>♥ curtido</div>
        </div>
      ))}
      <PlacedMateus x={540} y={2150} height={1150} light={DAY} pose={{shR: 40, elR: -110, facing: 0.15}} expr={{smile: 0.7, browRaise: 0.4}} />
    </Rig>
  );
};

/* =================================================================== L3 — school */

/** "Na escola, todo mundo tem poder irado:" — courtyard, students doing powers (sparks, levitating books). */
export const S07School: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.08} s1={1.0} x0={40} x1={-40}>
      <AcademyCourtyard t={t} px={-fr * 2} />
      <PlacedStudent seed={2} x={200} y={1560} height={520} light={DAY} pose={{shR: 150, elR: -10}} expr={{smile: 0.8}} />
      <PlacedStudent seed={5} x={850} y={1600} height={560} light={DAY} pose={{shL: -140, elL: 0, shR: 140, elR: 0}} expr={{smile: 1, mouthOpen: 0.4}} flip />
      <Svg>
        {Array.from({length: 3}).map((_, i) => (
          <rect key={i} x={760 + i * 40} y={900 - Math.sin(t * 3 + i) * 30 - i * 60} width={90} height={22} rx={4} fill={['#d9534f', '#4f8fd9', '#5cb85c'][i]} />
        ))}
        {Array.from({length: 10}).map((_, i) => (
          <circle key={i} cx={260 + Math.cos(t * 6 + i) * 60} cy={900 + Math.sin(t * 6 + i) * 60} r={8} fill="#7fd8ff" opacity={0.8} />
        ))}
      </Svg>
      <Finish vignette={0.3} grain={0.05} />
    </Rig>
  );
};

/** "o Kadu solta fogo," — Kadu blasts a flame jet up, students cheer. */
export const S08KaduFire: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const jet = kf(fr, [2, 8], [0, 1], easeOut);
  const pose = {shR: 160, elR: -10, shL: -30, elL: 20, facing: 0.2};
  const [hx, hy] = handAt(540, 1750, 1300, pose, 'R');
  return (
    <Rig s0={1.15} s1={1.02} impacts={[{at: 3, amp: 16, zoom: 0.05}]}>
      <AcademyCourtyard t={t} px={-200} />
      <AbsoluteFill style={{background: `rgba(255,120,40,${0.18 * jet})`}} />
      <PlacedKadu x={540} y={1750} height={1300} light={FIRE} pose={pose} expr={{halfSmile: 1}} />
      <Svg>
        <FlameJet x0={hx} y0={hy} ang={-80} L={lerp(0, 900, jet)} t={t} w={120} />
      </Svg>
      <HudTag x={540} y={1120} label="KADU" value="🔥 1.000 °C" k={appear(fr, 6)} align="center" color="#ffb36a" size={90} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "a Bia voa." — Bia flies across the sky. */
export const S09BiaFly: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const x = lerp(-200, 1250, fr / 26);
  return (
    <Rig s0={1.0} s1={1.06} r0={-2} r1={2}>
      <AbsoluteFill style={{background: 'linear-gradient(#4aa6ec,#bfe6ff)'}} />
      <SpeedLines t={t} dir="left" count={30} opacity={0.35} />
      <Actor outfit={BIA_OUTFIT} x={x} y={1100} height={900} rot={-70} pivotY={-500} light={DAY} pose={{shL: 170, elL: 0, shR: 170, elR: 0, hipL: -6, hipR: 6}} expr={{smile: 0.9, mouthOpen: 0.3}} />
      <HudTag x={540} y={1120} label="BIA" value="VOA ✈" k={appear(fr, 3)} align="center" color="#9fe0ff" size={90} />
      <Finish vignette={0.25} grain={0.05} />
    </Rig>
  );
};

/** "O Mateus?" — spotlight on Mateus in the courtyard. */
export const S10MateusQ: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.12}>
      <AcademyCourtyard t={t} px={-400} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 26%, rgba(0,0,0,0.6) 50%)'}} />
      <PlacedMateus x={540} y={1700} height={1200} light={DAY} pose={{shR: 20, elR: -30, shL: -20, elL: 30}} expr={{smile: 0.4, browRaise: 0.6, eyesWide: 0.3}} />
      <Big x={540} y={600} text="?" k={appear(fr, 2)} size={260} color={YEL} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "Gira uma banana." — banana spins on his finger. cri cri. */
export const S11Spin: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const pose = {shR: 120, elR: 40, shL: -10, elL: 10, facing: 0.2};
  const [hx, hy] = handAt(540, 1800, 1250, pose, 'R');
  return (
    <Rig s0={1.06} s1={1.12}>
      <AcademyCourtyard t={t} px={-400} />
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.25)'}} />
      <PlacedMateus x={540} y={1800} height={1250} light={DAY} pose={pose} expr={{smile: 0.5, halfSmile: 0.5, lookX: 0.6, lookY: -0.6}} />
      <Svg>
        <Banana x={hx} y={hy - 70} s={0.8} rot={t * 720} glow={0.5} t={t} />
      </Svg>
      <Cricket x={130} y={700} fr={fr} />
      <HudTag x={540} y={1120} label="PODER DO MATEUS" value="🍌 ???" k={appear(fr, 4)} align="center" color={YEL} size={90} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== L4 — nickname */

/** "Ganhou apelido na hora:" — locker graffiti being written. */
export const S12Locker: React.FC<ShotP> = () => {
  const {frame: fr} = useShot();
  return (
    <Rig s0={1.15} s1={1.0} x0={-60} x1={20}>
      <Lockers px={-20} paint={kf(fr, [2, 24], [0, 1])} />
      <Finish vignette={0.35} grain={0.06} />
    </Rig>
  );
};

/** "Bananinha." — students pointing and laughing at Mateus. */
export const S13Laugh: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const hop = (i: number) => -Math.abs(Math.sin(t * 10 + i)) * 20;
  return (
    <Rig s0={1.0} s1={1.08} impacts={[{at: 2, amp: 8}]}>
      <Lockers paint={1} px={-120} />
      <PlacedStudent seed={3} x={180} y={1720} height={1000} light={DAY} pose={{shR: 95, elR: 0, bob: hop(1)}} expr={{smile: 1, mouthOpen: 0.7, blink: 0.8}} />
      <PlacedStudent seed={7} x={900} y={1740} height={1020} light={DAY} pose={{shL: -95, elL: 0, shR: 30, elR: -100, bob: hop(2)}} expr={{smile: 1, mouthOpen: 0.8, blink: 0.9}} flip />
      <PlacedMateus x={540} y={1880} height={1150} light={DAY} pose={{shL: -10, elL: 20, shR: 10, elR: -20, headTilt: 8}} expr={{smile: -0.6, browTilt: 0.8, lookY: 0.6}} />
      <SoundWord x={250} y={560} text="HAHA" k={fr - 2} size={130} rot={-12} />
      <SoundWord x={830} y={660} text="KKKK" k={fr - 6} size={120} rot={10} />
      <Finish vignette={0.35} grain={0.06} />
    </Rig>
  );
};

/** "Até a professora riu." — teacher at the board, trying not to laugh. */
export const S14Teacher: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const giggle = Math.abs(Math.sin(t * 14)) * 8;
  return (
    <Rig s0={1.0} s1={1.1}>
      <Classroom px={0} />
      <PlacedPuppet outfit={TEACHER_OUTFIT} x={540} y={1650} height={1150} light={DAY} pose={{shR: 40, elR: -140, shL: -20, elL: 30, bob: -giggle, headTilt: -6}} expr={{smile: 0.9, blink: 0.85, browTilt: 0.5}} />
      <SoundWord x={800} y={520} text="pff…" k={fr - 4} size={110} rot={8} color="#fff" />
      <Finish vignette={0.35} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== L5 — tournament round 1 */

const TourneyScreen: React.FC<{text: string; sub?: string}> = ({text, sub}) => (
  <g>
    <text x={540} y={-560} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={110} fill={YEL}>{text}</text>
    {sub && <text x={540} y={-430} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={70} fill="#fff">{sub}</text>}
  </g>
);

/** "No Torneio de Poderes," — arena wide, crane down from the big screen. */
export const S15Arena: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const vy = kf(fr, [0, 30], [-700, -120]);
  return (
    <Rig s0={1.0} s1={1.04}>
      <Arena t={t} viewY={vy} excite={0.7} screen={<TourneyScreen text="TORNEIO DE PODERES" sub="RODADA 1" />} />
      <Confetti age={fr} n={60} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "ele lança uma banana verde" — Mateus throws a green banana (left → right). */
export const S16Throw: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const throwK = kf(fr, [4, 10], [0, 1], easeOut);
  const pose = {shR: lerp(170, 70, throwK), elR: lerp(-40, 0, throwK), shL: -30, elL: 20, lean: lerp(-6, 8, throwK), facing: 0.6};
  const [hx, hy] = handAt(380, 1800, 1150, pose, 'R');
  const fly = clamp((fr - 10) / 12);
  return (
    <Rig s0={1.05} s1={1.0} x0={-30} x1={30}>
      <Arena t={t} viewY={-80} excite={0.4} />
      <PlacedMateus x={380} y={1800} height={1150} light={ARENA} pose={pose} expr={{browTilt: -0.6, smile: 0.2, lookX: 0.8}} />
      <Svg>
        <Banana x={fr < 10 ? hx : lerp(hx, 1300, fly)} y={fr < 10 ? hy : hy - Math.sin(fly * Math.PI) * 120} s={0.75} rot={fr < 10 ? 0 : fr * 40} ripe={1} />
      </Svg>
      <Chip x={540} y={1290} text="BANANA VERDE 🟢" k={appear(fr, 6)} color="#6cbf55" />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "no Kadu. Ela quica na testa." — BONK on Kadu's forehead, he doesn't even blink. */
export const S17Bonk: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const hit = ev(p, 'L5', 12);
  const inK = clamp(fr / Math.max(1, hit));
  const after = Math.max(0, fr - hit);
  const bx = fr < hit ? lerp(-100, 520, inK) : 520 - after * 18;
  const by = fr < hit ? lerp(900, 640, inK) : 640 - after * 26 + after * after * 1.6;
  return (
    <Rig s0={1.0} s1={1.06} impacts={[{at: hit, amp: 10}]}>
      <Arena t={t} viewY={-200} excite={0.3} zoom={1.4} blur={6} />
      <Bust outfit={KADU_OUTFIT} cx={560} cy={880} r={260} light={ARENA} pose={{facing: -0.2}} expr={{halfSmile: 1, browAsym: 0.6, browTilt: -0.4, blink: 0.25, lookX: -0.3}} />
      <Svg>
        <Banana x={bx} y={by} s={0.9} rot={fr * 30} ripe={1} />
      </Svg>
      <SoundWord x={420} y={560} text="BONK!" k={fr - hit} size={150} rot={-10} />
      <BigChip x={540} y={1240} label="BANANA VERDE" value="0 kJ" k={appear(fr, hit + 4)} color="#6cbf55" />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "A escola inteira chorou de rir." — stands roaring, Mateus sad in the middle. */
export const S18Roar: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.12} s1={1.0} impacts={[{at: 1, amp: 12}]}>
      <Arena t={t} viewY={-60} excite={1} />
      <PlacedMateus x={540} y={1850} height={1000} light={ARENA} pose={{shL: -10, elL: 20, shR: 10, elR: -20, headTilt: 10}} expr={{smile: -0.8, browTilt: 0.9, lookY: 0.7}} />
      <SoundWord x={260} y={620} text="HAHAHA" k={fr} size={120} rot={-10} />
      <SoundWord x={820} y={780} text="KKKKK" k={fr - 5} size={110} rot={9} />
      <SoundWord x={560} y={460} text="BANANINHA!" k={fr - 10} size={100} rot={-4} color="#fff" />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== L6 — study night */

/** "Naquela noite, ele foi estudar." — bedroom, books piled, lamp. */
export const S19Study: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.1} x0={-30} x1={10}>
      <DaviRoom t={t}>
        <Desk x0={180} x1={980} y={1260} lampX={860} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={260} y={1230 - i * 32} width={200 - i * 10} height={30} rx={4} fill={['#d9534f', '#4f8fd9', '#5cb85c', '#f0ad4e'][i]} />
        ))}
        <text x={270} y={1252 - 3 * 32} fontFamily="Roboto Condensed" fontWeight={700} fontSize={20} fill="#fff">QUÍMICA</text>
      </DaviRoom>
      <PlacedMateus x={600} y={1820} height={1050} light={NIGHT} pose={{shR: 60, elR: -70, shL: -40, elL: 70, facing: 0.3, headTilt: 10, bob: Math.sin(t * 2) * 3}} expr={{lookY: 0.7, lookX: 0.4, browTilt: -0.3}} />
      <Svg>
        <rect x={640} y={1210} width={220} height={40} rx={4} fill="#f6f1e4" transform="rotate(-6 750 1230)" />
        <Banana x={420} y={1200} s={0.55} ripe={5} />
      </Svg>
      <Chip x={540} y={560} text="🌙 22:47" k={appear(fr, 2)} color="#1f2f5c" fg="#fff" />
      <Finish vignette={0.5} grain={0.07} />
    </Rig>
  );
};

/** "E descobriu:" — close on Mateus, eyes go wide (lamp glow). */
export const S20Discover: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const wide = kf(fr, [2, 8], [0, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.18} impacts={[{at: 4, amp: 6, zoom: 0.05}]}>
      <DaviRoom t={t} px={-200} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,210,110,0.35), rgba(0,0,0,0.5))'}} />
      <Bust outfit={MATEUS_OUTFIT} cx={540} cy={920} r={280} light={NIGHT} pose={{}} expr={{eyesWide: wide, browRaise: wide, mouthOpen: wide * 0.5, lookX: 0, lookY: 0}} />
      <Big x={540} y={480} text="!" k={wide} size={240} color={YEL} />
      <Finish vignette={0.5} grain={0.07} />
    </Rig>
  );
};

/** "grama por grama, banana tem quase a energia de uma TNT." — book-style balance: banana vs TNT. */
export const S21Balance: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const tntIn = ev(p, 'L6', 16);
  const tilt = kf(fr, [tntIn, tntIn + 14], [-12, -2]);
  return (
    <Rig s0={1.08} s1={1.0}>
      <Panel title="GRAMA POR GRAMA" k={appear(fr, 2)} />
      <Svg>
        <rect x={520} y={900} width={40} height={600} fill="#c9ced8" />
        <path d="M 400,1520 L 680,1520 L 600,1480 L 480,1480 Z" fill="#9aa4b0" />
        <g transform={`rotate(${tilt} 540 900)`}>
          <rect x={180} y={890} width={720} height={20} rx={8} fill="#e8ecf2" />
          <line x1={230} y1={900} x2={230} y2={1080} stroke="#e8ecf2" strokeWidth={4} />
          <line x1={850} y1={900} x2={850} y2={1080} stroke="#e8ecf2" strokeWidth={4} />
          <path d="M 120,1080 L 340,1080 Q 230,1150 120,1080 Z" fill="#c9ced8" />
          <path d="M 740,1080 L 960,1080 Q 850,1150 740,1080 Z" fill="#c9ced8" />
          <g transform={`rotate(${-tilt} 230 1030)`}>
            <Banana x={230} y={1040} s={0.75} ripe={5} glow={0.4} t={t} />
          </g>
          {fr >= tntIn - 6 && (
            <g transform={`rotate(${-tilt} 850 1000)`}>
              <TNT x={850} y={990} s={0.45 * appear(fr, tntIn - 6, 6)} />
            </g>
          )}
        </g>
      </Svg>
      <HudTag x={240} y={1120} label="BANANA" value="3,7 kJ/g" k={appear(fr, 8)} align="center" color={YEL} size={70} />
      <HudTag x={850} y={1120} label="TNT" value="4,2 kJ/g" k={appear(fr, tntIn)} align="center" color="#ff8a7a" size={70} />
      <Chip x={540} y={1290} text="≈ 90% DA ENERGIA DA TNT" k={appear(fr, tntIn + 10)} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== L7 — speed */

/** "A diferença é a velocidade:" — two stopwatches. */
export const S22Speed: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.08}>
      <Panel title="A DIFERENÇA: VELOCIDADE" k={appear(fr, 1)} />
      <Svg>
        {[300, 780].map((x, i) => (
          <g key={x} transform={`translate(${x},1060)`}>
            <circle r={190} fill="#f6f1e4" stroke="#2a2d38" strokeWidth={16} />
            <rect x={-30} y={-240} width={60} height={50} rx={10} fill="#2a2d38" />
            <line x1={0} y1={0} x2={Math.sin(t * (i ? 1.2 : 40)) * 150} y2={-Math.cos(t * (i ? 1.2 : 40)) * 150} stroke={i ? '#4f9a34' : '#d23c3c'} strokeWidth={10} strokeLinecap="round" />
            <circle r={14} fill="#2a2d38" />
          </g>
        ))}
      </Svg>
      <HudTag x={300} y={1120} label="TNT" value="⚡ RÁPIDO" k={appear(fr, 4)} align="center" color="#ff8a7a" size={60} />
      <HudTag x={780} y={1120} label="BANANA" value="🐢 DEVAGAR" k={appear(fr, 8)} align="center" color={YEL} size={60} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "a TNT solta tudo num milionésimo de segundo." — TNT flash + shockwave. */
export const S23TntBoom: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const boom = ev(p, 'L7', 7);
  return (
    <Rig s0={1.04} s1={1.0} impacts={[{at: boom, amp: 26, zoom: 0.08}]}>
      <Panel bg="radial-gradient(ellipse 80% 60% at 50% 50%, #4a1a12, #120404)" />
      <Svg>
        {fr < boom + 2 && <TNT x={540} y={1000} s={1.2} spark={1} t={t} />}
        {fr >= boom && (
          <g>
            <circle cx={540} cy={1000} r={lerp(60, 700, clamp((fr - boom) / 10))} fill="#ffb84a" opacity={clamp(1 - (fr - boom) / 16)} />
            <circle cx={540} cy={1000} r={lerp(30, 420, clamp((fr - boom) / 8))} fill="#fff6c8" opacity={clamp(1 - (fr - boom) / 12)} />
          </g>
        )}
      </Svg>
      <Shockwave cx={540} cy={1000} age={fr - boom} rings={3} color="255,220,150" />
      <CutFlash at={boom} frames={6} peak={0.8} />
      <BigChip x={540} y={1240} label="TNT" value="0,000001 s" k={appear(fr, boom + 4)} color="#ff8a7a" />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** "Teu corpo leva horas." — body diagram, banana going down slowly, clock. */
export const S24Digest: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const down = kf(fr, [0, 30], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.08}>
      <Panel bg="radial-gradient(ellipse 80% 60% at 50% 45%, #1e4a3a, #071510)" />
      <Svg>
        <g opacity={0.9}>
          <circle cx={540} cy={560} r={130} fill="none" stroke="#9fe0c4" strokeWidth={8} />
          <path d="M 400,700 Q 540,660 680,700 L 720,1300 Q 540,1360 360,1300 Z" fill="none" stroke="#9fe0c4" strokeWidth={8} />
          <path d="M 540,690 L 540,880" stroke="#9fe0c4" strokeWidth={10} strokeDasharray="14 10" />
          <path d="M 480,880 Q 440,1020 560,1060 Q 680,1040 640,900 Q 600,860 540,880 Z" fill="#9fe0c4" opacity={0.25} stroke="#9fe0c4" strokeWidth={6} />
        </g>
        <Banana x={540 + Math.sin(t * 2) * 10} y={lerp(720, 970, down)} s={0.4} rot={90} ripe={5} />
        <g transform="translate(860,640)">
          <circle r={110} fill="#f6f1e4" stroke="#2a2d38" strokeWidth={10} />
          <line x1={0} y1={0} x2={Math.sin(t * 8) * 80} y2={-Math.cos(t * 8) * 80} stroke="#2a2d38" strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.sin(t * 0.8) * 55} y2={-Math.cos(t * 0.8) * 55} stroke="#2a2d38" strokeWidth={10} strokeLinecap="round" />
        </g>
      </Svg>
      <BigChip x={540} y={1240} label="DIGESTÃO" value="~4 HORAS" k={appear(fr, 6)} color="#9fe0c4" />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== L8 — the power */

/** "E o poder do Mateus" — energy streaks run up his arm. */
export const S25PowerArm: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const pose = {shR: 95, elR: 0, shL: -20, elL: 20, facing: 0.5};
  const [hx, hy] = handAt(380, 1800, 1300, pose, 'R');
  const run = (fr % 12) / 12;
  return (
    <Rig s0={1.0} s1={1.12} x0={0} x1={-60}>
      <DaviRoom t={t} px={-120} />
      <AbsoluteFill style={{background: 'rgba(10,10,30,0.4)'}} />
      <PlacedMateus x={380} y={1800} height={1300} light={NIGHT} pose={pose} expr={{browTilt: -0.7, smile: 0.2, lookX: 0.8}} />
      <Svg>
        {[0, 0.33, 0.66].map((o) => {
          const u = (run + o) % 1;
          const x = lerp(380 + 128 * 1.3, hx, u);
          const y = lerp(1800 - 728 * 1.3, hy, u);
          return <line key={o} x1={x - 40} y1={y} x2={x + 40} y2={y} stroke="#ffe14a" strokeWidth={10} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 10px #ffe14a)'}} />;
        })}
        <Banana x={hx + 170} y={hy} s={0.8} ripe={5} glow={0.8} t={t} />
      </Svg>
      <Finish vignette={0.5} grain={0.06} />
    </Rig>
  );
};

/** "solta essa energia de uma vez." — banana core glows white-hot, burst lines. */
export const S26Release: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const k = kf(fr, [0, 20], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.25} impacts={[{at: 18, amp: 12, zoom: 0.06}]}>
      <Panel bg="radial-gradient(ellipse 60% 50% at 50% 50%, #5a4a10, #0b0904)" />
      <Svg>
        {Array.from({length: 24}).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r0 = 200 + 40 * Math.sin(t * 10 + i);
          return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 300 * k)} y2={960 + Math.sin(a) * (r0 + 300 * k)} stroke="#ffe14a" strokeWidth={10} strokeLinecap="round" opacity={k} />;
        })}
        <Banana x={540 + Math.sin(fr * 2.1) * 6 * k} y={960} s={1.6} rot={-10} ripe={5} glow={1} t={t} />
        <circle cx={540} cy={960} r={260 * k} fill="#fff6c8" opacity={k * 0.35} style={{filter: 'blur(30px)'}} />
      </Svg>
      <Chip x={540} y={1290} text="TUDO DE UMA VEZ 💥" k={appear(fr, 8)} />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== L9 — the rule */

/** "Mas tem regra:" — REGRA stamp over Mateus thinking. */
export const S27Rule: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.08} s1={1.0}>
      <DaviRoom t={t} px={-60} />
      <Bust outfit={MATEUS_OUTFIT} cx={540} cy={1100} r={230} light={NIGHT} pose={{headTilt: 6}} expr={{browTilt: -0.4, lookX: 0.4, lookY: -0.5, halfSmile: 0.4}} />
      <Stamp x={540} y={640} text="REGRA" k={fr - 1} size={140} color="#d23c3c" />
      <Finish vignette={0.5} grain={0.06} />
    </Rig>
  );
};
