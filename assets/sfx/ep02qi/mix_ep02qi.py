#!/usr/bin/env python3
"""Mix final do EP02 "QI Infinito" (79,29 s, 48 kHz estereo, -14 LUFS, TP <= -1 dBTP).

Uso:  python3 mix_ep02qi.py [saida.wav]
      (padrao: video-engine/public/ep02qi/mix.wav, copiado tambem para video-engine/out/ep02qi/mix.wav)

Mesmo esquema do mix_ep01.py:
  voz    -> highpass + comp 3:1 + ganho p/ VOICE_LUFS                     (sempre por cima)
  trilha -> ganho base + automacao (MUSIC_AUTO) -> sidechaincompress (chave = voz, forte)
  SFX    -> cada evento com ganho = alvo - LUFS medido do stem -> bus -> sidechaincompress (leve)
  soma   -> ganho master (itera p/ -14 LUFS) -> alimiter em 192 kHz (true peak) -> 79,29 s

Diferenca: o LUFS de cada stem e medido na hora (nao precisa tabela), e alguns sons simples
(bips de alarme, sirene, ding, tique, teremim, power-down, flatline) sao sintetizados aqui
mesmo (synth-*.mp3) para economizar creditos.

Cada evento de EV: (t, stem, alvo_LUFS, opcoes)
  t      = instante (s) em que o ponto de sincronia do stem cai
  anchor = ponto de sincronia dentro do stem (s); padrao = ANCHOR[stem] ou 0
  ss / dur = pula o comeco / corta depois de dur s;  fi / fo = fades;  rate = varispeed
  pan = -1..1;  lp / hp = filtros;  rev = invertido
"""
import os, re, shutil, subprocess, sys, tempfile

ROOT = '/home/user/V-deos-de-Ia'
SFX = ROOT + '/assets/sfx'
HERE = SFX + '/ep02qi'
VOICE = ROOT + '/video-engine/public/ep02qi/narracao.mp3'
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT + '/video-engine/public/ep02qi/mix.wav'
COPY = ROOT + '/video-engine/out/ep02qi/mix.wav'
DUR = 79.29
TARGET_LUFS = -14.0
TP_MAX = -1.0
VOICE_LUFS = -15.0
MUSIC_STEM = 'musica-bed-ep02qi'
MUSIC_BASE = -21.0            # trilha leve e constante (ducking tira mais uns dB sob a voz)

# ---------------------------------------------------------------- sons sintetizados (aevalsrc)
SYNTH = {
    # bip de alarme (quadrada suave 1,4 kHz, 140 ms)
    'synth-alarme-bip': ('0.6*sgn(sin(2*PI*1400*t))*0.5+0.3*sin(2*PI*2800*t)', 0.14),
    # sirene (sobe/desce 650<->1300 Hz, 2 ciclos/s)
    'synth-sirene': ('0.5*sin(2*PI*(975*t-325/(2*PI*2)*cos(2*PI*2*t)))', 1.6),
    # ding/sino (parcial 1760 + 2640, decaimento exp)
    'synth-ding': ('(0.6*sin(2*PI*1760*t)+0.25*sin(2*PI*2640*t)+0.15*sin(2*PI*3520*t))*exp(-5*t)', 0.9),
    # tique (clique curto)
    'synth-tique': ('0.8*sin(2*PI*2200*t)*exp(-180*t)', 0.06),
    # teremim "woo-oo" (glide + vibrato)
    'synth-teremim': ('0.5*sin(2*PI*(600*t+150*t*t-40*t*t*t)+3*sin(2*PI*6*t))*min(1,t*8)*min(1,(1.3-t)*5)', 1.3),
    # power down (800 -> 60 Hz)
    'synth-powerdown': ('0.6*sin(2*PI*(800*t-620*t*t))*min(1,(0.65-t)*8)', 0.65),
    # flatline de monitor (1 kHz continuo)
    'synth-flatline': ('0.4*sin(2*PI*1000*t)*min(1,t*50)*min(1,(1.0-t)*10)', 1.0),
    # "fiuuu" murchando (1100 -> 350 Hz)
    'synth-fiuu': ('0.5*sin(2*PI*(1100*t-625*t*t))*min(1,t*20)*min(1,(0.6-t)*6)', 0.6),
}

