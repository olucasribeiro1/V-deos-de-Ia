#!/usr/bin/env python3
"""Mix final do episodio 01 (102,03 s, 48 kHz estereo, -14 LUFS, TP <= -1 dBTP).

Uso:  python3 mix_ep01.py [saida.wav]
      (padrao: video-engine/out/ep01/mix.wav, copiado tambem para video-engine/public/ep01/mix.wav)

Cadeia:
  voz  -> highpass + comp 3:1 + ganho p/ VOICE_LUFS                       (sempre por cima)
  trilha -> ganho base + automacao (MUSIC_AUTO) -> sidechaincompress (chave = voz, forte)
  SFX  -> cada evento com ganho = alvo - LUFS medido do stem -> bus -> sidechaincompress (chave = voz, leve)
  soma -> ganho master (2 passadas p/ cair em -14 LUFS) -> alimiter em 192 kHz (true peak) -> 102,03 s

Para editar: mexa nas listas CUTS / EV / MUSIC_AUTO abaixo e rode de novo.
Cada evento de EV: (t, stem, alvo_LUFS, opcoes)
  t        = instante (s, absoluto) em que o "ponto de sincronia" do stem deve cair
  anchor   = ponto de sincronia dentro do stem (s); padrao = ANCHOR[stem] ou 0
  ss       = pula o comeco do stem (s);  dur = corta depois de dur s (faz loop se > stem)
  fi / fo  = fade in / fade out (s);  rate = varispeed (pitch+tempo);  pan = -1..1
  lp / hp  = lowpass / highpass (Hz);  rev = True toca invertido
"""
import json, os, re, shutil, subprocess, sys, tempfile

ROOT = '/home/user/V-deos-de-Ia'
SFX = ROOT + '/assets/sfx'
VOICE = ROOT + '/episodios/ep01/narracao.mp3'
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT + '/video-engine/out/ep01/mix.wav'
PUBLIC = ROOT + '/video-engine/public/ep01/mix.wav'
DUR = 102.03
TARGET_LUFS = -14.0
TP_MAX = -1.0
VOICE_LUFS = -15.0            # voz antes do master (o master sobe tudo junto)
MUSIC_BASE = -24.0            # LUFS da trilha sem ducking (o ducking tira mais ~5-8 dB sob a voz)

# LUFS integrado medido de cada stem (ffmpeg ebur128). Recalcule se trocar um arquivo.
M = {
 'amb-calcadao-ondas-multidao': -20.6, 'carro-interior-noite': -32.9, 'estalo-trovao': -12.1,
 'janela-vidro-tremendo': -18.0, 'lock-on-tom': -15.3, 'luva-couro-aperto': -44.5,
 'musica-bed-tensa': -17.3, 'pombos-revoada': -18.1, 'sonar-ping': -24.6, 'stinger-empate': -14.1,
 'tablet-beep': -30.1, 'teleporte-zap-vacuo': -12.1, 'tensao-hit': -12.7, 'whoosh-corte-a': -18.9,
 'whoosh-corte-b': -17.4,
 # ep01/
 'musica-bed-ep01': -14.0, 'boia-plop': -3.2, 'cama-molas': -19.6, 'carimbo': -21.1,
 'celular-tocando': -4.5, 'cronometro': -25.3, 'dossie-papel': -36.0, 'globo-espacial': -11.0,
 'hit-final': -6.9, 'hud-blip': -19.9, 'lata-metal': -18.5, 'lata-parede-impacto': -9.0,
 'muro-crunch': -14.9, 'nado-agua': -16.4, 'oceano-aberto': -21.4, 'passos-sapato': -30.6,
 'pistola-largada': -12.4, 'riser-tensao': -9.1, 'scan-eletronico': -12.6, 'splash-duplo': -12.9,
 'swish-suave': -21.8, 'tinnitus': -39.4, 'toquio-rua-neon': -25.8, 'vento-queda': -11.8,
}
# ponto de sincronia (transiente principal) de cada stem, em s
ANCHOR = {'estalo-trovao': 0.05, 'teleporte-zap-vacuo': 0.12, 'lata-parede-impacto': 0.18,
          'splash-duplo': 0.14, 'carimbo': 0.33, 'cama-molas': 0.21, 'lata-metal': 0.23,
          'muro-crunch': 0.3, 'swish-suave': 0.24, 'dossie-papel': 0.47, 'luva-couro-aperto': 0.5,
          'hit-final': 0.92, 'riser-tensao': 4.03, 'boia-plop': 1.27, 'pombos-revoada': 0.2,
          'globo-espacial': 0.18, 'whoosh-corte-a': 0.06, 'whoosh-corte-b': 0.06}

