import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Copacabana} from '../../environments/Copacabana';
import {DAVI_OUTFIT, PlacedDavi} from '../../characters/Davi';
import {PlacedPuppet, Puppet, PuppetSvg} from '../../characters/Puppet';
import {AGENT_OUTFITS, PlacedAgent} from '../../characters/Agent';
import {FaceCloseup} from '../../characters/Closeups';
import {NIGHT_LIGHT, SUNSET_LIGHT} from '../../characters/types';
import {Globe, SpaceBackdrop, globeProject, globeView} from '../../environments/Globe';
import {Cam, project} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeIn, easeOut, kf, lerp} from '../../lib/anim';
import {LightRays, Particles} from '../../fx/Particles';
import {Flash, Rastro} from '../../fx/Rastro';
import {HudLabel} from '../../ui/HudLabel';
import {Finish} from '../../scenes/common';
import {Cam2D, wristR} from '../../ep01/partA/kit';
import {TokyoStreet} from '../../ep01/partA/shotsTokyo';
import {Arrive, Layer, MORNING_LIGHT, NEON, NOON_LIGHT, NYC_LIGHT, ShotProps, Sky, TimeChip, pct, wl} from './kit';
import {BistroTable, IronTower, Lagoon, Palm, ParisBlock, PizzaSlice, PostcardTown, RamenBowl, Skyline} from './sets';

const SPOT = {x: 0.35, z: 9};

/** Coffee cup held at the chest (puppet units). */
const ChestCup: React.FC = () => (
  <g transform="translate(0,-600)">
    <path d="M-48,-50 L48,-50 Q44,40 0,46 Q-44,40 -48,-50 Z" fill="#fff" stroke="#d6d0c4" strokeWidth={4} />
    <ellipse cx={0} cy={-50} rx={48} ry={12} fill="#5a3420" />
    <path d="M46,-34 q34,4 22,32 q-8,12 -26,6" stroke="#fff" strokeWidth={10} fill="none" />
  </g>
);

/* ================================================================== L1 */

/** 1 — "E se tu pudesse": Davi at Copacabana, cocky grin, then vanishes. */
export const A01Hook: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = pct(fr, d);
  const at = d - 7;
  const gone = fr >= at;
  const dist = 1.75 - p * 0.3;
  const cam: Cam = {x: SPOT.x + 0.14 - p * 0.06, y: 1.42, z: SPOT.z - dist, pitch: -3, f: 1650, cy: H * 0.5};
  const half = kf(fr, [4, 14], [0, 1]);
  return (
    <Cam2D d={d} zoom={[1.08, 1.0]} roll={[-1.5, 0.5]} shakes={[{at, dur: 10, amp: 20}]}>
      <Copacabana
        cam={cam}
        t={t + 3}
        focus={dist}
        aperture={16}
        actors={[
          {
            key: 'davi',
            x: SPOT.x,
            z: SPOT.z,
            render: ({sx, sy, ppm}) =>
              gone ? null : (
                <PlacedDavi
                  x={sx}
                  y={sy + Math.sin(t * 2.2) * 3}
                  height={ppm * 1.75}
                  pose={{headTilt: -2 + half * 3, facing: 0.15, shR: 9 + half * 4}}
                  expr={{halfSmile: half, smile: 0.2 + half * 0.2, browAsym: half * 0.6, browRaise: half * 0.3, lookX: 0.15, blink: kf(fr, [at - 4, at - 2], [0, 1], (x) => x)}}
                />
              ),
          },
        ]}
      />
      {(() => {
        const foot = project(cam, SPOT.x, 0, SPOT.z)!;
        return <Rastro x={foot.sx} y={foot.sy} height={foot.ppm * 1.85} life={(fr - at + 1) / 22} frame={fr} seed="ea1" />;
      })()}
      <Flash k={kf(fr, [at, at + 1, at + 5], [0, 0.9, 0], (x) => x)} />
      <Particles t={t} seed="ea1p" count={26} bokeh={9} driftX={-20} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/** 2 — "café em Paris": morning terrace, iron tower behind, Davi arrives with a coffee. */
export const A02Paris: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], easeOut);
  const sip = kf(fr, [10, 22], [0, 1]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.07]} whip="right" origin={[600, 900]}>
      <Sky stops={['#7fb4e6', '#bcd8f0', '#ffe2b8', '#ffd09a']} />
      <Layer dx={-p * 20} blur={2.5}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <IronTower x={300} y={1230} h={1080} color="#6a5240" lit="#e7b98a" />
          <ParisBlock y={1300} seed="pa" />
        </svg>
      </Layer>
      <Layer dx={-p * 40}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <rect x={0} y={1290} width={W} height={700} fill="#b49478" />
          {Array.from({length: 12}).map((_, i) => (
            <path key={i} d={`M${-200 + i * 140},1920 L${380 + i * 40},1290`} stroke="#9c7d62" strokeWidth={4} />
          ))}
          {/* striped awning edge */}
          {Array.from({length: 10}).map((_, i) => (
            <path key={i} d={`M${i * 120},0 L${i * 120 + 120},0 L${i * 120 + 120},150 Q${i * 120 + 60},190 ${i * 120},150 Z`} fill={i % 2 ? '#c8323a' : '#f6efe4'} />
          ))}
        </svg>
      </Layer>
      <PlacedPuppet
        outfit={DAVI_OUTFIT}
        light={MORNING_LIGHT}
        x={660 - p * 20}
        y={1820}
        height={1250}
        pose={{shL: -25, elL: 115, shR: 25, elR: -115, headTilt: -2 + sip * 3, facing: -0.1}}
        expr={{halfSmile: 0.6 + sip * 0.4, smile: 0.3, browRaise: 0.3, lookX: -0.3}}
        heldProp={<ChestCup />}
      />
      <Layer dx={-p * 70}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <BistroTable x={470} y={1520} s={1.15} steam={t} />
        </svg>
      </Layer>
      <Arrive x={660} y={1820} h={1300} seed="ea2" len={24} />
      <LightRays x={60} y={300} t={t} opacity={0.2} />
      <Particles t={t} seed="ea2p" count={20} bokeh={6} driftX={-14} />
      <Finish vignette={0.45} />
    </Cam2D>
  );
};

