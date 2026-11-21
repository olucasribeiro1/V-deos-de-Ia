# TECH STACK, ARQUITETURA E ROTEIRO DE AÇÕES

## Versões validadas (nov/2026, Node 22.23, npm 10.9)
remotion / @remotion/cli / @remotion/renderer / @remotion/three **4.0.545** (todos iguais) · three **0.187.0** · @react-three/fiber **9.8.2** · react/react-dom **19.2.4** · zod **4.6.7** (versão exigida pelo Remotion) · typescript **5.9.3** (`verbatimModuleSyntax` + `allowImportingTsExtensions`).
**Não instalados de propósito** (custo sem benefício medido): drei, postprocessing (grão/vinheta/grade feitos em CSS, custo ~0), zustand (estado é função do frame), GSAP, Leva. Instale só se um requisito concreto exigir.

## Ambiente
- Sem GPU: WebGL por software. **`--gl=angle`** é 2× mais rápido que swangle. Chrome do Remotion pode não baixar (rede): `remotion.config.ts` usa o headless shell local (`/opt/pw-browsers/...`) se existir.
- Node `fetch` atrás de proxy precisa `NODE_USE_ENV_PROXY=1` (já nos scripts npm).
- Node importa os `.ts` do estúdio direto (type stripping); `scripts/lib/ts-register.mjs` resolve imports sem extensão. Imports só de tipo DEVEM usar `import type`.

## Estrutura do projeto-modelo
```
src/config/video.ts            1280x720@24
src/systems/animation/         math (ruído determinístico), clips (corpo), handPoses (mãos)
src/systems/camera/pov.ts      câmera POV: balanço, respiração, tremor, passos derivados do movimento, fov
src/systems/timeline/          script.ts (formato do roteiro), compile.ts (compilador + relatório de timing), keys.ts
src/components/                camera/PovRig, hands/PovHands, characters/{Humanoid,Actor}, environments/{Apartment,apartmentData,City,Door,Walls},
                               lighting, effects/{Outlines,StaticBatch,Grade}, props/Phone, ui/Subtitles
src/library/                   materials (toon+PAL), furniture, characters (PROTAGONIST travado, RAFAEL, CIVIS, 7 INFECTADOS)
src/episodes/<ep>/*.ts         SÓ DADOS (roteiro de ações); voices.ts (elenco de vozes); registry.ts (registro)
src/remotion/                  Root (composições: episódio + 1 por cena), SceneView, EpisodeComp, dev/ (fichas e testes)
public/episodes/<ep>/audio/    falas + manifest.json (duração real)    public/library/sfx/  efeitos + manifest.json
scripts/generate-voice/        generate.mjs (narração), sfx.mjs (biblioteca de efeitos)
scripts/validate-assets/       validate.mjs (timing, arquivos, identidade)
scripts/render-episode/        render.mjs (segmentado + cache + checkpoint + métricas), verify-mp4.sh
```

## Comandos
```
npm run voice -- src/episodes/ep01/episode.ts [--only s03_b02] [--dry]
npm run sfx [-- --only door_bang]
npm run validate -- ep01
npx remotion still src/remotion/index.ts ep01--s03 out/f.png --frame=120     # inspeção
npm run render -- ep01 --preview      # 640x360 rápido
npm run render -- ep01 [--scenes s03,s05] [--concurrency 2]
```

## Roteiro de ações (src/systems/timeline/script.ts)
Episódio → cenas → beats. Beat = `line` (fala opcional) + `do` (ações com `at` relativo ao início do beat). A duração do beat = máx(fala real + pad, `min`, fim das ações). Ações:
`walk {to, pace: slow|walk|brisk|run, look?, arrive?}` (rota pelo grafo NAV, aceleração, cabeça antecipa curvas, olhares laterais) ·
`look {target, dur}` (giro com overshoot + acomodação) · `glance {target, hold}` (olha e volta) · `startle {target, amp}` (susto: giro brusco + tremor + tensão) ·
`scan {from,to,dur}` (varredura militar) · `height {h}` (agachar) · `tension {v}` · `hands {r,l: pose}` · `prop {r,l: phone|bottle|can|none}` ·
`phone {screen}` · `set {state}` (portas, luzes, bolsa, suprimentos, barricada) · `sfx {id, vol, loop}` · `fov {v}` (olho mágico ~95) · `shake` ·
`actor {track}` (personagem com caminho e clips) · `fade` · `danger` (vinheta vermelha) · `title`.
Alvos de olhar: nomes do cenário (`LOOKS`), ponto `[x,y,z]` ou `{rel:true, yaw, pitch}`.
Regras de naturalidade: nunca deixe a câmera parada > 4 s sem micro-ação (olhar, respiração já é automática); mãos aparecem ao pegar/abrir/segurar; susto antes de revelar ameaça; passos e balanço são automáticos (sincronizados).

## Performance (ver benchmarks.md)
- Cena estática → `<StaticBatch>`; fundo distante → `MeshBasicMaterial` + `renderOrder` alto; contagem de luzes fixa; sem pós-processamento WebGL.
- Concorrência: 2 ≈ 4 nesta máquina (gargalo = rasterização por software). Use 4 só se houver CPU livre.
- Render por cena com cache por hash; nunca renderize o episódio inteiro de uma vez.
