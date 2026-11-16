// Ep. 2 — RAÇÃO DE GUERRA · s01–s15: o bunker equipado, a ração, os 22 anos de Exército, a mãe calada
import { E, SAFE, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, wordTime, rr, seg, poly, circle, glow, shade, alpha, text, FONTS, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { bunkerSala, tijolos, gerador, filtroAr, prateleira, mapa, lata, caixote, POS } from '/series/mamae/bunker.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';

export const INK = '#0b0b0d', WH = '#f1efe9';
export const blink = (t, p = 3.1) => (t % p) > p - 0.12;
export const mao = (g, pts, w = 60) => { seg(g, pts, w + 14, INK); seg(g, pts, w, WH); };
export const parede = (g, c = '#8a5440', d = 0.35) => { tijolos(g, -200, -200, E.W + 400, E.H + 400, c, 130, 60); veil(g, '#05070c', d); };
export const rotulo = (g, str, t, y = 430, color = null) => { const a = ease.outBack(prog(t, 0.08, 0.35)); if (a <= 0) return; g.save(); g.translate(500, y); g.scale(a, a); text(g, str, 0, 0, { size: 110, color: color || S().ui.gold, stroke: 22, strokeColor: INK, spacing: 2 }); g.restore(); };
const SALUTE = { ...POSES.stand, eF: [30, -176], hF: [16, -214] };
const HIPS = { ...POSES.stand, eF: [26, -136], hF: [10, -108], eB: [-24, -136], hB: [-8, -108] };

registerShot('s01', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), sh = shake(t, 9 * Math.max(0, 1 - t * 0.9), 16), cam = { z: 1.16 - 0.14 * k, x: sh[0], y: 60 - 60 * k + sh[1] };
  const { GY } = bunkerSala(g, t, cam, { radioOn: 0 });
  const up = { look: [0, -1] };
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 250, y: GY + 60, s: 1.5, facing: 1, outfit: MARIANA, pose: breathe(POSES.sad, t, 1, 4), expr: 'sad', look: [0, 0.6] });
    drawFigure(g, { x: 420, y: GY + 80, s: 1.5 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.handsOnHead, t, 1, 2), expr: 'scared', ...up });
    drawFigure(g, { x: 580, y: GY + 60, s: 1.5, facing: -1, outfit: EDUARDO, pose: breathe(POSES.relaxed, t, 1, 1), expr: 'worried', ...up, blink: blink(t) });
    drawFigure(g, { x: 740, y: GY + 80, s: 1.5, facing: -1, outfit: OSVALDO, pose: breathe(HIPS, t, 1, 5), expr: 'determined' });
  });
  FX.dust(g, t, { count: 60, color: '#e8d8c0', speed: -40, a: 0.6 * Math.max(0.2, 1 - t * 0.4) });
}});

