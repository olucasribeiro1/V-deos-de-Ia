// Série "Sem Marca": peças 3D com sombreamento de desenho (toon em 3 tons) e contorno preto (casco invertido).
import { rng } from '/engine/core.js';
let GRAD = null;
export function toon(T, c, o = {}) { const THREE = T.THREE; if (!GRAD) { const d = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]); GRAD = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true; }
  return new THREE.MeshToonMaterial({ color: new THREE.Color(c), gradientMap: GRAD, ...o }); }
const OLM = {}; const olMat = (T) => (OLM.m ||= new T.THREE.MeshBasicMaterial({ color: 0x0b0b0d, side: T.THREE.BackSide }));
// contorno: casco invertido em cada malha do objeto (w = espessura relativa)
export function ol(T, obj, w = 0.04) { const add = []; obj.traverse(m => { if (m.isMesh && !m.userData.ol && !m.userData.noOl) { const h = new T.THREE.Mesh(m.geometry, olMat(T)); h.userData.ol = true; h.scale.setScalar(1 + w); m.add(h); } }); return obj; }
export function mesh(T, geo, c, x = 0, y = 0, z = 0, o = {}) { const m = new T.THREE.Mesh(geo, typeof c === 'string' ? toon(T, c, o) : c); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; }

// ---------- dragão low-poly (asas batendo via .update(t)) ----------
export function dragao(T, cor = '#c0283a') { const THREE = T.THREE, g = new THREE.Group();
  const corpo = mesh(T, new THREE.SphereGeometry(1, 12, 8), cor); corpo.scale.set(3.2, 1.1, 1.2); g.add(corpo);
  const barriga = mesh(T, new THREE.SphereGeometry(1, 12, 8), '#ffcf7a', 0, -0.35, 0); barriga.scale.set(2.6, 0.7, 0.95); g.add(barriga);
  const pesc = mesh(T, new THREE.ConeGeometry(0.55, 3, 8), cor, 3.4, 0.9, 0); pesc.rotation.z = -1.1; g.add(pesc);
  const cab = mesh(T, new THREE.ConeGeometry(0.7, 2.0, 6), cor, 5.2, 1.7, 0); cab.rotation.z = -Math.PI / 2; g.add(cab);
  for (const s of [-1, 1]) { const ch = mesh(T, new THREE.ConeGeometry(0.15, 1.0, 5), '#f2ead8', 4.7, 2.4, s * 0.35); ch.rotation.z = 0.6; g.add(ch); const o2 = mesh(T, new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe23a }), 5.5, 1.95, s * 0.38); o2.userData.noOl = true; g.add(o2); }
  const cauda = mesh(T, new THREE.ConeGeometry(0.7, 6, 8), cor, -5.6, 0.2, 0); cauda.rotation.z = Math.PI / 2 + 0.1; g.add(cauda);
  for (let i = 0; i < 6; i++) { const sp = mesh(T, new THREE.ConeGeometry(0.25, 0.8, 4), '#ffcf7a', 2.2 - i * 1.1, 1.3 - i * 0.08, 0); g.add(sp); }
  const asa = (s) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-1.5, 7); sh.lineTo(1.2, 5.6); sh.lineTo(2.2, 6.4); sh.lineTo(3.0, 4.2); sh.lineTo(4.2, 4.6); sh.lineTo(3.6, 0); sh.lineTo(0, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), toon(T, '#8a1a2a', { side: THREE.DoubleSide })); m.castShadow = true; const piv = new THREE.Group(); piv.position.set(0.2, 0.6, s * 0.8); m.rotation.x = -s * Math.PI / 2; m.position.x = -1.6; piv.add(m); g.add(piv); return piv; };
  const A = asa(1), B = asa(-1); ol(T, g, 0.05);
  g.update = (t) => { const f = Math.sin(t * 4.2) * 0.75; A.rotation.x = -f; B.rotation.x = f; cauda.rotation.y = Math.sin(t * 2) * 0.15; };
  return g; }

// ---------- duas luas (não sofrem neblina) ----------
export function luas(T) { const THREE = T.THREE, g = new THREE.Group(); const L = (r, c, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(c), fog: false })); m.position.set(x, y, z); m.userData.noOl = true; g.add(m); };
  L(14, '#fbe8ff', 60, 70, -150); L(6, '#c8f6ff', -40, 45, -140); return g; }

