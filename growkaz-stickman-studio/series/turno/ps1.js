// TURNO DA MADRUGADA — palco 3D "PS1 / terror indie retrô":
// cena renderizada em baixa resolução (1/3) num render target NEAREST, vértices "tremendo" (snap na grade de pixels),
// sombreamento chapado (flat), neblina quase preta e um pós-processo próprio: quantização de cor + dithering ordenado
// (Bayer 4x4) + grão + vinheta, ampliado sem suavização para o quadro final.
import * as THREE from 'three';
import { E, clamp, lerp, ease, key, noise } from '/engine/core.js';

const SNAP = { value: new THREE.Vector2(120, 214) };
// vértices presos na grade de pixels da tela baixa (o "tremido" clássico do PS1)
export function snap(m) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSnap = SNAP;
    sh.vertexShader = 'uniform vec2 uSnap;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n if (gl_Position.w > 0.0) { vec2 sp = floor((gl_Position.xy / gl_Position.w) * uSnap + 0.5) / uSnap; gl_Position.xy = sp * gl_Position.w; }');
  };
  m.customProgramCacheKey = () => 'ps1snap';
  return m;
}
const C = (c) => new THREE.Color(c);
// material chapado com luz (Lambert + flat shading)
export const lam = (c, o = {}) => snap(new THREE.MeshLambertMaterial({ color: C(c), flatShading: o.flat ?? true, map: o.map || null, emissive: C(o.emissive || '#000000'), emissiveIntensity: o.ei ?? 1, emissiveMap: o.emissiveMap || null, side: o.side ?? THREE.FrontSide, transparent: !!o.transparent, opacity: o.opacity ?? 1, depthWrite: o.depthWrite ?? true, fog: o.fog ?? true }));
// material que "brilha" (lâmpada, tela, vidro iluminado): não recebe luz
export const luz = (c, o = {}) => snap(new THREE.MeshBasicMaterial({ color: C(c), map: o.map || null, fog: o.fog ?? true, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: o.depthWrite ?? !o.add }));
// textura de canvas pixelada (NEAREST)
export function tex(w, h, draw, rep = null) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapNearestFilter; t.generateMipmaps = true;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
  t.canvas = c; t.g = g; return t;
}
// malhas
export function box(w, h, d, m, x = 0, y = 0, z = 0) { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); return me; }
export function cil(rt, rb, h, m, x = 0, y = 0, z = 0, seg = 6) { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); me.position.set(x, y, z); return me; }
export function pl(w, h, m, x = 0, y = 0, z = 0) { const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); me.position.set(x, y, z); return me; }

