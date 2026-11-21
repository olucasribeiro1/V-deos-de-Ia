/**
 * Dados do cenário "apartamento" (sem React — usado pelo compilador de ações e pelos scripts Node).
 * SPOTS = onde o protagonista pode estar; NAV = arestas caminháveis (desviam dos móveis);
 * LOOKS = alvos de olhar [x,y,z].
 */
export const SPOTS = {
  entrance: {x: 2.75, z: -0.75},
  peephole: {x: 2.75, z: -0.32},
  hallMid: {x: 2.75, z: -3.0},
  hallEnd: {x: 2.75, z: -5.6},
  livingCenter: {x: -1.4, z: -5.8},
  sofa: {x: 0.0, z: -4.3},
  window: {x: -3.3, z: -7.58},
  hallWindow: {x: 2.7, z: -7.4},
  kitchen: {x: -4.9, z: -5.9},
  fridge: {x: -4.95, z: -3.7},
  bedroomDoor: {x: -1.95, z: -3.55},
  bedroom: {x: -1.1, z: -2.2},
  bathroomDoor: {x: -3.75, z: -3.5},
  bathroom: {x: -4.0, z: -1.7},
} as const;
export type SpotName = keyof typeof SPOTS;

export const NAV: [SpotName, SpotName][] = [
  ['entrance', 'hallMid'],
  ['entrance', 'peephole'],
  ['hallMid', 'hallEnd'],
  ['hallEnd', 'hallWindow'],
  ['hallEnd', 'livingCenter'],
  ['livingCenter', 'window'],
  ['livingCenter', 'kitchen'],
  ['livingCenter', 'sofa'],
  ['livingCenter', 'bedroomDoor'],
  ['kitchen', 'fridge'],
  ['kitchen', 'window'],
  ['bedroomDoor', 'bedroom'],
  ['bedroomDoor', 'bathroomDoor'],
  ['bathroomDoor', 'bathroom'],
  ['bathroomDoor', 'fridge'],
];

export const LOOKS = {
  door: [2.75, 1.45, 0],
  peepholeView: [2.75, 1.5, 3],
  doorLock: [2.95, 1.05, 0],
  window: [-3.4, 1.5, -8.5],
  city: [-6, -2, -45],
  street: [-3, -20.5, -24],
  smoke: [-22, 5, -60],
  sofa: [0.0, 0.5, -3.5],
  tv: [-0.4, 0.9, -7.7],
  kitchen: [-5.7, 1.0, -6.0],
  fridge: [-5.6, 1.2, -3.65],
  table: [-3.6, 0.8, -4.7],
  hallway: [2.75, 1.5, -8],
  livingRoom: [-1.5, 1.2, -5.5],
  bedroom: [-0.4, 0.8, -1.0],
  bathroom: [-4.5, 1.2, -1.0],
  floor: [0, 0, -4.5],
  bag: [0.75, 0.5, -3.65],
  ceiling: [0, 2.7, -5],
} as const;
export type LookName = keyof typeof LOOKS;

/** Caminho mais curto pelo grafo (Dijkstra simples — grafo minúsculo). */
export function navPath(from: SpotName, to: SpotName): SpotName[] {
  if (from === to) return [from];
  const dist = new Map<SpotName, number>([[from, 0]]);
  const prev = new Map<SpotName, SpotName>();
  const open = new Set<SpotName>(Object.keys(SPOTS) as SpotName[]);
  const d = (a: SpotName, b: SpotName) => Math.hypot(SPOTS[a].x - SPOTS[b].x, SPOTS[a].z - SPOTS[b].z);
  while (open.size) {
    let u: SpotName | null = null;
    for (const n of open) if (dist.has(n) && (u === null || dist.get(n)! < dist.get(u)!)) u = n;
    if (u === null) break;
    open.delete(u);
    if (u === to) break;
    for (const [a, b] of NAV) {
      const v = a === u ? b : b === u ? a : null;
      if (!v || !open.has(v)) continue;
      const nd = dist.get(u)! + d(u, v);
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd);
        prev.set(v, u);
      }
    }
  }
  if (!prev.has(to)) throw new Error(`Sem caminho de ${from} até ${to}`);
  const path: SpotName[] = [to];
  while (path[0] !== from) path.unshift(prev.get(path[0])!);
  return path;
}
