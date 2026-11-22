#!/usr/bin/env python3
"""Mix final do EP04 "Ima Fraco" (79,48 s, 48 kHz estereo, -14 LUFS, TP <= -1 dBTP).

Uso:  python3 mix_ep04.py [saida.wav]
      (padrao: video-engine/public/ep04/mix.wav, copiado tambem para video-engine/out/ep04/mix.wav)

Mesmo esquema do mix_ep03.py:
  voz    -> highpass + comp 3:1 + ganho p/ VOICE_LUFS                     (sempre por cima)
  trilha -> musica-bed-ep02qi reaproveitada + automacao (MUSIC_AUTO) -> sidechaincompress (chave = voz)
  SFX    -> cada evento com ganho = alvo - LUFS medido do stem -> bus -> sidechaincompress (leve)
  soma   -> ganho master (itera p/ -14 LUFS) -> alimiter em 192 kHz (true peak) -> 79,48 s

Stems novos do EP04 (assets/sfx/ep04/): so 1 gerado no ElevenLabs (sapo-coaxar); uma 2a tentativa
(taco de aluminio) voltou praticamente muda e foi descartada -> TUNG sintetizado aqui.
O resto vem das bibliotecas ep01/ep02qi/ep03/raiz ou e sintetizado aqui (synth-*.mp3, custo zero):
zumbido magnetico, "zing" de clipe, BZZT da tarja, buzz de Lenz (pulsos 6 Hz), TUNG do taco, sininho
da porta, CLINK de corrente, bipes de erro, spin, derrapagem.

Cada evento de EV: (t, stem, alvo_LUFS, opcoes)
  t      = instante (s) em que o ponto de sincronia do stem cai
  anchor = ponto de sincronia dentro do stem (s); padrao = ANCHOR[stem] ou 0
  ss / dur = pula o comeco / corta depois de dur s;  fi / fo = fades;  rate = varispeed
  pan = -1..1;  lp / hp = filtros;  rev = invertido
"""
import os, re, shutil, subprocess, sys, tempfile

ROOT = '/home/user/V-deos-de-Ia'
SFX = ROOT + '/assets/sfx'
HERE = SFX + '/ep04'
VOICE = ROOT + '/video-engine/public/ep04/narracao.mp3'
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT + '/video-engine/public/ep04/mix.wav'
COPY = ROOT + '/video-engine/out/ep04/mix.wav'
DUR = 79.48
TARGET_LUFS = -14.0
TP_MAX = -1.0
VOICE_LUFS = -15.0
MUSIC_STEM = 'musica-bed-ep02qi'
MUSIC_BASE = -21.0
HARD_CUT = 78.60             # corte seco pro preto: silencio total depois

