// Ep. 1 — cenas s14–s25 (a faca cai, o céu clareia, corrida pro alçapão, clarão e título)
import { E, SAFE, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, rr, seg, poly, circle, glow, shade, alpha, text, FONTS, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { quintal, fumaca, GRILL_X } from '../sets/quintal.js';
import { cozinha, bunker } from '../sets/interiores.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';
import { mao } from './01_domingo.js';

const INK = '#0b0b0d', WH = '#f1efe9';
const blink = (t, p = 3.1) => (t % p) > p - 0.12;
const run = (t, k = 1.6) => walkPose(t * Math.PI * 2 * k, { run: true });

registerShot('s14', { draw(g, t, info) {   // insert: a faca cai na tábua
  const hit = 0.75, sh = t > hit ? shake(t, 18 * Math.max(0, 1 - (t - hit) * 3.5), 24) : [0, 0], z = 1.02 + 0.06 * (t / info.dur);
  g.save(); g.translate(E.W / 2 + sh[0], E.H / 2 + sh[1]); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = '#3a3e48'; g.fillRect(-200, -200, E.W + 400, E.H + 400);
  rr(g, 110, 620, 800, 640, 40); g.fillStyle = INK; g.fill(); rr(g, 122, 632, 776, 616, 32); g.fillStyle = '#a89878'; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 4; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(150, 700 + i * 95); g.lineTo(870, 690 + i * 95); g.stroke(); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(360, 900, 200, 130, -0.2, 0, 7); g.fill(); g.fillStyle = '#8a5a48'; g.beginPath(); g.ellipse(360, 900, 190, 120, -0.2, 0, 7); g.fill(); g.fillStyle = '#c9b8a8'; g.beginPath(); g.ellipse(330, 880, 60, 30, -0.2, 0, 7); g.fill();
  const f = ease.in(prog(t, 0.35, hit)), b = t > hit ? Math.max(0, Math.sin((t - hit) * 26)) * 26 * Math.max(0, 1 - (t - hit) * 3) : 0;
  const ky = lerp(330, 1010, f) - b, rot = lerp(-0.5, 0.18, f) + (t > hit ? Math.sin((t - hit) * 30) * 0.06 * Math.max(0, 1 - (t - hit) * 3) : 0);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(640, 1040, 230 * (0.5 + 0.5 * f), 26, 0.18, 0, 7); g.fill();
  g.save(); g.translate(640, ky); g.rotate(rot);
  poly(g, [[-250, -34], [70, -40], [70, 34], [-190, 34]], INK); poly(g, [[-232, -24], [62, -30], [62, 24], [-186, 24]], '#d5d9e0');
  rr(g, 62, -36, 220, 72, 22); g.fillStyle = INK; g.fill(); rr(g, 72, -27, 200, 54, 16); g.fillStyle = '#3a2e2a'; g.fill();
  g.restore();
  const open = ease.out(prog(t, 0.2, 0.5));
  mao(g, [[1000, -200], [900, 120], [820, 300 - 40 * open]], 150); for (let i = 0; i < 4; i++) mao(g, [[800 + i * 24, 300 - 40 * open], [730 + i * 46 - 30 * open, 430 - 90 * open + i * 8]], 46);
  if (t > hit) FX.rings(g, 640, 1010, t - hit, { count: 2, r0: 160, r1: 520, color: '#ffffff', a: 0.4 * Math.max(0, 1 - (t - hit) * 2), speed: 2.2, w: 5 });
  g.restore();
}});

registerShot('s15', { draw(g, t, info) {
  const sh = shake(t, 3, 5), cam = { z: 1.02 + 0.1 * ease.inOut(t / info.dur), x: sh[0], y: sh[1] };
  blurLayer(g, 12, g => cozinha(g, t, { z: 1.4, x: -60, y: 120 }), cam, 0.6); veil(g, '#000', 0.5);
  layer(g, cam, 1, g => bigFace(g, 500, 880, 300, { outfit: MARIANA, expr: t < 0.9 ? 'surprised' : 'scared', look: [-0.7, 0], blink: blink(t, 2.2), rimSide: -1 }));
}});

registerShot('s16', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), white = 0.4 * k, cam = { z: 1.06 - 0.06 * k, y: 20 };
  const { GY } = quintal(g, t, cam, { gate: 1, white });
  const up = { look: [0.2, -1] };
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 190, y: GY + 20, s: 1.5, facing: 1, outfit: OSVALDO, pose: breathe(POSES.ready, t, 1, 5), expr: 'determined', ...up });
    drawFigure(g, { x: 330, y: GY + 40, s: 1.5 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.relaxed, t, 1, 2), expr: 'confused', ...up });
    drawFigure(g, { x: 620, y: GY + 10, s: 1.5, facing: 1, outfit: EDUARDO, pose: breathe(posesAt(t, [[0, 'crossArms'], [0.8, 'relaxed']]), t, 1, 1), expr: 'surprised', ...up });
    drawFigure(g, { x: 470, y: GY + 50, s: 1.5, facing: 1, outfit: MARIANA, pose: breathe(POSES.handsOnHead, t, 1, 4), expr: 'scared', look: [-0.2, -1] });
  });
  veil(g, '#ffffff', 0.1 * k, 'lighter');
}});

