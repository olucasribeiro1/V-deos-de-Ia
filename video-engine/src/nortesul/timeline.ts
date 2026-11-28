import timing from './timing.json';
import {FPS} from '../lib/constants';

export type Word = {w: string; start: number; end: number};
export type Line = {id: string; text: string; start: number; end: number; words: Word[]};
export const LINES = timing.lines as Line[];
export const line = (id: string) => LINES.find((l) => l.id === id)!;
/** Absolute start (s) of the n-th word (0-based) of a narration line. */
export const wordAt = (id: string, n: number) => line(id).words[n].start;
export const f = (s: number) => Math.round(s * FPS);
export const EP_DURATION = f(timing.duration);

/** Part boundaries (absolute seconds). Each Part renders in a <Sequence>: local frame 0 = PART start. */
export const PARTS = {
  A: {start: 0, end: line('L7').start}, // L1–L6: hook SP 2015, presenter intro, planet water, 4 causes
  B: {start: line('L7').start, end: line('L11').start}, // L7–L10: Salvador block (Pedra do Cavalo, 54% losses, evaporation, Joanes/Ipitanga, saline intrusion)
  C: {start: line('L11').start, end: timing.duration}, // L11–L16: how to avoid (technical), company, home, close NorteSul
};

/** Lip-sync: mouth openness 0..1 per frame (30 fps) from the narration loudness. Use for the presenter's expr.mouthOpen. */
import mouth from './mouth.json';
export const mouthAt = (absFrame: number) => (mouth as number[])[Math.max(0, Math.min((mouth as number[]).length - 1, absFrame))] ?? 0;
