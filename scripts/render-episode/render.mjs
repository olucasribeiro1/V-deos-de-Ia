#!/usr/bin/env node
// RENDER SEGMENTADO COM CACHE, CHECKPOINT E MÉTRICAS.
// Uso: npm run render -- <episodio> [--preview] [--scenes s01,s02] [--concurrency N] [--force]
//  - 1 segmento por cena; o hash (roteiro+áudio+motor+parâmetros) decide se a cena precisa ser re-renderizada;
//  - estado salvo em out/<ep>/render-state.json → retoma após interrupção;
//  - cada segmento é validado (ffprobe/decodificação) antes de ser aceito; montagem final sem re-encode;
//  - métricas reais (tempo, fps de render, RAM de pico) em out/<ep>/metrics.json.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn, execFileSync} from 'node:child_process';
import {loadEpisode, engineHash, sceneHash} from '../lib/episode.mjs';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--')) ?? 'ep01-demo';
const preview = args.includes('--preview');
const force = args.includes('--force');
const only = args.includes('--scenes') ? args[args.indexOf('--scenes') + 1].split(',') : null;
const conc = args.includes('--concurrency') ? Number(args[args.indexOf('--concurrency') + 1]) : Math.max(1, Math.min(4, os.cpus().length));
const settings = {scale: preview ? 0.5 : 1, crf: preview ? 28 : 20, jpeg: preview ? 70 : 88, pix: 'yuv420p'};

