// Avenida brasileira à noite em 3D (série Sem Marca, abertura do Ep. "morreu salvando um gato").
// Tudo 3D (sem contorno preto): asfalto molhado com reflexos, calçadas com meio-fio, faixas, faixa de pedestre,
// prédios coloridos com janelas acesas, letreiros neon (FARMÁCIA, LANCHES, AÇAÍ, BAR...), postes de concreto com
// fiação, luminárias com cone de luz, semáforo, carros estacionados, trânsito ao longe, orelhão, ponto de ônibus,
// mesas de bar, árvores, caixas d'água azuis e prédios altos ao fundo. Só o boneco é 2D (boneco2D do turbo.js).
//
// API
//   avenida3D(T, o)    -> Group   (rua ao longo de X, pista z ∈ [-5,5], calçadas |z| ∈ [5,10], fachadas em |z| = 10)
//        o: { x0=-60, x1=150, seed=7, luzes=4 (PointLights de poste), focoX=0 (onde ficam as luzes reais), neonLuz=true }
//        refs: g.semaforo {set('verde'|'amarelo'|'vermelho'|'pisca'|'off'), update(t)}, g.transito {update(t)},
//              g.reflexos {update(cam)} (rastros de reflexo no asfalto, viram pra câmera), g.update(t, cam) (faz tudo)
//   caminhao3D(T, o)   -> Group   (cara-chata azul, ~8 m, frente para -X, origem no chão no centro do caminhão)
//        o: { cor='#1f6ad8', farois=1 }  refs: g.farois(k 0..1), g.rodar(dx metros), g.faroisMundo() -> [Vector3, Vector3],
//              g.frente (distância do centro ao para-choque = 4.1)
//   gatoPlaceholder(T) -> Group   (esfera laranja; frente = +X local; troque por gato3D do dragao3d.js)
//   ambienteNeon(T, st, k)        (troca o environment do palco por um "quarto neon" — reflexos coloridos no asfalto/cromado)
//   cenaMorte(T, o)    -> { stage, st, av, truck, gato, eu, update(t), overlay(g, t), tempos }
//        o: tempos no MESMO relógio que você passa em update(t) (use info.globalT e timestamps globais):
//           tGato (gato aparece/câmera desce), tCaminhao (faróis surgem), tCorre (você corre), tPulo (mergulho),
//           tImpacto (clarão branco — antes da batida), tIleso (fim do clarão; gato a salvo na calçada), fim (fim do plano)
//           gato: Group opcional (gato3D); gatoRotY: correção de rotação do modelo; camera:false para controlar a câmera você mesmo
import { rng, clamp, lerp, ease, prog, E } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { palco, boneco2D } from '/series/semmarca/turbo.js';
import { PROTAGONISTA } from '/personagem/protagonista.js';

const TX = {};
const tx = (T, key, w, h, draw, rep) => { const k = key + (rep ? rep.join('x') : ''); if (!TX[k]) TX[k] = T.canvasTex(w, h, draw, rep); return TX[k]; };
const C = (T, c) => new T.THREE.Color(c);
const std = (T, c, o = {}) => new T.THREE.MeshStandardMaterial({ color: C(T, c), roughness: o.r ?? 0.75, metalness: o.m ?? 0, ...(o.x || {}) });
const hdr = (T, c, k = 2, o = {}) => new T.THREE.MeshBasicMaterial({ color: C(T, c).multiplyScalar(k), ...o });
const add = (T, c, op = 0.2, map = null) => new T.THREE.MeshBasicMaterial({ color: C(T, c), map, transparent: true, opacity: op, blending: T.THREE.AdditiveBlending, depthWrite: false, side: T.THREE.DoubleSide, fog: true });
function mk(T, geo, mat, x = 0, y = 0, z = 0, sombra = true) { const me = new T.THREE.Mesh(geo, mat); me.position.set(x, y, z); me.castShadow = sombra; me.receiveShadow = true; return me; }
const FONTE = '"Fredoka", "Nunito", Arial, sans-serif';

