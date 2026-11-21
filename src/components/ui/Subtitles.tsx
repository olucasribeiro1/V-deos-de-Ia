import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Legendas estilo vídeo viral: fonte pesada, cor viva, contorno escuro grosso, 2 linhas no máximo.
 * Cada fala é dividida em blocos curtos que acompanham o tempo do áudio (proporcional ao nº de caracteres).
 */
const COLORS: Record<string, string> = {protagonista: '#ffd24a', rafael: '#7fe0d4', vizinho: '#ff8a8a', reporter: '#d6d6ff'};

function chunks(text: string, max = 46) {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
    if (/[.!?…]$/.test(w) && cur.length > 18) {
      out.push(cur);
      cur = '';
    }
  }
  if (cur) out.push(cur);
  return out;
}

export const Subtitles: React.FC<{lines: {id: string; v: string; text: string; t: number; dur: number}[]; t: number}> = ({lines, t}) => {
  const l = lines.find((x) => t >= x.t && t < x.t + x.dur + 0.15);
  if (!l) return null;
  const parts = chunks(l.text.replace(/\[[^\]]+\]\s*/g, '').trim());
  const total = parts.reduce((a, p) => a + p.length, 0);
  let acc = 0;
  let current = parts[parts.length - 1];
  for (const p of parts) {
    const end = l.t + ((acc + p.length) / total) * l.dur;
    if (t < end) {
      current = p;
      break;
    }
    acc += p.length;
  }
  const color = COLORS[l.v] ?? '#ffffff';
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 56}}>
      <div
        style={{
          maxWidth: 900,
          textAlign: 'center',
          fontFamily: '"DejaVu Sans", Arial, sans-serif',
          fontWeight: 900,
          fontSize: 38,
          lineHeight: 1.18,
          color,
          WebkitTextStroke: '7px #121212',
          paintOrder: 'stroke fill',
          textShadow: '0 3px 0 #121212',
        }}
      >
        {current}
      </div>
    </AbsoluteFill>
  );
};
