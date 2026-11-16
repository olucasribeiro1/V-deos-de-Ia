// Ep. 4 — O AR PESADO · planos longos com câmera que acompanha
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, talkAmount, wordTime, rr, seg, poly, circle, glow, alpha, text, FONTS, S, noise } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bunkerSala, tijolos, caixote, lata, gerador, filtroAr, POS } from '/series/mamae/bunker.js';
import { quintal } from '/series/mamae/quintal.js';
import { fallout, alerta, impacto, riscosSusto, cartao } from '/series/mamae/efeitos.js';
import { periscopio, visorPeriscopio, detectorCO, controle, pilha, manivela, canoEscape, sintoma, dormindo } from '/series/mamae/props.js';
import { foco, K } from '/series/mamae/camera.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';

const INK = '#0b0b0d', WH = '#f1efe9', GY0 = 1305.6, PX = 760, DET = [640, 560];
const blink = (t, p = 3.1) => (t % p) > p - 0.12;
const W = (w, L, n = 1) => { let tt = L[0] - 0.05; for (let i = 0; i < n; i++) { const r = wordTime(w, tt); if (r == null) return L[0]; if (i === n - 1) return r; tt = r + 0.05; } };
const mist = (g, k, A, B) => { if (k < 1) A(g); if (k > 0) { g.save(); g.globalAlpha *= k; B(g); g.restore(); } };
const rotulo = (g, str, k, y = 430, color = null, size = 100) => { const a = ease.outBack(prog(k, 0, 0.25)); if (a <= 0) return; g.save(); g.translate(540, y); g.scale(a, a); g.rotate(-0.03); text(g, str, 0, 0, { size, color: color || S().ui.gold, stroke: size * 0.2, strokeColor: INK, spacing: 2 }); g.restore(); };
const fundo = (g, t, cam, o) => blurLayer(g, 12, g => bunkerSala(g, t, cam, o), null, 0.6);
const enjoo = (g, a) => { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = alpha('#b8d890', 0.35 * a); g.fillRect(-200, -200, E.W + 400, E.H + 400); g.restore(); };
// tontura: a cena desenhada duas vezes, deslocada e girando, com borrão
const tontura = (g, a, T, desenha) => { desenha(g); if (a <= 0) return; g.save(); g.globalAlpha = 0.45 * a; g.translate(E.W / 2, E.H / 2); g.rotate(Math.sin(T * 2.2) * 0.05 * a); g.translate(-E.W / 2 + Math.sin(T * 3) * 26 * a, -E.H / 2 + Math.cos(T * 2.4) * 14 * a); desenha(g); g.restore(); };
const extra = (g, t, T, cam) => layer(g, cam, 0.6, g => detectorCO(g, DET[0], DET[1], 0.8, t));

