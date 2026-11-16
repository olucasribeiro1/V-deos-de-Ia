"""Monta story/shots.json a partir de timeline/lines.json (tempos das falas) — rode depois do tts_eleven.py.
Cada cena começa em relação a uma fala ("linha", deslocamento) ou a uma palavra da fala ("linha", "palavra", deslocamento)."""
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
    if len(spec) == 4: return word(spec[0], spec[1], spec[3]) + spec[2]
    return word(spec[0], spec[1]) + spec[2]
amb = lambda n: {"name": n, "gain": -30}
S = [
 ("s01", 0, "Era só mais um domingo.", "quintal aberto: churrasqueira fumegando, Rafael corre atrás do Bilu que leva a linguiça", dict(amb=amb("city"))),
 ("s02", ("n1b", -0.35), "Até a mãe desligar o celular", "cozinha: Mariana na bancada olhando o celular, tensa", dict(amb=amb("roomtone"))),
 ("s03", ("n1b", "rápido", -0.1), "rápido demais", "insert: mão vira o celular de cabeça pra baixo", dict(sfx=[{"at": 0.12, "name": "hit", "gain": -9, "pitch": 1.5}])),
 ("s04", ("n1b", "quando", -0.1), "quando o Eduardo entrou na cozinha.", "Eduardo entra, Mariana disfarça", dict(amb=amb("roomtone"))),
 ("s04b", ("n1c", -0.3), "Nos últimos meses, ela andava estranha.", "Mariana sozinha na mesa da cozinha, olhar perdido, café esfriando", dict(amb=amb("roomtone"))),
 ("s04x", ("n1c", "Recusava", -0.12), "Recusava todo convite.", "convites chegando e levando X vermelho", dict(sfx=[{"at": 0.35, "name": "pop", "gain": -10}, {"at": 0.8, "name": "pop", "gain": -10, "pitch": 0.9}, {"at": 1.25, "name": "pop", "gain": -10, "pitch": 0.8}])),
 ("s04c", ("n1c", "celular", -0.5), "E o celular, sempre de cabeça pra baixo na mesa.", "insert: celular virado pra baixo vibrando, luz vazando", dict(sfx=[{"at": 0.5, "name": "phonebuzz", "gain": -12}, {"at": 2.2, "name": "phonebuzz", "gain": -12}])),
 ("s05", ("r1", -0.25), "Dá um pedaço aí, Eduardo, pelo amor de Deus!", "churrasqueira: Rafael implora carne ao Eduardo", dict(amb=amb("city"))),
 ("s06", ("e1", -0.1), "Para de correr atrás do Bilu", "close do Eduardo bravo falando", {}),
 ("s07", ("e1", "com", -0.08), "com a carne, ele não é de ferro!", "Bilu dispara com a linguiça, Rafael atrás", dict(amb=amb("city"), sfx=[{"at": 0.05, "name": "whoosh", "gain": -10}])),
 ("s08", ("n2", -0.3), "Mãe biomédica tem esse problema:", "Mariana parada na janela, vista de fora", dict(amb=amb("city"))),
 ("s09", ("n2", "nunca", -0.1), "nunca sabe disfarçar quando algo tá errado.", "rosto gigante da Mariana: sorriso some", {}),
 ("s10", ("o1", -1.15), "", "portão abre com força, Osvaldo entra", dict(sfx=[{"at": 0.1, "name": "impact", "gain": -6}], **{"in": {"type": "whip", "dir": -1}})),
 ("s11", ("o1", -0.08), "Hoje. Agora.", "rosto gigante do Osvaldo", {}),
 ("s12", ("o1", "Todo", -0.1), "Todo mundo pro bunker, sem perguntas.", "Osvaldo aponta pra churrasqueira", dict(amb=amb("city"))),
 ("s13", ("r2", -0.12), "De novo essa palhaçada do bunker, tio?", "Rafael debocha, Eduardo de braços cruzados", dict(amb=amb("city"))),
 ("s13b", ("n2b", -0.3), "Fazia oito anos que o tio Osvaldo reformava aquela churrasqueira.", "flashback noturno: Osvaldo assentando tijolo sozinho", dict(sfx=[{"at": 0.9, "name": "hit", "gain": -14, "pitch": 0.8}, {"at": 2.2, "name": "hit", "gain": -14, "pitch": 0.9}], **{"in": {"type": "dip", "dur": 0.4}})),
 ("s13c", ("n2b", "fazia", -0.3, 2), "E fazia oito anos que a família inteira ria dele.", "flashback: família rindo e apontando pro tio", dict(amb=amb("murmur"))),
 ("s14", ("n3", -0.75), "E pela primeira vez na vida,", "insert: faca cai na tábua", dict(sfx=[{"at": 0.75, "name": "hit", "gain": -7, "pitch": 2.0}], **{"in": {"type": "dip", "dur": 0.3}})),
 ("s15", ("n3", "ela", -0.12), "ela não ri da piada do bunker.", "rosto gigante da Mariana: alívio e terror", dict(sfx=[{"at": 0.2, "name": "heartbeat", "gain": -10, "dur": 2.4}])),
 ("s16", ("n4", -1.5), "Lá fora,", "família olha pro céu, que clareia errado", dict(sfx=[{"at": 0.0, "name": "audio/sirene.wav", "gain": -13}])),
 ("s17", ("n4", "céu", -0.25), "o céu fica branco demais pro meio-dia.", "rosto gigante do Eduardo iluminado de branco", {}),
 ("s18", ("e2", -1.3), "", "família corre pra churrasqueira", dict(sfx=[{"at": 0.0, "name": "whoosh", "gain": -8}], **{"in": {"type": "whip", "dir": 1}})),
 ("s19", ("e2", -0.45), "O bunker é", "Osvaldo abre o depósito de carvão: é um alçapão", dict(sfx=[{"at": 0.1, "name": "hit", "gain": -8}])),
 ("s20", ("e2", "EMBAIXO", -0.05), "EMBAIXO DA CHURRASQUEIRA?!", "rosto gigante do Eduardo gritando", {"in": {"type": "zoom", "dur": 0.25}}),
 ("s21", ("o2", -0.1), "Desce, Eduardo, discute depois!", "Osvaldo empurra todo mundo pro alçapão", {}),
 ("s22", ("n5", -1.36), "A piada de família", "dentro do bunker: família desce a escada", dict(amb=amb("hum"), sfx=[{"at": 1.6, "name": "riser", "gain": -9, "dur": 4.0}])),
 ("s23", ("n5", "virou", -0.05), "virou a única coisa entre vocês e o fim do mundo.", "alçapão fechando, fresta de luz", dict(amb=amb("hum"))),
 ("s24", ("end", "n5", 0.25), "", "clarão branco engole tudo", dict(sfx=[{"at": 0.0, "name": "impact", "gain": -3}, {"at": 0.05, "name": "flash", "gain": -6}], **{"in": {"type": "flash", "dur": 0.5}})),
 ("s25", ("end", "n5", 1.65), "", "título: DOMINGO DE CHURRASCO — Episódio 1", dict(captions=False, sfx=[{"at": 0.1, "name": "stinger", "gain": -8}], **{"in": {"type": "dip", "dur": 0.5}})),
 ("s26", ("cta", -0.45), "Segue a página pra não perder o episódio dois.", "chamada pra seguir + próximo episódio", dict(captions=False, sfx=[{"at": 0.5, "name": "pop", "gain": -10}, {"at": 1.3, "name": "ding", "gain": -12}], **{"in": {"type": "fade", "dur": 0.4}})),
]
starts = [round(at(s[1]), 3) for s in S]; shots = []
for i, (id, _, line, scene, x) in enumerate(S):
    sh = {"id": id, "start": starts[i], "end": starts[i + 1] if i + 1 < len(S) else DUR, "line": line, "scene": scene, "in": x.get("in", {"type": "cut"}), "sfx": x.get("sfx", []), "params": {"L": {k: list(v) for k, v in L.items()}}}
    for k in ("amb", "captions"):
        if k in x: sh[k] = x[k]
    assert sh["end"] > sh["start"] + 0.4, (id, sh["start"], sh["end"]); shots.append(sh)
T = {s["id"]: s["start"] for s in shots}
music = [{"start": 0, "end": T["s10"], "mood": "playful", "intensity": 0.45}, {"start": T["s10"], "end": T["s18"], "mood": "tension", "intensity": 0.55},
         {"start": T["s18"], "end": T["s25"], "mood": "action", "intensity": 0.8}, {"start": T["s25"], "end": DUR, "mood": "mystery", "intensity": 0.4}]
for sh in shots:
    if sh["id"] in ("s13b", "s25", "s26"): sh["nums"] = False
nums = [n for n in achar_numeros(W) if not any(x["start"] <= n["t"] < x["end"] and x.get("nums") is False for x in shots)]
json.dump({"title": "Domingo de Churrasco", "duration": DUR, "shots": shots, "music": music, "numbers": nums, "sfx": [{"t": round(n["t"], 3), "name": "pop", "gain": -13} for n in nums]}, open(f"{P}/story/shots.json", "w"), ensure_ascii=False, indent=1)
for s in shots: print(f"{s['id']:5s} {s['start']:6.2f}-{s['end']:6.2f}  {s['scene'][:60]}")
