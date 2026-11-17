// Teste do dragão 3D e do gato 3D (series/semmarca/dragao3d.js)
import { registerShot, clamp } from '/engine/core.js';
import { palco, pbr, m, terreno, arvore } from '/series/semmarca/turbo.js';
import { luas } from '/series/semmarca/tres.js';
import { dragao3D, gato3D } from '/series/semmarca/dragao3d.js';
const FLAP = false;
registerShot('R', { kind: '3d',
  init(T) { const THREE = T.THREE;
    const st = palco(T, { sky: ['#0a4ad0', '#3aa8ff', '#d8f4ff'], fog: [140, 420], fogColor: '#bfe4ff', exposicao: 0.95, keyColor: '#fff2d8', keyIntensity: 3.4, keyPos: [-30, 40, 20], ambient: 1.0, ambientSky: '#bfe0ff', shadowSize: 30, fov: 50, foco: 30, abertura: 0.0004, bloom: 0.35, bloomLimiar: 0.9, barril: 0.1, quente: 0.02, sat: 1.25, env: 0.5 });
    const ter = terreno(T, { seed: 4, grama: 2500, flores: 300, pedras: 12 }); st.add(ter); st.add(luas(T));
    [[8, -6], [-6, 9], [12, 10], [-10, -12], [18, -14], [22, 12], [-16, 4], [6, 16]].forEach(([x, z], i) => st.add(arvore(T, x, z, ter.alt(x, z) - 0.1, 1 + (i % 3) * 0.3, i + 2)));
    const dr = dragao3D(T); st.add(dr); const dr2 = dragao3D(T, { cor: '#2a6ad8' }); dr2.scale.setScalar(0.5); dr2.position.set(-30, 26, -40); st.add(dr2);
    const gato = gato3D(T); gato.position.set(30, ter.alt(30, 30) + 0.0, 30); st.add(gato);
    const y0 = ter.alt(30, 30) + 1.2; const est = m(T, new THREE.BoxGeometry(1.4, 2.4, 0.5), pbr(T, '#7a4a2a', { r: 0.8 }), 30, y0 - 1.2, 29.9); st.add(est); gato.position.y = y0;
    return { stage: st, st, dr, dr2, gato, ter, V: THREE.Vector3 }; },
  draw(s, lt, info, T) { const cam = s.st.camera, V = s.V; s.dr2.update(lt + 0.4);
    const tg = s.gato.position;
    if (lt < 0.65 || FLAP) { // (a) lateral, asas no meio do bater
      s.dr.position.set(0, 14, 0); s.dr.rotation.set(0, 0, 0); s.dr.update(lt, { bater: 1, boca: 0.15 }); cam.position.set(14, 22, 28); cam.lookAt(0.3, 14.3, 0); cam.fov = 45; s.st.foco(34, 0.0002); }
    else if (lt < 1.35) { // (b) passando por cima, visto de baixo em 3/4
      s.dr.position.set(0, 10, 0); s.dr.rotation.set(0, 0.25, 0); s.dr.update(lt, { bater: 1, boca: 0.3 }); cam.position.set(-3, 1.7, 2.5); cam.lookAt(0.5, 10, 0); cam.fov = 78; s.st.foco(14, 0.0002); }
    else if (lt < 2.1) { // (c) close da cabeça com boca aberta
      s.dr.position.set(0, 14, 0); s.dr.rotation.set(0, 0, 0); s.dr.update(lt, { bater: 0.6, boca: 1 }); const h = s.dr.focinho(new V()); cam.position.set(h.x + 1.2, h.y + 1.0, h.z + 4.6); cam.lookAt(h.x - 1.0, h.y + 0.1, h.z); cam.fov = 40; s.st.foco(cam.position.distanceTo(h), 0.0006); }
    else { // (d) gato
      s.dr.position.set(0, 60, -80); s.dr.update(lt); s.gato.update(lt, { olhosBrilho: lt > 2.7 ? 1 : 0 }); cam.position.set(tg.x + 0.32, tg.y + 0.3, tg.z + 0.95); cam.lookAt(tg.x, tg.y + 0.19, tg.z); cam.fov = 32; s.st.foco(1.0, 0.0006); }
    cam.updateProjectionMatrix(); s.st.tick(lt); } });
