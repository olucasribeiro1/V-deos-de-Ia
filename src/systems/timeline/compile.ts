/**
 * COMPILADOR DO ROTEIRO DE AÇÕES → trilhas por frame (câmera, mãos, props, estado do cenário, áudio).
 * Puro TypeScript (sem React), determinístico. Também produz um RELATÓRIO DE TIMING (erros/avisos).
 *
 * Regras de naturalidade embutidas (para não parecer robótico):
 *  - caminhada: aceleração/desaceleração, cabeça antecipa a curva (olha antes de virar), olhares laterais ocasionais;
 *  - olhar: movimento rápido + leve overshoot + acomodação (como olho/cabeça humanos);
 *  - susto: giro brusco, tremor, pico de tensão que decai lentamente (respiração acelerada);
 *  - canais independentes (posição, olhar, mãos): a ação mais recente num canal "corta" a anterior.
 */
import {HP, type HandPose} from '../animation/handPoses';
import {type Key, sample} from './keys';
import {clamp, easeInOut, easeOut, hash} from '../animation/math';
import {LOOKS, SPOTS, navPath, type SpotName} from '../../components/environments/apartmentData';
import type {PovKey, Shake} from '../camera/pov';
import {EYE_HEIGHT} from '../camera/pov';
import type {Action, Episode, NarrationManifest, PropName, Scene, SfxManifest, Target} from './script';
import {lineId} from './script';
import type {ApartmentState} from '../../components/environments/Apartment';
import type {PhoneScreen} from '../../components/props/Phone';
import type {ActorTrack} from '../../components/characters/Actor';

const lin = (x: number) => x;
const PACE = {slow: 0.75, walk: 1.25, brisk: 1.7, run: 3.6};
const CHARS_PER_SEC = 14; // estimativa só quando o áudio ainda não existe

class Channel<T> {
  keys: Key<T>[];
  constructor(v: T) {
    this.keys = [{t: 0, v}];
  }
  at(t: number) {
    return sample(this.keys, t);
  }
  /** Corta tudo após t e fixa o valor atual em t (início de uma nova ação no canal). */
  cut(t: number) {
    const v = this.at(t);
    this.keys = this.keys.filter((k) => k.t < t);
    this.keys.push({t, v, ease: lin});
    return v;
  }
  to(t: number, v: T, ease: (x: number) => number = easeInOut) {
    this.keys.push({t, v, ease});
  }
  end() {
    return this.keys[this.keys.length - 1].t;
  }
}

type View = {yaw: number; pitch: number};
type Pos = {x: number; z: number; h: number};

export type CompiledScene = {
  id: string;
  title: string;
  scene: Scene;
  start: number; // frame inicial no episódio
  frames: number;
  pov: (t: number) => PovKey;
  shakes: Shake[];
  handR: (t: number) => HandPose;
  handL: (t: number) => HandPose;
  propR: {t: number; v: PropName}[];
  propL: {t: number; v: PropName}[];
  phone: {t: number; v: PhoneScreen}[];
  env: (t: number) => ApartmentState;
  fade: (t: number) => number;
  danger: (t: number) => number;
  lens: (t: number) => number;
  titles: {t: number; dur: number; text: string}[];
  actors: ActorTrack[];
  lines: {id: string; v: string; text: string; file?: string; t: number; dur: number; estimated: boolean}[];
  sfx: {t: number; id: string; vol: number; loop?: number}[];
  issues: {level: 'erro' | 'aviso'; msg: string}[];
};

export type CompiledEpisode = {episode: Episode; scenes: CompiledScene[]; totalFrames: number; issues: CompiledScene['issues']};

function targetToPoint(target: Target): [number, number, number] | null {
  if (Array.isArray(target)) return target as [number, number, number];
  if (typeof target === 'string') return LOOKS[target] as unknown as [number, number, number];
  return null;
}

