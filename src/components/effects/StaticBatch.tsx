import React, {useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * STATIC BATCHING — otimização central do estúdio.
 * Funde tudo o que está dentro (paredes, piso, móveis) em 1 mesh por material + 1 mesh de contorno,
 * uma única vez na montagem. Visual idêntico, draw calls caem de centenas para ~20.
 * Use SOMENTE para o que nunca se move. Objetos animados ficam fora.
 */
const ink = new THREE.MeshBasicMaterial({color: '#141414', side: THREE.BackSide, fog: false});
const tmpBox = new THREE.Box3();
const size = new THREE.Vector3();
const center = new THREE.Vector3();

function hullMatrix(geo: THREE.BufferGeometry, t: number) {
  if (!geo.boundingBox) geo.computeBoundingBox();
  tmpBox.copy(geo.boundingBox!);
  tmpBox.getSize(size);
  tmpBox.getCenter(center);
  if (Math.min(size.x, size.y, size.z) < 1e-4) return null;
  const s = new THREE.Vector3((size.x + 2 * t) / size.x, (size.y + 2 * t) / size.y, (size.z + 2 * t) / size.z);
  const m = new THREE.Matrix4().makeTranslation(center.x, center.y, center.z);
  m.multiply(new THREE.Matrix4().makeScale(s.x, s.y, s.z));
  m.multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
  return m;
}

function prep(g: THREE.BufferGeometry, m: THREE.Matrix4) {
  let c = g.index ? g.toNonIndexed() : g.clone();
  for (const k of Object.keys(c.attributes)) if (!['position', 'normal', 'uv'].includes(k)) c.deleteAttribute(k);
  if (!c.attributes.uv) c.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((c.attributes.position.count) * 2), 2));
  c.applyMatrix4(m);
  return c;
}

export const StaticBatch: React.FC<{children: React.ReactNode; outline?: number}> = ({children, outline = 0.012}) => {
  const src = useRef<THREE.Group>(null);
  const out = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const root = src.current!;
    const dst = out.current!;
    root.updateWorldMatrix(true, true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const groups = new Map<THREE.Material, {geos: THREE.BufferGeometry[]; cast: boolean; receive: boolean}>();
    const hulls: THREE.BufferGeometry[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.isHull) return;
      const material = m.material as THREE.Material;
      const local = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
      const g = prep(m.geometry, local);
      let e = groups.get(material);
      if (!e) groups.set(material, (e = {geos: [], cast: false, receive: false}));
      e.geos.push(g);
      e.cast ||= m.castShadow;
      e.receive ||= m.receiveShadow;
      if ((material as any).isMeshToonMaterial && material.userData?.outline !== false && !material.transparent) {
        const hm = hullMatrix(m.geometry, outline);
        if (hm) hulls.push(prep(m.geometry, local.clone().multiply(hm)));
      }
    });
    for (const [material, e] of groups) {
      const merged = mergeGeometries(e.geos, false);
      if (!merged) continue;
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = e.cast;
      mesh.receiveShadow = e.receive;
      mesh.userData.noOutline = true; // contorno já está fundido em `hulls`
      dst.add(mesh);
    }
    if (hulls.length) {
      const hg = mergeGeometries(hulls, false);
      if (hg) {
        const hm = new THREE.Mesh(hg, ink);
        hm.userData.isHull = true;
        hm.userData.noOutline = true;
        dst.add(hm);
      }
    }
    root.visible = false;
    // libera a árvore original da GPU (fica só como fonte)
    return () => {
      dst.children.slice().forEach((c) => {
        (c as THREE.Mesh).geometry.dispose();
        dst.remove(c);
      });
    };
  }, []);
  return (
    <>
      <group ref={src} userData={{batchSource: true}}>
        {children}
      </group>
      <group ref={out} />
    </>
  );
};