const POS = {
  uniforms: { tDiffuse: { value: null }, res: { value: new THREE.Vector2(240, 427) }, tempo: { value: 0 }, niveis: { value: 22 }, dither: { value: 1 }, grao: { value: 0.05 }, vinheta: { value: 0.55 }, fade: { value: 0 }, expo: { value: 1.25 }, sat: { value: 1.0 }, tint: { value: new THREE.Vector3(1, 1, 1) }, flash: { value: new THREE.Vector3(0, 0, 0) }, aberr: { value: 0.0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 res; uniform float tempo, niveis, dither, grao, vinheta, fade, expo, sat, aberr; uniform vec3 tint, flash; varying vec2 vUv;
  float b2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
  float bayer(vec2 a){ return b2(0.5 * a) * 0.25 + b2(a); }
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main(){
    vec2 px = floor(vUv * res); vec2 uv = (px + 0.5) / res;
    vec3 c = texture2D(tDiffuse, uv).rgb;
    if (aberr > 0.0) { c.r = texture2D(tDiffuse, uv + vec2(aberr, 0.0)).r; c.b = texture2D(tDiffuse, uv - vec2(aberr, 0.0)).b; }
    c = max(c * expo, 0.0);
    c = c / (1.0 + 0.18 * c);                       // ombro suave nas luzes
    c = pow(c, vec3(1.0 / 2.2));                    // linear -> tela
    float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, sat); c *= tint;
    vec2 q = vUv - 0.5; q.y *= 1.15; c *= 1.0 - vinheta * smoothstep(0.18, 0.62, length(q));
    c += (h(px + floor(tempo * 24.0) * vec2(17.0, 31.0)) - 0.5) * grao;
    c += flash;
    float d = bayer(px) - 0.5;
    c = floor(c * niveis + 0.5 + d * dither) / niveis;
    c *= 1.0 - fade;
    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }` };

// palcoPS1(T, { div: 3, fov, neblina, fogNear, fogFar, fundo })
export function palcoPS1(T, o = {}) {
  const R = T.getRenderer();
  const scene = new THREE.Scene(); scene.background = C(o.fundo ?? '#020305');
  scene.fog = new THREE.Fog(C(o.neblina ?? '#03060a'), o.fogNear ?? 8, o.fogFar ?? 70);
  const camera = new THREE.PerspectiveCamera(o.fov ?? 66, E.W / E.H, 0.04, 400); scene.add(camera);
  const div = o.div ?? 3, w = Math.round(E.W * E.PX / div), h = Math.round(E.H * E.PX / div);
  SNAP.value.set(w / 2, h / 2);
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false });
  const pm = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.clone(POS.uniforms), vertexShader: POS.vertexShader, fragmentShader: POS.fragmentShader, depthTest: false, depthWrite: false });
  pm.uniforms.tDiffuse.value = rt.texture; pm.uniforms.res.value.set(w, h);
  const ps = new THREE.Scene(), pc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pm); quad.frustumCulled = false; ps.add(quad);
  const U = pm.uniforms;
  const api = {
    scene, camera, rt, U, w, h,
    add: (...ob) => { ob.forEach(x => scene.add(x)); return ob[0]; },
    render() { SNAP.value.set(w / 2, h / 2); const sm = R.shadowMap.enabled; R.shadowMap.enabled = false; R.setRenderTarget(rt); R.setClearColor(scene.background, 1); R.clear(); R.render(scene, camera); R.setRenderTarget(null); R.render(ps, pc); R.shadowMap.enabled = sm; },
    dispose() { scene.traverse(x => { x.geometry?.dispose(); [].concat(x.material || []).forEach(m => { m.map?.dispose(); m.dispose(); }); }); rt.dispose(); pm.dispose(); },
    post(p = {}) { for (const k in p) { if (!U[k]) continue; if (U[k].value?.isVector3) U[k].value.set(...p[k]); else U[k].value = p[k]; } },
  };
  return api;
}

// ---------- câmera em primeira pessoa (olhos do Lucas) ----------
// chaves: [[t, { p:[x,y,z], m:[x,y,z] (mira) | a:[yaw,pitch], f: fov }], ...] — yaw 0 = olhando pra -z (pra fora da loja), + = vira à direita
export const mira = (p, m) => { const dx = m[0] - p[0], dy = m[1] - p[1], dz = m[2] - p[2]; return [Math.atan2(dx, -dz), Math.atan2(dy, Math.hypot(dx, dz))]; };
export function rota(keys) {
  let prev = null;
  return keys.map(([t, v, fn]) => { let a = v.a ? [...v.a] : mira(v.p, v.m); if (prev != null) { while (a[0] - prev > Math.PI) a[0] -= 2 * Math.PI; while (a[0] - prev < -Math.PI) a[0] += 2 * Math.PI; } prev = a[0]; return [t, { p: v.p, a, f: v.f ?? 66, r: v.r ?? 0 }, fn]; });
}
// aplica a rota na câmera com respiração, balanço de passo e tremida opcional
export function olhar(cam, T, R, o = {}) {
  const v = key(T, R, o.ease || ease.sine), v0 = key(T - 0.06, R, o.ease || ease.sine);
  const vel = Math.hypot(v.p[0] - v0.p[0], v.p[2] - v0.p[2]) / 0.06, anda = clamp(vel / 2.2);
  const resp = o.resp ?? 1, tr = o.tremor ?? 0;
  let [x, y, z] = v.p; let [yaw, pitch] = v.a;
  const fase = T * (5.2 + anda * 4);
  y += resp * 0.012 * Math.sin(T * 1.45) + anda * 0.035 * Math.abs(Math.sin(fase)) - anda * 0.02;
  pitch += resp * (0.006 * Math.sin(T * 1.45 + 0.8) + 0.004 * noise(T * 0.4, 5)) + anda * 0.012 * Math.sin(fase * 2);
  yaw += resp * 0.006 * noise(T * 0.33, 2) + anda * 0.01 * Math.sin(fase);
  const roll = v.r + resp * 0.004 * noise(T * 0.3, 9) + anda * 0.012 * Math.sin(fase);
  if (tr > 0) { yaw += tr * 0.02 * noise(T * 11, 3); pitch += tr * 0.02 * noise(T * 12, 7); x += tr * 0.02 * noise(T * 9, 1); }
  cam.position.set(x, y, z);
  cam.rotation.order = 'YXZ'; cam.rotation.set(pitch, -yaw, roll);
  if (Math.abs(cam.fov - v.f) > 1e-3) { cam.fov = v.f; cam.updateProjectionMatrix(); }
  return { vel, anda, yaw, pitch };
}
// projeta um ponto do mundo para coordenadas do quadro 1080x1920
export function tela(cam, p) { const v = new THREE.Vector3(...p).project(cam); return [(v.x + 1) / 2 * E.W, (1 - v.y) / 2 * E.H, v.z]; }
// "fala": abertura da boca a partir das palavras do personagem
export function boca(T, spk) {
  const w = E.words.find(w => T >= w.start - 0.02 && T <= w.end + 0.02 && (w.spk || '') === spk);
  if (!w) return 0; return clamp(0.3 + 0.7 * Math.abs(Math.sin(T * 15.5)) * (0.6 + 0.4 * Math.sin(T * 4.7)));
}
export const falando = (T, spk) => E.words.some(w => T >= w.start - 0.1 && T <= w.end + 0.25 && (w.spk || '') === spk);
export { THREE };
