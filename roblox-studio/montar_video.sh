#!/usr/bin/env bash
# Junta a gravação do Roblox Studio com o áudio final (narração + música + efeitos) e as legendas.
#   bash roblox-studio/montar_video.sh lie_head gravacao.mp4
# A gravação pode ter qualquer tamanho: é cortada no centro para 9:16 (1080x1920) e aparada no fim do áudio.
# Saída: roblox-studio/<video>/final.mp4
set -euo pipefail
V="$1"; REC="$2"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$V"
ffmpeg -y -v error -i "$REC" -i "$DIR/mix.m4a" \
  -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,ass='$DIR/captions.ass'[v]" \
  -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest \
  -movflags +faststart "$DIR/final.mp4"
echo "pronto: $DIR/final.mp4"
