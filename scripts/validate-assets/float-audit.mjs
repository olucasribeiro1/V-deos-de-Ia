#!/usr/bin/env node
// AUDITORIA DE FLUTUAÇÃO/AFUNDAMENTO por cena (usa o AuditProbe no navegador).
// Uso: npm run audit:float -- <ep> [frames por cena=3]  → código 1 se algum personagem estiver > 6 cm fora do chão
// ou se houver objeto sem apoio (ignora peças finas coladas em superfícies: espessura < 2 cm).
import {execFileSync} from 'node:child_process';
import {loadEpisode} from '../lib/episode.mjs';
const [id = 'ep01', n = '3'] = process.argv.slice(2);
const {compiled} = await loadEpisode(id);
execFileSync('npx', ['remotion', 'bundle', 'src/remotion/index.ts', '--out-dir', 'out/.bundle', '--log=error']);
let bad = 0;
for (const s of compiled.scenes) {
  for (let i = 0; i < Number(n); i++) {
    const f = Math.min(s.frames - 1, Math.round(((i + 0.5) / Number(n)) * s.frames));
    let out = '';
    try {
      execFileSync('npx', ['remotion', 'still', 'out/.bundle', `${id}--${s.id}`, '/tmp/float-audit.png', `--frame=${f}`, '--scale=0.25', '--props={"bench":{"audit":true}}'], {stdio: 'pipe'});
    } catch (e) {
      out = String(e.stdout ?? '') + String(e.stderr ?? '');
    }
    const m = out.match(/AUDIT (\{.*?\})(?:\\n|\n|$)/) ?? out.match(/AUDIT (\{.*\})/);
    if (!m) {
      console.log(`  ? ${s.id} f${f}: sem resultado`);
      continue;
    }
    const d = JSON.parse(m[1].replace(/\\"/g, '"'));
    const feet = d.personagens.filter((p) => Math.abs(parseFloat(p.split('pés=')[1])) > 0.06);
    const objs = d.flutuando.filter((x) => Math.min(...x.split(' ')[2].split('x').map(Number)) >= 0.02);
    if (feet.length || objs.length) bad++;
    console.log(`  ${feet.length || objs.length ? '✗' : '✓'} ${s.id} f${f}: personagens ${d.personagens.length ? d.personagens.join(', ') : '—'}${objs.length ? ' | objetos soltos: ' + objs.join('; ') : ''}`);
  }
}
console.log(bad ? `✗ ${bad} amostra(s) com problema` : '✓ nada flutuando ou afundado');
process.exit(bad ? 1 : 0);
