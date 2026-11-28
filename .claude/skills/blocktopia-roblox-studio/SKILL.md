---
name: blocktopia-roblox-studio
description: Use when building or animating a BLOCKTOPIA video inside Roblox Studio through the Roblox Studio MCP server ("monte o vídeo <slug> no Roblox Studio", "build the scenes in Studio", "animate lie_head in Roblox"). Requires the Roblox Studio MCP tools to be connected on the user's own computer.
---

# BLOCKTOPIA: build and animate a video in Roblox Studio

Audio, captions and timing are already made (in the cloud) and live in `roblox-studio/<slug>/`:
`shotlist.json` (shots with start/end seconds, setting, action, camera, narration), `words.json`,
`mix.m4a`, `captions.ass`. Your job is the picture only: build the sets and cast in Studio with real
catalog items, and make a cutscene that plays every shot at its exact time. The user records it with
OBS; `roblox-studio/montar_video.sh` then adds audio and captions.

If the Studio MCP tools are not available, stop and point the user to `roblox-studio/LEIA-ME.md`.

## Look (what top channels of this format do)

- R6 avatars, classic blocky proportions, 2D shirt/pants textures plus catalog accessories (hair,
  hats, headphones). Build characters with `Players:CreateHumanoidModelFromDescription(desc,
  Enum.HumanoidRigType.R6)` and a `HumanoidDescription` (Shirt, Pants, HatAccessory, HairAccessory,
  Face, BodyColors). Use free catalog items; look ids up with the catalog/InsertService through the
  MCP tools, never invent ids. Faces must be expressive (swap Face decals per emotion).
- Environments: bright suburban town (red/blue roofs, sidewalks, picket fences, blocky trees),
  school exterior with entrance doors, classroom with desks and a board, kitchen. Use Roblox
  materials (SmoothPlastic, Brick, Concrete, Grass, Wood) and Creator Store models only when free
  and clearly licensed for use.
- Lighting: Future technology, bright day (ClockTime ~13), ShadowSoftness ~0.3, light Atmosphere,
  ColorCorrection saturation +0.15. No fog. Clean screen: hide all CoreGui (chat, leaderboard,
  backpack, health, player list) and name tags (`Humanoid.DisplayDistanceType = None`).
- Frame for vertical 9:16: keep subjects in the centre third; FieldOfView 50-70.

## Cast for lie_head

- **Kai**: R6, tan skin, messy brown hair, big black headphones with white pads, hoodie split
  purple (left) / orange (right) with crossed sleeves, black pants, white sneakers. Fixed look.
- Little sister, Mayor (top hat, black suit, sash), Weatherman, Teacher (red outfit, hair bun),
  Principal, best friend, classmates (6-8), Kai's dog. One-off looks from the catalog.

## Head growth (the story's mechanic)

R6 heads: scale the `Head` part Size and its `SpecialMesh.Scale` together with TweenService
(EasingStyle.Back, 0.25 s), keep the Neck Motor6D C0/C1 offsets scaled so the head grows UP from
the neck. One step = x1.35. Shrink ("Pop!") with the reverse tween.

## The cutscene

1. Read `roblox-studio/<slug>/shotlist.json`. Build each `setting` once, in separate areas of the map.
2. Create `ServerScriptService.Blocktopia.Cutscene` (or a LocalScript in StarterPlayerScripts)
   with a table of shots: for each shot `start`, `end`, a function that poses/animates the cast
   (Motor6D tweens or Animation objects) and a camera move (CameraType Scriptable; CFrame tweens:
   push-in, crash zoom = quick FieldOfView tween, whip = 0.12 s rotation, small handheld noise).
3. On Play: wait 2 s, then run shots by `os.clock()` against their `start` times so the picture
   stays in sync with the 1:18 audio. Hard cuts between shots, a shot every ~2.7 s.
4. Test with Play; check each shot reads in the portrait device emulator; fix and re-test.
5. Tell the user to record (LEIA-ME step 3) and send the mp4. Assembly:
   `bash roblox-studio/montar_video.sh <slug> recording.mp4`.

## Channel rules

Narration always starts with "In this town,". Captions white with black outline. Music
`blocktopia_theme`. Stories use any characters; English narration (fast, high-pitched Liam voice).
