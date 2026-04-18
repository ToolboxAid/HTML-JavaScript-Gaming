# Asset Pipeline Tool Testing Guide

## Tool
- id: `asset-pipeline-tool`
- entry point: `tools/Asset Pipeline Tool/index.html`

## Purpose Of Testing
Load/validate/normalize/emit pipeline validation workflows.

## Prerequisites
- Tool dependencies are installed (`npm install`).
- Tool launcher is available from `tools/index.html`.
- Browser devtools are available for console/network inspection.

## Setup Steps
1. Open `tools/index.html` and launch `Asset Pipeline Tool`.
2. Confirm initial UI shell renders with no blocking error screen.
3. Reset to default/new document state before executing cases.

## Smoke Tests
1. Launch the tool directly via `tools/Asset Pipeline Tool/index.html` and verify first paint in under expected local baseline.
2. Confirm primary panes/controls render and are interactive.
3. Confirm no uncaught exceptions in the browser console during idle for 10 seconds.

## Core Workflow Tests
1. Open/load workflow: load default/sample input and verify expected data appears in the tool surface.
2. Create/edit workflow: create a new item (or edit existing item) and verify UI/model state updates immediately.
3. Save/export workflow: Execute save/export flow and confirm generated artifact metadata/content is valid and reopenable.
4. Integration handoff: Pipeline output artifacts are accepted by consuming tools/runtime workflows.

## Edge Case Tests
1. Invalid input handling: provide malformed/unsupported input and verify clear non-crashing error feedback.
2. Large payload handling: load a larger-than-normal dataset and verify tool remains responsive.
3. Empty state behavior: clear/reset document and verify stable empty-state controls and messaging.

## Regression Checks
1. Re-open the tool and verify previous stable baseline behavior still holds for launch + basic edit flow.
2. Verify keyboard and pointer interactions used by the core flow still function after multiple edits.
3. Verify no layout breakage at narrow and wide viewport widths.

## Manual Test Cases
- TC-01 Launch/Boot: tool launches from registry and direct URL without blocking errors.
- TC-02 Open/Load: valid sample/data source loads and renders expected structure.
- TC-03 Create/Edit: create or modify content and verify deterministic state update.
- TC-04 Save/Export Applicability: execute export path or verify non-applicable behavior is explicit and stable.
- TC-05 Invalid Input/Error Handling: invalid input produces safe handled error feedback.
- TC-06 UI Persistence/State Restoration: refresh/reopen behavior restores expected state (or explicit default reset behavior).
- TC-07 Integration Handoff: output/read model aligns with downstream tool/runtime consumer contract.

## Known Limitations / Non-Goals
- This document defines manual validation only; it does not add automated coverage in this PR.
- Performance tuning and UX redesign are out of scope for this lane.

## Expected Validation Artifacts
- Completed validation report using `docs/dev/reports/tool_validation_report_template.md`.
- Console screenshot/log snippet for pass/fail evidence when relevant.
- Artifact path references (exports, sample files, or payload snapshots) used during validation.
