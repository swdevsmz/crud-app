# Data Model: Anthropic Skill Creator導入

## Entity: SkillCreatorPackage

- Description: 導入対象となるskill-creator全体の論理単位。
- Fields:
  - `name` (string): 固定値 `skill-creator`
  - `source_repo` (string): 取得元URL
  - `target_path` (string): `.github/skills/skill-creator`
  - `license_file` (string): `LICENSE.txt`
  - `status` (enum): `planned | fetched | installed | verified`
- Validation Rules:
  - `target_path`はリポジトリルート配下であること。
  - `license_file`は必須。

## Entity: SkillAsset

- Description: `skill-creator`配下のファイルまたはディレクトリ。
- Fields:
  - `relative_path` (string)
  - `type` (enum): `file | directory`
  - `required` (boolean)
  - `executable` (boolean, files only)
- Validation Rules:
  - 必須ディレクトリ: `agents/`, `scripts/`, `references/`, `eval-viewer/`, `assets/`
  - 必須ファイル: `SKILL.md`, `LICENSE.txt`
  - `scripts/*.py`は`executable=true`を推奨。

## Entity: InstallationVerification

- Description: 導入結果の検証レコード。
- Fields:
  - `structure_ok` (boolean)
  - `required_files_ok` (boolean)
  - `script_smoke_ok` (boolean)
  - `checked_at` (datetime string)
- Validation Rules:
  - `structure_ok`と`required_files_ok`は必須で`true`であること。
  - `script_smoke_ok`は環境依存時に`false`許容だが、理由を記録すること。

## Relationships

- `SkillCreatorPackage` 1 --- N `SkillAsset`
- `SkillCreatorPackage` 1 --- N `InstallationVerification`

## State Transitions

- `planned` -> `fetched`: 取得元からアセットを取得
- `fetched` -> `installed`: 目的パスへ配置
- `installed` -> `verified`: 構造確認とスモーク確認を実施
- `verified`は終端状態（更新時は新しい検証レコードを追加）
