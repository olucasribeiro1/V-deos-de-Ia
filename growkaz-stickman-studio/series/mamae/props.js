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
// detector de monóxido (CO) na parede: aberto mostra o compartimento de pilha vazio
export function detectorCO(g, x, y, s, t, o = {}) {
  const { aberto = 0, alarme = 0 } = o; g.save(); g.translate(x, y); g.scale(s, s);
  circle(g, 0, 0, 92, INK); circle(g, 0, 0, 84, '#efe8d0'); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; circle(g, Math.cos(a) * 52, Math.sin(a) * 52, 6, '#9aa3ae'); }
  text(g, 'CO', 0, -6, { size: 40, color: '#16181d', font: FONTS.ui, weight: 900 }); circle(g, 0, 40, 9, alarme && Math.sin(t * 18) > 0 ? '#ff4030' : '#3a3d44');
  if (aberto > 0.02) { g.save(); g.translate(0, 95); g.rotate(0.6 * aberto); rr(g, -60, 0, 120, 90 * aberto, 10); g.fillStyle = '#c9ced6'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.restore();
    rr(g, -50, 100, 100, 70, 8); g.fillStyle = '#2a2d34'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); seg(g, [[-30, 120], [-30, 150]], 6, '#9aa3ae'); seg(g, [[30, 120], [30, 150]], 6, '#9aa3ae'); text(g, 'VAZIO', 0, 196, { size: 30, color: S().ui.accent, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK }); }
  g.restore();
}
// controle de videogame (com a pilha roubada)
export function controle(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = INK; g.beginPath(); g.ellipse(-50, 10, 46, 38, 0.3, 0, 7); g.ellipse(50, 10, 46, 38, -0.3, 0, 7); g.fill(); rr(g, -70, -30, 140, 60, 26); g.fill();
  g.fillStyle = '#3a3d44'; g.beginPath(); g.ellipse(-50, 10, 38, 30, 0.3, 0, 7); g.ellipse(50, 10, 38, 30, -0.3, 0, 7); g.fill(); rr(g, -62, -22, 124, 44, 20); g.fill();
  seg(g, [[-60, 0], [-36, 0]], 8, '#16181d'); seg(g, [[-48, -12], [-48, 12]], 8, '#16181d'); for (const [dx, dy, c] of [[44, -8, '#5fd36a'], [58, 6, '#e6c02a'], [30, 6, '#2f7fd0']]) circle(g, dx, dy, 7, c); g.restore(); }