/** 3 — "almoçar em Tóquio": close, neon street, ramen bowl held up. */
export const A03Tokyo: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], easeOut);
  const cam: Cam = {x: 0.4 - p * 0.3, y: 1.6, z: 1 + p * 0.8, pitch: -2, f: 1350, cy: H * 0.5};
  const h = 1750;
  const yFeet = 760 + 884 * (h / 1000);
  return (
    <Cam2D d={d} zoom={[1.0, 1.08]} whip="left" roll={[2, -1]} origin={[540, 1100]}>
      <TokyoStreet cam={cam} t={t + 40} blur={7} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 70%, rgba(255,90,200,0.18), rgba(0,0,0,0) 60%)', mixBlendMode: 'screen'}} />
      <PlacedPuppet
        outfit={DAVI_OUTFIT}
        light={NEON}
        x={540}
        y={yFeet + Math.sin(t * 5) * 4}
        height={h}
        upperOnly
        pose={{shL: -25, elL: 115, shR: 25, elR: -115, headTilt: 3, facing: 0.08}}
        expr={{eyesWide: kf(fr, [0, 6], [0.6, 0.15]), smile: 0.7, mouthOpen: kf(fr, [6, 14], [0.1, 0.45]), browRaise: 0.6, lookY: 0.4}}
        heldProp={
          <g transform="translate(0,-560) scale(1.15)">
            <RamenBowl t={t} />
          </g>
        }
      />
      <Arrive x={540} y={yFeet - 300} h={1700} seed="ea3" len={18} />
      <Particles t={t} seed="ea3p" count={18} bokeh={12} color="255,180,230" bokehColor="255,90,200" driftX={-10} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** 4 — "jantar em Nova York": night skyline, street, Davi with a pizza slice. */
