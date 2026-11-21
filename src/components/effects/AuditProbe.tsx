import {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AUDITORIA DE FLUTUAÇÃO (dev): percorre a cena e lista objetos sem apoio.
 * Um objeto está "apoiado" se: está no chão (y≈0 ou rua), em cima de outro objeto (topo encostando
 * na base, com sobreposição em XZ), preso numa parede (encostado lateralmente) ou no teto.
 * Personagens: confere se o ponto mais baixo encosta no chão. Saída: console.log('AUDIT', ...).
 */
const EPS = 0.035;
export const AuditProbe: React.FC<{ground?: number[]}> = ({ground = [0, -8.4]}) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.updateMatrixWorld(true);
    const boxes: {b: THREE.Box3; tag: string}[] = [];
    const actors: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if (o.userData.actor) actors.push(o);
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.isHull || m.userData.merged || (m as any).isInstancedMesh) return;
      let p: THREE.Object3D | null = m;
      while (p) {
        if (p.userData.actor || p.userData.headRig || p.userData.skipAudit) return;
        p = p.parent;
      }
      const g = m.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const b = g.boundingBox!.clone().applyMatrix4(m.matrixWorld);
      const s = b.getSize(new THREE.Vector3());
      if (s.length() > 60 || s.length() < 0.01) return; // céu, rua, planos gigantes / minúsculos
      boxes.push({b, tag: `${(m.material as any)?.color?.getHexString?.() ?? '?'} ${s.x.toFixed(2)}x${s.y.toFixed(2)}x${s.z.toFixed(2)}`});
    });
    const overlapXZ = (a: THREE.Box3, c: THREE.Box3) => a.min.x < c.max.x - 0.005 && a.max.x > c.min.x + 0.005 && a.min.z < c.max.z - 0.005 && a.max.z > c.min.z + 0.005;
    const touchesSide = (a: THREE.Box3, c: THREE.Box3) =>
      a.min.y < c.max.y && a.max.y > c.min.y && a.min.x <= c.max.x + EPS && a.max.x >= c.min.x - EPS && a.min.z <= c.max.z + EPS && a.max.z >= c.min.z - EPS;
    const floating: string[] = [];
    for (const {b, tag} of boxes) {
      if (ground.some((g) => Math.abs(b.min.y - g) < EPS || b.min.y < g + EPS)) continue;
      if (b.max.y > 2.62) continue; // preso ao teto
      let ok = false;
      for (const o of boxes) {
        if (o.b === b) continue;
        if (overlapXZ(b, o.b) && b.min.y >= o.b.min.y - EPS && b.min.y <= o.b.max.y + EPS) {
          ok = true;
          break;
        }
        const vol = (x: THREE.Box3) => (x.max.x - x.min.x) * (x.max.y - x.min.y) * (x.max.z - x.min.z);
        if (touchesSide(b, o.b) && ((o.b.max.y - o.b.min.y) > 1.2 || vol(o.b) > vol(b) * 4)) {
          ok = true; // preso lateralmente a parede ou a objeto maior (puxador, painel, quadro)
          break;
        }
      }
      if (!ok) floating.push(`(${b.min.x.toFixed(2)},${b.min.y.toFixed(2)},${b.min.z.toFixed(2)}) ${tag}`);
    }
    // PEÇAS SOLTAS: em cada corpo (personagens e mãos POV), toda peça precisa encostar em outra peça
    const rigs: {name: string; root: THREE.Object3D}[] = [...actors.map((a) => ({name: String(a.userData.actor), root: a}))];
    scene.traverse((o) => {
      if (o.userData.headRig) rigs.push({name: 'mãos-POV', root: o});
    });
    const loose: string[] = [];
    for (const {name, root} of rigs) {
      const parts: THREE.Box3[] = [];
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || m.userData.isHull || !m.visible) return;
        const g = m.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        parts.push(g.boundingBox!.clone().applyMatrix4(m.matrixWorld).expandByScalar(0.004));
      });
      if (parts.length < 2) continue;
      // componentes conexos por interseção de caixas
      const seen = new Array(parts.length).fill(false);
      const comps: number[][] = [];
      for (let i = 0; i < parts.length; i++) {
        if (seen[i]) continue;
        const stack = [i];
        const comp: number[] = [];
        seen[i] = true;
        while (stack.length) {
          const k = stack.pop()!;
          comp.push(k);
          for (let j = 0; j < parts.length; j++) if (!seen[j] && parts[k].intersectsBox(parts[j])) {
            seen[j] = true;
            stack.push(j);
          }
        }
        comps.push(comp);
      }
      const allowed = name === 'mãos-POV' ? 2 : 1; // dois braços independentes na câmera POV
      if (comps.length > allowed) {
        comps.sort((a, b) => b.length - a.length);
        for (const c of comps.slice(allowed)) {
          const b = parts[c[0]];
          const s = b.getSize(new THREE.Vector3());
          loose.push(`${name}: ${c.length} peça(s) solta(s) em (${b.min.x.toFixed(2)},${b.min.y.toFixed(2)},${b.min.z.toFixed(2)}) ${s.x.toFixed(2)}x${s.y.toFixed(2)}x${s.z.toFixed(2)}`);
        }
      }
    }
    const feet = actors.map((a) => {
      const b = new THREE.Box3().setFromObject(a);
      const g = ground.reduce((p, c) => (Math.abs(c - b.min.y) < Math.abs(p - b.min.y) ? c : p));
      return `${a.userData.actor} pés=${(b.min.y - g).toFixed(3)}m`;
    });
    // saída via erro proposital: o Remotion sempre imprime erros de render por completo
    throw new Error('AUDIT ' + JSON.stringify({flutuando: floating, personagens: feet, soltas: loose}));
  });
  return null;
};
