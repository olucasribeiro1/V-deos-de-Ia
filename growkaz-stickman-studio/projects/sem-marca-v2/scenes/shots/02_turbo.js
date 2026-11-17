// Sem Marca v2 — tomadas 3D turbinadas (sobrescrevem B e I do 01_planos)
import { E, registerShot, ease, prog, clamp, lerp, circle, rr, text, FONTS, alpha } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import { W, rotulo } from '/series/mamae/comum.js';
import { chamas } from '/series/semmarca/mundo.js';
import { dragao, luas, cidade3D, MODO } from '/series/semmarca/tres.js';
import { palco, pbr, m, boneco2D, particulas, terreno, arvore } from '/series/semmarca/turbo.js';
import { PROTAGONISTA as VC, FIGURANTE as FG } from '../cast.js';
const pop = (T, t0, d = 0.25) => ease.outBack(prog(T, t0 - 0.1, t0 + d));
const proj = (s, x, y, z) => { const v = new s.V(x, y, z).project(s.st.camera); return [(v.x + 1) / 2 * E.W, (1 - v.y) / 2 * E.H]; };
const balao = (g, x, y, str, a, c = '#fff') => { if (a <= 0) return; g.save(); g.translate(x, y); g.scale(a, a); g.font = '900 40px Nunito'; const w = g.measureText(str).width + 50; rr(g, -w / 2, -36, w, 72, 36); g.fillStyle = '#0b0b0d'; g.fill(); rr(g, -w / 2 + 6, -30, w - 12, 60, 30); g.fillStyle = c; g.fill(); text(g, str, 0, 2, { size: 40, color: '#0b0b0d', font: FONTS.ui, weight: 900 }); g.restore(); };
// HUD de jogo (estilo isekai): nome, nível, marca
export function hud(g, T, o = {}) { const a = o.a ?? 1; if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(540, 300);
  rr(g, -250, -56, 500, 112, 22); g.fillStyle = 'rgba(10,8,22,.82)'; g.fill(); g.strokeStyle = 'rgba(200,170,255,.55)'; g.lineWidth = 3; g.stroke();
  text(g, o.nome || 'VOCÊ', -220, -18, { size: 40, color: '#fff', font: FONTS.ui, weight: 900, align: 'left' }); text(g, o.nivel || 'Nv. ?', 220, -18, { size: 36, color: '#ffd23a', font: FONTS.ui, weight: 900, align: 'right' });
  text(g, 'MARCA:', -220, 26, { size: 26, color: '#b8a8d8', font: FONTS.ui, weight: 900, align: 'left' }); text(g, o.marca || '—', -110, 26, { size: 26, color: o.corMarca || '#ff6a8a', font: FONTS.ui, weight: 900, align: 'left' });
  rr(g, 30, 16, 190, 16, 8); g.fillStyle = 'rgba(255,255,255,.15)'; g.fill(); rr(g, 30, 16, 190 * (o.barra ?? 0.05), 16, 8); g.fillStyle = '#7dff4a'; g.fill(); g.restore(); }

