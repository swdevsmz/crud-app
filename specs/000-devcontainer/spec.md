# Spec: devcontainer開発環境の構築

## 背景と目的

### 背景

- ローカル開発環境の再現性が現在確保されていない
- チームメンバー間で異なるNode.jsバージョンや依存ツールが原因でトラブルが発生する可能性がある
- VS Code + devcontainer + Podman Desktopの利用を前提とした開発環境が必要

### 目的

VS Code devcontainerを使用して、以下を実現する:

1. 再現可能な開発環境の提供
2. 必要なツールと拡張機能の自動セットアップ
3. Podman Desktopとの互換性確保
4. ホストマシンへの影響を最小化

## ユーザーシナリオ

### シナリオ1: 新規参加者の環境構築

1. リポジトリをクローンする
2. VS Codeで開く
3. "Reopen in Container" を選択する
4. 数分でコーディング可能な状態になる

### シナリオ2: 既存開発者の環境リセット

1. コンテナを削除する
2. "Rebuild Container" を実行する
3. クリーンな状態から再開できる

## 機能要件

### FR-1: devcontainer基本設定

- `.devcontainer/devcontainer.json` を配置する
- コンテナ名、表示名を定義する
- Podman互換の設定にする

### FR-2: ベースイメージとツール

**[NEEDS CLARIFICATION]**: ベースイメージの選定

オプション:
- A: `mcr.microsoft.com/devcontainers/typescript-node:22` （公式推奨）
- B: `node:22-bookworm` + カスタムセットアップ
- C: 独自Dockerfileでフルカスタマイズ

必須ツール:
- Node.js 22
- npm / pnpm
- Git
- GitHub CLI

**[NEEDS CLARIFICATION]**: 追加ツールの必要性

検討対象:
- Terraform CLI
- AWS CLI
- Prisma CLI
- その他（具体的に列挙する）

### FR-3: VS Code拡張機能

自動インストール対象:
- `dbaeumer.vscode-eslint`
- `esbenp.prettier-vscode`
- `ms-vscode.vscode-typescript-next`
- `github.copilot`
- `github.copilot-chat`

**[NEEDS CLARIFICATION]**: その他の拡張機能

検討対象:
- `bradlc.vscode-tailwindcss`
- `prisma.prisma`
- `hashicorp.terraform`
- その他

### FR-4: Git認証情報の引き継ぎ

- ホストのGit設定を引き継ぐ
- SSH鍵をコンテナ内で利用可能にする
- GitHub CLIの認証状態を維持する

### FR-5: ポート転送

**[NEEDS CLARIFICATION]**: 転送ポート範囲

検討:
- 3000: フロントエンド開発サーバー
- 3001: バックエンド開発サーバー
- 5555: Prisma Studio
- その他必要なポート

### FR-6: ドキュメント

`.devcontainer/README.md` に以下を記載:
- 環境構築手順
- トラブルシューティング
- Podman Desktop固有の注意事項

## 非機能要件

### NFR-1: 起動時間

- コンテナ初回ビルド: 5分以内
- コンテナ起動（既存イメージ）: 30秒以内

### NFR-2: 互換性

- Podman Desktop 1.0以上
- VS Code 1.85以上
- Windows、macOS、Linuxで動作する

### NFR-3: リソース消費

- メモリ使用量: 2GB以下（アイドル時）
- ディスク使用量: 3GB以下（イメージ + ボリューム）

## スコープ外

- Docker Desktop向けの最適化（Podman優先）
- データベースコンテナの構築（別Issueで対応）
- CI/CD環境との完全一致（ローカル開発優先）
- 複数サービスのorchestration（docker-compose等は別検討）

## 技術制約

- Podman Desktopでの動作を前提とする
- VS Code devcontainer仕様に準拠する
- コンテナ内でsystemdは使用しない
- rootless コンテナで動作可能な構成にする

## セキュリティ考慮事項

- 秘密情報をイメージに含めない
- ホストの認証情報を安全に引き継ぐ
- 不要なポート公開をしない
- 最新のセキュリティパッチが適用されたベースイメージを使う

## 依存関係

- Issue #1（運用基盤整備）が完了していること
- Podman Desktopがホストマシンにインストール済みであること
- VS Codeがインストール済みであること

## 成果物

- `.devcontainer/devcontainer.json`
- `.devcontainer/Dockerfile`（必要に応じて）
- `.devcontainer/README.md`
- 動作確認手順書（このspec内またはREADMEに記載）

## 検証方法

1. クリーンな環境でリポジトリをクローンする
2. VS Codeで "Reopen in Container" を実行する
3. コンテナ内で以下を確認:
   - `node --version` が v22.x.x を返す
   - `npm --version` が正常に動作する
   - `gh --version` が正常に動作する
   - Git認証が機能する（`git config --list` で確認）
   - VS Code拡張機能がインストール済み
4. ポート転送が機能することを確認する
5. コンテナ再起動後も設定が保持されることを確認する

## 未解決事項（Clarification必要）

1. **ベースイメージの選定**: どのイメージをベースにするか？
2. **追加ツール**: Terraform、AWS CLI、その他何が必要か？
3. **拡張機能**: 最小セットで良いか、追加が必要か？
4. **ポート転送**: どのポート範囲を開放するか？
5. **パッケージマネージャー**: npmのみか、pnpmも入れるか？

これらは実装前に明確化する必要があります。
