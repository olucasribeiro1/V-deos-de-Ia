import React from 'react';
import {AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {DAVI_OUTFIT} from '../characters/Davi';
import {HUD_FONT} from '../lib/fonts';
import {FPS} from '../lib/constants';
import {AldoriaMap, Bookshelf, Cat, Crystal, EL, FantasySky, Glow, Hall, StatusWindow, Staff, Svg, Town} from './art';
import {DAY, DaviP, DIRECTOR, FIRE_KID, GUARD, HALL, KID, Marked, STUDENT, STUDENT_MARK, YOUNG_BROTHER, fire} from './cast';
import {Big, BigChip, Bust, Chip, Cricket, Crowd, Finish, HudTag, Rig, Sepia, ShotP, Shockwave, SoundWord, Stamp, Sweat, Tint, YEL, appear, clamp, easeOut, ev, kf, lerp, run, useShot} from './kit';

/* =================================================================== n10 — lago */

/** "Aí você corre até um lago," — Davi running across the field toward a lake. */
export const S48Corre: React.FC<ShotP> = () => {
  const {t} = useShot();
  return (
    <Rig s0={1.0} s1={1.08} x0={60} x1={-60}>
      <FantasySky t={t} px={-t * 400} />
      <Svg>
        <ellipse cx={980 - t * 60} cy={1560} rx={360} ry={70} fill="#3a8ad8" />
      </Svg>
      <DaviP x={460} y={1720} height={1050} light={DAY} pose={{...run(t), facing: 0.6}} expr={{browTilt: 0.5, mouthOpen: 0.4, lookX: 1}} />
      <Finish vignette={0.4} grain={0.05} />
    </Rig>
  );
};

/** "se olha na água..." — over the shoulder, Davi leans over the lake surface. */
export const S49Olha: React.FC<ShotP> = () => {
  const {t} = useShot();
  return (
    <Rig s0={1.05} s1={1.15} oy={1300}>
      <FantasySky t={t} horizon={1000} />
      <Svg>
        <ellipse cx={540} cy={1720} rx={700} ry={260} fill="#3a8ad8" />
        <ellipse cx={540} cy={1720} rx={600} ry={200} fill="#5aa8e8" opacity={0.5} />
      </Svg>
      <DaviP x={540} y={1360} height={950} light={DAY} pose={{lean: 28, headTilt: 18, shR: 40, elR: -20, shL: -40, elL: 20, knL: 30, knR: 30, hipL: -20, hipR: -20}} expr={{lookY: 1, browRaise: 0.5}} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "e nada. Rosto liso. Nenhuma marca." — reflection close-up with ripples, smooth face, MARCA: —. */
export const S50Reflexo: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const ripple = Math.sin(t * 5) * 6;
  return (
    <Rig s0={1.1} s1={1.0}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #6ab8ff, #1a4a8a 75%)'}} />
      <AbsoluteFill style={{transform: `skewX(${Math.sin(t * 3) * 1.5}deg)`, filter: 'saturate(0.85)'}}>
        <Bust outfit={DAVI_OUTFIT} cx={540 + ripple} cy={950} r={330} light={DAY} expr={{eyesWide: kf(fr, [0, ev(p, 'n10', 12)], [0.2, 1]), mouthOpen: 0.3, browRaise: 0.8}} />
      </AbsoluteFill>
      <Svg>
        {[0, 1, 2].map((i) => {
          const r = ((t * 120 + i * 140) % 420) + 40;
          return <ellipse key={i} cx={540} cy={1000} rx={r * 1.6} ry={r * 0.5} fill="none" stroke="#fff" strokeWidth={5} opacity={0.4 * (1 - r / 460)} />;
        })}
        <circle cx={430} cy={1020} r={70} fill="none" stroke={YEL} strokeWidth={6} strokeDasharray="14 10" opacity={appear(fr, ev(p, 'n10', 12))} />
        <circle cx={650} cy={1020} r={70} fill="none" stroke={YEL} strokeWidth={6} strokeDasharray="14 10" opacity={appear(fr, ev(p, 'n10', 12))} />
      </Svg>
      <StatusWindow x={540} y={1650} w={640} k={appear(fr, ev(p, 'n10', 14))} frame={fr} title="MARCA" rows={[{label: 'LINHAS', value: '0', bar: 0, color: '#ff5a5a', k: 1}, {label: 'COR', value: '—', bar: 0, color: '#ff5a5a', k: 1}]} />
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/** "Ferrou." — dramatic snap zoom on Davi's face. */
export const S51Ferrou: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.35} ease={(x) => 1 - Math.pow(1 - x, 4)} impacts={[{at: 0, amp: 10, zoom: 0.08}]}>
      <AbsoluteFill style={{background: 'repeating-conic-gradient(from 0deg at 50% 50%, #2a2a4a 0deg 10deg, #3a3a6a 10deg 20deg)'}} />
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={960} r={300} light={DAY} expr={{eyesWide: 1, mouthOpen: 0.2, smile: -0.8, browTilt: 1}} />
      <Sweat x={540} y={700} t={t} s={1.8} />
      <Finish vignette={0.55} grain={0.06} />
    </Rig>
  );
};

/** "Na cidade, todo mundo te encara:" — Davi walks into a medieval street; every marked face turns to him. */
export const S52Cidade: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const turn = kf(fr, [6, 16], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.1} x0={-40} x1={40}>
      <Town px={-t * 60} />
      {[0, 1, 2, 3].map((i) => {
        const x = [130, 320, 760, 950][i];
        const left = x > 540;
        return <Marked key={i} outfit={KID(i)} mark={STUDENT_MARK(i + 1)} x={x} y={1560} height={760} light={DAY} flip={left} pose={{facing: lerp(0, 0.7, turn)}} expr={{browTilt: -0.5 * turn, lookX: lerp(0, 1, turn), smile: -0.3 * turn}} />;
      })}
      <DaviP x={540} y={1800} height={1000} light={DAY} pose={{shL: -10, elL: 30, shR: 10, elR: -30, headTilt: Math.sin(t * 3) * 4}} expr={{browTilt: 0.6, smile: -0.4, lookX: Math.sin(t * 3)}} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "criança aponta," */
export const S53Crianca: React.FC<ShotP> = () => {
  const {frame: fr} = useShot();
  const pt = kf(fr, [0, 6], [0, 1], easeOut);
  return (
    <Rig s0={1.15} s1={1.0} whipIn="right">
      <Town px={-300} />
      <Marked outfit={KID(1)} mark={{n: 2, color: EL.agua}} x={420} y={1800} height={800} light={DAY} pose={{facing: 0.6, shR: lerp(10, 92, pt), elR: 0}} expr={{eyesWide: 1, mouthOpen: 0.8, browRaise: 1}} />
      <SoundWord x={720} y={1000} text="OLHA!" k={fr - 3} size={130} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "guarda já põe a mão na lança." — armoured guard, grip tightens, spear tilts down. */
export const S54Guarda: React.FC<ShotP> = (p) => {
  const {frame: fr} = useShot();
  const grip = kf(fr, [ev(p, 'n10', 29) - 4, ev(p, 'n10', 31)], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.12} oy={800}>
      <Town px={-500} />
      <Svg>
        <g transform={`rotate(${lerp(0, 25, grip)} 700 1300)`}>
          <rect x={690} y={350} width={20} height={1400} fill="#6a4424" />
          <path d="M 700,250 L 740,360 L 660,360 Z" fill="#c8ccd8" stroke="#5a5e68" strokeWidth={6} />
        </g>
      </Svg>
      <Marked outfit={GUARD} wide={1.15} mark={{n: 2, color: EL.terra}} x={480} y={1900} height={1300} light={DAY} pose={{facing: 0.3, shR: lerp(30, 50, grip), elR: lerp(-30, -70, grip)}} expr={{browTilt: -0.9, smile: -0.5, lookX: 0.4}} />
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== n11 — cristal */

/** "Te levam pra Academia Real," — two guards march Davi into the great hall. */
export const S55Academia: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const walk = (ph: number) => ({hipL: Math.sin(t * 9 + ph) * 16, hipR: -Math.sin(t * 9 + ph) * 16, shL: -10, shR: 10, bob: -Math.abs(Math.sin(t * 9 + ph)) * 10});
  return (
    <Rig s0={1.05} s1={1.15} y0={30}>
      <Hall px={-t * 80} />
      <Marked outfit={GUARD} mark={{n: 2, color: EL.terra}} x={240} y={1750} height={1050} light={HALL} pose={walk(0)} expr={{browTilt: -0.7}} />
      <DaviP x={540} y={1720} height={1000} light={HALL} pose={walk(1.5)} expr={{browTilt: 0.6, smile: -0.4}} />
      <Marked outfit={GUARD} mark={{n: 2, color: EL.agua}} x={840} y={1750} height={1050} light={HALL} flip pose={walk(3)} expr={{browTilt: -0.7}} />
      <Chip x={540} y={640} text="🏰 ACADEMIA REAL" k={appear(fr, 2)} color="#7a6ad8" fg="#fff" size={50} />
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/** "pro Teste do Cristal." — the crystal on its pedestal, students lining the hall. */
export const S56Cristal: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.25} s1={1.0} oy={1000}>
      <Hall />
      <Svg>
        <Crystal x={540} y={1500} s={1.3} t={t} />
      </Svg>
      <BigChip x={540} y={650} label="ACADEMIA REAL" value="TESTE DO CRISTAL" k={appear(fr, 2)} color="#9fe6ff" />
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/** "O garoto antes de você encosta, e o cristal pega fogo." */
export const S57Garoto: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const touch = ev(p, 'n11', 14);
  const burn = kf(fr, [ev(p, 'n11', 18) - 2, ev(p, 'n11', 18) + 6], [0, 1]);
  const reach = kf(fr, [touch - 8, touch], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.1} impacts={[{at: ev(p, 'n11', 18), amp: 12}]}>
      <Hall />
      <Tint c="#ff6a2a" o={0.2 * burn} />
      <Svg>
        <Crystal x={700} y={1650} s={1.1} t={t} fire={burn} />
      </Svg>
      <Marked outfit={FIRE_KID} mark={{n: 1, color: EL.fogo, glow: 1}} x={330} y={1740} height={1050} light={burn > 0 ? fire('#ff8a3a') : HALL} pose={{facing: 0.6, shR: lerp(10, 80, reach), elR: lerp(-10, -20, reach)}} expr={{halfSmile: 1, smile: 0.3, browAsym: 0.6, browTilt: -0.4}} />
      <HudTag x={80} y={560} label="RESULTADO" value={burn > 0.5 ? '🔥 FOGO' : '…'} k={appear(fr, touch)} color="#ff8a3a" size={90} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/** "Sua vez." — Davi gulps and steps up to the crystal. */
export const S58SuaVez: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.15} s1={1.0}>
      <Hall dark={0.2} />
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={1000} r={280} light={HALL} pose={{headTilt: -4}} expr={{browTilt: 0.8, smile: -0.4, mouthOpen: kf(fr, [6, 10, 14], [0, 0.4, 0]), lookX: 0.5}} />
      <Sweat x={540} y={760} t={t} s={1.3} />
      <Chip x={540} y={640} text="PRÓXIMO: VOCÊ" k={appear(fr, 2)} size={50} />
      <Finish vignette={0.55} grain={0.05} />
    </Rig>
  );
};

/** "Você encosta... e nada. Nem uma faísca." — hand on the crystal; it stays grey. Cri cri. */
export const S59Nada: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const touch = ev(p, 'n11', 23);
  const reach = kf(fr, [0, touch], [0, 1]);
  const dead = kf(fr, [ev(p, 'n11', 25), ev(p, 'n11', 25) + 8], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.18} oy={1100} ease={(x) => x}>
      <Hall dark={0.25} />
      <Svg>
        <Crystal x={700} y={1650} s={1.1} t={t} dead={dead} />
      </Svg>
      <DaviP x={330} y={1740} height={1050} light={HALL} pose={{facing: 0.6, shR: lerp(10, 80, reach), elR: lerp(-10, -20, reach)}} expr={{browRaise: 0.6, eyesWide: dead, smile: -0.3 * dead, lookX: 1}} />
      {fr > ev(p, 'n11', 26) && <Cricket x={640} y={900} fr={fr} />}
      <StatusWindow x={540} y={640} w={520} k={appear(fr, ev(p, 'n11', 25))} frame={fr} title="MAGIA" shake={0.4} rows={[{label: 'FAÍSCAS', value: '0', bar: 0, color: '#ff5a5a', k: 1, lock: true}]} />
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/** "A sala inteira cai na gargalhada." — rows of marked students roaring with laughter. */
export const S60Gargalhada: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.1} impacts={[{at: 2, amp: 8}]}>
      <Hall />
      <Svg>
        <Crowd y0={1050} y1={1500} t={t} excite={1} rows={3} seed="lol" />
      </Svg>
      {[0, 1, 2].map((i) => {
        const h = Math.abs(Math.sin(t * 14 + i));
        return <Marked key={i} outfit={STUDENT(i)} mark={STUDENT_MARK(i)} x={200 + i * 340} y={1950} height={1000} light={HALL} pose={{lean: (i - 1) * 8, shR: 120, elR: -110, shL: -40 - h * 20, elL: 60, bob: h * 20, headTilt: -10 + h * 8}} expr={{smile: 1, mouthOpen: 0.6 + h * 0.4, blink: 1}} />;
      })}
      <SoundWord x={540} y={640} text="HAHAHAHA!" k={fr - 1} size={140} />
      <Finish vignette={0.45} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== n12 — diretor */

