import React from 'react';
import {useCurrentFrame} from 'remotion';
import {PlacedDavi} from '../characters/Davi';
import type {Pose, Expression} from '../characters/types';
import {HUD_FONT} from '../lib/fonts';
import {mouthAt} from './timeline';

/**
 * Davi as the NorteSul presenter, lip-synced to the narration.
 * `absOffset` = absolute frame of this part's local frame 0 (f(PARTS.X.start)), so the mouth follows the real audio.
 * x,y = feet point on screen (px), height = puppet height (px). Use upperOnly for talking-head framing.
 * A NorteSul badge (gota + "NorteSul") is drawn on the chest.
 */
export const Presenter: React.FC<{
  absOffset: number;
  x: number;
  y: number;
  height: number;
  pose?: Pose;
  expr?: Expression;
  upperOnly?: boolean;
  badge?: boolean;
}> = ({absOffset, x, y, height, pose, expr, upperOnly, badge = true}) => {
  const frame = useCurrentFrame();
  const abs = frame + absOffset;
  const m = mouthAt(abs);
  const mouth = m < 0.12 ? 0 : Math.min(1, m * 0.9);
  const blinkCycle = abs % 110;
  const blink = blinkCycle < 3 ? 1 : 0;
  const k = height / 1000;
  return (
    <>
      <PlacedDavi
        x={x}
        y={y}
        height={height}
        upperOnly={upperOnly}
        pose={{facing: 0.05, headTilt: Math.sin(abs / 37) * 2, ...pose}}
        expr={{blink, smile: 0.35, mouthOpen: mouth, browRaise: 0.15 + mouth * 0.2, ...expr}}
      />
      {badge && (
        <div
          style={{
            position: 'absolute',
            left: x + 25 * k,
            top: y - 690 * k,
            padding: `${6 * k}px ${12 * k}px`,
            borderRadius: 8 * k,
            background: '#ffffff',
            color: '#0b4f8a',
            fontFamily: HUD_FONT,
            fontWeight: 700,
            fontSize: 26 * k,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          💧 NorteSul
        </div>
      )}
    </>
  );
};
