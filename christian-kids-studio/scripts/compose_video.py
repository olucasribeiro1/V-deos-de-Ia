"""Monta o videoclipe a partir da musica, dos tempos por palavra e dos assets 3D renderizados.
Uso: /opt/kidsvenv/bin/python compose_video.py <pasta_da_musica> [--preview] [--start S --dur D]
"""
import json, os, sys, math, re, subprocess, unicodedata, difflib, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "assets", "renders")
FONT = os.path.join(ROOT, "assets", "fonts", "Baloo2.ttf")
args = sys.argv[1:]
MUS = args[0]
PREVIEW = "--preview" in args
START = float(args[args.index("--start") + 1]) if "--start" in args else 0.0
DUR = float(args[args.index("--dur") + 1]) if "--dur" in args else None
W, H = (960, 540) if PREVIEW else (1920, 1080)
FPS = 15 if PREVIEW else 30
SC = W / 1920

# ------------------------------------------------------------------ letra x tempos
plan = json.load(open(os.path.join(MUS, "composition_plan.json")))["composition_plan"]["sections"]
words = json.load(open(os.path.join(MUS, "words.json")))
audio = [f for f in ("quem-fez-foi-deus.mp3", "raw.mp3") if os.path.exists(os.path.join(MUS, f))][0]
audio = os.path.join(MUS, audio)

def norm(w):
    w = unicodedata.normalize("NFD", w.lower()); w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

lines = []  # cada linha: {sec, text, tokens:[{t, display, choir}]}
for si, sec in enumerate(plan):
    for ln in sec["lines"]:
        disp = ln.replace("Aja luz", "Haja luz").replace("E EU!", "E eu!")
        toks = []
        choir = False
        for raw in disp.split():
            if raw.startswith("("): choir = True
            toks.append({"d": raw.replace("(", "").replace(")", ""), "choir": choir, "raw": raw})
            if raw.endswith(")"): choir = False
        lines.append({"sec": sec["section_name"], "text": disp, "toks": toks})

lt = [norm(t["d"]) for l in lines for t in l["toks"]]
wt = [norm(w["w"]) for w in words]
sm = difflib.SequenceMatcher(None, lt, wt, autojunk=False)
times = [None] * len(lt)
for a, b, n in sm.get_matching_blocks():
    for k in range(n):
        times[a + k] = (words[b + k]["s"], words[b + k]["e"])
# interpolar faltantes
known = [i for i, x in enumerate(times) if x]
for i in range(len(times)):
    if times[i] is None:
        prev = max([k for k in known if k < i], default=None); nxt = min([k for k in known if k > i], default=None)
        if prev is None: times[i] = (times[nxt][0] - 0.4, times[nxt][0] - 0.1)
        elif nxt is None: times[i] = (times[prev][1] + 0.1, times[prev][1] + 0.4)
        else:
            s0 = times[prev][1]; s1 = times[nxt][0]; f = (i - prev) / (nxt - prev)
            st = s0 + (s1 - s0) * f; times[i] = (st, st + max(0.15, (s1 - s0) / (nxt - prev) * 0.8))
k = 0
for l in lines:
    for t in l["toks"]:
        t["s"], t["e"] = times[k]; k += 1
    l["s"] = l["toks"][0]["s"]; l["e"] = l["toks"][-1]["e"]
# secoes
sections = []
for l in lines:
    if not sections or sections[-1]["name"] != l["sec"]:
        sections.append({"name": l["sec"], "s": l["s"], "lines": []})
    sections[-1]["lines"].append(l)
for i, s in enumerate(sections):
    s["start"] = 0.0 if i == 0 else (sections[i - 1]["lines"][-1]["e"] + s["s"]) / 2
for i, s in enumerate(sections):
    s["end"] = sections[i + 1]["start"] if i + 1 < len(sections) else 9999

def find(word, sec=None, nth=0):
    """tempo de inicio da n-esima ocorrencia da palavra (na secao)"""
    c = 0
    for l in lines:
        if sec and l["sec"] != sec: continue
        for t in l["toks"]:
            if norm(t["d"]) == norm(word):
                if c == nth: return t["s"]
                c += 1
    return None

