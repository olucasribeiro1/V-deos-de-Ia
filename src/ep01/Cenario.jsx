import { useMemo } from 'react';
import * as THREE from 'three';
import { toonGradient } from '../../toon.js';
import * as X from './texturas.js';
import { T } from './cena.js';
import { ramp, ruido, clamp, rnd } from './tempo.js';

const GRAD = toonGradient(3, 0.3);
const mats = {};
export const toon = (cor, extra = {}) => {
  const k = typeof cor === 'string' ? cor + JSON.stringify(Object.keys(extra)) : null;
  if (k && mats[k] && !Object.keys(extra).length) return mats[k];
  const m = new THREE.MeshToonMaterial({ color: cor, gradientMap: GRAD, ...extra });
  if (k && !Object.keys(extra).length) mats[k] = m;
  return m;
};
const OUT = new THREE.MeshBasicMaterial({ color: '#0d0d12', side: THREE.BackSide });

// cria uma malha e adiciona ao grupo
function add(g, geo, mat, pos, opts = {}) {
  const m = new THREE.Mesh(geo, typeof mat === 'string' ? toon(mat) : mat);
  m.position.set(...pos);
  if (opts.rot) m.rotation.set(...opts.rot);
  if (opts.outline) {
    const o = new THREE.Mesh(geo, OUT);
    o.scale.setScalar(1 + (opts.outline === true ? 0.035 : opts.outline));
    m.add(o);
  }
  g.add(m);
  return m;
}
const box = (g, w, h, d, mat, pos, opts) => add(g, new THREE.BoxGeometry(w, h, d), mat, pos, opts);
const cil = (g, r1, r2, h, mat, pos, opts) => add(g, new THREE.CylinderGeometry(r1, r2, h, opts?.seg || 16), mat, pos, opts);

// parede entre dois pontos (eixo x ou z), de y0 a y1
function parede(g, mat, eixo, fixo, a, z, y0 = 0, y1 = 2.7, esp = 0.12) {
  const len = z - a, c = (a + z) / 2, h = y1 - y0, y = (y0 + y1) / 2;
  if (eixo === 'x') box(g, len, h, esp, mat, [c, y, fixo]);
  else box(g, esp, h, len, mat, [fixo, y, c]);
}

