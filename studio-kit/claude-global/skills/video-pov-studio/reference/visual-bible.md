# VISUAL BIBLE — Cartoon Toon 3D ("stick viral 3D")

## Identidade
- Personagens cartoon 3D: cabeça grande e redonda (~1/4,5 da altura), olhos grandes (esclera branca + pupila + brilho), sobrancelhas expressivas, nariz e orelhas simples, bochechas rosadas, membros em tubo, mãos arredondadas com dedos em cápsula.
- Volume, sombra e perspectiva REAIS — nunca sprites ou planos 2D no cenário.
- Cel shading (MeshToonMaterial, rampa de 3 tons: 90/175/255) + **contorno preto** por casca invertida (≈1,2 cm cenário, 0,9 cm personagens, 0,28 cm mãos POV).
- Cenários 3D low poly com formas limpas; cores limpas levemente saturadas; profundidade por luz e composição.
- Legendas grandes, fonte pesada, cor por personagem (narrador amarelo, Rafael ciano, vizinho rosa), contorno escuro grosso.
- Referência do usuário: estilo de animações virais de POV em 3D cartoon (não precisa ser igual; não copiar).

## Paleta (src/library/materials.ts → PAL)
- Interiores: paredes creme/cinza claro (#d9d2c4, #c3cbc8), madeira quente (#8a6446), tecidos verdes/azuis limpos.
- Exterior/cidade: azul-acinzentado, janelas âmbar, fumaça grafite.
- Perigo: vermelho pontual (#c81e22) — sangue em respingos irregulares, nunca círculos perfeitos.
- Evolução por narrativa: calmo (quente, lâmpadas) → colapso (apagão, frio, fumaça) → ameaça (vinheta vermelha `danger`).

## Iluminação (econômica, contagem de luzes FIXA)
- 1 direcional com sombra (sol pela janela, mapa 1024) + hemisférica + 2 pontuais sem sombra (luminárias).
- Presets: `day`, `dusk`, `night`, `blackout` (src/components/lighting/Lighting.tsx). Varie só intensidades (mudar a quantidade de luzes recompila shaders).
- Não deixe escuro demais: o espectador precisa ver.

## Orçamento
- Objetos 100–1.000 tris; móveis 500–5.000; personagens ~3–6k (procedurais); texturas 512–1024 (canvas gerado ou atlas).
- Tudo estático do cenário passa por `<StaticBatch>` (1 draw call por material).
- Cidade/fundo distante: materiais pré-iluminados (MeshBasic) + `renderOrder` alto (desenha depois do interior).

## Colisões e sobreposição (obrigatório)
- Nenhum objeto entra em parede/outro objeto (folga ≥ 1 cm). Ao posicionar móvel, calcule a caixa: centro ± metade da largura/profundidade e confira paredes (espessura 12 cm → face interna a 6 cm do eixo).
- Câmera só anda pelo grafo de navegação do cenário (`NAV` em apartmentData.ts), que desvia dos móveis; mínimo 30 cm de paredes.
- Mãos: o objeto segurado fica à frente da palma; dedos atrás do objeto (celular), nunca atravessando a tela.
- Personagem batendo em porta: fique a ≥ 95 cm (braço + inclinação alcançam ~60 cm). Depois da barricada, nenhuma ação pode levar a câmera ao olho mágico (atravessaria o móvel).
- Teste de isolamento: `--props '{"bench":{"noActors":true}}'` / `noHands` / `noApt` / `noCity` mostram o que está atravessando o quê.
- Erros já encontrados e corrigidos: infectado atravessando a porta fechada, barricada fora do quadro, dedos do infectado na porta, fumaça preta flutuando, estante dentro da parede, rack sobre a estante, porta do quarto atrás do sofá, dedos na frente da tela do celular.
