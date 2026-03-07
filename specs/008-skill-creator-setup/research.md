# Research: Anthropic Skill Creator導入

## Decision 1: 導入元はAnthropic公式リポジトリの`skills/skill-creator`を採用

- Decision: `https://github.com/anthropics/skills/tree/main/skills/skill-creator`を唯一の正本として利用する。
- Rationale: 公式配布物をそのまま取り込むことで、内容の信頼性と更新追従性を確保できる。
- Alternatives considered:
  - 手動で必要ファイルだけ再構成: ファイル欠落・差分混入リスクが高いため不採用。
  - サードパーティ配布ミラー利用: 出所保証が弱いため不採用。

## Decision 2: 配置先は`.github/skills/skill-creator/`に固定

- Decision: GitHub Copilotの公式スキル検出パス`.github/skills/`配下に`skill-creator/`を作成し、上流構造を保持する。
- Rationale: GitHub Copilotがスキルを自動認識できるパス（`.github/skills/`, `.agents/skills/`, `.claude/skills/`）のうち、既存の`.github/`ディレクトリと整合性が高い`.github/skills/`を選択。将来の複数スキル追加時にも命名規則が明確。
- Alternatives considered:
  - `skills/`配下へ配置: Copilotがスキルとして認識しないため不採用。
  - `.agents/skills/`配下へ配置: `.agents/`ディレクトリがまだ存在せず、`.github/`の方が既存構造と整合するため不採用。
  - `specs/`配下へ同居: 実行資産と仕様証跡の責務分離に反するため不採用。

## Decision 3: 導入検証は「構造確認 + 最小実行確認」の2段階

- Decision: 1) ディレクトリ/ファイル存在確認、2) Pythonスクリプトの最小スモーク確認を採用する。
- Rationale: 導入機能の受け入れ条件は可観測であることが重要で、完全な機能検証よりも再現可能性を優先する。
- Alternatives considered:
  - すべてのスクリプト実行テスト: 外部依存（モデル実行環境）を必要とし不安定なため不採用。
  - ファイル存在確認のみ: 実行可能性担保が弱いため不採用。

## Decision 4: 実行権限はPythonスクリプトに明示付与

- Decision: `scripts/*.py`へ実行権限を付与する方針を採用する。
- Rationale: 環境差異でshebang直実行が失敗するリスクを下げ、手順書の再現性を高める。
- Alternatives considered:
  - `python <script>`実行のみを前提: 毎回明示が必要で運用負荷が上がるため不採用。
  - 権限未設定: 実行失敗の原因切り分けが難しくなるため不採用。

## Decision 5: ライセンス情報を保持

- Decision: 上流の`LICENSE.txt`を導入対象に含める。
- Rationale: 再配布・参照時のライセンス追跡性を維持するため。
- Alternatives considered:
  - ライセンスファイル省略: コンプライアンス観点で不適切なため不採用。

## Clarifications Resolved

- `NEEDS CLARIFICATION`項目: なし（Technical Contextで必要情報をすべて確定済み）。
- 本機能は外部API契約を新設しないため、契約は「導入後のローカル構造・検証手順」に限定して定義する。
