import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PlacedDavi} from '../../characters/Davi';
import {PlacedLia} from '../../characters/Lia';
import {PlacedAgent} from '../../characters/Agent';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Particles} from '../../fx/Particles';
import {Flash} from '../../fx/Rastro';
import {Finish} from '../../scenes/common';
import {Rig, ShotP, SpeedLines, abs, ev} from './rig';
import {BuenosAires, CityStamp, GALA_LIGHT, GalaTable, HudTag, Lisbon, MARBLE_LIGHT, MarbleRoom, Svg, Terrace, WARM_LIGHT, WcDoor} from './sets';
import {TerraceCrowd} from './crowd';
import {TuxBack, WashHands, walk} from './kit';

const DOOR_STYLES = [
  {wood: '#4a2c1e', plaque: '#e2b04a', frame: '#d8cbb4', wall: '#cdb79a', name: 'MÔNACO'},
  {wood: '#1f4f8f', plaque: '#f4c21b', frame: '#e9f0f8', wall: '#2f6db3', name: 'LISBOA'},
  {wood: '#d23c3c', plaque: '#3aa66b', frame: '#f2c230', wall: '#2f7fd1', name: 'BUENOS AIRES'},
];

/* 20. "Três encontros." — three restroom doors (three cities) pop open in sequence; Davi steps out of each. */
export const SThree: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const E = ev(p, 'L14', 1);
  const opens = [2, E - 2, E + 6];
  return (
    <Rig dur={p.dur} zoom={[1.1, 1.0]} rot={[-2, 1]} pow={1.5} whip="u">
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#1d1d2e,#3a2a3a)'}} />
      {DOOR_STYLES.map((d, i) => {
        const x = 30 + i * 345;
        const o = kf(fr, [opens[i], opens[i] + 5], [0, 1], easeOut);
        const st = kf(fr, [opens[i] + 2, opens[i] + 18], [0, 1]);
        return (
          <React.Fragment key={i}>
            <Svg>
              <rect x={x} y={560} width={330} height={800} fill={d.wall} />
              <WcDoor x={x + 55} y={1300} w={220} h={560} open={o} glow={1} wood={d.wood} plaque={d.plaque} frame={d.frame} />
              <rect x={x} y={1300} width={330} height={60} fill="#2a1a14" />
            </Svg>
            {fr >= opens[i] + 2 && (
              <PlacedDavi x={x + 165 + st * 20} y={lerp(1290, 1340, st)} height={lerp(480, 560, st)} light={GALA_LIGHT} pose={{...walk(t + i, 0, 0.7)}} expr={{smile: 0.6}} />
            )}
            <Svg>
              <text x={x + 165} y={1420} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={34} fill="#fff" opacity={o}>
                {d.name}
              </text>
            </Svg>
          </React.Fragment>
        );
      })}
      <HudTag x={540} y={1620} label="ENCONTROS" value={String(fr < opens[1] ? 1 : fr < opens[2] ? 2 : 3)} k={clamp(fr / 4)} align="center" size={110} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 21. "Mônaco, Lisboa, Buenos Aires." — rapid panels: Davi out of the restroom door, Lia at the table, city stamp on each word. */
export const SCities: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const cuts = [0, ev(p, 'L14', 3), ev(p, 'L14', 4)];
  const idx = fr < cuts[1] ? 0 : fr < cuts[2] ? 1 : 2;
  const lf = fr - cuts[idx];
  const len = (idx < 2 ? cuts[idx + 1] : p.dur) - cuts[idx];
  const whipK = 1 - easeOut(clamp(lf / 5));
  const d = DOOR_STYLES[idx];
  const step = kf(lf, [0, len], [0, 1], (x) => x);
  const bg =
    idx === 0 ? (
      <Terrace t={t} px={-lf * 6} horizon={860} night={0.3} />
    ) : idx === 1 ? (
      <Lisbon t={t} px={-lf * 6} tram={kf(lf, [0, len], [0.25, 0.6], (x) => x)} />
    ) : (
      <BuenosAires t={t} px={-lf * 6} />
    );
  return (
    <Rig dur={p.dur} zoom={[1.04, 1.12]} rot={[1, -1]} pow={1.2}>
      <AbsoluteFill style={{transform: `translateX(${whipK * 700}px)`, filter: whipK > 0.05 ? `blur(${whipK * 24}px)` : undefined}}>
        {bg}
        <Svg>
          <rect x={20} y={820} width={300} height={860} fill={d.wall} />
          <WcDoor x={60} y={1640} w={220} h={600} open={kf(lf, [0, 4], [0.2, 1], easeOut)} glow={1} wood={d.wood} plaque={d.plaque} frame={d.frame} />
          <GalaTable x={760} y={1720} s={0.75} t={t} />
        </Svg>
        <PlacedDavi x={lerp(170, 420, step)} y={lerp(1640, 1760, step)} height={lerp(620, 760, step)} light={WARM_LIGHT} pose={{...walk(t, 0, 0.8), facing: 0.3}} expr={{smile: 0.7, lookX: 0.6}} />
        <PlacedLia x={850} y={1700} height={720} flip light={WARM_LIGHT} pose={{shR: 150, elR: 20 + Math.sin(t * 14) * 20, facing: -0.3}} expr={{smile: 0.9, mouthOpen: 0.25, lookX: -0.6}} />
      </AbsoluteFill>
      <CityStamp x={540} y={640} text={d.name} sub={['FR · MC', 'PORTUGAL', 'ARGENTINA'][idx]} color={['#d23c3c', '#1f5fae', '#2f8f5a'][idx]} k={kf(lf, [3, 8], [0, 1], easeIn)} rot={[-8, 6, -5][idx]} />
      <SpeedLines k={whipK * 0.8} t={t} />
      <Flash k={kf(lf, [7, 8, 11], [0, 0.18, 0], (x) => x)} color="255,240,220" />
      <Finish vignette={0.45} />
    </Rig>
  );
};

