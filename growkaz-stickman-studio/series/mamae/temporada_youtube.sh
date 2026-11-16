#!/bin/bash
# Monta a TEMPORADA COMPLETA na horizontal (1920x1080) para o YouTube.
# Cada episódio é renderizado no modo --wide (cena vertical no centro + cenário nos lados) até o início do "segue a página";
# o último episódio vai inteiro (com a chamada final). Retoma de onde parou se o container reiniciar.
set -e; cd "$(dirname "$0")/../.."
EPS="ep01-domingo-de-churrasco ep02-racao-de-guerra ep03-caixa-da-mamae ep04-o-ar-pesado ep05-a-conta-da-agua ep06-pao-de-queijo ep07-a-verdade ep08-ele-sente-o-calor ep09-o-plano-do-tio ep10-a-ultima-brasa"
LISTA=projects/build_temporada.txt; : > $LISTA
for E in $EPS; do P=projects/$E; W=$P/build/wide_ep.mp4
  FIM=$(python3 -c "import json;d=json.load(open('$P/story/shots.json'));s=d['shots'];print(d['duration'] if '$E'=='ep10-a-ultima-brasa' else s[-1]['start'])")
  if [ ! -s $W ]; then echo ">> $E até ${FIM}s"
    node render.mjs --project $P --wide --scale 1.5 --format jpeg --to $FIM --out $P/build/wide_silent.mp4 > $P/build/wide.log 2>&1
    python3 audio/mix.py --project $P --video $P/build/wide_silent.mp4 --out $P/build/wide_mix.mp4 >> $P/build/wide.log 2>&1
    ffmpeg -v error -y -i $P/build/wide_mix.mp4 -t $FIM -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 24 -c:a aac -b:a 192k -ar 48000 -af "afade=t=out:st=$(python3 -c "print(max(0,$FIM-0.4))"):d=0.4" $W
  fi
  echo "file '$(pwd)/$W'" >> $LISTA
done
mkdir -p out && ffmpeg -v error -y -f concat -safe 0 -i $LISTA -c copy -movflags +faststart out/O_Que_a_Mamae_Sabia_Temporada_1_YouTube_1080p.mp4
echo "PRONTO: out/O_Que_a_Mamae_Sabia_Temporada_1_YouTube_1080p.mp4"
