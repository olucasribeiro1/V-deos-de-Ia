import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Globe, SpaceBackdrop, globeView, globeProject} from '../../environments/Globe';
import {Presenter} from '../Presenter';
import {
  Cam2D, Chip, HudTag, Svg, Studio, Bottle, Drop, BigText,
  ShotP, ABS0, ev, kf, easeOut, clamp, lerp, smooth, sine, AQUA, SALT, YEL, BLUE, BRAZIL, SALVADOR, fadeIn,
} from './kit';

/* 7. "Oi, eu sou o Davi." — presenter to camera, waves on "Oi". */
export const SHello: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const wave = kf(fr, [0, 6, 34, 44], [0, 1, 1, 0], smooth);
  const w = Math.sin(t * 11);
  return (
    <Cam2D d={p.dur} zoom={[1.0, 1.06]} origin={[540, 820]} ease={sine}>
      <Studio t={t} />
      <Presenter
        absOffset={ABS0 + p.from}
        x={540}
        y={2160}
        height={1500}
        upperOnly
        pose={{shR: lerp(8, 148, wave), elR: lerp(0, 22 + w * 22, wave), shL: -8, elL: 0, headTilt: 3 + Math.sin(t * 1.3) * 2}}
        expr={{smile: 0.65}}
      />
    </Cam2D>
  );
};

/* 8. "Hoje a gente vai entender por que" — slow pan, explaining gesture, floating drop + "?" icons. */
export const SToday: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const g = kf(fr, [2, 14], [0, 1], smooth);
  return (
    <Cam2D d={p.dur} zoom={[1.08, 1.12]} pan={[-40, 0, 30, 0]} origin={[540, 900]} ease={sine}>
      <Studio t={t + 3} px={-60} />
      <Svg>
        <g opacity={fadeIn(fr, 6, 16)} transform={`translate(0,${Math.sin(t * 2) * 10})`}>
          <circle cx={230} cy={760} r={110} fill="#ffffff" opacity={0.85} />
          <Drop x={230} y={770} s={140} fill={AQUA} />
          <text x={340} y={720} fontFamily="Oswald" fontWeight={700} fontSize={130} fill={BLUE}>?</text>
        </g>
      </Svg>
      <Presenter
        absOffset={ABS0 + p.from}
        x={680}
        y={2200}
        height={1520}
        upperOnly
        pose={{shL: lerp(-8, -55, g), elL: lerp(0, -70 + Math.sin(t * 3) * 8, g), shR: 10, elR: 0, facing: -0.15}}
        expr={{smile: 0.45, lookX: -0.1}}
      />
    </Cam2D>
  );
};

const GlobeShot: React.FC<{t: number; rot: number; tilt: number; zoom: number; cy?: number; brazil?: number; pin?: number; drift?: number}> = ({t, rot, tilt, zoom, cy = 940, brazil = 0, pin = 0, drift = 0}) => {
  const v = globeView({cx: 540, cy, radius: 380, zoom, rotation: rot, tilt});
  const pts = BRAZIL.map(([lo, la]) => globeProject(v, la, lo));
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ') + ' Z';
  return (
    <AbsoluteFill>
      <SpaceBackdrop t={t} driftX={drift} />
      <Globe cx={540} cy={cy} radius={380} zoom={zoom} rotation={rot} tilt={tilt} t={t} night={0.35} grid={0.2}
        pins={pin > 0 ? [{...SALVADOR, label: 'SALVADOR', color: YEL, drop: clamp(pin), pulse: pin >= 1 ? (t * 1.2) % 1 : 0, labelSide: 'right', scale: 1.1}] : []}
      />
      {brazil > 0 && (
        <Svg>
          <path d={d} fill="#4fc3f7" opacity={0.45 * brazil} />
          <path d={d} fill="none" stroke="#bff0ff" strokeWidth={6} strokeLinejoin="round" opacity={brazil} style={{filter: 'drop-shadow(0 0 12px #4fc3f7)'}} />
        </Svg>
      )}
    </AbsoluteFill>
  );
};