# ------------------------------------------------------------------ batida
import librosa
y, sr = librosa.load(audio, sr=22050)
TOTAL = len(y) / sr
_, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
beats = np.array(beats)
def beat_phase(t):
    i = np.searchsorted(beats, t) - 1
    if i < 0 or i + 1 >= len(beats): return (t * 112.3 / 60) % 1
    return (t - beats[i]) / (beats[i + 1] - beats[i])
env = librosa.feature.rms(y=y, hop_length=512)[0]; env = env / env.max()
def loud(t): return float(env[min(len(env) - 1, int(t * sr / 512))])

# ------------------------------------------------------------------ assets
_cache = {}
def img(name, h):
    h = max(4, int(h)); key = (name, h)
    if key not in _cache:
        im = Image.open(os.path.join(A, name + ".png")).convert("RGBA")
        bb = im.getbbox(); im = im.crop(bb)
        _cache[key] = im.resize((max(1, int(im.width * h / im.height)), h), Image.LANCZOS)
    return _cache[key]
_bg = {}
def bgimg(name):
    if name not in _bg:
        _bg[name] = Image.open(os.path.join(A, name + ".png")).convert("RGB")
    return _bg[name]

FONT_B = {}
def font(sz):
    sz = int(sz)
    if sz not in FONT_B:
        f = ImageFont.truetype(FONT, sz)
        try: f.set_variation_by_axes([800])
        except Exception: pass
        FONT_B[sz] = f
    return FONT_B[sz]

def ease(x): x = max(0, min(1, x)); return x * x * (3 - 2 * x)
def pop(t, t0, dur=0.35):
    """escala de 'pop' com overshoot"""
    if t < t0: return 0.0
    x = (t - t0) / dur
    if x >= 1: return 1.0
    return 1 + 0.25 * math.sin(x * math.pi) - (1 - x) ** 2

# ------------------------------------------------------------------ desenho
def shadow(frame, cx, by, w):
    sh = Image.new("RGBA", (int(w), int(w * 0.22)), (0, 0, 0, 0))
    d = ImageDraw.Draw(sh); d.ellipse((0, 0, sh.width - 1, sh.height - 1), fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(max(1, w * 0.04)))
    frame.alpha_composite(sh, (int(cx - sh.width / 2), int(by - sh.height / 2)))

def sprite(frame, name, cx, by, h, rot=0.0, sq=1.0, hop=0.0, shadow_on=True, alpha=1.0):
    if h < 4: return
    im = img(name, h * sq)
    if sq != 1.0:
        im = im.resize((max(1, int(im.width / math.sqrt(sq))), im.height))
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1:
        a = im.getchannel("A").point(lambda v: int(v * alpha)); im = im.copy(); im.putalpha(a)
    if shadow_on: shadow(frame, cx, by, im.width * 0.8 * (1 - min(0.5, hop / max(h, 1))))
    frame.alpha_composite(im, (int(cx - im.width / 2), int(by - im.height - hop)))

def mouth_open(t, who):
    """Lulu = cantora (voz principal); Theo = coro (palavras entre parenteses)"""
    for l in lines:
        if l["e"] + 0.2 < t or l["s"] - 0.2 > t: continue
        for tk in l["toks"]:
            if tk["s"] - 0.03 <= t <= tk["e"]:
                if (who == "lulu" and not tk["choir"]) or (who == "theo" and tk["choir"]):
                    ph = (t - tk["s"]) % 0.2
                    return ph < 0.13
    return False

def kid(frame, t, who, cx, by, h, pose="idle", dance=1.0):
    ph = beat_phase(t)
    hop = abs(math.sin(ph * math.pi)) * h * 0.06 * dance
    sq = 1.0 - 0.04 * dance * math.cos(ph * 2 * math.pi)
    bar = (t * 112.3 / 60 / 2) % 1
    rot = 4 * dance * math.sin(bar * 2 * math.pi) * (1 if who == "lulu" else -1)
    m = "open" if mouth_open(t, who) else "closed"
    sprite(frame, "%s_%s_%s" % (who, pose, m), cx, by, h, rot=rot, sq=sq, hop=hop)

def text_center(frame, txt, cy, size, fill=(255, 255, 255), stroke=(120, 40, 160), sw=8, scale=1.0):
    if scale <= 0.01: return
    f = font(size * scale * SC)
    d = ImageDraw.Draw(frame)
    w = d.textlength(txt, font=f)
    d.text((W / 2 - w / 2, cy - size * scale * SC * 0.6), txt, font=f, fill=fill, stroke_width=int(sw * scale * SC), stroke_fill=stroke)

