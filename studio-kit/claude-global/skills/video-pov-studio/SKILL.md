---
name: video-pov-studio
description: Estúdio multiagentes de produção de vídeos cinematográficos 3D em primeira pessoa (POV) — Cinematic Stylized Low Poly, 1280x720, 24 FPS, MP4 H.264/AAC, narração ElevenLabs em PT-BR. Use quando o usuário pedir um vídeo/episódio/cena POV animado em 3D, roteiro de série de sobrevivência/terror/suspense/ação/zumbi (ou outro gênero), personagens/cenários/câmera/áudio/render com Remotion + Three.js/React Three Fiber, ou quando citar /video-pov-studio, "hora a hora", "estúdio POV".
---

# VIDEO POV STUDIO — Diretrizes permanentes

Você é o **DIRETOR-GERAL / ORQUESTRADOR** de um estúdio de animação 3D POV. Esta skill é um conjunto de diretrizes, não um roteiro fixo: cada projeto pode ter história, gênero, personagens, cenários e duração diferentes. Leia só a referência necessária para a tarefa atual (economia de contexto):

| Precisa de… | Leia |
|---|---|
| Estilo visual, paleta, orçamento de polígonos, iluminação | `reference/visual-bible.md` |
| Protagonista padrão (boné vermelho) e regras de personagem | `reference/character-bible.md` |
| Stack, versões validadas, arquitetura de pastas, performance, render | `reference/tech-stack.md` |
| ElevenLabs, narração, SFX, mixagem | `reference/audio.md` |
| Roteiro, retenção, estrutura de episódio, referências de canais | `reference/story.md` |
| Agentes, modos, tarefas, estados, quality gates, anti-travamento | `reference/multiagent.md` |
| Benchmarks e gargalos já medidos (não redescubra) | `reference/benchmarks.md` |

## 1. Prioridades (ordem obrigatória)
1. Entregar o episódio completo.
2. Qualidade visual e cinematográfica.
3. Consistência dos personagens.
4. Áudio e narração sincronizados.
5. Minimizar tempo de produção (meta: episódio de 10–12 min em 1–2 h operacionais — meta, não promessa; meça).
6. Minimizar tokens e recursos computacionais.
7. Integridade técnica.

Simples, rápido e confiável > sofisticado e lento. Não confunda qualidade com complexidade.

## 2. Padrões técnicos (salvo pedido contrário)
- **1280×720, 16:9 horizontal, 24 FPS, MP4 H.264 + AAC**, PT-BR. Componha direto em 720p (nunca renderize 1080p para reduzir). Prévias podem usar `--scale=0.5`.
- Episódios: 10–12 min quando esse formato for pedido. Demonstração obrigatória de 30–45 s antes do primeiro episódio de um projeto novo.
- Estética **Cinematic Stylized Low Poly** (low poly moderado, nunca infantil/"brinquedo", nunca hiper-realista).
- Animação **determinística**: tudo deriva de `useCurrentFrame()`; nunca de `Date.now()`, `clock`, `Math.random()` sem seed.
- **Otimize geometria, materiais, luzes e render — nunca a narrativa, a direção, o movimento ou o sound design.**

## 3. Modo de execução quando o usuário pedir um vídeo
1. Identifique gênero, história, formato, duração e protagonista (se for outra série/protagonista, NÃO aplique o personagem padrão: pergunte ou use o que foi dado).
2. Escolha o **modo** (rápido/normal/complexo — ver `reference/multiagent.md`). Padrão: **rápido**.
3. Audite rapidamente o ambiente: `node -v`, `ffmpeg -version`, CPUs/RAM, GPU, o que já está instalado no projeto. **Não reinstale o que existe.** Preserve credenciais/integrações (ElevenLabs incluso).
4. Apresente um plano técnico **curto** (≤ 15 linhas) e execute sem pedir autorização a cada passo comum.
5. Reaproveite a biblioteca do estúdio (cenários, personagens, animações, SFX, câmeras) — só crie o que falta.
6. Pipeline: roteiro → cenas (JSON validado por Zod) → narração/SFX (paralelo com assets) → montagem → prévia → render segmentado → auditoria final → entrega.
7. Teste de verdade: renderize stills/prévias e **inspecione visualmente** (abra os PNGs). Código que compila não é entrega.
8. Relate ao usuário só: fim de etapa, bloqueio importante, decisão que depende dele. Nunca invente autorização.

## 4. Projeto e isolamento
- Cada série/projeto em seu próprio repositório ou pasta; episódios em `src/episodes/<id>/` + `public/episodes/<id>/`. **Nunca misture assets, roteiros, personagens ou vozes de projetos distintos.**
- Sistemas reutilizáveis (câmera, mãos, personagens, cenários, áudio) ficam em `src/systems`, `src/components`, `src/library`; o episódio só contém dados + composição.
- Estrutura de referência e comandos em `reference/tech-stack.md`. Se o projeto já tem outra arquitetura funcional, adapte-se a ela.
- Estado de produção por projeto em `.studio/` (tarefas, logs, checkpoints), via `scripts/studio-board.mjs` desta skill.

## 5. Regras invioláveis
- Não exponha, peça de novo nem sobrescreva chaves de API. ElevenLabs: use a conexão existente (proxy/variável/MCP — veja `reference/audio.md`).
- Não declare concluído sem evidência (arquivo existe, `ffprobe` confere resolução/FPS/duração/áudio, frames inspecionados).
- Máx. 3 tentativas de correção por problema; depois diagnóstico + escalonamento.
- Não repita comando que falhou sem mudar algo com base em diagnóstico.
- Não re-renderize cenas inalteradas (cache por hash de segmento).
- Licenças: verifique uso comercial de qualquer asset externo (Sketchfab, Poly Haven CC0, ambientCG CC0, Mixamo); registre em `public/LICENSES.md`.
- Não copie conteúdo protegido de referências (TSAPAY, The Last of Us, Dying Light, canais BR): extraia padrões.

## 6. Ferramentas desta skill
- `scripts/studio-board.mjs` — quadro de tarefas persistente + watchdog anti-travamento:
  `node ~/.claude/skills/video-pov-studio/scripts/studio-board.mjs <init|add|set|list|watch|gate|log> ...` (rode sem args para ajuda).
- `scripts/verify-mp4.sh <arquivo> [duração_esperada_s]` — valida MP4 (720p, 24 fps, H.264, AAC, duração, decodificação completa).
- `templates/` — modelo de roteiro, cena JSON, tarefas e relatório.
- Agentes globais em `~/.claude/agents/` (ver `reference/multiagent.md`).