/* 9. "falta água num país que" — Earth turning toward South America. */
export const SGlobe: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const rot = kf(fr, [0, p.dur], [10, -48], sine);
  return (
    <Cam2D d={p.dur} zoom={[0.94, 1.02]} origin={[540, 940]} ease={sine}>
      <GlobeShot t={t} rot={rot} tilt={-8} zoom={1.05} drift={-fr * 2} />
    </Cam2D>
  );
};

/* 10. "tem doze por cento da água doce do mundo." — zoom on Brazil, it lights up; 12 % tag. */
export const SBrazil: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const z = kf(fr, [0, p.dur], [1.25, 1.75], sine);
  const lit = fadeIn(fr, 2, 16);
  return (
    <AbsoluteFill>
      <GlobeShot t={t} rot={kf(fr, [0, p.dur], [-48, -52], sine)} tilt={-14} zoom={z} cy={940} brazil={lit} drift={-fr} />
      <HudTag x={540} y={1610} label="DA ÁGUA DOCE DO MUNDO" value="12%" k={fadeIn(fr, ev(p, 'L2', 18) - 2, ev(p, 'L2', 18) + 8)} align="center" color={YEL} size={150} />
      <Chip x={540} y={570} text="BRASIL" k={fadeIn(fr, 6, 14)} color="#ffffff" fg={BLUE} size={40} />
    </AbsoluteFill>
  );
};

/* 11. "E se isso pode acontecer em Salvador." — push to the Northeast coast, pin drops on Salvador. */
export const SSalvador: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const z = kf(fr, [0, p.dur], [1.8, 3.0], sine);
  const rot = kf(fr, [0, p.dur], [-52, -40], sine);
  const tilt = kf(fr, [0, p.dur], [-14, -13], sine);
  const pin = kf(fr, [ev(p, 'L2', 32) - 8, ev(p, 'L2', 32) + 4], [0, 1], easeOut);
  return (
    <AbsoluteFill>
      <GlobeShot t={t} rot={rot} tilt={tilt} zoom={z} cy={960} brazil={0.3} pin={pin} drift={-fr * 1.5} />
      <Chip x={540} y={1700} text="SALVADOR · BAHIA" k={fadeIn(fr, ev(p, 'L2', 32), ev(p, 'L2', 32) + 8)} color={YEL} fg="#141414" size={44} />
    </AbsoluteFill>
  );
};

/* 12. "Quase toda a água do planeta é" — open ocean, gentle swell, sparkles. */
export const SOcean: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const layers = ['#2f7fb8', '#256ea5', '#1d5e92', '#174f80', '#11416d'];
  return (
    <Cam2D d={p.dur} zoom={[1.02, 1.1]} pan={[0, 0, -30, -20]} origin={[540, 1000]} ease={sine}>
      <AbsoluteFill style={{background: 'linear-gradient(#7cc4ee 0%, #cfeaf8 38%)'}}>
        <Svg>
          <circle cx={300} cy={560} r={70} fill="#fff8dc" />
          <Cloudy t={t} />
          {layers.map((c, i) => {
            const y0 = 780 + i * 230;
            const amp = 14 + i * 8;
            const pts = Array.from({length: 14}).map((_, j) => `Q${j * 90 + 45},${y0 - amp + Math.sin(t * 2 + j + i) * amp} ${j * 90 + 90},${y0}`).join(' ');
            return <path key={i} d={`M-60,${y0} ${pts} L1200,2000 L-60,2000 Z`} fill={c} />;
          })}
          {Array.from({length: 18}).map((_, i) => {
            const ph = ((t * 0.8 + random(`sp${i}`)) % 1 + 1) % 1;
            return <circle key={i} cx={random(`sx${i}`) * 1080} cy={820 + random(`sy${i}`) * 1000} r={5 + ph * 4} fill="#ffffff" opacity={Math.sin(ph * Math.PI) * 0.8} />;
          })}
        </Svg>
        <Chip x={540} y={1720} text="OCEANOS · MARES" k={fadeIn(fr, 8, 16)} color={SALT} fg="#fff" size={40} />
      </AbsoluteFill>
    </Cam2D>
  );
};
const Cloudy: React.FC<{t: number}> = ({t}) => (
  <g opacity={0.9}>
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={((i * 420 + t * 20) % 1400) - 160} cy={640 + i * 30} rx={130} ry={34} fill="#fff" />
    ))}
  </g>
);

