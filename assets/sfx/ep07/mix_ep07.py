#!/usr/bin/env python3
"""Mix final do EP07 "Sem Marca" (140 s, 48 kHz estereo, -14 LUFS, TP <= -1 dBTP).

Uso:  python3 mix_ep07.py [saida.wav]
      (padrao: video-engine/public/ep07/mix.wav, copiado tambem para video-engine/out/ep07/mix.wav)

Mesmo motor do mix_ep06.py. Zero creditos do ElevenLabs: nenhum som novo foi gerado.
Narracao = clipes aprovados do Sem Marca Ep1 v2 (montados, com bipe). Trilhas = musica-bed-ep01 (mundo/ciencia)
+ musica-bed-ep02qi (lago -> fim) + musica-bed-tensa (diretor). SFX = bibliotecas raiz/ep01..ep06/nortesul.
Os instantes vem do timing.json (W(linha, palavra)), entao seguem a narracao.
"""
import json, math, os, re, shutil, subprocess, sys, tempfile

ROOT = '/home/user/V-deos-de-Ia'
SFX = ROOT + '/assets/sfx'
HERE = SFX + '/ep07'
VOICE = ROOT + '/video-engine/public/ep07/narracao.mp3'
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT + '/video-engine/public/ep07/mix.wav'
COPY = ROOT + '/video-engine/out/ep07/mix.wav'
TIMING = json.load(open(ROOT + '/video-engine/src/ep07/timing.json'))
DUR = 140.0
TARGET_LUFS = -14.0
TP_MAX = -1.0
VOICE_LUFS = -15.0
MUSIC_BASE = -21.0
HARD_CUT = DUR
SYNTH = {}

_W = {l['id']: l['words'] for l in TIMING['lines']}
def W(lid, n):
    return round(_W[lid][n]['start'], 3)

OUTRO = 133.0
LAGO = W('n10', 0)
DIRETOR = W('n12', 0)
MIADO = W('n13', 0)
# (trilha, inicio, fim, posicao, fade-in, fade-out, dB extra)
MUSIC_SEGS = [
    ('musica-bed-ep01', 0.0, LAGO + 0.6, 0.0, 0.0, 1.2, 0),
    ('musica-bed-ep02qi', 0.0, DIRETOR - LAGO + 0.4, LAGO, 0.8, 0.6, 0),
    ('musica-bed-tensa', 0.0, 20.0, DIRETOR + 0.3, 0.3, 2.0, -1),
    ('musica-bed-ep02qi', 30.0, 30.0 + (DUR - MIADO), MIADO, 1.5, 1.0, 0),
]
MUSIC_AUTO = [
    (0.0, 0), (W('n04b', 0), 0), (W('n04b', 0) + 0.05, -8), (W('n05', 0), 0),
    (W('n07', 34), 0), (W('n07', 41), -5), (W('n08', 0), 0),
    (W('n10', 9), 0), (W('n10', 11), -10), (W('n10', 16), -3),
    (W('n11', 24), -3), (W('n11', 25), -12), (W('n11', 29), 0),
    (W('n12', 8), 0), (W('n12', 9), -12), (W('d1', 0), -4),
    (OUTRO - 0.5, -2), (OUTRO, 2), (DUR, 2),
]

ANCHOR = {'carimbo': 0.33, 'hit-final': 0.92, 'whoosh-corte-a': 0.06, 'whoosh-corte-b': 0.06,
          'estalo-trovao': 0.05, 'swish-suave': 0.24, 'risadas-turma': 0.09, 'tensao-hit': 0.05,
          'trombone-triste': 0.0, 'ns-whoosh': 0.28, 'ns-shimmer': 0.13, 'record-scratch': 0.05,
          'muro-crunch': 0.12, 'splash-duplo': 0.14, 'vento-queda': 1.39, 'ns-vento': 0.54, 'synth-kaching': 0.07}

