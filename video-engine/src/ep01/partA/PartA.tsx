import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Globe, SpaceBackdrop} from '../../environments/Globe';

export const PartA: React.FC = () => {
  const frame = useCurrentFrame();
  const polar = frame < 20;
  return (
    <AbsoluteFill>
      <SpaceBackdrop />
      <Globe rotation={polar ? 48 : -43} tilt={polar ? 70 : -23} zoom={polar ? 1 : 3.2} radius={420} cy={polar ? 960 : 960 + 1344} t={0} highlightMeridianLon={140} highlightEquator={polar ? 1 : 0}
        pins={[{lat: -22.9, lon: -43.2, label: 'RIO', pulse: 0.3}, {lat: 35.7, lon: 139.7, label: 'TÓQUIO', color: '#ff7a1f'}]}
        arrows={[{lat: -22.9, lon: -43.2, length: 30}, {lat: 35.7, lon: 139.7, length: 26, color: '#ff7a1f'}]} />
    </AbsoluteFill>
  );
};
