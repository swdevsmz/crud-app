#!/usr/bin/env bash
#
# create-pr.sh
# PR作成フローを自動化するスクリプト
#
# Usage:
#   create-pr.sh \
#     --issue-number 15 \
#     --summary "pr-creator スキルの実装" \
#     --spec-path "specs/009-pr-creator/spec.md" \
#     --add-path ".github/skills/pr-creator/" \
#     --add-path "specs/009-pr-creator/" \
#     [--type "feature|bugfix"] \
#     [--base "main"] \
#     [--overview "PR概要"] \
#     [--commit-message "..."] \
#     [--dry-run]

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ISSUE_NUMBER=''
SUMMARY=''
SPEC_PATH=''
TYPE='feature'
BASE_BRANCH='main'
OVERVIEW=''
COMMIT_MESSAGE=''
DRY_RUN='false'

ADD_PATHS=()

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PR_TEMPLATE_PATH="${SCRIPT_DIR}/../../../pull_request_template.md"

usage() {
  cat <<EOF
Usage: $0 [OPTIONS]

Required:
  --issue-number NUM      Issue番号（例: 15）
  --summary TEXT          変更要約（PRタイトルに利用）
  --spec-path PATH        対象specパス（例: specs/009-pr-creator/spec.md）
  --add-path PATH         コミット対象パス（複数指定可）

Optional:
  --type TYPE             ブランチ種別: feature | bugfix（default: feature）
  --base BRANCH           ベースブランチ（default: main）
  --overview TEXT         PR本文の概要セクション文言
  --commit-message TEXT   コミットメッセージ（未指定時は自動生成）
  --dry-run               実行内容のみ表示し、git/gh操作は行わない
  -h, --help              ヘルプ表示

Example:
  $0 \
    --issue-number 15 \
    --summary "pr-creator スキルの実装" \
    --spec-path "specs/009-pr-creator/spec.md" \
    --add-path ".github/skills/pr-creator/" \
    --add-path "specs/009-pr-creator/" \
    --type feature
EOF
  exit 1
}

run_cmd() {
  local cmd="$1"
  if [[ "$DRY_RUN" == 'true' ]]; then
    echo "[dry-run] $cmd"
  else
    eval "$cmd"
  fi
}

ensure_prerequisites() {
  command -v git >/dev/null 2>&1 || { echo -e "${RED}Error: git not found${NC}" >&2; exit 1; }
  command -v gh >/dev/null 2>&1 || { echo -e "${RED}Error: gh not found${NC}" >&2; exit 1; }

  if [[ ! -f "$PR_TEMPLATE_PATH" ]]; then
    echo -e "${RED}Error: PR template not found: $PR_TEMPLATE_PATH${NC}" >&2
    exit 1
  fi

  if [[ ! -f "$SPEC_PATH" ]]; then
    echo -e "${RED}Error: spec file not found: $SPEC_PATH${NC}" >&2
    exit 1
  fi

  if [[ "$DRY_RUN" != 'true' ]]; then
    gh auth status >/dev/null 2>&1 || {
      echo -e "${RED}Error: gh authentication required${NC}" >&2
      echo -e "${YELLOW}Run: gh auth login${NC}" >&2
      exit 1
    }
  fi
}

slugify() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9-]/-/g' \
    | sed 's/--*/-/g' \
    | sed 's/^-//;s/-$//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --issue-number)
      ISSUE_NUMBER="$2"
      shift 2
      ;;
    --summary)
      SUMMARY="$2"
      shift 2
      ;;
    --spec-path)
      SPEC_PATH="$2"
      shift 2
      ;;
    --add-path)
      ADD_PATHS+=("$2")
      shift 2
      ;;
    --type)
      TYPE="$2"
      shift 2
      ;;
    --base)
      BASE_BRANCH="$2"
      shift 2
      ;;
    --overview)
      OVERVIEW="$2"
      shift 2
      ;;
    --commit-message)
      COMMIT_MESSAGE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN='true'
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo -e "${RED}Error: unknown option: $1${NC}" >&2
      usage
      ;;
  esac