# cortes = inicio dos planos (mesma lista do Ep07.tsx)
CUT_WORDS = [('n01',5),('n02',0),('n02',8),('n02',12),('n02',16),('n03',0),('n03',4),('n04',0),('n04',5),('n04',12),
             ('n04b',0),('n05',0),('n05',8),('n06',0),('n06',8),('n06',12),('n07',0),('n07',9),('n07',16),('n07',25),
             ('n07',34),('n08',0),('n08',10),('n08',13),('n08',16),('n09',0),('n09',6),('n09a',0),('n09a',2),('n09a',14),
             ('n09b',0),('n09b',2),('n09b',9),('n09b',23),('n09c',0),('n09c',2),('n09c',11),('n09d',0),('n09d',2),('n09d',13),
             ('n09e',0),('n09e',2),('n09e',10),('n09e',19),('n09f',0),('n09f',11),('n10',0),('n10',6),('n10',10),('n10',16),
             ('n10',17),('n10',23),('n10',25),('n11',0),('n11',5),('n11',9),('n11',20),('n11',22),('n11',29),('n12',0),
             ('n12',9),('n12',15),('d1',0),('d1',8),('d1',17),('n13',0),('n13',6),('cta',0)]
CUTS = [W(l, n) for l, n in CUT_WORDS]
# cortes com efeito proprio no instante, ou em momento de silencio (sem whoosh)
CUT_SKIP = {W('n04b',0), W('n10',16), W('n11',29), W('n12',9), W('d1',0), W('d1',17), W('n13',0), W('n13',6)}
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
    out = []
    for i in range(n):
        d = dict(o)
        if rates:
            d['rate'] = rates[i % len(rates)]
        if pans:
            d['pan'] = pans[i % len(pans)]
        out.append((round(t0 + i * step, 3), stem, lvls[i % len(lvls)] if lvls else lvl, d))
    return out


