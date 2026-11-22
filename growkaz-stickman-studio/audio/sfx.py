"""audio/sfx.py — procedural sound-effects library (no downloads, no API keys).

  python audio/sfx.py --list                      names + descriptions
  python audio/sfx.py --demo build/sfx_demo       render every effect to WAV for auditioning
  python audio/sfx.py --make whoosh --out w.wav [--dur 0.8] [--seed 3]

Every effect returns stereo float32 at 48 kHz, peak-normalised to about -1 dBFS.
In story/shots.json a cue looks like {"at": 0.25, "name": "whoosh", "gain": -8, "dur": 0.7, "seed": 2}
("at" is seconds from the shot start; "gain" in dB; dur/seed/pitch are optional).
"""
import argparse, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from dsp import (SR, secs, t_axis, noise, lp, hp, bp, sweep_filter, env_adsr, expdec, sine, osc, stereo, as_stereo,
                 reverb, delay, fade, normalize, midi_hz, rng, write_wav)

LIB = {}
def sfx(desc, dur=1.0):
    def deco(fn):
        LIB[fn.__name__] = {"fn": fn, "desc": desc, "dur": dur}; return fn
    return deco


def _thump(n, f0=150, f1=42, tau=0.25, click=0.3, seed=0):
    t = t_axis(n); f = f1 + (f0 - f1) * np.exp(-t / 0.04)
    x = sine(f, n) * expdec(n, tau)
    x[: secs(0.004)] += noise(secs(0.004), seed) * click
    return x


@sfx("air whoosh past camera / quick movement", 0.7)
def whoosh(dur=0.7, seed=1, pitch=1.0, **_):
    n = secs(dur); x = noise(n, seed)
    y = sweep_filter(x, 300 * pitch, 3500 * pitch, q=1.6, curve=0.8) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    y += sweep_filter(noise(n, seed + 1), 120 * pitch, 900 * pitch, q=0.9) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * 0.6
    return normalize(fade(stereo(y, 0, 0.6)), -2)


@sfx("short sharp swish (arm swing, card flick, whip pan)", 0.3)
def swish(dur=0.3, seed=2, pitch=1.0, **_):
    n = secs(dur); y = sweep_filter(noise(n, seed), 1200 * pitch, 6000 * pitch, q=2.0, curve=0.6) * np.sin(np.pi * np.linspace(0, 1, n) ** 0.7) ** 2
    return normalize(fade(stereo(y, 0, 0.3)), -3)


@sfx("deep cinematic boom / impact with tail", 2.5)
def impact(dur=2.5, seed=3, pitch=1.0, **_):
    n = secs(dur); x = _thump(n, 120 * pitch, 32 * pitch, 0.6, 0.8, seed) * 1.2
    x += lp(noise(n, seed), 900) * expdec(n, 0.25) * 0.9 + hp(noise(n, seed + 1), 3000) * expdec(n, 0.04) * 0.5
    return normalize(reverb(fade(x, 0, 0.3), 2.6, 0.35, seed), -1)


@sfx("punchy short hit (body hit, ball strike, door slam)", 0.6)
def hit(dur=0.6, seed=4, pitch=1.0, **_):
    n = secs(dur); x = _thump(n, 180 * pitch, 55 * pitch, 0.12, 0.6, seed) + bp(noise(n, seed), 800, 4000) * expdec(n, 0.03) * 0.8
    return normalize(reverb(x, 0.8, 0.15, seed), -1)


@sfx("rising tension sweep into a moment (use 1-3 s before a cut)", 2.0)
def riser(dur=2.0, seed=5, pitch=1.0, **_):
    n = secs(dur); u = np.linspace(0, 1, n)
    y = sweep_filter(noise(n, seed), 300 * pitch, 7000 * pitch, q=2.5, curve=1.5) * u ** 2.2
    y += sine(110 * pitch * 2 ** (u * 2.5), n) * u ** 3 * 0.35 + sine(165 * pitch * 2 ** (u * 2.5), n) * u ** 3 * 0.2
    return normalize(fade(reverb(stereo(y, 0, 0.7), 1.5, 0.25, seed), 0.01, 0.02), -2)


@sfx("downward whoosh + low groan: time slowing down / slow motion begins", 2.2)
def slowmo(dur=2.2, seed=6, **_):
    n = secs(dur); u = np.linspace(0, 1, n)
    y = sweep_filter(noise(n, seed), 4000, 150, q=1.8, curve=0.7) * np.sin(np.pi * u) ** 0.8
    y += sine(220 * 2 ** (-u * 2.2), n) * (1 - u) ** 0.5 * 0.4 * np.minimum(1, u * 10)
    y += sine(55, n) * np.sin(np.pi * u) * 0.5
    return normalize(reverb(stereo(y, 0, 0.6), 3.0, 0.4, seed), -2)


@sfx("time-freeze: reverse swell that snaps into a shimmering high tone", 2.5)
def freeze(dur=2.5, seed=7, **_):
    n = secs(dur); k = int(n * 0.45); u = np.linspace(0, 1, k)
    sw = hp(noise(k, seed), 2500) * u ** 3
    tail_n = n - k; tt = t_axis(tail_n)
    tail = sum(sine(midi_hz(m), tail_n) * a for m, a in [(88, 0.3), (95, 0.2), (100, 0.15), (76, 0.25)]) * np.exp(-tt / 0.9)
    tail += _thump(tail_n, 90, 40, 0.5, 0.2, seed) * 0.8
    return normalize(reverb(np.concatenate([sw, tail]), 3.2, 0.45, seed), -2)


@sfx("clock tick (single)", 0.12)
def tick(dur=0.12, seed=8, pitch=1.0, **_):
    n = secs(dur); x = bp(noise(n, seed), 1800 * pitch, 5000 * pitch) * expdec(n, 0.008) + sine(2400 * pitch, n) * expdec(n, 0.01) * 0.3
    return normalize(stereo(x, 0.1), -6)


@sfx("ticking clock loop (tick-tock every 0.5 s)", 4.0)
def clock(dur=4.0, seed=9, rate=2.0, **_):
    n = secs(dur); out = np.zeros((n, 2), np.float32)
    for i, at in enumerate(np.arange(0, dur, 1 / rate)):
        s = tick(pitch=1.0 if i % 2 == 0 else 0.8, seed=seed + i); a = secs(at); m = min(len(s), n - a)
        out[a:a + m] += s[:m]
    return normalize(out, -6)


