"""Censura palavrões com bipe no input/voiceover.wav (rodar depois do tts_eleven.py).
Uso: python3 tools/bipe.py --project projects/<slug> --palavras porra,merda [--manter 0.07]"""
import argparse, json, re, numpy as np, scipy.io.wavfile as wf
ap = argparse.ArgumentParser(); ap.add_argument("--project", required=True); ap.add_argument("--palavras", required=True); ap.add_argument("--manter", type=float, default=0.07)
a = ap.parse_args(); P = a.project
sr, x = wf.read(f"{P}/input/voiceover.wav"); y = x.astype(np.float32); mx = 32767.0 if x.dtype == np.int16 else 1.0
W = json.load(open(f"{P}/timeline/words.json"))["words"]; alvo = [p.strip().lower() for p in a.palavras.split(",")]
n = 0
for w in W:
    nw = re.sub(r"[^\wà-ú]", "", w["word"].lower())
    if "*" in w["word"] or any(nw.startswith(p[:4]) for p in alvo):
        s0, s1 = int((w["start"] + a.manter) * sr), int((w["end"] + 0.06) * sr); L = s1 - s0
        t = np.arange(L) / sr; env = np.minimum(1, np.minimum(t, t[::-1]) / 0.008)
        tom = (0.32 * mx * np.sin(2 * np.pi * 1000 * t) * env).astype(np.float32)
        if y.ndim == 2: tom = tom[:, None].repeat(y.shape[1], 1)
        y[s0:s1] = tom; n += 1; print(f"bipe em '{w['word']}' {w['start']:.2f}-{w['end']:.2f}s")
wf.write(f"{P}/input/voiceover.wav", sr, y.astype(x.dtype)); print(n, "bipe(s)")
