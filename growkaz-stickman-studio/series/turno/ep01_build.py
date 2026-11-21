"""Turno da Madrugada · Ep. 1 — montagem do episódio único vertical (~2:15), reusando a narração já gravada.
Estrutura (pedido do usuário):
  1. COLD OPEN (~4 s): o "Seu Alberto" no vidro — batida + só o começo da a03 ("Me vê um café, filho.") -> rebobinar VHS + "3 HORAS ANTES".
  2. l01 -> a03 na ordem original, com as pausas originais (nada cortado).
  3. Termina no mímico pedindo café de novo (a03), segura no rosto dele, CORTE SECO -> cartão "EP. 2 →" com a fala cta por cima.
  4. l10, t07, l11, t08, l12 ficam para abrir o Ep. 2 (story/para_ep2.json).
Lê SEMPRE os originais de input/orig e timeline/orig (criados na 1ª execução) e reescreve input/voiceover.wav,
timeline/{words,lines,sentences}.json, config.json (duration) e story/shots.json.
Uso: python3 projects/turno-ep01/story/build_shots.py"""
import os, sys, json, shutil, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "series", "mamae"))
from build import monta, amb, DIS, CUT

P = os.path.join(ROOT, "projects", "turno-ep01")
FADE = {"type": "fade", "dur": 0.5}
PRE, COLD, POS = 0.8, (117.0, 119.65), 0.35          # cold open: silêncio (batida) + fragmento da a03 + respiro
REW = 1.8                                             # rebobinar + cartão "3 HORAS ANTES"
CORPO = (0.0, 124.45)                                 # l01 .. a03 (a l10 começa em 124.55)
HOLD = 0.9                                            # segura no rosto do mímico depois da a03
CARD_PRE, CTA, CARD_POS = 1.0, (148.0, 150.95), 0.45   # cartão final: título, fala cta, respiro
EP2 = ("l10", "t07", "l11", "t08", "l12")


def backup():
    for sub, files in (("input", ["voiceover.wav"]), ("timeline", ["words.json", "lines.json", "sentences.json", "transcript.txt"])):
        os.makedirs(os.path.join(P, sub, "orig"), exist_ok=True)
        for f in files:
            src, dst = os.path.join(P, sub, f), os.path.join(P, sub, "orig", f)
            if not os.path.exists(dst): shutil.copy2(src, dst)


