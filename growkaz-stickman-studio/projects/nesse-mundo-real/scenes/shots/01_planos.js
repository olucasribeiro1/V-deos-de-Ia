// NESSE MUNDO, SÓ O SEU REAL NÃO FOI TROCADO · 2D, câmera sempre andando, dissolves suaves
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, rr, seg, poly, circle, glow, alpha, mix, text, FONTS, rng, linGrad } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import { drawHumano as drawFigure, bigHumano as bigFace, PROTAGONISTA_A, JOVEM_MOLETOM, SENHORA, MOCA, TRABALHADOR, CHEFE_ANJO } from '/engine/humano2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { foco, K } from '/series/mamae/camera.js';
import { W, mist, rotulo, legendaTopo } from '/series/mamae/comum.js';
import { globo } from '/series/ese/mundo.js';
import { cadeado, barraOuro, glitch, rotuloTecnico } from '/series/semmarca/hud.js';
import { INK, GY, WH, box, ANJO, MANOEL, MAE, ceu, mesaAnjo, anjo, asas, aureola, quarto, padaria, caderno, moeda, porquinho, nota, fachada, mercado } from '/series/nessemundo/cenas.js';
const GUI = PROTAGONISTA_A; const FG = JOVEM_MOLETOM; const FILA = [JOVEM_MOLETOM, SENHORA, MOCA, TRABALHADOR, JOVEM_MOLETOM, SENHORA];
const pop = (T, t0, d = 0.25) => ease.outBack(prog(T, t0 - 0.1, t0 + d));
const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
const hudSaldo = (g, T, v, o = {}) => { const a = o.a ?? 1; if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(540, o.y ?? 300); rr(g, -330, -70, 660, 140, 30); g.fillStyle = 'rgba(10,14,30,.88)'; g.fill(); g.strokeStyle = '#ffd23a'; g.lineWidth = 5; g.stroke();
  text(g, 'SALDO DO GUILHERME', -300, -34, { size: 28, color: '#ffd23a', font: FONTS.ui, weight: 900, align: 'left' }); text(g, brl(v), -300, 22, { size: 64, color: '#fff', font: FONTS.title, align: 'left' }); if (o.mult) text(g, '×10/DIA', 300, 22, { size: 40, color: '#7dff4a', font: FONTS.ui, weight: 900, align: 'right' }); g.restore(); };
const onda = (g, T, t0, cor = '#ffd76a') => { const k = prog(T, t0, t0 + 1.2); if (k <= 0 || k >= 1) return; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha(cor, 1 - k); g.lineWidth = 40 * (1 - k) + 6; g.beginPath(); g.arc(540, 900, k * 1600, 0, 7); g.stroke(); g.restore(); };