registerShot('s17', { draw(g, t, info) {
  const k = t / info.dur, white = 0.4 + 0.3 * k, cam = { z: 1.0 + 0.08 * ease.inOut(k) };
  blurLayer(g, 12, g => quintal(g, t, { z: 1.5, x: 100, y: 260 }, { gate: 1, white }), cam, 0.6);
  layer(g, cam, 1, g => bigFace(g, 500, 900, 300, { outfit: EDUARDO, expr: 'awe', look: [0.1, -0.9], blink: false, rimSide: 1, tilt: -0.05 }));
  veil(g, '#ffffff', 0.08 + 0.2 * k, 'lighter');
}});

registerShot('s18', { draw(g, t, info) {
  const cam = { z: 1.15, x: 60 + 240 * t, y: 90 }, white = 0.72, d = 430 * t;
  const { GY } = quintal(g, t, cam, { gate: 1, white });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 190 + d, y: GY + 60, s: 1.6, facing: 1, outfit: MARIANA, pose: run(t, 1.7), expr: 'scared', trail: { count: 2, dx: -30 } });
    drawFigure(g, { x: 330 + d, y: GY + 30, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: run(t + 0.2, 1.8), expr: 'scared', trail: { count: 2, dx: -30 } });
    drawFigure(g, { x: 460 + d, y: GY + 70, s: 1.6, facing: 1, outfit: EDUARDO, pose: run(t + 0.4, 1.7), expr: 'shocked', trail: { count: 2, dx: -30 } });
    drawFigure(g, { x: 600 + d, y: GY + 20, s: 1.6, facing: 1, outfit: OSVALDO, pose: run(t + 0.1, 1.6), expr: 'determined', trail: { count: 2, dx: -30 } });
  });
  FX.speedLines(g, t, { cy: 1000, a: 0.14, inner: 420 }); veil(g, '#ffffff', 0.14, 'lighter');
}});

registerShot('s19', { draw(g, t, info) {
  const hatch = ease.outBack(prog(t, 0.08, 0.45)), sh = shake(t, 10 * Math.max(0, 1 - Math.abs(t - 0.15) * 5), 20), cam = { z: 1.36 + 0.05 * t, x: 170 + sh[0], y: 230 + sh[1] };
  const { GY } = quintal(g, t, cam, { gate: 1, white: 0.78, hatch, smoke: true });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 610, y: GY + 20, s: 1.5, facing: 1, outfit: OSVALDO, pose: posesAt(t, [[0, 'reach'], [0.4, 'crouch']], 0.2), expr: 'determined' });
    drawFigure(g, { x: 440, y: GY + 50, s: 1.55, facing: 1, outfit: EDUARDO, pose: posesAt(t, [[0, 'ready'], [0.5, 'handsOnHead']], 0.2), expr: t > 0.45 ? 'shocked' : 'surprised' });
  });
  veil(g, '#ffffff', 0.14, 'lighter');
}});

registerShot('s20', { draw(g, t, info) {
  const T = info.globalT, sh = shake(t, 9, 14), cam = { z: 1.06 + 0.1 * ease.out(t / info.dur), x: sh[0], y: sh[1] };
  blurLayer(g, 12, g => quintal(g, t, { z: 1.8, x: 330, y: 330 }, { gate: 1, white: 0.8, hatch: 1 }), cam, 0.6);
  FX.speedLines(g, t, { cx: 500, cy: 880, a: 0.3, inner: 400, color: '#ffffff' });
  layer(g, cam, 1, g => bigFace(g, 500, 880, 310, { outfit: EDUARDO, expr: 'shocked', talk: talkAmount(T, 42.0, 44.4), look: [0.4, 0.3], rimSide: 1 }));
  veil(g, '#ffffff', 0.12, 'lighter');
}});

registerShot('s21', { draw(g, t, info) {
  const T = info.globalT, cam = { z: 1.3 + 0.05 * (t / info.dur), x: 130, y: 200 };
  const { GY } = quintal(g, t, cam, { gate: 1, white: 0.85, hatch: 1 });
  const go = ease.in(prog(t, 1.35, 2.3));
  layer(g, cam, 1, g => {
    const rd = prog(t, 0.1, 0.8); if (rd < 1) drawFigure(g, { x: lerp(640, 790, rd), y: GY + 10 + 60 * rd, s: 1.5 * RAFAEL_S * (1 - 0.35 * rd), facing: 1, outfit: RAFAEL, pose: POSES.crouch, expr: 'scared', alpha: 1 - rd, shadow: false });
    drawFigure(g, { x: lerp(420, 760, go), y: GY + 50, s: 1.55 * (1 - 0.3 * go), facing: 1, outfit: EDUARDO, pose: go > 0 ? run(t, 1.8) : breathe(POSES.shrug, t, 1, 1), expr: go > 0 ? 'scared' : 'confused', alpha: 1 - go * go });
    drawFigure(g, { x: 590, y: GY + 20, s: 1.6, facing: -1, outfit: OSVALDO, pose: breathe(posesAt(t, [[0, 'crouch'], [0.2, 'point'], [1.3, 'wave']], 0.2), t, 1, 5), expr: 'angry', talk: talkAmount(T, 44.5, 46.7) });
  });
  veil(g, '#ffffff', 0.16, 'lighter');
}});

