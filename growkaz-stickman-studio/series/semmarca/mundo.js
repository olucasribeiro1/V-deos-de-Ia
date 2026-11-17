// Série "Sem Marca": mundo medieval mágico em 2.5D (camadas com profundidade, névoa atmosférica, luz de recorte).
import { E, layer, linGrad, radGrad, rr, seg, poly, circle, glow, alpha, mix, shade, rng, text, FONTS, ease, prog, clamp, noise, veil, lerp, blurLayer } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
export const INK = '#0b0b0d', GY = 1305.6;
export const COR = { fogo: '#ff4a1a', agua: '#2a9dff', terra: '#b8743a', vento: '#e8f4ff', raio: '#ffe23a', luz: '#ffd76a', sombra: '#1a1024', gravidade: '#a64bff' };
export const box = (g, x, y, w, h, c, r = 6, lw = 5) => { rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } };
const haze = (c, k, to = '#b9a0e0') => mix(c, to, k);           // perspectiva atmosférica

// ---------- céu roxo com duas luas ----------
export function ceu(g, t, cam, o = {}) {
  const { top = '#1a0b3a', mid = '#5a2a8a', bot = '#f0a0c8', luas = true, d = 0.05 } = o;
  layer(g, cam, d, g => { g.fillStyle = linGrad(g, 0, -900, 0, GY, [top, mid, bot]); g.fillRect(-E.W * 3, -E.H * 2, E.W * 7, E.H * 4);
    FX.stars(g, t, { count: 90, seed: 11, area: [-E.W * 2, -E.H, E.W * 5, E.H * 0.9] });
    if (luas) { glow(g, 760, 260, 360, '#ffd8f0', 0.35); circle(g, 760, 260, 120, '#fbe8ff'); circle(g, 730, 240, 26, alpha('#d8b8e8', 0.6)); circle(g, 800, 300, 18, alpha('#d8b8e8', 0.6));
      glow(g, 330, 420, 200, '#9ff0ff', 0.3); circle(g, 330, 420, 56, '#c8f6ff'); circle(g, 318, 410, 12, alpha('#8ad0e0', 0.6)); }
    for (let i = 0; i < 5; i++) { const x = ((i * 470 + t * 12) % 2600) - 900, y = 520 + (i % 3) * 90; g.fillStyle = alpha('#ffc8ec', 0.18); g.beginPath(); g.ellipse(x, y, 260, 34, 0, 0, 7); g.ellipse(x + 120, y - 20, 160, 30, 0, 0, 7); g.fill(); } });
}
export function montanhas(g, cam, o = {}) {
  const { d = 0.15, y = 1000, cores = ['#7a5aa8', '#5a3e88', '#3e2a66'] } = o;
  cores.forEach((c, k) => layer(g, cam, d + k * 0.1, g => { const r = rng(5 + k); g.fillStyle = c; g.beginPath(); g.moveTo(-E.W * 3, GY + 400); for (let x = -E.W * 3; x <= E.W * 4; x += 160 + r() * 140) { const h = 220 + r() * 380 - k * 60; g.lineTo(x, y - h + k * 90); g.lineTo(x + 90, y - h * 0.6 + k * 90); } g.lineTo(E.W * 4, GY + 400); g.fill();
    if (k === 0) { g.fillStyle = alpha('#ffffff', 0.55); const r2 = rng(5); for (let x = -E.W * 3; x <= E.W * 4; x += 160 + r2() * 140) { const h = 220 + r2() * 380; poly(g, [[x, y - h], [x - 40, y - h + 60], [x + 40, y - h + 60]], alpha('#ffffff', 0.5)); } } }));
}
// ---------- torre de castelo ----------
export function torre(g, x, y, w, h, o = {}) { const { pedra = '#c9bfd8', teto = '#d8342b', janelas = 2, luz = 1, flag = null, t = 0 } = o;
  g.fillStyle = INK; g.fillRect(x - w / 2 - 4, y - h - 4, w + 8, h + 8); g.fillStyle = linGrad(g, x - w / 2, 0, x + w / 2, 0, [shade(pedra, 0.12), pedra, shade(pedra, -0.25)]); g.fillRect(x - w / 2, y - h, w, h);
  for (let i = 0; i < 4; i++) g.fillRect(x - w / 2 + i * (w / 3.5), y - h - 18, w / 7, 18);
  poly(g, [[x - w / 2 - 14, y - h - 10], [x, y - h - w * 1.3], [x + w / 2 + 14, y - h - 10]], teto); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  poly(g, [[x, y - h - w * 1.3], [x + w / 2 + 14, y - h - 10], [x + 4, y - h - 10]], alpha('#000', 0.22));
  for (let j = 0; j < janelas; j++) { const wy = y - h + 40 + j * 70; rr(g, x - 10, wy, 20, 34, 10); g.fillStyle = luz ? '#ffd27a' : '#1a1020'; g.fill(); if (luz) glow(g, x, wy + 17, 50, '#ffb84a', 0.3); }
  if (flag) { seg(g, [[x, y - h - w * 1.3], [x, y - h - w * 1.3 - 60]], 4, INK); const fy = y - h - w * 1.3 - 60; g.fillStyle = flag; g.beginPath(); g.moveTo(x, fy); for (let k = 0; k <= 6; k++) g.lineTo(x + k * 10, fy + 4 + Math.sin(t * 5 + k) * 4); for (let k = 6; k >= 0; k--) g.lineTo(x + k * 10, fy + 24 + Math.sin(t * 5 + k) * 4); g.fill(); }
}
export function castelo(g, x, y, s, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); const p = o.pedra || '#cbbfe0';
  box(g, -260, -240, 520, 240, p, 0, 6); for (let i = 0; i < 10; i++) g.fillRect(-260 + i * 54, -262, 30, 22); rr(g, -50, -150, 100, 150, 50); g.fillStyle = '#2a1830'; g.fill();
  torre(g, -270, 0, 90, 360, { ...o, pedra: p, teto: '#2a5ad8', flag: '#ffd23a' }); torre(g, 270, 0, 90, 360, { ...o, pedra: p, teto: '#2a5ad8', flag: '#ffd23a' }); torre(g, -110, -200, 80, 260, { ...o, pedra: p }); torre(g, 110, -200, 80, 260, { ...o, pedra: p }); torre(g, 0, -220, 120, 420, { ...o, pedra: p, teto: '#d8342b', flag: '#ff4a6a', janelas: 3 });
  g.restore(); }
