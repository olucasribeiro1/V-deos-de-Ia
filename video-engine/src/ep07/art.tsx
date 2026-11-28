import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../lib/constants';
import {CAPTION_FONT, HUD_FONT} from '../lib/fonts';
import {clamp, easeOut, lerp} from '../lib/anim';
import type {Pose} from '../characters/types';

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/* ================================================================== element palette */
export const EL = {
  fogo: '#ff4a2a',
  agua: '#2f9bff',
  terra: '#9a6a3a',
  vento: '#f4f7ff',
  raio: '#ffd23a',
  dourada: '#ffb800',
};

/* ================================================================== face marks (puppet local units) */
/**
 * Lines painted on both cheeks. Child of a PlacedPuppet / PlacedWide (puppet units). Follows bob / lean / headTilt / facing.
 * n = 1..3 lines, color = element. `glow` adds a soft halo.
 */
export const FaceMark: React.FC<{n: number; color: string; pose?: Pose; glow?: number; k?: number}> = ({n, color, pose = {}, glow = 0.6, k = 1}) => {
  if (k <= 0 || n <= 0) return null;
  const fx = (pose.facing ?? 0) * 30;
  const lines = Array.from({length: n});
  const cheek = (side: -1 | 1) =>
    lines.map((_, i) => {
      const x0 = fx + side * 50;
      const y = 34 + i * 17;
      return <line key={`${side}${i}`} x1={x0} y1={y} x2={x0 + side * 36 * k} y2={y - 6} stroke={color} strokeWidth={9} strokeLinecap="round" />;
    });
  return (
    <g transform={`translate(0,${pose.bob ?? 0}) rotate(${pose.lean ?? 0} 0 -480) rotate(${pose.headTilt ?? 0} 0 -772) translate(0,-884)`}>
      {glow > 0 && <g opacity={0.45 * glow} style={{filter: 'blur(6px)'}}>{cheek(-1)}{cheek(1)}</g>}
      {cheek(-1)}
      {cheek(1)}
    </g>
  );
};

/** Elf ears (puppet units). */
export const ElfEars: React.FC<{pose?: Pose; skin: string}> = ({pose = {}, skin}) => (
  <g transform={`translate(0,${pose.bob ?? 0}) rotate(${pose.lean ?? 0} 0 -480) rotate(${pose.headTilt ?? 0} 0 -772) translate(0,-884)`}>
    <path d="M -112,-10 L -190,-70 L -118,26 Z" fill={skin} stroke="rgba(0,0,0,0.25)" strokeWidth={4} />
    <path d="M 112,-10 L 190,-70 L 118,26 Z" fill={skin} stroke="rgba(0,0,0,0.25)" strokeWidth={4} />
  </g>
);

/** Crown / wizard hat (puppet units). */
export const Crown: React.FC<{pose?: Pose; kind?: 'crown' | 'wizard'; color?: string}> = ({pose = {}, kind = 'crown', color = '#ffcf3a'}) => (
  <g transform={`translate(0,${pose.bob ?? 0}) rotate(${pose.lean ?? 0} 0 -480) rotate(${pose.headTilt ?? 0} 0 -772) translate(0,-884)`}>
    {kind === 'crown' ? (
      <g>
        <path d="M -95,-100 L -95,-180 L -55,-130 L 0,-200 L 55,-130 L 95,-180 L 95,-100 Z" fill={color} stroke="#a8781a" strokeWidth={7} strokeLinejoin="round" />
        <circle cx={0} cy={-140} r={14} fill="#e03a5a" />
      </g>
    ) : (
      <g>
        <path d="M -150,-80 Q 0,-120 150,-80 L 60,-110 Q 30,-260 -40,-330 Q -10,-200 -60,-110 Z" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={6} />
        <ellipse cx={0} cy={-88} rx={160} ry={24} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={6} />
      </g>
    )}
  </g>
);

