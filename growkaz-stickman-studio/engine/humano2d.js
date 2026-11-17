// engine/humano2d.js — rig 2D HUMANIZADO (cartoon vetorial): novo padrão de personagem do canal.
// Mesmo espaço local e mesmas POSES do engine/rig2d.js (pés em y=0, cima = -y, olha para +x, altura ≈ 250 com s = 1).
//   drawHumano(g, { x, y, s, facing, pose, rot, expr, talk, look, blink, t, emote, outfit, dim, alpha, front, mao, prop, shadow, luz, contorno })
//   bigHumano(g, cx, cy, r, { ...mesmas opções })      close de cabeça + ombros (r = raio da cabeça em px lógicos)
//   headPosHumano(o) -> [x, y, r]                       centro da cabeça no mundo (balões, emotes, setas)
// outfit = { pele, cabelo:{tipo,cor}, roupa:{tipo,cor,cor2,manga}, calca:{tipo,cor}|cor, sapato:{tipo,cor}|cor,
//            oculos:'redondo'|'quadrado'|'escuro', barba:'cheia'|'cavanhaque'|'rala', bigode:'cheio'|'fino', barbaCor,
//            chapeu:{tipo,cor}, blush, brincos:cor, mochila:cor, faixa:true|[c1,c2], nariz:'bola'|'reto'|'nenhum',
//            corpo:'medio'|'magro'|'gordo'|'forte'|'mulher', kid, protagonista: true|'A'|'B' }
//  roupa.tipo: camiseta, polo, moletom, sueter, jaqueta, casaco (cardigan), terno, camisa, avental, vestido, tunica, jaleco, nenhuma
//  calca.tipo: calca, jeans, bermuda, saia, nenhuma      sapato.tipo: tenis, sapato, bota, sandalia
//  cabelo.tipo: curto, espetado, cacheado, coque, rabo, longo, afro, calvo, careca, nenhum
//  chapeu.tipo: bone, chef, boina, touca, palha
// REGRA DO CANAL: só o protagonista usa vermelho (boné #d8342b). Em qualquer outro personagem cores vermelhas são trocadas.
import { clamp, lerp, mix, rgb } from './core.js';
import { POSES, EXPR, emote } from './rig2d.js';

export const INK = '#2b3347';   // azul-marinho (estilo Aprendendo com Vitinho)
export const VERMELHO_PROTAGONISTA = '#d8342b';
export const PELES = { branca: '#ffffff', clara: '#f7d6bd', rosada: '#f1c0a2', media: '#e2a97f', morena: '#c98b5e', parda: '#a8703f', escura: '#7d4a2b', negra: '#5b3420' };
const SOMBRA = '#2a2452';          // a sombra (cel) puxa para um azul-violeta: cores vivas, sem "sujar"
const BOCA = '#5a1a2b', LINGUA = '#e8707e', LAGRIMA = '#8fd3ff';

// ---------------------------------------------------------------- estado por desenho
let DIM = 0, OLW = 4, LX = -2, LY = -1.6, EYOFF = 0;
const C = (c) => (DIM ? mix(c, '#151726', DIM) : c);
const esc = (c, k = 0.22) => mix(c, SOMBRA, k);
const cla = (c, k = 0.3) => mix(c, '#ffffff', k);
const claro = (c) => { const [r, g, b] = rgb(c); return r + g + b > 700; };

