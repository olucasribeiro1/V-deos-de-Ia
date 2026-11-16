// Ep. 6 — SAINDO PRA BUSCAR PÃO DE QUEIJO · planos longos
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, talkAmount, rr, seg, poly, circle, glow, alpha, text, FONTS, S, noise } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bunkerSala, tijolos, galao, caixote } from '/series/mamae/bunker.js';
import { quintal, bilu, GRILL_X } from '/series/mamae/quintal.js';
import { fallout, alerta, impacto, relogio, regra710, riscosSusto } from '/series/mamae/efeitos.js';
import { caixaDagua, chuveiro, equipamento, mascara, freezer, paoDeQueijo, mangueira, papelCerebro, garrasMuro, mochila } from '/series/mamae/props.js';
import { foco, K } from '/series/mamae/camera.js';
import { INK, WH, GY0, blink, W, mist, rotulo, fundo, escada, quintalCinza, GRAB, HIPS, ARM, titulo, seguir } from '/series/mamae/comum.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';
// boneco com equipamento de saída (capa transparente + máscara + saco nos pés)
const equipado = (g, o, k = 1) => { drawFigure(g, o); equipamento(g, o, k); if (k > 0.5) { const [hx, hy, hr] = headPos(o); mascara(g, hx, hy, hr, o.facing ?? 1); } };
const cronometro = (g, T, t0, x = 860, y = 560) => { const rest = Math.max(0, 20 * 60 - (T - t0) * 60); const mm = Math.floor(rest / 60), ss = Math.floor(rest % 60); g.save(); g.translate(x, y); rr(g, -130, -50, 260, 100, 24); g.fillStyle = 'rgba(8,9,12,.85)'; g.fill(); g.strokeStyle = S().ui.accent; g.lineWidth = 4; g.stroke(); text(g, `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 0, 4, { size: 64, color: WH, font: FONTS.ui, weight: 900 }); g.restore(); };
const BILU_SUJO = (g) => veil(g, '#000', 0);

// A — Dia 14: a regra 7-10 chegou no 0,1%
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L; tijolos(g, -200, -200, E.W + 400, E.H + 400, '#8a5440', 130, 60); veil(g, '#05070c', 0.45);
  const cam = K(T, [[0, { z: 1.0, x: 0, y: 0 }], [info.shot.end, { z: 1.12, x: 60, y: -40 }]]); const tz = W('zero', L.n1);
  layer(g, cam, 1, g => regra710(g, t, 540, 820, { mostra: [1, 1, 1, prog(T, tz - 0.2, tz + 0.3)] }));
  const t3 = W('trezentas', L.n1); if (T > t3 && T < tz) rotulo(g, '336 HORAS', T - t3, 450, null, 110);
  if (T > tz) { g.save(); g.translate(790, 760); const a = ease.outBack(prog(T, tz, tz + 0.3)); g.scale(a, a); g.strokeStyle = '#3f9a5a'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 110, 0, 7); g.stroke(); g.restore(); rotulo(g, '0,1%', T - tz, 1320, '#3f9a5a', 130); }
}});
// B — protocolo de saída: o tio lista; capa, máscara, luva, saco no pé; cronômetro de 20 minutos
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui;
  const cam = K(T, [[info.shot.start, foco(560, GY0 - 280, 1.6)], [info.shot.end, foco(560, GY0 - 300, 1.9)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.85, gen: 0 });
  const kE = prog(T, W('capa', L.o1), W('saco', L.o1) + 0.4);
  layer(g, cam, 1, g => { equipado(g, { x: 420, y: GY + 70, s: 1.6, facing: 1, outfit: EDUARDO, pose: breathe(POSES.relaxed, t, 1, 1), expr: 'gulp', t }, kE); equipado(g, { x: 560, y: GY + 80, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.cheer, t, 1, 2), expr: 'proud', t }, kE);
    drawFigure(g, { x: 760, y: GY + 60, s: 1.7, facing: -1, outfit: OSVALDO, pose: breathe(POSES.explain, t, 1, 5), expr: 'determined', talk: talkAmount(T, ...L.o1), t }); });
  [['CAPA', 'capa'], ['MÁSCARA', 'máscara'], ['LUVA', 'luva'], ['SACO NO PÉ', 'saco']].forEach(([s2, w], i) => { const ti = W(w, L.o1), a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; g.save(); g.translate(300 + (i % 2) * 460, 520 + Math.floor(i / 2) * 120); g.scale(a, a); rr(g, -200, -48, 400, 96, 22); g.fillStyle = INK; g.fill(); rr(g, -192, -40, 384, 80, 16); g.fillStyle = '#efe8d0'; g.fill(); seg(g, [[-160, 0], [-140, 18], [-110, -18]], 12, '#3f9a5a'); text(g, s2, 30, 4, { size: 44, color: '#16181d', font: FONTS.ui, weight: 900 }); g.restore(); });
  const tv = W('vinte', L.o1); if (T > tv) cronometro(g, T, T, 540, 770);
}});
// C — na escada: Rafael quer o pão de queijo
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tE = L.e1[0], tR2 = L.r2[0];
  const cam = K(T, [[info.shot.start, foco(480, GY0 - 280, 1.7)], [L.r1[0], foco(420, GY0 - 320, 2.6)], [tE, foco(600, GY0 - 320, 2.6)], [tR2, foco(420, GY0 - 320, 2.9)], [info.shot.end, foco(470, GY0 - 300, 2.2)]]);
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.85, gen: 0 });
  layer(g, cam, 1, g => { escada(g, CX, GY);
    equipado(g, { x: 420, y: GY + 80, s: 1.7 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(T > tR2 ? POSES.crossArms : POSES.point, t, 1, 2), expr: T > tR2 ? 'determined' : 'hungry', talk: talkAmount(T, L.r1[0], L.r2[1]), t, emote: T > tR2 ? null : 'sparkle' });
    equipado(g, { x: 620, y: GY + 70, s: 1.7, facing: -1, outfit: EDUARDO, pose: breathe(T > tE ? POSES.facepalm : POSES.relaxed, t, 1, 1), expr: T > tE ? 'suspicious' : 'neutral', talk: talkAmount(T, ...L.e1), t, emote: T > tE ? 'sweat' : null }); });
}});
// D — o alçapão abre; luz cinza; o quintal coberto de poeira; os três saem
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tQ = W('quintal', L.n3);
  const abre = ease.out(prog(T, t0, t0 + 1.2));
  if (T < tQ - 0.3) { const { GY, CX } = bunkerSala(g, t, foco(540, 500, 1.8), { lamp: 0.6, gen: 0 }); layer(g, foco(540, 500, 1.8), 1, g => { escada(g, CX, GY); g.fillStyle = alpha('#e6e8ec', abre); rr(g, CX - 180, 340, 360 * abre, 100, 6); g.fill(); }); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#ffffff', 0.35 * abre); poly(g, [[360, 0], [720, 0], [1000, 1920], [80, 1920]], g.fillStyle); g.restore(); FX.dust(g, t, { count: 60, color: '#ffffff', a: 0.7 * abre }); return; }
  const k = prog(T, tQ - 0.3, info.shot.end), cam = K(T, [[tQ - 0.3, foco(780, GY0 - 200, 2.2)], [info.shot.end, foco(540, 900, 1.0)]]);
  const { GY } = quintalCinza(g, t, cam, { hatch: 1, poeira: 90, veu: 0.32 });
  layer(g, cam, 1, g => { g.fillStyle = alpha('#c9ccd2', 0.9); rr(g, -400, GY - 4, 1900, 14, 6); g.fill(); rr(g, 640, GY - 312, 330, 16, 6); g.fill();
    const sai = (i) => prog(T, tQ + i * 0.6, tQ + 0.8 + i * 0.6);
    [[OSVALDO, 1, 640], [EDUARDO, 1, 520], [RAFAEL, RAFAEL_S, 400]].forEach(([o, sc, xf], i) => { const p = sai(i); if (p <= 0) return; const x = lerp(800, xf, ease.out(p)); equipado(g, { x, y: GY + 40, s: 1.4 * sc, facing: -1, outfit: o, pose: p < 1 ? walkPose(T * Math.PI * 2 * 0.8) : breathe(POSES.relaxed, t, 1, i), expr: 'awe', look: [0, -0.6], t, alpha: Math.min(1, p * 2) }); }); });
}});
// E — missões: mangueira na caixa d'água; o freezer; o pão de queijo "pedra mole"
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t1 = W('missão', L.n4), t2 = W('missão', L.n4, 2), tR = L.r3[0];
  const cam = K(T, [[info.shot.start, foco(560, 760, 1.15)], [t2 - 0.3, foco(560, 800, 1.2)], [t2 + 0.4, foco(280, GY0 - 260, 2.0)], [tR, foco(300, GY0 - 300, 2.6)], [info.shot.end, foco(300, GY0 - 300, 2.8)]]);
  const { GY } = quintalCinza(g, t, cam, { hatch: 1, poeira: 60, veu: 0.3 });
  layer(g, cam, 1, g => { g.fillStyle = alpha('#c9ccd2', 0.9); rr(g, -400, GY - 4, 1900, 14, 6); g.fill();
    mangueira(g, [[665, 300], [640, 500], [610, GY - 200], [640, GY - 20]]); for (let i = 0; i < 3; i++) galao(g, 610 + i * 90, GY + 10, 0.8);
    equipado(g, { x: 740, y: GY + 40, s: 1.4, facing: -1, outfit: EDUARDO, pose: breathe(POSES.holdFront, t, 1, 1), expr: 'determined', t });
    freezer(g, 260, GY + 20, 0.9, prog(T, t2, t2 + 0.6));
    equipado(g, { x: 420, y: GY + 50, s: 1.45 * RAFAEL_S, facing: -1, outfit: RAFAEL, pose: breathe(T > tR ? { ...POSES.holdFront, eF: [24, -150], hF: [46, -170] } : POSES.reach, t, 1, 2), expr: T > tR ? 'sob' : 'hungry', talk: talkAmount(T, ...L.r3), t, emote: T > tR ? 'gloom' : 'sparkle' });
    if (T > tR - 0.2) paoDeQueijo(g, 360, GY - 230, 0.8, t, 1); });
  layer(g, cam, 0.4, g => caixaDagua(g, 665, 970, 0.75, t, { poeira: 0.6 }));
  cronometro(g, T, info.L.n3[0], 820, 560);
}});
// F — um latido debaixo da casa: o Bilu! sujo de cinza, mas vivo
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tL = W('latido', L.n5), tB = L.r4[0], tV = W('vivo', L.n6);
  const sai = ease.out(prog(T, tL + 0.3, tB)), corre = prog(T, tB, tB + 0.8);
  const cam = K(T, [[info.shot.start, foco(300, GY0 - 250, 2.0)], [tL, foco(180, GY0 - 120, 2.6)], [tB, foco(300, GY0 - 200, 1.9)], [tV, foco(260, GY0 - 220, 2.6)], [info.shot.end, foco(260, GY0 - 220, 2.9)]]);
  const { GY } = quintalCinza(g, t, cam, { hatch: 1, poeira: 60, veu: 0.3 });
  layer(g, cam, 1, g => { rr(g, -120, GY - 110, 360, 110, 6); g.fillStyle = '#16181d'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
    g.save(); g.beginPath(); g.rect(-400, -2000, 2400, GY + 2000 + 400); g.clip(); bilu(g, { x: lerp(60, 230, sai), y: GY + 10, s: 1.2, facing: 1, t: t * (corre > 0 && corre < 1 ? 1 : 0.4), run: corre > 0 && corre < 1 ? 1 : 0 }); g.restore();
    g.fillStyle = alpha('#9aa0aa', 0.55); g.beginPath(); g.ellipse(lerp(60, 230, sai), GY - 50, 70, 40, 0, 0, 7); g.fill();
    equipado(g, { x: lerp(520, 320, ease.inOut(corre)), y: GY + 50, s: 1.45 * RAFAEL_S, facing: -1, outfit: RAFAEL, pose: corre > 0 && corre < 1 ? walkPose(T * Math.PI * 2 * 1.6, { run: true }) : corre >= 1 ? POSES.kneel : POSES.relaxed, expr: T > tB ? 'sob' : 'shocked', talk: talkAmount(T, ...L.r4), t, emote: T > tB ? 'sparkle' : 'exclaim' }); });
  if (T > tB + 0.8) { for (let i = 0; i < 3; i++) { const ph = (T * 0.8 + i / 3) % 1; text(g, '♥', 360 + i * 70, 760 - ph * 160, { size: 60, color: alpha('#d8342b', 1 - ph), stroke: 10, strokeColor: alpha(INK, 1 - ph) }); } }
}});
// G — marcas de garra no muro, até quase 2 metros; "Ninguém corre. Pra dentro. Agora."
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tG = W('marcas', L.n7), tM = W('dois', L.n7), tO = L.o2[0];
  const cam = K(T, [[info.shot.start, foco(560, GY0 - 300, 1.4)], [tG, foco(560, GY0 - 250, 2.0)], [tM, foco(560, GY0 - 330, 1.6)], [tO, foco(650, GY0 - 260, 2.0)], [info.shot.end, foco(720, GY0 - 220, 1.7)]]);
  const [dx, dy] = impacto(T, tG, 14, 0.5); cam.x += dx; cam.y += dy;
  const { GY } = quintalCinza(g, t, cam, { hatch: 1, poeira: 60, veu: 0.32 });
  layer(g, cam, 0.6, g => garrasMuro(g, 480, GY, 560, prog(T, tG - 0.2, tG + 0.3)));
  layer(g, cam, 0.6, g => { const a = prog(T, tM - 0.1, tM + 0.4); if (a > 0) { g.save(); g.globalAlpha = a; seg(g, [[420, GY], [420, GY - 560]], 8, S().ui.gold); poly(g, [[420, GY - 560], [400, GY - 520], [440, GY - 520]], S().ui.gold); poly(g, [[420, GY], [400, GY - 40], [440, GY - 40]], S().ui.gold); text(g, '2 M', 330, GY - 280, { size: 64, color: S().ui.gold, stroke: 14, strokeColor: INK }); g.restore(); } });
  const run = prog(T, tO + 1.2, info.shot.end);
  layer(g, cam, 1, g => [[OSVALDO, 1, 640], [EDUARDO, 1, 520], [RAFAEL, RAFAEL_S, 400]].forEach(([o, sc, x0], i) => equipado(g, { x: lerp(x0, 820, run), y: GY + 40, s: 1.4 * sc, facing: run > 0 ? 1 : -1, outfit: o, pose: run > 0 ? walkPose(T * Math.PI * 2 * 1.4, { run: true }) : i === 0 ? POSES.ready : POSES.handsOnHead, expr: i === 0 ? 'determined' : 'terrified', talk: i === 0 ? talkAmount(T, ...L.o2) : 0, t, emote: i ? 'sweat' : null })));
  if (T > tG) alerta(g, T, 0.6);
}});
// H — protocolo de descontaminação: roupa de fora fica fora (90%), banho com sabão e xampu, sem condicionador, o Bilu também
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tN = W('noventa', L.n8), tB = W('banho', L.n8), tC = W('condicionador', L.n8), tBi = W('bilu', L.n8);
  if (T < tB - 0.3) { const cam = K(T, [[info.shot.start, foco(760, GY0 - 250, 2.0)], [tN, foco(760, GY0 - 230, 2.4)]]); const { GY } = quintalCinza(g, t, cam, { hatch: 1, poeira: 40, veu: 0.3 });
    const tira = prog(T, info.shot.start + 0.6, tN);
    layer(g, cam, 1, g => { equipado(g, { x: 700, y: GY + 40, s: 1.6, facing: -1, outfit: EDUARDO, pose: breathe(GRAB, t, 1, 1), expr: 'determined', t }, 1 - tira); rr(g, 520, GY - 140, 120, 150, 30); g.fillStyle = '#16181d'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); text(g, 'SACO', 580, GY - 60, { size: 26, color: WH, font: FONTS.ui, weight: 900 }); });
    if (T > tN) rotulo(g, 'ATÉ 90% FORA', T - tN, 450, '#3f9a5a', 100); return; }
  tijolos(g, -200, -200, E.W + 400, E.H + 400, '#3d6f8a', 130, 60); veil(g, '#05070c', 0.5);
  const a1 = ease.outBack(prog(T, tB - 0.2, tB + 0.1)), a2 = ease.outBack(prog(T, tC - 0.1, tC + 0.2)), a3 = ease.outBack(prog(T, tBi - 0.1, tBi + 0.2));
  if (a1 > 0) { g.save(); g.translate(540, 520); g.scale(a1, a1); chuveiro(g, -60, 120, 1.4, t); text(g, 'SABÃO + XAMPU', 0, 200, { size: 56, color: ui.cream, stroke: 12, strokeColor: INK }); seg(g, [[200, 140], [230, 175], [300, 100]], 16, '#3f9a5a'); g.restore(); }
  if (a2 > 0) { g.save(); g.translate(540, 900); g.scale(a2, a2); rr(g, -60, -110, 120, 200, 24); g.fillStyle = '#e8a0c0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); text(g, 'CONDICIONADOR', 0, 150, { size: 48, color: ui.cream, stroke: 12, strokeColor: INK }); seg(g, [[-150, -140], [150, 140]], 26, INK); seg(g, [[-150, -140], [150, 140]], 14, ui.accent); g.restore(); }
  if (a3 > 0) { g.save(); g.translate(540, 1300); g.scale(a3, a3); bilu(g, { x: 0, y: 60, s: 1.3, facing: 1, t }); for (let i = 0; i < 9; i++) { const ph = (T * 0.7 + i / 9) % 1; g.strokeStyle = alpha(WH, 0.8 * (1 - ph)); g.lineWidth = 4; g.beginPath(); g.arc(-120 + (i * 37) % 240, -40 - ph * 140, 14 + (i % 3) * 6, 0, 7); g.stroke(); } g.restore(); }
}});
// I — de volta no bunker: a mochila da mãe cai, os papéis espalham; Projeto Cérebro; o desenho; a mãe desiste
registerShot('I', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tP = W('papéis', L.n9), tC = W('cérebro', L.n9), tD = W('desenho', L.n9), tE = L.e2[0], tN = L.n10[0];
  const cai = ease.in(prog(T, t0 + 0.2, t0 + 0.8)), esp = ease.out(prog(T, t0 + 0.8, tP + 0.4));
  if (T > tC - 0.3 && T < tE - 0.2) { tijolos(g, -200, -200, E.W + 400, E.H + 400, '#5a5f66', 130, 60); veil(g, '#05070c', 0.55); const z = 1 + 0.08 * prog(T, tC, tE);
    g.save(); g.translate(540, 920); g.scale(z, z); g.translate(-540, -920); papelCerebro(g, 380, 860, 0.85, -0.12, t); if (T > tD - 0.2) { const a = ease.outBack(prog(T, tD - 0.2, tD + 0.2)); g.save(); g.translate(660, 960); g.scale(a, a); papelCerebro(g, 0, 0, 1.0, 0.06, t, { desenho: true }); g.restore(); } g.restore(); if (T > tD) alerta(g, T, 0.5); return; }
  const cam = K(T, [[t0, foco(540, GY0 - 400, 1.4)], [tP, foco(540, GY0 - 100, 2.0)], [tE - 0.2, foco(560, GY0 - 300, 2.0)], [tN, foco(700, GY0 - 340, 2.8)], [info.shot.end, foco(700, GY0 - 345, 3.1)]]);
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.8, gen: 0 });
  layer(g, cam, 1, g => { escada(g, CX, GY);
    mochila(g, lerp(CX + 40, CX + 100, cai), lerp(GY - 520, GY + 60, cai), 1.0, esp > 0 ? 1 : 0);
    for (let i = 0; i < 5; i++) { if (esp <= 0) break; const ang = -0.6 + i * 0.3; g.save(); g.translate(CX + 100 + Math.cos(ang) * 220 * esp, GY + 50 + Math.sin(i) * 20); g.rotate(i * 0.7 - 1); g.scale(0.25, 0.25); papelCerebro(g, 0, 0, 1, 0, t, { desenho: i === 2 }); g.restore(); }
    drawFigure(g, { x: 420, y: GY + 70, s: 1.7, facing: 1, outfit: EDUARDO, pose: breathe(T > tE ? { ...POSES.holdFront, eF: [24, -150], hF: [46, -165] } : POSES.ready, t, 1, 1), expr: T > tE ? 'shocked' : 'gulp', talk: talkAmount(T, ...L.e2), t, emote: T > tE ? 'question' : null });
    drawFigure(g, { x: 720, y: GY + 60, s: 1.75, facing: -1, outfit: MARIANA, pose: breathe(T > tN ? POSES.sad : POSES.handsOnHead, t, 1, 4), expr: T > tN + 1 ? 'sad' : 'terrified', look: [-1, 0.2], t, emote: T > tN + 1 ? 'gloom' : 'sweat' });
    if (T > tE) papelCerebro(g, 520, GY - 210, 0.22, -0.2, t, { desenho: true }); });
}});
registerShot('J', { draw(g, t) { titulo(g, t, 'VINTE', 'MINUTOS', 6, '#e6c070'); } });
registerShot('Kc', { draw(g, t) { seguir(g, t, 'EP. 7 — A VERDADE DEBAIXO DA CHURRASQUEIRA', EDUARDO); } });
