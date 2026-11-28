import {Config} from '@remotion/cli/config';

// Use the preinstalled Chromium headless shell instead of downloading one.
Config.setBrowserExecutable(
  process.env.REMOTION_CHROME ??
    '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setMuted(true);
Config.setChromiumOpenGlRenderer('angle');
Config.setConcurrency(4);
Config.setOverwriteOutput(true);
