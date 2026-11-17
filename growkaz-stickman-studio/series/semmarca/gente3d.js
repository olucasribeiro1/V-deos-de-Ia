// Série "Sem Marca": gente 3D estilo desenho (cabeção redondo, olhos ovais pretos com brilho, sobrancelha grossa,
// sombreamento suave, roupa levemente facetada). Todos menos o protagonista têm a "Marca" no rosto: traços afilados
// presos à cabeça (filhos do grupo da cabeça), sob o olho esquerdo do personagem (direita da tela, de frente).
// Ninguém além do protagonista usa vermelho na CABEÇA (cabelo/chapéu/barba são desviados do vermelho automaticamente).
//
// pessoa3D(T, o) -> Group (pés em y=0, olha para +Z). Métodos: pose(p), anima(t, estado, opts), expressao(nome), olhar(yaw, pitch), olharPara(vec3)
// multidao3D(T, specs) -> Group com .update(t, cam, o)
// aparenciaAleatoria(seed, extra) -> opções de pessoa3D
// Presets: GUARDA, REI_MAGO, DIRETOR, ELFO, ANAO, GAROTO_FOGO, CRIANCA, MAGO, ARQUEIRO
import { rng, noise, ease, clamp, lerp } from '/engine/core.js';

export const ELEMENTOS = { fogo: '#ff4a1a', agua: '#2a9dff', terra: '#b8743a', vento: '#e8f4ff', raio: '#ffe23a', rara: '#ffd76a' };
export const ESTADOS = ['parado', 'andar', 'falar', 'apontar', 'rir', 'cochichar', 'carregar', 'martelar', 'arco', 'bracos_cruzados', 'surpreso', 'cajado'];
export const EXPRESSOES = ['neutro', 'sorriso', 'riso', 'surpreso', 'nojo', 'raiva', 'desconfiado', 'orgulho', 'medo'];

// ---------------- caches ----------------
const GEO = new Map(), MAT = new Map(), TEX = new Map();
const geo = (k, mk) => { let g = GEO.get(k); if (!g) { g = mk(); GEO.set(k, g); } return g; };
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const frac = (x) => x - Math.floor(x);

function mat(T, cor, o = {}) {
  const THREE = T.THREE, k = [cor, o.r, o.m, o.e, o.ei, o.ds, o.flat, o.tex].join('|');
  let m = MAT.get(k); if (m) return m;
  m = new THREE.MeshStandardMaterial({ color: new THREE.Color(cor), roughness: o.r ?? 0.72, metalness: o.m ?? 0, flatShading: !!o.flat, side: o.ds ? THREE.DoubleSide : THREE.FrontSide });
  if (o.e) { m.emissive = new THREE.Color(o.e); m.emissiveIntensity = o.ei ?? 1; }
  if (o.tex) m.map = textura(T, o.tex);
  MAT.set(k, m); return m;
}
function textura(T, nome) {
  if (TEX.has(nome)) return TEX.get(nome);
  let t;
  if (nome === 'malha') t = T.canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#9aa0aa'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,44,52,.55)'; g.lineWidth = 3; for (let y = 0; y < h + 8; y += 10) for (let x = (y / 10) % 2 ? -6 : 0; x < w + 8; x += 12) { g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.stroke(); } }, [3, 3]);
  else t = T.canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#8a5a32'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.06)'; g.fillRect(0, i * 16, w, 16); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, i * 16, w, 2); } }, [1, 1]);
  TEX.set(nome, t); return t;
}
// nada vermelho na cabeça (só o protagonista): desvia matiz vermelho para marrom/vinho escuro neutro
function semVermelho(T, c) {
  if (!c) return c; const col = new T.THREE.Color(c), hsl = {}; col.getHSL(hsl);
  if ((hsl.h < 0.045 || hsl.h > 0.93) && hsl.s > 0.35 && hsl.l > 0.12) { col.setHSL(0.07, Math.min(hsl.s, 0.45), Math.min(hsl.l, 0.32)); return '#' + col.getHexString(); }
  return c;
}
function malha(T, g, m, x = 0, y = 0, z = 0, sombra = true) { const me = new T.THREE.Mesh(g, m); me.position.set(x, y, z); me.castShadow = sombra; me.receiveShadow = true; return me; }

// geometrias base
const G = {
  esf: (T) => geo('esf', () => new T.THREE.SphereGeometry(1, 22, 16)),
  esfP: (T) => geo('esfP', () => new T.THREE.SphereGeometry(1, 12, 8)),
  esfF: (T) => geo('esfF', () => new T.THREE.IcosahedronGeometry(1, 2)), // facetada
  cap: (T, r, l) => geo(`cap${r}_${l}`, () => { const g = new T.THREE.CapsuleGeometry(r, l, 3, 9); g.translate(0, -l / 2, 0); return g; }),
  saia: (T, rt, rb, h, ts = 0, tl = Math.PI * 2, seg = 14) => geo(`saia${rt}_${rb}_${h}_${ts}_${tl}`, () => { const g = new T.THREE.CylinderGeometry(rt, rb, h, seg, 2, true, ts, tl); g.translate(0, -h / 2, 0); return g; }),
  arco: (T) => geo('arco', () => new T.THREE.TorusGeometry(1, 0.2, 6, 18, 2.2)),
  sobr: (T) => geo('sobr', () => { const g = new T.THREE.CapsuleGeometry(0.5, 1.6, 3, 8); g.rotateZ(Math.PI / 2); return g; }),
  gota: (T) => geo('gota', () => { const g = new T.THREE.SphereGeometry(1, 12, 10), P = g.attributes.position; // traço afilado: grosso em cima, ponta embaixo
    for (let i = 0; i < P.count; i++) { const y = P.getY(i), k = 0.18 + 0.82 * Math.pow((y + 1) / 2, 0.8); P.setX(i, P.getX(i) * k); P.setZ(i, P.getZ(i) * (0.4 + 0.6 * k)); } g.computeVertexNormals(); return g; }),
  tronco: (T, tr, h, an) => geo(`tr${tr}_${h}_${an}`, () => { const V2 = T.THREE.Vector2, b = an ? 1.08 : 1; // barriga
    const pts = [[0.001, -0.035], [tr * 0.7, -0.03], [tr * 0.95 * b, 0.05], [tr * b, 0.2 * h], [tr * 0.97 * b, 0.42 * h], [tr * 0.9, 0.62 * h], [tr * 0.8, 0.8 * h], [tr * 0.6, 0.93 * h], [tr * 0.25, h], [0.001, h + 0.004]];
    const g = new T.THREE.LatheGeometry(pts.map(p => new V2(p[0], p[1])), 14); return g; }),
};

// ---------------- rosto ----------------
// socket na superfície da esfera da cabeça: z local = normal pra fora
function sock(T, pai, R, yaw, pitch, off = 0) { const s = new T.THREE.Group(); s.rotation.order = 'YXZ'; s.rotation.set(-pitch, yaw, 0); const i = new T.THREE.Group(); i.position.z = R + off; s.add(i); pai.add(s); i.userData.s = s; return i; }

const EXPR = {
  neutro: { olho: [1, 1], sob: [0.05, -0.05, 0, 0], boca: { t: 'arco', c: 1, w: 0.85, h: 0.45 } },
  sorriso: { olho: [1, 0.92], sob: [-0.12, 0.12, 0.03, 0.03], boca: { t: 'arco', c: 1, w: 1.15, h: 1.05 } },
  riso: { fecha: 1, olho: [1, 1], sob: [-0.18, 0.18, 0.06, 0.06], boca: { t: 'aberta', w: 1.15, h: 1.0 } },
  surpreso: { olho: [1.18, 1.25], sob: [-0.1, 0.1, 0.1, 0.1], boca: { t: 'aberta', w: 0.55, h: 0.75 } },
  nojo: { olho: [1, 0.62], sob: [0.3, -0.35, -0.02, 0.05], boca: { t: 'arco', c: -1, w: 0.75, h: 0.6, d: 0.06, rot: 0.25 } },
  raiva: { olho: [1, 0.78], sob: [0.5, -0.5, -0.04, -0.04], boca: { t: 'arco', c: -1, w: 0.95, h: 0.75 } },
  desconfiado: { olho: [1, 0.5], sob: [0.22, -0.25, -0.03, 0.06], boca: { t: 'arco', c: 1, w: 0.6, h: 0.12, d: 0.07 } },
  orgulho: { olho: [1, 0.6], sob: [-0.18, 0.18, 0.05, 0.05], boca: { t: 'arco', c: 1, w: 0.95, h: 0.8, d: 0.05, rot: -0.2 }, cab: -0.12 },
  medo: { olho: [1.15, 1.2], sob: [-0.45, 0.45, 0.06, 0.06], boca: { t: 'aberta', w: 0.65, h: 0.32 }, treme: 1 },
};

