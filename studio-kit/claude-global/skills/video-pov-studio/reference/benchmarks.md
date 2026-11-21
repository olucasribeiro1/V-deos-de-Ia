# BENCHMARKS E GARGALOS MEDIDOS (não redescubra — atualize quando medir de novo)

Máquina de referência: nuvem, 4 vCPU, 15,7 GB RAM, **sem GPU** (WebGL por software), Chromium headless shell local.

## Render (Remotion + R3F, 1280x720, 24 fps)
| Teste | Resultado |
|---|---|
| `--gl=swangle` vs `--gl=angle` (200 caixas + sombra) | angle **2× mais rápido** → padrão angle |
| Concorrência 2 vs 4 | ~igual (3,22 vs 3,12 fps) → gargalo é rasterização por software, não JS |
| Sem grão / sem contorno / sem sombra / sem AA (cada um isolado) | +4% / +12% / +17% / +17% → nenhum é o vilão; mantidos pela qualidade |
| Sem a cidade (fundo pela janela) | 3,0 → **6,5 fps** → cidade era o gargalo |
| Cidade com material pré-iluminado (MeshBasic) | 3,0 → 3,5 fps |
| + `renderOrder` alto na cidade (desenhada depois do interior, early-z) | → **4,0 fps** |
| StaticBatch do apartamento (centenas → ~20 draw calls) | velocidade igual nesta máquina; visual idêntico; mantido (memória/CPU, cenas maiores) |
| Demo 45 s final | 241 s de render = **4,46 fps = 5,4× tempo real**; pico de RAM **2,6 GB** |
| Projeção episódio 11 min | ≈ 59 min de render (cenas internas são mais leves que olhar a cidade) |

| **Episódio 01 completo (10 min 04 s, 8 cenas)** | **3.188 s = 53 min** de render total = **5,25× tempo real**; 4,05–5,82 fps por cena; pico RAM **2,49 GB**; MP4 de 126 MB |

## Áudio (ElevenLabs)
- Narração do episódio (71 falas, 4,8 mil caracteres, com transcrição de verificação): **76 s** (3 em paralelo).
- Biblioteca de 45 SFX: ~2 min na primeira vez; depois cache.
- Créditos: episódio de 10 min ≈ 5 mil caracteres (plano starter = 40 mil/mês → ~7 episódios).

## Tempo operacional medido do ep01 (meta ≤ 2h30)
- Roteiro de ações (com o motor pronto): ~20 min · narração+SFX: ~3 min · inspeção visual (46 stills a 50%): ~6 min · correções: ~25 min · render: ~60 min · auditoria: ~5 min → **≈ 2h** quando o motor já existe.
- Primeira vez (construção do motor, cenário, personagens, sistemas): várias horas — custo único, reaproveitado.

## Gargalos restantes / próximos ganhos possíveis
1. Fundo da cidade: pré-renderizar o horizonte estático em uma textura panorâmica (cubemap) e manter só fumaça/veículos 3D.
2. Em máquina com GPU: render 5–10× mais rápido (trocar `--gl=angle` por `--gl=angle-egl`/padrão e testar concorrência maior).
3. Stills de inspeção a 50% (`--scale=0.5`) custam ~3 s cada — use-os em vez de prévias completas.
