// TURNO DA MADRUGADA — o posto na BR-116, "low poly modelado" (PS2 / RE2 1998) com texturas pintadas em baixa resolução.
// Coordenadas (metros): loja z 0..10 (vidro da frente em z=0, fundo z=10), x -6..6; pátio z -16..0; BR z -26..-16; mato além.
// Olhando pra fora = olhando pra -z; +x fica à direita.
// Anti z-fighting: arquitetura grande sem snap de vértice e subdividida; nada coplanar (decalques com polygonOffset);
// profundidade 32F no palco (ps1.js). Prateleiras são blocos com textura de produtos (nada modelado item a item).
import { THREE, lam, luz, tex, box, cil, pl, cbox, rnd, mancha } from '/series/turno/ps1.js';
import { anel, tbox } from '/series/turno/gente.js';
import { rng, clamp, lerp, ease, noise, prog } from '/engine/core.js';

const SODIO = '#ffc060', FLUOR = '#d4f0b4';
export const POSTE = [-10.5, -9];
const FX = { fixo: true, flat: false };   // arquitetura: sem snap, sombreamento suave por vértice (cor de AO)

// ---------- texturas pintadas (128–256 px) ----------
const CORES = ['#c8483a', '#e0b840', '#3a6ac0', '#3e9a4e', '#e8822a', '#e8e0d0', '#7a48a8', '#2aa0a0', '#b8306a', '#8a5a2a', '#d8d8d8'];
function produtos(g, x0, y0, w, h, R, tipo = 0) {
  let x = x0;
  while (x < x0 + w - 2) {
    const c = CORES[R() * CORES.length | 0], pw = 3 + (R() * 4 | 0), ph = Math.min(h - 1, (h * (0.55 + R() * 0.45)) | 0), n = 1 + (R() * 3 | 0);
    for (let k = 0; k < n && x < x0 + w - 2; k++) {
      const t = (tipo + (R() * 3 | 0)) % 3;
      g.fillStyle = c;
      if (t === 0) g.fillRect(x, y0 + h - ph, pw, ph);                                     // caixa
      else if (t === 1) { g.fillRect(x, y0 + h - ph + 2, pw, ph - 2); g.fillRect(x + 1, y0 + h - ph, pw - 2, 2); }  // pacote
      else { g.fillRect(x + 1, y0 + h - ph, Math.max(1, pw - 2), 2); g.fillRect(x, y0 + h - ph + 2, pw, ph - 2); }   // garrafa
      g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x, y0 + h - ph + 1, 1, ph - 2);
      g.fillStyle = 'rgba(255,255,255,.55)'; if (pw > 3) g.fillRect(x + 1, y0 + h - (ph * 0.6 | 0), pw - 2, 2);   // rótulo
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + pw - 1, y0 + h - ph, 1, ph);
      x += pw;
    }
    x += R() < 0.15 ? 2 : 0;
  }
}
// face de gôndola/prateleira: n prateleiras com produtos, frentes de prateleira com etiquetas e rodapé
const tGondola = (seed, larg = 256, alt = 128, n = 4, rep = null) => tex(larg, alt, (g, w, h) => {
  const R = rnd(seed); g.fillStyle = '#1a1a1e'; g.fillRect(0, 0, w, h);
  const base = 12, passo = (h - base - 4) / n;
  for (let i = 0; i < n; i++) {
    const y = 4 + i * passo; g.fillStyle = '#26262c'; g.fillRect(0, y, w, passo);
    produtos(g, 1, y + 2, w - 2, passo - 6, R, i);
    g.fillStyle = '#c8cac8'; g.fillRect(0, y + passo - 4, w, 3); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y + passo - 1, w, 1);
    for (let x = 4; x < w; x += 14 + (R() * 10 | 0)) { g.fillStyle = R() < 0.2 ? '#f0d040' : '#f2f2ec'; g.fillRect(x, y + passo - 4, 4, 3); }
  }
  g.fillStyle = '#2a7a6c'; g.fillRect(0, h - base, w, base); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, h - base, w, 1);
  for (let i = 0; i < 10; i++) mancha(g, R() * w, h - 4, 8, 'rgba(0,0,0,A)', 0.4);
}, rep);
const tPiso = () => tex(128, 128, (g, w, h) => {
  const R = rnd(17);
  for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) {
    const v = (R() - 0.5) * 14, c = (b) => Math.round(b + v);
    g.fillStyle = `rgb(${c(196)},${c(194)},${c(178)})`; g.fillRect(tx * 32, ty * 32, 32, 32);
    for (let i = 0; i < 26; i++) { g.fillStyle = R() < 0.5 ? 'rgba(90,85,70,.35)' : 'rgba(255,255,240,.25)'; g.fillRect(tx * 32 + R() * 32 | 0, ty * 32 + R() * 32 | 0, 1, 1); }   // granilite
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(tx * 32 + 2, ty * 32 + 2, 28, 1);
  }
  g.fillStyle = '#5e5c52'; for (let i = 0; i < 4; i++) { g.fillRect(i * 32, 0, 2, h); g.fillRect(0, i * 32, w, 2); }   // rejunte
  for (let i = 0; i < 9; i++) mancha(g, R() * w, R() * h, 6 + R() * 12, 'rgba(70,60,40,A)', 0.22);                  // encardido
  g.strokeStyle = 'rgba(40,36,30,.35)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10 + R() * 14, y + (R() - 0.5) * 4); g.stroke(); }   // marca de sola
  g.fillStyle = 'rgba(30,28,24,.6)'; g.fillRect(70, 40, 1, 6); g.fillRect(71, 45, 3, 1); g.fillRect(73, 46, 1, 5);  // trinca
}, [6, 5]);
const tTeto = () => tex(128, 128, (g, w, h) => {
  const R = rnd(23); g.fillStyle = '#b4b6ae'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(70,72,66,.35)'; g.fillRect(R() * w | 0, R() * h | 0, 1, 1); }
  g.fillStyle = '#d8dad4'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(0, 63, w, 3); g.fillRect(63, 0, 3, h);
  mancha(g, 92, 30, 18, 'rgba(120,90,40,A)', 0.45); mancha(g, 92, 30, 10, 'rgba(90,60,20,A)', 0.35); mancha(g, 30, 96, 12, 'rgba(120,90,40,A)', 0.3);
}, [6, 5]);
const tParede = (rep = [5, 1]) => tex(128, 192, (g, w, h) => {
  const R = rnd(31);
  g.fillStyle = '#cfcab6'; g.fillRect(0, 0, w, 118);
  for (let i = 0; i < 300; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)'; g.fillRect(R() * w | 0, R() * 118 | 0, 2, 1); }
  for (let i = 0; i < 5; i++) { const x = R() * w | 0, l = 20 + R() * 50; for (let y = 0; y < l; y++) { g.fillStyle = `rgba(110,90,50,${0.25 * (1 - y / l)})`; g.fillRect(x + (Math.sin(y * 0.3) > 0.6 ? 1 : 0), y, 2, 1); } }   // escorrido
  mancha(g, 10, 6, 22, 'rgba(40,50,30,A)', 0.4); mancha(g, 110, 100, 14, 'rgba(80,70,50,A)', 0.25);
  g.fillStyle = '#e2c040'; g.fillRect(0, 106, w, 4); g.fillStyle = '#2a7a6c'; g.fillRect(0, 110, w, 8);
  for (let y = 118; y < h - 8; y += 16) for (let x = 0; x < w; x += 16) { const v = (R() - 0.5) * 10; g.fillStyle = `rgb(${222 + v | 0},${224 + v | 0},${214 + v | 0})`; g.fillRect(x, y, 16, 16); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x + 1, y + 1, 12, 1); }
  g.fillStyle = '#8a8a80'; for (let y = 118; y < h; y += 16) g.fillRect(0, y, w, 1); for (let x = 0; x < w; x += 16) g.fillRect(x, 118, 1, h - 118);
  g.fillStyle = '#3a3c3a'; g.fillRect(0, h - 8, w, 8); for (let i = 0; i < 6; i++) mancha(g, R() * w, h - 10, 10, 'rgba(50,40,30,A)', 0.4);
}, rep);
const tConcreto = () => tex(128, 128, (g, w, h) => {
  const R = rnd(4); g.fillStyle = '#5e5d58'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 700; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.08)'; g.fillRect(R() * w | 0, R() * h | 0, 2, 1); }
  g.fillStyle = '#34332f'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(0, 63, w, 1); g.fillRect(63, 0, 1, h);
  mancha(g, 40, 80, 14, 'rgba(10,10,12,A)', 0.55); mancha(g, 44, 84, 6, 'rgba(40,30,60,A)', 0.35); mancha(g, 100, 30, 10, 'rgba(10,10,12,A)', 0.45);   // óleo
  for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(150,170,190,.12)'; g.fillRect(R() * w | 0, R() * h | 0, 18, 2); }   // molhado
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(20, 0, 3, h); g.fillRect(28, 0, 3, h);   // rastro de pneu
}, [8, 4]);
const tAsfalto = () => tex(128, 128, (g, w, h) => {   // 10 m x 10 m: faixa branca nas bordas, tracejado amarelo no meio
  const R = rnd(7); g.fillStyle = '#26272b'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { g.fillStyle = R() < 0.5 ? '#202124' : '#303136'; g.fillRect(R() * w | 0, R() * h | 0, 1, 1); }
  g.fillStyle = '#1c1d20'; g.fillRect(30, 40, 26, 18); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(90, 80, 1, 20); g.fillRect(91, 99, 6, 1);   // remendo, trinca
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(120,140,170,.10)'; g.fillRect(R() * w | 0, 20 + R() * 90 | 0, 30, 1); }
  g.fillStyle = '#c8c8bc'; g.fillRect(0, 5, w, 2); g.fillRect(0, h - 7, w, 2);
  g.fillStyle = '#c8a030'; g.fillRect(0, 63, 51, 2);
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(38,39,43,.8)'; g.fillRect(R() * w | 0, [5, 6, 63, 64, h - 7, h - 6][R() * 6 | 0], 2, 1); }   // tinta gasta
}, [40, 1]);
const tGrama = () => tex(64, 64, (g, w, h) => { const R = rnd(13); g.fillStyle = '#0c140f'; g.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { g.fillStyle = R() < 0.5 ? '#132018' : '#08100b'; g.fillRect(R() * w | 0, R() * h | 0, 1, 2); } }, [100, 100]);
const tGeladeira = (seed) => tex(64, 128, (g, w, h) => {
  const R = rnd(seed); g.fillStyle = '#b8e4ec'; g.fillRect(0, 0, w, h);
  for (let s = 0; s < 5; s++) {
    const y = 16 + s * 21; g.fillStyle = '#d8f0f4'; g.fillRect(4, y - 18, w - 8, 18);
    let x = 5; while (x < w - 7) { const c = ['#c83a2a', '#2a5ac8', '#e8e0d0', '#3aa048', '#e8a830', '#6a3a1a', '#9ad0f0', '#e8d020'][R() * 8 | 0], bw = 3 + (R() * 3 | 0), bh = 9 + (R() * 7 | 0); g.fillStyle = c; g.fillRect(x, y - bh, bw, bh); g.fillRect(x + 1, y - bh - 2, Math.max(1, bw - 2), 2); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x, y - bh + 1, 1, bh - 1); x += bw + (R() < 0.2 ? 1 : 0); }
    g.fillStyle = '#8aa8b0'; g.fillRect(3, y, w - 6, 2);
  }
  g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 5; i++) g.fillRect(8 + i * 3, 0, 1, h);   // reflexo no vidro
  g.fillStyle = 'rgba(220,235,240,.25)'; g.fillRect(4, h - 14, w - 8, 10);   // embaçado
  g.fillStyle = '#4a5054'; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4); g.fillRect(0, 0, 4, h); g.fillRect(w - 4, 0, 4, h);
  g.fillStyle = '#9aa0a4'; g.fillRect(w - 9, 40, 3, 46);
});
const tVidro = () => tex(64, 64, (g, w, h) => { const R = rnd(41); g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(200,220,230,.10)'; g.fillRect(0, 0, w, h); for (let i = 0; i < 18; i++) mancha(g, R() * w, R() * h, 4 + R() * 9, 'rgba(220,230,235,A)', 0.22); for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(230,240,245,.25)'; g.fillRect(R() * w | 0, R() * h | 0, 1, 6 + R() * 10 | 0); } });
const placa = (w, h, fundo, draw) => tex(w, h, (g) => { g.fillStyle = fundo; g.fillRect(0, 0, w, h); g.textBaseline = 'middle'; g.textAlign = 'center'; draw(g, w, h); });