// ---------------- pessoa ----------------
const DEF = { pele: '#f2c29a', cabelo: { tipo: 'curto', cor: '#5a3a22' }, chapeu: null, chapeuCor: '#5a4632', roupa: 'tunica', cor: '#3a7ad8', cor2: '#f2ead8', capa: null, calca: '#5a4a3a', bota: '#4a3020', marca: { n: 1, cor: ELEMENTOS.fogo, brilho: 0.6 }, barba: null, orelhaElfo: false, anao: false, crianca: false, seed: 1 };

export function pessoa3D(T, opc = {}) {
  const THREE = T.THREE, o = { ...DEF, ...opc, cabelo: { ...DEF.cabelo, ...(opc.cabelo || {}) } };
  const kid = !!o.crianca, anao = !!o.anao, sd = o.seed ?? 1, rr = rng(sd * 7 + 3);
  const P = kid ? { coxa: 0.2, canela: 0.19, tronco: 0.38, tr: 0.17, R: 0.25, braco: 0.2, ante: 0.18, omb: 0.19, quad: 0.075 }
    : anao ? { coxa: 0.17, canela: 0.16, tronco: 0.48, tr: 0.25, R: 0.25, braco: 0.24, ante: 0.21, omb: 0.27, quad: 0.12 }
    : { coxa: 0.29, canela: 0.28, tronco: 0.5, tr: 0.19, R: 0.24, braco: 0.27, ante: 0.25, omb: 0.215, quad: 0.09 };
  const pe = 0.075, hipY = pe + P.coxa + P.canela, R = P.R, H = P.tronco;
  const std = hipY + H + 0.03 + R * 1.95;
  const altura = o.altura ?? (kid ? 1.15 : anao ? 1.3 : 1.7), esc = altura / std;
  const facet = o.facetado !== false; // roupa levemente facetada (estilo papel/low-poly)
  const pele = o.pele, cabC = semVermelho(T, o.cabelo?.cor || '#3a2a1a'), chC = semVermelho(T, o.chapeuCor), barbaC = semVermelho(T, o.barba);
  const mPele = mat(T, pele, { r: 0.6 }), mRoupa = mat(T, o.cor, { r: 0.75, flat: facet }), mRoupa2 = mat(T, o.cor2, { r: 0.75, flat: facet }),
    mCalca = mat(T, o.calca, { r: 0.8, flat: facet }), mBota = mat(T, o.bota, { r: 0.65 }), mCab = mat(T, cabC, { r: 0.7, flat: facet }),
    mPreto = mat(T, '#141016', { r: 0.35 }), mBranco = mat(T, '#ffffff', { r: 0.2, e: '#ffffff', ei: 0.6 }), mBoca = mat(T, '#5a1a22', { r: 0.6 }),
    mLingua = mat(T, '#ff7a8a', { r: 0.6 }), mCinto = mat(T, '#4a2e1a', { r: 0.6 }), mOuro = mat(T, '#ffc83a', { r: 0.3, m: 0.7 }),
    mMetal = mat(T, '#b8c0cc', { r: 0.32, m: 0.75, flat: true }), mMalha = mat(T, '#ffffff', { r: 0.55, m: 0.4, tex: 'malha' });
  const armadura = o.roupa === 'armadura', robe = o.roupa === 'manto_longo', vestido = o.roupa === 'vestido';
  const mTorso = armadura ? mMalha : mRoupa;

  const root = new THREE.Group(), corpo = new THREE.Group(); corpo.scale.setScalar(esc); root.add(corpo);
  const J = {}; const grp = (nome, pai, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); pai.add(g); J[nome] = g; g.userData.base = g.position.clone(); return g; };
  const add = (pai, ...ms) => { ms.forEach(m => pai.add(m)); return ms[0]; };

  // quadril / tronco
  const hips = grp('hips', corpo, 0, hipY, 0);
  const torso = grp('torso', hips);
  const tm = add(torso, malha(T, G.tronco(T, P.tr, H, anao), mTorso)); tm.scale.z = 0.84;
  // cinto
  const cinto = add(torso, malha(T, geo('cinto' + P.tr, () => new THREE.TorusGeometry(P.tr * 1.0, 0.026, 6, 20)), robe ? mRoupa2 : mCinto, 0, 0.08, 0)); cinto.rotation.x = Math.PI / 2; cinto.scale.y = 0.86;
  if (!robe) add(torso, malha(T, G.esfP(T), mOuro, 0, 0.08, P.tr * 0.86 + 0.02, false)).scale.set(0.032, 0.03, 0.012);
  // saia (túnica / vestido / manto / armadura), presa ao quadril
  const compr = vestido ? hipY - 0.13 : robe ? hipY - 0.02 : P.coxa * 0.9, rb = vestido || robe ? (kid ? 0.27 : anao ? 0.36 : 0.35) : P.tr * 1.3;
  const saia = add(hips, malha(T, G.saia(T, P.tr * 1.03, rb, compr + 0.08), armadura ? mMalha : mRoupa, 0, 0.1, 0)); saia.scale.z = 0.86;
  if (vestido || anao) { const av = add(hips, malha(T, G.saia(T, P.tr * 1.06, rb * 1.03, (compr + 0.06) * (anao ? 1.1 : 0.85), -0.8, 1.6, 8), mat(T, anao ? '#7a4a28' : o.cor2, { r: 0.8, ds: true, flat: facet }), 0, 0.08, 0)); av.scale.z = 0.88; }
  if (robe) { const fx = add(hips, malha(T, G.saia(T, rb * 0.97, rb * 1.01, 0.07), mRoupa2, 0, 0.1 - compr - 0.01, 0)); fx.scale.z = 0.87; }
  if (armadura) { const tb = add(torso, malha(T, geo('tabardo', () => new THREE.BoxGeometry(0.2, 0.62, 0.02)), mat(T, o.cor2, { r: 0.8 }), 0, 0.12, P.tr * 0.84 + 0.01)); tb.rotation.x = -0.06; }
  // pescoço e cabeça
  const neck = grp('neck', torso, 0, H - 0.01, 0); add(neck, malha(T, G.cap(T, 0.06, 0.04), mPele, 0, 0.06, 0));
  const head = grp('head', neck, 0, 0.03, 0);
  const cab = new THREE.Group(); cab.position.set(0, R * 0.93, 0.01); head.add(cab);
  add(cab, malha(T, G.esf(T), mPele)).scale.setScalar(R);
  // orelhas
  for (const s of [-1, 1]) { if (o.orelhaElfo) { const e = add(cab, malha(T, geo('elfo', () => { const g = new THREE.ConeGeometry(0.04, 0.17, 8); g.translate(0, 0.085, 0); return g; }), mPele, s * R * 0.93, -0.01, -0.02)); e.rotation.set(-0.35, 0, -s * 1.05); e.scale.z = 0.55; }
    else add(cab, malha(T, G.esfP(T), mPele, s * R * 0.97, -0.02, -0.01)).scale.set(0.03, 0.055, 0.045); }
  add(cab, malha(T, G.esfP(T), mat(T, pele, { r: 0.55 }), 0, -0.055, R * 0.98, false)).scale.set(0.03, 0.026, 0.026); // nariz
  // olhos (ovais pretos + brilho), olhos fechados (arcos), sobrancelhas grossas
  const rosto = { olhos: [], fech: [], brilhos: [], sob: [], sobS: [] };
  for (const s of [-1, 1]) {
    const so = sock(T, cab, R, s * 0.3, 0.03, -0.006);
    const ol = malha(T, G.esf(T), mPreto, 0, 0, 0, false); ol.scale.set(0.04, 0.058, 0.022); so.add(ol); rosto.olhos.push(ol);
    const br = malha(T, G.esfP(T), mBranco, 0, 0, 0, false); br.position.set(-0.011, 0.02, 0.019); br.scale.set(0.011, 0.013, 0.006); ol.add(br); br.scale.divide(ol.scale); br.position.divide(ol.scale); rosto.brilhos.push(br);
    const fc = malha(T, G.arco(T), mPreto, 0, -0.012, 0.004, false); fc.rotation.z = Math.PI / 2 - 1.1; fc.scale.setScalar(0.04); fc.visible = false; so.add(fc); rosto.fech.push(fc);
    const ss = sock(T, cab, R, s * 0.3, 0.37, 0.0); const sb = malha(T, G.sobr(T), mat(T, o.cabelo?.tipo === 'careca' && !barbaC ? '#3a2a20' : (barbaC && o.cabelo?.tipo === 'careca' ? barbaC : cabC), { r: 0.8 }), 0, 0, 0, false);
    sb.scale.set(0.04, 0.034, 0.018); ss.add(sb); rosto.sob.push(sb); rosto.sobS.push(ss.userData.s);
  }
  const bocaS = sock(T, cab, R, 0, -0.17, 0.002);
  const bocaA = malha(T, G.arco(T), mBoca, 0, 0, 0, false); bocaS.add(bocaA);
  const bocaO = malha(T, G.esf(T), mBoca, 0, -0.06, -0.006, false); bocaS.add(bocaO);
  const lingua = malha(T, G.esfP(T), mLingua, 0, -0.45, 0.25, false); bocaO.add(lingua); lingua.scale.set(0.6, 0.4, 0.8);
  rosto.boca = bocaA; rosto.bocaO = bocaO; rosto.bocaS = bocaS;
  // marca: traços presos à bochecha (filhos do grupo da cabeça)
  const mk = o.marca;
  if (mk && mk.n > 0) { const n = clamp(mk.n | 0, 1, 3), cor = mk.cor || ELEMENTOS.fogo, mM = mat(T, cor, { r: 0.4, e: cor, ei: mk.brilho ?? 0.6 });
    for (let i = 0; i < n; i++) { const yaw = 0.42 + (i - (n - 1) / 2) * 0.12, sm = sock(T, cab, R, yaw, -0.27 + Math.abs(i - (n - 1) / 2) * 0.025, -0.004);
      const tr = malha(T, G.gota(T), mM, 0, 0, 0, false); tr.scale.set(0.013, 0.042, 0.012); tr.rotation.z = -0.1; sm.add(tr); }
    rosto.marca = mM; }
  // bochechas rosadas (mais pra fora/acima, sem colidir com a marca) e óculos redondos opcionais
  if (o.blush !== false) { const mb = mat(T, o.blushCor || '#ff8a9a', { r: 0.8 }); for (const s of [-1, 1]) { const so = sock(T, cab, R, s * 0.66, -0.1, -0.008); const b = malha(T, G.esfP(T), mb, 0, 0, 0, false); b.scale.set(0.034, 0.024, 0.012); so.add(b); } }
  if (o.oculos) { const mo = mat(T, o.oculos === true ? '#3a2a1a' : o.oculos, { r: 0.35, m: 0.5 }); for (const s of [-1, 1]) { const so = sock(T, cab, R, s * 0.3, 0.03, 0.022); so.add(malha(T, geo('aro', () => new THREE.TorusGeometry(0.058, 0.008, 6, 20)), mo, 0, 0, 0, false)); }
    const ponte = add(cab, malha(T, geo('ponte', () => new THREE.CylinderGeometry(0.006, 0.006, 0.05, 5)), mo, 0, 0.02, R * 1.05, false)); ponte.rotation.z = Math.PI / 2; }
  // cabelo
  const tipo = o.cabelo?.tipo || 'curto', cobre = ['elmo', 'capuz', 'lenco', 'pontudo'].includes(o.chapeu);
  if (tipo !== 'careca' && !cobre) { const cp = add(cab, malha(T, geo('cabelo', () => new THREE.SphereGeometry(1, 18, 12, 0, Math.PI * 2, 0, 1.55)), mCab)); cp.scale.setScalar(R * 1.055); cp.rotation.x = -0.5; cp.rotation.z = (rr() - 0.5) * 0.12; }
  if (tipo === 'coque' && !cobre) add(cab, malha(T, G.esfF(T), mCab, 0, R * 0.78, -R * 0.62)).scale.setScalar(0.1);
  if (tipo === 'longo' && o.chapeu !== 'elmo') { const cm = o.cabelo.compr ?? 1, lg = add(cab, malha(T, cm > 1.2 ? G.gota(T) : G.esfF(T), mCab, 0, -R * (0.38 + 0.5 * (cm - 1)), -R * 0.42)); lg.scale.set(R * 1.02, R * 1.15 * cm, R * 0.62); }
  // chapéus
  const ch = o.chapeu;
  if (ch === 'feltro') { const hg = new THREE.Group(); hg.position.y = R * 0.52; hg.rotation.set(-0.12, 0, 0.08); cab.add(hg); const mh = mat(T, chC || '#5a4632', { r: 0.85, flat: facet });
    add(hg, malha(T, geo('aba', () => new THREE.CylinderGeometry(1, 1, 0.025, 20)), mh)).scale.set(R * 1.45, 1, R * 1.45);
    add(hg, malha(T, geo('copa', () => new THREE.CylinderGeometry(0.62, 0.9, 1, 14)), mh, 0, 0.1, 0)).scale.set(R * 0.92, 0.2, R * 0.92);
    const pena = add(hg, malha(T, G.esfF(T), mat(T, o.pena || '#ffe14a', { r: 0.6, flat: true }), R * 0.72, 0.17, -0.06)); pena.scale.set(0.022, 0.15, 0.04); pena.rotation.set(-0.6, 0, -0.5); }
  if (ch === 'pontudo') { const mh = mat(T, chC || '#3a3aa0', { r: 0.8, flat: true }), hg = new THREE.Group(); hg.position.y = R * 0.45; hg.rotation.set(-0.1, 0, 0.05); cab.add(hg);
    add(hg, malha(T, geo('abaP', () => new THREE.CylinderGeometry(1, 1, 0.03, 18)), mh)).scale.set(R * 1.55, 1, R * 1.55);
    const cn = add(hg, malha(T, geo('cone', () => { const g = new THREE.ConeGeometry(1, 1, 12, 4); g.translate(0, 0.5, 0); const P2 = g.attributes.position; for (let i = 0; i < P2.count; i++) { const y = P2.getY(i); P2.setZ(i, P2.getZ(i) - y * y * 0.35); } g.computeVertexNormals(); return g; }), mh, 0, 0.01, 0)); cn.scale.set(R * 0.95, 0.62, R * 0.95);
    add(hg, malha(T, geo('faixaP', () => new THREE.CylinderGeometry(0.9, 0.97, 1, 14, 1, true)), mat(T, o.cor2 || '#ffd23a', { r: 0.5 }), 0, 0.04, 0)).scale.set(R * 0.97, 0.06, R * 0.97); }
  if (ch === 'lenco') { const mh = mat(T, chC || '#d8b04a', { r: 0.85, flat: facet }); const ln = add(cab, malha(T, geo('lenco', () => new THREE.SphereGeometry(1, 18, 12, 0, Math.PI * 2, 0, 1.75)), mh)); ln.scale.setScalar(R * 1.07); ln.rotation.x = -0.55;
    add(cab, malha(T, G.esfF(T), mh, 0, -R * 0.35, -R * 0.98)).scale.set(0.07, 0.06, 0.05); }
  if (ch === 'capuz') { const mh = mat(T, chC || o.capa || '#4a6a3a', { r: 0.85, ds: true, flat: facet }); const hd = add(cab, malha(T, geo('capuz', () => new THREE.SphereGeometry(1, 18, 12, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, 2.3)), mh, 0, 0.02, -0.01)); hd.scale.set(R * 1.13, R * 1.15, R * 1.15);
    const bico = add(cab, malha(T, geo('bico', () => new THREE.ConeGeometry(1, 1, 10)), mh, 0, R * 0.95, -R * 0.75)); bico.scale.set(0.09, 0.2, 0.09); bico.rotation.x = -1.1; }
  if (ch === 'elmo') { const el = add(cab, malha(T, geo('elmo', () => new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2)), mMetal, 0, R * 0.08, 0)); el.scale.setScalar(R * 1.1); el.rotation.x = -0.12;
    const ab = add(cab, malha(T, geo('abaE', () => new THREE.TorusGeometry(1, 0.06, 6, 22)), mMetal, 0, R * 0.12, -0.0)); ab.scale.setScalar(R * 1.1); ab.rotation.x = Math.PI / 2 - 0.12;
    add(cab, malha(T, geo('nasal', () => new THREE.BoxGeometry(0.03, 0.12, 0.02)), mMetal, 0, R * 0.2, R * 1.08)).rotation.x = 0.15;
    add(cab, malha(T, G.esfP(T), mMetal, 0, R * 1.12, -0.02)).scale.set(0.03, 0.04, 0.12); }
  if (ch === 'coroa') { const hg = new THREE.Group(); hg.position.y = R * 0.66; cab.add(hg); const mo = mat(T, o.coroaCor || '#ffc83a', { r: 0.3, m: 0.75, ds: true, flat: true }), alta = o.coroaAlta ? 2.2 : 1;
    add(hg, malha(T, geo('coroa', () => new THREE.CylinderGeometry(0.8, 0.74, 0.11, 18, 1, true)), mo)).scale.set(R, 1, R);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; const pt = add(hg, malha(T, geo('ponta', () => { const g = new THREE.ConeGeometry(0.035, 0.09, 6); g.translate(0, 0.045, 0); return g; }), mo, Math.sin(a) * R * 0.79, 0.05, Math.cos(a) * R * 0.79)); pt.scale.y = alta * (i % 2 ? 0.8 : 1.1); }
    add(hg, malha(T, G.esfF(T), mat(T, '#3ac8ff', { r: 0.15, e: '#2a9dff', ei: 0.5 }), 0, 0.0, R * 0.8 + 0.01, false)).scale.set(0.026, 0.026, 0.014); }
  // barba
  if (barbaC) { const mb = mat(T, barbaC, { r: 0.85, flat: true });
    const longa = !anao && (opc.barbaLonga ?? true), mtx = o.barbaCompr ?? 1;
    const bd = longa ? add(cab, malha(T, G.gota(T), mb, 0, -R * (0.95 + 0.55 * mtx), R * 0.5)) : add(cab, malha(T, G.esfF(T), mb, 0, anao ? -R * 0.98 : -R * 1.0, R * (anao ? 0.52 : 0.5)));
    if (longa) { bd.scale.set(0.16, 0.2 + 0.14 * mtx, 0.11); bd.rotation.x = 0.22; } else { bd.scale.set(anao ? 0.2 : 0.15, anao ? 0.24 : 0.1, anao ? 0.13 : 0.1); bd.rotation.x = 0.18; if (!anao) bd.position.set(0, -R * 0.82, R * 0.45); }
    for (const s of [-1, 1]) { const bg = add(cab, malha(T, G.esfF(T), mb, s * 0.038, -R * 0.5, R * 0.9, false)); bg.scale.set(0.045, 0.024, 0.03); bg.rotation.z = s * 0.35; } }
  // capa (presa ao topo do tronco) + gola
  let capa = null;
  if (o.capa) { const mc = mat(T, o.capa, { r: 0.85, ds: true, flat: facet }); capa = new THREE.Group(); capa.position.set(0, H * 0.9, -0.02); torso.add(capa);
    const L = H * 0.9 + hipY - (kid ? 0.2 : 0.28); const cm = add(capa, malha(T, G.saia(T, P.tr * 0.95, P.tr * 1.9, L, Math.PI / 2 - 0.25, Math.PI + 0.5, 12), mc)); cm.scale.z = 0.95;
    const gl = add(torso, malha(T, geo('gola' + P.tr, () => new THREE.TorusGeometry(P.tr * 0.55, 0.04, 6, 16)), mc, 0, H * 0.93, 0)); gl.rotation.x = Math.PI / 2; }
  // braços (manga na cor da roupa; manto tem manga em sino)
  const mManga = armadura ? mMalha : mRoupa;
  const mao = {};
  for (const [s, L] of [[1, 'L'], [-1, 'R']]) {
    const sh = grp('sh' + L, torso, s * P.omb, H * 0.83, 0); add(sh, malha(T, G.cap(T, 0.062, P.braco), mManga));
    if (armadura) { const pa = add(sh, malha(T, geo('ombreira', () => new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, 1.4)), mMetal, s * 0.01, 0.02, 0)); pa.scale.set(0.1, 0.08, 0.1); pa.rotation.z = -s * 0.3; }
    const el = grp('el' + L, sh, 0, -P.braco, 0);
    if (robe) add(el, malha(T, geo('sino' + P.ante, () => { const g = new THREE.CylinderGeometry(0.06, 0.11, P.ante * 0.95, 12, 1, true); g.translate(0, -P.ante * 0.47, 0); return g; }), mat(T, o.cor, { r: 0.75, ds: true, flat: facet })));
    else add(el, malha(T, G.cap(T, 0.055, P.ante), mManga));
    const ha = grp('ha' + L, el, 0, -P.ante, 0); add(ha, malha(T, G.esfP(T), armadura ? mMetal : mPele, 0, -0.035, 0.005)).scale.set(0.066, 0.07, 0.062);
    mao[L] = ha;
  }
  // pernas
  for (const [s, L] of [[1, 'L'], [-1, 'R']]) {
    const lg = grp('leg' + L, hips, s * P.quad, 0, 0); if (!(vestido || robe)) add(lg, malha(T, G.cap(T, 0.072, P.coxa), mCalca)); // coxa escondida sob saia longa
    const kn = grp('kn' + L, lg, 0, -P.coxa, 0); add(kn, malha(T, G.cap(T, 0.064, P.canela - 0.02), mBota));
    const ft = grp('ft' + L, kn, 0, -P.canela, 0); add(ft, malha(T, G.esf(T), mBota, 0, -pe + 0.058, 0.045)).scale.set(0.08, 0.058, 0.13);
  }

  // ---------- props (criados sob demanda) ----------
  const props = {};
  const prop = (nome) => { if (props[nome]) return props[nome]; let p;
    if (nome === 'caixa') { p = malha(T, geo('caixa', () => new THREE.BoxGeometry(0.62, 0.4, 0.48)), mat(T, '#ffffff', { r: 0.8, tex: 'madeira' })); corpo.add(p); }
    if (nome === 'martelo') { p = new THREE.Group(); add(p, malha(T, geo('cabo', () => new THREE.CylinderGeometry(0.018, 0.022, 0.36, 8)), mat(T, '#7a4e2e', { r: 0.7 }), 0, 0, 0.13)).rotation.x = Math.PI / 2;
      add(p, malha(T, geo('cabecaM', () => new THREE.BoxGeometry(0.07, 0.17, 0.08)), mat(T, '#6a6e78', { r: 0.35, m: 0.8 }), 0, 0, 0.3)); p.position.set(0, -0.04, 0); p.scale.setScalar(o.anao ? 1.4 : 1.15); mao.R.add(p); }
    if (nome === 'arco') { p = new THREE.Group(); // arco no plano YZ local da mão: empunhadura na origem, barriga do arco pra frente (-y local), limbos ao longo de z
      add(p, malha(T, geo('arcoB', () => { const g = new THREE.TorusGeometry(0.5, 0.018, 6, 24, 1.7); g.rotateZ(-Math.PI / 2 - 0.85); g.rotateY(Math.PI / 2); g.translate(0, 0.5, 0); return g; }), mat(T, '#8a5a2e', { r: 0.6 })));
      const corda = add(p, malha(T, geo('corda', () => new THREE.CylinderGeometry(0.004, 0.004, 0.75, 4)), mat(T, '#f2ead8', { r: 0.5 }), 0, 0.5 - 0.5 * Math.cos(0.85), 0)); corda.rotation.x = Math.PI / 2;
      add(p, malha(T, geo('flecha', () => new THREE.CylinderGeometry(0.007, 0.007, 0.7, 5)), mat(T, '#d8c09a', { r: 0.6 }), 0, 0.0, 0)).position.y = -0.05;
      p.position.set(0, -0.04, 0); mao.L.add(p); p.userData.corda = corda; }
    if (nome === 'cajado' && o.cajado === 'lanca') { p = new THREE.Group(); add(p, malha(T, geo('haste', () => new THREE.CylinderGeometry(0.02, 0.024, 2.2, 7)), mat(T, '#6a4426', { r: 0.7 }), 0, 1.1, 0));
      add(p, malha(T, geo('ponteira', () => new THREE.OctahedronGeometry(1, 0)), mMetal, 0, 2.3, 0)).scale.set(0.05, 0.16, 0.02); p.userData.orb = { material: {} }; corpo.add(p); }
    else if (nome === 'cajado') { p = new THREE.Group(); const mc = mat(T, '#6a4426', { r: 0.7, flat: true }); add(p, malha(T, geo('caj', () => new THREE.CylinderGeometry(0.022, 0.03, 1.8, 7)), mc, 0, 0.9, 0));
      const cor = o.cajadoCor || '#7af0ff'; const orb = add(p, malha(T, geo('orb', () => new THREE.IcosahedronGeometry(0.075, 1)), mat(T, cor, { r: 0.2, e: cor, ei: 1.2, flat: true }), 0, 1.86, 0));
      add(p, malha(T, geo('garra', () => new THREE.TorusGeometry(0.075, 0.014, 5, 10, Math.PI * 1.4)), mc, 0, 1.84, 0)).rotation.set(0, 0, -0.55);
      p.userData.orb = orb; corpo.add(p); }
    props[nome] = p; return p; };

  // ---------- face ----------
  let exprNome = 'neutro', ex = EXPR.neutro, look = [0, 0];
  const aplicaRosto = (boca = 0, fecha = 0, pisca = 0) => {
    const fch = fecha > 0.5 || ex.fecha;
    rosto.olhos.forEach((ol, i) => { ol.visible = !fch; ol.scale.set(0.04 * ex.olho[0], 0.058 * ex.olho[1] * (1 - pisca * 0.92), 0.022); });
    rosto.fech.forEach(f => (f.visible = !!fch));
    rosto.sob.forEach((sb, i) => { sb.rotation.z = ex.sob[1 - i]; sb.parent.parent.rotation.x = -(0.37 + ex.sob[3 - i] * 0.9); });
    const b = ex.boca, ab = b.t === 'aberta' ? Math.max(b.h, boca) : boca;
    bocaS.parent.rotation.y = b.d || 0; bocaS.rotation.z = b.rot || 0;
    if (b.t === 'aberta' || boca > 0.08) { bocaA.visible = false; bocaO.visible = true; const w = b.t === 'aberta' ? b.w : Math.max(0.55, b.w * 0.8);
      bocaO.scale.set(0.05 * w, 0.012 + 0.05 * ab, 0.022); bocaO.position.y = -0.045 + (b.t === 'arco' && b.c > 0 ? -0.005 : 0); }
    else { bocaA.visible = true; bocaO.visible = false; const w = 0.045 * b.w; bocaA.scale.set(w, w * Math.max(0.12, b.h), w); bocaA.rotation.z = b.c > 0 ? -Math.PI / 2 - 1.1 : Math.PI / 2 - 1.1; bocaA.position.y = b.c > 0 ? 0 : -0.06; }
  };
  root.expressao = (nome) => { exprNome = EXPR[nome] ? nome : 'neutro'; ex = EXPR[exprNome]; aplicaRosto(); return root; };
  root.olhar = (yaw = 0, pitch = 0) => { look = [clamp(yaw, -1.2, 1.2), clamp(pitch, -0.5, 0.5)]; return root; };
  const V = new THREE.Vector3();
  root.olharPara = (alvo) => { root.updateMatrixWorld(); V.copy(alvo); root.worldToLocal(V); const hy = (hipY + H + R) * esc; return root.olhar(Math.atan2(V.x, V.z), Math.atan2(V.y - hy, Math.hypot(V.x, V.z))); };

  // ---------- pose ----------
  const NOMES = Object.keys(J);
  root.pose = (p = {}) => {
    for (const n of NOMES) { const v = p[n]; J[n].rotation.set(v ? v[0] : 0, v ? v[1] : 0, v ? v[2] : 0); }
    J.hips.position.set(J.hips.userData.base.x, hipY + (p.y || 0), p.z || 0);
    J.shL.position.y = J.shR.position.y = H * 0.83 + (p.ombY || 0);
    // olhar: pescoço 35%, cabeça 65%; expressão "orgulho" ergue o queixo
    J.neck.rotation.y += look[0] * 0.35; J.head.rotation.y += look[0] * 0.65; J.head.rotation.x += -look[1] + (ex.cab || 0);
    for (const k of ['caixa', 'martelo', 'arco', 'cajado']) if (props[k]) props[k].visible = p.prop === k || (Array.isArray(p.prop) && p.prop.includes(k));
    if (p.prop) for (const k of [].concat(p.prop)) prop(k).visible = true;
    if (capa) capa.rotation.x = 0.06 + (p.capa || 0);
    aplicaRosto(p.boca || 0, p.fecha || 0, p.pisca || 0);
    return root;
  };

  const fase = frac(sd * 0.6180339) * 10;
  const ctx = { P, esc, hipY, R, H, amp: vestido || robe ? 0.34 : anao ? 0.42 : 0.5, sd, fase };
  ctx.passada = 4 * (P.coxa + P.canela) * Math.sin(ctx.amp) * esc * 0.92;
  root.anima = (t, estado = 'parado', op = {}) => {
    const tt = t + (op.semFase ? 0 : fase);
    let p = POSE[estado] ? POSE[estado](tt, op, ctx) : POSE.parado(tt, op, ctx);
    if (op.de && op.mix != null && op.mix < 1) p = mistura(POSE[op.de] ? POSE[op.de](tt, op, ctx) : POSE.parado(tt, op, ctx), p, smooth(op.mix));
    if (op.expr) root.expressao(op.expr);
    // fala sobreposta (qualquer estado)
    if (op.fala) p.boca = Math.max(p.boca || 0, bocaFala(tt, op.fala));
    if (ex.treme) { p.head = add3(p.head, [noise(tt * 18, 3) * 0.03, noise(tt * 17, 5) * 0.03, 0]); }
    // piscar
    const per = 3.1 + (sd % 5) * 0.37, tb = frac(tt / per) * per; p.pisca = tb < 0.15 ? Math.sin(tb / 0.15 * Math.PI) : 0;
    root.pose(p);
    if (props.caixa && props.caixa.visible) { props.caixa.position.set(0, hipY + (p.y || 0) + H + 0.03 + R * 1.95 + 0.17, 0.02); props.caixa.rotation.set(0, 0.04, 0); }
    if (props.cajado && props.cajado.visible) { corpo.updateMatrixWorld(true); mao.R.getWorldPosition(V); corpo.worldToLocal(V); props.cajado.position.set(V.x, V.y - 0.95 - 0.035, V.z + 0.01); props.cajado.rotation.set(0.04, 0, -0.03);
      props.cajado.userData.orb.material.emissiveIntensity = (op.brilho ?? 1) * (1 + 0.25 * Math.sin(tt * 5)); }
    if (props.arco && props.arco.visible) props.arco.userData.corda.position.z = 0;
    return root;
  };
  root.j = J; root.rosto = rosto; root.props = props; root.prop = prop; root.ctx = ctx; root.opcoes = o; root.altura = altura;
  root.traverse(x => { if (x.isMesh && x.castShadow === undefined) x.castShadow = true; });
  root.expressao(o.expr || 'neutro'); root.anima(0, 'parado');
  return root;
}

