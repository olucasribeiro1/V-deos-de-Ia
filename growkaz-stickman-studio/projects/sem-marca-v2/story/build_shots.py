import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -34), [(("n02", "caminhão", 0), "whoosh", -8), (("n02", "pulou", 0), "impact", -4)]),
 ("B", ("n04", -0.15), {"type": "fade", "dur": 0.4}, amb("wind", -30), [(("n04", 0.2), "shimmer", -12), (("n04", "dragão", 0), "riser", -8), (("n04", "raspando", 0), "whoosh", -2), (("n04", "raspando", 0.1), "impact", -8), (("n04b", 0), "heartbeat", -10), (("n05", "mundo", 0), "stinger", -10), (("n05", "tela", 0), "glitch", -6), (("n06", "força", 0), "blip", -10), (("n06", "velocidade", 0), "blip", -10), (("n06", "inteligência", 0), "blip", -10), (("n06", "sobe", 0), "powerup", -12), (("n06", "travada", 0), "hit", -6)]),
 ("M", ("n07", -0.2), DIS, None, []),
 ("C0", ("n08", -0.2), DIS, amb("murmur", -24), []),
 ("E", ("n09", -0.15), DIS, amb("wind", -32), []),
 ("G", ("n10", -0.2), DIS, amb("wind", -34), []),
 ("I", ("n11", -0.2), DIS, amb("murmur", -26), []),
 ("K", ("n12", -0.15), DIS, None, []),
 ("L", ("n13", -0.25), DIS, None, []),
 ("T", ("end", "n13", 0.6), DIS, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "Sem Marca - Ep1 - O Vazio", sem_nums=("A", "B", "M", "E", "T", "Kc"), sem_hud=tuple(x[0] for x in S), sem_leg=("T", "Kc"),
      musica=[(0, "tension", 0.6), ("B", "mystery", 0.55), ("M", "tension", 0.55), ("C0", "calm", 0.45), ("E", "tension", 0.6), ("G", "sad", 0.45), ("I", "tension", 0.6), ("K", "mystery", 0.6), ("L", "dark", 0.55), ("T", "mystery", 0.5)])