/* ================================================================== the cat */
/** Orange tabby sitting. Feet at (x,y), ~240·s px tall. */
export const Cat: React.FC<{x: number; y: number; s?: number; t: number; blink?: number; look?: number; glow?: number; lick?: number; smile?: number; flip?: boolean}> = ({x, y, s = 1, t, blink = 0, look = 0, glow = 0, lick = 0, smile = 0, flip}) => {
  const tail = Math.sin(t * 2.4) * 18;
  const eyeH = 13 * (1 - blink) + 1.5;
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * s},${s})`}>
      <ellipse cx={0} cy={0} rx={95} ry={14} fill="#000" opacity={0.22} />
      <path d={`M 50,-20 C 130,-20 150,-90 ${120 + tail},-150`} fill="none" stroke="#e8882a" strokeWidth={22} strokeLinecap="round" />
      <path d={`M 50,-20 C 130,-20 150,-90 ${120 + tail},-150`} fill="none" stroke="#b85a14" strokeWidth={22} strokeLinecap="round" strokeDasharray="10 26" />
      <path d="M -70,0 C -80,-80 -50,-150 0,-150 C 50,-150 80,-80 70,0 Z" fill="#f09a3a" />
      <path d="M -30,0 C -36,-50 -20,-100 0,-100 C 20,-100 36,-50 30,0 Z" fill="#ffe2b8" />
      {[-110, -80, -50].map((yy, i) => (
        <path key={i} d={`M -66,${yy} q 18,6 26,-4 M 66,${yy} q -18,6 -26,-4`} stroke="#b85a14" strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
      <ellipse cx={-34} cy={-6} rx={24} ry={12} fill="#f8b260" />
      <g transform={`rotate(${-lick * 60} 30 -10)`}>
        <ellipse cx={34} cy={-6} rx={24} ry={12} fill="#f8b260" />
      </g>
      <g transform="translate(0,-185)">
        <path d="M -62,-30 L -70,-92 L -22,-55 Z" fill="#f09a3a" />
        <path d="M 62,-30 L 70,-92 L 22,-55 Z" fill="#f09a3a" />
        <path d="M -56,-38 L -60,-76 L -32,-54 Z" fill="#ff9fb0" />
        <path d="M 56,-38 L 60,-76 L 32,-54 Z" fill="#ff9fb0" />
        <ellipse cx={0} cy={0} rx={76} ry={64} fill="#f09a3a" />
        <path d="M -20,-60 l 8,22 M 0,-64 l 0,24 M 20,-60 l -8,22" stroke="#b85a14" strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={0} cy={26} rx={44} ry={28} fill="#ffe2b8" />
        {[-1, 1].map((sd) => (
          <g key={sd}>
            {glow > 0 && <ellipse cx={sd * 28 + look * 6} cy={-4} rx={26} ry={22} fill="#c8ff5a" opacity={0.5 * glow} style={{filter: 'blur(8px)'}} />}
            <ellipse cx={sd * 28} cy={-4} rx={15} ry={eyeH} fill={glow > 0.5 ? '#d8ff6a' : '#9be04a'} />
            <ellipse cx={sd * 28 + look * 5} cy={-4} rx={4.5} ry={Math.max(1, eyeH - 3)} fill="#111" />
          </g>
        ))}
        <path d="M -8,18 L 8,18 L 0,27 Z" fill="#e0607a" />
        <path d={`M 0,27 q -10,${10 + smile * 6} -20,${2 + smile * 4} M 0,27 q 10,${10 + smile * 6} 20,${2 + smile * 4}`} stroke="#5a2a10" strokeWidth={4} fill="none" strokeLinecap="round" />
        {[-1, 1].map((sd) => (
          <g key={sd} stroke="#fff" strokeWidth={3} opacity={0.8}>
            <line x1={sd * 30} y1={22} x2={sd * 92} y2={12} />
            <line x1={sd * 30} y1={30} x2={sd * 92} y2={34} />
          </g>
        ))}
      </g>
    </g>
  );
};

/* ================================================================== city avenue (night) */
export const Avenue: React.FC<{px?: number; horizon?: number; t?: number; glow?: number}> = ({px = 0, horizon = 900, t = 0, glow = 0}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#141a3a 0%, #2a2350 45%, #4a2f52 60%)'}}>
    <Svg>
      <g transform={`translate(${px * 0.3},0)`}>
        {Array.from({length: 14}).map((_, i) => {
          const r = (k: string) => random(`bld${i}${k}`);
          const w = 110 + r('w') * 120;
          const h = 250 + r('h') * 420;
          const x = -200 + i * 110;
          return (
            <g key={i}>
              <rect x={x} y={horizon - h} width={w} height={h} fill={i % 2 ? '#1d1f3c' : '#24264a'} />
              {Array.from({length: Math.floor(h / 60)}).map((_, j) =>
                Array.from({length: 3}).map((__, c) =>
                  random(`win${i}${j}${c}`) > 0.55 ? <rect key={`${j}${c}`} x={x + 16 + c * (w / 3.2)} y={horizon - h + 24 + j * 60} width={18} height={26} fill="#ffd98a" opacity={0.7} /> : null,
                ),
              )}
            </g>
          );
        })}
      </g>
      <rect x={0} y={horizon} width={W} height={H - horizon} fill="#2c2c36" />
      <path d={`M 540,${horizon} L -400,${H} L 1480,${H} Z`} fill="#383844" />
      {Array.from({length: 7}).map((_, i) => {
        const u = ((i / 7 + t * 0.6) % 1) ** 2;
        const y = lerp(horizon, H, u);
        const w = lerp(4, 46, u);
        return <rect key={i} x={540 - w / 2} y={y} width={w} height={lerp(10, 140, u)} fill="#f2e6a0" opacity={0.8} />;
      })}
      {Array.from({length: 8}).map((_, i) => (
        <path key={i} d={`M ${300 + i * 70},${horizon + 380} L ${250 + i * 90},${horizon + 520} L ${290 + i * 90},${horizon + 520} L ${330 + i * 70},${horizon + 380} Z`} fill="#e9e9ef" opacity={0.75} />
      ))}
      <rect x={0} y={horizon + 560} width={W} height={60} fill="#5a5a66" />
      {glow > 0 && <rect x={0} y={0} width={W} height={H} fill="#fff6c8" opacity={0.6 * glow} />}
    </Svg>
  </AbsoluteFill>
);

/** Truck front view, centred at (x, y = bumper bottom). */
export const Truck: React.FC<{x: number; y: number; s?: number; lights?: number}> = ({x, y, s = 1, lights = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-300} y={-620} width={600} height={560} rx={40} fill="#c8362e" />
    <rect x={-260} y={-580} width={520} height={220} rx={24} fill="#2a3a5a" />
    <path d="M -240,-560 L -120,-560 L -220,-380 L -250,-380 Z" fill="#fff" opacity={0.2} />
    <rect x={-200} y={-330} width={400} height={180} rx={14} fill="#8a8f98" />
    {Array.from({length: 6}).map((_, i) => (
      <rect key={i} x={-185} y={-320 + i * 28} width={370} height={14} rx={6} fill="#5a5e66" />
    ))}
    <rect x={-320} y={-130} width={640} height={80} rx={20} fill="#3a3c44" />
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <circle cx={sd * 245} cy={-240} r={150 * lights} fill="#fff6c8" opacity={0.35} style={{filter: 'blur(30px)'}} />
        <circle cx={sd * 245} cy={-240} r={44} fill="#fffbe0" />
        <rect x={sd * 245 - 30} y={-60} width={60} height={70} rx={10} fill="#141414" />
      </g>
    ))}
  </g>
);

/* ================================================================== fantasy world */
export const FantasySky: React.FC<{px?: number; t?: number; horizon?: number; noHills?: boolean; dusk?: number}> = ({px = 0, t = 0, horizon = 1250, noHills, dusk = 0}) => (
  <AbsoluteFill style={{background: `linear-gradient(${dusk ? '#3a2a6a' : '#3a8ae8'} 0%, ${dusk ? '#c86a6a' : '#8fd0ff'} 55%, ${dusk ? '#f0b07a' : '#d8f2ff'} 70%)`}}>
    <Svg>
      <g transform={`translate(${px * 0.1},0)`}>
        <circle cx={780} cy={330} r={120} fill="#f4f2ff" opacity={0.95} />
        <circle cx={740} cy={300} r={26} fill="#dcd8f0" />
        <circle cx={820} cy={370} r={18} fill="#dcd8f0" />
        <circle cx={330} cy={210} r={56} fill="#ffd0e0" opacity={0.9} />
        <circle cx={316} cy={200} r={10} fill="#f0b0c8" />
      </g>
      <g transform={`translate(${px * 0.25 + ((t * 12) % 400)},0)`} fill="#fff" opacity={0.85}>
        {[[-200, 560], [200, 650], [600, 520], [-500, 700]].map(([cx, cy], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={150} ry={42} />
            <ellipse cx={cx + 60} cy={cy - 30} rx={80} ry={44} />
          </g>
        ))}
      </g>
      {!noHills && (
        <>
          <g transform={`translate(${px * 0.4},0)`}>
            <path d={`M -400,${horizon} Q -100,${horizon - 260} 200,${horizon - 60} Q 500,${horizon - 330} 900,${horizon - 80} Q 1200,${horizon - 230} 1500,${horizon} Z`} fill="#6aa8c8" opacity={0.7} />
            <g transform={`translate(640,${horizon - 230})`} fill="#5a8aa8">
              <rect x={-60} y={-60} width={120} height={120} />
              <rect x={-90} y={-130} width={40} height={190} />
              <rect x={50} y={-130} width={40} height={190} />
              <rect x={-20} y={-180} width={40} height={140} />
              <path d="M -100,-130 L -70,-180 L -40,-130 Z M 40,-130 L 70,-180 L 100,-130 Z M -30,-180 L 0,-240 L 30,-180 Z" />
            </g>
          </g>
          <g transform={`translate(${px * 0.7},0)`}>
            <path d={`M -400,${horizon + 40} Q 0,${horizon - 160} 500,${horizon + 20} Q 900,${horizon - 140} 1500,${horizon + 60} L 1500,${H} L -400,${H} Z`} fill="#5cbf5a" />
          </g>
          <rect x={0} y={horizon + 60} width={W} height={H} fill="#4caa4a" />
          <g transform={`translate(${px},0)`}>
            {Array.from({length: 26}).map((_, i) => {
              const x = -300 + i * 70 + random(`gr${i}`) * 40;
              const y = horizon + 160 + random(`gy${i}`) * 600;
              return <path key={i} d={`M ${x},${y} l 10,-36 l 8,30 l 10,-40 l 8,46 Z`} fill="#3a9a3a" />;
            })}
            {Array.from({length: 10}).map((_, i) => (
              <circle key={i} cx={-200 + i * 160 + random(`fl${i}`) * 60} cy={horizon + 220 + random(`fly${i}`) * 520} r={9} fill={['#ffd23a', '#ff8ab0', '#ffffff'][i % 3]} />
            ))}
          </g>
        </>
      )}
    </Svg>
  </AbsoluteFill>
);

/** Dragon in flight, side view, facing right. (x,y) = body centre. */
export const Dragon: React.FC<{x: number; y: number; s?: number; flap: number; color?: string; belly?: string; flip?: boolean; shadow?: boolean}> = ({x, y, s = 1, flap, color = '#2a6a5a', belly = '#e8c87a', flip, shadow}) => {
  const a = Math.sin(flap) * 38;
  const b = Math.sin(flap - 0.6) * 30;
  const body = shadow ? '#000' : color;
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * s},${s})`} opacity={shadow ? 0.35 : 1} style={shadow ? {filter: 'blur(14px)'} : undefined}>
      <g transform={`rotate(${-a} -40 -30)`}>
        <path d="M -40,-30 L -260,-420 L -320,-360 L -420,-380 L -400,-280 L -500,-260 L -440,-170 L -480,-80 L -40,10 Z" fill={shadow ? '#000' : '#1e4e44'} />
      </g>
      <path d="M -180,0 C -380,10 -520,90 -700,40 C -560,120 -380,110 -180,60 Z" fill={body} />
      <path d="M -700,40 L -760,0 L -740,60 Z" fill={body} />
      <ellipse cx={0} cy={20} rx={240} ry={95} fill={body} />
      {!shadow && <ellipse cx={10} cy={70} rx={190} ry={40} fill={belly} />}
      <path d="M 170,-20 C 260,-80 300,-160 360,-170 L 420,-110 C 340,-90 300,-20 230,40 Z" fill={body} />
      <g transform="translate(400,-150)">
        <path d="M -30,-40 L 150,-10 L 160,30 L -20,50 Z" fill={body} />
        <path d="M -10,-40 L -60,-110 L 20,-48 Z M 30,-36 L 0,-120 L 60,-40 Z" fill={shadow ? '#000' : '#c8e0d0'} />
        {!shadow && <circle cx={50} cy={-6} r={11} fill="#ffd23a" />}
        {!shadow && <circle cx={53} cy={-6} r={4} fill="#111" />}
        {!shadow && <path d="M 150,20 L 70,30" stroke="#111" strokeWidth={5} />}
      </g>
      {[-120, 60].map((lx, i) => (
        <path key={i} d={`M ${lx},90 l -20,90 l 40,10`} stroke={body} strokeWidth={36} fill="none" strokeLinecap="round" />
      ))}
      <g transform={`rotate(${-b} 40 -20)`}>
        <path d="M 40,-20 L 120,-480 L 200,-400 L 300,-430 L 300,-320 L 400,-290 L 320,-200 L 340,-100 L 40,30 Z" fill={body} />
        {!shadow && <path d="M 40,-20 L 120,-480 M 40,-20 L 300,-430 M 40,-20 L 400,-290 M 40,-20 L 340,-100" stroke="#123a32" strokeWidth={8} />}
      </g>
      {!shadow && Array.from({length: 6}).map((_, i) => <path key={i} d={`M ${-160 + i * 60},-70 l 20,-40 l 20,40 Z`} fill="#123a32" />)}
    </g>
  );
};

