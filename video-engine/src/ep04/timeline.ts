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
  A: {start: 0, end: line('L8').start}, // L1–L7: power, card gag, field falloff, which metals, diamagnetism, frog, training
  B: {start: line('L8').start, end: timing.duration}, // L8–L14: diner robbery: aluminum bat (Lenz), bike chain, police, card gag, CTA
};
