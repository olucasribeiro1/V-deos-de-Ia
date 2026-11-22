// A ESTAÇÃO · EP. 1 — cenas (3D low poly PS2, terceira pessoa acompanhando a Lívia). Todos os tempos saem das falas (W + info.L)
// e das caminhadas do build (info.passos). Pensamento: boca fechada, rosto atua. Em voz alta (x00/l06, l09, l11): boca mexe.
import { E, registerShot, text, FONTS, glow } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';
import { THREE, palco, cam3, trajeto, anda, passo, vive, post, W, setWall, clamp, lerp, ease, noise, prog } from '/series/estacao/base.js';
import { mulher, LIVIA, sombra, exprEm } from '/series/estacao/elenco.js';
import { rua, ruaVive, stairY, METRO } from '/series/estacao/rua.js';

const DEF = {};
export const reg = (id, def) => { const d = { ...def, init(T, info) { setWall(info.Wall); return def.init(T, info); } }; DEF[id] = d; registerShot(id, d); };
export const OLHO = 1.53;
// posição de câmera em volta de quem anda: d à frente (ou atrás se <0), lado (+ = direita dela), altura h
export const orbita = (q, d, lado, h) => [q.x + Math.sin(q.ry) * d + Math.cos(q.ry) * lado, h, q.z + Math.cos(q.ry) * d - Math.sin(q.ry) * lado];
export function livia(st) { const L = mulher(LIVIA); st.add(L); const sb = sombra(0.3, 0.5); st.add(sb); L.sb = sb; return L; }
export const pe = (L) => { L.sb.position.set(L.position.x, L.position.y + 0.012, L.position.z); };
const qL = (L) => ({ x: L.position.x, y: L.position.y, z: L.position.z, ry: L.rotation.y });

// ====================== A — a rua viva, à noite (l01, l02) ======================
reg('A', { kind: '3d',
  init(T, info) {
    const st = palco(T, { neblina: '#1a1418', fogStart: 16, fogDens: 0.035 }); const M = rua(st);
    const L = livia(st), Lx = info.L;
    const [a, b, c] = [passo(info, 0), passo(info, 1), passo(info, 2)];
    const tj = [trajeto([[-3, 0.9], [7.4, 0.9]], a[0], a[1], a[2]), trajeto([[7.4, 0.9], [10.6, 1.3], [11.4, 2.0]], b[0], b[1], b[2]), trajeto([[11.4, 2.0], [16.2, 2.0]], c[0], c[1], c[2])];
    const t = { metro: W('metrô', Lx.l02), gracas: W('graças', Lx.l02), ne: W('né', Lx.l02), tres: W('três', Lx.l01), ag: W('aguentar', Lx.l01) };
    const ex = [[5.75, 'aperto'], [t.ag, { ...{ by: 0.45, bi: 0.85, eo: 0.9, ms: -0.5, mp: 0.9 } }], [Lx.l01[1] + 0.2, 'aperto'], [t.metro - 0.15, 'susto'], [t.gracas, 'alivio'], [t.ne - 0.1, 'desconfia'], [Lx.l02[1] + 0.3, 'aperto']];
    const q = (TT) => { const k = TT < tj[1].t0 ? 0 : TT < tj[2].t0 ? 1 : 2; return { ...tj[k].at(TT), y: k === 2 ? stairY(tj[2].at(TT).x) : 0 }; };
    const H = (TT) => { const p = q(TT); return [p.x, p.y + OLHO, p.z]; };
    const K = [
      [5.75, { p: (T) => { const p = q(T); return [p.x + 3.4, 1.5, p.z + 1.7]; }, m: (T) => { const p = q(T); return [p.x, 1.25, p.z]; }, f: 42 }],
      [8.4, { p: (T) => { const p = q(T); return [p.x + 1.3, 1.6, p.z + 0.75]; }, m: H, f: 34 }],
      [11.4, { p: (T) => { const p = q(T); return [p.x + 1.1, 1.58, p.z + 0.6]; }, m: H, f: 30 }],
      [12.05, { p: (T) => { const p = q(T); return [p.x + 0.1, 1.8, p.z + 1.5]; }, m: (T) => { const p = q(T); return [p.x + 0.3, 1.45, p.z]; }, f: 42 }],
      [12.6, { p: (T) => { const p = q(T); return [p.x - 1.3, 1.95, p.z - 0.6]; }, m: [10.9, 2.5, 3.6], f: 40 }],
      [13.9, { p: (T) => { const p = q(T); return [p.x - 1.2, 1.95, p.z - 0.6]; }, m: [10.9, 2.4, 3.6], f: 38 }],
      [14.6, { p: (T) => { const p = q(T); return [p.x + 1.15, 1.58, p.z + 0.85]; }, m: H, f: 32 }],
      [16.6, { p: (T) => { const p = q(T); return [p.x + 0.8, 1.6, p.z + 1.0]; }, m: H, f: 32 }],
      [17.4, { p: [10.0, 2.4, 1.0], m: (T) => { const p = q(T); return [p.x, p.y + 1.2, p.z]; }, f: 46 }],
      [19.8, { p: [10.4, 2.0, 1.2], m: (T) => { const p = q(T); return [p.x, p.y + 1.0, p.z]; }, f: 44 }],
    ];
    return { stage: st, M, L, tj, t, ex, K, q };
  },
  draw(s, lt, info) {
    const T = info.globalT, st = s.stage, L = s.L, Lx = info.L, t = s.t;
    const k = T < s.tj[1].t0 ? 0 : T < s.tj[2].t0 ? 1 : 2;
    anda(L, s.tj[k], T, { y: k === 2 ? stairY(s.tj[2].at(T).x) : 0 }); pe(L);
    if (k === 2) L.position.y = stairY(L.position.x);
    // aperto: mão na barriga e passo curto; ao ver o metrô, olha o totem
    if (T < t.metro - 0.2 || T > Lx.l02[1]) L.alcanca('D', [L.position.x + Math.sin(L.rotation.y) * 0.16 + Math.cos(L.rotation.y) * 0.02, L.position.y + 0.98, L.position.z + Math.cos(L.rotation.y) * 0.16 - Math.sin(L.rotation.y) * 0.02], { punho: [0, 0, 0.3], dedos: 0.35, polo: [1, -0.6, -1] });
    if (T > t.metro - 0.4 && T < t.gracas + 1.2) L.olhaPara([10.9, 2.6, 3.6], 1.0, 0.25); else { L.cab.rotation.set(0, 0, 0); }
    vive(L, T, Lx, [], s.ex); L.respira(T, T < Lx.l01[1] ? 2.2 : 1);
    ruaVive(s.M, T, [L.position.x, 0, L.position.z]);
    cam3(st.camera, T, s.K);
    post(st, T, { expo: 1.35, tint: [1.04, 0.98, 0.9], sat: 0.95 });
  },
});

