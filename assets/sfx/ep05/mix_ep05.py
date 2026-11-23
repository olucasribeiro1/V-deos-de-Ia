#!/usr/bin/env python3
"""Mix final do EP05 "O Salto 2: A Lia" (77,55 s, 48 kHz estereo, -14 LUFS, TP <= -1 dBTP).

Uso:  python3 mix_ep05.py [saida.wav]
      (padrao: video-engine/public/ep05/mix.wav, copiado tambem para video-engine/out/ep05/mix.wav)

Mesmo esquema do mix_ep04.py (com o fix do ffmpeg travando):
  voz    -> highpass + comp 3:1 + ganho p/ VOICE_LUFS                     (sempre por cima)
  trilha -> musica-bed-ep01 (mesmo mundo do EP01) em 2 trechos emendados: bed 0-40,3 s e bed 46,8 s em
            diante a partir de 40,0 s (pula o "break" do bed: a parte forte entra no "Entao" ~41,2 s)
            + automacao (MUSIC_AUTO) -> sidechaincompress (chave = voz)
  SFX    -> cada evento com ganho = alvo - LUFS medido do stem -> bus -> sidechaincompress (leve)
  soma   -> ganho master (itera p/ -14 LUFS) -> alimiter em 192 kHz (true peak) -> 77,55 s

Zero creditos do ElevenLabs: nada gerado. Tudo vem das bibliotecas raiz/ep01/ep02qi/ep03/ep04/nortesul
ou e sintetizado aqui (synth-*.mp3 em assets/sfx/ep05/): zap curto da montagem, batida de coracao,
ka-ching, pizzicato do passinho, rebobinar fita, celular vibrando, bandeira chicoteando.

Cada evento de EV: (t, stem, alvo_LUFS, opcoes)
  t      = instante (s) em que o ponto de sincronia do stem cai
  anchor = ponto de sincronia dentro do stem (s); padrao = ANCHOR[stem] ou 0
  ss / dur = pula o comeco / corta depois de dur s;  fi / fo = fades;  rate = varispeed
  pan = -1..1;  lp / hp = filtros;  rev = invertido
"""
import math, os, re, shutil, subprocess, sys, tempfile

ROOT = '/home/user/V-deos-de-Ia'
SFX = ROOT + '/assets/sfx'
HERE = SFX + '/ep05'
VOICE = ROOT + '/video-engine/public/ep05/narracao.mp3'
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT + '/video-engine/public/ep05/mix.wav'
COPY = ROOT + '/video-engine/out/ep05/mix.wav'
DUR = 77.55
TARGET_LUFS = -14.0
TP_MAX = -1.0
VOICE_LUFS = -15.0
MUSIC_STEM = 'musica-bed-ep01'
MUSIC_BASE = -20.5
# emenda da trilha: (inicio no bed, fim no bed, posicao na timeline, fade in, fade out)
MUSIC_SEGS = [(0.0, 40.3, 0.0, 0.0, 0.3), (46.8, 46.8 + DUR - 40.0, 40.0, 0.3, 0.0)]
HARD_CUT = 76.80             # corte seco pro preto: silencio total depois

