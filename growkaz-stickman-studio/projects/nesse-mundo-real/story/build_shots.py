import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, None, [(0.1, "shimmer", -12), (("n01", "trocar", 0), "blip", -8), (("n01", "trocar", 0.4), "glitch", -10)]),
 ("B", ("n02", -0.15), DIS, None, [(("n02", 0.05), "whoosh", -6), (("n02", "cortou", 0.9), "pop", -10), (("n02", "pão", 0), "ding", -12)]),
 ("C", ("n03", -0.15), DIS, None, [(("n03", "cruzado", 0), "swish", -10), (("n03", "novo", 0), "swish", -10), (("n03", "cruzeiro", 0), "swish", -10), (("n03", "cruzeiro", 0, 2), "swish", -10), (("n03", "real", 0), "ding", -10), (("n03", "cinco", 0), "hit", -10)]),
 ("D", ("n04", -0.15), DIS, None, [(("n04", "guilherme", 0), "glitch", -12), (("n04", "fiado", 0), "pop", -10), (("a1", -0.2), "blip", -12)]),
 ("E", ("n05", -0.15), DIS, amb("murmur", -30), [(("n05", "real", -0.3), "ding", -10), (("n05", "dez", 0), "hit", -8), (("m1", 0), "impact", -10)]),
 ("F", ("n06", -0.15), DIS, None, [(("n06", "multiplicava", 0), "powerup", -10), (("n06", "gastasse", 0), "blip", -10), (("n06", "trava", 0), "hit", -6)]),
 ("G", ("n07", -0.15), DIS, None, [(("n07", "um", 0), "counter", -12), (("n07", "dois", 0), "counter", -12), (("n07", "três", 0), "counter", -12), (("ma1", 0), "hit", -12), (("n08", "quatro", 0), "riser", -10), (("n08", "cofrinho", 0), "ding", -10)]),
 ("H", ("n09", -0.2), DIS, None, [(("n09", "medo", 0), "heartbeat", -10), (("n09", "jogou", 0), "powerup", -8)]),
 ("I", ("n10", -0.15), DIS, amb("murmur", -30), [(("n10", "padaria", 0), "whoosh", -8), (("n10", "terreno", 0), "pop", -10), (("n10", "fiado", 0), "whoosh", -10), (("n10", "crachá", 0), "ding", -10), (("m2", 0), "cheer", -18)]),
 ("J", ("n11", -0.2), DIS, None, [(("n11", "milhões", 0), "counter", -12), (("n11", "inflação", 0), "hit", -8), (("n12", 0.3), "riser", -12), (("n12", "coisa", 0), "ding", -10)]),
 ("K", ("n13", -0.25), DIS, None, [(("n13", "chefe", 0), "stinger", -8), (("c1", 0), "impact", -10), (("a2", 0.4), "whoosh", -6)]),
 ("L", ("n14", -0.25), DIS, amb("murmur", -32), [(("n14", 0.1), "shimmer", -12), (("g1", 0), "pop", -12)]),
 ("T", ("end", "n15", 0.5), DIS, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "Nesse Mundo So o Seu Real Nao Foi Trocado", sem_nums=tuple(x[0] for x in S), sem_hud=tuple(x[0] for x in S), sem_leg=("T", "Kc"),
      musica=[(0, "mystery", 0.5), ("B", "tension", 0.5), ("C", "calm", 0.45), ("D", "mystery", 0.45), ("E", "tension", 0.6), ("G", "tension", 0.65), ("H", "dark", 0.6), ("I", "calm", 0.5), ("J", "tension", 0.55), ("K", "dark", 0.6), ("L", "calm", 0.5), ("T", "mystery", 0.5)])