// ---------------- poses ----------------
const add3 = (a = [0, 0, 0], b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
function mistura(a, b, k) { const o = {}; for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) { const va = a[n], vb = b[n];
  if (Array.isArray(va) || Array.isArray(vb)) { const x = va || [0, 0, 0], y = vb || [0, 0, 0]; o[n] = [lerp(x[0], y[0], k), lerp(x[1], y[1], k), lerp(x[2], y[2], k)]; }
  else if (typeof va === 'number' || typeof vb === 'number') o[n] = lerp(va || 0, vb || 0, k); else o[n] = k < 0.5 ? va : vb; } return o; }
const bocaFala = (t, i = 1) => i * clamp(0.15 + 0.85 * Math.abs(Math.sin(t * 11.5)) * (0.55 + 0.45 * noise(t * 3.3, 4)) * (noise(t * 1.1, 9) > -0.55 ? 1 : 0.15));
function base(t, ctx) { const br = Math.sin(t * 2.0), ns = (k, s) => noise(t * k, s + ctx.sd);
  return { hips: [0, ns(0.13, 1) * 0.06, ns(0.17, 2) * 0.025], torso: [0.03 + br * 0.015, ns(0.2, 3) * 0.05, 0], neck: [0, 0, 0], head: [ns(0.3, 4) * 0.07, ns(0.22, 5) * 0.18, ns(0.25, 6) * 0.05],
    shL: [0.04 + br * 0.02, 0, 0.13 + br * 0.015], shR: [0.04 - br * 0.02, 0, -0.13 - br * 0.015], elL: [-0.18, 0, 0], elR: [-0.18, 0, 0], haL: [0, 0, 0], haR: [0, 0, 0],
    legL: [0, 0, 0.025], legR: [0, 0, -0.025], knL: [0.03, 0, 0], knR: [0.03, 0, 0], ftL: [-0.03, 0, -0.02], ftR: [-0.03, 0, 0.02], y: br * 0.003 - 0.004 };
}
function pernasAndar(p, w, ctx, ampMul = 1) { const a = ctx.amp * ampMul;
  for (const [L, ph] of [['L', 0], ['R', Math.PI]]) { const s = Math.sin(w + ph), c = Math.cos(w + ph), coxa = -a * s, jo = 0.06 + 1.25 * a * Math.max(0, c) * (0.6 + 0.4 * Math.max(0, s + 0.3));
    p['leg' + L] = [coxa, 0, L === 'L' ? 0.02 : -0.02]; p['kn' + L] = [jo, 0, 0]; p['ft' + L] = [-(coxa + jo) * 0.55 + (s > 0 ? -0.15 * s : 0.12 * -s), 0, 0]; }
  p.y = -0.012 + 0.022 * Math.cos(2 * w) * ampMul; p.hips = [0, -0.09 * Math.sin(w), 0.025 * Math.sin(w)]; }
