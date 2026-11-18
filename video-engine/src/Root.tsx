import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './lib/fonts';
import {Teste20s} from './Teste20s';
import {CharacterSheet} from './CharacterSheet';
import {Ep01} from './ep01/Ep01';
import {ChannelAvatar, ChannelBanner} from './branding/Branding';
import {PartA} from './ep01/partA/PartA';
import {PartB} from './ep01/partB/PartB';
import {PartC} from './ep01/partC/PartC';
import {EP_DURATION, PARTS, f} from './ep01/timeline';
import {FPS, H, W} from './lib/constants';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Teste20s" component={Teste20s} durationInFrames={600} fps={FPS} width={W} height={H} />
    <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Ep01" component={Ep01} durationInFrames={EP_DURATION} fps={FPS} width={W} height={H} />
    <Composition id="Ep01PartA" component={PartA} durationInFrames={f(PARTS.A.end) - f(PARTS.A.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep01PartB" component={PartB} durationInFrames={f(PARTS.B.end) - f(PARTS.B.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep01PartC" component={PartC} durationInFrames={f(PARTS.C.end) - f(PARTS.C.start)} fps={FPS} width={W} height={H} />
    <Composition id="ChannelAvatar" component={ChannelAvatar} durationInFrames={1} fps={FPS} width={800} height={800} />
    <Composition id="ChannelBanner" component={ChannelBanner} durationInFrames={1} fps={FPS} width={2560} height={1440} />
  </>
);
