import {clamp, deg, fbm1, lerp, noise1} from '../animation/math';
import {type Key, sample} from '../timeline/keys';

/**
 * Sistema de câmera POV reutilizável.
 * O caminho é descrito por keyframes (posição no chão + direção do olhar);
 * caminhada, balanço, respiração, tremor e passos são DERIVADOS do movimento,
 * então som de passos e balanço da cabeça ficam sempre sincronizados.
 */
export type PovKey = {
  x: number;
  z: number;
  yaw: number; // graus, 0 = olhando para -Z
  pitch: number; // graus, + = para cima
  h?: number; // altura dos olhos (m). Protagonista 1,75 m → olhos ~1,64
  tension?: number; // 0 calmo … 1 pânico (tremor, respiração)
  fov?: number; // graus (vertical). Padrão 62; olho mágico ~95
};

export type Shake = {t: number; dur: number; amp: number; freq?: number};

export type PovTrack = {
  frames: number;
  pos: Float32Array; // x,y,z por frame
  rot: Float32Array; // pitch, yaw, roll por frame (rad, ordem YXZ)
  speed: Float32Array;
  fov: Float32Array;
  steps: {frame: number; side: 0 | 1; intensity: number}[];
};

export const EYE_HEIGHT = 1.64;
const STRIDE = 0.72; // metros por passo

export function buildPovTrack(keys: Key<PovKey>[] | ((t: number) => PovKey), fps: number, frames: number, shakes: Shake[] = []): PovTrack {
  const at = typeof keys === 'function' ? keys : (t: number) => sample(keys, t);
  const pos = new Float32Array(frames * 3);
  const rot = new Float32Array(frames * 3);
  const speed = new Float32Array(frames);
  const fov = new Float32Array(frames);
  const steps: PovTrack['steps'] = [];
  let phase = 0;
  let prev = at(0);
  let smoothSpeed = 0;
  for (let f = 0; f < frames; f++) {
    const t = f / fps;
    const k = at(t);
    fov[f] = k.fov ?? 62;
    const d = Math.hypot(k.x - prev.x, k.z - prev.z);
    const v = d * fps;
    smoothSpeed = lerp(smoothSpeed, v, 0.25);
    speed[f] = smoothSpeed;
    const before = Math.floor(phase);
    phase += d / STRIDE;
    if (Math.floor(phase) > before && smoothSpeed > 0.25) {
      steps.push({frame: f, side: (Math.floor(phase) % 2) as 0 | 1, intensity: clamp(smoothSpeed / 3.5, 0.25, 1)});
    }
    prev = k;

    const tension = k.tension ?? 0;
    const walkAmt = clamp(smoothSpeed / 1.4);
    const runAmt = clamp((smoothSpeed - 1.8) / 1.8);
    const bobAmp = walkAmt * 0.022 + runAmt * 0.04;
    const ph = phase * Math.PI;
    const bob = -Math.abs(Math.sin(ph)) * bobAmp + bobAmp * 0.5;
    const sway = Math.sin(ph) * (walkAmt * 0.012 + runAmt * 0.025);
    // respiração: mais rápida e funda com tensão / após correr
    const breathRate = lerp(0.23, 0.55, Math.max(tension, runAmt));
    const breath = Math.sin(t * Math.PI * 2 * breathRate) * lerp(0.004, 0.011, Math.max(tension, runAmt));
    // "mão na câmera": micro movimento orgânico
    const jitter = lerp(0.25, 0.9, tension);
    let shakeP = 0;
    let shakeY = 0;
    for (const s of shakes) {
      if (t >= s.t && t <= s.t + s.dur) {
        const e = 1 - (t - s.t) / s.dur;
        const fr = s.freq ?? 18;
        shakeP += noise1(t * fr, 3) * s.amp * e * e;
        shakeY += noise1(t * fr, 9) * s.amp * e * e;
      }
    }
    const cy = Math.cos(deg(k.yaw));
    const sy = Math.sin(deg(k.yaw));
    // deslocamento lateral do balanço perpendicular à direção do olhar
    pos[f * 3] = k.x + cy * sway;
    pos[f * 3 + 1] = (k.h ?? EYE_HEIGHT) + bob + breath;
    pos[f * 3 + 2] = k.z - sy * sway;
    // DERIVA DE ATENÇÃO (anti-robô): parado, a cabeça "passeia" alguns graus de forma orgânica;
    // com tensão, a deriva fica mais rápida e nervosa. Andando, diminui (o olhar segue o caminho).
    const idle = 1 - walkAmt;
    const driftAmp = idle * (2.2 + tension * 2.5);
    const driftYaw = fbm1(t * (0.16 + tension * 0.25), 21) * driftAmp * 1.6;
    const driftPitch = fbm1(t * (0.13 + tension * 0.2), 23) * driftAmp * 0.7;
    // troca de apoio entre as pernas (parado): leve balanço lateral lento
    const weight = idle * Math.sin(t * 0.37 + fbm1(t * 0.05, 31)) * 0.012;
    pos[f * 3] += cy * weight;
    pos[f * 3 + 2] -= sy * weight;
    rot[f * 3] = deg(k.pitch + driftPitch + fbm1(t * 0.5, 1) * jitter + Math.sin(ph * 2) * bobAmp * 12 + shakeP);
    rot[f * 3 + 1] = deg(k.yaw + driftYaw + fbm1(t * 0.4, 2) * jitter * 1.2 + shakeY);
    rot[f * 3 + 2] = deg(Math.sin(ph) * (walkAmt * 0.6 + runAmt * 1.4) + fbm1(t * 0.3, 5) * 0.3);
  }
  return {frames, pos, rot, speed, fov, steps};
}
