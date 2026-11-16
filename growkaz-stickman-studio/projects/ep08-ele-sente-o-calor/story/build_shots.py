import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -34), [(0.1, "passos_metal", -4)]),
 ("B", ("n3", -0.2), DIS, amb("hum", -36), [(("n3", 0.3), "arranhao", -6), (("n3", "devagar", 0), "hit", -12)]),
 ("C", ("m1", -0.2), ZOOM, None, [(("m1", "calor", 0), "tensao", -8)]),
 ("D", ("o2", -0.2), DIS, amb("hum", -36), [(("n4", "gerador", 0.3), "hit", -8), (("n4", "lampião", 0.3), "hit", -10, ), (("n4", "rádio", 0.3), "hit", -10), (("n4", "dez", 0), "tick", -10)]),
 ("E", ("n5", -0.2), DIS, None, [(("r1", 0), "pop", -16)]),
 ("F", ("n6", -0.2), DIS, None, [(("n6", "uma", 0), "arranhao", -4), (("n6", "duas", 0), "arranhao", -4), (("n6", "três", 0), "arranhao", -2), (("o3", 1.0), "hit", -14)]),
 ("G", ("n7", -0.2), CUT, None, [(("n7", 0.5), "heartbeat", -10)]),
 ("H", ("n8", -0.3), {"type": "fade", "dur": 0.6}, None, [(("n9", "passos", 0), "passos_metal", -10), (("n10", "aviso", 0), "stinger", -10)]),
 ("I", ("end", "n10", 0.7), {"type": "fade", "dur": 0.5}, None, [(0.05, "stinger", -8)]),
 ("Jc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "Ele Sente o Calor", sem_nums=("D", "F", "H", "I", "Jc"), sem_hud=("C", "I", "Jc"), sem_leg=("I", "Jc"),
      hud=[(0, "DIA 15 · 23:47", 0.01), ("H", "DIA 16 · 02:05", 0.01)], musica=[(0, "dark", 0.55), ("C", "tension", 0.6), ("E", "dark", 0.35), ("F", "tension", 0.8), ("H", "sad", 0.35), ("I", "dark", 0.4)])