/** "Até que o diretor bate o cajado no chão," — the staff slams, shockwave across the hall. */
export const S61Cajado: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const hit = ev(p, 'n12', 6);
  const lift = kf(fr, [0, hit - 2, hit], [0, 1, 0]);
  return (
    <Rig s0={1.08} s1={1.0} impacts={[{at: hit, amp: 22, dur: 16, zoom: 0.07}]}>
      <Hall dark={0.15} />
      <Svg>
        <Staff x={720} y={1750 - lift * 160} len={1150} glow={fr > hit ? 1 - clamp((fr - hit) / 20) : 0.3} />
        <Shockwave cx={720} cy={1750} age={fr - hit} rings={4} speed={44} />
      </Svg>
      <Marked outfit={DIRECTOR} mark={{n: 1, color: '#8a8a8a', glow: 0}} x={500} y={1800} height={1250} light={HALL} pose={{facing: 0.5, shR: 40, elR: -40 - lift * 20}} expr={{browTilt: -0.9, smile: -0.4}} />
      <SoundWord x={720} y={1650} text="TUM!" k={fr - hit} size={150} />
      <Chip x={540} y={640} text="DIRETOR DA ACADEMIA" k={appear(fr, 4)} color="#4a5a9a" fg="#fff" size={44} />
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/** "e todo mundo cala a boca." — laughter cut, frozen faces, mouths shut. */
export const S62Silencio: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.0} s1={1.04}>
      <Hall dark={0.3} />
      <Svg>
        <Crowd y0={1050} y1={1500} t={0} excite={0} rows={3} seed="lol" />
      </Svg>
      {[0, 1, 2].map((i) => (
        <Marked key={i} outfit={STUDENT(i)} mark={STUDENT_MARK(i)} x={200 + i * 340} y={1950} height={1000} light={HALL} pose={{shR: 5, shL: -5}} expr={{smile: -0.2, eyesWide: 1, browRaise: 0.8, lookX: 0.6}} />
      ))}
      <Big x={540} y={640} text="SILÊNCIO." k={appear(fr, 4)} size={110} />
      <Finish vignette={0.55} grain={0.05} />
    </Rig>
  );
};

