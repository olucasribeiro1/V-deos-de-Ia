// Sem Marca Ep.1 v2 — morte, mapa, marcas, ciência dos elementos, lago, cidade, cristal, diretor, gato
import { E, registerShot, ease, prog, clamp, lerp, rr, text, FONTS, glow, veil } from '/engine/core.js';
import { POSES, breathe, walkPose, bigFace, drawFigure } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { W, rotulo, mist, legendaTopo } from '/series/mamae/comum.js';
import { MODO } from '/series/semmarca/tres.js';
import { palco, pbr, m, boneco2D, particulas, terreno, arvore } from '/series/semmarca/turbo.js';
import { cenaMorte } from '/series/semmarca/avenida3d.js';
import { gato3D } from '/series/semmarca/dragao3d.js';
import { mapaAldoria, palcoMapa, voo, rotulosMapa } from '/series/semmarca/mapa3d.js';
import { rua3D, castelo3D } from '/series/semmarca/cidade3d.js';
import { pessoa3D, multidao3D, aparenciaAleatoria, GUARDA, MAGO, DIRETOR, REI_MAGO, GAROTO_FOGO, CRIANCA, ANAO, ELEMENTOS } from '/series/semmarca/gente3d.js';
import { fogo, agua, muralha, navio, monstro, raio, aura, biblioteca3D, lago3D } from '/series/semmarca/magia3d.js';
import { rotuloTecnico, popupMissao, tagNivel, glitch } from '/series/semmarca/hud.js';
import { PROTAGONISTA as VC } from '../cast.js';
const INK = '#0b0b0d', WH = '#f1efe9';
const pop = (T, t0, d = 0.25) => ease.outBack(prog(T, t0 - 0.1, t0 + d));
const balao = (g, x, y, str, a, c = '#fff') => { if (a <= 0) return; g.save(); g.translate(x, y); g.scale(a, a); g.font = '900 40px Nunito'; const w = g.measureText(str).width + 50; rr(g, -w / 2, -36, w, 72, 36); g.fillStyle = INK; g.fill(); rr(g, -w / 2 + 6, -30, w - 12, 60, 30); g.fillStyle = c; g.fill(); text(g, str, 0, 2, { size: 40, color: INK, font: FONTS.ui, weight: 900 }); g.restore(); };
const dia = (T, o = {}) => palco(T, { sky: ['#0a4ad0', '#3aa8ff', '#d8f4ff'], fog: [80, 300], fogColor: '#bfe4ff', keyColor: '#fff2d8', keyIntensity: 3.2, keyPos: [-20, 30, 25], ambient: 1.1, ambientSky: '#bfe0ff', shadowSize: 22, fov: 46, ao: false, abertura: 0.0008, bloom: 0.3, bloomLimiar: 0.9, barril: 0.08, sat: 1.15, env: 0.4, exposicao: 0.95, ...o });
const proj = (s, v) => { const p = v.clone().project(s.st.camera); return [(p.x + 1) / 2 * E.W, (1 - p.y) / 2 * E.H]; };
const M = (n, cor, b = 0.8) => ({ n, cor, brilho: b });

// A — a morte (avenida 3D à noite, plano contínuo)
registerShot('A', { kind: '3d',
  init(T, info) { const L = info.L; const c = cenaMorte(T, { tGato: W('bichano', L.n02) - 0.4, tCaminhao: W('caminhão', L.n02), tCorre: W('você', L.n02), tPulo: W('pulou', L.n02), tImpacto: W('calçada', L.n02) + 0.1, tIleso: W('gato', L.n03) - 0.2, fim: info.shot.end, gato: gato3D(T), gatoRotY: Math.PI / 2 }); return { stage: c.stage, c }; },
  draw(s, lt, info) { s.c.update(info.globalT); },
  overlay(g, lt, info, s) { s.c.overlay(g, info.globalT); const T = info.globalT, L = info.L, tIl = W('ileso', L.n03), tEs = W('estatística', L.n03);
    if (T < 2.2) rotulo(g, 'VOCÊ MORREU', T - 0.4, 470, '#ff4a4a', 110);
    if (T > tIl - 0.1 && T < tEs - 0.3) rotulo(g, 'ILESO ✓', T - tIl + 0.1, 470, '#7dff4a', 110);
    if (T > tEs - 0.2) { const a = pop(T, tEs); veil(g, '#000', 0.55 * prog(T, tEs - 0.2, tEs + 0.2)); g.save(); g.translate(540, 820); g.scale(a, a); rr(g, -330, -150, 660, 300, 30); g.fillStyle = INK; g.fill(); rr(g, -320, -140, 640, 280, 24); g.fillStyle = '#f2ead8'; g.fill(); text(g, 'ACIDENTES DE TRÂNSITO', 0, -80, { size: 34, color: '#3a3a44', font: FONTS.ui, weight: 900 }); text(g, '+1', 0, 30, { size: 150, color: '#d8342b' }); g.restore(); } } });

// M — o mapa de Aldoria (4 nações)
registerShot('M', { kind: '3d',
  init(T) { const st = palcoMapa(T, { ao: false, dof: false }); const mapa = mapaAldoria(T, { res: 140 }); st.add(mapa); return { stage: st, st, mapa }; },
  draw(s, lt, info) { const L = info.L, t0 = info.shot.start; s.K = s.K || { tAldoria: W('aldoria', L.n07) - t0, tNorte: W('norte', L.n07) - t0, tMontanhas: W('montanhas', L.n07) - t0, tCentro: W('centro', L.n07) - t0, tSul: W('sul', L.n07) - t0, fim: info.dur };
    voo(s.st.camera, lt, s.K, s.mapa); s.mapa.update(info.globalT); s.st.tick(info.globalT); },
  overlay(g, lt, info, s) { const c = s.st.camera, tela = {}; for (const n of ['norte', 'montanhas', 'centro', 'sul']) tela[n] = s.mapa.tela(c, n); rotulosMapa(g, lt, { ...s.K, tela, y: 330 }); } });