# ---------------------------------------------------------------- sons sintetizados
# (expr aevalsrc, dur)  ou  ('lavfi:<fonte>', dur, '<filtros>')  p/ ruido
SYNTH = {
    # zumbido magnetico: 60/120 Hz + brilho com batimento, swell
    'synth-mag-hum': ('0.4*(sin(2*PI*60*t)+0.6*sin(2*PI*120.7*t)+0.25*sin(2*PI*903*t)*(0.5+0.5*sin(2*PI*7*t)))*min(1,t*6)*min(1,(1.2-t)*4)', 1.2),
    # "zing" magnetico (objeto voando pra mao): varredura 500 -> 2600 Hz
    'synth-zing': ('0.45*(sin(2*PI*(500*t+5250*t*t))+0.3*sin(2*PI*(1000*t+10500*t*t)))*min(1,t*60)*min(1,(0.2-t)*25)', 0.2),
    # zumbido falhando (carro): 90 Hz serrilhado em pulsos irregulares, caindo
    'synth-hum-falha': ('0.45*(0.6*sgn(sin(2*PI*(90*t-12*t*t)))+0.4*sin(2*PI*180*t))*gt(sin(2*PI*11*t)+sin(2*PI*4.3*t),-0.4)*min(1,t*10)*min(1,(0.9-t)*4)', 0.9),
    # BZZT da tarja do cartao: ruido + 50 Hz quadrado, crepitando
    'synth-bzzt': ('lavfi:anoisesrc=c=white:a=0.5:r=48000', 0.55,
                   'highpass=f=1500,volume=\'0.3+0.7*gt(sin(2*PI*50*t),0.3)\':eval=frame,afade=t=in:d=0.01,afade=t=out:st=0.35:d=0.2'),
    # buzz da lei de Lenz: liga/desliga a 6 Hz (8 s), intensidade subindo
    'synth-lenz-buzz': ('0.5*(0.55*sgn(sin(2*PI*110*t))+0.3*sin(2*PI*220*t)+0.15*sin(2*PI*1650*t))*lt(mod(t,0.1667),0.095)*(0.65+0.35*t/8)*min(1,(8-t)*3)', 8.0),
    # TUNG do taco de aluminio: parciais inarmonicas com decaimento
    'synth-tung': ('(0.5*sin(2*PI*520*t)*exp(-3*t)+0.35*sin(2*PI*1412*t)*exp(-4.5*t)+0.25*sin(2*PI*2655*t)*exp(-7*t)+0.15*sin(2*PI*3920*t)*exp(-10*t))*min(1,t*900)', 1.5),
    # sininho da porta da lanchonete: 3 batidas rapidas
    'synth-sino-porta': ('(0.5*sin(2*PI*2093*t)+0.3*sin(2*PI*5230*t))*(exp(-6*t)+0.7*exp(-6*max(0,t-0.11))*gte(t,0.11)+0.5*exp(-6*max(0,t-0.24))*gte(t,0.24))*min(1,t*900)', 1.2),
    # CLINK de corrente/elo metalico
    'synth-clink': ('(0.5*sin(2*PI*3300*t)+0.35*sin(2*PI*4870*t)+0.25*sin(2*PI*6950*t))*exp(-22*t)*min(1,t*1500)', 0.3),
    # bipe de erro grave (caixa eletronico)
    'synth-biip-erro': ('0.4*(sgn(sin(2*PI*330*t))*0.6+0.4*sin(2*PI*660*t))*min(1,t*80)*min(1,(0.5-t)*30)', 0.5),
    # bipe duplo de erro da maquininha
    'synth-erro-duplo': ('0.4*(sgn(sin(2*PI*520*t))*0.5+0.5*sin(2*PI*1040*t))*lt(mod(t,0.2),0.13)*min(1,(0.4-t)*40)', 0.4),
    # bip de leitura (maquininha)
    'synth-bip-leitura': ('0.45*sin(2*PI*1975*t)*min(1,t*200)*min(1,(0.12-t)*60)', 0.12),
    # spin do taco girando: ruido passa-banda com AM 9 Hz (whup-whup)
    'synth-spin': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000', 0.95,
                   'bandpass=f=900:w=900,volume=\'0.1+0.9*pow(abs(sin(2*PI*4.5*t)),3)\':eval=frame,afade=t=in:d=0.1,afade=t=out:st=0.7:d=0.25'),
    # derrapagem da viatura
    'synth-derrapa': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000', 0.7,
                      'bandpass=f=2600:w=900,bandpass=f=2600:w=900,afade=t=in:d=0.05,afade=t=out:st=0.4:d=0.3'),
}
# reaproveitados (ja existem em ep02qi/ e ep03/)
OLD_SYNTH = ['synth-ding', 'synth-tique', 'synth-fiuu', 'synth-sirene', 'synth-ting', 'synth-chocalho',
             'synth-rabisco', 'synth-escudo-on', 'synth-vwomp', 'synth-afinador-sobe', 'synth-vibra-grave']

