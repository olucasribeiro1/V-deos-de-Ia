// VFX de cartoon para os vídeos humanizados: explosão de linhas, estrelas, onomatopeias, linhas de velocidade, confete, flash, tremida.
import { E, ease, prog, clamp, lerp, rr, poly, circle, glow, alpha, text, FONTS, rng } from '/engine/core.js';
const INK = '#2b3347', CORES = ['#ff2e88', '#22e1ff', '#ffe600', '#39ff5a', '#ff7a1a', '#a64bff'];
// explosão de linhas radiais (impacto) a partir de (x,y) no tempo t0
export function estouro(g, T, t0, x, y, o = {}) { const k = (T - t0) / (o.dur ?? 0.45); if (k < 0 || k > 1) return; const n = o.n ?? 16, r0 = (o.r0 ?? 60) + k * 140, r1 = r0 + (1 - k) * (o.len ?? 170), c = o.cor ?? '#ffe600';
  g.save(); g.lineCap = 'round'; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + (i % 2) * 0.12, w = (i % 2 ? 10 : 18) * (1 - k); g.strokeStyle = INK; g.lineWidth = w + 8; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); g.strokeStyle = c; g.lineWidth = w; g.stroke(); } g.restore(); }
// estrela de desenho (spike) com contorno
export function estrela(g, x, y, r, cor, rot = 0, pontas = 10) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); for (let i = 0; i <= pontas * 2; i++) { const a = i / (pontas * 2) * Math.PI * 2, rr2 = i % 2 ? r * 0.55 : r; g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } g.closePath(); g.fillStyle = cor; g.fill(); g.lineWidth = Math.max(4, r * 0.08); g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); g.restore(); }
// onomatopeia em balão estrelado ("PLIM!", "BOOM!", "UAU!")
export function onomato(g, T, t0, x, y, str, o = {}) { const k = T - t0, dur = o.dur ?? 1.0; if (k < 0 || k > dur) return; const a = ease.outBack(clamp(k / 0.22)) * (k > dur - 0.18 ? clamp((dur - k) / 0.18) : 1), cor = o.cor ?? '#ffe600', sz = o.tam ?? 110;
  g.save(); g.translate(x, y); g.rotate((o.rot ?? -0.12) + Math.sin(k * 20) * 0.03); g.scale(a, a); estrela(g, 0, 0, sz * 1.35, o.fundo ?? '#ff2e88', 0, 12); text(g, str, 0, sz * 0.06, { size: sz, color: cor, font: FONTS.viral || FONTS.title, stroke: sz * 0.2, strokeColor: INK }); g.restore(); }
