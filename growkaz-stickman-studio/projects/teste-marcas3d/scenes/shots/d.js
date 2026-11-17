import { E, registerShot } from '/engine/core.js';
import { drawFigure, POSES } from '/engine/rig2d.js';
import { POVO } from '/series/semmarca/povo.js';
const C = ['#ff4a1a', '#2a9dff', '#b8743a', '#e8f4ff', '#ffe23a', '#ffd76a'];
registerShot('D', { draw(g, t) { g.fillStyle = '#9ad0ff'; g.fillRect(0, 0, E.W, E.H);
  C.forEach((cor, i) => { drawFigure(g, { x: 110 + i * 170, y: 700, s: 1.0, facing: 1, outfit: POVO[i], pose: POSES.stand, expr: 'neutral', t, marca: { n: 1 + i % 3, cor, brilho: 0.6 } }); });
  C.forEach((cor, i) => { drawFigure(g, { x: 180 + (i % 3) * 360, y: 1250 + Math.floor(i / 3) * 520, s: 1.7, facing: i % 2 ? -1 : 1, outfit: POVO[i + 1] || POVO[0], pose: POSES.stand, expr: 'smile', t, marca: { n: 1 + i % 3, cor, brilho: 0.6 } }); }); } });
