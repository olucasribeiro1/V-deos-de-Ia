import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Bust} from '../ep02qi/characters';
import {PlacedStudent} from '../ep03/characters';
import {Actor, ARENA, DAD_OUTFIT, DAY, FIRE, GUARD_OUTFIT, KADU_OUTFIT, MATEUS_OUTFIT, NIGHT, PlacedKadu, PlacedMateus} from './cast';
import {PlacedPuppet} from '../characters/Puppet';
import {Banana, BananaTrophy, FireBall, Fly, Gunk, Peel, Puree, TNT, Trefoil, ripeTone} from './props';
import {Airport, Arena, Backyard, Kitchen, Svg} from './sets';
import {Big, BigChip, Chip, Confetti, CutFlash, Finish, HudTag, Panel, Rig, ShotP, Shockwave, SoundWord, SpeedLines, Stamp, YEL, appear, clamp, easeOut, ev, handAt, kf, lerp, useShot, walkP} from './kit';

/* =================================================================== L9 — starch vs sugar */

/** Banana cross-section: granules (starch) — green, locked. */
const CrossSection: React.FC<{ripe: number; t: number; x?: number; y?: number; s?: number}> = ({ripe, t, x = 540, y = 1000, s = 1}) => {
  const sugar = clamp((ripe - 1) / 6);
  const [base] = ripeTone(ripe);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle r={300} fill={base} stroke="#3a2a0a" strokeWidth={8} />
      <circle r={262} fill="#fff4cf" />
      {[0, 120, 240].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M 0,0 L 0,-200" stroke="#e8d49a" strokeWidth={10} />
      ))}
      {Array.from({length: 46}).map((_, i) => {
        const q = (k: string) => random(`cs${i}${k}`);
        const a = q('a') * Math.PI * 2;
        const r = Math.sqrt(q('r')) * 230;
        const gx = Math.cos(a) * r;
        const gy = Math.sin(a) * r;
        const isSugar = q('s') < sugar;
        return isSugar ? (
          <g key={i} transform={`translate(${gx},${gy}) rotate(${t * 90 + i * 20})`}>
            <path d="M 0,-14 L 4,-4 L 14,0 L 4,4 L 0,14 L -4,4 L -14,0 L -4,-4 Z" fill="#ffd23a" style={{filter: 'drop-shadow(0 0 6px #ffd23a)'}} />
          </g>
        ) : (
          <g key={i} transform={`translate(${gx},${gy})`}>
            <ellipse rx={16} ry={12} fill="#8fbf5a" stroke="#4f7a2a" strokeWidth={3} />
            <ellipse rx={7} ry={5} fill="#b8dc8a" />
          </g>
        );
      })}
    </g>
  );
};

