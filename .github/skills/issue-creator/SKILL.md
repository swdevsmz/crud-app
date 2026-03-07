---
name: issue-creator
description: Spec-Firstワークフローに従い、GitHub Issue（feature）を自然言語から自動作成します。spec.mdパスの自動推論、必須フィールド検証、ラベル付けを含みます。
trigger:
  - Issueをつくって
  - Create an issue
  - 新しいIssueを作成
---

# issue-creator スキル

## 概要

このスキルは、Spec-Firstワークフロー（`1 Issue = 1 spec.md = 1 PR`原則）に従い、GitHub Issueを自然言語の入力から自動作成します。

### 主な機能

- **自然言語からの生成**: ユーザーの説明から必須フィールド（problem, goal, acceptance, clarification）を抽出
- **spec.mdパス推論**: `specs/NNN-slug/spec.md` 形式で次のspec IDを自動割り当て
- **必須検証**: feature.ymlテンプレートの必須フィールドを確認
- **ラベル管理**: `feature` ラベル、存在しない場合は `enhancement` にフォールバック

## 使い方

### 基本的な起動方法

「〇〇機能を実装したいIssueをつくって」のように、実装したい機能を含めて依頼してください。

**例:**

- 「ログイン機能を実装したいIssueをつくって」
- 「TODOのCRUD画面のIssueを作成して」
- 「MFA対応のIssueをつくって」

### 対話フロー

スキルは以下の項目を順次確認します:

1. **summary (要約)**: Issue タイトルとなる簡潔な要約
2. **problem (課題)**: 解決したい問題・背景
3. **goal (目標)**: 実装で達成したいこと
4. **acceptance (受入条件)**: 完了判定基準（チェックリスト形式推奨）
5. **clarification (明確化状態)**:
   - `はい（未解消項目なし）` - 仕様が確定している
   - `いいえ（未解消項目あり）` - 仕様に未解決項目がある
6. **spec_path (任意)**: 仕様ファイルのパス（未指定時は自動推論）
7. **notes (任意)**: 追加メモ

### 自動推論される項目

- **spec_path**: 既存の `specs/` 配下を走査し、次の3桁IDを割り当て（例: `specs/009-login-feature/spec.md`）
- **labels**: `feature` ラベル、リポジトリに存在しない場合は `enhancement`

## 技術仕様

### 実行フロー

```
ユーザー入力
    ↓
自然言語解析（LLM）
    ↓
必須フィールド抽出・確認
    ↓
spec_path 自動推論（任意）
    ↓
bash スクリプト実行
    ↓
gh issue create
    ↓
Issue URL 返却
```

### バックエンドスクリプト

`scripts/create-feature-issue.sh` が以下を実行:

1. 必須フラグ検証（`--summary`, `--problem`, `--goal`, `--acceptance`, `--clarification`）
2. clarification 値の検証（enum: `はい（未解消項目なし）` | `いいえ（未解消項目あり）`）
3. spec_path 未指定時の自動推論
4. spec_path フォーマット検証（`^specs/[0-9]{3}-[a-z0-9-]+/spec\.md$`）
5. テンプレート展開（`assets/feature-issue-body-template.md`）
6. gh CLI でIssue作成（`gh issue create`）

### 依存関係

- **GitHub CLI (gh)**: 認証済みである必要があります
- **bash 4.0+**: heredocとパターンマッチングを使用
- **リポジトリ構造**: `specs/` ディレクトリが存在すること

## トラブルシューティング

### gh コマンドエラー

**症状**: `gh: command not found` または認証エラー

**解決策**:

```bash
# gh インストール確認
which gh

# 認証状態確認
gh auth status

# 認証が必要な場合
gh auth login
```

### spec_path 自動推論の失敗

**症状**: 「次のspec IDを推論できませんでした」

**原因**: `specs/` ディレクトリが存在しないか、`specs/NNN-*` パターンのディレクトリが見つからない

**解決策**:

```bash
# specs ディレクトリ確認
ls -la specs/

# 手動で spec_path を指定して再実行
# スキルに「--spec-path specs/001-new-feature/spec.md を使って」と伝える
```

### clarification 値のエラー

**症状**: 「無効なclarification値です」

**原因**: 許可されていない値が指定された

**解決策**: 以下のいずれかを使用

- `はい（未解消項目なし）`
- `いいえ（未解消項目あり）`

### ラベルが見つからない

**症状**: `feature` ラベルが存在しない

**動作**: 自動的に `enhancement` ラベルにフォールバック

**確認方法**:

```bash
gh label list
```

## 参照

- **Spec-Firstワークフロー**: `.github/copilot-instructions.md` (Section 8)
- **運用ルール**: `WORKFLOW.md`
- **Issue テンプレート**: `.github/ISSUE_TEMPLATE/feature.yml`
- **仕様管理**: `specs/README.md`

## 制限事項

- featureタイプのIssueのみ対応（bug, documentationは非対応）
- spec.mdは作成せず、Issue作成のみ実施
- GitHub Actions連携は含まない（手動またはCIで別途実施）

## 出力例

成功時:

```
✅ Issue created successfully!
🔗 https://github.com/swdevsmz/crud-app/issues/42
📁 Spec path: specs/009-login-feature/spec.md
```

エラー時:

```
❌ Error: Missing required field: --problem

Usage: create-feature-issue.sh --summary "..." --problem "..." --goal "..." --acceptance "..." --clarification "..."
```
