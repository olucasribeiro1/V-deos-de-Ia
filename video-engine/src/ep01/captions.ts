import {CaptionCue} from '../ui/Caption';
import {LINES, f} from './timeline';

/** Builds word-synced caption chunks (1–3 words, break on punctuation) from the narration timing. */
export const buildCaptionCues = (): CaptionCue[] => {
  const chunks: {text: string; start: number; end: number}[] = [];
  for (const l of LINES) {
    let cur: typeof l.words = [];
    const flush = () => {
      if (!cur.length) return;
      chunks.push({text: cur.map((w) => w.w).join(' '), start: cur[0].start, end: cur[cur.length - 1].end});
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
    const to = next ? Math.min(f(next.start), f(c.end + 0.6)) : f(c.end + 0.8);
    return {text: c.text.toUpperCase(), from: f(c.start), to: Math.max(to, f(c.start) + 6), pos: i % 2 === 0 ? 'top' : 'bottom'};
  });
};
