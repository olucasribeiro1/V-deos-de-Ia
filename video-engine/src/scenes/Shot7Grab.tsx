import React from 'react';
import {AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Copacabana} from '../environments/Copacabana';
import {FaceCloseup, GloveGrab, SleeveArm} from '../characters/Closeups';
import {DAVI_OUTFIT} from '../characters/Davi';
import {Cam} from '../lib/camera';
import {H, W} from '../lib/constants';
import {easeOut, kf, shake, wobble} from '../lib/anim';
import {Particles} from '../fx/Particles';
import {Finish} from './common';
import {DAVI_SPOT} from './Shot1Calcadao';

export const GRAB_DUR = 62;
export const EYES_DUR = 42;
const GRIP_AT = 24;

const bgCam = (p: number): Cam => ({x: DAVI_SPOT.x + 0.6 - p * 0.15, y: 0.95, z: DAVI_SPOT.z - 1.1, pitch: 8, f: 1650, cy: H * 0.5});

/** 16–18 s: black glove closes on the yellow sleeve at the wrist. */
const GrabPart: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = frame / GRAB_DUR;
  const reach = kf(frame, [2, GRIP_AT - 4], [0, 1], easeOut);
  const grip = kf(frame, [GRIP_AT - 6, GRIP_AT + 2], [0, 1], easeOut);
  const sq = kf(frame, [GRIP_AT, GRIP_AT + 3, GRIP_AT + 10], [0, 1, 0.75]);
  const sh = shake(frame, GRIP_AT, 12, 22, 4);
  const zoom = 1.0 + p * 0.08 + kf(frame, [GRIP_AT, GRIP_AT + 3, GRIP_AT + 12], [0, 0.05, 0.03]);
  const ax = 500;
  const wristY = 1020;
  const gripY = 850;
  const sway = wobble(t * 0.8, 3) * 6 * (1 - grip);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${1.08 + p * 0.03})`}}>
        <Copacabana cam={bgCam(p)} t={t + 16} focus={0.5} aperture={22} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${zoom}) rotate(${-6 + sh.r * 57}deg)`, transformOrigin: `${ax}px ${gripY}px`}}>
        <svg width={W} height={H} style={{overflow: 'visible', filter: 'drop-shadow(0 30px 40px rgba(40,10,30,0.35))'}}>
          <g transform={`translate(${sway},0)`}>
            <SleeveArm x={ax} wristY={wristY} sleeve={DAVI_OUTFIT.top} skin={DAVI_OUTFIT.skin} tense={kf(frame, [GRIP_AT, GRIP_AT + 6], [0, 1])} squeeze={sq} gripY={gripY} />
            <GloveGrab ax={ax} ay={gripY} armHalfW={126} reach={reach} grip={grip} />
          </g>
        </svg>
      </AbsoluteFill>
      <Particles t={t + 16} seed="s7" count={26} bokeh={8} driftX={-16} />
      <Finish vignette={0.6} />
    </AbsoluteFill>
  );
};

/** 18–19.4 s: Davi's eyes snap wide. */
const EyesPart: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const snap = spring({frame: frame - 5, fps, config: {damping: 9, stiffness: 260, mass: 0.5}});
  const zoom = 1 + snap * 0.07 + frame * 0.002;
  const sh = shake(frame, 5, 10, 10, 6);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: 'scale(1.1)'}}>
        <Copacabana cam={bgCam(1)} t={t + 18} focus={0.4} aperture={24} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${zoom})`, transformOrigin: '540px 960px'}}>
        <svg width={W} height={H} style={{overflow: 'visible'}}>
          <FaceCloseup
            cx={540}
            cy={1060}
            k={6.6}
            skin={DAVI_OUTFIT.skin}
            style={DAVI_OUTFIT.head}
            facing={0.05}
            expr={{
              eyesWide: snap,
              browRaise: snap * 0.15,
              browTilt: snap * 0.9,
              halfSmile: 0.7 * (1 - snap),
              smile: -0.35 * snap,
              mouthOpen: snap * 0.12,
              lookX: 0.6 * snap,
              blink: kf(frame, [0, 2, 4], [0, 0.5, 0]),
            }}
          />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0,0,0,0) 55%, rgba(10,4,12,0.55) 100%)'}} />
      <Finish vignette={0.5} />
    </AbsoluteFill>
  );
};

/** 16–20 s: grab, eyes, cut to black. */
export const Shot7Grab: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence durationInFrames={GRAB_DUR}>
      <GrabPart />
    </Sequence>
    <Sequence from={GRAB_DUR} durationInFrames={EYES_DUR}>
      <EyesPart />
    </Sequence>
  </AbsoluteFill>
);
