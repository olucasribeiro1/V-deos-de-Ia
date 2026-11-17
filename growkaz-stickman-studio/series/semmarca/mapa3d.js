// Série "Sem Marca" — mapa 3D em relevo de ALDORIA (tabuleiro de fantasia, estilo cartoon 3D macio, sem contorno).
//   NORTE (-z): Nação Élfica — floresta densa, torre élfica prateada com cristal.
//   MONTANHAS (leste/nordeste): Nação Anã — picos de pedra com neve, canais de lava, forjas, fumaça.
//   CENTRO: Reino Humano — planícies, plantações, rio, castelo de telhados azuis/vermelhos, vilas.
//   SUL (+z): Terras do Rei Demônio — chão vulcânico roxo-preto, rachaduras de lava, colosso demoníaco de chifres
//             brancos com núcleo derretido no peito, fortaleza de espinhos, névoa vermelha.
// API:
//   const mapa = mapaAldoria(T, o)  -> THREE.Group com .update(t), .pontos {norte, montanhas, centro, sul, aldoria} (Vector3),
//                                      .alt(x,z) (altura do terreno), .tela(camera, nome|Vector3) -> [x, y] lógicos (1080x1920)
//   palcoMapa(T, o)                 -> palco() já configurado (céu, luz, sombra cobrindo o tabuleiro)
//   voo(camera, t, k, mapa)         -> câmera voando nação a nação; k = {tAldoria, tNorte, tMontanhas, tCentro, tSul, fim} (tempos LOCAIS do plano)
//   chavesVoo(k, mapa)              -> as keyframes usadas por voo (para ajustar à mão)
//   rotulosMapa(g, t, o)            -> cartões 2D com o nome de cada nação (t e o.t* no MESMO relógio), o.tela = {norte:[x,y],...} opcional p/ o alfinete
import { E, rr, text, glow, alpha, ease, prog, clamp, lerp, key, FONTS, measure } from '/engine/core.js';
import { palco, pbr, m } from '/series/semmarca/turbo.js';
import { pessoa3D, ELFO, ANAO, REI_MAGO } from '/series/semmarca/gente3d.js';

// ---------- ruído 2D ----------
const hs = (x, z, s) => { const n = Math.sin(x * 127.1 + z * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); };
function vn(x, z, s = 0) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf); const a = hs(xi, zi, s), b = hs(xi + 1, zi, s), c = hs(xi, zi + 1, s), d = hs(xi + 1, zi + 1, s); return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1; }
const fbm = (x, z, s = 0) => vn(x, z, s) * 0.5 + vn(x * 2.03, z * 2.03, s + 1) * 0.25 + vn(x * 4.1, z * 4.1, s + 2) * 0.125;
const ridged = (x, z, s = 0) => { let r = 0, a = 0.6, f = 1; for (let i = 0; i < 4; i++) { const n = 1 - Math.abs(vn(x * f, z * f, s + i)); r += n * n * a; a *= 0.5; f *= 2.1; } return r; };
const sst = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const rnd = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

