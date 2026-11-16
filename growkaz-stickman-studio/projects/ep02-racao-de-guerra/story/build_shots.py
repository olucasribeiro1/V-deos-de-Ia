"""Monta story/shots.json a partir de timeline/lines.json (tempos das falas) — rode depois do tts_eleven.py.
Cada cena começa em relação a uma fala ("linha", deslocamento) ou a uma palavra da fala ("linha", "palavra", deslocamento)."""
import json, os, re
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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
 ("s01", 0, "Dentro, o bunker é menor do que parece de fora.", "bunker aberto: lampião balançando, poeira caindo, família olhando em volta", dict(amb=amb("hum"), sfx=[{"at": 0.1, "name": "impact", "gain": -12}])),
 ("s02", ("nx0", -0.2), "Gerador.", "insert: gerador amarelo vibrando", dict(amb=amb("hum"), sfx=[{"at": 0.05, "name": "pop", "gain": -10}])),
 ("s03", ("nx0", "Filtro", -0.12), "Filtro de ar.", "insert: ventilador do filtro girando", dict(amb=amb("wind"), sfx=[{"at": 0.05, "name": "pop", "gain": -10, "pitch": 1.1}])),
 ("s04", ("nx0", "Prateleira", -0.12), "Prateleira de comida até o teto.", "câmera sobe a prateleira cheia; Rafael olhando pra cima", dict(amb=amb("hum"), sfx=[{"at": 0.1, "name": "whoosh", "gain": -12}])),
 ("s05", ("nx0", "tio", -0.4), "O tio não tinha cavado um buraco.", "Osvaldo orgulhoso, Eduardo impressionado", dict(amb=amb("hum"))),
 ("s06", ("nx0", "Tinha", -0.12, 2), "Tinha montado um plano.", "mapa com rota e checklist: água, comida, ar, luz", dict(sfx=[{"at": 0.25, "name": "blip", "gain": -12}, {"at": 0.55, "name": "blip", "gain": -12}, {"at": 0.85, "name": "blip", "gain": -12}, {"at": 1.15, "name": "blip", "gain": -12}])),
 ("s07", ("n1b", -0.2), "E cheira a comida de exército.", "insert: lata de ração com fumaça verde", dict(amb=amb("hum"))),
 ("s08", ("r1", -0.2), "Isso aqui tem gosto de quê, tio?", "Rafael com a lata, Osvaldo de braços cruzados", dict(amb=amb("hum"))),
 ("s09", ("o1", -0.1), "Proteína. Come e agradece.", "rosto gigante do Osvaldo, seco", {}),
 ("s10", ("nx1", -0.25), "Vinte e dois anos de Exército.", "flashback: Osvaldo batendo continência", dict(sfx=[{"at": 0.15, "name": "hit", "gain": -10, "pitch": 0.8}], **{"in": {"type": "dip", "dur": 0.3}})),
 ("s11", ("nx1", "Instrutor", -0.12), "Instrutor de sobrevivência.", "flashback: Osvaldo dando aula pra recrutas", dict(amb=amb("murmur"))),
 ("s12", ("nx1", "O", -0.25), "O tio passou a vida inteira esperando por esse dia.", "Osvaldo no bunker, satisfeito", dict(amb=amb("hum"), **{"in": {"type": "dip", "dur": 0.3}})),
 ("s13", ("n2", -0.25), "Enquanto Rafael reclama da ração,", "rosto gigante do Rafael com nojo, colher na mão", {}),
 ("s14", ("n2", "você", -0.15), "você percebe que sua mãe não falou uma palavra", "rosto gigante do Eduardo virando o olhar", {}),
 ("s15", ("n2", "desde", -0.12), "desde que a porta fechou.", "Mariana sentada num caixote no canto, olhando pro teto", dict(amb=amb("hum"))),
 ("s16", ("e1", -0.25), "Mãe, você tá bem?", "Eduardo ajoelha ao lado da mãe", dict(amb=amb("hum"))),
 ("s17", ("m1", -0.15), "Só cansada, filho.", "rosto gigante da Mariana, sorriso forçado", {}),
 ("s18", ("nx2", -0.15), "Cansada.", "rosto gigante do Eduardo desconfiado", {}),
 ("s19", ("nx2", "Era", -0.15), "Era a mesma resposta dos últimos meses.", "Mariana sozinha, o sorriso some", dict(amb=amb("hum"))),
 ("s20", ("n3", -0.3), "Osvaldo tenta captar alguma frequência.", "Osvaldo girando o botão do rádio militar", dict(amb=amb("hum"), sfx=[{"at": 0.2, "name": "audio/estatica.wav", "gain": -22}])),
 ("s21", ("n3", "maior", -0.35), "A maior parte é estática.", "insert: rádio grande, onda de estática", dict(sfx=[{"at": 0.0, "name": "audio/estatica.wav", "gain": -20}])),
 ("s22", ("rad", -0.2), "...contenção do Projeto Cér...", "insert: rádio fala, onda vermelha forte", dict(sfx=[{"at": 0.0, "name": "glitch", "gain": -10}])),
 ("s23", ("rad", "não", -0.1), "...não foi conclu...", "todos congelam olhando pro rádio", dict(sfx=[{"at": 1.2, "name": "glitch", "gain": -10}])),
 ("s24", ("n4", -0.6), "Osvaldo desliga rápido demais", "insert: mão do Osvaldo desliga o rádio", dict(sfx=[{"at": 0.5, "name": "hit", "gain": -6, "pitch": 1.4}])),
 ("s25", ("n4", "pra", -0.12), "pra quem diz que é só estática.", "Mariana trava, apertando o próprio braço", dict(amb=amb("hum"))),
 ("s26", ("e2", -0.15), "Projeto Cérbero?", "Eduardo aponta pro rádio", dict(amb=amb("hum"))),
 ("s27", ("e2", "Que", -0.1), "Que isso, mãe?", "rosto gigante do Eduardo cobrando", {}),
 ("s28", ("end", "e2", 0.35), "E pela primeira vez, você vê sua mãe sem resposta pronta pra nada.", "rosto gigante da Mariana, olhos enchendo d'água", dict(sfx=[{"at": 0.3, "name": "heartbeat", "gain": -9, "dur": 6.0}])),
 ("s29", ("end", "n5", 0.45), "", "título: RAÇÃO DE GUERRA — Episódio 2", dict(captions=False, sfx=[{"at": 0.1, "name": "stinger", "gain": -8}], **{"in": {"type": "dip", "dur": 0.5}})),
 ("s30", ("cta", -0.45), "Segue a página pra não perder o episódio três.", "chamada pra seguir + próximo episódio", dict(captions=False, sfx=[{"at": 0.5, "name": "pop", "gain": -10}, {"at": 1.3, "name": "ding", "gain": -12}], **{"in": {"type": "fade", "dur": 0.4}})),
]
starts = [round(at(s[1]), 3) for s in S]; shots = []
for i, (id, _, line, scene, x) in enumerate(S):
    sh = {"id": id, "start": starts[i], "end": starts[i + 1] if i + 1 < len(S) else DUR, "line": line, "scene": scene, "in": x.get("in", {"type": "cut"}), "sfx": x.get("sfx", []), "params": {"L": {k: list(v) for k, v in L.items()}}}
    for k in ("amb", "captions"):
        if k in x: sh[k] = x[k]
    assert sh["end"] > sh["start"] + 0.4, (id, sh["start"], sh["end"]); shots.append(sh)
T = {s["id"]: s["start"] for s in shots}
music = [{"start": 0, "end": T["s13"], "mood": "mystery", "intensity": 0.45}, {"start": T["s13"], "end": T["s20"], "mood": "sad", "intensity": 0.35},
         {"start": T["s20"], "end": T["s29"], "mood": "tension", "intensity": 0.6}, {"start": T["s29"], "end": DUR, "mood": "dark", "intensity": 0.4}]
json.dump({"title": "Ração de Guerra", "duration": DUR, "shots": shots, "music": music, "sfx": []}, open(f"{P}/story/shots.json", "w"), ensure_ascii=False, indent=1)
for s in shots: print(f"{s['id']:5s} {s['start']:6.2f}-{s['end']:6.2f}  {s['scene'][:60]}")
