import os, sys, json; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "mamae"))
from build import monta, amb, DIS, CUT
# Turno da Madrugada · Ep. 1 — O Último Café. Terror PS1 em primeira pessoa: planos longos, dissolve 0,5 s, um único corte seco (pro preto do título).
S = [
 ("A", 0, None, amb("conveniencia", -24), [
    (0.2, "crickets", -26),
    (("l01", "cafeteira", 0), "cafeteira", -16),
    (("l01", "geladeira", 0), "hum", -22),
    (("l01", "repondo", 0), "swish", -24),
    (("l01", "tico", 0.3), "swish", -26),
    (("l02", "quieta", 0), "crickets", -22),
    (("t02", 0.1), "dread", -26),
    (("l03", "passou", -0.4), "metal_drag", -10),
    (("l03", "passou", 0), "heartbeat", -18),
    (("l03", "arrastando", 0), "riser", -18),
    (("l04", 0), "stinger", -16)]),
 ("C", ("tv1", -0.4), DIS, amb("conveniencia", -26), [
    (("tv1", 0.05), "tv_static", -12),
    (("tv1", 0.5), "alarme", -22),
    (("tv1", "evitem", 0), "dread", -24),
    (("t04", 0), "tv_static", -30)]),
 ("D", ("l05", -0.3), DIS, amb("conveniencia", -26), [
    (("l05", "entrou", -0.7), "door_chime", -12),
    (("l05", "entrou", -0.2), "footstep", -18),
    (("l05", "entrou", 0.3), "footstep", -18),
    (("l05", "entrou", 0.8), "footstep", -18),
    (("l05", "branco", 0), "heartbeat", -18),
    (("l05", "encharcado", 0), "tensao", -22),
    (("a01", "café", 0.4), "colher", -18),
    (("a02", "cidade", 0, 2), "dread", -22)]),
 ("E", ("l07", -0.1), DIS, amb("conveniencia", -26), [
    (("l07", "pagou", 0.2), "tick", -16),
    (("l07", "pagou", 1.2), "door_chime", -14),
    (("l07", "embora", 0.6), "truck_leave", -12),
    (("l07", "depois", 0.4), "crickets", -18),
    (("end", "l07", 0.75), "distant_crash", -4),
    (("end", "l07", 0.8), "impact", -16),
    (("t05", 0.2), "heartbeat", -18)]),
 ("F", ("l08", -0.35), DIS, amb("crickets", -20), [
    (("l08", "gente", 0), "stinger", -14),
    (("l08", "olhando", 0), "heartbeat", -14),
    (("l08", "nenhum", 0), "dread", -20),
    (("t06", "lâmpada", 0), "flicker", -12),
    (("t06", "queimando", 0), "flicker", -10),
    (("end", "t06", 0.3), "hit", -14),
    (("end", "t06", 0.35), "flicker", -12)]),
 ("G", ("l09", -0.3), DIS, amb("conveniencia", -26), [
    (("l09", "bateram", -0.15), "glass_knock", -4),
    (("l09", "era", 0), "stinger", -14),
    (("a03", 0), "dread", -20),
    (("l10", "palavra", 0), "heartbeat", -16),
    (("l10", "acredita", 0), "heartbeat", -14),
    (("t07", 0.2), "glass_knock", -16)]),
 ("H", ("l11", -0.35), DIS, amb("fluorescent", -24), [
    (("l11", "corri", 0), "footstep", -12), (("l11", "corri", 0.35), "footstep", -12), (("l11", "corri", 0.7), "footstep", -12), (("l11", "corri", 1.05), "footstep", -12), (("l11", "corri", 1.4), "footstep", -12), (("l11", "corri", 1.75), "footstep", -12),
    (("l11", "cadeado", 0.7), "colher", -14),
    (("l11", "ouvi", 0), "riser", -16),
    (("t08", 0), "dread", -18),
    (("l12", "tico", 0), "heartbeat", -12),
    (("l12", "lado", 0), "heartbeat", -10),
    (("end", "l12", 0.15), "door_creak", -6),
    (("end", "l12", 0.45), "riser", -12)]),
 ("T", ("end", "l12", 1.15), CUT, None, [(0.45, "flicker", -12), (0.95, "impact", -14)]),
 ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.5, "pop", -14), (1.3, "ding", -16)]),
]
monta(__file__, S, "Turno da Madrugada - Ep1 - O Ultimo Cafe", sem_nums=tuple(x[0] for x in S), sem_hud=tuple(x[0] for x in S), sem_leg=("T", "Kc"),
      musica=[(0, "dark", 0.3), ("C", "tension", 0.35), ("D", "dark", 0.35), ("E", "dark", 0.4), ("F", "tension", 0.4), ("G", "dark", 0.45), ("H", "tension", 0.5), ("T", "dark", 0.3)])

# ---- pós: planos 3D sem câmera viva/sujeira/vinheta do motor (a câmera em 1ª pessoa e o pós PS1 já fazem isso) ----
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); F = P + "/story/shots.json"
d = json.load(open(F))
for sh in d["shots"]:
    sh["live"] = False; sh["grunge"] = False
    if sh["id"] not in ("T", "Kc"): sh["vignette"] = False
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
print("ok:", F)