/** "Ele chega perto e fala baixinho, só pra você:" — two-shot, director leans in to Davi. */
export const S63Perto: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  const lean = kf(fr, [0, 30], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.25} oy={900}>
      <Hall dark={0.35} />
      <DaviP x={330} y={1800} height={1150} light={HALL} pose={{facing: 0.6}} expr={{browRaise: 0.6, lookX: 1, lookY: -0.4}} />
      <Marked outfit={DIRECTOR} mark={{n: 1, color: '#8a8a8a', glow: 0}} x={lerp(860, 760, lean)} y={1800} height={1250} light={HALL} flip pose={{lean: 12 * lean, headTilt: 10 * lean, facing: 0.5}} expr={{browTilt: 0.4, smile: -0.1, lookX: 1}} />
      <Chip x={540} y={640} text="🤫 BAIXINHO" k={appear(fr, 10)} color="#fff" size={44} />
      <Finish vignette={0.6} grain={0.05} />
    </Rig>
  );
};

/** "(diretor) O último sem marca foi o meu irmão." — close on the director whispering. */
export const S64Irmao: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.05} s1={1.15}>
      <Hall dark={0.55} />
      <Bust outfit={DIRECTOR} cx={540} cy={1000} r={320} light={{side: 1, rim: '#ffcf8a', rimStrength: 1, shadeStrength: 0.8}} pose={{headTilt: -4, facing: -0.2}} expr={{browTilt: 0.6, smile: -0.3, mouthOpen: 0.2 + 0.2 * Math.abs(Math.sin(t * 12)), lookX: -0.5, blink: 0.25}} />
      <Chip x={540} y={640} text="O ÚLTIMO SEM MARCA" k={appear(fr, 20)} color="#8a8a9a" fg="#fff" size={44} />
      <Finish vignette={0.7} grain={0.06} />
    </Rig>
  );
};

