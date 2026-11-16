// engine/player.js — loads a project, maps global time -> shot, renders frames deterministically.
// window.renderFrame(frameIndex) draws one frame onto #main. Used by render.mjs (headless).
import { E, V, SAFE, setStyle, getShot, clamp, ease, prog, alpha, text, FONTS, noise, rr, circle } from './core.js';
import { STYLES } from './styles.js';
import { captions } from './ui2d.js';

const q = new URLSearchParams(location.search);
const PROJ = '/project';
const RES = { '720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160, '4k': 2160 };
let main, mg, bufA, bufB, glCanvas, grainTiles = [], grungeTiles = [], three = null;
const errors = (window.ERRORS = []);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

async function loadFonts() {
  const F = [['Fredoka', '600', 'fredoka/files/fredoka-latin-600-normal.woff2'], ['Fredoka', '700', 'fredoka/files/fredoka-latin-700-normal.woff2'],
    ['Nunito', '800', 'nunito/files/nunito-latin-800-normal.woff2'], ['Nunito', '900', 'nunito/files/nunito-latin-900-normal.woff2'],
    ['Playfair Display', '900', 'playfair-display/files/playfair-display-latin-900-italic.woff2', 'italic']];
  for (const [fam, w, file, style] of F) { try { const ff = new FontFace(fam, `url(/node_modules/@fontsource/${file})`, { weight: w, style: style || 'normal' }); await ff.load(); document.fonts.add(ff); } catch (e) { console.log('font missing', fam, w); } }
}
async function boot() {
  const cfg = await (await fetch(`${PROJ}/config.json`)).json();
  const story = await (await fetch(`${PROJ}/story/shots.json`)).json();
  let words = []; try { const r = await fetch(`${PROJ}/timeline/words.json`); if (r.ok) words = await r.json(); } catch {}
  const vertical = (cfg.aspect || '16:9') === '9:16';
  const short = RES[cfg.resolution || '1080p'] || 1080, long = Math.round((short * 16) / 9 / 2) * 2;
  const scale = +(q.get('scale') || 1);
  const outW = Math.round(((vertical ? short : long) * scale) / 2) * 2, outH = Math.round(((vertical ? long : short) * scale) / 2) * 2;
  Object.assign(E, { story, nums: story.numbers || [], hud: story.hud || [], punch: (story.punch || []).concat((story.numbers || []).map(n => n.t)).sort((a, b) => a - b), vertical, W: vertical ? 1080 : 1920, H: vertical ? 1920 : 1080, fps: cfg.fps || 24, cfg, words: words.words || words, shots: story.shots, outW, outH });
  E.PX = outW / E.W;
  setStyle(q.get('style') || cfg.style || 'emerald');
  await loadFonts();
  main = document.getElementById('main'); main.width = outW; main.height = outH; mg = main.getContext('2d', { willReadFrequently: true });
  buildLUT();
  bufA = mk(outW, outH); bufB = mk(outW, outH);
  const gw = Math.ceil(outW / 2), gh = Math.ceil(outH / 2);
  for (let k = 0; k < 4; k++) { const c = mk(gw, gh), x = c.getContext('2d'), id = x.createImageData(gw, gh); let s = 1234 + k * 999; for (let i = 0; i < id.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = s >>> 24; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } x.putImageData(id, 0, 0); grainTiles.push(c); }
  if (E.style.grade?.grunge > 0) for (let k = 0; k < 3; k++) grungeTiles.push(makeGrunge(outW, outH, 77 + k * 131));
  const list = await (await fetch(`/__manifest`)).json();
  for (const f of list) { try { await import(f); } catch (e) { errors.push(`import ${f}: ${e.message}`); console.log('IMPORT ERROR', f, e.message); } }
  if (E.shots.some(s => getShot(s.id)?.kind === '3d')) { three = await import('./three-kit.js'); glCanvas = mk(outW, outH); three.getRenderer(glCanvas); }
  const dur = story.duration || E.shots[E.shots.length - 1].end;
  window.DURATION = dur; window.TOTAL_FRAMES = Math.ceil(dur * E.fps); window.OUT = [outW, outH];
  window.SHOT_LIST = E.shots.map(s => ({ id: s.id, start: s.start, end: s.end, ok: !!getShot(s.id) }));
  window.READY = true;
}

// textura "suja" do estilo urbano: riscos, poeira, manchas e bordas queimadas (determinística)
function makeGrunge(w, h, seed) {
  const c = mk(w, h), x = c.getContext('2d'); let s = seed; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const k = w / 1080;
  for (let i = 0; i < 26; i++) { const cx = r() * w, cy = r() * h, rad = (60 + r() * 260) * k; const gr = x.createRadialGradient(cx, cy, 0, cx, cy, rad); gr.addColorStop(0, `rgba(0,0,0,${0.10 + r() * 0.12})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2); }
  for (let i = 0; i < 900; i++) { const a = r(); x.fillStyle = a < 0.5 ? `rgba(255,255,255,${0.05 + r() * 0.18})` : `rgba(0,0,0,${0.1 + r() * 0.25})`; const sz = (0.6 + r() * 2.2) * k; x.fillRect(r() * w, r() * h, sz, sz); }
  x.lineCap = 'round';
  for (let i = 0; i < 22; i++) { const x0 = r() * w, y0 = r() * h, len = (30 + r() * 220) * k, ang = r() * Math.PI; x.strokeStyle = `rgba(${r() < 0.6 ? '255,255,255' : '0,0,0'},${0.06 + r() * 0.14})`; x.lineWidth = (0.6 + r() * 1.4) * k; x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(x0 + Math.cos(ang) * len * 0.5 + (r() - 0.5) * 20 * k, y0 + Math.sin(ang) * len * 0.5, x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len); x.stroke(); }
  const e = Math.min(w, h) * 0.06; for (const [gx, gy, gw, gh, x1, y1, x2, y2] of [[0, 0, w, e, 0, 0, 0, e], [0, h - e, w, e, 0, h, 0, h - e], [0, 0, e, h, 0, 0, e, 0], [w - e, 0, e, h, w, 0, w - e, 0]]) { const gr = x.createLinearGradient(x1, y1, x2, y2); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(gx, gy, gw, gh); }
  return c;
}
// guia da safe zone (Instagram Reels + TikTok) — só aparece com ?safe=1 (render.mjs --safe)
function drawSafeGuide(g) {
  if (!E.vertical) return; g.save(); g.fillStyle = 'rgba(255,0,60,.22)';
  g.fillRect(0, 0, E.W, SAFE.top); g.fillRect(0, SAFE.bottom, E.W, E.H - SAFE.bottom); g.fillRect(0, SAFE.top, SAFE.left, SAFE.bottom - SAFE.top); g.fillRect(SAFE.right, SAFE.top, E.W - SAFE.right, SAFE.bottom - SAFE.top);
  g.strokeStyle = '#ff2050'; g.lineWidth = 4; g.setLineDash([18, 12]); g.strokeRect(SAFE.left, SAFE.top, SAFE.w, SAFE.h); g.restore();
}

// colour grade: per-channel lift/gamma/gain + contrast as LUTs, saturation per pixel
let LUT = null, SAT = 1;
function buildLUT() {
  const gr = E.style.grade || {}; const lift = gr.lift || [0, 0, 0], gam = gr.gamma || [1, 1, 1], gain = gr.gain || [1, 1, 1], con = gr.contrast ?? 1; SAT = gr.sat ?? 1;
  const ident = con === 1 && lift.every(v => v === 0) && gam.every(v => v === 1) && gain.every(v => v === 1);
  if (ident && SAT === 1) { LUT = null; return; }
  LUT = [0, 1, 2].map(c => { const a = new Uint8ClampedArray(256); for (let i = 0; i < 256; i++) { let x = i / 255; x = clamp((x - 0.5) * con + 0.5); x = clamp(gain[c] * (x + lift[c] * (1 - x))); x = Math.pow(x, 1 / gam[c]); a[i] = Math.round(x * 255); } return a; });
}
function applyGrade(W, H) {
  if (!LUT) return; const img = mg.getImageData(0, 0, W, H), d = img.data, [R, G, B] = LUT, s = SAT;
  for (let i = 0; i < d.length; i += 4) {
    let r = R[d[i]], g = G[d[i + 1]], b = B[d[i + 2]];
    if (s !== 1) { const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; r = l + (r - l) * s; g = l + (g - l) * s; b = l + (b - l) * s; }
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
  mg.putImageData(img, 0, 0);
}
function shotIndexAt(t) { const S = E.shots; for (let i = 0; i < S.length; i++) if (t < S[i].end) return i; return S.length - 1; }
const cache3D = new Map();
function state3D(shot, def, info) {
  if (cache3D.has(shot.id)) return cache3D.get(shot.id);
  for (const [k, v] of cache3D) if (cache3D.size >= 2) { v.dispose?.(); v.stage?.dispose?.(); cache3D.delete(k); }
  const st = def.init(three, info); cache3D.set(shot.id, st); return st;
}
function drawShot(buf, shot, lt) {
  const g = buf.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, buf.width, buf.height); g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  const def = getShot(shot.id); const dur = shot.end - shot.start;
  const info = { ...(shot.params || {}), shot, dur, globalT: shot.start + lt, p: clamp(lt / dur), line: shot.line };
  if (!def) { g.fillStyle = '#20141c'; g.fillRect(0, 0, E.W, E.H); text(g, `MISSING SHOT ${shot.id}`, E.W / 2, E.H / 2 - 30, { size: 60, color: '#ff6f61' }); text(g, (shot.line || '').slice(0, 80), E.W / 2, E.H / 2 + 50, { size: 30, color: '#fff', font: FONTS.ui, weight: 800 }); return; }
  try {
    if (def.kind === '3d') {
      const st = state3D(shot, def, info); def.draw(st, lt, info, three); (st.stage || st).render();
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(glCanvas, 0, 0, buf.width, buf.height); g.restore();
      if (def.overlay) { g.save(); def.overlay(g, lt, info, st); g.restore(); }
    } else { g.save(); def.draw(g, lt, info); g.restore(); }
    if (shot.live !== false && E.cfg.live !== false) liveCam(buf, shot.start + lt);
  } catch (e) { const msg = `${shot.id}@${lt.toFixed(2)}: ${e.message}`; if (!errors.includes(msg) && errors.length < 200) errors.push(msg); console.log('SHOT ERROR', msg, e.stack?.split('\n')[1]);
    g.setTransform(E.PX, 0, 0, E.PX, 0, 0); text(g, 'ERROR ' + msg.slice(0, 90), E.W / 2, E.H / 2, { size: 34, color: '#ff4040', font: FONTS.ui, weight: 900 }); }
}
// ---------- câmera viva: tremida de mão + zoom de base + "punch" (zoom rápido) nos números e batidas ----------
let camTmp = null;
function liveCam(buf, T) {
  const L = E.cfg.live || {}, amp = (L.amp ?? 9) * E.PX, base = L.zoom ?? 1.04;
  let z = base + 0.012 * Math.sin(T * 0.45), kick = 0;
  for (const p of E.punch) { const k = T - p; if (k >= 0 && k < 0.6) { z += (L.punch ?? 0.075) * Math.exp(-k * 7) * Math.min(1, k * 30); kick = Math.max(kick, Math.exp(-k * 9)); } if (p > T) break; }
  const dx = noise(T * 0.55, 3) * amp + noise(T * 9, 8) * 6 * E.PX * kick, dy = noise(T * 0.5, 7) * amp + noise(T * 9, 2) * 6 * E.PX * kick, rot = noise(T * 0.35, 11) * (L.rot ?? 0.006);
  if (!camTmp || camTmp.width !== buf.width) camTmp = mk(buf.width, buf.height);
  const c = camTmp.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(buf, 0, 0);
  const g = buf.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.globalCompositeOperation = 'source-over';
  g.translate(buf.width / 2 + dx, buf.height / 2 + dy); g.rotate(rot); g.scale(z, z); g.drawImage(camTmp, -buf.width / 2, -buf.height / 2); g.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- números falados aparecem grandes na tela (gerados por build_shots a partir das palavras) ----------
function drawNums(g, T, shot) {
  if (shot.nums === false) return; const ui = E.style.ui;
  for (const n of E.nums) { const k = T - n.t, dur = n.dur ?? 1.6; if (k < 0 || k > dur) continue;
    const a = ease.outBack(prog(k, 0, 0.22)), out = clamp((dur - k) / 0.25), y = n.y ?? 430, x = n.x ?? 500;
    g.save(); g.globalAlpha = out; g.translate(x, y); g.rotate(-0.05 + 0.015 * Math.sin(k * 6)); g.scale(a * (1 + 0.03 * Math.sin(k * 9)), a * (1 + 0.03 * Math.sin(k * 9)));
    const size = n.size ?? 160; text(g, n.str, 0, 0, { size, color: n.color || ui.gold, stroke: size * 0.16, strokeColor: '#0b0b0d', spacing: 2 });
    if (n.sub) { const ss = Math.round(size * 0.36); text(g, n.sub, 0, size * 0.62, { size: ss, color: ui.cream, font: FONTS.ui, weight: 900, stroke: ss * 0.3, strokeColor: '#0b0b0d', spacing: 3 }); }
    g.restore(); }
}
// ---------- HUD de tempo da história ("DIA 2 · 06:40") + medidor de radiação ----------
function drawHud(g, T, shot) {
  if (shot.hud === false || !E.hud.length) return; let h = null; for (const x of E.hud) if (x.t <= T) h = x; if (!h) return;
  const ui = E.style.ui, x = 90, y = 262, pulse = 0.5 + 0.5 * Math.sin(T * 6), fresh = clamp(1 - (T - h.t) / 0.5);
  g.save(); g.translate(x, y); g.scale(1.25 + 0.15 * fresh, 1.25 + 0.15 * fresh);
  g.font = '900 34px Nunito'; const w = g.measureText(h.text).width + 74;
  rr(g, 0, -30, w, 60, 30); g.fillStyle = 'rgba(8,9,12,.82)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();
  circle(g, 30, 0, 9, alpha(ui.accent, 0.4 + 0.6 * pulse)); text(g, h.text, 52, 2, { size: 34, color: '#ffffff', font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  if (h.rad != null) { const ry = 50, bw = 300; text(g, 'RADIAÇÃO LÁ FORA', 4, ry, { size: 20, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2, stroke: 6, strokeColor: '#0b0b0d' });
    rr(g, 0, ry + 16, bw, 18, 9); g.fillStyle = 'rgba(8,9,12,.8)'; g.fill(); rr(g, 2, ry + 18, Math.max(10, (bw - 4) * clamp(h.rad)), 14, 7); g.fillStyle = h.rad > 0.5 ? ui.accent : h.rad > 0.15 ? '#e0a030' : '#5fd36a'; g.fill(); }
  g.restore();
}

const BARS = () => ({ none: 0, wide: V(60, 0), scope: V(138, 170), thin: V(30, 60) });
const barVal = (s) => (typeof (s?.bars ?? E.cfg.bars) === 'number' ? (s.bars ?? E.cfg.bars) : BARS()[s?.bars ?? E.cfg.bars ?? V('wide', 'none')] ?? 0);

window.renderFrame = function (f) {
  const t = f / E.fps, i = shotIndexAt(t), shot = E.shots[i], lt = t - shot.start;
  drawShot(bufA, shot, lt);
  const tr = shot.in || { type: 'cut' }, tdur = tr.dur ?? (tr.type === 'whip' ? 0.35 : 0.5);
  const W = main.width, H = main.height; mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalAlpha = 1; mg.globalCompositeOperation = 'source-over';
  const grade = E.style.grade; mg.filter = grade.filter && grade.filter !== 'none' ? grade.filter : 'none';
  if (tr.type !== 'cut' && i > 0 && lt < tdur) {
    const prev = E.shots[i - 1], k = ease.inOut(lt / tdur); drawShot(bufB, prev, t - prev.start);
    if (tr.type === 'fade') { mg.drawImage(bufB, 0, 0); mg.globalAlpha = k; mg.drawImage(bufA, 0, 0); }
    else if (tr.type === 'dip' || tr.type === 'dipWhite') { const c = tr.type === 'dip' ? '#000' : '#fff'; mg.drawImage(k < 0.5 ? bufB : bufA, 0, 0); mg.filter = 'none'; mg.globalAlpha = k < 0.5 ? k * 2 : (1 - k) * 2; mg.fillStyle = c; mg.fillRect(0, 0, W, H); }
    else if (tr.type === 'flash') { mg.drawImage(bufA, 0, 0); mg.filter = 'none'; mg.globalAlpha = (1 - lt / tdur) ** 2; mg.fillStyle = '#fff'; mg.fillRect(0, 0, W, H); }
    else if (tr.type === 'whip') { const dir = tr.dir || 1; for (let s = 0; s < 4; s++) { mg.globalAlpha = 0.3; mg.drawImage(bufB, -dir * k * W * 1.1 - dir * s * W * 0.02, 0); mg.drawImage(bufA, dir * (1 - k) * W * 1.1 + dir * s * W * 0.02, 0); } }
    else if (tr.type === 'zoom') { mg.drawImage(bufB, 0, 0); const s = 1.15 - 0.15 * k; mg.globalAlpha = k; mg.translate(W / 2, H / 2); mg.scale(s, s); mg.drawImage(bufA, -W / 2, -H / 2); mg.setTransform(1, 0, 0, 1, 0, 0); }
    else mg.drawImage(bufA, 0, 0);
  } else mg.drawImage(bufA, 0, 0);
  mg.globalAlpha = 1; mg.filter = 'none'; mg.setTransform(1, 0, 0, 1, 0, 0);
  applyGrade(W, H);
  if (grade.tint) { mg.globalCompositeOperation = grade.tint[1]; mg.fillStyle = alpha(grade.tint[0], grade.tint[2]); mg.fillRect(0, 0, W, H); mg.globalCompositeOperation = 'source-over'; }
  if (shot.vignette !== false && grade.vignette > 0) { const v = mg.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${grade.vignette})`); mg.fillStyle = v; mg.fillRect(0, 0, W, H); }
  if (grade.grunge > 0 && grungeTiles.length && shot.grunge !== false) { mg.save(); mg.globalAlpha = grade.grunge * (0.85 + 0.15 * Math.sin(f * 1.7)); const gt = grungeTiles[(i + Math.floor(f / 3)) % grungeTiles.length]; mg.drawImage(gt, 0, 0, W, H); mg.restore(); }
  if (grade.grain > 0) { mg.save(); mg.globalAlpha = grade.grain; mg.globalCompositeOperation = 'overlay'; mg.drawImage(grainTiles[f % 4], 0, 0, W, H); mg.restore(); }
  mg.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  drawHud(mg, t, shot); drawNums(mg, t, shot);
  if (E.cfg.captions && shot.captions !== false) captions(mg, t, E.cfg.captionStyle || {});
  const cur = barVal(shot), prevB = i > 0 ? barVal(E.shots[i - 1]) : cur, bar = prevB + (cur - prevB) * ease.inOut(prog(lt, 0, 0.6));
  if (bar > 0) { mg.fillStyle = '#000'; mg.fillRect(0, 0, E.W, bar); mg.fillRect(0, E.H - bar, E.W, bar); }
  const fi = E.cfg.fadeIn ?? 0.5, fo = E.cfg.fadeOut ?? 0.8, dur = window.DURATION, fade = Math.max(fi > 0 ? 1 - t / fi : 0, fo > 0 ? 1 - (dur - t) / fo : 0);
  if (fade > 0) { mg.fillStyle = `rgba(0,0,0,${clamp(fade)})`; mg.fillRect(0, 0, E.W, E.H); }
  if (q.has('safe')) drawSafeGuide(mg);
  if (q.has('debug')) { mg.fillStyle = 'rgba(0,0,0,.6)'; mg.fillRect(0, E.H - 54, E.W, 54); text(mg, `${shot.id}  ${t.toFixed(2)}s  (${lt.toFixed(2)}/${(shot.end - shot.start).toFixed(2)})  ${(shot.line || '').slice(0, 70)}`, 20, E.H - 27, { size: 26, color: '#fff', font: FONTS.ui, weight: 800, align: 'left' }); }
  mg.setTransform(1, 0, 0, 1, 0, 0);
};
boot().catch(e => { window.BOOT_ERROR = e.message + '\n' + e.stack; console.log('BOOT ERROR', e.message); });
