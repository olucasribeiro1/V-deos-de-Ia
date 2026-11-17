// E SE O BRASIL APAGASSE INTEIRO? · planos longos, câmera viva, cores RGB
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, rr, seg, poly, circle, glow, alpha, mix, text, FONTS, S, noise, rng, blurLayer } from '/engine/core.js';
import { drawFigure, POSES, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cozinha } from '/series/mamae/interiores.js';
import { freezer } from '/series/mamae/props.js';
import { gerador, galao } from '/series/mamae/bunker.js';
import { alerta, impacto } from '/series/mamae/efeitos.js';
import { foco, K } from '/series/mamae/camera.js';
import { W, mist, rotulo, legendaTopo } from '/series/mamae/comum.js';
import { INK, GY, NEON, box, cidade, semaforo, onibus, globo, mapaBR, brXY, torre, celular, gondola, maquininha, nota, cartao, item } from '/series/ese/mundo.js';
import { PROTAGONISTA as VC, FIGURANTE as FG } from '../cast.js';
const WH = '#f1efe9';
const pop = (T, t0, d = 0.25) => ease.outBack(prog(T, t0 - 0.1, t0 + d));
const FGc = (i) => ({ ...FG, top: 'none' });
const PHONE = { ...POSES.stand, eF: [24, -150], hF: [30, -196] };   // celular pro alto
const OLHA = { ...POSES.stand, eF: [20, -140], hF: [30, -160] };    // olhando a tela

// A — no ônibus, 19:40, 12%; tudo apaga; lá fora semáforo, poste, prédio; "maior apagão da história"
registerShot('A', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tA = W('apaga', L.n02), tS = W('semáforo', L.n02), tP = W('poste', L.n02), tPr = W('prédio', L.n02), tC = W('cidade', L.n02), tM = W('maior', L.n03), tMu = W('mundo', L.n03);
  if (T < tS - 0.3 + 0.35) {
    const cam = K(T, [[0, foco(560, 1000, 1.25)], [tA - 0.3, foco(600, 1050, 1.7)], [tA + 0.2, foco(600, 1050, 1.9)], [tS, foco(600, 1050, 2.0)]]);
    const [dx, dy] = impacto(T, tA, 10, 0.4); cam.x += dx; cam.y += dy;
    const luz = T < tA ? 1 : 0;
    const dentro = (g) => { onibus(g, t, cam, { luz, T, fora: (g) => { if (luz) { cidade(g, t, { z: 1, x: 0, y: 0 }, { luz: 1, T }); } else { g.fillStyle = '#05050a'; g.fillRect(-E.W * 3, 0, E.W * 7, E.H); } } });
      layer(g, cam, 1, g => { for (const [x, f] of [[260, 1], [880, -1]]) drawFigure(g, { x, y: GY + 40, s: 1.5, facing: f, outfit: FG, pose: breathe(POSES.sit, t, 1, x), expr: luz ? 'blank' : 'shocked', t, emote: luz ? null : 'question' });
        drawFigure(g, { x: 600, y: GY + 40, s: 1.7, facing: 1, outfit: VC, pose: breathe({ ...POSES.sit, eF: [22, -140], hF: [36, -160] }, t, 1, 1), expr: luz ? 'blank' : 'shocked', look: luz ? [0.5, 0.6] : [0, -0.4], t, emote: luz ? null : 'shock' });
        celular(g, 664, GY - 125, 0.42, { bat: 12, tela: 1 }); });
      if (!luz) { veil(g, '#000', 0.35); glow(g, 664 * 1 + 0, 1000, 300, '#7fc8ff', 0.15); } };
    dentro(g); if (T > tA - 0.04 && T < tA + 0.08) veil(g, '#fff', 0.5);
    if (T < tS - 0.3) return;
  }
  // exterior: o ônibus parado na avenida, as luzes caem uma a uma
  const k = ease.inOut(prog(T, tS - 0.3, tS + 0.05));
  const ext = (g) => { const cam = K(T, [[tS - 0.3, foco(380, 820, 2.0)], [tP, foco(620, 820, 1.7)], [tPr, foco(700, 700, 1.3)], [tC, foco(540, 900, 0.9)], [tM, foco(540, 900, 0.8)], [tMu, foco(540, 300, 1.1)], [info.shot.end, foco(540, -300, 1.4)]]);
    cidade(g, t, cam, { T, off: { semaforo: tS + 0.15, poste: tP + 0.1, predio: tPr + 0.1 } });
    layer(g, cam, 0.85, g => { semaforo(g, 380, GY + 20, 1.3, T, tS + 0.15);
      box(g, 520, GY - 260, 640, 280, mix('#ffcf3a', '#1a1626', 0.55), 30, 7); for (let i = 0; i < 4; i++) box(g, 560 + i * 150, GY - 220, 120, 100, '#0c0a14', 10, 4); circle(g, 640, GY + 30, 44, INK); circle(g, 1040, GY + 30, 44, INK);
      const fa = 1; for (const fx of [1160]) { glow(g, fx, GY - 80, 340, '#fff6c8', 0.5 * fa); poly(g, [[fx, GY - 100], [fx + 700, GY - 300], [fx + 700, GY + 160]], alpha('#fff6c8', 0.12)); }
      if (T > W('inteira', L.n02)) for (let i = 0; i < 5; i++) { const x = -200 + i * 150; drawFigure(g, { x, y: GY + 120, s: 1.3, facing: 1, outfit: FG, pose: breathe(PHONE, t, 1, i), expr: 'shocked', t }); celular(g, x + 30 * 1.3 / 1.3 + 8, GY + 120 - 200 * 1.3, 0.25, { bat: 30 + i * 9, sinal: 1 }); } });
    if (T > tC) veil(g, '#000', 0.25 * prog(T, tC, tC + 1)); };
  mist(g, k, () => {}, ext);
  if (T > tM - 0.1) rotulo(g, 'MAIOR APAGÃO', T - tM + 0.1, 520, '#ffd23a', 104), (T > tM + 0.25 && rotulo(g, 'DA HISTÓRIA', T - tM - 0.25, 640, WH, 84));
}});

