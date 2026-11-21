// MODELO DE EPISÓDIO (roteiro de ações). Copie para src/episodes/<ep>/episode.ts.
import type {Episode} from '../../systems/timeline/script.ts';
import {VOICES} from '../voices.ts';

export const episode: Episode = {
  id: 'ep02',
  title: 'Título do episódio',
  series: 'hora-a-hora',
  voices: VOICES,
  scenes: [
    {
      id: 's01',
      title: 'Gancho',
      set: 'apartment',
      light: 'night',            // day | dusk | night | blackout
      chaos: 0.6,                // estado da cidade 0..1
      ambience: [{id: 'room_tone', vol: 0.35}, {id: 'city_distant', vol: 0.25}],
      music: [{id: 'drone_tension', vol: 0.15, at: 5, fadeIn: 4}],
      start: {spot: 'sofa', look: 'door', tension: 0.3},
      state: {bagAt: 'sofa', lightsOn: 1},
      hands: {r: 'hidden', l: 'hidden'},
      beats: [
        {line: {v: 'narrador', text: 'Frase-gancho nos primeiros segundos.'}, do: [{a: 'glance', at: 0.5, target: 'window'}]},
        {min: 3, do: [{a: 'sfx', id: 'door_knock'}, {a: 'startle', at: 0.15, target: 'door'}]},
        {line: {v: 'narrador', text: 'Reação.'}, do: [{a: 'walk', to: 'peephole', pace: 'slow', arrive: 'door'}]},
      ],
    },
  ],
};
