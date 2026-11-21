"""Videoclipe 2D: cada frase da letra tem sua cena, sincronizada pelo tempo de cada palavra.
Uso: /opt/kidsvenv/bin/python compose2d.py <pasta_musica> [--preview] [--start S --dur D] [--frames t1,t2,..]"""
import sys, os, math, random, subprocess, time
import numpy as np, skia

args = sys.argv[1:]
MUS = args[0]
PREVIEW = "--preview" in args
START = float(args[args.index("--start") + 1]) if "--start" in args else 0.0
DUR = float(args[args.index("--dur") + 1]) if "--dur" in args else None
FRAMES = [float(x) for x in args[args.index("--frames") + 1].split(",")] if "--frames" in args else None
sys.argv = ["x", MUS]
import compose_video as A          # alinhamento letra x tempo, batida
import draw2d as D
from draw2d import C

W, H = (960, 540) if PREVIEW else (1920, 1080)
FPS = 30
S = H / 1080
lines, find, beat_phase, TOTAL = A.lines, A.find, A.beat_phase, A.TOTAL
ROOT = A.ROOT

def L(sub):
    """linha da letra que contem o trecho"""
    for l in lines:
        if sub.lower() in l["text"].lower(): return l
    raise KeyError(sub)
def Ln(sub, n):
    c = 0
    for l in lines:
        if sub.lower() in l["text"].lower():
            if c == n: return l
            c += 1
    raise KeyError(sub)

