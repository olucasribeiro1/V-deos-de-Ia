"""Resumable final render: renders shot by shot and skips shots whose frames are all on disk.

    python tools/render_resume.py <slug>            # run (again) after any crash or machine restart

Each shot is its own Blender process (tools/blend.py <slug> final <id>), so a restart loses at most
the shot in progress. Shot ranges come from the @L/@S decorators in shots.py and audio/words.json, with
the same rule as rbx.story.S (frame = round(t * 30) + 1; the last shot ends at the last word + 0.25 s).
Render settings come from the environment (BT_FAST, BT_PCT, BT_SAMPLES), see blocktopia.roblox_look."""
import json, os, re, subprocess, sys, time

STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
F = lambda t: int(round(t * FPS)) + 1


def shot_ranges(slug):
    vdir = os.path.join(STUDIO, "videos", slug)
    words = json.load(open(os.path.join(vdir, "audio", "words.json"), encoding="utf-8"))
    end = words[-1]["end"] + 0.25
    src = open(os.path.join(vdir, "shots.py"), encoding="utf-8").read()
    marks = [(int(a), int(b), c) for a, b, c in re.findall(r"^@[LS]\((\d+),\s*(\d+),\s*(\w+)", src, re.M)]
    t = lambda i: 0.0 if i <= 0 else words[i]["start"]
    out = {}
    for sid, a, b in marks:
        t1 = end if b == "None" else t(int(b))
        out[sid] = (F(t(a)), F(t1) - 1)
    return out


def main():
    slug = sys.argv[1]
    fdir = os.path.join(STUDIO, "videos", slug, "frames")
    os.makedirs(fdir, exist_ok=True)
    ranges = shot_ranges(slug)
    todo = [s for s, (f0, f1) in sorted(ranges.items())
            if not all(os.path.exists(os.path.join(fdir, f"{f:04d}.png")) for f in range(f0, f1 + 1))]
    total = sum(f1 - f0 + 1 for f0, f1 in ranges.values())
    print(f"{len(ranges)} shots, {total} frames; to render: {todo}", flush=True)
    for s in todo:
        t0 = time.time()
        r = subprocess.run([sys.executable, os.path.join(STUDIO, "tools", "blend.py"), slug, "final", str(s)],
                           cwd=STUDIO, capture_output=True, text=True)
        f0, f1 = ranges[s]
        ok = all(os.path.exists(os.path.join(fdir, f"{f:04d}.png")) for f in range(f0, f1 + 1))
        n = f1 - f0 + 1
        print(f"shot {s:02d}: {'ok' if ok else 'FAILED'} {n} frames in {time.time() - t0:.0f}s "
              f"({(time.time() - t0) / n:.1f}s/frame)", flush=True)
        if not ok:
            print(r.stdout[-1500:], flush=True)
    done = sum(1 for f in os.listdir(fdir) if f.endswith(".png"))
    print(f"DONE: {done}/{total} frames on disk", flush=True)


if __name__ == "__main__":
    main()
