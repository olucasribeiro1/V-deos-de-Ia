// Gera legendas (public/legendas.json) a partir de um áudio usando Whisper.cpp local.
// Uso: node scripts/transcrever.mjs public/narracao.wav
// O áudio precisa ser WAV 16kHz mono: ffmpeg -i entrada.mp3 -ar 16000 -ac 1 public/narracao.wav
import path from "node:path";
import fs from "node:fs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const audio = process.argv[2];
if (!audio) {
  console.error("Uso: node scripts/transcrever.mjs <arquivo.wav>");
  process.exit(1);
}

const pasta = path.join(process.cwd(), "whisper.cpp");
const modelo = "medium"; // use "small" ou "base" para ser mais rápido

await installWhisperCpp({ to: pasta, version: "1.5.5" });
await downloadWhisperModel({ model: modelo, folder: pasta });

const saida = await transcribe({
  inputPath: path.resolve(audio),
  whisperPath: pasta,
  whisperCppVersion: "1.5.5",
  model: modelo,
  language: "pt",
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput: saida });
fs.writeFileSync("public/legendas.json", JSON.stringify(captions, null, 2));
console.log(`✔ ${captions.length} legendas salvas em public/legendas.json`);