// B — chegada: olho abre, céu azul, duas luas, dragão; você no morro; a cidade lá embaixo
registerShot('B', { kind: '3d',
  init(T) { MODO.pbr = true; const THREE = T.THREE;
    const st = palco(T, { sky: ['#0a4ad0', '#3aa8ff', '#d8f4ff'], fog: [140, 420], fogColor: '#bfe4ff', exposicao: 0.95, keyColor: '#fff2d8', keyIntensity: 3.4, keyPos: [-30, 30, 20], ambient: 1.0, ambientSky: '#bfe0ff', shadowSize: 24, fov: 50, foco: 8, abertura: 0.0018, bloom: 0.35, bloomLimiar: 0.9, barril: 0.12, quente: 0.02, sat: 1.3, env: 0.5 });
    const ter = terreno(T, { morro: true, seed: 4 }); st.add(ter);
    const cid = cidade3D(T, 45, 0); cid.position.y = -0.6; st.add(cid); const base = m(T, new THREE.CylinderGeometry(19, 21, 3, 40), pbr(T, '#7aa860'), 45, -1.4, 0); st.add(base);
    st.add(luas(T)); const r = [[8, -6], [-6, 9], [12, 10], [-10, -12], [18, -14], [22, 12], [-16, 4], [6, 16], [-3, -18], [26, -4]]; r.forEach(([x, z], i) => st.add(arvore(T, x, z, ter.alt(x, z) - 0.1, 0.9 + (i % 3) * 0.3, i + 2)));
    for (let i = 0; i < 12; i++) { const a = -1.3 + i * 0.22, d = 140, h = 30 + (i % 4) * 12; const mt = m(T, new THREE.ConeGeometry(18 + (i % 3) * 6, h, 6), pbr(T, ['#5aa0d8', '#3a88c0', '#4ab08a'][i % 3], { r: 0.9 }), Math.cos(a) * d + 40, h / 2 - 2, Math.sin(a) * d); mt.castShadow = false; st.add(mt); st.add(m(T, new THREE.ConeGeometry(6, h * 0.24, 6), pbr(T, '#ffffff'), Math.cos(a) * d + 40, h * 0.88 - 2, Math.sin(a) * d)); }
    const dr = dragao(T); st.add(dr); const dr2 = dragao(T, '#2a6ad8'); dr2.scale.setScalar(0.6); st.add(dr2);
    const eu = boneco2D(T); eu.position.set(0, ter.alt(0, 0) - 0.05, 0); st.add(eu);
    const vag = particulas(T, { n: 260, centro: [4, 0.5, 0], ext: [30, 5, 30], cor: '#ffe9a0', tam: 0.12, sobe: 0.15 }); st.add(vag);
    const p2 = particulas(T, { n: 120, centro: [45, 2, 0], ext: [40, 14, 40], cor: '#fff6c0', tam: 0.3, sobe: 0.3, seed: 7 }); st.add(p2);
    return { stage: st, st, dr, dr2, eu, vag, p2, ter, V: THREE.Vector3 }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tDr = W('dragão', L.n04), tLa = L.n05[0], tMu = W('mundo', L.n05), k = (x) => x - t0, y0 = s.ter.alt(0, 0);
    T.dolly(s.st.camera, lt, [[0, { pos: [0.3, y0 + 1.6, 0.4], look: [6, 40, -50], fov: 62 }], [k(tDr) - 0.5, { pos: [0.3, y0 + 1.6, 0.4], look: [-6, 34, -40], fov: 62 }], [k(tDr) + 2.0, { pos: [0.3, y0 + 1.6, 0.4], look: [-4, 18, -50], fov: 60 }],
      [k(tLa) + 0.2, { pos: [-3.6, y0 + 2.2, -0.35], look: [45, y0 - 4, 0], fov: 48 }], [k(tLa) + 2.4, { pos: [-4.2, y0 + 2.5, -0.45], look: [45, y0 - 3.5, 0], fov: 46 }], [k(tMu) - 0.4, { pos: [-6, y0 + 4.5, 3], look: [45, 2, 0], fov: 44 }], [info.dur, { pos: [-12, y0 + 9, 9], look: [45, 4, 0], fov: 46 }]]);
    const pd = clamp((Tg - (tDr - 1.6)) / 3.4); s.dr.position.set(-2 + pd * 6, 20 - pd * 2, 40 - pd * 100); s.dr.rotation.set(0, Math.PI / 2 + 0.1, -0.08); s.dr.scale.setScalar(1.6); s.dr.update(Tg);
    const a = Tg * 0.5; s.dr2.position.set(45 + Math.cos(a) * 26, 26 + Math.sin(Tg) * 2, Math.sin(a) * 26); s.dr2.rotation.set(0, -a, 0.25); s.dr2.update(Tg + 1);
    s.eu.olha(s.st.camera); s.eu.desenha({ facing: 1, outfit: VC, pose: breathe(Tg > tMu ? { ...POSES.stand, eF: [22, -150], hF: [40, -190] } : POSES.stand, Tg, 1, 1), expr: Tg > tLa ? 'shocked' : 'blank', look: [1, 0], t: Tg, emote: Tg > tMu ? 'sparkle' : null });
    s.vag.update(Tg); s.p2.update(Tg); s.st.tick(Tg);
    const cp = s.st.camera.position, fd = Tg > tLa && Tg < tMu - 0.4 ? Math.hypot(cp.x, cp.z) + 0.3 : 40; s.st.foco(fd, Tg > tLa && Tg < tMu - 0.4 ? 0.0008 : 0.0003); },
  overlay(g, lt, info) { const Tg = info.globalT, L = info.L;
    const ab = ease.inOut(prog(lt, 0.15, 1.1)); if (ab < 1) { g.fillStyle = '#000'; const h = (1 - ab) * E.H / 2 + (lt < 0.6 ? Math.sin(lt * 20) * 30 * (1 - ab) : 0); g.fillRect(-E.W, -E.H, E.W * 3, E.H + h); g.fillRect(-E.W, E.H - h, E.W * 3, E.H); }
    if (Tg > W('azul', L.n04) - 0.1 && Tg < W('luas', L.n04) - 0.15) rotulo(g, 'CÉU AZUL', Tg - W('azul', L.n04), 1180, '#ff8ad8', 90);
    if (Tg > W('luas', L.n04) - 0.1 && Tg < W('dragão', L.n04) - 0.3) rotulo(g, '2 LUAS', Tg - W('luas', L.n04), 1180, '#c8f6ff', 100);
    if (Tg > L.n05[0] + 0.5) hud(g, Tg, { nome: 'VOCÊ', nivel: 'Nv. 0', marca: '???', a: prog(Tg, L.n05[0] + 0.5, L.n05[0] + 0.9) });
    if (Tg > W('mundo', L.n05) - 0.2) rotulo(g, 'OUTRO MUNDO', Tg - W('mundo', L.n05) + 0.2, 520, '#ffd23a', 110); } });

