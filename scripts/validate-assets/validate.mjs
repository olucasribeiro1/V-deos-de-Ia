#!/usr/bin/env node
// VERIFICAÇÃO PRÉ-RENDER (rápida, sem GPU): timing de falas/ações/sons, arquivos de áudio, identidade do protagonista.
// Uso: npm run validate -- <episodio>   → sai com código 1 se houver ERRO (avisos não bloqueiam).
import fs from 'node:fs';
import {loadEpisode} from '../lib/episode.mjs';

const id = process.argv[2] ?? 'ep01-demo';
const {compiled, series, sfx} = await loadEpisode(id);
const issues = [...compiled.issues];
for (const s of compiled.scenes) {
  for (const l of s.lines) {
    if (l.file && !fs.existsSync(`public/episodes/${series}/audio/${l.file}`)) issues.push({level: 'erro', msg: `[${s.id}] arquivo de fala ausente: ${l.file}`});
  }
  for (const [k, v] of Object.entries(sfx)) if (!fs.existsSync(`public/library/sfx/${v.file}`)) issues.push({level: 'erro', msg: `SFX ausente no disco: ${k}`});
}
const charLib = fs.readFileSync('src/library/characters.ts', 'utf8');
if (!/cap:\s*PAL\.capRed/.test(charLib)) issues.push({level: 'erro', msg: 'CHARACTER BIBLE: protagonista sem boné vermelho'});

const total = compiled.totalFrames / 24;
console.log(`\n${id}: ${compiled.scenes.length} cena(s), ${(total / 60).toFixed(2)} min (${compiled.totalFrames} frames)`);
for (const s of compiled.scenes) {
  const speech = s.lines.reduce((a, l) => a + l.dur, 0);
  console.log(`  ${s.id.padEnd(10)} ${(s.frames / 24).toFixed(1).padStart(6)}s  falas ${s.lines.length} (${speech.toFixed(1)}s, ${((speech / (s.frames / 24)) * 100).toFixed(0)}% do tempo)  sfx ${s.sfx.length}  atores ${s.actors.length}`);
}
const errs = issues.filter((i) => i.level === 'erro');
for (const i of issues) console.log(`  ${i.level === 'erro' ? '✗ ERRO ' : '! aviso'} ${i.msg}`);
console.log(errs.length ? `\n✗ ${errs.length} erro(s) — corrija antes de renderizar` : '\n✓ timing e assets OK');
process.exit(errs.length ? 1 : 0);
