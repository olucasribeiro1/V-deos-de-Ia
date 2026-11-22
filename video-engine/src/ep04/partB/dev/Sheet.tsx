import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PartB} from '../PartB';
import {PARTS, f} from '../../timeline';
import {FieldMeter} from '../../FieldMeter';
import {Ep04Captions} from '../../captions';

const off = f(PARTS.B.start);
/** Contact sheet: 3x2 cells of Part B at the given local frames (render frame 0). */
export const Sheet: React.FC<{frames: number[]; caps?: boolean}> = ({frames, caps = true}) => (
  <AbsoluteFill style={{background: '#333'}}>
    {frames.map((fr, i) => (
      <div key={i} style={{position: 'absolute', left: (i % 3) * 1080, top: Math.floor(i / 3) * 1920, width: 1080, height: 1920, overflow: 'hidden', outline: '4px solid #f0f'}}>
        <Sequence from={-fr}>
          <PartB />
        </Sequence>
        {caps && (
          <Sequence from={-fr - off}>
            <FieldMeter />
            <Ep04Captions />
          </Sequence>
        )}
        <div style={{position: 'absolute', left: 10, top: 10, color: '#0f0', fontSize: 60, fontFamily: 'monospace', background: '#000'}}>{fr}</div>
      </div>
    ))}
  </AbsoluteFill>
);