export const A04NY: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], easeOut);
  const shR = 22;
  const elR = -150;
  const wr = wristR(shR, elR);
  const bite = kf(fr, [16, 22], [0, 1]);
  return (
    <Cam2D d={d} zoom={[1.14, 1.02]} whip="up" origin={[540, 1100]}>
      <Sky stops={['#0b0f2a', '#232a5e', '#6b3f78', '#e3875f']} h={1500} />
      <Layer dx={p * 15} blur={3}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <Skyline y={1330} seed="nyf" far t={t} />
        </svg>
      </Layer>
      <Layer dx={p * 35} blur={1.5}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <Skyline y={1450} seed="nyn" t={t} />
          <rect x={0} y={1440} width={W} height={500} fill="#1a1b2b" />
          <rect x={0} y={1440} width={W} height={14} fill="#3a3c55" />
          {/* yellow cabs streaking */}
          {[0, 1].map((i) => {
            const x = ((t * 900 + i * 700) % 1800) - 500;
            return (
              <g key={i} transform={`translate(${x},${1500 + i * 40})`} opacity={0.9}>
                <rect x={0} y={0} width={260} height={70} rx={20} fill="#f2c21b" />
                <rect x={50} y={-40} width={150} height={50} rx={14} fill="#d9a915" />
                <rect x={-200} y={20} width={200} height={10} fill="#ffe28a" opacity={0.4} />
                <circle cx={60} cy={72} r={22} fill="#111" />
                <circle cx={200} cy={72} r={22} fill="#111" />
              </g>
            );
          })}
        </svg>
      </Layer>
      <PlacedPuppet outfit={DAVI_OUTFIT} light={NYC_LIGHT} x={560} y={1760} height={1050} pose={{shR, elR, shL: -10, elL: 8, facing: 0.1, headTilt: -2 + bite * 3}} expr={{smile: 0.5, halfSmile: 0.4, mouthOpen: kf(fr, [10, 16, 22], [0, 0.5, 0.1]), lookX: 0.4}}>
        <g transform={`translate(${wr[0]},${wr[1] - 20}) rotate(-140)`}>
          <PizzaSlice />
        </g>
      </PlacedPuppet>
      <Arrive x={560} y={1760} h={1100} seed="ea4" len={20} />
      <Particles t={t} seed="ea4p" count={16} bokeh={10} color="255,210,150" bokehColor="255,170,80" driftX={-10} />
      <Finish vignette={0.6} />
    </Cam2D>
  );
};

