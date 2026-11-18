# Áudio — narração, trilha e efeitos

## 1. Análise do áudio de referência

Arquivo: `ref/audio.mp3` (mono, 44,1 kHz, 96 kbps, 131 s). Timestamps de `docs/referencia-transcricao.json`.

| Medida | Valor | Leitura |
|---|---|---|
| Loudness integrado (EBU R128) | **−14,7 LUFS** | Alvo padrão de Shorts/Reels (−14). |
| LRA | **2,9 LU** (−16,5 a −13,6) | Muito comprimido: a voz fica sempre no mesmo nível. |
| True peak | +1,7 dBTP | Limitado/clipado sem cuidado. No nosso, manter ≤ −1 dBTP. |
| Ritmo de fala | **415 palavras / 130,5 s = 3,18 palavras/s** (~190 ppm) | Rápido, de "storyteller" de Shorts. |
| Pausas entre palavras > 0,15 s | 79; mediana **0,32 s**, máximo 0,60 s | Só 10 pausas passam de 0,4 s. Quase não tem respiro: uma frase emenda na outra. |
| RMS na fala x RMS nas pausas | −13,6 dB x **−27,3 dB** | Nas pausas não tem silêncio. Uma **trilha/efeitos fica ~14 dB abaixo da voz** (em loudness percebido, uns −18 a −20 dB), com energia espalhada pelo espectro (graves de 20–150 Hz tão fortes quanto os médios). Tem cama musical contínua e SFX de transição. |

**Regras para o nosso mix:** voz a −14 LUFS sem muita dinâmica (comp 3:1 + limiter), cama musical de −18 a −20 dB abaixo da voz, com ducking leve. SFX nos cortes podem subir até perto do nível da voz quando ela pausa. Pausas de 0,3 s entre frases e no máximo 0,6 s nos ganchos.

## 2. Trilha do vídeo-teste de 20 s (sem narração)

**Saída:** `video-engine/out/teste-20s-audio.wav`: 20,000 s, 48 kHz, estéreo, PCM 16-bit.
**Medido:** **−14,1 LUFS integrado**, LRA 7,7 LU, pico −0,6 dBFS. Silêncio digital de 19,3 a 20 s.

### Stems (`assets/sfx/`, todos gerados no ElevenLabs)
| Arquivo | Endpoint / duração | Onde entra (s) | Nível alvo (LUFS do stem) |
|---|---|---|---|
| `musica-bed-tensa.mp3` | **/v1/music** (funcionou), 20 s, instrumental tenso/curioso 100 BPM | 0–19,3 (fade in 0,6 s, fade out 18,6 s) | −32 (≈ −18/−20 dB abaixo dos SFX principais) |
| `amb-calcadao-ondas-multidao.mp3` | sound-generation 5 s: ondas, multidão leve, gaivotas | 0–4,8 (fade out a partir de 2,9 s, por baixo do close) | −21 |
| `whoosh-corte-a.mp3` / `whoosh-corte-b.mp3` | 1,2 s, alternados | começam 0,35 s antes dos cortes 3, 5, 7,5, 10, 13 e 16 s | −23 (−26 no corte do estalo) |
| `teleporte-zap-vacuo.mp3` | 2 s: zap elétrico + implosão de vácuo | 5,25 | −15 |
| `estalo-trovao.mp3` | 3 s: trovão seco / estrondo sônico | 7,45 | −10 (o mais alto) |
| `pombos-revoada.mp3` | 2,5 s | 7,65 | −19 |
| `janela-vidro-tremendo.mp3` | 2 s | 7,85 | −21 |
| `carro-interior-noite.mp3` | 4 s: motor em marcha lenta, cidade abafada | 9,9–13 (fades de 0,4/0,6 s) | −25 |
| `tablet-beep.mp3` | 0,6 s | 11,5 | −21 |
| `sonar-ping.mp3` | 2 s, usado 3 vezes | 13,3 / 13,8 / 14,3 | −20 / −21 / −22 |
| `lock-on-tom.mp3` | 1 s | 15,2 | −18 |
| `tensao-hit.mp3` | 2 s: impacto grave | 16,0 | −17 |
| `luva-couro-aperto.mp3` | 1,5 s: couro rangendo, aperto | 16,15 | −19 |
| `stinger-empate.mp3` | 3 s: metais + percussão | 17,5 (fade out a partir de 18,7 s) | −12 |

