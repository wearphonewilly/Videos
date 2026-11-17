#!/usr/bin/env bash
# Monta MP4 final (H.264 + AAC) a partir de render/_frames/*.jpg y audio/*.wav. Uso: bash render/mux.sh [nombre]
set -euo pipefail
cd "$(dirname "$0")/.."
NAME="${1:-inokuo_reel_transporte}"
mkdir -p output
# 1) mezcla de audio: música con sidechain bajo la voz + efectos + locución, normalizado a -16 LUFS
ffmpeg -v error -y -i audio/music.wav -i audio/sfx.wav -i audio/voice.wav -filter_complex \
 "[2:a]asplit=2[v1][v2];[0:a][v1]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=500[md];[md]volume=0.6[mm];[1:a]volume=0.9[fx];[mm][fx][v2]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9[o]" \
 -map "[o]" -ar 44100 -ac 2 audio/mix.wav
# 2) vídeo
ffmpeg -v error -y -framerate 30 -i render/_frames/%05d.jpg -i audio/mix.wav \
 -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -level 4.2 -r 30 -c:a aac -b:a 192k -movflags +faststart -shortest "output/${NAME}.mp4"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of default=nw=1 "output/${NAME}.mp4"