/** Green slime blob (squash k). */
export const Slime: React.FC<{x: number; y: number; s?: number; squash?: number; hurt?: number}> = ({x, y, s = 1, squash = 0, hurt = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s * (1 + squash * 0.4)},${s * (1 - squash * 0.45)})`}>
    <path d="M -110,0 C -120,-90 -60,-150 0,-150 C 60,-150 120,-90 110,0 Z" fill="#6ee06a" stroke="#2a9a3a" strokeWidth={8} />
    <ellipse cx={-40} cy={-110} rx={22} ry={12} fill="#fff" opacity={0.6} />
    {hurt > 0.5 ? (
      <g stroke="#123" strokeWidth={8} strokeLinecap="round">
        <path d="M -48,-80 l 24,20 M -48,-60 l 24,-20 M 24,-80 l 24,20 M 24,-60 l 24,-20" />
      </g>
    ) : (
      <g fill="#123">
        <circle cx={-36} cy={-70} r={12} />
        <circle cx={36} cy={-70} r={12} />
      </g>
    )}
  </g>
);

/* ================================================================== game status window (HTML) */
export type StatRow = {label: string; value: string; bar: number; color?: string; lock?: boolean; k: number};
export const StatusWindow: React.FC<{x?: number; y?: number; w?: number; k: number; title?: string; rows: StatRow[]; level?: string; shake?: number; frame: number; extra?: React.ReactNode}> = ({x = 540, y = 900, w = 820, k, title = 'STATUS', rows, level, shake = 0, frame, extra}) => {
  if (k <= 0) return null;
  const sx = shake > 0 ? Math.sin(frame * 2.3) * 10 * shake : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) translateX(${sx}px) scale(${lerp(0.4, 1, easeOut(clamp(k)))}, ${lerp(0.05, 1, easeOut(clamp(k * 1.3)))})`, opacity: clamp(k * 2), background: 'linear-gradient(rgba(20,60,140,0.88), rgba(10,26,70,0.92))', border: '4px solid #7fd8ff', borderRadius: 26, boxShadow: '0 0 40px rgba(90,200,255,0.7), inset 0 0 30px rgba(90,200,255,0.35)', padding: '26px 40px 30px', color: '#fff', fontFamily: HUD_FONT}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '3px solid rgba(127,216,255,0.6)', paddingBottom: 10, marginBottom: 14}}>
        <span style={{fontWeight: 700, fontSize: 46, letterSpacing: 8, color: '#9fe6ff'}}>◆ {title}</span>
        {level && <span style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 52}}>{level}</span>}
      </div>
      {rows.map((r, i) =>
        r.k <= 0 ? null : (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, margin: '10px 0', opacity: clamp(r.k * 2), transform: `translateX(${(1 - clamp(r.k)) * -40}px)`}}>
            <span style={{width: 290, fontWeight: 700, fontSize: 38, letterSpacing: 3}}>{r.label}</span>
            <div style={{flex: 1, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.15)', overflow: 'hidden'}}>
              <div style={{width: `${Math.max(1.5, r.bar * 100)}%`, height: '100%', background: r.color ?? '#5ae0ff'}} />
            </div>
            <span style={{width: 110, textAlign: 'right', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 52, color: r.lock ? '#ff5a5a' : '#fff'}}>{r.value}</span>
            {r.lock !== undefined && <span style={{fontSize: 44, width: 50}}>{r.lock ? '🔒' : ''}</span>}
          </div>
        ),
      )}
      {extra}
    </div>
  );
};

