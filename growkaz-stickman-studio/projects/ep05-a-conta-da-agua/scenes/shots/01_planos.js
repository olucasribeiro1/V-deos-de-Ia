// Ep. 5 — A CONTA DA ÁGUA · planos longos
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, talkAmount, rr, seg, poly, circle, glow, alpha, text, FONTS, S, noise } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { bunkerSala, tijolos, caixote, galao, radio, onda, prateleira } from '/series/mamae/bunker.js';
import { quintal } from '/series/mamae/quintal.js';
import { fallout, alerta, impacto, relogio, riscosSusto } from '/series/mamae/efeitos.js';
import { galaoRachado, caixaDagua, copo, chuveiro, toalha, dormindo } from '/series/mamae/props.js';
import { foco, K } from '/series/mamae/camera.js';
import { INK, WH, GY0, blink, W, mist, rotulo, fundo, escada, quintalCinza, sepia, legendaTopo, GRAB, HIPS, ARM, SENTA, titulo, seguir } from '/series/mamae/comum.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';
const prancheta = (g, x, y, s, linhas, T) => { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.04); rr(g, -330, -420, 660, 840, 26); g.fillStyle = INK; g.fill(); rr(g, -318, -408, 636, 816, 20); g.fillStyle = '#efe8d0'; g.fill(); rr(g, -110, -440, 220, 70, 14); g.fillStyle = '#5a6068'; g.fill();
  linhas.forEach(([str, t0, cor, size = 80], i) => { const a = ease.outBack(prog(T, t0, t0 + 0.25)); if (a <= 0) return; g.save(); g.translate(0, -260 + i * 135); g.scale(a, a); text(g, str, 0, 0, { size, color: cor || '#16181d', stroke: cor ? 14 : 0, strokeColor: INK }); g.restore(); }); g.restore(); };

