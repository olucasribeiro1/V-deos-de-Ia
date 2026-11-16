// Ep. 2 — s16–s30: "tá bem, mãe?", o rádio, Projeto Cérbero, a mãe sem resposta, título e chamada
import { E, SAFE, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, wordTime, rr, seg, poly, circle, glow, shade, alpha, text, FONTS, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bunkerSala, radio, onda, caixote, POS } from '/series/mamae/bunker.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';
import { INK, WH, blink, mao, parede } from './01_bunker.js';

const ARM = { ...POSES.sad, eF: [-4, -140], hF: [-14, -128], eB: [16, -134], hB: [4, -150] };   // segurando o próprio braço

registerShot('s16', { draw(g, t, info) {
  const T = info.globalT, k = ease.inOut(t / info.dur), cam = { z: 1.34 + 0.06 * k, x: -200, y: 170 };
  const { GY } = bunkerSala(g, t, cam, { dark: 0.2 });
  layer(g, cam, 1, g => { caixote(g, 230, GY + 60, 170, 122);
    drawFigure(g, { x: 215, y: GY + 60, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(POSES.sit, t, 0.5, 4), expr: 'sad', look: [0.2, 0.5], blink: blink(t, 2.4) });
    drawFigure(g, { x: 500, y: GY + 80, s: 1.7, facing: -1, outfit: EDUARDO, pose: breathe(POSES.kneel, t, 0.6, 1), expr: 'worried', talk: talkAmount(T, ...info.L.e1), blink: blink(t) }); });
}});
registerShot('s17', { draw(g, t, info) {
  const T = info.globalT, cam = { z: 1.0 + 0.05 * (t / info.dur) };
  blurLayer(g, 12, g => bunkerSala(g, t, { z: 1.5, x: -200, y: 200 }), cam, 0.6); veil(g, '#000', 0.45);
  layer(g, cam, 1, g => bigFace(g, 500, 880, 300, { outfit: MARIANA, expr: 'smile', talk: talkAmount(T, ...info.L.m1), look: [0.3, 0.1], blink: blink(t, 1.7), rimSide: 1, face: { brows: 'worried' } }));
}});
registerShot('s18', { draw(g, t, info) {   // "Cansada."
  const cam = { z: 1.04 + 0.05 * (t / info.dur) };
  blurLayer(g, 12, g => bunkerSala(g, t, { z: 1.5, x: 0, y: 200 }), cam, 0.6); veil(g, '#000', 0.45);
  layer(g, cam, 1, g => bigFace(g, 500, 880, 300, { outfit: EDUARDO, expr: 'confused', look: [-0.6, 0], blink: blink(t, 2.9), rimSide: -1 }));
}});
registerShot('s19', { draw(g, t, info) {   // a mesma resposta dos últimos meses
  const k = ease.inOut(t / info.dur), cam = { z: 1.5 + 0.1 * k, x: -260, y: 190 };
  const { GY } = bunkerSala(g, t, cam, { dark: 0.38 });
  layer(g, cam, 1, g => { caixote(g, 230, GY + 60, 170, 122); drawFigure(g, { x: 215, y: GY + 60, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(POSES.sit, t, 0.4, 4), expr: t < 0.8 ? 'smile' : 'sad', look: [0.1, 0.8], blink: blink(t, 2.4), face: t < 0.8 ? { brows: 'worried' } : null }); });
}});
registerShot('s20', { draw(g, t, info) {   // Osvaldo tenta captar alguma frequência
  const k = ease.inOut(t / info.dur), cam = { z: 1.4 + 0.08 * k, x: 250, y: 210 };
  const { GY } = bunkerSala(g, t, cam, { radioOn: 1 });
  layer(g, cam, 1, g => { drawFigure(g, { x: 640, y: GY + 50, s: 1.7, facing: 1, outfit: OSVALDO, pose: breathe(posesAt(t % 1.6, [[0, 'reach'], [0.8, 'holdFront'], [1.6, 'reach']], 0.3), t, 1, 5), expr: 'determined', blink: blink(t, 2.7) });
    onda(g, 700, GY - 470, 250, t, { amp: 16, color: '#e6d24a', lw: 4 }); });
}});
const radioGrande = (g, t, voz, on = 1) => { parede(g, '#8a5440', 0.45); g.fillStyle = '#9a6a4c'; g.fillRect(-200, 1240, 1500, 900); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(-200, 1240, 1500, 900);
  if (on) glow(g, 500, 1000, 800, voz > 0.2 ? '#d8342b' : '#f0d880', 0.25); radio(g, 480, 1240, 3.0, t, { on, voz }); };
