// Ep. 10 — A ÚLTIMA BRASA (final de temporada)
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, talkAmount, rr, seg, poly, circle, glow, alpha, text, FONTS, S, noise } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { tijolos } from '/series/mamae/bunker.js';
import { quintal, bilu, churrasqueira, fumaca, GRILL_X } from '/series/mamae/quintal.js';
import { alerta, impacto, relogio, regra710, fallout } from '/series/mamae/efeitos.js';
import { mochila, sacosCarvao, apito, sombraCriatura, copo, chuveiro } from '/series/mamae/props.js';
import { gerador } from '/series/mamae/bunker.js';
import { ruaCinza, helicoptero, estadio } from '/series/mamae/rua.js';
import { foco, K } from '/series/mamae/camera.js';
import { INK, WH, GY0, blink, W, mist, rotulo, quintalCinza, sepia, legendaTopo, HIPS, titulo } from '/series/mamae/comum.js';
import * as UI from '/engine/ui2d.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';
const timer = (g, T, tEnd, x = 860, y = 470) => { const rest = Math.max(0, tEnd - T); const s = Math.floor(rest * 20); const mm = Math.floor(s / 60), ss = s % 60; g.save(); g.translate(x, y); rr(g, -130, -50, 260, 100, 24); g.fillStyle = 'rgba(8,9,12,.85)'; g.fill(); g.strokeStyle = S().ui.accent; g.lineWidth = 4; g.stroke(); text(g, `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 0, 4, { size: 62, color: WH, font: FONTS.ui, weight: 900 }); g.restore(); };
const fogo = (g, x, y, k, t) => { if (k <= 0) return; glow(g, x, y - 200, 500 * k, '#ff7a20', 0.5 * k); for (let i = 0; i < 9; i++) { const ph = (t * 1.4 + i / 9) % 1; const fx = x - 100 + (i * 37) % 200 + Math.sin(t * 5 + i) * 10, fy = y - 60 - ph * 300 * k; g.fillStyle = alpha(i % 2 ? '#ffb030' : '#ff5a20', 0.8 * (1 - ph) * k); g.beginPath(); g.ellipse(fx, fy, 30 * (1 - ph) + 10, 50 * (1 - ph) + 10, 0, 0, 7); g.fill(); } };
const MOCH = (g, o) => { const f = o.facing ?? 1, s = (o.s ?? 1) * (o.outfit?.kid ? 0.72 : 1); g.save(); g.translate(o.x - 30 * s * f, o.y - 105 * s); g.scale(0.36 * s, 0.36 * s); mochila(g, 0, 0, 1, 0); g.restore(); };
const pessoa = (g, o) => { MOCH(g, o); drawFigure(g, o); };

// A — Dia 30, 11:30: o tio enche a churrasqueira de carvão, liga o gerador do lado de fora e acende
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tE = W('enche', L.n2), tG = W('gerador', L.n2), tA = W('acende', L.n2), k = prog(T, tA, tA + 1.5);
  const cam = K(T, [[0, foco(540, 900, 1.0)], [tE, foco(760, GY0 - 280, 1.8)], [tG, foco(560, GY0 - 120, 1.8)], [tA, foco(800, GY0 - 350, 1.5)], [info.shot.end, foco(700, GY0 - 400, 1.2)]]);
  const { GY } = quintalCinza(g, t, cam, { hatch: 1, fire: k, smoke: k > 0.2, poeira: 40, veu: 0.25 });
  layer(g, cam, 1, g => { gerador(g, 470, GY + 40, t, T > tG ? 1 : 0); fogo(g, GRILL_X, GY - 180, k, t); if (T > tA) fumaca(g, t, GRILL_X, GY - 640, { n: 14, rise: 900, a: 0.5 * k, color: '#2a2a2e', spread: 160 });
    drawFigure(g, { x: 660, y: GY + 60, s: 1.6, facing: 1, outfit: OSVALDO, pose: breathe(T < tA ? { ...POSES.holdFront, eF: [24, -150], hF: [46, -164] } : POSES.ready, t, 1, 5), expr: 'determined', t, emote: 'sweat' });
    [[140, MARIANA, 1], [240, EDUARDO, 1], [330, RAFAEL, RAFAEL_S]].forEach(([x, o, sc], i) => pessoa(g, { x, y: GY + 80, s: 1.4 * sc, facing: 1, outfit: o, pose: breathe(POSES.relaxed, t, 1, i), expr: 'gulp', t })); bilu(g, { x: 400, y: GY + 100, s: 0.8, facing: 1, t: t * 0.3 }); });
  timer(g, T, 90, 860, 470); const t8 = W('oito', L.n2); if (T > t8 && T < tG) rotulo(g, '8 ANOS DE CARVÃO', T - t8, 600, S().ui.gold, 80);
}});
// B — "Vai. Um apito, para. Dois, corre. E não olha pra trás."
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L;
  quintalCinza(g, t, { z: 1.6, x: 200, y: 260 }, { hatch: 1, fire: 1, smoke: true, poeira: 30, veu: 0.2 }); veil(g, '#000', 0.25); glow(g, 760, 1200, 600, '#ff7a20', 0.35 + 0.1 * Math.sin(T * 7));
  [[W('um', L.o1), '1 APITO = PARA', '#e6c02a'], [W('dois', L.o1), '2 APITOS = CORRE', S().ui.accent]].forEach(([ti, s2, c], i) => { const a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a > 0) { g.save(); g.translate(540, 1240 - 60 + i * 0); g.restore(); } });
  layer(g, { z: 1 + 0.05 * (T - info.shot.start) }, 1, g => bigFace(g, 540, 880, 300, { outfit: OSVALDO, expr: T > W('olha', L.o1) ? 'sad' : 'determined', talk: talkAmount(T, ...L.o1), look: [-0.3, 0], t, rimSide: 1, emote: T > W('olha', L.o1) ? 'sweat' : null }));
  [[W('um', L.o1), '1 APITO = PARA', '#e6c02a'], [W('dois', L.o1), '2 APITOS = CORRE', S().ui.accent]].forEach(([ti, s2, c], i) => { const a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; g.save(); g.translate(540, 300 + i * 105); g.scale(a, a); rr(g, -340, -46, 680, 92, 24); g.fillStyle = 'rgba(8,9,12,.9)'; g.fill(); g.strokeStyle = c; g.lineWidth = 5; g.stroke(); text(g, s2, 0, 4, { size: 48, color: WH, font: FONTS.ui, weight: 900 }); g.restore(); });
}});
// C — rua abaixo: três pessoas e um cachorro; a mãe para (um apito); a sombra na esquina fareja e vira a cabeça
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tP = W('para', L.n3), tS = L.n4[0], tV = W('vira', L.n4), andando = T < tP - 0.1;
  const px = lerp(150, 520, prog(T, info.shot.start, tP));
  const cam = K(T, [[info.shot.start, foco(px + 100, GY0 - 250, 1.6)], [tP, foco(560, GY0 - 250, 1.6)], [tS, foco(700, GY0 - 400, 1.0)], [tV, foco(880, GY0 - 350, 1.6)], [info.shot.end, foco(880, GY0 - 360, 1.9)]]);
  const { GY } = ruaCinza(g, t, cam, { poeira: 60 });
  layer(g, cam, 0.7, g => { if (T > tS - 0.3) sombraCriatura(g, lerp(1300, 1000, prog(T, tS, tS + 2.5)), GY - 40, 2.4, T, { a: Math.min(1, prog(T, tS - 0.3, tS + 0.8)) }); });
  layer(g, cam, 1, g => { [[MARIANA, 1, 80], [EDUARDO, 1, -20], [RAFAEL, RAFAEL_S, -110]].forEach(([o, sc, dx], i) => pessoa(g, { x: px + dx, y: GY + 120, s: 1.4 * sc, facing: 1, outfit: o, pose: andando ? walkPose(T * Math.PI * 2 * 0.9 + i) : (i === 0 ? { ...POSES.stand, eF: [22, -170], hF: [12, -196] } : POSES.crouch), expr: andando ? 'gulp' : 'terrified', look: [1, 0], t, emote: !andando && T > tV ? 'sweat' : null })); bilu(g, { x: px - 190, y: GY + 130, s: 0.8, facing: 1, t, run: andando ? 1 : 0 }); });
  if (T > tP && T < tP + 0.8) { g.save(); g.translate(540, 470); g.scale(1.6, 1.6); apito(g, 0, 0, 1, -0.2); g.restore(); }
  if (T > tV) alerta(g, T, 0.6);
}});
// D — a fumaça sobe lá atrás; a coisa gira e corre pro calor; "Dois apitos! Corre!"
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tG = W('gira', L.n5), tM = L.m1[0], k = prog(T, tG, tG + 1.5);
  const cam = K(T, [[info.shot.start, foco(300, 700, 1.0)], [tG, foco(700, GY0 - 350, 1.4)], [tM, foco(500, GY0 - 250, 1.6)], [info.shot.end, foco(700, GY0 - 250, 1.5)]]);
  const { GY } = ruaCinza(g, t, cam, { poeira: 50 });
  layer(g, cam, 0.3, g => { for (let i = 0; i < 10; i++) { const ph = (t * 0.25 + i / 10) % 1; circle(g, 150 + Math.sin(i * 3 + t) * 60 + ph * 80, 1000 - ph * 1100, 60 + ph * 180, alpha(i % 2 ? '#1c1c20' : '#2e2a2a', 0.8 * (1 - ph * 0.6))); } glow(g, 200, 1050, 400, '#ff7a20', 0.45); });
  layer(g, cam, 0.7, g => sombraCriatura(g, lerp(1000, -400, ease.in(k)), GY - 40, 2.4, T * (1 + 2 * k), { a: 1 - prog(T, tG + 1.2, tG + 1.8) }));
  const corre = prog(T, tM + 0.3, info.shot.end);
  layer(g, cam, 1, g => { [[MARIANA, 1, 80], [EDUARDO, 1, -20], [RAFAEL, RAFAEL_S, -110]].forEach(([o, sc, dx], i) => pessoa(g, { x: 520 + dx + 500 * corre, y: GY + 120, s: 1.4 * sc, facing: 1, outfit: o, pose: corre > 0 ? walkPose(T * Math.PI * 2 * 1.7 + i, { run: true }) : i === 0 ? POSES.point : POSES.crouch, expr: corre > 0 ? 'determined' : 'terrified', talk: i === 0 ? talkAmount(T, ...L.m1) : 0, t, emote: i === 0 && T > tM ? 'exclaim' : null })); bilu(g, { x: 330 + 500 * corre, y: GY + 130, s: 0.8, facing: 1, t, run: corre > 0 ? 1 : 0 }); });
  if (T > tM) { g.save(); g.translate(540, 470); g.scale(1.4, 1.4); apito(g, -60, 0, 1, -0.2); apito(g, 60, 0, 1, -0.2); g.restore(); FX.speedLines(g, t, { cy: 1000, a: 0.12 * corre, inner: 420 }); }
}});
// E — o estádio, o helicóptero, o tempo acabando: "Cadê o tio?!"
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tE = L.e1[0], tP = W('porta', L.n6);
  const cam = K(T, [[info.shot.start, foco(540, 900, 0.9)], [tP, foco(540, GY0 - 100, 1.3)], [tE, foco(420, GY0 + 0, 2.1)], [info.shot.end, foco(420, GY0 - 10, 2.3)]]);
  const { GY } = estadio(g, t, cam);
  layer(g, cam, 1, g => { helicoptero(g, 700, GY + 200, 1.1, t, { porta: prog(T, tP, tP + 3) * 0.6 });
    [[MARIANA, 1, 520], [RAFAEL, RAFAEL_S, 620]].forEach(([o, sc, x], i) => pessoa(g, { x, y: GY + 260, s: 1.4 * sc, facing: 1, outfit: o, pose: breathe(POSES.handsOnHead, t, 1, i), expr: 'terrified', t })); bilu(g, { x: 450, y: GY + 270, s: 0.8, facing: 1, t });
    pessoa(g, { x: 380, y: GY + 250, s: 1.5, facing: -1, outfit: EDUARDO, pose: breathe(T > tE ? POSES.cheer : POSES.ready, t, 1.4, 1), expr: T > tE ? 'panic' : 'worried', talk: talkAmount(T, ...L.e1), look: [-1, -0.2], t, emote: T > tE ? 'exclaim' : 'sweat' }); });
  const t1 = W('minuto', L.n6); if (T > t1 - 0.3) { const rest = T < W('trinta', L.n6) ? 60 : Math.max(0, 30 - (T - W('trinta', L.n6)) * 6); const mm = Math.floor(rest / 60), ss = Math.floor(rest % 60); rotulo(g, `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, T - t1 + 0.3, 470, S().ui.accent, 130); }
  FX.dust(g, t, { count: 50, color: '#e6e6e6', speed: 120, a: 0.6 });
}});
// F — o tio chega pelo portão, coberto de fuligem, com um espeto na mão; risadas
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tV = W('vem', L.n7), tO = L.o2[0], tE = L.e2[0], tA = L.o3[0];
  const chega = ease.out(prog(T, tV - 1.5, tO - 0.2)), ox = lerp(540, 300, chega);
  const cam = K(T, [[t0, foco(540, GY0 - 230, 1.3)], [tV, foco(540, GY0 - 40, 1.8)], [tO, foco(330, GY0 + 0, 2.2)], [tE, foco(400, GY0 + 0, 2.2)], [tA, foco(360, GY0 - 20, 2.4)], [info.shot.end, foco(520, GY0 - 120, 1.2)]]);
  const { GY } = estadio(g, t, cam);
  layer(g, cam, 1, g => { helicoptero(g, 750, GY + 200, 1.1, t, { porta: 0.6, sobe: prog(T, tA + 1.2, info.shot.end) * 0.2 });
    const o = { x: ox, y: GY + 120 + 140 * chega, s: 1.6, facing: 1, outfit: OSVALDO, pose: chega < 1 ? walkPose(T * Math.PI * 2 * 1.4, { run: true }) : breathe(T > tA ? POSES.cheer : { ...POSES.holdFront, eF: [30, -180], hF: [50, -220] }, t, 1.6, 5), expr: T > tO ? 'joy' : 'determined', talk: talkAmount(T, L.o2[0], L.o3[1]), t, emote: T > tA ? 'sparkle' : 'sweat', dim: true };
    drawFigure(g, o); if (chega >= 1 && T < tA) { seg(g, [[ox + 50, GY + 260 - 220 * 1.6 / 1.6], [ox + 60, GY + 260 - 420]], 8, '#9aa3ae'); for (let i = 0; i < 3; i++) circle(g, ox + 56, GY + 260 - 300 - i * 40, 16, '#8a4a30'); }
    for (let i = 0; i < 8; i++) circle(g, ox + Math.sin(i * 3) * 30, GY + 120 + 140 * chega - 100 - i * 40, 10, alpha('#16181d', 0.5));
    pessoa(g, { x: 470, y: GY + 250, s: 1.5, facing: -1, outfit: EDUARDO, pose: breathe(T > tE ? POSES.point : POSES.cheer, t, 1.4, 1), expr: T > tE ? 'joy' : 'shocked', talk: talkAmount(T, ...L.e2), t, emote: T > tO ? 'sparkle' : 'exclaim', face: T > tE ? { tears: true } : null });
    pessoa(g, { x: 580, y: GY + 260, s: 1.4, facing: -1, outfit: MARIANA, pose: breathe(POSES.cheer, t, 1.4, 4), expr: 'joy', t, face: { tears: true } }); bilu(g, { x: 400, y: GY + 280, s: 0.8, facing: -1, t: t * 1.5, run: 1 }); });
  if (T > tA) { for (let i = 0; i < 5; i++) { const ph = (T * 0.7 + i / 5) % 1; text(g, '♥', 300 + i * 110, 900 - ph * 300, { size: 56, color: alpha('#d8342b', 1 - ph), stroke: 10, strokeColor: alpha(INK, 1 - ph) }); } }
}});
// G — as 5 regras da temporada
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui; tijolos(g, -200, -200, E.W + 400, E.H + 400, '#8a5440', 130, 60); veil(g, '#05070c', 0.5);
  rotulo(g, '5 REGRAS', T - L.n8[0], 440, ui.gold, 110);
  [['ABRIGO PRIMEIRO', 'abrigo'], ['REGRA 7-10', 'regra'], ['ÁGUA DE BEBER NÃO SE RACIONA', 'água'], ['GERADOR SÓ DO LADO DE FORA', 'gerador'], ['ROUPA DE FORA FICA FORA', 'roupa']].forEach(([s2, w], i) => { const ti = W(w, L.n8), a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; g.save(); g.translate(540, 600 + i * 120); g.scale(a, a); rr(g, -440, -50, 880, 100, 24); g.fillStyle = INK; g.fill(); rr(g, -432, -42, 864, 84, 18); g.fillStyle = '#efe8d0'; g.fill(); circle(g, -380, 0, 30, '#3f9a5a'); text(g, String(i + 1), -380, 3, { size: 40, color: '#fff', font: FONTS.ui, weight: 900 }); text(g, s2, 30, 3, { size: s2.length > 22 ? 36 : 44, color: '#16181d', font: FONTS.ui, weight: 900 }); g.restore(); });
}});
// H — o quintal vazio, a brasa ainda queima... algo se mexe nas cinzas; a contenção falhou de novo
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tM = W('mexe', L.n9), tC = L.n10[0];
  const cam = K(T, [[info.shot.start, foco(540, 900, 1.0)], [W('brasa', L.n9), foco(800, GY0 - 300, 1.6)], [tM, foco(800, GY0 - 200, 2.6)], [info.shot.end, foco(800, GY0 - 200, 3.2)]]);
  const { GY } = quintalCinza(g, t, cam, { hatch: 1, fire: 0.5, smoke: true, poeira: 40, veu: 0.35 });
  layer(g, cam, 1, g => { glow(g, GRILL_X, GY - 200, 200, '#ff5a20', 0.3 + 0.1 * Math.sin(T * 3));
    g.fillStyle = '#3a3a3e'; g.beginPath(); g.ellipse(GRILL_X, GY - 175, 120, 30, 0, 0, 7); g.fill();
    if (T > tM - 0.3) { const k = prog(T, tM - 0.3, tM + 1.2); for (let i = 0; i < 3; i++) { const x = GRILL_X - 60 + i * 60, h = 70 * k * (0.6 + 0.4 * Math.sin(T * 6 + i)); seg(g, [[x, GY - 175], [x + 10 * Math.sin(T * 4 + i), GY - 175 - h], [x + 24, GY - 175 - h - 20 * k]], 14, '#101012'); } } });
  if (T > tC) { veil(g, '#200000', 0.25); alerta(g, T, 0.8); rotulo(g, 'A CONTENÇÃO', T - tC, 450, S().ui.accent, 96); rotulo(g, 'FALHOU DE NOVO', T - tC - 0.15, 560, S().ui.accent, 96); }
}});
registerShot('I', { draw(g, t) { titulo(g, t, 'A ÚLTIMA', 'BRASA', '10 · FINAL', '#ff5a20'); } });
// J — fim da temporada + pergunta
registerShot('Jc', { draw(g, t, info) {
  const ui = S().ui; UI.seguir(g, t, { linha1: 'FIM DA TEMPORADA 1', linha2: ['SEGUE', 'A PÁGINA'], botao: '+ SEGUIR', proximo: null, outfit: EDUARDO });
  const a = ease.outBack(prog(t, 1.4, 1.8)); if (a > 0) { g.save(); g.translate(540, 1090); g.scale(a, a); rr(g, -400, -60, 800, 120, 30); g.fillStyle = '#efe8d0'; g.fill(); poly(g, [[-300, 56], [-340, 110], [-240, 58]], '#efe8d0'); text(g, 'VOCÊ TERIA ESCUTADO O TIO?', 0, 4, { size: 44, color: '#16181d', font: FONTS.serif, weight: 900, italic: true }); g.restore(); }
}});
