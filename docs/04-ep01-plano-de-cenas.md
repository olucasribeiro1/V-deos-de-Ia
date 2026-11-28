# EP01 "O Salto" — plano de cenas (edição rápida)

- Narração: `episodios/ep01/narracao.mp3` (voz Paulo Rovéglia), 100,7 s. Duração do episódio: **102,0 s**.
- Tempo por palavra: `video-engine/src/ep01/timing.json` (linhas L1–L22, cada palavra com start/end em segundos).
- **Ritmo:** corte a cada **0,9–1,6 s** (média ~1,2 s), sempre no início de uma palavra. Toda cena tem câmera em movimento (push-in rápido, whip-pan, zoom de impacto, shake no impacto). Nada de plano parado > 1,6 s. Alternar escala (geral → detalhe → close) a cada corte.
- Legendas: globais, geradas automaticamente das palavras (`src/ep01/captions.ts`), alternam topo (y≈20%) / base (y≈76%). As cenas devem deixar essas faixas legíveis (sem HUD em cima delas).
- HUD: `src/ui/HudLabel.tsx` (rótulo pequeno + número grande + unidade + linha-guia).

## Parte A — 0 a 34,76 s (L1–L8)
| Linha | Ideias de cena (1 a 4 cortes por linha) |
|---|---|
| L1 "E se tu pudesse se teletransportar…" | calçadão, push-in rápido no Davi → close piscando → ele some com o Rastro em "já viu" |
| L2 "E tivesse gente paga pra te caçar…" | câmera baixa: porta de carro preto abre, 3 ternos saem → reflexo do Davi nos óculos do Rocha |
| L3 "Pro Davi, o primeiro salto… ponte… Piscou, tava na cama." | etiqueta HUD "DAVI · 19" → vista de cima: Davi de 15 anos caindo da ponte, rio lá embaixo → close do olho piscando (rastro azul) → quarto, ele sentado na cama, assustado |
| L4 "O segundo foi de propósito… lata… do Rio pro Japão." | celular na mão com vídeo de rua de Tóquio → mão segurando lata vermelha genérica → Rastro |
| L5 "Ele chegou parado. A lata, não. Atravessou a parede" | rua de Tóquio (neons genéricos, sem marcas reais) Davi aparece parado → lata dispara em câmera lenta, HUD "LATA 2.900 km/h" → buraco na parede com poeira |
| L6 "no Rio o chão gira a 1.540 por hora pro leste" | globo estilizado girando, pino no Rio, seta pro leste, HUD "RIO 1.540 km/h" |
| L7 "Tóquio gira a 1.360… direção contrária" | globo gira até Tóquio, seta oposta, HUD "TÓQUIO 1.360 km/h" |
| L8 "Diferença: 2.900… O salto acerta a velocidade do corpo dele. Do resto, não." | setas se somam numa grande vermelha "Δ 2.900 km/h" → Davi olhando a mão vazia → diagrama: corpo ✓ verde / lata ✗ vermelha |

## Parte B — 34,76 a 72,55 s (L9–L16)
| Linha | Ideias |
|---|---|
| L9 "buraco do tamanho dele no ar. 70 litros de vácuo" | silhueta tracejada do Davi, moléculas correndo pro centro, HUD "VÁCUO 70 L" |
| L10 "O ar fecha… estala. 140 dB. Um tiro do lado do ouvido." | ondas de choque + pombos → vidro de janela tremendo → close de orelha com ondas sonoras, HUD "ESTALO 140 dB" |
| L11 "Foi o estalo que entregou… a Linha, espalhou microfone" | Rocha no escuro (HUD "ROCHA · A LINHA") → microfones em postes, 3 cortes rápidos de postes diferentes |
| L12 "Três microfones… diferença de tempo… Dois segundos depois, eles sabem." | mapa de cima, 3 anéis se cruzam no pino vermelho, HUD "Δt 0,004 s" → cronômetro "2 s" → Rocha olha o tablet |
| L13 "não usa arma. Usa luva… o que o Davi segura, ele não protege." | arma riscada → close das luvas pretas sendo calçadas → dossiê com foto do Davi e da lata, carimbo "CONFIDENCIAL" |
| L14 "Sexta-feira, Copacabana. açaí. Um cara de terno segura o pulso dele." | HUD "SEXTA · 17:40" quiosque → Davi pegando o açaí → close: luva fecha no pulso amarelo |
| L15 "Se o Davi pular pra longe, o cara chega a 2.000 por hora. Vira parede. E o Davi não mata ninguém." | close do Rocha sorrindo → "imaginação" (tom cinza): silhueta do Rocha batendo num muro, HUD "ROCHA 2.000 km/h" → Davi franzindo |
| L16 "Empate. O cara sorri. Mais três chegando." | plano dos dois parados → close sorriso → câmera alta: 3 ternos atravessando o calçadão |

## Parte C — 72,55 a 102,03 s (L17–L22)
| Linha | Ideias |
|---|---|
| L17 "Só que o Davi fez a conta… distância do equador e o lado do planeta." | close do olho do Davi com contas surgindo → globo: equador acende → meridiano acende |
| L18 "O Rio tá 23° pro sul. 23 pro norte, na mesma linha, o chão gira igualzinho." | pino no Rio 23° S → ponto espelhado 23° N no mesmo meridiano → duas setas idênticas, HUD "23° S = 23° N" |
| L19 "Lá é o meio do Atlântico. E mar é tudo igual. Ele já tinha visto." | zoom do globo no ponto no meio do oceano → Davi olhando o mar de Copacabana, meio sorriso |
| L20 "Estalo. Os dois caem na água… 2.000 km da terra. O cara solta o pulso pra nadar." | flash Rastro → oceano aberto, splash → drone se afasta, HUD "TERRA 1.900 km" → mão da luva soltando o pulso |
| L21 "O Davi volta pro açaí. Antes, joga uma boia e liga pra Marinha." | Davi no quiosque com o açaí → boia laranja caindo perto do Rocha → celular "MARINHA" chamando |
| L22 "Segue aí pra ver o que a Linha faz…" | close: Davi girando a lata na mão, sorriso de canto, Rastro → corte seco pro preto no fim |
