#!/usr/bin/env python3
"""gerar_audio.py — gera narração (com tempo de cada palavra) e efeitos sonoros
na ElevenLabs a partir do roteiro, e monta a linha do tempo do episódio.

Uso:  python3 gerar_audio.py episodios/ep01/roteiro.json public/ep01
Tudo que já foi gerado fica em cache (não gasta créditos de novo).
Apague o arquivo em <saida>/cache para refazer uma fala ou efeito.
"""
import base64, json, os, re, subprocess, sys, unicodedata
from pathlib import Path
import requests

API = "https://api.elevenlabs.io/v1"
HEAD = {"xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "x")}  # no ambiente cloud o proxy injeta a chave
MODELO = "eleven_multilingual_v2"
GAP = 0.18  # respiro entre falas (ritmo acelerado)

roteiro_path, saida = Path(sys.argv[1]), Path(sys.argv[2])
R = json.loads(roteiro_path.read_text())
cache = saida / "cache"; voz_dir = saida / "voz"; sfx_dir = saida / "sfx"
for d in (cache, voz_dir, sfx_dir): d.mkdir(parents=True, exist_ok=True)


def ff(*args):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *args], check=True)


def duracao(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(p)], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def norm(w):
    w = unicodedata.normalize("NFC", w.lower())
    return re.sub(r"[^\wà-ú]", "", w)


def tts(fala, ant, prox):
    alvo = cache / f"{fala['id']}.json"
    if alvo.exists():
        return json.loads(alvo.read_text())
    v = R["vozes"][fala["voz"]]
    vs = {"stability": v["stability"], "similarity_boost": 0.8, "style": v["style"],
          "use_speaker_boost": True, "speed": v["speed"], **fala.get("voice_settings", {})}
    body = {"text": fala["texto"], "model_id": MODELO, "voice_settings": vs}
    if ant: body["previous_text"] = ant
    if prox: body["next_text"] = prox
    print(f"  TTS {fala['id']} ({v['nome']})")
    r = requests.post(f"{API}/text-to-speech/{v['id']}/with-timestamps", headers=HEAD, json=body, timeout=180)
    r.raise_for_status()
    d = r.json()
    alvo.write_text(json.dumps(d))
    return d