# ---------------------------------------------------------------- cortes (whoosh baixinho e variado)
CUTS = [1.591, 2.473, 3.68, 4.656, 5.666, 6.606, 7.651, 8.766, 10.089, 11.006, 12.098, 13.653,
        14.779, 15.928, 16.892, 17.786, 18.796, 19.899, 20.863, 21.931, 23.127, 24.067, 25.448,
        26.447, 27.852, 29.013, 30.139, 31.741, 32.972, 33.819, 34.76, 35.665, 36.722, 37.778,
        38.788, 39.752, 40.634, 41.807, 43.328, 44.814, 46.381, 47.252, 48.1, 49.667, 50.584,
        51.408, 52.221, 53.092, 54.555, 55.6, 56.691, 57.55, 58.502, 59.895, 61.335, 62.101,
        63.437, 64.667, 65.422, 66.374, 67.314, 68.499, 69.683, 70.646, 71.552, 72.533, 74.133,
        75.033, 76.333, 77.533, 78.5, 79.433, 80.333, 81.467, 82.467, 83.467, 84.5, 85.533,
        86.567, 87.5, 88.5, 89.533, 90.733, 91.633, 92.6, 93.9, 94.967, 96.167, 97.333, 98.433,
        99.533, 101.0]
# cortes sem whoosh (estalo, silencio, "corte seco", hard cut final)
CUT_SKIP = {39.752, 61.335, 67.314, 69.683, 86.567, 101.0}
CUT_STEMS = ['whoosh-corte-a', 'swish-suave', 'whoosh-corte-b']
CUT_RATE = [1.0, 0.86, 1.12, 0.93, 1.2, 0.8, 1.06]
CUT_LVL = [-33, -31, -34, -32, -35]
CUT_PAN = [-0.35, 0.3, 0.0, 0.4, -0.2]

def cut_events():
    ev = []
    for i, t in enumerate(CUTS):
        if t in CUT_SKIP:
            continue
        ev.append((t, CUT_STEMS[i % 3], CUT_LVL[i % 5],
                   dict(rate=CUT_RATE[i % 7], pan=CUT_PAN[i % 5], hp=180)))
    return ev

