import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {f} from '../timeline';
import {Shot, k} from './kit';
import {Studio, pointPose} from './studio';
import {Acoustic, LeakPipe, NetworkMap, PressureGraph} from './l11';
import {Dashboard, Desal, FortalezaMap, Interlink, Reuse, Spring} from './l12';
import {ConsumptionBars, FinalCard, RoofRain, Shower, SubMeters} from './l14';
import {Faucet} from './l16';

/** Shot boundaries (absolute s). Keep in sync with shots.json. */
const S = [
  103.31, 105.2, 106.5, 108.91, 111.0, 113.57, 114.9, 116.28, 117.96, 120.27, 122.33, 124.2, 126.0, 129.17, 130.71, 133.07, 135.05, 137.72, 139.57, 141.5,
  143.05, 145.18, 146.91, 148.71, 150.21, 152.08, 154.31, 156.15, 158.58, 164.36,
];
const D = (i: number) => f(S[i + 1]) - f(S[i]);
/** frame within shot i of absolute time t */
const T = (i: number, t: number) => f(t) - f(S[i]);

const PointingStudio: React.FC<React.ComponentProps<typeof Studio> & {pointAt?: number}> = ({pointAt = 4, ...p}) => {
  const frame = useCurrentFrame();
  return <Studio {...p} pose={pointPose(frame, pointAt)} />;
};

const Talking: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const g = Math.sin(frame / 14);
  return (
    <Studio
      st={S[i]}
      dur={D(i)}
      px={700}
      pose={{shR: 25 + g * 8, elR: 60 + g * 10, shL: -20, elL: -40 - g * 6}}
      cam={{from: {x: 640, y: 1000, s: 1.15}, to: {x: 680, y: 900, s: 1.32}}}
    />
  );
};

const FaucetShot: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const reach = k(frame, 0, 14);
  return (
    <Studio
      st={S[i]}
      dur={D(i)}
      px={860}
      pose={{shL: -7 - 28 * reach, elL: 6 - 81 * reach, shR: 10, elR: -10, facing: -0.1 * reach}}
      cam={{from: {x: 560, y: 1080, s: 1.02}, to: {x: 520, y: 1060, s: 1.1}}}
    >
      <Faucet closeAt={T(i, 154.9)} />
    </Studio>
  );
};

