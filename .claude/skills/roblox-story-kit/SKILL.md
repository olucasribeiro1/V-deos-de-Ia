---
name: roblox-story-kit
description: Make an original Roblox-style 3D animated story video (9:16 short, 60-120s, "In this world, X makes you Y" format, first-person narrator) end to end, for Flashloop subscribers only, with Flashloop for the narrator voice, character sheets, textures and cover image, and Blender on this computer for the animation, plus silences cut, sound effects, fast cuts, captions and music. Use when the user says "roblox story", "roblox animation video", "make a story video about X", "make a roblox short about X", asks for story ideas for this format, or sends popular Roblox animation story videos to learn the pattern from. It stops once by default, for the user to pick the lead character from three Flashloop designs; "autopilot" in the request skips that stop too. Also use for first-time setup or updating of the kit ("set up the roblox kit", "update the roblox kit").
---

# Roblox story kit (Flashloop edition)

A complete studio for fast, high-retention Roblox-style story shorts. **Flashloop** makes every
generated asset: the narrator voice, 2D character sheets, textures for signs, boards and
screens, and the cover image. **Blender**, running locally
from Python, builds and animates the blocky 3D characters, sets and camera moves. One video = one
folder `videos/<slug>/`. **The kit works only for users with a Flashloop subscription.**

## 0. Before anything (every time)

**Flashloop subscription: the first check, before anything else (setup, ideas and the example
render included).** Call `flashloop_whoami`.
- The Flashloop tools are not available: stop and tell the user: "I can't make these videos
  without Flashloop. This kit needs a Flashloop subscription: subscribe at flashloop.ai, connect
  Flashloop to Claude (claude.ai Settings > Connectors > Flashloop), then start a new chat."
- `subscription` is `null`, or its `status` says it has ended (canceled, expired, unpaid,
  inactive): stop and tell the user: "I can't generate the videos without a Flashloop
  subscription. Subscribe at flashloop.ai, then ask me again." Do nothing else for this request:
  no setup, no script, no ideas, no renders, no other Flashloop calls.
- Otherwise the user is a subscriber: carry on. Never repeat the account's email to the user.

**Workspace.** The kit's code lives next to this file; videos are made in a separate workspace
(default `~/RobloxStories`). `~/.roblox-story-kit.json` holds `{"workspace", "python", "kit"}`.
- If that file is missing, or the user asks to set up or update: run
  `python "<this skill's folder>/setup.py"` (`--update` after unzipping a new kit version). It
  copies the engine, makes a private Python env (`.venv`), installs numpy, Pillow,
  faster-whisper and yt-dlp, finds Blender and ffmpeg, downloads the music and renders one test
  frame. It prints `READY` or exactly what is missing and the command that fixes it.
- Missing ffmpeg or Blender: give the user the fix line setup printed and offer to run it
  (winget on Windows, brew on Mac). Ask first: it installs software. Blender must be 5.x.
- Run every command below **from the workspace folder** with the kit's python:
  `PY` = the `python` path in `~/.roblox-story-kit.json`.

**Flashloop credits.** `credits_balance` from `flashloop_whoami` is the balance. Before the first paid step,
check the balance covers the whole video (`flashloop_estimate_cost`); if it doesn't, stop and say
how many credits are missing. Otherwise never stop for a cost: the estimate is shown once, at the
character stop (step 2), and the total spent goes in the final report.