// ---------- casa medieval (enxaimel colorido) ----------
export function casa(g, x, y, w, h, c, o = {}) { const { teto = '#a8432a', luz = 1, seed = 1 } = o; const r = rng(seed);
  box(g, x, y - h, w, h, c, 0, 6); g.fillStyle = alpha('#000', 0.18); g.fillRect(x + w * 0.7, y - h, w * 0.3, h);
  g.strokeStyle = '#3a2418'; g.lineWidth = 9; g.strokeRect(x + 6, y - h + 6, w - 12, h - 12); seg(g, [[x + 6, y - h * 0.5], [x + w - 6, y - h * 0.5]], 9, '#3a2418'); seg(g, [[x + 6, y - h + 6], [x + w * 0.5, y - h * 0.5]], 7, '#3a2418'); seg(g, [[x + w - 6, y - h + 6], [x + w * 0.5, y - h * 0.5]], 7, '#3a2418');
  poly(g, [[x - 26, y - h + 4], [x + w / 2, y - h - w * 0.55], [x + w + 26, y - h + 4]], teto); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); poly(g, [[x + w / 2, y - h - w * 0.55], [x + w + 26, y - h + 4], [x + w / 2, y - h + 4]], alpha('#000', 0.2));
  for (const wx of [0.18, 0.62]) { box(g, x + w * wx, y - h * 0.4, w * 0.2, h * 0.22, luz && r() < 0.8 ? '#ffd27a' : '#1c1426', 4, 4); if (luz) glow(g, x + w * (wx + 0.1), y - h * 0.29, 90, '#ffb84a', 0.18); }
  box(g, x + w * 0.4, y - h * 0.38 + h * 0.38 - h * 0.34, w * 0.2, h * 0.34, '#5a3420', 30, 4);
}
// ---------- cidade medieval (rua com profundidade) ----------
export function cidade(g, t, cam, o = {}) {
  const { noite = 0, castle = true } = o;
  ceu(g, t, cam, { top: mix('#2a5ad8', '#1a0b3a', noite), mid: mix('#8ac8ff', '#5a2a8a', noite), bot: mix('#ffe0b0', '#f0a0c8', noite), luas: noite > 0.5 });
  montanhas(g, cam, { y: 980 });
  if (castle) layer(g, cam, 0.3, g => { castelo(g, 560, 860, 0.9, { t }); veil2(g, '#b9a0e0', 0.25); });
  layer(g, cam, 0.5, g => { const r = rng(3), cs = ['#ffd2a0', '#a0d8ff', '#ffb0c8', '#c8f0a0', '#e8c8ff', '#fff0a0']; for (let i = -6; i < 12; i++) casa(g, i * 230 - 60, GY - 130, 200, 260 + r() * 120, haze(cs[(i + 12) % 6], 0.25), { teto: haze(['#a8432a', '#2a5ad8', '#3a8a4a'][(i + 12) % 3], 0.25), seed: i + 20 }); veil2(g, '#b9a0e0', 0.15); });
  layer(g, cam, 0.8, g => { const cs = ['#ffb46a', '#6ab8ff', '#ff7aa0', '#8ade6a', '#c48aff', '#ffe06a']; const r = rng(8);
    for (let i = -5; i < 10; i++) { casa(g, i * 330 - 40, GY, 290, 360 + r() * 140, cs[(i + 10) % 6], { teto: ['#c0462a', '#2a5ad8', '#3a8a4a', '#8a3ab0'][(i + 12) % 4], seed: i + 3 }); }
    for (let i = -5; i < 10; i += 2) { const x = i * 330 + 270; seg(g, [[x - 300, GY - 320], [x, GY - 300]], 3, INK); for (let k = 0; k < 6; k++) { const fx = x - 280 + k * 46, fy = GY - 318 + Math.sin(k / 5 * 3.14) * 12; poly(g, [[fx, fy], [fx + 30, fy], [fx + 15, fy + 40 + Math.sin(t * 3 + k) * 3]], ['#ff4a6a', '#ffd23a', '#2a9dff', '#4ade6a'][k % 4]); } }
    for (let i = -4; i < 10; i += 3) { const x = i * 330 + 160; seg(g, [[x, GY], [x, GY - 300]], 10, INK); box(g, x - 22, GY - 340, 44, 50, '#3a2a20', 8, 4); circle(g, x, GY - 315, 12, '#ffd27a'); glow(g, x, GY - 315, 160, '#ffb84a', 0.3); } });
  layer(g, cam, 0.92, g => { g.fillStyle = '#8a7a8e'; g.fillRect(-E.W * 3, GY, E.W * 7, E.H); const r = rng(9); g.strokeStyle = alpha(INK, 0.35); g.lineWidth = 3; for (let j = 0; j < 9; j++) for (let i = -40; i < 60; i++) { const x = i * 70 + (j % 2) * 35, y = GY + 10 + j * 46; rr(g, x, y, 62, 40, 12); g.fillStyle = shade('#9a8a9e', (r() - 0.5) * 0.2 + j * 0.02); g.fill(); g.stroke(); } });
  if (noite) veil(g, '#1a0b3a', 0.25 * noite);
  return { GY };
}
const veil2 = (g, c, a) => { g.save(); g.fillStyle = alpha(c, a); g.fillRect(-E.W * 3, -E.H * 2, E.W * 7, E.H * 4); g.restore(); };