# ponto de sincronia (transiente principal) dos stems, em s
ANCHOR = {'carimbo': 0.33, 'hit-final': 0.92, 'lata-metal': 0.23, 'muro-crunch': 0.3,
          'swish-suave': 0.24, 'dossie-papel': 0.47, 'cama-molas': 0.21, 'globo-espacial': 0.18,
          'whoosh-corte-a': 0.06, 'whoosh-corte-b': 0.06, 'estalo-trovao': 0.05,
          'teleporte-zap-vacuo': 0.12,
          'catraca-clank': 0.09, 'carta-tapa': 0.02, 'gato-miau': 0.1, 'estrelinhas-tilintando': 0.05,
          'porta-trem-fecha': 1.77, 'glitch-erro-buzz': 0.02,
          'lama-schlorp': 0.33, 'risadas-turma': 0.05, 'arena-multidao-ruge': 0.1,
          'record-scratch': 0.05, 'tensao-hit': 0.05, 'trombone-triste': 0.0,
          # ep04
          'sapo-coaxar': 0.12, 'lata-parede-impacto': 0.06}

# ---------------------------------------------------------------- cortes (= inicio dos planos)
CUTS = [1.533, 2.728, 3.675, 5.23, 6.741, 7.913, 9.355, 9.976, 11.047, 11.779, 13.03, 14.067, 15.454,
        16.536, 18.227, 19.377, 20.504, 22.015, 23.265, 23.885, 25.091, 25.858, 27.076, 28.653, 29.453,
        31.133, 32.159, 33.162, 34.177, 35.123, 36.465, 37.795, 38.64, 39.598, 41.041, 42.63,
        43.882, 44.817, 45.843, 47.05, 47.906, 48.796, 49.811, 50.51, 51.874, 52.887, 54.161, 55.311,
        56.956, 58.061, 59.019, 59.944, 60.733, 62.198, 63.506, 64.655, 65.85, 66.717, 67.496, 68.623,
        69.717, 70.675, 71.7, 72.67, 73.481, 74.913, 75.792, 76.705, 77.471, 78.6]
# cortes sem whoosh: hit/efeito proprio no instante, dentro do buzz de Lenz, ou corte seco
CUT_SKIP = {3.675, 9.355, 22.015, 23.265, 23.885, 25.091, 36.465, 45.843, 50.51, 51.874, 54.161,
            55.311, 56.956, 58.061, 59.019, 59.944, 65.85, 66.717, 67.496, 68.623, 69.717, 71.7,
            72.67, 76.705, 78.6}
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
    """n repeticoes espacadas"""
    out = []
    for i in range(n):
        d = dict(o)
        if rates:
            d['rate'] = rates[i % len(rates)]
        out.append((round(t0 + i * step, 3), stem, lvl, d))
    return out


