// Objetos e visões da série (Ep. 3+): periscópio, visão pelo periscópio, crachá, tablet, mochila, foto, sombra da criatura, almoço de domingo.
import { E, S, rr, seg, poly, circle, ring, glow, alpha, mix, rng, noise, ease, prog, clamp, lerp, text, FONTS, veil } from '/engine/core.js';
import { drawFigure, POSES, breathe } from '/engine/rig2d.js';
const INK = '#0b0b0d', WH = '#f1efe9';
const box = (g, x, y, w, h, c, r = 8, lw = 5) => { rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); };

// periscópio pendurado no teto; desce (k 0..1) até a altura do olho
export function periscopio(g, x, k = 1, topo = 150) {
  const y1 = lerp(topo + 160, topo + 640, ease.inOut(k));
  seg(g, [[x, topo], [x, y1]], 54, INK); seg(g, [[x, topo], [x, y1]], 42, '#7d8794'); for (let y = topo + 40; y < y1 - 30; y += 70) seg(g, [[x - 21, y], [x + 21, y]], 4, alpha('#000', 0.3));
  box(g, x - 60, y1 - 10, 130, 80, '#55623a', 14); box(g, x + 50, y1 + 6, 46, 46, '#1c1e24', 10, 4); circle(g, x + 73, y1 + 29, 12, '#9fd8ff');
  seg(g, [[x - 60, y1 + 30], [x - 110, y1 + 30]], 14, INK); seg(g, [[x + 70, y1 + 60], [x + 110, y1 + 80]], 14, INK);
  return { olhoX: x + 96, olhoY: y1 + 29 };
}
// visão pelo periscópio: círculo, mira, borda escura; desenhaCena(g) pinta o mundo de fora
export function visorPeriscopio(g, t, desenhaCena, o = {}) {
  const { r = 430, cx = 540, cy = 900 } = o;
  g.fillStyle = '#020203'; g.fillRect(-200, -200, E.W + 400, E.H + 400);
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); desenhaCena(g);
  const v = g.createRadialGradient(cx, cy, r * 0.55, cx, cy, r); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = v; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.strokeStyle = 'rgba(200,255,200,.35)'; g.lineWidth = 3; seg(g, [[cx - r, cy], [cx + r, cy]], 3, 'rgba(200,255,200,.35)'); seg(g, [[cx, cy - r], [cx, cy + r]], 3, 'rgba(200,255,200,.35)');
  for (let i = -4; i <= 4; i++) { if (!i) continue; seg(g, [[cx + i * 70, cy - 12], [cx + i * 70, cy + 12]], 3, 'rgba(200,255,200,.35)'); seg(g, [[cx - 12, cy + i * 70], [cx + 12, cy + i * 70]], 3, 'rgba(200,255,200,.35)'); }
  g.restore(); ring(g, cx, cy, r + 14, 30, INK); ring(g, cx, cy, r + 2, 6, '#3a3d44');
}
// crachá militar com a foto da mãe
export function cracha(g, x, y, s, o = {}) {
  const { nome = 'DRA. MARIANA', setor = ['LABORATÓRIO DE', 'BIOSSEGURANÇA'], foto = null } = o; const ui = S().ui;
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.05);
  seg(g, [[0, -330], [0, -230]], 16, '#2f4f7a'); box(g, -40, -250, 80, 40, '#c9ced6', 8, 4);
  box(g, -210, -220, 420, 560, '#f1efe9', 26, 8); rr(g, -210, -220, 420, 110, 26); g.fillStyle = '#4c5a30'; g.fill(); g.fillRect(-210, -150, 420, 40);
  text(g, 'EXÉRCITO', 0, -168, { size: 44, color: '#e6dcc0', font: FONTS.ui, weight: 900, spacing: 6 });
  box(g, -110, -90, 220, 230, '#c9d6e0', 10, 5); if (foto) { g.save(); g.beginPath(); g.rect(-110, -90, 220, 230); g.clip(); foto(g, 0, 40); g.restore(); }
  text(g, nome, 0, 185, { size: 40, color: '#16181d', font: FONTS.ui, weight: 900 }); setor.forEach((l, i) => text(g, l, 0, 232 + i * 34, { size: 28, color: '#4a4f58', font: FONTS.ui, weight: 900 }));
  rr(g, -170, 296, 340, 34, 8); g.fillStyle = ui.accent; g.fill(); text(g, 'ACESSO RESTRITO', 0, 314, { size: 26, color: '#fff', font: FONTS.ui, weight: 900, spacing: 4 });
  g.restore();
}
// tablet trancado (cadeado pulsando)
export function tablet(g, x, y, s, t, o = {}) {
  const { tremor = 0 } = o; const j = tremor ? noise(t * 30, 3) * 8 * tremor : 0;
  g.save(); g.translate(x + j, y); g.scale(s, s); g.rotate(0.04);
  box(g, -230, -330, 460, 660, '#1c1e24', 36, 10); rr(g, -205, -300, 410, 600, 18); g.fillStyle = '#0e1626'; g.fill(); glow(g, 0, -40, 300, '#5f8fd0', 0.25);
  const p = 1 + 0.06 * Math.sin(t * 5); g.save(); g.translate(0, -60); g.scale(p, p);
  g.strokeStyle = WH; g.lineWidth = 18; g.beginPath(); g.arc(0, -40, 55, Math.PI, 0); g.stroke(); rr(g, -85, -40, 170, 140, 20); g.fillStyle = WH; g.fill(); circle(g, 0, 20, 16, '#0e1626'); seg(g, [[0, 20], [0, 60]], 10, '#0e1626'); g.restore();
  for (let i = 0; i < 6; i++) circle(g, -100 + i * 40, 170, 12, i < 2 ? WH : alpha(WH, 0.25));
  text(g, 'ACESSO NEGADO', 0, 240, { size: 34, color: S().ui.accent, font: FONTS.ui, weight: 900, spacing: 3 });
  g.restore();
}
export function mochila(g, x, y, s = 1, aberta = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); box(g, -70, -150, 140, 150, '#3d4a5c', 30); box(g, -50, -70, 100, 60, '#33404f', 14, 4);
  if (aberta > 0) { rr(g, -66, -170 - 20 * aberta, 132, 40, 18); g.fillStyle = '#2a3442'; g.fill(); } else box(g, -70, -170, 140, 50, '#33404f', 22, 4);
  seg(g, [[-40, -150], [-50, -200], [50, -200], [40, -150]], 8, INK); g.restore();
}
// porta-retrato
export function foto(g, x, y, w, h, desenha, o = {}) { const { sepia = true, rot = 0.04 } = o; g.save(); g.translate(x, y); g.rotate(rot); box(g, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, '#8a5a3a', 6, 6); rr(g, -w / 2, -h / 2, w, h, 2); g.fillStyle = sepia ? '#d8c8a0' : '#c9d6e0'; g.fill(); g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); desenha(g); g.restore(); g.restore(); }
// sombra da criatura: alta, magra, curvada, braços longos demais — sempre vaga, parcialmente escondida
export function sombraCriatura(g, x, y, s, t, o = {}) {
  const { a = 0.92, cor = '#101012' } = o; const sw = Math.sin(t * 2.2) * 0.08;
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a; g.lineCap = 'round'; g.lineJoin = 'round'; g.filter = 'blur(2px)';
  const L = (pts, w) => seg(g, pts, w, cor);
  L([[0, -260], [-10, -150], [0, -40]], 40);                                            // tronco curvado
  L([[-10, -150], [40, -100 + sw * 100], [70, -10], [80, 60]], 20); L([[70, -10], [100, 40]], 10); L([[70, -10], [55, 55]], 10);   // braço longo até o chão
  L([[-10, -150], [-60, -90 - sw * 80], [-70, 0], [-60, 70]], 18);
  L([[0, -40], [30, 40], [20, 140]], 22); L([[0, -40], [-30, 50], [-50, 140]], 22);   // pernas
  g.fillStyle = cor; g.beginPath(); g.ellipse(25, -300, 36, 58, 0.5, 0, 7); g.fill();     // cabeça alongada
  g.filter = 'none'; g.restore();
}
// almoço de domingo (flashback): mesa com toalha xadrez, travessa, guaraná, pessoas em volta
export function mesaDomingo(g, x, y, w = 760) {
  rr(g, x - w / 2 - 6, y - 6, w + 12, 44, 8); g.fillStyle = INK; g.fill();
  g.save(); g.beginPath(); g.rect(x - w / 2, y, w, 160); g.clip(); for (let i = 0; i < 20; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) { g.fillStyle = alpha('#c0563a', 0.85); g.fillRect(x - w / 2 + i * 40, y + j * 40, 40, 40); } else { g.fillStyle = '#efe8d0'; g.fillRect(x - w / 2 + i * 40, y + j * 40, 40, 40); } g.restore();
  g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(x - w / 2, y, w, 160);
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, y - 8, 120, 34, 0, 0, 7); g.fill(); g.fillStyle = '#e9edf0'; g.beginPath(); g.ellipse(x, y - 10, 110, 28, 0, 0, 7); g.fill();
  for (let i = 0; i < 4; i++) { rr(g, x - 70 + i * 40, y - 44, 22, 44, 6); g.fillStyle = '#a5603f'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); }
  for (const bx of [x - 260, x + 250]) { rr(g, bx - 18, y - 120, 36, 120, 10); g.fillStyle = '#2f8a3a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); rr(g, bx - 16, y - 90, 32, 36, 4); g.fillStyle = '#e6c02a'; g.fill(); }
}
// alguém dormindo deitado, com cobertor (cabeça à esquerda). x,y = chão/colchão sob o quadril
export function dormindo(g, x, y, s, outfit, o = {}) {
  const { expr = 'sleepy', t = 0, cor = '#4f7f5a', look = [0, 0], emote = null } = o; const bre = Math.sin(t * 2) * 3 * s;
  drawFigure(g, { x, y, s, facing: 1, outfit, pose: POSES.lie, rot: -1.5, expr, look, t, emote, shadow: false });
  g.save(); g.translate(x, y); rr(g, -130 * s, -62 * s - bre, 330 * s, 66 * s + bre, 28 * s); g.fillStyle = INK; g.fill(); rr(g, -124 * s, -56 * s - bre, 318 * s, 54 * s + bre, 22 * s); g.fillStyle = cor; g.fill();
  g.strokeStyle = alpha('#000', 0.25); g.lineWidth = 3 * s; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-124 * s + i * 80 * s, -56 * s - bre); g.lineTo(-124 * s + i * 80 * s, -2 * s); g.stroke(); } g.restore();
}
