# Vídeos de IA — instruções do projeto

Canal de vídeos animados 2D **verticais (9:16) para Instagram Reels e TikTok**, narrados, no estilo "stick figure" urbano e escuro.

## Regras fixas (nunca quebrar)
1. **Personagem fixo.** O protagonista é sempre o mesmo: boneco **branco com contorno preto**, cabeça redonda grande, olhos pretos simples, **boné vermelho** (`#d8342b`). Sem roupa, sem outras cores, sem acessórios, sem mudar proporções.
   - Código: `growkaz-stickman-studio/personagem/protagonista.js` → `PROTAGONISTA` (e `FIGURANTE` para as outras pessoas: mesmo corpo, sem boné). Em cada projeto, `scenes/cast.js` apenas re-exporta esse arquivo.
   - Referências visuais: `growkaz-stickman-studio/personagem/referencias/ref_01.jpg` … `ref_06.jpg`.
   - Ninguém além do protagonista usa vermelho no corpo/cabeça.
2. **Estética fixa:** estilo `urbano` (`engine/styles.js`): bonecos brancos com contorno preto, levemente modelados (mãos, pés, sombra suave no corpo — sem exagero). **Cenários coloridos** e brasileiros (tijolo aparente, casas coloridas, varal, caixa d'água azul, plantas), com grão, vinheta e textura leve. Cenas de tensão/noite escurecem; vermelho forte fica para o boné do protagonista e para alertas/botões.
3. **Formato:** 9:16, **720p (720×1280)**, 24 fps, legendas ligadas (pt-BR), agrupadas por frase e por personagem. Episódios de 1min30 a 2min.
4. **Safe zone Instagram + TikTok:** rostos, números, títulos e legendas sempre dentro de x 60–940, y 220–1440 (constante `SAFE` em `engine/core.js`). Fora disso só cenário. Conferir com `node render.mjs --project projects/<slug> --stills t1,t2 --safe`.
5. **Narração intacta:** nunca reescrever o que foi narrado; cada cena ilustra literalmente o que está sendo dito. Falas extras de contexto só com autorização do usuário e tiradas da bíblia da série.
6. **Final de todo episódio:** cartão de título e depois a chamada pra seguir a página (`UI.seguir` em `engine/ui2d.js`, com o próximo episódio).

## Fluxo de trabalho
1. **Roteiro:** skill `roteiro-tubemakers` (nicho → 10 ideias → roteiro; sempre esperar a escolha do usuário).
2. **Vídeo:** skill `make-2d-video` (ou `/new-video` → `/render-video` → `/video-sound`). O estúdio já está instalado em `growkaz-stickman-studio/` — nunca reinstalar o kit por cima.
   - Transcrição: `python3 tools/transcribe.py --project projects/<slug> --lang pt --model small`.
   - Velocidade neste servidor (sem GPU): ~1,5 quadro/s em 1080p → 1 min de vídeo ≈ 16 min de render. Rodar em segundo plano.
3. Entregar o MP4 de `projects/<slug>/out/`.

## Linguagem dos vídeos (pedido do usuário — vale para todo episódio)
- **Ritmo:** narração rápida (~160–175 palavras/min), informação instantânea, suspense mantido. Pausas curtas; pausa longa só antes de revelação.
- **Câmera:** nunca parada. Planos longos em que a câmera **acompanha, aproxima, dá zoom e passeia** dentro do mesmo cenário (`series/mamae/camera.js`: `foco()` + `K()` keyframes), em vez de muitos cortes. Câmera viva automática (tremida leve + "punch" nos números) no `engine/player.js`.
- **Transições:** troca de cenário = **dissolve suave ≤ 0,6 s** (`in: {type: "fade", dur: 0.5}`); close dramático = `zoom` 0,35 s. Corte seco só em susto.
- **Números:** todo número falado aparece grande na tela (automático: `tools/numeros.py` → `numbers` no shots.json), ou dentro da cena (placa, prancheta, contador, calendário) com `nums: false` no plano.
- **Expressões:** bonecos expressivos — usar as expressões extras (`panic, furious, disgust, sob, terrified, suspicious, proud, hungry, gulp, forced, blank`) e emotes (`sweat, anger, shock, question, exclaim, gloom, sparkle, steam, blush`) em `drawFigure`/`bigFace` (passar `t`).
- **Urgência:** HUD de tempo da história ("DIA 0 · 12:11") + medidor de radiação (`hud` no shots.json), alerta vermelho pulsando, contador Geiger, poeira radioativa caindo (`series/mamae/efeitos.js`).
- **Som:** toda ação tem efeito. Biblioteca real em `series/mamae/sfx/` (alçapão, latido, choro do cachorro, lata, arranhão, Geiger, gerador, passos no metal, estática, alarme, poeira, tosse, colher, impacto, tensão) + `audio/sfx.py`.
- **Conteúdo educativo:** cada episódio traz 1 dica real de sobrevivência, conferida em fonte oficial (CDC, FEMA/Ready.gov, Cruz Vermelha). Nunca inventar número.
- **Contexto brasileiro:** cenários, comidas, expressões e situações brasileiras.
- **Postura:** analisar criticamente as ideias do usuário e discordar quando fizer sentido — não concordar só por concordar.

## Série "O Que a Mamãe Sabia" (10 episódios · 30 dias)
- Plano da temporada: `growkaz-stickman-studio/series/mamae/temporada.md` (dia de cada episódio, dica de sobrevivência, gancho). Episódios 2–10 com **1min30 a 2min**.
- Elenco fixo: `growkaz-stickman-studio/personagem/elenco-mamae.js` (Eduardo = protagonista de boné vermelho; Rafael boné azul; Mariana avental cinza e coque — é **biomédica**, nunca "mãe de biomédica"; Osvaldo boina e moletom verde-oliva). Cenários compartilhados em `series/mamae/` (quintal, cozinha, bunker equipado, efeitos, câmera).
- Vozes (ElevenLabs, aprovadas): Narrador = Adam Borges, Osvaldo = Patrick7x, Eduardo = Charlie, Rafael = Liam, Mariana = Sarah, Rádio = Marco Antonio (com efeito). Modelo **eleven_v4** com tags de emoção entre colchetes (`[tenso]`, `[sussurrando]`, `[irônico]`...) e `tempo` (narrador 1.2, personagens 1.1). O nome do projeto é **Projeto Cérebro** — confirmado pelo usuário. Os Eps. 2 e 3 já publicados ficam como estão; do Ep. 4 em diante, sempre "Cérebro".
- Por episódio: `story/roteiro.json` → `python3 tools/tts_eleven.py --project projects/<slug> --verify` (refazer falas DIF) → `python3 projects/<slug>/story/build_shots.py` → conferir `--stills` em vários tempos → render → `audio/mix.py`.
- Créditos ElevenLabs: plano Starter (~38 mil caracteres/mês). Cada episódio gasta ~2 mil. Evitar regenerações desnecessárias (o tts tem cache por texto).

## Ambiente
- Se o Chromium do Playwright não estiver instalado, use o do sistema: `CHROMIUM_PATH=/caminho/do/chrome node render.mjs ...`.
- `tools/verify_kit.py` vai acusar diferenças: é esperado, o motor foi personalizado (contorno, estilo urbano, safe zone, acentos pt-BR).
- Na raiz (`src/`, `remotion.config.ts`) existe um setup alternativo com Remotion + Three.js; o fluxo principal do canal é o estúdio.
