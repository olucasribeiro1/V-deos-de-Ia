// Série "E se": cenários e gráficos reutilizáveis (cidade neon, ônibus, globo, mapa do Brasil, torres, mercado...).
import { E, layer, linGrad, radGrad, rr, seg, poly, circle, glow, alpha, mix, rng, text, FONTS, ease, prog, clamp, noise, veil } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
export const INK = '#0b0b0d', GY = 1305.6;
export const NEON = ['#ff2e88', '#22e1ff', '#7dff4a', '#ffd23a', '#a64bff', '#ff7a1a'];
export const box = (g, x, y, w, h, c, r = 8, lw = 5) => { rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } };
const on = (T, tOff) => (tOff == null || T < tOff ? 1 : 0);

// ---------- cidade à noite (casas coloridas + prédios + letreiros neon). luz: 1 acesa, 0 apagada; off: {semaforo, poste, predio} = tempos de apagar
export function cidade(g, t, cam, o = {}) {
  const { luz = 1, T = t, off = {}, chao = '#26222e' } = o;
  const L = (k) => (off[k] != null ? (T < off[k] ? 1 : 0) : luz);
  layer(g, cam, 0.12, g => { g.fillStyle = linGrad(g, 0, -600, 0, GY, ['#070616', '#1a1040', '#3a1d5c']); g.fillRect(-E.W * 3, -E.H * 2, E.W * 7, E.H * 4); FX.stars(g, t, { count: 60, seed: 3, area: [-E.W * 2, -E.H, E.W * 5, E.H] }); if (L('predio') < 1) { glow(g, 540, 0, 900, '#ffffff', 0.04); } });
  layer(g, cam, 0.3, g => { const r = rng(4); for (let i = -10; i < 22; i++) { const x = i * 130, h = 420 + r() * 520, w = 110 + r() * 30; g.fillStyle = '#1b1430'; g.fillRect(x, GY - 180 - h, w, h + 200);
      for (let wy = GY - 160 - h; wy < GY - 120; wy += 46) for (let wx = x + 14; wx < x + w - 20; wx += 30) if (r() < 0.55 * L('predio')) { g.fillStyle = NEON[(i + Math.floor(wy)) & 3] === '#7dff4a' ? '#fff1b0' : (r() < 0.5 ? '#ffe39a' : '#9fe8ff'); g.fillRect(wx, wy, 16, 24); } } });
  layer(g, cam, 0.6, g => { const cores = ['#ff5aa0', '#2fb8ff', '#ffcc33', '#5ad66a', '#b46bff', '#ff8a3a']; const r = rng(9);
    for (let i = -6; i < 14; i++) { const x = i * 260, h = 300 + r() * 180, c = cores[(i + 12) % cores.length], lit = L('predio');
      g.fillStyle = mix(c, '#140f22', 0.35 + 0.35 * (1 - lit)); g.fillRect(x, GY - h, 250, h); g.fillStyle = mix('#a8563c', '#140f22', 0.4); g.fillRect(x - 6, GY - h - 14, 262, 16);
      for (const wx of [30, 150]) { g.fillStyle = lit && r() < 0.7 ? '#ffe7a0' : '#0c0a14'; g.fillRect(x + wx, GY - h + 50, 66, 74); if (lit) glow(g, x + wx + 33, GY - h + 87, 70, '#ffd27a', 0.15); }
      if (i % 2 === 0) { const nc = NEON[(i + 20) % NEON.length], nm = ['BAR', 'FARMÁCIA', 'LANCHES', 'AÇAÍ', 'MERCADO', 'SALÃO'][(i + 12) % 6]; rr(g, x + 30, GY - 200, 190, 56, 10); g.fillStyle = '#0c0a14'; g.fill(); g.strokeStyle = lit ? nc : '#2a2636'; g.lineWidth = 5; g.stroke();
        text(g, nm, x + 125, GY - 171, { size: 30, color: lit ? nc : '#2a2636', font: FONTS.ui, weight: 900 }); if (lit) glow(g, x + 125, GY - 172, 160, nc, 0.35); }
      if (i % 3 === 1) { box(g, x + 160, GY - h - 70, 70, 56, '#2f7fd0', 10, 4); } }
    for (let i = -5; i < 14; i += 2) { const x = i * 260 + 240, l = L('poste'); seg(g, [[x, GY], [x, GY - 560], [x - 60, GY - 580]], 10, INK); rr(g, x - 100, GY - 592, 50, 22, 8); g.fillStyle = l ? '#fff3c4' : '#3a3644'; g.fill(); if (l) { glow(g, x - 75, GY - 560, 260, '#ffe9a8', 0.28); } }
    g.strokeStyle = alpha(INK, 0.9); g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); for (let i = -5; i < 14; i += 2) { const x = i * 260 + 240; i === -5 ? g.moveTo(x, GY - 540 + k * 16) : g.quadraticCurveTo(x - 260, GY - 470 + k * 16, x, GY - 540 + k * 16); } g.stroke(); } });
  layer(g, cam, 0.85, g => { g.fillStyle = chao; g.fillRect(-E.W * 3, GY, E.W * 7, E.H); g.fillStyle = '#3a3546'; g.fillRect(-E.W * 3, GY, E.W * 7, 28);
    for (let i = -8; i < 16; i++) { g.fillStyle = alpha('#e6e6e6', 0.45); g.fillRect(i * 300, GY + 250, 140, 12); }
    if (L('predio') > 0) for (let i = -6; i < 14; i += 2) glow(g, i * 260 + 165, GY + 120, 200, '#ffd27a', 0.08); });
  return { GY };
}
export function semaforo(g, x, y, s, T, tOff) { const l = on(T, tOff); g.save(); g.translate(x, y); g.scale(s, s); seg(g, [[0, 0], [0, -420]], 12, INK); box(g, -40, -560, 80, 200, '#1a1a20', 14, 5);
  const fase = Math.floor(T / 2.5) % 3, cs = ['#ff3030', '#ffc21a', '#2fe060']; cs.forEach((c, i) => { const lit = l && ((2 - i) === fase || (i === 0 && fase === 0)); circle(g, 0, -525 + i * 62, 22, lit ? c : '#2a2a30'); if (lit) glow(g, 0, -525 + i * 62, 110, c, 0.45); }); g.restore(); }

