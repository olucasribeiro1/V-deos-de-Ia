/**
 * Biblioteca de poses de mão (espaço de câmera, metros/graus).
 * p = posição do pulso; r = rotação Euler XYZ; curl = dedos fechados (0..1); thumb = polegar fechado.
 * Valores para a MÃO DIREITA — a esquerda é espelhada automaticamente.
 */
export type HandPose = {p: [number, number, number]; r: [number, number, number]; curl: number; thumb: number};

export const HP = {
  hidden: {p: [0.26, -0.62, -0.2], r: [-40, 0, 10], curl: 0.35, thumb: 0.3},
  relaxedLow: {p: [0.24, -0.46, -0.32], r: [-55, 0, 12], curl: 0.45, thumb: 0.3},
  // segurando celular diante dos olhos (tela para a câmera)
  phoneLook: {p: [0.065, -0.2, -0.37], r: [-14, -8, 4], curl: 0.22, thumb: 0.25},
  // celular no ouvido: mão sobe para fora do quadro à direita
  phoneEar: {p: [0.3, 0.02, -0.05], r: [10, -70, 20], curl: 0.5, thumb: 0.5},
  // alcançar/pegar à frente (palma para baixo)
  reach: {p: [0.1, -0.2, -0.5], r: [-90, 180, 0], curl: 0.15, thumb: 0.1},
  grab: {p: [0.1, -0.22, -0.46], r: [-90, 180, 0], curl: 0.85, thumb: 0.7},
  // empurrar porta/móvel (palma para frente)
  push: {p: [0.17, -0.12, -0.42], r: [-5, 180, 0], curl: 0.1, thumb: 0.15},
  // empurrar móvel baixo (cômoda): mãos apoiadas no tampo, braços estendidos para baixo/frente
  pushLow: {p: [0.19, -0.3, -0.5], r: [-40, 180, 0], curl: 0.15, thumb: 0.2},
  // segurar maçaneta/fechadura
  knob: {p: [0.12, -0.25, -0.45], r: [-80, 180, -80], curl: 0.75, thumb: 0.6},
  // lanterna/objeto empunhado
  fist: {p: [0.16, -0.22, -0.42], r: [-80, 180, -10], curl: 0.95, thumb: 0.8},
  // apoio na parede/olho mágico
  brace: {p: [0.2, 0.0, -0.4], r: [0, 180, 15], curl: 0.2, thumb: 0.2},
} satisfies Record<string, HandPose>;

export type HandPoseName = keyof typeof HP;