def palavras(al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur = [], None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur: out.append(cur); cur = None
            continue
        if cur is None: cur = {"w": c, "s": s, "e": e}
        else: cur["w"] += c; cur["e"] = e
    if cur: out.append(cur)
    return out


def sfx(nome, spec):
    alvo = sfx_dir / f"{nome}.mp3"
    if not alvo.exists():
        print(f"  SFX {nome}")
        r = requests.post(f"{API}/sound-generation", headers=HEAD, timeout=180, json={
            "text": spec["prompt"], "duration_seconds": spec["dur"], "prompt_influence": 0.55})
        r.raise_for_status()
        alvo.write_bytes(r.content)
    return alvo


# ---------- 1. narração ----------
print("Narração:")
falas = R["falas"]
tl_falas, t = [], 0.0
for i, f in enumerate(falas):
    mesma = lambda j: falas[j]["texto"] if 0 <= j < len(falas) and falas[j]["voz"] == f["voz"] else None
    d = tts(f, mesma(i - 1), mesma(i + 1))
    bruto = cache / f"{f['id']}.mp3"
    bruto.write_bytes(base64.b64decode(d["audio_base64"]))
    ws = palavras(d.get("normalized_alignment") or d["alignment"])

    fim_audio = None
    if "cortarEm" in f:  # interrompe a fala no meio da palavra (caixa postal / rádio)
        w = next(w for w in ws if norm(w["w"]) == norm(f["cortarEm"]))
        fim_audio = w["s"] + (w["e"] - w["s"]) * f.get("cortarFracao", 0.5)
        ws = [x for x in ws if x["s"] < fim_audio]
        ws[-1]["e"] = fim_audio; ws[-1]["w"] = ws[-1]["w"][: max(2, int(len(ws[-1]["w"]) * f.get("cortarFracao", .5)))] + "—"

    filtros = {
        "telefone": "highpass=f=320,lowpass=f=3300,acompressor=threshold=-18dB:ratio=4,volume=1.4",
        "radio": "highpass=f=450,lowpass=f=2700,acrusher=bits=10:mix=0.35,"
                 "volume='if(lt(mod(t\\,1.7)\\,0.12)\\,0.15\\,1)':eval=frame,volume=1.6",
    }
    af = [filtros[f["filtro"]]] if "filtro" in f else []
    if fim_audio: af.append(f"afade=t=out:st={max(0, fim_audio - 0.03):.3f}:d=0.03")
    final = voz_dir / f"{f['id']}.wav"
    ff("-i", str(bruto), *(["-t", f"{fim_audio:.3f}"] if fim_audio else []),
       *(["-af", ",".join(af)] if af else []), "-ar", "48000", "-ac", "1", str(final))
    dur = duracao(final)
    tl_falas.append({"id": f["id"], "voz": f["voz"], "beat": f["beat"], "arquivo": f"ep01/voz/{f['id']}.wav",
                     "start": round(t, 3), "end": round(t + dur, 3),
                     "palavras": [{"w": w["w"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in ws]})
    t += dur + f.get("pausaDepois", GAP)
total = round(t, 3)

# ---------- 2. resolve âncoras (palavra -> segundo) ----------
def tempo(seg_i, at):
    seg = tl_falas[seg_i]
    if at == "fim": return seg["end"]
    if at == "fim+radio": return tl_falas[seg_i + 1]["end"]
    if isinstance(at, (int, float)): return seg["start"] + (seg["end"] - seg["start"]) * at
    alvo = norm(at)
    for w in seg["palavras"]:
        if norm(w["w"]) == alvo: return w["s"]
    raise ValueError(f"palavra '{at}' não achada em {seg['id']}")

print("Efeitos:")
tl_sfx, tl_ov, tl_ev = [], [], []
for i, f in enumerate(falas):
    for s in f.get("sfx", []):
        sfx(s["id"], R["efeitos"][s["id"]])
        st = tempo(i, s["at"])
        en = total if s.get("ateFinal") else (tempo(i, s["ate"]) if "ate" in s else None)
        tl_sfx.append({"id": s["id"], "arquivo": f"ep01/sfx/{s['id']}.mp3", "start": round(st, 3),
                       "end": round(en, 3) if en else None, "vol": s.get("vol", 1), "loop": s.get("loop", False),
                       "dur": duracao(sfx_dir / f"{s['id']}.mp3")})
    for o in f.get("overlays", []):
        tl_ov.append({**{k: v for k, v in o.items() if k not in ("at", "ate")},
                      "start": round(tempo(i, o["at"]), 3), "end": round(tempo(i, o["ate"]), 3)})
    for e in f.get("eventos", []):
        tl_ev.append({"tipo": e["tipo"], "start": round(tempo(i, e["at"]), 3),
                      "end": round(tempo(i, e["ate"]) if "ate" in e else total, 3)})

# beats: cada beat vai do início da sua fala até o início da próxima fala com beat diferente
beats = []
for f in tl_falas:
    if beats and beats[-1]["beat"] == f["beat"]: continue
    if beats: beats[-1]["end"] = f["start"]
    beats.append({"beat": f["beat"], "start": f["start"]})
beats[-1]["end"] = total

tl = {"titulo": R["titulo"], "total": total, "falas": tl_falas, "sfx": tl_sfx,
      "overlays": tl_ov, "eventos": tl_ev, "beats": beats}
(saida / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1))
print(f"✅ timeline: {total:.1f}s, {len(tl_falas)} falas, {len(tl_sfx)} efeitos → {saida/'timeline.json'}")
