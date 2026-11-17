// Camada de VFX cartoon por cima dos planos (estouros, onomatopeias, brilhos, confete, velocidade, flash, tremida)
import { getShot, registerShot, ease, clamp, lerp } from '/engine/core.js';
import { foco, DIRETOR } from '/series/mamae/camera.js';
import { GY } from '/series/nessemundo/cenas.js';
import { W } from '/series/mamae/comum.js';
import { estouro, onomato, brilhos, confete, velocidade, flash, numeroPop, fase } from '/series/nessemundo/vfx.js';
// paleta por fase: frio no conflito (com um ponto de luz quente), dourado quando ele acerta e no final
const FASES = { A: ['frio', 0.45], B: ['frio', 0.35], C: ['frio', 0.25], D: ['frio', 0.6], E: ['frio', 0.5, { foco: [700, 1100, 220] }], F: ['frio', 0.7, { foco: [540, 1000, 300] }], G: ['frio', 0.6], H: ['frio', 0.75, { foco: [540, 730, 260] }], I: ['quente', 1], J: ['frio', 0.45], K: ['frio', 0.85, { lx: 300 }], L: ['quente', 1], T: ['quente', 0.6] };

// ---------- DIRETOR: troca de enquadramento a cada 1,8 s (plano médio ↔ close no rosto), sempre perto do personagem ----------
const BEAT = 1.8, TR = 0.3;
// alvos por plano: [x, yCabeça, profundidade, desdeT?] (função de T permitida)
const ALVOS = {
  A: () => [[330, GY - 213, 1]],
  D: (L, T) => (T > W('guilherme', L.n04) ? [[330, GY - 316, 0.85]] : []),
  E: (L, T, i) => { const t0 = i.shot.start, tUm = W('real', L.n05); const gx = lerp(-100, 560, ease.out(clamp((T - t0) / Math.max(0.3, tUm - 0.4 - t0)))); return [[gx, GY - 294, 0.85], [940, GY - 334, 0.85]]; },
  F: () => [[520, 1000, 1]],
  G: (L, T) => { const a = [[330, GY - 316, 0.85]]; if (T > W('vende', L.n07) - 0.2 && T < W('quatro', L.n08)) a.push([Math.max(900, lerp(1300, 900, clamp((T - W('vende', L.n07) + 0.2) / 0.7))), GY - 314, 0.85]); if (T > W('cofrinho', L.n08) - 0.3) a.push([560, GY - 40, 0.85]); return a; },
  I: () => [[430, GY - 234, 0.85], [760, GY - 234, 0.85]],
  K: () => [[360, GY - 213, 1]],
  L: () => [[470, GY - 235, 0.85]],
};
function diretor(id, info) { const fa = ALVOS[id]; if (!fa) return null; const t0 = info.shot.start;
  return (t, c) => { const alvos = fa(info.L, t, info); const b = Math.floor((t - t0) / BEAT), kb = clamp(((t - t0) - b * BEAT) / TR);
    const camB = (bb) => { if (bb <= 0) return { ...c, z: c.z * 1.25 }; const m = bb % 3; if (m === 0 || !alvos.length) return { ...c, z: c.z * (bb % 2 ? 1.45 : 1.25) };
      const a = alvos[(m === 2 && alvos.length > 1) ? 1 + (Math.floor(bb / 3) % (alvos.length - 1)) : 0]; const z = m === 1 ? 2.7 : 1.9; const f = foco(a[0], a[1] + (m === 1 ? 20 : 120), z, a[2]); return { ...f, r: 0 }; };
    const A = camB(b - 1), B = camB(b), e = ease.inOut(kb); return { z: lerp(A.z, B.z, e), x: lerp(A.x, B.x, e), y: lerp(A.y, B.y, e), r: 0 }; }; }
