# Tool Migration Wave 2 Scope

PR: PR_26152_122-tool-migration-wave-2-scope
Date: 2026-06-02

## Scope

- Defined Wave 2 migration scope.
- Identified exact tools in Wave 2.
- Defined expected ProjectWorkspace integration boundaries.
- No implementation.

## Wave 2 Tools

| Tool ID | Type | Expected ProjectWorkspace Boundary |
| --- | --- | --- |
| `tile-map-editor` | editor | Open/save explicit map Tool State; preserve asset, tilemap, palette, and manifest ownership boundaries. |
| `parallax-editor` | editor | Open/save explicit parallax Tool State; preserve image/layer asset references without sample fallback. |
| `sprite-editor` | editor | Open/save explicit sprite Tool State; preserve palette and asset boundaries without ProjectWorkspace-owned payloads. |
| `asset-pipeline` | pipeline | Consume explicit asset/project inputs; produce declared outputs without hidden runtime, sample, installer, or storage assumptions. |
| `3d-camera-path-editor` | editor | Open/save explicit camera path Tool State; keep 3D payload ownership in Tool State or declared asset outputs. |

## Expected Validation Boundaries For Future Wave 2 PRs

- Validate migrated tool launch uses explicit ProjectWorkspace inputs.
- Validate manifest handoff consumes declared fields only.
- Validate Tool State owns saved payloads and ProjectWorkspace remains coordination-only.
- Validate palette and asset references are explicit.
- Validate lifecycle create/open/save/close/cancel/dirty-state boundaries when the tool edits payloads.
- Validate only the exact migrated tool or tools named in the PR.
- Keep unmigrated tools SKIP / not migrated / out of scope.

## Out Of Scope

- No tool runtime implementation in this PR.
- No samples.
- No tool runtime tests as blockers.
- No Wave 1 implementation.
- No contract-only backlog activation.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report Wave 2 scoping only.

## Lanes Skipped

- runtime - no tool runtime code changed.
- tool runtime tests - not required and not run.
- samples - SKIP / pending rebuild.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. No samples were touched.

## Tools Decision

Wave 2 tools are scoped for future migration PRs only. They are SKIP / not migrated until those PRs implement and validate them.
