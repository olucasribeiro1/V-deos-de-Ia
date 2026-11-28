import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Ep06Captions} from './captions';
import {EnergyMeter, LaughCounter} from './Hud';
import {EP_DURATION, f, wordAt} from './timeline';
import type {ShotP} from './kit';
import * as A from './shotsA';
import * as B from './shotsB';

type AnyShot = React.FC<ShotP>;
/** Cut list: [id, line, word index, shot]. Every cut lands on a word onset (timing.json). */
export const CUTS: [string, string, number, AnyShot][] = [
  ['s01', 'L1', 0, A.S01DaviPose],
  ['s02', 'L1', 2, A.S02Switch],
  ['s03', 'L1', 15, A.S03Levitate],
  ['s04', 'L1', 22, A.S04SimBananas],
  ['s05', 'L1', 24, A.S05Precision],
  ['s06', 'L2', 0, A.S06Pedido],
  ['s07', 'L3', 0, A.S07School],
  ['s08', 'L3', 7, A.S08KaduFire],
  ['s09', 'L3', 11, A.S09BiaFly],
  ['s10', 'L3', 14, A.S10MateusQ],
  ['s11', 'L3', 16, A.S11Spin],
  ['s12', 'L4', 0, A.S12Locker],
  ['s13', 'L4', 4, A.S13Laugh],
  ['s14', 'L4', 5, A.S14Teacher],
  ['s15', 'L5', 0, A.S15Arena],
  ['s16', 'L5', 4, A.S16Throw],
  ['s17', 'L5', 9, A.S17Bonk],
  ['s18', 'L5', 15, A.S18Roar],
  ['s19', 'L6', 0, A.S19Study],
  ['s20', 'L6', 5, A.S20Discover],
  ['s21', 'L6', 7, A.S21Balance],
  ['s22', 'L7', 0, A.S22Speed],
  ['s23', 'L7', 5, A.S23TntBoom],
  ['s24', 'L7', 13, A.S24Digest],
  ['s25', 'L8', 0, A.S25PowerArm],
  ['s26', 'L8', 5, A.S26Release],
  ['s27', 'L9', 0, A.S27Rule],
  ['s28', 'L9', 3, B.S28Starch],
  ['s29', 'L9', 11, B.S29Ripeness],
  ['s30', 'L10', 0, B.S30Hundred],
  ['s31', 'L10', 8, B.S31Dial],
  ['s32', 'L10', 15, B.S32Rojao],
  ['s33', 'L11', 0, B.S33Month],
  ['s34', 'L11', 3, B.S34Fly],
  ['s35', 'L11', 9, B.S35Dad],
  ['s36', 'L11', 13, B.S36Three],
  ['s37', 'L12', 0, B.S37Friction],
  ['s38', 'L12', 11, B.S38Bars],
  ['s39', 'L12', 17, B.S39Ice],
  ['s40', 'L13', 0, B.S40Final],
  ['s41', 'L13', 2, B.S41Fireball],
  ['s42', 'L14', 0, B.S42Peels],
  ['s43', 'L14', 7, B.S43Charge],
  ['s44', 'L14', 10, B.S44Skate],
  ['s45', 'L15', 0, B.S45Ripest],
  ['s46', 'L15', 8, B.S46Hover],
  ['s47', 'L15', 14, B.S47Boom],
  ['s48', 'L15', 16, B.S48Wave],
  ['s49', 'L15', 19, B.S49KaduFlies],
  ['s50', 'L16', 0, B.S50Champion],
  ['s51', 'L16', 2, B.S51Silence],
  ['s52', 'L17', 0, B.S52Potassium],
  ['s53', 'L17', 7, B.S53Tiny],
  ['s54', 'L17', 8, B.S54Airport],
  ['s55', 'L17', 15, B.S55Alarm],
];

export const SHOTS = CUTS.map(([id, l, w, C], i) => {
  const from = i === 0 ? 0 : f(wordAt(l, w));
  const to = i + 1 < CUTS.length ? f(wordAt(CUTS[i + 1][1], CUTS[i + 1][2])) : EP_DURATION;
  return {id, from, dur: to - from, C};
});

export const Ep06: React.FC<{withAudio?: boolean; from?: number; to?: number}> = ({withAudio = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map(({id, from, dur, C}) => (
      <Sequence key={id} from={from} durationInFrames={dur} name={id}>
        <C from={from} dur={dur} />
      </Sequence>
    ))}
    <EnergyMeter />
    <LaughCounter />
    <Ep06Captions />
    {withAudio ? <Audio src={staticFile('ep06/mix.wav')} /> : null}
  </AbsoluteFill>
);