// C0 — as marcas: rua 3D viva; elite (1), soldado/ferreiro (2), trabalho pesado (3); ninguém olha
registerShot('C0', { kind: '3d',
  init(T) { MODO.pbr = true; const THREE = T.THREE, st = dia(T); st.add(rua3D(T, { x0: -15, x1: 70, poco: true, pocoX: 34, seed: 8 }));
    const sp = [];
    for (let i = 0; i < 6; i++) sp.push({ tipo: 'anda', x: -4 + i * 5, x1: 4 + i * 5, z: -3.6 + (i % 3) * 0.5, vel: 0.9 + (i % 3) * 0.2, seed: 40 + i });
    for (let i = 0; i < 3; i++) { sp.push({ tipo: 'conversa', x: 6 + i * 9, z: -2.6, frente: 1, lado: 0, seed: 60 + i }); sp.push({ tipo: 'conversa', x: 7.1 + i * 9, z: -2.5, frente: -1, lado: 1, seed: 70 + i }); }
    sp.push({ tipo: 'parado', x: 8, z: -1.6, aparencia: { ...MAGO, marca: M(1, ELEMENTOS.fogo, 1.3) }, estado: 'cajado', rot: 0.4, expr: 'orgulho', papel: 'elite' });
    sp.push({ tipo: 'parado', x: 17, z: -1.8, aparencia: { ...GUARDA, marca: M(2, ELEMENTOS.agua) }, estado: 'parado', rot: 0.3, expr: 'desconfiado' });
    sp.push({ tipo: 'parado', x: 19.5, z: -2.2, aparencia: { ...ANAO, marca: M(2, ELEMENTOS.terra) }, estado: 'martelar', rot: 0.6 });
    for (let i = 0; i < 3; i++) sp.push({ tipo: 'carrega', x: 27 + i * 1.2, x1: 34 + i, z: -2.8 + i * 0.9, vel: 0.6, seed: 90 + i, aparencia: { ...aparenciaAleatoria(90 + i), marca: M(3, [ELEMENTOS.vento, ELEMENTOS.raio, ELEMENTOS.terra][i], 0.3) }, expr: 'medo' });
    const mul = multidao3D(T, sp); st.add(mul); const eu = boneco2D(T); eu.position.set(0, 0, 0.6); st.add(eu); return { stage: st, st, mul, eu, V: THREE.Vector3 }; },
  draw(s, lt, info) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, t2 = W('duas', L.n08), t3 = W('três', L.n08), tNi = W('ninguém', L.n08);
    const ex = lerp(1, 30, clamp(lt / info.dur)); s.eu.position.x = ex; const c = s.st.camera;
    const alvoX = Tg < t2 ? 8 : Tg < t3 ? 18 : 29; const kx = lerp(ex, alvoX, 0.55);
    c.position.set(kx - 3.6, 1.9, 2.6); c.lookAt(kx + 2.5, 1.5, -1.6); c.fov = 46; c.updateProjectionMatrix();
    s.mul.update(Tg, c, { extra: (p, sp) => sp.papel === 'elite' && Tg > W('elite', L.n08) - 0.3 ? { opts: { brilho: 1 } } : null });
    s.eu.olha(c); s.eu.desenha({ facing: 1, outfit: VC, pose: walkPose(Tg * 2.0), expr: Tg > tNi ? 'sad' : 'suspicious', look: [0.5, -0.1], t: Tg, emote: Tg > tNi ? 'gloom' : null });
    s.st.foco(c.position.distanceTo(new s.V(kx + 1.5, 1.5, -1.6)), 0.0008); s.st.tick(Tg); },
  overlay(g, lt, info) { const Tg = info.globalT, L = info.L, t1 = W('linha', L.n08), t2 = W('duas', L.n08), t3 = W('três', L.n08), tNi = W('ninguém', L.n08);
    if (Tg < t1 - 0.2) rotulo(g, 'A MARCA', Tg - W('marca', L.n08), 420, '#ffd23a', 110);
    const lab = (str, sub, c, tt, end) => { if (Tg < tt - 0.1 || Tg > end) return; const a = pop(Tg, tt); g.save(); g.translate(540, 360); g.scale(a, a); text(g, str, 0, 0, { size: 112, color: c, stroke: 20, strokeColor: INK }); text(g, sub, 0, 100, { size: 50, color: WH, stroke: 12, strokeColor: INK, font: FONTS.ui, weight: 900 }); g.restore(); };
    lab('1 LINHA', 'ELITE', '#ffd23a', t1, t2 - 0.15); lab('2 LINHAS', 'SOLDADO · FERREIRO', '#9fd8ff', t2, t3 - 0.15); lab('3 LINHAS', 'TRABALHO PESADO', '#ff6a6a', t3, 99);
    if (Tg > tNi) rotulo(g, 'NINGUÉM OLHA', Tg - tNi, 640, WH, 76); } });

