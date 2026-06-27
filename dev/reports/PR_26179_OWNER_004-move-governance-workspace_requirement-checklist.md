# Requirement Checklist - PR_26179_OWNER_004-move-governance-workspace

| Requirement | Status | Evidence |
| --- | --- | --- |
| Move `docs_build/` to `dev/docs_build/` | PASS | Tracked files moved; old root absent. |
| Move `archive/` to `dev/archive/` | PASS | Tracked files moved; old root absent. |
| Move/deprecate root `project-instructions/` | PASS | Moved to `dev/project-instructions/` as deprecated pointer. |
| Update references to moved governance paths | PASS | Package scripts, ProjectInstructions, dev-runtime path reads, validation scripts, and tests updated. |
| Keep `docs/` at root | PASS | Only production docs README path note changed. |
| Do not move runtime/business logic into `dev/` | PASS | Only path references and dev-tooling imports changed. |
| Do not introduce Creator-writeable repo folders | PASS | No Creator-writeable repo destination added. |
| Keep scope to governance workspace move | PASS | No feature or product behavior added. |
| Produce required reports | PASS | PR report, branch validation, checklist, validation lane, manual notes, changed files, and review diff generated. |
| Produce repo-structured ZIP | PASS | `tmp/PR_26179_OWNER_004-move-governance-workspace_delta.zip` refreshed. |
