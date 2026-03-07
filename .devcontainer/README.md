# devcontainer 開発環境

このディレクトリには、VS Code + Podman Desktop を使用した開発環境の設定が含まれています。

## 前提条件

- Podman Desktop 1.0以上
- VS Code 1.85以上
- Windows / macOS / Linux

## 含まれるツール

### 必須ツール
- Node.js 22
- npm
- Git
- GitHub CLI

### 開発ツール
- Terraform CLI
- AWS CLI
- NestJS CLI（postCreateCommand でインストール）
- Prisma CLI（postCreateCommand でインストール）

### VS Code 拡張機能（自動インストール）
- ESLint
- Prettier
- TypeScript
- GitHub Copilot & Copilot Chat
- Tailwind CSS IntelliSense
- Prisma
- Terraform

## 使用方法

### 初回セットアップ

1. VS Code でこのリポジトリを開く
2. コマンドパレット（`Ctrl+Shift+P` / `Cmd+Shift+P`）を開く
3. "Dev Containers: Reopen in Container" を選択
4. 初回ビルドは3〜5分かかります
5. ビルド完了後、ターミナルで検証コマンドを実行

### 検証方法

コンテナ内のターミナルで以下を実行:

```bash
# Node.js バージョン確認
node --version  # v22.x.x が表示されること

# npm バージョン確認
npm --version   # 正常に動作すること

# GitHub CLI 確認
gh --version    # 正常に動作すること

# Terraform 確認
terraform --version  # 正常に動作すること

# AWS CLI 確認
aws --version   # 正常に動作すること

# Git 設定確認
git config --list  # ホストの設定が引き継がれていること

# NestJS CLI 確認
nest --version  # 正常に動作すること

# Prisma CLI 確認
prisma --version  # 正常に動作すること
```

### ポート転送

以下のポートが自動転送されます:

- **3000**: フロントエンド開発サーバー（Vite）
- **3001**: バックエンド開発サーバー（NestJS）
- **5555**: Prisma Studio

## トラブルシューティング

### コンテナが起動しない

1. Podman Desktop が起動していることを確認
2. VS Code の Dev Containers 拡張機能がインストールされていることを確認
3. コンテナログを確認: View → Output → Dev Containers

### Git 認証が機能しない

1. ホストマシンで `~/.gitconfig` と `~/.ssh` が存在することを確認
2. SSH鍵のパーミッションを確認（600 または 644）
3. コンテナを再ビルド: "Dev Containers: Rebuild Container"

### 拡張機能が自動インストールされない

1. コンテナを再ビルド
2. `devcontainer.json` の `extensions` セクションを確認
3. 手動インストール: Extensions パネルから個別にインストール

### ポート転送が機能しない

1. VS Code の PORTS パネルを確認
2. ポートが他のプロセスで使用されていないか確認
3. 手動でポート転送を追加: PORTS パネル → "Forward a Port"

## Podman Desktop 固有の注意事項

- rootless モードで動作します
- SELinux が有効な環境では、マウントに `:z` オプションが必要な場合があります
- Windows では WSL2 バックエンドを使用します

## 環境のリセット

クリーンな状態からやり直す場合:

```bash
# コンテナを削除
podman container prune

# イメージを削除
podman image prune

# VS Code で再度 "Reopen in Container" を実行
```