// ---------- ônibus por dentro (janela com a cidade passando)
export function onibus(g, t, cam, o = {}) {
  const { luz = 1, fora = null, T = t } = o;
  if (fora) layer(g, cam, 0.5, g => { g.save(); g.beginPath(); for (const x of [-420, 60, 540]) rr(g, x, 380, 440, 420, 24); g.clip(); g.translate(-(T * 260) % 1560, 0); fora(g); g.restore(); });
  layer(g, cam, 1, g => { g.fillStyle = mix('#ffcf3a', '#0c0a14', 0.25 + 0.6 * (1 - luz)); g.beginPath(); g.rect(-E.W * 2, -E.H, E.W * 5, E.H * 3);
    for (const x of [-420, 60, 540]) rr(g, x, 380, 440, 420, 24); g.fill('evenodd');
    for (const x of [-420, 60, 540]) { rr(g, x, 380, 440, 420, 24); g.strokeStyle = INK; g.lineWidth = 10; g.stroke(); seg(g, [[x + 220, 380], [x + 220, 800]], 8, INK); }
    g.fillStyle = mix('#2a6fd6', '#0c0a14', 0.3 + 0.6 * (1 - luz)); g.fillRect(-E.W * 2, 860, E.W * 5, 70); g.fillStyle = mix('#3a3a44', '#08080c', 0.6 * (1 - luz)); g.fillRect(-E.W * 2, GY + 40, E.W * 5, E.H);
    for (const x of [-300, 180, 660, 1140]) { seg(g, [[x, 300], [x, GY + 40]], 12, mix('#c8c8d0', '#222', 1 - luz)); }
    seg(g, [[-E.W, 300], [E.W * 2, 300]], 10, mix('#c8c8d0', '#222', 1 - luz));
    for (const x of [-200, 280, 760]) { box(g, x, 1000, 240, 90, mix('#2fb88a', '#0c0a14', 0.3 + 0.6 * (1 - luz)), 18, 6); box(g, x + 170, 880, 70, 220, mix('#2fb88a', '#0c0a14', 0.3 + 0.6 * (1 - luz)), 18, 6); }
    if (luz > 0) for (let i = -1; i < 3; i++) { rr(g, i * 480 + 100, 230, 260, 26, 12); g.fillStyle = '#f8fbff'; g.fill(); glow(g, i * 480 + 230, 260, 300, '#e8f4ff', 0.18 * luz); } });
}

