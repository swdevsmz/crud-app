#!/usr/bin/env bash
# T003: Anthropic skill-creator インストーラスクリプト
# 用途: .github/skills/skill-creator/ へのskill-creator導入

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-/workspaces/crud-app}"
TARGET_DIR="$REPO_ROOT/.github/skills/skill-creator"
LOG_FILE="$REPO_ROOT/specs/008-skill-creator-setup/artifacts/install.log"

# ログ初期化
mkdir -p "$(dirname "$LOG_FILE")"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] skill-creator installation started" | tee "$LOG_FILE"

# 作業ディレクトリへ移動
cd "$REPO_ROOT"
mkdir -p .github/skills

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Fetching skill-creator from upstream..." | tee -a "$LOG_FILE"

# 既存ディレクトリがあれば削除
if [ -d "$TARGET_DIR" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Removing existing $TARGET_DIR" | tee -a "$LOG_FILE"
    rm -rf "$TARGET_DIR"
fi

# sparse-checkoutでskill-creatorのみ取得
cd .github/skills
git clone --depth 1 --filter=blob:none --sparse https://github.com/anthropics/skills.git temp-skills 2>&1 | tee -a "$LOG_FILE"
cd temp-skills
git sparse-checkout set skills/skill-creator 2>&1 | tee -a "$LOG_FILE"

# 配置
cd ..
mv temp-skills/skills/skill-creator ./skill-creator
rm -rf temp-skills

echo "[$(date '+%Y-%m-%d %H:%M:%S')] skill-creator installed to $TARGET_DIR" | tee -a "$LOG_FILE"

# T008: 検証スクリプトの呼び出し
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running structure verification..." | tee -a "$LOG_FILE"
if "$REPO_ROOT/scripts/skill-creator/verify-structure.sh" >> "$LOG_FILE" 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Structure verification PASSED" | tee -a "$LOG_FILE"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✗ Structure verification FAILED" | tee -a "$LOG_FILE"
    exit 1
fi

# T008: 実行権限の設定
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Setting executable permissions..." | tee -a "$LOG_FILE"
"$REPO_ROOT/scripts/skill-creator/set-executable.sh" >> "$LOG_FILE" 2>&1

# 次のフェーズで検証とパーミッション設定を実施
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Installation phase completed" | tee -a "$LOG_FILE"
