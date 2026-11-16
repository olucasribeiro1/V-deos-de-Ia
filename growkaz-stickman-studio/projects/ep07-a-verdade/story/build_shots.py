import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -32), [(("o1", 0), "tensao", -14)]),
 ("B", ("n2", -0.2), DIS, amb("hum", -32), [(("m1", "cérebro", 0), "soco_zoom", -10)]),
 ("C", ("n3", -0.2), DIS, None, [(("n3", "aprende", 0), "pop", -12), (("n3", "adapta", 0), "pop", -12), (("n3", "grupo", 0), "pop", -12), (("n3", "cérebro", 0), "ding", -10)]),
 ("D", ("m2", -0.2), DIS, amb("hum", -30), [(("m2", "escapou", 0), "alarme", -6), (("m2", "escapou", 0), "impact", -8)]),
 ("E", ("n4", -0.2), DIS, amb("murmur", -32), [(("m3", "ordem", 0), "hit", -6), (("m3", "queimar", 0.6), "flash", -6)]),
 ("F", ("n5", -0.2), DIS, amb("hum"), [(("e1", 0), "soco_zoom", -12)]),
 ("G", ("n6", -0.2), DIS, None, [(("o2", -0.2), "soco_zoom", -10)]),
 ("H", ("n7", -0.2), DIS, None, [(("n7", "atenção", 0), "pop", -12), (("n7", "remédio", 0), "alarme", -16), (("n7", "abrigo", 0), "ding", -12)]),
 ("I", ("r1", -0.3), DIS, amb("hum", -32), [(("m5", 0), "tensao", -6), (("n8", 1.0), "passos_metal", -2), (("n8", 2.4), "passos_metal", -4)]),
 ("J", ("end", "n8", 0.8), {"type": "fade", "dur": 0.5}, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "A Verdade Debaixo da Churrasqueira", sem_nums=("B", "D", "J", "Kc"), sem_hud=("B", "C", "D", "E", "G", "H", "J", "Kc"), sem_leg=("J", "Kc"),
      hud=[(0, "DIA 15 · 20:10", 0.01)], musica=[(0, "mystery", 0.45), ("B", "sad", 0.4), ("D", "tension", 0.7), ("F", "sad", 0.5), ("H", "calm", 0.35), ("I", "dark", 0.75), ("J", "dark", 0.4)])
