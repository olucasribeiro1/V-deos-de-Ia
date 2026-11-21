// Carrega e compila um episódio no Node (mesmo compilador usado pelo Remotion) → timing, hashes, relatório.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {readJson} from './eleven.mjs';

export const EPISODE_FILES = {
  'ep01-demo': 'src/episodes/ep01/demo.ts',
  ep01: 'src/episodes/ep01/episode.ts',
};

export async function loadEpisode(id) {
  const file = EPISODE_FILES[id];
  if (!file) throw new Error(`Episódio desconhecido: ${id}. Registre em scripts/lib/episode.mjs e src/episodes/registry.ts`);
  const mod = await import(pathToFileURL(path.resolve(file)).href);
  const ep = Object.values(mod).find((v) => v && v.scenes && v.voices);
  const series = id.split('-')[0];
  const narr = readJson(`public/episodes/${series}/audio/manifest.json`, {});
  const sfx = readJson('public/library/sfx/manifest.json', {});
  const {compileEpisode} = await import(pathToFileURL(path.resolve('src/systems/timeline/compile.ts')).href);
  const compiled = compileEpisode(ep, narr, sfx, 24);
  return {ep, compiled, narr, sfx, series};
}

/** Hash do código compartilhado (sistemas/componentes/biblioteca). Mudou o motor → cenas inválidas. */
export function engineHash() {
  const h = crypto.createHash('sha1');
  const walk = (d) => {
    for (const f of fs.readdirSync(d).sort()) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) {
        if (p.includes(path.join('src', 'episodes'))) continue;
        walk(p);
      } else h.update(p).update(fs.readFileSync(p));
    }
  };
  walk('src');
  for (const f of ['remotion.config.ts', 'package-lock.json']) if (fs.existsSync(f)) h.update(fs.readFileSync(f));
  return h.digest('hex').slice(0, 10);
}

/** Hash de UMA cena: dados do roteiro + áudios usados + motor + parâmetros de render. */
export function sceneHash(ep, scene, narr, sfx, engine, settings) {
  const h = crypto.createHash('sha1');
  const def = ep.scenes.find((s) => s.id === scene.id);
  h.update(JSON.stringify(def));
  h.update(JSON.stringify(scene.lines.map((l) => narr[l.id] ?? null)));
  h.update(JSON.stringify(sfx));
  h.update(JSON.stringify(ep.voices));
  h.update(engine);
  h.update(JSON.stringify(settings));
  return h.digest('hex').slice(0, 12);
}