done

MISSING=()
[[ -z "$ISSUE_NUMBER" ]] && MISSING+=("--issue-number")
[[ -z "$SUMMARY" ]] && MISSING+=("--summary")
[[ -z "$SPEC_PATH" ]] && MISSING+=("--spec-path")
[[ ${#ADD_PATHS[@]} -eq 0 ]] && MISSING+=("--add-path")

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo -e "${RED}Error: missing required options: ${MISSING[*]}${NC}" >&2
  usage
fi

if [[ ! "$ISSUE_NUMBER" =~ ^[0-9]+$ ]]; then
  echo -e "${RED}Error: --issue-number must be numeric${NC}" >&2
  exit 1
fi

if [[ "$TYPE" != 'feature' && "$TYPE" != 'bugfix' ]]; then
  echo -e "${RED}Error: --type must be 'feature' or 'bugfix'${NC}" >&2
  exit 1
fi

if [[ ! "$SPEC_PATH" =~ ^specs/[0-9]{3}-[a-z0-9-]+/spec\.md$ ]]; then
  echo -e "${RED}Error: invalid --spec-path format: $SPEC_PATH${NC}" >&2
  exit 1
fi

ensure_prerequisites

SLUG="$(slugify "$SUMMARY")"
if [[ -z "$SLUG" ]]; then
  SLUG='change'
fi

BRANCH_NAME="${TYPE}/issue-${ISSUE_NUMBER}-${SLUG}"
PR_PREFIX='feat'
if [[ "$TYPE" == 'bugfix' ]]; then
  PR_PREFIX='fix'
fi

if [[ -z "$COMMIT_MESSAGE" ]]; then
  COMMIT_MESSAGE="${PR_PREFIX}: ${SUMMARY} (#${ISSUE_NUMBER})"
fi

PR_TITLE="${PR_PREFIX}: ${SUMMARY}"

if git rev-parse --verify --quiet "$BRANCH_NAME" >/dev/null; then
  echo -e "${RED}Error: branch already exists: $BRANCH_NAME${NC}" >&2
  exit 1
fi

if [[ "$DRY_RUN" != 'true' ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    echo -e "${YELLOW}Warning: working tree has local changes. Only --add-path targets will be committed.${NC}"
  fi
fi

TEMPLATE_CONTENT="$(cat "$PR_TEMPLATE_PATH")"
PR_BODY="${TEMPLATE_CONTENT//Closes #<issue-number>/Closes #$ISSUE_NUMBER}"
PR_BODY="${PR_BODY//specs/<id>/spec.md/$SPEC_PATH}"

if [[ -n "$OVERVIEW" ]]; then
  PR_BODY="${PR_BODY//何を、なぜ変更したかを記載してください。/$OVERVIEW}"
fi

echo -e "${BLUE}Branch:${NC} $BRANCH_NAME"
echo -e "${BLUE}Base:${NC} $BASE_BRANCH"

echo -e "${BLUE}Creating branch...${NC}"
run_cmd "git checkout -b '$BRANCH_NAME'"

echo -e "${BLUE}Staging files...${NC}"
for path in "${ADD_PATHS[@]}"; do
  run_cmd "git add '$path'"
done

if [[ "$DRY_RUN" != 'true' ]]; then
  if git diff --cached --quiet; then
    echo -e "${RED}Error: no staged changes. Check --add-path values.${NC}" >&2
    exit 1
  fi
fi

echo -e "${BLUE}Creating commit...${NC}"
run_cmd "git commit -m '$COMMIT_MESSAGE'"

echo -e "${BLUE}Pushing branch...${NC}"
run_cmd "git push -u origin '$BRANCH_NAME'"

echo -e "${BLUE}Creating PR...${NC}"
if [[ "$DRY_RUN" == 'true' ]]; then
  echo '[dry-run] gh pr create --title ... --body ... --base ... --head ...'
else
  PR_URL=$(gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --base "$BASE_BRANCH" \
    --head "$BRANCH_NAME")

  echo -e "${GREEN}PR created:${NC} $PR_URL"
fi
