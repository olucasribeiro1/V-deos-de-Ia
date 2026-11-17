// Série "Sem Marca": dragão 3D detalhado (corpo em tubo sobre espinha CatmullRom, pescoço em S, cabeça com
// mandíbula móvel, asas de morcego com ossos + membrana recalculada a cada quadro) e gatinho laranja 3D.
// Visual "cartoon 3D macio" (MeshStandardMaterial, sem contorno). 1 unidade = 1 metro.
//
//   const dr = dragao3D(T, { cor: '#b8202a' });  scene.add(dr);  ...  dr.update(t, { bater: 1, boca: 0.3 });
//   Dragão olha para +X, cima +Y, asas ao longo de ±Z. Comprimento ~13 m (cauda -7 → focinho +6), envergadura ~17 m.
//   const gato = gato3D(T, { olhosBrilho: 0 }); gato.update(t, { olhosBrilho: 1 });  Gato olha para +Z, ~0,35 m.

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;
const D = Math.PI / 180;

// Catmull-Rom escalar (uniforme) sobre um array, u em [0,1]
function crS(arr, u) { const n = arr.length, p = (n - 1) * clamp01(u); let i = Math.floor(p); if (i >= n - 1) i = n - 2; const t = p - i;
  const p0 = arr[Math.max(0, i - 1)], p1 = arr[i], p2 = arr[i + 1], p3 = arr[Math.min(n - 1, i + 2)], t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }

// ---------- geometrias auxiliares ----------
// pílula afunilada ao longo de +X (0..len), perfil superelíptico (p), seção elíptica (sy, sz)
function pilula(T, len, r0, r1, o = {}) { const THREE = T.THREE, n = o.n ?? 18, p = o.p ?? 2.4, pts = [];
  for (let k = 0; k <= n; k++) { const x = -Math.cos(Math.PI * k / n), q = (x + 1) / 2, prof = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x), p)), 1 / p);
    pts.push(new THREE.Vector2(k === 0 || k === n ? 0 : Math.max(1e-4, prof * lerp(r0, r1, q)), q * len)); }
  const g = new THREE.LatheGeometry(pts, o.seg ?? 20); g.rotateZ(-Math.PI / 2); if (o.sy || o.sz) g.scale(1, o.sy ?? 1, o.sz ?? 1); return g; }

// malha de tubo (anéis × segmentos radiais) cujos vértices são reescritos por tuboPoe
function tuboGeo(THREE, nA, nR) { const nv = nA * (nR + 1), pos = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = [];
  for (let i = 0; i < nA; i++) for (let j = 0; j <= nR; j++) { const k = i * (nR + 1) + j; uv[k * 2] = i / (nA - 1); uv[k * 2 + 1] = j / nR; }
  for (let i = 0; i < nA - 1; i++) for (let j = 0; j < nR; j++) { const a = i * (nR + 1) + j, b = a + nR + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  g.userData.nA = nA; g.userData.nR = nR; return g; }
// ring(i) -> {c, n, b, ry, rz}; mod(i, j, ang) -> multiplicador do raio. Ângulo 0 = direção n (dorso), π = barriga.
function tuboPoe(geo, ring, mod) { const { nA, nR } = geo.userData, P = geo.attributes.position.array;
  for (let i = 0; i < nA; i++) { const R = ring(i); for (let j = 0; j <= nR; j++) { const ang = (j / nR) * Math.PI * 2, m = mod ? mod(i, j, ang) : 1, cs = Math.cos(ang) * R.ry * m, sn = Math.sin(ang) * R.rz * m, k = (i * (nR + 1) + j) * 3;
    P[k] = R.c.x + R.n.x * cs + R.b.x * sn; P[k + 1] = R.c.y + R.n.y * cs + R.b.y * sn; P[k + 2] = R.c.z + R.n.z * cs + R.b.z * sn; } }
  geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
  const N = geo.attributes.normal.array; for (let i = 0; i < nA; i++) { const a = i * (nR + 1) * 3, b = (i * (nR + 1) + nR) * 3; for (let q = 0; q < 3; q++) { const v = (N[a + q] + N[b + q]) / 2; N[a + q] = N[b + q] = v; } }
  geo.computeBoundingSphere(); }
// quadros por transporte paralelo ao longo de uma curva amostrada
function quadrosPT(THREE, cs, ts, ref) { const out = [], n = (ref || new THREE.Vector3(0, 1, 0)).clone(); if (Math.abs(n.dot(ts[0])) > 0.95) n.set(1, 0, 0);
  for (let i = 0; i < cs.length; i++) { const t = ts[i]; n.addScaledVector(t, -n.dot(t)).normalize(); const b = new THREE.Vector3().crossVectors(t, n).normalize(); out.push({ c: cs[i], n: n.clone(), b }); } return out; }
// tubo curvo estático afunilado (chifres, garras, espinhos curvos)
function curvoGeo(T, pts, r0, r1, o = {}) { const THREE = T.THREE, nA = o.nA ?? 14, nR = o.nR ?? 10, cv = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), geo = tuboGeo(THREE, nA, nR), cs = [], ts = [];
  for (let i = 0; i < nA; i++) { const u = i / (nA - 1); cs.push(cv.getPoint(u)); ts.push(cv.getTangent(u)); }
  const F = quadrosPT(THREE, cs, ts, o.ref); const pw = o.pw ?? 1;
  tuboPoe(geo, (i) => { const u = i / (nA - 1), r = Math.max(0.002, lerp(r0, r1, Math.pow(u, pw))) ; return { ...F[i], ry: r * (o.sy ?? 1), rz: r * (o.sz ?? 1) }; });
  const c0 = new THREE.Color(o.base ?? '#7a5a40'), c1 = new THREE.Color(o.ponta ?? '#fff6e2'), col = new Float32Array(nA * (nR + 1) * 3), tc = new THREE.Color();
  for (let i = 0; i < nA; i++) { tc.copy(c0).lerp(c1, ss(0, 0.75, i / (nA - 1))); for (let j = 0; j <= nR; j++) { const k = (i * (nR + 1) + j) * 3; col[k] = tc.r; col[k + 1] = tc.g; col[k + 2] = tc.b; } }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); return geo; }
// pinta vértices conforme a normal (cima/baixo)
function pintaVert(T, geo, cTop, cMid, cBot, k = [0.35, -0.25]) { const THREE = T.THREE, N = geo.attributes.normal, n = N.count, col = new Float32Array(n * 3), a = new THREE.Color(cTop), b = new THREE.Color(cMid), c = new THREE.Color(cBot), tmp = new THREE.Color();
  for (let i = 0; i < n; i++) { const y = N.getY(i); tmp.copy(b); if (y > 0) tmp.lerp(a, ss(0, 1, y) * k[0] * 2); else tmp.lerp(c, ss(k[1] + 0.05, k[1] - 0.35, y)); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); return geo; }

