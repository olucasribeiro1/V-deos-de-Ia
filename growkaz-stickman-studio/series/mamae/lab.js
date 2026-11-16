// Cenários de flashback da série: laboratório de biossegurança (Projeto Cérebro) e sala de comando.
import { E, V, layer, linGrad, rr, seg, poly, circle, glow, alpha, mix, rng, noise, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
const INK = '#0b0b0d';
const box = (g, x, y, w, h, c, r = 8, lw = 5) => { rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); };
// organismo dentro do tanque: massa escura com "nós" que pulsam ligados por fios (age como um cérebro só)
export function organismo(g, x, y, s, t, o = {}) {
  const { a = 1, brilho = '#7fe0a0' } = o; g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a; const r = rng(4); const nos = [];
  for (let i = 0; i < 11; i++) nos.push([(r() - 0.5) * 200 + Math.sin(t * 1.3 + i) * 10, (r() - 0.5) * 260 + Math.cos(t * 1.1 + i) * 10, 16 + r() * 18]);
  g.strokeStyle = alpha(brilho, 0.55); g.lineWidth = 4; for (let i = 0; i < nos.length; i++) for (let j = i + 1; j < nos.length; j++) { const [x1, y1] = nos[i], [x2, y2] = nos[j]; if (Math.hypot(x1 - x2, y1 - y2) < 140) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); } }
  for (const [nx, ny, nr] of nos) { circle(g, nx, ny, nr + 4, '#101418'); const p = 0.5 + 0.5 * Math.sin(t * 4 + nx); circle(g, nx, ny, nr * 0.5, alpha(brilho, 0.5 + 0.5 * p)); glow(g, nx, ny, nr * 2.4, brilho, 0.25 * p); }
  g.restore();
}
export function tanque(g, x, y, s, t, o = {}) {
  const { quebrado = 0, cheio = 1, alarme = 0 } = o; g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -200, -40, 400, 60, '#5a6068', 10); box(g, -200, -720, 400, 60, '#5a6068', 10);
  rr(g, -170, -660, 340, 620, 20); g.fillStyle = alpha(alarme ? '#d8342b' : '#7fe0a0', 0.18); g.fill();
  if (cheio > 0) organismo(g, 0, -360, 1, t, { a: cheio, brilho: alarme ? '#ff8070' : '#7fe0a0' });
  g.strokeStyle = alpha('#ffffff', 0.5); g.lineWidth = 6; rr(g, -170, -660, 340, 620, 20); g.stroke(); seg(g, [[-120, -620], [-120, -120]], 10, alpha('#ffffff', 0.25));
  if (quebrado > 0) { g.strokeStyle = INK; g.lineWidth = 5; for (const pts of [[[-40, -500], [10, -420], [-30, -350], [30, -260]], [[10, -420], [90, -400], [140, -460]], [[-30, -350], [-120, -330]]]) { g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.stroke(); } poly(g, [[-30, -380], [40, -420], [60, -320], [-10, -300]], '#0e1214'); }
  g.restore();
}
export function laboratorio(g, t, cam, o = {}) {
  const { alarme = 0, quebrado = 0, cheio = 1 } = o; const CX = E.W / 2, GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.6, g => { g.fillStyle = '#c9d2d8'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.fillStyle = '#aeb9c0'; g.fillRect(-E.W, GY - 560, E.W * 3, 560);
    for (let x = -E.W; x < E.W * 2; x += 220) { seg(g, [[x, GY - 560], [x, GY]], 3, alpha('#000', 0.15)); }
    box(g, 60, 300, 300, 200, '#1c2a34', 10); for (let i = 0; i < 4; i++) seg(g, [[90, 360 + i * 30], [90 + 120 + (i * 37) % 100, 360 + i * 30]], 6, '#7fe0a0');
    text(g, 'BIOSSEGURANÇA', 780, 360, { size: 40, color: '#3a4a56', font: FONTS.ui, weight: 900, spacing: 4 }); poly(g, [[780, 400], [830, 480], [730, 480]], '#e6c02a'); text(g, '!', 780, 455, { size: 46, color: INK });
    for (let x = -E.W; x < E.W * 2; x += 360) { rr(g, x, 120, 240, 30, 8); g.fillStyle = alarme ? (Math.sin(t * 8) > 0 ? '#ff4030' : '#601010') : '#f4f8fa'; g.fill(); if (alarme && Math.sin(t * 8) > 0) glow(g, x + 120, 150, 300, '#ff4030', 0.4); } });
  layer(g, cam, 0.85, g => { g.fillStyle = '#7d8a94'; g.fillRect(-E.W, GY, E.W * 3, E.H); FX.floorLines(g, GY, E.H * 1.3, 'rgba(0,0,0,.2)', 0.08);
    tanque(g, CX + 120, GY + 10, 1.0, t, { quebrado, cheio, alarme }); box(g, -100, GY - 200, 380, 22, '#e9edf0', 6); seg(g, [[-80, GY - 178], [-80, GY]], 10, INK); seg(g, [[240, GY - 178], [240, GY]], 10, INK);
    for (let i = 0; i < 3; i++) { rr(g, -40 + i * 90, GY - 270, 40, 70, 8); g.fillStyle = alpha(['#7fe0a0', '#e6c02a', '#5f8fd0'][i], 0.7); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); } });
  if (alarme) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = alpha('#ff6050', 0.25 + 0.15 * Math.sin(t * 8)); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
  return { GY, CX };
}
export function salaComando(g, t, cam, o = {}) {
  const { flash = 0 } = o; const CX = E.W / 2, GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.6, g => { g.fillStyle = '#1c2428'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); box(g, 80, 260, 920, 560, '#0e1a20', 14);
    g.strokeStyle = alpha('#5fd36a', 0.25); g.lineWidth = 2; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(80, 300 + i * 52); g.lineTo(1000, 300 + i * 52); g.stroke(); g.beginPath(); g.moveTo(120 + i * 92, 260); g.lineTo(120 + i * 92, 820); g.stroke(); }
    g.fillStyle = alpha('#5fd36a', 0.35); g.beginPath(); g.moveTo(300, 380); g.quadraticCurveTo(520, 300, 760, 420); g.quadraticCurveTo(820, 640, 600, 720); g.quadraticCurveTo(330, 700, 300, 380); g.fill();
    const p = 0.5 + 0.5 * Math.sin(t * 5); g.strokeStyle = '#ff4030'; g.lineWidth = 8; g.beginPath(); g.arc(560, 540, 70 + 20 * p, 0, 7); g.stroke(); g.beginPath(); g.arc(560, 540, 150 + 30 * p, 0, 7); g.lineWidth = 4; g.stroke(); circle(g, 560, 540, 14, '#ff4030');
    text(g, 'ZONA DE CONTENÇÃO', 540, 790, { size: 30, color: '#5fd36a', font: FONTS.ui, weight: 900, spacing: 4 }); });
  layer(g, cam, 0.85, g => { g.fillStyle = '#2a3236'; g.fillRect(-E.W, GY, E.W * 3, E.H); box(g, 60, GY - 230, 960, 40, '#3a4a40', 8); });
  if (flash > 0) { g.save(); g.fillStyle = alpha('#ffffff', flash); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
  return { GY, CX };
}
export function caixaCorreio(g, x, y, s, envelope = 0) { g.save(); g.translate(x, y); g.scale(s, s); seg(g, [[0, 0], [0, -200]], 16, INK); box(g, -90, -320, 180, 130, '#c0563a', 30); box(g, -60, -280, 120, 14, '#16181d', 4); if (envelope > 0) { g.save(); g.translate(0, -290 - 60 * (1 - envelope)); g.globalAlpha *= Math.min(1, envelope * 2); rr(g, -55, -30, 110, 60, 4); g.fillStyle = '#efe8d0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); seg(g, [[-55, -30], [0, 4], [55, -30]], 3, INK); g.restore(); } g.restore(); }
export function caixaIodeto(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -170, -110, 340, 220, '#efe8d0', 14); rr(g, -170, -110, 340, 60, 14); g.fillStyle = '#2f7fd0'; g.fill(); text(g, 'IODETO DE', 0, -80, { size: 30, color: '#fff', font: FONTS.ui, weight: 900 }); text(g, 'POTÁSSIO', 0, -10, { size: 50, color: '#16181d', font: FONTS.ui, weight: 900 }); for (let i = 0; i < 5; i++) circle(g, -110 + i * 55, 60, 16, '#e9edf0'), g.strokeStyle = INK, g.lineWidth = 3, g.beginPath(), g.arc(-110 + i * 55, 60, 16, 0, 7), g.stroke(); g.restore(); }
export function tireoide(g, x, y, s, ok = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = INK; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 60, 0, 66, 96, sd * 0.3, 0, 7); g.fill(); } g.fillRect(-40, -10, 80, 40); g.fillStyle = '#d97a8a'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 60, 0, 58, 88, sd * 0.3, 0, 7); g.fill(); } g.fillRect(-36, -4, 72, 28); if (ok) { g.strokeStyle = '#3f9a5a'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 150, 0, 7); g.stroke(); } g.restore(); }
