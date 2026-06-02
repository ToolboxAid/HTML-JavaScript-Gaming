# Tool Migration Wave 1 Scope

PR: PR_26152_121-tool-migration-wave-1-scope
Date: 2026-06-02

## Scope

- Defined Wave 1 migration scope.
- Identified exact tools in Wave 1.
- Defined expected ProjectWorkspace integration boundaries.
- No implementation.

## Wave 1 Tools

| Tool ID | Type | Expected ProjectWorkspace Boundary |
| --- | --- | --- |
| `state-inspector` | inspector | Read explicit ProjectWorkspace/toolState inputs; inspect state without owning or persisting ProjectWorkspace data. |
| `replay-visualizer` | viewer | Read explicit replay payload/toolState input; do not capture or require live runtime event streams. |
| `performance-profiler` | inspector | Read explicit profiling payload/toolState input; do not require live engine runtime UAT in migration PR. |
| `physics-sandbox` | utility | Read explicit physics config/toolState input; save only through Tool State boundary when scoped. |
| `3d-json-payload` | utility | Read explicit JSON payload/toolState input; reject hidden fallback/sample data. |
| `3d-asset-viewer` | viewer | Read explicit asset references/toolState input; remain read-only unless a later PR scopes editing. |

## Expected Validation Boundaries For Future Wave 1 PRs

- Validate migrated tool launch uses explicit ProjectWorkspace inputs.
- Validate manifest handoff consumes declared fields only.
- Validate Tool State is the saved editing source.
- Validate ProjectWorkspace does not persist payloads, fallback data, sample JSON, `localStorage`, or `sessionStorage`.
- Validate only the exact migrated tool or tools named in the PR.
- Keep unmigrated tools SKIP / not migrated / out of scope.

## Out Of Scope

- No tool runtime implementation in this PR.
- No samples.
- No tool runtime tests as blockers.
- No Wave 2 tool migration.
- No contract-only backlog activation.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report Wave 1 scoping only.

## Lanes Skipped

- runtime - no tool runtime code changed.
- tool runtime tests - not required and not run.
- samples - SKIP / pending rebuild.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. No samples were touched.

## Tools Decision

Wave 1 tools are scoped for future migration PRs only. They are SKIP / not migrated until those PRs implement and validate them.
