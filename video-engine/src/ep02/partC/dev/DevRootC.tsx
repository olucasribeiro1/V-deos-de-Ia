import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from '../../../lib/fonts';
import {PartC} from '../PartC';
import {PARTS, f} from '../../timeline';
import {FPS, H, W} from '../../../lib/constants';

loadFonts();

export const DevRootC: React.FC = () => (
  <Composition id="Ep02PartC" component={PartC} durationInFrames={f(PARTS.C.end) - f(PARTS.C.start)} fps={FPS} width={W} height={H} />
);
