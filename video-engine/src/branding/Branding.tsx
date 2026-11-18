import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {PuppetSvg} from '../characters/Puppet';
import {DAVI_OUTFIT} from '../characters/Davi';
import {Globe} from '../environments/Globe';
import {CAPTION_FONT, HUD_FONT} from '../lib/fonts';

/** Electric-blue jump tear (static version of fx/Rastro for stills). */
const Tear: React.FC<{x: number; top: number; h: number; w: number; seed: string}> = ({x, top, h, w, seed}) => {
  const N = 26;
  const core = Array.from({length: N + 1}).map((_, i) => {
    const env = Math.sin((i / N) * Math.PI);
    return [x + (random(`${seed}-${i}`) - 0.5) * w * 0.9 * env, top + (h * i) / N] as [number, number];
  });
  const L = core.map(([px, py], i) => `${px - w * 0.5 * Math.sin((i / N) * Math.PI)},${py}`);
  const R = core.map(([px, py], i) => `${px + w * 0.5 * Math.sin((i / N) * Math.PI)},${py}`).reverse();
  const arcs = Array.from({length: 9}).map((_, k) => {
    const i0 = 3 + Math.floor(random(`${seed}-a${k}`) * (N - 6));
    const [sx, sy] = core[i0];
    const dir = random(`${seed}-d${k}`) > 0.5 ? 1 : -1;
    const len = w * (1.2 + random(`${seed}-l${k}`) * 2.2);
    const pts = Array.from({length: 5}).map((__, j) => `${sx + dir * (len * j) / 4},${sy + (random(`${seed}-${k}-${j}`) - 0.5) * w * 0.8}`);
    return <polyline key={k} points={pts.join(' ')} fill="none" stroke="#bfe9ff" strokeWidth={w * 0.05} strokeLinecap="round" opacity={0.85} />;
  });
  return (
    <g>
      <ellipse cx={x} cy={top + h / 2} rx={w * 2.6} ry={h * 0.62} fill="url(#tearGlow)" />
      <path d={`M${[...L, ...R].join(' L')} Z`} fill="#4fb6ff" opacity={0.9} filter="url(#soft)" />
      <path d={`M${[...L, ...R].join(' L')} Z`} fill="#9fdcff" transform={`translate(${x} ${top + h / 2}) scale(0.45 1) translate(${-x} ${-top - h / 2})`} />
      <polyline points={core.map((p) => p.join(',')).join(' ')} fill="none" stroke="#ffffff" strokeWidth={w * 0.09} strokeLinejoin="round" />
      {arcs}
    </g>
  );
};

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="tearGlow">
      <stop offset="0" stopColor="#6cc8ff" stopOpacity={0.55} />
      <stop offset="1" stopColor="#6cc8ff" stopOpacity={0} />
    </radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3b3f7a" />
      <stop offset="0.45" stopColor="#c46a6a" />
      <stop offset="0.8" stopColor="#f2a65a" />
      <stop offset="1" stopColor="#ffd39a" />
    </linearGradient>
  </defs>
);

/** Rio "calçadão" wave stripes in a band. */
const Waves: React.FC<{x0: number; x1: number; y0: number; y1: number; rows: number; amp: number; period: number}> = ({x0, x1, y0, y1, rows, amp, period}) => {
  const step = (y1 - y0) / rows;
  const band = (y: number) => {
    const pts: string[] = [];
    for (let x = x0; x <= x1; x += 12) pts.push(`${x},${y + Math.sin((x / period) * Math.PI * 2) * amp}`);
    return pts;
  };
  return (
    <g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#efe6d6" />
      {Array.from({length: rows}).map((_, i) =>
        i % 2 === 0 ? null : (
          <path key={i} d={`M${band(y0 + i * step).join(' L')} L${band(y0 + (i + 1) * step).reverse().join(' L')} Z`} fill="#1d1a1f" />
        ),
      )}
    </g>
  );
};

const Dust: React.FC<{w: number; h: number; n: number; seed: string}> = ({w, h, n, seed}) => (
  <g>
    {Array.from({length: n}).map((_, i) => (
      <circle key={i} cx={random(`${seed}x${i}`) * w} cy={random(`${seed}y${i}`) * h} r={2 + random(`${seed}r${i}`) * 9} fill="#fff4dc" opacity={0.08 + random(`${seed}o${i}`) * 0.25} />
    ))}
  </g>
);

const titleStyle = (size: number): React.CSSProperties => ({
  fontFamily: CAPTION_FONT,
  fontWeight: 700,
  fontSize: size,
  color: '#fff',
  lineHeight: 0.95,
  letterSpacing: 2,
  textTransform: 'uppercase',
  textShadow: '0 0 4px rgba(0,0,0,0.9), 0 6px 0 rgba(0,0,0,0.45), 0 12px 40px rgba(0,0,0,0.55)',
  WebkitTextStroke: '2px rgba(10,8,12,0.55)',
  paintOrder: 'stroke fill',
});