// E — a ciência de cada elemento: campo de treino com 5 magos 3D + a dourada do Rei Mago
const XS = [0, 14, 28, 42, 56, 72];
registerShot('E', { kind: '3d',
  init(T) { MODO.pbr = true; const THREE = T.THREE, st = dia(T, { fog: [90, 320] }); const ter = terreno(T, { seed: 12, grama: 7000, gramaExt: 160, flores: 600, pedras: 0 }); ter.position.x = 36; st.add(ter); const H = (x, z = 0) => ter.alt(x - 36, z);
    for (let i = 0; i < 18; i++) st.add(arvore(T, -10 + i * 6, -16 - (i % 3) * 3, 0, 1 + (i % 3) * 0.3, i + 5));
    st.add(castelo3D(T, 40, -70, 1.4));
    const cores = [['#c0283a', ELEMENTOS.fogo], ['#2a5ad8', ELEMENTOS.agua], ['#8a5a30', ELEMENTOS.terra], ['#8ac8e8', ELEMENTOS.vento], ['#d8b020', ELEMENTOS.raio]];
    const magos = cores.map(([c, mc], i) => { const p = pessoa3D(T, { ...MAGO, chapeuCor: c, cor: c, capa: c, marca: M(1, mc, 1.2), seed: 300 + i }); p.position.set(XS[i], H(XS[i]), 0); p.rotation.y = Math.PI / 2; st.add(p); return p; });
    const rei = pessoa3D(T, REI_MAGO); rei.position.set(XS[5], H(XS[5]), 0); rei.rotation.y = 0.2; st.add(rei);
    const alvo = new THREE.Group(); alvo.add(m(T, new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), pbr(T, '#6a4630'), 0, 1.1, 0)); const disco = m(T, new THREE.CylinderGeometry(0.75, 0.75, 0.15, 24), pbr(T, '#e8d8b0'), 0, 1.7, 0); disco.rotation.z = Math.PI / 2; alvo.add(disco); for (const [r, c] of [[0.5, '#d8342b'], [0.25, '#ffffff']]) { const d = m(T, new THREE.CylinderGeometry(r, r, 0.17, 24), pbr(T, c), 0, 1.7, 0); d.rotation.z = Math.PI / 2; alvo.add(d); } alvo.position.set(XS[0] + 6, H(XS[0] + 6), 0); st.add(alvo);
    const ferido = pessoa3D(T, { ...aparenciaAleatoria(500), marca: M(2, ELEMENTOS.terra, 0.4) }); ferido.position.set(XS[1] + 2.2, H(XS[1] + 2.2, 0.3), 0.3); ferido.rotation.y = -Math.PI / 2; st.add(ferido);
    const lagoa = m(T, new THREE.CircleGeometry(6, 40), new THREE.MeshStandardMaterial({ color: '#3a8ae0', roughness: 0.15, metalness: 0.1 }), XS[3] + 5, H(XS[3] + 5) + 0.05, 0); lagoa.rotation.x = -Math.PI / 2; st.add(lagoa);
    const h0 = H(XS[0]), f = fogo(T, [XS[0] + 0.7, h0 + 1.45, 0], [XS[0] + 5.6, H(XS[0] + 6) + 1.7, 0]), a = agua(T, [XS[1] + 2.2, H(XS[1] + 2.2) + 1.0, 0.3]), mu = muralha(T, XS[2] + 3.5, 0), nv = navio(T, XS[3] + 5, 0), mo = monstro(T, XS[4] + 7, -1, 0.75), ra = raio(T, [XS[4] + 7, 30, -1], [XS[4] + 7, H(XS[4] + 7) + 6.5, -1]), au = aura(T, [XS[5], 0, 0]);
    mu.position.y = H(XS[2] + 3.5); nv.position.y = 0; nv.userData.h = H(XS[3] + 5); mo.position.y = H(XS[4] + 7, -1); au.position.y = H(XS[5]); const HS = XS.map(x => H(x));
    st.add(f, a, mu, nv, mo, ra, au); return { stage: st, st, magos, rei, ferido, f, a, mu, nv, mo, ra, au, HS, H, V: THREE.Vector3 }; },
  draw(s, lt, info) { const Tg = info.globalT, L = info.L, c = s.st.camera;
    const ts = [L.n09a[0], L.n09b[0], L.n09c[0], L.n09d[0], L.n09e[0], L.n09f[0]], ini = L.n09[0];
    const atv = (i) => (Tg > ts[i] + 0.3 && Tg < (i < 5 ? ts[i + 1] + 0.4 : 99) ? 1 : 0), kk = (i) => clamp((Tg - ts[i] - 0.3) / 1.5);
    let foco = 0; for (let i = 0; i < 6; i++) if (Tg > ts[i] - 0.5) foco = i;
    const intro = Tg < ts[0] - 0.4; const prev = Math.max(0, foco - 1), tr = clamp((Tg - (ts[foco] - 0.6)) / 0.9), eT = ease.inOut(tr);
    const cx = intro ? lerp(20, 30, clamp((Tg - ini) / 3.5)) : lerp(XS[prev] + 2.6, XS[foco] + 2.6, foco === 0 ? 1 : eT);
    const hy = s.H(cx, 0); if (intro) { c.position.set(cx - 18, hy + 9, 22); c.lookAt(cx + 4, hy + 1.5, 0); } else { const off = [2.0, 1.2, 1.8, 2.6, 3.2, 0.2][foco], dz = [10, 7, 9, 12, 15, 6][foco], dy = [2.4, 2.0, 2.6, 3.5, 4.5, 2.0][foco], ly = [1.4, 1.2, 1.6, 2.2, 3.4, 1.6][foco]; c.position.set(cx - 2.6 + off, hy + dy, dz); c.lookAt(cx - 2.6 + off, hy + ly, 0); }
    c.fov = 46; c.updateProjectionMatrix();
    s.magos.forEach((p, i) => { const on = Tg > ts[i] + 0.2 && Tg < (i < 4 ? ts[i + 1] + 0.6 : ts[5] + 0.5); p.expressao(on ? 'raiva' : 'neutro'); p.anima(Tg + i, on ? 'apontar' : 'parado', {}); });
    s.ferido.expressao(Tg > ts[1] + 2.5 ? 'sorriso' : 'medo'); s.ferido.anima(Tg, 'parado', {});
    s.rei.expressao('orgulho'); s.rei.anima(Tg, 'cajado', { brilho: atv(5) });
    s.f.update(Tg, atv(0)); s.a.update(Tg, atv(1) * kk(1) + (atv(1) ? 0.2 : 0)); s.mu.update(Tg, Tg > ts[2] + 0.3 ? kk(2) : 0); s.nv.update(Tg, Tg > ts[3] + 0.3 ? kk(3) : 0);
    const tRa = W('descarga', L.n09e); s.ra.update(Tg, Tg > tRa - 0.2 && Tg < tRa + 0.9 ? 1 : 0); s.mo.update(Tg, Tg > tRa - 0.2 && Tg < tRa + 0.9 ? 1 : 0); s.au.update(Tg, Tg > ts[5] + 0.2 ? 1 : 0);
    if (Tg > tRa - 0.2 && Tg < tRa + 0.5) { c.position.x += Math.sin(Tg * 70) * 0.06; c.position.y += Math.cos(Tg * 63) * 0.06; }
    s.st.foco(intro ? 25 : c.position.distanceTo(new s.V(XS[foco], s.HS[foco] + 1.5, 0)), 0.0005); s.st.tick(Tg); },
  overlay(g, lt, info, s) { const Tg = info.globalT, L = info.L, V = s.V;
    if (Tg < L.n09a[0] - 0.3) { rotulo(g, 'NÃO É TRUQUE', Tg - L.n09[0], 380, WH, 92); if (Tg > W('física', L.n09) - 0.1) rotulo(g, 'É FÍSICA', Tg - W('física', L.n09), 500, '#ffd23a', 120); }
    const tag = (str, c, tt, end) => { if (Tg < tt - 0.1 || Tg > end) return; const a = pop(Tg, tt); g.save(); g.translate(540, 300); g.scale(a, a); rr(g, -240, -62, 480, 124, 62); g.fillStyle = INK; g.fill(); rr(g, -230, -52, 460, 104, 52); g.fillStyle = c; g.fill(); text(g, str, 0, 4, { size: 66, color: c === ELEMENTOS.vento || c === ELEMENTOS.raio ? INK : '#fff', font: FONTS.title }); g.restore(); };
    const ts = [L.n09a, L.n09b, L.n09c, L.n09d, L.n09e, L.n09f];
    tag('FOGO', ELEMENTOS.fogo, ts[0][0], ts[1][0] - 0.2); tag('ÁGUA', ELEMENTOS.agua, ts[1][0], ts[2][0] - 0.2); tag('TERRA', ELEMENTOS.terra, ts[2][0], ts[3][0] - 0.2); tag('VENTO', ELEMENTOS.vento, ts[3][0], ts[4][0] - 0.2); tag('RAIO', ELEMENTOS.raio, ts[4][0], ts[5][0] - 0.2); tag('DOURADA', '#ffd76a', ts[5][0], 999);
    const pt = (x, y, z) => proj(s, new V(x, y, z));
    const R = (i, o) => { const [px, py] = o.p; rotuloTecnico(g, Tg, { t0: o.t0 ?? (ts[i][0] + 0.9), t1: ts[i][1] + 0.1, px, py, lx: 540, ly: 820, ...o }); };
    R(0, { p: pt(XS[0] + 4, s.HS[0] + 1.6, 0), titulo: 'TRIÂNGULO DO FOGO', valor: '3', unidade: 'ingredientes', linhas: ['calor + combustível', '+ oxigênio'], t0: W('calor', L.n09a) });
    R(1, { p: pt(XS[1] + 2.2, s.H(XS[1] + 2.2) + 1.0, 0.3), titulo: 'CONDENSAÇÃO', valor: 'H₂O', unidade: 'vapor → água', linhas: ['o ar esfria e o', 'vapor vira gota'], t0: W('vapor', L.n09b) });
    R(2, { p: pt(XS[2] + 3.5, s.H(XS[2] + 3.5) + 1.5, 0), titulo: 'COMPACTAÇÃO', valor: 'VIBRAR', unidade: '', linhas: ['grãos se encaixam', 'e o solo endurece'], t0: W('vibrar', L.n09c) });
    R(3, { p: pt(XS[3] + 5, s.H(XS[3] + 5) + 2.5, 0), titulo: 'DIFERENÇA DE PRESSÃO', valor: 'ALTA → BAIXA', unidade: '', linhas: ['o ar sempre corre', 'pra pressão baixa'], t0: W('pressão', L.n09d) });
    R(4, { p: pt(XS[4] + 7, s.H(XS[4] + 7) + 6, -1), titulo: 'DESCARGA ELÉTRICA', valor: '30.000', unidade: '°C', linhas: ['5x a superfície do Sol'], t0: W('trinta', L.n09e) });
    R(5, { p: pt(XS[5], s.HS[5] + 1.9, 0), titulo: 'MARCA DOURADA', valor: '???', unidade: '', linhas: ['ninguém sabe explicar'], t0: W('explicar', L.n09f) }); } });

