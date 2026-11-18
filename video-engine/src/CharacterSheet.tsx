import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PlacedDavi} from './characters/Davi';
import {PlacedAgent} from './characters/Agent';

/** Turnaround-style sheet to check proportions and expressions. */
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#f2c48a, #c9785a)'}}>
    <PlacedDavi x={300} y={900} height={760} expr={{halfSmile: 0.8, smile: 0.2}} />
    <PlacedAgent variant="rocha" x={800} y={900} height={800} expr={{halfSmile: 1, browAsym: 0.6}} />
    <PlacedAgent variant="agentA" x={260} y={1820} height={760} pose={{shL: 20, elL: 90, shR: -20, elR: -90}} />
    <PlacedAgent variant="agentB" x={560} y={1820} height={760} expr={{browTilt: -1}} />
    <PlacedDavi x={860} y={1820} height={760} expr={{eyesWide: 1, mouthOpen: 0.4, browRaise: 1}} pose={{facing: 0.5, shR: 40, elR: 60}} />
  </AbsoluteFill>
);
