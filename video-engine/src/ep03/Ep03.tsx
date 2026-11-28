import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Ep03Captions} from './captions';
import {RankMeter} from './RankMeter';
import {PARTS, f} from './timeline';
import {PartA} from './partA/PartA';
import {PartB} from './partB/PartB';

export const Ep03: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(PARTS.A.start)} durationInFrames={f(PARTS.A.end) - f(PARTS.A.start)}>
      <PartA />
    </Sequence>
    <Sequence from={f(PARTS.B.start)} durationInFrames={f(PARTS.B.end) - f(PARTS.B.start)}>
      <PartB />
    </Sequence>
    <RankMeter />
    <Ep03Captions />
    {withAudio ? <Audio src={staticFile('ep03/mix.wav')} /> : null}
  </AbsoluteFill>
);

/** Preview of a part with the meter + captions overlaid at the correct absolute time. */
export const Ep03Preview: React.FC<{part: 'A' | 'B'}> = ({part}) => {
  const P = part === 'A' ? PartA : PartB;
  const off = f(PARTS[part].start);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <P />
      <Sequence from={-off}>
        <RankMeter />
        <Ep03Captions />
      </Sequence>
    </AbsoluteFill>
  );
};
