#!/usr/bin/env python3
"""Mix final do video institucional "NorteSul — Crise Hidrica" (164,36 s, 48 kHz estereo, -14 LUFS, TP <= -1 dBTP).

Uso:  python3 mix_nortesul.py [saida.wav]
      (padrao: video-engine/public/nortesul/mix.wav, copiado tambem para video-engine/out/nortesul/mix.wav)

Tom CALMO / corporativo (nada de som de desenho). Mesmo esquema do mix_ep03.py:
  voz    -> highpass + comp 3:1 + ganho p/ VOICE_LUFS                       (sempre por cima)
  trilha -> musica-bed-nortesul.wav (sintetizada por gen_bed_nortesul.py, custo zero) + automacao
            -> sidechaincompress (chave = voz)
  SFX    -> eventos lidos dos shots.json (partA/B/C) e mapeados por regras (RULES) para stems;
            ganho = alvo - LUFS medido do stem -> bus (+ trilha silenciosa do tamanho exato, evita travar)
            -> sidechaincompress leve
  soma   -> ganho master (itera p/ -14 LUFS) -> alimiter em 192 kHz (true peak) -> 164,36 s

Stems novos (assets/sfx/nortesul/): 3 do ElevenLabs (chuva-telhado, riacho-agua-corrente, torneira-pia);
o resto e sintetizado aqui (ns-*.mp3) ou vem das bibliotecas ep01/ep02qi/ep03/raiz.
"""
import json, os, re, shutil, subprocess, sys, tempfile, zlib

ROOT = '/home/user/V-deos-de-Ia'
SFX = ROOT + '/assets/sfx'
HERE = SFX + '/nortesul'
VOICE = ROOT + '/video-engine/public/nortesul/narracao.mp3'
SHOTS = [ROOT + f'/video-engine/src/nortesul/{p}/shots.json' for p in ('partA', 'partB', 'partC')]
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT + '/video-engine/public/nortesul/mix.wav'
COPY = ROOT + '/video-engine/out/nortesul/mix.wav'
DUR = 164.36
TARGET_LUFS = -14.0
TP_MAX = -1.0
VOICE_LUFS = -15.0
MUSIC = HERE + '/musica-bed-nortesul.wav'
MUSIC_BASE = -24.5
FADE_OUT = (162.95, DUR - 162.95)   # fade final do master (narracao acaba em ~162,9)