# ---------------------------------------------------------------- cue list (shots.json A/B/C)
EV = [
 # ===== PART A (0 - 34.76)
 (0.0,   'amb-calcadao-ondas-multidao', -29, dict(dur=3.9, fi=0.2, fo=1.2)),
 (2.6,   'teleporte-zap-vacuo', -18, {}),                         # Davi some
 (2.62,  'estalo-trovao', -22, dict(dur=0.9, fo=0.5)),            # estalo curto
 (2.7,   'swish-suave', -28, dict(rate=0.7, rev=True)),            # air rush
 (3.78,  'passos-sapato', -29, dict(ss=1.2, dur=1.0, fi=0.1, fo=0.3)),
 (4.7,   'hud-blip', -31, dict(rate=1.6)),                         # ting nos oculos
 (5.77,  'hud-blip', -30, {}),
 (6.65,  'whoosh-corte-a', -27, dict(rev=True, rate=0.8)),         # flash de memoria
 (7.65,  'vento-queda', -27, dict(anchor=0.8, fo=0.4)),
 (8.38,  'hud-blip', -31, {}),
 (8.77,  'vento-queda', -25, dict(anchor=0.6, rate=0.9, fo=0.5)),
 (10.37, 'teleporte-zap-vacuo', -18, {}),                          # salto involuntario
 (11.01, 'teleporte-zap-vacuo', -23, dict(rate=1.2, dur=0.8, fo=0.3)),
 (11.15, 'cama-molas', -23, {}),
 (12.5,  'hud-blip', -30, dict(rate=0.9)),
 (13.65, 'lata-metal', -25, {}),
 (14.78, 'toquio-rua-neon', -33, dict(dur=1.15, fi=0.1, fo=0.3, lp=2200)),   # video no celular
 (16.12, 'teleporte-zap-vacuo', -17, {}),
 (16.14, 'estalo-trovao', -20, dict(dur=1.2, fo=0.6)),
 (16.89, 'teleporte-zap-vacuo', -21, dict(rate=0.9, dur=1.0, fo=0.4)),
 (16.89, 'toquio-rua-neon', -29, dict(dur=4.0, fi=0.2, fo=1.0)),
 (17.9,  'globo-espacial', -24, dict(rate=0.6)),                   # lata arrancando slow-mo
 (18.05, 'hud-blip', -30, {}),
 (18.8,  'whoosh-corte-b', -26, dict(rate=0.75)),                  # travelling
 (19.38, 'lata-parede-impacto', -15, {}),                          # IMPACTO lata na parede
 (19.95, 'muro-crunch', -30, dict(ss=0.5, fo=0.5, hp=400)),        # poeira / detritos
 (20.86, 'globo-espacial', -25, {}),
 (21.33, 'hud-blip', -28, dict(rate=0.7)),                         # pino (pop)
 (21.93, 'cronometro', -30, dict(dur=1.1, fo=0.2)),                # contador
 (23.13, 'swish-suave', -27, dict(rate=0.9)),                      # seta desenhando
 (24.07, 'globo-espacial', -24, dict(rate=0.85)),                  # whip globo
 (24.94, 'hud-blip', -28, dict(rate=0.7)),
 (25.52, 'cronometro', -30, dict(dur=0.9, fo=0.2)),
 (26.45, 'whoosh-corte-a', -28, dict(rate=0.75)),                  # zoom out
 (27.85, 'swish-suave', -28, dict(pan=-0.7)),
 (27.98, 'swish-suave', -28, dict(pan=0.7, rate=1.1)),
 (28.32, 'tensao-hit', -25, dict(rate=1.3, dur=0.6, fo=0.3)),      # punch
 (29.21, 'carimbo', -26, dict(rate=1.3)),                          # clack
 (30.27, 'tensao-hit', -17, {}),                                   # IMPACTO delta 2.900
 (30.3,  'cronometro', -31, dict(rate=1.4, dur=0.8, fo=0.2)),
 (31.8,  'scan-eletronico', -24, {}),
 (33.1,  'hud-blip', -32, dict(rate=0.8)),
 (33.85, 'carimbo', -20, {}),
 (34.09, 'carimbo', -19, dict(rate=0.9)),
 (34.09, 'tablet-beep', -26, dict(rate=0.6)),                      # buzz do X
 # ===== PART B (34.76 - 72.53)
 (35.13, 'teleporte-zap-vacuo', -17, {}),
 (39.75, 'riser-tensao', -23, dict(fi=1.0)),                       # vacuo -> succao -> riser ate o estalo
 (36.82, 'vento-queda', -30, dict(rev=True, dur=1.5, fo=0.3)),     # ar sugado
 (37.31, 'hud-blip', -31, {}),
 (37.35, 'cronometro', -32, dict(dur=0.6, fo=0.2)),
 (39.80, 'estalo-trovao', -11, {}),                                # ESTALO 140 dB
 (39.80, 'tensao-hit', -18, dict(rate=0.7)),                       # sub-boom
 (39.85, 'pombos-revoada', -21, {}),
 (39.90, 'tinnitus', -27, dict(dur=1.0, fo=0.5)),
 (40.63, 'janela-vidro-tremendo', -22, {}),
 (40.70, 'hud-blip', -31, {}),
 (41.98, 'pistola-largada', -16, {}),                              # tiro de largada
 (42.60, 'tinnitus', -30, dict(dur=0.8, fo=0.4, lp=6000)),
 (43.99, 'sonar-ping', -24, {}),                                   # microfone no poste
 (44.81, 'tensao-hit', -18, {}),                                   # Rocha / a Linha
 (45.98, 'hud-blip', -31, {}),
 (46.38, 'whoosh-corte-b', -27, dict(rate=0.9)),                   # whip vertical
 (46.79, 'sonar-ping', -25, dict(dur=1.0, fo=0.4)),
 (47.35, 'sonar-ping', -28, dict(rate=1.2, dur=0.6, fo=0.3)),      # cascata
 (47.55, 'sonar-ping', -29, dict(rate=1.35, dur=0.6, fo=0.3, pan=-0.5)),
 (47.72, 'sonar-ping', -30, dict(rate=1.5, dur=0.6, fo=0.3, pan=0.5)),
 (47.88, 'sonar-ping', -31, dict(rate=1.7, dur=0.5, fo=0.3)),
 (48.37, 'sonar-ping', -24, dict(pan=-0.5, dur=0.9, fo=0.4)),      # ping 1,2,3
 (48.88, 'sonar-ping', -24, dict(rate=1.12, dur=0.9, fo=0.4)),
 (49.14, 'sonar-ping', -23, dict(rate=1.25, pan=0.5)),
 (49.77, 'tablet-beep', -25, {}),                                  # osciloscopio
 (49.95, 'tablet-beep', -26, dict(rate=1.2)),
 (50.13, 'tablet-beep', -27, dict(rate=1.4)),
 (50.32, 'hud-blip', -31, {}),
 (50.96, 'tensao-hit', -21, dict(rate=1.3)),                       # pino "foi"
 (50.98, 'lock-on-tom', -25, {}),                                  # alarme curto
 (51.91, 'cronometro', -26, dict(anchor=1.95, ss=1.5)),            # tique-taque + click
 (52.27, 'carro-interior-noite', -27, dict(ss=1.0, dur=0.85, fi=0.1, fo=0.2)),
 (52.38, 'tablet-beep', -24, {}),
 (53.81, 'swish-suave', -24, dict(rate=1.3)),                      # risco X
 (53.83, 'tensao-hit', -19, {}),
 (54.91, 'luva-couro-aperto', -22, {}),                            # couro + snap
 (55.65, 'dossie-papel', -24, {}),
 (56.19, 'dossie-papel', -27, dict(rate=1.1, ss=0.3)),
 (56.79, 'swish-suave', -33, dict(rate=1.7)),                      # caneta
 (57.60, 'carimbo', -17, {}),                                      # CONFIDENCIAL
 (57.62, 'tensao-hit', -26, dict(rate=1.5, dur=0.6, fo=0.3)),
 (58.50, 'amb-calcadao-ondas-multidao', -29, dict(dur=5.6, fi=0.3, fo=1.0)),
 (58.80, 'hud-blip', -31, {}),
 (59.90, 'whoosh-corte-a', -27, dict(rate=0.9)),                   # whip lateral
 (60.66, 'lata-metal', -29, dict(rate=0.8)),                       # copo / colher
 (61.34, 'passos-sapato', -27, dict(ss=1.6, dur=1.0, fo=0.3)),
 (61.44, 'tensao-hit', -24, {}),
 (62.48, 'luva-couro-aperto', -20, {}),                            # luva fecha no pulso
 (62.50, 'tensao-hit', -22, dict(rate=0.9)),
 (63.83, 'teleporte-zap-vacuo', -30, dict(lp=3000, rate=0.8)),     # zumbido eletrico
 (64.67, 'teleporte-zap-vacuo', -18, {}),                          # (imaginacao) Rastro
 (64.70, 'globo-espacial', -21, dict(rate=0.8)),                   # whoosh enorme
 (65.42, 'vento-queda', -24, dict(anchor=0.6, fo=0.4)),
 (65.52, 'hud-blip', -31, {}),
 (65.55, 'cronometro', -32, dict(dur=0.6, fo=0.2)),
 (66.37, 'whoosh-corte-b', -26, dict(rate=0.8)),
 (66.60, 'muro-crunch', -16, {}),                                  # vira parede
 (67.70, 'tensao-hit', -26, dict(rate=0.7)),                       # pulso grave
 (68.72, 'tensao-hit', -22, {}),
 (69.69, 'tensao-hit', -17, dict(rate=0.85)),                      # EMPATE (boom + silencio)
 (70.87, 'luva-couro-aperto', -27, {}),
 (71.65, 'passos-sapato', -27, dict(ss=1.6, dur=1.0, fo=0.3)),
 (72.50, 'riser-tensao', -22, dict(fi=2.0)),                       # riser ate o fim da parte B
 # ===== PART C (72.53 - 102.03)
 (72.56, 'swish-suave', -28, {}),
 (72.60, 'cronometro', -33, dict(rate=1.3, dur=0.8, fo=0.2)),      # giz
 (73.33, 'tensao-hit', -22, dict(rate=1.2)),                       # "conta"
 (74.15, 'globo-espacial', -27, {}),
 (74.25, 'swish-suave', -30, dict(rate=0.9)),
 (75.23, 'hud-blip', -29, {}),
 (75.57, 'hud-blip', -29, dict(rate=1.2)),
 (76.35, 'whoosh-corte-a', -28, dict(rate=0.8)),
 (76.40, 'scan-eletronico', -28, dict(rate=0.7)),                  # linha do equador acende
 (77.55, 'globo-espacial', -25, dict(rate=1.1)),
 (77.80, 'scan-eletronico', -29, dict(rate=0.9)),
 (78.73, 'tensao-hit', -21, dict(rate=1.3)),                       # pino no Rio
 (78.75, 'hud-blip', -28, {}),
 (79.50, 'cronometro', -31, dict(dur=0.8, fo=0.2)),
 (80.43, 'cronometro', -31, dict(rate=1.1, dur=0.8, fo=0.2)),
 (80.87, 'hud-blip', -28, dict(rate=1.3)),                         # pino azul
 (81.50, 'sonar-ping', -29, dict(rate=1.3, dur=0.6, fo=0.3)),
 (81.90, 'sonar-ping', -29, dict(rate=1.45, dur=0.6, fo=0.3)),
 (82.53, 'swish-suave', -28, dict(pan=-0.7)),
 (82.55, 'swish-suave', -28, dict(pan=0.7, rate=1.05)),
 (82.93, 'lock-on-tom', -26, dict(rate=1.2)),                      # match chime
 (84.10, 'riser-tensao', -24, dict(ss=2.6)),                       # crash-zoom riser
 (84.17, 'oceano-aberto', -31, dict(dur=1.4, fi=0.5, fo=0.2)),
 (84.50, 'oceano-aberto', -31, dict(ss=3.0, dur=1.1, fo=0.2, pan=0.4)),
 (84.50, 'amb-calcadao-ondas-multidao', -32, dict(dur=1.0, fo=0.2, pan=-0.4)),
 (85.53, 'amb-calcadao-ondas-multidao', -32, dict(ss=1.0, dur=1.1, fo=0.3)),
 (86.70, 'teleporte-zap-vacuo', -16, {}),                          # RASTRO + ESTALO
 (86.70, 'estalo-trovao', -11, {}),
 (86.72, 'tensao-hit', -17, dict(rate=0.75)),                      # heavy low boom
 (87.50, 'teleporte-zap-vacuo', -21, dict(rate=0.9, ss=0.1)),
 (88.00, 'splash-duplo', -15, {}),                                 # SPLASH duplo
 (88.00, 'oceano-aberto', -30, dict(dur=4.6, fi=0.3, fo=0.3)),
 (89.53, 'vento-queda', -27, dict(anchor=0.6, fo=0.5)),            # drone sobe
 (91.00, 'luva-couro-aperto', -25, {}),
 (91.05, 'splash-duplo', -27, dict(rate=1.4, fo=0.3)),
 (91.63, 'nado-agua', -24, dict(dur=1.0, fo=0.3)),
 (91.93, 'teleporte-zap-vacuo', -19, {}),                          # Davi sai
 (92.67, 'teleporte-zap-vacuo', -19, dict(rate=1.05)),             # Davi chega no quiosque
 (92.60, 'amb-calcadao-ondas-multidao', -30, dict(dur=1.3, fi=0.1, fo=0.2)),
 (93.17, 'lata-metal', -28, dict(rate=0.8)),
 (93.90, 'oceano-aberto', -31, dict(ss=5.0, dur=1.07, fi=0.1, fo=0.2)),
 (94.30, 'boia-plop', -20, dict(ss=0.85)),                         # assobio + PLOP
 (94.97, 'celular-tocando', -24, dict(dur=1.2, fo=0.2)),           # telefone (Marinha)
 (94.97, 'amb-calcadao-ondas-multidao', -33, dict(ss=0.5, dur=2.36, fi=0.2, fo=0.2)),
 (96.17, 'passos-sapato', -26, dict(ss=1.4, dur=1.16, fo=0.2)),
 (97.33, 'oceano-aberto', -31, dict(ss=2.0, dur=1.1, fi=0.1, fo=0.2)),
 (97.53, 'stinger-empate', -27, dict(rate=1.1, dur=0.8, fo=0.4)),  # sting comico
 (98.43, 'amb-calcadao-ondas-multidao', -33, dict(ss=2.0, dur=2.3, fi=0.1, fo=0.6)),
 (98.43, 'lata-metal', -29, {}),                                   # lata jogada (17 f)
 (99.00, 'lata-metal', -30, dict(rate=1.1)),
 (99.55, 'globo-espacial', -29, dict(rate=1.6)),                   # lata girando
 (100.60, 'riser-tensao', -25, dict(ss=2.6)),
 (100.60, 'teleporte-zap-vacuo', -18, {}),
 (100.70, 'hit-final', -12, {}),                                   # FINAL HIT (cauda ate 102)
]

