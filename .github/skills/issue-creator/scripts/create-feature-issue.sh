#!/usr/bin/env bash
#
# create-feature-issue.sh
# GitHub Issue (feature) を作成するスクリプト
#
# Usage:
#   create-feature-issue.sh \
#     --summary "機能要約" \
#     --problem "解決したい問題" \
#     --goal "達成したいこと" \
#     --acceptance "受入条件" \
#     --clarification "はい（未解済項目なし）" \
#     [--spec-path "specs/NNN-slug/spec.md"] \
#     [--notes "追加メモ"]

set -euo pipefail

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# デフォルト値
SUMMARY=""
PROBLEM=""
GOAL=""
ACCEPTANCE=""
CLARIFICATION=""
SPEC_PATH=""
NOTES=""

# 使用方法表示
usage() {
  cat <<EOF
Usage: $0 [OPTIONS]

Required:
  --summary TEXT          Issue要約（タイトルになります）
  --problem TEXT          解決したい課題・背景
  --goal TEXT             実装で達成したい目標
  --acceptance TEXT       完了判定基準（チェックリスト推奨）
  --clarification TEXT    明確化状態（enum: "はい（未解消項目なし）" | "いいえ（未解消項目あり）"）

Optional:
  --spec-path PATH        仕様ファイルパス（未指定時は自動推論）
  --notes TEXT            追加メモ・補足情報

Example:
  $0 \\
    --summary "ログイン機能の実装" \\
    --problem "ユーザー認証機能がない" \\
    --goal "ユーザーが安全にログインできる" \\
    --acceptance "- [ ] ログイン画面が表示できる\n- [ ] 認証が成功する" \\
    --clarification "はい（未解消項目なし）"
EOF
  exit 1
}

# 引数パース
while [[ $# -gt 0 ]]; do
  case "$1" in
    --summary)
      SUMMARY="$2"
      shift 2
      ;;
    --problem)
      PROBLEM="$2"
      shift 2
      ;;
    --goal)
      GOAL="$2"
      shift 2
      ;;
    --acceptance)
      ACCEPTANCE="$2"
      shift 2
      ;;
    --clarification)
      CLARIFICATION="$2"
      shift 2
      ;;
    --spec-path)
      SPEC_PATH="$2"
      shift 2
      ;;
    --notes)
      NOTES="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo -e "${RED}❌ Error: Unknown option: $1${NC}" >&2
      usage
      ;;
  esac
done

# 必須フィールド検証
MISSING_FIELDS=()
[[ -z "$SUMMARY" ]] && MISSING_FIELDS+=("--summary")
[[ -z "$PROBLEM" ]] && MISSING_FIELDS+=("--problem")
[[ -z "$GOAL" ]] && MISSING_FIELDS+=("--goal")
[[ -z "$ACCEPTANCE" ]] && MISSING_FIELDS+=("--acceptance")
[[ -z "$CLARIFICATION" ]] && MISSING_FIELDS+=("--clarification")

