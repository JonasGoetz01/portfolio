#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$SCRIPT_DIR/output"

mkdir -p "$OUTPUT_DIR"

count=0

for file in "$INPUT_DIR"/*.{jpg,jpeg,png,gif,webp,tiff,bmp,svg}; do
  [ -f "$file" ] || continue

  filename="$(basename "$file")"
  name="${filename%.*}"

  echo "Converting: $filename -> ${name}.avif"
  magick "$file" -quality 50 "$OUTPUT_DIR/${name}.avif"
  ((count++))
done

echo "Done. Converted $count image(s) to $OUTPUT_DIR"
