"""A Estação · Ep. 1 — montagem do story/shots.json (padrão do Turno), com a narração já gravada (input/voiceover.wav, intacta).
Estrutura: COLD OPEN no espelho (x00 = cópia da l06) -> rebobinar VHS "10 MINUTOS ANTES" -> rua viva à noite -> estação ->
banheiro -> espelho -> a outra São Paulo (+ a senhora) -> casa na Mooca -> "Cheguei, vida!" -> CORTE SECO -> cartão "EP. 2 →" + cta.
Cenas: series/estacao/cenas.js. As caminhadas da Lívia (PASSOS) vão para os params do plano e também viram um som de
salto por pisada (mesma cadência da animação), com o som do piso de cada lugar.
Uso: python3 projects/estacao-ep01/story/build_shots.py"""
import os, sys, json, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "series", "mamae"))
from build import monta, amb, DIS, CUT

P = os.path.join(ROOT, "projects", "estacao-ep01")
FADE = {"type": "fade", "dur": 0.5}
OFF_X = 52.496 - 2.2           # cold open = cena do espelho (D) deslocada: x00 cai em cima da l06
REW = (3.95, 5.75)             # rebobinar + "10 MINUTOS ANTES"
CARD = 1.3                     # cartão de título antes do "segue a página"
# caminhadas: [t0, t1, passos/s] (tempo absoluto) — a cena usa a mesma lista (info.passos)
PASSOS = {
    "A": [[5.75, 12.9, 2.1], [13.9, 17.0, 2.0], [17.0, 19.7, 1.7]],
    "B": [[19.4, 20.4, 2.1], [20.95, 24.5, 2.4]],
    "C": [[24.3, 25.7, 1.7], [26.3, 27.6, 1.7]],
    "D": [[32.9, 34.3, 1.6], [54.5, 56.4, 2.3]],
    "E": [[55.9, 57.4, 1.7], [60.6, 71.9, 1.6], [85.0, 86.5, 2.2]],
    "G": [[86.4, 87.6, 1.8]],
    "H": [[88.4, 89.4, 1.6], [94.8, 96.6, 1.4], [98.6, 99.9, 1.4]],
}
PISO = {"A": ("salto", -21), "B": ("salto_estacao", -18), "C": ("salto_banheiro", -17), "D": ("salto_banheiro", -17), "E": ("salto_eco", -11), "G": ("salto", -19), "H": ("salto_casa", -19)}


def pisadas(sid, ini, fim):
    """um salto por pisada (t0 + k/cad), só dentro do plano; seed e pitch variam por passo"""
    nome, g = PISO[sid]; out = []
    for j, (t0, t1, cad) in enumerate(PASSOS[sid]):
        k = 1
        while t0 + k / cad < t1 - 0.05:
            t = t0 + k / cad
            if ini <= t < fim: out.append(((("abs_fx", t)), nome, g + (-1.5 if k % 2 else 0) + (0.8 if j == 0 and k == 1 else 0), 100 + int(t * 37) % 97, 0.96 + 0.08 * ((k * 7) % 5) / 4))
            k += 1
    return out


def marca_pensamentos():
    """palavras das falas de pensamento (fx pensamento) ganham pensa=true: a legenda fica em itálico"""
    rot = json.load(open(os.path.join(P, "story", "roteiro.json")))
    pens = {l["id"] for l in rot["lines"] if l.get("fx") == "pensamento"}
    LN = json.load(open(os.path.join(P, "timeline", "lines.json")))["lines"]
    F = os.path.join(P, "timeline", "words.json"); W = json.load(open(F))
    for w in W["words"]:
        ln = next((l for l in LN if l["start"] - 0.05 <= w["start"] <= l["end"] + 0.05), None)
        if ln and ln["id"] in pens: w["pensa"] = True
        else: w.pop("pensa", None)
    json.dump(W, open(F, "w"), ensure_ascii=False, indent=1)
    return [[w["word"], w["start"]] for w in W["words"]]