/* 100-bottle grid shared by shots 13–14. */
const GRID = {cols: 10, rows: 10, x0: 120, y0: 580, dx: 93, dy: 82};
const cellXY = (i: number) => ({x: GRID.x0 + (i % GRID.cols) * GRID.dx, y: GRID.y0 + Math.floor(i / GRID.cols) * GRID.dy});
const BottleGrid: React.FC<{fr: number; reveal: number; dim: number; fresh: number; t: number}> = ({reveal, dim, fresh, t}) => (
  <g>
    {Array.from({length: 100}).map((_, i) => {
      const k = clamp((reveal * 110 - i) / 8);
      if (k <= 0) return null;
      const {x, y} = cellXY(i);
      const isFresh = i >= 98;
      const half = i === 97;
      const s = lerp(0.4, 1, easeOut(k));
      const col = isFresh ? lerp(0, 1, fresh) > 0.5 ? '#7fdcff' : SALT : SALT;
      return (
        <g key={i} transform={`translate(${x},${y}) scale(${s}) translate(${-x},${-y})`} opacity={isFresh || half ? 1 : lerp(1, 0.55, dim)}>
          <Bottle x={x} y={y} s={70} color={col} glow={isFresh ? fresh * (0.8 + 0.2 * Math.sin(t * 5)) : 0} />
          {half && fresh > 0.5 && (
            <g>
              <clipPath id="halfb">
                <rect x={x - 20} y={y} width={40} height={40} />
              </clipPath>
              <g clipPath="url(#halfb)">
                <Bottle x={x} y={y} s={70} color="#7fdcff" />
              </g>
            </g>
          )}
        </g>
      );
    })}
  </g>
);

/* 13. "salgada. Só dois e meio" — 100 bottles pop in, all salt-water dark blue. */
export const SBottles: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const reveal = kf(fr, [0, 24], [0, 1], smooth);
  const fresh = kf(fr, [ev(p, 'L3', 9), ev(p, 'L3', 9) + 8], [0, 1], easeOut);
  return (
    <Cam2D d={p.dur} zoom={[1.04, 1.0]} origin={[540, 960]} ease={sine}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 50%, #e8f4fb 0%, #b8d8ec 100%)'}}>
        <Svg>
          <rect x={90} y={520} width={900} height={850} rx={30} fill="#ffffff" opacity={0.5} />
          <BottleGrid fr={fr} reveal={reveal} dim={0} fresh={fresh} t={t} />
        </Svg>
        <Chip x={540} y={1700} text="100 GARRAFAS = TODA A ÁGUA DA TERRA" k={fadeIn(fr, 6, 14)} color="#ffffff" fg={SALT} size={36} />
      </AbsoluteFill>
    </Cam2D>
  );
};

/* 14. "por cento é doce." — salt bottles dim, the last 2.5 turn light blue and glow; push in. */
export const SFresh: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const dim = kf(fr, [0, 12], [0, 1], smooth);
  const tgt = cellXY(98);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 50%, #e8f4fb 0%, #b8d8ec 100%)'}}>
      <Cam2D d={p.dur} zoom={[1.0, 1.35]} origin={[tgt.x, tgt.y]} ease={sine}>
        <Svg>
          <rect x={90} y={520} width={900} height={850} rx={30} fill="#ffffff" opacity={0.5} />
          <BottleGrid fr={fr} reveal={1} dim={dim} fresh={1} t={t} />
        </Svg>
      </Cam2D>
      <Chip x={540} y={1700} text="SALGADA 97,5% · DOCE 2,5%" k={fadeIn(fr, 4, 12)} color={SALT} fg="#fff" size={46} />
    </AbsoluteFill>
  );
};

export {BigText, YEL};
