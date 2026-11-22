import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Presenter} from '../Presenter';

/** Placeholder — replaced by the part-A agent. Local frame 0 = PARTS.A.start. */
export const PartA: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#bfe4ff,#e9f6ff)'}}>
    <Presenter absOffset={0} x={540} y={2300} height={1900} upperOnly />
  </AbsoluteFill>
);
