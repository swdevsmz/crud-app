#!/usr/bin/env bash
# T005: 実行権限設定スクリプト
# 用途: skill-creatorのPythonスクリプトに実行権限を付与

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-/workspaces/crud-app}"
SKILL_DIR="$REPO_ROOT/.github/skills/skill-creator"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Setting executable permissions for Python scripts..."

if [ ! -d "$SKILL_DIR" ]; then
    echo "ERROR: skill-creator directory not found at $SKILL_DIR"
    exit 1
fi

# scripts/配下の.pyファイルに実行権限付与
if [ -d "$SKILL_DIR/scripts" ]; then
    chmod +x "$SKILL_DIR/scripts"/*.py
    echo "  ✓ Set executable: $SKILL_DIR/scripts/*.py"
else
    echo "  ⚠ Warning: scripts/ directory not found"
fi

# eval-viewer/generate_review.pyに実行権限付与
if [ -f "$SKILL_DIR/eval-viewer/generate_review.py" ]; then
    chmod +x "$SKILL_DIR/eval-viewer/generate_review.py"
    echo "  ✓ Set executable: $SKILL_DIR/eval-viewer/generate_review.py"
else
    echo "  ⚠ Warning: eval-viewer/generate_review.py not found"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Permission setup completed"
