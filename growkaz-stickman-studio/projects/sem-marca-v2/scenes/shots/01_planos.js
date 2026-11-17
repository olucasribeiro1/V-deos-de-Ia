// SEM MARCA · EP. 1 — O VAZIO · 2.5D + 3D toon, câmera sempre viva
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, rr, seg, poly, circle, glow, alpha, mix, text, FONTS, S, noise, rng, blurLayer } from '/engine/core.js';
import { drawFigure, POSES, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { impacto } from '/series/mamae/efeitos.js';
import { foco, K } from '/series/mamae/camera.js';
import { W, mist, rotulo, legendaTopo } from '/series/mamae/comum.js';
import { cidade as avenida, celular } from '/series/ese/mundo.js';
import { INK, GY, COR, box, cidade, campo, salao, cristal, chamas, biblioteca, estante, vela, livro, gato, caminhao, monstro, armadura, barco, muralha, raio, agua, lago, ceu, montanhas, castelo } from '/series/semmarca/mundo.js';
import { dragao, luas, cidade3D, paisagem, salao3D, plateia3D, toon } from '/series/semmarca/tres.js';
import { PROTAGONISTA as VC, FIGURANTE as FG } from '../cast.js';
const WH = '#f1efe9';
const pop = (T, t0, d = 0.25) => ease.outBack(prog(T, t0 - 0.1, t0 + d));
const M = (n, c, b = 0.7) => ({ n, cor: c, brilho: b });
const DIRETOR = { top: 'dress', color: '#4a3a8a', head: 'none' };
const MAGO = (c) => ({ top: 'dress', color: c, head: 'none' });
const proj = (s, x, y, z) => { const v = new s.THREE_V(x, y, z).project(s.stage.camera); return [(v.x + 1) / 2 * E.W, (1 - v.y) / 2 * E.H]; };
const balaoTxt = (g, x, y, str, a, c = '#fff') => { if (a <= 0) return; g.save(); g.translate(x, y); g.scale(a, a); g.font = '900 40px Nunito'; const w = g.measureText(str).width + 50; rr(g, -w / 2, -36, w, 72, 36); g.fillStyle = INK; g.fill(); rr(g, -w / 2 + 6, -30, w - 12, 60, 30); g.fillStyle = c; g.fill(); text(g, str, 0, 2, { size: 40, color: INK, font: FONTS.ui, weight: 900 }); g.restore(); };

// A — avenida à noite: o gato, o caminhão, você pula; o gato ileso; você virou estatística
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tAv = W('avenida', L.n02), tCa = W('caminhão', L.n02), tPu = W('pulou', L.n02), tIl = W('ileso', L.n03), tEs = W('estatística', L.n03);
  if (T < tPu + 0.15) {
    const cam = K(T, [[0, foco(540, 1080, 1.5)], [tAv, foco(620, 1120, 1.9)], [tCa, foco(760, 1050, 1.15)], [tPu - 0.3, foco(640, 1080, 1.5)], [tPu + 0.15, foco(640, 1080, 2.1)]]);
    const [dx, dy] = impacto(T, tPu + 0.05, 16, 0.4); cam.x += dx; cam.y += dy;
    avenida(g, t, cam, { T });
    layer(g, cam, 0.85, g => { gato(g, 640, GY + 70, 0.6, { t });
      const k = prog(T, tCa - 0.2, tPu + 0.15); caminhao(g, lerp(1250, 700, ease.in(k)), GY + 160, lerp(0.45, 1.6, ease.in(k)), { farol: 1 });
      const px = T < tPu - 0.3 ? lerp(-150, 330, prog(T, 0, tPu - 0.3)) : lerp(330, 600, prog(T, tPu - 0.3, tPu + 0.1));
      drawFigure(g, { x: px, y: GY + 100, s: 1.6, facing: 1, outfit: VC, pose: T < tPu - 0.3 ? walkPose(T * 2.6, { run: true }) : POSES.dive, rot: T < tPu - 0.3 ? 0 : -0.9, expr: T < tCa ? 'nervous' : 'determined', t, emote: T > tCa && T < tPu - 0.3 ? 'exclaim' : null }); });
    if (T > tCa) veil(g, '#fff6c8', 0.25 * prog(T, tCa, tPu)); if (T > tPu) veil(g, '#ffffff', 0.95);
    return; }
  // depois: o gato na calçada, ileso; o contador de estatística
  const cam = K(T, [[tPu, foco(540, 1150, 2.6)], [tIl, foco(540, 1150, 2.3)], [info.shot.end, foco(540, 1100, 2.0)]]);
  avenida(g, t, cam, { T }); veil(g, '#1a0b2a', 0.3);
  layer(g, cam, 0.85, g => { gato(g, 540, GY + 30, 0.7, { t }); for (let i = 0; i < 3; i++) { const ph = (t + i / 3) % 1; circle(g, 610 + ph * 30, GY - 120 - ph * 60, 6, alpha('#ffd23a', 1 - ph)); } });
  if (T > tIl - 0.1) rotulo(g, 'ILESO ✓', T - tIl + 0.1, 520, '#7dff4a', 100);
  if (T > tEs - 0.2) { const a = pop(T, tEs); veil(g, '#000', 0.6 * prog(T, tEs - 0.2, tEs + 0.2)); g.save(); g.translate(540, 900); g.scale(a, a); rr(g, -330, -150, 660, 300, 30); g.fillStyle = INK; g.fill(); rr(g, -320, -140, 640, 280, 24); g.fillStyle = '#f2ead8'; g.fill();
    text(g, 'ACIDENTES DE TRÂNSITO', 0, -80, { size: 34, color: '#3a3a44', font: FONTS.ui, weight: 900 }); text(g, '+1', 0, 30, { size: 150, color: '#d8342b' }); g.restore(); }
  if (T > tIl - 0.6 && T < tIl + 0.2) veil(g, '#fff', 0.9 * (1 - prog(T, tIl - 0.6, tIl - 0.3)));
}});

