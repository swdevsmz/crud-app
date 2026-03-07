#!/usr/bin/env bash
# T006: 構造検証スクリプト
# 用途: skill-creatorの必須ディレクトリ・ファイルの存在確認

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-/workspaces/crud-app}"
SKILL_DIR="$REPO_ROOT/.github/skills/skill-creator"
CONTRACT_FILE="$REPO_ROOT/specs/008-skill-creator-setup/contracts/installation-contract.md"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Verifying skill-creator structure..."

ERRORS=0

# 必須ディレクトリチェック
REQUIRED_DIRS=(
    "agents"
    "scripts"
    "references"
    "eval-viewer"
    "assets"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$SKILL_DIR/$dir" ]; then
        echo "  ✓ Directory exists: $dir/"
    else
        echo "  ✗ MISSING: $dir/"
        ((ERRORS++))
    fi
done

# 必須ファイルチェック
REQUIRED_FILES=(
    "SKILL.md"
    "LICENSE.txt"
    "references/schemas.md"
    "scripts/run_eval.py"
    "scripts/run_loop.py"
    "scripts/improve_description.py"
    "scripts/aggregate_benchmark.py"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$SKILL_DIR/$file" ]; then
        echo "  ✓ File exists: $file"
    else
        echo "  ✗ MISSING: $file"
        ((ERRORS++))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Structure verification PASSED"
    exit 0
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✗ Structure verification FAILED ($ERRORS errors)"
    exit 1
fi
