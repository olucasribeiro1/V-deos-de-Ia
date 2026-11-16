import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// WebGL (Three.js) em modo headless. "swangle" funciona sem GPU;
// se sua máquina tiver GPU, troque para "angle" para renderizar mais rápido.
Config.setChromiumOpenGlRenderer("swangle");