/* 22. "Ela achava que ele tinha muita milha." — Lia amused, thought bubble with a plane; HUD MILHAS racing. */
export const SMiles: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const u = kf(fr, [4, p.dur - 6], [0, 1], (x) => x * x);
  const miles = Math.round(lerp(12000, 999999, u));
  const bub = kf(fr, [2, 10], [0, 1], easeOut);
  const plane = (t * 0.9) % 1;
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} rot={[-1.5, 1]} pan={[20, 0, -20, 0]} origin={[480, 1000]} whip="l">
      <AbsoluteFill style={{filter: 'blur(16px)'}}>
        <Terrace t={t} px={-fr * 3} horizon={1150} night={0.4} />
      </AbsoluteFill>
      <PlacedLia
        x={420}
        y={2700}
        height={2150}
        light={WARM_LIGHT}
        upperOnly
        pose={{facing: 0.35, headTilt: 7, shL: -20, elL: 140, shR: 10, elR: -10}}
        expr={{smile: 0.8, halfSmile: 0.5, browRaise: 0.8, browAsym: 0.6, lookX: 0.8, lookY: -0.7}}
      />
      <Svg>
        <g opacity={bub} transform={`translate(${780},${700}) scale(${0.6 + 0.4 * bub})`}>
          <circle cx={-170} cy={250} r={16} fill="#fff" opacity={0.9} />
          <circle cx={-120} cy={190} r={26} fill="#fff" opacity={0.9} />
          <ellipse cx={0} cy={0} rx={250} ry={170} fill="#fff" opacity={0.95} />
          <path d="M -200,40 Q 0,-160 200,30" stroke="#9fb6cc" strokeWidth={4} strokeDasharray="12 10" fill="none" />
          <g transform={`translate(${lerp(-200, 200, plane)},${-60 - Math.sin(plane * Math.PI) * 60}) rotate(${lerp(-30, 25, plane)})`}>
            <path d="M -60,0 L 50,0 Q 70,0 70,8 Q 70,14 50,14 L -60,14 Z" fill="#2f6db3" />
            <path d="M -10,6 L -40,-40 L -20,-40 L 20,6 Z" fill="#1f4f8f" />
            <path d="M -10,10 L -40,56 L -20,56 L 20,10 Z" fill="#1f4f8f" />
            <path d="M -60,2 L -76,-24 L -64,-24 L -48,2 Z" fill="#1f4f8f" />
          </g>
        </g>
      </Svg>
      <HudTag x={1000} y={1640} label="MILHAS" value={miles.toLocaleString('pt-BR')} k={clamp(fr / 5)} align="right" size={96} />
      <Particles t={t} seed="ml" count={14} bokeh={8} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 23. "Quarto encontro." — Monaco at night, Lia at the table waving; ENCONTRO #4 stamp. */