/** Converte alvo em yaw/pitch a partir da posição; escolhe o giro mais curto. */
function viewFor(target: Target, pos: Pos, curYaw: number): View {
  const p = targetToPoint(target);
  let yaw: number;
  let pitch: number;
  if (p) {
    const dx = p[0] - pos.x;
    const dz = p[2] - pos.z;
    const dy = p[1] - pos.h;
    yaw = (Math.atan2(-dx, -dz) * 180) / Math.PI;
    pitch = (Math.atan2(dy, Math.hypot(dx, dz)) * 180) / Math.PI;
  } else {
    const o = target as {yaw?: number; pitch?: number; rel?: boolean};
    yaw = o.rel ? curYaw + (o.yaw ?? 0) : o.yaw ?? curYaw;
    pitch = o.pitch ?? 0;
  }
  yaw += 360 * Math.round((curYaw - yaw) / 360);
  return {yaw, pitch: clamp(pitch, -70, 60)};
}

/** Olhar natural: 75% do giro rápido, overshoot leve, acomodação. */
function addLook(view: Channel<View>, t0: number, from: View, to: View, dur: number) {
  const d = to.yaw - from.yaw;
  const over = clamp(Math.abs(d) / 90) * 3 * Math.sign(d);
  view.to(t0 + dur * 0.62, {yaw: to.yaw + over, pitch: to.pitch + (to.pitch - from.pitch) * 0.04}, easeOut);
  view.to(t0 + dur, to, easeInOut);
}

export function compileEpisode(ep: Episode, narr: NarrationManifest = {}, sfxMan: SfxManifest = {}, fps = 24): CompiledEpisode {
  const scenes: CompiledScene[] = [];
  let cursor = 0;
  for (const sc of ep.scenes) {
    const c = compileScene(ep, sc, narr, sfxMan, fps);
    c.start = cursor;
    cursor += c.frames;
    scenes.push(c);
  }
  return {episode: ep, scenes, totalFrames: cursor, issues: scenes.flatMap((s) => s.issues.map((i) => ({...i, msg: `[${s.id}] ${i.msg}`})))};
}

