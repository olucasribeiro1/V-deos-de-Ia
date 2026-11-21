import type {Episode} from '../../systems/timeline/script.ts';
import {VOICES} from '../voices.ts';

/**
 * EPISÓDIO 01 — AS PRIMEIRAS 2 HORAS (série "hora a hora")
 * Estilo de fala: o PROTAGONISTA fala por si (1ª pessoa, presente, coloquial), conversa com o Rafael
 * pelo telefone e com o vizinho através da porta. Sem narrador de audiolivro.
 * Marcações de emoção em inglês entre colchetes (eleven_v3): [sighs], [whispers], [nervous laugh]...
 */
const NEIGHBOR = {id: 'vizinho_304', height: 1.77, build: 1.05, skin: '#e0b090', hair: '#2a2420', hairStyle: 'short', top: '#8a3a32', topStyle: 'shirt', bottom: '#2f3d52', shoes: '#3a2a1a'} as const;
const NEIGHBOR_INF = {...NEIGHBOR, id: 'inf_porta', skin: '#b9b0a0', infected: {decay: 0.25, blood: 0.8, eyes: '#d0c890'}} as const;
const CIVIL = {id: 'civil_a', height: 1.68, build: 0.95, skin: '#c99a7a', hair: '#1a1410', hairStyle: 'long', top: '#7a3b3b', topStyle: 'shirt', bottom: '#2f3540', shoes: '#ddd'} as const;
const CIVIL_B = {id: 'civil_b', height: 1.78, build: 1.1, skin: '#8d5f45', hair: '#111', hairStyle: 'buzz', top: '#3a4a5a', topStyle: 'hoodie', bottom: '#4a4a44', shoes: '#222'} as const;
const INF_AGR = {id: 'inf_agr', height: 1.83, build: 1.18, skin: '#9aa58e', hair: '#111', hairStyle: 'buzz', top: '#2c2f33', topStyle: 'hoodie', bottom: '#2a2a2a', shoes: '#111', infected: {decay: 0.4, blood: 0.9, eyes: '#e05a3a'}} as const;
const STREET = -8.4;

