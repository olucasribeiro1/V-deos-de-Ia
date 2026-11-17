// "Nesse mundo": cenários 2D (escritório celestial, quarto, padaria, rua, mercado, linha do tempo das moedas) com camadas de profundidade.
import { E, layer, linGrad, radGrad, rr, seg, poly, circle, glow, alpha, mix, shade, rng, text, FONTS, ease, prog, clamp, lerp, veil } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { drawHumano as drawFigure, ANJO_ESTAGIARIO, SEU_MANOEL, MAE as MAE_H } from '/engine/humano2d.js';
export const INK = '#000000', GY = 1305.6, WH = '#f1efe9';
export const box = (g, x, y, w, h, c, r = 8, lw = 8) => { rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } };
export const ANJO = ANJO_ESTAGIARIO;
export const MANOEL = SEU_MANOEL;
export const MAE = MAE_H;

// ---------- céu / escritório celestial ----------
export function ceu(g, t, cam, o = {}) { const { noite = 0 } = o;
  layer(g, cam, 0.1, g => { g.fillStyle = linGrad(g, 0, -900, 0, 2200, [mix('#7ec8ff', '#0a0a2a', noite), mix('#c8ecff', '#2a1a5a', noite), mix('#fff4d8', '#4a2a6a', noite)]); g.fillRect(-E.W * 3, -E.H * 2, E.W * 7, E.H * 5); if (noite) FX.stars(g, t, { count: 120, seed: 4, area: [-E.W * 2, -E.H, E.W * 5, E.H * 2] });
    glow(g, 540, 300, 700, noite ? '#8a7aff' : '#fff6c0', 0.35); });
  layer(g, cam, 0.35, g => nuvens(g, t, 900, 0.9, noite));
  layer(g, cam, 0.7, g => { nuvens(g, t * 1.3, 1420, 1.3, noite, 5); for (let i = -3; i < 6; i++) { const x = i * 300; g.fillStyle = mix('#f4f0ff', '#5a4a8a', noite); rr(g, x, 380, 60, 1100, 20); g.fill(); g.fillStyle = mix('#d8d0f0', '#3a2a6a', noite); rr(g, x - 20, 360, 100, 40, 10); g.fill(); rr(g, x - 20, 1460, 100, 40, 10); g.fill(); } });
}
function nuvens(g, t, y, s, noite = 0, seed = 2) { const r = rng(seed); for (let i = 0; i < 9; i++) { const x = ((i * 380 + t * 18 * s) % 3400) - 1200, yy = y + (r() - 0.5) * 160; g.fillStyle = mix('#ffffff', '#6a5a9a', noite); for (const [dx, dy, rr2] of [[0, 0, 90], [80, -30, 110], [180, 0, 90], [100, 30, 80]]) { g.beginPath(); g.arc(x + dx * s, yy + dy * s, rr2 * s, 0, 7); g.fill(); } } }
export function mesaAnjo(g, x, y, t, o = {}) { const { alerta = 0, linhaVermelha = 0, noite = 0 } = o;
  box(g, x - 300, y - 40, 600, 50, '#f2ead8', 10); seg(g, [[x - 260, y + 10], [x - 260, y + 200]], 14, '#c8b8e0'); seg(g, [[x + 260, y + 10], [x + 260, y + 200]], 14, '#c8b8e0');
  // tela holográfica
  g.save(); g.globalAlpha *= 0.92; rr(g, x - 280, y - 520, 560, 420, 20); g.fillStyle = alerta ? 'rgba(80,10,20,.85)' : 'rgba(20,40,90,.8)'; g.fill(); g.strokeStyle = alerta ? '#ff4a4a' : '#7fd8ff'; g.lineWidth = 6; g.shadowColor = g.strokeStyle; g.shadowBlur = 24; g.stroke(); g.restore();
  text(g, alerta ? 'MOEDA_GLOBAL ÷ 10.000' : 'ECONOMIA_TERRA.exe', x, y - 470, { size: 34, color: alerta ? '#ff8a8a' : '#bfe8ff', font: FONTS.ui, weight: 900 });
  for (let i = 0; i < 6; i++) { const yy = y - 410 + i * 48, red = linhaVermelha && i === 3; rr(g, x - 250, yy - 18, 500, 38, 8); g.fillStyle = red ? (Math.sin(t * 10) > 0 ? '#ff3a3a' : '#a01a1a') : 'rgba(127,216,255,.18)'; g.fill();
    text(g, red ? 'GUILHERME — NÃO CONVERTIDO' : ['ANA — OK', 'BRUNO — OK', 'CARLA — OK', '', 'JOÃO — OK', 'KÁTIA — OK'][i], x - 230, yy + 2, { size: 26, color: red ? '#fff' : '#bfe8ff', font: FONTS.ui, weight: 900, align: 'left' }); }
  if (alerta) glow(g, x, y - 300, 420, '#ff3a3a', 0.25 + 0.15 * Math.sin(t * 12));
}
export function asas(g, x, y, s, t, cor = '#ffffff') { const b = Math.sin(t * 3) * 0.12; for (const sx of [-1, 1]) { g.save(); g.translate(x, y); g.scale(sx * s, s); g.rotate(b); g.fillStyle = INK; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(80, -120, 150, -60); g.quadraticCurveTo(130, -10, 110, 10); g.quadraticCurveTo(90, 40, 60, 40); g.closePath(); g.fill(); g.fillStyle = cor; g.beginPath(); g.moveTo(6, 0); g.quadraticCurveTo(78, -108, 140, -58); g.quadraticCurveTo(120, -12, 102, 8); g.quadraticCurveTo(84, 32, 58, 32); g.closePath(); g.fill(); g.restore(); } }
export function aureola(g, x, y, s, t) { g.save(); g.translate(x, y); g.strokeStyle = '#ffd76a'; g.lineWidth = 9 * s; g.shadowColor = '#ffd76a'; g.shadowBlur = 20; g.beginPath(); g.ellipse(0, Math.sin(t * 2) * 4, 34 * s, 10 * s, 0, 0, 7); g.stroke(); g.restore(); }
export function anjo(g, x, y, s, t, o = {}) { asas(g, x - 4 * s, y - 165 * s, s, t); drawFigure(g, { x, y, s, facing: o.facing ?? 1, outfit: ANJO, pose: o.pose || POSES.stand, expr: o.expr || 'neutral', t, emote: o.emote, talk: o.talk, look: o.look }); aureola(g, x + (o.facing ?? 1) * 4 * s, y - 252 * s, s, t); }

