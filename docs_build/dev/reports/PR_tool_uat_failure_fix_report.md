# PR Tool UAT Failure Fix Report

Date: 2026-04-28

## Scope
Fix only previously failed interactive UAT items for:
- Vector Map Editor
- Vector Asset Studio
- Sprite Editor

No State Inspector behavior changes were made.

## Changed Files
- toolbox/Vector Map Editor/editor/VectorMapEditorApp.js
- toolbox/Vector Asset Studio/main.js
- toolbox/Sprite Editor/modules/spriteEditorApp.js

## Validation Commands
1. `node --check toolbox/Vector Map Editor/editor/VectorMapEditorApp.js`
- PASS

2. `node --check toolbox/Vector Asset Studio/main.js`
- PASS

3. `node --check toolbox/Sprite Editor/modules/spriteEditorApp.js`
- PASS

4. `npm run test:launch-smoke -- --tools`
- PASS (286/286)
- Report: `docs_build/dev/reports/launch_smoke_report.md`

5. Focused rerun of previously failing interactive UAT cases
- PASS (6/6)
- Evidence: `tmp/uat_failed_cases_rerun.json`

## Failed-Case Rerun Coverage
- Vector Map Editor sample 1212: explicit visible no-selection state verified
- Vector Asset Studio sample 0901: load + control readiness verified
- Vector Asset Studio sample 1204: load + control readiness verified
- Vector Asset Studio sample 1208: load + control readiness verified
- Vector Asset Studio VS-005: actionable invalid/incomplete-state message verified
- Sprite Editor VS-005: actionable invalid-state message verified

## Remaining Issues
- None observed in the targeted rerun set.
