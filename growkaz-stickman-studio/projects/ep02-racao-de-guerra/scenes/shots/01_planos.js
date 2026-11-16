// Ep. 2 — RAÇÃO DE GUERRA · planos longos com câmera que acompanha (A–I)
import { E, SAFE, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, wordTime, rr, seg, poly, circle, glow, shade, alpha, text, FONTS, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { bunkerSala, tijolos, gerador, filtroAr, prateleira, mapa, lata, galao, caixote, radio, onda } from '/series/mamae/bunker.js';
import { quintal, bilu, churrasqueira, GRILL_X } from '/series/mamae/quintal.js';
import { fallout, simboloRad, geiger, alerta, cartao, regra710, olhosNoEscuro, sopro, impacto, riscosSusto, relogio } from '/series/mamae/efeitos.js';
import { foco, K } from '/series/mamae/camera.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';

export const INK = '#0b0b0d', WH = '#f1efe9';
export const blink = (t, p = 3.1) => (t % p) > p - 0.12;
export const mao = (g, pts, w = 60) => { seg(g, pts, w + 14, INK); seg(g, pts, w, WH); };
export const parede = (g, c = '#8a5440', d = 0.35) => { tijolos(g, -200, -200, E.W + 400, E.H + 400, c, 130, 60); veil(g, '#05070c', d); };
export const rotulo = (g, str, k, y = 430, color = null, size = 110) => { const a = ease.outBack(prog(k, 0, 0.25)); if (a <= 0) return; g.save(); g.translate(500, y); g.scale(a, a); g.rotate(-0.03); text(g, str, 0, 0, { size, color: color || S().ui.gold, stroke: size * 0.2, strokeColor: INK, spacing: 2 }); g.restore(); };
export const fundoBunker = (g, t, cam = { z: 1.5, x: 0, y: 200 }, o = {}) => blurLayer(g, 12, g => bunkerSala(g, t, cam, o), null, 0.6);
export const escada = (g, CX, GY, hatchY = 330) => { seg(g, [[CX - 70, hatchY + 120], [CX - 70, GY]], 12, INK); seg(g, [[CX + 70, hatchY + 120], [CX + 70, GY]], 12, INK); for (let y = hatchY + 190; y < GY; y += 90) seg(g, [[CX - 70, y], [CX + 70, y]], 10, INK); rr(g, CX - 190, hatchY, 380, 120, 10); g.fillStyle = '#3d4652'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); for (const dx of [-120, 120]) circle(g, CX + dx, hatchY + 60, 10, INK); };
export const HIPS = { ...POSES.stand, eF: [26, -136], hF: [10, -108], eB: [-24, -136], hB: [-8, -108] };
export const SALUTE = { ...POSES.stand, eF: [30, -176], hF: [16, -214] };
export const ARM = { ...POSES.sad, eF: [-4, -140], hF: [-14, -128], eB: [16, -134], hB: [4, -150] };
const CLIMB = { ...POSES.reach, eF: [10, -210], hF: [16, -250], eB: [-12, -205], hB: [-6, -245] };
const GY0 = 1305.6, CX0 = 540;
const W = (w, L, n = 0) => wordTime(w, L[0] - 0.05) ?? (L[0] + n);   // tempo global de uma palavra dentro de uma fala