# ---------------------------------------------------------------- cue list (shots.json partA/partB)
EV = [
 # ===== L1 poder: controlar metal
 (0.00,  'synth-mag-hum', -27, dict(fi=0.15)),                                 # zumbido magnetico
 (0.00,  'globo-espacial', -30, dict(rate=0.8, fi=0.05)),                      # whoosh grave
 (1.116, 'tensao-hit', -21, dict(rate=1.3, dur=0.6, fo=0.3)),                  # HUD PODER
 (1.116, 'hud-blip', -23, {}),
 *seq(1.65, 0.16, 6, 'synth-clink', -33, rates=[1.0, 1.25, 0.85, 1.4, 1.1, 0.95], pan=0.2),  # orbitando
 (2.878, 'synth-zing', -27, dict(rate=1.1)),                                   # colher
 (3.10,  'lata-metal', -26, dict(rate=0.6, dur=0.5, fo=0.2)),                  # CLANK haltere
 (3.675, 'synth-zing', -24, {}),                                               # clipe
 (3.70,  'synth-tique', -24, dict(rate=1.2)),
 (4.12,  'synth-zing', -24, dict(rate=0.9)),                                   # chave
 (4.15,  'synth-clink', -24, dict(rate=0.8)),
 (4.55,  'synth-zing', -24, dict(rate=1.15)),                                  # moeda
 (4.58,  'synth-clink', -23, dict(rate=1.15)),
 (4.62,  'synth-ding', -29, dict(rate=1.3)),
 (5.388, 'carimbo', -19, {}),                                                  # CARRO 1.200 kg
 (5.90,  'synth-hum-falha', -24, {}),                                          # esforco / zumbido falhando
 (5.93,  'cama-molas', -27, dict(rate=0.5)),                                   # NNNGH (rangido)
 (6.30,  'synth-fiuu', -27, dict(rate=0.7)),                                   # desiste
 # ===== L2 efeito colateral
 (7.259, 'carimbo', -19, dict(rate=0.9)),                                      # EFEITO COLATERAL
 (7.30,  'synth-alarme-bip', -27, {}),
 (8.69,  'synth-bzzt', -21, {}),                                               # BZZT tarja
 (8.70,  'vapor-chiado', -29, dict(dur=0.5, fo=0.2, hp=1500)),
 (9.36,  'synth-biip-erro', -22, {}),                                          # ERRO caixa
 (9.40,  'glitch-erro-buzz', -23, dict(ss=0.3, dur=0.5, fo=0.15)),
 (9.976, 'dossie-papel', -26, dict(rate=0.8)),                                 # gaveta + cartoes
 *seq(10.05, 0.07, 6, 'carta-tapa', -31, rates=[1.4, 1.6, 1.3, 1.7, 1.5, 1.45]),
 (10.528, 'carimbo', -18, {}),                                                 # CARTOES PERDIDOS: 11
 (10.53, 'hud-blip', -24, dict(rate=0.9)),
 # ===== L3 magnetismo
 (11.10, 'synth-chocalho', -31, dict(hp=3000, dur=0.6, fo=0.2)),              # faiscas
 (11.10, 'synth-mag-hum', -31, dict(rate=1.2, dur=0.65, fo=0.2)),
 (11.779, 'dossie-papel', -27, {}),                                            # pagina
 (12.05, 'synth-ding', -26, {}),                                               # MAGNETISMO
 (14.067, 'synth-rabisco', -29, dict(rate=0.8)),                               # giz
 (14.879, 'synth-fiuu', -24, {}),                                              # bolinha cai
 (15.454, 'synth-zing', -27, {}),                                              # clipe 1 cm voa
 (15.50, 'synth-tique', -26, {}),
 (15.859, 'synth-tique', -33, dict(rate=0.8)),                                 # tic fraquinho
 (16.885, 'synth-fiuu', -27, dict(rate=0.8)),                                  # barras caindo
 (17.10, 'carimbo', -17, {}),                                                  # / 8
 (17.12, 'tensao-hit', -22, dict(rate=1.1, dur=0.5, fo=0.25)),
 *seq(18.30, 0.18, 5, 'synth-clink', -34, rates=[1.1, 0.9, 1.3, 1.0, 1.2], pan=-0.2),  # orbitando
 (19.40, 'synth-zing', -27, dict(rate=1.3)),                                   # clipe pula
 (19.883, 'synth-ding', -24, {}),                                              # PERTO ok
 # ===== L4 metais
 (20.60, 'synth-mag-hum', -31, dict(dur=1.0, fo=0.3)),                         # mao pairando
 (22.015, 'catraca-clank', -22, dict(rate=1.2)),                               # prego
 (22.409, 'catraca-clank', -22, dict(rate=1.35)),                              # moeda
 (22.781, 'catraca-clank', -21, dict(rate=1.1)),                               # tesoura
 (23.265, 'synth-ding', -21, {}),                                              # check
 (23.27, 'estrelinhas-tilintando', -28, dict(dur=0.6, fo=0.25)),
 (23.885, 'glitch-erro-buzz', -24, dict(ss=0.3, dur=0.35, fo=0.1)),            # X Al
 (24.584, 'glitch-erro-buzz', -24, dict(ss=0.3, dur=0.35, fo=0.1, rate=0.9)),  # X Cu
 (25.091, 'glitch-erro-buzz', -24, dict(ss=0.3, dur=0.35, fo=0.1, rate=0.8)),  # X Au
 (25.30, 'carimbo', -18, {}),                                                  # carimbo X
 (25.40, 'vapor-chiado', -30, dict(dur=0.5, fo=0.25)),                         # bufada
 # ===== L5 diamagnetismo
 (25.858, 'dossie-papel', -28, dict(rate=1.1)),                                # pagina
 (26.602, 'synth-ding', -18, {}),                                              # LAMPADA
 (26.62, 'estrelinhas-tilintando', -27, dict(dur=0.8, fo=0.3)),
 (27.076, 'globo-espacial', -27, dict(rate=0.75)),                             # whoosh cosmico
 (28.653, 'synth-vibra-grave', -32, dict(rate=1.6, dur=0.7, fo=0.2)),          # tremidinha
 (29.453, 'boia-plop', -27, dict(rate=1.4, dur=0.5, fo=0.2)),                  # agua
 (30.727, 'synth-ding', -24, dict(rate=1.2)),                                  # DIAMAGNETISMO
 (31.438, 'whoosh-corte-b', -27, dict(rate=0.9)),                              # TU
 (31.46, 'synth-ting', -23, {}),
 # ===== L6 sapo de 1997
 (32.159, 'dossie-papel', -27, dict(rate=1.5)),                                # calendario
 *seq(32.25, 0.08, 5, 'synth-rabisco', -33, rates=[1.6], dur=0.07),
 (33.162, 'synth-mag-hum', -30, dict(rate=0.8, dur=1.0, fo=0.3)),              # hum de laboratorio
 (34.177, 'synth-escudo-on', -27, {}),                                         # zumbido
 (34.50, 'boing-comico', -24, dict(rate=0.9)),                                 # sapo flutua
 (35.45, 'hit-final', -21, dict(dur=0.9, fo=0.4)),                             # 16 T
 (35.46, 'hud-blip', -23, {}),
 (36.465, 'synth-afinador-sobe', -25, dict(rate=0.8)),                         # subida rapida
 (36.47, 'riser-tensao', -28, dict(ss=3.6, dur=0.65, fi=0.1, fo=0.05)),
 (37.13, 'carimbo', -16, {}),                                                  # x300.000
 (37.14, 'tensao-hit', -20, dict(dur=0.6, fo=0.3)),
 (37.795, 'swish-suave', -29, {}),                                             # Terra
 # ===== L7 treino / gota / sapo do vizinho
 (38.64, 'synth-vibra-grave', -29, dict(rate=0.8, dur=0.9, fo=0.3)),           # esforco
 (38.66, 'synth-mag-hum', -30, dict(dur=0.9, fo=0.3)),
 (40.162, 'boia-plop', -24, dict(rate=1.8, dur=0.4, fo=0.15)),                 # plic
 (40.25, 'estrelinhas-tilintando', -28, dict(rate=1.2, dur=0.7, fo=0.3)),
 (41.041, 'boing-comico', -25, dict(rate=0.8)),                                # sapo sobe
 (41.617, 'sapo-coaxar', -25, dict(dur=0.25, fo=0.05, pan=0.3)),               # croac
 (43.092, 'sapo-coaxar', -18, {}),                                             # NAO GOSTOU
 (43.25, 'carimbo', -19, {}),                                                  # SAPO :(
 # ===== L8 lanchonete
 (43.882, 'carro-interior-noite', -34, dict(dur=1.0, fi=0.2, fo=0.3, lp=2500)),  # noite
 (43.90, 'synth-mag-hum', -34, dict(rate=2.0, dur=0.9, fo=0.3)),               # neon
 (45.02, 'faceplant-plaft', -30, dict(rate=1.8, dur=0.2, fo=0.1, hp=1500)),    # crocante
 (45.25, 'faceplant-plaft', -31, dict(rate=2.0, dur=0.2, fo=0.1, hp=1500)),
 (45.80, 'muro-crunch', -27, dict(rate=1.2, dur=0.4, fo=0.2)),                 # porta batendo
 (45.843, 'synth-sino-porta', -19, {}),                                        # sininho
 (46.14, 'passos-sapato', -27, dict(ss=0.5, rate=0.8, dur=0.9, fo=0.3)),       # passos
 (47.05, 'swish-suave', -29, {}),
 (47.35, 'synth-ting', -22, dict(rate=0.9)),                                   # brilho do taco
 (48.31, 'boing-comico', -27, dict(rate=0.6, dur=0.5, fo=0.2)),                # boing fraco
 (48.87, 'carimbo', -18, {}),                                                  # NAO MAGNETICO
 (49.10, 'synth-tung', -27, dict(rate=1.3, dur=0.4, fo=0.2)),                  # taco na mao
 (49.81, 'swish-suave', -29, dict(rate=1.1)),
 (50.11, 'synth-ting', -23, dict(rate=1.2)),                                   # ideia
 # ===== L9 lei de Lenz (buzz 6 Hz 50.5 -> 58.5)
 (50.51, 'synth-lenz-buzz', -22, {}),
 (51.87, 'synth-vibra-grave', -31, dict(rate=1.4, dur=1.0, fo=0.3)),         # taco vibra
 (52.887, 'scan-eletronico', -28, dict(dur=1.0, fo=0.3)),                      # raio-X
 (53.39, 'synth-afinador-sobe', -29, dict(rate=0.5)),                          # buzz subindo
 (54.16, 'synth-escudo-on', -29, dict(rate=1.2)),                              # correntes rodando
 (55.91, 'hit-final', -21, dict(rate=1.3, dur=0.6, fo=0.3)),                   # PUSH repulsao
 (55.92, 'synth-vwomp', -25, dict(rate=1.2)),
 (57.41, 'carimbo', -15, {}),                                                  # LEI DE LENZ
 (57.42, 'tensao-hit', -20, dict(dur=0.6, fo=0.3)),
 # ===== L10 taco voa
 (58.56, 'synth-tung', -15, {}),                                               # TUNG
 (58.56, 'synth-bzzt', -22, dict(rate=0.8)),                                   # estalo eletrico
 (59.02, 'synth-spin', -22, {}),                                               # spin
 (60.07, 'lata-parede-impacto', -16, dict(dur=0.8, fo=0.3)),                   # CLANG
 (60.08, 'synth-tung', -21, dict(rate=0.85, dur=0.8, fo=0.4)),
 (60.14, 'dossie-papel', -26, dict(rate=1.2)),                                 # guardanapos
 # ===== L11 bicicleta / corrente
 (60.73, 'passos-sapato', -26, dict(ss=0.5, rate=1.15, dur=1.0, fo=0.3)),      # corre
 (61.38, 'cama-molas', -28, dict(rate=0.8)),                                   # rangido da bike
 (62.20, 'cama-molas', -28, dict(rate=0.45)),                                  # esforco
 (62.70, 'glitch-erro-buzz', -24, dict(ss=0.3, dur=0.4, fo=0.1)),              # X 12 kg
 (63.66, 'synth-mag-hum', -27, dict(rate=1.1, dur=0.5, fo=0.15)),              # zumbido
 (63.95, 'synth-chocalho', -27, dict(dur=0.25, fo=0.08)),                      # corrente soltando
 *seq(63.95, 0.05, 4, 'synth-clink', -30, rates=[0.8, 1.1, 0.9, 1.2]),
 (64.15, 'synth-clink', -18, dict(rate=0.75)),                                 # CLINK na mao
 (64.16, 'catraca-clank', -22, dict(rate=1.3)),
 *seq(64.66, 0.06, 5, 'synth-clink', -31, rates=[0.9, 1.2, 1.0, 1.3, 0.85]),   # chocalho
 *seq(64.86, 0.12, 8, 'synth-tique', -31, rates=[0.7, 0.8]),                   # pedal em falso
 (64.95, 'synth-ding', -22, {}),                                               # 300 g ok
 # ===== L12 policia
 *seq(65.85, 1.0, 3, 'synth-sirene', -27, dur=1.0, lp=3500),                   # sirene
 (66.18, 'synth-derrapa', -26, {}),                                            # derrapagem
 *seq(66.72, 0.07, 11, 'synth-tique', -29, rates=[0.7, 0.85]),                 # pedal acelerado
 (67.50, 'record-scratch', -18, {}),                                           # FREEZE
 (67.55, 'carimbo', -17, {}),                                                  # 0 km/h
 # ===== L13 fim feliz? quase.
 (68.95, 'arena-multidao-ruge', -30, dict(ss=0.3, dur=1.0, fi=0.05, fo=0.4)),  # vivas
 (69.05, 'synth-ding', -26, {}),
 (69.00, 'estrelinhas-tilintando', -29, dict(dur=0.9, fo=0.3)),                # confete
 (69.72, 'record-scratch', -17, {}),                                           # QUASE
 (70.675, 'swish-suave', -29, {}),
 (71.27, 'synth-bip-leitura', -24, {}),                                        # bip leitura
 (72.13, 'synth-erro-duplo', -19, {}),                                         # CARTAO INVALIDO
 (72.67, 'synth-bzzt', -29, dict(dur=0.3, fo=0.1)),                            # estalo fraco
 (72.77, 'trombone-triste', -21, dict(dur=0.75, fo=0.3, rate=1.15)),           # wah-wah
 (73.78, 'carta-tapa', -20, dict(rate=0.8)),                                   # cartao 12 cai
 (73.80, 'dossie-papel', -29, dict(rate=1.3)),
 (74.28, 'carimbo', -16, {}),                                                  # 12
 (74.29, 'hud-blip', -23, dict(rate=0.9)),
 # ===== L14 CTA
 (74.91, 'whoosh-corte-a', -27, {}),
 (76.16, 'synth-mag-hum', -27, dict(rate=1.3, dur=0.55, fo=0.1)),              # clipe levitando
 (76.16, 'synth-afinador-sobe', -30, dict(rate=1.4)),
 (76.70, 'vento-queda', -27, dict(anchor=0.6, rate=1.3, dur=0.6, fo=0.1)),     # clipe vem pra camera
 (76.72, 'synth-zing', -25, dict(rate=0.8)),
 (77.41, 'synth-clink', -20, dict(rate=1.1)),                                  # tink na lente
 (77.84, 'synth-ting', -20, {}),                                               # piscada
 (77.85, 'estrelinhas-tilintando', -28, dict(dur=0.7, fo=0.3, rate=1.2)),
]