// ---------------------------------------------------------------- geometria
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = (a) => Math.hypot(a[0], a[1]) || 1e-6, nrm = (a) => mul(a, 1 / len(a)), L = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
// cápsula afilada a(ra) -> b(rb) como subpath (todos no mesmo sentido: união com nonzero)
function cap(g, a, b, ra, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
  if (d <= Math.abs(ra - rb) + 0.01) { const [c, r] = ra > rb ? [a, ra] : [b, rb]; g.moveTo(c[0] + r, c[1]); g.arc(c[0], c[1], r, 0, Math.PI * 2); return; }
  const th = Math.atan2(dy, dx), ph = Math.acos(clamp((ra - rb) / d, -1, 1));
  g.moveTo(a[0] + ra * Math.cos(th + ph), a[1] + ra * Math.sin(th + ph));
  g.arc(a[0], a[1], ra, th + ph, th + Math.PI * 2 - ph);
  g.arc(b[0], b[1], rb, th - ph, th + ph);
  g.closePath();
}
const ell = (g, x, y, rx, ry, rot = 0) => { g.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
// forma com contorno + preenchimento chapado + 1 camada de sombra (cel) do lado oposto à luz
function shape(g, build, fill, k = 1, amt = 0.2, line = true) {
  g.beginPath(); build();
  if (line) { g.lineWidth = OLW; g.strokeStyle = C(INK); g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
  g.fillStyle = C(fill); g.fill();
  if (amt > 0) { g.save(); g.clip(); g.fillStyle = C(esc(fill, amt)); g.fill(); g.translate(LX * k, LY * k); g.beginPath(); build(); g.fillStyle = C(fill); g.fill(); g.restore(); }
}
function stroke(g, build, w, col, cap0 = 'round') { g.beginPath(); build(); g.lineWidth = w; g.strokeStyle = C(col); g.lineCap = cap0; g.lineJoin = 'round'; g.stroke(); }

// ---------------------------------------------------------------- cores / regra do vermelho
function hsl(c) { const [r, g, b] = rgb(c).map((v, i) => (i < 3 ? v / 255 : v)); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return [h, s, l]; }
export const ehVermelho = (c) => { if (!c || typeof c !== 'string') return false; const [h, s, l] = hsl(c); return (h <= 16 || h >= 344) && s > 0.45 && l > 0.18 && l < 0.78; };
const semVermelho = (c, troca) => (ehVermelho(c) ? troca : c);

const CORPOS = { medio: { sw: 19, ww: 16.5, hw: 17.5 }, magro: { sw: 16.5, ww: 13.5, hw: 14.5 }, gordo: { sw: 21, ww: 25, hw: 22 }, forte: { sw: 23.5, ww: 17.5, hw: 17.5 }, mulher: { sw: 16.5, ww: 13.5, hw: 17.5 } };
const MANGA = { camiseta: 'curta', polo: 'curta', vestido: 'curta', avental: 'curta', moletom: 'longa', sueter: 'longa', jaqueta: 'longa', casaco: 'longa', terno: 'longa', camisa: 'longa', jaleco: 'longa', tunica: 'larga', nenhuma: null };

// normaliza o outfit (aceita atalhos e também o outfit antigo do rig2d: top/head/color/legs)
export function normOutfit(of0 = {}) {
  let of = { ...of0 };
  if (!of.roupa && !of.pele && !of.protagonista && ('top' in of || 'head' in of)) {      // outfit legado do rig2d
    const topMap = { hoodie: 'moletom', tshirt: 'camiseta', jersey: 'camiseta', labcoat: 'jaleco', trench: 'jaqueta', suit: 'terno', dress: 'vestido', vestido: 'vestido', tunica: 'tunica', tracksuit: 'moletom', none: 'nenhuma' };
    if (of.head === 'cap' && of.headColor === VERMELHO_PROTAGONISTA) return normOutfit({ protagonista: of.top && of.top !== 'none' ? 'A' : 'B' });
    const hairMap = { ponytail: 'rabo', bun: 'coque', curly: 'cacheado', spiky: 'espetado', none: 'curto' };
    const hatMap = { cap: 'bone', capBack: 'bone', beanie: 'touca', fedora: 'palha', chapeu: 'palha' };
    of = { roupa: { tipo: topMap[of.top] || 'camiseta', cor: of.color, cor2: of.color2 }, calca: of.legs ? { tipo: 'calca', cor: of.legs } : undefined,
      cabelo: hairMap[of.head] ? { tipo: hairMap[of.head], cor: of.headColor } : undefined, chapeu: hatMap[of.head] ? { tipo: hatMap[of.head], cor: of.headColor } : undefined,
      oculos: of.face === 'glasses' ? 'redondo' : of.face === 'sunglasses' ? 'escuro' : undefined, kid: of.kid };
  }
  const prot = of.protagonista;
  if (prot) {   // identidade FIXA do protagonista: pele branca, boné vermelho, sem cabelo, sem acessórios no rosto
    const B = prot === 'B';
    return { corpo: 'medio', ...of, pele: '#ffffff', cabelo: { tipo: 'nenhum' }, chapeu: { tipo: 'bone', cor: VERMELHO_PROTAGONISTA }, oculos: null, barba: null, bigode: null, brincos: null,
      roupa: B ? { tipo: 'nenhuma' } : { tipo: 'camiseta', cor: '#5d6675', ...(typeof of.roupa === 'object' ? of.roupa : {}) },
      calca: B ? { tipo: 'nenhuma' } : { tipo: 'jeans', cor: '#3c5a88', ...(typeof of.calca === 'object' ? of.calca : {}) },
      sapato: B ? { tipo: 'tenis', cor: '#ffffff', sola: '#c9ccd4' } : { tipo: 'tenis', cor: '#f4f4f2', sola: '#c9ccd4', ...(typeof of.sapato === 'object' ? of.sapato : {}) },
      sobrancelha: INK, _prot: true };
  }
  const o = { corpo: 'medio', pele: PELES.media, ...of };
  o.cabelo = typeof o.cabelo === 'string' ? { tipo: o.cabelo } : { tipo: 'curto', ...(o.cabelo || {}) };
  o.cabelo.cor = semVermelho(o.cabelo.cor || '#3a271c', '#5a2e1c');
  o.roupa = typeof o.roupa === 'string' ? { tipo: o.roupa } : { tipo: 'camiseta', ...(o.roupa || {}) };
  o.roupa.cor = semVermelho(o.roupa.cor || '#4f86c6', '#3a6ea5'); if (o.roupa.cor2) o.roupa.cor2 = semVermelho(o.roupa.cor2, '#e9b949');
  const saiaDef = ['vestido', 'tunica'].includes(o.roupa.tipo) ? 'nenhuma' : 'calca';
  o.calca = typeof o.calca === 'string' ? { tipo: 'calca', cor: o.calca } : { tipo: saiaDef, cor: '#38466b', ...(o.calca || {}) };
  o.calca.cor = semVermelho(o.calca.cor, '#38466b');
  o.sapato = typeof o.sapato === 'string' ? { tipo: 'sapato', cor: o.sapato } : { tipo: 'sapato', cor: '#2e2a33', ...(o.sapato || {}) };
  o.sapato.cor = semVermelho(o.sapato.cor, '#2e2a33');
  if (o.chapeu) { o.chapeu = typeof o.chapeu === 'string' ? { tipo: o.chapeu } : { ...o.chapeu }; o.chapeu.cor = semVermelho(o.chapeu.cor || (o.chapeu.tipo === 'chef' ? '#ffffff' : '#2f5d9e'), '#2f5d9e'); }
  if (o.mochila) o.mochila = semVermelho(o.mochila, '#3f7f5a');
  if (o.brincos) o.brincos = semVermelho(o.brincos, '#f2c94c');
  return o;
}

// ---------------------------------------------------------------- esqueleto derivado das POSES do rig2d
function esqueleto(p, of, front) {
  const B = CORPOS[of.corpo] || CORPOS.medio;
  const HR = 30 * (of.kid ? 1.14 : 1) * (of.cabeca || 1);
  const d = nrm(sub(p.hip, p.sh)), n = [d[1], -d[0]], TL = len(sub(p.hip, p.sh));
  const P = (u, v) => [p.sh[0] + n[0] * u + d[0] * v, p.sh[1] + n[1] * u + d[1] * v];
  const hv = sub(p.head, p.sh); const hc = add(p.sh, add(mul(nrm(hv), Math.max(len(hv) * 1.06, 33) + (of.kid ? 4 : 0)), [0, -2]));
  const tilt = clamp((Math.atan2(hv[1], hv[0]) + Math.PI / 2) * 0.6, -0.5, 0.5);
  const ins = front ? 4.5 : 6.5, oF = sub(P(B.sw - ins, 7.5), p.sh), oB = sub(P(-(B.sw - ins), 7.5), p.sh);
  const lw = Math.min(B.hw - 8, 9);
  const jF = add(p.hip, mul(n, lw)), jB = add(p.hip, mul(n, -lw));
  const leg = (j, k, f, dx) => { const kk = [k[0] + dx, k[1]], ff = [f[0] + dx, f[1]]; const ank = add(ff, mul(nrm(sub(kk, ff)), 8)); return { j, k: kk, f: ff, a: ank }; };
  return { B, HR, d, n, TL, P, hc, tilt, front,
    aF: add(p.sh, oF), eF: add(p.eF, oF), hF: add(p.hF, oF), aB: add(p.sh, oB), eB: add(p.eB, oB), hB: add(p.hB, oB),
    LF: leg(jF, p.kF, p.fF, lw), LB: leg(jB, p.kB, p.fB, -lw) };
}

// ---------------------------------------------------------------- respiração / piscada automáticas
function respira(p, t, seed) {
  const b = Math.sin(t * 2.1 + seed) * 1.2, s = Math.sin(t * 0.9 + seed * 2) * 0.9; const q = { ...p };
  for (const k of ['head', 'sh', 'eF', 'hF', 'eB', 'hB']) q[k] = [p[k][0] + s * (k === 'head' ? 1.1 : 0.5), p[k][1] + b * (k === 'head' ? 1.1 : 1)]; return q;
}
const piscando = (t, seed) => { const c = (t + seed * 1.37) % 3.7; return c < 0.11 || (seed % 3 === 0 && c > 0.3 && c < 0.38); };

// ---------------------------------------------------------------- API principal
// transparência sem "ver por dentro" (braço por cima do tronco etc.): desenha opaco numa camada e compõe com alpha
let _camada = null;
export function drawHumano(g, o = {}) {
  if (o.alpha != null && o.alpha < 0.999 && g.canvas && typeof document !== 'undefined') {
    if (o.alpha <= 0.001) return;
    const W = g.canvas.width, H = g.canvas.height;
    if (!_camada) _camada = document.createElement('canvas');
    if (_camada.width !== W || _camada.height !== H) { _camada.width = W; _camada.height = H; }
    const c2 = _camada.getContext('2d'); c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, W, H); c2.setTransform(g.getTransform());
    const busy = _camada; _camada = null;                      // reentrância (ex.: humano dentro de humano)
    drawHumano(c2, { ...o, alpha: null });
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= o.alpha; g.drawImage(busy, 0, 0); g.restore(); _camada = busy; return;
  }
  const of = normOutfit(o.outfit);
  let p = o.pose || POSES.stand; if (typeof p === 'string') p = POSES[p] || POSES.stand;
  const s = (o.s ?? 1) * (of.kid ? 0.72 : 1), f = o.facing ?? 1, t = o.t, seed = Math.abs(Math.round((o.x || 0) * 0.37 + (o.y || 0) * 0.11)) % 97;
  if (t != null && o.breathe !== false) p = respira(p, t, seed);
  const blink = o.blink ?? (t != null ? piscando(t, seed) : false);
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  DIM = o.dim ? (o.dim === true ? 0.42 : o.dim) : 0; OLW = 6.5 * (o.contorno ?? 1);
  const luz = o.luz ?? -1; LX = 2.2 * luz * f; LY = -1.4;
  if (o.shadow !== false && !o.rot) { g.fillStyle = 'rgba(20,18,40,.22)'; g.beginPath(); g.ellipse(o.x + 2 * s * f, o.y + 1, 38 * s, 7 * s, 0, 0, Math.PI * 2); g.fill(); }
  g.translate(o.x, o.y); g.scale(f * s, s);
  if (o.rot) { g.translate(p.hip[0], p.hip[1]); g.rotate(o.rot); g.translate(-p.hip[0], -p.hip[1]); }
  const sk = esqueleto(p, of, !!o.front);
  corpo(g, o, p, of, sk, blink, t ?? 0);
  g.restore();
  if (o.emote) { const [hx, hy, hr] = headPosHumano(o); emote(g, hx, hy, hr, o.emote, t ?? 0); }
  DIM = 0;
}

export function headPosHumano(o) {
  const of = normOutfit(o.outfit); let p = o.pose || POSES.stand; if (typeof p === 'string') p = POSES[p] || POSES.stand;
  const s = (o.s ?? 1) * (of.kid ? 0.72 : 1), f = o.facing ?? 1, sk = esqueleto(p, of, !!o.front); let [x, y] = sk.hc;
  if (o.rot) { const [hx, hy] = p.hip, c = Math.cos(o.rot), sn = Math.sin(o.rot); [x, y] = [hx + (x - hx) * c - (y - hy) * sn, hy + (x - hx) * sn + (y - hy) * c]; }
  return [o.x + x * f * s, o.y + y * s, sk.HR * s];
}

// close: cabeça + ombros, de frente. r = raio da cabeça (px lógicos). Pernas ficam fora do quadro.
export function bigHumano(g, cx, cy, r, o = {}) {
  const of = normOutfit(o.outfit), p = o.pose || POSES.stand, sk = esqueleto(typeof p === 'string' ? POSES[p] : p, of, true);
  const s = r / sk.HR / (of.kid ? 0.72 : 1), f = o.facing ?? 1;
  g.save(); g.beginPath(); g.rect(cx - r * 4, cy - r * 4, r * 8, r * (4 + (o.corte ?? 2.3))); g.clip();
  drawHumano(g, { front: true, shadow: false, contorno: 0.8, ...o, outfit: o.outfit, pose: p, s, x: cx - sk.hc[0] * f * s * (of.kid ? 0.72 : 1), y: cy - sk.hc[1] * s * (of.kid ? 0.72 : 1), emote: null });
  g.restore();
  if (o.emote) emote(g, cx, cy, r, o.emote, o.t ?? 0);
}

// ---------------------------------------------------------------- corpo
function corpo(g, o, p, of, sk, blink, t) {
  const { P, TL, B } = sk, rp = of.roupa, tipo = rp.tipo, pele = of.pele;
  const manga = rp.manga || MANGA[tipo] || null;
  const corTorso = tipo === 'nenhuma' ? pele : tipo === 'avental' ? (rp.cor2 || '#e9e4d8') : tipo === 'jaleco' ? '#f4f4f6' : rp.cor;
  const corManga = tipo === 'avental' ? (rp.cor2 || '#e9e4d8') : tipo === 'jaleco' ? '#f4f4f6' : rp.cor;
  const torso = (sw, ww, hw, top = -2, bot = TL + 8) => () => {
    const r0 = 8, waistV = (bot - top) * 0.6 + top, bel = Math.max(0, ww - sw);
    g.moveTo(...P(0, top)); g.lineTo(...P(sw - r0, top)); g.quadraticCurveTo(...P(sw, top), ...P(sw, top + r0));
    g.quadraticCurveTo(...P(Math.max(sw, ww) + bel * 0.5, lerp(top, waistV, 0.55)), ...P(ww, waistV));
    g.quadraticCurveTo(...P(hw + bel * 0.25, lerp(waistV, bot, 0.6)), ...P(hw, bot - 5)); g.quadraticCurveTo(...P(hw, bot), ...P(hw - 6, bot));
    g.lineTo(...P(-hw + 6, bot)); g.quadraticCurveTo(...P(-hw, bot), ...P(-hw, bot - 5));
    g.quadraticCurveTo(...P(-hw - bel * 0.25, lerp(waistV, bot, 0.6)), ...P(-ww, waistV));
    g.quadraticCurveTo(...P(-Math.max(sw, ww) - bel * 0.5, lerp(top, waistV, 0.55)), ...P(-sw, top + r0)); g.quadraticCurveTo(...P(-sw, top), ...P(-sw + r0, top));
    g.closePath(); };
  const torsoMain = torso(B.sw, B.ww, B.hw);

  // 1) cabelo de trás + mochila + capuz
  cabecaFrame(g, sk, () => cabeloTras(g, of, sk.HR, sk.front ? 0 : 1, t));
  if (of.mochila && !sk.front) shape(g, () => { const a = P(-B.sw - 9, 6), b = P(-B.sw + 4, TL - 4); g.moveTo(...a); g.roundRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]) + 6, Math.abs(b[1] - a[1]), 7); }, of.mochila, 1.2);
  if (tipo === 'moletom') shape(g, () => ell(g, ...P(-3 * (sk.front ? 0 : 1), -3), 15, 9, 0), esc(rp.cor, 0.18), 1);

  // 2) braço de trás
  if (!sk.front) braco(g, o, sk, 'B', pele, manga, corManga, rp, true);
  // 3) pernas
  perna(g, sk.LB, of, true, sk); perna(g, sk.LF, of, false, sk);
  if (of.calca.tipo !== 'nenhuma' && of.calca.tipo !== 'saia') shape(g, () => cap(g, sk.LB.j, sk.LF.j, 10.5, 10.5), of.calca.cor, 1, 0.15);
  // 4) saias / barras longas (antes do tronco)
  const kAvg = L(sk.LF.k, sk.LB.k, 0.5), fAvg = L(sk.LF.f, sk.LB.f, 0.5);
  const saia = (cor, topW, hemC, hemW, onda = 0, topV = TL - 12) => shape(g, () => { const a = P(-topW, topV), b = P(topW, topV);
    g.moveTo(...a); g.lineTo(...b); g.quadraticCurveTo(hemC[0] + hemW * 0.9, lerp(b[1], hemC[1], 0.5), hemC[0] + hemW, hemC[1]);
    if (onda < 0) g.quadraticCurveTo(hemC[0], hemC[1] + 3, hemC[0] - hemW, hemC[1]);
    else for (let i = 1; i <= 4; i++) { const x = hemC[0] + hemW - (2 * hemW) * i / 4; g.quadraticCurveTo(x + hemW / 4, hemC[1] + 4 + onda, x, hemC[1]); }
    g.quadraticCurveTo(hemC[0] - hemW * 0.9, lerp(a[1], hemC[1], 0.5), a[0], a[1]); g.closePath(); }, cor, 1.4, 0.2);
  if (of.calca.tipo === 'saia') saia(of.calca.cor, B.hw - 1, add(kAvg, [0, 6]), Math.max(20, Math.abs(sk.LF.k[0] - sk.LB.k[0]) / 2 + 13));
  if (tipo === 'tunica') saia(rp.cor, B.hw, add(fAvg, [0, -9]), Math.max(24, Math.abs(sk.LF.f[0] - sk.LB.f[0]) / 2 + 15));
  if (tipo === 'jaleco') saia('#f4f4f6', B.hw + 1, L(p.hip, kAvg, 0.62), B.hw + 5, -1);
  // 5) pescoço
  shape(g, () => cap(g, P(0, 4), add(sk.hc, [0, sk.HR * 0.55]), 6.6, 6.2), pele, 0.6, 0.28);
  // 6) tronco + detalhes da roupa
  shape(g, torsoMain, corTorso, 1.8, claro(corTorso) ? 0.1 : 0.2);
  if (tipo === 'vestido') saia(rp.cor, B.ww + 0.5, add(kAvg, [0, 10]), Math.max(23, Math.abs(sk.LF.k[0] - sk.LB.k[0]) / 2 + 16), 0, TL * 0.6);
  roupaDetalhes(g, of, sk, torsoMain, p);
  // 7) braço da frente (de frente: os dois braços por cima do tronco, simétricos)
  if (sk.front) braco(g, o, sk, 'B', pele, manga, corManga, rp, false);
  braco(g, o, sk, 'F', pele, manga, corManga, rp, false);
  // 8) cabeça
  cabecaFrame(g, sk, () => cabeca(g, o, of, sk, blink, t));
  if (o.prop) propHumano(g, o.prop, sk);
}

