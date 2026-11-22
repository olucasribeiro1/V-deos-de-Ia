// A ESTAÇÃO — o sobradinho na Mooca, à noite.
// fachada(): rua estreita, portão de grade, lajota com vasos de planta, porta de madeira, arandela amarela, poste de sódio.
//   frente da casa em z=3 (rua em z<0, portão em z=0, porta em x≈0.1).
// sala(): uma luminária de mesa acesa e mais nada — sofá de veludo, TV de tubo com paninho de crochê, filtro de barro,
//   relógio de parede, estante com o PORTA-RETRATO (renderizado de verdade: o Diego abraçando a OUTRA, com a roupa da Lívia),
//   porta da cozinha escura com a geladeira. Sala: x ∈ [-3, 3], z ∈ [0, 5], porta de entrada em z=0, x≈0.1.
import { THREE, lam, luz, tex, rnd, mancha, cbox, box, cil, pl } from '/series/turno/ps1.js';
import { anel } from '/series/turno/gente.js';
import { mulher, pessoa, SOSIA, DIEGO, exprP } from '/series/estacao/elenco.js';
import { placa, poca } from '/series/estacao/rua.js';
const FX = { fixo: true, flat: false };

const tParede = (cor, seed = 3) => tex(64, 64, (g) => { const R = rnd(seed); g.fillStyle = cor; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 400; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.05)'; g.fillRect(R() * 64 | 0, R() * 64 | 0, 2, 2); } for (let i = 0; i < 3; i++) mancha(g, R() * 64, R() * 64, 14, 'rgba(60,50,30,A)', 0.12); }, [4, 2]);
const tTaco = () => tex(128, 128, (g, w, h) => { const R = rnd(6); for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 32) { const hor = ((x / 32 + y / 16) | 0) % 2; const v = (R() - 0.5) * 30; g.fillStyle = `rgb(${120 + v | 0},${76 + v * 0.6 | 0},${42 + v * 0.4 | 0})`; g.fillRect(x, y, 32, 16); g.strokeStyle = 'rgba(40,20,10,.5)'; g.strokeRect(x + 0.5, y + 0.5, 31, 15); for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(60,30,10,.25)'; if (hor) g.fillRect(x, y + 3 + k * 3, 32, 1); else g.fillRect(x + 4 + k * 7, y, 1, 16); } } g.fillStyle = 'rgba(255,230,200,.06)'; g.fillRect(0, 0, w, h); }, [6, 5]);
const tLajota = () => tex(64, 64, (g) => { const R = rnd(4); for (let y = 0; y < 64; y += 16) for (let x = 0; x < 64; x += 16) { const v = (R() - 0.5) * 20; g.fillStyle = `rgb(${150 + v | 0},${70 + v | 0},${50 + v | 0})`; g.fillRect(x, y, 16, 16); } g.fillStyle = '#5a4a40'; for (let i = 0; i < 64; i += 16) { g.fillRect(0, i, 64, 1); g.fillRect(i, 0, 1, 64); } }, [6, 3]);

function vaso(x, z, s = 1, R) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  g.add(new THREE.Mesh(anel([{ y: 0, rx: 0.13 * s, rz: 0.13 * s }, { y: 0.3 * s, rx: 0.18 * s, rz: 0.18 * s }], 8), lam('#a8502a', { fixo: true })));
  const fol = lam('#2a5a2a', { side: THREE.DoubleSide, fixo: true });
  for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.05 * s, 0.6 * s, 3), fol); f.position.set(0, 0.5 * s, 0); f.rotation.set((R() - 0.5) * 1.1, R() * 6, (R() - 0.5) * 1.1); g.add(f); }
  return g;
}

