// Plano-sequência: posições do Nelson e da câmera ancoradas nos beats da narração.
// Planta do apê (metros): sala x[-4,4] z[-4,3] · corredor x[4,9] · cozinha x[-4,-0.5] z[3,7]
// banheiro x[-0.5,4] z[3,7] · varanda x[-6,-4] · rua lá embaixo (8º andar, y = -22)
import { b, ev, palavra } from './tempo.js';

const P = Math.PI;
export const T = {
  apagao: ev('apagao').start,
  levanta: b('corredor', 0.02),
  celularIn: b('quadro', 0.85), celularOut: b('cozinha', 0.05),
  gaveta: palavra('f08', 'guardado.'),
  radio: palavra('f08', 'guardado.') + 0.9,
  lanterna: ev('lanterna').start,
  torneira: ev('torneira').start,
  silencio: palavra('f15', 'silêncio'),
  coracao: palavra('f16', 'cachorro'),
  fechamento: ev('fechamento').start,
};

// ---------- Nelson: [x, z], rotY (0 = olhando +z) ----------
export const ROSTO = 1.77; // altura dos olhos do Nelson
const NJ = [-2.9, 0], NK = [-2.75, 5.65], NB = [1.75, 5.65], NV = [-5.25, 0];
const rJ = -P / 2, rK = 0, rB = -1.04, rV = -P / 2;
// ponto relativo ao Nelson: frente, direita, altura
const rel = (n, th, f, d, y) => [n[0] + Math.sin(th) * f + Math.cos(th) * d, y, n[1] + Math.cos(th) * f - Math.sin(th) * d];
export const CELULAR = rel(NJ, rJ, 0.32, 0.05, 1.25);

export const NELSON = [
  { t: 0, v: [0, 1.55], r: P },
  { t: T.levanta + 0.6, v: [0, 1.25], r: P },
  { t: b('corredor', 0.35), v: [2.6, 0.3], r: P / 2 },
  { t: b('corredor', 0.75), v: [5.5, -0.35], r: P },
  { t: b('quadro', 0.55), v: [5.5, -0.35], r: P },
  { t: b('quadro', 0.8), v: [1.8, 0.1], r: -P / 2 },
  { t: b('janela', 0.06), v: NJ, r: rJ },
  { t: b('cozinha', 0.08), v: NJ, r: rJ },
  { t: b('cozinha', 0.3), v: [-2.5, 2.2], r: 0 },
  { t: b('cozinha', 0.45), v: NK, r: rK },
  { t: b('lanterna', 0.42), v: NK, r: rK },
  { t: b('lanterna', 0.62), v: [-2.4, 2.4], r: P },
  { t: b('lanterna', 0.85), v: [0.6, 1.9], r: P / 2 },
  { t: b('lanterna', 1.0), v: [2.0, 2.6], r: 0 },
  { t: b('banheiro', 0.2), v: NB, r: rB },
  { t: b('banheiro', 0.82), v: NB, r: rB },
  { t: b('banheiro', 1.0), v: [2.0, 2.5], r: P },
  { t: b('varanda', 0.3), v: [-1.6, 0.6], r: -P / 2 },
  { t: b('varanda', 0.55), v: NV, r: rV },
  { t: b('porta', 0.05), v: NV, r: rV },
  { t: b('porta', 0.15), v: [-5.0, 0.1], r: P / 2 },
  { t: b('porta', 0.5), v: [0.6, 0.15], r: P / 2 },
  { t: 999, v: [0.6, 0.15], r: P / 2 },
];

// ---------- Câmera: posição, alvo, fov ----------
const orbita = (cx, cz, y, raio, a0, a1, t0, t1, alvoY, n = 6, fov = 42) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return { t: t0 + ((t1 - t0) * i) / n, v: [cx + Math.sin(a) * raio, y, cz + Math.cos(a) * raio], alvo: [cx, alvoY, cz], fov };
  });
const giroRua = (cx, cy, cz, t0, t1, n = 8) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = -P / 2 + (2 * P * i) / n; // começa olhando a rua (-x) e dá a volta
    return { t: t0 + ((t1 - t0) * i) / n, v: [cx, cy, cz], alvo: [cx + Math.sin(a) * 20, cy - 4, cz + Math.cos(a) * 20], fov: 58 };
  });
