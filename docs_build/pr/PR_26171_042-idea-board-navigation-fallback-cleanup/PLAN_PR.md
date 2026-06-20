# PR_26171_042-idea-board-navigation-fallback-cleanup Plan

## Purpose

Fix the optional Tool Display Mode navigation fallback so Idea Board stays clean and usable when registry-backed previous/next navigation cannot load.

## Scope

- Remove the creator-visible Tool Display Mode navigation fallback diagnostic.
- Keep navigation failures logged to the browser console.
- Preserve Idea Board lifecycle, filtering, project, archive, chevron, and row editing behavior.
- Validate API-backed and static/no-registry Idea Board rendering.
- Update final Codex reports with non-pending Git workflow fields.

## Required Validation

- `node --check assets/theme-v2/js/tool-display-mode.js`
- `node --check toolbox/idea-board/index.js`
- Targeted Idea Board Playwright.
- Targeted Toolbox route Playwright for Idea Board.
- `npm run test:workspace-v2`
- Do not run full samples smoke.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required Delivery

- Commit changes.
- Push branch.
- Create PR.
- Merge after validation passes.
- Return to main and pull latest main.
- Produce repo-structured ZIP under `tmp/`.