// B — 3D: abre o olho; céu azul, duas luas, dragão passando; a cidade murada lá embaixo
registerShot('B', { kind: '3d',
  init(T, info) { const st = T.stage({ sky: ['#1a0b3a', '#6a2aa0', '#f0a0c8'], fog: [60, 260], fogColor: '#c89ae0', keyColor: '#fff0f0', keyIntensity: 2.8, keyPos: [-20, 30, 15], ambient: 1.3, ambientSky: '#d8b8ff', shadowSize: 30, fov: 50, bloom: 0.5 });
    st.add(paisagem(T), cidade3D(T), luas(T)); const dr = dragao(T); st.add(dr); const eu = T.figure3D(VC, { rim: '#0b0b0d', pose: 'stand' }); eu.position.set(0, 2.35, 0); st.add(eu);
    const dr2 = dragao(T, '#2a6ad8'); dr2.scale.setScalar(0.6); st.add(dr2); return { stage: st, dr, dr2, eu, THREE_V: T.THREE.Vector3 }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tDr = W('dragão', L.n04), tLa = L.n05[0], tMu = W('mundo', L.n05);
    const k = (x) => x - t0;
    T.dolly(s.stage.camera, lt, [[0, { pos: [0.2, 4.1, 0.6], look: [6, 40, -50], fov: 60 }], [k(tDr) - 0.5, { pos: [0.2, 4.0, 0.6], look: [-6, 34, -40], fov: 60 }], [k(tDr) + 2.0, { pos: [0.2, 4.0, 0.6], look: [-4, 18, -50], fov: 58 }],
      [k(tLa) + 0.2, { pos: [-2.2, 4.2, -0.5], look: [45, 1, -2], fov: 46 }], [k(tLa) + 2.2, { pos: [-2.6, 4.4, -0.6], look: [45, 1.5, -1], fov: 46 }], [k(tMu) - 0.6, { pos: [-7, 7.5, 5], look: [45, 5, 0], fov: 44 }], [info.dur, { pos: [-14, 13, 12], look: [45, 6, 0], fov: 44 }]]);
    const p = clamp((Tg - (tDr - 1.6)) / 3.4); s.dr.position.set(-2 + p * 6, 20 - p * 2, 40 - p * 100); s.dr.rotation.set(0, Math.PI / 2 + 0.1, -0.08); s.dr.scale.setScalar(1.6); s.dr.update(Tg);
    const a = Tg * 0.5; s.dr2.position.set(45 + Math.cos(a) * 26, 26 + Math.sin(Tg) * 2, Math.sin(a) * 26); s.dr2.rotation.set(0, -a, 0.25); s.dr2.update(Tg + 1); s.eu.setPose(POSES.stand); },
  overlay(g, lt, info) { const Tg = info.globalT, L = info.L;
    const ab = ease.inOut(prog(lt, 0.15, 1.1)); if (ab < 1) { g.fillStyle = '#000'; const h = (1 - ab) * E.H / 2 + (lt < 0.6 ? Math.sin(lt * 20) * 30 * (1 - ab) : 0); g.fillRect(-E.W, -E.H, E.W * 3, E.H + h); g.fillRect(-E.W, E.H - h, E.W * 3, E.H); }
    if (Tg > W('azul', L.n04) - 0.1 && Tg < W('luas', L.n04) + 0.6) rotulo(g, 'CÉU AZUL', Tg - W('azul', L.n04), 1180, '#ff8ad8', 90);
    if (Tg > W('luas', L.n04) - 0.1 && Tg < W('dragão', L.n04) - 0.3) rotulo(g, '2 LUAS', Tg - W('luas', L.n04), 1180, '#c8f6ff', 100);
    if (Tg > W('mundo', L.n05) - 0.2) rotulo(g, 'OUTRO MUNDO', Tg - W('mundo', L.n05) + 0.2, 470, '#ffd23a', 110); } });

// C — todo mundo tem riscos no rosto: a Marca. Nasce com ela. Decide tudo.
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tR = W('riscos', L.n06), tMa = W('marca', L.n06), tNa = W('nasce', L.n06), tDe = W('decide', L.n06);
  const kF = ease.inOut(prog(T, tMa - 0.35, tMa + 0.1)), kN = ease.inOut(prog(T, tNa - 0.35, tNa + 0.1));
  const rua = (g) => { const cam = K(T, [[t0, foco(200, 1000, 1.0)], [tR, foco(560, 1100, 1.9)], [tMa, foco(600, 1080, 2.6)]]);
    cidade(g, t, cam); layer(g, cam, 1, g => { const pp = [[60, 1, '#ff4a1a', 1], [260, -1, '#2a9dff', 2], [470, 1, '#b8743a', 3], [640, -1, '#ffe23a', 1], [860, 1, '#e8f4ff', 2], [1060, -1, '#ff4a1a', 3]];
      pp.forEach(([x, f, c, n], i) => drawFigure(g, { x, y: GY + 150 + (i % 2) * 40, s: 1.55, facing: f, outfit: FG, pose: breathe(i % 3 ? POSES.talk : POSES.relaxed, t, 1, i), expr: ['smile', 'proud', 'sad', 'joy', 'neutral', 'gloom'][i] || 'neutral', t, marca: M(n, c), talk: 0.4 + 0.3 * Math.sin(t * 6 + i) }));
      drawFigure(g, { x: 560, y: GY + 280, s: 1.7, facing: 1, outfit: VC, pose: breathe(POSES.stand, t, 1, 1), expr: 'suspicious', look: [-0.5, -0.2], t, emote: T > tR ? 'question' : null }); }); };
  const close = (g) => { g.fillStyle = '#1a0b3a'; g.fillRect(0, 0, E.W, E.H); glow(g, 540, 800, 700, '#ff4a1a', 0.25); const z = 1 + 0.05 * (T - tMa);
    bigFace(g, 540, 780, 300 * z, { outfit: FG, expr: 'proud', t, marca: M(1, '#ff4a1a', 1), rimColor: '#ff8a4a' });
    if (T > tMa) { const a = pop(T, tMa); g.save(); g.translate(540, 1200); g.scale(a, a); text(g, 'A MARCA', 0, 0, { size: 130, color: '#ffd23a', stroke: 22, strokeColor: INK }); g.restore(); }
    for (let i = 0; i < 8; i++) { const ph = (t * 0.6 + i / 8) % 1; circle(g, 620 + Math.sin(i * 2) * 60, 840 - ph * 300, 6, alpha('#ffb84a', 1 - ph)); } };
  const bebe = (g) => { g.fillStyle = '#2a1a3a'; g.fillRect(0, 0, E.W, E.H); glow(g, 540, 900, 600, '#ffd27a', 0.3);
    box(g, 220, 1000, 640, 240, '#c8945a', 30, 8); for (let i = 0; i < 9; i++) seg(g, [[250 + i * 72, 860], [250 + i * 72, 1000]], 10, '#8a5a30'); seg(g, [[220, 860], [860, 860]], 14, '#8a5a30');
    g.fillStyle = '#e8dcf0'; g.beginPath(); g.ellipse(540, 980, 220, 70, 0, 0, 7); g.fill(); bigFace(g, 540, 890, 120, { outfit: { ...FG, kid: true }, expr: 'smile', t, marca: M(2, '#2a9dff', 1) });
    glow(g, 580, 900, 200, '#2a9dff', 0.4 + 0.2 * Math.sin(t * 6)); legendaTopo(g, 'DESDE O BERÇO', 470);
    if (T > tDe - 0.1) { const a = pop(T, tDe); g.save(); g.translate(540, 1180); g.scale(a, a); text(g, 'DECIDE TUDO', 0, 0, { size: 104, color: '#ff4a6a', stroke: 20, strokeColor: INK }); g.restore(); } };
  if (kN > 0) mist(g, kN, close, bebe); else mist(g, kF, rua, close);
}});

