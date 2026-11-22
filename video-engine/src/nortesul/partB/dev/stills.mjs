// Dev helper: bundle once, render many stills of NorteSulPartB at scale 0.5.
// usage: node src/nortesul/partB/dev/stills.mjs 33 111 189 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const composition = await selectComposition({serveUrl, id: 'NorteSulPartB', browserExecutable});
for (const frame of frames) {
  await renderStill({serveUrl, composition, frame, output: `out/nortesul/b_${frame}.jpg`, imageFormat: 'jpeg', scale: 0.5, browserExecutable});
  console.log('ok', frame);
}
