# PLAN_PR_LEVEL_8_26_MANIFEST_SSOT_AND_UNUSED_JSON_AUDIT

## Purpose
Add the user-raised blockers to the Level 8 blocker list and create a focused Codex audit/cleanup plan for manifest SSoT, game asset references, palette normalization, and unused JSON/tool sample cleanup.

## Scope
- Audit root/package files.
- Resolve workspace/sample manifest boundary.
- Decide and document manifest SSoT for workspace/games/tools/assets.
- Audit Asteroids first, then apply same checks to all games.
- Audit unused JSON and sample-in-tool folders.
- Normalize palette hex alpha suffixes.
- Advance roadmap by status only.

## Non-Goals
- No runtime rewrite unless required to wire an existing file that is already intended to be used.
- No validators.
- No `start_of_day` changes.
- No deletion without a report proving unused/stale status.