// D — 1 linha: elite (Academia) · 2 linhas: soldado/ferreiro · 3 linhas: trabalho pesado
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tE = W('elite', L.n07), tAc = W('academia', L.n07), t2 = W('duas', L.n07), t3 = W('três', L.n07), tNi = W('ninguém', L.n07);
  const cam = K(T, [[t0, foco(300, 1050, 1.5)], [tAc, foco(360, 1000, 1.8)], [t2 - 0.3, foco(1350, 1050, 1.6)], [t3 - 0.3, foco(2400, 1080, 1.6)], [tNi, foco(2450, 1060, 2.2)], [info.shot.end, foco(2450, 1060, 2.4)]]);
  cidade(g, t, cam, { castle: true });
  layer(g, cam, 1, g => {
    // elite: portão da Academia, mago com fogo na mão
    box(g, 60, GY - 620, 520, 620, '#e0d4f0', 10, 8); rr(g, 210, GY - 420, 220, 420, 110); g.fillStyle = '#2a1a46'; g.fill(); text(g, 'ACADEMIA REAL', 320, GY - 470, { size: 40, color: '#3a2a6a', font: FONTS.ui, weight: 900 }); glow(g, 320, GY - 200, 300, '#ffd23a', 0.3);
    drawFigure(g, { x: 330, y: GY + 200, s: 1.75, facing: 1, outfit: MAGO('#c0283a'), pose: breathe({ ...POSES.stand, eF: [26, -150], hF: [54, -180] }, t, 1, 1), expr: 'proud', t, marca: M(1, '#ff4a1a', 1), emote: 'sparkle' });
    FX.sparkle && 0; for (let i = 0; i < 10; i++) { const ph = (t * 1.5 + i / 10) % 1; circle(g, 412 + Math.sin(i * 3 + t * 4) * 12, GY - 120 - ph * 90, (14 - ph * 10), alpha(ph < 0.3 ? '#ffe06a' : '#ff4a1a', 1 - ph)); } glow(g, 410, GY - 140, 160, '#ff4a1a', 0.6);
    // soldado e ferreiro
    box(g, 1100, GY - 160, 200, 160, '#5a5e66', 6, 6); poly(g, [[1080, GY - 160], [1320, GY - 160], [1300, GY - 200], [1100, GY - 200]], '#3a3e46'); for (let i = 0; i < 4; i++) { const ph = (t * 2 + i / 4) % 1; circle(g, 1260 + ph * 40, GY - 210 - ph * 60, 6, alpha('#ffb43a', 1 - ph)); }
    drawFigure(g, { x: 1380, y: GY + 200, s: 1.7, facing: -1, outfit: FG, pose: breathe(Math.sin(t * 6) > 0 ? { ...POSES.stand, eF: [24, -180], hF: [40, -220] } : { ...POSES.stand, eF: [30, -150], hF: [60, -150] }, t, 1, 3), expr: 'neutral', t, marca: M(2, '#b8743a') });
    drawFigure(g, { x: 1600, y: GY + 200, s: 1.7, facing: -1, outfit: FG, pose: breathe({ ...POSES.stand, eF: [20, -150], hF: [24, -110] }, t, 1, 4), expr: 'determined', t, marca: M(2, '#2a9dff') }); seg(g, [[1576, GY + 200 - 190], [1576, GY + 200 - 420]], 8, '#c8ccd8'); poly(g, [[1566, GY - 220], [1586, GY - 220], [1576, GY - 260]], '#c8ccd8');
    // trabalho pesado
    for (let i = 0; i < 3; i++) { const x = 2250 + i * 200; drawFigure(g, { x, y: GY + 200, s: 1.6, facing: 1, outfit: FG, pose: breathe({ ...POSES.sad, eF: [16, -180], hF: [10, -230], eB: [-14, -180], hB: [-6, -230] }, t, 2, i), expr: i === 1 ? 'sob' : 'gloom', t, marca: M(3, ['#e8f4ff', '#ffe23a', '#b8743a'][i], 0.3), emote: 'gloom' }); box(g, x - 70, GY - 210 + 200 - 200, 140, 90, '#c8a46a', 20, 5); }
    for (let i = 0; i < 4; i++) drawFigure(g, { x: 2000 + i * 260 + (i > 1 ? 400 : 0), y: GY + 120, s: 1.4, facing: i % 2 ? 1 : -1, outfit: FG, pose: walkPose(T * 2 + i), expr: 'blank', t, marca: M(1 + (i % 2), '#ff4a1a'), alpha: T > t3 ? 0.9 : 0 }); });
  const lab = (str, sub, c, tt, end) => { if (T < tt - 0.1 || T > end) return; const a = pop(T, tt); g.save(); g.translate(540, 330); g.scale(a, a); text(g, str, 0, 0, { size: 112, color: c, stroke: 20, strokeColor: INK }); text(g, sub, 0, 100, { size: 50, color: WH, stroke: 12, strokeColor: INK, font: FONTS.ui, weight: 900 }); g.restore(); };
  lab('1 LINHA', 'ELITE · MAGIA MONSTRA', '#ffd23a', W('linha', L.n07), t2 - 0.2); lab('2 LINHAS', 'SOLDADO · FERREIRO', '#9fd8ff', t2, t3 - 0.2); lab('3 LINHAS', 'TRABALHO PESADO', '#ff6a6a', t3, 99);
  if (T > tNi) rotulo(g, 'NINGUÉM OLHA', T - tNi, 640, WH, 76);
}});

