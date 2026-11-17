// Série "Sem Marca" — HUD de jogo / janela de STATUS estilo isekai (Solo Leveling, Shield Hero, Tensura).
// Tudo em 2D (canvas), unidades lógicas 1080x1920, dentro da safe zone (x 60–940, y 220–1440).
// Uso: overlay(g, lt, info) de um plano 3D ou draw(g, t, info) de um plano 2D, sempre com T = tempo GLOBAL.
//   painelStatus(g, T, o)   janela de status completa (holograma, linhas de atributo, "+" subindo, MAGIA travada)
//   tagNivel(g, x, y, o)    plaquinha "VOCÊ  Nv. 0" com barra de XP (em cima do personagem)
//   popupMissao(g, T, o)    "NOVA MISSÃO" + "???" com glitch e flash
//   glitch(g, I, seed)      glitch de tela inteira (fatias + RGB split) para transições
import { E, rr, text, glow, alpha, ease, prog, clamp, lerp, rng, FONTS, measure } from '/engine/core.js';

export const HUDCOR = { ciano: '#4ae0ff', azul: '#2a8cff', claro: '#e6fbff', vidro: 'rgba(6,18,44,0.80)', verde: '#5dff8a', vermelho: '#ff3048', ouro: '#ffd23a', ambar: '#ffb444', dim: '#8fc8e8' };
const C = HUDCOR;
const h1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const fr = (T) => Math.floor(T * (E.fps || 24));     // índice de quadro (determinístico)

// ---------- canvases auxiliares (mesmo tamanho do canvas de saída) ----------
const POOL = {};
function tela(nome, w, h) { let c = POOL[nome]; if (!c) { c = POOL[nome] = document.createElement('canvas'); } if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, w, h); return [c, x]; }
// isola um canal de cor (multiply + recorta pelo alfa original)
function canal(src, cor, nome) { const [c, x] = tela(nome, src.width, src.height); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = cor; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'destination-in'; x.drawImage(src, 0, 0); return c; }
// compõe src em dst (pixels de saída) em faixas horizontais, algumas deslocadas, com separação RGB
function compoeGlitch(dst, src, I, seed, a = 1) {
  const W = src.width, H = src.height; dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha = a;
  if (I <= 0.01) { dst.drawImage(src, 0, 0); dst.restore(); return; }
  const r = rng(seed * 7919 + 17), d = Math.round(W * 0.012 * I + 1), bands = [];
  for (let y = 0; y < H;) { const h = Math.max(2, Math.round(H * (0.006 + r() * 0.06))); const dx = r() < 0.18 + 0.5 * I ? Math.round((r() - 0.5) * 2 * W * 0.09 * I) : 0; bands.push([y, Math.min(h, H - y), dx]); y += h; }
  const split = I > 0.12, R = split ? canal(src, '#ff0000', '_r') : null, Cy = split ? canal(src, '#00ffff', '_c') : null;
  for (const [y, h, dx] of bands) {
    if (split) { dst.globalCompositeOperation = 'source-over'; dst.drawImage(Cy, 0, y, W, h, dx - d, y, W, h); dst.globalCompositeOperation = 'lighter'; dst.drawImage(R, 0, y, W, h, dx + d, y, W, h); }
    else dst.drawImage(src, 0, y, W, h, dx, y, W, h);
  }
  dst.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 2 + I * 8; i++) { if (r() > 0.5 + I * 0.4) continue; const y = r() * H, h = 2 + r() * H * 0.012; dst.globalAlpha = a * (0.15 + 0.35 * I); dst.fillStyle = r() < 0.5 ? '#40e8ff' : '#ff3aa0'; dst.fillRect(r() * W * 0.3, y, W * (0.3 + r() * 0.7), h); }
  dst.restore();
}
// desenha fn num canvas fora da tela (com a mesma transformação de g) e compõe em g com glitch I
function holo(g, I, seed, a, fn) {
  const cv = g.canvas, [c, x] = tela('_holo', cv.width, cv.height); x.setTransform(g.getTransform()); fn(x); compoeGlitch(g, c, I, seed, a);
}

// glitch de tela inteira: fatias deslocadas + separação RGB + riscos coloridos. I 0..1, seed muda por quadro.
export function glitch(g, I = 0.5, seed = 1) {
  if (I <= 0) return; const cv = g.canvas, [c, x] = tela('_snap', cv.width, cv.height); x.drawImage(cv, 0, 0); compoeGlitch(g, c, clamp(I), seed, 1);
}

// ---------- peças de desenho ----------
function cantoneiras(g, x, y, w, h, L, cor, lw = 6) { g.save(); g.strokeStyle = cor; g.lineWidth = lw; g.lineCap = 'square'; g.shadowColor = cor; g.shadowBlur = 18;
  for (const [px, py, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) { g.beginPath(); g.moveTo(px, py + sy * L); g.lineTo(px, py); g.lineTo(px + sx * L, py); g.stroke(); }
  g.restore(); }
function hexPath(g, x, y, r) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function gradeHex(g, x, y, w, h, r, cor, T) { g.save(); g.strokeStyle = cor; g.lineWidth = 1.5; const dx = r * Math.sqrt(3), dy = r * 1.5;
  for (let j = -1, row = 0; j * dy < h + r; j++, row++) for (let i = -1; i * dx < w + r; i++) { const cx = x + i * dx + (row % 2 ? dx / 2 : 0), cy = y + j * dy; const k = h1(i * 31 + j * 17); g.globalAlpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(T * 1.5 + k * 9)) * k; hexPath(g, cx, cy, r * 0.92); g.stroke(); }
  g.restore(); }