// ---------- TV de tubo (CRT arredondada) com tela trocável ----------
export function tv() {
  const W = 96, H = 72; const t = tex(W, H, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }); t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; const g = t.g;
  const grp = new THREE.Group(), mCx = lam('#2c2c30');
  grp.add(cbox(0.72, 0.56, 0.2, mCx, 0, 0, 0.05, 0.06));                                // moldura frontal arredondada
  const tras = new THREE.Mesh(tbox(0.62, 0.46, 0.36, 0.62, 0.62), mCx); tras.rotation.x = Math.PI / 2; tras.position.set(0, 0.01, -0.22); grp.add(tras);   // tubo afinando pra trás
  grp.add(cbox(0.6, 0.45, 0.04, lam('#151517'), -0.02, 0.025, 0.14, 0.03));             // bisel escuro da tela
  const tela = pl(0.54, 0.4, luz('#ffffff', { map: t, fog: false, decal: 2 }), -0.02, 0.025, 0.162); grp.add(tela);
  for (let i = 0; i < 3; i++) grp.add(cil(0.015, 0.015, 0.02, lam('#4a4a4e'), 0.31 - i * 0.0, -0.2 + i * 0.05, 0.16, 6).rotateX(Math.PI / 2));
  grp.add(box(0.03, 0.02, 0.01, luz('#40ff60'), 0.31, 0.12, 0.16));
  grp.add(box(0.06, 0.5, 0.06, lam('#3a3a3c'), 0, 0.5, -0.1)); grp.add(box(0.3, 0.04, 0.3, lam('#3a3a3c'), 0, 0.27, -0.12));   // suporte no teto
  grp.tela = (modo, T) => {
    g.save();
    if (modo === 'novela') {
      g.fillStyle = '#a06a4a'; g.fillRect(0, 0, W, H); g.fillStyle = '#7a4a34'; g.fillRect(0, 46, W, 26); g.fillStyle = '#d8b070'; g.fillRect(60, 8, 22, 18);
      const k = Math.floor(T * 0.5) % 2; g.fillStyle = '#e0b090'; g.fillRect(k ? 22 : 30, 18, 14, 16); g.fillStyle = '#3a2418'; g.fillRect(k ? 22 : 30, 16, 14, 5); g.fillStyle = '#4a6ab0'; g.fillRect(k ? 18 : 26, 34, 22, 30);
      g.fillStyle = '#c89878'; g.fillRect(k ? 56 : 62, 22, 12, 14); g.fillStyle = '#9a2a4a'; g.fillRect(k ? 52 : 58, 36, 20, 30);
    } else if (modo === 'estatica') {
      const id = g.createImageData(W, H); let s = (Math.floor(T * 24) * 9301 + 49297) >>> 0; for (let i = 0; i < id.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = s >>> 24; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0);
    } else if (modo === 'alerta') {
      const pisca = Math.floor(T * 2.2) % 2;
      g.fillStyle = pisca ? '#c41a14' : '#a01410'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, W, 8); g.fillRect(0, 52, W, 20);
      g.fillStyle = '#ffffff'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PLANTÃO', W / 2, 4.5);
      g.fillStyle = '#ffe24a'; g.beginPath(); g.moveTo(W / 2, 11); g.lineTo(W / 2 + 9, 26); g.lineTo(W / 2 - 9, 26); g.closePath(); g.fill(); g.fillStyle = '#000'; g.fillRect(W / 2 - 1, 15, 2, 6); g.fillRect(W / 2 - 1, 22, 2, 2);
      g.fillStyle = '#ffffff'; g.font = 'bold 15px monospace'; g.fillText('ALERTA', W / 2, 36);
      g.font = 'bold 7px monospace'; g.fillText('MINISTÉRIO DA SAÚDE', W / 2, 47);
      const msg = 'SURTOS DE AGRESSIVIDADE E FEBRE ALTA NA REGIÃO METROPOLITANA  •  EVITEM CONTATO FÍSICO  •  PERMANEÇAM EM LOCAIS FECHADOS  •  ';
      g.fillStyle = '#ffe24a'; g.font = 'bold 8px monospace'; g.textAlign = 'left'; const off = (T * 26) % (msg.length * 4.8); g.fillText(msg + msg, W - off, 62);
    } else { g.fillStyle = '#05060a'; g.fillRect(0, 0, W, H); }
    g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
    const gr = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, 60); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);   // curvatura do tubo
    g.restore(); t.needsUpdate = true;
  };
  return grp;
}

