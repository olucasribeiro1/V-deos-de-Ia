// A ESTAÇÃO — o calçadão do centro de São Paulo À NOITE, em duas versões:
//  normal: movimento, luz de sódio, vitrines e letreiros acesos, ônibus/carros/motoboy de farol aceso, gente andando, fios de poste
//  outro : a MESMA rua errada — postes mortos ou piscando (os poucos que funcionam em cinza-esverdeado), letreiros apagados,
//          carros parados no meio da rua de porta aberta, semáforo piscando amarelo, banca fechada, poeira parada no ar, névoa,
//          relógio de rua marcando 25:71.
// Eixos: a rua corre em x; calçada da direita (de quem anda pra +x) em z ∈ [-0.5, 4.5] (y=0), fachadas em z=4.5;
// leito z ∈ [-9, -0.5] (y=-0.15); calçada oposta z ∈ [-12,-9], fachadas em z=-12. Boca do metrô: x ∈ [11.5,16.5], z ∈ [1.1,2.9].
import { THREE, lam, luz, tex, rnd, mancha, cbox, box, cil, pl } from '/series/turno/ps1.js';
import { pessoa, pedestre, mat } from '/series/estacao/elenco.js';
import { clamp, lerp, noise } from '/engine/core.js';

const FX = { fixo: true, flat: false };
export const placa = (w, h, fundo, draw) => tex(w, h, (g) => { g.fillStyle = fundo; g.fillRect(0, 0, w, h); g.textBaseline = 'middle'; g.textAlign = 'center'; draw(g, w, h); });
export const METRO = { x0: 11.5, x1: 16.5, z0: 1.1, z1: 2.9, fundo: -2.9 };
export const stairY = (x) => -clamp((x - METRO.x0) / (METRO.x1 - METRO.x0)) * (-METRO.fundo);

