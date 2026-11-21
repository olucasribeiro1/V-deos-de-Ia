#!/usr/bin/env bash
# Hook SessionStart do video-pov-studio: se o projeto tem quadro de produção (.studio/board.json),
# injeta um resumo (tarefas abertas, travamentos, bloqueios) no contexto. Só lê; nunca bloqueia; sempre sai 0.
[ -f .studio/board.json ] || exit 0
command -v node >/dev/null 2>&1 || exit 0
timeout 5 node "$HOME/.claude/skills/video-pov-studio/scripts/studio-board.mjs" summary 2>/dev/null || true
exit 0
