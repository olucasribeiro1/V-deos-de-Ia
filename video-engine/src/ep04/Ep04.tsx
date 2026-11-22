import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Ep04Captions} from './captions';
import {FieldMeter} from './FieldMeter';
import {PARTS, f} from './timeline';
import {PartA} from './partA/PartA';
import {PartB} from './partB/PartB';

export const Ep04: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(PARTS.A.start)} durationInFrames={f(PARTS.A.end) - f(PARTS.A.start)}>
      <PartA />
    </Sequence>
    <Sequence from={f(PARTS.B.start)} durationInFrames={f(PARTS.B.end) - f(PARTS.B.start)}>
      <PartB />
    </Sequence>
    <FieldMeter />
    <Ep04Captions />
    {withAudio ? <Audio src={staticFile('ep04/mix.wav')} /> : null}
  </AbsoluteFill>
);

/** Preview of a part with the meter + captions overlaid at the correct absolute time. */
export const Ep04Preview: React.FC<{part: 'A' | 'B'}> = ({part}) => {
  const P = part === 'A' ? PartA : PartB;
  const off = f(PARTS[part].start);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <P />
      <Sequence from={-off}>
        <FieldMeter />
        <Ep04Captions />
      </Sequence>
    </AbsoluteFill>
  );
};
