# V-deos-de-Ia
Meus videos

## Vídeos por código

Stack: **Remotion** (vídeo em React) + **three.js** (3D via `@remotion/three`) + `toon.js` (visual cartoon) + `mix.py` (áudio via ffmpeg) + `render.mjs` (render).

```bash
npm install
npm run studio                                            # editor visual no navegador
node render.mjs Cena out/video.mp4 '{"titulo":"Olá"}'     # renderiza
python3 mix.py out/video.mp4 --voz audio/voz.mp3 --musica audio/musica.mp3 -o out/final.mp4
```

- `metrics.json` — resolução, fps, duração, qualidade e volumes (edite aqui).
- `src/Cena.jsx` — a cena (3D + texto).
- Sem GPU, o render usa WebGL por software (`swangle`). Com GPU: `REMOTION_GL=angle`.

## APAGÃO — Episódio 1

```bash
python3 gerar_audio.py episodios/ep01/roteiro.json public/ep01   # narração + efeitos (ElevenLabs), com cache
node stills.mjs Ep01 14 47 101                                   # confere quadros soltos em out/stills
CONCURRENCY=4 node render.mjs Ep01 out/apagao_ep01_bruto.mp4      # render completo
python3 mix.py out/apagao_ep01_bruto.mp4 -o out/APAGAO_EP01.mp4   # master -14 LUFS
```

- `episodios/ep01/roteiro.json` — falas, vozes, efeitos, overlays e eventos ancorados em palavras.
- `src/ep01/cena.js` — plano-sequência: trajetória do Nelson e da câmera por beat.
- `src/ep01/Cenario.jsx` — apê curitibano + rua (araucárias, postes com fiação, petit-pavê).
