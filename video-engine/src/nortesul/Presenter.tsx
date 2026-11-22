import React from 'react';
import {useCurrentFrame} from 'remotion';
import {PlacedDaviNS} from './DaviNS';
import type {Pose, Expression} from '../characters/types';
import {mouthAt} from './timeline';

/**
 * Davi as the NorteSul presenter, lip-synced to the narration.
 * `absOffset` = absolute frame of this part's local frame 0 (f(PARTS.X.start)), so the mouth follows the real audio.
 * x,y = feet point on screen (px), height = puppet height (px). Use upperOnly for talking-head framing.
 * The NorteSul chest badge is part of the puppet (PlacedDaviNS), so it is always there.
 */
export const Presenter: React.FC<{
  absOffset: number;
  x: number;
  y: number;
  height: number;
  pose?: Pose;
  expr?: Expression;
  upperOnly?: boolean;
}> = ({absOffset, x, y, height, pose, expr, upperOnly}) => {
  const frame = useCurrentFrame();
  const abs = frame + absOffset;
  const m = mouthAt(abs);
  const mouth = m < 0.12 ? 0 : Math.min(1, m * 0.9);
  const blinkCycle = abs % 110;
  const blink = blinkCycle < 3 ? 1 : 0;
  return (
    <>
      <PlacedDaviNS
        x={x}
        y={y}
        height={height}
        upperOnly={upperOnly}
        pose={{facing: 0.05, headTilt: Math.sin(abs / 37) * 2, ...pose}}
        expr={{blink, smile: 0.35, mouthOpen: mouth, browRaise: 0.15 + mouth * 0.2, ...expr}}
      />
    </>
  );
};