@sfx("heartbeat lub-dub (loops cleanly at 1 beat/s)", 1.0)
def heartbeat(dur=1.0, seed=10, bpm=60, **_):
    n = secs(dur); out = np.zeros(n, np.float32); beat = 60 / bpm
    for at in np.arange(0, dur, beat):
        for off, g in [(0, 1.0), (0.17, 0.7)]:
            s = _thump(secs(0.25), 70, 38, 0.07, 0.05, seed) * g; a = secs(at + off); m = min(len(s), n - a)
            if m > 0: out[a:a + m] += s[:m]
    return normalize(stereo(lp(out, 300)), -3)


@sfx("UI pop: graphic / label appears", 0.15)
def pop(dur=0.15, seed=11, pitch=1.0, **_):
    n = secs(dur); t = t_axis(n); x = sine(500 * pitch * (1 + 1.2 * (1 - np.exp(-t / 0.02))), n) * expdec(n, 0.035)
    return normalize(stereo(x), -4)


@sfx("soft UI blip / data beep", 0.12)
def blip(dur=0.12, seed=12, pitch=1.0, **_):
    n = secs(dur); x = (osc("square", 1320 * pitch, n) * 0.4 + sine(1320 * pitch, n)) * env_adsr(n, 0.003, 0.03, 0.4, 0.04)
    return normalize(stereo(lp(x, 6000)), -8)


@sfx("number counter ticking up (rapid blips)", 1.5)
def counter(dur=1.5, seed=13, **_):
    n = secs(dur); out = np.zeros((n, 2), np.float32); at = 0.0; i = 0
    while at < dur - 0.06:
        s = blip(pitch=1 + 0.02 * i, seed=seed); a = secs(at); m = min(len(s), n - a); out[a:a + m] += s[:m] * 0.6; at += 0.07; i += 1
    return normalize(out, -8)


@sfx("bright bell ding / realisation / correct", 2.0)
def ding(dur=2.0, seed=14, pitch=1.0, **_):
    n = secs(dur); t = t_axis(n); f = 1046 * pitch
    x = sum(sine(f * r, n) * a * np.exp(-t / d) for r, a, d in [(1, 1, 0.9), (2.76, 0.4, 0.4), (5.4, 0.2, 0.2), (8.9, 0.1, 0.1)])
    return normalize(reverb(stereo(x), 2.0, 0.3, seed), -4)


@sfx("magical shimmer / sparkle / superpower reveal", 2.5)
def shimmer(dur=2.5, seed=15, **_):
    n = secs(dur); out = np.zeros(n, np.float32); r = rng(seed)
    for i, m in enumerate([84, 88, 91, 96, 100, 103, 108]):
        a = secs(i * 0.07 + r.random() * 0.03); k = n - a; out[a:] += sine(midi_hz(m), k) * np.exp(-t_axis(k) / 0.6) * 0.3
    out += hp(noise(n, seed), 6000) * np.sin(np.pi * np.linspace(0, 1, n)) * 0.15
    return normalize(reverb(delay(stereo(out), 0.18, 0.4, 0.3)[:n], 2.5, 0.4, seed), -4)


@sfx("dramatic stinger: big low chord hit for reveals / cliffhangers", 3.0)
def stinger(dur=3.0, seed=16, minor=True, **_):
    n = secs(dur); t = t_axis(n); notes = [38, 45, 50, 53 if minor else 54, 57, 62]
    x = sum(osc("saw", midi_hz(m), n) * 0.18 for m in notes); x = lp(x, 1800) * np.exp(-t / 1.1)
    x += _thump(n, 110, 35, 0.7, 0.6, seed) * 0.9
    return normalize(reverb(stereo(x, 0, 0.5), 3.0, 0.4, seed), -1)


@sfx("footstep (single)", 0.3)
def footstep(dur=0.3, seed=17, **_):
    n = secs(dur); x = _thump(n, 120, 60, 0.04, 0.1, seed) * 0.8 + bp(noise(n, seed), 400, 2500) * expdec(n, 0.02) * 0.5
    return normalize(stereo(x, 0.05), -6)


@sfx("ball kick / thud", 0.5)
def kick(dur=0.5, seed=18, **_):
    n = secs(dur); x = _thump(n, 220, 70, 0.08, 0.7, seed) + bp(noise(n, seed), 1500, 6000) * expdec(n, 0.012)
    return normalize(reverb(x, 1.0, 0.15, seed), -2)


@sfx("referee whistle (trill)", 1.2)
def whistle(dur=1.2, seed=19, **_):
    n = secs(dur); t = t_axis(n); f = 2850 + 120 * np.sign(np.sin(2 * np.pi * 28 * t)) * 0.5
    x = (sine(f, n) + hp(noise(n, seed), 2000) * 0.08) * env_adsr(n, 0.02, 0.05, 0.9, 0.12)
    return normalize(reverb(stereo(x), 1.5, 0.2, seed), -6)


@sfx("car passing by (left to right)", 3.0)
def carpass(dur=3.0, seed=20, **_):
    n = secs(dur); u = np.linspace(0, 1, n); prox = np.exp(-((u - 0.5) ** 2) / 0.04)
    eng = osc("saw", 55 * (1.06 - 0.12 * (u > 0.5) * (u - 0.5) * 2), n) * 0.3
    x = (lp(noise(n, seed), 700) * 0.8 + lp(eng, 400)) * prox
    pan = np.clip((u - 0.5) * 2.2, -1, 1); l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return normalize(np.stack([x * l, x * r], 1).astype(np.float32), -3)


@sfx("phone vibrating buzz", 1.6)
def phonebuzz(dur=1.6, seed=21, **_):
    n = secs(dur); t = t_axis(n); gate = ((t % 0.8) < 0.45).astype(np.float32)
    x = lp(osc("square", 160, n), 900) * gate * (0.6 + 0.4 * np.sin(2 * np.pi * 12 * t))
    return normalize(stereo(x), -8)


@sfx("phone ringtone (two-tone)", 2.0)
def phonering(dur=2.0, seed=22, **_):
    n = secs(dur); t = t_axis(n); gate = ((t % 1.0) < 0.6).astype(np.float32) * ((t % 0.1) < 0.07)
    return normalize(stereo((sine(880, n) + sine(1100, n)) * gate * 0.5), -8)


@sfx("stadium crowd cheer / roar", 4.0)
def cheer(dur=4.0, seed=23, **_):
    n = secs(dur); u = np.linspace(0, 1, n); r = rng(seed)
    x = bp(noise(n, seed, "pink"), 300, 3500) * (0.6 + 0.4 * lp(noise(n, seed + 1), 3))
    for k in range(40):
        f0 = 300 + r.random() * 500; a = secs(r.random() * dur * 0.6); m = min(secs(0.6 + r.random()), n - a)
        if m > 0: x[a:a + m] += sweep_filter(noise(m, seed + k), f0, f0 * 1.6, q=6) * np.sin(np.pi * np.linspace(0, 1, m)) * 0.3
    x *= np.minimum(1, u * 6) * np.minimum(1, (1 - u) * 3)
    return normalize(reverb(stereo(x, 0, 1.0), 2.5, 0.4, seed), -3)


