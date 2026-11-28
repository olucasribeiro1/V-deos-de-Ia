import timing from './timing.json';
import {FPS} from '../lib/constants';

export type Word = {w: string; start: number; end: number};
export type Line = {id: string; text: string; start: number; end: number; words: Word[]};
export const LINES = timing.lines as Line[];
export const line = (id: string) => LINES.find((l) => l.id === id)!;
/** Absolute start (s) of the n-th word (0-based) of a narration line. */
export const wordAt = (id: string, n: number) => line(id).words[n].start;
export const f = (s: number) => Math.round(s * FPS);

/** Episode length: narration end + tail. */
export const EP_DURATION = f(timing.duration);

/** Part boundaries (absolute seconds). Each Part renders inside a <Sequence>, so its local frame 0 = PART start. */
export const PARTS = {
  A: {start: 0, end: line('L9').start}, // L1–L8
  B: {start: line('L9').start, end: line('L17').start}, // L9–L16
  C: {start: line('L17').start, end: timing.duration}, // L17–L25 + tail
};
