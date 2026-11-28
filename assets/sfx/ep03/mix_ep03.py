#!/usr/bin/env python3
"""Mix final do EP03 "Modo Vibra" (79,85 s, 48 kHz estereo, -14 LUFS, TP <= -1 dBTP).

Uso:  python3 mix_ep03.py [saida.wav]
      (padrao: video-engine/public/ep03/mix.wav, copiado tambem para video-engine/out/ep03/mix.wav)

Mesmo esquema do mix_ep02qi.py:
  voz    -> highpass + comp 3:1 + ganho p/ VOICE_LUFS                     (sempre por cima)
  trilha -> musica-bed-ep02qi reaproveitada + automacao (MUSIC_AUTO) -> sidechaincompress (chave = voz)
  SFX    -> cada evento com ganho = alvo - LUFS medido do stem -> bus -> sidechaincompress (leve)
  soma   -> ganho master (itera p/ -14 LUFS) -> alimiter em 192 kHz (true peak) -> 79,85 s

Stems novos do EP03 (assets/sfx/ep03/): so 3 gerados no ElevenLabs (risadas-turma, arena-multidao-ruge,
lama-schlorp); o resto vem das bibliotecas ep01/ep02qi/raiz ou e sintetizado aqui (synth-*.mp3, custo zero):
zumbido de celular, taca de cristal "Ding", afinador, escudo, rumble de areia, grilo, etc.

Cada evento de EV: (t, stem, alvo_LUFS, opcoes)
  t      = instante (s) em que o ponto de sincronia do stem cai
  anchor = ponto de sincronia dentro do stem (s); padrao = ANCHOR[stem] ou 0
  ss / dur = pula o comeco / corta depois de dur s;  fi / fo = fades;  rate = varispeed
  pan = -1..1;  lp / hp = filtros;  rev = invertido
"""
import os, re, shutil, subprocess, sys, tempfile

ROOT = '/home/user/V-deos-de-Ia'
SFX = ROOT + '/assets/sfx'
HERE = SFX + '/ep03'
VOICE = ROOT + '/video-engine/public/ep03/narracao.mp3'
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT + '/video-engine/public/ep03/mix.wav'
COPY = ROOT + '/video-engine/out/ep03/mix.wav'
DUR = 79.85
TARGET_LUFS = -14.0
TP_MAX = -1.0
VOICE_LUFS = -15.0
MUSIC_STEM = 'musica-bed-ep02qi'
MUSIC_BASE = -21.0
HARD_CUT = 78.80             # corte seco pro preto: silencio total depois