// ---------- campo de treino (para os elementos) ----------
export function campo(g, t, cam, o = {}) {
  ceu(g, t, cam, { top: '#3a6ad8', mid: '#9ad0ff', bot: '#ffe8c0', luas: false });
  montanhas(g, cam, { y: 1020, cores: ['#9a8ac8', '#7a6aa8', '#5a8a6a'] });
  layer(g, cam, 0.35, g => { castelo(g, 2400, 980, 0.7, { t }); castelo(g, -900, 990, 0.5, { t }); veil2(g, '#c8b8f0', 0.25); });
  layer(g, cam, 0.6, g => { FX.hills(g, { y: GY - 40, amp: 120, color: '#5ab05a', seed: 4 }); for (let i = -10; i < 30; i++) { const x = i * 190 + (i % 3) * 40; FX.tree(g, x, GY - 60 - (i % 4) * 16, 1.2, ['#2f8a3e', '#3fa04a', '#257a36'][i % 3]); } });
  layer(g, cam, 0.9, g => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, ['#6ac85a', '#3a8a3a']); g.fillRect(-E.W * 3, GY, E.W * 9, E.H); const r = rng(2); for (let i = 0; i < 260; i++) { const x = -E.W * 3 + r() * E.W * 9, y = GY + 20 + r() * 600; seg(g, [[x, y], [x + 4, y - 18]], 3, alpha('#2a6a2a', 0.6)); }
    for (let i = -6; i < 30; i++) { const x = i * 160; seg(g, [[x, GY + 40], [x, GY - 50]], 10, '#6a4a2a'); } seg(g, [[-1000, GY - 30], [4800, GY - 30]], 8, '#7a5a3a'); seg(g, [[-1000, GY + 10], [4800, GY + 10]], 8, '#7a5a3a'); });
  return { GY };
}
// ---------- salão da Academia Real ----------
export function salao(g, t, cam, o = {}) { const { publico = 1, riso = 0, silencio = 0 } = o;
  layer(g, cam, 0.25, g => { g.fillStyle = linGrad(g, 0, -600, 0, GY, ['#1a1036', '#3a2468', '#5a3a88']); g.fillRect(-E.W * 3, -E.H * 2, E.W * 7, E.H * 4);
    for (let i = -2; i < 5; i++) { const x = i * 420 + 120; rr(g, x - 80, 200, 160, 440, 80); g.fillStyle = INK; g.fill(); rr(g, x - 70, 210, 140, 420, 70); g.save(); g.clip(); const cs = ['#ff4a6a', '#2a9dff', '#ffd23a', '#4ade6a', '#a64bff']; for (let k = 0; k < 12; k++) { g.fillStyle = cs[(k + i + 5) % 5]; g.fillRect(x - 70 + (k % 3) * 47, 210 + Math.floor(k / 3) * 105, 47, 105); } g.restore(); g.strokeStyle = INK; g.lineWidth = 6; for (let k = 1; k < 3; k++) seg(g, [[x - 70 + k * 47, 210], [x - 70 + k * 47, 630]], 5, INK); glow(g, x, 420, 260, '#ffe8b0', 0.25); }
    for (let i = -2; i < 5; i++) { const x = i * 420 + 330; poly(g, [[x - 30, 150], [x + 30, 150], [x + 30, 500], [x, 470], [x - 30, 500]], i % 2 ? '#c0283a' : '#2a4ad8'); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); circle(g, x, 300, 18, '#ffd23a'); } });
  layer(g, cam, 0.5, g => { for (let k = 0; k < 4; k++) { const y = GY - 120 - k * 110; g.fillStyle = shade('#4a3060', -k * 0.05); g.fillRect(-E.W * 3, y, E.W * 7, 110); g.fillStyle = '#2a1a3a'; g.fillRect(-E.W * 3, y, E.W * 7, 12);
      if (publico) FX.crowd(g, t + k, { seed: 3 + k, x: -E.W * 2, y: y + 30, w: E.W * 5, rows: 2, rowH: 34, size: 2.2, colors: ['#f1efe9', '#e2ded6', '#d6d2ca'], cheer: riso, wave: riso ? 1.5 : 0 }); }
    if (silencio) veil(g, '#000', 0.3 * silencio); });
  layer(g, cam, 0.75, g => { for (let i = -3; i < 6; i++) { const x = i * 360 - 60; g.fillStyle = INK; g.fillRect(x - 46, -400, 92, GY + 400); g.fillStyle = linGrad(g, x - 40, 0, x + 40, 0, ['#e8dcf0', '#c8b8e0', '#8a78a8']); g.fillRect(x - 40, -400, 80, GY + 400); box(g, x - 60, GY - 60, 120, 60, '#b8a8d0', 4, 5); } });
  layer(g, cam, 0.9, g => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 600, ['#5a4a7a', '#2a1a40']); g.fillRect(-E.W * 3, GY, E.W * 7, E.H); g.strokeStyle = alpha('#fff', 0.08); g.lineWidth = 3; for (let i = -30; i < 40; i++) { g.beginPath(); g.moveTo(540 + i * 40, GY); g.lineTo(540 + i * 160, GY + 800); g.stroke(); }
    g.fillStyle = '#a8283a'; g.beginPath(); g.moveTo(480, GY); g.lineTo(600, GY); g.lineTo(760, GY + 700); g.lineTo(320, GY + 700); g.fill(); });
  return { GY };
}
export function cristal(g, x, y, s, o = {}) { const { cor = '#bfe8ff', brilho = 0.4, t = 0, morto = 0 } = o; g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -110, -40, 220, 40, '#8a7aa8', 8, 6); box(g, -80, -170, 160, 130, '#a898c8', 8, 6); box(g, -120, -190, 240, 26, '#c8b8e0', 8, 6);
  const c = mix(cor, '#6a6a74', morto), fl = Math.sin(t * 2) * 6; if (brilho > 0) glow(g, 0, -330 + fl, 360 * (0.6 + brilho), c, 0.6 * brilho);
  poly(g, [[0, -470 + fl], [70, -330 + fl], [0, -200 + fl], [-70, -330 + fl]], c); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); poly(g, [[0, -470 + fl], [70, -330 + fl], [0, -200 + fl]], alpha('#000', 0.18)); poly(g, [[0, -470 + fl], [-30, -330 + fl], [0, -230 + fl], [-60, -330 + fl]], alpha('#fff', 0.35 * (1 - morto)));
  g.restore(); }
