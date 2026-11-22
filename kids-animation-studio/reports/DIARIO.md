# Diário de execução — Estúdio 3D

## Estado
- [x] P1 Diagnóstico (Blender 5.3 bpy em /opt/kidsvenv, FFmpeg, librosa, skia, Pillow; CPU 4 núcleos, 15 GB RAM, sem GPU)
- [x] P2 Infra testada (Blender bpy render Cycles OK; EEVEE inviável sem GPU: ~50 s/quadro)
- [x] P3 Personagem 3D + rig + cenário (chars3d.py; MakeHuman cartunizado descartado — ver README)
- [x] P4 Storyboard + sincronização (storyboards/01-*.md, words.json, lip sync por palavra)
- [ ] P5 Piloto 30s — RENDERIZANDO (renders/pilot, FRAME_STEP=2). Retomar: `cd scripts && FRAME_STEP=2 /opt/kidsvenv/bin/python pilot3d.py --res 960x540` e depois `finish_pilot.py --dur 30`
- [ ] P6 Validação e documentação

## Retomar
```bash
cd /home/user/V-deos-de-Ia/kids-animation-studio && cat reports/DIARIO.md
```
