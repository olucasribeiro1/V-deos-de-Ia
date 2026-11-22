// A ESTAÇÃO — base comum das cenas: palco PS2 (432x768 interno), câmera em TERCEIRA PESSOA que acompanha
// (chaves com alvo/posição que podem ser funções do tempo), caminhada com cadência vinda do build (info.passos -> os
// mesmos instantes dos sons de salto), rosto vivo (boca nas falas em voz alta, expressão no tempo, piscadas).
import { E, clamp, lerp, ease, noise, prog } from '/engine/core.js';
import { THREE, palcoPS1, fala } from '/series/turno/ps1.js';
import { exprEm, exprP } from '/series/estacao/elenco.js';

export const RESI = [432, 768];
export function palco(T, o = {}) { return palcoPS1(T, { res: RESI, fov: 50, fogStart: o.fogStart ?? 14, fogDens: o.fogDens ?? 0.05, neblina: o.neblina ?? '#10141c', fundo: o.fundo ?? o.neblina ?? '#10141c' }); }

// palavras: WALL = lista completa [palavra, t] (params.Wall)
let WALL = [];
export const setWall = (w) => { if (w) WALL = w; };
const nw = (x) => x.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}']/gu, '');
export function W(w, r, n = 1) { const m = nw(w); let k = 0; for (const [x, t] of WALL) { if (t < r[0] - 0.06 || t > r[1] + 0.06) continue; if (nw(x).startsWith(m) && ++k === n) return t; } return r[0]; }

// ---------- câmera ----------
// K = [[t, { p, m, f, r }]] — p/m: [x,y,z] ou função (T)=>[x,y,z]; interpola entre chaves vizinhas (ease sine)
const av = (v, T) => (typeof v === 'function' ? v(T) : v);
export function cam3(cam, T, K, o = {}) {
  let i = 0; while (i + 1 < K.length && T >= K[i + 1][0]) i++;
  const a = K[i][1], b = K[Math.min(i + 1, K.length - 1)][1];
  const k = i + 1 < K.length ? (K[i + 1][2] || ease.sine)(clamp((T - K[i][0]) / (K[i + 1][0] - K[i][0]))) : 0;
  const pa = av(a.p, T), pb = av(b.p, T), ma = av(a.m, T), mb = av(b.m, T);
  const p = pa.map((x, j) => lerp(x, pb[j], k)), m = ma.map((x, j) => lerp(x, mb[j], k)), f = lerp(a.f ?? 50, b.f ?? 50, k), r = lerp(a.r ?? 0, b.r ?? 0, k);
  const h = o.mao ?? 1, tr = o.tremor ?? 0;   // câmera na mão: respiração leve
  p[0] += h * 0.012 * noise(T * 0.4, 1) + tr * 0.02 * noise(T * 9, 3); p[1] += h * 0.01 * Math.sin(T * 1.3) + tr * 0.015 * noise(T * 11, 5); p[2] += h * 0.012 * noise(T * 0.37, 2);
  m[0] += h * 0.01 * noise(T * 0.5, 7) + tr * 0.02 * noise(T * 10, 8); m[1] += h * 0.008 * noise(T * 0.45, 4);
  cam.position.set(...p); cam.up.set(Math.sin(r), Math.cos(r), 0); cam.lookAt(...m);
  const fv = E.wide ? 2 * Math.atan(Math.tan(f * Math.PI / 360) * 1390 / 1920) * 180 / Math.PI : f; cam.userData.fv = f;
  if (Math.abs(cam.fov - fv) > 1e-3) { cam.fov = fv; cam.updateProjectionMatrix(); }
  cam.updateMatrixWorld();
  return { p, m, f };
}
// atrás do ombro: ponto atrás/acima de quem anda, olhando pra frente dele
export function atras(pers, d = 2.2, h = 1.65, lado = 0.45, olha = 3) { return [(T) => { const q = pers(T); return [q.x - Math.sin(q.ry) * d + Math.cos(q.ry) * lado, h, q.z - Math.cos(q.ry) * d - Math.sin(q.ry) * lado]; }, (T) => { const q = pers(T); return [q.x + Math.sin(q.ry) * olha, 1.35, q.z + Math.cos(q.ry) * olha]; }]; }

