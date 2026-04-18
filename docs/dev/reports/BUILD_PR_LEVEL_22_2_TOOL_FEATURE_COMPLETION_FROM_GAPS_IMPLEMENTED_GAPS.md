# BUILD_PR_LEVEL_22_2_TOOL_FEATURE_COMPLETION_FROM_GAPS — Implemented Gaps

## Source Input
- `docs/dev/reports/tool_missing_functionality.md`

## Selected Top-Priority Gaps (Highest Impact)
1. `Tool Host` dispatch automation gap (Priority: High)
2. `Tools Index / Registry` validator reliability gap (Priority: High)

## Implemented Changes

### Gap 1 — Tool Host dispatch automation
- Added focused contract test:
  - `tests/tools/ToolHostDispatchContract.test.mjs`
- Test verifies:
  - host manifest mirrors visible active tools
  - `?tool=<id>` dispatch resolution path exists
  - invalid/empty `tool` query falls back to first manifest tool
  - URL sync behavior remains wired (`writeQueryToolId(...)`)
  - tools index continues generating host dispatch links
- Registered in test runner:
  - `tests/run-tests.mjs`

### Gap 2 — Validator reliability hardening (active contract + optional-doc handling)
- Updated validator script:
  - `scripts/validate-tool-registry.mjs`
  - hardens directory scope to product-tool surfaces
  - ignores known non-product tool infra directories (`Tool Host`, `codex`, `dev`, `preview`, `templates`, `shared`)
  - treats missing legacy/inactive tool paths as notes instead of hard failures
  - removes stale fixed active-name assumptions and relies on active visible registry contract
- Updated validator script:
  - `scripts/validate-active-tools-surface.mjs`
  - removes stale fixed active-name assumptions
  - derives active entrypoint validation dynamically from visible active registry
  - resolves sample/help paths correctly relative to `tools/`
  - converts historical docs checks to optional targets to prevent false hard-fail on removed docs

## Files Changed
- `scripts/validate-tool-registry.mjs`
- `scripts/validate-active-tools-surface.mjs`
- `tests/tools/ToolHostDispatchContract.test.mjs`
- `tests/run-tests.mjs`
- `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md`

## Scope Guard
- No engine changes
- No UI redesign
- No start_of_day changes
- Focused only on highest-impact missing-functionality gaps
