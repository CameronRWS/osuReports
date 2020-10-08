#!/bin/bash

set -e -o pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

redis-cli() {
  echo "redis-cli" "$@" >&2
  (cd "$DIR" && docker-compose exec -T redis redis-cli --raw "$@")
}

[[ -z "$1" ]] && exit 1
keys=($(redis-cli KEYS "$1"))

if [[ ${#keys} -eq 0 ]]; then
  echo "Query returned no keys"
  exit 1
fi

while true; do
  read -r -p "About to delete ${#keys} keys, continue? [y]es/[N]o/[p]rint " ans
  if [[ $ans =~ [Pp] ]]; then
    echo "${keys[@]}"
    continue
  fi
  if ! [[ $ans =~ [Yy] ]]; then
    echo "Aborting"
    exit 1
  fi
  break
done

redis-cli DEL "${keys[@]}"
