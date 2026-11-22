// A ESTAÇÃO — mezanino e plataforma do metrô: luz branca e limpa, azulejo branco com faixa vermelha (a "linha vermelha"),
// piso de granito claro, catracas de tripé com leitor que acende verde, poucas pessoas esperando, trem chegando,
// placa "SANITÁRIOS →" e o corredor do banheiro. Coordenadas: chega da escada em x=-8; catracas em x=-2 (z 0..3);
// plataforma x -1..16, borda em z=-0.2, vala dos trilhos z ∈ [-3.5,-0.2] (y=-1.2); parede de fundo z=3.6 (corredor em x≈11.5).
import { THREE, lam, luz, tex, rnd, mancha, cbox, box, cil, pl } from '/series/turno/ps1.js';
import { pessoa, pedestre } from '/series/estacao/elenco.js';
import { placa } from '/series/estacao/rua.js';
import { clamp, lerp, ease, prog } from '/engine/core.js';
const FX = { fixo: true, flat: false };

const tAzulejo = (faixa = '#c4201a') => tex(64, 128, (g, w, h) => {
  const R = rnd(3); for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { const v = (R() - 0.5) * 8; g.fillStyle = `rgb(${236 + v | 0},${236 + v | 0},${230 + v | 0})`; g.fillRect(x, y, 8, 8); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x + 1, y + 1, 6, 1); }
  g.fillStyle = '#b8b8b0'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1); for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 1, h);
  g.fillStyle = faixa; g.fillRect(0, 64, w, 10); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 73, w, 1);
  g.fillStyle = '#6a6a66'; g.fillRect(0, h - 10, w, 10);
}, [8, 1]);
const tGranito = () => tex(128, 128, (g, w, h) => { const R = rnd(8); g.fillStyle = '#b8b6b0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = ['#8a8882', '#d8d6d0', '#6a6864', '#c8c4bc'][R() * 4 | 0]; g.fillRect(R() * w | 0, R() * h | 0, 1, 1); } g.fillStyle = 'rgba(80,80,76,.6)'; for (let i = 0; i < 4; i++) { g.fillRect(0, i * 32, w, 1); g.fillRect(i * 32, 0, 1, h); } for (let i = 0; i < 6; i++) mancha(g, R() * w, R() * h, 18, 'rgba(255,255,255,A)', 0.1); }, [10, 4]);
const tTeto = () => tex(64, 64, (g) => { g.fillStyle = '#d8d8d4'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#a8a8a4'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 0, 2, 64); const R = rnd(2); for (let i = 0; i < 200; i++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(R() * 64 | 0, R() * 64 | 0, 1, 1); } }, [20, 6]);
const tAnuncio = (seed) => placa(64, 40, '#e8e4da', (g) => { const R = rnd(seed); const c = ['#2a6ab0', '#e0a020', '#3aa060', '#a03a8a'][seed % 4]; g.fillStyle = c; g.fillRect(0, 0, 64, 40); g.fillStyle = '#ffffff'; g.font = 'bold 8px monospace'; g.fillText(['CURSO DE INGLÊS', 'PROMOÇÃO', 'VAGAS', 'SHOW SÁBADO'][seed % 4], 32, 9); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(18, 27, 8, 0, 7); g.fill(); g.fillRect(32, 21, 24, 3); g.fillRect(32, 27, 18, 3); });

export function estacao(st) {
  const S = st.scene, M = { gente: [] };
  S.add(new THREE.HemisphereLight(new THREE.Color('#e8eef4'), new THREE.Color('#6a6a70'), 1.1));
  const mAz = lam('#ffffff', { ...FX, map: tAzulejo() }), mGr = lam('#ffffff', { ...FX, map: tGranito() });
  const chao = pl(30, 7.1, mGr, 4, 0, 0.0); chao.rotation.x = -Math.PI / 2; chao.position.set(4, 0, (3.6 - 0.2) / 2 + 0.0); chao.scale.set(1, 3.8 / 7.1, 1); S.add(chao);
  { const c2 = pl(30, 3.8, mGr, 4, 0, 1.7); c2.rotation.x = -Math.PI / 2; S.add(c2); S.remove(chao); }
  { const t = pl(30, 7.6, lam('#ffffff', { ...FX, map: tTeto() }), 4, 3.3, 0); t.rotation.x = Math.PI / 2; S.add(t); }
  // parede de fundo (com vão do corredor do banheiro entre x 10.8 e 12.4)
  for (const [x0, x1] of [[-11, 4.0], [5.6, 19]]) { const w = pl(x1 - x0, 3.3, mAz, (x0 + x1) / 2, 1.65, 3.6); w.rotation.y = Math.PI; w.material = mAz; S.add(w); }
  S.add(box(1.6, 0.9, 0.1, lam('#e8e8e4', FX), 4.8, 2.85, 3.6));
  // corredor (fundo escuro, mais sujo)
  { const c = new THREE.Group(); S.add(c); const mc = lam('#c8c8bc', FX); c.add(box(0.1, 3.3, 4, mc, 4.0, 1.65, 5.6), box(0.1, 3.3, 4, mc, 5.6, 1.65, 5.6), box(1.7, 0.1, 4, lam('#5a5a56', FX), 4.8, 0.0, 5.6), box(1.7, 3.3, 0.1, lam('#3a3a36', FX), 4.8, 1.65, 7.6)); const L = new THREE.PointLight(new THREE.Color('#d8f0c8'), 3, 5, 1.5); L.position.set(4.8, 2.6, 6.2); c.add(L); M.luzCorredor = L; }
  // parede do outro lado dos trilhos com anúncios
  { const w = pl(30, 4.5, mAz, 4, 1.0, -3.6); S.add(w); for (let i = 0; i < 5; i++) S.add(pl(2.4, 1.5, luz('#ffffff', { map: tAnuncio(i), fixo: true }), -6 + i * 5.5, 1.4, -3.55)); }
  // vala dos trilhos
  { const v = pl(30, 3.4, lam('#3a3632', FX), 4, -1.2, -1.9); v.rotation.x = -Math.PI / 2; S.add(v); S.add(box(30, 1.2, 0.1, lam('#5a5a56', FX), 4, -0.6, -0.2));
    for (const z of [-1.3, -2.5]) S.add(box(30, 0.12, 0.08, lam('#9aa0a4', { fixo: true }), 4, -1.1, z)); for (let x = -10; x < 18; x += 0.7) S.add(box(0.2, 0.08, 1.8, lam('#4a4038', { fixo: true }), x, -1.17, -1.9)); }
  // borda da plataforma: faixa amarela tátil
  S.add(box(30, 0.012, 0.45, lam('#e8c020', { fixo: true }), 4, 0.006, 0.05));
  // pilares
  for (const x of [-5.5, 8, 14]) S.add(cbox(0.6, 3.3, 0.6, mAz, x, 1.65, 1.4, 0.05));
  // luminárias (faixas brancas) + luzes
  for (let x = -9; x < 18; x += 3) S.add(box(1.6, 0.05, 0.25, luz('#ffffff'), x, 3.27, 1.6));
  for (const x of [-6, 0, 6, 12]) { const L = new THREE.PointLight(new THREE.Color('#f0f6ff'), 14, 9, 1.2); L.position.set(x, 3.0, 1.4); S.add(L); }
  // catracas de tripé (x=-2) com leitor que acende
  M.leitor = [];
  for (let i = 0; i < 4; i++) { const z = -0.1 + i * 0.95; const g = new THREE.Group(); g.position.set(-2, 0, z); S.add(g);
    g.add(cbox(1.1, 1.0, 0.28, lam('#a8acb0', { fixo: true }), 0, 0.5, 0.0, 0.04)); g.add(cbox(1.12, 0.05, 0.3, lam('#2a2a2e', { fixo: true }), 0, 1.02, 0, 0.02));
    const rd = luz('#3a3a3e'); const r = box(0.16, 0.02, 0.16, rd, -0.3, 1.06, 0.0); g.add(r); M.leitor.push({ r, on: luz('#40ff70'), off: rd });
    const tri = new THREE.Group(); tri.position.set(0.0, 0.85, 0.2); g.add(tri); for (let k = 0; k < 3; k++) { const a = cil(0.02, 0.02, 0.45, lam('#c8ccd0', { fixo: true }), 0, 0, 0.22, 6); a.rotation.x = Math.PI / 2; const h = new THREE.Group(); h.rotation.x = k * 2.094; h.add(a); tri.add(h); } tri.rotation.z = 0.5; M[`tri${i}`] = tri; }
  // placas
  S.add(pl(1.9, 0.45, luz('#ffffff', { map: placa(96, 24, '#1a1a1e', (g, w, h) => { g.fillStyle = '#ffffff'; g.font = 'bold 12px monospace'; g.fillText('SANITÁRIOS  →', w / 2, h / 2 + 1); }), side: THREE.DoubleSide, fixo: true }), 3.2, 2.65, 2.2).rotateY(Math.PI));
  S.add(box(0.02, 0.4, 0.02, lam('#555'), 2.8, 3.08, 2.2), box(0.02, 0.4, 0.02, lam('#555'), 3.6, 3.08, 2.2));
  S.add(pl(3.2, 0.5, luz('#ffffff', { map: placa(128, 20, '#c4201a', (g, w, h) => { g.fillStyle = '#ffffff'; g.font = 'bold 11px monospace'; g.fillText('LINHA VERMELHA  •  SENTIDO LESTE', w / 2, h / 2 + 1); }), side: THREE.DoubleSide, fixo: true }), 10.5, 2.8, 1.4).rotateY(Math.PI));
  // bancos
  for (const x of [9.8, 12.4]) { S.add(box(1.8, 0.08, 0.45, lam('#8a8e92', { fixo: true }), x, 0.45, 2.9)); S.add(box(0.08, 0.45, 0.4, lam('#5a5e62', { fixo: true }), x - 0.8, 0.22, 2.9), box(0.08, 0.45, 0.4, lam('#5a5e62', { fixo: true }), x + 0.8, 0.22, 2.9)); }
  // trem (chega da direita)
  { const t = new THREE.Group(); S.add(t); const lat = lam('#c8ccd0', { fixo: true }); t.add(cbox(40, 2.8, 2.6, lat, 0, 0.4, 0, 0.2)); t.add(box(40.02, 0.25, 2.62, lam('#c4201a', { fixo: true }), 0, -0.4, 0));
    const jan = tex(256, 16, (g) => { g.fillStyle = '#20242a'; g.fillRect(0, 0, 256, 16); for (let x = 2; x < 256; x += 13) { g.fillStyle = (x / 13 | 0) % 4 === 1 ? '#5a6068' : '#e8f0e8'; g.fillRect(x, 2, 11, 12); } }); t.add(pl(39, 1.0, luz('#ffffff', { map: jan, fixo: true }), 0, 0.9, 1.31));
    t.add(box(0.05, 0.25, 0.5, luz('#fff8e0'), -20.02, -0.1, 0.7), box(0.05, 0.25, 0.5, luz('#fff8e0'), -20.02, -0.1, -0.7)); t.position.set(60, 0, -1.9); M.trem = t; }
  // gente esperando
  [[7.2, 2.5, -2.6], [9.4, 0.9, -2.9], [12.6, 2.6, -2.3], [15, 1.2, 3.0]].forEach(([x, z, ry], i) => { const p = pessoa(pedestre(40 + i)); p.position.set(x, 0, z); p.rotation.y = ry; S.add(p); M.gente.push(p); });
  M.gente[1].braco('D', 1.1, 0.1, 1.6, 0.6); { const cel = box(0.07, 0.13, 0.01, luz('#a0c8ff'), 0, -0.08, 0.04); M.gente[1].bracos.D.mao.add(cel); }
  return M;
}
export function estacaoVive(M, T, o = {}) {
  M.gente.forEach((p, i) => { p.respira(T + i); if (i !== 1) p.olhaPara(o.olharPara || [30, 1.4, -1.9], 1.0, 0.2); else { p.cab.rotation.x = 0.4; } p.face({ pisca: (T + i) % 3.3 > 3.17 }); });
  if (o.trem) { const k = ease.out(prog(T, o.trem[0], o.trem[1])); M.trem.position.x = lerp(70, 14, k); }
  if (o.bip != null) { const on = T > o.bip && T < o.bip + 0.5; M.leitor[1].r.material = on ? M.leitor[1].on : M.leitor[1].off; M.tri1.rotation.x = -2.094 * ease.inOut(prog(T, o.bip + 0.25, o.bip + 0.75)); }
}