export function chamas(g, x, y, s, t, a = 1, cor = '#ff4a1a') { if (a <= 0) return; for (let i = 0; i < 14; i++) { const ph = (t * 1.8 + i / 14) % 1, xx = x + Math.sin(i * 2.3 + t * 3) * 70 * s * (1 - ph), yy = y - ph * 300 * s; g.globalCompositeOperation = 'lighter'; circle(g, xx, yy, (40 - ph * 30) * s * a, alpha(ph < 0.4 ? '#ffe06a' : cor, 0.7 * (1 - ph) * a)); g.globalCompositeOperation = 'source-over'; } glow(g, x, y - 100 * s, 300 * s, cor, 0.6 * a); }
// ---------- biblioteca ----------
export function biblioteca(g, t, cam, o = {}) {
  layer(g, cam, 0.3, g => { g.fillStyle = linGrad(g, 0, -600, 0, GY, ['#140a1a', '#2a1a28', '#3a2430']); g.fillRect(-E.W * 3, -E.H * 2, E.W * 7, E.H * 4); for (let i = -4; i < 7; i++) estante(g, i * 300, GY - 100, 260, 900, i + 40, 0.5); veil2(g, '#140a1a', 0.45); });
  layer(g, cam, 0.7, g => { for (let i = -3; i < 6; i++) estante(g, i * 420 - 100, GY, 380, 1200, i, 1); });
  layer(g, cam, 0.9, g => { g.fillStyle = '#3a2418'; g.fillRect(-E.W * 3, GY, E.W * 7, E.H); g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 4; for (let i = -30; i < 30; i++) seg(g, [[i * 120, GY], [i * 120, GY + 800]], 4, alpha('#000', 0.25)); });
  return { GY };
}
export function estante(g, x, y, w, h, seed = 1, a = 1) { const r = rng(seed); box(g, x, y - h, w, h, '#5a3420', 4, 6); const cs = ['#c0283a', '#2a5ad8', '#3a8a4a', '#d8a030', '#8a3ab0', '#e8dcc0'];
  for (let j = 0; j < Math.floor(h / 150); j++) { const sy = y - 30 - j * 150; g.fillStyle = '#3a2014'; g.fillRect(x, sy, w, 16); for (let bx = x + 12; bx < x + w - 24;) { const bw = 16 + r() * 18, bh = 80 + r() * 50; box(g, bx, sy - bh, bw, bh, cs[Math.floor(r() * 6)], 3, 3); bx += bw + 2; } }
  if (a) { const cx = x + w / 2, cy = y - h + 60; } }