// A — "Nesse mundo, existe um anjo..." do céu até o escritório celestial; aperta ATUALIZAR MOEDA
registerShot('A', { draw(g, t, info) { const T = info.globalT, L = info.L, tAn = W('anjo', L.n01), tTr = W('trocar', L.n01);
  const cam = K(T, [[0, foco(540, 300, 0.75)], [tAn, foco(540, 900, 1.0)], [tTr, foco(560, 1000, 1.5)], [info.shot.end, foco(600, 1050, 1.8)]]);
  ceu(g, t, cam);
  layer(g, cam, 1, g => { mesaAnjo(g, 600, GY - 60, t, { alerta: T > tTr + 0.4 ? 1 : 0 }); anjo(g, 330, GY + 120, 1.6, t, { pose: T > tTr - 0.2 ? { ...POSES.reach, eF: [40, -160], hF: [86, -176] } : POSES.stand, expr: T > tTr ? 'proud' : 'smile', look: [1, -0.2] });
    if (T > tTr - 0.2) { const a = pop(T, tTr - 0.1); g.save(); g.translate(600, GY - 160); g.scale(a, a); rr(g, -150, -40, 300, 80, 40); g.fillStyle = '#2a9d5a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); text(g, 'ATUALIZAR MOEDA', 0, 3, { size: 30, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore(); } });
  if (T < tAn + 0.3) rotulo(g, 'NESSE MUNDO...', T - 0.3, 470, '#ffd23a', 110);
  if (T > tAn - 0.1 && T < tTr) legendaTopo(g, 'ANJO DA ECONOMIA', 360); } });

// B — a troca: onda dourada na Terra, etiquetas perdem 4 zeros (ninguém ficou mais pobre)
registerShot('B', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tCo = W('cortou', L.n02), tPa = W('pão', L.n02), tNi = W('ninguém', L.n02);
  const k = ease.inOut(prog(T, tCo + 0.6, tCo + 1.1));
  const terra = (g) => { g.fillStyle = '#05061a'; g.fillRect(0, 0, E.W, E.H); FX.stars(g, t, { count: 140, seed: 9, area: [0, 0, E.W, E.H] }); const z = 1 + 0.15 * (T - t0); globo(g, 540, 900, 380 * z, t, { l0: -50 + (T - t0) * 8, p0: -10 }); onda(g, T, t0 + 0.1); text(g, '÷ 10.000', 540, 360, { size: 120, color: '#ffd23a', stroke: 20, strokeColor: INK, alpha: prog(T, t0 + 0.2, t0 + 0.5) }); };
  const merc = (g) => { const cam = K(T, [[tCo + 0.6, foco(300, 900, 1.15)], [tPa, foco(540, 1050, 0.95)], [info.shot.end, foco(560, 1050, 1.05)]]); mercado(g, t, cam, { corte: prog(T, tCo + 1.0, tPa + 0.6) * 1.6 });
    if (T > W('salário', L.n02) - 0.1 && T < tNi) { ['SALÁRIO', 'PREÇO', 'POUPANÇA'].forEach((s2, i) => { const ti = W(['salário', 'preço', 'poupança'][i], L.n02); if (T > ti - 0.1) rotulo(g, s2 + ' ÷ 10.000', T - ti, 400 + i * 90, ['#7dff4a', '#ffd23a', '#9fd8ff'][i], 56); }); }
    if (T > tNi - 0.1) { const a = pop(T, tNi); g.save(); g.translate(540, 420); g.scale(a, a); rr(g, -390, -80, 780, 160, 40); g.fillStyle = '#2a9d5a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); text(g, 'NINGUÉM FICOU', 0, -24, { size: 54, color: '#fff', font: FONTS.title }); text(g, 'MAIS POBRE', 0, 36, { size: 54, color: '#ffd23a', font: FONTS.title }); g.restore(); } };
  mist(g, k, terra, merc); } });

// C — dado histórico: 5 moedas em 8 anos (linha do tempo andando)
registerShot('C', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0d3a1e', '#1a6a3a', '#ffd23a']); g.fillRect(0, 0, E.W, E.H); for (let i = 0; i < 40; i++) { const ph = (t * 0.2 + i * 0.07) % 1; circle(g, (i * 271) % 1080, 1920 - ph * 2000, 4, alpha('#fff6c0', 0.5)); }
  const moedas = [['CRUZADO', '1986', '#4a7ad8'], ['CRUZADO NOVO', '1989', '#2a9d8a'], ['CRUZEIRO', '1990', '#8a4ab8'], ['CRUZEIRO REAL', '1993', '#d87a2a'], ['REAL', '1994', '#2a9d5a']];
  const tw = [W('cruzado', L.n03), W('novo', L.n03), W('cruzeiro', L.n03), W('cruzeiro', L.n03, 2), W('real', L.n03)];
  let foc = -1; tw.forEach((tt, i) => { if (T > tt - 0.2) foc = i; });
  const camX = foc < 0 ? -200 : lerp(foc === 0 ? -200 : (foc - 1) * 520, foc * 520, ease.inOut(prog(T, tw[Math.max(0, foc)] - 0.25, tw[Math.max(0, foc)] + 0.15)));
  g.save(); g.translate(540 - camX, 0); seg(g, [[-400, 1100], [3000, 1100]], 10, '#ffd23a');
  moedas.forEach(([n, a, c], i) => { const x = i * 520, ap = pop(T, tw[i] - 0.1); circle(g, x, 1100, 22, INK); circle(g, x, 1100, 16, T > tw[i] ? '#ffd23a' : '#5a5a64'); if (ap > 0) { nota(g, x, 870 - Math.sin(t * 2 + i) * 10, 1.25 * ap, -0.06 + i * 0.03, c, n, a); if (i < 4 && T > tw[i + 1] - 0.1) { g.save(); g.translate(x, 870); g.rotate(-0.3); rr(g, -130, -30, 260, 60, 10); g.strokeStyle = '#d8342b'; g.lineWidth = 8; g.stroke(); text(g, 'TROCADA', 0, 3, { size: 40, color: '#d8342b', font: FONTS.title }); g.restore(); } } });
  g.restore();
  if (T < tw[0] - 0.2) { rotulo(g, 'O BRASIL', T - t0, 520, WH, 110); if (T > W('verdade', L.n03)) rotulo(g, 'FEZ DE VERDADE', T - W('verdade', L.n03), 640, '#ffd23a', 90); }
  if (T > W('cinco', L.n03) - 0.1) { const a = pop(T, W('cinco', L.n03)); g.save(); g.translate(540, 420); g.scale(a, a); text(g, '5 MOEDAS', 0, 0, { size: 120, color: '#ffd23a', stroke: 22, strokeColor: INK }); text(g, 'EM 8 ANOS', 0, 104, { size: 70, color: WH, stroke: 14, strokeColor: INK }); g.restore(); }
  if (T > tw[4] + 0.3) { const a = pop(T, tw[4] + 0.3); g.save(); g.translate(540, 1420); g.scale(a, a); rr(g, -330, -50, 660, 100, 26); g.fillStyle = 'rgba(10,14,30,.85)'; g.fill(); text(g, '1 REAL = 2.750 CRUZEIROS REAIS', 0, 4, { size: 36, color: '#ffd23a', font: FONTS.ui, weight: 900 }); g.restore(); } } });

// D — o anjo esqueceu um: a linha vermelha → o Guilherme no sofá → "Hm... deve ser nada" (anjo em janelinha)
registerShot('D', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tGu = W('guilherme', L.n04), tVi = W('videogame', L.n04), tFi = W('fiado', L.n04), tA = L.a1[0];
  const k = ease.inOut(prog(T, tGu - 0.3, tGu + 0.2));
  const ceuS = (g) => { const cam = K(T, [[t0, foco(600, 1000, 1.15)], [tGu, foco(600, 980, 1.7)]]); ceu(g, t, cam); layer(g, cam, 1, g => mesaAnjo(g, 600, GY - 60, t, { linhaVermelha: 1 })); };
  const sala = (g) => { const cam = K(T, [[tGu - 0.3, foco(360, 1050, 1.5)], [tVi, foco(380, 1100, 1.7)], [tFi - 0.3, foco(560, 1150, 2.1)], [info.shot.end, foco(500, 1100, 1.6)]]); quarto(g, t, cam, { dia: 0 });
    layer(g, cam, 0.85, g => { drawFigure(g, { x: 330, y: GY - 60, s: 1.7, facing: 1, outfit: GUI, pose: breathe({ ...POSES.sit, eF: [30, -140], hF: [52, -150], eB: [20, -140], hB: [40, -150] }, t, 1, 1), expr: T > tFi ? 'forced' : 'joy', look: [1, -0.3], t, emote: T > tFi ? 'sweat' : null });
      box(g, 380, GY - 220, 60, 36, '#2a2a34', 12, 4); caderno(g, 600, GY + 160, 0.9 * pop(T, tFi), t); });
    if (T > tGu - 0.1 && T < tA) { legendaTopo(g, 'GUILHERME · 19 ANOS', 360); }
    if (T > tA - 0.2) { const a = pop(T, tA - 0.2); g.save(); g.translate(790, 520); g.scale(a, a); rr(g, -220, -220, 440, 440, 40); g.fillStyle = '#bfe4ff'; g.fill(); g.strokeStyle = '#ffd76a'; g.lineWidth = 10; g.stroke(); g.save(); rr(g, -210, -210, 420, 420, 34); g.clip(); bigFace(g, 0, 40, 150, { outfit: ANJO, expr: 'forced', t, talk: Math.max(0, Math.sin(t * 14)) * 0.6 * (T < L.a1[1] ? 1 : 0), emote: 'sweat' }); aureola(g, 0, -150, 2.2, t); g.restore(); text(g, '"deve ser nada"', 0, 270, { size: 34, color: WH, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK }); g.restore(); } };
  mist(g, k, ceuS, sala); } });