function roupaDetalhes(g, of, sk, torsoMain, p) {
  const { P, TL, B } = sk, rp = of.roupa, tipo = rp.tipo, c = rp.cor, c2 = rp.cor2, w = 1.6, fr = sk.front ? 0 : 1;
  const linha = (pts, col = INK, lw = w) => stroke(g, () => { g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); }, lw, col);
  const curva = (a, cp, b, col = INK, lw = w) => stroke(g, () => { g.moveTo(...a); g.quadraticCurveTo(...cp, ...b); }, lw, col);
  const cx = 2.5 * fr;   // centro da frente do tronco (em 3/4 puxa para o lado que olha)
  const clipTorso = (fn) => { g.save(); g.beginPath(); torsoMain(); g.clip(); fn(); g.restore(); };
  const barra = (col) => clipTorso(() => { shape(g, () => { const a = P(-B.hw - 4, TL + 1), b = P(B.hw + 4, TL + 1); g.moveTo(...a); g.lineTo(...b); g.lineTo(...P(B.hw + 4, TL + 12)); g.lineTo(...P(-B.hw - 4, TL + 12)); g.closePath(); }, col, 0, 0); });
  switch (tipo) {
    case 'camiseta': curva(P(cx - 8, -2), P(cx, 8), P(cx + 8, -2)); break;
    case 'polo': shape(g, () => { g.moveTo(...P(cx - 9, -3)); g.lineTo(...P(cx - 1, 9)); g.lineTo(...P(cx - 3, -3)); g.closePath(); g.moveTo(...P(cx + 9, -3)); g.lineTo(...P(cx + 1, 9)); g.lineTo(...P(cx + 3, -3)); g.closePath(); }, cla(c, 0.25), 0, 0);
      linha([P(cx, 6), P(cx, 20)]); for (const v of [11, 17]) shape(g, () => ell(g, ...P(cx + 1.6, v), 1.2, 1.2), '#ffffff', 0, 0); break;
    case 'moletom': { curva(P(cx - 9, -2), P(cx, 7), P(cx + 9, -2));
      linha([P(cx - 3, 4), P(cx - 4, 18)], cla(c, 0.6), 1.8); linha([P(cx + 3, 4), P(cx + 4, 17)], cla(c, 0.6), 1.8);
      shape(g, () => { g.moveTo(...P(cx - 12, TL - 18)); g.lineTo(...P(cx + 12, TL - 18)); g.lineTo(...P(cx + 15, TL - 2)); g.lineTo(...P(cx - 15, TL - 2)); g.closePath(); }, esc(c, 0.08), 0, 0);
      barra(esc(c, 0.15)); break; }
    case 'sueter': shape(g, () => cap(g, P(cx - 8, -1), P(cx + 8, -1), 3.6, 3.6), c2 || esc(c, 0.15), 0, 0); barra(c2 || esc(c, 0.15));
      for (let i = -3; i <= 3; i++) linha([P(cx + i * 4.5, TL + 2), P(cx + i * 4.5, TL + 8)], esc(c, 0.35), 1); break;
    case 'jaqueta': shape(g, () => { g.moveTo(...P(cx - 6, -2)); g.lineTo(...P(cx + 6, -2)); g.lineTo(...P(cx + 4, TL + 8)); g.lineTo(...P(cx - 4, TL + 8)); g.closePath(); }, c2 || '#f2efe6', 0, 0.1);
      linha([P(cx - 6, -2), P(cx - 4, TL + 8)]); linha([P(cx + 6, -2), P(cx + 4, TL + 8)]);
      shape(g, () => { g.moveTo(...P(cx - 6, -3)); g.lineTo(...P(cx - 14, -3)); g.lineTo(...P(cx - 6, 14)); g.closePath(); g.moveTo(...P(cx + 6, -3)); g.lineTo(...P(cx + 14, -3)); g.lineTo(...P(cx + 6, 14)); g.closePath(); }, esc(c, 0.12), 0, 0);
      barra(esc(c, 0.18)); break;
    case 'casaco': shape(g, () => { g.moveTo(...P(cx - 9, -2)); g.lineTo(...P(cx + 9, -2)); g.lineTo(...P(cx, 22)); g.closePath(); }, c2 || '#f6efe2', 0, 0);
      linha([P(cx - 9, -2), P(cx, 22), P(cx + 9, -2)]); linha([P(cx, 22), P(cx, TL + 8)]);
      for (const v of [28, 40, 52]) shape(g, () => ell(g, ...P(cx + 3, v), 2.2, 2.2), esc(c, 0.4), 0, 0); break;
    case 'terno': shape(g, () => { g.moveTo(...P(cx - 9, -2)); g.lineTo(...P(cx + 9, -2)); g.lineTo(...P(cx, 30)); g.closePath(); }, '#f7f7fa', 0, 0);
      shape(g, () => { g.moveTo(...P(cx - 2.6, 0)); g.lineTo(...P(cx + 2.6, 0)); g.lineTo(...P(cx + 3.6, 21)); g.lineTo(...P(cx, 27)); g.lineTo(...P(cx - 3.6, 21)); g.closePath(); }, c2 || '#2f6fb0', 0.4, 0.15);
      shape(g, () => ell(g, ...P(cx, 1.5), 3.2, 2.6), esc(c2 || '#2f6fb0', 0.1), 0, 0);
      linha([P(cx - 9, -2), P(cx - 3, 14), P(cx, 30)]); linha([P(cx + 9, -2), P(cx + 3, 14), P(cx, 30)]); linha([P(cx, 30), P(cx, TL + 8)]);
      shape(g, () => ell(g, ...P(cx + 2.5, 40), 1.8, 1.8), esc(c, 0.4), 0, 0); break;
    case 'camisa': shape(g, () => { g.moveTo(...P(cx - 9, -3)); g.lineTo(...P(cx - 1, 7)); g.lineTo(...P(cx - 6, 3)); g.closePath(); g.moveTo(...P(cx + 9, -3)); g.lineTo(...P(cx + 1, 7)); g.lineTo(...P(cx + 6, 3)); g.closePath(); }, cla(c, 0.3), 0, 0);
      linha([P(cx, 5), P(cx, TL + 8)], esc(c, 0.3), 1.2); for (const v of [14, 26, 38, 50]) shape(g, () => ell(g, ...P(cx + 2, v), 1.2, 1.2), '#ffffff', 0, 0);
      shape(g, () => { const a = P(cx + 6, 13); g.moveTo(...a); g.lineTo(...P(cx + 13, 13)); g.lineTo(...P(cx + 13, 20)); g.lineTo(...P(cx + 6, 20)); g.closePath(); }, esc(c, 0.06), 0, 0); break;
    case 'jaleco': shape(g, () => { g.moveTo(...P(cx - 7, -2)); g.lineTo(...P(cx + 7, -2)); g.lineTo(...P(cx + 1, 26)); g.lineTo(...P(cx - 1, 26)); g.closePath(); }, c2 || c || '#7fb3e0', 0, 0);
      linha([P(cx - 9, -3), P(cx - 2, 16), P(cx, 28)]); linha([P(cx + 9, -3), P(cx + 2, 16), P(cx, 28)]); linha([P(cx, 28), P(cx, TL + 8)], '#b9bcc8', 1.4);
      shape(g, () => { const a = P(cx + 7, 16); g.moveTo(...a); g.lineTo(...P(cx + 14, 16)); g.lineTo(...P(cx + 14, 23)); g.lineTo(...P(cx + 7, 23)); g.closePath(); }, '#e9e9ee', 0, 0);
      linha([P(cx + 9, 15), P(cx + 9, 22)], '#3a6fb0', 1.6); break;
    case 'vestido': curva(P(cx - 9, -2), P(cx, 9), P(cx + 9, -2));
      if (c2) shape(g, () => { const a = P(-B.ww - 1, 42), b = P(B.ww + 1, 42); g.moveTo(...a); g.lineTo(...b); g.lineTo(...P(B.ww + 1, 47)); g.lineTo(...P(-B.ww - 1, 47)); g.closePath(); }, c2, 0, 0); break;
    case 'tunica': curva(P(cx - 9, -2), P(cx, 10), P(cx + 9, -2));
      shape(g, () => { const a = P(-B.hw - 1, TL - 14), b = P(B.hw + 1, TL - 14); g.moveTo(...a); g.lineTo(...b); g.lineTo(...P(B.hw + 1, TL - 7)); g.lineTo(...P(-B.hw - 1, TL - 7)); g.closePath(); }, c2 || '#e8c55a', 0.6, 0.15); break;
    case 'avental': { const ac = rp.cor || '#ffffff', kAvg = L(sk.LF.k, sk.LB.k, 0.5);
      curva(P(cx - 8, -2), P(cx, 8), P(cx + 8, -2));
      linha([P(cx - 8, 2), P(cx - 9, 14)], esc(ac, 0.15), 2.4); linha([P(cx + 8, 2), P(cx + 9, 14)], esc(ac, 0.15), 2.4);
      shape(g, () => { g.moveTo(...P(cx - 10, 14)); g.lineTo(...P(cx + 10, 14)); g.lineTo(...P(cx + 11, TL - 22)); g.lineTo(...P(B.ww + 1, TL - 18));
        g.lineTo(kAvg[0] + cx + 18, kAvg[1] + 2); g.quadraticCurveTo(kAvg[0] + cx, kAvg[1] + 6, kAvg[0] + cx - 18, kAvg[1] + 2); g.lineTo(...P(-B.ww - 1, TL - 18)); g.lineTo(...P(cx - 11, TL - 22)); g.closePath(); }, ac, 1.4, 0.16);
      linha([P(-B.ww, TL - 19), P(B.ww, TL - 19)], esc(ac, 0.25), 1.4);
      shape(g, () => { const a = P(cx - 8, TL + 2); g.moveTo(...a); g.lineTo(...P(cx + 8, TL + 2)); g.lineTo(...P(cx + 8, TL + 13)); g.lineTo(...P(cx - 8, TL + 13)); g.closePath(); }, esc(ac, 0.05), 0.4, 0.1); break; }
    case 'nenhuma': if (of._prot) { /* corpo branco liso, como o boneco original */ } break;
  }
  if (of.faixa) { const [c1, c3] = Array.isArray(of.faixa) ? of.faixa : ['#1f9d55', '#f5d33a'];
    clipTorso(() => { stroke(g, () => { g.moveTo(...P(B.sw - 3, -6)); g.lineTo(...P(-B.hw - 4, TL + 6)); }, 15, INK, 'butt'); stroke(g, () => { g.moveTo(...P(B.sw - 3, -6)); g.lineTo(...P(-B.hw - 4, TL + 6)); }, 12, c1, 'butt');
      stroke(g, () => { g.moveTo(...P(B.sw - 3, -6)); g.lineTo(...P(-B.hw - 4, TL + 6)); }, 4.5, c3, 'butt'); }); }
  if (of.mochila) for (const u of sk.front ? [-1, 1] : [1]) stroke(g, () => { g.moveTo(...P(u * (B.sw - 8), -1)); g.quadraticCurveTo(...P(u * (B.sw - 5), TL * 0.35), ...P(u * (B.sw - 6), TL * 0.62)); }, 4, esc(of.mochila, 0.2));
}

