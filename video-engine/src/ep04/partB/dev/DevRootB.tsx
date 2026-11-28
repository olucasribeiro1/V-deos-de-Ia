import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {loadFonts} from '../../../lib/fonts';
import {PartB} from '../PartB';
import {PARTS, f} from '../../timeline';
import {FieldMeter} from '../../FieldMeter';
import {Ep04Captions} from '../../captions';
import {FPS, H, W} from '../../../lib/constants';
import {Sheet} from './Sheet';

loadFonts();

const off = f(PARTS.B.start);
const Preview: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <PartB />
    <Sequence from={-off}>
      <FieldMeter />
      <Ep04Captions />
    </Sequence>
  </AbsoluteFill>
);

export const DevRootB: React.FC = () => (
  <>
  <Composition id="Sheet" component={Sheet} defaultProps={{frames: [0, 1, 2, 3, 4, 5], caps: true}} durationInFrames={1} fps={FPS} width={W * 3} height={H * 2} />
  <Composition id="Ep04PartB" component={Preview} durationInFrames={f(PARTS.B.end) - off} fps={FPS} width={W} height={H} />
  </>
);