// ---------- quarto do Guilherme ----------
export function quarto(g, t, cam, o = {}) { const { dia = 0, vazio = 0 } = o;
  layer(g, cam, 0.5, g => { g.fillStyle = '#6a8ae0'; g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3); g.fillStyle = '#5a78c8'; for (let x = -E.W * 2; x < E.W * 3; x += 120) g.fillRect(x, -E.H, 60, E.H * 3);
    box(g, 640, 380, 300, 360, '#9fd8ff', 12); seg(g, [[790, 380], [790, 740]], 8, INK); seg(g, [[640, 560], [940, 560]], 8, INK); glow(g, 790, 560, 300, '#fff6c0', 0.3);
    for (const [px, c] of [[120, '#ff4a6a'], [300, '#ffd23a']]) { box(g, px, 420, 140, 190, c, 6); circle(g, px + 70, 500, 40, alpha('#fff', 0.5)); }
    // calendário
    box(g, 120, 700, 170, 200, '#ffffff', 10); g.fillStyle = '#d8342b'; g.fillRect(124, 704, 162, 50); text(g, 'DIA', 205, 730, { size: 30, color: '#fff', font: FONTS.ui, weight: 900 }); text(g, String(dia), 205, 830, { size: 88, color: INK }); });
  layer(g, cam, 0.85, g => { g.fillStyle = '#c8945a'; g.fillRect(-E.W * 2, GY - 40, E.W * 5, E.H); g.strokeStyle = alpha(INK, 0.25); g.lineWidth = 3; for (let x = -E.W * 2; x < E.W * 3; x += 160) seg(g, [[x, GY - 40], [x + 300, E.H + 200]], 3, alpha(INK, 0.2));
    box(g, 80, GY - 260, 560, 220, '#3a8a7a', 40); box(g, 60, GY - 130, 600, 110, '#2f7a6a', 30); // sofá
    box(g, 700, GY - 470, 300, 210, '#16161c', 10); rr(g, 716, GY - 456, 268, 180, 6); g.fillStyle = mix('#2a5ad8', '#7dff4a', (Math.sin(t * 3) + 1) / 2); g.fill(); glow(g, 850, GY - 366, 260, '#7fd8ff', 0.3); box(g, 740, GY - 260, 220, 120, '#6a4a2a', 6);
    if (vazio < 1) { box(g, 1020, GY - 300, 180, 140, '#d8d8e0', 10); rr(g, 1036, GY - 284, 110, 100, 6); g.fillStyle = '#2a2a34'; g.fill(); }
    for (let i = 0; i < 5; i++) box(g, 300 + i * 70, GY + 60 + (i % 2) * 20, 50, 34, ['#ffd23a', '#ff4a6a', '#7dff4a', '#2a9dff', '#ff8a3a'][i], 6, 4); });
}
// ---------- padaria por dentro ----------
export function padaria(g, t, cam, o = {}) {
  layer(g, cam, 0.45, g => { g.fillStyle = '#ffe2b0'; g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3); g.fillStyle = '#e8a060'; for (let x = -E.W * 2; x < E.W * 3; x += 90) for (let y = -400; y < GY; y += 90) if (((x + y) / 90) % 2 === 0) g.fillRect(x, y, 90, 90);
    box(g, -200, 280, 1500, 90, '#c0462a', 10); text(g, o.placa || 'PADARIA DO SEU MANOEL', 550, 325, { size: 52, color: '#fff2c0', font: FONTS.title });
    for (let r = 0; r < 3; r++) { box(g, -100, 470 + r * 190, 1300, 26, '#8a5a30', 4); for (let i = 0; i < 16; i++) { const x = -60 + i * 80, y = 450 + r * 190; g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, 36, 22, 0, 0, 7); g.fill(); g.fillStyle = ['#e8a050', '#d88a3a', '#f2c070'][(i + r) % 3]; g.beginPath(); g.ellipse(x, y, 31, 17, 0, 0, 7); g.fill(); seg(g, [[x - 14, y - 6], [x - 4, y + 6]], 3, alpha('#8a4a1a', 0.6)); seg(g, [[x + 4, y - 6], [x + 14, y + 6]], 3, alpha('#8a4a1a', 0.6)); } } });
  layer(g, cam, 0.85, g => { g.fillStyle = '#d8c8b0'; g.fillRect(-E.W * 2, GY - 40, E.W * 5, E.H); g.strokeStyle = alpha(INK, 0.2); for (let x = -E.W * 2; x < E.W * 3; x += 120) seg(g, [[x, GY - 40], [x, E.H * 2]], 3, alpha(INK, 0.15));
    box(g, 360, GY - 300, 900, 280, '#f2ead8', 14); g.fillStyle = alpha('#9fd8ff', 0.45); g.fillRect(380, GY - 290, 860, 140); for (let i = 0; i < 6; i++) { g.fillStyle = INK; g.beginPath(); g.ellipse(440 + i * 130, GY - 210, 46, 26, 0, 0, 7); g.fill(); g.fillStyle = '#ffb46a'; g.beginPath(); g.ellipse(440 + i * 130, GY - 210, 40, 20, 0, 0, 7); g.fill(); }
    box(g, 1060, GY - 420, 160, 120, '#2a2a34', 12); rr(g, 1074, GY - 406, 132, 60, 6); g.fillStyle = '#7dff4a'; g.fill(); text(g, o.caixa || 'CAIXA', 1140, GY - 376, { size: 26, color: INK, font: FONTS.ui, weight: 900 }); });
}
export function caderno(g, x, y, s, t, o = {}) { const { valor = 'R$ 47,50', fogo = 0 } = o; g.save(); g.translate(x, y); g.rotate(-0.08); g.scale(s, s); box(g, -170, -120, 340, 240, '#f6efd8', 10); g.fillStyle = '#d8342b'; g.fillRect(-170, -120, 30, 240);
  text(g, 'FIADO', 10, -80, { size: 40, color: '#2a4ab8', font: FONTS.title }); for (let i = 0; i < 4; i++) seg(g, [[-120, -30 + i * 40], [150, -30 + i * 40]], 2, alpha('#2a4ab8', 0.4)); text(g, 'Guilherme', -10, -10, { size: 30, color: '#3a3a44', font: FONTS.ui, weight: 900 }); text(g, valor, 20, 40, { size: 44, color: '#d8342b', font: FONTS.title });
  if (fogo > 0) { for (let i = 0; i < 18; i++) { const ph = (t * 1.6 + i / 18) % 1; circle(g, -150 + (i * 37) % 300, 110 - ph * 260 * fogo, (30 - ph * 22) * fogo, alpha(ph < 0.3 ? '#fff2a0' : '#ff6a1a', 0.85 * (1 - ph))); } glow(g, 0, 0, 300, '#ff6a1a', 0.5 * fogo); }
  g.restore(); }