export function fachada(st) {
  const S = st.scene, M = {}, R = rnd(8);
  S.add(new THREE.HemisphereLight(new THREE.Color('#3a4060'), new THREE.Color('#140e0a'), 0.55));
  { const c = pl(30, 6, lam('#4a4a4c', FX), 0, -0.02, -3); c.rotation.x = -Math.PI / 2; S.add(c); }
  { const c = pl(6.4, 3, lam('#ffffff', { ...FX, map: tLajota() }), 0, 0.0, 1.5); c.rotation.x = -Math.PI / 2; S.add(c); }
  // fachada do sobrado (2 andares) — verde-água desbotado
  const mF = lam('#ffffff', { ...FX, map: tParede('#8ab8a8', 5) });
  S.add(box(6.4, 6.2, 0.3, mF, 0, 3.1, 3.15));
  S.add(box(6.6, 0.25, 1.2, lam('#6a6a60', FX), 0, 3.0, 2.6));   // laje da varanda
  for (let x = -3; x <= 3; x += 0.3) S.add(box(0.03, 0.9, 0.03, lam('#2a2c2a', { fixo: true }), x, 3.55, 2.05)); S.add(box(6.4, 0.05, 0.05, lam('#2a2c2a', { fixo: true }), 0, 4.0, 2.05));
  S.add(box(1.4, 1.1, 0.05, luz('#1c2230'), -1.8, 4.7, 2.99), box(1.4, 1.1, 0.05, luz('#1c2230'), 1.8, 4.7, 2.99));
  S.add(box(1.3, 1.0, 0.05, luz('#2a2018'), -1.9, 1.5, 2.99));   // janela da sala (escura)
  for (let x = -2.5; x <= -1.3; x += 0.12) S.add(box(0.02, 1.0, 0.03, lam('#1a1a1a', { fixo: true }), x, 1.5, 2.97));
  // porta de madeira (dobradiça à esquerda)
  const porta = new THREE.Group(); porta.position.set(-0.35, 0, 2.99); S.add(porta);
  porta.add(cbox(0.9, 2.1, 0.06, lam('#6a3a1e', { fixo: true, map: tex(16, 32, (g) => { g.fillStyle = '#6a3a1e'; g.fillRect(0, 0, 16, 32); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(2, 3, 12, 11); g.fillRect(2, 17, 12, 12); }) }), 0.45, 1.05, 0, 0.02));
  porta.add(box(0.04, 0.12, 0.04, lam('#c8a040', { fixo: true }), 0.8, 1.0, -0.05)); M.porta = porta;
  { const f = pl(0.9, 2.1, luz('#1a1208'), 0.1, 1.05, 3.05); f.rotation.y = Math.PI; S.add(f); }
  // arandela amarela ao lado da porta
  S.add(box(0.14, 0.22, 0.12, luz('#ffd890'), 0.9, 2.3, 2.94)); { const L = new THREE.PointLight(new THREE.Color('#ffc880'), 4, 5, 1.4); L.position.set(0.9, 2.2, 2.6); S.add(L); }
  // muro baixo + portão de grade (abre pra dentro, dobradiça em x=-0.5)
  const mG = lam('#2a2c2e', { fixo: true }), mMuro = lam('#ffffff', { ...FX, map: tParede('#c8c0b0', 9) });
  S.add(box(2.6, 0.9, 0.2, mMuro, -1.8, 0.45, 0), box(2.3, 0.9, 0.2, mMuro, 1.95, 0.45, 0));
  for (let x = -3.1; x <= 3.1; x += 0.16) if (x < -0.5 || x > 0.8) S.add(box(0.025, 1.2, 0.025, mG, x, 1.5, 0)); S.add(box(6.4, 0.05, 0.05, mG, 0, 2.1, 0));
  const portao = new THREE.Group(); portao.position.set(-0.5, 0, 0); S.add(portao);
  for (let x = 0.08; x < 1.3; x += 0.13) portao.add(box(0.025, 2.0, 0.025, mG, x, 1.05, 0)); portao.add(box(1.3, 0.05, 0.05, mG, 0.65, 0.1, 0), box(1.3, 0.05, 0.05, mG, 0.65, 2.05, 0), box(1.3, 0.05, 0.05, mG, 0.65, 1.0, 0)); M.portao = portao;
  // vasos na lajota
  for (const [x, z, s] of [[-2.6, 2.6, 1.1], [-2.0, 2.7, 0.8], [1.6, 2.7, 1.0], [2.5, 2.5, 1.3], [-2.8, 0.5, 0.9]]) S.add(vaso(x, z, s, R));
  // casas vizinhas e poste
  S.add(box(6, 7, 6, lam('#b8a080', FX), -6.3, 3.5, 5.6), box(6, 5, 6, lam('#a8b0b8', FX), 6.3, 2.5, 5.6));
  { const g = new THREE.Group(); g.position.set(4.0, 0, -1.2); S.add(g); g.add(cil(0.09, 0.12, 7, lam('#4a4c50', { fixo: true }), 0, 3.5, 0, 6)); g.add(box(0.5, 0.14, 0.26, luz('#ffc070'), -0.6, 6.8, 0)); const L = new THREE.PointLight(new THREE.Color('#ffb060'), 18, 14, 1.3); L.position.set(-0.6, 6.5, 0); g.add(L); const pc = poca(6, 6, '#ffc070', 0.16); pc.position.set(-0.6, 0.0, 0); g.add(pc); }
  M.recorte = new THREE.PointLight(new THREE.Color('#ffd8b0'), 3, 5, 1.3); S.add(M.recorte);
  return M;
}

