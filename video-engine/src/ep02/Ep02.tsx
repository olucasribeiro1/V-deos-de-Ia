import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Captions} from '../ui/Caption';
import {buildCaptionCues} from './captions';
import {PARTS, f} from './timeline';
import {PartA} from './partA/PartA';
import {PartB} from './partB/PartB';
import {PartC} from './partC/PartC';

const CUES = buildCaptionCues();

export const Ep02: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {(['A', 'B', 'C'] as const).map((k) => {
      const P = {A: PartA, B: PartB, C: PartC}[k];
      return (
        <Sequence key={k} from={f(PARTS[k].start)} durationInFrames={f(PARTS[k].end) - f(PARTS[k].start)}>
          <P />
        </Sequence>
      );
    })}
    <Captions cues={CUES} />
    {withAudio ? <Audio src={staticFile('ep02/mix.wav')} /> : null}
  </AbsoluteFill>
);
