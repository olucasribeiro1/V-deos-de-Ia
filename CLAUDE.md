# Série "O Salto" — regras do projeto

- Vídeos animados verticais (1080×1920, 30 fps), estilo aprovado no EP01 (flat 2.5D, legenda em caixa alta palavra a palavra, HUD com números, física real).
- **Sempre mandar o roteiro para o usuário aprovar ANTES de produzir o vídeo.** Depois do roteiro, gerar a narração completa e mandar o áudio pro usuário ouvir.
- **A narração aprovada é a definitiva:** quando o usuário pedir o vídeo, usar exatamente o `narracao.mp3` (e `timing.json`) já gerado — NÃO regerar a narração.
- O canal é uma antologia: cada episódio pode ser uma história independente (ex.: EP01 teletransporte, EP02 QI infinito), sempre com o Davi como protagonista.
- **Davi é o personagem fixo** (moletom mostarda, jeans, tênis laranja). Não mudar o design (`video-engine/src/characters/Davi.tsx`).
- Duração máxima: **2 minutos**. O ritmo segue a narração; cortes rápidos (0,9–1,6 s) com câmera sempre em movimento.
- Narração: ElevenLabs, **voz oficial do canal a partir do EP02: Will – Dynamic, Deep and Captivating (`0YziWIrqiRTHCxeg1lyc`)**, `eleven_multilingual_v2`, stability 0.35, similarity 0.8, style 0.45, speed 1.1–1.15 (escolhida pelo usuário). O EP01 usou Paulo Rovéglia (`cYJOoH13XCtPQ5VT5HAE`). Conferir com speech-to-text e regerar se houver gaguejo.
- **Tom da narração para as PRÓXIMAS produções (pedido do usuário):** mais animado e um pouco mais rápido, mais feliz/leve, mas sem exagero. Narrar no estilo "ele tem o poder de X, e isso faz Y" — explicativo, direto, com humor leve. Sugestão de partida: stability 0.30, style 0.55, speed 1.2, e escrever o texto já curto pra não precisar acelerar o áudio depois. Economizar créditos: não regerar narrações já aprovadas; testar tom com amostras curtas (~10 s). **Efeitos sonoros e música gastam MUITO crédito do ElevenLabs** (o EP02 consumiu ~29 mil): reutilizar a biblioteca em `assets/sfx/` (ep01, ep02qi) e só gerar efeito novo se for indispensável; nada de gerar música nova por episódio — reutilizar as trilhas existentes. Plano atual: Starter (~38 mil créditos/mês, renova dia 13).
- Duração alvo atual: **até 1:20**, vídeo único (história fechada), com traço de comédia.
- Referências de estilo: o canal Kaiser (@rmhkaiser — o vídeo de referência original é dele) e os Shorts enviados pelo usuário (ver `docs/05-referencias-kaiser.md` — fórmula: poder em 3 s, gags do dia a dia, regra/limitação, rival com poder oposto, ciência real em cada jogada, final cômico pelo efeito colateral, CTA em pergunta; narração ~3,8 palavras/s; legenda com palavra-chave em amarelo).
- Toda história tem gancho no início ("E se tu…?") e gancho no fim ("Segue aí pra ver…"), e paga as regras plantadas (velocidade da Terra, estalo, a lata).
- **Para TODO vídeo finalizado:** transcrever a narração final e gerar `episodios/epXX/descricao.md` com título (+ alternativas), descrição pronta para colar (gancho, resumo, curiosidade física, CTA, hashtags) e a transcrição completa.
- Estrutura: `episodios/epXX/` (roteiro, narracao.txt/mp3, timing.json, descricao.md), `video-engine/src/epXX/` (partes A/B/C), `assets/sfx/epXX/` (efeitos + script de mixagem).
- MP4 finais ficam fora do git (tamanho); enviar ao usuário diretamente.