export const SFourth: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.14, 1.04]} rot={[2, 0]} origin={[640, 1200]} pow={1.5} whip="r">
      <Terrace t={t} px={fr * 3} horizon={860} night={0.85}>
        <TerraceCrowd t={t} px={fr * 3} dim={0.15} />
        <PlacedLia x={700} y={1720} height={950} light={GALA_LIGHT} pose={{shL: -150, elL: Math.sin(t * 12) * 20, facing: -0.1, headTilt: 4}} expr={{smile: 0.9, browRaise: 0.4}} />
        <Svg>
          <GalaTable x={680} y={1900} s={1.15} t={t} candle={true} seed={4} />
        </Svg>
      </Terrace>
      <CityStamp x={540} y={640} text="ENCONTRO #4" sub="MÔNACO" color="#e2b04a" k={kf(fr, [3, 8], [0, 1], easeIn)} rot={-6} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 24. "Mônaco de novo." — wide terrace at night; Davi heads for the WC door. */
export const SAgain: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const s = kf(fr, [0, p.dur], [0, 1], (x) => x);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[0, 40, -40, -20]} rot={[-1, 1]} pow={1.2}>
      <Terrace t={t} px={-fr * 4} horizon={880} night={0.9}>
        <Svg>
          <rect x={860 - fr * 4} y={900} width={260} height={360} fill="#cdb79a" />
          <WcDoor x={900 - fr * 4} y={1260} w={170} h={320} />
        </Svg>
        <TerraceCrowd t={t} px={-fr * 4} />
        <PlacedDavi x={lerp(620, 860, s) - fr * 4} y={lerp(1420, 1300, s)} height={lerp(560, 470, s)} light={GALA_LIGHT} pose={{...walk(t, 0, 0.8), facing: 0.5}} expr={{smile: 0.3}} />
      </Terrace>
      <HudTag x={90} y={540} label="MÔNACO" value="DE NOVO" k={kf(fr, [2, 8], [0, 1])} size={92} />
      <Particles t={t} seed="ag" count={12} bokeh={6} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 25. "Ele vai no banheiro." — inside the marble restroom: the door swings open, Davi walks in. */