/** 5 — "sem pagar passagem?": boarding pass, red stamp R$ 0,00 slams. */
export const A05Ticket: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const S = wl(start, 'L1', 18);
  const inK = kf(fr, [0, 9], [0, 1], easeOut);
  const stamp = kf(fr, [S - 3, S], [0, 1], easeIn);
  const tear = kf(fr, [d - 10, d], [0, 1], easeIn);
  return (
    <Cam2D d={d} zoom={[1.0, 1.08]} roll={[-3, 1]} whip="zoom" shakes={[{at: S, dur: 12, amp: 18}]} punches={[{at: S, amt: 0.06}]}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2c4f8a 0%, #101a38 75%)'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* dotted world route behind */}
        <path d="M-50,1250 Q300,700 540,900 T1130,600" stroke="#9fd0ff" strokeWidth={5} strokeDasharray="4 22" strokeLinecap="round" fill="none" opacity={0.5} />
        <g transform={`translate(540,${lerp(1400, 950, inK)}) rotate(${lerp(18, -6, inK)})`}>
          {/* stub (tears off) */}
          <g transform={`translate(${tear * 120},${tear * 60}) rotate(${tear * 14} 260 0)`}>
            <rect x={240} y={-200} width={170} height={400} rx={26} fill="#f5f1e8" />
            {Array.from({length: 12}).map((_, i) => (
              <rect key={i} x={290 + (i % 3) * 22} y={-150 + Math.floor(i / 3) * 70} width={12} height={50} fill="#283048" opacity={0.75} />
            ))}
          </g>
          <rect x={-410} y={-200} width={650} height={400} rx={26} fill="#fffaf0" />
          <rect x={-410} y={-200} width={650} height={90} rx={26} fill="#2f6fd6" />
          <rect x={-410} y={-140} width={650} height={30} fill="#2f6fd6" />
          <line x1={240} y1={-190} x2={240} y2={190} stroke="#c9c2b2" strokeWidth={5} strokeDasharray="12 12" />
          <text x={-370} y={-140} fontFamily={HUD_FONT} fontWeight={700} fontSize={36} letterSpacing={4} fill="#fff">
            CARTÃO DE EMBARQUE
          </text>
          <text x={-370} y={-40} fontFamily={HUD_FONT} fontWeight={700} fontSize={84} fill="#1d2440">
            RIO
          </text>
          <path d="M-210,-68 L-120,-68 M-140,-86 L-118,-68 L-140,-50" stroke="#2f6fd6" strokeWidth={10} fill="none" strokeLinecap="round" />
          <text x={-90} y={-40} fontFamily={HUD_FONT} fontWeight={700} fontSize={84} fill="#1d2440">
            MUNDO
          </text>
          <text x={-370} y={40} fontFamily={HUD_FONT} fontSize={30} letterSpacing={3} fill="#6a7088">
            PREÇO
          </text>
          <text x={-370} y={130} fontFamily={HUD_FONT} fontWeight={700} fontSize={90} fill="#1d2440" opacity={1 - stamp * 0.6}>
            R$ 4.890
          </text>
          {stamp > 0 && (
            <g transform={`translate(-40,80) rotate(-12) scale(${lerp(2.4, 1, stamp)})`} opacity={stamp}>
              <rect x={-230} y={-80} width={460} height={160} rx={18} fill="none" stroke="#e0262f" strokeWidth={12} />
              <text x={0} y={34} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={104} fill="#e0262f">
                R$ 0,00
              </text>
            </g>
          )}
        </g>
      </svg>
      <Flash k={kf(fr, [S, S + 1, S + 5], [0, 0.35, 0], (x) => x)} color="255,220,220" />
      <Particles t={t} seed="ea5p" count={20} bokeh={6} color="170,210,255" bokehColor="120,180,255" driftX={-10} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/* ================================================================== L2 */

/** 6 — "Só que todo lugar": wide postcard spot, Davi arrives on the terrace. */
export const A06Postcard: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], easeOut);
  return (
    <Cam2D d={d} zoom={[1.1, 1.0]} pan={[40, 0, -20, 0]} whip="down">
      <Sky stops={['#3f8fe0', '#8cc6f5', '#dff1ff']} h={700} />
      <Layer dx={-p * 20}>
        <PostcardTown t={t} />
      </Layer>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* white terrace + railing */}
        <rect x={0} y={1520} width={W} height={400} fill="#f3eee6" />
        <rect x={0} y={1500} width={W} height={26} fill="#d9d2c6" />
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={i * 80 + 10} y={1300} width={18} height={210} rx={6} fill="#ffffff" stroke="#d6cfc2" strokeWidth={3} />
        ))}
        <rect x={0} y={1286} width={W} height={26} rx={8} fill="#ffffff" stroke="#d6cfc2" strokeWidth={3} />
        {/* bougainvillea */}
        {Array.from({length: 40}).map((_, i) => (
          <circle key={i} cx={-20 + (i % 10) * 26 + Math.floor(i / 10) * 8} cy={1280 - Math.floor(i / 10) * 40 + (i % 3) * 10} r={22} fill={i % 3 ? '#e8408f' : '#ff6fb0'} opacity={0.9} />
        ))}
      </svg>
      <PlacedDavi x={300} y={1720} height={780} light={NOON_LIGHT} pose={{facing: 0.3, shL: -12, shR: 12}} expr={{eyesWide: kf(fr, [0, 10], [0.5, 0]), smile: kf(fr, [8, 20], [0, 0.6]), lookX: 0.6}} />
      <Arrive x={300} y={1720} h={820} seed="ea6" len={22} />
      <LightRays x={900} y={200} t={t} opacity={0.18} color="255,250,220" />
      <Finish vignette={0.35} />
    </Cam2D>
  );
};

