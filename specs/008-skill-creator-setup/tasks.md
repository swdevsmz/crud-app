# Tasks: Anthropic Skill Creator導入

**入力**: `/specs/008-skill-creator-setup/` の設計ドキュメント
**前提条件**: plan.md (必須), spec.md (ユーザーストーリー用・必須), research.md, data-model.md, contracts/

**テスト**: 明示的なTDD指定はないため、専用の先行テストタスクは作成せず、各ストーリーで独立検証タスクを実施する。

**構成**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テスト可能にする。

## フォーマット: `[ID] [P?] [Story] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（例: US1, US2, US3）
- 各タスクは対象ファイルパスを明記する

## Phase 1: セットアップ（共通インフラ）

**目的**: 導入作業の土台を作る

- [X] T001 導入スクリプト用作業ディレクトリを作成 `scripts/skill-creator/`
- [X] T002 証跡出力ディレクトリを作成 `specs/008-skill-creator-setup/artifacts/`
- [X] T003 インストーラスクリプトの雛形を作成 `scripts/skill-creator/install-skill-creator.sh`

---

## Phase 2: 基盤（ブロッキング前提条件）

**目的**: 全ユーザーストーリーに先行する共通機能を整備する

**⚠️ 重要**: このフェーズ完了までUS1/US2/US3へ着手しない

- [X] T004 sparse-checkoutベースのフェッチロジックを実装 `scripts/skill-creator/install-skill-creator.sh`
- [X] T005 [P] 実行権限設定スクリプトを実装 `scripts/skill-creator/set-executable.sh`
- [X] T006 [P] 構造検証スクリプトを実装 `scripts/skill-creator/verify-structure.sh`
- [X] T007 検証用の必須パスリストを実装 `specs/008-skill-creator-setup/contracts/installation-contract.md`
- [X] T008 インストーラから検証を呼び出しログを出力 `specs/008-skill-creator-setup/artifacts/install.log`

**チェックポイント**: 基盤準備完了 - ユーザーストーリー実装を開始可能

---

## Phase 3: ユーザーストーリー1 - Skill Creator基本構造の導入（優先度: P1）🎯 MVP

**ゴール**: `.github/skills/skill-creator/`に必須のトップレベル構造と主要ファイルを配置する

**独立テスト**: `tree -L 2 .github/skills/skill-creator`で`SKILL.md`/`LICENSE.txt`と必須ディレクトリ群が確認できる

### ユーザーストーリー1の実装

- [X] T009 [US1] インストーラを実行し`.github/skills/skill-creator/`とルートファイル（`SKILL.md`, `LICENSE.txt`）を配置 `scripts/skill-creator/install-skill-creator.sh`
- [X] T010 [P] [US1] `.github/skills/skill-creator/agents/`とエージェントファイルが存在することを確認（`analyzer.md`, `comparator.md`, `grader.md`）
- [X] T011 [P] [US1] `.github/skills/skill-creator/references/`と`.github/skills/skill-creator/references/schemas.md`が存在することを確認
- [X] T012 [P] [US1] `.github/skills/skill-creator/eval-viewer/`と`.github/skills/skill-creator/assets/`が存在することを確認
- [X] T013 [US1] 構造検証の出力を保存 `specs/008-skill-creator-setup/artifacts/us1-structure.txt` via `scripts/skill-creator/verify-structure.sh`

**チェックポイント**: ユーザーストーリー1が完全に機能し独立検証可能であること

---

## Phase 4: ユーザーストーリー2 - 評価・改善ツールの配置（優先度: P2）

**ゴール**: 評価・改善用Pythonスクリプト群を利用可能な状態にする

**独立テスト**: 必須スクリプトが存在し、`quick_validate.py`が実行できる

### ユーザーストーリー2の実装

- [X] T014 [P] [US2] 評価スクリプトが存在することを確認 `.github/skills/skill-creator/scripts/`（`run_eval.py`, `run_loop.py`, `improve_description.py`, `aggregate_benchmark.py`）
- [X] T015 [P] [US2] サポートスクリプトが存在することを確認 `.github/skills/skill-creator/scripts/`（`generate_report.py`, `package_skill.py`, `quick_validate.py`, `utils.py`, `__init__.py`）
- [X] T016 [US2] Pythonスクリプトに実行権限を付与 `.github/skills/skill-creator/scripts/*.py`と`.github/skills/skill-creator/eval-viewer/generate_review.py` via `scripts/skill-creator/set-executable.sh`
- [X] T017 [US2] スモーク検証コマンドを実行し出力を保存 `specs/008-skill-creator-setup/artifacts/us2-quick-validate.txt`
- [X] T018 [US2] スクリプト一覧と実行権限の状態を記録 `specs/008-skill-creator-setup/artifacts/us2-script-inventory.txt`

**チェックポイント**: ユーザーストーリー1と2が両方とも独立動作すること

---

