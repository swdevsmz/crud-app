# Tasks: PR Creator Skill

**入力**: `/specs/009-pr-creator/spec.md`, `/specs/009-pr-creator/plan.md`

## Phase 1: Spec Fix

- [ ] T001 Clarification項目を解消し、`specs/009-pr-creator/spec.md` を確定する
- [ ] T002 Clarification反映後に `specs/009-pr-creator/plan.md` を更新する

## Phase 2: Skill Skeleton

- [ ] T003 `.github/skills/pr-creator/` を作成する
- [ ] T004 `SKILL.md` の初版を作成する（トリガー/入力項目/失敗時案内）
- [ ] T005 `.github/pull_request_template.md` を利用する方針を `SKILL.md` に明記する

## Phase 3: Script Implementation

- [ ] T006 `scripts/create-pr.sh` を作成する（引数パース）
- [ ] T007 ブランチ名生成ロジックを実装する（`feature/issue-<n>-<slug>`）
- [ ] T008 git操作（checkout/add/commit/push）を実装する
- [ ] T009 `.github/pull_request_template.md` 読み込み + `gh pr create` 実行を実装する
- [ ] T010 エラーハンドリングを実装する（未入力/未認証/push失敗）

## Phase 4: Validation

- [ ] T011 `create-pr.sh --help` を確認する
- [ ] T012 ダミー変更で dry-run 相当の検証を行う（可能な範囲）
- [ ] T013 生成PR本文に `Closes #<n>` が入ることを確認する

## Phase 5: Delivery

- [ ] T014 Issue #15 の受入条件チェックを更新する
- [ ] T015 PRを作成し、spec path を本文に明記する
