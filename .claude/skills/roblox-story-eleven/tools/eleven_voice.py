"""ElevenLabs narrator voice for a story video: replaces Flashloop (voice) AND faster-whisper (word timing).

    python tools/eleven_voice.py <slug> [--voice-id ID] [--model eleven_multilingual_v2] [--speed 1.15] [--reuse]
    python tools/eleven_voice.py --list-voices

What it does, in the house order of tools/voice_run.py but with no whisper anywhere:
  1. reads videos/<slug>/script.txt (lines starting with # are notes), the same text tools/script_text.py prints,
     and checks the ElevenLabs account has enough characters left;
  2. POST /v1/text-to-speech/<voice>/with-timestamps -> audio/raw.mp3 + audio/eleven_alignment.json
     (--reuse skips this and re-processes those two files: no API call, no credits);
  3. character timings -> word timings [{w, s, e}];
  4. ffmpeg atempo=<speed> -> audio/raw_fast.wav (48k mono), seeds audio/whisper.json with the word timings
     (stamped for raw_fast.wav), runs tools/voice.py (pass 1: cut the pauses), copies voice.wav to trimmed.wav,
     seeds whisper.json again from the words.json pass 1 wrote, runs tools/voice.py --no-trim (pass 2).
     voice.py finds its "whisper" cache already filled, so faster-whisper is never loaded;
  5. prints duration, words, wpm, words before 15 s and the largest gap. Then run tools/tighten.py and
     tools/retempo.py as usual.

The API key is never handled here: the request carries a placeholder xi-api-key header that the network proxy
replaces (set ELEVEN_API_KEY in the environment instead on a machine without such a proxy).
The voice id is remembered in config.json as "eleven_voice_id" once given with --voice-id."""
import argparse, base64, json, os, re, shutil, subprocess, sys, urllib.error, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import kit  # noqa: E402

API = 'https://api.elevenlabs.io'
OUTPUT_FORMAT = 'mp3_44100_128'


