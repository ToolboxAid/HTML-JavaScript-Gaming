# PR_26171_042-idea-board-navigation-fallback-cleanup Build

## Source Of Truth

Use the user request for `PR_26171_042-idea-board-navigation-fallback-cleanup`, `docs_build/dev/PROJECT_INSTRUCTIONS.md`, `docs_build/dev/PROJECT_MULTI_PC.txt`, and this BUILD doc.

## Singular Purpose

Clean up the optional Tool Display Mode navigation fallback for Idea Board without changing Idea Board table behavior.

## Exact Targets

- `assets/theme-v2/js/tool-display-mode.js`
- `toolbox/idea-board/index.js`
- `tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `docs_build/pr/PR_26171_042-idea-board-navigation-fallback-cleanup/PLAN_PR.md`
- `docs_build/pr/PR_26171_042-idea-board-navigation-fallback-cleanup/BUILD_PR.md`
- `docs_build/pr/PR_26171_042-idea-board-navigation-fallback-cleanup/APPLY_PR.md`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Requirements

- Do not show creator-visible navigation diagnostics when optional Tool Display Mode navigation cannot load.
- Remove the visible message `Tool navigation is temporarily unavailable. Refresh the page or try again shortly.`
- Keep Idea Board usable when the navigation registry cannot load.
- Log the navigation failure to console only.
- Do not mention server, API, local server, port, registry, snapshot, or implementation details in creator-facing UI.
- Do not let navigation failure affect Idea Board table functionality.
- Validate both API-backed local route and static route without registry response.
- In both cases, Idea Board renders, no creator-visible navigation error appears, and optional previous/next navigation is hidden or omitted when unavailable.
- Ensure final Codex report fields are non-pending for PR URL, merge result, final main commit, created branch, and push result.

## Explicit Non-Goals

- Do not change Idea Board lifecycle behavior.
- Do not change Show filter behavior.
- Do not change Create Project behavior.
- Do not change Archive behavior.
- Do not change Chevron behavior.
- Do not change table row editing behavior.

## Validation

- `node --check assets/theme-v2/js/tool-display-mode.js`
- `node --check toolbox/idea-board/index.js`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line --timeout=90000`
- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line -g "Idea Board launches" --timeout=90000`
- `npm run test:workspace-v2`
- `git diff --check`

## ZIP

Create `tmp/PR_26171_042-idea-board-navigation-fallback-cleanup_delta.zip` with repo-structured changed files only.