/* ================================================================== map of Aldoria */
export const AldoriaMap: React.FC<{t: number; k: {n: number; m: number; c: number; s: number}; frame: number}> = ({t, k, frame}) => {
  const lab = (x: number, y: number, txt: string, kk: number, col = '#3a2410') =>
    kk > 0 ? (
      <text x={x} y={y} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={54} fill={col} opacity={clamp(kk * 2)} transform={`translate(${x},${y}) scale(${lerp(0.6, 1, easeOut(clamp(kk)))}) translate(${-x},${-y})`}>
        {txt}
      </text>
    ) : null;
  return (
    <AbsoluteFill style={{background: '#2a1a10'}}>
      <Svg>
        <rect x={60} y={260} width={960} height={1420} rx={30} fill="#efd9a8" stroke="#8a5a2a" strokeWidth={14} />
        <rect x={80} y={280} width={920} height={1380} rx={20} fill="none" stroke="#c8a46a" strokeWidth={4} strokeDasharray="20 10" />
        <path d="M 160,420 C 300,330 760,330 900,430 C 980,700 960,1000 900,1200 C 860,1450 700,1580 540,1600 C 360,1580 200,1450 170,1200 C 110,950 100,640 160,420 Z" fill="#e2c88a" stroke="#8a5a2a" strokeWidth={6} />
        {/* north forest */}
        <g opacity={0.35 + 0.65 * clamp(k.n * 2)}>
          {Array.from({length: 14}).map((_, i) => (
            <path key={i} d={`M ${230 + (i % 7) * 90},${470 + Math.floor(i / 7) * 80} l 34,-80 l 34,80 Z`} fill="#3a8a3a" stroke="#1e5a1e" strokeWidth={4} />
          ))}
        </g>
        {/* mountains east */}
        <g opacity={0.35 + 0.65 * clamp(k.m * 2)}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${640 + i * 70},${860 + (i % 2) * 60} l 70,-170 l 70,170 Z`} fill="#8a8a96" stroke="#4a4a56" strokeWidth={5} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${685 + i * 70},${750 + (i % 2) * 60} l 25,-60 l 25,60 Z`} fill="#fff" />
          ))}
        </g>
        {/* centre castle */}
        <g opacity={0.35 + 0.65 * clamp(k.c * 2)} transform="translate(420,1000)">
          <rect x={-70} y={-60} width={140} height={110} fill="#c8c0b0" stroke="#5a4a3a" strokeWidth={5} />
          <rect x={-100} y={-120} width={44} height={170} fill="#d8d0c0" stroke="#5a4a3a" strokeWidth={5} />
          <rect x={56} y={-120} width={44} height={170} fill="#d8d0c0" stroke="#5a4a3a" strokeWidth={5} />
          <path d="M -108,-120 L -78,-175 L -48,-120 Z M 48,-120 L 78,-175 L 108,-120 Z" fill="#3a5ad8" />
          <path d="M 78,-175 l 0,-40 l 34,14 l -34,14" fill="#ffd23a" />
        </g>
        {/* south */}
        <g opacity={0.35 + 0.65 * clamp(k.s * 2)}>
          <path d="M 220,1300 C 400,1250 700,1250 860,1300 C 800,1500 680,1580 540,1590 C 400,1580 280,1500 220,1300 Z" fill="#5a1a1a" opacity={0.85} />
          {k.s > 0 &&
            [-1, 1].map((sd) => <ellipse key={sd} cx={540 + sd * 40} cy={1420} rx={18} ry={10 + 3 * Math.sin(frame / 4)} fill="#ff3a2a" style={{filter: 'blur(1px)'}} />)}
          {Array.from({length: 5}).map((_, i) => (
            <ellipse key={i} cx={300 + i * 120 + Math.sin(t + i) * 20} cy={1360 + (i % 2) * 60} rx={120} ry={30} fill="#888" opacity={0.25} />
          ))}
        </g>
        <path d="M 160,900 C 400,860 700,940 920,880" fill="none" stroke="#5a9ad8" strokeWidth={10} opacity={0.7} />
        {lab(540, 400, 'ALDORIA', 1, '#5a2a10')}
        {lab(470, 680, 'ELFOS', k.n, '#1e5a1e')}
        {lab(780, 960, 'ANÕES', k.m, '#3a3a46')}
        {lab(420, 1110, 'REINO HUMANO', k.c, '#1e2a6a')}
        {lab(540, 1520, 'REI DEMÔNIO ☠', k.s, '#ffb0a0')}
        <g transform="translate(900,1560)">
          <circle r={56} fill="none" stroke="#8a5a2a" strokeWidth={5} />
          <path d="M 0,-50 L 14,0 L 0,50 L -14,0 Z" fill="#8a5a2a" />
          <text y={-62} textAnchor="middle" fontFamily={CAPTION_FONT} fontSize={30} fill="#8a5a2a">N</text>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/* ================================================================== medieval sets */
