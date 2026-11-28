#!/usr/bin/env python3
"""Mix final do EP06 "Bananinha" (80,05 s, 48 kHz estereo, -14 LUFS, TP <= -1 dBTP).

Uso:  python3 mix_ep06.py [saida.wav]
      (padrao: video-engine/public/ep06/mix.wav, copiado tambem para video-engine/out/ep06/mix.wav)

Mesmo motor do mix_ep05.py. Zero creditos do ElevenLabs: nenhum som novo foi gerado.
Trilha = musica-bed-ep02qi (82 s, cabe inteira). SFX = bibliotecas raiz/ep01/ep02qi/ep03/ep04/ep05/nortesul.
Os instantes vem do timing.json (W(linha, palavra)), entao seguem a narracao automaticamente.
"""
import json, math, os, re, shutil, subprocess, sys, tempfile

ROOT = '/home/user/V-deos-de-Ia'
SFX = ROOT + '/assets/sfx'
HERE = SFX + '/ep06'
VOICE = ROOT + '/video-engine/public/ep06/narracao.mp3'
OUT = sys.argv[1] if len(sys.argv) > 1 else ROOT + '/video-engine/public/ep06/mix.wav'
COPY = ROOT + '/video-engine/out/ep06/mix.wav'
TIMING = json.load(open(ROOT + '/video-engine/src/ep06/timing.json'))
DUR = 80.05
TARGET_LUFS = -14.0
TP_MAX = -1.0
VOICE_LUFS = -15.0
MUSIC_STEM = 'musica-bed-ep02qi'
MUSIC_BASE = -21.0
MUSIC_SEGS = [(0.0, DUR, 0.0, 0.0, 0.6)]
HARD_CUT = DUR
SYNTH = {}

_W = {l['id']: l['words'] for l in TIMING['lines']}
def W(lid, n):
    return round(_W[lid][n]['start'], 3)

ANCHOR = {'carimbo': 0.33, 'hit-final': 0.92, 'whoosh-corte-a': 0.06, 'whoosh-corte-b': 0.06,
          'estalo-trovao': 0.05, 'swish-suave': 0.24, 'risadas-turma': 0.09, 'tensao-hit': 0.05,
          'trombone-triste': 0.0, 'ns-whoosh': 0.28, 'ns-shimmer': 0.13, 'record-scratch': 0.05}

# cortes = inicio dos planos (mesma lista do Ep06.tsx)
CUT_WORDS = [('L1',2),('L1',15),('L1',22),('L1',24),('L2',0),('L3',0),('L3',7),('L3',11),('L3',14),('L3',16),
             ('L4',0),('L4',4),('L4',5),('L5',0),('L5',4),('L5',9),('L5',15),('L6',0),('L6',5),('L6',7),('L7',0),
             ('L7',5),('L7',13),('L8',0),('L8',5),('L9',0),('L9',3),('L9',11),('L10',0),('L10',8),('L10',15),
             ('L11',0),('L11',3),('L11',9),('L11',13),('L12',0),('L12',11),('L12',17),('L13',0),('L13',2),
             ('L14',0),('L14',7),('L14',10),('L15',0),('L15',8),('L15',14),('L15',16),('L15',19),('L16',0),
             ('L16',2),('L17',0),('L17',7),('L17',8),('L17',15)]
CUTS = [W(l, n) for l, n in CUT_WORDS]
# cortes com efeito proprio no instante (sem whoosh)
CUT_SKIP = {W('L1',2), W('L2',0), W('L3',7), W('L4',4), W('L5',9), W('L5',15), W('L7',5), W('L9',0),
            W('L10',15), W('L11',9), W('L15',14), W('L15',16), W('L16',0), W('L16',2), W('L17',15)}
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