export const episode: Episode = {
  id: 'ep01',
  title: 'As Primeiras 2 Horas',
  series: 'hora-a-hora',
  voices: VOICES,
  scenes: [
    // ───────────────────────── 0. GANCHO (cold open) — só áudio já existente (ref) ─────────────────────────
    {
      id: 's00',
      title: 'Gancho: a porta',
      set: 'apartment',
      light: 'night',
      chaos: 0.85,
      ambience: [{id: 'room_tone', vol: 0.3}],
      music: [{id: 'music_action', vol: 0.2, at: 0, fadeIn: 0.3}],
      start: {spot: 'barricade', look: [2.75, 0.45, -0.1], tension: 0.95},
      state: {bagAt: 'bedroom', lightsOn: 0.15, blinds: 1, supplies: 1, entranceLocks: 2, chain: true, barricade: 1, entranceShake: 1},
      hands: {r: 'pushLow', l: 'pushLow'},
      beats: [
        {
          line: {v: 'protagonista', ref: 's07_b03', text: '[straining, panting] Segura... segura!', at: 0.6},
          pad: 0.2,
          do: [
            {a: 'sfx', at: 0.1, id: 'door_bang', vol: 1},
            {a: 'shake', at: 0.15, amp: 1.4, dur: 0.6},
            {a: 'danger', at: 0.1, v: 0.45, dur: 0.3},
            {a: 'sfx', at: 0.8, id: 'heartbeat', vol: 0.6},
          ],
        },
        {
          line: {v: 'protagonista', ref: 's07_b04', text: '[horrified, breathless] Isso não é gente. [whispers] Gente não faz esse som.', at: 0.5},
          pad: 0.1,
          do: [
            {a: 'sfx', at: 0, id: 'zombie_growl', vol: 0.9},
            {a: 'sfx', at: 0.9, id: 'door_bang', vol: 1},
            {a: 'shake', at: 1.0, amp: 1.2, dur: 0.5},
            {a: 'look', at: 1.0, target: [2.75, 1.6, 0], dur: 0.4},
          ],
        },
        {
          min: 2.6,
          do: [
            {a: 'sfx', at: 0.15, id: 'door_bang', vol: 1},
            {a: 'fade', at: 0.3, v: 1, dur: 0.08},
            {a: 'title', at: 0.6, text: '2 HORAS ANTES', dur: 1.9},
          ],
        },
      ],
    },
    // ───────────────────────── 1. O DESPEJO ─────────────────────────
    {
      id: 's01',
      title: 'O despejo',
      tempo: 1.2,
      set: 'apartment',
      light: 'dusk',
      chaos: 0,
      ambience: [{id: 'room_tone', vol: 0.3}, {id: 'city_distant', vol: 0.2}],
      start: {spot: 'corridor', look: {yaw: 0, pitch: -18}},
      state: {keysOnMat: true, bagAt: 'hidden', entranceOpen: 0, lightsOn: 1, tv: 'off'},
      hands: {r: 'phoneLook', l: 'hidden', rProp: 'phone'},
      phone: {kind: 'alert', time: '17:52', title: 'Imobiliária Central', body: 'Prazo encerrado. Retire seus pertences do imóvel até as 18h de hoje.'},
      beats: [
        {
          line: {v: 'protagonista', text: '[reading, bitter] Prazo encerrado. Retire seus pertences até as dezoito horas. [bitter laugh] Nem um boa sorte, né, Seu Jorge?', at: 0.8},
          do: [
            {a: 'title', at: 0, text: '@SÁBADO · 17:52', dur: 4},
            {a: 'sfx', at: 0.3, id: 'sirens_close', vol: 0.15},
          ],
        },
        {
          min: 3,
          do: [{a: 'title', at: 0.2, text: 'AS PRIMEIRAS 2 HORAS', dur: 2.8}],
        },
        {
          line: {v: 'protagonista', text: '[quietly] Vinte e sete anos. Ex-fuzileiro naval. [pause] E agora? [voice cracks] Desempregado... e sem casa.'},
          do: [
            {a: 'hands', at: 0.4, r: 'hidden', dur: 0.8},
            {a: 'prop', at: 1.2, r: 'none'},
            {a: 'look', at: 0.6, target: 'door304', dur: 1.6},
            {a: 'glance', at: 3.2, target: 'corridorView', hold: 0.8},
          ],
        },
        {
          line: {v: 'protagonista', text: '[sighs] O Rafa disse que a chave tava debaixo do capacho. [half laugh] Claro que tava. Meu irmão confia em todo mundo.'},
          do: [
            {a: 'look', at: 0.2, target: [2.9, 0, 0.5], dur: 1},
            {a: 'height', at: 1.2, h: 0.95, dur: 1},
            {a: 'hands', at: 2.0, r: 'reach', dur: 0.6},
            {a: 'hands', at: 2.8, r: 'grab', dur: 0.3},
            {a: 'sfx', at: 2.9, id: 'keys_jingle', vol: 0.8},
            {a: 'set', at: 3.0, state: {keysOnMat: false}},
            {a: 'prop', at: 3.0, r: 'keys'},
            {a: 'hands', at: 3.2, r: 'showObject', dur: 0.5},
            {a: 'look', at: 3.3, target: {rel: true, yaw: -6, pitch: 25}, dur: 0.5},
            {a: 'height', at: 3.6, h: 1.64, dur: 1},
            {a: 'look', at: 3.8, target: 'door', dur: 0.8},
          ],
        },
        {
          line: {v: 'protagonista', text: '[deep breath] Beleza... é aqui.', at: 0.4},
          pad: 0.3,
          do: [
            {a: 'hands', at: 0.2, r: 'knob', dur: 0.6},
            {a: 'sfx', at: 0.9, id: 'lock_turn', vol: 0.9},
            {a: 'sfx', at: 1.6, id: 'door_open', vol: 0.8},
            {a: 'set', at: 1.7, state: {entranceOpen: 85}, dur: 1.4},
            {a: 'hands', at: 2.0, r: 'hidden', dur: 0.7},
            {a: 'prop', at: 2.7, r: 'none'},
            {a: 'walk', at: 2.8, to: 'entrance', pace: 'slow', look: 'hallway'},
          ],
        },
      ],
    },
    // ───────────────────────── 2. CHEGADA ─────────────────────────
    {
      id: 's02',
      title: 'Chegada ao apartamento',
      tempo: 1.15,
      set: 'apartment',
      light: 'dusk',
      chaos: 0,
      ambience: [{id: 'room_tone', vol: 0.32}, {id: 'city_distant', vol: 0.2}],
      music: [{id: 'music_calm', vol: 0.12, at: 2, fadeIn: 4}],
      start: {spot: 'entrance', look: 'hallway'},
      state: {entranceOpen: 85, bagAt: 'hidden', lightsOn: 1, tv: 'off'},
      beats: [
        {
          line: {v: 'protagonista', text: '[tired] Apartamento do Rafael. Quem diria, né? [bitter] Dormindo no sofá do irmão mais velho.', at: 1.2},
          do: [
            {a: 'title', at: 0, text: '@18:01', dur: 3},
            {a: 'glance', at: 0.2, target: 'door', hold: 0.3},
            {a: 'sfx', at: 0.5, id: 'door_close', vol: 0.8},
            {a: 'set', at: 0.5, state: {entranceOpen: 0}, dur: 0.6},
            {a: 'sfx', at: 1.8, id: 'bag_drop', vol: 0.8},
            {a: 'set', at: 1.8, state: {bagAt: 'entrance'}},
            {a: 'set', at: 3.0, state: {bagAt: 'hidden'}}, // pega a bolsa de volta (vai para o quarto)
            {a: 'walk', at: 2.6, to: 'hallEnd', pace: 'walk', arrive: 'livingRoom'},
          ],
        },
        {
          line: {v: 'protagonista', text: 'Olha isso. Tudo no lugar. Até as almofadas alinhadas. [short laugh] Médico é tudo igual.', at: 0.5},
          do: [
            {a: 'walk', at: 0, to: 'livingCenter', pace: 'walk', arrive: 'sofa'},
            {a: 'scan', at: 0.2, then: true, from: 'sofa', to: 'kitchen', dur: 2.6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[reading] Fica à vontade, plantão até as oito, não mexe no meu queijo. [laughs softly] Idiota.', at: 1.6},
          do: [{a: 'walk', at: 0, to: 'fridge', pace: 'walk', arrive: 'fridge'}],
        },
        {
          line: {v: 'protagonista', text: 'Quarto de hóspedes. Cheiro de lençol limpo. [sighs] Vai ser o meu quartel... por um tempo.', at: 2.8},
          do: [
            {a: 'walk', at: 0, to: 'bedroomDoor', pace: 'walk', arrive: 'bedroom'},
            {a: 'set', at: 0.5, then: true, state: {bagAt: 'bedroom'}},
            {a: 'sfx', at: 0.5, then: true, id: 'bag_drop', vol: 0.6},
            {a: 'glance', at: 1.0, then: true, target: 'bedroom', hold: 1},
          ],
        },
        {
          line: {v: 'protagonista', text: '[softly] Olha essa foto... a formatura do Rafa. E eu do lado, de farda, achando que ia salvar o mundo. [sad laugh] Que moleque.', at: 3.0},
          pad: 0.6,
          do: [{a: 'walk', at: 0, to: 'photoSpot', pace: 'walk', arrive: 'photo'}],
        },
        {
          line: {v: 'protagonista', text: '[emotional] Ele virou médico. Eu voltei sem emprego, sem rumo. [voice breaks] E mesmo assim... ele nunca me cobrou nada.', at: 0.4},
          pad: 0.8,
          do: [{a: 'look', at: 3.2, target: {rel: true, yaw: 0, pitch: -8}, dur: 1.4}],
        },
        {
          line: {v: 'protagonista', text: '[long exhale] Pela primeira vez em semanas... ninguém batendo na porta. [pause] Silêncio.', at: 3.4},
          do: [
            {a: 'walk', at: 0, to: 'sofaSeat', pace: 'slow', arrive: 'tv'},
            {a: 'height', at: 0.1, then: true, h: 1.12, dur: 0.9},
            {a: 'sfx', at: 0.4, then: true, id: 'sofa_sit', vol: 0.7},
          ],
        },
        {
          line: {v: 'reporter', fx: 'tv', text: 'Pelo menos três hospitais da capital registraram casos de agressão nas últimas horas. As autoridades ainda não sabem explicar a causa dos ataques.', at: 1.2},
          do: [
            {a: 'sfx', at: 0.4, id: 'tv_static', vol: 0.25},
            {a: 'set', at: 0.6, state: {tv: 'news'}},
            {a: 'look', at: 0.4, target: 'tv', dur: 0.8},
          ],
        },
        {
          line: {v: 'protagonista', text: '[uneasy] Hospital... o Rafa tá de plantão hoje. [pause] [trying to convince himself] Ele sabe se cuidar.'},
          pad: 0.6,
          do: [
            {a: 'glance', at: 0.3, target: 'window', hold: 1.2},
            {a: 'set', at: 4.2, state: {tv: 'off'}},
            {a: 'sfx', at: 4.2, id: 'tv_static', vol: 0.15},
          ],
        },
        {
          min: 4.5,
          do: [
            {a: 'look', at: 0.2, target: {rel: true, yaw: 5, pitch: 38}, dur: 2},
            {a: 'fade', at: 1.8, v: 0.92, dur: 1.4},
            {a: 'fade', at: 3.6, v: 0, dur: 0.8},
          ],
        },
      ],
    },
    // ───────────────────────── 3. LIGAÇÃO DO RAFAEL ─────────────────────────
    {
      id: 's03',
      title: 'Ligação desesperada de Rafael',
      tempo: 1.3,
      set: 'apartment',
      light: 'dusk',
      chaos: 0.15,
      ambience: [{id: 'room_tone', vol: 0.3}, {id: 'city_distant', vol: 0.22}],
      start: {spot: 'sofaSeat', look: 'tv', h: 1.12},
      state: {bagAt: 'bedroom', lightsOn: 1, tv: 'off'},
      beats: [
        {
          line: {v: 'protagonista', text: '[confused] Rafa? [uneasy] Ele nunca liga no meio do plantão...', at: 1.8},
          do: [
            {a: 'title', at: 0, text: '@18:14', dur: 3},
            {a: 'sfx', at: 0.2, id: 'phone_vibrate', vol: 0.9},
            {a: 'phone', at: 0.2, screen: {kind: 'incoming', name: 'Rafael', pulse: 0}},
            {a: 'prop', at: 0.4, r: 'phone'},
            {a: 'hands', at: 0.4, r: 'phoneLook', dur: 0.7},
            {a: 'look', at: 0.5, target: {rel: true, yaw: -4, pitch: -24}, dur: 0.8},
          ],
        },
        {
          line: {v: 'protagonista', text: '[relaxed] Fala, mano. Já tô aí, achei a chave...', at: 0.9},
          do: [
            {a: 'sfx', at: 0, id: 'call_accept', vol: 0.6},
            {a: 'phone', at: 0, screen: {kind: 'call', name: 'Rafael', seconds: 1}},
            {a: 'hands', at: 0.2, r: 'phoneEar', dur: 0.6},
            {a: 'look', at: 0.3, target: 'tv', dur: 0.8},
          ],
        },
        {
          line: {v: 'rafael', phone: true, text: 'Escuta. Escuta! Não fala nada, só escuta. Você tá sozinho aí?', at: 0.1},
          do: [
            {a: 'tension', at: 0.5, v: 0.35},
            {a: 'height', at: 1.0, h: 1.64, dur: 0.9},
          ],
        },
        {
          line: {v: 'protagonista', text: '[worried] Tô... [tense] Rafa, que barulho é esse?', at: 0.9},
          do: [{a: 'sfx', at: 0, id: 'scream_phone', vol: 0.25}, {a: 'walk', at: 0.3, to: 'sofa', pace: 'slow', arrive: 'livingRoom'}],
        },
        {
          line: {v: 'rafael', phone: true, text: 'Tranca a porta. Passa a corrente. Enche tudo que tiver de água: panela, garrafa, a banheira. Junta comida.', at: 0.1},
          do: [{a: 'walk', at: 1.2, to: 'livingCenter', pace: 'slow', look: 'window'}],
        },
        {
          line: {v: 'protagonista', text: '[alarmed] Calma. Calma! O que tá acontecendo aí?!', at: 0.1},
          do: [{a: 'tension', at: 0, v: 0.5}],
        },
        {
          line: {v: 'protagonista', text: '[urgent, shouting] Então sai daí! Vem pra cá agora, Rafa!', at: 0.2},
          do: [{a: 'glance', at: 0.3, target: 'door', hold: 0.6}, {a: 'tension', at: 0, v: 0.55}],
        },
        {
          line: {v: 'rafael', phone: true, text: 'Não dá! Tem paciente aqui, tem criança... eu não posso largar eles assim. [pause] Me escuta, por favor.', at: 0.2},
          do: [{a: 'sfx', at: 1.0, id: 'scream_phone', vol: 0.2}],
        },
        {
          line: {v: 'rafael', phone: true, text: '[breathing heavily] Os pacientes... tão atacando as pessoas. Mordendo. Eu vi um enfermeiro... [voice breaks] eu nunca vi nada assim.', at: 0.2},
          do: [{a: 'sfx', at: 0, id: 'scream_phone', vol: 0.3}, {a: 'glance', at: 1.4, target: 'window', hold: 1.5}],
        },
        {
          line: {v: 'rafael', phone: true, text: 'Não abre a porta pra ninguém. Ninguém! Nem se pedirem ajuda. Eu chego em duas horas. Duas horas, tá me ouvindo?', at: 0.1},
          do: [
            {a: 'timer', at: 3.6, remaining: 7200},{a: 'tension', at: 0, v: 0.6}],
        },
        {
          line: {v: 'protagonista', text: '[panicked] Rafa? [shouting] Rafa!', at: 0.5},
          do: [{a: 'sfx', at: 0.1, id: 'call_drop', vol: 0.7}, {a: 'phone', at: 0.1, screen: {kind: 'ended', name: 'Rafael', seconds: 64}}],
        },
        {
          line: {v: 'protagonista', text: '[whispers, shaken] Caiu...', at: 1.2},
          pad: 1,
          do: [
            {a: 'hands', at: 0, r: 'phoneLook', dur: 0.6},
            {a: 'look', at: 0.1, target: {rel: true, yaw: 3, pitch: -24}, dur: 0.7},
          ],
        },
      ],
    },
    // ───────────────────────── 4. A CIDADE EM COLAPSO ─────────────────────────
    {
      id: 's04',
      title: 'A cidade em colapso',
      tempo: 1.35,
      set: 'apartment',
      light: 'dusk',
      chaos: 0.6,
      ambience: [{id: 'room_tone', vol: 0.25}, {id: 'city_distant', vol: 0.32}, {id: 'car_alarm', vol: 0.08}],
      music: [{id: 'drone_tension', vol: 0.16, at: 6, fadeIn: 5}],
      start: {spot: 'livingCenter', look: 'archway', tension: 0.55},
      state: {bagAt: 'bedroom', lightsOn: 1, tv: 'off', blinds: 0.15, crash: 0},
      hands: {r: 'hidden', l: 'hidden'},
      beats: [
        {
          line: {v: 'protagonista', text: '[tense, quietly] Duas horas... ele falou como se fosse muito tempo.', at: 2.6},
          do: [
            {a: 'timer', at: 0, remaining: 7020},
            {a: 'title', at: 0, text: '@18:17', dur: 3},
            {a: 'sfx', at: 0.3, id: 'sirens_close', vol: 0.55},
            {a: 'walk', at: 0.6, to: 'window', pace: 'brisk', arrive: 'street'},
          ],
        },
        {
          line: {v: 'protagonista', text: '[shocked, shouting] Que isso?! Aquele carro nem freou!', at: 1.1},
          pad: 0.6,
          do: [
            {a: 'set', at: 0, state: {crash: 1}, dur: 1.25},
            {a: 'sfx', at: 1.15, id: 'car_crash', vol: 0.8},
            {a: 'startle', at: 1.25, target: [0, -8.2, -24], amp: 0.8},
            {a: 'actor', at: 0, track: {spec: CIVIL_B, variation: 0.5, y: STREET, path: [[0, 12, -19.2], [6.5, -26, -19.4]], clips: [[0, 'run']], until: 6.4}},
          ],
        },
        {
          line: {v: 'protagonista', text: '[confused] Ei... ei, o que esse cara tá fazendo? [horrified] Ele tá... [gasps] ele tá comendo ela!', at: 3.2},
          pad: 0.8,
          do: [
            {a: 'actor', at: 0, track: {spec: CIVIL, variation: 0.2, y: STREET, path: [[0, 8, -20], [3.2, -2.5, -20]], clips: [[0, 'run'], [3.2, 'fall'], [4.2, 'dead']], bloodAt: 3.8}},
            {a: 'actor', at: 0, track: {spec: INF_AGR, variation: 0.7, y: STREET, face: 180, path: [[0.6, 11, -19.6], [3.6, -1.85, -19.42]], clips: [[0.6, 'lunge'], [3.6, 'feed']]}},
            {a: 'actor', at: 5.0, track: {spec: {id: 'inf_lento', height: 1.7, build: 1.15, skin: '#a7b89a', hair: '#555', hairStyle: 'bald', top: '#5b5f63', topStyle: 'shirt', bottom: '#3d3a33', shoes: '#2a2a2a', infected: {decay: 0.6, blood: 0.4, eyes: '#c9c27a'}}, variation: 0.4, y: STREET, face: 0, path: [[0, -16, -21], [9, -2.3, -20.62]], clips: [[0, 'shamble'], [9, 'feed']]}},
            {a: 'sfx', at: 3.1, id: 'scream_far', vol: 0.6},
            {a: 'tension', at: 3.3, v: 0.8},
            {a: 'danger', at: 3.4, v: 0.25, dur: 0.8},
          ],
        },
        {
          line: {v: 'protagonista', text: '[reading fast, breathless] Alerta extremo. Permaneça em casa. Evite contato com feridos. [nervous laugh] Agora vocês avisam.', at: 1.6},
          do: [
            {a: 'danger', at: 0, v: 0, dur: 1.5},
            {a: 'sfx', at: 0, id: 'emergency_alert', vol: 0.7},
            {a: 'phone', at: 0, screen: {kind: 'alert', time: '18:19', title: 'ALERTA EXTREMO — Defesa Civil', body: 'Permaneça em casa. Tranque portas e janelas. Evite contato com pessoas feridas.'}},
            {a: 'prop', at: 0.2, r: 'phone'},
            {a: 'hands', at: 0.2, r: 'phoneLook', dur: 0.6},
            {a: 'look', at: 0.4, target: {rel: true, yaw: 0, pitch: -26}, dur: 0.7},
          ],
        },
        {
          line: {v: 'protagonista', text: '[desperate] Atende, Rafa... vai, vai, atende...', at: 0.6},
          pad: 0.5,
          do: [
            {a: 'phone', at: 0.3, screen: {kind: 'dialing', name: 'Rafael'}},
            {a: 'sfx', at: 0.4, id: 'call_accept', vol: 0.4},
            {a: 'phone', at: 3.6, screen: {kind: 'dialing', name: 'Rafael', failed: true}},
            {a: 'sfx', at: 3.6, id: 'call_drop', vol: 0.6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[frustrated] Sem sinal. [breathing fast] Cento e noventa... [pause] [disbelief] Ocupado. A polícia tá ocupada.', at: 0.6},
          pad: 0.6,
          do: [
            {a: 'phone', at: 1.6, screen: {kind: 'dialing', name: '190'}},
            {a: 'phone', at: 4.0, screen: {kind: 'dialing', name: '190', failed: true}},
            {a: 'sfx', at: 4.0, id: 'call_drop', vol: 0.6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[whispers] Escuta isso... gente gritando nos outros prédios. [tense] E esse helicóptero... tá baixo demais.', at: 2.0},
          pad: 0.6,
          do: [
            {a: 'hands', at: 0.2, r: 'relaxedLow', dur: 0.6},
            {a: 'look', at: 0.4, target: 'city', dur: 1.2},
            {a: 'sfx', at: 0.5, id: 'helicopter_pass', vol: 0.7},
            {a: 'sfx', at: 2.4, id: 'scream_far', vol: 0.45},
            {a: 'glance', at: 4.6, target: 'smoke', hold: 1.4},
          ],
        },
        {
          line: {v: 'protagonista', text: '[shaky breath] Tá bom. Respira. Você já passou por coisa pior. [firm, determined] Pensa como fuzileiro.', at: 0.6},
          pad: 0.8,
          do: [
            {a: 'hands', at: 0.3, r: 'hidden', dur: 0.7},
            {a: 'prop', at: 1.0, r: 'none'},
            {a: 'look', at: 0.5, target: 'window', dur: 0.8},
            {a: 'sfx', at: 2.4, id: 'blinds_close', vol: 0.8},
            {a: 'set', at: 2.5, state: {blinds: 1}, dur: 0.9},
            {a: 'tension', at: 3, v: 0.45, dur: 3},
          ],
        },
      ],
    },
    // ───────────────────────── 5. PREPARAÇÃO ─────────────────────────
    {
      id: 's05',
      title: 'Preparação para sobreviver',
      tempo: 1.3,
      set: 'apartment',
      light: 'night',
      chaos: 0.7,
      ambience: [{id: 'room_tone', vol: 0.3}, {id: 'city_distant', vol: 0.3}],
      music: [{id: 'drone_tension', vol: 0.1, at: 0, fadeIn: 3}],
      start: {spot: 'window', look: 'livingRoom', tension: 0.45},
      state: {bagAt: 'bedroom', lightsOn: 1, blinds: 1, supplies: 0, entranceLocks: 1, chain: false},
      beats: [
        {
          line: {v: 'protagonista', text: '[focused, low voice] Primeiro, o terreno. Uma porta. Três janelas. Terceiro andar... alto pra subir, baixo pra pular.', at: 0.8},
          do: [
            {a: 'timer', at: 0, remaining: 6600},
            {a: 'title', at: 0, text: '@18:24', dur: 3},
            {a: 'walk', at: 0.2, to: 'livingCenter', pace: 'walk', look: 'archway'},
            {a: 'scan', at: 2.6, from: 'kitchen', to: 'archway', dur: 3.2},
          ],
        },
        {
          line: {v: 'protagonista', text: '[analytical] A porta é o ponto fraco. Madeira comum, uma fechadura... [scoffs] e essa corrente de enfeite.', at: 2.4},
          do: [{a: 'walk', at: 0, to: 'entrance', pace: 'brisk', arrive: 'doorLock'}],
        },
        {
          line: {v: 'protagonista', text: '[determined] Tranquei. Passei a corrente. [exhales] Pronto. Não é muito... mas é o que tem.', at: 0.2},
          do: [
            {a: 'hands', at: 0.1, r: 'knob', dur: 0.5},
            {a: 'sfx', at: 0.6, id: 'lock_turn', vol: 0.9},
            {a: 'set', at: 0.7, state: {entranceLocks: 2}},
            {a: 'hands', at: 1.6, r: 'grab', l: 'reach', dur: 0.5},
            {a: 'sfx', at: 2.1, id: 'chain_lock', vol: 0.9},
            {a: 'set', at: 2.2, state: {chain: true}},
            {a: 'hands', at: 3.2, r: 'hidden', l: 'hidden', dur: 0.7},
            {a: 'tip', at: 1.0, title: 'ABRIGO NO LOCAL', text: 'Fique dentro de casa com portas e janelas trancadas, de preferência num cômodo interno, longe das janelas.', src: 'Ready.gov / FEMA · Shelter in Place', dur: 6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[focused] Água primeiro. Sem comida, o corpo aguenta bem mais tempo. Sem água... pouquíssimos dias.', at: 1.2},
          do: [
            {a: 'walk', at: 0, to: 'sink', pace: 'brisk', arrive: 'sink'},
            {a: 'tip', at: 1.0, title: 'ÁGUA', text: 'Guarde cerca de 1 galão (≈ 3,8 litros) por pessoa, por dia — para beber e para higiene — para vários dias.', src: 'Ready.gov / FEMA · Build a Kit', dur: 7},
          ],
        },
        {
          line: {v: 'protagonista', text: '[quick, focused] Garrafa, panela, a jarra do filtro... tudo cheio.', at: 1.6},
          pad: 0.6,
          do: [
            {a: 'hands', at: 0, r: 'reach', l: 'hidden', dur: 0.5},
            {a: 'set', at: 0.2, state: {fill: 0.02}},
            {a: 'set', at: 0.4, state: {faucet: 1}, dur: 0.25},
            {a: 'sfx', at: 0.4, id: 'water_fill', vol: 0.8},
            {a: 'set', at: 0.5, state: {fill: 1}, dur: 2.4},
            {a: 'hands', at: 1.2, r: 'grab', dur: 0.4},
            {a: 'set', at: 3.0, state: {fill: 0, filled: 1}},
            {a: 'hands', at: 3.0, r: 'reach', dur: 0.4},
            {a: 'set', at: 3.3, state: {fill: 0.02}},
            {a: 'sfx', at: 3.4, id: 'water_fill', vol: 0.7},
            {a: 'set', at: 3.4, state: {fill: 1}, dur: 2.2},
            {a: 'set', at: 5.7, state: {fill: 0, filled: 2, faucet: 0}},
            {a: 'set', at: 5.7, state: {supplies: 0.25}},
            {a: 'hands', at: 5.8, r: 'hidden', dur: 0.6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[hurried] O banheiro também. Balde, bacia... água nunca é demais.', at: 2.6},
          pad: 0.8,
          do: [
            {a: 'walk', at: 0.1, to: 'bathroom', pace: 'brisk', arrive: 'bathtub'},
            {a: 'set', at: 0.3, state: {bathroomDoorOpen: 85}, dur: 0.8},
            {a: 'hands', at: 0, then: true, r: 'reach', dur: 0.5},
            {a: 'sfx', at: 0.3, then: true, id: 'water_fill', vol: 0.8, loop: 3},
            {a: 'hands', at: 2.6, then: true, r: 'hidden', dur: 0.6},
          ],
        },
        {
          line: {v: 'protagonista', text: 'Agora, comida. [nervous laugh] Rafa, você comprou atum pra alimentar um batalhão?', at: 2.4},
          do: [
            {a: 'walk', at: 0, to: 'kitchen', pace: 'brisk', arrive: 'kitchen'},
            {a: 'sfx', at: 0.1, then: true, id: 'cabinet_open', vol: 0.8},
            {a: 'hands', at: 0.2, then: true, r: 'reach', dur: 0.4},
            {a: 'prop', at: 0.6, then: true, r: 'can'},
            {a: 'hands', at: 0.6, then: true, r: 'showObject', dur: 0.5},
            {a: 'look', at: 0.7, then: true, target: {rel: true, yaw: -8, pitch: -16}, dur: 0.6},
            {a: 'tip', at: 1.2, then: true, title: 'COMIDA', text: 'Tenha alimentos não perecíveis para vários dias — e um abridor de latas manual.', src: 'Ready.gov / FEMA · Build a Kit', dur: 6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[grim] E isso aqui... não é fuzil, mas serve. [quietly] Torcendo pra não precisar.', at: 0.6, },
          pad: 0.6,
          do: [
            {a: 'walk', at: 0, to: 'knifeSpot', pace: 'walk', arrive: 'knifeBlock'},
            {a: 'hands', at: 0.1, then: true, l: 'reach', dur: 0.4},
            {a: 'sfx', at: 0.5, then: true, id: 'knife_pick', vol: 0.8},
            {a: 'set', at: 0.55, then: true, state: {knifeTaken: true}},
            {a: 'prop', at: 0.55, then: true, l: 'knife'},
            {a: 'hands', at: 0.6, then: true, l: 'showKnife', dur: 0.5},
            {a: 'look', at: 0.7, then: true, target: {rel: true, yaw: 10, pitch: -12}, dur: 0.6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[counting] Feijão, arroz, enlatado, biscoito... [thoughtful] dá uns dez dias. Se eu for esperto.', at: 2.2},
          do: [
            {a: 'hands', at: 0, l: 'fist', dur: 0.4},
            {a: 'walk', at: 0, to: 'livingCenter', pace: 'walk', arrive: 'table'},
            {a: 'hands', at: 0, then: true, r: 'reach', dur: 0.4},
            {a: 'prop', at: 0.4, then: true, r: 'none'},
            {a: 'sfx', at: 0.4, then: true, id: 'cans_clink', vol: 0.8},
            {a: 'set', at: 0.4, then: true, state: {supplies: 0.5}},
            {a: 'hands', at: 0.9, then: true, r: 'grab', dur: 0.3},
            {a: 'hands', at: 1.3, then: true, r: 'reach', dur: 0.3},
            {a: 'set', at: 1.5, then: true, state: {supplies: 0.75}},
            {a: 'hands', at: 1.9, then: true, r: 'grab', dur: 0.3},
            {a: 'hands', at: 2.3, then: true, r: 'reach', dur: 0.3},
            {a: 'set', at: 2.5, then: true, state: {supplies: 1}},
            {a: 'hands', at: 3.2, then: true, r: 'hidden', dur: 0.5},
          ],
        },
        {
          line: {v: 'protagonista', text: '[military tone] Mochila de fuga. Água, comida, lanterna, carregador, remédio. [firm] Se tiver que sair correndo, eu saio pronto.', at: 2.6},
          pad: 0.5,
          do: [
            {a: 'walk', at: 0, to: 'bedroom', pace: 'brisk', arrive: 'bag'},
            {a: 'prop', at: 0.1, then: true, r: 'bottle'},
            {a: 'hands', at: 0.1, then: true, r: 'showObject', dur: 0.4},
            {a: 'hands', at: 0.8, then: true, r: 'reach', dur: 0.4},
            {a: 'prop', at: 1.2, then: true, r: 'none'},
            {a: 'sfx', at: 1.2, then: true, id: 'zipper_bag', vol: 0.8},
            {a: 'hands', at: 1.4, then: true, r: 'grab', l: 'grab', dur: 0.4},
            {a: 'tip', at: 0.8, then: true, title: 'KIT DE EMERGÊNCIA', text: 'Lanterna, rádio a pilha ou manivela, pilhas extras, kit de primeiros socorros, apito e carregador portátil.', src: 'Ready.gov / FEMA · Build a Kit', dur: 6.5},
            {a: 'hands', at: 3.0, then: true, r: 'hidden', l: 'hidden', dur: 0.5},
          ],
        },
        {
          line: {v: 'protagonista', text: '[whispers] Luz apagada. De noite, luz chama atenção. [pause] [ominous] Só não sei de quem.', at: 1.2},
          pad: 0.6,
          do: [
            {a: 'set', at: 0.6, state: {lightsOn: 0.15}, dur: 0.3},
            {a: 'look', at: 0.1, target: 'ceiling', dur: 0.7},
            {a: 'look', at: 1.3, target: 'archway', dur: 0.8},
            {a: 'tip', at: 1.0, title: 'SE ESCONDER', text: 'Em uma ameaça violenta: tranque e bloqueie a porta, feche as persianas, apague as luzes e fique em silêncio.', src: 'Ready.gov / FEMA · Run, Hide, Fight', dur: 6.5},
          ],
        },
        {
          line: {v: 'protagonista', text: '[low voice] Essa cômoda aqui... pesada. [tense] Se precisar, ela segura a porta.', at: 2.4},
          pad: 0.6,
          do: [{a: 'walk', at: 0, to: 'hallDresser', pace: 'walk', arrive: 'dresser'}],
        },
      ],
    },
    // ───────────────────────── 6. ALGUÉM NA PORTA ─────────────────────────
    {
      id: 's06',
      title: 'Alguém está na porta',
      tempo: 1.2,
      set: 'apartment',
      light: 'night',
      chaos: 0.75,
      ambience: [{id: 'room_tone', vol: 0.32}, {id: 'city_distant', vol: 0.25}],
      start: {spot: 'hallDresser', look: 'dresser', tension: 0.4},
      state: {bagAt: 'bedroom', lightsOn: 0.15, blinds: 1, supplies: 1, entranceLocks: 2, chain: true},
      beats: [
        {
          line: {v: 'protagonista', text: '[whispers, frightened] Quem é...?', at: 2.0},
          do: [
            {a: 'timer', at: 0, remaining: 5580},
            {a: 'title', at: 0, text: '@18:41', dur: 3},
            {a: 'sfx', at: 0.8, id: 'door_knock', vol: 0.9},
            {a: 'startle', at: 0.95, target: 'door', amp: 0.8},
          ],
        },
        {
          line: {v: 'vizinho', fx: 'door', text: 'Ô, vizinho! Tem alguém aí? Por favor! Eu sou do trezentos e quatro!', at: 0.2},
          do: [{a: 'walk', at: 0.8, to: 'peephole', pace: 'slow', look: 'door'}, {a: 'sfx', at: 0.1, id: 'door_knock', vol: 0.7}],
        },
        {
          line: {v: 'vizinho', fx: 'door', text: 'Eu fui mordido lá embaixo... tá sangrando muito. Eu só preciso de um pano, por favor...', at: 0.2},
          do: [
            {a: 'hands', at: 0.5, l: 'brace', dur: 0.6},
            {a: 'walk', at: 1.2, then: true, to: 'peepView', pace: 'slow', look: 'corridorView'},
            {a: 'lens', at: 0, then: true, v: 1, dur: 0.4},
            {a: 'fov', at: 0, then: true, v: 100, dur: 0.4},
            {a: 'hands', at: 1.6, l: 'hidden', dur: 0.3},
            {
              a: 'actor',
              at: 0,
              track: {spec: NEIGHBOR, variation: 0.3, face: 180, path: [[0, 2.75, 1.45]], clips: [[0, 'idleTense'], [3.5, 'hitReact', 0.5], [4.4, 'idleTense']]},
            },
          ],
        },
        {
          line: {v: 'protagonista', text: '[whispers] É o cara do elevador... da camisa vermelha. [breath catches] Tá sangrando muito.', at: 0.8},
          do: [
            {a: 'tension', at: 0, v: 0.55},
            {a: 'tip', at: 0.6, title: 'FERIDOS', text: 'Evite contato direto com sangue e fluidos corporais de outras pessoas; se precisar ajudar, use luvas.', src: 'CDC · Precauções padrão', dur: 6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[whispers, conflicted] Não abre pra ninguém. O Rafa falou. Ninguém.', at: 1.2},
          do: [{a: 'sfx', at: 0.2, id: 'cough_door', vol: 0.8}, {a: 'actor', at: 0, track: {spec: NEIGHBOR, variation: 0.3, face: 180, path: [[0, 2.75, 1.45]], clips: [[0, 'hitReact', 0.6], [1.4, 'idleTense']]}}],
        },
        {
          line: {v: 'vizinho', fx: 'door', text: 'Sou eu, o Paulo! A gente se viu no elevador hoje cedo, lembra? Por favor, cara... me deixa entrar.', at: 0.3},
          do: [{a: 'sfx', at: 0.1, id: 'door_knock', vol: 0.6}],
        },
        {
          line: {v: 'protagonista', text: '[pained, through the door] Paulo... eu não posso abrir. Desce. Vai pro hospital, pede ajuda lá embaixo.', at: 0.4},
          do: [{a: 'tension', at: 0, v: 0.6}],
        },
        {
          line: {v: 'vizinho', fx: 'door', text: 'Hospital?! Foi lá que me morderam! [sobs] Tá todo mundo louco lá embaixo...', at: 0.2},
          do: [{a: 'sfx', at: 0.1, id: 'door_knock', vol: 0.8}],
        },
        {
          line: {v: 'protagonista', text: '[whispers, guilty, voice breaking] Desculpa, cara... desculpa...', at: 0.6},
          pad: 0.8,
        },
        {
          line: {v: 'vizinho', fx: 'door', text: '[coughs] Por favor... eu tô ficando tonto... eu não tô enxergando direito...', at: 0.3},
          do: [{a: 'actor', at: 0, track: {spec: NEIGHBOR, variation: 0.6, face: 180, path: [[0, 2.75, 1.45], [2.5, 2.85, 1.7]], clips: [[0, 'stagger'], [3.0, 'crouch']]}}],
        },
        {
          line: {v: 'protagonista', text: '[whispers, scared] Ei... ei, cara? [pause] Você tá bem?', at: 2.6},
          pad: 1.6,
          do: [
            {a: 'sfx', at: 0.2, id: 'body_fall', vol: 0.8},
            {a: 'sfx', at: 1.0, id: 'heartbeat', vol: 0.55},
            {a: 'tension', at: 0.3, v: 0.7},
          ],
        },
      ],
    },
    // ───────────────────────── 7. PRIMEIRO CONTATO ─────────────────────────
    {
      id: 's07',
      title: 'Primeiro contato com um infectado',
      tempo: 1.4,
      set: 'apartment',
      light: 'night',
      chaos: 0.8,
      ambience: [{id: 'room_tone', vol: 0.3}],
      music: [{id: 'music_action', vol: 0.18, at: 9, fadeIn: 1.5}],
      start: {spot: 'peepView', look: 'corridorView', tension: 0.7},
      state: {bagAt: 'bedroom', lightsOn: 0.15, blinds: 1, supplies: 1, entranceLocks: 2, chain: true, barricade: 0},
      beats: [
        {
          line: {v: 'protagonista', text: '[terrified whisper] Ele tá levantando... mas tem alguma coisa errada. [shaky breath] O jeito que ele mexe a cabeça...', at: 2.4},
          do: [
            {a: 'timer', at: 0, remaining: 5400},
            {a: 'title', at: 0, text: '@18:44', dur: 3},
            {a: 'lens', at: 0, v: 1, dur: 0.01},
            {a: 'fov', at: 0, v: 100, dur: 0.01},
            {a: 'sfx', at: 1.2, id: 'groan_transform', vol: 0.8},
            {
              a: 'actor',
              at: 0,
              track: {spec: NEIGHBOR_INF, variation: 0.8, face: 180, path: [[0, 2.85, 1.7], [6.6, 2.85, 1.7], [7.2, 2.75, 0.95]], clips: [[0, 'crouch'], [1.4, 'idleTense'], [4.2, 'lookAround'], [6.6, 'lunge'], [7.2, 'bangDoor']]},
            },
          ],
        },
        {
          line: {v: 'protagonista', text: '[screams] Meu Deus!', at: 0.25},
          do: [
            {a: 'sfx', at: 0.1, id: 'door_bang', vol: 1},
            {a: 'set', at: 0.1, state: {entranceShake: 1}},
            {a: 'startle', at: 0.1, amp: 1.2},
            {a: 'lens', at: 0.3, v: 0, dur: 0.2},
            {a: 'fov', at: 0.3, v: 62, dur: 0.2},
            {a: 'walk', at: 0.4, to: 'peephole', pace: 'brisk', look: 'door'},
            {a: 'danger', at: 0.2, v: 0.4, dur: 0.4},
          ],
        },
        {
          line: {v: 'protagonista', text: '[panicked, shouting] A cômoda! A cômoda, agora!', at: 0.3},
          do: [
            {a: 'walk', at: 0.2, to: 'hallDresser', pace: 'brisk', arrive: 'dresser'},
            {a: 'sfx', at: 1.5, id: 'door_bang', vol: 0.9},
          ],
        },
        {
          line: {v: 'protagonista', text: '[straining, panting] Segura... segura!', at: 1.2},
          pad: 0.6,
          do: [
            {a: 'hands', at: 0, r: 'pushLow', l: 'pushLow', dur: 0.5},
            {a: 'sfx', at: 0.4, id: 'furniture_drag', vol: 0.9},
            {a: 'set', at: 0.4, state: {barricade: 1}, dur: 3.4},
            {a: 'walk', at: 0.6, to: 'barricade', pace: 'slow', look: [2.75, 0.45, -0.1]},
            {a: 'sfx', at: 2.6, id: 'door_bang', vol: 0.9},
          ],
        },
        {
          line: {v: 'protagonista', text: '[horrified, breathless] Isso não é gente. [whispers] Gente não faz esse som.', at: 1.2},
          do: [{a: 'sfx', at: 0, id: 'zombie_growl', vol: 0.8}, {a: 'sfx', at: 2.4, id: 'door_bang', vol: 0.85}],
        },
        {
          line: {v: 'protagonista', text: '[whispers, trembling] Respira. Conta. Igual no quartel. [slow] Um... dois... três...', at: 0.8},
          pad: 1,
          do: [
            {a: 'sfx', at: 0.2, id: 'door_bang', vol: 0.75},
            {a: 'sfx', at: 3.4, id: 'heartbeat', vol: 0.5},
            {a: 'hands', at: 0.5, r: 'pushLow', l: 'pushLow', dur: 0.6},
          ],
        },
        {
          line: {v: 'protagonista', text: '[whispers] Escuta... [gasps] É outra voz. [terrified] Tem mais um lá fora. São dois agora.', at: 3.0},
          pad: 0.8,
          do: [
            {a: 'sfx', at: 0.3, id: 'zombie_growl', vol: 0.75},
            {a: 'sfx', at: 1.6, id: 'groan_transform', vol: 0.45},
            {a: 'sfx', at: 2.2, id: 'door_bang', vol: 0.7},
            {a: 'look', at: 1.0, target: [2.75, 1.1, 0], dur: 0.8},
            {a: 'glance', at: 4.4, target: 'hallway', hold: 0.8},
            {a: 'tension', at: 1.6, v: 0.85},
          ],
        },
        {
          line: {v: 'protagonista', text: '[whispers, exhausted] Parou... eles pararam. [ominous] Por enquanto.', at: 3.4},
          pad: 1.5,
          do: [
            {a: 'set', at: 0.6, state: {entranceShake: 0}, dur: 1.5},
            {a: 'sfx', at: 0.3, id: 'door_bang', vol: 0.5},
            {a: 'tension', at: 1.5, v: 0.5, dur: 3},
            {a: 'danger', at: 1, v: 0, dur: 2},
            {a: 'hands', at: 2.4, r: 'hidden', l: 'hidden', dur: 0.8},
          ],
        },
      ],
    },
    // ───────────────────────── 8. LIGAÇÃO INTERROMPIDA ─────────────────────────
    {
      id: 's08',
      title: 'Ligação interrompida',
      tempo: 1.2,
      set: 'apartment',
      light: 'night',
      chaos: 0.85,
      ambience: [{id: 'room_tone', vol: 0.3}],
      start: {spot: 'barricade', look: 'hallway', h: 0.95, tension: 0.5},
      state: {bagAt: 'bedroom', lightsOn: 0.15, blinds: 1, supplies: 1, entranceLocks: 2, chain: true, barricade: 1},
      beats: [
        {
          line: {v: 'protagonista', text: '[relieved, breathless] Rafa...', at: 2.2},
          do: [
            {a: 'timer', at: 0, remaining: 4920},
            {a: 'title', at: 0, text: '@18:52', dur: 3},
            {a: 'sfx', at: 0.4, id: 'phone_vibrate', vol: 0.9},
            {a: 'phone', at: 0.4, screen: {kind: 'incoming', name: 'Rafael', pulse: 0}},
            {a: 'prop', at: 0.6, r: 'phone'},
            {a: 'hands', at: 0.6, r: 'phoneLook', dur: 0.6},
            {a: 'look', at: 0.7, target: {rel: true, yaw: 0, pitch: -28}, dur: 0.8},
          ],
        },
        {
          line: {v: 'rafael', phone: true, text: '[panting] Mano... eu não vou conseguir chegar. A ponte tá fechada... tem gente... tem eles em todo lugar.', at: 0.8},
          do: [
            {a: 'sfx', at: 0, id: 'call_accept', vol: 0.6},
            {a: 'phone', at: 0, screen: {kind: 'call', name: 'Rafael', seconds: 1}},
            {a: 'hands', at: 0.2, r: 'phoneEar', dur: 0.6},
            {a: 'look', at: 0.3, target: 'hallway', dur: 0.8},
            {a: 'sfx', at: 0.6, id: 'scream_phone', vol: 0.35},
          ],
        },
        {line: {v: 'protagonista', text: '[desperate, shouting] Onde você tá? Rafa, onde você tá?!', at: 0.2}, do: [{a: 'tension', at: 0, v: 0.8}]},
        {
          line: {v: 'rafael', phone: true, text: 'Fica aí. Não abre a porta. Eu vou dar um jeito, eu te prometo, eu...', at: 0.2},
          do: [{a: 'sfx', at: 0.5, id: 'scream_phone', vol: 0.4}],
        },
        {
          line: {v: 'protagonista', text: '[whispers, devastated] Rafa...?', at: 1.3},
          pad: 0.8,
          do: [
            {a: 'sfx', at: 0, id: 'call_drop', vol: 0.75},
            {a: 'timer', at: 0.2, broken: true},
            {a: 'phone', at: 0, screen: {kind: 'ended', name: 'Rafael', seconds: 19}},
            {a: 'hands', at: 0.2, r: 'phoneLook', dur: 0.6},
            {a: 'look', at: 0.3, target: {rel: true, yaw: 0, pitch: -28}, dur: 0.8},
          ],
        },
        {
          line: {v: 'protagonista', text: '[numb, quietly] Dezoito e cinquenta e nove. [pause] [voice breaking] Duas horas, Rafa. Você disse duas horas.', at: 1.6},
          pad: 0.8,
          do: [{a: 'look', at: 3.6, target: 'dresser', dur: 1.2}],
        },
        {
          line: {v: 'protagonista', text: '[whispers, determined through tears] Eu vou estar aqui. Eu vou te esperar.', at: 0.8},
          pad: 1.2,
          do: [{a: 'hands', at: 0.2, r: 'hidden', dur: 0.8}, {a: 'look', at: 0.6, target: 'door', dur: 1.4}],
        },
        {
          min: 5,
          do: [
            {a: 'sfx', at: 0.3, id: 'music_end', vol: 0.6},
            {a: 'fade', at: 0.4, v: 1, dur: 0.6},
            {a: 'title', at: 1.2, text: 'CONTINUA...', dur: 3.4},
          ],
        },
      ],
    },
  ],
};
