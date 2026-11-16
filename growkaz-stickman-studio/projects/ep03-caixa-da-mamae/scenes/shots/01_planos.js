// Ep. 3 — A CAIXA DA MAMÃE · planos longos com câmera que acompanha
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, talkAmount, wordTime, rr, seg, poly, circle, glow, alpha, text, FONTS, S, noise } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bunkerSala, tijolos, caixote, POS } from '/series/mamae/bunker.js';
import { quintal, churrasqueira } from '/series/mamae/quintal.js';
import { fallout, alerta, regra710, olhosNoEscuro, impacto, riscosSusto, relogio } from '/series/mamae/efeitos.js';
import { periscopio, visorPeriscopio, cracha, tablet, mochila, foto, sombraCriatura, mesaDomingo, dormindo } from '/series/mamae/props.js';
import { foco, K } from '/series/mamae/camera.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S, JOAQUIM } from '../cast.js';

const INK = '#0b0b0d', WH = '#f1efe9', GY0 = 1305.6, PX = 760;
const blink = (t, p = 3.1) => (t % p) > p - 0.12;
const W = (w, L, n = 1) => { let tt = L[0] - 0.05; for (let i = 0; i < n; i++) { const r = wordTime(w, tt); if (r == null) return L[0]; if (i === n - 1) return r; tt = r + 0.05; } };
const mist = (g, k, A, B) => { if (k < 1) A(g); if (k > 0) { g.save(); g.globalAlpha *= k; B(g); g.restore(); } };   // dissolve dentro do plano
const rotulo = (g, str, k, y = 430, color = null, size = 100) => { const a = ease.outBack(prog(k, 0, 0.25)); if (a <= 0) return; g.save(); g.translate(500, y); g.scale(a, a); g.rotate(-0.03); text(g, str, 0, 0, { size, color: color || S().ui.gold, stroke: size * 0.2, strokeColor: INK, spacing: 2 }); g.restore(); };
const escada = (g, CX, GY, hy = 330) => { seg(g, [[CX - 70, hy + 120], [CX - 70, GY]], 12, INK); seg(g, [[CX + 70, hy + 120], [CX + 70, GY]], 12, INK); for (let y = hy + 190; y < GY; y += 90) seg(g, [[CX - 70, y], [CX + 70, y]], 10, INK); rr(g, CX - 190, hy, 380, 120, 10); g.fillStyle = '#3d4652'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); };
const poeiraAlcapao = (g, CX, T) => { for (let i = 0; i < 3; i++) { const ph = ((T * 1.7 + i / 3) % 1); for (let j = 0; j < 5; j++) circle(g, CX - 150 + i * 140 + j * 9, 460 + ph * 500 + j * 14, 4, alpha('#b9bcc2', 0.8 * (1 - ph))); } for (let i = 0; i < 4; i++) { const ph = (T * 0.9 + i * 0.27) % 1; seg(g, [[CX - 120 + ph * 240, 340 + i * 22], [CX - 80 + ph * 240, 350 + i * 22]], 5, alpha(WH, 0.6 * Math.sin(ph * 3.14))); } };
const fundo = (g, t, cam, o) => blurLayer(g, 12, g => bunkerSala(g, t, cam, o), null, 0.6);
const quintalCinza = (g, t, cam, o = {}) => { quintal(g, t, cam, { white: 0.1, fire: 0, smoke: false, ...o }); veil(g, '#6a6f78', 0.45); fallout(g, t, { count: 140, a: 0.7, speed: 50 }); };
const GRAB = { ...POSES.reach, eF: [30, -150], hF: [60, -150] };

