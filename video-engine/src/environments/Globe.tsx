import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../lib/constants';
import {HUD_FONT} from '../lib/fonts';
import {useUid} from '../lib/useUid';

/**
 * Stylised rotating Earth (orthographic projection, flat-shaded continents).
 *
 * View: `rotation` = longitude at the centre of the disc (deg, east positive),
 * `tilt` = latitude at the centre (deg, north positive; 90 = looking down on the North Pole).
 * The planet spins eastward, so to animate a real rotation DEcrease `rotation` over time.
 *
 * Everything is parametric so other shots can reuse it (pins, latitude/meridian highlights,
 * eastward velocity arrows). Use `globeProject` to attach HUD labels to a lat/lon.
 */

export type GlobeView = {cx: number; cy: number; r: number; rotation: number; tilt: number};

export type GlobePin = {
  lat: number;
  lon: number;
  label?: string;
  color?: string;
  /** 0..1 drop-in animation (default 1) */
  drop?: number;
  /** 0..1 ripple phase (0 = none) */
  pulse?: number;
  /** label side, default right */
  labelSide?: 'left' | 'right';
  scale?: number;
};

export type GlobeArrow = {
  lat: number;
  lon: number;
  /** arc length in degrees of longitude; + points east, - west */
  length: number;
  /** 0..1 draw-on */
  progress?: number;
  color?: string;
  width?: number;
  /** height above surface as a fraction of the radius (default 0.035) */
  lift?: number;
  opacity?: number;
};

export type GlobeLine = {k: number; color?: string; width?: number};

export type GlobeProps = {
  /** centre in screen px (default frame centre) */
  cx?: number;
  cy?: number;
  /** radius in px at zoom 1 (default 380) */
  radius?: number;
  zoom?: number;
  rotation: number;
  tilt?: number;
  pins?: GlobePin[];
  arrows?: GlobeArrow[];
  /** 0..1 draw-on + glow of the equator */
  highlightEquator?: number;
  /** a meridian to light up (deg) */
  highlightMeridianLon?: number;
  /** 0..1 draw-on of the highlighted meridian */
  highlightMeridian?: number;
  /** extra latitude circles to light up */
  highlightLats?: ({lat: number} & GlobeLine)[];
  /** 0..1 opacity of the lat/lon graticule (default 0.35) */
  grid?: number;
  /** seconds, animates clouds/atmosphere shimmer */
  t?: number;
  /** 0..1 dark night-side shading on the lower right (default 0.55) */
  night?: number;
  clouds?: boolean;
};

type V3 = [number, number, number];
const D = Math.PI / 180;

/** Unit-sphere position in view space (x right, y up, z toward viewer). */
const toView = (lat: number, lon: number, rotation: number, tilt: number, rad = 1): V3 => {
  const la = lat * D;
  const lo = (lon - rotation) * D;
  const x = Math.cos(la) * Math.sin(lo);
  const y = Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);
  const t = tilt * D;
  return [x * rad, (y * Math.cos(t) - z * Math.sin(t)) * rad, (y * Math.sin(t) + z * Math.cos(t)) * rad];
};

export const globeView = (p: Pick<GlobeProps, 'cx' | 'cy' | 'radius' | 'zoom' | 'rotation' | 'tilt'>): GlobeView => ({
  cx: p.cx ?? W / 2,
  cy: p.cy ?? H / 2,
  r: (p.radius ?? 380) * (p.zoom ?? 1),
  rotation: p.rotation,
  tilt: p.tilt ?? 0,
});

/** Screen position of lat/lon (+ `lift` fraction above the surface). `visible` is the view-space z (> 0 = front). */
export const globeProject = (view: GlobeView, lat: number, lon: number, lift = 0) => {
  const [x, y, z] = toView(lat, lon, view.rotation, view.tilt, 1 + lift);
  return {x: view.cx + x * view.r, y: view.cy - y * view.r, z, visible: z > 0};
};

/** Rotation speed of the ground at a latitude (km/h). */
export const groundSpeed = (lat: number) => 1674 * Math.cos(lat * D);