// B — o Pacífico esquenta (El Niño) → mapa: seca no Norte/Nordeste, temporal no Sul
registerShot('B', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tE = W('esquentou', L.n04), tN = W('niño', L.n04), tS = W('seca', L.n04), tSul = W('sul', L.n04);
  const k = ease.inOut(prog(T, tS - 0.5, tS));
  const A = (g) => { g.fillStyle = '#05061a'; g.fillRect(0, 0, E.W, E.H); FX.stars(g, t, { count: 160, seed: 9, area: [0, 0, E.W, E.H] });
    const z = lerp(0.85, 1.1, ease.inOut(prog(T, info.shot.start, tS))); const ver = globo(g, 540, 880, 400 * z, t, { l0: lerp(-60, -100, ease.inOut(prog(T, info.shot.start, tE))), p0: -5, calor: prog(T, tE - 0.2, tE + 0.8) });
    const [px, py] = ver(-130, 0); if (T > tN - 0.1) { const a = pop(T, tN); g.save(); g.translate(px + 60, py - 60); g.scale(a, a); rr(g, -150, -50, 300, 100, 50); g.fillStyle = INK; g.fill(); rr(g, -142, -42, 284, 84, 42); g.fillStyle = '#ff3a1a'; g.fill(); text(g, 'EL NIÑO', 0, 4, { size: 54, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore(); }
    if (T > tE - 0.1 && T < tN) rotulo(g, 'PACÍFICO +QUENTE', T - tE + 0.1, 1380, '#ff7a1a', 70); };
  const B = (g) => { g.fillStyle = '#0a1438'; g.fillRect(0, 0, E.W, E.H); const z = 1 + 0.06 * (T - tS);
    g.save(); g.translate(540, 860); g.scale(z, z); g.translate(-540, -860);
    const seca = prog(T, tS, tS + 0.6), sul = prog(T, tSul - 0.3, tSul + 0.3);
    mapaBR(g, 540, 800, 18, t, { cor: '#3fd46a', zonas: (lo, la) => (la > -12 && seca > 0 ? mix('#3fd46a', '#d9661a', seca) : la < -24 && sul > 0 ? mix('#3fd46a', '#1f5ae0', sul) : null) });
    if (seca > 0) { const [x, y] = brXY(-52, -3, 540, 800, 18); FX.sun ? glow(g, x, y - 40, 200, '#ffd23a', 0.6 * seca) : 0; circle(g, x, y - 40, 60 * seca, '#ffd23a'); for (let i = 0; i < 8; i++) { const a = i * 0.785 + t; seg(g, [[x + Math.cos(a) * 80, y - 40 + Math.sin(a) * 80], [x + Math.cos(a) * 110, y - 40 + Math.sin(a) * 110]], 10 * seca, '#ffd23a'); } text(g, 'SECA', x - 40, y - 150, { size: 58, color: '#ffd23a', stroke: 12, strokeColor: INK, alpha: seca }); }
    if (sul > 0) { const [x, y] = brXY(-52, -29, 540, 800, 18); for (let i = 0; i < 30; i++) { const ph = (T * 1.6 + i * 0.137) % 1, rx = x - 160 + (i * 53) % 320; seg(g, [[rx, y - 140 + ph * 200], [rx - 8, y - 110 + ph * 200]], 4, alpha('#9fd8ff', sul)); } FX.lightning && (Math.sin(T * 13) > 0.97) && veil(g, '#cfe6ff', 0.2);
      for (const [dx, r] of [[-60, 60], [10, 76], [80, 56]]) circle(g, x + dx, y - 170, r * sul, '#6a7a90'); text(g, 'TEMPORAL', x + 260, y - 20, { size: 58, color: '#9fd8ff', stroke: 12, strokeColor: INK, alpha: sul }); }
    g.restore(); };
  mist(g, k, A, B);
}});

// C — metade da energia vem da água: represa baixando → Rio Negro seco, barco encalhado (Manaus · 2023)
registerShot('C', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tM = W('metade', L.n05), tR = W('rio', L.n05, 2), tF = W('forte', L.n05);
  const k = ease.inOut(prog(T, tR - 0.9, tR - 0.4));
  const cam0 = K(T, [[info.shot.start, foco(540, 900, 1.0)], [tR, foco(540, 980, 1.25)]]);
  const represa = (g) => { layer(g, cam0, 0.3, g => { g.fillStyle = linGrad2(g); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.hills(g, { y: 900, amp: 160, color: '#2f9a4a', seed: 3 }); });
    layer(g, cam0, 0.8, g => { const nivel = 1 - 0.55 * ease.inOut(prog(T, tM, tR - 0.6)); g.fillStyle = '#1f7ae0'; g.fillRect(-200, 1100 - 360 * nivel, 700, 400 + 360 * nivel); g.fillStyle = alpha('#fff', 0.25); for (let i = 0; i < 6; i++) g.fillRect(-150 + i * 110, 1110 - 360 * nivel + Math.sin(t * 2 + i) * 6, 60, 6);
      poly(g, [[480, 600], [620, 600], [700, 1500], [480, 1500]], '#c9ccd4'); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); for (let i = 0; i < 3; i++) box(g, 520, 900 + i * 120, 90, 60, '#9aa0aa', 6, 4);
      g.fillStyle = '#4ab0ff'; g.fillRect(700, 1380, 600, 120); seg(g, [[300, 1100 - 360 * nivel], [300, 1110]], 0, INK);
      for (let i = 0; i < 6; i++) { const y = 760 + i * 70; seg(g, [[400, y], [440, y]], 5, '#fff'); } text(g, 'NÍVEL', 420, 700, { size: 34, color: '#fff', font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK });
      torre(g, 900, 1380, 0.9); torre(g, 1150, 1300, 0.7); });
    if (T > tM - 0.1) { const a = pop(T, tM); g.save(); g.translate(540, 470); g.scale(a, a); text(g, '+ DA METADE', 0, 0, { size: 92, color: '#ffd23a', stroke: 18, strokeColor: INK }); text(g, 'DA ENERGIA VEM DA ÁGUA', 0, 92, { size: 50, color: WH, stroke: 12, strokeColor: INK }); g.restore(); } };
  const rio = (g) => { const cam = K(T, [[tR - 0.9, foco(540, 1000, 1.0)], [tF, foco(600, 1080, 1.3)], [info.shot.end, foco(620, 1100, 1.5)]]);
    layer(g, cam, 0.2, g => { g.fillStyle = linGrad(g, 0, -400, 0, 1100, ['#ff7a1a', '#ffb43a', '#ffe08a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); circle(g, 800, 420, 110 + 20 * prog(T, tF - 0.5, tF + 0.5), '#fff2a0'); glow(g, 800, 420, 420, '#ffd23a', 0.5 + 0.3 * prog(T, tF - 0.5, tF + 0.5)); });
    layer(g, cam, 0.45, g => { FX.hills(g, { y: 980, amp: 90, color: '#2a8a3a', seed: 5 }); for (let i = -4; i < 14; i++) FX.tree(g, i * 110, 960 - (i % 3) * 14, 1.1, '#1f6a2e'); });
    layer(g, cam, 0.85, g => { g.fillStyle = '#c99a5a'; g.fillRect(-E.W, 1000, E.W * 3, E.H); g.strokeStyle = alpha('#7a5a30', 0.7); g.lineWidth = 4; const r = rng(8); for (let i = 0; i < 40; i++) { const x = -400 + r() * 1900, y = 1080 + r() * 600; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40, y + 20); g.lineTo(x + 70, y - 6); g.stroke(); }
      g.fillStyle = '#3a6ab0'; g.beginPath(); g.ellipse(560, 1520, 520, 70, 0, 0, 7); g.fill();
      g.save(); g.translate(560, 1300); g.rotate(-0.18); box(g, -220, -60, 440, 90, '#e8e2d6', 30, 7); box(g, -120, -150, 220, 92, '#2fa8ff', 14, 6); for (let i = 0; i < 3; i++) box(g, -100 + i * 70, -132, 46, 40, '#0c0a14', 6, 3); g.restore();
      for (let i = 0; i < 7; i++) { const y = 1040 + i * 66; seg(g, [[160, y], [200, y]], 5, INK); } seg(g, [[180, 1020], [180, 1500]], 8, INK); });
    if (T > tR - 0.4) { legendaTopo(g, 'RIO NEGRO · MANAUS · 2023', 420); rotulo(g, 'MENOR NÍVEL', T - W('menor', L.n05), 560, '#ff3a3a', 96); if (T > W('cento', L.n05)) rotulo(g, 'EM +120 ANOS', T - W('cento', L.n05), 680, WH, 84); }
    if (T > tF - 0.3) { g.save(); g.globalCompositeOperation = 'overlay'; g.fillStyle = alpha('#ff3a1a', 0.3 * prog(T, tF - 0.3, tF + 0.6)); g.fillRect(0, 0, E.W, E.H); g.restore(); } };
  mist(g, k, represa, rio);
}});
const linGrad2 = (g) => { const gr = g.createLinearGradient(0, -400, 0, 1000); gr.addColorStop(0, '#2a8aff'); gr.addColorStop(1, '#bfe6ff'); return gr; };
import { linGrad } from '/engine/core.js';