/** "banana verde é quase só amido, energia travada." */
export const S28Starch: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const lock = ev(p, 'L9', 9);
  return (
    <Rig s0={1.0} s1={1.1}>
      <Panel title="BANANA VERDE: AMIDO" k={appear(fr, 2)} />
      <Svg>
        <CrossSection ripe={1} t={t} y={880} s={0.9} />
        {fr >= lock && (
          <g transform={`translate(540,880) scale(${appear(fr, lock, 6)})`}>
            <rect x={-90} y={-40} width={180} height={150} rx={20} fill="#d23c3c" stroke="#5a1210" strokeWidth={8} />
            <path d="M -55,-40 L -55,-100 Q 0,-170 55,-100 L 55,-40" stroke="#5a1210" strokeWidth={22} fill="none" />
            <circle cx={0} cy={30} r={18} fill="#5a1210" />
          </g>
        )}
      </Svg>
      <BigChip x={540} y={1240} label="ENERGIA" value="TRAVADA 🔒" k={appear(fr, lock + 2)} color="#ff8a7a" />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "Quanto mais pintinha, mais açúcar pronto pra explodir." — ripeness 1→7 strip + section turns to sugar. */
export const S29Ripeness: React.FC<ShotP> = () => {
  const {frame: fr, dur, t} = useShot();
  const r = lerp(1, 7, kf(fr, [4, dur - 8], [0, 1]));
  return (
    <Rig s0={1.06} s1={1.0}>
      <Panel title="ESCALA DE MATURAÇÃO" k={appear(fr, 1)} />
      <Svg>
        <CrossSection ripe={r} t={t} y={1060} s={0.75} />
        {Array.from({length: 7}).map((_, i) => {
          const x = 120 + i * 140;
          const on = r >= i + 1 - 0.01;
          return (
            <g key={i} opacity={on ? 1 : 0.35}>
              <Banana x={x} y={700} s={0.42} rot={-20} ripe={i + 1} seed={`rs${i}`} />
              <text x={x} y={800} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={46} fill={on ? YEL : '#fff'}>{i + 1}</text>
            </g>
          );
        })}
      </Svg>
      <HudTag x={540} y={1120} label="AMIDO → AÇÚCAR" value={`NÍVEL ${Math.round(r)}`} k={appear(fr, 6)} align="center" color={YEL} size={80} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== L10 — dosing */

/** "Uma banana inteira daria cem gramas de TNT." — banana = TNT 100 g, red X. */
export const S30Hundred: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const x = ev(p, 'L10', 7);
  return (
    <Rig s0={1.0} s1={1.08}>
      <Panel bg="radial-gradient(ellipse 80% 60% at 50% 45%, #4a1a12, #120404)" title="100% LIBERADO" k={appear(fr, 2)} />
      <Svg>
        <Banana x={300} y={1000} s={1} ripe={6} glow={0.5} t={t} />
        <text x={540} y={1030} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={110} fill="#fff">=</text>
        <TNT x={790} y={1000} s={0.75} />
        {fr >= x && (
          <g opacity={appear(fr, x, 4)} stroke="#ff3b3b" strokeWidth={34} strokeLinecap="round">
            <line x1={160} y1={780} x2={920} y2={1240} />
            <line x1={920} y1={780} x2={160} y2={1240} />
          </g>
        )}
      </Svg>
      <BigChip x={540} y={1240} label="BANANA INTEIRA" value="≈ 100 g DE TNT" k={appear(fr, 8)} color="#ff8a7a" />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "Então ele solta só um por cento:" — a dial turned down to 1%. */
export const S31Dial: React.FC<ShotP> = () => {
  const {frame: fr, dur} = useShot();
  const v = kf(fr, [2, dur - 4], [100, 1]);
  const ang = lerp(130, -130, 1 - v / 100);
  return (
    <Rig s0={1.08} s1={1.0}>
      <Panel title="PRECISÃO: DOSAGEM" k={appear(fr, 1)} />
      <Svg>
        <g transform="translate(540,900)">
          <circle r={280} fill="#1d2438" stroke="#8a96ad" strokeWidth={12} />
          {Array.from({length: 11}).map((_, i) => {
            const a = ((lerp(-130, 130, i / 10) - 90) * Math.PI) / 180;
            return <line key={i} x1={Math.cos(a) * 220} y1={Math.sin(a) * 220} x2={Math.cos(a) * 262} y2={Math.sin(a) * 262} stroke="#cfd8e8" strokeWidth={8} />;
          })}
          <g transform={`rotate(${-ang})`}>
            <rect x={-14} y={-230} width={28} height={230} rx={12} fill={YEL} />
          </g>
          <circle r={60} fill="#2a3350" stroke={YEL} strokeWidth={8} />
        </g>
      </Svg>
      <Big x={540} y={1290} text={`${Math.round(v)}%`} k={1} size={170} color={v < 2 ? '#3be08a' : '#fff'} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "um rojão." — backyard test: banana pops like a firecracker, the neighbour's dog runs. */
export const S32Rojao: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const pop = 3;
  return (
    <Rig s0={1.04} s1={1.0} impacts={[{at: pop, amp: 18, zoom: 0.06}]}>
      <Backyard t={t} />
      <PlacedMateus x={220} y={1760} height={1050} light={DAY} pose={{shR: 95, elR: 0, shL: -20, elL: 20, facing: 0.6, lean: -8}} expr={{eyesWide: 0.6, smile: 0.6, lookX: 0.8}} />
      <Svg>
        {fr < pop && <Banana x={640} y={1200} s={0.7} ripe={6} glow={1} t={t} />}
        {fr >= pop && (
          <g>
            <circle cx={640} cy={1200} r={lerp(40, 260, clamp((fr - pop) / 6))} fill="#ffd04a" opacity={clamp(1 - (fr - pop) / 10)} />
            <Puree x={640} y={1200} age={fr - pop} n={14} power={0.6} />
          </g>
        )}
        {/* dog running away */}
        <g transform={`translate(${880 + Math.max(0, fr - pop) * 28},${1560 - Math.abs(Math.sin(fr / 2)) * 20})`}>
          <ellipse rx={80} ry={40} fill="#c9873a" />
          <circle cx={70} cy={-40} r={34} fill="#c9873a" />
          <ellipse cx={58} cy={-74} rx={12} ry={24} fill="#8a5a24" />
          <circle cx={82} cy={-46} r={5} fill="#141414" />
          {[-50, -20, 20, 50].map((lx, i) => (
            <rect key={lx} x={lx - 8} y={20} width={16} height={46} rx={6} fill="#a86a2a" transform={`rotate(${Math.sin(fr + i) * 30} ${lx} 20)`} />
          ))}
        </g>
      </Svg>
      <SoundWord x={640} y={980} text="PÁ!" k={fr - pop} size={180} rot={-8} />
      <CutFlash at={pop} frames={4} peak={0.6} />
      <Finish vignette={0.3} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== L11 — training */

/** "Treinou um mês." — calendar pages flipping DIA 1 → 30. */
export const S33Month: React.FC<ShotP> = () => {
  const {frame: fr, dur} = useShot();
  const day = Math.max(1, Math.round(lerp(1, 30, clamp(fr / (dur - 3)))));
  return (
    <Rig s0={1.0} s1={1.1}>
      <Backyard px={-200} />
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.25)'}} />
      <div style={{position: 'absolute', left: 290, top: 620, width: 500, height: 560, background: '#fff', borderRadius: 24, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', overflow: 'hidden', transform: `rotate(${Math.sin(fr) * 2}deg)`}}>
        <div style={{height: 130, background: '#d23c3c', color: '#fff', fontFamily: 'Oswald', fontWeight: 700, fontSize: 70, textAlign: 'center', lineHeight: '130px'}}>TREINO 🍌</div>
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 260, color: '#141414', textAlign: 'center', lineHeight: '360px'}}>{day}</div>
      </div>
      <Chip x={540} y={1290} text={`DIA ${day} DE 30`} k={1} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "Acertou uma mosca a vinte metros." — banana zips across and hits a fly. */
export const S34Fly: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const hit = 16;
  const bx = lerp(-100, 820, clamp(fr / hit));
  return (
    <Rig s0={1.0} s1={1.06} x0={40} x1={-40} impacts={[{at: hit, amp: 8}]}>
      <Backyard t={t} px={-500} />
      <Svg>
        <line x1={60} y1={1300} x2={1000} y2={1300} stroke="#fff" strokeWidth={6} strokeDasharray="20 14" opacity={0.8} />
        {fr < hit + 1 ? <Fly x={820 + Math.sin(t * 9) * 20} y={1000 + Math.cos(t * 7) * 20} t={t} s={1.6} /> : <Fly x={820 + (fr - hit) * 4} y={1000 + (fr - hit) * (fr - hit) * 1.4} t={t} s={1.6} dead />}
        <Banana x={fr < hit ? bx : 820 + (fr - hit) * 30} y={1000 - (fr >= hit ? (fr - hit) * 10 : 0)} s={0.6} rot={0} ripe={5} glow={0.7} t={t} />
      </Svg>
      <SoundWord x={820} y={860} text="PLOFT!" k={fr - hit} size={120} rot={8} />
      <HudTag x={540} y={1120} label="DISTÂNCIA" value="20 m" k={appear(fr, 4)} align="center" color={YEL} size={80} />
      <Finish vignette={0.3} grain={0.05} />
    </Rig>
  );
};

/** One dad slip on a peel (kitchen). `n` 1..3. */
const DadSlip: React.FC<{age: number; x: number; floor: number; h: number}> = ({age, x, floor, h}) => {
  const k = kf(age, [0, 10], [0, 1], easeOut);
  return (
    <>
      <Svg>
        <Peel x={x + 40 + k * 200} y={floor - 6} s={0.8} ripe={6} />
      </Svg>
      <Actor outfit={DAD_OUTFIT} x={x} y={floor - k * 160} height={h} rot={lerp(0, -82, k)} pivotY={-480} light={DAY} pose={{shL: lerp(-10, -150, k), elL: 0, shR: lerp(10, 160, k), elR: 0, hipL: lerp(0, 60, k), hipR: lerp(0, 30, k), knL: 20 * k}} expr={{eyesWide: k, mouthOpen: k * 0.8, browRaise: k}} />
    </>
  );
};

/** "Fez o pai escorregar" — kitchen, dad steps on a peel and goes airborne. */
export const S35Dad: React.FC<ShotP> = () => {
  const {frame: fr} = useShot();
  return (
    <Rig s0={1.04} s1={1.0} impacts={[{at: 8, amp: 14}]}>
      <Kitchen />
      <DadSlip age={fr - 2} x={500} floor={1750} h={950} />
      <SoundWord x={720} y={760} text="WOOOP!" k={fr - 4} size={120} rot={-8} />
      <Finish vignette={0.3} grain={0.05} />
    </Rig>
  );
};

/** "três vezes." — three panels, three falls. */
export const S36Three: React.FC<ShotP> = () => {
  const {frame: fr, dur} = useShot();
  const step = Math.max(6, Math.floor(dur / 3));
  return (
    <AbsoluteFill style={{background: '#141414'}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, top: i * 640, width: 1080, height: 630, overflow: 'hidden', opacity: fr >= i * step ? 1 : 0}}>
          <div style={{position: 'absolute', left: 0, top: -820, width: 1080, height: 1920}}>
            <Kitchen px={-i * 120} />
            <DadSlip age={fr - i * step} x={540} floor={1420} h={700} />
          </div>
          <div style={{position: 'absolute', right: 40, top: 30, fontFamily: 'Oswald', fontWeight: 700, fontSize: 90, color: YEL, textShadow: '0 4px 0 #000'}}>{i + 1}</div>
        </div>
      ))}
      <Chip x={540} y={1880} text={`PAI: ${Math.min(3, Math.floor(fr / step) + 1)} QUEDAS`} k={1} color="#ff8a7a" />
    </AbsoluteFill>
  );
};

/* =================================================================== L12 — friction */

/** "Porque casca de banana tem atrito de zero vírgula zero sete." — book diagram: shoe on peel, gel layer. */
export const S37Friction: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const num = ev(p, 'L12', 7);
  const slide = kf(fr, [6, 40], [0, 1]);
  return (
    <Rig s0={1.06} s1={1.0}>
      <Panel title="ATRITO DA CASCA" k={appear(fr, 2)} />
      <Svg>
        <rect x={60} y={1200} width={960} height={40} fill="#8a96ad" />
        <g transform={`translate(${lerp(300, 620, slide)},0)`}>
          <Peel x={0} y={1192} s={1.1} ripe={6} flat={0.35} />
          <path d="M -200,1170 L 140,1170 Q 210,1170 210,1110 L 210,1060 L 0,1040 L -140,960 L -200,960 Z" fill="#3a4a6a" stroke="#141414" strokeWidth={6} />
          <rect x={-200} y={1150} width={410} height={26} rx={10} fill="#eceae4" stroke="#141414" strokeWidth={5} />
          {Array.from({length: 7}).map((_, i) => (
            <line key={i} x1={-260 - i * 30} y1={1000 + i * 24} x2={-360 - i * 30} y2={1000 + i * 24} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.6 * slide} />
          ))}
        </g>
        {/* zoom bubble: gel */}
        <g transform="translate(800,760)" opacity={appear(fr, 10)}>
          <circle r={170} fill="#fff4cf" stroke="#fff" strokeWidth={8} />
          {Array.from({length: 14}).map((_, i) => (
            <circle key={i} cx={Math.cos(i * 1.7) * 100} cy={Math.sin(i * 2.3) * 90} r={22} fill="#f6e08a" stroke="#d8b24a" strokeWidth={3} transform={`translate(${Math.sin(t * 3 + i) * 6},0)`} />
          ))}
          <text y={210} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={34} fill="#fff">GEL = LUBRIFICANTE</text>
        </g>
      </Svg>
      <BigChip x={540} y={1240} label="COEFICIENTE DE ATRITO" value="0,07" k={appear(fr, num)} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "Seis vezes menos que um sapato." — bar chart 0,4 vs 0,07. */
export const S38Bars: React.FC<ShotP> = () => {
  const {frame: fr} = useShot();
  const g = kf(fr, [2, 16], [0, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.06}>
      <Panel title="ATRITO" k={appear(fr, 1)} />
      <Svg>
        <line x1={160} y1={1400} x2={920} y2={1400} stroke="#cfd8e8" strokeWidth={6} />
        <rect x={250} y={1400 - 640 * g} width={220} height={640 * g} rx={12} fill="#8a96ad" />
        <rect x={610} y={1400 - 112 * g} width={220} height={112 * g} rx={12} fill={YEL} />
        <text x={360} y={1360 - 640 * g} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={80} fill="#fff">0,4</text>
        <text x={720} y={1360 - 112 * g} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={80} fill={YEL}>0,07</text>
        <text x={360} y={1470} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={44} fill="#fff">👟 SAPATO</text>
        <text x={720} y={1470} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={44} fill="#fff">🍌 CASCA</text>
      </Svg>
      <Stamp x={760} y={820} text="÷ 6" k={fr - 14} size={120} color="#d23c3c" rot={8} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "É gelo." — Mateus skating on a peel like ice, frosty tint. */
export const S39Ice: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const x = lerp(200, 880, fr / 24);
  return (
    <Rig s0={1.0} s1={1.04}>
      <AbsoluteFill style={{background: 'linear-gradient(#bfe6ff,#e8f8ff)'}} />
      <Svg>
        <rect x={-20} y={1500} width={1120} height={420} fill="#d8f2ff" />
        {Array.from({length: 8}).map((_, i) => (
          <path key={i} d={`M ${i * 150},${1540 + (i % 3) * 60} l 120,10`} stroke="#fff" strokeWidth={6} opacity={0.8} />
        ))}
        <Peel x={x} y={1510} s={0.7} ripe={6} flat={0.4} />
      </Svg>
      <PlacedMateus x={x} y={1510} height={950} light={DAY} pose={{shL: -100, elL: 10, shR: 100, elR: -10, hipL: -20, hipR: 30, knR: 30, lean: 8}} expr={{smile: 0.9, mouthOpen: 0.3}} />
      <Big x={540} y={620} text="❄ GELO" k={appear(fr, 2)} size={150} color="#ffffff" />
      <Finish vignette={0.25} grain={0.04} />
    </Rig>
  );
};

/* =================================================================== L13–L14 — the final */

const FinalScreen: React.FC = () => (
  <g>
    <text x={540} y={-560} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={110} fill={YEL}>FINAL</text>
    <text x={540} y={-430} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={72} fill="#fff">KADU × BANANINHA</text>
  </g>
);

/** "Na final," — big screen FINAL. */
export const S40Final: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const vy = kf(fr, [0, 20], [-640, -380]);
  return (
    <Rig s0={1.06} s1={1.0}>
      <Arena t={t} viewY={vy} excite={0.9} screen={<FinalScreen />} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "o Kadu prepara uma bola de fogo." — fireball grows between his hands; slow orbit. */
export const S41Fireball: React.FC<ShotP> = () => {
  const {frame: fr, t, dur} = useShot();
  const g = kf(fr, [0, dur], [0.2, 1]);
  return (
    <Rig s0={1.0} s1={1.14} x0={40} x1={-40} r0={-1.5} r1={1.5}>
      <Arena t={t} viewY={-100} excite={0.6} />
      <AbsoluteFill style={{background: `rgba(255,110,30,${0.2 * g})`}} />
      <PlacedKadu x={540} y={1850} height={1300} light={FIRE} pose={{shL: -150, elL: 40, shR: 150, elR: -40, facing: 0}} expr={{halfSmile: 1, browTilt: -0.8}} />
      <Svg>
        <FireBall x={540} y={400} r={lerp(30, 150, g)} t={t} />
      </Svg>
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "O Mateus espalha dez cascas pela arena." — 10 peels fly out in formation and land. */
export const S42Peels: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const spots: [number, number][] = [
    [160, 1500], [360, 1460], [560, 1520], [760, 1470], [940, 1520],
    [240, 1680], [460, 1720], [660, 1690], [860, 1740], [1000, 1640],
  ];
  const landed = spots.filter((_, i) => fr >= 6 + i * 2 + 10).length;
  return (
    <Rig s0={1.08} s1={1.0} y0={-40}>
      <Arena t={t} viewY={200} excite={0.4} />
      <Svg>
        {spots.map(([x, y], i) => {
          const a = clamp((fr - (6 + i * 2)) / 10);
          if (a <= 0) return null;
          const px = lerp(540, x, a);
          const py = lerp(1100, y, a) - Math.sin(a * Math.PI) * 260;
          return a < 1 ? <Banana key={i} x={px} y={py} s={0.4} rot={a * 720} ripe={6} seed={`p${i}`} /> : <Peel key={i} x={x} y={y} s={0.55} ripe={6} rot={i * 37} />;
        })}
      </Svg>
      <PlacedMateus x={540} y={1250} height={620} light={ARENA} pose={{shL: -130, elL: 0, shR: 130, elR: 0}} expr={{browTilt: -0.6, halfSmile: 0.8}} />
      <HudTag x={540} y={560} label="CASCAS" value={`${landed}/10`} k={appear(fr, 4)} align="center" color={YEL} size={90} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "O Kadu corre" — Kadu charging toward camera with the fireball. */
export const S43Charge: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const h = lerp(900, 1350, fr / 12);
  const pose = {...walkP(t * 1.6, 0, 1.3), shR: 150, elR: -20, lean: 8};
  const [hx, hy] = handAt(560, 1800, h, pose, 'R');
  return (
    <Rig s0={1.0} s1={1.08} impacts={[{at: 0, amp: 6}]}>
      <Arena t={t} viewY={-60} excite={0.8} />
      <SpeedLines t={t} dir="radial" count={30} opacity={0.3} />
      <PlacedKadu x={560} y={1800} height={h} light={FIRE} pose={pose} expr={{browTilt: -0.9, mouthOpen: 0.5}} />
      <Svg>
        <FireBall x={hx} y={hy - 60} r={100} t={t} />
      </Svg>
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "e sai patinando." — feet on a peel, he spins wildly, fireball flies up into the sky. */
export const S44Skate: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const spin = fr * 26;
  const fbY = 1000 - fr * 60;
  return (
    <Rig s0={1.02} s1={1.0} impacts={[{at: 2, amp: 10}]}>
      <Arena t={t} viewY={0} excite={0.9} />
      <Svg>
        <Peel x={540 + Math.sin(fr / 2) * 140} y={1790} s={0.6} ripe={6} />
        <FireBall x={640 + fr * 8} y={fbY} r={90} t={t} />
      </Svg>
      <Actor outfit={KADU_OUTFIT} x={540 + Math.sin(fr / 2) * 140} y={1780} height={1150} rot={Math.sin(fr / 3) * 25} pivotY={-200} flip={Math.floor(spin / 180) % 2 === 1} light={FIRE} pose={{shL: -150, elL: 20, shR: 150, elR: -20, hipL: -40, hipR: 30, knL: 20}} expr={{eyesWide: 1, mouthOpen: 0.9, browRaise: 1}} />
      <SoundWord x={300} y={700} text="WHOA!" k={fr - 3} size={120} rot={-10} />
      <HudTag x={540} y={1120} label="ATRITO" value="0,07" k={appear(fr, 4)} align="center" color={YEL} size={80} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== L15 — climax */

/** "Aí vem a banana mais madura da história." — slow-mo, spotted banana, nivel 7, golden glow. */
export const S45Ripest: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.2} ease={(x) => x}>
      <Arena t={t} viewY={-100} excite={0.3} zoom={1.3} blur={10} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(255,210,80,0.35), rgba(0,0,0,0.55))'}} />
      <Svg>
        <Banana x={540} y={960 + Math.sin(t * 2) * 12} s={2} rot={-15 + t * 6} ripe={7} glow={1} t={t * 0.4} seed="hero" />
      </Svg>
      <BigChip x={540} y={1240} label="MATURAÇÃO" value="NÍVEL 7" k={appear(fr, 8)} />
      <Chip x={540} y={560} text="⏱ CÂMERA LENTA" k={appear(fr, 2)} color="#ffffff" />
      <Finish vignette={0.5} grain={0.06} />
    </Rig>
  );
};

/** "Ela para na frente do Kadu" — banana hovers a palm away from Kadu's face; his eyes widen. */
export const S46Hover: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const arrive = kf(fr, [0, 10], [0, 1], easeOut);
  return (
    <Rig s0={1.0} s1={1.12}>
      <Arena t={t} viewY={-200} excite={0.2} zoom={1.4} blur={8} />
      <Bust outfit={KADU_OUTFIT} cx={540} cy={1000} r={280} light={ARENA} pose={{}} expr={{eyesWide: arrive, browRaise: arrive, mouthOpen: 0.3 * arrive, lookX: 0, lookY: -0.2}} />
      <Svg>
        <Banana x={lerp(-200, 360, arrive)} y={1140 + Math.sin(t * 6) * 6} s={1.3} rot={0} ripe={7} glow={1} t={t} seed="hero" />
      </Svg>
      <Big x={540} y={540} text="…" k={appear(fr, 10)} size={160} color="#fff" />
      <Finish vignette={0.5} grain={0.06} />
    </Rig>
  );
};

/** "e explode." — flash, shockwave. */
export const S47Boom: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.1} s1={1.0} impacts={[{at: 0, amp: 34, zoom: 0.1}]}>
      <Arena t={t} viewY={-100} excite={1} />
      <AbsoluteFill style={{background: `rgba(255,236,150,${clamp(1 - fr / 12) * 0.9})`}} />
      <Svg>
        <circle cx={540} cy={1100} r={lerp(80, 900, clamp(fr / 12))} fill="#ffd04a" opacity={clamp(1 - fr / 16)} />
      </Svg>
      <Shockwave cx={540} cy={1100} age={fr} rings={4} color="255,230,140" />
      <SoundWord x={540} y={900} text="BOOM!" k={fr - 1} size={220} rot={-6} />
      <CutFlash frames={6} peak={1} />
      <Finish vignette={0.35} grain={0.06} />
    </Rig>
  );
};

/** "Onda de purê." — wave of purée blasting across the arena. */
export const S48Wave: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.06} impacts={[{at: 2, amp: 14}]}>
      <Arena t={t} viewY={-100} excite={1} />
      <Svg>
        <Puree x={540} y={1150} age={fr + 4} n={40} power={1.4} />
        <path d={`M -20,${1400 - fr * 4} Q 270,${1250 - fr * 6} 540,${1330 - fr * 4} T 1100,${1300 - fr * 5} L 1100,1920 L -20,1920 Z`} fill="#f6e08a" stroke="#d8b24a" strokeWidth={8} />
      </Svg>
      <SoundWord x={540} y={760} text="SPLOOSH!" k={fr} size={140} rot={6} color="#fff2b8" />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "O Kadu voa lambuzado." — Kadu flies out of the arena, covered in banana. */
export const S49KaduFlies: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const {dur} = useShot();
  const u = clamp(fr / Math.max(1, dur));
  const x = lerp(250, 1150, u);
  const y = 1750 - Math.sin(u * Math.PI * 0.9) * 600;
  return (
    <Rig s0={1.0} s1={1.04}>
      <Arena t={t} viewY={-300} excite={1} />
      <Actor outfit={KADU_OUTFIT} x={x} y={y} height={800} rot={fr * 22} pivotY={-500} light={ARENA} pose={{shL: -160, elL: 20, shR: 160, elR: -20, hipL: -30, hipR: 40}} expr={{eyesWide: 1, mouthOpen: 1, browRaise: 1}}>
        <Gunk x={0} y={-600} s={1.3} />
      </Actor>
      <Confetti age={fr} n={50} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== L16 — champion */

/** "Campeão: Bananinha." — Mateus lifts the banana trophy. */
export const S50Champion: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const pose = {shR: 150, elR: -20, shL: -30, elL: 30, facing: 0.1};
  const [hx, hy] = handAt(540, 1850, 1150, pose, 'R');
  return (
    <Rig s0={1.12} s1={1.0}>
      <Arena t={t} viewY={-100} excite={0.1} />
      <PlacedMateus x={540} y={1850} height={1150} light={ARENA} pose={pose} expr={{smile: 1, halfSmile: 0.4, browRaise: 0.5}}>
        <Gunk x={-200} y={-400} s={0.4} n={4} seed="mg" />
      </PlacedMateus>
      <Svg>
        <BananaTrophy x={hx} y={hy - 120} s={1.1} t={t} />
      </Svg>
      <Stamp x={400} y={1250} text="CAMPEÃO" k={fr - 4} size={120} color="#e8b84a" rot={-6} />
      <Finish vignette={0.35} grain={0.05} />
    </Rig>
  );
};

/** "Dessa vez, ninguém riu." — silent crowd, mouths open, purée dripping. */
export const S51Silence: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.08}>
      <Arena t={t} viewY={-80} excite={0} />
      <PlacedStudent seed={3} x={220} y={1900} height={1000} light={ARENA} pose={{}} expr={{eyesWide: 1, mouthOpen: 0.7, browRaise: 1}} />
      <PlacedStudent seed={8} x={860} y={1920} height={1040} light={ARENA} pose={{}} expr={{eyesWide: 1, mouthOpen: 0.9, browRaise: 1}} flip />
      <Svg>
        <Gunk x={860} y={1300} s={0.5} n={4} seed="s1" />
      </Svg>
      <Big x={540} y={760} text="…" k={appear(fr, 4)} size={200} color="#fff" />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== L17 — airport */

