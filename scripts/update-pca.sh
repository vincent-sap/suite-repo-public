#!/usr/bin/env bash
# Pulls the latest build of the Process Consulting Agent from SUITE-REPO-PCA
# and updates public/signavio-experience/SUITE-REPO-PCA/.
#
# Requires: gh CLI authenticated against github.tools.sap
# Usage: npm run update-pca

set -euo pipefail

REPO="signavio-experience/SUITE-REPO-PCA"
DEST="public/signavio-experience/SUITE-REPO-PCA"
TMP_TAR="/tmp/pca-repo.tar.gz"
TMP_DIR="/tmp/pca-extract"

echo "→ Downloading latest build from $REPO ..."
gh api "repos/$REPO/tarball/main" --hostname github.tools.sap > "$TMP_TAR"

echo "→ Extracting ..."
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
tar -xzf "$TMP_TAR" -C "$TMP_DIR"

echo "→ Updating $DEST ..."
rm -rf "$DEST"
mkdir -p "$DEST"
# The tarball root is signavio-experience-SUITE-REPO-PCA-<sha>/
EXTRACTED=$(ls "$TMP_DIR")
cp -r "$TMP_DIR/$EXTRACTED/docs/." "$DEST/"

echo "→ Injecting shell/sidenav CSS override into index.html ..."
# Hide the PCA app's own shellbar and side-navigation — the settings mockup
# provides its own chrome; we only want the PCA content area.
python3 - "$DEST/index.html" <<'PYEOF'
import sys, re

path = sys.argv[1]
with open(path) as f:
    html = f.read()

style = """    <style>
      /* Hide the PCA app's own shellbar and side-navigation — we're embedding
         it inside the settings mockup which already provides those. */
      [data-ui5-compact-size] > header { display: none !important; }
      [data-ui5-compact-size] > div > div:first-child,
      [data-ui5-compact-size] > div > div:nth-child(2) { display: none !important; }
    </style>"""

# Insert before closing </head>, idempotent (skip if already present)
if 'data-ui5-compact-size' not in html:
    html = html.replace('</head>', style + '\n  </head>')

with open(path, 'w') as f:
    f.write(html)

print("   CSS injected.")
PYEOF

echo "→ Cleaning up ..."
rm -rf "$TMP_DIR" "$TMP_TAR"

echo "✓ Done. Restart 'npm run serve-pca' if it is already running."