// G1 — corre até o lago (3D)
registerShot('G1', { kind: '3d',
  init(T) { MODO.pbr = true; const st = dia(T); const lg = lago3D(T, { res: 384 }); st.add(lg); const eu = boneco2D(T); st.add(eu); return { stage: st, st, eu, V: T.THREE.Vector3 }; },
  draw(s, lt, info) { const Tg = info.globalT, L = info.L, tLa = W('lago', L.n10), tOl = W('olha', L.n10), c = s.st.camera;
    const x = lerp(-12, -6.6, ease.out(clamp((Tg - info.shot.start) / (tLa + 0.4 - info.shot.start)))); s.eu.position.set(x, 0, 0);
    const k = clamp((Tg - tLa) / (tOl - tLa + 0.4)); c.position.set(lerp(x - 5, -9.5, k), lerp(2.2, 3.4, k), lerp(4.5, 1.5, k)); c.lookAt(lerp(x, -4, k), lerp(1.2, 0.2, k), lerp(0, -0.5, k)); c.fov = 46; c.updateProjectionMatrix();
    s.eu.olha(c); s.eu.desenha({ facing: 1, outfit: VC, pose: Tg < tLa + 0.3 ? walkPose(Tg * 2.6, { run: true }) : POSES.kneel, expr: 'nervous', look: [1, 0.6], t: Tg, emote: 'sweat' }); s.st.foco(c.position.distanceTo(s.eu.position), 0.0008); s.st.tick(Tg); } });