# ---------------------------------------------------------------- sons sintetizados (custo zero)
# (expr aevalsrc, dur)  ou  ('lavfi:<fonte>', dur, '<filtros>')
SYNTH = {
    'ns-gota': ('0.6*sin(2*PI*(900*t+1500*(1-exp(-35*t))/35))*exp(-20*t)*min(1,t*3000)', 0.35),
    'ns-plink': ('(0.5*sin(2*PI*2093*t)+0.3*sin(2*PI*3310*t)*exp(-6*t)+0.2*sin(2*PI*5120*t)*exp(-12*t))*exp(-7*t)*min(1,t*2000)', 0.7),
    'ns-rangido': ('0.25*sin(2*PI*(1100*t+900*t*t)+3*sin(2*PI*31*t))*min(1,t*40)*min(1,(0.22-t)*30)', 0.22),
    'ns-blip': ('(0.5*sin(2*PI*1320*t)+0.2*sin(2*PI*2640*t)*exp(-20*t))*exp(-22*t)*min(1,t*600)', 0.3),
    'ns-blip-2': ('0.5*sin(2*PI*880*t)*exp(-25*t)*min(1,t*600)'
                  '+gte(t,0.08)*0.5*sin(2*PI*1320*(t-0.08))*exp(-16*(t-0.08))*min(1,(t-0.08)*600)', 0.5),
    'ns-erro': ('0.45*sin(2*PI*(420*t-250*t*t))*exp(-5*t)*min(1,t*400)*min(1,(0.28-t)*25)', 0.28),
    'ns-alerta': ('0.45*(sin(2*PI*110*t)+0.5*sin(2*PI*164.8*t)+0.3*sin(2*PI*220*t)+0.15*sin(2*PI*440*t))'
                  '*min(1,t/0.12)*exp(-1.4*t)*(0.85+0.15*sin(2*PI*5*t))*min(1,(1.8-t)*4)', 1.8),
    'ns-alerta-2tons': ('0.4*sin(2*PI*659*t)*exp(-6*t)*min(1,t*300)'
                        '+gte(t,0.28)*0.4*sin(2*PI*523*(t-0.28))*exp(-5*(t-0.28))*min(1,(t-0.28)*300)', 1.0),
    'ns-chime': ('+'.join(f'gte(t,{o})*0.3*(sin(2*PI*{f}*(t-{o}))+0.25*sin(2*PI*{f * 2.76:.1f}*(t-{o}))*exp(-6*(t-{o})))'
                          f'*exp(-2.6*(t-{o}))*min(1,(t-{o})*800)'
                          for f, o in ((1174.66, 0), (1479.98, 0.08), (1760.0, 0.16))), 2.2),
    'ns-assinatura': ('+'.join(f'gte(t,{o})*0.25*(sin(2*PI*{f}*(t-{o}))+0.2*sin(2*PI*{f * 2.76:.1f}*(t-{o}))*exp(-5*(t-{o})))'
                               f'*exp(-1.5*(t-{o}))*min(1,(t-{o})*800)'
                               for f, o in ((587.33, 0), (880.0, 0.12), (1174.66, 0.24), (1479.98, 0.36))), 3.5),
    'ns-queda-tom': ('0.5*(sin(2*PI*(320*t-110*t*t))+0.3*sin(2*PI*(640*t-220*t*t)))*min(1,t*20)*min(1,(1.3-t)*3)', 1.3),
    'ns-sweep-sobe': ('0.3*sin(2*PI*(420*t+300*t*t))*min(1,t*10)*min(1,(0.9-t)*6)', 0.9),
    'ns-pop': ('0.5*sin(2*PI*(700*t-2500*t*t))*exp(-40*t)*min(1,t*2000)', 0.12),
    'ns-shimmer': ('0.12*(sin(2*PI*2637*t)+sin(2*PI*3136*t+1)+sin(2*PI*3951*t+2)+sin(2*PI*4699*t+3))'
                   '*(0.6+0.4*sin(2*PI*9*t))*min(1,t*4)*min(1,(1.2-t)*3)', 1.2),
    'ns-calor': ('0.3*(sin(2*PI*220*t+1.5*sin(2*PI*3*t))+0.5*sin(2*PI*330*t+1.5*sin(2*PI*3.3*t)))'
                 '*min(1,t*2)*min(1,(1.6-t)*2)', 1.6),
    'ns-scan': ('(0.25*(sin(2*PI*120*t)+0.5*sin(2*PI*240*t))*(0.7+0.3*sin(2*PI*12*t))+0.15*sin(2*PI*(500*t+400*t*t)))'
                '*min(1,t*8)*min(1,(1.6-t)*4)', 1.6),
    'ns-bomba': ('0.3*(sin(2*PI*50*t)+0.6*sin(2*PI*100*t)+0.4*sin(2*PI*150*t)+0.2*sin(2*PI*300*t))'
                 '*(0.8+0.2*sin(2*PI*8*t))*min(1,t*2)*min(1,(3-t)*3)', 3.0),
    'ns-contador': ('0.35*sin(2*PI*2200*t)*exp(-90*mod(t,0.055))*min(1,t*800)*min(1,(1.2-t)*8)', 1.2),
    'ns-monitor': ('0.3*sin(2*PI*988*t)*lt(mod(t,0.8),0.1)*min(1,mod(t,0.8)*400)*min(1,(0.1-mod(t,0.8))*400)', 2.4),
    'ns-passaro': ('0.2*sin(2*PI*(2600*mod(t,0.22)+6000*mod(t,0.22)*mod(t,0.22)))*lt(mod(t,0.22),0.09)'
                   '*lt(t,0.66)*sin(PI*mod(t,0.22)/0.09)', 1.0),
    'ns-whoosh': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000:seed=3', 0.9,
                  "highpass=f=250,lowpass=f=2200,volume='pow(sin(PI*t/0.9),3)':eval=frame"),
    'ns-vento': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000:seed=5', 6.0,
                 "bandpass=f=600:t=h:w=500,lowpass=f=1500,volume='0.6+0.4*sin(2*PI*0.3*t)':eval=frame,"
                 "afade=t=in:d=0.8,afade=t=out:st=5.0:d=1.0"),
    'ns-cidade': ('lavfi:anoisesrc=c=brown:a=0.6:r=48000:seed=9', 4.0,
                  "lowpass=f=450,highpass=f=40,volume='0.8+0.2*sin(2*PI*0.4*t)':eval=frame,"
                  "afade=t=in:d=0.5,afade=t=out:st=3.2:d=0.8"),
    'ns-cigarra': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000:seed=11', 3.0,
                   "bandpass=f=4800:t=h:w=1500,volume='0.15+0.85*(0.5+0.5*sin(2*PI*48*t))*(0.55+0.45*sin(2*PI*0.6*t))'"
                   ":eval=frame,afade=t=in:d=0.4,afade=t=out:st=2.4:d=0.6"),
    'ns-papel': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000:seed=13', 0.16,
                 "highpass=f=1200,lowpass=f=7000,volume='exp(-25*t)':eval=frame"),
    'ns-ar-chiado': ('lavfi:anoisesrc=c=pink:a=0.6:r=48000:seed=17', 1.2,
                     "highpass=f=1500,lowpass=f=8000,volume='(0.25+0.75*gt(sin(2*PI*6*t)+sin(2*PI*10.7*t),0.4))"
                     "*min(1,(1.2-t)*4)':eval=frame,afade=t=in:d=0.05"),
}

