import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Presenter} from '../Presenter';
import {SalvadorBG} from './shotsL7';
import {B0, Cam, Note, ShotP, Svg, Tag, Vignette, ap, camAt, clamp, kf, lerp, prog, sm, wf} from './kit';

/* =================================================================== S18 presenter on the coast */
export const S18: React.FC<ShotP> = (P) => {
  const {fr} = P;
  const p = prog(P);
  const finger = kf(fr, [wf('L10', 1) - 4, wf('L10', 1) + 6], [0, 1]);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.08, 1.0, sm(p))})`, transformOrigin: '50% 60%'}}>
        <SalvadorBG t={fr} rain={0} pan={-220 + p * 40} />
        <Presenter absOffset={B0} x={500} y={2050} height={1550} upperOnly pose={{shR: lerp(10, -150, finger), elR: lerp(-10, 20, finger), facing: 0.1}} expr={{smile: 0.15, browRaise: 0.35}} />
      </div>
      <Vignette op={0.3} />
    </AbsoluteFill>
  );
};

/* =================================================================== coastal aquifer cross-section */
const GROUND = 640;
const SHORE = 760;
const WX = 380; // well x
const WBOT = 1010; // well screen bottom
/** fresh/salt interface depth at x; adv = inland advance (px), cone = upconing under the well */
const iface = (x: number, adv: number, cone: number) => {
  const base = x >= SHORE + adv ? 700 + (x - SHORE - adv) * -0.0 : 700 + (SHORE + adv - x) * 0.9;
  const y = Math.min(1320, Math.max(700, base)) - cone * Math.exp(-(((x - WX) / 90) ** 2));
  return y;
};
const wtable = (x: number, cone: number) => 705 + cone * Math.exp(-(((x - WX) / 130) ** 2));

const Section: React.FC<{fr: number; pump: number; adv: number; upcone: number; dd: number; salty: number}> = ({fr, pump, adv, upcone, dd, salty}) => {
  const xs = Array.from({length: 121}).map((_, i) => -200 + i * 12.5);
  const top = xs.map((x) => `${x.toFixed(1)},${iface(x, adv, upcone).toFixed(1)}`).join(' L');
  const wt = xs.filter((x) => x <= SHORE).map((x) => `${x.toFixed(1)},${wtable(x, dd).toFixed(1)}`).join(' L');
  const vib = pump > 0 ? Math.sin(fr * 2.1) * 2 * pump : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb6e6" />
          <stop offset="1" stopColor="#d8eef8" />
        </linearGradient>
        <pattern id="sand" width={28} height={28} patternUnits="userSpaceOnUse">
          <circle cx={6} cy={8} r={2.4} fill="#000" opacity={0.12} />
          <circle cx={20} cy={20} r={2} fill="#000" opacity={0.1} />
        </pattern>
      </defs>
      <rect x={-500} y={-600} width={2200} height={GROUND + 600} fill="url(#csky)" />
      {/* sea surface + body (right) */}
      <path d={`M${SHORE - 20},${GROUND + 10} L1700,${GROUND + 10} L1700,2400 L${SHORE - 20},2400 Z`} fill="#1f6fa8" />
      {/* city on land */}
      {Array.from({length: 8}).map((_, i) => {
        const x = -200 + i * 95;
        if (x > 600) return null;
        const h = 120 + random(`cs${i}`) * 220;
        if (Math.abs(x + 45 - WX) < 70) return null;
        return <rect key={i} x={x} y={GROUND - h} width={80} height={h} fill={['#c9d3dc', '#e2d6c4', '#b8c7d6', '#d9c3b0'][i % 4]} stroke="#8a96a3" strokeWidth={2} />;
      })}
      {/* subsurface: unsaturated sand */}
      <path d={`M-500,${GROUND} L${SHORE - 20},${GROUND} Q${SHORE + 30},${GROUND + 6} ${SHORE + 80},${GROUND + 70} L${SHORE + 80},1400 L-500,1400 Z`} fill="#e0c493" />
      {/* fresh water (below water table) */}
      <path d={`M-500,705 L${wt} L${SHORE + 80},700 L${SHORE + 80},1400 L-500,1400 Z`} fill="#8fd0ff" />
      {/* salt water below interface */}
      <path d={`M-500,${iface(-500, adv, upcone)} L${top} L1700,700 L1700,1400 L-500,1400 Z`} fill="#1e7b86" />
      <path d={`M${top}`} fill="none" stroke="#ffffff" strokeWidth={4} strokeDasharray="12 8" opacity={0.8} />
      {/* sand texture over the aquifer */}
      <rect x={-500} y={GROUND} width={2200} height={760} fill="url(#sand)" />
      {/* sea floor line */}
      <path d={`M${SHORE - 20},${GROUND + 10} Q${SHORE + 30},${GROUND + 6} ${SHORE + 80},${GROUND + 70} L1700,${GROUND + 160}`} stroke="#c9a46a" strokeWidth={6} fill="none" />
      <path d={`M${SHORE + 80},${GROUND + 70} L1700,${GROUND + 160} L1700,${GROUND + 10} Z`} fill="#1f6fa8" />
      {/* bedrock */}
      <rect x={-500} y={1400} width={2200} height={1000} fill="#6f6a66" />
      <path d="M-500,1400 L1700,1400" stroke="#4e4a47" strokeWidth={6} />
      {/* water table line */}
      <path d={`M-500,705 L${wt}`} fill="none" stroke="#1d5f9c" strokeWidth={4} />
      {/* well */}
      <g transform={`translate(${vib},0)`}>
        <rect x={WX - 16} y={GROUND - 40} width={32} height={WBOT - GROUND + 40} fill="#5b6470" />
        <rect x={WX - 10} y={GROUND - 30} width={20} height={WBOT - GROUND + 26} fill={salty > 0.5 ? '#1e7b86' : '#3aa0f0'} opacity={0.35 + 0.5 * pump} />
        <rect x={WX - 10} y={WBOT - 80} width={20} height={80} fill={`rgb(${lerp(58, 30, salty)},${lerp(160, 123, salty)},${lerp(240, 134, salty)})`} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={WX - 16} y1={WBOT - 70 + i * 18} x2={WX + 16} y2={WBOT - 70 + i * 18} stroke="#2a2f3a" strokeWidth={3} />)}
        {/* pump house */}
        <rect x={WX - 60} y={GROUND - 110} width={120} height={80} rx={8} fill="#e8edf2" stroke="#2a2f3a" strokeWidth={4} />
        <circle cx={WX} cy={GROUND - 70} r={24} fill="#3b82c4" stroke="#2a2f3a" strokeWidth={4} />
        <path d={`M${WX},${GROUND - 70} L${WX + 18 * Math.cos(fr * 0.9 * pump)},${GROUND - 70 + 18 * Math.sin(fr * 0.9 * pump)}`} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        <path d={`M${WX + 60},${GROUND - 60} L${WX + 140},${GROUND - 60}`} stroke="#5b6470" strokeWidth={14} />
      </g>
      {/* pumping arrows */}
      {pump > 0 &&
        [0, 1, 2].map((i) => {
          const cyc = ((fr * (1 + pump) + i * 20) % 60) / 60;
          const y = WBOT - cyc * (WBOT - GROUND);
          return <path key={i} d={`M${WX - 12},${y + 14} L${WX},${y} L${WX + 12},${y + 14}`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={pump * Math.sin(cyc * Math.PI)} />;
        })}
      {/* salt particles creeping in */}
      {adv > 0 &&
        Array.from({length: 14}).map((_, i) => {
          const q = (k: string) => random(`sp${i}${k}`);
          const tt = ((fr * 0.8 + q('p') * 60) % 60) / 60;
          const x = lerp(SHORE - 40, WX + 20, tt * clamp(adv / 160));
          const y = iface(x, adv, upcone) + 20 + q('y') * 60;
          return <circle key={i} cx={x} cy={y} r={5} fill="#ffffff" opacity={0.7 * Math.sin(tt * Math.PI)} />;
        })}
    </svg>
  );
};

type SecP = ShotP & {A: [number, number, number]; Z: [number, number, number]};
const SecShot: React.FC<SecP & {labels: 'surface' | 'pump' | 'intrusion' | 'stamp'}> = (P) => {
  const {fr, labels} = P;
  const c = camAt(prog(P), P.A, P.Z);
  const pump = kf(fr, [wf('L10', 7) - 4, wf('L10', 9)], [0, 1]);
  const dd = kf(fr, [wf('L10', 7), wf('L10', 12)], [0, 70]);
  const adv = kf(fr, [wf('L10', 13) - 4, wf('L10', 19) + 6], [0, 190]);
  const upc = kf(fr, [wf('L10', 15), wf('L10', 20)], [0, 120]);
  const salty = kf(fr, [wf('L10', 18), wf('L10', 20) + 6], [0, 1]);
  const proj = (x: number, y: number) => [540 + (x - c.cx) * c.s, 915 + (y - c.cy) * c.s];
  const [px, py] = proj(WX, GROUND - 120);
  const [fx, fy] = proj(120, 760);
  const [sx, sy] = proj(860, 1200);
  const [ax, ay] = proj(160, 1330);
  return (
    <AbsoluteFill style={{background: '#6fb6e6'}}>
      <Cam {...c}>
        <Section fr={fr} pump={pump} adv={adv} upcone={upc} dd={dd} salty={salty} />
      </Cam>
      {labels !== 'surface' && (
        <>
          <Note x={fx} y={fy} text="ÁGUA DOCE" k={ap(fr, P.a + 2)} size={30} color="#0b3a5e" align="left" />
          <Note x={sx} y={sy} text="ÁGUA SALGADA (MAR)" k={ap(fr, P.a + 6)} size={30} color="#ffffff" />
        </>
      )}
      {labels === 'intrusion' && <Note x={ax} y={ay} text="AQUÍFERO" k={ap(fr, wf('L10', 19))} size={30} color="#ffffff" align="left" />}
      <Note x={px} y={py - 10} text="POÇO" k={ap(fr, wf('L10', 11))} size={34} color="#0b1a2e" />
      {labels === 'pump' && <Tag x={540} y={1660} text="BOMBEAMENTO EXCESSIVO" k={ap(fr, wf('L10', 9))} size={38} color="#ffd23a" />}
      {labels === 'intrusion' && <Tag x={540} y={1660} text="O MAR AVANÇA NO AQUÍFERO" k={ap(fr, wf('L10', 15))} size={38} color="#5fe0e8" />}
      {labels === 'stamp' && (
        <div style={{position: 'absolute', left: 540, top: 1660, transform: `translate(-50%,-50%) scale(${lerp(1.6, 1, ap(fr, wf('L10', 23), 7))})`, opacity: ap(fr, wf('L10', 23), 5)}}>
          <div style={{padding: '10px 34px 12px', border: '7px solid #ff4d4d', borderRadius: 18, background: 'rgba(8,20,40,0.85)', color: '#ff4d4d', fontFamily: 'Oswald', fontWeight: 700, fontSize: 84, letterSpacing: 4, whiteSpace: 'nowrap'}}>INTRUSÃO SALINA</div>
        </div>
      )}
      <Vignette op={0.3} />
    </AbsoluteFill>
  );
};

export const S19: React.FC<ShotP> = (P) => <SecShot {...P} labels="surface" A={[420, 520, 1.35]} Z={[460, 760, 1.15]} />;
export const S20: React.FC<ShotP> = (P) => <SecShot {...P} labels="pump" A={[470, 880, 1.0]} Z={[470, 900, 1.06]} />;
export const S21: React.FC<ShotP> = (P) => <SecShot {...P} labels="intrusion" A={[520, 960, 1.12]} Z={[480, 960, 1.22]} />;
export const S22: React.FC<ShotP> = (P) => <SecShot {...P} labels="stamp" A={[470, 930, 1.18]} Z={[480, 920, 0.98]} />;