// E — o campo de treino: fogo, água, terra, vento, raio (câmera passeia de mago em mago)
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tC = W('cor', L.n08), tV = W('vermelha', L.n08), tAz = W('azul', L.n08), tMa = W('marrom', L.n09), tBr = W('branca', L.n09), tAm = W('amarela', L.n09), tEs = W('estalo', L.n09);
  const X = [400, 1300, 2200, 3100, 4000];
  const cam = K(T, [[t0, foco(400, 900, 0.9)], [tC + 0.5, foco(400, 1050, 1.3)], [tAz - 0.4, foco(560, 1050, 1.5)], [tAz + 0.1, foco(X[1] + 160, 1050, 1.5)], [tMa - 0.4, foco(X[1] + 200, 1050, 1.5)], [tMa + 0.1, foco(X[2] + 160, 1000, 1.4)], [tBr - 0.4, foco(X[2] + 200, 1000, 1.4)], [tBr + 0.1, foco(X[3] + 200, 950, 1.2)], [tAm - 0.4, foco(X[3] + 250, 950, 1.2)], [tAm + 0.1, foco(X[4] + 280, 900, 0.85)], [info.shot.end, foco(X[4] + 300, 880, 0.8)]]);
  const [dx, dy] = impacto(T, tEs, 22, 0.6); cam.x += dx; cam.y += dy;
  campo(g, t, cam);
  layer(g, cam, 1, g => { const mago = (x, c, cor, pose, tt) => drawFigure(g, { x, y: GY + 200, s: 1.7, facing: 1, outfit: MAGO(c), pose: breathe(T > tt ? pose : POSES.stand, t, 1, x), expr: T > tt ? 'determined' : 'neutral', t, marca: M(1 + (x % 3 === 0 ? 0 : 1), cor, T > tt ? 1 : 0.5) });
    const pF = { ...POSES.stand, eF: [36, -160], hF: [74, -170] };
    // fogo → armadura derretendo
    mago(X[0], '#c0283a', '#ff4a1a', pF, tV); armadura(g, X[0] + 380, GY + 200, 1.3, prog(T, tV + 0.3, tV + 1.6), t); if (T > tV) { const a = prog(T, tV, tV + 0.3); for (let i = 0; i < 18; i++) { const ph = (t * 2 + i / 18) % 1; circle(g, lerp(X[0] + 110, X[0] + 380, ph), GY - 90 + Math.sin(ph * 9 + i) * 20, 22 * (1 - ph * 0.5) * a, alpha(ph < 0.3 ? '#ffe06a' : '#ff4a1a', 0.9)); } glow(g, X[0] + 380, GY - 100, 260, '#ff4a1a', 0.6 * a); }
    // água → ferida fechando
    mago(X[1], '#2a4ad8', '#2a9dff', pF, tAz); drawFigure(g, { x: X[1] + 330, y: GY + 200, s: 1.6, facing: -1, outfit: FG, pose: breathe(POSES.sit, t, 1, 7), expr: T > W('ferida', L.n08) + 0.5 ? 'joy' : 'cry', t, marca: M(2, '#b8743a', 0.3) });
    if (T < W('hora', L.n08)) seg(g, [[X[1] + 300, GY + 30], [X[1] + 340, GY + 70]], 8, '#ff3a3a'); agua(g, X[1] + 330, GY + 40, 1.0, t, prog(T, tAz, tAz + 0.4));
    // terra → muralha
    mago(X[2], '#6a4a2a', '#b8743a', { ...POSES.stand, eF: [30, -180], hF: [50, -230], eB: [-20, -180], hB: [-30, -230] }, tMa); muralha(g, X[2] + 420, GY + 220, 0.8, prog(T, tMa + 0.1, tMa + 0.9));
    // vento → barco voando
    mago(X[3], '#8ac8e8', '#e8f4ff', pF, tBr); g.fillStyle = '#4a8ae0'; g.fillRect(X[3] + 150, GY + 120, 700, 200); barco(g, X[3] + 470, GY + 150, 0.9, t, prog(T, tBr + 0.2, tBr + 1.4));
    // raio → monstro de 10 m
    mago(X[4], '#d8b020', '#ffe23a', { ...POSES.pointUp }, tAm); monstro(g, X[4] + 650, GY + 220, 1.1, t, T > tEs - 0.1 && T < tEs + 0.5 ? 1 : 0); if (T > tEs - 0.15 && T < tEs + 0.35) raio(g, X[4] + 650, -600, X[4] + 650, GY - 600, t, 1);
    if (T > tEs + 0.3) { seg(g, [[X[4] + 360, GY + 230], [X[4] + 960, GY + 230]], 0, INK); } });
  if (T > tEs - 0.05 && T < tEs + 0.12) veil(g, '#fff8c0', 0.7);
  const tag = (str, c, tt, end) => { if (T < tt - 0.1 || T > end) return; const a = pop(T, tt); g.save(); g.translate(540, 470); g.scale(a, a); rr(g, -260, -70, 520, 140, 70); g.fillStyle = INK; g.fill(); rr(g, -250, -60, 500, 120, 60); g.fillStyle = c; g.fill(); text(g, str, 0, 4, { size: 72, color: c === '#e8f4ff' || c === '#ffe23a' ? INK : '#fff', font: FONTS.title }); g.restore(); };
  if (T < tV - 0.1 && T > tC - 0.1) rotulo(g, 'COR = ELEMENTO', T - tC + 0.1, 470, '#ffd23a', 96);
  tag('FOGO', COR.fogo, tV, tAz - 0.2); tag('ÁGUA', COR.agua, tAz, tMa - 0.2); tag('TERRA', COR.terra, tMa, tBr - 0.2); tag('VENTO', COR.vento, tBr, tAm - 0.2); tag('RAIO', COR.raio, tAm, 999);
}});

