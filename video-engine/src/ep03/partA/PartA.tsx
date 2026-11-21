import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import type {ShotP} from './kit';
import * as I from './shotsIntro';
import * as S from './shotsScience';
import * as F from './shotsFinal';

/** Shot id (shots.json) -> component. Cuts come from shots.json (word starts), shared with the SFX list. */
const REG: Record<string, React.FC<ShotP>> = {
  power: I.SPower,
  shrug: I.SShrug,
  phone: I.SPhone,
  academy: I.SAcademy,
  punch: I.SPunch,
  corner: I.SCorner,
  board: I.SBoard,
  sadface: I.SSadFace,
  laugh: I.SLaugh,
  sticker: I.SSticker,
  massage: I.SMassage,
  ahhh: I.SAhh,
  olive: I.SOlive,
  room: S.SRoom,
  objects: S.SObjects,
  freq: S.SFreq,
  bridge: S.SBridge,
  idea: S.SIdea,
  swing: S.SSwing,
  tap: S.STap,
  higher: S.SHigher,
  high: S.SHigh,
  loop: S.SLoop,
  reso: S.SReso,
  glass: S.SGlass,
  hz: S.SHz,
  wobble: S.SWobble,
  shatter: S.SShatter,
  train: F.STrain,
  calendar: F.SCalendar,
  pile: F.SPile,
  mom: F.SMom,
  final: F.SFinal,
  enter: F.SEnter,
  flex: F.SFlex,
  dome: F.SDome,
  screen: F.SScreen,
};

const END = f(PARTS.A.end);

/** Part A (0–42.89 s, L1–L8): 37 cuts on word starts. Local frame 0 = absolute 0. */
export const PartA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {shots.map((s, i) => {
      const from = f(s.start);
      const to = i + 1 < shots.length ? f(shots[i + 1].start) : END;
      const Comp = REG[s.id];
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <Comp from={from} dur={to - from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
