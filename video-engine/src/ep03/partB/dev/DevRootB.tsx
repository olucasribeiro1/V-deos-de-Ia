import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {loadFonts} from '../../../lib/fonts';
import {PartB} from '../PartB';
import {PARTS, f} from '../../timeline';
import {RankMeter} from '../../RankMeter';
import {Ep03Captions} from '../../captions';
import {FPS, H, W} from '../../../lib/constants';

loadFonts();

const off = f(PARTS.B.start);
const Preview: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <PartB />
    <Sequence from={-off}>
      <RankMeter />
      <Ep03Captions />
    </Sequence>
  </AbsoluteFill>
);

export const DevRootB: React.FC = () => (
  <Composition id="Ep03PartB" component={Preview} durationInFrames={f(PARTS.B.end) - off} fps={FPS} width={W} height={H} />
);