// D — calor, ar-condicionado, linha cai, dominó → mapa apagando (25 estados + DF)
registerShot('D', { draw(g, t, info) {
  const T = info.globalT, L = info.L, tAr = W('ar', L.n06), tL = W('linha', L.n06), tC1 = W('cai', L.n06), tC2 = W('cai', L.n06, 2), tD = W('dominó', L.n06), tAg = L.n07[0];
  const k = ease.inOut(prog(T, tAg - 0.45, tAg + 0.05));
  const A = (g) => { const cam = K(T, [[info.shot.start, foco(540, 900, 1.1)], [tAr, foco(540, 900, 1.3)], [tL - 0.2, foco(300, 1000, 1.2)], [tD, foco(900, 1000, 1.0)], [tAg, foco(1300, 1000, 0.95)]]);
    layer(g, cam, 0.2, g => { g.fillStyle = linGrad(g, 0, -400, 0, 1200, ['#ff3a6a', '#ff8a2a', '#ffd23a']); g.fillRect(-E.W * 2, -E.H, E.W * 6, E.H * 3); circle(g, 540, 300, 120, '#fff6c0'); glow(g, 540, 300, 500, '#ffd23a', 0.6); });
    layer(g, cam, 0.5, g => { const r = rng(2); for (let i = -4; i < 6; i++) { const x = i * 200, h = 500 + r() * 300; box(g, x, 1100 - h, 180, h + 200, NEON[(i + 8) % 6], 6, 6); for (let j = 0; j < 4; j++) { const y = 1100 - h + 60 + j * 110; box(g, x + 30, y, 60, 50, '#e8e8ee', 4, 3); if (T > tAr - 0.3) { for (let q = 0; q < 3; q++) seg(g, [[x + 34 + q * 18, y + 54 + ((t * 2 + q) % 1) * 30], [x + 40 + q * 18, y + 70 + ((t * 2 + q) % 1) * 30]], 3, alpha('#bfe9ff', 0.8)); } } } });
    if (T > tAr - 0.2) { const a = pop(T, tAr); g.save(); g.translate(540, 520); g.scale(a, a); text(g, 'TODO MUNDO NO AR', 0, 0, { size: 72, color: WH, stroke: 14, strokeColor: INK }); g.restore(); }
    layer(g, cam, 0.9, g => { g.fillStyle = '#1a6a2a'; g.fillRect(-E.W * 2, 1300, E.W * 7, E.H); const xs = [200, 600, 1000, 1400, 1800];
      g.strokeStyle = INK; g.lineWidth = 4; for (let i = 0; i < xs.length - 1; i++) { const q1 = fall(i), q2 = fall(i + 1); if (q1 < 0.2 && q2 < 0.2) { g.beginPath(); g.moveTo(xs[i] + 130, 1300 - 330); g.quadraticCurveTo((xs[i] + xs[i + 1]) / 2, 1300 - 250, xs[i + 1] - 130, 1300 - 330); g.stroke(); } }
      xs.forEach((x, i) => torre(g, x, 1300, 1.0, fall(i), T > tq(i) - 0.15 && T < tq(i) + 0.3 ? 1 : 0, t)); });
    function tq(i) { return i === 0 ? tC1 : i === 1 ? tC2 : tC2 + (i - 1) * 0.45; }
    function fall(i) { return prog(T, tq(i), tq(i) + 0.6); }
    if (T > tD - 0.1) rotulo(g, 'EFEITO DOMINÓ', T - tD + 0.1, 1400, '#ffd23a', 92); };
  const B = (g) => { g.fillStyle = '#05061a'; g.fillRect(0, 0, E.W, E.H); const z = 1 + 0.05 * (T - tAg); g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
    mapaBR(g, 540, 800, 19, t, { cor: '#ffd23a', apaga: prog(T, W('atingiu', L.n07), W('segundos', L.n07) + 0.2) }); g.restore(); legendaTopo(g, '15 DE AGOSTO DE 2023', 1230); };
  mist(g, k, A, B);
  if (T > tC1 - 0.05 && T < tC1 + 0.1) veil(g, '#bfe9ff', 0.25);
}});