const POSE = {
  parado: (t, op, ctx) => base(t, ctx),
  andar: (t, op, ctx) => { const p = base(t, ctx), vel = op.vel ?? 1.2, dist = op.dist ?? t * vel, w = (2 * Math.PI * dist) / ctx.passada;
    pernasAndar(p, w, ctx); const s = Math.sin(w);
    p.shL = [0.75 * ctx.amp * s, 0, 0.12]; p.shR = [-0.75 * ctx.amp * s, 0, -0.12]; p.elL = [-0.3 - 0.35 * Math.max(0, -s), 0, 0]; p.elR = [-0.3 - 0.35 * Math.max(0, s), 0, 0];
    p.torso = [0.07, 0.11 * s, -0.02 * Math.sin(w)]; p.head = [0.02 + 0.03 * Math.cos(2 * w), -0.08 * s + p.head[1] * 0.4, 0.015 * s]; p.capa = 0.12 + 0.05 * Math.cos(2 * w); return p; },
  falar: (t, op, ctx) => { const p = base(t, ctx), it = op.intensidade ?? 1, per = 1.5, k = (t + ctx.fase * 3) / per, i0 = Math.floor(k), f = frac(k), m = smooth((f - 0.7) / 0.3);
    const g = mistura(GESTO[i0 % GESTO.length], GESTO[(i0 + 1) % GESTO.length], m), bt = Math.sin(t * 6.3) * 0.09 * it;
    for (const n in g) p[n] = n.startsWith('sh') || n.startsWith('el') ? [lerp(p[n][0], g[n][0], it) + (n.startsWith('el') ? bt : 0), g[n][1] * it, lerp(p[n][2], g[n][2], it)] : add3(p[n], g[n].map(v => v * it));
    p.head = add3(p.head, [0.06 * Math.sin(t * 3.1), 0, 0.04 * Math.sin(t * 1.7)]); p.boca = bocaFala(t, 0.9 * Math.max(0.5, it)); return p; },
  apontar: (t, op, ctx) => { const p = base(t, ctx), br = Math.sin(t * 2) * 0.02; p.shR = [-1.5 + br, -0.05, -0.12]; p.elR = [-0.04, 0, 0]; p.haR = [0.1, 0, 0];
    p.shL = [0.0, 0, 0.32]; p.elL = [-0.5, 0, -0.9]; p.torso = [0.06, -0.14, 0]; p.head = [0.02, 0.1, 0]; p.legR = [-0.15, 0, -0.04]; p.knR = [0.1, 0, 0]; if (op.fala) p.boca = bocaFala(t, op.fala); return p; },
  rir: (t, op, ctx) => { const p = base(t, ctx), c = Math.sin(t * 15), s = Math.sin(t * 1.4);
    p.torso = [-0.12 + 0.28 * Math.max(0, s) + 0.025 * c, 0, 0]; p.head = [-0.32 + 0.12 * Math.max(0, s) + 0.06 * c, 0, 0.05 * Math.sin(t * 2)];
    p.shL = [-0.25, 0, 0.5 + 0.03 * c]; p.shR = [-0.25, 0, -0.5 - 0.03 * c]; p.elL = [-0.7, 0, -1.2]; p.elR = [-0.7, 0, 1.2]; p.ombY = 0.012 * Math.abs(c);
    p.y = -0.01 + 0.006 * c; p.boca = 0.85 + 0.15 * Math.abs(c); p.fecha = 1; return p; },
  cochichar: (t, op, ctx) => { const p = base(t, ctx), l = op.lado ?? 1;
    p.torso = [0.2, 0.15 * l, -0.12 * l]; p.head = [0.14, 0.25 * l, -0.22 * l]; p.shR = [-1.25, 0, -0.75]; p.elR = [-1.95, 0, 0.55]; p.haR = [0, 0, 0.5];
    p.shL = [0.1, 0, 0.22]; p.elL = [-0.3, 0, 0]; p.boca = 0.35 * bocaFala(t, 1); p.legL = [-0.15 * l, 0, 0.05]; p.knL = [0.2, 0, 0]; return p; },
  carregar: (t, op, ctx) => { const and = (op.vel ?? 0) > 0 || op.dist != null; const p = and ? POSE.andar(t, op, ctx) : base(t, ctx);
    p.shL = [-0.04, 0, 3.0]; p.shR = [-0.04, 0, -3.0]; p.elL = [0, 0, -0.1]; p.elR = [0, 0, 0.1]; p.haL = [0, 0, -0.4]; p.haR = [0, 0, 0.4]; p.ombY = 0.02;
    p.torso = [0.02, (p.torso[1] || 0) * 0.3, 0]; p.head = [0.06, p.head[1] * 0.4, 0]; p.prop = 'caixa'; p.y = (p.y || 0) - 0.01; return p; },
  martelar: (t, op, ctx) => { const p = base(t, ctx), per = op.periodo ?? 0.9, u = frac(t / per); const sobe = u < 0.62 ? ease.inOut(u / 0.62) : 1 - ease.in((u - 0.62) / 0.12);
    const k = u < 0.74 ? sobe : 0; p.shR = [lerp(-0.85, -2.7, k), 0, -0.2]; p.elR = [lerp(-0.55, -1.25, k), 0, 0]; p.haR = [lerp(0.5, -0.2, k), 0, 0];
    p.shL = [-0.75, 0, 0.25]; p.elL = [-0.7, 0, -0.2]; p.torso = [0.2 - 0.12 * k, -0.12 + 0.05 * k, 0]; p.head = [0.32 - 0.1 * k, -0.08, 0];
    p.legR = [0.18, 0, -0.05]; p.legL = [-0.2, 0, 0.05]; p.knL = [0.15, 0, 0]; p.knR = [0.1, 0, 0]; p.prop = 'martelo'; return p; },
  arco: (t, op, ctx) => { const p = base(t, ctx), d = op.puxa ?? (0.75 + 0.25 * Math.sin(t * 1.3));
    p.shL = [-1.5, 0.0, 0.12]; p.elL = [0, 0, 0]; p.haL = [0, 0, 0]; p.shR = [-1.45, 0, -0.35 - 0.25 * d]; p.elR = [-1.2 - 0.9 * d, 0.0, 0.7 * d]; p.haR = [0, 0, 0];
    p.torso = [0.02, -0.25, 0]; p.head = [0.05, 0.22, 0.05]; p.legL = [-0.25, 0, 0.12]; p.legR = [0.2, 0, -0.12]; p.knL = [0.15, 0, 0]; p.prop = 'arco'; return p; },
  bracos_cruzados: (t, op, ctx) => { const p = base(t, ctx), br = Math.sin(t * 2) * 0.015;
    p.shL = [-0.44 + br, 0.33, 0.13]; p.shR = [-0.4 + br, -0.33, -0.15]; p.elL = [-0.64, 0.1, -1.61]; p.elR = [-0.8, -0.1, 1.61]; p.haL = [0, 0, -0.2]; p.haR = [0, 0, 0.2]; p.torso = [-0.04, 0, 0]; p.head = add3(p.head, [-0.06, 0, 0]); return p; },
  surpreso: (t, op, ctx) => { const p = base(t, ctx), k = op.k ?? (op.t0 != null ? ease.outBack(clamp((t - ctx.fase - op.t0) / 0.35)) : 1), tr = Math.sin(t * 30) * 0.015 * k;
    p.z = -0.1 * k; p.torso = [-0.16 * k, 0, 0]; p.head = [-0.1 * k + tr, p.head[1], 0]; p.shL = [-1.0 * k, 0, 0.13 + 0.55 * k]; p.shR = [-1.0 * k, 0, -0.13 - 0.55 * k];
    p.elL = [-0.18 - 1.45 * k, 0, 0]; p.elR = [-0.18 - 1.45 * k, 0, 0]; p.haL = [-0.4 * k, 0, 0]; p.haR = [-0.4 * k, 0, 0]; p.legR = [0.25 * k, 0, -0.03]; p.knR = [0.15 * k, 0, 0]; p.legL = [-0.06 * k, 0, 0.03]; return p; },
  cajado: (t, op, ctx) => { const p = base(t, ctx), b = op.bate ?? 0; p.shR = [-0.42 - 0.7 * b, 0, -0.2]; p.elR = [-0.95 + 0.25 * b, 0, 0]; p.haR = [0, 0, 0];
    p.torso = [0.04 - 0.06 * b, -0.06, 0]; p.head = add3(p.head, [-0.05 * b, 0, 0]); p.prop = 'cajado'; if (op.fala) p.boca = bocaFala(t, op.fala); return p; },
};
const GESTO = [
  { shL: [-0.4, 0, 0.32], elL: [-1.15, 0, 0], shR: [-0.4, 0, -0.32], elR: [-1.15, 0, 0], torso: [0.02, 0, 0] },     // explica (duas mãos)
  { shL: [0.02, 0, 0.14], elL: [-0.2, 0, 0], shR: [-0.95, 0, -0.38], elR: [-1.3, 0, 0], torso: [0, -0.1, 0] },        // mão direita sobe
  { shL: [-0.15, 0, 0.6], elL: [-1.45, 0, 0], shR: [-0.15, 0, -0.6], elR: [-1.45, 0, 0], head: [0, 0, 0.14] },        // dá de ombros
  { shL: [0.02, 0, 0.14], elL: [-0.2, 0, 0], shR: [-0.6, 0, -0.05], elR: [-1.8, 0, 0.6], torso: [-0.03, 0, 0] },      // mão no peito
  { shL: [-0.85, 0, 0.3], elL: [-0.85, 0, 0], shR: [0.02, 0, -0.14], elR: [-0.2, 0, 0], torso: [0, 0.12, 0] },        // gesto com a esquerda
  { shL: [-0.55, 0, 0.18], elL: [-1.55, 0, -0.3], shR: [-0.55, 0, -0.18], elR: [-1.55, 0, 0.3], head: [0.06, 0, 0] }, // conta nos dedos
];

