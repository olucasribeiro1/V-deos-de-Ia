// Render "turbinado" para a série Sem Marca: mundo 3D com materiais PBR, reflexo de ambiente, oclusão (GTAO),
// profundidade de campo (bokeh), bloom, lente (barril/aberração/vinheta/grão/cor), partículas e o boneco 2D
// como "folha" dentro da cena (recebe luz, projeta sombra, é ocultado pelos objetos).
import { E, rng, noise } from '/engine/core.js';
import { drawFigure } from '/engine/rig2d.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const RAPIDO = { ativo: true, escala: 0.45 };   // modo rápido: 3D em resolução menor, sem desfoque
export const LENTE = { uniforms: { tDiffuse: { value: null }, barril: { value: 0 }, aberr: { value: 0.0015 }, vinheta: { value: 0.45 }, grao: { value: 0.035 }, tempo: { value: 0 }, quente: { value: 0.05 }, sat: { value: 1.12 }, contraste: { value: 1.06 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float barril, aberr, vinheta, grao, tempo, quente, sat, contraste; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + tempo*7.13) * 43758.5453); }
  void main(){ vec2 c = vUv - 0.5; float r2 = dot(c,c); vec2 uv = 0.5 + c * (1.0 + barril * r2) / (1.0 + barril * 0.25);
    vec3 col; col.r = texture2D(tDiffuse, 0.5 + (uv-0.5)*(1.0+aberr)).r; col.g = texture2D(tDiffuse, uv).g; col.b = texture2D(tDiffuse, 0.5 + (uv-0.5)*(1.0-aberr)).b;
    float l = dot(col, vec3(0.299,0.587,0.114)); col = mix(vec3(l), col, sat); col = (col - 0.5) * contraste + 0.5; col += vec3(quente, quente*0.4, -quente*0.6);
    col *= 1.0 - vinheta * smoothstep(0.15, 0.75, r2 * 2.2); col += (h(vUv*1000.0) - 0.5) * grao;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0); gl_FragColor = vec4(col, 1.0); }` };

// palco turbinado: substitui o composer padrão do kit
export function palco(T, o = {}) {
  const THREE = T.THREE, st = T.stage({ ...o, bloom: 0 });
  if (RAPIDO.ativo) { o = { ...o, dof: false, ao: false }; }
  const R = st.composer.renderer; R.shadowMap.type = RAPIDO.ativo ? THREE.PCFShadowMap : THREE.VSMShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = o.exposicao ?? 1.05;
  const pm = new THREE.PMREMGenerator(R); st.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; st.scene.environmentIntensity = o.env ?? 0.55;
  st.sun.shadow.radius = 6; st.sun.shadow.blurSamples = 12; st.sun.shadow.mapSize.set(2048, 2048);
  const esc = RAPIDO.ativo ? RAPIDO.escala : 1; R.setPixelRatio(esc); R.setSize(Math.round(E.W * E.PX), Math.round(E.H * E.PX), false); if (RAPIDO.ativo) st.sun.shadow.mapSize.set(1024, 1024);
  const w = Math.round(E.W * E.PX * esc), h = Math.round(E.H * E.PX * esc);
  const comp = new EffectComposer(R, new THREE.WebGLRenderTarget(w, h, { samples: RAPIDO.ativo ? 2 : 4, type: THREE.HalfFloatType }));
  comp.addPass(new RenderPass(st.scene, st.camera));
  let ao = null; if (o.ao !== false) { ao = new GTAOPass(st.scene, st.camera, w, h); ao.blendIntensity = o.aoForca ?? 0.9; ao.updateGtaoMaterial({ radius: o.aoRaio ?? 0.6, distanceExponent: 1.5, thickness: 1.2, scale: 1 }); comp.addPass(ao); }
  let dof = null; if (o.dof !== false) { dof = new BokehPass(st.scene, st.camera, { focus: o.foco ?? 10, aperture: o.abertura ?? 0.0025, maxblur: o.maxblur ?? 0.012 }); comp.addPass(dof); }
  const bloom = new UnrealBloomPass(new THREE.Vector2(RAPIDO.ativo ? w / 2 : w, RAPIDO.ativo ? h / 2 : h), o.bloom ?? 0.55, 0.6, o.bloomLimiar ?? 0.82); comp.addPass(bloom);
  const lente = new ShaderPass(LENTE); comp.addPass(lente); comp.addPass(new OutputPass());
  Object.assign(lente.uniforms.barril, { value: o.barril ?? 0 }); if (o.quente != null) lente.uniforms.quente.value = o.quente; if (o.sat != null) lente.uniforms.sat.value = o.sat;
  st.composer = comp; st.render = () => comp.render(); st.ao = ao; st.dof = dof; st.bloom = bloom; st.lente = lente;
  st.foco = (dist, ab) => { if (dof) { dof.uniforms.focus.value = dist; if (ab != null) dof.uniforms.aperture.value = ab; } };
  st.tick = (t) => { lente.uniforms.tempo.value = t; };
  return st;
}
export const pbr = (T, c, o = {}) => new T.THREE.MeshStandardMaterial({ color: new T.THREE.Color(c), roughness: o.r ?? 0.7, metalness: o.m ?? 0, ...(o.extra || {}) });
export function m(T, geo, mat, x = 0, y = 0, z = 0) { const me = new T.THREE.Mesh(geo, mat); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; return me; }

// ---------- boneco 2D como folha dentro do 3D ----------
// altura em metros; desenha o rig 2D numa textura a cada quadro; vira sempre pra câmera (só no eixo Y)
export function boneco2D(T, o = {}) { const THREE = T.THREE, W = 512, H = 768, alt = o.alt ?? 1.75;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.35, roughness: 0.85, side: THREE.DoubleSide, emissive: new THREE.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: o.auto ?? 0.35 });
  const larg = alt * W / H, geo = new THREE.PlaneGeometry(larg, alt); geo.translate(0, alt / 2, 0);
  const me = new THREE.Mesh(geo, mat); me.castShadow = true; me.receiveShadow = false;
  me.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.35 });
  const grp = new THREE.Group(); grp.add(me);
  // escala do rig: figura ~ 230 px de altura (s=1) -> ocupa ~85% da textura
  grp.desenha = (opts) => { g.clearRect(0, 0, W, H); const s = (H * 0.86) / 230; drawFigure(g, { x: W / 2, y: H - 20, s, ...opts }); if (opts.caixa) { const cx = W / 2 + (opts.facing ?? 1) * 4 * s, cy = H - 20 - 250 * s; g.fillStyle = '#0b0b0d'; g.fillRect(cx - 34 * s, cy - 26 * s, 68 * s, 46 * s); g.fillStyle = '#b07a44'; g.fillRect(cx - 31 * s, cy - 23 * s, 62 * s, 40 * s); g.fillStyle = '#8a5a30'; g.fillRect(cx - 31 * s, cy - 6 * s, 62 * s, 5 * s); } tex.needsUpdate = true; };
  grp.olha = (cam) => { const v = new THREE.Vector3(); cam.getWorldPosition(v); grp.rotation.y = Math.atan2(v.x - grp.position.x, v.z - grp.position.z); };
  return grp; }

// ---------- partículas brilhantes (poeira mágica, brasas, vagalumes) ----------
let SPR = null;
function sprite(T) { if (SPR) return SPR; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); SPR = new T.THREE.CanvasTexture(c); return SPR; }
export function particulas(T, o = {}) { const THREE = T.THREE, n = o.n ?? 400, r = rng(o.seed ?? 3), cx = o.centro ?? [0, 2, 0], ext = o.ext ?? [20, 6, 20];
  const pos = new Float32Array(n * 3), base = []; for (let i = 0; i < n; i++) { base.push([cx[0] + (r() - 0.5) * ext[0], cx[1] + r() * ext[1], cx[2] + (r() - 0.5) * ext[2], r() * 10]); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: sprite(T), color: new THREE.Color(o.cor ?? '#ffd27a'), size: o.tam ?? 0.15, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: o.opac ?? 0.9 });
  const p = new THREE.Points(geo, mat); p.frustumCulled = false;
  p.update = (t) => { for (let i = 0; i < n; i++) { const b = base[i], sobe = o.sobe ?? 0.2; pos[i * 3] = b[0] + Math.sin(t * 0.7 + b[3]) * 0.4; pos[i * 3 + 1] = cx[1] + ((b[1] - cx[1] + t * sobe) % ext[1]); pos[i * 3 + 2] = b[2] + Math.cos(t * 0.5 + b[3]) * 0.4; } geo.attributes.position.needsUpdate = true; };
  p.update(0); return p; }

// ---------- terreno ondulado com cores por vértice + grama instanciada + pedras + flores ----------
export function terreno(T, o = {}) { const THREE = T.THREE, g = new THREE.Group(), r = rng(o.seed ?? 9), tam = o.tam ?? 260;
  const alt = (x, z) => (o.morro ? Math.max(0, 2.4 - Math.hypot(x, z) * 0.12) * Math.max(0, 1 - Math.hypot(x, z) / 22) * 1.0 + Math.max(0, 2.6 * (1 - Math.hypot(x, z) / 14)) : 0) + noise(x * 0.05, 1) * 1.2 + noise(x * 0.18 + 5, z * 0.18) * 0.25;
  const geo = new THREE.PlaneGeometry(tam, tam, 160, 160); geo.rotateX(-Math.PI / 2); const P = geo.attributes.position, cols = [];
  const c1 = new THREE.Color(o.cor1 ?? '#5fb84a'), c2 = new THREE.Color(o.cor2 ?? '#3f8a3a'), c3 = new THREE.Color(o.cor3 ?? '#a8c060');
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), y = alt(x, z); P.setY(i, y); const k = noise(x * 0.08, z * 0.08 + 3) * 0.5 + 0.5; const c = c1.clone().lerp(c2, k).lerp(c3, Math.max(0, noise(x * 0.3, z * 0.3) * 0.6)); cols.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const chao = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); chao.receiveShadow = true; g.add(chao);
  // grama: tufos instanciados
  const tufo = new THREE.ConeGeometry(0.06, 0.45, 3); tufo.translate(0, 0.22, 0); const nG = o.grama ?? 9000; const ig = new THREE.InstancedMesh(tufo, new THREE.MeshStandardMaterial({ color: '#4fae3e', roughness: 0.9 }), nG); const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S3 = new THREE.Vector3(), V = new THREE.Vector3(), cg = new THREE.Color();
  for (let i = 0; i < nG; i++) { const x = (r() - 0.5) * (o.gramaExt ?? 40), z = (r() - 0.5) * (o.gramaExt ?? 40); V.set(x, alt(x, z), z); Q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5)); const s = 0.6 + r() * 1.0; S3.set(s, s * (0.8 + r()), s); M4.compose(V, Q, S3); ig.setMatrixAt(i, M4); ig.setColorAt(i, cg.set('#4fae3e').offsetHSL((r() - 0.5) * 0.06, 0, (r() - 0.5) * 0.15)); }
  ig.receiveShadow = true; g.add(ig);
  // flores
  const fl = new THREE.SphereGeometry(0.07, 6, 4); const nF = o.flores ?? 900; const ifl = new THREE.InstancedMesh(fl, new THREE.MeshStandardMaterial({ roughness: 0.5, emissive: '#221122' }), nF); const fc = ['#ff6aa0', '#ffe14a', '#ffffff', '#9a7aff', '#ff8a3a'];
  for (let i = 0; i < nF; i++) { const x = (r() - 0.5) * 36, z = (r() - 0.5) * 36; V.set(x, alt(x, z) + 0.3, z); M4.compose(V, Q.identity(), S3.set(1, 1, 1)); ifl.setMatrixAt(i, M4); ifl.setColorAt(i, cg.set(fc[i % 5])); } g.add(ifl);
  // pedras
  for (let i = 0; i < (o.pedras ?? 40); i++) { const x = (r() - 0.5) * 60, z = (r() - 0.5) * 60; if (Math.hypot(x, z) < 3) continue; const s = 0.3 + r() * 1.2; const p = m(T, new THREE.DodecahedronGeometry(s, 0), pbr(T, '#8a8494', { r: 0.9 }), x, alt(x, z) + s * 0.3, z); p.rotation.set(r() * 3, r() * 3, r() * 3); p.scale.y = 0.6; g.add(p); }
  g.alt = alt; return g; }

export function arvore(T, x, z, y, s = 1, seed = 1) { const THREE = T.THREE, g = new THREE.Group(), r = rng(seed); g.add(m(T, new THREE.CylinderGeometry(0.18 * s, 0.3 * s, 2.4 * s, 7), pbr(T, '#6a4630'), 0, 1.2 * s, 0));
  const cs = ['#3e9a3a', '#4fb446', '#2f7f30', '#5cc04f']; for (let i = 0; i < 6; i++) { const b = m(T, new THREE.IcosahedronGeometry((0.9 + r() * 0.6) * s, 1), pbr(T, cs[i % 4], { r: 0.8 }), (r() - 0.5) * 1.6 * s, (2.6 + r() * 1.4) * s, (r() - 0.5) * 1.6 * s); g.add(b); }
  g.position.set(x, y, z); return g; }

// ---------- multidão viva: gente andando, conversando em pares, vendendo, parada ----------
// specs: { tipo: 'anda'|'conversa'|'parado'|'carrega', x, z, x1 (anda), vel, frente (+1/-1 em x), outfit, fase, marca, alt }
import { POSES, walkPose, breathe, posesAt } from '/engine/rig2d.js';
export function multidao(T, specs) { const THREE = T.THREE, g = new THREE.Group(), gente = [];
  const GESTOS = [POSES.talk, POSES.explain, POSES.shrug, { ...POSES.talk, eF: [26, -170], hF: [40, -210] }, POSES.crossArms, POSES.point, POSES.think];
  specs.forEach((sp, i) => { const b = boneco2D(T, { alt: sp.alt ?? 1.75, auto: 0.12 }); b.sp = { fase: i * 1.37, vel: 1.2, ...sp }; b.position.set(sp.x, 0, sp.z); g.add(b); gente.push(b); });
  const right = new THREE.Vector3(), fw = new THREE.Vector3();
  // o: { congela: t (todos param e olham pro alvo), alvoX, expr (fn), extra (fn por pessoa) }
  g.update = (t, cam, o = {}) => { cam.getWorldDirection(fw); right.crossVectors(fw, cam.up).normalize();
    for (const b of gente) { const sp = b.sp, ph = t + sp.fase, parado = o.congela != null && t > o.congela;
      let x = sp.x, dir = sp.frente ?? 1, pose, talk = 0, expr = sp.expr || 'neutral';
      if (sp.tipo === 'anda' || sp.tipo === 'carrega') { const L = (sp.x1 ?? sp.x + 20) - sp.x, tt = parado ? o.congela + sp.fase : ph; const k = ((tt * sp.vel) % (2 * L) + 2 * L) % (2 * L); x = sp.x + (k < L ? k : 2 * L - k); dir = k < L ? 1 : -1; if (sp.vaiVolta === false) { x = sp.x + ((tt * sp.vel) % L); dir = 1; }
        pose = parado ? POSES.stand : walkPose(tt * sp.vel * 1.6, {}); if (sp.tipo === 'carrega' && !parado) pose = { ...pose, eF: [14, -190], hF: [6, -238], eB: [-12, -190], hB: [-4, -238] }; expr = sp.expr || (sp.tipo === 'carrega' ? 'gloom' : 'neutral'); }
      else if (sp.tipo === 'conversa') { const vez = Math.floor(ph / 1.9) % 2 === (sp.lado ?? 0); talk = vez && !parado ? Math.max(0, Math.sin(ph * 9)) * 0.9 : 0; const gi = Math.floor(ph / 1.3 + sp.fase) % GESTOS.length; pose = breathe(parado ? POSES.stand : (vez ? GESTOS[gi] : POSES.relaxed), t, 1, sp.fase); expr = sp.expr || (vez ? ['smile', 'joy', 'neutral', 'suspicious'][gi % 4] : 'neutral'); }
      else pose = breathe(sp.pose || POSES.relaxed, t, 1, sp.fase);
      if (parado && o.alvoX != null) dir = o.alvoX > x ? 1 : -1;
      if (parado && o.expr) expr = o.expr(b, sp) || expr;
      b.position.x = x; b.olha(cam);
      const tela = right.x * dir; // sentido do movimento na tela
      const extra = o.extra ? o.extra(b, sp, t) || {} : {};
      b.desenha({ facing: tela >= 0 ? 1 : -1, outfit: sp.outfit, pose: extra.pose || pose, expr: extra.expr || expr, talk, t, marca: sp.marca, emote: extra.emote, look: extra.look, caixa: sp.tipo === 'carrega' && !parado });
      if (sp.tipo === 'carrega') b.children[0].material.map && 0; }
  };
  g.gente = gente; return g; }