/** Shared layout for 7/8: Davi foreground left, agent waiting far right by the railing. */
const DreamFrame: React.FC<{fr: number; t: number; daviBlur: number; agentBlur: number; bgBlur: number; open: number; smirk: number}> = ({fr, t, daviBlur, agentBlur, bgBlur, open, smirk}) => (
  <>
    <Sky stops={['#3f8fe0', '#8cc6f5', '#dff1ff']} h={900} />
    <Layer blur={bgBlur} s={1.25} style={{transformOrigin: '700px 900px'}}>
      <PostcardTown t={t + 2} />
    </Layer>
    <svg width={W} height={H} style={{position: 'absolute', filter: `blur(${bgBlur * 0.8}px)`}}>
      <rect x={0} y={1270} width={W} height={20} rx={8} fill="#ffffff" />
      {Array.from({length: 18}).map((_, i) => (
        <rect key={i} x={i * 64} y={1290} width={14} height={160} fill="#fff" />
      ))}
      <rect x={0} y={1450} width={W} height={500} fill="#f3eee6" />
    </svg>
    <PlacedAgent variant="agentA" x={860} y={1300} height={420} blur={agentBlur} light={NOON_LIGHT} pose={{shL: 22, elL: 40, shR: -22, elR: -40, facing: -0.25}} expr={{halfSmile: smirk, lookX: -0.6}} />
    <PlacedPuppet
      outfit={DAVI_OUTFIT}
      light={NOON_LIGHT}
      x={360}
      y={2160}
      height={1550}
      blur={daviBlur}
      pose={{shL: -15 - open * 95, elL: -10 - open * 10, shR: 15 + open * 95, elR: 10 + open * 10, headTilt: -3 - open * 4, facing: 0.15}}
      expr={{blink: open * 0.85, smile: 0.4 + open * 0.4, browRaise: open * 0.4}}
    />
  </>
);

/** 7 — "sonha em ir": Davi breathes it in, arms open (agent tiny & soft in the background). */
export const A07Dream: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const open = kf(fr, [2, 18], [0, 1]);
  return (
    <Cam2D d={d} zoom={[1.0, 1.06]} pan={[0, 0, 20, 0]} whip="left" origin={[360, 900]}>
      <DreamFrame fr={fr} t={t} daviBlur={0} agentBlur={5} bgBlur={5} open={open} smirk={0} />
      <LightRays x={900} y={160} t={t} opacity={0.2} color="255,250,220" />
      <Particles t={t} seed="ea7p" count={20} bokeh={8} driftX={-10} />
      <Finish vignette={0.4} />
    </Cam2D>
  );
};

/** 8 — "tem alguém te esperando": rack focus + push onto the suit by the railing. */
export const A08Reveal: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30 + 1.1;
  const k = kf(fr, [0, 12], [0, 1]);
  return (
    <Cam2D d={d} zoom={[1.05, 2.1]} origin={[860, 1120]} ease={(x) => 1 - Math.pow(1 - x, 2)}>
      <DreamFrame fr={fr} t={t} daviBlur={k * 14} agentBlur={5 - k * 5} bgBlur={5 + k * 3} open={1} smirk={kf(fr, [14, 24], [0, 0.8])} />
      <Finish vignette={kf(fr, [0, d], [0.4, 0.7])} />
    </Cam2D>
  );
};

/** 9 — "lá.": agent close-up, Davi reflected in the sunglasses. */
export const A09Shades: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const o = AGENT_OUTFITS.agentA;
  const k = 3.4;
  const cx = 540;
  const cy = 960;
  return (
    <Cam2D d={d} zoom={[1.0, 1.1]} roll={[1.5, -0.5]} origin={[540, 950]} punches={[{at: 0, amt: 0.05}]}>
      <AbsoluteFill style={{filter: 'blur(10px)'}}>
        <Sky stops={['#3f8fe0', '#8cc6f5', '#dff1ff']} />
        <PostcardTown t={t} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        {/* shoulders / suit */}
        <path d={`M${cx - 520},${H} Q${cx - 480},${cy + 420} ${cx - 160},${cy + 360} L${cx + 160},${cy + 360} Q${cx + 480},${cy + 420} ${cx + 520},${H} Z`} fill={o.top.base} />
        <path d={`M${cx - 120},${cy + 360} L${cx},${cy + 640} L${cx + 120},${cy + 360} Z`} fill="#f4f4f6" />
        <path d={`M${cx - 20},${cy + 380} L${cx + 20},${cy + 380} L${cx + 30},${cy + 640} L${cx},${cy + 700} L${cx - 30},${cy + 640} Z`} fill="#16171c" />
        <path d={`M${cx - 120},${cy + 360} L${cx - 40},${cy + 620} L${cx - 220},${cy + 420} Z`} fill={o.top.shade} />
        <path d={`M${cx + 120},${cy + 360} L${cx + 40},${cy + 620} L${cx + 220},${cy + 420} Z`} fill={o.top.shade} />
        <rect x={cx - 110} y={cy + 300} width={220} height={90} fill={o.skin.shade} />
        <FaceCloseup cx={cx} cy={cy} k={k} skin={o.skin} style={o.head} expr={{halfSmile: kf(fr, [8, 20], [0.1, 0.9]), browTilt: -0.4}} light={{...NOON_LIGHT, side: -1}} />
        {/* reflections of Davi in both lenses */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${cx + s * 42 * k},${cy - 3 * k})`}>
            <clipPath id={`lens${s}`}>
              <rect x={-33 * k} y={-21 * k} width={66 * k} height={42 * k} rx={14 * k} />
            </clipPath>
            <g clipPath={`url(#lens${s})`}>
              <rect x={-33 * k} y={-21 * k} width={66 * k} height={42 * k} fill="#244a7a" opacity={0.75} />
              <rect x={-33 * k} y={2 * k} width={66 * k} height={30 * k} fill="#d8e6f2" opacity={0.35} />
              <g transform={`translate(${-4 * k + s * 4},${16 * k}) scale(${0.032 * k})`} opacity={0.9}>
                <Puppet outfit={DAVI_OUTFIT} pose={{shL: -110, elL: -20, shR: 110, elR: 20}} expr={{smile: 0.6, blink: 0.8}} />
              </g>
              <path d={`M${-30 * k},${-14 * k} L${-6 * k},${-20 * k}`} stroke="#fff" strokeWidth={3 * k} opacity={0.35} />
            </g>
          </g>
        ))}
      </svg>
      <Particles t={t} seed="ea9p" count={14} bokeh={6} driftX={-10} />
      <Finish vignette={0.55} />
    </Cam2D>
  );
};

