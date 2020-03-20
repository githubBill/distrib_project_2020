#!/bin/sh

n=${1}
capacity=${2}
difficulty=${3}

echo "running with n=${n}, capacity=${capacity}, difficulty=${difficulty}"

tilix -e "node . ${n} ${capacity} ${difficulty} localhost localhost 0" &
sleep 8
remaining=$((${n}-1))
for i in $(seq 1 ${remaining})
do
    tilix -e "node . ${n} ${capacity} ${difficulty} localhost localhost ${i}" &
done