// ---------- texturas ----------
const glowTex = (T) => tx(T, 'glow', 128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,.55)'); gr.addColorStop(0.5, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const fadeTex = (T) => tx(T, 'fade', 64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
// rastro de reflexo: forte numa ponta, some na outra, bordas suaves
const rastroTex = (T) => tx(T, 'rastro', 64, 256, (g, w, h) => { const r = rng(5); for (let y = 0; y < h; y++) { const a = Math.pow(1 - y / h, 1.6) * (0.6 + 0.4 * r()); const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(255,255,255,0)'); gx.addColorStop(0.5, `rgba(255,255,255,${a})`); gx.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gx; g.fillRect(0, y, w, 1); } });
const asfalto = (T) => tx(T, 'asf', 512, 512, (g, w, h) => { const r = rng(11); g.fillStyle = '#34343f'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const v = 30 + r() * 50; g.fillStyle = `rgba(${v},${v},${v + 8},.5)`; g.fillRect(r() * w, r() * h, 2, 2); }
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(15,15,22,.35)'; g.beginPath(); g.ellipse(r() * w, r() * h, 40 + r() * 90, 18 + r() * 40, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(10,10,14,.5)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); } }, [16, 1]);
// rugosidade: poças (escuras = espelho)
const poca = (T) => tx(T, 'poca', 512, 512, (g, w, h) => { const r = rng(21); g.fillStyle = 'rgb(120,120,120)'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { const x = r() * w, y = r() * h, rx = 30 + r() * 110, ry = 12 + r() * 50; const gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, 'rgb(8,8,8)'); gr.addColorStop(0.7, 'rgb(20,20,20)'); gr.addColorStop(1, 'rgba(120,120,120,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, r() * 3, 0, 7); g.fill(); } }, [16, 1]);
const calcadaTex = (T) => tx(T, 'calc', 256, 256, (g, w, h) => { g.fillStyle = '#7a7480'; g.fillRect(0, 0, w, h); const r = rng(4); for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { const v = 112 + r() * 26; g.fillStyle = `rgb(${v},${v - 4},${v + 6})`; g.fillRect(x + 2, y + 2, 60, 60); } for (let i = 0; i < 800; i++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(r() * w, r() * h, 3, 3); } }, [60, 1.5]);
// fachada (cor + janelas) e mapa emissivo (só o que acende)
function fachada(T, cor, w, h, seed, terreo) { const key = `fach${cor}${w}${h}${seed}`; if (TX[key]) return TX[key];
  const r = rng(seed), PX = 48, W = Math.round(w * PX), H = Math.round(h * PX), cv = [0, 1].map(() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; });
  const g = cv[0].getContext('2d'), e = cv[1].getContext('2d'); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  g.fillStyle = cor; g.fillRect(0, 0, W, H); for (let i = 0; i < W * H / 60; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.04)'; g.fillRect(r() * W, r() * H, 3, 3); }
  // manchas de umidade e pichação
  for (let i = 0; i < 3; i++) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(r() * W, 0, 20 + r() * 40, H); }
  const andares = Math.floor((h - 3.4 - 0.6) / 3), cols = Math.max(1, Math.floor(w / 2.2)), cw = W / cols;
  const cores = ['#ffd890', '#ffe7b8', '#bfe8ff', '#8ab8ff', '#ffb8e0', '#ffd890'];
  for (let a = 0; a < andares; a++) for (let c = 0; c < cols; c++) { const x = c * cw + cw * 0.22, y = H - (3.4 + (a + 1) * 3) * PX + 0.7 * PX, ww = cw * 0.56, hh = 1.5 * PX;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 4, y - 4, ww + 8, hh + 10); const lit = r() < 0.55, col = cores[Math.floor(r() * cores.length)];
    g.fillStyle = lit ? col : '#1a2030'; g.fillRect(x, y, ww, hh); if (lit) { e.fillStyle = col; e.fillRect(x, y, ww, hh); const cort = r(); if (cort < 0.5) { const cc = ['#c84a6a', '#4a8ac8', '#e8c04a', '#6ac88a'][Math.floor(r() * 4)]; g.fillStyle = cc; e.fillStyle = cc; g.fillRect(x, y, ww * 0.3, hh); e.fillRect(x, y, ww * 0.3, hh); } }
    g.fillStyle = 'rgba(30,30,40,.9)'; g.fillRect(x + ww / 2 - 2, y, 4, hh); g.fillRect(x, y + hh * 0.45, ww, 3); e.fillStyle = '#000'; e.fillRect(x + ww / 2 - 2, y, 4, hh);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x - 6, y + hh + 2, ww + 12, 5); // peitoril
    if (r() < 0.3) { g.strokeStyle = 'rgba(20,20,26,.8)'; g.lineWidth = 3; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(x + ww * k / 6, y); g.lineTo(x + ww * k / 6, y + hh); g.stroke(); } e.fillStyle = '#000'; for (let k = 1; k < 6; k++) e.fillRect(x + ww * k / 6 - 1, y, 3, hh); } }
  // térreo: loja com vitrine acesa ou porta de enrolar
  const ty = H - 3.4 * PX; g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, ty - 6, W, 8);
  if (terreo === 'loja') { const vc = ['#fff2c8', '#d8f4ff', '#ffe0f0', '#e0ffe8'][Math.floor(r() * 4)]; g.fillStyle = '#2a2a30'; g.fillRect(W * 0.06, ty + 0.5 * PX, W * 0.88, 2.9 * PX); g.fillStyle = vc; g.fillRect(W * 0.08, ty + 0.6 * PX, W * 0.84, 2.7 * PX); e.fillStyle = vc; e.fillRect(W * 0.08, ty + 0.6 * PX, W * 0.84, 2.7 * PX);
    // prateleiras/pessoas dentro (silhuetas)
    for (let i = 0; i < 6; i++) { const sx = W * 0.1 + r() * W * 0.78; const sc = ['#e85a8a', '#3a9dff', '#ffd23a', '#4ac07a'][i % 4]; g.fillStyle = sc; e.fillStyle = sc; g.fillRect(sx, ty + 1.2 * PX + (i % 3) * 0.6 * PX, W * 0.08, 0.3 * PX); e.fillRect(sx, ty + 1.2 * PX + (i % 3) * 0.6 * PX, W * 0.08, 0.3 * PX); }
    g.fillStyle = 'rgba(30,30,40,.9)'; for (let k = 1; k < 4; k++) { g.fillRect(W * 0.08 + W * 0.84 * k / 4 - 2, ty + 0.6 * PX, 4, 2.7 * PX); e.fillStyle = '#000'; e.fillRect(W * 0.08 + W * 0.84 * k / 4 - 2, ty + 0.6 * PX, 4, 2.7 * PX); } }
  else { g.fillStyle = '#6a6e78'; g.fillRect(W * 0.08, ty + 0.5 * PX, W * 0.84, 2.9 * PX); for (let y = ty + 0.5 * PX; y < H; y += 8) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(W * 0.08, y, W * 0.84, 2); }
    g.strokeStyle = ['#ff4ac8', '#3ae8ff', '#ffd23a', '#111'][Math.floor(r() * 4)]; g.lineWidth = 6; g.lineCap = 'round'; for (let k = 0; k < 3; k++) { g.beginPath(); let x = W * 0.15 + r() * W * 0.5, y = ty + 1.4 * PX + r() * PX; g.moveTo(x, y); for (let j = 0; j < 8; j++) { x += 10 + r() * 22; y += (r() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); } }
  const t1 = new T.THREE.CanvasTexture(cv[0]), t2 = new T.THREE.CanvasTexture(cv[1]); t1.colorSpace = t2.colorSpace = T.THREE.SRGBColorSpace; t1.anisotropy = t2.anisotropy = 4;
  return (TX[key] = [t1, t2]); }
// letreiro neon (texto + borda de "tubo"), fundo escuro
function letreiroTex(T, txt, cor, vertical = false) { return tx(T, 'neon' + txt + cor + vertical, vertical ? 128 : 512, vertical ? 512 : 128, (g, w, h) => {
  g.fillStyle = '#0d0a18'; g.fillRect(0, 0, w, h); g.strokeStyle = cor; g.lineWidth = 5; g.shadowColor = cor; g.shadowBlur = 14; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const draw = (x, y, s, size) => { g.font = `700 ${size}px ${FONTE}`; g.shadowBlur = 22; g.fillStyle = cor; g.fillText(s, x, y); g.shadowBlur = 6; g.fillStyle = '#ffffff'; g.globalAlpha = 0.75; g.fillText(s, x, y); g.globalAlpha = 1; };
  if (vertical) { const L = [...txt]; const sz = Math.min(96, 440 / L.length); L.forEach((ch, i) => draw(w / 2, 36 + (i + 0.5) * (440 / L.length), ch, sz)); }
  else { let size = 86; g.font = `700 ${size}px ${FONTE}`; while (g.measureText(txt).width > w - 70 && size > 30) { size -= 4; g.font = `700 ${size}px ${FONTE}`; }
    if (txt === 'FARMÁCIA') { g.fillStyle = cor; g.shadowBlur = 18; g.fillRect(28, 44, 40, 40); g.fillRect(12, 56, 72, 16); g.fillRect(36, 28, 24, 72); draw(w / 2 + 38, h / 2 + 4, txt, size * 0.92); } else draw(w / 2, h / 2 + 4, txt, size); } }); }

// ---------- peças reaproveitáveis ----------
const GEO = {};
const geo = (key, make) => GEO[key] || (GEO[key] = make());

// carro simples arredondado (frente em +X local)
export function carro3D(T, cor = '#3a9dff', o = {}) { const THREE = T.THREE, g = new THREE.Group(), on = o.ligado ?? false;
  const corpo = geo('cb', () => new RoundedBoxGeometry(4.1, 0.78, 1.8, 3, 0.28)), cab = geo('cc', () => new RoundedBoxGeometry(2.1, 0.7, 1.62, 3, 0.26)), roda = geo('cr', () => new THREE.CylinderGeometry(0.33, 0.33, 0.24, 16).rotateX(Math.PI / 2)), farol = geo('cf', () => new THREE.BoxGeometry(0.06, 0.16, 0.36));
  g.add(mk(T, corpo, new THREE.MeshPhysicalMaterial({ color: C(T, cor), roughness: 0.35, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.15 }), 0, 0.62, 0));
  g.add(mk(T, cab, new THREE.MeshStandardMaterial({ color: C(T, '#0d1622'), roughness: 0.06, metalness: 0.7 }), -0.25, 1.28, 0));
  const pneu = std(T, '#141418', { r: 0.9 }); for (const [x, z] of [[1.3, 0.82], [1.3, -0.82], [-1.3, 0.82], [-1.3, -0.82]]) g.add(mk(T, roda, pneu, x, 0.33, z));
  const fM = on ? hdr(T, '#fff4d8', 5) : std(T, '#d8dce8', { r: 0.2, m: 0.5 }), tM = hdr(T, '#ff2a2a', on ? 3 : 0.6);
  for (const z of [0.6, -0.6]) { g.add(mk(T, farol, fM, 2.06, 0.75, z, false)); g.add(mk(T, farol, tM, -2.06, 0.78, z, false)); }
  if (on) { for (const z of [0.6, -0.6]) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(T), color: C(T, '#fff2d0'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.setScalar(1.6); s.position.set(2.2, 0.75, z); g.add(s);
    const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(T), color: C(T, '#ff2a2a'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 })); s2.scale.setScalar(1.0); s2.position.set(-2.2, 0.78, z); g.add(s2); } }
  return g; }

function arvore3D(T, x, z, s = 1, seed = 1) { const THREE = T.THREE, g = new THREE.Group(), r = rng(seed);
  g.add(mk(T, geo('tr', () => new THREE.CylinderGeometry(0.12, 0.18, 2.6, 7)), std(T, '#5a3e2e'), 0, 1.3, 0));
  const folha = std(T, ['#2f9a5a', '#3aa868', '#258a50'][seed % 3], { r: 0.85, x: { flatShading: true } });
  for (let i = 0; i < 4; i++) g.add(mk(T, geo('ico', () => new THREE.IcosahedronGeometry(1, 1)), folha, (r() - 0.5) * 1.2, 3.0 + r() * 0.9, (r() - 0.5) * 1.2).rotateY(r() * 3)).children.at(-1).scale.setScalar(0.8 + r() * 0.5);
  g.position.set(x, 0.18, z); g.scale.setScalar(s); return g; }

function orelhao(T) { const THREE = T.THREE, g = new THREE.Group();
  g.add(mk(T, new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), std(T, '#9a9aa4', { m: 0.6, r: 0.4 }), 0, 1.2, 0));
  const casca = mk(T, new THREE.SphereGeometry(0.62, 24, 14, -Math.PI * 0.15, Math.PI * 1.3, 0, Math.PI * 0.62), new THREE.MeshPhysicalMaterial({ color: C(T, '#ff9a1a'), roughness: 0.3, clearcoat: 1, side: THREE.DoubleSide }), 0, 1.75, -0.05); casca.scale.set(1, 1.35, 1); g.add(casca);
  g.add(mk(T, new THREE.BoxGeometry(0.3, 0.45, 0.16), std(T, '#2a5ad8', { r: 0.5 }), 0, 1.55, -0.32)); g.add(mk(T, new THREE.BoxGeometry(0.08, 0.26, 0.08), std(T, '#111'), 0.1, 1.6, -0.22));
  return g; }

