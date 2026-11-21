#!/usr/bin/env python3
"""
ouvinte.py — "o ouvinte": escuta objetiva de faixas infantis (QC automatico).

Uso:
  /opt/kidsvenv/bin/python scripts/ouvinte.py musica.mp3             # relatorio + veredito
  /opt/kidsvenv/bin/python scripts/ouvinte.py a.mp3 b.mp3 ...        # + tabela comparativa
  opcoes: --janela 8   --bpm-alvo 104-114   --json saida.json   --sem-janelas
          --separador auto|mdx|repet   (auto = MDX se o modelo existir, senao REPET)
  codigo de saida: 0 se todos PASSAM, 1 se algum REPROVA.

Separacao voz x banda (local, sem APIs):
  * MDX  : rede UVR-MDX-NET-Voc_FT (ONNX, baixada uma vez do GitHub para
           ~/.cache/ouvinte/). Validada contra os stems da ElevenLabs.
  * REPET: fallback sem modelo — HPSS + REPET-SIM (librosa). Bem menos preciso
           (subestima a voz ~10 dB); use so como indicativo.
  Stems separados ficam em cache (~/.cache/ouvinte/stems/<sha1>.npz).

Metricas: por janela (~8 s) e globais — BPM, loudness, voz vs banda (dB),
presenca da banda, fracao percussiva, densidade ritmica (onsets/s), brilho
(centroide), e na voz isolada (pyin): extensao melodica, microvariacao,
vibrato, estabilidade de nota (canto x fala), variacao de intensidade entre
frases, brilho da voz (grito). Limites em LIM, calibrados com os aprovados x
rejeitados de "Quem Fez? Foi Deus!" — ver reports/produtor4-ouvinte.md.
"""
import argparse
import hashlib
import json
import os
import sys
import urllib.request
import warnings

import numpy as np

warnings.filterwarnings("ignore")
import librosa  # noqa: E402
import scipy.signal  # noqa: E402

SR = 22050          # analise
SR_SEP = 44100      # separacao
HOP = 512
NFFT = 2048
CACHE = os.path.expanduser("~/.cache/ouvinte")
MDX_URL = ("https://github.com/TRvlvr/model_repo/releases/download/"
           "all_public_uvr_models/UVR-MDX-NET-Voc_FT.onnx")
MDX_PATH = os.path.join(CACHE, "UVR-MDX-NET-Voc_FT.onnx")

# ----------------------------------------------------------------------------
# LIMITES (calibrados; ver relatorio). Ajuste aqui.
# ----------------------------------------------------------------------------
LIM = {
    "bpm_min": 104.0, "bpm_max": 114.0,
    "banda_min_db": -30.0,          # banda (dBFS RMS) em TODA janela com som (<- sem banda no inicio)
    "voz_sobre_banda_max_db": 9.0,  # mediana voz-banda nas janelas cantadas
    "voz_sobre_banda_min_db": 0.0,  # voz enterrada abaixo disso
    "perc_min": 0.08,               # fracao percussiva media (groove)
    "onsets_min": 2.5,              # onsets/s
    "centroide_min": 1500.0, "centroide_max": 3400.0,   # brilho da mixagem (Hz)
    "estabilidade_min": 0.55,       # canto x fala (fracao de quadros em plato de nota)
    "vibrato_min_cents": 9.0,       # humanidade
    "micro_min_cents": 6.0,         # humanidade (microvariacao)
    "expressividade_min": 50.0,     # indice 0-100
    "voz_centroide_max": 2600.0,    # voz brilhante/tensa demais = gritada
    "impacto_min_db": 3.0,          # p90-p10 loudness por janela (so >= 40 s)
}


def db(x):
    return 20.0 * np.log10(np.maximum(x, 1e-10))


def rms_db(x):
    return float(db(np.sqrt(np.mean(np.square(x))))) if len(x) else -100.0


