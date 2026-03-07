# Contract: Skill Creator Installation Contract

## Purpose

`.github/skills/skill-creator/`導入後に満たすべき最小契約（構造・必須ファイル・検証手順）を定義する。

## Contract Surface

### Required Directories

- `.github/skills/skill-creator/agents/`
- `.github/skills/skill-creator/scripts/`
- `.github/skills/skill-creator/references/`
- `.github/skills/skill-creator/eval-viewer/`
- `.github/skills/skill-creator/assets/`

### Required Files

- `.github/skills/skill-creator/SKILL.md`
- `.github/skills/skill-creator/LICENSE.txt`
- `.github/skills/skill-creator/references/schemas.md`
- `.github/skills/skill-creator/scripts/run_eval.py`
- `.github/skills/skill-creator/scripts/run_loop.py`
- `.github/skills/skill-creator/scripts/improve_description.py`
- `.github/skills/skill-creator/scripts/aggregate_benchmark.py`

## Verification Commands

```bash
tree -L 2 .github/skills/skill-creator
python3 .github/skills/skill-creator/scripts/quick_validate.py .github/skills/skill-creator
```

## Expected Outcomes

- `tree`出力にrequired directories/filesが含まれること
- `quick_validate.py`が終了コード0で完了すること

## Non-Goals

- `claude -p`を使う統合評価は本契約の範囲外
- ベンチマーク結果品質の保証は本契約の範囲外
