// toon.js — helpers de estilo "cartoon" (cel shading) para three.js
import * as THREE from 'three';

// Textura em degraus: cria o sombreado "chapado" típico de desenho
export function toonGradient(steps = 3, min = 0) {
  const data = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) {
    const v = Math.round((min + (1 - min) * (i / (steps - 1))) * 255);
    data.set([v, v, v, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// Material cartoon pronto
export function toonMaterial(color = '#ff7a59', steps = 3) {
  return new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(steps) });
}

// Contorno preto (técnica do casco invertido)
export function toonOutline(geometry, thickness = 0.04, color = '#111') {
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.scale.setScalar(1 + thickness);
  return mesh;
}
