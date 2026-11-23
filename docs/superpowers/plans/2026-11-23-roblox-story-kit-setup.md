# Roblox Story Kit Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Roblox Story Kit skill and its local toolchain (Blender, ffmpeg, Python env) install reproducibly from this repo and prove it with a preview render.

**Architecture:** Vendor the kit unchanged under `.claude/skills/roblox-story-kit/` so every session loads it. One idempotent bash script installs system libs, a `blender` shim backed by the PyPI `bpy` module, then runs the kit's own `setup.py`. Verification = the kit's example video preview renders.

**Tech Stack:** bash, Python 3.13, bpy 5.3.0 (PyPI), Mesa EGL (software EEVEE), ffmpeg, the kit's `setup.py`/`tools/*.py`.

**Spec:** `docs/superpowers/specs/2026-11-23-roblox-story-kit-setup-design.md`

## Global Constraints

- Kit files are copied byte-for-byte from `Roblox_Story_Kit_AI.zip` (v2.2); no edits to kit code.
- Blender version must report `5.x` (`bpy==5.3.0`).
- Workspace: `~/RobloxStories`; pointer file `~/.roblox-story-kit.json` (written by `setup.py`).
- Never disable TLS verification or bypass the proxy.
- Script must be idempotent: a second run changes nothing and still ends with `READY` (music note allowed).

## Review Focus

- Running the setup script twice: second run must not recreate the venv or fail on existing files → Task 2 step "re-run".
- `blender --version` called by `kit.blender_version` with `-b --factory-startup --version` (flags before `--version`) → shim must still print `Blender 5.3.0`; test in Task 2.
- Missing music: `setup.py` prints a note, not `MISSING`; final output must still be `READY` → Task 3 check.
- Script run from a directory other than the repo root → uses paths relative to the script's own location; Task 2 runs it from `/`.
- Fresh container where `~/.claude/skills` is empty → the repo copy is what loads; Task 3 checks `setup.py` is called from the repo path.

---

### Task 1: Vendor the kit into the repo

**Files:**
- Create: `.claude/skills/roblox-story-kit/**` (from the zip)
- Modify: `.gitattributes` (mark `*.wav *.mp3 *.png *.jpg` as `binary`)

**Interfaces:**
- Produces: `.claude/skills/roblox-story-kit/setup.py`, `SKILL.md`, `engine/`, `voice/narrator_sample.mp3`

- [ ] **Step 1:** `unzip` the upload into a fresh scratch dir, then copy `roblox-story-kit/` to `.claude/skills/`.
- [ ] **Step 2: Verify** — `diff -r <scratch>/roblox-story-kit .claude/skills/roblox-story-kit` prints nothing; `head -3 .claude/skills/roblox-story-kit/SKILL.md` shows `name: roblox-story-kit`.
- [ ] **Step 3: Commit** — `git add .gitattributes .claude/skills/roblox-story-kit && git commit -m "Add Roblox Story Kit v2.2 skill"`

### Task 2: Setup script + Blender shim

**Files:**
- Create: `scripts/blender-shim.sh`
- Create: `scripts/setup-roblox-kit.sh`

**Interfaces:**
- Consumes: Task 1's `.claude/skills/roblox-story-kit/setup.py`
- Produces: `/usr/local/bin/blender` (installed copy of the shim); `~/RobloxStories/.venv/bin/python` with `bpy`, `numpy`, `PIL`, `faster_whisper`, `yt_dlp`

`blender-shim.sh` behaviour (exactly what `tools/blend.py` and `tools/kit.py` call):
- any args containing `--version` → print `Blender <bpy.app.version_string>`, exit 0
- `-b [--factory-startup] -P <script> -- <args…>` → import `bpy`, `read_factory_settings` if `--factory-startup`, set `sys.argv = ["blender", *original_args]`, `runpy.run_path(script, run_name="__main__")`; exit code = script's exit code
- python interpreter = `$BPY_PYTHON` or `~/RobloxStories/.venv/bin/python`

`setup-roblox-kit.sh` steps, in order, each skipped if already satisfied:
1. `apt-get install -y libegl1 libegl-mesa0 libgl1-mesa-dri libgles2 libxkbcommon0 libxi6 libxrender1 libsm6 libxxf86vm1 libxfixes3 fonts-dejavu-core ffmpeg` (skip when `ldconfig -p | grep -q libEGL.so.1` and `ffmpeg` exists)
2. create `~/RobloxStories/.venv` if missing; `pip install numpy pillow faster-whisper yt-dlp bpy==5.3.0`
3. `install -m755 scripts/blender-shim.sh /usr/local/bin/blender`
4. `python3 <repo>/.claude/skills/roblox-story-kit/setup.py` and exit with its code

- [ ] **Step 1: Write the check** — `blender -b --factory-startup --version` must print a line matching `^Blender 5\.`; `blender -b --factory-startup -P /tmp/x.py -- a b` where `x.py` prints `sys.argv[sys.argv.index("--")+1:]` must print `['a', 'b']`.
- [ ] **Step 2: Run the check before writing the shim** — expected FAIL in a fresh container (`blender: command not found`).
- [ ] **Step 3:** Write both scripts as specified above.
- [ ] **Step 4: Run** `cd / && bash /home/user/V-deos-de-Ia/scripts/setup-roblox-kit.sh` — expected last line `READY`; then re-run Step 1 checks → PASS.
- [ ] **Step 5: Re-run** the setup script; expected: no venv recreation message, last line `READY`.
- [ ] **Step 6: Commit** — `git add scripts/ && git commit -m "Add Roblox kit setup script and bpy-backed blender shim"`

### Task 3: Prove the pipeline with the example video

**Files:**
- Create: `docs/roblox-kit.md` (how to set up, what works, what needs Flashloop, where music goes)

**Interfaces:**
- Consumes: Task 2's environment

- [ ] **Step 1: Run** `cd ~/RobloxStories && .venv/bin/python tools/blend.py sneeze_teleport preview 1` — expected `videos/sneeze_teleport/preview/shot_01.png` exists; open it and confirm a blocky character is visible (not a blank tile).
- [ ] **Step 2: Run** `.venv/bin/python tools/blend.py sneeze_teleport preview all` then `.venv/bin/python tools/contact.py sneeze_teleport all 12 full` — expected `videos/sneeze_teleport/full.jpg`; inspect it; record time taken.
- [ ] **Step 3: Write `docs/roblox-kit.md`** with: the one setup command, the measured preview time, the CPU-only render warning (extrapolated final time), "music: put any audio file in `~/RobloxStories/music/`", and "new videos need the Flashloop connector (claude.ai → Settings → Connectors)".
- [ ] **Step 4: Commit and push** — `git add docs/ && git commit -m "Document Roblox kit setup" && git push -u origin claude/compassionate-maxwell-lt49m7`
