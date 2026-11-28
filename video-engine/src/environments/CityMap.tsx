import React from 'react';
import {random} from 'remotion';

/**
 * Stylised top-down map of a beach neighbourhood (Copacabana-like), drawn in a
 * 1400 x 2400 unit space. Pure SVG group, so it can be used full screen or inside a tablet.
 */
export const MAP_W = 1400;
export const MAP_H = 2400;

const coast = (y: number) => 980 + Math.sin(y / 520) * 120 + y * 0.12;

export const CityMap: React.FC<{t: number; idPrefix?: string; labels?: boolean}> = ({t, idPrefix = 'map', labels = true}) => {
  const blocks: React.ReactNode[] = [];
  const BW = 150;
  const BH = 110;
  const G = 34;
  for (let gy = -2; gy < 22; gy++) {
    for (let gx = -3; gx < 9; gx++) {
      const x = gx * (BW + G) + (gy % 2) * 6;
      const y = gy * (BH + G);
      // keep blocks on the land side of the coast (in rotated space approx.)
      const cx = x + BW / 2;
      const cy = y + BH / 2;
      if (cx > coast(cy) - 150) continue;
      const r = random(`${idPrefix}-b-${gx}-${gy}`);
      const park = r > 0.94;
      blocks.push(
        <g key={`${gx}-${gy}`}>
          <rect x={x} y={y} width={BW} height={BH} rx={10} fill={park ? '#163a3a' : '#1c2c50'} />
          {!park &&
            Array.from({length: 3}).map((_, k) => (
              <rect key={k} x={x + 10 + k * 46} y={y + 10} width={38} height={BH - 20} rx={4} fill="#22365f" opacity={0.6 + random(`${idPrefix}-q-${gx}-${gy}-${k}`) * 0.4} />
            ))}
          {park && <circle cx={x + BW / 2} cy={y + BH / 2} r={32} fill="#1f4d47" />}
        </g>,
      );
    }
  }
  const coastPts = Array.from({length: 50}).map((_, i) => {
    const y = -400 + i * 70;
    return [coast(y), y] as [number, number];
  });
  const coastD = coastPts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const sea = `${coastD} L 2600,3000 L 2600,-400 Z`;
  const sand = coastPts.map((p, i) => `${i ? 'L' : 'M'}${p[0] - 70},${p[1]}`).join(' ') + ' ' + [...coastPts].reverse().map((p) => `L${p[0]},${p[1]}`).join(' ') + ' Z';
  const avenue = coastPts.map((p, i) => `${i ? 'L' : 'M'}${p[0] - 105},${p[1]}`).join(' ');
  return (
    <g>
      <rect x={-600} y={-600} width={MAP_W + 1200} height={MAP_H + 1200} fill="#0d1834" />
      {/* street grid glow */}
      <g transform="rotate(-8 700 1200)">{blocks}</g>
      <path d={sea} fill="#0b2a52" />
      {Array.from({length: 14}).map((_, i) => {
        const off = 40 + i * 55 + ((t * 20) % 55);
        return <path key={i} d={coastPts.map((p, k) => `${k ? 'L' : 'M'}${p[0] + off},${p[1]}`).join(' ')} stroke="#1d4b80" strokeWidth={3} fill="none" opacity={0.5 - i * 0.03} />;
      })}
      <path d={sand} fill="#c8a46c" opacity={0.85} />
      {/* calçadão wave strip */}
      <path d={avenue} stroke="#e9e3d6" strokeWidth={22} fill="none" opacity={0.85} />
      <path d={avenue} stroke="#2a2629" strokeWidth={22} strokeDasharray="18 18" fill="none" opacity={0.6} />
      <path d={coastPts.map((p, i) => `${i ? 'L' : 'M'}${p[0] - 150},${p[1]}`).join(' ')} stroke="#3f63a0" strokeWidth={26} fill="none" />
      {/* hill */}
      <path d="M -200,1900 Q 0,1700 220,1820 Q 380,1760 520,1980 L 600,2700 L -200,2700 Z" fill="#14333a" />
      <path d="M -200,1900 Q 0,1700 220,1820 Q 380,1760 520,1980" stroke="#1f4f55" strokeWidth={8} fill="none" />
      {/* tablet-style grid */}
      {Array.from({length: 30}).map((_, i) => (
        <line key={'v' + i} x1={-600 + i * 100} y1={-600} x2={-600 + i * 100} y2={3000} stroke="#4fb8ff" strokeWidth={1.5} opacity={0.08} />
      ))}
      {Array.from({length: 36}).map((_, i) => (
        <line key={'h' + i} x1={-600} y1={-600 + i * 100} x2={2600} y2={-600 + i * 100} stroke="#4fb8ff" strokeWidth={1.5} opacity={0.08} />
      ))}
      {labels && (
        <g fontFamily="Roboto Condensed" fontWeight={700} fill="#8fb4e6" letterSpacing={6}>
          <text x={260} y={760} fontSize={46} opacity={0.75} transform="rotate(-8 260 760)">
            COPACABANA
          </text>
          <text x={coast(1300) - 128} y={1300} fontSize={26} opacity={0.7} transform={`rotate(-82 ${coast(1300) - 128} 1300)`}>
            AV. ATLÂNTICA
          </text>
          <text x={coast(600) + 200} y={600} fontSize={34} fill="#3b6fb0" opacity={0.7}>
            OCEANO
          </text>
        </g>
      )}
    </g>
  );
};

/** Microphone marker for the map (drawn at map coords). */
export const MicMarker: React.FC<{x: number; y: number; active: number; scale?: number}> = ({x, y, active, scale = 1}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <circle r={52} fill="#5fd4ff" opacity={0.15 + active * 0.25} />
    <circle r={36} fill="#0f1d3c" stroke="#5fd4ff" strokeWidth={5} />
    <rect x={-9} y={-22} width={18} height={28} rx={9} fill="#e9f7ff" />
    <path d="M -15,0 Q -15,16 0,16 Q 15,16 15,0" stroke="#e9f7ff" strokeWidth={4} fill="none" />
    <line x1={0} y1={16} x2={0} y2={24} stroke="#e9f7ff" strokeWidth={4} />
  </g>
);

/** Red location pin; `drop` 0..1 animates the fall, `pulse` 0..1 the ring. */
export const MapPin: React.FC<{x: number; y: number; drop: number; pulse: number; scale?: number}> = ({x, y, drop, pulse, scale = 1}) => {
  if (drop <= 0) return null;
  const fall = (1 - drop) * -220;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={26 * drop} ry={10 * drop} fill="#000" opacity={0.4} />
      {pulse > 0 && <circle r={40 + pulse * 220} fill="none" stroke="#ff4a4a" strokeWidth={8 * (1 - pulse)} opacity={1 - pulse} />}
      {pulse > 0.3 && <circle r={40 + (pulse - 0.3) * 260} fill="none" stroke="#ff4a4a" strokeWidth={6 * (1 - pulse)} opacity={(1 - pulse) * 0.8} />}
      <g transform={`translate(0,${fall})`}>
        <path d="M 0,0 C -16,-30 -46,-60 -46,-96 A 46,46 0 1 1 46,-96 C 46,-60 16,-30 0,0 Z" fill="#ff3b3b" stroke="#7a0d0d" strokeWidth={4} />
        <path d="M -30,-110 A 34,34 0 0 1 10,-136" stroke="#ff9a9a" strokeWidth={8} fill="none" strokeLinecap="round" />
        <circle cx={0} cy={-96} r={17} fill="#fff" />
      </g>
    </g>
  );
};