# ---------------------------------------------------------------- sons sintetizados
# (expr aevalsrc, dur)  ou  ('lavfi:<fonte>', dur, '<filtros>')  p/ ruido
SYNTH = {
    # celular no silencioso: buzz 160 Hz em pulsos (0,35 on / 0,2 off)
    'synth-bzz': ('0.5*(0.7*sgn(sin(2*PI*160*t))+0.3*sin(2*PI*320*t))*lt(mod(t,0.55),0.35)', 1.65),
    # vibracao grave continua (massagem / dedo vibrando), tremolo 18 Hz
    'synth-vibra-grave': ('0.5*(0.6*sgn(sin(2*PI*95*t))+0.4*sin(2*PI*190*t))*(0.6+0.4*sin(2*PI*18*t))*min(1,t*10)*min(1,(1.4-t)*5)', 1.4),
    # taca de cristal: 1320 Hz com batimento + parciais, cauda longa
    'synth-taca-ding': ('(0.5*sin(2*PI*1320*t)+0.35*sin(2*PI*1323.5*t)+0.15*sin(2*PI*3410*t)*exp(-3*t))*exp(-1.3*t)*min(1,t*400)', 2.8),
    # afinador: tom senoidal subindo 200 -> 500 Hz
    'synth-afinador-sobe': ('0.4*sin(2*PI*(200*t+375*t*t))*min(1,t*30)*min(1,(0.4-t)*30)', 0.4),
    # tom de 500 Hz sustentado com leve warble (camera lenta)
    'synth-tom-500': ('0.4*sin(2*PI*500*t+0.8*sin(2*PI*5*t))*min(1,t*8)*min(1,(1.1-t)*4)', 1.1),
    # bip de trava do afinador (440 Hz, 2 bips)
    'synth-bip-440': ('0.5*(sin(2*PI*440*t)+0.4*sin(2*PI*880*t))*lt(mod(t,0.12),0.08)*min(1,(0.24-t)*40)', 0.24),
    # ting agudo (piscada, tilintar de vidro)
    'synth-ting': ('(0.6*sin(2*PI*3136*t)+0.3*sin(2*PI*4700*t))*exp(-9*t)*min(1,t*800)', 0.5),
    # vidro vibrando/warble (escudo tremendo)
    'synth-warble': ('0.45*sin(2*PI*900*t+6*sin(2*PI*9*t))*(0.55+0.45*sin(2*PI*13*t))*min(1,t*10)*min(1,(1.2-t)*4)', 1.2),
    # escudo ligando: varredura grave 60 -> 220 Hz + harmonico
    'synth-escudo-on': ('0.5*(sin(2*PI*(60*t+100*t*t))+0.3*sin(2*PI*(120*t+200*t*t)))*min(1,t*20)*min(1,(0.8-t)*5)', 0.8),
    # hum do escudo (110 Hz + 220, com batimento)
    'synth-escudo-hum': ('0.35*(sin(2*PI*110*t)+0.5*sin(2*PI*221*t)+0.2*sin(2*PI*331*t))*min(1,t*5)*min(1,(1.5-t)*4)', 1.5),
    # grilo (noite / silencio constrangedor)
    'synth-grilo': ('0.3*sin(2*PI*4400*t)*gt(sin(2*PI*35*t),0)*lt(mod(t,0.45),0.16)', 1.35),
    # "vwomp" de camera lenta (220 -> 50 Hz)
    'synth-vwomp': ('0.6*sin(2*PI*(220*t-170*t*t/0.7))*min(1,t*30)*min(1,(0.7-t)*5)', 0.7),
    # rumble de areia / terremoto: ruido marrom passa-baixa, tremendo
    'synth-rumble': ('lavfi:anoisesrc=c=brown:a=0.6:r=48000', 3.0,
                     'lowpass=f=140,lowpass=f=140,volume=\'0.6+0.4*sin(2*PI*7*t)\':eval=frame,afade=t=in:d=0.25,afade=t=out:st=2.3:d=0.7'),
    # chocalho/agitado (graos sacudindo): ruido rosa passa-banda em pulsos rapidos
    'synth-chocalho': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000', 1.2,
                       'bandpass=f=3500:w=2500,volume=\'0.25+0.75*gt(sin(2*PI*14*t),0.2)\':eval=frame,afade=t=in:d=0.05,afade=t=out:st=0.9:d=0.3'),
    # rabisco de caneta rapido: ruido rosa agudo em golpes
    'synth-rabisco': ('lavfi:anoisesrc=c=pink:a=0.5:r=48000', 0.9,
                      'highpass=f=2000,lowpass=f=7000,volume=\'0.15+0.85*abs(sin(2*PI*9*t))\':eval=frame,afade=t=in:d=0.03,afade=t=out:st=0.7:d=0.2'),
}
# reaproveitados do EP02 (ja existem em ep02qi/)
OLD_SYNTH = ['synth-ding', 'synth-tique', 'synth-fiuu']

# ponto de sincronia (transiente principal) dos stems, em s
ANCHOR = {'carimbo': 0.33, 'hit-final': 0.92, 'lata-metal': 0.23, 'muro-crunch': 0.3,
          'swish-suave': 0.24, 'dossie-papel': 0.47, 'cama-molas': 0.21, 'globo-espacial': 0.18,
          'whoosh-corte-a': 0.06, 'whoosh-corte-b': 0.06, 'estalo-trovao': 0.05,
          'teleporte-zap-vacuo': 0.12,
          'catraca-clank': 0.09, 'carta-tapa': 0.02, 'gato-miau': 0.1, 'estrelinhas-tilintando': 0.05,
          'porta-trem-fecha': 1.77, 'glitch-erro-buzz': 0.02,
          # ep03
          'lama-schlorp': 0.33, 'risadas-turma': 0.05, 'arena-multidao-ruge': 0.1,
          'record-scratch': 0.05, 'tensao-hit': 0.05, 'trombone-triste': 0.0}

