import {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CONTORNO CARTOON automático por "casca invertida": para cada mesh com material marcado
 * (userData.outline !== false) cria um filho que reaproveita a MESMA geometria, renderizado só
 * pelas faces de trás, em preto, levemente maior. Sem pós-processamento (barato no render).
 * A espessura é constante em metros: `thickness` (cenário) ou userData.outlineWidth do mesh.
 */
const ink = new THREE.MeshBasicMaterial({color: '#141414', side: THREE.BackSide, fog: false});
const box = new THREE.Box3();
const size = new THREE.Vector3();
const center = new THREE.Vector3();

function addHull(mesh: THREE.Mesh, thickness: number) {
  const g = mesh.geometry;
  if (!g.boundingBox) g.computeBoundingBox();
  box.copy(g.boundingBox!);
  box.getSize(size);
  box.getCenter(center);
  // planos (espessura ~0) não recebem contorno
  if (Math.min(size.x, size.y, size.z) < 1e-4) return;
  const t = thickness;
  const hull = new THREE.Mesh(g, ink);
  hull.userData.isHull = true;
  hull.scale.set((size.x + 2 * t) / size.x, (size.y + 2 * t) / size.y, (size.z + 2 * t) / size.z);
  // compensa geometrias não centradas na origem
  hull.position.copy(center).multiply(new THREE.Vector3(1 - hull.scale.x, 1 - hull.scale.y, 1 - hull.scale.z));
  hull.castShadow = false;
  hull.receiveShadow = false;
  hull.raycast = () => null;
  mesh.add(hull);
  mesh.userData.hull = hull;
}

export const Outlines: React.FC<{thickness?: number}> = ({thickness = 0.012}) => {
  const scene = useThree((s) => s.scene);
  // roda a cada frame, mas só cria cascas para meshes novos (O(n) barato, sem alocação recorrente)
  useLayoutEffect(() => {
    // a espessura é herdada: um grupo com userData.outlineWidth (ex.: mãos POV, personagens) a redefine
    const visit = (o: THREE.Object3D, w: number) => {
      if (o.userData.batchSource) return; // fonte do StaticBatch (invisível): contorno já fundido
      const width = (o.userData.outlineWidth as number | undefined) ?? w;
      const m = o as THREE.Mesh;
      // geometria trocada (args mudaram): refaz a casca
      if (m.isMesh && m.userData.hull && m.userData.hull.geometry !== m.geometry) {
        m.remove(m.userData.hull);
        delete m.userData.hull;
      }
      if (m.isMesh && !m.userData.isHull && !m.userData.hull && !(m as any).isInstancedMesh && !m.userData.noOutline) {
        const material = m.material as THREE.Material;
        if (material && (material as any).isMeshToonMaterial && material.userData?.outline !== false && !material.transparent && width > 0) addHull(m, width);
      }
      for (const c of o.children) if (!c.userData.isHull) visit(c, width);
    };
    visit(scene, thickness);
  });
  return null;
};