export function vela(g, x, y, t, s = 1) { box(g, x - 10 * s, y - 50 * s, 20 * s, 50 * s, '#f2ead8', 4, 3); poly(g, [[x, y - 80 * s + Math.sin(t * 17) * 3], [x + 8 * s, y - 52 * s], [x - 8 * s, y - 52 * s]], '#ffb43a'); glow(g, x, y - 64 * s, 140 * s, '#ffb43a', 0.45); }
// ---------- livro antigo ----------
export function livro(g, x, y, s, o = {}) { const { k = 1, pagina = 0, t = 0, rasgo = 0 } = o; g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -440, -300, 880, 600, '#5a2a1a', 20, 8); const pg = (sx) => { g.save(); g.scale(sx, 1); poly(g, [[0, -280], [400, -290], [410, 280], [0, 290]], '#efe2c0'); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); for (let i = 0; i < 9; i++) seg(g, [[40, -230 + i * 18 * (i > 6 ? 3 : 1)], [370, -232 + i * 18 * (i > 6 ? 3 : 1)]], 3, alpha('#7a5a3a', 0.25)); g.restore(); };
  pg(-1); pg(1); seg(g, [[0, -290], [0, 290]], 8, '#3a2014');
  if (k > 0) { g.save(); g.globalAlpha *= k; g.translate(-200, -20); circle(g, 0, 0, 120, '#efe2c0'); g.strokeStyle = '#3a2a1a'; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 120, 0, 7); g.stroke(); circle(g, -40, -18, 12, '#3a2a1a'); circle(g, 40, -18, 12, '#3a2a1a'); seg(g, [[-30, 50], [30, 50]], 6, '#3a2a1a');
    g.setLineDash([10, 10]); g.beginPath(); g.arc(0, 0, 150, 0, 7); g.strokeStyle = alpha('#7a5a3a', 0.5); g.lineWidth = 3; g.stroke(); g.setLineDash([]); text(g, 'VAZIO', 0, 210, { size: 70, color: '#3a1a0a', font: FONTS.title, alpha: pagina }); g.restore(); }
  if (rasgo > 0) { g.save(); g.translate(200, 0); g.fillStyle = '#5a2a1a'; g.beginPath(); g.moveTo(-200 + 400 * (1 - rasgo), -290); for (let i = 0; i <= 12; i++) g.lineTo(-180 + (i % 2) * 30 + 0, -290 + i * 48); g.lineTo(-200, 290); g.lineTo(210, 290); g.lineTo(210, -290); g.closePath(); g.globalAlpha = rasgo; g.fill(); g.strokeStyle = '#efe2c0'; g.lineWidth = 4; g.stroke(); g.restore(); }
  g.restore(); }