export const SEnter: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const o = kf(fr, [2, 10], [0, 1], easeOut);
  const s = kf(fr, [6, p.dur], [0, 1], (x) => x);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[30, 0, -30, 0]} rot={[1, -1]} origin={[400, 1100]} whip="l">
      <MarbleRoom t={t} px={-fr * 3} counterY={2400} mirror={[-600, 300, 10, 10]} />
      <Svg>
        {/* doorway */}
        <rect x={150} y={480} width={480} height={1240} fill="#c9962e" />
        <rect x={170} y={500} width={440} height={1220} fill="#2a2030" />
        <rect x={170} y={500} width={440} height={1220} fill="rgba(255,190,110,0.35)" />
        {/* door leaf swinging in toward camera */}
        <path d={`M170,500 L${170 + 440 * Math.cos(o * 1.3)},${500 - o * 80} L${170 + 440 * Math.cos(o * 1.3)},${1720 + o * 80} L170,1720 Z`} fill="#3b2216" />
        <circle cx={170 + 400 * Math.cos(o * 1.3)} cy={1110} r={14} fill="#e2b04a" />
        <rect x={0} y={1720} width={W} height={200} fill="#ece6dc" />
        {Array.from({length: 6}).map((_, i) => (
          <line key={i} x1={i * 220 - 100} y1={1720} x2={i * 300 - 400} y2={H} stroke="#cfc4b5" strokeWidth={3} />
        ))}
      </Svg>
      {fr >= 4 && (
        <PlacedDavi x={lerp(390, 600, s)} y={lerp(1700, 2050, s)} height={lerp(1060, 1500, s)} light={MARBLE_LIGHT} pose={{...walk(t, 0, 0.8), facing: 0.3}} expr={{smile: 0.2, lookX: 0.7}} />
      )}
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 26. "Na pia, um cara" — marble restroom; a man in a tuxedo at the sink, back to camera, tap running. */
export const SSink: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.12]} pan={[-30, 0, 20, 0]} rot={[0, 1.5]} origin={[540, 1100]} pow={1.3} whip="r">
      <MarbleRoom
        t={t}
        px={fr * 2}
        counterY={1300}
        mirror={[140, 360, 800, 760]}
        reflection={
          <AbsoluteFill style={{filter: 'blur(18px)', background: '#9fb0b6'}}>
            <Svg>
              <circle cx={560} cy={820} r={90} fill="#d79f78" />
              <rect x={420} y={900} width={280} height={300} fill="#17181d" />
            </Svg>
          </AbsoluteFill>
        }
      />
      {/* water stream from the centre faucet */}
      <Svg>
        <rect x={570 + fr * 2} y={1150} width={14} height={150} fill="rgba(210,240,255,0.7)" />
      </Svg>
      <TuxBack x={560 + fr * 2} y={1900} s={1.1} bend={0.6} scrub={Math.sin(t * 14)} />
      {/* Davi's shoulder, foreground left, out of focus */}
      <AbsoluteFill style={{filter: 'blur(16px)'}}>
        <Svg>
          <path d="M -200,1980 Q -160,1250 80,1180 Q 260,1140 330,1320 Q 360,1600 330,1980 Z" fill="#e0a92a" />
          <circle cx={60} cy={940} r={230} fill="#24170f" />
        </Svg>
      </AbsoluteFill>
      <Finish vignette={0.5} />
    </Rig>
  );
};

/* 27. "lavando a mão. De luva." — close on the hands under the tap: the foam washes off — black leather gloves. */
export const SGlove: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const G = ev(p, 'L15', 17);
  const reveal = kf(fr, [G - 8, G + 2], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} rot={[-3, 0]} origin={[540, 1000]} shakes={[{at: G, dur: 10, amp: 10}]} punches={[{at: G, amt: 0.12, len: 16}]} whip="d">
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#e6dfd4 0%,#cfc6b8 60%,#2b2a2f 61%,#17171b 100%)'}} />
      <Svg>
        {/* basin */}
        <ellipse cx={540} cy={1250} rx={520} ry={130} fill="#e9e6e0" />
        <ellipse cx={540} cy={1260} rx={460} ry={100} fill="#c4bfb6" />
        <ellipse cx={540} cy={1280} rx={60} ry={18} fill="#8a857c" />
        {/* faucet spout */}
        <path d="M 380,0 L 380,240 Q 380,300 450,300 L 600,300 L 600,340 L 450,340 Q 330,340 330,240 L 330,0 Z" fill="#d9a943" />
        <rect x={560} y={300} width={60} height={50} rx={10} fill="#c18f2c" />
        <path d="M 345,0 L 345,250" stroke="#ffe7a8" strokeWidth={8} opacity={0.7} />
      </Svg>
      <WashHands t={t} cx={590} cy={1020} s={1.05} reveal={reveal} flow={1} />
      <HudTag x={540} y={1620} label="MÃOS" value="LUVA" k={kf(fr, [G, G + 5], [0, 1])} align="center" size={100} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/* 28. "O Rocha." — mirror reveal: Rocha in tuxedo + sunglasses lifts his head; Davi frozen in the reflection behind. */
