import type {CharacterSpec} from '../components/characters/Humanoid';
import {PAL} from './materials';

/**
 * BIBLIOTECA DE PERSONAGENS — série "hora a hora" (apocalipse zumbi).
 * PROTAGONIST é TRAVADO pela CHARACTER BIBLE: homem adulto, pele clara, BONÉ VERMELHO (#b3261e).
 * Não altere cap/skin/roupa sem autorização do usuário. `validateProtagonist` é checado no render.
 */
export const PROTAGONIST: CharacterSpec = Object.freeze({
  id: 'protagonista',
  height: 1.75,
  build: 1.02,
  skin: PAL.skinFair,
  hair: PAL.hairBrown,
  hairStyle: 'short',
  cap: PAL.capRed,
  top: PAL.jacketOlive,
  topStyle: 'jacket',
  topAccent: PAL.shirtGray,
  bottom: PAL.jeans,
  shoes: PAL.boots,
}) as CharacterSpec;

export function validateProtagonist(spec: CharacterSpec) {
  const errs: string[] = [];
  if (spec.cap !== PAL.capRed) errs.push('boné vermelho ausente ou com cor errada');
  if (spec.skin !== PAL.skinFair) errs.push('tom de pele diferente do aprovado');
  if (spec.top !== PAL.jacketOlive) errs.push('jaqueta diferente da aprovada');
  if (errs.length) throw new Error(`CHARACTER BIBLE violada: ${errs.join('; ')}`);
}

export const RAFAEL: CharacterSpec = {
  id: 'rafael',
  height: 1.8,
  build: 1.0,
  skin: '#e2b49a',
  hair: '#2a2018',
  hairStyle: 'short',
  top: '#5f8c8a',
  topStyle: 'scrubs',
  topAccent: '#e8e4da',
  bottom: '#5f8c8a',
  shoes: '#e8e4da',
  glasses: true,
};

/** Vizinho do 304 antes da transformação — mesmas roupas de INFECTED.porta (continuidade). */
export const NEIGHBOR_304: CharacterSpec = {id: 'vizinho_304', height: 1.77, build: 1.05, skin: '#e0b090', hair: '#2a2420', hairStyle: 'short', top: '#8a3a32', topStyle: 'shirt', bottom: '#2f3d52', shoes: '#3a2a1a', infected: undefined};

export const CIVILIANS: CharacterSpec[] = [
  {id: 'civil_a', height: 1.68, build: 0.95, skin: '#c99a7a', hair: '#1a1410', hairStyle: 'long', top: '#7a3b3b', topStyle: 'shirt', bottom: '#2f3540', shoes: '#ddd'},
  {id: 'civil_b', height: 1.78, build: 1.1, skin: '#8d5f45', hair: '#111', hairStyle: 'buzz', top: '#3a4a5a', topStyle: 'hoodie', bottom: '#4a4a44', shoes: '#222'},
  {id: 'civil_c', height: 1.72, build: 0.9, skin: '#e6c0a4', hair: '#8a6a3a', hairStyle: 'messy', top: '#c9b48a', topStyle: 'coat', bottom: '#3b3b3b', shoes: '#3a2a1a'},
];

/**
 * INFECTADOS — 7 tipos com silhuetas, posturas, velocidades e roupas distintas.
 * clip/speed são os padrões de comportamento de cada tipo.
 */
export type InfectedType = 'lento' | 'cambaleante' | 'agressivo' | 'corredor' | 'reage_som' | 'porta' | 'perseguidor';
export const INFECTED: Record<InfectedType, {spec: CharacterSpec; clip: 'shamble' | 'stagger' | 'lunge' | 'bangDoor' | 'idleTense'; speed: number}> = {
  lento: {
    spec: {id: 'inf_lento', height: 1.7, build: 1.15, skin: PAL.zombieSkin, hair: '#555', hairStyle: 'bald', top: '#5b5f63', topStyle: 'shirt', bottom: '#3d3a33', shoes: '#2a2a2a', infected: {decay: 0.6, blood: 0.4, eyes: '#c9c27a'}},
    clip: 'shamble',
    speed: 0.45,
  },
  cambaleante: {
    spec: {id: 'inf_camb', height: 1.76, build: 0.92, skin: '#a7ad97', hair: '#3a2a1e', hairStyle: 'messy', top: '#6e5a48', topStyle: 'coat', bottom: '#2f3540', shoes: '#222', infected: {decay: 0.5, blood: 0.6, eyes: '#d8d08a'}},
    clip: 'stagger',
    speed: 0.7,
  },
  agressivo: {
    spec: {id: 'inf_agr', height: 1.83, build: 1.18, skin: '#9aa58e', hair: '#111', hairStyle: 'buzz', top: '#2c2f33', topStyle: 'hoodie', bottom: '#2a2a2a', shoes: '#111', infected: {decay: 0.4, blood: 0.9, eyes: '#e05a3a'}},
    clip: 'lunge',
    speed: 3.2,
  },
  corredor: {
    spec: {id: 'inf_corr', height: 1.7, build: 0.88, skin: '#b0b39c', hair: '#6a4a2a', hairStyle: 'long', top: '#4a6a8a', topStyle: 'shirt', bottom: '#333', shoes: '#ddd', infected: {decay: 0.3, blood: 0.5, eyes: '#e0d07a'}},
    clip: 'lunge',
    speed: 4.2,
  },
  reage_som: {
    spec: {id: 'inf_som', height: 1.74, build: 1.0, skin: '#a2a892', hair: '#444', hairStyle: 'buzz', top: '#7a7a70', topStyle: 'jacket', topAccent: '#333', bottom: '#3a3f4a', shoes: '#2a2a2a', infected: {decay: 0.5, blood: 0.3, eyes: '#c8c48a'}},
    clip: 'idleTense',
    speed: 0,
  },
  porta: {
    // vizinho que pede ajuda e se transforma (ep01)
    spec: {id: 'inf_porta', height: 1.77, build: 1.05, skin: '#b9b0a0', hair: '#2a2420', hairStyle: 'buzz', top: '#8a3a32', topStyle: 'shirt', bottom: '#2f3d52', shoes: '#3a2a1a', infected: {decay: 0.25, blood: 0.8, eyes: '#d0c890'}},
    clip: 'bangDoor',
    speed: 0,
  },
  perseguidor: {
    spec: {id: 'inf_pers', height: 1.86, build: 1.1, skin: '#8f9a84', hair: '#222', hairStyle: 'bald', top: '#3d4b5c', topStyle: 'scrubs', topAccent: '#e8e4da', bottom: '#3d4b5c', shoes: '#ddd', infected: {decay: 0.7, blood: 1, eyes: '#e8603a'}},
    clip: 'lunge',
    speed: 2.6,
  },
};
