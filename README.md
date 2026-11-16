# Vídeos de IA

Vídeos animados 2D feitos com **Remotion** + **Three.js** (cenas, legendas, áudio e renderização).

## Instalação

```bash
npm install
```

Requer Node 18+ e FFmpeg (o Remotion já traz o seu próprio FFmpeg).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Abre o Remotion Studio (preview no navegador) |
| `npm run render` | Renderiza `MeuVideo` em `out/video.mp4` |
| `npm run render:all` | Renderiza todas as composições |
| `npm run still` | Gera uma imagem (thumbnail) em `out/thumb.png` |
| `npm run transcrever -- public/narracao.wav` | Gera `public/legendas.json` com Whisper |
| `npm run typecheck` | Verifica os tipos TypeScript |

## Estrutura

```
src/
  index.ts              # ponto de entrada do Remotion
  Root.tsx              # registro das composições (resolução, fps, duração)
  MeuVideo.tsx          # vídeo vertical 1080x1920: Three.js + título + legendas + áudio
  Cena3D.tsx            # exemplo de cena Three.js 1920x1080
  components/
    FormasThree.tsx     # formas 2D com câmera ortográfica do Three.js
    Legendas.tsx        # legendas estilo TikTok (@remotion/captions)
public/
  musica.mp3            # áudio de exemplo (troque pela sua narração/trilha)
  legendas.json         # legendas de exemplo
scripts/
  transcrever.mjs       # transcrição automática com Whisper.cpp
```

## Fluxo para um novo vídeo

1. Coloque a narração em `public/` e converta para WAV 16 kHz:
   `ffmpeg -i narracao.mp3 -ar 16000 -ac 1 public/narracao.wav`
2. Gere as legendas: `npm run transcrever -- public/narracao.wav`
3. Troque `musica.mp3` em `src/MeuVideo.tsx` pelo seu áudio e ajuste `durationInFrames` em `src/Root.tsx`.
4. Veja no Studio (`npm run dev`) e renderize (`npm run render`).

## Pacotes instalados

- `remotion`, `@remotion/cli` — composição e renderização
- `@remotion/three`, `three`, `@react-three/fiber`, `@react-three/drei` — Three.js
- `@remotion/captions` — legendas
- `@remotion/media`, `@remotion/media-utils` — áudio/vídeo e visualização de áudio
- `@remotion/install-whisper-cpp` — transcrição automática
- `@remotion/transitions`, `@remotion/shapes`, `@remotion/google-fonts` — transições, formas 2D e fontes

## Observação sobre WebGL

`remotion.config.ts` usa `swangle` (WebGL por software), que funciona em qualquer máquina, inclusive sem GPU.
Se você tiver GPU, troque para `angle` para renderizar mais rápido.
