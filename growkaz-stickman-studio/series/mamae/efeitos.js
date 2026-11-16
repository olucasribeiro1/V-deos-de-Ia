// Efeitos de urgência e gráficos da série (reutilizáveis em todos os episódios).
import { E, S, rr, seg, poly, circle, ring, glow, alpha, mix, rng, noise, ease, prog, clamp, lerp, text, FONTS, veil } from '/engine/core.js';
const INK = '#0b0b0d';

// poeira radioativa caindo (fallout) — cinza, em diagonal, com flocos maiores
export function fallout(g, t, o = {}) {
  const { count = 160, a = 0.75, wind = 40, speed = 120, area = [-100, -100, E.W + 200, E.H + 200], seed = 9 } = o; const r = rng(seed);
  for (let i = 0; i < count; i++) { const s = 0.5 + r() * 1.5, x0 = r() * area[2], y0 = r() * area[3], sz = (1.5 + r() * 4) * s;
    const y = area[1] + ((y0 + t * speed * s) % area[3]), x = area[0] + ((x0 + t * wind * s + Math.sin(t * 2 + i) * 8) % area[2]);
    g.fillStyle = alpha(i % 5 ? '#b9bcc2' : '#e6e6e6', a * (0.35 + 0.65 * r())); g.beginPath(); g.ellipse(x, y, sz, sz * 0.8, i, 0, 7); g.fill(); }
}
// símbolo de radiação (trifólio) girando
export function simboloRad(g, x, y, R, t = 0, cor = '#e6c02a') {
  g.save(); g.translate(x, y); g.rotate(t * 0.6); circle(g, 0, 0, R * 1.08, INK); circle(g, 0, 0, R, cor);
  g.fillStyle = INK; for (let k = 0; k < 3; k++) { const a0 = k * 2.094 - 0.52; g.beginPath(); g.moveTo(Math.cos(a0) * R * 0.2, Math.sin(a0) * R * 0.2); g.arc(0, 0, R * 0.85, a0, a0 + 1.047); g.arc(0, 0, R * 0.2, a0 + 1.047, a0, true); g.fill(); }
  circle(g, 0, 0, R * 0.14, INK); g.restore();
}
// contador Geiger: caixa amarela com ponteiro e luz piscando (nivel 0..1)
export function geiger(g, x, y, s, t, nivel = 0.8) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -120, -90, 240, 180, 22); g.fillStyle = INK; g.fill(); rr(g, -110, -80, 220, 160, 16); g.fillStyle = '#e6c02a'; g.fill();
  rr(g, -86, -62, 172, 82, 10); g.fillStyle = INK; g.fill(); rr(g, -80, -56, 160, 70, 8); g.fillStyle = '#efe8d0'; g.fill();
  const ang = -2.6 + (0.25 + 0.75 * nivel) * 2.0 + noise(t * 12, 2) * 0.12 * nivel; seg(g, [[0, 6], [Math.cos(ang) * 60, 6 + Math.sin(ang) * 60]], 5, '#d8342b'); circle(g, 0, 6, 8, INK);
  for (let i = 0; i <= 8; i++) { const a = -2.6 + i * 0.25; seg(g, [[Math.cos(a) * 52, 6 + Math.sin(a) * 52], [Math.cos(a) * 62, 6 + Math.sin(a) * 62]], 3, i > 5 ? '#d8342b' : INK); }
  const on = noise(t * 25, 5) > 0.2 - nivel * 0.6; circle(g, 70, 50, 14, INK); circle(g, 70, 50, 10, on ? '#ff4030' : '#5a2a2a'); if (on) glow(g, 70, 50, 50, '#ff4030', 0.7);
  seg(g, [[-120, 30], [-190, 60], [-200, 130]], 12, INK); rr(g, -230, 120, 60, 110, 20); g.fillStyle = INK; g.fill(); rr(g, -222, 128, 44, 94, 14); g.fillStyle = '#5a6068'; g.fill();
  g.restore();
}
// borda vermelha pulsando (urgência)
export function alerta(g, t, a = 1, cor = '#d8342b') { const p = (0.5 + 0.5 * Math.sin(t * 7)) * a; g.save(); const gr = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.3, E.W / 2, E.H / 2, E.H * 0.75); gr.addColorStop(0, alpha(cor, 0)); gr.addColorStop(1, alpha(cor, 0.55 * p)); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
// relógio de parede (h = hora decimal)
export function relogio(g, x, y, R, h, o = {}) {
  circle(g, x, y, R + 10, INK); circle(g, x, y, R, '#efe8d0'); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; seg(g, [[x + Math.cos(a) * R * 0.82, y + Math.sin(a) * R * 0.82], [x + Math.cos(a) * R * 0.94, y + Math.sin(a) * R * 0.94]], i % 3 ? 4 : 8, INK); }
  const ah = (h % 12) / 12 * Math.PI * 2 - Math.PI / 2, am = (h % 1) * Math.PI * 2 - Math.PI / 2;
  seg(g, [[x, y], [x + Math.cos(ah) * R * 0.5, y + Math.sin(ah) * R * 0.5]], 12, INK); seg(g, [[x, y], [x + Math.cos(am) * R * 0.78, y + Math.sin(am) * R * 0.78]], 7, '#d8342b'); circle(g, x, y, 12, INK);
}
// cartão de dado rápido (número grande + linha curta)
export function cartao(g, t, x, y, o = {}) {
  const { titulo = '', grande = '', sub = '', cor = null, w = 760, h = 330, inicio = 0 } = o; const ui = S().ui; const a = ease.outBack(prog(t, inicio, inicio + 0.3)); if (a <= 0) return;
  g.save(); g.translate(x, y); g.scale(a, a); g.rotate(-0.02);
  rr(g, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 34); g.fillStyle = INK; g.fill(); rr(g, -w / 2, -h / 2, w, h, 28); g.fillStyle = '#efe8d0'; g.fill();
  rr(g, -w / 2, -h / 2, w, 76, 28); g.fillStyle = cor || ui.accent; g.fill(); g.fillRect(-w / 2, -h / 2 + 40, w, 36);
  text(g, titulo, 0, -h / 2 + 40, { size: 42, color: '#ffffff', font: FONTS.ui, weight: 900, spacing: 4 });
  text(g, grande, 0, 30, { size: 130, color: '#16181d', spacing: 2 }); if (sub) text(g, sub, 0, h / 2 - 44, { size: 40, color: '#4a4f58', font: FONTS.ui, weight: 900, spacing: 2 });
  g.restore();
}
// gráfico da regra 7-10: barras que despencam (k = quantas barras visíveis, com animação)
export function regra710(g, t, x, y, o = {}) {
  const { mostra = [0, 0, 0, 0], w = 820, h = 640 } = o; const ui = S().ui;
  const dados = [['1 H', 1, '100%'], ['7 H', 0.1, '10%'], ['2 DIAS', 0.01, '1%'], ['2 SEM.', 0.001, '0,1%']];
  g.save(); g.translate(x, y); rr(g, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 34); g.fillStyle = INK; g.fill(); rr(g, -w / 2, -h / 2, w, h, 28); g.fillStyle = '#efe8d0'; g.fill();
  text(g, 'REGRA 7-10', 0, -h / 2 + 58, { size: 70, color: '#16181d', spacing: 3 }); text(g, 'RADIAÇÃO LÁ FORA', 0, -h / 2 + 112, { size: 30, color: '#6a6f78', font: FONTS.ui, weight: 900, spacing: 4 });
  const base = h / 2 - 90, maxH = h - 290, bw = 140;
  dados.forEach(([lab, v, pct], i) => { const p = ease.out(clamp(mostra[i])); if (p <= 0) return; const bx = -w / 2 + 70 + i * (bw + 50), bh = Math.max(10, maxH * Math.pow(v, 0.35)) * p;
    rr(g, bx - 6, base - bh - 6, bw + 12, bh + 12, 14); g.fillStyle = INK; g.fill(); rr(g, bx, base - bh, bw, bh, 10); g.fillStyle = i === 0 ? ui.accent : i === 1 ? '#e0a030' : i === 2 ? '#e6c02a' : '#5fd36a'; g.fill();
    text(g, pct, bx + bw / 2, base - bh - 42, { size: 46, color: '#16181d', spacing: 1 }); text(g, lab, bx + bw / 2, base + 42, { size: 30, color: '#4a4f58', font: FONTS.ui, weight: 900 }); });
  g.restore();
}
// olhos brilhando no escuro (pares de olhos piscando) — p = [[x,y,s], ...]
export function olhosNoEscuro(g, t, pares) { pares.forEach(([x, y, s = 1, look = 0], i) => { const bl = ((t + i * 0.7) % 2.6) > 2.48; for (const dx of [-16, 16]) { if (bl) seg(g, [[x + dx * s - 10 * s, y], [x + dx * s + 10 * s, y]], 6 * s, '#f1efe9'); else { g.fillStyle = '#f1efe9'; g.beginPath(); g.ellipse(x + dx * s, y, 12 * s, 15 * s, 0, 0, 7); g.fill(); circle(g, x + dx * s + look * 4 * s, y + 2 * s, 6 * s, INK); } } }); }
// sopro de respiração (nuvem que expande)
export function sopro(g, x, y, t, s = 1) { const ph = (t * 0.9) % 1; g.fillStyle = `rgba(230,232,236,${0.35 * (1 - ph)})`; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + (ph * 60 + k * 18) * s, y - (ph * 30 + k * 6) * s, (14 + ph * 26 + k * 6) * s, 0, 7); g.fill(); } }
// tremor de impacto da câmera (retorna [dx,dy]) para usar no cam do shot
export const impacto = (t, t0, amp = 22, dur = 0.5) => { const k = t - t0; if (k < 0 || k > dur) return [0, 0]; const f = (1 - k / dur) ** 2; return [noise(t * 30, 1) * amp * f, noise(t * 30, 4) * amp * f]; };
// riscos de "susto" saindo do centro (cartoon)
export function riscosSusto(g, x, y, t, a = 1, cor = '#ffffff') { g.save(); for (let i = 0; i < 18; i++) { const ang = i / 18 * Math.PI * 2 + 0.1 * Math.sin(t * 9 + i), r0 = 330 + 20 * Math.sin(t * 20 + i), r1 = r0 + 140; seg(g, [[x + Math.cos(ang) * r0, y + Math.sin(ang) * r0], [x + Math.cos(ang) * r1, y + Math.sin(ang) * r1]], 10, alpha(cor, 0.6 * a)); } g.restore(); }
