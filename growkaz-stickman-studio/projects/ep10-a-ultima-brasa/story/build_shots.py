import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("wind", -26), [(("n2", "gerador", 0.3), "gerador_liga", -8), (("n2", "acende", 0), "whoosh", -6)]),
 ("B", ("o1", -0.2), ZOOM, amb("wind", -30), [(("o1", "um", 0), "whistle", -12)]),
 ("C", ("n3", -0.2), DIS, amb("wind", -24), [(("n3", "para", 0), "whistle", -6), (("n4", 0.5), "tensao", -8)]),
 ("D", ("n5", -0.2), CUT, amb("wind", -24), [(("n5", "gira", 0), "riser", -8), (("m1", 0), "whistle", -4), (("m1", 0.35), "whistle", -4)]),
 ("E", ("n6", -0.2), DIS, amb("wind", -22), [(("n6", 0), "carpass", -14), (("n6", "minuto", 0), "tick", -8)]),
 ("F", ("n7", -0.2), CUT, amb("wind", -24), [(("n7", "vem", 0), "shimmer", -8), (("o3", 0.3), "cheer", -14)]),
 ("G", ("n8", -0.2), DIS, None, [(("n8", "abrigo", 0), "pop", -12), (("n8", "regra", 0), "pop", -12), (("n8", "água", 0), "pop", -12), (("n8", "gerador", 0), "pop", -12), (("n8", "roupa", 0), "pop", -12)]),
 ("H", ("n9", -0.3), {"type": "fade", "dur": 0.6}, amb("wind", -30), [(("n9", "mexe", 0), "arranhao", -6), (("n10", 0), "stinger", -6)]),
 ("I", ("end", "n10", 0.6), {"type": "fade", "dur": 0.5}, None, [(0.05, "impact", -8)]),
 ("Jc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "A Última Brasa", sem_nums=("A", "B", "C", "D", "E", "G", "I", "Jc"), sem_hud=("B", "G", "I", "Jc"), sem_leg=("I", "Jc"),
      hud=[(0, "DIA 30 · 11:30", 0.0), ("C", "DIA 30 · 11:41", 0.0), ("E", "DIA 30 · 11:59", 0.0), ("H", "DIA 30 · 12:20", 0.0)], musica=[(0, "tension", 0.6), ("C", "dark", 0.6), ("D", "action", 0.85), ("F", "triumph", 0.7), ("G", "hopeful", 0.5), ("H", "dark", 0.6), ("I", "epic", 0.6)])