def prepara():
    backup(); O = lambda *a: os.path.join(P, *a)
    words = json.load(open(O("timeline", "orig", "words.json")))["words"]
    LN = json.load(open(O("timeline", "orig", "lines.json"))); sents = json.load(open(O("timeline", "orig", "sentences.json")))
    cs, ce = COLD; cold = PRE + (ce - cs) + POS
    offB = cold + REW - CORPO[0]                                  # corpo: tempo novo = original + offB
    card0 = offB + CORPO[1] + HOLD                                # início do cartão final (tempo novo)
    offC = card0 + CARD_PRE - CTA[0]                              # cta: tempo novo = original + offC
    DUR = round(card0 + CARD_PRE + (CTA[1] - CTA[0]) + CARD_POS, 3)
    offX = PRE - cs                                               # cold: tempo novo = original + offX
    # ---- áudio
    sil = lambda d, k: f"anullsrc=r=44100:cl=mono,atrim=0:{d:.3f}[{k}];"
    fc = (sil(PRE, "s0") + f"[0:a]atrim={cs}:{ce},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st={ce - cs - 0.1:.3f}:d=0.1[a];" + sil(POS + REW, "s1")
          + f"[0:a]atrim={CORPO[0]}:{CORPO[1]},asetpts=PTS-STARTPTS,afade=t=out:st={CORPO[1] - CORPO[0] - 0.08:.3f}:d=0.08[b];" + sil(HOLD + CARD_PRE, "s2")
          + f"[0:a]atrim={CTA[0]}:{CTA[1]},asetpts=PTS-STARTPTS,afade=t=in:d=0.03[c];" + sil(CARD_POS, "s3")
          + "[s0][a][s1][b][s2][c][s3]concat=n=7:v=0:a=1[o]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", O("input", "orig", "voiceover.wav"), "-filter_complex", fc, "-map", "[o]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", O("input", "voiceover.wav")], check=True)
    # ---- palavras (legendas): cold + corpo + cta
    dentro = lambda w, a, b: a - 0.01 <= w["start"] and w["end"] <= b + 0.05
    mv = lambda w, off: {**w, "start": round(w["start"] + off, 3), "end": round(w["end"] + off, 3)}
    nw = [mv(w, offX) for w in words if dentro(w, cs, ce)] + [mv(w, offB) for w in words if dentro(w, *CORPO)] + [mv(w, offC) for w in words if dentro(w, *CTA)]
    json.dump({"source": "ep01 único: cold open (a03 parcial) + l01..a03 + cta, deslocados", "words": nw}, open(O("timeline", "words.json"), "w"), ensure_ascii=False, indent=1)
    # ---- falas: todas deslocadas pelo corpo (as do Ep. 2 ficam além do fim, só de referência pras cenas) + cópia parcial da a03 no cold + cta no cartão
    lines = []
    for l in LN["lines"]:
        if l["id"] == "cta": lines.append(mv(l, offC))
        else: lines.append(mv(l, offB))
        if l["id"] == "a03": lines.append({**l, "id": "xa03", "text": "[ofegante, cansado] Me vê um café, filho.", "start": round(cs + offX, 3), "end": round(ce + offX, 3)})
    json.dump({"duration": DUR, "lines": lines}, open(O("timeline", "lines.json"), "w"), ensure_ascii=False, indent=1)
    ns = [mv(s, offB) for s in sents if dentro(s, *CORPO)] + [mv(s, offC) for s in sents if dentro(s, *CTA)]
    ns = [{"i": 0, "start": round(118.256 + offX, 3), "end": round(119.376 + offX, 3), "text": "Me vê um café, filho."}] + ns
    for i, s in enumerate(ns): s["i"] = i
    json.dump(ns, open(O("timeline", "sentences.json"), "w"), ensure_ascii=False, indent=1)
    cfg = json.load(open(O("config.json"))); cfg.update(title="Turno da Madrugada - Ep1 - O Ultimo Cafe", duration=DUR); cfg["music"]["gainDb"] = -27
    json.dump(cfg, open(O("config.json"), "w"), ensure_ascii=False, indent=1)
    # ---- o que fica pro Ep. 2
    ep2 = {"nota": "Falas do Ep. 1 original que NÃO entram no Ep. 1 final: abrem o Ep. 2. Tempos no voiceover original (input/orig/voiceover.wav).",
           "fonte_audio": "projects/turno-ep01/input/orig/voiceover.wav",
           "falas": [{**l, "palavras": [w for w in words if dentro(w, l["start"], l["end"])]} for l in LN["lines"] if l["id"] in EP2],
           "trecho_continuo": [min(l["start"] for l in LN["lines"] if l["id"] in EP2), max(l["end"] for l in LN["lines"] if l["id"] in EP2)],
           "cenas_prontas": "series/turno/ep01_cenas.js: shot 'H' (cadeado, voz no estoque, Tico do lado, porta abre) e o final de 'G' (l10/t07)."}
    json.dump(ep2, open(O("story", "para_ep2.json"), "w"), ensure_ascii=False, indent=1)
    wall = [[w["word"], round(w["start"] + offB, 3)] for w in words]
    return dict(DUR=DUR, cold=cold, offB=offB, offX=offX, card0=card0, wall=wall)