// E — a padaria: a moeda de 1 real vale R$ 10.000; o padeiro surta
registerShot('E', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tUm = W('real', L.n05), tDe = W('dez', L.n05), tM = L.m1[0], tFo = W('forno', L.m1);
  const cam = K(T, [[t0, foco(200, 1000, 1.2)], [tUm - 0.3, foco(620, 1000, 1.6)], [tDe, foco(760, 950, 2.2)], [tM, foco(860, 880, 2.0)], [info.shot.end, foco(820, 900, 1.6)]]);
  padaria(g, t, cam);
  layer(g, cam, 0.85, g => { const gx = lerp(-100, 560, ease.out(prog(T, t0, tUm - 0.4))); drawFigure(g, { x: 940, y: GY + 20, s: 1.7, facing: -1, outfit: MANOEL, pose: breathe(T > tM ? POSES.handsOnHead : POSES.stand, t, 1, 3), expr: T > tM ? 'shocked' : 'suspicious', talk: T > tM && T < L.m1[1] ? Math.max(0, Math.sin(t * 13)) : 0, t, emote: T > tM ? 'shock' : null });
    if (T > tM && T < tM + 1.2) { const ph = (T - tM) / 1.2; for (let i = 0; i < 5; i++) { g.fillStyle = INK; g.beginPath(); g.ellipse(880 + i * 30, GY - 300 + ph * 380 + i * 20, 30, 18, ph * 3 + i, 0, 7); g.fill(); g.fillStyle = '#ffb46a'; g.beginPath(); g.ellipse(880 + i * 30, GY - 300 + ph * 380 + i * 20, 25, 13, ph * 3 + i, 0, 7); g.fill(); } }
    drawFigure(g, { x: gx, y: GY + 60, s: 1.7, facing: 1, outfit: GUI, pose: T < tUm - 0.4 ? walkPose(T * 2.2) : breathe({ ...POSES.reach, eF: [40, -150], hF: [90, -160] }, t, 1, 1), expr: T > tM ? 'blank' : 'smile', t, emote: T > tFo ? 'question' : null });
    if (T > tUm - 0.4) moeda(g, 720, GY - 210, 34 * pop(T, tUm - 0.4), t, { brilho: 0.8 }); });
  if (T > tDe - 0.1) { const a = pop(T, tDe); g.save(); g.translate(540, 400); g.scale(a, a); text(g, 'R$ 1', -250, 0, { size: 110, color: '#ffd23a', stroke: 20, strokeColor: INK }); text(g, '=', 0, 0, { size: 100, color: WH, stroke: 18, strokeColor: INK }); text(g, 'R$ 10.000', 0, 120, { size: 120, color: '#7dff4a', stroke: 22, strokeColor: INK }); g.restore(); } } });

