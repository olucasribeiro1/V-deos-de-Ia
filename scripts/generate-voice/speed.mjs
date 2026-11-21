#!/usr/bin/env node
// Ajusta a VELOCIDADE da narração já gerada, POR CENA (sem gastar créditos): ffmpeg atempo preserva o tom.
// Uso: node scripts/generate-voice/speed.mjs src/episodes/ep01/episode.ts [padrão=1.3]
// Cada cena define `tempo` (1.15–1.5). Mantém o original (`orig`); idempotente (só refaz o que mudou).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const [file, def = '1.3'] = process.argv.slice(2);
const mod = await import(pathToFileURL(path.resolve(file)).href);
const ep = Object.values(mod).find((v) => v && v.scenes && v.voices);
const dir = path.resolve('public/episodes', ep.id.split('-')[0], 'audio');
const manPath = path.join(dir, 'manifest.json');
const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
let n = 0;
for (const sc of ep.scenes) {
  const k = Math.min(1.5, Math.max(1, sc.tempo ?? Number(def)));
  sc.beats.forEach((b, i) => {
    if (!b.line || b.line.ref) return;
    const id = `${sc.id}_b${String(i).padStart(2, '0')}`;
    const e = man[id];
    if (!e) return;
    const orig = e.orig ?? e.file;
    if (e.tempo === k && fs.existsSync(path.join(dir, e.file))) return;
    const out = k === 1 ? orig : `${id}.x${Math.round(k * 100)}.mp3`;
    if (k !== 1) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(dir, orig), '-af', `atempo=${k}`, '-c:a', 'libmp3lame', '-b:a', '160k', path.join(dir, out)]);
    const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dir, out)]).toString());
    Object.assign(e, {orig, file: out, dur: Math.round(dur * 1000) / 1000, tempo: k});
    n++;
  });
}
fs.writeFileSync(manPath, JSON.stringify(man, null, 2));
console.log(`[velocidade] ${n} falas ajustadas por cena (sem créditos)`);
