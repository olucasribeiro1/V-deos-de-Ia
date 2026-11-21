"""Turno da Madrugada · Ep. 1 dividido em duas partes verticais (1:30 máx. cada), reusando a mesma narração.
Cada parte: COLD OPEN (trecho mais tenso da própria parte, áudio já gravado) -> rebobinar VHS + cartão de tempo -> a parte em ordem -> gancho final.
Uso (no story/build_shots.py de cada projeto):  from ep01_build import build; build(__file__, 1|2)
Lê SEMPRE os originais de projects/turno-ep01/{input,timeline}/orig/ (criados na 1ª execução) e escreve, no projeto da parte:
input/voiceover.wav, timeline/{words,lines,sentences}.json, config.json (duration) e story/shots.json."""
import os, sys, json, shutil, subprocess, copy
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "series", "mamae"))
from build import monta, amb, DIS, CUT

BASE = os.path.join(ROOT, "projects", "turno-ep01")
COLD_FADE = {"type": "fade", "dur": 0.5}
# parte: cold = [início, fim] no tempo ORIGINAL; corpo = [início, fim] no tempo original; rew = rebobinar; fim = cartão final em silêncio
PARTES = {
    1: dict(proj="turno-ep01", cold=(27.95, 34.45), corpo=(0.0, 74.85), rew=2.4, fim=6.3, cartao="03:00 · MINUTOS ANTES", titulo="Turno da Madrugada - Ep1 - Parte 1"),
    2: dict(proj="turno-ep01b", cold=(116.45, 124.35), corpo=(74.8, None), rew=2.4, fim=1.9, cartao="1 HORA ANTES", titulo="Turno da Madrugada - Ep1 - Parte 2"),
}


def backup():
    for sub, files in (("input", ["voiceover.wav"]), ("timeline", ["words.json", "lines.json", "sentences.json", "transcript.txt"])):
        os.makedirs(os.path.join(BASE, sub, "orig"), exist_ok=True)
        for f in files:
            src, dst = os.path.join(BASE, sub, f), os.path.join(BASE, sub, "orig", f)
            if not os.path.exists(dst): shutil.copy2(src, dst)


