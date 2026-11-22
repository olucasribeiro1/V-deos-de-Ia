import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, k} from './kit';

/** Sink + faucet drawn behind the presenter (px=860). Davi's left wrist lands on the handle (~294,1158). */
export const Faucet: React.FC<{closeAt: number}> = ({closeAt}) => {
  const frame = useCurrentFrame();
  const flow = k(frame, closeAt, closeAt + 10, 1, 0);
  const rot = k(frame, closeAt - 4, closeAt + 8, 0, 90);
  const splash = [0, 1, 2, 3].map((i) => {
    const t = ((frame + i * 5) % 20) / 20;
    return <circle key={i} cx={200 + (i - 1.5) * 30 * t * 2} cy={1390 - Math.sin(t * Math.PI) * 40} r={6} fill="#bfe6ff" opacity={flow * (1 - t)} />;
  });
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {/* counter + basin */}
      <rect x={-40} y={1380} width={560} height={40} rx={10} fill="#e9eef3" />
      <path d="M60 1400 H400 Q390 1520 230 1530 Q70 1520 60 1400 Z" fill="#cfd8e2" stroke="#fff" strokeWidth={4} />
      {/* faucet body */}
      <rect x={270} y={1180} width={44} height={200} rx={10} fill="#b8c4d0" />
      <path d="M292 1200 Q292 1150 240 1150 H190 V1190" stroke="#b8c4d0" strokeWidth={36} fill="none" strokeLinecap="round" />
      {/* water stream */}
      <rect x={200 - 9 * flow} y={1196} width={18 * flow} height={196} rx={8} fill={C.water} opacity={0.85} />
      <rect x={200 - 3 * flow} y={1196} width={4 * flow} height={196} fill="#fff" opacity={0.6} />
      {splash}
      {/* handle */}
      <g transform={`translate(292,1168) rotate(${rot})`}>
        <rect x={-46} y={-9} width={92} height={18} rx={9} fill="#e0e7ee" stroke="#7a8794" strokeWidth={3} />
        <circle r={14} fill="#7a8794" />
      </g>
    </svg>
  );
};
