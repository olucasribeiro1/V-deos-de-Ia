import {Easing, interpolate, spring} from 'remotion';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Clamped keyframe interpolation with an optional easing (default: ease in-out). */
export const kf = (
  frame: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const linear = (t: number) => t;

/** Snappy pop spring (0 -> 1) that starts at `delay` frames. */
export const pop = (frame: number, fps: number, delay = 0, damping = 11, mass = 0.6) =>
  spring({frame: frame - delay, fps, config: {damping, mass, stiffness: 180}});

/** Smooth pseudo-noise in [-1, 1] (sum of sines, deterministic). */
export const wobble = (t: number, seed = 0) =>
  (Math.sin(t * 1.7 + seed * 12.9898) * 0.5 +
    Math.sin(t * 3.1 + seed * 78.233) * 0.3 +
    Math.sin(t * 5.3 + seed * 3.7) * 0.2);

/** Camera shake offset that decays after `start`. */
export const shake = (frame: number, start: number, dur: number, amp: number, seed = 1) => {
  if (frame < start || frame > start + dur) return {x: 0, y: 0, r: 0};
  const k = 1 - (frame - start) / dur;
  const a = amp * k * k;
  return {
    x: wobble(frame * 2.3, seed) * a,
    y: wobble(frame * 2.9, seed + 3) * a,
    r: wobble(frame * 1.9, seed + 7) * a * 0.02,
  };
};
