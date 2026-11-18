import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f, wordAt} from '../timeline';
import type {ShotProps} from './kit';
import {S01Wide, S02Close, S03Vanish, S04Car, S05Reflection, S06DaviTag, S15CanJump} from './shotsCopa';
import {S07Bridge, S08FallTop, S09Fall, S10Blink, S11Bed, S12Purpose, S13Can, S14Phone} from './shotsMemory';
import {S16Arrive, S17CanRip, S18Impact, S19Hole, S29Body, S30EmptyHand} from './shotsTokyo';
import {S20GlobeRio, S21RioSpeed, S22East, S23ToTokyo, S24TokyoSpeed, S25Opposite, S26Contrary, S27Sum, S28Delta, S31Verdict} from './shotsGlobe';


/** Cut list: [line, word index] where each shot starts (always on a word onset). */
const CUTS: [string, number, React.FC<ShotProps>][] = [
  ['L1', 0, S01Wide],
  ['L1', 6, S02Close],
  ['L1', 11, S03Vanish],
  ['L2', 2, S04Car],
  ['L2', 7, S05Reflection],
  ['L3', 0, S06DaviTag],
  ['L3', 2, S07Bridge],
  ['L3', 7, S08FallTop],
  ['L3', 9, S09Fall],
  ['L3', 14, S10Blink],
  ['L3', 16, S11Bed],
  ['L4', 1, S12Purpose],
  ['L4', 5, S13Can],
  ['L4', 9, S14Phone],
  ['L4', 13, S15CanJump],
  ['L5', 1, S16Arrive],
  ['L5', 3, S17CanRip],
  ['L5', 6, S18Impact],
  ['L5', 11, S19Hole],
  ['L6', 2, S20GlobeRio],
  ['L6', 8, S21RioSpeed],
  ['L6', 13, S22East],
  ['L7', 0, S23ToTokyo],
  ['L7', 5, S24TokyoSpeed],
  ['L7', 7, S25Opposite],
  ['L7', 14, S26Contrary],
  ['L8', 0, S27Sum],
  ['L8', 2, S28Delta],
  ['L8', 7, S29Body],
  ['L8', 12, S30EmptyHand],
  ['L8', 16, S31Verdict],
];

const P0 = f(PARTS.A.start);
const END = f(PARTS.A.end);
export const SHOTS = CUTS.map(([l, w, C], i) => {
  const start = l === 'L1' && w === 0 ? P0 : f(wordAt(l, w));
  const next = i + 1 < CUTS.length ? f(wordAt(CUTS[i + 1][0], CUTS[i + 1][1])) : END;
  return {start, d: next - start, C};
});

/** Part A (0–34.76 s, L1–L8). Local frame 0 = PARTS.A.start. */
export const PartA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map(({start, d, C}, i) => (
      <Sequence key={i} from={start - P0} durationInFrames={d} layout="none">
        <AbsoluteFill>
          <C start={start} d={d} />
        </AbsoluteFill>
      </Sequence>
    ))}
  </AbsoluteFill>
);