// ---------- texturas ----------
const tCalcada = () => tex(128, 128, (g, w, h) => {   // mosaico português preto e branco (ondas), pedras miúdas
  const R = rnd(12); g.fillStyle = '#c8c2b4'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const onda = Math.sin((x / w) * 6.283 * 2 + Math.sin(y / h * 6.283) * 1.2) * 0.5 + 0.5; const pr = Math.abs(((y / h) * 4 + onda * 0.9) % 1 - 0.5) < 0.14; const v = (R() - 0.5) * 30; g.fillStyle = pr ? `rgb(${40 + v},${40 + v},${42 + v})` : `rgb(${200 + v},${194 + v},${182 + v})`; g.fillRect(x, y, 2, 2); }
  for (let i = 0; i < 14; i++) mancha(g, R() * w, R() * h, 6 + R() * 12, 'rgba(40,30,20,A)', 0.25);
  for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(90,80,70,.6)'; g.fillRect(R() * w | 0, R() * h | 0, 2, 2); }   // chiclete
}, [24, 3]);
const tAsfalto = () => tex(128, 128, (g, w, h) => {
  const R = rnd(7); g.fillStyle = '#2a2a2e'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) { g.fillStyle = R() < 0.5 ? '#232326' : '#36363a'; g.fillRect(R() * w | 0, R() * h | 0, 1, 1); }
  for (let i = 0; i < 6; i++) mancha(g, R() * w, R() * h, 10 + R() * 14, 'rgba(10,10,12,A)', 0.4);
  g.fillStyle = '#d8d4c4'; for (let x = 0; x < w; x += 32) g.fillRect(x, 62, 18, 3);   // tracejado branco no meio
  g.fillStyle = 'rgba(216,212,196,.85)'; g.fillRect(0, 2, w, 2); g.fillRect(0, h - 4, w, 2);
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(42,42,46,.9)'; g.fillRect(R() * w | 0, [2, 3, 62, 63, h - 4][R() * 5 | 0], 3, 1); }
}, [12, 1]);
const tFaixa = () => tex(64, 64, (g, w, h) => { g.fillStyle = '#2a2a2e'; g.fillRect(0, 0, w, h); g.fillStyle = '#dcd8ca'; for (let y = 2; y < h; y += 12) g.fillRect(2, y, w - 4, 7); const R = rnd(4); for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(42,42,46,.8)'; g.fillRect(R() * w | 0, R() * h | 0, 2, 1); } });
const PALETA = ['#b8a888', '#9aa0a0', '#c4b494', '#8a7a6a', '#a89070', '#7a8a8a', '#c0a888', '#988878', '#a8a098', '#8c8270'];
const LETREIROS = [['LANCHONETE', '#ffcf40', '#a01818'], ['FARMÁCIA', '#ffffff', '#1a8a4a'], ['CELULARES', '#40e0ff', '#101820'], ['HOTEL', '#ff6080', '#18101a'], ['BAR DO ZÉ', '#ffe080', '#3a1a10'], ['ÓTICA', '#ffffff', '#2050a0'], ['PADARIA', '#ffd080', '#6a3a10'], ['PASTEL', '#ffe040', '#c02a10'], ['CHAVEIRO', '#000000', '#e8c020'], ['LOJA 1,99', '#ffffff', '#d02060']];
// fachada (cor + emissivo): janelas, pichação no alto, loja no térreo (vitrine acesa ou porta de aço grafitada)
function fachada(seed, larg, alt, loja) {
  const W = 128, H = Math.min(512, Math.round(128 * alt / larg / 8) * 8 || 128), R = rnd(seed), base = PALETA[seed % PALETA.length];
  const pxm = H / alt, terreo = Math.round(4.2 * pxm);
  const cor = tex(W, H, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 600; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.05)'; g.fillRect(R() * W | 0, R() * H | 0, 2, 2); }
    for (let i = 0; i < 6; i++) { const x = R() * W | 0, l = 30 + R() * 90; for (let y = 0; y < l; y++) { g.fillStyle = `rgba(30,25,20,${0.22 * (1 - y / l)})`; g.fillRect(x, y + 10, 2, 1); } }   // escorrido de chuva
    const cols = 4, cw = W / cols, andar = Math.round(3.1 * pxm);
    for (let y = 8; y < H - terreo - andar * 0.6; y += andar) for (let c = 0; c < cols; c++) {
      const x = c * cw + cw * 0.2, ww = cw * 0.6, hh = andar * 0.55;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 2, y - 2, ww + 4, hh + 5); g.fillStyle = '#1a1c22'; g.fillRect(x, y, ww, hh);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, y + hh + 1, ww, 2); g.fillStyle = '#3a3a40'; g.fillRect(x + ww / 2 - 0.5, y, 1, hh);
      if (R() < 0.25) { g.fillStyle = '#5a6a5a'; g.fillRect(x, y + hh - 4, ww, 4); }   // ar-condicionado/varal
    }
    // pichação (letras retas, "runas" de SP) no alto
    g.fillStyle = 'rgba(15,15,18,.85)';
    for (let k = 0; k < 2 + (R() * 3 | 0); k++) { let x = 4 + R() * 40, y = 2 + R() * (H * 0.35); const hh = 8 + R() * 10; for (let l = 0; l < 6 + (R() * 6 | 0) && x < W - 8; l++) { g.fillRect(x, y, 1.5, hh); if (R() < 0.6) g.fillRect(x, y, 5, 1.5); if (R() < 0.5) g.fillRect(x + 4, y, 1.5, hh * 0.7); if (R() < 0.3) g.fillRect(x, y + hh - 1, 5, 1.5); x += 7; } }
    // térreo
    const y0 = H - terreo;
    g.fillStyle = '#2a2a2c'; g.fillRect(0, y0, W, terreo);
    if (loja) { g.fillStyle = '#3a3428'; g.fillRect(8, y0 + 18, W - 16, terreo - 20); const RR = rnd(seed + 5); for (let i = 0; i < 40; i++) { g.fillStyle = ['#c84a3a', '#e0c040', '#3a7ac0', '#e8e4dc', '#4aa05a'][RR() * 5 | 0]; g.fillRect(10 + RR() * (W - 24), y0 + 22 + RR() * (terreo - 30), 5, 6); } g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(8, y0 + 18, W - 16, 2); }
    else { for (let y = y0 + 16; y < H - 2; y += 3) { g.fillStyle = y % 6 ? '#6a6c70' : '#4a4c50'; g.fillRect(6, y, W - 12, 3); }
      const cs = ['#e04a8a', '#40c0e0', '#f0d040', '#60d060', '#ff7a30']; for (let k = 0; k < 3; k++) { g.fillStyle = cs[R() * 5 | 0]; g.beginPath(); g.ellipse(20 + R() * 90, y0 + 30 + R() * 30, 14 + R() * 12, 7 + R() * 6, R(), 0, 7); g.fill(); g.strokeStyle = '#101010'; g.lineWidth = 2; g.stroke(); }
      g.fillStyle = 'rgba(15,15,18,.85)'; for (let x = 12; x < W - 20; x += 9) { g.fillRect(x, y0 + 60, 1.5, 10); g.fillRect(x, y0 + 60, 5, 1.5); } }
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y0, W, 3);
  });
  const emi = tex(W, H, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const RR = rnd(seed + 99), cols = 4, cw = W / cols, andar = Math.round(3.1 * pxm);
    for (let y = 8; y < H - terreo - andar * 0.6; y += andar) for (let c = 0; c < cols; c++) { if (RR() < 0.42) { g.fillStyle = ['#ffcc80', '#ffe0b0', '#b0d0ff', '#ffb060'][RR() * 4 | 0]; g.fillRect(c * cw + cw * 0.2, y, cw * 0.6, andar * 0.55); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(c * cw + cw * 0.2 + cw * 0.3 - 0.5, y, 1, andar * 0.55); } }
    if (loja) { const y0 = H - terreo; const gr = g.createLinearGradient(0, y0 + 18, 0, H); gr.addColorStop(0, ['#c8a070', '#a0b8c8', '#c89060', '#b0c0a0'][seed % 4]); gr.addColorStop(1, '#3a2a18'); g.fillStyle = gr; g.fillRect(8, y0 + 18, W - 16, terreo - 20); const R3 = rnd(seed + 5); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(10 + R3() * (W - 24), y0 + 22 + R3() * (terreo - 30), 5, 6); } }
  });
  return { cor, emi };
}
function predio(lado, x, larg, alt, seed, loja, outro) {
  const { cor, emi } = fachada(seed, larg, alt, loja);
  const fm = lam('#ffffff', { ...FX, flat: true, map: cor, emissive: '#ffffff', emissiveMap: emi, ei: outro ? 0 : 0.85 });
  const lat = lam(PALETA[(seed + 3) % PALETA.length], { ...FX, flat: true }), esc = lam('#1a1a1c', FX);
  const d = 10, z = lado > 0 ? 4.5 + d / 2 : -12 - d / 2;
  const mats = lado > 0 ? [lat, lat, esc, esc, esc, fm] : [lat, lat, esc, esc, fm, esc];
  const b = new THREE.Mesh(new THREE.BoxGeometry(larg, alt, d), mats); b.position.set(x, alt / 2, z);
  const g = new THREE.Group(); g.add(b); g.fm = fm;
  // platibanda/cornija e marquise
  const zf = lado > 0 ? 4.5 : -12;
  g.add(box(larg + 0.2, 0.35, 0.5, lam('#8a8478', { ...FX, flat: true }), x, alt - 0.2, zf - lado * 0.2));
  g.add(box(larg, 0.18, 1.3, lam('#4a4844', { ...FX, flat: true }), x, 4.1, zf - lado * 0.6));
  return g;
}
// letreiro (luminoso ou apagado), virado pra rua
function letreiro(txt, cor, fundo, x, y, z, lado, outro, w = 3.2) {
  const t = placa(128, 32, outro ? '#1a1a1c' : fundo, (g, W, H) => { g.fillStyle = outro ? '#2a2a2c' : cor; g.font = 'bold 20px Anton, sans-serif'; g.fillText(txt, W / 2, H / 2 + 1); if (!outro) { g.strokeStyle = cor; g.globalAlpha = 0.5; g.lineWidth = 2; g.strokeRect(3, 3, W - 6, H - 6); } });
  const p = pl(w, w / 4, (outro ? lam : luz)('#ffffff', { map: t, side: THREE.DoubleSide, fixo: true }), x, y, z - lado * 0.04); if (lado > 0) p.rotation.y = Math.PI; return p;
}
// fios de poste: catenária como tubo fininho
const mFio = () => lam('#0c0c0e', { fixo: true });
function fio(a, b, sag, m) { const pts = []; for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push(new THREE.Vector3(lerp(a[0], b[0], k), lerp(a[1], b[1], k) - sag * 4 * k * (1 - k), lerp(a[2], b[2], k))); } return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.014, 3, false), m); }