// F — as raras: dourada (luz), preta (sombra), violeta (gravidade). Só 3 pessoas vivas.
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tD = W('dourada', L.n10), tP = W('preta', L.n10), tV = W('violeta', L.n10), tGr = W('gravidade', L.n10), tRe = W('reino', L.n10);
  g.fillStyle = '#06030c'; g.fillRect(0, 0, E.W, E.H); FX.stars(g, t, { count: 120, seed: 21, area: [0, 0, E.W, E.H] });
  const zc = K(T, [[t0, { z: 1.0, x: 0, y: 0 }], [tD, { z: 1.25, x: -260, y: 0 }], [tP, { z: 1.25, x: 0, y: 0 }], [tV, { z: 1.25, x: 260, y: 0 }], [tRe, { z: 0.95, x: 0, y: 0 }], [info.shot.end, { z: 1.05, x: 0, y: 0 }]]);
  g.save(); g.translate(540, 1000); g.scale(zc.z, zc.z); g.translate(-540 - zc.x, -1000);
  const enc = (x, c, n, tt, fx) => { const on = T > tt - 0.1 ? prog(T, tt - 0.1, tt + 0.3) : 0; glow(g, x, 900, 340, c === COR.sombra ? '#6a2a8a' : c, 0.15 + 0.45 * on);
    drawFigure(g, { x, y: 1300, s: 2.0, facing: x < 540 ? 1 : x > 540 ? -1 : 1, outfit: { top: 'dress', color: '#1a1424', head: 'hood', headColor: '#1a1424' }, pose: breathe(on ? { ...POSES.stand, eF: [30, -170], hF: [56, -200] } : POSES.stand, t, 1, x), expr: 'determined', t, marca: M(1, c === COR.sombra ? '#2a1a3a' : c, on ? 1 : 0.2), dim: on ? 0 : 0.6 });
    if (on) fx(on); };
  enc(260, COR.luz, 1, tD, (a) => { for (let i = 0; i < 12; i++) { const an = i / 12 * 6.28 + t * 0.5; seg(g, [[260, 860], [260 + Math.cos(an) * 260 * a, 860 + Math.sin(an) * 260 * a]], 6, alpha('#fff6c0', 0.6 * a)); } glow(g, 260, 860, 200, '#ffffff', 0.7 * a); });
  enc(540, COR.sombra, 1, tP, (a) => { for (let i = 0; i < 10; i++) { const ph = (t * 0.7 + i / 10) % 1; g.fillStyle = alpha('#0a0412', 0.8 * a * (1 - ph)); g.beginPath(); g.ellipse(540 + Math.sin(i * 2.4) * 160 * ph, 1100 - ph * 400, 60 + ph * 80, 30 + ph * 50, 0, 0, 7); g.fill(); } });
  enc(820, COR.gravidade, 1, tV, (a) => { for (let i = 0; i < 7; i++) { const fl = (T > tGr ? prog(T, tGr, tGr + 1) : 0); poly(g, [[760 + i * 30, 1290 - fl * (180 + i * 40) + Math.sin(t * 2 + i) * 10], [800 + i * 30, 1280 - fl * (180 + i * 40)], [780 + i * 30, 1250 - fl * (180 + i * 40)]], '#6a5a7a'); } g.strokeStyle = alpha('#c88aff', 0.6 * a); g.lineWidth = 4; for (let r2 = 0; r2 < 3; r2++) { g.beginPath(); g.ellipse(820, 1000, 120 + r2 * 60 + (t * 40) % 60, 40 + r2 * 20, 0, 0, 7); g.stroke(); } });
  g.restore();
  const tag = (str, c, tt, end, x) => { if (T < tt - 0.1 || T > end) return; const a = pop(T, tt); g.save(); g.translate(x, 470); g.scale(a, a); text(g, str, 0, 0, { size: 84, color: c, stroke: 16, strokeColor: INK }); g.restore(); };
  tag('LUZ', '#ffd76a', tD, tRe - 0.2, 540); tag('SOMBRA', '#b8a0d8', tP, tRe - 0.2, 540); tag('GRAVIDADE', '#c88aff', tV, tRe - 0.2, 540);
  if (T < tD - 0.1) rotulo(g, 'MARCAS RARAS', T - t0 - 0.2, 470, '#ffd23a', 100);
}});

