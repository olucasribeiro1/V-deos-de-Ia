// Sem Marca Ep.1 v2 — planos novos (sobrescrevem os antigos com o mesmo id)
import { E, registerShot, ease, prog, clamp, lerp, rr, text, FONTS } from '/engine/core.js';
import { POSES, breathe } from '/engine/rig2d.js';
import { W, rotulo } from '/series/mamae/comum.js';
import { MODO, cidade3D, luas } from '/series/semmarca/tres.js';
import { palco, pbr, m, boneco2D, particulas, terreno, arvore } from '/series/semmarca/turbo.js';
import { dragao3D } from '/series/semmarca/dragao3d.js';
import { painelStatus, tagNivel, glitch } from '/series/semmarca/hud.js';
import { PROTAGONISTA as VC } from '../cast.js';

// B — abre o olho → dragão passa raspando → "Eita, p*rra!" → outro mundo → a tela de status (plano contínuo)
registerShot('B', { kind: '3d',
  init(T) { MODO.pbr = true; const THREE = T.THREE;
    const st = palco(T, { sky: ['#0a4ad0', '#3aa8ff', '#d8f4ff'], fog: [140, 420], fogColor: '#bfe4ff', keyColor: '#fff2d8', keyIntensity: 3.2, keyPos: [-30, 30, 20], ambient: 1.1, ambientSky: '#bfe0ff', shadowSize: 22, fov: 50, ao: false, abertura: 0.0006, bloom: 0.35, bloomLimiar: 0.9, barril: 0.1, sat: 1.25, env: 0.5, exposicao: 0.95 });
    const ter = terreno(T, { morro: true, seed: 4, grama: 6000 }); st.add(ter);
    const cid = cidade3D(T, 45, 0); cid.position.y = -0.6; st.add(cid); st.add(m(T, new THREE.CylinderGeometry(19, 21, 3, 40), pbr(T, '#7aa860'), 45, -1.4, 0)); st.add(luas(T));
    [[8, -6], [-6, 9], [12, 10], [-10, -12], [18, -14], [22, 12], [-16, 4], [6, 16], [-3, -18], [26, -4]].forEach(([x, z], i) => st.add(arvore(T, x, z, ter.alt(x, z) - 0.1, 0.9 + (i % 3) * 0.3, i + 2)));
    for (let i = 0; i < 12; i++) { const a = -1.3 + i * 0.22, d = 140, h = 30 + (i % 4) * 12; const mt = m(T, new THREE.ConeGeometry(18 + (i % 3) * 6, h, 6), pbr(T, ['#5aa0d8', '#3a88c0', '#4ab08a'][i % 3], { r: 0.9 }), Math.cos(a) * d + 40, h / 2 - 2, Math.sin(a) * d); mt.castShadow = false; st.add(mt); st.add(m(T, new THREE.ConeGeometry(6, h * 0.24, 6), pbr(T, '#ffffff'), Math.cos(a) * d + 40, h * 0.88 - 2, Math.sin(a) * d)); }
    const dr = dragao3D(T, { cabEscala: 1.35 }); st.add(dr); const dr2 = dragao3D(T, { cor: '#2a6ad8', sombra: false }); dr2.scale.setScalar(0.5); st.add(dr2);
    const eu = boneco2D(T); const y0 = ter.alt(0, 0); eu.position.set(0, y0 - 0.05, 0); st.add(eu);
    const vag = particulas(T, { n: 200, centro: [4, y0, 0], ext: [30, 5, 30], cor: '#fff2c0', tam: 0.1, sobe: 0.15 }); st.add(vag);
    return { stage: st, st, dr, dr2, eu, vag, y0, V: THREE.Vector3, alvo: new THREE.Vector3() }; },
  draw(s, lt, info, T) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, y0 = s.y0, k = (x) => x - t0;
    const tDr = W('dragão', L.n04), tRa = W('raspando', L.n04), tEi = L.n04b[0], tPa = W('parceiro', L.n05), tMu = W('mundo', L.n05), tTe = W('tela', L.n05), tNi = L.n06[0], fim = info.shot.end;
    // dragão: vem da frente-alto e passa raspando por cima, sumindo atrás
    const pd = clamp((Tg - (tDr - 0.6)) / 3.2), dx = lerp(-6, 4, pd), dz = lerp(-70, 40, ease.inOut(pd)), dy = y0 + lerp(26, 7.5, Math.sin(pd * Math.PI) ** 0.6) + (pd > 0.5 ? (pd - 0.5) * 20 : 0);
    s.dr.position.set(dx, dy, dz); s.dr.rotation.set(0, -Math.PI / 2 - 0.1, 0.12); s.dr.scale.setScalar(1.25); s.dr.update(Tg, { bater: 1, boca: Tg > tRa - 0.3 && Tg < tEi ? 0.8 : 0.1, rugido: Tg > tRa - 0.2 && Tg < tRa + 0.8 ? 1 : 0 });
    const a = Tg * 0.45; s.dr2.position.set(45 + Math.cos(a) * 28, 28 + Math.sin(Tg) * 2, Math.sin(a) * 28); s.dr2.rotation.set(0, -a, 0.25); s.dr2.update(Tg + 1, { bater: 0.8 });
    const c = s.st.camera;
    if (Tg < tEi) { // olhar pro céu e acompanhar o dragão
      const kk = clamp((Tg - (tDr - 1.0)) / 1.0); c.position.set(0.3, y0 + 1.5, 0.4); s.alvo.set(lerp(3, dx, kk), lerp(y0 + 30, dy, kk), lerp(-30, dz, kk)); c.lookAt(s.alvo); c.fov = 62; }
    else { T.dolly(c, lt, [[k(tEi), { pos: [2.0, y0 + 1.35, 2.2], look: [0, y0 + 1.25, 0], fov: 44 }], [k(tPa), { pos: [1.6, y0 + 1.4, 1.8], look: [0, y0 + 1.3, 0], fov: 44 }], [k(tMu) - 0.3, { pos: [-3.4, y0 + 2.1, -0.4], look: [45, y0 - 4, 0], fov: 48 }], [k(tTe) - 0.4, { pos: [-4.0, y0 + 2.4, -0.5], look: [45, y0 - 3.5, 0], fov: 46 }],
      [k(tTe) + 0.4, { pos: [3.0, y0 + 1.3, 1.6], look: [0, y0 + 2.0, 0], fov: 46 }], [k(tNi) + 3.5, { pos: [3.0, y0 + 1.2, -0.6], look: [0, y0 + 2.0, 0], fov: 44 }], [k(fim), { pos: [2.4, y0 + 1.2, -1.8], look: [0, y0 + 2.0, 0], fov: 44 }]]);
      if (Tg < tEi + 0.7) { const sh = (1 - (Tg - tEi) / 0.7) * 0.07; c.position.x += Math.sin(Tg * 60) * sh; c.position.y += Math.cos(Tg * 53) * sh; } }
    s.eu.visible = Tg >= tEi; s.eu.olha(c); const susto = Tg > tEi && Tg < tPa;
    s.eu.desenha({ facing: 1, outfit: VC, pose: breathe(susto ? POSES.handsOnHead : Tg > tTe ? { ...POSES.stand, eF: [20, -150], hF: [36, -190] } : POSES.stand, Tg, 1, 1), expr: susto ? 'panic' : Tg > tTe ? 'shocked' : Tg > tPa ? 'joy' : 'blank', look: Tg > tTe ? [0.4, -0.6] : [1, -0.3], t: Tg, emote: susto ? 'shock' : Tg > tMu - 0.2 && Tg < tTe ? 'sparkle' : Tg > tTe ? 'exclaim' : null });
    s.vag.update(Tg); s.st.tick(Tg); const fd = Tg < tEi ? 30 : c.position.distanceTo(s.eu.position) + 0.2; s.st.foco(Tg > tMu - 0.3 && Tg < tTe ? 40 : fd, Tg > tTe ? 0.0016 : 0.0006); },
  overlay(g, lt, info) { const Tg = info.globalT, L = info.L, t0 = info.shot.start, tEi = L.n04b[0], tTe = W('tela', L.n05), tNi = L.n06[0];
    const ab = ease.inOut(prog(lt, 0.1, 0.9)); if (ab < 1) { g.fillStyle = '#000'; const h = (1 - ab) * E.H / 2 + (lt < 0.5 ? Math.sin(lt * 20) * 30 * (1 - ab) : 0); g.fillRect(-E.W, -E.H, E.W * 3, E.H + h); g.fillRect(-E.W, E.H - h, E.W * 3, E.H); }
    if (Tg > W('azul', L.n04) - 0.1 && Tg < W('luas', L.n04) - 0.15) rotulo(g, 'CÉU AZUL', Tg - W('azul', L.n04), 1180, '#9fe4ff', 90);
    if (Tg > W('luas', L.n04) - 0.1 && Tg < W('dragão', L.n04) - 0.2) rotulo(g, '2 LUAS', Tg - W('luas', L.n04), 1180, '#c8f6ff', 100);
    if (Tg > W('dragão', L.n04) - 0.1 && Tg < tEi) rotulo(g, 'DRAGÃO', Tg - W('dragão', L.n04), 470, '#ff6a4a', 110);
    if (Tg > W('mundo', L.n05) - 0.2 && Tg < tTe - 0.2) rotulo(g, 'OUTRO MUNDO', Tg - W('mundo', L.n05) + 0.2, 470, '#ffd23a', 110);
    if (Tg > tTe - 0.15 && Tg < tTe + 0.35) glitch(g, 0.8 * (1 - (Tg - tTe + 0.15) / 0.5), Math.floor(Tg * 24));
    painelStatus(g, Tg, { t0: tTe, nome: 'VOCÊ', titulo: 'Reencarnado', nivel: 0, xp: 0.02, cx: 540, cy: 700, escala: 0.95, sai: info.shot.end - 0.4,
      stats: [{ id: 'FOR', nome: 'FORÇA', v: 10, t: W('força', L.n06) }, { id: 'VEL', nome: 'VELOCIDADE', v: 8, t: W('velocidade', L.n06) }, { id: 'INT', nome: 'INTELIGÊNCIA', v: 12, t: W('inteligência', L.n06) }, { id: 'MAG', nome: 'MAGIA', v: 0, t: W('magia', L.n06), travado: true, tTrava: W('travada', L.n06) }],
      marca: '—', tSobe: W('sobe', L.n06), tTrava: W('travada', L.n06) }); } });
