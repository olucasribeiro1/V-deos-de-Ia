# Roblox Story Kit — instalação neste repositório (design curto)

## Intenção
O usuário enviou o "Roblox Story Kit (Flashloop edition)" v2.2 e pediu: "se configure conforme
esta skill e instale os programas necessários". Objetivo: o Claude deste repositório passa a ter
a skill e todo o ferramental local (Blender, ffmpeg, Python env) funcionando, de forma que
sobreviva ao fim da sessão (o container é efêmero).

## Objetivos
- Skill disponível automaticamente em qualquer sessão aberta neste repo.
- Um comando de setup idempotente que reinstala tudo num container novo.
- Prova de funcionamento: render de preview do vídeo de exemplo `sneeze_teleport` (sem créditos).

## Não-objetivos
- Gerar vídeos novos (depende do Flashloop, que não está conectado).
- Trocar Flashloop por ElevenLabs (mudaria as regras do kit; decisão do usuário, fica para depois).
- Render final completo de um vídeo (CPU sem GPU: horas). Fica opcional.

## Anti-objetivos
- Desativar a checagem de assinatura Flashloop da skill.
- Desligar verificação TLS ou contornar o proxy.

## Restrições encontradas
- `download.blender.org` bloqueado → Blender vem do PyPI (`bpy==5.3.0`, Python 3.13) +
  um shim `blender` que aceita `--version` e `-b [--factory-startup] -P script -- args`.
- Sem GPU → EEVEE roda em software via Mesa (libegl1, libegl-mesa0, libgl1-mesa-dri…).
- YouTube (música) inacessível → sem trilha até o usuário colocar um áudio em `music/`.
- Container efêmero → kit e scripts versionados no repo.

## Abordagens
1. **Kit versionado no repo + script de setup (escolhida — minha decisão).** `.claude/skills/`
   é carregado pelo Claude Code a cada sessão; o script recria venv/shim/libs.
2. Só instalar em `~/.claude/skills` (o que já foi feito): perde-se tudo ao fim da sessão.
3. Script de setup do ambiente de nuvem (environment setup script): bom complemento, mas
   não leva a skill sozinho; pode ser adicionado depois chamando o mesmo script.

## Decisões minhas (o usuário pode corrigir)
- Kit em `.claude/skills/roblox-story-kit/` (cópia fiel do zip, sem edições).
- Workspace continua em `~/RobloxStories` (padrão do kit).
- Setup em `scripts/setup-roblox-kit.sh`; shim em `scripts/blender-shim.sh`.
