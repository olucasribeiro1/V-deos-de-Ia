#!/usr/bin/env node
// GERADOR DE NARRAÇÃO (ElevenLabs) com cache por conteúdo.
// Uso: node scripts/generate-voice/generate.mjs src/episodes/ep01/demo.ts [--only <lineId>] [--force] [--dry]
//  - gera 1 MP3 por fala em public/episodes/<ep>/audio/ e atualiza manifest.json com a DURAÇÃO REAL;
//  - só regenera falas cujo texto/voz/ajustes mudaram (hash) → não gasta créditos à toa;
//  - --only regenera um único trecho; falas de telefone recebem filtro de banda telefônica.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {eleven, credits, duration, ff, readJson, pool, transcribe, wordScore} from '../lib/eleven.mjs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');
const dry = args.includes('--dry');
if (!file) {
  console.error('uso: generate.mjs <arquivo do episódio .ts> [--only id] [--force] [--dry]');
  process.exit(1);
}
const mod = await import(pathToFileURL(path.resolve(file)).href);
const ep = Object.values(mod).find((v) => v && v.scenes && v.voices);
const series = ep.id.split('-')[0]; // ep01-demo → ep01 (demo e episódio compartilham a pasta e o cache)
const outDir = path.resolve('public/episodes', series, 'audio');
fs.mkdirSync(outDir, {recursive: true});
const manPath = path.join(outDir, 'manifest.json');
const manifest = readJson(manPath, {});

const jobs = [];
for (const sc of ep.scenes) {
  sc.beats.forEach((b, i) => {
    if (!b.line) return;
    const id = `${sc.id}_b${String(i).padStart(2, '0')}`;
    const v = ep.voices[b.line.v];
    const prev = sc.beats.slice(0, i).reverse().find((x) => x.line && x.line.v === b.line.v)?.line.text;
    const next = sc.beats.slice(i + 1).find((x) => x.line && x.line.v === b.line.v)?.line.text;
    const hash = crypto.createHash('sha1').update(JSON.stringify([b.line.text, b.line.phone, b.line.fx, v])).digest('hex').slice(0, 12);
    jobs.push({id, line: b.line, voice: v, prev, next, hash});
  });
}
const todo = jobs.filter((j) => (only ? j.id === only : force || manifest[j.id]?.hash !== j.hash || !fs.existsSync(path.join(outDir, manifest[j.id]?.file ?? '_'))));
const chars = todo.reduce((a, j) => a + j.line.text.length, 0);
console.log(`[voz] ${ep.id}: ${jobs.length} falas, ${todo.length} a gerar (${chars} caracteres)`);
if (dry || !todo.length) process.exit(0);

const t0 = Date.now();
await pool(todo, 3, async (j) => {
  const raw = path.join(outDir, `${j.id}.raw.mp3`);
  const out = `${j.id}.mp3`;
  const synth = (stab) =>
    eleven(`/v1/text-to-speech/${j.voice.voiceId}?output_format=mp3_44100_128`, {
      text: j.line.text,
      model_id: j.voice.model ?? 'eleven_multilingual_v2',
      language_code: 'pt',
      ...((j.voice.model ?? '').includes('v3') ? {} : {previous_text: j.prev, next_text: j.next}),
      voice_settings: {stability: stab, similarity_boost: j.voice.similarity ?? 0.8, style: j.voice.style ?? 0.2, use_speaker_boost: true, speed: j.voice.speed ?? 1},
    });
  // VERIFICAÇÃO DE PRONÚNCIA: transcreve e compara com o roteiro; se divergir, 1 nova tentativa mais estável
  let stab = j.voice.stability ?? 0.5;
  fs.writeFileSync(raw, await synth(stab));
  const spoken = j.line.text.replace(/\[[^\]]+\]\s*/g, ''); // marcações [sighs] não são faladas
  let check = wordScore(spoken, await transcribe(raw));
  if (check.score < 0.92) {
    console.log(`  ! ${j.id} pronúncia divergente (${(check.score * 100).toFixed(0)}%: +[${check.extra}] -[${check.missing}]) → nova tentativa mais estável`);
    const alt = raw.replace('.raw.', '.alt.');
    fs.writeFileSync(alt, await synth((j.voice.model ?? '').includes('v3') ? 1 : Math.min(0.85, stab + 0.2)));
    const c2 = wordScore(spoken, await transcribe(alt));
    if (c2.score > check.score) {
      fs.renameSync(alt, raw);
      check = c2;
    } else fs.unlinkSync(alt);
  }
  j.check = check;
  // normaliza loudness (narração ~ -16 LUFS); telefone: banda 300–3400 Hz + leve saturação
  const fx = j.line.fx ?? (j.line.phone ? 'phone' : null);
  const FILTERS = {
    phone: 'highpass=f=320,lowpass=f=3300,acompressor=threshold=-20dB:ratio=4,volume=1.6,aformat=sample_rates=44100,loudnorm=I=-18:TP=-2',
    tv: 'highpass=f=180,lowpass=f=6000,aecho=0.8:0.5:35:0.25,aformat=sample_rates=44100,loudnorm=I=-24:TP=-3',
    door: 'lowpass=f=1100,aecho=0.8:0.6:25|60:0.35|0.2,aformat=sample_rates=44100,loudnorm=I=-21:TP=-2',
  };
  const filt = FILTERS[fx] ?? 'loudnorm=I=-16:TP=-1.5,aformat=sample_rates=44100';
  ff(['-i', raw, '-af', filt, '-c:a', 'libmp3lame', '-b:a', '160k', path.join(outDir, out)]);
  fs.unlinkSync(raw);
  const dur = duration(path.join(outDir, out));
  manifest[j.id] = {file: out, dur: Math.round(dur * 1000) / 1000, hash: j.hash, voice: j.line.v, pronuncia: Math.round(j.check.score * 100) / 100};
  fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2)); // salva a cada fala (falha não perde o que já foi pago)
  console.log(`  ${j.check.score >= 0.92 ? '✓' : '✗ REVISAR'} ${j.id} ${dur.toFixed(2)}s pronúncia ${(j.check.score * 100).toFixed(0)}%  ${j.line.text.slice(0, 50)}`);
});
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2));
const c = await credits();
console.log(`[voz] concluído em ${((Date.now() - t0) / 1000).toFixed(1)}s${c ? ` — créditos usados no ciclo: ${c.used}/${c.limit}` : ''}`);