# ponto de sincronia (transiente principal) dos stems, em s
ANCHOR = {'carimbo': 0.33, 'hit-final': 0.92, 'lata-metal': 0.23, 'muro-crunch': 0.3,
          'swish-suave': 0.24, 'dossie-papel': 0.47, 'cama-molas': 0.21, 'globo-espacial': 0.18,
          'whoosh-corte-a': 0.06, 'whoosh-corte-b': 0.06, 'estalo-trovao': 0.05,
          'teleporte-zap-vacuo': 0.12,
          # ep02qi
          'catraca-clank': 0.09, 'carta-tapa': 0.02, 'gato-miau': 0.1, 'estrelinhas-tilintando': 0.05,
          'porta-trem-fecha': 1.77, 'glitch-erro-buzz': 0.02}

# ---------------------------------------------------------------- cortes (= inicio dos planos)
CUTS = [1.57, 2.66, 3.64, 5.95, 6.9, 8.57, 9.62, 10.66, 12.27, 13.34, 14.63, 15.45, 16.58, 17.98,
        19.04, 20.2, 20.92, 22.05, 23.32, 24.57, 25.78, 26.64, 27.58, 28.8, 30.04, 31.44, 32.34,
        33.0, 34.12, 34.95, 36.58, 37.28, 38.63, 39.46, 40.33, 41.22, 42.14, 43.25, 44.07, 45.15,
        46.55, 47.71, 48.86, 49.71, 50.65, 51.69, 53.2, 54.16, 55.69, 57.19, 58.7, 59.78, 60.45,
        61.48, 62.7, 63.75, 65.03, 66.29, 67.18, 68.34, 69.93, 70.96, 71.86, 72.74, 73.8, 74.75,
        75.62, 77.13]
# cortes sem whoosh: ha hit/stamp/efeito proprio no mesmo instante, ou corte pra silencio
CUT_SKIP = {20.2, 22.05, 28.8, 33.0, 34.12, 38.63, 40.33, 44.07, 48.86, 49.71, 54.16, 55.69,
            60.45, 62.7, 69.93, 75.62}
CUT_STEMS = ['whoosh-corte-a', 'swish-suave', 'whoosh-corte-b']
CUT_RATE = [1.0, 0.86, 1.12, 0.93, 1.2, 0.8, 1.06]
CUT_LVL = [-34, -32, -35, -33, -36]
CUT_PAN = [-0.35, 0.3, 0.0, 0.4, -0.2]


def cut_events():
    ev = []
    for i, t in enumerate(CUTS):
        if t in CUT_SKIP:
            continue
        ev.append((t, CUT_STEMS[i % 3], CUT_LVL[i % 5],
                   dict(rate=CUT_RATE[i % 7], pan=CUT_PAN[i % 5], hp=200)))
    return ev


def seq(t0, step, n, stem, lvl, rates=None, **o):
    """n repeticoes espacadas (cascata de bips etc.)"""
    out = []
    for i in range(n):
        d = dict(o)
        if rates:
            d['rate'] = rates[i % len(rates)]
        out.append((round(t0 + i * step, 3), stem, lvl, d))
    return out