// textura de escamas (cinza claro -> multiplica a cor de vértice; também serve de bump)
let ESCAMA = null;
function escamas(T) { if (ESCAMA) return ESCAMA; ESCAMA = T.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); const nx = 8, ny = 8, sx = w / nx, sy = h / ny;
    for (let r = -1; r <= ny; r++) for (let c = -1; c <= nx; c++) { const x = c * sx + (r % 2 ? sx / 2 : 0), y = r * sy; const gr = g.createRadialGradient(x, y - sy * 0.2, 1, x, y, sx * 0.62); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.75, '#e6e6e6'); gr.addColorStop(1, '#a8a8a8');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, sx * 0.6, 0, Math.PI); g.lineTo(x - sx * 0.6, y); g.fill(); g.strokeStyle = 'rgba(90,90,90,.45)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, sx * 0.6, 0.15, Math.PI - 0.15); g.stroke(); } }, [1, 1]);
  return ESCAMA; }

// coloca um "osso" (geometria unitária ao longo de +Y) entre A e B
const _Y = { v: null };
function liga(THREE, me, A, B, r, ext = 0.08) { _Y.v ||= new THREE.Vector3(0, 1, 0); const d = new THREE.Vector3().subVectors(B, A), len = d.length() || 1e-4; d.divideScalar(len);
  me.position.copy(A).addScaledVector(d, -len * ext); me.quaternion.setFromUnitVectors(_Y.v, d); me.scale.set(r, len * (1 + 2 * ext), r); }

