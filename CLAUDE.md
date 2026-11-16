# Vídeos de IA — instruções do projeto

Canal de vídeos animados 2D **verticais (9:16) para Instagram Reels e TikTok**, narrados, no estilo "stick figure" urbano e escuro.

## Regras fixas (nunca quebrar)
1. **Personagem fixo.** O protagonista é sempre o mesmo: boneco **branco com contorno preto**, cabeça redonda grande, olhos pretos simples, **boné vermelho** (`#d8342b`). Sem roupa, sem outras cores, sem acessórios, sem mudar proporções.
   - Código: `growkaz-stickman-studio/personagem/protagonista.js` → `PROTAGONISTA` (e `FIGURANTE` para as outras pessoas: mesmo corpo, sem boné). Em cada projeto, `scenes/cast.js` apenas re-exporta esse arquivo.
   - Referências visuais: `growkaz-stickman-studio/personagem/referencias/ref_01.jpg` … `ref_06.jpg`.
   - Ninguém além do protagonista usa vermelho no corpo/cabeça.
2. **Estética fixa:** estilo `urbano` (`engine/styles.js`): bonecos brancos com contorno preto, levemente modelados (mãos, pés, sombra suave no corpo — sem exagero). **Cenários coloridos** e brasileiros (tijolo aparente, casas coloridas, varal, caixa d'água azul, plantas), com grão, vinheta e textura leve. Cenas de tensão/noite escurecem; vermelho forte fica para o boné do protagonista e para alertas/botões.
3. **Formato:** 9:16, **720p (720×1280)**, 24 fps, legendas ligadas (pt-BR), agrupadas por frase e por personagem.
4. **Safe zone Instagram + TikTok:** rostos, números, títulos e legendas sempre dentro de x 60–940, y 220–1440 (constante `SAFE` em `engine/core.js`). Fora disso só cenário. Conferir com `node render.mjs --project projects/<slug> --stills t1,t2 --safe`.
5. **Narração intacta:** nunca reescrever o que foi narrado; cada cena ilustra literalmente o que está sendo dito. Falas extras de contexto só com autorização do usuário e tiradas da bíblia da série.
6. **Final de todo episódio:** cartão de título e depois a chamada pra seguir a página (`UI.seguir` em `engine/ui2d.js`, com o próximo episódio).

## Fluxo de trabalho
1. **Roteiro:** skill `roteiro-tubemakers` (nicho → 10 ideias → roteiro; sempre esperar a escolha do usuário).
2. **Vídeo:** skill `make-2d-video` (ou `/new-video` → `/render-video` → `/video-sound`). O estúdio já está instalado em `growkaz-stickman-studio/` — nunca reinstalar o kit por cima.
   - Transcrição: `python3 tools/transcribe.py --project projects/<slug> --lang pt --model small`.
   - Velocidade neste servidor (sem GPU): ~1,5 quadro/s em 1080p → 1 min de vídeo ≈ 16 min de render. Rodar em segundo plano.
3. Entregar o MP4 de `projects/<slug>/out/`.

## Série "O Que a Mamãe Sabia" (6 episódios)
- Elenco fixo: `growkaz-stickman-studio/personagem/elenco-mamae.js` (Eduardo = protagonista de boné vermelho; Rafael boné azul; Mariana avental cinza e coque; Osvaldo boina e moletom verde-oliva). Cachorro Bilu e cenários em `projects/ep01-domingo-de-churrasco/scenes/sets/` (reaproveitar nos próximos episódios).
- Vozes (ElevenLabs, aprovadas pelo usuário): Narrador = Adam Borges, Osvaldo = Patrick7x, Eduardo = Charlie, Rafael = Liam, Mariana = Sarah (ids em `story/roteiro.json`). A chave é injetada pelo ambiente para `api.elevenlabs.io`.
- Por episódio: escrever `story/roteiro.json` → `python3 tools/tts_eleven.py --project projects/<slug> --verify` (gera a voz, os tempos e confere cada fala por transcrição; refazer as que derem DIF) → `python3 projects/<slug>/story/build_shots.py` (cenas ancoradas nas falas) → conferir `--sheet` → render → `audio/mix.py`.

## Ambiente
- Se o Chromium do Playwright não estiver instalado, use o do sistema: `CHROMIUM_PATH=/caminho/do/chrome node render.mjs ...`.
- `tools/verify_kit.py` vai acusar diferenças: é esperado, o motor foi personalizado (contorno, estilo urbano, safe zone, acentos pt-BR).
- Na raiz (`src/`, `remotion.config.ts`) existe um setup alternativo com Remotion + Three.js; o fluxo principal do canal é o estúdio.