// ---------- caminhada por um trajeto (polilinha [x,z]) entre t0 e t1, passos com cadência cad (passos/s) ----------
export function trajeto(pts, t0, t1, cad = 1.9) {
  const seg = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  const at = (T) => {
    const u = clamp((T - t0) / (t1 - t0)); let s = u * tot, i = 0; while (i < seg.length - 1 && s > seg[i]) { s -= seg[i]; i++; }
    const a = pts[i], b = pts[i + 1], k = seg[i] ? clamp(s / seg[i]) : 0;
    return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), ry: Math.atan2(b[0] - a[0], b[1] - a[1]), anda: T > t0 && T < t1, u };
  };
  return { at, t0, t1, cad, tot };
}
// aplica a caminhada no corpo: posição, rumo suavizado, fase = pisada em t0 + k/cad (casando com os sons)
export function anda(p, tj, T, o = {}) {
  const q = tj.at(T); p.position.set(q.x, o.y ?? 0, q.z);
  const ah = tj.at(Math.min(T + 0.35, tj.t1 - 0.001)), ry = Math.atan2(ah.x - q.x, ah.z - q.z);
  if (q.anda && Math.hypot(ah.x - q.x, ah.z - q.z) > 1e-3) p.rotation.y = ry; else if (o.ryFim != null && T >= tj.t1) p.rotation.y = lerp(q.ry, o.ryFim, ease.inOut(prog(T, tj.t1, tj.t1 + 0.6))); else p.rotation.y = q.ry;
  const k = clamp(prog(T, tj.t0 - 0.1, tj.t0 + 0.25) - prog(T, tj.t1 - 0.25, tj.t1 + 0.1));
  if (k > 0.001) p.anda(Math.PI * tj.cad * (T - tj.t0) + Math.PI / 2, k); else p.parado();
  return q;
}
// segmentos de passos vindos do build: info.passos = [[t0, t1, cad], ...]
export const passo = (info, i) => info.passos?.[i] || [0, 0, 1.9];

// ---------- rosto vivo ----------
// falas em voz alta mexem a boca (ids); pensamentos não. exprK = chaves de expressão no tempo
export function vive(p, T, L, ids, exprK, o = {}) {
  const f = ids.length ? fala(T, L, ids) : { ativo: false, k: 0 };
  const P = exprK ? exprEm(T, exprK, o.tr ?? 0.45) : exprP(o.expr || 'neutro');
  const per = o.piscaP ?? 3.4, ph = (T + (o.fase ?? 0)) % per, pis = o.semPisca ? 0 : (ph > per - 0.14 ? Math.sin(Math.PI * (ph - (per - 0.14)) / 0.14) : 0);
  P.pisca = Math.max(P.pisca, pis, o.pisca ?? 0);
  if (f.ativo) { P.mo = Math.max(P.mo * 0.5, f.k * (o.boca ?? 0.75)); P.mw = P.mw * (0.92 + 0.12 * Math.sin(T * 9.3)); P.mp = 0; }
  if (o.olhar) { P.gx += o.olhar[0]; P.gy += o.olhar[1]; }
  p.face(P);
  if (f.ativo && !o.semCabeca) { p.cab.rotation.x += 0.035 * Math.sin(T * 6.1) * (0.4 + f.k); p.cab.rotation.z += 0.03 * Math.sin(T * 2.3); }
  return f;
}
export function post(st, T, o = {}) { st.post({ tempo: T, expo: 1.25, vinheta: 0.42, sat: 0.9, tint: [1, 1, 1], aberr: 0.45, scan: 0.14, vhs: 0.22, grao: 0.04, niveis: 40, dither: 0.5, ...o }); }
export { THREE, E, clamp, lerp, ease, noise, prog };