def build(arquivo):
    k = prepara(); cold, body = k["cold"], k["cold"] + REW
    pad = lambda a, g=-24: (a, "synth_pad", g)
    S = [
     ("X", 0, CUT, amb("madrugada", -26), [
        (0.15, "glass_knock", -3), (0.25, "synth_pad", -20), (("xa03", "me", 0), "heartbeat", -16), (("xa03", "filho", 0.2), "glass_scratch", -16)]),
     ("RW", ("abs", cold), CUT, None, [(0.0, "vhs_rewind", -6), (REW - 0.75, "switch_click", -12), (REW - 0.7, "tv_static", -28)]),
     ("A", ("abs", body), FADE, amb("madrugada", -24), [
        (0.2, "crickets", -28),
        (("l01", "cafeteira", 0), "cafeteira", -16),
        (("l01", "geladeira", 0), "hum", -24),
        (("l01", "repondo", 0), "swish", -24), (("l01", "repondo", 0.9), "swish", -26), (("l01", "bolacha", 1.0), "swish", -26),
        (("l01", "tico", 0.3), "boots_tile", -22),
        (("l02", "quieta", 0), "crickets", -22),
        (("t02", 0.1), "dread", -28),
        (("l03", "passou", -0.4), "metal_drag", -10),
        (("l03", "passou", 0), "heartbeat", -18),
        (("l03", "arrastando", 0), "riser", -18), pad(("l03", "passou", 0)),
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
        (("l05", "encharcado", 0), "tensao", -24), pad(("l05", "encharcado", 0)),
        (("a01", "café", 0.5), "boots_tile", -24), (("a01", "café", 1.5), "colher", -18),
        (("a01", "mordeu", 0), "heartbeat", -16),
        (("a02", "cidade", 0, 2), "dread", -24)]),
     ("E", ("l07", -0.1), DIS, amb("madrugada", -26), [
        (("l07", "pagou", 0.2), "register_beep", -14),
        (("l07", "pagou", 1.0), "boots_tile", -18), (("l07", "pagou", 1.45), "boots_tile", -19),
        (("l07", "pagou", 1.2), "door_chime", -14),
        (("l07", "embora", 0.6), "truck_leave", -12),
        (("l07", "depois", 0.4), "crickets", -18),
        (("end", "l07", 0.75), "distant_crash", -4),
        (("end", "l07", 0.8), "impact", -16),
        (("t05", 0.2), "heartbeat", -18), pad(("t05", 0))]),
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
        (("a03", "mordeu", 0), "heartbeat", -14), (("a03", "acredita", 0.2), "glass_scratch", -14), (("end", "a03", 0.1), "riser", -14)]),
     ("FIM", ("end", "a03", 0.4 + HOLD), CUT, None, [(0.0, "impact", -12), (0.05, "tv_static", -24), (CARD_PRE + 0.3, "pop", -16), (CARD_PRE + 1.1, "ding", -18)]),
    ]
    musica = [(0, "tension", 0.25), ("A", "dark", 0.2), ("C", "tension", 0.25), ("D", "dark", 0.25), ("E", "dark", 0.25), ("F", "tension", 0.3), ("G", "dark", 0.3), ("FIM", "dark", 0.15)]
    sem = tuple(x[0] for x in S)
    monta(arquivo, S, "Turno da Madrugada - Ep1 - O Ultimo Cafe", sem_nums=sem, sem_hud=sem, sem_leg=("RW", "FIM"), musica=musica)
    F = os.path.join(P, "story", "shots.json"); d = json.load(open(F))
    srcT0 = COLD[0] - PRE + k["offB"]                    # instante (tempo novo, no corpo) equivalente ao começo do cold
    for sh in d["shots"]:
        sh["live"] = False; sh["grunge"] = False
        if sh["id"] not in ("FIM", "RW"): sh["vignette"] = False
        sh["params"]["Wall"] = k["wall"]
        if sh["id"] == "X": sh["params"].update(src="G", off=round(srcT0, 3))
        if sh["id"] == "RW": sh["params"].update(src="G", a=round(srcT0, 3), b=round(srcT0 + k["cold"], 3), cartao="3 HORAS ANTES", parteTxt="EP. 1")
        if sh["id"] == "FIM": sh["params"].update(proximo="EP. 2 →", card=CARD_PRE)
    d["numbers"] = []; d["sfx"] = []
    json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
    print(f"Ep. 1 único: duração {k['DUR']:.2f}s  (cold {k['cold']:.2f}s + rebobinar {REW}s; cartão final em {k['card0']:.2f}s)")
