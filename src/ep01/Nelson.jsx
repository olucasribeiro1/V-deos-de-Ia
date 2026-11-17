import { useMemo } from 'react';
import * as THREE from 'three';
import { toon } from './Cenario.jsx';
import { camisa } from './texturas.js';
import { NELSON, T } from './cena.js';
import { trilha, ramp, clamp, smooth, ruido, b } from './tempo.js';

const OUT = new THREE.MeshBasicMaterial({ color: '#0d0d12', side: THREE.BackSide });
const PELE = '#c68a5e';

function malha(pai, geo, mat, pos, rot, contorno = 0.06) {
  const m = new THREE.Mesh(geo, typeof mat === 'string' ? toon(mat) : mat);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (contorno) { const o = new THREE.Mesh(geo, OUT); o.scale.setScalar(1 + contorno); m.add(o); }
  pai.add(m);
  return m;
}
const grupo = (pai, pos) => { const g = new THREE.Group(); g.position.set(...pos); pai.add(g); return g; };
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10);

function montar() {
  const raiz = new THREE.Group();
  const quadril = grupo(raiz, [0, 0.92, 0]);
  const shirt = toon('#ffffff', { map: camisa() });
  malha(quadril, cap(0.21, 0.38), shirt, [0, 0.32, 0], null, 0.04);
  malha(quadril, cap(0.2, 0.06), '#24489c', [0, 0.02, 0], null, 0.04); // bermuda

  const perna = (lado) => {
    const coxa = grupo(quadril, [lado * 0.11, 0, 0]);
    malha(coxa, cap(0.095, 0.26), '#24489c', [0, -0.2, 0]);
    const joelho = grupo(coxa, [0, -0.44, 0]);
    malha(joelho, cap(0.07, 0.3), PELE, [0, -0.2, 0]);
    malha(joelho, new THREE.BoxGeometry(0.1, 0.05, 0.24), PELE, [0, -0.42, 0.05], null, 0.08);
    malha(joelho, new THREE.BoxGeometry(0.12, 0.025, 0.28), '#1b8f3a', [0, -0.455, 0.05], null, 0.06); // chinelo
    return { coxa, joelho };
  };
  const pe = { L: perna(-1), R: perna(1) };

  const peito = grupo(quadril, [0, 0.5, 0]);
  const braco = (lado) => {
    const ombro = grupo(peito, [lado * 0.27, 0, 0]);
    malha(ombro, cap(0.075, 0.1), shirt, [0, -0.06, 0]);
    malha(ombro, cap(0.06, 0.18), PELE, [0, -0.2, 0]);
    const cotovelo = grupo(ombro, [0, -0.3, 0]);
    malha(cotovelo, cap(0.055, 0.2), PELE, [0, -0.13, 0]);
    malha(cotovelo, new THREE.SphereGeometry(0.065, 10, 8), PELE, [0, -0.29, 0]);
    return { ombro, cotovelo };
  };
  const br = { L: braco(-1), R: braco(1) };

  const cabeca = grupo(peito, [0, 0.17, 0]);
  malha(cabeca, cap(0.05, 0.06), PELE, [0, 0, 0]); // pescoço
  const cranio = grupo(cabeca, [0, 0.18, 0]);
  malha(cranio, new THREE.SphereGeometry(0.17, 20, 16), PELE, [0, 0, 0], [0, 0, 0], 0.05);
  malha(cranio, new THREE.SphereGeometry(0.178, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), '#2a1c14', [0, 0.012, -0.012], [-0.25, 0, 0], 0.03);
  malha(cranio, new THREE.SphereGeometry(0.035, 8, 6), PELE, [-0.17, 0, 0], null, 0.1);
  malha(cranio, new THREE.SphereGeometry(0.035, 8, 6), PELE, [0.17, 0, 0], null, 0.1);
  malha(cranio, new THREE.SphereGeometry(0.032, 8, 6), '#b5774d', [0, -0.02, 0.17], null, 0.1); // nariz
  const olho = (lado) => {
    const g = grupo(cranio, [lado * 0.06, 0.03, 0.145]);
    malha(g, new THREE.SphereGeometry(0.034, 12, 10), '#fbfbf7', [0, 0, 0], null, 0.12);
    malha(g, new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshBasicMaterial({ color: '#1a120c' }), [0, 0, 0.022], null, 0);
    const sob = malha(cranio, new THREE.BoxGeometry(0.07, 0.016, 0.02), '#22160f', [lado * 0.06, 0.085, 0.155], null, 0);
    return { g, sob };
  };
  const olhos = { L: olho(-1), R: olho(1) };
  const boca = malha(cranio, new THREE.BoxGeometry(0.07, 0.012, 0.01), '#6e2f25', [0, -0.075, 0.158], null, 0);
  const suor = malha(cranio, new THREE.SphereGeometry(0.015, 8, 6), new THREE.MeshBasicMaterial({ color: '#cfeaff' }), [0.13, 0.08, 0.1], null, 0);

  // ---- objetos de mão (no espaço do corpo) ----
  const celular = grupo(raiz, [0.05, 1.25, 0.32]);
  malha(celular, new THREE.BoxGeometry(0.075, 0.15, 0.01), '#1b1b1f', [0, 0, 0], null, 0.08);
  const tela = malha(celular, new THREE.PlaneGeometry(0.066, 0.135), new THREE.MeshBasicMaterial({ color: '#9fd0ff' }), [0, 0, -0.006], [0, Math.PI, 0], 0);
  celular.rotation.x = -0.5;
  const luzCel = new THREE.PointLight('#9fc8ff', 0, 3, 2); luzCel.position.set(0, 0, -0.15); celular.add(luzCel);

  const lanterna = grupo(raiz, [0.2, 1.12, 0.33]);
  const corpoLant = grupo(lanterna, [0, 0, 0]);
  malha(corpoLant, new THREE.CylinderGeometry(0.03, 0.026, 0.2, 10), '#333', [0, 0, 0], [Math.PI / 2, 0, 0], 0.1);
  malha(corpoLant, new THREE.CylinderGeometry(0.045, 0.032, 0.05, 12), '#f2c230', [0, 0, 0.12], [Math.PI / 2, 0, 0], 0.1);
  const lente = malha(corpoLant, new THREE.CircleGeometry(0.04, 12), new THREE.MeshBasicMaterial({ color: '#666' }), [0, 0, 0.146], null, 0);
  const spot = new THREE.SpotLight('#fff4d6', 0, 30, 0.32, 0.45, 1.2);
  spot.position.set(0, 0, 0.15); corpoLant.add(spot);
  const alvo = new THREE.Object3D(); alvo.position.set(0, -0.6, 6); corpoLant.add(alvo); spot.target = alvo;
  const feixe = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5.5, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: '#fff3c8', transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  feixe.rotation.x = -Math.PI / 2 - 0.1; feixe.position.set(0, -0.28, 2.9); corpoLant.add(feixe);

  return { raiz, quadril, pe, br, peito, cabeca, cranio, olhos, boca, suor, celular, tela, luzCel, lanterna, corpoLant, lente, spot, feixe };
}