function construir() {
  const g = new THREE.Group();
  const dyn = {};
  const paredeSala = toon('#e7dcc4'), paredeCoz = toon('#ffffff', { map: X.azulejo([6, 3]) });
  const paredeBan = toon('#ffffff', { map: X.azulejo([8, 4], '#cfe6ee') });

  // ---------- pisos e teto ----------
  const piso = (w, d, cx, cz, map) => add(g, new THREE.PlaneGeometry(w, d), toon('#ffffff', { map }), [cx, 0, cz], { rot: [-Math.PI / 2, 0, 0] });
  piso(13, 7, 2.5, -0.5, X.piso([13 / 0.6 / 1.6, 7 / 0.6 / 1.6]));
  piso(3.5, 4, -2.25, 5, X.piso([4, 4]));
  piso(4.5, 4, 1.75, 5, X.azulejo([12, 10], '#dfe7ea'));
  add(g, new THREE.PlaneGeometry(13.5, 11.5), toon('#d6d0c4'), [2.5, 2.7, 1.5], { rot: [Math.PI / 2, 0, 0] });
  box(g, 14, 0.3, 12, '#8d8a85', [2.5, -0.16, 1.5]); // laje

  // ---------- paredes ----------
  // sala
  parede(g, paredeSala, 'x', -4, -4, 4);
  parede(g, paredeSala, 'x', 3, -4, -3.2); parede(g, paredeSala, 'x', 3, -1.8, 1.6); parede(g, paredeSala, 'x', 3, 2.4, 4);
  parede(g, paredeSala, 'x', 3, -3.2, -1.8, 2.1); parede(g, paredeSala, 'x', 3, 1.6, 2.4, 2.1);
  parede(g, paredeSala, 'z', 4, -4, -0.9); parede(g, paredeSala, 'z', 4, 0.9, 3); parede(g, paredeSala, 'z', 4, -0.9, 0.9, 2.1);
  // fachada do prédio (oeste) com a porta de vidro da varanda
  const fach = toon('#d9a487');
  parede(g, fach, 'z', -4, -16, -1.2, -24, 30, 0.2); parede(g, fach, 'z', -4, 1.2, 16, -24, 30, 0.2);
  parede(g, fach, 'z', -4, -1.2, 1.2, 2.2, 30, 0.2); parede(g, fach, 'z', -4, -1.2, 1.2, -24, -0.3, 0.2);
  add(g, new THREE.PlaneGeometry(2.4, 2.2), new THREE.MeshBasicMaterial({ color: '#9fc3e8', transparent: true, opacity: 0.08, side: THREE.DoubleSide }), [-4, 1.1, 0], { rot: [0, Math.PI / 2, 0] });
  for (const z of [-1.2, 0, 1.2]) box(g, 0.08, 2.2, 0.06, '#c9ccd1', [-4, 1.1, z]);
  // corredor
  parede(g, paredeSala, 'x', -1, 4, 9); parede(g, paredeSala, 'x', 1, 4, 9);
  parede(g, paredeSala, 'z', 9, -1, -0.47); parede(g, paredeSala, 'z', 9, 0.47, 1); parede(g, paredeSala, 'z', 9, -0.47, 0.47, 2.1);
  // cozinha e banheiro
  parede(g, paredeCoz, 'z', -3.94, 3, 7); parede(g, paredeCoz, 'x', 7, -4, -0.5); parede(g, paredeCoz, 'z', -0.5, 3, 7);
  parede(g, paredeBan, 'x', 7, -0.5, 4); parede(g, paredeBan, 'z', 4, 3, 7); parede(g, paredeBan, 'z', -0.38, 3, 7);

  // ---------- sala ----------
  const sofa = '#8a4b2f';
  box(g, 2.3, 0.45, 0.95, sofa, [0, 0.25, 1.85], { outline: 0.02 });
  box(g, 2.3, 0.6, 0.22, sofa, [0, 0.75, 2.3], { outline: 0.02 });
  box(g, 0.22, 0.65, 0.95, sofa, [-1.15, 0.4, 1.85], { outline: 0.03 }); box(g, 0.22, 0.65, 0.95, sofa, [1.15, 0.4, 1.85], { outline: 0.03 });
  add(g, new THREE.PlaneGeometry(1.0, 0.7), toon('#ffffff', { map: X.croche(), side: THREE.DoubleSide }), [-0.4, 0.82, 2.18], { rot: [-0.15, 0, 0] });
  box(g, 0.5, 0.5, 0.12, '#2e7d6b', [0.6, 0.62, 2.1], { rot: [-0.2, 0, 0.2], outline: 0.05 }); // almofada
  box(g, 2.2, 0.5, 0.45, '#6d4c33', [0, 0.25, -3.72], { outline: 0.02 }); // rack
  box(g, 1.72, 0.99, 0.07, '#111', [0, 1.28, -3.86], { outline: 0.02 });
  dyn.tv = add(g, new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshBasicMaterial({ map: X.tvJogo() }), [0, 1.28, -3.82]);
  box(g, 1.0, 0.04, 0.6, '#7a5638', [0, 0.42, 0.2], { outline: 0.03 }); // mesinha
  for (const [x, z] of [[-0.45, -0.05], [0.45, -0.05], [-0.45, 0.45], [0.45, 0.45]]) box(g, 0.05, 0.4, 0.05, '#5a3e28', [x, 0.2, z]);
  box(g, 0.25, 0.12, 0.18, '#c62828', [0.25, 0.5, 0.25]); // controle remoto + latinha
  cil(g, 0.035, 0.035, 0.12, '#d0d0d0', [-0.2, 0.5, 0.3]);
  add(g, new THREE.CircleGeometry(1.4, 32), toon('#7b3f3f'), [0, 0.005, 0.4], { rot: [-Math.PI / 2, 0, 0] }); // tapete
  // ventilador de pé
  cil(g, 0.025, 0.025, 1.1, '#ddd', [2.0, 0.55, 1.6]); cil(g, 0.22, 0.25, 0.04, '#ddd', [2.0, 0.02, 1.6]);
  dyn.ventilador = add(g, new THREE.TorusGeometry(0.28, 0.015, 6, 24), '#e5e5e5', [2.0, 1.2, 1.5], { rot: [0, 0.6, 0] });
  // calendário, quadro de parede, planta
  add(g, new THREE.PlaneGeometry(0.4, 0.56), new THREE.MeshToonMaterial({ map: X.calendario(), gradientMap: GRAD }), [-2.6, 1.55, -3.93]);
  box(g, 0.9, 0.6, 0.03, '#2b5d8a', [2.4, 1.6, -3.93], { outline: 0.03 });
  cil(g, 0.18, 0.14, 0.35, '#9c5a3c', [3.5, 0.17, -0.7]);
  for (let i = 0; i < 7; i++) box(g, 0.05, 0.7 + (i % 3) * 0.15, 0.015, '#3f7d3a', [3.5 + Math.sin(i * 2) * 0.08, 0.7, -0.7 + Math.cos(i * 2) * 0.08], { rot: [Math.sin(i) * 0.15, i, Math.cos(i) * 0.12] });
  dyn.lampSala = add(g, new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), [0, 2.55, -0.5]);

  // ---------- corredor: quadro de disjuntores e porta ----------
  box(g, 0.52, 0.66, 0.1, '#cfcac0', [5.5, 1.6, -0.94], { outline: 0.02 });
  add(g, new THREE.PlaneGeometry(0.46, 0.58), new THREE.MeshToonMaterial({ map: X.quadroDisj(), gradientMap: GRAD }), [5.5, 1.6, -0.885]);
  const porta = new THREE.Group(); porta.position.set(5.27, 1.6, -0.87); g.add(porta); dyn.portaQuadro = porta;
  box(porta, 0.5, 0.64, 0.02, '#d8d3c9', [0.25, 0, 0.01], { outline: 0.02 });
  box(g, 0.92, 2.1, 0.07, '#6b3e22', [8.96, 1.05, 0], { outline: 0.01, rot: [0, Math.PI / 2, 0] }); // porta de entrada
  cil(g, 0.03, 0.03, 0.12, '#c8a64a', [8.9, 1.0, -0.33], { rot: [0, 0, Math.PI / 2] });
  box(g, 0.04, 0.12, 0.08, '#888', [8.91, 1.25, -0.33]); // tranca
  add(g, new THREE.PlaneGeometry(0.9, 0.5), toon('#4e3b2a'), [8.5, 0.006, 0], { rot: [-Math.PI / 2, 0, Math.PI / 2] }); // capacho
  // fresta sob a porta: luz de emergência do hall do prédio + sombra passando
  dyn.fresta = add(g, new THREE.PlaneGeometry(0.88, 0.02), new THREE.MeshBasicMaterial({ color: '#cfe0ff' }), [8.93, 0.012, 0], { rot: [0, -Math.PI / 2, 0] });
  dyn.sombra = box(g, 0.02, 0.026, 0.25, new THREE.MeshBasicMaterial({ color: '#000' }), [8.92, 0.013, -0.7]);
  dyn.lampCorr = add(g, new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), [6.5, 2.6, 0]);

  // ---------- cozinha ----------
  box(g, 2.4, 0.9, 0.6, '#f1ece2', [-1.8, 0.45, 6.68], { outline: 0.01 });
  box(g, 2.44, 0.04, 0.64, '#3b3b3f', [-1.8, 0.92, 6.68]); // granito
  dyn.gaveta = box(g, 0.55, 0.17, 0.5, '#e4dccb', [-2.4, 0.76, 6.62], { outline: 0.03 });
  box(g, 0.75, 0.88, 0.62, '#f4f4f4', [-3.45, 0.44, 6.68], { outline: 0.02 }); // fogão 4 bocas
  for (const [x, z] of [[-3.62, 6.55], [-3.28, 6.55], [-3.62, 6.82], [-3.28, 6.82]]) cil(g, 0.08, 0.08, 0.02, '#222', [x, 0.89, z]);
  cil(g, 0.17, 0.17, 0.5, '#5b7fa6', [-3.7, 0.28, 5.95], { outline: 0.04 }); // botijão P13
  add(g, new THREE.TorusGeometry(0.09, 0.02, 6, 16), '#5b7fa6', [-3.7, 0.6, 5.95], { rot: [Math.PI / 2, 0, 0] });
  // filtro de barro
  cil(g, 0.15, 0.13, 0.32, '#b5653b', [-0.95, 1.1, 6.72], { outline: 0.04 }); cil(g, 0.15, 0.15, 0.28, '#b5653b', [-0.95, 1.42, 6.72], { outline: 0.04 });
  cil(g, 0.06, 0.06, 0.05, '#b5653b', [-0.95, 1.59, 6.72]); cil(g, 0.012, 0.012, 0.08, '#ccc', [-0.95, 1.0, 6.56], { rot: [Math.PI / 2, 0, 0] });
  cil(g, 0.06, 0.06, 0.32, '#c62828', [-1.35, 1.1, 6.78], { outline: 0.05 }); // garrafa térmica
  box(g, 0.72, 1.9, 0.7, '#f7f7f7', [-3.55, 0.95, 3.55], { outline: 0.01 }); // geladeira
  box(g, 0.03, 0.4, 0.04, '#999', [-3.17, 1.2, 3.85]);
  box(g, 2.4, 0.6, 0.35, '#e4dccb', [-1.8, 2.0, 6.8], { outline: 0.01 }); // armário
  dyn.lampCoz = add(g, new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), [-2.2, 2.6, 5]);
  // rádio de pilha (fica na bancada depois que sai da gaveta)
  const radio = new THREE.Group(); radio.position.set(-2.4, 1.03, 6.58); g.add(radio); dyn.radio = radio;
  box(radio, 0.34, 0.2, 0.1, '#7b2d26', [0, 0, 0], { outline: 0.04 });
  add(radio, new THREE.PlaneGeometry(0.22, 0.08), new THREE.MeshBasicMaterial({ map: X.dialRadio() }), [-0.04, 0.03, -0.051], { rot: [0, Math.PI, 0] });
  dyn.agulha = box(radio, 0.006, 0.07, 0.004, '#c00', [-0.1, 0.03, -0.054]);
  cil(radio, 0.03, 0.03, 0.03, '#222', [0.12, 0.03, -0.06], { rot: [Math.PI / 2, 0, 0] });
  dyn.dialBotao = radio.children[radio.children.length - 1];
  for (let i = 0; i < 5; i++) box(radio, 0.2, 0.008, 0.004, '#3a1a14', [-0.04, -0.035 - i * 0.012, -0.052]);
  cil(radio, 0.004, 0.004, 0.45, '#bbb', [0.13, 0.32, 0], { rot: [0, 0, -0.35] });

  // ---------- banheiro ----------
  box(g, 3.0, 0.55, 0.75, '#fafafa', [1.5, 0.275, 6.6], { outline: 0.01 });
  box(g, 2.8, 0.02, 0.6, '#9fd0e6', [1.5, 0.08, 6.6]); // fundo da banheira
  dyn.agua = box(g, 2.75, 1, 0.55, new THREE.MeshToonMaterial({ color: '#5aa9d6', gradientMap: GRAD, transparent: true, opacity: 0.75 }), [1.5, 0.1, 6.6]);
  cil(g, 0.03, 0.03, 0.22, '#c0c0c0', [0.15, 0.68, 6.6], { rot: [0, 0, Math.PI / 2] }); // torneira
  cil(g, 0.035, 0.035, 0.08, '#c0c0c0', [0.05, 0.72, 6.75]);
  dyn.jato = cil(g, 0.025, 0.02, 1, new THREE.MeshBasicMaterial({ color: '#a8d8f0', transparent: true, opacity: 0.8 }), [0.26, 0.4, 6.6]);
  box(g, 0.3, 0.38, 0.12, '#fbfbfb', [0.35, 2.05, 6.88], { outline: 0.03 }); // chuveiro elétrico
  cil(g, 0.13, 0.13, 0.04, '#fbfbfb', [0.35, 1.85, 6.78], { outline: 0.04 });
  box(g, 0.5, 0.15, 0.4, '#fafafa', [3.7, 0.85, 4.5], { outline: 0.03 }); // pia
  add(g, new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ color: '#6c8aa1' }), [3.93, 1.55, 4.5], { rot: [0, -Math.PI / 2, 0] });
  cil(g, 0.2, 0.18, 0.4, '#fafafa', [3.6, 0.2, 5.9], { outline: 0.03 }); // vaso
  box(g, 0.4, 0.4, 0.18, '#fafafa', [3.85, 0.55, 5.9]);
  dyn.lampBan = add(g, new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), [1.8, 2.6, 5]);

  // ---------- varanda ----------
  box(g, 2.1, 0.2, 4.2, '#a59f96', [-5.0, -0.1, 0]);
  add(g, new THREE.PlaneGeometry(2.0, 4.0), toon('#ffffff', { map: X.piso([3, 6]) }), [-5.0, 0.005, 0], { rot: [-Math.PI / 2, 0, 0] });
  box(g, 0.06, 0.06, 4.2, '#2f3338', [-5.98, 1.08, 0]); box(g, 2.1, 0.06, 0.06, '#2f3338', [-5.0, 1.08, -2.07]); box(g, 2.1, 0.06, 0.06, '#2f3338', [-5.0, 1.08, 2.07]);
  for (let z = -2; z <= 2.01; z += 0.16) box(g, 0.025, 1.05, 0.025, '#2f3338', [-5.98, 0.53, z]);
  for (const s of [-1, 1]) for (let x = -5.9; x < -4.1; x += 0.16) box(g, 0.025, 1.05, 0.025, '#2f3338', [x, 0.53, s * 2.07]);
  cil(g, 0.22, 0.16, 0.4, '#9c5a3c', [-4.4, 0.2, 1.7]); add(g, new THREE.SphereGeometry(0.32, 8, 6), '#3f7d3a', [-4.4, 0.6, 1.7]);
  // varal de chão (bem brasileiro)
  for (const z of [-1.6, -1.0]) box(g, 0.02, 0.9, 0.02, '#ccc', [-4.6, 0.45, z]);
  box(g, 0.02, 0.02, 0.6, '#ccc', [-4.6, 0.9, -1.3]);
  box(g, 0.35, 0.45, 0.01, '#3a6fb0', [-4.6, 0.68, -1.4], { rot: [0, Math.PI / 2, 0] });

  // ---------- cidade lá embaixo ----------
  const Y = -22;
  const chao = add(g, new THREE.PlaneGeometry(260, 260), toon('#2f3b2c'), [-40, Y - 0.02, 0], { rot: [-Math.PI / 2, 0, 0] });
  chao.material = toon('#2f3b2c');
  add(g, new THREE.PlaneGeometry(10, 240), toon('#ffffff', { map: X.asfalto([2, 24]) }), [-19, Y, 0], { rot: [-Math.PI / 2, 0, 0] });
  for (const x of [-12.5, -25.5]) add(g, new THREE.PlaneGeometry(3, 240), toon('#ffffff', { map: X.petitPave([2, 80]) }), [x, Y + 0.02, 0], { rot: [-Math.PI / 2, 0, 0] });
  for (const x of [-14, -24]) box(g, 0.2, 0.18, 240, '#8a8a85', [x, Y + 0.09, 0]); // meio-fio

  // prédios
  dyn.predios = [];
  const cores = ['#d9c9a3', '#c98f7a', '#a9c2a0', '#e2d6bf', '#b8a3c4', '#d6b46a', '#9fb4c7'];
  const predio = (x, z, w, d, h, i) => {
    const cor = cores[i % cores.length];
    const lit = X.fachada(true, cor).clone(), dark = X.fachada(false, cor).clone();
    for (const t of [lit, dark]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(Math.max(1, w / 6), Math.max(1, h / 6)); t.needsUpdate = true; }
    const m = box(g, w, h, d, toon('#ffffff', { map: lit }), [x, Y + h / 2, z], { outline: 0.004 });
    dyn.predios.push({ m, lit, dark });
  };
  let i = 0;
  for (let z = -90; z < 90; z += 14 + (i % 3) * 3) { predio(-36 - (i % 2) * 4, z, 12, 10, 14 + ((i * 37) % 30), i); i++; }
  for (let z = -90; z < 90; z += 18) { if (Math.abs(z) > 14) predio(-2, z, 12, 10, 18 + ((i * 23) % 26), i); i++; }
  for (let z = -120; z < 120; z += 22) { predio(-70, z, 14, 14, 30 + ((i * 41) % 40), i); i++; }
  predio(-8, -40, 10, 10, 34, 2); predio(-8, 40, 10, 10, 28, 5);
  // nosso prédio (abaixo da varanda)
  box(g, 0.5, 22, 30, '#d9a487', [-4.3, Y + 11 - 0.3, 0]);

  // postes de concreto com fiação + transformador
  dyn.lampadas = [];
  const postes = [];
  for (const [x, lado] of [[-13.6, -1], [-24.4, 1]]) for (let z = -75; z <= 75; z += 15) {
    const zz = z + (lado > 0 ? 7 : 0);
    cil(g, 0.12, 0.18, 9, '#9a978f', [x, Y + 4.5, zz], { seg: 8 });
    box(g, 0.12, 0.12, 1.6, '#9a978f', [x, Y + 8.4, zz]);
    box(g, 2.0, 0.08, 0.08, '#555', [x + lado * -1.0 * -1, Y + 7.6, zz]);
    const lamp = box(g, 0.5, 0.15, 0.25, new THREE.MeshBasicMaterial({ color: '#ffb547' }), [x - lado * -2.0, Y + 7.5, zz]);
    dyn.lampadas.push(lamp);
    if ((z / 15) % 3 === 0) cil(g, 0.35, 0.35, 0.9, '#6f7a74', [x + 0.4 * lado, Y + 6.8, zz], { seg: 10 }); // transformador
    postes.push([x, zz]);
  }
  // fios caídos entre os postes
  const fioMat = new THREE.MeshBasicMaterial({ color: '#111' });
  for (let k = 0; k < postes.length - 1; k++) {
    const [x1, z1] = postes[k], [x2, z2] = postes[k + 1];
    if (x1 !== x2) continue;
    for (const [dz, dy, sag] of [[-0.6, 8.4, 0.5], [0, 8.4, 0.7], [0.6, 8.4, 0.55], [0, 7.2, 0.9]]) {
      const a = new THREE.Vector3(x1, Y + dy, z1 + dz * 0), b2 = new THREE.Vector3(x2, Y + dy, z2);
      a.x += dz * 0.5; b2.x += dz * 0.5;
      const mid = a.clone().lerp(b2, 0.5); mid.y -= sag;
      const curva = new THREE.QuadraticBezierCurve3(a, mid, b2);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 12, 0.025, 4), fioMat));
    }
  }
  // araucárias (símbolo de Curitiba)
  const arauc = (x, z, h) => {
    cil(g, 0.25, 0.4, h, '#4a3426', [x, Y + h / 2, z], { seg: 8 });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2, r = 1.8 + (k % 2) * 0.6;
      const galho = cil(g, 0.08, 0.08, r * 1.2, '#4a3426', [x + Math.sin(a) * r * 0.5, Y + h - 0.6, z + Math.cos(a) * r * 0.5], { seg: 5 });
      galho.lookAt(x + Math.sin(a) * r, Y + h + 0.2, z + Math.cos(a) * r); galho.rotateX(Math.PI / 2);
      add(g, new THREE.CylinderGeometry(1.0, 0.25, 0.7, 8), '#1f4d2b', [x + Math.sin(a) * r, Y + h + 0.15, z + Math.cos(a) * r]);
    }
    add(g, new THREE.CylinderGeometry(1.3, 0.4, 0.9, 8), '#1f4d2b', [x, Y + h + 0.35, z]);
  };
  for (const [x, z, h] of [[-29, -22, 17], [-46, 12, 22], [-10, 28, 15], [-28, 36, 19], [-58, -30, 24], [-20, -58, 20], [-52, 55, 21], [-9, -24, 14]]) arauc(x, z, h);
  // carros estacionados
  const carro = (x, z, cor) => {
    box(g, 1.7, 0.6, 3.8, cor, [x, Y + 0.5, z], { outline: 0.02 });
    box(g, 1.5, 0.5, 2.0, cor, [x, Y + 1.05, z - 0.2], { outline: 0.02 });
    box(g, 1.52, 0.38, 1.9, '#1b2633', [x, Y + 1.07, z - 0.2]);
    for (const [dx, dz] of [[-0.85, 1.2], [0.85, 1.2], [-0.85, -1.2], [0.85, -1.2]]) cil(g, 0.32, 0.32, 0.2, '#111', [x + dx, Y + 0.32, z + dz], { rot: [0, 0, Math.PI / 2] });
  };
  carro(-15.3, -6, '#b23a2e'); carro(-15.3, 12, '#e8e8e8'); carro(-22.7, -16, '#3b5f8f'); carro(-22.7, 22, '#4d4d4d');
  // cachorro de rua (caramelo, claro)
  const dog = new THREE.Group(); dog.position.set(-19.5, Y, 3); dog.rotation.y = 0.8; g.add(dog); dyn.cachorro = dog;
  box(dog, 0.32, 0.3, 0.75, '#c98a3d', [0, 0.45, 0], { outline: 0.06 });
  const cab = new THREE.Group(); cab.position.set(0, 0.68, 0.45); dog.add(cab); dyn.cabDog = cab;
  box(cab, 0.26, 0.26, 0.28, '#c98a3d', [0, 0, 0], { outline: 0.06 }); box(cab, 0.16, 0.12, 0.16, '#b0762f', [0, -0.05, 0.18]);
  box(cab, 0.06, 0.12, 0.04, '#7a4a1c', [-0.1, 0.17, -0.02]); box(cab, 0.06, 0.12, 0.04, '#7a4a1c', [0.1, 0.17, -0.02]);
  for (const [x, z] of [[-0.11, 0.28], [0.11, 0.28], [-0.11, -0.28], [0.11, -0.28]]) box(dog, 0.08, 0.32, 0.08, '#b0762f', [x, 0.16, z]);
  box(dog, 0.05, 0.05, 0.35, '#c98a3d', [0, 0.65, -0.48], { rot: [0.8, 0, 0] });

  // ---------- céu, lua, estrelas ----------
  const ceuTex = (cores) => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 256); cores.forEach(([p, cor]) => gr.addColorStop(p, cor));
    x.fillStyle = gr; x.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  dyn.ceuAceso = ceuTex([[0, '#0b1230'], [0.42, '#26304f'], [0.5, '#7a5a4a'], [0.53, '#22202a'], [1, '#111']]);
  dyn.ceuApagado = ceuTex([[0, '#03050d'], [0.45, '#0b1326'], [0.5, '#16203a'], [0.53, '#05060a'], [1, '#000']]);
  dyn.ceu = add(g, new THREE.SphereGeometry(400, 24, 16), new THREE.MeshBasicMaterial({ map: dyn.ceuAceso, side: THREE.BackSide, fog: false }), [0, 0, 0]);
  add(g, new THREE.SphereGeometry(7, 20, 16), new THREE.MeshBasicMaterial({ color: '#f1efe0' }), [-200, 95, -70]);
  const est = new Float32Array(900 * 3);
  for (let k = 0; k < 900; k++) {
    const a = rnd() * Math.PI * 2, el = 0.12 + rnd() * 1.3;
    est.set([Math.cos(a) * Math.cos(el) * 380, Math.sin(el) * 380, Math.sin(a) * Math.cos(el) * 380], k * 3);
  }
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(est, 3));
  dyn.estrelas = new THREE.Points(eg, new THREE.PointsMaterial({ color: '#ffffff', size: 1.4, sizeAttenuation: false, transparent: true }));
  g.add(dyn.estrelas);

  return { g, dyn };
}

