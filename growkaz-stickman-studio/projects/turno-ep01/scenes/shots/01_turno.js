// TURNO DA MADRUGADA · EP. 1 — O ÚLTIMO CAFÉ
// 3D low poly PS1, primeira pessoa (os olhos do Lucas). Todos os tempos saem das falas (W + info.L), porque a voz será gravada depois.
import { E, registerShot, ease, prog, clamp, lerp, key, noise, text, FONTS, rr, alpha, glow } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';
import { W } from '/series/mamae/comum.js';
import { THREE, palcoPS1, rota, olhar, boca, lam, box } from '/series/turno/ps1.js';
import { posto, carro, faiscas, caminhao, batida, luzesLoja, pinga, POSTE } from '/series/turno/posto.js';
import { pessoa, maos, TICO, TICO_PALIDO, ALBERTO, MIMICO, VULTO } from '/series/turno/gente.js';

const OLHO = 1.62;
const LT = [3.8, 0, 2.95];             // lugar do Tico atrás do balcão
const CX = [2.4, OLHO, 3.1];           // Lucas atrás do balcão
const ang = (a, b, k) => a + (b - a) * k;
// rosto falando / piscando
function animaRosto(p, T, spk, o = {}) {
  const b = boca(T, spk), pis = (T % (o.piscaP ?? 3.3)) > (o.piscaP ?? 3.3) - (o.piscaD ?? 0.13);
  if (o.medo) p.rosto(b > 0.45 ? 'medoFala' : 'medo');
  else if (o.sorriso) p.rosto(pis ? 'pisca' : 'sorriso');
  else p.rosto(pis ? 'pisca' : b > 0.45 ? 'fala' : 'normal');
}
function viraSuave(p, alvo, k = 1) { const a = Math.atan2(alvo[0] - p.position.x, alvo[2] - p.position.z); p.rotation.y = ang(p.rotation.y, a, k); }
// base de todas as cenas: palco PS1 + posto + mãos do Lucas
function base(T, o = {}) {
  const st = palcoPS1(T, { fov: 66, fogNear: o.fogNear ?? 12, fogFar: o.fogFar ?? 85, neblina: '#03070b' });
  const M = posto(st, o); const mao = maos(); st.camera.add(mao); mao.pose({});
  return { stage: st, M, mao };
}
const TICO_P = () => { const p = pessoa(TICO); const cox = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 5), lam('#d08a3a', { emissive: '#3a1a06' })); cox.rotation.x = Math.PI; cox.position.set(0, -0.06, 0.06); p.bracos.D.mao.add(cox); p.cox = cox; return p; };
// pose do Tico: comendo (k 0..1 leva a coxinha à boca)
function ticoCome(p, k) { p.braco('D', lerp(0.15, 1.15, k), lerp(0.08, 0.35, k), lerp(0.2, 1.9, k)); p.braco('E', 0.25, 0.1, 0.6); }