EV = [
 # ===== morte: rua a noite, gato
 (0.0, 'toquio-rua-neon', -34, dict(dur=6.0, fi=0.2, fo=1.0, lp=4000)),
 (5.6, 'toquio-rua-neon', -36, dict(dur=5.6, fi=0.4, fo=1.0, lp=3000)),
 (W('n01',1), 'tensao-hit', -28, dict(dur=1.2, fo=0.4)),
 (W('n01',5), 'gato-miau', -26, dict(rate=1.1)),
 (W('n02',8), 'carro-interior-noite', -40, dict(dur=1.0)),
 (W('n02',9), 'riser-tensao', -28, dict(ss=3.0, dur=2.0, fo=0.2)),
 (W('n02',16), 'vento-queda', -28, dict(ss=1.0, dur=1.2, fo=0.3)),
 (W('n02',17), 'faceplant-plaft', -24, {}),
 (W('n03',0), 'boia-plop', -26, dict(rate=1.3)),
 (W('n03',1), 'gato-miau', -28, dict(rate=1.25)),
 (W('n03',5), 'trombone-triste', -24, {}),
 # ===== outro mundo
 (W('n04',0), 'ns-shimmer', -24, {}),
 (W('n04',2), 'estrelinhas-tilintando', -30, dict(dur=2.0, fo=0.6)),
 (W('n04',5), 'ns-passaro', -30, {}),
 (W('n04',14), 'ns-vento', -26, dict(rate=0.6, dur=2.0, fo=0.6)),
 (W('n04',20), 'vento-queda', -21, dict(rate=0.75, dur=2.2, fo=0.5)),
 (W('n04',21), 'synth-rumble', -24, dict(dur=1.6, fo=0.6)),
 (W('n04b',0), 'faceplant-plaft', -22, {}),
 (W('n05',6), 'synth-ding', -26, {}),
 (W('n05',12), 'synth-escudo-on', -24, {}),
 (W('n05',12)+0.05, 'hud-blip', -26, {}),
 # status
 (W('n06',0), 'scan-eletronico', -30, dict(dur=1.0, fo=0.3)),
 *[(W('n06',i), 'hud-blip', -27, dict(rate=r)) for i, r in ((2, 1.0), (4, 1.12), (6, 1.25))],
 (W('n06',8)+0.27, 'carta-tapa', -22, {}),
 (W('n06',8)+0.3, 'lama-schlorp', -24, {}),
 (W('n06',10), 'synth-afinador-sobe', -27, {}),
 (W('n06',10)+0.3, 'synth-kaching', -29, {}),
 (W('n06',16), 'synth-biip-erro', -24, {}),
 (W('n06',19), 'catraca-clank', -22, {}),
 # Aldoria
 (W('n07',0), 'dossie-papel', -26, {}),
 *seq(W('n07',7), 0.1, 4, 'ns-pop', -28, rates=[1.0, 1.1, 1.2, 1.3]),
 (W('n07',13), 'synth-fiuu', -25, {}),
 (W('n07',15), 'estrelinhas-tilintando', -28, dict(dur=1.4, fo=0.4)),
 *seq(W('n07',16)+0.25, 0.53, 4, 'lata-metal', -30, rates=[1.4, 1.5]),
 (W('n07',30), 'ns-chime', -26, {}),
 (W('n07',34), 'synth-rumble', -26, dict(dur=3.0, fo=1.0)),
 (W('n07',41), 'tensao-hit', -22, {}),
 # marcas
 (W('n08',7), 'synth-ting', -27, {}),
 (W('n08',10), 'carimbo', -26, {}),
 (W('n08',13), 'carimbo', -26, dict(rate=1.1)),
 (W('n08',16), 'carimbo', -26, dict(rate=0.9)),
 (W('n08',20), 'record-scratch', -30, dict(rate=1.2)),
 # cor = elemento
 *seq(W('n09',0), 0.1, 6, 'ns-plink', -29, rates=[1.0, 1.12, 1.25, 1.33, 1.5, 1.68]),
 (W('n09',10), 'synth-rabisco', -24, {}),
 (W('n09',12), 'carimbo', -22, {}),
 # fogo
 (W('n09a',0), 'ns-calor', -28, dict(dur=1.0, fo=0.4)),
 *[(W('n09a',i), 'synth-ting', -27, dict(rate=r)) for i, r in ((5, 1.0), (6, 1.12), (8, 1.25))],
 (W('n09a',11), 'synth-zing', -26, {}),
 (W('n09a',15), 'vapor-chiado', -21, dict(rate=0.6, dur=1.6, fo=0.5)),
 (W('n09a',15), 'synth-fiuu', -23, dict(rate=0.55)),
 # agua
 (W('n09b',0), 'ns-gota', -24, {}),
 (W('n09b',7), 'synth-teremim', -32, dict(dur=1.2, fo=0.4)),
 (W('n09b',10), 'synth-powerdown', -30, {}),
 (W('n09b',19), 'torneira-pia', -30, dict(dur=1.4, fi=0.2, fo=0.4)),
 (W('n09b',22), 'boia-plop', -24, {}),
 (W('n09b',24), 'synth-clink', -26, {}),
 # terra
 (W('n09c',3), 'synth-vibra-grave', -24, dict(fo=0.3)),
 (W('n09c',8), 'synth-chocalho', -28, {}),
 (W('n09c',14), 'muro-crunch', -19, {}),
 (W('n09c',14), 'synth-rumble', -24, dict(dur=1.2, fo=0.5)),
 # vento
 (W('n09d',0), 'ns-vento', -26, {}),
 (W('n09d',6), 'synth-fiuu', -28, dict(rate=0.8)),
 (W('n09d',20), 'vento-queda', -22, dict(dur=2.0, fo=0.5)),
 (W('n09d',21), 'splash-duplo', -30, dict(rate=1.2)),
 # raio
 (W('n09e',0), 'synth-bzz', -28, {}),
 (W('n09e',3), 'synth-bzzt', -27, {}),
 (W('n09e',12), 'estalo-trovao', -18, {}),
 (W('n09e',13), 'ns-contador', -30, dict(dur=1.2)),
 (W('n09e',20), 'carimbo', -24, {}),
 # dourada
 (W('n09f',0), 'ns-shimmer', -24, {}),
 (W('n09f',2), 'estrelinhas-tilintando', -28, dict(dur=2.0, fo=0.6)),
 (W('n09f',11), 'synth-taca-ding', -26, {}),
 # lago
 *seq(W('n10',0)+0.1, 0.22, 6, 'passos-sapato', -30, rates=[1.3, 1.4]),
 (W('n10',6), 'riacho-agua-corrente', -32, dict(dur=3.0, fi=0.3, fo=0.8)),
 (W('n10',11), 'synth-flatline', -27, dict(fo=0.3)),
 (W('n10',16), 'tensao-hit', -22, {}),
 (W('n10',17), 'ns-cidade', -32, dict(dur=3.2, fi=0.2, fo=0.6)),
 (W('n10',23), 'boing-comico', -32, dict(rate=1.4)),
 (W('n10',29), 'luva-couro-aperto', -22, {}),
 # cristal
 (W('n11',0), 'passos-sapato', -30, dict(dur=1.4)),
 (W('n11',6), 'ns-shimmer', -26, {}),
 (W('n11',18), 'vapor-chiado', -24, dict(rate=0.7, dur=1.2, fo=0.4)),
 (W('n11',18), 'synth-fiuu', -26, dict(rate=0.6)),
 (W('n11',20), 'synth-coracao', -24, {}),
 (W('n11',23), 'synth-tique', -30, {}),
 (W('n11',25)+0.2, 'synth-grilo', -24, {}),
 (W('n11',29), 'risadas-turma', -19, {}),
 (W('n11',31), 'risadas-turma', -23, dict(rate=1.12)),
 (W('n11',32)+0.3, 'arena-multidao-ruge', -30, dict(dur=1.6, fo=0.6, rate=1.2)),
 # diretor
 (W('n12',6), 'hit-final', -18, {}),
 (W('n12',6), 'synth-vwomp', -24, {}),
 (W('n12',16), 'passos-sapato', -32, dict(dur=1.2, rate=0.85)),
 (W('d1',8), 'synth-rewind', -30, {}),
 (W('d1',15), 'synth-rumble', -28, dict(dur=1.6, fo=0.6)),
 (W('d1',17), 'tinnitus', -36, dict(dur=1.8, fo=0.6)),
 # gato
 (W('n13',5), 'gato-miau', -20, {}),
 (W('n13',6), 'riser-tensao', -28, dict(dur=4.5, fo=0.6)),
 (W('n13',13), 'stinger-empate', -24, {}),
 (W('cta',0), 'gato-miau', -28, dict(rate=1.2)),
 (W('cta',6), 'ns-chime', -26, {}),
 # cards do encerramento (sem voz)
 (OUTRO + 0.2, 'ns-pop', -26, {}),
 (OUTRO + 1.2, 'synth-coracao', -30, {}),
 (OUTRO + 3.7, 'ns-pop', -26, dict(rate=1.15)),
 (OUTRO + 4.3, 'synth-ding', -28, {}),
 (OUTRO + 5.4, 'ns-pop', -26, dict(rate=1.3)),
 (OUTRO + 5.6, 'synth-kaching', -28, {}),
]


