# EP07: "Sem Marca" (roteiro para aprovação)

**Origem:** remake do **Sem Marca – Ep1 – O Vazio** (projeto `growkaz-stickman-studio/projects/sem-marca-v2`, branch `claude/animated-2d-videos-setup-nphd1h`), refeito no padrão Davi: Remotion, flat 2.5D, 1080×1920, 30 fps, legenda em caixa alta palavra a palavra com palavra-chave em amarelo, HUD com números e câmera sempre em movimento.

**Premissa:** o Davi morre salvando um gato e acorda num mundo de fantasia onde todo mundo nasce com uma marca no rosto que diz a classe e o elemento. O rosto dele é liso: ele é o único **sem marca**.

## Decisões (aprovadas no chat)
- **Narração reaproveitada inteira, sem gastar crédito.** Os 22 clipes aprovados da v2 foram montados na linha do tempo original → `narracao.mp3` (2:14,6) + `timing.json` (456 palavras com tempo). O "porra" leva bipe, e a legenda mostra "P*RRA!".
- **Duração:** 2:12 de narração + ~6 s de cards finais ≈ **2:18**. Passa do limite de 2:00 por escolha do usuário.
- A narração é toda em **"você"**, e o "você" na tela é sempre o **Davi** (design fixo, sem mudança). O nome dele não é falado.
- **Vozes:** o narrador e o diretor são as vozes originais do Sem Marca (não o Will). Nenhuma fala nova.
- **Abertura:** sem a fala nem o card "a pedido de um seguidor", porque esse poder não foi pedido.
- **Encerramento:** a fala original "Segue a página pra ver o episódio dois!" fica. Depois dela entram **só os cards** do encerramento padrão, sem voz e com a trilha por baixo: "💬 COMENTA UM PODER ALEATÓRIO", "♥ O MAIS CURTIDO VIRA O PRÓXIMO VÍDEO", "📊 ENQUETE: QUER VÍDEO LONGO? ESCREVE 'LONGO'", "▶ YOUTUBE · LINK NA BIO", "@Odavi_contos".
- **Som:** só a biblioteca `assets/sfx/` (ep01–ep06) e uma trilha que já existe. Nenhum efeito ou música nova.

## Personagens
- **Davi** (fixo): o "você". Moletom mostarda, jeans, tênis laranja. No outro mundo ele continua de moletom, e o contraste com a fantasia é a piada visual.
- **O Gato** (novo, simples): laranja, rajado, com olhar de quem sabe demais. Aparece no começo e no final.
- **Magos dos elementos** (figurantes de silhueta, um por cor): cada um com a marca da sua cor no rosto.
- **Garoto do cristal** (figurante): 1 linha vermelha no rosto, metido.
- **Diretor da Academia** (novo): velho, barba longa, cajado, marca dourada apagada (ou cicatriz no lugar). Voz própria (a do clipe d1).
- **Guardas, criança, plateia de alunos** (figurantes).

## HUD fixo
- **TELA DE STATUS estilo videogame:** NÍVEL 0 · FORÇA 10 · VELOCIDADE 8 · INTELIGÊNCIA 12 · **MAGIA 0 🔒**. Aparece no n06, volta no lago com "MARCA: —" e no cristal com "MAGIA 0" piscando vermelho.
- **MARCA:** contador de linhas (1/2/3) e paleta das 6 cores, preenchidos ao longo da explicação.
- **Números da física:** triângulo do fogo, ponto de orvalho, pressão em hPa, 30.000 °C × 6.000 °C do Sol.

## Narração + imagem

