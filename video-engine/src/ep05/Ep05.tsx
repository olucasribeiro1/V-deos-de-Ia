import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Ep05Captions} from './captions';
import {ClapMeter} from './ClapMeter';
import {PARTS, f} from './timeline';
import {PartA} from './partA/PartA';
import {PartB} from './partB/PartB';

export const Ep05: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(PARTS.A.start)} durationInFrames={f(PARTS.A.end) - f(PARTS.A.start)}>
      <PartA />
    </Sequence>
    <Sequence from={f(PARTS.B.start)} durationInFrames={f(PARTS.B.end) - f(PARTS.B.start)}>
      <PartB />
    </Sequence>
    <ClapMeter />
    <Ep05Captions />
    {withAudio ? <Audio src={staticFile('ep05/mix.wav')} /> : null}
  </AbsoluteFill>
);

/** Preview of a part with the meter + captions overlaid at the correct absolute time. */
export const Ep05Preview: React.FC<{part: 'A' | 'B'}> = ({part}) => {
  const P = part === 'A' ? PartA : PartB;
  const off = f(PARTS[part].start);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <P />
      <Sequence from={-off}>
        <ClapMeter />
        <Ep05Captions />
      </Sequence>
    </AbsoluteFill>
  );
};