# ponto de sincronia (s) dentro do stem
ANCHOR = {'ns-whoosh': 0.45, 'carimbo': 0.33, 'swish-suave': 0.24}

# stems de "ambiente": duram ate o fim do plano (+ EXTRA s) e fazem fade
AMBIENT = {'riacho-agua-corrente', 'chuva-telhado', 'oceano-aberto', 'ns-vento', 'ns-cidade', 'ns-cigarra',
           'amb-calcadao-ondas-multidao', 'ns-bomba', 'torneira-pia'}


def E(stem, lvl, dt=0.0, **o):
    return (dt, stem, lvl, o)


def seq(stem, lvl, n, step, rates=None, **o):
    return [E(stem, lvl, round(i * step, 3), **dict(o, **({'rate': rates[i % len(rates)]} if rates else {})))
            for i in range(n)]


def count_in(s, default):
    m = re.search(r'[x×]\s*(\d+)', s)
    return int(m.group(1)) if m else default


# ---------------------------------------------------------------- regras: (regex, f(parte, texto inteiro) -> [eventos])
# cada "what" do shots.json e dividido em partes por ' + ' e cada parte casa a PRIMEIRA regra
RULES = [
    (r'ambient pad|cama musical|space ambience|low pad|água parando|agua parando|transição pro mapa', lambda s, w: []),
    (r'rain fades', lambda s, w: [E('ns-vento', -34, 0.2)]),
    (r'rainforest', lambda s, w: [E('ns-cigarra', -39), E('ns-passaro', -37, 0.3), E('ns-passaro', -39, 1.2, rate=1.1, pan=-0.4),
                                  E('riacho-agua-corrente', -39, ss=1)]),
    (r'lever squeak|rangido', lambda s, w: [E('ns-rangido', -31, rate=0.6 if 'válvula' in w else 1.0)]),
    (r'air hiss|sputter', lambda s, w: [E('ns-ar-chiado', -31)]),
    (r'última gota|ultima gota', lambda s, w: [E('ns-gota', -27, 0.9, rate=0.9)]),
    (r'plink.*sink|sink.*plink', lambda s, w: [E('ns-plink', -29)]),
    (r'sequência|sequencia', lambda s, w: seq('ns-gota', -31, 8, 0.17, rates=[1.0, 1.15, 0.9, 1.08, 0.95, 1.2, 0.85, 1.05])),
    (r'pingando na torneira', lambda s, w: seq('ns-gota', -30, 2, 0.6, rates=[1.0, 0.92])),
    (r'gotejo', lambda s, w: seq('ns-gota', -31, 4, 0.32, rates=[1.1, 0.9, 1.2, 1.0])
                            + [E('torneira-pia', -40, ss=0.5, hp=2500, lp=7000, fi=0.3)]),
    (r'drip|gota|plink', lambda s, w: [E('ns-gota', -26)]),
    (r'whoosh|swish|airy rise', lambda s, w: [E('ns-whoosh', -36 if 'leve' in s else -34,
                                                rate=0.65 if re.search(r'slow|zoom|descida|rise|travel', s) else 1.0,
                                                pan=0.3 if 'left' in s else 0.0)]),
    (r'city ambience|urbano|ambiente de rua', lambda s, w: [E('ns-cidade', -37)]),
    (r'wind|vento', lambda s, w: [E('ns-vento', -34)]),
    (r'light-switch', lambda s, w: seq('synth-tique', -32, 5, 0.3, rates=[0.8, 0.9, 0.75, 0.85, 0.8], lp=3000)),
    (r'error blip|blip de alerta', lambda s, w: seq('ns-erro', -31, count_in(s, 1), 0.12)),
    (r'dois tons', lambda s, w: [E('ns-alerta-2tons', -29)]),
    (r'warning|alerta', lambda s, w: [E('ns-alerta', -24 if 'grave' in s or 'low warning' in s else -25)]),
    (r'number tick|contador|counter', lambda s, w: [E('ns-contador', -33, dur=0.6 if 'tick' in s else 1.2)]),
    (r'ascendentes', lambda s, w: seq('ns-blip', -30, 4, 0.22, rates=[0.9, 1.0, 1.12, 1.26])),
    (r'list ticks', lambda s, w: seq('synth-tique', -31, count_in(s, 4), 0.18, rates=[0.9], lp=4000)),
    (r'blips? ui x\s*\d|blips? x\s*\d', lambda s, w: seq('ns-blip', -31, count_in(s, 4), 0.2, rates=[1.0, 1.06, 1.12, 1.19])),
    (r'blip positivo|confirmação|confirmacao', lambda s, w: [E('ns-blip-2', -28)]),
    (r'pin drop click', lambda s, w: [E('synth-tique', -29, rate=0.7)]),
    (r'pin drop', lambda s, w: [E('synth-tique', -29, rate=0.7)]),
    (r'sonar acelerando', lambda s, w: [E('ns-blip', -31, d, rate=0.75) for d in (0, 0.3, 0.52, 0.68, 0.8)]),
    (r'sonar|bip acústico|ping', lambda s, w: [E('sonar-ping', -32, lp=3000, dur=1.2, fo=0.6)]),
    (r'blip|bip', lambda s, w: [E('ns-blip', -30)]),
    (r'street ambience|murmurs', lambda s, w: [E('amb-calcadao-ondas-multidao', -37, lp=2500)]),
    (r'bucket handle clink', lambda s, w: [E('synth-ting', -35, 0.5, rate=0.5)]),
    (r'birds|pássaros|passaros', lambda s, w: [E('ns-passaro', -37, 0.2), E('ns-passaro', -39, 1.0, rate=1.12, pan=0.4)]),
    (r'tonal drop|sweep grave', lambda s, w: [E('ns-queda-tom', -29)]),
    (r'water bubble', lambda s, w: [E('boia-plop', -32, 0.15, rate=1.2, lp=3000)]),
    (r'bottles appearing', lambda s, w: seq('ns-pop', -32, 10, 0.1, rates=[1.0, 1.1, 0.95, 1.15, 1.05])),
    (r'trees vanishing', lambda s, w: seq('ns-pop', -32, 5, 0.22, rates=[0.8, 0.9, 0.85])),
    (r'árvores|arvores', lambda s, w: seq('ns-pop', -32, 3, 0.25, rates=[1.0, 1.1, 0.9])),
    (r'casas', lambda s, w: seq('ns-pop', -32, 4, 0.12, rates=[1.1, 1.2, 1.0, 1.15])),
    (r'pop', lambda s, w: [E('ns-pop', -30)]),
    (r'heat shimmer|warm swell', lambda s, w: [E('ns-calor', -34)]),
    (r'shimmer', lambda s, w: [E('ns-shimmer', -32)]),
    (r'^ondas$', lambda s, w: [E('boia-plop', -33, 0.12, rate=0.8, lp=2000)]),
    (r'ocean|ondas|mar suave|mar/|waves|surf', lambda s, w: [E('oceano-aberto', -33, lp=5000)]),
    (r'assinatura', lambda s, w: [E('ns-assinatura', -23)]),
    (r'chime curto no fim', lambda s, w: [E('ns-chime', -27, 1.3)]),
    (r'chime|ding', lambda s, w: [E('ns-chime', -27, 0.8 if s.strip() == 'ding' else 0.0)]),
    (r'x-ray|raio-x|scanner', lambda s, w: [E('ns-scan', -32)]),
    (r'esgoto|gush|muddy', lambda s, w: [E('riacho-agua-corrente', -31, ss=2, lp=1500, rate=0.85)]),
    (r'calha', lambda s, w: [E('riacho-agua-corrente', -33, ss=4, hp=300)]),
    (r'drenando', lambda s, w: [E('riacho-agua-corrente', -32, ss=1, lp=600, rate=0.75), E('ns-queda-tom', -33, 0.3, rate=0.8)]),
    (r'barragem|rumor grave|drone', lambda s, w: [E('riacho-agua-corrente', -33, ss=3, lp=450)]),
    (r'pipe|cano|adutora|água fluindo|agua fluindo|água corrente|agua corrente',
        lambda s, w: [E('riacho-agua-corrente', -33, ss=5, lp=700)]),
    (r'river|rio correndo|riacho|fio d', lambda s, w: [E('riacho-agua-corrente', -33, ss=6)]),
    (r'leak|vazamento|spray|jato', lambda s, w: [E('torneira-pia', -33, ss=0.5, hp=1500, lp=9000)]),
    (r'slosh|spill', lambda s, w: [E('splash-duplo', -33, dur=0.6, fo=0.3, lp=4000)]),
    (r'tap trickle', lambda s, w: [E('torneira-pia', -34, ss=0.8, hp=800, lp=6000, fi=0.2)]),
    (r'enchimento', lambda s, w: [E('torneira-pia', -34, ss=1.0, lp=1500, fi=0.3)]),
    (r'chuveiro', lambda s, w: [E('torneira-pia', -32, ss=0.3, hp=600, lp=8000, fi=0.2)]),
    # torneira: o stem fecha em ~4,25 s -> ss=3,45 faz a agua parar ~0,8 s depois (no "rangido de registro")
    (r'torneira aberta', lambda s, w: [E('torneira-pia', -30, ss=3.45, fi=0.08, dur=2.0)]),
    (r'bucket set-down', lambda s, w: seq('synth-tique', -31, 3, 0.25, rates=[0.45, 0.5, 0.42], lp=2000)),
    (r'insects|cigarras|cicadas|calor', lambda s, w: [E('ns-cigarra', -38)]),
    (r'chuva aumenta', lambda s, w: [E('chuva-telhado', -32, ss=5, fi=0.5)]),
    (r'rain|chuva', lambda s, w: [E('chuva-telhado', -31, fi=0.6, ss=len(w) % 4, extra=1.8 if re.search(r'patter|telhado', s) else 0.5)]),
    (r'paper flips', lambda s, w: seq('ns-papel', -31, count_in(s, 5), 0.22, rates=[1.0, 0.9, 1.1, 0.95, 1.05])),
    (r'sweep|termômetro|termometro|traço|traco|barras subindo|barra preenchendo',
        lambda s, w: [E('ns-sweep-sobe', -33)]),
    (r'vapor|pressão|pressao', lambda s, w: [E('vapor-chiado', -35, lp=4000, dur=1.4, fo=0.8)]),
    (r'bomba', lambda s, w: [E('ns-bomba', -32 if 'ondas' not in w else -38, fi=0.4 if 'ligando' in s else 0)]),
    (r'zumbido industrial', lambda s, w: [E('ns-bomba', -39, lp=400)]),
    (r'stamp', lambda s, w: [E('carimbo', -30, lp=2500)]),
    (r'ticks de hidrômetro|ticks de hidrometro', lambda s, w: seq('synth-tique', -30, count_in(s, 3), 0.35, rates=[0.7])),
    (r'tic-tac|ticks de medidor', lambda s, w: [E('cronometro', -33, rate=1.6 if 'rápido' in s else 1.0, dur=0.9, fo=0.3, lp=4000)]),
    (r'monitor', lambda s, w: [E('ns-monitor', -33)]),
]

