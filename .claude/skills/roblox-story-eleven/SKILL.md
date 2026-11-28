---
name: roblox-story-eleven
description: Use when the user asks for a Roblox-style story video, "roblox story", "roblox short about X", "make a story video about X", story ideas for that format, or to render the kit's example video, and the Flashloop connector is not connected but ElevenLabs is. Also use for "set up the roblox kit" in this repository's cloud container. ElevenLabs edition of roblox-story-kit; overrides that skill's Flashloop steps.
---

# Roblox story kit (ElevenLabs edition)

Same studio and the same craft as `roblox-story-kit` (read its SKILL.md for the pipeline and the
"Traps already hit" list, and `~/RobloxStories/PLAYBOOK.md` before writing). Only the parts that
needed Flashloop change. When the two skills disagree, this one wins here:
**no Flashloop check, no Flashloop calls, no stop for a missing Flashloop subscription.**

| Step | roblox-story-kit (Flashloop) | This edition |
|---|---|---|
| 0. Account check | `flashloop_whoami`, stop if no sub | `curl -s https://api.elevenlabs.io/v1/user/subscription` → characters left = `character_limit - character_count` |
| 2. Lead character | 3 Flashloop sheets, pick A/B/C | 3 `characters/<key>.json` designs written directly (no sheet) |
| 3-4. Voice + timing | Flashloop voiceover + faster-whisper | `tools/eleven_voice.py` (ElevenLabs TTS with timestamps, no whisper) |
| 5. Textures | Flashloop images | Pillow (pattern of `tools/make_textures.py`), saved in `assets/tex/` |
| 12. Cover | Flashloop image from a frame | best frame + Pillow title (white, black outline) |

## BLOCKTOPIA channel rules (always)

- Every narration's FIRST words are "In this town," and the first sentence is the hook (result first):
  "In this town, I told one tiny lie, and now my head is stuck in the school door!". The rule line
  also says "in this town" ("Because in this town, every time you lie, ..."). Never "in this world".
- Voice: Liam `TX3LPaxmHKxFdv7VOQHJ`, fast and high: `--speed 1.25 --stability 0.25 --style 0.75 --pitch 1.41`,
  then `tools/tighten.py <slug> --max-gap 0.12` (continuous talk, no sentence pauses). Do not retempo slower.
- Captions: white fill, black outline (kit default in finish.py). Never yellow.
- Music: `music/blocktopia_theme.m4a` on every video.
- Stories use any characters the plot needs (Kai or one-off cast). The host avatar `host_()` (owner's
  knight) appears only rarely, to explain something; never as the story lead.
- Look: call `roblox_look()` LAST in every shot (matte SmoothPlastic, soft sun, neutral tone mapping).
  Heads that grow: `grow(ch, t, scale)` / `head_at(ch, t, scale)` scale from the neck.
- Format learned from top channels: R6 avatars, 2D-texture clothes, clean screen (no game UI), bright
  saturated day lighting, low-poly suburbs (red/blue roofs), continuous fast narration, cut every 1-2.5 s.

## 0. Setup (every new container)

```bash
bash /home/user/V-deos-de-Ia/scripts/setup-roblox-kit.sh
```
Ends with `READY`. It installs Mesa (EEVEE renders on CPU here, no GPU), the Blender 5.3 `bpy`
module behind a `blender` shim (download.blender.org is blocked), the venv, the kit workspace
`~/RobloxStories`, and copies this skill's `tools/*.py` into the workspace.
`PY=~/RobloxStories/.venv/bin/python`; run every tool from `~/RobloxStories`.

The ElevenLabs key is injected by the network proxy: never ask for it, never put one in code.
Its budget is **characters**, not credits: a 300-400 word script is ~1,800-2,300 characters.
If the script is longer than the characters left, stop and say how many are missing.

## How a run goes

Same as roblox-story-kit: the request is the brief, decide everything it leaves out, never stop
to show the script. Default has **one stop** (the lead pick); "autopilot" has none.

1. **Idea + script** exactly as roblox-story-kit step 1 (`videos/<slug>/script.txt`).
2. **Lead character.** Write three clearly different designs as `characters/<slug>_A.json`
   (`_B`, `_C`) with the rig's options (same keys as roblox-story-kit step 2; no `sheet`).
   **The stop** (skip on autopilot, where you write one design): the three designs in one line
   each (hair, colours, accessory), the story flow in 4-6 lines, the ElevenLabs characters this
   video will use and the characters left, and "Which one, A, B or C?". After the pick, save it
   as `characters/<key>.json`; in shots use `from_sheet("<key>", t0, t1, "happy")`. Side
   characters: one json each, no asking. Crowds: built-in cast.
3. **Voice.**
   ```bash
   $PY tools/eleven_voice.py <slug>                 # uses eleven_voice_id from config.json
   $PY tools/eleven_voice.py <slug> --reuse         # re-process without spending characters
   $PY tools/eleven_voice.py <slug> --list-voices   # pick another narrator
   $PY tools/eleven_voice.py <slug> --voice-id ID   # use + save it
   $PY tools/tighten.py <slug> --max-gap 0.45
   $PY tools/retempo.py <slug> --wpm 258
   ```
   Default narrator: `TX3LPaxmHKxFdv7VOQHJ` "Liam - Energetic, Social Media Creator" (premade;
   saved as `eleven_voice_id`; if `config.json` lacks it, pass `--voice-id TX3LPaxmHKxFdv7VOQHJ`).
   At `--speed 1.15` Liam lands near 218 wpm, so `retempo --wpm 258` (≈x1.18) is expected.
   Check the summary: 255-280 wpm, 65-75 words before 15 s, no gap over 0.45 s. Never call the
   API twice for the same script: fix timing with `--reuse`, `tighten` and `retempo`.
   Do not clone `<kit>/voice/narrator_sample.mp3` into ElevenLabs: it was licensed for Flashloop.
4. **Textures**: draw every sign, board, poster or screen with Pillow, flat and front-on, short
   text, into `assets/tex/<name>.png`; use `classroom_day(board="<name>.png")` or `card(...)` +
   `img_mat(...)` as in roblox-story-kit step 5. Reuse the 21 textures already in `assets/tex/`.
5. **SFX, shots, preview, render, finish, QA**: roblox-story-kit steps 6-11 unchanged.
   This container has no GPU: preview all shots first, and run `final` in the background
   (`run_in_background`) — expect several seconds per frame, hours for a full video.
6. **Cover**: pick the most dramatic frame from `frames/`, crop to 9:16, draw the 2-4 word title
   big in white with a thick black outline (Pillow, `kit.font("ariblk.ttf", size)`: falls back to DejaVu Sans Bold on Linux), save
   `videos/<slug>/out/cover.jpg`.
7. **Report**: paths to `out/final.mp4`, `out/final_phone.mp4`, `out/cover.jpg`; ElevenLabs
   characters spent and left; what was not checked (you cannot hear the mix). Files in
   `~/RobloxStories` vanish with the container: offer to copy the finished `out/` folder into the
   repo or another place the user picks. Offer `tools/clean.py <slug>` for the frames.

## Common mistakes

- Following roblox-story-kit's step 0 and stopping for Flashloop: this edition replaces it.
- Running `tools/voice_run.py`: it needs whisper, whose models can't download here.
- Re-generating the voice to fix pacing: spends characters; use `--reuse` + tighten/retempo.
- Rendering `final` before checking `preview all` + `contact.py`: a bad shot costs hours on CPU.
