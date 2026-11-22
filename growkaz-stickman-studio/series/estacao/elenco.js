// A ESTAÇÃO — elenco "low poly modelado" nível PS2 (feel do RE remake dentro do low poly).
// mulher(o): corpo feminino torneado (anéis), mãos com 4 dedos + polegar, braço com IK (alcanca), rosto PINTADO PARAMÉTRICO
// (sobrancelha, pálpebras, olhar, boca, lábio superior, nariz franzido) redesenhado a cada quadro -> as expressões mudam
// de forma contínua (exprEm() mistura presets no tempo). Cabelo cacheado: dezenas de cachos facetados com textura de mola,
// coque alto preso com piranha, cachos soltos emoldurando o rosto. Argolas douradas, bolsa transversal.
// Figurantes masculinos usam pessoa() do Turno (gente.js) com camisas próprias (terno, gari, camiseta).
import { THREE, lam, luz, tex, rnd, mancha } from '/series/turno/ps1.js';
import { anel, tbox, pessoa } from '/series/turno/gente.js';
import { clamp, lerp, ease } from '/engine/core.js';

const DS = THREE.DoubleSide;
export const mat = (c, o = {}) => lam(c, { side: DS, fixo: true, ...o });
const liso = (c, o = {}) => lam(c, { side: DS, fixo: true, flat: false, ...o });
const M = (geo, m, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); return me; };
const sombraU = (g, w, h, a = 0.45) => { for (let x = 0; x < w; x++) { const c = Math.cos((x / w - 0.5) * 2 * Math.PI), s = (1 - (0.5 + 0.5 * c)) * a; if (s > 0.01) { g.fillStyle = `rgba(10,12,20,${s.toFixed(3)})`; g.fillRect(x, 0, 1, h); } } };
const suave = (t) => { t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; return t; };

// ---------------- texturas de roupa ----------------
function texBlusa(o, manga = false) {
  return suave(tex(128, 128, (g, w, h) => {
    const R = rnd(o.seed ?? 3);
    g.fillStyle = o.blusa; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)'; g.fillRect(R() * w | 0, R() * h | 0, 1, 1); }   // trama
    for (let i = 0; i < 10; i++) { const x = 30 + R() * 70, y = 50 + R() * 70; g.strokeStyle = 'rgba(60,30,0,.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y + 8, x + 2 + R() * 10, y + 18); g.stroke(); }   // drapeado
    mancha(g, 52, 50, 18, 'rgba(255,240,200,A)', 0.16); mancha(g, 76, 50, 18, 'rgba(255,240,200,A)', 0.14);
    sombraU(g, w, h, 0.5);
    if (manga) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h - 6, w, 3); return; }
    if (o.decote) { g.fillStyle = o.pele; g.beginPath(); g.moveTo(48, 0); g.quadraticCurveTo(64, 34, 80, 0); g.fill(); g.strokeStyle = 'rgba(70,40,0,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(48, 0); g.quadraticCurveTo(64, 34, 80, 0); g.stroke(); mancha(g, 64, 4, 10, 'rgba(40,20,10,A)', 0.25); }
    if (o.botoes) { g.fillStyle = o.botoes; for (let y = 36; y < 120; y += 16) { g.beginPath(); g.arc(64, y, 2, 0, 7); g.fill(); } g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(63, 30, 1, 98); }
    if (o.gola) { g.fillStyle = o.gola; g.fillRect(0, 0, w, 6); g.beginPath(); g.moveTo(44, 0); g.lineTo(64, 22); g.lineTo(84, 0); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h - 4, w, 4);
  }));
}
function texJeans(o) {
  return suave(tex(64, 64, (g, w, h) => {
    const R = rnd(8); g.fillStyle = o.calca; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.09)' : 'rgba(0,10,40,.10)'; g.fillRect(R() * w | 0, R() * h | 0, 2, 1); }
    mancha(g, 32, 14, 14, 'rgba(255,255,255,A)', 0.18);   // desbotado na coxa
    sombraU(g, w, h, 0.4);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(15, 0, 1, h); g.fillRect(48, 0, 1, h);
    g.fillStyle = 'rgba(200,150,60,.5)'; g.fillRect(17, 0, 1, h);   // pesponto
    g.fillStyle = 'rgba(0,0,0,.18)'; for (const y of [28, 31, 34]) g.fillRect(26, y, 12, 1);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h - 3, w, 3);
  }));
}
function texCabelo(o) {
  const t = tex(64, 64, (g, w, h) => {
    const R = rnd(o.seedCabelo ?? 21); g.fillStyle = o.cabelo; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {   // molinhas: arcos claros e escuros
      const x = R() * w, y = R() * h, r = 2 + R() * 3.5;
      g.strokeStyle = R() < 0.55 ? o.cabeloLuz : 'rgba(0,0,0,.45)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, r, R() * 3, R() * 3 + 3.6); g.stroke();
    }
  }, [1, 1]);
  return suave(t);
}

// ---------------- rosto paramétrico ----------------
// parâmetros: by (sobe sobrancelha), bi (interna sobe = preocupação/medo; <0 = bravo), ba (assimetria: + sobe a esquerda dela / desce a direita),
// eo (abertura dos olhos, 1 normal), ey (pálpebra de baixo sobe = aperta), gx/gy (olhar), pisca (0..1),
// mo (boca abre), ms (sorriso -1..1), mw (largura), mp (lábios apertados), ul (lábio superior sobe = nojo), nw (nariz franzido),
// mx (canto assimétrico: deboche), dente (mostra dentes no sorriso), bochecha (sobe as maçãs quando sorri de verdade)
export const EXPR = {
  neutro: {},
  calma: { eo: 0.92, ms: 0.12 },
  alivio: { by: 0.3, bi: 0.25, eo: 0.72, ms: 0.5, bochecha: 0.6 },
  aperto: { by: 0.35, bi: 0.75, eo: 1.08, ms: -0.4, mp: 0.8, mw: 0.88 },
  nojo: { by: -0.25, bi: -0.35, ba: 0.35, eo: 0.62, ey: 0.55, ms: -0.6, ul: 1, nw: 1, mo: 0.1, mx: 0.3 },
  desconfia: { by: -0.15, ba: -0.75, eo: 0.62, ey: 0.35, ms: -0.15, mw: 0.95, mx: -0.2 },
  pensativa: { by: 0.1, ba: 0.3, eo: 0.8, gy: 0.35, gx: 0.4, ms: 0.05 },
  medo: { by: 0.85, bi: 0.95, eo: 1.38, ms: -0.4, mo: 0.2 },
  panico: { by: 1, bi: 1, eo: 1.55, ms: -0.55, mo: 0.55 },
  firme: { by: -0.35, bi: -0.55, eo: 0.85, mp: 0.4, ms: -0.15 },
  deboche: { ba: 0.8, eo: 0.68, ey: 0.2, ms: 0.25, mx: 0.6, gx: -0.35 },
  susto: { by: 1, bi: 0.6, eo: 1.6, mo: 0.5, ms: -0.2 },
  sorrisoFalso: { by: 0.35, eo: 1.5, ms: 1, dente: 1, mw: 1.18 },
  fixa: { eo: 1.25, ms: 0.0 },
  sorrisoMorto: { eo: 1.32, ms: 1.0, dente: 1, mw: 1.2, by: 0.1 },
};
const PK = ['by', 'bi', 'ba', 'eo', 'ey', 'gx', 'gy', 'pisca', 'mo', 'ms', 'mw', 'mp', 'ul', 'nw', 'mx', 'dente', 'bochecha'];
const DEF = { by: 0, bi: 0, ba: 0, eo: 1, ey: 0, gx: 0, gy: 0, pisca: 0, mo: 0, ms: 0, mw: 1, mp: 0, ul: 0, nw: 0, mx: 0, dente: 0, bochecha: 0 };
export const exprP = (n) => ({ ...DEF, ...(typeof n === 'string' ? EXPR[n] : n) });
export function mistura(a, b, k) { const A = exprP(a), B = exprP(b), r = {}; for (const p of PK) r[p] = lerp(A[p], B[p], k); return r; }
// expressão no tempo: keys [[t, 'nome'|{...}], ...] — transição suave de `tr` s centrada em cada chave
export function exprEm(T, keys, tr = 0.45) {
  let i = 0; while (i + 1 < keys.length && T >= keys[i + 1][0]) i++;
  const cur = keys[i][1];
  if (i > 0) { const k = (T - keys[i][0]) / tr; if (k < 1) return mistura(keys[i - 1][1], cur, ease.inOut(clamp(k))); }
  return exprP(cur);
}