// F — a regra secreta: HUD de jogo, ×10 por dia, gastou = trava
registerShot('F', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tMu = W('multiplicava', L.n06), tGa = W('gastasse', L.n06), tTr = W('trava', L.n06);
  const cam = K(T, [[t0, foco(500, 1050, 1.8)], [info.shot.end, foco(500, 1000, 2.4)]]); quarto(g, t, cam, { dia: 0 }); veil(g, '#060a1a', 0.62);
  layer(g, cam, 1, g => moeda(g, 520, 1000, 70, t, { brilho: 1 }));
  g.save(); g.translate(540, 980); const z = 1 + 0.03 * Math.sin(t * 2); g.scale(z, z); g.restore();
  hudSaldo(g, T, 1, { a: pop(T, t0 + 0.1), y: 330, mult: T > tMu });
  if (T > tMu - 0.1) { const a = pop(T, tMu); g.save(); g.translate(540, 560); g.scale(a, a); text(g, '×10', 0, 0, { size: 170, color: '#7dff4a', stroke: 26, strokeColor: INK }); text(g, 'TODO DIA', 0, 120, { size: 60, color: WH, stroke: 14, strokeColor: INK }); g.restore(); }
  if (T > tGa - 0.1) { const a = pop(T, tGa); g.save(); g.translate(540, 1170); g.scale(a, a); rr(g, -360, -70, 720, 140, 34); g.fillStyle = 'rgba(80,10,20,.9)'; g.fill(); g.strokeStyle = '#ff4a4a'; g.lineWidth = 6; g.stroke(); text(g, '⚠ GASTOU 1 CENTAVO = TRAVA', 0, 4, { size: 40, color: '#ffb0b0', font: FONTS.ui, weight: 900 }); g.restore(); }
  if (T > tTr - 0.1) { cadeado(g, 540, 940, 110 * pop(T, tTr)); if (T < tTr + 0.4) glitch(g, 0.6 * (1 - (T - tTr) / 0.4), Math.floor(T * 24)); } } });