// E — 1ª hora: rua escura, todo mundo com o celular pro alto; torre com bateria acabando; dica do celular
registerShot('E', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tTo = W('torres', L.n09), tAc = W('acaba', L.n09), tDi = W('dica', L.n09);
  const k = ease.inOut(prog(T, tDi - 0.5, tDi));
  const rua = (g) => { const cam = K(T, [[t0, foco(200, 1050, 1.9)], [W('rua', L.n08), foco(500, 1000, 1.4)], [W('ninguém', L.n08), foco(820, 900, 1.8)], [tTo, foco(1100, 700, 1.2)], [tDi, foco(1150, 600, 1.4)]]);
    cidade(g, t, cam, { luz: 0, T });
    layer(g, cam, 0.85, g => { if (T > tTo - 0.4) { const x = 1150; seg(g, [[x - 60, GY], [x, GY - 760], [x + 60, GY]], 10, INK); for (let i = 0; i < 6; i++) seg(g, [[x - 55 + i * 9, GY - i * 120], [x + 55 - i * 9, GY - (i + 1) * 120]], 4, INK); box(g, x - 30, GY - 820, 60, 90, '#cfd6e0', 8, 4);
        const bat = 1 - prog(T, tTo + 0.3, tAc + 0.3); box(g, x + 80, GY - 720, 70, 130, '#16161c', 10, 5); rr(g, x + 92, GY - 600 - 110 * bat, 46, Math.max(8, 110 * bat - 6), 4); g.fillStyle = bat > 0.3 ? '#5fe06a' : '#ff3a3a'; g.fill(); if (bat < 0.3) glow(g, x + 115, GY - 650, 120, '#ff3a3a', 0.4 * (0.5 + 0.5 * Math.sin(t * 10))); }
      const ws = Math.min(1, (T - t0) / 1.2), px = lerp(120, 560, ease.out(prog(T, t0, W('rua', L.n08))));
      for (let i = 0; i < 7; i++) { const x = 300 + i * 120, s = 1.35 + (i % 2) * 0.1; drawFigure(g, { x, y: GY + 110 + (i % 2) * 40, s, facing: i % 3 ? -1 : 1, outfit: FG, pose: breathe(i % 2 ? PHONE : OLHA, t, 1, i), expr: ['nervous', 'question', 'panic', 'suspicious', 'shocked', 'nervous', 'gulp'][i] || 'nervous', t, emote: i === 2 ? 'question' : i === 5 ? 'sweat' : null }); glow(g, x + 30 * (i % 3 ? -1 : 1), GY + 110 + (i % 2) * 40 - (i % 2 ? 260 : 210) * s / 1.35, 70, '#9fd8ff', 0.4); }
      const walk = T < W('rua', L.n08) ? walkPose(T * 2.2) : breathe(PHONE, t, 1, 1);
      drawFigure(g, { x: px, y: GY + 170, s: 1.6, facing: 1, outfit: VC, pose: walk, expr: T < W('ninguém', L.n08) ? 'nervous' : 'panic', t, emote: T > W('ninguém', L.n08) ? 'question' : null });
      if (T > W('rua', L.n08)) celular(g, px + 50, GY + 170 - 330, 0.3, { bat: 11, sinal: T > W('sinal', L.n08) ? 0 : 1 }); });
    veil(g, '#05061a', 0.15); if (T > tTo) legendaTopo(g, 'TORRE DE CELULAR · BATERIA', 420); };
  const dica = (g) => { g.fillStyle = '#0a0d2a'; g.fillRect(0, 0, E.W, E.H); for (let i = 0; i < 12; i++) glow(g, (i * 211) % 1080, (i * 337) % 1920, 260, NEON[i % 6], 0.12);
    text(g, 'DICA REAL', 540, 420, { size: 54, color: '#7dff4a', font: FONTS.ui, weight: 900, spacing: 8 }); celular(g, 540, 690, 1.1, { bat: 11, msg: 'ECONOMIA' });
    item(g, 540, 960, '✈  MODO AVIÃO', pop(T, W('avião', L.n09)));
    item(g, 540, 1080, '☀  BRILHO NO MÍNIMO', pop(T, W('brilho', L.n09)));
    item(g, 540, 1200, 'MENSAGEM, NÃO LIGAÇÃO', pop(T, W('mensagem', L.n09)));
    if (T > W('passa', L.n09)) rotulo(g, 'SMS PASSA PRIMEIRO', T - W('passa', L.n09), 1340, '#22e1ff', 60); };
  mist(g, k, rua, dica);
}});

