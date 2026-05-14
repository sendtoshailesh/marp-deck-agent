#!/usr/bin/env bash

# render-deck.sh
#
# Render a Marp deck to HTML, PDF, PPTX, or all three.
#
# Usage:
#   bash scripts/render-deck.sh <deck.md> [--html|--pdf|--pptx|--all]
#
# Requires: npx (Node.js), @marp-team/marp-cli
# PDF/PPTX export requires Chrome or Chromium.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="${PROJECT_DIR}/templates"

if [[ $# -lt 1 ]]; then
  echo "Usage: bash scripts/render-deck.sh <deck.md> [--html|--pdf|--pptx|--all]"
  echo ""
  echo "Options:"
  echo "  --html   Export to HTML (default)"
  echo "  --pdf    Export to PDF"
  echo "  --pptx   Export to PPTX"
  echo "  --all    Export to HTML, PDF, and PPTX"
  exit 1
fi

INPUT="$1"
FORMAT="${2:---html}"

if [[ ! -f "$INPUT" ]]; then
  echo "Error: File not found: $INPUT"
  exit 1
fi

# Base output path (strip .md extension)
BASE="${INPUT%.md}"

MARP_CMD="npx -y @marp-team/marp-cli"
THEME_OPT=""

# Add theme-set if templates directory exists
if [[ -d "$TEMPLATE_DIR" ]]; then
  THEME_OPT="--theme-set ${TEMPLATE_DIR}"
fi

render_html() {
  echo "Rendering HTML..."
  $MARP_CMD $THEME_OPT "$INPUT" -o "${BASE}.html"
  echo "  -> ${BASE}.html"
}

render_pdf() {
  echo "Rendering PDF..."
  $MARP_CMD $THEME_OPT --pdf "$INPUT" -o "${BASE}.pdf"
  echo "  -> ${BASE}.pdf"
}

render_pptx() {
  echo "Rendering PPTX..."
  $MARP_CMD $THEME_OPT --pptx "$INPUT" -o "${BASE}.pptx"
  echo "  -> ${BASE}.pptx"
}

case "$FORMAT" in
  --html)
    render_html
    ;;
  --pdf)
    render_pdf
    ;;
  --pptx)
    render_pptx
    ;;
  --all)
    render_html
    render_pdf
    render_pptx
    echo ""
    echo "All formats exported:"
    echo "  HTML: ${BASE}.html"
    echo "  PDF:  ${BASE}.pdf"
    echo "  PPTX: ${BASE}.pptx"
    ;;
  *)
    echo "Unknown format: $FORMAT"
    echo "Use --html, --pdf, --pptx, or --all"
    exit 1
    ;;
esac

echo "Done."
