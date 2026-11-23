# Roblox Story Kit (Flashloop edition)

Makes original Roblox-style 3D story shorts (9:16, 60-120s) from one sentence:
"make a roblox story about hiccups making you shrink". Claude writes the story, then Flashloop
makes the narrator voice, the character designs, the textures and the cover. Next, Claude
builds and animates every shot in Blender (blocky characters, sets, fast camera moves), adds
sound effects, music and captions, and hands you an mp4.

## What you need

- **Claude Code**: the desktop app's Code tab, or the terminal version.
- **A Flashloop subscription**, connected to Claude: claude.ai > Settings > Connectors > Flashloop.
  The kit only works for Flashloop subscribers: without a subscription, Claude tells you it can't
  make the videos and stops. Everything generated (voice, images) is paid with Flashloop credits.
  A typical video is about 10,000 to 11,000 credits: ~8,000 for the voice, ~1,200 for the three character designs, ~400
  for the cover, and ~400 for each extra character or texture.
- **Blender 5.2 or newer**: free from blender.org.
- **ffmpeg**: Windows `winget install --id Gyan.FFmpeg -e`, Mac `brew install ffmpeg`.
- **Python 3.10 to 3.13**: from python.org. On Windows, tick "Add python to PATH".
- **A computer with a decent graphics card.** A 70s video renders in about an hour on a gaming
  laptop, and slower without one. Each video uses ~5 GB of disk while rendering, and the kit
  can delete that afterwards.

## Install (5 minutes)

1. Unzip this folder into your Claude skills folder so the path is:
   - Windows: `C:\Users\<you>\.claude\skills\roblox-story-kit\SKILL.md`
   - Mac: `~/.claude/skills/roblox-story-kit/SKILL.md`
2. Open Claude Code and say: **"set up the roblox kit"**. It creates `~/RobloxStories`, installs
   what it needs, downloads the music and test-renders one frame. If something is missing, it
   tells you the one command to fix it.
3. On your first video, Claude clones the kit's narrator voice into your Flashloop account (one
   time, a few seconds). Every video after that uses it.

## Use

- **"make me a roblox story"** (or "...about \<idea\>"): Claude decides everything you didn't
  say, then stops once to show you three Flashloop designs for the main character and the story
  in a few lines. Reply with a letter (add any story changes in the same reply if you want), and
  the next thing you get is the finished video.
- **"make me a roblox story, autopilot"**: no stop at all. Claude picks the character too, and
  the next thing you get is the finished video.
- Describe the story or the character as much as you like; Claude follows it. Anything you leave
  out, it decides.
- "give me 10 roblox story ideas"
- "render the example video": makes one of the two included videos with no credits, so you
  can see the system work.

Finished videos land in `~/RobloxStories/videos/<name>/out/`:
- `final.mp4` is the upload file.
- `final_phone.mp4` is a smaller copy.
- `cover.jpg` is the cover image.

Characters you design are saved in `~/RobloxStories/characters/` and reused in later videos.

## Settings (`~/RobloxStories/config.json`)

- `flashloop_voice_id`: the narrator voice in your Flashloop account (filled in automatically).
- `image_model`: the Flashloop model for character sheets, textures and covers.
- `music_mode`: `tempo` keeps the music's pitch (default), `speed` pitches it up.
- `blender`: the path to Blender, if setup couldn't find it.
- To use different music, put any audio file in `~/RobloxStories/music/` (the first one is used).

## Updating

Unzip the new version over the old skill folder, then say "update the roblox kit". Your videos,
characters and settings are kept.
