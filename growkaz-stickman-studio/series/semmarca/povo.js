// Povo de Aldoria: roupas medievais para os figurantes (o protagonista nunca usa roupa).
export const POVO = [
  { top: 'tunica', color: '#8a5a3a', legs: '#5a4a3a', head: 'chapeu', headColor: '#6a3a2a', color2: '#e8e0c8' },
  { top: 'vestido', color: '#2f6ab0', color2: '#efe6d0', head: 'lenco', headColor: '#d8b04a' },
  { top: 'tunica', color: '#3f8a4a', legs: '#4a3a2a', head: 'none', manto: '#7a2a2a' },
  { top: 'vestido', color: '#b0283a', color2: '#f2ead8', head: 'bun' },
  { top: 'tunica', color: '#c8943a', legs: '#3a3a4a', head: 'hood', headColor: '#6a5a3a' },
  { top: 'vestido', color: '#6a3a8a', color2: '#e8dcc0', head: 'lenco', headColor: '#e86a3a' },
  { top: 'tunica', color: '#4a6a8a', legs: '#5a3a2a', head: 'chapeu', headColor: '#2f4a2a', color2: '#ff6a4a', manto: '#2a3a5a' },
  { top: 'tunica', color: '#a84a2a', legs: '#4a4a3a', head: 'curly' },
];
export const GUARDA = { top: 'tunica', color: '#8a9098', legs: '#4a4a52', head: 'elmo', headColor: '#a8b0b8', manto: '#2a4ad8' };
export const CRIANCA = (i = 0) => ({ ...POVO[(i + 3) % POVO.length], kid: true, manto: null, head: 'none' });
export const aldeao = (i) => POVO[((i % POVO.length) + POVO.length) % POVO.length];