// ---------------- aparência aleatória ----------------
const PELES = ['#ffdcc2', '#f6c9a3', '#ecb48c', '#dca07a', '#c4865c', '#a86a44', '#8a5434', '#6a3e26'];
const CABELOS = ['#2a1a12', '#4a2e1c', '#6a4426', '#8a6034', '#d8b25a', '#e8cf7a', '#1a1414', '#9a9aa2', '#c8c8cc'];
const ROUPAS = ['#3a7ad8', '#2f9a5a', '#e8a030', '#8a4ab8', '#c8643a', '#2aa0a8', '#d85a8a', '#6a8a3a', '#4a5ab0', '#b08a5a', '#d8342b', '#3a4a6a'];
const CLAROS = ['#f2ead8', '#ffe8c0', '#e8f0ff', '#f8dce0', '#e8e0c8'];
const CHAP = ['#5a4632', '#3a5a3a', '#4a4a6a', '#7a5a3a', '#2a3a5a', '#6a4a7a'];
const CALCA = ['#5a4a3a', '#3a3a4a', '#4a3a2a', '#5a5a4a', '#2a3a4a'];
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
export function aparenciaAleatoria(seed = 1, extra = {}) {
  const r = rng(seed * 13 + 5), mulher = r() < 0.5, el = r() < 0.06 ? 'rara' : pick(r, ['fogo', 'agua', 'terra', 'vento', 'raio']);
  const roupa = mulher ? (r() < 0.8 ? 'vestido' : 'tunica') : 'tunica';
  const cabTipo = mulher ? pick(r, ['coque', 'longo', 'longo', 'curto']) : pick(r, ['curto', 'curto', 'curto', 'careca']);
  const chapeu = r() < 0.45 ? (mulher ? pick(r, ['lenco', 'lenco', 'capuz']) : pick(r, ['feltro', 'feltro', 'capuz', 'lenco'])) : null;
  const velho = r() < 0.2;
  const a = { pele: pick(r, PELES), cabelo: { tipo: cabTipo, cor: velho ? pick(r, ['#9a9aa2', '#c8c8cc']) : pick(r, CABELOS.slice(0, 7)) }, chapeu, chapeuCor: pick(r, CHAP),
    roupa, cor: pick(r, ROUPAS), cor2: pick(r, CLAROS), capa: r() < 0.25 ? pick(r, ['#2a3a5a', '#5a3a2a', '#3a5a3a', '#6a2a3a', '#4a3a6a']) : null, calca: pick(r, CALCA), bota: pick(r, ['#4a3020', '#3a2a1a', '#5a3a24']),
    marca: { n: 1 + Math.floor(r() * 3), cor: ELEMENTOS[el], brilho: el === 'rara' ? 0.9 : 0.45 + r() * 0.3 }, barba: !mulher && r() < 0.3 ? (velho ? '#c8c8cc' : pick(r, CABELOS.slice(0, 5))) : null,
    barbaLonga: r() < 0.4, pena: pick(r, ['#ffe14a', '#ffffff', '#4ad0ff', '#7af07a']), altura: mulher ? 1.6 + r() * 0.12 : 1.68 + r() * 0.14, seed };
  return { ...a, ...extra };
}

