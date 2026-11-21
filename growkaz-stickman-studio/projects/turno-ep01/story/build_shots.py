import os, sys; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "series", "turno"))
# Turno da Madrugada · Ep. 1 — episódio único (~2:15): cold open do mímico no vidro -> rebobinar "3 HORAS ANTES" -> l01..a03 -> corte seco -> "EP. 2 →" + cta.
# Toda a montagem (áudio, palavras, falas, planos e sons) está em series/turno/ep01_build.py; cenas em series/turno/ep01_cenas.js.
from ep01_build import build; build(__file__)
