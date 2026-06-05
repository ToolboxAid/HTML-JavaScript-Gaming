# Dependency Gating Report

Generated: 2026-06-05T20:51:42.764Z
Status: PASS

## Gate Order

1. Zero-browser preflight must pass.
2. Lane compilation must pass.
3. Deterministic lane dependency validation must pass.
4. Only dependency-eligible targeted lanes may be scheduled.

## Lane Dependency Graph

| Lane | Selected | Status | Dependencies | Affected Surface | Reason |
| --- | --- | --- | --- | --- | --- |
| workspace-contract | No | SKIP | none | Root tools future-state navigation and Tool Template V2 contract | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| project-workspace | No | SKIP | none | Project Workspace mock repository, Project Workspace UI, and Toolbox Progress/Build Path project-state bridge | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| game-design | No | SKIP | none | Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| game-configuration | No | SKIP | none | Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| asset-tool | No | SKIP | none | Asset Tool mock repository, Game Configuration readiness handoff, library records, import preview, and visible failure handling | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| build-path | No | SKIP | none | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| tools-progress | No | SKIP | none | Admin Tools Progress hydration, Toolbox Group view color model, and Project Build Path separation | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| tool-navigation | No | SKIP | none | Admin Tools Progress tool route links, Tool Display Mode build-order previous/next controls, and Toolbox group fallback routing | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| tool-display-mode | No | SKIP | none | Tool Display Mode identity row, registry-owned previous/next links, disabled text fallback, and multi-path group routing | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| tool-images | No | SKIP | none | Toolbox registry image contract, Toolbox card image rendering, and Tool Display Mode image fallback | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| tool-runtime | No | SKIP | none | Active public toolbox and Tool Template V2 contract | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| game-runtime | No | SKIP | none | Deprecated archive/v1-v2/games reference coverage | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| integration | No | SKIP | none | Integration handoff behavior | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| engine-src | No | SKIP | none | src/ engine and shared runtime capability behavior | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| samples | No | SKIP | none | Deprecated archive/v1-v2/samples reference coverage | Lane was not selected, so dependency-gated runtime scheduling skipped it. |

## Dependency Failures Caught Pre-Runtime

No deterministic dependency failures were found before runtime.

## Enforcement Notes

- Invalid dependency graphs block runtime before Playwright startup.
- Dependency failures do not trigger fallback reruns or unrelated lane execution.
- Workspace V2 is scheduled only when the workspace-contract lane is explicitly selected.
- Samples remain on-request only and are not implicit dependency gates.
