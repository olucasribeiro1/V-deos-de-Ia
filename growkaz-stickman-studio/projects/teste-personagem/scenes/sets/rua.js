// Rua da comunidade à noite: casas de tijolo, fios emaranhados, poste com luz amarela fraca.
import { E, V, mood, layer, linGrad, seg, shade, alpha, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function rua(g, t, cam) {
  const M = mood('night'), CX = E.W / 2, GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.15, g => { g.fillStyle = linGrad(g, 0, 0, 0, GY, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.stars(g, t, { count: 40, color: '#cfd4de' }); });
  layer(g, cam, 0.5, g => {
    const r = rng(21);
    for (let i = -3; i < 10; i++) { const x = i * 190 + r() * 30, h = 380 + r() * 420, w = 200; FX.facade(g, { x, y: GY - h - 120, w, h: h + 120, color: shade(M.wall, (r() - 0.5) * 0.15), win: M.practical, dark: M.dark, cols: 2, rows: 3, lit: 0.35, seed: i + 30 }); }
  });
  layer(g, cam, 0.8, g => {
    g.fillStyle = M.road; g.fillRect(-E.W, GY, E.W * 3, E.H);
    g.fillStyle = shade(M.road, 0.08); g.fillRect(-E.W, GY, E.W * 3, 40);
    FX.lampPost(g, CX + 330, GY + 10, 760, { color: '#0b0b0d', light: M.practical, a: 0.2 });
    // fios
    const r = rng(5);
    for (let k = 0; k < 9; k++) { const y0 = GY - 820 + r() * 160, y1 = GY - 840 + r() * 200, sag = 60 + r() * 120;
      g.strokeStyle = alpha('#060607', 0.85); g.lineWidth = 2 + r() * 2; g.beginPath(); g.moveTo(-200, y0); g.quadraticCurveTo(CX, Math.max(y0, y1) + sag, E.W + 200, y1); g.stroke(); }
  });
  FX.fog(g, GY - 200, 300, M.fog, 0.25);
  return { GY, M, CX };
}
