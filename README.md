# crud-app

学習用のSpec-First CRUDアプリです。

## 開発方針

- Spec-Firstで進める（`spec.md` / `plan.md` / `tasks.md` を先に整備）
- `main` へ直接pushしない
- `feature/issue-<n>-<slug>` または `bugfix/issue-<n>-<slug>` で作業する
- PRでレビューし、squash mergeする

## GitHub運用設定

### マージ後のブランチ自動削除

このリポジトリでは、PRがマージされた後に作業ブランチを自動削除する設定を有効化しています。

- Repository setting: `Automatically delete head branches`
- 現在値: `Enabled`

補足:

- ローカルのブランチは自動では削除されません。
- マージ後は必要に応じてローカルで `git branch -d <branch-name>` を実行してください。