// G2 — o reflexo: rosto liso, 0 marcas (2D)
registerShot('G2', { draw(g, t, info) { const T = info.globalT, L = info.L, tLi = W('liso', L.n10), tFe = W('ferrou', L.n10);
  const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#3a8ae0'); gr.addColorStop(1, '#14306a'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(540, 820); g.rotate(Math.sin(t * 3) * 0.03); g.scale(1 + Math.sin(t * 5) * 0.015, 1 - Math.sin(t * 5) * 0.015); bigFace(g, 0, 0, 280, { outfit: VC, expr: T > tLi ? 'shocked' : 'blank', t, rimColor: '#9fd8ff', emote: T > tFe ? 'sweat' : null }); g.restore();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(540, 820, 320 + i * 60 + (t * 60) % 60, 70 + i * 14, 0, 0, 7); g.stroke(); }
  if (T > W('nenhuma', L.n10) - 0.1) { const a = pop(T, W('nenhuma', L.n10)); g.save(); g.translate(540, 1240); g.scale(a, a); text(g, '0 MARCAS', 0, 0, { size: 124, color: '#ff4a6a', stroke: 22, strokeColor: INK }); g.restore(); }
  if (T > tFe - 0.1) rotulo(g, 'FERROU.', T - tFe + 0.1, 420, WH, 110); } });
// H — a cidade inteira encara você (3D, pessoas 3D)
registerShot('H', { kind: '3d',
  init(T) { MODO.pbr = true; const st = dia(T, { keyIntensity: 2.8 }); st.add(rua3D(T, { x0: -15, x1: 60, pocoX: 26, seed: 13 }));
    const sp = []; for (let i = 0; i < 7; i++) sp.push({ tipo: 'anda', x: 2 + i * 3, x1: 10 + i * 3, z: -3.4 + (i % 3) * 0.6, vel: 1.0, seed: 120 + i });
    for (let i = 0; i < 2; i++) { sp.push({ tipo: 'conversa', x: 6 + i * 8, z: -2.4, frente: 1, lado: 0, seed: 140 + i }); sp.push({ tipo: 'conversa', x: 7.1 + i * 8, z: -2.3, frente: -1, lado: 1, seed: 150 + i }); }
    sp.push({ tipo: 'parado', x: 9, z: -1.2, aparencia: CRIANCA, papel: 'crianca' }); sp.push({ tipo: 'parado', x: 13, z: -2.0, aparencia: GUARDA, papel: 'guarda' });
    const mul = multidao3D(T, sp); st.add(mul); const eu = boneco2D(T); eu.position.set(4, 0, 0.4); st.add(eu); return { stage: st, st, mul, eu, V: T.THREE.Vector3 }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tEn = W('encara', L.n10), tCr = W('criança', L.n10), tGu = W('guarda', L.n10), k = (x) => x - t0, c = s.st.camera;
    T.dolly(c, lt, [[0, { pos: [-1, 1.9, 2.6], look: [8, 1.6, -1.4], fov: 48 }], [k(tCr) - 0.2, { pos: [6.5, 1.3, 1.2], look: [9, 1.0, -1.2], fov: 44 }], [k(tGu) - 0.1, { pos: [10.5, 1.8, 1.0], look: [13, 1.9, -2.0], fov: 44 }], [info.dur, { pos: [6.8, 1.65, 1.6], look: [4, 1.55, 0.4], fov: 40 }]]);
    s.mul.update(Tg, c, { congela: Math.max(t0 + 0.2, tEn - 0.4), alvo: { x: 4, z: 0.4 }, exprCongela: 'desconfiado', extra: (p, sp) => sp.papel === 'crianca' && Tg > tCr - 0.2 ? { estado: 'apontar', expr: 'surpreso' } : sp.papel === 'guarda' && Tg > tGu - 0.2 ? { estado: 'cajado', expr: 'raiva' } : null });
    s.eu.olha(c); s.eu.desenha({ facing: 1, outfit: VC, pose: breathe(POSES.stand, Tg, 1, 1), expr: Tg > tGu ? 'gulp' : 'nervous', look: [0.6, -0.1], t: Tg, emote: Tg > tCr ? 'sweat' : null });
    s.st.foco(c.position.distanceTo(new s.V(8, 1.4, -1)), 0.0008); s.st.tick(Tg); },
  overlay(g, lt, info) { const Tg = info.globalT, L = info.L, tEn = W('encara', L.n10); if (Tg > tEn - 0.1) rotulo(g, 'TODO MUNDO TE ENCARA', Tg - tEn + 0.1, 400, WH, 76); } });

