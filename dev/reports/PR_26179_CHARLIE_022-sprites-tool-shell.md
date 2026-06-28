# PR_26179_CHARLIE_022-sprites-tool-shell

Team: CHARLIE
Date: 2026-06-28
Branch: PR_26179_CHARLIE_022-sprites-tool-shell
Scope: Sprite Creator shell only

## Summary

Updated the existing Sprites placeholder page into a Theme V2-compliant Sprite Creator shell. The shell is public Creator-facing and provides the requested left tools panel, center pixel work area placeholder, right sprite details / animation placeholder, and status area.

The current repository did not contain `docs_build/tool-planning/sprites/`, and no local/remote/GitHub branch named `PR_26179_CHARLIE_021` was available during startup. This PR did not merge, cherry-pick, or copy stale PR #219-#228 implementation code.

## Changed Files

- toolbox/sprites/index.html
- src/shared/toolbox/tool-metadata-inventory.js
- dev/tests/playwright/tools/SpritesToolShell.spec.mjs
- dev/reports/PR_26179_CHARLIE_022-sprites-tool-shell.md
- dev/reports/codex_changed_files.txt
- dev/reports/codex_review.diff

## Branch Validation

PASS

- Current branch: `PR_26179_CHARLIE_022-sprites-tool-shell`
- Started from `main`
- Scope remained shell-only
- No `start_of_day` files changed
- No runtime/API/database schema files changed
- No browser-owned product data added

## Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Read `docs_build/tool-planning/sprites/` from PR_26179_CHARLIE_021 | WARN | Folder/branch was unavailable in local, remote, and GitHub searches; proceeded without stale code. |
| Do not merge/cherry-pick/copy stale PR #219-#228 code | PASS | Implemented shell directly from current main patterns. |
| Update `toolbox/sprites/index.html` placeholder | PASS | Replaced placeholder-only copy with Sprite Creator shell. |
| Use public Creator-facing language | PASS | Page title and copy use Sprite Creator / Sprites language. |
| Theme V2 classes first | PASS | Uses existing container, page-title, tool-workspace, tool-column, accordion, card, table, status, and mini-stat classes. |
| No inline styles/style blocks/script blocks/inline handlers | PASS | Static scan found no violations. |
| External JS only if needed | PASS | Only existing Theme V2 external scripts are used. |
| Add navigation only if required | PASS | No catalog route change required; metadata label updated for the existing Sprites route. |
| No browser-owned product data | PASS | Shell contains static placeholders only; no persistence or authored data arrays. |
| No Local DB schema/API endpoints/key generation | PASS | No database/API/runtime changes. |
| Left panel tools placeholder | PASS | Visible Sprite Tools region with Drawing Tools, Canvas Setup, and Palette Source. |
| Center pixel work area placeholder | PASS | Visible Pixel Work Area with static grid placeholder. |
| Right details/animation placeholder | PASS | Visible Sprite Details and Animation regions. |
| Footer/status area | PASS | Visible shell status card. |
| Targeted shell test | PASS | Added `SpritesToolShell.spec.mjs`. |

## Validation Lane Report

PASS with one environment note.

Commands run:

```text
node --check src/shared/toolbox/tool-metadata-inventory.js
node --check dev/tests/playwright/tools/SpritesToolShell.spec.mjs
git diff --check -- toolbox/sprites/index.html src/shared/toolbox/tool-metadata-inventory.js dev/tests/playwright/tools/SpritesToolShell.spec.mjs
rg --pcre2 -n -i "Not implemented yet|future rebuild work|Static wireframe only|Plan sprite creation|<style|style=|<script(?![^>]+src=)|on(click|change|submit|input|load|error)=" toolbox/sprites/index.html
npx playwright test dev/tests/playwright/tools/SpritesToolShell.spec.mjs --workers=1 --reporter=list
```

Results:

- Node syntax checks: PASS
- `git diff --check`: PASS
- Placeholder/inline-style scan: PASS, no matches
- Targeted Playwright: PASS, 1 test passed

Environment note: `node_modules` was absent initially. `npm ci` was run using the committed lockfile so the declared `@playwright/test` dependency could execute the targeted test. No package metadata was changed.

## Manual Validation Notes

1. Open `/toolbox/sprites/index.html`.
2. Confirm the page title reads `Sprite Creator`.
3. Confirm the left panel shows Sprite Tools, Drawing Tools, Canvas Setup, and Palette Source.
4. Confirm the center panel shows Pixel Work Area and the static Pixel Grid placeholder.
5. Confirm the right panel shows Sprite Details, Animation, and Readiness sections.
6. Confirm the status card says the shell is ready and that save/load/data contracts remain later scoped work.
7. Confirm no visible `Not implemented yet`, `future rebuild work`, `Static wireframe only`, or `Plan sprite creation` wording remains.

## ZIP Artifact

`tmp/PR_26179_CHARLIE_022-sprites-tool-shell_delta.zip`
