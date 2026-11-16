// Ep. 8 — ELE SENTE O CALOR · planos longos no escuro
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, talkAmount, rr, seg, poly, circle, glow, alpha, text, FONTS, S, noise, radGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { bunkerSala, tijolos, caixote, radio, gerador } from '/series/mamae/bunker.js';
import { bilu } from '/series/mamae/quintal.js';
import { alerta, impacto, relogio, olhosNoEscuro, sopro } from '/series/mamae/efeitos.js';
import { sombraCriatura } from '/series/mamae/props.js';
import { foco, K } from '/series/mamae/camera.js';
import { INK, WH, GY0, blink, W, mist, rotulo, escada, poeiraAlcapao, ARM, titulo, seguir } from '/series/mamae/comum.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';
const BOCA = { ...POSES.stand, eF: [22, -170], hF: [12, -196], eB: [-14, -170], hB: [6, -194] };
const BARRA = { ...POSES.reach, eF: [26, -200], hF: [40, -240], eB: [14, -190], hB: [30, -230] };
const azul = (g, a) => { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = alpha('#3a5a9a', 0.55 * a); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); };
// visão térmica: fundo azul escuro + manchas de calor (x, y, raio, temperatura 0..1)
function termica(g, t, fontes, frio = 0) {
  g.fillStyle = '#060a24'; g.fillRect(-200, -200, E.W + 400, E.H + 400); for (let i = 0; i < 14; i++) { g.strokeStyle = alpha('#2a3a7a', 0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(-100, 200 + i * 130 + Math.sin(t + i) * 10); g.lineTo(1200, 200 + i * 130 + Math.cos(t + i) * 10); g.stroke(); }
  g.save(); g.globalCompositeOperation = 'lighter'; for (const [x, y, r, temp] of fontes) { const tt = clamp(temp * (1 - frio)); if (tt <= 0.02) continue; const c1 = tt > 0.7 ? '#fff0a0' : tt > 0.4 ? '#ff9a30' : '#d8342b'; g.fillStyle = radGrad(g, x, y, 0, r, [alpha(c1, 0.95 * tt), alpha('#d8342b', 0.6 * tt), alpha('#3a0a5a', 0)]); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.restore();
  g.strokeStyle = alpha('#7fa0ff', 0.4); g.lineWidth = 3; for (const [x, y] of [[80, 300], [1000, 300], [80, 1600], [1000, 1600]]) { seg(g, [[x, y], [x + (x < 500 ? 80 : -80), y]], 4, alpha('#7fa0ff', 0.6)); seg(g, [[x, y], [x, y + (y < 900 ? 80 : -80)]], 4, alpha('#7fa0ff', 0.6)); }
  text(g, 'CALOR', 540, 330, { size: 40, color: alpha('#ffb070', 0.9), font: FONTS.ui, weight: 900, spacing: 10 });
}
const familia = (g, GY, t, T, o = {}) => { const { olhar = [0, -1], expr = 'terrified' } = o;
  drawFigure(g, { x: 230, y: GY + 70, s: 1.5, facing: 1, outfit: MARIANA, pose: breathe(ARM, t, 1.4, 4), expr, look: olhar, t });
  drawFigure(g, { x: 380, y: GY + 90, s: 1.5 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(BOCA, t, 1.6, 2), expr: 'panic', look: olhar, t, emote: 'sweat' });
  bilu(g, { x: 470, y: GY + 100, s: 0.8, facing: 1, t: t * 0.3 });
  drawFigure(g, { x: 620, y: GY + 70, s: 1.55, facing: -1, outfit: EDUARDO, pose: breathe(POSES.ready, t, 1.4, 1), expr, look: olhar, t });
  drawFigure(g, { x: 790, y: GY + 50, s: 1.6, facing: -1, outfit: OSVALDO, pose: breathe(POSES.ready, t, 1, 5), expr: 'determined', look: olhar, t }); };

// A — os passos param; ninguém se mexe; nem o Rafael
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tR = L.n2[0];
  const cam = K(T, [[0, foco(540, 520, 1.6)], [L.o1[0], foco(700, GY0 - 300, 1.6)], [tR, foco(390, GY0 - 280, 2.6)], [info.shot.end, foco(390, GY0 - 280, 2.9)]]);
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.45, gen: 1, dark: 0.3 });
  layer(g, cam, 1, g => { escada(g, CX, GY); familia(g, GY, t, T); drawFigure(g, { x: 790, y: GY + 50, s: 1.6, facing: -1, outfit: OSVALDO, pose: breathe(POSES.ready, t, 1, 5), expr: 'determined', look: [0, -1], talk: talkAmount(T, ...L.o1), t }); });
  azul(g, 0.4); veil(g, '#300000', 0.05 + 0.05 * Math.sin(T * 4));
}});
// B — alguma coisa testa o alçapão: a trava balança, poeira, garras na fresta
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start;
  const cam = K(T, [[t0, foco(540, 480, 2.0)], [info.shot.end, foco(540, 420, 2.9)]]);
  const teste = Math.sin((T - t0) * 2.2) > 0.4 ? 1 : 0; const [dx, dy] = teste ? [noise(T * 30, 2) * 6, noise(T * 30, 5) * 6] : [0, 0]; cam.x += dx; cam.y += dy;
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.4, gen: 1, dark: 0.35 });
  layer(g, cam, 1, g => { escada(g, CX, GY); poeiraAlcapao(g, CX, T, 0.3 + 0.7 * teste);
    const ang = teste ? Math.sin(T * 25) * 0.3 : 0; g.save(); g.translate(CX + 120, 390); g.rotate(ang); seg(g, [[0, 0], [60, 0]], 14, '#9aa3ae'); g.restore();
    for (let i = 0; i < 3; i++) { const k = prog(T, t0 + 1.5 + i * 0.4, t0 + 2.5 + i * 0.4); if (k > 0) { seg(g, [[CX - 100 + i * 50, 330], [CX - 110 + i * 50 + 6 * Math.sin(T * 4 + i), 330 + 30 * k]], 14, INK); } } });
  azul(g, 0.4); if (teste) alerta(g, T, 0.4);
}});
// C — "Ele sente o calor": close da mãe → visão térmica de cima (gerador, churrasqueira, a família)
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tC = W('calor', L.m1), k = ease.inOut(prog(T, tC - 0.1, tC + 0.4));
  const close = (g) => { bunkerSala(g, t, { z: 1.5, x: -150, y: 200 }, { lamp: 0.35, gen: 1, dark: 0.4 }); veil(g, '#000', 0.4); azul(g, 0.4); layer(g, { z: 1 + 0.05 * (T - t0) }, 1, g => bigFace(g, 540, 880, 300, { outfit: MARIANA, expr: 'terrified', talk: talkAmount(T, ...L.m1) * 0.6, look: [0, -0.8], t, rimSide: 1 })); };
  const term = (g) => { const z = 1 + 0.06 * (T - tC); g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); const tG = W('gerador', L.m1), tCh = W('churrasqueira', L.m1), tGe = W('gente', L.m1);
    termica(g, t, [[880, 1400, 260 * prog(T, tG - 0.2, tG + 0.2), 1], [540, 520, 230 * prog(T, tCh - 0.2, tCh + 0.2), 0.8], ...[[250, 1180], [390, 1220], [620, 1170], [780, 1160], [470, 1280]].map(([x, y], i) => [x, y, 120 * prog(T, tGe - 0.2 + i * 0.05, tGe + 0.2 + i * 0.05), i === 4 ? 0.5 : 0.65])]); 
    sombraCriatura(g, 540, 330, 1.0, T, { a: 0.6, cor: '#000010' }); g.restore(); };
  mist(g, k, close, term);
}});
// D — esfria tudo: gerador desligado, lampião apagado, rádio sem pilha; 10 segundos
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tG = W('gerador', L.n4), tL = W('lampião', L.n4), tR = W('rádio', L.n4), tD = W('dez', L.n4);
  const gen = T < tG + 0.4 ? 1 : 0, lamp = T < tL + 0.4 ? 0.5 : 0;
  const cam = K(T, [[info.shot.start, foco(760, GY0 - 280, 1.6)], [tG, foco(980, GY0 + 40, 2.2, 0.85)], [tL, foco(520, 500, 2.0, 0.9)], [tR, foco(820, 1050, 3.0, 0.85)], [tD, foco(540, GY0 - 300, 1.2)], [info.shot.end, foco(540, GY0 - 300, 1.3)]]);
  const { GY, CX } = bunkerSala(g, t, cam, { lamp, gen, dark: 0.35 + 0.4 * prog(T, tR, tD) });
  layer(g, cam, 1, g => { escada(g, CX, GY); drawFigure(g, { x: lerp(820, 900, prog(T, info.shot.start, tG)), y: GY + 50, s: 1.6, facing: 1, outfit: OSVALDO, pose: breathe(posesAt(T, [[tG - 0.4, POSES.reach], [tL, { ...POSES.pointUp }], [tR, POSES.reach]], 0.2), t, 1, 5), expr: 'determined', talk: talkAmount(T, ...L.o2), t, emote: 'sweat' }); });
  [[tG, 'GERADOR'], [tL, 'LAMPIÃO'], [tR, 'RÁDIO']].forEach(([ti, s2], i) => { const a = ease.outBack(prog(T, ti, ti + 0.25)); if (a <= 0) return; g.save(); g.translate(540, 470 + i * 110); g.scale(a, a); rr(g, -260, -45, 520, 90, 22); g.fillStyle = 'rgba(8,9,12,.85)'; g.fill(); text(g, s2 + ' · OFF', 0, 4, { size: 50, color: WH, font: FONTS.ui, weight: 900 }); circle(g, -220, 0, 14, S().ui.accent); g.restore(); });
  if (T > tD) { const rest = Math.max(0, 10 - (T - tD) * 4); rotulo(g, `00:${String(Math.ceil(rest)).padStart(2, '0')}`, T - tD, 1180, WH, 120); }
  azul(g, 0.3 + 0.4 * prog(T, tR, tD));
}});
// E — todos juntos no escuro, debaixo das cobertas; disciplina de abrigo; "Tio... eu tô com fome." "Agora não, Rafael."
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, ui = S().ui, tR = L.r1[0], tO = L.o4[0];
  const cam = K(T, [[info.shot.start, foco(540, GY0 - 150, 1.4)], [W('juntos', L.n5), foco(540, GY0 - 120, 1.9)], [tR, foco(440, GY0 - 150, 2.6)], [tO, foco(600, GY0 - 150, 2.6)], [info.shot.end, foco(540, GY0 - 150, 2.2)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0, gen: 0, dark: 0.82 });
  layer(g, cam, 1, g => { rr(g, 250, GY - 150, 580, 220, 80); g.fillStyle = INK; g.fill(); rr(g, 260, GY - 140, 560, 200, 72); g.fillStyle = '#2a3a5a'; g.fill(); g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 4; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(260 + i * 112, GY - 140); g.lineTo(260 + i * 112, GY + 60); g.stroke(); }
    olhosNoEscuro(g, t, [[330, GY - 180, 1.0, 0.3], [440, GY - 165, 0.9, T > tR ? -0.6 : 0], [560, GY - 185, 1.0, 0], [690, GY - 190, 1.0, T > tO ? -0.8 : -0.2]]); for (let i = 0; i < 4; i++) sopro(g, 340 + i * 120, GY - 130, t + i * 0.4, 0.6); });
  [['SEM LUZ', 'luz'], ['SEM BARULHO', 'barulho'], ['SEM CHEIRO DE COMIDA', 'cheiro']].forEach(([s2, w], i) => { const ti = W(w, L.n5), a = ease.outBack(prog(T, ti - 0.1, ti + 0.2)) * (1 - prog(T, W('pra', L.n5) - 0.2, W('pra', L.n5))); if (a <= 0) return; g.save(); g.translate(540, 470 + i * 100); g.scale(a, a); text(g, s2, 0, 0, { size: 60, color: ui.cream, stroke: 14, strokeColor: INK }); g.restore(); });
  const tj = W('corpo', L.n5); if (T > tj && T < tR) rotulo(g, 'CALOR DO CORPO', T - tj, 520, '#ff9a30', 90);
  azul(g, 0.6);
}});
// F — as garras arranham a chapa: uma, duas, três; "Tio, se isso abrir..." / "Então a gente faz o que eu treinei a vida toda pra fazer."
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tE = L.e1[0], tO = L.o3[0], marcas = [W('uma', L.n6), W('duas', L.n6), W('três', L.n6)];
  const cam = K(T, [[info.shot.start, foco(540, 470, 2.4)], [tE - 0.3, foco(540, 470, 2.6)], [tE, foco(620, GY0 - 300, 2.8)], [tO, foco(790, GY0 - 320, 2.8)], [info.shot.end, foco(790, GY0 - 330, 3.1)]]);
  const n = marcas.filter(x => T > x).length; const k0 = marcas.findLast ? marcas.findLast(x => T > x) : marcas.filter(x => T > x).pop(); const [dx, dy] = k0 ? impacto(T, k0, 16, 0.5) : [0, 0]; cam.x += dx; cam.y += dy;
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0, gen: 0, dark: 0.75 });
  layer(g, cam, 1, g => { escada(g, CX, GY); poeiraAlcapao(g, CX, T, n ? 0.8 : 0.2);
    drawFigure(g, { x: 620, y: GY + 70, s: 1.55, facing: 1, outfit: EDUARDO, pose: breathe(POSES.ready, t, 1.4, 1), expr: 'terrified', talk: talkAmount(T, ...L.e1) * 0.5, look: [0.5, -0.6], t, emote: 'sweat' });
    drawFigure(g, { x: 790, y: GY + 50, s: 1.6, facing: -1, outfit: OSVALDO, pose: breathe(T > tO ? BARRA : POSES.ready, t, 1, 5), expr: 'determined', talk: talkAmount(T, ...L.o3) * 0.5, t }); if (T > tO) seg(g, [[790 - 60, GY - 320], [790 - 20, GY - 30]], 14, '#5a6068'); });
  for (let i = 0; i < n; i++) { const a = ease.outBack(prog(T, marcas[i], marcas[i] + 0.25)); g.save(); g.translate(300 + i * 240, 480); g.scale(a, a); text(g, String(i + 1), 0, 0, { size: 140, color: S().ui.accent, stroke: 24, strokeColor: INK }); g.restore(); }
  azul(g, 0.45); if (n) alerta(g, T, 0.5);
}});
// G — a família se move junta: câmera percorre o tio na escada com a barra, o Eduardo segurando o irmão, a mãe com a mão no rádio
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tT = W('tio', L.n7), tE = W('eduardo', L.n7), tM = W('mãe', L.n7);
  const cam = K(T, [[info.shot.start, foco(540, GY0 - 300, 1.3)], [tT, foco(560, 760, 2.1)], [tE, foco(380, GY0 - 280, 2.2)], [tM, foco(820, GY0 - 300, 2.2)], [info.shot.end, foco(540, GY0 - 300, 1.3)]]);
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0, gen: 0, dark: 0.7, radioOn: 0 });
  layer(g, cam, 1, g => { escada(g, CX, GY);
    drawFigure(g, { x: CX + 10, y: GY - 300, s: 1.5, facing: 1, outfit: OSVALDO, pose: BARRA, expr: 'determined', look: [0, -1], t, shadow: false }); seg(g, [[CX - 40, GY - 640], [CX + 20, GY - 330]], 14, '#5a6068');
    drawFigure(g, { x: 340, y: GY + 90, s: 1.45 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(BOCA, t, 1.5, 2), expr: 'panic', look: [0.3, -1], t });
    drawFigure(g, { x: 430, y: GY + 70, s: 1.6, facing: -1, outfit: EDUARDO, pose: breathe({ ...POSES.reach, eF: [26, -150], hF: [50, -160], eB: [16, -146], hB: [42, -150] }, t, 1.2, 1), expr: 'determined', look: [-0.3, -1], t });
    drawFigure(g, { x: 760, y: GY + 60, s: 1.6, facing: 1, outfit: MARIANA, pose: breathe({ ...POSES.reach, eF: [26, -150], hF: [52, -150] }, t, 1.2, 4), expr: 'terrified', look: [0, -1], t }); });
  azul(g, 0.45);
}});
// H — silêncio; uma hora, duas; os passos vão embora; o rosto do Eduardo: "foi só o primeiro aviso"
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tH = L.n9[0], tF = L.n10[0], k = ease.inOut(prog(T, tF - 0.2, tF + 0.4));
  const sala = (g) => { const cam = K(T, [[info.shot.start, foco(540, 520, 2.4)], [tH, foco(540, GY0 - 300, 1.2)], [tF, foco(540, GY0 - 300, 1.15)]]); const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0, gen: 0, dark: 0.75 }); layer(g, cam, 1, g => { escada(g, CX, GY); olhosNoEscuro(g, t, [[250, GY - 170, 1.1, 0], [400, GY - 150, 1.0, 0], [620, GY - 175, 1.1, 0], [790, GY - 190, 1.1, 0]]); }); azul(g, 0.5);
    if (T > tH) { const h = 1 + 2 * prog(T, tH, tF - 0.3); g.save(); g.translate(540, 560); relogio(g, 0, 0, 110, 2 + h); g.restore(); text(g, `${Math.min(2, Math.max(1, Math.floor(h)))} H`, 540, 740, { size: 80, color: WH, stroke: 16, strokeColor: INK }); }
    if (T > W('passos', L.n9)) { for (let i = 0; i < 4; i++) { const ph = (T * 0.6 + i / 4) % 1; text(g, '•', 300 + ph * 600, 420 - i * 8, { size: 40, color: alpha(WH, 0.6 * (1 - ph)) }); } } };
  const rosto = (g) => { bunkerSala(g, t, { z: 1.5, x: 0, y: 200 }, { lamp: 0, gen: 0, dark: 0.6 }); veil(g, '#000', 0.4); azul(g, 0.45); layer(g, { z: 1 + 0.08 * (T - tF) / 4 }, 1, g => bigFace(g, 540, 900, 300, { outfit: EDUARDO, expr: 'blank', look: [0, -0.9], blink: false, t, rimSide: 1 })); };
  mist(g, k, sala, rosto);
  const tA = W('aviso', L.n10); if (T > tA) rotulo(g, 'O PRIMEIRO AVISO', T - tA, 450, S().ui.accent, 90);
}});
registerShot('I', { draw(g, t) { titulo(g, t, 'ELE SENTE', 'O CALOR', 8, '#ff9a30'); } });
registerShot('Jc', { draw(g, t) { seguir(g, t, 'EP. 9 — O PLANO DO TIO', EDUARDO); } });
