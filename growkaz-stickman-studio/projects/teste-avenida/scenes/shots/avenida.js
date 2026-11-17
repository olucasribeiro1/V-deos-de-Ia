import { registerShot } from '/engine/core.js';
import { cenaMorte } from '/series/semmarca/avenida3d.js';
const TEMPOS = { tGato: 2.0, tCaminhao: 3.4, tCorre: 5.0, tPulo: 6.2, tImpacto: 6.9, tIleso: 7.6, fim: 10 };
registerShot('R', { kind: '3d',
  init(T) { const c = cenaMorte(T, { ...TEMPOS, semOverlay: true }); return { stage: c.stage, c, T }; },
  draw(s, lt, info) { const i = Math.round(lt); const av = s.c.av; const N = av.children.length;
    av.children.forEach((ch, k) => { ch.visible = true; });
    s.c.gato.visible = true; s.c.truck.visible = true; s.c.update(4.4);
    const T = s.T.THREE;
    const ms = av.children.filter(ch => ch.isMesh); const rm = ms[0].material; s.orig ||= { r: rm.roughness, m: rm.metalness, rmap: rm.roughnessMap, map: rm.map };
    Object.assign(rm, { roughness: s.orig.r, metalness: s.orig.m, roughnessMap: s.orig.rmap, map: s.orig.map });
    if (i === 3) { rm.metalness = 0; } if (i === 4) { rm.roughnessMap = null; rm.roughness = 0.5; } if (i === 7) { rm.map = null; } rm.needsUpdate = true;
    if (i === 1) ms[0].visible = false;
    
    if (i === 2) av.children.forEach(ch => { if (ch.isMesh) ch.visible = false; });
    
    
    if (i === 5) s.c.eu.visible = false;
    if (i === 6) av.children.forEach(ch => { if (!ch.isMesh && !ch.isGroup && !ch.isLight) ch.visible = false; });
  } });
