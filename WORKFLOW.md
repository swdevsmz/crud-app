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
