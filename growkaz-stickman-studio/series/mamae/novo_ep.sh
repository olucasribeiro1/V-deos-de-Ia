#!/bin/bash
# Cria a pasta de um episódio novo copiando config e elenco: series/mamae/novo_ep.sh ep05-a-conta-da-agua "Ep5 - A Conta da Agua"
set -e; cd "$(dirname "$0")/../.."; P=projects/$1
mkdir -p $P/{input,timeline,story,scenes/shots,build,out}
python3 - "$P" "$2" <<'PY'
import json,sys; c=json.load(open('projects/ep04-o-ar-pesado/config.json')); c['title']='O Que a Mamae Sabia - '+sys.argv[2]; c['duration']=0; json.dump(c,open(sys.argv[1]+'/config.json','w'),ensure_ascii=False,indent=1)
PY
echo "export { EDUARDO, RAFAEL, MARIANA, OSVALDO, RAFAEL_S, JOAQUIM, MARIANA_JALECO, MILITAR } from '/personagem/elenco-mamae.js';" > $P/scenes/cast.js
echo "criado $P"
