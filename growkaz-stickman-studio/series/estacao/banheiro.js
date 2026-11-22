// A ESTAÇÃO — o banheiro da estação: azulejo encardido, pia com mancha de ferrugem, chão molhado, fluorescente piscando,
// cabine sem trinco e o ESPELHO ENFERRUJADO. O espelho é o truque dos jogos da época: a sala inteira é construída duas vezes,
// a segunda espelhada (escala z = -1) atrás de um vão na parede; o "reflexo" é uma segunda Lívia que copia a pose da
// verdadeira — e por isso pode piscar atrasado, continuar olhando pra frente ou sorrir sozinha.
// Sala: x ∈ [-2.2, 2.2], z ∈ [0, 4.6] (espelho na parede z=0, x ∈ [-1.9, 0.1], y ∈ [1.05, 2.05]); porta de entrada em z=4.6, x≈-1.4;
// cabines à direita (x ∈ [0.8, 2.2]); cabine 1 z ∈ [1.2, 2.75], vaso em (1.85, 0, 1.95) virado pra -x.
import { THREE, lam, luz, tex, rnd, mancha, cbox, box, cil, pl } from '/series/turno/ps1.js';
import { anel } from '/series/turno/gente.js';
import { clamp, lerp, noise } from '/engine/core.js';
const FX = { fixo: true, flat: false };
export const ESP = { x0: -1.9, x1: 0.1, y0: 1.05, y1: 2.05 };
export const VASO = [1.85, 0, 1.95];

