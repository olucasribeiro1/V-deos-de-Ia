import { registerShot } from '/engine/core.js';
import { mapaAldoria, palcoMapa, voo, rotulosMapa } from '/series/semmarca/mapa3d.js';
const K = { tAldoria: 0.5, tNorte: 3.0, tMontanhas: 5.2, tCentro: 7.4, tSul: 9.6, fim: 12 };
registerShot('M', { kind: '3d',
  init(T) { const st = palcoMapa(T); const mapa = mapaAldoria(T); st.add(mapa); return { stage: st, st, mapa }; },
  draw(s, lt, info, T) { const d = voo(s.st.camera, lt, K, s.mapa); s.st.foco(d, 0.00012); s.mapa.update(info.globalT); s.st.tick(info.globalT); },
  overlay(g, lt, info, s) { const c = s.st.camera, tela = {}; for (const n of ['norte', 'montanhas', 'centro', 'sul']) tela[n] = s.mapa.tela(c, n); rotulosMapa(g, lt, { ...K, tela }); } });