def prepara(n):
    backup(); c = PARTES[n]; P = os.path.join(ROOT, "projects", c["proj"])
    O = lambda *a: os.path.join(BASE, *a)
    words = json.load(open(O("timeline", "orig", "words.json")))["words"]
    LN = json.load(open(O("timeline", "orig", "lines.json"))); sents = json.load(open(O("timeline", "orig", "sentences.json")))
    dur0 = LN["duration"]; cs, ce = c["cold"]; b0, b1 = c["corpo"]; b1 = b1 or dur0
    cold = ce - cs; off = cold + c["rew"] - b0; DUR = round(cold + c["rew"] + (b1 - b0) + c["fim"], 3)
    # áudio: [cold][silêncio do rebobinar][corpo][silêncio do cartão final]
    for d in ("input", "timeline", "story", "out", "build", os.path.join("scenes", "shots")): os.makedirs(os.path.join(P, d), exist_ok=True)
    wav = O("input", "orig", "voiceover.wav")
    fc = (f"[0:a]atrim={cs}:{ce},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={cold - 0.12:.3f}:d=0.12[a];"
          f"anullsrc=r=44100:cl=mono,atrim=0:{c['rew']}[s1];"
          f"[0:a]atrim={b0}:{b1},asetpts=PTS-STARTPTS,afade=t=in:d=0.03[b];"
          f"anullsrc=r=44100:cl=mono,atrim=0:{max(0.05, c['fim'])}[s2];"
          f"[a][s1][b][s2]concat=n=4:v=0:a=1[o]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-filter_complex", fc, "-map", "[o]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", os.path.join(P, "input", "voiceover.wav")], check=True)
    # palavras: cópia do cold (prefixo de tempo 0) + corpo deslocado; só o que cabe na parte (legendas)
    nw = []
    for w in words:
        if cs - 0.01 <= w["start"] and w["end"] <= ce + 0.05: nw.append({**w, "start": round(w["start"] - cs, 3), "end": round(w["end"] - cs, 3)})
    for w in words:
        if b0 - 0.01 <= w["start"] and w["end"] <= b1 + 0.05: nw.append({**w, "start": round(w["start"] + off, 3), "end": round(w["end"] + off, 3)})
    json.dump({"source": f"ep01 parte {n} (cold open + corpo, deslocado)", "words": nw}, open(os.path.join(P, "timeline", "words.json"), "w"), ensure_ascii=False, indent=1)
    # falas: TODAS deslocadas (as fora da parte ficam com tempo negativo / além do fim: servem só de referência pras cenas) + cópias do cold ("x" + id)
    lines = []
    for l in LN["lines"]:
        if cs - 0.05 <= l["start"] and l["end"] <= ce + 0.05: lines.append({**l, "id": "x" + l["id"], "start": round(l["start"] - cs, 3), "end": round(l["end"] - cs, 3)})
    for l in LN["lines"]: lines.append({**l, "start": round(l["start"] + off, 3), "end": round(l["end"] + off, 3)})
    json.dump({"duration": DUR, "lines": lines}, open(os.path.join(P, "timeline", "lines.json"), "w"), ensure_ascii=False, indent=1)
    ns = [{**s, "start": round(s["start"] - cs, 3), "end": round(s["end"] - cs, 3)} for s in sents if cs - 0.01 <= s["start"] and s["end"] <= ce + 0.05]
    ns += [{**s, "start": round(s["start"] + off, 3), "end": round(s["end"] + off, 3)} for s in sents if b0 - 0.01 <= s["start"] and s["end"] <= b1 + 0.05]
    for i, s in enumerate(ns): s["i"] = i
    json.dump(ns, open(os.path.join(P, "timeline", "sentences.json"), "w"), ensure_ascii=False, indent=1)
    # config: herda do ep01 original, duração nova, música bem baixa
    cfg = json.load(open(O("config.json"))); cfg.update(title=c["titulo"], duration=DUR); cfg["music"]["gainDb"] = -27
    json.dump(cfg, open(os.path.join(P, "config.json"), "w"), ensure_ascii=False, indent=1)
    # cenas: o mesmo código compartilhado
    open(os.path.join(P, "scenes", "shots", "01_turno.js"), "w").write("// Turno da Madrugada · Ep. 1 — cenas compartilhadas pelas duas partes\nimport '/series/turno/ep01_cenas.js';\n")
    if not os.path.exists(os.path.join(P, "scenes", "cast.js")): shutil.copy2(O("scenes", "cast.js"), os.path.join(P, "scenes", "cast.js"))
    # todas as palavras (tempo novo) por fala, pras cenas acharem os instantes mesmo de falas fora da parte
    wall = [[w["word"], round(w["start"] + off, 3)] for w in words]
    return P, c, off, DUR, wall


