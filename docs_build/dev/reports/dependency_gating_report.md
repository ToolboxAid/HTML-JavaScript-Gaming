# Dependency Gating Report

Generated: 2026-06-05T00:46:38.338Z
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
| build-path | No | SKIP | none | Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation | Lane was not selected, so dependency-gated runtime scheduling skipped it. |
| tools-progress | Yes | PASS | none | Admin Tools Progress hydration, Toolbox Group view color model, and Project Build Path separation | Lane has no lane dependencies and is eligible after preflight and compilation pass. |
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