// =====================================================================================================
//  DRAGÃO
// =====================================================================================================
// o: { cor, barriga, membrana, chifre, espinho, olho, opacMembrana, escamas (bool), sombra (bool) }
// update(t, o): { bater 0..1 (intensidade do bater de asas; 0 = planando), freq (Hz, 1.05), boca 0..1, rugido 0..1,
//   patas 0..1 (0 encolhidas em voo, 1 esticadas/pouso), cauda (amplitude, 1), pescoco (amplitude, 1), cabeca (inclinação rad),
//   olhar (giro da cabeça rad), fase (desloca o ciclo), asas 0..1 (1 = abertas, 0 = recolhidas junto ao corpo) }
export function dragao3D(T, o = {}) {
  const THREE = T.THREE, V3 = THREE.Vector3, C = (c) => new THREE.Color(c);
  const azul = !!o.cor && C(o.cor).b > C(o.cor).r;
  const cor = C(o.cor ?? '#b8202a'), corB = C(o.barriga ?? (azul ? '#ffd27a' : '#ffb34a'));
  const corM = C(o.membrana ?? (o.cor ? '#' + C(o.cor).multiplyScalar(0.5).getHexString() : '#6a1018'));
  const corDorso = cor.clone().multiplyScalar(0.62), corChifre = o.chifre ?? '#ffffff', corEsp = o.espinho ?? (azul ? '#ffd27a' : '#ffb34a');
  const tex = o.escamas === false ? null : escamas(T);
  const mPele = new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, bumpMap: tex, bumpScale: 1.2, roughness: 0.5, metalness: 0.05 });
  const mCab = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.48, metalness: 0.05 });
  const mCor = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5, metalness: 0.05 });
  const mEsc = new THREE.MeshStandardMaterial({ color: corDorso, roughness: 0.5 });
  const mChifre = new THREE.MeshStandardMaterial({ vertexColors: true, color: C(corChifre), roughness: 0.38 });
  const mEsp = new THREE.MeshStandardMaterial({ color: C(corEsp), roughness: 0.42, emissive: C(corEsp), emissiveIntensity: 0.06 });
  const mMemb = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: (o.opacMembrana ?? 0.94) < 1, opacity: o.opacMembrana ?? 0.94, roughness: 0.62, emissive: corM, emissiveIntensity: 0.32 });
  const mOlho = new THREE.MeshStandardMaterial({ color: C(o.olho ?? '#ffe45a'), emissive: C(o.olho ?? '#ffc21a'), emissiveIntensity: 2.4, roughness: 0.2 });
  const mPreto = new THREE.MeshStandardMaterial({ color: C('#140606'), roughness: 0.25 });
  const mBoca = new THREE.MeshStandardMaterial({ color: C(o.dbgBoca ?? '#4a0610'), roughness: 0.7, side: THREE.DoubleSide });
  const mLingua = new THREE.MeshStandardMaterial({ color: C('#d4505e'), roughness: 0.5 });
  const mDente = new THREE.MeshStandardMaterial({ color: C('#fff8ea'), roughness: 0.3 });
  const sombra = o.sombra !== false;
  const mk = (geo, mat, x = 0, y = 0, z = 0, par) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.castShadow = sombra; me.receiveShadow = true; if (par) par.add(me); return me; };

  const g = new THREE.Group(), raiz = new THREE.Group(); g.add(raiz);

  // ---------- espinha: [x, y, raio vertical, raio lateral] da ponta da cauda (u=0) à nuca (u=1) ----------
  const ESP = [[-7.0, 0.95, 0.03, 0.03], [-6.1, 0.78, 0.075, 0.07], [-5.2, 0.55, 0.13, 0.12], [-4.3, 0.33, 0.2, 0.18], [-3.4, 0.16, 0.3, 0.27], [-2.5, 0.05, 0.45, 0.4],
    [-1.6, 0.0, 0.63, 0.56], [-0.7, -0.02, 0.77, 0.66], [0.2, 0.02, 0.84, 0.7], [1.05, 0.16, 0.74, 0.62], [1.75, 0.45, 0.5, 0.44], [2.22, 0.95, 0.37, 0.34],
    [2.48, 1.55, 0.31, 0.29], [2.85, 2.03, 0.285, 0.27], [3.4, 2.3, 0.275, 0.265], [3.95, 2.33, 0.29, 0.29]];
  const nE = ESP.length, uE = (i) => i / (nE - 1), RY = ESP.map((p) => p[1 + 1]), RZ = ESP.map((p) => p[3]);
  const cp = ESP.map((p) => new V3(p[0], p[1], 0)), curva = new THREE.CatmullRomCurve3(cp, false, 'catmullrom', 0.5);
  const NA = 150, NR = 30, corpoGeo = tuboGeo(THREE, NA, NR);
  // comprimento de repouso (para escamas/placas)
  const sA = [0]; { const a = new V3(), b = new V3(); curva.getPoint(0, a); for (let i = 1; i < NA; i++) { curva.getPoint(i / (NA - 1), b); sA.push(sA[i - 1] + a.distanceTo(b)); a.copy(b); } }
  const placa = (s) => Math.pow(Math.abs(Math.sin(Math.PI * s / 0.3)), 0.45);
  { const col = new Float32Array(NA * (NR + 1) * 3), uv = corpoGeo.attributes.uv.array, tmp = new THREE.Color();
    for (let i = 0; i < NA; i++) for (let j = 0; j <= NR; j++) { const ang = (j / NR) * Math.PI * 2, ca = Math.cos(ang), k = i * (NR + 1) + j, u = i / (NA - 1);
      const bf = ss(0.18, 0.55, -ca), df = ss(0.15, 1.0, ca); tmp.copy(cor).lerp(corDorso, df * 0.85); tmp.lerp(corB.clone().multiplyScalar(lerp(0.66, 1, placa(sA[i]))), bf);
      if (bf > 0 && bf < 1) tmp.lerp(cor.clone().multiplyScalar(0.8), Math.sin(Math.PI * bf) * 0.35);
      col[k * 3] = tmp.r; col[k * 3 + 1] = tmp.g; col[k * 3 + 2] = tmp.b; uv[k * 2] = sA[i] / 0.55; uv[k * 2 + 1] = (j / NR) * lerp(6, 14, ss(0, 0.5, u)); }
    corpoGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); corpoGeo.attributes.uv.needsUpdate = true; }
  const corpo = mk(corpoGeo, mPele, 0, 0, 0, raiz); corpo.frustumCulled = false;

  // quadro (centro, tangente, normal, binormal, raios) num ponto u da espinha
  const UP = new V3(0, 1, 0);
  const quadro = (u, q = { c: new V3(), t: new V3(), n: new V3(), b: new V3(), ry: 0, rz: 0 }) => { curva.getPoint(u, q.c); curva.getTangent(u, q.t);
    q.b.crossVectors(q.t, UP).normalize(); q.n.crossVectors(q.b, q.t).normalize(); q.ry = crS(RY, u); q.rz = crS(RZ, u); return q; };
  const M4 = new THREE.Matrix4();
  const prende = (obj, q, dN, dB, dT = 0, espelho = false) => { obj.position.copy(q.c).addScaledVector(q.n, dN).addScaledVector(q.b, dB).addScaledVector(q.t, dT); M4.makeBasis(q.t, q.n, q.b); obj.quaternion.setFromRotationMatrix(M4); obj.scale.z = espelho ? -1 : 1; };

  // ---------- espinhos dorsais ----------
  const espGeo = new THREE.ConeGeometry(1, 1, 8); espGeo.translate(0, 0.5, 0);
  const espinhos = []; { const s0 = sA[Math.round(NA * 0.06)], s1 = sA[Math.round(NA * 0.955)]; for (let s = s0; s <= s1; s += 0.3) { let i = 0; while (i < NA - 1 && sA[i] < s) i++; const u = i / (NA - 1); espinhos.push({ u, me: mk(espGeo, mEsp, 0, 0, 0, raiz) }); } }
  // ponta da cauda: lâmina em forma de pá
  const pa = new THREE.Shape(); pa.moveTo(-0.1, 0); pa.quadraticCurveTo(0.05, 0.16, 0.0, 0.42); pa.quadraticCurveTo(0.45, 0.4, 1.05, 0); pa.quadraticCurveTo(0.45, -0.4, 0.0, -0.42); pa.quadraticCurveTo(0.05, -0.16, -0.1, 0);
  const paGeo = new THREE.ExtrudeGeometry(pa, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 14 }); paGeo.translate(0, 0, -0.03);
  const ponta = mk(paGeo, mEsp, 0, 0, 0, raiz);

  // ---------- cabeça (local: +X focinho, +Y cima, origem na nuca) ----------
  const cab = new THREE.Group(); raiz.add(cab); const cabI = new THREE.Group(); cab.add(cabI); cabI.scale.setScalar(o.cabEscala ?? 1.22);
  const cranioG = pintaVert(T, pilula(T, 1.25, 0.36, 0.42, { p: 2.4, sy: 0.95, sz: 1.08, seg: 28 }), corDorso, cor, cor);
  mk(cranioG, mCab, -0.45, 0.13, 0, cabI);
  for (const s of [-1, 1]) { const bo = mk(new THREE.SphereGeometry(1, 20, 14), mCab, 0.2, -0.06, s * 0.27, cabI); bo.geometry = pintaVert(T, new THREE.SphereGeometry(1, 20, 14), cor, cor, cor.clone().lerp(corB, 0.3)); bo.scale.set(0.34, 0.26, 0.2); } // bochechas (músculo da mandíbula)
  const fsY = 0.07, FS = [0.3, 1.8, 0.37, 0.25, 0.64, 1.0]; // x0, len, r0, r1, sy, sz do focinho
  const focG = pintaVert(T, pilula(T, FS[1] - FS[0], FS[2], FS[3], { p: 3.0, sy: FS[4], sz: FS[5], seg: 28 }), corDorso, cor, cor.clone().lerp(corB, 0.35));
  const foc = mk(focG, mCab, FS[0], fsY, 0, cabI); foc.rotation.z = -0.05;
  const rFoc = (x) => { const q = clamp01((x - FS[0]) / (FS[1] - FS[0])), xx = q * 2 - 1; return Math.pow(Math.max(0, 1 - Math.pow(Math.abs(xx), 3.0)), 1 / 3.0) * lerp(FS[2], FS[3], q); };
  const fundoFoc = (x) => fsY - (x - FS[0]) * 0.05 - rFoc(x) * FS[4];
  // ponte do focinho (crista) e narinas
  const crista = mk(pilula(T, 1.0, 0.09, 0.05, { p: 2 }), mEsc, 0.5, fsY + 0.2, 0, cabI); crista.rotation.z = -0.14;
  const ponte = mk(new THREE.SphereGeometry(1, 20, 14), mCab, 1.52, fsY + 0.08, 0, cabI); ponte.geometry = pintaVert(T, new THREE.SphereGeometry(1, 20, 14), corDorso, cor, cor); ponte.scale.set(0.22, 0.13, 0.2);
  for (const s of [-1, 1]) { const nar = mk(new THREE.SphereGeometry(0.075, 14, 10), mCor, 1.62, fsY + 0.13, s * 0.11, cabI); nar.scale.set(1.2, 0.8, 1); const bur = mk(new THREE.SphereGeometry(0.045, 12, 8), mPreto, 1.69, fsY + 0.14, s * 0.115, cabI); bur.scale.set(0.7, 0.6, 1); }
  // mandíbula inferior (gira em Z no pivô)
  const mand = new THREE.Group(); mand.position.set(0.28, -0.13, 0); cabI.add(mand);
  const MD = [1.38, 0.3, 0.15, 0.68, 0.92], mdY = -0.05;
  mk(pintaVert(T, pilula(T, MD[0], MD[1], MD[2], { p: 2.6, sy: MD[3], sz: MD[4], seg: 24 }), cor, cor, corB, [0.2, -0.15]), mCab, 0, mdY, 0, mand);
  const rMd = (x) => { const q = clamp01(x / MD[0]), xx = q * 2 - 1; return Math.pow(Math.max(0, 1 - Math.pow(Math.abs(xx), 2.6)), 1 / 2.6) * lerp(MD[1], MD[2], q); };
  mk(pilula(T, 1.0, 0.13, 0.08, { sy: 0.4, p: 2.2 }), mLingua, 0.12, mdY + rMd(0.6) * MD[3] * 0.55, 0, mand);
  // dentes
  const denteG = new THREE.ConeGeometry(1, 1, 7); denteG.translate(0, -0.5, 0);
  for (const s of [-1, 1]) { for (let k = 0; k < 7; k++) { const x = 0.6 + k * 0.155, L = k === 5 ? 0.2 : 0.1 + (k % 2) * 0.03, d = mk(denteG, mDente, x, fundoFoc(x) + 0.05, s * rFoc(x) * FS[5] * 0.78, cabI); d.scale.set(0.035 + L * 0.12, L + 0.05, 0.035 + L * 0.12); }
    for (let k = 0; k < 6; k++) { const x = 0.3 + k * 0.17, L = k === 4 ? 0.17 : 0.09, d = mk(denteG, mDente, x, mdY + rMd(x) * MD[3] - 0.04, s * rMd(x) * MD[4] * 0.74, mand); d.rotation.z = Math.PI; d.scale.set(0.032 + L * 0.12, L + 0.04, 0.032 + L * 0.12); } }
  // interior da boca: faixa escura entre as arcadas (recalculada) + garganta
  const NB = 10, bocaGeo = new THREE.BufferGeometry(), bocaPos = new Float32Array((NB + 1) * 2 * 3), bIdx = [];
  for (let k = 0; k < NB; k++) { const a = k * 2, b = a + 2; bIdx.push(a, b, a + 1, b, b + 1, a + 1); }
  bocaGeo.setAttribute('position', new THREE.BufferAttribute(bocaPos, 3)); bocaGeo.setIndex(bIdx);
  const bocaM = mk(bocaGeo, mBoca, 0, 0, 0, cabI); bocaM.castShadow = false; bocaM.frustumCulled = false;
  const garg = mk(new THREE.SphereGeometry(1, 18, 12), mBoca, 0.38, -0.08, 0, cabI); garg.scale.set(0.38, 0.26, 0.3); garg.castShadow = false;
  // olhos com pupila em fenda, sobrancelhas
  for (const s of [-1, 1]) { const ol = new THREE.Group(); ol.position.set(0.5, 0.26, s * 0.335); ol.rotation.set(0, -s * 0.5, s * -0.1); cabI.add(ol);
    const bo = mk(new THREE.SphereGeometry(0.105, 20, 14), mOlho, 0, 0, 0, ol); bo.scale.set(1.25, 0.85, 0.75); bo.castShadow = false;
    const pu = mk(new THREE.SphereGeometry(0.1, 12, 10), mPreto, 0, 0, s * 0.072, ol); pu.scale.set(0.16, 0.78, 0.12);
    const pal = mk(new THREE.SphereGeometry(0.12, 18, 12), mCor, 0, 0.055, -s * 0.005, ol); pal.scale.set(1.35, 0.55, 0.8); // pálpebra superior
    const sob = mk(pilula(T, 0.78, 0.13, 0.07, { p: 2.2, sz: 1.2 }), mEsc, 0.1, 0.44, s * 0.3, cabI); sob.rotation.set(s * 0.2, s * 0.22, -0.34); // sobrancelha brava
    const ch = mk(curvoGeo(T, [[0, 0, 0], [-0.4, 0.22, s * 0.08], [-0.9, 0.3, s * 0.16], [-1.35, 0.14, s * 0.2], [-1.6, -0.12, s * 0.2]], 0.13, 0.008, { nA: 18, pw: 0.8 }), mChifre, 0.0, 0.46, s * 0.24, cabI); // chifre maior
    mk(curvoGeo(T, [[0, 0, 0], [-0.35, -0.04, s * 0.12], [-0.7, -0.02, s * 0.22], [-0.95, 0.08, s * 0.26]], 0.075, 0.006, { nA: 14 }), mChifre, -0.05, 0.02, s * 0.36, cabI); // chifre da bochecha
    for (let k = 0; k < 3; k++) mk(curvoGeo(T, [[0, 0, 0], [-0.12, -0.06, s * 0.08], [-0.24, -0.16, s * 0.1]], 0.04, 0.004, { nA: 8, nR: 7 }), mChifre, 0.75 + k * 0.22, -0.24 + k * 0.02, s * (0.22 - k * 0.03), mand); // espinhos do queixo
    ch.userData.chifre = true; }
  for (let k = 0; k < 4; k++) { const sp = mk(espGeo, mEsp, -0.2 - k * 0.2, 0.52 - k * 0.07, 0, cabI); sp.rotation.z = 0.7; sp.scale.set(0.07, 0.17 - k * 0.02, 0.03); } // crista da nuca

  // ---------- asas ----------
  const ossoG = pilula(T, 1, 1, 0.62, { p: 3.4, seg: 14, n: 16 }); ossoG.rotateZ(Math.PI / 2); // ao longo de +Y (0..1)
  const juntaG = new THREE.SphereGeometry(1, 16, 12), coxaG = pilula(T, 1, 1, 0.55, { p: 2.3, seg: 16, n: 16 }); coxaG.rotateZ(Math.PI / 2);
  const garraG = curvoGeo(T, [[0, 0, 0], [0.12, 0.02, 0], [0.22, -0.04, 0], [0.27, -0.13, 0]], 0.055, 0.004, { nA: 10, nR: 8 });
  const DED = [[0.3, 5.3], [-0.2, 4.7], [-0.68, 4.0], [-1.18, 3.2]]; // ângulo base (rad, + = para frente) e comprimento dos dedos
  const H = new V3(-3.0, -0.12, -0.15); // ponto onde a membrana encosta no flanco
  // regiões da membrana: 4 entre dedos (0-1,1-2,2-3) + interna (dedo 3 / braço até o corpo) + borda de ataque
  const RG = []; let nv = 0; const reg = (na, nb) => { const r = { na, nb, o: nv }; nv += na * nb; RG.push(r); return r; };
  for (let i = 0; i < 3; i++) reg(11, 8); const rIn = reg(20, 8), rFr = reg(10, 3);
  const asas = [-1, 1].map((lado) => { const A = new THREE.Group(); raiz.add(A);
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = [];
    const cD = corM.clone(), cL = corM.clone().lerp(cor, 0.55).multiplyScalar(1.15), tmp = new THREE.Color();
    for (const r of RG) { for (let i = 0; i < r.na; i++) for (let j = 0; j < r.nb; j++) { const a = i / (r.na - 1), b = j / (r.nb - 1), k = r.o + i * r.nb + j;
        const w = r === rFr ? 0.2 : Math.sin(Math.PI * b) * ss(0.05, 0.55, a) * (1 - 0.35 * ss(0.85, 1, a)); tmp.copy(cD).lerp(cL, w * 0.85); col[k * 3] = tmp.r; col[k * 3 + 1] = tmp.g; col[k * 3 + 2] = tmp.b; }
      for (let i = 0; i < r.na - 1; i++) for (let j = 0; j < r.nb - 1; j++) { const a = r.o + i * r.nb + j, b = a + r.nb; idx.push(a, b, a + 1, b, b + 1, a + 1); } }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setIndex(idx);
    const memb = mk(geo, mMemb, 0, 0, 0, A); memb.frustumCulled = false;
    const os = { um: mk(ossoG, mCor, 0, 0, 0, A), an: mk(ossoG, mCor, 0, 0, 0, A), d: DED.map(() => [mk(ossoG, mCor, 0, 0, 0, A), mk(ossoG, mCor, 0, 0, 0, A)]),
      jo: [mk(juntaG, mCor, 0, 0, 0, A), mk(juntaG, mCor, 0, 0, 0, A), mk(juntaG, mCor, 0, 0, 0, A)], kn: DED.map(() => mk(juntaG, mCor, 0, 0, 0, A)) };
    os.jo[0].scale.setScalar(0.36); os.jo[1].scale.setScalar(0.17); os.jo[2].scale.setScalar(0.16); os.kn.forEach((k) => k.scale.setScalar(0.07));
    const garra = new THREE.Group(); A.add(garra); mk(garraG, mChifre, 0, 0, 0, garra).scale.setScalar(1.3);
    return { lado, A, geo, pos, os, garra }; });

  const dirE = (th, e, v = new V3()) => v.set(Math.sin(th), Math.sin(e) * Math.cos(th), Math.cos(e) * Math.cos(th));
  // calcula as juntas da asa (coordenadas locais da asa: +X frente, +Y cima, +Z para fora)
  const juntas = (ph, bat, aberta) => { const Aa = 0.78 * bat, base = lerp(0.42, 0.24, bat) * aberta + (1 - aberta) * 0.5, f = clamp01(bat * 0.48 * (0.5 + 0.5 * Math.cos(ph)) + (1 - aberta));
    const e1 = base + Aa * Math.sin(ph), e2 = base + Aa * 1.05 * Math.sin(ph - 0.45), e3 = base + Aa * 1.12 * Math.sin(ph - 0.9), e4 = base + Aa * 1.18 * Math.sin(ph - 1.3) - 0.04;
    const sw = 0.14 * bat * Math.cos(ph);
    const S = new V3(), E = S.clone().addScaledVector(dirE(-0.62 + sw - f * 0.35, e1), 2.1), W = E.clone().addScaledVector(dirE(0.5 + sw + f * 1.35, e2), 2.7);
    const K = [], P = []; DED.forEach(([th0, L], i) => { const th = th0 + sw * 0.5 - f * (1.05 + 0.32 * i); const k = W.clone().addScaledVector(dirE(th, e3), L * 0.55); K.push(k); P.push(k.clone().addScaledVector(dirE(th - 0.13 - 0.03 * i, e4), L * 0.45)); });
    return { S, E, W, K, P, e2, e3, f, sag: -0.32 * bat * Math.cos(ph) + 0.1 * aberta }; };
  // polilinha parametrizada por comprimento
  const poli = (pts) => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + pts[i].distanceTo(pts[i - 1])); const tot = L[L.length - 1] || 1e-4;
    return (a, out = new V3()) => { const d = clamp01(a) * tot; let i = 1; while (i < L.length - 1 && L[i] < d) i++; const k = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1e-4); return out.copy(pts[i - 1]).lerp(pts[i], clamp01(k)); }; };
  const nrm = (e) => new V3(0, Math.cos(e), -Math.sin(e));
  const tA = new V3(), tB = new V3(), tC = new V3();
  const poeAsa = (w, J) => { const pos = w.pos, put = (k, v) => { pos[k * 3] = v.x; pos[k * 3 + 1] = v.y; pos[k * 3 + 2] = v.z; };
    // entre dedos
    for (let r = 0; r < 3; r++) { const R = RG[r], f0 = poli([J.W, J.K[r], J.P[r]]), f1 = poli([J.W, J.K[r + 1], J.P[r + 1]]), nn = nrm(J.e3);
      for (let i = 0; i < R.na; i++) for (let j = 0; j < R.nb; j++) { const a = lerp(0.03, 1, i / (R.na - 1)), b = j / (R.nb - 1), a2 = a * (1 - (0.2 + 0.03 * r) * Math.sin(Math.PI * b));
        f0(a2, tA); f1(a2, tB); tA.lerp(tB, b).addScaledVector(nn, J.sag * Math.sin(Math.PI * b) * Math.sin(Math.PI * a2) * 0.7); put(R.o + i * R.nb + j, tA); } }
    // interna: braço+dedo 3 (bordo) × flanco+bordo de fuga (para o corpo)
    { const R = rIn, Lp = poli([J.S, J.E, J.W, J.K[3], J.P[3]]), meio = J.E.clone().lerp(J.W, 0.5), fuga = [J.S, H]; for (let k = 1; k <= 8; k++) { const c = k / 8, p = H.clone().lerp(J.P[3], c); const pull = meio.clone().sub(p).multiplyScalar(0.2 * Math.sin(Math.PI * c)); fuga.push(p.add(pull)); }
      const Tp = poli(fuga), nn = nrm(J.e2);
      for (let i = 0; i < R.na; i++) for (let j = 0; j < R.nb; j++) { const a = i / (R.na - 1), b = j / (R.nb - 1); Tp(a, tA); Lp(a, tB); tA.lerp(tB, b).addScaledVector(nn, J.sag * Math.sin(Math.PI * b) * Math.sin(Math.PI * a)); put(R.o + i * R.nb + j, tA); } }
    // borda de ataque (propatágio) entre ombro e pulso
    { const R = rFr, arm = poli([J.S, J.E, J.W]); for (let i = 0; i < R.na; i++) for (let j = 0; j < R.nb; j++) { const a = i / (R.na - 1), b = j / (R.nb - 1); arm(a, tA); tB.copy(J.S).lerp(J.W, a); tA.lerp(tB, b * 0.5 * Math.sin(Math.PI * a) ** 0.5); put(R.o + i * R.nb + j, tA); } }
    w.geo.attributes.position.needsUpdate = true; w.geo.computeVertexNormals(); w.geo.computeBoundingSphere();
    const os = w.os; liga(THREE, os.um, J.S, J.E, 0.2); liga(THREE, os.an, J.E, J.W, 0.15); os.jo[0].position.copy(J.S); os.jo[1].position.copy(J.E); os.jo[2].position.copy(J.W);
    DED.forEach((_, i) => { liga(THREE, os.d[i][0], J.W, J.K[i], 0.085 - i * 0.008); liga(THREE, os.d[i][1], J.K[i], J.P[i], 0.055 - i * 0.006, 0.02); os.kn[i].position.copy(J.K[i]); });
    // garra do pulso, apontando para a frente/cima
    w.garra.position.copy(J.W); tC.subVectors(J.W, J.E).normalize().multiplyScalar(0.5).add(tB.set(0.6, 0.75, 0)).normalize(); w.garra.quaternion.setFromUnitVectors(tA.set(1, 0, 0), tC); };

  // ---------- patas ----------
  const pataD = { tras: { L: [1.15, 1.0, 0.55], r: [0.4, 0.19, 0.12], voo: [-112, -196, -178], chao: [-72, -118, -82] }, frente: { L: [0.78, 0.72, 0.36], r: [0.24, 0.14, 0.1], voo: [-118, -32, -98], chao: [-96, -84, -70] } };
  const patas = []; for (const tipo of ['frente', 'tras']) for (const lado of [-1, 1]) { const P = new THREE.Group(); raiz.add(P); const d = pataD[tipo];
    const seg = d.L.map((_, i) => mk(i === 0 ? coxaG : ossoG, mCor, 0, 0, 0, P)), jt = d.L.map((_, i) => { const j = mk(juntaG, mCor, 0, 0, 0, P); j.scale.setScalar(d.r[i] * [0.85, 1.15, 1.1][i]); return j; });
    const pe = new THREE.Group(); P.add(pe); const sola = mk(juntaG, mCor, 0.06, 0, 0, pe); sola.scale.set(d.r[2] * 1.6, d.r[2] * 0.85, d.r[2] * 1.5);
    for (let k = -1; k <= 1; k++) { const gr = mk(garraG, mChifre, 0.1, -0.02, k * d.r[2] * 0.85, pe); gr.rotation.y = -k * 0.35; gr.scale.setScalar(tipo === 'tras' ? 1.1 : 0.85); }
    patas.push({ tipo, lado, P, seg, jt, pe, d }); }
  const poePata = (pt, k) => { const d = pt.d, pts = [new V3()]; let acc = 0; d.L.forEach((L, i) => { const a = lerp(d.voo[i], d.chao[i], k) * D; acc = a; pts.push(pts[i].clone().add(new V3(Math.cos(a) * L, Math.sin(a) * L, 0.06 * (i + 1) * (1 - k)))); });
    d.L.forEach((_, i) => { liga(THREE, pt.seg[i], pts[i], pts[i + 1], d.r[i], 0.05); pt.jt[i].position.copy(pts[i]); });
    pt.pe.position.copy(pts[3]); pt.pe.rotation.set(0, 0, lerp(acc + 0.35, 0, k)); };

  // ---------- animação ----------
  const q = { c: new V3(), t: new V3(), n: new V3(), b: new V3(), ry: 0, rz: 0 }, frames = [];
  for (let i = 0; i < NA; i++) frames.push({ c: new V3(), n: new V3(), b: new V3(), t: new V3(), ry: 0, rz: 0 });
  const st = { bater: 1, freq: 1.05, boca: 0, rugido: 0, patas: 0, cauda: 1, pescoco: 1, cabeca: 0, olhar: 0, fase: 0, asas: 1, ...o };
  g.update = (t = 0, oo = {}) => { Object.assign(st, oo); const bat = clamp01(st.bater), ph = (t * st.freq + st.fase) * Math.PI * 2, rug = clamp01(st.rugido);
    const w1 = t * 1.7 + st.fase, A = 0.85 * st.cauda, An = 0.18 * st.pescoco;
    for (let i = 0; i < nE; i++) { const p = ESP[i], wt = i <= 6 ? Math.pow((6 - i) / 6, 1.35) : 0, wn = i >= 10 ? (i - 10) / 5 : 0;
      cp[i].set(p[0] - rug * 0.35 * wn, p[1] + A * wt * 0.55 * Math.sin(w1 - i * 0.8 + 1.2) + An * wn * Math.sin(w1 * 0.8 - i * 0.55) + rug * 0.55 * wn * wn - 0.1 * bat * Math.sin(ph - 0.6) * wt,
        A * wt * Math.sin(w1 * 0.85 - i * 0.7) + An * wn * 1.4 * Math.sin(w1 * 0.6 - i * 0.5 + 2)); }
    raiz.position.y = -0.22 * bat * Math.sin(ph + 0.9); raiz.rotation.z = 0.035 * bat * Math.cos(ph + 0.9);
    for (let i = 0; i < NA; i++) { const F = frames[i]; quadro(i / (NA - 1), F); }
    tuboPoe(corpoGeo, (i) => frames[i], (i, j, ang) => { const ca = Math.cos(ang), bf = ss(0.3, 0.75, -ca); return 1 + bf * 0.04 * placa(sA[i]) + 0.05 * ss(0.8, 1, ca); });
    for (const e of espinhos) { quadro(e.u, q); const h = 0.1 + q.ry * 0.62; tA.copy(q.n).addScaledVector(q.t, -0.75).normalize(); tC.copy(q.b); tB.crossVectors(tA, tC).normalize(); M4.makeBasis(tB, tA, tC);
      e.me.position.copy(q.c).addScaledVector(q.n, q.ry * 0.9); e.me.quaternion.setFromRotationMatrix(M4); e.me.scale.set(h * 0.42, h, h * 0.13); }
    quadro(0, q); tA.copy(q.t).negate(); tC.crossVectors(tA, q.n).normalize(); M4.makeBasis(tA, q.n, tC); ponta.quaternion.setFromRotationMatrix(M4); ponta.position.copy(q.c).addScaledVector(q.t, 0.06); ponta.scale.setScalar(1.15);
    // cabeça
    quadro(1, q); prende(cab, q, 0, 0); cabI.rotation.set(0, st.olhar, st.cabeca - 0.12 + rug * 0.35 + 0.04 * Math.sin(w1 * 0.8)); if (rug > 0) cabI.rotation.x = Math.sin(t * 40) * 0.025 * rug;
    const boca = Math.max(clamp01(st.boca), rug); mand.rotation.z = -boca * 0.5 - 0.02;
    { const cz = Math.cos(mand.rotation.z), sz = Math.sin(mand.rotation.z); for (let k = 0; k <= NB; k++) { const fx = k / NB, xu = lerp(0.36, FS[1] - 0.08, fx), xl = lerp(0.05, MD[0] - 0.08, fx), yu = fundoFoc(xu) + 0.05, yl0 = mdY + rMd(xl) * MD[3] - 0.03;
        const xl2 = xl * cz - yl0 * sz + mand.position.x, yl2 = xl * sz + yl0 * cz + mand.position.y, a = k * 2 * 3; bocaPos[a] = xu; bocaPos[a + 1] = yu; bocaPos[a + 2] = 0; bocaPos[a + 3] = xl2; bocaPos[a + 4] = yl2; bocaPos[a + 5] = 0; }
      bocaGeo.attributes.position.needsUpdate = true; bocaGeo.computeVertexNormals(); }
    // asas
    quadro(8.7 / (nE - 1), q); const ab = clamp01(st.asas);
    for (const w of asas) { prende(w.A, q, q.ry * 0.5, w.lado * q.rz * 0.6, 0, w.lado < 0); poeAsa(w, juntas(ph, bat, ab)); }
    // patas
    for (const p of patas) { quadro((p.tipo === 'frente' ? 8.25 : 6.15) / (nE - 1), q); prende(p.P, q, -q.ry * (p.tipo === 'frente' ? 0.38 : 0.28), p.lado * q.rz * (p.tipo === 'frente' ? 0.66 : 0.74), 0, p.lado < 0);
      poePata(p, clamp01(st.patas)); p.P.rotation.z += 0.0; }
  };
  g.cabeca = cab; g.mandibula = mand; g.asas = asas.map((w) => w.A); g.raiz = raiz;
  // posição do focinho em coordenadas do mundo (para fogo, câmera)
  g.focinho = (out = new V3()) => { g.updateMatrixWorld(true); return cabI.localToWorld(out.set(1.9, 0.0, 0)); };
  g.update(0); return g; }