/** Stone street of a medieval town; floor at `floor`. */
export const Town: React.FC<{px?: number; floor?: number}> = ({px = 0, floor = 1500}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#7ac0f0, #cfeaff 60%)'}}>
    <Svg>
      <g transform={`translate(${px * 0.6},0)`}>
        {Array.from({length: 8}).map((_, i) => {
          const x = -300 + i * 240;
          const h = 520 + (i % 3) * 120;
          const roof = ['#b8442a', '#8a3a5a', '#3a5a8a'][i % 3];
          return (
            <g key={i}>
              <rect x={x} y={floor - h} width={220} height={h} fill={i % 2 ? '#efe2c4' : '#e2d0aa'} stroke="#5a3a20" strokeWidth={6} />
              <path d={`M ${x},${floor - h + 120} L ${x + 220},${floor - h + 120} M ${x + 110},${floor - h} L ${x + 110},${floor}`} stroke="#6a4424" strokeWidth={14} />
              <path d={`M ${x - 30},${floor - h} L ${x + 110},${floor - h - 170} L ${x + 250},${floor - h} Z`} fill={roof} stroke="#3a1a10" strokeWidth={6} />
              <rect x={x + 30} y={floor - h + 170} width={56} height={80} fill="#5a8ad0" stroke="#6a4424" strokeWidth={6} />
              <rect x={x + 134} y={floor - h + 170} width={56} height={80} fill="#5a8ad0" stroke="#6a4424" strokeWidth={6} />
              <path d={`M ${x + 130},${floor} L ${x + 130},${floor - 140} Q ${x + 165},${floor - 190} ${x + 200},${floor - 140} L ${x + 200},${floor} Z`} fill="#6a4424" />
            </g>
          );
        })}
      </g>
      <rect x={0} y={floor} width={W} height={H - floor} fill="#9a9488" />
      <g transform={`translate(${(px % 120) - 120},0)`}>
        {Array.from({length: 40}).map((_, i) => (
          <rect key={i} x={(i % 10) * 130 + (Math.floor(i / 10) % 2) * 65} y={floor + 20 + Math.floor(i / 10) * 100} width={110} height={80} rx={14} fill="#aaa498" stroke="#7a7468" strokeWidth={4} />
        ))}
      </g>
    </Svg>
  </AbsoluteFill>
);

