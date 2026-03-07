# Plan: devcontainer開発環境の構築

## 概要

devcontainer環境を構築し、チーム全体で再現可能な開発環境を提供する。

## 必須ツールベースライン（copilot-instructions.md より）

### フロントエンド開発
- Node.js 22
- npm
- React + Vite + TypeScript（プロジェクト依存）
- Tailwind CSS（プロジェクト依存）

### バックエンド開発
- NestJS + TypeScript（プロジェクト依存）
- Prisma CLI（データベース操作）

### インフラ
- Terraform CLI（AWSリソース構築）
- AWS CLI（Lambda/S3操作）

### 開発ツール
- Git
- GitHub CLI
- VS Code拡張機能（後述）

## 技術選定決定ログ

### ベースイメージ
**決定**: （Phase 2で確定）

**候補**:

### Phase 1: Clarification解消（仕様確定）

**目的**: spec.mdの `[NEEDS CLARIFICATION]` をすべて解消する

**アクション**:
1. プロジェクトの技術スタック確認（copilot-instructions.mdを参照）
2. 必要ツールリストを確定
3. ベースイメージを決定
4. ポート転送範囲を決定
5. spec.mdを更新し、Clarificationをすべて削除

**完了条件**:
- spec.mdに `[NEEDS CLARIFICATION]` が残っていない
- 技術選定の根拠が明記されている

### Phase 2: 最小構成の実装

**目的**: 動作する最小限のdevcontainerを作成

**アクション**:
1. `.devcontainer/devcontainer.json` を作成（基本設定のみ）
2. Node.js 22環境の動作確認
3. Git認証引き継ぎの確認
4. VS Code拡張機能の自動インストール確認

**完了条件**:
- コンテナが起動する
- `node --version` が正常に実行できる
- Git操作が可能

### Phase 3: ツールと拡張機能の追加

**目的**: 開発に必要なツールをすべてセットアップ

**アクション**:
1. GitHub CLI追加
2. その他必要ツールのインストール（Phase 1で確定した内容）
3. VS Code拡張機能の追加
4. ポート転送設定

**完了条件**:
- すべての必須ツールが動作する
- 拡張機能が自動インストールされる

### Phase 4: ドキュメント整備と動作確認

**目的**: 利用手順を明確化し、検証を完了する

**アクション**:
1. `.devcontainer/README.md` を作成
2. トラブルシューティング項目を追加
3. 受け入れ条件に沿った検証を実施
4. 必要に応じて設定を調整

**完了条件**:
- README.mdが完成している
- すべての受け入れ条件を満たしている
- Podman Desktopで動作確認済み

## 技術選定（Phase 1で確定予定）

### ベースイメージ候補

| オプション | メリット | デメリット |
|----------|---------|----------|
| `mcr.microsoft.com/devcontainers/typescript-node:22` | Microsoft公式、設定済み | イメージサイズ大 |
| `node:22-bookworm` | 軽量、公式Node.js | 追加設定必要 |
| カスタムDockerfile | 完全制御 | メンテナンス負荷高 |

**推奨**: Phase 1で決定

### 必須ツール（確定）

based on `.github/copilot-instructions.md`:
- Node.js 22
- npm
- Git
- GitHub CLI

### 追加検討ツール（Phase 1で確定）

based on tech stack:
- Terraform（インフラコード用）
- AWS CLI（Lambda/S3操作用）
- Prisma CLI（データベース操作用）
- pnpm（代替パッケージマネージャー）

## リスクと対策

### リスク1: Podman互換性問題

**対策**: 
- Podman Desktopの公式ドキュメントを参照
- `runArgs` でPodman固有設定を追加
- コンテナ起動時のエラーログを収集

### リスク2: 認証情報の引き継ぎ失敗

**対策**:
- VS Code devcontainerの認証フォワーディング機能を利用
- SSH agent forwardingを有効化
- 動作確認フェーズで重点的にテスト

### リスク3: 起動時間が長い

**対策**:
- ベースイメージは軽量なものを優先
- 不要なツールは入れない
- キャッシュ戦略を最適化

## 依存関係

- Issue #1（運用基盤整備）完了済み
- ホスト環境にPodman Desktop、VS Codeがインストール済み

## 次のステップ

1. Phase 1のClarification解消を実施
2. spec.mdを更新してレビュー
3. Phase 2以降の実装に着手
