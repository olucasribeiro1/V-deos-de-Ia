// Ep. 1 — cenas de contexto (mãe estranha, 8 anos de obra e de piada) e chamada pra seguir
import { E, SAFE, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, rr, seg, poly, circle, glow, shade, alpha, text, FONTS, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { quintal, GRILL_X } from '../sets/quintal.js';
import { cozinha, bancada } from '../sets/interiores.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';

const INK = '#0b0b0d';
const blink = (t, p = 3.1) => (t % p) > p - 0.12;

registerShot('s04b', { draw(g, t, info) {   // ela andava estranha: sozinha, olhar perdido
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 + 0.1 * k, x: -60, y: 40 };
  const { GY, M } = cozinha(g, t, cam);
  veil(g, '#0a1020', 0.38);
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 430, y: GY, s: 2.3, facing: 1, outfit: MARIANA, pose: breathe(POSES.think, t, 0.6, 4), expr: 'sad', look: [0.8, -0.3], blink: blink(t, 2.5) });
    bancada(g, GY, M);
    rr(g, 250, GY - 268, 60, 56, 8); g.fillStyle = '#e9edf0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();   // xícara de café
    rr(g, 560, GY - 226, 96, 16, 6); g.fillStyle = INK; g.fill();
  });
  FX.dust(g, t, { count: 22 });
}});

registerShot('s04x', { draw(g, t, info) {   // recusava todo convite
  const ui = S().ui, cam = { z: 1.0 + 0.04 * (t / info.dur) };
  blurLayer(g, 10, g => cozinha(g, t, { z: 1.3, x: -60, y: 100 }), cam, 0.6); veil(g, '#0a1020', 0.55);
  const cards = [['CHURRASCO', 'sábado?', 500, 470, -0.06], ['ANIVERSÁRIO', 'da tia', 430, 760, 0.05], ['ALMOÇO', 'de domingo', 560, 1050, -0.03]];
  cards.forEach(([a, b, x, y, rot], i) => { const p = ease.outBack(prog(t, 0.05 + i * 0.45, 0.35 + i * 0.45)); if (p <= 0) return; const xk = ease.out(prog(t, 0.3 + i * 0.45, 0.5 + i * 0.45));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(p, p);
    rr(g, -280, -110, 560, 220, 30); g.fillStyle = INK; g.fill(); rr(g, -270, -100, 540, 200, 22); g.fillStyle = '#f1efe9'; g.fill();
    circle(g, -190, 0, 52, '#9aa3ae'); text(g, a, 40, -30, { size: 52, color: '#16181d', font: FONTS.ui, weight: 900 }); text(g, b, 40, 34, { size: 40, color: '#5a606a', font: FONTS.ui, weight: 800 });
    if (xk > 0) { g.globalAlpha = xk; const s = 1.6 - 0.6 * xk; g.scale(s, s); seg(g, [[-90, -90], [90, 90]], 30, ui.accent); seg(g, [[90, -90], [-90, 90]], 30, ui.accent); }
    g.restore(); });
}});

registerShot('s04c', { draw(g, t, info) {   // celular sempre de cabeça pra baixo, vibrando
  const buzz = ((t > 0.5 && t < 1.7) || (t > 2.2 && t < 3.4)) ? 1 : 0, j = buzz ? Math.sin(t * 90) * 5 : 0, z = 1.04 + 0.08 * (t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = '#7a5238'; g.fillRect(-200, -200, E.W + 400, E.H + 400); g.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 9; i++) g.fillRect(-200, i * 260 - 100, E.W + 400, 6);
  veil(g, '#0a1020', 0.35);
  const cx = 500 + j, cy = 860, pw = 330, ph = 620;
  if (buzz) { glow(g, cx, cy, 620, '#cfe0ff', 0.45 + 0.2 * Math.sin(t * 30)); for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) { g.strokeStyle = alpha('#ffffff', 0.5); g.lineWidth = 6; g.beginPath(); g.arc(cx + sd * (230 + i * 46), cy - 200, 40, sd > 0 ? -0.9 : Math.PI - 0.9, sd > 0 ? 0.9 : Math.PI + 0.9); g.stroke(); } }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(cx + 20, cy + 30, pw * 0.6, ph * 0.52, 0, 0, 7); g.fill();
  g.save(); g.translate(cx, cy); g.rotate(-0.12 + j * 0.003);
  rr(g, -pw / 2 - 8, -ph / 2 - 8, pw + 16, ph + 16, 46); g.fillStyle = buzz ? '#dfe8ff' : INK; g.fill(); rr(g, -pw / 2 + 2, -ph / 2 + 2, pw - 4, ph - 4, 40); g.fillStyle = '#1c1e24'; g.fill(); circle(g, -pw / 2 + 70, -ph / 2 + 70, 30, '#0b0b0d'); circle(g, -pw / 2 + 70, -ph / 2 + 70, 16, '#30343c');
  g.restore(); g.restore();
}});

