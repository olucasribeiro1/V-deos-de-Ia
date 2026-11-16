"""Ep. 4 — monta story/shots.json a partir das falas: planos longos, dissolve <= 0,6 s entre cenários, números na tela, HUD e efeitos."""
import json, os, re, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(P, "..", "..", "tools"))
from numeros import achar_numeros
LN = json.load(open(f"{P}/timeline/lines.json")); W = json.load(open(f"{P}/timeline/words.json"))["words"]
L = {l["id"]: (l["start"], l["end"]) for l in LN["lines"]}; DUR = LN["duration"]
nw = lambda s: re.sub(r"[^\w]+", "", s.lower())
def word(line, w, nth=1):
    a, b = L[line]; hits = [x["start"] for x in W if a - 0.01 <= x["start"] <= b and nw(x["word"]).startswith(nw(w))]
    return hits[nth - 1]
def at(spec):
    if isinstance(spec, (int, float)): return spec
    if spec[0] == "end": return L[spec[1]][1] + spec[2]
    if len(spec) == 2: return L[spec[0]][0] + spec[1]
    return word(spec[0], spec[1], spec[3] if len(spec) > 3 else 1) + spec[2]
FX = lambda n: f"../../series/mamae/sfx/{n}.mp3"
amb = lambda n, g=-30: {"name": n, "gain": g}
DIS = {"type": "fade", "dur": 0.5}; ZOOM = {"type": "zoom", "dur": 0.35}
S = [
 ("A", 0, None, amb("hum", -30), [(("n2", "proteína", 0), "pop", -10)]),
 ("B", ("r1", -0.3), DIS, amb("hum"), [(("r1", 0.2), "tosse", -12)]),
 ("C", ("n3", -0.2), DIS, amb("hum"), [(("n3", 0.3), "tensao", -12), (("e1", -0.2), "heartbeat", -10)]),
 ("D", ("n4", -0.2), {"type": "cut"}, amb("hum"), [(("m1", "monóxido", 0), "alarme", -8), (("m1", "monóxido", 0), "soco_zoom", -8)]),
 ("E", ("n5", -0.2), DIS, None, [(("n5", "toma", 0), "whoosh", -12)]),
 ("F", ("o2", -0.25), DIS, amb("hum"), [(("n6", 0.3), "hit", -10), (("r2", 0.2), "pop", -12)]),
 ("G", ("o3", -0.2), {"type": "cut"}, amb("hum"), [(("o3", "desliga", 0.4), "hit", -6), (("n7", "manivela", 0), "colher", -14)]),
 ("H", ("n8", -0.2), DIS, None, [(("n8", "gerador", 0), "pop", -12), (("n8", "janela", 0), "pop", -12), (("n8", "detector", 0), "ding", -12)]),
 ("I", ("e2", -0.4), DIS, amb("hum", -32), [(("e2", "cérebro", 0), "tensao", -10)]),
 ("J", ("o4", -0.3), DIS, amb("wind", -26), [(("n9", "periscópio", 0), "soco_zoom", -12), (("n10", 0), "arranhao", -6), (("n10", "marcas", 0), "soco_zoom", -4)]),
 ("Kt", ("end", "n10", 0.5), {"type": "fade", "dur": 0.5}, None, [(0.05, "stinger", -8)]),
 ("Lc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
starts = [round(at(s[1]), 3) for s in S]; shots = []
for i, (id, _, tr, am, fx) in enumerate(S):
    st, en = starts[i], (starts[i + 1] if i + 1 < len(S) else DUR); assert en > st + 0.4, (id, st, en)
    sh = {"id": id, "start": st, "end": en, "in": tr or {"type": "cut"}, "params": {"L": {k: list(v) for k, v in L.items()}}, "sfx": []}
    for a, name, gain in fx:
        tt = (a if isinstance(a, (int, float)) else at(a) - st) if not isinstance(a, (int, float)) else a
        sh["sfx"].append({"at": round(max(0, tt), 3), "name": name if name in ("hit", "pop", "ding", "stinger", "glitch", "heartbeat", "whoosh", "riser", "impact") else FX(name), "gain": gain})
    if am: sh["amb"] = am
    shots.append(sh)
T = {s["id"]: s["start"] for s in shots}
for s in shots:
    if s["id"] in ("Kt", "Lc"): s["nums"] = False; s["captions"] = False; s["hud"] = False
    if s["id"] in ("E", "H"): s["hud"] = False
# números falados -> tela (menos onde o próprio plano já mostra) + estalo em cada um
nums = [n for n in achar_numeros(W) if not any(s["start"] <= n["t"] < s["end"] and s.get("nums") is False for s in shots)]
for n in nums: n["sfx"] = True
glob_sfx = [{"t": round(n["t"], 3), "name": "pop", "gain": -13} for n in nums]
hud = [{"t": 0, "text": "DIA 5 · 14:20", "rad": 0.05}, {"t": T["G"], "text": "DIA 5 · 14:41", "rad": 0.05}, {"t": T["I"], "text": "DIA 5 · 16:05", "rad": 0.05}]
music = [{"start": 0, "end": T["B"], "mood": "playful", "intensity": 0.4}, {"start": T["B"], "end": T["G"], "mood": "tension", "intensity": 0.7},
         {"start": T["G"], "end": T["I"], "mood": "hopeful", "intensity": 0.45}, {"start": T["I"], "end": T["Kt"], "mood": "dark", "intensity": 0.6}, {"start": T["Kt"], "end": DUR, "mood": "dark", "intensity": 0.4}]
json.dump({"title": "O Ar Pesado", "duration": DUR, "shots": shots, "numbers": nums, "hud": hud, "music": music, "sfx": glob_sfx}, open(f"{P}/story/shots.json", "w"), ensure_ascii=False, indent=1)
for s in shots: print(f"{s['id']:3s} {s['start']:6.2f}-{s['end']:6.2f} ({s['end']-s['start']:4.1f}s) {s['in']['type']}")
print(len(nums), "números na tela")
