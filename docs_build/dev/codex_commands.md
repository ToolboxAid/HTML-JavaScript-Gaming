# Codex Commands

Task:

- `PR_26154_016-final-theme-engine-removal-and-active-structure-cleanup`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted `Get-ChildItem` and `Get-Content` inspection for:
  - `assets/theme/v1/`
  - `assets/theme/v2/images/`
  - `assets/theme/v2/css/theme/v2/`
  - `src/engine/theme/`
  - `src/engine/ui/toolboxaid-header.html`
  - `tools/shared/tooling/CapturePreviewRuntime.js`
  - `tools/dev/checkStyleSystemGuard.mjs`
  - `tools/dev/checkSharedExtractionGuard.baseline.json`
- Targeted ownership inventory for:
  - `tools/`
  - `old-tools/`
  - `games/`
  - `old_games/`
  - `old_samples/`
  - `docs/`
  - `docs_build/`
- Targeted active stale-reference checks for:
  - `GameFoundryStudio/`
  - `src/engine/theme/`
  - `assets/theme/v1/`
  - `favicon.ico`
- Moved `assets/theme/v1/images/toolboxaid-header.png` to `assets/theme/v2/images/toolboxaid-header.png`.
- Updated `src/engine/ui/toolboxaid-header.html`.
- Updated `tools/shared/tooling/CapturePreviewRuntime.js`.
- Updated `tools/dev/checkStyleSystemGuard.mjs`.
- Updated `tools/dev/checkSharedExtractionGuard.baseline.json`.
- Deleted `assets/theme/v1/`.
- Deleted `src/engine/theme/`.
- `node tools/dev/checkStyleSystemGuard.mjs`
- `node --check tools/shared/tooling/CapturePreviewRuntime.js`
- `node --check tools/dev/checkStyleSystemGuard.mjs`
- Node static validation for changed HTML, JS, CSS, JSON, and Markdown files.
- `git diff --check`
- `git status --short -- start_of_day old-tools old_games old_samples`
- `npm run codex:review-artifacts`
- ZIP packaging for `tmp/PR_26154_016-final-theme-engine-removal-and-active-structure-cleanup_delta.zip`

Validation summary:

- PASS `assets/theme/v1/` removed.
- PASS `src/engine/theme/` removed.
- PASS active header image now resolves from `assets/theme/v2/images/toolboxaid-header.png`.
- PASS no active stale references remain for `GameFoundryStudio/`, `src/engine/theme/`, `assets/theme/v1/`, or `favicon.ico`.
- PASS active structure inventory completed for active and deprecated ownership areas.
- PASS `node tools/dev/checkStyleSystemGuard.mjs`.
- PASS syntax checks for changed JS files.
- PASS static validation for changed HTML, JS, CSS, JSON, and Markdown files.
- PASS `git diff --check`.
- PASS no `start_of_day/`, `old-tools/`, `old_games/`, or `old_samples/` changes.
- PASS review artifact generation.
- PASS repo-structured delta ZIP packaging.
- SKIPPED `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED old tools, old games, old samples, and full samples smoke validation per request.