function mesaBar(T, x, z, seed) { const THREE = T.THREE, g = new THREE.Group(), am = std(T, '#ffd21a', { r: 0.45 }), r = rng(seed);
  g.add(mk(T, new THREE.BoxGeometry(0.8, 0.05, 0.8), am, 0, 0.72, 0)); for (const [a, b] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) g.add(mk(T, new THREE.CylinderGeometry(0.025, 0.025, 0.72, 6), am, a, 0.36, b));
  for (const [a, b] of [[-0.7, 0], [0.7, 0], [0, 0.7]]) { const c = new THREE.Group(); c.add(mk(T, new THREE.BoxGeometry(0.42, 0.04, 0.42), am, 0, 0.44, 0)); c.add(mk(T, new THREE.BoxGeometry(0.42, 0.45, 0.04), am, 0, 0.68, -0.2)); for (const [p, q] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) c.add(mk(T, new THREE.CylinderGeometry(0.02, 0.02, 0.44, 5), am, p, 0.22, q)); c.position.set(a, 0, b); c.rotation.y = Math.atan2(-a, -b) + (r() - 0.5) * 0.5; g.add(c); }
  const garrafa = std(T, '#6a3a12', { r: 0.1, m: 0.1 }); for (let i = 0; i < 2; i++) g.add(mk(T, new THREE.CylinderGeometry(0.035, 0.04, 0.26, 8), garrafa, -0.15 + i * 0.25, 0.88, (r() - 0.5) * 0.4, false));
  g.position.set(x, 0.18, z); return g; }

function pontoOnibus(T) { const THREE = T.THREE, g = new THREE.Group(), met = std(T, '#3a3e48', { m: 0.6, r: 0.4 });
  for (const x of [-1.6, 1.6]) g.add(mk(T, new THREE.BoxGeometry(0.1, 2.6, 0.1), met, x, 1.3, -0.6));
  g.add(mk(T, new THREE.BoxGeometry(3.6, 0.1, 1.6), std(T, '#2a8ad8', { r: 0.4 }), 0, 2.65, 0));
  g.add(mk(T, new THREE.BoxGeometry(3.2, 0.06, 0.45), std(T, '#c8ccd8', { m: 0.5, r: 0.3 }), 0, 0.5, -0.4));
  const ad = T.canvasTex(256, 384, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff6ad8'); gr.addColorStop(1, '#3a6aff'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 64px ${FONTE}`; c.fillText('VERÃO', w / 2, 120); c.font = `700 120px ${FONTE}`; c.fillText('40°', w / 2, 260); c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(w / 2, 330, 26, 0, 7); c.fill(); });
  g.add(mk(T, new THREE.BoxGeometry(1.1, 1.7, 0.08), [std(T, '#222'), std(T, '#222'), std(T, '#222'), std(T, '#222'), new THREE.MeshBasicMaterial({ map: ad, color: C(T, '#ffffff').multiplyScalar(1.4) }), new THREE.MeshBasicMaterial({ map: ad, color: C(T, '#ffffff').multiplyScalar(1.4) })], -1.0, 1.35, -0.6, false));
  return g; }

// prédio: frente voltada para +z local, frente em z=0, base em y=0
function predio(T, o, r) { const THREE = T.THREE, g = new THREE.Group();
  const w = o.w, andares = o.andares, h = 3.4 + andares * 3 + 0.6, d = 8;
  const [mp, me] = fachada(T, o.cor, w, h, o.seed, o.letreiro || r() < 0.5 ? 'loja' : 'porta');
  const front = new THREE.MeshStandardMaterial({ map: mp, emissiveMap: me, emissive: C(T, '#ffffff'), emissiveIntensity: 1.6, roughness: 0.85 });
  const side = std(T, o.cor, { r: 0.9 }), roof = std(T, '#3a3640', { r: 0.95 });
  g.add(mk(T, new THREE.BoxGeometry(w, h, d), [side, side, roof, roof, front, side], 0, h / 2, -d / 2));
  // marquise de concreto sobre o térreo
  g.add(mk(T, new THREE.BoxGeometry(w, 0.18, 1.0), std(T, '#d8d0c8', { r: 0.8 }), 0, 3.45, 0.5));
  // toldo listrado
  if (r() < 0.45) { const c1 = ['#ff5a8a', '#2ab0c8', '#ffd23a', '#4ac07a'][Math.floor(r() * 4)]; const lst = tx(T, 'toldo' + c1, 128, 64, (c, W, H) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? c1 : '#f4f0e8'; c.fillRect(i * 16, 0, 16, H); } });
    const tol = mk(T, new THREE.BoxGeometry(w * 0.8, 0.06, 1.3), new THREE.MeshStandardMaterial({ map: lst, roughness: 0.8 }), 0, 3.0, 0.62); tol.rotation.x = 0.35; g.add(tol); }
  // varandas e ar-condicionado
  for (let a = 1; a <= andares; a++) { const y = 3.4 + (a - 1) * 3 + 0.4; if (r() < 0.35) { g.add(mk(T, new THREE.BoxGeometry(w * 0.5, 0.12, 0.8), std(T, '#d8d0c8'), (r() - 0.5) * w * 0.3, y, 0.4)); g.add(mk(T, new THREE.BoxGeometry(w * 0.5, 0.8, 0.04), std(T, '#2a2a30', { m: 0.5, r: 0.5 }), 0, y + 0.45, 0.78)); }
    if (r() < 0.45) g.add(mk(T, geo('ac', () => new THREE.BoxGeometry(0.7, 0.45, 0.45)), std(T, '#e8e8ee', { r: 0.6 }), (r() - 0.5) * (w - 1.2), y + 1.6, 0.22)); }
  // caixa d'água azul e antena no telhado
  if (r() < 0.75) { const cx = (r() - 0.5) * (w - 2), cz = -2 - r() * 4; g.add(mk(T, geo('cx', () => new THREE.CylinderGeometry(0.75, 0.65, 1.1, 18)), std(T, '#2a7ad8', { r: 0.45 }), cx, h + 0.55, cz)); g.add(mk(T, geo('cxt', () => new THREE.CylinderGeometry(0.78, 0.78, 0.12, 18)), std(T, '#1a5ab0', { r: 0.45 }), cx, h + 1.15, cz)); }
  if (r() < 0.4) { const an = mk(T, new THREE.CircleGeometry(0.5, 16), std(T, '#c8ccd8', { m: 0.6, r: 0.3, x: { side: THREE.DoubleSide } }), (r() - 0.5) * w * 0.6, h + 0.8, -1.5); an.rotation.x = -0.5; g.add(an); }
  // letreiro neon na fachada + letreiro "bandeira" (perpendicular, visível olhando a avenida)
  const neons = [];
  if (o.letreiro) { const L = o.letreiro, lw = Math.min(w - 0.8, 4.8), lh = lw / 4; const mat = new THREE.MeshBasicMaterial({ map: letreiroTex(T, L.t, L.c), color: C(T, '#ffffff').multiplyScalar(L.k ?? 2.0) });
    const lt = mk(T, new THREE.BoxGeometry(lw, lh, 0.18), [std(T, '#111'), std(T, '#111'), std(T, '#111'), std(T, '#111'), mat, std(T, '#111')], 0, 3.55 + lh / 2 + 0.12, 0.75, false); g.add(lt); neons.push({ c: L.c, lx: 0, ly: 3.7 + lh / 2, lz: 0.9, k: 1 }); }
  if (o.bandeira) { const L = o.bandeira, mat = new THREE.MeshBasicMaterial({ map: letreiroTex(T, L.t, L.c, true), color: C(T, '#ffffff').multiplyScalar(L.k ?? 2.0) }); const bx = (o.bandLado ?? 1) * (w / 2 - 0.7);
    const b = mk(T, new THREE.BoxGeometry(0.16, 2.6, 0.65), [mat, mat, std(T, '#111'), std(T, '#111'), std(T, '#111'), std(T, '#111')], bx, 6.2, 1.1, false); g.add(b); g.add(mk(T, new THREE.BoxGeometry(0.05, 0.05, 1.1), std(T, '#222'), bx, 7.4, 0.55)); neons.push({ c: L.c, lx: bx, ly: 6.2, lz: 1.1, k: 0.8 }); }
  g.userData.neons = neons; g.userData.h = h; return g; }