# ---------------------------------------------------------------- cue list (shots.json partA/partB)
EV = [
 # ===== L1 abertura: fuga no metro
 (0.00,  'metro-estacao-amb', -27, dict(dur=3.66, fi=0.05, fo=0.5)),
 (0.00,  'passos-sapato', -27, dict(ss=0.5, dur=1.5, rate=1.3, fo=0.3)),   # corrida
 (0.22,  'synth-ding', -29, dict(rate=0.8)),                               # chime do PA (2 notas)
 (0.48,  'synth-ding', -29, dict(rate=0.63)),
 (0.92,  'estrelinhas-tilintando', -24, dict(rate=1.2, dur=0.8, fo=0.4)),  # bling do infinito
 (0.92,  'synth-ding', -25, dict(rate=1.5)),
 (1.95,  'catraca-clank', -20, {}),                                        # catraca
 (2.30,  'passos-sapato', -28, dict(ss=1.6, dur=0.3, fo=0.1)),             # aterrissa
 (2.66,  'passos-sapato', -25, dict(ss=0.5, rate=0.85, dur=1.0, fo=0.3)),  # sapatos dos agentes
 *seq(2.75, 0.13, 4, 'hud-blip', -31, rates=[1.0, 1.1, 1.2, 1.3]),
 (3.64,  'metro-estacao-amb', -24, dict(ss=1.0, dur=0.72, fi=0.15, fo=0.05)),  # trem passando
 (4.34,  'record-scratch', -16, {}),                                       # FREEZE "Spoiler"
 (4.36,  'tensao-hit', -22, dict(rate=1.5, dur=0.6, fo=0.3)),
 (5.40,  'carimbo', -16, {}),                                              # carimbo THUD
 (5.50,  'synth-ding', -24, {}),
 # ===== L2 sabe antes
 (5.95,  'teleporte-zap-vacuo', -28, dict(rate=0.8, lp=3000, fi=0.1)),     # hum eletrico
 (6.20,  'lock-on-tom', -27, {}),
 (6.90,  'vento-queda', -28, dict(rate=0.7, anchor=0.6, fo=0.5)),          # slow-mo
 *seq(7.34, 0.16, 3, 'synth-tique', -27),
 # ===== L3 nao e telepatia
 (8.57,  'synth-teremim', -24, {}),
 (9.30,  'glitch-erro-buzz', -24, dict(ss=0.3, dur=0.6, fo=0.2)),          # buzzer "errado"
 (9.30,  'swish-suave', -27, dict(rate=1.4)),                              # risco de caneta
 (9.62,  'dossie-papel', -28, {}),                                         # giz
 *seq(9.90, 0.25, 2, 'tablet-beep', -29, rates=[1.3, 1.5]),
 (10.66, 'scan-eletronico', -28, {}),                                      # raio-x
 (10.78, 'cronometro', -29, dict(rate=1.5, dur=0.66, fo=0.1)),            # contando 1..43
 (11.44, 'synth-ding', -22, {}),
 (12.27, 'hud-blip', -27, dict(rate=0.6)),                                 # pop pensamento
 (12.77, 'boing-comico', -24, dict(rate=1.4, dur=0.5, fo=0.2)),            # tique do rosto
 (13.34, 'cronometro', -29, dict(rate=0.8, dur=0.6, fo=0.15)),             # projetor
 (13.97, 'swish-suave', -29, dict(rate=1.6)),
 (14.15, 'synth-tique', -25, {}),
 (14.63, 'hud-blip', -28, {}),
 (15.45, 'dossie-papel', -26, {}),
 (15.92, 'carimbo', -21, {}),
 # ===== L4 Davi ve todas / Xavier
 (16.58, 'metro-estacao-amb', -29, dict(ss=4.0, dur=1.4, fi=0.2, fo=0.4)),
 *seq(16.90, 0.1, 6, 'hud-blip', -31, rates=[1.0, 1.15, 1.3, 1.1, 1.4, 1.25]),
 (17.98, 'teleporte-zap-vacuo', -25, dict(rate=0.6, lp=2500)),             # drone sci-fi
 (19.04, 'teleporte-zap-vacuo', -24, dict(rate=1.2)),                      # buzz subindo
 (19.60, 'estalo-trovao', -27, dict(dur=0.5, fo=0.3, hp=2000)),            # faiscas
 (20.20, 'carimbo', -15, {}),                                              # AMADOR
 (20.25, 'tensao-hit', -22, dict(rate=0.6, dur=0.7, fo=0.3)),              # bwomp
 (20.92, 'boing-comico', -24, {}),                                         # shrug
 (21.30, 'vapor-chiado', -27, dict(ss=1.5, dur=0.8, fo=0.4)),              # fusivel pfff
 (21.30, 'hud-blip', -28, dict(rate=0.5)),
 # ===== L5 flashback Natal
 (22.05, 'record-scratch', -22, dict(rev=True)),                           # rewind
 (22.20, 'estrelinhas-tilintando', -27, dict(rate=0.8)),                   # sininhos
 (23.32, 'synth-ding', -27, dict(rate=0.7)),
 (24.00, 'boing-comico', -28, dict(rate=1.8, dur=0.4, fo=0.15)),           # squint
 (25.11, 'hud-blip', -27, dict(rate=0.45)),                                # glup
 (25.78, 'scan-eletronico', -28, dict(rate=1.2, dur=0.6, fo=0.2)),
 (25.80, 'cronometro', -30, dict(rate=1.6, dur=0.7, fo=0.1)),
 (26.52, 'glitch-erro-buzz', -20, dict(ss=0.3, dur=0.5, fo=0.15)),         # bzzt detector
 (26.89, 'trombone-triste', -19, dict(dur=1.0, fo=0.4)),                   # MENTIRA 94%
 # ===== L6 truco / churrasco
 (27.58, 'dossie-papel', -27, dict(rate=1.3)),                             # embaralha
 (27.58, 'amb-calcadao-ondas-multidao', -32, dict(ss=1.0, dur=1.2, fi=0.2, fo=0.3)),
 *seq(28.05, 0.12, 4, 'synth-ding', -29, rates=[1.2, 1.35, 1.5, 1.7]),
 (28.80, 'carta-tapa', -15, {}),                                           # TRUCO slap
 (28.82, 'tensao-hit', -23, dict(rate=1.3, dur=0.5, fo=0.25)),
 (29.10, 'amb-calcadao-ondas-multidao', -27, dict(ss=2.0, dur=0.9, fi=0.05, fo=0.3)),  # tios "aaah"
 (29.20, 'dossie-papel', -28, dict(rate=1.2)),                             # cartas voando
 (30.04, 'vapor-chiado', -30, dict(ss=1.0, dur=1.3, fi=0.2, fo=0.4, lp=5000)),  # churrasqueira
 (30.71, 'lata-metal', -25, {}),                                           # placa
 (30.75, 'tensao-hit', -24, dict(rate=0.55, dur=0.7, fo=0.3)),             # womp
 # ===== L7 cassino
 (31.44, 'cassino-amb', -24, dict(ss=2.5, dur=0.9, fi=0.05, fo=0.2)),
 (32.34, 'swish-suave', -26, dict(rate=0.8, pan=-0.4)),
 (32.50, 'swish-suave', -27, dict(rate=0.9, pan=0.4)),
 (33.00, 'muro-crunch', -21, dict(dur=0.5, fo=0.3)),                       # porta + baque
 (33.10, 'carimbo', -18, {}),                                              # BANIDO x3
 (33.38, 'carimbo', -17, dict(rate=0.95)),
 (33.66, 'carimbo', -16, dict(rate=0.9)),
 # ===== L8 o problema: esquenta
 (34.12, 'tablet-beep', -24, dict(rate=0.5)),                              # warning bwoop
 (34.95, 'scan-eletronico', -28, dict(rate=0.7)),
 (35.51, 'vapor-chiado', -28, dict(dur=1.0, fi=0.5, fo=0.3)),
 (36.58, 'hud-blip', -28, {}),
 (37.28, 'cronometro', -30, dict(rate=1.2, dur=0.7, fo=0.1)),
 (38.03, 'synth-ding', -25, {}),
 *seq(38.63, 0.05, 10, 'hud-blip', -30, rates=[1.0, 1.3, 0.9, 1.5, 1.1, 1.4, 1.2, 0.95, 1.6, 1.05]),
 (38.63, 'amb-calcadao-ondas-multidao', -22, dict(dur=1.7, fi=0.1, fo=0.3)),   # multidao
 (38.90, 'synth-sirene', -24, dict(dur=1.4, fo=0.2)),
 (39.46, 'vapor-chiado', -20, dict(dur=0.9, fo=0.2)),                      # chaleira
 *seq(39.80, 0.15, 3, 'synth-alarme-bip', -21),
 (40.33, 'whoosh-corte-a', -25, {}),                                       # punch-in
 (40.66, 'estrelinhas-tilintando', -25, dict(rate=1.4, dur=0.6, fo=0.3)),  # piscada
 # ===== parte B: salinha
 (41.22, 'teleporte-zap-vacuo', -31, dict(rate=0.6, lp=1500, dur=0.9, fo=0.3)),  # lampada
 (41.52, 'cama-molas', -28, dict(rate=0.7)),                               # rangido do fio
 (42.14, 'dossie-papel', -26, {}),
 (42.69, 'boing-comico', -24, dict(rate=0.8)),                             # paredes
 *seq(43.25, 0.13, 2, 'synth-tique', -26),                                 # tsc-tsc
 *seq(43.43, 0.17, 3, 'swish-suave', -30, rates=[1.5, 1.6, 1.7]),
 (44.07, 'muro-crunch', -22, dict(dur=0.4, fo=0.2)),                       # porta batendo
 (44.22, 'whoosh-corte-b', -25, {}),
 (44.92, 'globo-espacial', -25, dict(rate=1.2)),                           # whip
 # ===== catracas / leituras
 (45.15, 'metro-estacao-amb', -29, dict(ss=2.0, dur=3.7, fi=0.3, fo=0.4)),
 (45.35, 'hud-blip', -27, dict(rate=1.2)),
 (45.90, 'swish-suave', -27, dict(rate=1.1)),
 (46.01, 'catraca-clank', -21, {}),
 (46.73, 'hud-blip', -27, dict(rate=1.2)),
 (46.95, 'hud-blip', -26, dict(rate=0.45)),                                # glup
 (47.81, 'hud-blip', -27, dict(rate=1.2)),
 (48.31, 'passos-sapato', -26, dict(ss=0.5, rate=0.8, dur=0.5, fo=0.15)),
 (48.76, 'swish-suave', -27, dict(rate=0.6)),                              # pe enroscando
 (48.94, 'faceplant-plaft', -14, {}),                                      # TROPECOU
 (48.95, 'tensao-hit', -22, dict(rate=0.8, dur=0.8, fo=0.4)),
 (49.16, 'estrelinhas-tilintando', -23, {}),
 # ===== chefe botox
 (49.71, 'vento-queda', -27, dict(rate=0.6, anchor=0.6, fo=0.6)),
 (49.81, 'passos-sapato', -27, dict(ss=0.5, rate=0.6, dur=0.9, fo=0.3)),
 (50.75, 'scan-eletronico', -27, {}),
 (51.35, 'tablet-beep', -25, dict(rate=0.6)),                              # bip negativo
 (51.69, 'carimbo', -18, {}),                                              # BOTOX
 (52.34, 'synth-powerdown', -25, {}),
 (53.20, 'synth-flatline', -29, {}),
 (54.46, 'glitch-erro-buzz', -15, {}),                                     # LEITURA 0%
 (54.48, 'tensao-hit', -22, dict(rate=1.2, dur=0.6, fo=0.3)),
 # ===== multidao / calor
 (55.79, 'whoosh-corte-a', -24, dict(rate=0.9)),
 (56.54, 'amb-calcadao-ondas-multidao', -25, dict(dur=0.7, fi=0.2, fo=0.1)),
 *seq(57.19, 0.035, 14, 'hud-blip', -32, rates=[1.0, 1.3, 0.85, 1.5, 1.15, 1.7, 0.95]),
 (57.59, 'amb-calcadao-ondas-multidao', -22, dict(ss=1.0, dur=3.9, fi=0.1, fo=0.4)),
 *seq(58.70, 0.40, 2, 'synth-alarme-bip', -24),                            # 39 graus
 (59.00, 'vapor-chiado', -27, dict(dur=0.8, fo=0.3)),
 *seq(59.78, 0.15, 4, 'synth-alarme-bip', -22, rates=[1.0, 1.0, 1.06, 1.06]),  # 40
 (60.45, 'synth-sirene', -19, dict(dur=1.0, fo=0.1)),                      # 41 sirene
 (60.45, 'synth-alarme-bip', -20, dict(rate=1.12)),
 (60.95, 'vapor-chiado', -24, dict(ss=1.4, dur=0.5, fo=0.2)),
 # ===== saida pelo buraco
 (61.48, 'synth-ding', -22, dict(rate=0.8)),                               # insight
 (61.48, 'estrelinhas-tilintando', -27, {}),
 (62.08, 'globo-espacial', -25, {}),
 (62.70, 'whoosh-corte-b', -24, dict(rate=1.2)),
 (63.20, 'swish-suave', -25, {}),
 (65.53, 'porta-trem-fecha', -17, {}),                                     # bip-bip ... PORTA FECHA
 (64.35, 'synth-tique', -27, {}),
 (65.78, 'janela-vidro-tremendo', -24, dict(dur=0.6, fo=0.3)),             # tapa no vidro
 (66.29, 'metro-estacao-amb', -25, dict(ss=0.8, dur=1.0, fo=0.5)),         # trem partindo
 (66.59, 'vento-queda', -28, dict(anchor=0.6, fo=0.5)),
 # ===== chefe sem cara de bravo
 (67.28, 'cama-molas', -27, dict(rate=0.6)),                               # hnnng
 (67.78, 'janela-vidro-tremendo', -31, dict(dur=0.5, fo=0.2)),
 (68.44, 'boing-comico', -24, dict(rate=0.7)),                             # veia
 (69.04, 'synth-fiuu', -26, {}),                                           # murcha
 (69.39, 'trombone-triste', -16, dict(dur=1.4, fo=0.45)),                  # NAO CONSEGUIU
 # ===== casa / gato
 (69.93, 'carro-interior-noite', -31, dict(dur=2.8, fi=0.3, fo=0.5, lp=1500)),  # ventilador
 (71.06, 'hud-blip', -27, dict(rate=0.45)),                                # gole
 *seq(71.86, 0.2, 3, 'synth-ding', -26, rates=[1.3, 1.45, 1.6]),           # checks
 *seq(71.86, 0.2, 3, 'synth-tique', -28),
 (72.99, 'gato-miau', -18, {}),
 (73.24, 'stinger-empate', -24, dict(dur=0.8, fo=0.4)),
 (73.85, 'glitch-erro-buzz', -16, {}),                                     # GATO: ERRO
 (74.20, 'tablet-beep', -23, dict(rate=0.5)),
  (74.90, 'dossie-papel', -27, dict(rate=0.6, dur=0.55, fo=0.2)),                            # copo arrastando
 (75.20, 'swish-suave', -27, {}),
  (75.42, 'vidro-quebrando', -15, dict(dur=0.32, fo=0.15)),                                     # VIDRO
 (76.57, 'swish-suave', -31, dict(rate=0.5)),                              # suspiro
 (77.48, 'synth-ding', -27, dict(rate=1.6)),                               # plim
 (78.20, 'tensao-hit', -19, {}),                                           # corte pro preto
]