const rostoJ = rel(NJ, rJ, 0, 0, ROSTO), rostoK = rel(NK, rK, 0, 0, ROSTO), rostoV = rel(NV, rV, 0, 0, ROSTO);
const ombroCel = rel(NJ, rJ, -0.1, 0.45, 1.8);
const lantK = rel(NK, rK, 0.33, 0.2, 1.12);
const RADIO = [-2.4, 1.03, 6.58], GAVETA = [-2.4, 0.75, 6.4], TORNEIRA = [0.2, 0.62, 6.6];

export const CAMERA = [
  // sofá: tracking rápido em volta do Nelson
  { t: 0, v: [3.2, 2.3, -2.6], alvo: [0, 1.0, 1.5], fov: 50 },
  ...orbita(0, 1.5, 1.45, 2.4, P * 0.6, P * 1.75, b('sofa', 0.15), b('sofa', 0.85), 1.0, 5),
  { t: b('sofa', 1.0), v: [0.45, 1.5, 2.6], alvo: [0, 1.25, -3.9], fov: 45 },
  // TV: zoom até o jogo, apagão, recua no escuro
  { t: b('tv', 0.45), v: [0.15, 1.35, 0.3], alvo: [0, 1.25, -3.9], fov: 40 },
  { t: T.apagao, v: [0, 1.28, -2.45], alvo: [0, 1.25, -3.9], fov: 34 },
  { t: b('tv', 1.0), v: [-1.4, 1.6, -1.6], alvo: [0, 1.0, 1.3], fov: 48 },
  // corredor: segue o Nelson até o quadro
  { t: b('corredor', 0.2), v: [-0.6, 1.65, 3.0], alvo: [0.3, 1.1, 1.0], fov: 50 },
  { t: b('corredor', 0.45), v: [0.8, 1.7, 1.9], alvo: [3.5, 1.25, 0], fov: 50 },
  { t: b('corredor', 0.75), v: [3.2, 1.65, 0.45], alvo: [5.5, 1.4, -0.6], fov: 46 },
  { t: b('corredor', 1.0), v: [5.15, 1.75, 0.6], alvo: [5.5, 1.6, -1], fov: 40 },
  // quadro de disjuntores
  { t: b('quadro', 0.35), v: [5.5, 1.7, 0.15], alvo: [5.5, 1.6, -1], fov: 40 },
  { t: b('quadro', 0.6), v: [5.0, 1.75, 0.6], alvo: [3.5, 1.3, 0], fov: 46 },
  { t: b('quadro', 0.85), v: [1.6, 1.75, 0.6], alvo: [-2, 1.4, 0], fov: 50 },
  // janela: atravessa a porta de vidro até a varanda, olha a rua apagada, volta pro celular
  { t: b('janela', 0.06), v: rel(NJ, rJ, -0.9, 0.4, 1.75), alvo: [-6, 1.3, 0], fov: 46 },
  { t: b('janela', 0.18), v: [-5.75, 1.75, 0.45], alvo: [-19, -21.5, 2], fov: 56 },
  { t: b('janela', 0.3), v: ombroCel, alvo: CELULAR, fov: 30 },
  { t: b('janela', 0.45), v: rel(NJ, rJ, -0.05, 0.42, 1.75), alvo: CELULAR, fov: 24 },
  ...orbita(NJ[0], NJ[1], 1.6, 0.95, 0.15, -P * 1.75, b('janela', 0.55), b('janela', 0.97), 1.55, 6, 46),
  // ligação: zoom na tela
  { t: b('ligacao', 0.35), v: ombroCel, alvo: CELULAR, fov: 26 },
  { t: b('ligacao', 0.95), v: rel(NJ, rJ, -0.05, 0.42, 1.75), alvo: CELULAR, fov: 22 },
  // rosto tenso
  { t: b('rosto', 0.45), v: rel(NJ, rJ, 1.05, 0.2, ROSTO + 0.02), alvo: rostoJ, fov: 36 },
  { t: b('rosto', 1.0), v: rel(NJ, rJ, 0.85, 0.06, ROSTO + 0.01), alvo: rostoJ, fov: 32 },
  // cozinha: segue até a gaveta
  { t: b('cozinha', 0.2), v: [-3.3, 1.75, -0.5], alvo: [-2.6, 1.2, 2.2], fov: 50 },
  { t: b('cozinha', 0.4), v: [-1.9, 1.75, 2.4], alvo: [-2.6, 1.0, 5.5], fov: 48 },
  { t: b('cozinha', 0.65), v: [-1.6, 1.6, 4.9], alvo: GAVETA, fov: 42 },
  { t: b('cozinha', 0.9), v: [-1.85, 1.3, 5.6], alvo: GAVETA, fov: 36 },
  // dial do rádio
  { t: b('dial', 0.15), v: [-1.85, 1.3, 6.1], alvo: RADIO, fov: 30 },
  { t: b('dial', 0.9), v: [-2.0, 1.2, 6.2], alvo: RADIO, fov: 22 },
  // close no rosto (de frente, por cima da bancada)
  { t: b('close', 0.12), v: rel(NK, rK, 0.95, 0.25, 1.62), alvo: rostoK, fov: 38 },
  { t: b('close', 0.95), v: rel(NK, rK, 0.85, 0.08, 1.64), alvo: rostoK, fov: 33 },
  // lanterna: liga, e segue o feixe pela casa até o banheiro
  { t: b('lanterna', 0.1), v: [-1.55, 1.5, 6.4], alvo: lantK, fov: 44 },
  { t: b('lanterna', 0.4), v: [-1.4, 1.65, 4.4], alvo: [-2.6, 1.1, 6.5], fov: 48 },
  { t: b('lanterna', 0.62), v: [-2.2, 1.75, 4.7], alvo: [-2.4, 1.2, 1.5], fov: 50 },
  { t: b('lanterna', 0.85), v: [-1.9, 1.75, 2.6], alvo: [1.5, 1.1, 2.2], fov: 50 },
  { t: b('lanterna', 1.0), v: [0.6, 1.75, 1.3], alvo: [2.0, 1.1, 4.0], fov: 48 },
  // banheiro: torneira, nível subindo
  { t: b('banheiro', 0.22), v: [2.6, 1.75, 3.6], alvo: [0.6, 0.7, 6.4], fov: 46 },
  { t: b('banheiro', 0.45), v: [0.75, 1.1, 5.8], alvo: TORNEIRA, fov: 34 },
  { t: b('banheiro', 0.8), v: [0.9, 1.35, 5.5], alvo: [1.3, 0.35, 6.6], fov: 40 },
  { t: b('banheiro', 1.0), v: [2.2, 1.75, 3.6], alvo: [-1, 1.2, 0.8], fov: 50 },
  // varanda: corre até lá, giro 360° pela rua
  { t: b('varanda', 0.3), v: [0.6, 1.8, 1.8], alvo: [-3, 1.2, 0.3], fov: 50 },
  { t: b('varanda', 0.52), v: [-3.6, 1.8, 0.6], alvo: [-6, 1.3, 0], fov: 50 },
  ...giroRua(-5.7, 1.75, -0.9, b('varanda', 0.62), b('rua', 0.28), 8),
  // rua: zoom acelerado na escuridão até o cachorro
  { t: b('rua', 0.45), v: [-9, -4, -0.5], alvo: [-19.5, -21.5, 3], fov: 50 },
  { t: T.silencio, v: [-15.5, -17, 1.5], alvo: [-19.5, -21.7, 3], fov: 40 },
  { t: b('rua', 1.0), v: [-14.5, -16, 1.5], alvo: [-19.5, -21.7, 3], fov: 38 },
  // volta subindo até o rosto do Nelson (push-in)
  { t: b('rosto2', 0.1), v: rel(NV, rV, 1.7, 0.35, ROSTO + 0.25), alvo: rostoV, fov: 42 },
  { t: b('rosto2', 0.22), v: rel(NV, rV, 1.3, 0.25, ROSTO + 0.03), alvo: rostoV, fov: 38 },
  { t: b('rosto2', 1.0), v: rel(NV, rV, 1.0, 0.05, ROSTO + 0.01), alvo: rostoV, fov: 32 },
  // porta: passa pelo Nelson e avança pelo corredor até a porta
  { t: b('porta', 0.12), v: [-6.1, 1.75, 0.9], alvo: [-4, 1.4, 0], fov: 44 },
  { t: b('porta', 0.35), v: [-3.4, 1.75, 0.8], alvo: [1.5, 1.3, 0.1], fov: 46 },
  { t: b('porta', 0.55), v: [1.7, 1.55, 0.35], alvo: [9, 1.0, 0], fov: 46 },
  { t: b('porta', 0.8), v: [5.8, 1.35, 0.1], alvo: [9, 0.8, 0], fov: 42 },
  { t: b('porta', 1.0), v: [8.3, 0.9, 0.0], alvo: [9, 0.6, 0], fov: 40 },
];
