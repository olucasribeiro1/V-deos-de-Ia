import {clamp, easeOut, fbm1, lerp} from './math';

/**
 * Biblioteca de animações corporais procedurais e determinísticas.
 * Cada clip recebe `t` (s) e `v` (variação individual 0..1) — a variação muda fase,
 * ritmo e amplitude para que personagens com o mesmo clip NUNCA se movam igual.
 * Rotações em graus [x,y,z]. Convenção: x+ inclina para frente (coxa sobe para frente com x negativo).
 */
export type V3 = [number, number, number];
export type Pose = {
  hipsY?: number;
  hips?: V3;
  spine?: V3;
  chest?: V3;
  neck?: V3;
  head?: V3;
  lArm?: V3;
  lFore?: V3;
  rArm?: V3;
  rFore?: V3;
  lLeg?: V3;
  lShin?: V3;
  rLeg?: V3;
  rShin?: V3;
};

export type ClipName =
  | 'idle'
  | 'idleTense'
  | 'walk'
  | 'run'
  | 'shamble'
  | 'stagger'
  | 'lunge'
  | 'attack'
  | 'bangDoor'
  | 'fall'
  | 'getUp'
  | 'hitReact'
  | 'talkPhone'
  | 'crouch'
  | 'lookAround';

const S = Math.sin;
const TAU = Math.PI * 2;

const gait = (t: number, rate: number, legAmp: number, kneeAmp: number, armAmp: number, lean: number, bounce: number): Pose => {
  const p = t * rate * TAU;
  const l = S(p);
  const r = S(p + Math.PI);
  return {
    hipsY: -Math.abs(S(p)) * bounce + bounce * 0.4,
    hips: [0, S(p) * 4, 0],
    spine: [lean, -S(p) * 5, 0],
    chest: [lean * 0.4, -S(p) * 4, 0],
    neck: [-lean * 0.6, 0, 0],
    head: [-lean * 0.3, S(p) * 2, 0],
    lLeg: [-l * legAmp, 0, 2],
    lShin: [Math.max(0, -S(p - 0.9)) * kneeAmp + 5, 0, 0],
    rLeg: [-r * legAmp, 0, -2],
    rShin: [Math.max(0, -S(p + Math.PI - 0.9)) * kneeAmp + 5, 0, 0],
    lArm: [l * armAmp * -1 * -1 - 2, 0, -6],
    lFore: [-15 - Math.max(0, l) * armAmp * 0.6, 0, 0],
    rArm: [r * armAmp - 2, 0, 6],
    rFore: [-15 - Math.max(0, r) * armAmp * 0.6, 0, 0],
  };
};

