// TURNO DA MADRUGADA — gente low poly estilo PS1: tronco em caixa, cabeça em caixa com rosto pintado em pixel art,
// braços articulados (ombro/cotovelo), pernas com passo. Ninguém usa vermelho na cabeça (só o protagonista, que não aparece).
import { THREE, lam, luz, tex, box } from '/series/turno/ps1.js';
import { clamp, lerp, ease } from '/engine/core.js';

// ---------- rostos 32x32 em pixel art ----------
// f = { pele, olho, sobr, boca, bigode, suor, palido, sorriso, olhosFixos, pisca, aberta, medo }
function rosto(f) {
  return tex(32, 32, (g) => {
    const P = (c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    P(f.pele, 0, 0, 32, 32);
    P(f.sombra, 0, 26, 32, 6); P(f.sombra, 0, 0, 3, 32); P(f.sombra, 29, 0, 3, 32);
    if (f.cabelo) P(f.cabelo, 0, 0, 32, 5);
    // sobrancelhas
    const sy = f.medo ? 9 : 10;
    if (f.medo) { P(f.sobr, 7, sy + 1, 3, 1); P(f.sobr, 10, sy, 3, 1); P(f.sobr, 19, sy, 3, 1); P(f.sobr, 22, sy + 1, 3, 1); }
    else if (f.bravo) { P(f.sobr, 7, sy, 3, 1); P(f.sobr, 10, sy + 1, 3, 1); P(f.sobr, 19, sy + 1, 3, 1); P(f.sobr, 22, sy, 3, 1); }
    else { P(f.sobr, 7, sy, 6, 2); P(f.sobr, 19, sy, 6, 2); }
    // olhos
    if (f.pisca) { P('#2a1c18', 7, 14, 6, 1); P('#2a1c18', 19, 14, 6, 1); }
    else {
      const ow = f.medo || f.olhosFixos ? 6 : 5, oh = f.medo || f.olhosFixos ? 4 : 3;
      P('#f2efe6', 7, 12, ow, oh); P('#f2efe6', 19, 12, ow, oh);
      const px = f.olhosFixos ? 2 : 2, pw = f.medo ? 2 : 2;
      P(f.olho, 7 + px, 12 + (f.medo ? 1 : 0), pw, f.medo ? 2 : oh); P(f.olho, 19 + px, 12 + (f.medo ? 1 : 0), pw, f.medo ? 2 : oh);
      if (!f.olhosFixos) { P('#ffffff', 7 + px, 12, 1, 1); P('#ffffff', 19 + px, 12, 1, 1); }
      if (f.olheira) { P(f.olheira, 7, 12 + oh, ow, 1); P(f.olheira, 19, 12 + oh, ow, 1); }
    }
    // nariz
    P(f.sombra, 15, 15, 2, 4);
    // bigode
    if (f.bigode) P(f.bigode, 10, 20, 12, 2);
    // boca
    const my = f.bigode ? 23 : 22;
    if (f.sorriso) { P('#3a1414', 9, my, 14, 3); P('#f4f0e2', 10, my, 12, 2); P('#3a1414', 8, my - 1, 2, 1); P('#3a1414', 22, my - 1, 2, 1); }
    else if (f.aberta) { P('#3a1414', 12, my - 1, 8, 4); P('#c87070', 13, my + 2, 6, 1); }
    else if (f.medo) { P('#3a1414', 13, my, 6, 3); }
    else P(f.labio || '#7a3a32', 12, my, 8, 1);
    // suor / palidez
    if (f.suor) { P('#cfe6f0', 4, 9, 1, 2); P('#cfe6f0', 26, 13, 1, 2); P('#cfe6f0', 24, 5, 1, 2); }
    if (f.mancha) for (const [x, y] of [[5, 18], [25, 19], [6, 22]]) P(f.mancha, x, y, 2, 1);
  });
}
function rostos(base) {
  return { normal: rosto(base), fala: rosto({ ...base, aberta: true }), pisca: rosto({ ...base, pisca: true }), medo: rosto({ ...base, medo: true }), medoFala: rosto({ ...base, medo: true, aberta: true }), sorriso: rosto({ ...base, sorriso: true }) };
}

// ---------- tipos ----------
export const TICO = { pele: '#c08a62', sombra: '#a07050', cabelo: '#2a1a12', sobr: '#2a1a12', olho: '#3a2414', camisa: '#4f6a86', camisaDet: '#e0c64a', calca: '#2a2f3a', sapato: '#1a1a1c', bone: '#2c3e5a', boneTras: true, larg: 1, barriga: 0, alt: 1.74, labio: '#6e3a2c' };
export const TICO_PALIDO = { ...TICO, pele: '#b8a898', sombra: '#958676', labio: '#8a7a72', olheira: '#7a6a62' };
export const ALBERTO = { pele: '#d8cfc2', sombra: '#b0a698', cabelo: null, sobr: '#8a8a88', olho: '#2a2420', bigode: '#9a9690', camisa: '#3d5a3a', xadrez: '#1f2f22', xadrez2: '#7a6a3a', calca: '#2a3448', sapato: '#2a1e16', bone: '#1f2a44', boneTras: false, larg: 1.22, barriga: 0.12, alt: 1.76, suor: true, olheira: '#8a7e78', mancha: '#c9b8a8', curativo: true, labio: '#8a6a62' };
export const MIMICO = { ...ALBERTO, pele: '#e2b292', sombra: '#c49474', suor: false, olheira: null, mancha: null, curativo: false, olhosFixos: true, labio: '#9a4a3a' };
export const VULTO = { vulto: true, pele: '#3a3a42', sombra: '#141519', sobr: '#141519', olho: '#141519', camisa: '#36363e', calca: '#2c2c34', sapato: '#0e0e10', bone: null, larg: 0.85, barriga: 0, alt: 1.95 };

// pessoa low poly. Retorna Group com controles: rosto(nome), braco(lado, frente, abre, cotovelo), anda(fase, k), cabeca
export function pessoa(o) {
  const S = (o.alt ?? 1.75) / 1.75, L = o.larg ?? 1, root = new THREE.Group(), corpo = new THREE.Group(); root.add(corpo); corpo.scale.set(S * (o.vulto ? 0.9 : 1), S, S);
  const camTex = o.xadrez ? tex(16, 16, (g) => { g.fillStyle = o.camisa; g.fillRect(0, 0, 16, 16); g.fillStyle = o.xadrez; g.fillRect(0, 5, 16, 3); g.fillRect(5, 0, 3, 16); g.fillStyle = o.xadrez2; g.fillRect(0, 13, 16, 1); g.fillRect(13, 0, 1, 16); }, [2, 2]) : null;
  const mCam = lam(o.camisa, { map: camTex }), mCal = lam(o.calca), mSap = lam(o.sapato), mPele = lam(o.pele), mBone = o.bone ? lam(o.bone) : null;
  // pernas
  const pernas = [];
  for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(s * 0.11 * L, 0.92, 0); const m = box(0.17 * L, 0.88, 0.19, mCal, 0, -0.44, 0); const pe = box(0.17 * L, 0.09, 0.28, mSap, 0, -0.875, 0.05); p.add(m, pe); corpo.add(p); pernas.push(p); }
  // tronco
  const tronco = new THREE.Group(); tronco.position.y = 0.92; corpo.add(tronco);
  tronco.add(box(0.44 * L, 0.62, 0.25 + (o.barriga ?? 0), mCam, 0, 0.31, (o.barriga ?? 0) * 0.5));
  if (o.camisaDet) { tronco.add(box(0.1, 0.06, 0.02, lam(o.camisaDet), 0.1, 0.48, 0.14)); tronco.add(box(0.2, 0.06, 0.26, lam(o.camisaDet, {}), 0, 0.6, 0)); }
  tronco.add(box(0.46 * L, 0.06, 0.27 + (o.barriga ?? 0), lam('#1a1714'), 0, 0.02, (o.barriga ?? 0) * 0.5));   // cinto
  // braços
  const bracos = {};
  for (const [lado, s] of [['E', -1], ['D', 1]]) {
    const om = new THREE.Group(); om.position.set(s * (0.25 * L + 0.04), 0.57, 0); tronco.add(om);
    om.add(box(0.13, 0.32, 0.14, mCam, 0, -0.15, 0));
    const cot = new THREE.Group(); cot.position.y = -0.3; om.add(cot);
    const curativo = o.curativo && lado === 'D';
    cot.add(box(0.11, 0.27, 0.12, curativo ? lam('#8a1a14') : (o.vulto ? mCam : mPele), 0, -0.13, 0));
    if (curativo) cot.add(box(0.13, 0.17, 0.14, lam('#8a1410'), 0, -0.1, 0), box(0.132, 0.03, 0.142, lam('#c8b898'), 0, -0.02, 0), box(0.132, 0.03, 0.142, lam('#c8b898'), 0, -0.19, 0), box(0.04, 0.09, 0.03, lam('#c8b898'), 0.05, -0.08, 0.08));
    const mao = box(0.1, 0.1, 0.08, o.vulto ? lam('#0e0e11') : mPele, 0, -0.31, 0); cot.add(mao);
    bracos[lado] = { om, cot, mao };
  }
  // pescoço e cabeça
  const cab = new THREE.Group(); cab.position.y = 0.66; tronco.add(cab);
  cab.add(box(0.1, 0.08, 0.1, mPele, 0, 0.02, 0));
  let faces = null, mFace = null;
  if (o.vulto) { cab.add(box(0.2, 0.26, 0.22, lam(o.pele), 0, 0.18, 0)); for (const s of [-1, 1]) cab.add(box(0.035, 0.018, 0.01, luz('#d8d4b8'), s * 0.05, 0.2, 0.112)); }
  else {
    faces = rostos({ pele: o.pele, sombra: o.sombra, cabelo: o.cabelo, sobr: o.sobr, olho: o.olho, bigode: o.bigode, suor: o.suor, olheira: o.olheira, mancha: o.mancha, olhosFixos: o.olhosFixos, labio: o.labio });
    mFace = lam('#ffffff', { map: faces.normal });
    const cabelo = lam(o.cabelo || o.sombra), lados = lam(o.pele);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.27, 0.25), [lados, lados, cabelo, lados, mFace, cabelo]); head.position.y = 0.19; cab.add(head);
    if (mBone) {
      cab.add(box(0.25, 0.08, 0.27, mBone, 0, 0.31, 0));
      cab.add(box(0.21, 0.025, 0.14, mBone, 0, 0.285, o.boneTras ? -0.18 : 0.18));
      if (!o.boneTras) cab.add(box(0.12, 0.05, 0.01, lam('#d8d2c0'), 0, 0.31, 0.136));
    }
  }
  root.cab = cab; root.tronco = tronco; root.bracos = bracos; root.pernas = pernas; root.faces = faces; root.mFace = mFace;
  root.rosto = (n) => { if (faces && faces[n] && mFace.map !== faces[n]) { mFace.map = faces[n]; mFace.needsUpdate = true; } };
  // frente: ergue o braço pra frente (rad), abre: afasta do corpo (rad), cot: dobra o cotovelo (rad)
  root.braco = (lado, frente = 0, abre = 0, cot = 0) => { const b = bracos[lado], s = lado === 'D' ? 1 : -1; b.om.rotation.set(-frente, 0, s * abre); b.cot.rotation.set(-cot, 0, 0); };
  root.anda = (fase, k = 1) => { const a = Math.sin(fase) * 0.5 * k; pernas[0].rotation.x = a; pernas[1].rotation.x = -a; root.braco('E', -a * 0.7, 0.06, 0.15); root.braco('D', a * 0.7, 0.06, 0.15); corpo.position.y = Math.abs(Math.cos(fase)) * 0.03 * k; };
  root.parado = () => { pernas[0].rotation.x = pernas[1].rotation.x = 0; corpo.position.y = 0; };
  root.respira = (T, k = 1) => { tronco.scale.y = 1 + 0.012 * k * Math.sin(T * 1.7); };
  // olha para um ponto do mundo (só a cabeça; limitado)
  root.olhaPara = (p, lim = 0.9) => { const w = root.position; const ang = Math.atan2(p[0] - w.x, p[2] - w.z) - root.rotation.y; let a = ((ang + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; cab.rotation.y = clamp(a, -lim, lim); const dy = p[1] - (w.y + 1.62 * S), dist = Math.hypot(p[0] - w.x, p[2] - w.z); cab.rotation.x = clamp(-Math.atan2(dy, dist), -0.5, 0.5); };
  root.vira = (p) => { root.rotation.y = Math.atan2(p[0] - root.position.x, p[2] - root.position.z); };
  return root;
}

// mãos do Lucas (primeira pessoa): manga cinza do uniforme + mãos; presas à câmera
export function maos() {
  const g = new THREE.Group(), manga = lam('#6f7680'), pele = lam('#e8bfa0'), punho = lam('#585e68');
  const mk = (s) => { const b = new THREE.Group(); b.add(box(0.09, 0.09, 0.42, manga, 0, 0, 0.21)); b.add(box(0.095, 0.095, 0.04, punho, 0, 0, 0.02)); const m = box(0.085, 0.04, 0.11, pele, 0, 0, -0.04); b.add(m); b.add(box(0.025, 0.035, 0.05, pele, s * 0.05, 0.0, -0.02)); b.mao = m; return b; };
  const D = mk(-1), E = mk(1); g.add(D, E); g.D = D; g.E = E;
  // pacote de bolacha
  const bol = new THREE.Group(); bol.add(box(0.2, 0.06, 0.07, lam('#e8c040', { map: tex(16, 8, (c) => { c.fillStyle = '#e8c040'; c.fillRect(0, 0, 16, 8); c.fillStyle = '#3a6ad0'; c.fillRect(0, 0, 16, 2); c.fillStyle = '#7a4a20'; c.fillRect(5, 3, 6, 3); }) }))); g.bol = bol; D.add(bol); bol.position.set(-0.04, 0.045, -0.08);
  // cadeado
  const cad = new THREE.Group(); cad.add(box(0.06, 0.06, 0.025, lam('#b89a3a'))); const arco = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 4, 8, Math.PI), lam('#9aa0a8')); arco.position.y = 0.03; cad.add(arco); g.cad = cad; D.add(cad); cad.position.set(0, 0.05, -0.1); cad.visible = false;
  // pos: posições locais à câmera; k = 0 (escondidas) .. 1 (em quadro)
  g.pose = (o = {}) => {
    const kD = o.D ?? 0, kE = o.E ?? 0;
    D.position.set(0.17 + (o.dx ?? 0), lerp(-0.6, -0.25 + (o.dy ?? 0), kD), -0.42 + (o.dz ?? 0)); D.rotation.set(o.rx ?? 0.25, o.ry ?? 0.12, o.rz ?? 0);
    E.position.set(-0.19 + (o.ex ?? 0), lerp(-0.6, -0.27 + (o.ey ?? 0), kE), -0.4 + (o.ez ?? 0)); E.rotation.set(o.erx ?? 0.25, -0.12, 0);
    D.visible = kD > 0.01; E.visible = kE > 0.01; bol.visible = !!o.bol; cad.visible = !!o.cad;
  };
  return g;
}