registerShot('s13b', { draw(g, t, info) {   // flashback: 8 anos de "reforma" à noite
  const k = ease.inOut(t / info.dur), cam = { z: 1.2 + 0.1 * k, x: 170, y: 130 };
  const { GY, M } = quintal(g, t, cam, { moodName: 'night', fire: 0, smoke: false });
  layer(g, cam, 1, g => {
    glow(g, 560, GY - 60, 420, '#f0c060', 0.45);
    for (let i = 0; i < 9; i++) { const bx = 300 + (i % 3) * 66 + (Math.floor(i / 3) % 2) * 30, by = GY - 34 - Math.floor(i / 3) * 34; g.fillStyle = '#b0674a'; g.fillRect(bx, by, 62, 30); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(bx, by, 62, 30); }
    rr(g, 520, GY - 96, 46, 96, 8); g.fillStyle = '#e8b040'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); circle(g, 543, GY - 60, 14, '#fff4c0');   // lampião
    drawFigure(g, { x: 640, y: GY + 10, s: 1.7, facing: 1, outfit: OSVALDO, pose: posesAt((t * 0.9) % 1.4, [[0, 'crouch'], [0.5, 'reach'], [0.9, 'crouch']], 0.25), expr: 'determined', prop: null });
  });
  veil(g, '#1a2a50', 0.22); FX.stars(g, t, { count: 50, area: [0, 0, E.W, 500] });
  const a = ease.outBack(prog(t, 0.35, 0.75)); if (a > 0) { g.save(); g.translate(500, 420); g.scale(a, a); text(g, '8 ANOS', 0, 0, { size: 150, color: S().ui.gold, stroke: 22, strokeColor: INK }); text(g, 'DE "REFORMA"', 0, 110, { size: 54, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 4, stroke: 12, strokeColor: INK }); g.restore(); }
}});

registerShot('s13c', { draw(g, t, info) {   // a família inteira ria dele
  const k = ease.inOut(t / info.dur), cam = { z: 1.14 + 0.06 * k, x: 40, y: 80 };
  const { GY } = quintal(g, t, cam);
  const bob = (i) => Math.abs(Math.sin(t * 9 + i)) * 10;
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 660, y: GY, s: 1.7, facing: -1, outfit: OSVALDO, pose: breathe(POSES.crossArms, t, 1, 5), expr: 'angry', blink: blink(t, 2.6) });
    drawFigure(g, { x: 190, y: GY + 40 - bob(0), s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(POSES.talk, t, 1, 4), expr: 'happy' });
    drawFigure(g, { x: 330, y: GY + 20 - bob(1), s: 1.7 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: posesAt(t % 1, [[0, 'point'], [0.5, 'cheer'], [1, 'point']], 0.25), expr: 'joy' });
    drawFigure(g, { x: 470, y: GY + 50 - bob(2), s: 1.7, facing: 1, outfit: EDUARDO, pose: breathe(POSES.point, t, 1, 1), expr: 'joy' });
  });
  [['HA', 250, 560, -0.15, 0.2], ['HA', 420, 500, 0.1, 0.5], ['HAHA', 330, 660, -0.05, 0.9]].forEach(([s2, x, y, r, st], i) => { const p = ease.outBack(prog(t, st, st + 0.25)); if (p <= 0) return; g.save(); g.translate(x, y - 20 * Math.sin(t * 6 + i)); g.rotate(r); g.scale(p, p); text(g, s2, 0, 0, { size: 96, color: S().ui.cream, stroke: 18, strokeColor: INK }); g.restore(); });
  FX.dust(g, t, { count: 26 });
}});

registerShot('s26', { draw(g, t, info) {
  UI.seguir(g, t, { linha1: 'CONTINUA...', linha2: ['SEGUE', 'A PÁGINA'], botao: '+ SEGUIR', proximo: 'EP. 2 — RAÇÃO DE GUERRA', outfit: EDUARDO });
}});