/** 800x800 YouTube profile picture (shown as a circle). */
export const ChannelAvatar: React.FC = () => (
  <AbsoluteFill style={{background: '#13173a'}}>
    <svg width={800} height={800} style={{position: 'absolute'}}>
      <Defs />
      <radialGradient id="avBg" cx="0.5" cy="0.62" r="0.7">
        <stop offset="0" stopColor="#ffd39a" />
        <stop offset="0.35" stopColor="#f2a65a" />
        <stop offset="0.7" stopColor="#8a4f7a" />
        <stop offset="1" stopColor="#1b1f4a" />
      </radialGradient>
      <rect width={800} height={800} fill="url(#avBg)" />
      <Waves x0={0} x1={800} y0={640} y1={800} rows={9} amp={10} period={140} />
      <Dust w={800} h={800} n={40} seed="av" />
      <Tear x={660} top={90} h={620} w={70} seed="avt" />
    </svg>
    <PuppetSvg
      outfit={DAVI_OUTFIT}
      height={2000}
      upperOnly
      pose={{headTilt: -4, facing: 0.15}}
      expr={{halfSmile: 0.9, smile: 0.25, browRaise: 0.3, browAsym: 0.6, lookX: 0.2}}
      style={{left: 400 - 350 * 2.0, top: 390 - 230 * 2.0}}
    />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 120px rgba(0,0,0,0.45)'}} />
  </AbsoluteFill>
);

/** 2560x1440 YouTube banner. Safe area for all devices: centre 1546x423 (x 507–2053, y 508–931). */
export const ChannelBanner: React.FC = () => {
  const W = 2560;
  const H = 1440;
  const k = 0.5; // puppet scale
  return (
    <AbsoluteFill style={{background: '#1b1f4a'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Defs />
        <rect width={W} height={H} fill="url(#sky)" />
        <circle cx={1280} cy={880} r={150} fill="#fff1c9" opacity={0.95} />
        <circle cx={1280} cy={880} r={300} fill="#ffe2a8" opacity={0.25} />
        {/* hills */}
        <path d="M0 860 Q 250 640 480 820 Q 620 700 760 860 Z" fill="#6a4a6e" opacity={0.75} />
        <path d="M1800 860 Q 1960 560 2140 760 Q 2260 650 2400 820 L2560 860 Z" fill="#6a4a6e" opacity={0.75} />
        {/* sea */}
        <rect x={0} y={860} width={W} height={120} fill="#3d6d93" />
        {Array.from({length: 18}).map((_, i) => (
          <rect key={i} x={1120 + random(`g${i}`) * 320} y={870 + i * 6} width={40 + random(`gw${i}`) * 120} height={3} fill="#ffe8b8" opacity={0.6} />
        ))}
        <rect x={0} y={980} width={W} height={40} fill="#e8c99a" />
        <Waves x0={0} x1={W} y0={1020} y1={H} rows={14} amp={16} period={260} />
        <Dust w={W} h={H} n={90} seed="bn" />
        {/* jump tear where Davi was a moment ago */}
        <Tear x={820} top={520} h={430} w={56} seed="bnt" />
        {/* globe glow */}
        <circle cx={1880} cy={720} r={240} fill="#6cc8ff" opacity={0.12} />
      </svg>
      <Globe cx={1880} cy={720} radius={190} rotation={-20} tilt={-12} clouds t={2} night={0.45} grid={0.3}
        pins={[{lat: -22.9, lon: -43.2, label: 'RIO', color: '#ff4d4d'}]} />
      {/* ghost Davi (where he was) + Davi */}
      <PuppetSvg outfit={DAVI_OUTFIT} height={430 * 1.0} ghost={{opacity: 0.55, color: '#9fdcff', dash: 14}}
        style={{left: 820 - 350 * 0.43, top: 960 - 1100 * 0.43}} />
      <PuppetSvg outfit={DAVI_OUTFIT} height={430} pose={{facing: 0.2, shR: 160, elR: -30, headTilt: -3}}
        expr={{halfSmile: 0.9, smile: 0.3, browAsym: 0.5}}
        style={{left: 620 - 350 * 0.43, top: 960 - 1100 * 0.43}} />
      <div style={{position: 'absolute', left: 830, top: 545, width: 900, textAlign: 'center'}}>
        <div style={{...titleStyle(220), whiteSpace: 'nowrap'}}>O SALTO</div>
        <div style={{...titleStyle(56), fontWeight: 500, marginTop: 10, letterSpacing: 1, whiteSpace: 'nowrap'}}>E se tu pudesse se teletransportar?</div>
        <div style={{marginTop: 22, display: 'inline-block', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: '#bfe9ff',
          padding: '8px 22px', border: '2px solid rgba(191,233,255,0.7)', borderRadius: 6, background: 'rgba(10,20,50,0.35)'}}>
          NOVO EPISÓDIO TODA SEMANA
        </div>
      </div>
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,0,0,0.45)'}} />
    </AbsoluteFill>
  );
};
