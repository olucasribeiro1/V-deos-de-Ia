// TURNO DA MADRUGADA — o posto na BR-116 em low poly PS1.
// Coordenadas (metros): loja z 0..10 (vidro da frente em z=0, fundo z=10), x -6..6; pátio z -16..0; BR z -26..-16; mato além.
// Olhando pra fora = olhando pra -z; +x fica à direita.
import { THREE, lam, luz, tex, box, cil, pl } from '/series/turno/ps1.js';
import { rng, clamp, lerp, ease, noise, prog } from '/engine/core.js';

const SODIO = '#ffb04a', FLUOR = '#d6f2e2';
export const POSTE = [-10.5, -9];

// ---------- texturas ----------
const tPiso = () => tex(16, 16, (g) => { g.fillStyle = '#c9c7bc'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#b4b2a6'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); g.fillStyle = '#8e8c84'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16); }, [12, 10]);
const tTeto = () => tex(16, 16, (g) => { g.fillStyle = '#b8bab4'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#8a8c86'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16); g.fillStyle = '#a4a6a0'; for (let i = 0; i < 10; i++) g.fillRect((i * 7) % 15 + 1, (i * 5) % 15 + 1, 1, 1); }, [10, 8]);
const tParede = () => tex(32, 32, (g) => { g.fillStyle = '#d8d6c8'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#2f8a7a'; g.fillRect(0, 20, 32, 5); g.fillStyle = '#e2c040'; g.fillRect(0, 25, 32, 2); g.fillStyle = '#9a9a90'; g.fillRect(0, 27, 32, 5); }, [6, 1]);
const tConcreto = () => tex(32, 32, (g) => { g.fillStyle = '#6a6862'; g.fillRect(0, 0, 32, 32); const r = rng(4); for (let i = 0; i < 90; i++) { g.fillStyle = r() < 0.5 ? '#5e5c57' : '#75736c'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 1); } g.fillStyle = '#4a4844'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32); g.fillStyle = '#3e3c38'; g.fillRect(10, 12, 7, 4); g.fillRect(12, 11, 3, 6); }, [10, 5]);
const tAsfalto = () => tex(32, 32, (g) => { g.fillStyle = '#2c2d30'; g.fillRect(0, 0, 32, 32); const r = rng(7); for (let i = 0; i < 120; i++) { g.fillStyle = r() < 0.5 ? '#26272a' : '#343539'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1); } }, [40, 3]);
const tProdutos = (seed) => tex(32, 16, (g) => { const r = rng(seed), cs = ['#d84a3a', '#e8c040', '#3a7ad0', '#40a050', '#f08a2a', '#e8e0d0', '#8a4ab0', '#30b0b0', '#c03070']; g.fillStyle = '#2a2622'; g.fillRect(0, 0, 32, 16); let x = 0; while (x < 32) { const w = 2 + (r() * 3 | 0), h = 8 + (r() * 7 | 0), c = cs[r() * cs.length | 0]; g.fillStyle = c; g.fillRect(x, 16 - h, w, h); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, 16 - h, 1, h); x += w; } });
const tGeladeira = (seed) => tex(16, 32, (g) => { const r = rng(seed), cs = ['#d03a2a', '#2a6ad0', '#e8e0d0', '#40b050', '#f0b030', '#7a3a1a', '#a0d0f0']; g.fillStyle = '#cfe8f0'; g.fillRect(0, 0, 16, 32); for (let s = 0; s < 4; s++) { const y = 2 + s * 8; g.fillStyle = '#8aa0a8'; g.fillRect(0, y + 6, 16, 1); for (let x = 1; x < 15; x += 2) { g.fillStyle = cs[r() * cs.length | 0]; g.fillRect(x, y + 1 + (r() * 2 | 0), 1, 5); } } g.fillStyle = '#5a6a70'; g.fillRect(0, 0, 1, 32); g.fillRect(15, 0, 1, 32); });

// ---------- TV de tubo com tela trocável ----------
export function tv() {
  const W = 96, H = 72; const t = tex(W, H, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }); t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; const g = t.g;
  const grp = new THREE.Group();
  grp.add(box(0.72, 0.56, 0.5, lam('#2a2a2c'), 0, 0, -0.08));
  grp.add(box(0.66, 0.06, 0.04, lam('#1c1c1e'), 0, -0.25, 0.18));
  const tela = pl(0.56, 0.42, luz('#ffffff', { map: t, fog: false }), -0.02, 0.02, 0.171); grp.add(tela);
  grp.add(box(0.06, 0.04, 0.02, luz('#40ff60'), 0.29, -0.24, 0.2));
  // suporte no teto
  grp.add(box(0.06, 0.5, 0.06, lam('#3a3a3c'), 0, 0.5, -0.1));
  const R = rng(9);
  grp.tela = (modo, T) => {
    g.save();
    if (modo === 'novela') {
      // novela: sala com duas pessoas conversando, cores quentes
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
    // linhas de varredura
    g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
    g.restore(); t.needsUpdate = true;
  };
  return grp;
}

// ---------- carro sem farol (contramão) ----------
export function carro() {
  const g = new THREE.Group(), lat = lam('#20262c'), vid = lam('#07090c'), pneu = lam('#0b0b0c');
  g.add(box(4.2, 0.65, 1.8, lat, 0, 0.6, 0)); g.add(box(2.2, 0.55, 1.6, vid, 0.2, 1.2, 0)); g.add(box(2.0, 0.08, 1.62, lat, 0.2, 1.5, 0));
  for (const [x, z] of [[-1.3, 0.85], [1.3, 0.85], [-1.3, -0.85], [1.3, -0.85]]) { const w = cil(0.33, 0.33, 0.24, pneu, x, 0.33, z, 8); w.rotation.x = Math.PI / 2; g.add(w); }
  g.add(box(0.1, 0.12, 1.6, lam('#3a1010'), 2.1, 0.75, 0));      // lanterna apagada
  // a "coisa" presa no para-choque (vai na frente, lado -x)
  const coisa = new THREE.Group(); coisa.add(box(0.9, 0.35, 0.6, lam('#1a1512'), -2.5, 0.2, 0.1)); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), lam('#2a1a16')); b.position.set(-2.8, 0.25, -0.3); b.scale.set(1.3, 0.6, 1); coisa.add(b);
  coisa.add(box(0.7, 0.12, 0.18, lam('#3a2a22'), -2.9, 0.12, 0.5)); g.add(coisa);
  return g;
}
// faíscas: pontos aditivos nascendo no para-choque (posição do carro em função do tempo)
export function faiscas(n = 90) {
  const pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color('#ffc060'), size: 2.2, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  p.frustumCulled = false; const R = rng(5), base = []; for (let i = 0; i < n; i++) base.push([R(), R(), R(), R()]);
  // carX(t) -> posição x da frente do carro; ativo: [t0, t1]
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

// ---------- caminhão cara-chata do Seu Alberto ----------
export function caminhao() {
  const g = new THREE.Group(), cab = lam('#c8c2b0'), faixa = lam('#2a5a8a'), pneu = lam('#0b0b0c'), bau = lam('#8a8e94');
  g.add(box(2.2, 2.4, 2.4, cab, 0, 1.9, 0)); g.add(box(2.22, 0.25, 2.42, faixa, 0, 1.3, 0));
  g.add(box(0.05, 0.9, 2.1, lam('#0a1014'), 1.11, 2.5, 0));   // para-brisa (frente = +x)
  g.add(box(6.5, 2.9, 2.5, bau, -4.5, 2.25, 0)); g.add(box(8.8, 0.3, 2.2, lam('#2a2a2c'), -3.4, 0.75, 0));
  for (const x of [0.2, -5.2, -6.4]) for (const z of [1.05, -1.05]) { const w = cil(0.5, 0.5, 0.35, pneu, x, 0.5, z, 8); w.rotation.x = Math.PI / 2; g.add(w); }
  const farois = []; for (const z of [0.75, -0.75]) { const f = box(0.06, 0.18, 0.32, luz('#fff2c0'), 1.12, 1.0, z); g.add(f); farois.push(f); }
  const lant = []; for (const z of [1.0, -1.0]) { const f = box(0.06, 0.15, 0.25, luz('#ff3020'), -7.76, 0.9, z); g.add(f); lant.push(f); }
  g.farois = farois; g.lant = lant; return g;
}

// ---------- clarão e fumaça da batida no horizonte ----------
export function batida(pos = [75, 0, -70]) {
  const g = new THREE.Group(); g.position.set(...pos);
  const sprite = tex(16, 16, (c) => { const gr = c.createRadialGradient(8, 8, 0, 8, 8, 8); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 16, 16); });
  const brilho = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color: new THREE.Color('#ff8a2a'), blending: THREE.AdditiveBlending, fog: false, depthWrite: false, transparent: true })); brilho.scale.set(40, 22, 1); brilho.position.y = 4; g.add(brilho);
  const fogo = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color: new THREE.Color('#ffd070'), blending: THREE.AdditiveBlending, fog: false, depthWrite: false, transparent: true })); fogo.scale.set(8, 6, 1); fogo.position.y = 2; g.add(fogo);
  const fumaca = []; const smk = tex(16, 16, (c) => { const r = rng(3); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${60 + r() * 30 | 0},${55 + r() * 25 | 0},${55 + r() * 20 | 0},${0.5 + r() * 0.5})`; const a = r() * 6.28, d = r() * 6; c.fillRect(8 + Math.cos(a) * d - 2 | 0, 8 + Math.sin(a) * d - 2 | 0, 4, 4); } });
  for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smk, color: new THREE.Color('#6a5a52'), transparent: true, fog: false, depthWrite: false })); g.add(s); fumaca.push(s); }
  g.visible = false;
  // k: 0..1 desde a explosão; baixa: quanto a fumaça já baixou
  g.update = (T, t0, baixa = 0) => {
    const k = T - t0; g.visible = k > 0; if (k <= 0) return;
    const flash = Math.exp(-k * 2.2), fl = 0.75 + 0.25 * noise(T * 6, 2);
    brilho.material.opacity = clamp(0.25 + 0.75 * flash) * fl * (1 - 0.5 * baixa); brilho.scale.set(40 + 30 * flash, 20 + 16 * flash, 1);
    fogo.material.opacity = clamp(0.5 + flash) * fl * (1 - 0.3 * baixa); fogo.scale.set(6 + 10 * flash, 5 + 8 * flash, 1);
    fumaca.forEach((s, i) => { const ph = ((k * 0.12 + i / 9) % 1); s.position.set(Math.sin(i * 2.1) * 3 + ph * 8, 3 + ph * 30 * (1 - 0.5 * baixa), Math.cos(i * 1.7) * 3); const sc = 6 + ph * 18; s.scale.set(sc, sc, 1); s.material.opacity = clamp(k * 0.5) * Math.sin(ph * Math.PI) * 0.85 * (1 - 0.6 * baixa); s.material.color.setRGB(0.42 + 0.3 * (1 - ph) * fl, 0.36 + 0.12 * (1 - ph), 0.32); });
  };
  return g;
}

// ---------- o mundo todo ----------
// o: { fora: true (pátio/BR/mato), loja: true }
export function posto(st, o = {}) {
  const S = st.scene, R = rng(11), M = {};
  S.add(new THREE.HemisphereLight(new THREE.Color('#33465a'), new THREE.Color('#0a0c10'), 0.55));
  // ======== LOJA ========
  const loja = new THREE.Group(); S.add(loja);
  const piso = pl(12, 10, lam('#ffffff', { map: tPiso(), flat: false }), 0, 0, 5); piso.rotation.x = -Math.PI / 2; loja.add(piso);
  const teto = pl(12, 10, lam('#ffffff', { map: tTeto(), flat: false }), 0, 3, 5); teto.rotation.x = Math.PI / 2; loja.add(teto);
  const mPar = lam('#ffffff', { map: tParede() }), mPar2 = lam('#ffffff', { map: tParede() }); mPar2.map = tParede(); mPar2.map.repeat.set(5, 1);
  const pe = pl(10, 3, mPar, -6, 1.5, 5); pe.rotation.y = Math.PI / 2; loja.add(pe);
  const pd = pl(10, 3, mPar, 6, 1.5, 5); pd.rotation.y = -Math.PI / 2; loja.add(pd);
  const pf = pl(12, 3, mPar2, 0, 1.5, 10); pf.rotation.y = Math.PI; loja.add(pf);
  // fachada de vidro (z=0): montantes, faixa superior, vidro levemente azulado
  const mont = lam('#3a3e44');
  for (const x of [-6, -4, -2, -0.55, 0.55, 2, 4, 6]) loja.add(box(0.09, 3, 0.12, mont, x, 1.5, 0));
  loja.add(box(12, 0.5, 0.15, lam('#2f8a7a'), 0, 2.75, 0)); loja.add(box(12, 0.1, 0.14, mont, 0, 0.05, 0)); loja.add(box(12, 0.06, 0.13, mont, 0, 1.05, 0.01));
  const vidro = luz('#9ec8d8', { transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide });
  for (const [x, w] of [[-5, 2], [-3, 2], [-1.275, 1.45], [1.275, 1.45], [3, 2], [5, 2]]) loja.add(pl(w - 0.1, 2.5, vidro, x, 1.25, 0));
  // porta de vidro (dobradiça em x=-0.55; abre pra fora, -z)
  const porta = new THREE.Group(); porta.position.set(-0.55, 0, 0); loja.add(porta);
  porta.add(box(0.06, 2.5, 0.06, mont, 0.03, 1.25, 0), box(0.06, 2.5, 0.06, mont, 1.07, 1.25, 0), box(1.1, 0.06, 0.06, mont, 0.55, 2.5, 0), box(1.1, 0.12, 0.06, mont, 0.55, 0.06, 0), box(0.5, 0.04, 0.05, lam('#c0c4c8'), 0.55, 1.1, -0.05));
  porta.add(pl(1.0, 2.4, vidro, 0.55, 1.25, 0));
  porta.add(pl(0.34, 0.1, luz('#e8e0b0', { map: tex(16, 4, (g) => { g.fillStyle = '#d8d0a0'; g.fillRect(0, 0, 16, 4); g.fillStyle = '#202020'; g.fillRect(2, 1, 12, 2); }) }), 0.55, 1.3, 0.02));
  M.porta = porta;
  // letreiro 24H em neon verde, pendurado no vidro
  const neon = pl(0.9, 0.36, luz('#ffffff', { map: tex(24, 10, (g) => { g.fillStyle = '#05140c'; g.fillRect(0, 0, 24, 10); g.fillStyle = '#5cff9a'; g.font = 'bold 9px monospace'; g.textBaseline = 'top'; g.fillText('24H', 3, 0); }) }), 3.0, 2.1, 0.08); loja.add(neon); M.neon = neon;
  // luminárias fluorescentes + luzes
  M.lumis = [];
  const mLum = luz('#eefcf4'), mLumOff = luz('#3a4440');
  for (const x of [-3, 0, 3]) for (const z of [2, 5, 8]) { const l = box(1.3, 0.06, 0.32, mLum, x, 2.96, z); loja.add(l); loja.add(box(1.4, 0.04, 0.4, lam('#9a9c98'), x, 2.99, z)); M.lumis.push(l); }
  M.luzes = [];
  for (const [x, z] of [[-3, 2.5], [2.5, 2.5], [-2.5, 7.5], [2.5, 7.5]]) { const p = new THREE.PointLight(new THREE.Color(FLUOR), 7, 11, 1.2); p.position.set(x, 2.7, z); loja.add(p); M.luzes.push(p); }
  M.mLum = mLum; M.mLumOff = mLumOff;
  // gôndolas
  for (const gx of [-3.2, -0.4]) {
    const gd = new THREE.Group(); gd.position.set(gx, 0, 5); loja.add(gd);
    gd.add(box(0.9, 0.12, 5, lam('#3a3e46'), 0, 0.06, 0)); gd.add(box(0.12, 1.65, 5, lam('#d0d2d4'), 0, 0.82, 0)); gd.add(box(0.95, 0.06, 5.1, lam('#2f8a7a'), 0, 1.68, 0));
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
      const y = 0.2 + i * 0.38; gd.add(box(0.4, 0.03, 5, lam('#c4c6c8'), s * 0.25, y, 0));
      const pp = pl(4.9, 0.32, lam('#ffffff', { map: tProdutos(Math.floor(gx * 10) + i * 7 + s * 3), flat: false }), s * 0.42, y + 0.18, 0); pp.rotation.y = s * Math.PI / 2; gd.add(pp);
      for (let k = 0; k < 7; k++) { const c = ['#d84a3a', '#e8c040', '#3a7ad0', '#40a050', '#f08a2a', '#8a4ab0'][(i + k + (s > 0 ? 2 : 0)) % 6]; gd.add(box(0.22, 0.18 + (k % 3) * 0.05, 0.3, lam(c), s * 0.3, y + 0.12, -2.1 + k * 0.7)); }
    }
  }
  // prateleira da parede esquerda
  for (let i = 0; i < 4; i++) { loja.add(box(0.4, 0.03, 7, lam('#c4c6c8'), -5.8, 0.3 + i * 0.4, 5.5)); const pp = pl(7, 0.34, lam('#ffffff', { map: tProdutos(90 + i), flat: false }), -5.6, 0.48 + i * 0.4, 5.5); pp.rotation.y = Math.PI / 2; pp.material.map.repeat.set(3, 1); pp.material.map.wrapS = THREE.RepeatWrapping; loja.add(pp); }
  // geladeiras no fundo (portas que brilham)
  M.geladeiras = [];
  for (let i = 0; i < 6; i++) { const x = -1.6 + i * 1.15; loja.add(box(1.15, 2.2, 0.8, lam('#c8ccd0'), x, 1.1, 9.55)); const p = pl(1.0, 1.9, luz('#ffffff', { map: tGeladeira(30 + i) }), x, 1.12, 9.14); p.rotation.y = Math.PI; loja.add(p); loja.add(box(0.04, 0.6, 0.05, lam('#9aa0a8'), x + 0.42, 1.2, 9.1)); M.geladeiras.push(p); }
  const pg = new THREE.PointLight(new THREE.Color('#bfe6ff'), 3, 4, 1.5); pg.position.set(1.3, 1.4, 8.4); loja.add(pg);
  // balcão do caixa (frente em z=1.85; atendente atrás em z~2.9)
  loja.add(box(3.2, 1.0, 0.7, lam('#2f8a7a'), 3.4, 0.5, 2.2)); loja.add(box(3.3, 0.06, 0.8, lam('#d0ccc0'), 3.4, 1.03, 2.2)); loja.add(box(3.2, 0.12, 0.05, lam('#e2c040'), 3.4, 0.8, 1.84));
  loja.add(box(0.7, 1.0, 0.7, lam('#2f8a7a'), 1.45, 0.5, 2.55));
  // caixa registradora
  const reg = new THREE.Group(); reg.position.set(2.8, 1.06, 2.25); loja.add(reg); reg.add(box(0.42, 0.14, 0.38, lam('#2a2c30'), 0, 0.07, 0)); reg.add(box(0.36, 0.22, 0.04, lam('#3a3c40'), 0, 0.26, -0.1)); reg.add(pl(0.28, 0.12, luz('#7aff9a'), 0, 0.28, -0.125)); reg.children[2].rotation.y = Math.PI;
  // estufa de salgados com coxinhas (luz quente)
  const est = new THREE.Group(); est.position.set(4.3, 1.06, 2.2); loja.add(est);
  est.add(box(0.9, 0.06, 0.5, lam('#3a3c40'), 0, 0.03, 0)); est.add(box(0.9, 0.05, 0.5, lam('#3a3c40'), 0, 0.5, 0));
  est.add(box(0.9, 0.42, 0.5, luz('#ffcf8a', { transparent: true, opacity: 0.18, depthWrite: false }), 0, 0.27, 0));
  const mCox = lam('#d08a3a', { emissive: '#4a2208' });
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.13, 5), mCox); c.position.set(-0.3 + i * 0.12, 0.13, (i % 2) * 0.1 - 0.05); est.add(c); }
  for (let i = 0; i < 3; i++) est.add(box(0.12, 0.05, 0.08, lam('#e0b060', { emissive: '#3a2008' }), -0.25 + i * 0.25, 0.3, 0));
  const pe2 = new THREE.PointLight(new THREE.Color('#ffb060'), 1.6, 2.2, 1.5); pe2.position.set(4.3, 1.35, 2.0); loja.add(pe2);
  M.coxinha = c => c;
  // cafeteira na parede direita, atrás do caixa
  const caf = new THREE.Group(); caf.position.set(5.6, 1.0, 3.6); caf.rotation.y = -Math.PI / 2; loja.add(caf);
  loja.add(box(0.7, 1.0, 1.6, lam('#5a4a3a'), 5.62, 0.5, 3.6)); loja.add(box(0.75, 0.05, 1.65, lam('#d0ccc0'), 5.6, 1.02, 3.6));
  caf.add(box(0.5, 0.65, 0.4, lam('#202226'), 0, 0.37, 0)); caf.add(box(0.3, 0.06, 0.06, luz('#ff9a30'), 0, 0.55, 0.21)); caf.add(cil(0.09, 0.08, 0.16, lam('#3a2a1e', { emissive: '#1a0c04' }), 0, 0.12, 0.08, 6));
  M.gota = box(0.015, 0.03, 0.015, luz('#5a3a20'), 0, 0.2, 0.08); caf.add(M.gota);
  // prateleira de cigarros atrás do caixa
  loja.add(box(2.2, 0.9, 0.25, lam('#2a2c30'), 3.6, 1.95, 3.85)); const cg = pl(2.1, 0.8, lam('#ffffff', { map: tProdutos(77) }), 3.6, 1.95, 3.72); cg.rotation.y = Math.PI; loja.add(cg);
  // cartaz de promoção
  const cart = pl(0.9, 0.6, lam('#ffffff', { map: tex(24, 16, (g) => { g.fillStyle = '#f2e04a'; g.fillRect(0, 0, 24, 16); g.fillStyle = '#1a1a1a'; g.font = 'bold 6px monospace'; g.textBaseline = 'top'; g.fillText('CAFÉ', 2, 1); g.fillText('+PÃO', 2, 8); }) }), 5.95, 2.2, 5.5); cart.rotation.y = -Math.PI / 2; loja.add(cart);
  // TV no canto do teto (frente direita), virada pro meio da loja
  const T = tv(); T.position.set(5.35, 2.42, 0.55); T.rotation.y = -2.2; T.rotation.x = -0.18; loja.add(T); M.tv = T;
  // porta do estoque (fundo à esquerda) + corredor escuro
  loja.add(box(1.2, 0.1, 0.12, lam('#5a5048'), -4.6, 2.25, 9.95));
  const pEst = new THREE.Group(); pEst.position.set(-5.1, 0, 9.97); loja.add(pEst);
  pEst.add(box(1.0, 2.2, 0.05, lam('#7a6a58', { map: tex(8, 16, (g) => { g.fillStyle = '#7a6a58'; g.fillRect(0, 0, 8, 16); g.fillStyle = '#5a4c3e'; g.fillRect(1, 1, 6, 6); g.fillRect(1, 9, 6, 6); g.fillStyle = '#c8c0a0'; g.fillRect(2, 3, 4, 1); }) }), 0.5, 1.1, 0));
  pEst.add(box(0.06, 0.06, 0.1, lam('#b0b4b8'), 0.88, 1.05, -0.05)); M.portaEstoque = pEst;
  // escuridão do estoque: caixas, prateleiras, e um vulto lá no fundo
  const est2 = new THREE.Group(); est2.position.set(-4.6, 0, 10); loja.add(est2);
  est2.add(box(1.8, 0.01, 6, lam('#1a1816'), 0, 0.005, 3)); for (let i = 0; i < 5; i++) est2.add(box(0.6, 0.5 + (i % 2) * 0.4, 0.5, lam('#4a3a28'), (i % 2 ? 0.6 : -0.6), 0.3, 1.2 + i * 0.9));
  est2.add(box(0.05, 3, 6, lam('#151412'), -0.9, 1.5, 3)); est2.add(box(0.05, 3, 6, lam('#151412'), 0.9, 1.5, 3)); est2.add(box(1.8, 3, 0.05, lam('#0a0a0a'), 0, 1.5, 6)); est2.add(box(1.8, 0.05, 6, lam('#0e0e0e'), 0, 2.6, 3));
  M.estoque = est2;
  // quadro de chaves com o cadeado
  loja.add(box(0.5, 0.4, 0.03, lam('#8a6a40'), -3.3, 1.45, 9.97)); M.cadeado = new THREE.Group(); M.cadeado.position.set(-3.3, 1.38, 9.93); loja.add(M.cadeado); M.cadeado.add(box(0.07, 0.07, 0.03, lam('#c8a83a'))); for (const dx of [-0.15, 0.13]) loja.add(box(0.03, 0.08, 0.02, lam('#c0c0c0'), -3.3 + dx, 1.5, 9.94));
  // lixeira, tapete, extintor
  loja.add(cil(0.2, 0.18, 0.6, lam('#3a5a3a'), 1.0, 0.3, 1.0, 6)); const tap = pl(1.6, 0.9, lam('#2a2e34'), 0, 0.01, 0.8); tap.rotation.x = -Math.PI / 2; loja.add(tap);
  loja.add(cil(0.08, 0.08, 0.45, lam('#b02a20'), -5.85, 0.6, 1.0, 6));

  if (o.fora === false) return M;
  // ======== FORA: pátio, cobertura, bombas, poste, BR, mato, céu ========
  const fora = new THREE.Group(); S.add(fora);
  const pat = pl(34, 16, lam('#ffffff', { map: tConcreto(), flat: false }), 3, 0, -8); pat.rotation.x = -Math.PI / 2; fora.add(pat);
  const terra = pl(400, 400, lam('#0c120e'), 0, -0.02, -40); terra.rotation.x = -Math.PI / 2; fora.add(terra);
  const br = pl(400, 10, lam('#ffffff', { map: tAsfalto(), flat: false }), 0, 0.01, -21); br.rotation.x = -Math.PI / 2; fora.add(br);
  const mFx = lam('#d8d8cc'), mAm = lam('#d8b030');
  for (let x = -200; x < 200; x += 6) { const f = pl(3, 0.15, mAm, x, 0.02, -21); f.rotation.x = -Math.PI / 2; fora.add(f); }
  for (const z of [-16.4, -25.6]) { const f = pl(400, 0.15, mFx, 0, 0.02, z); f.rotation.x = -Math.PI / 2; fora.add(f); }
  // guard-rail do outro lado
  for (let x = -120; x < 120; x += 4) fora.add(box(0.1, 0.6, 0.1, lam('#5a5c60'), x, 0.3, -26.6)); fora.add(box(240, 0.25, 0.06, lam('#8a8c90'), 0, 0.55, -26.6));
  // calçada do posto
  fora.add(box(34, 0.15, 0.4, lam('#8a8880'), 3, 0.07, -15.8));
  // cobertura (luz de sódio amarela = a linha de segurança)
  const cob = new THREE.Group(); fora.add(cob);
  cob.add(box(16, 0.5, 9, lam('#d8d6cc'), 1, 5.3, -8)); cob.add(box(16.1, 0.7, 9.1, lam('#2f8a7a'), 1, 5.75, -8)); cob.add(box(16.12, 0.15, 9.12, lam('#e2c040'), 1, 5.45, -8));
  for (const [x, z] of [[-6, -4.5], [8, -4.5], [-6, -11.5], [8, -11.5]]) cob.add(box(0.4, 5.1, 0.4, lam('#c8c6bc'), x, 2.55, z));
  M.sodio = [];
  for (const x of [-4.5, -1, 2.5, 6]) for (const z of [-5.5, -10.5]) { const l = box(1.4, 0.05, 0.6, luz('#ffd890'), x, 5.03, z); cob.add(l); }
  for (const [x, z] of [[-3.5, -6], [3.5, -6], [-3.5, -11], [3.5, -11]]) { const p = new THREE.PointLight(new THREE.Color(SODIO), 18, 16, 1.4); p.position.set(x, 4.8, z); cob.add(p); M.sodio.push(p); }
  // bombas
  for (const x of [-2.2, 3.8]) { cob.add(box(1.2, 0.2, 3, lam('#8a8880'), x, 0.1, -8)); for (const z of [-7.2, -8.8]) { cob.add(box(0.7, 1.6, 0.4, lam('#e8e4d8'), x, 1.0, z)); cob.add(box(0.72, 0.3, 0.42, lam('#2f8a7a'), x, 1.65, z)); const tl = pl(0.4, 0.22, luz('#90e0a0'), x, 1.2, z - 0.205); tl.rotation.y = Math.PI; cob.add(tl); const tl2 = pl(0.4, 0.22, luz('#90e0a0'), x, 1.2, z + 0.205); cob.add(tl2); cob.add(box(0.05, 0.5, 0.05, lam('#1a1a1a'), x + 0.38, 0.9, z)); } }
  // totem de preços (sem marca real)
  const tot = new THREE.Group(); tot.position.set(13, 0, -14.5); fora.add(tot); tot.add(box(0.3, 4, 0.3, lam('#3a3c40'), 0, 2, 0)); tot.add(box(2, 2.4, 0.4, lam('#2f8a7a'), 0, 4.8, 0));
  const pr = pl(1.8, 2.2, luz('#ffffff', { map: tex(18, 22, (g) => { g.fillStyle = '#103a34'; g.fillRect(0, 0, 18, 22); g.fillStyle = '#e2c040'; g.fillRect(0, 0, 18, 6); g.fillStyle = '#103a34'; g.font = 'bold 5px monospace'; g.textBaseline = 'top'; g.fillText('POSTO', 2, 0); g.fillStyle = '#ff9a40'; g.fillRect(2, 9, 14, 4); g.fillRect(2, 15, 14, 4); }) }), 0, 4.8, -0.21); pr.rotation.y = Math.PI; tot.add(pr);
  // poste que pisca (lado esquerdo, antes do mato)
  const pos = new THREE.Group(); pos.position.set(POSTE[0], 0, POSTE[1]); fora.add(pos);
  pos.add(cil(0.1, 0.14, 7.2, lam('#4a4c50'), 0, 3.6, 0, 5)); pos.add(box(1.4, 0.1, 0.1, lam('#4a4c50'), 0.6, 7.1, 0));
  const lampOn = luz('#ffd27a'), lampOff = lam('#2a2a2a'); const lamp = box(0.5, 0.12, 0.25, lampOn, 1.2, 7.0, 0); pos.add(lamp);
  const spot = new THREE.SpotLight(new THREE.Color(SODIO), 120, 16, 0.62, 0.35, 1.3); spot.position.set(POSTE[0] + 1.2, 6.9, POSTE[1]); spot.target.position.set(POSTE[0] - 0.5, 0, POSTE[1]); fora.add(spot, spot.target);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(16, 16, (c) => { const gr = c.createRadialGradient(8, 8, 0, 8, 8, 8); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 16, 16); }), color: new THREE.Color('#ffb04a'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.5 })); halo.position.set(POSTE[0] + 1.2, 6.9, POSTE[1]); halo.scale.set(2.2, 2.2, 1); fora.add(halo);
  M.poste = (k) => { lamp.material = k > 0.5 ? lampOn : lampOff; spot.intensity = 120 * k; halo.material.opacity = 0.5 * k; };
  // mato: pinheiros/árvores escuras low poly
  const mArv = [lam('#0d1a14'), lam('#0a140f'), lam('#122018')], mTr = lam('#140f0c');
  const arv = (x, z, s) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.add(cil(0.12 * s, 0.18 * s, 2 * s, mTr, 0, s, 0, 4)); for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.6 - i * 0.4) * s, 2.2 * s, 5), mArv[(i + (x | 0)) % 3]); c.position.y = (2 + i * 1.3) * s; c.rotation.y = R() * 3; g.add(c); } fora.add(g); };
  // mato além da BR
  for (let i = 0; i < 70; i++) arv(-90 + i * 2.6 + R() * 1.5, -30 - R() * 14, 1.2 + R() * 1.2);
  // mato do lado esquerdo do posto: começa logo depois do círculo de luz do poste
  for (let i = 0; i < 60; i++) { const a = R() * 6.28, x = -15.5 - R() * 22, z = 2 - R() * 18; arv(x, z, 1.1 + R() * 1.1); }
  for (let i = 0; i < 12; i++) arv(-15 - R() * 0.8, 1 - i * 1.5, 1.2 + R() * 0.6);
  // lado direito, longe: campo aberto com poucas árvores (a cidade fica pra lá)
  for (let i = 0; i < 18; i++) arv(22 + R() * 50, -2 - R() * 14 - (i % 3) * 6, 0.9 + R());
  // céu: gradiente azul-petróleo -> preto + estrelas
  const ceu = new THREE.Mesh(new THREE.SphereGeometry(220, 12, 8), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: tex(4, 64, (g) => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#010103'); gr.addColorStop(0.36, '#03070d'); gr.addColorStop(0.5, '#0c2230'); gr.addColorStop(0.53, '#06121a'); gr.addColorStop(1, '#020305'); g.fillStyle = gr; g.fillRect(0, 0, 4, 64); }) }));
  ceu.material.map.magFilter = THREE.LinearFilter; ceu.material.map.minFilter = THREE.LinearFilter; ceu.material.map.generateMipmaps = false; S.add(ceu);
  const sp = new Float32Array(240 * 3); for (let i = 0; i < 240; i++) { const a = R() * 6.28, e = 0.15 + R() * 1.2; sp[i * 3] = Math.cos(a) * Math.cos(e) * 200; sp[i * 3 + 1] = Math.sin(e) * 200; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 200; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); S.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color('#8aa0b0'), size: 1, sizeAttenuation: false, fog: false })));
  return M;
}

// liga/desliga as luminárias (com piscada de uma delas)
export function luzesLoja(M, T, o = {}) {
  const pisca = o.pisca ?? 0, base = o.k ?? 1;
  M.lumis.forEach((l, i) => { const on = i === 7 && pisca > 0 ? (noise(T * 14, 3) > -0.2 + 0.6 * (1 - pisca)) : true; l.material = on && base > 0.3 ? M.mLum : M.mLumOff; });
  M.luzes.forEach((p, i) => { p.intensity = 7 * base * (i === 3 && pisca > 0 ? (0.4 + 0.6 * (noise(T * 14, 3) > 0 ? 1 : 0)) : 1); });
}
// gota da cafeteira
export function pinga(M, T) { const ph = (T * 1.4) % 1; M.gota.position.y = 0.2 - ph * 0.12; M.gota.visible = ph < 0.8; }
