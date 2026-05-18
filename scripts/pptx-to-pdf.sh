#!/usr/bin/env bash
# pptx-to-pdf.sh
#
# Convert a PPTX to PDF using LibreOffice headless. Preserves template fidelity
# better than marp-cli for this use case.
#
# Usage:
#   bash scripts/pptx-to-pdf.sh <input.pptx> [output-dir]
#
# Requires: libreoffice (`brew install --cask libreoffice` on macOS)

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash scripts/pptx-to-pdf.sh <input.pptx> [output-dir]" >&2
  exit 1
fi

INPUT="$1"
OUTDIR="${2:-$(dirname "$INPUT")}"

if [[ ! -f "$INPUT" ]]; then
  echo "Not found: $INPUT" >&2
  exit 1
fi

SOFFICE=""
if command -v soffice >/dev/null 2>&1; then
  SOFFICE="soffice"
elif command -v libreoffice >/dev/null 2>&1; then
  SOFFICE="libreoffice"
elif [[ -x "/Applications/LibreOffice.app/Contents/MacOS/soffice" ]]; then
  SOFFICE="/Applications/LibreOffice.app/Contents/MacOS/soffice"
else
  echo "LibreOffice not found. Install with:" >&2
  echo "  macOS:  brew install --cask libreoffice" >&2
  echo "  Linux:  sudo apt install libreoffice" >&2
  exit 2
fi

mkdir -p "$OUTDIR"

"$SOFFICE" --headless --convert-to pdf --outdir "$OUTDIR" "$INPUT"

BASENAME="$(basename "${INPUT%.*}")"
echo "Wrote PDF: $OUTDIR/$BASENAME.pdf"