// ====================== A — rotina da madrugada + o carro na contramão (l01–l04) ======================
registerShot('A', { kind: '3d',
  init(T, info) {
    const s = base(T), L = info.L;
    s.tico = TICO_P(); s.tico.position.set(...LT); s.stage.add(s.tico);
    s.car = carro(); s.stage.add(s.car); s.sp = faiscas(110); s.stage.add(s.sp);
    const t = { caf: W('cafeteira', L.l01), gel: W('geladeira', L.l01), rep: W('repondo', L.l01), tic: W('tico', L.l01), br: W('br', L.l02), duas: W('duas', L.l02), pas: W('passou', L.l03), con: W('contramão', L.l03), arr: W('arrastando', L.l03), t03: L.t03[0], l04: L.l04[0], t02: L.t02[0] };
    s.t = t;
    const P0 = [1.6, OLHO, 7.35], JAN = [1.3, OLHO, 0.6];
    const ilha = [1.6, 0.85, 6.15], caf = [5.55, 1.35, 3.6], gel = [5.15, 1.3, 7.3], tic = [LT[0], 1.55, LT[2]], fora = [0.4, 1.0, -20];
    // carro: entra pela direita (x +) e vai pra esquerda, na pista perto do posto
    s.carX = (tt) => lerp(26, -26, (tt - t.pas + 0.2) / (t.l04 + 1.2 - t.pas));
    s.R = rota([
      [0, { p: P0, m: ilha, f: 62 }],
      [t.caf - 0.5, { p: P0, m: ilha, f: 62 }],
      [t.caf + 0.6, { p: P0, m: caf, f: 46 }],
      [t.gel + 0.6, { p: P0, m: gel, f: 52 }],
      [t.rep + 0.3, { p: P0, m: [1.7, 0.85, 6.1], f: 60 }],
      [t.tic - 0.1, { p: P0, m: [1.7, 0.85, 6.1], f: 60 }],
      [t.tic + 0.9, { p: P0, m: tic, f: 44 }],
      [L.t01[1] + 0.1, { p: P0, m: tic, f: 40 }],
      [L.t01[1] + 0.9, { p: [1.25, OLHO, 5.4], m: [1.0, 1.3, -10], f: 60 }],
      [t.br + 0.8, { p: [0.75, OLHO, 2.6], m: [0.6, 1.1, -18], f: 62 }],
      [t.duas + 0.3, { p: JAN, m: [-2, 0.9, -21], f: 52 }],
      [t.t02 - 0.1, { p: JAN, m: [2, 0.9, -21], f: 50 }],
      [t.t02 + 1.1, { p: JAN, m: [LT[0], 1.5, LT[2]], f: 50 }],
      [L.t02[1] - 0.5, { p: JAN, m: [LT[0], 1.5, LT[2]], f: 48 }],
      [t.pas - 0.3, { p: JAN, m: [14, 1.0, -19], f: 52 }],
      [t.con + 0.2, { p: JAN, m: [s.carX(t.con + 0.4), 0.8, -18.8], f: 46 }],
      [t.arr + 0.2, { p: JAN, m: [s.carX(t.arr + 0.4) - 1, 0.6, -18.8], f: 28 }],
      [L.l03[1] + 0.2, { p: JAN, m: [s.carX(L.l03[1] + 0.4), 0.7, -18.8], f: 40 }],
      [t.t03 + 0.9, { p: JAN, m: [LT[0], 1.5, LT[2]], f: 50 }],
      [L.t03[1] + 0.1, { p: JAN, m: [LT[0], 1.5, LT[2]], f: 48 }],
      [L.l04[1] + 0.3, { p: JAN, m: [-6, 0.6, -19], f: 44 }],
    ]);
    return s;
  },
  draw(s, lt, info) {
    const T = info.globalT, t = s.t, L = info.L, st = s.stage;
    const cam = olhar(st.camera, T, s.R);
    luzesLoja(s.M, T, { pisca: T > t.pas - 1 && T < L.l04[1] ? 1 : 0 }); pinga(s.M, T); s.M.tv.tela('novela', T);
    // mãos repondo bolacha
    const rep = clamp(1 - prog(T, L.t01[1] - 0.4, L.t01[1] + 0.4)) * Math.max(clamp(1 - prog(T, t.caf - 0.6, t.caf)), prog(T, t.rep - 0.4, t.rep + 0.2) * clamp(1 - prog(T, t.tic - 0.2, t.tic + 0.3)));
    const ciclo = Math.sin(T * 2.2);
    s.mao.pose({ D: rep, E: rep * 0.9, bol: true, dz: -0.06 + 0.08 * ciclo, dy: -0.02 + 0.03 * ciclo, rx: 0.6, erx: 0.7, ey: -0.05 });
    // Tico comendo coxinha, depois rindo
    const tic = s.tico, eat = T < L.t01[0] - 0.1 ? 0.5 + 0.5 * Math.sin(T * 1.6) : T < L.t01[1] ? 0.35 + 0.15 * Math.sin(T * 3) : T < L.t02[1] ? 0.25 : 0.1;
    ticoCome(tic, eat); tic.cox.visible = T < L.t02[1];
    viraSuave(tic, [st.camera.position.x, 0, st.camera.position.z]); tic.olhaPara([st.camera.position.x, OLHO, st.camera.position.z]);
    animaRosto(tic, T, 'TICO', { medo: T > t.t03 - 0.1 });
    if (T > t.t03 - 0.1) { tic.braco('D', 0.1, 0.1, 0.3); tic.cox.visible = false; }
    tic.respira(T, T > L.t02[0] && T < L.t02[1] ? 4 : 1);
    if (T > L.t02[0] && T < L.t02[1]) tic.tronco.rotation.x = -0.08 * Math.abs(Math.sin(T * 9));
    else tic.tronco.rotation.x = 0;
    // carro na contramão, sem farol, arrastando algo com faíscas
    const cx = s.carX(T); s.car.position.set(cx + 2.1, 0, -18.8); s.car.visible = cx > -40 && cx < 40; s.car.faisca.intensity = 6 * (0.6 + 0.4 * noise(T * 20, 2));
    s.sp.update(T, (tt) => s.carX(tt) - 0.5, -18.8, t.pas - 0.3, t.l04 + 1.3);
    st.post({ tempo: T, expo: 1.3, vinheta: 0.5 });
  },
});