# ----------------------------------------------------------------------------
# Separacao
# ----------------------------------------------------------------------------
def garantir_modelo():
    if os.path.exists(MDX_PATH) and os.path.getsize(MDX_PATH) > 60e6:
        return True
    try:
        os.makedirs(CACHE, exist_ok=True)
        print(f"[ouvinte] baixando modelo de separacao (66 MB) de {MDX_URL}", file=sys.stderr)
        urllib.request.urlretrieve(MDX_URL, MDX_PATH + ".part")
        os.replace(MDX_PATH + ".part", MDX_PATH)
        return True
    except Exception as e:  # sem rede
        print(f"[ouvinte] modelo MDX indisponivel ({e}); usando REPET", file=sys.stderr)
        return False


def separar_mdx(mix):
    """mix: (2, n) 44.1k -> vocals (2, n). UVR MDX-Net Voc_FT."""
    import onnxruntime as ort
    import torch
    n_fft, hop, dim_f, dim_t = 7680, 1024, 3072, 256
    sess = ort.InferenceSession(MDX_PATH, providers=["CPUExecutionProvider"])
    nb = n_fft // 2 + 1
    trim = n_fft // 2
    chunk = hop * (dim_t - 1)
    gen = chunk - 2 * trim
    win = torch.hann_window(n_fft, periodic=True)
    n = mix.shape[1]
    pad = gen - n % gen
    mp = np.concatenate([np.zeros((2, trim)), mix, np.zeros((2, pad)), np.zeros((2, trim))], 1)
    outs = []
    for i in range(0, n + pad, gen):
        x = torch.tensor(mp[:, i:i + chunk], dtype=torch.float32)
        X = torch.stft(x, n_fft, hop, window=win, center=True, return_complex=True)
        X = torch.view_as_real(X).permute(0, 3, 1, 2).reshape(1, 4, nb, dim_t)[:, :, :dim_f]
        Y = torch.tensor(sess.run(None, {"input": X.numpy()})[0])
        Y = torch.cat([Y, torch.zeros(1, 4, nb - dim_f, dim_t)], 2)
        Y = Y.reshape(2, 2, nb, dim_t).permute(0, 2, 3, 1).contiguous()
        y = torch.istft(torch.view_as_complex(Y), n_fft, hop, window=win, center=True, length=chunk)
        outs.append(y.numpy()[:, trim:-trim])
    return np.concatenate(outs, 1)[:, :n] * 1.021


def separar_repet(y):
    """HPSS + REPET-SIM em mono 22.05k -> voz."""
    S, phase = librosa.magphase(librosa.stft(y, n_fft=NFFT, hop_length=HOP))
    H, _ = librosa.decompose.hpss(S, margin=(1.0, 2.0))
    width = int(librosa.time_to_frames(2.0, sr=SR, hop_length=HOP))
    R = np.minimum(H, librosa.decompose.nn_filter(H, aggregate=np.median, metric="cosine", width=width))
    mask = librosa.util.softmask(H - R, 2.0 * R, power=2)
    f = librosa.fft_frequencies(sr=SR, n_fft=NFFT)
    mask *= ((f >= 150) & (f <= 5000))[:, None]
    return librosa.istft(mask * H * phase, hop_length=HOP, length=len(y))


def separar(path, metodo):
    h = hashlib.sha1(open(path, "rb").read()).hexdigest()[:16]
    usar_mdx = metodo == "mdx" or (metodo == "auto" and garantir_modelo())
    if usar_mdx and not garantir_modelo():
        usar_mdx = False
    tag = "mdx" if usar_mdx else "repet"
    cp = os.path.join(CACHE, "stems", f"{h}-{tag}.npz")
    if os.path.exists(cp):
        d = np.load(cp)
        return d["mix"], d["voz"], tag
    if usar_mdx:
        mix2, _ = librosa.load(path, sr=SR_SEP, mono=False)
        if mix2.ndim == 1:
            mix2 = np.stack([mix2, mix2])
        v2 = separar_mdx(mix2)
        mix = librosa.resample(mix2.mean(0), orig_sr=SR_SEP, target_sr=SR)
        voz = librosa.resample(v2.mean(0), orig_sr=SR_SEP, target_sr=SR)
    else:
        mix, _ = librosa.load(path, sr=SR, mono=True)
        voz = separar_repet(mix)
    n = min(len(mix), len(voz))
    mix, voz = mix[:n].astype(np.float32), voz[:n].astype(np.float32)
    os.makedirs(os.path.dirname(cp), exist_ok=True)
    np.savez_compressed(cp, mix=mix, voz=voz)
    return mix, voz, tag