/** "Só um detalhe: banana tem potássio radioativo." — banana + trefoil + Geiger ticks. */
export const S52Potassium: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const rad = ev(p, 'L17', 5);
  return (
    <Rig s0={1.0} s1={1.1}>
      <Panel bg="radial-gradient(ellipse 80% 60% at 50% 45%, #2e3a12, #0b0f04)" title="SÓ UM DETALHE" k={appear(fr, 2)} />
      <Svg>
        <Banana x={540} y={1050} s={1.6} rot={-12} ripe={5} />
        {fr >= rad && <Trefoil x={800} y={780} r={110 * appear(fr, rad, 6)} spin={t * 30} />}
        {fr >= rad &&
          Array.from({length: 6}).map((_, i) => {
            const on = random(`gk${Math.floor(fr / 2)}${i}`) > 0.6;
            return on ? <circle key={i} cx={300 + i * 90} cy={1360} r={10} fill="#b8ec6a" /> : null;
          })}
      </Svg>
      <BigChip x={540} y={1240} label="POTÁSSIO-40" value="☢ NATURAL" k={appear(fr, rad + 2)} color="#b8ec6a" />
      <Finish vignette={0.45} grain={0.06} />
    </Rig>
  );
};

/** "Pouquinho." — tiny pinch gesture, harmless. */
export const S53Tiny: React.FC<ShotP> = () => {
  const {frame: fr} = useShot();
  return (
    <Rig s0={1.06} s1={1.0}>
      <Panel bg="radial-gradient(ellipse 80% 60% at 50% 45%, #2e3a12, #0b0f04)" />
      <Bust outfit={MATEUS_OUTFIT} cx={540} cy={960} r={250} light={DAY} pose={{shR: 60, elR: -130}} expr={{smile: 0.6, halfSmile: 0.6, browRaise: 0.4, blink: 0.4}} />
      <Chip x={540} y={1290} text="INOFENSIVO ✓" k={appear(fr, 4)} color="#3be08a" />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** Bulging backpack full of bananas (drawn on Mateus' back, side view). */
const Backpack: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-150} y={-200} width={300} height={400} rx={70} fill="#d23c3c" stroke="#5a1210" strokeWidth={8} />
    {Array.from({length: 7}).map((_, i) => (
      <Banana key={i} x={-110 + (i % 4) * 70} y={-230 - Math.floor(i / 4) * 30} s={0.4} rot={-60 + i * 22} ripe={4} seed={`bp${i}`} />
    ))}
    <rect x={-100} y={40} width={200} height={110} rx={30} fill="#b02a22" />
  </g>
);

/** "Mas o Mateus levou trezentas pro aeroporto," — Mateus walks to the detector with a huge backpack. */
export const S54Airport: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const x = lerp(-80, 420, kf(fr, [0, 60], [0, 1], (u) => u));
  return (
    <Rig s0={1.04} s1={1.0} x0={30} x1={-20}>
      <Airport t={t} ax={620} />
      <PlacedMateus x={x} y={1640} height={1050} light={DAY} pose={{...walkP(t, 0, 0.8), facing: 0.6}} expr={{smile: 0.6, halfSmile: 0.5, lookX: 0.6}} />
      <Svg>
        <Backpack x={x - 150} y={1100} s={0.85} />
      </Svg>
      <HudTag x={700} y={1120} label="NA MOCHILA" value="🍌 × 300" k={appear(fr, 6)} align="center" color={YEL} size={90} />
      <Finish vignette={0.3} grain={0.05} />
    </Rig>
  );
};

