# 開発ワークフロー

このリポジトリは、GitHub上で証跡を残すSpec-Firstワークフローで進めます。

## 対象範囲

この文書は、計画とレビュー証跡の運用基準を定義します。
このフェーズでは、アプリ実装の詳細は対象外です。

## 標準フロー

1. GitHub Issueを作成する（AgentSkill + GitHub Copilot CLIで下書き）。
2. `main` からブランチを作成する。
3. 仕様成果物（`spec.md`, `plan.md`, `tasks.md`）を確認・更新する。
4. 小さなコミット単位で実装する。
5. ローカルでAI一次レビューを行う。
6. Pull Requestを作成する。
7. CI（`lint`, `type-check`, `test`, `build`）を実行する。
8. 人間レビューを完了する。
9. squash mergeする。

## SpecKit 3つの成果物

### `spec.md` - 「何を作るか」（要件定義）

**目的**: 機能の要件を明確化する

**内容**:
- ユーザーシナリオ
- 機能要件（FR-1, FR-2...）
- 非機能要件（NFR-1, NFR-2...）
- `[NEEDS CLARIFICATION]` で未確定事項を明示

**完了条件**: すべての `[NEEDS CLARIFICATION]` が解消されている

### `plan.md` - 「どう作るか」（設計・アプローチ）

**目的**: 実装方針と手順を決める

**内容**:
- フェーズ分け
- 技術選定の根拠
- リスクと対策
- 依存関係

**完了条件**: 実装可能な粒度まで詳細化されている

### `tasks.md` - 「何をするか」（実行チェックリスト）

**目的**: 具体的な作業項目を列挙する

**内容**:
- チェックボックス形式のタスクリスト
- タスクID（T001, T002...）
- 並列実行可能なもの `[P]` マーク
- ユーザーストーリー紐付け `[US1]` など

**完了条件**: すべてのチェックボックスが ✓ になっている

## Issue粒度の原則（Spec-First）

**基本ルール**: `1 Issue = 1 spec.md = 1 PR`

- 1つのIssueは1つの `spec.md` にのみ紐付く
- Issue本文には対象specパス（`specs/<id>/spec.md`）を1つだけ記載する
- spec/plan/tasks の確認・更新・実装はすべて同じIssue内で行う
- 最終的に1つのPRで完結させる

**繰り返しパターン**:

1. Issue作成（対象spec: `specs/<id>/spec.md` を明記）
2. ブランチ作成（`feature/issue-<n>-<slug>`）
3. `spec.md` を確認・更新（要件明確化、Clarification解消）
4. `plan.md` を確認・更新（実装方針決定）
5. `tasks.md` を確認・更新（具体的タスクリスト作成）
6. `tasks.md` に沿って実装（実装中に spec/plan/tasks の更新可能）
7. すべての変更を含む1PRを作成（`Closes #<n>`）
8. CI・レビュー・マージ
9. Issue自動クローズ

**新しいIssueを作るタイミング**:

- 別の機能を作るとき
- 別の `spec.md` が必要なとき
- 例: Issue #7 `specs/000-devcontainer/` → Issue #8 `specs/001-signup/`

**大きすぎる場合の対処**:

- タスク単位でIssue分割はしない
- 最初から機能を分割して別Issue（別spec）を新規作成する
- 途中で親子Issue化しない（運用簡素化のため）

## Issue粒度の目安

**適切な粒度**:

- 1〜3日で完了できる規模
- `tasks.md` が10〜30項目程度
- `spec.md` がA4で2〜5ページ相当
- 1人で完結できる範囲

**大きすぎるサイン**:

- `tasks.md` が50項目を超える
- 複数の独立したユーザーシナリオが含まれる
- 「〜と〜と〜」のように機能が並列列挙される
- 実装に1週間以上かかりそう

**分割の判断基準**:

良い例（小さく分割）:
- Issue #8: サインアップ画面 → `specs/001-signup/`
- Issue #9: ログイン画面 → `specs/002-login/`
- Issue #10: MFA設定画面 → `specs/003-mfa/`

悪い例（大きすぎる）:
- Issue #X: 認証機能全体（サインアップ + ログイン + MFA + パスワードリセット）

**分割のタイミング**:

- Issue作成前に規模を見積もる
- 大きすぎると判断したら、最初から複数Issueに分ける
- 作業開始後に大きすぎることに気づいたら、残作業を新Issue化する

## Issue作成手順（AgentSkill + GitHub Copilot CLI）

1. AgentSkillでIssue本文のドラフトを作成する。
2. GitHub Copilot CLIで文面を整える（例: `gh copilot suggest` を使って改善案を作る）。
3. GitHub CLIでIssueを登録する（例: `gh issue create`）。
4. 登録したIssue番号をブランチ名とPRに必ず紐付ける。

補足:

- テンプレートは `.github/ISSUE_TEMPLATE/` の項目に沿って埋める。
- Issue本文には対象specパス（`specs/<id>/spec.md`）を含める。

## ブランチ命名規則

以下のいずれかの形式を使います。

- `feature/issue-<n>-<slug>`
- `bugfix/issue-<n>-<slug>`

例:

- `feature/issue-12-auth-signup`
- `bugfix/issue-27-login-timeout`

`main` への直接pushは禁止です。

## GitHub上で必須の証跡

- Issueに対象範囲と受け入れ条件を記載する。
- PRでIssueを参照する（`Closes #<n>`）。
- PRにspecへの影響を記載する。
- PR上でCIステータスを確認できる状態にする。
- レビュー判断をPRレビューコメントとして残す。

## Branch Protection（GitHub UI）

`main` に対して以下を設定します。

1. PR必須（マージ前にPull Requestを必須化）。
2. 最低1件のApproveを必須化。
3. ステータスチェック通過を必須化。
4. 必須チェックに `quality-gates` を追加。
5. 直接pushを制限。

## ローカルレビューの確認項目

PR作成前に以下を確認します。

- 型安全性とlint警告を確認済み。
- セキュリティ基礎（認証、入力検証、秘密情報の扱い）を確認済み。
- spec意図に対する退行がない。
- テストカバレッジへの影響を確認済み。

## 完了条件（Definition of Done）

以下を満たしたときのみ完了とします。

1. `spec.md`, `plan.md`, `tasks.md` が存在し最新化されている。
2. 実装が承認済みspecと一致している。
3. ローカルAIレビューの指摘に対応済みである。
4. CIが通過している。
5. 人間レビューが承認済みでPRがマージされている。