// G — o lago: o reflexo sem marca
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tLa = W('lago', L.n11), tNa = W('nada', L.n11), tLi = W('liso', L.n11);
  const k = ease.inOut(prog(T, tNa - 0.4, tNa + 0.05));
  const corre = (g) => { const cam = K(T, [[t0, foco(200, 1100, 1.4)], [tLa, foco(500, 1200, 1.6)], [tNa, foco(560, 1300, 2.2)]]); lago(g, t, cam);
    layer(g, cam, 0.9, g => { const x = lerp(-100, 520, ease.out(prog(T, t0, tLa + 0.6))); drawFigure(g, { x, y: GY + 60, s: 1.7, facing: 1, outfit: VC, pose: T < tLa + 0.6 ? walkPose(T * 2.6, { run: true }) : POSES.kneel, expr: 'nervous', t, emote: 'sweat' }); }); };
  const ref = (g) => { g.fillStyle = linGrad2(g); g.fillRect(0, 0, E.W, E.H); const wob = Math.sin(t * 3) * 0.03;
    g.save(); g.translate(540, 820); g.rotate(wob); g.scale(1 + Math.sin(t * 5) * 0.015, 1 - Math.sin(t * 5) * 0.015); bigFace(g, 0, 0, 280, { outfit: VC, expr: T > tLi ? 'shocked' : 'blank', t, rimColor: '#9fd8ff' }); g.restore();
    g.strokeStyle = alpha('#fff', 0.35); g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(540, 820, 320 + i * 60 + (t * 60) % 60, 70 + i * 14, 0, 0, 7); g.stroke(); }
    veil(g, '#2a4aa0', 0.18); if (T > tLi) { const a = pop(T, W('nenhuma', L.n11)); g.save(); g.translate(540, 1240); g.scale(a, a); text(g, '0 LINHAS', 0, 0, { size: 128, color: '#ff4a6a', stroke: 22, strokeColor: INK }); g.restore(); } };
  mist(g, k, corre, ref);
}});
const linGrad2 = (g) => { const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#3a6ad8'); gr.addColorStop(1, '#1a2a6a'); return gr; };

// H — a cidade para: criança aponta, cochicho, guarda na lança; "não deveria existir"
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tPa = W('para', L.n12), tCr = W('criança', L.n12), tCo = W('cochicha', L.n12), tGu = W('guarda', L.n12), tPo = W('porque', L.n12), tEx = W('existir', L.n12);
  const px = lerp(-200, 900, (T - t0) / (tPo - t0 + 0.01) * 0.75);
  const cam = K(T, [[t0, foco(100, 1100, 1.5)], [tCr, foco(400, 1100, 1.8)], [tCo, foco(650, 1080, 1.7)], [tGu, foco(980, 1050, 1.8)], [tPo, foco(Math.min(px, 760) + 40, 1020, 2.0)], [info.shot.end, foco(Math.min(px, 760) + 40, 1000, 2.4)]]);
  cidade(g, t, cam, { noite: 0.2 }); const frio = T > tPa;
  layer(g, cam, 1, g => { const pp = [[200, 1, 'crianca'], [420, -1, 'mae'], [560, 1, 'a'], [700, -1, 'b'], [1050, -1, 'guarda']];
    for (const [x, f, k] of pp) { const kid = k === 'crianca'; const pose = kid && T > tCr ? POSES.point : k === 'guarda' && T > tGu ? { ...POSES.ready } : k === 'a' && T > tCo ? { ...POSES.talk, eF: [20, -160], hF: [30, -196] } : frio ? POSES.stand : walkPose(T * 2 + x);
      drawFigure(g, { x, y: GY + 200, s: kid ? 1.7 : 1.65, facing: x > px ? -1 : 1, outfit: kid ? { ...FG, kid: true } : FG, pose: breathe(pose, t, 1, x), expr: kid ? 'shocked' : k === 'guarda' ? 'suspicious' : 'disgust', t, marca: M(1 + (x % 3), ['#2a9dff', '#ff4a1a', '#b8743a', '#ffe23a'][x % 4]), emote: kid && T > tCr ? 'exclaim' : null, look: [x > px ? -1 : 1, 0] });
      if (k === 'guarda') { seg(g, [[x - 40, GY + 200 + 20], [x - 40, GY - 340]], 10, '#6a4a2a'); poly(g, [[x - 54, GY - 340], [x - 26, GY - 340], [x - 40, GY - 420]], '#c8ccd8'); } }
    
    drawFigure(g, { x: px, y: GY + 260, s: 1.75, facing: 1, outfit: VC, pose: T < tPo ? walkPose(T * 2) : breathe(POSES.stand, t, 1, 1), expr: T > tPo ? 'gulp' : 'nervous', look: [0.3, -0.1], t, emote: T > tGu ? 'sweat' : null }); });
  if (T > tCo && T < tPo) { balaoTxt(g, 330, 560, 'psiu...', pop(T, tCo)); balaoTxt(g, 720, 680, 'sem marca?!', pop(T, tCo + 0.3)); }
  if (T > tPo) { veil(g, '#3a0010', 0.35 * prog(T, tPo, tPo + 0.6)); if (T > tEx - 0.2) { const a = pop(T, tEx); g.save(); g.translate(540, 470); g.scale(a, a); text(g, 'NÃO DEVERIA', 0, 0, { size: 96, color: WH, stroke: 18, strokeColor: INK }); text(g, 'EXISTIR', 0, 110, { size: 128, color: '#ff3a4a', stroke: 22, strokeColor: INK }); g.restore(); } }
}});

// I — 3D: a Academia Real, Teste do Cristal; o garoto de linha vermelha incendeia o cristal
registerShot('I', { kind: '3d',
  init(T, info) { const st = T.stage({ sky: '#1a1036', fog: [30, 90], fogColor: '#2a1a46', keyColor: '#ffe8d0', keyIntensity: 2.2, keyPos: [-6, 18, 10], ambient: 1.4, ambientSky: '#b8a0ff', shadowSize: 20, fov: 42, bloom: 0.35, bloomThreshold: 0.95 });
    const sal = salao3D(T); st.add(sal);
    st.add(plateia3D(T));
    const boy = T.figure3D({ top: 'dress', color: '#c0283a', head: 'none' }, { rim: '#0b0b0d', pose: 'stand' }); boy.position.set(-1.9, 0, -6); st.add(boy);
    const eu = T.figure3D(VC, { rim: '#0b0b0d', pose: 'stand' }); eu.position.set(-4.2, 0, -2.5); eu.rotation.y = 0.5; st.add(eu);
    const dir = T.figure3D({ top: 'dress', color: '#4a3a8a', head: 'none' }, { rim: '#0b0b0d', pose: 'stand' }); dir.position.set(2.6, 0, -9); dir.rotation.y = Math.PI * 0.8; st.add(dir);
    return { stage: st, sal, boy, eu, THREE_V: T.THREE.Vector3, C: T.THREE.Color }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tFu = W('funciona', L.n13), tGa = L.n14[0], tFo = W('fogo', L.n14), tPl = W('plateia', L.n14), k = (x) => x - t0;
    T.dolly(s.stage.camera, lt, [[0, { pos: [0, 5, 24], look: [0, 4, -6], fov: 50 }], [k(tFu), { pos: [0.5, 3.8, 9], look: [0, 3.2, -6], fov: 44 }], [k(tGa), { pos: [0.6, 2.8, 1.2], look: [-1.6, 2.4, -6], fov: 40 }], [k(tFo) + 0.3, { pos: [1.2, 2.6, 0], look: [-0.6, 3.0, -6], fov: 42 }], [info.dur, { pos: [2.5, 4.5, 6], look: [0, 3, -6], fov: 50 }]]);
    const fogo = clamp((Tg - tFo + 0.1) / 0.4); s.sal.cristalMat.emissive.copy(new s.C('#4aa8ff').lerp(new s.C('#ff3a0a'), fogo)); s.sal.cristalMat.emissiveIntensity = 0.35 + 1.2 * fogo; s.sal.luz.color.copy(new s.C('#6ac8ff').lerp(new s.C('#ff5a1a'), fogo)); s.sal.luz.intensity = 12 + 60 * fogo;
    s.sal.cristal.rotation.y = Tg * 0.8; s.sal.cristal.position.y = 3.8 + Math.sin(Tg * 2) * 0.12;
    s.boy.setPose(Tg > tGa + 0.6 ? { ...POSES.stand, eF: [30, -150], hF: [62, -160] } : POSES.stand); s.eu.setPose(POSES.stand);
    if (Tg > tPl) { const sh = 0.06 * Math.sin(Tg * 40) * (1 - clamp((Tg - tPl) / 2)); s.stage.camera.position.x += sh; } },
  overlay(g, lt, info, s) { const Tg = info.globalT, L = info.L, tFo = W('fogo', L.n14), tPl = W('plateia', L.n14), tCr = W('cristal', L.n13);
    const [cx, cy] = proj(s, 0, 3.8, -6); if (Tg > tFo - 0.1) chamas(g, cx, cy + 40, 1.2, Tg, prog(Tg, tFo - 0.1, tFo + 0.3));
    if (Tg > tCr - 0.1 && Tg < W('funciona', L.n13) + 1.5) rotulo(g, 'TESTE DO CRISTAL', Tg - tCr + 0.1, 470, '#9fd8ff', 92);
    if (Tg > W('acende', L.n13) - 0.1 && Tg < L.n14[0]) { const cs = ['#ff4a1a', '#2a9dff', '#b8743a', '#e8f4ff', '#ffe23a']; cs.forEach((c, i) => { const a = pop(Tg, W('acende', L.n13) + i * 0.08); circle(g, 340 + i * 100, 1220, 34 * a, c); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(340 + i * 100, 1220, 34 * a, 0, 7); g.stroke(); }); }
    if (Tg > L.n14[0] && Tg < tFo + 0.6) { balaoTxt(g, 540, 560, '1 LINHA VERMELHA', pop(Tg, W('vermelha', L.n14)), '#ff8a6a'); }
    if (Tg > tPl - 0.1) { rotulo(g, 'A PLATEIA PIRA', Tg - tPl + 0.1, 470, '#ffd23a', 92); for (let i = 0; i < 30; i++) { const ph = ((Tg - tPl) * 0.8 + i * 0.037) % 1; poly(g, [[(i * 137) % 1080, ph * 1400 + 200], [(i * 137) % 1080 + 18, ph * 1400 + 210], [(i * 137) % 1080 + 8, ph * 1400 + 230]], ['#ff4a6a', '#ffd23a', '#2a9dff', '#4ade6a'][i % 4]); } } } });

