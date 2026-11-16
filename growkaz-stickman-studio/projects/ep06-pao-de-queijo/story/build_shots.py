import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, ZOOM, CUT
S = [
 ("A", 0, None, amb("hum", -32), [(("n1", "zero", 0), "ding", -10)]),
 ("B", ("o1", -0.2), DIS, amb("hum"), [(("o1", "capa", 0), "pop", -12), (("o1", "máscara", 0), "pop", -12), (("o1", "luva", 0), "pop", -12), (("o1", "saco", 0), "pop", -12), (("o1", "vinte", 0), "alarme", -14)]),
 ("C", ("n2", -0.2), CUT, amb("hum"), []),
 ("D", ("n3", -0.2), DIS, amb("wind", -24), [(("n3", 0), "alcapao_fecha", -10), (("n3", "quintal", 0), "tensao", -14)]),
 ("E", ("n4", -0.2), DIS, amb("wind", -26), [(("n4", "missão", 0), "pop", -12), (("n4", "missão", 0, 2), "pop", -12), (("r3", 0), "colher", -14)]),
 ("F", ("n5", -0.2), CUT, amb("wind", -26), [(("n5", "latido", 0), "latido", -6), (("r4", 0.3), "cachorro_choro", -12), (("n6", "vivo", 0), "shimmer", -12)]),
 ("G", ("n7", -0.2), CUT, amb("wind", -26), [(("n7", "marcas", 0), "soco_zoom", -6), (("n7", "dois", 0), "tensao", -8), (("o2", 1.2), "passos_metal", -10)]),
 ("H", ("n8", -0.2), DIS, amb("hum"), [(("n8", "noventa", 0), "ding", -12), (("n8", "condicionador", 0), "alarme", -16)]),
 ("I", ("n9", -0.2), DIS, amb("hum"), [(("n9", 0.5), "hit", -8), (("n9", "cérebro", 0), "soco_zoom", -8), (("n9", "desenho", 0), "tensao", -8)]),
 ("J", ("end", "n10", 0.6), {"type": "fade", "dur": 0.5}, None, [(0.05, "stinger", -8)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -10), (1.3, "ding", -12)]),
]
monta(__file__, S, "Vinte Minutos", sem_nums=("A", "G", "H", "J", "Kc"), sem_hud=("A", "H", "J", "Kc"), sem_leg=("J", "Kc"),
      hud=[(0, "DIA 14 · 11:50", 0.01), ("D", "DIA 14 · 12:02", 0.01), ("I", "DIA 14 · 12:31", 0.01)], musica=[(0, "hopeful", 0.5), ("D", "mystery", 0.5), ("F", "hopeful", 0.6), ("G", "tension", 0.75), ("H", "calm", 0.35), ("I", "dark", 0.6), ("J", "dark", 0.4)])