// ---------- semáforo (cabeça dupla: luzes para -X e +X) ----------
function semaforo3D(T) { const THREE = T.THREE, g = new THREE.Group(), met = std(T, '#2a2d34', { m: 0.6, r: 0.45 });
  g.add(mk(T, new THREE.CylinderGeometry(0.1, 0.12, 6.0, 10), met, 0, 3.0, 0)); const braco = mk(T, new THREE.CylinderGeometry(0.07, 0.07, 4.2, 8), met, 0, 5.8, -2.1); braco.rotation.x = Math.PI / 2; g.add(braco);
  const cores = { vermelho: '#ff2a1a', amarelo: '#ffb01a', verde: '#2aff7a' }, lamps = [];
  const cabeca = (z, y) => { const c = new THREE.Group(); c.add(mk(T, new THREE.BoxGeometry(0.42, 1.25, 0.42), std(T, '#1a1c22', { r: 0.6 }), 0, 0, 0)); c.add(mk(T, new THREE.BoxGeometry(0.46, 1.4, 0.06), std(T, '#ffd21a', { r: 0.6 }), 0, 0, -0.24));
    ['vermelho', 'amarelo', 'verde'].forEach((k, i) => { for (const sx of [-1, 1]) { const off = std(T, '#2a2420', { r: 0.3 }), on = hdr(T, cores[k], 4); const l = mk(T, geo('lamp', () => new THREE.CircleGeometry(0.13, 18)), off, sx * 0.215, 0.38 - i * 0.38, 0, false); l.rotation.y = sx * Math.PI / 2; c.add(l);
        const visor = mk(T, geo('visor', () => new THREE.CylinderGeometry(0.15, 0.15, 0.18, 14, 1, true, 0, Math.PI)), met, sx * 0.3, 0.38 - i * 0.38 + 0.02, 0, false); visor.rotation.z = Math.PI / 2; visor.rotation.y = sx > 0 ? 0 : Math.PI; c.add(visor);
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(T), color: C(T, cores[k]), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.setScalar(1.1); s.position.set(sx * 0.32, 0.38 - i * 0.38, 0); c.add(s);
        lamps.push({ k, l, s, off, on }); } });
    c.position.set(0, y, z); g.add(c); };
  cabeca(-3.6, 5.1); cabeca(0.25, 3.6);
  // botoeira de pedestre com boneco vermelho/verde
  const ped = new THREE.Group(); ped.add(mk(T, new THREE.BoxGeometry(0.34, 0.6, 0.3), std(T, '#1a1c22'), 0, 0, 0)); const pv = mk(T, new THREE.PlaneGeometry(0.24, 0.24), hdr(T, '#ff3a2a', 3), 0, 0.1, 0.16, false); ped.add(pv); ped.position.set(0, 2.6, 0.22); g.add(ped);
  let estado = 'verde'; const api = { set(e) { estado = e; }, get estado() { return estado; },
    update(t) { for (const L of lamps) { let ligado = L.k === estado; if (estado === 'pisca') ligado = L.k === 'amarelo' && Math.sin(t * Math.PI * 2 * 0.9) > 0; if (estado === 'off') ligado = false; L.l.material = ligado ? L.on : L.off; L.s.visible = ligado; } pv.material.color.copy(C(T, estado === 'vermelho' ? '#2aff7a' : '#ff3a2a')).multiplyScalar(estado === 'off' ? 0.2 : 3); } };
  api.update(0); g.api = api; return g; }

// ---------- poste de concreto com luminária sobre a pista ----------
function poste(T, lado, cor, transf) { const THREE = T.THREE, g = new THREE.Group(), conc = std(T, '#9a98a0', { r: 0.9 });
  g.add(mk(T, geo('pst', () => new THREE.CylinderGeometry(0.11, 0.2, 9.4, 8)), conc, 0, 4.7, 0));
  const cruz = mk(T, geo('cruz', () => new THREE.BoxGeometry(0.1, 0.12, 1.8)), std(T, '#6a5a4a'), 0, 8.6, 0); g.add(cruz);
  for (const z of [-0.75, 0, 0.75]) g.add(mk(T, geo('iso', () => new THREE.CylinderGeometry(0.04, 0.05, 0.14, 6)), std(T, '#e8e0d0', { r: 0.3 }), 0, 8.73, z, false));
  if (transf) { g.add(mk(T, geo('trf', () => new THREE.CylinderGeometry(0.32, 0.32, 0.9, 12)), std(T, '#8a9098', { m: 0.4, r: 0.5 }), 0.0, 7.2, 0.35)); }
  // braço até a pista (lado: +1 => poste em z>0, braço para -z)
  const braco = mk(T, geo('brc', () => new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6)), std(T, '#5a5e68', { m: 0.6, r: 0.4 }), 0, 7.6, -lado * 1.1); braco.rotation.x = Math.PI / 2 + lado * 0.12; g.add(braco);
  const cab = mk(T, geo('lum', () => new RoundedBoxGeometry(0.45, 0.16, 0.8, 2, 0.06)), std(T, '#4a4e58', { m: 0.5, r: 0.4 }), 0, 7.72, -lado * 2.35); g.add(cab);
  const lente = mk(T, geo('lent', () => new THREE.PlaneGeometry(0.36, 0.66)), hdr(T, cor, 6), 0, 7.63, -lado * 2.35, false); lente.rotation.x = Math.PI / 2; g.add(lente);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(T), color: C(T, cor), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 })); sp.scale.setScalar(3.2); sp.position.set(0, 7.5, -lado * 2.35); g.add(sp);
  const cone = new THREE.Mesh(geo('cone', () => new THREE.ConeGeometry(2.6, 7.4, 28, 1, true)), add(T, cor, 0.07, fadeTex(T))); cone.position.set(0, 7.6 - 3.7, -lado * 2.35); g.add(cone);
  // poça de luz no chão
  const pool = new THREE.Mesh(geo('pool', () => new THREE.CircleGeometry(3.2, 28).rotateX(-Math.PI / 2)), add(T, cor, 0.16, glowTex(T))); pool.position.set(0, 0.02, -lado * 2.35); g.add(pool);
  g.userData.luz = new THREE.Vector3(0, 7.5, -lado * 2.35); return g; }

// fiação (catenárias) entre postes de um lado, numa só LineSegments
function fiacao(T, xs, z) { const THREE = T.THREE, pts = [];
  for (let i = 0; i + 1 < xs.length; i++) for (const [dz, y, sag] of [[-0.75, 8.73, 0.55], [0, 8.73, 0.6], [0.75, 8.73, 0.5], [0.15, 6.9, 0.35], [0.2, 6.6, 0.4]]) { const a = xs[i], b = xs[i + 1]; for (let k = 0; k < 10; k++) { const u0 = k / 10, u1 = (k + 1) / 10; const f = (u) => y - sag * 4 * u * (1 - u); pts.push(lerp(a, b, u0), f(u0), z + dz, lerp(a, b, u1), f(u1), z + dz); } }
  const gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return new THREE.LineSegments(gm, new THREE.LineBasicMaterial({ color: C(T, '#101016') })); }

