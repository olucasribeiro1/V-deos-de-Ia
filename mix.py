#!/usr/bin/env python3
"""mix.py — mixa narração + música (com ducking) e junta ao vídeo, via ffmpeg.

Uso:
  python3 mix.py out/video.mp4 --voz audio/voz.mp3 --musica audio/musica.mp3 -o out/final.mp4
"""
import argparse, json, subprocess, sys
from pathlib import Path

m = json.loads(Path(__file__).with_name("metrics.json").read_text())["audio"]

p = argparse.ArgumentParser()
p.add_argument("video")
p.add_argument("--voz")
p.add_argument("--musica")
p.add_argument("-o", "--saida", default="out/final.mp4")
a = p.parse_args()
if not (a.voz or a.musica):
    sys.exit("Informe --voz e/ou --musica")

cmd = ["ffmpeg", "-y", "-i", a.video]
f, idx = [], 1
if a.voz:
    cmd += ["-i", a.voz]; f.append(f"[{idx}:a]volume={m['voiceVolume']}[voz]"); vi = idx; idx += 1
if a.musica:
    cmd += ["-stream_loop", "-1", "-i", a.musica]; f.append(f"[{idx}:a]volume={m['musicVolume']}[mus]")

if a.voz and a.musica:
    if m.get("duckMusic"):
        f.append("[voz]asplit[voz1][sc]")
        f.append("[mus][sc]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[musd]")
        f.append("[voz1][musd]amix=inputs=2:duration=longest:normalize=0[mix]")
    else:
        f.append("[voz][mus]amix=inputs=2:duration=longest:normalize=0[mix]")
else:
    f.append(f"[{'voz' if a.voz else 'mus'}]anull[mix]")
f.append(f"[mix]loudnorm=I={m['targetLufs']}:TP=-1.5:LRA=11,apad[aout]")

cmd += ["-filter_complex", ";".join(f), "-map", "0:v", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", a.saida]
subprocess.run(cmd, check=True)
print(f"✅ {a.saida}")