// I — o salão da Academia, piso polido com reflexo, vitrais, cristal; o garoto incendeia o cristal
registerShot('I', { kind: '3d',
  init(T) { MODO.pbr = true; const THREE = T.THREE;
    const st = palco(T, { sky: '#120a26', fog: [40, 120], fogColor: '#1a1030', keyColor: '#ffe0c8', keyIntensity: 2.2, keyPos: [-6, 18, 10], ambient: 1.1, ambientSky: '#a890ff', shadowSize: 16, fov: 42, foco: 8, abertura: 0.0012, bloom: 0.35, bloomLimiar: 0.92, barril: 0.1, sat: 1.28, env: 0.55, exposicao: 0.95 });
    const g = new THREE.Group(); st.add(g);
    const piso = m(T, new THREE.PlaneGeometry(40, 60), new THREE.MeshStandardMaterial({ color: '#4a3a6a', roughness: 0.18, metalness: 0.2, map: T.tiles('#4a3a6a', 10, [6, 9]) })); piso.rotation.x = -Math.PI / 2; g.add(piso);
    const tap = m(T, new THREE.PlaneGeometry(3.2, 40), pbr(T, '#a8283a', { r: 0.95 }), 0, 0.01, 4); tap.rotation.x = -Math.PI / 2; g.add(tap);
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { g.add(m(T, new THREE.CylinderGeometry(0.6, 0.7, 14, 24), pbr(T, '#e6dcf0', { r: 0.35 }), sx * 5.5, 7, -14 + i * 7)); g.add(m(T, new THREE.BoxGeometry(1.8, 0.5, 1.8), pbr(T, '#c8b8e0', { r: 0.4 }), sx * 5.5, 0.25, -14 + i * 7)); g.add(m(T, new THREE.BoxGeometry(1.8, 0.5, 1.8), pbr(T, '#c8b8e0', { r: 0.4 }), sx * 5.5, 13.8, -14 + i * 7)); }
    for (const sx of [-1, 1]) for (let k2 = 0; k2 < 5; k2++) g.add(m(T, new THREE.BoxGeometry(6, 0.8, 34), pbr(T, '#3a2852', { r: 0.8 }), sx * (10 + k2 * 2), 0.4 + k2 * 0.8, 0));
    // plateia: corpos e cabeças instanciados (bonecos brancos)
    const pos = []; for (const sx of [-1, 1]) for (let k2 = 0; k2 < 5; k2++) for (let z = -15; z <= 15; z += 1.2) pos.push([sx * (10 + k2 * 2), 0.8 + k2 * 0.8, z]);
    const inst = (geo, mat, dy) => { const im = new THREE.InstancedMesh(geo, mat, pos.length), M4 = new THREE.Matrix4(); pos.forEach((p, i) => { M4.makeTranslation(p[0], p[1] + dy, p[2]); im.setMatrixAt(i, M4); }); im.castShadow = true; im.receiveShadow = true; return im; };
    const branco = pbr(T, '#f1efe9', { r: 0.6 }); const corpos = inst(new THREE.CapsuleGeometry(0.2, 0.55, 4, 10), branco, 0.5), cabs = inst(new THREE.SphereGeometry(0.28, 16, 12), branco, 1.25); g.add(corpos, cabs);
    const parede = m(T, new THREE.BoxGeometry(40, 22, 1), new THREE.MeshStandardMaterial({ color: '#8a70b0', roughness: 0.9, map: T.tiles('#6a5490', 14, [10, 6]) }), 0, 11, -20); g.add(parede); for (const sx of [-1, 1]) { const pl = m(T, new THREE.BoxGeometry(1, 22, 60), new THREE.MeshStandardMaterial({ color: '#7a60a0', roughness: 0.9, map: T.tiles('#5a4680', 14, [14, 6]) }), sx * 20, 11, 0); g.add(pl); }
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const tl = new THREE.PointLight('#ffb060', 6, 12, 2); tl.position.set(sx * 5.5 + sx * -0.8, 5.5, -11 + i * 7); g.add(tl); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd080' })); fl.position.copy(tl.position); g.add(fl); }
    for (let i = -2; i <= 2; i++) { const w = T.windowPane(2.6, 7, { glowColor: ['#ff4a6a', '#2a9dff', '#ffd23a', '#4ade6a', '#a64bff'][i + 2], cols: 3, rows: 4, power: 1.0 }); w.position.set(i * 6.5, 9, -19.4); g.add(w); const sh = T.shaft(3, 26, ['#ff4a6a', '#2a9dff', '#ffd23a', '#4ade6a', '#a64bff'][i + 2], 0.025); sh.position.set(i * 6.5, 9, -19); sh.rotation.x = -1.0; g.add(sh); }
    for (let i = -2; i <= 2; i++) { const b = m(T, new THREE.PlaneGeometry(1.6, 5), new THREE.MeshStandardMaterial({ color: i % 2 ? '#c0283a' : '#2a4ad8', side: THREE.DoubleSide, roughness: 0.9 }), i * 6.5 + 3.2, 13, -19.3); g.add(b); }
    const ped = new THREE.Group(); ped.add(m(T, new THREE.CylinderGeometry(1.3, 1.5, 0.5, 32), pbr(T, '#8a7aa8', { r: 0.3 }), 0, 0.25, 0)); ped.add(m(T, new THREE.CylinderGeometry(0.8, 1.0, 1.4, 32), pbr(T, '#a898c8', { r: 0.3 }), 0, 1.2, 0)); ped.add(m(T, new THREE.CylinderGeometry(1.2, 1.2, 0.25, 32), pbr(T, '#d8c8f0', { r: 0.25, m: 0.3 }), 0, 2.0, 0)); ped.position.set(0, 0, -6); g.add(ped);
    const crM = new THREE.MeshPhysicalMaterial({ color: '#bfe8ff', emissive: '#4aa8ff', emissiveIntensity: 0.5, roughness: 0.05, metalness: 0, transmission: 0.3, thickness: 1, clearcoat: 1, flatShading: true }); const cr = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 0), crM); cr.scale.set(0.8, 1.4, 0.8); cr.position.set(0, 3.8, -6); g.add(cr);
    const luz = new THREE.PointLight('#6ac8ff', 12, 20, 1.6); luz.position.set(0, 4, -5); luz.castShadow = false; g.add(luz);
    const boy = boneco2D(T); boy.position.set(-1.8, 0, -6); g.add(boy); const eu = boneco2D(T); eu.position.set(-4.0, 0, -2.6); g.add(eu);
    const brasas = particulas(T, { n: 220, centro: [0, 2.5, -6], ext: [3, 5, 3], cor: '#ff8a3a', tam: 0.14, sobe: 1.4, seed: 4, opac: 0 }); g.add(brasas);
    const poeira = particulas(T, { n: 300, centro: [0, 0, -2], ext: [14, 12, 30], cor: '#ffe6c0', tam: 0.06, sobe: 0.05, seed: 8, opac: 0.5 }); g.add(poeira);
    return { stage: st, st, cr, crM, luz, boy, eu, brasas, poeira, cabs, corpos, pos, V: THREE.Vector3, C: THREE.Color, M4: THREE.Matrix4 }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tFu = W('funciona', L.n13), tGa = L.n14[0], tFo = W('fogo', L.n14), tPl = W('plateia', L.n14), k = (x) => x - t0;
    T.dolly(s.st.camera, lt, [[0, { pos: [0, 5, 24], look: [0, 4, -6], fov: 50 }], [k(tFu), { pos: [0.5, 3.8, 9], look: [0, 3.2, -6], fov: 44 }], [k(tGa), { pos: [1.4, 2.7, 3.2], look: [-1.3, 2.5, -6], fov: 42 }], [k(tFo) + 0.3, { pos: [1.8, 2.7, 2.2], look: [-0.6, 3.0, -6], fov: 44 }], [info.dur, { pos: [2.5, 4.5, 6], look: [0, 3, -6], fov: 50 }]]);
    const fogo = clamp((Tg - tFo + 0.1) / 0.4); s.crM.emissive.copy(new s.C('#4aa8ff').lerp(new s.C('#ff3a0a'), fogo)); s.crM.emissiveIntensity = 0.3 + 1.2 * fogo; s.luz.color.copy(new s.C('#6ac8ff').lerp(new s.C('#ff5a1a'), fogo)); s.luz.intensity = 6 + 40 * fogo;
    s.cr.rotation.y = Tg * 0.8; s.cr.position.y = 3.8 + Math.sin(Tg * 2) * 0.12; s.brasas.material.opacity = 0.95 * fogo; s.brasas.update(Tg); s.poeira.update(Tg);
    if (Tg > tPl) { const M4 = new s.M4(); s.pos.forEach((p, i) => { const b = Math.abs(Math.sin(Tg * 9 + i * 1.7)) * 0.25 * clamp((Tg - tPl) / 0.3); M4.makeTranslation(p[0], p[1] + 1.25 + b, p[2]); s.cabs.setMatrixAt(i, M4); M4.makeTranslation(p[0], p[1] + 0.5 + b, p[2]); s.corpos.setMatrixAt(i, M4); }); s.cabs.instanceMatrix.needsUpdate = true; s.corpos.instanceMatrix.needsUpdate = true; }
    s.boy.olha(s.st.camera); s.eu.olha(s.st.camera);
    s.boy.desenha({ facing: 1, outfit: { top: 'dress', color: '#c0283a', head: 'none' }, pose: breathe(Tg > tGa + 0.6 ? { ...POSES.stand, eF: [30, -150], hF: [62, -160] } : POSES.stand, Tg, 1, 2), expr: Tg > tFo ? 'proud' : 'determined', t: Tg, marca: { n: 1, cor: '#ff4a1a', brilho: 1 } });
    s.eu.desenha({ facing: 1, outfit: VC, pose: breathe(POSES.stand, Tg, 1, 1), expr: Tg > tFo ? 'gulp' : 'nervous', t: Tg, emote: Tg > tFo ? 'sweat' : null });
    s.st.tick(Tg); const d = s.st.camera.position.distanceTo(new s.V(0, 3.8, -6)); s.st.foco(d, Tg > tGa ? 0.0015 : 0.0008);
    if (Tg > tPl) { const sh = 0.05 * Math.sin(Tg * 40) * (1 - clamp((Tg - tPl) / 2)); s.st.camera.position.x += sh; } },
  overlay(g, lt, info, s) { const Tg = info.globalT, L = info.L, tFo = W('fogo', L.n14), tPl = W('plateia', L.n14), tCr = W('cristal', L.n13);
    if (Tg > tCr - 0.1 && Tg < W('funciona', L.n13) + 1.5) rotulo(g, 'TESTE DO CRISTAL', Tg - tCr + 0.1, 470, '#9fd8ff', 92);
    if (Tg > W('acende', L.n13) - 0.1 && Tg < L.n14[0]) { ['#ff4a1a', '#2a9dff', '#b8743a', '#e8f4ff', '#ffe23a'].forEach((c, i) => { const a = pop(Tg, W('acende', L.n13) + i * 0.08); circle(g, 340 + i * 100, 1220, 34 * a, c); g.strokeStyle = '#0b0b0d'; g.lineWidth = 6; g.beginPath(); g.arc(340 + i * 100, 1220, 34 * a, 0, 7); g.stroke(); }); }
    if (Tg > L.n14[0] && Tg < tFo + 0.6) balao(g, 540, 560, '1 LINHA VERMELHA', pop(Tg, W('vermelha', L.n14)), '#ff8a6a');
    if (Tg > tFo - 0.1) { const [cx, cy] = proj(s, 0, 3.8, -6); chamas(g, cx, cy + 40, 1.0, Tg, 0.7 * prog(Tg, tFo - 0.1, tFo + 0.3)); }
    if (Tg > tPl - 0.1) rotulo(g, 'A PLATEIA PIRA', Tg - tPl + 0.1, 470, '#ffd23a', 92); } });