@sfx("applause / slow building clapping crowd", 4.0)
def applause(dur=4.0, seed=24, density=60, **_):
    n = secs(dur); out = np.zeros(n, np.float32); r = rng(seed); u = np.linspace(0, 1, n)
    for _k in range(int(density * dur)):
        a = secs(r.random() * dur); m = min(secs(0.03), n - a)
        if m > 0: out[a:a + m] += bp(noise(m, int(r.integers(1e6))), 800, 5000) * np.exp(-np.arange(m) / (SR * 0.006)) * r.random()
    out *= np.minimum(1, u * 2.5)
    return normalize(reverb(stereo(out, 0, 1.0), 2.0, 0.35, seed), -4)


@sfx("crowd murmur bed (loopable)", 6.0)
def murmur(dur=6.0, seed=25, **_):
    n = secs(dur); x = bp(noise(n, seed, "pink"), 200, 1800) * (0.7 + 0.3 * lp(noise(n, seed + 3), 2) * 4)
    return normalize(stereo(x, 0, 1.0), -10)


@sfx("rain ambience bed (loopable)", 6.0)
def rain(dur=6.0, seed=26, heavy=0.5, **_):
    n = secs(dur); x = hp(lp(noise(n, seed, "pink"), 7000), 300) * (0.5 + heavy * 0.5); r = rng(seed)
    for _k in range(int(dur * 120 * (0.5 + heavy))):
        a = int(r.integers(0, n - 200)); x[a:a + 120] += hp(noise(120, int(r.integers(1e6))), 2500) * np.exp(-np.arange(120) / 25) * r.random() * 0.6
    return normalize(stereo(x, 0, 1.0), -8)


@sfx("thunder crack + long rumble", 5.0)
def thunder(dur=5.0, seed=27, **_):
    n = secs(dur); t = t_axis(n)
    rumble = lp(noise(n, seed, "brown"), 180) * np.exp(-t / 1.8) * (0.6 + 0.4 * lp(noise(n, seed + 1), 4) * 5)
    crack = hp(noise(n, seed + 2), 1500) * np.exp(-t / 0.08) * 0.6
    return normalize(reverb(stereo(rumble * 2 + crack, 0, 0.8), 3.5, 0.4, seed), -1)


@sfx("wind ambience (loopable)", 6.0)
def wind(dur=6.0, seed=28, **_):
    n = secs(dur); x = sweep_filter(noise(n, seed), 250, 900, q=3) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * t_axis(n)))
    return normalize(stereo(x, 0, 1.0), -10)


@sfx("quiet room tone / interior air (loopable)", 6.0)
def roomtone(dur=6.0, seed=29, **_):
    n = secs(dur); return normalize(stereo(lp(noise(n, seed, "brown"), 400) + lp(noise(n, seed + 1, "pink"), 2500) * 0.15, 0, 1.0), -18)


@sfx("night city ambience: distant traffic hum (loopable)", 6.0)
def city(dur=6.0, seed=30, **_):
    n = secs(dur); x = lp(noise(n, seed, "brown"), 250) * 1.5 + bp(noise(n, seed + 1, "pink"), 400, 1500) * 0.2 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t_axis(n)))
    return normalize(stereo(x, 0, 1.0), -12)


@sfx("electric hum / lab machine / power-up drone", 3.0)
def hum(dur=3.0, seed=31, **_):
    n = secs(dur); x = sum(sine(60 * h, n) * a for h, a in [(1, 0.5), (2, 0.3), (3, 0.2), (5, 0.08)]) * (0.85 + 0.15 * np.sin(2 * np.pi * 3 * t_axis(n)))
    return normalize(fade(stereo(lp(x, 900)), 0.2, 0.3), -8)


@sfx("power-up: rising electric charge (gadget / machine start)", 2.0)
def powerup(dur=2.0, seed=32, **_):
    n = secs(dur); u = np.linspace(0, 1, n); x = osc("saw", 80 * 2 ** (u * 3), n) * 0.3 + sine(160 * 2 ** (u * 3), n) * 0.3
    return normalize(reverb(stereo(sweep_filter(x, 300, 6500, q=0.8, kind='lp', curve=2.0) * u ** 1.2), 1.5, 0.2, seed), -3)


@sfx("glitch / digital stutter", 0.6)
def glitch(dur=0.6, seed=33, **_):
    n = secs(dur); r = rng(seed); x = np.zeros(n, np.float32); a = 0
    while a < n - 600:
        m = int(r.integers(300, 3000)); m = min(m, n - a); x[a:a + m] = (osc("square", float(r.integers(200, 2000)), m) * 0.5 if r.random() < 0.6 else noise(m, a) * 0.5); a += m + int(r.integers(0, 1500))
    return normalize(stereo(x, 0, 0.5), -6)


@sfx("camera flash / shutter + light pop", 0.5)
def flash(dur=0.5, seed=34, **_):
    n = secs(dur); x = hp(noise(n, seed), 2000) * expdec(n, 0.03) + sine(3000, n) * expdec(n, 0.08) * 0.2
    return normalize(reverb(stereo(x), 1.2, 0.3, seed), -6)


@sfx("insect / fly buzzing past (pans left to right)", 1.5)
def buzz(dur=1.5, seed=35, **_):
    n = secs(dur); t = t_axis(n); u = np.linspace(0, 1, n)
    f = 210 + 25 * np.sin(2 * np.pi * 7 * t) + 15 * np.sin(2 * np.pi * 13 * t)
    x = lp(osc("saw", f, n), 2500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 3 * t))) * np.sin(np.pi * u) ** 0.8
    pan = np.clip(u * 2 - 1, -1, 1); l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return normalize(np.stack([x * l, x * r], 1).astype(np.float32), -6)


# ---------- Turno da Madrugada (terror PS1): ambientes de posto e efeitos ----------
def _grilos(n, seed, dens=1.0, dist=0.5):
    """chirps de grilo espalhados (trens de 3-5 pulsos ~4.5 kHz)."""
    r = rng(seed); x = np.zeros(n, np.float32); t = 0.0; dur = n / SR
    while t < dur:
        f = 4200 + r.random() * 700; k = int(r.integers(3, 6)); a = 0.4 + r.random() * 0.6
        for j in range(k):
            s = secs(t + j * 0.045); m = min(secs(0.028), n - s)
            if m > 0: x[s:s + m] += sine(f, m) * np.sin(np.pi * np.linspace(0, 1, m)) * a
        t += (0.35 + r.random() * 1.1) / dens
    return lp(x, 6000 - 2500 * dist)