// I — Academia Real: teste do cristal (salão 3D, plateia, garoto 3D), sua vez: nada; gargalhada
import { salao3D } from '/series/semmarca/tres.js';
registerShot('I', { kind: '3d',
  init(T) { MODO.pbr = true; const THREE = T.THREE; const st = palco(T, { sky: '#120a26', fog: [40, 120], fogColor: '#1a1030', keyColor: '#ffe0c8', keyIntensity: 2.2, keyPos: [-6, 18, 10], ambient: 1.1, ambientSky: '#a890ff', shadowSize: 16, fov: 42, ao: false, abertura: 0.0012, bloom: 0.35, bloomLimiar: 0.92, barril: 0.1, sat: 1.2, env: 0.5, exposicao: 0.95 });
    const sal = salao3D(T); st.add(sal);
    const pos = []; for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) for (let z = -13; z <= 13; z += 2.2) pos.push({ tipo: 'parado', x: sx * (11 + k * 2), z, rot: -sx * Math.PI / 2, y: 0.8 + k * 0.8, seed: 200 + pos.length });
    const pl = multidao3D(T, pos); st.add(pl);
    const boy = pessoa3D(T, GAROTO_FOGO); boy.position.set(-1.6, 0, -4.6); boy.rotation.y = Math.PI * 0.85; st.add(boy);
    const eu = boneco2D(T); eu.position.set(-3.6, 0, -1.8); st.add(eu);
    const brasa = particulas(T, { n: 200, centro: [0, 2.5, -6], ext: [3, 5, 3], cor: '#ff8a3a', tam: 0.14, sobe: 1.4, seed: 4, opac: 0 }); st.add(brasa);
    return { stage: st, st, sal, pl, boy, eu, brasa, C: THREE.Color, V: THREE.Vector3 }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tGa = W('garoto', L.n11), tEn = W('encosta', L.n11), tFo = W('fogo', L.n11), tVz = W('vez', L.n11), tEn2 = W('encosta', L.n11, 2), tNa = W('nada', L.n11), tGr = W('gargalhada', L.n11) - 0.4, k = (x) => x - t0, c = s.st.camera;
    T.dolly(c, lt, [[0, { pos: [0, 5, 22], look: [0, 4, -6], fov: 50 }], [k(tGa), { pos: [1.5, 2.8, 2.5], look: [-1.0, 2.4, -6], fov: 42 }], [k(tVz) - 0.2, { pos: [1.8, 2.7, 1.5], look: [-0.6, 3.0, -6], fov: 44 }], [k(tEn2), { pos: [-1.0, 2.2, 1.6], look: [-2.2, 2.6, -5], fov: 40 }], [k(tGr), { pos: [0.5, 3.2, 6], look: [0, 2.5, -4], fov: 52 }], [info.dur, { pos: [0.3, 3.6, 8], look: [0, 2.8, -4], fov: 56 }]]);
    const fg = clamp((Tg - tFo + 0.1) / 0.4) * (Tg < tVz + 0.4 ? 1 : clamp(1 - (Tg - tVz - 0.4) / 0.6)), cin = Tg > tEn2 ? clamp((Tg - tEn2) / 0.6) : 0;
    s.sal.cristalMat.emissive.copy(new s.C('#4aa8ff').lerp(new s.C('#ff3a0a'), fg).lerp(new s.C('#202028'), cin)); s.sal.cristalMat.emissiveIntensity = 0.35 + 1.2 * fg - 0.3 * cin; s.sal.luz.intensity = 10 + 50 * fg - 8 * cin;
    s.sal.cristal.rotation.y = Tg * 0.8; s.brasa.material.opacity = 0.95 * fg; s.brasa.update(Tg);
    s.boy.expressao(Tg > tFo ? 'orgulho' : 'neutro'); s.boy.anima(Tg, Tg > tEn - 0.3 && Tg < tVz ? 'apontar' : 'parado', {});
    s.eu.position.x = Tg > tVz ? lerp(-3.6, -1.6, clamp((Tg - tVz) / 0.6)) : -3.6; s.eu.position.z = Tg > tVz ? lerp(-1.8, -4.4, clamp((Tg - tVz) / 0.6)) : -1.8;
    s.pl.update(Tg, c, { expr: () => (Tg > tGr ? 'riso' : Tg > tFo && Tg < tVz + 0.6 ? 'surpreso' : 'neutro'), extra: () => (Tg > tGr ? { estado: 'rir' } : Tg > tFo && Tg < tVz ? { estado: 'falar' } : null) });
    s.eu.olha(c); s.eu.desenha({ facing: 1, outfit: VC, pose: breathe(Tg > tEn2 - 0.3 && Tg < tGr ? { ...POSES.reach, eF: [50, -170], hF: [100, -200] } : POSES.stand, Tg, 1, 1), expr: Tg > tGr ? 'sad' : Tg > tNa ? 'blank' : 'nervous', look: [1, -0.3], t: Tg, emote: Tg > tGr ? 'gloom' : Tg > tNa ? 'sweat' : null });
    s.st.foco(c.position.distanceTo(new s.V(-1, 2.5, -5)), 0.0012); s.st.tick(Tg); },
  overlay(g, lt, info, s) { const Tg = info.globalT, L = info.L, tCr = W('teste', L.n11), tFo = W('fogo', L.n11), tNa = W('nada', L.n11), tGr = W('gargalhada', L.n11);
    if (Tg > tCr - 0.1 && Tg < W('garoto', L.n11) - 0.1) rotulo(g, 'TESTE DO CRISTAL', Tg - tCr + 0.1, 400, '#9fd8ff', 92);
    if (Tg > W('garoto', L.n11) - 0.1 && Tg < W('vez', L.n11)) balao(g, 540, 420, '1 LINHA DE FOGO', pop(Tg, W('garoto', L.n11)), '#ff8a6a');
    if (Tg > tNa - 0.1 && Tg < tGr - 0.3) rotulo(g, 'NADA.', Tg - tNa + 0.1, 420, WH, 140);
    if (Tg > tGr - 0.4) { ['HAHAHA', 'KKKKK', 'SEM MARCA!', 'HAHA'].forEach((s2, i) => balao(g, [260, 820, 300, 780][i], [380, 480, 1120, 1220][i], s2, pop(Tg, tGr - 0.4 + i * 0.15))); } } });

