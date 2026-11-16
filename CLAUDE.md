# Vídeos de IA — instruções do projeto

Canal de vídeos animados 2D **verticais (9:16) para Instagram Reels e TikTok**, narrados, no estilo "stick figure" urbano e escuro.

## Regras fixas (nunca quebrar)
1. **Personagem fixo.** O protagonista é sempre o mesmo: boneco **branco com contorno preto**, cabeça redonda grande, olhos pretos simples, **boné vermelho** (`#d8342b`). Sem roupa, sem outras cores, sem acessórios, sem mudar proporções.
   - Código: `growkaz-stickman-studio/personagem/protagonista.js` → `PROTAGONISTA` (e `FIGURANTE` para as outras pessoas: mesmo corpo, sem boné). Em cada projeto, `scenes/cast.js` apenas re-exporta esse arquivo.
   - Referências visuais: `growkaz-stickman-studio/personagem/referencias/ref_01.jpg` … `ref_06.jpg`.
   - Ninguém além do protagonista usa vermelho no corpo/cabeça.
2. **Estética fixa:** estilo `urbano` (`engine/styles.js`): cenários urbanos brasileiros (cozinha, mercado, ponto de ônibus, rua com fios, comunidade), noite/penumbra, cinza-azulado dessaturado, luz amarela fraca, textura suja/granulada, vinheta forte, **vermelho só como acento** (alertas, números, "!"). Bonecos brancos com contorno preto (o motor faz isso automaticamente nesse estilo).
3. **Formato:** 9:16, 1080×1920, 24 fps, legendas ligadas (pt-BR).
4. **Safe zone Instagram + TikTok:** rostos, números, títulos e legendas sempre dentro de x 60–940, y 220–1440 (constante `SAFE` em `engine/core.js`). Fora disso só cenário. Conferir com `node render.mjs --project projects/<slug> --stills t1,t2 --safe`.
5. **Narração intacta:** nunca reescrever o que foi narrado; cada cena ilustra literalmente o que está sendo dito.

## Fluxo de trabalho
1. **Roteiro:** skill `roteiro-tubemakers` (nicho → 10 ideias → roteiro; sempre esperar a escolha do usuário).
2. **Vídeo:** skill `make-2d-video` (ou `/new-video` → `/render-video` → `/video-sound`). O estúdio já está instalado em `growkaz-stickman-studio/` — nunca reinstalar o kit por cima.
   - Transcrição: `python3 tools/transcribe.py --project projects/<slug> --lang pt --model small`.
   - Velocidade neste servidor (sem GPU): ~1,5 quadro/s em 1080p → 1 min de vídeo ≈ 16 min de render. Rodar em segundo plano.
3. Entregar o MP4 de `projects/<slug>/out/`.

## Ambiente
- Se o Chromium do Playwright não estiver instalado, use o do sistema: `CHROMIUM_PATH=/caminho/do/chrome node render.mjs ...`.
- `tools/verify_kit.py` vai acusar diferenças: é esperado, o motor foi personalizado (contorno, estilo urbano, safe zone, acentos pt-BR).
- Na raiz (`src/`, `remotion.config.ts`) existe um setup alternativo com Remotion + Three.js; o fluxo principal do canal é o estúdio.
