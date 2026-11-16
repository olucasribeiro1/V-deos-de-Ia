// ============================================================================================
//  PROTAGONISTA DO CANAL — FIXO. NÃO ALTERE.
//  Boneco branco com contorno preto, cabeça redonda grande, olhos pretos, BONÉ VERMELHO.
//  Sem roupa, sem outras cores, sem acessórios. É o mesmo em TODOS os vídeos.
//  Referências visuais: personagem/referencias/*.jpg
//  Uso em qualquer projeto:  import { PROTAGONISTA, FIGURANTE } from '/personagem/protagonista.js';
//  Sempre desenhe com o estilo "urbano" (config.json -> "style": "urbano").
// ============================================================================================
export const PROTAGONISTA = Object.freeze({ top: 'none', head: 'cap', headColor: '#d8342b' });

// Figurantes / outras pessoas: mesmo corpo branco com contorno, SEM boné (nunca vermelho).
export const FIGURANTE = Object.freeze({ top: 'none', head: 'none' });