// A — Dia 8: o tio faz a conta da água, a conta não fecha
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tO = L.o1[0];
  const cam = K(T, [[0, foco(560, 600, 1.9, 0.6)], [W('tio', L.n1), foco(500, GY0 - 280, 1.7)], [tO, foco(560, GY0 - 330, 2.3)], [info.shot.end, foco(560, GY0 - 330, 2.5)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.85, gen: 0 });
  layer(g, cam, 0.6, g => { for (let i = 0; i < 8; i++) { const a = prog(T, 0.3 + i * 0.1, 0.4 + i * 0.1); if (a <= 0) continue; const gi = Math.floor(i / 5), k = i % 5; seg(g, k < 4 ? [[420 + gi * 150 + k * 24, 470], [420 + gi * 150 + k * 24, 470 + 80 * a]] : [[405 + gi * 150, 530], [405 + gi * 150 + 110 * a, 470]], 9, WH); } });
  layer(g, cam, 1, g => { for (let i = 0; i < 5; i++) galao(g, 330 + i * 90, GY + 10, 0.85);
    drawFigure(g, { x: 640, y: GY + 60, s: 1.75, facing: -1, outfit: OSVALDO, pose: breathe(posesAt(T, [[0, { ...POSES.holdFront, eF: [24, -150], hF: [46, -164] }], [tO - 0.3, POSES.think]], 0.3), t, 1, 5), expr: T > tO ? 'suspicious' : 'determined', talk: talkAmount(T, ...L.o1), t, emote: T > tO ? 'question' : null });
    rr(g, 690, GY - 300, 70, 90, 8); g.fillStyle = '#efe8d0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); });
}});
// B — atrás da prateleira: chão molhado, três galões rachados; flash da onda de choque
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tOnda = W('onda', L.n2), tPing = W('pingando', L.n2);
  const cam = K(T, [[info.shot.start, foco(250, GY0 - 200, 1.7, 0.85)], [W('três', L.n2) - 0.3, foco(250, GY0 - 40, 2.6, 0.85)], [info.shot.end, foco(250, GY0 - 30, 3.2, 0.85)]]);
  const fb = prog(T, tOnda - 0.1, tOnda + 0.1) * (1 - prog(T, tPing - 0.4, tPing - 0.1));
  const sala = (g) => { const { GY } = bunkerSala(g, t, cam, { lamp: 0.8, gen: 0 }); layer(g, cam, 0.85, g => { for (let i = 0; i < 3; i++) galaoRachado(g, 110 + i * 110, GY + 4, 0.85, t + i * 0.4, { poca: 0.6 + 0.4 * prog(T, info.shot.start, info.shot.start + 2) }); }); };
  const flash = (g) => { const [dx, dy] = impacto(T, tOnda, 30, 1.0); const { GY } = bunkerSala(g, t, { ...foco(250, GY0 - 200, 1.5, 0.85), x: foco(250, 0, 1.5, 0.85).x + dx, y: foco(0, GY0 - 200, 1.5, 0.85).y + dy }, { lamp: 1, gen: 1 }); layer(g, cam, 0.85, g => { for (let i = 0; i < 3; i++) galao(g, 110 + i * 110, GY + 6, 0.9); }); sepia(g, 0.7); veil(g, '#ffffff', 0.25 * (1 - prog(T, tOnda, tOnda + 0.4))); legendaTopo(g, 'DIA 0', 420); };
  mist(g, fb, sala, flash);
  if (T > tPing) { relogio(g, 820, 520, 80, 7 + (T - tPing) * 6); }
}});
// C — Rafael culpado, de toalha na cabeça
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L;
  const cam = K(T, [[info.shot.start, foco(420, GY0 - 300, 2.4)], [info.shot.end, foco(420, GY0 - 320, 2.8)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.85, gen: 0 });
  layer(g, cam, 1, g => { const o = { x: 420, y: GY + 60, s: 1.8 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.shrug, t, 1.4, 2), expr: 'forced', talk: talkAmount(T, ...L.r1), t, emote: ['sweat', 'blush'] }; drawFigure(g, o); const [hx, hy, hr] = headPos(o); toalha(g, hx, hy, hr); });
}});
// D — a conta: 100 L ÷ 16 L/dia = 6 dias
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui; tijolos(g, -200, -200, E.W + 400, E.H + 400, '#8a5440', 130, 60); veil(g, '#05070c', 0.45);
  const cam = K(T, [[info.shot.start, { z: 1.0, x: 0, y: 40 }], [info.shot.end, { z: 1.1, x: 0, y: 0 }]]);
  layer(g, cam, 1, g => prancheta(g, 540, 900, 1, [['100 L', W('cem', L.n3) - 0.1, ui.gold, 110], ['÷ 4 PESSOAS', W('pessoas', L.n3) - 0.4], ['× 4 L/DIA', W('litros', L.n3, 2) - 0.3], ['= 6 DIAS', W('seis', L.n3) - 0.1, ui.accent, 116]], T));
  if (T > W('seis', L.n3)) alerta(g, T, 0.5);
}});
// E — "meio copo" × "água de beber não se raciona" (zoom na biomédica)
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tM = L.m1[0], tB = W('corta', L.m1);
  const cam = K(T, [[info.shot.start, foco(660, GY0 - 300, 2.1)], [tM - 0.1, foco(600, GY0 - 300, 1.8)], [tM + 0.4, foco(400, GY0 - 360, 2.6)], [info.shot.end, foco(420, GY0 - 360, 2.8)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.85, gen: 0 });
  layer(g, cam, 1, g => { drawFigure(g, { x: 700, y: GY + 50, s: 1.8, facing: -1, outfit: OSVALDO, pose: breathe({ ...POSES.holdFront, eF: [24, -150], hF: [46, -170] }, t, 1, 5), expr: T > tM ? 'gulp' : 'determined', talk: talkAmount(T, ...L.o2), t });
    copo(g, 620, GY - 150, 0.7, 0.45);
    drawFigure(g, { x: 400, y: GY + 60, s: 1.85, facing: 1, outfit: MARIANA, pose: breathe(T > tM ? posesAt(T, [[tM, POSES.point], [tB, POSES.explain]], 0.25) : POSES.crossArms, t, 1, 4), expr: T > tM ? 'furious' : 'suspicious', talk: talkAmount(T, ...L.m1), t, emote: T > tM && T < tM + 1.5 ? 'exclaim' : null }); });
  if (T > tB) { const a = ease.outBack(prog(T, tB, tB + 0.25)); g.save(); g.translate(540, 600); g.scale(a, a); chuveiro(g, -180, 60, 1.1, t); seg(g, [[-280, -60], [-80, 100]], 22, INK); seg(g, [[-280, -60], [-80, 100]], 12, S().ui.accent); copo(g, 180, 100, 1.1, 0.9); seg(g, [[120, 20], [150, 60], [230, -40]], 16, '#3f9a5a'); g.restore(); }
}});
// F — regra: 4 L por pessoa por dia, metade beber, metade comida e higiene
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui; tijolos(g, -200, -200, E.W + 400, E.H + 400, '#3d6f8a', 130, 60); veil(g, '#05070c', 0.55);
  const z = 1 + 0.05 * (T - info.shot.start) / info.dur; g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
  rotulo(g, '4 LITROS POR DIA', T - W('quatro', L.n4), 440, ui.gold, 92);
  const tm = W('metade', L.n4), tm2 = W('metade', L.n4, 2), tc = W('crise', L.n4);
  const a1 = ease.outBack(prog(T, tm - 0.1, tm + 0.2)), a2 = ease.outBack(prog(T, tm2 - 0.1, tm2 + 0.2));
  if (a1 > 0) { g.save(); g.translate(300, 900); g.scale(a1, a1); copo(g, 0, 120, 1.6, 0.9); text(g, '2 L', 0, -150, { size: 90, color: WH, stroke: 18, strokeColor: INK }); text(g, 'BEBER', 0, 220, { size: 52, color: ui.cream, font: FONTS.ui, weight: 900, stroke: 12, strokeColor: INK }); g.restore(); }
  if (a2 > 0) { g.save(); g.translate(780, 900); g.scale(a2, a2); chuveiro(g, -40, 120, 1.4, t); text(g, '2 L', 0, -150, { size: 90, color: WH, stroke: 18, strokeColor: INK }); text(g, 'COMIDA E HIGIENE', 0, 220, { size: 40, color: ui.cream, font: FONTS.ui, weight: 900, stroke: 10, strokeColor: INK }); g.restore(); }
  if (T > tc) { const a = ease.outBack(prog(T, tc, tc + 0.25)); g.save(); g.translate(780, 900); g.scale(a, a); seg(g, [[-150, -150], [150, 150]], 30, INK); seg(g, [[-150, -150], [150, 150]], 18, ui.accent); g.restore(); g.save(); g.translate(300, 900); g.scale(a, a); g.strokeStyle = '#3f9a5a'; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 210, 0, 7); g.stroke(); g.restore(); }
  g.restore();
}});
// G — o plano: calendário até o dia 14 e a caixa d'água tampada protegendo a água
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tE = L.e1[0], tP = L.n5[0];
  if (T < tE - 0.3) { tijolos(g, -200, -200, E.W + 400, E.H + 400, '#8a5440', 130, 60); veil(g, '#05070c', 0.45);
    const n = Math.min(14, 8 + Math.floor(prog(T, info.shot.start + 0.2, W('catorze', L.o3) + 0.1) * 6)); g.save(); g.translate(540, 820); g.rotate(-0.03); rr(g, -270, -330, 540, 640, 24); g.fillStyle = INK; g.fill(); rr(g, -258, -318, 516, 616, 18); g.fillStyle = WH; g.fill(); rr(g, -258, -318, 516, 130, 18); g.fillStyle = ui.accent; g.fill(); text(g, 'DIA', 0, -252, { size: 64, color: '#fff', font: FONTS.ui, weight: 900, spacing: 6 }); text(g, String(n), 0, 60, { size: 300, color: n === 14 ? '#3f9a5a' : '#16181d' }); g.restore();
    drawFigure(g, { x: 840, y: 1520, s: 1.35, facing: -1, outfit: OSVALDO, pose: breathe(POSES.think, t, 1, 5), expr: 'suspicious', talk: talkAmount(T, ...L.o3), t });
    const tz = W('zero', L.o3); if (T > tz) rotulo(g, '0,1%', T - tz, 1300, '#3f9a5a', 120); return; }
  const cam = K(T, [[tE - 0.3, foco(650, 600, 1.2, 0.4)], [tP, foco(665, 660, 2.0, 0.4)], [info.shot.end, foco(600, 900, 1.3)]]);
  quintalCinza(g, t, cam, { poeira: 60, veu: 0.35 });
  layer(g, cam, 0.4, g => caixaDagua(g, 665, 1000 - 30, 0.75, t, { poeira: 1, corte: prog(T, W('protegida', L.e1) - 0.2, W('protegida', L.e1) + 0.3) }));
  if (T > tP) { const a = ease.outBack(prog(T, W('vinte', L.n5) - 0.1, W('vinte', L.n5) + 0.2)); if (a > 0) { g.save(); g.translate(540, 1200); g.scale(a, a); relogio(g, 0, 0, 110, 0.33 * (1 + (T - tP) * 0.05)); g.restore(); } }
  if (T > tE) { const a = ease.outBack(prog(T, tE, tE + 0.3)); g.save(); g.translate(250, 1250); g.scale(a, a); bigFace(g, 0, 0, 110, { outfit: EDUARDO, expr: 'joy', talk: talkAmount(T, ...L.e1), t, rimSide: 1, emote: 'sparkle' }); g.restore(); }
}});
// H — madrugada: Eduardo acorda; a câmera segue o olhar até a mãe no rádio, sussurrando em código; a resposta
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tR = L.n7[0], tM = L.m2[0], tRad = L.rad[0], tN = L.n8[0];
  const cam = K(T, [[t0, foco(330, GY0 - 120, 2.2)], [tR - 0.2, foco(330, GY0 - 150, 2.3)], [tR + 0.8, foco(780, GY0 - 280, 1.8)], [tM, foco(800, GY0 - 330, 2.6)], [tRad, foco(820, 1050, 3.2, 0.85)], [tN, foco(700, GY0 - 300, 2.0)], [info.shot.end, foco(400, GY0 - 160, 2.4)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.12, dark: 0.6, gen: 0, radioOn: 1, voz: T > tRad && T < tN ? 1 : 0 });
  layer(g, cam, 1, g => { dormindo(g, 600, GY + 60, 1.0, RAFAEL, { cor: '#2f6fd0', t });
    drawFigure(g, { x: 330, y: GY + 60, s: 1.3, facing: 1, outfit: EDUARDO, pose: T > t0 + 1.4 ? { ...POSES.sit, eF: [16, -120], hF: [30, -96] } : POSES.lie, rot: T > t0 + 1.4 ? 0 : -1.5, expr: T > tN ? 'shocked' : T > t0 + 1.4 ? 'suspicious' : 'sleepy', look: [1, -0.2], t, shadow: false, emote: T > tN ? 'exclaim' : null });
    drawFigure(g, { x: 790, y: GY + 60, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe({ ...POSES.reach, eF: [26, -140], hF: [50, -150] }, t, 0.6, 4), expr: 'determined', talk: talkAmount(T, ...L.m2) * 0.6, t });
    if (T > tRad && T < tN) onda(g, 760, GY - 470, 230, t, { amp: 40, color: S().ui.accent, lw: 4 }); });
  glow(g, 540, 960, 600, '#d8342b', 0.06 * (0.5 + 0.5 * Math.sin(T * 3)));
  if (T > tM) { const a = ease.outBack(prog(T, W('cérebro', L.m2) - 0.1, W('cérebro', L.m2) + 0.2)) * (1 - prog(T, tRad - 0.2, tRad)); if (a > 0) { g.save(); g.translate(540, 450); g.scale(a, a); g.rotate(-0.04); text(g, 'PROJETO CÉREBRO', 0, 0, { size: 86, color: S().ui.accent, stroke: 18, strokeColor: INK }); g.restore(); } }
}});
// I — "Mãe... com quem você tá falando?" — ela desliga, devagar; "Com quem fez isso, Eduardo."
registerShot('I', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tD = W('desliga', L.n9), tM = L.m3[0], tN = L.n10[0];
  const cam = K(T, [[t0, foco(560, GY0 - 300, 2.0)], [tD, foco(760, GY0 - 280, 2.4)], [tM - 0.2, foco(700, GY0 - 360, 3.0)], [tN, foco(620, GY0 - 330, 2.4)], [info.shot.end, foco(540, GY0 - 300, 1.4)]]);
  const on = T < tD + 0.6 ? 1 : 0;
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.12, dark: 0.6, gen: 0, radioOn: on });
  layer(g, cam, 1, g => { drawFigure(g, { x: 520, y: GY + 60, s: 1.7, facing: 1, outfit: EDUARDO, pose: breathe(POSES.ready, t, 1, 1), expr: T > tM + 1 ? 'terrified' : 'shocked', talk: talkAmount(T, ...L.e2), t, emote: T > tM + 1 ? 'shock' : 'question' });
    drawFigure(g, { x: 780, y: GY + 60, s: 1.75, facing: -1, outfit: MARIANA, pose: breathe(T < tD + 0.6 ? { ...POSES.reach, eF: [-26, -140], hF: [-50, -150] } : ARM, t, 0.8, 4), expr: T > tM ? 'sad' : 'blank', talk: talkAmount(T, ...L.m3), t, emote: T > tM ? 'gloom' : null }); });
  if (T > tD + 0.6 && T < tD + 1.4) FX.rings(g, 540, 960, T - tD - 0.6, { count: 2, r0: 120, r1: 480, color: '#ffffff', a: 0.4 * (1 - (T - tD - 0.6) / 0.8), speed: 2.2, w: 5 });
  if (T > tN) { veil(g, '#300000', 0.1 + 0.06 * Math.sin(T * 5)); alerta(g, T, 0.5); }
}});
registerShot('J', { draw(g, t) { titulo(g, t, 'A CONTA', 'DA ÁGUA', 5, '#5f8fd0'); } });
registerShot('Kc', { draw(g, t) { seguir(g, t, 'EP. 6 — VINTE MINUTOS', EDUARDO); } });
