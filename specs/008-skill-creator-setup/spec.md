# Feature Specification: [FEATURE NAME]

# Feature Specification: Anthropic Skill Creator導入

**Feature Branch**: `008-skill-creator-setup`  
**Created**: 2026-03-07  
**Input**: User description: "$ARGUMENTS"
**Input**: User description: "このワークスペースに　アンソロピックの　AgentSkillsの　https://github.com/anthropics/skills/tree/main/skills/skill-creator　スキルクリエータを導入する"

## User Scenarios & Testing _(mandatory)_

<!--
### User Story 1 - Skill Creator基本構造の導入 (Priority: P1)

開発者として、Anthropic公式のskill-creatorをワークスペースに導入し、スキル作成・評価・改善のための基盤を整備したい。これにより、今後のCopilotスキル開発を体系的に行えるようになる。

**Why this priority**: プロジェクトの開発効率向上の基盤となる最優先機能。skill-creatorがなければスキル開発の反復改善ができない。

**Independent Test**: `.github/skills/skill-creator/SKILL.md`が存在し、基本的なディレクトリ構造（agents/, scripts/, references/, eval-viewer/）が配置されていることで確認可能。
**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
1. **Given** ワークスペースのルートディレクトリ、**When** `.github/skills/skill-creator/`を確認する、**Then** SKILL.mdとLICENSE.txtが存在する
2. **Given** skill-creatorディレクトリ、**When** サブディレクトリを確認する、**Then** agents/, scripts/, references/, eval-viewer/, assets/が存在する
3. **Given** SKILL.mdファイル、**When** 内容を確認する、**Then** スキル作成プロセスの説明が含まれている
---

### User Story 2 - [Brief Title] (Priority: P2)
### User Story 2 - 評価・改善ツールの配置 (Priority: P2)

開発者として、スキルの評価・改善に必要なPythonスクリプトとエージェント定義が利用可能な状態にしたい。これにより、作成したスキルの品質を測定し反復改善できる。

**Why this priority**: P1の基本構造があれば最小限の価値は得られるが、実際の評価・改善にはこれらのツールが必須。

**Independent Test**: 各スクリプト（run_eval.py, improve_description.py等）が実行可能で、エージェント定義（grader.md, analyzer.md等）が参照可能であることで確認可能。
**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
1. **Given** scripts/ディレクトリ、**When** ファイル一覧を確認する、**Then** run_eval.py, run_loop.py, improve_description.py, aggregate_benchmark.py等が存在する
2. **Given** agents/ディレクトリ、**When** ファイル一覧を確認する、**Then** grader.md, analyzer.md, comparator.mdが存在する
3. **Given** references/ディレクトリ、**When** schemas.mdを確認する、**Then** JSON スキーマ定義が記載されている
---

### User Story 3 - [Brief Title] (Priority: P3)
### User Story 3 - ドキュメントと参照資料の整備 (Priority: P3)

開発者として、skill-creatorの使用方法とデータフォーマットの参照資料にアクセスできるようにしたい。これにより、ツールを効果的に活用できる。

**Why this priority**: P1とP2が揃えば基本的な使用は可能だが、詳細なドキュメントがあることで習熟度が向上する。

**Independent Test**: eval-viewer/とassets/のファイルが配置され、HTMLビューアが機能することで確認可能。
**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
1. **Given** eval-viewer/ディレクトリ、**When** ファイルを確認する、**Then** generate_review.pyとviewer.htmlが存在する
2. **Given** assets/ディレクトリ、**When** ファイルを確認する、**Then** eval_review.htmlが存在する
3. **Given** references/schemas.md、**When** 内容を確認する、**Then** evals.json, grading.json, benchmark.json等のスキーマ定義が含まれている
---

[Add more user stories as needed, each with an assigned priority]

<!--
- GitHubからの取得に失敗した場合の処理は？ → エラーメッセージを表示し、手動でのダウンロード方法を案内
- 既に`skills/skill-creator/`ディレクトリが存在する場合は？ → 既存ファイルをバックアップまたは上書き確認
- Pythonスクリプトの実行権限が不足している場合は？ → chmod +xで実行権限を付与
- ファイル構造が不完全な場合は？ → 必須ファイルの存在確認と欠落の報告
## Requirements *(mandatory)*

<!--

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-001**: システムは、Anthropic公式リポジトリ（https://github.com/anthropics/skills）からskill-creatorの最新版を取得しなければならない
- **FR-002**: システムは、skill-creatorを`.github/skills/skill-creator/`ディレクトリに配置しなければならない
- **FR-003**: システムは、以下のディレクトリ構造を維持しなければならない: agents/, scripts/, references/, eval-viewer/, assets/
- **FR-004**: システムは、LICENSE.txtを含むすべての必須ファイルを配置しなければならない
- **FR-005**: システムは、Pythonスクリプトに実行権限を設定しなければならない
- **FR-006**: システムは、配置後にファイル構造の完全性を検証しなければならない
### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **Skill Creator**: Anthropic公式のスキル作成・評価・改善ツール。SKILL.md（メイン仕様）、エージェント定義、Pythonスクリプト、HTMLビューアで構成される
- **Evaluation Scripts**: スキルの品質評価を自動化するPythonスクリプト群（run_eval.py, improve_description.py等）
- **Agent Definitions**: 評価プロセスで使用するサブエージェントの定義（grader, analyzer, comparator）
- **Schema Documentation**: 評価データのJSONフォーマット定義（references/schemas.md）
## Success Criteria *(mandatory)*

<!--

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-001**: skill-creatorの全ファイル（18ファイル）が正しいディレクトリ構造で配置されている
- **SC-002**: `tree .github/skills/skill-creator`コマンドで6つのディレクトリと18ファイルが確認できる
- **SC-003**: Pythonスクリプトが実行可能権限を持ち、`python .github/skills/skill-creator/scripts/quick_validate.py`が正常に動作する
- **SC-004**: SKILL.mdを開いて、スキル作成プロセスの説明が読める（2分以内）

## Assumptions

- GitHubへの接続が可能であること
- git コマンドが利用可能であること
- Pythonランタイムが利用可能であること（スクリプト実行のため）
- ワークスペースルートに書き込み権限があること
