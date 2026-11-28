import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import type {ShotP} from './kit';
import * as K from './shotsHook';
import * as I from './shotsIntro';
import * as C from './shotsCauses';
import {loadFonts} from '../../lib/fonts';

loadFonts();

/** Shot id (shots.json) -> component. Cuts land on word starts (real timing), shared with the SFX list. */
const REG: Record<string, React.FC<ShotP>> = {
  faucet: K.SFaucet,
  sp2015: K.SSP2015,
  people: K.SPeople,
  queue: K.SQueue,
  reservoir: K.SReservoir,
  ruler: K.SRuler,
  hello: I.SHello,
  today: I.SToday,
  globe: I.SGlobe,
  brazil: I.SBrazil,
  salvador: I.SSalvador,
  ocean: I.SOcean,
  bottles: I.SBottles,
  fresh: I.SFresh,
  cause1: C.SCause1,
  pipes: C.SPipes,
  leak: C.SLeak,
  buckets: C.SBuckets,
  tap6: C.STap6,
  cause2: C.SCause2,
  forest: C.SForest,
  vapor: C.SVapor,
  rivers: C.SRivers,
  lessforest: C.SLessForest,
  cause3: C.SCause3,
  sewer: C.SSewer,
  river: C.SRiver,
  sun: C.SSun,
  drought: C.SDrought,
};

const END = f(PARTS.A.end);
/** Dissolve length (frames): the outgoing shot keeps running under the incoming one. */
const XF = 8;

const Dissolve: React.FC<{on: boolean; children: React.ReactNode}> = ({on, children}) => {
  const fr = useCurrentFrame();
  const o = on ? interpolate(fr, [0, XF], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** Part A (0–55.51 s, L1–L6): 29 shots, calm dissolves + a few clean cuts. Local frame 0 = absolute 0. */
export const PartA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {shots.map((s, i) => {
      const from = f(s.start);
      const to = i + 1 < shots.length ? f(shots[i + 1].start) : END;
      const nextX = i + 1 < shots.length && shots[i + 1].tr === 'x';
      const len = Math.min(END - from, to - from + (nextX ? XF : 0));
      const Comp = REG[s.id];
      return (
        <Sequence key={s.id} from={from} durationInFrames={len} name={s.id}>
          <Dissolve on={s.tr === 'x' && i > 0}>
            <Comp from={from} dur={to - from} />
          </Dissolve>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
