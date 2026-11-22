// TURNO DA MADRUGADA — gente "low poly modelado" (nível PS2 / Resident Evil 2 de 1998), não cubos:
// membros torneados de 7–8 lados afinando, tronco com cintura/peito/ombros, deltoide, pescoço, mãos com polegar,
// sapatos com bico, cabeça facetada com maçã do rosto e queixo angulosos, nariz/orelhas/bigode em malha,
// boné em domo + aba. Texturas pintadas em baixa resolução (NEAREST): rosto 128 px com boca que abre (e o queixo desce),
// camisas com dobras/sombra pintadas, calça com costura e joelho. Ninguém usa vermelho (só o protagonista, que não aparece).
import { THREE, lam, luz, tex, rnd, mancha } from '/series/turno/ps1.js';
import { clamp, lerp } from '/engine/core.js';

const DS = THREE.DoubleSide;
const mat = (c, o = {}) => lam(c, { side: DS, ...o });

// ---------- geometria: anéis (torno low poly) ----------
// rings: [{ y, rx, rz, dz?, dx?, sq? }] de baixo pra cima; sides par -> um vértice bem na frente (u = 0.5)
export function anel(rings, sides = 8, caps = true) {
  const pos = [], uv = [], idx = []; const y0 = Math.min(...rings.map(r => r.y)), y1 = Math.max(...rings.map(r => r.y)), H = (y1 - y0) || 1;
  rings.forEach((r) => { for (let i = 0; i <= sides; i++) { const a = Math.PI + 2 * Math.PI * i / sides, f = 1 + (r.sq ?? 0) * 0.41 * Math.abs(Math.sin(2 * a)); pos.push((r.dx ?? 0) + r.rx * Math.sin(a) * f, r.y, (r.dz ?? 0) + r.rz * Math.cos(a) * f); uv.push(i / sides, (r.y - y0) / H); } });
  const n = sides + 1;
  for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < sides; i++) { const a = j * n + i, b = a + 1, c = a + n, d = c + 1; idx.push(a, b, d, a, d, c); }
  if (caps) for (const [j, up] of [[0, false], [rings.length - 1, true]]) {
    // tampa com vértices próprios e UV fixa (amostra as costas: sem gola/estampa esticada)
    const r = rings[j], ci = pos.length / 3, cv = up ? 0.97 : 0.03; pos.push(r.dx ?? 0, r.y, r.dz ?? 0); uv.push(0.02, cv);
    for (let i = 0; i <= sides; i++) { const k = j * n + i; pos.push(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]); uv.push(0.02, cv); }
    for (let i = 0; i < sides; i++) { const a = ci + 1 + i; if (up) idx.push(ci, a, a + 1); else idx.push(ci, a + 1, a); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// caixa afinando no topo (tx, tz = escala do topo) — palma, dedos, nariz, sapato
export function tbox(w, h, d, tx = 1, tz = 1, seg = 1) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = (p.getY(i) / h + 0.5); p.setX(i, p.getX(i) * lerp(1, tx, k)); p.setZ(i, p.getZ(i) * lerp(1, tz, k)); }
  g.computeVertexNormals(); return g;
}
const M = (geo, m, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); return me; };

