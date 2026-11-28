# BLOCKTOPIA no Roblox Studio — guia

As imagens são feitas **dentro do Roblox Studio** (catálogo, texturas e itens do Roblox de verdade).
O áudio (narração, música, efeitos) e as legendas já ficam prontos neste repositório.

## 1. Instalar no seu computador (uma vez)

1. **Roblox Studio**: create.roblox.com → Start Creating (Windows ou Mac).
2. **Claude no computador**: Claude Desktop (claude.ai/download) ou Claude Code.
3. **Conector do Roblox Studio para o Claude**: o servidor MCP oficial do Roblox,
   `github.com/Roblox/studio-rust-mcp-server`. Siga o README de lá: ele instala o plugin no Studio
   e liga o Studio ao Claude. No Studio, confira que o plugin aparece como conectado.
4. **OBS Studio** (obsproject.com), grátis, para gravar a tela.
5. Baixe este repositório no computador (botão "Code" → Download ZIP, ou `git clone`).

## 2. Fazer um vídeo

1. Abra o Roblox Studio com um lugar vazio (Baseplate).
2. Abra o Claude no computador, na pasta deste repositório, e peça:
   **"monte o vídeo lie_head no Roblox Studio"**.
   O Claude segue a skill `.claude/skills/blocktopia-roblox-studio/SKILL.md`: monta os cenários
   e personagens com itens do catálogo, anima cada cena e cria um script de "filme" que toca
   as 29 cenas no tempo certo da narração (`roblox-studio/lie_head/shotlist.json`).
3. Grave:
   - No Studio: aba **Test → Device** → escolha um celular na vertical (ou resolução 1080x1920).
   - No OBS: captura de janela do Studio, tela de saída 1080x1920.
   - Aperte **Play** no Studio e **Gravar** no OBS. O filme começa sozinho e dura 1:18.
   - O som do Studio não importa: o áudio final é colocado depois.
4. Mande a gravação (.mp4) aqui no chat ou coloque na pasta `roblox-studio/lie_head/`.
   Eu rodo `bash roblox-studio/montar_video.sh lie_head gravacao.mp4` e devolvo o `final.mp4`
   com narração, música, efeitos e legendas.

## O que já está pronto (lie_head)

| arquivo | o que é |
|---|---|
| `lie_head/script.txt` | roteiro ("In this town...") |
| `lie_head/mix.m4a` | áudio final: voz + música + 29 efeitos (1:18) |
| `lie_head/words.json` | tempo de cada palavra |
| `lie_head/shotlist.json` | 29 cenas: tempo, cenário, ação, câmera |
| `lie_head/captions.ass` | legendas brancas com contorno preto |
| `montar_video.sh` | junta gravação + áudio + legendas |