// F — mercado lotado: sem maquininha, sem Pix, sem caixa; dinheiro vivo compra; você com o cartão
registerShot('F', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tMq = W('maquininha', L.n10), tPx = W('pix', L.n10), tCx = W('caixa', L.n10), tDv = W('dinheiro', L.n10), tVc = W('você', L.n10), tPor = L.n11[0];
  const k = ease.inOut(prog(T, tPor - 0.3, tPor + 0.2));
  const merc = (g) => { const cam = K(T, [[t0, foco(540, 900, 0.95)], [tMq - 0.2, foco(760, 1080, 1.9)], [tCx, foco(700, 1000, 1.5)], [tDv, foco(420, 1080, 1.8)], [tVc, foco(760, 1050, 2.2)], [tPor, foco(760, 1050, 2.5)]]);
    layer(g, cam, 0.4, g => { g.fillStyle = '#fff4e0'; g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3); g.fillStyle = '#ff3a6a'; g.fillRect(-E.W * 2, 260, E.W * 5, 90); text(g, 'SUPERMERCADO BOM PREÇO', 540, 305, { size: 50, color: '#fff', font: FONTS.ui, weight: 900 }); for (let i = -2; i < 6; i++) gondola(g, i * 300 - 100, 1150, 260, 0.55, i + 4); veil(g, '#1a1030', 0.35); for (let i = 0; i < 4; i++) { rr(g, i * 300 + 40, 380, 120, 20, 8); g.fillStyle = '#3a3640'; g.fill(); } });
    layer(g, cam, 0.85, g => { g.fillStyle = '#d8d2c4'; g.fillRect(-E.W * 2, GY, E.W * 5, E.H); box(g, 600, GY - 190, 420, 200, '#2fa8ff', 10, 6); maquininha(g, 800, GY - 240, 0.55, T > tMq - 0.1 ? 1 : 0, t);
      if (T > tPx - 0.1) { const a = pop(T, tPx); g.save(); g.translate(840, GY - 420); g.scale(a, a); circle(g, 0, 0, 60, '#32bcad'); text(g, 'PIX', 0, 2, { size: 40, color: '#fff', font: FONTS.ui, weight: 900 }); seg(g, [[-60, -60], [60, 60]], 14, '#ff3a3a'); g.restore(); }
      if (T > tCx - 0.1) { const a = pop(T, tCx); g.save(); g.translate(150, GY - 330); g.scale(a, a); box(g, -90, -150, 180, 300, '#5a6a80', 12, 6); rr(g, -60, -120, 120, 80, 6); g.fillStyle = '#05060a'; g.fill(); text(g, 'FORA', 0, -80, { size: 28, color: '#ff3a3a', font: FONTS.ui, weight: 900 }); g.restore(); }
      for (let i = 0; i < 8; i++) { const x = -260 + i * 110; drawFigure(g, { x, y: GY + 140 + (i % 2) * 30, s: 1.35, facing: 1, outfit: FG, pose: breathe(i % 3 === 0 ? POSES.crossArms : POSES.stand, t, 1, i), expr: ['angry', 'nervous', 'suspicious', 'furious', 'gulp', 'nervous', 'angry', 'blank'][i], t, emote: i === 3 ? 'anger' : i === 1 ? 'sweat' : null }); }
      if (T > tDv - 0.1) { drawFigure(g, { x: 470, y: GY + 150, s: 1.45, facing: 1, outfit: FG, pose: breathe({ ...POSES.reach, eF: [30, -150], hF: [60, -160] }, t, 1, 9), expr: 'proud', t, emote: 'sparkle' }); nota(g, 540, GY - 80, 0.45, -0.2 + Math.sin(t * 3) * 0.1); nota(g, 560, GY - 60, 0.45, 0.1); }
      drawFigure(g, { x: 700, y: GY + 170, s: 1.6, facing: 1, outfit: VC, pose: breathe({ ...POSES.stand, eF: [26, -140], hF: [52, -150] }, t, 1, 1), expr: T > tVc ? 'gulp' : 'nervous', t, emote: T > tVc ? 'sweat' : null }); cartao(g, 790, GY - 70, 0.4, -0.3); });
    if (T < tMq - 0.3) rotulo(g, 'LOTADO', T - t0 - 0.3, 520, '#ff3a6a', 110); };
  const casa = (g) => { g.fillStyle = '#0d2a18'; g.fillRect(0, 0, E.W, E.H); glow(g, 540, 900, 700, '#38d46a', 0.25); const z = 1 + 0.05 * (T - tPor);
    g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900); for (let i = 0; i < 7; i++) nota(g, 380 + (i % 4) * 100, 820 + Math.floor(i / 4) * 90 - i * 6, 1.1 * pop(T, tPor + i * 0.08), -0.3 + i * 0.1); g.restore();
    legendaTopo(g, 'GUIAS DE EMERGÊNCIA:', 420); rotulo(g, 'TENHA DINHEIRO', T - W('dinheiro', L.n11) + 0.1, 520, '#7dff4a', 96); if (T > W('trocado', L.n11)) rotulo(g, 'TROCADO EM CASA', T - W('trocado', L.n11), 1180, WH, 80); };
  mist(g, k, merc, casa);
}});

// G — cozinha no escuro: geladeira 4 h, freezer cheio 48 h; água 4 L × pessoa × dia, 3 dias
registerShot('G', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tQ = W('quatro', L.n12), tFz = W('freezer', L.n12), tAb = W('abriu', L.n12), tAg = W('água', L.n12), tTr = W('três', L.n12);
  const cam = K(T, [[t0, foco(540, 950, 1.1)], [tQ - 0.3, foco(330, 900, 1.6)], [tFz - 0.2, foco(760, 1050, 1.7)], [tAb, foco(560, 1000, 1.4)], [tAg - 0.2, foco(540, 1150, 1.5)], [info.shot.end, foco(540, 1150, 1.7)]]);
  cozinha(g, t, cam); veil(g, '#060814', 0.55);
  layer(g, cam, 1, g => { box(g, 200, GY - 640, 260, 640, '#e9edf0', 18, 7); seg(g, [[200, GY - 420], [460, GY - 420]], 6, INK); box(g, 420, GY - 600, 16, 120, '#9aa0aa', 6, 3); box(g, 420, GY - 380, 16, 140, '#9aa0aa', 6, 3);
    const aberto = T > tAb && T < tAb + 0.8 ? 1 : 0; if (aberto) { box(g, 460, GY - 640, 160, 640, '#dfe4e8', 10, 6); glow(g, 330, GY - 300, 300, '#bfe9ff', 0.3); }
    freezer(g, 800, GY, 0.9, 0);
    const gl = (x, y, h, max, tt) => { const rest = clamp(1 - Math.max(0, T - tt) / 12); rr(g, x - 90, y - 34, 180, 68, 34); g.fillStyle = INK; g.fill(); rr(g, x - 82, y - 26, 164 * rest, 52, 26); g.fillStyle = rest > 0.5 ? '#38d46a' : '#ffb43a'; g.fill(); text(g, h, x, y + 2, { size: 40, color: '#fff', font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK }); };
    
    
    drawFigure(g, { x: 600, y: GY + 120, s: 1.6, facing: -1, outfit: VC, pose: breathe(aberto ? POSES.reach : POSES.stand, t, 1, 1), expr: aberto ? 'panic' : 'suspicious', t, emote: aberto ? 'exclaim' : null });
    if (T > tAg - 0.3) for (let i = 0; i < 3; i++) galao(g, 380 + i * 140, GY + 330, 1.2 * pop(T, tAg + i * 0.15)); });
  { const sel = (x, y, h, sub, tt, a) => { if (a <= 0) return; g.save(); g.translate(x, y); g.scale(a * 1.6, a * 1.6); rr(g, -110, -40, 220, 80, 40); g.fillStyle = INK; g.fill(); rr(g, -102, -32, 204, 64, 32); g.fillStyle = '#123a5a'; g.fill(); text(g, h, 0, 2, { size: 46, color: '#fff', font: FONTS.ui, weight: 900 }); text(g, sub, 0, -62, { size: 30, color: '#22e1ff', font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK }); g.restore(); };
    if (T < tAg - 0.2) { sel(300, 520, 'ATÉ 4 H', 'GELADEIRA', tQ, pop(T, tQ)); sel(780, 520, 'ATÉ 48 H', 'FREEZER CHEIO', tFz, pop(T, W('quarenta', L.n12))); } }
  if (T > tAb - 0.05 && T < tAb + 0.8) rotulo(g, 'ABRIU, PERDEU', T - tAb, 760, '#ff3a3a', 100);
  if (T > tAg) { const a = pop(T, W('litros', L.n12)); g.save(); g.translate(540, 470); g.scale(a, a); text(g, '4 LITROS', 0, 0, { size: 104, color: '#22e1ff', stroke: 20, strokeColor: INK }); text(g, 'POR PESSOA · POR DIA', 0, 92, { size: 46, color: WH, stroke: 10, strokeColor: INK }); g.restore(); }
  if (T > tTr - 0.1) rotulo(g, 'MÍNIMO 3 DIAS', T - tTr + 0.1, 1360, '#ffd23a', 80);
}});