// ---------- texturas pintadas ----------
const sombraU = (g, w, h, a = 0.45) => { for (let x = 0; x < w; x++) { const u = x / w, c = Math.cos((u - 0.5) * 2 * Math.PI); const s = (1 - (0.5 + 0.5 * c)) * a; if (s > 0.01) { g.fillStyle = `rgba(10,12,20,${s.toFixed(3)})`; g.fillRect(x, 0, 1, h); } } };
// camisa polo do uniforme (Tico / Lucas)
function texPolo(o, manga = false) {
  return tex(128, 128, (g, w, h) => {
    const R = rnd(o.seed ?? 5);
    g.fillStyle = o.camisa; g.fillRect(0, 0, w, h);
    // dobras: diagonais escuras na cintura e embaixo do braço, brilho no peito
    for (let i = 0; i < 14; i++) { const x = R() * w, y = 70 + R() * 50; g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x | 0, y | 0, 10 + R() * 14 | 0, 1); g.fillRect(x + 3 | 0, y + 1 | 0, 8, 1); }
    for (const x of [30, 96]) { g.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 6; k++) g.fillRect(x - 6 + k * 2, 8 + k * 6, 3, 10); }
    mancha(g, 54, 46, 16, 'rgba(255,255,255,A)', 0.12); mancha(g, 76, 46, 16, 'rgba(255,255,255,A)', 0.1);
    sombraU(g, w, h, 0.5);
    if (manga) { g.fillStyle = o.camisaDet; g.fillRect(0, h - 5, w, 3); return; }   // manga: só a listra na barra
    // gola e listra
    g.fillStyle = o.camisaDet; g.fillRect(0, 0, w, 5); g.fillStyle = o.camisa; g.fillRect(52, 0, 24, 3); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 5, w, 1);
    g.fillStyle = o.gola ?? '#3e566f'; g.beginPath(); g.moveTo(50, 0); g.lineTo(64, 14); g.lineTo(78, 0); g.fill();
    // carcela + botões
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(62, 6, 1, 22); g.fillRect(66, 6, 1, 22); g.fillStyle = '#d8d8d0'; for (const y of [12, 20, 27]) g.fillRect(64, y, 2, 2);
    // crachá e bordado do posto (sem marca)
    g.fillStyle = o.camisaDet; g.fillRect(44, 24, 12, 6); g.fillStyle = '#2a2a2a'; g.fillRect(46, 26, 8, 1); g.fillRect(46, 28, 5, 1);
    g.fillStyle = o.camisaDet; g.fillRect(74, 24, 8, 8); g.fillStyle = o.camisa; g.fillRect(76, 26, 4, 4);
    // barra
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, h - 4, w, 4);
    if (o.suja) for (let i = 0; i < 6; i++) mancha(g, 40 + R() * 50, 60 + R() * 40, 4 + R() * 6, 'rgba(60,40,20,A)', 0.35);
  });
}
// camisa xadrez de flanela (Alberto / mímico): suor nas axilas e no peito
function texFlanela(o, manga = false) {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = o.camisa; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) { g.fillStyle = o.xadrez; g.fillRect(x, 0, 6, h); g.fillStyle = o.xadrez2; g.fillRect(x + 11, 0, 1, h); }
    for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(15,25,18,.55)'; g.fillRect(0, y, w, 6); g.fillStyle = o.xadrez2; g.fillRect(0, y + 11, w, 1); }
    const R = rnd(9); for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(R() * w | 0, 60 + R() * 60 | 0, 12, 1); }
    sombraU(g, w, h, 0.5);
    if (manga) return;
    // gola aberta com camiseta por baixo
    g.fillStyle = '#d8d2c2'; g.beginPath(); g.moveTo(52, 0); g.lineTo(64, 20); g.lineTo(76, 0); g.fill(); g.fillStyle = o.pele; g.beginPath(); g.moveTo(56, 0); g.lineTo(64, 12); g.lineTo(72, 0); g.fill();
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(63, 20, 2, 108); g.fillStyle = '#c8c0a8'; for (let y = 28; y < 120; y += 18) g.fillRect(66, y, 2, 2);
    g.fillStyle = o.xadrez; g.fillRect(70, 30, 14, 12); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(70, 30, 14, 1);   // bolso
    if (o.suor) { mancha(g, 28, 34, 14, 'rgba(10,20,12,A)', 0.55); mancha(g, 100, 34, 14, 'rgba(10,20,12,A)', 0.55); mancha(g, 64, 40, 18, 'rgba(10,20,12,A)', 0.4); }
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, h - 3, w, 3);
  });
}
function texCalca(o) {
  return tex(64, 64, (g, w, h) => {
    g.fillStyle = o.calca; g.fillRect(0, 0, w, h); const R = rnd(3);
    for (let i = 0; i < 90; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.1)'; g.fillRect(R() * w | 0, R() * h | 0, 1, 2); }
    sombraU(g, w, h, 0.45);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(15, 0, 1, h); g.fillRect(48, 0, 1, h);           // costuras laterais
    g.fillStyle = 'rgba(0,0,0,.2)'; for (const y of [26, 30, 34]) g.fillRect(24, y, 16, 1);     // vincos do joelho
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(26, 6, 10, 14);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, h - 3, w, 3);
  });
}
function texCinto(o) { return tex(64, 32, (g, w, h) => { g.fillStyle = o.calca; g.fillRect(0, 0, w, h); sombraU(g, w, h, 0.4); g.fillStyle = '#1a1714'; g.fillRect(0, h - 8, w, 6); g.fillStyle = '#9a9488'; g.fillRect(29, h - 8, 6, 6); g.fillStyle = o.calca; g.fillRect(31, h - 6, 2, 2); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(31, 0, 1, h - 8); g.fillRect(12, 8, 10, 1); g.fillRect(42, 8, 10, 1); }); }
function texBone(cor, frente) {
  return tex(32, 16, (g, w, h) => { g.fillStyle = cor; g.fillRect(0, 0, w, h); sombraU(g, w, h, 0.35); if (frente) { g.fillStyle = frente; g.fillRect(10, 5, 12, 11); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(14, 9, 4, 3); } g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 15, w, 1); for (const x of [8, 16, 24]) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, 0, 1, 15); } });
}
function texBandagem() { return tex(32, 32, (g, w, h) => { g.fillStyle = '#7a1c16'; g.fillRect(0, 0, w, h); const R = rnd(21); for (let i = 0; i < 40; i++) { g.fillStyle = R() < 0.5 ? '#4a0e0a' : '#9a3a2a'; g.fillRect(R() * w | 0, R() * h | 0, 3, 2); } g.fillStyle = '#b8a888'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3); g.fillStyle = 'rgba(30,5,5,.6)'; g.fillRect(10, 3, 2, 22); g.fillRect(11, 25, 1, 5); }); }