// faixas pintadas, todas mescladas num mesh por cor
function pintura(T, rects, cor) { const THREE = T.THREE; const gs = rects.map(([x, z, lx, lz]) => new THREE.PlaneGeometry(lx, lz).rotateX(-Math.PI / 2).translate(x, 0, z));
  const me = new THREE.Mesh(mergeGeometries(gs), new THREE.MeshStandardMaterial({ color: C(T, cor), roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); me.position.y = 0.006; me.receiveShadow = true; return me; }

// ====================================================================================================
export function avenida3D(T, o = {}) { const THREE = T.THREE, g = new THREE.Group(), r = rng(o.seed ?? 7);
  const x0 = o.x0 ?? -60, x1 = o.x1 ?? 150, L = x1 - x0, xc = (x0 + x1) / 2, focoX = o.focoX ?? 0;
  // asfalto molhado (rugosidade baixa + poças quase espelho)
  const ruaM = new THREE.MeshStandardMaterial({ color: C(T, '#ffffff'), map: asfalto(T), roughnessMap: poca(T), roughness: 0.9, metalness: 0.25, envMapIntensity: 1.6 });
  const rua = mk(T, new THREE.PlaneGeometry(L, 10), ruaM, xc, 0, 0, false); rua.rotation.x = -Math.PI / 2; g.add(rua);
  // calçadas + meio-fio
  const calM = new THREE.MeshStandardMaterial({ color: C(T, '#ffffff'), map: calcadaTex(T), roughness: 0.45, metalness: 0.1, envMapIntensity: 1.0 }), mfM = std(T, '#b8b6c0', { r: 0.6 });
  for (const s of [-1, 1]) { g.add(mk(T, new THREE.BoxGeometry(L, 0.18, 4.8), calM, xc, 0.09, s * 7.6, false)); g.add(mk(T, new THREE.BoxGeometry(L, 0.2, 0.22), mfM, xc, 0.1, s * 5.1, false)); }
  // pintura: faixa dupla amarela, tracejado branco, bordas, faixa de pedestre (x 8..11) e linhas de retenção
  const XP0 = 8, XP1 = 11, branco = [], amarelo = [];
  const corta = (a, b, f) => { if (b <= XP0 - 0.6 || a >= XP1 + 0.6) f(a, b); else { if (a < XP0 - 0.6) f(a, XP0 - 0.6); if (b > XP1 + 0.6) f(XP1 + 0.6, b); } };
  for (const z of [-0.13, 0.13]) corta(x0, x1, (a, b) => amarelo.push([(a + b) / 2, z, b - a, 0.11]));
  for (const z of [-4.75, 4.75]) corta(x0, x1, (a, b) => branco.push([(a + b) / 2, z, b - a, 0.12]));
  for (let x = x0; x < x1; x += 7) for (const z of [-2.5, 2.5]) corta(x, x + 3, (a, b) => branco.push([(a + b) / 2, z, b - a, 0.12]));
  for (let z = -4.4; z <= 4.45; z += 0.95) branco.push([(XP0 + XP1) / 2, z, XP1 - XP0, 0.5]);
  branco.push([XP1 + 0.9, -2.5, 0.35, 5.0], [XP0 - 0.9, 2.5, 0.35, 5.0]);
  g.add(pintura(T, branco, '#e8e8ee'), pintura(T, amarelo, '#ffc81a'));
  // prédios dos dois lados (frente para a pista). Letreiros-chave perto da ação.
  const PAL = ['#e85a8a', '#2ab0c8', '#f2c43a', '#8a5ad8', '#4ac07a', '#f07a3a', '#e8dcc8', '#5a8ad8', '#ff8a7a', '#3ac8a8', '#c86ad8', '#f0a8c0'];
  const chave = { '-1': [[-6, { t: 'AÇAÍ', c: '#c86aff' }, { t: 'AÇAÍ', c: '#ff4ac8' }], [2, { t: 'FARMÁCIA', c: '#3aff8a' }, { t: '24H', c: '#3ae8ff' }], [12, { t: 'PADARIA', c: '#ffb04a' }, null], [22, { t: 'CELULAR', c: '#3a9dff' }, { t: 'HOTEL', c: '#3ae8ff' }]],
    '1': [[-8, { t: 'BAR', c: '#ff4ac8' }, { t: 'BAR', c: '#ff4ac8' }], [1, { t: 'LANCHES', c: '#ffd23a' }, { t: 'PASTEL', c: '#ffe23a' }], [10, { t: 'SALÃO', c: '#ff6ad8' }, null], [20, { t: 'ESPETINHO', c: '#ff8a3a' }, { t: 'AÇAÍ', c: '#c86aff' }]] };
  const extras = [{ t: 'BORRACHARIA', c: '#ffd23a' }, { t: 'HOTEL', c: '#3ae8ff' }, { t: 'LANCHES', c: '#ffd23a' }, { t: 'BAR', c: '#ff4ac8' }, { t: 'DROGARIA', c: '#3aff8a' }, { t: 'PIZZA', c: '#ff8a3a' }, { t: 'SORVETE', c: '#3ae8ff' }, { t: 'MOTEL', c: '#ff4ac8' }];
  const neons = [], predios = [];
  for (const s of [-1, 1]) { let x = x0 + r() * 4; const ch = chave[String(s)]; let ci = 0;
    while (x < x1) { let w = 6 + Math.floor(r() * 6), letreiro = null, bandeira = null;
      if (ci < ch.length && x + w > ch[ci][0]) { const [cx, lt, bd] = ch[ci]; x = Math.max(x, cx - w / 2); letreiro = lt; bandeira = bd; ci++; }
      else if (r() < 0.55) { letreiro = extras[Math.floor(r() * extras.length)]; if (r() < 0.5) bandeira = extras[Math.floor(r() * extras.length)]; }
      const p = predio(T, { w, andares: 1 + Math.floor(r() * 5), cor: PAL[Math.floor(r() * PAL.length)], seed: Math.floor(r() * 9999), letreiro, bandeira, bandLado: r() < 0.5 ? -1 : 1 }, r);
      p.position.set(x + w / 2, 0.18, s * 10); p.rotation.y = s > 0 ? Math.PI : 0; g.add(p); predios.push(p);
      for (const n of p.userData.neons) { const v = new THREE.Vector3(n.lx, n.ly, n.lz).applyEuler(p.rotation).add(p.position); neons.push({ ...n, p: v }); }
      x += w + (r() < 0.12 ? 1.2 : 0); } }
  // prédios altos ao fundo (silhuetas com janelas)
  for (let i = 0; i < 22; i++) { const s = i % 2 ? 1 : -1, w = 10 + r() * 12, h = 22 + r() * 46, x = x0 + 20 + r() * (L + 40), z = s * (24 + r() * 30);
    const [mp, me] = fachada(T, ['#2a2848', '#33304a', '#28304a', '#3a2a48'][i % 4], w, h, 900 + i, 'porta'); const mt = new THREE.MeshStandardMaterial({ map: mp, emissiveMap: me, emissive: C(T, '#ffffff'), emissiveIntensity: 1.1, roughness: 0.9 });
    const b = mk(T, new THREE.BoxGeometry(w, h, 12), mt, x, h / 2, z, false); g.add(b);
    if (r() < 0.4) { const lz = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(T), color: C(T, '#ff4a3a'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); lz.scale.setScalar(2.2); lz.position.set(x, h + 0.6, z); g.add(lz); } }
  // postes com luminária, fiação, transformadores
  const luzes = [], postesX = { '-1': [], '1': [] }, CORL = ['#ffb45a', '#ffb45a', '#d8ecff'];
  for (const s of [-1, 1]) { for (let x = x0 + (s > 0 ? 3 : 12); x < x1; x += 18) { const cor = CORL[Math.floor(r() * 3)]; const p = poste(T, s, cor, r() < 0.3); p.position.set(x, 0.18, s * 5.55); g.add(p); postesX[String(s)].push(x); luzes.push({ x, z: s * 5.55 - s * 2.35, y: 7.68, cor }); }
    g.add(fiacao(T, postesX[String(s)], s * 5.55)); }
  // PointLights reais só nos postes mais próximos da ação
  const nL = o.luzes ?? 4; luzes.slice().sort((a, b) => Math.abs(a.x - focoX) - Math.abs(b.x - focoX)).slice(0, nL).forEach((l) => { const pl = new THREE.PointLight(C(T, l.cor), 90, 26, 1.7); pl.position.set(l.x, l.y - 0.3, l.z); g.add(pl); });
  // duas luzes de neon coloridas perto da ação (calçadas tingidas)
  if (o.neonLuz !== false) { for (const n of neons.filter((n) => Math.abs(n.p.x - focoX) < 9).slice(0, 2)) { const pl = new THREE.PointLight(C(T, n.c), 25, 12, 1.6); pl.position.set(n.p.x, n.p.y - 0.6, n.p.z * 0.85); g.add(pl); } }
  // rastros de reflexo no asfalto molhado (giram para a câmera)
  const rastros = new THREE.Group(); g.add(rastros);
  const fontes = neons.map((n) => ({ ...n, w: 1.4, len: 9, op: 0.45 })).concat(luzes.map((l) => ({ c: l.cor, p: new THREE.Vector3(l.x, l.y, l.z), w: 1.0, len: 11, op: 0.4 })));
  for (const f of fontes) { const gm = geo('rastro', () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0)); const me = new THREE.Mesh(gm, add(T, f.c, f.op, rastroTex(T)));
    me.material.map = rastroTex(T); me.userData = f; me.position.set(f.p.x, 0.015, clamp(f.p.z, -4.9, 4.9)); me.scale.set(f.len, 1, f.w); me.renderOrder = 2; rastros.add(me); }
  const tmp = new THREE.Vector3();
  g.reflexos = { update(cam) { cam.getWorldPosition(tmp); for (const me of rastros.children) { const dx = tmp.x - me.position.x, dz = tmp.z - me.position.z, d = Math.hypot(dx, dz); me.rotation.y = Math.atan2(-dz, dx); me.scale.x = Math.min(me.userData.len, d * 0.9); me.material.opacity = me.userData.op * clamp(d / 6); } } };
  // semáforo (pista +X para; cabeça olha para -X/câmera) perto da faixa de pedestre
  const sem = semaforo3D(T); sem.position.set(XP0 - 1.2, 0.18, 5.45); g.add(sem); g.semaforo = sem.api;
  // carros estacionados (deixa livre a área da ação: x -10..16 na pista)
  const CC = ['#ff5a8a', '#2ab0c8', '#ffd23a', '#e8e8ee', '#4ac07a', '#8a5ad8', '#3a3e48', '#f07a3a', '#5a8ad8'];
  for (const [x, s] of [[-34, 1], [-26, 1], [-18, 1], [22, 1], [29, 1], [44, 1], [58, 1], [72, 1], [-30, -1], [-21, -1], [-14, -1], [24, -1], [33, -1], [48, -1]]) { const c = carro3D(T, CC[Math.floor(r() * CC.length)]); c.position.set(x, 0, s * 3.85); c.rotation.y = s > 0 ? 0 : Math.PI; g.add(c); }
  // trânsito ao longe: lanternas indo (+X, z=+1.25) e faróis vindo (-X, z=-3.7) — só longe da ação
  const tr = []; for (let i = 0; i < 7; i++) { const vai = i % 2 === 0, c = carro3D(T, CC[i % CC.length], { ligado: true }); c.rotation.y = vai ? 0 : Math.PI; g.add(c); tr.push({ c, vai, f: r(), v: 9 + r() * 6 }); }
  g.transito = { update(t) { for (const q of tr) { const span = 110, u = ((q.f * span + t * q.v) % span + span) % span; q.c.position.set(q.vai ? 45 + u : 155 - u, 0, q.vai ? 1.25 : -3.7); } } }; g.transito.update(0);
  // adereços na calçada
  const orel = orelhao(T); orel.position.set(4.6, 0.18, -7.4); orel.rotation.y = 0; g.add(orel);
  const orel2 = orelhao(T); orel2.position.set(-12, 0.18, 7.2); orel2.rotation.y = Math.PI; g.add(orel2);
  const po = pontoOnibus(T); po.position.set(15, 0.18, 7.4); po.rotation.y = Math.PI; g.add(po);
  g.add(mesaBar(T, -6.5, 7.6, 1), mesaBar(T, -9.2, 7.9, 2), mesaBar(T, -3.6, -7.8, 3));
  for (const [x, z, s] of [[-15, 8.4, 1], [7, 8.6, 0.9], [26, 8.4, 1.1], [40, 8.5, 1], [-20, -8.5, 1], [9, -8.6, 0.95], [30, -8.5, 1.1], [52, -8.6, 1]]) g.add(arvore3D(T, x, z, s, Math.abs(Math.round(x))));
  const lix = new THREE.Group(); lix.add(mk(T, new THREE.CylinderGeometry(0.22, 0.2, 0.55, 12), std(T, '#ff7a1a', { r: 0.5 }), 0, 0.85, 0)); lix.add(mk(T, new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), std(T, '#555'), 0, 0.45, -0.25)); lix.position.set(-1.8, 0.18, -5.7); g.add(lix);
  const hid = new THREE.Group(); hid.add(mk(T, new THREE.CylinderGeometry(0.12, 0.14, 0.6, 12), std(T, '#ffd21a', { r: 0.4 }), 0, 0.3, 0)); hid.add(mk(T, new THREE.SphereGeometry(0.13, 12, 8, 0, 7, 0, 1.6), std(T, '#ffd21a', { r: 0.4 }), 0, 0.6, 0)); hid.position.set(-4, 0.18, 5.6); g.add(hid);
  g.neons = neons; g.luzes = luzes; g.predios = predios; g.faixaPedestre = [XP0, XP1];
  g.update = (t, cam) => { g.semaforo.update(t); g.transito.update(t); if (cam) g.reflexos.update(cam); };
  return g; }

