# ESTÚDIO MULTIAGENTES — hierarquia, modos, tarefas, gates, anti-travamento

## Hierarquia
- **Nível 1 — Diretor-Geral (sessão principal)**: recebe ordens, consulta a skill, planeja, divide tarefas, define dependências, aprova entregas, libera etapas, reporta ao usuário. Nenhum agente muda objetivos centrais sem ele.
- **Nível 2 — `production-supervisor`**: fiscaliza (não executa trabalho dos outros). Lê o quadro, detecta travamentos/erros repetidos/dependências quebradas, recomenda correção, exige evidência. Sem burocracia: não pede aprovação humana por etapa, não repete verificações já feitas, não interrompe quem progride.
- **Nível 3 — especialistas** (`~/.claude/agents/`): story-director, art-director, 3d-environment-artist, character-artist, animation-director, audio-engineer, render-engineer, continuity-reviewer, technical-qa, **visual-producer** (generalista do modo rápido).

## Modos (escolha o menor que resolve)
| Modo | Quem participa | Quando |
|---|---|---|
| **Rápido (padrão)** | Diretor + supervisor (só em render/etapas longas) + story-director + visual-producer + audio-engineer + render-engineer | episódio que reaproveita cenários/personagens existentes |
| Normal | + 3d-environment-artist / character-artist / animation-director / technical-qa sob demanda | cenário ou personagem novo, animação nova |
| Complexo | todos, incluindo art-director e continuity-reviewer | nova série, novo estilo, muitos sistemas novos |

Regras de custo: não delegue tarefa trivial (o Diretor resolve); subagente recebe **só** o contexto da tarefa (arquivos e critério), nunca o projeto inteiro; um agente por arquivo (sem edição simultânea do mesmo arquivo); relatórios ≤ 10 linhas; resultados importantes vão para `reference/benchmarks.md` ou `.studio/notes.md` para não redescobrir. Modelos: tarefas mecânicas/QA → `haiku`; produção → `sonnet`; roteiro e decisões difíceis → modelo da sessão.

## Paralelismo típico (modo rápido)
1. story-director (roteiro + roteiro de ações) ‖ audio-engineer (biblioteca SFX faltante) ‖ visual-producer (assets/cenário faltantes).
2. audio-engineer gera narração (depende do roteiro) ‖ visual-producer faz stills de inspeção.
3. render-engineer: preview → render final por cena (depende de validate OK). Supervisor acompanha pelo heartbeat.
4. technical-qa/continuity (só no fim, 1 passada) → Diretor entrega.

## Tarefas (`.studio/board.json` via `scripts/studio-board.mjs`)
Campos: id, responsável, objetivo, arquivos, dependências, critério de conclusão, status, tentativas, resultado dos testes, heartbeat (arquivo cujo mtime indica progresso).
Estados: PENDENTE · EM EXECUÇÃO · AGUARDANDO DEPENDÊNCIA · EM TESTE · BLOQUEADO · FALHOU · APROVADO · CONCLUÍDO.
```
B=~/.claude/skills/video-pov-studio/scripts/studio-board.mjs
node $B init "<projeto>"
node $B add T3 --owner render-engineer --goal "render final ep01" --deps T1,T2 --done "verify-mp4 OK" --files out/ep01 --heartbeat out/ep01/heartbeat
node $B set T3 "EM EXECUÇÃO"        node $B set T3 FALHOU --note "segmento s04 corrompido"
node $B set T3 CONCLUÍDO --evidence "verify-mp4: 1280x720 24fps 11:02"
node $B list        node $B watch [--stall-min 10]        node $B gate C --pass|--fail "motivo"
```

## Anti-travamento (implementado no watch)
- Tarefa EM EXECUÇÃO sem atualização de heartbeat por > `stall-min` (padrão 10 min) → **SUSPEITA DE TRAVAMENTO** (tarefa longa com heartbeat vivo NÃO é travada — o render escreve heartbeat a cada linha de progresso).
- 3 falhas na mesma tarefa → BLOQUEADO automático + escalonamento ao Diretor (não tente uma 4ª vez igual).
- Dependência iniciada antes da conclusão da anterior → alerta.
- Tarefa BLOQUEADA sem nota de diagnóstico → alerta.
- CONCLUÍDO exige `--evidence` (o script recusa sem evidência).
- Hook `SessionStart` mostra o resumo do quadro ao abrir uma sessão no projeto (só lê; nunca bloqueia).

## Quality gates
A pré-produção (roteiro, referências, plano) · B assets (personagens/cenários/materiais, stills inspecionados, sem colisões) · C animação (câmera, mãos, movimentos, continuidade) · D áudio (narração, SFX, `npm run validate` sem erros) · E pré-render (preview + métricas) · F render final segmentado · G auditoria final (`verify-mp4.sh`, frames amostrados, boné vermelho, sincronia).
Libere a próxima etapa automaticamente quando os critérios obrigatórios passam; falhas não críticas viram pendências registradas.

## Relatórios ao usuário
Só: fim de etapa, bloqueio importante, decisão necessária, e status a cada ~30 min em produções longas (etapa atual, concluído, em execução, problemas, próxima etapa).
