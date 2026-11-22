import React from 'react';
import {PlacedDavi, Davi} from '../characters/Davi';
import {HUD_FONT} from '../lib/fonts';

/**
 * The NorteSul badge, drawn INSIDE the puppet (torso coordinates): small ID badge clipped on the upper-right of the chest (viewer's right),
 * it follows every pose, scale, camera move and shot automatically. Text: "NorteSul" (exact spelling).
 */
export const NorteSulBadge: React.FC = () => (
  <g transform="translate(80,-702) rotate(-4) scale(0.5)">
    {/* clip */}
    <rect x={-14} y={-40} width={28} height={16} rx={4} fill="#9aa6b2" stroke="#5c6670" strokeWidth={3} />
    <rect x={-82} y={-26} width={164} height={56} rx={10} fill="#ffffff" stroke="#0b4f8a" strokeWidth={5} />
    <rect x={-82} y={-26} width={164} height={14} rx={6} fill="#0b4f8a" />
    <path d="M -62,-2 C -62,-2 -72,12 -72,18 A 10,10 0 0 0 -52,18 C -52,12 -62,-2 -62,-2 Z" fill="#1e88e5" />
    <text x={12} y={21} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={28} fill="#0b4f8a">
      NorteSul
    </text>
  </g>
);

type PlacedProps = React.ComponentProps<typeof PlacedDavi>;
/** USE THIS for EVERY appearance of Davi in the NorteSul video (never plain PlacedDavi/Davi): same API + the fixed badge. */
export const PlacedDaviNS: React.FC<PlacedProps> = (props) => <PlacedDavi {...props} chestBadge={<NorteSulBadge />} />;
export const DaviNS: React.FC<React.ComponentProps<typeof Davi>> = (props) => <Davi {...props} chestBadge={<NorteSulBadge />} />;