/** Academy great hall: stone, arches, banners; floor at `floor`. */
export const Hall: React.FC<{px?: number; floor?: number; dark?: number}> = ({px = 0, floor = 1450, dark = 0}) => (
  <AbsoluteFill style={{background: '#3a3248'}}>
    <Svg>
      <g transform={`translate(${px * 0.5},0)`}>
        {Array.from({length: 6}).map((_, i) => {
          const x = -280 + i * 300;
          return (
            <g key={i}>
              <path d={`M ${x},${floor} L ${x},500 Q ${x + 120},330 ${x + 240},500 L ${x + 240},${floor} Z`} fill="#2a2438" />
              <rect x={x + 240} y={260} width={60} height={floor - 260} fill="#5a5068" />
              <rect x={x + 40} y={520} width={160} height={300} fill={['#7a2a3a', '#2a3a7a', '#7a6a2a'][i % 3]} />
              <path d={`M ${x + 40},820 l 80,60 l 80,-60`} fill={['#7a2a3a', '#2a3a7a', '#7a6a2a'][i % 3]} />
              <circle cx={x + 120} cy={640} r={40} fill="#ffd23a" opacity={0.8} />
            </g>
          );
        })}
        {Array.from({length: 5}).map((_, i) => (
          <g key={i} transform={`translate(${-130 + i * 300},430)`}>
            <circle r={60} fill="#ffb84a" opacity={0.35} style={{filter: 'blur(14px)'}} />
            <path d="M -10,0 Q 0,-40 10,0 Z" fill="#ffd23a" />
          </g>
        ))}
      </g>
      <rect x={0} y={floor} width={W} height={H - floor} fill="#5a5260" />
      {Array.from({length: 6}).map((_, i) => (
        <line key={i} x1={0} y1={floor + 40 + i * 80} x2={W} y2={floor + 40 + i * 80} stroke="#4a4250" strokeWidth={4} />
      ))}
      {dark > 0 && <rect x={0} y={0} width={W} height={H} fill="#000" opacity={dark} />}
    </Svg>
  </AbsoluteFill>
);

