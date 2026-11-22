#!/usr/bin/env python3
"""Trilha calma do video institucional NorteSul — Crise Hidrica (sintetizada, custo zero).

Pad quente (senos desafinados) + piano eletrico suave (aditivo) + pulso grave leve na parte de solucoes,
reverb por convolucao (IR de ruido com decaimento). Re maior, 76 BPM.
Saida: musica-bed-nortesul.wav (48 kHz estereo, ~165 s)

Estrutura (s):  0-12.5 intro so pad (Bm/G/A, crise)  | 12.5-55.5 piano em seminimas (D Bm G A)
                55.5-103.3 Salvador: piano mais esparso | 103.3-158 solucoes: colcheias + pulso
                157.7-fim acorde de Re resolvendo e soando ate 164,36
"""
import numpy as np, subprocess, os

SR = 48000
DUR = 165.0
BPM = 76
BEAT = 60 / BPM
BAR = 4 * BEAT
T0 = 12.47 - 4 * BAR          # compasso 4 cai no "Oi"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = HERE + '/musica-bed-nortesul.wav'
rng = np.random.default_rng(7)
N = int(SR * DUR)
t_all = np.arange(N) / SR


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)

# acordes (notas MIDI): pad em voicing medio, raiz grave
CH = {
    'D':  ([62, 66, 69, 76], 38),      # D add9 (D F# A E)
    'Bm': ([62, 66, 69, 73], 35),      # Bm7/add (D F# A C#)
    'G':  ([62, 66, 71, 74], 31),      # Gmaj7 (D F# B D)
    'A':  ([61, 64, 69, 74], 33),      # A sus4->A (C# E A D)
    'Bmi': ([59, 62, 66, 69], 35),     # Bm7 intro
}
INTRO = ['Bmi', 'Bmi', 'G', 'A']
LOOP = ['D', 'D', 'Bm', 'Bm', 'G', 'G', 'A', 'A']
NBARS = int((DUR - T0) / BAR) + 1


def chord_of(b):
    if b < 4:
        return INTRO[b]
    if b == 48:
        return 'G'
    if b == 49:
        return 'A'
    if b >= 50:
        return 'D'
    return LOOP[(b - 4) % 8]


def bar_t(b):
    return T0 + b * BAR


# ---------------------------------------------------------------- pad
padL = np.zeros(N); padR = np.zeros(N)
for b in range(NBARS):
    name = chord_of(b)
    if b > 0 and chord_of(b - 1) == name and b != 50:
        continue
    # dura enquanto o acorde se repete
    e = b + 1
    while e < NBARS and chord_of(e) == name and not (e == 50 and b < 50):
        e += 1
    ts, te = max(0.0, bar_t(b)), min(DUR, bar_t(e) + 1.6)
    if b >= 50:
        te = DUR
    i0, i1 = int(ts * SR), int(te * SR)
    tt = np.arange(i1 - i0) / SR
    L = te - ts
    att, rel = 1.4, 1.6
    env = np.minimum(1, tt / att) * np.clip((L - tt) / rel, 0, 1)
    env = env ** 1.5
    notes, root = CH[name]
    sl = np.zeros(len(tt)); sr = np.zeros(len(tt))
    for k, m in enumerate(notes + [root, root + 12]):
        f = hz(m)
        amp = 0.16 if m >= 55 else 0.22
        ph = rng.uniform(0, 2 * np.pi, 4)
        a = (np.sin(2 * np.pi * f * 0.997 * tt + ph[0]) + 0.6 * np.sin(2 * np.pi * 2 * f * tt + ph[1]) * 0.25)
        c = (np.sin(2 * np.pi * f * 1.003 * tt + ph[2]) + 0.6 * np.sin(2 * np.pi * 2 * f * tt + ph[3]) * 0.25)
        sl += amp * a; sr += amp * c
    trem = 1 + 0.12 * np.sin(2 * np.pi * 0.18 * (tt + ts))
    padL[i0:i1] += sl * env * trem; padR[i0:i1] += sr * env * trem


# ---------------------------------------------------------------- piano eletrico (aditivo)
def epiano(f, dur, vel):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 1.6)
         + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 3.0)
         + 0.12 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 5.0)
         + 0.05 * np.sin(2 * np.pi * 4.02 * f * tt) * np.exp(-tt * 8.0))
    s *= np.minimum(1, tt / 0.006) * np.clip((dur - tt) / 0.3, 0, 1)
    return vel * s

