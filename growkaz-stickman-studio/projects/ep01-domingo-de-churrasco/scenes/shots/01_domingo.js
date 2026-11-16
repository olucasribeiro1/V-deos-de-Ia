// Ep. 1 — DOMINGO DE CHURRASCO · cenas s01–s13 (domingo normal até a chegada do tio)
import { E, SAFE, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, wordTime, rr, seg, circle, glow, shade, alpha, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { quintal, bilu, GRILL_X } from '../sets/quintal.js';
import { cozinha, bancada } from '../sets/interiores.js';
import { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S } from '../cast.js';

const INK = '#0b0b0d', WH = '#f1efe9';
const blink = (t, p = 3.1) => (t % p) > p - 0.12;
const run = (t, k = 1.6) => walkPose(t * Math.PI * 2 * k, { run: true });
export const mao = (g, pts, w = 60) => { seg(g, pts, w + 14, INK); seg(g, pts, w, WH); };

registerShot('s01', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.14 - 0.12 * k, x: 60 - 60 * k, y: 30 - 30 * k };
  const { GY } = quintal(g, t, cam);
  const dx = 900 - 250 * t;
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 640, y: GY, s: 1.5, facing: 1, outfit: EDUARDO, pose: breathe(POSES.holdFront, t, 1, 1), expr: 'smile', blink: blink(t) });
    bilu(g, { x: dx, y: GY + 90, s: 1.25, facing: -1, t, run: 1, sausage: true });
    drawFigure(g, { x: dx + 260, y: GY + 90, s: 1.5 * RAFAEL_S, facing: -1, outfit: RAFAEL, pose: run(t), expr: 'joy' });
  });
  FX.dust(g, t, { count: 30 });
}});

registerShot('s02', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 + 0.1 * k, x: -70 };
  const { GY, M } = cozinha(g, t, cam);
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 420, y: GY, s: 2.3, facing: 1, outfit: MARIANA, pose: breathe(POSES.phone, t, 1, 4), expr: 'worried', prop: 'phone', look: [0.4, 0.7], blink: blink(t, 2.6) });
    bancada(g, GY, M);
  });
  FX.dust(g, t, { count: 24 });
}});

registerShot('s03', { draw(g, t, info) {   // insert: celular virado pra baixo
  const M = cozinha.M || null; const ui = S().ui; const hit = 0.14, sh = t > hit ? shake(t, 14 * Math.max(0, 1 - (t - hit) * 4), 22) : [0, 0];
  const z = 1.02 + 0.05 * (t / info.dur);
  g.save(); g.translate(E.W / 2 + sh[0], E.H / 2 + sh[1]); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = '#3a3e48'; g.fillRect(-200, -200, E.W + 400, E.H + 400); g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 9; i++) g.fillRect(-200, i * 260 - 100, E.W + 400, 6);
  const f = ease.out(prog(t, 0, hit)), sx = Math.cos(f * Math.PI), cx = 500, cy = 860, pw = 330, ph = 620;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(cx + 20, cy + 30, pw * 0.6, ph * 0.52, 0, 0, 7); g.fill();
  g.save(); g.translate(cx, cy); g.rotate(-0.12); g.scale(Math.max(0.04, Math.abs(sx)), 1);
  rr(g, -pw / 2 - 8, -ph / 2 - 8, pw + 16, ph + 16, 46); g.fillStyle = INK; g.fill();
  if (sx > 0) { rr(g, -pw / 2 + 12, -ph / 2 + 12, pw - 24, ph - 24, 30); g.fillStyle = '#cfd8e6'; g.fill(); glow(g, 0, 0, 420, '#cfd8e6', 0.25);
    for (let i = 0; i < 4; i++) { rr(g, -pw / 2 + 40, -ph / 2 + 150 + i * 92, pw - 80 - (i % 2) * 70, 60, 16); g.fillStyle = 'rgba(40,48,62,.5)'; g.fill(); }
    circle(g, pw / 2 - 50, -ph / 2 + 60, 26, ui.accent); }
  else { rr(g, -pw / 2 + 6, -ph / 2 + 6, pw - 12, ph - 12, 40); g.fillStyle = '#1c1e24'; g.fill(); circle(g, -pw / 2 + 70, -ph / 2 + 70, 30, '#0b0b0d'); circle(g, -pw / 2 + 70, -ph / 2 + 70, 16, '#30343c'); }
  g.restore();
  const hy = lerp(1500, 1180, ease.out(prog(t, 0, hit)));
  mao(g, [[720, 2100], [640, hy + 260], [560, hy]], 150); mao(g, [[560, hy], [430, hy - 110]], 56); mao(g, [[600, hy - 30], [520, hy - 190]], 56); mao(g, [[660, hy - 20], [620, hy - 190]], 56);
  if (t > hit) FX.rings(g, cx, cy, t - hit, { count: 2, r0: 200, r1: 560, color: '#ffffff', a: 0.35 * Math.max(0, 1 - (t - hit) * 2), speed: 2.2, w: 5 });
  g.restore();
}});