// ====================== C — a TV: alerta do Ministério da Saúde (tv1–t04) ======================
registerShot('C', { kind: '3d',
  init(T, info) {
    const s = base(T), L = info.L;
    s.tico = TICO_P(); s.tico.position.set(3.85, 0, 2.95); s.stage.add(s.tico); s.tico.cox.visible = false;
    const tvp = [5.33, 2.44, 0.56]; s.tvp = tvp;
    s.t = { gel: W('gel', L.t04), ult: W('última', L.t04) };
    s.R = rota([
      [0, { p: CX, m: [3.9, 1.5, 0.6], f: 60 }],
      [L.tv1[0] + 0.4, { p: CX, m: tvp, f: 44 }],
      [L.tv1[0] + 2.6, { p: CX, m: tvp, f: 24 }],
      [L.tv1[1] - 0.3, { p: CX, m: [tvp[0], tvp[1] - 0.04, tvp[2]], f: 21 }],
      [L.t04[0] + 0.9, { p: CX, m: [3.85, 1.6, 2.95], f: 46 }],
      [L.t04[1] + 0.4, { p: CX, m: [3.85, 1.6, 2.95], f: 40 }],
    ]);
    return s;
  },
  draw(s, lt, info) {
    const T = info.globalT, L = info.L, st = s.stage; olhar(st.camera, T, s.R);
    luzesLoja(s.M, T); pinga(s.M, T);
    s.M.tv.tela(T < L.tv1[0] + 0.05 ? 'novela' : T < L.tv1[0] + 0.55 ? 'estatica' : 'alerta', T);
    const tic = s.tico; tic.vira([2.4, 0, 1.0]);
    if (T < L.t04[0] - 0.2) { tic.olhaPara(s.tvp, 1.3); tic.braco('D', 0.2, 0.1, 0.4); tic.braco('E', 0.2, 0.1, 0.4); }
    else { tic.olhaPara(st.camera.position.toArray()); tic.braco('D', 0.6, 0.15, 1.3); tic.braco('E', 0.1, 0.1, 0.3); }
    animaRosto(tic, T, 'TICO'); tic.respira(T);
    // luz vermelha da TV pulsando na loja
    const red = T > L.tv1[0] + 0.55 ? 0.5 + 0.5 * Math.sin(T * 2.2 * Math.PI) : 0;
    st.post({ tempo: T, expo: 1.3, vinheta: 0.5, flash: [0.05 * red, 0, 0] });
  },
});

// ====================== D — Seu Alberto entra (l05–a02) ======================
registerShot('D', { kind: '3d',
  init(T, info) {
    const s = base(T), L = info.L;
    s.tico = TICO_P(); s.tico.position.set(3.95, 0, 3.0); s.stage.add(s.tico); s.tico.cox.visible = false;
    s.alb = pessoa(ALBERTO); s.stage.add(s.alb);
    s.cafe = new THREE.Group(); s.cafe.add(box(0.08, 0.1, 0.08, lam('#f0ece0'))); s.cafe.add(box(0.07, 0.01, 0.07, lam('#3a2414'), 0, 0.05, 0)); s.stage.add(s.cafe);
    const t = { ent: W('entrou', L.l05), toda: W('toda', L.l05), bra: W('branco', L.l05), sua: W('suando', L.l05), pano: W('pano', L.l05), enc: W('encharcado', L.l05), caf: W('café', L.a01), mor: W('mordeu', L.a01), cid: W('cidade', L.a02), cid2: W('cidade', L.a02, 2), pior: W('pior', L.a02) };
    s.t = t;
    // caminho: lá fora -> porta -> balcão
    s.path = [[t.ent - 1.6, [-0.2, -4.5]], [t.ent - 0.2, [0.0, -0.9]], [t.ent + 0.5, [0.1, 0.5]], [t.toda + 0.9, [2.4, 1.42]]];
    const ROSTO = [2.4, 1.66, 1.42], BRACO = [2.68, 1.15, 1.75];
    s.R = rota([
      [0, { p: CX, m: [0.0, 1.5, 0.2], f: 60 }],
      [t.ent + 0.3, { p: CX, m: [0.05, 1.55, 0.2], f: 56 }],
      [t.toda + 0.9, { p: CX, m: ROSTO, f: 54 }],
      [t.bra + 0.2, { p: CX, m: ROSTO, f: 38 }],
      [t.sua + 0.5, { p: CX, m: ROSTO, f: 30 }],
      [t.pano + 0.5, { p: CX, m: BRACO, f: 34 }],
      [L.l05[1] + 0.2, { p: CX, m: BRACO, f: 30 }],
      [L.a01[0] + 0.6, { p: CX, m: ROSTO, f: 40 }],
      [L.a01[1], { p: CX, m: ROSTO, f: 36 }],
      [L.l06[1], { p: [2.4, OLHO, 2.95], m: ROSTO, f: 36 }],
      [L.a02[1] + 0.4, { p: [2.4, OLHO, 2.95], m: ROSTO, f: 26 }],
    ]);
    return s;
  },
  draw(s, lt, info) {
    const T = info.globalT, L = info.L, t = s.t, st = s.stage; olhar(st.camera, T, s.R);
    luzesLoja(s.M, T); pinga(s.M, T); s.M.tv.tela('alerta', T);
    // porta abre quando ele entra
    s.M.porta.rotation.y = -1.2 * clamp(prog(T, t.ent - 0.7, t.ent - 0.3) - prog(T, t.ent + 0.6, t.ent + 1.4));
    // Alberto andando até o balcão
    const a = s.alb, P = key(T, s.path, ease.linear); a.position.set(P[0], 0, P[1]);
    const anda = T < s.path[3][0];
    if (anda) { const nx = key(T + 0.1, s.path, ease.linear); a.rotation.y = Math.atan2(nx[0] - P[0], nx[1] - P[1]) || a.rotation.y; a.anda(T * 6.5, 0.8); }
    else { a.parado(); a.vira([2.4, 0, 3.2]); a.braco('D', 0.95, 0.05, 0.55); a.braco('E', 0.2, 0.05, 0.3);
      if (T > t.mor - 0.2 && T < L.a01[1] + 0.4) a.braco('D', 1.25, 0.1, 0.9); }
    a.olhaPara(T > t.cid - 0.1 && T < t.pior ? [12, 1.6, -4] : st.camera.position.toArray(), 0.8);
    animaRosto(a, T, 'ALBERTO'); a.respira(T, 3.5);
    // café: Lucas serve (mão direita entra em quadro), depois fica no balcão
    const serve = prog(T, t.caf + 0.3, t.caf + 1.6), cp = key(serve, [[0, [2.55, 0.9, 2.75]], [1, [2.5, 1.11, 1.95]]], ease.inOut);
    s.cafe.position.set(...cp); s.cafe.visible = T > t.caf + 0.3;
    const mk = clamp(prog(T, t.caf + 0.1, t.caf + 0.6) - prog(T, t.caf + 1.7, t.caf + 2.3));
    s.mao.pose({ D: mk, dz: -0.1 * serve, dy: -0.02, rx: 0.4 });
    // Tico olha desconfiado
    const tic = s.tico; tic.vira([2.4, 0, 1.4]); tic.olhaPara(a.position.toArray().map((v, i) => i === 1 ? 1.6 : v)); tic.braco('D', 0.1, 0.1, 0.2); tic.braco('E', 0.1, 0.1, 0.2); animaRosto(tic, T, 'TICO'); tic.respira(T);
    st.post({ tempo: T, expo: 1.3, vinheta: 0.52 });
  },
});

