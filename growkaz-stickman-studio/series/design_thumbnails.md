# Thumbnails de vídeos longos (YouTube) — checklist do canal

Só vídeo longo precisa de thumbnail (Reels/TikTok/Shorts usam o quadro do vídeo).
Exemplo pronto: `projects/thumb-temporada1/` (shots `A`, `B`, `C` em `scenes/shots/thumbs.js` + `finish.py`).

## Como fazer
1. Copiar `projects/thumb-temporada1` para `projects/thumb-<slug>`. Config: `"aspect": "16:9"`, `"resolution": "1080p"`, `"live": false`, `"fadeIn": 0`, `"fadeOut": 0`, `"bars": "none"`, estilo `urbanoRGB` (mais saturado). No shots.json: `"grunge": false, "nums": false, "hud": false, "live": false` em cada plano.
2. Um plano de 1 s por conceito (A, B, C). Desenhar com o próprio estúdio: cenário da série desfocado (`blurLayer`), `bigFace` do protagonista, efeitos da série, texto com `titulo()`/`selo()` do `thumbs.js`.
3. `node render.mjs --project projects/thumb-<slug> --stills 0.5,1.5,2.5` (a pasta `build/stills` é limpa a cada render: sempre renderizar os três juntos).
4. `python3 projects/thumb-<slug>/finish.py` (ajustar caminhos): reduz para 1280×720 PNG (< 2 MB), gera o comparativo e a prévia em 320×180 / 168×94.
5. Olhar cada uma em tamanho cheio E em 168×94. Iterar no mínimo 3 vezes.
6. Subir as 3 no "Testar e comparar" do YouTube Studio (teste A/B nativo) e deixar o YouTube escolher pelo tempo de exibição.

## Checklist (toda thumbnail precisa passar)
- [ ] **1 sujeito focal:** o protagonista (boneco branco, contorno preto, boné vermelho `#d8342b`) em close com `bigFace`, ocupando ~40–55% da altura. Olhos grandes (`eyes: 'wide'`) e boca aberta (`scream`/`oBig`): olhos pequenos (`tiny`) somem no tamanho pequeno.
- [ ] **Olhar dirigido:** os olhos apontam para o texto ou para o mistério (`look`).
- [ ] **Separação do fundo:** fundo desfocado e escurecido (`veil`), halo/glow atrás da cabeça e um anel de recorte (`ring` amarelo ou azul-claro atrás do contorno).
- [ ] **História de cor com 2–3 cores fortes:** fundo escuro + 1 cor de perigo (amarelo radioativo / verde tóxico) + vermelho de alerta. Nada de cor "de sobra" competindo.
- [ ] **No máximo 3–4 palavras GRANDES**, Fredoka 700, contorno preto grosso (~17% do tamanho) + sombra dura. Paleta do texto: amarelo `#ffd23a`, branco `#f6f3ea`, vermelho `#d8342b` (só para a palavra de alerta). A palavra-chave é a maior.
- [ ] **O texto não repete o título do vídeo:** ele completa (título = o que é; thumbnail = a emoção/pergunta).
- [ ] **Lacuna de curiosidade:** algo parcialmente escondido (olhos brilhando no escuro, garras na fresta, caixa entreaberta, sombra no alto). Mostrar o suficiente para gerar pergunta, nunca a resposta.
- [ ] **Leitura da esquerda para a direita:** texto → rosto → mistério (ou rosto → mistério). Composição em 2–3 blocos, sem amontoado.
- [ ] **Canto inferior direito livre de texto/rosto** (o YouTube cobre com a duração do vídeo: ~x > 1150, y > 620 em 1280×720).
- [ ] **Teste em 168×94:** o texto ainda se lê, o rosto e a emoção ainda se entendem, o mistério ainda aparece como um ponto de cor. Se não, aumentar e cortar elementos.
- [ ] **Marca do canal igual em todas:** selo vermelho `TEMPORADA X COMPLETA`/`EP. X` (Nunito 900, branco no vermelho, com ponto "REC") no alto, mesma fonte e mesmas cores de texto.
- [ ] **Regras da série:** só o protagonista usa vermelho na cabeça/corpo; personagens da série com o figurino fixo (`elenco-*.js`); nada de spoiler do final (ex.: não mostrar o destino do tio no Ep. 10).
- [ ] **Promessa honesta:** tudo o que está na thumbnail acontece no vídeo (sem clickbait que derruba a retenção).
- [ ] **Arquivo:** 1280×720, PNG ou JPG, < 2 MB, nome `out/thumb_<slug>_A.png` etc.

## Para a série "Sem Marca" (isekai: protagonista 2D num mundo 3D)
- O contraste 2D × 3D é o gancho: o boneco plano de boné vermelho em close, na frente de um cenário 3D bem iluminado (render 3D do estúdio desfocado por trás, `kind: '3d'` + `overlay` para o 2D e o texto).
- Cor da série: céu/magia saturados (estilo `fantasia`), mas o vermelho continua reservado ao boné e ao alerta. Se o gancho for "ele não tem marca", mostrar figurantes com `marca` brilhando ao fundo e o rosto limpo do protagonista no close (confirmar a regra no roteiro da série antes).
- Ideias de texto (3 palavras): "SEM MARCA?", "O ÚNICO SEM PODER", "ELE NÃO EXISTE".