function linhasScan(g, x, y, w, h, T) { g.save(); g.fillStyle = 'rgba(160,230,255,0.05)'; for (let yy = y; yy < y + h; yy += 6) g.fillRect(x, yy, w, 2);
  const by = y + ((T * 0.35) % 1) * (h + 240) - 120; const gr = g.createLinearGradient(0, by - 90, 0, by + 90); gr.addColorStop(0, 'rgba(80,220,255,0)'); gr.addColorStop(0.5, 'rgba(80,220,255,0.10)'); gr.addColorStop(1, 'rgba(80,220,255,0)'); g.fillStyle = gr; g.fillRect(x, by - 90, w, 180); g.restore(); }
// ícones (desenhados em caixa ~[-1,1] * r)
function icone(g, id, x, y, r, cor) { g.save(); g.translate(x, y); g.scale(r, r); g.strokeStyle = cor; g.fillStyle = cor; g.lineWidth = 0.13; g.lineJoin = 'round'; g.lineCap = 'round'; g.shadowColor = cor; g.shadowBlur = 12;
  if (id === 'FOR') { g.rotate(-Math.PI / 4); g.beginPath(); g.moveTo(0, -0.95); g.lineTo(0.17, -0.7); g.lineTo(0.17, 0.32); g.lineTo(-0.17, 0.32); g.lineTo(-0.17, -0.7); g.closePath(); g.fill(); g.fillRect(-0.48, 0.32, 0.96, 0.16); g.fillRect(-0.09, 0.48, 0.18, 0.38); g.beginPath(); g.arc(0, 0.95, 0.13, 0, 7); g.fill(); }
  else if (id === 'VEL') { g.beginPath(); g.moveTo(0.22, -0.95); g.lineTo(-0.5, 0.12); g.lineTo(-0.02, 0.12); g.lineTo(-0.26, 0.95); g.lineTo(0.52, -0.2); g.lineTo(0.04, -0.2); g.closePath(); g.fill(); }
  else if (id === 'INT') { g.beginPath(); g.arc(0, -0.22, 0.55, Math.PI * 0.78, Math.PI * 2.22); g.lineTo(0.22, 0.48); g.lineTo(-0.22, 0.48); g.closePath(); g.stroke(); g.fillRect(-0.26, 0.6, 0.52, 0.12); g.fillRect(-0.18, 0.8, 0.36, 0.12); g.beginPath(); g.moveTo(-0.15, 0.3); g.lineTo(-0.15, -0.1); g.lineTo(0, 0.05); g.lineTo(0.15, -0.1); g.lineTo(0.15, 0.3); g.stroke(); }
  else if (id === 'MAG') { g.beginPath(); for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr2 = i % 2 ? 0.26 : 0.95; g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } g.closePath(); g.fill(); g.beginPath(); g.arc(0.62, -0.62, 0.12, 0, 7); g.arc(-0.66, 0.6, 0.09, 0, 7); g.fill(); }
  else { g.beginPath(); g.moveTo(0, -0.8); g.lineTo(0.8, 0); g.lineTo(0, 0.8); g.lineTo(-0.8, 0); g.closePath(); g.fill(); }
  g.restore(); }
