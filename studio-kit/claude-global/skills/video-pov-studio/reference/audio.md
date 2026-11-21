# ÁUDIO — ElevenLabs, narração, SFX, mixagem

## Conexão ElevenLabs (preserve!)
- A credencial é injetada pelo proxy do ambiente (Claude Code na nuvem) ou por `ELEVENLABS_API_KEY` na máquina local. **Nunca** grave a chave em arquivo, log ou commit; nunca peça nova chave se a atual funciona.
- Teste rápido sem gastar créditos: `GET /v1/user/subscription` (créditos) e `GET /v2/voices?page_size=1`.
- Também existe o conector MCP ElevenLabs (creative_generate_speech etc.), útil para testes pontuais; para produção use os scripts (cache + manifesto).
- 409 "already_running" = voz da biblioteca sendo ativada; o script repete com espera. Manifesto é salvo a cada fala (falha não perde o que já foi pago).

## Elenco (src/episodes/voices.ts — mesma voz em todos os episódios)
- Narrador/protagonista: **Adam Borges** `ZqE9vIHPcrC35dZv0Svu` (narrativo, PT-BR) — stability 0.5, style 0.18, speed 0.97.
- Rafael: **Marco Antonio** `HoWXGRJgqYolkEBcxmGm` — stability 0.42, style 0.32 (urgência), filtro de telefone.
- Vizinho/infectado da porta: **Lax** `tS45q0QcrDHqHoaWdCDR`.
- Alternativas BR na conta: Adriano-Narrador `hwnuNyWkl9DjdTFykrN6` (calmo), Lax Whisper `EeTjZnu1OfgjhGKT6ywY` (sussurro), Paulo Rovéglia `cYJOoH13XCtPQ5VT5HAE`.
- Modelo: `eleven_multilingual_v2` (estável em PT-BR). `previous_text/next_text` mantêm a entonação contínua entre falas.

## Pronúncia (lição medida — não repetir o erro)
- **stability < 0.4 faz o modelo tropeçar e errar pronúncia em PT-BR** (ex.: "começava *de*, a gritar"). Use ≥ 0.4; emoção vem da pontuação/pausas.
- O gerador **transcreve cada fala** (Scribe, `por`) e compara palavra a palavra com o roteiro; < 92% → 1 nova tentativa mais estável, fica a melhor. Nota salva no manifesto (`pronuncia`). `✗ REVISAR` no log = ajuste o texto (grafia fonética) e rode `--only <id>`.
- Palavras difíceis/estrangeiras: escreva como se pronuncia (ex.: "uórquitóqui"), evite siglas (escreva por extenso).
- O usuário ouve sotaque/pronúncia melhor que o STT: se ele apontar palavra errada, corrija só aquela fala.

## Direção vocal
Suspense, pausas dramáticas (pontuação: "…", frases curtas), medo, urgência, variação de intensidade. Não acelere a voz para caber no tempo: ajuste o roteiro. Não narre o que a imagem já mostra.

## Pipeline
- `npm run voice -- <episódio.ts>` → 1 MP3 por fala (loudnorm −16 LUFS; telefone: banda 320–3300 Hz + compressão) + duração real no manifesto. Cache por hash (texto+voz+ajustes). `--only <id>` regenera um trecho.
- `npm run sfx` → biblioteca reutilizável (public/library/sfx). Sons orgânicos via Sound Effects API; bipes/ruído sintetizados com ffmpeg (custo zero). Corte de silêncio inicial para sincronia.
- Passos: automáticos, 1 por passo detectado na câmera (3 variações, volume pela velocidade).

## Mixagem (volumes de referência)
Narração 1.0 · diálogo telefone 1.0 · SFX de ação 0.6–1.0 · passos 0.22–0.57 · ambiente 0.25–0.35 · música 0.12–0.2 (entra com fade, some em momentos de silêncio dramático).
Categorias da biblioteca: ambiente (room_tone, city_distant, sirens_close, rain_window), personagem (footstep_1-3, heartbeat, breath_scared, scream_far, zombie_growl), interação (bag_drop, phone_vibrate, call_accept, call_drop, door_knock, door_bang, lock_turn, explosion_far), música (drone_tension).
