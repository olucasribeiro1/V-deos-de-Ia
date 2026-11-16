// Bunker do tio Osvaldo — série "O Que a Mamãe Sabia". Preparado de verdade: gerador, filtro de ar, baterias,
// prateleiras de comida, galões de água, beliche, primeiros socorros, máscaras, mapa e estação de rádio.
// Layout (palco 1080x1920, chão GY): prateleiras à esquerda, mapa + máscaras no centro, beliche ao fundo,
// mesa do rádio à direita, gerador/filtro no canto direito alto. bunkerSala(g, t, cam, { dark, radioOn })
import { E, V, mood, layer, linGrad, rr, seg, poly, circle, ring, glow, shade, alpha, mix, rng, noise } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

const INK = '#0b0b0d';
export const POS = { shelf: 190, crate: 150, table: 820, lamp: 520 };
const box = (g, x, y, w, h, c, r = 6, lw = 4) => { rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); };

export function tijolos(g, x, y, w, h, base, bw = 64, bh = 30) {
  g.fillStyle = base; g.fillRect(x, y, w, h); g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 2;
  for (let j = 0, yy = y; yy < y + h; yy += bh, j++) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); for (let xx = x + (j % 2 ? bw / 2 : 0); xx < x + w; xx += bw) { g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, Math.min(y + h, yy + bh)); g.stroke(); } }
}
export function lata(g, x, y, c, s = 1, label = true) { box(g, x - 20 * s, y - 52 * s, 40 * s, 52 * s, '#c9ced6', 5 * s, 3); if (label) { g.fillStyle = c; g.fillRect(x - 18 * s, y - 40 * s, 36 * s, 26 * s); } }
const CAN = ['#e0a030', '#3f9a5a', '#2f7fd0', '#d8703a', '#8a6fd0', '#e6d24a'];
// prateleira de aço cheia de comida: latas, sacos de arroz/feijão, caixas, garrafões
export function prateleira(g, x, top, w, GY, seed = 3) {
  const r = rng(seed), rows = Math.floor((GY - top) / 150);
  seg(g, [[x, top - 20], [x, GY]], 12, INK); seg(g, [[x + w, top - 20], [x + w, GY]], 12, INK);
  for (let j = 0; j < rows; j++) { const y = top + 130 + j * 150; g.fillStyle = '#5a6068'; g.fillRect(x, y, w, 14); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x, y, w, 14);
    let cx = x + 34; while (cx < x + w - 30) { const k = r();
      if (k < 0.55) { lata(g, cx, y, CAN[Math.floor(r() * CAN.length)]); if (r() < 0.5) lata(g, cx, y - 52, CAN[Math.floor(r() * CAN.length)]); cx += 46; }
      else if (k < 0.75) { box(g, cx - 28, y - 84, 56, 84, mix('#e8dcc0', '#c9b890', r()), 14, 3); g.fillStyle = CAN[Math.floor(r() * 6)]; g.fillRect(cx - 18, y - 60, 36, 24); cx += 66; }   // saco
      else if (k < 0.9) { box(g, cx - 34, y - 60, 68, 60, '#b08a5a', 4, 3); seg(g, [[cx - 34, y - 30], [cx + 34, y - 30]], 3, alpha('#000', 0.35)); cx += 78; }                        // caixa
      else { box(g, cx - 22, y - 92, 44, 92, alpha('#7fc0e8', 0.85), 12, 3); g.fillStyle = '#2f7fd0'; g.fillRect(cx - 12, y - 104, 24, 14); cx += 54; } } }                              // garrafão
}
export function galao(g, x, y, s = 1) { box(g, x - 46 * s, y - 130 * s, 92 * s, 130 * s, alpha('#6fb8e8', 0.9), 22 * s); g.fillStyle = alpha('#fff', 0.35); g.fillRect(x - 30 * s, y - 110 * s, 14 * s, 70 * s); box(g, x - 18 * s, y - 150 * s, 36 * s, 24 * s, '#2f7fd0', 5 * s, 3); }
export function gerador(g, x, y, t, on = 1) {
  const j = on ? Math.sin(t * 40) * 1.5 : 0; g.save(); g.translate(x + j, y);
  box(g, -120, -150, 240, 150, '#e0a030', 14); box(g, -100, -130, 90, 60, '#2a2d34', 8, 3); for (let i = 0; i < 4; i++) seg(g, [[-90, -118 + i * 13], [-22, -118 + i * 13]], 4, '#5a6068');
  circle(g, 50, -98, 30, INK); circle(g, 50, -98, 24, '#d9dde2'); seg(g, [[50, -98], [50 + Math.cos(-2.4 + on * 1.6 + Math.sin(t * 3) * 0.08) * 20, -98 + Math.sin(-2.4 + on * 1.6 + Math.sin(t * 3) * 0.08) * 20]], 4, '#d8342b');
  circle(g, -70, -40, 9, on ? '#5fd36a' : '#3a3d44'); if (on) glow(g, -70, -40, 40, '#5fd36a', 0.6); circle(g, -40, -40, 9, '#3a3d44');
  box(g, 20, -52, 80, 28, '#2a2d34', 6, 3); seg(g, [[-120, 0], [-120, 14]], 12, INK); seg(g, [[120, 0], [120, 14]], 12, INK);
  g.restore();
}
export function filtroAr(g, x, y, t, s = 1) {   // duto + ventilador girando
  g.save(); g.translate(x, y); g.scale(s, s);
  seg(g, [[0, -400], [0, -120]], 64, INK); seg(g, [[0, -400], [0, -120]], 54, '#9aa3ae'); for (let i = 0; i < 5; i++) seg(g, [[-27, -380 + i * 56], [27, -380 + i * 56]], 4, alpha('#000', 0.35));
  box(g, -110, -120, 220, 220, '#7d8794', 16); circle(g, 0, -10, 84, INK); circle(g, 0, -10, 76, '#2a2d34');
  g.save(); g.translate(0, -10); g.rotate(t * 9); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.fillStyle = '#c9ced6'; g.beginPath(); g.ellipse(34, 0, 36, 14, 0.4, 0, 7); g.fill(); } g.restore(); circle(g, 0, -10, 12, INK);
  g.fillStyle = '#e6d24a'; g.fillRect(-96, 70, 80, 18); g.fillStyle = INK; g.font = '900 14px Nunito'; g.textAlign = 'center'; g.fillText('AR', -56, 84);
  g.restore();
}
export function baterias(g, x, y, t) { for (let i = 0; i < 3; i++) { const bx = x + i * 74; box(g, bx, y - 80, 66, 80, '#2a2d34', 6, 3); g.fillStyle = '#d8342b'; g.fillRect(bx + 10, y - 92, 14, 14); g.fillStyle = '#3a3d44'; g.fillRect(bx + 42, y - 92, 14, 14); const lv = 0.5 + 0.4 * Math.sin(i + 1); g.fillStyle = '#5fd36a'; g.fillRect(bx + 10, y - 20 - 44 * lv, 46, 44 * lv); } }
export function beliche(g, x, y, w = 330) {
  for (const by of [y - 110, y - 330]) { box(g, x, by - 40, w, 40, '#8f9aa6', 8); box(g, x, by - 66, w, 30, '#4f7f5a', 10); box(g, x + 14, by - 84, 80, 30, '#e9edf0', 12, 3); }
  seg(g, [[x, y], [x, y - 420]], 12, INK); seg(g, [[x + w, y], [x + w, y - 420]], 12, INK);
}
export function socorros(g, x, y) { box(g, x, y, 130, 100, '#e9edf0', 10); g.fillStyle = '#d8342b'; g.fillRect(x + 52, y + 22, 26, 56); g.fillRect(x + 37, y + 37, 56, 26); }
export function mascara(g, x, y) { seg(g, [[x, y - 60], [x, y - 20]], 4, INK); circle(g, x, y, 40, INK); circle(g, x, y, 34, '#4a5a3c'); circle(g, x - 14, y - 8, 11, '#9fd8ff'); circle(g, x + 14, y - 8, 11, '#9fd8ff'); circle(g, x, y + 26, 18, INK); circle(g, x, y + 26, 13, '#7d8794'); }
export function mapa(g, x, y, w = 300, h = 210) { box(g, x, y, w, h, '#e6dcc0', 4); g.strokeStyle = alpha('#3f7f5a', 0.7); g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + w * 0.45, y + h * 0.5, 30 + i * 30, 18 + i * 20, 0.3, 0, 7); g.stroke(); } seg(g, [[x + 20, y + h - 30], [x + w * 0.4, y + h * 0.5], [x + w - 30, y + 30]], 4, '#d8342b'); circle(g, x + w * 0.4, y + h * 0.5, 9, '#d8342b'); for (const [px, py] of [[20, 14], [w - 20, 14]]) circle(g, x + px, y + py, 6, '#2f7fd0'); }
// rádio militar antigo (s = escala). on: 0..1, voz: 0..1 (transmissão), t = tempo
export function radio(g, x, y, s, t, o = {}) {
  const { on = 1, voz = 0 } = o; g.save(); g.translate(x, y); g.scale(s, s);
  seg(g, [[70, -150], [110, -330]], 6, INK); circle(g, 110, -332, 7, INK);
  box(g, -130, -150, 260, 150, '#55623a', 12); box(g, -112, -134, 110, 76, '#1c1e24', 8, 3);
  for (let i = 0; i < 5; i++) seg(g, [[-100, -122 + i * 13], [-14, -122 + i * 13]], 4, '#3a3d44');
  box(g, 14, -134, 100, 46, on ? '#d9c880' : '#3a3d44', 6, 3); if (on) { glow(g, 64, -111, 90, '#f0d880', 0.5); const nd = 20 + 60 * (0.5 + 0.5 * noise(t * 1.4, 2)); seg(g, [[14 + nd, -130], [14 + nd, -92]], 3, '#d8342b'); for (let i = 0; i < 9; i++) seg(g, [[22 + i * 10.5, -100], [22 + i * 10.5, -92]], 2, INK); }
  for (const kx of [34, 90]) { circle(g, kx, -52, 20, INK); circle(g, kx, -52, 15, '#9aa3ae'); seg(g, [[kx, -52], [kx + Math.cos(t * (kx > 50 ? 1.6 : 0.4) * on) * 12, -52 + Math.sin(t * (kx > 50 ? 1.6 : 0.4) * on) * 12]], 4, INK); }
  circle(g, -100, -36, 8, on ? (voz > 0.2 ? '#d8342b' : '#5fd36a') : '#3a3d44'); if (on) glow(g, -100, -36, 34, voz > 0.2 ? '#d8342b' : '#5fd36a', 0.7);
  g.restore();
}
// onda sonora (estática fina / voz forte) — desenhe por cima
export function onda(g, x, y, w, t, o = {}) { const { amp = 20, color = '#e6d24a', lw = 5, seed = 1 } = o; g.strokeStyle = INK; g.lineWidth = lw + 6; g.lineCap = 'round'; g.lineJoin = 'round'; for (let pass = 0; pass < 2; pass++) { g.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, env = Math.sin(u * Math.PI), yy = y + noise(u * 22 + t * 26, seed) * amp * env; i ? g.lineTo(x + u * w, yy) : g.moveTo(x + u * w, yy); } g.stroke(); g.strokeStyle = color; g.lineWidth = lw; } }