// A — madrugada: todos dormindo; câmera sobe até o alçapão que arranha
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tP = W('para', L.n1), sc = (T > 1.0 && T < tP) || T > tP + 0.9;
  const cam = K(T, [[0, foco(540, GY0 - 150, 1.2)], [L.n1[0] + 2.2, foco(540, 600, 1.6)], [info.shot.end, foco(540, 430, 2.1)]]);
  const [dx, dy] = sc ? impacto(T % 1.5, 0.0, 8, 1.5) : [0, 0]; cam.x += dx; cam.y += dy;
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.22, dark: 0.55 });
  layer(g, cam, 1, g => { escada(g, CX, GY);
    [[250, MARIANA, 'sleepy', '#7a5a8a'], [470, RAFAEL, 'sleepy', '#2f6fd0'], [690, EDUARDO, sc ? 'terrified' : 'sleepy', '#8a3a30'], [900, OSVALDO, 'sleepy', '#4f7f5a']].forEach(([x, o, e, c]) => dormindo(g, x, GY + 60, 1.05, o, { expr: e, t, cor: c, look: [0, -1] }));
    if (sc) poeiraAlcapao(g, CX, T); });
  if (sc) veil(g, '#300000', 0.08 + 0.06 * Math.sin(T * 5));
}});
// B — "É o Bilu!": Rafael levanta, corre pra escada; o tio puxa ele e sussurra
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tO = L.o1[0];
  const run = prog(T, t0 + 0.6, t0 + 1.5), climb = ease.out(prog(T, L.r2[0], L.r2[0] + 0.7)), pull = ease.inOut(prog(T, tO - 0.5, tO + 0.2));
  const rx = lerp(400, 520, run), ry = GY0 + 60 - 330 * climb * (1 - pull);
  const cam = K(T, [[t0, foco(420, GY0 - 200, 1.9)], [L.r2[0], foco(520, GY0 - 330, 1.7)], [tO - 0.2, foco(560, GY0 - 280, 1.6)], [tO + 0.4, foco(700, GY0 - 300, 2.7)], [info.shot.end, foco(700, GY0 - 300, 2.9)]]);
  const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.35, dark: 0.45 });
  layer(g, cam, 1, g => { escada(g, CX, GY);
    dormindo(g, 250, GY + 60, 1.05, MARIANA, { expr: 'blank', t, cor: '#7a5a8a' });
    const up = T < t0 + 0.6; drawFigure(g, { x: rx + 10 * pull, y: ry, s: 1.5 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: up ? POSES.cheer : climb > 0 && pull < 0.5 ? { ...POSES.reach, eF: [10, -210], hF: [16, -250] } : run < 1 ? walkPose(T * Math.PI * 2 * 1.6, { run: true }) : pull > 0.5 ? POSES.sad : POSES.cheer, expr: pull > 0.5 ? 'sob' : 'joy', talk: talkAmount(T, L.r1[0], L.r2[1]), t, emote: pull > 0.5 ? 'gloom' : 'exclaim', shadow: climb < 0.2 || pull > 0.8 });
    drawFigure(g, { x: lerp(820, 650, ease.inOut(prog(T, tO - 1.0, tO - 0.3))), y: GY + 50, s: 1.65, facing: -1, outfit: OSVALDO, pose: posesAt(T, [[tO - 1, 'ready'], [tO - 0.4, GRAB], [tO + 0.4, POSES.crossArms]], 0.25), expr: T > tO ? 'furious' : 'determined', talk: talkAmount(T, ...L.o1), t });
    drawFigure(g, { x: 840, y: GY + 60, s: 1.3, facing: -1, outfit: EDUARDO, pose: posesAt(T, [[t0, 'kneel'], [t0 + 1.5, 'relaxed']], 0.4), expr: 'sleepy', t }); });
}});
// C — regra das 48 horas: o alçapão trancado + gráfico
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tD = W('dois', L.n2), tU = W('um', L.n2), tS = W('suicídio', L.n2);
  tijolos(g, -200, -200, E.W + 400, E.H + 400, '#8a5440', 130, 60); veil(g, '#05070c', 0.45);
  const cam = K(T, [[info.shot.start, { z: 1.0, x: 0, y: 0 }], [tS - 0.2, { z: 1.08, x: 0, y: 20 }], [info.shot.end, { z: 1.22, x: 0, y: -60 }]]);
  layer(g, cam, 1, g => { regra710(g, t, 540, 820, { mostra: [prog(T, info.shot.start, info.shot.start + 0.3), prog(T, info.shot.start + 0.2, info.shot.start + 0.5), prog(T, tD - 0.1, tD + 0.3), 0] });
    const h = ease.outBack(prog(T, tU + 0.3, tU + 0.6)); if (h > 0) { g.save(); g.translate(690, 600); g.scale(h, h); ring(g, 0, 0, 92, 16, '#3f9a5a'); seg(g, [[-40, 0], [-10, 30], [45, -35]], 18, '#3f9a5a'); g.restore(); } });
  const t48 = W('quarenta', L.n2), a48 = ease.outBack(prog(T, t48, t48 + 0.25)) * (1 - prog(T, tD - 0.3, tD)); if (a48 > 0) { g.save(); g.translate(540, 470); g.scale(a48, a48); g.rotate(-0.04); text(g, '48 HORAS', 0, 0, { size: 120, color: S().ui.accent, stroke: 22, strokeColor: INK }); g.restore(); }
  const a = ease.outBack(prog(T, tS - 0.1, tS + 0.2)); if (a > 0) { g.save(); g.translate(540, 1270); g.scale(a, a); g.rotate(-0.04); rr(g, -330, -70, 660, 140, 30); g.fillStyle = INK; g.fill(); rr(g, -320, -60, 640, 120, 24); g.fillStyle = S().ui.accent; g.fill(); text(g, 'PORTA FECHADA', 0, 4, { size: 62, color: '#fff', font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); alerta(g, T, 0.5); }
}});
const ring = (g, x, y, r, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); };
// D — o periscópio: o tio puxa, a câmera entra no visor, o quintal cinza, nada... volta pro Eduardo
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tCano = W('cano', L.n3), tIn = L.o2[0] - 0.5, tOut = L.e1[0] - 0.45;
  const desce = prog(T, t0 + 0.3, t0 + 1.4), dentro = ease.inOut(prog(T, tIn, tIn + 0.5)) * (1 - ease.inOut(prog(T, tOut, tOut + 0.45)));
  const camB = K(T, [[t0, foco(700, GY0 - 400, 1.5)], [tCano, foco(PX, 520, 2.6)], [tIn, foco(PX + 90, 700, 3.2)], [tOut + 0.3, foco(620, GY0 - 280, 2.0)], [info.shot.end, foco(620, GY0 - 300, 2.6)]]);
  const bunker = (g) => { const { GY, CX } = bunkerSala(g, t, camB, { lamp: 0.4, dark: 0.35 }); layer(g, camB, 1, g => { escada(g, CX, GY);
      const ol = periscopio(g, PX, desce);
      drawFigure(g, { x: PX + 160, y: GY + 50, s: 1.65, facing: -1, outfit: OSVALDO, pose: posesAt(T, [[t0, 'pointUp'], [t0 + 1.4, { ...POSES.reach, eF: [26, -190], hF: [44, -220] }]], 0.3), expr: 'determined', talk: talkAmount(T, ...L.o2), t });
      drawFigure(g, { x: 560, y: GY + 70, s: 1.6, facing: 1, outfit: EDUARDO, pose: breathe(T > tOut ? POSES.crossArms : POSES.relaxed, t, 1, 1), expr: T > tOut ? 'suspicious' : 'worried', talk: talkAmount(T, ...L.e1), look: [0.5, -0.4], t, emote: T > tOut ? 'sweat' : null });
      drawFigure(g, { x: 400, y: GY + 80, s: 1.5 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.sad, t, 1.5, 2), expr: 'sob', t }); }); };
  const visao = (g) => { const pan = (T - tIn) * 40; visorPeriscopio(g, t, g => quintalCinza(g, t, { z: 1.3, x: -120 + pan, y: 180 }, {})); };
  mist(g, dentro, bunker, visao);
  if (dentro > 0.6) { const a = dentro; text(g, 'NADA.', 540, 400, { size: 90, color: S().ui.cream, stroke: 18, strokeColor: INK, alpha: a * prog(T, L.o2[0], L.o2[0] + 0.2) }); }
}});
// E — flashback: almoço de domingo, o avô zoando o tio (sépia)
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tA = L.av[0], tN = L.n6[0];
  const cam = K(T, [[info.shot.start, foco(540, 1080, 1.0)], [tA - 0.2, foco(400, 1050, 1.35)], [tN, foco(400, 1050, 1.35)], [info.shot.end, foco(740, 1000, 2.2)]]);
  const { GY } = quintal(g, t, cam, { moodName: 'day', fire: 1, smoke: true });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 250, y: GY + 120, s: 1.5, facing: 1, outfit: EDUARDO.kid ? EDUARDO : { ...EDUARDO, kid: true }, pose: breathe(POSES.relaxed, t, 1, 1), expr: T > tA ? 'joy' : 'smile', t });
    drawFigure(g, { x: 340, y: GY + 120, s: 1.5 * RAFAEL_S, facing: 1, outfit: { ...RAFAEL, kid: true }, pose: breathe(POSES.cheer, t, 1, 2), expr: T > tA ? 'joy' : 'happy', t });
    drawFigure(g, { x: 420, y: GY + 90, s: 1.7, facing: 1, outfit: JOAQUIM, pose: breathe(T > tA ? posesAt(T % 1, [[0, 'point'], [0.5, 'cheer'], [1, 'point']], 0.25) : POSES.relaxed, t, 1.5, 7), expr: T > tA ? 'joy' : 'smile', talk: talkAmount(T, ...L.av), t, emote: T > tA ? 'sparkle' : null });
    drawFigure(g, { x: 600, y: GY + 100, s: 1.7, facing: -1, outfit: MARIANA, pose: breathe(POSES.talk, t, 1, 4), expr: T > tA ? 'happy' : 'smile', t });
    drawFigure(g, { x: 760, y: GY + 90, s: 1.75, facing: -1, outfit: { ...OSVALDO, top: 'jersey', color: '#5d6b3c' }, pose: breathe(POSES.crossArms, t, 1, 5), expr: T > tA ? 'suspicious' : 'neutral', t, emote: T > tN + 1 ? 'gloom' : null });
    mesaDomingo(g, 500, GY + 130, 820); });
  g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.globalAlpha = 0.65; g.fillRect(0, 0, E.W, E.H); g.restore(); veil(g, '#d8b880', 0.22);
  text(g, 'ANOS ATRÁS', 500, 330, { size: 46, color: WH, font: FONTS.ui, weight: 900, spacing: 6, stroke: 12, strokeColor: INK });
  if (T > tA) { const a = ease.outBack(prog(T, tA + 0.3, tA + 0.55)) * (1 - prog(T, L.av[1], L.av[1] + 0.3)); if (a > 0) { g.save(); g.translate(260, 560); g.scale(a, a); g.rotate(-0.12); text(g, 'HAHAHA', 0, 0, { size: 96, color: S().ui.cream, stroke: 18, strokeColor: INK }); g.restore(); } }
}});
// E2 — presente: o tio no bunker olhando a mesma foto
registerShot('E2', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.12 * k };
  fundo(g, t, { z: 1.5, x: 150, y: 200 }, { dark: 0.3 }); veil(g, '#000', 0.35);
  layer(g, cam, 1, g => { foto(g, 540, 820, 520, 380, g => { g.fillStyle = '#c0a878'; g.fillRect(-300, -200, 600, 400); drawFigure(g, { x: 0, y: 170, s: 1.15, facing: 1, outfit: { ...OSVALDO, top: 'jersey', color: '#5d6b3c' }, pose: { ...POSES.stand, eF: [30, -176], hF: [16, -214] }, expr: 'determined' }); }, { rot: -0.03 });
    seg(g, [[160, 1500], [300, 1090], [330, 1010]], 110, INK); seg(g, [[160, 1500], [300, 1090], [330, 1010]], 96, WH); seg(g, [[920, 1500], [780, 1090], [750, 1010]], 110, INK); seg(g, [[920, 1500], [780, 1090], [750, 1010]], 96, WH); });
  veil(g, '#0a1020', 0.15);
}});
// F — Dia 2: a mãe dorme; Eduardo vai na ponta dos pés até a mochila; crachá; tablet trancado
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tAb = W('abre', L.n7), tCr = L.n8[0], tTb = W('tablet', L.n8), tE = L.e2[0];
  const walk = prog(T, t0 + 1.0, tAb - 0.1), ex = lerp(760, 360, ease.inOut(walk));
  const cam = K(T, [[t0, foco(330, GY0 - 400, 1.7)], [t0 + 1.0, foco(500, GY0 - 300, 1.4)], [tAb, foco(330, GY0 - 200, 2.2)], [tE - 0.2, foco(330, GY0 - 200, 2.2)], [tE + 0.3, foco(380, GY0 - 330, 3.0)], [info.shot.end, foco(380, GY0 - 335, 3.2)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.75, dark: 0.15 });
  layer(g, cam, 1, g => {
    dormindo(g, 600, GY - 166, 0.85, MARIANA, { t, cor: '#7a5a8a' });
    mochila(g, 250, GY + 70, 1.1, prog(T, tAb, tAb + 0.4));
    drawFigure(g, { x: ex, y: GY + 80, s: 1.7, facing: -1, outfit: EDUARDO, pose: walk > 0 && walk < 1 ? walkPose(T * Math.PI * 2 * 0.6) : T > tAb ? breathe(POSES.kneel, t, 0.6, 1) : POSES.relaxed, expr: T > tE ? 'shocked' : walk < 1 ? 'nervous' : 'suspicious', talk: talkAmount(T, ...L.e2), t, emote: walk > 0 && walk < 1 ? 'sweat' : T > tE ? 'exclaim' : null }); });
  const ct = ease.outBack(prog(T, tCr, tCr + 0.3)) * (1 - ease.inOut(prog(T, tTb - 0.25, tTb))); if (ct > 0) { veil(g, '#000', 0.45 * ct); cracha(g, 540, 820, ct * 1.05, { foto: (g, x, y) => drawFigure(g, { x, y: y + 140, s: 1.0, facing: 1, outfit: MARIANA, pose: POSES.stand, expr: 'neutral' }) }); }
  const tb = ease.outBack(prog(T, tTb, tTb + 0.3)) * (1 - ease.inOut(prog(T, tE - 0.3, tE))); if (tb > 0) { veil(g, '#000', 0.45 * tb); tablet(g, 540, 820, tb * 0.95, t); }
}});
// G — a mãe aparece atrás dele; confronto; ela pega o tablet de volta com as mãos tremendo
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tE = L.e3[0], tN = L.n9[0], tM = W('mãos', L.n9);
  const cam = K(T, [[t0, foco(400, GY0 - 300, 2.0)], [t0 + 0.4, foco(470, GY0 - 330, 2.5)], [tE - 0.1, foco(440, GY0 - 300, 2.0)], [tE + 0.3, foco(340, GY0 - 300, 2.6)], [tN, foco(420, GY0 - 280, 1.9)], [tM, foco(470, GY0 - 230, 2.7)], [info.shot.end, foco(470, GY0 - 230, 2.9)]]);
  const { GY } = bunkerSala(g, t, cam, { lamp: 0.8, dark: 0.15 });
  const pega = prog(T, tN, tN + 0.5);
  layer(g, cam, 1, g => { mochila(g, 250, GY + 70, 1.1, 1);
    drawFigure(g, { x: 340, y: GY + 80, s: 1.7, facing: 1, outfit: EDUARDO, pose: breathe(T > tE ? POSES.ready : POSES.holdFront, t, 1, 1), expr: T > tE ? 'furious' : 'gulp', talk: talkAmount(T, ...L.e3), t, emote: T < tE ? 'sweat' : 'anger' });
    drawFigure(g, { x: 560, y: GY + 70, s: 1.8, facing: -1, outfit: MARIANA, pose: breathe(pega > 0 ? posesAt(T, [[tN, GRAB], [tN + 0.6, POSES.holdFront]], 0.2) : POSES.crossArms, t, 1, 4), expr: T > tN ? 'terrified' : 'angry', talk: talkAmount(T, ...L.m1), t, emote: T > tN ? 'sweat' : null });
    const tx = lerp(400, 600, ease.inOut(pega)), ty = GY - 160 + noise(T * 30, 2) * 6 * (T > tN ? 1 : 0); rr(g, tx - 30, ty - 40, 60, 80, 8); g.fillStyle = '#1c1e24'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); });
}});
// H — o arranhão volta, mais pesado; todos olham pra cima; poeira caindo; o Rafael (close)
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tR = L.r3[0], close = ease.inOut(prog(T, tR - 0.35, tR));
  const cam = K(T, [[info.shot.start, foco(540, GY0 - 350, 1.2)], [tR - 0.4, foco(540, 900, 1.35)]]);
  const [dx, dy] = impacto(T % 1.3, 0, 12, 1.3); cam.x += dx; cam.y += dy;
  const sala = (g) => { const { GY, CX } = bunkerSala(g, t, cam, { lamp: 0.6, dark: 0.25 }); const lk = { look: [0, -1], t }; layer(g, cam, 1, g => { escada(g, CX, GY); poeiraAlcapao(g, CX, T);
    drawFigure(g, { x: 200, y: GY + 70, s: 1.45, facing: 1, outfit: MARIANA, pose: POSES.handsOnHead, expr: 'terrified', ...lk });
    drawFigure(g, { x: 330, y: GY + 90, s: 1.45 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: POSES.handsOnHead, expr: 'panic', ...lk, emote: 'sweat' });
    drawFigure(g, { x: 760, y: GY + 70, s: 1.45, facing: -1, outfit: EDUARDO, pose: POSES.ready, expr: 'terrified', ...lk, emote: 'exclaim' });
    drawFigure(g, { x: 880, y: GY + 50, s: 1.45, facing: -1, outfit: OSVALDO, pose: POSES.ready, expr: 'gulp', ...lk }); }); };
  const rosto = (g) => { fundo(g, t, { z: 1.5, x: -100, y: 200 }, { dark: 0.3 }); veil(g, '#000', 0.35); layer(g, { z: 1.0 + 0.06 * (T - tR) }, 1, g => bigFace(g, 500, 880, 300, { outfit: RAFAEL, expr: 'terrified', talk: talkAmount(T, ...L.r3), look: [0.1, -0.7], rimSide: 1, t, emote: 'sweat', tilt: 0.04 * Math.sin(T * 9) })); };
  mist(g, close, sala, rosto); veil(g, '#300000', 0.06 + 0.05 * Math.sin(T * 5));
}});
// I — o tio no periscópio; a sombra de dois metros passa; o rosto dele; a mãe fecha os olhos
registerShot('I', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tIn = W('dessa', L.n11), tP = L.n12[0], tM = W('dois', L.n12);
  const dentro = ease.inOut(prog(T, tIn - 0.2, tIn + 0.3)) * (1 - ease.inOut(prog(T, tM + 0.4, tM + 0.9)));
  const camB = K(T, [[t0, foco(PX + 110, 930, 1.9)], [tIn, foco(PX + 110, 820, 2.6)], [tM + 0.5, foco(PX + 150, GY0 - 360, 3.0)], [info.shot.end, foco(PX + 150, GY0 - 360, 3.3)]]);
  const bunker = (g) => { const { GY, CX } = bunkerSala(g, t, camB, { lamp: 0.5, dark: 0.35 }); layer(g, camB, 1, g => { periscopio(g, PX, 1);
    drawFigure(g, { x: PX + 160, y: GY + 50, s: 1.65, facing: -1, outfit: OSVALDO, pose: { ...POSES.reach, eF: [26, -190], hF: [44, -220] }, expr: T > tM ? 'terrified' : 'determined', t, emote: T > tM ? ['sweat', 'shock'] : null }); }); };
  const visao = (g) => { const k = prog(T, tP - 0.2, tP + 2.2); visorPeriscopio(g, t, g => { quintalCinza(g, t, { z: 1.3, x: 60, y: 180 }); const kk = prog(T, tP - 0.4, tM + 1.4); sombraCriatura(g, lerp(980, 120, kk), 1240, 2.6, T, { a: Math.min(1, 1.6 * Math.sin(Math.PI * clamp(kk))) }); fallout(g, t + 5, { count: 50, a: 0.45 }); }); };
  mist(g, dentro, bunker, visao);
  if (T > tM - 0.1) { alerta(g, T, 0.6 * (1 - prog(T, tM + 2, tM + 3))); }
}});
registerShot('J', { draw(g, t, info) {
  const ui = S().ui; g.fillStyle = '#060607'; g.fillRect(0, 0, E.W, E.H); glow(g, 500, 1500, 700, '#e6d24a', 0.1 + 0.03 * Math.sin(t * 5)); fallout(g, t, { count: 50, a: 0.22 });
  const z = 1 + 0.04 * t; g.save(); g.translate(500, 900); g.scale(z, z);
  const a1 = ease.out(prog(t, 0.05, 0.35)), a2 = ease.outBack(prog(t, 0.2, 0.55)), a3 = ease.out(prog(t, 0.5, 0.8));
  text(g, 'O QUE A MAMÃE SABIA', 0, -230, { size: 40, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 6, alpha: a1 });
  g.save(); g.scale(a2, a2); text(g, 'A CAIXA', 0, -110, { size: 130, color: ui.cream, spacing: 3 }); text(g, 'DA MAMÃE', 0, 14, { size: 116, color: ui.cream, spacing: 3 }); g.restore();
  g.fillStyle = alpha(ui.accent, a3); g.fillRect(-170 * a3, 104, 340 * a3, 8); text(g, 'EPISÓDIO 3', 0, 174, { size: 54, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 8, alpha: a3 });
  g.restore();
}});
registerShot('Kc', { draw(g, t, info) { UI.seguir(g, t, { proximo: 'EP. 4 — O AR PESADO', outfit: EDUARDO }); } });
