# Codex Commands — BUILD_PR_LEVEL_20_5_RECOVERY_AUDIT_FROM_20_1_BASELINE

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.

Execute BUILD_PR_LEVEL_20_5_RECOVERY_AUDIT_FROM_20_1_BASELINE.

Baseline:
- commit: 3f7e9df
- PR: BUILD_PR_LEVEL_20_1_PHASE20_TOOL_PRESET_INTEGRATION
- commit message: Add Phase 20 numbered tool presets and sample-to-tool launch integration

Goal:
Audit every change after 3f7e9df and recommend whether to reset to 3f7e9df or clean surgically.

Hard constraints:
- No implementation code changes.
- No git reset.
- No file deletion.
- No roadmap rewrite.
- No start_of_day changes.
- Create reports only.

Run and capture these inspections:
- git status --short
- git branch --show-current
- git rev-parse HEAD
- git log 3f7e9df..HEAD --oneline --decorate --name-status
- git diff --stat 3f7e9df..HEAD
- git diff --name-status 3f7e9df..HEAD
- git diff --check 3f7e9df..HEAD
- git ls-files --others --exclude-standard

Also inspect current UAT-relevant files if present:
- games/index.html
- samples/index.html
- tools/Workspace Manager/index.html
- tools/*/index.html
- docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md

Required outputs:
- docs/dev/reports/recovery_change_audit_from_20_1.md
- docs/dev/reports/recovery_antipattern_audit_from_20_1.md
- docs/dev/reports/recovery_reset_decision_from_20_1.md
- docs/dev/reports/recovery_file_risk_list_from_20_1.md

In recovery_reset_decision_from_20_1.md include:
- recommended path
- whether reset to 3f7e9df is safer than surgical cleanup
- files to preserve
- files to discard
- files requiring manual review
- exact next APPLY_PR name
- exact reason for the recommendation

Return a ZIP artifact at:
tmp/BUILD_PR_LEVEL_20_5_RECOVERY_AUDIT_FROM_20_1_BASELINE.zip
```
