"""Montagem comum do story/shots.json dos episódios da série (Ep. 5+).
Uso no build_shots.py do episódio:
    from build import monta, amb, DIS, ZOOM, CUT
    monta(__file__, S, titulo="...", hud=[(id_ou_t, "DIA 8 · 10:00", rad)], musica=[(id_ou_t, "tension", 0.6)], sem_nums=[...], sem_hud=[...], sem_leg=[...])
S = [(id, início, transição, ambiente, [(quando, efeito, ganho)])]; início/quando = número, ("linha", desloc), ("linha", "palavra", desloc[, n]) ou ("end", "linha", desloc)."""
import json, os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from numeros import achar_numeros
amb = lambda n, g=-30: {"name": n, "gain": g}
DIS = {"type": "fade", "dur": 0.5}; ZOOM = {"type": "zoom", "dur": 0.35}; CUT = {"type": "cut"}
NATIVOS = ("hit", "pop", "ding", "stinger", "glitch", "heartbeat", "whistle", "whoosh", "riser", "impact", "freeze", "shimmer", "footstep", "kick", "carpass", "rain", "thunder", "wind", "flash", "buzz", "powerup", "counter", "tick", "clock", "slowmo", "swish", "blip", "cheer", "applause", "murmur", "phonebuzz", "phonering", "roomtone", "city", "hum", "crickets", "fluorescent", "conveniencia", "flicker", "cafeteira", "tv_static", "glass_knock", "door_creak", "distant_crash", "door_chime", "metal_drag", "truck_leave", "dread", "madrugada", "boots_tile", "register_beep", "switch_click", "glass_scratch", "drag_steps", "radio_static", "synth_pad", "vhs_rewind")

def monta(arquivo, S, titulo, hud=(), musica=(), sem_nums=(), sem_hud=(), sem_leg=()):
    P = os.path.dirname(os.path.dirname(os.path.abspath(arquivo)))
    LN = json.load(open(f"{P}/timeline/lines.json")); W = json.load(open(f"{P}/timeline/words.json"))["words"]
    L = {l["id"]: (l["start"], l["end"]) for l in LN["lines"]}; DUR = LN["duration"]
    nw = lambda s: re.sub(r"[^\w]+", "", s.lower())
    def word(line, w, nth=1):
        a, b = L[line]; hits = [x["start"] for x in W if a - 0.01 <= x["start"] <= b and nw(x["word"]).startswith(nw(w))]
        if len(hits) < nth: raise SystemExit(f"palavra '{w}' não achada na fala {line}")
        return hits[nth - 1]
    def at(spec):
        if isinstance(spec, (int, float)): return spec
        if spec[0] == "abs": return spec[1]
        if spec[0] == "end": return L[spec[1]][1] + spec[2]
        if len(spec) == 2: return L[spec[0]][0] + spec[1]
        return word(spec[0], spec[1], spec[3] if len(spec) > 3 else 1) + spec[2]
    starts = [round(at(s[1]), 3) for s in S]; shots = []
    for i, (id, _, tr, am, fx) in enumerate(S):
        st, en = starts[i], (starts[i + 1] if i + 1 < len(S) else DUR); assert en > st + 0.4, (id, st, en)
        sh = {"id": id, "start": st, "end": en, "in": tr or CUT, "params": {"L": {k: list(v) for k, v in L.items()}}, "sfx": []}
        for a, name, gain in fx:
            tt = a if isinstance(a, (int, float)) else at(a) - st
            sh["sfx"].append({"at": round(max(0, tt), 3), "name": name if name in NATIVOS else f"../../series/mamae/sfx/{name}.mp3", "gain": gain})
        if am: sh["amb"] = am
        if id in sem_nums: sh["nums"] = False
        if id in sem_hud: sh["hud"] = False
        if id in sem_leg: sh["captions"] = False
        shots.append(sh)
    T = {s["id"]: s["start"] for s in shots}; tm = lambda x: T[x] if isinstance(x, str) else x
    nums = [n for n in achar_numeros(W) if not any(s["start"] <= n["t"] < s["end"] and s.get("nums") is False for s in shots)]
    hud_l = [{"t": tm(a), "text": b, **({"rad": c} if c is not None else {})} for a, b, c in hud]
    mus = []; ms = list(musica)
    for i, (a, mood, it) in enumerate(ms): mus.append({"start": tm(a), "end": tm(ms[i + 1][0]) if i + 1 < len(ms) else DUR, "mood": mood, "intensity": it})
    json.dump({"title": titulo, "duration": DUR, "shots": shots, "numbers": nums, "hud": hud_l, "music": mus, "sfx": [{"t": round(n["t"], 3), "name": "pop", "gain": -13} for n in nums]}, open(f"{P}/story/shots.json", "w"), ensure_ascii=False, indent=1)
    for s in shots: print(f"{s['id']:4s} {s['start']:6.2f}-{s['end']:6.2f} ({s['end']-s['start']:4.1f}s) {s['in']['type']}")
    print(len(nums), "números:", ", ".join(n["str"] + (" " + n["sub"] if n.get("sub") else "") for n in nums))