registerShot('s04', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.06 * k, x: 40 * k };
  const { GY, M } = cozinha(g, t, cam);
  const ex = lerp(1120, 800, ease.out(prog(t, 0, 1.3))), walking = t < 1.3;
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 380, y: GY, s: 2.2, facing: 1, outfit: MARIANA, pose: breathe(posesAt(t, [[0, 'stand'], [0.5, 'wave']]), t, 1, 4), expr: t < 0.5 ? 'surprised' : 'nervous', blink: blink(t, 2.4) });
    bancada(g, GY, M);
    rr(g, 560, GY - 226, 96, 16, 6); g.fillStyle = INK; g.fill();   // celular virado pra baixo
    drawFigure(g, { x: ex, y: GY + 40, s: 2.2, facing: -1, outfit: EDUARDO, pose: walking ? walkPose(t * Math.PI * 2 * 0.9) : breathe(POSES.relaxed, t, 1, 1), expr: t > 1.6 ? 'confused' : 'neutral', blink: blink(t) });
  });
  FX.dust(g, t, { count: 24 });
}});

registerShot('s05', { draw(g, t, info) {
  const T = info.globalT, k = ease.inOut(t / info.dur), cam = { z: 1.22 + 0.06 * k, x: 150, y: 60 };
  const { GY } = quintal(g, t, cam);
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 660, y: GY, s: 1.75, facing: -1, outfit: EDUARDO, pose: breathe(posesAt(t, [[0, 'holdFront'], [1.6, 'crossArms']]), t, 1, 1), expr: t > 1.6 ? 'smirk' : 'neutral', blink: blink(t) });
    drawFigure(g, { x: 400, y: GY + 20, s: 1.75 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: breathe(posesAt(t, [[0, 'reach'], [1.0, 'cheer'], [1.5, 'reach'], [2.1, 'handsOnHead']], 0.2), t, 2, 2), expr: t > 2.0 ? 'cry' : 'sad', talk: talkAmount(T, ...info.L.r1) });
  });
  FX.dust(g, t, { count: 30 });
}});

registerShot('s06', { draw(g, t, info) {
  const T = info.globalT, cam = { z: 1.0 + 0.05 * (t / info.dur) };
  blurLayer(g, 12, g => quintal(g, t, { z: 1.5, x: 200, y: 200 }), cam, 0.6); veil(g, '#000', 0.3);
  layer(g, cam, 1, g => bigFace(g, 500, 860, 300, { outfit: EDUARDO, expr: 'angry', talk: talkAmount(T, ...info.L.e1), look: [-0.5, 0.1], rimSide: -1, tilt: -0.04 }));
}});

registerShot('s07', { draw(g, t, info) {
  const dx = 250 + 330 * t, cam = { z: 1.18, x: dx - 520, y: 110 };
  const { GY } = quintal(g, t, cam);
  layer(g, cam, 1, g => {
    drawFigure(g, { x: dx - 380, y: GY + 70, s: 1.9 * RAFAEL_S, facing: 1, outfit: RAFAEL, pose: run(t, 1.8), expr: 'joy', trail: { count: 3, dx: -34 } });
    bilu(g, { x: dx, y: GY + 80, s: 1.9, facing: 1, t, run: 1, sausage: true });
  });
  FX.speedLines(g, t, { cx: E.W / 2, cy: 1050, a: 0.12, inner: 420 });
}});

registerShot('s08', { draw(g, t, info) {   // Mariana na janela, vista do quintal
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.1 * k, y: -20 * k };
  layer(g, cam, 1, g => {
    const M = S(); g.fillStyle = '#4a4e58'; g.fillRect(-400, -400, E.W + 800, E.H + 800);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; for (let y = -200; y < E.H + 300; y += 120) { g.beginPath(); g.moveTo(-400, y + 40 * Math.sin(y)); g.lineTo(E.W + 400, y + 30 * Math.cos(y)); g.stroke(); }
    const wx = 190, wy = 470, ww = 700, wh = 760;
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    g.fillStyle = '#15171c'; g.fillRect(wx, wy, ww, wh); glow(g, wx + ww * 0.8, wy + 100, 380, '#e8d6a0', 0.18);
    drawFigure(g, { x: 520, y: 1560, s: 3.0, facing: 1, outfit: MARIANA, pose: breathe(POSES.stand, t, 1, 4), expr: 'worried', look: [0.9, -0.5], blink: blink(t, 2.8), shadow: false });
    g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(wx + 80, wy); g.lineTo(wx + 260, wy); g.lineTo(wx + 40, wy + wh); g.lineTo(wx - 140, wy + wh); g.fill();
    g.restore();
    g.fillStyle = INK; g.fillRect(wx + ww / 2 - 9, wy, 18, wh); g.fillRect(wx, wy + wh * 0.42, ww, 14);
    g.strokeStyle = INK; g.lineWidth = 26; g.strokeRect(wx, wy, ww, wh); g.fillStyle = '#6a6e78'; g.fillRect(wx - 40, wy + wh + 10, ww + 80, 34); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(wx - 40, wy + wh + 10, ww + 80, 34);
  });
  blurLayer(g, 8, g => { g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-100, 250); g.quadraticCurveTo(540, 330, 1200, 210); g.stroke(); rr(g, 60, 290, 190, 230, 8); g.fillStyle = '#8f9aa6'; g.fill(); }, cam, 1.6);
  FX.dust(g, t, { count: 26 });
}});