// ====================== E — ele vai embora; dois minutos depois, a batida (l07–t05) ======================
registerShot('E', { kind: '3d',
  init(T, info) {
    const s = base(T), L = info.L;
    s.tico = TICO_P(); s.stage.add(s.tico); s.tico.cox.visible = false;
    s.alb = pessoa(ALBERTO); s.stage.add(s.alb);
    s.cam = caminhao(); s.cam.position.set(3.2, 0, -3.6); s.stage.add(s.cam);
    s.bat = batida([90, 0, -60]); s.stage.add(s.bat);
    const t = { pag: W('pagou', L.l07), emb: W('embora', L.l07), dois: W('dois', L.l07), dep: W('depois', L.l07) };
    t.crash = L.l07[1] + 0.75; t.dip = [t.dep - 0.1, t.dep + 0.6]; s.t = t;
    s.path = [[t.pag + 0.5, [2.4, 1.42]], [t.pag + 1.4, [0.15, 0.5]], [t.pag + 1.9, [0.0, -0.8]], [t.emb + 1.0, [2.7, -2.2]]];
    const JAN = [3.4, OLHO, 0.7], CRASH = [90, 6, -60];
    s.R = rota([
      [0, { p: CX, m: [2.4, 1.2, 1.6], f: 44 }],
      [t.pag + 0.5, { p: CX, m: [2.4, 1.4, 1.5], f: 50 }],
      [t.pag + 1.5, { p: CX, m: [0.2, 1.4, 0.2], f: 56 }],
      [t.emb + 0.9, { p: CX, m: [2.8, 1.5, -2.6], f: 56 }],
      [t.dip[0], { p: CX, m: [8, 1.4, -5], f: 52 }],
      [t.dip[0] + 0.35, { p: JAN, m: CRASH, f: 54 }],
      [t.crash + 0.2, { p: JAN, m: CRASH, f: 50 }],
      [L.t05[0] - 0.1, { p: JAN, m: CRASH, f: 40 }],
      [L.t05[0] + 0.8, { p: JAN, m: [4.32, 1.58, 0.97], f: 52 }],
      [L.t05[1] + 0.2, { p: JAN, m: [4.32, 1.58, 0.97], f: 50 }],
      [L.t05[1] + 1.2, { p: JAN, m: CRASH, f: 42 }],
    ]);
    return s;
  },
  draw(s, lt, info) {
    const T = info.globalT, L = info.L, t = s.t, st = s.stage; const c = olhar(st.camera, T, s.R, { tremor: Math.exp(-Math.max(0, T - t.crash) * 2.5) * (T > t.crash ? 1 : 0) });
    luzesLoja(s.M, T); pinga(s.M, T); s.M.tv.tela('alerta', T);
    const a = s.alb, P = key(T, s.path, ease.linear); a.position.set(P[0], 0, P[1]); a.visible = T < s.path[3][0];
    if (T > s.path[0][0] && T < s.path[3][0]) { const nx = key(T + 0.1, s.path, ease.linear); a.rotation.y = Math.atan2(nx[0] - P[0], nx[1] - P[1]); a.anda(T * 7, 0.9); a.braco('D', 0.9, 0.05, 1.2); }
    else { a.parado(); a.vira([2.4, 0, 3.2]); a.braco('D', 0.6, 0.05, 0.4); a.braco('E', 0.9, 0.05, 0.8); }
    animaRosto(a, T, 'ALBERTO'); a.respira(T, 3);
    s.M.porta.rotation.y = -1.2 * clamp(prog(T, t.pag + 1.2, t.pag + 1.5) - prog(T, t.pag + 2.2, t.pag + 2.9));
    // caminhão: liga e sai pra direita
    const k = prog(T, t.emb + 1.1, t.dip[0] + 0.2), x = 3.2 + 30 * ease.in(k);
    s.cam.position.set(x, 0, -3.6 - 8 * ease.in(k)); s.cam.rotation.y = -0.3 * ease.inOut(k); s.cam.visible = T < t.dip[0] + 0.3;
    // Tico na janela depois do salto de tempo
    const tic = s.tico;
    if (T < t.dip[0] + 0.3) { tic.position.set(3.95, 0, 3.0); tic.vira([2.4, 0, 1.4]); tic.olhaPara([1.0, 1.5, -2]); }
    else { tic.position.set(4.32, 0, 0.97); tic.vira([50, 0, -35]); tic.olhaPara(T > L.t05[0] + 0.4 && T < L.t05[0] + 1.6 ? st.camera.position.toArray() : [90, 6, -60], 1.2); }
    tic.braco('D', 0.1, 0.1, 0.2); tic.braco('E', 0.1, 0.1, 0.2); animaRosto(tic, T, 'TICO', { medo: T > t.crash }); tic.respira(T, T > t.crash ? 3 : 1);
    s.bat.update(T, t.crash, 0);
    const dip = Math.sin(Math.PI * prog(T, t.dip[0] - 0.2, t.dip[1])), fl = T > t.crash ? Math.exp(-(T - t.crash) * 3) : 0;
    st.post({ tempo: T, expo: 1.3, vinheta: 0.52, fade: 0.92 * dip, flash: [0.25 * fl, 0.12 * fl, 0.02 * fl] });
  },
});