// J — sua vez: a mão no cristal... nada. A sala ri.
registerShot('J', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tEn = W('encosta', L.n14), tNa = W('nada', L.n14), tFa = W('faisquinha', L.n14), tGa = W('gargalhada', L.n14);
  const k = ease.inOut(prog(T, tFa - 0.2, tFa + 0.2));
  const mao = (g) => { const cam = K(T, [[t0, foco(500, 1000, 1.2)], [tEn, foco(470, 900, 1.7)], [tNa, foco(460, 860, 2.0)]]); salao(g, t, cam, { publico: 1, silencio: T > tEn ? 0.6 : 0 });
    layer(g, cam, 1, g => { cristal(g, 540, GY + 100, 1.0, { cor: '#bfe8ff', brilho: T < tEn ? 0.4 : 0, morto: prog(T, tEn, tNa), t });
      drawFigure(g, { x: 340, y: GY + 120, s: 1.8, facing: 1, outfit: VC, pose: breathe(T > tEn - 0.3 ? { ...POSES.reach, eF: [50, -170], hF: [100, -200] } : POSES.stand, t, 1, 1), expr: T > tNa ? 'blank' : 'nervous', look: [1, -0.4], t, emote: T > tNa ? 'sweat' : null }); });
    if (T > tNa) rotulo(g, 'NADA.', T - tNa, 470, WH, 140); };
  const riso = (g) => { g.fillStyle = '#1a1036'; g.fillRect(0, 0, E.W, E.H); const z = 1 + 0.06 * (T - tFa);
    g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
    for (let r2 = 0; r2 < 4; r2++) for (let i = 0; i < 6; i++) { const x = 60 + i * 190 + (r2 % 2) * 90, y = 520 + r2 * 230; bigFace(g, x, y + Math.abs(Math.sin(t * 9 + i + r2)) * -16, 80, { outfit: FG, expr: 'joy', talk: 0.8 + 0.2 * Math.sin(t * 20 + i), t, marca: M(1 + ((i + r2) % 3), ['#ff4a1a', '#2a9dff', '#ffe23a', '#b8743a'][(i + r2) % 4], 0.6) }); }
    g.restore(); ['HAHAHA', 'KKKKK', 'SEM MARCA!', 'HAHA'].forEach((s2, i) => balaoTxt(g, [260, 820, 300, 780][i], [420, 520, 1180, 1260][i], s2, pop(T, tGa - 0.6 + i * 0.15)));
    if (T > tGa) rotulo(g, 'A SALA INTEIRA RI', T - tGa, 900, '#ff4a6a', 84); };
  mist(g, k, mao, riso);
}});

