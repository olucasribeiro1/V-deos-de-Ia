#!/bin/bash
# Renderiza um episódio em partes (retomável): series/semmarca/render_partes.sh projects/<slug> Nome_Saida [n_partes]
cd "$(dirname "$0")/../.."; P=$1; N=$2; K=${3:-6}
D=$(python3 -c "import json;print(json.load(open('$P/story/shots.json'))['duration'])")
mkdir -p $P/build/partes; : > $P/build/partes/lista.txt
for i in $(seq 0 $((K-1))); do
  A=$(python3 -c "print(round($D*$i/$K,3))"); B=$(python3 -c "print(round($D*($i+1)/$K,3))"); F=$P/build/partes/p$i.mp4
  if [ ! -s $F ]; then node render.mjs --project $P --format jpeg --from $A --to $B --out $F.tmp.mp4 > $P/build/partes/p$i.log 2>&1 && mv $F.tmp.mp4 $F || { echo "FALHOU parte $i"; exit 1; }; fi
  echo "file 'p$i.mp4'" >> $P/build/partes/lista.txt; echo "parte $i ok"
done
ffmpeg -v error -y -f concat -safe 0 -i $P/build/partes/lista.txt -c copy $P/build/video_silent.mp4 && python3 audio/mix.py --project $P > $P/build/partes/mix.log 2>&1 && F=$(ls -t $P/out/*.mp4 | grep -v 720p | head -1) && ffmpeg -v error -y -i "$F" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart $P/out/${N}_720p.mp4 && grep -h "SHOT ERROR" $P/build/partes/p*.log | wc -l && echo "PRONTO $P/out/${N}_720p.mp4"