// planos sem câmera de cenário: "punch" de zoom alternado a cada 1,8 s
const PULSO = new Set(['C', 'H', 'J', 'T']);
const embrulha = (id, fx, tremor) => { const d = getShot(id); if (!d) return; const orig = d.draw; registerShot(id, { ...d, draw(g, t, info) { const T = info.globalT; let dx = 0, dy = 0; if (tremor) { const k = tremor(T, info.L); if (k > 0) { dx = Math.sin(T * 80) * 14 * k; dy = Math.cos(T * 70) * 14 * k; } } g.save(); g.translate(dx, dy); if (PULSO.has(id)) { const b = Math.floor((T - info.shot.start) / BEAT), kb = ease.inOut(clamp(((T - info.shot.start) - b * BEAT) / TR)), zA = (b - 1) % 2 ? 1.0 : 1.07, zB = b % 2 ? 1.07 : 1.0, z = b <= 0 ? 1 : lerp(zA, zB, kb); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900); } DIRETOR.fn = diretor(id, info); try { orig.call(this, g, t, info); } finally { DIRETOR.fn = null; } g.restore(); const f = FASES[id]; if (f && !window.SEMFASE) fase(g, f[0], f[1], T, f[2] || {}); fx(g, T, info.L, info); } }); };
const pico = (T, t0, d = 0.35) => (T > t0 && T < t0 + d ? 1 - (T - t0) / d : 0);
embrulha('A', (g, T, L) => { const tt = W('trocar', L.n01); estouro(g, T, tt + 0.3, 600, 1100, { cor: '#ff2e88' }); flash(g, T, tt + 0.35, '#ffe600'); onomato(g, T, tt + 0.35, 760, 760, 'CLICK!', { tam: 80, fundo: '#22e1ff' }); }, (T, L) => pico(T, W('trocar', L.n01) + 0.3));
embrulha('B', (g, T, L, info) => { estouro(g, T, info.shot.start + 0.1, 540, 900, { cor: '#ffe600', n: 22 }); brilhos(g, T, W('pão', L.n02), 540, 1000, { n: 18 }); onomato(g, T, W('ninguém', L.n02) + 0.3, 800, 620, 'UFA!', { tam: 80, fundo: '#39ff5a', cor: '#ffffff' }); }, (T, L, i) => 0);
embrulha('C', (g, T, L) => { for (const w of ['cruzado', 'novo', 'cruzeiro', 'real']) brilhos(g, T, W(w, L.n03), 540, 870, { n: 10, raio: 200 }); estouro(g, T, W('cinco', L.n03), 540, 440, { cor: '#ffe600' }); });
embrulha('D', (g, T, L) => { onomato(g, T, W('guilherme', L.n04), 760, 700, 'OPA!', { tam: 90, fundo: '#ff7a1a' }); velocidade(g, T, pico(T, W('guilherme', L.n04) - 0.3, 0.6)); });
embrulha('E', (g, T, L) => { const td = W('dez', L.n05); velocidade(g, T, T > td - 0.2 && T < td + 1.2 ? 0.8 : 0); estouro(g, T, td, 540, 460, { cor: '#39ff5a', n: 20 }); flash(g, T, td, '#ffe600'); brilhos(g, T, W('real', L.n05) - 0.3, 720, 1090, { n: 12, raio: 160 }); onomato(g, T, L.m1[0] + 0.1, 820, 640, 'O QUÊ?!', { tam: 84, fundo: '#ff2e88' }); }, (T, L) => pico(T, W('dez', L.n05), 0.5));
embrulha('F', (g, T, L) => { estouro(g, T, W('multiplicava', L.n06), 540, 560, { cor: '#39ff5a', n: 20 }); onomato(g, T, W('trava', L.n06), 760, 1260, 'CLACK!', { tam: 76, fundo: '#ff2e88' }); flash(g, T, W('trava', L.n06), '#ff2e88'); }, (T, L) => pico(T, W('trava', L.n06)));
embrulha('G', (g, T, L) => { const td = [W('um', L.n07), W('dois', L.n07), W('três', L.n07), W('quatro', L.n08)]; td.forEach((t0, i) => { estouro(g, T, t0, 540, 330, { cor: ['#39ff5a', '#22e1ff', '#ffe600', '#ff2e88'][i], n: 14, r0: 200, len: 120 }); }); velocidade(g, T, T > td[3] - 0.1 && T < td[3] + 1.3 ? 0.9 : 0); onomato(g, T, td[3] + 0.2, 800, 760, 'UAAAU!', { tam: 90 }); onomato(g, T, L.ma1[0], 300, 700, 'GRRR!', { tam: 70, fundo: '#a64bff' }); }, (T, L) => pico(T, W('quatro', L.n08), 0.5));
embrulha('H', (g, T, L) => { estouro(g, T, W('jogou', L.n09), 540, 730, { cor: '#39ff5a', n: 20 }); brilhos(g, T, W('jogou', L.n09), 540, 730, { n: 16 }); });
embrulha('I', (g, T, L) => { brilhos(g, T, W('padaria', L.n10), 540, 760, { n: 18, raio: 320 }); confete(g, T, L.m2[0] - 0.4, { dur: 3 }); onomato(g, T, W('crachá', L.n10), 820, 700, 'TOMA!', { tam: 80, fundo: '#22e1ff' }); });
embrulha('J', (g, T, L) => { estouro(g, T, W('inflação', L.n11), 540, 1340, { cor: '#ff2e88' }); flash(g, T, L.n12[0], '#ffb800'); onomato(g, T, W('remarcava', L.n12), 820, 640, 'PLIC!', { tam: 70, fundo: '#ff7a1a' }); }, (T, L) => pico(T, W('inflação', L.n11), 0.4));
embrulha('K', (g, T, L) => { flash(g, T, L.c1[0], '#ffffff', 0.3); estouro(g, T, L.c1[0], 540, 1240, { cor: '#ffb800' }); onomato(g, T, L.a2[0] + 0.5, 760, 700, 'ZÁS!', { tam: 90, fundo: '#22e1ff' }); velocidade(g, T, pico(T, L.a2[0] + 0.4, 0.8)); }, (T, L) => pico(T, L.c1[0], 0.6));
embrulha('L', (g, T, L) => { confete(g, T, L.g1[0] - 0.2, { dur: 2.6 }); brilhos(g, T, W('padaria', L.n14), 540, 1150, { n: 16, raio: 300 }); });

