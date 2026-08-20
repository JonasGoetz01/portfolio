#!/usr/bin/env bash
#
# Converts images to AVIF.
#
#   ./convert.sh                       # image-optimizer/*  ->  output/
#   ./convert.sh ../assets             # every image under assets/, in place
#   ./convert.sh --replace ../assets   # ...and delete the source afterwards
#
# In-place mode writes <name>.avif next to the original. Without --replace the
# original is kept, because deleting a file someone just added should be their
# choice; CI passes --replace so a dropped JPEG ends up as an AVIF alone (git
# history keeps the original either way). An .avif already newer than its source
# is skipped, so re-running is cheap.
#
# Requires ImageMagick 7 (`magick`), declared in devbox.json.

set -euo pipefail

QUALITY="${QUALITY:-50}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REPLACE=0
if [[ "${1:-}" == "--replace" ]]; then
  REPLACE=1
  shift
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "error: 'magick' not found. Run inside 'devbox shell', or install ImageMagick 7." >&2
  exit 1
fi

converted=0
skipped=0

convert_one() {
  local src="$1" dest="$2"
  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    skipped=$((skipped + 1))
    return
  fi
  mkdir -p "$(dirname "$dest")"
  echo "  $(basename "$src") -> $(basename "$dest")"
  magick "$src" -quality "$QUALITY" "$dest"
  converted=$((converted + 1))
  if [[ "$REPLACE" == "1" ]]; then
    rm -f "$src"
  fi
}

if [[ $# -gt 0 ]]; then
  # In-place mode over a directory tree.
  root="$(cd "$1" && pwd)"
  echo "Converting images under $root (quality $QUALITY)"
  while IFS= read -r -d '' src; do
    convert_one "$src" "${src%.*}.avif"
  done < <(find "$root" -type f \
    \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.tif' -o -iname '*.tiff' -o -iname '*.bmp' \) \
    -print0)
else
  # Drop-box mode: anything sitting in image-optimizer/ goes to output/.
  echo "Converting images in $SCRIPT_DIR (quality $QUALITY)"
  shopt -s nullglob nocaseglob
  for src in "$SCRIPT_DIR"/*.{jpg,jpeg,png,gif,webp,tiff,bmp,svg}; do
    [[ -f "$src" ]] || continue
    name="$(basename "${src%.*}")"
    convert_one "$src" "$SCRIPT_DIR/output/$name.avif"
  done
  shopt -u nullglob nocaseglob
fi

echo "Done. Converted $converted, skipped $skipped (already up to date)."
