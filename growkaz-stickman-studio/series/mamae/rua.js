// Rua do bairro depois da bomba (casas coloridas apagadas pela poeira) e o estádio municipal com o helicóptero.
import { E, V, layer, linGrad, rr, seg, poly, circle, glow, alpha, mix, rng, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { fallout } from '/series/mamae/efeitos.js';
const INK = '#0b0b0d';
const box = (g, x, y, w, h, c, r = 8, lw = 5) => { rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); };
export function ruaCinza(g, t, cam, o = {}) {
  const { poeira = 80 } = o; const GY = E.H * V(0.8, 0.68); const C = (c) => mix(c, '#9aa0a8', 0.55);
  layer(g, cam, 0.15, g => { g.fillStyle = linGrad(g, 0, -300, 0, GY, ['#5a6270', '#8a909a', '#b8bcc2']); g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3); });
  layer(g, cam, 0.5, g => { const r = rng(17), cores = ['#d8b06a', '#7fa9c2', '#c98f78', '#9db88a', '#c7bfae', '#a48fb8'];
    for (let i = -6; i < 16; i++) { const x = i * 230, h = 380 + r() * 260; g.fillStyle = C(cores[(i + 12) % cores.length]); g.fillRect(x, GY - h, 220, h); g.fillStyle = C('#8a5a48'); g.fillRect(x - 6, GY - h - 16, 232, 18);
      g.fillStyle = alpha('#16181d', 0.75); g.fillRect(x + 30, GY - h + 70, 60, 70); g.fillRect(x + 130, GY - h + 70, 60, 70); g.fillStyle = C('#5a4a40'); g.fillRect(x + 80, GY - 170, 70, 170); }
    for (let i = -5; i < 16; i += 3) { seg(g, [[i * 230 + 200, GY], [i * 230 + 200, GY - 700]], 12, INK); }
    g.strokeStyle = alpha(INK, 0.85); g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); for (let i = -5; i < 16; i += 3) { const x = i * 230 + 200; i === -5 ? g.moveTo(x, GY - 680 + k * 18) : g.quadraticCurveTo(x - 345, GY - 600 + k * 18, x, GY - 680 + k * 18); } g.stroke(); } });
  layer(g, cam, 0.85, g => { g.fillStyle = '#6a6e76'; g.fillRect(-E.W * 2, GY, E.W * 5, E.H); g.fillStyle = '#8a8e96'; g.fillRect(-E.W * 2, GY, E.W * 5, 30);
    for (let i = -5; i < 12; i++) { g.fillStyle = alpha('#e6e6e6', 0.6); g.fillRect(i * 300, GY + 260, 140, 14); }
    const r = rng(5); for (let i = -2; i < 8; i += 3) { const x = i * 300 + 80; box(g, x, GY + 60, 240, 90, C(['#c0563a', '#2f7fd0', '#e6c02a'][(i + 3) % 3]), 30); box(g, x + 40, GY + 20, 150, 50, C('#9aa3ae'), 16); circle(g, x + 50, GY + 155, 26, INK); circle(g, x + 190, GY + 155, 26, INK); } });
  veil2(g, 0.25); fallout(g, t, { count: poeira, a: 0.5, speed: 40 });
  return { GY };
}
const veil2 = (g, a) => { g.save(); g.fillStyle = alpha('#7a7f88', a); g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3); g.restore(); };
export function helicoptero(g, x, y, s, t, o = {}) {
  const { sobe = 0, porta = 0 } = o; g.save(); g.translate(x, y - sobe * 900); g.scale(s, s);
  seg(g, [[120, -60], [420, -90]], 34, INK); seg(g, [[120, -60], [420, -90]], 22, '#3a4526'); box(g, 400, -150, 30, 90, '#3a4526', 6);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -40, 210, 110, 0, 0, 7); g.fill(); g.fillStyle = '#4c5a30'; g.beginPath(); g.ellipse(0, -40, 200, 100, 0, 0, 7); g.fill();
  g.fillStyle = alpha('#9fd8ff', 0.85); g.beginPath(); g.ellipse(-120, -60, 70, 55, 0, 0, 7); g.fill();
  rr(g, -30, -100 + 0, 120, 120 * (1 - porta) + 10, 6); g.fillStyle = '#1c2026'; g.fill();
  seg(g, [[-150, 80], [150, 80]], 14, INK); seg(g, [[-100, 60], [-110, 80]], 10, INK); seg(g, [[100, 60], [110, 80]], 10, INK);
  seg(g, [[0, -150], [0, -190]], 14, INK); const a = t * 40; g.save(); g.translate(0, -195); g.scale(1, 0.12); for (let i = 0; i < 2; i++) { g.rotate(a + i * Math.PI / 2); seg(g, [[-420, 0], [420, 0]], 70, alpha('#16181d', 0.55)); } g.restore();
  text(g, 'EB', 40, -40, { size: 40, color: '#e6dcc0', font: FONTS.ui, weight: 900 });
  g.restore();
}
export function estadio(g, t, cam) {
  const GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.2, g => { g.fillStyle = linGrad(g, 0, -300, 0, GY, ['#6a7480', '#a8aeb6', '#c8ccd0']); g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3); });
  layer(g, cam, 0.5, g => { g.fillStyle = '#8a8e96'; g.beginPath(); g.moveTo(-800, GY - 200); g.quadraticCurveTo(540, GY - 620, 1900, GY - 200); g.lineTo(1900, GY); g.lineTo(-800, GY); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
    for (let i = 0; i < 18; i++) { const x = -600 + i * 140; seg(g, [[x, GY - 200 - Math.sin((i / 17) * Math.PI) * 300], [x, GY]], 3, alpha(INK, 0.3)); }
    for (const x of [-200, 1280]) { seg(g, [[x, GY - 200], [x, GY - 900]], 16, INK); box(g, x - 90, GY - 980, 180, 90, '#e9edf0', 8); for (let i = 0; i < 6; i++) circle(g, x - 60 + (i % 3) * 60, GY - 955 + Math.floor(i / 3) * 40, 14, '#fff8d0'); glow(g, x, GY - 935, 300, '#fff8d0', 0.25); }
    box(g, 360, GY - 280, 360, 230, '#5a6068', 10); text(g, 'ESTÁDIO MUNICIPAL', 540, GY - 230, { size: 26, color: '#e6dcc0', font: FONTS.ui, weight: 900 }); rr(g, 430, GY - 200, 220, 150, 6); g.fillStyle = '#1c2026'; g.fill(); });
  layer(g, cam, 0.85, g => { g.fillStyle = '#4f8a55'; g.fillRect(-E.W * 2, GY, E.W * 5, E.H); g.strokeStyle = alpha('#ffffff', 0.5); g.lineWidth = 6; g.beginPath(); g.arc(540, GY + 300, 200, 0, 7); g.stroke(); circle(g, 540, GY + 300, 60, alpha('#ffffff', 0.25)); text(g, 'H', 540, GY + 300, { size: 90, color: alpha('#ffffff', 0.7) }); });
  return { GY };
}