def build():
    wall = marca_pensamentos()
    pad = lambda a, g=-26: (a, "synth_pad", g)
    S = [
     ("X", 0, CUT, amb("banheiro", -20), [(0.05, "flicker", -14), (0.9, "dread", -24), (("x00", "que", 0), "heartbeat", -18), (("x00", "isso", 0.1), "stinger", -16), pad(0.2, -24)]),
     ("RW", ("abs", REW[0]), CUT, None, [(0.0, "vhs_rewind", -6), (1.0, "switch_click", -12), (1.05, "tv_static", -30)]),
     ("A", ("abs", REW[1]), FADE, amb("cidade_noite", -13), [
        (0.3, "buzina", -20), (("l01", "três", 0), "moto_passa", -16), (("l01", "aguentar", -0.6), "onibus", -16), (("l01", "casa", 0.2), "buzina", -24),
        (("l02", "metrô", -0.1), "riser", -30), (("l02", "deus", 0.2), "buzina", -26), (("end", "l02", -0.4), "estacao", -24)]),
     ("B", ("abs", 19.2), FADE, amb("estacao", -15), [(("abs_fx", 20.65), "catraca", -12), (("abs_fx", 19.9), "aviso", -16), (("abs_fx", 20.7), "trem", -14)]),
     ("C", ("abs", 24.0), FADE, amb("banheiro", -17), [(0.05, "door_creak", -12), (("l03", "nojo", 0), "flicker", -20),
        (("abs_fx", 26.9), "door_creak", -20), (("abs_fx", 27.95), "papel", -10), (("abs_fx", 28.55), "papel", -11), (("abs_fx", 29.15), "papel", -10), (("abs_fx", 30.55), "porta_bate", -10)]),
     ("D", ("abs", 31.3), FADE, amb("banheiro", -17), [
        (("abs_fx", 31.75), "descarga", -9), (("abs_fx", 32.85), "door_creak", -18), (("abs_fx", 34.45), "torneira", -14),
        (("l04", "rosto", 0, 2), "dread", -26), (("end", "l04", 0.45), "flicker", -8), (("end", "l04", 0.62), "switch_click", -16),
        (("l05", 0), "heartbeat", -22), (("l05", "piscar", 0.1), "stinger", -20), pad(("l05", 0), -26),
        (("end", "l05", 0.1), "flicker", -10), (("end", "l05", 0.4), "riser", -18), (("l06", "isso", 0), "heartbeat", -16),
        (("end", "l06", 0.45), "flicker", -8), (("end", "l06", 0.55), "impact", -16)]),
     ("E", ("abs", 55.9), FADE, amb("outro_lado", -12), [
        (("l07", 0.2), "dread", -24), (("abs_fx", 63.4), "stinger", -24), (("l08", "cabeça", 0), "heartbeat", -20), (("l08", "seguindo", 0), "heartbeat", -18), pad(("l08", 0), -24),
        (("abs_fx", 72.2), "stinger", -16), (("s01", 0), "dread", -22), (("s02", "lá", 0), "impact", -18), (("s02", "lá", 0.1), "heartbeat", -14), (("end", "s02", 0.2), "riser", -22)]),
     ("G", ("abs", 86.0), FADE, amb("crickets", -20), [(("abs_fx", 86.35), "portao", -14), (("abs_fx", 87.55), "chave", -12), (("abs_fx", 88.05), "door_creak", -14)]),
     ("H", ("abs", 88.2), FADE, amb("tique", -18), [
        (("abs_fx", 89.55), "porta_bate", -18), (("l12", "geladeira", 0), "dread", -28), (("abs_fx", 100.3), "stinger", -18),
        (("l13", "diego", 0), "heartbeat", -18), (("l13", "câmera", 0), "heartbeat", -16), pad(("l13", 0), -24),
        (("abs_fx", 107.45), "chave", -8), (("abs_fx", 108.35), "door_creak", -10), (("d01", 0.1), "riser", -22)]),
     ("FIM", ("abs", 110.65), CUT, None, [(0.0, "impact", -12), (0.05, "tv_static", -24), (CARD + 0.3, "pop", -16), (CARD + 1.1, "ding", -18)]),
    ]
    # pisadas da Lívia (no intervalo de cada plano)
    ini = {s[0]: (s[1][1] if isinstance(s[1], tuple) else s[1]) for s in S}; ordem = [s[0] for s in S]
    for i, s in enumerate(S):
        if s[0] in PASSOS:
            fim = ini[ordem[i + 1]] + 0.5 if i + 1 < len(ordem) else 1e9
            s[4].extend(pisadas(s[0], ini[s[0]], fim))
    # ("abs_fx", t) -> tempo absoluto; monta() só conhece números/linhas: convertemos aqui para deslocamento no plano
    S2 = []
    for (sid, st, tr, am, fx) in S:
        t0 = st[1] if isinstance(st, tuple) and st[0] == "abs" else st
        out = []
        for c in fx:
            a = c[0]
            if isinstance(a, tuple) and a[0] == "abs_fx": a = round(a[1] - t0, 3)
            out.append((a, c[1], c[2]) if len(c) == 3 else (a, c[1], c[2], c[3], c[4]))
        S2.append((sid, st, tr, am, out))
    salto_extra = {}
    for sid, st, tr, am, fx in S2:
        salto_extra[sid] = [(c[0], c[3], c[4]) for c in fx if len(c) == 5]
    S3 = [(sid, st, tr, am, [c[:3] for c in fx]) for sid, st, tr, am, fx in S2]
    musica = [(0, "tension", 0.18), ("A", "dark", 0.06), ("B", "dark", 0.05), ("D", "tension", 0.18), ("E", "dark", 0.3), ("G", "dark", 0.12), ("H", "tension", 0.2), ("FIM", "dark", 0.1)]
    sem = tuple(x[0] for x in S3)
    monta(__file__, S3, "A Estacao - Ep1 - O Banheiro da Linha Vermelha", sem_nums=sem, sem_hud=sem, sem_leg=("RW", "FIM"), musica=musica)
    F = os.path.join(P, "story", "shots.json"); d = json.load(open(F))
    for sh in d["shots"]:
        sh["live"] = False; sh["grunge"] = False
        if sh["id"] not in ("FIM", "RW"): sh["vignette"] = False
        sh["params"]["Wall"] = wall
        sh["params"]["passos"] = PASSOS.get(sh["id"], [])
        # seed/pitch de cada pisada (variação natural)
        ex = salto_extra.get(sh["id"], [])
        for c in sh["sfx"]:
            for (at, seed, pitch) in ex:
                if c["name"].startswith("salto") and abs(c["at"] - max(0, at)) < 1e-3: c["seed"] = seed; c["pitch"] = round(pitch, 3)
        if sh["id"] == "X": sh["params"].update(src="D", off=round(OFF_X, 3))
        if sh["id"] == "RW": sh["params"].update(src="D", a=round(OFF_X, 3), b=round(OFF_X + REW[0], 3), cartao="10 MINUTOS ANTES", parteTxt="A ESTAÇÃO · EP. 1")
        if sh["id"] == "FIM": sh["params"].update(proximo="EP. 2 →", card=CARD)
    d["numbers"] = []; d["sfx"] = []
    json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
    cfg = json.load(open(os.path.join(P, "config.json"))); cfg["music"]["gainDb"] = -30; cfg["captionStyle"]["corPensa"] = "#d8e4f0"
    json.dump(cfg, open(os.path.join(P, "config.json"), "w"), ensure_ascii=False, indent=1)
    n = sum(1 for s in d["shots"] for c in s["sfx"] if c["name"].startswith("salto"))
    print(f"duração {d['duration']:.2f}s · {len(d['shots'])} planos · {n} pisadas de salto")


build()