/** "Exilaram ele pro sul, pras terras do Rei Demônio." — sepia memory: a young man with no mark marched south on the map. */
export const S65Exilio: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const go = kf(fr, [0, p.dur], [0, 1], (x) => x);
  return (
    <Rig s0={1.0} s1={1.2} oy={1300}>
      <AldoriaMap t={t} frame={fr} k={{n: 1, m: 1, c: 1, s: 1}} />
      <Svg>
        <path d={`M 420,1060 Q 480,1250 540,${lerp(1060, 1440, go)}`} fill="none" stroke="#5a1a1a" strokeWidth={10} strokeDasharray="22 16" />
      </Svg>
      <Marked outfit={YOUNG_BROTHER} x={lerp(420, 540, go)} y={lerp(1090, 1460, go)} height={260} light={DAY} pose={{hipL: Math.sin(t * 9) * 16, hipR: -Math.sin(t * 9) * 16, shL: -20, shR: 20}} expr={{smile: -0.5, browTilt: 0.6}} />
      <Sepia />
      <Chip x={540} y={640} text="EXILADO · SUL ☠" k={appear(fr, 4)} color="#5a1a1a" fg="#fff" size={46} />
      <Finish vignette={0.7} grain={0.12} tint="rgba(180,140,80,0.4)" />
    </Rig>
  );
};