// ====================== X — COLD OPEN: o espelho (cena D com o tempo deslocado) ======================
const infoSrc = (info, T) => ({ ...info, globalT: T });
registerShot('X', { kind: '3d',
  init(T, info) { setWall(info.Wall); const d = DEF[info.src]; const st = d.init(T, infoSrc(info, info.off)); return { st, d, stage: st.stage }; },
  draw(s, lt, info) { s.d.draw(s.st, lt, infoSrc(info, info.off + lt)); s.st.stage.post({ vhs: 0.45 + 0.6 * Math.exp(-lt * 3) }); },
  overlay(g, lt) { vhsOSD(g, lt, { rec: true }); },
});
// ====================== RW — rebobinar VHS + "10 MINUTOS ANTES" ======================
const RW_REV = 0.95;
registerShot('RW', { kind: '3d',
  init(T, info) { setWall(info.Wall); const d = DEF[info.src]; const st = d.init(T, infoSrc(info, info.b)); return { st, d, stage: st.stage }; },
  draw(s, lt, info) {
    const k = clamp(lt / RW_REV), tt = lerp(info.b, info.a - 3.5, ease.in(k));
    s.d.draw(s.st, lt, infoSrc(info, tt));
    s.st.stage.post({ vhs: 3 + 5 * k, trk: 0.6 + 0.4 * k, aberr: 2.2 + 2 * k, sat: 0.45, scan: 0.3, fade: lt > RW_REV ? 1 : 0 });
  },
  overlay(g, lt, info) {
    const R = (a, b) => { let x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
    const fr = Math.floor(lt * 24), X0 = E.VX, Y0 = E.VY, VW = E.VW, VH = E.VH;
    if (lt < RW_REV) {
      for (let i = 0; i < 7; i++) { const y = Y0 + ((R(i, fr) * VH + lt * 2400 * (1 + i * 0.3)) % VH), h = 6 + R(i + 9, fr) * 40; g.fillStyle = `rgba(235,235,235,${0.12 + 0.25 * R(i + 3, fr)})`; g.fillRect(X0, y, VW, h); }
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.5 * R(i, fr + 1)})`; g.fillRect(X0 + R(i + 1, fr) * VW, Y0 + R(i + 2, fr) * VH, 6 + R(i, fr) * 30, 3); }
      if ((fr % 12) < 8) text(g, '◀◀  REW', Math.max(110, X0 + 110) + 120, Math.max(300, Y0 + 140), { size: 78, color: '#f2f2ea', font: FONTS.ui, weight: 900, spacing: 4, stroke: 10, strokeColor: '#0b0b0d' });
    } else {
      const k = lt - RW_REV; g.fillStyle = '#0a1450'; g.fillRect(X0, Y0, VW, VH);
      for (let y = Y0; y < Y0 + VH; y += 6) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(X0, y + 3, VW, 3); }
      const a = ease.outBack(prog(k, 0, 0.22));
      text(g, '▶  PLAY', Math.max(110, X0 + 110) + 110, Math.max(300, Y0 + 140), { size: 64, color: '#f2f2ea', font: FONTS.ui, weight: 900, spacing: 4 });
      g.save(); g.translate(500, 860); g.scale(a, a);
      text(g, '10 MINUTOS', 0, 0, { size: 118, color: '#f2f2ea', spacing: 3, stroke: 14, strokeColor: '#05081a' });
      text(g, 'ANTES', 0, 135, { size: 104, color: '#ffc060', spacing: 6, stroke: 12, strokeColor: '#05081a' });
      g.restore();
      text(g, info.parteTxt || '', 500, 1180, { size: 42, color: '#9fb0ff', font: FONTS.ui, weight: 900, spacing: 8, alpha: clamp(k / 0.3) });
    }
  },
});
export function vhsOSD(g, t, o = {}) {
  const x = Math.max(100, E.VX + 100), y = Math.max(290, E.VY + 130);
  if (o.rec && (Math.floor(t * 2) % 2 === 0)) { g.fillStyle = '#e0302a'; g.beginPath(); g.arc(x + 18, y, 16, 0, 7); g.fill(); text(g, 'REC', x + 90, y + 2, { size: 46, color: '#f2f2ea', font: FONTS.ui, weight: 900, spacing: 3, stroke: 8, strokeColor: '#0b0b0d' }); }
  if (o.play) text(g, '▶ PLAY', x + 105, y + 2, { size: 46, color: '#f2f2ea', font: FONTS.ui, weight: 900, spacing: 3, stroke: 8, strokeColor: '#0b0b0d' });
}
function cobre(g, cor = '#000') { g.fillStyle = cor; g.fillRect(E.VX, E.VY, E.VW, E.VH); }
function scan(g, a = 0.25) { g.fillStyle = `rgba(0,0,0,${a})`; for (let y = E.VY; y < E.VY + E.VH; y += 6) g.fillRect(E.VX, y + 3, E.VW, 3); }
function fitaVHS(g, t) { const c = g.canvas, k = Math.floor(t * 24); const dx = (Math.sin(k * 12.9898) * 43758.5453 % 1) * 4; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.12; g.drawImage(c, 3 + dx, 0); g.restore(); }
let PIX = null;
function titulo(g, k) {
  const on = k > 0.5 || (k > 0.08 && k < 0.16) || (k > 0.28 && k < 0.36);
  if (!PIX) { PIX = document.createElement('canvas'); PIX.width = 180; PIX.height = 320; }
  const p = PIX.getContext('2d'); p.clearRect(0, 0, 180, 320); p.textAlign = 'center'; p.textBaseline = 'middle';
  if (on) { p.fillStyle = '#e8e4d8'; p.font = '14px Anton'; p.fillText('A', 90, 122); p.font = '34px Anton'; p.fillText('ESTAÇÃO', 90, 150); p.fillStyle = '#c0201a'; p.fillRect(40, 172, 100, 3); }
  if (k > 0.7) { p.globalAlpha = clamp((k - 0.7) / 0.3); p.fillStyle = '#ffc060'; p.font = '10px Anton'; p.fillText('EP. 1 — O BANHEIRO DA LINHA VERMELHA', 90, 190); p.globalAlpha = 1; }
  g.save(); g.imageSmoothingEnabled = false; if (on) glow(g, 540, 870, 480, '#c0201a', 0.14 + 0.05 * Math.sin(k * 9)); g.drawImage(PIX, 0, 0, 1080, 1920); g.restore();
}
// ====================== FIM — corte seco -> título -> "CONTINUA... · EP. 2 →" + segue a página (cta por cima) ======================
registerShot('FIM', { draw(g, t, info) {
  cobre(g); const c0 = info.card ?? 1.3;
  if (t < c0) { g.fillStyle = '#000'; g.fillRect(0, 0, E.W, E.H); if (t >= 0.3) titulo(g, (t - 0.3) * 1.2); }
  else { UI.seguir(g, t - c0, { linha1: 'CONTINUA...', proximo: info.proximo || 'EP. 2 →' }); vhsOSD(g, t, { play: true }); fitaVHS(g, t); }
  scan(g);
}});

// ====================== B — a estação: catraca, plataforma, trem chegando, "SANITÁRIOS →" ======================
import { estacao, estacaoVive } from '/series/estacao/metro.js';
reg('B', { kind: '3d',
  init(T, info) {
    const st = palco(T, { neblina: '#c8ccd0', fogStart: 22, fogDens: 0.03 }); const M = estacao(st); const L = livia(st);
    const [a, b] = [passo(info, 0), passo(info, 1)];
    const tj = [trajeto([[-4.8, 0.85], [-2.6, 0.85]], a[0], a[1], a[2]), trajeto([[-2.6, 0.85], [-1.2, 0.9], [3.0, 2.1], [4.8, 3.3]], b[0], b[1], b[2])];
    const cartao = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.055, 0.003), new THREE.MeshLambertMaterial({ color: 0xd8e0e8 })); cartao.position.set(0, -0.09, 0.02); cartao.rotation.x = Math.PI / 2; L.bracos.D.mao.add(cartao);
    const q = (TT) => (TT < tj[1].t0 ? tj[0] : tj[1]).at(TT); const H = (TT) => { const p = q(TT); return [p.x, OLHO, p.z]; };
    const K = [
      [19.2, { p: (T) => { const p = q(T); return [p.x - 2.9, 1.95, p.z - 1.0]; }, m: (T) => { const p = q(T); return [p.x + 3, 1.25, p.z]; }, f: 46 }],
      [20.2, { p: [-1.25, 1.5, -0.45], m: [-2.3, 1.1, 0.85], f: 42 }],
      [20.95, { p: [-1.25, 1.5, -0.45], m: [-2.0, 1.2, 0.85], f: 44 }],
      [21.6, { p: (T) => { const p = q(T); return [p.x + 1.7, 1.55, p.z + 1.1]; }, m: (T) => { const p = q(T); return [p.x - 0.2, 1.25, p.z - 0.3]; }, f: 50 }],
      [22.9, { p: (T) => { const p = q(T); return [p.x + 1.6, 1.55, p.z + 1.0]; }, m: (T) => { const p = q(T); return [p.x - 0.2, 1.25, p.z - 0.3]; }, f: 50 }],
      [23.5, { p: [1.0, 1.45, 0.4], m: [3.6, 2.1, 2.6], f: 50 }],
      [24.6, { p: [1.3, 1.45, 0.6], m: [4.4, 1.7, 3.2], f: 48 }],
    ];
    return { stage: st, M, L, tj, K, cartao, q };
  },
  draw(s, lt, info) {
    const T = info.globalT, st = s.stage, L = s.L, Lx = info.L;
    anda(L, T < s.tj[1].t0 ? s.tj[0] : s.tj[1], T, { ryFim: Math.PI / 2 }); pe(L);
    const bip = 20.62, toca = clamp(prog(T, 20.3, 20.55) - prog(T, 20.75, 21.0));
    if (toca > 0.01) L.alcanca('D', [lerp(L.position.x + 0.3, -2.28, toca), lerp(1.0, 1.1, toca), lerp(L.position.z + 0.15, 0.85, toca)], { punho: [-0.4, 0, 0], dedos: 0.6 });
    s.cartao.visible = T > 19.8 && T < 21.4;
    if (T > 20.2 && T < 20.95) L.olhaPara([-2.28, 1.05, 0.85], 1, 0.2); else if (T > 22.6) L.olhaPara([3.2, 2.65, 2.2], 1, 0.2); else L.cab.rotation.set(0, 0, 0);
    vive(L, T, Lx, [], [[19, 'aperto'], [22.7, { by: 0.6, bi: 0.4, eo: 1.15, ms: 0.15 }], [23.6, 'aperto']]); L.respira(T, 2);
    estacaoVive(s.M, T, { trem: [20.9, 23.4], bip, olharPara: [30, 1.4, -1.9] });
    cam3(st.camera, T, s.K);
    post(st, T, { expo: 1.18, tint: [0.98, 1.0, 1.02], sat: 0.85 });
  },
});

// ====================== C — o banheiro: entra, nojo, forra o vaso com papel, fecha a cabine (l03) ======================
import { banheiro, luzBanheiro, salaPose, copiaPose, VASO, ESP } from '/series/estacao/banheiro.js';
// fluorescente: pisca de leve sempre, apaga de verdade nos instantes marcados
function luzK(T, apagoes = []) { for (const [a, b] of apagoes) if (T > a && T < b) return 0; const n = noise(T * 7, 3); return n < -0.55 ? 0.25 : n < -0.45 ? 0.6 : 1; }
function baseBanheiro(T) { const st = palco(T, { neblina: '#141814', fogStart: 30, fogDens: 0.01 }); const B = banheiro(st); const L = livia(st); const R = mulher(LIVIA); B.Ge.add(R); const rs = sombra(0.3, 0.5); B.Ge.add(rs); return { st, B, L, R, rs }; }
function espelha(s) { copiaPose(s.L, s.R); s.rs.position.set(s.L.position.x, 0.012, s.L.position.z); }
reg('C', { kind: '3d',
  init(T, info) {
    const { st, B, L, R, rs } = baseBanheiro(T), Lx = info.L; const [a, b] = [passo(info, 0), passo(info, 1)];
    const tj = [trajeto([[-1.4, 5.4], [-1.25, 3.7], [-0.25, 2.65]], a[0], a[1], a[2]), trajeto([[-0.25, 2.65], [0.45, 1.95], [1.22, 1.93]], b[0], b[1], b[2])];
    const t = { nojo: W('nojo', Lx.l03), papel: W('papel', Lx.l03), ning: W('ninguém', Lx.l03) };
    const q = (TT) => (TT < tj[1].t0 ? tj[0] : tj[1]).at(TT);
    const K = [
      [24.0, { p: [-0.5, 1.62, 1.2], m: [-1.4, 1.45, 4.6], f: 50 }],
      [24.9, { p: [-0.5, 1.62, 1.3], m: (T) => { const p = q(T); return [p.x, 1.5, p.z]; }, f: 46 }],
      [25.4, { p: (T) => { const p = q(T); return orbita(p, 1.0, 0.25, 1.6); }, m: (T) => { const p = q(T); return [p.x, 1.52, p.z]; }, f: 34 }],
      [26.4, { p: (T) => { const p = q(T); return orbita(p, 1.0, 0.3, 1.6); }, m: (T) => { const p = q(T); return [p.x, 1.48, p.z]; }, f: 36 }],
      [27.2, { p: [-0.6, 1.6, 0.85], m: [0.9, 1.2, 1.95], f: 46 }],
      [27.7, { p: [1.62, 1.72, 1.4], m: [1.75, 0.45, 1.98], f: 48 }],
      [29.2, { p: [1.62, 1.72, 1.4], m: [1.72, 0.48, 1.98], f: 44 }],
      [29.5, { p: [2.05, 1.5, 2.35], m: [1.22, 1.48, 1.93], f: 36 }],
      [30.2, { p: [2.05, 1.5, 2.35], m: [1.22, 1.5, 1.93], f: 34 }],
      [30.4, { p: [-0.9, 1.55, 3.6], m: [0.8, 1.1, 1.9], f: 44 }],
      [31.8, { p: [-1.0, 1.55, 3.7], m: [0.8, 1.1, 1.9], f: 42 }],
    ];
    const fill = new THREE.PointLight(new THREE.Color('#e0f0d8'), 1.3, 3, 1.4); fill.position.set(0, 0.3, 0); st.camera.add(fill);
    return { stage: st, B, L, R, rs, tj, t, K };
  },
  draw(s, lt, info) {
    const T = info.globalT, st = s.stage, L = s.L, Lx = info.L, t = s.t;
    anda(L, T < s.tj[1].t0 ? s.tj[0] : s.tj[1], T, { ryFim: Math.PI / 2 }); pe(L);
    // forrando o vaso: inclina, as mãos levam cada tira de papel
    const forra = clamp(prog(T, 27.6, 27.9) - prog(T, 29.3, 29.6));
    if (forra > 0.01) {
      L.parado(); L.rotation.y = Math.PI / 2; L.tronco.rotation.x = 0.55 * forra; L.pernas.forEach(p => p.joe.rotation.x = 0.25 * forra); L.pernas.forEach(p => p.rotation.x = -0.12 * forra);
      const ph = [27.95, 28.55, 29.15].findIndex(x => T < x + 0.45), k = ph < 0 ? 1 : clamp((T - [27.5, 27.95, 28.55][ph]) / 0.5);
      const alvo = [[1.72, 0.47, 1.98], [1.86, 0.47, 1.85], [1.86, 0.47, 2.1]][Math.max(0, ph)];
      L.alcanca('D', [lerp(1.45, alvo[0], ease.inOut(k)), lerp(0.85, alvo[1] + 0.02, ease.inOut(k)), lerp(1.85, alvo[2], ease.inOut(k))], { punho: [-0.9, 0, 0], dedos: 0.15, polo: [0.2, -0.5, -1] });
      L.alcanca('E', [1.55, 0.62, 2.12], { punho: [-0.6, 0, 0], dedos: 0.3, polo: [0.2, -0.5, 1] });
      L.olhaPara([1.8, 0.45, 1.98], 1, 0.1);
    } else L.cab.rotation.set(0, 0, 0);
    s.B.real.papel.forEach((p, i) => p.visible = T > [27.95, 28.55, 29.15][i]);
    vive(L, T, Lx, [], [[24.0, 'aperto'], [t.nojo - 0.35, 'nojo'], [26.0, 'aperto'], [t.papel - 0.2, 'nojo'], [t.ning - 0.1, { ...{ ba: 0.4, eo: 0.8, ms: 0.3, mx: 0.4 } }], [30.0, 'aperto']]);
    L.respira(T, 1.6);
    salaPose(s.B, { porta: -1.3 * clamp(prog(T, 24.02, 24.5) - prog(T, 25.6, 26.4)), cabine: 1.35 * clamp(prog(T, 26.8, 27.25) - prog(T, 30.25, 30.55)) });
    luzBanheiro(s.B, luzK(T)); espelha(s); s.R.face(exprEm(T, [[24, 'aperto']]));
    cam3(st.camera, T, s.K);
    post(st, T, { expo: 1.3, tint: [0.92, 1.02, 0.9], sat: 0.8, vinheta: 0.5 });
  },
});

// ====================== D — descarga, a pia, o espelho: o reflexo pisca atrasado, não vira junto, sorri (l04–l06) ======================
const PIA = [-0.4, 0, 0.64];
reg('D', { kind: '3d',
  init(T, info) {
    const { st, B, L, R, rs } = baseBanheiro(T), Lx = info.L; const [a, b] = [passo(info, 0), passo(info, 1)];
    const tj = [trajeto([[1.25, 1.93], [0.35, 1.95], [PIA[0], 1.2], [PIA[0], PIA[2]]], a[0], a[1], a[2]), trajeto([[PIA[0], PIA[2]], [-0.55, 1.9], [-1.4, 3.9], [-1.4, 5.4]], b[0], b[1], b[2])];
    const t = { vo: W('vó', Lx.l04), rosto2: W('rosto', Lx.l04, 2), errado: W('errado', Lx.l04), luz: W('luz', Lx.l05), piscar: W('piscar', Lx.l05), isso: W('isso', Lx.l06) };
    t.apaga = [Lx.l04[1] + 0.36, Lx.l04[1] + 0.86]; t.pisca = 47.35; t.vira = Lx.l05[1] + 0.45; t.volta = Lx.l06[0] - 0.15; t.flee = b[0];
    const REF = [PIA[0], 1.53, -PIA[2]];
    const K = [
      [31.3, { p: [-1.7, 1.75, 3.9], m: [0.7, 1.1, 1.9], f: 50 }],
      [32.7, { p: [-1.6, 1.72, 3.7], m: [0.7, 1.1, 1.9], f: 48 }],
      [33.6, { p: [-1.3, 1.65, 2.7], m: [-0.4, 1.3, 0.6], f: 46 }],
      [34.6, { p: [0.4, 1.7, 1.7], m: REF, f: 36 }],
      [38.5, { p: [0.12, 1.66, 1.42], m: REF, f: 26 }],
      [43.0, { p: [-0.05, 1.64, 1.28], m: [REF[0], 1.52, REF[2]], f: 17 }],
      [44.6, { p: [-0.05, 1.64, 1.28], m: [REF[0], 1.52, REF[2]], f: 16 }],
      [45.4, { p: [-1.05, 1.55, 0.1], m: [-0.4, 1.5, 0.48], f: 32 }],
      [47.62, { p: [-1.03, 1.55, 0.1], m: [-0.4, 1.5, 0.47], f: 30 }],
      [47.98, { p: [-1.03, 1.55, 0.1], m: [REF[0], 1.5, REF[2]], f: 30 }, ease.inOut],
      [50.9, { p: [-0.98, 1.55, 0.12], m: [REF[0], 1.5, REF[2]], f: 22 }],
      [51.3, { p: [-0.95, 2.0, 1.55], m: [REF[0], 1.5, REF[2] * 0.5], f: 36 }],
      [51.65, { p: [-0.28, 2.22, 1.28], m: [-0.36, 1.38, -0.2], f: 36 }],
      [54.5, { p: [-0.28, 2.18, 1.2], m: [-0.36, 1.4, -0.25], f: 33 }],
      [55.6, { p: [0.0, 1.62, 1.2], m: [REF[0], 1.52, REF[2]], f: 20 }],
    ];
    return { stage: st, B, L, R, rs, tj, t, K };
  },
  draw(s, lt, info) {
    const T = info.globalT, st = s.stage, L = s.L, R = s.R, Lx = info.L, t = s.t;
    const fugindo = T >= s.tj[1].t0;
    anda(L, fugindo ? s.tj[1] : s.tj[0], T, { ryFim: Math.PI }); pe(L);
    L.visible = T > 32.75;
    // lavando as mãos (inclina, esfrega debaixo da torneira)
    const lava = clamp(prog(T, 34.3, 34.7) - prog(T, 37.2, 37.7));
    if (!fugindo && T > 34.25) { L.parado(); L.rotation.y = Math.PI; L.position.set(PIA[0], 0, PIA[2]); }
    if (lava > 0.01) {
      L.tronco.rotation.x = 0.32 * lava; const e = 0.03 * Math.sin(T * 11);
      L.alcanca('D', [PIA[0] + 0.05 + e, 0.98, 0.22], { punho: [-1.0, 0, 0.4], dedos: 0.25, polo: [0.6, -1, 0.3] }); L.alcanca('E', [PIA[0] - 0.05 - e, 0.98, 0.24], { punho: [-1.0, 0, -0.4], dedos: 0.25, polo: [-0.6, -1, 0.3] });
    } else if (!fugindo && T > 37.5) { L.braco('D', 0.12, 0.08, 0.35, 0.3); L.braco('E', 0.12, 0.08, 0.35, 0.3); L.tronco.rotation.x = 0.06 + 0.12 * ease.inOut(prog(T, 44.6, 45.4)); }
    // olhar: mãos -> espelho; vira pra direita (cabines) e volta
    const v = ease.inOut(prog(T, t.vira, t.vira + 0.35)) * (1 - ease.inOut(prog(T, t.volta, t.volta + 0.4)));
    if (lava > 0.5) { L.cab.rotation.set(0.45, 0, 0); } else { L.cab.rotation.set(0.0, -0.95 * v, 0.0); }
    if (fugindo) L.cab.rotation.set(0, 0, 0);
    // expressões (pensamento: boca fechada; l06 é em voz alta)
    const ex = [[31, 'aperto'], [33.0, 'alivio'], [t.vo - 0.3, 'pensativa'], [t.rosto2 - 0.2, 'desconfia'], [t.apaga[0], 'susto'], [Lx.l05[0], 'desconfia'], [t.luz, 'pensativa'], [t.piscar - 0.3, 'desconfia'], [t.vira, 'neutro'], [t.volta + 0.15, 'medo'], [Lx.l06[1] - 0.2, 'panico']];
    const pis = (TT) => { const k = (TT - t.pisca) / 0.22; return k > 0 && k < 1 ? Math.sin(Math.PI * k) : 0; };
    vive(L, T, Lx, ['l06'], ex, { semPisca: T > 45 && T < 52, pisca: pis(T), boca: 0.55 });
    L.respira(T, T > t.volta ? 3 : 1.2);
    salaPose(s.B, { cabine: 1.35 * clamp(prog(T, 32.75, 33.15)), agua: T > 34.45 && T < 37.3 });
    // a luz
    const ap = [t.apaga, [Lx.l06[1] + 0.45, Lx.l06[1] + 0.75], [Lx.l05[1] + 0.05, Lx.l05[1] + 0.18], [Lx.l05[1] + 0.26, Lx.l05[1] + 0.33]];
    luzBanheiro(s.B, luzK(T, ap));
    // ===== o reflexo =====
    espelha(s);
    // (1) depois do apagão, a cabeça do reflexo NÃO vira junto: continua olhando pra frente e só vira tarde
    const vr = ease.inOut(prog(T, t.vira + 1.05, t.vira + 1.6)) * (1 - ease.inOut(prog(T, t.volta + 0.55, t.volta + 1.1)));
    if (!fugindo && T > 37.5) R.cab.rotation.set(0, -0.95 * vr, 0);
    // (2) piscada atrasada meio segundo; (3) boca parada no l06; (4) no fim fica parado, sorrindo, quando ela foge
    const exR = ex.map(([a, b]) => [a, b]); exR.push([Lx.l06[0] + 0.1, 'fixa'], [Lx.l06[1] + 0.1, 'sorrisoMorto']);
    vive(R, T, Lx, [], exR, { semPisca: T > 45 && T < 52, pisca: pis(T - 0.8), semCabeca: true });
    if (T > t.volta + 0.2) { R.face({ ...exprEm(T, exR), gx: 0, gy: 0, pisca: 0 }); }
    if (fugindo) { R.position.set(PIA[0], 0, PIA[2]); R.rotation.set(0, Math.PI, 0); R.parado(); R.braco('D', 0.05, 0.08, 0.15); R.braco('E', 0.05, 0.08, 0.15); R.cab.rotation.set(-0.05, 0, 0.12); R.visible = true; s.rs.position.set(PIA[0], 0.012, PIA[2]); }
    R.face && null;
    cam3(st.camera, T, s.K, { tremor: T > t.volta ? 0.35 : 0 });
    post(st, T, { expo: 1.3, tint: [0.92, 1.02, 0.9], sat: 0.8, vinheta: 0.55 });
  },
});

// ====================== E — a OUTRA São Paulo (mesma rua, à noite, errada) + a senhora (l07, l08, s01, l09, l10, s02) ======================
import { pessoa, TERNO, GARI, ESTUDANTE, SENHORA, pedestre } from '/series/estacao/elenco.js';
reg('E', { kind: '3d',
  init(T, info) {
    const st = palco(T, { neblina: '#0c1210', fogStart: 9, fogDens: 0.075 }); const M = rua(st, { outro: true });
    const L = livia(st), Lx = info.L; const [a, b, c] = [passo(info, 0), passo(info, 1), passo(info, 2)];
    const tj = [trajeto([[15.8, 2.0], [11.4, 2.0]], a[0], a[1], a[2]), trajeto([[11.3, 1.95], [10.0, 1.0], [-1.0, 1.0]], b[0], b[1], b[2]), trajeto([[-1.0, 1.0], [-1.6, 2.1], [-4.8, 2.3]], c[0], c[1], c[2])];
    // os parados: só a cabeça vira, devagar, seguindo a Lívia
    const parados = [[TERNO, 5.2, 3.6, Math.PI], [GARI, 3.0, -0.25, 0], [ESTUDANTE, 0.6, 3.5, Math.PI], [{ ...pedestre(61), cabelo: '#1a1410', fixos: true }, 7.6, -0.2, -0.3]].map(([o, x, z, ry], i) => {
      const p = o === ESTUDANTE ? mulher(o) : pessoa(o); p.position.set(x, 0, z); p.rotation.y = ry; st.add(p); const sb = sombra(0.28, 0.5); sb.position.set(x, 0.012, z); st.add(sb); p.parado?.(); return p; });
    { const vas = new THREE.Group(); vas.add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 5), new THREE.MeshLambertMaterial({ color: 0x6a5030 }))); const pal = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.05), new THREE.MeshLambertMaterial({ color: 0x2a2a20 })); pal.position.y = -0.65; vas.add(pal); vas.position.set(0, -0.35, 0.05); vas.rotation.x = 0.2; parados[1].bracos.D.mao.add(vas); parados[1].braco('D', 0.5, 0.15, 0.6, 0.8); parados[1].braco('E', 0.7, 0.1, 0.9, 0.8); }
    const sen = mulher(SENHORA); st.add(sen); const ssb = sombra(0.28, 0.5); st.add(ssb);
    const tsen = trajeto([[-3.7, -2.2], [-2.7, -0.7], [-2.0, 1.0]], 71.0, 72.6, 1.5);
    const t = { cade: W('cadê', Lx.l07), form: W('formigueiro', Lx.l07), cab: W('cabeça', Lx.l08), dev: W('devagar', Lx.l08), seg: W('seguindo', Lx.l08), la: W('lá', Lx.s02) };
    const q = (TT) => { const k = TT < tj[1].t0 ? 0 : TT < tj[2].t0 ? 1 : 2; const p = tj[k].at(TT); return { ...p, y: k === 0 ? stairY(p.x) : 0 }; };
    const H = (TT) => { const p = q(TT); return [p.x, p.y + OLHO, p.z]; };
    const SEN = [-2.0, 1.44, 1.0], LIV = [-1.0, OLHO, 1.0];
    const K = [
      [55.9, { p: [10.9, 1.7, 2.0], m: [14.6, -0.7, 2.0], f: 46 }],
      [56.95, { p: [10.9, 1.7, 2.1], m: [13.4, 0.3, 2.0], f: 46 }],
      [57.7, { p: [12.7, 1.95, 2.6], m: [3, 1.5, -2.2], f: 52 }],
      [59.3, { p: [12.6, 1.95, 2.55], m: [3, 1.4, -2.6], f: 48 }],
      [59.9, { p: (T) => orbita(q(T), 1.05, 0.2, 1.6), m: H, f: 32 }],
      [60.7, { p: (T) => orbita(q(T), 1.1, 0.25, 1.6), m: H, f: 32 }],
      [61.6, { p: (T) => { const p = q(T); return [p.x - 2.4, 1.5, p.z - 0.9]; }, m: (T) => { const p = q(T); return [p.x, 1.2, p.z]; }, f: 44 }],
      [62.6, { p: (T) => { const p = q(T); return [p.x + 2.3, 1.75, p.z + 1.3]; }, m: [9.4, 3.2, -0.15], f: 44 }],
      [64.3, { p: (T) => { const p = q(T); return [p.x + 2.3, 1.75, p.z + 1.3]; }, m: [9.4, 3.3, -0.15], f: 34 }],
      [65.2, { p: [1.6, 1.55, -1.7], m: (T) => { const p = q(T); return [p.x, 1.35, p.z]; }, f: 44 }],
      [67.6, { p: [1.8, 1.5, -1.6], m: (T) => { const p = q(T); return [p.x, 1.35, p.z]; }, f: 42 }],
      [68.2, { p: [0.75, 1.42, 2.35], m: [0.6, 1.34, 3.5], f: 34 }],
      [70.0, { p: [0.8, 1.42, 2.4], m: [0.6, 1.34, 3.5], f: 30 }],
      [70.6, { p: (T) => { const p = q(T); return orbita(p, -1.3, 0.35, 1.72); }, m: (T) => { const p = q(T); return [p.x - 2.5, 1.35, p.z - 0.2]; }, f: 44 }],
      [72.4, { p: [0.5, 1.72, -0.15], m: SEN, f: 40 }],
      [73.4, { p: [-0.75, 1.6, 1.32], m: SEN, f: 30 }],
      [76.4, { p: [-0.8, 1.58, 1.3], m: SEN, f: 23 }],
      [76.7, { p: [-2.25, 1.55, 0.7], m: LIV, f: 30 }],
      [80.4, { p: [-2.2, 1.55, 0.72], m: LIV, f: 26 }],
      [80.9, { p: [-0.75, 1.6, 1.32], m: SEN, f: 28 }],
      [84.9, { p: [-0.85, 1.55, 1.25], m: SEN, f: 15 }],
      [85.3, { p: [0.6, 1.65, 0.4], m: [-2.0, 1.3, 1.6], f: 42 }],
      [86.6, { p: [0.4, 1.65, 0.6], m: [-3.4, 1.3, 2.2], f: 42 }],
    ];
    return { stage: st, M, L, tj, parados, sen, ssb, tsen, t, K, q };
  },
  draw(s, lt, info) {
    const T = info.globalT, st = s.stage, L = s.L, Lx = info.L, t = s.t;
    const k = T < s.tj[1].t0 ? 0 : T < s.tj[2].t0 ? 1 : 2;
    anda(L, s.tj[k], T, { ryFim: k === 1 ? -Math.PI / 2 : undefined }); if (k === 0) L.position.y = stairY(L.position.x); pe(L);
    // olhar dela: rua vazia, relógio, os parados, a senhora
    if (T > 57.4 && T < 60.4) L.olhaPara([lerp(0, 6, (Math.sin((T - 57.4) * 1.2) + 1) / 2), 1.6, -4], 1.2, 0.3);
    else if (T > 62.6 && T < 64.6) L.olhaPara([9.4, 3.4, -0.15], 1.2, 0.2);
    else if (T > 65 && T < 71) L.olhaPara(T < 68 ? [3.0, 1.6, -0.25] : [0.6, 1.45, 3.5], 1.2, 0.2);
    else if (T > 71.8) L.olhaPara([-2.0, 1.44, 1.0], 1.0, 0.1); else L.cab.rotation.set(0, 0, 0);
    if (k === 1 && T > s.tj[1].t1) { L.rotation.y = -Math.PI / 2; L.position.set(-1.0, 0, 1.0); L.parado(); }
    if (k === 1 || (T > s.tj[1].t1 && T < s.tj[2].t0)) { L._bracoLivre = false; }
    if (T > 72.3 && T < 85.0) { L.alcanca('E', [L.position.x - 0.05, 1.12, L.position.z - 0.2], { punho: [0, 0, 0], dedos: 0.8 }); }   // segura a alça da bolsa
    const ex = [[55.9, 'desconfia'], [t.cade - 0.2, { by: 0.55, bi: 0.55, eo: 1.12, ms: -0.15, gx: 0.3 }], [t.form, 'pensativa'], [62.6, 'desconfia'], [64.0, 'medo'], [t.cab, { by: 0.5, bi: 0.8, eo: 1.15, ms: -0.3 }], [t.seg, 'medo'],
      [72.1, 'susto'], [72.9, 'desconfia'], [Lx.l09[0] - 0.1, 'firme'], [Lx.l10[0], 'deboche'], [Lx.s02[0] + 0.3, 'desconfia'], [t.la, 'medo'], [Lx.s02[1] + 0.2, 'panico']];
    vive(L, T, Lx, ['l09'], ex, { boca: 0.7 }); L.respira(T, T > 64 ? 2.5 : 1.4);
    // os parados viram a cabeça devagar (atraso de ~1 s), sem piscar
    s.parados.forEach((p, i) => { const qq = s.q(T - 1.1 - i * 0.2); const alvo = [qq.x, 1.5, qq.z]; if (T < 61) p.olhaPara([p.position.x + Math.sin(p.rotation.y) * 4, 1.6, p.position.z + Math.cos(p.rotation.y) * 4], 1.5, 0); else p.olhaPara(alvo, 1.45, 0.05); p.respira(T, 0.2);
      if (p.face.length !== undefined) { try { p.face(p.parado ? { expr: 'normal', boca: 0, pisca: false } : 'fixa'); } catch (e) { } } });
    s.parados[2].face('fixa');
    // a senhora: sai do meio dos carros, para na frente; fala sem piscar, sorriso que não mexe as bochechas
    const sen = s.sen; sen.visible = T > 70.8; if (sen.visible) { const qs = s.tsen.at(T); sen.position.set(qs.x, qs.z < -0.5 ? -0.15 : 0, qs.z); if (T < s.tsen.t1) { sen.rotation.y = qs.ry; sen.anda(Math.PI * 1.5 * (T - 71.0), 0.7); } else { sen.parado(); sen.rotation.y = Math.PI / 2; } s.ssb.position.set(sen.position.x, sen.position.y + 0.012, sen.position.z);
      sen.olhaPara(T > 72.2 ? [L.position.x, OLHO, L.position.z] : [L.position.x, 1.5, L.position.z], 0.9, 0.1); sen.cab.rotation.z = 0.08 * ease.inOut(prog(T, 76.0, 79.0)); sen.tronco.rotation.x = 0.08;
      vive(sen, T, Lx, ['s01', 's02'], [[70, 'fixa'], [Lx.s02[0] - 0.3, 'sorrisoMorto']], { semPisca: true, boca: 0.55, semCabeca: true }); sen.braco('D', 0.1, 0.05, 0.2); }
    ruaVive(s.M, T, [L.position.x, 0, L.position.z]);
    cam3(st.camera, T, s.K, { tremor: T > 81 && T < 85 ? 0.25 : 0 });
    post(st, T, { expo: 1.75, tint: [0.86, 1.02, 0.94], sat: 0.62, vinheta: 0.5 });
  },
});

// ====================== G — o sobradinho na Mooca: portão, chave, porta ======================
import { fachada, sala } from '/series/estacao/casa.js';
reg('G', { kind: '3d',
  init(T, info) {
    const st = palco(T, { neblina: '#0e1018', fogStart: 12, fogDens: 0.05 }); const M = fachada(st); const L = livia(st);
    const a = passo(info, 0); const tj = trajeto([[0.15, -1.7], [0.15, -0.4], [0.2, 1.4], [0.15, 2.45]], a[0] - 0.4, a[1], a[2]);
    const K = [
      [86.0, { p: [1.3, 1.75, -3.4], m: [0.1, 1.35, 1.5], f: 44 }],
      [87.3, { p: [0.9, 1.75, -0.6], m: [0.1, 1.3, 3.0], f: 42 }],
      [88.4, { p: [0.75, 1.7, 0.4], m: [0.05, 1.25, 3.0], f: 38 }],
    ];
    return { stage: st, M, L, tj, K };
  },
  draw(s, lt, info) {
    const T = info.globalT, st = s.stage, L = s.L, Lx = info.L;
    anda(L, s.tj, T, { ryFim: 0 }); pe(L);
    s.M.portao.rotation.y = -1.3 * ease.inOut(prog(T, 86.3, 86.9));
    if (T > 87.35 && T < 88.2) L.alcanca('D', [0.4, 1.0, 2.9], { punho: [-0.3, 0, 0.4], dedos: 0.7 });
    s.M.porta.rotation.y = -1.1 * ease.inOut(prog(T, 87.95, 88.6));
    vive(L, T, Lx, [], [[86, 'desconfia'], [87.4, 'alivio']]); L.respira(T, 2);
    s.M.recorte.position.set(L.position.x + 1, 2.2, L.position.z - 1.2);
    cam3(st.camera, T, s.K);
    post(st, T, { expo: 1.5, tint: [1.02, 0.98, 0.94], sat: 0.8, vinheta: 0.5 });
  },
});

// ====================== H — dentro de casa: "Cheguei, vida!", silêncio, o porta-retrato, a chave na porta (l11–d01) ======================
reg('H', { kind: '3d',
  init(T, info) {
    const st = palco(T, { neblina: '#0a0a10', fogStart: 30, fogDens: 0.01 }); const M = sala(st, T); const L = livia(st), Lx = info.L;
    const [a, b, c] = [passo(info, 0), passo(info, 1), passo(info, 2)];
    const tj = [trajeto([[0.1, -0.5], [0.25, 1.3]], a[0], a[1], a[2]), trajeto([[0.25, 1.3], [0.15, 2.8]], b[0], b[1], b[2]), trajeto([[0.15, 2.8], [1.0, 3.35], [1.38, 3.72]], c[0], c[1], c[2])];
    const t = { nossa: W('nossa', Lx.l11), sil: W('silêncio', Lx.l12), gel: W('geladeira', Lx.l12), aquela: W('aquela', Lx.l13), diego: W('diego', Lx.l13), cam: W('câmera', Lx.l13), pessoas: W('pessoas', Lx.l13) };
    const q = (TT) => (TT < tj[1].t0 ? tj[0] : TT < tj[2].t0 ? tj[1] : tj[2]).at(TT);
    const H = (TT) => { const p = q(TT); return [p.x, OLHO, p.z]; };
    const FOTO = M.fotoPos, DUP = [0.1, 1.5, -0.45];
    const K = [
      [88.2, { p: [0.55, 1.55, 3.1], m: [0.15, 1.35, 0.2], f: 44 }],
      [89.6, { p: [0.6, 1.55, 2.9], m: H, f: 36 }],
      [92.6, { p: [0.55, 1.56, 2.6], m: H, f: 30 }],
      [93.3, { p: [-0.6, 1.5, 1.4], m: [0.6, 2.05, 5.0], f: 34 }],
      [94.2, { p: [-0.6, 1.5, 1.4], m: [2.5, 1.0, 2.5], f: 36 }],
      [95.0, { p: (T) => orbita(q(T), -1.4, 0.6, 1.9), m: (T) => { const p = q(T); return [p.x - 0.3, 1.35, p.z + 2.5]; }, f: 44 }],
      [96.8, { p: (T) => orbita(q(T), -1.35, 0.6, 1.9), m: [-1.2, 1.2, 5.0], f: 40 }],
      [98.3, { p: (T) => orbita(q(T), -1.3, 0.6, 1.88), m: [-1.2, 1.2, 5.0], f: 38 }],
      [98.9, { p: [2.2, 1.5, 4.5], m: H, f: 42 }],
      [100.6, { p: [2.15, 1.5, 4.45], m: H, f: 36 }],
      [101.1, { p: [1.47, 1.42, 4.28], m: FOTO, f: 30 }],
      [103.3, { p: [1.48, 1.4, 4.36], m: [FOTO[0] - 0.055, FOTO[1] + 0.05, FOTO[2]], f: 18 }],
      [104.6, { p: [1.5, 1.4, 4.36], m: [FOTO[0] + 0.06, FOTO[1] + 0.06, FOTO[2]], f: 15 }],
      [105.4, { p: [1.5, 1.4, 4.36], m: [FOTO[0] + 0.06, FOTO[1] + 0.06, FOTO[2]], f: 14 }],
      [105.9, { p: [1.75, 1.56, 4.45], m: [1.36, 1.5, 3.72], f: 32 }],
      [107.2, { p: [1.75, 1.56, 4.45], m: [1.36, 1.5, 3.72], f: 30 }],
      [107.9, { p: [1.95, 1.6, 4.65], m: [0.9, 1.4, 2.4], f: 40 }],
      [109.0, { p: [2.35, 1.62, 4.4], m: [0.2, 1.45, 0.2], f: 34 }],
      [110.7, { p: [2.4, 1.62, 4.3], m: DUP, f: 22 }],
    ];
    return { stage: st, M, L, tj, t, K };
  },
  draw(s, lt, info) {
    const T = info.globalT, st = s.stage, L = s.L, M = s.M, Lx = info.L, t = s.t;
    const k = T < s.tj[1].t0 ? 0 : T < s.tj[2].t0 ? 1 : 2;
    anda(L, s.tj[k], T, { ryFim: k === 2 ? 0 : undefined }); pe(L);
    // a chave: maçaneta gira, porta abre e "ela" aparece no vão
    const abre = ease.inOut(prog(T, 108.35, 109.3)), fecha = 1 - ease.inOut(prog(T, 89.3, 89.6));
    M.porta.rotation.y = T < 90 ? -1.5 * fecha * (T > 88.2 ? 1 : 0) : -1.25 * abre;
    M.macaneta.rotation.z = T > 107.45 && T < 108.4 ? -0.6 * Math.sin(Math.PI * prog(T, 107.45, 108.4)) : 0;
    M.fora.visible = M.porta.rotation.y < -0.05; M.sosia.visible = T > 108.5; M.luzSosia.intensity = 2.6 * ease.inOut(prog(T, 108.5, 109.2));
    if (M.sosia.visible) { const d = M.sosia; d.parado(); d.braco('D', 0.2, 0.15, 0.4); d.braco('E', 0.9, 0.1, 1.2, 0.7); d.olhaPara([L.position.x, OLHO, L.position.z], 1, 0.1); d.position.z = lerp(-0.6, -0.2, ease.out(prog(T, 108.6, 109.6)));
      vive(d, T, Lx, ['d01'], [[108, { ...{ by: 0.3, eo: 1.5, ms: 1, dente: 1, mw: 1.2 } }]], { semPisca: true, boca: 0.6 }); }
    // ela: alívio -> inquieta -> a foto -> pânico, vira a cabeça pra porta
    if (T > 107.6) L.olhaPara([0.1, 1.5, 0], 1.3, 0.35 * ease.inOut(prog(T, 107.6, 108.4)));
    else if (k === 2 || T > 99.8) L.olhaPara([1.5, 1.27, 4.73], 1.0, 0.1);
    else if (T > 96.7 && T < 98.6) L.olhaPara([-1.2, 1.2, 5.0], 1.0, 0.2);
    else if (T > 92.9 && T < 94.6) L.olhaPara([0.6, 2.05, 5.0], 1.0, 0.2); else L.cab.rotation.set(0, 0, 0);
    const ex = [[88, 'alivio'], [t.nossa, { ...{ by: 0.25, bi: 0.3, eo: 0.8, ms: 0.2 } }], [92.9, 'pensativa'], [t.sil, 'desconfia'], [t.gel, { ...{ by: 0.5, bi: 0.7, eo: 1.1, ms: -0.2 } }], [99.0, 'desconfia'],
      [t.aquela - 0.4, 'medo'], [t.diego, { ...{ by: 0.9, bi: 1, eo: 1.25, ms: -0.5, mo: 0.12 } }], [107.6, 'susto'], [108.5, 'panico']];
    vive(L, T, Lx, ['l11'], ex, { boca: 0.8 }); L.respira(T, T > 100 ? 3 : 1.2);
    M.ponteiroG.rotation.z = -Math.floor(T) * 0.1047;
    M.recorte.position.set(L.position.x + Math.sin(L.rotation.y) * 0.8 - 0.3, 1.9, L.position.z + Math.cos(L.rotation.y) * 0.8);
    cam3(st.camera, T, s.K, { tremor: T > 107.5 ? 0.35 : 0, mao: T > 101 && T < 105.5 ? 0.3 : 1 });
    post(st, T, { expo: 1.6, tint: [1.04, 0.97, 0.9], sat: 0.85, vinheta: 0.55 });
  },
});
