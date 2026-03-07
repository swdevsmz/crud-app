# Copilot Instructions: 学習用CRUDアプリ（Spec-First）

このファイルはリポジトリ全体に適用するCopilot向けプロジェクト指示です。

## 1. 目的

学習向けのCRUDアプリを、低コストかつ再現可能なプロセスで構築する。

- 再現性を必須とする。
- 実装の主体は人間とする。
- AIは計画、たたき台作成、レビュー支援を担当する。
- AWS利用は可能な限り無料枠内に収める。

## 2. 実装範囲（MVP）

まず以下の画面・機能を実装する。

1. サインアップ画面
2. ログイン画面（MFA/2FA対応）
3. TOPメニュー画面
4. TODO画面（CRUD）

## 3. 技術スタック（固定）

### フロントエンド

- React + Vite + TypeScript
- 状態管理: Jotai
- UI: Tailwind CSS
- HTTPクライアント: axios
- ホスティング先: S3（静的）+ CloudFront（必要に応じて後で導入）

### バックエンド

- NestJS + TypeScript
- ランタイム: AWS Lambda + API Gateway
- ORM: Prisma
- データベース: SQLite

### インフラ

- TerraformでAWSリソースを構築する。

### 開発環境

- VS Code + devcontainer
- Podman Desktop + Podman Compose

## 4. コスト方針（学習優先）

課金を避ける設計を最優先にする。

- AWS無料枠の対象と上限を優先利用する。
- MFAは可能な限りSMSよりTOTPを優先する。
- Lambdaのメモリとタイムアウトは最小限にする。
- Lambda上のSQLite方針（学習モード）:
  - ローカル開発: 永続化されたローカルSQLiteファイル
  - Lambda実行時: `/tmp` 上のSQLite（揮発、低コスト、学習用途）
  - 注意: `/tmp` のDBは永続化されず、本番向け永続ストレージではない。

## 5. ローカル開発時の代替手段

ローカルでAWSリソースが使えない場合は以下を使う。

- Cognito代替: LocalStack（またはローカル認証モック層）
- S3代替: MinIO
- Lambda代替: NestJSのローカルサーバー実行
- API Gateway代替: NestJSのローカルHTTPエンドポイント

## 6. デュアルエンドポイント戦略（必須）

ローカル実行とLambda実行の両方をサポートする。

- `src/main.ts`: ローカル開発用エンドポイント
- `src/lambda.ts`: Lambdaハンドラ用エンドポイント
- 振る舞いは環境変数で切り替える。
- フロントエンドのAPIベースURLも環境ごとに切り替える。

## 7. コーディング規約の参照元（必須）

Vercel公開のAgentSkills / Vercel AI SDKスタイルをベースにする。

最低限の必須ルール:

- TypeScript strict mode
- ファイル名はkebab-case
- インデントは2スペース
- 文字列はシングルクオート
- 公開インターフェースとDTOは明示的に型付けする
- import順序を一定に保つ
- Reactは関数コンポーネントを使う
- NestJSはmodule/service/controllerを分離する

## 8. GitHubSpecKitによるSpec-Firstワークフロー（必須）

仕様成果物がそろう前に実装を開始してはならない。

### Step 0: SpecKit初期化（初回のみ）

- リポジトリでSpecKit initを実行する。
- `.specify/` と `specs/` をgit管理下に置く。

### Step 1: 仕様をAI+人間で共同作成する

各機能について以下を作成する。

- `specs/<id>/spec.md`
- ユーザーシナリオ、機能要件、Clarificationを記載する。
- `[NEEDS CLARIFICATION]` は実装前にすべて解消する。

### Step 2: 実行成果物を生成し確定する

- AIが `plan.md` と `tasks.md` のたたき台を作成する。
- 人間がレビューし、実行可能なタスク粒度に修正する。

### Step 3: 人間主導で実装する（AIアシスト）

- 人間が `tasks.md` に沿って実装する。
- AIは補完、説明、代替案提示を行う。
- アーキテクチャやセキュリティの最終判断をAIに委ねない。

## 9. 開発ワークフロー（Git + CI + AIレビュー）

すべての変更で以下を必須とする。

1. GitHub Issueを作成する（AgentSkillで草案作成し、GitHub Copilot CLIで整えてから登録する）
2. ブランチを作成する（`feature/issue-<n>-<slug>` または `bugfix/issue-<n>-<slug>`）
3. SpecKit成果物（`spec.md`, `plan.md`, `tasks.md`）を確認・更新する
4. ローカルで実装する（人間主導）
5. AgentSkillsでローカルAI一次レビューを行う
6. PRを作成する
7. GitHub Actionsで自動テストを実行する
8. 人間の最終レビューを行う
9. squash mergeする

`main` への直接pushは禁止する。

## 10. AIレビュー方針（ローカル優先）

ローカル開発ではPR作成前にAI一次レビューを必ず実施する。

ローカルレビューの推奨観点:

- 型安全性とlint
- セキュリティ基礎（認証、入力検証、秘密情報の扱い）
- `spec.md` との差分・退行の有無
- テストカバレッジへの影響

## 11. 品質ゲート

最低でもPRで以下を通すこと。

- lint
- type-check
- unit tests
- build

MVPのカバレッジ目標は、可能な範囲で70%以上とする。

## 12. セキュリティ基礎

- 認証情報やトークンをハードコードしない。
- 環境変数と `.env.example` テンプレートを使う。
- すべての入力を検証する（NestJS DTO + validator）。
- 保護対象エンドポイントに認証ガードを適用する。

## 13. 機能ごとの完了条件

以下を満たした場合のみ完了とする。

1. `spec.md`, `plan.md`, `tasks.md` が存在し最新化されている。
2. 実装が承認済み仕様と一致している。
3. ローカルAIレビューを完了し、指摘へ対応済みである。
4. CIが通過している。
5. 人間レビューで承認され、PRがマージされている。

## 14. 学習方針

このリポジトリは学習目的である。

- 巧妙さよりも明確さを優先する。
- 理解しやすいアーキテクチャを維持する。
- 重要な選定理由を記録する。
- AI提案を理解できない場合はマージしない。
