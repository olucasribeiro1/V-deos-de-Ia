import React from 'react';
import {PlacedDavi, Davi} from '../characters/Davi';
import {HUD_FONT} from '../lib/fonts';

/**
 * The NorteSul badge, drawn INSIDE the puppet (torso coordinates): centered on the chest,
 * it follows every pose, scale, camera move and shot automatically. Text: "NorteSul" (exact spelling).
 */
export const NorteSulBadge: React.FC = () => (
  <g transform="translate(0,-648)">
    <rect x={-82} y={-26} width={164} height={52} rx={12} fill="#ffffff" stroke="#0b4f8a" strokeWidth={4} />
    <path d="M -62,-12 C -62,-12 -72,2 -72,8 A 10,10 0 0 0 -52,8 C -52,2 -62,-12 -62,-12 Z" fill="#1e88e5" />
    <text x={12} y={9} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={28} fill="#0b4f8a">
      NorteSul
    </text>
  </g>
);

type PlacedProps = React.ComponentProps<typeof PlacedDavi>;
/** USE THIS for EVERY appearance of Davi in the NorteSul video (never plain PlacedDavi/Davi): same API + the fixed badge. */
export const PlacedDaviNS: React.FC<PlacedProps> = (props) => <PlacedDavi {...props} chestBadge={<NorteSulBadge />} />;
export const DaviNS: React.FC<React.ComponentProps<typeof Davi>> = (props) => <Davi {...props} chestBadge={<NorteSulBadge />} />;
