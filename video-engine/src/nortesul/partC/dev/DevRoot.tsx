import React from 'react';
import {Composition, Sequence, useCurrentFrame} from 'remotion';
import {loadFonts} from '../../../lib/fonts';
import {NorteSulPreview} from '../../NorteSul';
import {PARTS, f} from '../../timeline';

loadFonts();
// absolute seconds to sample (env-free: edit list)
const SAMPLES = [104.0, 105.9, 108.6, 110.5, 112.6, 114.3, 115.8, 117.5, 119.8, 121.8, 123.8, 125.5, 128.0, 130.3, 132.5, 134.6, 137.0, 139.2, 141.0, 142.6, 144.8, 146.5, 148.2, 149.8, 151.5, 153.8, 155.0, 157.5, 160.5, 163.5];
const Sheet: React.FC = () => {
  const i = useCurrentFrame();
  return (
    <Sequence from={i - (f(SAMPLES[i]) - f(PARTS.C.start))}>
      <NorteSulPreview part="C" />
    </Sequence>
  );
};
export const DevRoot: React.FC = () => <Composition id="PartCSheet" component={Sheet} durationInFrames={SAMPLES.length} fps={30} width={1080} height={1920} />;
