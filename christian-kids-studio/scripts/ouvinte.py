#!/usr/bin/env python3
"""
ouvinte.py — "o ouvinte": escuta objetiva de faixas infantis (QC automatico).

Uso:
  /opt/kidsvenv/bin/python scripts/ouvinte.py musica.mp3            # relatorio + veredito
  /opt/kidsvenv/bin/python scripts/ouvinte.py a.mp3 b.mp3 ...       # relatorios + tabela comparativa
  opcoes: --janela 8  --json saida.json  --sem-janelas  --bpm-alvo 104-114

Metodo (tudo local, sem modelos baixados):
  1. Mono 22.05 kHz. HPSS (librosa) -> parte harmonica H e percussiva P.
  2. REPET-SIM (filtro de vizinhos por similaridade, librosa.decompose.nn_filter)
     sobre H: o que se repete = acompanhamento harmonico; o residuo nao repetitivo
     na faixa 150-5000 Hz = VOZ. BANDA = acompanhamento harmonico + P.
  3. Por janela (~8 s) e global: loudness (dB RMS), voz vs banda (dB), BPM,
     brilho (centroide/rolloff), densidade ritmica (onsets/s, fracao percussiva),
     expressividade vocal (pyin na voz separada: desvio de pitch, vibrato,
     microvariacao, estabilidade de nota vs fala, variacao de intensidade entre frases).
  4. Regras PASSA/REPROVA com limites calibrados nos aprovados x rejeitados
     de "Quem Fez? Foi Deus!" (ver reports/produtor4-ouvinte.md).
"""
import argparse
import json
import os
import sys
import warnings

import numpy as np

warnings.filterwarnings("ignore")
import librosa  # noqa: E402
import scipy.signal  # noqa: E402

SR = 22050
HOP = 512
NFFT = 2048

# ----------------------------------------------------------------------------
# LIMITES (calibrados — ver relatorio). Ajuste aqui.
# ----------------------------------------------------------------------------
LIM = {
    "bpm_min": 104.0,
    "bpm_max": 114.0,
    # banda presente: energia da banda em cada janela nao pode cair mais que isto
    # abaixo da mediana de banda da musica (janela "sem banda" = intro a cappella/narracao)
    "banda_queda_max_db": 12.0,
    # voz acima da banda (mediana das janelas com voz). >  -> voz "na cara", banda fraca
    "voz_sobre_banda_max_db": 3.0,
    # fracao percussiva minima por janela (groove presente)
    "perc_min": 0.10,
    # densidade ritmica (onsets/s) global minima
    "onsets_min": 2.5,
    # brilho: centroide medio (Hz). abaixo = abafado; acima = estridente/gritado
    "centroide_min": 1500.0,
    "centroide_max": 3200.0,
    # fala x canto: fracao de quadros vozeados em plato de nota estavel
    "estabilidade_min": 0.45,
    # humanidade: microvariacao de pitch dentro das notas (cents, desvio padrao)
    "micro_min_cents": 8.0,
    # expressividade combinada (0-100)
    "expressividade_min": 45.0,
    # gritado: fracao de energia vocal acima de 3 kHz e loudness alto
    "grito_hf_max": 0.30,
    # impacto: faixa dinamica entre secoes (p90-p10 da loudness por janela), so p/ faixas >= 40 s
    "impacto_min_db": 3.0,
    "impacto_max_db": 14.0,
}


def db(x, ref=1.0):
    return 20.0 * np.log10(np.maximum(x, 1e-10) / ref)