| # | Tempo | Narração | Imagem / câmera | HUD / som |
|---|---|---|---|---|
| 1 | 0:00 | Você morreu salvando um gato. Sério. | **Abre na ação:** close do Davi no chão do asfalto com uma auréola de desenho girando; zoom out e o gato sentado em cima dele, lambendo a pata | "☠ CAUSA: GATO" · record-scratch |
| 2 | 0:02 | O bichano tava parado no meio da avenida, o caminhão vinha voando, e você nem pensou: pulou, empurrou o gato pra calçada... | Flashback acelerado: avenida, o gato parado na faixa; o farol do caminhão crescendo na tela; o Davi pula em câmera lenta e empurra o gato | "CAMINHÃO: 80 km/h" · whoosh-corte |
| 3 | 0:07 | O gato saiu ileso. Você... virou estatística. | O gato pousa de pé na calçada, intacto; corte seco pra um gráfico de pizza com o bonequinho do Davi entrando numa fatia | "GATO: 100% ✓" · trombone-triste |
| 4 | 0:11 | Aí você abre o olho. Céu azul, duas luas lá em cima... e um dragão do tamanho de um prédio passa raspando na sua cabeça. | POV abrindo o olho (pálpebras); campo verde, céu com duas luas; a sombra de um dragão cobre a tela e ele passa rente, o cabelo do Davi voa | "LUAS: 2" · vento-queda |
| 5 | 0:16 | Eita, P*RRA! | Davi de cara no chão, cabelo arrepiado, olhos esbugalhados (gag de susto) | bipe · faceplant |
| 6 | 0:18 | É, parceiro. Você foi parar em outro mundo. E na sua frente aparece uma tela, igual de videogame: | O Davi se levanta e uma janela azul brilhante se abre na frente dele, com ele cutucando a tela | synth-ding |
| 7 | 0:23 | Nível zero. Força dez, velocidade oito, inteligência doze. Matou monstro, tudo sobe. Menos uma coisa: a magia. Essa tá travada no zero. | **Tela de status em tela cheia**, os números sobem um por um; mini-gag: o Davi soca um slime e as barras sobem; MAGIA fica em 0 com um cadeado tremendo | STATUS · hud-blip, synth-tique, synth-biip-erro |
| 8 | 0:30 | Esse mundo se chama Aldoria e tem quatro nações. No norte, os elfos: arco e cura. Nas montanhas, os anões, os melhores ferreiros que existem. No centro, o reino humano, governado pelo Rei Mago. E no sul, de onde ninguém volta... o Rei Demônio. | **Mapa de Aldoria** (pergaminho flat) com a câmera voando por cima; cada nação acende com um ícone: elfo com arco, anão martelando bigorna, castelo com o Rei Mago, sul em vermelho escuro com olhos brilhando na névoa | "NORTE / MONTANHAS / CENTRO / SUL ☠" · rumble no "Rei Demônio" |
| 9 | 0:42 | E aqui todo mundo nasce com uma marca no rosto. Uma linha? Elite. Duas? Soldado, ferreiro. Três? Trabalho pesado, e ninguém nem olha na sua cara. | Três rostos em fila, cada um com 1, 2 e 3 linhas; o de 1 linha de capa, o de 2 de armadura, o de 3 carregando saco; no "ninguém olha", o de 1 linha vira a cara | Contador "MARCAS: 1 · 2 · 3" · carimbo |
| 10 | 0:49 | E a cor é o elemento. E repara: não é truque, é física. | Paleta de 6 cores girando em volta do Davi; o "TRUQUE" é riscado e "FÍSICA" carimbado por cima | carimbo |
| 11 | 0:53 | Vermelha, fogo. O mago junta calor, combustível e oxigênio, o tal triângulo do fogo, e solta tudo num jato. | Mago de marca vermelha; o triângulo do fogo desenhado no ar (CALOR · COMBUSTÍVEL · O₂) fecha e vira um jato de fogo | "TRIÂNGULO DO FOGO" |
| 12 | 0:59 | Azul, água. O ar tá cheio de vapor invisível. Ele esfria o ar em volta da mão, o vapor condensa e vira água, igual copo gelado suando. | Moléculas de vapor (AirMolecules) desacelerando em volta da mão e virando gotas; inset de um copo gelado suando | "VAPOR → ÁGUA" · "PONTO DE ORVALHO" |
| 13 | 1:05 | Marrom, terra. Ele faz o chão vibrar, os grãos se apertam, e a terra sobe dura feito pedra. | Corte de solo estilo livro: grãos soltos vibram, se compactam e um pilar de pedra sobe | synth-vibra-grave, muro-crunch |
| 14 | 1:10 | Branca, vento. Vento é só ar correndo da pressão alta pra pressão baixa. Ele cria essa diferença, e o ar sai empurrando até navio. | Duas zonas "ALTA" e "BAIXA" com setas; o mago abre a mão e um veleiro dispara no lago | "1020 hPa → 990 hPa" · swish |
| 15 | 1:16 | Amarela, raio. Ele separa cargas elétricas, igual nuvem de tempestade, e a descarga chega a uns trinta mil graus. Cinco vezes mais quente que a superfície do Sol. | Cargas + e − separando no corpo do mago; o raio cai; termômetro subindo e comparativo com o Sol | "30.000 °C" vs "☀ 6.000 °C" · "×5" · estalo-trovao |
| 16 | 1:24 | E a dourada, a mais rara de todas, ninguém sabe explicar. Só o próprio Rei Mago tem. | Brilho dourado no escuro; a câmera sobe até o Rei Mago no trono com a marca dourada pulsando; o "?" do HUD gira | "DOURADA: ???" · estrelinhas |
| 17 | 1:30 | Aí você corre até um lago, se olha na água... e nada. Rosto liso. Nenhuma marca. Ferrou. Na cidade, todo mundo te encara: criança aponta, guarda já põe a mão na lança. | O Davi corre e se debruça no lago; reflexo em close com o rosto liso; "Ferrou" com zoom dramático no rosto; corte pra cidade medieval: criança apontando, guarda apertando a lança | STATUS volta: "MARCA: —" · splash, synth-flatline |
| 18 | 1:39 | Te levam pra Academia Real, pro Teste do Cristal. O garoto antes de você encosta, e o cristal pega fogo. Sua vez. Você encosta... e nada. Nem uma faísca. A sala inteira cai na gargalhada. | Salão da Academia com um cristal no pedestal; o garoto de marca vermelha encosta e o cristal acende em chamas; o Davi encosta, silêncio, um grilo; plateia de alunos rachando de rir | "MAGIA 0" piscando vermelho · synth-grilo, risadas-turma |
| 19 | 1:48 | Até que o diretor bate o cajado no chão, e todo mundo cala a boca. Ele chega perto e fala baixinho, só pra você: | O cajado bate e sai uma onda de choque (Shockwave); risadas cortadas; o diretor caminha até o Davi, a câmera fecha nos dois | tensao-hit · silêncio |
| 20 | 1:54 | (DIRETOR) O último sem marca foi o meu irmão. Exilaram ele pro sul, pras terras do Rei Demônio. Ele nunca mais voltou. | Close do diretor sussurrando; flash em sépia de um jovem sem marca sendo levado pro sul do mapa; volta no olho do Davi | "EXILADO: SUL ☠" · musica-bed-tensa |
| 21 | 2:01 | E aí você escuta um miado. Em cima da estante, te encarando... o mesmo gato que você salvou. | Miado; a câmera sobe pela estante de livros e para no gato do começo, olhos brilhando; o gato pisca devagar | gato-miau · riser |
| 22 | 2:10 | Segue a página pra ver o episódio dois! | O gato sorri; o Davi aponta pra ele, chocado; card "EPISÓDIO 2?" | — |
| — | 2:13 | *(sem voz, trilha por baixo)* | Cards do encerramento padrão (modelo `video-engine/src/ep04/extras/Extras.tsx`) | — |

## Física (checada)
- **Triângulo do fogo:** a combustão precisa de calor, combustível e oxigênio. Tirando um, o fogo apaga.
- **Condensação:** o ar abaixo do ponto de orvalho não segura o vapor, que vira líquido (o copo gelado "suando").
- **Compactação por vibração:** vibrar o solo rearranja os grãos e reduz os vazios (é o que fazem os rolos compactadores). "Duro feito pedra" é a licença poética.
- **Vento:** o ar flui da alta pra baixa pressão. Diferenças de ~30 hPa já dão ventos fortes.
- **Raio:** o canal chega a ~30.000 °C. A superfície do Sol tem ~5.500–6.000 °C, ou seja, ~5×.

## Arquivos
- `episodios/ep07-sem-marca/narracao.mp3`: montagem dos clipes aprovados (com bipe, −16 LUFS)
- `episodios/ep07-sem-marca/timing.json`: falas e palavras com tempo (para legenda e cortes)
- `episodios/ep07-sem-marca/narracao.txt`
- Vídeo: `video-engine/src/ep07/` (partes A/B/C) · mixagem: `assets/sfx/ep07/`
