import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {Finish} from '../../scenes/common';
import {Flash} from '../../fx/Rastro';
import {Rig, ShotP, SpeedLines, abs, ev} from './rig';
import {CHEFE, Chip, DAVI_OUTFIT, Finger, LAMP_LIGHT, Pup, Svg, headOf, run} from './kit';
import {InterTable, InterrogationRoom} from './sets';

const swingAt = (t: number) => Math.sin(t * 2.6) * 9;

/* 1. "O governo quis ele lendo suspeito" — the little room: Davi seated, the boss slides the SUSPEITO folder. */
export const SRoom: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const slide = kf(fr, [2, 16], [0, 1], easeOut);
  return (
    <Rig dur={p.dur} zoom={[1.12, 1.02]} pan={[-30, 20, 20, 0]} rot={[-1.5, 0.5]} pow={1.6}>
      <InterrogationRoom swing={swingAt(t)} floorY={1290} />
      <Pup outfit={DAVI_OUTFIT} x={360} y={1700} height={880} upperOnly light={LAMP_LIGHT} pose={{shL: -10, elL: 30, shR: 30, elR: 40, facing: 0.35, headTilt: -3}} expr={{lookX: 0.6, browAsym: 0.6, halfSmile: 0.3}} />
      <Pup outfit={CHEFE} x={790} y={1640} height={1000} light={LAMP_LIGHT} pose={{lean: -14, shL: lerp(-20, -55, slide), elL: lerp(-10, -25, slide), shR: 10, elR: -10, facing: -0.4}} expr={{lookX: -0.6}} />
      <InterTable x={560} y={1250} s={1.35} folder={0} />
      <Svg>
        {/* folder sliding toward Davi */}
        <g transform={`translate(${lerp(700, 470, slide)},${1226}) rotate(${lerp(-3, -10, slide)})`}>
          <rect x={-130} y={-26} width={220} height={30} rx={3} fill="#e0bb70" />
          <rect x={-120} y={-34} width={80} height={12} rx={3} fill="#e0bb70" />
          <text x={-20} y={-4} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={20} fill="#7a1f1f">
            SUSPEITO
          </text>
        </g>
      </Svg>
      <Finish vignette={0.7} grain={0.12} />
    </Rig>
  );
};

/* 2. "numa salinha." — boss taps the folder, the room squeezes in (comic), HUD SALINHA 2×3 m. */
export const SSalinha: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const S = ev(p, 'L9', 7);
  const sq = kf(fr, [S, S + 5, S + 10, S + 14], [0, 1, 0.8, 0.86], easeOut);
  const tap = Math.max(0, Math.sin(fr * 0.9)) * kf(fr, [0, 10], [1, 0]);
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.1]} pan={[30, 0, -30, -10]} rot={[1, -1]} whip="r" punches={[{at: S, amt: 0.06}]}>
      <AbsoluteFill style={{transform: `scaleX(${1 - sq * 0.22})`, transformOrigin: '540px 960px'}}>
        <InterrogationRoom swing={swingAt(t)} floorY={1290} px={-fr * 2} />
      </AbsoluteFill>
      <Pup outfit={CHEFE} x={680} y={1820} height={1250} light={LAMP_LIGHT} pose={{lean: -10, shL: -40 + tap * 8, elL: -40, shR: 12, elR: -8, facing: -0.3}} expr={{lookX: -0.5}} />
      <Pup outfit={DAVI_OUTFIT} x={260} y={1880} height={1150} upperOnly light={LAMP_LIGHT} pose={{shL: -10, elL: 20, shR: 10, elR: 10, facing: 0.4}} expr={{lookX: 0.7, lookY: -0.4, browAsym: 0.8, smile: -0.1}} />
      <InterTable x={520} y={1330} s={1.7} />
      <Chip x={540} y={1690} text="SALINHA · 2×3 m" k={kf(fr, [S, S + 5], [0, 1], easeOut)} color="#ffd23a" />
      <Finish vignette={0.75} grain={0.12} />
    </Rig>
  );
};

/* 3. "Ele recusou." — Davi close-up, wagging finger "no" with a half smile. */
export const SNo: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const up = kf(fr, [0, 6], [0, 1], easeOut);
  const wag = Math.sin(fr * 1.05) * 18 * up;
  const shR = lerp(20, 122, up);
  const elR = lerp(20, 38, up) + wag;
  const h = 1750;
  const hd = headOf(470, 2420, h);
  return (
    <Rig dur={p.dur} zoom={[1.05, 1.14]} pan={[0, 0, -10, -10]} rot={[1.5, -0.5]} pow={1.4} whip="d">
      <AbsoluteFill style={{filter: 'blur(10px)'}}>
        <InterrogationRoom swing={swingAt(t)} floorY={1400} px={80} />
      </AbsoluteFill>
      <Pup
        outfit={DAVI_OUTFIT}
        x={470}
        y={2420}
        height={h}
        upperOnly
        light={LAMP_LIGHT}
        pose={{shR, elR, shL: -8, elL: 10, headTilt: Math.sin(fr * 1.05) * 3 * up, facing: 0.1}}
        expr={{halfSmile: 0.9, blink: 0.3, browAsym: 0.9, lookX: 0.2}}
        handProps={{R: <Finger angle={shR + elR} />}}
      />
      <Svg>
        {/* motion arcs of the wag */}
        <path d={`M ${hd.x + 360},${hd.y - 220} q 60,-30 120,0`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5 * up} />
      </Svg>
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};

/* 4. "Daí a correria." — Davi bursts out of the SALA 3 door, papers fly, whip out to the metro. */
export const SFuga: React.FC<ShotP> = (p) => {
  const fr = useCurrentFrame();
  const t = abs(p, fr);
  const u = kf(fr, [0, p.dur], [0, 1], (x) => x);
    const x = lerp(380, 1300, easeIn(u));
  return (
    <Rig dur={p.dur} zoom={[1.0, 1.08]} pan={[0, 0, -60, 0]} rot={[0, -2]} whipOut="r" shakes={[{at: 2, amp: 18, dur: 10}]}>
      <InterrogationRoom swing={swingAt(t) * 2.5} floorY={1290} px={-200} />
      <Svg>
        {Array.from({length: 9}).map((_, i) => {
          const r = (k: string) => random(`pp${i}${k}`);
          const k = clamp((fr - 3 - r('d') * 4) / 26);
          if (k <= 0) return null;
          const px = 420 + r('x') * 200 - k * (100 + r('v') * 300);
          const py = 1230 - k * (300 + r('h') * 300) + k * k * 520;
          return <rect key={i} x={px} y={py} width={70} height={90} fill="#f4f1ea" stroke="#c9c2b4" strokeWidth={2} transform={`rotate(${r('r') * 360 + k * 400} ${px + 35} ${py + 45})`} />;
        })}
      </Svg>
      <InterTable x={420} y={1330} s={1.4} folder={0} />
      <Pup outfit={DAVI_OUTFIT} x={x} y={1760} height={1050} light={LAMP_LIGHT} pose={{...run(t, 0, 1), facing: 0.6}} expr={{smile: 0.5, eyesWide: 0.2, lookX: 1}} blur={u > 0.4 ? 3 : 0} />
      <SpeedLines k={kf(fr, [8, p.dur], [0, 0.9])} t={t} />
      <Flash k={kf(fr, [p.dur - 3, p.dur], [0, 0.5])} color="255,255,255" />
      <Finish vignette={0.6} grain={0.12} />
    </Rig>
  );
};
