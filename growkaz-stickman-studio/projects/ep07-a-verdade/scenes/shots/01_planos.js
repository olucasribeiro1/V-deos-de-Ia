// Ep. 7 — A VERDADE DEBAIXO DA CHURRASQUEIRA · planos longos
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, talkAmount, rr, seg, poly, circle, glow, alpha, text, FONTS, S, noise } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bunkerSala, tijolos, galao, caixote } from '/series/mamae/bunker.js';
import { quintal, bilu } from '/series/mamae/quintal.js';
import { alerta, impacto, riscosSusto } from '/series/mamae/efeitos.js';
import { socorros } from '/series/mamae/bunker.js';
import { laboratorio, salaComando, organismo, caixaCorreio, caixaIodeto, tireoide } from '/series/mamae/lab.js';
import { foco, K } from '/series/mamae/camera.js';
import { INK, WH, GY0, blink, W, mist, rotulo, escada, poeiraAlcapao, sepia, legendaTopo, ARM, HIPS, SENTA, titulo, seguir } from '/series/mamae/comum.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S, MARIANA_JALECO, MILITAR } from '../cast.js';
const SENTADA = { ...POSES.sit, eF: [20, -128], hF: [40, -100], eB: [14, -128], hB: [32, -100] };

// A — Dia 15: Bilu limpo, galões cheios, a pergunta; "Mariana. Senta. E conta tudo."
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tO = L.o1[0];
  const cam = K(T, [[0, foco(420, GY0 - 120, 2.2)], [W('água', L.n1), foco(470, GY0 - 100, 2.0, 0.85)], [W('pergunta', L.n1), foco(560, GY0 - 280, 1.5)], [tO, foco(700, GY0 - 320, 2.3)], [info.shot.end, foco(600, GY0 - 300, 1.9)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.75, gen: 0 });
  layer(g, cam, 1, g => { bilu(g, { x: 400, y: GY + 90, s: 1.0, facing: 1, t, run: 0 }); for (let i = 0; i < 3; i++) { const ph = (T + i / 3) % 1; circle(g, 470 + i * 20, GY - 30 - ph * 80, 8, alpha(WH, 0.7 * (1 - ph))); }
    caixote(g, 470, GY + 70, 160, 100);
    drawFigure(g, { x: 470, y: GY + 70, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(T > tO + 0.8 ? SENTADA : POSES.stand, t, 1, 4), expr: 'gulp', look: [1, 0], t, emote: 'sweat' });
    drawFigure(g, { x: 730, y: GY + 50, s: 1.8, facing: -1, outfit: OSVALDO, pose: breathe(T > tO ? POSES.point : POSES.crossArms, t, 1, 5), expr: 'determined', talk: talkAmount(T, ...L.o1), t });
    drawFigure(g, { x: 250, y: GY + 80, s: 1.55, facing: 1, outfit: EDUARDO, pose: breathe(POSES.crossArms, t, 1, 1), expr: 'suspicious', t }); });
}});
// B — ela respira fundo e conta: dissolve dentro do plano pro laboratório (6 anos), Mariana de jaleco ao lado do tanque
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tLab = W('laboratório', L.m1), k = ease.inOut(prog(T, tLab - 0.4, tLab + 0.2));
  const camB = K(T, [[t0, foco(470, GY0 - 330, 2.4)], [tLab, foco(470, GY0 - 360, 3.4)]]);
  const bunker = (g) => { const { GY } = bunkerSala(g, t, camB, { lamp: 0.7, gen: 0 }); layer(g, camB, 1, g => { caixote(g, 470, GY + 70, 160, 100); drawFigure(g, { x: 470, y: GY + 70, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(SENTADA, t, 1.6, 4), expr: T > L.m1[0] ? 'determined' : 'sad', talk: talkAmount(T, ...L.m1), look: [1, 0], t }); }); };
  const lab = (g) => { const cam = K(T, [[tLab - 0.4, foco(600, GY0 - 400, 1.0)], [info.shot.end, foco(640, GY0 - 420, 1.3)]]); const { GY } = laboratorio(g, t, cam); layer(g, cam, 1, g => drawFigure(g, { x: 360, y: GY + 60, s: 1.7, facing: 1, outfit: MARIANA_JALECO, pose: breathe({ ...POSES.holdFront, eF: [24, -150], hF: [46, -164] }, t, 1, 4), expr: 'determined', look: [1, -0.2], t })); legendaTopo(g, '6 ANOS ATRÁS', 260); };
  mist(g, k, bunker, lab);
  if (T > W('cérebro', L.m1)) rotulo(g, 'PROJETO CÉREBRO', T - W('cérebro', L.m1), 560, S().ui.accent, 90);
}});
// C — o que é o organismo: aprende, se adapta, age em grupo (quadro técnico)
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui; UI.blueprint(g);
  const z = 1 + 0.08 * (T - info.shot.start) / info.dur; g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
  organismo(g, 540, 760, 1.7, t, { brilho: '#8fd8ff' });
  [['APRENDE', 'aprende'], ['SE ADAPTA', 'adapta'], ['AGE EM GRUPO', 'grupo']].forEach(([s2, w], i) => { const ti = W(w, L.n3), a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; g.save(); g.translate(540, 1080 + i * 85); g.scale(a, a); text(g, s2, 0, 0, { size: 64, color: ui.cream, stroke: 12, strokeColor: INK }); g.restore(); });
  const tc = W('cérebro', L.n3, 2); if (T > tc - 0.2) { const a = ease.outBack(prog(T, tc - 0.2, tc + 0.1)); g.save(); g.translate(540, 520); g.scale(a, a); text(g, '= UM CÉREBRO SÓ', 0, 0, { size: 80, color: ui.gold, stroke: 16, strokeColor: INK }); g.restore(); }
  g.restore();
}});
// D — escapou: alarme no laboratório, o tanque rachado e vazio
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tE = W('escapou', L.m2);
  const cam = K(T, [[info.shot.start, foco(660, GY0 - 400, 1.2)], [tE, foco(660, GY0 - 380, 2.0, 0.85)], [info.shot.end, foco(660, GY0 - 380, 2.3, 0.85)]]);
  const [dx, dy] = impacto(T, tE, 18, 0.6); cam.x += dx; cam.y += dy;
  laboratorio(g, t, cam, { alarme: T > tE - 0.3 ? 1 : 0, quebrado: T > tE ? 1 : 0, cheio: T > tE ? 0 : 1 });
  legendaTopo(g, '2 SEMANAS ANTES DA BOMBA', 260); if (T > tE) { alerta(g, T, 0.9); rotulo(g, 'CONTENÇÃO FALHOU', T - tE, 1180, S().ui.accent, 80); }
}});
// E — a decisão do comando: sala de comando, mapa com a zona marcada, "ORDEM", a arma experimental, o clarão
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tB = W('bomba', L.m3), tO = W('ordem', L.m3), tX = W('experimental', L.m3), tQ = W('queimar', L.m3);
  const cam = K(T, [[info.shot.start, foco(540, 760, 1.0, 0.6)], [tO, foco(560, 560, 1.6, 0.6)], [tQ, foco(560, 560, 2.0, 0.6)], [info.shot.end, foco(560, 560, 2.4, 0.6)]]);
  const { GY } = salaComando(g, t, cam, { flash: prog(T, tQ + 0.6, tQ + 1.3) });
  layer(g, cam, 1, g => [[260, 1], [480, -1], [700, 1], [880, -1]].forEach(([x, f], i) => drawFigure(g, { x, y: GY + 60, s: 1.5, facing: f, outfit: MILITAR, pose: breathe(i === 1 && T > tO ? POSES.point : POSES.crossArms, t, 1, i + 3), expr: i === 1 && T > tO ? 'furious' : 'determined', t })));
  if (T > tO) { const a = ease.outBack(prog(T, tO, tO + 0.25)); g.save(); g.translate(540, 1220); g.scale(a, a); g.rotate(-0.12); rr(g, -230, -70, 460, 140, 16); g.strokeStyle = S().ui.accent; g.lineWidth = 12; g.stroke(); text(g, 'ORDEM', 0, 6, { size: 96, color: S().ui.accent, spacing: 6 }); g.restore(); }
  if (T > tX) rotulo(g, 'ARMA EXPERIMENTAL', T - tX, 450, S().ui.gold, 84);
}});
// F — de volta: Eduardo revoltado; a mãe chorando, firme
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tE = L.e1[0], tM = L.m4[0];
  const cam = K(T, [[info.shot.start, foco(560, GY0 - 300, 1.7)], [tE, foco(300, GY0 - 330, 2.6)], [tM - 0.2, foco(380, GY0 - 300, 2.0)], [tM + 0.4, foco(480, GY0 - 360, 3.0)], [info.shot.end, foco(480, GY0 - 360, 3.3)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.6, gen: 0, dark: 0.15 });
  layer(g, cam, 1, g => { caixote(g, 470, GY + 70, 160, 100);
    drawFigure(g, { x: 470, y: GY + 70, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(T > tM ? SENTADA : ARM, t, 1.6, 4), expr: T > tM ? 'cry' : 'sad', talk: talkAmount(T, ...L.m4), look: [-1, 0], t, emote: T > tM ? 'gloom' : null });
    drawFigure(g, { x: 270, y: GY + 70, s: 1.75, facing: 1, outfit: EDUARDO, pose: breathe(T > tE ? POSES.point : POSES.crossArms, t, 1.4, 1), expr: T > tE ? 'furious' : 'suspicious', talk: talkAmount(T, ...L.e1), t, emote: T > tE ? 'anger' : null });
    drawFigure(g, { x: 740, y: GY + 50, s: 1.75, facing: -1, outfit: OSVALDO, pose: breathe(POSES.handsOnHead, t, 1, 5), expr: 'shocked', t }); });
}});
// G — oito anos de piada; o dinheiro na caixa de correio (flashback noturno); o tio entende
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tL = W('lata', L.n6), tE = W('escondido', L.n6), tO = L.o2[0];
  if (T < tL - 0.2) { const cam = K(T, [[info.shot.start, foco(540, 1000, 1.0)], [tL, foco(540, 1000, 1.15)]]); const { GY } = quintal(g, t, cam, { moodName: 'day' }); layer(g, cam, 1, g => { drawFigure(g, { x: 420, y: GY + 90, s: 1.6, facing: 1, outfit: { top: 'suit', color: '#6a5a48', color2: '#2f4f7a', head: 'none', face: 'glasses' }, pose: breathe(POSES.point, t, 1.5, 7), expr: 'joy', t, emote: 'sparkle' }); drawFigure(g, { x: 720, y: GY + 90, s: 1.7, facing: -1, outfit: { ...OSVALDO, top: 'jersey', color: '#5d6b3c' }, pose: breathe(POSES.crossArms, t, 1, 5), expr: 'suspicious', t }); drawFigure(g, { x: 580, y: GY + 100, s: 1.6, facing: -1, outfit: MARIANA, pose: breathe(POSES.sad, t, 1, 4), expr: 'forced', t, emote: 'sweat' }); }); sepia(g); legendaTopo(g, 'TODO DOMINGO', 440); return; }
  if (T < tO - 0.2) { const cam = K(T, [[tL - 0.2, foco(540, 1000, 1.3)], [tO, foco(380, 1100, 2.0)]]); const { GY } = quintal(g, t, cam, { moodName: 'night', fire: 0, smoke: false }); veil(g, '#0a1020', 0.35);
    layer(g, cam, 1, g => { caixaCorreio(g, 300, GY + 60, 1.2, prog(T, tE - 0.6, tE + 0.2)); drawFigure(g, { x: 470, y: GY + 80, s: 1.6, facing: -1, outfit: MARIANA, pose: breathe({ ...POSES.reach, eF: [28, -170], hF: [56, -200] }, t, 1, 4), expr: 'nervous', look: [0.5, 0], t, emote: 'sweat' }); }); sepia(g, 0.5); legendaTopo(g, 'TODO MÊS · ESCONDIDO', 440); return; }
  fundoB(g, t); layer(g, { z: 1 + 0.05 * (T - tO) }, 1, g => bigFace(g, 540, 880, 300, { outfit: OSVALDO, expr: 'shocked', talk: talkAmount(T, ...L.o2), look: [-0.4, 0], t, rimSide: -1, emote: 'shock' }));
}});
const fundoB = (g, t) => { bunkerSala(g, t, { z: 1.5, x: 0, y: 200 }, { lamp: 0.6, gen: 0 }); veil(g, '#000', 0.45); };
// H — iodeto de potássio no kit; só protege a tireoide; quem salva é o abrigo
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tA = W('atenção', L.n7), tN = W('remédio', L.n7), tAb = W('abrigo', L.n7);
  tijolos(g, -200, -200, E.W + 400, E.H + 400, '#8a5440', 130, 60); veil(g, '#05070c', 0.45);
  const z = 1 + 0.05 * (T - info.shot.start) / info.dur; g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
  const a0 = ease.outBack(prog(T, info.shot.start, info.shot.start + 0.4)) * (1 - prog(T, tA - 0.2, tA)); if (a0 > 0) { g.save(); g.translate(540, 700); g.scale(a0 * 2.8, a0 * 2.8); socorros(g, -65, -50); g.restore(); caixaIodeto(g, 540, 1150, a0 * 1.6); }
  if (T > tA - 0.2) { const a = ease.outBack(prog(T, tA - 0.2, tA + 0.1)); g.save(); g.translate(540, 680); g.scale(a, a); tireoide(g, 0, 0, 1.5, 1); text(g, 'SÓ A TIREOIDE', 0, 280, { size: 76, color: ui.cream, stroke: 14, strokeColor: INK }); g.restore(); }
  if (T > tN - 0.2) { const a = ease.outBack(prog(T, tN - 0.2, tN + 0.1)); g.save(); g.translate(540, 1130); g.scale(a, a); text(g, 'NÃO É REMÉDIO', 0, 0, { size: 60, color: ui.accent, stroke: 14, strokeColor: INK }); text(g, 'CONTRA RADIAÇÃO', 0, 70, { size: 60, color: ui.accent, stroke: 14, strokeColor: INK }); g.restore(); }
  if (T > tAb - 0.1) { const a = ease.outBack(prog(T, tAb - 0.1, tAb + 0.2)); g.save(); g.translate(540, 1350); g.scale(a, a); rr(g, -300, -60, 600, 120, 30); g.fillStyle = INK; g.fill(); rr(g, -290, -50, 580, 100, 24); g.fillStyle = '#3f9a5a'; g.fill(); text(g, 'QUEM SALVA: O ABRIGO', 0, 4, { size: 46, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore(); }
  g.restore();
}});
// I — Rafael tenta aliviar; "Ele sobreviveu."; passos pesados em cima do alçapão
registerShot('I', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tM = L.m5[0], tP = L.n8[0] + 1.0;
  const cam = K(T, [[info.shot.start, foco(420, GY0 - 300, 2.4)], [tM - 0.2, foco(470, GY0 - 330, 2.2)], [tM + 0.2, foco(470, GY0 - 360, 3.3)], [tP - 0.6, foco(540, GY0 - 400, 1.3)], [info.shot.end, foco(540, 500, 1.7)]]);
  const passos = T > tP ? (Math.sin((T - tP) * Math.PI * 1.4) > 0.6 ? 1 : 0) : 0; const [dx, dy] = passos ? [noise(T * 40, 1) * 10, noise(T * 40, 4) * 10] : [0, 0]; cam.x += dx; cam.y += dy;
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.6 - 0.2 * passos, gen: 0, dark: 0.15 });
  const lk = T > tP ? { look: [0, -1] } : {};
  layer(g, cam, 1, g => { escada(g, CX, GY); if (T > tP) poeiraAlcapao(g, CX, T, 0.4 + 0.6 * passos); caixote(g, 470, GY + 70, 160, 100);
    drawFigure(g, { x: 330, y: GY + 80, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(T > tP ? POSES.handsOnHead : POSES.shrug, t, 1, 2), expr: T > tM ? 'terrified' : 'forced', talk: talkAmount(T, ...L.r1), t, ...lk, emote: T > tM ? 'sweat' : null });
    drawFigure(g, { x: 470, y: GY + 70, s: 1.7, facing: 1, outfit: MARIANA, pose: breathe(T > tP ? POSES.handsOnHead : SENTADA, t, 1, 4), expr: 'terrified', talk: talkAmount(T, ...L.m5), t, ...lk });
    drawFigure(g, { x: 640, y: GY + 70, s: 1.7, facing: -1, outfit: EDUARDO, pose: breathe(T > tP ? POSES.ready : POSES.crossArms, t, 1, 1), expr: T > tP ? 'terrified' : 'gulp', t, ...lk, emote: T > tP ? 'exclaim' : null });
    drawFigure(g, { x: 800, y: GY + 50, s: 1.75, facing: -1, outfit: OSVALDO, pose: breathe(T > tP ? POSES.ready : POSES.crossArms, t, 1, 5), expr: T > tP ? 'gulp' : 'suspicious', t, ...lk }); });
  if (T > tP) { alerta(g, T, 0.6); veil(g, '#300000', 0.08); }
}});
registerShot('J', { draw(g, t) { titulo(g, t, 'A VERDADE DEBAIXO', 'DA CHURRASQUEIRA', 7, '#d8342b'); } });
registerShot('Kc', { draw(g, t) { seguir(g, t, 'EP. 8 — ELE SENTE O CALOR', EDUARDO); } });
