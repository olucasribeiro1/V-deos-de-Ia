# Produtor 1 — Arranjo, groove e estrutura · "Quem Fez? Foi Deus!" (v6)

Escopo: só arranjo/groove/estrutura para ElevenLabs `music_v1` (composition_plan). A letra não muda: as linhas vêm de `lyrics/01-quem-fez-foi-deus.md`, com o "(E EU!)" da amostra aprovada no refrão.
Referência sonora: `music/01-quem-fez-foi-deus/amostras7/amostra.json` (aprovada). Nenhuma API foi chamada.

---

## 1. Por que a v5 ficou sem impacto (5 linhas)

1. **A v5 trocou o vocabulário da amostra aprovada.** "energetic, bouncy, punchy pop kick, light brass stabs, thick" virou "gentle, relaxed, soft, tender, harmonious". O modelo obedeceu e entregou uma música morna.
2. **O negativo "fast tempo / rushed" somou com "relaxed bounce, not rushed".** Isso puxou tudo para baixo, quando o pedido "um pouco menos rápido" já estava resolvido pelo BPM.
3. **Os globais viraram um texto de direção vocal** ("real breaths, expressive in every phrase, never robotic"). Com tantas regras, o canto fica cauteloso e sem sorriso. Não havia nenhum gancho instrumental com identidade.
4. **As durações estavam apertadas**: refrão de 6 linhas em 18 s, pré-refrão em 9 s, intro falada em 8 s. Sem espaço, a cantora corre e engole palavras e a banda não tem tempo de respirar nem de fazer viradas.
5. **Todas as seções tinham a mesma energia** (3 refrãos idênticos, nenhum break, nenhuma pausa da banda antes do refrão, nenhuma volta do gancho). Sem contraste, nada "bate", e o refrão nunca soa como a amostra, que começava direto no hook.

---

## 2. Decisões de base

| Parâmetro | Valor | Motivo |
|---|---|---|
| BPM | **108** | Fica dentro da faixa 108–112 e atende o "um pouco menos rápido" sem trocar a energia (mantemos "energetic"). |
| Compasso | 4/4, baião-pop (zabumba + triângulo + kick pop) | É o groove da amostra aprovada. |
| Tom | **Ré maior**, refrão final em **Mi maior** (+1 tom) | Mesmo tom da amostra; a subida de tom marca o clímax. |
| 1 compasso | ≈ 2,22 s | Base de todas as durações. |
| Regra de duração | verso longo = 2 compassos (~4,5 s); linha de refrão com eco = ~2 compassos; +1 compasso de respiro/virada por seção | Evita que a cantora engula ou pule versos. |
| Gancho-assinatura | riff de **acordeão + flauta** (4 compassos), dobrado pelo glockenspiel | Volta na intro, depois de cada refrão e no final. É a "cara" da música. |

---

## 3. Global styles definitivos

**positive_global_styles** (6 itens, quase literais da amostra aprovada; o que muda é BPM, gancho e fofura):
```json
[
  "Brazilian children's music, modern MPB kids style, bouncy baião-pop groove, joyful, cute, catchy, energetic",
  "108 BPM, D major, steady danceable bounce",
  "sweet, cute, smiling native Brazilian Portuguese young-adult female lead singer, natural and human, playful and charming, clear diction",
  "small kids choir shouting the answers in parentheses loud and clear, warm female backing vocals",
  "full thick band: accordion riffs, zabumba and triangle, punchy pop kick and snare, handclaps, ukulele and nylon guitar strums, driving bass, flute and glockenspiel, pizzicato strings, light brass stabs, tambourine",
  "signature accordion and flute hook returning between sections, wide warm professional kids album mix, vocal upfront"
]
```

**negative_global_styles**:
```json
["slow", "sleepy", "lullaby", "spoken word", "narration", "a cappella", "robotic vocal", "autotune", "thin arrangement", "EDM", "shouting lead vocal", "European Portuguese accent", "male lead vocal"]
```
Removidos de propósito: "fast tempo" e "rushed", porque o BPM já controla a velocidade e esses negativos deixaram a v5 mole.

---

## 4. Estrutura de seções (duração em ms + 1–2 local styles)

Os `lines` de cada seção são exatamente os da letra. Os negativos locais ficam vazios, salvo onde está indicado.

