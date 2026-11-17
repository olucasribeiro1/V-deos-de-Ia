// Utilidades de tempo: tudo é ancorado na timeline gerada pelo gerar_audio.py
import tl from '../../public/ep01/timeline.json';
export { tl };

const beatMap = Object.fromEntries(tl.beats.map((b) => [b.beat, b]));
// b('tv', 0.5) => segundo no meio do beat "tv"
export const b = (nome, frac = 0) => {
  const x = beatMap[nome];
  if (!x) throw new Error('beat ' + nome);
  return x.start + (x.end - x.start) * frac;
};
export const ev = (tipo, n = 0) => tl.eventos.filter((e) => e.tipo === tipo)[n];
export const palavra = (falaId, w) => {
  const f = tl.falas.find((x) => x.id === falaId);
  const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  return f.palavras.find((p) => norm(p.w) === norm(w)).s;
};

export const clamp = (v, a = 0, z = 1) => Math.min(z, Math.max(a, v));
export const smooth = (t) => t * t * (3 - 2 * t);
export const lerp = (a, z, t) => a + (z - a) * t;
export const lerp3 = (a, z, t) => [lerp(a[0], z[0], t), lerp(a[1], z[1], t), lerp(a[2], z[2], t)];
// 0→1 entre t0 e t1 (suavizado)
export const ramp = (t, t0, t1) => smooth(clamp((t - t0) / (t1 - t0)));

// Catmull-Rom com tempo: keys = [{t, v:[x,y,z]}] ordenadas
const cr = (p0, p1, p2, p3, u) => {
  const u2 = u * u, u3 = u2 * u;
  return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
};
export function trilha(keys, t, campo = 'v') {
  if (t <= keys[0].t) return keys[0][campo];
  const n = keys.length;
  if (t >= keys[n - 1].t) return keys[n - 1][campo];
  let i = 0;
  while (keys[i + 1].t < t) i++;
  const k0 = keys[Math.max(0, i - 1)][campo], k1 = keys[i][campo], k2 = keys[i + 1][campo], k3 = keys[Math.min(n - 1, i + 2)][campo];
  const u = (t - keys[i].t) / (keys[i + 1].t - keys[i].t);
  // trecho parado (dois keys iguais): fica parado, sem deriva da curva
  if (JSON.stringify(k1) === JSON.stringify(k2)) return k1;
  if (typeof k1 === 'number') return cr(k0, k1, k2, k3, u);
  return k1.map((_, j) => cr(k0[j], k1[j], k2[j], k3[j], u));
}

// Ruído suave determinístico (tremor de câmera, flicker)
export const ruido = (t, s = 1) =>
  Math.sin(t * 13.1 * s + 1.3) * 0.5 + Math.sin(t * 27.7 * s + 4.1) * 0.3 + Math.sin(t * 51.3 * s + 2.2) * 0.2;

// Aleatório determinístico (mesmo resultado em todas as abas de render)
let _seed = 1337;
export const rnd = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };
