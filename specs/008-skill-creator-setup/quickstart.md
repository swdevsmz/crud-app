# Quickstart: Anthropic Skill Creator導入

## 1. 前提条件

- `git` が利用可能
- `python3` が利用可能
- リポジトリルート: `/workspaces/crud-app`

## 2. 導入

```bash
cd /workspaces/crud-app
mkdir -p .github/skills
cd .github/skills

git clone --depth 1 --filter=blob:none --sparse https://github.com/anthropics/skills.git temp-skills
cd temp-skills
git sparse-checkout set skills/skill-creator

cd ..
rm -rf skill-creator
mv temp-skills/skills/skill-creator ./skill-creator
rm -rf temp-skills
```

## 3. 実行権限設定（推奨）

```bash
cd /workspaces/crud-app
chmod +x .github/skills/skill-creator/scripts/*.py
chmod +x .github/skills/skill-creator/eval-viewer/generate_review.py
```

## 4. 検証

```bash
cd /workspaces/crud-app
tree -L 2 .github/skills/skill-creator
```

期待される主要項目:

- `SKILL.md`
- `LICENSE.txt`
- `agents/`
- `scripts/`
- `references/`
- `eval-viewer/`
- `assets/`

## 5. 最小スモーク確認

```bash
cd /workspaces/crud-app
python3 .github/skills/skill-creator/scripts/quick_validate.py .github/skills/skill-creator
```

`Skill is valid!` が出力されれば導入確認完了。