# ---------------------------------------------------------------- sons sintetizados
SYNTH = {
    # zap curtinho da montagem (30 saltos em 2 s): varredura 2600 -> ~80 Hz em 70 ms
    'synth-zap-curto': ('(0.5*sin(2*PI*(2600*t-18000*t*t))*exp(-35*t)+0.15*sin(2*PI*(5200*t-36000*t*t))*exp(-50*t))*min(1,t*2000)', 0.09),
    # batida de coracao (lub-dub) com harmonicos p/ aparecer em celular
    'synth-coracao': ('0.8*(sin(2*PI*60*t)+0.5*sin(2*PI*120*t)+0.25*sin(2*PI*240*t))*exp(-14*t)*min(1,t*300)'
                      '+0.6*(sin(2*PI*55*(t-0.24))+0.5*sin(2*PI*110*(t-0.24))+0.25*sin(2*PI*220*(t-0.24)))*exp(-16*(t-0.24))*gte(t,0.24)*min(1,abs(t-0.24)*300)', 0.75),
    # ka-ching: "ka" da gaveta + sino da caixa registradora
    'synth-kaching': ('0.45*(0.6*sgn(sin(2*PI*150*t))+0.4*sin(2*PI*310*t))*exp(-35*t)*min(1,t*900)'
                      '+gte(t,0.07)*(0.35*sin(2*PI*2637*(t-0.07))+0.3*sin(2*PI*3520*(t-0.07))+0.2*sin(2*PI*5274*(t-0.07)))*exp(-3.5*abs(t-0.07))*(0.7+0.3*sin(2*PI*28*t))*min(1,abs(t-0.07)*900)', 1.0),
    # pizzicato do passinho na ponta do pe (2 notas)
    'synth-pizz': ('0.5*(sin(2*PI*659*t)+0.3*sin(2*PI*1318*t))*exp(-18*t)*min(1,t*900)'
                   '+0.5*gte(t,0.17)*(sin(2*PI*988*(t-0.17))+0.3*sin(2*PI*1976*(t-0.17)))*exp(-18*abs(t-0.17))*min(1,abs(t-0.17)*900)', 0.55),
    # rebobinar fita (flashback EP01): chirp subindo com flutter
    'synth-rewind': ('0.35*sin(2*PI*(300*t+700*t*t)+3*sin(2*PI*23*t))*(0.6+0.4*sin(2*PI*31*t))*min(1,t*10)*min(1,(0.9-t)*6)', 0.9),
    # celular vibrando (2 pulsos)
    'synth-celular-vibra': ('0.5*(sin(2*PI*175*t)+0.35*sin(2*PI*350*t)+0.15*sin(2*PI*525*t))*(0.7+0.3*sin(2*PI*30*t))*lt(mod(t,0.42),0.28)*min(1,(0.84-t)*20)', 0.84),
    # bandeira chicoteando no vento
    'synth-bandeira': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000', 1.2,
                       'bandpass=f=700:w=900,volume=\'0.15+0.85*pow(abs(sin(2*PI*6*t)),4)\':eval=frame,afade=t=in:d=0.08,afade=t=out:st=0.85:d=0.35'),
}

# ponto de sincronia (transiente principal) dos stems, em s
ANCHOR = {'carimbo': 0.33, 'hit-final': 0.92, 'lata-metal': 0.23, 'muro-crunch': 0.12,
          'swish-suave': 0.24, 'dossie-papel': 0.47, 'globo-espacial': 0.18,
          'whoosh-corte-a': 0.06, 'whoosh-corte-b': 0.06, 'estalo-trovao': 0.05,
          'teleporte-zap-vacuo': 0.12, 'catraca-clank': 0.09, 'glitch-erro-buzz': 0.02,
          'risadas-turma': 0.09, 'tensao-hit': 0.05, 'trombone-triste': 0.0,
          'lata-parede-impacto': 0.18, 'splash-duplo': 0.14, 'pombos-revoada': 0.49,
          'vento-queda': 1.39, 'ns-whoosh': 0.28, 'ns-vento': 0.54, 'ns-shimmer': 0.13,
          'janela-vidro-tremendo': 1.03, 'synth-kaching': 0.07, 'lock-on-tom': 0.0}

# ---------------------------------------------------------------- cortes (= inicio dos planos)
CUTS = [1.72, 3.38, 4.39, 5.18, 6.03, 8.39, 9.53, 11.06, 12.52, 13.83, 14.85, 15.73, 17.15, 18.09,
        19.34, 20.89, 22.02, 23.17, 24.43, 25.27, 26.23, 27.26, 28.55, 29.88, 30.82, 32.25, 33.1,
        34.15, 35.45, 36.63, 37.88, 38.98, 40.3,
        41.274, 42.005, 44.06, 44.699, 45.221, 45.941, 46.777, 47.392, 48.495, 49.656, 50.829,
        52.024, 53.081, 53.905, 54.938, 55.797, 56.61, 58.027, 58.758, 60.302, 61.173, 62.473,
        63.309, 64.389, 65.248, 66.154, 67.384, 68.348, 69.683, 70.368, 71.657, 72.562, 73.317,
        74.931, 75.685, 76.8]