// G — os dias: calendário virando, contador explodindo, miojo, micro-ondas vendido, mãe brava, cofrinho acorrentado
registerShot('G', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start;
  const td = [W('um', L.n07), W('dois', L.n07), W('três', L.n07), W('quatro', L.n08)], tMi = W('miojo', L.n07), tVe = W('vende', L.n07), tMa = L.ma1[0], tCo = W('cofrinho', L.n08);
  let dia = 0; td.forEach((tt, i) => { if (T > tt - 0.1) dia = i + 1; }); const saldo = dia ? Math.pow(10, dia + 3) : 1;
  const cam = K(T, [[t0, foco(300, 1000, 1.5)], [td[1], foco(420, 1100, 1.7)], [tVe - 0.2, foco(900, 1050, 1.6)], [tMa, foco(760, 1000, 1.4)], [td[3], foco(480, 1150, 1.9)], [info.shot.end, foco(480, 1150, 2.4)]]);
  quarto(g, t, cam, { dia, vazio: T > tVe ? 1 : 0 });
  layer(g, cam, 0.85, g => { const magro = Math.min(dia, 3) * 0.05; drawFigure(g, { x: 330, y: GY - 60, s: 1.7, facing: 1, outfit: GUI, pose: breathe(T > tMi && T < td[2] ? { ...POSES.sit, eF: [30, -150], hF: [40, -196] } : POSES.sit, t, 1 + magro * 6, 1), expr: dia >= 4 ? 'proud' : dia >= 2 ? 'sad' : 'determined', look: [1, 0], t, emote: dia === 2 ? 'gloom' : dia >= 4 ? 'sparkle' : null });
    if (T > tMi - 0.2 && T < td[2]) { box(g, 360, GY - 300, 90, 60, '#ffd23a', 8, 4); text(g, 'MIOJO', 405, GY - 270, { size: 18, color: '#c0283a', font: FONTS.ui, weight: 900 }); }
    if (T > tVe - 0.2 && T < td[3]) { const mx = lerp(1300, 900, ease.out(prog(T, tVe - 0.2, tVe + 0.5))); drawFigure(g, { x: mx, y: GY + 40, s: 1.6, facing: -1, outfit: MAE, pose: T > tMa ? POSES.point : walkPose(T * 2), expr: T > tMa ? 'furious' : 'sad', talk: T > tMa && T < L.ma1[1] ? Math.max(0, Math.sin(t * 14)) : 0, t, emote: T > tMa ? 'anger' : null }); if (T < tMa) { box(g, mx - 120, GY - 330, 180, 140, '#d8d8e0', 10); text(g, 'VENDE-SE', mx - 30, GY - 360, { size: 26, color: '#c0283a', font: FONTS.ui, weight: 900 }); } }
    if (T > tCo - 0.3) porquinho(g, 560, GY + 60, 1.0 * pop(T, tCo - 0.3), t, { corrente: true }); });
  if (dia > 0) { hudSaldo(g, T, saldo, { y: 330, mult: true }); const kk = prog(T, td[dia - 1] - 0.1, td[dia - 1] + 0.3); if (kk < 1) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 540, 330, 500, '#7dff4a', 0.6 * (1 - kk)); g.restore(); }
    rotulo(g, 'DIA ' + dia, T - td[dia - 1], 520, WH, 110); }
  if (T > td[3] + 0.3) { const a = pop(T, td[3] + 0.3); g.save(); g.translate(540, 1420); g.scale(a, a); text(g, '10 MILHÕES', 0, 0, { size: 96, color: '#ffd23a', stroke: 18, strokeColor: INK }); g.restore(); } } });

// H — o medo e a escolha: menu de jogo sobre o rosto; seleciona COMPRAR A PADARIA
registerShot('H', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tMe = W('medo', L.n09), tJo = W('jogou', L.n09);
  g.fillStyle = '#0a1030'; g.fillRect(0, 0, E.W, E.H); glow(g, 540, 1000, 800, '#2a5ad8', 0.4); const z = 1 + 0.08 * (T - t0) / info.dur;
  g.save(); g.translate(540, 1150); g.scale(z, z); bigFace(g, 0, 0, 300, { outfit: GUI, expr: T > tJo ? 'determined' : 'nervous', look: [0, -0.5], t, emote: T < tJo ? 'sweat' : null, rimColor: '#ffd23a' }); g.restore();
  if (T > tMe) { const a = pop(T, tMe); g.save(); g.translate(540, 300); g.scale(a, a); text(g, 'E SE O ANJO PERCEBER?', 0, 0, { size: 52, color: '#ff8a8a', stroke: 12, strokeColor: INK, font: FONTS.ui, weight: 900 }); g.restore(); }
  const ops = ['🎮 TORRAR TUDO', '⏳ ESPERAR MAIS UM DIA', '🍞 COMPRAR A PADARIA']; const t1 = tMe + 0.6;
  ops.forEach((s2, i) => { const a = pop(T, t1 + i * 0.2); if (a <= 0) return; const sel = T > tJo - 0.2 && i === 2, cur = T > tJo - 1.2 ? (T > tJo - 0.2 ? 2 : Math.floor((T - (tJo - 1.2)) * 3) % 3) : -1; g.save(); g.translate(540, 470 + i * 130); g.scale(a * (sel ? 1.08 : 1), a * (sel ? 1.08 : 1)); rr(g, -380, -52, 760, 104, 24); g.fillStyle = sel ? '#2a9d5a' : cur === i ? 'rgba(80,90,140,.95)' : 'rgba(14,18,40,.9)'; g.fill(); g.strokeStyle = sel ? '#7dff4a' : '#7fd8ff'; g.lineWidth = 5; g.stroke(); text(g, s2, -340, 4, { size: 44, color: '#fff', font: FONTS.ui, weight: 900, align: 'left' }); if (cur === i || sel) text(g, '▶', -420, 4, { size: 44, color: '#ffd23a', font: FONTS.ui, weight: 900 }); g.restore(); });
  if (T > tJo) rotulo(g, 'JOGOU CERTO', T - tJo, 900, '#7dff4a', 100); } });