/** "e o detector apitou." — red alarm, guards, avalanche of bananas. */
export const S55Alarm: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const spill = clamp((fr - 6) / 14);
  return (
    <Rig s0={1.0} s1={1.06} impacts={[{at: 1, amp: 12}]}>
      <Airport t={t} ax={540} alarm={1} />
      <PlacedPuppet outfit={GUARD_OUTFIT} x={170} y={1720} height={1150} light={DAY} pose={{shR: 95, elR: 0, facing: 0.4}} expr={{browTilt: -0.8, mouthOpen: 0.4}} />
      <PlacedPuppet outfit={GUARD_OUTFIT} x={930} y={1720} height={1150} light={DAY} pose={{shL: -95, elL: 0, facing: -0.4}} expr={{browTilt: -0.8, eyesWide: 0.6}} flip />
      <PlacedMateus x={540} y={1660} height={1000} light={DAY} pose={{shL: -150, elL: 10, shR: 150, elR: -10}} expr={{smile: 0.4, halfSmile: 0.8, browTilt: 0.6, eyesWide: 0.4}} />
      <Svg>
        {Array.from({length: 30}).map((_, i) => {
          const q = (k: string) => random(`av${i}${k}`);
          const a = clamp(spill * 1.4 - q('d') * 0.4);
          if (a <= 0) return null;
          return <Banana key={i} x={540 + (q('x') - 0.5) * 700 * a} y={lerp(1180, 1700 + q('y') * 120, a)} s={0.4} rot={q('r') * 360 + a * 200} ripe={4} seed={`av${i}`} />;
        })}
      </Svg>
      <SoundWord x={540} y={520} text="BIIIP!" k={fr} size={170} rot={-6} color="#ff5a5a" stroke="#2a0404" />
      <Stamp x={540} y={760} text="☢ RADIAÇÃO" k={fr - 3} size={90} color="#d23c3c" rot={4} />
      <Finish vignette={0.3} grain={0.05} />
    </Rig>
  );
};
