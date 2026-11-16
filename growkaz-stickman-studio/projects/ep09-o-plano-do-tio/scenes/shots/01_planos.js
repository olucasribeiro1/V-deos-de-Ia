// Ep. 9 — O PLANO DO TIO · planos longos
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, talkAmount, rr, seg, poly, circle, glow, alpha, text, FONTS, S, noise } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { bunkerSala, tijolos, caixote, radio, onda, galao, lata } from '/series/mamae/bunker.js';
import { quintal, churrasqueira, fumaca } from '/series/mamae/quintal.js';
import { alerta, impacto, relogio, sopro } from '/series/mamae/efeitos.js';
import { mochila, sacosCarvao, apito, guarana, mapaCidade } from '/series/mamae/props.js';
import { foco, K } from '/series/mamae/camera.js';
import { INK, WH, GY0, blink, W, mist, rotulo, escada, poeiraAlcapao, sepia, legendaTopo, ARM, HIPS, SENTA, titulo, seguir } from '/series/mamae/comum.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';

// A — os dias passam: calendário 16 → 22, noite e dia, passos e poeira
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, k = prog(T, 0.3, info.shot.end - 0.3), dia = Math.round(lerp(16, 22, k)), noite = Math.sin(k * Math.PI * 6) > 0;
  const cam = K(T, [[0, foco(540, GY0 - 300, 1.2)], [info.shot.end, foco(540, GY0 - 330, 1.35)]]);
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: noite ? 0.15 : 0.8, gen: 0, dark: noite ? 0.6 : 0.1 });
  layer(g, cam, 1, g => { escada(g, CX, GY); if (noite) poeiraAlcapao(g, CX, T, 0.8);
    [[250, MARIANA], [400, RAFAEL], [660, EDUARDO], [820, OSVALDO]].forEach(([x, o], i) => drawFigure(g, { x, y: GY + 70, s: 1.45 * (o === RAFAEL ? RAFAEL_S : 1), facing: i < 2 ? 1 : -1, outfit: o, pose: breathe(noite ? POSES.handsOnHead : POSES.relaxed, t, 1, i), expr: noite ? 'terrified' : 'sad', look: noite ? [0, -1] : [0, 0.3], t })); });
  g.save(); g.translate(540, 560); rr(g, -150, -170, 300, 340, 18); g.fillStyle = INK; g.fill(); rr(g, -140, -160, 280, 320, 12); g.fillStyle = WH; g.fill(); rr(g, -140, -160, 280, 80, 12); g.fillStyle = S().ui.accent; g.fill(); text(g, 'DIA', 0, -118, { size: 44, color: '#fff', font: FONTS.ui, weight: 900, spacing: 4 }); text(g, String(dia), 0, 50, { size: 150, color: '#16181d' }); g.restore();
  if (noite) veil(g, '#0a1030', 0.25);
}});
// B — o rádio chia com uma voz nova: evacuação no estádio, dia 30, meio-dia, último helicóptero
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tR = L.rad[0], voz = T > tR ? 1 : 0;
  const cam = K(T, [[info.shot.start, foco(780, GY0 - 280, 1.8)], [tR, foco(820, 1050, 3.4, 0.85)], [info.shot.end, foco(820, 1050, 3.7, 0.85)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.6, gen: 0, radioOn: 1, voz });
  layer(g, cam, 1, g => drawFigure(g, { x: 660, y: GY + 60, s: 1.6, facing: 1, outfit: OSVALDO, pose: breathe(POSES.reach, t, 1, 5), expr: voz ? 'shocked' : 'determined', t, emote: voz ? 'exclaim' : null }));
  if (voz) { onda(g, 130, 600, 820, t, { amp: 90, color: ui.accent, lw: 8 }); alerta(g, T, 0.4); }
  [['ESTÁDIO MUNICIPAL', 'estádio'], ['DIA 30 · 12:00', 'trinta'], ['ÚLTIMO HELICÓPTERO', 'último']].forEach(([s2, w], i) => { const ti = W(w, L.rad), a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; g.save(); g.translate(540, 1000 + i * 110); g.scale(a, a); rr(g, -380, -46, 760, 92, 22); g.fillStyle = 'rgba(8,9,12,.88)'; g.fill(); g.strokeStyle = i === 2 ? ui.accent : ui.gold; g.lineWidth = 4; g.stroke(); text(g, s2, 0, 4, { size: 52, color: i === 2 ? ui.accent : WH, font: FONTS.ui, weight: 900 }); g.restore(); });
}});
// C — 3 km; "a gente brilha feito uma fogueira"; "então a gente dá pra ela uma fogueira maior"
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tM = L.m1[0], tO = L.o1[0];
  if (T < tM - 0.2) { const k = prog(T, info.shot.start, tM - 0.3); g.save(); const z = 1.4 - 0.3 * k; g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); mapaCidade(g, t, { rota: k }); g.restore(); const a = ease.outBack(prog(T, W('três', L.e1) - 0.1, W('três', L.e1) + 0.2)); if (a > 0) { g.save(); g.translate(540, 470); g.scale(a, a); text(g, '3 KM', 0, 0, { size: 140, color: S().ui.accent, stroke: 24, strokeColor: INK }); g.restore(); } return; }
  const cam = K(T, [[tM - 0.2, foco(420, GY0 - 330, 2.3)], [tO, foco(700, GY0 - 330, 2.3)], [info.shot.end, foco(700, GY0 - 340, 2.7)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.6, gen: 0 });
  layer(g, cam, 1, g => { drawFigure(g, { x: 420, y: GY + 60, s: 1.75, facing: 1, outfit: MARIANA, pose: breathe(POSES.explain, t, 1, 4), expr: 'worried', talk: talkAmount(T, ...L.m1), t, emote: 'sweat' });
    drawFigure(g, { x: 720, y: GY + 50, s: 1.8, facing: -1, outfit: OSVALDO, pose: breathe(T > tO ? HIPS : POSES.think, t, 1, 5), expr: T > tO ? 'proud' : 'suspicious', talk: talkAmount(T, ...L.o1), t, emote: T > tO ? 'sparkle' : null }); });
  if (T > W('fogueira', L.m1) && T < tO) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 420, 1000, 260, '#ff7a20', 0.4); g.restore(); }
  if (T > tO + 0.8) { glow(g, 700, 900, 500, '#ff7a20', 0.25 + 0.1 * Math.sin(T * 6)); }
}});
// D — a piada da família vira arma: a churrasqueira, o depósito de carvão, 8 anos de sacos
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tC = W('churrasqueira', L.n3), tD = W('depósito', L.n3), tO = W('oito', L.n3);
  if (T < tD - 0.2) { const cam = K(T, [[info.shot.start, foco(540, 1000, 1.0)], [tC, foco(800, GY0 - 300, 1.8)], [tD, foco(800, GY0 - 200, 2.3)]]); const { GY } = quintal(g, t, cam, { white: 0.05, fire: 0.6, smoke: true }); veil(g, '#6a6f78', 0.25); return; }
  tijolos(g, -200, -200, E.W + 400, E.H + 400, '#8a5440', 130, 60); veil(g, '#05070c', 0.35);
  const n = Math.min(16, Math.floor(prog(T, tD, tO + 0.6) * 16) + 1); const z = 1.1 - 0.15 * prog(T, tD, info.shot.end); g.save(); g.translate(540, 1100); g.scale(z, z); g.translate(-540, -1100); sacosCarvao(g, 230, 1500, 1.25, n); g.restore();
  if (T > tO) rotulo(g, '8 ANOS DE CARVÃO', T - tO, 470, S().ui.gold, 90);
}});
// E — o plano no mapa: brasa no máximo + gerador fora = isca; ele vai pro calor; a família pro outro lado
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tA = W('acende', L.o2), tV = W('vem', L.o2), tO = W('outro', L.o2), tM = L.m2[0];
  const isca = prog(T, tA, tA + 0.8), cria = prog(T, tV - 0.2, tV + 1.6), fam = prog(T, tO - 0.2, tM + 1.0);
  const z = 1.0 + 0.05 * (T - info.shot.start) / info.dur; g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  mapaCidade(g, t, { rota: prog(T, tO - 0.2, tO + 0.6), isca, criatura: T > tV - 0.2 ? cria : -1, familia: T > tO - 0.2 ? fam * 0.6 : -1 }); g.restore();
  const t4 = W('quatro', L.m2); if (T > tA && T < t4) rotulo(g, 'ISCA DE CALOR', T - tA, 470, '#ff7a20', 92); if (T > t4) rotulo(g, '> 4 CORPOS + 1 CACHORRO', T - t4, 470, '#ff9a30', 70);
  if (T > tM) { const a = ease.outBack(prog(T, W('quente', L.m2) - 0.1, W('quente', L.m2) + 0.2)); if (a > 0) { g.save(); g.translate(540, 1240); g.scale(a, a); rr(g, -340, -52, 680, 104, 26); g.fillStyle = 'rgba(8,9,12,.88)'; g.fill(); text(g, 'FONTE MAIS QUENTE', 0, 4, { size: 56, color: '#ff9a30', font: FONTS.ui, weight: 900 }); g.restore(); } }
}});
// F — mochila de fuga: água, comida, lanterna, rádio, remédio, documento e apito; o guaraná do Rafael
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tR = L.r1[0], tO = L.o3[0];
  if (T < tR - 0.2) { tijolos(g, -200, -200, E.W + 400, E.H + 400, '#3d6f8a', 130, 60); veil(g, '#05070c', 0.5);
    g.save(); g.translate(540, 1150); g.scale(2.2, 2.2); mochila(g, 0, 0, 1, 1); g.restore(); rotulo(g, 'MOCHILA DE FUGA', T - L.n4[0], 450, ui.gold, 90);
    const itens = [['ÁGUA', 'água'], ['COMIDA', 'comida'], ['LANTERNA', 'lanterna'], ['RÁDIO', 'rádio'], ['REMÉDIO', 'remédio'], ['DOCUMENTO', 'documento'], ['APITO', 'apito']];
    itens.forEach(([s2, w], i) => { const ti = W(w, L.n4), a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; const x = i % 2 ? 810 : 270, y = 600 + Math.floor(i / 2) * 115; g.save(); g.translate(x, y); g.scale(a, a); rr(g, -110, -36, 220, 72, 18); g.fillStyle = i === 6 ? '#e6c02a' : '#efe8d0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); text(g, s2, 0, 3, { size: 34, color: '#16181d', font: FONTS.ui, weight: 900 }); g.restore(); });
    const tp = W('apito', L.n4, 2); if (T > tp) { const a = ease.outBack(prog(T, tp, tp + 0.3)); g.save(); g.translate(540, 1500); g.scale(a, a); apito(g, 0, 0, 2.2, -0.2); g.restore(); for (let i = 0; i < 3; i++) { const ph = (T * 2 + i / 3) % 1; g.strokeStyle = alpha(WH, 0.7 * (1 - ph)); g.lineWidth = 5; g.beginPath(); g.arc(700, 1480, 40 + ph * 120, -0.8, 0.8); g.stroke(); } } return; }
  const cam = K(T, [[tR - 0.2, foco(480, GY0 - 320, 2.3)], [tO, foco(640, GY0 - 320, 2.4)], [info.shot.end, foco(560, GY0 - 320, 2.0)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.75, gen: 0 });
  layer(g, cam, 1, g => { drawFigure(g, { x: 430, y: GY + 70, s: 1.8 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe({ ...POSES.holdFront, eF: [24, -150], hF: [46, -170] }, t, 1, 2), expr: T > tO + 0.3 ? 'sob' : 'hungry', talk: talkAmount(T, ...L.r1), t, emote: T > tO + 0.3 ? 'gloom' : 'sparkle' }); guarana(g, 520, GY - 140, 0.9);
    drawFigure(g, { x: 720, y: GY + 50, s: 1.8, facing: -1, outfit: OSVALDO, pose: breathe(POSES.crossArms, t, 1, 5), expr: 'suspicious', talk: talkAmount(T, ...L.o3), t }); });
}});
// G — rota longe da avenida; sinais: 1 apito para, 2 apitos corre
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, t1 = W('um', L.n5), t2 = W('dois', L.n5);
  const z = 1.25 - 0.2 * prog(T, info.shot.start, info.shot.end); g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); mapaCidade(g, t, { rota: prog(T, info.shot.start, W('avenida', L.n5) + 0.5) }); g.restore();
  [[t1, '1 APITO = PARA', '#e6c02a'], [t2, '2 APITOS = CORRE', ui.accent]].forEach(([ti, s2, c], i) => { const a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)); if (a <= 0) return; g.save(); g.translate(540, 520 + i * 120); g.scale(a, a); rr(g, -360, -52, 720, 104, 26); g.fillStyle = 'rgba(8,9,12,.9)'; g.fill(); g.strokeStyle = c; g.lineWidth = 5; g.stroke(); apito(g, -270, 0, 0.6, -0.2); if (i) apito(g, -210, 0, 0.6, -0.2); text(g, s2, 50, 4, { size: 50, color: WH, font: FONTS.ui, weight: 900 }); g.restore(); });
}});
// H — a última noite: a conta que ninguém queria fazer; "Alguém tem que ficar." "Tio, não..." "Deixa eu terminar o serviço."
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tO = L.o4[0], tE = L.e2[0], tF = L.o5[0];
  const cam = K(T, [[info.shot.start, foco(560, GY0 - 280, 1.6)], [tO, foco(700, GY0 - 330, 2.4)], [tE, foco(480, GY0 - 330, 2.4)], [tF, foco(640, GY0 - 340, 2.8)], [info.shot.end, foco(640, GY0 - 350, 3.2)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.35, gen: 0, dark: 0.35 });
  layer(g, cam, 1, g => { relogio(g, 540, 560, 0, 0);
    drawFigure(g, { x: 430, y: GY + 70, s: 1.75, facing: 1, outfit: EDUARDO, pose: breathe(T > tE ? POSES.reach : POSES.relaxed, t, 1, 1), expr: T > tE ? 'sob' : T > tO ? 'shocked' : 'neutral', talk: talkAmount(T, ...L.e2), t, emote: T > tE ? 'gloom' : null });
    drawFigure(g, { x: 690, y: GY + 50, s: 1.8, facing: -1, outfit: OSVALDO, pose: breathe(T > tF ? { ...POSES.reach, eF: [26, -150], hF: [52, -170] } : POSES.think, t, 0.8, 5), expr: T > tF + 1.5 ? 'smile' : 'sad', talk: talkAmount(T, L.o4[0], L.o5[1]), t, face: T > tF + 1.5 ? { tears: true } : null }); });
  const tm = W('meia', L.o4); if (T > tm && T < tE) { const a = ease.outBack(prog(T, tm, tm + 0.25)); g.save(); g.translate(540, 480); g.scale(a, a); relogio(g, 0, 0, 90, 12 + 0.5 * prog(T, tm, tm + 2)); text(g, '30 MIN', 0, 140, { size: 60, color: '#ff9a30', stroke: 14, strokeColor: INK }); g.restore(); }
  glow(g, 540, 1100, 500, '#ffd98a', 0.08);
}});
registerShot('I', { draw(g, t) { titulo(g, t, 'O PLANO', 'DO TIO', 9, '#ff7a20'); } });
registerShot('Jc', { draw(g, t) { seguir(g, t, 'EP. 10 — A ÚLTIMA BRASA (FINAL)', EDUARDO); } });
