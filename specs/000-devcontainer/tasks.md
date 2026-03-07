# Tasks: devcontainer開発環境の構築

関連: Issue #4

## Phase 1: Clarification解消（仕様確定）

### Task 1.1: 技術スタック確認

- [ ] `.github/copilot-instructions.md` を読み、技術スタックを把握する
- [ ] フロントエンド/バックエンド/インフラで必要なツールをリストアップする
- [ ] 結果を spec.md に反映する

**担当**: 人間  
**見積**: 30分

### Task 1.2: ベースイメージの決定

- [ ] 各ベースイメージ候補の特徴を調査する
- [ ] Podman互換性を確認する
- [ ] イメージサイズと起動時間を比較する
- [ ] 決定根拠とともに spec.md を更新する

**担当**: AI支援 + 人間判断  
**見積**: 1時間

### Task 1.3: 必須ツールの確定

以下の要否を決定:
- [ ] Terraform CLI（インフラコード実行用）
- [ ] AWS CLI（Lambda/S3操作用）
- [ ] Prisma CLI（データベース操作用）
- [ ] pnpm（npmの代替）

**担当**: 人間  
**見積**: 30分

### Task 1.4: VS Code拡張機能リストの確定

- [ ] 必須拡張機能を列挙する（ESLint、Prettier、TypeScript等）
- [ ] オプション拡張機能を列挙する（Tailwind、Prisma等）
- [ ] spec.md の拡張機能リストを更新する

**担当**: 人間  
**見積**: 30分

### Task 1.5: ポート転送設定の確定

- [ ] フロントエンド用ポート（3000?）
- [ ] バックエンド用ポート（3001?）
- [ ] その他必要なポート（Prisma Studio等）
- [ ] spec.md を更新する

**担当**: 人間  
**見積**: 15分

### Task 1.6: spec.md Clarification削除

- [ ] すべての `[NEEDS CLARIFICATION]` を解消する
- [ ] 未解決事項セクションを空にするか削除する
- [ ] spec.md をコミットする

**担当**: 人間  
**見積**: 15分

**Phase 1 合計見積**: 約3時間

---

## Phase 2: 最小構成の実装

### Task 2.1: devcontainer.json作成（基本設定）

- [ ] `.devcontainer/` ディレクトリを作成
- [ ] `devcontainer.json` を作成
- [ ] `name`、`image` を設定
- [ ] 基本的な `customizations.vscode.settings` を追加

**担当**: AI草案 + 人間レビュー  
**見積**: 30分

### Task 2.2: ベースイメージ設定

- [ ] Phase 1で決定したベースイメージを `devcontainer.json` に記載
- [ ] 必要に応じて `Dockerfile` を作成
- [ ] Podman互換の `runArgs` を追加

**担当**: AI草案 + 人間レビュー  
**見積**: 30分

### Task 2.3: 初回起動テスト

- [ ] VS Codeで "Reopen in Container" を実行
- [ ] コンテナが正常に起動することを確認
- [ ] `node --version` を確認
- [ ] エラーがあれば修正

**担当**: 人間  
**見積**: 30分

### Task 2.4: Git認証引き継ぎ設定

- [ ] `mounts` でSSH鍵をマウント（必要に応じて）
- [ ] Git設定が引き継がれることを確認
- [ ] `git config --list` で確認
- [ ] GitHub CLIの認証が機能することを確認

**担当**: 人間  
**見積**: 30分

**Phase 2 合計見積**: 約2時間

---

## Phase 3: ツールと拡張機能の追加

### Task 3.1: GitHub CLIインストール

- [ ] `features` または `postCreateCommand` でGitHub CLIを追加
- [ ] `gh --version` で動作確認
- [ ] 認証状態の確認

**担当**: AI草案 + 人間確認  
**見積**: 20分

### Task 3.2: 追加ツールのインストール

Phase 1で確定したツールを追加:
- [ ] Terraform CLI（必要な場合）
- [ ] AWS CLI（必要な場合）
- [ ] Prisma CLI（必要な場合）
- [ ] その他ツール

**担当**: AI草案 + 人間確認  
**見積**: 1時間

### Task 3.3: VS Code拡張機能追加

- [ ] `customizations.vscode.extensions` に拡張機能IDを列挙
- [ ] コンテナ再起動時に自動インストールされることを確認
- [ ] 不要な拡張機能がないか確認

**担当**: AI草案 + 人間確認  
**見積**: 30分

### Task 3.4: ポート転送設定

- [ ] `forwardPorts` にポート番号を追加
- [ ] 各ポートの説明をコメントで記載
- [ ] ポート転送が機能することを確認

**担当**: 人間  
**見積**: 15分

**Phase 3 合計見積**: 約2時間

---

## Phase 4: ドキュメント整備と動作確認

### Task 4.1: README.md作成

- [ ] `.devcontainer/README.md` を作成
- [ ] 環境構築手順を記載
- [ ] 必要な前提条件を記載（Podman Desktop等）
- [ ] トラブルシューティングセクションを追加

**担当**: AI草案 + 人間レビュー  
**見積**: 45分

### Task 4.2: 受け入れ条件の検証

Issue #4の受け入れ条件を1つずつ確認:
- [ ] `.devcontainer/devcontainer.json` が作成されている
- [ ] 必要な開発ツールがインストールされている
- [ ] VS Code拡張機能が自動インストールされる
- [ ] Podman Desktopで動作確認済み
- [ ] `node --version`、`npm --version` が正常動作
- [ ] `.devcontainer/README.md` がある
- [ ] Git認証情報が引き継がれる

**担当**: 人間  
**見積**: 1時間

### Task 4.3: クリーン環境での検証

- [ ] コンテナとイメージを削除
- [ ] 別のディレクトリでリポジトリをクローン
- [ ] "Reopen in Container" を実行
- [ ] すべてが正常に動作することを確認

**担当**: 人間  
**見積**: 30分

### Task 4.4: 設定の最適化

- [ ] 起動時間を計測
- [ ] 不要な設定を削除
- [ ] コメントを追加して可読性を向上
- [ ] 最終調整

**担当**: 人間  
**見積**: 30分

**Phase 4 合計見積**: 約3時間

---

## 全体見積

- **Phase 1**: 約3時間（Clarification解消）
- **Phase 2**: 約2時間（最小構成）
- **Phase 3**: 約2時間（ツール追加）
- **Phase 4**: 約3時間（検証・ドキュメント）

**合計**: 約10時間

## 前提条件

- ホストマシンにPodman Desktopがインストール済み
- ホストマシンにVS Codeがインストール済み
- GitHubアカウントでの認証が完了している

## 完了条件

- すべてのタスクが完了している
- Issue #4の受け入れ条件をすべて満たしている
- spec.md、plan.md、tasks.md が最新状態である
- PRがマージされている
