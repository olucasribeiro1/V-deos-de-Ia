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