@sfx("noite com grilos aqui e ali (loopable)", 6.0)
def crickets(dur=6.0, seed=40, **_):
    n = secs(dur); x = _grilos(n, seed, 1.0) * 0.5 + _grilos(n, seed + 7, 0.6, 0.9) * 0.3
    x += lp(noise(n, seed + 3, "brown"), 160) * 0.35
    return normalize(reverb(stereo(x, 0, 1.0), 1.8, 0.3, seed), -10)


@sfx("zumbido de lâmpada fluorescente (reator 120 Hz + chiado) (loopable)", 6.0)
def fluorescent(dur=6.0, seed=41, **_):
    n = secs(dur); t = t_axis(n)
    x = sum(sine(120 * h, n) * a for h, a in [(1, 0.5), (2, 0.25), (3, 0.18), (5, 0.08), (7, 0.05)])
    x = x * (0.9 + 0.1 * np.sin(2 * np.pi * 0.7 * t)) + hp(noise(n, seed), 6000) * 0.04
    return normalize(fade(stereo(lp(x, 2500), 0, 0.5), 0.05, 0.05), -12)


@sfx("loja de conveniência de madrugada: geladeira + fluorescente + grilos lá fora (loopable)", 6.0)
def conveniencia(dur=6.0, seed=42, **_):
    n = secs(dur); t = t_axis(n)
    fr = lp(sine(50, n) * 0.6 + sine(100, n) * 0.3 + osc("saw", 50, n) * 0.15, 300) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * t))
    fl = sum(sine(120 * h, n) * a for h, a in [(1, 0.3), (2, 0.15), (3, 0.1), (5, 0.04)])
    x = fr * 0.8 + lp(fl, 2000) * 0.35 + _grilos(n, seed, 0.5, 1.0) * 0.08 + lp(noise(n, seed + 1, "brown"), 300) * 0.2
    return normalize(stereo(x, 0, 0.8), -12)


@sfx("estalo e falha de lâmpada fluorescente/poste piscando", 1.2)
def flicker(dur=1.2, seed=43, **_):
    n = secs(dur); r = rng(seed); g = np.zeros(n, np.float32); a = 0
    while a < n:
        m = int(r.integers(secs(0.02), secs(0.12))); g[a:a + m] = 1.0 if r.random() < 0.55 else 0.0; a += m
    x = (sine(120, n) * 0.5 + sine(240, n) * 0.3 + hp(noise(n, seed), 3000) * 0.3) * g
    clicks = np.zeros(n, np.float32); idx = np.flatnonzero(np.abs(np.diff(g)) > 0)
    for i in idx: clicks[i:i + 200] += noise(min(200, n - i), int(i)) * np.exp(-np.arange(min(200, n - i)) / 30)
    return normalize(stereo(x + clicks * 0.8), -4)


@sfx("cafeteira pingando (gotas + chiado de vapor)", 4.0)
def cafeteira(dur=4.0, seed=44, **_):
    n = secs(dur); r = rng(seed); x = hp(noise(n, seed, "pink"), 2500) * 0.05 * (0.6 + 0.4 * lp(noise(n, seed + 1), 3) * 6)
    t = 0.1
    while t < dur - 0.1:
        s = secs(t); m = min(secs(0.06), n - s); f = 700 + r.random() * 500
        x[s:s + m] += sine(f * (1 + 1.5 * np.exp(-np.arange(m) / 400)), m) * np.exp(-np.arange(m) / (SR * 0.012)) * 0.7
        t += 0.35 + r.random() * 0.5
    return normalize(reverb(stereo(x), 0.6, 0.15, seed), -6)


@sfx("chiado de TV de tubo / estática + zumbido de 15 kHz", 2.0)
def tv_static(dur=2.0, seed=45, **_):
    n = secs(dur); x = bp(noise(n, seed), 800, 9000) * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 60 * t_axis(n)))) + sine(15700, n) * 0.04
    return normalize(fade(stereo(x, 0, 0.4), 0.01, 0.15), -6)


@sfx("pancadas no vidro (3 batidas secas na porta de vidro)", 1.6)
def glass_knock(dur=1.6, seed=46, **_):
    n = secs(dur); x = np.zeros(n, np.float32)
    for k, a in [(0.0, 1.0), (0.38, 0.85), (0.74, 1.0)]:
        s = secs(k); m = min(secs(0.5), n - s); tt = t_axis(m)
        y = _thump(m, 260, 120, 0.05, 0.5, seed + int(k * 10)) * 0.6 + sum(sine(f, m) * np.exp(-tt / 0.09) * w for f, w in [(1850, 0.3), (2930, 0.2), (4400, 0.1)])
        x[s:s + m] += y * a
    return normalize(reverb(stereo(x), 0.9, 0.25, seed), -1)


@sfx("porta rangendo devagar (dobradiça)", 2.6)
def door_creak(dur=2.6, seed=47, **_):
    n = secs(dur); u = np.linspace(0, 1, n); f = 180 + 140 * np.sin(np.pi * u * 1.3) + 40 * lp(noise(n, seed), 4) * 10
    gate = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(28 + 20 * u) / SR))
    x = osc("saw", f, n) * gate * np.sin(np.pi * u) ** 0.5
    x = bp(x, 300, 3000) + bp(noise(n, seed + 2), 1500, 4000) * 0.05
    return normalize(reverb(stereo(x), 1.6, 0.3, seed), -3)


@sfx("batida de carro distante: estrondo abafado + metal + eco", 4.5)
def distant_crash(dur=4.5, seed=48, **_):
    n = secs(dur); t = t_axis(n); x = lp(_thump(n, 90, 30, 0.7, 0.4, seed), 400) * 1.4
    x += lp(noise(n, seed, "brown"), 300) * np.exp(-t / 0.9) * 0.8
    r = rng(seed)
    for k in range(8):
        s = secs(0.05 + r.random() * 0.6); m = min(secs(0.4), n - s)
        x[s:s + m] += lp(bp(noise(m, seed + k), 600, 2500) * np.exp(-np.arange(m) / (SR * 0.06)), 1800) * 0.25
    return normalize(reverb(stereo(lp(x, 1500), 0, 0.6), 3.5, 0.55, seed), -1)