// I — a jogada: placa nova subindo, fiado pegando fogo, Seu Manoel gerente
registerShot('I', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tPa = W('padaria', L.n10), tTe = W('terreno', L.n10), tFi = W('fiado', L.n10), tCr = W('crachá', L.n10), tM = L.m2[0];
  const cam = K(T, [[t0, foco(540, 900, 1.0)], [tTe, foco(900, 1000, 0.9)], [tFi - 0.2, foco(540, 1150, 1.5)], [tCr, foco(760, 1050, 1.8)], [info.shot.end, foco(760, 1000, 2.1)]]);
  fachada(g, t, cam, { placa: T > tPa ? 'PADARIA DO GUILHERME' : 'PADARIA DO SEU MANOEL', sobe: T > tPa ? prog(T, tPa, tPa + 0.6) : 1 });
  layer(g, cam, 0.85, g => { if (T > tTe - 0.1) { const a = pop(T, tTe); g.save(); g.translate(1150, GY - 80); g.scale(a, a); box(g, -40, -260, 20, 260, '#8a5a30', 4, 4); box(g, -160, -340, 260, 110, '#ffffff', 10); text(g, 'VENDIDO', -30, -284, { size: 44, color: '#c0283a', font: FONTS.title }); g.restore(); }
    drawFigure(g, { x: 430, y: GY + 120, s: 1.7, facing: 1, outfit: GUI, pose: breathe(T > tFi ? { ...POSES.stand, eF: [30, -170], hF: [44, -214] } : POSES.proud || POSES.stand, t, 1, 1), expr: 'proud', t, emote: 'sparkle' });
    drawFigure(g, { x: 760, y: GY + 120, s: 1.7, facing: -1, outfit: { ...MANOEL }, pose: breathe(T > tM ? POSES.cheer : POSES.stand, t, 1, 3), expr: T > tM ? 'cry' : 'joy', talk: T > tM && T < L.m2[1] ? Math.max(0, Math.sin(t * 13)) : 0, t, emote: T > tM ? 'sparkle' : null });
    if (T > tCr - 0.1) { const a = pop(T, tCr); g.save(); g.translate(774, GY - 150); g.scale(a, a); box(g, -42, -26, 84, 52, '#ffffff', 6, 4); g.fillStyle = '#2a5ad8'; g.fillRect(-38, -22, 76, 12); text(g, 'GERENTE', 0, 8, { size: 14, color: INK, font: FONTS.ui, weight: 900 }); g.restore(); }
    if (T > tFi - 0.2) caderno(g, 600, GY + 110, 0.85, t, { valor: 'PAGO ✓', fogo: prog(T, tFi, tFi + 0.8) }); });
  if (T > tPa - 0.1 && T < tTe) rotulo(g, 'COMPROU A PADARIA', T - tPa + 0.1, 420, '#ffd23a', 84); if (T > tFi - 0.1 && T < tCr) rotulo(g, 'FIADO DA RUA: PAGO', T - tFi + 0.1, 420, '#7dff4a', 80); } });

