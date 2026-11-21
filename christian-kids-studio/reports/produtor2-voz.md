# Direção vocal — "Quem Fez? Foi Deus!" (produtor 2: voz)

Base: amostra aprovada `amostras7/amostra.json` (voz + coro "E EU!") × versão rejeitada `v5/composition_plan.json`.
Nenhuma API foi chamada; isto é direção para o próximo `composition_plan`.

## 0. Diagnóstico rápido: por que a v5 perdeu a fofura

1. **A v5 mudou a cantora que tinha sido aprovada.** Na amostra ela era *"sweet, cute and cheerful … very human and natural, smiling, clear articulation, never shouting"* a **112 BPM, bouncy, energetic**. Na v5 virou *"sweet, cute, tender … expressive in every phrase"* a **108 BPM, relaxed bounce, not rushed**. "Tender" + "relaxed" + "not rushed" puxam para uma voz contida e plana, que é o oposto de fofa. **Mantenha a frase da cantora da amostra quase igual e só acrescente o que falta** (veja a seção 1).
2. **Adjetivos abstratos demais** ("expressive in every phrase", "real breaths", "never robotic"). O modelo responde melhor a **comportamentos concretos de gravação**: *close-mic, breathy phrase starts, little smile on vowels, light vibrato only on long notes, soft-loud contrast between verse and chorus*.
3. **Linhas compridas demais para o tempo da seção.** O Verso 2 tem 6 linhas de 14–17 sílabas em 27 s. A cantora se apressa e engole palavras: foi assim que "Quatro" e "no mar, a" sumiram. Regra prática: **cerca de 4,5 s por linha longa a ~110 BPM** (2 compassos). Se não couber, aumente o `duration_ms` em vez de pedir "pausa".
4. **Sinais de fala dentro das `lines`.** Dois-pontos (`Um dedinho:`), aspas (`"Isso é bom!"`) e onomatopeias são lidos como diálogo, e aí a música vira narração. Nas `lines`, troque **":" por ","** e **tire as aspas** (elas ficam só na letra publicada e na legenda).
5. **Pedir "pausa", "spoken" ou "whisper" leva à narração** (já foi comprovado). Para respirar, use **quebra de linha** (uma frase por linha) e o descritor *"breathes between phrases"*. Nunca peça "pause".

---

## 1. Descritores de voz (EN): colar em `positive_global_styles`

### Cantora principal (substitui o item 3 da v5)
```
sweet, cute and cheerful native Brazilian Portuguese young-adult female lead singer, very human and natural, smiling, clear articulation, never shouting
```
```
close-mic intimate pop vocal like a warm kids' TV host who sings, audible smile on the vowels, soft breathy phrase starts, small natural breaths between lines, tiny pitch and timing variations, light vibrato only on long held notes, playful bounce on short words
```
```
crisp Brazilian Portuguese diction: every syllable sung, consonants clear (L, R, D, T), nasal vowels (ão, em, um) fully sung, words never swallowed or merged
```
> A 1ª linha é **exatamente** a da amostra aprovada, não mexa nela. As outras duas acrescentam humanidade e dicção.

### Back vocals + coro infantil (substitui o item 4 da v5)
```
two warm female backing singers with soft airy harmonies, sung under the lead, never louder than the lead
```
```
small kids choir of 6-8 real children, slightly uneven and joyful, answering every line in parentheses loud and clear, in tune, cheerful not screaming
```

### Negativos (somar aos da v5)
```
monotone, flat delivery, deadpan, over-enunciated, baby voice, childish cartoon voice, nasal, vocal fry, operatic, belting, breathy whisper, Spanish accent, mumbled words, rushed lyrics, sound effects sung by the vocalist
```
> **Tirar** "fast tempo" e "rushed" dos negativos de estilo e voltar a **112 BPM, bouncy** (o que foi aprovado). A pressa vem de excesso de sílabas, não do BPM.

---

## 2. Direção emocional por seção (EN, 1 linha cada, em `positive_local_styles`)