# ---------------------------------------------------------------- cortes (= inicio dos planos)
CUTS = [1.68, 2.73, 3.98, 5.05, 6.16, 7.68, 8.72, 9.93, 10.69, 11.61, 12.9, 13.77, 15.26, 16.52,
        17.75, 19.13, 20.18, 21.09, 22.28, 23.25, 24.32, 25.79, 26.85, 28.13, 29.3, 30.73, 31.86,
        32.54, 33.71, 34.64, 36.27, 37.2, 38.34, 39.97, 40.78, 41.77, 42.89, 44.2, 45.66, 46.99,
        47.95, 49.33, 50.75, 52.27, 53.46, 55.05, 56.44, 57.51, 58.77, 60.27, 61.6, 62.48, 63.35,
        64.51, 65.33, 66.71, 67.56, 68.42, 69.39, 70.74, 72.39, 73.46, 75.09, 76.5, 77.81]
# cortes sem whoosh: hit/efeito proprio no instante, silencio (Ding, mae), ou corte seco
CUT_SKIP = {7.68, 12.9, 15.26, 31.86, 36.27, 37.2, 45.66, 46.99, 50.75, 53.46, 56.44, 60.27,
            61.6, 64.51, 68.42, 69.39, 70.74, 73.46, 77.81}
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
 # ===== L1 "tem o poder de vibrar"
 (0.00,  'synth-bzz', -27, dict(lp=1500, fi=0.05)),                          # bzz do celular
 (0.83,  'tensao-hit', -19, dict(rate=1.3, dur=0.6, fo=0.3)),               # HUD PODER: VIBRAR
 (0.83,  'hud-blip', -22, {}),
 (1.75,  'synth-bzz', -29, dict(lp=1500, dur=0.35, fo=0.05)),               # SO ISSO.
 (2.05,  'boing-comico', -29, dict(rate=1.5, dur=0.4, fo=0.15)),            # dar de ombros
 (2.75,  'synth-bzz', -26, dict(lp=2500, dur=0.9, fo=0.1, pan=-0.3)),       # celular na mesa
 (2.75,  'synth-bzz', -28, dict(lp=1200, dur=0.9, fo=0.1, pan=0.3, rate=0.95)),
 # ===== L2 academia
 (3.98,  'amb-calcadao-ondas-multidao', -31, dict(ss=1.0, dur=2.2, fi=0.2, fo=0.4, lp=4000)),  # patio
 (4.60,  'globo-espacial', -27, dict(rate=1.3, pan=0.4)),                    # aluno voando
 (5.20,  'teleporte-zap-vacuo', -28, dict(rate=1.4, dur=0.6, fo=0.2, pan=-0.4)),  # rajada
 (5.40,  'muro-crunch', -20, dict(dur=0.7, fo=0.3)),                         # soco + parede
 (6.20,  'synth-vibra-grave', -31, dict(rate=1.6, dur=0.5, fo=0.15)),        # copo tremendo
 (6.30,  'janela-vidro-tremendo', -31, dict(dur=0.4, fo=0.2, hp=800)),
 (6.69,  'carimbo', -16, {}),                                                # ULTIMO
 (7.68,  'cronometro', -29, dict(rate=1.8, dur=0.5, fo=0.1)),                # scroll do ranking
 (7.68,  'swish-suave', -28, dict(rate=0.7)),
 (8.18,  'glitch-erro-buzz', -21, dict(ss=0.3, dur=0.5, fo=0.15)),           # #312 buzzer
 (8.72,  'trombone-triste', -19, dict(dur=1.1, fo=0.4)),                     # wah-wah
 # ===== L3 apelido
 (9.93,  'risadas-turma', -21, dict(dur=0.95, fo=0.3)),                      # HAHA
 (10.79, 'faceplant-plaft', -17, dict(dur=0.5, fo=0.2)),                     # adesivo MODO VIBRA
 (10.82, 'carimbo', -22, dict(rate=1.15)),
 (11.65, 'synth-vibra-grave', -27, dict(dur=1.25, fo=0.2)),                  # massagem
 (12.90, 'synth-vibra-grave', -30, dict(rate=0.8, dur=0.85, fo=0.3)),        # AHHHH vibrato
 (12.95, 'estrelinhas-tilintando', -29, dict(rate=0.9, dur=0.8, fo=0.3)),    # coracoes
 (13.85, 'synth-vibra-grave', -28, dict(rate=1.3, dur=0.5, fi=0.05, fo=0.05)),  # pote tremendo
 (14.34, 'boia-plop', -18, dict(dur=0.5, fo=0.2, rate=1.3)),                 # POP da tampa
 (14.36, 'synth-ting', -26, dict(rate=0.8)),
 *seq(14.55, 0.09, 4, 'synth-tique', -28, rates=[0.6, 0.7, 0.55, 0.65]),     # azeitonas
 # ===== L4 descoberta
 (15.26, 'synth-grilo', -32, dict(fi=0.2)),                                  # noite
 (16.03, 'synth-ding', -21, {}),                                             # lampada de ideia
 (16.60, 'synth-vibra-grave', -32, dict(rate=0.5, dur=1.1, fo=0.3, pan=-0.4)),  # 3 zumbidos
 (16.60, 'synth-vibra-grave', -33, dict(rate=1.0, dur=1.1, fo=0.3)),
 (16.60, 'synth-tom-500', -34, dict(rate=1.0, dur=1.05, pan=0.4)),
 (18.06, 'carimbo', -18, {}),                                                # FREQUENCIA NATURAL
 (19.30, 'synth-rabisco', -30, dict(rate=0.7)),                              # lapis
 (20.18, 'teleporte-zap-vacuo', -29, dict(rate=1.3, dur=0.7, fo=0.3)),       # energia no dedo
 (20.30, 'estrelinhas-tilintando', -27, dict(rate=1.2, dur=0.7, fo=0.3)),
 # ===== L5 balanco / ressonancia
 (21.10, 'cama-molas', -27, dict(rate=0.6)),                                 # rangido do balanco
 *seq(22.40, 0.45, 2, 'synth-tique', -25, rates=[0.35, 0.35]),               # toc
 (23.25, 'cama-molas', -27, dict(rate=0.55)),
 (24.32, 'vento-queda', -28, dict(rate=1.0, anchor=0.6, dur=1.4, fo=0.4)),   # whoosh crescente
 (24.40, 'cama-molas', -28, dict(rate=0.5)),
 (25.00, 'risadas-turma', -30, dict(ss=0.8, dur=0.7, fi=0.1, fo=0.3, rate=1.25)),  # crianca alegre
 (26.30, 'record-scratch', -18, {}),                                         # freeze UEEEPA
 (26.99, 'carimbo', -17, {}),                                                # RESSONANCIA
 # ===== L6 taca
 (28.13, 'synth-taca-ding', -27, dict(rate=1.0, dur=1.2, fo=0.5)),           # ding de cristal
 (28.20, 'estrelinhas-tilintando', -30, dict(rate=1.3, dur=0.8, fo=0.3)),
 (29.62, 'synth-afinador-sobe', -29, {}),                                    # tom subindo
 (30.01, 'synth-bip-440', -24, dict(rate=1.14)),                             # trava 500 Hz
 (30.73, 'synth-tom-500', -27, {}),                                          # slow-mo
 (30.73, 'synth-vwomp', -27, dict(rate=0.7)),
 (31.86, 'vidro-quebrando', -14, {}),                                        # ESTOURA
 (31.87, 'tensao-hit', -22, dict(rate=0.9, dur=0.6, fo=0.3)),
 # ===== L7 treino
 *seq(32.70, 0.22, 4, 'vidro-quebrando', -27, rates=[1.3, 1.45, 1.2, 1.55], dur=0.18, fo=0.08),
 (33.71, 'dossie-papel', -26, dict(rate=1.4)),                               # folhas
 (33.80, 'hud-blip', -22, dict(rate=0.8)),                                   # 3 ANOS
 (34.64, 'vidro-quebrando', -28, dict(rate=0.7, dur=0.6, fo=0.3, lp=5000)),  # cacos caindo
 *seq(34.70, 0.06, 10, 'synth-tique', -31, rates=[1.0, 1.2, 1.4, 1.1, 1.5, 1.3, 1.6, 1.15, 1.7, 1.25]),
 (35.35, 'synth-ding', -19, dict(rate=1.3)),                                 # 4.000 cha-ching
 (35.37, 'tensao-hit', -21, dict(rate=1.2, dur=0.5, fo=0.25)),
 (36.45, 'synth-rabisco', -26, dict(dur=0.25, fo=0.08)),                     # mae risca
 (36.59, 'synth-grilo', -30, dict(dur=0.6, fo=0.15)),                        # deadpan
 # ===== L8 prova final / Bruno
 (37.20, 'arena-multidao-ruge', -24, dict(dur=1.15, fi=0.05, fo=0.3)),
 (37.61, 'carimbo', -18, dict(rate=0.85)),                                   # PROVA FINAL
 (38.40, 'passos-sapato', -27, dict(ss=0.5, rate=0.7, dur=1.0, fo=0.3)),     # passos pesados
 (38.40, 'vapor-chiado', -31, dict(dur=1.0, fi=0.2, fo=0.4, lp=3000)),       # fumaca
 (39.41, 'hit-final', -18, dict(dur=1.0, fo=0.4)),                           # BRUNO impacto grave
 (40.17, 'muro-crunch', -22, dict(rate=1.3, dur=0.4, fo=0.2)),               # estalo de musculos
 (40.20, 'tensao-hit', -23, dict(rate=0.7, dur=0.5, fo=0.25)),
 (40.88, 'synth-escudo-on', -24, {}),                                        # domo
 (41.31, 'boing-comico', -22, dict(rate=1.2)),                               # TOINC
 (41.77, 'whoosh-corte-a', -29, dict(rate=0.8)),                             # tilt
 (42.37, 'carimbo', -16, {}),                                                # INVICTO
 (42.40, 'arena-multidao-ruge', -25, dict(ss=1.5, dur=0.5, fo=0.2)),
 # ===== L9 escudo / Ding
 (43.27, 'synth-escudo-on', -25, dict(rate=0.8)),
 (43.61, 'globo-espacial', -27, dict(rate=0.8)),                             # vwoom
 (43.70, 'arena-multidao-ruge', -30, dict(ss=2.5, dur=0.6, fi=0.1, fo=0.3)),  # ooh
 (44.20, 'synth-escudo-hum', -31, dict(dur=1.45, fo=0.3)),
 (44.98, 'synth-ting', -30, dict(rate=0.6)),                                 # tap no vidro
 (45.66, 'synth-taca-ding', -17, {}),                                        # DING
 (47.40, 'synth-bip-440', -22, {}),                                          # trava 440 Hz
 # ===== L10 ressonancia no escudo
 (47.95, 'synth-vibra-grave', -27, dict(rate=0.9, dur=0.9, fi=0.3, fo=0.1)),  # buzz subindo
 (48.78, 'synth-escudo-on', -24, dict(rate=1.3)),                            # phase lock whum
 (49.76, 'synth-warble', -27, dict(dur=0.5, fo=0.1)),
 (50.19, 'synth-warble', -23, dict(rate=1.15, dur=0.6, fo=0.1)),
 (50.30, 'janela-vidro-tremendo', -25, dict(dur=0.6, fo=0.1)),               # rachando
 (50.90, 'vidro-quebrando', -13, dict(rate=0.8)),                            # DOMO ESTOURA
 (50.90, 'hit-final', -20, dict(dur=1.2, fo=0.5)),
 (51.46, 'estrelinhas-tilintando', -26, dict(rate=0.9)),                     # cacos
 *seq(51.50, 0.15, 4, 'synth-ting', -30, rates=[1.0, 1.2, 0.9, 1.3]),
 # ===== L11 soco
 (52.39, 'passos-sapato', -25, dict(ss=0.5, rate=0.75, dur=1.0, fo=0.3)),    # correndo na areia
 (52.40, 'arena-multidao-ruge', -30, dict(ss=0.5, dur=1.0, fo=0.4)),
 (53.00, 'vento-queda', -28, dict(rate=1.2, anchor=0.6, dur=0.5, fo=0.1)),   # build
 (53.46, 'whoosh-corte-b', -23, dict(rate=0.7)),                             # soco
 (53.86, 'carta-tapa', -17, dict(rate=0.7)),                                 # SOCO 2 t
 (53.88, 'tensao-hit', -19, dict(rate=0.8, dur=0.7, fo=0.3)),
 # ===== L12 liquefacao
 (55.50, 'synth-vwomp', -24, {}),                                            # tempo lento
 (56.66, 'faceplant-plaft', -18, dict(rate=0.8, dur=0.5, fo=0.2)),           # tapa na areia
 (56.68, 'synth-rumble', -20, {}),                                           # rumble
 (57.51, 'dossie-papel', -26, {}),                                           # diagrama
 (58.77, 'synth-chocalho', -27, {}),                                         # graos sacudindo
 (59.79, 'boia-plop', -24, dict(rate=0.8, dur=0.6, fo=0.25)),                # bloop
 (60.30, 'splash-duplo', -29, dict(dur=0.6, fo=0.3, lp=3000)),               # slosh
 (60.62, 'carimbo', -17, {}),                                                # LIQUEFACAO
 (61.60, 'synth-rumble', -22, dict(dur=0.9, fo=0.3, rate=0.8)),              # terremoto
 (62.57, 'synth-rabisco', -26, dict(rate=0.6, dur=0.7, fo=0.2)),             # sismografo
 # ===== L13 Bruno afunda
 (63.79, 'lama-schlorp', -20, {}),
 (64.51, 'boia-plop', -22, dict(rate=0.6, dur=0.5, fo=0.2)),                 # assenta
 *seq(65.40, 0.25, 3, 'lama-schlorp', -25, rates=[1.3, 1.45, 1.2], ss=0.25, dur=0.3, fo=0.1),
 (65.82, 'cama-molas', -30, dict(rate=0.5)),                                 # grunhido
 (66.71, 'cama-molas', -30, dict(rate=0.45)),
 *seq(67.56, 0.12, 4, 'synth-tique', -27, rates=[0.9, 1.1, 0.95, 1.15]),     # carangueijo
 (68.00, 'boing-comico', -23, dict(rate=1.6, dur=0.4, fo=0.15)),             # tchauzinho
 # ===== L14 ranking #1
 (68.42, 'arena-multidao-ruge', -30, dict(ss=3.0, dur=0.5, fi=0.05, fo=0.3, rate=1.2)),  # gasp
 *seq(68.50, 0.07, 12, 'synth-tique', -29, rates=[1.0, 1.1, 1.2, 1.3]),      # contador girando
 *seq(69.39, 0.15, 2, 'synth-ding', -21, rates=[1.0, 1.5]),                  # ding-ding
 (69.39, 'arena-multidao-ruge', -22, dict(dur=1.4, fo=0.5)),                 # multidao
 (69.40, 'estrelinhas-tilintando', -26, dict(rate=1.1, dur=0.9, fo=0.3)),    # confete
 # ===== L15 efeito colateral
 (70.10, 'record-scratch', -18, {}),
 (70.20, 'carimbo', -18, {}),
 (70.74, 'synth-vibra-grave', -30, dict(rate=1.0, dur=1.35, fi=0.1, fo=0.3)),  # trofeu chacoalhando
 (70.74, 'janela-vidro-tremendo', -31, dict(dur=1.6, fo=0.4, hp=600)),
 (71.19, 'cronometro', -29, dict(rate=2.0, dur=1.1, fo=0.2)),                # tique-taque
 (72.50, 'dossie-papel', -27, dict(rate=1.2)),                               # caderno
 (72.67, 'synth-tique', -24, dict(rate=0.8)),                                # click da caneta
 (73.46, 'synth-rabisco', -26, dict(rate=1.3, dur=0.4)),                     # rabisco
 (73.84, 'synth-rabisco', -22, dict(rate=1.6)),                              # sismografo violento
 (73.84, 'synth-rumble', -24, dict(dur=1.0, fo=0.4)),
 (74.26, 'hud-blip', -24, {}),
 # ===== L16 CTA
 (75.24, 'swish-suave', -26, dict(rate=1.2)),
 (76.70, 'whoosh-corte-b', -27, dict(rate=1.1)),                             # troca de card
 (77.22, 'estrelinhas-tilintando', -24, dict(rate=1.2, dur=0.8, fo=0.3)),    # bling
 (77.22, 'synth-ding', -25, dict(rate=1.6)),
 (78.15, 'synth-ting', -22, {}),                                             # piscada
]

# automacao da trilha: (t, dB) interpolado; soma ao ganho base
MUSIC_AUTO = [
 (0.0, -2), (3.9, -2), (4.0, 0),
 (26.28, 0), (26.32, -24), (26.80, -24), (26.95, 0),          # freeze UEEEPA
 (30.6, 0), (30.8, -8), (31.8, -8), (31.9, 0),                # slow-mo da taca
 (36.52, 0), (36.56, -24), (37.10, -24), (37.20, 1),          # mae deadpan: silencio
 (44.2, 1), (45.5, -10), (45.62, -26), (47.0, -26), (47.95, 0),  # "Ding": musica sai
 (55.0, 0), (55.5, -8), (56.6, -8), (56.8, 1),                 # "nem desvia"
 (68.35, 1), (68.42, -14), (69.35, -14), (69.40, 2),          # suspense do ranking
 (70.06, 2), (70.10, -22), (70.6, -22), (70.74, -1),          # record scratch
 (78.78, -1), (78.80, -80), (DUR, -80),                        # corte seco pro preto
]

def stem_path(n):
    for d in (HERE, SFX + '/ep02qi', SFX + '/ep01', SFX):
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
    tmp = tempfile.mkdtemp(prefix='mix_ep03_')
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