// ====================================================================================================
// caminhão cara-chata brasileiro, frente para -X. Origem: chão, centro do veículo.
export function caminhao3D(T, o = {}) { const THREE = T.THREE, g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const cor = o.cor ?? '#1f6ad8', tinta = new THREE.MeshPhysicalMaterial({ color: C(T, cor), roughness: 0.3, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 });
  const cromo = new THREE.MeshStandardMaterial({ color: C(T, '#eef2f8'), roughness: 0.12, metalness: 1.0, envMapIntensity: 1.6 }), preto = std(T, '#16161a', { r: 0.7 }), vidro = new THREE.MeshStandardMaterial({ color: C(T, '#0c1826'), roughness: 0.04, metalness: 0.85, envMapIntensity: 1.8 });
  const F = -4.0; // x da frente da cabine
  body.add(mk(T, new THREE.BoxGeometry(7.6, 0.32, 1.1), preto, 0.1, 0.78, 0)); // longarina
  body.add(mk(T, new RoundedBoxGeometry(2.35, 2.4, 2.5, 4, 0.22), tinta, F + 1.18, 2.25, 0)); // cabine
  body.add(mk(T, new RoundedBoxGeometry(2.2, 0.55, 2.42, 3, 0.2), tinta, F + 1.25, 3.68, 0)); // teto alto
  const para = mk(T, new THREE.BoxGeometry(0.06, 1.05, 2.15), vidro, F - 0.02, 2.82, 0, false); para.rotation.z = -0.06; body.add(para); // para-brisa
  body.add(mk(T, new THREE.BoxGeometry(0.3, 0.14, 2.3), std(T, '#123a8a', { r: 0.4 }), F - 0.05, 3.42, 0)); // quebra-sol
  for (const s of [-1, 1]) body.add(mk(T, new THREE.BoxGeometry(1.0, 0.75, 0.04), vidro, F + 0.8, 2.85, s * 1.26, false)); // janelas laterais
  for (const s of [-1, 1]) body.add(mk(T, new THREE.BoxGeometry(0.04, 1.3, 0.02), std(T, '#0e3a8a'), F + 1.45, 2.0, s * 1.26, false)); // linha da porta
  // grade cromada + friso
  body.add(mk(T, new THREE.BoxGeometry(0.1, 0.8, 1.55), cromo, F - 0.04, 1.62, 0)); for (let i = 0; i < 5; i++) body.add(mk(T, new THREE.BoxGeometry(0.06, 0.05, 1.45), preto, F - 0.1, 1.33 + i * 0.15, 0, false));
  body.add(mk(T, new THREE.BoxGeometry(0.06, 0.08, 2.3), cromo, F - 0.05, 2.18, 0));
  // para-choque
  body.add(mk(T, new RoundedBoxGeometry(0.32, 0.42, 2.55, 2, 0.08), std(T, '#2a2c32', { m: 0.4, r: 0.4 }), F - 0.12, 0.92, 0)); body.add(mk(T, new THREE.BoxGeometry(0.06, 0.1, 2.4), cromo, F - 0.29, 1.0, 0));
  // placa Mercosul
  const placa = T.canvasTex(256, 84, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a3ab8'; c.fillRect(0, 0, w, 20); c.fillStyle = '#fff'; c.font = `700 14px ${FONTE}`; c.textAlign = 'center'; c.fillText('BRASIL', w / 2, 15); c.fillStyle = '#111'; c.font = `700 50px ${FONTE}`; c.fillText('SMK4R07', w / 2, 70); c.strokeStyle = '#111'; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); });
  const pl = mk(T, new THREE.PlaneGeometry(0.62, 0.2), new THREE.MeshStandardMaterial({ map: placa, roughness: 0.5 }), F - 0.3, 0.88, 0, false); pl.rotation.y = -Math.PI / 2; body.add(pl);
  // faróis (retângulos emissivos) + piscas + faróis de milha
  const farM = new THREE.MeshBasicMaterial({ color: C(T, '#fff6e0') }), luzes = [];
  for (const s of [-1, 1]) { const f = mk(T, new THREE.BoxGeometry(0.08, 0.3, 0.5), farM, F - 0.06, 1.42, s * 0.95, false); body.add(f); body.add(mk(T, new THREE.BoxGeometry(0.1, 0.38, 0.6), cromo, F - 0.02, 1.42, s * 0.95)); body.add(mk(T, new THREE.BoxGeometry(0.08, 0.16, 0.18), hdr(T, '#ffa01a', 2.5), F - 0.06, 1.42, s * 1.18, false)); body.add(mk(T, new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12).rotateZ(Math.PI / 2), farM, F - 0.3, 0.92, s * 0.85, false)); luzes.push(new THREE.Vector3(F - 0.1, 1.42, s * 0.95)); }
  // luzes âmbar no teto (comuns nos caminhões brasileiros)
  for (let i = 0; i < 5; i++) body.add(mk(T, new THREE.BoxGeometry(0.1, 0.1, 0.16), hdr(T, '#ffa01a', 3), F + 0.2, 3.98, -0.8 + i * 0.4, false));
  // retrovisores
  for (const s of [-1, 1]) { body.add(mk(T, new THREE.BoxGeometry(0.05, 0.05, 0.5), preto, F + 0.15, 2.9, s * 1.45)); body.add(mk(T, new RoundedBoxGeometry(0.12, 0.62, 0.3, 2, 0.04), preto, F + 0.1, 2.75, s * 1.72)); }
  // degrau + tanque de combustível cromado
  for (const s of [-1, 1]) body.add(mk(T, new THREE.BoxGeometry(0.7, 0.08, 0.3), cromo, F + 1.2, 1.15, s * 1.15));
  body.add(mk(T, new THREE.CylinderGeometry(0.32, 0.32, 1.3, 18).rotateZ(Math.PI / 2), cromo, -0.4, 0.95, -0.95));
  // baú com faixas coloridas
  const bau = T.canvasTex(1024, 512, (c, w, h) => { c.fillStyle = '#eef0f4'; c.fillRect(0, 0, w, h); const cs = ['#ffd21a', '#ff8a1a', '#1f6ad8']; cs.forEach((cc, i) => { c.fillStyle = cc; c.beginPath(); c.moveTo(0, h * 0.62 + i * 34); c.lineTo(w, h * 0.42 + i * 34); c.lineTo(w, h * 0.42 + i * 34 + 24); c.lineTo(0, h * 0.62 + i * 34 + 24); c.fill(); });
    c.fillStyle = '#1f3a8a'; c.font = `700 92px ${FONTE}`; c.textAlign = 'center'; c.fillText(o.texto ?? 'EXPRESSO', w / 2, 170); c.font = `700 40px ${FONTE}`; c.fillText('TRANSPORTES & CARGAS', w / 2, 230);
    for (let x = 0; x < w; x += 64) { c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(x, 0, 3, h); } });
  const bauM = new THREE.MeshStandardMaterial({ map: bau, roughness: 0.45, metalness: 0.1 }), bauS = std(T, '#e4e6ec', { r: 0.5 });
  body.add(mk(T, new RoundedBoxGeometry(5.55, 3.05, 2.6, 3, 0.08), [bauS, bauS, bauS, bauS, bauM, bauM], 1.15, 2.62, 0));
  body.add(mk(T, new THREE.BoxGeometry(5.6, 0.18, 2.62), std(T, '#3a3c44', { m: 0.4, r: 0.5 }), 1.15, 1.06, 0));
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) body.add(mk(T, new THREE.BoxGeometry(0.12, 0.08, 0.04), hdr(T, '#ffa01a', 2.5), -1.2 + i * 0.95, 1.1, s * 1.32, false)); // vigias laterais
  for (const s of [-1, 1]) body.add(mk(T, new THREE.BoxGeometry(0.06, 0.2, 0.45), hdr(T, '#ff2a1a', 2), 3.96, 1.2, s * 0.95, false));
  // rodas (dianteira simples, traseira dupla)
  const pneu = std(T, '#121216', { r: 0.95 }), cubo = std(T, '#b8bcc8', { m: 0.8, r: 0.3 }), rodas = [];
  for (const [x, dupla] of [[-2.85, false], [1.9, true], [3.1, true]]) for (const s of [-1, 1]) { const rg = new THREE.Group(); rg.add(mk(T, geo('pneuT', () => new THREE.CylinderGeometry(0.54, 0.54, dupla ? 0.62 : 0.36, 20).rotateX(Math.PI / 2)), pneu)); rg.add(mk(T, geo('cuboT', () => new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12).rotateX(Math.PI / 2)), cubo, 0, 0, s * (dupla ? 0.32 : 0.19))); for (let k = 0; k < 6; k++) { const pa = mk(T, new THREE.BoxGeometry(0.08, 0.08, 0.06), preto, Math.cos(k) * 0.2, Math.sin(k) * 0.2, s * (dupla ? 0.34 : 0.21), false); rg.add(pa); } rg.position.set(x, 0.54, s * (dupla ? 0.92 : 1.05)); body.add(rg); rodas.push(rg); }
  for (const x of [-2.85, 1.9]) for (const s of [-1, 1]) body.add(mk(T, new THREE.BoxGeometry(0.04, 0.5, 0.5), preto, x + 0.7, 0.55, s * 1.05)); // para-barro
  // luz: 2 SpotLights (sem sombra) + cones volumétricos + brilho
  const spots = [], cones = [], glows = [];
  for (const v of luzes) { const sp = new THREE.SpotLight(C(T, '#fff2d8'), 0, 70, 0.42, 0.55, 1.2); sp.castShadow = false; sp.position.copy(v); sp.target.position.set(v.x - 30, 0, v.z * 1.4); body.add(sp, sp.target); spots.push(sp);
    const cn = new THREE.Mesh(geo('farolCone', () => new THREE.ConeGeometry(2.6, 16, 28, 1, true).translate(0, -8, 0).rotateZ(-Math.PI / 2 - 0.04)), add(T, '#fff0d0', 0.1, fadeTex(T))); cn.position.copy(v); body.add(cn); cones.push(cn);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(T), color: C(T, '#fff4e0'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); gl.position.copy(v).add(new THREE.Vector3(-0.2, 0, 0)); body.add(gl); glows.push(gl); }
  g.farois = (k) => { k = clamp(k, 0, 1.5); farM.color.setRGB(1, 0.96, 0.88).multiplyScalar(1 + 9 * k); spots.forEach((s) => (s.intensity = 900 * k)); cones.forEach((c) => (c.material.opacity = 0.11 * k)); glows.forEach((s) => { s.scale.setScalar(1.2 + 3.5 * k); s.material.opacity = Math.min(1, k); }); };
  g.farois(o.farois ?? 1);
  let ang = 0; g.rodar = (dx) => { ang += dx / 0.54; rodas.forEach((r) => (r.rotation.z = ang)); };
  g.faroisMundo = () => luzes.map((v) => body.localToWorld(v.clone()));
  g.frente = 4.1; g.body = body; return g; }