### Mixagem
O script é `assets/sfx/mix_teste_20s.py` (`python3 mix_teste_20s.py <saida.wav> <ganho_master_dB>`; o final usou ganho **+2,6 dB**). Cada stem recebe um ganho = alvo − LUFS medido do stem. O filtro gerado segue este padrão:

```
[i:a]aresample=48000,aformat=channel_layouts=stereo,volume=<g>dB[,afade...],adelay=<ms>|<ms>[ai]  (×21 eventos)
[a0]...[a20]amix=inputs=21:normalize=0:duration=longest,volume=2.6dB,
  alimiter=limit=0.89:attack=3:release=60:level=disabled,
  afade=t=out:st=19.0:d=0.3,apad,atrim=0:20,asetpts=N/SR/TB[out]
-map [out] -ar 48000 -ac 2 -c:a pcm_s16le teste-20s-audio.wav
```
Para mudar o timing, edite a lista `EV` do script e rode de novo. Se mudar níveis, meça com `ffmpeg -i x.wav -af ebur128=peak=true -f null -` e ajuste o ganho master até dar −14.

## 3. Elenco de narração (episódio completo)

Teste: primeira fala do roteiro, `eleven_multilingual_v2`, `language_code: "pt"`. Configurações: `stability 0.4, similarity_boost 0.8, style 0.35, use_speaker_boost true, speed 1.08`. Todas as 3 amostras foram transcritas pelo Scribe sem erro.

| Amostra | voice_id | Voz (Voice Library) | Duração | Ritmo |
|---|---|---|---|---|
| `assets/voz/amostra-paulo-roveglia-rio.mp3` | `cYJOoH13XCtPQ5VT5HAE` | Paulo Rovéglia: "Young male from Rio", timbre médio-grave, natural | 5,67 s | 3,7 palavras/s |
| `assets/voz/amostra-will-dinamico.mp3` | `r3KkFedJ4n8aabIZ0RFQ` | Will: "Dynamic, Curious and Engaging", jovem, social media | 5,56 s | 3,8 palavras/s |
| `assets/voz/amostra-lax-sarcastico.mp3` | `tS45q0QcrDHqHoaWdCDR` | Lax: "Funny, Sarcastic and Smooth", jovem, a mais usada da biblioteca (272 mil clones) | 5,33 s | 3,9 palavras/s |

**Recomendação: Paulo Rovéglia (`cYJOoH13XCtPQ5VT5HAE`).** É jovem, carioca (casa com o "tu" e com o cenário de Copacabana) e tem um tom confiante de quem explica. Segunda opção: Will (`r3KkFedJ4n8aabIZ0RFQ`), mais animado. Lax é a mais "debochada" e combina com o Davi, mas é muito usada em outros canais. **Precisa ouvir antes de decidir:** a escolha acima vem dos metadados e da transcrição, não de audição.

Configurações sugeridas para o episódio: `model_id eleven_multilingual_v2` (a conta também tem `eleven_v3` e `eleven_v4`, que vale testar pela expressividade), `stability 0.35–0.45`, `similarity_boost 0.8`, `style 0.3–0.4`, `speaker_boost on`, `speed 1.05–1.1`. O alvo é ~3,2 palavras/s **depois** de entrarem as pausas de 0,3 s entre frases. Gere frase por frase ou bloco por bloco, usando `previous_text`/`next_text` para manter a entonação. Depois normalize a voz para −14 LUFS e coloque a cama de −18 a −20 dB abaixo, com sidechain/ducking.

As vozes da Voice Library funcionam direto pela API, sem adicionar. Mesmo assim, adicione a escolhida à conta (`POST /v1/voices/add/{public_owner_id}/{voice_id}`; há 10 slots livres) para não perder a voz se o dono a remover. Créditos depois deste trabalho: ~11 mil caracteres no plano starter. Dá para a narração completa (~2,3 mil caracteres) com algumas regravações.
