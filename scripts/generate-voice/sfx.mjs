#!/usr/bin/env node
// BIBLIOTECA DE EFEITOS SONOROS (reutilizável entre episódios), com cache.
// Uso: node scripts/generate-voice/sfx.mjs [--only id] [--force]
// Fontes: ElevenLabs Sound Effects (sons orgânicos) ou síntese local via ffmpeg (bipes, ruído) — custo zero.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {eleven, duration, ff, readJson, pool} from '../lib/eleven.mjs';

// Categorias: ambiente | personagem | interação | música
export const LIBRARY = {
  // --- ambiente ---
  room_tone: {synth: ['-f', 'lavfi', '-i', 'anoisesrc=color=brown:amplitude=0.05:d=20', '-af', 'lowpass=f=400,volume=0.9']},
  city_distant: {prompt: 'distant city ambience at dusk heard from inside an apartment, faint traffic, far away sirens, muffled', dur: 20, loop: true},
  sirens_close: {prompt: 'several police and ambulance sirens passing on the street below, urgent, city echo', dur: 10},
  rain_window: {prompt: 'rain hitting an apartment window, steady, cozy but dark', dur: 20, loop: true},
  // --- personagem ---
  footstep_1: {prompt: 'single footstep, sneaker on wooden floor, indoor, close, one step only', dur: 0.6},
  footstep_2: {prompt: 'one soft footstep on hardwood floor, rubber sole, indoor, dry', dur: 0.6},
  footstep_3: {prompt: 'single step on wooden apartment floor with slight creak, close', dur: 0.6},
  heartbeat: {prompt: 'tense fast heartbeat, deep thumps, cinematic', dur: 5},
  breath_scared: {prompt: 'man breathing fast and scared, trying to stay quiet, close mic', dur: 5},
  scream_far: {prompt: 'distant woman scream in the street far below, city echo, horror', dur: 2.5},
  zombie_growl: {prompt: 'infected person growling and gurgling behind a door, aggressive, horror', dur: 4},
  // --- interação ---
  bag_drop: {prompt: 'heavy duffel bag dropped on a wooden floor, thud', dur: 1},
  phone_vibrate: {prompt: 'smartphone vibrating in hand with a simple ringtone, two rings', dur: 4},
  call_accept: {synth: ['-f', 'lavfi', '-i', 'sine=f=880:d=0.09', '-f', 'lavfi', '-i', 'sine=f=1320:d=0.12', '-filter_complex', '[0][1]concat=n=2:v=0:a=1,volume=0.5']},
  call_drop: {synth: ['-f', 'lavfi', '-i', 'sine=f=480:d=0.25', '-f', 'lavfi', '-i', 'anullsrc=d=0.15', '-f', 'lavfi', '-i', 'sine=f=480:d=0.25', '-f', 'lavfi', '-i', 'anullsrc=d=0.15', '-f', 'lavfi', '-i', 'sine=f=480:d=0.25', '-filter_complex', '[0][1][2][3][4]concat=n=5:v=0:a=1,volume=0.45']},
  door_knock: {prompt: 'three heavy desperate knocks on an apartment wooden door, close, from inside', dur: 2.5},
  door_bang: {prompt: 'someone violently banging and slamming against a locked wooden apartment door, frantic', dur: 5},
  lock_turn: {prompt: 'deadbolt lock turning, metallic click, apartment door', dur: 1},
  explosion_far: {prompt: 'distant explosion in the city, deep rumble and rattling windows, far away', dur: 4},
  // --- música (pistas curtas em loop; silêncio também é recurso) ---
  drone_tension: {prompt: 'dark cinematic tension drone, low strings and sub bass pulse, slow, horror suspense underscore, no melody', dur: 22, loop: true},
};

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');
const dir = path.resolve('public/library/sfx');
fs.mkdirSync(dir, {recursive: true});
const manPath = path.join(dir, 'manifest.json');
const man = readJson(manPath, {});

const entries = Object.entries(LIBRARY).filter(([id, d]) => {
  if (only && id !== only) return false;
  const h = crypto.createHash('sha1').update(JSON.stringify(d)).digest('hex').slice(0, 10);
  d.hash = h;
  return force || man[id]?.hash !== h || !fs.existsSync(path.join(dir, man[id]?.file ?? '_'));
});
console.log(`[sfx] ${entries.length} efeitos a gerar`);
await pool(entries, 3, async ([id, d]) => {
  const out = path.join(dir, `${id}.mp3`);
  if (d.synth) {
    ff([...d.synth, '-ac', '2', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '160k', out]);
  } else {
    const buf = await eleven('/v1/sound-generation?output_format=mp3_44100_128', {
      text: d.prompt,
      duration_seconds: d.dur,
      prompt_influence: 0.55,
      loop: !!d.loop,
    });
    const raw = out.replace('.mp3', '.raw.mp3');
    fs.writeFileSync(raw, buf);
    // apara silêncio inicial (sincronia precisa com a ação) exceto loops
    const af = d.loop ? 'loudnorm=I=-20:TP=-2' : 'silenceremove=start_periods=1:start_threshold=-45dB,loudnorm=I=-18:TP=-1.5';
    ff(['-i', raw, '-af', af, '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '160k', out]);
    fs.unlinkSync(raw);
  }
  man[id] = {file: `${id}.mp3`, dur: Math.round(duration(out) * 1000) / 1000, hash: d.hash};
  fs.writeFileSync(manPath, JSON.stringify(man, null, 2));
  console.log(`  ✓ ${id} ${man[id].dur}s`);
});
fs.writeFileSync(manPath, JSON.stringify(man, null, 2));
console.log('[sfx] manifesto atualizado');
