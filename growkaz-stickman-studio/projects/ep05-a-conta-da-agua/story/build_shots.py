import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -32), [(("o1", 0), "tensao", -14)]),
 ("B", ("n2", -0.2), DIS, amb("hum", -32), [(("n2", "onda", 0), "impact", -6), (("n2", "pingando", 0), "colher", -20)]),
 ("C", ("r1", -0.2), DIS, amb("hum"), [(("r1", 0.3), "pop", -12)]),
 ("D", ("n3", -0.2), DIS, None, [(("n3", "seis", 0), "alarme", -12)]),
 ("E", ("o2", -0.2), DIS, amb("hum"), [(("m1", "não", 0), "hit", -10)]),
 ("F", ("n4", -0.2), DIS, None, [(("n4", "metade", 0), "pop", -12), (("n4", "metade", 0, 2), "pop", -12), (("n4", "crise", 0), "ding", -12)]),
 ("G", ("o3", -0.2), DIS, amb("wind", -28), [(("e1", -0.1), "soco_zoom", -12)]),
 ("H", ("n6", -0.3), {"type": "fade", "dur": 0.6}, amb("hum", -34), [(("m2", 0), "estatica", -18), (("rad", 0), "glitch", -12), (("n8", 0), "tensao", -10)]),
 ("I", ("e2", -0.3), CUT, amb("hum", -34), [(("n9", "desliga", 0.5), "hit", -10), (("n10", 0), "soco_zoom", -6)]),
 ("J", ("end", "n10", 0.6), {"type": "fade", "dur": 0.5}, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "A Conta da Água", sem_nums=("D", "F", "G", "J", "Kc"), sem_hud=("D", "F", "J", "Kc"), sem_leg=("J", "Kc"),
      hud=[(0, "DIA 8 · 07:10", 0.03), ("H", "DIA 8 · 03:12", 0.03)], musica=[(0, "mystery", 0.5), ("D", "tension", 0.6), ("G", "hopeful", 0.45), ("H", "dark", 0.6), ("J", "dark", 0.4)])