// A — escuro total, olhos, respirações, a luz acende revelando a família (0 → n2)
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tLuz = W('gerador', L.n1, 4.4), on = T < tLuz ? 0 : T < tLuz + 0.5 ? (Math.sin(T * 60) > 0 ? 1 : 0.15) : 1;
  const cam = K(T, [[0, foco(540, 1000, 1.25)], [tLuz, foco(540, 980, 1.18)], [info.shot.end, foco(540, 1040, 1.0)]]);
  const [dx, dy] = impacto(T, 0.35, 28, 0.6); cam.x += dx; cam.y += dy;
  const { GY } = bunkerSala(g, t, cam, { lamp: on, dark: 1 - 0.95 * on });
  const pos = [[240, MARIANA, 1, 'sad'], [410, RAFAEL, RAFAEL_S, 'terrified'], [580, EDUARDO, 1, 'gulp'], [750, OSVALDO, 1, 'proud']];
  if (on > 0.5) layer(g, cam, 1, g => pos.forEach(([x, o, s, ex], i) => drawFigure(g, { x, y: GY + 70, s: 1.5 * s, facing: i < 2 ? 1 : -1, outfit: o, pose: breathe(i === 1 ? POSES.handsOnHead : i === 3 ? HIPS : POSES.relaxed, t, 1, i), expr: ex, look: [0, -1], t, emote: i === 3 ? 'sparkle' : i === 1 ? 'sweat' : null })));
  else layer(g, cam, 1, g => { olhosNoEscuro(g, t, pos.map(([x, o, s], i) => [x + (i < 2 ? 10 : -10), GY + 70 - 300 * 1.5 * s * 0.7, 1.1, i < 2 ? 0.5 : -0.5]));
    const tR = W('respir', L.n1, 3); pos.forEach(([x, o, s], i) => { if (T > tR + i * 0.3) sopro(g, x, GY + 70 - 260 * 1.5 * s * 0.7, T - tR - i * 0.3, 0.8); }); });
  if (T > 0.35 && T < 0.9) riscosSusto(g, 540, 900, T, 1 - (T - 0.35) / 0.55);
  FX.dust(g, t, { count: 40, color: '#e8d8c0', speed: -40, a: 0.5 * on });
}});

// B — tour contínuo: gerador → filtro → prateleira até o teto → tio orgulhoso → mapa (o plano)
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tG = info.shot.start, tF = W('filtro', L.n2), tC = W('comida', L.n2), tT = W('teto', L.n2), tO = W('tio', L.n2), tP = W('montou', L.n2);
  const cam = K(T, [[tG, foco(1010, 1360, 2.6, 0.85)], [tF - 0.2, foco(1010, 1360, 2.6, 0.85)], [tF + 0.3, foco(960, 600, 2.4, 0.6)], [tC, foco(960, 600, 2.4, 0.6)], [tC + 0.4, foco(200, 1150, 2.3, 0.85)], [tT + 0.2, foco(200, 620, 2.3, 0.85)], [tO, foco(640, 1050, 1.6)], [tP - 0.2, foco(640, 1050, 1.7)], [tP + 0.3, foco(550, 610, 2.6, 0.6)], [info.shot.end, foco(550, 610, 2.8, 0.6)]]);
  const { GY } = bunkerSala(g, t, cam);
  layer(g, cam, 1, g => { drawFigure(g, { x: 560, y: GY + 70, s: 1.6, facing: 1, outfit: EDUARDO, pose: breathe(T > tO ? POSES.handsOnHead : POSES.relaxed, t, 1, 1), expr: T > tO ? 'shocked' : 'awe', t, emote: T > tO ? 'shock' : null, look: [0.6, -0.5] });
    drawFigure(g, { x: 730, y: GY + 60, s: 1.6, facing: -1, outfit: OSVALDO, pose: breathe(HIPS, t, 1, 5), expr: 'proud', t, emote: 'sparkle', blink: blink(t, 2.7) }); });
  if (T > tP) ['ÁGUA', 'COMIDA', 'AR', 'LUZ'].forEach((s2, i) => { const a = ease.outBack(prog(T, tP + 0.15 + i * 0.12, tP + 0.35 + i * 0.12)); if (a <= 0) return; const x = 300 + (i % 2) * 440, y = 1130 + Math.floor(i / 2) * 130; g.save(); g.translate(x, y); g.scale(a, a); rr(g, -170, -52, 340, 104, 22); g.fillStyle = INK; g.fill(); rr(g, -160, -42, 320, 84, 16); g.fillStyle = '#e6dcc0'; g.fill(); seg(g, [[-130, 0], [-110, 20], [-80, -20]], 12, '#3f9a5a'); text(g, s2, 30, 4, { size: 50, color: '#16181d', font: FONTS.ui, weight: 900 }); g.restore(); });
  if (T < tF - 0.1) rotulo(g, 'GERADOR', T - tG, 440); else if (T < tC - 0.1) rotulo(g, 'FILTRO DE AR', T - tF + 0.1, 440); else if (T > tT - 0.3 && T < tO - 0.1) rotulo(g, 'COMIDA ATÉ O TETO', T - tT + 0.3, 440, null, 84); if (T > tP) rotulo(g, 'UM PLANO.', T - tP, 440, null, 100);
}, }); 

