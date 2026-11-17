import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -34), [(("n01", 0), "carpass", -14), (("n02", "caminhão", 0), "whoosh", -8), (("n02", "pulou", 0), "impact", -2), (("n03", "ileso", 0), "ding", -12), (("n03", "estatística", 0), "hit", -10)]),
 ("B", ("n04", -0.1), {"type": "fade", "dur": 0.5}, amb("wind", -30), [(("n04", 0.2), "shimmer", -10), (("n04", "dragão", 0), "riser", -8), (("n04", "dragão", 0.6), "whoosh", -4), (("n05", "mundo", 0), "stinger", -10)]),
 ("C", ("n06", -0.2), DIS, amb("murmur", -26), [(("n06", "marca", 0), "shimmer", -10), (("n06", "decide", 0), "hit", -10)]),
 ("D", ("n07", -0.12), DIS, amb("murmur", -28), [(("n07", "elite", 0), "ding", -12), (("n07", "duas", 0), "pop", -10), (("n07", "três", 0), "pop", -10)]),
 ("E", ("n08", -0.15), DIS, amb("wind", -32), [(("n08", "vermelha", 0), "whoosh", -10), (("n08", "azul", 0), "shimmer", -12), (("n09", "marrom", 0), "impact", -10), (("n09", "branca", 0), "whoosh", -8), (("n09", "estalo", -0.05), "thunder", -4), (("n09", "estalo", 0), "impact", -6)]),
 ("F", ("n10", -0.15), DIS, None, [(("n10", "dourada", 0), "shimmer", -10), (("n10", "preta", 0), "riser", -14), (("n10", "violeta", 0), "slowmo", -12)]),
 ("G", ("n11", -0.2), DIS, amb("wind", -34), [(("n11", 0), "footstep", -10), (("n11", "nada", 0), "freeze", -10)]),
 ("H", ("n12", -0.12), DIS, amb("murmur", -24), [(("n12", "para", 0), "freeze", -14), (("n12", "cochicha", 0), "murmur", -16), (("n12", "existir", 0), "stinger", -10)]),
 ("I", ("n13", -0.2), DIS, amb("murmur", -26), [(("n13", "cristal", 0), "shimmer", -10), (("n14", "fogo", 0), "whoosh", -6), (("n14", "plateia", 0), "cheer", -10)]),
 ("J", ("n14", "sua", -0.3), ZOOM, None, [(("n14", "encosta", 0), "heartbeat", -8), (("n14", "nada", 0), "freeze", -10), (("n14", "gargalhada", -0.3), "applause", -20)]),
 ("K", ("n15", -0.15), DIS, None, [(("n15", "cajado", 0), "impact", -2), (("n16", "livro", 0), "swish", -8), (("n16", "vazio", 0), "stinger", -8), (("n17", "arrancada", 0), "hit", -8)]),
 ("L", ("n18", -0.25), DIS, None, [(("n18", "miado", 0), "blip", -14), (("n18", "gato", 0), "riser", -12)]),
 ("T", ("end", "n18", 0.7), DIS, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "Sem Marca - Ep1 - O Vazio", sem_nums=("A", "B", "C", "D", "E", "F", "G", "I", "J", "K", "T", "Kc"), sem_hud=tuple(x[0] for x in S), sem_leg=("T", "Kc"),
      musica=[(0, "tension", 0.6), ("B", "mystery", 0.55), ("C", "calm", 0.45), ("E", "tension", 0.65), ("F", "mystery", 0.5), ("G", "sad", 0.45), ("H", "dark", 0.6), ("I", "tension", 0.6), ("J", "sad", 0.45), ("K", "mystery", 0.6), ("L", "dark", 0.55), ("T", "mystery", 0.5)])
