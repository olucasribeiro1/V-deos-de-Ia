import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {VIDEO} from '../../config/video';
import {Outlines} from '../../components/effects/Outlines';
import {Apartment} from '../../components/environments/Apartment';
import {City} from '../../components/environments/City';
import {Lighting} from '../../components/lighting/Lighting';
import {PovRig} from '../../components/camera/PovRig';
import {PovHands} from '../../components/hands/PovHands';
import {Phone} from '../../components/props/Phone';
import {buildPovTrack} from '../../systems/camera/pov';
import {HP, HandPoseName} from '../../systems/animation/handPoses';
import {Grade} from '../../components/effects/Grade';

/** Still de verificação: cada frame mostra uma pose de mão diferente em um ponto do apartamento. */
const SHOTS: {x: number; z: number; yaw: number; pitch: number; r: HandPoseName; l: HandPoseName; phone?: boolean}[] = [
  {x: -0.6, z: -5.6, yaw: 30, pitch: -8, r: 'phoneLook', l: 'hidden', phone: true},
  {x: 2.75, z: -1.4, yaw: 180, pitch: -5, r: 'knob', l: 'push'},
  {x: -2.6, z: -6.6, yaw: 15, pitch: -6, r: 'reach', l: 'hidden'},
  {x: 2.75, z: -6.5, yaw: 180, pitch: -4, r: 'hidden', l: 'hidden'},
];

export const HandsTest: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(SHOTS.length - 1, Math.floor(f / 6))];
  const track = useMemo(() => buildPovTrack([{t: 0, v: {x: s.x, z: s.z, yaw: s.yaw, pitch: s.pitch}}], VIDEO.fps, 2), [s]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <ThreeCanvas width={VIDEO.width} height={VIDEO.height} shadows gl={{antialias: true}}>
        <Lighting preset="dusk" />
        <Apartment state={{bagAt: 'sofa', supplies: 0.6}} />
        <City t={f / VIDEO.fps} chaos={0.6} />
        <PovRig track={track} frame={0}>
          <PovHands right={HP[s.r]} left={HP[s.l]} t={f / VIDEO.fps} rightProp={s.phone ? <group position={[0, 0.1, 0.036]}><Phone screen={{kind: 'incoming', name: 'Rafael', pulse: 0.5}} /></group> : undefined} />
        </PovRig>
        <Outlines />
      </ThreeCanvas>
      <Grade />
    </AbsoluteFill>
  );
};