// K — o diretor bate o cajado; silêncio; o segredo do irmão exilado
registerShot('K', { kind: '3d',
  init(T) { MODO.pbr = true; const THREE = T.THREE; const st = palco(T, { sky: '#120a26', fog: [30, 100], fogColor: '#160c28', keyColor: '#ffd8b0', keyIntensity: 1.8, keyPos: [-6, 18, 10], ambient: 0.9, ambientSky: '#a890ff', shadowSize: 16, fov: 40, ao: false, abertura: 0.0016, bloom: 0.35, bloomLimiar: 0.9, barril: 0.12, sat: 1.15, env: 0.45, exposicao: 0.9 });
    const sal = salao3D(T); st.add(sal); sal.cristalMat.emissive.set('#202028'); sal.cristalMat.emissiveIntensity = 0.1; sal.luz.intensity = 3;
    const dir = pessoa3D(T, DIRETOR); dir.position.set(1.8, 0, -3.6); st.add(dir); const eu = boneco2D(T); eu.position.set(-0.6, 0, -2.4); st.add(eu);
    const onda = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), new THREE.MeshBasicMaterial({ color: '#ffd76a', transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); onda.rotation.x = -Math.PI / 2; onda.position.set(1.4, 0.05, -3.3); st.add(onda);
    return { stage: st, st, dir, eu, onda, V: THREE.Vector3 }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tCj = W('cajado', L.n12), tPe = W('perto', L.n12), tD = L.d1[0], k = (x) => x - t0, c = s.st.camera;
    T.dolly(c, lt, [[0, { pos: [1.5, 2.6, 4.5], look: [1.6, 1.8, -3.6], fov: 44 }], [k(tCj) - 0.1, { pos: [2.6, 1.6, 0.4], look: [1.6, 1.5, -3.6], fov: 40 }], [k(tCj) + 0.6, { pos: [3.2, 2.2, 2.0], look: [1.2, 1.4, -3.4], fov: 44 }], [k(tD), { pos: [-2.4, 1.8, 0.8], look: [0.4, 1.45, -2.8], fov: 40 }], [info.dur, { pos: [-2.0, 1.75, 0.3], look: [0.4, 1.5, -2.8], fov: 38 }]]);
    const bate = clamp(1 - Math.abs(Tg - tCj) / 0.25); if (Tg > tCj && Tg < tCj + 0.5) { c.position.x += Math.sin(Tg * 70) * 0.05; c.position.y += Math.cos(Tg * 60) * 0.05; }
    const anda = clamp((Tg - tPe) / 1.2); s.dir.position.x = lerp(1.8, 0.7, anda); s.dir.position.z = lerp(-3.6, -2.9, anda); s.dir.rotation.y = lerp(0, -1.0, anda);
    s.dir.expressao(Tg > tD ? 'desconfiado' : 'raiva'); s.dir.anima(Tg, Tg > tD ? 'cochichar' : 'cajado', { bate, brilho: 0.8, fala: Tg > tD && Tg < L.d1[1] ? 1 : 0, lado: -1 });
    const ok = Tg > tCj ? clamp((Tg - tCj) / 0.9) : 0; s.onda.scale.setScalar(1 + ok * 14); s.onda.material.opacity = (1 - ok) * (Tg > tCj ? 0.9 : 0);
    s.eu.olha(c); s.eu.desenha({ facing: 1, outfit: VC, pose: breathe(POSES.stand, Tg, 1, 1), expr: Tg > tD ? 'gulp' : Tg > tCj ? 'shocked' : 'sad', look: [1, -0.2], t: Tg, emote: Tg > W('exilaram', L.d1) ? 'sweat' : null });
    s.st.foco(c.position.distanceTo(new s.V(0.6, 1.6, -3.0)), 0.0016); s.st.tick(Tg); },
  overlay(g, lt, info) { const Tg = info.globalT, L = info.L, tCa = W('cala', L.n12), tEx = W('exilaram', L.d1), tSu = W('sul', L.d1), tNu = W('nunca', L.d1);
    if (Tg > tCa - 0.1 && Tg < L.n12[1]) rotulo(g, 'SILÊNCIO.', Tg - tCa + 0.1, 420, WH, 110);
    if (Tg > W('irmão', L.d1) - 0.1 && Tg < tEx) rotulo(g, 'O IRMÃO DELE', Tg - W('irmão', L.d1), 420, '#ffd76a', 100);
    if (Tg > tEx - 0.2) { const a = clamp((Tg - tEx + 0.2) / 0.4); g.save(); g.globalAlpha = a; g.translate(540, 560); rr(g, -360, -230, 720, 460, 26); g.fillStyle = INK; g.fill(); g.save(); rr(g, -350, -220, 700, 440, 20); g.clip();
      const gr = g.createLinearGradient(0, -220, 0, 220); gr.addColorStop(0, '#2a0808'); gr.addColorStop(0.6, '#c0301a'); gr.addColorStop(1, '#3a0a06'); g.fillStyle = gr; g.fillRect(-350, -220, 700, 440); glow(g, 0, 60, 300, '#ff6a2a', 0.5);
      g.fillStyle = '#120404'; g.beginPath(); g.moveTo(-350, 220); for (let x = -350; x <= 350; x += 50) g.lineTo(x, 110 - Math.abs(Math.sin(x * 0.02)) * 60 - (Math.abs(x) < 60 ? 90 : 0)); g.lineTo(350, 220); g.fill();
      const px = lerp(-120, 60, clamp((Tg - tEx) / 3)); drawFigure(g, { x: px, y: 150, s: 0.6, facing: 1, outfit: { top: 'none', head: 'hood', headColor: '#2a1a1a' }, pose: walkPose(Tg * 2), expr: 'sad', t: Tg, dim: 0.5 });
      g.restore(); text(g, 'EXILADO PRO SUL', 0, -180, { size: 44, color: '#ffd76a', font: FONTS.ui, weight: 900, stroke: 10, strokeColor: INK }); g.restore(); }
    if (Tg > tNu - 0.1) rotulo(g, 'NUNCA MAIS VOLTOU', Tg - tNu + 0.1, 900, '#ff4a4a', 80); } });

