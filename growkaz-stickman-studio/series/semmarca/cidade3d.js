// Cidade medieval 3D detalhada (série Sem Marca): casas enxaimel com texturas, telhados de telha, chaminés,
// janelas com venezianas, sacadas, floreiras, barracas de feira com toldo listrado, barris, caixotes, lanternas,
// varal de bandeirinhas, poço, carroça, calçamento de pedra, castelo ao fundo. Rua ao longo do eixo X.
import { rng } from '/engine/core.js';
const TX = {};
const tex = (T, key, w, h, draw, rep) => { const k = key + rep; if (!TX[k]) TX[k] = T.canvasTex(w, h, draw, rep); return TX[k]; };
// texturas
const reboco = (T, cor) => tex(T, 'reb' + cor, 256, 256, (g, w, h) => { g.fillStyle = cor; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${i % 2 ? 0 : 255},${i % 2 ? 0 : 255},${i % 2 ? 0 : 255},.04)`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } });
const enxaimel = (T, cor, viga = '#4a2c1a') => tex(T, 'enx' + cor, 512, 512, (g, w, h) => { g.fillStyle = cor; g.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { g.fillStyle = 'rgba(0,0,0,.035)'; g.fillRect(Math.random() * w, Math.random() * h, 4, 4); }
  g.strokeStyle = viga; g.lineCap = 'square'; g.lineWidth = 26; g.strokeRect(13, 13, w - 26, h - 26); g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); g.lineWidth = 18; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h / 2); g.moveTo(w, 0); g.lineTo(w / 2, h / 2); g.moveTo(0, h); g.lineTo(w / 2, h / 2); g.stroke(); });
const telha = (T, cor) => tex(T, 'tel' + cor, 256, 256, (g, w, h) => { g.fillStyle = cor; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? -16 : 0; x < w; x += 32) { const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.beginPath(); g.arc(x + 16, y + 6, 16, 0, Math.PI); g.lineTo(x, y + 32); g.lineTo(x + 32, y + 32); g.fill(); } }, [3, 3]);
const pedra = (T, cor = '#b8b0c0') => tex(T, 'ped' + cor, 512, 512, (g, w, h) => { g.fillStyle = '#6a6470'; g.fillRect(0, 0, w, h); const r = rng(3); for (let y = 0; y < h; y += 42) for (let x = (y / 42) % 2 ? -40 : 0; x < w; x += 80) { const v = (r() - 0.5) * 30; g.fillStyle = `rgb(${parseInt(cor.slice(1, 3), 16) + v},${parseInt(cor.slice(3, 5), 16) + v},${parseInt(cor.slice(5, 7), 16) + v})`; g.beginPath(); g.roundRect(x + 3, y + 3, 74, 36, 8); g.fill(); } }, [4, 2]);
const calcada = (T, rep = [30, 4]) => tex(T, 'calc', 512, 512, (g, w, h) => { g.fillStyle = '#5a5248'; g.fillRect(0, 0, w, h); const r = rng(9); for (let y = 0; y < h; y += 28) for (let x = (y / 28) % 2 ? -18 : 0; x < w; x += 36) { const v = 130 + r() * 50; g.fillStyle = `rgb(${v + 6},${v},${v - 12})`; g.beginPath(); g.ellipse(x + 18, y + 14, 16, 12, r() * 0.4, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(x + 14, y + 10, 8, 5, 0, 0, 7); g.fill(); } }, rep);
const listrado = (T, a, b) => tex(T, 'lst' + a + b, 128, 128, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 16, 0, 16, h); } });
const madeira = (T) => tex(T, 'mad', 256, 256, (g, w, h) => { g.fillStyle = '#7a4e2e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.05)'; g.fillRect(0, i * 16, w, 16); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, i * 16, w, 2); } });
const M = (T, c, o = {}) => new T.THREE.MeshStandardMaterial({ color: new T.THREE.Color(c), roughness: o.r ?? 0.8, metalness: o.m ?? 0, map: o.map || null, emissive: o.e ? new T.THREE.Color(o.e) : undefined, emissiveIntensity: o.ei ?? 1 });
function mesh(T, geo, mat, x = 0, y = 0, z = 0, sombra = true) { const m = new T.THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sombra; m.receiveShadow = true; return m; }
function telhado(T, w, d, h, cor) { const THREE = T.THREE, sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.35, 0); sh.lineTo(0, h); sh.lineTo(w / 2 + 0.35, 0); sh.lineTo(-w / 2 - 0.35, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: d + 0.7, bevelEnabled: false }); geo.translate(0, 0, -(d + 0.7) / 2);
  const mt = M(T, cor, { map: telha(T, cor), r: 0.7 }); const lado = M(T, '#e8dcc0', { map: reboco(T, '#e8dcc0') }); return new THREE.Mesh(geo, [lado, mt]); }

// ---------- casa: frente voltada para +z (gire o grupo). w largura, d fundo, andares 1..3 ----------
export function casa(T, o = {}) { const THREE = T.THREE, r = rng(o.seed ?? 1), g = new THREE.Group();
  const w = o.w ?? 5, d = o.d ?? 5, andares = o.andares ?? 2, ha = 2.8, parede = o.parede ?? '#f2e6cc', teto = o.teto ?? '#c0462a';
  const base = mesh(T, new THREE.BoxGeometry(w, ha, d), M(T, '#ffffff', { map: pedra(T, o.pedraCor ?? '#c8bca8') }), 0, ha / 2, 0); g.add(base);
  for (let a = 1; a < andares; a++) { const ov = 0.35 * a; const andar = mesh(T, new THREE.BoxGeometry(w + ov * 0.6, ha, d + ov), M(T, '#ffffff', { map: enxaimel(T, parede) }), 0, ha / 2 + a * ha, ov / 2); g.add(andar);
    g.add(mesh(T, new THREE.BoxGeometry(w + ov * 0.6 + 0.1, 0.22, d + ov + 0.1), M(T, '#4a2c1a'), 0, a * ha, ov / 2)); }
  const topo = andares * ha, rh = w * (0.55 + r() * 0.25), rf = telhado(T, w + 0.35 * (andares - 1) * 0.6, d + 0.35 * (andares - 1), rh, teto); rf.position.set(0, topo, 0.35 * (andares - 1) / 2); rf.castShadow = true; g.add(rf);
  if (r() < 0.8) { g.add(mesh(T, new THREE.BoxGeometry(0.6, 1.8, 0.6), M(T, '#ffffff', { map: pedra(T, '#a89c90') }), w * 0.25, topo + rh * 0.7, -d * 0.2)); g.add(mesh(T, new THREE.BoxGeometry(0.75, 0.15, 0.75), M(T, '#5a5058'), w * 0.25, topo + rh * 0.7 + 0.95, -d * 0.2)); }
  // porta e janelas (frente em +z)
  const fz = d / 2 + 0.03; g.add(mesh(T, new THREE.BoxGeometry(1.1, 2.0, 0.12), M(T, '#ffffff', { map: madeira(T) }), -w * 0.18, 1.0, fz)); g.add(mesh(T, new THREE.BoxGeometry(1.4, 0.2, 0.2), M(T, '#4a2c1a'), -w * 0.18, 2.1, fz + 0.04));
  const lit = M(T, '#ffd890', { e: '#ffb050', ei: o.noite ? 1.6 : 0.5, r: 0.3 }), shut = M(T, ['#2f6ab0', '#3f8a4a', '#b0283a', '#6a3a8a'][Math.floor(r() * 4)]);
  const jan = (x, y, z) => { g.add(mesh(T, new THREE.BoxGeometry(0.8, 1.0, 0.08), lit, x, y, z, false)); g.add(mesh(T, new THREE.BoxGeometry(0.95, 0.12, 0.25), M(T, '#4a2c1a'), x, y - 0.56, z + 0.06)); for (const s of [-1, 1]) { const sv = mesh(T, new THREE.BoxGeometry(0.42, 1.05, 0.06), shut, x + s * 0.65, y, z + 0.05); sv.rotation.y = s * 0.25; g.add(sv); } };
  jan(w * 0.22, 1.5, fz); for (let a = 1; a < andares; a++) { const ov = 0.35 * a; for (const x of [-w * 0.25, w * 0.25]) { jan(x, a * ha + 1.4, d / 2 + ov + 0.03); if (r() < 0.6) { g.add(mesh(T, new THREE.BoxGeometry(1.0, 0.3, 0.35), M(T, '#6a4630'), x, a * ha + 0.8, d / 2 + ov + 0.25)); for (let f = 0; f < 4; f++) g.add(mesh(T, new THREE.SphereGeometry(0.1, 6, 4), M(T, ['#ff4a6a', '#ffd23a', '#ff8a3a', '#ffffff'][f]), x - 0.36 + f * 0.24, a * ha + 1.02, d / 2 + ov + 0.3, false)); } } }
  if (o.placa) { const pl = mesh(T, new THREE.BoxGeometry(1.1, 0.7, 0.08), M(T, '#ffffff', { map: T.canvasTex(128, 80, (c) => { c.fillStyle = '#5a3420'; c.fillRect(0, 0, 128, 80); c.fillStyle = '#ffd23a'; c.font = '900 34px serif'; c.textAlign = 'center'; c.fillText(o.placa, 64, 52); }) }), w * 0.38, 2.6, fz + 0.6); g.add(pl); g.add(mesh(T, new THREE.BoxGeometry(0.08, 0.08, 0.8), M(T, '#2a1a10'), w * 0.38, 3.0, fz + 0.3)); }
  return g; }

// ---------- adereços ----------
export function barraca(T, x, z, rot = 0, cores = ['#d8342b', '#f2ead8'], seed = 1) { const THREE = T.THREE, g = new THREE.Group(), r = rng(seed);
  g.add(mesh(T, new THREE.BoxGeometry(2.6, 0.9, 1.2), M(T, '#ffffff', { map: madeira(T) }), 0, 0.45, 0)); for (const sx of [-1.2, 1.2]) for (const sz of [-0.5, 0.5]) g.add(mesh(T, new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), M(T, '#5a3420'), sx, 1.2, sz));
  const toldo = mesh(T, new THREE.BoxGeometry(2.9, 0.06, 1.7), M(T, '#ffffff', { map: listrado(T, ...cores) }), 0, 2.45, 0.15); toldo.rotation.x = 0.18; g.add(toldo);
  const frutas = ['#ff3a3a', '#ffb43a', '#7ad84a', '#ffe14a', '#b04aff']; for (let i = 0; i < 18; i++) g.add(mesh(T, new THREE.SphereGeometry(0.11, 8, 6), M(T, frutas[Math.floor(r() * 5)], { r: 0.4 }), -1.1 + (i % 9) * 0.27, 0.98, -0.3 + Math.floor(i / 9) * 0.35, false));
  g.position.set(x, 0, z); g.rotation.y = rot; return g; }
export function barril(T, x, z, s = 1) { const THREE = T.THREE, g = new THREE.Group(); g.add(mesh(T, new THREE.CylinderGeometry(0.38 * s, 0.38 * s, 1.0 * s, 14), M(T, '#ffffff', { map: madeira(T) }), 0, 0.5 * s, 0)); for (const y of [0.18, 0.82]) g.add(mesh(T, new THREE.TorusGeometry(0.4 * s, 0.03, 6, 18), M(T, '#3a3a40', { m: 0.6, r: 0.4 }), 0, y * s, 0).rotateX(Math.PI / 2)); g.position.set(x, 0, z); return g; }
export function caixote(T, x, z, s = 0.7, rot = 0) { const m = mesh(T, new T.THREE.BoxGeometry(s, s, s), M(T, '#ffffff', { map: madeira(T) }), x, s / 2, z); m.rotation.y = rot; return m; }
export function lanterna(T, x, z, h = 3.4, luz = false) { const THREE = T.THREE, g = new THREE.Group(); g.add(mesh(T, new THREE.CylinderGeometry(0.07, 0.09, h, 8), M(T, '#2a2a30', { m: 0.5 }), 0, h / 2, 0)); g.add(mesh(T, new THREE.BoxGeometry(0.6, 0.06, 0.06), M(T, '#2a2a30'), 0.25, h, 0));
  g.add(mesh(T, new THREE.BoxGeometry(0.3, 0.4, 0.3), M(T, '#ffe0a0', { e: '#ffb040', ei: 2.2 }), 0.5, h - 0.25, 0, false)); if (luz) { const pl = new THREE.PointLight('#ffb060', 4, 9, 2); pl.position.set(0.5, h - 0.3, 0); g.add(pl); } g.position.set(x, 0, z); return g; }
export function bandeirinhas(T, x0, x1, y, z0, z1, n = 18, seed = 2) { const THREE = T.THREE, g = new THREE.Group(), r = rng(seed); const cs = ['#ff3a5a', '#ffd23a', '#2a9dff', '#4ade6a', '#ff8a3a', '#b04aff'];
  const pts = []; for (let i = 0; i <= n; i++) { const k = i / n; pts.push(new THREE.Vector3(x0 + (x1 - x0) * k, y - Math.sin(k * Math.PI) * 0.8, z0 + (z1 - z0) * k)); }
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#2a2a30' })));
  const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-0.18, 0, 0, 0.18, 0, 0, 0, -0.45, 0], 3)); tri.computeVertexNormals();
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(tri, new THREE.MeshStandardMaterial({ color: cs[i % 6], side: THREE.DoubleSide, roughness: 0.8 })); m.position.copy(pts[i]).lerp(pts[i + 1], 0.5); m.lookAt(m.position.x + (z1 - z0), m.position.y, m.position.z - (x1 - x0)); g.add(m); } return g; }
export function poco(T, x, z) { const THREE = T.THREE, g = new THREE.Group(); g.add(mesh(T, new THREE.CylinderGeometry(1.1, 1.2, 1.0, 20, 1, true), M(T, '#ffffff', { map: pedra(T) }), 0, 0.5, 0)); g.add(mesh(T, new THREE.CircleGeometry(1.0, 20), M(T, '#2a6ab0', { r: 0.1 }), 0, 0.7, 0).rotateX(-Math.PI / 2));
  for (const s of [-1, 1]) g.add(mesh(T, new THREE.BoxGeometry(0.15, 2.2, 0.15), M(T, '#5a3420'), s * 1.0, 1.6, 0)); const tt = mesh(T, new THREE.ConeGeometry(1.6, 1.0, 4), M(T, '#a8432a', { map: telha(T, '#a8432a') }), 0, 3.1, 0); tt.rotation.y = Math.PI / 4; g.add(tt); g.position.set(x, 0, z); return g; }
export function carroca(T, x, z, rot = 0) { const THREE = T.THREE, g = new THREE.Group(); g.add(mesh(T, new THREE.BoxGeometry(2.4, 0.5, 1.4), M(T, '#ffffff', { map: madeira(T) }), 0, 0.9, 0)); for (const sx of [-0.8, 0.8]) for (const sz of [-0.75, 0.75]) g.add(mesh(T, new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16), M(T, '#5a3420'), sx, 0.5, sz).rotateX(Math.PI / 2));
  for (let i = 0; i < 6; i++) g.add(mesh(T, new THREE.SphereGeometry(0.25, 8, 6), M(T, i % 2 ? '#e8c060' : '#7ad84a'), -0.8 + (i % 3) * 0.7, 1.35, -0.3 + Math.floor(i / 3) * 0.6)); g.position.set(x, 0, z); g.rotation.y = rot; return g; }
export function vaso(T, x, z) { const THREE = T.THREE, g = new THREE.Group(); g.add(mesh(T, new THREE.CylinderGeometry(0.35, 0.28, 0.6, 12), M(T, '#c8643a'), 0, 0.3, 0)); for (let i = 0; i < 5; i++) g.add(mesh(T, new THREE.IcosahedronGeometry(0.32, 1), M(T, ['#3fa04a', '#4fb446'][i % 2]), (i - 2) * 0.12, 0.85 + (i % 2) * 0.2, (i % 3 - 1) * 0.12)); g.position.set(x, 0, z); return g; }
export function castelo3D(T, x, z, s = 1) { const THREE = T.THREE, g = new THREE.Group(), pm = M(T, '#ffffff', { map: pedra(T, '#e8e2f0') });
  const torreC = (tx, tz, r, h, cor) => { g.add(mesh(T, new THREE.CylinderGeometry(r, r * 1.08, h, 20), pm, tx, h / 2, tz)); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.add(mesh(T, new THREE.BoxGeometry(r * 0.35, r * 0.4, r * 0.35), pm, tx + Math.cos(a) * r, h + r * 0.2, tz + Math.sin(a) * r)); }
    g.add(mesh(T, new THREE.ConeGeometry(r * 1.25, r * 2.6, 20), M(T, cor, { map: telha(T, cor) }), tx, h + r * 1.5, tz)); for (let j = 0; j < 3; j++) g.add(mesh(T, new THREE.BoxGeometry(0.3, 0.6, 0.1), M(T, '#ffd890', { e: '#ffb050', ei: 0.8 }), tx, h * (0.35 + j * 0.2), tz + r + 0.02, false)); };
  g.add(mesh(T, new THREE.BoxGeometry(14, 8, 8), pm, 0, 4, 0)); for (let i = 0; i < 14; i++) g.add(mesh(T, new THREE.BoxGeometry(0.6, 0.8, 0.6), pm, -6.5 + i, 8.4, 4));
  torreC(-7, 4, 1.6, 12, '#2a5ad8'); torreC(7, 4, 1.6, 12, '#2a5ad8'); torreC(-4, -2, 1.3, 15, '#d8342b'); torreC(4, -2, 1.3, 15, '#d8342b'); torreC(0, 0, 2.2, 20, '#d8342b');
  g.add(mesh(T, new THREE.BoxGeometry(3, 4.5, 0.3), M(T, '#ffffff', { map: madeira(T) }), 0, 2.25, 4.05));
  for (const bx of [-3, 3]) g.add(mesh(T, new THREE.PlaneGeometry(1.4, 4), new THREE.MeshStandardMaterial({ color: bx < 0 ? '#2a4ad8' : '#c0283a', side: THREE.DoubleSide }), bx, 5, 4.06, false));
  g.position.set(x, 0, z); g.scale.setScalar(s); return g; }

// ---------- a rua: casas dos dois lados (frentes voltadas para a rua), feira, adereços ----------
export function rua3D(T, o = {}) { const THREE = T.THREE, g = new THREE.Group(), r = rng(o.seed ?? 5), x0 = o.x0 ?? -20, x1 = o.x1 ?? 120, meio = o.largura ?? 5;
  const ch = mesh(T, new THREE.PlaneGeometry(x1 - x0 + 60, 60), M(T, '#ffffff', { map: calcada(T, [(x1 - x0 + 60) / 2.2, 60 / 2.2]), r: 0.85 }), (x0 + x1) / 2, 0, 0); ch.rotation.x = -Math.PI / 2; g.add(ch);
  const paredes = ['#f6ead0', '#ffd9a8', '#cfe8ff', '#ffd0dc', '#e2f2c8', '#fff2b0', '#e8d8ff'], tetos = ['#c0462a', '#2a5ad8', '#3a8a4a', '#8a3ab0', '#d87a2a', '#a8283a'], placas = ['PADARIA', 'FERREIRO', 'TAVERNA', 'POÇÕES', 'ALFAIATE', 'MERCADO'];
  for (const lado of [-1, 1]) { let x = x0; let i = 0; while (x < x1) { const w = 4.2 + r() * 2.2, andares = 2 + Math.floor(r() * 2);
      const c = casa(T, { w, d: 6, andares, parede: paredes[Math.floor(r() * 7)], teto: tetos[Math.floor(r() * 6)], seed: i * 7 + (lado > 0 ? 1 : 2), placa: r() < 0.3 ? placas[Math.floor(r() * 6)] : null, noite: o.noite });
      c.position.set(x + w / 2, 0, lado * (meio + 3.2)); c.rotation.y = lado > 0 ? Math.PI : 0; g.add(c); x += w + 0.15; i++; } }
  for (let x = x0 + 4; x < x1; x += 7 + r() * 5) { const lado = r() < 0.5 ? -1 : 1, z = lado * (meio - 0.2); const k = r();
    if (k < 0.3) g.add(barraca(T, x, z - lado * 0.4, lado > 0 ? Math.PI : 0, [['#d8342b', '#f2ead8'], ['#2a5ad8', '#ffffff'], ['#3a8a4a', '#ffe8a0']][Math.floor(r() * 3)], Math.floor(x)));
    else if (k < 0.5) { g.add(barril(T, x, z)); g.add(barril(T, x + 0.8, z + lado * 0.1, 0.9)); g.add(caixote(T, x + 0.3, z - lado * 0.6, 0.6, r())); }
    else if (k < 0.65) g.add(vaso(T, x, z)); else if (k < 0.8) g.add(carroca(T, x, z - lado * 0.6, r() * 0.4)); else g.add(caixote(T, x, z, 0.7, r())); }
  for (let x = x0 + 2; x < x1; x += 9) { g.add(lanterna(T, x, -(meio - 0.2), 3.4, o.noite && x % 18 < 9)); g.add(lanterna(T, x + 4.5, meio - 0.2, 3.4)); }
  for (let x = x0 + 6; x < x1; x += 12) g.add(bandeirinhas(T, x, x + 3, 6.2, -meio - 1, meio + 1, 14, x));
  if (o.poco !== false) g.add(poco(T, o.pocoX ?? 30, 0));
  g.add(castelo3D(T, x1 + 30, 0, 1.6));
  return g; }