/** Crystal on a stone pedestal. (x,y) = pedestal base. state: 0 idle, fire 0..1. */
export const Crystal: React.FC<{x: number; y: number; s?: number; fire?: number; t: number; dead?: number}> = ({x, y, s = 1, fire = 0, t, dead = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -110,0 L -80,-220 L 80,-220 L 110,0 Z" fill="#7a7488" stroke="#4a4458" strokeWidth={6} />
    <rect x={-130} y={-250} width={260} height={40} rx={8} fill="#8a8498" stroke="#4a4458" strokeWidth={6} />
    <g transform={`translate(0,${-260 + Math.sin(t * 2) * 8})`}>
      <circle cy={-130} r={170} fill={fire > 0 ? '#ff6a2a' : '#9fe6ff'} opacity={(fire > 0 ? 0.5 * fire : 0.25) * (1 - dead)} style={{filter: 'blur(30px)'}} />
      <path d="M 0,-280 L 80,-130 L 0,0 L -80,-130 Z" fill={fire > 0 ? '#ffb07a' : dead > 0 ? '#9aa0b0' : '#bff0ff'} stroke="#ffffff" strokeWidth={6} />
      <path d="M 0,-280 L 20,-130 L 0,0 L -80,-130 Z" fill="#fff" opacity={0.35} />
      {fire > 0 &&
        Array.from({length: 7}).map((_, i) => {
          const ph = t * 6 + i;
          const h = (90 + 60 * Math.sin(ph)) * fire;
          return <path key={i} d={`M ${-60 + i * 20},${-160} q ${10 + Math.sin(ph) * 10},${-h * 0.6} 0,${-h} q ${-24},${h * 0.5} -10,${h}`} fill={i % 2 ? '#ffd23a' : '#ff5a1a'} opacity={0.9} />;
        })}
    </g>
  </g>
);

/** Wooden bookshelf. (x,y) top-left, w,h. */
export const Bookshelf: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  const rows = Math.floor(h / 260);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#5a3a20" stroke="#3a2410" strokeWidth={10} />
      {Array.from({length: rows}).map((_, r) => (
        <g key={r}>
          <rect x={x} y={y + r * 260 + 240} width={w} height={22} fill="#3a2410" />
          {Array.from({length: Math.floor(w / 46)}).map((_, i) => {
            const bh = 150 + random(`bk${r}${i}`) * 80;
            return <rect key={i} x={x + 12 + i * 46} y={y + r * 260 + 240 - bh} width={38} height={bh} fill={['#8a2a2a', '#2a4a8a', '#2a6a3a', '#a8862a', '#5a2a6a'][(i + r) % 5]} stroke="#1a1008" strokeWidth={3} />;
          })}
        </g>
      ))}
      <rect x={x - 20} y={y - 24} width={w + 40} height={30} fill="#6a4424" />
    </g>
  );
};

