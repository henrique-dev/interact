#!/usr/bin/env sh

docker_command=""

if command -v docker-compose &> /dev/null; then
  docker_command="docker-compose"
elif command -v docker compose &> /dev/null; then
  docker_command="docker compose"
else
  echo "Neither docker-compose nor docker compose is installed"
  exit 1
fi