EV = [
 # ===== gancho: Davi pronto, "PARA!" (disco arranhado), Mateus no sofa
 (0.05, 'ns-shimmer', -28, {}),
 (W('L1',2), 'record-scratch', -20, {}),
 (W('L1',13), 'synth-ding', -28, dict(rate=1.2)),
 # banana levita, gira (poder)
 (W('L1',15), 'synth-afinador-sobe', -26, {}),
 (W('L1',16)+0.1, 'estrelinhas-tilintando', -30, dict(dur=1.6, fo=0.5)),
 (W('L1',18), 'synth-spin', -28, {}),
 (W('L1',22)+0.2, 'synth-grilo', -27, {}),                     # "Sim, bananas." cri cri
 (W('L1',24), 'synth-fiuu', -27, {}),                          # passa pelo anel
 (W('L1',27), 'synth-tung', -27, dict(rate=1.3)),              # para no milimetro
 # pedido
 (W('L2',0), 'carimbo', -24, {}),
 *seq(W('L2',0)+0.25, 0.33, 3, 'ns-pop', -27, rates=[1.0, 1.15, 1.3]),
 # escola: fogo do Kadu, Bia voa
 (W('L3',0), 'amb-calcadao-ondas-multidao', -36, dict(dur=4.0, fi=0.3, fo=0.5, lp=3000)),
 (W('L3',7), 'vapor-chiado', -24, dict(dur=1.2, fo=0.4, rate=0.7)),
 (W('L3',7), 'synth-fiuu', -24, dict(rate=0.6)),
 (W('L3',11), 'ns-vento', -27, dict(dur=1.0, fi=0.1, fo=0.4)),
 (W('L3',14), 'tensao-hit', -32, dict(rate=1.3, dur=0.6, fo=0.3)),
 (W('L3',16), 'synth-spin', -26, dict(rate=1.2)),
 (W('L3',16)+0.25, 'synth-grilo', -26, {}),
 # apelido: spray, risadas, professora
 (W('L4',0), 'ns-ar-chiado', -27, {}),
 (W('L4',4), 'risadas-turma', -22, {}),
 (W('L4',5)+0.2, 'risadas-turma', -30, dict(rate=1.15, lp=2500)),
 # torneio rodada 1
 (W('L5',0), 'arena-multidao-ruge', -27, dict(fo=0.8)),
 (W('L5',5), 'synth-fiuu', -25, {}),
 (W('L5',12), 'boing-comico', -19, {}),                        # BONK na testa
 (W('L5',15), 'risadas-turma', -21, {}),
 (W('L5',15)+0.1, 'arena-multidao-ruge', -26, dict(dur=1.6, fo=0.6, rate=1.1)),
 (W('L5',18), 'trombone-triste', -25, {}),
 # estudo: noite, descoberta, balanca
 (W('L6',0), 'synth-grilo', -33, dict(rate=0.9)),
 (W('L6',5), 'synth-ding', -24, {}),
 (W('L6',10), 'synth-clink', -28, {}),
 (W('L6',16), 'synth-tung', -26, {}),
 # velocidade: cronometros, TNT, digestao
 *seq(W('L7',0), 0.18, 6, 'synth-tique', -30, rates=[1.0, 1.2]),
 (W('L7',5)+0.2, 'pistola-largada', -30, dict(rate=1.4, dur=0.5)),
 (W('L7',7), 'estalo-trovao', -17, {}),
 (W('L7',7), 'hit-final', -24, dict(anchor=0.92)),
 *seq(W('L7',13), 0.5, 3, 'synth-tique', -32, rates=[0.8]),
 # o poder: energia no braco, liberacao
 (W('L8',0), 'synth-teremim', -27, {}),
 (W('L8',5), 'riser-tensao', -28, dict(ss=3.6, dur=1.3, fo=0.2)),
 (W('L8',10), 'synth-vwomp', -24, {}),
 # regra
 (W('L9',0), 'carimbo', -22, {}),
 (W('L9',9), 'catraca-clank', -25, {}),                        # cadeado: travada
 (W('L9',11), 'estrelinhas-tilintando', -30, dict(fo=0.5)),
 *seq(W('L9',12), 0.28, 7, 'ns-plink', -30, rates=[1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]),
 # 100 g de TNT, X; dial ate 1%; ROJAO
 (W('L10',7), 'synth-erro-duplo', -25, {}),
 (W('L10',8), 'synth-rabisco', -30, dict(dur=0.9, fo=0.3)),
 (W('L10',14), 'synth-ting', -27, {}),
 (W('L10',15)+0.1, 'estalo-trovao', -18, {}),
 (W('L10',16)+0.2, 'faceplant-plaft', -30, dict(rate=1.5, dur=0.4)),
 # treino: calendario, mosca, pai escorregando x3
 *seq(W('L11',0), 0.09, 9, 'ns-papel', -28, rates=[1.0, 1.15, 0.9]),
 (W('L11',3), 'synth-bzz', -28, dict(dur=0.6, fo=0.2)),
 (W('L11',3)+0.5, 'synth-fiuu', -26, dict(rate=1.3)),
 (W('L11',5)+0.1, 'lama-schlorp', -24, dict(rate=1.4, dur=0.5, fo=0.2)),
 (W('L11',9)+0.05, 'synth-derrapa', -22, {}),
 (W('L11',9)+0.35, 'faceplant-plaft', -21, {}),
 *seq(W('L11',13), 0.3, 3, 'faceplant-plaft', -24, rates=[1.1, 1.2, 1.3], dur=0.35, fo=0.1),
 # atrito
 (W('L12',0), 'synth-derrapa', -28, dict(rate=0.85)),
 (W('L12',7), 'hud-blip', -26, {}),
 (W('L12',11), 'synth-afinador-sobe', -28, dict(rate=0.8)),
 (W('L12',14), 'carimbo', -26, dict(rate=1.1)),
 (W('L12',17), 'estrelinhas-tilintando', -27, dict(dur=1.0, fo=0.4)),
 # final
 (W('L13',0), 'arena-multidao-ruge', -24, {}),
 (W('L13',2), 'vapor-chiado', -27, dict(dur=2.2, fi=0.4, fo=0.4, rate=0.6)),
 (W('L13',4), 'synth-rumble', -28, dict(dur=2.0, fo=0.5)),
 *seq(W('L14',2)+0.15, 0.07, 10, 'ns-pop', -28, rates=[1.0, 1.2, 0.9, 1.3, 1.1]),
 *seq(W('L14',3)+0.5, 0.07, 10, 'faceplant-plaft', -34, rates=[1.6, 1.8], dur=0.15, fo=0.05),
 (W('L14',9), 'passos-sapato', -26, dict(rate=1.6, dur=0.8, fo=0.2)),
 (W('L14',11), 'synth-derrapa', -21, {}),
 (W('L14',11)+0.2, 'synth-spin', -24, dict(rate=0.8)),
 (W('L14',12), 'arena-multidao-ruge', -27, dict(dur=1.4, fo=0.5)),
 # climax: camera lenta, para, BOOM, pure, Kadu voa
 (W('L15',0), 'riser-tensao', -26, dict(dur=3.0, fi=0.5, fo=0.3)),
 (W('L15',0), 'synth-coracao', -26, {}),
 (W('L15',8)+0.3, 'synth-coracao', -24, {}),
 (W('L15',14)+0.12, 'estalo-trovao', -14, {}),
 (W('L15',14)+0.12, 'hit-final', -18, dict(anchor=0.92)),
 (W('L15',14)+0.15, 'tinnitus', -34, dict(dur=0.8, fo=0.4)),
 (W('L15',16), 'lama-schlorp', -17, {}),
 (W('L15',16)+0.4, 'lama-schlorp', -24, dict(rate=0.8)),
 (W('L15',19), 'synth-fiuu', -22, dict(rate=0.7)),
 (W('L15',21), 'arena-multidao-ruge', -22, dict(fo=0.6)),
 # campeao / silencio
 (W('L16',0), 'stinger-empate', -24, {}),
 (W('L16',2)+0.3, 'synth-grilo', -26, {}),
 # aeroporto
 (W('L17',0), 'tensao-hit', -30, dict(rate=0.9)),
 *seq(W('L17',5), 0.11, 9, 'synth-tique', -27, rates=[1.6, 1.9, 1.4]),     # geiger
 (W('L17',8), 'metro-estacao-amb', -36, dict(dur=2.5, fi=0.3, fo=0.4)),
 (W('L17',15), 'synth-biip-erro', -18, {}),
 *seq(W('L17',15)+0.45, 0.3, 2, 'synth-alarme-bip', -22, rates=[1.0]),
 (W('L17',17), 'synth-sirene', -28, dict(dur=1.0, fo=0.3)),
 *seq(W('L17',17), 0.07, 8, 'boing-comico', -32, rates=[1.6, 1.9, 1.4, 2.1], dur=0.25, fo=0.1),
]

# automacao da trilha (dB somados ao ganho base)
MUSIC_AUTO = [
 (0.0, 0), (W('L5',17), 0), (W('L5',18), -6), (W('L6',0), -4), (W('L8',5), -4), (W('L8',10), 0),
 (W('L15',0)-0.2, 0), (W('L15',0)+0.3, -10), (W('L15',14), -10), (W('L15',14)+0.1, 2), (W('L16',0), 2),
 (W('L16',2), 2), (W('L16',2)+0.3, -30), (W('L17',0)-0.2, -30), (W('L17',0)+0.2, 0), (DUR-1.0, 0), (DUR, -6),
]


def stem_path(n):
    for d in (HERE, SFX + '/ep05', SFX + '/ep04', SFX + '/ep03', SFX + '/ep02qi', SFX + '/ep01', SFX + '/nortesul', SFX):
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
    tmp = tempfile.mkdtemp(prefix='mix_ep06_')
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