const RochaReflection: React.FC<{t: number; up: number; turn: number; smile: number; davi: number; scale?: number; dx?: number; talk?: number}> = ({t, up, turn, smile, davi, scale = 1, dx = 0, talk = 0}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#e9e2d7 0%,#d6cdbf 100%)'}}>
    <Svg>
      {/* reflected back wall: doorway + sconces */}
      <rect x={100 + dx} y={420} width={380} height={1100} fill="#2a2030" />
      <rect x={100 + dx} y={420} width={380} height={1100} fill="rgba(255,190,110,0.3)" />
      <circle cx={700 + dx} cy={560} r={140} fill="rgba(255,214,150,0.35)" />
    </Svg>
    <AbsoluteFill style={{transformOrigin: '540px 1500px', transform: `scale(${scale})`}}>
      <PlacedDavi x={300 + dx} y={1640} height={760} light={MARBLE_LIGHT} pose={{shL: -14, elL: 10, shR: 14, elR: -10, facing: 0.2}} expr={{eyesWide: davi, browRaise: davi, mouthOpen: davi * 0.3, lookX: 0.6}} />
      <PlacedAgent
        variant="rochaGala"
        x={650 + dx}
        y={2250 - up * 80}
        height={1500}
        light={MARBLE_LIGHT}
        upperOnly
        pose={{headTilt: lerp(16, 0, up), lean: lerp(10, 0, up), facing: turn, shL: -30, elL: 90 + Math.sin(t * 10) * 8, shR: 30, elR: -90 - Math.sin(t * 10) * 8}}
        expr={{halfSmile: smile, smile: smile * 0.3, browAsym: smile * 0.5, mouthOpen: talk}}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);

export const SMirror: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const R = ev(p, 'L16', 1);
  const up = kf(fr, [0, R + 2], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.14]} origin={[560, 900]} rot={[-1, 0.5]} shakes={[{at: R, dur: 10, amp: 8}]} punches={[{at: R, amt: 0.06}]}>
      <MarbleRoom
        t={t}
        counterY={1660}
        mirror={[90, 300, 900, 1260]}
        reflection={<RochaReflection t={t} up={up} turn={-0.1} smile={kf(fr, [R, R + 8], [0, 0.6])} davi={kf(fr, [R - 4, R + 2], [0, 1])} />}
      />
      <Flash k={kf(fr, [R, R + 1, R + 5], [0, 0.25, 0], (x) => x)} color="255,255,255" />
      <Finish vignette={0.6} />
    </Rig>
  );
};

/* 29. "Banheiro é previsível, Davi." — close on Rocha in the mirror, smiling, drying the gloves; turns his head on "Davi". */
export const SRocha: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const D = ev(p, 'L16', 5);
  const talk = fr < D + 10 && fr > 2 ? Math.abs(Math.sin(t * 15)) * 0.25 : 0;
  const turn = kf(fr, [D - 2, D + 4], [0, -0.45], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.14]} origin={[640, 820]} rot={[1.5, -0.5]} pow={1.3} punches={[{at: D, amt: 0.08, len: 14}]} whip="r">
      <MarbleRoom
        t={t}
        px={-fr}
        counterY={2400}
        mirror={[-40, 140, 1160, 1700]}
        reflection={
          <AbsoluteFill style={{transformOrigin: '640px 700px', transform: 'scale(1.9)'}}>
            <RochaReflection t={t} up={1} turn={turn} smile={0.9} talk={talk} davi={1} dx={-120} />
          </AbsoluteFill>
        }
      />
      <Finish vignette={0.6} tint="rgba(120,140,170,0.18)" />
    </Rig>
  );
};

export {W, H, easeIn};
