/**
 * REGISTRO DE EPISÓDIOS: liga o roteiro (dados) aos manifestos de áudio e compila as trilhas.
 * Para adicionar um episódio: crie src/episodes/<id>/episode.ts e registre aqui (ver docs/NOVO-EPISODIO.md).
 */
import {compileEpisode, type CompiledEpisode} from '../systems/timeline/compile';
import type {NarrationManifest, SfxManifest} from '../systems/timeline/script';
import {demo} from './ep01/demo.ts';
import ep01Narr from '../../public/episodes/ep01/audio/manifest.json';
import sfxManifest from '../../public/library/sfx/manifest.json';

export const SFX = sfxManifest as SfxManifest;

const DEFS = [{episode: demo, narr: ep01Narr as NarrationManifest, audioBase: 'episodes/ep01/audio'}];

export const COMPILED: Record<string, CompiledEpisode & {audioBase: string}> = Object.fromEntries(
  DEFS.map((d) => [d.episode.id, {...compileEpisode(d.episode, d.narr, SFX), audioBase: d.audioBase}]),
);

export const EPISODES = Object.values(COMPILED).map((c) => ({
  id: c.episode.id,
  totalFrames: c.totalFrames,
  scenes: c.scenes.map((s) => ({id: s.id, frames: s.frames})),
}));