// ---------- gato laranja (o gato que você salvou) ----------
export function gato(g, x, y, s, o = {}) { const { t = 0, olhos = 0, f = 1, piscar = true } = o; g.save(); g.translate(x, y); g.scale(s * f, s); const c = '#f29a3a', d = '#c8701a';
  const rabo = Math.sin(t * 2.2) * 0.3; g.strokeStyle = INK; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(-60, -20); g.quadraticCurveTo(-150, -40 + rabo * 60, -130, -150 + rabo * 40); g.stroke(); g.strokeStyle = c; g.lineWidth = 18; g.stroke();
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -70, 86, 82, 0, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.ellipse(0, -70, 78, 74, 0, 0, 7); g.fill(); for (const dx of [-40, 0, 40]) seg(g, [[dx, -140], [dx + 6, -110]], 8, d);
  for (const sx of [-1, 1]) { poly(g, [[sx * 30, -210], [sx * 70, -260], [sx * 76, -190]], INK); poly(g, [[sx * 34, -205], [sx * 66, -248], [sx * 70, -196]], c); poly(g, [[sx * 44, -205], [sx * 64, -236], [sx * 66, -204]], '#ffb8c8'); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -160, 82, 70, 0, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.ellipse(0, -160, 74, 62, 0, 0, 7); g.fill(); for (const dx of [-22, 0, 22]) seg(g, [[dx, -218], [dx, -196]], 6, d);
  const bl = piscar && (t % 3.3) > 3.15; for (const sx of [-1, 1]) { if (bl) seg(g, [[sx * 18, -160], [sx * 42, -160]], 6, INK); else { g.fillStyle = olhos ? '#d8ff6a' : '#fff6c0'; g.beginPath(); g.ellipse(sx * 30, -162, 16, 18, 0, 0, 7); g.fill(); g.fillStyle = INK; g.beginPath(); g.ellipse(sx * 30, -162, 5, 15, 0, 0, 7); g.fill(); if (olhos) glow(g, sx * 30, -162, 60, '#d8ff6a', 0.5 * olhos); } }
  poly(g, [[-8, -136], [8, -136], [0, -126]], '#ff7a9a'); for (const sx of [-1, 1]) for (const dy of [-6, 6]) seg(g, [[sx * 20, -128 + dy * 0.3], [sx * 90, -132 + dy * 2]], 2.5, INK);
  for (const dx of [-36, 36]) { g.fillStyle = INK; g.beginPath(); g.ellipse(dx, -6, 26, 16, 0, 0, 7); g.fill(); g.fillStyle = '#ffe0c0'; g.beginPath(); g.ellipse(dx, -6, 20, 11, 0, 0, 7); g.fill(); }
  g.restore(); }
// ---------- caminhão (de frente) ----------
export function caminhao(g, x, y, s, o = {}) { const { farol = 1 } = o; g.save(); g.translate(x, y); g.scale(s, s);
  if (farol) { glow(g, -170, -150, 520, '#fff6c8', 0.7 * farol); glow(g, 170, -150, 520, '#fff6c8', 0.7 * farol); }
  box(g, -300, -620, 600, 520, '#2f6ad8', 30, 10); box(g, -250, -580, 500, 220, '#9fd8ff', 16, 8); poly(g, [[-250, -580], [-120, -580], [-250, -420]], alpha('#fff', 0.4));
  box(g, -320, -360, 640, 260, '#c8ccd4', 20, 10); for (let i = 0; i < 6; i++) seg(g, [[-200, -330 + i * 36], [200, -330 + i * 36]], 8, '#5a5e66');
  for (const sx of [-1, 1]) { circle(g, sx * 230, -200, 60, INK); circle(g, sx * 230, -200, 48, farol ? '#fffbe0' : '#555'); }
  box(g, -340, -110, 680, 70, '#3a3e46', 10, 8); for (const sx of [-1, 1]) box(g, sx * 260 - 60, -60, 120, 70, INK, 10, 0);
  g.restore(); }
// ---------- monstro gigante (silhueta), armadura, barco voador, muralha de terra ----------
export function monstro(g, x, y, s, t, choque = 0) { g.save(); g.translate(x, y); g.scale(s, s); const c = mix('#3a2a4a', '#fff6a0', choque * (Math.sin(t * 60) > 0 ? 1 : 0.3));
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -500, 300, 360, 0, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.ellipse(0, -500, 286, 346, 0, 0, 7); g.fill();
  for (const sx of [-1, 1]) { seg(g, [[sx * 150, -200], [sx * 200, 0]], 110, INK); seg(g, [[sx * 150, -200], [sx * 200, 0]], 90, c); seg(g, [[sx * 260, -600], [sx * 420, -300 + Math.sin(t * 2 + sx) * 40]], 90, INK); seg(g, [[sx * 260, -600], [sx * 420, -300 + Math.sin(t * 2 + sx) * 40]], 72, c); poly(g, [[sx * 120, -820], [sx * 200, -1000], [sx * 220, -800]], INK); }
  for (const sx of [-1, 1]) { circle(g, sx * 90, -620, 40, '#ff3a3a'); glow(g, sx * 90, -620, 120, '#ff3a3a', 0.5); }
  poly(g, [[-120, -420], [120, -420], [80, -360], [-80, -360]], INK); for (let i = 0; i < 5; i++) poly(g, [[-100 + i * 50, -420], [-80 + i * 50, -420], [-90 + i * 50, -390]], '#fff');
  g.restore(); }
export function armadura(g, x, y, s, derrete = 0, t = 0) { g.save(); g.translate(x, y); g.scale(s, s); const c = mix('#c8ccd8', '#ff7a1a', derrete); seg(g, [[0, 0], [0, -120]], 12, '#6a4a2a');
  g.save(); g.scale(1, 1 - derrete * 0.35); box(g, -70, -330, 140, 200, c, 30, 7); circle(g, 0, -380, 56, INK); circle(g, 0, -380, 48, c); g.fillStyle = INK; g.fillRect(-30, -392, 60, 12); g.restore();
  if (derrete) for (let i = 0; i < 5; i++) { const dy = ((t * 0.8 + i * 0.2) % 1) * 120 * derrete; circle(g, -50 + i * 25, -130 + dy, 10, '#ffb43a'); } g.restore(); }
export function barco(g, x, y, s, t, voa = 0) { g.save(); g.translate(x, y - voa * 260 + Math.sin(t * 2) * 10 * voa); g.rotate(Math.sin(t * 1.5) * 0.04); g.scale(s, s);
  poly(g, [[-260, -60], [260, -60], [190, 40], [-200, 40]], '#8a5a30'); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); seg(g, [[0, -60], [0, -420]], 12, INK); poly(g, [[8, -400], [220 + voa * 40, -260], [8, -100]], '#f2ead8'); g.stroke(); poly(g, [[-8, -380], [-170 - voa * 30, -220], [-8, -120]], '#e8dcc0'); g.stroke();
  g.restore(); if (voa > 0) for (let i = 0; i < 10; i++) { const ph = (t * 1.6 + i / 10) % 1; g.strokeStyle = alpha('#ffffff', 0.7 * (1 - ph)); g.lineWidth = 5; g.beginPath(); g.arc(x - 300 + ph * 600, y + 40 - i * 14, 40 + i * 4, 3.4, 5.6); g.stroke(); } }
