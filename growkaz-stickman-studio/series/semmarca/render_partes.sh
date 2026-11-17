#!/bin/bash
# Render retomável em partes, com vigia anti-travamento: series/semmarca/render_partes.sh projects/<slug> Nome_Saida [n_partes] [workers]
cd "$(dirname "$0")/../.."; P=$1; N=$2; K=${3:-12}; WK=${4:-4}
D=$(python3 -c "import json;print(json.load(open('$P/story/shots.json'))['duration'])")
mkdir -p $P/build/partes; : > $P/build/partes/lista.txt
for i in $(seq 0 $((K-1))); do
  A=$(python3 -c "print(round($D*$i/$K,3))"); B=$(python3 -c "print(round($D*($i+1)/$K,3))"); F=$P/build/partes/p$i.mp4; LOG=$P/build/partes/p$i.log
  for tent in 1 2 3; do
    [ -s $F ] && break
    node render.mjs --project $P --format jpeg --workers $WK --from $A --to $B --out $F.tmp.mp4 > $LOG 2>&1 & PID=$!
    while kill -0 $PID 2>/dev/null; do
      sleep 15
      if [ $(( $(date +%s) - $(stat -c %Y $LOG) )) -gt 240 ]; then echo "parte $i travou (tentativa $tent), reiniciando"; pkill -P $PID; kill $PID; pkill -f chrome-headless; sleep 3; break; fi
    done
    wait $PID 2>/dev/null; grep -q "^Done" $LOG && mv $F.tmp.mp4 $F
  done
  [ -s $F ] || { echo "FALHOU parte $i"; exit 1; }
  echo "file 'p$i.mp4'" >> $P/build/partes/lista.txt; echo "parte $i/$K ok $(date +%T)"
done
ffmpeg -v error -y -f concat -safe 0 -i $P/build/partes/lista.txt -c copy $P/build/video_silent.mp4 && python3 audio/mix.py --project $P > $P/build/partes/mix.log 2>&1 && F=$(ls -t $P/out/*.mp4 | grep -v -e _720p -e Teste | head -1) && ffmpeg -v error -y -i "$F" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart $P/out/${N}_720p.mp4 && echo "erros: $(grep -h 'SHOT ERROR' $P/build/partes/p*.log | wc -l)" && echo "PRONTO $P/out/${N}_720p.mp4"
