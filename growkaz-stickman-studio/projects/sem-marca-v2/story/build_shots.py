import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -34), [(("n02", "caminhão", 0), "whoosh", -8), (("n02", "pulou", 0), "impact", -4)]),
 ("B", ("n04", -0.15), {"type": "fade", "dur": 0.4}, amb("wind", -30), [(("n04", 0.2), "shimmer", -12), (("n04", "dragão", 0), "riser", -8), (("n04", "raspando", 0), "whoosh", -2), (("n04", "raspando", 0.1), "impact", -8), (("n04b", 0), "heartbeat", -10), (("n05", "mundo", 0), "stinger", -10), (("n05", "tela", 0), "glitch", -6), (("n06", "força", 0), "blip", -10), (("n06", "velocidade", 0), "blip", -10), (("n06", "inteligência", 0), "blip", -10), (("n06", "sobe", 0), "powerup", -12), (("n06", "travada", 0), "hit", -6)]),
 ("M", ("n07", -0.2), DIS, amb("wind", -34), [(("n07", "norte", 0), "whoosh", -12), (("n07", "montanhas", 0), "whoosh", -12), (("n07", "centro", 0), "whoosh", -12), (("n07", "sul", 0), "tensao", -10)]),
 ("C0", ("n08", -0.2), DIS, amb("murmur", -24), [(("n08", "elite", 0), "ding", -12), (("n08", "duas", 0), "pop", -10), (("n08", "três", 0), "pop", -10)]),
 ("E", ("n09", -0.15), DIS, amb("wind", -32), [(("n09a", "jato", 0), "whoosh", -6), (("n09b", "água", 0), "shimmer", -12), (("n09c", "pedra", 0), "impact", -6), (("n09d", "navio", 0), "whoosh", -6), (("n09e", "descarga", -0.05), "thunder", -4), (("n09e", "descarga", 0), "impact", -6), (("n09f", 0.1), "shimmer", -10)]),
 ("G1", ("n10", -0.2), DIS, amb("wind", -34), [(("n10", 0.1), "footstep", -10)]),
 ("G2", ("n10", "nada", -0.35), ZOOM, None, [(("n10", "nada", 0), "freeze", -10), (("n10", "ferrou", 0), "hit", -12)]),
 ("H", ("n10", "cidade", -0.3), DIS, amb("murmur", -24), [(("n10", "encara", 0), "freeze", -14), (("n10", "guarda", 0), "hit", -12)]),
 ("I", ("n11", -0.2), DIS, amb("murmur", -26), [(("n11", "cristal", 0), "shimmer", -10), (("n11", "fogo", 0), "whoosh", -6), (("n11", "nada", 0), "freeze", -10), (("n11", "gargalhada", -0.4), "applause", -18)]),
 ("K", ("n12", -0.15), DIS, None, [(("n12", "cajado", 0), "impact", -2), (("d1", "exilaram", 0), "riser", -14), (("d1", "nunca", 0), "stinger", -10)]),
 ("L", ("n13", -0.25), DIS, None, [(("n13", "miado", 0), "blip", -14), (("n13", "gato", 0), "riser", -12), (("n13", "salvou", 0.5), "glitch", -8)]),
 ("T", ("end", "n13", 0.6), DIS, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "Sem Marca - Ep1 - O Vazio", sem_nums=("A", "B", "M", "C0", "E", "G2", "T", "Kc"), sem_hud=tuple(x[0] for x in S), sem_leg=("T", "Kc"),
      musica=[(0, "tension", 0.6), ("B", "mystery", 0.55), ("M", "tension", 0.55), ("C0", "calm", 0.45), ("E", "tension", 0.6), ("G1", "sad", 0.45), ("I", "tension", 0.6), ("K", "mystery", 0.6), ("L", "dark", 0.55), ("T", "mystery", 0.5)])