// ---------------------------------------------------------------- braços e mãos
function tipoMao(o, side) {
  const m = o.mao; if (typeof m === 'string') return m; if (m && m[side]) return m[side];
  if (side === 'F' && (o.pose === POSES.point || o.pose === POSES.pointUp || o.pose === 'point' || o.pose === 'pointUp')) return 'aponta';
  if (o.pose === POSES.wave || o.pose === POSES.cheer || o.pose === 'wave' || o.pose === 'cheer') return 'aberta';
  return 'normal';
}
function braco(g, o, sk, side, pele, manga, corManga, rp, far) {
  const a = sk['a' + side], e = sk['e' + side], h = sk['h' + side];
  const pk = far ? esc(pele, 0.06) : pele, mc = corManga && far ? esc(corManga, 0.06) : corManga;
  const wrist = L(e, h, 0.86);
  shape(g, () => { cap(g, a, e, 7.2, 6.2); cap(g, e, wrist, 6.2, 5.0); }, pk, 0.9, claro(pk) ? 0.1 : 0.2);
  if (manga === 'curta') shape(g, () => cap(g, add(a, mul(nrm(sub(a, e)), 1.5)), L(a, e, 0.62), 9.2, 8.6), mc, 0.9, 0.2);
  else if (manga === 'longa') { const w = L(e, h, 0.74); shape(g, () => { cap(g, a, e, 9, 8); cap(g, e, w, 8, 7.2); }, mc, 0.9, 0.2);
    shape(g, () => cap(g, L(e, h, 0.64), w, 7.4, 7.3), rp.tipo === 'terno' ? '#f7f7fa' : esc(corManga, 0.14), 0.4, 0); }
  else if (manga === 'larga') { const w = L(e, h, 0.7), dir = nrm(sub(h, e)); shape(g, () => { cap(g, a, e, 8.6, 8.4); cap(g, e, w, 8.4, 10.5); }, mc, 0.9, 0.2); void dir; }
  mao(g, h, Math.atan2(h[1] - e[1], h[0] - e[0]), pk, tipoMao(o, side));
}
function mao(g, h, ang, pele, tipo) {
  g.save(); g.translate(h[0], h[1]); g.rotate(ang);
  const dedos = (xs) => { for (const [x0, y0, x1, y1] of xs) stroke(g, () => { g.moveTo(x0, y0); g.lineTo(x1, y1); }, 1.1, esc(pele, 0.55)); };
  switch (tipo) {
    case 'aponta':
      shape(g, () => { cap(g, [3, -2.6], [14.5, -3.4], 2.7, 2.3); ell(g, 2.5, 0.5, 6.4, 5.8); }, pele, 0.5, 0.18);
      shape(g, () => cap(g, [-0.5, -4.5], [5, -6.5], 2.6, 2.3), pele, 0.3, 0.1); dedos([[4, 1, 8.3, 1.4], [3.5, 3.6, 7.6, 4.2]]); break;
    case 'punho': shape(g, () => ell(g, 2.5, 0, 6.6, 6), pele, 0.5, 0.18); dedos([[4.5, -2.2, 8.6, -2], [4.5, 0.6, 8.9, 0.8], [4.4, 3.3, 8.2, 3.6]]); break;
    case 'aberta':
      shape(g, () => { ell(g, 2.8, 0, 6.4, 6.4); for (const [dy, l] of [[-4.5, 7], [-1.5, 8.5], [1.6, 8.2], [4.6, 6.6]]) cap(g, [5, dy], [5 + l, dy * 1.35], 2.1, 1.9); cap(g, [0, -4], [4, -11], 2.4, 2.1); }, pele, 0.5, 0.15); break;
    default:   // luva/mitten com polegar (descansada)
      shape(g, () => cap(g, [0.5, -3.5], [6.6, -8.2], 2.9, 2.5), pele, 0.3, 0.12);
      shape(g, () => { g.moveTo(-1.5, -4.8); g.quadraticCurveTo(6, -6.6, 10.4, -2.4); g.quadraticCurveTo(12.6, 1.2, 9.4, 4.2); g.quadraticCurveTo(4.5, 7.2, -1, 5); g.quadraticCurveTo(-3.4, 0, -1.5, -4.8); g.closePath(); }, pele, 0.5, 0.18);
      dedos([[6, -1.2, 10.8, -0.6], [5.6, 1.8, 10, 2.5]]);
  }
  g.restore();
}

// ---------------------------------------------------------------- pernas e sapatos
function perna(g, Lg, of, far, sk) {
  const ct = of.calca.tipo, cc = far ? esc(of.calca.cor || '#38466b', 0.08) : of.calca.cor, pele = far ? esc(of.pele, 0.06) : of.pele;
  const { j, k, a } = Lg;
  if (ct === 'calca' || ct === 'jeans') {
    shape(g, () => { cap(g, j, k, 10, 8.4); cap(g, k, a, 8.4, 7.4); }, cc, 1, 0.18);
    if (ct === 'jeans') { stroke(g, () => { const m = L(j, k, 0.25), m2 = L(k, a, 0.9); g.moveTo(m[0] + 4, m[1]); g.lineTo(k[0] + 4, k[1]); g.lineTo(m2[0] + 3, m2[1]); }, 0.9, cla(cc, 0.35)); }
    shape(g, () => cap(g, L(k, a, 0.86), a, 7.6, 7.6), esc(cc, 0.12), 0.3, 0);
  } else {
    shape(g, () => { cap(g, j, k, 8.4, 6.9); cap(g, k, a, 6.9, 5.4); }, pele, 0.9, 0.2);
    if (ct === 'bermuda') shape(g, () => cap(g, j, L(j, k, 1.08), 10.2, 9.2), cc, 1, 0.18);
  }
  sapato(g, Lg, of.sapato, far, sk.front);
}
function sapato(g, Lg, sp, far, front) {
  const { k, f } = Lg, cor = far ? esc(sp.cor, 0.08) : sp.cor, sola = sp.sola || esc(sp.cor, 0.4);
  const ang = clamp(Math.atan2(f[1] - k[1], f[0] - k[0]) - Math.PI / 2, -0.7, 0.7) * (f[1] < -2 ? 1 : 0.25);
  g.save(); g.translate(f[0], f[1]); g.rotate(-ang);
  const corpo = front
    ? () => { g.moveTo(-9, 0); g.quadraticCurveTo(-10, -11, 0, -11); g.quadraticCurveTo(10, -11, 9, 0); g.closePath(); }
    : sp.tipo === 'bota'
      ? () => { g.moveTo(-6, 0); g.lineTo(13, 0); g.quadraticCurveTo(18, 0, 17.5, -4.5); g.quadraticCurveTo(16, -9, 7, -10); g.lineTo(5, -19); g.lineTo(-6, -19); g.quadraticCurveTo(-8, -6, -6, 0); g.closePath(); }
      : () => { g.moveTo(-6, 0); g.lineTo(13.5, 0); g.quadraticCurveTo(18.5, 0, 18, -4); g.quadraticCurveTo(16.5, -9, 7.5, -10.2); g.lineTo(-2, -12); g.quadraticCurveTo(-8, -12, -8, -6); g.quadraticCurveTo(-8, 0, -6, 0); g.closePath(); };
  shape(g, corpo, cor, 0.5, 0.18);
  g.save(); g.beginPath(); corpo(); g.clip(); g.fillStyle = C(sola); g.fillRect(-12, -3.2, 34, 6); g.restore();
  stroke(g, () => { g.moveTo(-9, -3.2); g.lineTo(20, -3.2); }, 1.2, INK);
  if (sp.tipo === 'tenis' && !front) stroke(g, () => { g.moveTo(1, -8); g.lineTo(9, -6.5); }, 1.2, esc(cor, 0.4));
  g.restore();
}

