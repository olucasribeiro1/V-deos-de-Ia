import React from 'react';
import {AbsoluteFill, spring} from 'remotion';
import {Rig, Svg, useShot} from './kit';
import {AcaiCup, Can, PhoneCall} from './props';
import {Actor, Copacabana} from '../../environments/Copacabana';
import {PlacedDavi, DAVI_OUTFIT} from '../../characters/Davi';
import {PlacedAgent} from '../../characters/Agent';
import {FaceCloseup, SleeveArm} from '../../characters/Closeups';
import {Flash, Rastro} from '../../fx/Rastro';
import {Shockwave} from '../../fx/Shockwave';
import {Particles} from '../../fx/Particles';
import {Finish} from '../../scenes/common';
import {Cam, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {clamp, easeIn, easeOut, kf, lerp, wobble} from '../../lib/anim';

const T0 = 86;
/** Davi's spot by the kiosk (kiosk front at z ≈ 14.2, x 0.7..6.1). */
export const KD = {x: 0.9, z: 13.3};
const KR = {x: 1.62, z: 13.45};
const CUP = {x: 1.45, y: 0.92, z: 13.95};

/** Puppet-local point -> screen for a PlacedPuppet at (sx, sy) with on-screen height hpx. */
const toScreen = (sx: number, sy: number, hpx: number, u: number, v: number) => ({x: sx + (u * hpx) / 1000, y: sy + (v * hpx) / 1000});
const rad = (d: number) => (d * Math.PI) / 180;
const wristOf = (sh: number, el: number, side: 1 | -1) => {
  const s = [side * 128, -728];
  const e = [s[0] + Math.sin(rad(sh)) * 182, s[1] + Math.cos(rad(sh)) * 182];
  return [e[0] + Math.sin(rad(sh + el)) * 168, e[1] + Math.cos(rad(sh + el)) * 168];
};

const cupActor = (visible: boolean): Actor => ({
  key: 'cup',
  x: CUP.x,
  y: CUP.y,
  z: CUP.z,
  render: ({sx, sy, ppm}) =>
    visible ? (
      <Svg>
        <g transform={`translate(${sx},${sy - ppm * 0.07})`}>
          <AcaiCup h={ppm * 0.14} />
        </g>
      </Svg>
    ) : null,
});

/** c13 — "Ele já tinha visto": Davi's close-up, eyes to the sea, half smile. */
export const DaviSmile: React.FC = () => {
  const {frame, t, p} = useShot();
  const bg: Cam = {x: KD.x + 0.6, y: 1.2, z: KD.z - 1.4, pitch: 2, f: 1650, cy: H * 0.5};
  const half = kf(frame, [8, 20], [0, 1]);
  return (
    <Rig s0={1.0} s1={1.14} x0={30} x1={-10} r0={2} r1={-1} whipIn="right">
      <AbsoluteFill style={{transform: 'scale(1.1)'}}>
        <Copacabana cam={bg} t={t + T0} focus={0.5} aperture={22} />
      </AbsoluteFill>
      <Svg>
        <FaceCloseup
          cx={540}
          cy={1010}
          k={5.4}
          skin={DAVI_OUTFIT.skin}
          style={DAVI_OUTFIT.head}
          facing={-0.18}
          expr={{lookX: -0.8, lookY: -0.2, halfSmile: half, smile: half * 0.25, browAsym: half * 0.6, blink: kf(frame, [3, 5, 7], [0, 1, 0])}}
        />
      </Svg>
      <Particles t={t} seed="c13" count={24} bokeh={8} driftX={-18} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** c14 — "Estalo.": Rocha holds Davi's wrist at the kiosk -> both vanish. */
export const Estalo: React.FC = () => {
  const {frame, t, p} = useShot();
  const GO = 4;
  const cam: Cam = {x: KD.x + 0.35, y: 1.15, z: KD.z - 4.2 + p * 0.6, pitch: -2, f: 1650, cy: H * 0.52};
  const mid = project(cam, (KD.x + KR.x) / 2, 0, KD.z)!;
  const c = project(cam, (KD.x + KR.x) / 2, 1.0, KD.z)!;
  const gone = frame >= GO;
  const actors: Actor[] = [cupActor(true)];
  if (!gone) {
    actors.push(
      {
        key: 'davi',
        x: KD.x,
        z: KD.z,
        shadow: 1,
        render: ({sx, sy, ppm}) => (
          <PlacedDavi x={sx} y={sy} height={ppm * 1.75} pose={{shR: 30, elR: 4, shL: -6, elL: 6, facing: 0.1}} expr={{blink: kf(frame, [0, 2], [0, 1]), halfSmile: 1, browAsym: 0.4}} />
        ),
      },
      {
        key: 'rocha',
        x: KR.x,
        z: KR.z,
        shadow: 1,
        render: ({sx, sy, ppm}) => <PlacedAgent variant="rocha" x={sx} y={sy} height={ppm * 1.8} pose={{shL: -14, elL: -6, shR: 6, facing: -0.3}} expr={{smile: 0.6}} />,
      },
    );
  }
  return (
    <Rig s0={1.0} s1={1.06} impacts={[{at: GO, amp: 34, dur: 18, zoom: 0.08}]}>
      <Copacabana cam={cam} t={t + T0} focus={KD.z - cam.z} aperture={9} actors={actors} />
      {gone && <Shockwave cx={c.sx} cy={c.sy} age={frame - GO} rings={5} speed={34} gap={5} maxR={1700} ground={{cam, x: (KD.x + KR.x) / 2, z: KD.z, speed: 0.4}} />}
      <Rastro x={mid.sx} y={mid.sy} height={mid.ppm * 2.0} life={(frame - GO + 1) / 26} frame={frame} seed="c14r" />
      <Flash k={kf(frame, [GO, GO + 1, GO + 7], [0, 0.95, 0], (x) => x)} />
      <Particles t={t} seed="c14" count={30} bokeh={6} driftX={10} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** c20 — "O Davi volta pro açaí": Rastro, Davi reappears, grabs the cup. */
export const BackAcai: React.FC = () => {
  const {frame, t, p} = useShot();
  const IN = 2;
  const cam: Cam = {x: KD.x + 0.45, y: 1.3, z: KD.z - 2.7 + p * 0.5, pitch: 0, f: 1650, cy: H * 0.5};
  const reach = kf(frame, [10, 17], [0, 1], easeOut);
  const bring = kf(frame, [20, 28], [0, 1]);
  const shR = lerp(lerp(8, 52, reach), -10, bring);
  const elR = lerp(lerp(-4, -24, reach), -128, bring);
  const here = frame >= IN;
  const cupP = project(cam, CUP.x, CUP.y, CUP.z)!;
  const actors: Actor[] = [cupActor(reach < 0.98)];
  let handPos = {x: 0, y: 0};
  let cupPx = cupP.ppm * 0.14;
  const foot = project(cam, KD.x, 0, KD.z)!;
  const hpx = foot.ppm * 1.75;
  {
    const [u, v] = wristOf(shR, elR, 1);
    handPos = toScreen(foot.sx, foot.sy, hpx, u, v);
    cupPx = foot.ppm * 0.14 * 1.15;
  }
  if (here)
    actors.push({
      key: 'davi',
      x: KD.x,
      z: KD.z,
      shadow: 1,
      render: ({sx, sy, ppm}) => (
        <PlacedDavi
          x={sx}
          y={sy}
          height={ppm * 1.75}
          pose={{shR, elR, shL: -8, elL: 6, facing: 0.15, bob: kf(frame, [IN, IN + 4], [-30, 0], easeOut)}}
          expr={{halfSmile: 0.8, smile: bring * 0.4, blink: kf(frame, [24, 26, 28], [0, 1, 0]), lookX: lerp(0.2, 0.8, reach) * (1 - bring)}}
        />
      ),
    });
  return (
    <Rig s0={1.0} s1={1.12} x0={0} x1={-30} impacts={[{at: IN, amp: 18, zoom: 0.05}]} whipIn="right">
      <Copacabana cam={cam} t={t + T0 + 6} focus={KD.z - cam.z} aperture={11} actors={actors} />
      {reach >= 0.98 && (
        <Svg>
          <g transform={`translate(${handPos.x},${handPos.y - cupPx * 0.25})`}>
            <AcaiCup h={cupPx} />
          </g>
        </Svg>
      )}
      <Rastro x={foot.sx} y={foot.sy} height={hpx * 1.05} life={(frame - IN + 1) / 24} frame={frame} seed="c20r" />
      <Flash k={kf(frame, [IN, IN + 1, IN + 5], [0, 0.7, 0], (x) => x)} />
      <Particles t={t} seed="c20" count={24} bokeh={7} driftX={-12} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** c22 — "e liga pra Marinha": phone in Davi's hand. */
export const Phone: React.FC = () => {
  const {frame, t, p, fps} = useShot();
  const bg: Cam = {x: KD.x + 0.3, y: 1.1, z: KD.z - 1.2, pitch: 6, f: 1650, cy: H * 0.5};
  const inn = spring({frame, fps, config: {damping: 14, stiffness: 200, mass: 0.6}});
  const buzz = frame % 12 < 6 ? Math.sin(frame * 3.3) * 4 : 0;
  const ring = (frame / 22) % 1;
  return (
    <Rig s0={1.0} s1={1.16} r0={-6} r1={2} whipIn="up" oy={1000}>
      <AbsoluteFill style={{transform: 'scale(1.1)'}}>
        <Copacabana cam={bg} t={t + T0 + 8} focus={0.4} aperture={24} props={undefined} />
      </AbsoluteFill>
      <Svg>
        <g transform={`translate(${540 + buzz},${lerp(1500, 930, inn)}) rotate(${-8 + buzz * 0.5})`}>
          {/* sleeve + hand behind the phone */}
          <path d="M -120,330 L 150,330 L 220,1100 L -260,1100 Z" fill={DAVI_OUTFIT.top.base} />
          <path d="M -130,320 L 160,320 L 170,390 L -140,390 Z" fill={DAVI_OUTFIT.top.shade} />
          <ellipse cx={20} cy={240} rx={190} ry={170} fill={DAVI_OUTFIT.skin.base} />
          <g transform="translate(0,-40)">
            <PhoneCall h={760} ring={ring} elapsed={`00:0${Math.min(9, Math.floor(frame / 30))}`} />
          </g>
          {/* fingers over the edges */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={170} y={-60 + i * 92} width={84} height={64} rx={32} fill={i % 2 ? DAVI_OUTFIT.skin.base : DAVI_OUTFIT.skin.light} stroke={DAVI_OUTFIT.skin.shade} strokeWidth={4} />
          ))}
          <rect x={-252} y={60} width={78} height={170} rx={38} fill={DAVI_OUTFIT.skin.base} stroke={DAVI_OUTFIT.skin.shade} strokeWidth={4} transform="rotate(-18 -213 145)" />
        </g>
        {/* vibration ticks */}
        {frame % 12 < 6 &&
          [-1, 1].map((s) => (
            <g key={s} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.8}>
              <line x1={540 + s * 250} y1={600} x2={540 + s * 290} y2={580} />
              <line x1={540 + s * 255} y1={650} x2={540 + s * 300} y2={650} />
              <line x1={540 + s * 250} y1={700} x2={540 + s * 290} y2={720} />
            </g>
          ))}
      </Svg>
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** c23 — "Segue aí pra ver o que a Linha": high angle, three suits rush the kiosk, nobody there. */
export const Agents: React.FC = () => {
  const {frame, t, p} = useShot();
  const cam: Cam = {x: KD.x + 0.6, y: 8.5 - p * 1.2, z: KD.z - 9.5 + p * 1.2, pitch: 34, f: 1450, cy: H * 0.5};
  const run = kf(frame, [0, 24], [0, 1], easeOut);
  const agents = [
    {v: 'agentA' as const, x0: -2.5, z0: 7.0, x1: KD.x - 0.9, z1: KD.z - 0.6, ph: 0},
    {v: 'agentB' as const, x0: KD.x + 0.4, z0: 6.0, x1: KD.x + 0.2, z1: KD.z - 1.2, ph: 1.3},
    {v: 'agentA' as const, x0: 4.5, z0: 7.5, x1: KD.x + 1.4, z1: KD.z - 0.5, ph: 2.1},
  ];
  const actors: Actor[] = agents.map((a, i) => {
    const sw = Math.sin(t * 14 + a.ph) * (1 - run) * 30;
    return {
      key: 'ag' + i,
      x: lerp(a.x0, a.x1, run),
      z: lerp(a.z0, a.z1, run),
      shadow: 0.6,
      render: ({sx, sy, ppm}) => (
        <PlacedAgent
          variant={a.v}
          x={sx}
          y={sy}
          height={ppm * 1.8}
          pose={{hipL: sw, hipR: -sw, knL: Math.max(0, sw), knR: Math.max(0, -sw), shL: -sw * 0.8 - 6, shR: -sw * 0.8 + 6, lean: (1 - run) * 6, facing: run > 0.9 ? wobble(t * 3, i) : 0}}
          expr={{browTilt: -0.6, smile: -0.4}}
        />
      ),
    };
  });
  const spot = project(cam, KD.x, 0, KD.z)!;
  return (
    <Rig s0={1.04} s1={1.14} r0={3} r1={-2} whipIn="down">
      <Copacabana cam={cam} t={t + T0 + 10} focus={spot.depth} aperture={7} actors={actors} />
      <Svg>
        <ellipse cx={spot.sx} cy={spot.sy} rx={spot.ppm * 0.5} ry={spot.ppm * 0.2} fill="none" stroke="#8fd3ff" strokeWidth={4} strokeDasharray="14 10" opacity={kf(frame, [8, 14], [0, 0.8])} />
      </Svg>
      <Particles t={t} seed="c23" count={24} bokeh={5} driftX={-10} />
      <Finish vignette={0.5} />
    </Rig>
  );
};

/** c25 — "que ele aprendeu a jogar a": Davi tosses a red can, smirk. */
export const Toss: React.FC = () => {
  const {frame, t, p} = useShot();
  const cam: Cam = {x: KD.x + 0.2, y: 1.42, z: KD.z - 1.9 + p * 0.35, pitch: -1, f: 1650, cy: H * 0.55};
  const foot = project(cam, KD.x, 0, KD.z)!;
  const hpx = foot.ppm * 1.75;
  const flick = Math.abs(Math.sin((frame / 17) * Math.PI));
  const shR = 34 - flick * 6;
  const elR = 150 + flick * 12;
  const [u, v] = wristOf(shR, elR, 1);
  const hand = toScreen(foot.sx, foot.sy, hpx, u, v);
  const ph = (frame % 17) / 17;
  const canY = hand.y - hpx * 0.07 - Math.sin(ph * Math.PI) * hpx * 0.2;
  return (
    <Rig s0={1.0} s1={1.12} x0={20} x1={-20} whipIn="left" oy={800}>
      <Copacabana
        cam={cam}
        t={t + T0 + 12}
        focus={KD.z - cam.z}
        aperture={14}
        actors={[
          {
            key: 'davi',
            x: KD.x,
            z: KD.z,
            render: ({sx, sy, ppm}) => (
              <PlacedDavi
                x={sx}
                y={sy}
                height={ppm * 1.75}
                pose={{shR, elR, shL: -8, elL: 8, facing: 0.15, headTilt: -3}}
                expr={{halfSmile: 1, smile: 0.25, browAsym: 0.7, lookX: 0.7, lookY: -0.7}}
              />
            ),
          },
        ]}
      />
      <Svg>
        <g transform={`translate(${hand.x},${canY}) rotate(${frame * 21})`}>
          <Can h={hpx * 0.075} spin={frame * 40} id="c25can" />
        </g>
      </Svg>
      <Particles t={t} seed="c25" count={24} bokeh={8} driftX={-14} />
      <Finish vignette={0.55} />
    </Rig>
  );
};

/** c26 — "lata de propósito.": can spinning above the hand; Rastro zaps it away; flash. Black handled by the next cut. */
export const CanSpin: React.FC = () => {
  const {frame, t, p, dur} = useShot();
  const ZAP = dur - 12;
  const bg: Cam = {x: KD.x + 0.4, y: 1.4, z: KD.z - 1.1, pitch: -6, f: 1650, cy: H * 0.5};
  const up = Math.sin(clamp(frame / 26) * Math.PI);
  const canY = 900 - up * 260 + (frame > 26 ? (frame - 26) * 6 : 0);
  const gone = frame >= ZAP;
  return (
    <Rig s0={1.0} s1={1.22} r0={-4} r1={3} impacts={[{at: ZAP, amp: 26, zoom: 0.1}]} whipIn="zoom" oy={900}>
      <AbsoluteFill style={{transform: 'scale(1.1)'}}>
        <Copacabana cam={bg} t={t + T0 + 13} focus={0.4} aperture={26} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `rotate(180deg) translate(${60}px, ${-640 + kf(frame, [0, 8], [40, 0])}px)`, transformOrigin: `540px ${H / 2}px`}}>
        <svg width={W} height={H} style={{overflow: 'visible', filter: 'drop-shadow(0 30px 40px rgba(40,10,30,0.35))'}}>
          <SleeveArm x={480} wristY={1020} sleeve={DAVI_OUTFIT.top} skin={DAVI_OUTFIT.skin} tense={0.4} />
        </svg>
      </AbsoluteFill>
      {!gone && (
        <Svg>
          <g transform={`translate(540,${canY}) rotate(${frame * 13 - 20})`}>
            <Can h={420} spin={frame * 30} id="c26can" />
          </g>
        </Svg>
      )}
      <Rastro x={540} y={canY + 330} height={620} life={(frame - ZAP + 1) / 16} frame={frame} seed="c26r" />
      <Flash k={kf(frame, [ZAP, ZAP + 1, ZAP + 8], [0, 1, 0.2], (x) => x)} />
      <Particles t={t} seed="c26" count={30} bokeh={9} driftX={-16} />
      <Finish vignette={0.6} />
    </Rig>
  );
};
