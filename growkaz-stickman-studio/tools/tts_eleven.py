"""tools/tts_eleven.py — gera a narração com ElevenLabs a partir de story/roteiro.json.

  python3 tools/tts_eleven.py --project projects/<slug> [--verify]

roteiro.json: { "voices": {"NARRADOR": {"id": "...", "settings": {...}}, ...},
                "lines": [ {"id": "n1", "spk": "NARRADOR", "text": "...", "gap": 0.5, "settings": {...}} ],
                "tail": 3.0 }
`gap` = silêncio (s) ANTES da fala (tempo para ação visual). Opcionais por fala: "fx": "radio", "cut_end": s, "caption": [palavras da legenda]. Cada fala vira input/clips/<id>.mp3 (cache por texto+voz).
Escreve input/voiceover.wav, timeline/words.json, sentences.json, transcript.txt e timeline/lines.json (início/fim de cada fala).
A chave é injetada pelo proxy do ambiente (header xi-api-key); fora dele, defina ELEVEN_API_KEY.
"""
import argparse, base64, hashlib, json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import load_json, save_json, sentences_from_words, write_timeline, probe_duration

API = "https://api.elevenlabs.io"
KEY = os.environ.get("ELEVEN_API_KEY", "proxy-injected")


def post_json(url, body):
    r = subprocess.run(["curl", "-sS", "-m", "120", "-H", f"xi-api-key: {KEY}", "-H", "Content-Type: application/json", "-X", "POST", url, "-d", json.dumps(body)], capture_output=True)
    if r.returncode != 0: sys.exit("curl falhou: " + r.stderr.decode()[-400:])
    return json.loads(r.stdout)


def words_from_alignment(al):
    ch, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur, s0, e0 = [], "", None, None
    for c, a, b in zip(ch, st, en):
        if c.isspace():
            if cur: out.append({"word": cur, "start": s0, "end": e0}); cur = ""
            continue
        if not cur: s0 = a
        cur += c; e0 = b
    if cur: out.append({"word": cur, "start": s0, "end": e0})
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--project", required=True); ap.add_argument("--verify", action="store_true"); a = ap.parse_args()
    P = a.project; R = load_json(os.path.join(P, "story", "roteiro.json")); clips = os.path.join(P, "input", "clips"); os.makedirs(clips, exist_ok=True)
    model = R.get("model", "eleven_multilingual_v2"); t = 0.0; words, lines, inputs = [], [], []; spent = 0
    for i, ln in enumerate(R["lines"]):
        v = R["voices"][ln["spk"]]; settings = {**v.get("settings", {}), **ln.get("settings", {})}
        h = hashlib.sha1(json.dumps([ln["text"], v["id"], settings, model], sort_keys=True).encode()).hexdigest()[:10]
        mp3, meta = os.path.join(clips, f"{ln['id']}_{h}.mp3"), os.path.join(clips, f"{ln['id']}_{h}.json")
        if not (os.path.exists(mp3) and os.path.exists(meta)):
            body = {"text": ln["text"], "model_id": model, "voice_settings": settings, "language_code": "pt"} if model != "eleven_multilingual_v2" else {"text": ln["text"], "model_id": model, "voice_settings": settings}
            d = post_json(f"{API}/v1/text-to-speech/{v['id']}/with-timestamps?output_format=mp3_44100_128", body)
            if "audio_base64" not in d: sys.exit(f"ElevenLabs recusou {ln['id']}: {json.dumps(d)[:400]}")
            open(mp3, "wb").write(base64.b64decode(d["audio_base64"])); save_json(meta, d["alignment"]); spent += len(ln["text"])
        al = load_json(meta); dur = probe_duration(mp3); t += ln.get("gap", 0.3); w = words_from_alignment(al)
        # corta silêncio final exagerado da fala
        end_speech = min(dur, (w[-1]["end"] if w else dur) + 0.12)
        if ln.get("cut_end"): end_speech = max(0.3, end_speech - ln["cut_end"])          # corta o fim da fala (transmissão interrompida)
        cap = ln.get("caption")                                                            # texto alternativo da legenda, palavra a palavra
        if ln.get("fx") == "radio":                                                        # voz de rádio: banda estreita, distorção e chiado
            fxf = mp3[:-4] + "_radio.wav"
            if not os.path.exists(fxf): subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mp3, "-f", "lavfi", "-i", "anoisesrc=color=white:amplitude=0.18", "-filter_complex", "[0:a]highpass=f=600,lowpass=f=2400,acrusher=bits=7:mode=log:mix=0.6,tremolo=f=11:d=0.55,volume=1.6[v];[1:a]highpass=f=1200,lowpass=f=5000[n];[v][n]amix=inputs=2:duration=first:normalize=0", fxf], check=True)
            mp3 = fxf
        for k, x in enumerate(w): words.append({"word": cap[k] if cap and k < len(cap) else x["word"], "start": round(t + x["start"], 3), "end": round(t + min(x["end"], end_speech), 3), "spk": ln["spk"]})
        lines.append({"id": ln["id"], "spk": ln["spk"], "text": ln["text"], "start": round(t, 3), "end": round(t + end_speech, 3), "file": mp3})
        inputs.append((mp3, t, end_speech)); t += end_speech
    total = round(t + R.get("tail", 2.0), 3)
    # monta a faixa de voz
    cmd = ["ffmpeg", "-y", "-v", "error"]; fl = []
    for k, (f, st, d) in enumerate(inputs):
        cmd += ["-i", f]; fl.append(f"[{k}:a]atrim=0:{d:.3f},afade=t=out:st={max(0, d - 0.06):.3f}:d=0.06,adelay={int(st * 1000)}:all=1[a{k}]")
    fl.append("".join(f"[a{k}]" for k in range(len(inputs))) + f"amix=inputs={len(inputs)}:normalize=0,apad=whole_dur={total}[o]")
    out = os.path.join(P, "input", "voiceover.wav")
    subprocess.run(cmd + ["-filter_complex", ";".join(fl), "-map", "[o]", "-ar", "44100", "-ac", "1", out], check=True)
    save_json(os.path.join(P, "timeline", "lines.json"), {"duration": total, "lines": lines})
    write_timeline(os.path.join(P, "timeline"), words, sentences_from_words(words), "elevenlabs:" + model)
    cfgp = os.path.join(P, "config.json")
    if os.path.exists(cfgp): cfg = load_json(cfgp); cfg["duration"] = total; cfg["voiceover"] = "input/voiceover.wav"; save_json(cfgp, cfg)
    print(f"voz: {total:.1f}s, {len(lines)} falas, {spent} caracteres gastos agora")
    for l in lines: print(f"  {l['start']:6.2f}-{l['end']:6.2f}  {l['spk']:9s} {l['text']}")
    if a.verify:
        norm = lambda s: re.sub(r"[^\w ]+", "", s.lower(), flags=re.U).split()
        for l in lines:
            r = subprocess.run(["curl", "-sS", "-m", "120", "-H", f"xi-api-key: {KEY}", "-X", "POST", f"{API}/v1/speech-to-text", "-F", "model_id=scribe_v1", "-F", "language_code=por", "-F", f"file=@{l['file']}"], capture_output=True)
            try: txt = json.loads(r.stdout).get("text") or json.loads(r.stdout)
            except Exception: txt = r.stdout.decode()[:200]
            ok = isinstance(txt, str) and norm(txt) == norm(l["text"])
            print(("  OK   " if ok else "  DIF  ") + f"{l['id']}: {txt if not ok else ''}")


if __name__ == "__main__":
    main()