@sfx("sininho de porta de loja (sino de entrada)", 1.8)
def door_chime(dur=1.8, seed=49, **_):
    n = secs(dur); t = t_axis(n); x = np.zeros(n, np.float32)
    for k, f in [(0.0, 1568), (0.09, 1319), (0.2, 1568)]:
        s = secs(k); m = n - s; tt = t_axis(m)
        x[s:] += (sine(f, m) + sine(f * 2.76, m) * 0.25) * np.exp(-tt / 0.5) * 0.5
    return normalize(reverb(stereo(x), 1.0, 0.2, seed), -4)


@sfx("metal arrastando no asfalto com faíscas (passa da direita pra esquerda)", 4.0)
def metal_drag(dur=4.0, seed=50, **_):
    n = secs(dur); u = np.linspace(0, 1, n); prox = np.exp(-((u - 0.45) ** 2) / 0.05)
    x = bp(noise(n, seed), 1500, 7000) * (0.5 + 0.5 * np.abs(lp(noise(n, seed + 1), 30) * 8)) + osc("saw", 90 + 30 * lp(noise(n, seed + 2), 5) * 10, n) * 0.15
    x = x * prox + lp(noise(n, seed + 3, "brown"), 200) * prox * 0.6
    pan = np.clip((0.5 - u) * 2.2, -1, 1); l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return normalize(np.stack([x * l, x * r], 1).astype(np.float32), -3)


@sfx("motor de caminhão ligando e indo embora (diesel)", 5.0)
def truck_leave(dur=5.0, seed=51, **_):
    n = secs(dur); u = np.linspace(0, 1, n); f = 32 + 18 * np.clip(u * 2.5, 0, 1) + 10 * u
    eng = osc("saw", f, n) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * np.cumsum(f * 0.5) / SR)))
    x = lp(eng, 380) + lp(noise(n, seed, "brown"), 250) * 0.4
    x *= np.minimum(1, u * 8) * (1 - u) ** 1.2
    return normalize(reverb(stereo(x, 0.3, 0.4), 1.5, 0.2, seed), -3)


@sfx("subgrave de tensão crescendo (drone de terror)", 6.0)
def dread(dur=6.0, seed=52, **_):
    n = secs(dur); u = np.linspace(0, 1, n)
    x = osc("saw", 41 + 2 * u, n) * 0.5 + osc("saw", 41.7 + 3 * u, n) * 0.5 + sine(82, n) * 0.3
    x = sweep_filter(x, 120, 900, q=0.9, kind="lp", curve=1.4) * (u ** 1.3) + bp(noise(n, seed), 2000, 6000) * 0.03 * u ** 3
    return normalize(reverb(stereo(x, 0, 0.6), 2.5, 0.3, seed), -3)



# ---------- Turno da Madrugada v2: foley e ambiente pedidos pelo usuário ----------
@sfx("ambiente da loja de madrugada: reator de fluorescente agudo + geladeira comercial grave abafada + vento leve nas frestas (loopable)", 8.0)
def madrugada(dur=8.0, seed=60, **_):
    n = secs(dur); t = t_axis(n)
    fl = sum(sine(120 * h, n) * a for h, a in [(1, 0.22), (2, 0.14), (3, 0.12), (4, 0.06), (6, 0.05)]) + hp(noise(n, seed), 7000) * 0.025
    fl = fl * (0.92 + 0.08 * np.sin(2 * np.pi * 0.31 * t))
    fr = lp(sine(55, n) * 0.6 + osc("saw", 55, n) * 0.2 + sine(110, n) * 0.2, 220) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * t))
    wnd = bp(noise(n, seed + 3, "pink"), 300, 1400) * (0.35 + 0.65 * np.clip(lp(noise(n, seed + 4), 0.6) * 25, 0, 1)) * 0.25
    x = lp(fl, 3200) * 0.5 + fr * 0.9 + wnd
    return normalize(stereo(x, 0, 0.7, seed), -12)


@sfx("passo de bota no piso cerâmico (estalo seco + corpo grave)", 0.35)
def boots_tile(dur=0.35, seed=61, **_):
    n = secs(dur); x = _thump(n, 180, 70, 0.05, 0.6, seed) * 0.7
    k = secs(0.006); x[:k] += hp(noise(k, seed + 1), 2500) * 0.9
    x += bp(noise(n, seed + 2), 1800, 5000) * expdec(n, 0.012) * 0.5
    return normalize(reverb(stereo(x), 0.5, 0.18, seed), -3)


@sfx("bipe da caixa registradora (2 bipes curtos)", 0.5)
def register_beep(dur=0.5, seed=62, **_):
    n = secs(dur); x = np.zeros(n, np.float32)
    for k in (0.0, 0.16):
        s = secs(k); m = min(secs(0.09), n - s); x[s:s + m] += osc("square", 2350, m) * env_adsr(m, 0.002, 0.02, 0.8, 0.02) * 0.4
    return normalize(reverb(stereo(lp(x, 6000)), 0.4, 0.12, seed), -6)


@sfx("estalo de interruptor de luz", 0.25)
def switch_click(dur=0.25, seed=63, **_):
    n = secs(dur); x = np.zeros(n, np.float32)
    for k, a in ((0.0, 1.0), (0.018, 0.6)):
        s = secs(k); m = secs(0.03); x[s:s + m] += bp(noise(m, seed + int(k * 1000)), 1500, 7000) * expdec(m, 0.004) * a
    return normalize(reverb(stereo(x), 0.4, 0.15, seed), -4)


@sfx("unhas arranhando o vidro devagar (agudo, áspero)", 2.4)
def glass_scratch(dur=2.4, seed=64, **_):
    n = secs(dur); u = np.linspace(0, 1, n)
    f = 2600 + 700 * np.sin(2 * np.pi * 0.6 * u) + 300 * lp(noise(n, seed), 6) * 20
    stick = np.clip(0.5 + 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(38 + 25 * u) / SR)) * 0.8 + lp(noise(n, seed + 1), 40) * 6, 0, 1)
    x = (osc("saw", f, n) * 0.25 + bp(noise(n, seed + 2), 2000, 7000) * 0.6) * stick * np.sin(np.pi * u) ** 0.6
    return normalize(reverb(stereo(bp(x, 900, 9000), 0, 0.3), 0.8, 0.2, seed), -4)