**Narrator voice (once per Flashloop account).** Every video uses the same narrator, cloned into
the user's own Flashloop account from the sample that ships with the kit
(`<kit>/voice/narrator_sample.mp3`, provided by the kit's author for kit users). `<kit>` is the
`kit` path in `~/.roblox-story-kit.json`.
1. `$PY tools/kit.py get flashloop_voice_id`. If it prints an id and `flashloop_list_voices` lists
   that id with owner `user`, it is ready: skip to the pipeline.
2. If `flashloop_list_voices` already has a user voice named "Roblox Story Narrator", save its id
   (step 5) instead of cloning again.
3. Upload the sample: `flashloop_upload_media` with `filename: "narrator_sample.mp3"`,
   `content_type: "audio/mpeg"`, `kind: "audio"`. Run the `command` it returns with `<file>`
   replaced by the sample's full path (quote it). Then call `flashloop_upload_media` again with
   `url` = the returned `public_url`, `kind: "audio"`, `content_type: "audio/mpeg"`.
4. `flashloop_clone_voice` with `name: "Roblox Story Narrator"` and `audio_url` = the `url` from
   the second upload call.
5. `$PY tools/kit.py set flashloop_voice_id <id>`.
If cloning fails, use the built-in voice in `fallback_voice_id` (Flashloop's "Caleb") and tell
the user.

Read `PLAYBOOK.md` in the workspace before writing: the numbers to hit, beat sheet, hook
checklist, shot grammar, camera, acting, captions and sound rules distilled from 9 popular
reference videos. Worked examples: `videos/laugh_float/shots.py` (73 shots, 88s) and
`videos/sneeze_teleport/shots.py` (66 shots, 71s). Copy their style. Both ship with their voice
already processed, so `$PY tools/blend.py sneeze_teleport final` then
`$PY tools/finish.py sneeze_teleport` makes a real video with no credits: a good first test.

Stories must be original: our own characters, sets and plots, no real Roblox UI, logos, avatars
or game sounds, and no copied plots of other creators' videos.

## How a run goes

The user's request is the brief. Anything it leaves out (the idea, the story, the characters, the
title) you decide yourself: never ask about it. Anything it describes (a story, a character, a
place) you follow.

- **Default: two prompts.** Request, then you do everything up to the lead character's three
  Flashloop designs, then **the one stop** (step 2): the designs, the story flow in a few lines,
  the credit estimate and "Which one, A, B or C?". Their answer, then the finished video with no
  more questions.
- **Autopilot: one prompt.** The request says "autopilot" (or "make every decision", "don't ask
  me anything"): no stop at all. You make one design for the lead and pick it, and the next thing
  the user sees is the finished video.
- If the request already settles the lead (names a saved character, "same character as last
  time"), there is nothing to pick, so there is no stop either.

Never stop to show the script, to confirm a cost or to report progress. The only other stops:
no Flashloop subscription (step 0), first-time setup has to install software (ask first), or the
balance can't cover the video. Long steps (voice processing, the final render) run in the background:
carry on as soon as each one finishes, without asking the user to come back.

## The pipeline

1. **Idea + script** (`videos/<slug>/script.txt`, `#` lines are notes). Shell: everyday thing +
   one impossible rule. Beat sheet from the playbook: result-first hook line, "You see, in this
   world, ...", 2-3 society examples (each its own location), "But" pivot, escalation ladder
   with onomatopoeia ("Poof!", "Bonk!") and short shouted lines, "Then I noticed something"
   (win using the world's own rule), payoff, 2-6 word button that reopens the loop (a callback
   works great). 300-400 words; ~65-75 words must land in the first 15s.
   Don't show the script for approval: nobody reads it. It feeds the story flow at the stop.

2. **Lead character (Flashloop sheets) and the one stop.**
   **Designs.** Give the lead three clearly different looks (hair, colors, one accessory each),
   all fitting the story; if the user described the character, make three takes on that
   description. Start all three at once: three `flashloop_create_image` calls, one design each
   (`model_id` from `$PY tools/kit.py get image_model`, `aspect_ratio: "16:9"`, `image_count: 1`,
   ~400 credits each). On autopilot, make one. Keep designs buildable by the 3D rig. Prompt
   template:
   > Character reference sheet for an original blocky 3D toy avatar in the classic block-body
   > style: a cube head, a rectangular torso, separate rectangular block arms and legs, smooth
   > glossy plastic look, soft studio lighting. Show the same character three times side by side:
   > front view, side view, back view, standing straight with arms down, on a plain white
   > background. Design: <who they are; hair shape; face; shirt with optional stripes, checks or
   > one simple chest logo; pants; at most one accessory: glasses, beard, backpack, collar>. Under
   > the views, a row of flat color swatches for skin, hair, shirt, pants with their hex codes
   > written below each swatch. No text other than the hex codes, no logos.

   `flashloop_wait_for_job` each one and download its `url` with curl to
   `characters/_options/<slug>_A.jpg` (`_B`, `_C`). Then
   `$PY tools/options.py <slug> characters/_options/<slug>_A.jpg characters/_options/<slug>_B.jpg characters/_options/<slug>_C.jpg`
   puts them in one labelled picture, `videos/<slug>/character_options.jpg`.

   **The stop** (skip it on autopilot). One message with:
   - the picture: send the file if your app can show it (for example SendUserFile in the Claude
     desktop app), and always give its full path and the three Flashloop image links;
   - the story flow: the title, the world's rule in one line, then 4-6 short lines of what the
     lead does and what happens, ending on the twist;
   - the credits: the estimate for the rest of the video (voice from step 3, other sheets,
     textures, cover) and the balance;
   - saved leads from `characters/`, if there are any, on one line ("or reuse Maya");
   - one question: "Which one, A, B or C? You can change anything in the story in the same reply."
   Spend nothing more until they answer. The answer can also change the story or the look ("B
   with a red cap"): apply it (rewrite the script, edit the json, or one more sheet only if the
   change is big) and carry on without asking again.

   **After the pick** (or your own pick on autopilot): copy the chosen sheet to
   `characters/<key>_sheet.jpg`, look at it, then write `characters/<key>.json` with the matching
   `Char` arguments:
   ```json
   {"name": "Maya", "skin": "#EED7BC", "hair": "bob", "hair_color": "#5B3F2E",
    "shirt": "#7EBDE6", "pants": "#31496B", "face": "girl", "sleeves": "short",
    "bolt": null, "vneck": null, "shirt_kind": null, "extras": ["glasses"],
    "sheet": "characters/maya_sheet.jpg", "notes": "the narrator's best friend"}
   ```
   Options the rig has: `hair` spiky messy short slick buzz bob bun cap helmet tophat pilot bald
   none; `face` kid hero girl plain mustache villain hero_blood; `sleeves` short long;
   `shirt_kind`/`pants_kind` stripes checker (second color in `shirt_c2`/`pants_c2`); `bolt` = a
   lightning logo color on the chest; `vneck` = collar color; `extras` glasses beard collar
   backpack (`"backpack:TEXT"`). Pick the nearest option for anything the sheet shows that the
   rig lacks. In shots: `M = from_sheet("maya", t0, t1, "happy")` (from `rbx.story`). Sheets
   are reused across videos, so a character is designed once.

   **Other characters.** Named side characters who matter to the story get one sheet each, made
   the same way without asking (no options, ~400 credits each). Background people and crowds use
   the built-in cast (`kid(i)`, `townie`, `crowd`) and need no sheet.

3. **Voice (Flashloop).** `$PY tools/script_text.py <slug>` prints the exact narration text and
   its cost (~4 credits per character, about 8,000 for a 2,000-character script).
   `flashloop_generate_voiceover` with that text, `voice_id` = `flashloop_voice_id`, `model_id`
   = Flashloop's v4 voiceover model (the v4 one that is not turbo; it works with the cloned narrator),
   or `$PY tools/kit.py get flashloop_voice_model` if that is set, `language_code: "en"`. Then
   `flashloop_wait_for_job` (call again on `timeout`) and download `output.url` with curl to
   `videos/<slug>/audio/raw.mp3`. Over 10,000 characters: split into two takes and join them with
   ffmpeg.

4. **Voice processing** (from the workspace):
   ```
   $PY tools/voice_run.py --video <slug> --voice videos/<slug>/audio/raw.mp3 --speed 1.15
   $PY tools/tighten.py <slug> --max-gap 0.45
   $PY tools/retempo.py <slug> --wpm 258
   ```
   voice_run = speed up, cut silences (0.10s inside sentences, 0.22s between, so it never
   sounds chopped), then faster-whisper word timestamps aligned to the script (first run
   downloads the whisper model, ~1.5 GB; on CPU it takes a few minutes). tighten trims breaths
   the silence cutter keeps. Then check `audio/words.json`: 255-280 wpm, 65-75 words before 15s,
   no gap over ~0.45s.

5. **Textures (Flashloop).** Every sign, poster, chalkboard, TV screen, billboard, book cover or
   backdrop the story shows: `flashloop_create_image` (~400 credits each; `aspect_ratio` = the
   prop's shape, e.g. `"16:9"` for a board, `"3:4"` for a poster), flat and front-on, readable
   at a glance, short text only and spelled out in quotes in the prompt. Download to
   `assets/tex/<name>.jpg`. Use it with `classroom_day(board="<name>.jpg")`, or on any prop:
   `card("my_sign", w, h, loc, img_mat("my_sign", os.path.join(W.TEX, "<name>.jpg"), 0.6), "-Y")`.
   Reuse textures across videos instead of regenerating.

6. **Sound effects**: the kit ships a pack in `sfx/` (`aww boing bonk boom buzzer cashier chat
   cheer click clink coin confetti crickets crowd ding door footsteps gasp glitch hammer jet
   kids_laugh meow paper pigeon place poof pop rimshot rise rocket rope sneeze snort sparkle
   splat stomp teleport thud whoosh wind window zombie alarm`). Flashloop has no sound-effect
   generator: reuse the pack, or synthesize a simple new tone with numpy into `sfx/<name>.wav`
   and add `lead`/`gain` to `sfx/pack.json` (lead = seconds before the peak, so the hit lands on
   the cue).

7. **Shots** (`videos/<slug>/shots.py`):
   ```python
   from shotkit import *
   from rbx import story
   from rbx.story import *
   V = Video(__file__); story.bind(V)
   @S(1, 0, 7, "HOOK: ...")          # shot = script words 0..7; last shot uses None
   def s01(t0, t1): ...
   ```
   Timing is by script word index, so re-generating the voice never breaks the edit. Cut on the
   word that brings a new image, 50-60 cuts per minute (~1.1s average), every noun on screen,
   reaction close-up after every surprise, alternate wide/close/insert. Every shot needs camera
   motion (`cam.push/orbit/crash/whip/track/handheld`; `ensure_motion` adds a drift if you
   forget). Hook: first frame already mid-action and mid-move, crash zoom and whip in the first
   3s. Put `sfx(t, "name")` on every hit, whoosh, poof and reveal.

8. **Preview + fix** (fast: ~2 min for 66 shots on a decent GPU):
   ```
   $PY tools/blend.py <slug> preview all
   $PY tools/contact.py <slug> all 12 full        # -> videos/<slug>/full.jpg, look at it
   $PY tools/blend.py <slug> still:12.3 14 16     # one frame of shot 14 at t=12.3s, half res
   ```
   Look at every tile. Fix, re-preview just those shots (`preview 3,7,12`), repeat until every
   frame reads: face visible, subject framed, nothing blocking the lens.

9. **Render**: `$PY tools/blend.py <slug> cues` (writes `audio/cues.json`), then
   `$PY tools/blend.py <slug> final` in the background. Roughly 1.5-2.5 s per frame on a gaming
   laptop GPU (~1h for 80s), much slower without a GPU; never run two finals at once.

10. **Finish**: `$PY tools/finish.py <slug>` mixes voice + SFX + music, burns one-word captions,
    writes `out/final.mp4`, `out/final_nocaptions.mp4` and `out/final_phone.mp4` (720p, ~25 MB).
    Music: the first audio file in `music/` (setup downloads TEMPOREX "Numbers"), sped up 1.5x at
    the same pitch, ~14 dB under the voice and ducked while it talks.

11. **QA the final file**, not just previews:
    `ffmpeg -i videos/<slug>/out/final.mp4 -vf "fps=1/1.8,scale=216:384,tile=10x4" -frames:v 1 videos/<slug>/qa.jpg`.
    Fix any bad shot, `final <ids>` just those shots, re-run finish.

12. **Cover image (Flashloop).** Always make one: it is part of the finished video (~400
    credits). Pick the most dramatic frame from `frames/`, upload it
    (same two-call `flashloop_upload_media` + curl flow as the voice sample, `kind: "image"`,
    `content_type: "image/png"`), then `flashloop_create_image` with it in
    `reference_image_urls`, `aspect_ratio: "9:16"`: "a bold YouTube Shorts cover from this frame,
    same characters and style, big punchy 2-4 word title '<TITLE>' in white with a black
    outline". Download to `videos/<slug>/out/cover.jpg`.

13. **Report**: where the video and cover are, Flashloop credits spent (voice, sheets, textures, cover),
    anything not checked. You cannot hear the mix, so say so and ask the user to watch it with
    sound. Offer `$PY tools/clean.py <slug>` to delete the rendered frames (several GB) once they
    are happy.

## Toolkit map

- `rbx/core.py` primitives, materials (`mat`, `img_mat`), `card`, `Cam` (push, orbit, crash,
  whip, track, handheld), `sfx`.
- `rbx/chars.py` R6 characters (`Char`, presets `eddie`, `kid(i)`...); options listed in step 2.
- `rbx/acting.py` layered faces: `face(t, "shock")` or `face(t, eyes=, mouth=)`, `blink`,
  `talk` (lip flaps), `act(t, gesture)` with overshoot, `look`, `nod`, `shake`, `jump`, `run`,
  `panic`, `wiggle`, `breathe`. Gestures: idle shock hands_head hands_face cheer point point_l
  shrug recoil lean slump think cross phone reach push hold wave fists facepalm brace.
- `rbx/story.py` cast (eddie, leo, pickle, grandma, pilot, mayor, gus, townie, `from_sheet`),
  `laugh`, `drift`, `dangle`, `fly`, `look_at`, `facing`, `lips`, `class_scene`, `kids_float`,
  `sky_scene`, `cloud_ring`, `town_scene`, `crowd_src` + `crowd` (instanced crowds, cheap),
  `human_chain`, `confetti`, `stars_ring`, `spin`, `puff`.
- `rbx/world.py` (W): `sky`, `space_world`, `sun`, `cloud`, `classroom_day(board=)` (front-row
  desks `E_DESK`/`L_DESK`, hinged window), `town` (school + streets + playground; the area
  around (0,-30) is open street), `comedy_club`, `cockpit`, `tv_room`, `hallway_day`, props
  `pigeon dog car crater toupee`. `W.TEX` = the textures folder.
- `rbx/world2.py` (W2): `cat`, `airliner`, `cabin` (+`seat_root`), `earth`, `moon`,
  `astronaut_helmet`, `pepper_jail`, `flower_shop`, `parking_lot`, `seated_audience`, and the
  teleport kit `poof`, `vanish`, `appear`, `sneeze` (wind-up + CHOO + mist), `tomato`.
- Older sets in `rbx/sets.py` / `rbx/locs.py`: bedroom, mirrors, burning hallway, bathrooms,
  living room, dusk street, dark hall, school corridor, classroom (dim), fire FX in `rbx/fx.py`.
- `tools/kit.py get|set <key>`: settings in `config.json` (voice id, image model, Blender path).
- `tools/options.py <slug> <A> <B> [<C> <D>]`: character design options in one picture with big
  A/B/C/D labels, for the stop in step 2.
- `tools/analyze_inspo.py <folder> <out>`: pacing/cut/word-timing analysis of reference videos
  the user sends, to learn a pattern (never to copy a plot).

## Traps already hit (check these in every preview)

- **Camera inside a house / prop**: ground cameras in `town` must stay in the open area
  (x -40..40, y -55..10). Blank single-colour preview tiles almost always mean this.
- **Visibility keys on the same frame**: show/hide keys less than one frame apart collapse into
  one key and the object is hidden for the whole shot. `W2.vanish` keys one full frame earlier.
- **Prop scale**: a Roblox head is ~1.24 wide. Cats and props at 0.5-0.6 scale; never put a
  prop between the lens and the face.
- **Props riding on a character** (cat on head, hats): parent to `ch.head` (see `cat_on_head` in
  sneeze_teleport), never to `ch.root` with a guessed offset.
- **Poofs**: `s=0.6` indoors, 1.5-6 outdoors for vehicles.
- **Framing math**: visible width = 2 x distance x 6.75 / lens. Two characters 3 units apart
  need ~5.5 units of width (lens 20 at distance 8).
- **Brows under hair**: keep the fringe above the brow line or angry reads as "wide".
- **Tall buildings shadow the street**; the town keeps the centre low.
- **No custom attributes on bpy objects** (`obj.head = ...` fails): look things up by name.
- Sky looks pale under AgX: `W.sky()` defaults are already saturated, don't wash them out.
- **Flashloop jobs**: `flashloop_wait_for_job` returning `timeout` means still running: call it
  again with the same id. Download outputs right away and keep them in the workspace.
- Long Python in a shell heredoc can fail on Windows: write patch scripts to a file and run them.