| Seção | Direção (colar) |
|---|---|
| Intro | `bright inviting pickup, singer smiling as if greeting kids on a rug, medium-soft` |
| Verse 1 | `curious storytelling, soft and slightly mysterious on 'escuro', bright joyful lift on the light line, warm number emphasis` |
| Pre-Chorus 1 | `tender admiring build, growing a little louder each line, smile widening` |
| Chorus 1 | `full joyful energy, bouncy and catchy, lead asks the questions, kids choir answers loud and happy` |
| Verse 2 | `playful amazement, lighter and bouncier, sparkly on the stars lines, softer and tender on 'uma por uma'` |
| Pre-Chorus 2 | `tender admiring build, a bit more confident than the first time` |
| Chorus 2 | `same joyful chorus, slightly fuller, extra claps, kids choir more excited` |
| Verse 3 | `cheeky and fun on the animal names, each animal sung with a little grin, then warm heartfelt slow-down on the last two lines` |
| Pre-Chorus 3 | `proud and heartfelt build, biggest lift so far, backing vocals answer 'muito bom'` |
| Chorus 3 | `joyful chorus, strong and bright, still sweet` |
| Bridge (dia 7) | `soft half-voice singing, hushed but on pitch and in rhythm, cozy and safe, gentle smile, sung not spoken` |
| Final Chorus | `happiest fullest moment, key change up a whole step, lead shines with light ad-libs, kids choir at full joy, still never shouting` |
| Outro | `close and tender, softer sung lines, warm smile, last 'Foi Deus!' answered by the kids, gentle final chord` |

> Ponte: **não** use "whisper", "lullaby" nem "spoken" (já estão nos negativos e causam narração). "Soft half-voice … on pitch" dá o clima de ninar sem perder o canto.
> Se a ponte com contagem "Acorda, acorda! Um: a luz!…" voltar, ela tem que ser **seção separada**, com `energetic sung countdown, each number sung on a beat, kids choir echoes each number`, e cada número numa linha curta (veja o item 3).

---

## 3. Palavras de risco e correção mínima

Legenda: **[L]** = só muda nas `lines` do plano (a letra publicada e a legenda continuam como estão). **[R]** = reescrita real da letra.

