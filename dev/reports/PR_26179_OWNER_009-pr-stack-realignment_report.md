# PR_26179_OWNER_009-pr-stack-realignment

## Purpose

Produce a no-code Owner governance plan for the remaining open PRs that require rebase, rebuild, close, or preservation decisions.

This PR does not modify runtime code, production pages, branches, or open PR state.

## Review Scope

Focused PRs:

- #228 `PR_26177_CHARLIE_018-sprites-testable-mvp-completion`
- #227 `PR_26177_CHARLIE_017-sprites-toolbox-entry-active`
- #226 `PR_26177_CHARLIE_016-sprites-playwright-final-polish`
- #225 `PR_26177_CHARLIE_015-sprites-reference-protection`
- #224 `PR_26177_CHARLIE_014-sprites-tags-categories-search`
- #223 `PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette`
- #222 `PR_26177_CHARLIE_012-sprites-library-crud`
- #221 `PR_26177_CHARLIE_011-sprites-tool-shell`
- #220 `PR_26177_CHARLIE_010-sprites-api-db-foundation`
- #219 `PR_26177_CHARLIE_009-sprites-legacy-audit-plan`
- #198 `PR_26176_006 Alfa Tool Display validation closeout`
- #196 `PR_26176_005 Tool Display Mode single-line layout`
- #176 `PR_26175_OWNER_055: retain legal governance leftovers`

Non-focus PR #250 `PR_26171_ALFA_009-team-aware-bootstrap` merged while this report branch was being prepared. It was not modified by this plan and remains outside the requested focus set.

## Method

Read-only GitHub inspection was performed with `gh pr view`, `gh pr list`, GitHub compare data against `main`, and review-thread checks.

Evidence captured:

- base branch
- head branch
- draft status
- merge state
- mergeability
- CI/check rollup
- unresolved review conversations
- ahead/behind counts relative to `main`
- changed-file roots

## Executive Recommendation

Do not merge any focused PR in its current state.

The Charlie Sprites stack and the Tool Display pair were created before the current repository structure and are substantially behind `main`. Many still reference obsolete `docs_build/` paths and several are based on other PR branches instead of `main`.

Recommended governance action:

1. Close stale report/audit-only PRs.
2. Rebuild implementation PRs from current `main` using canonical paths.
3. Preserve useful intent and test evidence in recreated PRs.
4. Do not rebase old branches unless the PR has no obsolete path references and no scope overlap.

## PR-by-PR Realignment Plan

| PR | Current State | Evidence | Recommendation | Owner Action |
| ---: | --- | --- | --- | --- |
| #228 | Draft, conflicting, 115 behind `main`, 3 commits ahead | Touches `assets/`, `src/`, `tests/`, `toolbox/`, and obsolete `docs_build/` reports | Rebuild | Recreate from current `main` after lower Sprites dependencies are rebuilt and merged. Preserve the Creator-testable completion intent, but do not rebase this branch. |
| #227 | Draft, conflicting, 115 behind `main`, 2 commits ahead | Touches local API/tool metadata/tests and obsolete `docs_build/` reports | Rebuild | Recreate from current `main` after the Sprites tool shell and metadata path are current. Preserve route/toolbox-entry intent only. |
| #226 | Draft, clean against PR base, 117 behind `main`, target is #225 branch | Targets a PR branch, not `main`; includes obsolete `docs_build/` reports | Rebuild | Close/recreate after #225 replacement lands. Do not merge as stacked branch targeting another open PR. |
| #225 | Draft, clean against PR base, 117 behind `main`, target is #224 branch | Targets a PR branch, not `main`; touches Sprites UI/test files plus obsolete reports | Rebuild | Recreate from current `main` after #224 replacement lands. Preserve reference-protection behavior and tests. |
| #224 | Draft, clean against PR base, 117 behind `main`, target is #223 branch | Targets a PR branch, not `main`; touches Sprites UI/test files plus obsolete reports | Rebuild | Recreate from current `main` after #223 replacement lands. Preserve tags/categories/search intent only. |
| #223 | Draft, clean against PR base, 117 behind `main`, target is #222 branch | Targets a PR branch, not `main`; touches Sprites UI/test files plus obsolete reports | Rebuild | Recreate from current `main` after #222 replacement lands. Preserve import/preview/metadata/palette intent only. |
| #222 | Draft, clean against PR base, 117 behind `main`, target is #221 branch | Targets a PR branch, not `main`; touches Sprites UI/test files plus obsolete reports | Rebuild | Recreate from current `main` after #221 replacement lands. Preserve library CRUD intent and tests. |
| #221 | Draft, conflicting, 117 behind `main`, no current checks | Base `main`, but conflicts and obsolete reports remain | Rebuild | Recreate from current `main` after #220 replacement lands. Do not rebase because no checks and path drift are present. |
| #220 | Draft, conflicting, 117 behind `main`, 1 commit ahead | Touches DB/API/test files and obsolete `docs_build/database` / `docs_build/dev` paths | Rebuild first | Recreate from current `main` using canonical `dev/build/database/`, `dev/tests/`, and `dev/reports/` paths. This is the first active Sprites implementation dependency. |
| #219 | Draft, conflicting, 117 behind `main`, report-only audit plan | Only obsolete `docs_build/dev/reports` files | Close | Close as superseded by the later Sprites implementation stack. Preserve any useful audit findings only if a future current-path report is needed. |
| #198 | Draft, clean against PR base, 200 behind `main`, target is #196 branch | Report-only validation closeout based on stale Tool Display branch | Close or rebuild after #196 | Close if #196 is abandoned. If Tool Display is rebuilt, create a new validation closeout from current `main` only after the rebuilt implementation PR exists. |
| #196 | Draft, conflicting, 200 behind `main`, no current checks | Touches theme CSS/JS/tests and obsolete `docs_build` reports | Rebuild | Recreate from current `main` if the single-line Tool Display change is still desired. Do not rebase the stale branch. |
| #176 | Open, conflicting, 200 behind `main`, 5 unresolved threads | Retains legal governance leftovers in obsolete `docs_build/` paths | Close or recreate | Close unless Owner still needs the legal governance content. If needed, recreate from current `main` under canonical `dev/build/` or production `docs/` ownership after resolving review feedback. |