@sfx("passos lentos e arrastados no asfalto molhado (lá fora)", 4.0)
def drag_steps(dur=4.0, seed=65, **_):
    n = secs(dur); x = np.zeros(n, np.float32); r = rng(seed); t = 0.15
    while t < dur - 0.6:
        s = secs(t); m = min(secs(0.7), n - s); tt = np.linspace(0, 1, m)
        x[s:s + m] += lp(noise(m, seed + s), 900) * np.exp(-tt * 3) * np.sin(np.pi * tt) * 0.8           # arrasto
        k = min(secs(0.06), n - s); x[s:s + k] += lp(_thump(k, 120, 50, 0.03, 0.4, seed), 600)[:k] * 0.8 # pisada
        w = min(secs(0.25), n - s); x[s:s + w] += bp(noise(w, seed + 9 + s), 1500, 5000) * expdec(w, 0.05) * 0.25   # água
        t += 0.95 + r.random() * 0.4
    return normalize(reverb(stereo(lp(x, 3000), 0, 0.5), 1.8, 0.35, seed), -5)


@sfx("chiado de rádio (estática com sintonia flutuando)", 3.0)
def radio_static(dur=3.0, seed=66, **_):
    n = secs(dur); t = t_axis(n)
    x = bp(noise(n, seed), 400, 4000) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * t)) + osc("sine", 900 + 400 * np.sin(2 * np.pi * 0.7 * t), n) * 0.06
    x *= (lp(noise(n, seed + 1), 8) * 10 > -0.6).astype(np.float32) * 0.8 + 0.2
    return normalize(fade(stereo(x, 0, 0.3), 0.05, 0.2), -8)


@sfx("pad grave e lento de sintetizador (perigo chegando, sem melodia)", 8.0)
def synth_pad(dur=8.0, seed=67, **_):
    n = secs(dur); u = np.linspace(0, 1, n)
    x = sum(osc("saw", f * (1 + 0.003 * k), n) * 0.25 for k, f in enumerate([55.0, 55.4, 65.4, 82.4]))
    x = sweep_filter(x, 180, 520, q=0.7, kind="lp", curve=1.0) * np.sin(np.pi * u) ** 1.2
    return normalize(reverb(stereo(x, 0, 0.8, seed), 3.0, 0.45, seed), -4)


@sfx("rebobinar fita VHS: motor acelerando + chiado agudo + clique do cabeçote", 2.2)
def vhs_rewind(dur=2.2, seed=68, **_):
    n = secs(dur); u = np.linspace(0, 1, n); x = np.zeros(n, np.float32)
    k = secs(0.04); x[:k] += bp(noise(k, seed), 800, 5000) * expdec(k, 0.008)
    run = n - secs(0.7); uu = np.linspace(0, 1, run)
    f = 300 + 2600 * uu ** 0.7
    x[k:k + run - k] += (osc("saw", f[:run - k], run - k) * 0.12 + bp(noise(run - k, seed + 1), 2500, 9000) * 0.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * uu[:run - k]))) * np.minimum(1, uu[:run - k] * 6)
    s = run; m = secs(0.05); x[s:s + m] += bp(noise(m, seed + 2), 600, 4000) * expdec(m, 0.01) * 1.2   # clique (stop)
    s2 = run + secs(0.25); m2 = n - s2; x[s2:] += lp(noise(m2, seed + 3), 3000) * 0.15 * np.linspace(1, 0, m2)
    return normalize(stereo(x, 0, 0.3), -4)


# ---------- A Estação: cidade à noite, metrô, banheiro, o "outro lado", casa; salto da Lívia por superfície ----------
def _salto(seed, bright=4200, body=0.18, pitch=1.0):
    """um toque de salto bloco baixo: clique curto e claro + corpo grave pequeno; variação leve por passo"""
    r = rng(seed); n = secs(0.22); f = (1 + (r.random() - 0.5) * 0.12) * (pitch or 1.0); a = 0.8 + r.random() * 0.25
    k = secs(0.012); x = np.zeros(n, np.float32)
    x[:k] += bp(noise(k, seed), bright * 0.6 * f, min(bright * 1.6 * f, 15000)) * expdec(k, 0.0025)
    x += sine(1900 * f, n) * expdec(n, 0.006) * 0.25 + sine(2900 * f, n) * expdec(n, 0.004) * 0.12
    x += _thump(n, 240 * f, 110 * f, 0.025, 0.1, seed) * body
    return x * a


@sfx("salto na calçada/asfalto (seco, leve)", 0.25)
def salto(dur=0.25, seed=70, pitch=1.0, **_):
    return normalize(reverb(stereo(lp(_salto(seed, 3800, 0.2, pitch), 7000)), 0.35, 0.08, seed), -6)


@sfx("salto no piso da estação (claro, reverb curto de azulejo)", 0.8)
def salto_estacao(dur=0.8, seed=71, pitch=1.0, **_):
    x = np.zeros(secs(dur), np.float32); y = _salto(seed, 4800, 0.14, pitch); x[:len(y)] += y
    return normalize(reverb(stereo(x), 0.9, 0.3, seed), -6)


@sfx("salto no azulejo molhado do banheiro (eco curto, úmido)", 0.9)
def salto_banheiro(dur=0.9, seed=72, pitch=1.0, **_):
    x = np.zeros(secs(dur), np.float32); y = _salto(seed, 4200, 0.16, pitch) + bp(noise(secs(0.22), seed + 3), 1500, 5000) * expdec(secs(0.22), 0.02) * 0.12; x[:len(y)] += y
    return normalize(reverb(stereo(x), 1.2, 0.38, seed), -6)


@sfx("salto ecoando na rua vazia do outro lado (eco longo e solitário)", 2.6)
def salto_eco(dur=2.6, seed=73, pitch=1.0, **_):
    x = np.zeros(secs(dur), np.float32); y = _salto(seed, 4000, 0.22, pitch); x[:len(y)] += y
    x = x + delay(x, 0.34, 0.32) * 0.8 if False else x
    e = np.zeros_like(x)
    for k, (d, g) in enumerate([(0.31, 0.38), (0.63, 0.22), (0.97, 0.12), (1.36, 0.06)]):
        s0 = secs(d); e[s0:] += lp(x[:len(x) - s0], 3500 - k * 700) * g
    return normalize(reverb(stereo(x + e, 0, 0.7), 2.8, 0.42, seed), -6)


@sfx("salto no piso de casa (abafado, macio)", 0.3)
def salto_casa(dur=0.3, seed=74, pitch=1.0, **_):
    return normalize(reverb(stereo(lp(_salto(seed, 2600, 0.3, pitch), 3200)), 0.4, 0.12, seed), -8)