// ---------------- presets ----------------
export const GUARDA = { pele: '#d4976a', cabelo: { tipo: 'curto', cor: '#2a1a12' }, chapeu: 'elmo', roupa: 'armadura', cor: '#8a9098', cor2: '#2a4ad8', capa: '#2a4ad8', calca: '#4a4a52', bota: '#3a2a1a', marca: { n: 2, cor: ELEMENTOS.terra, brilho: 0.5 }, altura: 1.8, seed: 21, cajado: 'lanca' };
export const REI_MAGO = { pele: '#f2c29a', cabelo: { tipo: 'longo', cor: '#f4f4f8', compr: 1.7 }, chapeu: 'coroa', coroaCor: '#dfe4ee', coroaAlta: true, roupa: 'manto_longo', cor: '#4a2a9a', cor2: '#c8ccd8', capa: '#2a1a6a', calca: '#2a2a4a', bota: '#2a1a2a', barba: '#f4f4f8', barbaLonga: true, barbaCompr: 1.6, marca: { n: 1, cor: ELEMENTOS.rara, brilho: 1.2 }, altura: 1.8, seed: 31, cajadoCor: '#ffd76a', expr: 'desconfiado' };
export const DIRETOR = { pele: '#c4865c', cabelo: { tipo: 'careca', cor: '#e8e8ee' }, chapeu: null, roupa: 'manto_longo', cor: '#6a2ab0', cor2: '#ffd23a', capa: null, calca: '#3a2a4a', bota: '#2a1a1a', barba: '#f4f4f8', barbaLonga: true, marca: { n: 1, cor: ELEMENTOS.rara, brilho: 1.0 }, altura: 1.74, seed: 41, cajadoCor: '#c08aff' };
export const ELFO = { pele: '#ffdcc2', cabelo: { tipo: 'longo', cor: '#e8cf7a' }, chapeu: null, roupa: 'tunica', cor: '#2f8a4a', cor2: '#c8e8a0', capa: '#3a5a2a', calca: '#5a4a2a', bota: '#6a4a2a', orelhaElfo: true, marca: { n: 2, cor: ELEMENTOS.vento, brilho: 0.7 }, altura: 1.82, seed: 51 };
export const ANAO = { pele: '#ecb48c', cabelo: { tipo: 'careca', cor: '#6a3a1a' }, roupa: 'tunica', cor: '#4a5ab0', cor2: '#7a4a28', calca: '#4a3a2a', bota: '#3a2a1a', barba: '#7a4420', anao: true, marca: { n: 3, cor: ELEMENTOS.terra, brilho: 0.55 }, altura: 1.3, seed: 61 };
export const GAROTO_FOGO = { pele: '#c4865c', cabelo: { tipo: 'curto', cor: '#1a1414' }, roupa: 'tunica', cor: '#e8a030', cor2: '#f2ead8', calca: '#4a3a2a', bota: '#5a3a24', marca: { n: 1, cor: ELEMENTOS.fogo, brilho: 1.3 }, altura: 1.58, seed: 71 };
export const CRIANCA = { pele: '#f6c9a3', cabelo: { tipo: 'curto', cor: '#6a4426' }, roupa: 'tunica', cor: '#2aa0a8', cor2: '#f2ead8', calca: '#5a4a3a', bota: '#5a3a24', crianca: true, marca: { n: 1, cor: ELEMENTOS.agua, brilho: 0.5 }, altura: 1.12, seed: 81 };
export const MAGO = { pele: '#ecb48c', cabelo: { tipo: 'longo', cor: '#c8c8cc' }, chapeu: 'pontudo', chapeuCor: '#2a4ab8', roupa: 'manto_longo', cor: '#2a5ad8', cor2: '#ffd23a', capa: '#1a2a7a', calca: '#2a2a4a', bota: '#3a2a1a', barba: '#e8e8ee', barbaLonga: true, marca: { n: 2, cor: ELEMENTOS.raio, brilho: 0.9 }, altura: 1.76, seed: 91, cajadoCor: '#ff9a2a' };
export const ARQUEIRO = { pele: '#dca07a', cabelo: { tipo: 'curto', cor: '#4a2e1c' }, chapeu: 'capuz', chapeuCor: '#2f8a3a', roupa: 'tunica', cor: '#6a8a3a', cor2: '#c8e8a0', capa: '#2f8a3a', calca: '#5a4a2a', bota: '#6a4a2a', marca: { n: 2, cor: ELEMENTOS.vento, brilho: 0.7 }, altura: 1.76, seed: 101 };
export const PRESETS = { GUARDA, REI_MAGO, DIRETOR, ELFO, ANAO, GAROTO_FOGO, CRIANCA, MAGO, ARQUEIRO };
// estado sugerido por preset (pra quem quiser usar direto)
export const ESTADO_PRESET = { GUARDA: 'cajado', REI_MAGO: 'cajado', DIRETOR: 'cajado', ELFO: 'arco', ANAO: 'martelar', MAGO: 'cajado', ARQUEIRO: 'arco' };

