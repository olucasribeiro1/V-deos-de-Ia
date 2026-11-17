import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -34), [(("n01", 0.2), "carpass", -14), (("n02", "apaga", -0.05), "impact", -4), (("n02", "apaga", -0.05), "glitch", -8), (("n02", "semáforo", 0), "hit", -14), (("n02", "poste", 0), "hit", -14), (("n02", "prédio", 0), "hit", -12), (("n03", "maior", 0), "stinger", -10), (("n03", "mundo", 0), "whoosh", -10)]),
 ("B", ("n04", -0.25), DIS, None, [(("n04", "esquentou", 0), "riser", -12), (("n04", "niño", 0), "hit", -10), (("n04", "seca", 0), "whoosh", -12), (("n04", "temporal", 0), "thunder", -10)]),
 ("C", ("n05", -0.2), DIS, None, [(("n05", "metade", 0), "pop", -12), (("n05", "rio", 0, 2), "whoosh", -12), (("n05", "menor", 0), "hit", -10)]),
 ("D", ("n06", -0.2), DIS, amb("hum", -30), [(("n06", "ar", 0), "buzz", -14), (("n06", "cai", 0), "impact", -6), (("n06", "cai", 0, 2), "impact", -8), (("n06", "dominó", 0), "hit", -8), (("n07", "atingiu", 0), "glitch", -10)]),
 ("E", ("n08", -0.2), DIS, amb("murmur", -24), [(("n08", 0), "footstep", -12), (("n09", "torres", 0), "estatica", -14), (("n09", "dica", 0), "ding", -10), (("n09", "avião", 0), "pop", -12), (("n09", "brilho", 0), "pop", -12), (("n09", "mensagem", 0), "pop", -12)]),
 ("F", ("n10", -0.2), DIS, amb("murmur", -20), [(("n10", "maquininha", 0), "blip", -10), (("n10", "pix", 0), "glitch", -12), (("n10", "você", 0), "slowmo", -14), (("n11", "dinheiro", 0), "counter", -14)]),
 ("G", ("n12", -0.2), DIS, amb("hum", -34), [(("n12", "quatro", 0), "clock", -16), (("n12", "abriu", 0), "hit", -8), (("n12", "água", 0), "pop", -12)]),
 ("H", ("n13", -0.2), DIS, None, [(("n13", "posto", 0), "hit", -12), (("n13", "saques", -0.1), "impact", -4), (("n13", "saques", 0.2), "alarme", -10), (("n14", "regra", 0), "heartbeat", -10), (("n14", "nada", 0), "stinger", -10)]),
 ("I", ("n15", -0.2), DIS, None, [(("n15", "porto", 0), "hit", -12), (("n15", "servidor", 0), "glitch", -10), (("n15", "rede", 0), "impact", -8)]),
 ("J", ("n16", -0.2), DIS, None, [(("n16", 0), "gerador_liga", -10), (("n16", "monóxido", 0), "tosse", -10), (("n16", "lanterna", 0), "pop", -10), (("n16", "vela", 0), "hit", -12), (("n16", "tomada", 0), "swish", -10), (("n16", "pico", 0), "flash", -10)]),
 ("K", ("n17", -0.25), DIS, amb("hum", -34), [(("n17", "terça", 0), "carpass", -16), (("n18", "dinheiro", 0), "pop", -12), (("n18", "água", 0), "pop", -12), (("n18", "lanterna", 0), "pop", -12), (("n19", "luz", 0.1), "impact", -8)]),
 ("T", ("end", "n19", 0.5), DIS, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "E Se o Brasil Apagasse Inteiro", sem_nums=("B", "C", "G", "K", "T", "Kc"), sem_hud=("B", "C", "D", "I", "T", "Kc"), sem_leg=("T", "Kc"),
      hud=[(0, "TERÇA · 19:40", None), ("E", "HORA 1", None), ("F", "DIA 1", None), ("G", "DIA 1 · NOITE", None), ("H", "DIA 3", None), ("J", "DIA 3", None), ("K", "TERÇA · 19:40", None)],
      musica=[(0, "tension", 0.5), ("B", "mystery", 0.45), ("D", "tension", 0.7), ("E", "dark", 0.55), ("G", "tension", 0.5), ("H", "dark", 0.8), ("I", "tension", 0.6), ("K", "sad", 0.4), ("T", "dark", 0.5)])