def stem_path(n):
    for d in (HERE, SFX + '/ep06', SFX + '/ep05', SFX + '/ep04', SFX + '/ep03', SFX + '/ep02qi', SFX + '/ep01', SFX + '/nortesul', SFX):
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
    tmp = tempfile.mkdtemp(prefix='mix_ep07_')
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
    ims = {st: inp(stem_path(st)) for st in {s[0] for s in MUSIC_SEGS}}
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
    # trilha em trechos emendados (cada trecho pode vir de uma trilha diferente da biblioteca)
    for i, (st, a, b, pos, fi, fo, db) in enumerate(MUSIC_SEGS):
        f = [f'atrim=start={a}:end={b}', 'asetpts=N/SR/TB', f'volume={MUSIC_BASE + db - stem_lufs(st):.2f}dB']
        if fi: f.append(f'afade=t=in:d={fi}')
        if fo: f.append(f'afade=t=out:st={b - a - fo:.3f}:d={fo}')
        ms = int(round(pos * 1000))
        f.append(f'adelay={ms}|{ms}')
        fc.append(f'[{ims[st]}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,' + ','.join(f) + f'[mm{i}]')
    nseg = len(MUSIC_SEGS)
    fc.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{DUR}[msil]')
    fc.append(''.join(f'[mm{i}]' for i in range(nseg)) + f'[msil]amix=inputs={nseg + 1}:normalize=0:duration=longest,'
              f'volume=\'{auto_expr(MUSIC_AUTO)}\':eval=frame,apad,atrim=0:{DUR}[mus]')
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
