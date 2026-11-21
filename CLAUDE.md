# Série "O Salto" — regras do projeto

- Vídeos animados verticais (1080×1920, 30 fps), estilo aprovado no EP01 (flat 2.5D, legenda em caixa alta palavra a palavra, HUD com números, física real).
- **Sempre mandar o roteiro para o usuário aprovar ANTES de produzir o vídeo** (narração, agentes, render só depois do OK).
- O canal é uma antologia: cada episódio pode ser uma história independente (ex.: EP01 teletransporte, EP02 QI infinito), sempre com o Davi como protagonista.
- **Davi é o personagem fixo** (moletom mostarda, jeans, tênis laranja). Não mudar o design (`video-engine/src/characters/Davi.tsx`).
- Duração máxima: **2 minutos**. O ritmo segue a narração; cortes rápidos (0,9–1,6 s) com câmera sempre em movimento.
- Narração: ElevenLabs, voz Paulo Rovéglia (`cYJOoH13XCtPQ5VT5HAE`), `eleven_multilingual_v2`, similarity 0.8. A partir do EP02: tom um pouco mais animado (stability 0.33, style 0.50, speed 1.15); EP01 usou stability 0.4, style 0.35, speed 1.12. Conferir com speech-to-text e regerar se houver gaguejo.
- Toda história tem gancho no início ("E se tu…?") e gancho no fim ("Segue aí pra ver…"), e paga as regras plantadas (velocidade da Terra, estalo, a lata).
- **Para TODO vídeo finalizado:** transcrever a narração final e gerar `episodios/epXX/descricao.md` com título (+ alternativas), descrição pronta para colar (gancho, resumo, curiosidade física, CTA, hashtags) e a transcrição completa.
- Estrutura: `episodios/epXX/` (roteiro, narracao.txt/mp3, timing.json, descricao.md), `video-engine/src/epXX/` (partes A/B/C), `assets/sfx/epXX/` (efeitos + script de mixagem).
- MP4 finais ficam fora do git (tamanho); enviar ao usuário diretamente.
