import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import {ShotP, T0} from './rig';
import * as A from './shotsA';
import * as Bm from './shotsB';
import * as Cm from './shotsC';

/** Shot id (shots.json) -> component. Cuts are taken from shots.json (word starts), so audio + video share one list. */
const REG: Record<string, React.FC<ShotP>> = {
  vanish: A.SVanish,
  ghost: A.SGhost,
  rush: A.SRush,
  void: A.SVoid,
  collapse: A.SCollapse,
  bang: A.SBang,
  glass: A.SGlass,
  ear: A.SEar,
  wave: Bm.SWave,
  rocha: Bm.SRocha,
  mic: Bm.SMic,
  city: Bm.SCity,
  three: Bm.SThree,
  scope: Bm.SScope,
  map: Bm.SMap,
  watch: Bm.SWatch,
  car: Bm.SCar,
  gun: Bm.SGun,
  gloveon: Bm.SGloveOn,
  dossier: Bm.SDossier,
  photo: Bm.SPhoto,
  stamp: Bm.SStamp,
  friday: Cm.SFriday,
  acai: Cm.SAcai,
  suit: Cm.SSuit,
  grab: Cm.SGrab,
  davieyes: Cm.SDaviEyes,
  imagine: Cm.SImagine,
  fly: Cm.SFly,
  wall: Cm.SWall,
  daviNo: Cm.SDaviNo,
  rochaKnows: Cm.SRochaKnows,
  standoff: Cm.SStandoff,
  smile: Cm.SSmile,
  three_suits: Cm.SThreeSuits,
};

const END = f(PARTS.B.end) - T0;

/** Part B (34.76–72.55 s, L9–L16): 35 cuts on word starts. Local frame 0 = PARTS.B.start. */
export const PartB: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {shots.map((s, i) => {
      const from = f(s.start) - T0;
      const to = i + 1 < shots.length ? f(shots[i + 1].start) - T0 : END;
      const C = REG[s.id];
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <C from={from} dur={to - from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