// ---------- gato provisório (troque por gato3D do dragao3d.js) — frente em +X local ----------
export function gatoPlaceholder(T) { const THREE = T.THREE, g = new THREE.Group(); g.name = 'gato';
  const lar = std(T, '#ff9a2a', { r: 0.6 }), cla = std(T, '#ffd8a0', { r: 0.6 });
  const corpo = mk(T, new THREE.SphereGeometry(0.17, 18, 14), lar, -0.02, 0.17, 0); corpo.scale.set(1.0, 1.15, 0.9); g.add(corpo);
  g.add(mk(T, new THREE.SphereGeometry(0.12, 18, 14), lar, 0.08, 0.4, 0)); g.add(mk(T, new THREE.SphereGeometry(0.07, 12, 10), cla, 0.12, 0.2, 0));
  for (const s of [-1, 1]) { const e = mk(T, new THREE.ConeGeometry(0.05, 0.1, 4), lar, 0.06, 0.53, s * 0.06); e.rotation.x = s * 0.25; g.add(e); g.add(mk(T, new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: '#111' }), 0.19, 0.43, s * 0.045, false)); }
  const rabo = mk(T, new THREE.TorusGeometry(0.14, 0.03, 8, 16, Math.PI * 1.1), lar, -0.16, 0.12, 0); rabo.rotation.y = Math.PI / 2; g.add(rabo);
  return g; }

// ---------- environment neon (reflexos coloridos no asfalto e cromados) ----------
export function ambienteNeon(T, st, k = 0.9) { const THREE = T.THREE, sc = new THREE.Scene();
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(60, 30, 60), new THREE.MeshBasicMaterial({ color: C(T, '#0e0a22'), side: THREE.BackSide })));
  const faixa = (c, x, y, z, w, h, ry, k2 = 3) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: C(T, c).multiplyScalar(k2), side: THREE.DoubleSide })); p.position.set(x, y, z); p.rotation.y = ry; sc.add(p); };
  [['#ff4ac8', -20], ['#3ae8ff', -8], ['#ffd23a', 4], ['#3aff8a', 16], ['#c86aff', 26]].forEach(([c, x], i) => { faixa(c, x, 2 + (i % 2) * 2, -25, 6, 2, 0); faixa(c, -x, 3 - (i % 2), 25, 6, 2, 0); });
  faixa('#ffb45a', 0, 8, -20, 30, 1, 0, 2); faixa('#ffb45a', 0, 8, 20, 30, 1, 0, 2); faixa('#3a2a6a', 28, 2, 0, 40, 6, Math.PI / 2, 1); faixa('#3a2a6a', -28, 2, 0, 40, 6, Math.PI / 2, 1);
  const pm = new THREE.PMREMGenerator(st.composer.renderer); st.scene.environment = pm.fromScene(sc, 0.02).texture; st.scene.environmentIntensity = k; pm.dispose(); }

// ====================================================================================================
// CENA COMPLETA: você morre salvando o gato. Câmera contínua (sem cortes) até o clarão branco.
const mixPose = (a, b, k) => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], k)), look: a.look.map((v, i) => lerp(v, b.look[i], k)), fov: lerp(a.fov, b.fov, k) });
function keysAt(t, keys) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i]; return mixPose(a, b, ease.inOut((t - t0) / (t1 - t0))); } return keys.at(-1)[1]; }

