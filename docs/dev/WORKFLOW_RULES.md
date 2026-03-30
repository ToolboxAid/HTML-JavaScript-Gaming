# Repo Workflow Rules

## Core Workflow
All work follows:

PLAN_PR → BUILD_PR → APPLY_PR

- Docs-first always
- One PR = one purpose
- No implementation code in PLAN/BUILD (Codex writes code)
- Preserve public/internal/transitional boundaries
- No destructive or runtime-breaking changes unless explicitly approved

---

## PR Document Location (REQUIRED)
All PR documents MUST be located in:

/docs/pr/

No exceptions.

---

## ZIP Output Rules (CRITICAL)

All generated ZIP artifacts MUST use:

<project folder>/tmp/<ZIP_NAME>.zip

Example:
<project folder>/tmp/BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT_delta.zip

NOT:
- /tmp/<ZIP_NAME>.zip
- any absolute system temp path

Reason:
- Keeps artifacts inside repo workspace
- Supports consistent Codex + VS Code workflows
- Enables easy drag/drop and version tracking

---

## ZIP Content Rules

Each ZIP must:
- Preserve exact repo-relative structure
- Include ONLY files relevant to the PR
- Exclude:
  - full repo copies
  - dependencies
  - build artifacts

---

## BUILD Output Requirements

Every BUILD_PR bundle must include:

- docs/pr/<PR_NAME>.md
- supporting docs under docs/pr/
- docs/dev/CODEX_COMMANDS.md
- docs/dev/COMMIT_COMMENT.txt
- docs/dev/NEXT_COMMAND.txt

---

## Codex Responsibility

Codex is responsible for:
- ALL implementation code
- Creating/modifying src/ files

This workflow produces:
- plans
- contracts
- instructions

NOT code (unless explicitly requested)

---

## Execution Model

You DO NOT execute CODEX_COMMANDS.md.

You:
1. Open Codex in repo
2. Copy command from docs/dev/CODEX_COMMANDS.md
3. Paste into Codex
4. Let Codex perform implementation

---

## Design Constraints

- No engine core API changes in PLAN/BUILD stages
- All composition via public APIs
- Event-driven architecture enforced
- State mutation must be controlled (transitions only)

---

## Philosophy

You = Architect  
Codex = Builder  

Docs are the source of truth.