export function muralha(g, x, y, s, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.rect(-400, -600, 800, 600); g.clip(); g.translate(0, (1 - ease.out(k)) * 520);
  for (let i = 0; i < 6; i++) box(g, -360 + i * 120, -500 + (i % 2) * 30, 120, 520, ['#b8743a', '#a8642a', '#c8844a'][i % 3], 10, 7);
  g.restore(); if (k < 1) for (let i = 0; i < 12; i++) circle(g, x - 300 + i * 55, y - 20 - ((k * 3 + i * 0.3) % 1) * 160, 16, alpha('#a8642a', 0.7)); }
export function raio(g, x0, y0, x1, y1, t, a = 1) { if (a <= 0) return; const r = rng(Math.floor(t * 20)); let px = x0, py = y0; g.lineCap = 'round'; for (let i = 1; i <= 10; i++) { const k = i / 10, nx = lerp(x0, x1, k) + (i < 10 ? (r() - 0.5) * 120 : 0), ny = lerp(y0, y1, k); seg(g, [[px, py], [nx, ny]], 22 * a, alpha('#fff6a0', 0.6 * a)); seg(g, [[px, py], [nx, ny]], 8 * a, '#ffffff'); px = nx; py = ny; } glow(g, x1, y1, 400, '#ffe23a', 0.8 * a); }
export function agua(g, x, y, s, t, a = 1) { if (a <= 0) return; for (let i = 0; i < 16; i++) { const ang = t * 3 + i * 0.39, rr2 = (90 + Math.sin(t * 4 + i) * 20) * s; circle(g, x + Math.cos(ang) * rr2, y + Math.sin(ang) * rr2 * 0.6, 14 * s * a, alpha('#6ac8ff', 0.85 * a)); } glow(g, x, y, 220 * s, '#2a9dff', 0.5 * a); }
export function lago(g, t, cam) { ceu(g, t, cam, { top: '#2a3a9a', mid: '#9a6ad0', bot: '#ffc0d8' }); montanhas(g, cam, { y: 1000 });
  layer(g, cam, 0.6, g => { FX.hills(g, { y: GY - 60, amp: 90, color: '#3a8a4a', seed: 6 }); for (let i = -8; i < 20; i++) FX.pine(g, i * 120, GY - 60 - (i % 3) * 10, 1.1, '#1f5a34'); });
  layer(g, cam, 0.9, g => { g.fillStyle = '#4ab05a'; g.fillRect(-E.W * 3, GY - 40, E.W * 7, 120); g.fillStyle = linGrad(g, 0, GY + 60, 0, GY + 700, ['#5a8ae0', '#2a3a8a']); g.beginPath(); g.ellipse(540, GY + 380, 1100, 330, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
    for (let i = 0; i < 8; i++) { g.strokeStyle = alpha('#fff', 0.25); g.lineWidth = 4; g.beginPath(); g.ellipse(540 + Math.sin(i) * 300, GY + 220 + i * 50, 120 + Math.sin(t * 2 + i) * 20, 10, 0, 0, 7); g.stroke(); } });
  return { GY };
}