// porta-retrato: mini-cena renderizada uma vez numa textura (Diego + "ela" com a roupa da Lívia)
function fotoTex(T) {
  const R = T.getRenderer(); const rt = new THREE.WebGLRenderTarget(384, 480, { type: THREE.HalfFloatType });
  const sc = new THREE.Scene(); sc.background = new THREE.Color('#6a8aa8');
  sc.add(new THREE.HemisphereLight(new THREE.Color('#fff0e0'), new THREE.Color('#5a4a40'), 1.6)); const d = new THREE.DirectionalLight(new THREE.Color('#fff4e0'), 1.8); d.position.set(1, 2, 3); sc.add(d);
  const fundo = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshLambertMaterial({ map: tex(64, 48, (g) => { const gr = g.createLinearGradient(0, 0, 0, 48); gr.addColorStop(0, '#8ab0d0'); gr.addColorStop(0.55, '#c8d8e0'); gr.addColorStop(0.56, '#4a7a3a'); gr.addColorStop(1, '#3a6030'); g.fillStyle = gr; g.fillRect(0, 0, 64, 48); g.fillStyle = '#2a5a2a'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(4 + i * 9, 26, 6, 0, 7); g.fill(); } }) })); fundo.position.set(0, 1.5, -1.5); sc.add(fundo);
  const ela = mulher(SOSIA); ela.position.set(0.24, 0, 0); ela.rotation.y = -0.15; sc.add(ela);
  ela.face({ ...exprP('sorrisoFalso'), eo: 1.55, gx: 0, gy: 0 }); ela.braco('D', 0.15, 0.1, 0.3); ela.braco('E', 0.4, 0.2, 1.2, 0.5); ela.cab.rotation.z = -0.12;
  const di = pessoa(DIEGO); di.position.set(-0.26, 0, 0.05); di.rotation.y = 0.2; sc.add(di);
  di.braco('E', 0.25, 0.15, 0.2); di.braco('D', 0.55, 1.15, 1.5, 0.4); di.face({ expr: 'normal', boca: 0 }); di.cab.rotation.z = 0.05;
  const cam = new THREE.PerspectiveCamera(30, 384 / 480, 0.1, 20); cam.position.set(0, 1.55, 2.35); cam.lookAt(0, 1.4, 0);
  const tm = R.toneMapping; R.toneMapping = THREE.NoToneMapping; R.setRenderTarget(rt); R.setClearColor(sc.background, 1); R.clear(); R.render(sc, cam); R.setRenderTarget(null); R.toneMapping = tm;
  sc.traverse(x => { x.geometry?.dispose?.(); });
  return rt.texture;
}

