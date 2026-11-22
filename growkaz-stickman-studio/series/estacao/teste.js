// cena de teste do elenco (só para revisão)
import { registerShot } from '/engine/core.js';
import { THREE, palco, cam3, post } from '/series/estacao/base.js';
import { mulher, LIVIA, SENHORA, ESTUDANTE, sombra, EXPR, pessoa, TERNO, GARI, DIEGO } from '/series/estacao/elenco.js';
import { lam } from '/series/turno/ps1.js';
const NOMES = ['neutro', 'alivio', 'aperto', 'nojo', 'desconfia', 'medo', 'panico', 'firme', 'deboche', 'sorrisoFalso'];
registerShot('TESTE', { kind: '3d',
  init(T) { const st = palco(T, { neblina: '#30343c' }); const S = st.scene;
    S.add(new THREE.HemisphereLight(0xb0b8c8, 0x403830, 1.2)); const d = new THREE.DirectionalLight(0xfff0dd, 2.2); d.position.set(2, 3, 3); S.add(d);
    const ch = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), lam('#6a6a6e', { fixo: true })); ch.rotation.x = -Math.PI / 2; S.add(ch);
    const L = mulher(LIVIA); S.add(L); L.add(sombra()); const s2 = mulher(SENHORA); s2.position.set(1.2, 0, -0.5); S.add(s2); const s3 = mulher(ESTUDANTE); s3.position.set(-1.2, 0, -0.5); S.add(s3);
    const t = pessoa(TERNO); t.position.set(2.4, 0, -1); S.add(t); const g = pessoa(GARI); g.position.set(-2.4, 0, -1); S.add(g);
    return { stage: st, L, s2, s3 }; },
  draw(s, lt) { const T = lt, st = s.stage, L = s.L; const v = Math.floor(T / 2), e = NOMES[Math.floor(T * 2) % NOMES.length];
    L.parado(); L.braco('E', 0.1, 0.1, 0.2); L.braco('D', 0.1, 0.1, 0.2); L.face(e); s.s2.face('sorrisoMorto'); s.s3.face('fixa'); L.rotation.y = 0;
    const O = L.olhos();
    const V = [[[0.05, 1.56, 0.55], O, 30], [[0.45, 1.58, 0.45], O, 32], [[0, 1.1, 3.6], [0, 0.9, 0], 45], [[2.6, 0.5, 0.2], [0, 0.3, 0], 30], [[0.5, 1.7, -1.4], [0, 1.4, 0.5], 50], [[0, 0.9, 5.5], [0, 0.9, 0], 55]][v % 6];
    if (v % 6 === 3) L.anda(T * 4, 1);
    cam3(st.camera, T, [[0, { p: V[0], m: V[1], f: V[2] }]], { mao: 0 }); post(st, T); } });