registerShot('s02', { draw(g, t, info) {   // GERADOR
  parede(g); glow(g, 500, 900, 700, '#ffd98a', 0.2);
  const z = 2.5 + 0.12 * t; g.save(); g.translate(500, 1090); g.scale(z, z); gerador(g, 0, 0, t, 1); g.restore();
  for (let i = 0; i < 3; i++) { const ph = (t * 1.4 + i / 3) % 1; circle(g, 800 + ph * 60, 760 - ph * 200, 20 + ph * 40, alpha('#c9ccd2', 0.3 * (1 - ph))); }
  rotulo(g, 'GERADOR', t);
}});
registerShot('s03', { draw(g, t, info) {   // FILTRO DE AR
  parede(g); const z = 2.1 + 0.1 * t; g.save(); g.translate(500, 1000); g.scale(z, z); filtroAr(g, 0, 0, t * 1.6, 1); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const ph = (t * 1.2 + i / 7) % 1, y = 760 + i * 70; seg(g, [[60 + ph * 200, y], [180 + ph * 200, y]], 6, alpha('#cfe8ff', 0.35 * (1 - ph))); } g.restore();
  rotulo(g, 'FILTRO DE AR', t, 400);
}});
registerShot('s04', { draw(g, t, info) {   // prateleira de comida até o teto (câmera sobe)
  const k = ease.inOut(t / info.dur), yy = lerp(-900, 250, k);
  parede(g, '#8a5440', 0.25);
  g.save(); g.translate(0, yy); prateleira(g, 140, 300, 720, 2500, 11); g.restore();
  glow(g, 500, 300, 900, '#ffd98a', 0.18);
  const GY = 2500 + yy;
  drawFigure(g, { x: 500, y: GY + 20, s: 1.7 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.relaxed, t, 1, 2), expr: 'awe', look: [0, -1] });
  const a = ease.outBack(prog(t, 1.2, 1.5)); if (a > 0) { g.save(); g.translate(500, 420); g.scale(a, a); text(g, 'ATÉ O TETO', 0, 0, { size: 104, color: S().ui.gold, stroke: 22, strokeColor: INK }); g.restore(); }
}});
registerShot('s05', { draw(g, t, info) {   // não tinha cavado um buraco
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 + 0.08 * k, x: 60, y: 60 };
  const { GY } = bunkerSala(g, t, cam);
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 470, y: GY + 60, s: 1.8, facing: 1, outfit: EDUARDO, pose: breathe(posesAt(t, [[0, 'relaxed'], [0.9, 'think']]), t, 1, 1), expr: 'surprised', look: [0.6, -0.5], blink: blink(t) });
    drawFigure(g, { x: 690, y: GY + 50, s: 1.8, facing: -1, outfit: OSVALDO, pose: breathe(HIPS, t, 1, 5), expr: 'smirk', blink: blink(t, 2.7) });
  });
  FX.dust(g, t, { count: 26 });
}});
registerShot('s06', { draw(g, t, info) {   // tinha montado um plano: mapa + checklist
  parede(g, '#8a5440', 0.3); const z = 1 + 0.04 * t; g.save(); g.translate(500, 900); g.scale(z, z); g.translate(-500, -900);
  g.save(); g.translate(120, 380); g.scale(2.5, 2.5); mapa(g, 0, 0, 300, 210); g.restore();
  const it = ['ÁGUA', 'COMIDA', 'AR', 'LUZ'];
  it.forEach((s2, i) => { const a = ease.outBack(prog(t, 0.25 + i * 0.3, 0.5 + i * 0.3)); if (a <= 0) return; const x = 250 + (i % 2) * 380, y = 1040 + Math.floor(i / 2) * 130; g.save(); g.translate(x, y); g.scale(a, a); rr(g, -150, -50, 300, 100, 20); g.fillStyle = INK; g.fill(); rr(g, -142, -42, 284, 84, 14); g.fillStyle = '#e6dcc0'; g.fill(); seg(g, [[-118, 0], [-100, 18], [-70, -20]], 12, '#3f9a5a'); text(g, s2, 30, 4, { size: 48, color: '#16181d', font: FONTS.ui, weight: 900 }); g.restore(); });
  g.restore();
}});
registerShot('s07', { draw(g, t, info) {   // cheira a comida de exército
  parede(g, '#5a5f66', 0.3); const z = 1.02 + 0.06 * (t / info.dur); g.save(); g.translate(500, 900); g.scale(z, z); g.translate(-500, -900);
  g.fillStyle = '#9a6a4c'; g.fillRect(-200, 1150, 1500, 900); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(-200, 1150, 1500, 900);
  rr(g, 290, 830, 420, 340, 30); g.fillStyle = INK; g.fill(); rr(g, 302, 842, 396, 316, 22); g.fillStyle = '#c9ced6'; g.fill(); g.fillStyle = '#55623a'; g.fillRect(302, 930, 396, 150);
  text(g, 'RAÇÃO', 500, 985, { size: 64, color: '#e6dcc0', font: FONTS.ui, weight: 900, spacing: 4 }); text(g, 'TIPO 3', 500, 1046, { size: 34, color: '#e6dcc0', font: FONTS.ui, weight: 900, spacing: 4 });
  g.fillStyle = INK; g.beginPath(); g.ellipse(500, 842, 210, 46, 0, 0, 7); g.fill(); g.fillStyle = '#8a9a3a'; g.beginPath(); g.ellipse(500, 842, 196, 36, 0, 0, 7); g.fill(); circle(g, 440, 836, 18, '#6f7f2a'); circle(g, 560, 848, 14, '#a8b84a');
  for (let i = 0; i < 4; i++) { const x = 380 + i * 80; g.strokeStyle = alpha('#9ab83a', 0.75); g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20, yy = 780 - u * 300 - ((t * 60) % 40), xx = x + Math.sin(u * 7 + t * 4 + i) * 22; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  mao(g, [[1200, 1500], [880, 1020], [760, 900]], 110); seg(g, [[770, 900], [610, 820]], 26, INK); seg(g, [[770, 900], [610, 820]], 14, '#c9ced6');
  g.restore();
}});
registerShot('s08', { draw(g, t, info) {
  const T = info.globalT, k = ease.inOut(t / info.dur), cam = { z: 1.24 + 0.06 * k, x: 20, y: 110 };
  const { GY } = bunkerSala(g, t, cam);
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 420, y: GY + 60, s: 1.9 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(posesAt(t, [[0, 'holdFront'], [0.9, 'shrug']], 0.25), t, 1, 2), expr: 'confused', talk: talkAmount(T, ...info.L.r1) });
    lata(g, 500, GY - 180 + Math.sin(t * 3) * 3, '#55623a', 1.3);
    drawFigure(g, { x: 680, y: GY + 50, s: 1.9, facing: -1, outfit: OSVALDO, pose: breathe(POSES.crossArms, t, 1, 5), expr: 'neutral', blink: blink(t, 2.7) });
  });
  FX.dust(g, t, { count: 24 });
}});
registerShot('s09', { draw(g, t, info) {
  const T = info.globalT, cam = { z: 1.0 + 0.05 * (t / info.dur) };
  blurLayer(g, 12, g => bunkerSala(g, t, { z: 1.5, x: 100, y: 200 }), cam, 0.6); veil(g, '#000', 0.4);
  layer(g, cam, 1, g => bigFace(g, 500, 870, 300, { outfit: OSVALDO, expr: 'neutral', talk: talkAmount(T, ...info.L.o1), look: [-0.3, 0], rimSide: -1 }));
}});
registerShot('s10', { draw(g, t, info) {   // 22 anos de Exército
  g.fillStyle = '#4c5a30'; g.fillRect(0, 0, E.W, E.H); g.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 0; i < 12; i++) g.fillRect(0, i * 180, E.W, 90);
  glow(g, 500, 800, 900, '#e6d24a', 0.16);
  const z = 1 + 0.05 * t; g.save(); g.translate(500, 1000); g.scale(z, z); g.translate(-500, -1000);
  g.fillStyle = '#3a4526'; g.fillRect(-100, 1300, 1300, 800);
  drawFigure(g, { x: 500, y: 1300, s: 2.6, facing: 1, outfit: OSVALDO, pose: posesAt(t, [[0, 'stand'], [0.3, SALUTE]], 0.2), expr: 'determined' });
  g.restore();
  const a = ease.outBack(prog(t, 0.15, 0.45)); g.save(); g.translate(500, 400); g.scale(a, a); text(g, '22 ANOS', 0, 0, { size: 150, color: S().ui.gold, stroke: 24, strokeColor: INK }); text(g, 'DE EXÉRCITO', 0, 110, { size: 58, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 5, stroke: 12, strokeColor: INK }); g.restore();
  veil(g, '#c9b060', 0.08);
}});
registerShot('s11', { draw(g, t, info) {   // instrutor de sobrevivência
  g.fillStyle = '#4c5a30'; g.fillRect(0, 0, E.W, E.H); g.fillStyle = '#3a4526'; g.fillRect(0, 1320, E.W, 700);
  const z = 1 + 0.04 * t; g.save(); g.translate(500, 1000); g.scale(z, z); g.translate(-500, -1000);
  rr(g, 90, 520, 480, 380, 14); g.fillStyle = INK; g.fill(); rr(g, 102, 532, 456, 356, 8); g.fillStyle = '#26382c'; g.fill();
  poly(g, [[190, 780], [270, 620], [350, 780]], '#e6dcc0'); seg(g, [[270, 620], [270, 780]], 5, '#26382c');                                   // barraca
  for (let i = 0; i < 3; i++) { g.fillStyle = ['#e0a030', '#e6d24a', '#d8703a'][i]; g.beginPath(); g.ellipse(455, 760 - i * 14, 34 - i * 9, 44 - i * 10, 0, 0, 7); g.fill(); } seg(g, [[410, 790], [500, 790]], 10, '#b08a5a');   // fogueira
  text(g, 'SOBREVIVÊNCIA', 330, 590, { size: 40, color: '#e6dcc0', font: FONTS.ui, weight: 900, spacing: 3 });
  drawFigure(g, { x: 660, y: 1320, s: 2.0, facing: -1, outfit: OSVALDO, pose: breathe(POSES.point, t, 1, 5), expr: 'angry', talk: 0.5 + 0.5 * Math.sin(t * 14) });
  for (let i = 0; i < 4; i++) drawFigure(g, { x: 130 + i * 110, y: 1500 + (i % 2) * 30, s: 1.5, facing: 1, outfit: { top: 'none', head: 'none' }, pose: breathe(POSES.stand, t, 1, i + 9), expr: i === 2 ? 'sleepy' : 'nervous' });
  g.restore(); veil(g, '#c9b060', 0.08);
}});
registerShot('s12', { draw(g, t, info) {   // a vida inteira esperando por esse dia
  const k = ease.inOut(t / info.dur), cam = { z: 1.2 + 0.14 * k, x: 150, y: 120 };
  const { GY } = bunkerSala(g, t, cam);
  layer(g, cam, 1, g => drawFigure(g, { x: 640, y: GY + 60, s: 2.1, facing: 1, outfit: OSVALDO, pose: breathe(posesAt(t, [[0, 'holdFront'], [1.6, HIPS]], 0.3), t, 1, 5), expr: t > 1.6 ? 'smirk' : 'determined', look: [0.5, -0.2], blink: blink(t, 2.7) }));
  FX.dust(g, t, { count: 26 });
}});
registerShot('s13', { draw(g, t, info) {   // Rafael reclama da ração
  const sh = shake(t, 5, 9), cam = { z: 1.0 + 0.05 * (t / info.dur), x: sh[0], y: sh[1] };
  blurLayer(g, 12, g => bunkerSala(g, t, { z: 1.5, x: -100, y: 200 }), cam, 0.6); veil(g, '#1a3a10', 0.3);
  layer(g, cam, 1, g => { bigFace(g, 500, 880, 300, { outfit: RAFAEL, expr: 'cry', look: [0, 0.4], rimSide: 1, tilt: 0.06 * Math.sin(t * 9), face: { mouth: 'wavy' } });
    mao(g, [[1100, 1700], [860, 1300], [760, 1180]], 90); seg(g, [[770, 1180], [640, 1060]], 26, INK); seg(g, [[770, 1180], [640, 1060]], 14, '#c9ced6'); circle(g, 630, 1050, 30, INK); circle(g, 630, 1050, 22, '#8a9a3a'); });
}});
registerShot('s14', { draw(g, t, info) {   // você percebe que sua mãe não falou uma palavra
  const cam = { z: 1.0 + 0.07 * ease.inOut(t / info.dur) };
  blurLayer(g, 12, g => bunkerSala(g, t, { z: 1.5, x: 60, y: 200 }), cam, 0.6); veil(g, '#000', 0.4);
  const turn = ease.inOut(prog(t, 0.2, 1.0));
  layer(g, cam, 1, g => bigFace(g, 500, 880, 300, { outfit: EDUARDO, expr: turn > 0.6 ? 'worried' : 'neutral', look: [lerp(0.6, -0.9, turn), 0.1], blink: blink(t, 2.9), rimSide: -1 }));
}});
registerShot('s15', { draw(g, t, info) {   // desde que a porta fechou: Mariana no canto
  const k = ease.inOut(t / info.dur), cam = { z: 1.3 + 0.12 * k, x: -230, y: 150 };
  const { GY } = bunkerSala(g, t, cam, { dark: 0.3 });
  layer(g, cam, 1, g => { caixote(g, 230, GY + 60, 170, 122); drawFigure(g, { x: 215, y: GY + 60, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(POSES.sit, t, 0.5, 4), expr: 'sad', look: [0.3, -1], blink: blink(t, 2.4) }); });
  FX.dust(g, t, { count: 20 });
}});
