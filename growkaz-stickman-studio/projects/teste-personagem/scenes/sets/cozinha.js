// Cozinha simples à noite: azulejos, janela com vista da favela, bancada, galão e copos.
import { E, V, mood, layer, linGrad, rr, seg, poly, circle, glow, shade, alpha } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function cozinha(g, t, cam) {
  const M = mood('night'), CX = E.W / 2, GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.6, g => {
    g.fillStyle = shade(M.wall, -0.1); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // azulejos
    g.strokeStyle = alpha('#000', 0.35); g.lineWidth = 2;
    for (let y = GY - 520; y < GY - 150; y += 70) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    for (let x = -E.W; x < E.W * 2; x += 70) { g.beginPath(); g.moveTo(x, GY - 520); g.lineTo(x, GY - 150); g.stroke(); }
    // janela com a favela
    const wx = CX - 330, wy = GY - 1050, ww = 520, wh = 440;
    g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, M.sky); g.fillRect(wx, wy, ww, wh);
    const r = (i) => (Math.sin(i * 91.7) * 0.5 + 0.5);
    for (let i = 0; i < 14; i++) { const bx = wx + i * 40 - 10, bh = 120 + r(i) * 160; g.fillStyle = shade(M.dark, 0.05); g.fillRect(bx, wy + wh - bh, 46, bh);
      for (let k = 0; k < 3; k++) if (r(i * 7 + k) > 0.55) { g.fillStyle = alpha(M.practical, 0.75); g.fillRect(bx + 10 + k * 10, wy + wh - bh + 20 + k * 30, 8, 10); } }
    seg(g, [[wx, wy + 90], [wx + ww * 0.5, wy + 120], [wx + ww, wy + 80]], 2, '#000');
    g.strokeStyle = '#0b0b0d'; g.lineWidth = 16; g.strokeRect(wx, wy, ww, wh);
    FX.godRays(g, wx + ww * 0.5, wy + wh * 0.5, { color: M.key, a: 0.06, len: 900 });
  });
  layer(g, cam, 0.85, g => {
    g.fillStyle = M.floor; g.fillRect(-E.W, GY, E.W * 3, E.H);
    FX.floorLines(g, GY, E.H * 1.2, 'rgba(0,0,0,.3)');
    // bancada atrás do personagem
    const by = GY - 150; g.fillStyle = shade(M.wall, -0.35); g.fillRect(-E.W, by, E.W * 1.55 + 60, 150);
    g.fillStyle = shade(M.wall, 0.12); g.fillRect(-E.W, by - 16, E.W * 1.55 + 60, 18);
    // copos
    for (let i = 0; i < 5; i++) { const x = 80 + i * 70; rr(g, x, by - 70, 44, 54, 4); g.fillStyle = alpha('#e8eef6', 0.25); g.fill(); g.strokeStyle = '#0b0b0d'; g.lineWidth = 3; g.stroke();
      g.fillStyle = alpha('#9fb2c8', 0.45); g.fillRect(x + 3, by - 40 + i * 4, 38, 22 - i * 4); }
    // botijão
    g.fillStyle = shade(M.wall, -0.2); rr(g, 60, GY - 120, 100, 120, 30); g.fill(); g.strokeStyle = '#0b0b0d'; g.lineWidth = 4; g.stroke();
  });
  FX.pool(g, CX + 120, GY + 10, 260, 40, M.key, 0.12);
  return { GY, M, CX };
}
