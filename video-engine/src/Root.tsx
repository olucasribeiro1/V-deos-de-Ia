import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './lib/fonts';
import {Teste20s} from './Teste20s';
import {CharacterSheet} from './CharacterSheet';
import {FPS, H, W} from './lib/constants';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Teste20s" component={Teste20s} durationInFrames={600} fps={FPS} width={W} height={H} />
    <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);
