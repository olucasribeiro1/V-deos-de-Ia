import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './lib/fonts';
import {Teste20s} from './Teste20s';
import {CharacterSheet} from './CharacterSheet';
import {Ep01} from './ep01/Ep01';
import {Ep02} from './ep02/Ep02';
import {PartA as E2A} from './ep02/partA/PartA';
import {PartB as E2B} from './ep02/partB/PartB';
import {PartC as E2C} from './ep02/partC/PartC';
import * as T2 from './ep02/timeline';
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
    <Composition id="Ep02" component={Ep02} durationInFrames={T2.EP_DURATION} fps={FPS} width={W} height={H} />
    <Composition id="Ep02PartA" component={E2A} durationInFrames={T2.f(T2.PARTS.A.end) - T2.f(T2.PARTS.A.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep02PartB" component={E2B} durationInFrames={T2.f(T2.PARTS.B.end) - T2.f(T2.PARTS.B.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep02PartC" component={E2C} durationInFrames={T2.f(T2.PARTS.C.end) - T2.f(T2.PARTS.C.start)} fps={FPS} width={W} height={H} />
  </>
);