// A — Dia 5: rotina; risquinhos dos dias na parede, galões, vigia com lanterna, Rafael e os 3 sabores
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tV = W('turno', L.n1), tS = L.n2[0];
  const cam = K(T, [[0, foco(540, 650, 2.2, 0.6)], [W('ração', L.n1), foco(260, 1100, 1.9, 0.85)], [tV, foco(780, GY0 - 280, 2.0)], [tS - 0.2, foco(500, GY0 - 260, 1.8)], [info.shot.end, foco(420, GY0 - 260, 2.2)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.8 });
  layer(g, cam, 0.6, g => { for (let i = 0; i < 5; i++) { const a = prog(T, 0.2 + i * 0.15, 0.35 + i * 0.15); if (a > 0) seg(g, i < 4 ? [[420 + i * 26, 480], [420 + i * 26, 480 + 80 * a]] : [[405, 540], [405 + 120 * a, 480]], 9, WH); } });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 800, y: GY + 60, s: 1.6, facing: -1, outfit: EDUARDO, pose: { ...POSES.sit, eF: [30, -130], hF: [60, -140] }, prop: 'flashlight', expr: 'sleepy', t });
    caixote(g, 400, GY + 70, 160, 100); drawFigure(g, { x: 400, y: GY + 70, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.sit, t, 1, 2), expr: T > tS ? 'disgust' : 'neutral', t, emote: T > tS + 3 ? 'question' : null });
    if (T > tS) ['FRANGO', 'CARNE', 'PROTEÍNA'].forEach((s2, i) => { const ti = W(i === 0 ? 'frango' : i === 1 ? 'carne' : 'proteína', L.n2); const a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; g.save(); g.translate(260 + i * 160, GY - 330 - (i === 2 ? 30 : 0)); g.scale(a * (i === 2 ? 1.25 : 1), a * (i === 2 ? 1.25 : 1)); lata(g, 0, 0, i === 2 ? '#55623a' : i === 1 ? '#d8703a' : '#e0a030', 1.6, true); text(g, s2, 0, 34, { size: 30, color: i === 2 ? S().ui.accent : WH, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK }); g.restore(); }); });
  extra(g, t, T, cam);
}});
// B — Rafael passando mal; o tio desdenha
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tO = L.o1[0];
  const cam = K(T, [[info.shot.start, foco(420, GY0 - 300, 2.6)], [tO - 0.1, foco(420, GY0 - 300, 2.6)], [tO + 0.3, foco(600, GY0 - 280, 1.9)], [info.shot.end, foco(640, GY0 - 280, 2.1)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.8 });
  layer(g, cam, 1, g => { caixote(g, 400, GY + 70, 160, 100);
    drawFigure(g, { x: 400, y: GY + 70, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe({ ...POSES.sit, eF: [24, -170], hF: [10, -205], eB: [-14, -170], hB: [-2, -205] }, t, 1.5, 2), expr: 'sob', talk: talkAmount(T, ...L.r1), t, emote: ['sweat', 'steam'] });
    drawFigure(g, { x: 720, y: GY + 50, s: 1.7, facing: -1, outfit: OSVALDO, pose: breathe(POSES.crossArms, t, 1, 5), expr: 'suspicious', talk: talkAmount(T, ...L.o1), t }); });
  enjoo(g, 0.5); extra(g, t, T, cam);
}});
// C — Eduardo fica tonto (visão dupla, a câmera balança)
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, a = prog(T, info.shot.start + 0.5, L.e1[0]);
  const cam = K(T, [[info.shot.start, foco(780, GY0 - 300, 1.9)], [L.e1[0], foco(780, GY0 - 330, 2.5)], [info.shot.end, foco(780, GY0 - 330, 2.8)]]); cam.r = Math.sin(T * 1.7) * 0.04 * a;
  tontura(g, a, T, g => { const { GY } = bunkerSala(g, t, cam, { lamp: 0.8 }); layer(g, cam, 1, g => drawFigure(g, { x: 800, y: GY + 60, s: 1.7, facing: -1, outfit: EDUARDO, pose: breathe(posesAt(T, [[info.shot.start, { ...POSES.sit, eF: [30, -130], hF: [60, -140] }], [L.e1[0] - 0.5, { ...POSES.sit, eF: [20, -170], hF: [8, -205] }]], 0.4), t, 1, 1), expr: a > 0.5 ? 'blank' : 'gulp', talk: talkAmount(T, ...L.e1), look: [Math.sin(T * 3) * 0.8, Math.cos(T * 2.5) * 0.5], t, emote: a > 0.5 ? 'sweat' : null })); extra(g, t, T, cam); });
  enjoo(g, a); veil(g, '#000', 0.25 * a);
}});
// D — a biomédica assume: lanterna nos olhos, sintomas, MONÓXIDO DE CARBONO
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tM = L.m1[0], tCO = W('monóxido', L.m1);
  const walk = prog(T, t0 + 0.2, tM - 0.2), mx = lerp(250, 640, ease.inOut(walk));
  const cam = K(T, [[t0, foco(450, GY0 - 300, 1.6)], [tM, foco(700, GY0 - 330, 2.1)], [tCO - 0.3, foco(680, GY0 - 330, 2.2)], [tCO + 0.2, foco(640, GY0 - 400, 2.8)], [info.shot.end, foco(640, GY0 - 400, 3.0)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.85 });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 800, y: GY + 60, s: 1.7, facing: -1, outfit: EDUARDO, pose: breathe({ ...POSES.sit, eF: [20, -150], hF: [6, -120] }, t, 1, 1), expr: 'blank', t, emote: 'sweat' });
    drawFigure(g, { x: mx, y: GY + 60, s: 1.8, facing: 1, outfit: MARIANA, pose: walk < 1 ? walkPose(T * Math.PI * 2 * 1.1) : breathe(T < tCO ? { ...POSES.point, eF: [34, -160], hF: [66, -168] } : POSES.explain, t, 1, 4), prop: walk >= 1 && T < tCO ? 'flashlight' : null, expr: T > tCO ? 'furious' : 'determined', talk: talkAmount(T, ...L.m1), t, emote: T > tCO ? 'exclaim' : null }); });
  ['cabeca', 'tontura', 'enjoo'].forEach((k2, i) => { const ti = W(['dor', 'tontura', 'enjoo'][i], L.m1); const a = ease.outBack(prog(T, ti - 0.05, ti + 0.25)) * (1 - prog(T, tCO - 0.2, tCO)); if (a > 0) { sintoma(g, 220 + i * 320, 470, a, k2, T); text(g, ['DOR DE CABEÇA', 'TONTURA', 'ENJOO'][i], 220 + i * 320, 610, { size: 34, color: WH, font: FONTS.ui, weight: 900, stroke: 10, strokeColor: INK, alpha: a }); } });
  if (T > tCO) { rotulo(g, 'MONÓXIDO', T - tCO, 440, S().ui.accent, 116); rotulo(g, 'DE CARBONO', T - tCO - 0.1, 560, S().ui.accent, 92); alerta(g, T, 0.8); }
  extra(g, t, T, cam);
}});
// E — explicação: sem cor, sem cheiro; de onde vem; toma o lugar do oxigênio; mata dormindo
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tSai = W('sai', L.n5), tTo = W('toma', L.n5), tSo = W('sono', L.n5), tMo = W('morre', L.n5);
  UI.blueprint(g); const z = 1 + 0.05 * (T - info.shot.start) / info.dur; g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  const p1 = 1 - prog(T, tSai - 0.3, tSai);
  if (p1 > 0) { g.save(); g.globalAlpha = p1; const pulse = 1 + 0.05 * Math.sin(T * 6); g.save(); g.translate(540, 820); g.scale(pulse, pulse); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + T * 0.5; circle(g, Math.cos(a) * 220, Math.sin(a) * 120, 18, alpha('#b8c4d4', 0.3)); } circle(g, -60, 0, 90, INK); circle(g, -60, 0, 82, '#7d8794'); circle(g, 70, 0, 74, INK); circle(g, 70, 0, 66, '#d8342b'); text(g, 'C', -60, 4, { size: 80, color: WH }); text(g, 'O', 70, 4, { size: 70, color: WH }); g.restore();
    text(g, 'SEM COR', 540, 1060, { size: 70, color: ui.cream, stroke: 14, strokeColor: INK }); text(g, 'SEM CHEIRO', 540, 1150, { size: 70, color: ui.cream, stroke: 14, strokeColor: INK, alpha: prog(T, W('cheiro', L.n5) - 0.2, W('cheiro', L.n5)) }); g.restore(); }
  const p2 = prog(T, tSai - 0.3, tSai) * (1 - prog(T, tTo - 0.3, tTo));
  if (p2 > 0) { g.save(); g.globalAlpha = p2; [['GERADOR', (g) => gerador(g, 0, 60, T, 1)], ['CARRO', (g) => { rr(g, -150, -40, 300, 90, 30); g.fillStyle = '#d8703a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); circle(g, -90, 60, 34, INK); circle(g, 90, 60, 34, INK); for (let i = 0; i < 3; i++) { const ph = (T + i / 3) % 1; circle(g, 180 + ph * 60, 30 - ph * 40, 20 + ph * 30, alpha('#9aa3ae', 0.6 * (1 - ph))); } }], ['FOGÃO', (g) => { rr(g, -120, -60, 240, 150, 14); g.fillStyle = '#e9edf0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); for (const dx of [-55, 55]) { circle(g, dx, -60, 34, INK); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; circle(g, dx + Math.cos(a) * 22, -66 + Math.sin(a) * 6, 7, '#5f8fd0'); } } }]].forEach(([lab, fn], i) => { const a = ease.outBack(prog(T, tSai + i * 0.3, tSai + 0.25 + i * 0.3)); if (a <= 0) return; g.save(); g.translate(430, 560 + i * 330); g.scale(a * 1.25, a * 1.25); fn(g); g.restore(); text(g, lab, 830, 580 + i * 330, { size: 46, color: ui.cream, font: FONTS.ui, weight: 900, stroke: 10, strokeColor: INK, alpha: a }); }); g.restore(); }
  const p3 = prog(T, tTo - 0.3, tTo) * (1 - prog(T, tSo - 0.2, tSo + 0.1));
  if (p3 > 0) { g.save(); g.globalAlpha = p3; text(g, 'SANGUE', 540, 420, { size: 70, color: ui.cream, stroke: 14, strokeColor: INK }); const k = prog(T, tTo, tTo + 1.4);
    for (let i = 0; i < 6; i++) { const x = 220 + (i % 3) * 320, y = 700 + Math.floor(i / 3) * 360; g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, 120, 90, 0, 0, 7); g.fill(); g.fillStyle = '#c0444a'; g.beginPath(); g.ellipse(x, y, 112, 82, 0, 0, 7); g.fill(); g.fillStyle = '#a03038'; g.beginPath(); g.ellipse(x, y, 60, 40, 0, 0, 7); g.fill();
      const co = i / 6 < k; text(g, co ? 'CO' : 'O₂', x, y, { size: 56, color: co ? '#16181d' : WH, font: FONTS.ui, weight: 900, stroke: co ? 0 : 10, strokeColor: INK }); if (co) { g.strokeStyle = '#16181d'; g.lineWidth = 6; g.beginPath(); g.arc(x, y, 50, 0, 7); g.stroke(); } } g.restore(); }
  const p4 = prog(T, tSo - 0.2, tSo + 0.1);
  if (p4 > 0) { g.save(); g.globalAlpha = p4; drawFigure(g, { x: 540, y: 1200, s: 2.2, facing: 1, outfit: { top: 'none', head: 'none' }, pose: POSES.lie, rot: -1.5, expr: 'sleepy', alpha: 1 - 0.6 * prog(T, tMo, tMo + 1.2), shadow: false }); text(g, 'Z', 700 + Math.sin(T * 3) * 10, 860 - ((T * 60) % 80), { size: 80, color: ui.cream, stroke: 14, strokeColor: INK }); text(g, 'z', 770, 780 - ((T * 60 + 40) % 80), { size: 56, color: ui.cream, stroke: 12, strokeColor: INK });
    if (T > tMo) { rotulo(g, 'MATA DORMINDO', T - tMo, 520, ui.accent, 92); } g.restore(); }
  g.restore();
}});
// F — o detector! a tampa abre: pilha não está lá; Rafael com o controle, culpado
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tN = L.n6[0], tR = L.r2[0], ab = ease.outBack(prog(T, tN + 0.3, tN + 0.8));
  const cam = K(T, [[info.shot.start, foco(DET[0], DET[1] + 200, 1.6, 0.6)], [tN, foco(DET[0], DET[1] + 60, 2.6, 0.6)], [tR - 0.4, foco(DET[0], DET[1] + 60, 2.8, 0.6)], [tR, foco(380, GY0 - 260, 2.4)], [info.shot.end, foco(380, GY0 - 270, 2.6)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.8 });
  layer(g, cam, 0.6, g => detectorCO(g, DET[0], DET[1], 0.8, t, { aberto: ab }));
  layer(g, cam, 1, g => { caixote(g, 400, GY + 70, 160, 100);
    drawFigure(g, { x: 400, y: GY + 70, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe({ ...POSES.sit, eF: [20, -130], hF: [44, -150], eB: [14, -130], hB: [36, -150] }, t, 1, 2), expr: T > tR ? 'gulp' : 'sob', talk: talkAmount(T, ...L.r2), t, emote: T > tR ? ['sweat', 'blush'] : null });
    controle(g, 448, GY - 85, 0.5, -0.2); if (T > tR) { const a = ease.outBack(prog(T, tR + 0.2, tR + 0.5)); g.save(); g.translate(560, GY - 260); g.scale(a, a); pilha(g, 0, 0, 1, -0.4); g.restore(); seg(g, [[520, GY - 230], [470, GY - 120]], 4, alpha(WH, 0.6 * a)); }
    drawFigure(g, { x: 750, y: GY + 50, s: 1.7, facing: -1, outfit: OSVALDO, pose: breathe(T < tN ? POSES.point : POSES.handsOnHead, t, 1, 5), expr: T > tR ? 'furious' : 'shocked', talk: talkAmount(T, ...L.o2), t, emote: T > tR ? 'anger' : 'exclaim' }); });
  enjoo(g, 0.35);
}});
// G — DESLIGA O GERADOR! o tio corta o motor, gira a manivela; ar entrando; as cores voltam
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tOff = W('desliga', L.o3) + 0.4, tMan = W('manivela', L.n7), tFim = W('latejar', L.n7);
  const gen = T < tOff ? 1 : 0, ar = prog(T, tMan, tMan + 0.8), cura = prog(T, tMan + 1, tFim + 0.5);
  const cam = K(T, [[t0, foco(700, GY0 - 280, 1.6)], [tOff - 0.3, foco(980, GY0 + 40, 2.2, 0.85)], [tOff + 0.4, foco(980, GY0 + 40, 2.3, 0.85)], [tMan - 0.3, foco(900, 780, 2.0, 0.6)], [tMan + 1.2, foco(860, 900, 1.6, 0.6)], [tFim, foco(600, GY0 - 400, 1.15)], [info.shot.end, foco(600, GY0 - 420, 1.2)]]);
  const [dx, dy] = impacto(T, tOff, 16, 0.4); cam.x += dx; cam.y += dy;
  const { GY } = bunkerSala(g, t, cam, { lamp: T < tOff ? 0.8 : 0.45, gen });
  layer(g, cam, 0.6, g => { manivela(g, 1030, 760, 1.3, ar * T * 7); if (ar > 0) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const ph = (T * 1.4 + i / 8) % 1; seg(g, [[900 - ph * 500, 700 + i * 18 + Math.sin(ph * 7 + i) * 20], [960 - ph * 500, 700 + i * 18 + Math.sin(ph * 7 + i + 0.5) * 20]], 7, alpha('#cfe8ff', 0.45 * ar * (1 - ph))); } g.restore(); } });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: lerp(820, 900, prog(T, t0, tOff - 0.3)), y: GY + 50, s: 1.7, facing: 1, outfit: OSVALDO, pose: T < tOff ? walkPose(T * Math.PI * 2 * 1.4, { run: true }) : posesAt((T * 1.4) % 1, [[0, { ...POSES.reach, eF: [30, -200], hF: [60, -230] }], [0.5, { ...POSES.reach, eF: [40, -170], hF: [74, -190] }], [1, { ...POSES.reach, eF: [30, -200], hF: [60, -230] }]], 0.3), expr: 'determined', talk: talkAmount(T, ...L.o3), t, emote: 'sweat' });
    [[560, EDUARDO, 1], [680, RAFAEL, RAFAEL_S], [440, MARIANA, 1]].forEach(([x, o, sc], i) => drawFigure(g, { x, y: GY + 70, s: 1.5 * sc, facing: 1, outfit: o, pose: breathe(cura > 0.6 ? POSES.relaxed : POSES.sad, t, 2 - cura, i), expr: cura > 0.6 ? 'smile' : 'gulp', look: [1, -0.3], t, emote: cura > 0.8 ? null : 'sweat' })); });
  enjoo(g, 0.4 * (1 - cura));
}});
// H — regra de ouro (cartão)
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui; tijolos(g, -200, -200, E.W + 400, E.H + 400, '#8a5440', 130, 60); veil(g, '#05070c', 0.5);
  const z = 1 + 0.05 * (T - info.shot.start); g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
  rotulo(g, 'REGRA DE OURO', T - info.shot.start, 420, ui.gold, 92);
  [['GERADOR SÓ DO LADO DE FORA', W('gerador', L.n8)], ['NEM COM JANELA ABERTA', W('janela', L.n8)], ['DETECTOR SEMPRE COM PILHA', W('detector', L.n8)]].forEach(([s2, ti], i) => { const a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; g.save(); g.translate(540, 680 + i * 190); g.scale(a, a); rr(g, -420, -70, 840, 140, 26); g.fillStyle = INK; g.fill(); rr(g, -410, -60, 820, 120, 20); g.fillStyle = '#efe8d0'; g.fill(); seg(g, [[-370, 0], [-345, 26], [-300, -28]], 16, i < 2 ? ui.accent : '#3f9a5a'); text(g, s2, 40, 4, { size: 44, color: '#16181d', font: FONTS.ui, weight: 900 }); g.restore(); });
  g.restore();
}});
// I — Eduardo pergunta à mãe sobre o Projeto Cérebro (perto do filtro, luz baixa)
registerShot('I', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tM = L.m2[0], tC = W('cérebro', L.e2);
  const cam = K(T, [[info.shot.start, foco(560, GY0 - 300, 1.8)], [tC - 0.5, foco(520, GY0 - 330, 2.4)], [tM - 0.2, foco(520, GY0 - 330, 2.4)], [tM + 0.3, foco(660, GY0 - 360, 3.0)], [info.shot.end, foco(660, GY0 - 360, 3.2)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.4, gen: 0, dark: 0.25 });
  layer(g, cam, 1, g => { drawFigure(g, { x: 450, y: GY + 70, s: 1.8, facing: 1, outfit: EDUARDO, pose: breathe(T > tC ? POSES.explain : POSES.crossArms, t, 1, 1), expr: 'suspicious', talk: talkAmount(T, ...L.e2), t, emote: T > tC ? 'question' : null });
    drawFigure(g, { x: 660, y: GY + 60, s: 1.8, facing: -1, outfit: MARIANA, pose: breathe(T > tM ? { ...POSES.sad, eF: [-4, -140], hF: [-14, -128], eB: [16, -134], hB: [4, -150] } : POSES.crossArms, t, 1.3, 4), expr: T > tM ? 'sad' : 'gulp', talk: talkAmount(T, ...L.m2), look: T > tM ? [0.6, 0.6] : [-1, 0], t, emote: T > tC ? 'sweat' : null }); });
  if (T > tC - 0.1) { const a = ease.outBack(prog(T, tC - 0.1, tC + 0.2)) * (1 - prog(T, tM, tM + 0.3)); if (a > 0) { g.save(); g.translate(540, 430); g.scale(a, a); g.rotate(-0.04); text(g, 'PROJETO CÉREBRO', 0, 0, { size: 86, color: S().ui.accent, stroke: 18, strokeColor: INK, spacing: 2 }); g.restore(); } }
}});
// J — o tio vai ao periscópio; o cano do escape amassado e marcas de garra
registerShot('J', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tIn = W('periscópio', L.n9) + 0.2, tAm = L.n10[0], tGa = W('marcas', L.n10);
  const dentro = ease.inOut(prog(T, tIn, tIn + 0.5));
  const camB = K(T, [[t0, foco(PX + 110, 930, 1.8)], [tIn, foco(PX + 110, 820, 2.6)]]);
  const bunker = (g) => { const { GY } = bunkerSala(g, t, camB, { lamp: 0.4, gen: 0, dark: 0.3 }); layer(g, camB, 1, g => { periscopio(g, PX, prog(T, t0, t0 + 1)); drawFigure(g, { x: PX + 160, y: GY + 50, s: 1.65, facing: -1, outfit: OSVALDO, pose: posesAt(T, [[t0, 'relaxed'], [t0 + 0.8, { ...POSES.reach, eF: [26, -190], hF: [44, -220] }]], 0.3), expr: 'determined', talk: talkAmount(T, ...L.o4), t }); }); };
  const visao = (g) => { const z = 1.4 + 1.2 * ease.inOut(prog(T, tIn + 0.5, tAm)); visorPeriscopio(g, t, g => { quintal(g, t, { z, x: 220, y: 240 }, { white: 0.1, fire: 0, smoke: false }); veil(g, '#6a6f78', 0.4); g.save(); g.translate(540, 960); g.scale(z / 1.4, z / 1.4); g.translate(-540, -960); canoEscape(g, 560, 1180, 1.2, T > tAm - 0.2 ? 1 : 0, prog(T, tGa - 0.2, tGa + 0.4)); g.restore(); fallout(g, t, { count: 60, a: 0.5, speed: 40 }); }); };
  mist(g, dentro, bunker, visao);
  if (T > L.o5[0]) { const a = 1 - prog(T, tAm - 0.3, tAm); if (a > 0) text(g, 'NÃO TÁ ENTUPIDO.', 540, 450, { size: 70, color: S().ui.cream, stroke: 14, strokeColor: INK, alpha: a }); }
  if (T > tAm) { rotulo(g, 'AMASSADO', T - tAm, 450, S().ui.accent, 96); if (T > tGa) alerta(g, T, 0.8); }
}});
registerShot('Kt', { draw(g, t, info) {
  const ui = S().ui; g.fillStyle = '#060607'; g.fillRect(0, 0, E.W, E.H); glow(g, 500, 1500, 700, '#9ab83a', 0.1 + 0.03 * Math.sin(t * 5));
  const z = 1 + 0.04 * t; g.save(); g.translate(540, 900); g.scale(z, z);
  const a1 = ease.out(prog(t, 0.05, 0.35)), a2 = ease.outBack(prog(t, 0.2, 0.55)), a3 = ease.out(prog(t, 0.5, 0.8));
  text(g, 'O QUE A MAMÃE SABIA', 0, -230, { size: 40, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 6, alpha: a1 });
  g.save(); g.scale(a2, a2); text(g, 'O AR', 0, -110, { size: 140, color: ui.cream, spacing: 3 }); text(g, 'PESADO', 0, 20, { size: 130, color: ui.cream, spacing: 3 }); g.restore();
  g.fillStyle = alpha(ui.accent, a3); g.fillRect(-170 * a3, 110, 340 * a3, 8); text(g, 'EPISÓDIO 4', 0, 180, { size: 54, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 8, alpha: a3 });
  g.restore();
}});
registerShot('Lc', { draw(g, t, info) { UI.seguir(g, t, { proximo: 'EP. 5 — A CONTA DA ÁGUA', outfit: EDUARDO }); } });