export const Cenario = ({ t }) => {
  const { g, dyn } = useMemo(construir, []);
  const apagado = t >= T.apagao;

  // TV: jogo até o apagão
  dyn.tv.material.color.set(apagado ? '#050505' : '#ffffff');
  dyn.tv.material.map = apagado ? null : X.tvJogo(); dyn.tv.material.needsUpdate = true;
  for (const l of [dyn.lampSala, dyn.lampCorr, dyn.lampCoz, dyn.lampBan]) l.material.color.set(apagado ? '#3a3a36' : '#fff3c4');
  for (const p of dyn.predios) { const m = apagado ? p.dark : p.lit; if (p.m.material.map !== m) { p.m.material.map = m; p.m.material.needsUpdate = true; } }
  for (const l of dyn.lampadas) l.material.color.set(apagado ? '#2a2a2a' : '#ffb547');
  dyn.ceu.material.map = apagado ? dyn.ceuApagado : dyn.ceuAceso;
  dyn.estrelas.material.opacity = ramp(t, T.apagao + 2, T.apagao + 10) * 0.9;
  dyn.ventilador.rotation.z = apagado ? 0 : t * 12;

  // quadro abre, gaveta abre, rádio aparece
  dyn.portaQuadro.rotation.y = -ramp(t, T.levanta + 5.2, T.levanta + 6.2) * 1.9;
  dyn.gaveta.position.z = 6.62 - ramp(t, T.gaveta - 0.3, T.gaveta + 0.2) * 0.38;
  dyn.radio.visible = t >= T.radio;
  const sintonia = ramp(t, T.radio + 0.8, T.radio + 7.5);
  dyn.agulha.position.x = -0.1 + sintonia * 0.12 + Math.sin(t * 9) * 0.004 * (1 - sintonia);
  dyn.dialBotao.rotation.y = sintonia * 8;

  // banheira enchendo
  const nivel = clamp((t - T.torneira) / 9, 0, 1) * 0.6;
  const aberto = t >= T.torneira;
  dyn.agua.visible = aberto && nivel > 0.01;
  dyn.agua.scale.y = Math.max(0.001, nivel * 0.45); dyn.agua.position.y = 0.09 + (nivel * 0.45) / 2;
  dyn.jato.visible = aberto;
  const topo = 0.66, fundo = 0.09 + nivel * 0.45;
  dyn.jato.scale.y = topo - fundo; dyn.jato.position.y = (topo + fundo) / 2;

  // cachorro latindo até o silêncio, depois some
  dyn.cachorro.visible = t < T.silencio;
  dyn.cabDog.rotation.x = Math.max(0, Math.sin(t * 14)) * -0.35;

  // fresta da porta: sombra passa e PARA na frente
  const s = ramp(t, T.fechamento - 4.5, T.fechamento - 0.5);
  dyn.sombra.position.z = -0.7 + s * 0.65 + ruido(t, 0.3) * 0.02;
  dyn.sombra.scale.z = 1 + s * 1.2;
  dyn.fresta.material.color.set(apagado ? '#9fb6e0' : '#fff2c8');

  return <primitive object={g} />;
};

export { T };
