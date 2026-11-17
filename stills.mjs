// stills.mjs — renderiza quadros soltos para conferir: node stills.mjs Ep01 3 17.1 40 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const [id, ...segs] = process.argv.slice(2);
const local = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = process.env.REMOTION_BROWSER || (existsSync(local) ? local : null);
const chromiumOptions = { gl: process.env.REMOTION_GL || 'swangle' };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.jsx') });
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
mkdirSync('out/stills', { recursive: true });
for (const s of segs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  await renderStill({ composition, serveUrl, frame, output: `out/stills/${id}_${s}.png`, browserExecutable, chromiumOptions, scale: 0.4 });
  console.log('ok', s);
}
