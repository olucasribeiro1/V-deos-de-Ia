"""Cross-dissolve at chosen cuts, in place on rendered frames (no extra rendering, length unchanged).

    python tools/dissolve.py <slug> <shot_id> [<shot_id> ...] [--frames 6]

Each id is the shot the dissolve goes INTO. Its first frame f is found from the shot's start time
(shots.py timing via the render log is not needed: start = words.json time of the shot's first word,
read from videos/<slug>/shot_starts.json, which tools/blend.py cues/final does not write, so this tool
computes it with the same rule as rbx.story.S: shot start = start of its first script word).
Frames f-n..f-1 blend from shot A toward B's first frame; frames f..f+n-1 blend A's last frame out of B.
The blend peaks at 50% on the cut, which reads as a quick dissolve on a phone."""
import argparse, json, os, re, sys
from PIL import Image

STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30


def shot_starts(slug):
    """{shot_id: start_seconds} parsed from the @L/@S decorators of shots.py and words.json."""
    vdir = os.path.join(STUDIO, "videos", slug)
    words = json.load(open(os.path.join(vdir, "audio", "words.json"), encoding="utf-8"))
    src = open(os.path.join(vdir, "shots.py"), encoding="utf-8").read()
    out = {}
    for m in re.finditer(r"^@[LS]\((\d+),\s*(\d+),", src, re.M):
        sid, w0 = int(m.group(1)), int(m.group(2))
        out[sid] = 0.0 if w0 <= 0 else words[w0]["start"]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("shots", type=int, nargs="+")
    ap.add_argument("--frames", type=int, default=6)
    o = ap.parse_args()
    fdir = os.path.join(STUDIO, "videos", o.slug, "frames")
    path = lambda f: os.path.join(fdir, f"{f:04d}.png")
    starts = shot_starts(o.slug)
    n = o.frames
    for sid in o.shots:
        f = int(round(starts[sid] * FPS)) + 1
        if not (os.path.exists(path(f - n - 1)) and os.path.exists(path(f + n))):
            print(f"shot {sid}: frames around {f} missing, skipped"); continue
        a_last, b_first = Image.open(path(f - 1)).convert("RGB"), Image.open(path(f)).convert("RGB")
        for k in range(1, n + 1):                       # before the cut: A fades toward B's first frame
            a = Image.open(path(f - k)).convert("RGB")
            Image.blend(a, b_first, 0.5 * (n - k + 1) / (n + 1)).save(path(f - k))
        for k in range(0, n):                           # after the cut: B fades in over A's last frame
            b = Image.open(path(f + k)).convert("RGB")
            Image.blend(a_last, b, 0.5 + 0.5 * (k + 1) / (n + 1)).save(path(f + k))
        print(f"shot {sid}: dissolve around frame {f}")


if __name__ == "__main__":
    main()