// ---------- cidade murada (centro cx, cz) ----------
export function cidade3D(T, cx = 45, cz = 0, seed = 3) { const THREE = T.THREE, g = new THREE.Group(), r = rng(seed);
  const pedra = '#d8cce8', tetos = ['#d8342b', '#2a5ad8', '#3a9a4a', '#8a3ab0', '#e8a030'], paredes = ['#ffd2a0', '#a0d8ff', '#ffb0c8', '#c8f0a0', '#fff0a0', '#e8c8ff'];
  const R = 16, muro = mesh(T, new THREE.CylinderGeometry(R, R, 3.2, 40, 1, true), toon(T, pedra, { side: THREE.DoubleSide }), cx, 1.6, cz); g.add(muro);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, x = cx + Math.cos(a) * R, z = cz + Math.sin(a) * R; g.add(mesh(T, new THREE.CylinderGeometry(1.2, 1.3, 5.5, 10), pedra, x, 2.75, z)); g.add(mesh(T, new THREE.ConeGeometry(1.6, 2.6, 10), tetos[i % 2], x, 6.8, z)); }
  for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = 4 + r() * 10.5, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d, w = 1.4 + r() * 1.2, h = 1.4 + r() * 1.6;
    const c = mesh(T, new THREE.BoxGeometry(w, h, w * 0.9), paredes[i % 6], x, h / 2, z); c.rotation.y = a; g.add(c); const t2 = mesh(T, new THREE.ConeGeometry(w * 0.85, 1.4, 4), tetos[i % 5], x, h + 0.7, z); t2.rotation.y = a + Math.PI / 4; g.add(t2); }
  g.add(mesh(T, new THREE.BoxGeometry(7, 5, 7), pedra, cx, 2.5, cz)); for (const [dx, dz] of [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]]) { g.add(mesh(T, new THREE.CylinderGeometry(0.9, 1, 9, 10), pedra, cx + dx, 4.5, cz + dz)); g.add(mesh(T, new THREE.ConeGeometry(1.3, 3, 10), '#2a5ad8', cx + dx, 10.5, cz + dz)); }
  g.add(mesh(T, new THREE.CylinderGeometry(1.6, 1.8, 15, 12), pedra, cx, 7.5, cz)); g.add(mesh(T, new THREE.ConeGeometry(2.3, 5, 12), '#d8342b', cx, 17.5, cz));
  const ban = mesh(T, new THREE.PlaneGeometry(1.6, 1), toon(T, '#ffd23a', { side: THREE.DoubleSide }), cx + 0.8, 21, cz); ban.userData.noOl = true; g.add(ban); g.add(mesh(T, new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), '#3a2418', cx, 20.8, cz));
  // janelas acesas (pontos emissivos)
  const wm = new THREE.MeshBasicMaterial({ color: 0xffd27a }); for (let i = 0; i < 60; i++) { const a = r() * Math.PI * 2, d = 4 + r() * 10, w = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), wm); w.position.set(cx + Math.cos(a) * d, 0.9 + r() * 1.5, cz + Math.sin(a) * d); w.lookAt(cx + Math.cos(a) * 40, 1, cz + Math.sin(a) * 40); w.userData.noOl = true; g.add(w); }
  ol(T, g, 0.035); return g; }

// ---------- paisagem: chão, morro, rio, árvores, montanhas ----------
export function paisagem(T, seed = 7) { const THREE = T.THREE, g = new THREE.Group(), r = rng(seed);
  const chao = mesh(T, new THREE.PlaneGeometry(600, 600), '#5ab85a'); chao.rotation.x = -Math.PI / 2; chao.userData.noOl = true; g.add(chao);
  const morro = mesh(T, new THREE.SphereGeometry(10, 24, 12), '#6ac85a', 0, -7.6, 0); morro.scale.set(1, 1, 1); morro.userData.noOl = true; g.add(morro);
  const rio = mesh(T, new THREE.PlaneGeometry(400, 5), new THREE.MeshBasicMaterial({ color: 0x4aa8ff }), 25, 0.05, 22); rio.rotation.x = -Math.PI / 2; rio.rotation.z = 0.35; rio.userData.noOl = true; g.add(rio);
  for (let i = 0; i < 120; i++) { const x = -40 + r() * 140, z = -60 + r() * 120; if (Math.hypot(x - 45, z) < 18 || Math.hypot(x, z) < 9) continue; const s = 0.8 + r() * 0.9;
    const tr = new THREE.Group(); tr.add(mesh(T, new THREE.CylinderGeometry(0.15 * s, 0.2 * s, 1.2 * s, 6), '#6a4a2a', 0, 0.6 * s, 0)); tr.add(mesh(T, new THREE.ConeGeometry(0.9 * s, 2.6 * s, 7), ['#2f8a3e', '#3fa04a', '#257a36'][i % 3], 0, 2.2 * s, 0)); tr.position.set(x, 0, z); g.add(tr); }
  for (let i = 0; i < 14; i++) { const a = -1.2 + i * 0.18, d = 120 + r() * 30, h = 25 + r() * 30; const m = mesh(T, new THREE.ConeGeometry(14 + r() * 10, h, 7), ['#8a6ac0', '#6a4aa0', '#9a7ad0'][i % 3], Math.cos(a) * d + 40, h / 2, Math.sin(a) * d); m.userData.noOl = true; g.add(m); const nv = mesh(T, new THREE.ConeGeometry(5, h * 0.25, 7), '#ffffff', Math.cos(a) * d + 40, h * 0.88, Math.sin(a) * d); nv.userData.noOl = true; g.add(nv); }
  ol(T, g, 0.04); return g; }