// ---------------------------------------------------------------- cabeça
function cabecaFrame(g, sk, fn) { g.save(); g.translate(sk.hc[0], sk.hc[1]); g.rotate(sk.tilt); fn(); g.restore(); }
const LIDS = { angry: [0.3, 1], determined: [0.32, 1], furious: [0.26, 1], suspicious: [0.5, 0], sleepy: [0.62, 0], sad: [0.26, -1], worried: [0.16, -1], nervous: [0.12, -1],
  smirk: [0.3, 0], proud: [0, 0], blank: [0.28, 0], forced: [0.14, -1], confused: [0.12, 0], thinking: [0.18, 0], disgust: [0.45, 1] };
function cabeca(g, o, of, sk, blink, t) {
  const r = sk.HR, fs = sk.front ? 0 : 1, pele = of.pele;
  const ex = { ...(EXPR[o.expr] || EXPR.neutral), ...(o.face || {}) };
  const fx = fs * r * 0.17; EYOFF = !fs && of.chapeu?.tipo === 'bone' ? 0.07 : 0;
  // orelhas (de frente: atrás da cabeça, saindo dos lados)
  const orelha = (x, sgn) => { shape(g, () => ell(g, x, r * 0.1, r * 0.2, r * 0.25), pele, 0.4, 0.15); stroke(g, () => { g.arc(x - sgn * r * 0.02, r * 0.1, r * 0.1, sgn > 0 ? -1.2 : Math.PI - 1.2 + 0.6, sgn > 0 ? 1.2 : Math.PI + 1.2 + 0.6); }, 1.2, esc(pele, 0.4)); };
  if (!fs) { orelha(-r * 0.96, -1); orelha(r * 0.96, 1); } else orelha(-r * 0.86, -1);
  const brinco = (x) => { if (of.brincos) shape(g, () => ell(g, x, r * 0.4, r * 0.08, r * 0.08), of.brincos, 0.3, 0.1); };
  // cabeça
  shape(g, () => ell(g, 0, 0, r, r * 1.02), pele, 1.9, claro(pele) ? 0.1 : 0.16);
  if (of.cabelo.tipo === 'careca' || of.cabelo.tipo === 'calvo') shape(g, () => ell(g, -r * 0.32 * (fs ? 1 : 0.4), -r * 0.62, r * 0.2, r * 0.1, -0.5), cla(pele, 0.55), 0, 0, false);
  // barba (antes da boca)
  if (of.barba) barba(g, of, r, fx, fs);
  // rosto
  rosto(g, o, of, ex, r, fx, fs, blink, t);
  if (of.bigode) bigode(g, of, r, fx, fs);
  // cabelo da frente
  cabeloFrente(g, of, r, fs);
  if (fs) brinco(-r * 0.88); else { brinco(-r * 0.96); brinco(r * 0.96); }
  if (of.oculos) oculos(g, of.oculos, r, fx, fs, of);
  if (of.chapeu) chapeu(g, of.chapeu, r, fs, t);
}