def separar(y):
    """HPSS + REPET-SIM. Retorna (voz, banda, harm_acomp, perc) em tempo."""
    S_full, phase = librosa.magphase(librosa.stft(y, n_fft=NFFT, hop_length=HOP))
    H, P = librosa.decompose.hpss(S_full, margin=(1.0, 2.0))
    # REPET-SIM sobre o espectro harmonico
    width = int(librosa.time_to_frames(2.0, sr=SR, hop_length=HOP))
    S_rep = librosa.decompose.nn_filter(H, aggregate=np.median, metric="cosine", width=width)
    S_rep = np.minimum(H, S_rep)
    margin_v = 2.0
    power = 2
    mask_v = librosa.util.softmask(H - S_rep, margin_v * S_rep, power=power)
    mask_b = librosa.util.softmask(S_rep, margin_v * (H - S_rep), power=power)
    freqs = librosa.fft_frequencies(sr=SR, n_fft=NFFT)
    band = ((freqs >= 150) & (freqs <= 5000)).astype(float)[:, None]
    V = mask_v * H * band
    B_h = H - V
    B = B_h + P
    ist = lambda M: librosa.istft(M * phase, hop_length=HOP, length=len(y))  # noqa: E731
    return ist(V), ist(B), ist(B_h), ist(P), V, B, P, S_full


def analisar_voz(v, sr=SR):
    """Expressividade da voz separada via pyin."""
    f0, vflag, vprob = librosa.pyin(
        v, fmin=150, fmax=1000, sr=sr, frame_length=2048, hop_length=HOP
    )
    rms = librosa.feature.rms(y=v, frame_length=2048, hop_length=HOP)[0]
    n = min(len(f0), len(rms))
    f0, vflag, rms = f0[:n], vflag[:n], rms[:n]
    # so quadros vozeados com energia relevante
    thr = np.percentile(rms, 40)
    ok = vflag & (rms > thr) & np.isfinite(f0)
    res = {"vozeado_frac": float(ok.mean())}
    if ok.sum() < 30:
        res.update(pitch_desvio_st=np.nan, micro_cents=np.nan, vibrato_cents=np.nan,
                   estabilidade=np.nan, frases_var_db=np.nan, expressividade=np.nan)
        return res
    midi = librosa.hz_to_midi(np.where(ok, f0, np.nan))
    # desvio de pitch global (semitons) — melodia viva vs monotona
    res["pitch_desvio_st"] = float(np.nanstd(midi))
    # segmentos vozeados continuos
    segs = []
    i = 0
    while i < n:
        if ok[i]:
            j = i
            while j < n and ok[j]:
                j += 1
            if j - i >= 6:
                segs.append((i, j))
            i = j
        else:
            i += 1
    fps = sr / HOP
    micro, vib, est_num, est_den = [], [], 0, 0
    for a, b in segs:
        m = midi[a:b]
        # contorno de nota: mediana movel ~120 ms
        k = max(3, int(0.12 * fps) | 1)
        base = scipy.signal.medfilt(m, k)
        dev = (m - base) * 100.0  # cents
        micro.append(np.std(dev))
        # estabilidade: quadros a menos de 35 cents da mediana local E derivada baixa
        d = np.abs(np.gradient(m)) * 100.0 * fps / 100.0  # semitons/s *1 -> usar cents/quadro
        est_num += np.sum((np.abs(dev) < 35) & (np.abs(np.gradient(m)) * 100 < 25))
        est_den += len(m)
        # vibrato: segmentos >= 300 ms, energia de modulacao 4-8 Hz
        if b - a >= int(0.3 * fps):
            x = m - np.polyval(np.polyfit(np.arange(len(m)), m, 1), np.arange(len(m)))
            fr, pw = scipy.signal.periodogram(x, fs=fps)
            sel = (fr >= 4) & (fr <= 8)
            if sel.any():
                vib.append(np.sqrt(2 * np.sum(pw[sel]) * (fr[1] - fr[0])) * 100.0)
    res["micro_cents"] = float(np.median(micro)) if micro else np.nan
    res["vibrato_cents"] = float(np.median(vib)) if vib else 0.0
    res["estabilidade"] = float(est_num / max(est_den, 1))
    # variacao de intensidade entre frases (segmentos agrupados por pausas)
    seg_db = [float(np.mean(db(rms[a:b]))) for a, b in segs]
    res["frases_var_db"] = float(np.std(seg_db)) if len(seg_db) >= 3 else np.nan
    # indice 0-100 (pesos simples, saturando)
    def sat(x, lo, hi):
        if not np.isfinite(x):
            return 0.0
        return float(np.clip((x - lo) / (hi - lo), 0, 1))
    e = (
        30 * sat(res["pitch_desvio_st"], 1.0, 4.0)
        + 25 * sat(res["micro_cents"], 4.0, 20.0)
        + 20 * sat(res["vibrato_cents"], 3.0, 15.0)
        + 25 * sat(res["frases_var_db"], 0.5, 4.0)
    )
    res["expressividade"] = round(e, 1)
    return res