registerShot('s21', { draw(g, t, info) {   // a maior parte é estática
  const z = 1 + 0.03 * t; g.save(); g.translate(500, 950); g.scale(z, z); g.translate(-500, -950); radioGrande(g, t, 0);
  onda(g, 130, 560, 740, t, { amp: 34, color: '#e6d24a', lw: 6 }); onda(g, 130, 560, 740, t + 3, { amp: 20, color: '#f1efe9', lw: 3, seed: 4 });
  g.restore();
}});
registerShot('s22', { draw(g, t, info) {   // a transmissão
  const sh = shake(t, 7, 18), ui = S().ui; g.save(); g.translate(500 + sh[0], 950 + sh[1]); g.scale(1.08, 1.08); g.translate(-500, -950); radioGrande(g, t, 1);
  onda(g, 110, 560, 780, t, { amp: 150, color: ui.accent, lw: 9 }); onda(g, 110, 560, 780, t + 2, { amp: 60, color: '#f1efe9', lw: 4, seed: 5 });
  g.restore(); veil(g, ui.accent, 0.08 + 0.05 * Math.sin(t * 20), 'lighter');
}});
registerShot('s23', { draw(g, t, info) {   // todo mundo congela olhando o rádio
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 + 0.06 * k, x: 20, y: 60 };
  const { GY } = bunkerSala(g, t, cam, { radioOn: 1, voz: 1 });
  const lk = { look: [1, -0.1], blink: false };
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 190, y: GY + 70, s: 1.6, facing: 1, outfit: MARIANA, pose: POSES.handsOnHead, expr: 'scared', ...lk });
    drawFigure(g, { x: 350, y: GY + 90, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: POSES.relaxed, expr: 'surprised', ...lk });
    drawFigure(g, { x: 500, y: GY + 70, s: 1.6, facing: 1, outfit: EDUARDO, pose: POSES.ready, expr: 'shocked', ...lk });
    drawFigure(g, { x: 650, y: GY + 50, s: 1.6, facing: 1, outfit: OSVALDO, pose: POSES.reach, expr: 'nervous', ...lk });
    onda(g, 700, GY - 470, 250, t, { amp: 50, color: S().ui.accent, lw: 5 }); });
  veil(g, S().ui.accent, 0.06, 'lighter');
}});
registerShot('s24', { draw(g, t, info) {   // Osvaldo desliga rápido demais
  const hit = 0.5, off = t > hit, sh = off ? shake(t, 14 * Math.max(0, 1 - (t - hit) * 4), 22) : [0, 0];
  g.save(); g.translate(500 + sh[0], 950 + sh[1]); g.scale(1.1, 1.1); g.translate(-500, -950); radioGrande(g, t, off ? 0 : 1, off ? 0 : 1);
  if (!off) onda(g, 110, 560, 780, t, { amp: 90, color: S().ui.accent, lw: 8 });
  const hx = lerp(1300, 760, ease.out(prog(t, 0.15, hit)));
  mao(g, [[hx + 500, 1700], [hx + 180, 1260], [hx, 1090]], 130); for (let i = 0; i < 3; i++) mao(g, [[hx + 10 + i * 30, 1090 + i * 10], [hx - 90 + i * 20, 1010 + i * 36]], 44);
  if (off) FX.rings(g, 700, 1080, t - hit, { count: 2, r0: 120, r1: 480, color: '#ffffff', a: 0.4 * Math.max(0, 1 - (t - hit) * 2), speed: 2.2, w: 5 });
  g.restore(); if (off) veil(g, '#05070c', 0.25);
}});
registerShot('s25', { draw(g, t, info) {   // pra quem diz que é só estática: Mariana trava
  const k = ease.inOut(t / info.dur), cam = { z: 1.3 + 0.1 * k, x: -120, y: 150 };
  const { GY } = bunkerSala(g, t, cam, { dark: 0.2 });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 560, y: GY + 30, s: 1.6, facing: -1, outfit: OSVALDO, pose: breathe(POSES.think, t, 1, 5), expr: 'nervous', look: [0.6, 0.4], blink: blink(t, 1.6) });
    drawFigure(g, { x: 300, y: GY + 80, s: 2.0, facing: 1, outfit: MARIANA, pose: breathe(ARM, t, 1.6, 4), expr: 'scared', look: [0.2, 0.7] }); });
}});
registerShot('s26', { draw(g, t, info) {   // "Projeto Cérbero?"
  const T = info.globalT, k = ease.inOut(t / info.dur), cam = { z: 1.2 + 0.06 * k, x: 60, y: 110 };
  const { GY } = bunkerSala(g, t, cam);
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 690, y: GY + 40, s: 1.7, facing: -1, outfit: OSVALDO, pose: breathe(POSES.crossArms, t, 1, 5), expr: 'nervous', look: [0, 0.6] });
    drawFigure(g, { x: 480, y: GY + 70, s: 1.9, facing: 1, outfit: EDUARDO, pose: breathe(posesAt(t, [[0, 'relaxed'], [0.2, 'point']], 0.18), t, 1, 1), expr: 'confused', talk: talkAmount(T, ...info.L.e2) }); });
}});
registerShot('s27', { draw(g, t, info) {   // "Que isso, mãe?"
  const T = info.globalT, sh = shake(t, 4, 10), cam = { z: 1.05 + 0.08 * ease.out(t / info.dur), x: sh[0], y: sh[1] };
  blurLayer(g, 12, g => bunkerSala(g, t, { z: 1.5, x: 0, y: 200 }), cam, 0.6); veil(g, '#000', 0.4);
  layer(g, cam, 1, g => bigFace(g, 500, 880, 305, { outfit: EDUARDO, expr: 'angry', talk: talkAmount(T, ...info.L.e2), look: [-0.7, 0], rimSide: -1, tilt: -0.04 }));
}});
registerShot('s28', { draw(g, t, info) {   // a mãe sem resposta
  const T = info.globalT, k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.16 * k };
  blurLayer(g, 12, g => bunkerSala(g, t, { z: 1.5, x: -200, y: 200 }, { dark: 0.3 }), cam, 0.6); veil(g, '#000', 0.5 + 0.15 * k);
  const cry = T > info.L.n5[0] + 1.6;
  layer(g, cam, 1, g => bigFace(g, 500, 890, 300, { outfit: MARIANA, expr: cry ? 'cry' : 'scared', look: [0.2, cry ? 0.5 : 0], blink: !cry && blink(t, 2.1), rimSide: 1, face: cry ? { mouth: 'wavy' } : { mouth: 'smallFlat' } }));
}});
registerShot('s29', { draw(g, t, info) {   // título
  const ui = S().ui; g.fillStyle = '#060607'; g.fillRect(0, 0, E.W, E.H); glow(g, 500, 1500, 700, '#e6d24a', 0.1 + 0.03 * Math.sin(t * 5));
  onda(g, 200, 1300, 600, t, { amp: 30, color: alpha('#e6d24a', 0.5), lw: 4 });
  const z = 1 + 0.03 * t; g.save(); g.translate(500, 900); g.scale(z, z);
  const a1 = ease.out(prog(t, 0.1, 0.5)), a2 = ease.out(prog(t, 0.35, 0.8)), a3 = ease.out(prog(t, 0.7, 1.1));
  text(g, 'O QUE A MAMÃE SABIA', 0, -230, { size: 40, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 6, alpha: a1 });
  text(g, 'RAÇÃO', 0, -110, { size: 130, color: ui.cream, spacing: 3, alpha: a2 }); text(g, 'DE GUERRA', 0, 14, { size: 116, color: ui.cream, spacing: 3, alpha: a2 });
  g.fillStyle = alpha(ui.accent, a3); g.fillRect(-170 * a3, 104, 340 * a3, 8);
  text(g, 'EPISÓDIO 2', 0, 174, { size: 54, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 8, alpha: a3 });
  g.restore();
}});
registerShot('s30', { draw(g, t, info) { UI.seguir(g, t, { proximo: 'EP. 3 — A CAIXA DA MAMÃE', outfit: EDUARDO }); } });
