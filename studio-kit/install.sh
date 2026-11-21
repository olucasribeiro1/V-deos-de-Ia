#!/usr/bin/env bash
# Instala/atualiza o estúdio global no Claude Code (idempotente).
#   skill  → ~/.claude/skills/video-pov-studio
#   agents → ~/.claude/agents/*.md
#   hook   → SessionStart em ~/.claude/settings.json (mescla; não apaga configurações existentes)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/claude-global" && pwd)"
DEST="${CLAUDE_HOME:-$HOME/.claude}"
mkdir -p "$DEST/skills" "$DEST/agents"
rm -rf "$DEST/skills/video-pov-studio"
cp -R "$SRC/skills/video-pov-studio" "$DEST/skills/"
cp "$SRC/agents/"*.md "$DEST/agents/"
chmod +x "$DEST/skills/video-pov-studio/hooks/"*.sh "$DEST/skills/video-pov-studio/scripts/"*
node - "$DEST/settings.json" <<'JS'
const fs = require('fs');
const file = process.argv[2];
const s = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
s.hooks ??= {};
s.hooks.SessionStart ??= [];
const cmd = 'bash "$HOME/.claude/skills/video-pov-studio/hooks/session-start.sh"';
const present = s.hooks.SessionStart.some((g) => (g.hooks ?? []).some((h) => h.command === cmd));
if (!present) s.hooks.SessionStart.push({hooks: [{type: 'command', command: cmd, timeout: 10}]});
fs.writeFileSync(file, JSON.stringify(s, null, 2));
console.log(present ? 'hook já presente' : 'hook SessionStart adicionado');
JS
echo "✓ video-pov-studio instalado em $DEST (skill + $(ls "$SRC/agents" | wc -l) agentes + hook)"