export function clip(name: ClipName, t: number, v = 0.5, k = 0): Pose {
  const ph = t + v * 7.3;
  switch (name) {
    case 'idle':
    case 'idleTense': {
      const tense = name === 'idleTense' ? 1 : 0;
      const br = S(ph * TAU * (0.25 + tense * 0.2));
      return {
        hipsY: br * 0.004,
        spine: [2 + br * 1.2 + tense * 4, fbm1(ph * 0.3, 1) * 3, 0],
        chest: [br * 1.5, 0, 0],
        head: [fbm1(ph * 0.25, 2) * 5, fbm1(ph * 0.2, 3) * (12 + tense * 18), 0],
        lArm: [2, 0, -7 - br],
        lFore: [-12, 0, 0],
        rArm: [2, 0, 7 + br],
        rFore: [-12, 0, 0],
        lLeg: [0, 0, 3],
        rLeg: [0, 0, -3],
        lShin: [2, 0, 0],
        rShin: [2, 0, 0],
      };
    }
    case 'walk':
      return gait(ph, 0.92 + v * 0.12, 24, 40, 18, 3, 0.03);
    case 'run': {
      const p = gait(ph, 1.45 + v * 0.15, 42, 85, 45, 14, 0.07);
      p.lFore = [-80, 0, 0];
      p.rFore = [-80, 0, 0];
      return p;
    }
    case 'shamble': {
      // infectado lento: passo arrastado, assimétrico, braços pendentes à frente
      const rate = 0.5 + v * 0.18;
      const p = gait(ph, rate, 16 + v * 6, 22, 6, 14 + v * 10, 0.02);
      const lurch = fbm1(ph * 0.9, 4);
      p.spine = [16 + v * 8 + lurch * 6, lurch * 10, 6 + lurch * 8];
      p.head = [10 + fbm1(ph * 1.3, 8) * 12, fbm1(ph * 0.7, 9) * 25, 14 * (v - 0.5) * 2 + fbm1(ph * 2.1, 3) * 6];
      p.lArm = [-35 - v * 25 + S(ph * 3) * 6, 0, -10];
      p.rArm = [-20 - v * 40 + S(ph * 2.7) * 8, 0, 12];
      p.lFore = [-25, 0, 0];
      p.rFore = [-10 - v * 30, 0, 0];
      p.rLeg = [(p.rLeg?.[0] ?? 0) * 0.6, 10, -4]; // perna arrastada
      return p;
    }
    case 'stagger': {
      const p = gait(ph, 0.75 + v * 0.2, 20, 30, 14, 10, 0.04);
      const sway = fbm1(ph * 1.7, 11);
      p.hips = [0, sway * 12, sway * 10];
      p.spine = [12 + sway * 10, sway * 15, sway * 14];
      p.head = [sway * 20, fbm1(ph * 3, 1) * 30, sway * 25];
      p.lArm = [-10 + sway * 30, 0, -25];
      p.rArm = [-30 - sway * 20, 0, 20];
      return p;
    }
    case 'lunge': {
      // corredor/agressivo: corrida inclinada, braços estendidos
      const p = gait(ph, 1.6 + v * 0.2, 45, 90, 20, 26, 0.08);
      p.lArm = [-75 + S(ph * 9) * 10, 0, -12];
      p.rArm = [-85 + S(ph * 8) * 10, 0, 12];
      p.lFore = [-10, 0, 0];
      p.rFore = [-15, 0, 0];
      p.head = [-10, fbm1(ph * 4, 2) * 10, 0];
      return p;
    }
    case 'attack': {
      const c = (ph * (1.1 + v * 0.4)) % 1;
      const swing = c < 0.35 ? easeOut(c / 0.35) : 1 - (c - 0.35) / 0.65;
      return {
        hipsY: -0.04,
        spine: [20 + swing * 18, (v - 0.5) * 30, 0],
        chest: [swing * 10, 0, 0],
        head: [-10 + swing * 15, 0, 0],
        rArm: [lerp(-150, -60, swing), 0, 15],
        rFore: [lerp(-40, -5, swing), 0, 0],
        lArm: [lerp(-60, -120, swing), 0, -15],
        lFore: [-30, 0, 0],
        lLeg: [-20, 0, 4],
        lShin: [25, 0, 0],
        rLeg: [15, 0, -4],
        rShin: [10, 0, 0],
      };
    }
    case 'bangDoor': {
      // golpes irregulares contra a porta (k = intensidade)
      const rate = 1.3 + v * 0.8;
      const c = (ph * rate) % 1;
      const hitL = c < 0.2 ? easeOut(c / 0.2) : clamp(1 - (c - 0.2) / 0.3);
      const c2 = (ph * rate + 0.45 + v * 0.1) % 1;
      const hitR = c2 < 0.2 ? easeOut(c2 / 0.2) : clamp(1 - (c2 - 0.2) / 0.3);
      return {
        hipsY: -0.03,
        spine: [18 + (hitL + hitR) * 6, (hitL - hitR) * 10, 0],
        chest: [6, 0, 0],
        head: [lerp(-5, 12, Math.max(hitL, hitR)) + fbm1(ph * 2, 4) * 8, fbm1(ph, 6) * 15, 0],
        lArm: [lerp(-150, -95, hitL), 0, -12],
        lFore: [lerp(-60, -10, hitL), 0, 0],
        rArm: [lerp(-155, -90, hitR), 0, 12],
        rFore: [lerp(-55, -10, hitR), 0, 0],
        lLeg: [-12, 0, 5],
        lShin: [15, 0, 0],
        rLeg: [10, 0, -5],
        rShin: [8, 0, 0],
      };
    }
    case 'fall': {
      // k = progresso 0..1 da queda
      const f = easeOut(clamp(k));
      return {
        hipsY: -0.8 * f,
        hips: [lerp(0, -80, f), 0, 0],
        spine: [lerp(10, -5, f), 0, 0],
        head: [lerp(0, 20, f), 0, 0],
        lArm: [lerp(-40, -170, f), 0, -30],
        rArm: [lerp(-60, -160, f), 0, 30],
        lLeg: [lerp(-20, 70, f), 0, 10],
        rLeg: [lerp(10, 80, f), 0, -10],
        lShin: [lerp(30, 10, f), 0, 0],
        rShin: [lerp(20, 5, f), 0, 0],
      };
    }
    case 'getUp': {
      const f = easeOut(clamp(k));
      return {
        hipsY: lerp(-0.8, 0, f),
        hips: [lerp(-60, 0, f), 0, 0],
        spine: [lerp(60, 15, f), 0, lerp(10, 0, f)],
        head: [lerp(-30, 5, f), fbm1(t * 2, 3) * 20, 0],
        lArm: [lerp(-20, -40, f), 0, -20],
        rArm: [lerp(-70, -30, f), 0, 25],
        lLeg: [lerp(-90, -10, f), 0, 5],
        lShin: [lerp(120, 15, f), 0, 0],
        rLeg: [lerp(-40, 5, f), 0, -5],
        rShin: [lerp(90, 10, f), 0, 0],
      };
    }
    case 'hitReact': {
      const f = clamp(k);
      const kick = S(f * Math.PI) * (1 - f * 0.5);
      return {
        hipsY: -0.05 * kick,
        spine: [-18 * kick, 10 * kick, 8 * kick],
        head: [-30 * kick, 15 * kick, 0],
        lArm: [-30 * kick, 0, -40 * kick],
        rArm: [-20 * kick, 0, 35 * kick],
        lFore: [-30, 0, 0],
        rFore: [-30, 0, 0],
      };
    }
    case 'talkPhone': {
      const base = clip('idle', t, v);
      return {...base, rArm: [-35, 0, 35], rFore: [-135, 0, 0], head: [5 + fbm1(ph * 0.4, 7) * 5, -10 + fbm1(ph * 0.3, 2) * 15, 8]};
    }
    case 'crouch':
      return {
        hipsY: -0.38,
        spine: [30, 0, 0],
        head: [-25, fbm1(ph * 0.3, 2) * 20, 0],
        lLeg: [-75, 0, 8],
        rLeg: [-60, 0, -8],
        lShin: [120, 0, 0],
        rShin: [110, 0, 0],
        lArm: [-30, 0, -10],
        rArm: [-40, 0, 10],
        lFore: [-50, 0, 0],
        rFore: [-50, 0, 0],
      };
    case 'lookAround': {
      const base = clip('idleTense', t, v);
      return {...base, head: [fbm1(ph * 0.5, 5) * 8, S(ph * 0.9) * 55, 0], chest: [0, S(ph * 0.9) * 15, 0]};
    }
  }
}

/** Mistura duas poses (transições suaves entre clips). */
export function blendPose(a: Pose, b: Pose, w: number): Pose {
  const out: any = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const va = (a as any)[key] ?? (key === 'hipsY' ? 0 : [0, 0, 0]);
    const vb = (b as any)[key] ?? (key === 'hipsY' ? 0 : [0, 0, 0]);
    out[key] = typeof va === 'number' ? lerp(va, vb, w) : (va as V3).map((x, i) => lerp(x, (vb as V3)[i], w));
  }
  return out;
}