// cadeado dourado de desenho (contorno escuro grosso, corpo dourado com brilho, buraco da chave escuro)
export function cadeado(g, x, y, r, cor = '#ffc21a') { g.save(); g.translate(x, y); const ink = '#2a1600';
  g.lineCap = 'round'; g.strokeStyle = ink; g.lineWidth = r * 0.46; g.beginPath(); g.arc(0, -r * 0.3, r * 0.52, Math.PI, 0); g.lineTo(r * 0.52, r * 0.1); g.moveTo(-r * 0.52, r * 0.1); g.lineTo(-r * 0.52, -r * 0.3); g.stroke();
  g.strokeStyle = '#d8dde6'; g.lineWidth = r * 0.26; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = r * 0.07; g.beginPath(); g.arc(0, -r * 0.3, r * 0.56, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  g.shadowColor = 'rgba(255,190,40,.9)'; g.shadowBlur = r * 0.8; rr(g, -r * 0.92, -r * 0.08, r * 1.84, r * 1.38, r * 0.28); g.fillStyle = ink; g.fill(); g.shadowBlur = 0;
  rr(g, -r * 0.8, r * 0.02, r * 1.6, r * 1.18, r * 0.2); const gr = g.createLinearGradient(0, -r * 0.1, 0, r * 1.3); gr.addColorStop(0, '#ffe68a'); gr.addColorStop(0.45, cor); gr.addColorStop(1, '#d88a00'); g.fillStyle = gr; g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; rr(g, -r * 0.66, r * 0.1, r * 0.5, r * 0.16, r * 0.08); g.fill();
  g.fillStyle = ink; g.beginPath(); g.arc(0, r * 0.5, r * 0.19, 0, 7); g.fill(); g.beginPath(); g.moveTo(-r * 0.1, r * 0.55); g.lineTo(r * 0.1, r * 0.55); g.lineTo(r * 0.14, r * 0.95); g.lineTo(-r * 0.14, r * 0.95); g.closePath(); g.fill();
  if (cor) {} g.restore(); }
// barra grossa estilo jogo: trilho escuro arredondado, preenchimento dourado brilhante, texto escuro em negrito dentro
export function barraOuro(g, x, y, w, h, frac, rot = '', o = {}) { frac = clamp(frac); g.save(); rr(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(12,14,20,0.92)'; g.fill(); g.strokeStyle = o.borda || 'rgba(230,238,245,0.85)'; g.lineWidth = 3; g.stroke();
  const fw = (w - 8) * frac; if (fw > 2) { g.save(); g.shadowColor = 'rgba(255,200,40,.9)'; g.shadowBlur = 18; rr(g, x + 4, y + 4, Math.max(h - 8, fw), h - 8, (h - 8) / 2); const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#fff2a0'); gr.addColorStop(0.5, '#ffc61a'); gr.addColorStop(1, '#e89a00'); g.fillStyle = gr; g.fill(); g.restore(); }
  if (rot) text(g, rot, x + w / 2, y + h / 2 + 2, { size: o.size ?? h * 0.62, color: fw > w * 0.55 ? '#1a1200' : '#ffffff', font: FONTS.title, weight: 700, spacing: 1 });
  g.restore(); }
function seta(g, x, y, s, cor, a = 1) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.shadowColor = cor; g.shadowBlur = 16; g.fillStyle = cor; g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.9, 0); g.lineTo(s * 0.34, 0); g.lineTo(s * 0.34, s * 0.8); g.lineTo(-s * 0.34, s * 0.8); g.lineTo(-s * 0.34, 0); g.lineTo(-s * 0.9, 0); g.closePath(); g.fill(); g.restore(); }
const digita = (str, k) => { const n = Math.ceil(str.length * clamp(k)); return str.slice(0, n); };
const cursor = (T) => (Math.floor(T * 4) % 2 ? '▌' : '');
// número que "embaralha" e depois conta até v
function contagem(v, T, t, dur = 0.55) { const k = prog(T, t, t + dur); if (k >= 1) return String(v); if (k < 0.35) return String(Math.floor(h1(fr(T) * 3.1 + v) * 90 + 10) % 100); return String(Math.round(v * ease.out((k - 0.35) / 0.65))); }

// ======================================================================
// JANELA DE STATUS
// o = { t0, nome, titulo, nivel, xp (0..1), stats:[{id,nome,v,t,travado,tTrava}], marca, tMarca, tSobe, tTrava, cx, cy, escala, sai, cor }
// ======================================================================
export const PAINEL = { W: 820, H: 1000 };
export function painelStatus(g, T, o = {}) {
  const t0 = o.t0 ?? 0, k = T - t0, sai = o.sai ?? null; if (k < 0) return; if (sai != null && T > sai + 0.5) return;
  const cx = o.cx ?? 500, cy = o.cy ?? 780, esc = o.escala ?? 1, PW = PAINEL.W, PH = PAINEL.H, L = -PW / 2, TOP = -PH / 2, cor = o.cor || C.ciano;
  const stats = o.stats || [{ id: 'FOR', nome: 'FORÇA', v: 10 }, { id: 'VEL', nome: 'VELOCIDADE', v: 8 }, { id: 'INT', nome: 'INTELIGÊNCIA', v: 12 }, { id: 'MAG', nome: 'MAGIA', v: 0, travado: true }];
  stats.forEach((s, i) => { if (s.t == null) s.t = t0 + 0.75 + i * 0.35; });
  const tMarca = o.tMarca ?? (stats[stats.length - 1].t + 0.45), tSobe = o.tSobe ?? null;
  const linha = ease.out(prog(k, 0, 0.2)), abre = ease.out(prog(k, 0.14, 0.5)), fecha = sai != null ? ease.in(prog(T, sai, sai + 0.4)) : 0;
  const hAb = Math.max(6, PH * abre * (1 - fecha)), wAb = PW * linha * (1 - fecha * 0.25);
  // tremulação holográfica na entrada e na saída
  let a = 1; if (k < 0.65) a = h1(fr(T) * 1.7) > 0.32 * (1 - k / 0.65) + 0.05 ? 1 : 0.35; if (fecha > 0) a *= (1 - fecha) * (h1(fr(T) * 2.3) > 0.3 ? 1 : 0.5) + 0.0;
  // intensidade de glitch: entrada, travamento da magia, saída, e pequenos estalos periódicos
  const tTr = o.tTrava ?? stats.find(s => s.travado)?.tTrava ?? null;
  let I = k < 0.7 ? 0.85 * (1 - k / 0.7) : 0; if (tTr != null && T > tTr && T < tTr + 0.45) I = Math.max(I, 0.55 * (1 - (T - tTr) / 0.45)); if (fecha > 0) I = Math.max(I, 0.4 + fecha * 0.6);
  if (I === 0 && h1(Math.floor(T * 6) + 3.3) > 0.93) I = 0.12;
  holo(g, I, fr(T), a, (x) => {
    x.translate(cx, cy); x.scale(esc, esc);
    // halo externo
    glow(x, 0, 0, PW * 0.75, C.azul, 0.10 * abre);
    if (abre <= 0.02) { // fase 1: só a linha de luz se abrindo
      x.save(); x.shadowColor = cor; x.shadowBlur = 30; x.fillStyle = C.claro; x.fillRect(-wAb / 2, -3, wAb, 6); x.restore(); return; }
    const bx = -wAb / 2, by = -hAb / 2;
    // vidro
    x.save(); rr(x, bx, by, wAb, hAb, 18); const gr = x.createLinearGradient(0, by, 0, by + hAb); gr.addColorStop(0, 'rgba(10,34,78,0.86)'); gr.addColorStop(0.5, 'rgba(5,16,40,0.80)'); gr.addColorStop(1, 'rgba(8,26,64,0.86)'); x.fillStyle = gr; x.fill(); x.clip();
    gradeHex(x, bx, by, wAb, hAb, 34, alpha(cor, 0.07), T); linhasScan(x, bx, by, wAb, hAb, T);
    // conteúdo (posição final, revelado pelo recorte da janela abrindo)
    conteudo(x, T, o, stats, { L, TOP, PW, PH, cor, t0, tMarca, tSobe, tTr });
    x.restore();
    // moldura
    x.save(); rr(x, bx, by, wAb, hAb, 18); x.strokeStyle = alpha(cor, 0.9); x.lineWidth = 3.5; x.shadowColor = cor; x.shadowBlur = 22; x.stroke(); x.shadowBlur = 0; rr(x, bx + 10, by + 10, wAb - 20, hAb - 20, 12); x.strokeStyle = alpha(cor, 0.25); x.lineWidth = 1.5; x.stroke(); x.restore();
    cantoneiras(x, bx - 12, by - 12, wAb + 24, hAb + 24, 64, C.claro, 7);
    // marquinhas nas laterais
    x.save(); x.fillStyle = alpha(cor, 0.8); for (let i = 0; i < 5; i++) { const yy = by + hAb * (0.3 + i * 0.1); if (yy > by + 30 && yy < by + hAb - 30) { x.fillRect(bx - 6, yy, 6, 18); x.fillRect(bx + wAb, yy, 6, 18); } } x.restore();
    // brilho na borda enquanto abre
    if (abre < 1 || fecha > 0) { x.save(); x.shadowColor = cor; x.shadowBlur = 30; x.fillStyle = C.claro; x.fillRect(bx, by - 2, wAb, 4); x.fillRect(bx, by + hAb - 2, wAb, 4); x.restore(); }
  });
}
function conteudo(x, T, o, stats, P) {
  const { L, TOP, PW, cor, t0, tMarca, tSobe, tTr } = P, R = -L, k = T - t0;
  // --- cabeçalho ---
  const kh = prog(k, 0.3, 0.6); const hy = TOP + 72;
  x.save(); x.translate(L + 72, hy); x.rotate(Math.PI / 4); x.strokeStyle = cor; x.lineWidth = 4; x.shadowColor = cor; x.shadowBlur = 14; x.strokeRect(-24, -24, 48, 48); x.restore();
  text(x, '!', L + 72, hy + 2, { size: 46, color: C.claro, font: FONTS.title, weight: 700, alpha: kh });
  text(x, digita('STATUS', kh) + (kh < 1 ? cursor(T) : ''), 0, hy + 2, { size: 76, color: C.claro, font: FONTS.title, weight: 700, spacing: 10, glow: 26, glowColor: cor });
  x.save(); x.translate(R - 72, hy); x.rotate(Math.PI / 4); x.strokeStyle = cor; x.lineWidth = 4; x.globalAlpha = kh; x.shadowColor = cor; x.shadowBlur = 14; x.strokeRect(-14, -14, 28, 28); x.restore();
  const lg = x.createLinearGradient(L, 0, R, 0); lg.addColorStop(0, alpha(cor, 0)); lg.addColorStop(0.5, alpha(cor, 0.95)); lg.addColorStop(1, alpha(cor, 0)); x.fillStyle = lg; x.fillRect(L + 30, TOP + 128, (PW - 60) * ease.out(kh), 3);
  // --- nome / título ---
  const ki = prog(k, 0.45, 0.8), iy = TOP + 168;
  text(x, 'NOME', L + 44, iy, { size: 28, color: C.dim, font: FONTS.ui, weight: 900, align: 'left', spacing: 4, alpha: ki });
  text(x, digita(o.nome ?? 'VOCÊ', prog(k, 0.5, 0.75)), L + 44, iy + 46, { size: 52, color: '#ffffff', font: FONTS.ui, weight: 900, align: 'left' });
  text(x, 'TÍTULO', 20, iy, { size: 28, color: C.dim, font: FONTS.ui, weight: 900, align: 'left', spacing: 4, alpha: ki });
  text(x, digita(o.titulo ?? 'Reencarnado', prog(k, 0.55, 0.9)), 20, iy + 46, { size: 46, color: '#ffffff', font: FONTS.ui, weight: 900, align: 'left' });
  // --- nível + XP ---
  const kn = prog(k, 0.6, 0.95), ny = TOP + 318;
  x.save(); x.globalAlpha *= kn; rr(x, L + 30, ny - 62, PW - 60, 124, 16); x.fillStyle = alpha(cor, 0.10); x.fill(); x.strokeStyle = alpha(cor, 0.4); x.lineWidth = 2; x.stroke(); x.restore();
  text(x, 'NÍVEL', L + 56, ny, { size: 44, color: C.claro, font: FONTS.ui, weight: 900, align: 'left', spacing: 3, alpha: kn });
  text(x, kn > 0 ? contagem(o.nivel ?? 0, T, t0 + 0.6, 0.45) : '', L + 250, ny + 6, { size: 112, color: C.ouro, font: FONTS.title, weight: 700, glow: 24, glowColor: 'rgba(255,200,60,.8)' });
  const xp = clamp(o.xp ?? 0), bx = L + 340, bw = R - 60 - bx;
  x.save(); x.globalAlpha *= kn; barraOuro(x, bx, ny - 26, bw, 56, xp * ease.out(prog(k, 0.8, 1.3)), `XP ${Math.round(xp * 100)}%`, { size: 34 }); x.restore();
  // --- separador "ATRIBUTOS" ---
  const ks = prog(k, 0.7, 1.0), sy = TOP + 422;
  x.save(); x.globalAlpha *= ks; x.fillStyle = alpha(cor, 0.6); x.fillRect(L + 40, sy, 200, 2); x.fillRect(R - 240, sy, 200, 2); x.restore();
  text(x, 'ATRIBUTOS', 0, sy + 1, { size: 30, color: C.dim, font: FONTS.ui, weight: 900, spacing: 8, alpha: ks });
  // --- linhas de atributo ---
  const RH = 112, y0 = TOP + 444;
  stats.forEach((s, i) => linhaStat(x, T, s, L + 26, y0 + i * RH, PW - 52, RH - 14, cor, tSobe, i, tTr));
  // --- cadeado dourado grande: surge no meio do painel e voa para a linha travada ---
  const iT = stats.findIndex(s => s.travado); if (tTr != null && iT >= 0 && T > tTr && T < tTr + 0.9) { const q = T - tTr, rowY = y0 + iT * RH + (RH - 14) / 2 - 6, rowX = L + 26 + PW - 52 - 44;
    const k1 = ease.outBack(prog(q, 0, 0.3)), k2 = ease.inOut(prog(q, 0.55, 0.85)), px = lerp(0, rowX, k2), py = lerp(TOP + 470, rowY, k2), r = lerp(150 * k1, 36 * 1.35, k2);
    x.save(); x.globalAlpha *= 1 - 0.6 * (1 - k1); glow(x, px, py, r * 2.6, '#ffb020', 0.5 * (1 - k2)); x.save(); x.fillStyle = `rgba(0,0,0,${0.35 * (1 - k2) * k1})`; x.fillRect(L, TOP, PW, PAINEL.H); x.restore();
    for (let q2 = 0; q2 < 12 && k2 < 0.5; q2++) { const a2 = q2 / 12 * 6.283 + q; x.strokeStyle = alpha('#ffd84a', 0.7 * (1 - prog(q, 0.1, 0.55))); x.lineWidth = 6; x.beginPath(); x.moveTo(px + Math.cos(a2) * r * 1.3, py + Math.sin(a2) * r * 1.3); x.lineTo(px + Math.cos(a2) * r * (1.6 + q), py + Math.sin(a2) * r * (1.6 + q)); x.stroke(); }
    x.translate(px, py); x.rotate((1 - k1) * -0.6 + Math.sin(q * 30) * 0.05 * (1 - k2)); cadeado(x, 0, -r * 0.4, r); x.restore(); }
  // --- MARCA ---
  const km = prog(T, tMarca, tMarca + 0.35), my = y0 + stats.length * RH + 34;
  if (km > 0) { x.save(); x.globalAlpha *= km; x.fillStyle = alpha(cor, 0.5); x.fillRect(L + 40, my - 44, PW - 80, 2); x.restore();
    text(x, 'MARCA', L + 56, my + 4, { size: 40, color: C.claro, font: FONTS.ui, weight: 900, align: 'left', spacing: 3, alpha: km });
    const mstr = !o.marca || o.marca === '—' ? 'NENHUMA' : o.marca; const kk = prog(T, tMarca + 0.1, tMarca + 0.5);
    text(x, digita(mstr, kk) + (kk < 1 ? cursor(T) : ''), L + 250, my + 4, { size: 56, color: C.ambar, font: FONTS.title, weight: 700, align: 'left', spacing: 4, glow: 18, glowColor: 'rgba(255,170,60,.7)' });
    if (kk >= 1) { const bl = 0.5 + 0.5 * Math.sin(T * 7); x.save(); x.globalAlpha *= 0.4 + 0.6 * bl; x.translate(R - 80, my + 2); x.fillStyle = C.ambar; x.beginPath(); x.moveTo(0, -30); x.lineTo(30, 24); x.lineTo(-30, 24); x.closePath(); x.fill(); x.restore(); text(x, '!', R - 80, my + 10, { size: 34, color: '#2a1600', font: FONTS.ui, weight: 900 }); }
  }
}
function linhaStat(x, T, s, lx, ty, w, h, cor, tSobe, i, tTrGlobal) {
  const k = T - s.t; if (k < 0) return; const pop = ease.outBack(prog(k, 0, 0.3)), ap = prog(k, 0, 0.18), cy = ty + h / 2;
  const tTr = s.tTrava ?? tTrGlobal, trav = s.travado && tTr != null && T > tTr, kt = trav ? prog(T, tTr, tTr + 0.25) : 0;
  const corL = trav ? C.vermelho : cor;
  x.save(); x.globalAlpha *= ap; x.translate((1 - pop) * 120, 0);
  // fundo da linha
  rr(x, lx, ty, w, h, 14); x.fillStyle = trav ? `rgba(120,0,20,${0.35 + 0.12 * Math.sin(T * 8)})` : alpha(cor, 0.08); x.fill(); x.strokeStyle = alpha(corL, trav ? 0.95 : 0.35); x.lineWidth = trav ? 3 : 2; if (trav) { x.shadowColor = C.vermelho; x.shadowBlur = 18; } x.stroke(); x.shadowBlur = 0;
  if (k < 0.35) { rr(x, lx, ty, w, h, 14); x.fillStyle = `rgba(200,250,255,${0.45 * (1 - k / 0.35)})`; x.fill(); }
  // ícone num hexágono
  const ix = lx + 58; hexPath(x, ix, cy, 40); x.fillStyle = trav ? 'rgba(80,0,14,0.8)' : 'rgba(10,40,80,0.8)'; x.fill(); x.strokeStyle = corL; x.lineWidth = 3; x.stroke(); icone(x, s.id, ix, cy, 25, trav ? '#ff8a96' : C.claro);
  // nome + barra
  const nx = lx + 118; text(x, digita(s.nome, prog(k, 0.05, 0.4)), nx, cy - 18, { size: 42, color: trav ? '#ffd0d6' : '#ffffff', font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  const bw = 400, by = cy + 20; rr(x, nx, by, bw, 14, 7); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fill();
  const max = s.max ?? 20, kv = ease.out(prog(k, 0.15, 0.7)), frac = clamp(s.v / max) * kv;
  if (trav) { x.save(); rr(x, nx, by, bw, 14, 7); x.clip(); x.fillStyle = alpha(C.vermelho, 0.55 * kt); x.fillRect(nx, by, bw, 14); x.fillStyle = `rgba(20,0,4,${0.8 * kt})`; for (let q = -20; q < bw + 20; q += 26) { x.beginPath(); x.moveTo(nx + q, by + 14); x.lineTo(nx + q + 12, by + 14); x.lineTo(nx + q + 26, by); x.lineTo(nx + q + 14, by); x.closePath(); x.fill(); } x.restore(); }
  else if (frac > 0) { rr(x, nx + 2, by + 2, Math.max(10, (bw - 4) * frac), 10, 5); const bg = x.createLinearGradient(nx, 0, nx + bw, 0); bg.addColorStop(0, C.azul); bg.addColorStop(1, cor); x.fillStyle = bg; x.fill(); }
  // valor
  const sobe = tSobe != null && !s.travado && T > tSobe, ks = sobe ? prog(T, tSobe + i * 0.12, tSobe + i * 0.12 + 0.25) : 0;
  const vx = lx + w - 100; text(x, contagem(s.v, T, s.t + 0.1), vx, cy + 4, { size: 88, color: trav ? C.vermelho : ks > 0 ? '#c8ffd8' : '#ffffff', font: FONTS.title, weight: 700, align: 'right', glow: trav ? 26 : 18, glowColor: trav ? 'rgba(255,40,70,.9)' : ks > 0 ? 'rgba(80,255,140,.9)' : alpha(cor, 0.8) });
  // seta "+" subindo
  if (ks > 0) { const ax = lx + w - 46, bob = -((T * 1.6 + i * 0.3) % 1); const pa = ease.outBack(ks); seta(x, ax, cy - 6 + bob * 14, 22 * pa, C.verde); text(x, '+', ax, cy + 34, { size: 34, color: C.verde, font: FONTS.ui, weight: 900, alpha: ks, glow: 12, glowColor: 'rgba(80,255,140,.9)' });
    for (let q = 0; q < 3; q++) { const ph = (T * 1.2 + q / 3 + i * 0.17) % 1; seta(x, lx + w - 160 + q * 26, cy + 30 - ph * 70, 7, C.verde, ks * (1 - ph) * 0.7); } }
  // cadeado + carimbo TRAVADO
  if (trav) { const tl = tTr + 0.85, kp = prog(T, tl, tl + 0.25); if (T > tl) { const sl = kp < 1 ? lerp(1.35, 1, ease.outBack(kp)) : 1 + 0.04 * Math.sin(T * 6); x.save(); x.translate(lx + w - 44, cy - 6); x.rotate(0.05 * Math.sin(T * 3)); cadeado(x, 0, 0, 36 * sl); x.restore(); }
    const ks2 = prog(T, tTr + 0.9, tTr + 1.15), sc = lerp(2.2, 1, ease.out(ks2)); if (ks2 > 0) { x.save(); x.translate(lx + 415, cy + 6); x.rotate(-0.09); x.scale(sc, sc); x.globalAlpha *= ks2;
      x.font = `700 56px "${FONTS.title}"`; const tw = x.measureText('TRAVADO').width + 50; rr(x, -tw / 2, -44, tw, 88, 10); x.fillStyle = 'rgba(40,0,8,0.82)'; x.fill(); x.strokeStyle = C.vermelho; x.lineWidth = 5; x.shadowColor = C.vermelho; x.shadowBlur = 20; x.stroke(); x.shadowBlur = 0; rr(x, -tw / 2 + 8, -36, tw - 16, 72, 6); x.lineWidth = 2; x.stroke();
      text(x, 'TRAVADO', 0, 3, { size: 56, color: '#ff5a6e', font: FONTS.title, weight: 700, spacing: 6, glow: 16, glowColor: 'rgba(255,40,70,.9)' }); x.restore(); } }
  x.restore();
}

// ======================================================================
// PLAQUINHA DE NOME "VOCÊ  Nv. 0" + barra de XP. (x, y) = centro da plaquinha; a ponta aponta para baixo (cabeça).
// o = { nome, nivel, xp, T, t0 (aparece com tremulação), a, escala, cor }
// ======================================================================
export function tagNivel(g, x, y, o = {}) {
  const nome = o.nome ?? 'VOCÊ', nv = `Nv. ${o.nivel ?? 0}`, xp = clamp(o.xp ?? 0), cor = o.cor || C.ciano, esc = o.escala ?? 1;
  let a = o.a ?? 1, s = 1; if (o.T != null && o.t0 != null) { const k = o.T - o.t0; if (k < 0) return; s = ease.outBack(prog(k, 0, 0.3)); if (k < 0.45) a *= h1(fr(o.T) * 1.3) > 0.3 ? 1 : 0.3; }
  if (a <= 0) return; const str = `${nome}  ${nv}`, sz = o.tamanho ?? 58, tw = measure(g, str, sz, FONTS.title, 700), W = tw + 64, H = 84;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(esc * s, esc * s);
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 16; g.shadowOffsetY = 6; rr(g, -W / 2, -H / 2, W, H, H / 2); g.fillStyle = 'rgba(14,16,22,0.9)'; g.fill(); g.restore();
  rr(g, -W / 2, -H / 2, W, H, H / 2); g.strokeStyle = o.borda || 'rgba(235,242,250,0.9)'; g.lineWidth = 4; g.stroke();
  text(g, nome, -tw / 2, 2, { size: sz, color: '#ffffff', font: FONTS.title, weight: 700, align: 'left' }); text(g, nv, tw / 2, 2, { size: sz, color: '#ffffff', font: FONTS.title, weight: 700, align: 'right' });
  if (o.barra !== false) barraOuro(g, -W / 2 + 18, H / 2 + 12, W - 36, 30, xp, o.rotuloXP ?? '', { size: 20 });
  g.beginPath(); const py = H / 2 + (o.barra !== false ? 48 : 6); g.moveTo(-14, py); g.lineTo(14, py); g.lineTo(0, py + 18); g.closePath(); g.fillStyle = 'rgba(235,242,250,0.9)'; g.fill();
  g.restore();
}

// ======================================================================
// POPUP "NOVA MISSÃO" + "???" com glitch. o = { t0, cx, cy, titulo, texto, sub, escala, sai, flash }
// ======================================================================
export function popupMissao(g, T, o = {}) {
  const t0 = o.t0 ?? 0, k = T - t0, sai = o.sai ?? null; if (k < 0) return; if (sai != null && T > sai + 0.45) return;
  const cx = o.cx ?? 500, cy = o.cy ?? 760, esc = o.escala ?? 1, cor = o.cor || C.ouro, PW = 800, PH = o.sub ? 520 : 440;
  // flash + onda de choque (o "som" visual)
  if (o.flash !== false && k < 0.35) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(160,240,255,${0.55 * (1 - k / 0.35) ** 2})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
  for (let q = 0; q < 2; q++) { const kk = k - q * 0.12; if (kk > 0 && kk < 0.7) { g.save(); g.strokeStyle = alpha(q ? C.ciano : cor, 0.8 * (1 - kk / 0.7)); g.lineWidth = 14 * (1 - kk / 0.7) + 2; g.shadowColor = cor; g.shadowBlur = 20; g.beginPath(); g.arc(cx, cy, 120 + ease.out(kk / 0.7) * 700, 0, 7); g.stroke(); g.restore(); } }
  const abre = ease.outBack(prog(k, 0, 0.3)), fecha = sai != null ? ease.in(prog(T, sai, sai + 0.4)) : 0;
  let a = k < 0.4 ? (h1(fr(T) * 1.9) > 0.35 ? 1 : 0.4) : 1; a *= 1 - fecha;
  let I = k < 0.5 ? 0.8 * (1 - k / 0.5) : (h1(Math.floor(T * 5) + 1.7) > 0.8 ? 0.3 : 0); if (fecha > 0) I = 0.5 + fecha * 0.5;
  holo(g, I, fr(T) + 5, a, (x) => {
    x.translate(cx, cy); x.scale(esc * (0.6 + 0.4 * abre), esc * abre * (1 - fecha * 0.9));
    glow(x, 0, 0, 560, cor, 0.16); const L = -PW / 2, TOP = -PH / 2;
    rr(x, L, TOP, PW, PH, 20); const gr = x.createLinearGradient(0, TOP, 0, TOP + PH); gr.addColorStop(0, 'rgba(12,30,70,0.9)'); gr.addColorStop(1, 'rgba(6,14,36,0.9)'); x.fillStyle = gr; x.fill();
    x.save(); rr(x, L, TOP, PW, PH, 20); x.clip(); gradeHex(x, L, TOP, PW, PH, 30, alpha(C.ciano, 0.08), T); linhasScan(x, L, TOP, PW, PH, T);
    // faixa do título
    const hg = x.createLinearGradient(L, 0, -L, 0); hg.addColorStop(0, alpha(cor, 0.05)); hg.addColorStop(0.5, alpha(cor, 0.35)); hg.addColorStop(1, alpha(cor, 0.05)); x.fillStyle = hg; x.fillRect(L, TOP, PW, 130); x.fillStyle = cor; x.fillRect(L, TOP + 130, PW, 3); x.restore();
    rr(x, L, TOP, PW, PH, 20); x.strokeStyle = cor; x.lineWidth = 4; x.shadowColor = cor; x.shadowBlur = 24; x.stroke(); x.shadowBlur = 0;
    cantoneiras(x, L - 14, TOP - 14, PW + 28, PH + 28, 70, '#fff6d0', 7);
    // "!" num círculo + título
    const pul = 1 + 0.08 * Math.sin(T * 10); x.save(); x.translate(L + 82, TOP + 66); x.scale(pul, pul); x.beginPath(); x.arc(0, 0, 40, 0, 7); x.fillStyle = cor; x.shadowColor = cor; x.shadowBlur = 24; x.fill(); x.restore();
    text(x, '!', L + 82, TOP + 70, { size: 60, color: '#2a1a00', font: FONTS.title, weight: 700 });
    const kt = prog(k, 0.15, 0.5); text(x, digita(o.titulo ?? 'NOVA MISSÃO', kt) + (kt < 1 ? cursor(T) : ''), L + 146, TOP + 70, { size: 70, color: '#fff6d8', font: FONTS.title, weight: 700, align: 'left', spacing: 4, glow: 20, glowColor: alpha(cor, 0.9) });
    // "???" com glitch
    const str = o.texto ?? '???', gl = '?!#%&@$*', jit = h1(fr(T) * 4.1) > 0.85; const ji = Math.floor(h1(fr(T) * 2.7) * str.length); let s2 = ''; for (let i = 0; i < str.length; i++) s2 += jit && i === ji ? gl[Math.floor(h1(fr(T) + i * 3.3) * gl.length)] : str[i];
    const ky = TOP + 130 + (PH - 130 - (o.sub ? 90 : 0)) / 2 + 10, kq = ease.outBack(prog(k, 0.3, 0.6)), dx = (jit ? 14 : 4) * Math.sin(T * 50);
    if (kq > 0) { x.save(); x.translate(0, ky); x.scale(kq, kq); x.globalCompositeOperation = 'lighter';
      text(x, s2, -dx - 6, 0, { size: 210, color: 'rgba(255,40,90,0.75)', font: FONTS.title, weight: 700, spacing: 12 }); text(x, s2, dx + 6, 0, { size: 210, color: 'rgba(40,220,255,0.75)', font: FONTS.title, weight: 700, spacing: 12 });
      x.globalCompositeOperation = 'source-over'; text(x, s2, 0, 0, { size: 210, color: '#ffffff', font: FONTS.title, weight: 700, spacing: 12, glow: 30, glowColor: alpha(C.ciano, 0.9) }); x.restore(); }
    if (o.sub) text(x, digita(o.sub, prog(k, 0.6, 1.0)), 0, TOP + PH - 64, { size: 40, color: C.dim, font: FONTS.ui, weight: 900, spacing: 3 });
  });
}