// H — dia 3: posto sem combustível, torneira seca, saques; você na janela; as 3 regras
registerShot('H', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tPo = W('posto', L.n13), tPr = W('prédio', L.n13), tSa = W('saques', L.n13), tRe = L.n14[0];
  const k = ease.inOut(prog(T, tRe - 0.4, tRe + 0.1));
  const rua = (g) => { const cam = K(T, [[t0, foco(300, 950, 1.1)], [tPo, foco(300, 1050, 1.6)], [tPr - 0.2, foco(760, 950, 1.5)], [tSa - 0.3, foco(540, 1050, 1.2)], [tRe, foco(540, 1080, 1.5)]]);
    const [dx, dy] = impacto(T, tSa, 14, 0.5); cam.x += dx; cam.y += dy;
    cidade(g, t, cam, { luz: 0, T, chao: '#1a1622' }); veil(g, '#0a0420', 0.25);
    layer(g, cam, 0.85, g => { box(g, 120, GY - 300, 340, 40, '#ff3a6a', 8, 5); seg(g, [[150, GY - 260], [150, GY]], 12, INK); seg(g, [[430, GY - 260], [430, GY]], 12, INK); box(g, 250, GY - 200, 90, 200, '#e8e2d6', 10, 6); rr(g, 262, GY - 180, 66, 40, 4); g.fillStyle = '#05060a'; g.fill();
      if (T > tPo + 0.2) text(g, 'SEM', 295, GY - 160, { size: 18, color: '#ff3a3a', font: FONTS.ui, weight: 900 }); if (T > tPo + 0.4) rotulo(g, 'SEM COMBUSTÍVEL', T - tPo - 0.4, 640, '#ff3a3a', 80);
      box(g, 640, GY - 300, 240, 300, '#a64bff', 8, 6); box(g, 720, GY - 220, 50, 40, '#9aa0aa', 6, 4); if (T > W('água', L.n13)) { for (let i = 0; i < 2; i++) circle(g, 745, GY - 160 + ((T * 1.2 + i * 0.5) % 1) * 60, 6, alpha('#9fd8ff', 1 - ((T * 1.2 + i * 0.5) % 1))); }
      if (T > tSa - 0.2) { for (let i = 0; i < 6; i++) { const ph = (T - tSa) * 1.4 + i * 0.3, x = 1100 - ((ph * 260) % 1400); drawFigure(g, { x, y: GY + 120 + (i % 3) * 30, s: 1.35, facing: -1, outfit: FG, pose: walkPose(ph * 3, { run: true }), expr: 'angry', t }); box(g, x - 40, GY + 120 - 200 + (i % 3) * 30, 70, 60, NEON[i % 6], 6, 4); }
        glow(g, 900, GY - 200, 300, '#ff7a1a', 0.35 + 0.15 * Math.sin(t * 12)); for (let i = 0; i < 8; i++) poly(g, [[880 + i * 12, GY - 60], [900 + i * 14, GY - 150 - (i % 3) * 30], [920 + i * 10, GY - 60]], alpha('#9fd8ff', 0.6)); } });
    if (T > tSa - 0.1) { rotulo(g, 'SAQUES', T - tSa + 0.1, 470, '#ff3a3a', 120); alerta(g, T, 0.5); } };
  const jan = (g) => { g.fillStyle = '#05040c'; g.fillRect(0, 0, E.W, E.H); glow(g, 300, 800, 500, '#ff7a1a', 0.12 + 0.05 * Math.sin(t * 9));
    g.save(); g.translate(540, 620); const z = 0.8 + 0.04 * (T - tRe); g.scale(z, z); rr(g, -380, -380, 760, 640, 10); g.fillStyle = '#120a20'; g.fill(); g.strokeStyle = '#3a2a4a'; g.lineWidth = 16; g.stroke();
    bigFace(g, 120, 20, 190, { outfit: VC, expr: 'terrified', look: [-1, 0], t, emote: 'sweat' }); g.fillStyle = '#5a2a6a'; g.fillRect(-380, -380, 420 + 20 * Math.sin(t * 2), 640); g.fillStyle = '#7a3a8a'; for (let i = 0; i < 5; i++) g.fillRect(-380 + i * 90, -380, 30, 640); g.restore();
    item(g, 540, 960, 'NÃO SAIA À NOITE', pop(T, W('sai', L.n14)), false);
    item(g, 540, 1075, 'NÃO MOSTRE O QUE TEM', pop(T, W('mostra', L.n14)), false);
    item(g, 540, 1190, 'NÃO ENFRENTE MULTIDÃO', pop(T, W('enfrenta', L.n14)), false);
    if (T > W('nada', L.n14)) { veil(g, '#000', 0.55 * prog(T, W('nada', L.n14), W('nada', L.n14) + 0.3)); rotulo(g, 'NADA VALE', T - W('nada', L.n14), 760, WH, 110); if (T > W('você', L.n14, 3)) rotulo(g, 'MAIS QUE VOCÊ', T - W('você', L.n14, 3), 900, '#ff3a6a', 100); } };
  mist(g, k, rua, jan);
}});