const T0 = Date.now();
const {ep, compiled, narr, sfx} = await loadEpisode(id);
const errs = compiled.issues.filter((i) => i.level === 'erro');
if (errs.length) {
  console.error('✗ erros de timing — rode npm run validate:', errs.map((e) => e.msg).join('; '));
  process.exit(1);
}
const engine = engineHash();
const outDir = path.resolve('out', id + (preview ? '-preview' : ''));
const segDir = path.join(outDir, 'segments');
fs.mkdirSync(segDir, {recursive: true});
const statePath = path.join(outDir, 'render-state.json');
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {scenes: {}};
const save = () => fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
const log = (m) => {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${m}`;
  console.log(line);
  fs.appendFileSync(path.join(outDir, 'render.log'), line + '\n');
};

function probeFrames(f) {
  try {
    const d = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
    const v = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,codec_name', '-of', 'csv=p=0', f]).toString().trim();
    const a = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', f]).toString().trim();
    return {d, v, a};
  } catch {
    return null;
  }
}

// 1) bundle único (reaproveitado por todas as cenas)
const bundleDir = path.resolve('out/.bundle');
const tB = Date.now();
await run('npx', ['remotion', 'bundle', 'src/remotion/index.ts', '--out-dir', bundleDir, '--log=error']);
log(`bundle pronto em ${((Date.now() - tB) / 1000).toFixed(1)}s (motor ${engine})`);

// monitor de memória (pico do sistema durante o render)
let peakUsed = 0;
const mon = setInterval(() => {
  peakUsed = Math.max(peakUsed, os.totalmem() - os.freemem());
}, 1000);

const metrics = {episode: id, preview, concurrency: conc, cpus: os.cpus().length, ramGB: +(os.totalmem() / 2 ** 30).toFixed(1), scenes: []};
for (const sc of compiled.scenes) {
  if (only && !only.includes(sc.id)) continue;
  const hash = sceneHash(ep, sc, narr, sfx, engine, settings);
  const file = path.join(segDir, `${sc.id}.${hash}.mp4`);
  const prev = state.scenes[sc.id];
  const expected = sc.frames / 24;
  if (!force && prev?.hash === hash && prev.status === 'CONCLUÍDO' && fs.existsSync(file)) {
    log(`= ${sc.id}: inalterada (hash ${hash}) — reaproveitada`);
    metrics.scenes.push({id: sc.id, cached: true, seconds: expected});
    continue;
  }
  state.scenes[sc.id] = {hash, file: path.relative(outDir, file), status: 'EM EXECUÇÃO', startedAt: new Date().toISOString(), frames: sc.frames};
  save();
  const t = Date.now();
  log(`▶ ${sc.id}: ${sc.frames} frames (${expected.toFixed(1)}s de vídeo), concorrência ${conc}`);
  try {
    await run(
      'npx',
      [
        'remotion', 'render', bundleDir, `${id}--${sc.id}`, file + '.part.mp4',
        `--concurrency=${conc}`, `--scale=${settings.scale}`, `--pixel-format=${settings.pix}`, '--color-space=bt709', `--crf=${settings.crf}`, `--jpeg-quality=${settings.jpeg}`,
        '--gl=angle', '--codec=h264', '--audio-codec=aac', '--audio-bitrate=192k', '--log=info', // info = linhas de progresso → heartbeat
        '--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
      ].filter((x) => !x.startsWith('--browser-executable') || fs.existsSync(x.split('=')[1])),
      (line) => {
        // heartbeat de progresso (o supervisor distingue tarefa longa de tarefa travada)
        fs.writeFileSync(path.join(outDir, 'heartbeat'), `${Date.now()} ${sc.id} ${line.slice(0, 80)}`);
      },
    );
    const p = probeFrames(file + '.part.mp4');
    if (!p || Math.abs(p.d - expected) > 0.25 || !p.a.startsWith('aac')) throw new Error(`segmento inválido: ${JSON.stringify(p)} (esperado ${expected.toFixed(2)}s com AAC)`);
    fs.renameSync(file + '.part.mp4', file);
    // remove versões antigas desta cena
    for (const f of fs.readdirSync(segDir)) if (f.startsWith(sc.id + '.') && path.join(segDir, f) !== file) fs.unlinkSync(path.join(segDir, f));
    const secs = (Date.now() - t) / 1000;
    Object.assign(state.scenes[sc.id], {status: 'CONCLUÍDO', renderSeconds: secs, finishedAt: new Date().toISOString()});
    save();
    metrics.scenes.push({id: sc.id, frames: sc.frames, seconds: expected, renderSeconds: secs, renderFps: +(sc.frames / secs).toFixed(2), ratio: +(secs / expected).toFixed(2)});
    log(`✓ ${sc.id}: ${secs.toFixed(1)}s de render → ${(sc.frames / secs).toFixed(2)} fps (${(secs / expected).toFixed(2)}× tempo real)`);
  } catch (e) {
    Object.assign(state.scenes[sc.id], {status: 'FALHOU', error: String(e.message ?? e).slice(0, 500)});
    save();
    log(`✗ ${sc.id}: ${e.message}`);
    clearInterval(mon);
    process.exit(1);
  }
}
clearInterval(mon);

// 2) montagem final (concat sem re-encode) + verificação
const list = compiled.scenes.map((s) => state.scenes[s.id]).filter(Boolean);
if (list.length === compiled.scenes.length && list.every((s) => s.status === 'CONCLUÍDO')) {
  const concat = path.join(outDir, 'concat.txt');
  fs.writeFileSync(concat, list.map((s) => `file '${path.join(outDir, s.file)}'`).join('\n'));
  const final = path.join(outDir, `${id}${preview ? '-preview' : ''}.mp4`);
  await run('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', concat, '-c', 'copy', '-movflags', '+faststart', final]);
  log(`🎬 montado: ${final}`);
  if (!preview) {
    try {
      execFileSync('bash', ['scripts/render-episode/verify-mp4.sh', final, String(compiled.totalFrames / 24), '0.6'], {stdio: 'inherit'});
    } catch {
      log('✗ verificação do MP4 final falhou');
      process.exit(1);
    }
  }
  metrics.final = final;
}
metrics.totalSeconds = +((Date.now() - T0) / 1000).toFixed(1);
metrics.videoSeconds = compiled.totalFrames / 24;
metrics.peakRamGB = +(peakUsed / 2 ** 30).toFixed(2);
const rendered = metrics.scenes.filter((s) => s.renderSeconds);
if (rendered.length) {
  const rs = rendered.reduce((a, s) => a + s.renderSeconds, 0);
  const vs = rendered.reduce((a, s) => a + s.seconds, 0);
  metrics.renderRatio = +(rs / vs).toFixed(2); // segundos de render por segundo de vídeo
  metrics.estimate11minMinutes = +((metrics.renderRatio * 660) / 60).toFixed(1);
}
fs.writeFileSync(path.join(outDir, 'metrics.json'), JSON.stringify(metrics, null, 2));
log(`⏱ total ${metrics.totalSeconds}s | pico RAM ${metrics.peakRamGB} GB${metrics.renderRatio ? ` | ${metrics.renderRatio}s de render por s de vídeo → 11 min ≈ ${metrics.estimate11minMinutes} min` : ''}`);

function run(cmd, a, onLine) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, a, {stdio: ['ignore', 'pipe', 'pipe']});
    let tail = '';
    const handle = (d) => {
      const s = d.toString();
      tail = (tail + s).slice(-2000);
      if (onLine) s.split(/\r|\n/).filter(Boolean).forEach(onLine);
    };
    p.stdout.on('data', handle);
    p.stderr.on('data', handle);
    p.on('close', (code) => (code === 0 ? res() : rej(new Error(`${cmd} saiu com código ${code}: ${tail.slice(-600)}`))));
  });
}