// ---------- carro sem farol (contramão) ----------
export function carro() {
  const g = new THREE.Group(), lat = lam('#7a828c'), vid = lam('#07090c'), pneu = lam('#0b0b0c');
  g.add(cbox(4.2, 0.62, 1.8, lat, 0, 0.6, 0, 0.12));
  const cab = new THREE.Mesh(tbox(2.3, 0.55, 1.62, 0.78, 0.88), vid); cab.position.set(0.2, 1.18, 0); g.add(cab);
  g.add(cbox(1.85, 0.07, 1.45, lat, 0.2, 1.47, 0, 0.03));
  for (const [x, z] of [[-1.3, 0.85], [1.3, 0.85], [-1.3, -0.85], [1.3, -0.85]]) { const w = cil(0.33, 0.33, 0.24, pneu, x, 0.33, z, 8); w.rotation.x = Math.PI / 2; g.add(w); g.add(cil(0.18, 0.18, 0.25, lam('#4a4c50'), x, 0.33, z, 6).rotateX(Math.PI / 2)); }
  g.add(box(0.1, 0.12, 1.6, lam('#3a1010'), 2.1, 0.75, 0));      // lanterna apagada
  const fl = new THREE.PointLight(new THREE.Color('#ff9a40'), 6, 6, 1.2); fl.position.set(-2.6, 0.4, 0); g.add(fl); g.faisca = fl;
  const coisa = new THREE.Group(); coisa.add(cbox(0.9, 0.35, 0.6, lam('#1a1512'), -2.5, 0.2, 0.1, 0.08)); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), lam('#2a1a16')); b.position.set(-2.8, 0.25, -0.3); b.scale.set(1.3, 0.6, 1); coisa.add(b);
  coisa.add(box(0.7, 0.12, 0.18, lam('#3a2a22'), -2.9, 0.12, 0.5)); g.add(coisa);
  return g;
}
// faíscas: pontos aditivos nascendo no para-choque (posição do carro em função do tempo)
export function faiscas(n = 90) {
  const pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color('#ffc060'), size: 2.2, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  p.frustumCulled = false; const R = rng(5), base = []; for (let i = 0; i < n; i++) base.push([R(), R(), R(), R()]);
  p.update = (T, carX, z, t0, t1) => {
    for (let i = 0; i < n; i++) {
      const b = base[i], life = 0.35 + b[0] * 0.3, ph = ((T * 3 + b[1] * 10) % life), tb = T - ph;
      if (tb < t0 || tb > t1) { pos[i * 3 + 1] = -50; continue; }
      const x0 = carX(tb), vx = 2 + b[2] * 5, vy = 1 + b[3] * 2.5, vz = (b[1] - 0.5) * 3;
      pos[i * 3] = x0 + vx * ph; pos[i * 3 + 1] = 0.05 + vy * ph - 6 * ph * ph; pos[i * 3 + 2] = z + vz * ph;
      if (pos[i * 3 + 1] < 0.02) pos[i * 3 + 1] = 0.02;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return p;
}

// ---------- caminhão cara-chata do Seu Alberto (faróis amarelados com facho na neblina) ----------
export function caminhao() {
  const g = new THREE.Group(), cab = lam('#c8c2b0'), faixa = lam('#2a5a8a'), pneu = lam('#0b0b0c'), bau = lam('#8a8e94', { map: tex(64, 32, (c, w, h) => { c.fillStyle = '#8a8e94'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.2)'; for (let x = 0; x < w; x += 4) c.fillRect(x, 0, 1, h); mancha(c, 20, 28, 14, 'rgba(60,40,20,A)', 0.5); }) });
  g.add(cbox(2.2, 2.4, 2.4, cab, 0, 1.9, 0, 0.16)); g.add(box(2.24, 0.25, 2.44, faixa, 0, 1.3, 0));
  g.add(box(0.05, 0.9, 2.0, lam('#0a1014'), 1.11, 2.5, 0));
  g.add(box(0.06, 0.4, 1.4, lam('#2a2c30', { map: tex(16, 8, (c) => { c.fillStyle = '#2a2c30'; c.fillRect(0, 0, 16, 8); c.fillStyle = '#5a5c60'; for (let y = 1; y < 8; y += 2) c.fillRect(1, y, 14, 1); }) }), 1.12, 1.0, 0));   // grade
  g.add(cbox(6.5, 2.9, 2.5, bau, -4.5, 2.25, 0, 0.05)); g.add(box(8.8, 0.3, 2.2, lam('#2a2a2c'), -3.4, 0.75, 0));
  for (const x of [0.2, -5.2, -6.4]) for (const z of [1.05, -1.05]) { const w = cil(0.5, 0.5, 0.35, pneu, x, 0.5, z, 8); w.rotation.x = Math.PI / 2; g.add(w); }
  const farois = [], fachos = [];
  const mFacho = luz('#ffe2a0', { add: true, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide });
  for (const z of [0.75, -0.75]) {
    const f = cbox(0.08, 0.2, 0.34, luz('#fff0b8'), 1.13, 1.0, z, 0.03); g.add(f); farois.push(f);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 8, 1, true), mFacho); cone.rotation.z = Math.PI / 2; cone.position.set(1.15 + 4.5, 0.75, z); g.add(cone); fachos.push(cone);
  }
  const pl1 = new THREE.PointLight(new THREE.Color('#ffd890'), 0, 14, 1.2); pl1.position.set(4, 1.2, 0); g.add(pl1);
  const lant = []; for (const z of [1.0, -1.0]) { const f = box(0.06, 0.15, 0.25, luz('#ff3020'), -7.76, 0.9, z); g.add(f); lant.push(f); }
  g.farois = farois; g.lant = lant;
  g.liga = (k) => { fachos.forEach(c => { c.visible = k > 0.02; c.material.opacity = 0.1 * k; }); pl1.intensity = 18 * k; };
  g.liga(0);
  return g;
}

// ---------- clarão e fumaça da batida no horizonte ----------
export function batida(pos = [75, 0, -70]) {
  const g = new THREE.Group(); g.position.set(...pos);
  const sprite = tex(16, 16, (c) => { const gr = c.createRadialGradient(8, 8, 0, 8, 8, 8); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 16, 16); });
  const brilho = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color: new THREE.Color('#ff8a2a'), blending: THREE.AdditiveBlending, fog: false, depthWrite: false, transparent: true })); brilho.scale.set(70, 40, 1); brilho.position.y = 9; g.add(brilho);
  const fogo = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color: new THREE.Color('#ffd070'), blending: THREE.AdditiveBlending, fog: false, depthWrite: false, transparent: true })); fogo.scale.set(8, 6, 1); fogo.position.y = 2; g.add(fogo);
  const fumaca = []; const smk = tex(16, 16, (c) => { const r = rng(3); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${60 + r() * 30 | 0},${55 + r() * 25 | 0},${55 + r() * 20 | 0},${0.5 + r() * 0.5})`; const a = r() * 6.28, d = r() * 6; c.fillRect(8 + Math.cos(a) * d - 2 | 0, 8 + Math.sin(a) * d - 2 | 0, 4, 4); } });
  for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smk, color: new THREE.Color('#6a5a52'), transparent: true, fog: false, depthWrite: false })); g.add(s); fumaca.push(s); }
  g.visible = false;
  g.update = (T, t0, baixa = 0) => {
    const k = T - t0; g.visible = k > 0; if (k <= 0) return;
    const flash = Math.exp(-k * 2.2), fl = 0.75 + 0.25 * noise(T * 6, 2);
    brilho.material.opacity = clamp(0.25 + 0.75 * flash) * fl * (1 - 0.5 * baixa); brilho.scale.set(70 + 40 * flash, 36 + 24 * flash, 1);
    fogo.material.opacity = clamp(0.5 + flash) * fl * (1 - 0.3 * baixa); fogo.scale.set(6 + 10 * flash, 5 + 8 * flash, 1);
    fumaca.forEach((s, i) => { const ph = ((k * 0.12 + i / 9) % 1); s.position.set(Math.sin(i * 2.1) * 3 + ph * 8, 3 + ph * 30 * (1 - 0.5 * baixa), Math.cos(i * 1.7) * 3); const sc = 6 + ph * 18; s.scale.set(sc, sc, 1); s.material.opacity = clamp(k * 0.5) * Math.sin(ph * Math.PI) * 0.85 * (1 - 0.6 * baixa); s.material.color.setRGB(0.42 + 0.3 * (1 - ph) * fl, 0.36 + 0.12 * (1 - ph), 0.32); });
  };
  return g;
}

// piso subdividido com "AO" pintado nos vértices (escurece junto às paredes e móveis)
function chao(w, d, cx, cz, map, sombras = []) {
  const geo = new THREE.PlaneGeometry(w, d, Math.round(w * 2), Math.round(d * 2)); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, cor = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + cx, z = p.getZ(i) + cz; let k = 1;
    const dw = Math.min(x - (cx - w / 2), (cx + w / 2) - x, z - (cz - d / 2), (cz + d / 2) - z); k *= 0.62 + 0.38 * clamp(dw / 0.9);
    for (const [x0, z0, x1, z1] of sombras) { const dx = Math.max(x0 - x, 0, x - x1), dz = Math.max(z0 - z, 0, z - z1); k *= 0.7 + 0.3 * clamp(Math.hypot(dx, dz) / 0.5); }
    cor.push(k, k, k * 0.98);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
  const m = new THREE.Mesh(geo, lam('#ffffff', { ...FX, map, vc: true })); m.position.set(cx, 0, cz); return m;
}
const parede = (w, h, m, x, y, z, ry) => { const p = pl(w, h, m, x, y, z, Math.max(1, Math.round(w)), 3); p.rotation.y = ry; return p; };

// ---------- o mundo todo ----------
export function posto(st, o = {}) {
  const S = st.scene, R = rng(11), M = {};
  S.add(new THREE.HemisphereLight(new THREE.Color('#2a4866'), new THREE.Color('#0a0c10'), 0.6));
  // ======== LOJA ========
  const loja = new THREE.Group(); S.add(loja);
  loja.add(chao(12, 10, 0, 5, tPiso(), [[-3.65, 2.5, -2.75, 7.5], [-0.85, 2.5, 0.05, 7.5], [1.8, 1.85, 5.0, 2.55], [5.2, 5.4, 6, 9.6], [1.0, 5.9, 2.2, 6.7]]));
  { const t = pl(12, 10, lam('#ffffff', { ...FX, map: tTeto() }), 0, 3, 5, 12, 10); t.rotation.x = Math.PI / 2; loja.add(t); }
  const mPar = lam('#ffffff', { ...FX, map: tParede([5, 1]) });
  loja.add(parede(10, 3, mPar, -6, 1.5, 5, Math.PI / 2), parede(10, 3, mPar, 6, 1.5, 5, -Math.PI / 2));
  { const mA = lam('#ffffff', { ...FX, map: tParede([0.45, 1]) }); loja.add(parede(0.9, 3, mA, -5.55, 1.5, 10, Math.PI)); loja.add(parede(10.1, 3, lam('#ffffff', { ...FX, map: tParede([5, 1]) }), 0.95, 1.5, 10, Math.PI)); loja.add(parede(1.0, 0.8, lam('#cfcab6', FX), -4.6, 2.6, 10, Math.PI)); }
  // fachada de vidro (z=0): montantes, faixa, vidro com marcas de dedo
  const mont = lam('#34383e');
  for (const x of [-6, -4.6, -2.3, -0.55, 0.55, 2, 4, 6]) loja.add(cbox(0.1, 3, 0.13, mont, x, 1.5, 0, 0.02));
  loja.add(box(12, 0.5, 0.16, lam('#2a7a6c'), 0, 2.75, 0)); loja.add(box(12, 0.1, 0.15, mont, 0, 0.05, 0)); loja.add(box(12, 0.06, 0.14, mont, 0, 1.05, 0.005));
  const vidro = luz('#7a8a96', { map: tVidro(), transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });   // bem sutil: no tom linear qualquer véu claro vira névoa
  for (const [x, w] of [[-5.3, 1.4], [-3.45, 2.3], [-1.425, 1.75], [1.275, 1.45], [3, 2], [5, 2]]) loja.add(pl(w - 0.1, 2.5, vidro, x, 1.25, 0));
  // porta de vidro (dobradiça em x=-0.55; abre pra fora, -z)
  const porta = new THREE.Group(); porta.position.set(-0.55, 0, 0); loja.add(porta);
  porta.add(box(0.06, 2.5, 0.06, mont, 0.03, 1.25, 0), box(0.06, 2.5, 0.06, mont, 1.07, 1.25, 0), box(1.1, 0.06, 0.06, mont, 0.55, 2.5, 0), box(1.1, 0.12, 0.06, mont, 0.55, 0.06, 0), cbox(0.5, 0.04, 0.05, lam('#c0c4c8'), 0.55, 1.1, -0.05, 0.015));
  porta.add(pl(1.0, 2.4, vidro, 0.55, 1.25, 0));
  porta.add(pl(0.34, 0.12, luz('#ffffff', { map: placa(34, 12, '#e8e4d8', (g) => { g.fillStyle = '#1a1a1a'; g.font = 'bold 8px monospace'; g.fillText('PUXE', 17, 6); }), side: THREE.DoubleSide, decal: 1 }), 0.55, 1.3, 0.01));
  M.porta = porta;
  // letreiro 24H em neon
  const neon = pl(0.9, 0.36, luz('#ffffff', { map: tex(36, 14, (g) => { g.fillStyle = '#05140c'; g.fillRect(0, 0, 36, 14); g.fillStyle = '#5cff9a'; g.font = 'bold 12px monospace'; g.textBaseline = 'top'; g.fillText('24H', 7, 1); g.fillStyle = 'rgba(92,255,154,.3)'; g.fillRect(0, 0, 36, 1); g.fillRect(0, 13, 36, 1); }) }), 3.0, 2.1, 0.09); loja.add(neon); M.neon = neon;
  // luminárias fluorescentes (calha + difusor) + luzes verde-amareladas
  M.lumis = [];
  const mLum = luz('#eaffcf'), mLumOff = luz('#3a4440');
  for (const x of [-3, 0, 3]) for (const z of [2, 5, 8]) { loja.add(cbox(1.42, 0.07, 0.42, lam('#8a8c88'), x, 2.955, z, 0.02)); const l = box(1.3, 0.03, 0.3, mLum, x, 2.915, z); loja.add(l); M.lumis.push(l); }
  M.luzes = [];
  for (const [x, z] of [[-3, 2.5], [2.5, 2.5], [-2.5, 7.5], [2.5, 7.5]]) { const p = new THREE.PointLight(new THREE.Color(FLUOR), 6, 11, 1.2); p.position.set(x, 2.7, z); loja.add(p); M.luzes.push(p); }
  M.mLum = mLum; M.mLumOff = mLumOff;
  // gôndolas: blocos com faces de produtos pintadas
  for (const [gi, gx] of [[0, -3.2], [1, -0.4]]) {
    const ladoA = lam('#ffffff', { map: tGondola(10 + gi * 7) }), ladoB = lam('#ffffff', { map: tGondola(13 + gi * 5) });
    const ponta = lam('#ffffff', { map: placa(48, 96, '#2a7a6c', (g, w, h) => { g.fillStyle = '#1a1a1e'; g.fillRect(4, 26, w - 8, h - 38); produtos(g, 5, 30, w - 10, 20, rnd(gi + 3)); produtos(g, 5, 56, w - 10, 20, rnd(gi + 9)); g.fillStyle = '#f2e04a'; g.fillRect(4, 4, w - 8, 18); g.fillStyle = '#c02a1a'; g.font = 'bold 9px monospace'; g.fillText('OFERTA', w / 2, 13); }) });
    const gd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.62, 5), [ladoA, ladoB, lam('#2a7a6c'), lam('#1a1a1a'), ponta, ponta]); gd.position.set(gx, 0.81, 5); loja.add(gd);
    loja.add(cbox(0.98, 0.07, 5.08, lam('#2a7a6c'), gx, 1.655, 5, 0.025));
  }
  // prateleiras de parede (esquerda e fundo) como blocos
  { const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.7, 7), [lam('#ffffff', { map: tGondola(90, 256, 128, 4, [1.4, 1]) }), lam('#222'), lam('#2a7a6c'), lam('#111'), lam('#222'), lam('#222')]); b.position.set(-5.79, 0.85, 5.5); loja.add(b); }
  { const b = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.7, 0.42), [lam('#222'), lam('#222'), lam('#2a7a6c'), lam('#111'), lam('#222'), lam('#ffffff', { map: tGondola(60, 256, 128, 4, [1.1, 1]) })]); b.position.set(1.6, 0.85, 9.79); b.rotation.y = 0; loja.add(b); }
  // geladeiras no fundo à direita: corpo + portas que brilham (interior com produtos)
  M.geladeiras = [];
  loja.add(cbox(0.82, 2.25, 4.3, lam('#c4c8cc'), 5.6, 1.125, 7.475, 0.04));
  loja.add(pl(0.8, 0.3, luz('#ffffff', { map: placa(80, 30, '#e8f4f8', (g, w, h) => { g.fillStyle = '#1a4a8a'; g.font = 'bold 14px monospace'; g.fillText('GELADOS', w / 2, h / 2 + 1); }), decal: 1 }), 5.18, 2.1, 7.475).rotateY(-Math.PI / 2));
  for (let i = 0; i < 4; i++) { const z = 5.9 + i * 1.05; const p = pl(1.0, 1.75, luz('#ffffff', { map: tGeladeira(30 + i), decal: 1 }), 5.18, 1.06, z); p.rotation.y = -Math.PI / 2; loja.add(p); M.geladeiras.push(p); }
  const pg = new THREE.PointLight(new THREE.Color('#bfe6ff'), 3.5, 4.5, 1.5); pg.position.set(4.4, 1.4, 7.4); loja.add(pg);
  // ilha de bolachas (onde o Lucas repõe)
  const ilha = new THREE.Group(); ilha.position.set(1.6, 0, 6.3); loja.add(ilha);
  ilha.add(cbox(1.2, 0.75, 0.8, lam('#2a7a6c'), 0, 0.375, 0, 0.04)); ilha.add(cbox(1.26, 0.04, 0.86, lam('#e2c040'), 0, 0.77, 0, 0.015));
  { const t = tex(64, 32, (g, w, h) => { const Rr = rnd(5); g.fillStyle = '#1a1a1e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 10) { const c = ['#e8c040', '#d06a2a', '#3a6ad0', '#e8e0d0'][Rr() * 4 | 0]; g.fillStyle = c; g.fillRect(x + 1, y + 1, 9, 6); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 1, y + 1, 9, 1); g.fillStyle = '#7a4a20'; g.fillRect(x + 4, y + 3, 3, 2); } });
    const mt = lam('#d0a030'); ilha.add(box(1.1, 0.12, 0.7, [mt, mt, lam('#ffffff', { map: t }), mt, mt, mt], 0, 0.85, 0)); }
  M.ilha = ilha;
  // balcão do caixa (frente em z=1.85; atendente atrás em z~2.9)
  const frente = tex(128, 40, (g, w, h) => { g.fillStyle = '#2a7a6c'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, 0, 1, h); } g.fillStyle = '#e2c040'; g.fillRect(0, 10, w, 3); g.fillStyle = '#1a1a1a'; g.fillRect(0, h - 5, w, 5); g.fillStyle = '#f2f2ea'; g.fillRect(14, 18, 24, 12); g.fillStyle = '#c02a1a'; g.fillRect(16, 20, 6, 8); g.fillStyle = '#1a1a1a'; g.fillRect(24, 21, 12, 1); g.fillRect(24, 24, 10, 1); g.fillRect(24, 27, 12, 1); g.fillStyle = '#f2f2ea'; g.fillRect(84, 18, 20, 12); g.fillStyle = '#2a6a3a'; g.font = 'bold 7px monospace'; g.textBaseline = 'middle'; g.fillText('PIX', 88, 24); mancha(g, 60, 36, 18, 'rgba(0,0,0,A)', 0.35); });
  loja.add(cbox(3.2, 1.0, 0.7, lam('#2a7a6c'), 3.4, 0.5, 2.2, 0.03)); loja.add(pl(3.14, 0.96, lam('#ffffff', { map: frente, decal: 1 }), 3.4, 0.5, 1.844).rotateY(Math.PI));
  loja.add(cbox(3.34, 0.06, 0.82, lam('#cfcbbd'), 3.4, 1.03, 2.2, 0.02));
  loja.add(cbox(0.7, 1.0, 0.7, lam('#2a7a6c'), 1.45, 0.5, 2.55, 0.03)); loja.add(cbox(0.74, 0.06, 0.74, lam('#cfcbbd'), 1.45, 1.03, 2.55, 0.02));
  // placa CAIXA pendurada
  { const mCx = luz('#ffffff', { map: placa(60, 20, '#e2c040', (g, w, h) => { g.fillStyle = '#1a2a28'; g.font = 'bold 13px monospace'; g.fillText('CAIXA', w / 2, h / 2 + 1); }) }); loja.add(pl(0.9, 0.3, mCx, 3.4, 2.55, 2.21)); const tras = pl(0.9, 0.3, mCx, 3.4, 2.55, 2.19); tras.rotation.y += Math.PI; loja.add(tras); } for (const dx of [-0.35, 0.35]) loja.add(box(0.01, 0.3, 0.01, lam('#555'), 3.4 + dx, 2.85, 2.2));
  // caixa registradora: base, gaveta, teclado inclinado, visor do cliente
  const reg = new THREE.Group(); reg.position.set(2.05, 1.06, 2.3); loja.add(reg);
  reg.add(cbox(0.44, 0.12, 0.4, lam('#2a2c30'), 0, 0.06, 0, 0.02));
  const tec = new THREE.Mesh(tbox(0.36, 0.1, 0.24, 1, 0.5), [lam('#3a3c40'), lam('#3a3c40'), lam('#ffffff', { map: tex(24, 16, (g) => { g.fillStyle = '#2a2c30'; g.fillRect(0, 0, 24, 16); for (let y = 1; y < 16; y += 4) for (let x = 1; x < 24; x += 4) { g.fillStyle = y < 4 && x > 16 ? '#c8a040' : '#c8c8c0'; g.fillRect(x, y, 3, 3); } }) }), lam('#222'), lam('#3a3c40'), lam('#3a3c40')]); tec.position.set(0, 0.17, 0.05); reg.add(tec);
  reg.add(cbox(0.3, 0.14, 0.05, lam('#2a2c30'), 0, 0.33, -0.12, 0.02)); const vis = pl(0.24, 0.08, luz('#7aff9a', { map: tex(24, 8, (g) => { g.fillStyle = '#0a2a14'; g.fillRect(0, 0, 24, 8); g.fillStyle = '#7aff9a'; g.fillRect(2, 2, 2, 4); g.fillRect(6, 2, 2, 4); g.fillRect(12, 2, 2, 4); g.fillRect(16, 2, 2, 4); g.fillRect(9, 5, 1, 1); }), decal: 1 }), 0, 0.33, -0.149); vis.rotation.y = Math.PI; reg.add(vis);
  M.reg = reg;
  // estufa de salgados com coxinhas (luz quente)
  const est = new THREE.Group(); est.position.set(4.3, 1.06, 2.2); loja.add(est);
  est.add(cbox(0.92, 0.06, 0.52, lam('#3a3c40'), 0, 0.03, 0, 0.02)); est.add(cbox(0.92, 0.05, 0.52, lam('#3a3c40'), 0, 0.5, 0, 0.02));
  for (const x of [-0.44, 0.44]) est.add(box(0.03, 0.44, 0.5, lam('#3a3c40'), x, 0.27, 0));
  est.add(box(0.86, 0.42, 0.48, luz('#ffcf8a', { transparent: true, opacity: 0.16, depthWrite: false }), 0, 0.27, 0));
  const mCox = lam('#d08a3a', { emissive: '#4a2208' });
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 6), mCox); c.position.set(-0.3 + i * 0.12, 0.12, (i % 2) * 0.1 - 0.05); est.add(c); }
  for (let i = 0; i < 3; i++) est.add(cbox(0.13, 0.05, 0.08, lam('#e0b060', { emissive: '#3a2008' }), -0.25 + i * 0.25, 0.3, 0, 0.02));
  const pe2 = new THREE.PointLight(new THREE.Color('#ffb060'), 1.6, 2.2, 1.5); pe2.position.set(4.3, 1.35, 2.0); loja.add(pe2);
  // cafeteira na parede direita, atrás do caixa: armário, máquina com garrafa de vidro, copos empilhados
  loja.add(cbox(0.7, 1.0, 1.6, lam('#5a4a3a', { map: tex(32, 32, (g) => { g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, 32, 32); for (let y = 0; y < 32; y += 3) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, y, 32, 1); } g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(15, 0, 1, 32); g.fillStyle = '#b0a890'; g.fillRect(12, 8, 1, 4); g.fillRect(18, 8, 1, 4); }) }), 5.62, 0.5, 3.6, 0.03));
  loja.add(cbox(0.75, 0.05, 1.65, lam('#cfcbbd'), 5.6, 1.025, 3.6, 0.015));
  const caf = new THREE.Group(); caf.position.set(5.6, 1.05, 3.6); caf.rotation.y = -Math.PI / 2; loja.add(caf);
  caf.add(cbox(0.48, 0.12, 0.38, lam('#202226'), 0, 0.06, 0, 0.03));
  caf.add(cbox(0.48, 0.5, 0.16, lam('#202226'), 0, 0.33, -0.12, 0.04)); caf.add(cbox(0.48, 0.1, 0.34, lam('#2a2c30'), 0, 0.6, -0.03, 0.03));
  for (let i = 0; i < 3; i++) caf.add(box(0.05, 0.03, 0.01, luz(i === 0 ? '#ff9a30' : '#40d060'), -0.12 + i * 0.08, 0.45, -0.035));
  caf.add(M_(anel([{ y: 0, rx: 0.075, rz: 0.075 }, { y: 0.1, rx: 0.085, rz: 0.085 }, { y: 0.2, rx: 0.06, rz: 0.06 }, { y: 0.24, rx: 0.045, rz: 0.045 }], 7), lam('#9ab0b0', { transparent: true, opacity: 0.55, depthWrite: false }), 0, 0.12, 0.06));
  caf.add(M_(anel([{ y: 0, rx: 0.073, rz: 0.073 }, { y: 0.09, rx: 0.082, rz: 0.082 }], 7), lam('#2a1408', { emissive: '#120600' }), 0, 0.125, 0.06));
  caf.add(cil(0.08, 0.08, 0.02, lam('#1a1a1a'), 0, 0.37, 0.06, 7));
  for (let i = 0; i < 2; i++) caf.add(M_(anel([{ y: 0, rx: 0.026, rz: 0.026 }, { y: 0.22, rx: 0.036, rz: 0.036 }], 7), lam('#e8e2d2'), 0.28 + i * 0.0, 0.0, 0.05 - i * 0.09));
  M.gota = box(0.012, 0.025, 0.012, luz('#5a3a20'), 0, 0.33, 0.06); caf.add(M.gota);
  // prateleira de cigarros atrás do caixa
  loja.add(cbox(0.26, 0.72, 1.62, lam('#2a2c30'), 5.85, 2.25, 3.6, 0.02)); { const cg = pl(1.52, 0.62, lam('#ffffff', { map: tGondola(77, 128, 64, 3), decal: 1 }), 5.715, 2.25, 3.6); cg.rotation.y = -Math.PI / 2; loja.add(cg); }
  // cartazes
  { const cart = pl(0.9, 0.6, lam('#ffffff', { map: placa(48, 32, '#f2e04a', (g, w) => { g.fillStyle = '#c02a1a'; g.fillRect(0, 0, w, 9); g.fillStyle = '#fff'; g.font = 'bold 7px monospace'; g.fillText('PROMOÇÃO', w / 2, 5); g.fillStyle = '#1a1a1a'; g.font = 'bold 9px monospace'; g.fillText('CAFÉ', w / 2, 16); g.fillText('+ PÃO', w / 2, 26); }), decal: 1 }), 5.985, 2.3, 2.9); cart.rotation.y = -Math.PI / 2; loja.add(cart); }
  { const c2 = pl(0.5, 0.36, lam('#ffffff', { map: placa(32, 24, '#f0f0ea', (g, w) => { g.strokeStyle = '#c02a1a'; g.lineWidth = 2; g.beginPath(); g.arc(9, 12, 7, 0, 7); g.moveTo(4, 7); g.lineTo(14, 17); g.stroke(); g.fillStyle = '#1a1a1a'; g.font = 'bold 5px monospace'; g.fillText('PROIBIDO', 23, 9); g.fillText('FUMAR', 23, 16); }), decal: 1 }), -5.985, 2.2, 3.0); c2.rotation.y = Math.PI / 2; loja.add(c2); }
  // TV no canto do teto (frente direita), virada pro meio da loja
  const T = tv(); T.position.set(5.35, 2.42, 0.55); T.rotation.order = 'YXZ'; T.rotation.y = -1.14; T.rotation.x = 0.2; loja.add(T); M.tv = T;
  // porta do estoque (fundo à esquerda) + corredor escuro
  loja.add(cbox(1.22, 0.1, 0.14, lam('#5a5048'), -4.6, 2.25, 9.95, 0.02)); for (const x of [-5.16, -4.04]) loja.add(box(0.07, 2.25, 0.14, lam('#5a5048'), x, 1.12, 9.95));
  const pEst = new THREE.Group(); pEst.position.set(-5.1, 0, 9.97); loja.add(pEst);
  pEst.add(cbox(1.0, 2.2, 0.05, lam('#7a6a58', { map: tex(32, 64, (g) => { g.fillStyle = '#7a6a58'; g.fillRect(0, 0, 32, 64); g.fillStyle = '#5a4c3e'; g.fillRect(4, 4, 24, 24); g.fillRect(4, 36, 24, 24); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(4, 4, 24, 1); g.fillRect(4, 36, 24, 1); g.fillStyle = '#e8e0c8'; g.fillRect(8, 12, 16, 6); g.fillStyle = '#1a1a1a'; g.fillRect(10, 14, 12, 1); g.fillRect(10, 16, 8, 1); mancha(g, 26, 34, 10, 'rgba(20,15,10,A)', 0.5); }) }), 0.5, 1.1, 0, 0.015));
  pEst.add(cbox(0.1, 0.04, 0.06, lam('#b0b4b8'), 0.88, 1.05, -0.05, 0.01)); M.portaEstoque = pEst;
  const est2 = new THREE.Group(); est2.position.set(-4.6, 0, 10); loja.add(est2);
  est2.add(box(1.8, 0.02, 6, lam('#1a1816'), 0, -0.01, 3)); for (let i = 0; i < 5; i++) est2.add(cbox(0.6, 0.5 + (i % 2) * 0.4, 0.5, lam('#4a3a28', { map: tex(16, 16, (g) => { g.fillStyle = '#5a4630'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a2a1a'; g.fillRect(0, 7, 16, 2); g.fillStyle = '#2a1a10'; g.fillRect(3, 2, 5, 3); }) }), (i % 2 ? 0.6 : -0.6), 0.3, 1.2 + i * 0.9, 0.02));
  est2.add(box(0.05, 3, 6, lam('#151412'), -0.9, 1.5, 3)); est2.add(box(0.05, 3, 6, lam('#151412'), 0.9, 1.5, 3)); est2.add(box(1.8, 3, 0.05, lam('#0a0a0a'), 0, 1.5, 6)); est2.add(box(1.8, 0.05, 6, lam('#0e0e0e'), 0, 2.6, 3));
  M.estoque = est2;
  // quadro de chaves com o cadeado
  loja.add(cbox(0.5, 0.4, 0.03, lam('#8a6a40'), -3.3, 1.45, 9.97, 0.01)); M.cadeado = new THREE.Group(); M.cadeado.position.set(-3.3, 1.38, 9.93); loja.add(M.cadeado); M.cadeado.add(cbox(0.07, 0.07, 0.03, lam('#c8a83a'), 0, 0, 0, 0.01)); M.cadeado.add(new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 4, 8, Math.PI), lam('#9aa0a8')).translateY(0.035));
  for (const dx of [-0.18, -0.06, 0.06, 0.18]) loja.add(box(0.025, 0.07, 0.02, lam('#c0c0c0'), -3.3 + dx, 1.58, 9.94));
  // lixeira, tapete, extintor, interruptor
  loja.add(M_(anel([{ y: 0, rx: 0.18, rz: 0.18 }, { y: 0.6, rx: 0.2, rz: 0.2 }], 7), lam('#3a5a3a'), 1.0, 0, 1.0));
  { const tap = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.015, 0.9), lam('#2a2e34', { map: tex(32, 16, (g) => { g.fillStyle = '#2a2e34'; g.fillRect(0, 0, 32, 16); g.fillStyle = '#1e2226'; for (let y = 0; y < 16; y += 2) g.fillRect(0, y, 32, 1); g.fillStyle = '#3a4048'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 15, 32, 1); }) })); tap.position.set(0, 0.0075, 0.8); loja.add(tap); }
  loja.add(M_(anel([{ y: 0, rx: 0.08, rz: 0.08 }, { y: 0.4, rx: 0.08, rz: 0.08 }, { y: 0.46, rx: 0.04, rz: 0.04 }], 7), lam('#8a2a20'), -5.85, 0.38, 1.0));
  loja.add(cbox(0.08, 0.12, 0.03, lam('#e8e4d8'), -5.97, 1.3, 9.4, 0.01).rotateY(Math.PI / 2));

  if (o.fora === false) return M;
  // ======== FORA: pátio, cobertura, bombas, poste, BR, mato, céu ========
  const fora = new THREE.Group(); S.add(fora);
  { const p = pl(34, 16, lam('#ffffff', { ...FX, map: tConcreto() }), 3, 0, -8, 34, 16); p.rotation.x = -Math.PI / 2; fora.add(p); }
  { const p = pl(400, 400, lam('#ffffff', { ...FX, map: tGrama() }), 0, -0.04, -40, 40, 40); p.rotation.x = -Math.PI / 2; fora.add(p); }
  { const p = pl(400, 10, lam('#ffffff', { ...FX, map: tAsfalto() }), 0, 0.01, -21, 200, 5); p.rotation.x = -Math.PI / 2; fora.add(p); }
  // guard-rail do outro lado + postes de sódio
  for (let x = -120; x < 120; x += 4) fora.add(box(0.1, 0.6, 0.1, lam('#5a5c60'), x, 0.3, -26.6)); fora.add(box(240, 0.25, 0.06, lam('#8a8c90'), 0, 0.55, -26.6));
  for (const x of [-22, -4, 14, 32]) { fora.add(cil(0.08, 0.1, 8, lam('#3a3c40'), x, 4, -27.2, 6)); fora.add(box(1.6, 0.08, 0.08, lam('#3a3c40'), x, 8, -26.5)); fora.add(cbox(0.5, 0.12, 0.26, lam('#3a3c40'), x, 8.0, -25.8, 0.03)); fora.add(box(0.4, 0.02, 0.2, luz('#ffcf80'), x, 7.93, -25.8)); const p = new THREE.PointLight(new THREE.Color(SODIO), 40, 16, 1.3); p.position.set(x, 7.5, -24.5); fora.add(p); }
  fora.add(cbox(34, 0.15, 0.4, lam('#8a8880'), 3, 0.075, -15.8, 0.03));   // meio-fio
  // cobertura (luz de sódio amarela = a linha de segurança)
  const cob = new THREE.Group(); fora.add(cob);
  cob.add(box(16, 0.5, 9, lam('#d8d6cc'), 1, 5.3, -8)); cob.add(cbox(16.1, 0.7, 9.1, lam('#2a7a6c'), 1, 5.75, -8, 0.05)); cob.add(box(16.14, 0.15, 9.14, lam('#e2c040'), 1, 5.45, -8));
  for (const [x, z] of [[-5, -4.5], [8, -4.5], [-5, -11.5], [8, -11.5]]) cob.add(cbox(0.42, 5.1, 0.42, lam('#c8c6bc'), x, 2.55, z, 0.06));
  M.sodio = [];
  for (const x of [-4.5, -1, 2.5, 6]) for (const z of [-5.5, -10.5]) cob.add(box(1.4, 0.04, 0.6, luz('#ffe0a0'), x, 5.03, z));
  for (const [x, z] of [[-3.5, -6], [3.5, -6], [-3.5, -11], [3.5, -11]]) { const p = new THREE.PointLight(new THREE.Color(SODIO), 18, 16, 1.4); p.position.set(x, 4.8, z); cob.add(p); M.sodio.push(p); }
  // bombas de combustível (sem marca)
  const tBomba = tex(32, 64, (g) => { g.fillStyle = '#e8e4d8'; g.fillRect(0, 0, 32, 64); g.fillStyle = '#2a7a6c'; g.fillRect(0, 0, 32, 12); g.fillStyle = '#0a1a14'; g.fillRect(5, 18, 22, 14); g.fillStyle = '#90e0a0'; g.fillRect(7, 20, 18, 3); g.fillRect(7, 26, 12, 3); g.fillStyle = '#1a1a1a'; g.fillRect(6, 38, 20, 2); mancha(g, 16, 60, 12, 'rgba(40,30,20,A)', 0.4); });
  for (const x of [-4, 5.5]) { cob.add(cbox(1.2, 0.2, 3, lam('#8a8880'), x, 0.1, -8, 0.04)); for (const z of [-7.2, -8.8]) { cob.add(cbox(0.7, 1.6, 0.4, [lam('#ffffff', { map: tBomba }), lam('#d8d4c8')], x, 1.0, z, 0.05)); cob.add(cbox(0.72, 0.3, 0.42, lam('#2a7a6c'), x, 1.85, z, 0.04)); cob.add(box(0.05, 0.5, 0.05, lam('#1a1a1a'), x + 0.38, 0.9, z)); } }
  // totem de preços (sem marca real)
  const tot = new THREE.Group(); tot.position.set(13, 0, -14.5); fora.add(tot); tot.add(box(0.3, 4, 0.3, lam('#3a3c40'), 0, 2, 0)); tot.add(cbox(2, 2.4, 0.4, lam('#2a7a6c'), 0, 4.8, 0, 0.06));
  const pr = pl(1.8, 2.2, luz('#ffffff', { map: placa(36, 44, '#103a34', (g, w) => { g.fillStyle = '#e2c040'; g.fillRect(0, 0, w, 12); g.fillStyle = '#103a34'; g.font = 'bold 9px monospace'; g.fillText('POSTO', w / 2, 6); g.fillStyle = '#ff9a40'; g.fillRect(4, 18, 28, 8); g.fillRect(4, 30, 28, 8); }), decal: 1 }), 0, 4.8, -0.205); pr.rotation.y = Math.PI; tot.add(pr);
  // poste que pisca (lado esquerdo, antes do mato) + chão de terra iluminado
  { const d = new THREE.Mesh(new THREE.CircleGeometry(8.5, 12), lam('#3e382c', { fixo: true, decal: 1 })); d.rotation.x = -Math.PI / 2; d.position.set(POSTE[0], 0.002, POSTE[1]); fora.add(d); }
  const pos = new THREE.Group(); pos.position.set(POSTE[0], 0, POSTE[1]); fora.add(pos);
  pos.add(cil(0.1, 0.14, 5.6, lam('#4a4c50'), 0, 2.8, 0, 6)); pos.add(box(1.4, 0.1, 0.1, lam('#4a4c50'), 0.6, 5.5, 0));
  const lampOn = luz('#ffd27a'), lampOff = lam('#2a2a2a'); const lamp = cbox(0.5, 0.12, 0.25, lampOn, 1.2, 5.4, 0, 0.03); pos.add(lamp);
  const spot = new THREE.PointLight(new THREE.Color(SODIO), 40, 12, 1.1); spot.position.set(POSTE[0] + 0.6, 4.9, POSTE[1]); fora.add(spot);
  const poca = new THREE.Mesh(new THREE.CircleGeometry(5.6, 16), luz('#ffb04a', { add: true, transparent: true, opacity: 0.5, decal: 3, map: tex(32, 32, (c) => { const gr = c.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.75, 'rgba(255,255,255,.55)'); gr.addColorStop(0.9, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 32, 32); }) })); poca.rotation.x = -Math.PI / 2; poca.position.set(POSTE[0] - 0.3, 0.01, POSTE[1]); fora.add(poca);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(16, 16, (c) => { const gr = c.createRadialGradient(8, 8, 0, 8, 8, 8); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 16, 16); }), color: new THREE.Color('#ffb04a'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.5 })); halo.position.set(POSTE[0] + 1.2, 5.35, POSTE[1]); halo.scale.set(2.2, 2.2, 1); fora.add(halo);
  M.poste = (k) => { lamp.material = k > 0.5 ? lampOn : lampOff; spot.intensity = 40 * k; halo.material.opacity = 0.5 * k; poca.visible = k > 0.5; };
  // mato: pinheiros em cones + moitas em planos cruzados
  const mArv = [lam('#0d1a14'), lam('#0a140f'), lam('#122018')], mTr = lam('#140f0c');
  const tMoita = tex(32, 32, (g) => { g.clearRect(0, 0, 32, 32); const Rr = rnd(77); for (let i = 0; i < 140; i++) { const x = Rr() * 32, y = 8 + Rr() * 24; if (Math.abs(x - 16) > (y - 4) * 0.7) continue; g.fillStyle = Rr() < 0.5 ? '#14241a' : '#0c160f'; g.fillRect(x | 0, y | 0, 2, 3); } });
  const mMoita = lam('#ffffff', { map: tMoita, transparent: false, alphaTest: 0.5, side: THREE.DoubleSide });
  const arv = (x, z, s) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.add(cil(0.12 * s, 0.18 * s, 2 * s, mTr, 0, s, 0, 5)); for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.6 - i * 0.4) * s, 2.2 * s, 6), mArv[Math.abs(i + (x | 0)) % 3]); c.position.y = (2 + i * 1.3) * s; c.rotation.y = R() * 3; g.add(c); } fora.add(g); };
  const moita = (x, z, s) => { for (const ry of [0, Math.PI / 2]) { const p = pl(1.6 * s, 1.4 * s, mMoita, x, 0.7 * s, z); p.rotation.y = ry + R(); fora.add(p); } };
  for (let i = 0; i < 70; i++) arv(-90 + i * 2.6 + R() * 1.5, -30 - R() * 14, 1.2 + R() * 1.2);
  for (let i = 0, n = 0; i < 400 && n < 75; i++) { const x = -13.3 - R() * 26, z = 3 - R() * 24; if (Math.hypot(x - POSTE[0], z - POSTE[1]) < 6.4 || z < -16.2) continue; arv(x, z, 1.1 + R() * 1.1); n++; }
  for (let i = 0, n = 0; i < 300 && n < 40; i++) { const x = -12.5 - R() * 18, z = 2 - R() * 20; if (Math.hypot(x - POSTE[0], z - POSTE[1]) < 5.9 || z < -16.2) continue; moita(x, z, 0.8 + R() * 0.6); n++; }
  for (let i = 0; i < 40; i++) moita(-60 + i * 3 + R(), -28 - R() * 3, 0.9 + R() * 0.5);
  for (let i = 0; i < 22; i++) { const x = 17 + R() * 30, z = 6 - R() * 21; arv(x, z, 0.9 + R() * 1.0); if (i % 2) moita(x + 2, z + 1, 0.8); }
  // céu: azul-petróleo profundo, casando com a neblina
  const ceu = new THREE.Mesh(new THREE.SphereGeometry(220, 12, 8), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: tex(4, 64, (g) => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#02050a'); gr.addColorStop(0.3, '#061220'); gr.addColorStop(0.48, '#0c1a28'); gr.addColorStop(0.52, '#0c1a28'); gr.addColorStop(1, '#05090e'); g.fillStyle = gr; g.fillRect(0, 0, 4, 64); }) }));
  ceu.material.map.magFilter = THREE.LinearFilter; ceu.material.map.minFilter = THREE.LinearFilter; ceu.material.map.generateMipmaps = false; S.add(ceu);
  const sp = new Float32Array(160 * 3); for (let i = 0; i < 160; i++) { const a = R() * 6.28, e = 0.35 + R() * 1.0; sp[i * 3] = Math.cos(a) * Math.cos(e) * 200; sp[i * 3 + 1] = Math.sin(e) * 200; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 200; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); S.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color('#6a8098'), size: 1, sizeAttenuation: false, fog: false })));
  return M;
}
function M_(geo, m, x = 0, y = 0, z = 0) { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); return me; }

// liga/desliga as luminárias (com piscada de uma delas)
export function luzesLoja(M, T, o = {}) {
  const pisca = o.pisca ?? 0, base = o.k ?? 1;
  M.lumis.forEach((l, i) => { const on = i === 7 && pisca > 0 ? (noise(T * 14, 3) > -0.2 + 0.6 * (1 - pisca)) : true; l.material = on && base > 0.3 ? M.mLum : M.mLumOff; });
  M.luzes.forEach((p, i) => { p.intensity = 6 * base * (i === 3 && pisca > 0 ? (0.4 + 0.6 * (noise(T * 14, 3) > 0 ? 1 : 0)) : 1); });
}
// gota da cafeteira
export function pinga(M, T) { const ph = (T * 1.4) % 1; M.gota.position.y = 0.33 - ph * 0.12; M.gota.visible = ph < 0.8; }