registerShot('s09', { draw(g, t, info) {
  const T = info.globalT, cam = { z: 1.0 + 0.07 * ease.inOut(t / info.dur) };
  blurLayer(g, 12, g => cozinha(g, t, { z: 1.4, x: -60, y: 120 }), cam, 0.6); veil(g, '#000', 0.35);
  const t1 = wordTime('disfar', info.shot.start) ?? 1e9, t2 = wordTime('errado', info.shot.start) ?? 1e9, ex = T < t1 ? 'smile' : T < t2 - 0.1 ? 'nervous' : 'worried';
  layer(g, cam, 1, g => bigFace(g, 500, 880, 300, { outfit: MARIANA, expr: ex, blink: blink(t, 1.9), look: T < t1 ? [0, 0] : [0.5, -0.2], rimSide: 1 }));
}});

registerShot('s10', { draw(g, t, info) {
  const sh = shake(t, 16 * Math.max(0, 1 - t * 2.2), 20), cam = { z: 1.3, x: -230 + sh[0], y: 120 + sh[1] };
  const gate = ease.out(prog(t, 0.02, 0.22));
  const { GY } = quintal(g, t, cam, { gate });
  const ox = lerp(150, 330, ease.out(prog(t, 0.15, 0.9)));
  layer(g, cam, 1, g => drawFigure(g, { x: ox, y: GY + 10, s: 2.0, facing: 1, outfit: OSVALDO, pose: t < 0.85 ? walkPose(t * Math.PI * 2 * 1.5) : POSES.ready, expr: 'determined', alpha: prog(t, 0.08, 0.25) }));
  FX.dust(g, t, { count: 50, color: '#d9d6cc', area: [0, 700, 700, 700], speed: 40 });
}});

registerShot('s11', { draw(g, t, info) {
  const T = info.globalT, punch = T > (wordTime('agora', info.shot.start) ?? 1e9) ? 1.13 : 1, cam = { z: punch + 0.03 * t };
  blurLayer(g, 12, g => quintal(g, t, { z: 1.6, x: -260, y: 200 }, { gate: 1 }), cam, 0.6); veil(g, '#000', 0.4);
  layer(g, cam, 1, g => bigFace(g, 500, 870, 300, { outfit: OSVALDO, expr: 'determined', talk: talkAmount(T, ...info.L.o1), look: [0.2, 0], rimSide: -1 }));
}});

registerShot('s12', { draw(g, t, info) {
  const T = info.globalT, k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.05 * k, x: 20, y: 60 };
  const { GY } = quintal(g, t, cam, { gate: 1 });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 300, y: GY + 20, s: 1.75, facing: 1, outfit: OSVALDO, pose: breathe(posesAt(t, [[0, 'ready'], [0.25, 'point']], 0.2), t, 1, 5), expr: 'angry', talk: talkAmount(T, ...info.L.o1) });
    drawFigure(g, { x: 520, y: GY + 30, s: 1.75 * RAFAEL_S, facing: -1, outfit: RAFAEL, pose: breathe(POSES.relaxed, t, 1, 2), expr: 'confused', blink: blink(t, 2.7) });
    drawFigure(g, { x: 660, y: GY, s: 1.75, facing: -1, outfit: EDUARDO, pose: breathe(POSES.holdFront, t, 1, 1), expr: 'surprised', blink: blink(t) });
  });
  FX.dust(g, t, { count: 30 });
}});

registerShot('s13', { draw(g, t, info) {
  const T = info.globalT, k = ease.inOut(t / info.dur), cam = { z: 1.3 + 0.06 * k, x: 60, y: 130 };
  const { GY } = quintal(g, t, cam, { gate: 1 });
  layer(g, cam, 1, g => {
    drawFigure(g, { x: 650, y: GY, s: 1.9, facing: -1, outfit: EDUARDO, pose: breathe(POSES.crossArms, t, 1, 1), expr: T > info.L.r2[0] + 1.3 ? 'smirk' : 'neutral', blink: blink(t) });
    drawFigure(g, { x: 420, y: GY + 30, s: 1.9 * RAFAEL_S, facing: -1, outfit: RAFAEL, pose: breathe(posesAt(t, [[0, 'relaxed'], [0.3, 'shrug'], [1.5, 'point'], [2.0, 'shrug']], 0.22), t, 1.5, 2), expr: 'smirk', talk: talkAmount(T, ...info.L.r2) });
  });
  FX.dust(g, t, { count: 30 });
}});
