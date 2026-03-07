# specsディレクトリ

このディレクトリには、機能単位の仕様成果物を保管します。

## 必須構成

機能ごとに1ディレクトリを作成し、以下を配置します。

- `specs/<id>/spec.md`
- `specs/<id>/plan.md`
- `specs/<id>/tasks.md`

例:

- `specs/001-auth/spec.md`
- `specs/001-auth/plan.md`
- `specs/001-auth/tasks.md`

## ルール

1. `spec.md` が存在するまで実装を開始しない。
2. `[NEEDS CLARIFICATION]` は実装前にすべて解消する。
3. `plan.md` と `tasks.md` を実行内容に合わせて更新する。
4. すべてのPRで対象specパスを明記する。

## `spec.md` 推奨セクション

- 背景と目的
- ユーザーシナリオ
- 機能要件
- 非機能要件
- Clarification
- スコープ外