// ---------------------------------------------------------------------------
// Coarse continent outlines [lon, lat]
// ---------------------------------------------------------------------------
type Poly = {pts: [number, number][]; tone?: 'land' | 'ice' | 'dry'};
const LAND: Poly[] = [
  // South America
  {pts: [[-77, 8], [-72, 12], [-63, 10.5], [-60, 8], [-52, 5], [-50, 0], [-44, -2.5], [-35, -5], [-35, -9], [-39, -13], [-39, -18], [-41, -22], [-44, -23], [-48, -26], [-49, -29], [-53, -33], [-57, -35], [-57, -38], [-62, -39], [-65, -42], [-65, -46], [-68, -50], [-69, -52], [-72, -54], [-75, -50], [-74, -44], [-73, -38], [-71, -30], [-70, -20], [-76, -14], [-80, -6], [-81, -3], [-80, 0], [-78, 2], [-79, 7]]},
  // North + Central America
  {pts: [[-168, 66], [-162, 70], [-156, 71], [-140, 70], [-128, 70], [-115, 68], [-100, 68], [-95, 72], [-85, 70], [-82, 66], [-90, 63], [-94, 59], [-92, 57], [-85, 55], [-80, 52], [-79, 57], [-76, 62], [-70, 61], [-64, 60], [-61, 56], [-56, 52], [-60, 47], [-66, 45], [-70, 42], [-74, 40], [-76, 37], [-76, 35], [-81, 31], [-80, 26], [-81, 25], [-83, 29], [-85, 30], [-89, 30], [-94, 29], [-97, 27], [-97, 22], [-94, 18], [-91, 19], [-90, 21], [-87, 21], [-88, 16], [-84, 15], [-83, 11], [-80, 9], [-77, 8], [-79, 7], [-83, 8], [-86, 11], [-88, 13], [-92, 15], [-96, 16], [-102, 18], [-105, 20], [-106, 23], [-109, 23], [-114, 30], [-117, 32], [-120, 34], [-124, 40], [-124, 46], [-125, 49], [-130, 54], [-134, 58], [-140, 60], [-147, 61], [-152, 59], [-158, 57], [-163, 55], [-158, 58], [-162, 60], [-165, 62]]},
  // Greenland
  {tone: 'ice', pts: [[-73, 78], [-60, 82], [-35, 83], [-20, 81], [-18, 76], [-22, 70], [-32, 68], [-40, 65], [-44, 60], [-50, 62], [-53, 67], [-55, 71], [-60, 76]]},
  // Eurasia
  {pts: [[-9, 37], [-9, 43], [-2, 43.5], [-1, 46], [-5, 48], [-2, 49], [2, 51], [5, 53], [8, 54], [9, 57], [11, 56], [12, 54], [14, 54], [19, 54.5], [21, 57], [24, 59], [30, 60], [23, 60.5], [21, 61], [22, 65], [25, 66], [21, 64], [18, 62], [17, 57], [13, 56], [11, 59], [6, 58], [5, 62], [10, 64], [15, 68], [20, 70], [26, 71], [33, 70], [41, 67], [44, 68], [53, 68], [60, 69], [68, 70], [73, 72], [80, 73], [87, 75], [98, 76], [105, 78], [112, 76], [120, 73], [130, 71], [140, 72], [150, 71], [160, 70], [170, 70], [179.5, 68], [179.5, 65], [178, 64], [172, 61], [163, 60], [163, 57], [156, 51], [156, 57], [160, 61], [155, 59], [143, 59], [137, 54], [141, 53], [140, 48], [135, 43], [130, 42], [129, 36], [126, 35], [126, 38], [125, 40], [121, 40], [118, 39], [121, 37], [119, 35], [121, 32], [122, 30], [120, 26], [117, 23], [113, 22], [109, 21], [108, 18], [106, 20], [106, 17], [109, 12], [109, 11], [105, 9], [103, 10], [100, 13], [100, 8], [103, 4], [104, 1], [101, 3], [98, 8], [98, 16], [94, 17], [92, 22], [90, 22], [87, 21], [86, 20], [80, 15], [80, 10], [77, 8], [73, 16], [72, 21], [68, 23], [66, 25], [62, 25], [57, 26], [56, 27], [52, 28], [50, 30], [48, 30], [50, 26], [51, 24], [56, 25], [56, 22], [59, 22], [55, 17], [52, 16], [45, 13], [43, 13], [39, 21], [35, 28], [34, 28], [32, 31], [35, 33], [36, 36], [30, 36.5], [27, 37], [26, 40], [29, 41], [28, 42], [28, 44], [30, 46], [33, 46], [37, 47], [41, 42], [36, 42], [30, 41], [26, 40.5], [23, 40], [24, 38], [22, 37], [21, 39], [19, 42], [14, 45], [12, 45], [13, 44], [16, 41], [16, 38], [15.6, 38], [12, 42], [10, 44], [7, 43.5], [3, 43], [3, 42], [0, 39], [-1, 37.5], [-5, 36]]},
  // Africa
  {pts: [[-17, 21], [-16, 25], [-13, 28], [-10, 30], [-9, 33], [-6, 36], [0, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [34, 28], [35, 24], [38, 18], [43, 12], [51, 12], [51, 10], [47, 5], [41, -2], [39, -6], [40, -10], [40, -15], [35, -22], [33, -26], [32, -29], [28, -33], [20, -35], [18, -34], [18, -30], [15, -27], [12, -18], [13, -13], [12, -5], [9, -1], [9, 4], [6, 4], [3, 6], [-4, 5], [-8, 4], [-12, 7], [-15, 11], [-17, 15]]},
  // Sahara / Arabia dry tint
  {tone: 'dry', pts: [[-14, 27], [-8, 31], [5, 32], [20, 30], [31, 28], [35, 22], [33, 17], [20, 16], [5, 17], [-10, 18], [-15, 22]]},
  {tone: 'dry', pts: [[38, 27], [46, 29], [50, 25], [55, 22], [52, 18], [45, 15], [41, 19]]},
  {tone: 'dry', pts: [[118, -22], [122, -27], [130, -29], [138, -28], [141, -24], [136, -20], [128, -19], [120, -20]]},
  // Madagascar
  {pts: [[49, -12], [50, -16], [48, -25], [44, -25], [43, -22], [44, -17]]},
  // Australia
  {pts: [[114, -22], [114, -26], [115, -34], [118, -35], [124, -34], [129, -32], [134, -33], [138, -35], [140, -38], [146, -39], [150, -37], [153, -31], [153, -25], [150, -22], [146, -19], [145, -15], [142, -11], [141, -13], [140, -17], [136, -16], [136, -12], [132, -11], [130, -13], [126, -14], [122, -18]]},
  // Japan (Honshu/Kyushu/Shikoku block + Hokkaido)
  {pts: [[130, 31], [131, 34], [133, 35.4], [136, 36], [137, 37.2], [139.5, 38.5], [140, 41], [141.4, 41.4], [142, 39.5], [141, 37], [140.8, 35.7], [140, 35], [139, 34.7], [137, 34.5], [135, 33.5], [133, 33], [131, 31]]},
  {pts: [[140, 42], [141, 45.3], [145.5, 44], [143.5, 42], [141, 41.6]]},
  // British Isles
  {pts: [[-5, 50], [1, 51], [2, 53], [-1, 55], [-2, 57], [-3, 58.6], [-5, 58.5], [-6, 56], [-5, 55], [-3, 54], [-4, 53], [-5, 52]]},
  {pts: [[-10, 52], [-6, 52], [-6, 55], [-8, 55.3], [-10, 54]]},
  {pts: [[-24, 65.5], [-14, 66.3], [-14, 64.4], [-22, 63.5]], tone: 'ice'},
  // Caribbean / SE Asia islands
  {pts: [[-85, 22], [-80, 23.2], [-74, 20], [-78, 20]]},
  {pts: [[-74.5, 19.8], [-68.5, 19], [-70, 18], [-74.5, 18.2]]},
  {pts: [[95, 5.5], [98, 4], [104, -2], [106, -6], [102, -4.5]]},
  {pts: [[109, 1], [110, -2.5], [116, -4], [118.5, 1], [119, 5], [116.5, 7], [113, 3.5]]},
  {pts: [[105.5, -6], [114.5, -7], [114.5, -8.5], [106, -7.6]]},
  {pts: [[131, -1], [138, -2], [145, -5], [150.5, -10.5], [143, -9], [138, -8], [132, -4]]},
  {pts: [[119, 1], [125, 1.5], [121, -1], [123, -5], [120, -5.5]]},
  {pts: [[120, 18.5], [122.5, 18.4], [124, 12.5], [126.5, 7], [125.5, 6], [121.5, 13.5]]},
  {pts: [[120.2, 22], [121, 25.3], [122, 24.5], [120.8, 22]]},
  {pts: [[79.8, 9.8], [81.9, 7.5], [81.2, 6.1], [79.9, 6.5]]},
  // New Zealand
  {pts: [[172.6, -34.4], [178.5, -37.7], [175.3, -41.6], [171, -44], [166.5, -46], [172, -41], [174.5, -37]]},
];

/** Densify an outline so long edges follow the sphere curvature. */
const densify = (pts: [number, number][], step = 2.5) => {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / step));
    for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
};
const LAND_DENSE = LAND.map((p) => ({...p, pts: densify(p.pts)}));

