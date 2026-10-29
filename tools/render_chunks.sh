#!/bin/zsh
# Render a frame range in fresh-browser chunks, retrying a chunk if WebGL dies, verifying each chunk's frame count.
# usage: render_chunks.sh NAME START END [CHUNK]
cd "$(dirname "$0")"
NAME=$1; START=$2; END=$3; CH=${4:-525}
OUT=../preview/chunks_$NAME; mkdir -p $OUT; : > $OUT/list.txt
s=$START; i=0
while [ $s -le $END ]; do
  e=$((s + CH - 1)); [ $e -gt $END ] && e=$END
  f=$(printf "%s/c%02d.mp4" $OUT $i); want=$((e - s + 1))
  for try in 1 2 3; do
    if [ -f $f ] && [ "$(ffprobe -v error -select_streams v -count_packets -show_entries stream=nb_read_packets -of csv=p=0 $f)" = "$want" ]; then break; fi
    echo "$(date +%T) chunk $i $s-$e try $try" >> $OUT/progress.log
    npx remotion render build Khanwa $f --frames=$s-$e --concurrency=2 --gl=angle --timeout=120000 --log=error >> $OUT/render.log 2>&1
  done
  got=$(ffprobe -v error -select_streams v -count_packets -show_entries stream=nb_read_packets -of csv=p=0 $f 2>/dev/null)
  echo "$(date +%T) chunk $i frames $got/$want" >> $OUT/progress.log
  [ "$got" = "$want" ] || { echo FAILED > $OUT/status; exit 1; }
  echo "file 'c$(printf %02d $i).mp4'" >> $OUT/list.txt
  s=$((e + 1)); i=$((i + 1))
done
ffmpeg -y -loglevel error -f concat -safe 0 -i $OUT/list.txt -c copy ../preview/$NAME.mp4 && echo DONE > $OUT/status
