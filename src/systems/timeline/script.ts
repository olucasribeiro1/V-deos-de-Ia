/**
 * FORMATO DO ROTEIRO DE AÇÕES (dados puros — sem React; importável pelo Node e pelo Remotion).
 * Um episódio = cenas; cada cena = beats; cada beat = uma fala (opcional) + ações + sons.
 * A duração de cada beat vem da duração REAL do áudio da fala (manifest), nunca de chute.
 */
import type {HandPoseName} from '../animation/handPoses';
import type {LookName, SpotName} from '../../components/environments/apartmentData';
import type {ApartmentState} from '../../components/environments/Apartment';
import type {PhoneScreen} from '../../components/props/Phone';
import type {ActorTrack} from '../../components/characters/Actor';
import type {LightPreset} from '../../components/lighting/Lighting';

export type VoiceId = 'protagonista' | 'rafael' | 'vizinho' | 'reporter';

/** Alvo de olhar: nome do cenário, ponto 3D, ângulo absoluto ou relativo ao olhar atual ({rel:true}). */
export type Target = LookName | {yaw?: number; pitch?: number; rel?: boolean} | [number, number, number];

/** then: true = só começa quando o movimento atual (andar/agachar) terminar. */
export type Action = {at?: number; then?: boolean} & (
  | {a: 'walk'; to: SpotName; pace?: 'slow' | 'walk' | 'brisk' | 'run'; look?: Target; arrive?: Target}
  | {a: 'look'; at_?: never; target: Target; dur?: number}
  | {a: 'glance'; target: Target; hold?: number; dur?: number}
  | {a: 'startle'; target?: Target; amp?: number}
  | {a: 'scan'; from: Target; to: Target; dur?: number} // varredura lenta (avaliar ambiente)
  | {a: 'height'; h: number; dur?: number} // agachar/levantar
  | {a: 'tension'; v: number; dur?: number}
  | {a: 'hands'; r?: HandPoseName; l?: HandPoseName; dur?: number}
  | {a: 'prop'; r?: PropName; l?: PropName}
  | {a: 'phone'; screen: PhoneScreen}
  | {a: 'set'; state: Partial<ApartmentState>; dur?: number}
  | {a: 'sfx'; id: string; vol?: number; loop?: number}
  | {a: 'fov'; v: number; dur?: number}
  | {a: 'shake'; amp: number; dur?: number; freq?: number}
  | {a: 'actor'; track: ActorTrack}
  | {a: 'fade'; v: number; dur?: number}
  | {a: 'danger'; v: number; dur?: number}
  | {a: 'lens'; v: number; dur?: number} // olho mágico: 1 = máscara circular olho-de-peixe
  | {a: 'title'; text: string; dur?: number}
);

export type PropName = 'none' | 'phone' | 'bottle' | 'can' | 'keys' | 'flashlight' | 'knife';

/** fx: phone = banda telefônica · tv = alto-falante de TV na sala · door = abafado atrás da porta. */
export type Line = {v: VoiceId; text: string; phone?: boolean; fx?: 'phone' | 'tv' | 'door'; at?: number};

export type Beat = {
  line?: Line;
  pad?: number; // respiro após a fala (s)
  min?: number; // duração mínima do beat (s)
  do?: Action[];
};

export type Scene = {
  id: string;
  title: string;
  set: 'apartment';
  light: LightPreset;
  chaos?: number; // estado da cidade 0..1
  ambience?: {id: string; vol: number}[];
  music?: {id: string; vol: number; at?: number; fadeIn?: number}[];
  start: {spot: SpotName; look: Target; h?: number; tension?: number};
  state?: Partial<ApartmentState>;
  hands?: {r?: HandPoseName; l?: HandPoseName; rProp?: PropName; lProp?: PropName};
  phone?: PhoneScreen;
  beats: Beat[];
};

export type VoiceDef = {voiceId: string; name: string; model?: string; stability?: number; similarity?: number; style?: number; speed?: number};

export type Episode = {
  id: string;
  title: string;
  series: string;
  voices: Record<VoiceId, VoiceDef>;
  scenes: Scene[];
};

/** Manifesto gerado pelo script de narração: duração REAL de cada fala. */
export type NarrationManifest = Record<string, {file: string; dur: number; hash: string; voice: VoiceId}>;
export type SfxManifest = Record<string, {file: string; dur: number}>;

export const lineId = (sceneId: string, beatIndex: number) => `${sceneId}_b${String(beatIndex).padStart(2, '0')}`;