// C — CADÊ O BILU? (close)
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, [dx, dy] = impacto(t, 0, 16, 0.4), cam = { z: 1.0 + 0.08 * ease.out(t / info.dur), x: dx, y: dy };
  fundoBunker(g, t, { z: 1.5, x: -100, y: 200 }); veil(g, '#000', 0.35);
  layer(g, cam, 1, g => bigFace(g, 500, 880, 300, { outfit: RAFAEL, expr: 'panic', talk: talkAmount(T, ...info.L.r1), look: [0.4, -0.5], rimSide: 1, t, emote: 'exclaim', tilt: 0.05 * Math.sin(t * 10) }));
}});
// D — o Bilu lá fora, choramingando na porta do depósito de carvão (dissolve)
registerShot('D', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.35 + 0.25 * k, x: 220 + 30 * k, y: 230 };
  const { GY } = quintal(g, t, cam, { white: 0.35, fire: 0.2 });
  layer(g, cam, 1, g => bilu(g, { x: 640, y: GY + 20, s: 1.5, facing: 1, t: t * 0.6 }));
  veil(g, '#8a8f98', 0.18); fallout(g, t, { count: 50, a: 0.4 });
}});
// E — Rafael sobe a escada; a câmera acompanha; o tio puxa e fecha a cara: "Ninguém abre essa porta."
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tO = L.o1[0], up = ease.out(prog(T, info.shot.start, info.shot.start + 0.7)), pull = ease.inOut(prog(T, tO - 0.8, tO - 0.1));
  const ry = lerp(GY0, GY0 - 400, up) + pull * 400;
  const cam = K(T, [[info.shot.start, foco(540, ry - 150, 1.5)], [tO - 0.8, foco(540, GY0 - 550, 1.6)], [tO, foco(690, GY0 - 230, 2.4)], [info.shot.end, foco(690, GY0 - 250, 2.7)]]);
  const { GY, CX } = bunkerSala(g, t, cam);
  layer(g, cam, 1, g => { escada(g, CX, GY);
    drawFigure(g, { x: CX - 20 * pull, y: ry, s: 1.5 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: pull > 0.5 ? POSES.sad : CLIMB, expr: pull > 0.5 ? 'sob' : 'panic', talk: talkAmount(T, ...L.r2), t, emote: pull > 0.5 ? null : 'sweat', shadow: pull > 0.9 });
    drawFigure(g, { x: 700, y: GY + 40, s: 1.6, facing: -1, outfit: OSVALDO, pose: posesAt(T, [[tO - 1.2, 'ready'], [tO - 0.6, 'reach'], [tO, POSES.crossArms]], 0.25), expr: T > tO - 0.2 ? 'furious' : 'determined', talk: talkAmount(T, ...L.o1) }); });
}});
// F — lá fora: a nuvem, a poeira cinza caindo, a câmera desce até a cinza da churrasqueira, contador Geiger dispara
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tP = W('poeira', L.n3) - 0.6, tC = W('parece', L.n3), tR = W('radioativa', L.n3);
  const white = 0.55 * (1 - prog(T, tP, tP + 1.2)) + 0.12;
  const cam = K(T, [[info.shot.start, foco(540, 700, 1.0)], [tP, foco(540, 760, 1.05)], [tC - 0.3, foco(700, 1000, 1.5)], [tC + 0.4, foco(800, 1100, 2.4, 0.9)], [info.shot.end, foco(800, 1110, 2.8, 0.9)]]);
  const { GY } = quintal(g, t, cam, { white, fire: 0.15, smoke: false });
  layer(g, cam, 0.2, g => { const a = 1 - prog(T, tP, tP + 1.5); if (a > 0) for (let i = 0; i < 4; i++) { const r2 = 220 + i * 90 + 30 * Math.sin(t + i); g.fillStyle = alpha(i % 2 ? '#c9c4bc' : '#a8a39c', 0.75 * a); g.beginPath(); g.arc(380 + i * 70, 220 - i * 30, r2, 0, 7); g.fill(); } });
  veil(g, '#6a6f78', 0.28 * prog(T, tP, tP + 1)); if (T > tP) fallout(g, t, { count: 230, a: 0.85 * prog(T, tP, tP + 0.8) });
  if (T < tC) relogio(g, 830, 520, 80, 12 + 10 / 60 * clamp((T - info.shot.start) / (tP - info.shot.start)));
  if (T > tR - 0.1) { const k = T - tR + 0.1, a = ease.outBack(prog(k, 0, 0.3)); g.save(); g.translate(500, 860); g.scale(a, a); geiger(g, 80, 0, 2.2, t, 0.95); g.restore(); simboloRad(g, 500, 470, 100 * a, t); alerta(g, t, 1); rotulo(g, 'RADIOATIVA', k, 640, S().ui.accent, 96); }
}});
// G — a regra 7-10 no quadro do tio, depois o calendário de duas semanas
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, o2 = L.o2[0], tS = W('sete', L.o2), tD = wordTime('dez', o2 + 1) ?? 1e9, tU = wordTime('um', o2 + 2) ?? 1e9, tW = wordTime('duas', o2) ?? 1e9;
  const cam = K(T, [[info.shot.start, { z: 1.08, x: 0, y: 20 }], [tW - 0.4, { z: 1.0, x: 0, y: -10 }], [tW + 0.2, { z: 1.06, x: 0, y: 30 }], [info.shot.end, { z: 1.12, x: 0, y: 40 }]]);
  parede(g, '#8a5440', 0.45);
  const mostra = [prog(T, tS - 0.6, tS), prog(T, tD - 0.15, tD + 0.25), prog(T, tU - 0.15, tU + 0.25), prog(T, tW - 0.1, tW + 0.3)];
  const slide = ease.inOut(prog(T, tW - 0.2, tW + 0.4));
  layer(g, cam, 1, g => { g.save(); g.translate(-1200 * slide, 0); regra710(g, t, 540, 780, { mostra }); g.restore();
    if (slide > 0) { const n = Math.min(14, Math.floor(prog(T, tW + 0.3, info.shot.end - 0.3) * 13) + 1); g.save(); g.translate(540 + 1000 * (1 - slide), 780); g.rotate(-0.03); rr(g, -270, -330, 540, 640, 24); g.fillStyle = INK; g.fill(); rr(g, -258, -318, 516, 616, 18); g.fillStyle = WH; g.fill(); rr(g, -258, -318, 516, 130, 18); g.fillStyle = S().ui.accent; g.fill(); text(g, 'DIA', 0, -252, { size: 64, color: '#fff', font: FONTS.ui, weight: 900, spacing: 6 }); text(g, String(n), 0, 60, { size: 300, color: '#16181d' }); g.restore(); }
    drawFigure(g, { x: 830, y: 1520, s: 1.35, facing: -1, outfit: OSVALDO, pose: breathe(posesAt(T % 2, [[0, 'explain'], [1, 'point'], [2, 'explain']], 0.3), t, 1, 5), expr: 'determined', talk: talkAmount(T, ...L.o2) }); });
}});
// H — DUAS SEMANAS?! (close com susto)
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, [dx, dy] = impacto(t, 0.05, 26, 0.5), cam = { z: 1.06 + 0.14 * ease.out(prog(t, 0, 0.3)), x: dx, y: dy };
  fundoBunker(g, t, { z: 1.5, x: -100, y: 200 }); veil(g, '#000', 0.3); riscosSusto(g, 500, 880, t, 1);
  layer(g, cam, 1, g => bigFace(g, 500, 880, 320, { outfit: RAFAEL, expr: 'panic', talk: talkAmount(T, ...info.L.r3), look: [0, -0.3], rimSide: 1, t, emote: 'shock' }));
}});
// I — Rafael chora na escada… a câmera acompanha ele andando até a comida, abre a lata, nojo; panorâmica até o tio
registerShot('I', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tA = W('até', L.n4), tL = L.r4[0], tO = L.o3[0];
  const walk = prog(T, tA - 0.3, tA + 1.3), rx = lerp(410, 300, ease.inOut(walk));
  const cam = K(T, [[info.shot.start, foco(430, GY0 - 230, 2.0)], [tA - 0.3, foco(430, GY0 - 240, 2.1)], [tA + 1.3, foco(260, GY0 - 300, 1.9)], [tL - 0.2, foco(380, GY0 - 250, 1.9)], [tO - 0.2, foco(470, GY0 - 250, 1.7)], [tO + 0.4, foco(690, GY0 - 280, 2.5)], [info.shot.end, foco(690, GY0 - 290, 2.7)]]);
  const { GY, CX } = bunkerSala(g, t, cam);
  layer(g, cam, 1, g => { escada(g, CX, GY);
    const crying = T < tA, eating = T > tL - 0.3;
    drawFigure(g, { x: rx, y: GY + 60, s: 1.7 * RAFAEL_S, facing: walk > 0 && walk < 1 ? -1 : eating ? 1 : 1, outfit: RAFAEL, pose: crying ? breathe(POSES.kneel, t, 2.5, 2) : walk < 1 ? walkPose(T * Math.PI * 2 * 0.9) : breathe(posesAt(T, [[tL - 0.5, 'cheer'], [tL - 0.1, 'holdFront'], [tL + 1.2, 'shrug']], 0.25), t, 1, 2), expr: crying ? 'sob' : !eating ? 'hungry' : 'disgust', talk: talkAmount(T, ...L.r4), t, emote: crying ? 'gloom' : !eating ? 'sparkle' : T > tL + 1.2 ? 'question' : null });
    if (eating) { lata(g, rx + 85, GY - 170 + Math.sin(t * 3) * 3, '#55623a', 1.3); for (let i = 0; i < 3; i++) { const ph = (t * 1.3 + i / 3) % 1; seg(g, [[rx + 70 + i * 14 + Math.sin(ph * 9) * 8, GY - 250 - ph * 120], [rx + 76 + i * 14 + Math.sin(ph * 9 + 1) * 8, GY - 270 - ph * 120]], 8, alpha('#9ab83a', 0.7 * (1 - ph))); } }
    drawFigure(g, { x: 690, y: GY + 50, s: 1.9, facing: -1, outfit: OSVALDO, pose: breathe(POSES.crossArms, t, 1, 5), expr: 'suspicious', talk: talkAmount(T, ...L.o3), blink: blink(t, 2.7) }); });
  const sw = ease.outBack(prog(T, wordTime('cinco', L.n4[0]) ?? 1e9, (wordTime('cinco', L.n4[0]) ?? 1e9) + 0.3)) * (1 - prog(T, tA + 0.3, tA + 0.6)); if (sw > 0) { g.save(); g.translate(780, 560); g.scale(sw, sw); relogio(g, 0, 0, 100, 13 + (T - tA) * 0.6); g.restore(); }
}});