pnL = np.zeros(N); pnR = np.zeros(N)
def place(t, m, vel, dur=2.6, pan=0.0):
    i0 = int(t * SR)
    if i0 >= N or t < 0:
        return
    s = epiano(hz(m), dur, vel)
    i1 = min(N, i0 + len(s)); s = s[:i1 - i0]
    pnL[i0:i1] += s * (1 - pan) * 0.5 * 2 ** 0.5
    pnR[i0:i1] += s * (1 + pan) * 0.5 * 2 ** 0.5

PAT_Q = [0, 2, 1, 3]            # indices no arpejo (seminimas)
PAT_E = [0, 2, 1, 3, 4, 3, 1, 2]  # colcheias
for b in range(4, NBARS):
    tb = bar_t(b)
    name = chord_of(b)
    notes, root = CH[name]
    arp = [n + 12 for n in notes] + [notes[1] + 24]
    if b >= 50:
        if b == 50:     # resolucao: acorde arpejado lento e soa
            for j, m in enumerate([root + 24, notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[1] + 24]):
                place(tb + 0.85 + j * 0.16, m, 0.20 - j * 0.015, dur=5.5, pan=-0.3 + j * 0.12)
        continue
    if tb < 55.5:
        steps, pat, step, v = 4, PAT_Q, BEAT, 0.16
    elif tb < 103.3:
        steps, pat, step, v = 4, [0, 2, 1, 3], BEAT, 0.13
        if b % 2:          # mais esparso: compassos impares so 2 notas
            steps, pat, step = 2, [0, 2], 2 * BEAT
    else:
        steps, pat, step, v = 8, PAT_E, BEAT / 2, 0.12
    for j in range(steps):
        tn = tb + j * step + rng.normal(0, 0.008)
        vel = v * (1.0 if j % (steps // 2 or 1) == 0 else 0.78) * rng.uniform(0.9, 1.05)
        place(tn, arp[pat[j]], vel, pan=[-0.25, 0.2, -0.1, 0.3][j % 4])
    # baixo do piano no tempo 1
    place(tb, root + 12, v * 0.9, dur=3.2, pan=0.0)

# ---------------------------------------------------------------- pulso grave suave (solucoes)
pul = np.zeros(N)
for b in range(NBARS):
    tb = bar_t(b)
    if tb < 103.3 or b >= 50:
        continue
    root = CH[chord_of(b)][1]
    for j in range(4):
        tn = tb + j * BEAT
        i0 = int(tn * SR); n = int(0.5 * SR); tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * hz(root) * tt) * np.exp(-tt * 7) * np.minimum(1, tt / 0.01)
        i1 = min(N, i0 + n); pul[i0:i1] += 0.22 * s[:i1 - i0] * (1.0 if j in (0, 2) else 0.6)

# ---------------------------------------------------------------- mixagem + filtros + reverb (FFT)
def lowpass(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / fc) ** (2 * order)) ** 0.5, len(x))

def highpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    H = (f / fc) ** 2 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X * H, len(x))

padL = lowpass(padL, 1800); padR = lowpass(padR, 1800)
pnL = lowpass(pnL, 3500); pnR = lowpass(pnR, 3500)
pul = lowpass(pul, 200)
dryL = 0.9 * padL + pnL + pul
dryR = 0.9 * padR + pnR + pul

IRL = int(3.0 * SR); ti = np.arange(IRL) / SR
irs = []
for ch in range(2):
    ir = rng.normal(0, 1, IRL) * np.exp(-ti / 0.75)
    ir = lowpass(ir, 4500, 1)
    ir[:int(0.02 * SR)] = 0
    irs.append(ir / np.sqrt(np.sum(ir ** 2)))

def conv(x, h):
    n = len(x) + len(h)
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[:len(x)]

wetL = conv(pnL + 0.5 * padL, irs[0]); wetR = conv(pnR + 0.5 * padR, irs[1])
L = dryL + 0.55 * wetL
R = dryR + 0.55 * wetR
L = highpass(L, 45); R = highpass(R, 45)
# fade in do inicio e fim
fade = np.minimum(1, t_all / 2.5) * np.clip((DUR - t_all) / 0.8, 0, 1)
L *= fade; R *= fade
pk = max(np.abs(L).max(), np.abs(R).max())
st = (np.stack([L, R], 1) / pk * 0.7).astype(np.float32)
raw = OUT + '.raw'
st.tofile(raw)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', raw,
                '-c:a', 'pcm_s16le', OUT], check=True)
os.remove(raw)
print('ok', OUT)
