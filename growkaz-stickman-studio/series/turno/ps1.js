// TURNO DA MADRUGADA — palco 3D "terror retrô PS1/PS2" (v2, direção de arte do usuário):
// cena renderizada em 360x640 num render target NEAREST (profundidade float, sem z-fighting), vértices com snap leve
// só nos objetos (piso/paredes/teto não "nadam"), sombreamento chapado, neblina exponencial que só começa a ~12 m
// (lá fora), e um pós-processo próprio: dessaturação + tinta, quantização com dithering leve, aberração cromática,
// tremida VHS por linha, scanlines CRT, vinheta e grão — ampliado sem suavização para o quadro final.
import * as THREE from 'three';
import { E, clamp, lerp, ease, key, noise } from '/engine/core.js';

export const RES = [360, 640];
const SNAP = { value: new THREE.Vector2(RES[0] / 2, RES[1] / 2) };
// neblina compartilhada: começa em uFogStart metros, cresce exponencialmente (densidade uFogDens)
export const FOG = { start: { value: 12 }, dens: { value: 0.07 } };
const FOG_FRAG = `#ifdef USE_FOG
  float fogD = max(vFogDepth - uFogStart, 0.0);
  float fogFactor = 1.0 - exp(-uFogDens * uFogDens * fogD * fogD);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, clamp(fogFactor, 0.0, 1.0));
#endif`;
// patch: snap opcional de vértice (o "tremido" PS1) + neblina exponencial com início
function patch(m, doSnap) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSnap = SNAP; sh.uniforms.uFogStart = FOG.start; sh.uniforms.uFogDens = FOG.dens;
    if (doSnap) sh.vertexShader = 'uniform vec2 uSnap;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n if (gl_Position.w > 0.3) { vec2 sp = floor((gl_Position.xy / gl_Position.w) * uSnap + 0.5) / uSnap; gl_Position.xy = sp * gl_Position.w; }');
    sh.fragmentShader = 'uniform float uFogStart; uniform float uFogDens;\n' + sh.fragmentShader.replace('#include <fog_fragment>', FOG_FRAG);
  };
  m.customProgramCacheKey = () => doSnap ? 'ps1snapfog' : 'ps1fog';
  return m;
}
export const snap = (m) => patch(m, true);
const C = (c) => new THREE.Color(c);
// material chapado com luz (Lambert + flat shading). o.fixo = sem snap (arquitetura grande)
export const lam = (c, o = {}) => {
  const m = new THREE.MeshLambertMaterial({ color: C(c), flatShading: o.flat ?? true, map: o.map || null, emissive: C(o.emissive || '#000000'), emissiveIntensity: o.ei ?? 1, emissiveMap: o.emissiveMap || null, side: o.side ?? THREE.FrontSide, transparent: !!o.transparent, opacity: o.opacity ?? 1, depthWrite: o.depthWrite ?? true, fog: o.fog ?? true, vertexColors: !!o.vc, alphaTest: o.alphaTest ?? 0 });
  if (o.decal) { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -4 * o.decal; }
  return patch(m, !o.fixo);
};
// material que "brilha" (lâmpada, tela, vidro iluminado): não recebe luz
export const luz = (c, o = {}) => {
  const m = new THREE.MeshBasicMaterial({ color: C(c), map: o.map || null, fog: o.fog ?? true, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: o.depthWrite ?? !o.add, alphaTest: o.alphaTest ?? 0 });
  if (o.decal) { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -4 * o.decal; }
  return patch(m, !o.fixo);
};
// textura de canvas pixelada (NEAREST na ampliação; mipmaps lineares entre níveis = piso sem cintilar ao longe)
export function tex(w, h, draw, rep = null) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
  t.canvas = c; t.g = g; return t;
}
// ruído determinístico para pintar texturas
export function rnd(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// mancha suave (sujeira, umidade) num canvas
export function mancha(g, x, y, r, cor, a = 0.3) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cor.replace('A', a)); gr.addColorStop(1, cor.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }

// malhas
export function box(w, h, d, m, x = 0, y = 0, z = 0) { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); return me; }
export function cil(rt, rb, h, m, x = 0, y = 0, z = 0, seg = 6) { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); me.position.set(x, y, z); return me; }
export function pl(w, h, m, x = 0, y = 0, z = 0, sw = 1, sh = 1) { const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h, sw, sh), m); me.position.set(x, y, z); return me; }
// caixa chanfrada (1 segmento de bisel): "low poly modelado", não cubo
export function cbox(w, h, d, m, x = 0, y = 0, z = 0, r = 0.03) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape(); const a = w / 2 - r, b = h / 2 - r;
  s.moveTo(-a, -h / 2); s.lineTo(a, -h / 2); s.lineTo(w / 2, -b); s.lineTo(w / 2, b); s.lineTo(a, h / 2); s.lineTo(-a, h / 2); s.lineTo(-w / 2, b); s.lineTo(-w / 2, -b); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: 0, bevelSegments: 1, curveSegments: 1 });
  geo.translate(0, 0, -(d - 2 * r) / 2); geo.computeVertexNormals();
  { const p = geo.attributes.position, u = geo.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5); }   // UV planar 0..1 (frente/trás)
  const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); return me;
}

const POS = {
  uniforms: { tDiffuse: { value: null }, res: { value: new THREE.Vector2(RES[0], RES[1]) }, tempo: { value: 0 }, niveis: { value: 30 }, dither: { value: 0.7 }, grao: { value: 0.045 }, vinheta: { value: 0.5 }, fade: { value: 0 }, expo: { value: 1.25 }, sat: { value: 0.78 }, tint: { value: new THREE.Vector3(0.97, 1.0, 0.9) }, flash: { value: new THREE.Vector3(0, 0, 0) }, aberr: { value: 0.65 }, scan: { value: 0.2 }, vhs: { value: 0.35 }, gama: { value: 1.0 }, trk: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 res; uniform float tempo, niveis, dither, grao, vinheta, fade, expo, sat, aberr, scan, vhs, gama, trk; uniform vec3 tint, flash; varying vec2 vUv;
  float b2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
  float bayer(vec2 a){ return b2(0.5 * a) * 0.25 + b2(a); }
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  vec3 tom(vec3 c){ c = max(c * expo, 0.0); c = c / (1.0 + 0.32 * c); return pow(c, vec3(1.0 / (2.2 * gama))); }
  void main(){
    float row = floor(vUv.y * res.y), fr = floor(tempo * 24.0);
    // VHS: ondulação lenta por linha + uma faixa de "tracking" que desce devagar
    float band = smoothstep(0.035 + 0.12 * trk, 0.0, abs(fract(vUv.y * 0.85 + tempo * (0.045 + 2.5 * trk)) - 0.5));
    float wob = vhs * (0.45 * sin(row * 0.09 + tempo * 2.3) + 0.35 * sin(row * 0.021 - tempo * 0.9) + 1.6 * band * (h(vec2(row, fr)) - 0.3));
    wob += trk * 14.0 * (h(vec2(floor(row / 3.0), fr)) - 0.5) * step(0.6, h(vec2(floor(row / 9.0), fr + 3.0)));
    vec2 uv0 = vUv + vec2(wob / res.x, 0.0);
    vec2 px = floor(uv0 * res); vec2 uv = (px + 0.5) / res;
    float ab = (aberr + 0.8 * band) / res.x;
    vec3 c = vec3(texture2D(tDiffuse, uv + vec2(ab, 0.0)).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - vec2(ab, 0.0)).b);
    c = tom(c);
    float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, sat); c *= tint;
    vec2 q = vUv - 0.5; q.y *= 1.1; c *= 1.0 - vinheta * smoothstep(0.2, 0.68, length(q));
    c += (h(px + fr * vec2(17.0, 31.0)) - 0.5) * grao + band * 0.03;
    c += flash;
    float d = bayer(px) - 0.5;
    c = floor(c * niveis + 0.5 + d * dither) / niveis;
    // scanlines CRT: a 2ª metade de cada linha baixa escurece (linhas de 2 px na saída 720x1280)
    c *= 1.0 - scan * step(0.5, fract(vUv.y * res.y));
    c *= 1.0 - fade;
    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }` };

// palcoPS1(T, { fov, neblina, fogStart, fogDens, fundo })
export function palcoPS1(T, o = {}) {
  const R = T.getRenderer();
  const scene = new THREE.Scene(); scene.background = C(o.fundo ?? '#0a1724');
  scene.fog = new THREE.Fog(C(o.neblina ?? '#0c1a28'), 1, 1000);
  FOG.start.value = o.fogStart ?? 12; FOG.dens.value = o.fogDens ?? 0.065;
  // vertical: 360x640. Horizontal (render --wide): o canvas 3D ocupa o quadro todo e a câmera vê mais dos lados (640x360)
  if (E.wide) R.setSize(E.outW, E.outH, false);
  const [w, h] = E.wide ? [640, 360] : RES;
  const camera = new THREE.PerspectiveCamera(o.fov ?? 66, E.wide ? E.outW / E.outH : E.W / E.H, 0.1, 320); scene.add(camera);
  SNAP.value.set(w / 2, h / 2);
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false });
  rt.depthTexture = new THREE.DepthTexture(w, h); rt.depthTexture.type = THREE.FloatType;   // profundidade 32F: nada de z-fighting
  const pm = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.clone(POS.uniforms), vertexShader: POS.vertexShader, fragmentShader: POS.fragmentShader, depthTest: false, depthWrite: false });
  pm.uniforms.tDiffuse.value = rt.texture; pm.uniforms.res.value.set(w, h);
  const ps = new THREE.Scene(), pc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pm); quad.frustumCulled = false; ps.add(quad);
  const U = pm.uniforms;
  const fogCfg = [FOG.start.value, FOG.dens.value];
  const api = {
    scene, camera, rt, U, w, h,
    add: (...ob) => { ob.forEach(x => scene.add(x)); return ob[0]; },
    render() { SNAP.value.set(w / 2, h / 2); FOG.start.value = fogCfg[0]; FOG.dens.value = fogCfg[1]; const sm = R.shadowMap.enabled, tm = R.toneMapping; R.shadowMap.enabled = false; R.toneMapping = THREE.NoToneMapping; R.setRenderTarget(rt); R.setClearColor(scene.background, 1); R.clear(); R.render(scene, camera); R.setRenderTarget(null); R.render(ps, pc); R.shadowMap.enabled = sm; R.toneMapping = tm; },
    dispose() { scene.traverse(x => { x.geometry?.dispose(); [].concat(x.material || []).forEach(m => { m.map?.dispose(); m.dispose(); }); }); rt.depthTexture?.dispose(); rt.dispose(); pm.dispose(); },
    post(p = {}) { for (const k in p) { if (!U[k]) continue; if (U[k].value?.isVector3) U[k].value.set(...p[k]); else U[k].value = p[k]; } },
    neblina(start, dens) { fogCfg[0] = start; fogCfg[1] = dens; },
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
  // no horizontal a altura visível é 1390/1920 do quadro vertical: mesmo enquadramento vertical, mais cenário nos lados
  const fv = E.wide ? 2 * Math.atan(Math.tan(v.f * Math.PI / 360) * 1390 / 1920) * 180 / Math.PI : v.f; cam.userData.fv = v.f;
  if (Math.abs(cam.fov - fv) > 1e-3) { cam.fov = fv; cam.updateProjectionMatrix(); }
  cam.updateMatrixWorld();
  return { vel, anda, yaw, pitch, fase };
}
// projeta um ponto do mundo para coordenadas do quadro 1080x1920
export function tela(cam, p) { const v = new THREE.Vector3(...p).project(cam); return [(v.x + 1) / 2 * E.W, (1 - v.y) / 2 * E.H, v.z]; }

// ---------- fala: dirigida pelos tempos das falas (info.L.<id> = [início, fim]) ----------
// devolve a abertura da boca 0..1 se T cai dentro de uma das falas `ids`; dentro da fala, fecha nas pausas entre palavras
export function fala(T, L, ids) {
  for (const id of ids) {
    const r = L[id]; if (!r || T < r[0] - 0.05 || T > r[1] + 0.05) continue;
    const ws = E.words.filter(w => w.start >= r[0] - 0.05 && w.end <= r[1] + 0.3);
    let dentro = ws.length === 0;
    for (const w of ws) if (T >= w.start - 0.03 && T <= w.end + 0.05) { dentro = true; break; }
    const sil = 0.5 + 0.5 * Math.sin(T * 17.0 + 1.3 * Math.sin(T * 5.1));          // sílabas ~ 8/s
    const env = 0.65 + 0.35 * Math.sin(T * 3.3 + 0.7);
    return { ativo: true, k: dentro ? clamp(0.15 + 0.85 * sil * env) : 0.05 * sil, id };
  }
  return { ativo: false, k: 0 };
}
export { THREE };