/** Projects an outline; back-side points are pushed onto the limb (fills stay closed). */
const polyPath = (v: GlobeView, pts: [number, number][]) => {
  let anyFront = false;
  const s = pts.map(([lon, lat]) => {
    const [x, y, z] = toView(lat, lon, v.rotation, v.tilt);
    if (z > 0) {
      anyFront = true;
      return [x, y];
    }
    const l = Math.hypot(x, y) || 1;
    return [x / l, y / l];
  });
  if (!anyFront) return null;
  return 'M' + s.map(([x, y]) => `${(v.cx + x * v.r).toFixed(1)},${(v.cy - y * v.r).toFixed(1)}`).join('L') + 'Z';
};

/** Front-side polyline of a curve; splits into segments at the horizon. */
const curvePath = (v: GlobeView, pts: [number, number][], lift = 0, progress = 1) => {
  const n = Math.max(2, Math.round(pts.length * progress));
  const segs: string[] = [];
  let cur: string[] = [];
  for (let i = 0; i < n; i++) {
    const [lon, lat] = pts[i];
    const [x, y, z] = toView(lat, lon, v.rotation, v.tilt, 1 + lift);
    if (z > -0.02) cur.push(`${(v.cx + x * v.r).toFixed(1)},${(v.cy - y * v.r).toFixed(1)}`);
    else if (cur.length) {
      if (cur.length > 1) segs.push('M' + cur.join('L'));
      cur = [];
    }
  }
  if (cur.length > 1) segs.push('M' + cur.join('L'));
  return segs.join(' ');
};

