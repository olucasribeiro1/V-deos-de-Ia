import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {QiCaptions} from './captions';
import {BrainMeter} from './BrainMeter';
import {PARTS, f} from './timeline';
import {PartA} from './partA/PartA';
import {PartB} from './partB/PartB';

export const Ep02Qi: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(PARTS.A.start)} durationInFrames={f(PARTS.A.end) - f(PARTS.A.start)}>
      <PartA />
    </Sequence>
    <Sequence from={f(PARTS.B.start)} durationInFrames={f(PARTS.B.end) - f(PARTS.B.start)}>
      <PartB />
    </Sequence>
    <BrainMeter />
    <QiCaptions />
    {withAudio ? <Audio src={staticFile('ep02qi/mix.wav')} /> : null}
  </AbsoluteFill>
);

/** Preview of a part with the meter + captions overlaid at the correct absolute time. */
export const Ep02QiPreview: React.FC<{part: 'A' | 'B'}> = ({part}) => {
  const P = part === 'A' ? PartA : PartB;
  const off = f(PARTS[part].start);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <P />
      <Sequence from={-off}>
        <BrainMeter />
        <QiCaptions />
      </Sequence>
    </AbsoluteFill>
  );
};
