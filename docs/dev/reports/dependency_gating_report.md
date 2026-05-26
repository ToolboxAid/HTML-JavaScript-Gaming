# Dependency Gating Report

Generated: 2026-05-26T19:30:40.928Z
Status: PASS

## Gate Order

1. Zero-browser preflight must pass.
2. Lane compilation must pass.
3. Deterministic lane dependency validation must pass.
4. Only dependency-eligible targeted lanes may be scheduled.

## Lane Dependency Graph

| Lane | Selected | Status | Dependencies | Affected Surface | Reason |
| --- | --- | --- | --- | --- | --- |
| workspace-contract | No | SKIP | none | Workspace Manager V2 contract and lifecycle behavior | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| tool-runtime | Yes | PASS | none | First-class tool runtime behavior | Lane has no lane dependencies and is eligible after preflight and compilation pass. |
| integration | Yes | PASS | none | Workspace, tool, game index, and manifest handoff behavior | Lane has no lane dependencies and is eligible after preflight and compilation pass. |
| engine-src | No | SKIP | none | src/ engine and shared runtime capability behavior | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| samples | No | SKIP | none | Affected samples lane, on request only | Lane was not selected, so dependency-gated runtime scheduling skipped it. |

## Dependency Failures Caught Pre-Runtime

No deterministic dependency failures were found before runtime.

## Enforcement Notes

- Invalid dependency graphs block runtime before Playwright startup.
- Dependency failures do not trigger fallback reruns or unrelated lane execution.
- Workspace V2 is scheduled only when the workspace-contract lane is explicitly selected.
- Samples remain on-request only and are not implicit dependency gates.