// ====================== F — os vultos na beira da luz (l08–t06) ======================
registerShot('F', { kind: '3d',
  init(T, info) {
    const s = base(T), L = info.L;
    s.bat = batida([90, 0, -60]); s.stage.add(s.bat);
    s.vul = []; const R = 5.15;
    [138, 158, 176, 194, 213, 232].forEach((g, i) => { const a = g * Math.PI / 180, v = pessoa({ ...VULTO, alt: 1.85 + (i % 3) * 0.1 }); const x = POSTE[0] + R * Math.cos(a), z = POSTE[1] + R * Math.sin(a); v.position.set(x, 0, z); v.base = [x, z]; v.vira([-3.0, 0, 0.9]); v.braco('D', 0.05, 0.04, 0.05); v.braco('E', 0.05, 0.04, 0.05); v.cab.rotation.z = (i % 2 ? 1 : -1) * 0.12; s.stage.add(v); s.vul.push(v); });
    const t = { fum: W('fumaça', L.l08), vi: W('vi', L.l08), beira: W('beira', L.l08), acaba: W('acaba', L.l08), gente: W('gente', L.l08), olh: W('olhando', L.l08), nen: W('nenhum', L.l08), luz: W('luz', L.l08), lamp: W('lâmpada', L.t06), poste: W('poste', L.t06), qu: W('queimando', L.t06) };
    t.off = t.qu + 0.35; t.volta = L.t06[1] + 0.35; s.t = t;
    const P = [-3.0, OLHO, 0.9], ARC = [-15.1, 1.1, -9.2], UM = [-15.64, 1.7, -8.64], LAMP = [POSTE[0] + 1.0, 4.6, POSTE[1]];
    s.R = rota([
      [0, { p: P, m: [90, 6, -60], f: 50 }],
      [t.vi + 0.2, { p: P, m: [90, 6, -60], f: 46 }],
      [t.beira - 0.2, { p: P, m: [-3, 1.0, -14], f: 60 }],
      [t.acaba + 0.3, { p: P, m: ARC, f: 52 }],
      [t.gente + 0.4, { p: P, m: ARC, f: 30 }],
      [t.olh + 0.6, { p: P, m: UM, f: 17 }],
      [t.nen + 0.2, { p: P, m: UM, f: 17 }],
      [L.l08[1] + 0.2, { p: P, m: [-14.2, 0.6, -9.2], f: 30 }],
      [t.lamp + 0.4, { p: P, m: LAMP, f: 36 }],
      [t.qu, { p: P, m: LAMP, f: 34 }],
      [t.off + 0.4, { p: P, m: ARC, f: 30 }],
      [t.volta + 0.6, { p: P, m: [-14, 1.3, -9.2], f: 26 }],
    ]);
    return s;
  },
  draw(s, lt, info) {
    const T = info.globalT, L = info.L, t = s.t, st = s.stage; olhar(st.camera, T, s.R, { resp: 1.3 });
    luzesLoja(s.M, T); s.M.tv.tela('alerta', T);
    s.bat.update(T, T - 60, 0.8);
    // poste: pisca, apaga em "queimando", volta um instante (eles deram um passo)
    let k = 1;
    if (T > t.lamp && T < t.off) k = noise(T * 13, 4) > -0.25 + 0.5 * prog(T, t.lamp, t.off) ? 1 : 0;
    if (T >= t.off) k = (T > t.volta && T < t.volta + 0.3) || (T > t.volta + 0.45 && T < t.volta + 0.6) ? 1 : 0;
    s.M.poste(k);
    const passo = T > t.off + 0.4 ? 1 : 0;
    s.vul.forEach((v, i) => { const [x, z] = v.base, dx = -3.0 - x, dz = 0.9 - z, d = Math.hypot(dx, dz); v.position.set(x + dx / d * 0.9 * passo, 0, z + dz / d * 0.9 * passo); v.respira(T + i, 0.4); v.cab.rotation.y = 0; });
    st.post({ tempo: T, expo: 1.35, vinheta: 0.55 });
  },
});

