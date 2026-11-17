// Texturas desenhadas em canvas — sem imagens externas
import { rnd } from './tempo.js';
import * as THREE from 'three';

const cache = {};
function tex(nome, w, h, draw, repeat) {
  const key = nome + (repeat ? repeat.join('x') : '');
  if (cache[key]) return cache[key];
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return (cache[key] = t);
}

// Piso cerâmico bege 60x60 com rejunte
export const piso = (r = [8, 8]) => tex('piso', 256, 256, (g, w) => {
  g.fillStyle = '#d9c7a5'; g.fillRect(0, 0, w, w);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(120,90,50,${rnd() * 0.06})`; g.fillRect(rnd() * w, rnd() * w, 6, 6); }
  g.strokeStyle = '#a8946e'; g.lineWidth = 4; g.strokeRect(0, 0, w, w);
}, r);

// Azulejo branco 15x15 com faixa decorativa
export const azulejo = (r = [6, 3], cor = '#e9eef0') => tex('azulejo' + cor, 128, 128, (g, w) => {
  g.fillStyle = cor; g.fillRect(0, 0, w, w);
  g.strokeStyle = '#b9c4c8'; g.lineWidth = 3; g.strokeRect(0, 0, w, w);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(10, 10, 40, 14);
}, r);

// Petit-pavê preto e branco (calçada de Curitiba, motivo de pinhão)
export const petitPave = (r = [10, 40]) => tex('pave', 256, 256, (g, w) => {
  g.fillStyle = '#d8d8d2'; g.fillRect(0, 0, w, w);
  g.fillStyle = '#2b2b2b';
  // pinhão estilizado
  g.beginPath(); g.moveTo(128, 30); g.quadraticCurveTo(200, 128, 128, 226); g.quadraticCurveTo(56, 128, 128, 30); g.fill();
  g.fillStyle = '#d8d8d2'; g.beginPath(); g.ellipse(128, 128, 22, 60, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.15})`; g.fillRect(rnd() * w, rnd() * w, 2, 2); }
}, r);