if [[ ${#MISSING_FIELDS[@]} -gt 0 ]]; then
  echo -e "${RED}❌ Error: Missing required fields: ${MISSING_FIELDS[*]}${NC}" >&2
  echo ""
  usage
fi

# clarification値の検証（enum）
VALID_CLARIFICATIONS=("はい（未解消項目なし）" "いいえ（未解消項目あり）")
CLARIFICATION_VALID=false
for valid in "${VALID_CLARIFICATIONS[@]}"; do
  if [[ "$CLARIFICATION" == "$valid" ]]; then
    CLARIFICATION_VALID=true
    break
  fi
done

if [[ "$CLARIFICATION_VALID" == "false" ]]; then
  echo -e "${RED}❌ Error: Invalid clarification value: '$CLARIFICATION'${NC}" >&2
  echo -e "${YELLOW}Allowed values:${NC}" >&2
  printf '  - "%s"\n' "${VALID_CLARIFICATIONS[@]}" >&2
  exit 1
fi

# spec_path 自動推論（未指定時）
if [[ -z "$SPEC_PATH" ]]; then
  echo -e "${BLUE}ℹ️  spec_path not provided, inferring next spec ID...${NC}"
  
  # specs/ 配下の最大ID取得
  max_id=$(find specs -maxdepth 1 -type d -name '[0-9][0-9][0-9]-*' 2>/dev/null \
    | sed 's|specs/\([0-9]\{3\}\)-.*|\1|' \
    | sort -n \
    | tail -1)
  
  if [[ -z "$max_id" ]]; then
    echo -e "${YELLOW}⚠️  No existing specs found, starting from 001${NC}"
    next_id="001"
  else
    next_id=$(printf '%03d' $((10#$max_id + 1)))
  fi
  
  # Slug生成（summaryからkebab-case化）
  # 日本語を除去し、英数字とハイフンのみに
  slug=$(echo "$SUMMARY" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  
  # slugが空の場合はデフォルト名
  if [[ -z "$slug" || "$slug" == "-" ]]; then
    slug="feature"
  fi
  
  SPEC_PATH="specs/${next_id}-${slug}/spec.md"
  echo -e "${GREEN}✅ Inferred spec_path: $SPEC_PATH${NC}"
fi

# spec_path フォーマット検証
SPEC_PATH_REGEX='^specs/[0-9]{3}-[a-z0-9-]+/spec\.md$'
if [[ ! "$SPEC_PATH" =~ $SPEC_PATH_REGEX ]]; then
  echo -e "${RED}❌ Error: Invalid spec_path format: '$SPEC_PATH'${NC}" >&2
  echo -e "${YELLOW}Expected format: specs/NNN-slug/spec.md${NC}" >&2
  echo -e "${YELLOW}  - NNN: 3-digit number (e.g., 001, 042)${NC}" >&2
  echo -e "${YELLOW}  - slug: lowercase alphanumeric with hyphens${NC}" >&2
  exit 1
fi

# テンプレート読み込み
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_PATH="${SCRIPT_DIR}/../assets/feature-issue-body-template.md"

if [[ ! -f "$TEMPLATE_PATH" ]]; then
  echo -e "${RED}❌ Error: Template not found: $TEMPLATE_PATH${NC}" >&2
  exit 1
fi

TEMPLATE=$(<"$TEMPLATE_PATH")

# プレースホルダ置換
BODY="$TEMPLATE"
BODY="${BODY//\{\{PROBLEM\}\}/$PROBLEM}"
BODY="${BODY//\{\{GOAL\}\}/$GOAL}"
BODY="${BODY//\{\{ACCEPTANCE\}\}/$ACCEPTANCE}"
BODY="${BODY//\{\{SPEC_PATH\}\}/$SPEC_PATH}"
BODY="${BODY//\{\{CLARIFICATION\}\}/$CLARIFICATION}"
BODY="${BODY//\{\{NOTES\}\}/${NOTES:-（なし）}}"

# ラベル決定（feature → enhancement フォールバック）
LABEL="feature"
if ! gh label list --limit 1000 | grep -qw "^feature"; then
  echo -e "${YELLOW}⚠️  'feature' label not found, falling back to 'enhancement'${NC}"
  LABEL="enhancement"
fi

# Issue作成
echo -e "${BLUE}📝 Creating GitHub Issue...${NC}"
echo ""

ISSUE_URL=$(gh issue create \
  --title "$SUMMARY" \
  --body "$BODY" \
  --label "$LABEL" \
  2>&1)

# 結果表示
if [[ $? -eq 0 ]]; then
  echo ""
  echo -e "${GREEN}✅ Issue created successfully!${NC}"
  echo -e "${BLUE}🔗 $ISSUE_URL${NC}"
  echo -e "${BLUE}📁 Spec path: $SPEC_PATH${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Failed to create issue${NC}" >&2
  echo -e "${RED}Error output:${NC}" >&2
  echo "$ISSUE_URL" >&2
  exit 1
fi