/** Wooden staff (puppet-free, screen units). */
export const Staff: React.FC<{x: number; y: number; len: number; rot?: number; glow?: number}> = ({x, y, len, rot = 0, glow = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x={-10} y={-len} width={20} height={len} rx={8} fill="#7a4a24" stroke="#3a2410" strokeWidth={4} />
    <circle cy={-len - 24} r={30} fill="#9fe6ff" stroke="#fff" strokeWidth={5} />
    {glow > 0 && <circle cy={-len - 24} r={90} fill="#9fe6ff" opacity={0.5 * glow} style={{filter: 'blur(16px)'}} />}
  </g>
);

/** Lightning bolt path between two points. */
export const Bolt: React.FC<{x1: number; y1: number; x2: number; y2: number; seed: string; w?: number; color?: string; k?: number}> = ({x1, y1, x2, y2, seed, w = 14, color = '#fffbe0', k = 1}) => {
  if (k <= 0) return null;
  const n = 9;
  const pts = Array.from({length: n + 1}).map((_, i) => {
    const u = i / n;
    const j = i === 0 || i === n ? 0 : (random(`${seed}${i}`) - 0.5) * 140;
    return `${lerp(x1, x2, u) + j},${lerp(y1, y2, u)}`;
  });
  return (
    <g opacity={k}>
      <polyline points={pts.join(' ')} fill="none" stroke="#ffd23a" strokeWidth={w * 3} opacity={0.4} style={{filter: 'blur(10px)'}} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" />
    </g>
  );
};

/** Soft radial light. */
export const Glow: React.FC<{x: number; y: number; r: number; color: string; o?: number}> = ({x, y, r, color, o = 0.6}) => <circle cx={x} cy={y} r={r} fill={color} opacity={o} style={{filter: `blur(${r * 0.35}px)`}} />;