const IRIS = { claro: '#8fb8ec', escuro: '#3d64a8' };
function olho(g, x, y, rx, ry, pr, look, lid, slant, inner, kind, pele, t) {
  const lw = Math.max(1.2, rx * 0.26);
  if (kind === 'blink' || kind === 'closed') { stroke(g, () => { g.moveTo(x - rx * 0.95, y + ry * 0.1); g.quadraticCurveTo(x, y + ry * 0.75, x + rx * 0.95, y + ry * 0.1); }, lw * 1.1, INK); return; }
  if (kind === 'happy') { stroke(g, () => { g.moveTo(x - rx * 0.95, y + ry * 0.35); g.quadraticCurveTo(x, y - ry * 0.85, x + rx * 0.95, y + ry * 0.35); }, lw * 1.25, INK); return; }
  if (kind === 'squeeze') { stroke(g, () => { g.moveTo(x - inner * rx * 0.9, y - ry * 0.55); g.lineTo(x + inner * rx * 0.6, y); g.lineTo(x - inner * rx * 0.9, y + ry * 0.55); }, lw * 1.2, INK); return; }
  g.save(); g.beginPath(); ell(g, x, y, rx, ry); g.lineWidth = lw * 2; g.strokeStyle = C(INK); g.stroke(); g.fillStyle = C('#ffffff'); g.fill(); g.clip();
  const px = x + look[0] * rx * 0.42, py = y + look[1] * ry * 0.4 + ry * 0.05;
  const ir = pr * 1.75, gi = g.createRadialGradient(px, py + ir * 0.3, ir * 0.1, px, py, ir); gi.addColorStop(0, C(IRIS.claro)); gi.addColorStop(1, C(IRIS.escuro));
  g.fillStyle = gi; g.beginPath(); g.arc(px, py, ir, 0, Math.PI * 2); g.fill(); g.lineWidth = Math.max(1, ir * 0.18); g.strokeStyle = C(INK); g.stroke();
  g.fillStyle = C('#1e2436'); g.beginPath(); g.arc(px, py, pr * 0.95, 0, Math.PI * 2); g.fill();
  g.fillStyle = C('#ffffff'); g.beginPath(); g.arc(px + ir * 0.35, py - ir * 0.38, Math.max(0.8, ir * 0.3), 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(px - ir * 0.3, py + ir * 0.35, Math.max(0.5, ir * 0.13), 0, Math.PI * 2); g.fill();
  if (lid > 0.01) { const top = y - ry - 1, h = 2 * ry * lid, dl = ry * 0.45 * slant;
    const yl = top + h + (inner < 0 ? dl : -dl), yr = top + h + (inner < 0 ? -dl : dl);
    g.fillStyle = C(esc(pele, 0.05)); g.beginPath(); g.moveTo(x - rx - 2, top - 2); g.lineTo(x + rx + 2, top - 2); g.lineTo(x + rx + 2, yr); g.lineTo(x - rx - 2, yl); g.closePath(); g.fill();
    g.restore(); g.save(); g.beginPath(); ell(g, x, y, rx + lw, ry + lw); g.clip();
    stroke(g, () => { g.moveTo(x - rx - 2, yl); g.lineTo(x + rx + 2, yr); }, lw * 1.6, INK); }
  g.restore();
}

function rosto(g, o, of, ex, r, fx, fs, blink, t) {
  const pele = of.pele, look = o.look || ex.look || [fs ? 0.35 : 0, 0];
  const ey = -r * 0.04 + EYOFF * r, ex0 = fs ? [fx - r * 0.3, fx + r * 0.32] : [-r * 0.33, r * 0.33];
  let rx = r * 0.21, ry = r * 0.25, pr = r * 0.075, kind = 'open';
  switch (ex.eyes) {
    case 'ring': rx *= 1.12; ry *= 1.12; pr *= 0.95; break;
    case 'wide': rx *= 1.22; ry *= 1.22; pr *= 0.72; break;
    case 'tiny': rx *= 1.18; ry *= 1.18; pr *= 0.42; break;
    case 'happy': kind = 'happy'; break;
    case 'closed': kind = o.expr === 'sob' ? 'squeeze' : 'closed'; break;
    case 'squint': break;
  }
  const lidDef = LIDS[o.expr] || (ex.eyes === 'squint' ? [0.48, 0] : [0, 0]);
  if (blink && kind === 'open') kind = 'blink';
  ex0.forEach((x, i) => { const sc = fs && i === 0 ? 0.92 : 1, inner = (fs ? i === 0 : x < 0) ? 1 : -1;
    olho(g, x, ey, rx * sc, ry * sc, pr * sc, look, lidDef[0], lidDef[1], inner, kind, pele, t); });
  // sobrancelhas
  const bc = of.sobrancelha || (['careca', 'nenhum'].includes(of.cabelo.tipo) ? INK : mix(of.cabelo.cor, INK, 0.35));
  const by = ey - ry - r * 0.13, bw = r * 0.15, bt = r * 0.085;
  const BR = { neutral: [0, 0, -0.04], raised: [-0.12, -0.08, -0.07], worried: [-0.1, 0.05, 0.01], angry: [0.1, -0.06, 0.01], furious: [0.15, -0.1, 0], skeptic: null, confused: null };
  const brow = (x, inner, [di, dout, cv], w = bt) => stroke(g, () => { const xi = x + inner * bw, xo = x - inner * bw; g.moveTo(xo, by + dout * r); g.quadraticCurveTo(x, by + cv * r + (di + dout) * r * 0.5, xi, by + di * r); }, w, bc);
  const btype = ex.brows || 'neutral';
  ex0.forEach((x, i) => { const inner = (fs ? i === 0 : x < 0) ? 1 : -1;
    let v = BR[btype]; if (btype === 'skeptic') v = i === 0 ? BR.neutral : [-0.18, -0.14, -0.06]; if (btype === 'confused') v = i === 0 ? BR.worried : BR.raised;
    brow(x, inner, v || BR.neutral, btype === 'furious' ? bt * 1.3 : bt); });
  // nariz
  const nx = fx + fs * r * 0.12, ny = r * 0.2;
  if (of.nariz === 'bola') shape(g, () => ell(g, nx + fs * r * 0.04, ny, r * 0.13, r * 0.11), esc(pele, 0.06), 0.4, 0.12);
  else if (of.nariz !== 'nenhum') stroke(g, () => { if (fs) { g.moveTo(nx + r * 0.02, ny - r * 0.1); g.quadraticCurveTo(nx + r * 0.14, ny + r * 0.04, nx + r * 0.0, ny + r * 0.07); } else { g.moveTo(nx - r * 0.06, ny + r * 0.04); g.quadraticCurveTo(nx, ny + r * 0.1, nx + r * 0.06, ny + r * 0.04); } }, r * 0.05, esc(pele, 0.5));
  // bochechas
  const blush = of.blush || ['joy', 'happy', 'proud'].includes(o.expr) || (Array.isArray(o.emote) ? o.emote.includes('blush') : o.emote === 'blush');
  if (blush) { g.fillStyle = C('rgba(240,110,130,.38)'); for (const x of ex0) { g.beginPath(); g.ellipse(x + (fs ? r * 0.02 : 0), ey + r * 0.3, r * 0.13, r * 0.075, 0, 0, Math.PI * 2); g.fill(); } }
  // boca
  boca(g, ex, o, r, fx + fs * r * 0.05, r * 0.45, t);
  // lágrimas / suor
  if (ex.tears === 'stream') for (const x of ex0) { g.fillStyle = C(LAGRIMA); g.beginPath(); g.roundRect(x - r * 0.05, ey + r * 0.08, r * 0.1, r * 0.8, r * 0.05); g.fill(); }
  else if (ex.tears) for (const x of ex0) shape(g, () => ell(g, x + r * 0.05, ey + r * 0.32 + ((t * 0.8) % 1) * r * 0.2, r * 0.05, r * 0.08), LAGRIMA, 0, 0);
  if (ex.sweat) shape(g, () => { const x = fs ? -r * 0.62 : r * 0.72, y = -r * 0.18 + ((t * 0.7) % 1) * r * 0.15; g.moveTo(x, y - r * 0.16); g.quadraticCurveTo(x + r * 0.1, y + r * 0.02, x, y + r * 0.06); g.quadraticCurveTo(x - r * 0.1, y + r * 0.02, x, y - r * 0.16); g.closePath(); }, '#a9ddff', 0, 0);
}

function boca(g, ex, o, r, mx, my, t) {
  const lw = r * 0.065, talk = o.talk || 0, m = ex.mouth;
  const aberta = (build, dentes = false, lingua = true) => { g.save(); g.beginPath(); build(); g.lineWidth = lw * 1.6; g.strokeStyle = C(INK); g.lineJoin = 'round'; g.stroke(); g.fillStyle = C(BOCA); g.fill(); g.clip();
    if (dentes) { g.fillStyle = C('#ffffff'); g.fillRect(mx - r, my - r, r * 2, r * 0.97 + (dentes === true ? 0 : dentes)); }
    if (lingua) { g.fillStyle = C(LINGUA); g.beginPath(); g.ellipse(mx + r * 0.03, my + r * 0.24, r * 0.17, r * 0.12, 0, 0, Math.PI * 2); g.fill(); }
    g.restore(); };
  if (talk > 0.05) {
    const h = r * (0.05 + 0.2 * talk), w = r * (0.17 + 0.04 * talk), feliz = ['grin', 'smile', 'smallSmile', 'smirk'].includes(m);
    if (feliz) aberta(() => { g.moveTo(mx - w * 1.15, my - h * 0.3); g.quadraticCurveTo(mx, my - h * 0.45, mx + w * 1.15, my - h * 0.3); g.quadraticCurveTo(mx + w, my + h * 1.5, mx, my + h * 1.3); g.quadraticCurveTo(mx - w, my + h * 1.5, mx - w * 1.15, my - h * 0.3); g.closePath(); }, h > r * 0.12 ? -r * 0.88 : false);
    else aberta(() => ell(g, mx, my + h * 0.3, w, h), h > r * 0.14 ? -r * 0.9 : false);
    return;
  }
  const arco = (y0, w, dip) => stroke(g, () => { g.moveTo(mx - w, y0); g.quadraticCurveTo(mx, y0 + dip, mx + w, y0); }, lw, INK);
  switch (m) {
    case 'smallSmile': arco(my - r * 0.02, r * 0.13, r * 0.11); break;
    case 'smile': arco(my - r * 0.05, r * 0.22, r * 0.2); break;
    case 'grin': aberta(() => { g.moveTo(mx - r * 0.27, my - r * 0.07); g.quadraticCurveTo(mx, my - r * 0.02, mx + r * 0.27, my - r * 0.07); g.quadraticCurveTo(mx + r * 0.22, my + r * 0.3, mx, my + r * 0.3); g.quadraticCurveTo(mx - r * 0.22, my + r * 0.3, mx - r * 0.27, my - r * 0.07); g.closePath(); }, -r * 0.9); break;
    case 'o': aberta(() => ell(g, mx, my + r * 0.04, r * 0.09, r * 0.12), false, false); break;
    case 'oBig': aberta(() => ell(g, mx, my + r * 0.08, r * 0.15, r * 0.2)); break;
    case 'flat': stroke(g, () => { g.moveTo(mx - r * 0.17, my); g.lineTo(mx + r * 0.17, my); }, lw, INK); break;
    case 'smallFlat': stroke(g, () => { g.moveTo(mx - r * 0.1, my); g.lineTo(mx + r * 0.1, my); }, lw, INK); break;
    case 'frown': arco(my + r * 0.07, r * 0.16, -r * 0.14); break;
    case 'smirk': stroke(g, () => { g.moveTo(mx - r * 0.15, my + r * 0.02); g.quadraticCurveTo(mx + r * 0.05, my + r * 0.07, mx + r * 0.2, my - r * 0.08); }, lw, INK); break;
    case 'scream': aberta(() => ell(g, mx, my + r * 0.12, r * 0.19, r * 0.27), -r * 0.92); break;
    case 'teeth': { g.save(); g.beginPath(); g.roundRect(mx - r * 0.25, my - r * 0.08, r * 0.5, r * 0.2, r * 0.07); g.lineWidth = lw * 1.5; g.strokeStyle = C(INK); g.stroke(); g.fillStyle = C('#ffffff'); g.fill(); g.restore();
      stroke(g, () => { g.moveTo(mx - r * 0.24, my + r * 0.02); g.lineTo(mx + r * 0.24, my + r * 0.02); for (const dx of [-0.12, 0, 0.12]) { g.moveTo(mx + dx * r, my - r * 0.07); g.lineTo(mx + dx * r, my + r * 0.11); } }, lw * 0.5, INK); break; }
    case 'tongue': stroke(g, () => { for (let i = 0; i <= 12; i++) { const u = i / 12; const x = mx - r * 0.2 + u * r * 0.4, y = my + Math.sin(u * Math.PI * 2) * r * 0.04; i ? g.lineTo(x, y) : g.moveTo(x, y); } }, lw, INK);
      shape(g, () => { g.moveTo(mx + r * 0.0, my + r * 0.02); g.lineTo(mx + r * 0.16, my + r * 0.0); g.quadraticCurveTo(mx + r * 0.2, my + r * 0.2, mx + r * 0.08, my + r * 0.2); g.quadraticCurveTo(mx, my + r * 0.16, mx, my + r * 0.02); g.closePath(); }, LINGUA, 0, 0); break;
    case 'wavy': stroke(g, () => { for (let i = 0; i <= 12; i++) { const u = i / 12; const x = mx - r * 0.2 + u * r * 0.4, y = my + Math.sin(u * Math.PI * 2) * r * 0.045; i ? g.lineTo(x, y) : g.moveTo(x, y); } }, lw, INK); break;
    case 'wavyBig': aberta(() => { for (let i = 0; i <= 12; i++) { const u = i / 12; g.lineTo(mx - r * 0.26 + u * r * 0.52, my - r * 0.05 + Math.sin(u * Math.PI * 3) * r * 0.04); } for (let i = 12; i >= 0; i--) { const u = i / 12; g.lineTo(mx - r * 0.26 + u * r * 0.52, my + r * 0.1 + Math.sin(u * Math.PI * 3) * r * 0.04); } g.closePath(); }, -r * 0.8, false); break;
    case 'drool': aberta(() => ell(g, mx, my + r * 0.02, r * 0.13, r * 0.09));
      shape(g, () => ell(g, mx + r * 0.1, my + r * 0.2 + ((t * 0.6) % 1) * r * 0.06, r * 0.04, r * 0.08), '#a9ddff', 0, 0); break;
    default: arco(my - r * 0.02, r * 0.13, r * 0.11);
  }
}

function barba(g, of, r, fx, fs) {
  const c = of.barbaCor || of.cabelo.cor || '#3a271c';
  if (of.barba === 'rala') { g.save(); g.beginPath(); ell(g, 0, 0, r, r * 1.02); g.clip(); g.fillStyle = C(mix(of.pele, c, 0.28)); g.beginPath(); g.moveTo(-r, 0.15 * r); g.quadraticCurveTo(fx, r * 0.3, r, 0.05 * r); g.lineTo(r, r * 1.2); g.lineTo(-r, r * 1.2); g.closePath(); g.fill(); g.restore(); return; }
  if (of.barba === 'cavanhaque') { shape(g, () => { g.moveTo(fx - r * 0.18 + fs * r * 0.05, r * 0.55); g.quadraticCurveTo(fx + fs * r * 0.05, r * 1.05, fx + r * 0.2 + fs * r * 0.05, r * 0.55); g.quadraticCurveTo(fx, r * 0.68, fx - r * 0.18 + fs * r * 0.05, r * 0.55); g.closePath(); }, c, 0.6, 0.15); return; }
  shape(g, () => { const xb = -r * (fs ? 0.62 : 0.98);
    g.moveTo(xb, -r * 0.05); g.quadraticCurveTo(xb - r * 0.12, r * 0.85, fx, r * 1.2); g.quadraticCurveTo(r * 1.0, r * 0.95, r * 0.98, -r * 0.05 + fs * r * 0.2);
    g.quadraticCurveTo(r * 0.75, r * 0.45, fx + r * 0.05, r * 0.3); g.quadraticCurveTo(xb + r * 0.25, r * 0.45, xb, -r * 0.05); g.closePath(); }, c, 1.2, 0.18);
}
function bigode(g, of, r, fx, fs) {
  const c = of.barbaCor || of.cabelo.cor || '#3a271c', x = fx + fs * r * 0.08, y = r * 0.33;
  if (of.bigode === 'fino') { stroke(g, () => { g.moveTo(x - r * 0.22, y + r * 0.03); g.quadraticCurveTo(x, y - r * 0.06, x + r * 0.22, y + r * 0.03); }, r * 0.06, c); return; }
  shape(g, () => { g.moveTo(x, y - r * 0.08);
    g.quadraticCurveTo(x + r * 0.2, y - r * 0.15, x + r * 0.34, y + r * 0.02); g.quadraticCurveTo(x + r * 0.36, y + r * 0.12, x + r * 0.26, y + r * 0.09); g.quadraticCurveTo(x + r * 0.12, y + r * 0.04, x, y + r * 0.08);
    g.quadraticCurveTo(x - r * 0.12, y + r * 0.04, x - r * 0.26, y + r * 0.09); g.quadraticCurveTo(x - r * 0.36, y + r * 0.12, x - r * 0.34, y + r * 0.02); g.quadraticCurveTo(x - r * 0.2, y - r * 0.15, x, y - r * 0.08); g.closePath(); }, c, 0.5, 0.15);
}
function oculos(g, tipo, r, fx, fs, of) {
  const ey = -r * 0.04 + EYOFF * r, xs = fs ? [fx - r * 0.3, fx + r * 0.32] : [-r * 0.33, r * 0.33], R = r * 0.25, cor = of.oculosCor || INK, lw = r * 0.055;
  const lente = (x, i) => { const rr2 = R * (fs && i === 0 ? 0.92 : 1); if (tipo === 'quadrado') g.roundRect(x - rr2 * 1.05, ey - rr2 * 0.85, rr2 * 2.1, rr2 * 1.7, rr2 * 0.35); else { g.moveTo(x + rr2, ey); g.arc(x, ey, rr2, 0, Math.PI * 2); } };
  g.beginPath(); xs.forEach(lente); g.fillStyle = C(tipo === 'escuro' ? '#141420' : 'rgba(210,235,255,.18)'); g.fill(); g.lineWidth = lw; g.strokeStyle = C(cor); g.stroke();
  if (tipo === 'escuro') { g.fillStyle = 'rgba(160,220,255,.55)'; for (const x of xs) g.fillRect(x - R * 0.55, ey - R * 0.5, R * 0.35, R * 0.15); }
  stroke(g, () => { g.moveTo(xs[0] + R * 0.9, ey - R * 0.15); g.quadraticCurveTo((xs[0] + xs[1]) / 2, ey - R * 0.45, xs[1] - R * 0.95, ey - R * 0.15); if (fs) { g.moveTo(xs[0] - R * 0.92, ey - R * 0.05); g.lineTo(-r * 0.8, ey + r * 0.02); } }, lw, cor);
}

// ---------------------------------------------------------------- cabelos
function cabeloTras(g, of, r, fs, t) {
  const tp = of.cabelo.tipo, c = of.cabelo.cor;
  if (tp === 'coque') shape(g, () => { ell(g, -r * 0.35 * fs, -r * 1.02, r * 0.36, r * 0.33); }, c, 1, 0.2);
  if (tp === 'rabo') { const sw = Math.sin(t * 2.4) * r * 0.08; shape(g, () => { g.moveTo(-r * 0.75, -r * 0.55); g.quadraticCurveTo(-r * 1.55, -r * 0.4, -r * 1.25 + sw, r * 0.75); g.quadraticCurveTo(-r * 1.0 + sw, r * 0.35, -r * 0.7, -r * 0.05); g.closePath(); }, c, 1, 0.2); }
  if (tp === 'longo') shape(g, () => { g.moveTo(-r * 1.08, -r * 0.2); g.quadraticCurveTo(-r * 1.15, r * 1.0, -r * 1.0, r * 1.55); g.lineTo(r * (fs ? 0.35 : 1.0), r * 1.55); g.quadraticCurveTo(r * (fs ? 0.5 : 1.15), r * 1.0, r * 1.08, -r * 0.2); g.quadraticCurveTo(0, -r * 1.3, -r * 1.08, -r * 0.2); g.closePath(); }, c, 1.4, 0.22);
  if (tp === 'afro') shape(g, () => { const n = 14; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; ell(g, -r * 0.1 * fs + Math.cos(a) * r * 1.12, -r * 0.28 + Math.sin(a) * r * 1.05, r * 0.36, r * 0.36); } ell(g, -r * 0.1 * fs, -r * 0.28, r * 1.15, r * 1.08); }, c, 2, 0.2);
  if (tp === 'cacheado') shape(g, () => { const n = 9; for (let i = 0; i < n; i++) { const a = Math.PI * 0.75 + (i / (n - 1)) * Math.PI * 1.05; ell(g, -r * 0.08 * fs + Math.cos(a) * r * 1.0, -r * 0.12 + Math.sin(a) * r * 0.98, r * 0.3, r * 0.3); } }, c, 1.4, 0.2);
}
function cabeloFrente(g, of, r, fs) {
  const tp = of.cabelo.tipo, c = of.cabelo.cor;
  if (['nenhum', 'careca'].includes(tp)) return;
  if (tp === 'calvo') { shape(g, () => { if (fs) { g.moveTo(-r * 1.02, -r * 0.4); g.quadraticCurveTo(-r * 0.85, -r * 0.62, -r * 0.55, -r * 0.5); g.quadraticCurveTo(-r * 0.5, -r * 0.1, -r * 0.6, r * 0.15); g.quadraticCurveTo(-r * 1.05, r * 0.15, -r * 1.02, -r * 0.4); g.closePath(); }
    else for (const s of [-1, 1]) { g.moveTo(s * r * 1.03, -r * 0.45); g.quadraticCurveTo(s * r * 0.9, -r * 0.62, s * r * 0.74, -r * 0.52); g.quadraticCurveTo(s * r * 0.76, -r * 0.25, s * r * 0.86, -r * 0.08); g.quadraticCurveTo(s * r * 1.06, -r * 0.15, s * r * 1.03, -r * 0.45); g.closePath(); } }, c, 0.8, 0.18); return; }
  // calota base (topo da cabeça) com franja
  const a0 = Math.PI - (fs ? 0.12 : -0.05), a1 = Math.PI * 2 - (fs ? 0.5 : -0.05);
  const R = r * 1.05;
  const borda = (spiky, curls) => {
    if (spiky) { const n = 7; g.moveTo(Math.cos(a0) * R, -r * 0.02 + Math.sin(a0) * R); for (let i = 1; i <= n * 2; i++) { const a = a0 + (a1 - a0) * i / (n * 2), rr2 = i % 2 ? R * 1.22 : R; g.lineTo(Math.cos(a) * rr2, -r * 0.02 + Math.sin(a) * rr2); } }
    else g.arc(0, -r * 0.02, R, a0, a1);
    void curls;
  };
  const franja = () => {
    if (tp === 'coque' || tp === 'rabo') { // puxado para trás, testa limpa, risca suave
      g.quadraticCurveTo(r * 0.55 * fs, -r * 0.62, fs ? -r * 0.05 : 0, -r * 0.58); g.quadraticCurveTo(fs ? -r * 0.55 : -r * 0.6, -r * 0.55, fs ? -r * 0.62 : -r * 0.92, fs ? r * 0.12 : r * 0.05); }
    else if (tp === 'longo') { g.quadraticCurveTo(r * 0.5 * fs, -r * 0.35, fs ? r * 0.0 : r * 0.1, -r * 0.6); g.quadraticCurveTo(fs ? -r * 0.5 : -r * 0.6, -r * 0.4, fs ? -r * 0.65 : -r * 0.95, fs ? r * 0.35 : r * 0.4); }
    else { // curto / espetado / cacheado / afro: franja em mechas
      const pts = fs ? [[r * 0.62, -r * 0.4], [r * 0.32, -r * 0.48], [r * 0.12, -r * 0.4], [-r * 0.1, -r * 0.5], [-r * 0.32, -r * 0.4]] : [[r * 0.7, -r * 0.38], [r * 0.38, -r * 0.48], [r * 0.12, -r * 0.4], [-r * 0.14, -r * 0.5], [-r * 0.42, -r * 0.4], [-r * 0.7, -r * 0.38]];
      let prev = [Math.cos(a1) * R, -r * 0.02 + Math.sin(a1) * R];
      for (const pt of pts) { g.quadraticCurveTo((prev[0] + pt[0]) / 2, Math.max(prev[1], pt[1]) + r * 0.1, pt[0], pt[1]); prev = pt; }
      if (fs) g.quadraticCurveTo(-r * 0.5, -r * 0.2, -r * 0.42, r * 0.15); else g.quadraticCurveTo(-r * 0.95, -r * 0.2, -r * 0.98, r * 0.02);
    }
    g.closePath(); };
  const build = () => { borda(tp === 'espetado'); franja(); };
  if (tp === 'cacheado' || tp === 'afro') shape(g, () => { build(); const n = 8; for (let i = 0; i < n; i++) { const a = a0 + 0.1 + (a1 - a0 - 0.2) * i / (n - 1); ell(g, Math.cos(a) * R * 0.95, -r * 0.04 + Math.sin(a) * R * 0.95, r * 0.24, r * 0.24); } }, c, 1.4, 0.2);
  else shape(g, build, c, 1.4, 0.2);
  // brilho do cabelo
  stroke(g, () => { g.arc(-r * 0.1, -r * 0.05, r * 0.82, Math.PI * 1.3, Math.PI * 1.52); }, r * 0.07, cla(c, 0.28));
}
function chapeu(g, ch, r, fs, t) {
  const c = ch.cor;
  switch (ch.tipo) {
    case 'bone': {
      const y0 = fs ? -r * 0.3 : -r * 0.5;
      const crown = () => { g.moveTo(-r * 1.04, y0); g.arc(0, y0 + r * 0.02, r * 1.04, Math.PI, Math.PI * 2); g.quadraticCurveTo(0, y0 - r * 0.14, -r * 1.04, y0); g.closePath(); };
      if (fs) shape(g, () => { g.moveTo(r * 0.45, y0 - r * 0.2); g.quadraticCurveTo(r * 1.25, y0 - r * 0.3, r * 1.72, y0 - r * 0.04); g.quadraticCurveTo(r * 1.45, y0 + r * 0.12, r * 0.55, y0 + r * 0.02); g.closePath(); }, esc(c, 0.12), 0.6, 0.15);
      shape(g, crown, c, 2, 0.2);
      stroke(g, () => { g.moveTo(r * 0.1 * fs, -r * 1.2); g.quadraticCurveTo(r * 0.3 * fs + r * 0.05, -r * 0.7, r * 0.2 * fs, -r * 0.3); }, 1.3, esc(c, 0.35));
      shape(g, () => ell(g, r * 0.08 * fs, -r * 1.2, r * 0.1, r * 0.06), esc(c, 0.1), 0, 0);
      stroke(g, () => { g.arc(-r * 0.05, y0, r * 0.82, Math.PI * 1.2, Math.PI * 1.45); }, r * 0.07, cla(c, 0.35));
      if (!fs) { const aba = () => { g.moveTo(-r * 1.12, y0 + r * 0.02); g.quadraticCurveTo(0, y0 - r * 0.1, r * 1.12, y0 + r * 0.02); g.quadraticCurveTo(r * 0.85, y0 + r * 0.3, 0, y0 + r * 0.3); g.quadraticCurveTo(-r * 0.85, y0 + r * 0.3, -r * 1.12, y0 + r * 0.02); g.closePath(); };
        shape(g, aba, esc(c, 0.1), 0, 0); g.save(); g.beginPath(); aba(); g.clip(); g.fillStyle = C(esc(c, 0.35)); g.beginPath(); g.ellipse(0, y0 + r * 0.34, r * 0.95, r * 0.2, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      break; }
    case 'chef': {
      shape(g, () => { g.moveTo(-r * 0.85, -r * 0.62); g.lineTo(-r * 0.92, -r * 1.35); ell(g, -r * 0.55, -r * 1.45, r * 0.5, r * 0.45); ell(g, r * 0.05, -r * 1.68, r * 0.55, r * 0.5); ell(g, r * 0.6, -r * 1.42, r * 0.48, r * 0.44);
        g.moveTo(-r * 0.92, -r * 1.35); g.lineTo(r * 0.95, -r * 1.35); g.lineTo(r * 0.88, -r * 0.62); g.lineTo(-r * 0.85, -r * 0.62); g.closePath(); }, c, 1.6, 0.14);
      shape(g, () => g.roundRect(-r * 0.98, -r * 0.9, r * 1.96, r * 0.4, r * 0.12), esc(c, 0.06), 0.8, 0.1);
      stroke(g, () => { for (const x of [-0.35, 0.3]) { g.moveTo(x * r, -r * 1.25); g.quadraticCurveTo(x * r + r * 0.05, -r * 1.1, x * r, -r * 0.95); } }, 1.2, esc(c, 0.3)); break; }
    case 'boina': shape(g, () => { ell(g, -r * 0.12 * fs, -r * 0.78, r * 1.08, r * 0.4, -0.12); ell(g, -r * 0.05, -r * 1.12, r * 0.08, r * 0.08); }, c, 1.4, 0.18); break;
    case 'touca': shape(g, () => { g.moveTo(-r * 1.05, -r * 0.3); g.arc(0, -r * 0.3, r * 1.05, Math.PI, Math.PI * 2); g.closePath(); }, c, 1.6, 0.18);
      shape(g, () => g.roundRect(-r * 1.1, -r * 0.48, r * 2.2, r * 0.32, r * 0.14), esc(c, 0.15), 0.6, 0.1);
      shape(g, () => ell(g, 0, -r * 1.4, r * 0.2, r * 0.2), cla(c, 0.35), 0.4, 0.1); break;
    case 'palha': shape(g, () => ell(g, 0, -r * 0.6, r * 1.6, r * 0.3, -0.05), c, 1.5, 0.15);
      shape(g, () => g.roundRect(-r * 0.75, -r * 1.35, r * 1.5, r * 0.8, r * 0.3), c, 1.2, 0.15);
      shape(g, () => g.roundRect(-r * 0.76, -r * 0.8, r * 1.52, r * 0.2, r * 0.06), ch.cor2 || '#6b4a2b', 0, 0); break;
  }
}

// ---------------------------------------------------------------- props simples na mão da frente
function propHumano(g, prop, sk) {
  const tp = typeof prop === 'string' ? { type: prop } : prop, h = tp.hand === 'B' ? sk.hB : sk.hF;
  switch (tp.type) {
    case 'phone': shape(g, () => g.roundRect(h[0] - 2, h[1] - 24, 13, 22, 3), '#25232e', 0.3, 0); g.fillStyle = tp.glow || '#9fd8ff'; g.fillRect(h[0], h[1] - 21, 9, 15); break;
    case 'pao': shape(g, () => { ell(g, h[0] + 8, h[1] - 6, 14, 7, -0.2); }, '#d9a05b', 0.8, 0.2); stroke(g, () => { for (const dx of [-5, 1, 7]) { g.moveTo(h[0] + 8 + dx, h[1] - 11); g.lineTo(h[0] + 11 + dx, h[1] - 2); } }, 1.3, '#a8693a'); break;
    case 'xicara': shape(g, () => g.roundRect(h[0] - 2, h[1] - 18, 14, 16, 3), '#ffffff', 0.4, 0.15); break;
    case 'prancheta': shape(g, () => g.roundRect(h[0] - 4, h[1] - 34, 28, 36, 3), '#b98a55', 0.6, 0.1); shape(g, () => g.roundRect(h[0] - 1, h[1] - 30, 22, 29, 2), '#ffffff', 0, 0); break;
  }
}

// ---------------------------------------------------------------- presets
export const PROTAGONISTA_A = Object.freeze({ protagonista: 'A' });   // pele branca, boné vermelho, camiseta neutra + jeans + tênis
export const PROTAGONISTA_B = Object.freeze({ protagonista: 'B' });   // pele branca, boné vermelho, sem roupa (corpo humanizado) + tênis brancos
export const SEU_MANOEL = Object.freeze({ pele: PELES.clara, corpo: 'gordo', nariz: 'bola', cabelo: { tipo: 'calvo', cor: '#8a8a90' }, bigode: 'cheio', barbaCor: '#4a3a32',
  chapeu: { tipo: 'chef', cor: '#ffffff' }, roupa: { tipo: 'avental', cor: '#ffffff', cor2: '#d9e6f2' }, calca: { tipo: 'calca', cor: '#4d5466' }, sapato: { tipo: 'sapato', cor: '#3a2a22' } });
export const MAE = Object.freeze({ pele: PELES.morena, corpo: 'mulher', cabelo: { tipo: 'coque', cor: '#2b1c15' }, roupa: { tipo: 'vestido', cor: '#8a5cc7', cor2: '#f2c94c' }, brincos: '#f2c94c', sapato: { tipo: 'sandalia', cor: '#7a4a32' }, blush: true });
export const ANJO_ESTAGIARIO = Object.freeze({ pele: PELES.media, corpo: 'magro', cabelo: { tipo: 'cacheado', cor: '#3b2a20' }, oculos: 'redondo', roupa: { tipo: 'tunica', cor: '#f7f5ee', cor2: '#e8c55a' }, sapato: { tipo: 'sandalia', cor: '#c8a26a' } });
export const CHEFE_ANJO = Object.freeze({ pele: PELES.escura, corpo: 'forte', cabelo: { tipo: 'calvo', cor: '#e2e2e8' }, barba: 'cheia', barbaCor: '#ececf0', roupa: { tipo: 'tunica', cor: '#fbf8ef', cor2: '#f0b43c' }, sapato: { tipo: 'sandalia', cor: '#c8a26a' } });
export const SENHORA = Object.freeze({ pele: PELES.clara, corpo: 'mulher', cabelo: { tipo: 'coque', cor: '#e6e6ee' }, oculos: 'redondo', roupa: { tipo: 'casaco', cor: '#9b7fd1', cor2: '#f6c9d6' }, calca: { tipo: 'saia', cor: '#6b6f8c' }, sapato: { tipo: 'sapato', cor: '#5a3b2c' }, blush: true });
export const JOVEM_MOLETOM = Object.freeze({ pele: PELES.parda, corpo: 'magro', cabelo: { tipo: 'espetado', cor: '#1d1612' }, roupa: { tipo: 'moletom', cor: '#2f9e8f' }, calca: { tipo: 'jeans', cor: '#2d3f66' }, sapato: { tipo: 'tenis', cor: '#f2f2f2', sola: '#c9ccd4' } });
export const BIOMEDICA = Object.freeze({ pele: PELES.rosada, corpo: 'mulher', cabelo: { tipo: 'rabo', cor: '#5a3825' }, oculos: 'quadrado', roupa: { tipo: 'jaleco', cor2: '#6fa8dc' }, calca: { tipo: 'calca', cor: '#34405e' }, sapato: { tipo: 'tenis', cor: '#ffffff', sola: '#c9ccd4' } });
export const POLITICO = Object.freeze({ pele: PELES.rosada, corpo: 'gordo', cabelo: { tipo: 'curto', cor: '#3b2b22' }, roupa: { tipo: 'terno', cor: '#25314d', cor2: '#2f6fb0' }, calca: { tipo: 'calca', cor: '#25314d' }, faixa: true, sapato: { tipo: 'sapato', cor: '#1f1d24' } });
export const MOCA = Object.freeze({ pele: PELES.negra, corpo: 'mulher', cabelo: { tipo: 'afro', cor: '#21150f' }, brincos: '#f2c94c', roupa: { tipo: 'jaqueta', cor: '#3f6fb5', cor2: '#f6e7a8' }, calca: { tipo: 'calca', cor: '#2b2a35' }, sapato: { tipo: 'bota', cor: '#5a3b2c' } });
export const CRIANCA = Object.freeze({ kid: true, pele: PELES.media, cabelo: { tipo: 'cacheado', cor: '#4a2f1f' }, roupa: { tipo: 'camiseta', cor: '#f2c230' }, calca: { tipo: 'bermuda', cor: '#3f7fc0' }, sapato: { tipo: 'tenis', cor: '#ffffff', sola: '#3f7fc0' } });
export const SEU_OSVALDO = Object.freeze({ pele: PELES.clara, corpo: 'medio', cabelo: { tipo: 'calvo', cor: '#cfcfd6' }, bigode: 'cheio', barbaCor: '#d8d8de', chapeu: { tipo: 'boina', cor: '#4a4f3a' }, roupa: { tipo: 'moletom', cor: '#6b7a45' }, calca: { tipo: 'calca', cor: '#5a5246' }, sapato: { tipo: 'sapato', cor: '#3a2a22' } });
export const TRABALHADOR = Object.freeze({ pele: PELES.escura, corpo: 'forte', cabelo: { tipo: 'curto', cor: '#15100c' }, barba: 'rala', chapeu: { tipo: 'bone', cor: '#2f5d9e' }, roupa: { tipo: 'camisa', cor: '#e9a23b' }, calca: { tipo: 'jeans', cor: '#34507a' }, sapato: { tipo: 'bota', cor: '#6b4a2b' } });
export const PRESETS = { PROTAGONISTA_A, PROTAGONISTA_B, SEU_MANOEL, MAE, ANJO_ESTAGIARIO, CHEFE_ANJO, SENHORA, JOVEM_MOLETOM, BIOMEDICA, POLITICO, MOCA, CRIANCA, SEU_OSVALDO, TRABALHADOR };
