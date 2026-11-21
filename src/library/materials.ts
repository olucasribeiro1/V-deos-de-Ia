import * as THREE from 'three';

/**
 * Biblioteca de materiais COMPARTILHADOS (1 instância por cor/uso → menos trocas de estado na GPU).
 * Estética Cinematic Stylized Low Poly: flatShading, roughness alta, cores dessaturadas.
 * Paleta oficial em docs/visual-bible.md.
 */
const cache = new Map<string, THREE.Material>();

export function mat(color: string, opts: {rough?: number; metal?: number; flat?: boolean; emissive?: string; ei?: number} = {}) {
  const key = `${color}|${opts.rough ?? 0.85}|${opts.metal ?? 0}|${opts.flat ?? true}|${opts.emissive ?? ''}|${opts.ei ?? 0}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.85,
      metalness: opts.metal ?? 0,
      flatShading: opts.flat ?? true,
      emissive: opts.emissive ? new THREE.Color(opts.emissive) : undefined,
      emissiveIntensity: opts.ei ?? 0,
    });
    cache.set(key, m);
  }
  return m;
}

export function basic(color: string, opacity = 1) {
  const key = `basic|${color}|${opacity}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, fog: true});
    cache.set(key, m);
  }
  return m;
}

/** Paleta do estúdio (série "hora a hora"). */
export const PAL = {
  // ambiente
  wallWarm: '#b9ad9a',
  wallCool: '#8f958f',
  wallBath: '#a9b3b1',
  floorWood: '#6b4f3a',
  floorWoodDark: '#553e2e',
  tile: '#8a8f8c',
  tileDark: '#5d625f',
  ceiling: '#d2cbbd',
  trim: '#e2dccf',
  doorWood: '#7a5a40',
  doorPaint: '#c9c2b4',
  metal: '#7d8286',
  metalDark: '#3c4044',
  fabricGreen: '#4f5b47',
  fabricGray: '#5b5f63',
  fabricBlue: '#3d4b5c',
  wood: '#8a6a4c',
  woodLight: '#a8875f',
  black: '#1c1d1f',
  white: '#e8e4da',
  plant: '#4c6b3c',
  // personagens
  skinFair: '#e9bfa6',
  skinFairShadow: '#d9a68b',
  capRed: '#b3261e',
  jacketOlive: '#4b5340',
  shirtGray: '#3b3f44',
  jeans: '#2f3d52',
  boots: '#4a3626',
  hairBrown: '#3a2a1e',
  // perigo
  danger: '#a3161a',
  blood: '#5e0f12',
  zombieSkin: '#9aa58e',
};