// ---------- rosto pintado (128x128), redesenhado só quando o estado muda ----------
// UV: u em volta (frente = 64), v de baixo (queixo) pra cima. Linhas: olhos ~61, sobrancelha ~49, boca ~97.
function pintaRosto(g, f, st) {
  const P = (c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const W = 128;
  P(f.pele, 0, 0, W, W);
  // sombreado pintado: laterais e nuca, embaixo do queixo, maçã do rosto
  for (let x = 0; x < W; x++) { const c = Math.cos((x / W - 0.5) * 2 * Math.PI), s = (1 - (0.5 + 0.5 * c)) * 0.42; g.fillStyle = `rgba(30,15,10,${s.toFixed(3)})`; g.fillRect(x, 0, 1, W); }
  g.fillStyle = 'rgba(40,20,15,.35)'; g.fillRect(0, 112, W, 16);
  mancha(g, 50, 80, 9, 'rgba(255,235,220,A)', 0.18); mancha(g, 78, 80, 9, 'rgba(255,235,220,A)', 0.18);
  g.fillStyle = 'rgba(40,20,15,.22)'; g.fillRect(40, 86, 10, 22); g.fillRect(78, 86, 10, 22);   // plano da bochecha (anguloso)
  if (f.manchas) for (const [x, y] of [[44, 92], [84, 96], [48, 70], [70, 40]]) P(f.manchas, x, y, 3, 2);
  // cabelo
  if (f.cabelo) {
    P(f.cabelo, 0, 0, W, 30); P(f.cabelo, 0, 0, 36, 96); P(f.cabelo, 92, 0, 36, 96);
    P(f.cabelo, 36, 26, 6, 46); P(f.cabelo, 86, 26, 6, 46);                     // costeletas
    for (let x = 42; x < 86; x += 4) P(f.cabelo, x, 30, 2, 2);                    // franjinha
  }
  if (f.grisalho) { P(f.grisalho, 0, 34, 38, 50); P(f.grisalho, 90, 34, 38, 50); P(f.grisalho, 38, 40, 5, 34); P(f.grisalho, 85, 40, 5, 34); }
  const ex = st.expr, medo = ex === 'medo', sorr = ex === 'sorriso';
  // sobrancelhas
  const sy = medo ? 45 : 48, sb = f.sobr;
  if (medo) { P(sb, 48, sy + 3, 5, 3); P(sb, 53, sy + 1, 6, 3); P(sb, 69, sy + 1, 6, 3); P(sb, 75, sy + 3, 5, 3); }
  else if (f.bravo) { P(sb, 48, sy, 5, 3); P(sb, 53, sy + 2, 6, 3); P(sb, 69, sy + 2, 6, 3); P(sb, 75, sy, 5, 3); }
  else { P(sb, 47, sy + 1, 12, 3); P(sb, 69, sy + 1, 12, 3); P(sb, 47, sy + 2, 2, 2); P(sb, 79, sy + 2, 2, 2); }
  // olhos
  const oy = 57, ow = 10, oh = medo || f.fixos ? 7 : 5;
  if (st.pisca) { P('#2a1812', 49, oy + 3, ow, 2); P('#2a1812', 69, oy + 3, ow, 2); }
  else {
    for (const ox of [49, 69]) {
      P('rgba(0,0,0,.35)', ox - 1, oy - 1, ow + 2, oh + 2);
      P('#e8e2d4', ox, oy, ow, oh);
      const ix = ox + 3 + (st.olhoX ?? 0), iw = f.fixos ? 4 : 4;
      P(f.olho, ix, oy, iw, oh); P('#0a0606', ix + 1, oy + (f.fixos ? 2 : 1), 2, f.fixos ? 2 : oh - 2);
      if (!f.fixos) P('#ffffff', ix + 2, oy + 1, 1, 1);
      P('#2a1812', ox, oy - 1, ow, 1);                                            // pálpebra
      if (f.olheira) { P(f.olheira, ox, oy + oh + 1, ow, 2); }
    }
  }
  // nariz (sombra) e narinas
  P('rgba(40,20,15,.35)', 65, 62, 4, 20); P('rgba(40,20,15,.5)', 59, 82, 3, 2); P('rgba(40,20,15,.5)', 67, 82, 3, 2);
  // rugas / sulco nasolabial
  if (f.rugas) { P('rgba(40,20,15,.45)', 54, 86, 2, 8); P('rgba(40,20,15,.45)', 52, 94, 2, 5); P('rgba(40,20,15,.45)', 72, 86, 2, 8); P('rgba(40,20,15,.45)', 74, 94, 2, 5); P('rgba(40,20,15,.3)', 50, 38, 28, 1); P('rgba(40,20,15,.3)', 52, 42, 24, 1); }
  // barba por fazer
  if (f.barba) { const R = rnd(7); for (let i = 0; i < 160; i++) { const x = 40 + R() * 48, y = 88 + R() * 32; if (Math.abs(x - 64) < 10 && y < 96) continue; P(f.barba, x | 0, y | 0, 1, 1); } }
  // boca: fechada / abrindo em 3 níveis / sorriso
  const my = 97, k = st.boca ?? 0, lv = k < 0.2 ? 0 : k < 0.5 ? 1 : k < 0.8 ? 2 : 3;
  if (sorr) {
    const ab = lv; P('#2a0e0c', 52, my - 2, 24, 4 + ab * 2); P('#ece6d6', 53, my - 2, 22, 2); if (ab > 1) P('#d8d0c0', 54, my + 1 + ab * 2, 20, 1);
    P('#2a0e0c', 50, my - 4, 3, 2); P('#2a0e0c', 75, my - 4, 3, 2);
  } else if (lv === 0) {
    if (medo) P('#2a0e0c', 59, my - 1, 10, 3); else { P(f.labio, 56, my - 1, 16, 2); P('rgba(255,220,200,.25)', 58, my + 1, 12, 1); P('rgba(0,0,0,.25)', 58, my + 3, 12, 1); }
  } else {
    const hh = 2 + lv * 3, ww = medo ? 12 : 14 - lv; P(f.labio, 64 - ww / 2 - 1, my - 2, ww + 2, hh + 2); P('#1c0806', 64 - ww / 2, my - 1, ww, hh);
    if (lv >= 2) P('#e0d8c8', 64 - ww / 2 + 1, my - 1, ww - 2, 1); if (lv >= 2) P('#8a3a34', 64 - ww / 2 + 2, my + hh - 2, ww - 4, 1);
  }
  if (f.bigode) { P(f.bigode, 53, my - 7, 22, 4); P(f.bigode, 51, my - 4, 4, 3); P(f.bigode, 73, my - 4, 4, 3); }
  if (f.suor) { P('#e8f4f8', 44, 34, 1, 3); P('#e8f4f8', 82, 42, 1, 3); P('#e8f4f8', 58, 30, 1, 2); P('#d0e4ee', 40, 70, 1, 3); }
}

// ---------- tipos ----------
export const TICO = { pele: '#c08a62', cabelo: '#24160e', sobr: '#1e120c', olho: '#3a2414', labio: '#7a443a', camisa: '#4e6a84', camisaDet: '#d8bc48', gola: '#3e566f', calca: '#272c36', sapato: '#1a1a1c', bone: '#2a3a52', boneTras: true, larg: 1, barriga: 0, alt: 1.74, polo: true };
export const TICO_PALIDO = { ...TICO, pele: '#b0a090', labio: '#7e706a', olheira: 'rgba(60,40,50,.45)' };
export const ALBERTO = { pele: '#d0b8a2', cabelo: null, grisalho: '#9a9690', sobr: '#7a7672', olho: '#2a2420', bigode: '#8e8a84', labio: '#8a5a52', camisa: '#3d5a3a', xadrez: '#1f2f22', xadrez2: '#8a7a3a', calca: '#2a3448', sapato: '#2a1e16', bone: '#1f2a44', boneFrente: '#d8d2c0', boneTras: false, larg: 1.18, barriga: 0.06, alt: 1.76, suor: true, olheira: 'rgba(90,60,70,.55)', manchas: '#b89a8a', curativo: true, rugas: true, barba: 'rgba(90,80,75,.55)' };
export const MIMICO = { ...ALBERTO, pele: '#e0b490', suor: false, olheira: null, manchas: null, curativo: false, fixos: true, labio: '#9a4a3a', barba: null };
export const VULTO = { vulto: true, pele: '#26262c', camisa: '#2a2a30', calca: '#202026', sapato: '#0e0e10', bone: null, larg: 0.85, barriga: 0, alt: 1.95 };

// pessoa low poly modelada. API: rosto(expr) | face({expr, boca, pisca}) | braco(lado, frente, abre, cot) | anda(fase,k) | parado() | respira(T,k)
//  | olhaPara(p, lim, tronco) | vira(p) | cab, tronco, bracos, pernas
export function pessoa(o) {
  const S = (o.alt ?? 1.75) / 1.75, L = o.larg ?? 1, B = o.barriga ?? 0, root = new THREE.Group(), corpo = new THREE.Group(); root.add(corpo); corpo.scale.set(S * (o.vulto ? 0.9 : 1), S, S);
  const V = !!o.vulto;
  const mCam = mat(V ? o.camisa : '#ffffff', { map: V ? null : (o.texCamisa ? o.texCamisa(false) : o.polo ? texPolo(o) : texFlanela(o)) });
  const mCal = mat(V ? o.calca : '#ffffff', { map: V ? null : texCalca(o) });
  const mCin = mat(V ? o.calca : '#ffffff', { map: V ? null : texCinto(o) });
  const mMan = mat(V ? o.camisa : '#ffffff', { map: V ? null : (o.texCamisa ? o.texCamisa(true) : o.polo ? texPolo(o, true) : texFlanela(o, true)) });
  const mSap = mat(o.sapato), mPele = mat(o.pele), mSola = mat(V ? '#0a0a0c' : '#3a3632');
  // ---- pernas: coxa e canela torneadas, joelho, sapato com bico ----
  const pernas = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Group(); p.position.set(s * 0.092 * L, 0.9, 0); corpo.add(p);
    p.add(M(anel([{ y: 0, rx: 0.088 * L, rz: 0.092 }, { y: -0.2, rx: 0.075 * L, rz: 0.08 }, { y: -0.42, rx: 0.056, rz: 0.062, dz: 0.005 }], 7), mCal));
    const joe = new THREE.Group(); joe.position.y = -0.42; p.add(joe);
    joe.add(M(anel([{ y: 0.02, rx: 0.058, rz: 0.064, dz: 0.006 }, { y: -0.12, rx: 0.056, rz: 0.06, dz: -0.006 }, { y: -0.36, rx: 0.046, rz: 0.048 }], 7), mCal));
    const pe = new THREE.Group(); pe.position.y = -0.4; joe.add(pe);
    const sg = tbox(0.1, 0.075, 0.27, 0.9, 0.75, 1); const sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { if (sp.getZ(i) > 0.05 && sp.getY(i) > 0) sp.setY(i, sp.getY(i) - 0.035); if (sp.getZ(i) > 0.1) sp.setX(i, sp.getX(i) * 0.8); }
    sg.computeVertexNormals(); pe.add(M(sg, mSap, 0, -0.04, 0.045)); pe.add(M(new THREE.BoxGeometry(0.104, 0.018, 0.27), mSola, 0, -0.072, 0.045));
    p.joe = joe; pernas.push(p);
  }
  // quadril com cinto
  corpo.add(M(anel([{ y: 0.8, rx: 0.13 * L, rz: 0.1 }, { y: 0.9, rx: 0.17 * L, rz: 0.115 + B * 0.5, dz: B * 0.3 }, { y: 1.0, rx: 0.155 * L, rz: 0.105 + B, dz: B * 0.5 }], 8), mCin));
  // ---- tronco: cintura -> barriga -> peito -> ombros -> base do pescoço ----
  const tronco = new THREE.Group(); tronco.position.y = 0.98; corpo.add(tronco);
  tronco.add(M(anel([
    { y: -0.04, rx: 0.15 * L, rz: 0.1 + B, dz: B * 0.5 },
    { y: 0.1, rx: (0.155 + B * 0.5) * L, rz: 0.108 + B * 1.6, dz: B },
    { y: 0.25, rx: 0.178 * L, rz: 0.118 + B * 0.8, dz: 0.012 + B * 0.4, sq: 0.15 },
    { y: 0.36, rx: 0.188 * L, rz: 0.112, dz: 0.008, sq: 0.08 },
    { y: 0.43, rx: 0.16 * L, rz: 0.09, sq: 0.05 },
    { y: 0.475, rx: 0.068, rz: 0.06 }], 8), mCam));
  // ---- braços: deltoide, braço (manga), antebraço, mão com polegar ----
  const bracos = {};
  for (const [lado, s] of [['E', -1], ['D', 1]]) {
    const om = new THREE.Group(); om.position.set(s * (0.185 * L + 0.02), 0.4, 0); tronco.add(om);
    const del = new THREE.Mesh(new THREE.SphereGeometry(0.07, 7, 4), V ? mCam : mat(o.polo || o.texCamisa ? o.camisa : o.xadrez)); del.scale.set(1, 0.85, 0.95); om.add(del);
    const longa = o.manga ? o.manga === 'longa' : !o.polo;
    om.add(M(anel([{ y: -0.035, rx: 0.062, rz: 0.064 }, { y: -0.15, rx: 0.06, rz: 0.06 }, ...(longa ? [{ y: -0.29, rx: 0.052, rz: 0.054 }] : [{ y: -0.16, rx: 0.058, rz: 0.058 }])], 7), mMan));
    if (!longa) om.add(M(anel([{ y: -0.12, rx: 0.046, rz: 0.048 }, { y: -0.3, rx: 0.042, rz: 0.044 }], 6), mPele));
    const cot = new THREE.Group(); cot.position.y = -0.29; om.add(cot);
    const curativo = o.curativo && lado === 'D';
    if (longa) cot.add(M(anel([{ y: 0.03, rx: 0.056, rz: 0.058 }, { y: -0.04, rx: 0.056, rz: 0.058 }], 7), mMan));   // manga dobrada
    cot.add(M(anel([{ y: 0, rx: 0.045, rz: 0.047 }, { y: -0.1, rx: 0.044, rz: 0.042 }, { y: -0.25, rx: 0.033, rz: 0.03 }], 7), V ? mMan : mPele));
    if (curativo) { const mb = mat('#ffffff', { map: texBandagem() }); cot.add(M(anel([{ y: -0.04, rx: 0.054, rz: 0.052 }, { y: -0.12, rx: 0.052, rz: 0.05 }, { y: -0.2, rx: 0.044, rz: 0.042 }], 7), mb)); cot.add(M(tbox(0.03, 0.07, 0.015, 0.5, 1), mb, s * 0.03, -0.1, 0.05)); }
    const mao = new THREE.Group(); mao.position.y = -0.25; cot.add(mao);
    const mM = V ? mat('#0c0c0e') : mPele;
    mao.add(M(tbox(0.068, 0.085, 0.03, 1.15, 1.1), mM, 0, -0.04, 0));
    const ded = new THREE.Group(); ded.position.y = -0.082; mao.add(ded); ded.add(M(tbox(0.072, 0.07, 0.024, 0.85, 0.8), mM, 0, -0.033, 0.002)); ded.rotation.x = -0.25;
    const pol = M(tbox(0.022, 0.05, 0.022, 0.8, 0.8), mM, -s * 0.038, -0.045, 0.016); pol.rotation.z = -s * 0.5; pol.rotation.x = -0.3; mao.add(pol);
    bracos[lado] = { om, cot, mao, ded };
  }
  // ---- pescoço e cabeça facetada ----
  const cab = new THREE.Group(); cab.position.y = 0.46; tronco.add(cab);
  cab.add(M(anel([{ y: -0.01, rx: 0.056, rz: 0.054 }, { y: 0.07, rx: 0.048, rz: 0.05, dz: 0.004 }], 7), mPele));
  const H0 = 0.045;   // altura do queixo acima da base do pescoço
  const RING = [
    { y: 0.0, rx: 0.03, rz: 0.028, dz: 0.052 }, { y: 0.03, rx: 0.062, rz: 0.06, dz: 0.03, sq: 0.55 },
    { y: 0.075, rx: 0.083, rz: 0.084, dz: 0.012, sq: 0.3 }, { y: 0.115, rx: 0.095, rz: 0.097, dz: 0.004, sq: 0.35 },
    { y: 0.15, rx: 0.093, rz: 0.103 }, { y: 0.195, rx: 0.09, rz: 0.101, dz: -0.004 },
    { y: 0.238, rx: 0.07, rz: 0.083, dz: -0.008 }, { y: 0.268, rx: 0.028, rz: 0.04, dz: -0.01 }];
  let faceCv = null, faceTex = null, headGeo = null, headBase = null, est = '';
  if (V) {
    const hg = anel(RING, 8); const h = M(hg, mPele, 0, H0, 0); cab.add(h);
    for (const s of [-1, 1]) cab.add(M(new THREE.BoxGeometry(0.03, 0.012, 0.01), luz('#cfd2b8'), s * 0.042, H0 + 0.145, 0.103));
  } else {
    faceTex = tex(128, 128, () => {}); faceCv = faceTex.g; faceTex.minFilter = THREE.NearestFilter; faceTex.generateMipmaps = false;
    headGeo = anel(RING, 8); headBase = headGeo.attributes.position.array.slice();
    cab.add(M(headGeo, mat('#ffffff', { map: faceTex }), 0, H0, 0));
    // nariz, orelhas
    const nz = M(tbox(0.03, 0.05, 0.03, 0.35, 0.3), mPele, 0, H0 + 0.112, 0.1); nz.rotation.x = -0.18; cab.add(nz);
    for (const s of [-1, 1]) { const e = M(tbox(0.016, 0.05, 0.034, 0.7, 0.8), mPele, s * 0.096, H0 + 0.13, -0.005); e.rotation.z = s * 0.15; cab.add(e); }
    if (o.bigode) cab.add(M(tbox(0.07, 0.016, 0.02, 1.1, 0.6), mat(o.bigode), 0, H0 + 0.084, 0.097));
    // boné: domo + aba (pra trás no Tico, pra frente no Alberto)
    if (o.bone) {
      const dome = new THREE.SphereGeometry(1, 8, 3, -Math.PI / 2, Math.PI * 2, 0, Math.PI / 2);
      const bn = M(dome, mat('#ffffff', { map: texBone(o.bone, o.boneTras ? null : o.boneFrente) }), 0, H0 + 0.19, -0.004); bn.scale.set(0.1, 0.085, 0.112); if (o.boneTras) bn.rotation.y = Math.PI; cab.add(bn);
      const ag = tbox(0.15, 0.012, 0.09, 1, 1); const aba = M(ag, mat(o.bone), 0, H0 + 0.195, o.boneTras ? -0.14 : 0.145); aba.rotation.x = o.boneTras ? -0.15 : 0.12; cab.add(aba);
      cab.add(M(new THREE.BoxGeometry(0.2, 0.012, 0.215), mat(o.bone), 0, H0 + 0.19, -0.004));
    }
  }
  root.cab = cab; root.tronco = tronco; root.bracos = bracos; root.pernas = pernas; root.corpo = corpo;
  // estado do rosto: expr 'normal' | 'medo' | 'sorriso'; boca 0..1; pisca
  root.face = (st = {}) => {
    if (V) return;
    const k = st.boca ?? 0, lv = k < 0.2 ? 0 : k < 0.5 ? 1 : k < 0.8 ? 2 : 3;
    const id = `${st.expr || 'normal'}|${lv}|${st.pisca ? 1 : 0}|${st.olhoX ?? 0}`;
    if (id !== est) { est = id; pintaRosto(faceCv, o, { expr: st.expr || 'normal', boca: k, pisca: st.pisca, olhoX: st.olhoX }); faceTex.needsUpdate = true; }
    // queixo desce com a fala
    const a = headGeo.attributes.position.array, drop = [0.018, 0.014, 0.004, 0, 0, 0, 0, 0].map(d => d * lv / 3);
    for (let i = 0; i < a.length / 3; i++) { const yb = headBase[i * 3 + 1]; let r = RING.findIndex(rr => Math.abs(rr.y - yb) < 1e-4); a[i * 3 + 1] = yb - (r >= 0 ? drop[r] : 0); }
    headGeo.attributes.position.needsUpdate = true;
  };
  // compatibilidade: rosto('normal' | 'fala' | 'pisca' | 'medo' | 'medoFala' | 'sorriso')
  root.rosto = (n) => root.face({ expr: n.startsWith('medo') ? 'medo' : n === 'sorriso' ? 'sorriso' : 'normal', boca: /fala|Fala/.test(n) ? 0.7 : 0, pisca: n === 'pisca' });
  root.face({});
  // frente: ergue o braço pra frente (rad), abre: afasta do corpo (rad), cot: dobra o cotovelo (rad), dedos: fecha a mão
  root.braco = (lado, frente = 0, abre = 0, cot = 0, dedos = 0.25) => { const b = bracos[lado], s = lado === 'D' ? 1 : -1; b.om.rotation.set(-frente, 0, s * (abre + 0.06)); b.cot.rotation.set(-cot, 0, 0); b.ded.rotation.x = -dedos; };
  root.anda = (fase, k = 1) => { const a = Math.sin(fase) * 0.5 * k; pernas[0].rotation.x = a; pernas[1].rotation.x = -a; pernas[0].joe.rotation.x = Math.max(0, Math.sin(fase - 1.2)) * 0.6 * k; pernas[1].joe.rotation.x = Math.max(0, Math.sin(fase + Math.PI - 1.2)) * 0.6 * k; root.braco('E', -a * 0.7, 0.06, 0.2); root.braco('D', a * 0.7, 0.06, 0.2); corpo.position.y = Math.abs(Math.cos(fase)) * 0.03 * k; tronco.rotation.y = a * 0.12; };
  root.parado = () => { pernas[0].rotation.x = pernas[1].rotation.x = 0; pernas[0].joe.rotation.x = pernas[1].joe.rotation.x = 0; corpo.position.y = 0; tronco.rotation.y = 0; };
  root.respira = (T, k = 1) => { tronco.scale.set(1, 1 + 0.01 * k * Math.sin(T * 1.7), 1 + 0.015 * k * Math.sin(T * 1.7)); };
  // olha para um ponto do mundo: cabeça (e um pouco o tronco, fração `tr`)
  root.olhaPara = (p, lim = 1.0, tr = 0.25) => {
    const w = root.position; const ang = Math.atan2(p[0] - w.x, p[2] - w.z) - root.rotation.y; let a = ((ang + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    a = clamp(a, -lim - 0.5, lim + 0.5); const at = clamp(a * tr, -0.45, 0.45); tronco.rotation.y = at; cab.rotation.y = clamp(a - at, -lim, lim);
    const dy = p[1] - (w.y + 1.58 * S), dist = Math.hypot(p[0] - w.x, p[2] - w.z); cab.rotation.x = clamp(-Math.atan2(dy, dist), -0.5, 0.5);
  };
  root.vira = (p) => { root.rotation.y = Math.atan2(p[0] - root.position.x, p[2] - root.position.z); };
  root.traverse(x => { if (x.isMesh) x.frustumCulled = false; });
  return root;
}

// ---------- mãos do Lucas (primeira pessoa) ----------
// antebraço torneado (pele) saindo da manga curta do uniforme, mão com palma/dedos/polegar que fecham;
// objetos na mão direita: pacote de bolacha, copo de café, cadeado. Escala com o FOV (mesma leitura em close).
function texBolacha() { return tex(64, 32, (g, w, h) => { g.fillStyle = '#e8c040'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a5ac0'; g.fillRect(0, 0, w, 8); g.fillStyle = '#ffffff'; g.font = 'bold 7px monospace'; g.textBaseline = 'top'; g.fillText('MAIZENA', 4, 0); for (let i = 0; i < 3; i++) { g.fillStyle = '#b8782c'; g.beginPath(); g.arc(14 + i * 16, 20, 7, 0, 7); g.fill(); g.fillStyle = '#9a5e20'; g.fillRect(12 + i * 16, 18, 1, 1); g.fillRect(16 + i * 16, 22, 1, 1); } g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 9, w, 1); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h - 2, w, 2); }); }
export function maos() {
  const g = new THREE.Group(), pele = mat('#d9a888'), manga = mat('#ffffff', { map: texPolo({ ...TICO, seed: 11 }, true) }), unha = mat('#e8c8b0');
  const mk = (s) => {
    const b = new THREE.Group();
    const arm = new THREE.Group(); arm.rotation.x = -Math.PI / 2; b.add(arm);   // ao longo de -z (pra frente)
    arm.add(M(anel([{ y: -0.62, rx: 0.06, rz: 0.058 }, { y: -0.42, rx: 0.058, rz: 0.056 }], 7), manga));
    arm.add(M(anel([{ y: -0.5, rx: 0.05, rz: 0.046 }, { y: -0.25, rx: 0.044, rz: 0.04 }, { y: -0.02, rx: 0.033, rz: 0.028 }], 7), pele));
    const mao = new THREE.Group(); b.add(mao);
    mao.add(M(tbox(0.074, 0.03, 0.09, 1.08, 1), pele, 0, 0, -0.045));
    const ded = new THREE.Group(); ded.position.set(0, 0, -0.088); mao.add(ded);
    for (let i = 0; i < 4; i++) { const f = M(tbox(0.016, 0.018, 0.07 - Math.abs(i - 1.5) * 0.008, 0.9, 0.9), pele, (i - 1.5) * 0.0185, -0.002, -0.032); ded.add(f); f.add(M(new THREE.BoxGeometry(0.012, 0.004, 0.012), unha, 0, 0.009, -0.025)); }
    const pol = M(tbox(0.022, 0.022, 0.06, 0.8, 0.8), pele, -s * 0.042, -0.006, -0.03); pol.rotation.y = s * 0.55; mao.add(pol);
    b.mao = mao; b.ded = ded; b.pol = pol; return b;
  };
  const D = mk(1), Esq = mk(-1); g.add(D, Esq); g.D = D; g.E = Esq;
  // pacote de bolacha
  const bol = new THREE.Group(); const mb = mat('#ffffff', { map: texBolacha() }); const bp = M(tbox(0.17, 0.05, 0.07, 0.96, 0.9), [mat('#e8c040'), mat('#e8c040'), mb, mat('#c8a030'), mb, mb]); bol.add(bp); g.bol = bol; D.mao.add(bol); bol.position.set(-0.05, 0.035, -0.06);
  // copo de café (papel, 7 lados, tampa de café escuro)
  const copo = new THREE.Group(); copo.add(M(anel([{ y: 0, rx: 0.026, rz: 0.026 }, { y: 0.095, rx: 0.035, rz: 0.035 }], 7), mat('#ece6d6'))); copo.add(M(anel([{ y: 0.03, rx: 0.031, rz: 0.031 }, { y: 0.06, rx: 0.033, rz: 0.033 }], 7, false), mat('#8a5a32'))); const caf = M(new THREE.CircleGeometry(0.032, 7), mat('#2a160c')); caf.rotation.x = -Math.PI / 2; caf.position.y = 0.088; copo.add(caf);
  g.copo = copo; D.mao.add(copo); copo.position.set(-0.01, -0.02, -0.07);
  // cadeado
  const cad = new THREE.Group(); const cb = M(tbox(0.06, 0.055, 0.025, 1, 1), mat('#b89a3a')); cad.add(cb); const arco = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 4, 8, Math.PI), mat('#9aa0a8')); arco.position.y = 0.028; cad.add(arco); g.cad = cad; D.mao.add(cad); cad.position.set(-0.01, 0.03, -0.075); cad.rotation.x = -1.2;
  // pose: kD/kE = 0 (fora do quadro) .. 1 (em quadro); fecha = dedos fechando (0..1); palma = mão aberta virada pra frente (encostar no vidro)
  const TAN0 = Math.tan(33 * Math.PI / 180);
  g.pose = (o = {}, cam = null) => {
    const kD = o.D ?? 0, kE = o.E ?? 0, f = cam ? TAN0 / Math.tan((cam.userData.fv ?? cam.fov) * Math.PI / 360) : 1;
    const set = (b, k, x, y, z, rx, ry, rz, fecha, palma) => {
      b.position.set(x * f, lerp(-0.62, y, k) * f, z * f); b.rotation.set(rx + (palma ? 1.25 : 0), ry, rz); b.visible = k > 0.01;
      b.scale.setScalar(1);
      b.ded.rotation.x = -fecha * 1.3 + (palma ? 0.05 : 0); b.ded.children.forEach((d, i) => d.rotation.x = -fecha * 0.4); b.pol.rotation.x = -fecha * 0.6;
    };
    set(D, kD, 0.13 + (o.dx ?? 0), -0.17 + (o.dy ?? 0), -0.44 + (o.dz ?? 0), o.rx ?? 0.25, o.ry ?? 0.12, o.rz ?? 0, o.fecha ?? (o.bol || o.copo || o.cad ? 0.7 : 0.25), o.palma);
    set(Esq, kE, -0.15 + (o.ex ?? 0), -0.19 + (o.ey ?? 0), -0.43 + (o.ez ?? 0), o.erx ?? 0.25, o.ery ?? -0.12, o.erz ?? 0, o.efecha ?? 0.25, o.epalma);
    bol.visible = !!o.bol; copo.visible = !!o.copo; cad.visible = !!o.cad;
  };
  g.traverse(x => { if (x.isMesh) x.frustumCulled = false; });
  return g;
}
