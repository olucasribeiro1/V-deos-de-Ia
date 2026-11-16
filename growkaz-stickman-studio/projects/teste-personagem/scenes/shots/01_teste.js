import { E, V, SAFE, registerShot, layer, blurLayer, veil, ease, prog, key, wordTime } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cozinha } from '../sets/cozinha.js';
import { rua } from '../sets/rua.js';
import { PROTAGONISTA, FIGURANTE } from '../cast.js';

registerShot('s001', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.06 * ease.inOut(t / info.dur), x: -20 + 30 * ease.inOut(t / info.dur) };
  const { GY, M, CX } = cozinha(g, t, cam);
  layer(g, cam, 1, g => drawFigure(g, { x: CX + 120, y: GY, s: 2.2, facing: -1, outfit: PROTAGONISTA,
    pose: breathe(posesAt(t, [[0, 'stand'], [0.8, 'holdFront'], [2.6, 'think']]), t, 1, 2), expr: t < 2.5 ? 'neutral' : 'worried', blink: (t % 3.1) > 3.0 }));
  FX.dust(g, t);
  const tw = wordTime('três', info.shot.start) ?? 2.9, a = ease.outBack(prog(info.globalT, tw, tw + 0.4));
  if (a > 0) { g.save(); g.translate(SAFE.right - 20, SAFE.top + 90); g.scale(a, a); UI.badge(g, { str: '3.0 L', x: 0, y: 0, color: E.style.ui.accent, size: 96 }); UI.badge(g, { str: 'RESTANTE', x: 0, y: 70, color: E.style.ui.accent, size: 40 }); g.restore(); }
}});

registerShot('s002', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * ease.inOut(t / info.dur) };
  blurLayer(g, 12, g => cozinha(g, t, { z: 1.3, x: 100 }), cam, 0.6); veil(g, '#000', 0.45);
  layer(g, cam, 1, g => bigFace(g, E.W / 2, E.H * 0.47, 300, { outfit: PROTAGONISTA, expr: 'worried', blink: (t % 2.7) > 2.6, look: [-0.3, 0.1], rimSide: 1 }));
}});

registerShot('s003', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * ease.inOut(t / info.dur), x: 40 - 60 * ease.inOut(t / info.dur) };
  const { GY, M, CX } = rua(g, t, cam);
  layer(g, cam, 0.95, g => { for (let i = 0; i < 7; i++) drawFigure(g, { x: CX - 520 + i * 95, y: GY - 6, s: 1.35, facing: 1, outfit: FIGURANTE, pose: breathe(POSES.stand, t, 1, i), expr: 'neutral', blink: ((t + i) % 3.3) > 3.2 }); });
  const wx = CX + 260 - 70 * t;
  layer(g, cam, 1, g => drawFigure(g, { x: wx, y: GY + 60, s: 1.9, facing: -1, outfit: PROTAGONISTA, pose: walkPose(t * Math.PI * 2 * 0.9), expr: 'worried' }));
  FX.dust(g, t, { color: '#cfd4de' });
}});
