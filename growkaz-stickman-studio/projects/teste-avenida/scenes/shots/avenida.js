import { registerShot } from '/engine/core.js';
import { cenaMorte } from '/series/semmarca/avenida3d.js';
const TEMPOS = { tGato: 2.0, tCaminhao: 3.4, tCorre: 5.0, tPulo: 6.2, tImpacto: 6.9, tIleso: 7.6, fim: 10 };
registerShot('R', { kind: '3d',
  init(T) { const c = cenaMorte(T, { ...TEMPOS, semOverlay: true }); return { stage: c.stage, c, T }; },
  draw(s, lt, info) { const i = Math.round(lt); const av = s.c.av; const N = av.children.length;
    av.children.forEach((ch, k) => { ch.visible = true; });
    s.c.gato.visible = true; s.c.truck.visible = true; s.c.update(4.4);
    const T = s.T.THREE;
    if (i === 1) s.c.gato.visible = false;
    if (i === 2) av.children.forEach(ch => { if (ch.isMesh) ch.visible = false; });
    if (i === 3) av.children.forEach(ch => { if (ch.isGroup) ch.visible = false; });
    if (i === 4) av.children.forEach(ch => { if (ch.isLight) ch.visible = false; });
    if (i === 5) s.c.eu.visible = false;
    if (i === 6) av.children.forEach(ch => { if (!ch.isMesh && !ch.isGroup && !ch.isLight) ch.visible = false; });
  } });
