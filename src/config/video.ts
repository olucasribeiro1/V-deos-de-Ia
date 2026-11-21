// Padrões obrigatórios do estúdio. Não altere sem autorização do Diretor-Geral.
export const VIDEO = {
  width: 1280,
  height: 720,
  fps: 24,
} as const;

export const sec = (s: number) => Math.round(s * VIDEO.fps);