@sfx("centro de SP à noite: trânsito, motores, murmúrio de gente, buzinas longe (loopable)", 6.0)
def cidade_noite(dur=6.0, seed=75, **_):
    n = secs(dur); t = t_axis(n); r = rng(seed)
    x = lp(noise(n, seed, "brown"), 300) * 1.2 + bp(noise(n, seed + 1, "pink"), 300, 1800) * 0.35 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t))
    mur = bp(noise(n, seed + 2, "pink"), 250, 2500) * (0.5 + 0.5 * np.abs(lp(noise(n, seed + 3), 3) * 8)) * 0.35   # murmúrio de multidão
    x = x + mur
    for k in range(2):
        s = secs(r.random() * (dur - 0.8)); m = secs(0.35 + r.random() * 0.4); f = 380 + r.random() * 120
        x[s:s + m] += lp(osc("square", f, m) * 0.15 + osc("square", f * 1.26, m) * 0.1, 1800) * np.sin(np.pi * np.linspace(0, 1, m)) ** 0.3 * 0.5
    return normalize(reverb(stereo(x, 0, 1.0), 1.2, 0.2, seed), -12)


@sfx("buzina de carro (curta, duas vezes)", 1.0)
def buzina(dur=1.0, seed=76, pitch=1.0, **_):
    n = secs(dur); x = np.zeros(n, np.float32); f = 410 * (pitch or 1)
    for a, l in ((0.0, 0.18), (0.26, 0.42)):
        s = secs(a); m = min(secs(l), n - s); x[s:s + m] += lp(osc("square", f, m) * 0.5 + osc("square", f * 1.25, m) * 0.35, 2500) * env_adsr(m, 0.01, 0.05, 0.9, 0.04)
    return normalize(reverb(stereo(x, 0, 0.4), 0.8, 0.2, seed), -4)


@sfx("ônibus passando (motor diesel + ar do freio)", 4.0)
def onibus(dur=4.0, seed=77, **_):
    n = secs(dur); u = np.linspace(0, 1, n); prox = np.exp(-((u - 0.5) ** 2) / 0.06)
    x = lp(osc("saw", 45 + 8 * u, n), 400) * 0.7 + lp(noise(n, seed, "brown"), 500) * 0.6
    x *= prox; s = secs(dur * 0.62); m = secs(0.5); x[s:s + m] += hp(noise(m, seed + 2), 3000) * np.exp(-np.linspace(0, 4, m)) * 0.3
    pan = np.clip((u - 0.5) * 2, -1, 1); return normalize(np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1).astype(np.float32), -3)


@sfx("motoboy passando (motor 2T agudo, efeito doppler)", 2.5)
def moto_passa(dur=2.5, seed=78, **_):
    n = secs(dur); u = np.linspace(0, 1, n); f = 140 * (1.12 - 0.24 * (1 / (1 + np.exp(-(u - 0.5) * 12))))
    x = lp(osc("saw", f, n), 1800) * np.exp(-((u - 0.5) ** 2) / 0.05) + bp(noise(n, seed), 500, 3000) * 0.1 * np.exp(-((u - 0.5) ** 2) / 0.05)
    pan = np.clip((0.5 - u) * 2.2, -1, 1); return normalize(np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1).astype(np.float32), -4)


@sfx("estação de metrô: ar-condicionado, murmúrio baixo, trem distante (loopable)", 6.0)
def estacao(dur=6.0, seed=79, **_):
    n = secs(dur); t = t_axis(n)
    x = lp(noise(n, seed, "pink"), 900) * 0.4 + lp(noise(n, seed + 1, "brown"), 120) * 0.9 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.09 * t)) + bp(noise(n, seed + 2, "pink"), 300, 2000) * 0.12
    return normalize(reverb(stereo(x, 0, 1.0), 2.2, 0.35, seed), -14)


@sfx("bipe da catraca + destrava (clique metálico)", 0.8)
def catraca(dur=0.8, seed=80, **_):
    n = secs(dur); x = np.zeros(n, np.float32); m = secs(0.14)
    x[:m] += osc("square", 1750, m) * env_adsr(m, 0.002, 0.02, 0.8, 0.02) * 0.35
    s = secs(0.22); k = secs(0.06); x[s:s + k] += bp(noise(k, seed), 800, 5000) * expdec(k, 0.01) * 0.9
    s = secs(0.45); x[s:s + k] += _thump(k, 300, 160, 0.02, 0.3, seed) * 0.6
    return normalize(reverb(stereo(x), 0.6, 0.2, seed), -5)


@sfx("aviso sonoro da estação (ding-dong de três notas)", 2.4)
def aviso(dur=2.4, seed=81, **_):
    n = secs(dur); x = np.zeros(n, np.float32)
    for k, f in [(0.0, 659), (0.32, 523), (0.64, 784)]:
        s = secs(k); m = n - s; tt = t_axis(m); x[s:] += (sine(f, m) + sine(f * 2, m) * 0.2) * np.exp(-tt / 0.6) * 0.5
    return normalize(reverb(stereo(x), 2.0, 0.35, seed), -5)


@sfx("trem do metrô chegando: zumbido elétrico subindo, rodas nos trilhos, freio chiando", 6.0)
def trem(dur=6.0, seed=82, **_):
    n = secs(dur); u = np.linspace(0, 1, n); env = np.clip(u * 2.2, 0, 1) * (1 - np.clip((u - 0.75) * 4, 0, 1) * 0.5)
    x = lp(noise(n, seed, "brown"), 400) * env * 1.2 + sine(220 + 180 * np.clip(u * 1.6, 0, 1), n) * 0.12 * env
    clack = np.zeros(n, np.float32); t = 0.6
    while t < dur - 0.2: s = secs(t); m = secs(0.05); clack[s:s + m] += _thump(m, 180, 80, 0.02, 0.4, int(t * 10)) * 0.5; t += 0.32 + 0.25 * (t / dur)
    x += clack * env; s = secs(dur * 0.7); m = n - s; x[s:] += bp(noise(m, seed + 1), 3000, 7000) * np.sin(np.pi * np.linspace(0, 1, m)) * 0.18
    return normalize(reverb(stereo(x, 0, 0.8), 2.5, 0.35, seed), -3)


@sfx("banheiro público: zumbido de fluorescente + goteira + cano (loopable)", 6.0)
def banheiro(dur=6.0, seed=83, **_):
    n = secs(dur); t = t_axis(n); x = sum(sine(120 * h, n) * a for h, a in [(1, 0.25), (2, 0.18), (3, 0.1), (5, 0.05)]) * 0.5 + hp(noise(n, seed), 6000) * 0.02
    x += lp(noise(n, seed + 4, "brown"), 150) * 0.3
    r = rng(seed); tt = 0.4
    while tt < dur - 0.2:
        s = secs(tt); m = secs(0.12); f = 900 + r.random() * 300; x[s:s + m] += sine(f * (1 + 0.8 * np.exp(-np.arange(m) / 300)), m) * np.exp(-np.arange(m) / (SR * 0.02)) * 0.5; tt += 1.1 + r.random() * 0.8
    return normalize(reverb(stereo(x, 0, 0.6), 1.4, 0.3, seed), -12)


