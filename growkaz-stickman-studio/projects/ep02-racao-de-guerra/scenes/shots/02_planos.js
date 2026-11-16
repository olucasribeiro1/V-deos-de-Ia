// Ep. 2 — planos longos (J–S): flashback do Exército, a conta da água, a mãe, o rádio, Cérbero, o arranhão
import { E, SAFE, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, wordTime, rr, seg, poly, circle, glow, shade, alpha, text, FONTS, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bunkerSala, radio, onda, caixote, galao } from '/series/mamae/bunker.js';
import { cozinha, bancada } from '/series/mamae/interiores.js';
import { fallout, alerta, relogio, impacto, riscosSusto, olhosNoEscuro } from '/series/mamae/efeitos.js';
import { foco, K } from '/series/mamae/camera.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';
import { INK, WH, blink, mao, parede, rotulo, fundoBunker, escada, HIPS, SALUTE, ARM } from './01_planos.js';
const GY0 = 1305.6;
const W = (w, L, n = 0) => wordTime(w, L[0] - 0.05) ?? (L[0] + n);

// J — flashback: continência → a câmera corre pro lado e mostra o tio dando aula de sobrevivência
registerShot('J', { draw(g, t, info) {
  const T = info.globalT, tI = W('instrutor', info.L.n5), k = ease.inOut(prog(T, tI - 0.4, tI + 0.4));
  g.fillStyle = '#4c5a30'; g.fillRect(0, 0, E.W, E.H); glow(g, 500, 800, 900, '#e6d24a', 0.14);
  const cam = { z: 1.15 + 0.05 * t, x: 1300 * k - 40, y: 0 };
  layer(g, cam, 1, g => { g.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 0; i < 12; i++) g.fillRect(-400, i * 180, 3200, 90); g.fillStyle = '#3a4526'; g.fillRect(-400, 1300, 3200, 900);
    drawFigure(g, { x: 500, y: 1300, s: 2.6, facing: 1, outfit: OSVALDO, pose: posesAt(t, [[0, 'stand'], [0.25, SALUTE]], 0.15), expr: 'determined' });
    const ox = 1300; rr(g, ox + 90, 520, 480, 380, 14); g.fillStyle = INK; g.fill(); rr(g, ox + 102, 532, 456, 356, 8); g.fillStyle = '#26382c'; g.fill(); poly(g, [[ox + 190, 780], [ox + 270, 620], [ox + 350, 780]], '#e6dcc0');
    for (let i = 0; i < 3; i++) { g.fillStyle = ['#e0a030', '#e6d24a', '#d8703a'][i]; g.beginPath(); g.ellipse(ox + 455, 760 - i * 14, 34 - i * 9, 44 - i * 10, 0, 0, 7); g.fill(); }
    text(g, 'SOBREVIVÊNCIA', ox + 330, 590, { size: 40, color: '#e6dcc0', font: FONTS.ui, weight: 900, spacing: 3 });
    drawFigure(g, { x: ox + 660, y: 1320, s: 2.0, facing: -1, outfit: OSVALDO, pose: breathe(POSES.point, t, 1, 5), expr: 'furious', talk: 0.5 + 0.5 * Math.sin(t * 14), t, emote: 'anger' });
    for (let i = 0; i < 4; i++) drawFigure(g, { x: ox + 130 + i * 110, y: 1500 + (i % 2) * 30, s: 1.5, facing: 1, outfit: { top: 'none', head: 'none' }, pose: breathe(POSES.stand, t, 1, i + 9), expr: i === 2 ? 'gulp' : 'terrified', t, emote: i === 1 ? 'sweat' : null }); });
  veil(g, '#c9b060', 0.12); text(g, 'ANOS ATRÁS', 500, 300, { size: 46, color: WH, font: FONTS.ui, weight: 900, spacing: 6, stroke: 12, strokeColor: INK });
}});
// K — galões de água deslizando e a prancheta da conta (4 L × 4 × 30 = 480 L)
registerShot('Kc', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tP = W('pessoas', L.n5), tD = W('trinta', L.n5);
  const cam = K(T, [[info.shot.start, { z: 1.0, x: -120, y: 260 }], [tP - 0.6, { z: 1.0, x: 120, y: 240 }], [tP, { z: 1.1, x: 0, y: -60 }], [info.shot.end, { z: 1.18, x: 0, y: -40 }]]);
  parede(g, '#8a5440', 0.35);
  layer(g, cam, 1, g => { g.fillStyle = '#5a5f66'; g.fillRect(-600, 1560, 2400, 700);
    for (let i = 0; i < 12; i++) { const a = ease.outBack(prog(T, info.shot.start + i * 0.05, info.shot.start + 0.25 + i * 0.05)); if (a <= 0) continue; g.save(); g.translate(-200 + i * 150, 1560); g.scale(a * 1.4, a * 1.4); galao(g, 0, 0, 1); g.restore(); }
    const pa = ease.outBack(prog(T, tP - 0.4, tP)); if (pa > 0) { g.save(); g.translate(540, 820); g.scale(pa, pa); g.rotate(-0.04); rr(g, -330, -400, 660, 800, 26); g.fillStyle = INK; g.fill(); rr(g, -318, -388, 636, 776, 20); g.fillStyle = '#efe8d0'; g.fill(); rr(g, -110, -430, 220, 70, 14); g.fillStyle = '#5a6068'; g.fill();
      ['4 LITROS', '× 4 PESSOAS', '× 30 DIAS'].forEach((s2, i) => { const a = ease.outBack(prog(T, [tP - 0.3, tP, tD][i], [tP - 0.3, tP, tD][i] + 0.25)); if (a <= 0) return; g.save(); g.translate(0, -230 + i * 120); g.scale(a, a); text(g, s2, 0, 0, { size: 80, color: '#16181d' }); g.restore(); });
      const r = ease.outBack(prog(T, tD + 0.6, tD + 0.9)); if (r > 0) { seg(g, [[-240, 140], [240, 140]], 8, INK); g.save(); g.translate(0, 250); g.scale(r, r); g.rotate(-0.05); text(g, '= 480 L', 0, 0, { size: 128, color: ui.accent, stroke: 18, strokeColor: INK }); g.restore(); }
      g.restore(); } });
}});
// L — nem o tio previu: a câmera atravessa o bunker até a mãe no canto; Eduardo chega, ajoelha; zoom no rosto dela
registerShot('L', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tM = W('mãe', L.n6), tE = L.e1[0], tR = L.m1[0];
  const walk = prog(T, tE - 1.2, tE - 0.1), ex = lerp(760, 500, ease.inOut(walk));
  const cam = K(T, [[info.shot.start, foco(720, GY0 - 280, 1.9)], [tM - 0.6, foco(450, GY0 - 280, 1.6)], [tM + 0.4, foco(240, GY0 - 280, 2.3)], [tE - 1.2, foco(300, GY0 - 260, 1.8)], [tE, foco(370, GY0 - 250, 1.75)], [L.e1[1] + 0.1, foco(370, GY0 - 250, 1.85)], [tR, foco(230, GY0 - 330, 3.4)], [info.shot.end, foco(230, GY0 - 335, 3.7)]]);
  const { GY } = bunkerSala(g, t, cam, { dark: 0.25 });
  layer(g, cam, 1, g => { drawFigure(g, { x: 720, y: GY + 50, s: 1.7, facing: 1, outfit: OSVALDO, pose: breathe(POSES.holdFront, t, 1, 5), expr: 'proud', blink: blink(t, 2.7) });
    caixote(g, 230, GY + 60, 170, 122);
    drawFigure(g, { x: 215, y: GY + 60, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(T < tR ? ARM : POSES.sit, t, 0.6, 4), expr: T < tR ? 'sad' : 'forced', talk: talkAmount(T, ...L.m1), look: T < tE ? [0.2, 0.7] : [0.6, 0.2], blink: blink(t, 2.4), t, emote: T < tE ? 'gloom' : T > tR ? 'sweat' : null });
    if (T > tE - 1.3) drawFigure(g, { x: ex, y: GY + 80, s: 1.7, facing: -1, outfit: EDUARDO, pose: walk < 1 ? walkPose(T * Math.PI * 2 * 0.9) : breathe(POSES.kneel, t, 0.6, 1), expr: 'worried', talk: talkAmount(T, ...L.e1), blink: blink(t) }); });
  const a = ease.outBack(prog(T, tM + 0.5, tM + 0.8)) * (1 - prog(T, tE - 1.4, tE - 1.1)); if (a > 0) { g.save(); g.translate(720, 620); g.scale(a, a); rr(g, -150, -70, 300, 140, 60); g.fillStyle = INK; g.fill(); rr(g, -140, -60, 280, 120, 52); g.fillStyle = WH; g.fill(); poly(g, [[-80, 52], [-130, 110], [-30, 56]], WH); text(g, '...', 0, -10, { size: 90, color: '#16181d' }); g.restore(); }
}});
// M — "Cansada." (Eduardo desconfiado)
registerShot('M', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.08 * ease.out(t / info.dur), x: -20 * t };
  fundoBunker(g, t, { z: 1.5, x: -150, y: 200 }); veil(g, '#000', 0.45);
  layer(g, cam, 1, g => bigFace(g, 500, 880, 300, { outfit: EDUARDO, expr: 'suspicious', look: [-0.7, 0], blink: false, rimSide: -1, t, emote: 'question' }));
}});
// N — flashback: a mesma resposta dos últimos meses
registerShot('N', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.25 - 0.1 * k, x: -40 + 80 * k, y: 60 };
  const { GY, M } = cozinha(g, t, cam);
  layer(g, cam, 1, g => { drawFigure(g, { x: 420, y: GY, s: 2.2, facing: 1, outfit: MARIANA, pose: breathe(POSES.phone, t, 1, 4), expr: 'forced', prop: 'phone', blink: blink(t, 2.6), t, emote: 'sweat' }); bancada(g, GY, M);
    drawFigure(g, { x: 780, y: GY + 40, s: 2.2, facing: -1, outfit: EDUARDO, pose: breathe(POSES.relaxed, t, 1, 1), expr: 'suspicious' }); });
  g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.globalAlpha = 0.75; g.fillRect(0, 0, E.W, E.H); g.restore(); veil(g, '#d8c8a0', 0.18);
  text(g, 'MESES ATRÁS', 500, 300, { size: 46, color: WH, font: FONTS.ui, weight: 900, spacing: 6, stroke: 12, strokeColor: INK });
}});
// O — HORA SEIS: o relógio gira, o tio liga o rádio, estática, a transmissão, todo mundo congela, ele desliga, olhares, "Projeto Cérbero? Que isso, mãe?"
registerShot('O', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, t0 = info.shot.start, tL = W('liga', L.n8), tS = W('só', L.n8), tRad = L.rad[0], tFr = W('não', L.rad), tOff = L.n9[0] + 0.2, tRap = W('rápido', L.n9), tE = L.e2[0], tQ = W('que', L.e2);
  const on = T > tL + 0.2 && T < tOff ? 1 : 0, voz = T > tRad && T < tOff ? 1 : 0;
  const R = [820, 1050, 0.85];
  const cam = K(T, [[t0, { z: 1.0, x: 0, y: 0 }], [tL - 0.3, foco(760, GY0 - 250, 1.7)], [tS, foco(820, 1050, 3.6, 0.85)], [tRad, foco(820, 1050, 3.9, 0.85)], [tFr - 0.1, foco(540, GY0 - 280, 1.25)], [tOff - 0.4, foco(540, GY0 - 280, 1.25)], [tOff, foco(820, 1050, 3.6, 0.85)], [tRap + 0.1, foco(640, GY0 - 300, 2.1)], [tRap + 1.2, foco(330, GY0 - 300, 2.2)], [tE - 0.1, foco(480, GY0 - 300, 1.8)], [tQ, foco(470, GY0 - 360, 3.4)], [info.shot.end, foco(470, GY0 - 365, 3.6)]]);
  const [dx, dy] = impacto(T, tRad, 18, 0.6), [ox, oy] = impacto(T, tOff, 22, 0.4); cam.x += (dx + ox) / cam.z; cam.y += (dy + oy) / cam.z;
  const { GY } = bunkerSala(g, t, cam, { radioOn: on, voz, dark: 0.2 });
  const frozen = T > tFr - 0.2 && T < tOff + 0.3, lk = frozen ? { look: [1, -0.1], blink: false } : {};
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 190, y: GY + 70, s: 1.6, facing: 1, outfit: MARIANA, pose: breathe(frozen || T > tRap ? ARM : POSES.sad, t, 1.4, 4), expr: frozen || T > tRap ? 'terrified' : 'sad', ...lk, t, emote: T > tRap ? 'sweat' : null });
    drawFigure(g, { x: 340, y: GY + 90, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.relaxed, t, 1, 2), expr: frozen ? 'gulp' : 'neutral', ...lk });
    drawFigure(g, { x: 480, y: GY + 70, s: 1.6, facing: 1, outfit: EDUARDO, pose: breathe(T > tE ? posesAt(T, [[tE, 'point'], [tQ, 'shrug']], 0.2) : frozen ? POSES.ready : POSES.relaxed, t, 1, 1), expr: T > tQ ? 'furious' : T > tE ? 'confused' : frozen ? 'shocked' : 'neutral', ...lk, talk: talkAmount(T, ...L.e2), t, emote: T > tQ ? 'anger' : T > tE ? 'question' : frozen ? 'exclaim' : null });
    drawFigure(g, { x: 660, y: GY + 50, s: 1.6, facing: T > tRap ? -1 : 1, outfit: OSVALDO, pose: breathe(T > tRap ? POSES.think : T > tL ? POSES.reach : POSES.holdFront, t, 1, 5), expr: T > tRap ? 'gulp' : frozen ? 'gulp' : 'determined', ...lk, t, emote: T > tRap ? 'sweat' : null });
    if (on) onda(g, 700, GY - 470, 250, t, { amp: voz ? 60 : 16, color: voz ? ui.accent : '#e6d24a', lw: 5 }); });
  if (T > tS - 0.2 && T < tFr - 0.1 && on) { onda(g, 130, 560, 740, t, { amp: voz ? 150 : 34, color: voz ? ui.accent : '#e6d24a', lw: 8 }); }
  if (voz) alerta(g, t, 0.7);
  const h = T < tL ? 12.2 + 6 * ease.inOut(prog(T, t0, tL - 0.3)) : null; if (h) { g.save(); g.translate(500, 860); const a = 1 - prog(T, tL - 0.5, tL - 0.2); g.globalAlpha = a; relogio(g, 0, 0, 230, h); g.restore(); }
  if (T > tOff - 0.1 && T < tOff + 0.6) { const k = T - tOff; FX.rings(g, 540, 960, Math.max(0, k), { count: 2, r0: 120, r1: 480, color: '#ffffff', a: 0.5 * Math.max(0, 1 - k * 2), speed: 2.2, w: 6 }); }
  if (T > tE) { const a = ease.outBack(prog(T, tE + 0.15, tE + 0.4)) * (1 - prog(T, tQ - 0.1, tQ + 0.1)); if (a > 0) { g.save(); g.translate(500, 420); g.scale(a, a); g.rotate(-0.04); text(g, 'CÉRBERO?', 0, 0, { size: 120, color: ui.accent, stroke: 22, strokeColor: INK, spacing: 3 }); g.restore(); } }
}});
// P — a mãe sem resposta (close, câmera empurrando devagar)
registerShot('P', { draw(g, t, info) {
  const T = info.globalT, k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.22 * k };
  fundoBunker(g, t, { z: 1.5, x: -200, y: 200 }, { dark: 0.3 }); veil(g, '#000', 0.5 + 0.15 * k);
  const cry = T > info.L.n10[0] + 1.8;
  layer(g, cam, 1, g => bigFace(g, 500, 890, 300, { outfit: MARIANA, expr: cry ? 'cry' : 'blank', look: [0.2, cry ? 0.5 : 0], blink: !cry && blink(t, 2.1), rimSide: 1, face: cry ? { mouth: 'wavy' } : { mouth: 'smallFlat' }, t }));
}});
// Q — madrugada: todos dormindo, a câmera sobe até o alçapão… e algo arranha
registerShot('Q', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tA = W('alguma', L.n11), scratch = T > tA + 0.6;
  const cam = K(T, [[info.shot.start, foco(540, GY0 - 150, 1.15)], [tA, foco(540, 520, 1.5)], [info.shot.end, foco(540, 430, 2.2)]]);
  const [dx, dy] = scratch ? impacto(T, tA + 0.6, 10, 3) : [0, 0]; cam.x += dx; cam.y += dy;
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.25, dark: 0.55 });
  layer(g, cam, 1, g => { escada(g, CX, GY);
    for (const [x, o] of [[230, MARIANA], [400, RAFAEL], [780, OSVALDO]]) drawFigure(g, { x, y: GY + 60, s: 1.3, facing: 1, outfit: o, pose: POSES.lie, rot: -1.5, expr: 'sleepy', shadow: false });
    drawFigure(g, { x: 640, y: GY + 60, s: 1.3, facing: 1, outfit: EDUARDO, pose: POSES.lie, rot: -1.5, expr: scratch ? 'terrified' : 'sleepy', t, shadow: false });
    if (scratch) { for (let i = 0; i < 3; i++) { const ph = ((T * 1.7 + i / 3) % 1); for (let j = 0; j < 5; j++) circle(g, CX - 150 + i * 140 + j * 9, 460 + ph * 500 + j * 14, 4, alpha('#b9bcc2', 0.8 * (1 - ph))); }
      for (let i = 0; i < 4; i++) { const ph = (T * 0.9 + i * 0.27) % 1; seg(g, [[CX - 120 + ph * 240, 340 + i * 22], [CX - 80 + ph * 240, 350 + i * 22]], 5, alpha(WH, 0.6 * Math.sin(ph * 3.14))); } } });
  if (scratch) veil(g, '#300000', 0.1 + 0.08 * Math.sin(T * 5));
}});
// R — título · S — segue a página
registerShot('R', { draw(g, t, info) {
  const ui = S().ui; g.fillStyle = '#060607'; g.fillRect(0, 0, E.W, E.H); glow(g, 500, 1500, 700, '#e6d24a', 0.1 + 0.03 * Math.sin(t * 5)); fallout(g, t, { count: 60, a: 0.25 });
  const z = 1 + 0.04 * t; g.save(); g.translate(500, 900); g.scale(z, z);
  const a1 = ease.out(prog(t, 0.05, 0.35)), a2 = ease.outBack(prog(t, 0.2, 0.55)), a3 = ease.out(prog(t, 0.5, 0.8));
  text(g, 'O QUE A MAMÃE SABIA', 0, -230, { size: 40, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 6, alpha: a1 });
  g.save(); g.scale(a2, a2); text(g, 'RAÇÃO', 0, -110, { size: 130, color: ui.cream, spacing: 3 }); text(g, 'DE GUERRA', 0, 14, { size: 116, color: ui.cream, spacing: 3 }); g.restore();
  g.fillStyle = alpha(ui.accent, a3); g.fillRect(-170 * a3, 104, 340 * a3, 8); text(g, 'EPISÓDIO 2', 0, 174, { size: 54, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 8, alpha: a3 });
  g.restore();
}});
registerShot('S', { draw(g, t, info) { UI.seguir(g, t, { proximo: 'EP. 3 — A CAIXA DA MAMÃE', outfit: EDUARDO }); } });
