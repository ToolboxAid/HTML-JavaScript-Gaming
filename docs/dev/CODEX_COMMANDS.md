MODEL: GPT-5.3-codex
REASONING: high

Execute BUILD_PR_LEVEL_19_21_PROJECT_INSTRUCTIONS_ROADMAP_GUARD_EMBED:

1. Open PROJECT_INSTRUCTIONS.md
2. Append the following section EXACTLY (no edits):

# BUILD_PR_LEVEL_19_20_TOOLCHAIN_ROADMAP_GUARD_ENFORCEMENT

## Purpose
Enforce the master roadmap guard for future Codex executions during the Phase 19 closeout lane.

## Mandatory Roadmap Rules
- never delete roadmap content
- never rewrite existing roadmap text
- only append new roadmap content when explicitly required by the PR
- only update status markers using:
  - [ ] -> [.]
  - [.] -> [x]

## Scope
- docs-first enforcement only
- no implementation code
- no tests
- no scripts
- no roadmap rewrite
- no roadmap replacement file in this bundle

## Codex Responsibilities
- validate any roadmap touch against the guard rules above
- reject edits that delete, shorten, paraphrase, reflow, or otherwise rewrite existing roadmap text
- if roadmap status must change for this PR, edit the existing repo roadmap in place with status-only transitions
- if no roadmap status change is execution-backed, leave roadmap content untouched
- place validation findings in docs/dev/reports

## Acceptance
- no roadmap text deletion
- no roadmap text rewrite
- any roadmap update is status-only unless explicit additive content is required by the PR
- bundle remains docs-only

3. Do not alter any existing lines in the file
4. Do not remove or compress content
5. Save file in place
6. Produce validation report confirming:
   - file length increased
   - no deletions occurred
