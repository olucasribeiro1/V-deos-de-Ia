"""Ep. 3 — monta story/shots.json a partir das falas: planos longos, dissolve <= 0,6 s entre cenários, números na tela, HUD e efeitos."""
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
 ("A", 0, None, amb("hum", -32), [(("n1", 0.4), "arranhao", -4), (("n1", "e", 0.2), "arranhao", -6)]),
 ("B", ("r1", -0.2), {"type": "cut"}, amb("hum", -32), [(("r2", 0.2), "passos_metal", -12), (("o1", -0.4), "hit", -12)]),
 ("C", ("n2", -0.15), DIS, amb("hum"), [(("n2", "suicídio", 0), "alarme", -12)]),
 ("D", ("n3", -0.15), DIS, amb("hum"), [(("n3", 0.5), "gerador_liga", -20), (("o2", -0.5), "soco_zoom", -14), (("o2", -0.4), "poeira", -14)]),
 ("E", ("n5", -0.3), DIS, amb("murmur", -28), []),
 ("E2", ("n6", "hoje", -0.3), DIS, amb("hum", -32), []),
 ("F", ("n7", -0.3), DIS, amb("hum"), [(("n7", "abre", 0), "lata_abre", -16), (("n8", -0.05), "soco_zoom", -12), (("n8", "tablet", 0), "alarme", -16)]),
 ("G", ("m1", -0.3), {"type": "cut"}, amb("hum"), [(("m1", -0.3), "tensao", -12)]),
 ("H", ("n10", "arranhão", -0.4), DIS, amb("hum", -32), [(("n10", "arranhão", 0), "arranhao", -3), (("n10", "arrastado", 0), "passos_metal", -6)]),
 ("I", ("n11", -0.2), DIS, amb("wind", -26), [(("n12", -0.1), "tensao", -6), (("n12", "dois", 0), "soco_zoom", -4)]),
 ("J", ("end", "n12", 0.5), {"type": "fade", "dur": 0.5}, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
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
    if s["id"] in ("C", "J", "Kc"): s["nums"] = False
    if s["id"] in ("J", "Kc"): s["captions"] = False
    if s["id"] in ("E", "J", "Kc"): s["hud"] = False
# números falados -> tela (menos onde o próprio plano já mostra) + estalo em cada um
nums = [n for n in achar_numeros(W) if not any(s["start"] <= n["t"] < s["end"] and s.get("nums") is False for s in shots)]
for n in nums: n["sfx"] = True
glob_sfx = [{"t": round(n["t"], 3), "name": "pop", "gain": -13} for n in nums]
hud = [{"t": 0, "text": "DIA 1 · 02:14", "rad": 0.22}, {"t": T["D"], "text": "DIA 1 · 02:31", "rad": 0.21}, {"t": T["F"], "text": "DIA 2 · 09:40", "rad": 0.1}, {"t": T["H"], "text": "DIA 2 · 10:02", "rad": 0.1}]
music = [{"start": 0, "end": T["E"], "mood": "tension", "intensity": 0.6}, {"start": T["E"], "end": T["F"], "mood": "sad", "intensity": 0.35},
         {"start": T["F"], "end": T["H"], "mood": "mystery", "intensity": 0.5}, {"start": T["H"], "end": T["J"], "mood": "dark", "intensity": 0.7}, {"start": T["J"], "end": DUR, "mood": "dark", "intensity": 0.4}]
json.dump({"title": "A Caixa da Mamãe", "duration": DUR, "shots": shots, "numbers": nums, "hud": hud, "music": music, "sfx": glob_sfx}, open(f"{P}/story/shots.json", "w"), ensure_ascii=False, indent=1)
for s in shots: print(f"{s['id']:3s} {s['start']:6.2f}-{s['end']:6.2f} ({s['end']-s['start']:4.1f}s) {s['in']['type']}")
print(len(nums), "números na tela")