def ease(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def pop(t, t0, d=0.4):
    if t < t0: return 0.0
    x = (t - t0) / d
    return 1.0 if x >= 1 else (1 + 0.3 * math.sin(x * math.pi)) * ease(x * 1.4)
def hop(t, amp=1.0, off=0.0): return abs(math.sin((beat_phase(t) + off) * math.pi)) * amp

# ------------------------------------------------------------------ boca / piscar
def mouth(t, who):
    for l in lines:
        if l["e"] + 0.2 < t or l["s"] - 0.2 > t: continue
        for tk in l["toks"]:
            if tk["s"] - 0.03 <= t <= tk["e"] + 0.02:
                if (who == "lulu") != tk["choir"]:
                    return 0.35 + 0.65 * abs(math.sin((t - tk["s"]) * math.pi / 0.17))
    return 0.0
def blink(t, seed): return ((t + seed * 1.37) % 3.3) < 0.12

# ------------------------------------------------------------------ cenas (roteiro pela letra)
# cada cena: (inicio, nome).  O inicio vem do tempo real da primeira palavra da frase.
def cue(sub, n=0, pre=0.25): return Ln(sub, n)["s"] - pre
CH = [Ln("Quem fez o sol", i) for i in range(4)]
def chorus_cues(i):
    base = CH[i]
    return [(base["s"] - 0.3, "ch_sol", i)]
SCENES = [
    (0.0, "intro"),
    (cue("No começo"), "escuro"),
    (cue("Haja luz", pre=0.1), "luz"),
    (cue("Um dedinho"), "dia_noite"),
    (cue("Dois dedinhos"), "ceu"),
    (cue("E a cada coisa", 0), "bom"),
    (CH[0]["s"] - 0.3, "refrao"),
    (cue("Três dedinhos"), "terra"),
    (cue("Brotou"), "brotou"),
    (cue("Quatro dedinhos"), "sol_nasce"),
    (cue("E a lua com"), "lua"),
    (cue("Cada estrela"), "estrelas"),
    (cue("E a cada coisa", 1), "bom"),
    (CH[1]["s"] - 0.3, "refrao"),
    (cue("Cinco dedinhos"), "mar"),
    (cue("bem-te-vi"), "passaro"),
    (cue("Seis dedinhos"), "bichos"),
    (cue("E do pó"), "po"),
    (cue("Soprou vida"), "coracao"),
    (cue("Deus olhou pra tudo"), "muito_bom"),
    (CH[2]["s"] - 0.3, "refrao"),
    (cue("Sete dedinhos"), "descanso"),
    (cue("Em paz eu deito"), "paz"),
    (cue("Porque Deus cuida"), "mao"),
    (CH[3]["s"] - 0.3, "festa"),
    (cue("Se Deus sabe o nome"), "final"),
]
SCENES.sort()

# ------------------------------------------------------------------ ajudantes de personagens
def kids(cv, t, poseL, poseT, xl=0.38, xt=0.62, y=0.95, size=560, dance=1.0, dim=False, lookL=0.0, lookT=0.0, legs=True):
    s = size * S
    for who, x, pose, seed, off in (("theo", xt, poseT, 2, 0.5), ("lulu", xl, poseL, 0, 0.0)):
        aL, aR = pose
        wig = math.sin(beat_phase(t) * 2 * math.pi) * 8 * dance
        D.kid(cv, who, W * x, H * y - hop(t, 22 * S * dance), s * (1 - 0.03 * dance * math.cos(beat_phase(t) * 2 * math.pi)),
              armL=aL + wig, armR=aR - wig, mouth=mouth(t, who), blink=blink(t, seed),
              tilt=3 * dance * math.sin((t * 112.3 / 60 / 2) * 2 * math.pi + off * 3), look=lookL if who == "lulu" else lookT)
    if dim:
        cv.drawRect(skia.Rect(0, 0, W, H), D.fill(C(10, 10, 40, 140)))

UP = (150, 150); WAVE = (25, 150); IDLE = (15, 15); OPEN = (95, 95); PRAY = (-40, -40); SELF = (-45, 20)
POINT = (165, 20); CLAP_A = (-25, -25); CLAP_B = (35, 35)
def clap(t): return CLAP_A if beat_phase(t) < 0.5 else CLAP_B
def dance(t): return UP if int(t * 112.3 / 60) % 2 else WAVE

def badge(cv, t, t0, n, label):
    if t < t0 or t > t0 + 3.4: return
    a = pop(t, t0, 0.45) * (1 if t < t0 + 3.0 else max(0, 1 - (t - t0 - 3.0) / 0.4))
    if a <= 0.02: return
    x, y, r = W * 0.86, H * 0.2, 105 * S * a
    D.oval(cv, x, y, r * 1.08, r * 1.08, C(255, 255, 255))
    D.oval(cv, x, y, r, r, C(255, 200, 40), 6 * S)
    D.text(cv, str(n), x, y + r * 0.42, r * 1.3, C(255, 255, 255), C(230, 60, 120))
    D.text(cv, label, x, y + r + 55 * S * a, 46 * S * a, C(255, 255, 255), C(230, 60, 120))

def big_text(cv, t, t0, txt, y=0.2, size=140, col=C(255, 225, 60), dur=2.6):
    if t < t0 or t > t0 + dur: return
    a = pop(t, t0, 0.45) * (1 if t < t0 + dur - 0.3 else max(0, (t0 + dur - t) / 0.3))
    D.text(cv, txt, W / 2, H * y, size * S * a, col, C(230, 60, 120))

def sparkles(cv, t, n=16, seed=1, area=(0.0, 0.0, 1.0, 0.7), col=C(255, 245, 150)):
    r = random.Random(seed)
    for i in range(n):
        x = W * r.uniform(area[0], area[2]); y = H * r.uniform(area[1], area[3])
        D.sparkle(cv, x, y, (6 + 9 * abs(math.sin(t * 3 + i))) * S, col)

# ------------------------------------------------------------------ cenas
def sc_intro(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    D.sun(cv, W * 0.86, H * 0.18, 85 * S, t)
    for i in range(3): D.butterfly(cv, W * (0.15 + 0.3 * i) + 60 * S * math.sin(t * 1.3 + i), H * (0.45 + 0.05 * math.sin(t * 2 + i)), 26 * S, t + i)
    lv = L("Levanta os dedinhos")["s"]
    pose = POINT if t >= lv else WAVE
    kids(cv, t, pose, (pose[1], pose[0]) if pose == POINT else WAVE)
    D.animal(cv, "sheep", W * 0.84, H * 0.96 - hop(t, 25 * S), 230 * S, t)
    a1 = pop(t, 0.4, 0.5); a2 = pop(t, 1.0, 0.5)
    fade = 1 if t < lv - 0.3 else max(0, 1 - (t - lv + 0.3) / 0.5)
    if fade > 0:
        D.text(cv, "Quem Fez?", W / 2, H * 0.2, 150 * S * a1 * fade, C(255, 225, 60), C(230, 60, 120))
        D.text(cv, "Foi Deus!", W / 2, H * 0.36, 150 * S * a2 * fade, C(255, 255, 255), C(60, 130, 240))

def sc_escuro(cv, t, t0, t1):
    D.scenery(cv, W, H, "dark", t)
    look = math.sin(t * 1.5)
    kids(cv, t, OPEN, OPEN, dance=0.3, dim=True, lookL=look, lookT=-look)
    D.text(cv, "?", W * 0.3, H * 0.35, 120 * S * (0.8 + 0.2 * math.sin(t * 4)), C(255, 255, 255), C(90, 80, 160))
    D.text(cv, "?", W * 0.7, H * 0.3, 100 * S * (0.8 + 0.2 * math.sin(t * 4 + 1)), C(255, 255, 255), C(90, 80, 160))

def sc_luz(cv, t, t0, t1):
    k = ease((t - t0) / 1.2)
    D.scenery(cv, W, H, "meadow" if k > 0.5 else "dark", t)
    D.light_burst(cv, W, H, t, 1 - 0.5 * k)
    kids(cv, t, UP, UP)
    sparkles(cv, t, 24, 3)

def sc_dia_noite(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    cv.save(); cv.clipRect(skia.Rect(W / 2, 0, W, H)); D.scenery(cv, W, H, "night", t); D.moon(cv, W * 0.78, H * 0.2, 70 * S); cv.restore()
    D.sun(cv, W * 0.22, H * 0.2, 75 * S, t)
    cv.drawLine(W / 2, 0, W / 2, H, D.stroke(C(255, 255, 255), 6 * S))
    D.tag(cv, W * 0.25, H * 0.42, "DIA", 52 * S); D.tag(cv, W * 0.75, H * 0.42, "NOITE", 52 * S)
    kids(cv, t, POINT, (20, 165))
    badge(cv, t, t0 + 0.25, 1, "Dia 1: a luz")

def sc_ceu(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    k = ease((t - t0) / 2.0)
    for i in range(5):
        D.cloud(cv, W * (0.1 + 0.2 * i), H * (0.12 + 0.08 * (i % 2)) + (1 - k) * 200 * S, (120 + 40 * (i % 3)) * S, int(255 * k))
    D.sun(cv, W * 0.5, H * 0.22, 70 * S, t)
    kids(cv, t, POINT, (20, 165))
    badge(cv, t, t0 + 0.25, 2, "Dia 2: o céu")

def sc_bom(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    D.sun(cv, W * 0.86, H * 0.18, 80 * S, t)
    sparkles(cv, t, 18, 5)
    tb = find("bom") if False else None
    l2 = [l for l in lines if l["s"] >= t0 - 0.5][1]
    kids(cv, t, clap(t), clap(t))
    big_text(cv, t, l2["s"], "Isso é bom!", 0.2, 140)

def sc_refrao(cv, t, t0, t1, festa=False):
    D.scenery(cv, W, H, "rainbow" if festa else "meadow", t)
    l = [x for x in lines if x["s"] >= t0 - 0.1][:6]
    ts, tm, tf, te, tfal, tceu = l[0]["s"], l[1]["s"], l[2]["s"], None, l[4]["s"], l[5]["s"]
    for tk in l[2]["toks"]:
        if A.norm(tk["d"]) == "eu": te = tk["s"]
    if festa or t >= tfal:
        D.rainbow(cv, W / 2, H * 0.78, W * 0.42, ease((t - (t0 if festa else tfal)) / 0.8))
    sun_s = pop(t, ts + 0.3, 0.5)
    if sun_s > 0: D.sun(cv, W * 0.82, H * 0.2, 95 * S * sun_s, t)
    if t >= tm + 0.3:
        k = ease((t - tm - 0.3) / 0.6)
        cv.drawRect(skia.Rect(0, H * (1.02 - 0.22 * k), W * 0.32, H), D.fill(C(70, 160, 240)))
        D.animal(cv, "whale", W * 0.14, H * (1.15 - 0.27 * k) - abs(math.sin(t * 2)) * 30 * S, 260 * S, t)
    if t >= tf + 0.3:
        D.flower(cv, W * 0.3, H * 0.62, 55 * S * pop(t, tf + 0.3), C(255, 110, 170), math.sin(t * 3) * 0.3)
    tp = l[2]["s"] + 0.8
    if tp <= t <= tp + 3.5:
        D.animal(cv, "bird", W * (-0.05 + (t - tp) * 0.32), H * (0.3 + 0.05 * math.sin(t * 6)), 130 * S, t)
    if t >= tceu:
        for i in range(4): D.note(cv, W * (0.1 + 0.27 * i), H * (0.42 - ((t - tceu) * 0.08 + i * 0.05) % 0.3), 40 * S, [C(255, 90, 160), C(80, 160, 255), C(255, 180, 40), C(120, 200, 90)][i])
    if festa:
        for i, kind in enumerate(("lion", "giraffe", "monkey", "capybara")):
            D.animal(cv, kind, W * [0.07, 0.93, 0.2, 0.8][i], H * 0.9 - hop(t, 20 * S, i * 0.25), [190, 230, 170, 160][i] * S, t)
        rr = random.Random(2)
        for i in range(70):
            x = rr.uniform(0, W); sp = rr.uniform(120, 260) * S; y = (rr.uniform(0, H) + (t - t0) * sp) % (H + 30) - 15
            cv.save(); cv.translate(x + math.sin(t * 2 + i) * 25 * S, y); cv.rotate(t * 200 + i * 40)
            cv.drawRect(skia.Rect(-8 * S, -4 * S, 8 * S, 4 * S), D.fill([C(255, 80, 120), C(255, 200, 40), C(80, 180, 255), C(120, 220, 90), C(190, 110, 255)][i % 5]))
            cv.restore()
    # poses pela letra
    if te and te - 0.15 <= t <= te + 1.2: pose = (SELF, (-20, 45))
    elif ts <= t < tm: pose = (POINT, (20, 165))
    elif tm <= t < tf: pose = (OPEN, OPEN)
    elif t >= tceu - 0.2: pose = (UP, UP)
    else: pose = (dance(t), dance(t + 0.27))
    kids(cv, t, pose[0], pose[1] if isinstance(pose[1], tuple) else pose[0])
    D.animal(cv, "sheep", W * 0.86, H * 0.97 - hop(t, 28 * S), 210 * S, t)

def sc_terra(cv, t, t0, t1):
    D.scenery(cv, W, H, "sea", t)
    k = ease((t - t0 - 0.8) / 2.0)
    p = skia.Path(); p.moveTo(W * 0.2, H); p.cubicTo(W * 0.3, H * (1.05 - 0.45 * k), W * 0.7, H * (1.05 - 0.45 * k), W * 0.8, H); p.close()
    D.shape(cv, p, C(130, 210, 90), 4 * S)
    kids(cv, t, OPEN, OPEN, y=0.97 + 0.4 * (1 - k), size=500)
    badge(cv, t, t0 + 0.25, 3, "Dia 3: terra e plantas")

def sc_brotou(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    l = L("Brotou")
    tk = {A.norm(x["d"]): x["s"] for x in l["toks"]}
    for i, x in enumerate((0.12, 0.22, 0.78, 0.88)):
        g = pop(t, tk.get("capim", t0) + i * 0.1)
        cv.save(); cv.translate(W * x, H * 0.92); cv.scale(g, g)
        for j in range(5): cv.drawLine(j * 8 * S - 16 * S, 0, j * 10 * S - 20 * S, -50 * S, D.stroke(C(70, 180, 70), 8 * S))
        cv.restore()
    g = ease((t - tk.get("arvore", t0 + 2)) / 1.0)
    if g > 0: D.tree(cv, W * 0.5, H * 0.9, 380 * S * g)
    if t >= tk.get("semente", t0 + 1):
        for i in range(5): D.oval(cv, W * (0.3 + 0.1 * i), H * 0.93, 10 * S, 14 * S, C(150, 95, 50), 2 * S)
    kids(cv, t, OPEN if g <= 0 else UP, OPEN if g <= 0 else UP, xl=0.25, xt=0.75, size=500)

def sc_sol_nasce(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    k = ease((t - t0) / 2.2)
    D.sun(cv, W * 0.5, H * (0.8 - 0.55 * k), 110 * S, t)
    D.scenery_fg = None
    kids(cv, t, POINT, (20, 165), xl=0.25, xt=0.75)
    badge(cv, t, t0 + 0.25, 4, "Dia 4: sol, lua e estrelas")

def sc_lua(cv, t, t0, t1):
    D.scenery(cv, W, H, "night", t)
    D.moon(cv, W * 0.75, H * 0.22, 90 * S * pop(t, t0 + 0.3))
    r = random.Random(9)
    for i in range(10):
        st = t0 + 1.0 + i * 0.2
        if t >= st: D.star(cv, W * r.uniform(0.05, 0.6), H * r.uniform(0.08, 0.45), 30 * S * pop(t, st), C(255, 225, 80), 3 * S)
    kids(cv, t, WAVE, WAVE)

NAMES = ["Bia", "Léo", "Ana", "Davi", "Lia", "Teo", "Rute", "Noé"]
def sc_estrelas(cv, t, t0, t1, you=False):
    D.scenery(cv, W, H, "night", t)
    D.moon(cv, W * 0.88, H * 0.15, 60 * S)
    r = random.Random(11)
    l2 = L("Conta todas")["s"]
    for i, nm in enumerate(NAMES):
        x, y = W * (0.08 + 0.11 * i), H * (0.18 + 0.16 * (i % 2))
        st = t0 + 0.4 + i * 0.25
        if t >= st:
            D.star(cv, x, y, 42 * S * pop(t, st) * (1 + 0.08 * math.sin(t * 4 + i)), C(255, 225, 80), 3 * S)
            D.cute_face(cv, x, y + 4 * S, 18 * S * pop(t, st))
            D.tag(cv, x, y + 85 * S, str(i + 1) if t >= l2 + i * 0.2 else nm, 30 * S * pop(t, st))
    kids(cv, t, POINT, (20, 165))

def sc_mar(cv, t, t0, t1):
    D.scenery(cv, W, H, "under", t)
    tw = find("baleia", "Verse 3") or t0
    k = ease((t - tw) / 2.5)
    D.animal(cv, "whale", W * (1.15 - 0.6 * k), H * (0.55 + 0.03 * math.sin(t * 2)), 380 * S, t)
    for i in range(5):
        D.animal(cv, "fish", W * ((1.2 - (t - t0) * 0.15 - i * 0.12) % 1.3 - 0.1), H * (0.25 + i * 0.12 + 0.02 * math.sin(t * 5 + i)), 110 * S, t)
    badge(cv, t, t0 + 0.25, 5, "Dia 5: peixes e aves")

def sc_passaro(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    x = -0.1 + (t - t0) * 0.28
    D.animal(cv, "bird", W * x, H * (0.3 + 0.06 * math.sin(t * 5)), 170 * S, t)
    for i in range(3):
        tt = t - i * 0.4
        D.note(cv, W * (x - 0.05 - i * 0.06), H * (0.22 - 0.03 * i) + math.sin(tt * 4) * 10 * S, 34 * S, [C(255, 90, 160), C(80, 160, 255), C(255, 180, 40)][i])
    kids(cv, t, POINT, (20, 165), lookL=1, lookT=1)
    badge(cv, t, t0 - 3, 5, "Dia 5: peixes e aves") if t0 - 3 > 0 else None

def sc_bichos(cv, t, t0, t1):
    D.scenery(cv, W, H, "savanna", t)
    D.sun(cv, W * 0.85, H * 0.18, 70 * S, t)
    order = [("leao", "lion", 0.11, 0.8, 340), ("girafa", "giraffe", 0.3, 0.82, 420), ("capivara", "capybara", 0.52, 0.82, 300),
             ("macaquinho", "monkey", 0.72, 0.82, 320), ("ovelhinha", "sheep", 0.9, 0.82, 300), ("tatu", "armadillo", 0.3, 0.98, 250),
             ("arara", "macaw", 0.55, 0.45, 300)]
    named = None
    for i, (wname, kind, x, y, h) in enumerate(order):
        ta = find(wname, "Verse 3")
        if ta and t >= ta - 0.1:
            sc = pop(t, ta - 0.1, 0.45)
            D.animal(cv, kind, W * x, H * y - hop(t, 18 * S, i * 0.3), h * S * sc, t)
            if t < ta + 1.1: named = (kind, x, y, h)
            if ta - 0.1 <= t <= ta + 0.9:
                D.tag(cv, W * x, H * y - h * S * 1.15, {"leao": "Leão", "girafa": "Girafa", "capivara": "Capivara", "macaquinho": "Macaco",
                      "ovelhinha": "Ovelha", "tatu": "Tatu", "arara": "Arara"}[wname], 40 * S)
    pass
    badge(cv, t, t0 + 0.25, 6, "Dia 6: animais e gente")

def sc_po(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    k = ease((t - t0 - 0.6) / 2.4)
    r = random.Random(4)
    for i in range(80):
        a = r.uniform(0, 6.28); rr = r.uniform(0, 260) * S * (1 - k) + 30 * S
        x = W / 2 + math.cos(a + t) * rr * 1.6; y = H * 0.6 + math.sin(a + t) * rr
        D.sparkle(cv, x, y, r.uniform(4, 10) * S, C(255, 225, 150))
    if k > 0:
        cv.save(); cv.saveLayerAlpha(None, int(255 * k))
        kids(cv, t, OPEN, OPEN, dance=0.3)
        cv.restore(); cv.restore()

def sc_coracao(cv, t, t0, t1):
    D.scenery(cv, W, H, "meadow", t)
    tc = find("coracao", "Verse 3") or t0 + 2
    for i in range(6):
        a = t * 3 + i
        p = skia.Path(); p.moveTo(W * 0.1, H * (0.3 + i * 0.05)); p.quadTo(W * (0.3 + 0.05 * math.sin(a)), H * (0.2 + i * 0.05), W * 0.5, H * (0.35 + i * 0.04))
        cv.drawPath(p, D.stroke(C(255, 255, 255, 150), 6 * S))
    if t >= tc - 0.1:
        b = 1 + 0.15 * abs(math.sin((t - tc) * 7))
        D.heart(cv, W * 0.5, H * 0.3, 110 * S * b * pop(t, tc - 0.1))
    kids(cv, t, SELF if t >= tc else OPEN, (-20, 45) if t >= tc else OPEN)

def sc_muito_bom(cv, t, t0, t1):
    D.scenery(cv, W, H, "rainbow", t)
    D.rainbow(cv, W / 2, H * 0.78, W * 0.42, 1.0)
    D.sun(cv, W * 0.86, H * 0.18, 70 * S, t)
    for i, kind in enumerate(("lion", "giraffe", "capybara", "monkey")):
        D.animal(cv, kind, W * [0.08, 0.92, 0.2, 0.8][i], H * 0.88 - hop(t, 15 * S, i * 0.3), [180, 230, 150, 160][i] * S, t)
    sparkles(cv, t, 20, 7)
    tb = find("muito", "Pre-Chorus 3")
    kids(cv, t, clap(t) if (tb is None or t < tb) else UP, clap(t) if (tb is None or t < tb) else UP)
    if tb: big_text(cv, t, tb, "Muito bom!", 0.2, 150, dur=3.5)

def sc_descanso(cv, t, t0, t1):
    D.scenery(cv, W, H, "night", t)
    D.moon(cv, W * 0.8, H * 0.2, 85 * S)
    sparkles(cv, t, 22, 8)
    kids(cv, t, PRAY, PRAY, dance=0.25)
    D.animal(cv, "sheep", W * 0.15, H * 0.96, 190 * S, t)
    for i in range(3):
        y = H * 0.65 - ((t * 0.15 + i * 0.33) % 1) * 120 * S
        D.text(cv, "z", W * 0.2 + i * 20 * S, y, (30 + 10 * i) * S, C(255, 255, 255), C(90, 80, 160))
    badge(cv, t, t0 + 0.25, 7, "Dia 7: Deus descansou")
    ta = find("abencoou", "Bridge")
    if ta and t >= ta: sparkles(cv, t, 30, 12, (0, 0.4, 1, 0.95), C(255, 240, 180))

def sc_paz(cv, t, t0, t1):
    D.scenery(cv, W, H, "night", t)
    D.moon(cv, W * 0.82, H * 0.18, 85 * S)
    D.star(cv, W * 0.5, H * 0.25, 55 * S * (1 + 0.1 * math.sin(t * 3)), C(255, 230, 100), 4 * S)
    g = skia.Paint(Shader=skia.GradientShader.MakeRadial(skia.Point(W * 0.5, H * 0.25), 300 * S, [C(255, 240, 160, 110), C(255, 240, 160, 0)]))
    cv.drawCircle(W * 0.5, H * 0.25, 300 * S, g)
    D.cloud(cv, W * 0.5, H * 0.78, 1300 * S)
    D.oval(cv, W * 0.5, H * 0.6, 230 * S, 70 * S, C(255, 255, 255), 4 * S)  # travesseiro
    sz = 420 * S
    for who, fx, rot in (("lulu", 0.28, 90), ("theo", 0.72, -90)):
        cv.save(); cv.translate(W * fx, H * 0.6 + 0.66 * sz * 0 ); cv.rotate(rot)
        D.kid(cv, who, 0, 0, sz, armL=-20, armR=-20, blink=True, mouth=mouth(t, who) * 0.4, tilt=2 * math.sin(t))
        cv.restore()
    for x0, x1 in ((0.2, 0.41), (0.59, 0.8)):
        D.rrect(cv, W * x0, H * 0.53, W * x1, H * 0.7, 40 * S, C(170, 140, 255), 4 * S)
        for i in range(4): D.star(cv, W * (x0 + 0.03 + i * 0.05), H * 0.62, 14 * S, C(255, 230, 120))
    for i in range(3):
        y = H * 0.45 - ((t * 0.2 + i * 0.33) % 1) * 150 * S
        D.text(cv, "z", W * 0.5 + i * 25 * S, y, (34 + 10 * i) * S, C(255, 255, 255), C(90, 80, 160))

def sc_mao(cv, t, t0, t1):
    D.scenery(cv, W, H, "night", t)
    D.moon(cv, W * 0.82, H * 0.2, 85 * S)
    sparkles(cv, t, 20, 13)
    kids(cv, t, (62, 15), (15, 62), xl=0.39, xt=0.61, dance=0.3)
    tm = find("mao", "Bridge") or t0 + 1.5
    if t >= tm - 0.5: D.heart(cv, W * 0.5, H * 0.3, 80 * S * pop(t, tm - 0.5) * (1 + 0.08 * math.sin(t * 6)))

def sc_final(cv, t, t0, t1):
    D.scenery(cv, W, H, "night", t)
    sc_estrelas_bg = random.Random(11)
    for i, nm in enumerate(NAMES[:6]):
        x, y = W * (0.1 + 0.16 * i), H * (0.15 + 0.1 * (i % 2))
        D.star(cv, x, y, 34 * S, C(255, 225, 80), 3 * S); D.tag(cv, x, y + 65 * S, nm, 26 * S)
    ts = find("seu", "Outro")
    if ts and t >= ts - 0.2:
        D.star(cv, W * 0.5, H * 0.42, 90 * S * pop(t, ts - 0.2), C(255, 200, 60), 5 * S)
        D.cute_face(cv, W * 0.5, H * 0.43, 40 * S * pop(t, ts - 0.2))
        D.tag(cv, W * 0.5, H * 0.6, "VOCÊ", 60 * S * pop(t, ts - 0.2))
    kids(cv, t, WAVE, WAVE, size=460)
    tq = find("voce", "Outro")
    if tq and t >= tq + 1.0: big_text(cv, t, tq + 1.0, "Deus fez você!", 0.12, 120, dur=10)

SC = {"intro": sc_intro, "escuro": sc_escuro, "luz": sc_luz, "dia_noite": sc_dia_noite, "ceu": sc_ceu, "bom": sc_bom, "refrao": sc_refrao,
      "terra": sc_terra, "brotou": sc_brotou, "sol_nasce": sc_sol_nasce, "lua": sc_lua, "estrelas": sc_estrelas, "mar": sc_mar,
      "passaro": sc_passaro, "bichos": sc_bichos, "po": sc_po, "coracao": sc_coracao, "muito_bom": sc_muito_bom,
      "descanso": sc_descanso, "paz": sc_paz, "mao": sc_mao, "festa": lambda cv, t, t0, t1: sc_refrao(cv, t, t0, t1, festa=True), "final": sc_final}

def scene_at(t):
    i = max(k for k, (s0, _) in enumerate(SCENES) if s0 <= t or k == 0)
    t0 = SCENES[i][0]; t1 = SCENES[i + 1][0] if i + 1 < len(SCENES) else TOTAL
    return i, t0, t1

# ------------------------------------------------------------------ legenda karaoke
FONT_SUB = skia.Font(D.TF, 56 * S); FONT_SUB.setEmbolden(True)
def subtitles(cv, t):
    cur = [l for l in lines if l["s"] - 0.25 <= t <= l["e"] + 0.4]
    if not cur: return
    l = cur[-1]; sp = FONT_SUB.measureText(" ")
    items = [(tk["d"], tk, FONT_SUB.measureText(tk["d"])) for tk in l["toks"]]
    rows = [[]]; acc = 0
    for it in items:
        if acc + it[2] > W * 0.86 and rows[-1]: rows.append([]); acc = 0
        rows[-1].append(it); acc += it[2] + sp
    lh = 66 * S; bh = lh * len(rows) + 22 * S; top = H - bh - 26 * S
    rw = max(sum(i[2] for i in r) + sp * (len(r) - 1) for r in rows)
    D.rrect(cv, W / 2 - rw / 2 - 28 * S, top, W / 2 + rw / 2 + 28 * S, top + bh, 30 * S, C(255, 255, 255, 225), 4 * S)
    y = top + lh * 0.82
    for r in rows:
        x = W / 2 - (sum(i[2] for i in r) + sp * (len(r) - 1)) / 2
        for txt, tk, w in r:
            sung = t >= tk["s"]
            col = C(240, 60, 130) if sung and not tk["choir"] else (C(30, 140, 230) if sung else C(110, 80, 140))
            cv.drawTextBlob(skia.TextBlob(txt, FONT_SUB), x, y, D.fill(col)); x += w + sp
        y += lh

# ------------------------------------------------------------------ quadro
def frame(t):
    surf = skia.Surface(W, H); cv = surf.getCanvas()
    i, t0, t1 = scene_at(t)
    SC[SCENES[i][1]](cv, t, t0, t1)
    if i > 0 and t - t0 < 0.35:  # transicao: cena anterior se dissolvendo
        a = 1 - (t - t0) / 0.35
        cv.saveLayerAlpha(None, int(255 * a))
        _, p0, _ = scene_at(t0 - 0.01)
        SC[SCENES[i - 1][1]](cv, t, p0, t0)
        cv.restore()
    D.vignette(cv, W, H)
    subtitles(cv, t)
    return surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)[:, :, :3]

if __name__ == "__main__":
    out_dir = os.path.join(ROOT, "exports"); os.makedirs(out_dir, exist_ok=True)
    if FRAMES:
        from PIL import Image
        for tt in FRAMES:
            Image.fromarray(frame(tt)).save(os.path.join("/tmp/claude-0", "f_%06.2f.jpg" % tt), quality=85)
        print("frames ok"); sys.exit()
    end = TOTAL if DUR is None else min(TOTAL, START + DUR)
    name = "quem-fez-foi-deus-2D" + ("_previa" if (PREVIEW or DUR) else "") + ".mp4"
    out = os.path.join(out_dir, name)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H), "-r", str(FPS), "-i", "-",
           "-ss", str(START), "-t", str(end - START), "-i", A.audio, "-map", "0:v", "-map", "1:a",
           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = int((end - START) * FPS); t_0 = time.time()
    for k in range(n):
        p.stdin.write(np.ascontiguousarray(frame(START + k / FPS)).tobytes())
        if k % (FPS * 10) == 0: print("%d/%d  %.1f fps" % (k, n, (k + 1) / (time.time() - t_0)), flush=True)
    p.stdin.close(); p.wait(); print("OK", out)