## Phase 5: ユーザーストーリー3 - ドキュメントと参照資料の整備（優先度: P3）

**ゴール**: ビューアと参照資料を利用者がすぐ辿れる形にする

**独立テスト**: `eval-viewer`関連ファイルと参照資料が確認でき、quickstart手順で再現可能

### ユーザーストーリー3の実装

- [X] T019 [US3] `.github/skills/skill-creator/eval-viewer/viewer.html`と`.github/skills/skill-creator/eval-viewer/generate_review.py`がアクセス可能であることを検証し結果を記録 `specs/008-skill-creator-setup/artifacts/us3-viewer-check.txt`
- [X] T020 [P] [US3] `.github/skills/skill-creator/assets/eval_review.html`と`.github/skills/skill-creator/references/schemas.md`を検証し記録 `specs/008-skill-creator-setup/artifacts/us3-reference-check.txt`
- [X] T021 [US3] 検証結果がドキュメント手順と異なる場合、オンボーディングノートを更新 `specs/008-skill-creator-setup/quickstart.md`

**チェックポイント**: 全ユーザーストーリーが独立動作すること

---

## Phase 6: 仕上げと横断的整備

**目的**: 仕上げと横断整備

- [X] T022 [P] 全検証証跡を統合 `specs/008-skill-creator-setup/artifacts/final-validation-summary.md`
- [X] T023 最終受入チェックリストと実装証跡を同期 `specs/008-skill-creator-setup/checklists/requirements.md`
- [X] T024 [P] 機能進捗ノートを更新 `specs/008-skill-creator-setup/plan.md`（実装後ステータスのみ）

---

## 依存関係と実行順序

### フェーズ依存関係

- **セットアップ (Phase 1)**: 依存なし
- **基盤 (Phase 2)**: セットアップ完了後に開始、全USをブロック
- **ユーザーストーリー (Phase 3-5)**: 基盤完了後に開始
- **仕上げ (Phase 6)**: 全US完了後に実施

### ユーザーストーリー依存関係

- **US1 (P1)**: 基盤完了後に開始、他USへの依存なし
- **US2 (P2)**: 基盤完了後に開始可能、US1成果物（配置済みディレクトリ）を利用
- **US3 (P3)**: 基盤完了後に開始可能、US1/US2の配置成果を参照

### 各ユーザーストーリー内の順序

- 配置タスク完了後に検証タスクを実施
- 検証ログを`artifacts/`へ保存して証跡化
- 各USは独立検証条件を満たした時点で完了

### 並列実行機会

- **セットアップ**: T002 と T003 は並列可能
- **基盤**: T005 と T006 は並列可能
- **US1**: T010/T011/T012 は並列可能
- **US2**: T014 と T015 は並列可能
- **US3**: T019 と T020 は並列可能（別ファイル検証）
- **仕上げ**: T022 と T024 は並列可能

---

## 並列実行例: ユーザーストーリー1

```bash
# US1 ファイル配置確認を並列実行:
Task: T010 [US1] .github/skills/skill-creator/agents/ のエージェントファイルを検証
Task: T011 [US1] .github/skills/skill-creator/references/ の参照ファイルを検証
Task: T012 [US1] eval-viewer と assets ディレクトリを検証
```

## 並列実行例: ユーザーストーリー2

```bash
# US2 スクリプト確認を並列実行:
Task: T014 [US2] .github/skills/skill-creator/scripts/ のコア評価スクリプトを検証
Task: T015 [US2] .github/skills/skill-creator/scripts/ のサポートスクリプトを検証
```

## 並列実行例: ユーザーストーリー3

```bash
# US3 ドキュメント/参照確認を並列実行:
Task: T019 [US3] eval-viewer ファイルを検証しアーティファクトに記録
Task: T020 [US3] assets と schema 参照を検証しアーティファクトに記録
```

---

## 実装戦略

### MVP優先（ユーザーストーリー1のみ）

1. Phase 1（セットアップ）を完了
2. Phase 2（基盤）を完了
3. Phase 3（US1）を完了
4. `artifacts/us1-structure.txt`で構造証跡を検証
5. MVPをデモ（skill-creator基本構造の導入）

### 段階的デリバリー

1. セットアップ + 基盤を完了
2. US1をデリバリー（構造）
3. US2をデリバリー（評価スクリプト実行可能化）
4. US3をデリバリー（参照資料とビューア導線）
5. 仕上げで証跡を統合しPR準備

### 並列チーム戦略

1. 1名が基盤を完了
2. 分担可能: US1検証・US2スクリプト整備・US3参照整備
3. 最後に仕上げで証跡を集約

---

## 注記

- [P] タスク = 別ファイルで競合しない作業
- [USx]ラベルでストーリー追跡可能
- 各USは独立検証条件を満たしてから次フェーズへ進む
- 各タスク完了時にログ/証跡を`artifacts/`へ残す
