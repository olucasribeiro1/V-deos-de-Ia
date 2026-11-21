import {clamp, easeInOut, lerp} from '../animation/math';

/** Keyframe genérico em segundos. `ease` vale para o trecho que CHEGA neste key. */
export type Key<T> = {t: number; v: T; ease?: (x: number) => number};

const lerpAny = (a: any, b: any, k: number): any => {
  if (typeof a === 'number') return lerp(a, b, k);
  if (Array.isArray(a)) return a.map((x, i) => lerpAny(x, b[i], k));
  if (a && typeof a === 'object') {
    const o: any = {};
    for (const key of Object.keys(a)) o[key] = key in b ? lerpAny(a[key], b[key], k) : a[key];
    return o;
  }
  return k < 0.5 ? a : b;
};

/** Amostra uma trilha de keyframes no tempo t (segundos). */
export function sample<T>(keys: Key<T>[], t: number): T {
  if (t <= keys[0].t) return keys[0].v;
  const last = keys[keys.length - 1];
  if (t >= last.t) return last.v;
  let i = 1;
  while (keys[i].t < t) i++;
  const a = keys[i - 1];
  const b = keys[i];
  const k = clamp((t - a.t) / Math.max(1e-6, b.t - a.t));
  return lerpAny(a.v, b.v, (b.ease ?? easeInOut)(k));
}

/** Estado discreto (string) por intervalo: último evento com t <= agora. */
export function stepState<S extends string>(events: {t: number; s: S}[], t: number): {s: S; since: number; prev: S} {
  let cur = events[0];
  let prev = events[0];
  for (const e of events) {
    if (e.t <= t) {
      prev = cur;
      cur = e;
    }
  }
  return {s: cur.s, since: t - cur.t, prev: prev.s};
}