@sfx("papel higiênico rasgando", 0.6)
def papel(dur=0.6, seed=84, **_):
    n = secs(dur); u = np.linspace(0, 1, n); x = bp(noise(n, seed), 1500, 9000) * (np.abs(lp(noise(n, seed + 1), 60)) * 14 > 0.4) * np.sin(np.pi * u) ** 0.5
    return normalize(reverb(stereo(x * 0.8), 0.7, 0.2, seed), -6)


@sfx("descarga de vaso (válvula + água descendo)", 4.0)
def descarga(dur=4.0, seed=85, **_):
    n = secs(dur); u = np.linspace(0, 1, n); k = secs(0.05); x = np.zeros(n, np.float32); x[:k] += _thump(k, 220, 100, 0.02, 0.5, seed)
    agua = bp(noise(n, seed + 1, "pink"), 300, 3500) * np.clip(u * 8, 0, 1) * (1 - u) ** 1.5 + lp(noise(n, seed + 2, "brown"), 250) * 0.6 * np.sin(np.pi * np.clip(u * 1.3, 0, 1))
    gorg = sine(180 + 140 * lp(noise(n, seed + 3), 6) * 10, n) * 0.1 * (u > 0.4) * (1 - u)
    return normalize(reverb(stereo(x + agua + gorg, 0, 0.5), 1.3, 0.35, seed), -3)


@sfx("torneira aberta (água caindo na pia)", 3.0)
def torneira(dur=3.0, seed=86, **_):
    n = secs(dur); u = np.linspace(0, 1, n); x = bp(noise(n, seed, "pink"), 600, 6000) * np.clip(u * 12, 0, 1) * np.clip((1 - u) * 8, 0, 1) * (0.8 + 0.2 * lp(noise(n, seed + 1), 8) * 10)
    return normalize(reverb(stereo(x, 0, 0.4), 1.0, 0.25, seed), -6)


@sfx("porta de cabine batendo (madeira/fórmica + trinco solto)", 1.0)
def porta_bate(dur=1.0, seed=87, **_):
    n = secs(dur); x = _thump(n, 160, 60, 0.08, 0.6, seed) * 0.9; s = secs(0.09); m = secs(0.08); x[s:s + m] += bp(noise(m, seed + 1), 1200, 6000) * expdec(m, 0.012) * 0.4
    return normalize(reverb(stereo(x), 1.2, 0.3, seed), -2)


@sfx("o outro lado: quase silêncio, vento baixo, zumbido grave contínuo (loopable)", 6.0)
def outro_lado(dur=6.0, seed=88, **_):
    n = secs(dur); t = t_axis(n)
    wnd = bp(noise(n, seed, "pink"), 120, 700) * (0.4 + 0.6 * np.clip(lp(noise(n, seed + 1), 0.4) * 30, 0, 1)) * 0.5
    dr = (sine(38, n) * 0.5 + sine(57.2, n) * 0.25 + sine(76.3, n) * 0.12) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t))
    x = wnd + lp(dr, 200) + hp(noise(n, seed + 2), 8000) * 0.006
    return normalize(reverb(stereo(x, 0, 0.9), 3.0, 0.4, seed), -16)


@sfx("tique-taque de relógio de parede (loopable)", 6.0)
def tique(dur=6.0, seed=89, **_):
    n = secs(dur); x = np.zeros(n, np.float32)
    for i in range(int(dur)):
        s = secs(i); m = secs(0.04); x[s:s + m] += bp(noise(m, seed + i), 1500 if i % 2 else 2200, 6000) * expdec(m, 0.004) * 0.7
    x += lp(noise(n, seed + 99, "brown"), 120) * 0.05
    return normalize(reverb(stereo(x), 0.8, 0.25, seed), -14)


@sfx("chave entrando e girando na fechadura + trinco abrindo", 1.6)
def chave(dur=1.6, seed=90, **_):
    n = secs(dur); x = np.zeros(n, np.float32)
    s = 0; m = secs(0.35); x[s:s + m] += bp(noise(m, seed), 2500, 9000) * np.sin(np.pi * np.linspace(0, 1, m)) * 0.25   # entrando
    for a, g in ((0.55, 0.7), (0.8, 0.5), (1.05, 1.0)):
        s = secs(a); k = secs(0.05); x[s:s + k] += (bp(noise(k, seed + int(a * 9)), 900, 6000) * expdec(k, 0.008) + _thump(k, 400, 200, 0.01, 0.2, seed)[:k] * 0.3) * g
    return normalize(reverb(stereo(x), 0.7, 0.2, seed), -4)


@sfx("portão de ferro abrindo (rangido metálico + trinco)", 2.0)
def portao(dur=2.0, seed=91, **_):
    n = secs(dur); u = np.linspace(0, 1, n); k = secs(0.06); x = np.zeros(n, np.float32); x[:k] += bp(noise(k, seed), 700, 4000) * expdec(k, 0.01)
    f = 520 + 260 * np.sin(np.pi * u) + 60 * lp(noise(n, seed + 1), 6) * 10
    x += bp(osc("saw", f, n), 400, 4000) * np.sin(np.pi * np.clip((u - 0.1) * 1.3, 0, 1)) ** 0.6 * 0.4
    return normalize(reverb(stereo(x), 1.0, 0.25, seed), -4)


def make(name, **kw):
    if name not in LIB: raise KeyError(f"unknown sfx '{name}'. Available: {', '.join(LIB)}")
    k = {"dur": LIB[name]["dur"], **{a: b for a, b in kw.items() if b is not None}}
    return as_stereo(LIB[name]["fn"](**k)).astype(np.float32)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--list", action="store_true"); ap.add_argument("--demo"); ap.add_argument("--make"); ap.add_argument("--out", default="sfx.wav"); ap.add_argument("--dur", type=float); ap.add_argument("--seed", type=int)
    a = ap.parse_args()
    if a.list or not (a.demo or a.make):
        for k, v in LIB.items(): print(f"{k:11s} {v['dur']:>4.1f}s  {v['desc']}")
    if a.demo:
        os.makedirs(a.demo, exist_ok=True)
        for k in LIB: write_wav(os.path.join(a.demo, f"{k}.wav"), make(k)); print("wrote", k)
    if a.make:
        write_wav(a.out, make(a.make, dur=a.dur, seed=a.seed)); print("wrote", a.out)
