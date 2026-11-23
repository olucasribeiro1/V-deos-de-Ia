#!/usr/bin/env bash
# `blender` shim backed by the PyPI `bpy` module (download.blender.org is blocked in the
# cloud container). Installed as /usr/local/bin/blender by scripts/setup-roblox-kit.sh.
# Supports exactly what the Roblox Story Kit calls:
#   blender [-b] [--factory-startup] --version
#   blender -b [--factory-startup] -P script.py -- args...
# Python interpreter: $BPY_PYTHON, else ~/RobloxStories/.venv/bin/python (must have bpy==5.3.0).
PY="${BPY_PYTHON:-$HOME/RobloxStories/.venv/bin/python}"
if [ ! -x "$PY" ]; then
  echo "blender shim: python not found at $PY (run scripts/setup-roblox-kit.sh)" >&2
  exit 1
fi
exec "$PY" - "$@" <<'PYEOF'
import runpy, sys
args = sys.argv[1:]
own = args[:args.index("--")] if "--" in args else args   # Blender's own flags (before "--")
import bpy
if "--version" in own or "-v" in own:
    print("Blender " + bpy.app.version_string)
    sys.exit(0)
script = None
for flag in ("-P", "--python"):
    if flag in own and own.index(flag) + 1 < len(own):
        script = own[own.index(flag) + 1]
        break
if not script:
    sys.exit("blender shim: only --version and -b [--factory-startup] -P <script> -- args are supported")
if "--factory-startup" in own:
    bpy.ops.wm.read_factory_settings(use_empty=False)
sys.argv = ["blender"] + args          # scripts read everything after "--"
runpy.run_path(script, run_name="__main__")   # SystemExit from the script sets the exit code
PYEOF
