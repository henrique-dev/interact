#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Uso: $0 <project_name>"
  exit 1
fi

PROJECT_NAME=$1

find . -type d \( -name .git -o -name node_modules -o -name .next \) -prune -o -type f -exec sed -i "s/nextjs-template/$PROJECT_NAME/g" {} +

echo "Project installed with success!"

rm -- "$0"