// faíscas/brilhos que estouram em volta de um ponto
export function brilhos(g, T, t0, x, y, o = {}) { const k = (T - t0) / (o.dur ?? 0.9); if (k < 0 || k > 1) return; const r = rng(o.seed ?? 3), n = o.n ?? 14;
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = (60 + r() * (o.raio ?? 260)) * ease.out(k), s = (14 + r() * 22) * (1 - k); estrela(g, x + Math.cos(a) * d, y + Math.sin(a) * d - k * 40, s, CORES[i % 6], k * 6 + i, 4); } }
// confete caindo na tela toda
export function confete(g, T, t0, o = {}) { const k = T - t0; if (k < 0 || k > (o.dur ?? 3)) return; const r = rng(7); for (let i = 0; i < (o.n ?? 70); i++) { const x = r() * E.W, v = 500 + r() * 600, y = -60 + k * v - r() * 400, rot = k * (3 + r() * 6) + i; if (y > E.H + 50) continue; g.save(); g.translate(x + Math.sin(k * 4 + i) * 30, y); g.rotate(rot); g.fillStyle = CORES[i % 6]; g.fillRect(-12, -7, 24, 14); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-12, -7, 24, 14); g.restore(); } }
// linhas de velocidade (anime) nas bordas
export function velocidade(g, T, a = 1, seed = 1) { if (a <= 0) return; const r = rng(Math.floor(T * 18) + seed); g.save(); g.globalAlpha *= a; for (let i = 0; i < 46; i++) { const ang = r() * Math.PI * 2, r0 = 520 + r() * 260, r1 = 1300; const w = 3 + r() * 9; g.fillStyle = i % 3 ? '#ffffff' : INK; g.beginPath(); g.moveTo(540 + Math.cos(ang) * r1, 960 + Math.sin(ang) * r1); g.lineTo(540 + Math.cos(ang + w / 600) * r0, 960 + Math.sin(ang + w / 600) * r0); g.lineTo(540 + Math.cos(ang - w / 600) * r0, 960 + Math.sin(ang - w / 600) * r0); g.fill(); } g.restore(); }
// flash de cor na tela
export function flash(g, T, t0, cor = '#ffffff', dur = 0.18) { const k = (T - t0) / dur; if (k < 0 || k > 1) return; g.save(); g.fillStyle = alpha(cor, 0.7 * (1 - k)); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
// fundo de raios giratórios (sunburst) tipo desenho
export function sunburst(g, T, cores = ['#ffe600', '#ffb800'], cx = 540, cy = 900) { g.save(); g.translate(cx, cy); g.rotate(T * 0.25); for (let i = 0; i < 24; i++) { g.fillStyle = cores[i % 2]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 2400, i / 24 * Math.PI * 2, (i + 1) / 24 * Math.PI * 2); g.closePath(); g.fill(); } g.restore(); }
// número que salta com contorno grosso e brilho
export function numeroPop(g, T, t0, x, y, str, o = {}) { const a = ease.outBack(clamp((T - t0) / 0.25)); if (a <= 0) return; const sz = o.tam ?? 130; g.save(); g.translate(x, y); g.scale(a, a); g.rotate(o.rot ?? -0.04); glow(g, 0, 0, sz * 2, o.brilho ?? '#ffe600', 0.35); text(g, str, 0, 0, { size: sz, color: o.cor ?? '#ffe600', font: FONTS.viral || FONTS.title, stroke: sz * 0.22, strokeColor: INK }); g.restore(); }
// ---------- paleta por fase (fórmula "Nesta cidade"): frio no conflito + um ponto de luz quente; dourado na resolução ----------
export function fase(g, tipo, k = 1, T = 0, o = {}) { if (k <= 0) return; g.save();
  if (tipo === 'frio') {
    g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(200,222,236,${0.45 * k})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // único ponto de luz quente: facho dourado entrando pelo alto
    const lx = o.lx ?? 860, ly = o.ly ?? 120; g.globalCompositeOperation = 'lighter';
    const gr = g.createLinearGradient(lx, ly, lx - 420, ly + 1500); gr.addColorStop(0, `rgba(255,196,90,${0.42 * k})`); gr.addColorStop(1, 'rgba(255,196,90,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(lx - 60, ly - 200); g.lineTo(lx + 90, ly - 200); g.lineTo(lx - 280, ly + 1700); g.lineTo(lx - 760, ly + 1700); g.closePath(); g.fill();
    for (let i = 0; i < 14; i++) { const ph = (T * 0.08 + i * 0.071) % 1; circle(g, lx - 120 - ph * 380 + Math.sin(i * 3 + T) * 30, ly + ph * 1400, 3 + (i % 3), `rgba(255,225,160,${0.5 * k * (1 - ph)})`); }
    if (o.foco) glow(g, o.foco[0], o.foco[1], o.foco[2] ?? 260, '#ffc45a', 0.35 * k);
  } else if (tipo === 'quente') {
    g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,170,60,${0.45 * k})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(540, 250, 0, 540, 250, 1300); gr.addColorStop(0, `rgba(255,210,120,${0.28 * k})`); gr.addColorStop(1, 'rgba(255,210,120,0)'); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  }
  g.restore(); }
