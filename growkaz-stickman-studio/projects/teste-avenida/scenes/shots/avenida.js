// Teste da avenida 3D: sequência inteira em um plano (câmera contínua) — cenaMorte() de series/semmarca/avenida3d.js
import { registerShot } from '/engine/core.js';
import { cenaMorte } from '/series/semmarca/avenida3d.js';
// tempos no relógio global do episódio (info.globalT). No episódio real, troque pelos timestamps das palavras.
const TEMPOS = { tGato: 2.0, tCaminhao: 3.4, tCorre: 5.0, tPulo: 6.2, tImpacto: 6.9, tIleso: 7.6, fim: 10 };
registerShot('R', { kind: '3d',
  init(T) { const c = cenaMorte(T, TEMPOS); return { stage: c.stage, c }; },
  draw(s, lt, info) { s.c.update(info.globalT); },
  overlay(g, lt, info, s) { s.c.overlay(g, info.globalT); } });