# automacao da trilha: (t, dB) somado ao ganho base
MUSIC_AUTO = [
    (0.0, -4), (9.6, -4), (10.6, -8), (12.2, -8), (12.7, 0),     # crise / 5%: trilha recua
    (79.1, 0), (79.35, -6), (80.8, -6), (81.4, 0),                # "54%"
    (101.8, -2), (103.3, 0), (104.5, 1),                          # solucoes: um pouco mais presente
    (158.4, 1), (159.2, 2.5), (DUR, 2.5),                         # assinatura final
]


def stem_path(n):
    for d in (HERE, SFX + '/ep03', SFX + '/ep02qi', SFX + '/ep01', SFX):
        for ext in ('mp3', 'wav'):
            p = f'{d}/{n}.{ext}'
            if os.path.exists(p):
                return p
    raise FileNotFoundError(n)


def run(args):
    subprocess.run(args, check=True)


def make_synth():
    for n, spec in SYNTH.items():
        p = f'{HERE}/{n}.mp3'
        if os.path.exists(p):
            continue
        if spec[0].startswith('lavfi:'):
            src, d, flt = spec[0][6:], spec[1], spec[2]
            run(['ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i', f'{src}:d={d}', '-af', flt,
                 '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '160k', p])
        else:
            expr, d = spec
            run(['ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i',
                 f"aevalsrc='{expr}':s=48000:d={d}", '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '160k', p])


_DUR = {}
def dur_of(p):
    if p not in _DUR:
        _DUR[p] = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                        '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
    return _DUR[p]


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
        if dur_of(p) < 1.0:
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


def load_events():
    """le os 3 shots.json e transforma cada 'what' em eventos (t, stem, alvo, opcoes)"""
    shots = []
    for f in SHOTS:
        shots += json.load(open(f))
    shots.sort(key=lambda s: s['start'])
    ev, miss = [], []
    for sh in shots:
        for c in sh.get('sfx', []):
            w = c['what'].lower()
            for part in [p.strip() for p in w.split(' + ')]:
                for rx, fn in RULES:
                    if re.search(rx, part):
                        for dt, stem, lvl, o in fn(part, w):
                            o = dict(o)
                            t = round(c['t'] + dt, 3)
                            if t >= DUR - 0.05:
                                continue
                            # variacao leve e deterministica de pitch nos blips repetidos
                            if stem == 'ns-blip' and 'rate' not in o:
                                o['rate'] = [1.0, 1.06, 0.94, 1.12][zlib.crc32(f'{t}'.encode()) % 4]
                            if stem in AMBIENT and 'dur' not in o:
                                o['dur'] = max(0.8, sh['end'] - t + o.pop('extra', 0.5))
                                o.setdefault('fo', min(0.6, o['dur'] / 3))
                                o.setdefault('fi', 0.15)
                            o.pop('extra', None)
                            ev.append((t, stem, lvl, o))
                        break
                else:
                    miss.append((c['t'], part))
    for m in miss:
        print('  (sem regra, ignorado):', m)
    return ev


def main():
    make_synth()
    if not os.path.exists(MUSIC):
        run([sys.executable, HERE + '/gen_bed_nortesul.py'])
    tmp = tempfile.mkdtemp(prefix='mix_nortesul_')
    events = sorted(load_events(), key=lambda e: e[0])

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
    im = inp(MUSIC)
    uses, plan = {}, []
    for t, n, tg, o in events:
        p = stem_path(n)
        rate = o.get('rate', 1.0)
        avail = (dur_of(p) - o.get('ss', 0)) / rate - 0.02
        if 'dur' in o:
            o['dur'] = round(min(o['dur'], avail), 3)
            if o.get('fo'):
                o['fo'] = min(o['fo'], o['dur'] / 2)
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
        anchor = o.get('anchor', ANCHOR.get(n, 0.0)) if not ss else 0.0
        start = t - anchor / rate
        if start < 0:
            f.append(f'atrim=start={-start:.3f},asetpts=N/SR/TB')
            start = 0
        ms = int(round(start * 1000))
        f.append(f'adelay={ms}|{ms}')
        fc.append(f'[s{j}]' + ','.join(f) + f'[e{j}]')
        sfx_labels.append(f'[e{j}]')
    # base silenciosa do tamanho exato (sem ela amix->apad pode travar o ffmpeg)
    fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{DUR}[sil]')
    sfx_labels.append('[sil]')
    fc.append(''.join(sfx_labels) + f'amix=inputs={len(sfx_labels)}:normalize=0:duration=longest,apad,atrim=0:{DUR}[sfx]')
    fc.append(f'[{im}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,'
              f'volume={MUSIC_BASE - measure(MUSIC)[0]:.2f}dB,volume=\'{auto_expr(MUSIC_AUTO)}\':eval=frame,'
              f'apad,atrim=0:{DUR}[mus]')
    fc.append(f'[{iv}:a]asplit=3[v][k1][k2]')
    fc.append('[mus][k1]sidechaincompress=threshold=0.05:ratio=2.5:attack=30:release=500:knee=6[mduck]')
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
             f'aresample=48000,afade=t=out:st={FADE_OUT[0]}:d={FADE_OUT[1]:.2f},apad,atrim=0:{DUR}',
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
