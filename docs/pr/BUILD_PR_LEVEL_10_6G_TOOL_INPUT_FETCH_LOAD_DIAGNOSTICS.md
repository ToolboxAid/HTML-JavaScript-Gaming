# BUILD_PR_LEVEL_10_6G_TOOL_INPUT_FETCH_LOAD_DIAGNOSTICS

## Purpose
Add temporary diagnostics so every sample-loaded tool reports what it received, what it fetched, and what it loaded.

## Scope
- Apply to tools launched from `samples/**` manifests.
- Focus on sample data-flow diagnostics only.
- Do not normalize palette data in this PR.
- Do not introduce fallback data.
- Do not hardcode sample paths.
- Do not modify `start_of_day` folders.

## Required behavior
Codex must add consistent debug logging at the tool boundary for each active tool loader path.

Each tool launch/load must log:

1. request received
   - tool id/name
   - sample path or manifest path provided by caller
   - requested config/data path if present
   - URL query params or request payload used to launch the tool

2. fetch attempted
   - each URL/path attempted
   - whether the path came from manifest, schema-normalized input, or tool input
   - HTTP status or fetch error

3. load completed
   - tool id/name
   - loaded data type/shape summary
   - top-level keys loaded
   - for palette-capable tools: whether palette was present, where it came from, swatch count
   - for sprite/editor tools: whether sprite data was present, where it came from, frame/count summary when cheap to compute
   - for replay/event tools: whether events array exists and event count

## Logging format
Use stable, searchable console prefixes:

- `[tool-load:request]`
- `[tool-load:fetch]`
- `[tool-load:loaded]`
- `[tool-load:warning]`

Use one structured object per log call. Do not stringify large payloads. Summarize only.

## Files to inspect first
Codex must inspect and identify the actual active loader files before editing. Likely candidates include, but are not limited to:

- `tools/**/spriteEditorApp.js`
- `tools/**/*.js`
- `samples/**/*.html`
- shared sample/tool launch helpers under `src/**` or `tools/**`

Do not repo-wide refactor. Locate the common tool/sample load path and add the smallest diagnostic hook possible. If there is no common hook, add equivalent minimal logging to each active tool loader touched by sample standalone data-flow tests.

## Acceptance checks
Run:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

Then manually launch at least:

```text
samples/phase-02/0219
```

Open the tool from the sample and verify the browser console shows:

```text
[tool-load:request]
[tool-load:fetch]
[tool-load:loaded]
```

For the current issue, the log must make it obvious whether palette was:

- requested and fetched
- requested but fetch failed
- never requested
- loaded from the wrong wrapper
- absent from normalized tool input

## Report
Write findings to:

```text
docs/dev/reports/level_10_6G_tool_input_fetch_load_diagnostics_report.md
```

Report must include:

- files changed
- exact logging prefixes added
- test command results
- sample 0219 observed diagnostics summary
- whether palette fetch/load is now visible in logs
- any remaining blocker for palette SSoT normalization

## Roadmap
Update only status markers in:

```text
docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md
```

Do not rewrite or delete roadmap content.