# ----------------------------------------------------------------------------
# Voz: pitch e expressividade
# ----------------------------------------------------------------------------
def pitch_track(voz):
    f0, vflag, _ = librosa.pyin(voz, fmin=140, fmax=1100, sr=SR, frame_length=2048, hop_length=HOP)
    rms = librosa.feature.rms(y=voz, frame_length=2048, hop_length=HOP)[0]
    n = min(len(f0), len(rms))
    return f0[:n], vflag[:n], rms[:n]


def _sat(x, lo, hi):
    return float(np.clip((x - lo) / (hi - lo), 0, 1)) if np.isfinite(x) else 0.0


def expressividade(f0, vflag, rms, ativo_thr):
    """Metricas da voz para um trecho de quadros. ativo_thr = rms minimo de voz cantando."""
    fps = SR / HOP
    ativo = rms > ativo_thr
    ok = vflag & ativo & np.isfinite(f0)
    out = {"vozeado": float(ok.sum() / max(ativo.sum(), 1)), "voz_ativa": float(ativo.mean())}
    nan = dict(extensao_st=np.nan, micro_cents=np.nan, vibrato_cents=np.nan,
               estabilidade=np.nan, frases_var_db=np.nan, nota_ms=np.nan, expressividade=np.nan)
    if ok.sum() < 40:
        out.update(nan)
        return out
    midi = librosa.hz_to_midi(np.where(ok, f0, np.nan))
    out["extensao_st"] = float(np.nanpercentile(midi, 95) - np.nanpercentile(midi, 5))
    segs, i, n = [], 0, len(ok)
    while i < n:
        if ok[i]:
            j = i
            while j < n and ok[j]:
                j += 1
            if j - i >= 5:
                segs.append((i, j))
            i = j
        else:
            i += 1
    micro, vib, est, tot, durs = [], [], 0, 0, []
    bvib = scipy.signal.butter(2, [4.0, 8.0], btype="band", fs=fps, output="sos")
    for a, b in segs:
        m = midi[a:b]
        durs.append((b - a) / fps * 1000)
        base = scipy.signal.medfilt(m, 5)                      # ~116 ms
        micro.append(np.std((m - base) * 100))
        sm = scipy.signal.medfilt(m, 7)
        slope = np.abs(np.gradient(sm)) * 100 * fps / 100     # semitons/s
        est += int(np.sum(slope < 3.0))
        tot += len(m)
        if b - a >= int(0.35 * fps):                          # notas longas: vibrato 4-8 Hz
            x = m - np.polyval(np.polyfit(np.arange(len(m)), m, 1), np.arange(len(m)))
            if len(x) > 15:
                vib.append(np.std(scipy.signal.sosfiltfilt(bvib, x, padlen=min(len(x) - 1, 12))) * 100)
    out["micro_cents"] = float(np.median(micro))
    out["vibrato_cents"] = float(np.median(vib)) if vib else 0.0
    out["estabilidade"] = float(est / max(tot, 1))
    out["nota_ms"] = float(np.median(durs))
    # intensidade entre frases: frases = blocos separados por pausa >= 250 ms
    fr, cur, gap = [], [], 0
    for k in range(n):
        if ativo[k]:
            cur.append(rms[k]); gap = 0
        else:
            gap += 1
            if gap >= int(0.25 * fps) and len(cur) > 10:
                fr.append(np.mean(db(np.array(cur)))); cur = []
    if len(cur) > 10:
        fr.append(np.mean(db(np.array(cur))))
    out["frases_var_db"] = float(np.std(fr)) if len(fr) >= 3 else np.nan
    out["expressividade"] = round(
        20 * _sat(out["extensao_st"], 3, 10)
        + 20 * _sat(out["micro_cents"], 3, 12)
        + 25 * _sat(out["vibrato_cents"], 4, 20)
        + 20 * _sat(out["estabilidade"], 0.35, 0.75)
        + 15 * _sat(out["frases_var_db"], 0.5, 3.5), 1)
    return out


