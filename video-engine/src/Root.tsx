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
import {Ep02Qi, Ep02QiPreview} from './ep02qi/Ep02Qi';
import * as TQ from './ep02qi/timeline';
import {Ep03, Ep03Preview} from './ep03/Ep03';
import * as T3 from './ep03/timeline';
import {NorteSul, NorteSulPreview} from './nortesul/NorteSul';
import * as TN from './nortesul/timeline';
import {FollowCard} from './branding/FollowCard';
import {Ep04, Ep04Preview} from './ep04/Ep04';
import * as T4 from './ep04/timeline';
import {PedidoInsert, OutroCTA} from './ep04/extras/Extras';
import {Ep05, Ep05Preview} from './ep05/Ep05';
import * as T5 from './ep05/timeline';
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
    <Composition id="Ep02Qi" component={Ep02Qi} durationInFrames={TQ.EP_DURATION} fps={FPS} width={W} height={H} />
    <Composition id="Ep02QiPartA" component={Ep02QiPreview} defaultProps={{part: 'A' as const}} durationInFrames={TQ.f(TQ.PARTS.A.end) - TQ.f(TQ.PARTS.A.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep02QiPartB" component={Ep02QiPreview} defaultProps={{part: 'B' as const}} durationInFrames={TQ.f(TQ.PARTS.B.end) - TQ.f(TQ.PARTS.B.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep03" component={Ep03} durationInFrames={T3.EP_DURATION} fps={FPS} width={W} height={H} />
    <Composition id="Ep03PartA" component={Ep03Preview} defaultProps={{part: 'A' as const}} durationInFrames={T3.f(T3.PARTS.A.end) - T3.f(T3.PARTS.A.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep03PartB" component={Ep03Preview} defaultProps={{part: 'B' as const}} durationInFrames={T3.f(T3.PARTS.B.end) - T3.f(T3.PARTS.B.start)} fps={FPS} width={W} height={H} />
    <Composition id="NorteSul" component={NorteSul} durationInFrames={TN.EP_DURATION} fps={FPS} width={W} height={H} />
    <Composition id="NorteSulPartA" component={NorteSulPreview} defaultProps={{part: 'A' as const}} durationInFrames={TN.f(TN.PARTS.A.end) - TN.f(TN.PARTS.A.start)} fps={FPS} width={W} height={H} />
    <Composition id="NorteSulPartB" component={NorteSulPreview} defaultProps={{part: 'B' as const}} durationInFrames={TN.f(TN.PARTS.B.end) - TN.f(TN.PARTS.B.start)} fps={FPS} width={W} height={H} />
    <Composition id="NorteSulPartC" component={NorteSulPreview} defaultProps={{part: 'C' as const}} durationInFrames={TN.f(TN.PARTS.C.end) - TN.f(TN.PARTS.C.start)} fps={FPS} width={W} height={H} />
    <Composition id="FollowCard" component={FollowCard} durationInFrames={105} fps={FPS} width={W} height={H} />
    <Composition id="FollowCardNorteSul" component={FollowCard} defaultProps={{nortesul: true}} durationInFrames={105} fps={FPS} width={W} height={H} />
    <Composition id="Ep04" component={Ep04} durationInFrames={T4.EP_DURATION} fps={FPS} width={W} height={H} />
    <Composition id="Ep04PartA" component={Ep04Preview} defaultProps={{part: 'A' as const}} durationInFrames={T4.f(T4.PARTS.A.end) - T4.f(T4.PARTS.A.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep04PartB" component={Ep04Preview} defaultProps={{part: 'B' as const}} durationInFrames={T4.f(T4.PARTS.B.end) - T4.f(T4.PARTS.B.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep04Pedido" component={PedidoInsert} defaultProps={{withAudio: true}} durationInFrames={72} fps={FPS} width={W} height={H} />
    <Composition id="Ep04Outro" component={OutroCTA} defaultProps={{withAudio: true}} durationInFrames={375} fps={FPS} width={W} height={H} />
    <Composition id="Ep05" component={Ep05} durationInFrames={T5.EP_DURATION} fps={FPS} width={W} height={H} />
    <Composition id="Ep05PartA" component={Ep05Preview} defaultProps={{part: 'A' as const}} durationInFrames={T5.f(T5.PARTS.A.end) - T5.f(T5.PARTS.A.start)} fps={FPS} width={W} height={H} />
    <Composition id="Ep05PartB" component={Ep05Preview} defaultProps={{part: 'B' as const}} durationInFrames={T5.f(T5.PARTS.B.end) - T5.f(T5.PARTS.B.start)} fps={FPS} width={W} height={H} />
  </>
);