export function compileScene(ep: Episode, sc: Scene, narr: NarrationManifest, sfxMan: SfxManifest, fps: number): CompiledScene {
  const issues: CompiledScene['issues'] = [];
  const startSpot = SPOTS[sc.start.spot];
  const startPos: Pos = {x: startSpot.x, z: startSpot.z, h: sc.start.h ?? EYE_HEIGHT};
  const pos = new Channel<Pos>(startPos);
  const view = new Channel<View>(viewFor(sc.start.look, startPos, 0));
  const tension = new Channel<number>(sc.start.tension ?? 0);
  const fov = new Channel<number>(62);
  const fade = new Channel<number>(0);
  const danger = new Channel<number>(0);
  const lens = new Channel<number>(0);
  const handR = new Channel<HandPose>(HP[sc.hands?.r ?? 'hidden']);
  const handL = new Channel<HandPose>(HP[sc.hands?.l ?? 'hidden']);
  const propR = [{t: 0, v: sc.hands?.rProp ?? ('none' as PropName)}];
  const propL = [{t: 0, v: sc.hands?.lProp ?? ('none' as PropName)}];
  const phone: {t: number; v: PhoneScreen}[] = [{t: 0, v: sc.phone ?? {kind: 'off'}}];
  const envNum = new Map<string, Channel<number>>();
  const envDisc: {t: number; v: Partial<ApartmentState>}[] = [{t: 0, v: {...(sc.state ?? {})}}];
  for (const [k, v] of Object.entries(sc.state ?? {})) if (typeof v === 'number') envNum.set(k, new Channel<number>(v));
  const shakes: Shake[] = [];
  const titles: CompiledScene['titles'] = [];
  const actors: ActorTrack[] = [];
  const lines: CompiledScene['lines'] = [];
  const sfx: CompiledScene['sfx'] = [];
  let spot: SpotName = sc.start.spot;

  let t = 0;
  sc.beats.forEach((beat, bi) => {
    const beatStart = t;
    let beatEnd = beatStart + (beat.min ?? 0);
    if (beat.line) {
      const id = lineId(sc.id, bi);
      const m = narr[id];
      const dur = m ? m.dur : beat.line.text.length / CHARS_PER_SEC + 0.4;
      if (!m) issues.push({level: 'aviso', msg: `fala ${id} sem áudio gerado (duração estimada ${dur.toFixed(1)}s)`});
      const lt = beatStart + (beat.line.at ?? 0.25);
      lines.push({id, v: beat.line.v, text: beat.line.text, file: m?.file, t: lt, dur, estimated: !m});
      beatEnd = Math.max(beatEnd, lt + dur + (beat.pad ?? 0.5));
    }
    const actions = [...(beat.do ?? [])].sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
    for (const act of actions) {
      const a0 = beatStart + (act.at ?? 0);
      const end = applyAction(act, a0);
      beatEnd = Math.max(beatEnd, end);
    }
    t = beatEnd;
  });

  function applyAction(act: Action, a0: number): number {
    switch (act.a) {
      case 'walk': {
        const route = navPath(spot, act.to);
        const pts = route.map((n) => SPOTS[n]);
        const speed = PACE[act.pace ?? 'walk'];
        const segLens = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.z - pts[i].z));
        const total = segLens.reduce((x, y) => x + y, 0);
        if (total < 0.01) return a0;
        const accel = 0.45; // s para acelerar/frear
        const dur = total / speed + accel;
        const h = pos.cut(a0).h;
        const v0 = view.cut(a0);
        const pointAt = (s: number) => {
          let d = s * total;
          for (let i = 0; i < segLens.length; i++) {
            if (d <= segLens[i] || i === segLens.length - 1) {
              const k = segLens[i] ? clamp(d / segLens[i]) : 1;
              return {x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, z: pts[i].z + (pts[i + 1].z - pts[i].z) * k};
            }
            d -= segLens[i];
          }
          return pts[pts.length - 1];
        };
        // perfil de velocidade suave (ease in/out só nas pontas, constante no meio)
        const ramp = accel / dur;
        const sAt = (u: number) => {
          const a = ramp;
          const area = 1 - a; // integral normalizada
          if (u < a) return (u * u) / (2 * a) / area;
          if (u > 1 - a) return (1 - a / 2 - (1 - u) ** 2 / (2 * a)) / area;
          return (u - a / 2) / area;
        };
        const N = Math.max(4, Math.ceil(dur / 0.2));
        let lastYaw = v0.yaw;
        const freeLook = act.look === undefined;
        // antecipação: a cabeça vira para a direção do caminho antes de andar
        if (freeLook) {
          const p1 = pointAt(0.05 + 0.4 / total);
          const ahead = viewFor([p1.x, h - 0.15, p1.z], {x: pts[0].x, z: pts[0].z, h}, v0.yaw);
          addLook(view, a0, v0, ahead, 0.4);
          lastYaw = ahead.yaw;
        } else {
          addLook(view, a0, v0, viewFor(act.look!, {x: pts[0].x, z: pts[0].z, h}, v0.yaw), 0.6);
        }
        const seed = hash(a0 * 13.7);
        for (let i = 1; i <= N; i++) {
          const u = i / N;
          const tt = a0 + 0.25 + u * (dur - 0.25);
          const p = pointAt(clamp(sAt(u)));
          pos.to(tt, {x: p.x, z: p.z, h}, lin);
          if (freeLook && tt > a0 + 0.45) {
            // olhar segue o caminho ~0,7 m à frente (antecipa curvas)
            const ahead = pointAt(clamp(sAt(u) + 0.7 / total));
            if (Math.hypot(ahead.x - p.x, ahead.z - p.z) > 0.15) {
              const vv = viewFor([ahead.x, h - 0.25, ahead.z], {x: p.x, z: p.z, h}, lastYaw);
              // olhares laterais ocasionais (procura/curiosidade), determinísticos
              const glance = Math.sin(u * 6.3 + seed * 20) > 0.93 ? 18 * Math.sign(seed - 0.5) : 0;
              lastYaw = vv.yaw;
              view.to(tt, {yaw: vv.yaw + glance, pitch: vv.pitch}, lin);
            }
          }
        }
        const endT = a0 + dur;
        if (act.arrive) {
          const last = pts[pts.length - 1];
          const cur = view.at(endT);
          addLook(view, view.end(), cur, viewFor(act.arrive, {x: last.x, z: last.z, h}, cur.yaw), 0.8);
        }
        spot = act.to;
        return endT;
      }
      case 'look': {
        const dur = act.dur ?? 0.9;
        const v0 = view.cut(a0);
        addLook(view, a0, v0, viewFor(act.target, pos.at(a0), v0.yaw), dur);
        return a0 + dur;
      }
      case 'glance': {
        const dur = act.dur ?? 0.55;
        const hold = act.hold ?? 0.8;
        const v0 = view.cut(a0);
        addLook(view, a0, v0, viewFor(act.target, pos.at(a0), v0.yaw), dur);
        view.to(a0 + dur + hold, view.at(a0 + dur), lin);
        addLook(view, a0 + dur + hold, view.at(a0 + dur), v0, dur * 1.2);
        return a0 + dur * 2.2 + hold;
      }
      case 'startle': {
        const amp = act.amp ?? 1;
        if (act.target) {
          const v0 = view.cut(a0);
          addLook(view, a0, v0, viewFor(act.target, pos.at(a0), v0.yaw), 0.32);
        }
        shakes.push({t: a0, dur: 0.6, amp: 2.2 * amp, freq: 22});
        tension.cut(a0);
        tension.to(a0 + 0.2, 1, easeOut);
        tension.to(a0 + 6, 0.55, easeInOut);
        return a0 + 0.6;
      }
      case 'scan': {
        const dur = act.dur ?? 3;
        const v0 = view.cut(a0);
        const p = pos.at(a0);
        const va = viewFor(act.from, p, v0.yaw);
        const vb = viewFor(act.to, p, va.yaw);
        addLook(view, a0, v0, va, 0.7);
        view.to(a0 + 0.7 + dur * 0.15, va, lin);
        view.to(a0 + 0.7 + dur, vb, easeInOut);
        return a0 + 0.7 + dur;
      }
      case 'height': {
        const dur = act.dur ?? 0.8;
        const p = pos.cut(a0);
        pos.to(a0 + dur, {...p, h: act.h});
        return a0 + dur;
      }
      case 'tension': {
        const dur = act.dur ?? 1.5;
        tension.cut(a0);
        tension.to(a0 + dur, act.v);
        return a0;
      }
      case 'hands': {
        const dur = act.dur ?? 0.6;
        if (act.r) {
          handR.cut(a0);
          handR.to(a0 + dur, HP[act.r]);
        }
        if (act.l) {
          handL.cut(a0);
          handL.to(a0 + dur, HP[act.l]);
        }
        return a0 + dur;
      }
      case 'prop':
        if (act.r) propR.push({t: a0, v: act.r});
        if (act.l) propL.push({t: a0, v: act.l});
        return a0;
      case 'phone':
        phone.push({t: a0, v: act.screen});
        return a0;
      case 'set': {
        const dur = act.dur ?? 0;
        const disc: Partial<ApartmentState> = {};
        for (const [k, v] of Object.entries(act.state)) {
          if (typeof v === 'number') {
            let ch = envNum.get(k);
            if (!ch) envNum.set(k, (ch = new Channel<number>(v)));
            ch.cut(a0);
            ch.to(a0 + Math.max(0.001, dur), v);
          } else (disc as any)[k] = v;
        }
        if (Object.keys(disc).length) envDisc.push({t: a0, v: disc});
        return a0 + dur;
      }
      case 'sfx':
        if (!sfxMan[act.id]) issues.push({level: 'erro', msg: `SFX "${act.id}" não existe na biblioteca`});
        sfx.push({t: a0, id: act.id, vol: act.vol ?? 1, loop: act.loop});
        return a0;
      case 'fov': {
        const dur = act.dur ?? 0.5;
        fov.cut(a0);
        fov.to(a0 + dur, act.v);
        return a0 + dur;
      }
      case 'shake':
        shakes.push({t: a0, dur: act.dur ?? 0.5, amp: act.amp, freq: act.freq});
        return a0;
      case 'actor': {
        const shift = (x: number) => x + a0;
        actors.push({...act.track, until: act.track.until === undefined ? undefined : act.track.until + a0, path: act.track.path.map(([tt, x, z]) => [shift(tt), x, z]), clips: act.track.clips.map(([tt, n, k]) => [shift(tt), n, k])});
        return a0;
      }
      case 'fade': {
        const dur = act.dur ?? 1;
        fade.cut(a0);
        fade.to(a0 + dur, act.v);
        return a0 + dur;
      }
      case 'danger': {
        const dur = act.dur ?? 0.8;
        danger.cut(a0);
        danger.to(a0 + dur, act.v);
        return a0;
      }
      case 'lens': {
        const dur = act.dur ?? 0.35;
        lens.cut(a0);
        lens.to(a0 + dur, act.v);
        return a0 + dur;
      }
      case 'title':
        titles.push({t: a0, dur: act.dur ?? 3, text: act.text});
        return a0 + (act.dur ?? 3);
    }
  }

  const totalT = Math.max(t, 1);
  const frames = Math.ceil(totalT * fps);

  // ---- verificação de timing (garantia 5) ----
  const sorted = [...lines].sort((a, b) => a.t - b.t);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    if (sorted[i].t < prev.t + prev.dur - 0.05) issues.push({level: 'erro', msg: `falas sobrepostas: ${prev.id} e ${sorted[i].id}`});
    const gap = sorted[i].t - (prev.t + prev.dur);
    if (gap > 12) issues.push({level: 'aviso', msg: `${gap.toFixed(1)}s sem fala entre ${prev.id} e ${sorted[i].id} (verifique ritmo/retenção)`});
  }
  for (const l of lines) if (l.t + l.dur > totalT + 0.01) issues.push({level: 'erro', msg: `fala ${l.id} termina depois do fim da cena`});
  for (const s of sfx) if (s.t > totalT) issues.push({level: 'erro', msg: `SFX ${s.id} após o fim da cena`});
  if (sc.start.spot !== 'peephole') {
    // câmera não pode atravessar paredes: posições sempre sobre o grafo de navegação (garantido por navPath)
  }

  const envAt = (tt: number): ApartmentState => {
    const out: any = {};
    for (const e of envDisc) if (e.t <= tt) Object.assign(out, e.v);
    for (const [k, ch] of envNum) out[k] = ch.at(tt);
    return out;
  };

  return {
    id: sc.id,
    title: sc.title,
    scene: sc,
    start: 0,
    frames,
    pov: (tt) => {
      const p = pos.at(tt);
      const v = view.at(tt);
      return {x: p.x, z: p.z, h: p.h, yaw: v.yaw, pitch: v.pitch, tension: tension.at(tt), fov: fov.at(tt)};
    },
    shakes,
    handR: (tt) => handR.at(tt),
    handL: (tt) => handL.at(tt),
    propR,
    propL,
    phone,
    env: envAt,
    fade: (tt) => fade.at(tt),
    danger: (tt) => danger.at(tt),
    lens: (tt) => lens.at(tt),
    titles,
    actors,
    lines,
    sfx,
    issues,
  };
}

/** Último evento com t <= agora. */
export function eventAt<T>(events: {t: number; v: T}[], t: number): {v: T; since: number} {
  let cur = events[0];
  for (const e of events) if (e.t <= t) cur = e;
  return {v: cur.v, since: t - cur.t};
}