# cortes sem whoosh: hit/efeito proprio no instante, montagem, momento calmo ou corte seco
CUT_SKIP = {3.38, 4.39, 6.03, 8.39, 11.06, 13.83, 18.09, 26.23, 28.55, 29.88, 30.82, 33.1, 35.45,
            36.63, 38.98, 40.3, 41.274, 42.005, 44.06, 44.699, 45.221, 45.941, 46.777, 47.392,
            48.495, 49.656, 50.829, 53.081, 55.797, 56.61, 58.758, 60.302, 61.173, 62.473, 63.309,
            65.248, 66.154, 67.384, 68.348, 69.683, 70.368, 71.657, 72.562, 73.317, 76.8}
CUT_STEMS = ['whoosh-corte-a', 'swish-suave', 'whoosh-corte-b', 'ns-whoosh']
CUT_RATE = [1.0, 0.86, 1.12, 0.93, 1.2, 0.8, 1.06]
CUT_LVL = [-34, -32, -35, -33, -36]
CUT_PAN = [-0.35, 0.3, 0.0, 0.4, -0.2]


def cut_events():
    ev = []
    for i, t in enumerate(CUTS):
        if t in CUT_SKIP:
            continue
        ev.append((t, CUT_STEMS[i % 4], CUT_LVL[i % 5],
                   dict(rate=CUT_RATE[i % 7], pan=CUT_PAN[i % 5], hp=200)))
    return ev


def seq(t0, step, n, stem, lvl, rates=None, lvls=None, pans=None, **o):
    """n repeticoes espacadas"""
    out = []
    for i in range(n):
        d = dict(o)
        if rates:
            d['rate'] = rates[i % len(rates)]
        if pans:
            d['pan'] = pans[i % len(pans)]
        out.append((round(t0 + i * step, 3), stem, lvls[i % len(lvls)] if lvls else lvl, d))
    return out


def zap(t, lvl=-21, big=False):
    """salto do Davi: zap do Rastro + estalo curto"""
    if big:
        return [(t, 'teleporte-zap-vacuo', lvl, {}),
                (t + 0.02, 'estalo-trovao', lvl + 4, {})]
    return [(t, 'teleporte-zap-vacuo', lvl, dict(dur=0.55, fo=0.25)),
            (t + 0.02, 'estalo-trovao', lvl - 2, dict(dur=0.45, fo=0.3))]


# montagem 42,005 -> 44,0: 30 zaps (1 a cada 2 quadros), acento a cada 4 -> pulso ritmico
MONT_T = [round(42.005 + i * (2 / 30), 3) for i in range(30)]
MONT = [(t, 'synth-zap-curto', [-18, -25, -22, -25][i % 4],
         dict(rate=[1.0, 1.12, 0.9, 1.25, 1.05][i % 5], pan=[-0.5, 0.5, -0.2, 0.3, 0.0, -0.35][i % 6]))
        for i, t in enumerate(MONT_T)]
MONT += [(t, 'estalo-trovao', -30, dict(dur=0.12, fo=0.08, hp=1500, pan=[-0.4, 0.4][i % 2]))
         for i, t in enumerate(MONT_T[::4])]

