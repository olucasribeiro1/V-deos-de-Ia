import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CityMap, MapPin, MicMarker} from '../environments/CityMap';
import {H, W} from '../lib/constants';
import {clamp, kf, easeOut} from '../lib/anim';
import {HudLabel} from '../ui/HudLabel';
import {Finish} from './common';

const MICS: [number, number][] = [
  [330, 820],
  [1010, 900],
  [560, 1640],
];
const PIN: [number, number] = [700, 1180];
const RING_START = [6, 14, 22];

/** Screen position of a map point after the CSS transform used below. */
const toScreen = (x: number, y: number, s: number, rotDeg: number, tilt: number, ox: number, oy: number) => {
  const r = (rotDeg * Math.PI) / 180;
  const dx = (x - ox) * s;
  const dy = (y - oy) * s;
  const rx = dx * Math.cos(r) - dy * Math.sin(r);
  const ry = dx * Math.sin(r) + dy * Math.cos(r);
  const th = (tilt * Math.PI) / 180;
  const z = ry * Math.sin(th);
  const persp = 1800;
  const k = persp / (persp - z);
  return {x: W / 2 + rx * k, y: H / 2 + ry * Math.cos(th) * k};
};

/** 13–16 s: top-down map, 3 expanding circles from microphones meet at the red pin. */
export const Shot6Map: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const p = frame / durationInFrames;
  const s = 0.95 + p * 0.22;
  const rot = -6 + p * 6;
  const tilt = 22;
  // map is translated so that PIN sits near the screen centre
  const ox = PIN[0] - 30 + p * 30;
  const oy = PIN[1] + 60 - p * 60;
  const ringsMeet = RING_START[2] + 26;
  const pinDrop = kf(frame, [ringsMeet, ringsMeet + 8], [0, 1], easeOut);
  const pulse = frame > ringsMeet + 8 ? ((frame - ringsMeet - 8) % 24) / 24 : 0;
  const mic0 = toScreen(MICS[0][0], MICS[0][1], s, rot, tilt, ox, oy);
  return (
    <AbsoluteFill style={{background: '#0a1430', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `perspective(1800px) rotateX(${tilt}deg) rotateZ(${rot}deg) scale(${s})`,
          transformOrigin: '50% 50%',
        }}
      >
        <svg width={W} height={H} viewBox={`${ox - W / 2} ${oy - H / 2} ${W} ${H}`} style={{overflow: 'visible'}}>
          <defs>
            <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={6} />
            </filter>
          </defs>
          <CityMap t={t} />
          {MICS.map(([mx, my], i) => {
            const dist = Math.hypot(PIN[0] - mx, PIN[1] - my);
            const k = clamp((frame - RING_START[i]) / (ringsMeet - RING_START[i]));
            const r = dist * easeOut(k);
            const done = frame >= ringsMeet;
            return (
              <g key={i}>
                {k > 0 && (
                  <>
                    <circle cx={mx} cy={my} r={r} fill="#5fd4ff" opacity={0.06} />
                    <circle cx={mx} cy={my} r={r} fill="none" stroke="#5fd4ff" strokeWidth={14} opacity={0.5} filter="url(#ring-glow)" />
                    <circle cx={mx} cy={my} r={r} fill="none" stroke={done ? '#ffffff' : '#9fe6ff'} strokeWidth={5} />
                    <line x1={mx} y1={my} x2={mx + ((PIN[0] - mx) / dist) * r} y2={my + ((PIN[1] - my) / dist) * r} stroke="#9fe6ff" strokeWidth={3} strokeDasharray="12 10" opacity={0.7} />
                  </>
                )}
                <MicMarker x={mx} y={my} active={k > 0 && k < 1 ? 1 : 0.3} scale={1.2} />
              </g>
            );
          })}
          <MapPin x={PIN[0]} y={PIN[1]} drop={pinDrop} pulse={pulse} scale={1.3} />
        </svg>
      </AbsoluteFill>
      {/* scanline + edge glow for a "tablet UI" feel */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(120,200,255,0.035) 0px, rgba(120,200,255,0.035) 2px, transparent 2px, transparent 6px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0,0,0,0) 50%, rgba(3,6,20,0.85) 100%)'}} />
      <HudLabel label="Δt" value={0.004} decimals={3} unit="s" x={120} y={330} tx={mic0.x} ty={mic0.y} from={RING_START[0] + 10} />
      <Finish vignette={0.35} grain={0.1} />
    </AbsoluteFill>
  );
};
