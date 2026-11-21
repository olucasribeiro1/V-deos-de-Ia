# ÁUDIO — ElevenLabs, narração, SFX, mixagem

## Conexão ElevenLabs (preserve!)
- A credencial é injetada pelo proxy do ambiente (Claude Code na nuvem) ou por `ELEVENLABS_API_KEY` na máquina local. **Nunca** grave a chave em arquivo, log ou commit; nunca peça nova chave se a atual funciona.
- Teste rápido sem gastar créditos: `GET /v1/user/subscription` (créditos) e `GET /v2/voices?page_size=1`.
- Também existe o conector MCP ElevenLabs (creative_generate_speech etc.), útil para testes pontuais; para produção use os scripts (cache + manifesto).
- 409 "already_running" = voz da biblioteca sendo ativada; o script repete com espera. Manifesto é salvo a cada fala (falha não perde o que já foi pago).

## Elenco APROVADO pelo usuário (src/episodes/voices.ts — mesma voz em todos os episódios)
- **Protagonista: Lucas** `yY7KGpDzir8WP7P97McA` (jovem, conversacional) — eleven_v3, stability 0.5.
- **Rafael (irmão): Leandro** `EyPnkQPpWceKpqcMOSpZ` (jovem, conversacional) — eleven_v3, filtro de telefone.
- Vizinho Paulo (304): **Wellerson** `b1vFwqGOgQwuyhGeKQ9e` — eleven_v3, filtro "door" (abafado).
- Repórter de TV: **Raquel** `GDzHdQOi6jjf8zaXhCYD` — multilingual_v2, filtro "tv".
- Rejeitado pelo usuário: narrador "de audiolivro" (Adam Borges) — não usar como voz principal.
- Antes de trocar uma voz: gere a MESMA frase com 3–4 candidatas e deixe o usuário escolher pelo ouvido.
- eleven_v3: sem previous_text/next_text; stability só 0/0.5/1; marcações em INGLÊS (em português ele LÊ a palavra, ex.: "suspiro").
- Filtros por fala (`fx`): phone · tv · door.

## Pronúncia (lição medida — não repetir o erro)
- **stability < 0.4 faz o modelo tropeçar e errar pronúncia em PT-BR** (ex.: "começava *de*, a gritar"). Use ≥ 0.4; emoção vem da pontuação/pausas.
- Falsos positivos conhecidos do STT (não são erro): números/horários em dígitos ("18:59", "20h"), "nem um"↔"nenhum", vogal alongada ("Tôôô"). O comparador já normaliza números e horários.
- Erro real já visto: "Tranca..." no início de frase virou "Franca" → reescrever ("Tranquei.").
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
