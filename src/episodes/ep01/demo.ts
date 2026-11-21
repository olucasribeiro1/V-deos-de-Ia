import type {Episode} from '../../systems/timeline/script.ts';
import {VOICES} from '../voices.ts';

/**
 * DEMONSTRAÇÃO OBRIGATÓRIA (30–45 s) — valida o pipeline antes do episódio completo.
 * Gancho nos primeiros 5 s; nova informação a cada ~5–8 s; termina em suspense.
 */
export const demo: Episode = {
  id: 'ep01-demo',
  title: 'As Primeiras 2 Horas — demonstração',
  series: 'hora-a-hora',
  voices: VOICES,
  scenes: [
    {
      id: 'demo',
      title: 'Chegada, ligação e batida na porta',
      set: 'apartment',
      light: 'dusk',
      chaos: 0.45,
      ambience: [
        {id: 'room_tone', vol: 0.35},
        {id: 'city_distant', vol: 0.25},
      ],
      music: [{id: 'drone_tension', vol: 0.18, at: 13, fadeIn: 6}],
      start: {spot: 'entrance', look: 'hallway'},
      state: {bagAt: 'hidden', entranceOpen: 0, lightsOn: 1, blinds: 0.15},
      hands: {r: 'hidden', l: 'hidden'},
      beats: [
        {
          line: {v: 'narrador', text: 'Faltavam duas horas para o mundo acabar. E eu ainda não sabia.', at: 0.3},
          pad: 0.4,
          do: [
            {a: 'sfx', id: 'bag_drop', at: 0.2, vol: 0.8},
            {a: 'set', at: 0.25, state: {bagAt: 'entrance'}},
            {a: 'glance', at: 0.1, target: {rel: true, yaw: -35, pitch: -30}, hold: 0.5},
            {a: 'walk', at: 1.2, to: 'hallEnd', pace: 'walk', arrive: 'livingRoom'},
          ],
        },
        {
          line: {v: 'narrador', text: 'O apartamento do Rafael. Meu irmão. Médico. O único que atendeu quando eu perdi tudo.', at: 0.1},
          pad: 0.3,
          do: [
            {a: 'walk', at: 0.0, to: 'livingCenter', pace: 'walk', arrive: 'sofa'},
            {a: 'glance', at: 4.2, target: 'tv', hold: 0.6},
          ],
        },
        {
          line: {v: 'narrador', text: 'Ele nunca ligava durante o plantão.', at: 1.2},
          pad: 0.1,
          do: [
            {a: 'sfx', id: 'phone_vibrate', at: 0, vol: 0.9},
            {a: 'tension', at: 0, v: 0.2},
            {a: 'phone', at: 0, screen: {kind: 'incoming', name: 'Rafael', pulse: 0}},
            {a: 'prop', at: 0.2, r: 'phone'},
            {a: 'hands', at: 0.2, r: 'phoneLook', dur: 0.7},
            {a: 'look', at: 0.3, target: {rel: true, yaw: -6, pitch: -22}, dur: 0.8},
          ],
        },
        {
          line: {v: 'rafael', phone: true, text: 'Escuta. Não sai do apartamento. Tranca a porta e enche tudo que tiver de água. Eu chego em duas horas.', at: 0.7},
          pad: 0.2,
          do: [
            {a: 'sfx', id: 'call_accept', at: 0, vol: 0.6},
            {a: 'phone', at: 0, screen: {kind: 'call', name: 'Rafael', seconds: 1}},
            {a: 'hands', at: 0.25, r: 'phoneEar', dur: 0.6},
            {a: 'look', at: 0.4, target: {rel: true, yaw: 0, pitch: 0}, dur: 0.8},
            {a: 'walk', at: 1.2, to: 'window', pace: 'walk', arrive: 'city'},
            {a: 'tension', at: 1, v: 0.45, dur: 4},
          ],
        },
        {
          line: {v: 'rafael', phone: true, text: 'Tem gente atacando gente aqui dentro. Não abre a porta pra ninguém. Ninguém!', at: 0.1},
          pad: 0.1,
          do: [{a: 'look', at: 0.6, target: 'street', dur: 1.6}],
        },
        {
          // sem narração: a tela "chamada encerrada" + bipe contam a história (não narrar o que a imagem mostra)
          min: 2.6,
          do: [
            {a: 'sfx', id: 'call_drop', at: 0, vol: 0.7},
            {a: 'phone', at: 0.3, screen: {kind: 'ended', name: 'Rafael', seconds: 23}},
            {a: 'hands', at: 0.1, r: 'phoneLook', dur: 0.6},
            {a: 'look', at: 0.2, target: {rel: true, yaw: 4, pitch: -24}, dur: 0.7},
          ],
        },
        {
          line: {v: 'narrador', text: 'Lá embaixo, a cidade começava a gritar.', at: 1.2},
          pad: 0.4,
          do: [
            {a: 'hands', at: 0.2, r: 'hidden', dur: 0.8},
            {a: 'prop', at: 1.0, r: 'none'},
            {a: 'look', at: 0.4, target: 'street', dur: 1.0},
            {
              a: 'actor',
              at: 0,
              track: {spec: {id: 'civil_a', height: 1.68, build: 0.95, skin: '#c99a7a', hair: '#1a1410', hairStyle: 'long', top: '#7a3b3b', topStyle: 'shirt', bottom: '#2f3540', shoes: '#ddd'}, variation: 0.2, y: -8.4, path: [[0, -13, -24.6], [7, 9, -24.3]], clips: [[0, 'run']]},
            },
            {
              a: 'actor',
              at: 1.2,
              track: {
                spec: {id: 'inf_agr', height: 1.83, build: 1.18, skin: '#9aa58e', hair: '#111', hairStyle: 'buzz', top: '#2c2f33', topStyle: 'hoodie', bottom: '#2a2a2a', shoes: '#111', infected: {decay: 0.4, blood: 0.9, eyes: '#e05a3a'}},
                variation: 0.7,
                y: -8.4,
                path: [[0, -15.5, -24.4], [6.5, 7, -24.2]],
                clips: [[0, 'lunge']],
              },
            },
            {a: 'sfx', id: 'scream_far', at: 1.6, vol: 0.5},
            {a: 'sfx', id: 'explosion_far', at: 3.4, vol: 0.7},
            {a: 'shake', at: 3.5, amp: 0.8, dur: 0.8},
            {a: 'tension', at: 3.5, v: 0.7},
          ],
        },
        {
          min: 5.0,
          do: [
            {a: 'sfx', id: 'door_knock', at: 0.6, vol: 1},
            {a: 'startle', at: 0.75, target: 'archway', amp: 1},
            {a: 'walk', at: 1.7, to: 'livingCenter', pace: 'slow', look: 'archway'},
            {a: 'danger', at: 0.8, v: 0.35, dur: 0.6},
            {a: 'sfx', id: 'heartbeat', at: 1.2, vol: 0.6},
            {a: 'sfx', id: 'door_knock', at: 2.6, vol: 1},
            {a: 'shake', at: 2.7, amp: 0.6},
            {a: 'fade', at: 3.5, v: 1, dur: 0.4},
            {a: 'title', at: 3.8, text: 'CONTINUA...', dur: 1.2},
          ],
        },
      ],
    },
  ],
};