// J — a aula: inflação (preço do pão subindo) + Brasil 1993 (remarcadora)
registerShot('J', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tMi = W('milhões', L.n11), tPr = W('preço', L.n11), tIn = W('inflação', L.n11), t93 = L.n12[0], tRe = W('remarcava', L.n12), tCo = W('coisa', L.n12);
  const k = ease.inOut(prog(T, t93 - 0.3, t93 + 0.2));
  const aula = (g) => { const cam = K(T, [[t0, foco(540, 1000, 1.0)], [tIn, foco(540, 950, 1.15)]]); padaria(g, t, cam, { placa: 'PADARIA DO GUILHERME' }); veil(g, '#0a1030', 0.35);
    const notas = clamp((T - tMi) / 1.5); for (let i = 0; i < 30 * notas; i++) { const ph = (t * 0.6 + i * 0.13) % 1; g.save(); g.translate((i * 197) % 1080, -100 + ph * 1900); g.rotate(i + t); box(g, -50, -24, 100, 48, '#7fd69a', 6, 3); g.restore(); }
    const preco = T < tPr ? 0.5 : 0.5 * Math.pow(10, clamp((T - tPr) / 2.4) * 2); g.save(); g.translate(540, 1000); const sc = 1 + 0.06 * Math.sin(t * 8); g.scale(sc, sc); rr(g, -260, -150, 520, 300, 30); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); text(g, 'PÃO FRANCÊS', 0, -80, { size: 40, color: INK, font: FONTS.ui, weight: 900 }); text(g, 'R$ ' + preco.toFixed(2).replace('.', ','), 0, 30, { size: 96, color: T > tPr ? '#c0283a' : INK, font: FONTS.title }); g.restore();
    if (T > tPr) for (let i = 0; i < 3; i++) { const ph = ((T - tPr) * 1.2 + i / 3) % 1; text(g, '▲', 820, 1040 - ph * 200, { size: 60, color: alpha('#ff4a4a', 1 - ph), font: FONTS.ui, weight: 900 }); }
    rotuloTecnico(g, T, { t0: tMi + 0.3, t1: tIn + 2.4, px: 540, py: 860, lx: 540, ly: 520, titulo: 'MAIS DINHEIRO, MESMO PÃO', valor: 'PREÇO ↑', unidade: '', linhas: ['muito dinheiro correndo', 'atrás de pouca coisa'] });
    if (T > tIn - 0.1) rotulo(g, 'INFLAÇÃO', T - tIn + 0.1, 1340, '#ff4a4a', 120); };
  const br93 = (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a1a0a', '#5a3a1a', '#8a5a2a']); g.fillRect(0, 0, E.W, E.H); const z = 1 + 0.05 * (T - t93);
    g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
    for (let r = 0; r < 3; r++) { box(g, 60, 600 + r * 260, 960, 20, '#8a5a30', 4, 4); for (let i = 0; i < 6; i++) { box(g, 90 + i * 155, 470 + r * 260, 120, 130, ['#ff4a6a', '#2a9dff', '#ffd23a', '#38d46a', '#ff8a2a', '#a64bff'][(i + r) % 6], 6, 4); const n = Math.floor((T - t93) * 2 + i + r) % 3; for (let k2 = 0; k2 <= n; k2++) { rr(g, 100 + i * 155 + k2 * 6, 560 + r * 260 - k2 * 14, 90, 30, 4); g.fillStyle = k2 === n ? '#fff2a0' : '#e8e2d0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); } } }
    const mx = 540 + Math.sin(t * 3) * 300; box(g, mx - 70, 330, 140, 90, '#5a5a64', 16, 6); box(g, mx - 30, 420, 60, 70, '#3a3a44', 8, 5); text(g, 'REMARCADORA', mx, 300, { size: 26, color: '#fff2a0', font: FONTS.ui, weight: 900, stroke: 6, strokeColor: INK }); g.restore();
    const a = pop(T, t93 + 0.4); g.save(); g.translate(540, 380); g.scale(a, a); rr(g, -360, -90, 720, 180, 30); g.fillStyle = 'rgba(10,8,4,.88)'; g.fill(); g.strokeStyle = '#ffd23a'; g.lineWidth = 6; g.stroke(); text(g, 'BRASIL · 1993', 0, -36, { size: 46, color: '#ffd23a', font: FONTS.ui, weight: 900 }); text(g, '+2.477% NO ANO', 0, 36, { size: 72, color: '#ff6a4a', font: FONTS.title }); g.restore();
    if (T > tRe - 0.1 && T < tCo) rotulo(g, 'ETIQUETA NOVA TODO DIA', T - tRe + 0.1, 1340, WH, 66);
    if (T > tCo - 0.2) { const a2 = pop(T, tCo - 0.2); g.save(); g.translate(540, 1320); g.scale(a2, a2); rr(g, -380, -60, 760, 120, 30); g.fillStyle = '#2a9d5a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); text(g, 'DINHEIRO → PATRIMÔNIO', 0, 4, { size: 50, color: '#fff', font: FONTS.title }); g.restore(); } };
  mist(g, k, aula, br93); } });

// K — o chefe acha o erro: "Estagiário." / "...Ctrl Z?" e a onda volta
registerShot('K', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tCh = W('chefe', L.n13), tC = L.c1[0], tA = L.a2[0];
  const cam = K(T, [[t0, foco(540, 900, 0.9)], [tCh, foco(600, 1000, 1.3)], [tC, foco(560, 900, 1.0)], [tA, foco(420, 1150, 2.0)], [info.shot.end, foco(460, 1100, 1.7)]]);
  ceu(g, t, cam, { noite: 1 });
  layer(g, cam, 0.6, g => { if (T > tCh - 0.3) { const a = clamp((T - tCh + 0.3) / 0.6); g.save(); g.globalAlpha *= a; g.fillStyle = '#05030a'; g.beginPath(); g.ellipse(560, 600, 520, 700, 0, 0, 7); g.fill(); for (const sx of [-1, 1]) { circle(g, 560 + sx * 150, 420, 46, '#ffd76a'); glow(g, 560 + sx * 150, 420, 160, '#ffd76a', 0.6); } g.strokeStyle = '#ffd76a'; g.lineWidth = 16; g.shadowColor = '#ffd76a'; g.shadowBlur = 30; g.beginPath(); g.ellipse(560, 150, 220, 50, 0, 0, 7); g.stroke(); g.restore(); } });
  layer(g, cam, 1, g => { mesaAnjo(g, 600, GY - 60, t, { linhaVermelha: 1, noite: 1 }); anjo(g, 360, GY + 120, 1.6, t, { pose: T > tA - 0.3 ? { ...POSES.reach, eF: [40, -160], hF: [86, -176] } : POSES.scared || POSES.stand, expr: T > tC ? 'terrified' : 'gulp', look: [0.4, -1], emote: T > tC ? 'sweat' : null, talk: T > tA && T < L.a2[1] ? Math.max(0, Math.sin(t * 14)) : 0 }); });
  if (T > tC - 0.1 && T < tA) { const a = pop(T, tC); g.save(); g.translate(540, 1240); g.scale(a, a); text(g, '"ESTAGIÁRIO."', 0, 0, { size: 100, color: '#ffd76a', stroke: 20, strokeColor: INK }); g.restore(); }
  if (T > tA + 0.4) { onda(g, T, tA + 0.4, '#7fd8ff'); const a = pop(T, tA + 0.4); g.save(); g.translate(540, 420); g.scale(a, a); rr(g, -200, -70, 400, 140, 24); g.fillStyle = '#e8e8f0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); text(g, 'CTRL + Z', 0, 4, { size: 72, color: INK, font: FONTS.title }); g.restore(); } } });

// L — de manhã: o real voltou a valer um real, a padaria continua dele; fiado anotado por ele; anjo varrendo nuvem
registerShot('L', { draw(g, t, info) { const T = info.globalT, L = info.L, t0 = info.shot.start, tPa = W('padaria', L.n14), tG = L.g1[0], tCo = W('comenta', L.n15);
  const cam = K(T, [[t0, foco(520, 1000, 1.2)], [tPa, foco(560, 1000, 1.0)], [tG - 0.2, foco(520, 1150, 1.9)], [L.n15[0] + 0.5, foco(560, 900, 0.9)], [info.shot.end, foco(560, 200, 1.0)]]);
  fachada(g, t, cam, { placa: 'PADARIA DO GUILHERME', manha: 1 });
  layer(g, cam, 0.85, g => { for (let i = 0; i < 6; i++) drawFigure(g, { x: 900 + i * 110, y: GY + 120 + (i % 2) * 20, s: 1.4, facing: -1, outfit: FILA[i], pose: breathe(POSES.relaxed, t, 1, i), expr: 'smile', t });
    drawFigure(g, { x: 470, y: GY + 130, s: 1.75, facing: 1, outfit: { ...GUI, roupa: { tipo: 'avental', cor: '#f2ead8', cor2: '#5d6675' } }, pose: breathe(T > tG ? { ...POSES.holdFront, eF: [26, -150], hF: [50, -164] } : POSES.stand, t, 1, 1), expr: T > tG ? 'proud' : 'smile', talk: T > tG && T < L.g1[1] ? Math.max(0, Math.sin(t * 13)) : 0, t });
    if (T > tG - 0.2) caderno(g, 560, GY - 90, 0.5, t, { valor: 'Seu Zé: R$ 4' }); });
  layer(g, cam, 0.2, g => { if (T > L.n15[0]) anjo(g, 560, -320, 1.2, t, { pose: { ...POSES.stand, eF: [24, -150], hF: [40, -110] }, expr: 'sad', emote: 'gloom' }); });
  if (T < tPa) { moeda(g, 540, 420, 60, t, { brilho: 0.3 }); rotulo(g, 'R$ 1 = R$ 1', T - t0 - 0.2, 560, WH, 80); }
  if (T > tPa - 0.1 && T < tG) rotulo(g, 'A PADARIA CONTINUOU DELE', T - tPa + 0.1, 400, '#ffd23a', 66);
  if (T > tCo - 0.1) rotulo(g, 'COMENTA AÍ 👇', T - tCo + 0.1, 1340, WH, 80); } });

// T — título · Kc — siga
registerShot('T', { draw(g, t) { g.fillStyle = '#0a1030'; g.fillRect(0, 0, E.W, E.H); glow(g, 540, 900, 700, '#ffd23a', 0.2); moeda(g, 540, 520, 120, t, { brilho: 0.7 });
  const a = ease.outBack(prog(t, 0.15, 0.5)); g.save(); g.translate(540, 1000); g.scale(a, a); text(g, 'NESSE MUNDO,', 0, -90, { size: 76, color: '#9fd8ff', font: FONTS.ui, weight: 900 }); text(g, 'SÓ O SEU REAL', 0, 20, { size: 110, color: WH, stroke: 18, strokeColor: INK }); text(g, 'NÃO FOI TROCADO', 0, 140, { size: 96, color: '#ffd23a', stroke: 18, strokeColor: INK }); g.restore(); } });
registerShot('Kc', { draw(g, t) { UI.seguir(g, t, { linha1: 'CURTIU?', proximo: 'MAIS NESSE MUNDO — TODA SEMANA NA PÁGINA', outfit: GUI }); } });