# ----------------------------------------------------------------------------
# Analise
# ----------------------------------------------------------------------------
def bpm_de(onset_env):
    # prior em 110 BPM (faixa-alvo) para evitar erro de dobra/metade
    return float(librosa.feature.tempo(onset_envelope=onset_env, sr=SR, hop_length=HOP,
                                       start_bpm=110, aggregate=np.median)[0])


def analisar(path, janela=8.0, bpm_alvo=None, metodo="auto"):
    bpm_alvo = bpm_alvo or (LIM["bpm_min"], LIM["bpm_max"])
    y, voz, tag = separar(path, metodo)
    banda = y - voz
    dur = len(y) / SR
    S = np.abs(librosa.stft(y, n_fft=NFFT, hop_length=HOP))
    H, P = librosa.decompose.hpss(banda_spec := np.abs(librosa.stft(banda, n_fft=NFFT, hop_length=HOP)))
    onset_env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=SR, hop_length=HOP, units="time")
    cent = librosa.feature.spectral_centroid(S=S, sr=SR)[0]
    vcent = librosa.feature.spectral_centroid(y=voz, sr=SR, hop_length=HOP)[0]
    f0, vflag, vrms = pitch_track(voz)
    # limiar de voz ativa: 30 dB abaixo do pico (p99) da voz, e no minimo -45 dBFS
    ativo_thr = max(np.percentile(vrms, 99) * 10 ** (-30 / 20), 10 ** (-45 / 20))
    nwin = max(1, int(round(dur / janela)))
    edges = np.linspace(0, len(y), nwin + 1).astype(int)
    rows = []
    for w in range(nwin):
        a, z = edges[w], edges[w + 1]
        fa, fz = a // HOP, max(a // HOP + 1, z // HOP)
        e = expressividade(f0[fa:fz], vflag[fa:fz], vrms[fa:fz], ativo_thr)
        r = {"t0": a / SR, "t1": z / SR, "loud_db": rms_db(y[a:z]), "voz_db": rms_db(voz[a:z]),
             "banda_db": rms_db(banda[a:z]),
             "perc_frac": float(np.sum(P[:, fa:fz] ** 2) / max(np.sum(S[:, fa:fz] ** 2), 1e-12)),
             "centroide": float(np.mean(cent[fa:fz])),
             "onsets_s": float(np.sum((onsets >= a / SR) & (onsets < z / SR)) / ((z - a) / SR)),
             "bpm": bpm_de(onset_env[fa:fz]) if fz - fa > 100 else np.nan,
             "voz_ativa": e["voz_ativa"], "expr": e["expressividade"],
             "estab": e["estabilidade"], "vib": e["vibrato_cents"]}
        r["v_menos_b"] = r["voz_db"] - r["banda_db"]
        r["cantada"] = e["voz_ativa"] > 0.3
        rows.append(r)
    V = expressividade(f0, vflag, vrms, ativo_thr)
    cant = [r for r in rows if r["cantada"]] or rows
    soando = [r for r in rows if r["loud_db"] > -40]
    loud = np.array([r["loud_db"] for r in rows])
    vm = np.abs(vflag & (vrms > ativo_thr))
    G = {
        "arquivo": path, "separador": tag, "duracao_s": round(dur, 1),
        "bpm": round(bpm_de(onset_env), 1),
        "loud_db": rms_db(y),
        "impacto_db": float(np.percentile(loud, 90) - np.percentile(loud, 10)) if len(loud) > 4 else np.nan,
        "banda_min_db": float(min(r["banda_db"] for r in soando)),
        "banda_pior_t": float(min(soando, key=lambda r: r["banda_db"])["t0"]),
        "janelas_sem_banda": int(sum(r["banda_db"] < LIM["banda_min_db"] for r in soando)),
        "voz_sobre_banda_db": float(np.median([r["v_menos_b"] for r in cant])),
        "perc_frac": float(np.sum(P ** 2) / np.sum(S ** 2)),
        "onsets_s": float(len(onsets) / dur),
        "centroide": float(np.mean(cent)),
        "voz_centroide": (float(np.median(vcent[:min(len(vm), len(vcent))][vm[:min(len(vm), len(vcent))]]))
                          if vm.any() else np.nan),
        **{f"voz_{k}": v for k, v in V.items()},
    }
    G["veredito"], G["regras"] = julgar(G, bpm_alvo)
    return G, rows


