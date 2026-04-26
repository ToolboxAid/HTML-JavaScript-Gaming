MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_8_26_MANIFEST_SSOT_AND_UNUSED_JSON_AUDIT.

IMPORTANT:
This is an audit/cleanup PR. Do not do broad UI rewrites. Do not remove files unless proven unused by import/reference/script/doc/test search.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_8_26_MANIFEST_SSOt_AND_UNUSED_JSON_AUDIT.md.
2. Read docs/pr/BUILD_PR_LEVEL_8_26_MANIFEST_SSOt_AND_UNUSED_JSON_AUDIT.md.
3. Create/update docs/dev/reports/level_8_26_user_blockers.md with all blocker questions and decisions.
4. Audit root files:
   - workspace.manifest.json
   - package.json
   - package-lock.json
5. Confirm package.json/package-lock.json root purpose in report; do not move them.
6. Audit manifest SSoT conflicts:
   - games/**/assets/tools.manifest.json
   - games/**/assets/workspace.asset-catalog.json
   - game/workspace project JSON
7. For each game, report:
   - referenced JSON assets
   - unreferenced JSON assets
   - duplicate/overlapping references
   - proposed SSoT target
8. Specifically audit Asteroids:
   - games/Asteroids/assets/images/bezel.stretch.override.json
   - games/Asteroids/assets/palettes/asteroids-classic.palette.json
   - games/Asteroids/assets/palettes/hud.json
9. Normalize palette swatch hex:
   - #RRGGBBFF -> #RRGGBB
   - keep #RRGGBBAA when AA != FF
10. Audit deletion candidates:
   - tools/codex/sample_maaping_example.json
   - tools/dev/checkPhase24*
   - tools/dev/checkSharedExt*.json
   - tools/samples/*
   - tools/shared/samples/*
   - other unused JSON under tools/
11. Delete only if unused by imports, scripts, docs, tests, samples, games, and tool registry references.
12. Add a follow-up plan for removing sample dropdown/selects from tools and migrating any tool-local samples to /samples/phase-*.
13. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only:
   - [ ] -> [.] or [.] -> [x] only
   - no prose rewrite/delete
14. Do not modify runtime code unless only manifest wiring of existing data is required and safe.
15. Do not add validators.
16. Do not modify start_of_day.
17. Return a delta ZIP at:
   tmp/BUILD_PR_LEVEL_8_26_MANIFEST_SSOt_AND_UNUSED_JSON_AUDIT_delta.zip

ACCEPTANCE:
- User blockers captured.
- Manifest SSoT audit complete.
- Unused JSON audit complete.
- Palette alpha normalization complete or zero-change reported.
- No runtime rewrite.
- No start_of_day changes.