def badge(frame, t, t0, n, label):
    if t < t0 or t > t0 + 3.2: return
    s = pop(t, t0, 0.4)
    if t > t0 + 2.8: s *= max(0, 1 - (t - t0 - 2.8) / 0.4)
    r = int(110 * s * SC)
    if r < 4: return
    cx, cy = int(W * 0.84), int(H * 0.2)
    lay = Image.new("RGBA", (r * 2 + 20, r * 2 + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.ellipse((10, 10, 10 + 2 * r, 10 + 2 * r), fill=(255, 205, 40, 255), outline=(255, 255, 255, 255), width=max(2, int(10 * SC * s)))
    f = font(150 * s * SC); tw = d.textlength(str(n), font=f)
    d.text((10 + r - tw / 2, 10 + r - 150 * s * SC * 0.62), str(n), font=f, fill=(230, 60, 120), stroke_width=int(6 * SC), stroke_fill=(255, 255, 255))
    frame.alpha_composite(lay, (cx - r - 10, cy - r - 10))
    text_center_at(frame, label, cx, cy + r + int(28 * SC), 46 * s)

def text_center_at(frame, txt, cx, cy, size, fill=(255, 255, 255), stroke=(230, 60, 120)):
    if size < 4: return
    f = font(size * SC); d = ImageDraw.Draw(frame); w = d.textlength(txt, font=f)
    d.text((cx - w / 2, cy - size * SC * 0.6), txt, font=f, fill=fill, stroke_width=int(6 * SC), stroke_fill=stroke)

def subtitles(frame, t):
    cur = [l for l in lines if l["s"] - 0.25 <= t <= l["e"] + 0.35]
    if not cur: return
    l = cur[-1]
    f = font(58 * SC); d = ImageDraw.Draw(frame)
    parts = [(tk["d"], tk) for tk in l["toks"]]
    space = d.textlength(" ", font=f)
    widths = [d.textlength(p, font=f) for p, _ in parts]
    total = sum(widths) + space * (len(parts) - 1)
    maxw = W * 0.9
    rows = [[]]; acc = 0
    for (p, tk), w in zip(parts, widths):
        if acc + w > maxw and rows[-1]:
            rows.append([]); acc = 0
        rows[-1].append((p, tk, w)); acc += w + space
    lh = 70 * SC
    box_h = lh * len(rows) + 26 * SC
    top = H - box_h - 30 * SC
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    rw = max(sum(w for _, _, w in r) + space * (len(r) - 1) for r in rows)
    od.rounded_rectangle((W / 2 - rw / 2 - 30 * SC, top, W / 2 + rw / 2 + 30 * SC, top + box_h), radius=int(30 * SC), fill=(255, 255, 255, 215))
    frame.alpha_composite(ov)
    y0 = top + 10 * SC
    for r in rows:
        rwid = sum(w for _, _, w in r) + space * (len(r) - 1)
        x = W / 2 - rwid / 2
        for p, tk, w in r:
            sung = t >= tk["s"]
            col = (240, 70, 130) if sung and not tk["choir"] else ((30, 140, 230) if sung else (90, 60, 120))
            d.text((x, y0), p, font=f, fill=col)
            x += w + space
        y0 += lh

def sparkles(frame, t, n=14, seed=1, color=(255, 240, 120)):
    rnd = random.Random(seed); d = ImageDraw.Draw(frame)
    for i in range(n):
        x = rnd.uniform(0.05, 0.95) * W; yy = rnd.uniform(0.05, 0.6) * H
        s = (math.sin(t * 4 + i * 1.7) + 1) / 2 * 10 * SC + 2
        d.polygon([(x, yy - s * 2), (x + s * 0.5, yy - s * 0.5), (x + s * 2, yy), (x + s * 0.5, yy + s * 0.5), (x, yy + s * 2),
                   (x - s * 0.5, yy + s * 0.5), (x - s * 2, yy), (x - s * 0.5, yy - s * 0.5)], fill=color + (255,))

def confetti(frame, t, t0, seed=3):
    rnd = random.Random(seed); d = ImageDraw.Draw(frame)
    cols = [(255, 80, 120), (255, 200, 40), (80, 180, 255), (120, 220, 90), (190, 110, 255)]
    for i in range(60):
        x0 = rnd.uniform(0, W); sp = rnd.uniform(120, 260) * SC; ph = rnd.uniform(0, H)
        yy = (ph + (t - t0) * sp) % (H + 40) - 20
        x = x0 + math.sin(t * 2 + i) * 30 * SC
        d.rectangle((x, yy, x + 14 * SC, yy + 8 * SC), fill=cols[i % 5])

# ------------------------------------------------------------------ cenas
def background(frame, name, t, t0, zoom=(1.0, 1.08), pan=(0, 0), dark=0.0):
    b = bgimg(name)
    k = ease((t - t0) / 12.0)
    z = zoom[0] + (zoom[1] - zoom[0]) * k
    bw, bh = b.size
    cw, ch = bw / z * (W / bw) * (bw / W), bh / z * (H / bh) * (bh / H)
    cw = bw / z; ch = bh / z
    cx = bw / 2 + pan[0] * k * bw * 0.05; cy = bh / 2 + pan[1] * k * bh * 0.05
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    im = b.resize((W, H), Image.BILINEAR, box=box)
    if dark: im = Image.blend(im, Image.new("RGB", (W, H), (0, 0, 20)), dark)
    frame.paste(im)

def chorus_scene(frame, t, sec, bgname="bg_meadow", extra_all=False):
    background(frame, bgname, t, sec["start"])
    S = sec["name"]
    ts = find("sol", S); tm = find("mar", S); tf = find("flor", S); tp = find("passarinho", S)
    tee = find("eu", S); tfal = find("falou", S); tceu = find("ceu", S)
    if ts and t >= ts: sprite(frame, "prop_sun", W * 0.82, H * 0.42 - 15 * SC * math.sin(t * 2), 260 * SC * pop(t, ts), shadow_on=False)
    if tm and t >= tm:
        p = ease((t - tm) / 0.6); sprite(frame, "animal_whale", W * 0.14, H * 0.98 - 0 * p, 300 * SC * p, rot=4 * math.sin(t * 3), shadow_on=False)
    if tf and t >= tf: sprite(frame, "prop_flower", W * 0.3, H * 0.92, 240 * SC * pop(t, tf), rot=6 * math.sin(t * 4))
    if tp and t >= tp:
        x = (t - tp) / 3.0
        if x < 1.4: sprite(frame, "animal_bemtevi", W * (-0.1 + x), H * (0.25 + 0.05 * math.sin(t * 8)), 150 * SC, shadow_on=False)
    if tfal and t >= tfal:
        sprite(frame, "prop_rainbow", W * 0.5, H * 0.62, 420 * SC * ease((t - tfal) / 0.8), shadow_on=False, alpha=0.95)
    if extra_all:
        for i, a in enumerate(("animal_lion", "animal_giraffe", "animal_capybara", "animal_monkey", "animal_macaw")):
            x = [0.08, 0.92, 0.2, 0.8, 0.5][i]
            h = (320 if a == "animal_giraffe" else 190) * SC
            hop = abs(math.sin((beat_phase(t) + i * 0.25) * math.pi)) * 18 * SC
            sprite(frame, a, W * x, H * (0.78 if i < 2 else 0.72), h, hop=hop)
    pose_l = "cheer"; pose_t = "cheer"
    if tee and tee - 0.1 <= t <= tee + 1.3: pose_l = pose_t = "pointself"
    elif tp and tp <= t < (tee or tp + 1): pose_l, pose_t = "wave", "wave"
    elif ts and t < (tm or ts + 1.5) and t >= ts: pose_l, pose_t = "pointup", "pointup"
    elif tceu and t >= tceu - 0.6: pose_l, pose_t = "open", "open"
    else:
        alt = int((t * 112.3 / 60) / 2) % 2
        pose_l, pose_t = ("cheer", "clap") if alt else ("clap", "cheer")
    kid(frame, t, "theo", W * 0.62, H * 0.96, 470 * SC, pose_t)
    kid(frame, t, "lulu", W * 0.4, H * 0.97, 490 * SC, pose_l)
    sprite(frame, "sheep_%s_%s" % ("jump" if beat_phase(t) < 0.5 else "idle", "closed"), W * 0.86, H * 0.97, 200 * SC,
           hop=abs(math.sin(beat_phase(t) * math.pi)) * 25 * SC)

def scene(frame, t, sec):
    S = sec["name"]; t0 = sec["start"]
    if S == "Intro":
        background(frame, "bg_meadow", t, t0, zoom=(1.15, 1.0))
        sprite(frame, "prop_sun", W * 0.85, H * 0.32, 230 * SC, rot=8 * math.sin(t * 2), shadow_on=False)
        kid(frame, t, "lulu", W * 0.38, H * 0.97, 500 * SC, "wave" if t < 5 else "cheer")
        kid(frame, t, "theo", W * 0.62, H * 0.96, 480 * SC, "wave" if t < 5 else "cheer")
        sprite(frame, "sheep_idle_closed", W * 0.84, H * 0.97, 200 * SC, hop=abs(math.sin(beat_phase(t) * math.pi)) * 20 * SC)
        if t < 5.5:
            s = pop(t, 0.3, 0.5) * (1 if t < 5 else max(0, 1 - (t - 5) / 0.5))
            text_center(frame, "Quem Fez?", H * 0.2, 150, fill=(255, 220, 60), stroke=(230, 60, 120), sw=12, scale=s)
            text_center(frame, "Foi Deus!", H * 0.38, 150, fill=(255, 255, 255), stroke=(60, 120, 230), sw=12, scale=pop(t, 0.9, 0.5) * (1 if t < 5 else max(0, 1 - (t - 5) / 0.5)))
        return
    if S == "Verse 1":
        tl = find("luz", S); tdois = find("dois", S); tum = find("um", S)
        if tl is None or t < tl:
            background(frame, "bg_dark", t, t0, zoom=(1.0, 1.05))
            kid(frame, t, "lulu", W * 0.4, H * 0.97, 470 * SC, "idle", dance=0.4)
            kid(frame, t, "theo", W * 0.6, H * 0.96, 450 * SC, "idle", dance=0.4)
            ov = Image.new("RGBA", (W, H), (0, 0, 30, 150)); frame.alpha_composite(ov)
        else:
            sky = "bg_sky" if tdois and t >= tdois else "bg_meadow"
            background(frame, sky, t, tl)
            if t < tl + 0.6:
                fl = Image.new("RGBA", (W, H), (255, 255, 230, int(255 * (1 - (t - tl) / 0.6)))); frame.alpha_composite(fl)
            sparkles(frame, t, 10, 4)
            pose = "pointup" if (tdois and t >= tdois) else "cheer"
            kid(frame, t, "lulu", W * 0.38, H * 0.97, 490 * SC, pose)
            kid(frame, t, "theo", W * 0.62, H * 0.96, 470 * SC, "open")
        if tum: badge(frame, t, tum, 1, "Dia 1: a luz")
        if tdois: badge(frame, t, tdois, 2, "Dia 2: o céu")
        return
    if S.startswith("Pre-Chorus"):
        bg = {"Pre-Chorus 1": "bg_sky", "Pre-Chorus 2": "bg_night", "Pre-Chorus 3": "bg_rainbow"}[S]
        background(frame, bg, t, t0, zoom=(1.08, 1.0))
        sparkles(frame, t, 18, 7)
        tb = find("bom", S) or find("muito", S)
        pose = "clap" if not tb or t < tb else "cheer"
        kid(frame, t, "lulu", W * 0.4, H * 0.97, 490 * SC, pose)
        kid(frame, t, "theo", W * 0.6, H * 0.96, 470 * SC, pose)
        if S == "Pre-Chorus 3":
            sprite(frame, "sheep_jump_closed", W * 0.83, H * 0.97, 200 * SC, hop=abs(math.sin(beat_phase(t) * math.pi)) * 30 * SC)
        if tb and tb <= t <= tb + 2.5:
            txt = "Muito bom!" if S == "Pre-Chorus 3" else "É bom!"
            text_center(frame, txt, H * 0.22, 130, fill=(255, 230, 60), stroke=(230, 60, 120), sw=10, scale=pop(t, tb, 0.4))
        return
    if S.startswith("Chorus"):
        chorus_scene(frame, t, sec); return
    if S == "Final Chorus":
        chorus_scene(frame, t, sec, "bg_rainbow", extra_all=True); confetti(frame, t, t0); return
    if S == "Verse 2":
        tq = find("quatro", S); tt = find("tres", S); tb = find("brotou", S); tc = find("cada", S)
        if tq is None or t < tq:
            background(frame, "bg_landsea", t, t0)
            if tb:
                for i, x in enumerate((0.12, 0.88, 0.25, 0.75)):
                    g = ease((t - tb - i * 0.25) / 0.8)
                    if g > 0: sprite(frame, "prop_tree" if i < 2 else "prop_flower", W * x, H * 0.9, (330 if i < 2 else 200) * SC * g)
            kid(frame, t, "lulu", W * 0.4, H * 0.97, 480 * SC, "open")
            kid(frame, t, "theo", W * 0.6, H * 0.96, 460 * SC, "pointup" if tb and t > tb else "idle")
        else:
            night = tc is not None and t >= tc - 3
            background(frame, "bg_night" if t >= tq + 2.2 else "bg_sky", t, tq)
            if t < tq + 2.2:
                sprite(frame, "prop_sun", W * 0.5, H * 0.45, 300 * SC * pop(t, tq), shadow_on=False)
            else:
                sprite(frame, "prop_moon", W * 0.8, H * 0.35, 260 * SC * pop(t, tq + 2.2), shadow_on=False)
                rnd = random.Random(5)
                for i in range(9):
                    st = tq + 2.6 + i * 0.35
                    if t >= st:
                        sprite(frame, "prop_star", W * rnd.uniform(0.08, 0.7), H * rnd.uniform(0.08, 0.4),
                               (70 + 30 * math.sin(t * 3 + i)) * SC * pop(t, st), shadow_on=False)
            kid(frame, t, "lulu", W * 0.38, H * 0.97, 480 * SC, "pointup")
            kid(frame, t, "theo", W * 0.6, H * 0.96, 460 * SC, "wave" if night else "pointup")
        if tt: badge(frame, t, tt, 3, "Dia 3: terra e plantas")
        if tq: badge(frame, t, tq, 4, "Dia 4: sol, lua e estrelas")
        return
    if S == "Verse 3":
        t5 = find("cinco", S); t6 = find("seis", S); tbt = find("bem-te-vi", S) or find("bemtevi", S); tpo = find("po", S); tcor = find("coracao", S)
        if t6 is None or t < t6:
            background(frame, "bg_underwater", t, t0)
            tw = find("baleia", S) or t0
            if t >= tw:
                x = 0.15 + 0.4 * ease((t - tw) / 2.5)
                sprite(frame, "animal_whale", W * x, H * (0.62 + 0.03 * math.sin(t * 2)), 360 * SC, rot=3 * math.sin(t * 2), shadow_on=False)
            tpx = find("peixinho", S) or t0
            if t >= tpx:
                for i in range(3):
                    x = 1.1 - ((t - tpx) * 0.22 + i * 0.15)
                    sprite(frame, "animal_fish", W * x, H * (0.3 + i * 0.12), 110 * SC, rot=5 * math.sin(t * 6 + i), shadow_on=False)
            if tbt and t >= tbt:
                x = -0.1 + (t - tbt) / 2.5
                sprite(frame, "animal_bemtevi", W * x, H * 0.18, 150 * SC, rot=8 * math.sin(t * 10), shadow_on=False)
            kid(frame, t, "lulu", W * 0.7, H * 0.97, 430 * SC, "pointup" if tbt and t >= tbt else "open")
        else:
            background(frame, "bg_savanna" if (tpo is None or t < tpo) else "bg_meadow", t, t6)
            order = [("leao", "animal_lion", 0.1, 230), ("girafa", "animal_giraffe", 0.9, 380), ("capivara", "animal_capybara", 0.25, 190),
                     ("macaquinho", "animal_monkey", 0.75, 200), ("ovelhinha", "sheep_idle_closed", 0.4, 190), ("tatu", "animal_armadillo", 0.6, 160),
                     ("arara", "animal_macaw", 0.5, 200)]
            if tpo is None or t < tpo:
                for i, (wname, a, x, h) in enumerate(order):
                    ta = find(wname, S)
                    if ta and t >= ta:
                        yb = H * (0.8 if i < 4 else 0.97) if a != "animal_macaw" else H * 0.45
                        hop = abs(math.sin((beat_phase(t) + i * 0.3) * math.pi)) * 16 * SC
                        sprite(frame, a, W * x, yb, h * SC * pop(t, ta), hop=hop, shadow_on=a != "animal_macaw")
            else:
                sparkles(frame, t, 12, 9, (255, 180, 200))
                kid(frame, t, "lulu", W * 0.38, H * 0.97, 500 * SC * pop(t, tpo, 0.6), "open")
                kid(frame, t, "theo", W * 0.62, H * 0.96, 480 * SC * pop(t, tpo + 0.3, 0.6), "open")
                if tcor and t >= tcor:
                    beat = 1 + 0.12 * abs(math.sin(t * 7))
                    sprite(frame, "prop_heart", W * 0.5, H * 0.45, 220 * SC * beat * pop(t, tcor), shadow_on=False)
        if t5: badge(frame, t, t5, 5, "Dia 5: peixes e aves")
        if t6: badge(frame, t, t6, 6, "Dia 6: animais e gente")
        return
    if S == "Bridge":
        background(frame, "bg_night", t, t0, zoom=(1.0, 1.1))
        sprite(frame, "prop_moon", W * 0.82, H * 0.3, 240 * SC, rot=5 * math.sin(t), shadow_on=False)
        sparkles(frame, t, 20, 11)
        tpz = find("paz", S); tm = find("mao", S)
        pose = "pray" if (tpz is None or t < tpz) else ("clap" if tm and t >= tm - 1.5 else "pray")
        kid(frame, t, "lulu", W * 0.42, H * 0.97, 480 * SC, pose, dance=0.4)
        kid(frame, t, "theo", W * 0.58, H * 0.96, 460 * SC, pose, dance=0.4)
        sprite(frame, "sheep_idle_closed", W * 0.2, H * 0.97, 180 * SC)
        t7 = find("sete", S)
        if t7: badge(frame, t, t7, 7, "Dia 7: Deus descansou")
        return
    if S == "Outro":
        background(frame, "bg_night", t, t0, zoom=(1.0, 1.12))
        rnd = random.Random(8)
        for i in range(10):
            sprite(frame, "prop_star", W * rnd.uniform(0.05, 0.95), H * rnd.uniform(0.05, 0.45), (60 + 25 * math.sin(t * 3 + i)) * SC, shadow_on=False)
        kid(frame, t, "lulu", W * 0.38, H * 0.97, 490 * SC, "wave")
        kid(frame, t, "theo", W * 0.62, H * 0.96, 470 * SC, "wave")
        sprite(frame, "sheep_jump_closed", W * 0.84, H * 0.97, 190 * SC, hop=abs(math.sin(beat_phase(t) * math.pi)) * 25 * SC)
        tq = find("voce", S)
        if tq and t >= tq:
            text_center(frame, "Deus fez você!", H * 0.2, 120, fill=(255, 230, 60), stroke=(230, 60, 120), sw=10, scale=pop(t, tq, 0.5))
        return
    background(frame, "bg_meadow", t, t0)

def render_frame(t):
    frame = Image.new("RGBA", (W, H))
    sec = [s for s in sections if s["start"] <= t][-1]
    scene(frame, t, sec)
    # transicao suave entre secoes
    if t - sec["start"] < 0.3 and sections.index(sec) > 0:
        prev = sections[sections.index(sec) - 1]
        pf = Image.new("RGBA", (W, H)); scene(pf, t, prev)
        frame = Image.blend(pf, frame, (t - sec["start"]) / 0.3)
    subtitles(frame, t)
    return frame.convert("RGB")

if __name__ == "__main__":
    end = TOTAL if DUR is None else min(TOTAL, START + DUR)
    outdir = os.path.join(ROOT, "exports"); os.makedirs(outdir, exist_ok=True)
    out = os.path.join(outdir, "quem-fez-foi-deus%s.mp4" % ("_preview" if PREVIEW or DUR else ""))
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H), "-r", str(FPS), "-i", "-",
           "-ss", str(START), "-t", str(end - START), "-i", audio,
           "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "veryfast" if PREVIEW else "medium", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = int((end - START) * FPS)
    import time; t0 = time.time()
    for i in range(n):
        t = START + i / FPS
        p.stdin.write(render_frame(t).tobytes())
        if i % (FPS * 10) == 0:
            print("frame %d/%d  t=%.1fs  %.1f fps" % (i, n, t, (i + 1) / (time.time() - t0)), flush=True)
    p.stdin.close(); p.wait()
    print("OK", out)
