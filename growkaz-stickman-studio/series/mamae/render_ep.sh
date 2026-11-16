#!/bin/bash
# Renderiza um episódio completo: vídeo, som e versão comprimida pra postar. Uso: series/mamae/render_ep.sh projects/<slug> Nome_Curto
cd "$(dirname "$0")/../.."; P=$1; N=$2
python3 $P/story/build_shots.py > /dev/null && node render.mjs --project $P --format jpeg > $P/build/render.log 2>&1 && python3 audio/mix.py --project $P >> $P/build/render.log 2>&1 || { echo "FALHOU $P"; exit 1; }
F=$(ls -t $P/out/O_Que_a_Mamae_Sabia_*.mp4 | head -1); ffmpeg -v error -y -i "$F" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart $P/out/${N}_720p.mp4 && echo "OK $P/out/${N}_720p.mp4"