# automacao da trilha: (t, dB) interpolado; soma ao ganho base
MUSIC_AUTO = [
 (0.0, -3), (1.0, 0),
 (25.6, 0), (25.9, -4), (26.5, -4), (26.8, 0),                 # lampada
 (43.0, 0), (43.85, -6), (45.7, -6), (45.85, 0),               # lanchonete noite
 (50.4, 0), (50.6, -6), (58.4, -6), (58.6, 2),                 # buzz de Lenz: trilha baixa
 (67.46, 2), (67.50, -24), (68.55, -24), (68.90, 0),           # FREEZE: silencio
 (69.68, 2), (69.72, -24), (70.60, -24), (70.70, -2),          # "Quase."
 (78.58, -2), (78.60, -80), (DUR, -80),                        # corte seco pro preto
]

def stem_path(n):
    for d in (HERE, SFX + '/ep03', SFX + '/ep02qi', SFX + '/ep01', SFX):
        p = f'{d}/{n}.mp3'
        if os.path.exists(p):
            return p
    raise FileNotFoundError(n)


def make_synth():
    for n, spec in SYNTH.items():
        p = f'{HERE}/{n}.mp3'
        if os.path.exists(p):
            continue
        if spec[0].startswith('lavfi:'):
            src, d, flt = spec[0][6:], spec[1], spec[2]
            run(['ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i', f'{src}:d={d}', '-af', flt,
                 '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k', p])
        else:
            expr, d = spec
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
    tmp = tempfile.mkdtemp(prefix='mix_ep04_')
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
        loop = False   # (loop infinito travava o grafo) -> todo 'dur' cabe no stem
        assert need <= dur_of(p) + 0.01, (t, n, o)
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
    # base silenciosa do tamanho exato: sem ela, quando o ultimo SFX acaba antes de DUR,
    # amix->apad entra em loop e o ffmpeg trava (no EP02 o ultimo hit passava do fim)
    fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{DUR}[sil]')
    sfx_labels.append('[sil]')
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
             f'aresample=48000,afade=t=out:st={HARD_CUT - 0.03}:d=0.03,apad,atrim=0:{DUR}',
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