# automacao da trilha: (t, dB) interpolado linearmente; soma ao ganho base
MUSIC_AUTO = [
 (0.0, 0), (4.36, 0), (4.40, -24), (5.90, -24), (5.95, 0),     # freeze "Spoiler": musica para
 (34.08, 0), (34.14, -20), (34.85, -20), (35.3, -3),          # "O problema:" drop
 (38.5, -3), (39.0, 0), (41.1, 0),
 (57.0, 0), (60.4, 1), (61.4, 1), (61.6, -2),                 # sobe com o calor
 (69.88, -2), (69.95, -22), (70.9, -22), (71.86, -1),         # corte pra silencio (casa)
 (78.17, -1), (78.21, -60), (DUR, -60),                       # corte seco pro preto
]


def stem_path(n):
    for d in (HERE, SFX + '/ep01', SFX):
        p = f'{d}/{n}.mp3'
        if os.path.exists(p):
            return p
    raise FileNotFoundError(n)


def make_synth():
    for n, (expr, d) in SYNTH.items():
        p = f'{HERE}/{n}.mp3'
        if not os.path.exists(p):
            run(['ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i',
                 f"aevalsrc='{expr}':s=48000:d={d}", '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k', p])


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


_LUFS = {}
def stem_lufs(n):
    """LUFS integrado do stem (stems curtos < 0,4 s: repete o arquivo p/ o medidor funcionar)"""
    if n not in _LUFS:
        p = stem_path(n)
        if dur_of(p) < 0.5:
            r = subprocess.run(['ffmpeg', '-nostats', '-stream_loop', '9', '-i', p, '-af', 'ebur128',
                                '-f', 'null', '-'], capture_output=True, text=True).stderr
            s = r[r.rfind('Summary:'):]
            _LUFS[n] = float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1))
        else:
            _LUFS[n] = measure(p)[0]
    return _LUFS[n]