/* ================================================================== L3 */

const ROUTE: {lat: number; lon: number}[] = [
  {lat: -22.9, lon: -43.2},
  {lat: 48.9, lon: 2.3},
  {lat: 41.9, lon: 12.5},
  {lat: 30.0, lon: 31.2},
  {lat: 40.7, lon: -74.0},
  {lat: 19.4, lon: -99.1},
  {lat: -34.6, lon: -58.4},
  {lat: 64.1, lon: -21.9},
  {lat: 38.7, lon: -9.1},
  {lat: -33.9, lon: 18.4},
  {lat: 25.2, lon: 55.3},
  {lat: 3.2, lon: 73.2},
];

/** 10 — "Depois do Atlântico, o Davi": globe, dotted route hopping city to city, SALTOS 47. */
export const A10Route: React.FC<ShotProps> = ({d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], (x) => x);
  const g = {radius: 430, zoom: 1.05 + p * 0.1, rotation: lerp(-45, 25, p), tilt: 18, cy: 960};
  const v = globeView(g);
  const per = (d - 4) / ROUTE.length;
  const reached = (i: number) => clamp((fr - i * per) / per);
  const segs = ROUTE.slice(1).map((b, i) => {
    const a = ROUTE[i];
    const k = reached(i + 1);
    if (k <= 0) return null;
    const A = globeProject(v, a.lat, a.lon, 0.01);
    const B = globeProject(v, b.lat, b.lon, 0.01);
    if (!A.visible || !B.visible) return null;
    const M = globeProject(v, (a.lat + b.lat) / 2, (a.lon + b.lon) / 2, 0.18);
    const c = {x: 2 * M.x - (A.x + B.x) / 2, y: 2 * M.y - (A.y + B.y) / 2};
    const len = Math.hypot(B.x - A.x, B.y - A.y) * 1.3;
    return <path key={i} d={`M${A.x},${A.y} Q${c.x},${c.y} ${B.x},${B.y}`} stroke="#fff" strokeWidth={5} strokeDasharray={`${len * k} ${len}`} fill="none" strokeLinecap="round" opacity={0.95} />;
  });
  const lastI = Math.min(ROUTE.length - 1, Math.floor(fr / per));
  const last = globeProject(v, ROUTE[lastI].lat, ROUTE[lastI].lon);
  return (
    <Cam2D d={d} zoom={[0.95, 1.05]} whip="zoom">
      <SpaceBackdrop t={t} driftX={-p * 120} />
      <Globe
        {...g}
        t={t}
        pins={ROUTE.map((c, i) => ({...c, drop: kf(fr, [i * per, i * per + 5], [0, 1], easeOut), pulse: fr > i * per + 5 ? ((fr - i * per) % 18) / 18 : 0, scale: 0.55}))}
      />
      <svg width={W} height={H} style={{position: 'absolute', filter: 'drop-shadow(0 0 6px rgba(160,220,255,0.9))'}}>
        {segs}
      </svg>
      <HudLabel label="SALTOS" value={47} x={90} y={540} tx={last.x} ty={last.y - 30} from={3} />
      <Finish vignette={0.45} grain={0.08} />
    </Cam2D>
  );
};

