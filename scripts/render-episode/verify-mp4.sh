#!/usr/bin/env bash
# Verifica integridade técnica de um MP4: 1280x720, 24 fps, H.264, AAC, duração, decodificação completa.
# Uso: verify-mp4.sh <arquivo> [duração_esperada_s] [tolerância_s]
set -uo pipefail
f="$1"; exp="${2:-}"; tol="${3:-0.5}"
[ -s "$f" ] || { echo "✗ arquivo ausente ou vazio: $f"; exit 1; }
v=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt -of csv=p=0 "$f")
a=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 "$f")
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
ok=1
[[ "$v" == h264,1280,720,yuv420p,24/1* ]] || { echo "✗ vídeo inesperado: $v (esperado h264,1280,720,yuv420p,24/1)"; ok=0; }
[[ "$a" == aac,* ]] || { echo "✗ áudio inesperado: '$a' (esperado AAC)"; ok=0; }
if [ -n "$exp" ]; then
  awk -v d="$d" -v e="$exp" -v t="$tol" 'BEGIN{exit !( (d-e)<t && (e-d)<t )}' || { echo "✗ duração $d s ≠ esperada $exp s"; ok=0; }
fi
# decodifica tudo (detecta arquivo truncado/corrompido)
err=$(ffmpeg -v error -i "$f" -f null - 2>&1 | head -5)
[ -z "$err" ] || { echo "✗ erros de decodificação: $err"; ok=0; }
if [ $ok = 1 ]; then echo "✓ $f — $v | $a | ${d}s"; else exit 1; fi
