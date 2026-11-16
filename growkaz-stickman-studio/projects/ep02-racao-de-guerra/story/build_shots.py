"""Ep. 2 — monta story/shots.json a partir das falas: planos longos, dissolve <= 0,6 s entre cenários, números na tela, HUD e efeitos."""
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
S = [  # id, início, transição, ambiente, efeitos (at = segundos depois de um ponto: ("linha", desloc) ou número absoluto)
 ("A", 0, None, amb("hum", -32), [(0.3, "alcapao_fecha", -2), (("n1", "gerador", -0.4), "gerador_liga", -8)]),
 ("B", ("n2", -0.15), {"type": "cut"}, amb("hum"), [(("n2", -0.1), "soco_zoom", -12), (("n2", "filtro", -0.1), "soco_zoom", -14), (("n2", "comida", 0), "soco_zoom", -14)]),
 ("C", ("r1", -0.2), ZOOM, None, [(("r1", 0), "alarme", -14)]),
 ("D", ("r1", "o", -0.3, 2), DIS, amb("wind", -26), [(("r1", "ficou", 0), "cachorro_choro", -10), (("r2", -0.4), "latido", -12)]),
 ("E", ("r2", -0.25), DIS, amb("hum"), [(("o1", -0.6), "hit", -10)]),
 ("F", ("n3", -0.25), DIS, amb("wind", -24), [(("n3", "poeira", -0.5), "poeira", -10), (("n3", "radioativa", -0.1), "geiger", -6), (("n3", "radioativa", 0), "alarme", -10)]),
 ("G", ("o2", -0.3), DIS, amb("hum"), []),
 ("H", ("r3", -0.12), ZOOM, None, [(("r3", 0), "soco_zoom", -6)]),
 ("I", ("n4", -0.25), DIS, amb("hum"), [(("r4", -0.45), "lata_abre", -6), (("r4", -0.1), "colher", -12)]),
 ("J", ("n5", -0.25), DIS, amb("murmur", -30), [(("n5", 0.1), "hit", -10)]),
 ("Kc", ("n5", "quatro", -0.3), DIS, amb("hum"), [(("n5", "quatro", 0), "pop", -10)]),
 ("L", ("n6", -0.25), DIS, amb("hum"), [(("n6", "mãe", 0), "tensao", -14)]),
 ("M", ("n7", -0.15), ZOOM, None, []),
 ("N", ("n7", "a", -0.2), DIS, amb("roomtone"), []),
 ("O", ("n8", -0.25), DIS, amb("hum"), [(("n8", "liga", 0), "hit", -14), (("n8", "só", 0), "estatica", -12), (("rad", 0), "glitch", -10), (("n9", 0.2), "hit", -5)]),
 ("P", ("n10", -0.2), ZOOM, None, [(("n10", 0.3), "heartbeat", -9)]),
 ("Q", ("n11", -0.6), {"type": "fade", "dur": 0.6}, amb("hum", -34), [(("n11", "alguma", 0.6), "arranhao", -4), (("n11", "alguma", 2.4), "arranhao", -6)]),
 ("R", ("end", "n11", 0.6), {"type": "fade", "dur": 0.5}, None, [(0.05, "stinger", -8)]),
 ("S", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
starts = [round(at(s[1]), 3) for s in S]; shots = []
for i, (id, _, tr, am, fx) in enumerate(S):
    st, en = starts[i], (starts[i + 1] if i + 1 < len(S) else DUR); assert en > st + 0.4, (id, st, en)
    sh = {"id": id, "start": st, "end": en, "in": tr or {"type": "cut"}, "params": {"L": {k: list(v) for k, v in L.items()}}, "sfx": []}
    for a, name, gain in fx:
        tt = (a if isinstance(a, (int, float)) else at(a) - st) if not isinstance(a, (int, float)) else a
        sh["sfx"].append({"at": round(max(0, tt), 3), "name": name if name in ("hit", "pop", "ding", "stinger", "glitch", "heartbeat") else FX(name), "gain": gain})
    if am: sh["amb"] = am
    shots.append(sh)
T = {s["id"]: s["start"] for s in shots}
for s in shots:
    if s["id"] in ("G", "Kc", "R", "S"): s["nums"] = False
    if s["id"] in ("R", "S"): s["captions"] = False; s["hud"] = False
# números falados -> tela (menos onde o próprio plano já mostra) + estalo em cada um
nums = [n for n in achar_numeros(W) if not any(s["start"] <= n["t"] < s["end"] and s.get("nums") is False for s in shots)]
for n in nums: n["sfx"] = True
glob_sfx = [{"t": round(n["t"], 3), "name": "pop", "gain": -13} for n in nums]
hud = [{"t": 0, "text": "DIA 0 · 12:01", "rad": 0.0}, {"t": T["F"], "text": "DIA 0 · 12:11", "rad": 1.0}, {"t": T["I"], "text": "DIA 0 · 15:40", "rad": 0.75},
       {"t": T["O"], "text": "DIA 0 · 18:00", "rad": 0.35}, {"t": T["Q"], "text": "DIA 1 · 02:14", "rad": 0.2}]
music = [{"start": 0, "end": T["F"], "mood": "mystery", "intensity": 0.55}, {"start": T["F"], "end": T["I"], "mood": "tension", "intensity": 0.6},
         {"start": T["I"], "end": T["L"], "mood": "playful", "intensity": 0.4}, {"start": T["L"], "end": T["R"], "mood": "tension", "intensity": 0.65}, {"start": T["R"], "end": DUR, "mood": "dark", "intensity": 0.4}]
json.dump({"title": "Ração de Guerra", "duration": DUR, "shots": shots, "numbers": nums, "hud": hud, "music": music, "sfx": glob_sfx}, open(f"{P}/story/shots.json", "w"), ensure_ascii=False, indent=1)
for s in shots: print(f"{s['id']:3s} {s['start']:6.2f}-{s['end']:6.2f} ({s['end']-s['start']:4.1f}s) {s['in']['type']}")
print(len(nums), "números na tela")
