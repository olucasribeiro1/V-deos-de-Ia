import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

// Padrões do estúdio: 720p/24fps definidos nas composições; aqui só o motor.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(88);
Config.setCodec('h264');
Config.setCrf(20);
Config.setPixelFormat('yuv420p');
Config.setChromiumOpenGlRenderer('angle');
// Usa o Chromium pré-instalado quando existir (container sem acesso ao download do Remotion).
const local = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(local)) Config.setBrowserExecutable(local);