embrulha('T', () => {});

// ====== INSERTOS (estilo Vitinho): a cada frase, um objeto em close em fundo liso, ~1,3 s, entrando com "snap" ======
import { moeda, porquinho, caderno, box as caixa } from '/series/nessemundo/cenas.js';
import { cadeado } from '/series/semmarca/hud.js';
import { sunburst, estrela } from '/series/nessemundo/vfx.js';
import { E as EE, text as TX, FONTS as FF, rr as RR, glow as GL, prog as PG } from '/engine/core.js';
const NAVY = '#2b3347';
const fundoLiso = (g, c1, c2) => { const gr = g.createRadialGradient(540, 820, 50, 540, 900, 1200); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(-EE.W, -EE.H, EE.W * 3, EE.H * 3); };
const rotuloI = (g, s, y = 1260, c = '#ffffff') => TX(g, s, 540, y, { size: 78, color: c, font: FF.viral || FF.title, stroke: 16, strokeColor: NAVY });
const INS = [
  ['D', (L) => W('videogame', L.n04), 1.2, (g, T, k) => { fundoLiso(g, '#c9b8ef', '#8f7ad0'); g.save(); g.translate(540, 820); g.rotate(Math.sin(T * 6) * 0.05); caixa(g, -260, -110, 520, 220, '#3c4258', 110, 10); for (const [x, c] of [[150, '#f2c14e'], [210, '#ef8a7a'], [150, '#8fd3c1']]) { } [[150, -40, '#f2c14e'], [210, 10, '#ef8a7a'], [150, 60, '#8fd3c1'], [90, 10, '#a9d6f2']].forEach(([x, y, c]) => { g.beginPath(); g.arc(x, y, 26, 0, 7); g.fillStyle = c; g.fill(); g.lineWidth = 6; g.strokeStyle = NAVY; g.stroke(); }); caixa(g, -200, -20, 120, 40, '#22283a', 8, 6); caixa(g, -160, -60, 40, 120, '#22283a', 8, 6); g.restore(); rotuloI(g, 'REI DO VIDEOGAME', 1180); }],
  ['D', (L) => W('fiado', L.n04), 1.3, (g, T) => { fundoLiso(g, '#f6ecd8', '#e7cfa6'); caderno(g, 540, 820, 2.1, T); }],
  ['E', (L) => W('moeda', L.n05), 1.3, (g, T) => { sunburst(g, T, ['#f5c84a', '#f2b23a'], 540, 820); moeda(g, 540, 820, 230, T, { brilho: 0.9 }); rotuloI(g, 'A ÚNICA MOEDA', 1220); }],
  ['G', (L) => W('miojo', L.n07), 1.2, (g, T) => { fundoLiso(g, '#ffe6a8', '#f2c14e'); g.save(); g.translate(540, 840); g.rotate(-0.08); caixa(g, -230, -170, 460, 340, '#f5c84a', 30, 10); TX(g, 'MIOJO', 0, -40, { size: 110, color: '#ef6a5a', font: FF.viral || FF.title, stroke: 14, strokeColor: NAVY }); TX(g, 'CRU', 0, 80, { size: 70, color: NAVY, font: FF.viral || FF.title }); g.restore(); }],
  ['G', (L) => W('micro', L.n07), 1.2, (g, T) => { fundoLiso(g, '#c7e8f5', '#86bfe0'); caixa(g, 290, 640, 500, 320, '#e9edf2', 20, 10); caixa(g, 320, 670, 320, 260, '#2b3347', 10, 6); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(710, 710 + i * 60, 16, 0, 7); g.fillStyle = '#9aa4b8'; g.fill(); } g.save(); g.translate(540, 560); g.rotate(-0.12); caixa(g, -210, -60, 420, 120, '#ef6a5a', 20, 8); TX(g, 'VENDE-SE', 0, 4, { size: 64, color: '#fff', font: FF.viral || FF.title }); g.restore(); }],
  ['G', (L) => W('cofrinho', L.n08), 1.3, (g, T) => { sunburst(g, T, ['#f4b2a0', '#ef8a7a'], 540, 840); porquinho(g, 540, 880, 2.2, T, { corrente: true }); rotuloI(g, 'R$ 10.000.000', 1260, '#f5c84a'); }],
  ['I', (L) => W('terreno', L.n10), 1.1, (g, T) => { fundoLiso(g, '#d7f0c8', '#8ccf6a'); g.save(); g.translate(540, 860); caixa(g, -20, -100, 40, 420, '#a9805e', 6, 6); g.rotate(-0.06); caixa(g, -280, -300, 560, 220, '#ffffff', 16, 10); TX(g, 'VENDIDO', 0, -186, { size: 110, color: '#ef4a5a', font: FF.viral || FF.title }); g.restore(); }],
  ['I', (L) => W('crachá', L.n10), 1.1, (g, T) => { fundoLiso(g, '#cfe5f7', '#8fb8ec'); g.save(); g.translate(540, 840); g.rotate(0.06); caixa(g, -250, -170, 500, 340, '#ffffff', 26, 10); g.fillStyle = '#5e9fd8'; g.fillRect(-242, -162, 484, 80); TX(g, 'GERENTE', 0, -120, { size: 56, color: '#fff', font: FF.viral || FF.title }); TX(g, 'SEU MANOEL', 0, 40, { size: 64, color: NAVY, font: FF.viral || FF.title }); g.restore(); }],
  ['J', (L) => L.n12[0] + 0.2, 1.5, (g, T, k) => { fundoLiso(g, '#c9b8ef', '#7d68c0'); const fl = Math.min(1, k * 2.2); g.save(); g.translate(540, 840); g.rotate(-0.1 + fl * 0.1); caixa(g, -230, -260, 460, 520, '#ffffff', 26, 10); g.fillStyle = '#ef4a5a'; g.fillRect(-222, -252, 444, 120); TX(g, 'ANO', 0, -192, { size: 54, color: '#fff', font: FF.viral || FF.title }); TX(g, fl < 1 ? String(1980 + Math.floor(fl * 13)) : '1993', 0, 60, { size: 170, color: NAVY, font: FF.viral || FF.title }); g.restore(); }],
  ['L', (L) => W('real', L.n14) - 0.2, 1.2, (g, T) => { fundoLiso(g, '#e6e2f2', '#b9a3e3'); moeda(g, 540, 820, 200, T, { brilho: 0.2 }); rotuloI(g, 'R$ 1 = R$ 1', 1200); }],
];
for (const [id, tf, dur, fn] of INS) { const d = getShot(id); if (!d) continue; const orig = d.draw; registerShot(id, { ...d, draw(g, t, info) { orig.call(this, g, t, info); const T = info.globalT, t0 = tf(info.L), k = (T - t0) / dur; if (k < 0 || k > 1) return; const a = Math.min(1, k / 0.06, (1 - k) / 0.08), z = 1 + 0.06 * k + (k < 0.08 ? (0.08 - k) * 1.5 : 0); g.save(); g.globalAlpha *= a; g.translate(540, 900); g.scale(z, z); g.translate(-540, -900); fn(g, T, k); g.restore(); if (k < 0.05 || k > 0.94) { g.save(); g.globalAlpha = 0.35; g.fillStyle = '#fff'; g.fillRect(-EE.W, -EE.H, EE.W * 3, EE.H * 3); g.restore(); } } }); }

// pergunta de engajamento no meio (estilo "Qual poder inútil VOCÊ teria?")
{ const d = getShot('H'); const orig = d.draw; registerShot('H', { ...d, draw(g, t, info) { orig.call(this, g, t, info); const T = info.globalT, t0 = info.shot.start + 0.3, a = Math.min(1, (T - t0) / 0.25); if (a <= 0) return; g.save(); g.translate(540, 300); g.scale(0.9 + 0.1 * a, 0.9 + 0.1 * a); g.globalAlpha *= a; RR(g, -330, -80, 660, 160, 34); g.fillStyle = '#fff6e6'; g.fill(); g.lineWidth = 8; g.strokeStyle = NAVY; g.stroke(); TX(g, 'Gastava ou guardava?', 0, -22, { size: 50, color: NAVY, font: FF.title, weight: 700 }); TX(g, 'E VOCÊ?', 0, 38, { size: 50, color: '#ef6a5a', font: FF.viral || FF.title }); g.restore(); } }); }