| # | Seção | Linhas | duration_ms | positive_local_styles |
|---|---|---|---|---|
| 1 | **Intro** | 2 (intro da letra) | **13000** | "2-bar accordion and flute signature hook with full band from the first beat, then lead sings the lines over the groove" · "handclaps on 2 and 4, kids shout 'ê!'-style excitement" |
| 2 | **Verse 1** | 4 | **19000** | "storytelling verse, lighter groove with zabumba, triangle and ukulele, bass bouncing" · "glockenspiel sparkle on 'Haja luz', handclap on each number" |
| 3 | **Pre-Chorus 1** | 2 | **11000** | "building energy, snare roll and rising strings" · "one-beat band stop right before the chorus" |
| 4 | **Chorus 1** | 6 | **22000** | "explosive full band like the approved sample, claps on every beat, brass stabs" · "kids choir answers loud and clear, big 'E EU!'" |
| 5 | **Verse 2** | 6 | **27000** | "playful verse, groove keeps moving, pizzicato strings answer the singer" · "twinkly glockenspiel on the star lines" |
| 6 | **Pre-Chorus 2** | 2 | **11000** | "building energy, snare roll and rising strings" · "one-beat band stop right before the chorus" |
| 7 | **Chorus 2** | 6 | **22000** | "explosive full band, claps, brass stabs, tambourine" · "signature accordion and flute hook right after the last line" |
| 8 | **Verse 3** | 6 | **27000** | "cheeky fun verse, accordion licks between animal names, bass slides" · "band drops to soft heartbeat kick on 'bateu o coração'" |
| 9 | **Pre-Chorus Especial** | 2 | **12000** | "biggest build yet, choir joins on 'muito bom', stomps and claps" · "full band stop on 'que linda criação', then drum fill" |
| 10 | **Chorus 3** | 6 | **22000** | "explosive full band, kids choir even bigger, claps on every beat" · "short drum fill out into the breakdown" |
| 11 | **Bridge (dia 7)** | 4 | **21000** | "breakdown: drums out, finger snaps, nylon guitar and music-box glockenspiel, still in tempo, sung softly and sweetly" · "soft backing 'ooh' harmonies" — *negative_local:* `["full drums", "spoken word"]` |
| 12 | **Recap ("Acorda!")** | 4 | **20000** | "drums crash back in, groove returns full, lead sings each number happily one by one" · "handclap accent on each number" — *negative_local:* `["choir echoing every word", "rushed"]` |
| 13 | **Final Chorus** (2x) | 12 | **44000** | "key change up a whole step to E major, biggest and happiest moment, full band, brass and claps" · "kids choir shouting every answer, big 'E EU!', signature hook between the two passes" |
| 14 | **Outro** | 2 | **12000** | "band softens to ukulele, glockenspiel and soft shaker, warm and close, sung not spoken" · "kids choir sweet final 'Foi Deus!', last ring of the signature hook on glockenspiel" |

**Total: 283000 ms ≈ 4:43.** Fica abaixo do limite de 5 min do music_v1.

### Notas de produção
- **Contraste é a fonte do impacto.** Os versos são mais leves (zabumba, triângulo, ukulele), o pré-refrão sobe e fecha com uma parada da banda, e o refrão volta com a banda inteira. Esse ciclo de "segura e solta" foi o que faltou na v5.
- **Fofura vem do timbre, não de regra.** Glockenspiel, pizzicato, palmas e o coro gritando "E EU!" fazem esse trabalho. Não escrever "cute voice" em cada seção.
- **Recap da contagem:** a lead canta sozinha, no tempo, 2 compassos por linha, sem coro ecoando os números (lição e). Só palmas marcam cada número.
- **Ponte:** a bateria sai, mas o tempo continua (estalos de dedo). Assim ela não vira narração nem canção de ninar.
- **Duração vs. alvo de 3:15–3:40:** a letra inteira a 108 BPM não cabe em 3:40 sem apertar, e foi esse aperto que estragou a v5. Se o canal exigir ≤ 4:00, o corte que mais funciona é **remover o Pre-Chorus 2 e o Chorus 2**: Verse 2 emenda no Verse 3 por uma volta do gancho (+4000 ms), o total fica em ≈ 4:14 e a letra das seções restantes não muda. Para chegar perto de 4:00, dá para fazer também o Final Chorus com 1,5 passada (repetir só as 4 primeiras linhas; 44000 → 33000), chegando a ≈ 4:03. Essa decisão é da roteirista/cliente.
- **Teste barato antes da faixa inteira:** gere só Intro + Verse 1 + Pre-Chorus 1 + Chorus 1 (~65 s) com estes globais e compare com a amostra aprovada antes de gastar créditos na música completa.
