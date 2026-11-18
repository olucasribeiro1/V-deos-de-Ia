import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CarCabinBack, CarFrontSeats, CarNightOutside, CarWindshield, StreetlightSweep} from '../environments/CarInterior';
import {CityMap, MapPin, MicMarker} from '../environments/CityMap';
import {PlacedAgent} from '../characters/Agent';
import {NIGHT_LIGHT} from '../characters/types';
import {kf, wobble} from '../lib/anim';
import {Particles} from '../fx/Particles';
import {Finish} from './common';

const Tablet: React.FC<{t: number; frame: number}> = ({t, frame}) => (
  <g transform="translate(0,-660) rotate(-3)">
    <rect x={-150} y={-95} width={300} height={190} rx={18} fill="#0b0d14" stroke="#2b3248" strokeWidth={4} />
    <svg x={-136} y={-81} width={272} height={162} viewBox="350 900 700 420" preserveAspectRatio="xMidYMid slice">
      <CityMap t={t} idPrefix="tab" labels={false} />
      <MicMarker x={520} y={1000} active={0.5} scale={0.9} />
      <MicMarker x={880} y={1240} active={0.5} scale={0.9} />
      <MapPin x={720} y={1110} drop={kf(frame, [30, 40], [0, 1])} pulse={((frame % 30) / 30) * (frame > 40 ? 1 : 0)} scale={0.9} />
    </svg>
    <rect x={-136} y={-81} width={272} height={162} fill="url(#tab-sheen)" />
    <defs>
      <linearGradient id="tab-sheen" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.18} />
        <stop offset="0.4" stopColor="#fff" stopOpacity={0} />
      </linearGradient>
    </defs>
  </g>
);

/** 10–13 s: Rocha and two agents in a dark car, Rocha holds a tablet with the city map. */
export const Shot5Car: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const p = frame / durationInFrames;
  const zoom = 1.1 + p * 0.12;
  const bump = Math.sin(t * 13) * 1.5 + wobble(t * 3, 5) * 2;
  const light = {...NIGHT_LIGHT, side: -1 as const, rimStrength: 0.45};
  return (
    <AbsoluteFill style={{background: '#050814', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${zoom}) translateY(${bump}px)`, transformOrigin: '40% 58%'}}>
        <AbsoluteFill style={{transform: `translateX(${-p * 30}px)`}}>
          <CarNightOutside t={t + 10} />
        </AbsoluteFill>
        <CarCabinBack />
        {/* back seat agent */}
        <PlacedAgent
          variant="agentA"
          x={560}
          y={1530}
          height={760}
          upperOnly
          blur={1.5}
          light={light}
          pose={{headTilt: 4, facing: -0.25, shL: -4, elL: 30, shR: 4, elR: -30}}
          expr={{browTilt: -0.4}}
        />
        <CarFrontSeats />
        {/* driver (screen right) */}
        <PlacedAgent
          variant="agentB"
          x={820}
          y={1860}
          height={1020}
          upperOnly
          light={light}
          pose={{facing: -0.35, headTilt: -3, shL: 10, elL: 40, shR: -6, elR: 50}}
          expr={{browTilt: -0.6, lookX: -0.6}}
        />
        {/* Rocha (screen left) with tablet */}
        <PlacedAgent
          variant="rocha"
          x={300}
          y={1880}
          height={1060}
          upperOnly
          light={light}
          pose={{facing: 0.25, headTilt: 5 + wobble(t, 2), lean: 2, shL: -32, elL: 128, shR: 32, elR: -128}}
          expr={{halfSmile: kf(frame, [10, 30], [0.3, 1]), smile: 0.2, browAsym: 0.5, browTilt: -0.3}}
          heldProp={<Tablet t={t} frame={frame} />}
        />
        {/* tablet glow on Rocha's face */}
        <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
          <div
            style={{
              position: 'absolute',
              left: 300 - 360,
              top: 1220 - 420,
              width: 720,
              height: 720,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(90,190,255,0.35) 0%, rgba(90,190,255,0.12) 45%, rgba(90,190,255,0) 70%)',
            }}
          />
        </AbsoluteFill>
        <StreetlightSweep t={t} />
        <CarWindshield t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(30,50,120,0.28)', mixBlendMode: 'multiply'}} />
      <Particles t={t} seed="s5" count={18} bokeh={4} color="170,210,255" bokehColor="120,180,255" driftX={-30} />
      <Finish vignette={0.65} grain={0.12} />
    </AbsoluteFill>
  );
};