def auto_expr(pts):
    e = f'{pts[-1][1]}'
    for (t0, d0), (t1, d1) in reversed(list(zip(pts[:-1], pts[1:]))):
        if t1 <= t0:
            continue
        e = f'if(lt(t,{t1}),{d0}+({d1}-({d0}))*(t-{t0})/{t1 - t0:.4f},{e})'
    return f"pow(10,({e})/20)"


def run(args):
    subprocess.run(args, check=True)


def main():
    make_synth()
    tmp = tempfile.mkdtemp(prefix='mix_ep02qi_')
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

    # ---- 2) pre-mix
    inputs, idx = [], {}
    def inp(path, loop=False):
        k = (path, loop)
        if k not in idx:
            idx[k] = len(inputs)
            inputs.append(k)
        return idx[k]
    iv = inp(voice)
    im = inp(stem_path(MUSIC_STEM))
    uses, plan = {}, []
    for t, n, tg, o in events:
        p = stem_path(n)
        need = o.get('ss', 0) + o.get('dur', 0)
        loop = need > dur_of(p) - 0.05 if 'dur' in o else False
        k = inp(p, loop)
        uses.setdefault(k, []).append(len(plan))
        plan.append((k, t, n, tg, o))

    fc = []
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
        f.append(f'volume={tg - stem_lufs(n):.2f}dB')
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
        if start < 0:
            f.append(f'atrim=start={-start:.3f},asetpts=N/SR/TB')
            start = 0
        ms = int(round(start * 1000))
        f.append(f'adelay={ms}|{ms}')
        fc.append(f'[s{j}]' + ','.join(f) + f'[e{j}]')
        sfx_labels.append(f'[e{j}]')
    fc.append(''.join(sfx_labels) + f'amix=inputs={len(sfx_labels)}:normalize=0:duration=longest,apad,atrim=0:{DUR}[sfx]')
    fc.append(f'[{im}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,'
              f'volume={MUSIC_BASE - stem_lufs(MUSIC_STEM):.2f}dB,volume=\'{auto_expr(MUSIC_AUTO)}\':eval=frame,'
              f'apad,atrim=0:{DUR}[mus]')
    fc.append(f'[{iv}:a]asplit=3[v][k1][k2]')
    fc.append('[mus][k1]sidechaincompress=threshold=0.04:ratio=3:attack=15:release=350:knee=4[mduck]')
    fc.append('[sfx][k2]sidechaincompress=threshold=0.05:ratio=2:attack=5:release=250:knee=4[sduck]')
    fc.append('[v][mduck][sduck]amix=inputs=3:normalize=0:duration=first[pre]')
    solo = os.environ.get('MIX_SOLO')  # debug: 'v', 'mduck' ou 'sduck'
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

    # ---- 3) master
    gain = TARGET_LUFS - pI + 0.2
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    for it in range(4):
        run(['ffmpeg', '-y', '-v', 'error', '-i', pre, '-af',
             f'volume={gain:.2f}dB,aresample=192000,'
             f'alimiter=limit={10 ** ((TP_MAX - 0.4) / 20):.4f}:attack=1:release=80:level=disabled,'
             f'aresample=48000,afade=t=out:st={DUR - 0.4}:d=0.4,apad,atrim=0:{DUR}',
             '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', OUT])
        I, TP, LRA = measure(OUT)
        print(f'master it{it}: ganho {gain:+.2f} dB -> {I:.1f} LUFS, TP {TP:.1f} dBTP, LRA {LRA}')
        if abs(I - TARGET_LUFS) <= 0.3 and TP <= TP_MAX:
            break
        gain += TARGET_LUFS - I
    if os.path.abspath(OUT) != COPY:
        os.makedirs(os.path.dirname(COPY), exist_ok=True)
        shutil.copy(OUT, COPY)
    print('ok:', OUT, 'dur', dur_of(OUT))
    shutil.rmtree(tmp)


if __name__ == '__main__':
    main()
