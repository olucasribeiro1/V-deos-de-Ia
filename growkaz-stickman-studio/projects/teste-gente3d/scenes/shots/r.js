import { registerShot, clamp } from '/engine/core.js';
import { palco, pbr, m } from '/series/semmarca/turbo.js';
import { pessoa3D, multidao3D, aparenciaAleatoria, GUARDA, REI_MAGO, DIRETOR, ELFO, ANAO, GAROTO_FOGO, CRIANCA, MAGO, ARQUEIRO } from '/series/semmarca/gente3d.js';
// grupos de 3 (x do grupo) + multidão; câmera troca a cada 2 s
const GR = [
  [[GUARDA, 'cajado', 'desconfiado'], [REI_MAGO, 'cajado', null], [DIRETOR, 'falar', 'sorriso']],
  [[MAGO, 'cajado', 'orgulho'], [ARQUEIRO, 'arco', 'raiva'], [ELFO, 'apontar', 'surpreso']],
  [[ANAO, 'martelar', 'raiva'], [GAROTO_FOGO, 'rir', 'riso'], [CRIANCA, 'surpreso', 'medo']],
  [[aparenciaAleatoria(3), 'andar', 'neutro'], [aparenciaAleatoria(4, { oculos: true }), 'bracos_cruzados', 'nojo'], [aparenciaAleatoria(5), 'cochichar', 'desconfiado']],
  [[aparenciaAleatoria(6), 'carregar', 'neutro'], [aparenciaAleatoria(7), 'falar', 'sorriso'], [aparenciaAleatoria(8), 'falar', 'surpreso']],
];
registerShot('R', { kind: '3d',
  init(T) { const THREE = T.THREE;
    const st = palco(T, { sky: ['#0a4ad0', '#3aa8ff', '#d8f4ff'], fog: [60, 200], fogColor: '#bfe4ff', exposicao: 1.0, keyColor: '#fff2d8', keyIntensity: 3.2, keyPos: [-8, 12, 10], ambient: 1.0, ambientSky: '#bfe0ff', shadowSize: 14, fov: 34, foco: 6, abertura: 0.0004, bloom: 0.3, bloomLimiar: 0.9, sat: 1.2, env: 0.55, ao: false });
    const chao = m(T, new THREE.PlaneGeometry(200, 200, 100, 100), pbr(T, '#6ac25a', { r: 0.95 })); chao.rotation.x = -Math.PI / 2; chao.castShadow = false; st.add(chao);
    const pes = []; GR.forEach((g, gi) => g.forEach(([ap, est, ex], k) => { const p = pessoa3D(T, ap); p.position.set(gi * 6 - 12 + (k - 1) * 1.0, 0, 0); p.est = est; p.ex = ex; if (est === 'arco') p.rotation.y = -0.7; st.add(p); pes.push(p); }));
    const specs = []; for (let i = 0; i < 12; i++) { const tp = ['anda', 'conversa', 'conversa', 'carrega', 'parado', 'anda'][i % 6]; specs.push({ tipo: tp, x: -3 + (i % 4) * 2, x1: 3 + (i % 3), z: -14 - Math.floor(i / 4) * 1.6, vel: 1.1 + (i % 3) * 0.2, frente: i % 2 ? -1 : 1, lado: i % 2, seed: 200 + i }); }
    for (let i = 1; i < specs.length; i += 6) { specs[i + 1].x = specs[i].x + 0.9; specs[i + 1].z = specs[i].z; }
    const mul = multidao3D(T, specs); st.add(mul);
    const close = [GAROTO_FOGO, aparenciaAleatoria(9, { marca: { n: 3, cor: '#2a9dff', brilho: 0.7 } }), ARQUEIRO].map((ap, k) => { const p = pessoa3D(T, ap); p.position.set(40 + (k - 1) * 0.75, 0, 0); st.add(p); return p; });
    return { stage: st, st, pes, mul, close }; },
  draw(s, lt, info, T) { const seg = Math.min(6, Math.floor(lt / 2)), cam = s.st.camera;
    if (seg < 5) { const gx = seg * 6 - 12; cam.position.set(gx + 0.3, 1.5, 9.0); cam.lookAt(gx, 1.0, 0); s.st.foco(9.0); }
    else if (seg === 6) { cam.position.set(40, 1.45, 4.6); cam.lookAt(40, 1.3, 0); s.st.foco(4.6); const EX = ['neutro','sorriso','riso','surpreso','nojo','raiva','desconfiado','orgulho','medo']; s.close.forEach((p, k) => { p.expressao(EX[(Math.floor((lt - 12) / 0.5) + k * 3) % 9]); p.olhar(Math.sin(lt * 1.3 + k) * 0.8, Math.sin(lt * 0.9) * 0.25); p.anima(lt, k === 1 ? 'falar' : 'parado', { intensidade: 0.6 }); }); }
    else { cam.position.set(1, 2.2, -5); cam.lookAt(1, 0.9, -16); s.st.foco(11); }
    for (const p of s.pes) { if (p.ex) p.expressao(p.ex); p.anima(lt, p.est, { vel: 1.2, bate: p.est === 'cajado' ? clamp(Math.sin(lt * 3)) : 0, fala: p.est === 'cajado' ? 0.6 : 0, t0: 0.3, intensidade: 1 }); }
    s.mul.update(lt, cam, { congela: 11, alvo: { x: 1, z: -5 } }); s.st.tick(lt); } });