// ---------------- multidão ----------------
// specs: { tipo:'anda'|'conversa'|'parado'|'carrega', x, x1, z, vel, frente(+1/-1 em x), lado(0/1), fase, aparencia, estado, rot, expr }
// update(t, cam, o): o.congela (t), o.alvo {x,z}, o.extra(p, sp, t) -> {estado, expr, opts, olhar:[yaw,pitch]}, o.chao(x,z)
export function multidao3D(T, specs) {
  const THREE = T.THREE, g = new THREE.Group(), gente = [];
  specs.forEach((sp, i) => { const ap = sp.aparencia || aparenciaAleatoria((sp.seed ?? i * 17 + 3)); const p = pessoa3D(T, ap); p.sp = { fase: i * 1.37, vel: 1.2, ...sp }; p.position.set(sp.x, 0, sp.z); g.add(p); gente.push(p); });
  const ang = (a, b, k) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };
  const anda = (sp, tt) => { // ida e volta com giro parado nas pontas
    const L = Math.abs((sp.x1 ?? sp.x + 10) - sp.x), sg = Math.sign((sp.x1 ?? sp.x + 10) - sp.x) || 1, v = sp.vel ?? 1.2, tw = L / v, tg = 0.7, Pd = 2 * (tw + tg), u = ((tt % Pd) + Pd) % Pd;
    const voltas = Math.floor(tt / Pd), dist0 = voltas * 2 * L;
    if (u < tw) return { x: sp.x + sg * u * v, rot: sg > 0 ? Math.PI / 2 : -Math.PI / 2, andando: 1, dist: dist0 + u * v };
    if (u < tw + tg) { const k = smooth((u - tw) / tg); return { x: sp.x + sg * L, rot: ang(sg > 0 ? Math.PI / 2 : -Math.PI / 2, sg > 0 ? -Math.PI / 2 : Math.PI / 2, k), andando: 1 - Math.min(1, k * 3) * (1 - Math.min(1, (1 - k) * 3)), dist: dist0 + L }; }
    if (u < 2 * tw + tg) { const d = (u - tw - tg) * v; return { x: sp.x + sg * (L - d), rot: sg > 0 ? -Math.PI / 2 : Math.PI / 2, andando: 1, dist: dist0 + L + d }; }
    const k = smooth((u - 2 * tw - tg) / tg); return { x: sp.x, rot: ang(sg > 0 ? -Math.PI / 2 : Math.PI / 2, sg > 0 ? Math.PI / 2 : -Math.PI / 2, k), andando: 1 - Math.min(1, k * 3) * (1 - Math.min(1, (1 - k) * 3)), dist: dist0 + 2 * L }; };
  g.update = (t, cam, o = {}) => {
    for (const p of gente) { const sp = p.sp, ph = t + sp.fase, cg = o.congela != null ? clamp((t - o.congela) / 0.5) : 0, tc = o.congela != null && t > o.congela ? o.congela : t;
      let x = sp.x, z = sp.z, rot = sp.rot ?? ((sp.frente ?? 1) > 0 ? Math.PI / 2 : -Math.PI / 2), estado = sp.estado || 'parado', op = { ...(sp.opts || {}) }, expr = sp.expr || 'neutro';
      if (sp.tipo === 'anda' || sp.tipo === 'carrega') { const a = anda(sp, tc + sp.fase); x = a.x; rot = a.rot; estado = sp.tipo === 'carrega' ? 'carregar' : 'andar'; op.dist = a.dist; op.vel = sp.vel ?? 1.2;
        if (a.andando < 1 && sp.tipo === 'anda') { op.de = 'parado'; op.mix = a.andando; } }
      else if (sp.tipo === 'conversa') { const per = 2.3, k = ph / per, vez = Math.floor(k) % 2 === (sp.lado ?? 0), f = frac(k), tr = smooth(f / 0.25);
        estado = vez ? 'falar' : 'parado'; op.de = vez ? 'parado' : 'falar'; op.mix = tr; op.intensidade = 0.9;
        expr = sp.expr || (vez ? ['sorriso', 'neutro', 'desconfiado', 'sorriso', 'surpreso'][Math.floor(k / 2 + sp.fase) % 5] : (Math.floor(k) % 3 === 0 ? 'riso' : 'sorriso'));
        if (!vez && expr === 'riso') { estado = 'rir'; op.de = 'falar'; } }
      else if (sp.tipo === 'parado') estado = sp.estado || 'parado';
      const y = o.chao ? o.chao(x, z) : (sp.y ?? 0);
      if (cg > 0) { const ax = o.alvo?.x ?? 0, az = o.alvo?.z ?? 0, alvoRot = Math.atan2(ax - x, az - z); rot = ang(rot, alvoRot, smooth(cg)); op.de = estado; op.mix = cg; estado = 'parado'; delete op.dist; expr = o.exprCongela || 'surpreso'; }
      if (o.expr) expr = o.expr(p, sp) || expr;
      const ex = o.extra ? o.extra(p, sp, t) || {} : {};
      if (ex.estado) estado = ex.estado; if (ex.expr) expr = ex.expr; if (ex.opts) Object.assign(op, ex.opts); if (ex.rot != null) rot = ex.rot;
      p.position.set(x, y, z); p.rotation.y = rot; p.olhar(...(ex.olhar || [0, 0])); p.expressao(expr); p.anima(t + sp.fase, estado, op);
    }
  };
  g.gente = gente; return g;
}
