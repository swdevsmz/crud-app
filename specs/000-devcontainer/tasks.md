# Tasks: devcontainer開発環境の構築

**Input**: Design documents from `/specs/000-devcontainer/`
**Prerequisites**: `plan.md` (required), `spec.md` (required)

**Tests**: spec.md に自動テストの明示要求はないため、手動検証タスクを定義する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: タスク実行前に仕様と作業土台を確定する。

- [x] T001 Create `.devcontainer/` directory and add placeholder `.devcontainer/README.md`
- [x] T002 Review `.github/copilot-instructions.md` and record required tool baseline in `specs/000-devcontainer/plan.md`
- [x] T003 [P] Add devcontainer decision log section to `specs/000-devcontainer/plan.md` for image/tools/extensions/ports

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのユーザーストーリーに先行する共通仕様と共通設定を確定する。

**CRITICAL**: このフェーズ完了前に US1/US2 の実装を開始しない。

- [x] T004 Resolve all `[NEEDS CLARIFICATION]` items in `specs/000-devcontainer/spec.md` (base image, extra tools, extensions, ports, package manager)
- [x] T005 [P] Define Podman-compatible base settings (`name`, `image` or `build`, `remoteUser`) in `.devcontainer/devcontainer.json`
- [x] T006 [P] Define shared VS Code customization baseline (`customizations.vscode.settings`, core extensions) in `.devcontainer/devcontainer.json`
- [x] T007 Configure shared auth and mount strategy (`mounts`, SSH/Git settings) in `.devcontainer/devcontainer.json`
- [x] T008 Configure shared lifecycle commands (`postCreateCommand`, optional `postStartCommand`) in `.devcontainer/devcontainer.json`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - 新規参加者が数分で開発開始できる (Priority: P1) 🎯 MVP

**Goal**: クローン直後に `Reopen in Container` だけで、コーディング可能な最小開発環境を提供する。

**Independent Test**: 新規クローン環境で `Reopen in Container` 実行後、`node --version` が `v22.x`、`npm --version` と `gh --version` が成功し、必須拡張が自動インストールされる。

### Implementation for User Story 1

- [ ] T009 [US1] Configure Node.js 22 and core tool availability (`npm`, `git`, `gh`) in `.devcontainer/devcontainer.json`
- [ ] T010 [P] [US1] Add optional tool installation steps (Terraform/AWS CLI/Prisma/pnpm) in `.devcontainer/devcontainer.json` based on resolved spec
- [ ] T011 [P] [US1] Configure required forward ports (`3000`, `3001`, `5555`, and approved extras) in `.devcontainer/devcontainer.json`
- [ ] T012 [US1] Document first-time setup and verification steps in `.devcontainer/README.md`
- [ ] T013 [US1] Execute and document acceptance verification checklist in `specs/000-devcontainer/tasks.md` for FR-1 to FR-5

**Checkpoint**: US1 は単独で動作し、新規参加者の初期セットアップが完了できる。

---

## Phase 4: User Story 2 - 既存開発者が環境リセット後に再開できる (Priority: P2)

**Goal**: コンテナ削除・再ビルド後でも同じ開発体験を再現し、作業再開できるようにする。

**Independent Test**: 既存環境のコンテナ/イメージ削除後に `Rebuild Container` を実行し、ツール、拡張機能、Git 認証引き継ぎ、ポート設定が維持される。

### Implementation for User Story 2

- [ ] T014 [US2] Add rebuild/reset workflow and validation commands to `.devcontainer/README.md`
- [ ] T015 [P] [US2] Add troubleshooting section for Podman-specific rebuild/auth/port issues in `.devcontainer/README.md`
- [ ] T016 [US2] Validate Git/SSH/GitHub CLI auth persistence after rebuild and capture result in `specs/000-devcontainer/tasks.md`
- [ ] T017 [P] [US2] Validate extension reinstallation and port forwarding persistence after rebuild and capture result in `specs/000-devcontainer/tasks.md`
- [ ] T018 [US2] Validate NFR startup/build time targets and record measured values in `.devcontainer/README.md`

**Checkpoint**: US2 は単独で動作し、環境リセット後の再現性が確認できる。

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 全体品質を仕上げ、仕様成果物の整合を取る。

- [ ] T019 [P] Align final deliverables list across `specs/000-devcontainer/spec.md`, `specs/000-devcontainer/plan.md`, and `specs/000-devcontainer/tasks.md`
- [ ] T020 Run final end-to-end verification from `specs/000-devcontainer/spec.md` and update completion notes in `specs/000-devcontainer/tasks.md`
- [ ] T021 [P] Perform wording cleanup and remove stale notes in `.devcontainer/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし、すぐ開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後に実施、全ユーザーストーリーをブロック
- **Phase 3 (US1)**: Phase 2 完了後に開始可能
- **Phase 4 (US2)**: Phase 2 完了後に開始可能（推奨順序は US1 完了後）
- **Phase 5 (Polish)**: US1/US2 完了後

### User Story Dependencies

- **US1 (P1)**: Foundational 完了後に開始、他ストーリー依存なし
- **US2 (P2)**: Foundational 完了後に開始可能。実運用上は US1 の設定が入力となるため、US1 後に進める

### Within Each User Story

- 設定更新 (`.devcontainer/devcontainer.json`) → 手順書更新 (`.devcontainer/README.md`) → 手動検証記録 (`specs/000-devcontainer/tasks.md`)

### Parallel Opportunities

- Phase 1: `T003` は `T001` と並行可能
- Phase 2: `T005` と `T006` は並行可能（編集セクション分離が前提）
- US1: `T010` と `T011` は並行可能
- US2: `T015` と `T017` は並行可能
- Polish: `T019` と `T021` は並行可能

---

## Parallel Example: User Story 1

```bash
# Run in parallel after T009:
Task: "T010 [US1] Add optional tool installation steps in .devcontainer/devcontainer.json"
Task: "T011 [US1] Configure required forward ports in .devcontainer/devcontainer.json"
```

## Parallel Example: User Story 2

```bash
# Run in parallel after T014:
Task: "T015 [US2] Add troubleshooting section in .devcontainer/README.md"
Task: "T017 [US2] Validate extension and port persistence after rebuild"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks all stories)
3. Complete Phase 3: US1
4. Validate US1 independent test and stop for review/demo

### Incremental Delivery

1. Setup + Foundational を完了
2. US1 を実装して新規参加者オンボーディングを成立
3. US2 を追加してリセット/再ビルドの再現性を成立
4. Polish で成果物整合と最終検証を完了

