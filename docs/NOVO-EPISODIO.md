# Como criar um novo episódio (sem reconstruir o estúdio)

Meta: episódio de 10–12 min em ≤ 2h30, reaproveitando tudo o que já existe.

## 1. Roteiro de ações (20–40 min)
1. Copie `src/episodes/ep01/episode.ts` para `src/episodes/ep02/episode.ts` (ou use `studio-kit/.../templates/episodio-template.ts`).
2. Mude `id: 'ep02'`, o título e as cenas. Cada cena tem `beats`; cada beat tem uma fala (`line`) e ações (`do`).
3. **Estilo de fala (obrigatório):** o protagonista fala por si, em 1ª pessoa, coloquial, reagindo no momento. Personagens conversam (telefone, porta, TV). Emoção com marcações em inglês: `[sighs]`, `[whispers]`, `[gasps]`, `[nervous laugh]`…
4. Ações disponíveis: `walk`, `look`, `glance`, `startle`, `scan`, `height`, `hands`, `prop`, `phone`, `set`, `sfx`, `fov`, `lens`, `shake`, `actor`, `fade`, `danger`, `title` (veja `src/systems/timeline/script.ts`). Use `then: true` para esperar o fim de uma caminhada.
5. Pontos e alvos de olhar do cenário: `src/components/environments/apartmentData.ts` (SPOTS, LOOKS, NAV).
6. Registre o episódio em `src/episodes/registry.ts` e em `scripts/lib/episode.mjs` (EPISODE_FILES).

## 2. Áudio (3–5 min)
```bash
npm run voice -- src/episodes/ep02/episode.ts --dry   # quantos caracteres vai gastar
npm run voice -- src/episodes/ep02/episode.ts         # gera + verifica pronúncia
npm run sfx                                           # se adicionou efeitos novos em scripts/generate-voice/sfx.mjs
```
Falas marcadas `✗ REVISAR`: ouça, ajuste a grafia e rode `--only <id>` (gera só aquela fala).

## 3. Validação e inspeção (10 min)
```bash
npm run validate -- ep02
npx remotion still src/remotion/index.ts ep02--s03 out/f.png --frame=240 --scale=0.5
```
Abra os PNGs. Confira: nada atravessando nada, mãos visíveis nas interações, boné vermelho, cena legível.

## 4. Render (≈ 6 min de render por minuto de vídeo nesta máquina sem GPU)
```bash
npm run render -- ep02
```
Se uma cena precisar de ajuste, corrija e rode de novo: **só as cenas alteradas são renderizadas**.
O MP4 só é aceito se passar em `scripts/render-episode/verify-mp4.sh` (720p, 24 fps, H.264, AAC, duração).

## Personagens e cenários novos
- Personagem: novo `CharacterSpec` em `src/library/characters.ts` (o protagonista é travado: pele clara + boné vermelho).
- Cenário novo: componente em `src/components/environments/` + arquivo de dados (SPOTS/NAV/LOOKS) no padrão de `apartmentData.ts`; partes fixas dentro de `<StaticBatch>`.