def build(arquivo, n):
    P, c, off, DUR, wall = prepara(n)
    cold, rew = c["cold"][1] - c["cold"][0], c["rew"]; body = cold + rew
    pad = lambda a, ganho=-24: (a, "synth_pad", ganho)
    if n == 1:
        S = [
         ("X", 0, CUT, amb("madrugada", -26), [
            (0.0, "crickets", -24), (("xl03", "passou", -0.4), "metal_drag", -9), (("xl03", "passou", 0), "heartbeat", -16),
            (("xl03", "contramão", 0), "drag_steps", -30), (("xl03", "arrastando", 0), "riser", -16), pad(0.2, -22)]),
         ("RW", ("abs", cold), CUT, None, [(0.0, "vhs_rewind", -6), (rew - 0.9, "switch_click", -12), (rew - 0.85, "tv_static", -26)]),
         ("A", ("abs", body), COLD_FADE, amb("madrugada", -24), [
            (0.2, "crickets", -28),
            (("l01", "cafeteira", 0), "cafeteira", -16),
            (("l01", "geladeira", 0), "hum", -24),
            (("l01", "repondo", 0), "swish", -24), (("l01", "repondo", 0.9), "swish", -26), (("l01", "bolacha", 1.0), "swish", -26),
            (("l01", "tico", 0.3), "boots_tile", -22),
            (("l02", "quieta", 0), "crickets", -22),
            (("t02", 0.1), "dread", -28),
            (("l03", "passou", -0.4), "metal_drag", -10),
            (("l03", "passou", 0), "heartbeat", -18),
            (("l03", "arrastando", 0), "riser", -18), pad(("l03", "passou", 0), -24),
            (("l04", 0), "stinger", -16)]),
         ("C", ("tv1", -0.4), DIS, amb("madrugada", -26), [
            (("tv1", 0.05), "tv_static", -12), (("tv1", 0.1), "radio_static", -24),
            (("tv1", 0.5), "alarme", -24),
            (("tv1", "evitem", 0), "dread", -26), pad(("tv1", "evitem", 0), -28),
            (("t04", 0), "tv_static", -30)]),
         ("D", ("l05", -0.3), DIS, amb("madrugada", -26), [
            (("l05", "entrou", -0.7), "door_chime", -12),
            (("l05", "entrou", -0.2), "boots_tile", -16), (("l05", "entrou", 0.35), "boots_tile", -17), (("l05", "entrou", 0.9), "boots_tile", -17), (("l05", "entrou", 1.45), "boots_tile", -18), (("l05", "entrou", 2.0), "boots_tile", -19),
            (("l05", "branco", 0), "heartbeat", -18),
            (("l05", "encharcado", 0), "tensao", -24), pad(("l05", "encharcado", 0), -24),
            (("a01", "café", 0.5), "boots_tile", -24), (("a01", "café", 1.5), "colher", -18),
            (("a01", "mordeu", 0), "heartbeat", -14), (("a01", "acredita", 0), "stinger", -14)]),
         ("FIM", ("end", "a01", 0.75), CUT, None, [(0.05, "impact", -14), (0.3, "tv_static", -24), (1.4, "vhs_rewind", -30)]),
        ]
        musica = [(0, "tension", 0.25), ("A", "dark", 0.2), ("C", "tension", 0.25), ("D", "dark", 0.25), ("FIM", "dark", 0.15)]
        sem = ("X", "RW", "A", "C", "D", "FIM"); leg = ("RW", "FIM")
    else:
        S = [
         ("X", 0, CUT, amb("madrugada", -26), [
            (0.0, "glass_scratch", -14), (("xa03", "café", 0), "heartbeat", -16), (("xa03", "mordeu", 0), "glass_scratch", -16),
            (("xa03", "acredita", 0), "stinger", -14), pad(0.0, -20)]),
         ("RW", ("abs", cold), CUT, None, [(0.0, "vhs_rewind", -6), (rew - 0.9, "switch_click", -12), (rew - 0.85, "tv_static", -26)]),
         ("D", ("abs", body), COLD_FADE, amb("madrugada", -26), [
            (("a02", "cidade", 0, 2), "dread", -24), pad(("a02", "cidade", 0, 2), -26)]),
         ("E", ("l07", -0.1), DIS, amb("madrugada", -26), [
            (("l07", "pagou", 0.2), "register_beep", -14),
            (("l07", "pagou", 1.0), "boots_tile", -18), (("l07", "pagou", 1.45), "boots_tile", -19),
            (("l07", "pagou", 1.2), "door_chime", -14),
            (("l07", "embora", 0.6), "truck_leave", -12),
            (("l07", "depois", 0.4), "crickets", -18),
            (("end", "l07", 0.75), "distant_crash", -4),
            (("end", "l07", 0.8), "impact", -16),
            (("t05", 0.2), "heartbeat", -18), pad(("t05", 0), -24)]),
         ("F", ("l08", -0.35), DIS, amb("crickets", -20), [
            (("l08", 0.2), "madrugada", -30),
            (("l08", "gente", 0), "stinger", -14),
            (("l08", "olhando", 0), "heartbeat", -14),
            (("l08", "nenhum", 0), "dread", -22), pad(("l08", "gente", 0), -20),
            (("t06", "lâmpada", 0), "flicker", -12),
            (("t06", "queimando", 0), "flicker", -10),
            (("end", "t06", 0.3), "hit", -14),
            (("end", "t06", 0.35), "flicker", -12),
            (("end", "t06", 0.6), "drag_steps", -10)]),
         ("G", ("l09", -0.3), DIS, amb("madrugada", -26), [
            (("l09", "bateram", -0.15), "glass_knock", -4),
            (("l09", "era", 0), "stinger", -14),
            (("l09", "curativo", 0.3), "glass_scratch", -18), pad(("l09", "era", 0), -22),
            (("a03", 0), "dread", -22),
            (("l10", "palavra", 0), "heartbeat", -16),
            (("l10", "acredita", 0), "heartbeat", -14), (("l10", "acredita", 0.3), "glass_scratch", -14),
            (("t07", 0.2), "glass_knock", -16), (("t07", 1.0), "radio_static", -26)]),
         ("H", ("l11", -0.35), DIS, amb("fluorescent", -24), [
            (("l11", "corri", 0), "boots_tile", -10), (("l11", "corri", 0.35), "boots_tile", -10), (("l11", "corri", 0.7), "boots_tile", -10), (("l11", "corri", 1.05), "boots_tile", -10), (("l11", "corri", 1.4), "boots_tile", -10), (("l11", "corri", 1.75), "boots_tile", -11),
            (("l11", "cadeado", 0.7), "colher", -14),
            (("l11", "ouvi", 0), "riser", -16), pad(("l11", "ouvi", 0), -18),
            (("t08", 0), "dread", -18),
            (("l12", "tico", 0), "heartbeat", -12),
            (("l12", "lado", 0), "heartbeat", -10),
            (("end", "l12", 0.15), "door_creak", -6),
            (("end", "l12", 0.45), "riser", -12)]),
         ("T", ("end", "l12", 1.15), CUT, None, [(0.45, "flicker", -12), (0.95, "impact", -14)]),
         ("Kc", ("cta", -0.45), {"type": "fade", "dur": 0.4}, None, [(0.1, "tv_static", -24), (0.5, "pop", -14), (1.3, "ding", -16)]),
        ]
        musica = [(0, "tension", 0.25), ("D", "dark", 0.2), ("E", "dark", 0.25), ("F", "tension", 0.3), ("G", "dark", 0.3), ("H", "tension", 0.35), ("T", "dark", 0.2)]
        sem = tuple(x[0] for x in S); leg = ("RW", "T", "Kc")
    monta(arquivo, S, c["titulo"], sem_nums=sem, sem_hud=sem, sem_leg=leg, musica=musica)
    # ---- pós: parâmetros das cenas (cold/rebobinar/cartões), sem câmera viva/sujeira do motor, sem números/pops ----
    F = os.path.join(P, "story", "shots.json"); d = json.load(open(F))
    src = "A" if n == 1 else "G"
    src_t0 = c["cold"][0] + off            # onde o trecho do cold acontece no corpo (tempo novo)
    for sh in d["shots"]:
        sh["live"] = False; sh["grunge"] = False
        if sh["id"] not in ("T", "Kc", "FIM", "RW"): sh["vignette"] = False
        sh["params"]["Wall"] = wall; sh["params"]["parte"] = n
        if sh["id"] == "X": sh["params"].update(src=src, off=round(src_t0, 3))
        if sh["id"] == "RW": sh["params"].update(src=src, a=round(src_t0, 3), b=round(src_t0 + cold, 3), cartao=c["cartao"], parteTxt=f"PARTE {n}")
        if sh["id"] == "FIM": sh["params"].update(proximo="PARTE 2 →")
        if sh["id"] == "Kc": sh["params"].update(proximo="EP. 2 →")
    d["numbers"] = []; d["sfx"] = []
    json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
    print(f"parte {n}: {P}  duração {DUR:.2f}s  (cold {cold:.2f}s + rebobinar {rew}s)")
