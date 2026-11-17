// render.mjs — renderiza a composição via código
// Uso: node render.mjs [compId] [saida.mp4] '{"titulo":"..."}'
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const m = JSON.parse(readFileSync('./metrics.json', 'utf8'));
const [id = 'Cena', output = 'out/video.mp4', propsJson = '{}'] = process.argv.slice(2);
const inputProps = JSON.parse(propsJson);

// Usa o Chrome indicado em REMOTION_BROWSER (ou o da máquina, se existir); senão o Remotion baixa um
const local = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = process.env.REMOTION_BROWSER || (existsSync(local) ? local : null);

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.jsx') });
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, chromiumOptions: { gl: process.env.REMOTION_GL || 'swangle' } });

await renderMedia({
  composition, serveUrl, inputProps, browserExecutable,
  codec: m.codec, crf: m.crf,
  outputLocation: output,
  concurrency: Number(process.env.CONCURRENCY) || null,
  // 'swangle' = WebGL por software (funciona sem GPU). Com GPU: REMOTION_GL=angle
  chromiumOptions: { gl: process.env.REMOTION_GL || 'swangle' },
  onProgress: ({ progress }) => process.stdout.write(`\rRenderizando ${(progress * 100).toFixed(0)}%`),
});
console.log(`\n✅ ${output}`);