// K — o diretor bate o cajado; silêncio; o livro de mil anos; VAZIO; a página arrancada
registerShot('K', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tCj = W('cajado', L.n15), tCa = W('cala', L.n15), tLi = W('livro', L.n16), tDe = W('desenho', L.n16), tIg = W('igualzinho', L.n16), tVa = W('vazio', L.n16), tHi = W('história', L.n17), tMa = W('mais', L.n17), tAr = W('arrancada', L.n17);
  const k = ease.inOut(prog(T, tLi - 0.4, tLi + 0.1));
  const dir = (g) => { const cam = K(T, [[t0, foco(540, 1000, 1.3)], [tCj - 0.2, foco(640, 1000, 2.0)], [tCj + 0.3, foco(640, 1000, 1.6)], [tLi, foco(640, 980, 2.0)]]); const [dx, dy] = impacto(T, tCj, 20, 0.5); cam.x += dx; cam.y += dy;
    salao(g, t, cam, { publico: 1, riso: T < tCj ? 1 : 0, silencio: T > tCj ? 1 : 0 });
    layer(g, cam, 1, g => { cristal(g, 300, GY + 100, 0.8, { morto: 1, t, brilho: 0 });
      drawFigure(g, { x: 640, y: GY + 120, s: 1.9, facing: -1, outfit: DIRETOR, pose: breathe(T > tCj - 0.3 ? { ...POSES.stand, eB: [-20, -150], hB: [-40, -120] } : POSES.stand, t, 1, 5), expr: 'furious', t, marca: M(1, '#ffd76a', 1) });
      const hx = 640 - 40 * 1.9, sy = T > tCj - 0.3 && T < tCj ? -60 * (1 - prog(T, tCj - 0.3, tCj)) : 0; seg(g, [[hx + 10, GY + 120 - 380 + sy], [hx - 10, GY + 120 + sy]], 14, '#6a4a2a'); circle(g, hx + 10, GY + 120 - 400 + sy, 26, '#ffd76a'); glow(g, hx + 10, GY - 280 + sy, 140, '#ffd76a', 0.6);
      const hp = headPos({ x: 640, y: GY + 120, s: 1.9, facing: -1, pose: POSES.stand }); for (let i = 0; i < 9; i++) seg(g, [[hp[0] - 30 + i * 8, hp[1] + hp[2] * 0.5], [hp[0] - 40 + i * 10, hp[1] + hp[2] * 1.7 + (i % 2) * 10]], 7, '#e8e8f0');
      if (T > tCj) { const r2 = (T - tCj) * 1400; g.strokeStyle = alpha('#ffd76a', clamp(1 - (T - tCj) / 0.8)); g.lineWidth = 14; g.beginPath(); g.ellipse(hx, GY + 120, r2, r2 * 0.25, 0, 0, 7); g.stroke(); }
      drawFigure(g, { x: 200, y: GY + 180, s: 1.7, facing: 1, outfit: VC, pose: breathe(POSES.stand, t, 1, 1), expr: T > tCj ? 'shocked' : 'sad', t }); });
    if (T > tCa - 0.1) rotulo(g, 'SILÊNCIO.', T - tCa + 0.1, 470, WH, 110); };
  const livroS = (g) => { g.fillStyle = '#140a1a'; g.fillRect(0, 0, E.W, E.H); glow(g, 540, 900, 700, '#ffb84a', 0.25); vela(g, 140, 1450, t, 1.4); vela(g, 940, 1450, t, 1.4);
    const z = K(T, [[tLi, { z: 0.8, x: 0, y: 0 }], [tDe, { z: 1.0, x: -100, y: 0 }], [tIg, { z: 1.25, x: -200, y: 0 }], [tVa, { z: 1.35, x: -200, y: 30 }], [tHi, { z: 1.0, x: 0, y: 0 }], [tAr, { z: 1.4, x: 220, y: 0 }], [info.shot.end, { z: 1.5, x: 220, y: 0 }]]);
    g.save(); g.translate(540, 880); g.scale(z.z, z.z); g.translate(-z.x, -z.y); livro(g, 0, 0, 1.0, { k: prog(T, tDe - 0.2, tDe + 0.4), pagina: prog(T, tVa - 0.1, tVa + 0.3), rasgo: prog(T, tMa, tAr), t }); g.restore();
    if (T > tVa - 0.1 && T < tHi) { const a = pop(T, tVa); g.save(); g.translate(540, 470); g.scale(a, a); text(g, 'VAZIO', 0, 0, { size: 150, color: '#ffd76a', stroke: 24, strokeColor: INK }); g.restore(); }
    if (T > tHi && T < tAr - 0.2) rotulo(g, 'SÓ MAIS 1 NA HISTÓRIA', T - tHi, 470, WH, 70);
    if (T > tAr - 0.1) rotulo(g, 'ARRANCADA', T - tAr + 0.1, 1290, '#ff4a6a', 100); };
  mist(g, k, dir, livroS);
}});

// L — o miado: em cima da estante, o mesmo gato
registerShot('L', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tMi = W('miado', L.n18), tEs = W('estante', L.n18), tGa = W('gato', L.n18);
  const cam = K(T, [[t0, foco(540, 1000, 1.2)], [tMi, foco(540, 900, 1.3)], [tEs, foco(700, 140, 1.5, 0.7)], [tGa, foco(700, 120, 2.3, 0.7)], [info.shot.end + 0.6, foco(700, 110, 2.8, 0.7)]]);
  biblioteca(g, t, cam);
  layer(g, cam, 0.7, g => { gato(g, 700, GY - 1200, 0.9, { t, olhos: prog(T, tEs, tGa + 0.5), piscar: false }); vela(g, 980, GY - 1200, t, 1.2); });
  layer(g, cam, 1, g => drawFigure(g, { x: 420, y: GY + 160, s: 1.8, facing: 1, outfit: VC, pose: breathe(POSES.stand, t, 1, 1), expr: T > tGa ? 'shocked' : 'suspicious', look: [0.6, -1], t, emote: T > tGa ? 'exclaim' : T > tMi ? 'question' : null }));
  veil(g, '#0a0410', 0.2 * prog(T, tGa, tGa + 1)); if (T > tMi - 0.1 && T < tEs) balaoTxt(g, 540, 600, 'miau.', pop(T, tMi));
}});

// T — título · Kc — siga a página
registerShot('T', { draw(g, t) { g.fillStyle = '#06030c'; g.fillRect(0, 0, E.W, E.H); glow(g, 540, 900, 600, '#a64bff', 0.2 + 0.05 * Math.sin(t * 4)); FX.stars(g, t, { count: 80, seed: 2, area: [0, 0, E.W, E.H] });
  const z = 1 + 0.04 * t; g.save(); g.translate(540, 880); g.scale(z, z);
  const a1 = ease.out(prog(t, 0.05, 0.35)), a2 = ease.outBack(prog(t, 0.2, 0.55)), a3 = ease.out(prog(t, 0.5, 0.8));
  text(g, 'SEM MARCA', 0, -150, { size: 150, color: WH, stroke: 22, strokeColor: INK, alpha: a1 }); g.save(); g.scale(a2, a2); text(g, 'EP. 1', 0, 10, { size: 60, color: '#ffd23a', font: FONTS.ui, weight: 900, spacing: 8 }); text(g, 'O VAZIO', 0, 120, { size: 120, color: '#c88aff', stroke: 20, strokeColor: INK }); g.restore();
  g.restore(); } });
registerShot('Kc', { draw(g, t) { UI.seguir(g, t, { proximo: 'EP. 2 — A PÁGINA ARRANCADA', outfit: VC }); } });