export function bunkerSala(g, t, cam, o = {}) {
  const { dark = 0, radioOn = 0, voz = 0, gen = 1, lamp = 1 } = o; const M = mood('interiorWarm'), CX = E.W / 2, GY = E.H * V(0.8, 0.68);
  const sw = Math.sin(t * 1.25) * 0.11, lx = POS.lamp + Math.sin(sw) * 260, ly = 250 + Math.cos(sw) * 260;
  layer(g, cam, 0.6, g => {
    tijolos(g, -E.W, -E.H, E.W * 3, E.H * 3, '#8a5440', 96, 44);
    g.fillStyle = '#3d4652'; g.fillRect(-E.W, 150, E.W * 3, 40); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(-E.W, 150, E.W * 3, 40);   // viga do teto
    seg(g, [[-200, 215], [E.W + 200, 215]], 16, INK); seg(g, [[-200, 215], [E.W + 200, 215]], 9, '#c0683f');                                       // cano
    beliche(g, 395, GY - 20, 300); mapa(g, 400, GY - 800); mascara(g, 760, GY - 760); mascara(g, 860, GY - 760); socorros(g, 730, GY - 640);
    filtroAr(g, 960, 620, t, 0.8);
  });
  layer(g, cam, 0.85, g => {
    g.fillStyle = '#5a5f66'; g.fillRect(-E.W, GY, E.W * 3, E.H); FX.floorLines(g, GY, E.H * 1.3, 'rgba(0,0,0,.3)', 0.09);
    prateleira(g, 30, GY - 760, 330, GY, 7);
    galao(g, 430, GY + 6, 0.9); galao(g, 520, GY + 6, 0.9);
    // mesa do rádio + baterias embaixo
    box(g, 690, GY - 200, 330, 22, '#9a6a4c', 4); seg(g, [[710, GY - 178], [710, GY]], 14, INK); seg(g, [[1000, GY - 178], [1000, GY]], 14, INK);
    baterias(g, 740, GY, t); radio(g, POS.table, GY - 200, 0.8, t, { on: radioOn, voz });
    gerador(g, 1010, GY + 150, t, gen);
  });
  // lampião de emergência balançando
  layer(g, cam, 0.9, g => { seg(g, [[POS.lamp, 190], [lx, ly]], 5, INK); box(g, lx - 30, ly, 60, 26, '#3d4652', 6, 3); circle(g, lx, ly + 44, 26, INK); circle(g, lx, ly + 44, 21, mix('#3a3d44', '#ffe9a8', lamp)); if (lamp) { glow(g, lx, ly + 44, 520, '#ffd98a', 0.34 * lamp); FX.lightCone(g, lx, ly + 50, { spread: 0.75, len: 1300, color: '#ffe2a8', a: 0.13 * lamp }); } });
  if (dark > 0) { g.save(); g.fillStyle = alpha('#05070c', dark); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
  return { GY, M, CX, lx, ly };
}
// caixote pra sentar (desenhe antes da figura)
export function caixote(g, x, GY, w = 150, h = 96) { box(g, x - w / 2, GY - h, w, h, '#b08a5a', 6); seg(g, [[x - w / 2, GY - h / 2], [x + w / 2, GY - h / 2]], 4, alpha('#000', 0.35)); seg(g, [[x - w / 2 + 16, GY - h], [x + w / 2 - 16, GY]], 4, alpha('#000', 0.3)); }