def bpm_de(y_or_env, sr=SR, onset_env=None):
    if onset_env is None:
        onset_env = librosa.onset.onset_strength(y=y_or_env, sr=sr, hop_length=HOP)
    # prior centrado em 110 para evitar dobra/metade
    tempo = librosa.feature.tempo(onset_envelope=onset_env, sr=sr, hop_length=HOP,
                                  start_bpm=110, aggregate=np.median)[0]
    return float(tempo)


def analisar(path, janela=8.0, bpm_alvo=(LIM["bpm_min"], LIM["bpm_max"])):
    y, _ = librosa.load(path, sr=SR, mono=True)
    dur = len(y) / SR
    v, b, bh, p, V, B, P, S = separar(y)
    onset_env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=SR, hop_length=HOP, units="time")
    cent = librosa.feature.spectral_centroid(S=S, sr=SR)[0]
    rolloff = librosa.feature.spectral_rolloff(S=S, sr=SR, roll_percent=0.85)[0]
    freqs = librosa.fft_frequencies(sr=SR, n_fft=NFFT)
    hf = freqs >= 3000

    # janelas
    nwin = max(1, int(round(dur / janela)))
    edges = np.linspace(0, len(y), nwin + 1).astype(int)
    rows = []
    for w in range(nwin):
        a, z = edges[w], edges[w + 1]
        fa, fz = a // HOP, max(a // HOP + 1, z // HOP)
        seg = y[a:z]
        r = {
            "t0": a / SR, "t1": z / SR,
            "loud_db": float(db(np.sqrt(np.mean(seg ** 2)))),
            "voz_db": float(db(np.sqrt(np.mean(v[a:z] ** 2)))),
            "banda_db": float(db(np.sqrt(np.mean(b[a:z] ** 2)))),
            "perc_frac": float(np.sum(P[:, fa:fz] ** 2) / max(np.sum(S[:, fa:fz] ** 2), 1e-12)),
            "centroide": float(np.mean(cent[fa:fz])),
            "onsets_s": float(np.sum((onsets >= a / SR) & (onsets < z / SR)) / ((z - a) / SR)),
        }
        r["voz_menos_banda"] = r["voz_db"] - r["banda_db"]
        try:
            r["bpm"] = bpm_de(None, onset_env=onset_env[fa:fz]) if fz - fa > 100 else np.nan
        except Exception:
            r["bpm"] = np.nan
        # voz ativa nesta janela? (energia vocal relevante)
        rows.append(r)

    voz_glob = analisar_voz(v)
    # expressividade por janela (rapida: reusa pyin por janela)
    for r in rows:
        a, z = int(r["t0"] * SR), int(r["t1"] * SR)
        vv = analisar_voz(v[a:z]) if z - a > SR * 2 else {}
        r["expr"] = vv.get("expressividade", np.nan)
        r["vozeado"] = vv.get("vozeado_frac", 0.0)

    loud = np.array([r["loud_db"] for r in rows])
    banda = np.array([r["banda_db"] for r in rows])
    vmb = np.array([r["voz_menos_banda"] for r in rows])
    voz_ativa = np.array([r["vozeado"] > 0.15 for r in rows])
    hf_voz = float(np.sum(V[hf] ** 2) / max(np.sum(V ** 2), 1e-12))

    G = {
        "arquivo": path,
        "duracao_s": round(dur, 1),
        "bpm": round(bpm_de(None, onset_env=onset_env), 1),
        "loud_db": float(db(np.sqrt(np.mean(y ** 2)))),
        "crest_db": float(db(np.max(np.abs(y))) - db(np.sqrt(np.mean(y ** 2)))),
        "impacto_db": float(np.percentile(loud, 90) - np.percentile(loud, 10)) if len(loud) > 2 else np.nan,
        "banda_queda_db": float(np.median(banda) - np.min(banda)),
        "banda_pior_janela": rows[int(np.argmin(banda))]["t0"],
        "voz_sobre_banda_db": float(np.median(vmb[voz_ativa])) if voz_ativa.any() else float(np.median(vmb)),
        "voz_sobre_banda_max": float(np.max(vmb)),
        "perc_frac": float(np.sum(P ** 2) / np.sum(S ** 2)),
        "perc_min_janela": float(min(r["perc_frac"] for r in rows)),
        "onsets_s": float(len(onsets) / dur),
        "centroide": float(np.mean(cent)),
        "rolloff": float(np.mean(rolloff)),
        "voz_hf_frac": hf_voz,
        **{f"voz_{k}": v_ for k, v_ in voz_glob.items()},
    }
    G["veredito"], G["regras"] = julgar(G, bpm_alvo)
    return G, rows