| # | Risco (o que já saiu / o que pode sair) | Causa provável | Correção mínima |
|---|---|---|---|
| 1 | **"Haja luz" → "Raja a luz"** | O "H" escrito vira aspiração [h], que no português do Brasil soa como "R" inicial. "e a luz" logo depois funde. *Não sai errado sempre:* a versão de QC anterior acertou, então o erro é aleatório. | **Plano A [L]:** escrever `Deus falou: Aja luz! E a luz veio brilhar!` ("Aja" tem som idêntico, [ˈaʒɐ], sem H. Na legenda fica "Haja luz"). No QC, normalizar "aja"="haja". **Plano B [R], fiel a Gn 1:3 (NTLH: "Que haja luz!")**, sem H no começo da palavra: `Deus falou: Que venha a luz! E a luz veio brilhar.` Mesma métrica, mesmo sentido (Deus manda e a luz existe). |
| 2 | **"nem luar" → "nem o ar"** | O "L" depois da nasal "nem" some. | **[R] mínima:** `No começo era escuro, nem estrela, nem o luar,` (sai "só" e entra "o", mesmo número de sílabas e mesma rima. O "l" entre vogais fica claro). |
| 3 | **"e eu" → "eu"** | Duas vogais iguais se fundem. | Já resolvido: lead canta `e eu?` e o coro responde `(E EU!)`. Manter nas 5 ocorrências do refrão. |
| 4 | **"bem pertinho" → "pretinho"** | Metátese do "per-" depois de nasal. Vale para qualquer "bem per-/bem pr-". | Se voltar a aparecer: **[R]** `juntinho` ou `de pertinho` (a vogal antes protege o "p"). Na letra 3.1: "bem fortinho" e "bem baixinho" são de risco baixo, mas confira no QC. |
| 5 | **"soprou vida, fuuu" embolou** | Onomatopeia na linha da cantora. | **[L]** Sem onomatopeia na voz: `Soprou vida bem fortinho, e bateu o coração!` (como na v5). O "tum-tum" vai para a **banda**: local style `two soft heartbeat kick drum hits right after 'coração'`. |
| 6 | **"(glub, glub!)" e outras onomatopeias** | Soam estranhas cantadas. | **[L]** Tirar das `lines`. Se quiser o efeito: local style `bubbly glockenspiel and flute flourish on the sea line`. Negativo global: `sound effects sung by the vocalist`. |
| 7 | **"Quatro" sumiu / números engolidos** | Linha longa + dois-pontos que soa como fala. | **[L]** `Quatro dedinhos, pôs o sol no céu pra clarear o dia,` (vírgula no lugar dos dois-pontos). Na contagem rápida, cada número em linha própria e **número + palavra curta**: `Quatro, as estrelas!`. Se precisar reforçar: maiúscula **só no número** (`QUATRO`). Maiúscula funcionou no coro, mas na cantora usar no máximo 1 por linha, senão ela grita. |
| 8 | **"no mar, a baleia" → "numa baleia"** | Elisão "mar a" → "ma". | **[R] mínima:** `Cinco dedinhos, lá no mar tem baleia e peixinho a nadar,` (o "t" de "tem" separa as palavras; mesma rima em -ar). |
| 9 | **"Isso é bom!" / "Ficou muito bom!"** entre aspas | Aspas = diálogo, que puxa para a fala. | **[L]** Sem aspas: `Isso é bom, Ele dizia, e voltava a criar!` e `E disse: Ficou muito bom! (Muito bom!) Que linda criação!`, ou melhor, `E disse, ficou muito bom!` |
| 10 | **"o tatu e a arara"** | Choque de 3 vogais ("u-e-a-a"), que pode virar "tatu arara". | Monitorar. Se falhar, **[R]** `O macaquinho, a ovelhinha, o tatu, a arara!` (enumeração, sem "e"). |
| 11 | **"a primeira árvore cresceu"** | Proparoxítona espremida pode virar "árvor". | Garantir tempo na linha (Verso 2 ≥ 28 s). Se falhar: `e a primeira árvore cresceu` → `e uma árvore cresceu` [R] só em último caso. |
| 12 | **"abençoou"** | Pode sair "abençou" (perde um "o"). | QC já passou. Manter, mas no QC checar 3 sílabas finais "ço-ou". Se falhar [L]: `e abençoou` → `e Ele abençoou`. |
| 13 | **"Deus"** | Ditongo pode virar "Dês" ou "Deos". | Ok até agora. Nada a mudar: o descritor de dicção ("nasal vowels… diphthongs") cobre. |
| 14 | **"Ele"** | Às vezes sai "Éle"/"Ele" com o E aberto, ok no PT-BR cantado. | Nada a fazer. |

### Regras de formatação para `lines` (resumo)
- **Uma frase musical por linha.** Quebre linhas de mais de 15 sílabas em duas, em vez de pedir pausa.
- Vírgula serve para respirar. **Não use dois-pontos, aspas nem reticências** na linha da cantora.
- **Parênteses só para o coro** (eco curto, 1–3 palavras: `(Foi Deus!)`, `(E EU!)`, `(Muito bom!)`).
- **MAIÚSCULAS:** liberadas no coro. Na cantora, no máximo uma palavra-chave por linha.
- Hífen só em palavra composta real (`bem-te-vi`). **Não** separe sílabas com hífen (vira staccato robótico).
- Onomatopeia nunca entra na linha: vira instrumento no local style.

---

## 4. Checklist para o próximo plano
1. Global: a linha da cantora da amostra + as 2 linhas novas de humanidade e dicção + as 2 de BV/coro, voltando a **112 BPM bouncy**.
2. Trocar "Haja luz" (Plano A "Aja luz"), "nem o luar" e "lá no mar tem baleia".
3. Tirar dois-pontos e aspas de todas as `lines`.
4. Recalcular `duration_ms`: ~4,5 s por linha longa e ~2,2 s por linha de refrão.
5. Gerar **amostras de 10–15 s só do Verso 1 e do Verso 2** antes da versão completa. São esses os trechos com mais palavras de risco.
