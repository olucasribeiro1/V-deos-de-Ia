import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PlacedDavi} from './characters/Davi';
import {PlacedAgent} from './characters/Agent';
import {PlacedLia} from './characters/Lia';

/** Turnaround-style sheet to check proportions and expressions. */
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#f2c48a, #c9785a)'}}>
    <PlacedDavi x={170} y={900} height={700} expr={{halfSmile: 0.8, smile: 0.2}} />
    <PlacedLia x={540} y={900} height={660} expr={{smile: 0.8, browRaise: 0.4}} carryHeels="R" pose={{shR: 14, elR: -30}} />
    <PlacedAgent variant="rocha" x={900} y={900} height={720} expr={{halfSmile: 1, browAsym: 0.6}} />
    <PlacedAgent variant="agentA" x={110} y={1820} height={620} pose={{shL: 20, elL: 90, shR: -20, elR: -90}} />
    <PlacedLia x={340} y={1820} height={660} expr={{mouthOpen: 0.5, smile: 0.7, blink: 1}} pose={{facing: -0.4, headTilt: -6, hipL: -10, hipR: 8}} />
    <PlacedAgent variant="rochaGala" x={590} y={1820} height={720} expr={{halfSmile: 1}} />
    <PlacedAgent variant="agentGala" x={800} y={1820} height={640} />
    <PlacedDavi x={990} y={1820} height={620} expr={{eyesWide: 1, mouthOpen: 0.4, browRaise: 1}} pose={{facing: 0.5, shR: 40, elR: 60}} />
  </AbsoluteFill>
);
