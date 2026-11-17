import { registerShot } from '/engine/core.js';
import { cenaMorte } from '/series/semmarca/avenida3d.js';
const TEMPOS = { tGato: 2.0, tCaminhao: 3.4, tCorre: 5.0, tPulo: 6.2, tImpacto: 6.9, tIleso: 7.6, fim: 10 };
const DBG = { dof: false, semBloom: true, semOverlay: true };
registerShot('R', { kind: '3d',
  init(T) { const c = cenaMorte(T, { ...TEMPOS, ...DBG }); return { stage: c.stage, c }; },
  draw(s, lt, info) { s.c.update(info.globalT); },
  overlay(g, lt, info, s) { s.c.overlay(g, info.globalT); } });