// I — o mundo é uma rede: porto parado, servidor caindo, linhas apagando a partir do Brasil
registerShot('I', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tPo = W('porto', L.n15), tSe = W('servidor', L.n15), tRe = W('rede', L.n15);
  g.fillStyle = '#04051a'; g.fillRect(0, 0, E.W, E.H); FX.stars(g, t, { count: 160, seed: 4, area: [0, 0, E.W, E.H] });
  const z = lerp(0.9, 1.15, (T - t0) / info.dur), ver = globo(g, 540, 930, 380 * z, t, { l0: lerp(-55, -30, (T - t0) / info.dur), p0: 10, escuro: prog(T, tRe, tRe + 1.5) * 0.8 });
  const [bx, by] = ver(-47, -15); const cid = [[-74, 40.7], [4.5, 52], [3.4, 6.5], [-9, 38.7], [-80, 25.8], [-58, -34.6], [-99, 19.4], [18, -34], [-0.1, 51.5]];
  cid.forEach(([lo, la], i) => { const [x, y, c] = ver(lo, la); if (c < 0) return; const tOff = tPo + i * 0.45, a = T < tOff ? 1 : clamp(1 - (T - tOff) / 0.3);
    g.strokeStyle = alpha(NEON[i % 6], 0.15 + 0.85 * a); g.lineWidth = 5; g.setLineDash(a < 1 ? [8, 14] : []); g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo((bx + x) / 2, Math.min(by, y) - 160, x, y); g.stroke(); g.setLineDash([]);
    circle(g, x, y, 12, a > 0.5 ? NEON[i % 6] : '#3a3a44'); if (a > 0.5) { const ph = ((T * 0.8 + i * 0.2) % 1); const px = lerp(bx, x, ph), py = lerp(by, y, ph) - Math.sin(ph * Math.PI) * 160 * 0.5; circle(g, px, py, 7, '#fff'); } });
  circle(g, bx, by, 18, T < tPo ? '#ffd23a' : '#ff3a3a'); glow(g, bx, by, 120, '#ff3a3a', 0.4 + 0.3 * Math.sin(t * 8));
  if (T > tPo - 0.1 && T < tSe) { const a = pop(T, tPo); g.save(); g.translate(540, 400); g.scale(a, a); box(g, -200, -40, 400, 80, '#2fa8ff', 20, 6); for (let i = 0; i < 4; i++) box(g, -150 + i * 80, -110, 70, 70, NEON[i], 4, 4); text(g, 'PORTO PARADO', 0, -170, { size: 56, color: WH, stroke: 12, strokeColor: INK }); g.restore(); }
  if (T > tSe - 0.1 && T < tRe) { const a = pop(T, tSe); g.save(); g.translate(540, 420); g.scale(a, a); for (let i = 0; i < 3; i++) { box(g, -190 + i * 130, -120, 110, 200, '#1a1a24', 8, 5); for (let j = 0; j < 5; j++) circle(g, -170 + i * 130, -95 + j * 38, 6, Math.sin(t * 20 + i + j) > 0 && T < tSe + 0.6 ? '#7dff4a' : '#ff3a3a'); } text(g, 'BANCO · APP · PAGAMENTO', 0, -160, { size: 44, color: WH, stroke: 10, strokeColor: INK, font: FONTS.ui, weight: 900 }); g.restore(); }
  if (T > tRe - 0.1) rotulo(g, 'CAI EM CADEIA', T - tRe + 0.1, 400, '#ff3a6a', 100);
  if (T < tPo) rotulo(g, 'NÃO FICA SÓ AQUI', T - t0, 420, '#22e1ff', 76);
}});

// J — gerador lá fora (CO), lanterna nunca vela, tirar da tomada
registerShot('J', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tCO = W('monóxido', L.n16), tLa = W('lanterna', L.n16), tTo = W('tomada', L.n16);
  const ka = ease.inOut(prog(T, tLa - 0.4, tLa + 0.05)), kb = ease.inOut(prog(T, W('quando', L.n16) - 0.4, W('quando', L.n16) + 0.05));
  const ger = (g) => { const cam = K(T, [[t0, foco(620, 1100, 1.5)], [W('janelas', L.n16), foco(420, 1050, 1.15)], [tCO, foco(420, 900, 1.5)], [tLa, foco(420, 900, 1.7)]]);
    layer(g, cam, 0.3, g => { g.fillStyle = linGrad(g, 0, -300, 0, 1200, ['#0a0830', '#2a1a5a', '#5a2a7a']); g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3); FX.stars(g, t, { count: 50, seed: 2, area: [-E.W, -E.H, E.W * 3, E.H] }); });
    layer(g, cam, 0.85, g => { box(g, -100, GY - 560, 600, 560, '#ff8a3a', 8, 7); poly(g, [[-140, GY - 560], [200, GY - 820], [540, GY - 560]], '#c0462a'); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
      box(g, 60, GY - 440, 160, 150, '#ffe9a0', 6, 6); box(g, 300, GY - 300, 120, 300, '#6a3a2a', 6, 6); g.fillStyle = '#2a8a3a'; g.fillRect(-E.W * 2, GY, E.W * 5, E.H);
      gerador(g, 680, GY, t, 1); const dist = 'LONGE DAS JANELAS'; seg(g, [[230, GY + 80], [640, GY + 80]], 6, '#ffd23a'); poly(g, [[230, GY + 80], [260, GY + 64], [260, GY + 96]], '#ffd23a'); poly(g, [[640, GY + 80], [610, GY + 64], [610, GY + 96]], '#ffd23a'); text(g, dist, 435, GY + 130, { size: 38, color: '#ffd23a', font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK });
      if (T > tCO - 0.6) { const a = prog(T, tCO - 0.6, tCO + 0.6); for (let i = 0; i < 9; i++) { const ph = (T * 0.5 + i / 9) % 1; circle(g, lerp(680, 160, ph) + Math.sin(ph * 9 + i) * 30, GY - 160 - ph * 220 + Math.sin(i) * 30, 40 + ph * 50, alpha('#9aa0b0', 0.45 * a * (1 - ph * 0.5))); } } });
    if (T > tCO - 0.1) { const a = pop(T, tCO); g.save(); g.translate(540, 470); g.scale(a, a); text(g, 'CO', 0, 0, { size: 150, color: '#ff3a3a', stroke: 24, strokeColor: INK }); text(g, 'SEM CHEIRO · MATA DORMINDO', 0, 110, { size: 44, color: WH, stroke: 10, strokeColor: INK, font: FONTS.ui, weight: 900 }); g.restore(); }
    if (T < tCO - 0.2) rotulo(g, 'GERADOR SÓ LÁ FORA', T - t0, 470, '#7dff4a', 84); };
  const luz = (g) => { g.fillStyle = '#06060e'; g.fillRect(0, 0, E.W, E.H);
    g.save(); g.translate(300, 860); const a = pop(T, tLa); g.scale(a, a); poly(g, [[60, -20], [520, -260], [520, 220]], alpha('#fff6c0', 0.25)); box(g, -120, -40, 180, 80, '#2fa8ff', 16, 6); box(g, 50, -60, 40, 120, '#c9ced6', 8, 6); g.restore();
    g.save(); g.translate(780, 900); const b = pop(T, W('vela', L.n16)); g.scale(b, b); box(g, -30, -60, 60, 160, '#f2ead8', 8, 5); poly(g, [[0, -140 + Math.sin(t * 20) * 6], [20, -80], [-20, -80]], '#ffb43a'); glow(g, 0, -100, 140, '#ffb43a', 0.5); seg(g, [[-120, -200], [120, 120]], 22, '#ff3a3a'); seg(g, [[120, -200], [-120, 120]], 22, '#ff3a3a'); g.restore();
    text(g, 'LANTERNA', 300, 1080, { size: 64, color: '#7dff4a', stroke: 12, strokeColor: INK, alpha: a }); text(g, 'NUNCA VELA', 780, 1080, { size: 64, color: '#ff3a3a', stroke: 12, strokeColor: INK, alpha: b }); };
  const tom = (g) => { g.fillStyle = '#10142a'; g.fillRect(0, 0, E.W, E.H); const z = 1 + 0.06 * (T - W('quando', L.n16)); g.save(); g.translate(540, 860); g.scale(z, z);
    box(g, -220, -220, 440, 440, '#e8e8ee', 40, 8); circle(g, -60, -10, 26, INK); circle(g, 60, -10, 26, INK); circle(g, 0, 90, 22, INK);
    const pu = ease.out(prog(T, tTo - 0.3, tTo + 0.2)); g.save(); g.translate(0, -pu * 260); box(g, -110, -40, 220, 140, '#2a2a34', 30, 7); seg(g, [[0, -40], [0, -500]], 26, '#2a2a34'); g.restore();
    if (T > W('pico', L.n16) - 0.1) { for (let i = 0; i < 10; i++) { const a2 = i * 0.63 + t * 20; seg(g, [[0, 0], [Math.cos(a2) * 260, Math.sin(a2) * 260]], 6, alpha('#ffd23a', 0.8)); } glow(g, 0, 0, 400, '#9fe8ff', 0.5); }
    g.restore(); rotulo(g, 'TIRE DA TOMADA', T - tTo + 0.2, 420, '#22e1ff', 96); if (T > W('pico', L.n16)) rotulo(g, 'O PICO QUEIMA', T - W('pico', L.n16), 1380, '#ffd23a', 84); };
  if (kb > 0) mist(g, kb, luz, tom); else mist(g, ka, ger, luz);
}});