// ====================== G — uma hora depois: o "Alberto" no vidro (l09–t07) ======================
registerShot('G', { kind: '3d',
  init(T, info) {
    const s = base(T), L = info.L;
    s.tico = TICO_P(); s.tico.position.set(3.9, 0, 3.0); s.stage.add(s.tico); s.tico.cox.visible = false;
    s.mim = pessoa(MIMICO); s.mim.position.set(0.05, 0, -0.42); s.mim.rotation.y = 0; s.stage.add(s.mim);
    const t = { bat: W('bateram', L.l09), era: W('era', L.l09), int: W('inteiro', L.l09), sem: W('sangue', L.l09), cur: W('curativo', L.l09), acr: W('acredita', L.a03), pal: W('palavra', L.l10), pau: W('pausa', L.l10), mes: W('acredita', L.l10) };
    s.t = t;
    const ROSTO = [0.05, 1.67, -0.36], BRACO = [0.28, 1.42, -0.3];
    s.R = rota([
      [0, { p: CX, m: [2.6, 1.0, 1.9], f: 56 }],
      [t.bat + 0.05, { p: CX, m: [2.6, 1.0, 1.9], f: 56 }],
      [t.bat + 0.55, { p: CX, m: [0.1, 1.6, -0.3], f: 58 }],
      [t.era + 0.2, { p: CX, m: ROSTO, f: 50 }],
      [t.int + 0.3, { p: CX, m: ROSTO, f: 26 }],
      [t.sem + 0.1, { p: CX, m: BRACO, f: 28 }],
      [t.cur + 0.5, { p: CX, m: BRACO, f: 26 }],
      [L.a03[0] + 0.3, { p: CX, m: ROSTO, f: 22 }],
      [L.a03[1], { p: CX, m: ROSTO, f: 13 }],
      [L.l10[1], { p: [2.35, OLHO, 2.95], m: ROSTO, f: 9.5 }],
      [L.t07[0] + 0.8, { p: CX, m: [3.9, 1.55, 3.0], f: 52 }],
      [L.t07[1] - 0.2, { p: CX, m: [3.9, 1.55, 3.0], f: 48 }],
      [L.t07[1] + 0.7, { p: CX, m: ROSTO, f: 30 }],
    ]);
    return s;
  },
  draw(s, lt, info) {
    const T = info.globalT, L = info.L, t = s.t, st = s.stage; olhar(st.camera, T, s.R, { resp: 1.2, tremor: T > t.bat && T < t.bat + 0.4 ? 0.6 : 0 });
    luzesLoja(s.M, T, { pisca: T > L.a03[1] ? 1 : 0 }); pinga(s.M, T); s.M.tv.tela('alerta', T);
    const m = s.mim;
    // bate no vidro (3 batidas a partir de "bateram"), depois a mão espalmada no vidro
    const kb = T - t.bat + 0.15; const bate = kb > 0 && kb < 0.95 ? Math.abs(Math.sin(kb / 0.38 * Math.PI)) : 0;
    if (T < t.int) m.braco('D', 1.5 - 0.25 * bate, 0.1, 0.9 - 0.4 * bate); else m.braco('D', 1.45, 0.12, 0.35);
    m.braco('E', 0.05, 0.05, 0.1);
    // olhos parados; uma piscada lenta; cabeça inclina devagar
    const piscaLenta = T > t.acr - 0.2 && T < t.acr + 0.6;
    m.rosto(piscaLenta ? 'pisca' : 'sorriso');
    m.cab.rotation.z = -0.22 * ease.inOut(prog(T, t.pal, L.l10[1] + 0.5)); m.cab.rotation.y = 0; m.cab.rotation.x = 0;
    m.respira(T, 0);
    const tic = s.tico; tic.vira([0, 0, -0.4]); tic.olhaPara(T > L.t07[0] && T < L.t07[1] + 0.2 ? st.camera.position.toArray() : [0.05, 1.67, -0.4]);
    const recua = prog(T, L.l10[0], L.t07[0]); tic.position.set(3.9 + 0.5 * recua, 0, 3.0 + 0.4 * recua);
    tic.braco('D', 0.5, 0.15, 1.1); tic.braco('E', 0.5, 0.15, 1.1); animaRosto(tic, T, 'TICO', { medo: true }); tic.respira(T, 3);
    st.post({ tempo: T, expo: 1.3, vinheta: 0.55 + 0.1 * prog(T, L.a03[0], L.l10[1]) });
  },
});