const angLerp = (a, z, u) => { let d = ((z - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * u; };

function pose(t) {
  const p = trilha(NELSON, t);
  const p2 = trilha(NELSON, t + 0.05);
  const vx = (p2[0] - p[0]) / 0.05, vz = (p2[1] - p[1]) / 0.05;
  const vel = Math.hypot(vx, vz);
  let i = 0; while (NELSON[i + 1].t < t) i++;
  const u = smooth(clamp((t - NELSON[i].t) / (NELSON[i + 1].t - NELSON[i].t)));
  const rKey = angLerp(NELSON[i].r, NELSON[i + 1].r, u);
  const w = clamp((vel - 0.25) / 0.7);
  return { x: p[0], z: p[1], r: angLerp(rKey, Math.atan2(vx, vz), w), vel };
}

export const Nelson = ({ t }) => {
  const n = useMemo(montar, []);
  const { x, z, r, vel } = pose(t);
  n.raiz.position.set(x, 0, z);
  n.raiz.rotation.y = r;

  // sentado → em pé
  const pe = ramp(t, T.levanta, T.levanta + 0.7);
  const andando = clamp(vel / 1.2);
  const fase = t * (5 + vel * 2.5);
  n.quadril.position.y = 0.5 + 0.42 * pe + Math.abs(Math.sin(fase)) * 0.04 * andando;
  n.quadril.position.z = 0.15 * (1 - pe);
  n.quadril.rotation.x = 0.08 * andando;
  for (const [lado, s] of [['L', 1], ['R', -1]]) {
    const passo = Math.sin(fase + (s > 0 ? 0 : Math.PI));
    n.pe[lado].coxa.rotation.x = -Math.PI / 2 * (1 - pe) + passo * 0.6 * andando;
    n.pe[lado].joelho.rotation.x = Math.PI / 2 * (1 - pe) + Math.max(0, -passo) * 0.9 * andando;
    n.br[lado].ombro.rotation.x = -passo * 0.5 * andando;
    n.br[lado].ombro.rotation.z = s * 0.12;
    n.br[lado].cotovelo.rotation.x = -0.25 - 0.3 * andando;
  }

  // objetos e braço direito
  const comCel = t >= T.celularIn && t < T.celularOut;
  const comLant = t >= T.lanterna - 1.2;
  const mexeRadio = t >= T.radio - 0.6 && t < T.lanterna - 1.2;
  n.celular.visible = comCel;
  n.lanterna.visible = comLant;
  if (comCel || comLant) {
    n.br.R.ombro.rotation.x = -0.6; n.br.R.ombro.rotation.z = 0.25; n.br.R.cotovelo.rotation.x = -1.25;
  }
  if (comCel) { n.br.L.ombro.rotation.x = -0.45; n.br.L.ombro.rotation.z = -0.35; n.br.L.cotovelo.rotation.x = -1.3; }
  if (mexeRadio) { n.br.R.ombro.rotation.x = -1.05; n.br.R.ombro.rotation.z = 0.1; n.br.R.cotovelo.rotation.x = -0.35 + Math.sin(t * 3) * 0.05; }

  // tela do celular: acesa até o modo avião/ligação; luz no rosto
  const telaOn = comCel ? 1 : 0;
  n.tela.material.color.set(t > b('ligacao', 0.0) ? '#b8ffcb' : '#9fd0ff');
  n.luzCel.intensity = telaOn * 1.6;

  // lanterna: liga no "lanterna,", varre a cozinha, mira o corredor no fim
  const lig = t >= T.lanterna ? 1 : 0;
  n.spot.intensity = lig * 45;
  n.feixe.visible = lig === 1;
  n.lente.material.color.set(lig ? '#fffbe8' : '#555');
  const varre = ramp(t, T.lanterna + 0.3, T.lanterna + 1) * (1 - ramp(t, b('lanterna', 0.4), b('lanterna', 0.5)));
  n.corpoLant.rotation.y = Math.sin(t * 1.6) * 0.6 * varre + ruido(t, 0.4) * 0.03;
  n.corpoLant.rotation.x = Math.sin(t * 1.1) * 0.12 * varre - 0.05 + (t > b('porta', 0.3) ? -0.12 : 0);

  // rosto: tensão cresce depois do apagão
  const tensao = ramp(t, T.apagao, T.apagao + 3) * 0.6 + ramp(t, b('close', 0), b('close', 0.3)) * 0.25 + ramp(t, b('rosto2', 0), b('rosto2', 0.4)) * 0.15;
  const arregala = 1 + 0.35 * (ramp(t, b('rosto', 0), b('rosto', 0.3)) * (1 - ramp(t, b('cozinha', 0), b('cozinha', 0.2)))
    + ramp(t, T.silencio, T.silencio + 0.4) + ramp(t, b('porta', 0.4), b('porta', 0.6)) * 0.5) ;
  const piscar = (t % 3.7) < 0.12 && arregala < 1.2 ? 0.15 : 1;
  for (const [lado, s] of [['L', -1], ['R', 1]]) {
    n.olhos[lado].g.scale.set(arregala, arregala * piscar, arregala);
    n.olhos[lado].sob.rotation.z = s * -0.45 * tensao;
    n.olhos[lado].sob.position.y = 0.085 + 0.012 * tensao;
  }
  n.boca.scale.set(1 - 0.35 * tensao, 1 + tensao * 0.8, 1);
  n.suor.visible = tensao > 0.75;
  n.suor.position.y = 0.08 - ((t * 0.08) % 0.12);
  // respiração ofegante + cabeça olhando ao redor quando parado
  const resp = 1 + Math.sin(t * (2 + tensao * 4)) * 0.015 * (0.5 + tensao);
  n.peito.scale.set(resp, 1, resp);
  n.cabeca.rotation.y = ruido(t, 0.15) * 0.15 * (1 - andando);
  n.cabeca.rotation.x = (comCel && t < b('rosto', 0)) ? 0.35 : (mexeRadio && t < b('close', 0)) ? 0.3 : 0;
  return <primitive object={n.raiz} />;
};
