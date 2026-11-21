import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AcademyCourtyard, ArenaInterior} from '../sets/Academy';
import {PlacedBruno, PlacedStudent, ForceDome} from '../characters';
import {PlacedDavi} from '../../characters/Davi';

export const PartA: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / 30;
  if (fr < 100)
    return (
      <AcademyCourtyard t={t}>
      </AcademyCourtyard>
    );
  return (
    <AbsoluteFill>
      <ArenaInterior t={t} viewY={fr < 200 ? 0 : -800} excite={0.6} screen={<div style={{fontSize: 120}}>BRUNO</div>} />
      <PlacedDavi x={300} y={1700} height={700} />
      <PlacedStudent seed={3} x={160} y={1800} height={700} />
      <PlacedBruno x={680} y={1750} height={820} />
      <ForceDome cx={680} baseY={1750} r={520} k={1} t={t} />
    </AbsoluteFill>
  );
};