const latCircle = (lat: number, from = -180, to = 180, step = 3): [number, number][] => {
  const out: [number, number][] = [];
  const n = Math.ceil(Math.abs(to - from) / step);
  for (let i = 0; i <= n; i++) out.push([from + ((to - from) * i) / n, lat]);
  return out;
};
const meridian = (lon: number, step = 3): [number, number][] => {
  const out: [number, number][] = [];
  for (let lat = -90; lat <= 90; lat += step) out.push([lon, lat]);
  return out;
};

const STARS = Array.from({length: 140}).map((_, i) => ({
  x: random(`gs-x-${i}`) * W,
  y: random(`gs-y-${i}`) * H,
  r: 0.6 + random(`gs-r-${i}`) * 2.1,
  o: 0.25 + random(`gs-o-${i}`) * 0.7,
  tw: random(`gs-t-${i}`) * 6,
}));

/** Deep-space backdrop with stars and a soft nebula; `drift` shifts stars (px) for parallax. */
export const SpaceBackdrop: React.FC<{t?: number; driftX?: number; driftY?: number; tint?: string}> = ({t = 0, driftX = 0, driftY = 0, tint = '40,70,140'}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 45%, #13224a 0%, #0a1230 45%, #04060f 100%)'}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 60% 35% at 25% 20%, rgba(${tint},0.35) 0%, rgba(${tint},0) 70%), radial-gradient(ellipse 50% 30% at 80% 85%, rgba(120,60,140,0.25) 0%, rgba(120,60,140,0) 70%)`,
      }}
    />
    <svg width={W} height={H} style={{position: 'absolute'}}>
      {STARS.map((s, i) => {
        const x = (((s.x + driftX * (0.3 + s.r * 0.25)) % W) + W) % W;
        const y = (((s.y + driftY * (0.3 + s.r * 0.25)) % H) + H) % H;
        return <circle key={i} cx={x} cy={y} r={s.r} fill="#e8f1ff" opacity={s.o * (0.7 + 0.3 * Math.sin(t * 3 + s.tw))} />;
      })}
    </svg>
  </AbsoluteFill>
);