def julgar(G, bpm_alvo):
    R = []

    def regra(nome, ok, valor, alvo):
        R.append({"regra": nome, "ok": bool(ok), "valor": valor, "alvo": alvo})

    regra("BPM no alvo", bpm_alvo[0] <= G["bpm"] <= bpm_alvo[1], f"{G['bpm']:.1f}",
          f"{bpm_alvo[0]:.0f}-{bpm_alvo[1]:.0f}")
    regra("Banda presente em toda janela", G["banda_queda_db"] <= LIM["banda_queda_max_db"],
          f"queda {G['banda_queda_db']:.1f} dB (pior em {G['banda_pior_janela']:.0f}s)",
          f"<= {LIM['banda_queda_max_db']:.0f} dB")
    regra("Voz nao abafa a banda", G["voz_sobre_banda_db"] <= LIM["voz_sobre_banda_max_db"],
          f"{G['voz_sobre_banda_db']:+.1f} dB", f"<= {LIM['voz_sobre_banda_max_db']:+.0f} dB")
    regra("Groove (percussao em toda janela)", G["perc_min_janela"] >= LIM["perc_min"],
          f"min {G['perc_min_janela']:.2f}", f">= {LIM['perc_min']:.2f}")
    regra("Densidade ritmica", G["onsets_s"] >= LIM["onsets_min"], f"{G['onsets_s']:.2f}/s",
          f">= {LIM['onsets_min']}/s")
    regra("Brilho/timbre", LIM["centroide_min"] <= G["centroide"] <= LIM["centroide_max"],
          f"{G['centroide']:.0f} Hz", f"{LIM['centroide_min']:.0f}-{LIM['centroide_max']:.0f} Hz")
    regra("Canto (nao narracao)", np.nan_to_num(G["voz_estabilidade"]) >= LIM["estabilidade_min"],
          f"{G['voz_estabilidade']:.2f}", f">= {LIM['estabilidade_min']}")
    regra("Humanidade (micro-pitch)", np.nan_to_num(G["voz_micro_cents"]) >= LIM["micro_min_cents"],
          f"{G['voz_micro_cents']:.1f} cents", f">= {LIM['micro_min_cents']}")
    regra("Expressividade", np.nan_to_num(G["voz_expressividade"]) >= LIM["expressividade_min"],
          f"{G['voz_expressividade']:.0f}", f">= {LIM['expressividade_min']:.0f}")
    regra("Nao gritado", G["voz_hf_frac"] <= LIM["grito_hf_max"], f"{G['voz_hf_frac']:.2f}",
          f"<= {LIM['grito_hf_max']}")
    if G["duracao_s"] >= 40:
        regra("Impacto (dinamica entre secoes)",
              LIM["impacto_min_db"] <= G["impacto_db"] <= LIM["impacto_max_db"],
              f"{G['impacto_db']:.1f} dB", f"{LIM['impacto_min_db']:.0f}-{LIM['impacto_max_db']:.0f} dB")
    return ("PASSA" if all(r["ok"] for r in R) else "REPROVA"), R


def fmt(x, nd=1):
    return "  -  " if x is None or (isinstance(x, float) and not np.isfinite(x)) else f"{x:.{nd}f}"


