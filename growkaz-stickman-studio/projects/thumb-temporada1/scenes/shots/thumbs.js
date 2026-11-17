// Thumbnails do vídeo longo do YouTube "O Que a Mamãe Sabia — Temporada 1 completa" (1920x1080 -> 1280x720).
// A = "30 DIAS NO BUNKER" · B = "ELA SABIA" · C = "NÃO ABRA!"
import { E, registerShot, text, measure, rr, seg, poly, circle, ring, glow, alpha, mix, rng, linGrad, radGrad, blurLayer, veil, FONTS } from '/engine/core.js';
import { drawFigure, bigFace, POSES } from '/engine/rig2d.js';
import { bunkerSala } from '/series/mamae/bunker.js';
import { quintal } from '/series/mamae/quintal.js';
import { fallout, simboloRad, geiger } from '/series/mamae/efeitos.js';
import { organismo } from '/series/mamae/lab.js';
import { sombraCriatura } from '/series/mamae/props.js';
import { EDUARDO, MARIANA } from '../cast.js';

const INK = '#0b0b0d', AMARELO = '#ffd23a', BRANCO = '#f6f3ea', VERMELHO = '#d8342b', TOXICO = '#8dff5a';
const T = 0.35;   // tempo fixo (still)

// ---------- marca do canal: título grosso com sombra + contorno ----------
function titulo(g, str, x, y, size, cor, o = {}) {
  const { align = 'left', sombra = 0.09, contorno = 0.17, rot = -0.03 } = o;
  g.save(); g.translate(x, y); g.rotate(rot);
  text(g, str, size * sombra * 0.6, size * sombra, { size, color: INK, align, stroke: size * contorno, strokeColor: INK, weight: 700 });   // sombra dura
  text(g, str, 0, 0, { size, color: cor, align, stroke: size * contorno, strokeColor: INK, weight: 700 });
  g.restore();
}
function selo(g, x, y, str = 'TEMPORADA 1 COMPLETA') {
  const size = 40, w = measure(g, str, size, FONTS.ui, 900) + size * 1.1 + 40;
  g.save(); g.translate(x, y); g.rotate(-0.03);
  rr(g, -6, -size * 0.85 - 6, w + 12, size * 1.7 + 12, 14); g.fillStyle = INK; g.fill();
  rr(g, 0, -size * 0.85, w, size * 1.7, 10); g.fillStyle = VERMELHO; g.fill();
  circle(g, size * 0.75, 0, size * 0.28, BRANCO);   // "REC"
  text(g, str, size * 1.3, 2, { size, color: BRANCO, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  g.restore();
}
// luz de recorte atrás do rosto (separa o boneco do fundo)
function halo(g, x, y, r, cor, a = 0.8) { glow(g, x, y, r * 2.1, cor, a); }
function vinheta(g, a = 0.75, cx = E.W / 2, cy = E.H / 2) { g.save(); g.fillStyle = radGrad(g, cx, cy, E.H * 0.35, E.W * 0.75, [alpha('#000', 0), alpha('#000', a)]); g.fillRect(0, 0, E.W, E.H); g.restore(); }
function olhosBrilhando(g, x, y, s, cor = TOXICO) {
  for (const dx of [-1, 1]) { glow(g, x + dx * 42 * s, y, 90 * s, cor, 0.9);
    g.save(); g.translate(x + dx * 42 * s, y); g.rotate(dx * 0.32); g.fillStyle = cor; g.beginPath(); g.ellipse(0, 0, 30 * s, 11 * s, 0, 0, 7); g.fill();
    g.fillStyle = '#fbffe8'; g.beginPath(); g.ellipse(0, 0, 16 * s, 5 * s, 0, 0, 7); g.fill(); g.restore(); }
}
function garra(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.beginPath(); g.ellipse(0, -10, 95, 50, 0, 0, 7); g.fillStyle = '#050605'; g.fill(); g.strokeStyle = alpha(TOXICO, 0.9); g.lineWidth = 7; g.stroke();
  for (let i = 0; i < 4; i++) { const ox = (i - 1.5) * 48; g.beginPath(); g.moveTo(ox - 22, 0); g.quadraticCurveTo(ox - 18, 100, ox + 30, 170); g.quadraticCurveTo(ox + 6, 80, ox + 20, 0); g.closePath(); g.fillStyle = '#050605'; g.fill(); g.strokeStyle = TOXICO; g.lineWidth = 6; g.stroke(); }
  g.restore(); }

// ============ A — "30 DIAS NO BUNKER" ============
registerShot('A', { draw(g) {
  blurLayer(g, 7, g => bunkerSala(g, T, { z: 1.25, x: -260, y: 60, r: 0 }), null, 1);
  veil(g, '#0a1020', 0.55);
  // poeira caindo do alçapão (luz de cima)
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, 0, 0, E.H, [alpha('#ffe6a0', 0.25), alpha('#ffe6a0', 0)]); poly(g, [[1180, 0], [1640, 0], [1900, E.H], [980, E.H]], g.fillStyle); g.restore();
  fallout(g, 4.2, { count: 120, a: 0.55, area: [900, -50, 1000, 1150] });
  // curiosidade: algo espiando no alto, onde a luz entra
  sombraCriatura(g, 1790, 330, 0.85, 1.3, { a: 0.95, cor: '#050506' }); olhosBrilhando(g, 1810, 75, 0.38);
  // alerta vermelho nas bordas
  g.save(); g.fillStyle = radGrad(g, E.W * 0.55, E.H / 2, E.H * 0.45, E.W * 0.7, [alpha(VERMELHO, 0), alpha(VERMELHO, 0.75)]); g.fillRect(0, 0, E.W, E.H); g.restore();
  // contador Geiger no vermelho
  glow(g, 360, 840, 300, '#ffd23a', 0.35); geiger(g, 360, 830, 1.35, T, 1);
  // protagonista em close: apavorado, olhando pra cima
  const fx = 1390, fy = 560, fr = 300;
  halo(g, fx, fy, fr, '#ffcf6a', 0.55); ring(g, fx, fy, fr * 1.16 + 10, 22, AMARELO);
  bigFace(g, fx, fy, fr, { outfit: EDUARDO, expr: 'terrified', face: { eyes: 'wide', mouth: 'scream' }, look: [-0.7, 0.1], t: T, emote: 'sweat', tilt: 0.06 });
  vinheta(g, 0.6);
  selo(g, 70, 90);
  titulo(g, '30 DIAS', 70, 300, 250, AMARELO);
  titulo(g, 'NO BUNKER', 80, 530, 160, BRANCO);
} });

// ============ B — "ELA SABIA" ============
registerShot('B', { draw(g) {
  blurLayer(g, 8, g => bunkerSala(g, T, { z: 1.1, x: 120, y: 0, r: 0 }, { lamp: 0.4 }), null, 1);
  veil(g, '#05070a', 0.6);
  // luz verde tóxica vindo da caixa
  const bx = 1300, by = 800;
  glow(g, bx, by - 120, 700, TOXICO, 0.45);
  // Mariana atrás da caixa, rosto meio na sombra
  drawFigure(g, { x: 1640, y: 1240, s: 3.7, outfit: MARIANA, pose: { ...POSES.holdFront, hF: [60, -150], hB: [56, -158] }, expr: 'suspicious', t: T, facing: -1, look: [-0.6, 0.2] });
  glow(g, 1600, 470, 170, TOXICO, 0.35);   // luz verde de baixo no rosto dela
  // a caixa "PROJETO CÉREBRO" entreaberta, com o organismo brilhando dentro
  g.save(); g.translate(bx, by); g.scale(0.85, 0.85);
  rr(g, -250, -150, 500, 300, 16); g.fillStyle = INK; g.fill(); rr(g, -240, -140, 480, 280, 12); g.fillStyle = '#4a5260'; g.fill();
  g.save(); rr(g, -220, -150, 440, 60, 6); g.clip(); organismo(g, 0, -80, 0.55, T, { brilho: TOXICO }); g.restore();
  glow(g, 0, -150, 380, TOXICO, 0.95);
  for (let i = 0; i < 7; i++) seg(g, [[-210 + i * 70, -150], [-330 + i * 110, -560]], 34, alpha(TOXICO, 0.16));
  g.save(); rr(g, -260, -560, 520, 410, 0); g.clip(); organismo(g, 0, -260, 0.9, T, { brilho: TOXICO }); g.restore();
  g.save(); g.translate(-250, -150); g.rotate(-1.15); rr(g, 0, -14, 300, 28, 8); g.fillStyle = INK; g.fill(); rr(g, 6, -8, 288, 16, 6); g.fillStyle = '#6a7382'; g.fill(); g.restore();   // tampa aberta pra trás
  g.save(); g.rotate(-0.06); rr(g, -205, -45, 410, 100, 10); g.strokeStyle = VERMELHO; g.lineWidth = 9; g.stroke();
  text(g, 'PROJETO', 0, -12, { size: 40, color: VERMELHO, font: FONTS.ui, weight: 900, spacing: 6 }); text(g, 'CÉREBRO', 0, 30, { size: 46, color: VERMELHO, font: FONTS.ui, weight: 900, spacing: 6 }); g.restore();
  g.restore();
  // Eduardo em primeiro plano, chocado, olhando pra mãe
  const fx = 470, fy = 700, fr = 290;
  halo(g, fx, fy, fr, '#9fd8ff', 0.35);
  ring(g, fx, fy, fr * 1.16 + 10, 20, '#bfe8ff');
  bigFace(g, fx, fy, fr, { outfit: EDUARDO, expr: 'shocked', look: [0.9, 0], t: T, tilt: -0.05 });
  vinheta(g, 0.55);
  selo(g, 70, 90);
  titulo(g, 'ELA', 70, 250, 210, BRANCO); titulo(g, 'SABIA', 70 + measure(g, 'ELA ', 210) + 10, 238, 210, AMARELO);
} });

// ============ C — "NÃO ABRA!" ============
registerShot('C', { draw(g) {
  blurLayer(g, 7, g => bunkerSala(g, T, { z: 1.4, x: -150, y: 120, r: 0 }, { lamp: 0.7 }), null, 1);
  veil(g, '#060810', 0.5);
  // alçapão de metal no teto, empenado, com fresta
  const hx = 520, hy = 0;
  g.save(); g.translate(hx, hy);
  rr(g, -430, -40, 860, 300, 18); g.fillStyle = INK; g.fill(); rr(g, -418, -30, 836, 276, 12); g.fillStyle = '#3d4652'; g.fill();
  for (let i = 0; i < 5; i++) seg(g, [[-360 + i * 180, -20], [-360 + i * 180, 230]], 6, alpha('#000', 0.35));
  // fresta aberta com os olhos
  poly(g, [[-300, 160], [320, 140], [300, 250], [-280, 262]], '#020203');
  g.save(); g.globalCompositeOperation = 'lighter'; poly(g, [[-260, 240], [280, 230], [420, 1100], [-380, 1100]], linGrad(g, 0, 240, 0, 1000, [alpha(TOXICO, 0.28), alpha(TOXICO, 0)])); g.restore();
  olhosBrilhando(g, 30, 200, 1.3);
  garra(g, -190, 240, 1.2, 0.15); garra(g, 230, 230, 1.1, -0.2);
  g.restore();
  fallout(g, 2.0, { count: 90, a: 0.5, area: [80, 200, 900, 700] });
  g.save(); g.fillStyle = radGrad(g, E.W / 2, E.H / 2, E.H * 0.4, E.W * 0.7, [alpha(VERMELHO, 0), alpha(VERMELHO, 0.6)]); g.fillRect(0, 0, E.W, E.H); g.restore();
  const fx = 560, fy = 800, fr = 280;
  halo(g, fx, fy, fr, '#ffcf6a', 0.4);
  ring(g, fx, fy, fr * 1.16 + 10, 20, AMARELO);
  bigFace(g, fx, fy, fr, { outfit: EDUARDO, expr: 'panic', face: { eyes: 'wide' }, look: [0.2, -1], t: T, emote: 'sweat', tilt: -0.08 });
  vinheta(g, 0.55);
  titulo(g, 'NÃO', 1150, 380, 260, BRANCO);
  titulo(g, 'ABRA!', 1100, 640, 260, VERMELHO);
  selo(g, 1150, 130);
} });
