import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAPTION_FONT} from '../lib/fonts';
import {LINES, f} from './timeline';

/** Words shown in yellow (Kaiser-style keyword highlight). Compared without punctuation, uppercase. */
const KEY = new Set(
  'DAVI TELETRANSPORTA VIU LINHA GAROTA CONTINUAÇÃO SEGUIDORES RECAPITULANDO VELOCIDADE ANTIGA ACIDENTE ATLÂNTICO TURISTA SETENTA LITROS AR MÔNACO LIA MOLETOM SALTO FOTOS TREZENTAS DOZE VIGIADO FOTO ROCHA LUGAR MICROFONES ESTALO DOIS SEGUNDOS TRINTA SALTOS ENLOUQUECEM TRIGÉSIMO PRIMEIRO MÃO SEGURO QUILÔMETROS MEIO PASSINHO IATE DECK CHAPÉU CAPITÃO DEPENDE DIA TAÇAS CONTA'.split(' '),
);
const norm = (w: string) => w.replace(/[.,?!:;]/g, '').toUpperCase();

type Cue = {words: string[]; from: number; to: number; pos: 'top' | 'bottom'};

export const buildCues = (): Cue[] => {
  const chunks: {words: string[]; start: number; end: number}[] = [];
  for (const l of LINES) {
    let cur: typeof l.words = [];
    const flush = () => {
      if (!cur.length) return;
      chunks.push({words: cur.map((w) => w.w), start: cur[0].start, end: cur[cur.length - 1].end});
      cur = [];
    };
    for (const w of l.words) {
      cur.push(w);
      const len = cur.map((x) => x.w).join(' ').length;
      if (/[.,?!:]$/.test(w.w) || cur.length >= 3 || len >= 16) flush();
    }
    flush();
  }
  return chunks.map((c, i) => {
    const next = chunks[i + 1];
    const to = next ? Math.min(f(next.start), f(c.end + 0.5)) : f(c.end + 0.8);
    return {words: c.words, from: f(c.start), to: Math.max(to, f(c.start) + 5), pos: i % 2 === 0 ? 'top' : 'bottom'};
  });
};

const POS_Y = {top: 0.2, bottom: 0.76};

const Cap: React.FC<Cue> = ({words, from, to, pos}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const s = spring({frame: frame - from, fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
  const scale = interpolate(s, [0, 1], [0.55, 1]);
  const opacity = interpolate(frame - from, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  const out = interpolate(frame, [to - 3, to], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: POS_Y[pos] * height,
        transform: `translateY(-50%) scale(${scale})`,
        textAlign: 'center',
        fontFamily: CAPTION_FONT,
        fontWeight: 700,
        fontSize: 84,
        lineHeight: 1.08,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        opacity: opacity * out,
        textShadow: '0 0 3px rgba(0,0,0,0.9), 0 4px 0 rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.55)',
        WebkitTextStroke: '2px rgba(10,8,12,0.6)',
        paintOrder: 'stroke fill',
      }}
    >
      {words.map((w, i) => (
        <span key={i} style={{color: KEY.has(norm(w)) ? '#ffd23a' : '#ffffff'}}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  );
};

const CUES = buildCues();
export const Ep05Captions: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {CUES.map((c, i) => (
      <Cap key={i} {...c} />
    ))}
  </AbsoluteFill>
);