/** "Ele nunca mais voltou." — extreme close on Davi's eye, reflection of the director. */
export const S66Nunca: React.FC<ShotP> = () => {
  const {frame: fr} = useShot();
  return (
    <Rig s0={1.0} s1={1.12}>
      <Hall dark={0.6} />
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={980} r={340} light={HALL} pose={{facing: 0.2}} expr={{eyesWide: 0.8, browTilt: 0.8, smile: -0.4, lookX: 0.3}} />
      <Big x={540} y={1700} text="NUNCA MAIS VOLTOU" k={appear(fr, 6)} size={90} color="#ff8a7a" />
      <Finish vignette={0.7} grain={0.06} />
    </Rig>
  );
};

/* =================================================================== n13 — o gato */

/** "E aí você escuta um miado." — Davi's head snaps toward the sound. */
export const S67Miado: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const snap = kf(fr, [ev(p, 'n13', 5) - 2, ev(p, 'n13', 5) + 4], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.08}>
      <Hall dark={0.55} />
      <Bust outfit={DAVI_OUTFIT} cx={540} cy={1000} r={300} light={HALL} pose={{facing: lerp(0, -0.7, snap), headTilt: -6 * snap}} expr={{eyesWide: snap, browRaise: snap, lookX: -snap, lookY: -0.6 * snap}} />
      <SoundWord x={260} y={650} text="MIAU…" k={fr - ev(p, 'n13', 5)} size={110} color="#ffb84a" />
      <Finish vignette={0.6} grain={0.05} />
    </Rig>
  );
};

