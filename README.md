# Estúdio POV 3D — série "hora a hora"

Estúdio de animação 3D em primeira pessoa (POV) no estilo **cartoon toon** ("stick viral 3D"), feito com
Remotion + React Three Fiber, narração/vozes ElevenLabs em português e render otimizado para máquinas sem GPU.

**Padrão:** 1280×720 · 16:9 · 24 fps · MP4 H.264 + AAC · episódios de 10–12 min.

## O que já existe
- **Episódio 01 — As Primeiras 2 Horas** (`src/episodes/ep01/episode.ts`, 8 cenas, ~10 min) e a demo de 45 s (`docs/demo-ep01.mp4`).
- Sistemas reutilizáveis: câmera POV (passos, respiração, olhares, sustos), mãos do protagonista (celular, chaves, faca, empurrar), personagens cartoon (protagonista de boné vermelho, Rafael, civis, 7 tipos de infectados), apartamento + corredor do prédio + cidade em colapso, TV com telejornal, olho mágico, biblioteca de 45 efeitos sonoros e músicas.
- Pipeline: roteiro de ações → vozes (com verificação automática de pronúncia) → validação de timing → render por cena com cache → verificação do MP4.
- Skill global + 11 agentes do Claude Code em `studio-kit/` (instale com `bash studio-kit/install.sh`).

## Comandos
```bash
npm install
npm run validate -- ep01                       # timing, arquivos de áudio, identidade do protagonista
npm run voice -- src/episodes/ep01/episode.ts  # narração (só gera falas novas/alteradas)
npm run sfx                                    # biblioteca de efeitos (só o que falta)
npm run render -- ep01 --preview               # prévia 640x360
npm run render -- ep01                         # final 720p, cena por cena (retoma/reaproveita)
npm run studio                                 # Remotion Studio para ver e ajustar
```
Saída: `out/ep01/ep01.mp4` + `out/ep01/metrics.json` (tempo de render, RAM, estimativas).

## Novo episódio
Veja `docs/NOVO-EPISODIO.md`.

## Credenciais
A chave da ElevenLabs **não fica no código**: na nuvem do Claude Code o proxy injeta a credencial; na sua máquina use a variável `ELEVENLABS_API_KEY` (nunca faça commit dela).
