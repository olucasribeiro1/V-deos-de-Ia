#!/usr/bin/env bash
# Install everything the Roblox Story Kit needs in a (fresh) Linux container, then run the
# kit's own setup.py. Idempotent: safe to re-run; each step is skipped when already satisfied.
#   bash scripts/setup-roblox-kit.sh            (works from any directory)
# Ends with the kit's READY line (or NOT READY + what is missing).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KIT="$REPO/.claude/skills/roblox-story-kit"
WS="${ROBLOX_STORIES:-$HOME/RobloxStories}"
VENV="$WS/.venv"
PY_DEPS=(numpy pillow faster-whisper yt-dlp bpy==5.3.0)

SUDO=""
if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1; then SUDO="sudo"; fi
log() { echo "[setup] $*"; }

[ -f "$KIT/setup.py" ] || { echo "kit not found at $KIT" >&2; exit 1; }

# 1. system libraries: Mesa EGL (software EEVEE, no GPU), X libs bpy links against, fonts, ffmpeg
if ldconfig -p | grep -q 'libEGL.so.1' && command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null; then
  log "system libs + ffmpeg: already installed"
else
  log "installing system libs + ffmpeg (apt) ..."
  $SUDO apt-get update -qq
  DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq \
    libegl1 libegl-mesa0 libgl1-mesa-dri libgles2 libxkbcommon0 libxi6 libxrender1 libsm6 \
    libxxf86vm1 libxfixes3 fonts-dejavu-core ffmpeg
fi

# 2. private python env with bpy (Blender 5.3 as a module; needs Python 3.13)
PYTHON="${PYTHON:-$(command -v python3.13 || command -v python3)}"
mkdir -p "$WS"
if [ -x "$VENV/bin/python" ]; then
  log "venv: $VENV already exists"
else
  log "creating venv $VENV with $PYTHON"
  "$PYTHON" -m venv "$VENV"
fi
if "$VENV/bin/python" -c 'import numpy, PIL, faster_whisper, yt_dlp, bpy; assert bpy.app.version >= (5, 3, 0)' 2>/dev/null; then
  log "python packages: already installed"
else
  log "installing ${PY_DEPS[*]} (bpy is ~400 MB; first time takes a few minutes) ..."
  "$VENV/bin/python" -m pip install --disable-pip-version-check -q "${PY_DEPS[@]}"
fi

# 3. blender shim
if cmp -s "$REPO/scripts/blender-shim.sh" /usr/local/bin/blender 2>/dev/null; then
  log "blender shim: up to date"
else
  log "installing blender shim -> /usr/local/bin/blender"
  $SUDO install -m755 "$REPO/scripts/blender-shim.sh" /usr/local/bin/blender
fi

# 4. the kit's own setup (workspace, config.json, music, test render)
log "running kit setup.py ..."
cd "$WS"
rc=0
"$PYTHON" "$KIT/setup.py" "$WS" || rc=$?

# 5. extra tools from the ElevenLabs voice skill, when present (after setup.py: a fresh
#    workspace install replaces tools/ wholesale)
EXTRA="$REPO/.claude/skills/roblox-story-eleven/tools"
if [ -d "$EXTRA" ] && compgen -G "$EXTRA/*.py" >/dev/null; then
  mkdir -p "$WS/tools"
  cp -f "$EXTRA"/*.py "$WS/tools/"
  echo "[setup] copied roblox-story-eleven tools into $WS/tools" >&2
fi
exit "$rc"