/** 11 — "virou turista": selfie POV, peace sign, shutter flash. */
export const A11Selfie: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const S = wl(start, 'L3', 6) + 3;
  const flash = kf(fr, [S, S + 1, S + 6], [0, 1, 0], (x) => x);
  const frozen = fr >= S;
  const h = 1700;
  const yFeet = 820 + 884 * (h / 1000);
  return (
    <Cam2D d={d} zoom={[1.06, 1.0]} roll={[-6, -3]} whip="right" origin={[540, 1000]} punches={[{at: S, amt: 0.04}]}>
      <AbsoluteFill style={{filter: 'blur(4px)'}}>
        <Sky stops={['#7fb4e6', '#bcd8f0', '#ffe2b8']} />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <IronTower x={760} y={1500} h={1350} color="#6a5240" lit="#e7b98a" />
          <ParisBlock y={1600} seed="pb2" />
        </svg>
      </AbsoluteFill>
      <PlacedPuppet
        outfit={DAVI_OUTFIT}
        light={MORNING_LIGHT}
        x={480}
        y={yFeet}
        height={h}
        upperOnly
        pose={{shR: 150, elR: 10, shL: -150, elL: -25, headTilt: -8, facing: 0.15}}
        expr={{smile: 0.9, mouthOpen: frozen ? 0.35 : 0.2, browRaise: 0.6, blink: frozen ? 0 : kf(fr, [2, 4, 6], [0, 1, 0], (x) => x), lookX: 0.2, lookY: -0.3}}
      >
        {/* peace sign on the raised left hand */}
        {(() => {
          const rad = (x: number) => (x * Math.PI) / 180;
          const ex = -128 + Math.sin(rad(-150)) * 182;
          const ey = -728 + Math.cos(rad(-150)) * 182;
          const wx = ex + Math.sin(rad(-175)) * 168;
          const wy = ey + Math.cos(rad(-175)) * 168;
          return (
            <g transform={`translate(${wx},${wy - 10})`}>
              <rect x={-30} y={-110} width={24} height={90} rx={12} fill={DAVI_OUTFIT.skin.base} transform="rotate(-12)" />
              <rect x={4} y={-110} width={24} height={90} rx={12} fill={DAVI_OUTFIT.skin.base} transform="rotate(12)" />
            </g>
          );
        })()}
      </PlacedPuppet>
      {/* viewfinder overlay */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {[
          [70, 530, 1, 1],
          [1010, 530, -1, 1],
          [70, 1320, 1, -1],
          [1010, 1320, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M${x},${y + sy * 70} L${x},${y} L${x + sx * 70},${y}`} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
        ))}
        <circle cx={540} cy={925} r={34} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5} />
      </svg>
      <Flash k={flash} color="255,255,255" />
      <Finish vignette={0.45} />
    </Cam2D>
  );
};

/** 12 — "Torre Eiffel às oito": low angle tilt down the iron tower, tiny Davi at the base, 08:00. */
export const A12Tower: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], (x) => 1 - Math.pow(1 - x, 2));
  return (
    <Cam2D d={d} zoom={[1.0, 1.05]} pan={[0, 380, 0, -60]} roll={[2, 0]} ease={(x) => x}>
      <Sky stops={['#ffd7a0', '#ffc38c', '#f7e3c9', '#cfe2f5']} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <circle cx={180} cy={1420} r={110} fill="#fff1c9" opacity={0.9} />
        <circle cx={180} cy={1420} r={200} fill="#fff1c9" opacity={0.25} />
        <g style={{filter: 'blur(2px)'}}>
          <ParisBlock y={1720} seed="pb3" tone={1} />
        </g>
        <IronTower x={600} y={1760} h={1700} color="#4c3a2c" lit="#f0c592" />
        <rect y={1740} width={W} height={300} fill="#8d7a63" />
        <rect y={1740} width={W} height={30} fill="#a59078" />
      </svg>
      <PlacedDavi x={620} y={1760} height={210} light={MORNING_LIGHT} pose={{shL: -40, elL: 60, shR: 40, elR: -60}} expr={{smile: 0.6}} />
      <Arrive x={620} y={1760} h={240} seed="ea12" len={16} />
      <TimeChip x={540} y={540} label="PARIS" time="08:00" from={wl(start, 'L3', 9) - 2} />
      <LightRays x={180} y={1420} t={t} opacity={0.22} />
      <Particles t={t} seed="ea12p" count={16} bokeh={5} driftX={-10} />
      <Finish vignette={0.45} />
    </Cam2D>
  );
};

/** 13 — "Maldivas ao meio-dia": overwater bungalows, Davi in a hammock over the lagoon, 12:00. */
export const A13Maldives: React.FC<ShotProps> = ({start, d}) => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  const p = kf(fr, [0, d], [0, 1], (x) => x);
  const swing = Math.sin(t * 2.2) * 2.5;
  const k = 0.62;
  return (
    <Cam2D d={d} zoom={[1.12, 1.0]} pan={[-30, 0, 30, 0]} whip="left">
      <Sky stops={['#1c86e0', '#5fb6f3', '#c9ecff']} h={760} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <circle cx={820} cy={180} r={70} fill="#fffbe6" />
        <circle cx={820} cy={180} r={140} fill="#fffbe6" opacity={0.25} />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={((200 + i * 340 + t * 20) % 1300) - 100} cy={330 + i * 70} rx={130} ry={34} fill="#fff" opacity={0.85} />
        ))}
      </svg>
      <Layer dx={p * 20}>
        <Lagoon t={t} horizon={740} />
      </Layer>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Palm x={60} y={1500} s={1.25} sway={Math.sin(t * 1.5) * 4} />
        {/* posts in the water */}
        {[150, 940].map((x) => (
          <g key={x}>
            <rect x={x - 16} y={950} width={32} height={720} fill="#6b4a2c" />
            <ellipse cx={x} cy={1670} rx={70} ry={14} fill="#e9fffb" opacity={0.6} />
          </g>
        ))}
      </svg>
      {/* hammock + Davi */}
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`rotate(${swing} 545 1000)`}>
          <path d="M150,1000 Q545,1330 940,1000" stroke="#e9dcc0" strokeWidth={8} fill="none" />
          <g transform={`translate(870,1150) rotate(-97) scale(${k})`}>
            <Puppet outfit={DAVI_OUTFIT} light={NOON_LIGHT} pose={{shL: -160, elL: -120, shR: 160, elR: 120, hipR: -8, knR: 0, headTilt: -10, facing: 0.3}} expr={{smile: 0.6, halfSmile: 0.5}} />
            {/* sunglasses */}
            <g transform="translate(9,-886)">
              <path d="M-68,-8 L84,-8" stroke="#0b0b0e" strokeWidth={6} />
              {[-1, 1].map((s) => (
                <g key={s}>
                  <rect x={9 + s * 42 - 33} y={-24} width={66} height={40} rx={14} fill="#0b0c10" />
                  <path d={`M${9 + s * 42 - 18},-14 L${9 + s * 42 - 2},-18`} stroke="#9fb4c8" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
                </g>
              ))}
            </g>
          </g>
          {/* hammock net in front */}
          <path d="M150,1000 Q545,1400 940,1000 Q545,1290 150,1000 Z" fill="#f2e6cc" opacity={0.92} />
          {Array.from({length: 9}).map((_, i) => (
            <path key={i} d={`M${200 + i * 85},${1040 + Math.sin((i / 8) * Math.PI) * 170} l20,${40 + Math.sin((i / 8) * Math.PI) * 40}`} stroke="#c9b48a" strokeWidth={4} />
          ))}
          <path d="M150,1000 Q545,1400 940,1000" stroke="#d8c39a" strokeWidth={10} fill="none" />
        </g>
      </svg>
      <TimeChip x={540} y={520} label="MALDIVAS" time="12:00" from={wl(start, 'L3', 12)} />
      <Particles t={t} seed="ea13p" count={14} bokeh={5} color="255,255,230" bokehColor="255,255,220" driftX={-10} />
      <Finish vignette={0.35} />
    </Cam2D>
  );
};
