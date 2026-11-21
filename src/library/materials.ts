import * as THREE from 'three';

/**
 * Biblioteca de materiais COMPARTILHADOS — estilo CARTOON TOON (cel shading em 3 faixas).
 * Um material por cor/uso (menos trocas de estado na GPU). O contorno preto é aplicado
 * automaticamente pelo componente <Outlines/> (casca invertida), não por pós-processamento.
 */
const cache = new Map<string, THREE.Material>();

let gradient: THREE.DataTexture | null = null;
/** Rampa de 3 tons: sombra, meio-tom, luz (NearestFilter = bordas nítidas de desenho animado). */
export function toonGradient() {
  if (!gradient) {
    const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
    gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
}

export type MatOpts = {rough?: number; metal?: number; flat?: boolean; emissive?: string; ei?: number; outline?: boolean};

export function mat(color: string, opts: MatOpts = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.ei ?? 0}|${opts.outline ?? true}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({
      color,
      gradientMap: toonGradient(),
      emissive: opts.emissive ? new THREE.Color(opts.emissive) : undefined,
      emissiveIntensity: opts.ei ?? 0,
    });
    m.userData.outline = opts.outline ?? true;
    cache.set(key, m);
  }
  return m;
}

export function basic(color: string, opacity = 1) {
  const key = `basic|${color}|${opacity}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, fog: true});
    m.userData.outline = false;
    cache.set(key, m);
  }
  return m;
}

/** Paleta do estúdio (série "hora a hora") — cores limpas, levemente saturadas, estilo cartoon. */
export const PAL = {
  // ambiente
  wallWarm: '#d9d2c4',
  wallCool: '#c3cbc8',
  wallBath: '#bcd0d2',
  floorWood: '#8a6446',
  floorWoodDark: '#6e4f38',
  tile: '#a9b2b0',
  tileDark: '#7c8583',
  ceiling: '#ece6da',
  trim: '#f1ece2',
  doorWood: '#8f6646',
  doorPaint: '#e6e0d2',
  metal: '#9aa2a8',
  metalDark: '#4a5056',
  fabricGreen: '#4f7a5f',
  fabricGray: '#6f767e',
  fabricBlue: '#2f6a9a',
  wood: '#a77a52',
  woodLight: '#c89b6a',
  black: '#24262a',
  white: '#f4f1ea',
  plant: '#4f9a54',
  // personagens
  skinFair: '#efbd9d',
  skinFairShadow: '#e3a98a',
  capRed: '#d42a22',
  jacketOlive: '#5c6b47',
  shirtGray: '#4a5058',
  jeans: '#3c5a86',
  boots: '#5a3e2a',
  hairBrown: '#4a3222',
  // perigo
  danger: '#c81e22',
  blood: '#8e1418',
  zombieSkin: '#a7b89a',
};