// ---------- geografia ----------
export const ALD = { W: 124, D: 156, norte: [-6, -40], montanhas: [27, -13], centro: [-5, 4], sul: [0, 42], castelo: [-5, 4], torre: [-9, -43], demonio: [0, 50], vulcao: [17, 45] };
const RIO = [[21, -3], [15, -1], [8, 1], [3, 8], [-3, 11.5], [-12, 12], [-20, 9], [-30, 12], [-40, 16], [-56, 18]];
function distRio(x, z) { let best = 1e9; for (let i = 0; i < RIO.length - 1; i++) { const [ax, az] = RIO[i], [bx, bz] = RIO[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz; const k = clamp(((x - ax) * dx + (z - az) * dz) / l2); const ex = ax + dx * k - x, ez = az + dz * k - z; best = Math.min(best, ex * ex + ez * ez); } return Math.sqrt(best); }
function pesos(x, z) {
  const wS = sst(17, 27, z + fbm(x * 0.07, 3) * 5), wM = Math.exp(-(((x - 27) / 14) ** 2) - (((z + 13) / 20) ** 2)) * (1 - wS), wN = sst(-15, -25, z + fbm(x * 0.06, 7) * 5) * (1 - wM), wC = Math.max(0, 1 - wS - wN - wM);
  return { wN, wM, wC, wS };
}
export function alturaAldoria(x, z) {
  const e = Math.sqrt((x / 45) ** 2 + (z / 60) ** 2) + fbm(x * 0.05, z * 0.05, 11) * 0.22, terra = sst(1.02, 0.86, e);
  const { wN, wM, wC, wS } = pesos(x, z);
  const hN = 1.5 + fbm(x * 0.09, z * 0.09, 2) * 1.8, hC = 0.9 + fbm(x * 0.06, z * 0.06, 4) * 0.5, hS = 1.1 + fbm(x * 0.1, z * 0.1, 5) * 1.6;
  let h = hN * wN + hC * (wC + wM) + hS * wS;
  h += wM * (2 + ridged(x * 0.075, z * 0.075, 9) * 17) * sst(0.05, 0.4, wM);
  const [vx, vz] = ALD.vulcao, dv = Math.hypot(x - vx, z - vz); if (dv < 11) h += 11 * sst(11, 2.5, dv) - (dv < 2.2 ? 3 * sst(2.2, 0, dv) : 0);
  const [cx, cz] = ALD.castelo, dc = Math.hypot(x - cx, z - cz); if (dc < 13) h = lerp(h, 1.2 + 2.6 * sst(12, 4, dc), sst(13, 9, dc)) ; if (dc < 5.5) h = lerp(h, 3.8, sst(5.5, 4.2, dc));
  const dr = distRio(x, z); if (dr < 3.2 && z > -6) h = lerp(0.15, h, sst(1.1, 3.2, dr));
  return lerp(-3.2 + fbm(x * 0.04, z * 0.04, 12) * 0.8, h, terra);
}

// ---------- texturas pintadas ----------
function texCanvas(T, w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.THREE.CanvasTexture(c); t.colorSpace = T.THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function oceanoTex(T) { return texCanvas(T, 1024, 1288, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.8); gr.addColorStop(0, '#5ad0ff'); gr.addColorStop(1, '#1a78c8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const r = rnd(7); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; g.lineCap = 'round';
  for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * h, s = 14 + r() * 14; g.beginPath(); g.arc(x - s, y, s, Math.PI * 1.15, Math.PI * 1.85); g.arc(x + s * 0.9, y, s, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  // rosa dos ventos (canto inferior esquerdo = sudoeste)
  g.save(); g.translate(120, h - 130); g.fillStyle = 'rgba(255,248,220,.9)'; g.strokeStyle = 'rgba(120,80,30,.9)'; g.lineWidth = 3;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, L = i % 2 ? 46 : 86; g.beginPath(); g.moveTo(Math.cos(a - 0.22) * 16, Math.sin(a - 0.22) * 16); g.lineTo(Math.cos(a) * L, Math.sin(a) * L); g.lineTo(Math.cos(a + 0.22) * 16, Math.sin(a + 0.22) * 16); g.closePath(); g.fillStyle = i % 2 ? 'rgba(255,248,220,.8)' : (i === 6 ? '#e8463a' : 'rgba(255,248,220,.95)'); g.fill(); g.stroke(); }
  g.beginPath(); g.arc(0, 0, 14, 0, 7); g.fillStyle = '#c89a4a'; g.fill(); g.font = '900 40px Nunito'; g.textAlign = 'center'; g.fillStyle = '#fff8e0'; g.fillText('N', 0, -96); g.restore();
}); }
function rachaTex(T, cor = '#ff7a1a') { // mapa de cor (pedra escura facetada com rachaduras) + máscara de emissão (rachaduras)
  const r = rnd(31), linhas = []; for (let i = 0; i < 26; i++) { let x = r() * 512, y = r() * 512, a = r() * 6.28; const pts = [[x, y]]; for (let k = 0; k < 9; k++) { a += (r() - 0.5) * 1.3; x += Math.cos(a) * 22; y += Math.sin(a) * 22; pts.push([x, y]); } linhas.push([pts, 2 + r() * 5]); }
  const desenha = (g, fundo, lava) => { g.fillStyle = fundo; g.fillRect(0, 0, 512, 512); if (fundo !== '#000') for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${40 + r() * 30},${20 + r() * 20},${50 + r() * 30},.5)`; g.beginPath(); const x = r() * 512, y = r() * 512; g.moveTo(x, y); g.lineTo(x + 40 + r() * 60, y + r() * 40); g.lineTo(x + r() * 40, y + 50 + r() * 50); g.fill(); }
    g.lineCap = 'round'; g.lineJoin = 'round'; for (const [pts, w] of linhas) { g.strokeStyle = lava; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y)); g.stroke(); } };
  const map = texCanvas(T, 512, 512, (g) => desenha(g, '#241a2a', cor)), em = texCanvas(T, 512, 512, (g) => desenha(g, '#000', '#ffffff'));
  map.wrapS = map.wrapT = em.wrapS = em.wrapT = T.THREE.RepeatWrapping; return { map, em };
}
function nevoaTex(T) { return texCanvas(T, 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }); }

// chifre/curva afunilada: tubo ao longo de uma curva com raio decrescente
function chifre(T, pts, r0, mat) { const THREE = T.THREE, curva = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), seg = 24, rad = 10, geo = new THREE.TubeGeometry(curva, seg, 1, rad, false), P = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) { const c = curva.getPointAt(i / seg), k = r0 * (1 - 0.94 * (i / seg) ** 0.9); for (let j = 0; j <= rad; j++) { const idx = i * (rad + 1) + j; v.fromBufferAttribute(P, idx).sub(c).multiplyScalar(k).add(c); P.setXYZ(idx, v.x, v.y, v.z); } }
  geo.computeVertexNormals(); const me = new THREE.Mesh(geo, mat); me.castShadow = true; return me; }

// fumaça (mistura normal, sobe e se espalha)
function fumaca(T, fontes, o = {}) { const THREE = T.THREE, n = o.n ?? 160, pos = new Float32Array(n * 3), base = [], r = rnd(o.seed ?? 5);
  for (let i = 0; i < n; i++) base.push([fontes[i % fontes.length], r() * 10, r() - 0.5, r() - 0.5]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: nevoaTex(T), color: new THREE.Color(o.cor ?? '#b8b4be'), size: o.tam ?? 2.2, transparent: true, opacity: o.opac ?? 0.5, depthWrite: false, sizeAttenuation: true });
  const p = new THREE.Points(geo, mat); p.frustumCulled = false; const H = o.altura ?? 9;
  p.update = (t) => { for (let i = 0; i < n; i++) { const [f, ph, dx, dz] = base[i], k = ((t * (o.vel ?? 0.25) + ph) % 1); pos[i * 3] = f[0] + dx * (0.4 + k * 4) + k * 2.5; pos[i * 3 + 1] = f[1] + k * H; pos[i * 3 + 2] = f[2] + dz * (0.4 + k * 4); } geo.attributes.position.needsUpdate = true; };
  p.update(0); return p; }
function brasas(T, centro, ext, o = {}) { const THREE = T.THREE, n = o.n ?? 200, pos = new Float32Array(n * 3), r = rnd(o.seed ?? 9), base = []; for (let i = 0; i < n; i++) base.push([centro[0] + (r() - 0.5) * ext[0], centro[2] + (r() - 0.5) * ext[2], r() * 10]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: nevoaTex(T), color: new THREE.Color(o.cor ?? '#ff8a2a'), size: o.tam ?? 0.5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.95 });
  const p = new THREE.Points(geo, mat); p.frustumCulled = false; p.update = (t) => { for (let i = 0; i < n; i++) { const b = base[i], k = (t * (o.vel ?? 0.12) + b[2] * 0.1) % 1; pos[i * 3] = b[0] + Math.sin(t + b[2]) * 0.6; pos[i * 3 + 1] = centro[1] + k * ext[1]; pos[i * 3 + 2] = b[1] + Math.cos(t * 0.7 + b[2]) * 0.6; } geo.attributes.position.needsUpdate = true; }; p.update(0); return p; }

// ======================================================================
export function mapaAldoria(T, o = {}) {
  const THREE = T.THREE, G = new THREE.Group(), alt = alturaAldoria, upd = [], V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const { W, D } = ALD;
  // ---------- terreno com cores por vértice ----------
  const geo = new THREE.PlaneGeometry(W, D, o.res ?? 186, Math.round((o.res ?? 186) * D / W)); geo.rotateX(-Math.PI / 2);
  const P = geo.attributes.position, cols = new Float32Array(P.count * 3), c = new THREE.Color(), tmp = new THREE.Color();
  const CO = { areia: new THREE.Color('#f0dca0'), areia2: new THREE.Color('#d8c48a'), fundo: new THREE.Color('#5aa8b8'), norte1: new THREE.Color('#3aa848'), norte2: new THREE.Color('#2a8a40'), norte3: new THREE.Color('#5cc85a'), camp1: new THREE.Color('#7ee04a'), camp2: new THREE.Color('#d8e04a'), camp3: new THREE.Color('#a8ea5a'), camp4: new THREE.Color('#62d040'), rocha1: new THREE.Color('#8c7c72'), rocha2: new THREE.Color('#584a48'), neve: new THREE.Color('#f6f9ff'), sul1: new THREE.Color('#3a2448'), sul2: new THREE.Color('#1c1222'), sul3: new THREE.Color('#5a2a3a'), margem: new THREE.Color('#6abf5a') };
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), h = alt(x, z); P.setY(i, h); const { wN, wM, wC, wS } = pesos(x, z), n1 = fbm(x * 0.12, z * 0.12, 20) * 0.5 + 0.5;
    // regiões
    c.setRGB(0, 0, 0);
    tmp.copy(CO.norte1).lerp(CO.norte2, n1).lerp(CO.norte3, clamp(fbm(x * 0.3, z * 0.3, 21))); c.add(tmp.multiplyScalar(wN));
    const px = Math.floor((x + 200) / 3.2 + fbm(z * 0.2, 3) * 1.5), pz = Math.floor((z + 200) / 2.6 + fbm(x * 0.2, 4) * 1.5), q = hs(px, pz, 3); tmp.copy(q < 0.3 ? CO.camp1 : q < 0.42 ? CO.camp2 : q < 0.75 ? CO.camp3 : CO.camp4); if (Math.hypot(x - ALD.castelo[0] + 10, z - ALD.castelo[1] - 12) > 12 || h > 2.5) tmp.copy(CO.camp4).lerp(CO.camp1, n1); c.add(tmp.multiplyScalar(wC));
    tmp.copy(CO.rocha1).lerp(CO.rocha2, n1); if (h > 13.5 + fbm(x * 0.4, z * 0.4, 8) * 2) tmp.copy(CO.neve); else if (h < 2.4) tmp.lerp(CO.camp4, sst(2.4, 1.2, h)); c.add(tmp.multiplyScalar(wM));
    if (wS < 0.5) { const kr = sst(3.2, 6.5, h + fbm(x * 0.3, z * 0.3, 14) * 1.2) * (1 - wS * 2); if (kr > 0) { tmp.copy(CO.rocha1).lerp(CO.rocha2, n1); c.multiplyScalar(1 - kr).add(tmp.multiplyScalar(kr)); } if (h > 13.5 + fbm(x * 0.4, z * 0.4, 8) * 2) c.lerp(CO.neve, (1 - wS) * 0.95); }
    tmp.copy(CO.sul1).lerp(CO.sul2, n1).lerp(CO.sul3, clamp(fbm(x * 0.25, z * 0.25, 30) * 1.4)); c.add(tmp.multiplyScalar(wS));
    // praia, margens do rio, fundo do mar
    if (h < 0.75) c.lerp(wS > 0.5 && h > 0.1 ? CO.sul2 : CO.areia, sst(0.75, 0.3, h)); if (h < -0.3) c.copy(CO.areia2).lerp(CO.fundo, sst(-0.3, -2.8, h));
    const dr = distRio(x, z); if (dr < 3.2 && z > -6 && h > 0.1) c.lerp(CO.margem, 0.5 * sst(3.2, 1.2, dr));
    cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const chao = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })); chao.receiveShadow = true; chao.castShadow = true; G.add(chao);
  // ---------- oceano + moldura de pergaminho ----------
  const mar = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: oceanoTex(T), transparent: true, opacity: 0.8, roughness: 0.18, metalness: 0.05 })); mar.rotation.x = -Math.PI / 2; mar.position.y = 0.02; mar.receiveShadow = true; G.add(mar);
  const perg = pbr(T, '#efdcab', { r: 0.85 }), friso = pbr(T, '#b88a46', { r: 0.6, m: 0.2 }), B = 7;
  for (const [w, d, x, z] of [[W + 2 * B, B, 0, -D / 2 - B / 2], [W + 2 * B, B, 0, D / 2 + B / 2], [B, D, -W / 2 - B / 2, 0], [B, D, W / 2 + B / 2, 0]]) { G.add(m(T, new THREE.BoxGeometry(w, 4.4, d), perg, x, -1.6, z)); }
  for (const [w, d, x, z] of [[W + 1.2, 0.6, 0, -D / 2 - 0.3], [W + 1.2, 0.6, 0, D / 2 + 0.3], [0.6, D + 1.2, -W / 2 - 0.3, 0], [0.6, D + 1.2, W / 2 + 0.3, 0]]) G.add(m(T, new THREE.BoxGeometry(w, 0.5, d), friso, x, 0.85, z));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { G.add(m(T, new THREE.CylinderGeometry(2.6, 2.8, 1.4, 24), friso, sx * (W / 2 + B / 2), 1.1, sz * (D / 2 + B / 2))); G.add(m(T, new THREE.SphereGeometry(1.6, 20, 14), pbr(T, '#ffd86a', { r: 0.35, m: 0.5 }), sx * (W / 2 + B / 2), 2.2, sz * (D / 2 + B / 2))); }
  G.add(m(T, new THREE.BoxGeometry(W + 2 * B + 6, 2, D + 2 * B + 6), pbr(T, '#c9a66e', { r: 0.9 }), 0, -4.6, 0));
  // nuvens fofas em volta do tabuleiro
  const nuvM = pbr(T, '#ffffff', { r: 1, extra: { emissive: new THREE.Color('#dfeeff'), emissiveIntensity: 0.25 } }); const rN = rnd(41);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, R = 1.0 + rN() * 0.12, nx = Math.cos(a) * (W / 2 + 22) * R, nz = Math.sin(a) * (D / 2 + 22) * R, ng = new THREE.Group(); for (let j = 0; j < 5; j++) { const s = 4 + rN() * 4; const b = new THREE.Mesh(new THREE.SphereGeometry(s, 18, 12), nuvM); b.position.set((rN() - 0.5) * 12, rN() * 2, (rN() - 0.5) * 8); b.scale.y = 0.65; ng.add(b); } ng.position.set(nx, -1 + rN() * 3, nz); G.add(ng); }

  // ---------- NORTE: floresta élfica ----------
  const rA = rnd(11), arv = []; for (let x = -W / 2; x < W / 2; x += 1.15) for (let z = -D / 2; z < -8; z += 1.15) { const jx = x + (rA() - 0.5) * 1.0, jz = z + (rA() - 0.5) * 1.0, h = alt(jx, jz); const { wN } = pesos(jx, jz); if (wN > 0.55 && h > 0.9 && rA() < 0.86 && Math.hypot(jx - ALD.torre[0], jz - ALD.torre[1]) > 4.5 && Math.hypot(jx - ALD.torre[0] - 5, jz - ALD.torre[1] - 7) > 3.2) arv.push([jx, h, jz, rA()]); }
  const copa = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshStandardMaterial({ roughness: 0.75 }), arv.length), pinho = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 9), new THREE.MeshStandardMaterial({ roughness: 0.8 }), arv.length), tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.24, 1, 6), pbr(T, '#7a5232'), arv.length);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S3 = new THREE.Vector3(), PV = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0), VERDES = ['#2f9a3e', '#3cb84a', '#228a46', '#4fd06a', '#1f7a52', '#5adf8a'];
  arv.forEach(([x, h, z, r], i) => { const s = 0.6 + r * 0.6, pin = r < 0.42; M4.compose(PV.set(x, h + 0.6 * s, z), Q.identity(), S3.set(1, 1.2 * s, 1)); tronco.setMatrixAt(i, M4);
    if (pin) { M4.compose(PV.set(x, h + 2.2 * s, z), Q, S3.set(0.95 * s, 3.4 * s, 0.95 * s)); pinho.setMatrixAt(i, M4); copa.setMatrixAt(i, ZERO); pinho.setColorAt(i, c.set(VERDES[(i * 7) % 6]).offsetHSL(0, 0, -0.05)); copa.setColorAt(i, c); }
    else { M4.compose(PV.set(x, h + 1.9 * s, z), Q, S3.set(1.25 * s, 1.15 * s, 1.25 * s)); copa.setMatrixAt(i, M4); pinho.setMatrixAt(i, ZERO); copa.setColorAt(i, c.set(VERDES[(i * 5) % 6]).offsetHSL((r - 0.5) * 0.04, 0, (r - 0.5) * 0.12)); pinho.setColorAt(i, c); } });
  for (const im of [copa, pinho, tronco]) { im.castShadow = true; im.receiveShadow = true; G.add(im); }
  // torre élfica prateada + 2 menores
  const prata = pbr(T, '#eef2fa', { r: 0.25, m: 0.35 }), ouroE = pbr(T, '#e8c66a', { r: 0.3, m: 0.6 }), cristalM = new THREE.MeshStandardMaterial({ color: '#c8fff4', emissive: '#4affd8', emissiveIntensity: 2.2, roughness: 0.1, flatShading: true });
  const torre = (x, z, Hh, s) => { const g = new THREE.Group(), y0 = alt(x, z) - 0.3; g.add(m(T, new THREE.CylinderGeometry(0.75 * s, 1.25 * s, Hh, 20), prata, 0, Hh / 2, 0)); for (let k = 1; k < 4; k++) { const an = m(T, new THREE.TorusGeometry((1.15 - k * 0.12) * s, 0.14 * s, 8, 28), ouroE, 0, Hh * k / 4, 0); an.rotation.x = Math.PI / 2; g.add(an); }
    g.add(m(T, new THREE.CylinderGeometry(1.3 * s, 0.8 * s, 0.9 * s, 20), prata, 0, Hh + 0.3 * s, 0)); g.add(m(T, new THREE.ConeGeometry(1.05 * s, 4.2 * s, 20), pbr(T, '#7ad8c8', { r: 0.3, m: 0.2 }), 0, Hh + 2.8 * s, 0));
    const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.75 * s, 0), cristalM); cr.position.y = Hh + 6.0 * s; g.add(cr); g.cr = cr; g.position.set(x, y0, z); return g; };
  const T1 = torre(ALD.torre[0], ALD.torre[1], 19, 1.2), T2 = torre(ALD.torre[0] - 4, ALD.torre[1] + 2.5, 7, 0.75), T3 = torre(ALD.torre[0] + 3.8, ALD.torre[1] + 2.8, 8.5, 0.8); G.add(T1, T2, T3);
  const luzE = new THREE.PointLight('#5affd8', 40, 30, 1.6); luzE.position.set(ALD.torre[0], alt(...ALD.torre) + 30, ALD.torre[1]); G.add(luzE);
  const vaga = brasas(T, [ALD.norte[0], 2, ALD.norte[1]], [40, 8, 26], { n: 160, cor: '#b8ffb0', tam: 0.55, vel: 0.05, seed: 3 }); G.add(vaga);
  upd.push((t) => { for (const tw of [T1, T2, T3]) { tw.cr.rotation.y = t * 1.2; tw.cr.position.y += Math.sin(t * 2) * 0.004; } cristalM.emissiveIntensity = 1.9 + 0.5 * Math.sin(t * 3); vaga.update(t); });

  // ---------- MONTANHAS: nação anã (lava, forjas, fumaça) ----------
  const lavaM = new THREE.MeshStandardMaterial({ color: '#ff4a00', emissive: '#ff3a00', emissiveIntensity: 2.4, roughness: 0.5 }), canais = [];
  const desce = (x, z, passos) => { const pts = []; for (let i = 0; i < passos; i++) { const h = alt(x, z); pts.push(V3(x, h + 0.12, z)); const e = 0.4, gx = alt(x + e, z) - alt(x - e, z), gz = alt(x, z + e) - alt(x, z - e), L = Math.hypot(gx, gz) || 1; x -= gx / L * 0.9 + Math.sin(i * 0.9) * 0.15; z -= gz / L * 0.9; if (h < 2.2) break; } return pts; };
  const rL = rnd(17); for (let i = 0; i < 10; i++) { const a = rL() * 6.28, d = 3 + rL() * 9, pts = desce(ALD.montanhas[0] + Math.cos(a) * d, ALD.montanhas[1] + Math.sin(a) * d * 1.3, 40); if (pts.length > 4) { const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 3, 0.28 + rL() * 0.15, 6, false), lavaM); G.add(tb); canais.push(pts[pts.length - 1]); } }
  const pedraM = pbr(T, '#5a5260', { r: 0.9 }), portaM = new THREE.MeshStandardMaterial({ color: '#ffb040', emissive: '#ff8a20', emissiveIntensity: 3 }), forjas = [];
  const sitios = [[15.5, -20], [17, -6], [33, 2], [37, -24], [22, -30]]; sitios.forEach(([x, z], i) => { const y = alt(x, z), g = new THREE.Group(); g.add(m(T, new THREE.BoxGeometry(2.4, 1.6, 2.0), pedraM, 0, 0.6, 0)); { const tt = m(T, new THREE.ConeGeometry(1.9, 1.3, 4), pbr(T, '#3a3440'), 0, 2.05, 0); tt.rotation.y = Math.PI / 4; g.add(tt); } g.add(m(T, new THREE.CylinderGeometry(0.3, 0.4, 2.6, 8), pedraM, 0.7, 2.1, 0.4)); const pt = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.0), portaM); pt.position.set(0, 0.45, 1.01); g.add(pt);
    const lz = new THREE.PointLight('#ff7a20', 18, 9, 1.8); lz.position.set(0, 1.0, 1.8); g.add(lz); g.position.set(x, y - 0.1, z); g.lookAt(ALD.centro[0], y, ALD.centro[1] + 10); G.add(g); forjas.push([x + 0.7, y + 3.5, z + 0.4]); });
  const fum = fumaca(T, forjas, { n: 90, cor: '#a8a0b0', tam: 1.6, opac: 0.32, altura: 9, vel: 0.12, seed: 3 }); G.add(fum);
  const luzM = new THREE.PointLight('#ff6a20', 60, 26, 1.5); luzM.position.set(ALD.montanhas[0] - 4, 9, ALD.montanhas[1] + 4); G.add(luzM);
  upd.push((t) => { lavaM.emissiveIntensity = 2.2 + 0.8 * Math.sin(t * 2.4); portaM.emissiveIntensity = 2.6 + 0.6 * Math.sin(t * 9) * Math.sin(t * 3.3); fum.update(t); });

  // ---------- CENTRO: reino humano (rio, castelo, vilas) ----------
  const rioC = new THREE.CatmullRomCurve3(RIO.map(([x, z]) => V3(x, 0, z))), NR = 160, rp = new Float32Array((NR + 1) * 2 * 3), ri = [];
  for (let i = 0; i <= NR; i++) { const k = i / NR, p = rioC.getPointAt(k), tg = rioC.getTangentAt(k), nx = -tg.z, nz = tg.x, w = 0.9 + k * 1.1; for (const s of [-1, 1]) { const x = p.x + nx * w * s, z = p.z + nz * w * s; rp.set([x, 0.42, z], (i * 2 + (s > 0 ? 1 : 0)) * 3); } if (i < NR) { const a = i * 2; ri.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); rg.setIndex(ri); rg.computeVertexNormals(); const rioM = new THREE.MeshStandardMaterial({ color: '#3ab8ff', emissive: '#1a6ac8', emissiveIntensity: 0.35, roughness: 0.12, side: THREE.DoubleSide }); const rioMe = new THREE.Mesh(rg, rioM); rioMe.receiveShadow = true; G.add(rioMe);
  const pedraC = pbr(T, '#ece4d4', { r: 0.7 }), azul = pbr(T, '#2a6ae0', { r: 0.45 }), verm = pbr(T, '#e0383a', { r: 0.45 }), cast = new THREE.Group(), bandeiras = [];
  const [ccx, ccz] = ALD.castelo, cy0 = alt(ccx, ccz) - 0.2; const Rw = 4.4;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8, a2 = a + Math.PI / 8; const wl = m(T, new THREE.BoxGeometry(2 * Rw * Math.sin(Math.PI / 8) + 0.2, 1.8, 0.6), pedraC, Math.cos(a2) * Rw * Math.cos(Math.PI / 8), 0.9, Math.sin(a2) * Rw * Math.cos(Math.PI / 8)); wl.rotation.y = -a2 + Math.PI / 2; cast.add(wl);
    cast.add(m(T, new THREE.CylinderGeometry(0.62, 0.7, 3.0, 16), pedraC, Math.cos(a) * Rw, 1.5, Math.sin(a) * Rw)); cast.add(m(T, new THREE.ConeGeometry(0.85, 1.6, 16), i % 2 ? azul : verm, Math.cos(a) * Rw, 3.8, Math.sin(a) * Rw)); }
  cast.add(m(T, new THREE.BoxGeometry(3.6, 3.6, 3.0), pedraC, 0, 1.8, 0)); { const tt = m(T, new THREE.ConeGeometry(2.6, 2.0, 4), azul, 0, 4.6, 0); tt.rotation.y = Math.PI / 4; cast.add(tt); }
  for (const [x, z, H, cr] of [[0, 0, 7.5, azul], [-1.4, 1.0, 5.5, verm], [1.5, 0.9, 5.8, verm], [0, -1.2, 6.2, azul]]) { cast.add(m(T, new THREE.CylinderGeometry(0.62, 0.72, H, 16), pedraC, x, H / 2, z)); cast.add(m(T, new THREE.ConeGeometry(0.95, 2.4, 16), cr, x, H + 1.2, z));
    cast.add(m(T, new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), pbr(T, '#5a4a3a'), x, H + 3.0, z)); const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.6, 8, 1), new THREE.MeshStandardMaterial({ color: cr === azul ? '#ffd23a' : '#e0383a', side: THREE.DoubleSide, roughness: 0.8 })); bd.geometry.translate(0.55, 0, 0); bd.position.set(x, H + 3.5, z); cast.add(bd); bandeiras.push(bd); }
  for (let i = 0; i < 6; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.55), new THREE.MeshStandardMaterial({ color: '#ffe8a0', emissive: '#ffcf6a', emissiveIntensity: 0.6 })); const a = i / 6 * Math.PI * 2; w.position.set(Math.cos(a) * 1.82, 2.4, Math.sin(a) * 1.52); w.lookAt(Math.cos(a) * 9, 2.4, Math.sin(a) * 9); cast.add(w); }
  cast.position.set(ccx, cy0, ccz); cast.scale.setScalar(o.escalaCastelo ?? 1.15); G.add(cast);
  const casas = [], rC = rnd(23); for (const [vx, vz, n] of [[-17, -2, 9], [9, 12, 8], [-14, 17, 9], [5, -9, 8], [-24, 7, 7], [14, 3, 6]]) for (let i = 0; i < n; i++) { const x = vx + (rC() - 0.5) * 6, z = vz + (rC() - 0.5) * 5; if (distRio(x, z) < 2.6) continue; casas.push([x, alt(x, z), z, rC()]); }
  const pared = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), pbr(T, '#ffffff', { r: 0.8 }), casas.length), telh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.82, 0.8, 4), pbr(T, '#ffffff', { r: 0.6 }), casas.length);
  casas.forEach(([x, y, z, r], i) => { Q.setFromAxisAngle(PV.set(0, 1, 0), r * 3); const s = 0.8 + r * 0.5; M4.compose(PV.set(x, y + 0.35 * s, z), Q, S3.set(1.1 * s, 0.9 * s, 0.9 * s)); pared.setMatrixAt(i, M4); pared.setColorAt(i, c.set(['#fff4dc', '#ffe8c8', '#f4ecff', '#e8f4ff'][i % 4]));
    const Q2 = Q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4)); M4.compose(PV.set(x, y + 1.18 * s, z), Q2, S3.set(1.0 * s, 1.0 * s, 0.82 * s)); telh.setMatrixAt(i, M4); telh.setColorAt(i, c.set(['#e0483a', '#e86a2a', '#c83a3a', '#3a7ae0'][(i * 3) % 4])); });
  for (const im of [pared, telh]) { im.castShadow = true; im.receiveShadow = true; G.add(im); }

  // gramado vivo do reino: tufos, flores, árvores redondas facetadas, trilha sinuosa até o castelo
  const rG = rnd(61), tufos = [], flores = [], redondas = []; const [kx, kz] = ALD.castelo;
  for (let i = 0; i < 9000 && tufos.length < 4200; i++) { const x = kx + (rG() - 0.5) * 70, z = kz + (rG() - 0.5) * 44; const h = alt(x, z), { wC } = pesos(x, z); if (wC < 0.7 || h < 0.7 || distRio(x, z) < 2.4 || Math.hypot(x - kx, z - kz) < 5.5) continue; tufos.push([x, h, z, rG()]); if (rG() < 0.18) flores.push([x + 0.3, h, z + 0.2, rG()]); if (rG() < 0.022 && Math.hypot(x - kx, z - kz) > 9) redondas.push([x, h, z, rG()]); }
  const tufoG = new THREE.ConeGeometry(0.16, 0.7, 4); tufoG.translate(0, 0.3, 0); const itu = new THREE.InstancedMesh(tufoG, new THREE.MeshStandardMaterial({ roughness: 0.85 }), tufos.length);
  tufos.forEach(([x, h, z, r], i) => { M4.compose(PV.set(x, h - 0.05, z), Q.setFromEuler(new THREE.Euler((r - 0.5) * 0.4, r * 6, 0)), S3.set(1, 0.7 + r * 0.8, 1)); itu.setMatrixAt(i, M4); itu.setColorAt(i, c.set('#4ec83a').offsetHSL((r - 0.5) * 0.05, 0.05, (r - 0.5) * 0.16)); }); itu.receiveShadow = true; G.add(itu);
  const ifl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.17, 0), new THREE.MeshStandardMaterial({ roughness: 0.5, emissive: '#222222' }), flores.length); flores.forEach(([x, h, z, r], i) => { M4.compose(PV.set(x, h + 0.4, z), Q.identity(), S3.set(1, 1, 1)); ifl.setMatrixAt(i, M4); ifl.setColorAt(i, c.set(['#ffffff', '#ffe14a', '#ff6aa8', '#b88aff', '#ff8a3a'][Math.floor(r * 5)])); }); G.add(ifl);
  const fofa = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ roughness: 0.8, flatShading: true }), redondas.length), tr2 = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.26, 1, 6), pbr(T, '#8a5a34'), redondas.length);
  redondas.forEach(([x, h, z, r], i) => { const s = 0.75 + r * 0.55; M4.compose(PV.set(x, h + 0.8 * s, z), Q.identity(), S3.set(1, 1.6 * s, 1)); tr2.setMatrixAt(i, M4); M4.compose(PV.set(x, h + 2.3 * s, z), Q.setFromEuler(new THREE.Euler(0, r * 6, 0)), S3.set(1.5 * s, 1.4 * s, 1.5 * s)); fofa.setMatrixAt(i, M4); fofa.setColorAt(i, c.set(['#4cc83e', '#62d64a', '#3aae3a'][i % 3])); });
  for (const im of [fofa, tr2]) { im.castShadow = true; im.receiveShadow = true; G.add(im); }
  const trilhaPts = []; for (let i = 0; i <= 60; i++) { const k = i / 60, a = k * 4.2 + 0.6, r = lerp(4.6, 14, k); trilhaPts.push([kx + Math.cos(a) * r + k * 3, kz + Math.sin(a) * r * 0.85 + k * 4]); }
  const tp = new Float32Array(trilhaPts.length * 2 * 3), ti = []; trilhaPts.forEach(([x, z], i) => { const [x2, z2] = trilhaPts[Math.min(i + 1, trilhaPts.length - 1)], [x0, z0] = trilhaPts[Math.max(i - 1, 0)], dx = x2 - x0, dz = z2 - z0, L = Math.hypot(dx, dz) || 1, nx = -dz / L * 0.55, nz = dx / L * 0.55; tp.set([x + nx, alt(x + nx, z + nz) + 0.1, z + nz, x - nx, alt(x - nx, z - nz) + 0.1, z - nz], i * 6); if (i < trilhaPts.length - 1) ti.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); });
  const tg2 = new THREE.BufferGeometry(); tg2.setAttribute('position', new THREE.BufferAttribute(tp, 3)); tg2.setIndex(ti); tg2.computeVertexNormals(); const trilha = new THREE.Mesh(tg2, new THREE.MeshStandardMaterial({ color: '#f2dca0', roughness: 0.95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })); trilha.receiveShadow = true; G.add(trilha);
  // pico facetado de topo branco (marco da nação anã, visto do reino) + feixes de luz suaves
  const pico = new THREE.Group(), pk = [34, -24], py0 = alt(...pk) - 2; const cone1 = m(T, new THREE.ConeGeometry(10, 22, 7, 3), new THREE.MeshStandardMaterial({ color: '#7a6e78', roughness: 0.9, flatShading: true }), 0, 11, 0); pico.add(cone1);
  const cap = m(T, new THREE.ConeGeometry(4.6, 10.1, 7, 1), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, flatShading: true }), 0, 22 - 5.05 + 0.02, 0); cap.scale.set(1.04, 1, 1.04); pico.add(cap); pico.position.set(pk[0], py0, pk[1]); pico.rotation.y = 0.3; G.add(pico);
  upd.push((t) => { bandeiras.forEach((b, i) => { const p = b.geometry.attributes.position; for (let j = 0; j < p.count; j++) { const x = p.getX(j); p.setZ(j, Math.sin(t * 6 + x * 5 + i) * 0.12 * x); } p.needsUpdate = true; b.rotation.y = 0.3 * Math.sin(t * 0.7 + i); }); rioM.emissiveIntensity = 0.3 + 0.08 * Math.sin(t * 2); });

  // ---------- SUL: terras do Rei Demônio ----------
  const { map: rMap, em: rEm } = rachaTex(T), demM = new THREE.MeshStandardMaterial({ map: rMap, emissiveMap: rEm, emissive: new THREE.Color('#ff6a1a'), emissiveIntensity: 2.2, roughness: 0.55, metalness: 0.15, flatShading: true });
  const osso = pbr(T, '#f2ead6', { r: 0.45 }), nucleoM = new THREE.MeshStandardMaterial({ color: '#ffd080', emissive: '#ff7a1a', emissiveIntensity: 4, roughness: 0.3 });
  // rachaduras de lava no chão
  const crackM = new THREE.MeshStandardMaterial({ color: '#ff5a10', emissive: '#ff3a0a', emissiveIntensity: 2.6, roughness: 0.6 }), rS = rnd(29);
  for (let i = 0; i < 26; i++) { let x = -30 + rS() * 60, z = 22 + rS() * 30, a = rS() * 6.28; const pts = []; for (let k = 0; k < 9; k++) { const h = alt(x, z); if (h < 0.4) break; pts.push(V3(x, h + 0.1, z)); a += (rS() - 0.5) * 1.2; x += Math.cos(a) * 1.8; z += Math.sin(a) * 1.8; } if (pts.length > 3) G.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 3, 0.14 + rS() * 0.12, 5, false), crackM)); }
  // vulcão: lava na cratera
  const [vx, vz] = ALD.vulcao, lagoa = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), nucleoM); lagoa.rotation.x = -Math.PI / 2; lagoa.position.set(vx, alt(vx, vz) + 0.4, vz); G.add(lagoa);
  const luzV = new THREE.PointLight('#ff4a10', 60, 24, 1.6); luzV.position.set(vx, alt(vx, vz) + 3, vz); G.add(luzV);
  // colosso demoníaco (fortaleza viva): tronco facetado com rachaduras, cabeça, chifres de osso, olhos, núcleo derretido no peito
  const dem = new THREE.Group(), [dx, dz] = ALD.demonio, dy = alt(dx, dz) - 1.5;
  const tor = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), demM); tor.scale.set(6.5, 7.5, 4.2); tor.position.y = 5.5; tor.castShadow = true; dem.add(tor);
  for (const s of [-1, 1]) { const omb = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8, 0), demM); omb.position.set(s * 6.4, 9.5, 0.3); omb.castShadow = true; dem.add(omb); for (let k = 0; k < 3; k++) { const sp = m(T, new THREE.ConeGeometry(0.7, 3.2, 6), osso, s * (6.2 + k * 0.9), 11.6 + k * 0.4, -0.6 + k * 0.6); sp.rotation.z = -s * (0.5 + k * 0.25); dem.add(sp); }
    const braco = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), demM); braco.scale.set(1.8, 5.5, 1.8); braco.position.set(s * 8.2, 4.5, 1.2); braco.rotation.z = s * 0.25; braco.castShadow = true; dem.add(braco); }
  const cab = new THREE.Mesh(new THREE.DodecahedronGeometry(2.9, 0), demM); cab.position.set(0, 14.8, 0.8); cab.scale.set(1, 1.05, 0.95); cab.castShadow = true; dem.add(cab);
  const mand = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), demM); mand.scale.set(1.3, 0.9, 1); mand.position.set(0, 12.9, 2.0); dem.add(mand);
  for (const s of [-1, 1]) { dem.add(chifre(T, [[s * 2.0, 16.3, 0.6], [s * 4.8, 17.6, 0.4], [s * 6.6, 20.2, 0.0], [s * 6.2, 23.6, -0.6], [s * 4.6, 25.4, -1.0]], 1.25, osso));
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 10), new THREE.MeshStandardMaterial({ color: '#fff0a0', emissive: '#ffb020', emissiveIntensity: 5 })); olho.position.set(s * 1.15, 15.3, 3.65); olho.scale.set(1.3, 0.6, 0.6); olho.rotation.z = s * 0.35; dem.add(olho); }
  const nuc = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), nucleoM); nuc.position.set(0, 7.2, 3.9); dem.add(nuc); const luzN = new THREE.PointLight('#ff6a1a', 120, 30, 1.4); luzN.position.set(0, 7.5, 7); dem.add(luzN);
  dem.position.set(dx, dy, dz); dem.rotation.y = Math.PI; dem.scale.setScalar(o.escalaDemonio ?? 1); G.add(dem);
  // fortaleza de espinhos à frente do colosso
  const fort = new THREE.Group(), escuro = new THREE.MeshStandardMaterial({ map: rMap, emissiveMap: rEm, emissive: new THREE.Color('#ff4a10'), emissiveIntensity: 1.8, roughness: 0.6, flatShading: true });
  for (const [x, z, H, r] of [[0, 0, 7, 1.3], [-3.2, 1.4, 5, 0.9], [3.2, 1.4, 5.4, 0.9], [-5.6, 3.4, 3.6, 0.7], [5.6, 3.4, 3.8, 0.7], [-1.6, 3.6, 3.2, 0.6], [1.6, 3.6, 3.4, 0.6]]) { fort.add(m(T, new THREE.CylinderGeometry(r * 0.75, r, H, 6), escuro, x, H / 2, z)); fort.add(m(T, new THREE.ConeGeometry(r * 0.95, H * 0.7, 6), escuro, x, H + H * 0.35, z));
    for (let k = 0; k < 3; k++) { const sp = m(T, new THREE.ConeGeometry(0.22, 1.6, 5), osso, x + Math.cos(k * 2.1) * r, H * 0.75, z + Math.sin(k * 2.1) * r); sp.rotation.set(Math.sin(k * 2.1) * 0.9, 0, -Math.cos(k * 2.1) * 0.9); fort.add(sp); } }
  fort.add(m(T, new THREE.BoxGeometry(12, 1.8, 0.8), escuro, 0, 0.9, 4.6)); const portal = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), nucleoM); portal.position.set(0, 1.1, 5.05); fort.add(portal);
  fort.position.set(dx, alt(dx, dz - 10) - 0.3, dz - 10); fort.rotation.y = Math.PI; G.add(fort);
  // névoa vermelha + brasas + nuvem escura
  const rF = rnd(51), nN = 22, nPos = new Float32Array(nN * 3), nBase = []; for (let i = 0; i < nN; i++) { nBase.push([-30 + rF() * 60, 2 + rF() * 5, 24 + rF() * 30, rF() * 6]); }
  const nGeo = new THREE.BufferGeometry(); nGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3)); const nevoaM = new THREE.PointsMaterial({ map: nevoaTex(T), color: new THREE.Color('#ff2a3a'), size: 26, transparent: true, opacity: 0.3, depthWrite: false, sizeAttenuation: true });
  const nevoa = new THREE.Points(nGeo, nevoaM); nevoa.frustumCulled = false; G.add(nevoa); // Points: o GTAO ignora (sprites viravam retângulos escuros)
  const cinza = brasas(T, [0, 1, 40], [60, 18, 30], { n: 240, cor: '#ff7a2a', tam: 0.45, vel: 0.07, seed: 12 }); G.add(cinza);
  const fumV = fumaca(T, [[vx, alt(vx, vz) + 1, vz]], { n: 60, cor: '#5a4a5a', tam: 4, opac: 0.5, altura: 16, vel: 0.08, seed: 8 }); G.add(fumV);
  upd.push((t) => { const p = 0.5 + 0.5 * Math.sin(t * 2.2); crackM.emissiveIntensity = 2 + 1.2 * p; demM.emissiveIntensity = 1.8 + 1.0 * p; escuro.emissiveIntensity = 1.5 + 0.8 * p; nucleoM.emissiveIntensity = 3.5 + 1.5 * Math.sin(t * 3.1); luzN.intensity = 100 + 40 * Math.sin(t * 3.1); luzV.intensity = 50 + 20 * p;
    nuc.rotation.y = t * 0.8; nuc.scale.setScalar(1 + 0.06 * Math.sin(t * 6)); nBase.forEach(([x, y, z, f], i) => nPos.set([x + Math.sin(t * 0.25 + f) * 3, y, z], i * 3)); nGeo.attributes.position.needsUpdate = true; nevoaM.opacity = 0.28 + 0.06 * Math.sin(t * 0.8); cinza.update(t); fumV.update(t); });

  // ---------- miniaturas (peças do tabuleiro): elfo arqueiro, anão no martelo, Rei Mago no portão ----------
  if (o.figuras !== false) { const E2 = o.escalaFiguras ?? 2.4, figs = [];
    const poe = (preset, x, z, rot, estado, ks = 1) => { const f = pessoa3D(T, { ...preset }); f.position.set(x, alt(x, z) - 0.05, z); f.rotation.y = rot; f.scale.setScalar(E2 * ks); f.traverse(q => { if (q.isMesh) { q.castShadow = true; } }); G.add(f); figs.push([f, estado]); return f; };
    poe(ELFO, ALD.torre[0] + 5, ALD.torre[1] + 7, 0.3, 'arco', 1.25); poe(ANAO, 18.5, -9, -0.6, 'martelar', 1.5); poe(REI_MAGO, ALD.castelo[0] + 3.5, ALD.castelo[1] + 7.2, 0.4, 'cajado');
    upd.push((t) => figs.forEach(([f, e], i) => { try { f.anima(t + i, e); } catch (err) { } })); G.figuras = figs.map(f => f[0]); }
  // ---------- pontos para a câmera / rótulos ----------
  const pt = ([x, z], dy = 0) => V3(x, Math.max(0.5, alt(x, z)) + dy, z);
  G.pontos = { aldoria: V3(0, 0, 0), norte: pt(ALD.torre, 12), montanhas: pt(ALD.montanhas, 1), centro: pt(ALD.castelo, 3), sul: V3(dx, dy + 10, dz) };
  G.alt = alt;
  const vv = new THREE.Vector3(); G.tela = (camera, p) => { vv.copy(typeof p === 'string' ? G.pontos[p] : p); G.localToWorld(vv); vv.project(camera); return [(vv.x + 1) / 2 * E.W, (1 - vv.y) / 2 * E.H, vv.z < 1]; };
  G.update = (t) => upd.forEach(f => f(t));
  G.update(0); return G;
}

// palco pronto para o mapa: céu azul, sol que cobre o tabuleiro com sombra, bloom suave para a lava
export function palcoMapa(T, o = {}) {
  const st = palco(T, { sky: ['#0a4ad0', '#3aa8ff', '#d8f4ff'], fog: [260, 700], fogColor: '#cfeaff', keyColor: '#fff2d8', keyIntensity: 2.7, keyPos: [-40, 70, 30], ambient: 0.85, ambientSky: '#cfe6ff', fov: 40, foco: 80, abertura: 0.00006, maxblur: 0.006, bloom: 0.3, bloomLimiar: 0.96, barril: 0.06, sat: 1.2, env: 0.35, exposicao: 0.9, aoRaio: 1.2, aoForca: 0.7, ...o });
  const s = st.sun; s.position.set(-70, 110, 50); Object.assign(s.shadow.camera, { left: -90, right: 90, top: 100, bottom: -100, near: 10, far: 360 }); s.shadow.camera.updateProjectionMatrix(); s.shadow.bias = -0.0006; s.shadow.normalBias = 0.05; s.shadow.radius = 3;
  st.camera.far = 1200; st.camera.updateProjectionMatrix();
  return st;
}

// ---------- voo de câmera nação a nação ----------
// k: tempos LOCAIS do plano { tAldoria, tNorte, tMontanhas, tCentro, tSul, fim }. Chega em cada nação ~0.9 s depois da deixa.
export function chavesVoo(k, mapa) {
  const P = mapa.pontos, a = (v) => [v.x, v.y, v.z], add = (v, dx, dy, dz) => [v.x + dx, v.y + dy, v.z + dz];
  const t0 = k.tAldoria ?? 0, fim = k.fim ?? (k.tSul + 4), ida = 1.1;
  const visao = [{ pos: [0, 175, 92], look: [0, 0, 2], fov: 46 }, { pos: [8, 150, 78], look: [2, 0, 0], fov: 44 }];
  const N = { pos: add(P.norte, 14, 12, 46), look: add(P.norte, 0, -6, 0), fov: 42 }, N2 = { pos: add(P.norte, 7, 8, 38), look: add(P.norte, 0, -4, 0), fov: 42 };
  const M = { pos: add(P.montanhas, -30, 30, 40), look: add(P.montanhas, 2, 3, -5), fov: 42 }, M2 = { pos: add(P.montanhas, -24, 25, 33), look: add(P.montanhas, 3, 4, -6), fov: 42 };
  const C = { pos: add(P.centro, 14, 20, 34), look: add(P.centro, 0, -1, 0), fov: 42 }, C2 = { pos: add(P.centro, 8, 15, 27), look: add(P.centro, 0, 0, 0), fov: 42 };
  const S = { pos: add(P.sul, 6, 14, -62), look: add(P.sul, 0, 1, 0), fov: 44 }, S2 = { pos: add(P.sul, 2, 9, -48), look: add(P.sul, 0, 6, 0), fov: 44 };
  const K = [[0, visao[0]], [t0, visao[0]]];
  const segue = (t, A, B, prox) => { K.push([t - 0.25, K[K.length - 1][1]]); K.push([t + ida, A]); K.push([Math.max(t + ida + 0.1, prox - 0.25), B]); };
  K.push([k.tNorte - 0.25, visao[1]]); segue(k.tNorte, N, N2, k.tMontanhas); K.splice(K.length - 3, 1);
  segue(k.tMontanhas, M, M2, k.tCentro); segue(k.tCentro, C, C2, k.tSul); K.push([k.tSul - 0.25, C2]); K.push([k.tSul + ida + 0.2, S]); K.push([fim, S2]);
  return K.filter((x, i, arr) => i === 0 || x[0] > arr[i - 1][0]);
}
export function voo(camera, t, k, mapa) { const K = mapa._K || (mapa._K = chavesVoo(k, mapa)); const v = key(t, K); camera.position.set(...v.pos); camera.lookAt(...v.look); if (v.fov && camera.fov !== v.fov) { camera.fov = v.fov; camera.updateProjectionMatrix(); } return Math.hypot(v.pos[0] - v.look[0], v.pos[1] - v.look[1], v.pos[2] - v.look[2]); }

// ---------- rótulos 2D das nações ----------
export const NACOES = {
  aldoria: { titulo: 'ALDORIA', sub: 'QUATRO NAÇÕES', cor: '#ffd23a', icone: 'mapa' },
  norte: { titulo: 'NAÇÃO ÉLFICA', sub: 'ARCO E CURA', cor: '#5dff8a', icone: 'folha' },
  montanhas: { titulo: 'NAÇÃO ANÃ', sub: 'OS MELHORES FERREIROS', cor: '#ff9a3a', icone: 'martelo' },
  centro: { titulo: 'REINO HUMANO', sub: 'GOVERNADO PELO REI MAGO', cor: '#5ab8ff', icone: 'coroa' },
  sul: { titulo: 'TERRAS DO REI DEMÔNIO', sub: 'DE ONDE NINGUÉM VOLTA', cor: '#ff3a4a', icone: 'chifres' },
};
function iconeN(g, id, x, y, r, cor) { g.save(); g.translate(x, y); g.fillStyle = cor; g.strokeStyle = cor; g.lineWidth = r * 0.16; g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = cor; g.shadowBlur = 14;
  if (id === 'folha') { g.beginPath(); g.moveTo(-r * 0.8, r * 0.8); g.quadraticCurveTo(-r * 0.9, -r * 0.7, r * 0.85, -r * 0.85); g.quadraticCurveTo(r * 0.7, r * 0.9, -r * 0.8, r * 0.8); g.fill(); g.strokeStyle = 'rgba(0,40,10,.7)'; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 0.8, r * 0.8); g.lineTo(r * 0.5, -r * 0.5); g.stroke(); }
  else if (id === 'martelo') { g.rotate(-0.6); g.fillRect(-r * 0.12, -r * 0.3, r * 0.24, r * 1.25); rr(g, -r * 0.7, -r * 0.8, r * 1.4, r * 0.6, r * 0.12); g.fill(); }
  else if (id === 'coroa') { g.beginPath(); g.moveTo(-r * 0.9, r * 0.6); g.lineTo(-r * 0.9, -r * 0.5); g.lineTo(-r * 0.45, 0); g.lineTo(0, -r * 0.8); g.lineTo(r * 0.45, 0); g.lineTo(r * 0.9, -r * 0.5); g.lineTo(r * 0.9, r * 0.6); g.closePath(); g.fill(); }
  else if (id === 'chifres') { for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * 0.25, r * 0.6); g.quadraticCurveTo(s * r * 1.1, r * 0.3, s * r * 0.8, -r * 0.9); g.quadraticCurveTo(s * r * 0.75, r * 0.0, s * r * 0.05, r * 0.25); g.closePath(); g.fill(); } g.beginPath(); g.arc(0, r * 0.45, r * 0.32, 0, 7); g.fill(); }
  else { g.beginPath(); g.moveTo(-r * 0.9, -r * 0.6); g.lineTo(-r * 0.3, -r * 0.8); g.lineTo(r * 0.3, -r * 0.6); g.lineTo(r * 0.9, -r * 0.8); g.lineTo(r * 0.9, r * 0.7); g.lineTo(r * 0.3, r * 0.9); g.lineTo(-r * 0.3, r * 0.7); g.lineTo(-r * 0.9, r * 0.9); g.closePath(); g.fill(); }
  g.restore(); }
// um cartão: pílula escura com borda clara, ícone colorido, título grande e subtítulo. a = 0..1 (entrada), y = centro.
export function cartaoNacao(g, id, a, x = 500, y = 360, T = 0) { const N = NACOES[id]; if (!N || a <= 0) return; const s = ease.outBack(clamp(a));
  const tSz0 = 70, tw0 = measure(g, N.titulo, tSz0, FONTS.title, 700), tSz = Math.min(tSz0, tSz0 * 640 / tw0), sw = measure(g, N.sub, 38, FONTS.ui, 900), W = Math.min(860, Math.max(measure(g, N.titulo, tSz, FONTS.title, 700), sw) + 190), H = 170;
  g.save(); g.globalAlpha *= clamp(a * 3); g.translate(x, y); g.scale(s, s);
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 8; rr(g, -W / 2, -H / 2, W, H, 34); g.fillStyle = 'rgba(12,14,22,0.88)'; g.fill(); g.restore();
  rr(g, -W / 2, -H / 2, W, H, 34); g.strokeStyle = 'rgba(240,244,250,0.9)'; g.lineWidth = 4; g.stroke();
  rr(g, -W / 2 + 14, -H / 2 + 14, 8, H - 28, 4); g.fillStyle = N.cor; g.fill(); glow(g, -W / 2 + 80, 0, 90, N.cor, 0.25 + 0.08 * Math.sin(T * 4));
  iconeN(g, N.icone, -W / 2 + 82, 0, 40, N.cor);
  const tx = -W / 2 + 140; text(g, N.titulo, tx, -26, { size: tSz, color: '#ffffff', font: FONTS.title, weight: 700, align: 'left' });
  text(g, N.sub, tx, 42, { size: 38, color: N.cor, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  g.restore(); }
// rótulos em sequência; o = { tAldoria, tNorte, tMontanhas, tCentro, tSul, fim, y, tela: {norte:[x,y,visivel], ...} }
export function rotulosMapa(g, t, o = {}) {
  const seq = [['aldoria', o.tAldoria], ['norte', o.tNorte], ['montanhas', o.tMontanhas], ['centro', o.tCentro], ['sul', o.tSul]].filter(s => s[1] != null);
  const y = o.y ?? 360;
  seq.forEach(([id, t0], i) => { const t1 = i + 1 < seq.length ? seq[i + 1][1] : (o.fim ?? t0 + 99); if (t < t0 - 0.05 || t > t1 + 0.05) return; const ent = prog(t, t0 + (o.atraso ?? 0.35), t0 + (o.atraso ?? 0.35) + 0.35), sai = 1 - prog(t, t1 - 0.2, t1);
    const p = o.tela?.[id]; if (p && p[2] !== false && id !== 'aldoria' && ent > 0) alfinete(g, p[0], p[1], ent * sai, NACOES[id].cor, t, y + 85);
    cartaoNacao(g, id, Math.min(ent, sai), o.x ?? 500, y, t); });
}
// alfinete pulsante sobre a nação + linha até o cartão
export function alfinete(g, x, y, a, cor, t, yCard) { if (a <= 0) return; x = clamp(x, 80, 920); y = clamp(y, yCard + 60, 1420); g.save(); g.globalAlpha *= a;
  g.setLineDash([10, 10]); g.lineDashOffset = -t * 40; g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 4; g.beginPath(); g.moveTo(clamp(x, 200, 800), yCard); g.lineTo(x, y - 40); g.stroke(); g.setLineDash([]);
  const pul = (t * 1.4) % 1; g.strokeStyle = alpha(cor, 1 - pul); g.lineWidth = 6; g.beginPath(); g.ellipse(x, y, 30 + pul * 50, (30 + pul * 50) * 0.45, 0, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x - 30, y - 44, x - 26, y - 78, x, y - 78); g.bezierCurveTo(x + 26, y - 78, x + 30, y - 44, x, y); g.fillStyle = cor; g.shadowColor = cor; g.shadowBlur = 20; g.fill(); g.shadowBlur = 0; g.beginPath(); g.arc(x, y - 56, 10, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.restore(); }