export const asfalto = (r = [4, 40]) => tex('asfalto', 256, 256, (g, w) => {
  g.fillStyle = '#2c2c30'; g.fillRect(0, 0, w, w);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.06})`; g.fillRect(rnd() * w, rnd() * w, 2, 2); }
  g.fillStyle = '#c9b24a'; g.fillRect(124, 0, 8, 120);
}, r);

// Fachada com janelas (acesas ou apagadas)
export const fachada = (acesa, cor) => tex('fach' + acesa + cor, 256, 256, (g, w) => {
  g.fillStyle = cor; g.fillRect(0, 0, w, w);
  const cols = 4, rows = 4;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = 18 + i * 60, y = 16 + j * 60;
    const lit = acesa && ((i * 7 + j * 13) % 5 !== 0);
    g.fillStyle = lit ? ((i + j) % 3 ? '#ffd98a' : '#bfe0ff') : '#1d2433';
    g.fillRect(x, y, 34, 40);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y + 40, 34, 4);
  }
});

// TV: jogo de futebol (2º tempo, 1 x 0)
export const tvJogo = () => tex('tv', 512, 288, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#1f7a3a'); grd.addColorStop(1, '#2fa04f');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(i * 64, 0, 64, h); }
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3;
  g.strokeRect(20, 40, w - 40, h - 60);
  g.beginPath(); g.moveTo(w / 2, 40); g.lineTo(w / 2, h - 20); g.stroke();
  g.beginPath(); g.arc(w / 2, h / 2 + 10, 40, 0, Math.PI * 2); g.stroke();
  // jogadores
  const p = [[150, 120, '#ffe14d'], [190, 170, '#ffe14d'], [300, 140, '#2b59c3'], [340, 200, '#2b59c3'], [260, 180, '#ffe14d'], [400, 110, '#2b59c3']];
  for (const [x, y, c] of p) { g.fillStyle = c; g.fillRect(x, y, 9, 18); g.fillStyle = '#222'; g.fillRect(x, y + 18, 9, 6); }
  g.fillStyle = '#fff'; g.beginPath(); g.arc(275, 175, 4, 0, 7); g.fill();
  // placar
  g.fillStyle = 'rgba(10,20,40,.85)'; g.fillRect(16, 10, 196, 30);
  g.fillStyle = '#fff'; g.font = 'bold 20px Inter, sans-serif'; g.fillText('CTB  1 × 0  VIS', 26, 32);
  g.fillStyle = '#ffd400'; g.fillRect(212, 10, 58, 30); g.fillStyle = '#111'; g.fillText("78'", 222, 32);
});

// Quadro de disjuntores com etiquetas escritas à mão
export const quadroDisj = () => tex('quadro', 256, 320, (g, w, h) => {
  g.fillStyle = '#e8e6df'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#999'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  const nomes = ['GERAL 40A', 'CHUVEIRO', 'TOMADAS', 'COZINHA', 'ILUMIN.', 'AR / TV'];
  nomes.forEach((n, i) => {
    const x = 26 + (i % 2) * 112, y = 30 + Math.floor(i / 2) * 92;
    g.fillStyle = '#2d2d2d'; g.fillRect(x, y, 80, 50);
    g.fillStyle = '#f2f2f2'; g.fillRect(x + 30, y + 8, 20, 18);
    g.fillStyle = '#2e7d32'; g.fillRect(x + 30, y + 8, 20, 6);
    g.fillStyle = '#1a237e'; g.font = 'bold 15px "JetBrains Mono", monospace'; g.fillText(n, x - 4, y + 72);
  });
});

// Calendário de parede (padaria do bairro)
export const calendario = () => tex('cal', 200, 280, (g, w, h) => {
  g.fillStyle = '#fff8e8'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#c62828'; g.fillRect(0, 0, w, 60);
  g.fillStyle = '#fff'; g.font = 'bold 20px Inter, sans-serif'; g.fillText('PANIFICADORA', 22, 28);
  g.font = '14px Inter, sans-serif'; g.fillText('BOM JESUS · CURITIBA', 24, 50);
  g.fillStyle = '#222'; g.font = 'bold 24px Inter, sans-serif'; g.fillText('NOVEMBRO', 40, 95);
  g.font = '14px "JetBrains Mono", monospace';
  for (let d = 1; d <= 30; d++) { const i = (d + 6) % 7, j = Math.floor((d + 6) / 7); g.fillStyle = d === 16 ? '#c62828' : '#333'; g.fillText(String(d).padStart(2, ' '), 14 + i * 26, 110 + j * 28); }
});

// Mostrador do rádio
export const dialRadio = () => tex('dial', 256, 96, (g, w, h) => {
  g.fillStyle = '#e8d9a8'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2a10'; g.font = 'bold 13px "JetBrains Mono", monospace';
  ['88', '92', '96', '100', '104', '108'].forEach((n, i) => g.fillText(n, 10 + i * 42, 30));
  g.fillText('FM', 230, 70);
  for (let i = 0; i < 50; i++) g.fillRect(12 + i * 4.6, 38, 1.5, i % 5 ? 8 : 14);
  ['53', '60', '80', '100', '130', '160'].forEach((n, i) => g.fillText(n, 10 + i * 40, 80));
});

// Camisa estilo "canarinho" (genérica)
export const camisa = () => tex('camisa', 128, 128, (g, w) => {
  g.fillStyle = '#f7d417'; g.fillRect(0, 0, w, w);
  g.fillStyle = '#1f8a3b'; g.fillRect(0, 0, w, 12); g.fillRect(0, 116, w, 12);
});

// Crochê do sofá
export const croche = () => tex('croche', 128, 128, (g, w) => {
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, w);
  g.strokeStyle = '#c9b48a'; g.lineWidth = 3;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(16 + i * 32, 16 + j * 32, 11, 0, 7); g.stroke(); }
}, [2, 2]);