const tParede = () => tex(128, 128, (g, w, h) => {
  const R = rnd(5);
  for (let y = 0; y < h; y += 10) for (let x = 0; x < w; x += 10) { const v = (R() - 0.5) * 14; g.fillStyle = `rgb(${206 + v | 0},${212 + v | 0},${196 + v | 0})`; g.fillRect(x, y, 10, 10); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 1, y + 1, 7, 1); if (R() < 0.05) { g.fillStyle = 'rgba(60,50,30,.35)'; g.fillRect(x + 2, y + 3, 5, 4); } }
  g.fillStyle = '#6a6650'; for (let y = 0; y < h; y += 10) g.fillRect(0, y, w, 1); for (let x = 0; x < w; x += 10) g.fillRect(x, 0, 1, h);
  for (let i = 0; i < 7; i++) { const x = R() * w | 0, l = 20 + R() * 70; for (let y = 0; y < l; y++) { g.fillStyle = `rgba(120,70,30,${0.35 * (1 - y / l)})`; g.fillRect(x + (Math.sin(y * 0.25) > 0.7 ? 1 : 0), y, 2, 1); } }   // ferrugem escorrida
  for (let i = 0; i < 14; i++) mancha(g, R() * w, h - R() * 18, 10 + R() * 10, 'rgba(40,50,30,A)', 0.45);   // mofo no rodapé
  for (let i = 0; i < 10; i++) mancha(g, R() * w, R() * h, 8 + R() * 14, 'rgba(90,80,50,A)', 0.2);
  g.strokeStyle = 'rgba(20,20,30,.5)'; g.lineWidth = 1; for (let k = 0; k < 3; k++) { let x = 20 + R() * 80, y = 30 + R() * 50; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 6; i++) { x += 3 + R() * 4; y += (R() - 0.5) * 6; g.lineTo(x, y); } g.stroke(); }   // rabiscos
}, [4, 2]);
const tPiso = () => tex(128, 128, (g, w, h) => {
  const R = rnd(9); for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { const v = (R() - 0.5) * 16; g.fillStyle = (x + y) % 16 ? `rgb(${96 + v | 0},${94 + v | 0},${88 + v | 0})` : `rgb(${150 + v | 0},${146 + v | 0},${134 + v | 0})`; g.fillRect(x, y, 8, 8); }
  g.fillStyle = 'rgba(30,28,22,.8)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1); for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 1, h);
  for (let i = 0; i < 16; i++) mancha(g, R() * w, R() * h, 8 + R() * 18, 'rgba(40,32,20,A)', 0.35);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(200,200,200,.3)'; g.fillRect(R() * w | 0, R() * h | 0, 4, 2); }   // papel molhado
}, [5, 5]);
const tTeto = () => tex(64, 64, (g) => { g.fillStyle = '#b4b6a8'; g.fillRect(0, 0, 64, 64); mancha(g, 40, 20, 20, 'rgba(120,90,40,A)', 0.5); mancha(g, 40, 20, 10, 'rgba(80,60,20,A)', 0.4); mancha(g, 12, 50, 14, 'rgba(60,70,40,A)', 0.4); }, [3, 3]);
const tPoca = () => tex(64, 64, (g) => { g.clearRect(0, 0, 64, 64); const R = rnd(4); for (let i = 0; i < 5; i++) mancha(g, 16 + R() * 32, 16 + R() * 32, 10 + R() * 14, 'rgba(220,235,230,A)', 0.55); });
// espelho: vidro escuro levemente esverdeado + desprateado nas bordas, ferrugem, pontinhos e uma trinca
const tEspelho = () => { const t = tex(256, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h); const R = rnd(12);
  for (let i = 0; i < 40; i++) { const lado = R() * 4 | 0, x = lado === 0 ? R() * 10 : lado === 1 ? w - R() * 10 : R() * w, y = lado === 2 ? R() * 7 : lado === 3 ? h - R() * 7 : R() * h; mancha(g, x, y, 3 + R() * 8, 'rgba(18,14,10,A)', 0.8); }   // desprateado nas bordas
  for (let i = 0; i < 22; i++) { const x = R() * w, y = h - R() * 10; mancha(g, x, y, 2 + R() * 4, 'rgba(120,64,24,A)', 0.75); }   // ferrugem na base
  for (let i = 0; i < 14; i++) { const x = R() * w | 0, l = 6 + R() * 22; for (let y = 0; y < l; y++) { g.fillStyle = `rgba(110,70,35,${0.45 * (1 - y / l)})`; g.fillRect(x, h - y - 2, 1, 1); } }
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${R() < 0.6 ? '30,24,18' : '210,210,200'},${0.25 + R() * 0.35})`; g.fillRect(R() * w | 0, R() * h | 0, 1, 1); }
  g.strokeStyle = 'rgba(235,240,236,.6)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(w - 3, 3); g.lineTo(w - 14, 12); g.lineTo(w - 17, 21); g.lineTo(w - 27, 26); g.moveTo(w - 14, 12); g.lineTo(w - 6, 19); g.stroke();
  for (let i = 0; i < 5; i++) mancha(g, 30 + R() * 200, 20 + R() * 80, 20, 'rgba(200,210,200,A)', 0.05);   // embaçado
}); t.magFilter = THREE.LinearFilter; return t; };
// a sala (construída igual dos dois lados do espelho)
function sala(o = {}) {
  const G = new THREE.Group(), M = {};
  const mPar = lam('#ffffff', { ...FX, map: tParede() }), mPiso = lam('#ffffff', { ...FX, map: tPiso() }), mTeto = lam('#ffffff', { ...FX, map: tTeto() });
  const W = 4.4, D = 4.6, H = 2.8;
  { const p = pl(W, D, mPiso, 0, 0, D / 2); p.rotation.x = -Math.PI / 2; G.add(p); const t = pl(W, D, mTeto, 0, H, D / 2); t.rotation.x = Math.PI / 2; G.add(t); }
  const parede = (w, h, x, y, z, ry) => { const p = pl(w, h, mPar, x, y, z); p.rotation.y = ry; G.add(p); return p; };
  // parede do espelho (z=0) com vão
  parede(W, ESP.y0, 0, ESP.y0 / 2, 0, 0); parede(W, H - ESP.y1, 0, (H + ESP.y1) / 2, 0, 0); parede(ESP.x0 + 2.2, ESP.y1 - ESP.y0, (-2.2 + ESP.x0) / 2, (ESP.y0 + ESP.y1) / 2, 0, 0); parede(2.2 - ESP.x1, ESP.y1 - ESP.y0, (ESP.x1 + 2.2) / 2, (ESP.y0 + ESP.y1) / 2, 0, 0);
  parede(D, H, -2.2, H / 2, D / 2, Math.PI / 2); parede(D, H, 2.2, H / 2, D / 2, -Math.PI / 2);
  // parede da porta (z = D) com vão da porta x ∈ [-1.85, -0.95]
  parede(0.35, H, -2.025, H / 2, D, Math.PI); parede(3.15, H, 0.625, H / 2, D, Math.PI); parede(0.9, H - 2.1, -1.4, (H + 2.1) / 2, D, Math.PI);
  { const f = pl(0.9, 2.1, lam('#0e100e', FX), -1.4, 1.05, D + 0.6); f.rotation.y = Math.PI; G.add(f); }   // corredor escuro atrás da porta
  const porta = new THREE.Group(); porta.position.set(-1.85, 0, D); G.add(porta); porta.add(cbox(0.88, 2.06, 0.05, lam('#7a8a78', { fixo: true }), 0.44, 1.04, 0, 0.015)); porta.add(box(0.05, 0.16, 0.05, lam('#a0a4a0', { fixo: true }), 0.78, 1.0, -0.05)); M.porta = porta;
  // moldura do espelho (metal enferrujado)
  const mf = lam('#6a4a32', { fixo: true });
  G.add(box(ESP.x1 - ESP.x0 + 0.08, 0.04, 0.04, mf, (ESP.x0 + ESP.x1) / 2, ESP.y0 - 0.01, 0.015), box(ESP.x1 - ESP.x0 + 0.08, 0.04, 0.04, mf, (ESP.x0 + ESP.x1) / 2, ESP.y1 + 0.01, 0.015), box(0.04, ESP.y1 - ESP.y0, 0.04, mf, ESP.x0 - 0.02, (ESP.y0 + ESP.y1) / 2, 0.015), box(0.04, ESP.y1 - ESP.y0, 0.04, mf, ESP.x1 + 0.02, (ESP.y0 + ESP.y1) / 2, 0.015));
  // bancada com duas cubas, torneiras e ferrugem
  G.add(cbox(2.2, 0.08, 0.56, lam('#4a4844', { fixo: true }), -0.9, 0.86, 0.28, 0.02)); G.add(box(2.2, 0.2, 0.04, lam('#3a3834', { fixo: true }), -0.9, 0.74, 0.55));
  M.agua = [];
  for (const x of [-1.4, -0.4]) {
    G.add(new THREE.Mesh(anel([{ y: 0.74, rx: 0.12, rz: 0.1 }, { y: 0.9, rx: 0.2, rz: 0.17 }], 10, false), lam('#d8d4c8', { side: THREE.DoubleSide, fixo: true })).translateX(x).translateZ(0.28));
    const fundo = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), lam('#ffffff', { fixo: true, map: tex(32, 32, (g) => { g.fillStyle = '#c8c0b0'; g.fillRect(0, 0, 32, 32); mancha(g, 16, 8, 14, 'rgba(140,70,20,A)', 0.8); g.fillStyle = 'rgba(120,60,20,.7)'; g.fillRect(15, 0, 3, 16); g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(16, 18, 3, 0, 7); g.fill(); }) }));
    fundo.rotation.x = -Math.PI / 2; fundo.position.set(x, 0.745, 0.28); fundo.scale.set(1, 0.85, 1); G.add(fundo);
    G.add(cil(0.018, 0.022, 0.16, lam('#9aa0a4', { fixo: true }), x, 0.97, 0.06, 6)); const bico = box(0.03, 0.03, 0.14, lam('#9aa0a4', { fixo: true }), x, 1.04, 0.12); G.add(bico); G.add(box(0.06, 0.025, 0.025, lam('#b8bcc0', { fixo: true }), x, 1.07, 0.05));
    const ag = cil(0.008, 0.012, 0.28, luz('#c8e0e8', { transparent: true, opacity: 0.7 }), x, 0.89, 0.18, 5); ag.visible = false; G.add(ag); M.agua.push(ag);
  }
  // dispenser de papel toalha e lixeira transbordando
  G.add(cbox(0.3, 0.38, 0.12, lam('#c8c8c0', { fixo: true }), 0.55, 1.4, 0.07, 0.02)); G.add(cil(0.17, 0.15, 0.45, lam('#3a3a3e', { fixo: true }), 0.55, 0.22, 0.25, 8));
  for (let i = 0; i < 5; i++) { const p = box(0.1, 0.06, 0.08, lam('#e8e4dc', { fixo: true }), 0.5 + (i % 3) * 0.06, 0.47 + i * 0.02, 0.22 + (i % 2) * 0.05); p.rotation.set(i, i * 2, 0); G.add(p); }
  // poças no chão (brilho)
  const mPoca = luz('#ffffff', { map: tPoca(), transparent: true, opacity: 0.35, depthWrite: false, fixo: true, add: true });
  for (const [x, z, s] of [[-0.6, 1.4, 1.2], [0.3, 3.2, 1.0], [-1.6, 3.8, 0.8], [1.0, 0.6, 0.7]]) { const p = pl(s, s * 0.7, mPoca, x, 0.006, z); p.rotation.x = -Math.PI / 2; G.add(p); }
  // cabines (divisórias de fórmica riscada) + portas
  const mDiv = lam('#ffffff', { fixo: true, map: tex(64, 64, (g) => { g.fillStyle = '#8a9a7e'; g.fillRect(0, 0, 64, 64); const R = rnd(14); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(20,20,20,.5)'; g.fillRect(R() * 64 | 0, R() * 64 | 0, 4 + R() * 8 | 0, 1); } mancha(g, 30, 50, 14, 'rgba(60,40,20,A)', 0.4); g.fillStyle = 'rgba(20,20,20,.7)'; g.font = '8px monospace'; g.fillText('S.O.S', 10, 20); }), side: THREE.DoubleSide });
  for (const z of [1.2, 2.75, 4.3]) G.add(box(1.4, 1.85, 0.04, mDiv, 1.5, 1.08, z));
  G.add(box(0.04, 1.85, 0.35, mDiv, 0.8, 1.08, 1.375), box(0.04, 1.85, 0.5, mDiv, 0.8, 1.08, 2.5), box(0.04, 1.85, 0.4, mDiv, 0.8, 1.08, 2.95), box(0.04, 1.85, 0.5, mDiv, 0.8, 1.08, 4.05));
  G.add(box(0.05, 0.05, 3.2, lam('#7a7c76', { fixo: true }), 0.8, 2.02, 2.7));
  M.portas = [];
  for (const z of [1.55, 3.2]) { const d = new THREE.Group(); d.position.set(0.8, 0, z); G.add(d); d.add(box(0.035, 1.75, 0.68, mDiv, 0, 1.03, 0.34)); d.add(box(0.03, 0.04, 0.1, lam('#9a9a90'), -0.03, 1.0, 0.6)); M.portas.push(d); }
  // vaso na cabine 1 (virado pra -x), assento, válvula na parede, papel higiênico
  { const v = new THREE.Group(); v.position.set(...VASO); v.rotation.y = -Math.PI / 2; G.add(v); const lou = lam('#c8c4b6', { fixo: true });
    v.add(new THREE.Mesh(anel([{ y: 0, rx: 0.13, rz: 0.16, dz: -0.02 }, { y: 0.2, rx: 0.15, rz: 0.22, dz: 0.02 }, { y: 0.38, rx: 0.19, rz: 0.26, dz: 0.03 }], 10), lou));
    const ass = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 4, 14), lam('#9a9488', { fixo: true })); ass.rotation.x = Math.PI / 2; ass.scale.set(1, 1.35, 0.7); ass.position.set(0, 0.405, 0.03); v.add(ass);
    const agua = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), lam('#4a4a38', { fixo: true })); agua.rotation.x = -Math.PI / 2; agua.scale.set(1, 1.3, 1); agua.position.set(0, 0.3, 0.03); v.add(agua);
    v.add(cil(0.025, 0.025, 0.7, lam('#9aa0a4', { fixo: true }), 0, 0.75, -0.28, 6)); v.add(cbox(0.12, 0.1, 0.08, lam('#9aa0a4', { fixo: true }), 0, 1.0, -0.28, 0.02));
    M.vasoG = v; }
  { const rolo = cil(0.06, 0.06, 0.1, lam('#ece8e0', { fixo: true }), 1.45, 0.72, 1.28, 8); rolo.rotation.x = Math.PI / 2; G.add(rolo); G.add(box(0.14, 0.02, 0.04, lam('#8a8a88', { fixo: true }), 1.45, 0.8, 1.25)); }
  // luminária fluorescente (tubo que pisca)
  M.tubo = box(1.2, 0.05, 0.1, luz('#e8ffe0'), -0.4, H - 0.08, 1.6); M.tuboOn = M.tubo.material; M.tuboOff = lam('#4a4e48', { fixo: true }); G.add(M.tubo); G.add(cbox(1.3, 0.06, 0.2, lam('#8a8c86', { fixo: true }), -0.4, H - 0.03, 1.6, 0.02));
  M.L = new THREE.PointLight(new THREE.Color('#dff4d0'), 5.5, 7, 1.2); M.L.position.set(-0.4, H - 0.3, 1.6); G.add(M.L);
  M.L2 = new THREE.PointLight(new THREE.Color('#c8e0c0'), 1.6, 4, 1.4); M.L2.position.set(1.5, 2.3, 2.0); G.add(M.L2);
  M.L3 = new THREE.PointLight(new THREE.Color('#e8f0d8'), 2.2, 3.2, 1.3); M.L3.position.set(-0.8, 2.25, 0.35); G.add(M.L3); G.add(box(0.5, 0.06, 0.1, luz('#f0f8e8'), -0.8, 2.3, 0.06));
  M.hemi = new THREE.HemisphereLight(new THREE.Color('#9aaa98'), new THREE.Color('#2a2a24'), 0.35); G.add(M.hemi);
  // papel no assento (só a sala real)
  if (!o.espelho) { M.papel = []; const mp = luz('#fffdf6', { side: THREE.DoubleSide, fixo: true }); for (const [x, z, r] of [[0.0, 0.17, 0], [-0.17, -0.0, 1.35], [0.17, -0.0, -1.35]]) { const p = pl(0.3, 0.1, mp, 0, 0, 0); p.rotation.x = -Math.PI / 2; p.rotation.z = r; p.position.set(x, 0.44, z + 0.03); M.vasoG.add(p); M.papel.push(p); p.visible = false; } }
  G.traverse(x => { if (x.isMesh) x.frustumCulled = false; });
  return { G, M };
}

export function banheiro(st) {
  const real = sala(), esp = sala({ espelho: true });
  esp.G.scale.z = -1; st.scene.add(real.G, esp.G);
  // vidro do espelho por cima do vão
  const vidro = pl(ESP.x1 - ESP.x0, ESP.y1 - ESP.y0, new THREE.MeshBasicMaterial({ map: tEspelho(), transparent: true, depthWrite: false }), (ESP.x0 + ESP.x1) / 2, (ESP.y0 + ESP.y1) / 2, 0.004);
  st.scene.add(vidro);
  const tint = pl(ESP.x1 - ESP.x0, ESP.y1 - ESP.y0, new THREE.MeshBasicMaterial({ color: 0x203028, transparent: true, opacity: 0.22, depthWrite: false }), (ESP.x0 + ESP.x1) / 2, (ESP.y0 + ESP.y1) / 2, 0.003); st.scene.add(tint);
  return { real: real.M, esp: esp.M, Gr: real.G, Ge: esp.G };
}
// a luz (k: 0 apagada .. 1 acesa) nos dois lados
export function luzBanheiro(B, k) {
  for (const M of [B.real, B.esp]) { M.tubo.material = k > 0.5 ? M.tuboOn : M.tuboOff; M.L.intensity = 5.5 * k; M.L2.intensity = 1.6 * Math.max(0.15, k); M.hemi.intensity = 0.35 * Math.max(0.25, k); M.L3.intensity = 2.2 * k; }
}
// estado comum das duas salas
export function salaPose(B, o) { for (const M of [B.real, B.esp]) { M.porta.rotation.y = o.porta ?? 0; M.portas[0].rotation.y = o.cabine ?? 0; M.agua.forEach((a, i) => a.visible = i === 1 && !!o.agua); } }
// copia a pose (todas as articulações) de um boneco para outro com a mesma estrutura
export function copiaPose(src, dst) {
  const a = [], b = []; src.traverse(x => a.push(x)); dst.traverse(x => b.push(x));
  for (let i = 0; i < Math.min(a.length, b.length); i++) { if (a[i].isMesh && a[i].geometry === undefined) continue; b[i].position.copy(a[i].position); b[i].quaternion.copy(a[i].quaternion); b[i].scale.copy(a[i].scale); b[i].visible = a[i].visible; }
}