def julgar(G, bpm_alvo):
    R = []

    def regra(nome, ok, valor, alvo):
        R.append({"regra": nome, "ok": bool(ok), "valor": valor, "alvo": alvo})

    nz = lambda x: x if np.isfinite(x) else -1e9  # noqa: E731
    regra("BPM no alvo", bpm_alvo[0] <= G["bpm"] <= bpm_alvo[1], f"{G['bpm']:.1f}",
          f"{bpm_alvo[0]:.0f}-{bpm_alvo[1]:.0f}")
    regra("Banda presente em toda janela", G["janelas_sem_banda"] == 0,
          f"{G['janelas_sem_banda']} jan.; min {G['banda_min_db']:.1f} dB em {G['banda_pior_t']:.0f}s",
          f"banda >= {LIM['banda_min_db']:.0f} dBFS")
    regra("Equilibrio voz x banda",
          LIM["voz_sobre_banda_min_db"] <= G["voz_sobre_banda_db"] <= LIM["voz_sobre_banda_max_db"],
          f"voz {G['voz_sobre_banda_db']:+.1f} dB", f"{LIM['voz_sobre_banda_min_db']:+.0f}..{LIM['voz_sobre_banda_max_db']:+.0f} dB")
    regra("Groove (fracao percussiva)", G["perc_frac"] >= LIM["perc_min"], f"{G['perc_frac']:.2f}",
          f">= {LIM['perc_min']:.2f}")
    regra("Densidade ritmica", G["onsets_s"] >= LIM["onsets_min"], f"{G['onsets_s']:.2f}/s",
          f">= {LIM['onsets_min']}/s")
    regra("Brilho da mix", LIM["centroide_min"] <= G["centroide"] <= LIM["centroide_max"],
          f"{G['centroide']:.0f} Hz", f"{LIM['centroide_min']:.0f}-{LIM['centroide_max']:.0f} Hz")
    regra("Canto (nao narracao)", nz(G["voz_estabilidade"]) >= LIM["estabilidade_min"],
          f"{G['voz_estabilidade']:.2f}", f">= {LIM['estabilidade_min']}")
    regra("Humanidade: vibrato", nz(G["voz_vibrato_cents"]) >= LIM["vibrato_min_cents"],
          f"{G['voz_vibrato_cents']:.1f} cents", f">= {LIM['vibrato_min_cents']}")
    regra("Humanidade: micro-pitch", nz(G["voz_micro_cents"]) >= LIM["micro_min_cents"],
          f"{G['voz_micro_cents']:.1f} cents", f">= {LIM['micro_min_cents']}")
    regra("Expressividade (0-100)", nz(G["voz_expressividade"]) >= LIM["expressividade_min"],
          f"{G['voz_expressividade']:.0f}", f">= {LIM['expressividade_min']:.0f}")
    regra("Nao gritado (brilho da voz)", -nz(-G["voz_centroide"]) <= LIM["voz_centroide_max"],
          f"{G['voz_centroide']:.0f} Hz", f"<= {LIM['voz_centroide_max']:.0f} Hz")
    if G["duracao_s"] >= 40:
        regra("Impacto (dinamica entre secoes)", G["impacto_db"] >= LIM["impacto_min_db"],
              f"{G['impacto_db']:.1f} dB", f">= {LIM['impacto_min_db']:.0f} dB")
    return ("PASSA" if all(r["ok"] for r in R) else "REPROVA"), R


# ----------------------------------------------------------------------------
# Saida
# ----------------------------------------------------------------------------
def fmt(x, nd=1):
    try:
        return f"{x:.{nd}f}" if np.isfinite(x) else "-"
    except TypeError:
        return str(x)