# automacao da trilha: (t, dB) interpolado linearmente; soma ao ganho base
MUSIC_AUTO = [
 (0.0, 5), (8.5, 5), (9.5, 0),          # intro do bed e quieta: sobe
 (36.0, 0), (39.4, -3), (39.75, -14),   # respira antes do estalo
 (40.6, -14), (41.8, 3), (46.0, 3),     # (o bed ja cai sozinho 39-46)
 (47.5, -3), (60.0, -4), (69.4, -1),    # 48 s: bed fica bem mais alto -> compensa; sobe ate o empate
 (69.65, -16), (70.6, -16), (71.3, -2), # silencio do "Empate."
 (72.5, -4), (83.4, -4), (86.3, 0),     # parte C pensando; build
 (86.6, -16), (87.4, -16), (88.3, -2),  # buraco no estalo
 (92.0, -1), (97.0, 1), (100.6, 2), (101.0, -30), (DUR, -30),
]


def stem_path(n):
    p = f'{SFX}/ep01/{n}.mp3'
    return p if os.path.exists(p) else f'{SFX}/{n}.mp3'


def dur_of(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                 '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


def measure(p):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', p, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    s = r[r.rfind('Summary:'):]
    I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1))
    TP = float(re.search(r'Peak:\s+(-?[\d.inf]+) dBFS', s).group(1))
    LRA = float(re.search(r'LRA:\s+(-?[\d.]+) LU', s).group(1))
    return I, TP, LRA


