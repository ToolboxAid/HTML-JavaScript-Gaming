# Sample Schema Target Plan

PR: PR_26152_145-sample-schema-target-plan
Date: 2026-06-02

## Scope

- Defined target sample schema alignment plan.
- Documented required manifest/tool payload boundaries.
- Documented ProjectWorkspace handoff expectations for rebuilt samples.
- Did not modify sample JSON.

## Target Direction

Rebuilt samples should move from standalone sample payload files toward explicit game/sample manifests plus Tool State payload records that can be handed to ProjectWorkspace without hidden runtime state.

## Schema Alignment Plan

| Target | Status | Plan |
| --- | --- | --- |
| Game/sample manifest | PLANNED | Use the current game manifest contract direction for sample ownership, launch target, tool references, and asset references. |
| ProjectWorkspace handoff | PLANNED | ProjectWorkspace remains runtime coordination only; rebuilt samples provide explicit manifest input and explicit Tool State input. |
| Tool payloads | PLANNED | Tool payloads must match the active per-tool schemas under `tools/schemas/tools/` or an approved future schema update. |
| Palette data | PLANNED | Palette payloads must be project-owned or tool-state-linked; standalone palette JSON should not imply hidden global state. |
| Asset references | PLANNED | Use file/path fields such as image names, asset paths, and manifest asset IDs. Do not persist `imageDataUrl`. |
| Workspace manifest sample | PLANNED | Resolve the missing `tools/schemas/workspace.manifest.schema.json` reference before making workspace-style samples active validation targets. |

## Required Boundaries

| Boundary | Rule |
| --- | --- |
| Manifest ownership | Manifest/sample manifest owns portable sample launch and asset/tool references. |
| Tool State ownership | Saved tool payload belongs to Tool State, not ProjectWorkspace. |
| ProjectWorkspace ownership | ProjectWorkspace tracks active project/tool/toolState IDs, dirty state, recovery availability, active palette context, and flow state only. |
| Runtime state | Runtime UI state, render state, localStorage, sessionStorage, fallback data, and sample bootstrap data must not be persisted as sample source of truth. |
| Tool payload schema | Rebuilt payloads must use current tool schema names and fields, or document a required schema update before rebuild. |
| Legacy tool IDs | Legacy IDs must map to current first-class tools or be explicitly retired/skipped. |

## ProjectWorkspace Handoff Expectations

- Rebuilt sample launch uses explicit `manifestInput`.
- Rebuilt sample launch uses explicit `toolStateInput`.
- Rebuilt sample launch names the selected tool ID.
- Rebuilt sample launch rejects invalid manifest/toolState input before downstream runtime use.
- Rebuilt sample payloads are not auto-loaded from hidden fallback data.
- Rebuilt sample recovery behavior points to Tool State recovery, not workspace-owned saved data.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report schema target planning only.

## Lanes Skipped

- samples - SKIP / pending rebuild; sample launch validation was not run.
- runtime - no runtime behavior changed.
- integration - no feature integration changed.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. No sample JSON was modified.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blockers for docs-only schema target planning. Schema implementation and sample rebuild execution remain future work.