export function sala(st, T) {
  const S = st.scene, M = {}, R = rnd(5);
  M.hemi = new THREE.HemisphereLight(new THREE.Color('#3a4a6a'), new THREE.Color('#1a120c'), 0.38); S.add(M.hemi);
  { const c = pl(6, 5, lam('#ffffff', { ...FX, map: tTaco() }), 0, 0, 2.5); c.rotation.x = -Math.PI / 2; S.add(c); const t = pl(6, 5, lam('#d8d0c0', FX), 0, 2.7, 2.5); t.rotation.x = Math.PI / 2; S.add(t); }
  const mP = lam('#ffffff', { ...FX, map: tParede('#d8c8a0', 3) });
  const parede = (w, h, x, y, z, ry) => { const p = pl(w, h, mP, x, y, z); p.rotation.y = ry; S.add(p); return p; };
  parede(5, 2.7, -3, 1.35, 2.5, Math.PI / 2); parede(5, 2.7, 3, 1.35, 2.5, -Math.PI / 2);
  parede(2.7, 2.7, -1.65, 1.35, 0, 0); parede(2.45, 2.7, 1.775, 1.35, 0, 0); parede(0.9, 0.6, 0.1, 2.4, 0, 0);   // parede da porta (vão x -0.35..0.55)
  parede(1.4, 2.7, -2.3, 1.35, 5, Math.PI); parede(3.9, 2.7, 1.05, 1.35, 5, Math.PI); parede(0.8, 0.6, -1.2, 2.4, 5, Math.PI);   // fundo (vão da cozinha x -1.6..-0.8)
  S.add(box(6, 0.08, 0.02, lam('#6a4a30', { fixo: true }), 0, 0.04, 4.99), box(0.02, 0.08, 5, lam('#6a4a30', { fixo: true }), -2.99, 0.04, 2.5));   // rodapé
  // cozinha escura + geladeira (vulto)
  { const k = pl(0.8, 2.1, lam('#0a0c10', FX), -1.2, 1.05, 5.8); k.rotation.y = Math.PI; S.add(k); S.add(cbox(0.7, 1.75, 0.6, lam('#9a9ea0', { fixo: true }), -1.2, 0.88, 5.4, 0.05)); S.add(box(0.03, 0.4, 0.03, lam('#5a5e60'), -0.95, 1.1, 5.08)); }
  // porta de entrada (dobradiça em x=-0.35), aberta pra dentro (+z)
  const porta = new THREE.Group(); porta.position.set(-0.35, 0, 0); S.add(porta);
  porta.add(cbox(0.9, 2.1, 0.06, lam('#6a3a1e', { fixo: true }), 0.45, 1.05, 0.03, 0.02)); porta.add(box(0.04, 0.12, 0.05, lam('#c8a040', { fixo: true }), 0.8, 1.0, 0.08)); M.porta = porta;
  M.macaneta = porta.children[1];
  { const f = pl(0.9, 2.1, luz('#d89850'), 0.1, 1.05, -0.6); S.add(f); M.fora = f; }   // luz da rua (arandela) lá fora
  // sofá de veludo vinho (encostado na parede esquerda, virado pra +x)
  const vel = lam('#ffffff', { fixo: true, flat: false, map: tex(32, 32, (g) => { g.fillStyle = '#6a1a2a'; g.fillRect(0, 0, 32, 32); const r = rnd(2); for (let i = 0; i < 160; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,200,210,.06)' : 'rgba(0,0,0,.12)'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 1); } }) });
  { const s = new THREE.Group(); s.position.set(-2.45, 0, 2.3); S.add(s); s.add(cbox(0.85, 0.42, 2.0, vel, 0, 0.3, 0, 0.08)); s.add(cbox(0.28, 0.8, 2.0, vel, -0.32, 0.6, 0, 0.1)); s.add(cbox(0.85, 0.6, 0.25, vel, 0, 0.42, 1.0, 0.1), cbox(0.85, 0.6, 0.25, vel, 0, 0.42, -1.0, 0.1)); for (const z of [-0.45, 0.45]) s.add(cbox(0.62, 0.14, 0.86, vel, 0.05, 0.58, z, 0.06));
    const cro = lam('#f2ece0', { side: THREE.DoubleSide, fixo: true }); const pn = pl(0.5, 0.5, cro, -0.33, 0.95, 0.4); pn.rotation.y = Math.PI / 2; s.add(pn); }
  // mesinha + luminária (a única luz acesa)
  { const m = new THREE.Group(); m.position.set(-2.55, 0, 3.75); S.add(m); m.add(cbox(0.5, 0.6, 0.5, lam('#5a3a22', { fixo: true }), 0, 0.3, 0, 0.03)); m.add(cil(0.08, 0.1, 0.06, lam('#c8b090'), 0, 0.63, 0, 8), cil(0.015, 0.015, 0.35, lam('#c8b090'), 0, 0.82, 0, 6));
    m.add(new THREE.Mesh(anel([{ y: 0.95, rx: 0.2, rz: 0.2 }, { y: 1.2, rx: 0.12, rz: 0.12 }], 10, false), luz('#ffd8a0', { side: THREE.DoubleSide }))); const L = new THREE.PointLight(new THREE.Color('#ffc078'), 7, 7.5, 1.15); L.position.set(0, 1.05, 0); m.add(L); M.lamp = L; }
  // rack + TV de tubo com paninho de crochê
  { const r = new THREE.Group(); r.position.set(2.6, 0, 2.4); r.rotation.y = -Math.PI / 2; S.add(r); r.add(cbox(1.5, 0.5, 0.45, lam('#4a2e1a', { fixo: true }), 0, 0.25, 0, 0.03));
    r.add(cbox(0.72, 0.56, 0.5, lam('#2a2a2c', { fixo: true }), 0, 0.8, 0, 0.06)); r.add(pl(0.56, 0.42, luz('#10141a'), 0, 0.8, 0.252));
    const cro = tex(64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.strokeStyle = '#f2ece0'; g.lineWidth = 2; for (let r0 = 4; r0 < 30; r0 += 5) { g.beginPath(); g.arc(32, 32, r0, 0, 7); g.stroke(); } for (let a = 0; a < 6.28; a += 0.4) { g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + Math.cos(a) * 30, 32 + Math.sin(a) * 30); g.stroke(); } for (let a = 0; a < 6.28; a += 0.3) { g.beginPath(); g.arc(32 + Math.cos(a) * 29, 32 + Math.sin(a) * 29, 2, 0, 7); g.stroke(); } });
    const pn = pl(0.62, 0.62, lam('#ffffff', { map: cro, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, fixo: true }), 0, 1.085, 0); pn.rotation.x = -Math.PI / 2; r.add(pn);
    r.add(cbox(0.12, 0.2, 0.12, lam('#d8d0c0', { fixo: true }), 0.15, 1.18, 0, 0.03)); }
  // filtro de barro na cantoneira
  { const f = new THREE.Group(); f.position.set(2.5, 0, 4.4); S.add(f); f.add(cbox(0.5, 0.75, 0.5, lam('#5a3a22', { fixo: true }), 0, 0.375, 0, 0.03)); const barro = lam('#b85a32', { fixo: true, flat: false });
    f.add(new THREE.Mesh(anel([{ y: 0.75, rx: 0.12, rz: 0.12 }, { y: 0.95, rx: 0.18, rz: 0.18 }, { y: 1.12, rx: 0.17, rz: 0.17 }, { y: 1.15, rx: 0.15, rz: 0.15 }, { y: 1.35, rx: 0.17, rz: 0.17 }, { y: 1.5, rx: 0.15, rz: 0.15 }, { y: 1.55, rx: 0.05, rz: 0.05 }], 12), barro)); f.add(box(0.04, 0.04, 0.08, lam('#d8d8d0'), 0, 0.85, -0.17)); }
  // relógio de parede (ponteiros)
  { const c = new THREE.Group(); c.position.set(0.6, 2.05, 4.97); c.rotation.y = Math.PI; S.add(c); c.add(cil(0.2, 0.2, 0.04, lam('#3a2a1a', { fixo: true }), 0, 0, 0, 16).rotateX(Math.PI / 2)); const mostr = pl(0.34, 0.34, lam('#ffffff', { fixo: true, map: tex(32, 32, (g) => { g.fillStyle = '#f0ead8'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill(); g.fillStyle = '#2a2a2a'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillRect(16 + Math.cos(a) * 12 - 1, 16 + Math.sin(a) * 12 - 1, 2, 2); } }), transparent: true, alphaTest: 0.5 }), 0, 0, 0.025); c.add(mostr);
    M.ponteiro = box(0.008, 0.13, 0.005, lam('#1a1a1a'), 0, 0.05, 0.03); const pg = new THREE.Group(); pg.position.z = 0.0; pg.add(M.ponteiro); c.add(pg); M.ponteiroG = pg; const h = box(0.012, 0.09, 0.005, lam('#1a1a1a'), 0, 0.035, 0.031); const hg = new THREE.Group(); hg.add(h); hg.rotation.z = -2.2; c.add(hg); }
  // estante com objetos e o porta-retrato
  { const e = new THREE.Group(); e.position.set(1.6, 0, 4.78); S.add(e); const md = lam('#5a3a22', { fixo: true });
    e.add(box(1.4, 1.9, 0.05, md, 0, 0.95, 0.18)); for (const y of [0.05, 0.55, 1.08, 1.6, 1.9]) e.add(box(1.4, 0.04, 0.38, md, 0, y, 0)); e.add(box(0.04, 1.9, 0.38, md, -0.7, 0.95, 0), box(0.04, 1.9, 0.38, md, 0.7, 0.95, 0));
    for (let i = 0; i < 9; i++) e.add(box(0.05, 0.25 + R() * 0.08, 0.2, lam(['#7a2a2a', '#2a4a7a', '#c8b070', '#3a6a3a'][i % 4], { fixo: true }), 0.25 + i * 0.05, 0.72, 0));
    e.add(new THREE.Mesh(anel([{ y: 0, rx: 0.06, rz: 0.06 }, { y: 0.18, rx: 0.08, rz: 0.08 }, { y: 0.24, rx: 0.04, rz: 0.04 }], 8), lam('#3a7a9a', { fixo: true })).translateX(-0.45).translateY(1.1));
    const ft = fotoTex(T); const quadro = new THREE.Group(); quadro.position.set(-0.1, 1.27, -0.05); quadro.rotation.x = -0.12; e.add(quadro);
    quadro.add(cbox(0.27, 0.33, 0.025, lam('#c8a048', { fixo: true }), 0, 0, 0.01, 0.01)); const im = pl(0.22, 0.275, new THREE.MeshBasicMaterial({ map: ft }), 0, 0, -0.004); im.rotation.y = Math.PI; quadro.add(im);
    quadro.add(box(0.03, 0.2, 0.02, lam('#a88038'), 0, -0.07, 0.07).rotateX(-0.4)); M.foto = quadro; M.fotoPos = [1.5, 1.27, 4.73]; }
  // janela com luar
  { const j = pl(1.2, 1.2, luz('#1a2a44'), 2.98, 1.6, 1.0); j.rotation.y = -Math.PI / 2; S.add(j); const L = new THREE.PointLight(new THREE.Color('#5a7ab0'), 1.4, 4, 1.4); L.position.set(2.5, 1.6, 1.0); S.add(L); }
  // "ela" na porta (a sósia) + luz que bate no rosto dela
  M.sosia = mulher(SOSIA); M.sosia.position.set(0.1, 0, -0.45); S.add(M.sosia); M.sosia.visible = false;
  M.luzSosia = new THREE.PointLight(new THREE.Color('#ffc890'), 0, 2.2, 1.3); M.luzSosia.position.set(0.1, 1.75, 0.35); S.add(M.luzSosia);
  M.recorte = new THREE.PointLight(new THREE.Color('#ffd0a0'), 2.2, 4, 1.4); S.add(M.recorte);
  return M;
}
