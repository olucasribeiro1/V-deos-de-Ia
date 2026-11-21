import {PARTS, f, wordAt} from '../timeline';
export {Rig, BandSafe, SpeedLines} from '../../ep01/partB/rig';

/** Absolute frame of the first frame of Part B (local frame 0). */
export const T0 = f(PARTS.B.start);
/** Part-local frame of a narration word start. */
export const lf = (id: string, n: number) => f(wordAt(id, n)) - T0;

export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word start. */
export const ev = (p: ShotP, id: string, n: number) => lf(id, n) - p.from;
/** Absolute seconds of a shot-local frame (for time-driven motion). */
export const abs = (p: ShotP, fr: number) => (T0 + p.from + fr) / 30;