registerShot('s22', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.05 * k, y: -30 * k };
  const { GY, CX } = bunker(g, t, cam, { open: 1, white: 0.9 });
  const ey = lerp(GY - 520, GY, ease.inOut(prog(t, 0, 1.9)));
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 230, y: GY + 20, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.handsOnHead, t, 1, 2), expr: 'scared', look: [0.5, -1] });
    drawFigure(g, { x: 830, y: GY + 30, s: 1.6, facing: -1, outfit: MARIANA, pose: breathe(POSES.sad, t, 1, 4), expr: 'sad', look: [0, 0.6] });
    drawFigure(g, { x: CX + 6, y: ey, s: 1.6, facing: -1, outfit: EDUARDO, pose: ey < GY - 4 ? posesAt((t * 2.2) % 1, [[0, 'reach'], [0.5, 'pointUp'], [1, 'reach']], 0.3) : POSES.relaxed, expr: 'scared', look: [0, -1], shadow: ey >= GY - 4 });
    drawFigure(g, { x: CX + 10, y: 880 + 40 * k, s: 1.5, facing: 1, outfit: OSVALDO, pose: POSES.pointUp, expr: 'determined', shadow: false });
  });
  FX.dust(g, t, { count: 40, color: '#ffffff' });
}});

registerShot('s23', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), open = lerp(1, 0.05, ease.inOut(prog(t, 0.3, 3.0))), cam = { z: 1.05 + 0.1 * k, y: -40 + 60 * k };
  const { GY, CX } = bunker(g, t, cam, { open, white: 1 });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 220, y: GY + 20, s: 1.6 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(POSES.handsOnHead, t, 1, 2), expr: 'scared', look: [0.5, -1] });
    drawFigure(g, { x: 840, y: GY + 30, s: 1.6, facing: -1, outfit: MARIANA, pose: breathe(POSES.sad, t, 1, 4), expr: 'cry', look: [0, 0.6] });
    drawFigure(g, { x: 430, y: GY + 40, s: 1.9, facing: 1, outfit: EDUARDO, pose: breathe(POSES.relaxed, t, 1, 1), expr: 'worried', look: [0.3, -1], blink: blink(t) });
    drawFigure(g, { x: CX + 10, y: 930, s: 1.5, facing: 1, outfit: OSVALDO, pose: POSES.pointUp, expr: 'determined', shadow: false });
  });
  veil(g, '#000', 0.55 * (1 - open));
  FX.dust(g, t, { count: 30, color: '#ffffff', a: 0.5 * open + 0.1 });
}});

registerShot('s24', { draw(g, t, info) {
  const sh = shake(t, 26 * Math.max(0, 1 - t * 0.9), 26), cam = { z: 1.15, x: sh[0], y: 20 + sh[1] };
  const { GY, CX } = bunker(g, t, cam, { open: 0.05, white: 1 });
  layer(g, cam, 1, g => drawFigure(g, { x: 430, y: GY + 40, s: 1.9, facing: 1, outfit: EDUARDO, pose: POSES.crouch, expr: 'scared', look: [0.3, -1] }));
  veil(g, '#000', 0.5);
  const a = key(t, [[0, 0.2], [0.25, 1], [0.7, 0.9], [1.4, 0]]);
  glow(g, CX + 170, 330, 500 + 2600 * prog(t, 0, 0.3), '#ffffff', Math.min(1, a * 1.2)); veil(g, '#ffffff', a * 0.9);
  veil(g, '#000', prog(t, 0.8, 1.4));
}});

registerShot('s25', { draw(g, t, info) {   // título
  const ui = S().ui; g.fillStyle = '#060607'; g.fillRect(0, 0, E.W, E.H);
  glow(g, 500, 1560, 700, '#e8a04a', 0.12 + 0.03 * Math.sin(t * 5)); fumaca(g, t + 3, 500, 1500, { n: 10, rise: 900, a: 0.07, spread: 300 });
  const z = 1 + 0.03 * t; g.save(); g.translate(500, 900); g.scale(z, z);
  const a1 = ease.out(prog(t, 0.1, 0.5)), a2 = ease.out(prog(t, 0.35, 0.8)), a3 = ease.out(prog(t, 0.7, 1.1));
  text(g, 'O QUE A MAMÃE SABIA', 0, -230, { size: 40, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 6, alpha: a1 });
  text(g, 'DOMINGO DE', 0, -110, { size: 104, color: ui.cream, spacing: 3, alpha: a2 });
  text(g, 'CHURRASCO', 0, 10, { size: 122, color: ui.cream, spacing: 3, alpha: a2 });
  g.fillStyle = alpha(ui.accent, a3); g.fillRect(-170 * a3, 100, 340 * a3, 8);
  text(g, 'EPISÓDIO 1', 0, 170, { size: 54, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 8, alpha: a3 });
  g.restore();
}});