def imprimir(G, rows, janelas=True):
    print("=" * 96)
    print(f"OUVINTE  {G['arquivo']}  ({G['duracao_s']} s)")
    print("=" * 96)
    if janelas:
        print(f"{'janela':>11} {'loud':>6} {'voz':>6} {'banda':>6} {'v-b':>6} {'perc':>5} "
              f"{'centr':>6} {'ons/s':>5} {'bpm':>6} {'vozd':>5} {'expr':>5}")
        for r in rows:
            print(f"{r['t0']:5.0f}-{r['t1']:<5.0f} {r['loud_db']:6.1f} {r['voz_db']:6.1f} "
                  f"{r['banda_db']:6.1f} {r['voz_menos_banda']:+6.1f} {r['perc_frac']:5.2f} "
                  f"{r['centroide']:6.0f} {r['onsets_s']:5.1f} {fmt(r['bpm']):>6} "
                  f"{r['vozeado']:5.2f} {fmt(r['expr'], 0):>5}")
        print("-" * 96)
    print("GLOBAL: " + ", ".join(
        f"{k}={fmt(G[k], 2) if isinstance(G[k], float) else G[k]}" for k in
        ["bpm", "loud_db", "impacto_db", "banda_queda_db", "voz_sobre_banda_db", "perc_frac",
         "onsets_s", "centroide", "voz_hf_frac", "voz_pitch_desvio_st", "voz_micro_cents",
         "voz_vibrato_cents", "voz_estabilidade", "voz_frases_var_db", "voz_expressividade"]))
    print("-" * 96)
    for r in G["regras"]:
        print(f"  [{'OK ' if r['ok'] else 'XX '}] {r['regra']:<36} {r['valor']:<34} alvo {r['alvo']}")
    print(f"VEREDITO: {G['veredito']}")
    print()


def tabela(todos):
    cols = [("bpm", "BPM", 1), ("impacto_db", "impacto", 1), ("banda_queda_db", "bandaQ", 1),
            ("voz_sobre_banda_db", "v-b", 1), ("perc_min_janela", "percMin", 2),
            ("onsets_s", "ons/s", 2), ("centroide", "centr", 0), ("voz_hf_frac", "vozHF", 2),
            ("voz_pitch_desvio_st", "pitchSD", 2), ("voz_micro_cents", "micro", 1),
            ("voz_vibrato_cents", "vibr", 1), ("voz_estabilidade", "estab", 2),
            ("voz_frases_var_db", "frasVar", 2), ("voz_expressividade", "EXPR", 0)]
    nome = lambda p: os.path.join(os.path.basename(os.path.dirname(p)), os.path.basename(p))[:34]  # noqa
    print("TABELA COMPARATIVA")
    print(f"{'arquivo':<34} " + " ".join(f"{c[1]:>7}" for c in cols) + "  veredito")
    for G in todos:
        print(f"{nome(G['arquivo']):<34} " + " ".join(f"{fmt(G[c[0]], c[2]):>7}" for c in cols)
              + f"  {G['veredito']}")


def main():
    ap = argparse.ArgumentParser(description="Ouvinte: QC objetivo de musica infantil")
    ap.add_argument("arquivos", nargs="+")
    ap.add_argument("--janela", type=float, default=8.0)
    ap.add_argument("--bpm-alvo", default=f"{LIM['bpm_min']:.0f}-{LIM['bpm_max']:.0f}")
    ap.add_argument("--json")
    ap.add_argument("--sem-janelas", action="store_true")
    a = ap.parse_args()
    lo, hi = (float(x) for x in a.bpm_alvo.split("-"))
    todos = []
    for f in a.arquivos:
        G, rows = analisar(f, a.janela, (lo, hi))
        imprimir(G, rows, not a.sem_janelas)
        G["janelas"] = rows
        todos.append(G)
    if len(todos) > 1:
        tabela(todos)
    if a.json:
        with open(a.json, "w") as fh:
            json.dump(todos, fh, indent=1, default=lambda o: None if o != o else float(o))
    sys.exit(0 if all(G["veredito"] == "PASSA" for G in todos) else 1)


if __name__ == "__main__":
    main()