// pilha AA
export function pilha(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rr(g, -60, -22, 120, 44, 10); g.fillStyle = INK; g.fill(); rr(g, -54, -16, 108, 32, 7); g.fillStyle = '#e0a030'; g.fill(); g.fillStyle = '#2a2d34'; g.fillRect(-54, -16, 40, 32); rr(g, 54, -9, 12, 18, 3); g.fillStyle = '#c9ced6'; g.fill(); g.restore(); }
// manivela da ventilação manual (gira com k)
export function manivela(g, x, y, s, ang) { g.save(); g.translate(x, y); g.scale(s, s); circle(g, 0, 0, 34, INK); circle(g, 0, 0, 26, '#9aa3ae'); g.rotate(ang); seg(g, [[0, 0], [90, 0]], 16, INK); seg(g, [[90, 0], [90, 50]], 18, INK); seg(g, [[90, 0], [90, 46]], 10, '#d8342b'); g.restore(); }
// cano de escape saindo do chão do quintal (amassado: 0..1) com marcas de garra
export function canoEscape(g, x, y, s, amassado = 0, garras = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (amassado < 0.5) { seg(g, [[0, 0], [0, -260], [60, -300]], 40, INK); seg(g, [[0, 0], [0, -260], [60, -300]], 30, '#7d8794'); }
  else { seg(g, [[0, 0], [0, -120], [70, -150], [20, -190], [-40, -170]], 40, INK); seg(g, [[0, 0], [0, -120], [70, -150], [20, -190], [-40, -170]], 30, '#7d8794'); poly(g, [[-10, -125], [20, -150], [10, -160], [-15, -140]], '#4a4f58'); }
  g.fillStyle = '#4a4f58'; g.fillRect(-50, -10, 100, 20);
  if (garras > 0.02) { g.globalAlpha *= garras; for (const [ox, oy, r] of [[-170, -60, -0.3], [150, -110, 0.4], [-90, 40, -0.1]]) for (let i = 0; i < 4; i++) { g.save(); g.translate(ox + i * 26, oy + i * 6); g.rotate(r); seg(g, [[0, -80], [8, 80]], 16, INK); seg(g, [[0, -80], [8, 80]], 7, '#d9d4c8'); g.restore(); } }
  g.restore();
}
// ícone de sintoma num círculo (cabeça latejando / tontura / enjoo)
export function sintoma(g, x, y, s, tipo, t) {
  g.save(); g.translate(x, y); g.scale(s, s); circle(g, 0, 0, 96, INK); circle(g, 0, 0, 88, '#efe8d0'); circle(g, 0, 10, 48, WH); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(0, 10, 48, 0, 7); g.stroke();
  if (tipo === 'cabeca') { for (const a of [-2.4, -1.6, -0.8]) seg(g, [[Math.cos(a) * 62, 10 + Math.sin(a) * 62], [Math.cos(a) * (80 + 6 * Math.sin(t * 12)), 10 + Math.sin(a) * (80 + 6 * Math.sin(t * 12))]], 7, '#d8342b'); seg(g, [[-24, 6], [-12, 6]], 6, INK); seg(g, [[12, 6], [24, 6]], 6, INK); }
  if (tipo === 'tontura') { g.strokeStyle = INK; g.lineWidth = 5; for (const dx of [-18, 18]) { g.beginPath(); for (let i = 0; i < 20; i++) { const a = i * 0.6 + t * 6, r = i * 0.7; i ? g.lineTo(dx + Math.cos(a) * r, 4 + Math.sin(a) * r) : g.moveTo(dx, 4); } g.stroke(); } }
  if (tipo === 'enjoo') { circle(g, -16, 2, 6, INK); circle(g, 16, 2, 6, INK); g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= 10; i++) g.lineTo(-20 + i * 4, 30 + Math.sin(i * 1.4) * 5); g.stroke(); g.fillStyle = alpha('#7fb84a', 0.6); g.beginPath(); g.arc(0, 10, 48, 0, 7); g.fill(); }
  g.restore();
}
// galão rachado pingando + poça
export function galaoRachado(g, x, y, s, t, o = {}) {
  const { poca = 1 } = o; g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = alpha('#7fc0e8', 0.55); g.beginPath(); g.ellipse(30, 4, 140 * poca, 22 * poca, 0, 0, 7); g.fill(); g.strokeStyle = alpha('#ffffff', 0.4); g.lineWidth = 3; g.beginPath(); g.ellipse(10, 0, 70 * poca, 8 * poca, 0, 3.4, 5.6); g.stroke();
  box(g, -46, -130, 92, 130, alpha('#6fb8e8', 0.6), 22); box(g, -18, -150, 36, 24, '#2f7fd0', 5, 3);
  seg(g, [[-20, -110], [0, -80], [-10, -60], [10, -36]], 5, INK);
  const ph = (t * 1.6) % 1; g.fillStyle = '#7fc0e8'; g.beginPath(); g.ellipse(14, -30 + ph * 30, 6, 9, 0, 0, 7); g.fill();
  g.restore();
}
// caixa d'água azul com tampa (a poeira escorre pela tampa)
export function caixaDagua(g, x, y, s, t, o = {}) {
  const { poeira = 1, corte = 0 } = o; g.save(); g.translate(x, y); g.scale(s, s);
  poly(g, [[-150, -200], [150, -200], [120, 0], [-120, 0]], '#2f7fd0'); g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-150, -200); g.lineTo(150, -200); g.lineTo(120, 0); g.lineTo(-120, 0); g.closePath(); g.stroke();
  if (corte > 0) { g.save(); g.globalAlpha = corte; rr(g, -110, -170, 220, 150, 10); g.fillStyle = '#9fd8ff'; g.fill(); for (let i = 0; i < 3; i++) seg(g, [[-90 + i * 60, -120 + Math.sin(t * 2 + i) * 5], [-50 + i * 60, -120 + Math.sin(t * 2 + i + 1) * 5]], 4, alpha('#ffffff', 0.7)); g.restore(); }
  g.fillStyle = '#2a5fa8'; g.beginPath(); g.ellipse(0, -205, 165, 30, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); circle(g, 0, -232, 22, '#2a5fa8'); g.stroke();
  if (poeira > 0) for (let i = 0; i < 26; i++) { const ph = (t * 0.6 + i * 0.137) % 1, px = -160 + (i * 53) % 320, py = -420 + ph * 220; if (py < -228 + Math.abs(px) * 0.05) circle(g, px, py, 5, alpha('#b9bcc2', 0.9 * poeira)); else { const sx = px + (px > 0 ? 1 : -1) * (py + 228) * 1.2; circle(g, sx, -205 + (py + 228) * 0.6, 5, alpha('#b9bcc2', 0.8 * poeira * (1 - ph))); } }
  g.restore();
}
export function copo(g, x, y, s, nivel = 1) { g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-40, -110], [40, -110], [30, 0], [-30, 0]], alpha('#e8eef6', 0.35)); if (nivel > 0) { const h = 100 * nivel; poly(g, [[-30 - 10 * (h / 110), -h], [30 + 10 * (h / 110), -h], [30, -4], [-30, -4]], alpha('#7fc0e8', 0.85)); } g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-40, -110); g.lineTo(-30, 0); g.lineTo(30, 0); g.lineTo(40, -110); g.stroke(); g.restore(); }
export function chuveiro(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); seg(g, [[0, -160], [0, -100], [60, -100]], 14, INK); poly(g, [[30, -110], [110, -110], [90, -70], [50, -70]], '#9aa3ae'); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); for (let i = 0; i < 5; i++) { const ph = (t * 2 + i * 0.2) % 1; seg(g, [[55 + i * 8, -60 + ph * 120], [55 + i * 8, -40 + ph * 120]], 5, alpha('#7fc0e8', 1 - ph)); } g.restore(); }
// toalha enrolada na cabeça (desenhe depois da figura, na posição da cabeça)
export function toalha(g, hx, hy, r) { g.fillStyle = INK; g.beginPath(); g.ellipse(hx - r * 0.1, hy - r * 0.75, r * 1.15, r * 0.6, -0.1, 0, 7); g.fill(); g.fillStyle = '#e6c02a'; g.beginPath(); g.ellipse(hx - r * 0.1, hy - r * 0.75, r * 1.05, r * 0.5, -0.1, 0, 7); g.fill(); g.fillStyle = INK; g.beginPath(); g.ellipse(hx + r * 0.2, hy - r * 1.25, r * 0.45, r * 0.35, 0.4, 0, 7); g.fill(); g.fillStyle = '#e6c02a'; g.beginPath(); g.ellipse(hx + r * 0.2, hy - r * 1.25, r * 0.37, r * 0.27, 0.4, 0, 7); g.fill(); }
// equipamento de saída sobre o boneco: capa de chuva TRANSPARENTE (o corpo continua branco), máscara, luvas e saco nos pés
export function equipamento(g, o, k = 1) {
  if (k <= 0) return; const s = (o.s ?? 1) * (o.outfit?.kid ? 0.72 : 1), f = o.facing ?? 1, x = o.x, y = o.y; g.save(); g.globalAlpha *= k;
  g.fillStyle = 'rgba(200,225,240,.32)'; g.strokeStyle = 'rgba(20,30,40,.55)'; g.lineWidth = 3 * s;
  g.beginPath(); g.moveTo(x - 30 * s * f, y - 180 * s); g.lineTo(x + 34 * s * f, y - 180 * s); g.lineTo(x + 52 * s * f, y - 60 * s); g.lineTo(x - 46 * s * f, y - 60 * s); g.closePath(); g.fill(); g.stroke();
  for (const dx of [-8, 14]) { rr(g, x + dx * s * f - 14 * s, y - 16 * s, 28 * s, 18 * s, 6 * s); g.fillStyle = 'rgba(240,240,245,.75)'; g.fill(); g.stroke(); }
  g.restore();
}
export function mascara(g, hx, hy, r, f = 1) { g.save(); g.translate(hx + r * 0.3 * f, hy + r * 0.28); g.scale(f, 1); rr(g, -r * 0.5, -r * 0.28, r * 0.95, r * 0.5, r * 0.2); g.fillStyle = INK; g.fill(); rr(g, -r * 0.44, -r * 0.22, r * 0.83, r * 0.38, r * 0.16); g.fillStyle = '#3a4526'; g.fill(); circle(g, r * 0.44, 0, r * 0.2, INK); circle(g, r * 0.44, 0, r * 0.14, '#7d8794'); g.restore(); }
export function freezer(g, x, y, s, aberto = 0) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -170, -190, 340, 190, '#e9edf0', 16, 7); box(g, -150, -150, 70, 30, '#c9ced6', 8, 4);
  if (aberto > 0) { g.save(); g.translate(-170, -190); g.rotate(-1.4 * aberto); box(g, 0, -24, 340, 30, '#dfe4e8', 10, 6); g.restore(); rr(g, -160, -186, 320, 30, 6); g.fillStyle = '#1c2026'; g.fill(); } else box(g, -176, -214, 352, 30, '#dfe4e8', 10, 6);
  g.restore(); }