def auto_expr(pts):
    """expressao piecewise-linear em dB para o filtro volume"""
    e = f'{pts[-1][1]}'
    for (t0, d0), (t1, d1) in reversed(list(zip(pts[:-1], pts[1:]))):
        if t1 <= t0:
            continue
        e = f'if(lt(t,{t1}),{d0}+({d1}-({d0}))*(t-{t0})/{t1 - t0:.4f},{e})'
    return f"pow(10,({e})/20)"


def run(args):
    subprocess.run(args, check=True)


def main():
    tmp = tempfile.mkdtemp(prefix='mix_ep01_')
    events = sorted(EV + cut_events(), key=lambda e: e[0])

    # ---- 1) voz processada
    vraw = f'{tmp}/voice_raw.wav'
    run(['ffmpeg', '-y', '-v', 'error', '-i', VOICE, '-af',
         'aresample=48000,highpass=f=70,acompressor=threshold=-24dB:ratio=3:attack=5:release=90:makeup=2',
         '-ac', '2', '-c:a', 'pcm_f32le', vraw])
    vI, _, _ = measure(vraw)
    vgain = VOICE_LUFS - vI
    voice = f'{tmp}/voice.wav'
    run(['ffmpeg', '-y', '-v', 'error', '-i', vraw, '-af', f'volume={vgain:.2f}dB,apad,atrim=0:{DUR}',
         '-c:a', 'pcm_f32le', voice])
    print(f'voz: {vI:.1f} LUFS -> {VOICE_LUFS} (ganho {vgain:+.1f} dB)')

    # ---- 2) pre-mix (voz + trilha duckada + bus SFX duckado)
    inputs, idx = [], {}
    def inp(path, loop=False):
        k = (path, loop)
        if k not in idx:
            idx[k] = len(inputs)
            inputs.append(k)
        return idx[k]
    iv = inp(voice)
    im = inp(stem_path('musica-bed-ep01'))
    uses = {}
    plan = []
    for t, n, tg, o in events:
        p = stem_path(n)
        need = o.get('ss', 0) + o.get('dur', 0)
        loop = need > dur_of(p) - 0.05 if 'dur' in o else False
        k = inp(p, loop)
        uses.setdefault(k, []).append(len(plan))
        plan.append((k, t, n, tg, o))

    fc = []
    labels = {}
    for k, lst in uses.items():
        outs = ''.join(f'[s{j}]' for j in lst)
        fc.append(f'[{k}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,asplit={len(lst)}{outs}')
    sfx_labels = []
    for j, (k, t, n, tg, o) in enumerate(plan):
        rate = o.get('rate', 1.0)
        f = []
        if o.get('rev'):
            f.append('areverse')
        if rate != 1.0:
            f.append(f'asetrate={48000 * rate:.0f},aresample=48000')
        ss = o.get('ss', 0)
        if 'dur' in o or ss:
            f.append(f'atrim=start={ss / rate:.3f}' + (f':end={(ss / rate) + o["dur"]:.3f}' if 'dur' in o else ''))
            f.append('asetpts=N/SR/TB')
        if o.get('hp'): f.append(f'highpass=f={o["hp"]}')
        if o.get('lp'): f.append(f'lowpass=f={o["lp"]}')
        f.append(f'volume={tg - M[n]:.2f}dB')
        if o.get('fi'): f.append(f'afade=t=in:d={o["fi"]}')
        if o.get('fo'):
            d = o.get('dur')
            if d is None:
                d = dur_of(stem_path(n)) / rate - ss / rate
            f.append(f'afade=t=out:st={max(0, d - o["fo"]):.3f}:d={o["fo"]}')
        if o.get('pan'):
            pn = o['pan']
            f.append(f'pan=stereo|c0={min(1, 1 - pn):.2f}*c0|c1={min(1, 1 + pn):.2f}*c1')
        anchor = o.get('anchor', ANCHOR.get(n, 0.0)) - ss
        start = t - anchor / rate
        if start < 0:  # comeca antes de 0: corta o inicio
            f.append(f'atrim=start={-start:.3f},asetpts=N/SR/TB')
            start = 0
        ms = int(round(start * 1000))
        f.append(f'adelay={ms}|{ms}')
        fc.append(f'[s{j}]' + ','.join(f) + f'[e{j}]')
        sfx_labels.append(f'[e{j}]')
    fc.append(''.join(sfx_labels) + f'amix=inputs={len(sfx_labels)}:normalize=0:duration=longest,apad,atrim=0:{DUR}[sfx]')
    fc.append(f'[{im}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,'
              f'volume={MUSIC_BASE - M["musica-bed-ep01"]:.2f}dB,volume=\'{auto_expr(MUSIC_AUTO)}\':eval=frame,'
              f'apad,atrim=0:{DUR}[mus]')
    fc.append(f'[{iv}:a]asplit=3[v][k1][k2]')
    # trilha: ducking forte; SFX: ducking leve (so p/ nao mascarar palavras)
    fc.append('[mus][k1]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=400:knee=4[mduck]')
    fc.append('[sfx][k2]sidechaincompress=threshold=0.05:ratio=2:attack=5:release=250:knee=4[sduck]')
    fc.append('[v][mduck][sduck]amix=inputs=3:normalize=0:duration=first[pre]')
    solo = os.environ.get('MIX_SOLO')  # debug: 'v', 'mduck' ou 'sduck' -> pre.wav so com esse bus
    if solo:
        fc[-1] = ';'.join([f'[{b}]anullsink' for b in ['v', 'mduck', 'sduck'] if b != solo] + [f'[{solo}]anull[pre]'])
    pre = f'{tmp}/pre.wav'
    args = ['ffmpeg', '-y', '-v', 'error']
    for path, loop in inputs:
        if loop:
            args += ['-stream_loop', '-1']
        args += ['-i', path]
    script = f'{tmp}/graph.txt'
    open(script, 'w').write(';\n'.join(fc))
    args += ['-filter_complex_script', script, '-map', '[pre]', '-t', str(DUR), '-c:a', 'pcm_f32le', pre]
    run(args)
    pI, pTP, _ = measure(pre)
    if solo:
        shutil.copy(pre, OUT); print('solo', solo, pI, pTP); return
    print(f'pre-mix: {pI:.1f} LUFS, TP {pTP:.1f}; {len(plan)} eventos SFX')

    # ---- 3) master: ganho + limiter (oversampled p/ true peak) ; itera ate bater -14
    gain = TARGET_LUFS - pI + 0.2
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    for it in range(4):
        run(['ffmpeg', '-y', '-v', 'error', '-i', pre, '-af',
             f'volume={gain:.2f}dB,aresample=192000,'
             f'alimiter=limit={10 ** ((TP_MAX - 0.4) / 20):.4f}:attack=1:release=80:level=disabled,'
             f'aresample=48000,afade=t=out:st={DUR - 0.45}:d=0.45,apad,atrim=0:{DUR}',
             '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', OUT])
        I, TP, LRA = measure(OUT)
        print(f'master it{it}: ganho {gain:+.2f} dB -> {I:.1f} LUFS, TP {TP:.1f} dBTP, LRA {LRA}')
        if abs(I - TARGET_LUFS) <= 0.3 and TP <= TP_MAX:
            break
        gain += TARGET_LUFS - I
    os.makedirs(os.path.dirname(PUBLIC), exist_ok=True)
    if os.path.abspath(OUT) != PUBLIC:
        shutil.copy(OUT, PUBLIC)
    print('ok:', OUT, 'dur', dur_of(OUT))
    shutil.rmtree(tmp)


if __name__ == '__main__':
    main()