export function moeda(g, x, y, r, t, o = {}) { const gira = Math.cos(t * (o.giro ?? 3)); g.save(); g.translate(x, y); g.scale(Math.max(0.08, Math.abs(gira)), 1); glow(g, 0, 0, r * 2.4, '#ffd76a', o.brilho ?? 0.5); circle(g, 0, 0, r + 8, INK); circle(g, 0, 0, r, '#d8b04a'); circle(g, 0, 0, r * 0.72, '#e8e2d0'); circle(g, 0, 0, r * 0.62, '#d8b04a');
  if (gira > 0) text(g, '1', 0, 4, { size: r * 0.9, color: '#7a5a10', font: FONTS.title }); else text(g, 'REAL', 0, 4, { size: r * 0.38, color: '#7a5a10', font: FONTS.ui, weight: 900 }); g.restore(); }
export function porquinho(g, x, y, s, t, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); const c = '#ff8ab0'; g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 150, 115, 0, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, 142, 107, 0, 0, 7); g.fill();
  box(g, 120, -30, 60, 60, c, 20); circle(g, 140, -10, 7, INK); circle(g, 160, -10, 7, INK); for (const dx of [-90, -30, 40, 90]) box(g, dx - 18, 80, 36, 50, c, 10); poly(g, [[-40, -100], [-10, -150], [10, -95]], c); g.fillStyle = INK; g.fillRect(-30, -108, 60, 10); circle(g, 70, -40, 9, INK);
  if (o.corrente) { g.strokeStyle = '#9aa0aa'; g.lineWidth = 10; for (let i = -6; i < 7; i++) { g.beginPath(); g.ellipse(i * 22, 10 + Math.sin(i) * 4, 12, 8, 0.4, 0, 7); g.stroke(); } }
  if (o.racha) { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-20, -100); g.lineTo(10, -40); g.lineTo(-10, 0); g.lineTo(20, 60); g.stroke(); }
  g.restore(); }
