---
name: pr-creator
description: Issue番号を起点に、規約準拠のブランチ作成・commit・push・PR作成を自動化します。PR本文は .github/pull_request_template.md をベースに生成します。
trigger:
  - PRを作って
  - Create a PR
  - Pull Requestを作成
---

# pr-creator スキル

## 概要

`pr-creator` は、Issue番号を起点に次の作業を一括実行します。

1. ブランチ作成（`feature/issue-<n>-<slug>` または `bugfix/issue-<n>-<slug>`）
2. 変更のステージング / コミット / push
3. PR作成（`gh pr create`）

PR本文はリポジトリ標準の `.github/pull_request_template.md` を読み込み、
`Closes #<issue-number>` と spec パスを埋め込んで生成します。

## 使い方

### トリガー例

- 「Issue 15 で PRを作って」
- 「bugfix でPR作成して」

### 必須入力

- `issue-number`: Issue番号（数値）
- `summary`: PRタイトルに使う要約
- `spec-path`: 対象specパス（例: `specs/009-pr-creator/spec.md`）
- `add-path`: コミット対象パス（複数指定可）

### 任意入力

- `type`: `feature` または `bugfix`（既定: `feature`）
- `base`: ベースブランチ（既定: `main`）
- `overview`: PR本文「概要」セクションの文言
- `commit-message`: コミットメッセージ（未指定時は自動生成）
- `dry-run`: 実際のgit/gh操作を行わず、実行内容のみ表示

## 実行コマンド

`scripts/create-pr.sh` を利用します。

```bash
.github/skills/pr-creator/scripts/create-pr.sh \
  --issue-number 15 \
  --summary "pr-creator スキルの実装" \
  --spec-path "specs/009-pr-creator/spec.md" \
  --add-path ".github/skills/pr-creator/" \
  --add-path "specs/009-pr-creator/" \
  --type feature
```

## 仕様メモ

- PR本文のテンプレートは `.github/pull_request_template.md` を利用
- `--type feature` の既定コミットメッセージ: `feat: <summary> (#<issue-number>)`
- `--type bugfix` の既定コミットメッセージ: `fix: <summary> (#<issue-number>)`

## トラブルシューティング

- `gh auth status` が失敗する場合: `gh auth login` を実施
- ワーキングツリーに変更がない場合: `--add-path` の対象を確認
- ブランチが既に存在する場合: summaryを変えるか既存ブランチを利用