## Recommended Dependency Order

### Charlie Sprites

Recommended rebuild order:

1. #220 replacement: Sprites API/database foundation
2. #221 replacement: Sprites tool shell
3. #222 replacement: Sprites library CRUD
4. #223 replacement: import, preview, metadata, palette
5. #224 replacement: tags, categories, search
6. #225 replacement: reference protection
7. #226 replacement: Playwright final polish
8. #227 replacement: toolbox entry active
9. #228 replacement: testable MVP completion

Current #219 should be closed before this rebuild sequence begins.

### Tool Display

Recommended sequence:

1. Decide whether the Tool Display single-line layout remains desired.
2. If yes, rebuild #196 from current `main`.
3. Recreate #198 only if a separate validation closeout is still useful after the #196 replacement.

### Legal Governance Leftovers

Recommended sequence:

1. Resolve whether the content in #176 is still needed.
2. If not needed, close #176.
3. If needed, recreate from current `main` with canonical paths and resolved review feedback.

## Duplicate Or Overlapping Implementations

- #220 through #228 overlap as a single Sprites implementation chain and should be managed as one ordered rebuild.
- #227 and #228 overlap with earlier Sprites tool metadata, route, and UI work; they should not be rebuilt until lower dependencies land.
- #196 and #198 are a stale Tool Display implementation/validation pair.
- #176 overlaps with already-completed repository restructuring because it uses obsolete `docs_build/` locations.

## Branch And Target Issues

PRs targeting a non-main branch:

- #222 targets `PR_26177_CHARLIE_011-sprites-tool-shell`
- #223 targets `PR_26177_CHARLIE_012-sprites-library-crud`
- #224 targets `PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette`
- #225 targets `PR_26177_CHARLIE_014-sprites-tags-categories-search`
- #226 targets `PR_26177_CHARLIE_015-sprites-reference-protection`
- #198 targets `PR_26176_005-tool-display-mode-single-line-layout`

These should not be merged as-is under current governance.

## Merge Risk

High-risk PRs:

- #228, #227, #221, #220, #196, and #176 because they are conflicting.
- #176 because it also has unresolved review conversations.
- #220 because it touches database/API paths and must be rebuilt using current Postgres/API governance.

Medium-risk PRs:

- #222 through #226 because they are clean only against stale PR branches and are far behind current `main`.
- #198 because it is report-only but depends on stale #196.

Low-risk closure:

- #219, because it is report-only and superseded by later Sprites work.

## Owner Action Queue

1. Close #219 after confirming no unique audit content needs preservation.
2. Decide whether #176 content is still needed; close or recreate.
3. Decide whether #196 Tool Display work is still desired.
4. Rebuild #220 from current `main` before any other Sprites implementation PR.
5. Rebuild each remaining Sprites PR one at a time from current `main`.
6. Treat merged #250 as current `main` baseline context only; it is not part of the requested focus set.

## No-Code Confirmation

This PR is documentation/governance only.

No runtime code, production page, API, database, branch, or GitHub PR state changes are included in this PR.
