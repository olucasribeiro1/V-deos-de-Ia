// Utilitários determinísticos (nada de Math.random / Date.now em render).

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
export const deg = (d: number) => (d * Math.PI) / 180;

/** Hash inteiro → [0,1). Base de todo ruído determinístico. */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

/** Ruído de valor 1D suave, determinístico, em [-1,1]. */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i + seed * 1013);
  const b = hash(i + 1 + seed * 1013);
  return (lerp(a, b, smooth(f)) - 0.5) * 2;
};

/** Ruído fractal (2 oitavas) — "mão na câmera". */
export const fbm1 = (x: number, seed = 0) => noise1(x, seed) * 0.7 + noise1(x * 2.3, seed + 7) * 0.3;

/** Pulso 0→1→0 entre [start, end] com rampas. */
export const window01 = (t: number, start: number, end: number, ramp = 0.3) =>
  clamp((t - start) / ramp) * clamp((end - t) / ramp);

/** RNG com seed (mulberry32) para geração procedural de cenários. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
