import { E, registerShot } from '/engine/core.js';
import { drawFigure, POSES, walkPose } from '/engine/rig2d.js';
import { POVO, GUARDA, CRIANCA } from '/series/semmarca/povo.js';
import { PROTAGONISTA } from '../cast.js';
registerShot('R', { draw(g, t) { g.fillStyle = '#9ad0ff'; g.fillRect(0, 0, E.W, E.H);
  POVO.forEach((o, i) => drawFigure(g, { x: 140 + (i % 4) * 260, y: 760 + Math.floor(i / 4) * 560, s: 1.6, facing: i % 2 ? -1 : 1, outfit: o, pose: i % 3 ? POSES.talk : walkPose(t * 2 + i), expr: 'smile', t, marca: { n: 1 + i % 3, cor: '#ff4a1a' } }));
  drawFigure(g, { x: 300, y: 1800, s: 1.6, outfit: GUARDA, pose: POSES.stand, expr: 'suspicious', t }); drawFigure(g, { x: 560, y: 1800, s: 1.6, outfit: CRIANCA(1), pose: POSES.point, expr: 'shocked', t }); drawFigure(g, { x: 820, y: 1800, s: 1.6, outfit: PROTAGONISTA, pose: POSES.stand, expr: 'nervous', t }); } });