def imprimir(G, rows, janelas=True):
    print("=" * 100)
    print(f"OUVINTE  {G['arquivo']}  ({G['duracao_s']} s, separador {G['separador']})")
    print("=" * 100)
    if janelas:
        print(f"{'janela':>11} {'loud':>6} {'voz':>6} {'banda':>6} {'v-b':>6} {'perc':>5} {'centr':>6}"
              f" {'ons/s':>5} {'bpm':>6} {'vozAt':>5} {'estab':>5} {'vib':>5} {'expr':>5}")
        for r in rows:
            flag = " <- SEM BANDA" if r["banda_db"] < LIM["banda_min_db"] and r["loud_db"] > -40 else ""
            print(f"{r['t0']:5.0f}-{r['t1']:<5.0f} {r['loud_db']:6.1f} {r['voz_db']:6.1f} {r['banda_db']:6.1f}"
                  f" {r['v_menos_b']:+6.1f} {r['perc_frac']:5.2f} {r['centroide']:6.0f} {r['onsets_s']:5.1f}"
                  f" {fmt(r['bpm']):>6} {r['voz_ativa']:5.2f} {fmt(r['estab'], 2):>5} {fmt(r['vib']):>5}"
                  f" {fmt(r['expr'], 0):>5}{flag}")
        print("-" * 100)
    print("GLOBAL: " + ", ".join(f"{k}={fmt(G[k], 2)}" for k in
          ["bpm", "loud_db", "impacto_db", "banda_min_db", "voz_sobre_banda_db", "perc_frac", "onsets_s",
           "centroide", "voz_centroide", "voz_extensao_st", "voz_micro_cents", "voz_vibrato_cents",
           "voz_estabilidade", "voz_nota_ms", "voz_frases_var_db", "voz_expressividade"]))
    print("-" * 100)
    for r in G["regras"]:
        print(f"  [{'OK' if r['ok'] else 'XX'}] {r['regra']:<34} {r['valor']:<36} alvo {r['alvo']}")
    print(f"VEREDITO: {G['veredito']}  ({sum(not r['ok'] for r in G['regras'])} regra(s) falharam)\n")


COLS = [("bpm", "BPM", 1), ("impacto_db", "impact", 1), ("banda_min_db", "bandMin", 1),
        ("voz_sobre_banda_db", "v-b", 1), ("perc_frac", "perc", 2), ("onsets_s", "ons/s", 2),
        ("centroide", "centr", 0), ("voz_centroide", "vCentr", 0), ("voz_extensao_st", "ext", 1),
        ("voz_micro_cents", "micro", 1), ("voz_vibrato_cents", "vibr", 1),
        ("voz_estabilidade", "estab", 2), ("voz_frases_var_db", "frVar", 2),
        ("voz_expressividade", "EXPR", 0)]


def tabela(todos):
    nome = lambda p: os.path.join(os.path.basename(os.path.dirname(p)), os.path.basename(p))[:32]  # noqa
    print("TABELA COMPARATIVA")
    print(f"{'arquivo':<32} " + " ".join(f"{c[1]:>7}" for c in COLS) + "  veredito")
    for G in todos:
        print(f"{nome(G['arquivo']):<32} " + " ".join(f"{fmt(G[c[0]], c[2]):>7}" for c in COLS)
              + f"  {G['veredito']} ({sum(not r['ok'] for r in G['regras'])})")


def main():
    ap = argparse.ArgumentParser(description="Ouvinte: QC objetivo de musica infantil")
    ap.add_argument("arquivos", nargs="+")
    ap.add_argument("--janela", type=float, default=8.0)
    ap.add_argument("--bpm-alvo", default=f"{LIM['bpm_min']:.0f}-{LIM['bpm_max']:.0f}")
    ap.add_argument("--separador", choices=["auto", "mdx", "repet"], default="auto")
    ap.add_argument("--json")
    ap.add_argument("--sem-janelas", action="store_true")
    a = ap.parse_args()
    lo, hi = (float(x) for x in a.bpm_alvo.split("-"))
    todos = []
    for f in a.arquivos:
        G, rows = analisar(f, a.janela, (lo, hi), a.separador)
        imprimir(G, rows, not a.sem_janelas)
        G["janelas"] = rows
        todos.append(G)
    if len(todos) > 1:
        tabela(todos)
    if a.json:
        with open(a.json, "w") as fh:
            json.dump(todos, fh, indent=1, default=lambda o: float(o) if np.isfinite(o) else None)
    sys.exit(0 if all(G["veredito"] == "PASSA" for G in todos) else 1)


if __name__ == "__main__":
    main()