/** "Em cima da estante, te encarando... o mesmo gato que você salvou." — tilt up the bookshelf to the cat, eyes glowing. */
export const S68Estante: React.FC<ShotP> = (p) => {
  const {frame: fr, t} = useShot();
  const tilt = kf(fr, [0, ev(p, 'n13', 11)], [0, 1]);
  const same = ev(p, 'n13', 13);
  const zoom = kf(fr, [same, p.dur], [0, 1]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#140c10'}}>
      <AbsoluteFill style={{transform: `translateY(${lerp(-1100, 0, easeOut(tilt))}px) scale(${1 + 0.35 * zoom})`, transformOrigin: '540px 760px'}}>
        <Svg>
          <rect x={0} y={0} width={1080} height={3100} fill="#2a2030" />
          <Bookshelf x={180} y={900} w={720} h={2100} />
          <Glow x={540} y={720} r={220} color="#c8ff5a" o={0.25 * tilt} />
          <Cat x={540} y={880} s={1.5} t={t} glow={kf(fr, [same - 4, same + 6], [0.3, 1])} blink={fr > p.dur - 14 && fr < p.dur - 8 ? 1 : 0} />
        </Svg>
      </AbsoluteFill>
      <Chip x={540} y={1650} text="🐈 O MESMO GATO" k={appear(fr, same + 4)} color="#f09a3a" size={50} />
      <Finish vignette={0.65} grain={0.06} />
    </AbsoluteFill>
  );
};

/** "Segue a página pra ver o episódio dois!" — cat smirks, Davi points at it in shock; EPISÓDIO 2? */
export const S69Ep2: React.FC<ShotP> = () => {
  const {frame: fr, t} = useShot();
  return (
    <Rig s0={1.05} s1={1.0}>
      <Hall dark={0.4} />
      <Svg>
        <Bookshelf x={560} y={760} w={480} h={1300} />
        <Cat x={800} y={740} s={1.1} t={t} smile={1} glow={0.6} blink={0.3} />
      </Svg>
      <DaviP x={330} y={1820} height={1150} light={HALL} pose={{facing: 0.6, shR: 130, elR: -10}} expr={{eyesWide: 1, mouthOpen: 0.8, browRaise: 1, lookX: 1, lookY: -0.6}} />
      <Stamp x={540} y={1650} text="EPISÓDIO 2?" k={fr - 6} size={100} color="#ffd23a" bg="rgba(20,20,40,0.85)" />
      <Finish vignette={0.5} grain={0.05} />
    </Rig>
  );
};

/* =================================================================== outro (cards only, no voice) */

const Card: React.FC<{from: number; to?: number; top: number; children: React.ReactNode; bg?: string; color?: string; size?: number}> = ({from, to = 99999, top, children, bg = '#ffffff', color = '#141a3a', size = 58}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const s = spring({frame: frame - from, fps, config: {damping: 11, mass: 0.6}});
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', transform: `scale(${s})`}}>
      <span style={{display: 'inline-block', padding: '16px 34px', borderRadius: 28, background: bg, color, fontFamily: HUD_FONT, fontWeight: 700, fontSize: size, boxShadow: '0 10px 28px rgba(0,0,0,0.4)', lineHeight: 1.15}}>{children}</span>
    </div>
  );
};

/** Standard closing cards (model: ep04/extras/Extras.tsx), silent version, 7 s. */
export const S70Outro: React.FC<ShotP> = () => {
  const frame = useCurrentFrame();
  const s = (x: number) => Math.round(x * FPS);
  const wave = Math.sin(frame / 4) * 20;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #2b3a7a 0%, #141a3a 72%)'}} />
      <Card from={s(0.2)} to={s(3.6)} top={250} size={56}>💬 COMENTA UM PODER ALEATÓRIO</Card>
      <Card from={s(1.2)} to={s(3.6)} top={400} bg="#e0245e" color="#fff" size={52}>♥ O MAIS CURTIDO VIRA O PRÓXIMO VÍDEO</Card>
      <Card from={s(3.7)} to={s(5.3)} top={260} size={58}>📊 ENQUETE: QUER VÍDEO LONGO?</Card>
      <Card from={s(4.3)} to={s(5.3)} top={420} bg="#ffd23a" size={64}>ESCREVE "LONGO" 👇</Card>
      <Card from={s(5.4)} top={240} bg="#ff0000" color="#fff" size={62}>▶ YOUTUBE · LINK NA BIO</Card>
      <Card from={s(5.6)} top={420} bg="#ffd23a" size={78}>@Odavi_contos</Card>
      <DaviP x={540} y={2050} height={1200} pose={{shR: frame > s(5.4) ? 150 + wave : 60, elR: -40, facing: 0.1}} expr={{smile: 0.8, halfSmile: 0.3, browRaise: 0.3}} />
    </AbsoluteFill>
  );
};
