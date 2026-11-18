import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAPTION_FONT} from '../lib/fonts';

export type CaptionCue = {text: string; from: number; to: number; pos?: 'top' | 'bottom' | 'center'};

const POS_Y: Record<NonNullable<CaptionCue['pos']>, number> = {top: 0.2, center: 0.5, bottom: 0.76};

/** One caption: uppercase condensed bold, pops in with a quick scale overshoot. */
export const Caption: React.FC<{text: string; from: number; to: number; pos?: CaptionCue['pos']; size?: number}> = ({
  text,
  from,
  to,
  pos = 'top',
  size = 82,
}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const s = spring({frame: frame - from, fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
  const scale = interpolate(s, [0, 1], [0.55, 1]);
  const opacity = interpolate(frame - from, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  const out = interpolate(frame, [to - 3, to], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: POS_Y[pos] * height,
          transform: `translateY(-50%) scale(${scale})`,
          textAlign: 'center',
          fontFamily: CAPTION_FONT,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: 0.5,
          color: '#fff',
          textTransform: 'uppercase',
          opacity: opacity * out,
          textShadow:
            '0 0 3px rgba(0,0,0,0.9), 0 3px 0 rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.55), 0 0 36px rgba(0,0,0,0.25)',
          WebkitTextStroke: '1.5px rgba(10,8,12,0.55)',
          paintOrder: 'stroke fill',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{cues: CaptionCue[]; size?: number}> = ({cues, size}) => (
  <>
    {cues.map((c, i) => (
      <Caption key={i} {...c} size={size} />
    ))}
  </>
);
