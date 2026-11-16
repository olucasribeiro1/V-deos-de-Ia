// Elenco fixo da série "O Que a Mamãe Sabia". Todos com corpo branco e contorno preto (estilo urbano);
// cada um tem UM item de cor. Só o Eduardo (protagonista) usa vermelho. Não altere entre episódios.
import { PROTAGONISTA } from './protagonista.js';
export const EDUARDO = PROTAGONISTA;                                                        // boné vermelho
export const RAFAEL  = Object.freeze({ top: 'none', head: 'cap', headColor: '#2f6fd0' });   // irmão mais novo, boné azul
export const MARIANA = Object.freeze({ top: 'dress', color: '#7d8794', head: 'bun' });      // mãe: avental cinza, coque
export const OSVALDO = Object.freeze({ top: 'hoodie', color: '#5d6b3c', head: 'beanie', headColor: '#4c5a30' }); // tio: moletom e boina verde-oliva
export const RAFAEL_S = 0.9;   // Rafael é um pouco menor que o Eduardo
export const JOAQUIM = Object.freeze({ top: 'suit', color: '#6a5a48', color2: '#2f4f7a', head: 'none', face: 'glasses' });   // avô (só em flashback/fotos), terno simples
export const MARIANA_JALECO = Object.freeze({ top: 'labcoat', head: 'bun' });              // Mariana no laboratório (flashback)
export const MILITAR = Object.freeze({ top: 'suit', color: '#3a4526', color2: '#2a3420', head: 'none' });   // oficiais do comando (sem vermelho)
