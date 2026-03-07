# devcontainer 開発環境

このディレクトリには、VS Code + Podman Desktop を使用した開発環境の設定が含まれています。

## 前提条件

- Podman Desktop 1.0以上
- VS Code 1.85以上
- Windows / macOS / Linux

## 使用方法

1. VS Code でこのリポジトリを開く
2. コマンドパレット（`Ctrl+Shift+P` / `Cmd+Shift+P`）を開く
3. "Reopen in Container" を選択
4. 初回は数分かかります

## 検証方法

コンテナ内のターミナルで以下を実行:

```bash
node --version  # v22.x.x が表示されること
npm --version   # 正常に動作すること
gh --version    # 正常に動作すること
git config --list  # ホストの設定が引き継がれていること
```

## トラブルシューティング

（実装後に追加予定）
