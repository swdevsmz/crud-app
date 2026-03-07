# Implementation Plan: PR Creator Skill

**Branch**: `feature/issue-15-pr-creator`  
**Date**: 2026-03-07  
**Spec**: `/workspaces/crud-app/specs/009-pr-creator/spec.md`

## Summary

`pr-creator` スキルを追加し、Issue番号を起点にブランチ作成からPR作成までの作業を標準化する。  
既存の `issue-creator` と同様に Bash + `gh` ベースで実装し、PR本文は `.github/pull_request_template.md` をベースに生成する。

## Technical Context

- **Language/Version**: Markdown, Bash
- **Dependencies**: `git`, `gh`, `bash`
- **Target**: `.github/skills/pr-creator/`
- **Platform**: Debian devcontainer

## Constitution Check

- Spec-First: PASS（`spec.md` 作成済み）
- 1 Issue / 1 Spec / 1 PR: PASS（Issue #15 ↔ specs/009-pr-creator）
- main直接push禁止: PASS（featureブランチで作業）

## Project Structure

```text
.github/skills/pr-creator/
├── SKILL.md
├── scripts/
│   └── create-pr.sh

specs/009-pr-creator/
├── spec.md
├── plan.md
└── tasks.md
```

## Design Notes

- ブランチ名生成: `feature/issue-<n>-<slug>` を初期実装
- PR本文: `.github/pull_request_template.md` を読み込み、`Closes #<n>` など実値を埋めて生成
- エラーハンドリング: 入力不足 / `gh auth` 未認証 / push失敗を明示

## Risks

- ローカル作業ツリーがdirtyなときの扱い
- 既存ブランチ名との衝突
- `gh` 未認証時のUX

## Open Questions

- `--type` で `feature` / `bugfix` を明示指定する（自動推定しない）
- commit メッセージは `--commit-message` 未指定時に自動生成する
	- `feature`: `feat: <summary> (#<issue-number>)`
	- `bugfix`: `fix: <summary> (#<issue-number>)`
