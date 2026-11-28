import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {NsCaptions} from './captions';
import {ReservoirMeter} from './ReservoirMeter';
import {PARTS, f} from './timeline';
import {PartA} from './partA/PartA';
import {PartB} from './partB/PartB';
import {PartC} from './partC/PartC';

export const NorteSul: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(PARTS.A.start)} durationInFrames={f(PARTS.A.end) - f(PARTS.A.start)}>
      <PartA />
    </Sequence>
    <Sequence from={f(PARTS.B.start)} durationInFrames={f(PARTS.B.end) - f(PARTS.B.start)}>
      <PartB />
    </Sequence>
    <Sequence from={f(PARTS.C.start)} durationInFrames={f(PARTS.C.end) - f(PARTS.C.start)}>
      <PartC />
    </Sequence>
    <ReservoirMeter />
    <NsCaptions />
    {withAudio ? <Audio src={staticFile('nortesul/mix.wav')} /> : null}
  </AbsoluteFill>
);

/** Preview of a part with the meter + captions overlaid at the correct absolute time. */
export const NorteSulPreview: React.FC<{part: 'A' | 'B' | 'C'}> = ({part}) => {
  const P = {A: PartA, B: PartB, C: PartC}[part];
  const off = f(PARTS[part].start);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <P />
      <Sequence from={-off}>
        <ReservoirMeter />
        <NsCaptions />
      </Sequence>
    </AbsoluteFill>
  );
};
