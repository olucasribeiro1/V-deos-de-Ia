import timing from './timing.json';
import {FPS} from '../lib/constants';

export type Word = {w: string; start: number; end: number};
export type Line = {id: string; spk: string; text: string; start: number; end: number; words: Word[]};
export const LINES = timing.lines as Line[];
export const line = (id: string) => LINES.find((l) => l.id === id)!;
/** Absolute start (s) of the n-th word (0-based) of a narration line. */
export const wordAt = (id: string, n: number) => line(id).words[n].start;
export const f = (s: number) => Math.round(s * FPS);
/** Story (narration) ends here; then the silent standard outro cards. */
export const OUTRO_AT = 133.0;
export const OUTRO_LEN = 7.0;
export const EP_DURATION = f(OUTRO_AT + OUTRO_LEN);
