// Funções comuns dos episódios da série (Ep. 5+).
import { E, layer, blurLayer, veil, ease, prog, wordTime, rr, seg, circle, glow, alpha, text, FONTS, S } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { bunkerSala } from '/series/mamae/bunker.js';
import { quintal } from '/series/mamae/quintal.js';
import { fallout } from '/series/mamae/efeitos.js';
export const INK = '#0b0b0d', WH = '#f1efe9', GY0 = 1305.6, PX = 760;
export const blink = (t, p = 3.1) => (t % p) > p - 0.12;
// tempo global da n-ésima ocorrência de uma palavra dentro de uma fala L=[início,fim]
export const W = (w, L, n = 1) => { let tt = L[0] - 0.05; for (let i = 0; i < n; i++) { const r = wordTime(w, tt); if (r == null) return L[0]; if (i === n - 1) return r; tt = r + 0.12; } };
export const mist = (g, k, A, B) => { if (k < 1) A(g); if (k > 0) { g.save(); g.globalAlpha *= k; B(g); g.restore(); } };
export const rotulo = (g, str, k, y = 450, color = null, size = 100) => { const a = ease.outBack(prog(k, 0, 0.25)); if (a <= 0) return; g.save(); g.translate(540, y); g.scale(a, a); g.rotate(-0.03); text(g, str, 0, 0, { size, color: color || S().ui.gold, stroke: size * 0.2, strokeColor: INK, spacing: 2 }); g.restore(); };
export const fundo = (g, t, cam = { z: 1.5, x: 0, y: 200 }, o = {}) => blurLayer(g, 12, g => bunkerSala(g, t, cam, o), null, 0.6);
export const escada = (g, CX, GY, hy = 330) => { seg(g, [[CX - 70, hy + 120], [CX - 70, GY]], 12, INK); seg(g, [[CX + 70, hy + 120], [CX + 70, GY]], 12, INK); for (let y = hy + 190; y < GY; y += 90) seg(g, [[CX - 70, y], [CX + 70, y]], 10, INK); rr(g, CX - 190, hy, 380, 120, 10); g.fillStyle = '#3d4652'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); for (const dx of [-120, 120]) circle(g, CX + dx, hy + 60, 10, INK); };
export const poeiraAlcapao = (g, CX, T, a = 1) => { for (let i = 0; i < 3; i++) { const ph = ((T * 1.7 + i / 3) % 1); for (let j = 0; j < 5; j++) circle(g, CX - 150 + i * 140 + j * 9, 460 + ph * 500 + j * 14, 4, alpha('#b9bcc2', 0.8 * a * (1 - ph))); } for (let i = 0; i < 4; i++) { const ph = (T * 0.9 + i * 0.27) % 1; seg(g, [[CX - 120 + ph * 240, 340 + i * 22], [CX - 80 + ph * 240, 350 + i * 22]], 5, alpha(WH, 0.6 * a * Math.sin(ph * 3.14))); } };
export const quintalCinza = (g, t, cam, o = {}) => { const r = quintal(g, t, cam, { white: 0.1, fire: 0, smoke: false, ...o }); veil(g, '#6a6f78', o.veu ?? 0.45); fallout(g, t, { count: o.poeira ?? 140, a: 0.7, speed: 50 }); return r; };
export const sepia = (g, a = 0.65) => { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.globalAlpha = a; g.fillRect(0, 0, E.W, E.H); g.restore(); veil(g, '#d8b880', 0.2); };
export const legendaTopo = (g, str, y = 330) => text(g, str, 540, y, { size: 46, color: WH, font: FONTS.ui, weight: 900, spacing: 6, stroke: 12, strokeColor: INK });
export const balao = (g, x, y, str, a = 1) => { if (a <= 0) return; g.save(); g.translate(x, y); g.scale(a, a); rr(g, -160, -70, 320, 140, 60); g.fillStyle = INK; g.fill(); rr(g, -150, -60, 300, 120, 52); g.fillStyle = WH; g.fill(); text(g, str, 0, -6, { size: 70, color: '#16181d' }); g.restore(); };
export const GRAB = { ...POSES.reach, eF: [30, -150], hF: [60, -150] };
export const HIPS = { ...POSES.stand, eF: [26, -136], hF: [10, -108], eB: [-24, -136], hB: [-8, -108] };
export const SALUTE = { ...POSES.stand, eF: [30, -176], hF: [16, -214] };
export const ARM = { ...POSES.sad, eF: [-4, -140], hF: [-14, -128], eB: [16, -134], hB: [4, -150] };
export const OLHAPERI = { ...POSES.reach, eF: [26, -190], hF: [44, -220] };
export const SENTA = { ...POSES.sit, eF: [30, -130], hF: [60, -140] };
// cartão de título do episódio + "segue a página"
export function titulo(g, t, l1, l2, ep, cor = '#e6d24a') {
  const ui = S().ui; g.fillStyle = '#060607'; g.fillRect(0, 0, E.W, E.H); glow(g, 540, 1500, 700, cor, 0.1 + 0.03 * Math.sin(t * 5)); fallout(g, t, { count: 40, a: 0.2 });
  const z = 1 + 0.04 * t; g.save(); g.translate(540, 900); g.scale(z, z);
  const a1 = ease.out(prog(t, 0.05, 0.35)), a2 = ease.outBack(prog(t, 0.2, 0.55)), a3 = ease.out(prog(t, 0.5, 0.8));
  text(g, 'O QUE A MAMÃE SABIA', 0, -230, { size: 40, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 6, alpha: a1 });
  const fit = (s, base) => Math.min(base, 900 / Math.max(1, s.length * 0.62));
  g.save(); g.scale(a2, a2); text(g, l1, 0, -110, { size: fit(l1, 130), color: ui.cream, spacing: 3 }); if (l2) text(g, l2, 0, 16, { size: fit(l2, 120), color: ui.cream, spacing: 3 }); g.restore();
  g.fillStyle = alpha(ui.accent, a3); g.fillRect(-170 * a3, 108, 340 * a3, 8); text(g, `EPISÓDIO ${ep}`, 0, 178, { size: 54, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 8, alpha: a3 });
  g.restore();
}
export const seguir = (g, t, proximo, outfit, fim = false) => UI.seguir(g, t, fim ? { linha1: 'FIM DA TEMPORADA', linha2: ['SEGUE', 'A PÁGINA'], botao: '+ SEGUIR', proximo: proximo, outfit } : { proximo, outfit });