// =====================================================================================================
//  GATO LARANJA (sentado, olhando para +Z, ~0,35 m)
// =====================================================================================================
// o: { alt (0.35), cor, listra, creme, olhosBrilho 0..1 }   update(t, { olhosBrilho, piscar (bool), cauda (amplitude) })
export function gato3D(T, o = {}) {
  const THREE = T.THREE, V3 = THREE.Vector3, C = (c) => new THREE.Color(c);
  const cor = o.cor ?? '#f29a3a', listra = o.listra ?? '#b8500f', creme = o.creme ?? '#ffe8c8';
  const pelo = (rep, cab) => T.canvasTex(512, 256, (g, w, h) => { g.fillStyle = cor; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,200,120,0)'); gr.addColorStop(0.75, 'rgba(255,214,160,0)'); gr.addColorStop(1, 'rgba(255,236,210,.9)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = listra; const faixa = (u, v0, v1, lw) => { g.beginPath(); const x = u * w; g.moveTo(x - lw, v0 * h); g.quadraticCurveTo(x + lw * 0.6, (v0 + v1) / 2 * h, x, v1 * h); g.quadraticCurveTo(x - lw * 0.2, (v0 + v1) / 2 * h, x + lw, v0 * h); g.closePath(); g.fill(); };
    if (cab) { [0.215, 0.25, 0.285].forEach((u, i) => faixa(u, 0.02, i === 1 ? 0.32 : 0.26, 14)); for (const u of [0.0, 0.5, 1.0]) for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(u * w, (0.38 + k * 0.08) * h, 22 - k * 4, 5, 0, 0, Math.PI * 2); g.fill(); } }
    else for (let i = 0; i < 12; i++) { const u = (i + 0.5) / 12; if (Math.abs(u - 0.25) < 0.08) continue; faixa(u, 0.0, 0.55 + (i % 3) * 0.08, 20); } }, rep);
  const tinta = o.tinta ?? '#ffe2d2', mPelo = new THREE.MeshStandardMaterial({ color: tinta, map: pelo([1, 1], false), roughness: 0.82 }), mCab = new THREE.MeshStandardMaterial({ color: tinta, map: pelo([1, 1], true), roughness: 0.82 });
  const mLar = new THREE.MeshStandardMaterial({ color: C(cor).multiply(C(tinta)), roughness: 0.82 }), mCreme = new THREE.MeshStandardMaterial({ color: C(creme), roughness: 0.85 }), mRosa = new THREE.MeshStandardMaterial({ color: C('#ff9fb0'), roughness: 0.7 });
  const mNariz = new THREE.MeshStandardMaterial({ color: C('#ff7f94'), roughness: 0.4 }), mPreto = new THREE.MeshStandardMaterial({ color: C('#120c0a'), roughness: 0.2 }), mBranco = new THREE.MeshBasicMaterial({ color: C('#ffffff') });
  const mIris = new THREE.MeshStandardMaterial({ color: C('#c6ec3a'), emissive: C('#b4ff2a'), emissiveIntensity: 0.15, roughness: 0.15 });
  const mBigode = new THREE.MeshStandardMaterial({ color: C('#fffaf0'), roughness: 0.5 });
  const sph = new THREE.SphereGeometry(1, 28, 20);
  const mk = (geo, mat, x, y, z, sx = 1, sy = sx, sz = sx, par) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.scale.set(sx, sy, sz); me.castShadow = true; me.receiveShadow = true; (par || corpo).add(me); return me; };
  const g = new THREE.Group(), corpo = new THREE.Group(); g.add(corpo); const S = (o.alt ?? 0.35) / 4.1; corpo.scale.setScalar(S);
  // unidades internas: 1 = 10 cm aprox. (altura total 4.1 com as orelhas)
  const tronco = mk(sph, mPelo, 0, 1.3, -0.25, 1.08, 1.32, 1.05); tronco.rotation.set(-0.12, Math.PI * 0.0, 0);
  mk(sph, mCreme, 0, 1.35, 0.5, 0.66, 0.95, 0.5); // peito
  for (const s of [-1, 1]) { const anca = mk(sph, mPelo, s * 0.66, 0.68, -0.42, 0.62, 0.7, 0.95); anca.rotation.y = s * 0.2;
    mk(sph, mCreme, s * 0.78, 0.12, 0.28, 0.28, 0.16, 0.42); // pata traseira
    const perna = mk(pilula(T, 1.15, 0.24, 0.2, { p: 2.4 }), mLar, s * 0.36, 1.25, 0.5, 1, 1, 1); perna.rotation.z = -Math.PI / 2 - 0.02 * s; perna.rotation.x = 0.0; perna.position.set(s * 0.36, 1.3, 0.52);
    mk(sph, mCreme, s * 0.36, 0.14, 0.68, 0.27, 0.17, 0.33); // pata dianteira
    for (let k = -1; k <= 1; k++) mk(sph, mCreme, s * 0.36 + k * 0.1, 0.12, 0.95, 0.07, 0.06, 0.06); }
  // cabeça
  const cab = new THREE.Group(); cab.position.set(0, 2.62, 0.18); corpo.add(cab);
  const cr = mk(sph, mCab, 0, 0, 0, 1.2, 0.98, 1.0, cab); cr.rotation.y = 0;
  for (const s of [-1, 1]) { mk(sph, mLar, s * 0.82, -0.3, 0.15, 0.46, 0.4, 0.5, cab); // bochecha fofa
    mk(sph, mCreme, s * 0.21, -0.36, 0.84, 0.29, 0.22, 0.24, cab); // focinho
    const orelha = new THREE.Group(); orelha.position.set(s * 0.62, 0.68, -0.05); orelha.rotation.set(-0.1, 0, -s * 0.38); cab.add(orelha);
    mk(new THREE.ConeGeometry(0.4, 0.78, 20), mLar, 0, 0.3, 0, 1, 1, 0.55, orelha); mk(new THREE.ConeGeometry(0.27, 0.56, 16), mRosa, 0, 0.26, 0.11, 1, 1, 0.3, orelha);
    for (let k = 0; k < 3; k++) { const b = mk(new THREE.CylinderGeometry(0.012, 0.006, 1, 5), mBigode, s * 0.85, -0.36 + k * 0.08 - 0.08, 0.72, 1, 1, 1, cab); b.rotation.set(0, 0, s * (Math.PI / 2 + (k - 1) * 0.16)); b.rotation.y = -s * 0.25; } }
  mk(sph, mCreme, 0, -0.55, 0.74, 0.22, 0.16, 0.18, cab); // queixo
  const nariz = mk(sph, mNariz, 0, -0.17, 0.98, 0.13, 0.085, 0.08, cab);
  const olhos = []; for (const s of [-1, 1]) { const ol = new THREE.Group(); ol.position.set(s * 0.4, 0.08, 0.8); ol.rotation.y = s * 0.32; cab.add(ol);
    mk(sph, mPreto, 0, 0, -0.02, 0.29, 0.31, 0.19, ol); const ir = mk(sph, mIris, 0, 0, 0.02, 0.26, 0.28, 0.17, ol); const pu = mk(sph, mPreto, 0, 0, 0.12, 0.07, 0.21, 0.08, ol);
    const br = mk(sph, mBranco, s * -0.07, 0.1, 0.17, 0.055, 0.055, 0.03, ol); br.castShadow = false; olhos.push(ol); }
  // cauda (tubo animado)
  const NA = 30, NR = 14, cGeo = tuboGeo(THREE, NA, NR); { const col = new Float32Array(NA * (NR + 1) * 3), a = C(cor), b = C(listra), tmp = new THREE.Color();
    for (let i = 0; i < NA; i++) for (let j = 0; j <= NR; j++) { const u = i / (NA - 1), k = i * (NR + 1) + j; tmp.copy(a).lerp(b, ((u * 9) % 1) < 0.38 && u > 0.08 ? 1 : 0); col[k * 3] = tmp.r; col[k * 3 + 1] = tmp.g; col[k * 3 + 2] = tmp.b; }
    cGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); }
  const cauda = mk(cGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82 }), 0, 0, 0); cauda.frustumCulled = false;
  const CB = [[0, 0.5, -1.15], [0.55, 0.16, -1.2], [1.08, 0.16, -0.75], [1.28, 0.16, -0.05], [1.18, 0.22, 0.55], [0.95, 0.55, 0.95], [0.85, 0.95, 1.0]];
  const cpts = CB.map((p) => new V3(...p)), ccurve = new THREE.CatmullRomCurve3(cpts);
  const st = { olhosBrilho: o.olhosBrilho ?? 0, piscar: true, cauda: 1 };
  g.update = (t = 0, oo = {}) => { Object.assign(st, oo); const A = st.cauda;
    CB.forEach((p, i) => { const k = Math.max(0, (i - 2) / 4); cpts[i].set(p[0] + Math.sin(t * 2.3) * 0.18 * k * A, p[1] + Math.max(0, Math.sin(t * 2.3 + 1.1)) * 0.25 * k * k * A, p[2] + Math.sin(t * 2.3 + 0.6) * 0.22 * k * k * A); });
    const cs = [], ts = []; for (let i = 0; i < NA; i++) { const u = i / (NA - 1); cs.push(ccurve.getPoint(u)); ts.push(ccurve.getTangent(u)); }
    const F = quadrosPT(THREE, cs, ts); tuboPoe(cGeo, (i) => { const u = i / (NA - 1), r = 0.2 * lerp(1, 0.75, u) * (u > 0.9 ? Math.sqrt(Math.max(0.0004, 1 - ((u - 0.9) / 0.1) ** 2)) : 1) * (u < 0.04 ? 0.9 : 1); return { ...F[i], ry: r, rz: r }; });
    const br = clamp01(st.olhosBrilho); mIris.emissiveIntensity = 0.12 + 3.2 * br; mIris.emissive.set(br > 0 ? '#c8ff3a' : '#b4ff2a');
    const pis = st.piscar && br < 0.3 ? ((t % 3.7) < 0.12 ? 0.12 : 1) : 1; olhos.forEach((ol) => { ol.scale.y = pis; });
    cab.rotation.set(Math.sin(t * 0.9) * 0.04, Math.sin(t * 0.6) * 0.08, Math.sin(t * 0.7) * 0.06); tronco.scale.y = 1.32 + Math.sin(t * 2.5) * 0.015; };
  g.cabeca = cab; g.update(0); return g; }
