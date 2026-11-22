"""Monta o piloto: quadros 3D renderizados + legenda karaoke (por palavra) + selos dos dias + audio original -> MP4 1080p.
Uso: /opt/kidsvenv/bin/python finish_pilot.py [--dur 30]"""
import sys, os, glob, subprocess, math
import numpy as np, skia
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(os.path.dirname(ROOT), "christian-kids-studio", "scripts"))
DUR = float(sys.argv[sys.argv.index("--dur") + 1]) if "--dur" in sys.argv else 30.0
sys.argv = ["x", os.path.join(ROOT, "music")]
import compose_video as A
import draw2d as D
from draw2d import C
W, H = 1920, 1080; S = 1.0; FPS = 30
FONT = skia.Font(D.TF, 64); FONT.setEmbolden(True)

def pop(t, t0, d=0.4):
    if t < t0: return 0.0
    x = (t - t0) / d
    if x >= 1: return 1.0
    return (1 + 0.3 * math.sin(x * math.pi)) * min(1, x * 1.4)

BADGES = [(19.86, 1, "Dia 1: o dia e a noite"), (24.1, 2, "Dia 2: o céu")]

def overlay(cv, t):
    # legenda karaoke: frase atual, palavra cantada em destaque
    cur = [l for l in A.lines if l["s"] - 0.25 <= t <= l["e"] + 0.35]
    if cur:
        l = cur[-1]; sp = FONT.measureText(" ")
        items = [(tk["d"], tk, FONT.measureText(tk["d"])) for tk in l["toks"]]
        rows = [[]]; acc = 0
        for it in items:
            if acc + it[2] > W * 0.82 and rows[-1]: rows.append([]); acc = 0
            rows[-1].append(it); acc += it[2] + sp
        a = max(0.0, min(1.0, (t - (l["s"] - 0.25)) / 0.2, (l["e"] + 0.35 - t) / 0.2))
        lh = 80; top = H - lh * len(rows) - 40 + (1 - a) * 25
        y = top + lh * 0.8
        for r in rows:  # estilo referencia: sem caixa, contorno branco grosso, cantada muda de cor
            x = W / 2 - (sum(i[2] for i in r) + sp * (len(r) - 1)) / 2
            for txt, tk, w in r:
                sung = t >= tk["s"]; now = tk["s"] <= t <= tk["e"] + 0.05
                col = C(30, 170, 210, int(255 * a)) if sung else C(235, 50, 140, int(255 * a))
                yy = y - (8 if now else 0)
                blob = skia.TextBlob(txt, FONT)
                cv.drawTextBlob(blob, x, yy, D.stroke(C(255, 255, 255, int(255 * a)), 14))
                cv.drawTextBlob(blob, x, yy, D.fill(col)); x += w + sp
            y += lh
    for t0, n, label in BADGES:
        if t0 <= t <= t0 + 3.4:
            k = pop(t, t0, 0.45) * (1 if t < t0 + 3.0 else max(0, 1 - (t - t0 - 3.0) / 0.4))
            if k > 0.02:
                x, y, r = W * 0.87, H * 0.2, 105 * k
                D.oval(cv, x, y, r * 1.08, r * 1.08, C(255, 255, 255)); D.oval(cv, x, y, r, r, C(255, 200, 40), 6)
                D.text(cv, str(n), x, y + r * 0.42, r * 1.3, C(255, 255, 255), C(230, 60, 120))
                D.text(cv, label, x, y + r + 58 * k, 46 * k, C(255, 255, 255), C(230, 60, 120))
    if t < 5.5:  # titulo
        k = pop(t, 0.3, 0.5) * (1 if t < 5.0 else max(0, 1 - (t - 5.0) / 0.5))
        D.text(cv, "Quem Fez? Foi Deus!", W / 2, H * 0.16, 130 * k, C(255, 225, 60), C(230, 60, 120))

if __name__ == "__main__":
    have = {int(os.path.basename(f)[2:6]): f for f in glob.glob(os.path.join(ROOT, "renders", "pilot", "f_*.png")) if os.path.getsize(f) > 1000}
    n = int(DUR * FPS)
    frames = []
    for i in range(1, n + 1):  # quadro inexistente usa o anterior (animacao em 15 quadros unicos/s)
        k = i
        while k not in have and k > 1: k -= 1
        frames.append(have.get(k))
    out = os.path.join(ROOT, "exports", "piloto-3d-quem-fez-foi-deus.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", "%dx%d" % (W, H), "-r", str(FPS), "-i", "-",
           "-t", str(n / FPS), "-i", A.audio, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(n):
        img = skia.Image.open(frames[i]).resize(W, H, skia.SamplingOptions(skia.CubicResampler.Mitchell()))
        surf = skia.Surface(W, H); cv = surf.getCanvas(); cv.drawImage(img, 0, 0)
        overlay(cv, i / FPS)
        p.stdin.write(surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType).tobytes())
    p.stdin.close(); p.wait(); print("OK", out, n, "quadros")
