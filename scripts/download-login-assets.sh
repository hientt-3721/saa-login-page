#!/usr/bin/env bash
# ============================================================
# Login Screen — Asset Downloader
# Screen: GzbNeVGJHz (Login)  |  File: 9ypp4enmFmdK3YAFJLIu6C
# Run: bash scripts/download-login-assets.sh
# ============================================================
set -euo pipefail

WORKSPACE="$(cd "$(dirname "$0")/.." && pwd)"
BASE="$WORKSPACE/public/assets/login"
ICONS="$BASE/icons"
IMAGES="$BASE/images"

mkdir -p "$ICONS" "$IMAGES"

echo "==> Fetching fresh signed URLs from MoMorph API..."

# ---------- helper: download with retry ----------
download() {
  local url="$1"
  local dest="$2"
  local name="$3"
  echo "  -> $name"
  if curl -fsSL --retry 3 --retry-delay 2 -o "$dest" "$url"; then
    local size
    size=$(du -sh "$dest" | cut -f1)
    echo "     ✅  saved $dest ($size)"
  else
    echo "     ❌  FAILED: $name — $url" >&2
  fi
}

# ── 1. MM_MEDIA_Logo (logo.png) ──────────────────────────────
# Source: MoMorph S3 storage (stable key: b1e72bf604326f7af02ce0e47ef0a638.png)
# Get fresh signed URL via MoMorph API, or use Figma export as fallback.
# Node ID: I662:14391;178:1033;178:1030  — fileKey: 9ypp4enmFmdK3YAFJLIu6C
LOGO_URL="$(
  curl -fsSL "https://app.momorph.ai/api/figma/media-files?fileKey=9ypp4enmFmdK3YAFJLIu6C&nodeIds=I662:14391;178:1033;178:1030" 2>/dev/null \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(list(d.values())[0] or '')" 2>/dev/null || true
)"
if [[ -z "$LOGO_URL" ]]; then
  # Fallback: use Figma export API
  LOGO_URL="https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/de19d626-ac93-4796-a397-c62c11062b97"
fi
download "$LOGO_URL" "$ICONS/logo.png" "MM_MEDIA_Logo"

# ── 2. MM_MEDIA_Root_Further_Logo (root-further-logo.png) ────
# Source: MoMorph S3 storage (stable key: 2e900e000847f138c2a99f075b1db9a8.png)
# Node ID: 2939:9548
ROOT_LOGO_URL="$(
  curl -fsSL "https://app.momorph.ai/api/figma/media-files?fileKey=9ypp4enmFmdK3YAFJLIu6C&nodeIds=2939:9548" 2>/dev/null \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(list(d.values())[0] or '')" 2>/dev/null || true
)"
if [[ -z "$ROOT_LOGO_URL" ]]; then
  ROOT_LOGO_URL="https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b45403e8-d169-482b-ab50-fb44e16866f3"
fi
download "$ROOT_LOGO_URL" "$IMAGES/root-further-logo.png" "MM_MEDIA_Root_Further_Logo"

# ── 3. MM_MEDIA_VN — Vietnam flag (flag-vn.png) ──────────────
# Node ID: I662:14391;186:1696;186:1821;186:1709  componentSet: 178:1020
download \
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/a4ac5df4-f433-40ec-93bb-bdebcf99edb6" \
  "$ICONS/flag-vn.png" \
  "MM_MEDIA_VN (Vietnam flag)"

# ── 4. MM_MEDIA_Down — chevron icon (chevron-down.png) ───────
# Node ID: I662:14391;186:1696;186:1821;186:1441  componentSet: 178:1020
download \
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e199150f-0227-4fb6-8ab5-96688f036ae9" \
  "$ICONS/chevron-down.png" \
  "MM_MEDIA_Down (chevron)"

# ── 5. MM_MEDIA_Google — Google icon (google.png) ────────────
# Node ID: I662:14426;186:1766  componentSet: 178:1020
download \
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0854d1ef-e16b-40ac-9777-4e4df8afd614" \
  "$ICONS/google.png" \
  "MM_MEDIA_Google (Google icon)"

# ── 6. Background photo (hero-background.png) ────────────────
# Node ID: 662:14389
# Using MoMorph stable image API — does not expire
BG_URL="https://momorph.ai/api/images/9ypp4enmFmdK3YAFJLIu6C/662:14389/127763e01fa1f7169aaf137bf06f7bb4.png"
download "$BG_URL" "$IMAGES/hero-background.png" "Background photo (hero-background.png)"

# ── 7. MM_MEDIA_EN — English flag (flag-en.svg) ──────────────
# EN flag is NOT in the Figma Login frame (dropdown shown closed, only VN variant rendered).
# A standard UK Union Jack SVG has been pre-created at public/assets/login/icons/flag-en.svg
# No download needed — file already exists.
if [[ -f "$ICONS/flag-en.svg" ]]; then
  echo "  -> MM_MEDIA_EN (English flag)"
  echo "     ✅  already exists: $ICONS/flag-en.svg (pre-created Union Jack SVG)"
else
  echo "  ❌  flag-en.svg missing — re-run spec workflow to regenerate."
fi

echo ""
echo "==> Asset download complete. Results:"
echo ""
echo "--- icons/ ---"
ls -lah "$ICONS/" 2>/dev/null || echo "(empty)"
echo ""
echo "--- images/ ---"
ls -lah "$IMAGES/" 2>/dev/null || echo "(empty)"
