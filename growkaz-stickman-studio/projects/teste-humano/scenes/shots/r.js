import { E, registerShot, text } from '/engine/core.js';
import { POSES, walkPose } from '/engine/rig2d.js';
import { drawHumano, bigHumano, PRESETS as H } from '/engine/humano2d.js';

const fundo = (g, a, b) => { const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); };
const chao = (g, y) => { g.fillStyle = '#9fd36b'; g.fillRect(0, y, E.W, 40); };
const rot = (g, s, x, y) => text(g, s, x, y, { size: 26, color: '#1d1b2e', font: 'Nunito', weight: 800 });

registerShot('R', { draw(g, t) {
  if (t < 1) {           // lineup: protagonistas + presets
    fundo(g, '#8fd3ff', '#e9f6ff');
    const L = [
      ['PROTAGONISTA_A', POSES.stand, 'smile'], ['PROTAGONISTA_B', POSES.wave, 'joy'], ['SEU_MANOEL', POSES.talk, 'happy', 0.7], ['MAE', POSES.point, 'determined'],
      ['ANJO_ESTAGIARIO', walkPose(t * 7), 'nervous'], ['CHEFE_ANJO', POSES.crossArms, 'suspicious'], ['SENHORA', POSES.handsOnHead, 'shocked'], ['JOVEM_MOLETOM', POSES.phone, 'gulp'],
      ['BIOMEDICA', POSES.explain, 'thinking'], ['POLITICO', POSES.talk, 'furious', 0.5], ['MOCA', POSES.shrug, 'confused'], ['CRIANCA', POSES.cheer, 'joy'],
    ];
    for (let r = 0; r < 3; r++) chao(g, 560 + r * 620);
    L.forEach(([k, p, e, talk], i) => { const x = 150 + (i % 4) * 250, y = 560 + Math.floor(i / 4) * 620;
      drawHumano(g, { x, y, s: 1.55, outfit: H[k], pose: p, expr: e, talk: talk || 0, t, prop: k === 'JOVEM_MOLETOM' ? 'phone' : null });
      rot(g, k, x, y + 30); });
  } else if (t < 2) {    // closes + andando
    fundo(g, '#ffd86b', '#fff3cf');
    bigHumano(g, 280, 470, 150, { outfit: H.PROTAGONISTA_A, expr: 'smile', t });
    bigHumano(g, 760, 470, 150, { outfit: H.PROTAGONISTA_B, expr: 'shocked', t, talk: 0 });
    rot(g, 'bigHumano A', 280, 800); rot(g, 'bigHumano B', 760, 800);
    bigHumano(g, 280, 1060, 120, { outfit: H.SEU_MANOEL, expr: 'happy', talk: 0.8, t });
    bigHumano(g, 760, 1060, 120, { outfit: H.MOCA, expr: 'suspicious', t, look: [0.8, 0] });
    chao(g, 1780);
    drawHumano(g, { x: 180, y: 1780, s: 1.6, outfit: H.PROTAGONISTA_A, pose: walkPose(t * 6), expr: 'determined', t });
    drawHumano(g, { x: 430, y: 1780, s: 1.6, outfit: H.PROTAGONISTA_B, pose: walkPose(t * 6 + 1.5, { run: true }), expr: 'panic', t, emote: 'sweat' });
    drawHumano(g, { x: 690, y: 1780, s: 1.6, outfit: H.SEU_OSVALDO, pose: POSES.point, expr: 'angry', t, facing: -1, emote: 'anger' });
    drawHumano(g, { x: 930, y: 1780, s: 1.6, outfit: H.TRABALHADOR, pose: POSES.sit, expr: 'sad', t, facing: -1 });
  } else if (t > 2.9) {  // extras: dim, alpha, rot, outfit legado, criança de frente, emotes
    fundo(g, '#ffc4d6', '#fff0f5'); chao(g, 900); chao(g, 1600);
    drawHumano(g, { x: 180, y: 900, s: 1.6, outfit: H.MAE, pose: POSES.sad, expr: 'cry', t, dim: true });
    drawHumano(g, { x: 430, y: 900, s: 1.6, outfit: H.POLITICO, pose: POSES.facepalm, expr: 'sad', t, alpha: 0.5 });
    drawHumano(g, { x: 760, y: 880, s: 1.6, outfit: H.JOVEM_MOLETOM, pose: POSES.lie, rot: -Math.PI / 2, expr: 'sleepy', t });
    drawHumano(g, { x: 180, y: 1600, s: 1.6, outfit: { top: 'hoodie', color: '#d64a33', head: 'cap', headColor: '#ff0000', legs: '#333' }, pose: POSES.think, expr: 'thinking', t, emote: 'question' });
    drawHumano(g, { x: 430, y: 1600, s: 1.6, front: true, outfit: H.CRIANCA, pose: POSES.stand, expr: 'proud', t, emote: 'sparkle' });
    drawHumano(g, { x: 680, y: 1600, s: 1.6, outfit: H.PROTAGONISTA_A, pose: POSES.kneel, expr: 'scared', t, emote: 'shock', prop: 'pao' });
    drawHumano(g, { x: 900, y: 1600, s: 1.6, front: true, outfit: H.SEU_MANOEL, pose: POSES.stand, expr: 'smile', t });
  } else {               // grade de expressões
    fundo(g, '#b9f0d0', '#f2fff7');
    const EX = ['neutral', 'smile', 'joy', 'sad', 'cry', 'angry', 'furious', 'shocked', 'scared', 'terrified', 'panic', 'nervous', 'gulp', 'suspicious', 'proud', 'determined', 'blank', 'forced', 'disgust', 'sob', 'hungry', 'smirk', 'confused', 'sleepy'];
    const OF = [H.PROTAGONISTA_A, H.MAE, H.JOVEM_MOLETOM, H.SENHORA, H.CHEFE_ANJO, H.BIOMEDICA];
    EX.forEach((e, i) => { const x = 140 + (i % 4) * 260, y = 300 + Math.floor(i / 4) * 280;
      bigHumano(g, x, y, 70, { outfit: OF[i % OF.length], expr: e, t: 0.5, corte: 1.5 }); rot(g, e, x, y + 120); });
  }
} });
