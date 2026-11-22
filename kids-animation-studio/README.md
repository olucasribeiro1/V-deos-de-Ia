# Estúdio de Animação Infantil 3D

## Como produzir uma nova música
1. Coloque em `music/`: a música (`.mp3`), `words.json` (tempo por palavra — gerar com ElevenLabs Scribe) e `composition_plan.json` (letra por seção).
2. Storyboard: `/opt/kidsvenv/bin/python scripts/make_storyboard.py` → `storyboards/*.md|json` (revisar antes de renderizar).
3. Prévia rápida de quadros-chave: `/opt/kidsvenv/bin/python scripts/pilot3d.py --test --res 960x540`
4. Render (retoma sozinho; pula quadros prontos): `FRAME_STEP=2 /opt/kidsvenv/bin/python scripts/pilot3d.py --res 960x540`
5. Montagem final (legenda karaokê + selos + áudio original, 1080p/30fps H.264/AAC): `/opt/kidsvenv/bin/python scripts/finish_pilot.py --dur 30`

## Componentes
- `scripts/chars3d.py` — personagens 3D (malha única Skin+Subdivision, esqueleto com pesos automáticos, olhos com íris, pálpebras, sobrancelhas, boca) e **solver de poses por direção** (`ARM_POSES`).
- `scripts/mhkid.py` — experimento com malha humana MakeHuman (CC0) cartunizada. **Descartado** (resultado assustador).
- `scripts/pilot3d.py` — cenário 3D (relevo, árvores, flores, nuvens, sol, lua, estrelas, luz), roteiro por letra, câmeras, sincronia labial por palavra.
- `scripts/finish_pilot.py` — legenda karaokê no estilo da referência, selos dos dias, áudio, exportação.
- `scripts/make_storyboard.py` — interpretação da letra → storyboard.
- `reports/REFERENCIA_ESTILO.md` — bíblia de estilo tirada do vídeo de referência.
- `reports/DIARIO.md` — diário/estado para retomada.

## Ambiente
Blender 5.3 (módulo `bpy` no venv `/opt/kidsvenv`), Cycles CPU (sem GPU: ~6 s/quadro em 960x540), FFmpeg, librosa, skia, Pillow.
