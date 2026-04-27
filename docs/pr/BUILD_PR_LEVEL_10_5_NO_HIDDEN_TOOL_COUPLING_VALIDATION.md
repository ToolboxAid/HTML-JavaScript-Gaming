# BUILD_PR_LEVEL_10_5_NO_HIDDEN_TOOL_COUPLING_VALIDATION

## Hard Rules

### Forbidden Forever
Do not allow:

```js
if (!input) loadDefaultSample()
```

Do not allow:

```js
fetch('/assets/vectors/demo.json')
fetch('/samples/...')
fetch('/tools/.../samples/...')
```

Do not allow silent fallback data of any kind.

## Correct Tool Behavior

### With Manifest Input
```text
tool(manifestSlice) -> render/edit manifest data
```

### Without Manifest Input
```text
tool(null) -> safe empty state
```

The tool may show:
- "No asset loaded"
- "Open from Workspace Manager"
- "Create new"
- empty canvas/grid/list

But it must not load:
- hidden sample data
- demo data
- fallback JSON
- hardcoded asset paths

## Required Audit

Scan all tools for:
- `loadDefault`
- `defaultSample`
- `sample`
- `demo.json`
- `fetch(`
- `.json`
- `/assets/`
- `/samples/`
- `/tools/shared/samples`
- hardcoded game asset paths

## Required Test

Add/extend tests so each active first-class tool is checked:

1. Open tool without input.
2. Confirm no hidden data appears.
3. Confirm no fetch to sample/demo JSON happens.
4. Confirm safe empty state.
5. Open tool with manifest slice where test fixture exists.
6. Confirm manifest data renders.

## Required Reports
Create:

```text
docs/dev/reports/level_10_5_no_hidden_tool_coupling_report.md
docs/dev/reports/level_10_5_hardcoded_asset_path_audit.md
```

## Acceptance
- silent fallback loaders found = 0
- hardcoded JSON asset fetches found = 0, excluding approved manifest file load
- tool-local sample/demo fallback = 0
- tools show empty state without input
- tools render manifest slice with input
- no validators added
- no start_of_day changes
