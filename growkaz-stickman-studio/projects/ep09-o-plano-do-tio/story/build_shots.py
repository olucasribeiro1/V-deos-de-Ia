import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -34), [(1.0, "passos_metal", -14), (3.5, "passos_metal", -14)]),
 ("B", ("n2", -0.2), DIS, amb("hum"), [(("n2", "rádio", 0), "estatica", -12), (("rad", 0), "glitch", -10)]),
 ("C", ("e1", -0.2), DIS, amb("hum"), [(("e1", "três", 0), "soco_zoom", -10), (("o1", 0.8), "ding", -12)]),
 ("D", ("n3", -0.2), DIS, amb("wind", -30), [(("n3", "arma", 0), "soco_zoom", -10)]),
 ("E", ("o2", -0.2), DIS, None, [(("o2", "acende", 0), "whoosh", -10), (("m2", "quente", 0), "pop", -12)]),
 ("F", ("n4", -0.2), DIS, None, [(("n4", "apito", 0, 2), "whistle", -10), (("o3", 0), "hit", -14)]),
 ("G", ("n5", -0.2), DIS, None, [(("n5", "um", 0), "whistle", -12), (("n5", "dois", 0), "whistle", -12), (("n5", "dois", 0.35), "whistle", -12)]),
 ("H", ("n6", -0.3), {"type": "fade", "dur": 0.6}, amb("hum", -34), [(("o4", 0), "tensao", -12)]),
 ("I", ("end", "o5", 0.7), {"type": "fade", "dur": 0.5}, None, [(0.05, "stinger", -8)]),
 ("Jc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "O Plano do Tio", sem_nums=("A", "B", "C", "D", "E", "G", "H", "I", "Jc"), sem_hud=("C", "D", "E", "F", "G", "I", "Jc"), sem_leg=("I", "Jc"),
      hud=[(0, "DIA 16 · 03:00", 0.01), ("B", "DIA 22 · 09:15", 0.0), ("H", "DIA 29 · 23:40", 0.0)], musica=[(0, "dark", 0.45), ("B", "tension", 0.6), ("C", "hopeful", 0.55), ("H", "sad", 0.45), ("I", "dark", 0.4)])