// ---------- globo ortográfico
const SA = [[-77, 8], [-72, 12], [-62, 10.5], [-51, 4], [-35, -5], [-39, -13], [-41, -22], [-48, -26], [-57, -35], [-62, -39], [-65, -45], [-68, -52], [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0]];
const NA = [[-80, 9], [-87, 15], [-97, 16], [-105, 20], [-117, 32], [-124, 40], [-125, 49], [-135, 58], [-165, 62], [-160, 70], [-120, 70], [-80, 72], [-62, 60], [-55, 50], [-67, 45], [-76, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 22], [-91, 19], [-87, 21], [-83, 15]];
const AF = [[-17, 15], [-5, 36], [10, 37], [32, 31], [43, 12], [51, 12], [40, -15], [32, -29], [20, -35], [12, -17], [9, 4], [-8, 4.5]];
const EU = [[-9, 43], [-9, 38], [3, 43], [10, 44], [13, 38], [19, 40], [28, 41], [30, 46], [40, 47], [45, 60], [30, 70], [15, 68], [5, 58], [8, 54], [-2, 50], [-5, 48]];
const AS = [[45, 60], [40, 47], [36, 36], [48, 30], [57, 25], [67, 24], [77, 8], [88, 22], [100, 14], [106, 10], [122, 30], [121, 40], [130, 43], [140, 52], [160, 62], [180, 68], [100, 76], [60, 70]];
const AU = [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [131, -31], [115, -34]];
export const CONT = [SA, NA, AF, EU, AS, AU];
export function proj(lon, lat, l0, p0, R) { const r = Math.PI / 180, la = lat * r, lo = (lon - l0) * r, pp = p0 * r; const x = R * Math.cos(la) * Math.sin(lo), y = R * (Math.cos(pp) * Math.sin(la) - Math.sin(pp) * Math.cos(la) * Math.cos(lo)); const c = Math.sin(pp) * Math.sin(la) + Math.cos(pp) * Math.cos(la) * Math.cos(lo); return [x, -y, c]; }
export function globo(g, cx, cy, R, t, o = {}) {
  const { l0 = -95, p0 = -5, calor = 0, terra = '#3fd46a', mar = '#1561d6', escuro = 0 } = o;
  glow(g, cx, cy, R * 1.5, '#3aa0ff', 0.25 * (1 - escuro));
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fillStyle = radGrad(g, cx - R * 0.3, cy - R * 0.3, 0, R * 1.3, [mix('#3aa8ff', '#0a1430', escuro * 0.7), mix(mar, '#06091a', escuro * 0.7), mix('#0a2a6e', '#03040c', escuro * 0.7)]); g.fill(); g.clip();
  if (calor > 0) { const [px, py, c] = proj(-130, 0, l0, p0, R); if (c > 0) { const k = calor * (0.85 + 0.15 * Math.sin(t * 5)); g.fillStyle = radGrad(g, cx + px, cy + py, 0, R * 0.8, [alpha('#ff3a1a', 0.95 * k), alpha('#ff9a1a', 0.6 * k), alpha('#ff9a1a', 0)]); g.fillRect(cx - R, cy - R, R * 2, R * 2); } }
  g.strokeStyle = alpha('#ffffff', 0.12); g.lineWidth = 2; for (let lo = -180; lo < 180; lo += 30) { g.beginPath(); let st = false; for (let la = -90; la <= 90; la += 5) { const [x, y, c] = proj(lo, la, l0, p0, R); if (c > 0) { st ? g.lineTo(cx + x, cy + y) : g.moveTo(cx + x, cy + y); st = true; } else st = false; } g.stroke(); }
  for (const P of CONT) { const pts = P.map(([lo, la]) => proj(lo, la, l0, p0, R)); if (pts.every(p => p[2] < 0)) continue; g.beginPath(); pts.forEach(([x, y, c], i) => { const k = c < 0 ? R / Math.hypot(x, y) : 1; const X = cx + x * k, Y = cy + y * k; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fillStyle = mix(terra, '#101418', escuro * 0.75); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
  g.restore(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  return (lon, lat) => { const [x, y, c] = proj(lon, lat, l0, p0, R); return [cx + x, cy + y, c]; };
}

// ---------- mapa do Brasil (contorno aproximado). zonas: fn(lon,lat)->cor|null; apaga: 0..1 escurece de NE pra SW
const BR = [[-60, 5], [-51, 4], [-50, 2], [-48, -1], [-44, -2.5], [-40, -3], [-35, -5], [-35, -9], [-39, -13], [-39, -17], [-41, -22], [-44, -23], [-48, -26], [-49, -29], [-53, -33.7], [-57, -30], [-54, -27], [-54, -25], [-58, -23], [-58, -20], [-60, -16], [-65, -12], [-70, -11], [-73, -9], [-74, -7], [-70, -4], [-70, -2], [-67, 1], [-64, 2]];
export const brXY = (lon, lat, cx, cy, s) => [cx + (lon + 54) * s, cy + (-14 - lat) * s];
export function mapaBR(g, cx, cy, s, t, o = {}) {
  const { cor = '#3fd46a', zonas = null, apaga = 0, estados = true } = o;
  const path = () => { g.beginPath(); BR.forEach(([lo, la], i) => { const [x, y] = brXY(lo, la, cx, cy, s); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
  g.save(); path(); g.fillStyle = INK; g.save(); g.translate(10, 14); g.fill(); g.restore(); g.fillStyle = cor; g.fill(); g.clip();
  if (zonas) for (let lo = -75; lo < -33; lo += 1) for (let la = 6; la > -35; la -= 1) { const c = zonas(lo, la); if (c) { const [x, y] = brXY(lo, la, cx, cy, s); g.fillStyle = c; g.fillRect(x, y, s + 1, s + 1); } }
  if (estados) { g.strokeStyle = alpha(INK, 0.35); g.lineWidth = 3; const r = rng(31); for (let i = 0; i < 26; i++) { const lo = -72 + r() * 36, la = 3 - r() * 33; const [x, y] = brXY(lo, la, cx, cy, s); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * s * 14, y + (r() - 0.5) * s * 14); g.stroke(); } }
  if (apaga > 0) { const r = rng(7); for (let lo = -75; lo < -33; lo += 3) for (let la = 6; la > -35; la -= 3) { const ord = ((-lo - 34) / 41 * 0.5 + (6 - la) / 41 * 0.5) * 0.85 + r() * 0.15; if (apaga > 1 - ord) { const [x, y] = brXY(lo, la, cx, cy, s); g.fillStyle = '#1a1830'; g.fillRect(x, y, s * 3 + 1, s * 3 + 1); } } }
  g.restore(); path(); g.strokeStyle = apaga > 0 ? alpha('#ffd23a', 0.35 + 0.65 * (1 - apaga)) : INK; g.lineWidth = 7; g.stroke();
}

// ---------- torre de transmissão (queda: 0..1)
export function torre(g, x, y, s, queda = 0, faisca = 0, t = 0) {
  g.save(); g.translate(x, y); g.rotate(ease.in(clamp(queda)) * 1.35); g.scale(s, s); const c = '#c9d2de';
  const P = [[-70, 0], [-26, -380], [26, -380], [70, 0]]; seg(g, [P[0], P[1]], 14, INK); seg(g, [P[3], P[2]], 14, INK); seg(g, [P[0], P[1]], 8, c); seg(g, [P[3], P[2]], 8, c);
  for (let i = 0; i < 6; i++) { const y0 = -i * 64, y1 = -(i + 1) * 64, w0 = 70 - i * 7.3, w1 = 70 - (i + 1) * 7.3; seg(g, [[-w0, y0], [w1, y1]], 5, c); seg(g, [[w0, y0], [-w1, y1]], 5, c); }
  seg(g, [[-130, -330], [130, -330]], 12, INK); seg(g, [[-130, -330], [130, -330]], 6, c); seg(g, [[-90, -260], [90, -260]], 10, INK); seg(g, [[-90, -260], [90, -260]], 5, c);
  if (faisca > 0) { for (let i = 0; i < 6; i++) { const a = i + t * 30; seg(g, [[130, -330], [130 + Math.cos(a) * 60 * faisca, -330 + Math.sin(a) * 60 * faisca]], 5, '#fff6a0'); } glow(g, 130, -330, 160, '#9fe8ff', 0.8 * faisca); }
  g.restore();
}

// ---------- celular na mão (tela com bateria)
export function celular(g, x, y, s, o = {}) { const { bat = 12, sinal = 4, tela = 1, msg = null } = o; g.save(); g.translate(x, y); g.scale(s, s); box(g, -70, -130, 140, 260, '#16161c', 22, 7);
  rr(g, -58, -112, 116, 224, 12); g.fillStyle = tela ? '#1b2a4a' : '#05060a'; g.fill(); if (tela) { glow(g, 0, 0, 160, '#7fc8ff', 0.18);
    rr(g, 20, -100, 30, 14, 3); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); g.fillStyle = bat < 20 ? '#ff3a3a' : '#5fe06a'; g.fillRect(22, -98, 26 * bat / 100, 10);
    for (let i = 0; i < 4; i++) { g.fillStyle = i < sinal ? '#fff' : alpha('#fff', 0.2); g.fillRect(-48 + i * 9, -92 - i * 4, 6, 6 + i * 4); }
    text(g, msg || `${bat}%`, 0, 10, { size: msg ? 22 : 46, color: bat < 20 && !msg ? '#ff4a4a' : '#fff', font: FONTS.ui, weight: 900 }); }
  g.restore(); }

// ---------- prateleira de mercado (cheia 0..1)
export function gondola(g, x, y, w, cheia = 1, seed = 1) { box(g, x, y - 520, w, 520, '#e8e2d6', 6, 6); const r = rng(seed), cs = ['#ff3a6a', '#2fa8ff', '#ffd23a', '#38d46a', '#ff8a2a', '#a65bff'];
  for (let j = 0; j < 4; j++) { const sy = y - 120 - j * 125; g.fillStyle = '#9aa0aa'; g.fillRect(x, sy, w, 14); for (let px = x + 10; px < x + w - 30; px += 34) if (r() < cheia) box(g, px, sy - 70 - r() * 20, 28, 70, cs[Math.floor(r() * 6)], 4, 3); } }
export function maquininha(g, x, y, s, falha = 0, t = 0) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -80, -150, 160, 300, '#2a2a34', 24, 7); rr(g, -60, -126, 120, 90, 8); g.fillStyle = falha ? '#3a0a10' : '#bfe9ff'; g.fill();
  if (falha) { text(g, 'SEM', 0, -98, { size: 24, color: '#ff4a4a', font: FONTS.ui, weight: 900 }); text(g, 'CONEXÃO', 0, -66, { size: 24, color: '#ff4a4a', font: FONTS.ui, weight: 900, alpha: 0.6 + 0.4 * Math.sin(t * 10) }); }
  for (let i = 0; i < 12; i++) circle(g, -40 + (i % 3) * 40, -2 + Math.floor(i / 3) * 34, 12, '#5a5a66'); g.restore(); }
export function nota(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); box(g, -80, -40, 160, 80, '#7fd69a', 8, 4); circle(g, 0, 0, 24, '#4fae6e'); text(g, 'R$', 0, 2, { size: 26, color: '#0b3a1e', font: FONTS.ui, weight: 900 }); g.restore(); }
export function cartao(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); box(g, -80, -50, 160, 100, '#6a4bff', 12, 4); g.fillStyle = '#ffd23a'; g.fillRect(-60, -20, 34, 26); g.fillStyle = '#0b0b0d'; g.fillRect(-80, 18, 160, 12); g.restore(); }

// ---------- item de checklist (ícone desenhado + texto). ok: true ✓ verde, false ✗ vermelho
export function item(g, x, y, str, a, ok = true, w = 780) { if (a <= 0) return; g.save(); g.translate(x, y); g.scale(a, a); rr(g, -w / 2, -52, w, 104, 28); g.fillStyle = INK; g.fill(); rr(g, -w / 2 + 8, -44, w - 16, 88, 22); g.fillStyle = ok ? '#123a22' : '#3a1216'; g.fill();
  circle(g, -w / 2 + 62, 0, 32, ok ? '#38d46a' : '#ff3a4a'); text(g, ok ? '✓' : '✕', -w / 2 + 62, 2, { size: 44, color: '#fff', font: FONTS.ui, weight: 900 });
  text(g, str, -w / 2 + 116, 4, { size: 44, color: '#fff', font: FONTS.ui, weight: 900, align: 'left' }); g.restore(); }
