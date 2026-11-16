// Câmera que acompanha: foco num ponto do cenário + keyframes suaves.
// foco(x, y, z, d) devolve o cam que centraliza o ponto (x,y) de uma camada de profundidade d com zoom z.
// K(t, [[t0, cam0], [t1, cam1], ...]) interpola os cams com ease.inOut (cam = {z, x, y, r}).
import { E, key, ease, mixVal } from '/engine/core.js';
export const foco = (x, y, z = 1, d = 1, oy = 0) => ({ z, x: (x - E.W / 2) / d, y: (y - E.H / 2 - oy) / d, r: 0 });
export const K = (t, frames, fn = ease.inOut) => key(t, frames.map(f => [f[0], { r: 0, ...f[1] }, f[2]]), fn);
// segue um alvo móvel com atraso (lag 0..1)
export const segue = (alvo, prev, lag = 0.15) => mixVal(prev, alvo, lag);