// ---------- salão da Academia ----------
export function salao3D(T) { const THREE = T.THREE, g = new THREE.Group();
  const piso = mesh(T, new THREE.PlaneGeometry(40, 60), toon(T, '#5a4a7a', { map: T.tiles('#5a4a7a', 10, [6, 9]) })); piso.rotation.x = -Math.PI / 2; piso.userData.noOl = true; g.add(piso);
  const tapete = mesh(T, new THREE.PlaneGeometry(3.4, 40), '#a8283a', 0, 0.02, 4); tapete.rotation.x = -Math.PI / 2; tapete.userData.noOl = true; g.add(tapete);
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { g.add(mesh(T, new THREE.CylinderGeometry(0.7, 0.8, 14, 14), '#e0d4f0', s * 6, 7, -14 + i * 7)); g.add(mesh(T, new THREE.BoxGeometry(2, 0.6, 2), '#b8a8d0', s * 6, 0.3, -14 + i * 7)); }
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const deg = mesh(T, new THREE.BoxGeometry(6, 0.8, 34), '#4a3060', s * (11 + k * 2), 0.4 + k * 0.8, 0); deg.userData.noOl = true; g.add(deg); }
  const parede = mesh(T, new THREE.BoxGeometry(40, 22, 1), '#2a1a46', 0, 11, -20); parede.userData.noOl = true; g.add(parede);
  for (let i = -2; i <= 2; i++) { const w = T.windowPane(2.6, 7, { glowColor: ['#ff4a6a', '#2a9dff', '#ffd23a', '#4ade6a', '#a64bff'][i + 2], cols: 3, rows: 4, power: 1.2 }); w.position.set(i * 6.5, 9, -19.4); w.userData.noOl = true; g.add(w); }
  for (let i = -2; i <= 2; i++) { const b = mesh(T, new THREE.PlaneGeometry(1.6, 5), toon(T, i % 2 ? '#c0283a' : '#2a4ad8', { side: THREE.DoubleSide }), i * 6.5 + 3.2, 13, -19.3); b.userData.noOl = true; g.add(b); }
  const ped = new THREE.Group(); ped.add(mesh(T, new THREE.CylinderGeometry(1.3, 1.5, 0.5, 8), '#8a7aa8', 0, 0.25, 0)); ped.add(mesh(T, new THREE.CylinderGeometry(0.8, 1.0, 1.4, 8), '#a898c8', 0, 1.2, 0)); ped.add(mesh(T, new THREE.CylinderGeometry(1.2, 1.2, 0.25, 8), '#c8b8e0', 0, 2.0, 0)); ped.position.set(0, 0, -6); g.add(ped);
  const crM = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, emissive: 0x4aa8ff, emissiveIntensity: 0.6, roughness: 0.2, flatShading: true }); const cr = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 0), crM); cr.scale.set(0.8, 1.4, 0.8); cr.position.set(0, 3.8, -6); g.add(cr);
  const luz = new THREE.PointLight(0x6ac8ff, 30, 18, 1.6); luz.position.set(0, 4, -5); g.add(luz);
  ol(T, g, 0.03); g.cristal = cr; g.cristalMat = crM; g.luz = luz; return g; }

// ---------- plateia nas arquibancadas do salão (instanciada, com contorno) ----------
export function plateia3D(T, seed = 5) { const THREE = T.THREE, g = new THREE.Group(), r = rng(seed); const pos = [];
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) for (let z = -15; z <= 15; z += 1.3) pos.push([s * (11 + k * 2) + (r() - 0.5) * 0.4, 0.8 + k * 0.8, z + (r() - 0.5) * 0.3, s]);
  const n = pos.length, corpo = new THREE.CapsuleGeometry(0.2, 0.55, 4, 8), cab = new THREE.SphereGeometry(0.27, 12, 8);
  const mk = (geo, m, sc, dy) => { const im = new THREE.InstancedMesh(geo, m, n), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S3 = new THREE.Vector3(sc, sc, sc), V = new THREE.Vector3(); pos.forEach((p, i) => { V.set(p[0], p[1] + dy, p[2]); M4.compose(V, Q, S3); im.setMatrixAt(i, M4); }); im.castShadow = true; return im; };
  const wm = toon(T, '#f1efe9'), bm = new THREE.MeshBasicMaterial({ color: 0x0b0b0d, side: THREE.BackSide });
  g.add(mk(corpo, wm, 1, 0.5), mk(corpo, bm, 1.18, 0.5), mk(cab, wm, 1, 1.25), mk(cab, bm, 1.15, 1.25));
  g.userData.pos = pos; return g; }