# ---- API ---------------------------------------------------------------------------------
def api(method, path, body=None, timeout=300):
    headers = {'xi-api-key': os.environ.get('ELEVEN_API_KEY') or 'dummy', 'Accept': 'application/json'}
    data = None
    if body is not None:
        data = json.dumps(body).encode('utf-8'); headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(API + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        detail = e.read().decode('utf-8', 'replace')[:600]
        raise SystemExit(f'ElevenLabs {method} {path} failed: HTTP {e.code}: {detail}')


def list_voices():
    vs = api('GET', '/v1/voices').get('voices', [])
    vs.sort(key=lambda v: (v.get('category') != 'premade', v.get('name', '')))
    for v in vs:
        lab = v.get('labels') or {}
        bits = [lab.get(k) for k in ('accent', 'age', 'gender') if lab.get(k)]
        use = lab.get('use_case') or lab.get('use case') or ''
        desc = lab.get('description') or ''
        print(f"{v['voice_id']}  {v.get('name', '?'):<28} {v.get('category', ''):<12} {', '.join(bits)}"
              + (f' | {use}' if use else '') + (f' | {desc}' if desc else ''))
    print(f'\n{len(vs)} voices. Use one with: python tools/eleven_voice.py <slug> --voice-id <id>')


def remaining_chars():
    try:
        s = api('GET', '/v1/user/subscription', timeout=60)
    except SystemExit as e:
        print(f'warning: could not read the account balance ({e}); continuing', file=sys.stderr)
        return None
    return int(s.get('character_limit', 0)) - int(s.get('character_count', 0))


# ---- text and timings ---------------------------------------------------------------------
def narration(slug):
    # exactly tools/script_text.py
    p = os.path.join(ROOT, 'videos', slug, 'script.txt')
    if not os.path.exists(p):
        sys.exit(f'no script at {p}')
    lines = [l.strip() for l in open(p, encoding='utf-8') if l.strip() and not l.lstrip().startswith('#')]
    return '\n'.join(lines)


def alignment_words(al):
    # ElevenLabs character alignment -> [{w, s, e}], words split on whitespace
    ch = al['characters']; st = al['character_start_times_seconds']; en = al['character_end_times_seconds']
    words, cur = [], None
    for c, s, e in zip(ch, st, en):
        if c.isspace():
            if cur: words.append(cur); cur = None
            continue
        if cur is None: cur = {'w': c, 's': s, 'e': e}
        else: cur['w'] += c; cur['e'] = e
    if cur: words.append(cur)
    for w in words: w['s'] = round(w['s'], 3); w['e'] = round(max(w['e'], w['s']), 3)
    return words


def seed_cache(adir, src, words):
    # the cache tools/voice.py's whisper_words() reads: hit when source == [abs path, size, int(mtime)]
    stamp = [os.path.abspath(src), os.path.getsize(src), int(os.path.getmtime(src))]
    json.dump({'source': stamp, 'words': words}, open(os.path.join(adir, 'whisper.json'), 'w'))


def run_voice(args, n_script):
    r = subprocess.run(args, capture_output=True, text=True)
    out = r.stdout + r.stderr
    sys.stdout.write(out)
    if r.returncode != 0:
        sys.exit(f'tools/voice.py failed (exit {r.returncode})')
    m = re.search(r'aligned (\d+) script words to (\d+) whisper words: (\d+) matched', out)
    if 'faster_whisper' in out or 'faster-whisper' in out or 'cuda failed' in out or not m:
        sys.exit('tools/voice.py did not use the seeded timing cache (it tried to transcribe); stopping')
    n, matched = int(m.group(1)), int(m.group(3))
    if matched < n - max(1, n // 50):
        sys.exit(f'only {matched}/{n} script words matched the ElevenLabs timings; is script.txt the narrated text?')
    return out


def summary(adir):
    words = json.load(open(os.path.join(adir, 'words.json'), encoding='utf-8'))
    dur = words[-1]['end']
    gaps = [(words[i + 1]['start'] - words[i]['end'], i) for i in range(len(words) - 1)]
    g, gi = max(gaps) if gaps else (0.0, 0)
    early = sum(1 for w in words if w['start'] < 15)
    wpm = len(words) / dur * 60 if dur else 0
    print('\n--- summary (targets: 255-280 wpm, 65-75 words before 15 s, no gap > 0.45 s)')
    print(f'duration {dur:.2f}s | {len(words)} words | {wpm:.1f} wpm | {early} words before 15 s | '
          f'largest gap {g:.3f}s' + (f' (after "{words[gi]["word"]}")' if gaps else ''))
    print('next: python tools/tighten.py <slug>  then  python tools/retempo.py <slug> --wpm 258')


# ---- main ----------------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('slug', nargs='?')
    ap.add_argument('--voice-id', default='')
    ap.add_argument('--model', default='eleven_multilingual_v2')
    ap.add_argument('--speed', type=float, default=1.15)
    ap.add_argument('--reuse', action='store_true', help='re-process audio/raw.mp3 + eleven_alignment.json, no API call')
    ap.add_argument('--list-voices', action='store_true')
    o = ap.parse_args()
    if o.list_voices:
        return list_voices()
    if not o.slug:
        ap.error('slug is required (or --list-voices)')

    adir = os.path.join(ROOT, 'videos', o.slug, 'audio'); os.makedirs(adir, exist_ok=True)
    raw, align_p = os.path.join(adir, 'raw.mp3'), os.path.join(adir, 'eleven_alignment.json')
    text = narration(o.slug)

    if o.reuse:
        if not (os.path.exists(raw) and os.path.exists(align_p)):
            sys.exit(f'--reuse needs {raw} and {align_p}; run once without --reuse first')
        print(f'reusing {raw} and its alignment (no API call)')
        al = json.load(open(align_p, encoding='utf-8'))
    else:
        cfgp = os.path.join(ROOT, 'config.json')
        if o.voice_id:
            cur = json.load(open(cfgp, encoding='utf-8')) if os.path.exists(cfgp) else {}
            if cur.get('eleven_voice_id') != o.voice_id:
                cur['eleven_voice_id'] = o.voice_id; kit.save_cfg(cur)
                print(f'saved eleven_voice_id = {o.voice_id} in config.json')
        voice_id = o.voice_id or kit.cfg().get('eleven_voice_id')
        if not voice_id:
            sys.exit('no ElevenLabs voice chosen. Run: python tools/eleven_voice.py --list-voices\n'
                     'then: python tools/eleven_voice.py <slug> --voice-id <id>  (it is remembered afterwards)')
        left = remaining_chars()
        print(f'narration: {len(text)} characters, {len(text.split())} words; account has '
              + (f'{left} characters left' if left is not None else 'an unknown balance'))
        if left is not None and left < len(text):
            sys.exit(f'not enough ElevenLabs characters: need {len(text)}, have {left}')
        print(f'generating with voice {voice_id}, model {o.model} ...')
        r = api('POST', f'/v1/text-to-speech/{voice_id}/with-timestamps?output_format={OUTPUT_FORMAT}',
                {'text': text, 'model_id': o.model})
        open(raw, 'wb').write(base64.b64decode(r['audio_base64']))
        al = r.get('alignment') or r.get('normalized_alignment')
        if not al:
            sys.exit('the response carried no alignment')
        json.dump(al, open(align_p, 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'wrote {raw} and {align_p}')

    words = alignment_words(al)
    if not words:
        sys.exit('the alignment has no words')
    print(f'{len(words)} words from the ElevenLabs alignment, raw speech {words[-1]["e"]:.2f}s')

    # the voice_run.py pipeline, with the timing cache filled from the alignment instead of whisper
    fast, trimmed = os.path.join(adir, 'raw_fast.wav'), os.path.join(adir, 'trimmed.wav')
    voice_py = [sys.executable, os.path.join(ROOT, 'tools', 'voice.py'), '--video', o.slug]
    n_script = len(text.split())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', f'atempo={o.speed}', '-ar', '48000', '-ac', '1', fast],
                   check=True)
    sp = o.speed
    seed_cache(adir, fast, [{'w': w['w'], 's': round(w['s'] / sp, 3), 'e': round(w['e'] / sp, 3)} for w in words])
    print('\n== pass 1: cut the pauses')
    run_voice(voice_py + ['--voice', fast], n_script)
    shutil.copyfile(os.path.join(adir, 'voice.wav'), trimmed)
    w1 = json.load(open(os.path.join(adir, 'words.json'), encoding='utf-8'))
    seed_cache(adir, trimmed, [{'w': w['word'], 's': w['start'], 'e': w['end']} for w in w1])
    print('\n== pass 2: time the words on the cut audio')
    run_voice(voice_py + ['--voice', trimmed, '--no-trim'], n_script)
    print(f'voice ready: {os.path.join(adir, "voice.wav")} (x{sp}, silences cut, ElevenLabs timings)')
    summary(adir)


if __name__ == '__main__':
    main()
