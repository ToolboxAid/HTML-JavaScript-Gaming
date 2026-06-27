# PR_26174_ALFA_000-projectinstructions-archive-ignore

## Purpose

Add `docs_build/dev/ProjectInstructions.zip` to `.gitignore` so the generated Project Instructions archive does not dirty the worktree.

## Scope

- Updated `.gitignore` only for executable/repository behavior.
- Added required Codex report files under `docs_build/dev/reports/`.
- ZIP artifact path: `tmp/PR_26174_ALFA_000-projectinstructions-archive-ignore_delta.zip`.

## Validation Result

PASS. The exact ignore entry exists once, branch context is correct, and changed files are limited to `.gitignore` plus required reports.