// ---------- veículos ----------
export function carro(cor, o = {}) {
  const g = new THREE.Group(), lat = lam(cor), vid = lam('#0a0c10', { emissive: '#000', fixo: true }), pneu = lam('#0e0e10');
  g.add(cbox(4.1, 0.6, 1.76, lat, 0, 0.62, 0, 0.12));
  g.add(cbox(2.1, 0.52, 1.56, vid, -0.25, 1.17, 0, 0.1));
  g.add(cbox(1.9, 0.08, 1.5, lat, -0.25, 1.45, 0, 0.03));
  for (const [x, z] of [[1.3, 0.85], [-1.3, 0.85], [1.3, -0.85], [-1.3, -0.85]]) { const r = cil(0.32, 0.32, 0.22, pneu, x, 0.32, z, 8); r.rotation.x = Math.PI / 2; g.add(r); }
  const fl = luz(o.farolMorto ? '#3a3a34' : '#fff6d8'), tl = luz(o.farolMorto ? '#3a1414' : '#ff2a20');
  g.add(box(0.06, 0.14, 0.38, fl, 2.06, 0.7, 0.58), box(0.06, 0.14, 0.38, fl, 2.06, 0.7, -0.58), box(0.06, 0.12, 0.34, tl, -2.06, 0.72, 0.62), box(0.06, 0.12, 0.34, tl, -2.06, 0.72, -0.62));
  // porta do motorista (aberta no mundo errado), dobradiça na frente
  const porta = new THREE.Group(); porta.position.set(0.55, 0, 0.88); g.add(porta);
  porta.add(cbox(1.1, 0.95, 0.06, lat, -0.55, 0.9, 0, 0.03)); porta.add(box(0.9, 0.4, 0.05, vid, -0.55, 1.25, 0.01));
  g.porta = porta; g.fl = fl; g.tl = tl;
  if (o.feixe) { const fx = feixe(); fx.position.set(5.5, 0.02, 0); g.add(fx); g.feixe = fx; }
  g.traverse(x => { if (x.isMesh) x.frustumCulled = false; });
  return g;
}
let TF = null;
function feixe(w = 3.2, l = 7, cor = '#ffe8b0', a = 0.32) {   // poça de luz do farol no chão (aditiva)
  if (!TF) TF = tex(32, 64, (g) => { const gr = g.createRadialGradient(16, 64, 2, 16, 60, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 64); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), new THREE.MeshBasicMaterial({ map: TF, color: new THREE.Color(cor), transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.PI / 2; return m;
}
export const poca = feixe;
function onibus(outro) {
  const g = new THREE.Group(), lat = lam('#d8d8d0'), faixa = lam('#2a6ab0');
  g.add(cbox(12, 2.6, 2.5, lat, 0, 1.65, 0, 0.15)); g.add(box(12.02, 0.3, 2.52, faixa, 0, 0.75, 0));
  const jan = tex(128, 16, (gg) => { gg.fillStyle = '#101418'; gg.fillRect(0, 0, 128, 16); for (let x = 2; x < 128; x += 11) { gg.fillStyle = outro ? '#14181a' : '#d8e8d0'; gg.fillRect(x, 1, 9, 14); if (!outro && x % 3) { gg.fillStyle = '#4a3a30'; gg.fillRect(x + 2, 6, 4, 9); } } });
  const mj = (outro ? lam : luz)('#ffffff', { map: jan, side: THREE.DoubleSide });
  g.add(pl(11, 1.0, mj, -0.2, 2.15, 1.26), pl(11, 1.0, mj, -0.2, 2.15, -1.26).rotateY(Math.PI));
  const led = placa(64, 12, '#0a0a0a', (gg) => { gg.fillStyle = outro ? '#1a1a1a' : '#ff9a20'; gg.font = 'bold 10px monospace'; gg.fillText('CENTRO', 32, 6); });
  g.add(pl(1.8, 0.3, (outro ? lam : luz)('#ffffff', { map: led }), 6.01, 2.75, 0).rotateY(Math.PI / 2));
  g.add(pl(2.3, 1.2, lam('#0a0c10'), 6.01, 2.0, 0).rotateY(Math.PI / 2));
  const fl = luz(outro ? '#2a2a26' : '#fff6d8'); g.add(box(0.05, 0.2, 0.4, fl, 6.02, 0.6, 0.9), box(0.05, 0.2, 0.4, fl, 6.02, 0.6, -0.9));
  for (const x of [-4, 4]) for (const z of [-1.15, 1.15]) { const r = cil(0.5, 0.5, 0.3, lam('#0e0e10'), x, 0.5, z, 8); r.rotation.x = Math.PI / 2; g.add(r); }
  if (!outro) { const fx = feixe(3.6, 9); fx.position.set(10.5, 0.02, 0); g.add(fx); }
  g.traverse(x => { if (x.isMesh) x.frustumCulled = false; }); return g;
}
function moto() {
  const g = new THREE.Group(), m = lam('#b02a20'), pr = lam('#0e0e10');
  g.add(cbox(1.6, 0.35, 0.3, m, 0, 0.75, 0, 0.06)); for (const x of [-0.7, 0.7]) { const r = cil(0.3, 0.3, 0.1, pr, x, 0.3, 0, 8); r.rotation.x = Math.PI / 2; g.add(r); }
  g.add(cbox(0.45, 0.4, 0.45, lam('#e8e0c8'), -0.75, 1.05, 0, 0.04));   // baú de entrega
  g.add(box(0.06, 0.12, 0.16, luz('#fff8e0'), 0.85, 0.95, 0)); const fx = feixe(2, 6, '#fff0c0', 0.3); fx.position.set(4, 0.02, 0); g.add(fx);
  const p = pessoa({ ...pedestre(77), camisa: '#202024', manga: 'longa', bone: null }); p.position.set(-0.1, 0.25, 0); p.rotation.y = Math.PI / 2; g.add(p);
  p.pernas.forEach(pp => { pp.rotation.x = -1.3; pp.joe.rotation.x = 1.4; }); p.braco('D', 1.2, 0.2, 0.3); p.braco('E', 1.2, 0.2, 0.3); p.tronco.rotation.x = 0.3;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lam('#1a1a1e')); cap.position.set(0, 0.17, 0.02); p.cab.add(cap);
  const vis = new THREE.Mesh(new THREE.SphereGeometry(0.162, 8, 6, -0.8, 1.6, 1.0, 0.7), luz('#2a3a4a')); vis.position.copy(cap.position); p.cab.add(vis);
  g.traverse(x => { if (x.isMesh) x.frustumCulled = false; }); return g;
}

// ---------- a rua ----------
export function rua(st, o = {}) {
  const S = st.scene, outro = !!o.outro, R = rnd(outro ? 31 : 31), M = { carros: [], pedestres: [], postes: [], outro };
  // luz geral
  M.hemi = new THREE.HemisphereLight(new THREE.Color(outro ? '#3a4a44' : '#4a4060'), new THREE.Color(outro ? '#0a0e0c' : '#1a120c'), outro ? 0.55 : 0.75); S.add(M.hemi);
  // céu noturno: brilho de cidade (laranja) ou chumbo esverdeado
  { const c = outro ? ['#020403', '#0a100e', '#18221e'] : ['#04060e', '#141428', '#3a2a28']; const ceu = new THREE.Mesh(new THREE.SphereGeometry(200, 12, 8), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: tex(4, 64, (g) => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, c[0]); gr.addColorStop(0.35, c[1]); gr.addColorStop(0.5, c[2]); gr.addColorStop(1, c[0]); g.fillStyle = gr; g.fillRect(0, 0, 4, 64); }) })); S.add(ceu); }
  // chão
  const mCal = lam('#ffffff', { ...FX, map: tCalcada() }), mAsf = lam('#ffffff', { ...FX, map: tAsfalto() }), mGuia = lam('#8a8680', FX);
  const chao = (x0, x1, z0, z1, y, m, rep) => { const p = pl(x1 - x0, z1 - z0, m, (x0 + x1) / 2, y, (z0 + z1) / 2, 1, 1); p.rotation.x = -Math.PI / 2; S.add(p); return p; };
  chao(-60, METRO.x0, -0.5, 4.5, 0, mCal); chao(METRO.x1, 60, -0.5, 4.5, 0, mCal); chao(METRO.x0, METRO.x1, -0.5, METRO.z0, 0, mCal); chao(METRO.x0, METRO.x1, METRO.z1, 4.5, 0, mCal);
  chao(-60, 60, -9, -0.5, -0.15, mAsf); chao(-60, 60, -12, -9, 0, mCal);
  S.add(box(120, 0.15, 0.2, mGuia, 0, -0.075, -0.5), box(120, 0.15, 0.2, mGuia, 0, -0.075, -9));
  { const fp = pl(3.5, 8.5, lam('#ffffff', { ...FX, map: tFaixa(), decal: 1 }), 20, -0.148, -4.75); fp.rotation.x = -Math.PI / 2; S.add(fp); }
  // prédios dos dois lados
  M.predios = [];
  for (const lado of [1, -1]) { let x = -58; let i = lado > 0 ? 0 : 50; while (x < 58) { const larg = 7 + R() * 6, alt = 9 + R() * 18; const p = predio(lado, x + larg / 2, larg - 0.15, alt, 40 + i, R() < 0.65, outro); S.add(p); M.predios.push(p);
      if (R() < 0.75) { const [t, c, f] = LETREIROS[i % LETREIROS.length]; S.add(letreiro(t, c, f, x + larg / 2, 4.7 + R() * 0.6, lado > 0 ? 3.75 : -11.25, lado, outro && !(i === 3), 2.6 + R() * 1.4)); }
      x += larg; i++; } }
  // postes com braço sobre a rua + lâmpada de sódio
  const mPoste = lam('#4a4c50', { fixo: true }), mLampOn = luz(outro ? '#c8e0c0' : '#ffc070'), mLampOff = lam('#2a2c2a', { fixo: true });
  const vivos = outro ? { 6: 'sick', [-6]: 'sick', [-18]: 'pisca', 18: 'sick' } : null;
  for (const x of [-42, -30, -18, -6, 6, 18, 30, 42]) for (const lado of [1, -1]) {
    const z = lado > 0 ? -0.25 : -9.25, g = new THREE.Group(); g.position.set(x + (lado > 0 ? 0 : 6), 0, z); S.add(g);
    g.add(cil(0.09, 0.13, 7.5, mPoste, 0, 3.75, 0, 6)); const br = box(0.08, 0.08, 2.0, mPoste, 0, 7.4, -lado * 1.0); g.add(br);
    const est = outro && lado > 0 ? (vivos[x] || 'off') : outro ? 'off' : 'on';
    const lamp = box(0.5, 0.14, 0.26, est === 'off' ? mLampOff : mLampOn, 0, 7.28, -lado * 1.9); g.add(lamp);
    let L = null; if (est !== 'off' && Math.abs(x) <= 20 && (lado > 0 || outro)) { L = new THREE.PointLight(new THREE.Color(outro ? '#a8c8a0' : '#ffb060'), outro ? 22 : 30, outro ? 15 : 20, 1.3); L.position.set(0, 7.0, -lado * 1.9); g.add(L);
      const pc = feixe(7, 7, outro ? '#b8d8b0' : '#ffc070', outro ? 0.14 : 0.18); pc.position.set(0, -0.13, -lado * 1.9); g.add(pc); }
    M.postes.push({ g, lamp, L, est, x, lado, on: mLampOn, off: mLampOff });
    // fios até o próximo poste (emaranhado)
    if (lado > 0 && x < 42) for (let k = 0; k < 6; k++) S.add(fio([x, 6.2 + k * 0.18, z + 0.05 * k], [x + 12, 6.1 + k * 0.2, z + 0.05 * (5 - k)], 0.5 + R() * 0.9, mFio()));
    if (lado > 0) for (let k = 0; k < 3; k++) S.add(fio([x, 6.5 + k * 0.2, z], [x + 2 + R() * 4, 5.5 + R() * 2, 4.45], 0.4 + R() * 0.5, mFio()));
    if (lado > 0 && R() < 0.6) { const bolo = new THREE.Mesh(new THREE.TorusKnotGeometry(0.22, 0.03, 24, 3, 2, 5), mFio()); bolo.position.set(x + 0.3, 6.3, z); S.add(bolo); }   // emaranhado no poste
  }
  // banca de jornal (aberta e iluminada | fechada)
  { const b = new THREE.Group(); b.position.set(4.2, 0, -10.4); b.rotation.y = Math.PI; S.add(b); const verde = lam('#2a5a3a', { fixo: true });
    b.add(cbox(3.2, 2.4, 1.6, verde, 0, 1.2, 0, 0.05)); b.add(cbox(3.5, 0.12, 2.0, verde, 0, 2.48, -0.1, 0.03));
    const rev = tex(128, 64, (g) => { const r = rnd(9); g.fillStyle = '#20201c'; g.fillRect(0, 0, 128, 64); for (let y = 2; y < 62; y += 15) for (let x = 2; x < 126; x += 10) { g.fillStyle = ['#d83a3a', '#f0d040', '#3a8ad8', '#e8e4dc', '#e070a0', '#40a060'][r() * 6 | 0]; g.fillRect(x, y, 9, 13); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x + 1, y + 2, 7, 2); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x + 1, y + 8, 5, 1); } });
    const ondas = tex(64, 32, (g) => { g.fillStyle = '#5a5e5a'; g.fillRect(0, 0, 64, 32); for (let y = 0; y < 32; y += 2) { g.fillStyle = y % 4 ? '#4a4e4a' : '#6a6e6a'; g.fillRect(0, y, 64, 1); } g.fillStyle = 'rgba(15,15,18,.8)'; for (let x = 6; x < 56; x += 7) { g.fillRect(x, 10, 1, 9); g.fillRect(x, 10, 4, 1); } });
    b.add(pl(3.0, 1.9, outro ? lam('#ffffff', { map: ondas, fixo: true }) : luz('#ffffff', { map: rev }), 0, 1.15, -0.81).rotateY(Math.PI));
    b.add(pl(2.8, 0.36, (outro ? lam : luz)('#ffffff', { map: placa(80, 12, outro ? '#2a2a2a' : '#f0e8d0', (g) => { g.fillStyle = outro ? '#3a3a3a' : '#1a3a2a'; g.font = 'bold 10px monospace'; g.fillText('BANCA • REVISTAS • BALAS', 40, 6); }) }), 0, 2.25, -0.82).rotateY(Math.PI));
    if (!outro) { const L = new THREE.PointLight(new THREE.Color('#fff0d0'), 6, 5, 1.5); L.position.set(0, 1.8, -1.4); b.add(L); }
    M.banca = b; }
  // relógio de rua (totem com display de LED) — 21:47 | 25:71
  { const g = new THREE.Group(); g.position.set(9.4, 0, -0.15); S.add(g); g.add(cil(0.08, 0.1, 3.2, mPoste, 0, 1.6, 0, 6));
    g.add(cbox(1.5, 0.62, 0.22, lam('#1a1c20', { fixo: true }), 0, 3.4, 0, 0.04));
    const t = tex(64, 24, () => {}); t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; M.relogioTex = t;
    const tela = pl(1.36, 0.5, luz('#ffffff', { map: t, side: THREE.DoubleSide, fixo: true }), 0, 3.4, -0.115); tela.rotation.y = Math.PI; g.add(tela); const t2 = pl(1.36, 0.5, luz('#ffffff', { map: t, fixo: true }), 0, 3.4, 0.115); g.add(t2);
    M.relogio = g; M.relogioTxt = (txt, cor, T) => { const gg = t.g; gg.fillStyle = '#050605'; gg.fillRect(0, 0, 64, 24); gg.fillStyle = cor; gg.font = 'bold 18px monospace'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText(txt, 32, 13); gg.fillStyle = 'rgba(0,0,0,.4)'; for (let y = 0; y < 24; y += 2) gg.fillRect(0, y, 64, 1); t.needsUpdate = true; };
    M.relogioTxt(outro ? '25:71' : '21:47', outro ? '#b8ff9a' : '#ff5a2a', 0);
    const L2 = new THREE.PointLight(new THREE.Color(outro ? '#7aff6a' : '#ff6030'), outro ? 2.5 : 1.6, 3.5, 1.6); L2.position.set(0, 3.2, 0.5); g.add(L2); }
  // semáforo na esquina (x=19)
  { const g = new THREE.Group(); g.position.set(18.6, 0, -0.35); S.add(g); g.add(cil(0.07, 0.09, 3.0, mPoste, 0, 1.5, 0, 6)); g.add(box(0.06, 0.06, 2.4, mPoste, 0, 3.0, -1.2));
    const cx = cbox(0.34, 0.95, 0.3, lam('#141416', { fixo: true }), 0, 2.7, -2.35, 0.04); g.add(cx);
    M.sem = ['#ff2a1a', '#ffb020', '#30ff70'].map((c, i) => { const on = luz(c), off = lam('#1e1e1e', { fixo: true }); const m = new THREE.Mesh(new THREE.CircleGeometry(0.1, 8), off); m.position.set(-0.18, 3.0 - i * 0.3, -2.35); m.rotation.y = -Math.PI / 2; g.add(m); return { m, on, off }; });
    M.semL = new THREE.PointLight(new THREE.Color('#ffb020'), 0, 6, 1.4); M.semL.position.set(-0.6, 2.7, -2.35); g.add(M.semL); }
  // boca do metrô: guarda-corpo, escada descendo, paredes, totem vermelho "METRÔ"
  { const m = new THREE.Group(); S.add(m); const mPar = lam('#b8b4a8', FX), mDeg = lam('#8a867e', FX), mCor = lam('#c8c8c0', { fixo: true });
    const n = 14, dx = (METRO.x1 - METRO.x0) / n, dy = -METRO.fundo / n;
    for (let i = 0; i < n; i++) m.add(box(dx + 0.02, dy, METRO.z1 - METRO.z0, mDeg, METRO.x0 + dx * (i + 0.5), -dy * (i + 0.5), (METRO.z0 + METRO.z1) / 2));
    for (let i = 0; i < n; i++) m.add(box(0.06, 0.02, METRO.z1 - METRO.z0, lam('#d8c040', { fixo: true }), METRO.x0 + dx * i + 0.04, -dy * i + 0.005, (METRO.z0 + METRO.z1) / 2));   // fita antiderrapante
    for (const z of [METRO.z0 - 0.05, METRO.z1 + 0.05]) { m.add(box(METRO.x1 - METRO.x0 + 2, 3.2, 0.1, mPar, (METRO.x0 + METRO.x1) / 2 + 1, -1.6, z)); }
    m.add(box(0.1, 3.2, METRO.z1 - METRO.z0 + 0.2, mPar, METRO.x1 + 2, -1.6, (METRO.z0 + METRO.z1) / 2)); { const f = pl(3, METRO.z1 - METRO.z0, mDeg, METRO.x1 + 1, METRO.fundo, (METRO.z0 + METRO.z1) / 2); f.rotation.x = -Math.PI / 2; m.add(f); }
    for (const z of [METRO.z0 - 0.05, METRO.z1 + 0.05]) { m.add(box(METRO.x1 - METRO.x0, 0.05, 0.05, mCor, (METRO.x0 + METRO.x1) / 2, 1.0, z)); for (let x = METRO.x0; x <= METRO.x1; x += 1.25) m.add(box(0.04, 1.0, 0.04, mCor, x, 0.5, z)); }
    m.add(box(0.05, 0.05, METRO.z1 - METRO.z0, mCor, METRO.x1, 1.0, (METRO.z0 + METRO.z1) / 2));
    // luz de dentro da escada (branca)
    const Le = new THREE.PointLight(new THREE.Color(outro ? '#a0b8a8' : '#e8f0ff'), outro ? 4 : 10, 7, 1.4); Le.position.set(15, -1.2, 2); m.add(Le); M.luzEscada = Le;
    const tot = new THREE.Group(); tot.position.set(10.9, 0, 3.6); m.add(tot);
    tot.add(cbox(0.5, 3.4, 0.5, lam('#2a2a2e', { fixo: true }), 0, 1.7, 0, 0.04));
    const tt = placa(64, 128, outro ? '#3a1612' : '#d0201a', (g) => { g.fillStyle = outro ? '#8a8078' : '#ffffff'; g.font = 'bold 15px Anton, sans-serif'; g.fillText('METRÔ', 32, 22); g.fillRect(8, 36, 48, 2); g.font = 'bold 8px monospace'; g.fillText('ESTAÇÃO', 32, 52); g.fillText('ANHANGABAÚ', 32, 64); g.fillStyle = outro ? '#6a2a22' : '#ffffff'; g.beginPath(); g.moveTo(32, 80); g.lineTo(44, 98); g.lineTo(20, 98); g.fill(); g.font = 'bold 7px monospace'; g.fillStyle = outro ? '#8a8078' : '#ffe0d0'; g.fillText('ACESSO', 32, 112); });
    for (const r of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { const f = pl(0.48, 1.0, (outro ? lam : luz)('#ffffff', { map: tt, fixo: true }), 0, 2.85, 0); f.rotation.y = r; f.translateZ(0.252); tot.add(f); }
    if (!outro) { const Lt = new THREE.PointLight(new THREE.Color('#ff4030'), 5, 4.5, 1.5); Lt.position.set(-0.6, 2.8, -0.6); tot.add(Lt); }
    M.totem = tot; }
  // ambulante (só na rua viva): guarda-sol + isopor + vendedor; ponto de ônibus
  if (!outro) {
    const v = new THREE.Group(); v.position.set(-4.5, 0, -0.05); S.add(v);
    v.add(cbox(0.8, 0.55, 0.5, lam('#e8e8e0', { fixo: true }), 0, 0.28, 0, 0.05)); v.add(box(0.8, 0.06, 0.5, lam('#3a8ad0', { fixo: true }), 0, 0.58, 0));
    for (let i = 0; i < 6; i++) v.add(cil(0.035, 0.035, 0.2, luz('#a0d0ff', { opacity: 0.8, transparent: true }), -0.3 + i * 0.12, 0.7, 0, 6));
    v.add(cil(0.02, 0.02, 2.2, lam('#ccc'), 0.5, 1.1, 0.2)); const gs = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.45, 8, 1, true), lam('#d83a3a', { side: THREE.DoubleSide, map: tex(16, 4, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 4 < 2 ? '#d83a3a' : '#f0e8d8'; g.fillRect(i, 0, 1, 4); } }) })); gs.position.set(0.5, 2.3, 0.2); v.add(gs);
    const vd = pessoa(pedestre(5)); vd.position.set(-0.6, 0, 0.3); vd.rotation.y = 0.9; v.add(vd); M.vendedor = vd;
    const Lv = new THREE.PointLight(new THREE.Color('#ffe8c0'), 2, 3, 1.5); Lv.position.set(0.5, 1.8, 0.2); v.add(Lv);
    // ponto de ônibus com gente esperando
    const po = new THREE.Group(); po.position.set(-13, 0, -0.1); S.add(po); po.add(box(3.2, 0.06, 1.2, lam('#3a3a40', { fixo: true }), 0, 2.4, 0.4)); for (const x of [-1.5, 1.5]) po.add(box(0.06, 2.4, 0.06, mPoste, x, 1.2, 0.9));
    po.add(pl(1.2, 1.6, luz('#ffffff', { map: placa(48, 64, '#e8e0d0', (g) => { g.fillStyle = '#c03a2a'; g.fillRect(0, 0, 48, 14); g.fillStyle = '#fff'; g.font = 'bold 9px monospace'; g.fillText('OFERTA', 24, 7); g.fillStyle = '#2a2a2a'; g.fillRect(8, 22, 32, 30); }) }), -0.6, 1.3, 0.92));
    M.esperando = [];
    for (let i = 0; i < 3; i++) { const p = pessoa(pedestre(20 + i)); p.position.set(-14 + i * 0.9, 0, 0.5 + (i % 2) * 0.3); p.rotation.y = -Math.PI / 2 + (i - 1) * 0.4; S.add(p); M.esperando.push(p); }
  }
  // tráfego (rua viva) | carros abandonados (mundo errado)
  const CORES = ['#c8c8c0', '#2a2a2e', '#a01e1e', '#3a5a8a', '#d8d8d0', '#5a5a5e', '#8a7a5a', '#1e3a2a'];
  if (!outro) {
    for (let i = 0; i < 9; i++) { const c = carro(CORES[i % CORES.length], { feixe: true }); const faixa = i % 2; c.userData = { z: faixa ? -2.6 : -6.6, dir: faixa ? 1 : -1, v: 7 + (i * 1.7) % 4, x0: -60 + i * 14 }; c.rotation.y = faixa ? 0 : Math.PI; c.position.y = -0.15; c.porta.visible = true; S.add(c); M.carros.push(c); }
    M.bus = onibus(false); M.bus.position.y = -0.15; S.add(M.bus); M.moto = moto(); M.moto.position.y = -0.15; S.add(M.moto);
    for (let i = 0; i < 12; i++) { const p = pessoa(pedestre(i)); const lane = [3.0, 3.6, 4.1, 3.3][i % 4]; p.userData = { z: lane, dir: i % 2 ? 1 : -1, v: 1.0 + (i * 0.37) % 0.6, x0: -40 + i * 7.3, fase: i }; S.add(p); M.pedestres.push(p); }
  } else {
    const parados = [[-9, -2.8, 0.3], [-2, -6.4, -0.25], [4.5, -3.0, 0.5], [12, -6.9, 3.0], [22, -2.4, -0.15], [-17, -6.0, 3.3], [30, -5.0, 0.8]];
    parados.forEach(([x, z, ry], i) => { const c = carro(CORES[i % CORES.length], { farolMorto: i !== 2 }); c.position.set(x, -0.15, z); c.rotation.y = ry; c.porta.rotation.y = -1.05 - (i % 3) * 0.15; S.add(c); M.carros.push(c);
      if (i === 2) { const fx = feixe(3, 6, '#c8d0a0', 0.12); fx.position.set(5.2, 0.17, 0); c.add(fx); } });
    M.bus = onibus(true); M.bus.position.set(-26, -0.15, -4.5); M.bus.rotation.y = 0.12; S.add(M.bus);
    // lixo parado: papéis no chão
    const mp = lam('#c8c4b0', { side: THREE.DoubleSide, fixo: true, decal: 1 });
    for (let i = 0; i < 60; i++) { const p = pl(0.15 + R() * 0.25, 0.1 + R() * 0.2, mp, -30 + R() * 60, 0.015, -11 + R() * 15); p.rotation.x = -Math.PI / 2; p.rotation.z = R() * 3; if (p.position.z < -0.5 && p.position.z > -9) p.position.y = -0.135; S.add(p); }
    // poeira suspensa
    const N = 900, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = -25 + R() * 50; pos[i * 3 + 1] = R() * 6; pos[i * 3 + 2] = -10 + R() * 14; }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); M.poeira = new THREE.Points(gg, new THREE.PointsMaterial({ color: new THREE.Color('#9aa894'), size: 0.035, transparent: true, opacity: 0.75 })); S.add(M.poeira);
  }
  // luz de recorte que acompanha a Lívia (deixa ela e os parados legíveis)
  M.recorte = new THREE.PointLight(new THREE.Color(outro ? '#8ab0a4' : '#ffd8b0'), outro ? 5 : 4, 6, 1.3); S.add(M.recorte);
  return M;
}

