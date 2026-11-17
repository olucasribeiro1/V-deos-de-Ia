// teste de legibilidade das marcas: 6 elementos x 4 tons de pele (distância média) + closes em vários ângulos
import { registerShot } from '/engine/core.js';
import { palco, pbr, m } from '/series/semmarca/turbo.js';
import { pessoa3D, ELEMENTOS, REI_MAGO, ANAO, DIRETOR, GUARDA, ARQUEIRO, MAGO } from '/series/semmarca/gente3d.js';
const PELES = ['#ffdcc2', '#dca07a', '#a86a44', '#5c3620'], EL = ['fogo', 'agua', 'terra', 'vento', 'raio', 'rara'];
const ROUP = ['#3a7ad8', '#2f9a5a', '#e8a030', '#8a4ab8', '#2aa0a8', '#d85a8a'];
registerShot('R', { kind: '3d',
  init(T) { const THREE = T.THREE;
    const st = palco(T, { sky: ['#0a4ad0', '#3aa8ff', '#d8f4ff'], fog: [80, 260], fogColor: '#bfe4ff', keyColor: '#fff2d8', keyIntensity: 3.2, keyPos: [-8, 12, 14], ambient: 1.0, ambientSky: '#bfe0ff', shadowSize: 16, fov: 34, foco: 18, abertura: 0.0002, bloom: 0.3, bloomLimiar: 0.9, sat: 1.2, env: 0.55, ao: false });
    const chao = m(T, new THREE.PlaneGeometry(200, 200), pbr(T, '#6ac25a', { r: 0.95 })); chao.rotation.x = -Math.PI / 2; chao.castShadow = false; st.add(chao);
    const grade = [];
    PELES.forEach((pele, r) => { const deg = m(T, new THREE.BoxGeometry(6.6, r * 1.0 + 0.001, 1.2), pbr(T, '#c8b89a', { r: 0.9 }), 0, r * 0.5, -r * 1.2); st.add(deg);
      EL.forEach((el, c) => { const p = pessoa3D(T, { pele, roupa: 'tunica', cor: ROUP[c], cabelo: { tipo: ['curto', 'coque', 'longo', 'careca'][(r + c) % 4], cor: ['#2a1a12', '#6a4426', '#d8b25a', '#1a1414'][(c + r) % 4] }, chapeu: c === 2 && r === 1 ? 'capuz' : c === 4 && r === 2 ? 'feltro' : null, oculos: c === 1 && r === 3, marca: { n: 1 + ((c + r) % 3), cor: ELEMENTOS[el], brilho: 0.6 }, seed: r * 10 + c + 3 });
        p.position.set((c - 2.5) * 1.05, r * 1.0, -r * 1.2); st.add(p); grade.push(p); }); });
    // closes
    const closes = [[{ pele: PELES[0], marca: { n: 3, cor: ELEMENTOS.vento } }], [{ pele: PELES[0], marca: { n: 2, cor: ELEMENTOS.raio }, oculos: true }], [{ pele: PELES[3], marca: { n: 3, cor: ELEMENTOS.terra } }], [{ pele: PELES[2], marca: { n: 1, cor: ELEMENTOS.agua }, chapeu: 'capuz', chapeuCor: '#2f8a3a' }],
      [REI_MAGO], [ANAO], [GUARDA], [{ pele: PELES[1], barba: '#2a1a12', barbaLonga: false, marca: { n: 3, cor: ELEMENTOS.fogo } }]].map(([o], i) => { const p = pessoa3D(T, { roupa: 'tunica', cor: ROUP[i % 6], seed: 100 + i, ...o }); p.position.set(40 + (i % 4) * 0.8, 0, (i < 4 ? 0 : -30)); st.add(p); return p; });
    return { stage: st, st, grade, closes }; },
  draw(s, lt, info, T) { const cam = s.st.camera, seg = Math.floor(lt / 3);
    s.grade.forEach((p, i) => { p.anima(lt, 'parado'); p.olhar(Math.sin(lt * 0.7 + i) * 0.3, 0); });
    const EX = ['neutro', 'riso', 'surpreso', 'nojo', 'raiva', 'desconfiado', 'orgulho', 'medo', 'sorriso'];
    s.closes.forEach((p, i) => { p.expressao(EX[(Math.floor(lt * 2) + i) % 9]); p.olhar(Math.sin(lt * 1.1 + i * 0.8) * 1.0, Math.sin(lt * 0.8 + i) * 0.3); p.anima(lt, i % 2 ? 'falar' : 'parado', { intensidade: 0.5 }); });
    if (seg === 0) { cam.position.set(0, 3.0, 17.0); cam.lookAt(0, 2.3, -1.8); s.st.foco(18); }
    else if (seg === 1) { cam.position.set(41.2, 1.45, 3.4); cam.lookAt(41.2, 1.35, 0); s.st.foco(3.4); }
    else { cam.position.set(41.2, 1.45, -26.6); cam.lookAt(41.2, 1.35, -30); s.st.foco(3.4); }
    s.st.tick(lt); } });