// L — o miado: o mesmo gato em cima da estante; NOVA MISSÃO ???
registerShot('L', { kind: '3d',
  init(T) { MODO.pbr = true; const THREE = T.THREE; const st = palco(T, { sky: '#120a14', fog: [20, 60], fogColor: '#1a0e14', keyColor: '#ffc890', keyIntensity: 1.2, keyPos: [6, 14, 8], ambient: 0.8, ambientSky: '#8a70b0', shadowSize: 14, fov: 42, ao: false, abertura: 0.0018, bloom: 0.45, bloomLimiar: 0.85, barril: 0.12, sat: 1.15, env: 0.35, exposicao: 0.95 });
    const bib = biblioteca3D(T); st.add(bib); const gato = gato3D(T); gato.position.copy(bib.topoEstante); gato.position.y += 0.02; gato.position.z += 0.2; gato.scale.setScalar(1.6); st.add(gato);
    const eu = boneco2D(T); eu.position.set(-0.6, 0, 1.6); st.add(eu); return { stage: st, st, bib, gato, eu, V: THREE.Vector3 }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tMi = W('miado', L.n13), tEs = W('estante', L.n13), tGa = W('gato', L.n13), k = (x) => x - t0, c = s.st.camera, gp = s.gato.position;
    T.dolly(c, lt, [[0, { pos: [0.4, 1.7, 6.5], look: [-0.4, 1.6, 0], fov: 46 }], [k(tMi), { pos: [0.6, 1.6, 4.8], look: [-0.2, 2.2, -1], fov: 46 }], [k(tEs), { pos: [0.2, 4.5, 1.2], look: [gp.x, gp.y + 0.3, gp.z], fov: 44 }], [k(tGa), { pos: [0.1, gp.y + 0.6, gp.z + 2.4], look: [gp.x, gp.y + 0.35, gp.z], fov: 38 }], [info.dur, { pos: [0.05, gp.y + 0.5, gp.z + 1.6], look: [gp.x, gp.y + 0.35, gp.z], fov: 34 }]]);
    s.bib.update(Tg); s.gato.update(Tg, { olhosBrilho: clamp((Tg - tEs) / 1.5) });
    s.eu.olha(c); s.eu.desenha({ facing: 1, outfit: VC, pose: breathe(POSES.stand, Tg, 1, 1), expr: Tg > tGa ? 'shocked' : 'suspicious', look: [0.2, -1], t: Tg, emote: Tg > tGa ? 'exclaim' : Tg > tMi ? 'question' : null });
    s.st.foco(c.position.distanceTo(Tg > tEs ? gp : s.eu.position), 0.0018); s.st.tick(Tg); },
  overlay(g, lt, info) { const Tg = info.globalT, L = info.L, tMi = W('miado', L.n13), tSa = W('salvou', L.n13);
    if (Tg > tMi - 0.1 && Tg < W('estante', L.n13)) balao(g, 540, 500, 'miau.', pop(Tg, tMi));
    popupMissao(g, Tg, { t0: tSa + 0.5, cx: 540, cy: 700, titulo: 'NOVA MISSÃO', texto: '???', escala: 0.9 }); } });