// ====================== H — o cadeado, a voz no estoque, o Tico do lado (l11–l12) — termina em CORTE SECO ======================
registerShot('H', { kind: '3d',
  init(T, info) {
    const s = base(T), L = info.L;
    s.mim = pessoa(MIMICO); s.mim.position.set(0.05, 0, -0.42); s.mim.braco('D', 1.45, 0.12, 0.35); s.mim.rosto('sorriso'); s.mim.cab.rotation.z = -0.22; s.stage.add(s.mim);
    s.tico = pessoa(TICO_PALIDO); s.tico.position.set(-2.4, 0, 9.15); s.stage.add(s.tico);
    s.falso = pessoa({ ...TICO_PALIDO, pele: '#9a9a96', sombra: '#6a6a66' }); s.falso.position.set(-4.62, 0, 13.0); s.falso.rotation.y = Math.PI; s.falso.rosto('sorriso'); s.stage.add(s.falso);
    const lf = new THREE.PointLight(new THREE.Color('#8aa6c0'), 0.9, 2.6, 1.5); lf.position.set(-4.5, 1.9, 12.9); s.stage.add(lf);
    const t = { cor: W('corri', L.l11), cad: W('cadeado', L.l11), est: W('estoque', L.l11), ouv: W('ouvi', L.l11), tic: W('tico', L.l12), lado: W('lado', L.l12) };
    t.abre = L.l12[1] - 0.2; t.fim = info.shot.end; s.t = t;
    const P0 = CX, P1 = [0.6, OLHO, 2.55], P2 = [-1.8, OLHO, 2.0], P3 = [-1.8, OLHO, 7.6], P4 = [-3.3, OLHO, 8.25];
    const BOARD = [-3.3, 1.42, 9.97], PORTA = [-4.55, 1.35, 10.1], TIC = [-2.4, 1.66, 9.15];
    const r0 = t.cor - 0.1, r1 = t.cad + 0.5;
    const seg = (a, b) => Math.hypot(b[0] - a[0], b[2] - a[2]); const d = [seg(P0, P1), seg(P1, P2), seg(P2, P3), seg(P3, P4)], tot = d.reduce((x, y) => x + y);
    let acc = 0; const tk = d.map(x => (acc += x, r0 + 0.3 + (r1 - r0 - 0.3) * acc / tot));
    s.R = rota([
      [0, { p: P0, m: [0.1, 1.6, -0.3], f: 40 }],
      [r0, { p: P0, m: [0.1, 1.6, -0.3], f: 50 }],
      [r0 + 0.3, { p: P0, m: [-1.0, 1.4, 2.4], f: 66 }],
      [tk[0], { p: P1, m: [-2.4, 1.4, 2.3], f: 68 }],
      [tk[1], { p: P2, m: [-1.8, 1.4, 6], f: 68 }],
      [tk[2], { p: P3, m: [-3.3, 1.4, 9.9], f: 68 }],
      [tk[3], { p: P4, m: BOARD, f: 64 }],
      [t.ouv - 0.1, { p: P4, m: BOARD, f: 56 }],
      [t.ouv + 0.6, { p: P4, m: [-4.2, 1.3, 10.3], f: 50 }],
      [L.t08[1], { p: [-3.4, OLHO, 8.4], m: [-4.2, 1.3, 10.3], f: 34 }],
      [t.tic + 0.1, { p: [-3.4, OLHO, 8.4], m: [-4.2, 1.3, 10.3], f: 34 }],
      [t.lado - 0.1, { p: [-3.35, OLHO, 8.3], m: TIC, f: 46 }],
      [t.abre, { p: [-3.35, OLHO, 8.3], m: TIC, f: 40 }],
      [t.abre + 0.75, { p: [-3.9, OLHO, 8.35], m: [-4.6, 1.5, 11.5], f: 48 }],
      [t.fim, { p: [-3.95, OLHO, 8.4], m: [-4.62, 1.62, 13.0], f: 32 }],
    ]);
    return s;
  },
  draw(s, lt, info) {
    const T = info.globalT, L = info.L, t = s.t, st = s.stage; olhar(st.camera, T, s.R, { resp: 1.4, tremor: T > t.abre + 0.5 ? 0.4 : 0 });
    luzesLoja(s.M, T, { pisca: 1 }); s.M.tv.tela('alerta', T);
    // pega o cadeado
    const pega = prog(T, t.cad + 0.35, t.cad + 0.85), segura = T > t.cad + 0.85;
    const kD = clamp(prog(T, t.cad + 0.2, t.cad + 0.6) - prog(T, t.ouv + 0.6, t.ouv + 1.2) + (segura ? 0 : 0));
    s.mao.pose({ D: kD, cad: segura, dz: -0.2 * Math.sin(Math.PI * pega), dy: 0.05 * Math.sin(Math.PI * pega), rx: 0.2 });
    s.M.cadeado.visible = !segura;
    // porta do estoque entreaberta; abre sozinha no fim
    s.M.portaEstoque.rotation.y = -0.6 - 0.95 * ease.out(prog(T, t.abre + 0.25, t.abre + 1.2));
    // Tico ao lado: só aparece quando o Lucas vira (ele estava ali o tempo todo)
    const tic = s.tico; tic.visible = T > t.tic - 0.3; tic.vira(T < t.abre ? [-3.35, 0, 8.3] : [-4.55, 0, 10.1]);
    tic.olhaPara(T > t.tic + 0.4 && T < t.abre ? st.camera.position.toArray() : [-4.55, 1.3, 10.4], 1.0);
    tic.rosto(T > t.lado + 0.2 && T < t.abre ? 'medo' : 'medo'); tic.braco('D', 0.3, 0.1, 0.5); tic.braco('E', 0.3, 0.1, 0.5); tic.respira(T, 4);
    tic.cab.rotation.z = 0.03 * Math.sin(T * 23);
    s.falso.olhaPara([-3.95, OLHO, 8.4]); s.falso.braco('D', 0.02, 0.03, 0); s.falso.braco('E', 0.02, 0.03, 0);
    st.post({ tempo: T, expo: 1.3, vinheta: 0.6 + 0.15 * prog(T, L.t08[0], L.t08[1]) });
  },
});