export const PartC: React.FC = () => (
  <AbsoluteFill style={{background: '#071a2e'}}>
    {/* L11 — reduzir perdas */}
    <Shot a={S[0]} b={S[1]}>
      <PointingStudio st={S[0]} dur={D(0)} pointAt={T(0, 104.6)} board={{kicker: 'COMO EVITAR', num: '1/3', title: 'REDUZIR PERDAS', at: T(0, 104.71)}} />
    </Shot>
    <Shot a={S[1]} b={S[2]}>
      <PointingStudio
        st={S[1]}
        dur={D(1)}
        pointAt={-20}
        cam={{from: {x: 420, y: 900, s: 1.15}, to: {x: 360, y: 880, s: 1.35}}}
        board={{
          kicker: 'COMO EVITAR',
          num: '1/3',
          title: 'REDUZIR PERDAS',
          at: -20,
          items: [
            {text: 'SETORES COM MEDIÇÃO', icon: '🗺️', at: 4},
            {text: 'PRESSÃO MENOR À NOITE', icon: '🌙', at: 12},
            {text: 'SENSOR ACÚSTICO', icon: '🎧', at: 20},
          ],
        }}
      />
    </Shot>
    <Shot a={S[2]} b={S[3]}>
      <NetworkMap dur={D(2)} sectorsAt={T(2, 107.07)} metersAt={T(2, 108.0)} readout cam={{from: {x: 540, y: 940, s: 1.0}, to: {x: 640, y: 1060, s: 1.25}}} />
    </Shot>
    <Shot a={S[3]} b={S[4]}>
      <PressureGraph dur={D(3)} drawAt={2} vrpAt={T(3, 109.4)} />
    </Shot>
    <Shot a={S[4]} b={S[5]}>
      <LeakPipe dur={D(4)} dropAt={T(4, 111.32)} chipAt={T(4, 112.0)} />
    </Shot>
    <Shot a={S[5]} b={S[6]}>
      <Acoustic dur={D(5)} foundAt={999} cam={{from: {x: 480, y: 900, s: 0.95}, to: {x: 520, y: 960, s: 1.02}}} />
    </Shot>
    <Shot a={S[6]} b={S[7]}>
      <Acoustic dur={D(6)} close foundAt={T(6, 115.31)} cam={{from: {x: 560, y: 1120, s: 1.1}, to: {x: 600, y: 1150, s: 1.2}}} />
    </Shot>
    {/* L12 — diversificar fontes */}
    <Shot a={S[7]} b={S[8]}>
      <PointingStudio
        st={S[7]}
        dur={D(7)}
        pointAt={T(7, 116.3)}
        board={{
          kicker: 'COMO EVITAR',
          num: '2/3',
          title: 'DIVERSIFICAR FONTES',
          at: 0,
          items: [
            {text: 'INTERLIGAÇÃO', icon: '🔗', at: 12},
            {text: 'REÚSO', icon: '♻️', at: 18},
            {text: 'NASCENTES', icon: '🌱', at: 24},
            {text: 'DESSALINIZAÇÃO', icon: '🌊', at: 30},
          ],
        }}
      />
    </Shot>
    <Shot a={S[8]} b={S[9]}>
      <Interlink dur={D(8)} drawAt={T(8, 118.67)} cam={{from: {x: 540, y: 940, s: 1.08}, to: {x: 540, y: 960, s: 1.0}}} />
    </Shot>
    <Shot a={S[9]} b={S[10]}>
      <Reuse dur={D(9)} flowAt={T(9, 120.9)} cam={{from: {x: 480, y: 1000, s: 1.0}, to: {x: 580, y: 1000, s: 1.1}}} />
    </Shot>
    <Shot a={S[10]} b={S[11]}>
      <Spring dur={D(10)} treesAt={T(10, 122.5)} cam={{from: {x: 540, y: 900, s: 1.12}, to: {x: 540, y: 1000, s: 1.0}}} />
    </Shot>
    <Shot a={S[11]} b={S[12]}>
      <FortalezaMap dur={D(11)} pinAt={2} />
    </Shot>
    <Shot a={S[12]} b={S[13]}>
      <Desal dur={D(12)} chipAt={T(12, 126.3)} />
    </Shot>
    {/* L13 — plano de contingência */}
    <Shot a={S[13]} b={S[14]}>
      <PointingStudio st={S[13]} dur={D(13)} pointAt={4} board={{kicker: 'COMO EVITAR', num: '3/3', title: 'PLANO DE CONTINGÊNCIA', at: 0, items: [{text: 'ALERTA ANTECIPADO', icon: '🚦', at: T(13, 130.71)}]}} />
    </Shot>
    <Shot a={S[14]} b={S[15]}>
      <Dashboard dur={D(14)} t0={0} t1={D(14)} levels={[[0.8, 0.72], [0.62, 0.52], [0.7, 0.64]]} cam={{from: {x: 540, y: 960, s: 1.05}, to: {x: 540, y: 940, s: 1.0}}} />
    </Shot>
    <Shot a={S[15]} b={S[16]}>
      <Dashboard dur={D(15)} t0={0} t1={T(15, 134.1)} alertAt={T(15, 134.08)} levels={[[0.72, 0.7], [0.52, 0.42], [0.64, 0.6]]} cam={{from: {x: 540, y: 960, s: 1.15}, to: {x: 540, y: 1000, s: 1.4}}} />
    </Shot>
    <Shot a={S[16]} b={S[17]}>
      <Dashboard dur={D(16)} t0={10} t1={D(16)} alertAt={-20} okAt={T(16, 136.3)} levels={[[0.7, 0.73], [0.42, 0.5], [0.6, 0.64]]} cam={{from: {x: 540, y: 980, s: 1.1}, to: {x: 540, y: 960, s: 1.0}}} />
    </Shot>
    {/* L14 — na empresa */}
    <Shot a={S[17]} b={S[18]}>
      <PointingStudio st={S[17]} dur={D(17)} pointAt={6} board={{kicker: 'NA EMPRESA', title: '1º PASSO: MEDIR', at: 0, items: [{text: 'HIDRÔMETROS', icon: '📟', at: T(17, 139.6)}]}} />
    </Shot>
    <Shot a={S[18]} b={S[19]}>
      <SubMeters dur={D(18)} at={4} cam={{from: {x: 540, y: 960, s: 1.0}, to: {x: 540, y: 1000, s: 1.1}}} />
    </Shot>
    <Shot a={S[19]} b={S[20]}>
      <ConsumptionBars dur={D(19)} flagAt={18} />
    </Shot>
    <Shot a={S[20]} b={S[21]}>
      <RoofRain dur={D(20)} dimAt={T(20, 143.85)} rainAt={T(20, 144.4)} fill0={0.05} fill1={0.2} cam={{from: {x: 520, y: 1000, s: 1.0}, to: {x: 480, y: 980, s: 1.08}}} />
    </Shot>
    <Shot a={S[21]} b={S[22]}>
      <RoofRain dur={D(21)} rainAt={-20} fill0={0.2} fill1={0.55} formulaAt={6} cam={{from: {x: 820, y: 1120, s: 1.3}, to: {x: 860, y: 1160, s: 1.45}}} />
    </Shot>
    <Shot a={S[22]} b={S[23]}>
      <RoofRain dur={D(22)} rainAt={-20} fill0={0.55} fill1={0.95} bigAt={2} cam={{from: {x: 560, y: 1000, s: 1.1}, to: {x: 540, y: 980, s: 1.0}}} />
    </Shot>
    {/* L15 — em casa */}
    <Shot a={S[23]} b={S[24]}>
      <Shower dur={D(23)} cam={{from: {x: 600, y: 980, s: 1.0}, to: {x: 620, y: 980, s: 1.08}}} />
    </Shot>
    <Shot a={S[24]} b={S[25]}>
      <Shower dur={D(24)} switchAt={T(24, 150.3)} cam={{from: {x: 760, y: 1000, s: 1.3}, to: {x: 800, y: 1000, s: 1.45}}} />
    </Shot>
    <Shot a={S[25]} b={S[26]}>
      <Shower dur={D(25)} startMin={5} chipAt={T(25, 152.81)} countAt={T(25, 152.3)} cam={{from: {x: 560, y: 980, s: 1.05}, to: {x: 540, y: 960, s: 1.0}}} />
    </Shot>
    {/* L16 — fechamento */}
    <Shot a={S[26]} b={S[27]}>
      <FaucetShot i={26} />
    </Shot>
    <Shot a={S[27]} b={S[28]}>
      <Talking i={27} />
    </Shot>
    <Shot a={S[28]} b={S[29]}>
      <FinalCard dur={D(28)} textAt={T(28, 158.74)} waveAt={T(28, 161.17)} absOffset={f(S[28])} />
    </Shot>
  </AbsoluteFill>
);
