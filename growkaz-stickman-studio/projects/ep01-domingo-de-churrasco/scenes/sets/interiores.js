// Cozinha da casa (com janela para o quintal) e interior do bunker.
import { E, V, mood, layer, linGrad, rr, seg, poly, circle, glow, shade, alpha, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { tijolos } from './quintal.js';

export function cozinha(g, t, cam, o = {}) {
  const { white = 0 } = o; const M = mood('interiorCool'), D = mood('day'), CX = E.W / 2, GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.6, g => {
    g.fillStyle = shade(M.wall, 0.05); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.strokeStyle = alpha('#000', 0.28); g.lineWidth = 2;   // azulejo até meia parede
    for (let y = GY - 560; y <= GY - 150; y += 82) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    for (let x = -E.W; x < E.W * 2; x += 82) { g.beginPath(); g.moveTo(x, GY - 560); g.lineTo(x, GY - 150); g.stroke(); }
    // janela para o quintal
    const wx = 150, wy = GY - 1080, ww = 520, wh = 420;
    g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, D.sky.map(c => mix(c, '#fff', white))); g.fillRect(wx, wy, ww, wh);
    tijolos(g, wx, wy + wh - 130, ww, 130, mix(shade(D.wall, 0), '#fff', white * 0.4), 60, 28);
    g.strokeStyle = '#0b0b0d'; g.lineWidth = 3; g.beginPath(); g.moveTo(wx, wy + 150); g.quadraticCurveTo(wx + ww / 2, wy + 190, wx + ww, wy + 140); g.stroke();
    g.fillStyle = '#0b0b0d'; g.fillRect(wx + ww / 2 - 6, wy, 12, wh); g.strokeStyle = '#0b0b0d'; g.lineWidth = 16; g.strokeRect(wx, wy, ww, wh);
    FX.godRays(g, wx + ww / 2, wy + wh / 2, { color: D.key, a: 0.07 + 0.2 * white, len: 1000 });
    // geladeira
    g.fillStyle = shade(M.wall, 0.35); rr(g, 790, GY - 640, 250, 640, 14); g.fill(); g.strokeStyle = '#0b0b0d'; g.lineWidth = 5; g.stroke(); seg(g, [[790, GY - 420], [1040, GY - 420]], 5, '#0b0b0d'); seg(g, [[815, GY - 500], [815, GY - 450]], 7, '#0b0b0d'); seg(g, [[815, GY - 380], [815, GY - 280]], 7, '#0b0b0d');
  });
  layer(g, cam, 0.9, g => { g.fillStyle = M.floor; g.fillRect(-E.W, GY, E.W * 3, E.H); FX.floorLines(g, GY, E.H * 1.3, 'rgba(0,0,0,.28)', 0.08); });
  return { GY, M, CX };
}
// bancada na frente do personagem (desenhe depois da figura)
export function bancada(g, GY, M, x0 = -200, x1 = 700) {
  g.fillStyle = shade(M.wall, -0.3); g.fillRect(x0, GY - 190, x1 - x0, 260); g.fillStyle = shade(M.wall, 0.3); g.fillRect(x0, GY - 212, x1 - x0 + 20, 26);
  g.strokeStyle = '#0b0b0d'; g.lineWidth = 5; g.strokeRect(x0, GY - 212, x1 - x0 + 20, 26);
}
export function bunker(g, t, cam, o = {}) {
  const { open = 1, white = 0 } = o; const M = mood('void'), CX = E.W / 2, GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.7, g => {
    tijolos(g, -E.W, -E.H, E.W * 3, E.H * 3, shade(M.wall, 0.12), 96, 44);
    g.fillStyle = alpha('#000', 0.55); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // abertura do alçapão no teto + escada
    const hx = CX - 190, hy = 250, hw = 380, hh = 250, k = open;
    g.fillStyle = '#050506'; g.fillRect(hx - 20, hy - 20, hw + 40, hh + 40);
    if (k > 0) { const lw = hw * k; g.fillStyle = mix('#cfd6e0', '#ffffff', white); g.fillRect(hx + hw - lw, hy, lw, hh);
      g.save(); g.globalCompositeOperation = 'lighter'; const a = (0.22 + 0.5 * white) * Math.min(1, k * 3);
      g.fillStyle = linGrad(g, 0, hy + hh, 0, GY + 200, [alpha('#ffffff', a), alpha('#ffffff', 0)]); poly(g, [[hx + hw - lw, hy + hh], [hx + hw, hy + hh], [hx + hw + 260, GY + 200], [hx + hw - lw - 260 * k, GY + 200]], g.fillStyle); g.restore(); }
    seg(g, [[CX - 70, hy + hh], [CX - 70, GY]], 12, '#0b0b0d'); seg(g, [[CX + 70, hy + hh], [CX + 70, GY]], 12, '#0b0b0d');
    for (let y = hy + hh + 60; y < GY; y += 90) seg(g, [[CX - 70, y], [CX + 70, y]], 10, '#0b0b0d');
  });
  layer(g, cam, 0.9, g => { g.fillStyle = M.floor; g.fillRect(-E.W, GY, E.W * 3, E.H); });
  return { GY, M, CX };
}