// ====================== T — título (depois do corte seco no preto) ======================
let PIX = null;
registerShot('T', { draw(g, t, info) {
  g.fillStyle = '#000'; g.fillRect(0, 0, E.W, E.H);
  if (t < 0.45) return;
  const k = t - 0.45, on = k > 0.5 || (k > 0.08 && k < 0.16) || (k > 0.28 && k < 0.36);
  if (!PIX) { PIX = document.createElement('canvas'); PIX.width = 180; PIX.height = 320; }
  const p = PIX.getContext('2d'); p.clearRect(0, 0, 180, 320);
  p.textAlign = 'center'; p.textBaseline = 'middle';
  if (on) {
    p.fillStyle = '#d6f2e2'; p.font = '22px Anton'; p.fillText('TURNO DA', 90, 130); p.font = '27px Anton'; p.fillText('MADRUGADA', 90, 158);
    p.fillStyle = '#2f8a7a'; p.fillRect(40, 176, 100, 2);
  }
  if (k > 0.7) { p.globalAlpha = clamp((k - 0.7) / 0.3); p.fillStyle = '#ffb04a'; p.font = '10px Anton'; p.fillText('EP. 1 — O ÚLTIMO CAFÉ', 90, 192); p.globalAlpha = 1; }
  g.save(); g.imageSmoothingEnabled = false;
  if (on) glow(g, 540, 870, 480, '#2f8a7a', 0.18 + 0.05 * Math.sin(t * 9));
  g.drawImage(PIX, 0, 0, 1080, 1920);
  g.restore();
}});

// ====================== Kc — segue a página ======================
registerShot('Kc', { draw(g, t) { UI.seguir(g, t, { proximo: 'EP. 2' }); } });
