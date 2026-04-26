# Codex Commands — BUILD_PR_LEVEL_20_11_RECOVERY_STATUS_GATE

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
Medium

## Command

```text
Execute BUILD_PR_LEVEL_20_11_RECOVERY_STATUS_GATE.

Purpose:
Update recovery roadmap status only.

Allowed:
- create/update docs/dev/roadmaps/MASTER_ROADMAP_RECOVERY.md
- create docs/dev/reports/recovery_status_gate.md

Forbidden:
- implementation code
- runtime changes
- git reset
- roadmap rewrite outside recovery roadmap
- start_of_day changes

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_11_RECOVERY_STATUS_GATE.zip
```