export function cenaMorte(T, o = {}) { const THREE = T.THREE;
  const tm = { tGato: 2.0, tCaminhao: 3.4, tCorre: 5.0, tPulo: 6.2, tImpacto: 6.9, tIleso: 7.6, fim: 10, ...o };
  const { tGato, tCaminhao, tCorre, tPulo, tImpacto, tIleso, fim } = tm;
  const st = palco(T, { sky: ['#07051a', '#1c0f44', '#4a1a6a', '#8a2a7a'], fog: [35, 165], fogColor: '#2a1450', keyColor: '#8aa8ff', keyIntensity: 0.55, keyPos: [-12, 30, 14], ambient: 0.9, ambientSky: '#7a6ad8', shadowSize: 22, fov: 50, foco: 8, abertura: 0.0004, maxblur: 0.006, bloom: 0.75, bloomLimiar: 0.72, barril: 0.06, sat: 1.25, quente: 0, env: 0.9, exposicao: 1.05, ao: o.ao ?? false });
  st.hemi.groundColor = C(T, '#2a1a3a');
  ambienteNeon(T, st, 0.9);
  // estrelas
  { const n = 300, r = rng(2), p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, e = 0.15 + r() * 1.2, R = 300; p[i * 3] = Math.cos(a) * Math.cos(e) * R; p[i * 3 + 1] = Math.sin(e) * R; p[i * 3 + 2] = Math.sin(a) * Math.cos(e) * R; } const gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.BufferAttribute(p, 3)); st.add(new THREE.Points(gm, new THREE.PointsMaterial({ color: '#ffffff', size: 1.2, sizeAttenuation: false, fog: false }))); }
  const av = avenida3D(T, { x0: -60, x1: 160, focoX: 1 }); st.add(av); av.semaforo.set('verde');
  const truck = caminhao3D(T); truck.position.set(150, 0, -1.25); st.add(truck);
  const gato = o.gato || gatoPlaceholder(T); st.add(gato); const gatoRot = o.gatoRotY ?? 0;
  const eu = boneco2D(T, { auto: 0.55 }); st.add(eu);
  const GATO0 = new THREE.Vector3(1.0, 0, -1.25), GATO1 = new THREE.Vector3(1.5, 0.18, -6.5), EU0 = new THREE.Vector3(1.1, 0.18, 6.6), ZPULO = 0.9;
  // caminhão: 22 m/s, câmera lenta (6 m/s) durante o mergulho; para-choque 1.6 m antes de você no clarão
  const vel = 22, velLenta = 6, xImp = 1.1 + 1.6;
  const frenteX = (t) => t >= tPulo ? xImp + velLenta * (tImpacto - t) : xImp + velLenta * (tImpacto - tPulo) + vel * (tPulo - t);
  let ultimoX = null;
  const euEm = (t) => { // posição, pose, rotação, expressão
    if (t < tCorre) { const viu = t > tGato, assusta = t > tCaminhao; return { p: EU0.clone(), pose: breathe(viu ? POSES.stand : POSES.phone, t, 1, 1), expr: assusta ? 'terrified' : viu ? 'suspicious' : 'blank', emote: assusta ? 'exclaim' : viu ? 'question' : null, look: [-1, 0] }; }
    if (t < tPulo) { const k = prog(t, tCorre, tPulo), z = lerp(EU0.z, ZPULO, k), y = z > 5.1 ? 0.18 : 0; return { p: new THREE.Vector3(lerp(EU0.x, 1.05, k), y, z), pose: walkPose((t - tCorre) * 8.5, { run: true }), expr: 'determined', look: [1, 0] }; }
    const k = prog(t, tPulo, tImpacto + 0.4), z = lerp(ZPULO, -2.2, ease.out(k)), y = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 0.55; return { p: new THREE.Vector3(1.05, y, z), pose: POSES.dive, rot: lerp(0.5, 1.45, ease.out(prog(t, tPulo, tPulo + 0.4))), expr: 'determined', look: [1, 0], mergulho: true };
  };
  const tEmp = lerp(tPulo, tImpacto, 0.45);
  const gatoEm = (t) => { if (t < tEmp) return { p: GATO0.clone(), ry: Math.PI, giro: 0 }; const k = prog(t, tEmp, tImpacto + 0.45); const p = GATO0.clone().lerp(GATO1, ease.out(k)); p.y = lerp(0, GATO1.y, k) + Math.sin(k * Math.PI) * 0.7; return { p, ry: lerp(Math.PI, -2.3, k), giro: k < 1 ? k * Math.PI * 2 : 0 }; };
  const cam = st.camera, look = new THREE.Vector3();
  const K = [[0, { pos: [-36, 17, 3.5], look: [22, 1.5, 0], fov: 56 }], [tGato - 0.4, { pos: [-15, 5.0, 4.5], look: [2, 0.9, 1.5], fov: 50 }], [tGato + 0.7, { pos: [-4.2, 0.75, -0.6], look: [1.0, 0.35, -1.25], fov: 40 }], [tCaminhao, { pos: [-3.8, 0.62, -0.9], look: [8, 0.75, -1.25], fov: 38 }], [tCorre, { pos: [-3.2, 0.58, -1.0], look: [9, 0.9, -1.2], fov: 36 }]];
  const segue = (t, p) => { const k = prog(t, tPulo, tImpacto); return { pos: [p.x - 7.2 + 1.8 * k, 1.35 - 0.25 * k, p.z * 0.55 - 0.55], look: [p.x + 4, 0.95, p.z * 0.72 - 0.35], fov: lerp(44, 38, k) }; };
  const KF = [[tImpacto + 0.12, { pos: [-1.9, 0.52, -2.4], look: [1.5, 0.45, -6.5], fov: 42 }], [fim, { pos: [-0.5, 0.42, -3.7], look: [1.5, 0.42, -6.5], fov: 34 }]];
  const update = (t) => {
    const fx = frenteX(t), depois = t > tImpacto + 0.1; truck.visible = !depois; truck.position.x = fx + truck.frente; if (ultimoX != null) truck.rodar(ultimoX - truck.position.x); ultimoX = truck.position.x;
    const perto = clamp(1 - (fx - 1) / 70); truck.farois(t < tCaminhao - 0.6 ? 0.25 : 0.6 + 0.9 * perto * perto);
    truck.body.position.y = Math.sin(t * 23) * 0.012; truck.body.rotation.x = Math.sin(t * 17) * 0.004;
    av.semaforo.set(t < tCaminhao ? 'verde' : t < tCorre ? 'amarelo' : 'vermelho');
    const e = euEm(t); eu.visible = !depois; eu.position.copy(e.p);
    if (e.mergulho) { const sTex = 1.7, esc = (768 * 0.86 / 230) / sTex; eu.scale.setScalar(esc); eu.position.y = e.p.y + 0.9 - 1.75 * esc * 0.5; eu.desenha({ facing: -1, outfit: PROTAGONISTA, pose: e.pose, rot: e.rot, expr: e.expr, look: e.look, t, s: sTex, x: 256 + 70, y: 384 + 100 * sTex, shadow: false, trail: { count: 3, dx: 26, dy: -6, a: 0.25 } }); }
    else { eu.scale.setScalar(1); eu.desenha({ facing: -1, outfit: PROTAGONISTA, pose: e.pose, expr: e.expr, look: e.look, t, emote: e.emote }); }
    const gg = gatoEm(t); gato.position.copy(gg.p); gato.rotation.set(0, gg.ry + gatoRot, 0); if (gg.giro) gato.rotation.x = gg.giro; gato.update?.(t, { voando: gg.giro > 0, assustado: t > tCaminhao });
    if (o.camera !== false) { let P;
      if (depois) P = keysAt(t, KF); else { const A = keysAt(t, K); const w = ease.inOut(prog(t, tCorre - 0.15, tCorre + 0.55)); P = w > 0 ? mixPose(A, segue(t, e.p), w) : A; }
      cam.position.set(...P.pos); look.set(...P.look); cam.lookAt(look); cam.fov = P.fov; cam.updateProjectionMatrix();
      if (t > tCaminhao && !depois) { const tr = 0.03 * perto * perto; cam.position.x += Math.sin(t * 41) * tr; cam.position.y += Math.sin(t * 37) * tr; }
      st.foco(depois ? cam.position.distanceTo(gato.position) : t < tGato ? 20 : cam.position.distanceTo(t < tCorre ? gato.position : eu.position), 0.0004); }
    st.bloom.strength = 0.75 + (depois ? 0 : 1.2 * Math.pow(perto, 3));
    st.lente.uniforms.aberr && (st.lente.uniforms.aberr.value = 0.0015 + (depois ? 0 : 0.006 * Math.pow(perto, 3)));
    av.update(t, cam); st.tick(t); };
  const V = new THREE.Vector3();
  const proj = (v) => { V.copy(v).project(cam); return { x: (V.x + 1) / 2 * E.W, y: (1 - V.y) / 2 * E.H, ok: V.z < 1 && V.z > -1 }; };
  const overlay = (g, t) => { const depois = t > tImpacto + 0.1;
    if (!depois && t > tCaminhao - 0.8) { const fx = frenteX(t), perto = clamp(1 - (fx - 1) / 70), ps = truck.faroisMundo().map(proj).filter((q) => q.ok); g.save(); g.globalCompositeOperation = 'lighter';
      for (const q of ps) { const R = 40 + 260 * perto * perto, gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, R); gr.addColorStop(0, 'rgba(255,250,235,.95)'); gr.addColorStop(0.25, `rgba(255,220,170,${0.35 + 0.3 * perto})`); gr.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = gr; g.fillRect(q.x - R, q.y - R, R * 2, R * 2);
        const sw = 120 + 900 * perto, gs = g.createLinearGradient(q.x - sw, 0, q.x + sw, 0); gs.addColorStop(0, 'rgba(120,200,255,0)'); gs.addColorStop(0.5, `rgba(170,225,255,${0.25 + 0.4 * perto})`); gs.addColorStop(1, 'rgba(120,200,255,0)'); g.fillStyle = gs; g.fillRect(q.x - sw, q.y - 3 - 4 * perto, sw * 2, 6 + 8 * perto); }
      if (ps.length) { const cx = (ps[0].x + (ps[1] || ps[0]).x) / 2, cy = (ps[0].y + (ps[1] || ps[0]).y) / 2, dx = E.W / 2 - cx, dy = E.H / 2 - cy;
        [[0.5, 30, 'rgba(120,255,200,'], [0.9, 70, 'rgba(255,120,220,'], [1.4, 46, 'rgba(120,180,255,'], [1.75, 110, 'rgba(255,220,120,']].forEach(([f, r, c]) => { const x = cx + dx * f, y = cy + dy * f, rr = r * (0.6 + perto), gr = g.createRadialGradient(x, y, rr * 0.6, x, y, rr); gr.addColorStop(0, c + (0.05 + 0.12 * perto) + ')'); gr.addColorStop(0.85, c + (0.08 + 0.15 * perto) + ')'); gr.addColorStop(1, c + '0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); });
        const lav = Math.pow(perto, 4) * 0.55; if (lav > 0.01) { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, E.H); gr.addColorStop(0, `rgba(255,245,225,${lav})`); gr.addColorStop(1, `rgba(255,235,210,${lav * 0.4})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); } }
      g.restore(); }
    // clarão branco ANTES da batida, segura e abre no gato a salvo
    const a = t < tImpacto ? ease.in(prog(t, tImpacto - 0.22, tImpacto)) : 1 - ease.inOut(prog(t, tImpacto + 0.25, tIleso));
    if (a > 0) { g.save(); g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); } };
  return { stage: st, st, av, truck, gato, eu, update, overlay, tempos: tm, frenteX }; }