// pão de queijo murcho ("pedra mole")
export function paoDeQueijo(g, x, y, s, t, murcho = 1) { g.save(); g.translate(x, y); g.scale(s, s); const sq = 1 - 0.3 * murcho + 0.04 * Math.sin(t * 4) * murcho; g.scale(1 + 0.25 * murcho, sq); circle(g, 0, 0, 70, INK); circle(g, 0, 0, 62, '#e6c070'); for (const [dx, dy] of [[-22, -16], [18, -24], [8, 14], [-14, 22]]) circle(g, dx, dy, 8, '#c99a48'); g.restore(); }
export function mangueira(g, pts, cor = '#3f9a5a') { seg(g, pts, 20, INK); seg(g, pts, 12, cor); }
// papéis do Exército espalhados + o desenho da criatura
export function papelCerebro(g, x, y, s, rot, t, o = {}) {
  const { desenho = false } = o; g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -210, -280, 420, 560, 6); g.fillStyle = INK; g.fill(); rr(g, -202, -272, 404, 544, 4); g.fillStyle = '#efe8d0'; g.fill();
  rr(g, -180, -250, 120, 40, 4); g.fillStyle = '#4c5a30'; g.fill(); text(g, 'EXÉRCITO', -120, -229, { size: 20, color: '#efe8d0', font: FONTS.ui, weight: 900 });
  if (desenho) { g.strokeStyle = '#3a3d44'; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round'; const sk = (pts) => { g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.stroke(); };
    sk([[0, -150], [-8, -60], [0, 40]]); sk([[-8, -60], [40, -20], [70, 80], [80, 140]]); sk([[-8, -60], [-60, -10], [-70, 90], [-60, 150]]); sk([[0, 40], [30, 110], [20, 190]]); sk([[0, 40], [-30, 120], [-50, 190]]); g.beginPath(); g.ellipse(25, -190, 34, 52, 0.5, 0, 7); g.stroke();
    for (let i = 0; i < 4; i++) sk([[90 + i * 14, 120], [110 + i * 14, 150]]); text(g, '?', 120, -160, { size: 60, color: '#d8342b' }); g.strokeStyle = '#3a3d44'; g.lineWidth = 2; sk([[-150, 210], [150, 210]]); sk([[-150, 235], [90, 235]]); }
  else { for (let i = 0; i < 9; i++) { rr(g, -170, -170 + i * 44, (i % 3 === 2 ? 220 : 330), 14, 4); g.fillStyle = i === 3 || i === 6 ? '#16181d' : '#9aa3ae'; g.fill(); } }
  g.save(); g.rotate(-0.25); rr(g, -190, -40, 380, 90, 10); g.strokeStyle = alpha('#d8342b', 0.85); g.lineWidth = 8; g.stroke(); text(g, 'PROJETO CÉREBRO', 0, 6, { size: 40, color: alpha('#d8342b', 0.9), font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
  g.restore();
}
// marcas de garra num muro (altura até ~2 m na escala do cenário)
export function garrasMuro(g, x, base, alt, k = 1) { if (k <= 0) return; g.save(); g.globalAlpha *= k; for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { const x0 = x + j * 70 + i * 18, y0 = base - alt * (0.35 + j * 0.3); seg(g, [[x0, y0 - 140], [x0 + 26, y0 + 60]], 18, INK); seg(g, [[x0, y0 - 140], [x0 + 26, y0 + 60]], 8, '#e6dcc8'); } g.restore(); }
// sacos de carvão empilhados
export function sacosCarvao(g, x, y, s, n = 9) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < n; i++) { const c = i % 4, r = Math.floor(i / 4), bx = c * 120 + (r % 2) * 60, by = -r * 110; rr(g, bx - 56, by - 110, 112, 110, 26); g.fillStyle = INK; g.fill(); rr(g, bx - 50, by - 104, 100, 98, 22); g.fillStyle = '#c9b890'; g.fill(); text(g, 'CARVÃO', bx, by - 52, { size: 22, color: '#16181d', font: FONTS.ui, weight: 900 }); } g.restore(); }
export function apito(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rr(g, -60, -30, 100, 60, 26); g.fillStyle = INK; g.fill(); rr(g, -54, -24, 88, 48, 20); g.fillStyle = '#e6c02a'; g.fill(); rr(g, 30, -22, 60, 30, 8); g.fillStyle = INK; g.fill(); rr(g, 34, -18, 52, 22, 6); g.fillStyle = '#e6c02a'; g.fill(); circle(g, -14, 0, 12, INK); g.restore(); }
export function guarana(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -34, -170, 68, 170, 18); g.fillStyle = INK; g.fill(); rr(g, -28, -164, 56, 158, 14); g.fillStyle = '#2f8a3a'; g.fill(); rr(g, -14, -200, 28, 40, 6); g.fillStyle = INK; g.fill(); rr(g, -28, -110, 56, 46, 4); g.fillStyle = '#e6c02a'; g.fill(); g.restore(); }
// mapa visto de cima: casa (x,y), estádio, avenida, rota; usado no plano e na fuga
export function mapaCidade(g, t, o = {}) {
  const { rota = 0, isca = 0, criatura = -1, familia = -1 } = o; const ui = S().ui;
  g.fillStyle = '#e6dcc0'; g.fillRect(-200, -200, E.W + 400, E.H + 400); g.strokeStyle = alpha('#3f7f5a', 0.25); g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(300, 1500, 100 + i * 90, 70 + i * 60, 0.2, 0, 7); g.stroke(); }
  for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) { if ((i + j) % 3 === 0) continue; rr(g, 60 + i * 170, 260 + j * 170, 130, 130, 10); g.fillStyle = alpha('#b8a888', 0.7); g.fill(); }
  seg(g, [[-100, 1000], [1200, 820]], 70, '#9aa3ae'); text(g, 'AVENIDA', 900, 860, { size: 34, color: '#4a4f58', font: FONTS.ui, weight: 900 }); seg(g, [[-100, 1000], [1200, 820]], 6, alpha(ui.accent, 0.6));
  const casa = [300, 1500], est = [820, 380];
  rr(g, casa[0] - 60, casa[1] - 60, 120, 120, 10); g.fillStyle = '#c0563a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); text(g, 'CASA', casa[0], casa[1] + 100, { size: 38, color: '#16181d', font: FONTS.ui, weight: 900 });
  g.fillStyle = INK; g.beginPath(); g.ellipse(est[0], est[1], 150, 100, 0, 0, 7); g.fill(); g.fillStyle = '#3f9a5a'; g.beginPath(); g.ellipse(est[0], est[1], 136, 86, 0, 0, 7); g.fill(); text(g, 'ESTÁDIO', est[0], est[1] + 140, { size: 38, color: '#16181d', font: FONTS.ui, weight: 900 }); text(g, 'H', est[0], est[1], { size: 90, color: WH, stroke: 14, strokeColor: INK });
  const path = [[casa[0], casa[1]], [180, 1250], [160, 900], [380, 700], [600, 560], [est[0], est[1]]];
  if (rota > 0) { g.save(); g.setLineDash([26, 18]); g.lineDashOffset = -t * 40; g.strokeStyle = '#2f7fd0'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); const n = Math.max(2, Math.ceil(rota * path.length)); path.slice(0, n).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore(); }
  if (isca > 0) { glow(g, casa[0], casa[1], 260 * isca, '#ff7a20', 0.6 * isca); for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; g.strokeStyle = alpha('#ff7a20', 0.6 * (1 - ph) * isca); g.lineWidth = 6; g.beginPath(); g.arc(casa[0], casa[1], 80 + ph * 260, 0, 7); g.stroke(); } }
  const ponto = (k, cor, r = 26) => { const seg2 = k * (path.length - 1), i = Math.min(path.length - 2, Math.floor(seg2)), f = seg2 - i; const x = path[i][0] + (path[i + 1][0] - path[i][0]) * f, y = path[i][1] + (path[i + 1][1] - path[i][1]) * f; circle(g, x, y, r + 6, INK); circle(g, x, y, r, cor); };
  if (familia >= 0) ponto(familia, '#2f7fd0');
  if (criatura >= 0) { const x = 900 - 600 * criatura, y = 1300 + 200 * criatura; circle(g, x, y, 40, INK); circle(g, x, y, 32, '#16181d'); text(g, '?', x, y, { size: 44, color: ui.accent }); seg(g, [[x + 60, y - 20], [x + 120, y - 40]], 8, alpha(ui.accent, 0.6)); }
  return { casa, est };
}