# ---------------------------------------------------------------- cue list (shots.json partA/partB)
EV = [
 # ===== gancho: telhado a noite, Rastro chega
 (0.00,  'toquio-rua-neon', -36, dict(dur=3.4, fi=0.3, fo=0.4, lp=2500)),     # cidade a noite
 *zap(0.23, -17, big=True),                                                   # Davi aparece
 (0.30,  'tinnitus', -34, dict(dur=0.8, fo=0.4, lp=6000)),
 (1.72,  'synth-ting', -30, dict(rate=0.9)),                                  # tela do celular
 # A LINHA / ALVO
 (3.38,  'riser-tensao', -28, dict(ss=4.0, dur=0.67, fi=0.1, fo=0.05)),
 (4.05,  'hit-final', -16, dict(ss=0.8, dur=1.3, fo=0.5)),                            # selo da Linha (BOOM)
 (4.06,  'tensao-hit', -20, dict(dur=0.8, fo=0.4)),
 (4.39,  'lock-on-tom', -21, {}),                                             # mira trava: ALVO LIA
 (4.40,  'tablet-beep', -26, {}),
 (4.80,  'tablet-beep', -27, dict(rate=1.2)),
 (5.10,  'carimbo', -19, {}),                                                 # ALVO: LIA
 # ===== card "a pedido dos seguidores"
 (6.03,  'ns-pop', -21, {}),
 (6.05,  'hud-blip', -25, {}),
 (6.70,  'ns-pop', -25, dict(rate=1.2)),
 (7.31,  'ns-plink', -22, {}),                                                # like
 (7.33,  'synth-ding', -28, dict(rate=1.3)),
 # ===== recap EP01
 (8.39,  'synth-rewind', -23, {}),                                            # rebobinando
 (8.45,  'synth-tique', -30, dict(rate=0.8)),
 (9.53,  'hud-blip', -25, {}),                                                # REGRA 1
 (10.0,  'teleporte-zap-vacuo', -27, dict(dur=0.5, fo=0.25, rate=1.1)),       # Rastro mergulha
 (10.59, 'synth-ding', -21, {}),                                              # check
 (10.85, 'glitch-erro-buzz', -25, dict(ss=0.3, dur=0.3, fo=0.1)),             # X
 (11.06, 'vento-queda', -24, dict(ss=1.15, rate=1.3, dur=0.5, fo=0.15)),               # lata rasgando
 (11.40, 'hud-blip', -26, dict(rate=0.9)),                                    # REGRA 2
 (12.30, 'vento-queda', -25, dict(ss=1.15, rate=1.5, dur=0.4, fo=0.1)),
 (13.09, 'muro-crunch', -18, {}),                                             # lata fura a parede
 (13.10, 'lata-parede-impacto', -20, dict(dur=0.9, fo=0.4)),
 *zap(13.83, -21),                                                            # Rocha pro lado (what-if)
 (14.20, 'vento-queda', -25, dict(ss=1.15, rate=1.2, dur=0.5, fo=0.15, pan=0.4)),
 (14.95, 'muro-crunch', -18, dict(rate=0.8)),                                 # TUM no muro
 (15.08, 'carimbo', -16, {}),                                                 # ACIDENTE
 (15.09, 'tensao-hit', -22, dict(dur=0.6, fo=0.3)),
 # ===== turista
 (15.73, 'globo-espacial', -27, {}),
 *seq(15.95, 0.2, 6, 'ns-pop', -26, rates=[1.0, 1.15, 0.9, 1.25, 1.05, 1.3]),  # rota pulando cidades
 (16.86, 'hud-blip', -25, {}),                                                # SALTOS 47
 *zap(17.33, -22),                                                            # Paris
 (17.36, 'vento-queda', -23, dict(ss=1.15, rate=1.2, dur=0.65, fo=0.25)),              # rajada
 (17.50, 'dossie-papel', -28, dict(rate=1.3)),                                # mapa voando
 (18.09, 'teleporte-zap-vacuo', -23, dict(dur=0.55, fo=0.25, lp=3500)),       # Maldivas (sem estalo:
 (18.12, 'vento-queda', -24, dict(ss=1.15, rate=1.1, dur=0.75, fo=0.3, lp=3000)),  #  o chiado mascarava o "E")
 (18.20, 'boia-plop', -30, dict(rate=1.5, dur=0.4, fo=0.15)),
 (19.34, 'ns-whoosh', -25, dict(rate=0.9)),                                   # ar empurrado
 (19.93, 'ns-pop', -21, {}),                                                  # chip 70 L
 (19.95, 'hud-blip', -26, {}),
 # ===== Monaco / Lia
 (20.89, 'amb-calcadao-ondas-multidao', -33, dict(dur=5.0, fi=0.4, fo=0.6)),  # terraco
 (21.46, 'hud-blip', -27, dict(rate=0.9)),                                    # MONACO 43,7 N
 (22.62, 'estrelinhas-tilintando', -23, dict(dur=1.2, fo=0.4)),               # Lia (brilho)
 (22.64, 'ns-shimmer', -27, {}),
 (23.49, 'risadas-turma', -31, dict(dur=0.75, fo=0.3, hp=300)),               # risada
 (23.50, 'synth-ting', -26, dict(rate=1.3)),
 (23.70, 'estrelinhas-tilintando', -31, dict(rate=1.2, dur=0.6, fo=0.3)),     # coracoes
 (24.65, 'synth-ting', -26, dict(rate=1.1)),                                  # ele ri de volta
 (24.66, 'risadas-turma', -33, dict(ss=0.4, dur=0.6, fo=0.3, hp=300, rate=1.05)),
 (25.30, 'synth-tique', -31, dict(rate=0.7)),                                 # salto balancando
 (25.62, 'synth-tique', -32, dict(rate=0.8)),
 # ===== a Linha hackeia a galeria
 (26.23, 'scan-eletronico', -25, dict(dur=1.0, fo=0.3)),
 (26.25, 'synth-mag-hum', -31, dict(rate=0.7, dur=1.0, fo=0.3)),
 *seq(26.40, 0.14, 5, 'tablet-beep', -31, rates=[1.0, 1.2, 0.9, 1.3, 1.1], dur=0.1, fo=0.03),
 *seq(27.30, 0.16, 7, 'synth-tique', -31, rates=[1.1, 0.9]),                  # rolando a galeria
 (28.55, 'tensao-hit', -21, dict(dur=0.7, fo=0.3)),                           # FOTOS 312
 (28.56, 'carimbo', -18, {}),
 *seq(28.60, 0.06, 10, 'synth-tique', -30, rates=[1.3, 1.5]),                 # contador
 (29.30, 'hud-blip', -23, {}),
 *seq(29.90, 0.12, 7, 'ns-pop', -25, rates=[1.0, 1.2, 0.9, 1.3], pans=[-0.4, 0.4, 0.0]),  # pinos
 *seq(30.85, 0.3, 4, 'faceplant-plaft', -25, rates=[0.7, 0.75], lp=900, dur=0.3, fo=0.1),  # ternos
 (31.34, 'tensao-hit', -24, dict(rate=0.8, dur=0.6, fo=0.3)),                 # vigiado
 # ===== a foto
 (32.25, 'toquio-rua-neon', -37, dict(ss=2.0, dur=0.9, fi=0.2, fo=0.3, lp=2500)),
 (32.54, 'synth-celular-vibra', -21, {}),                                     # celular vibra
 (33.10, 'ns-blip-2', -18, {}),                                               # notificacao
 (33.12, 'synth-ding', -24, dict(rate=1.2)),
 (33.70, 'ns-shimmer', -29, dict(rate=0.8)),                                  # foto desembaca
 (35.45, 'whoosh-corte-b', -23, dict(rate=0.9)),                              # whip pro Rocha
 (35.50, 'tensao-hit', -20, dict(rate=0.85, dur=0.8, fo=0.4)),
 (36.63, 'ns-blip-2', -18, dict(rate=0.9)),                                   # "Tu ja viu esse lugar."
 (36.68, 'hit-final', -18, dict(ss=0.8, dur=1.1, fo=0.5)),
 (36.70, 'synth-vibra-grave', -30, dict(dur=1.0, fo=0.4)),
 # ===== microfones
 (38.14, 'estalo-trovao', -18, dict(dur=1.0, fo=0.5, lp=4000)),               # estalo imaginado
 (38.20, 'tinnitus', -31, dict(dur=0.7, fo=0.4, lp=6000)),
 *seq(38.98, 0.48, 3, 'sonar-ping', -24, rates=[1.0, 1.06, 1.12], dur=0.45, fo=0.2),  # aneis
 (40.30, 'carimbo', -17, {}),                                                 # pino crava
 (40.31, 'lock-on-tom', -22, {}),
 (40.52, 'ns-alerta', -22, {}),                                               # LOCALIZACAO: 2 s
 # ===== b01 pronto / montagem de 30 saltos
 (41.274, 'whoosh-corte-a', -27, {}),
 (41.30, 'estalo-trovao', -30, dict(dur=0.6, fo=0.3, hp=2500)),               # faiscas
 (41.32, 'teleporte-zap-vacuo', -30, dict(rate=0.8, lp=3000, dur=0.7, fi=0.1, fo=0.2)),  # carregando
 *MONT,
 (42.005, 'teleporte-zap-vacuo', -31, dict(rate=0.7, lp=2500, dur=2.0, fi=0.2, fo=0.3)),  # hum por baixo
 (42.005, 'cronometro', -31, dict(dur=1.9, fo=0.3)),                          # cronometro 0 -> 2 s
 (43.60, 'synth-afinador-sobe', -28, {}),                                     # sobe pro fim
 # ===== cozinha / telhado / varanda / banheiro
 *zap(44.09, -21),
 (44.16, 'catraca-clank', -25, dict(rate=1.4)),                               # panelas
 (44.22, 'lata-metal', -26, dict(rate=1.3, dur=0.5, fo=0.2)),
 (44.43, 'synth-zap-curto', -25, {}),
 *zap(44.729, -21),
 (44.80, 'pombos-revoada', -22, dict(dur=1.8, fo=0.4)),                       # pombos
 *zap(45.291, -21),
 (45.371, 'splash-duplo', -24, dict(rate=1.5, dur=0.4, fo=0.2)),              # champanhe
 (45.40, 'boing-comico', -29, dict(rate=1.6, dur=0.3, fo=0.1)),               # susto
 (45.691, 'synth-zap-curto', -25, dict(rate=0.9)),
 *zap(45.971, -21),
 (46.05, 'torneira-pia', -31, dict(ss=1.0, dur=0.5, fi=0.05, fo=0.2)),        # pia
 (46.441, 'synth-zap-curto', -25, dict(rate=1.1)),
 # ===== microfones enlouquecem / ERRO
 *seq(46.80, 0.08, 7, 'synth-bip-440', -27, rates=[1.0, 1.1, 1.2, 1.35, 1.5, 1.7, 1.9], pans=[-0.5, 0.5, 0.0]),
 (47.392, 'glitch-erro-buzz', -17, dict(dur=1.0, fo=0.3)),                    # glitch
 (47.40, 'synth-biip-erro', -22, {}),
 (47.442, 'carimbo', -17, {}),                                                # ERRO
 # ===== trigesimo primeiro: camera lenta + coracao
 (48.495, 'synth-powerdown', -22, {}),                                        # desacelera
 (48.50, 'vento-queda', -29, dict(rate=0.6, rev=True, ss=1.0, anchor=1.0, dur=1.0, fo=0.4, lp=2500)),
 (48.60, 'synth-coracao', -21, {}),
 (48.62, 'teleporte-zap-vacuo', -27, dict(rate=0.6, lp=2500, dur=1.0, fo=0.4)),  # rastro em camera lenta
 (49.40, 'synth-coracao', -22, {}),
 (50.18, 'synth-coracao', -17, {}),                                           # mao na mao
 (50.19, 'ns-chime', -25, dict(dur=1.2, fo=0.5)),
 (50.22, 'estrelinhas-tilintando', -29, dict(dur=0.8, fo=0.3)),
 # ===== pra perto e seguro
 (50.829, 'globo-espacial', -26, {}),
 (51.35, 'carimbo', -17, {}),                                                 # SEGURO
 (51.37, 'synth-ding', -21, {}),
 (52.224, 'ns-pop', -23, {}),                                                 # MESA
 (52.524, 'ns-pop', -23, dict(rate=1.2)),                                     # IATE
 (52.70, 'hud-blip', -26, {}),                                                # 2 km
 (53.081, 'swish-suave', -27, {}),                                            # setas
 (53.30, 'swish-suave', -28, dict(rate=1.15)),
 (53.955, 'ns-pop', -24, dict(rate=0.9)),
 (54.375, 'carimbo', -19, {}),                                                # SEGURO (2)
 (54.39, 'synth-ding', -25, dict(rate=1.2)),
 (55.04, 'synth-pizz', -19, {}),                                              # um passinho
 # ===== pra onde?
 (55.797, 'whoosh-corte-a', -28, dict(rate=0.9)),
 (55.947, 'ns-pop', -25, dict(rate=1.3)),
 (56.147, 'ns-pop', -25, dict(rate=1.1)),
 (56.61, 'ns-scan', -25, {}),                                                 # scanner nas fotos
 (56.62, 'scan-eletronico', -28, dict(dur=1.4, fo=0.4)),
 (58.127, 'carimbo', -15, {}),                                                # NAO ESTA NAS FOTOS
 (58.13, 'glitch-erro-buzz', -24, dict(ss=0.3, dur=0.35, fo=0.1)),
 (58.15, 'tensao-hit', -22, dict(dur=0.5, fo=0.25)),
 (58.758, 'ns-whoosh', -24, dict(rev=True, anchor=0.6)),                      # flashback
 (58.78, 'synth-rewind', -30, dict(rate=0.8, dur=0.6, fo=0.25)),
 (58.858, 'synth-ding', -22, {}),                                             # IATE
 (60.302, 'vento-queda', -25, dict(ss=1.15, rate=1.4, dur=0.6, fo=0.2)),               # zoom
 (60.70, 'synth-ding', -23, dict(rate=1.25)),                                 # VISTO AGORA
 # ===== iate: chegada + rajada + chapeu
 (61.10, 'oceano-aberto', -30, dict(dur=10.0, fi=0.3, fo=0.8)),               # mar a noite
 (70.40, 'oceano-aberto', -31, dict(ss=1.0, dur=1.3, fi=0.5, fo=0.4)),
 *zap(61.273, -15, big=True),                                                 # chegam no deck
 (61.30, 'hit-final', -21, dict(ss=0.8, dur=1.0, fo=0.5)),
 (61.50, 'boing-comico', -29, dict(rate=0.8, dur=0.4, fo=0.15)),              # capitao leva susto
 (62.473, 'vento-queda', -18, dict(ss=1.15, dur=1.4, fo=0.6)),                         # rajada (70 L)
 (62.573, 'synth-bandeira', -22, {}),                                         # bandeira
 (62.90, 'hud-blip', -26, {}),                                                # chip 70 L
 (63.309, 'ns-vento', -22, dict(ss=2.6, dur=2.2, fi=0.2, fo=0.8)),            # vento uivando
 (64.689, 'ns-sweep-sobe', -24, {}),                                          # chapeu subindo
 (65.248, 'vento-queda', -21, dict(ss=1.15, rate=0.9, dur=0.9, fo=0.4)),               # chapeu voa
 (65.978, 'splash-duplo', -19, dict(dur=1.0, fo=0.5, lp=5000)),               # TCHIBUM
 # ===== luar (66-71): so mar e trilha baixa
 (69.683, 'synth-tique', -27, dict(rate=0.8)),                                # hmm...
 (69.86, 'synth-tique', -28, dict(rate=0.7)),
 (70.368, 'boing-comico', -24, dict(rate=1.15, dur=0.6, fo=0.25)),            # ombros
 # ===== terraco: taças
 (71.657, 'whoosh-corte-a', -22, {}),
 (71.70, 'amb-calcadao-ondas-multidao', -31, dict(ss=0.5, dur=3.3, fi=0.2, fo=0.6)),  # festa
 (73.30, 'janela-vidro-tremendo', -22, dict(dur=1.1, fo=0.1)),                # vibrando (cresce)
 *seq(72.60, 0.18, 4, 'synth-taca-ding', -29, rates=[1.0, 1.08, 1.17, 1.27], lvls=[-30, -28, -26, -24], dur=0.5, fo=0.2),
 (73.317, 'vidro-quebrando', -13, {}),                                        # cascata
 (73.417, 'vidro-quebrando', -18, dict(rate=1.15, pan=-0.4)),
 (73.517, 'vidro-quebrando', -18, dict(rate=0.9, pan=0.4)),
 (73.617, 'vidro-quebrando', -20, dict(rate=1.25, pan=-0.25)),
 (73.717, 'vidro-quebrando', -20, dict(rate=0.85, pan=0.3)),
 (73.92, 'vidro-quebrando', -24, dict(rate=1.4, pan=-0.1)),
 (74.15, 'vidro-quebrando', -28, dict(rate=0.7, dur=0.8, fo=0.4, lp=5000)),   # cacos caindo
 (73.95, 'arena-multidao-ruge', -31, dict(ss=0.2, dur=0.8, fi=0.05, fo=0.4, lp=4000)),  # ohhh
 # ===== a conta
 (75.128, 'synth-kaching', -16, {}),                                          # ka-ching
 (75.735, 'carimbo', -15, {}),                                                # CONTA: ROCHA
 (75.75, 'tensao-hit', -22, dict(dur=0.5, fo=0.25)),
 (76.185, 'trombone-triste', -21, dict(rate=1.15, dur=0.6, fo=0.2)),          # wah-wah curto
]