export function nota(g, x, y, s, rot, cor, nome, ano) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); box(g, -170, -80, 340, 160, cor, 12); g.strokeStyle = alpha('#fff', 0.5); g.lineWidth = 4; g.strokeRect(-150, -62, 300, 124); circle(g, -90, 0, 44, alpha('#fff', 0.35));
  text(g, nome, 40, -18, { size: 30, color: '#fff', font: FONTS.ui, weight: 900, stroke: 6, strokeColor: INK }); text(g, ano, 40, 30, { size: 40, color: '#ffd23a', font: FONTS.title, stroke: 8, strokeColor: INK }); g.restore(); }
// ---------- fachada da padaria (rua de dia) ----------
export function fachada(g, t, cam, o = {}) { const { placa = 'PADARIA DO SEU MANOEL', manha = 0, sobe = 1 } = o;
  layer(g, cam, 0.15, g => { g.fillStyle = linGrad(g, 0, -600, 0, GY, manha ? ['#ff9a6a', '#ffd08a', '#fff2c8'] : ['#3a8ae0', '#8ac8ff', '#e0f4ff']); g.fillRect(-E.W * 3, -E.H * 2, E.W * 7, E.H * 4); glow(g, 860, 300, 300, '#fff2a0', 0.5); circle(g, 860, 300, 70, '#fff6d0'); });
  layer(g, cam, 0.4, g => { const r = rng(3), cs = ['#ffb0c8', '#a0d8ff', '#c8f0a0', '#fff0a0', '#e8c8ff']; for (let i = -6; i < 12; i++) { const h = 300 + r() * 260; box(g, i * 230, GY - 120 - h, 220, h + 120, cs[(i + 12) % 5], 0, 5); for (const wx of [30, 130]) box(g, i * 230 + wx, GY - 80 - h + 40, 60, 70, '#2a3a5a', 4, 4); box(g, i * 230 + 160, GY - 150 - h, 60, 40, '#2f7fd0', 6, 4); } veil2(g, '#e0f0ff', 0.2); });
  layer(g, cam, 0.85, g => { g.fillStyle = '#9a9aa4'; g.fillRect(-E.W * 3, GY, E.W * 7, E.H); g.fillStyle = '#c8c8d0'; g.fillRect(-E.W * 3, GY, E.W * 7, 40);
    box(g, 160, GY - 620, 760, 620, '#ffe0a8', 0, 7); box(g, 260, GY - 330, 220, 330, '#8a5a30', 6, 6); box(g, 540, GY - 330, 300, 220, '#bfe8ff', 6, 6); for (let i = 0; i < 4; i++) { g.fillStyle = INK; g.beginPath(); g.ellipse(580 + i * 70, GY - 150, 30, 18, 0, 0, 7); g.fill(); g.fillStyle = '#ffb46a'; g.beginPath(); g.ellipse(580 + i * 70, GY - 150, 25, 13, 0, 0, 7); g.fill(); }
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#c0283a' : '#fff2e0'; poly(g, [[160 + i * 95, GY - 420], [255 + i * 95, GY - 420], [245 + i * 95, GY - 360], [170 + i * 95, GY - 360]], g.fillStyle); }
    const ys = GY - 560 + (1 - ease.outBack(clamp(sobe))) * 200; g.save(); g.globalAlpha *= clamp(sobe * 2); box(g, 190, ys - 60, 700, 120, '#c0462a', 16); text(g, placa, 540, ys + 2, { size: placa.length > 20 ? 46 : 56, color: '#fff2c0', font: FONTS.title }); g.restore(); });
}
const veil2 = (g, c, a) => { g.save(); g.fillStyle = alpha(c, a); g.fillRect(-E.W * 3, -E.H * 2, E.W * 7, E.H * 4); g.restore(); };
// ---------- mercado (etiquetas) ----------
export function mercado(g, t, cam, o = {}) { const { corte = 0 } = o;
  layer(g, cam, 0.4, g => { g.fillStyle = '#fff4e0'; g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3); box(g, -E.W, 220, E.W * 4, 90, '#2a9d5a', 0, 0); text(g, 'SUPERMERCADO', 540, 265, { size: 54, color: '#fff', font: FONTS.title }); });
  layer(g, cam, 0.85, g => { const itens = [['PÃO', 1000, 0.10], ['LEITE', 50000, 5], ['ARROZ', 300000, 30], ['CAFÉ', 180000, 18]]; g.fillStyle = '#d8d0c0'; g.fillRect(-E.W * 2, GY, E.W * 5, E.H);
    itens.forEach(([nome, a, b], i) => { const x = 60 + (i % 2) * 500, y = 520 + Math.floor(i / 2) * 460; box(g, x, y, 440, 360, '#e8e2d6', 10); for (let k = 0; k < 6; k++) box(g, x + 30 + k * 66, y + 40 + (k % 2) * 10, 54, 130, ['#ff4a6a', '#2a9dff', '#ffd23a', '#38d46a', '#ff8a2a', '#a64bff'][(k + i) % 6], 6, 4);
      const k2 = clamp((corte - i * 0.12) / 0.5), vstr = k2 < 0.5 ? 'R$ ' + a.toLocaleString('pt-BR') : 'R$ ' + b.toLocaleString('pt-BR', { minimumFractionDigits: 2 }); const sc = 1 + Math.sin(k2 * Math.PI) * 0.25;
      g.save(); g.translate(x + 220, y + 270); g.scale(sc, sc); box(g, -190, -60, 380, 120, k2 > 0.5 ? '#ffd23a' : '#ffffff', 14); text(g, nome, 0, -28, { size: 30, color: INK, font: FONTS.ui, weight: 900 }); text(g, vstr, 0, 22, { size: 46, color: k2 > 0.5 ? '#c0283a' : INK, font: FONTS.title }); g.restore(); if (k2 > 0.4 && k2 < 0.7) glow(g, x + 220, y + 270, 220, '#fff2a0', 0.6); }); });
}