const Pin: React.FC<{v: GlobeView; pin: GlobePin}> = ({v, pin}) => {
  const p = globeProject(v, pin.lat, pin.lon);
  if (p.z < -0.05) return null;
  const drop = pin.drop ?? 1;
  if (drop <= 0) return null;
  const k = (pin.scale ?? 1) * Math.max(0.6, Math.min(1.6, v.r / 420));
  const fade = Math.min(1, (p.z + 0.05) / 0.25);
  const color = pin.color ?? '#ff4b3e';
  const h = 64 * k;
  const yOff = (1 - drop) * -140 * k;
  const bounce = drop < 1 ? 1 : 1;
  const side = pin.labelSide === 'left' ? -1 : 1;
  const pulse = pin.pulse ?? 0;
  return (
    <g opacity={fade * Math.min(1, drop * 3)}>
      {/* ground shadow + ripple */}
      <ellipse cx={p.x} cy={p.y} rx={12 * k} ry={5 * k} fill="#000" opacity={0.35 * drop} />
      {pulse > 0 &&
        [0, 0.5].map((o) => {
          const ph = (pulse + o) % 1;
          return <ellipse key={o} cx={p.x} cy={p.y} rx={ph * 70 * k} ry={ph * 30 * k} fill="none" stroke={color} strokeWidth={4 * k * (1 - ph)} opacity={1 - ph} />;
        })}
      <g transform={`translate(${p.x},${p.y + yOff}) scale(${k * bounce})`}>
        <path d={`M0,0 C-6,-18 -26,-34 -26,-52 A26,26 0 1 1 26,-52 C26,-34 6,-18 0,0 Z`} fill={color} stroke="#fff" strokeWidth={4} />
        <circle cx={0} cy={-52} r={10} fill="#fff" />
        <path d={`M-14,-66 A18,18 0 0 1 4,-72`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
      </g>
      {pin.label && (
        <text
          x={p.x + side * 38 * k}
          y={p.y + yOff - h * 0.72}
          textAnchor={side > 0 ? 'start' : 'end'}
          fontFamily={HUD_FONT}
          fontWeight={700}
          fontSize={34 * k}
          letterSpacing={3 * k}
          fill="#fff"
          stroke="rgba(5,10,25,0.75)"
          strokeWidth={6 * k}
          paintOrder="stroke"
          opacity={Math.min(1, Math.max(0, drop * 2 - 1))}
        >
          {pin.label}
        </text>
      )}
    </g>
  );
};

const Arrow: React.FC<{v: GlobeView; a: GlobeArrow; id: string}> = ({v, a, id}) => {
  const prog = a.progress ?? 1;
  if (prog <= 0.01) return null;
  const lift = a.lift ?? 0.035;
  const end = a.lon + a.length * prog;
  const pts = latCircle(a.lat, a.lon, end, 1.5);
  const color = a.color ?? '#ffd23f';
  const w = (a.width ?? 16) * Math.max(0.6, Math.min(2.2, v.r / 420));
  const proj = pts.map(([lon, lat]) => globeProject(v, lat, lon, lift));
  const vis = proj.filter((q) => q.z > -0.02);
  if (vis.length < 2) return null;
  const d = 'M' + vis.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join('L');
  const tip = proj[proj.length - 1];
  const prev = proj[Math.max(0, proj.length - 3)];
  const ang = Math.atan2(tip.y - prev.y, tip.x - prev.x);
  const tipVisible = tip.z > -0.02;
  const op = a.opacity ?? 1;
  const head = w * 2.3;
  return (
    <g opacity={op}>
      <path d={d} stroke={color} strokeWidth={w * 2.4} fill="none" strokeLinecap="round" opacity={0.25} filter={`url(#${id}-soft)`} />
      <path d={d} stroke="rgba(0,0,0,0.35)" strokeWidth={w + 6} fill="none" strokeLinecap="round" transform="translate(0,6)" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#fff" strokeWidth={w * 0.22} fill="none" strokeLinecap="round" opacity={0.6} transform={`translate(0,${-w * 0.22})`} />
      {tipVisible && (
        <g transform={`translate(${tip.x},${tip.y}) rotate(${(ang * 180) / Math.PI})`}>
          <path d={`M${head * 0.9},0 L${-head * 0.55},${-head * 0.75} L${-head * 0.3},0 L${-head * 0.55},${head * 0.75} Z`} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

export const Globe: React.FC<GlobeProps> = (props) => {
  const {
    pins = [],
    arrows = [],
    highlightEquator = 0,
    highlightMeridianLon,
    highlightMeridian = 1,
    highlightLats = [],
    grid = 0.35,
    t = 0,
    night = 0.55,
    clouds = true,
  } = props;
  const id = useUid('globe');
  const v = globeView(props);
  const {cx, cy, r} = v;

  const graticule: string[] = [];
  for (let lat = -60; lat <= 60; lat += 30) if (lat !== 0) graticule.push(curvePath(v, latCircle(lat)));
  for (let lon = -180; lon < 180; lon += 30) graticule.push(curvePath(v, meridian(lon)));
  const equator = curvePath(v, latCircle(0));

  const cloudBands = clouds
    ? Array.from({length: 14}).map((_, i) => {
        const lat = -55 + random(`gc-lat-${i}`) * 115;
        const lon0 = random(`gc-lon-${i}`) * 360 - 180 + t * 2;
        const len = 18 + random(`gc-len-${i}`) * 30;
        return {d: curvePath(v, latCircle(lat + Math.sin(i) * 2, lon0, lon0 + len, 2), 0.012), w: 6 + random(`gc-w-${i}`) * 10};
      })
    : [];

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <radialGradient id={`${id}-ocean`} cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 1.5} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4fb0e8" />
            <stop offset="0.45" stopColor="#2a74b8" />
            <stop offset="1" stopColor="#103565" />
          </radialGradient>
          <radialGradient id={`${id}-land`} cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 1.5} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#9ed37a" />
            <stop offset="0.5" stopColor="#5fa45a" />
            <stop offset="1" stopColor="#2f6a3e" />
          </radialGradient>
          <radialGradient id={`${id}-dry`} cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 1.5} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f0d48e" />
            <stop offset="0.5" stopColor="#d2a861" />
            <stop offset="1" stopColor="#8d6a3a" />
          </radialGradient>
          <radialGradient id={`${id}-ice`} cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 1.5} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#a9c3d8" />
          </radialGradient>
          <radialGradient id={`${id}-shade`} cx={cx - r * 0.42} cy={cy - r * 0.45} r={r * 1.75} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff6dc" stopOpacity={0.22} />
            <stop offset="0.35" stopColor="#000" stopOpacity={0} />
            <stop offset="0.72" stopColor="#020822" stopOpacity={night * 0.75} />
            <stop offset="1" stopColor="#020822" stopOpacity={night * 1.2} />
          </radialGradient>
          <radialGradient id={`${id}-atmo`} cx={cx} cy={cy} r={r * 1.22} gradientUnits="userSpaceOnUse">
            <stop offset={0.78} stopColor="#6fd0ff" stopOpacity={0} />
            <stop offset={0.815} stopColor="#7fd8ff" stopOpacity={0.75} />
            <stop offset={0.87} stopColor="#4aa8ff" stopOpacity={0.28} />
            <stop offset={1} stopColor="#2a6cff" stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${id}-rim`} cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
            <stop offset={0.86} stopColor="#9be3ff" stopOpacity={0} />
            <stop offset={1} stopColor="#bdeeff" stopOpacity={0.55} />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          <filter id={`${id}-soft`} filterUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3}>
            <feGaussianBlur stdDeviation={6} />
          </filter>
          <filter id={`${id}-glow`} filterUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3}>
            <feGaussianBlur stdDeviation={8} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* atmosphere halo */}
        <circle cx={cx} cy={cy} r={r * 1.22} fill={`url(#${id}-atmo)`} />
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-ocean)`} />

        <g clipPath={`url(#${id}-clip)`}>
          {LAND_DENSE.map((p, i) => {
            const d = polyPath(v, p.pts);
            if (!d) return null;
            const fill = p.tone === 'ice' ? `url(#${id}-ice)` : p.tone === 'dry' ? `url(#${id}-dry)` : `url(#${id}-land)`;
            return (
              <g key={i}>
                {p.tone !== 'dry' && <path d={d} fill="none" stroke="#bfe6ff" strokeWidth={Math.max(2, r * 0.012)} opacity={0.35} strokeLinejoin="round" />}
                <path d={d} fill={fill} stroke={p.tone === 'dry' ? 'none' : '#2c5a35'} strokeWidth={p.tone === 'dry' ? 0 : Math.max(1, r * 0.003)} strokeLinejoin="round" opacity={p.tone === 'dry' ? 0.85 : 1} />
              </g>
            );
          })}
          {/* graticule */}
          <g stroke="#dff3ff" strokeWidth={Math.max(1, r * 0.0035)} fill="none" opacity={grid}>
            {graticule.map((d, i) => (
              <path key={i} d={d} />
            ))}
            <path d={equator} strokeWidth={Math.max(1.5, r * 0.006)} strokeDasharray={`${r * 0.03} ${r * 0.02}`} />
          </g>
          {/* clouds */}
          <g stroke="#ffffff" fill="none" strokeLinecap="round" opacity={0.55} filter={`url(#${id}-soft)`}>
            {cloudBands.map((c, i) => (
              <path key={i} d={c.d} strokeWidth={c.w * (r / 420)} />
            ))}
          </g>
          {/* day/night shading + rim light */}
          <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-shade)`} />
          <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-rim)`} />
        </g>

        {/* highlighted lines (drawn above shading so they glow) */}
        {highlightEquator > 0 && (
          <g filter={`url(#${id}-glow)`}>
            <path d={curvePath(v, latCircle(0, v.rotation - 90, v.rotation + 90, 2), 0.004, highlightEquator)} stroke="#ffe066" strokeWidth={Math.max(4, r * 0.016)} fill="none" strokeLinecap="round" />
          </g>
        )}
        {highlightMeridianLon !== undefined && highlightMeridian > 0 && (
          <g filter={`url(#${id}-glow)`}>
            <path d={curvePath(v, meridian(highlightMeridianLon, 2), 0.004, highlightMeridian)} stroke="#6ff0ff" strokeWidth={Math.max(4, r * 0.014)} fill="none" strokeLinecap="round" />
          </g>
        )}
        {highlightLats.map((h, i) =>
          h.k > 0 ? (
            <g key={i} filter={`url(#${id}-glow)`}>
              <path
                d={curvePath(v, latCircle(h.lat, v.rotation - 90, v.rotation + 90, 2), 0.004, h.k)}
                stroke={h.color ?? '#ff9f43'}
                strokeWidth={(h.width ?? Math.max(3, r * 0.011))}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ) : null,
        )}

        {arrows.map((a, i) => (
          <Arrow key={i} v={v} a={a} id={id} />
        ))}
        {pins.map((p, i) => (
          <Pin key={i} v={v} pin={p} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
