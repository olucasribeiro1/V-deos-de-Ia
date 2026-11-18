import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../lib/constants';

/**
 * Night car interior seen from the dashboard looking back through the windshield.
 * Layers are exposed as separate components so a scene can slot characters in between.
 */

/** City night lights seen through the rear window (blurred bokeh), parallax with `t`. */
export const CarNightOutside: React.FC<{t: number; speed?: number}> = ({t, speed = 120}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #0b1330 0%, #18264f 45%, #24315c 60%, #0c1430 100%)'}}>
    <AbsoluteFill style={{filter: 'blur(9px)'}}>
      {Array.from({length: 46}).map((_, i) => {
        const r = (k: string) => random(`night-${i}-${k}`);
        const span = W + 400;
        const x = ((((r('x') * span - t * speed * (0.5 + r('p'))) % span) + span) % span) - 200;
        const y = 450 + r('y') * 650;
        const size = 30 + r('s') * 70;
        const warm = r('c') > 0.35;
        const c = warm ? (r('w') > 0.5 ? '255,190,110' : '255,150,80') : '120,200,255';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${c},0.95) 0%, rgba(${c},0.55) 45%, rgba(${c},0) 70%)`,
              opacity: 0.55 + r('o') * 0.45,
            }}
          />
        );
      })}
      {/* building silhouettes */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 9}).map((_, i) => {
          const span = W + 600;
          const x = ((((i * 190 - t * speed * 0.35) % span) + span) % span) - 300;
          const h = 220 + ((i * 97) % 200);
          return (
            <g key={i}>
              <rect x={x} y={1000 - h} width={150} height={h + 300} fill="#0d1634" />
              {Array.from({length: 12}).map((__, k) => (
                <rect key={k} x={x + 18 + (k % 3) * 42} y={1000 - h + 24 + Math.floor(k / 3) * 46} width={22} height={26} fill="#ffd38a" opacity={random(`win-${i}-${k}`) > 0.55 ? 0.8 : 0.08} />
              ))}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** Roof liner, rear window frame, rear seat. Drawn over the outside view. */
export const CarCabinBack: React.FC = () => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="cab-roof" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0a1027" />
          <stop offset="1" stopColor="#1a2550" />
        </linearGradient>
        <linearGradient id="cab-seat" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1d2a55" />
          <stop offset="1" stopColor="#0d1533" />
        </linearGradient>
      </defs>
      {/* everything except the rear window opening */}
      <path
        fillRule="evenodd"
        d={`M0,0 H${W} V${H} H0 Z M150,560 Q160,470 260,462 L820,462 Q920,470 930,560 L960,900 L120,900 Z`}
        fill="url(#cab-roof)"
      />
      <path d="M150,560 Q160,470 260,462 L820,462 Q920,470 930,560" stroke="#2c3b70" strokeWidth={10} fill="none" />
      {/* rear seat */}
      <path d="M60,880 Q70,820 160,815 L920,815 Q1010,820 1020,880 L1040,1400 L40,1400 Z" fill="url(#cab-seat)" />
      {[300, 540, 780].map((x) => (
        <path key={x} d={`M${x},830 L${x},1300`} stroke="#0a1028" strokeWidth={6} opacity={0.6} />
      ))}
      {/* dome light */}
      <rect x={480} y={300} width={120} height={36} rx={14} fill="#26346a" />
    </svg>
  </AbsoluteFill>
);

/** Front seat backs + headrests, to be placed behind the front passengers. */
export const CarFrontSeats: React.FC = () => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="cab-front" x1="0" x2="1">
          <stop offset="0" stopColor="#141d3e" />
          <stop offset="1" stopColor="#0a1029" />
        </linearGradient>
      </defs>
      {[260, 820].map((x) => (
        <g key={x}>
          <rect x={x - 120} y={760} width={240} height={150} rx={50} fill="url(#cab-front)" />
          <rect x={x - 26} y={900} width={14} height={60} fill="#3b456b" />
          <rect x={x + 12} y={900} width={14} height={60} fill="#3b456b" />
          <path d={`M${x - 220},1000 Q${x - 210},940 ${x - 150},935 L${x + 150},935 Q${x + 210},940 ${x + 220},1000 L${x + 240},1700 L${x - 240},1700 Z`} fill="url(#cab-front)" />
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);

/** Windshield frame, mirror, dashboard and steering wheel (foreground). */
export const CarWindshield: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="ws-dash" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#141b36" />
          <stop offset="1" stopColor="#05070f" />
        </linearGradient>
        <linearGradient id="ws-glare" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#bfe0ff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#bfe0ff" stopOpacity={0.13} />
          <stop offset="1" stopColor="#bfe0ff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* glass reflections */}
      <path d={`M${-200 + ((t * 160) % 1600)},250 l260,0 l-520,1300 l-260,0 Z`} fill="url(#ws-glare)" />
      <path d={`M${200 + ((t * 160) % 1600)},250 l90,0 l-520,1300 l-90,0 Z`} fill="url(#ws-glare)" />
      {/* frame: header, A-pillars */}
      <path d="M0,0 H1080 V250 Q540,200 0,250 Z" fill="#05070f" />
      <path d="M0,240 L120,250 L-40,1500 L-40,240 Z" fill="#070a16" />
      <path d="M1080,240 L960,250 L1120,1500 L1120,240 Z" fill="#070a16" />
      {/* mirror */}
      <rect x={530} y={205} width={20} height={70} fill="#070a16" />
      <rect x={420} y={262} width={240} height={70} rx={20} fill="#0b0f20" stroke="#20294a" strokeWidth={4} />
      <rect x={436} y={276} width={208} height={42} rx={12} fill="#1b2a52" />
      {/* dashboard */}
      <path d="M-20,1500 Q540,1400 1100,1500 L1100,1940 L-20,1940 Z" fill="url(#ws-dash)" />
      <path d="M-20,1500 Q540,1400 1100,1500" stroke="#2c3970" strokeWidth={5} fill="none" opacity={0.8} />
      {/* steering wheel (driver on screen-right) */}
      <g transform="translate(820,1450)">
        <ellipse cx={0} cy={0} rx={250} ry={190} fill="none" stroke="#090c18" strokeWidth={46} />
        <ellipse cx={0} cy={-6} rx={250} ry={190} fill="none" stroke="#28335c" strokeWidth={6} opacity={0.7} />
        <path d="M-230,10 L-60,40 L0,120 L60,40 L230,10" stroke="#090c18" strokeWidth={40} fill="none" strokeLinejoin="round" />
        <ellipse cx={0} cy={40} rx={70} ry={50} fill="#0d1124" />
      </g>
      {/* little dash lights */}
      <circle cx={180} cy={1600} r={6} fill="#5fd4ff" opacity={0.8} />
      <circle cx={210} cy={1600} r={6} fill="#ffb054" opacity={0.8} />
    </svg>
  </AbsoluteFill>
);

/** Sweeping streetlight band (warm) passing over the cabin. `t` seconds. */
export const StreetlightSweep: React.FC<{t: number; period?: number}> = ({t, period = 1.4}) => {
  const ph = (t % period) / period;
  const x = -900 + ph * 3000;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: -400,
          width: 380,
          height: 2800,
          transform: 'rotate(24deg)',
          background: 'linear-gradient(90deg, rgba(255,170,90,0) 0%, rgba(255,170,90,0.22) 50%, rgba(255,170,90,0) 100%)',
          filter: 'blur(30px)',
        }}
      />
    </AbsoluteFill>
  );
};
