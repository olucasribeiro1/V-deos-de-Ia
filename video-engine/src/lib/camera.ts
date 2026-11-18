import {W, H} from './constants';

/**
 * Simple pinhole camera (no roll/yaw). World units are metres, y is up,
 * +z points away from the default camera (toward the sea on the calçadão set).
 */
export type Cam = {
  x: number;
  y: number;
  z: number;
  /** look-down angle in degrees (positive looks down) */
  pitch: number;
  /** focal length in px */
  f: number;
  /** optical centre in screen px (defaults to frame centre) */
  cx?: number;
  cy?: number;
};

export type Projected = {sx: number; sy: number; depth: number; ppm: number};

export const project = (cam: Cam, x: number, y: number, z: number): Projected | null => {
  const p = (cam.pitch * Math.PI) / 180;
  const dx = x - cam.x;
  const dy = y - cam.y;
  const dz = z - cam.z;
  const zc = -dy * Math.sin(p) + dz * Math.cos(p);
  const yc = dy * Math.cos(p) + dz * Math.sin(p);
  if (zc <= 0.05) return null;
  const cx = cam.cx ?? W / 2;
  const cy = cam.cy ?? H / 2;
  return {sx: cx + (cam.f * dx) / zc, sy: cy - (cam.f * yc) / zc, depth: zc, ppm: cam.f / zc};
};

/** Screen-space position of a direction (point at infinity), e.g. the sun. */
export const projectDir = (cam: Cam, dx: number, dy: number, dz: number) => {
  const p = (cam.pitch * Math.PI) / 180;
  const zc = -dy * Math.sin(p) + dz * Math.cos(p);
  const yc = dy * Math.cos(p) + dz * Math.sin(p);
  const cx = cam.cx ?? W / 2;
  const cy = cam.cy ?? H / 2;
  return {sx: cx + (cam.f * dx) / zc, sy: cy - (cam.f * yc) / zc};
};

export const horizonY = (cam: Cam) => projectDir(cam, 0, 0, 1).sy;

/** Projects a polyline on the ground plane (y = 0); drops points behind the camera. */
export const groundPath = (cam: Cam, pts: [number, number][], close = false) => {
  const out: string[] = [];
  for (const [x, z] of pts) {
    const p = project(cam, x, 0, z);
    if (!p) continue;
    out.push(`${out.length ? 'L' : 'M'}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
  }
  return out.join(' ') + (close && out.length ? ' Z' : '');
};

export const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
  pitch: a.pitch + (b.pitch - a.pitch) * t,
  f: a.f + (b.f - a.f) * t,
  cx: (a.cx ?? W / 2) + ((b.cx ?? W / 2) - (a.cx ?? W / 2)) * t,
  cy: (a.cy ?? H / 2) + ((b.cy ?? H / 2) - (a.cy ?? H / 2)) * t,
});
