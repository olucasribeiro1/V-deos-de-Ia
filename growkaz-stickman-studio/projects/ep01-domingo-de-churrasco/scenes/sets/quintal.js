// Quintal de casa brasileira: muro de tijolo aparente, portão de garagem, varal, caixa d'água, churrasqueira de tijolo.
// o.white (0..1) clareia o céu "do jeito errado"; o.hatch (0..1) abre o alçapão no depósito de carvão; o.gate (0..1) abre o portão.
import { E, V, mood, layer, linGrad, rr, seg, poly, circle, glow, shade, alpha, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const GRILL_X = 800, GATE_X = 60;

export function tijolos(g, x, y, w, h, base, bw = 64, bh = 30) {
  g.fillStyle = base; g.fillRect(x, y, w, h); g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 2;
  for (let j = 0, yy = y; yy < y + h; yy += bh, j++) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); for (let xx = x + (j % 2 ? bw / 2 : 0); xx < x + w; xx += bw) { g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, Math.min(y + h, yy + bh)); g.stroke(); } }
}
export function fumaca(g, t, x, y, o = {}) {
  const { n = 9, rise = 420, color = '#c9ccd2', a = 0.22, spread = 60 } = o; const r = rng(31);
  for (let i = 0; i < n; i++) { const ph = (t * 0.22 + r()) % 1, sx = (r() - 0.5) * spread; circle(g, x + sx * ph + Math.sin(t * 0.8 + i) * 14 * ph, y - ph * rise, 18 + ph * 60, alpha(color, a * (1 - ph))); }
}
export function churrasqueira(g, t, x, GY, M, o = {}) {
  const { hatch = 0, fire = 1, smoke = true } = o; const br = shade(M.wall, 0.06);
  // chaminé + corpo
  tijolos(g, x - 60, GY - 620, 120, 260, shade(br, -0.12), 40, 26);
  g.fillStyle = '#0b0b0d'; g.fillRect(x - 78, GY - 640, 156, 24);
  poly(g, [[x - 150, GY - 300], [x + 150, GY - 300], [x + 60, GY - 370], [x - 60, GY - 370]], shade(br, -0.2));
  tijolos(g, x - 150, GY - 300, 300, 300, br, 50, 28);
  g.strokeStyle = '#0b0b0d'; g.lineWidth = 5; g.strokeRect(x - 150, GY - 300, 300, 300);
  // boca com brasa
  g.fillStyle = '#0b0b0d'; rr(g, x - 115, GY - 275, 230, 110, 10); g.fill();
  if (fire > 0) { glow(g, x, GY - 190, 150, M.practical, 0.5 * fire); for (let i = 0; i < 7; i++) circle(g, x - 84 + i * 28, GY - 180 + Math.sin(t * 5 + i) * 2, 9, mix('#e8a04a', '#fff0c0', 0.5 + 0.5 * Math.sin(t * 6 + i * 2))); }
  g.strokeStyle = shade(M.wall, 0.5); g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(x - 110 + i * 27.5, GY - 205); g.lineTo(x - 110 + i * 27.5, GY - 198); g.stroke(); } seg(g, [[x - 115, GY - 202], [x + 115, GY - 202]], 4, shade(M.wall, 0.5));
  // depósito de carvão (porta de metal embaixo) -> alçapão
  const dx = x - 110, dy = GY - 140, dw = 220, dh = 132;
  g.fillStyle = '#050506'; g.fillRect(dx, dy, dw, dh);
  if (hatch > 0) { g.fillStyle = linGrad(g, 0, dy, 0, dy + dh, ['#000', alpha(M.practical, 0.25 * hatch)]); g.fillRect(dx, dy, dw, dh); for (let i = 0; i < 4; i++) seg(g, [[dx + 50, dy + 30 + i * 28], [dx + dw - 50, dy + 30 + i * 28]], 5, alpha('#8a8f98', 0.7 * hatch)); }
  const ow = dw * (1 - 0.82 * hatch);
  g.fillStyle = shade(M.wall, -0.25); g.fillRect(dx, dy, ow, dh); g.strokeStyle = '#0b0b0d'; g.lineWidth = 5; g.strokeRect(dx, dy, ow, dh);
  if (hatch < 0.6) { g.fillStyle = alpha('#fff', 0.75); g.font = '900 24px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CARVÃO', dx + ow / 2, dy + 46); circle(g, dx + ow - 22, dy + dh / 2, 7, '#0b0b0d'); }
  if (smoke) fumaca(g, t, x, GY - 640);
}
export function quintal(g, t, cam, o = {}) {
  const { hatch = 0, gate = 0, fire = 1, smoke = true, moodName = 'day' } = o; const white = 0.16 + 0.84 * (o.white || 0);   // dia claro de base
  const M = mood(moodName), CX = E.W / 2, GY = E.H * V(0.8, 0.68);
  const W = (c) => mix(c, '#ffffff', white);
  layer(g, cam, 0.12, g => { g.fillStyle = linGrad(g, 0, -200, 0, GY, M.sky.map(W)); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.clouds(g, { y: 200, h: 420, a: 0.16 * (1 - white), count: 7 });
    if (white > 0) glow(g, CX - 120, 160, 900 + 700 * white, '#ffffff', 0.85 * white); });
  layer(g, cam, 0.4, g => {   // casas vizinhas + caixa d'água + antena
    const r = rng(8), c = W(shade(M.wall, -0.18));
    for (let i = -2; i < 8; i++) { const x = i * 210 + r() * 40, h = 260 + r() * 300; g.fillStyle = shade(c, (r() - 0.5) * 0.12); g.fillRect(x, GY - 520 - h, 220, h + 200);
      g.fillStyle = alpha('#0b0b0d', 0.55); g.fillRect(x + 40, GY - 470 - h + 70, 46, 56); g.fillRect(x + 130, GY - 470 - h + 70, 46, 56); }
    g.fillStyle = W('#6f8494'); rr(g, 590, GY - 1150, 150, 110, 16); g.fill(); g.strokeStyle = '#0b0b0d'; g.lineWidth = 5; g.stroke(); seg(g, [[615, GY - 1040], [615, GY - 980]], 6, '#0b0b0d'); seg(g, [[715, GY - 1040], [715, GY - 980]], 6, '#0b0b0d');
    seg(g, [[260, GY - 1010], [260, GY - 1160]], 4, '#0b0b0d'); seg(g, [[230, GY - 1140], [290, GY - 1140]], 4, '#0b0b0d'); seg(g, [[240, GY - 1110], [280, GY - 1110]], 4, '#0b0b0d');
  });
  layer(g, cam, 0.6, g => {   // muro + portão + varal
    tijolos(g, -E.W, GY - 520, E.W * 3, 520, mix(shade(M.wall, 0.02), '#ffffff', white * 0.35), 78, 36);
    g.fillStyle = shade(M.wall, 0.3); g.fillRect(-E.W, GY - 540, E.W * 3, 24);
    // portão de garagem (chapa)
    const gx = GATE_X, gw = 300, gh = 470; g.fillStyle = '#060607'; g.fillRect(gx, GY - gh, gw, gh);
    if (gate > 0) { g.fillStyle = W(alpha(M.sky[2] || M.sky[1], 0.9)); g.fillRect(gx, GY - gh, gw, gh); g.fillStyle = W(shade(M.road, 0.1)); g.fillRect(gx, GY - 90, gw, 90); }
    const lw = gw * (1 - 0.86 * gate); g.fillStyle = shade(M.dark, 0.35); g.fillRect(gx, GY - gh, lw, gh);
    g.strokeStyle = alpha('#000', 0.45); g.lineWidth = 3; for (let i = 1; i < 8; i++) { const xx = gx + (lw * i) / 8; g.beginPath(); g.moveTo(xx, GY - gh); g.lineTo(xx, GY); g.stroke(); }
    g.strokeStyle = '#0b0b0d'; g.lineWidth = 8; g.strokeRect(gx, GY - gh, gw, gh);
    // varal com roupa
    g.strokeStyle = '#0b0b0d'; g.lineWidth = 3; g.beginPath(); g.moveTo(-100, GY - 700); g.quadraticCurveTo(CX, GY - 640, E.W + 100, GY - 720); g.stroke();
    const cl = [[430, '#b9c0c8', 70, 90], [520, '#8f9aa6', 56, 120], [600, '#d9d6cc', 84, 70], [705, '#6f7a88', 60, 100]];
    for (const [x, c, w, h] of cl) { const y = GY - 668 - (x - 540) * 0.02, sw = Math.sin(t * 1.6 + x) * 6; poly(g, [[x, y], [x + w, y], [x + w + sw, y + h], [x + sw, y + h]], W(c)); g.strokeStyle = '#0b0b0d'; g.lineWidth = 3; g.stroke(); }
  });
  layer(g, cam, 0.9, g => {   // chão de cimento
    g.fillStyle = mix(M.floor, '#ffffff', white * 0.3); g.fillRect(-E.W, GY, E.W * 3, E.H);
    FX.floorLines(g, GY, E.H * 1.3, 'rgba(0,0,0,.22)', 0.09);
    churrasqueira(g, t, GRILL_X, GY, M, { hatch, fire, smoke });
  });
  return { GY, M, CX };
}
// Bilu, o cachorro (branco com contorno, como todo mundo). run: 0..1, sausage: linguiça na boca
export function bilu(g, o = {}) {
  const { x, y, s = 1, facing = 1, t = 0, run = 0, sausage = false } = o; const INK = '#0b0b0d', W = '#f1efe9', ph = t * (run ? 16 : 3);
  g.save(); g.translate(x, y - (run ? Math.abs(Math.sin(ph)) * 10 * s : 0)); g.scale(s * facing, s); g.lineCap = 'round';
  const leg = (lx, a) => { const dx = Math.sin(ph + a) * (run ? 22 : 2); seg(g, [[lx, -34], [lx + dx, 0]], 13, INK); seg(g, [[lx, -34], [lx + dx, 0]], 7, W); };
  leg(-30, 0); leg(26, 3.1); leg(-22, 1.6); leg(34, 4.7);
  seg(g, [[-44, -52], [-70, -82 + Math.sin(t * 14) * 10]], 13, INK); seg(g, [[-44, -52], [-70, -82 + Math.sin(t * 14) * 10]], 7, W);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -50, 54, 30, 0, 0, 7); g.fill(); g.fillStyle = W; g.beginPath(); g.ellipse(0, -50, 50, 26, 0, 0, 7); g.fill();
  circle(g, 52, -78, 31, INK); circle(g, 52, -78, 27, W);
  g.fillStyle = INK; g.beginPath(); g.ellipse(34, -98, 12, 20, -0.5, 0, 7); g.fill();                      // orelha
  g.fillStyle = INK; g.beginPath(); g.ellipse(80, -70, 17, 13, 0, 0, 7); g.fill(); g.fillStyle = W; g.beginPath(); g.ellipse(79, -70, 13, 9.5, 0, 0, 7); g.fill();   // focinho
  circle(g, 92, -74, 5, INK); circle(g, 58, -86, 4.5, INK);
  if (sausage) { seg(g, [[78, -60], [104, -52], [124, -60]], 17, INK); seg(g, [[78, -60], [104, -52], [124, -60]], 11, '#a5603f'); }
  g.restore();
}