# automacao da trilha: (t, dB) interpolado; soma ao ganho base
MUSIC_AUTO = [
 (0.0, 8), (8.5, 8), (9.5, 1), (12.0, 0),                       # intro do bed e quieta: sobe
 (36.4, 0), (36.6, -8), (37.8, -8), (38.0, 0),                  # "Tu ja viu esse lugar."
 (39.6, 0), (40.2, -3),                                         # entra a parte forte do bed (mais alta)
 (41.9, -3), (42.0, -6), (44.0, -6), (44.1, -3),                # montagem: zaps na frente
 (48.35, -3), (48.6, -13), (50.6, -13), (50.9, -3),             # camera lenta + coracao
 (61.0, -3), (61.3, -5), (65.9, -5),                            # iate: vento e mar na frente
 (66.4, -11), (71.4, -11), (71.7, -3),                          # luar: trilha suave
 (73.2, -3), (73.35, -7), (74.6, -7), (74.9, -3),               # cascata de taças
 (76.78, -3), (76.80, -80), (DUR, -80),                         # corte seco pro preto
]


def stem_path(n):
    for d in (HERE, SFX + '/ep04', SFX + '/ep03', SFX + '/ep02qi', SFX + '/ep01', SFX + '/nortesul', SFX):
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
    """LUFS integrado do stem (stems curtos: repete o arquivo p/ o medidor funcionar)"""
    if n not in _LUFS:
        p = stem_path(n)
        d = dur_of(p)
        if d < 0.5:
            loops = max(9, math.ceil(3.0 / d))
            r = subprocess.run(['ffmpeg', '-nostats', '-stream_loop', str(loops), '-i', p, '-af', 'ebur128',
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
    tmp = tempfile.mkdtemp(prefix='mix_ep05_')
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
    def inp(path):
        if path not in idx:
            idx[path] = len(inputs)
            inputs.append(path)
        return idx[path]
    iv = inp(voice)
    im = inp(stem_path(MUSIC_STEM))
    uses, plan = {}, []
    for t, n, tg, o in events:
        p = stem_path(n)
        need = o.get('ss', 0) + o.get('dur', 0)
        assert need <= dur_of(p) + 0.01, (t, n, o)   # sem loop infinito (travava o grafo)
        k = inp(p)
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
        anchor = o.get('anchor', max(ANCHOR.get(n, 0.0), ss)) - ss   # sem anchor: o ponto 'ss' cai em t
        start = t - anchor / rate
        if start < 0:
            f.append(f'atrim=start={-start:.3f},asetpts=N/SR/TB')
            start = 0
        ms = int(round(start * 1000))
        f.append(f'adelay={ms}|{ms}')
        fc.append(f'[s{j}]' + ','.join(f) + f'[e{j}]')
        sfx_labels.append(f'[e{j}]')
    # base silenciosa do tamanho exato: sem ela, quando o ultimo SFX acaba antes de DUR,
    # amix->apad entra em loop e o ffmpeg trava
    fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{DUR}[sil]')
    sfx_labels.append('[sil]')
    fc.append(''.join(sfx_labels) + f'amix=inputs={len(sfx_labels)}:normalize=0:duration=longest,apad,atrim=0:{DUR}[sfx]')
    # trilha em trechos emendados
    nseg = len(MUSIC_SEGS)
    fc.append(f'[{im}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,asplit={nseg}'
              + ''.join(f'[m{i}]' for i in range(nseg)))
    for i, (a, b, pos, fi, fo) in enumerate(MUSIC_SEGS):
        f = [f'atrim=start={a}:end={b}', 'asetpts=N/SR/TB']
        if fi: f.append(f'afade=t=in:d={fi}')
        if fo: f.append(f'afade=t=out:st={b - a - fo:.3f}:d={fo}')
        ms = int(round(pos * 1000))
        f.append(f'adelay={ms}|{ms}')
        fc.append(f'[m{i}]' + ','.join(f) + f'[mm{i}]')
    fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{DUR}[msil]')
    fc.append(''.join(f'[mm{i}]' for i in range(nseg)) + f'[msil]amix=inputs={nseg + 1}:normalize=0:duration=longest,'
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
    for path in inputs:
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