// mapeamento de UV do rosto: frente (±67°) ocupa 80% da largura da textura
const FA = 0.4, FF = 0.1875;
const Gu = (d) => { const a = Math.abs(d), s = Math.sign(d); return s * (a <= FF ? a * FA / FF : FA + (a - FF) * (0.5 - FA) / (0.5 - FF)); };
const HH = 0.25;   // altura da malha da cabeça (queixo -> topo)
const CX = (deg) => 256 * (0.5 + Gu(deg / 360));
const RY = (y) => 256 * (1 - y / HH);
// ângulo (graus) de um ponto x (m) do rosto; + = esquerda dela? (u cresce para +x)
const AX = (x) => Math.asin(clamp(x / 0.09, -1, 1)) * 180 / Math.PI;
const PX = (x) => CX(AX(x));

function pintaRosto(g, f, p) {
  g.setTransform(2, 0, 0, 2, 0, 0); g.lineCap = 'round'; g.lineJoin = 'round';
  const W = 256;
  g.fillStyle = f.pele; g.fillRect(0, 0, W, W);
  // volume: laterais e nuca escurecem, queixo/pescoço sombreado, testa e maçãs com luz, contorno embaixo da maçã
  for (let x = 0; x < W; x += 2) { const c = Math.cos((x / W - 0.5) * 2 * Math.PI), s = (1 - (0.5 + 0.5 * c)) * 0.5; g.fillStyle = `rgba(40,16,8,${s.toFixed(3)})`; g.fillRect(x, 0, 2, W); }
  { const gr = g.createLinearGradient(0, 222, 0, 256); gr.addColorStop(0, 'rgba(40,15,8,0)'); gr.addColorStop(1, 'rgba(40,15,8,.5)'); g.fillStyle = gr; g.fillRect(0, 222, W, 34); }
  mancha(g, 128, 70, 46, 'rgba(255,225,190,A)', 0.16);
  const bo = f.semBochecha ? 0 : p.bochecha + Math.max(0, p.ms) * 0.4;
  for (const s of [-1, 1]) {
    const cx = PX(s * 0.05), cy = RY(0.106) - bo * 4;
    mancha(g, cx, cy, 20, 'rgba(255,215,180,A)', 0.26);                       // maçã do rosto iluminada
    mancha(g, PX(s * 0.062), RY(0.075), 22, 'rgba(60,20,10,A)', 0.2);          // contorno (osso marcado)
    if (f.blush) mancha(g, cx, cy + 6, 16, f.blush, 0.22 + 0.15 * bo);
  }
  // cabelo pintado: linha do cabelo, têmporas, nuca
  if (f.cabelo) {
    g.fillStyle = f.cabelo; g.fillRect(0, 0, W, RY(0.205)); g.fillRect(0, 0, CX(-74), RY(0.13)); g.fillRect(CX(74), 0, W, RY(0.13));
    const R = rnd(5); for (let x = CX(-62); x < CX(62); x += 5) { const y = RY(0.205) + 3 + Math.abs(x - 128) * 0.12 + R() * 5; g.beginPath(); g.arc(x, y - 4, 4 + R() * 2, 0, 7); g.fill(); }   // linha de cachinhos
    g.strokeStyle = f.cabeloLuz || 'rgba(120,70,40,.6)'; g.lineWidth = 1.2; for (let i = 0; i < 40; i++) { const x = R() * W, y = R() * RY(0.21); g.beginPath(); g.arc(x, y, 2 + R() * 2, R() * 3, R() * 3 + 3.5); g.stroke(); }
  }
  if (f.lenco) { g.fillStyle = f.lenco; g.fillRect(0, 0, W, RY(0.2)); g.fillRect(0, 0, CX(-60), W * 0.8); g.fillRect(CX(60), 0, W, W * 0.8); }
  // rugas / olheiras fundas
  if (f.rugas) { g.strokeStyle = 'rgba(50,25,15,.45)'; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(98, 62 + i * 6); g.quadraticCurveTo(128, 58 + i * 6, 158, 62 + i * 6); g.stroke(); }
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(PX(s * 0.022), RY(0.088)); g.quadraticCurveTo(PX(s * 0.034), RY(0.06), PX(s * 0.03), RY(0.04)); g.stroke(); g.beginPath(); g.moveTo(PX(s * 0.05), RY(0.138)); g.lineTo(PX(s * 0.062), RY(0.142)); g.moveTo(PX(s * 0.05), RY(0.132)); g.lineTo(PX(s * 0.062), RY(0.13)); g.stroke(); } }
  // ---- olhos ----
  const EY = RY(0.136);
  for (const s of [-1, 1]) {
    const xi = PX(s * 0.0085), xo = PX(s * 0.054), xc = (xi + xo) / 2, ew = Math.abs(xo - xi);
    const asy = s * p.ba;   // + sobe a sobrancelha deste lado
    let op = clamp(p.eo * (1 - p.pisca), 0, 1.7);
    const up = 8.2 * op, lo = 4.2 * clamp(op, 0, 1.4) * (1 - 0.6 * p.ey);
    if (f.fundos) { mancha(g, xc, EY, 17, 'rgba(25,10,15,A)', 0.75); mancha(g, xc, EY + 4, 12, 'rgba(70,40,60,A)', 0.5); }
    else { mancha(g, xc, EY + 6, 11, 'rgba(60,25,20,A)', 0.18); mancha(g, xc, EY - 9, 12, f.sombraOlho || 'rgba(90,40,30,A)', 0.22); }   // olheira leve / sombra de pálpebra
    // vinco da pálpebra
    g.strokeStyle = 'rgba(50,20,12,.45)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(xi, EY - 3); g.quadraticCurveTo(xc, EY - up - 5.5 - op * 1.5, xo + s * 2, EY - 3.5); g.stroke();
    if (op < 0.12) {   // fechado: cílios
      g.strokeStyle = '#1a0c08'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(xi, EY); g.quadraticCurveTo(xc, EY + 2.4, xo + s * 2, EY - 0.5); g.stroke();
      continue;
    }
    const pathOlho = () => { g.beginPath(); g.moveTo(xi, EY); g.bezierCurveTo(xi + s * ew * 0.2, EY - up * 1.25, xo - s * ew * 0.25, EY - up * 1.3, xo, EY - 0.8); g.bezierCurveTo(xo - s * ew * 0.3, EY + lo * 1.2, xi + s * ew * 0.25, EY + lo * 1.25, xi, EY); g.closePath(); };
    g.save(); pathOlho(); g.fillStyle = f.esclera || '#efe5da'; g.fill(); g.clip();
    const ix = xc + p.gx * ew * 0.28 - s * 0.6, iy = EY - 0.6 + p.gy * -2.2, ir = 7.4;
    g.fillStyle = f.olho; g.beginPath(); g.arc(ix, iy, ir, 0, 7); g.fill();
    g.fillStyle = f.olhoLuz || 'rgba(170,110,60,.75)'; g.beginPath(); g.arc(ix + 0.6, iy + 1.3, ir * 0.62, 0, 7); g.fill();
    g.fillStyle = '#050302'; g.beginPath(); g.arc(ix, iy, ir * (f.pupila ?? 0.42), 0, 7); g.fill();
    if (!f.semBrilho) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ix - 1.6, iy - 1.8, 1.5, 0, 7); g.fill(); g.beginPath(); g.arc(ix + 1.8, iy + 1.4, 0.7, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(40,15,8,.35)'; g.fillRect(xi - 10, EY - up * 1.4 - 2, ew + 20, 2.6);   // sombra da pálpebra sobre o olho
    g.restore();
    // delineado + cílios (traço grosso em cima, asinha pra fora)
    g.strokeStyle = '#120806'; g.lineWidth = f.cilios ?? 2.3;
    g.beginPath(); g.moveTo(xi, EY); g.bezierCurveTo(xi + s * ew * 0.2, EY - up * 1.25, xo - s * ew * 0.25, EY - up * 1.3, xo, EY - 0.8); g.lineTo(xo + s * 3.2, EY - 2.6 - op); g.stroke();
    g.strokeStyle = 'rgba(30,12,8,.55)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(xo, EY - 0.8); g.bezierCurveTo(xo - s * ew * 0.3, EY + lo * 1.2, xi + s * ew * 0.25, EY + lo * 1.25, xi, EY); g.stroke();
  }
  // ---- sobrancelhas (grossas, afinando pra fora) ----
  for (const s of [-1, 1]) {
    const asy = s * p.ba, by = RY(0.166) - 5 * p.by - 4 * asy, xi = PX(s * 0.008), xo = PX(s * 0.05);
    const yi = by - 5 * p.bi + 2 * Math.max(0, -p.bi) + 2 * p.nw, yo = by + 1.5 * p.bi + 1;
    const ya = Math.min(yi, yo) - 3.5 - 2 * Math.max(0, asy);   // arco
    g.fillStyle = f.sobr; g.beginPath();
    g.moveTo(xi, yi + 2.6); g.quadraticCurveTo(lerp(xi, xo, 0.55), ya - (f.sobrFina ? 0 : 1.2), xo + s * 2, yo + 0.5);
    g.quadraticCurveTo(lerp(xi, xo, 0.5), ya + 3.2, xi, yi + (f.sobrFina ? 4.4 : 6.2)); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(20,10,5,.5)'; g.lineWidth = 0.8; for (let k = 0; k < 6; k++) { const x = lerp(xi, xo, k / 6); g.beginPath(); g.moveTo(x, yi + 4 - k * 0.5); g.lineTo(x + s * 2.5, yi + 1 - k * 0.6); g.stroke(); }
  }
  if (p.nw > 0.05) { g.strokeStyle = `rgba(60,25,12,${0.5 * p.nw})`; g.lineWidth = 1; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(122, RY(0.13) + k * 3); g.quadraticCurveTo(128, RY(0.132) + k * 3 - 1.5, 134, RY(0.13) + k * 3); g.stroke(); } }
  if (p.bi > 0.4) { g.strokeStyle = `rgba(60,25,12,${0.4 * (p.bi - 0.4)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(122, RY(0.185)); g.lineTo(124, RY(0.17)); g.moveTo(134, RY(0.185)); g.lineTo(132, RY(0.17)); g.stroke(); }
  // ---- nariz: ponte com luz, asas e narinas ----
  { const nb = RY(0.083) - p.ul * 1.6; mancha(g, 128, RY(0.105), 5, 'rgba(255,225,190,A)', 0.22);
    for (const s of [-1, 1]) { mancha(g, 128 + s * 9, nb - 2, 6, 'rgba(60,22,10,A)', 0.4); g.fillStyle = 'rgba(40,12,6,.75)'; g.beginPath(); g.ellipse(128 + s * 4.6, nb + 0.5, 2.6, 1.3, s * 0.3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(60,22,10,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(121, nb - 1); g.quadraticCurveTo(128, nb + 3, 135, nb - 1); g.stroke(); }
  // ---- boca: lábios cheios ----
  const MY = RY(0.061), mw = 25 * p.mw * (1 + 0.06 * p.ms) * (1 - 0.08 * p.mp), op = clamp(p.mo, 0, 1) * (1 - 0.7 * p.mp);
  const cl = MY - 6 * p.ms - 4 * p.mx + p.mp * 0.5, cr = MY - 6 * p.ms + 4 * p.mx + p.mp * 0.5;   // cantos (esq/dir na textura)
  const xl = 128 - mw, xr = 128 + mw, ulY = MY - 2 - 1.8 * p.ul - op * 2.2, llY = MY + 2 + op * 12;
  const lip = f.labio, lipL = f.labioLuz || 'rgba(255,190,170,.35)';
  // contorno do sulco nasolabial quando sorri / nojo
  if (p.ms > 0.3 || p.ul > 0.3) { g.strokeStyle = `rgba(60,22,10,${0.22 * Math.max(p.ms, p.ul)})`; g.lineWidth = 1.4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128 + s * 11, RY(0.085)); g.quadraticCurveTo(128 + s * (mw + 6), MY - 6, 128 + s * (mw + 3), MY + 3); g.stroke(); } }
  // interior / dentes
  if (op > 0.04 || p.dente > 0.05) {
    const ih = Math.max(op * 9.5, p.dente * 3.6 * Math.max(0, p.ms));
    g.fillStyle = '#2a0a08'; g.beginPath(); g.moveTo(xl + 2, cl); g.quadraticCurveTo(128, ulY - 1, xr - 2, cr); g.quadraticCurveTo(128, MY + ih + 1, xl + 2, cl); g.fill();
    g.save(); g.clip(); g.fillStyle = '#ece6dc'; g.fillRect(xl, ulY - 3, xr - xl, 3.8 + (p.dente > 0.5 ? ih * 0.55 : 0)); g.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 122; x < 136; x += 4) g.fillRect(x, ulY, 0.6, 3); if (op > 0.4) { g.fillStyle = '#8a3030'; g.beginPath(); g.ellipse(128, MY + ih - 1, mw * 0.5, 2.4, 0, 0, 7); g.fill(); } g.restore();
  }
  // lábio superior (arco do cupido)
  g.fillStyle = lip; g.beginPath(); g.moveTo(xl, cl);
  g.bezierCurveTo(xl + mw * 0.4, ulY - 5, 122, ulY - 8 - p.ul, 128, ulY - 5.4 - p.ul); g.bezierCurveTo(134, ulY - 8 - p.ul * 1.4, xr - mw * 0.4, ulY - 5 - p.ul * 0.5, xr, cr);
  g.quadraticCurveTo(128, ulY + 1.2, xl, cl); g.fill();
  // lábio inferior, mais cheio
  g.beginPath(); g.moveTo(xl + 1, cl + 0.3); g.quadraticCurveTo(128, (op > 0.04 ? llY - 1 : MY + 0.6), xr - 1, cr + 0.3); g.bezierCurveTo(xr - mw * 0.3, llY + 9, xl + mw * 0.3, llY + 9, xl + 1, cl + 0.3); g.fill();
  g.fillStyle = lipL; g.beginPath(); g.ellipse(128, llY + 3.6, mw * 0.4, 2, 0, 0, 7); g.fill();     // brilho do lábio
  g.fillStyle = 'rgba(255,200,180,.18)'; g.beginPath(); g.ellipse(128, ulY - 2.6, mw * 0.35, 0.9, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(40,8,6,.75)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(xl, cl); g.quadraticCurveTo(128, op > 0.04 ? ulY + 0.8 : MY + 0.4 + 1.2 * p.ms, xr, cr); g.stroke();   // linha da boca
  for (const [x, y, s] of [[xl, cl, -1], [xr, cr, 1]]) mancha(g, x + s * 1.5, y, 3.2, 'rgba(50,15,8,A)', 0.5);   // covinha do canto
  mancha(g, 128, llY + 9, 9, 'rgba(50,18,10,A)', 0.22);   // sombra do queixo
  if (f.pinta) { g.fillStyle = 'rgba(40,16,8,.8)'; g.beginPath(); g.arc(PX(0.028), RY(0.07), 1, 0, 7); g.fill(); }
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------------- tipos ----------------
export const LIVIA = { nome: 'livia', pele: '#94603f', nariz: '#87563a', cabelo: '#24150d', cabeloLuz: 'rgba(150,90,50,.75)', sobr: '#1a0d07', olho: '#3a1d0e', olhoLuz: 'rgba(160,96,46,.8)', labio: '#6e2f28', labioLuz: 'rgba(255,190,170,.4)', blush: 'rgba(200,80,60,A)', pinta: true,
  blusa: '#d4a028', decote: true, calca: '#9cb6cf', tenis: '#c4956c', salto: true, alt: 1.66, cachos: true, argolas: true, bolsa: '#3a2219', unha: '#c4705e', seed: 3, seedCabelo: 21 };
export const SOSIA = { ...LIVIA, nome: 'sosia', semBrilho: true, pupila: 0.55 };
export const SENHORA = { nome: 'senhora', pele: '#c8a48a', cabelo: '#8e8a86', cabeloLuz: 'rgba(220,220,215,.6)', sobr: '#6e6660', sobrFina: true, olho: '#2a2622', olhoLuz: 'rgba(90,90,80,.5)', labio: '#8e5a52', fundos: true, rugas: true, semBrilho: true, pupila: 0.6, esclera: '#d8d0bc', cilios: 1.2,
  blusa: '#5a4a62', saia: '#3a3430', semBochecha: true, mangaLonga: true, meia: '#b89a84', tenis: '#2a2420', alt: 1.56, coque: true, xale: '#7a5a48', sacola: true, unha: '#b89888', seed: 9, largura: 1.08 };
export const ESTUDANTE = { nome: 'estudante', pele: '#c89470', cabelo: '#1a120c', cabeloLuz: 'rgba(90,60,40,.6)', sobr: '#20140c', olho: '#2a1a10', labio: '#9a5a4a', semBrilho: true,
  blusa: '#e8e8e4', gola: '#2a4a8a', calca: '#22325a', tenis: '#e8e8e4', alt: 1.45, rabo: true, mochila: '#3a5a8a', unha: '#c89470', seed: 5 };

// ---------------- mulher ----------------
export function mulher(o) {
  const S = (o.alt ?? 1.66) / 1.75, L = o.largura ?? 1, root = new THREE.Group(), corpo = new THREE.Group(); root.add(corpo); corpo.scale.setScalar(S);
  const mPele = liso(o.pele), mBl = mat('#ffffff', { map: texBlusa(o) }), mMan = mat('#ffffff', { map: texBlusa(o, true) });
  const mCal = o.saia ? null : mat('#ffffff', { map: texJeans(o) }), mTen = liso(o.tenis), mSola = mat(o.saia ? '#1a1612' : o.salto ? '#5a3a24' : '#c8c4bc');
  const mPerna = o.saia ? liso(o.meia) : mCal;
  // ---- pernas ----
  const pernas = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Group(); p.position.set(s * 0.085 * L, 0.9, 0); corpo.add(p);
    p.add(M(anel([{ y: 0.02, rx: 0.09 * L, rz: 0.095 }, { y: -0.18, rx: 0.074 * L, rz: 0.08, dz: 0.006 }, { y: -0.42, rx: 0.05, rz: 0.055, dz: 0.004 }], 8), mPerna));
    const joe = new THREE.Group(); joe.position.y = -0.42; p.add(joe);
    joe.add(M(anel([{ y: 0.02, rx: 0.052, rz: 0.056 }, { y: -0.1, rx: 0.05, rz: 0.058, dz: -0.008 }, { y: -0.34, rx: 0.036, rz: 0.04 }, { y: -0.37, rx: o.saia ? 0.033 : 0.05, rz: o.saia ? 0.036 : 0.052 }], 8), mPerna));
    const pe = new THREE.Group(); pe.position.y = -0.4; joe.add(pe);
    const sg = tbox(0.092, 0.075, 0.25, 0.9, 0.78, 1), sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { if (sp.getZ(i) > 0.05 && sp.getY(i) > 0) sp.setY(i, sp.getY(i) - 0.032); if (sp.getZ(i) > 0.1) sp.setX(i, sp.getX(i) * 0.78); }
    sg.computeVertexNormals();
    if (o.salto) {   // sapato de salto bloco baixo: peito do pé à mostra, calcanhar erguido 4 cm, bico afinando
      pe.add(M(anel([{ y: -0.035, rx: 0.036, rz: 0.038 }, { y: 0.0, rx: 0.034, rz: 0.036 }], 8), mPerna === mCal ? liso(o.pele) : mPerna, 0, 0, 0));   // tornozelo de pele
      const sh = new THREE.Group(); sh.position.set(0, -0.03, 0.04); sh.rotation.x = 0.16; pe.add(sh);
      const cg = tbox(0.082, 0.04, 0.24, 0.85, 0.7, 1), cp = cg.attributes.position;
      for (let i = 0; i < cp.count; i++) { if (cp.getZ(i) > 0.06) { cp.setX(i, cp.getX(i) * 0.72); if (cp.getY(i) > 0) cp.setY(i, cp.getY(i) - 0.018); } }
      cg.computeVertexNormals(); sh.add(M(cg, mTen, 0, -0.012, 0));
      sh.add(M(new THREE.BoxGeometry(0.08, 0.008, 0.07), liso(o.pele), 0, 0.006, 0.055));   // peito do pé (decote do sapato)
      sh.add(M(new THREE.BoxGeometry(0.086, 0.01, 0.24), mSola, 0, -0.036, 0.002));
      const salto = M(tbox(0.05, 0.05, 0.055, 0.85, 0.85), mSola, 0, -0.066, -0.085); salto.rotation.x = -0.16; sh.add(salto);
    } else {
      pe.add(M(sg, mTen, 0, -0.035, 0.045));
      pe.add(M(new THREE.BoxGeometry(0.098, 0.024, 0.262), mSola, 0, -0.07, 0.045));
      if (!o.saia) pe.add(M(new THREE.BoxGeometry(0.05, 0.006, 0.08), mat('#d8d4cc'), 0, -0.002, 0.07));   // cadarço
    }
    p.joe = joe; p.pe = pe; pernas.push(p);
  }
  // quadril
  const mQ = o.saia ? mat(o.saia) : mCal;
  corpo.add(M(anel([{ y: 0.78, rx: 0.15 * L, rz: 0.105 }, { y: 0.88, rx: 0.17 * L, rz: 0.118 }, { y: 0.93, rx: 0.14 * L, rz: 0.1 }], 9, false), mQ));
  if (o.saia) corpo.add(M(anel([{ y: 0.4, rx: 0.23 * L, rz: 0.2 }, { y: 0.7, rx: 0.2 * L, rz: 0.16 }, { y: 0.9, rx: 0.175 * L, rz: 0.125 }], 10, false), mat(o.saia)));
  // ---- tronco ----
  const tronco = new THREE.Group(); tronco.position.y = 0.98; corpo.add(tronco);
  tronco.add(M(anel([
    { y: -0.14, rx: 0.19 * L, rz: 0.14 },   // barra da blusa por fora
    { y: -0.07, rx: 0.165 * L, rz: 0.12 },
    { y: 0.0, rx: 0.132 * L, rz: 0.097 },
    { y: 0.08, rx: 0.122 * L, rz: 0.09 },
    { y: 0.2, rx: 0.148 * L, rz: 0.118, dz: 0.016, sq: 0.12 },
    { y: 0.28, rx: 0.152 * L, rz: 0.112, dz: 0.012, sq: 0.1 },
    { y: 0.36, rx: 0.156 * L, rz: 0.094, sq: 0.06 },
    { y: 0.42, rx: 0.13 * L, rz: 0.08, sq: 0.04 },
    { y: 0.455, rx: 0.056, rz: 0.05 }], 10), mBl));
  if (o.xale) {   // xale nos ombros (triângulo de tricô caído nas costas)
    const xm = mat(o.xale, { map: tex(32, 32, (g) => { g.fillStyle = o.xale; g.fillRect(0, 0, 32, 32); g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < 32; y += 3) for (let x = (y % 6) ? 1 : 0; x < 32; x += 3) g.fillRect(x, y, 1, 1); g.fillStyle = 'rgba(255,230,200,.15)'; g.fillRect(0, 14, 32, 2); }) });
    tronco.add(M(anel([{ y: 0.08, rx: 0.2 * L, rz: 0.15, dz: -0.02 }, { y: 0.3, rx: 0.19 * L, rz: 0.13 }, { y: 0.43, rx: 0.15 * L, rz: 0.1 }, { y: 0.47, rx: 0.07, rz: 0.065 }], 10, false), xm));
  }
  // ---- braços ----
  const bracos = {}; const L1 = 0.27, L2 = 0.24;
  for (const [lado, s] of [['E', -1], ['D', 1]]) {
    const om = new THREE.Group(); om.position.set(s * (0.15 * L + 0.012), 0.39, 0); tronco.add(om);
    const del = new THREE.Mesh(new THREE.SphereGeometry(0.058, 8, 5), o.xale ? mat(o.xale) : mBl); del.scale.set(1, 0.9, 0.95); om.add(del);
    om.add(M(anel([{ y: -0.02, rx: 0.056, rz: 0.058 }, { y: -0.14, rx: 0.054, rz: 0.054 }, ...(o.mangaLonga ? [{ y: -L1, rx: 0.044, rz: 0.046 }] : [])], 8), o.xale ? mat(o.xale) : mMan));
    if (!o.mangaLonga) om.add(M(anel([{ y: -0.1, rx: 0.042, rz: 0.043 }, { y: -L1 + 0.01, rx: 0.036, rz: 0.038 }], 8), mPele));
    const cot = new THREE.Group(); cot.position.y = -L1; om.add(cot);
    cot.add(M(anel([{ y: 0.012, rx: 0.036, rz: 0.038 }, { y: -0.08, rx: 0.036, rz: 0.035 }, { y: -L2 + 0.01, rx: 0.025, rz: 0.021 }], 8), o.mangaLonga ? mMan : mPele));
    if (o.mangaLonga) cot.add(M(anel([{ y: -0.15, rx: 0.03, rz: 0.028 }, { y: -L2 + 0.01, rx: 0.025, rz: 0.021 }], 7), mPele));
    const mao = new THREE.Group(); mao.position.y = -L2; cot.add(mao);
    mao.add(M(tbox(0.058, 0.068, 0.024, 1.12, 1.05), mPele, 0, -0.034, 0));
    const ded = new THREE.Group(); ded.position.y = -0.066; mao.add(ded); const dedos = [];
    const mUnha = mat(o.unha || o.pele);
    for (let i = 0; i < 4; i++) { const d = new THREE.Group(); d.position.set((i - 1.5) * 0.0148, 0, 0); ded.add(d); const len = 0.056 - Math.abs(i - 1.2) * 0.006; d.add(M(tbox(0.0128, len, 0.013, 0.82, 0.85), mPele, 0, -len / 2, 0)); d.add(M(new THREE.BoxGeometry(0.0095, 0.012, 0.004), mUnha, 0, -len + 0.007, 0.006)); dedos.push(d); }
    const pol = new THREE.Group(); pol.position.set(-s * 0.03, -0.022, 0.01); mao.add(pol); pol.add(M(tbox(0.016, 0.046, 0.016, 0.8, 0.8), mPele, 0, -0.023, 0)); pol.rotation.z = -s * 0.55; pol.rotation.x = -0.4;
    bracos[lado] = { om, cot, mao, ded, dedos, pol, s };
  }
  // pulseira / relógio na esquerda (detalhe)
  if (o.nome === 'livia' || o.nome === 'sosia') bracos.E.cot.add(M(anel([{ y: -0.2, rx: 0.029, rz: 0.026 }, { y: -0.216, rx: 0.029, rz: 0.026 }], 8, false), mat('#d8a838', { emissive: '#3a2800' })));
  // ---- bolsa transversal (alça do ombro direito ao quadril esquerdo) ----
  if (o.bolsa) {
    const mb = mat(o.bolsa), al = mat('#2a1812');
    const fr = M(new THREE.BoxGeometry(0.03, 0.62, 0.008), al, -0.015, 0.16, 0.132); fr.rotation.z = -0.72; fr.rotation.x = -0.12; tronco.add(fr);
    const tr = M(new THREE.BoxGeometry(0.03, 0.6, 0.008), al, -0.02, 0.17, -0.1); tr.rotation.z = 0.7; tronco.add(tr);
    const b = new THREE.Group(); b.position.set(-0.19, -0.16, 0.02); b.rotation.y = -1.1; tronco.add(b);
    b.add(M(tbox(0.2, 0.15, 0.06, 0.92, 0.9), mb)); b.add(M(new THREE.BoxGeometry(0.2, 0.07, 0.065), mat('#2a1812'), 0, 0.045, 0.002)); b.add(M(new THREE.BoxGeometry(0.03, 0.02, 0.01), mat('#d8a838'), 0, 0.01, 0.036));
    root.bolsa = b;
  }
  if (o.mochila) { const mb = mat(o.mochila); tronco.add(M(tbox(0.26, 0.32, 0.12, 0.92, 0.9), mb, 0, 0.2, -0.16)); for (const s of [-1, 1]) tronco.add(M(new THREE.BoxGeometry(0.03, 0.4, 0.02), mb, s * 0.09, 0.22, 0.1)); }
  if (o.sacola) { const sc = new THREE.Group(); bracos.E.mao.add(sc); sc.position.set(0, -0.06, 0); const ms = mat('#3a6a3a', { map: tex(16, 16, (g) => { g.fillStyle = '#3a6a3a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c8b030'; for (let i = 0; i < 16; i += 4) { g.fillRect(i, 0, 1, 16); g.fillRect(0, i, 16, 1); } }) }); sc.add(M(tbox(0.3, 0.3, 0.14, 1.15, 1.1), ms, 0, -0.2, 0)); sc.add(M(new THREE.TorusGeometry(0.06, 0.008, 4, 8, Math.PI), ms, 0, -0.04, 0)); root.sacola = sc; }
  // ---- pescoço e cabeça ----
  const cab = new THREE.Group(); cab.position.y = 0.44; tronco.add(cab);
  cab.add(M(anel([{ y: -0.02, rx: 0.05, rz: 0.048 }, { y: 0.08, rx: 0.04, rz: 0.044, dz: 0.004 }], 9), mPele));
  const H0 = 0.05;
  const RING = [
    { y: 0.0, rx: 0.022, rz: 0.022, dz: 0.054 }, { y: 0.026, rx: 0.046, rz: 0.054, dz: 0.034, sq: 0.3 },
    { y: 0.06, rx: 0.061, rz: 0.076, dz: 0.016, sq: 0.15 }, { y: 0.1, rx: 0.077, rz: 0.087, dz: 0.006, sq: 0.15 },
    { y: 0.138, rx: 0.086, rz: 0.096 }, { y: 0.18, rx: 0.084, rz: 0.098, dz: -0.004 },
    { y: 0.218, rx: 0.07, rz: 0.086, dz: -0.008 }, { y: 0.25, rx: 0.026, rz: 0.036, dz: -0.01 }];
  const SID = 16, headGeo = anel(RING, SID);
  { const uv = headGeo.attributes.uv; for (let i = 0; i < uv.count; i++) { const u = uv.getX(i); if (u > 0.01 && u < 0.99) uv.setX(i, 0.5 + Gu(u - 0.5)); } }
  const headBase = headGeo.attributes.position.array.slice();
  const fcv = document.createElement('canvas'); fcv.width = fcv.height = 512; const fg = fcv.getContext('2d');
  const faceTex = new THREE.CanvasTexture(fcv); faceTex.colorSpace = THREE.SRGBColorSpace; faceTex.magFilter = THREE.LinearFilter; faceTex.minFilter = THREE.LinearMipmapLinearFilter; faceTex.anisotropy = 4;
  const head = M(headGeo, liso('#ffffff', { map: faceTex }), 0, H0, 0); cab.add(head); head.scale.set(1.02, 0.95, 1);
  // nariz (malha), orelhas
  { const mNz = liso(o.nariz || o.pele); const ng = tbox(0.017, 0.042, 0.016, 0.45, 0.35); const nz = M(ng, mNz, 0, H0 + 0.1, 0.092); nz.rotation.x = -0.22; cab.add(nz);
    const ponta = new THREE.Mesh(new THREE.SphereGeometry(0.0098, 8, 5), mNz); ponta.scale.set(1.3, 0.85, 0.85); ponta.position.set(0, H0 + 0.083, 0.097); cab.add(ponta); }
  for (const s of [-1, 1]) { const e = M(tbox(0.014, 0.046, 0.03, 0.7, 0.8), mPele, s * 0.086, H0 + 0.118, -0.006); e.rotation.z = s * 0.15; cab.add(e); }
  // ---- cabelo ----
  const cabelo = new THREE.Group(); cab.add(cabelo);
  if (o.cabelo) {
    const mc = mat('#ffffff', { map: texCabelo(o) }), mc2 = mat('#c8b0a0', { map: texCabelo({ ...o, seedCabelo: 7 }) });
    const R = rnd(o.seedCabelo ?? 21), ico = new THREE.IcosahedronGeometry(1, 0), ico1 = new THREE.IcosahedronGeometry(1, 1);
    const cacho = (x, y, z, r, alt = false) => { const m = M(R() < 0.5 ? ico : ico1, alt ? mc2 : mc, x, y, z); m.scale.set(r * (0.85 + R() * 0.3), r * (0.85 + R() * 0.35), r * (0.85 + R() * 0.3)); m.rotation.set(R() * 6, R() * 6, R() * 6); cabelo.add(m); return m; };
    // calota rente (cobre o topo, atrás das orelhas)
    { const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), mc); cap.scale.set(0.98, 0.95, 1.04); cap.position.set(0, H0 + 0.142, -0.012); cap.rotation.x = -0.42; cabelo.add(cap); }
    if (o.cachos) {
      // volume em volta da cabeça (lados e nuca), sem cobrir o rosto
      for (let i = 0; i < 300; i++) {
        const th = R() * Math.PI * 2, ph = 0.15 + R() * 1.25; const dx = Math.sin(th) * Math.sin(ph), dz = Math.cos(th) * Math.sin(ph), dy = Math.cos(ph);
        if (dz > 0.25 && dy < 0.75) continue;           // rosto livre
        if (dz > -0.2 && dy < 0.05) continue;          // lados de baixo livres (pescoço/orelhas à mostra)
        const rr = 0.104 + R() * 0.045; cacho(dx * rr * 1.08, H0 + 0.15 + dy * rr * 0.98, -0.012 + dz * rr * 1.06, 0.019 + R() * 0.017, R() < 0.35);
      }
      // coque alto/volumoso atrás, preso com piranha
      const CQ = [0, H0 + 0.235, -0.075];
      for (let i = 0; i < 120; i++) { const th = R() * Math.PI * 2, ph = R() * Math.PI; const r = 0.05 + R() * 0.045; cacho(CQ[0] + Math.sin(th) * Math.sin(ph) * r * 1.25, CQ[1] + Math.cos(ph) * r * 0.85, CQ[2] + Math.cos(th) * Math.sin(ph) * r * 0.9, 0.019 + R() * 0.016, R() < 0.35); }
      // piranha (tartaruga)
      const pm = mat('#8a4a1c', { map: tex(16, 16, (g) => { g.fillStyle = '#7a3e16'; g.fillRect(0, 0, 16, 16); const r = rnd(3); for (let i = 0; i < 20; i++) { g.fillStyle = r() < 0.5 ? '#c08040' : '#3a1a08'; g.fillRect(r() * 16 | 0, r() * 16 | 0, 3, 2); } }) });
      const pir = new THREE.Group(); pir.position.set(0, H0 + 0.2, -0.13); pir.rotation.x = 0.5; cabelo.add(pir);
      pir.add(M(new THREE.BoxGeometry(0.11, 0.022, 0.03), pm)); for (let k = 0; k < 6; k++) { const d = M(tbox(0.01, 0.05, 0.01, 0.5, 0.5), pm, -0.05 + k * 0.02, -0.03, 0.012); d.rotation.x = 0.5; pir.add(d); const d2 = M(tbox(0.01, 0.05, 0.01, 0.5, 0.5), pm, -0.05 + k * 0.02, 0.03, 0.012); d2.rotation.x = Math.PI - 0.5; pir.add(d2); }
      // cachos soltos emoldurando o rosto (mola descendo da têmpora)
      for (const s of [-1, 1]) for (let k = 0; k < 5; k++) cacho(s * (0.082 + 0.006 * Math.sin(k * 2)), H0 + 0.17 - k * 0.026, 0.045 - k * 0.004 + (s > 0 ? 0.004 : 0), 0.018 - k * 0.0015, k % 2 === 1);
    }
    if (o.coque) { for (let i = 0; i < 26; i++) { const th = R() * 6.28, ph = R() * 3.14; cacho(Math.sin(th) * Math.sin(ph) * 0.045, H0 + 0.2 + Math.cos(ph) * 0.035, -0.11 + Math.cos(th) * Math.sin(ph) * 0.04, 0.025, true); } }
    if (o.rabo) { for (let k = 0; k < 7; k++) cacho(0.006 * Math.sin(k), H0 + 0.19 - k * 0.04, -0.12 - k * 0.006, 0.034 - k * 0.002); }
  }
  // argolas douradas
  const argolas = [];
  if (o.argolas) { const ag = mat('#e0b040', { emissive: '#4a3000', flat: false }); for (const s of [-1, 1]) { const a = M(new THREE.TorusGeometry(0.019, 0.0028, 5, 14), ag, s * 0.091, H0 + 0.075, -0.004); a.rotation.y = Math.PI / 2; cab.add(a); argolas.push(a); } }
  root.cab = cab; root.tronco = tronco; root.bracos = bracos; root.pernas = pernas; root.corpo = corpo; root.cabelo = cabelo; root.S = S;
  // ---- rosto: aplica parâmetros (objeto exprP ou nome) ----
  let ultimo = '';
  root.face = (p = {}) => {
    const P = exprP(p);
    const id = PK.map(k => P[k].toFixed(3)).join(',');
    if (id !== ultimo) { ultimo = id; pintaRosto(fg, o, P); faceTex.needsUpdate = true; }
    const a = headGeo.attributes.position.array, drop = [0.016, 0.012, 0.004, 0, 0, 0, 0, 0].map(d => d * clamp(P.mo) * (1 - 0.6 * P.mp));
    for (let i = 0; i < a.length / 3; i++) { const yb = headBase[i * 3 + 1]; const r = RING.findIndex(rr => Math.abs(rr.y - yb) < 1e-4); a[i * 3 + 1] = yb - (r >= 0 ? drop[r] : 0); }
    headGeo.attributes.position.needsUpdate = true;
  };
  root.face('neutro');
  // ---- mãos: dedos (0 aberto .. 1 fechado), polegar ----
  root.dedos = (lado, f = 0.25, abre = 0) => { const b = bracos[lado]; b.dedos.forEach((d, i) => { d.rotation.x = -f * 1.5; d.rotation.z = (i - 1.5) * 0.08 * abre * b.s; }); b.pol.rotation.x = -0.4 - f * 0.6; };
  // FK (compatível com pessoa): frente, abre, cot em rad
  root.braco = (lado, frente = 0, abre = 0, cot = 0, dedos = 0.25) => { const b = bracos[lado], s = b.s; b.om.quaternion.setFromEuler(new THREE.Euler(-frente, 0, s * (abre + 0.06))); b.cot.rotation.set(-cot, 0, 0); b.mao.rotation.set(0, 0, 0); root.dedos(lado, dedos); };
  // IK de dois ossos: põe o pulso no ponto `alvo` (mundo). polo = direção preferida do cotovelo (mundo, relativa); punho = Euler da mão
  const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
  root.alcanca = (lado, alvo, o2 = {}) => {
    const b = bracos[lado], s = b.s; root.updateMatrixWorld(true);
    const loc = tronco.worldToLocal(_v.set(...alvo)).clone().sub(b.om.position);
    const dist = clamp(loc.length(), 0.05, (L1 + L2) * 0.999), cb = clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1), dobra = Math.PI - Math.acos(cb);
    b.cot.rotation.set(-dobra, 0, 0);
    const w0 = new THREE.Vector3(0, -L1 - L2 * Math.cos(dobra), L2 * Math.sin(dobra)).normalize(), dn = loc.clone().normalize();
    _q.setFromUnitVectors(w0, dn);
    // gira em torno do eixo ombro->pulso até o cotovelo apontar pro polo (pra fora e pra baixo)
    const pol = new THREE.Vector3(...(o2.polo || [s * 0.7, -1, -0.5])).normalize();
    const e = new THREE.Vector3(0, -L1, 0).applyQuaternion(_q); const eP = e.clone().sub(dn.clone().multiplyScalar(e.dot(dn))).normalize(), pP = pol.clone().sub(dn.clone().multiplyScalar(pol.dot(dn))).normalize();
    let ang = Math.acos(clamp(eP.dot(pP), -1, 1)); if (new THREE.Vector3().crossVectors(eP, pP).dot(dn) < 0) ang = -ang;
    _q2.setFromAxisAngle(dn, ang); b.om.quaternion.copy(_q2.multiply(_q));
    const pu = o2.punho || [0, 0, 0]; b.mao.rotation.set(pu[0], pu[1], pu[2]);
    root.dedos(lado, o2.dedos ?? 0.25, o2.abre ?? 0);
  };
  // caminhada (quadril balança), parado, respiração
  root.anda = (fase, k = 1) => {
    const a = Math.sin(fase) * 0.42 * k;
    pernas[0].rotation.x = a; pernas[1].rotation.x = -a;
    pernas[0].joe.rotation.x = Math.max(0, Math.sin(fase - 1.2)) * 0.7 * k; pernas[1].joe.rotation.x = Math.max(0, Math.sin(fase + Math.PI - 1.2)) * 0.7 * k;
    pernas[0].pe.rotation.x = -0.25 * Math.max(0, Math.sin(fase + 0.6)) * k; pernas[1].pe.rotation.x = -0.25 * Math.max(0, Math.sin(fase + Math.PI + 0.6)) * k;
    if (!root._bracoLivre) { root.braco('E', -a * 0.6, 0.1, 0.25 + 0.15 * Math.max(0, -a)); root.braco('D', a * 0.6, 0.1, 0.25 + 0.15 * Math.max(0, a)); }
    corpo.position.y = (Math.abs(Math.cos(fase)) - 1) * 0.022 * k; corpo.rotation.z = Math.sin(fase) * 0.025 * k; tronco.rotation.y = a * 0.14; tronco.rotation.z = -Math.sin(fase) * 0.03 * k;
    if (root.bolsa) root.bolsa.rotation.z = Math.sin(fase * 2) * 0.08 * k;
  };
  root.parado = () => { pernas.forEach(p => { p.rotation.set(0, 0, 0); p.joe.rotation.x = 0; p.pe.rotation.x = 0; }); corpo.position.y = 0; corpo.rotation.z = 0; tronco.rotation.set(0, 0, 0); };
  root.respira = (T, k = 1) => { tronco.scale.set(1, 1 + 0.008 * k * Math.sin(T * 1.7), 1 + 0.014 * k * Math.sin(T * 1.7)); argolas.forEach((a, i) => a.rotation.x = 0.12 * Math.sin(T * 2.1 + i)); };
  root.olhaPara = (p, lim = 1.0, tr = 0.25) => {
    const w = new THREE.Vector3(); root.getWorldPosition(w); const ang = Math.atan2(p[0] - w.x, p[2] - w.z) - root.rotation.y; let a = ((ang + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    a = clamp(a, -lim - 0.6, lim + 0.6); const at = clamp(a * tr, -0.5, 0.5); tronco.rotation.y = at; cab.rotation.y = clamp(a - at, -lim, lim);
    const dy = p[1] - (w.y + 1.5 * S), dist = Math.hypot(p[0] - w.x, p[2] - w.z); cab.rotation.x = clamp(-Math.atan2(dy, dist), -0.55, 0.55);
  };
  root.vira = (p) => { root.rotation.y = Math.atan2(p[0] - root.position.x, p[2] - root.position.z); };
  // posição mundo dos olhos (para mirar a câmera)
  root.olhos = () => { const v = new THREE.Vector3(0, H0 + 0.138, 0.06); cab.updateMatrixWorld(true); return cab.localToWorld(v).toArray(); };
  root.traverse(x => { if (x.isMesh) x.frustumCulled = false; });
  return root;
}

// ---------------- figurantes masculinos (gente.js do Turno com camisas próprias) ----------------
const camisaLisa = (cor, det = {}) => (manga) => tex(128, 128, (g, w, h) => {
  g.fillStyle = cor; g.fillRect(0, 0, w, h); const R = rnd(det.seed ?? 4);
  for (let i = 0; i < 300; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'; g.fillRect(R() * w | 0, R() * h | 0, 2, 1); }
  for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(R() * w | 0, 70 + R() * 50 | 0, 12, 1); }
  sombraU(g, w, h, 0.5);
  if (det.faixa) { g.fillStyle = det.faixa; g.fillRect(0, manga ? 60 : 78, w, 8); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, manga ? 62 : 80, w, 2); }
  if (manga) return;
  if (det.terno) {   // paletó escuro aberto, camisa branca e gravata
    g.fillStyle = '#e8e6e0'; g.beginPath(); g.moveTo(46, 0); g.lineTo(64, 70); g.lineTo(82, 0); g.fill();
    g.fillStyle = det.gravata; g.beginPath(); g.moveTo(61, 4); g.lineTo(67, 4); g.lineTo(69, 58); g.lineTo(64, 66); g.lineTo(59, 58); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(46, 0); g.lineTo(64, 70); g.lineTo(82, 0); g.stroke(); g.fillStyle = '#c8c4bc'; g.fillRect(63, 84, 2, 2); g.fillRect(63, 100, 2, 2);
  }
  if (det.gola) { g.fillStyle = det.gola; g.fillRect(0, 0, w, 5); g.beginPath(); g.arc(64, 0, 13, 0, Math.PI); g.fill(); }
  if (det.estampa) { g.fillStyle = det.estampa; g.fillRect(50, 34, 28, 22); g.fillStyle = cor; g.fillRect(54, 38, 20, 4); }
});
export const TERNO = { pele: '#c49478', cabelo: '#2a2420', sobr: '#201a16', olho: '#2a2018', labio: '#7a4e44', camisa: '#2c3038', texCamisa: camisaLisa('#2c3038', { terno: true, gravata: '#5a2a3a' }), manga: 'longa', calca: '#262a30', sapato: '#121212', bone: null, larg: 1.02, barriga: 0.02, alt: 1.8, fixos: true, olheira: 'rgba(40,40,50,.5)' };
export const GARI = { pele: '#8e5a3a', cabelo: '#141010', sobr: '#120c08', olho: '#1a120c', labio: '#5a3028', camisa: '#e0661e', texCamisa: camisaLisa('#e0661e', { faixa: '#d8d8c8' }), manga: 'longa', calca: '#d85a18', sapato: '#1a1a1a', bone: '#d85a18', boneFrente: '#d85a18', boneTras: false, larg: 1.05, barriga: 0.03, alt: 1.74, fixos: true };
export const DIEGO = { pele: '#b07a56', cabelo: '#1a120c', sobr: '#160e08', olho: '#2a1a10', labio: '#7a4a3c', camisa: '#3a5a7a', texCamisa: camisaLisa('#3a5a7a', { gola: '#2e4a66' }), polo: true, calca: '#2a3448', sapato: '#2a1e16', bone: null, larg: 1.08, alt: 1.8, barba: 'rgba(30,20,15,.6)', fixos: true };
const PED_CORES = ['#3a6a9a', '#8a3a5a', '#2a2a2e', '#5a7a3a', '#c8b070', '#6a4a8a', '#e8e4dc', '#3a8a8a', '#7a5a3a'];
const PELES = ['#c08a62', '#8e5a3a', '#d8b090', '#a87050', '#6a4028', '#e0bca0'];
export function pedestre(i) {
  const R = rnd(100 + i * 7), c = PED_CORES[(R() * PED_CORES.length) | 0], pele = PELES[(R() * PELES.length) | 0];
  return { pele, cabelo: R() < 0.2 ? null : '#1a1410', grisalho: R() < 0.2 ? '#8a8680' : null, sobr: '#1a120c', olho: '#2a1a10', labio: '#7a4a3c', camisa: c, texCamisa: camisaLisa(c, { gola: R() < 0.5 ? c : null, estampa: R() < 0.3 ? '#e8e0d0' : null, seed: i }), polo: R() < 0.6, manga: R() < 0.4 ? 'longa' : 'curta',
    calca: ['#26304a', '#3a3a3e', '#4a5a6a', '#2a2420', '#7a7060'][(R() * 5) | 0], sapato: ['#1a1a1a', '#e8e8e0', '#3a2a1a'][(R() * 3) | 0], bone: R() < 0.25 ? ['#2a3a5a', '#1a1a1a', '#e8e8e0'][(R() * 3) | 0] : null, boneTras: R() < 0.5, larg: 0.9 + R() * 0.25, barriga: R() * 0.05, alt: 1.62 + R() * 0.24 };
}
export { pessoa };

// ---------------- sombra de contato (blob) — pés sempre "no chão" ----------------
let TB = null;
export function sombra(r = 0.32, a = 0.55) {
  if (!TB) TB = tex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.6, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 1.6), new THREE.MeshBasicMaterial({ map: TB, transparent: true, opacity: a, depthWrite: false, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.012; m.frustumCulled = false; return m;
}