// anima a rua no tempo T. p0 = posição da Lívia (para luz de recorte)
export function ruaVive(M, T, p0 = null) {
  if (p0) M.recorte.position.set(p0[0] - 1.2, 2.4, p0[2] - 1.6);
  if (!M.outro) {
    const wrap = (x) => ((x + 60) % 120 + 120) % 120 - 60;
    M.carros.forEach((c, i) => { const u = c.userData; c.position.set(wrap(u.x0 + u.dir * u.v * T), -0.15, u.z); });
    M.bus.position.set(wrap(-30 + 6 * T), -0.15, -2.4); M.bus.rotation.y = 0;
    M.moto.position.set(wrap(10 - 11 * T), -0.15, -4.6); M.moto.rotation.y = Math.PI;
    M.pedestres.forEach((p) => { const u = p.userData; p.position.set(wrap(u.x0 + u.dir * u.v * T), 0, u.z); p.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2; p.anda(T * u.v * 4.6 + u.fase, 1); p.face({ pisca: (T + u.fase) % 3.1 > 2.97 }); });
    M.esperando?.forEach((p, i) => { p.respira(T + i); p.olhaPara([-30, 1.6, -3], 1, 0.2); });
    if (M.vendedor) { M.vendedor.braco('D', 0.6 + 0.4 * Math.max(0, Math.sin(T * 2.2)), 0.3, 0.8); M.vendedor.respira(T); }
    const ph = (T % 12); M.sem.forEach((s, i) => { s.m.material = (i === 0 && ph < 5) || (i === 2 && ph >= 5 && ph < 10.5) || (i === 1 && ph >= 10.5) ? s.on : s.off; });
  } else {
    const am = Math.floor(T * 1.25) % 2 === 0; M.sem.forEach((s, i) => { s.m.material = i === 1 && am ? s.on : s.off; }); M.semL.intensity = am ? 3 : 0;
    M.postes.forEach((p) => { if (p.est !== 'pisca' || !p.L) return; const on = noise(T * 9, 4) > 0.15 || (T % 4) < 0.08; p.lamp.material = on ? p.on : p.off; p.L.intensity = on ? 22 : 0; });
    if (M.poeira) { M.poeira.rotation.y = 0.004 * Math.sin(T * 0.2); M.poeira.position.y = 0.03 * Math.sin(T * 0.3); }
  }
}
