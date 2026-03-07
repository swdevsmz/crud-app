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

### 認証情報のセットアップ（必須）

**重要**: ホスト側の設定を使わず、案件ごとに独立した認証情報を使用します。

1. `.devcontainer/devcontainer.local.env` ファイルを作成:

   ```bash
   cp .devcontainer/devcontainer.local.env.sample .devcontainer/devcontainer.local.env
   ```

2. `devcontainer.local.env` を編集（この案件専用の認証情報を設定）:

   ```env
   # Git identity（この案件で使用する名前とメール）
   GIT_USER_NAME=Your Name
   GIT_USER_EMAIL=your.email@example.com

   # AWS credentials（この案件で使用するAWS認証情報）
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_REGION=ap-northeast-1
   ```

3. ファイルは `.gitignore` で除外されているため、誤ってコミットされません

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

# Git 設定確認（コンテナ専用設定になっているはず）
git config --global user.name
git config --global user.email

# Git動作確認
git -c user.useConfigOnly=true var GIT_AUTHOR_IDENT

# AWS 設定確認
env | grep AWS

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

## 設計方針

### 環境分離の徹底

- **ホスト側の設定を使わない**: `.gitconfig` や `~/.aws` はホストからコピーしない
- **案件ごとに独立**: `devcontainer.local.env` で案件専用の認証情報を管理
- **機密情報はGit管理外**: `.gitignore` で除外し、誤コミットを防止

### Git設定の仕組み

1. `devcontainer.local.env` → Docker起動時に環境変数として注入
2. `postStartCommand` → コンテナ起動時に `git config --global` を実行
3. 結果: コンテナ内の `~/.gitconfig` に反映（ホストの設定は無視）

### VS Code認証の仕組み

- VS Codeが `/etc/gitconfig` に credential helper を自動設定
- これによりGitHub認証が自動的に機能
- ホスト側の `gh.exe` などは参照しない（コンテナ完結）

## トラブルシューティング

### コンテナが起動しない

1. Podman Desktop が起動していることを確認
2. VS Code の Dev Containers 拡張機能がインストールされていることを確認
3. コンテナログを確認: View → Output → Dev Containers

### Git 認証が機能しない / コミット時にエラーが出る

1. `devcontainer.local.env` が作成されていることを確認
2. `GIT_USER_NAME` と `GIT_USER_EMAIL` が正しく設定されていることを確認
3. コンテナを再ビルド: "Dev Containers: Rebuild Container"
4. コンテナ内で確認:
   ```bash
   git config --global user.name
   git config --global user.email
   ```

### AWS CLI が認証情報を認識しない

1. `devcontainer.local.env` に AWS 認証情報が設定されていることを確認
2. 環境変数を確認: `env | grep AWS`
3. コンテナを再ビルド

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