// K — de volta ao ônibus: 12%; dinheiro, água, lanterna na gaveta; a lanterna apaga
registerShot('K', { draw(g, t, info) {
  const T = info.globalT, L = info.L, t0 = info.shot.start, tDi = W('diferença', L.n18), tP = L.n19[0], tLu = W('luz', L.n19), tTa = W('tarde', L.n19);
  const k = ease.inOut(prog(T, tDi - 0.4, tDi + 0.1));
  const bus = (g) => { const cam = K(T, [[t0, foco(600, 1000, 1.3)], [W('terça', L.n17), foco(620, 1000, 2.0)], [tDi, foco(660, 960, 2.8)]]);
    onibus(g, t, cam, { luz: 1, T, fora: (g) => cidade(g, t, { z: 1, x: 0, y: 0 }, { luz: 1, T }) });
    layer(g, cam, 1, g => { drawFigure(g, { x: 600, y: GY + 40, s: 1.7, facing: 1, outfit: VC, pose: breathe({ ...POSES.sit, eF: [22, -140], hF: [36, -160] }, t, 1, 1), expr: 'blank', look: [0.5, 0.6], t }); celular(g, 664, GY - 125, 0.42, { bat: 12 }); });
    if (T < W('terça', L.n17)) rotulo(g, 'NÃO AVISA', T - t0, 480, '#ff3a3a', 100); };
  const gav = (g) => { g.fillStyle = '#0c0a1a'; g.fillRect(0, 0, E.W, E.H); const off = T > tLu + 0.1; glow(g, 540, 900, 700, '#ffd23a', off ? 0 : 0.12);
    const z = 1 + 0.08 * (T - tDi); g.save(); g.translate(540, 760); g.scale(z * 0.85, z * 0.85); box(g, -420, -60, 840, 300, '#8a5a3a', 14, 8); box(g, -400, -240, 800, 200, '#5a3a24', 10, 7);
    const ia = [W('dinheiro', L.n18), W('água', L.n18), W('lanterna', L.n18)];
    if (T > ia[0] - 0.1) { const a = pop(T, ia[0]); for (let i = 0; i < 3; i++) nota(g, -260 + i * 20, -140 - i * 14, 0.9 * a, -0.2 + i * 0.15); }
    if (T > ia[1] - 0.1) galao(g, 0, -40, 1.3 * pop(T, ia[1]));
    if (T > ia[2] - 0.1) { const a = pop(T, ia[2]); g.save(); g.translate(260, -130); g.scale(a, a); box(g, -110, -36, 160, 72, '#2fa8ff', 14, 6); box(g, 40, -52, 36, 104, '#c9ced6', 8, 6); if (!off) poly(g, [[76, -10], [500, -200], [500, 200]], alpha('#fff6c0', 0.18)); g.restore(); }
    g.restore();
    item(g, 540, 1000, 'DINHEIRO TROCADO', pop(T, ia[0]), true, 720); item(g, 540, 1110, 'ÁGUA GUARDADA', pop(T, ia[1]), true, 720); item(g, 540, 1220, 'LANTERNA NA GAVETA', pop(T, ia[2]), true, 720);
    if (T > W('hoje', L.n18) - 0.1 && T < tP) rotulo(g, 'COMECE HOJE', T - W('hoje', L.n18), 420, '#7dff4a', 100);
    if (off) { veil(g, '#000', 0.92 * prog(T, tLu + 0.1, tLu + 0.2)); if (T > tTa - 0.2) text(g, 'JÁ É TARDE.', 540, 900, { size: 110, color: '#ff3a3a', stroke: 20, strokeColor: INK, alpha: prog(T, tTa - 0.2, tTa + 0.2) }); } };
  mist(g, k, bus, gav);
}});

// T — cartão de título · Kc — siga a página
registerShot('T', { draw(g, t) { g.fillStyle = '#05040c'; g.fillRect(0, 0, E.W, E.H); const fl = t < 0.6 ? (Math.sin(t * 60) > 0 ? 1 : 0.2) : 1;
  for (let i = 0; i < 6; i++) glow(g, 180 + i * 150, 1500, 300, NEON[i], 0.12 * fl);
  const z = 1 + 0.04 * t; g.save(); g.translate(540, 880); g.scale(z, z);
  text(g, 'E SE...', 0, -260, { size: 70, color: '#22e1ff', font: FONTS.ui, weight: 900, spacing: 10, alpha: ease.out(prog(t, 0.05, 0.3)) });
  const a = ease.outBack(prog(t, 0.2, 0.55)); g.save(); g.scale(a, a); text(g, 'O BRASIL', 0, -100, { size: 130, color: WH, stroke: 20, strokeColor: INK }); text(g, 'APAGASSE', 0, 40, { size: 150, color: '#ffd23a', stroke: 22, strokeColor: INK, alpha: fl }); text(g, 'INTEIRO?', 0, 180, { size: 130, color: WH, stroke: 20, strokeColor: INK }); g.restore();
  g.restore(); } });
registerShot('Kc', { draw(g, t) { UI.seguir(g, t, { linha1: 'GOSTOU?', proximo: 'O PRÓXIMO E SE — VOCÊ ESCOLHE NOS COMENTÁRIOS', outfit: VC }); } });
