# PLAN_PR_26124_020-workspace-tools-reengineering-design-docs

## Objective
- Produce detailed reengineering design docs for Workspace V2 and all current tools so implementation work can follow one explicit contract and avoid drift.

## Scope
- `docs/design/workspace-v2/WORKSPACE_V2_REENGINEERING_DESIGN.md`
- `docs/design/tools/TOOLS_REENGINEERING_INDEX.md`
- `docs/design/tools/<tool-id>/REENGINEERING_DESIGN.md` for all current tools in registry + Workspace V2 lane.
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Non-Scope
- Runtime code changes.
- Schema changes.
- Sample JSON changes.
- Playwright/test behavior changes.

## Execution Plan
1. Read current source-of-truth inputs:
   - Workspace V2 runtime (`tools/workspace-v2/index.html`, `tools/workspace-v2/index.js`)
   - Active tool registry (`tools/toolRegistry.js`)
   - Workspace schema contract (`tools/schemas/workspace.manifest.schema.json`)
   - V2 tool fixtures (`tests/fixtures/v2-tools/*`)
   - Current Playwright coverage (`tests/playwright/workspace-v2.validation.spec.js`, `tests/playwright/tool-validation/workspace-v2.tool-validation.spec.js`)
2. Build tool inventory (IDs, entry points, schema refs, key runtime surfaces).
3. Author Workspace V2 reengineering design document.
4. Author per-tool reengineering design documents.
5. Author tools index/classification document.
6. Generate review artifacts (`codex_review.diff`, `codex_changed_files.txt`).
7. Package repo-structured delta ZIP.

## Validation Plan
- Documentation-only PR: no runtime validation commands required.
- Confirm all required design docs exist and are populated from current repo state.
