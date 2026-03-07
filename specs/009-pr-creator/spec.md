# Feature Specification: PR Creator Skill

**Feature Branch**: `feature/issue-15-pr-creator`  
**Created**: 2026-03-07  
**Issue**: `#15`  
**Input**: 「PRを作るスキルを作るISSUEをつくって」

## 背景と目的

現在、PR作成時に以下を手動で行っている。

- ブランチ作成（命名規約順守）
- 変更のステージング、コミット、push
- PRタイトル・本文の作成
- Issueとの関連付け（`Closes #<n>`）

この手順は作業者依存になりやすく、Spec-First運用（`1 Issue = 1 spec.md = 1 PR`）の証跡を毎回そろえる負荷が高い。  
本機能では、上記手順を補助する `pr-creator` スキルを導入する。

## User Scenarios & Testing

### User Story 1 - PR作成フローの自動化 (Priority: P1)

開発者として、Issue番号を指定してPR作成までの標準フローを実行したい。これにより、運用ルールに沿ったPRを短時間で作成できる。

**Why this priority**: 主要価値はPR作成工数の削減であり、最優先で提供すべき機能。

**Independent Test**:

1. `pr-creator` スキルを呼び出す
2. Issue番号・変更概要を入力する
3. ブランチ作成、commit、push、`gh pr create` が順に実行される
4. 生成されたPR本文に `Closes #<n>` が含まれる

### User Story 2 - 規約準拠のガード (Priority: P2)

開発者として、ブランチ名とPR本文の必須要素を自動で整えたい。これにより、レビューでの運用違反指摘を減らせる。

**Independent Test**:

1. ブランチ名が `feature/issue-<n>-<slug>` または `bugfix/issue-<n>-<slug>` 形式で生成される
2. PR本文に `概要`、`変更内容`、`Closes #<n>` が含まれる
3. 必須入力不足時にエラーで停止する

### User Story 3 - 失敗時のリカバリ案内 (Priority: P3)

開発者として、pushやPR作成に失敗した場合に復旧手順を即時確認したい。これにより、途中失敗時でも安全にやり直せる。

**Independent Test**:

1. `gh` 未認証状態で実行する
2. 認証エラーと再実行手順が表示される
3. 途中状態（作成済みブランチ等）を案内する

## Functional Requirements

- **FR-001**: システムは `.github/skills/pr-creator/SKILL.md` を提供し、自然言語トリガーで起動できなければならない。
- **FR-002**: システムは Issue番号と要約を受け取り、規約に沿うブランチ名を生成しなければならない。
- **FR-003**: システムは `git checkout -b`、`git add`、`git commit`、`git push`、`gh pr create` の実行手順を提供しなければならない。
- **FR-004**: システムは `.github/pull_request_template.md` を読み込み、PR本文のベーステンプレートとして利用しなければならない。
- **FR-005**: システムは PR本文に `Closes #<issue-number>` を含めなければならない。
- **FR-006**: システムは入力不足・`gh`未認証・push失敗時に、明確なエラーと再試行手順を表示しなければならない。
- **FR-007**: システムはデフォルトで `main` 向けPRを作成しなければならない。

## Non-Functional Requirements

- **NFR-001**: 実行手順は再現可能で、同じ入力に対して同じ命名規則を適用すること。
- **NFR-002**: スクリプトは Bash で動作し、既存開発環境（Debian devcontainer）で実行できること。
- **NFR-003**: 破壊的操作（強制reset/checkout破棄）を行わないこと。

## Key Entities

- **PRRequest**: PR作成要求を表す（issueNumber, summary, changeDescription, baseBranch）
- **BranchNamingRule**: ブランチ名規約（type, issueNumber, slug）
- **PRTemplateData**: PR本文に差し込むデータ（overview, changes, closesRef）

## Clarification

- `pr-creator` は **commit/pushまでを含む**。ただし破壊的操作は行わない。
- 実行方式は **フラグ入力必須** を基本とし、対話入力には依存しない。
- 初期対応は **`feature` / `bugfix` の両方** とする（`--type`で明示）。

## スコープ外

- PRマージの自動化
- CI結果に応じた自動リトライ
- 複数Issueを1PRにまとめる高度運用

## Success Criteria

- **SC-001**: Issue番号指定で規約準拠ブランチを100%生成できる。
- **SC-002**: PR本文が `.github/pull_request_template.md` の必須セクションを保持した状態で生成される。
- **SC-003**: 代表エラーケース（未入力/未認証/push失敗）で、再試行可能な案内が表示される。
